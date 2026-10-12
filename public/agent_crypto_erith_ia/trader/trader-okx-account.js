/* Agent-Crypto Trader · Compte OKX réel · READ ONLY via Aether Trust / Bridge 8787. */
(()=>{
"use strict";
const PANEL_ID="traderOkxAccountPanel";
const STYLE_ID="traderOkxAccountStyle";
const TOKEN_KEY="agent_crypto_bridge_owner_token_v1";
const ROLE_KEY="agent_crypto_local_access_session_v1";
const BRIDGE="http://127.0.0.1:8787";
const AUTO_REFRESH_MS=60000;
const LEDGER_REFRESH_MS=300000;
let timer=0;
let inflight=null;
let ledgerInFlight=null;
let ledgerCheckedAt=0;
let ledgerPosition=null;
let currentBtcHeld=NaN;
let lastSpotExecutions=0;

const panel=()=>document.getElementById(PANEL_ID);
const q=(name)=>panel()?.querySelector(`[data-okx-${name}]`)||null;
const text=(name,value)=>{const el=q(name);if(el)el.textContent=String(value??"—");};
const token=()=>{try{return sessionStorage.getItem(TOKEN_KEY)||"";}catch(_){return"";}};
const owner=()=>{try{return sessionStorage.getItem(ROLE_KEY)==="owner";}catch(_){return false;}};
const saveToken=value=>{try{if(value)sessionStorage.setItem(TOKEN_KEY,value);else sessionStorage.removeItem(TOKEN_KEY);}catch(_){}};
const fmt=value=>{const n=Number(value);if(!Number.isFinite(n))return"—";const digits=Math.abs(n)>0&&Math.abs(n)<1?16:8;return n.toLocaleString("fr-FR",{maximumFractionDigits:digits});};
const shortError=error=>String(error?.message||error||"Erreur inconnue").replace(/\s+/g," ").slice(0,180);

async function bridge(path,{method="GET",body=null,auth=true,keepalive=false}={}){
  const headers={Accept:"application/json"};
  const t=token();
  if(auth){if(!t)throw Object.assign(new Error("Aether Trust Bridge requis"),{status:401});headers.Authorization=`Bearer ${t}`;}
  if(body!==null)headers["Content-Type"]="application/json";
  const response=await fetch(BRIDGE+path,{method,headers,body:body===null?undefined:JSON.stringify(body),cache:"no-store",keepalive});
  let data=null;try{data=await response.json();}catch(_){}
  if(!response.ok){const err=new Error(data?.error||`Bridge HTTP ${response.status}`);err.status=response.status;throw err;}
  return data||{};
}

async function login(secret,{silent=false}={}){
  const clean=String(secret||"");
  if(clean.length<6)throw new Error("Mot de passe Aether Trust requis");
  const response=await bridge("/auth/login",{method:"POST",body:{secret:clean},auth:false});
  if(!response?.token)throw new Error("Le Bridge n'a pas retourné de session Aether Trust");
  saveToken(String(response.token));
  try{sessionStorage.setItem(ROLE_KEY,"owner");}catch(_){}
  window.dispatchEvent(new CustomEvent("agent-crypto:bridge-owner-session",{detail:{source:"trader-okx-account",bridge_version:response.bridge_version||null}}));
  if(!silent)await refresh({force:true});
  return response;
}

function tradingRows(account){
  return (Array.isArray(account?.trading)?account.trading:[]).flatMap(row=>Array.isArray(row?.details)?row.details:[]);
}
function fundingRows(account){return Array.isArray(account?.funding)?account.funding:[];}
function asset(account,ccy){
  const code=String(ccy||"").toUpperCase();
  const tr=tradingRows(account).find(row=>String(row?.ccy||"").toUpperCase()===code)||null;
  const fu=fundingRows(account).find(row=>String(row?.ccy||"").toUpperCase()===code)||null;
  const trTotal=Number(tr?.cashBal??tr?.eq),trAvail=Number(tr?.availBal),trFrozen=Number(tr?.frozenBal);
  const fuTotal=Number(fu?.bal),fuAvail=Number(fu?.availBal),fuFrozen=Number(fu?.frozenBal);
  const trEqUsd=Number(tr?.eqUsd);
  const present=Boolean(tr||fu);
  const sum=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)?a+b:Number.isFinite(a)?a:Number.isFinite(b)?b:NaN;
  return {present,total:sum(trTotal,fuTotal),available:sum(trAvail,fuAvail),frozen:sum(trFrozen,fuFrozen),trading:Number.isFinite(trTotal)?trTotal:NaN,funding:Number.isFinite(fuTotal)?fuTotal:NaN,eqUsd:Number.isFinite(trEqUsd)?trEqUsd:NaN};
}
function feeLabel(payload){
  const row=Array.isArray(payload?.fees)?payload.fees[0]:null;
  if(!row)return"—";
  const maker=row.maker??row.makerU??row.makerUSDC,taker=row.taker??row.takerU??row.takerUSDC;
  if(maker==null&&taker==null)return"OK";
  const pct=v=>Number.isFinite(Number(v))?(Number(v)*100).toLocaleString("fr-FR",{maximumFractionDigits:4})+" %":"—";
  return `Maker ${pct(maker)}\nTaker ${pct(taker)}`;
}
function paintAsset(code,data){
  text(code.toLowerCase(),data.present?`${fmt(data.total)} ${code}`:"—");
  text(code.toLowerCase()+"detail",data.present?`Trading ${fmt(data.trading)} · Funding ${fmt(data.funding)} · disponible ${fmt(data.available)}`:"Non retourné par OKX");
}
function setState(state,message){
  const p=panel();if(!p)return;
  p.dataset.state=state;
  text("state",message);
}
function showAuth(show,message="Session Aether Trust Bridge requise"){
  const auth=q("auth");if(auth)auth.hidden=!show;
  if(show)text("authstatus",message);
}

/* Le coût et la performance sont qualifiés séparément. Une écriture OKX n'est pas une facture PayPal. */
function updatePositionView(){
  const position=ledgerPosition;
  if(position?.matched){
    const sameHolding=Number.isFinite(currentBtcHeld)&&Math.abs(currentBtcHeld-position.matched.btc)<Math.max(1e-12,position.matched.btc*1e-7);
    if(sameHolding){
      const euro=v=>v.toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2});
      text("avgcost",euro(position.matched.eur/position.matched.btc)+" €/BTC");
      text("committed",euro(position.matched.eur)+" € rapprochés");
      text("pnl","CHANGE USD/EUR À VÉRIFIER");
      text("positionproof","Les écritures du 5 octobre correspondent au BTC détenu. Taux et dépense indicatifs ; justificatif d'achat et conversion USD/EUR nécessaires pour un gain vérifié.");
      text("avgcosthint","Taux déduit des écritures OKX, non prix moyen certifié");
      text("committedhint","Montant du mouvement, paiement externe à confirmer");
      text("pnlhint","Valeur actuelle en USD ; dépense en EUR");
      return;
    }
    text("positionproof","Mouvement EUR/BTC retrouvé, mais quantité BTC détenue différente. Coût de la position totale non établi.");
  }else if(position?.recordsCount>0){
    text("positionproof",position.recordsCount+" mouvements financiers retrouvés, mais acquisition complète non démontrée.");
  }else{
    text("positionproof",lastSpotExecutions
      ?lastSpotExecutions+" exécutions Spot récentes ; acquisition totale non démontrée."
      :"0 exécution Spot sur 3 mois ; l'achat en euros relève d'un historique financier distinct.");
  }
  text("avgcost","NON PROUVÉ");
  text("committed","NON PROUVÉ");
  text("pnl","À VÉRIFIER");
  text("avgcosthint","Historique d'acquisition à rapprocher");
  text("committedhint","Achats + frais prouvés");
  text("pnlhint","Valeur actuelle et montant investi doivent être dans la même devise");
}

function paintData(account,orders,fills,fees){
  const btc=asset(account,"BTC"),usdc=asset(account,"USDC"),eur=asset(account,"EUR");
  const fillRows=Array.isArray(fills?.fills_3m)?fills.fills_3m:[];
  paintAsset("BTC",btc);
  paintAsset("USDC",usdc);
  paintAsset("EUR",eur);
  currentBtcHeld=btc.present?btc.total:NaN;
  lastSpotExecutions=fillRows.length;
  text("positionvalue",Number.isFinite(btc.eqUsd)?btc.eqUsd.toLocaleString("fr-FR",{style:"currency",currency:"USD",maximumFractionDigits:2}):"—");
  updatePositionView();
  text("pending",Array.isArray(orders?.pending)?orders.pending.length:0);
  text("history",Array.isArray(orders?.history_3m)?orders.history_3m.length:0);
  text("fills",fillRows.length);
  text("fees",feeLabel(fees));
  text("bridge",`Bridge ${account?.bridge_version||orders?.bridge_version||"—"} · ${account?.site||"OKX"} · LECTURE SEULE`);
  const date=new Date(account?.fetched_at||Date.now());
  text("updated",Number.isFinite(date.getTime())?date.toLocaleString("fr-FR"):"à l'instant");
  setState("ready","COMPTE OKX RÉEL · CONNECTÉ");
  showAuth(false);
}


/* Les journaux OKX sont lus à la demande et restent en mémoire vive uniquement.
   Ils prouvent des mouvements, jamais automatiquement le coût d'un achat PayPal. */
function ledgerClear(message){
  ledgerCheckedAt=0;
  ledgerPosition=null;
  updatePositionView();
  text("ledgerstatus",message);
  const entries=q("ledgerentries");
  if(entries)entries.replaceChildren();
  const references=q("ledgerreferences");if(references)references.replaceChildren();
  text("ledgercoverage","—");
  text("ledgerwarning","");
  text("ledgerdetailcount","Afficher les mouvements détaillés");
  const summary=q("ledgersummary");if(summary)summary.hidden=true;
}
function ledgerDate(row){
  const raw=Number(row?.ts??row?.cTime??row?.uTime);
  if(!Number.isFinite(raw)||raw<=0)return "date inconnue";
  const when=new Date(raw<1e11?raw*1000:raw);
  return Number.isFinite(when.getTime())?when.toLocaleString("fr-FR"):"date inconnue";
}
function ledgerMovement(row,ccy,sourceLabel){
  const raw=String(row?.balChg??row?.sz??row?.amt??"").trim();
  const valid=/^[+-]?\d+(?:\.\d+)?$/.test(raw)&&Number.isFinite(Number(raw));
  const amount=valid?Number(raw):NaN;
  const unsigned=raw.replace(/^[+-]/,"");
  const [integer,decimal]=unsigned.split(".");
  const value=!valid?"montant non disponible":ccy==="EUR"?Math.abs(amount).toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2}):integer.replace(/\B(?=(\d{3})+(?!\d))/g," ")+(decimal!==undefined?","+decimal:"");
  const direction=!valid?"Variation indisponible":amount>0?"Entrée sur le compte":amount<0?"Sortie du compte":"Aucune variation";
  const sign=valid&&amount>0?"+":valid&&amount<0?"−":"";
  const type=String(row?.type??"").slice(0,12);
  const subType=String(row?.subType??"").slice(0,12);
  return {
    timestamp:Number(row?.ts??row?.cTime??row?.uTime)||0,
    balanceChange:amount,
    originalAmount:raw,
    type,subType,
    date:ledgerDate(row),
    source:sourceLabel==="Trading"?"Compte de trading":"Compte de financement",
    currency:ccy,
    direction,
    amount:valid?sign+value+" "+ccy:"Montant indisponible",
    sign:amount>0?"credit":amount<0?"debit":"neutral",
    reference:[type,subType].filter(Boolean).join("/")
  };
}
function ledgerPaint(results){
  const list=q("ledgerentries");
  const references=q("ledgerreferences");
  if(list)list.replaceChildren();
  if(references)references.replaceChildren();
  const issues=[];
  const totals=[];
  const recent=[];
  let success=0,recordsCount=0,hasMore=false;
  for(const ccy of ["BTC","EUR"]){
    const item=results[ccy];
    if(!item?.ok){
      issues.push(ccy+" : "+(item?.status===404?"Bridge ancien : route financière absente":item?.status===403?"accès Aether Trust requis":item?.status===401?"session expirée":"lecture indisponible"));
      continue;
    }
    const payload=item.payload;
    if(payload?.ccy!==ccy||payload?.read_only!==true||!payload?.sources){
      issues.push(ccy+" : réponse financière inattendue");continue;
    }
    for(const [key,label] of [["trading_account","Trading"],["funding_account","Financement"]]){
      const stream=payload.sources[key];
      if(!stream||!Array.isArray(stream.records)){
        issues.push(label+" "+ccy+" : format indisponible");continue;
      }
      const state=String(stream.state||"unavailable");
      const count=stream.records.length;
      if(state==="ok")success++;else issues.push(label+" "+ccy+" : "+(state==="partial"?"lecture partielle":"source indisponible"));
      recordsCount+=count;
      hasMore=hasMore||Boolean(stream.has_more);
      totals.push(label+" "+ccy+" : "+count+" mouvement"+(count!==1?"s":"")+(stream.has_more?" (suite possible)":""));
      for(const row of stream.records){
        if(row&&typeof row==="object")recent.push(ledgerMovement(row,ccy,label));
      }
    }
  }
  recent.sort((a,b)=>b.timestamp-a.timestamp);
  text("ledgerdetailcount","Afficher les "+recordsCount+" mouvements détaillés");
  /* Association prudente de deux écritures OKX : sortie EUR 30/321 et entrée BTC 30/320.
     Une paire de mouvements ne certifie ni le mode de paiement externe, ni tout le coût historique. */
  const credits=recent.filter(x=>x.source==="Compte de trading"&&x.currency==="BTC"&&x.type==="30"&&x.subType==="320"&&Number.isFinite(x.balanceChange)&&x.balanceChange>0);
  const debits=recent.filter(x=>x.source==="Compte de trading"&&x.currency==="EUR"&&x.type==="30"&&x.subType==="321"&&Number.isFinite(x.balanceChange)&&x.balanceChange<0);
  const matches=credits.flatMap(btc=>debits.filter(eur=>Math.abs(btc.timestamp-eur.timestamp)<=120000).map(eur=>({btc,eur})));
  const summary=q("ledgersummary");
  if(summary)summary.hidden=matches.length!==1||credits.length!==1||debits.length!==1;
  ledgerPosition={recordsCount,matched:null};
  if(matches.length===1&&credits.length===1&&debits.length===1&&!issues.length&&!hasMore){
    ledgerPosition.matched={btc:matches[0].btc.balanceChange,eur:Math.abs(matches[0].eur.balanceChange)};
  }
  if(summary&&!summary.hidden){
    const {btc,eur}=matches[0];
    const eurPaid=Math.abs(eur.balanceChange);
    const euro=v=>v.toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2});
    text("ledgersummarydate",btc.date.split(" ")[0]);
    text("ledgersummaryeur",euro(eurPaid)+" € sortis");
    text("ledgersummarybtc",fmt(btc.balanceChange)+" BTC reçus");
    text("ledgersummaryrate",euro(eurPaid/btc.balanceChange)+" €/BTC");
  }
  if(list){
    for(const entry of recent.slice(0,20)){
      const li=document.createElement("li");
      li.className="okx-ledger-item";
      const meta=document.createElement("div");
      meta.className="okx-ledger-meta";
      const source=document.createElement("strong");
      source.textContent=entry.source;
      const date=document.createElement("span");
      date.textContent=entry.date;
      meta.append(source,date);
      const direction=document.createElement("div");
      direction.className="okx-ledger-direction";
      direction.textContent=entry.direction;
      const amount=document.createElement("strong");
      amount.className="okx-ledger-amount okx-ledger-"+entry.sign;
      amount.textContent=entry.amount;
      li.append(meta,direction,amount);
      list.appendChild(li);
      if(references){
        const technical=document.createElement("li");
        technical.textContent=entry.date+" · "+entry.source+" · "+entry.currency+" · montant exact "+(entry.originalAmount||"non fourni")+" · type/sous-type "+(entry.reference||"non fournis");
        references.appendChild(technical);
      }
    }
    if(!recent.length){
      const li=document.createElement("li");
      li.className="okx-ledger-empty";
      li.textContent=success?"Aucun mouvement renvoyé sur les périodes accessibles.":"Aucune écriture vérifiable retournée.";
      list.appendChild(li);
    }
  }
  text("ledgerstatus",recordsCount?recordsCount+" mouvements financiers retrouvés":"Aucun mouvement financier retrouvé");
  const technicalStatus=totals.concat(issues.length?["À vérifier : "+issues.join(" ; ")]:[],hasMore?["D'autres pages d'historique peuvent exister."]:[]);
  text("ledgercoverage",technicalStatus.join(" · ")||"Aucune source disponible.");
  text("ledgerwarning",issues.length?"Attention : certaines sources ne sont pas disponibles ; les résultats peuvent être incomplets.":hasMore?"Attention : d'autres mouvements peuvent exister dans l'historique.":"Ces écritures incluent éventuellement des transferts entre comptes : elles ne représentent pas nécessairement des achats distincts.");
  updatePositionView();
}

async function refreshLedger(force=false){
  if(ledgerInFlight)return ledgerInFlight;
  if(!token()){ledgerClear("Authentification Aether Trust nécessaire.");return false;}
  if(!force&&Date.now()-ledgerCheckedAt<LEDGER_REFRESH_MS)return true;
  text("ledgerstatus","Lecture des journaux financiers BTC puis EUR…");
  ledgerInFlight=(async()=>{
    const result={};
    for(const ccy of ["BTC","EUR"]){
      try{
        const payload=await bridge("/okx/ledger?ccy="+ccy+"&pages=1");
        result[ccy]={ok:true,payload};
      }catch(error){
        result[ccy]={ok:false,status:Number(error?.status)||0};
        if(error?.status===401)break;
      }
    }
    if(token())ledgerPaint(result);
    else ledgerClear("Session Aether Trust terminée.");
    ledgerCheckedAt=Date.now();
    return true;
  })().catch(()=>{
    text("ledgerstatus","Lecture financière impossible ; les soldes précédents restent disponibles.");
    ledgerCheckedAt=Date.now();
    return false;
  }).finally(()=>{ledgerInFlight=null;});
  return ledgerInFlight;
}

async function refresh({force=false}={}){
  if(inflight&&!force)return inflight;
  const t=token();
  if(!t){
    setState("locked",owner()?"AETHER TRUST ACTIF · SESSION BRIDGE À LIER":"AETHER TRUST REQUIS");
    showAuth(true,owner()?"Entre une fois le mot de passe Aether Trust pour lier cette session navigateur au Bridge.":"Authentifie Aether Trust pour lire le compte OKX réel.");
    return false;
  }
  setState("loading","LECTURE OKX RÉELLE…");
  showAuth(false);
  inflight=(async()=>{
    try{
      await bridge("/auth/status");
      const [account,orders,fills,fees]=await Promise.all([
        bridge("/okx/account"),bridge("/okx/orders"),bridge("/okx/fills"),bridge("/okx/fees?instId=BTC-USDC")
      ]);
      paintData(account,orders,fills,fees);
      void refreshLedger(force);
      return true;
    }catch(error){
      if(error?.status===401){saveToken("");ledgerClear("Session Aether Trust expirée.");setState("locked","SESSION BRIDGE À RÉAUTHENTIFIER");showAuth(true,"La session Bridge n'est plus valide. Entre le mot de passe Aether Trust.");}
      else{setState("error","OKX / BRIDGE INDISPONIBLE");text("updated",shortError(error));}
      return false;
    }finally{inflight=null;}
  })();
  return inflight;
}

async function submitInlineAuth(event){
  event.preventDefault();
  const input=q("secret"),button=q("connect");
  const secret=String(input?.value||"");
  if(button)button.disabled=true;
  text("authstatus","Connexion Aether Trust au Bridge…");
  try{await login(secret);if(input)input.value="";}
  catch(error){text("authstatus",shortError(error));}
  finally{if(button)button.disabled=false;}
}

function bindCanonicalTrust(){
  const form=document.getElementById("atlasAccessForm"),input=document.getElementById("atlasAccessSecret");
  if(!form||!input||form.dataset.okxBridgeSessionBound==="1")return false;
  form.dataset.okxBridgeSessionBound="1";
  form.addEventListener("submit",()=>{
    const secret=String(input.value||"");
    if(secret.length<6)return;
    void login(secret,{silent:true}).then(()=>refresh({force:true})).catch(()=>{});
  },true);
  return true;
}

function logoutBridge(){
  const t=token();
  if(!t){saveToken("");return;}
  fetch(BRIDGE+"/auth/logout",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json",Authorization:`Bearer ${t}`},body:"{}",cache:"no-store",keepalive:true}).catch(()=>{});
  saveToken("");
  ledgerClear("Session terminée : journaux financiers masqués.");
  setState("locked","AETHER TRUST REQUIS");
}

function mount(){
  if(panel())return true;
  const zone=document.getElementById("market-zone");if(!zone)return false;
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement("style");style.id=STYLE_ID;style.textContent=[
      "#traderOkxAccountPanel{grid-column:1/-1;display:block;box-sizing:border-box;width:99%;margin:14px auto 0;color:#d7eff0;background:linear-gradient(180deg,rgba(7,29,42,.97),rgba(5,19,29,.96));border:1px solid rgba(83,222,222,.34);border-radius:14px;overflow:hidden;font:14px system-ui,sans-serif}",
      "#traderOkxAccountPanel>summary{padding:13px 14px;cursor:pointer;display:flex;align-items:center;gap:10px;flex-wrap:wrap;list-style:none;font-size:14px;font-weight:800}",
      "#traderOkxAccountPanel>summary::-webkit-details-marker{display:none}",
      "#traderOkxAccountPanel .okx-live-dot{width:9px;height:9px;border-radius:50%;background:#8796a1;box-shadow:0 0 0 3px rgba(135,150,161,.12)}",
      "#traderOkxAccountPanel[data-state='ready'] .okx-live-dot{background:#58ef9c;box-shadow:0 0 0 3px rgba(88,239,156,.12)}",
      "#traderOkxAccountPanel[data-state='error'] .okx-live-dot{background:#ff8799}",
      "#traderOkxAccountPanel [data-okx-state]{color:#85e9df;font-size:11px;font-weight:700}",
      "#traderOkxAccountPanel .okx-ro{margin-left:auto;padding:4px 8px;border:1px solid rgba(88,239,156,.26);border-radius:999px;color:#8cf2b5;font-size:10px;letter-spacing:.08em}",
      "#traderOkxAccountPanel .okx-body{border-top:1px solid rgba(83,222,222,.14);padding:10px 14px 12px}",
      "#traderOkxAccountPanel .okx-primary{display:grid;grid-template-columns:1.35fr 1fr 1fr;gap:8px}",
      "#traderOkxAccountPanel .okx-position{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-top:7px}",
      "#traderOkxAccountPanel .okx-position .okx-card{border-color:rgba(255,209,117,.16)}",
      "#traderOkxAccountPanel .okx-position [data-okx-positionvalue]{color:#fff1c7}",
      "#traderOkxAccountPanel .okx-position [data-okx-avgcost],#traderOkxAccountPanel .okx-position [data-okx-committed],#traderOkxAccountPanel .okx-position [data-okx-pnl]{font-size:11px;color:#d6b879}",
      "#traderOkxAccountPanel .okx-position-proof{margin:6px 2px 0;color:#8ea4ba;font-size:14px;line-height:1.5}",
      "#traderOkxAccountPanel .okx-activity{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-top:7px}",
      "#traderOkxAccountPanel .okx-card{min-width:0;padding:9px 11px;border:1px solid rgba(142,164,186,.14);border-radius:9px;background:rgba(5,18,28,.58)}",
      "#traderOkxAccountPanel .okx-card.primary{background:linear-gradient(180deg,rgba(8,31,43,.82),rgba(4,19,29,.72));border-color:rgba(83,222,222,.22)}",
      "#traderOkxAccountPanel .okx-card span{display:block;color:#8ea4ba;font-size:12px;text-transform:uppercase;letter-spacing:.07em}",
      "#traderOkxAccountPanel .okx-card b{display:block;margin-top:3px;color:#eefafa;font-size:16px;line-height:1.35;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}",
      "#traderOkxAccountPanel [data-okx-fees]{white-space:pre-line;overflow-wrap:normal;word-break:keep-all}",
      "#traderOkxAccountPanel .okx-card.primary b{font-size:18px;color:#fff1c7}",
      "#traderOkxAccountPanel .okx-card small{display:block;margin-top:3px;color:#91a9b7;font-size:12px;line-height:1.45}",
      "#traderOkxAccountPanel .okx-ledger{margin-top:10px;padding:12px;border:1px solid rgba(83,222,222,.27);border-radius:11px;background:rgba(4,17,27,.76)}",
      "#traderOkxAccountPanel .okx-ledger-head{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;color:#b6faf0}",
      "#traderOkxAccountPanel .okx-ledger-head strong{font-size:16px;line-height:1.4;letter-spacing:.015em}",
      "#traderOkxAccountPanel .okx-ledger-head button{font-size:13px;min-height:34px;padding:6px 11px}",
      "#traderOkxAccountPanel [data-okx-ledgerstatus]{display:block;font-size:14px;line-height:1.5;font-weight:750;color:#ffe09b;margin:10px 0 6px}",
      "#traderOkxAccountPanel .okx-ledger-note,#traderOkxAccountPanel [data-okx-ledgerwarning]{font-size:13px;line-height:1.5;color:#bed3e3;margin:8px 0}",
      "#traderOkxAccountPanel .okx-ledger-summary{display:flex;flex-wrap:wrap;gap:7px 15px;align-items:center;padding:10px 12px;margin:8px 0;background:rgba(11,42,53,.7);border:1px solid rgba(99,191,190,.25);border-radius:8px;color:#d4e9f0;font-size:13px;line-height:1.5}",
      "#traderOkxAccountPanel .okx-ledger-summary[hidden]{display:none!important}",
      "#traderOkxAccountPanel .okx-ledger-summary strong{color:#f0fcfa;font-size:14px}",
      "#traderOkxAccountPanel .okx-ledger-summary small{flex-basis:100%;font-size:12px;color:#a8bfca;line-height:1.5}",
      "#traderOkxAccountPanel .okx-ledger-movements{margin-top:10px;border-top:1px solid rgba(120,179,197,.18);padding-top:8px}",
      "#traderOkxAccountPanel .okx-ledger-movements>summary{cursor:pointer;font-size:13px;font-weight:650;padding:7px 0;color:#c2e5ed}",
      "#traderOkxAccountPanel .okx-ledger-results{list-style:none;display:grid;gap:7px;margin:12px 0;padding:0;max-height:none;overflow:visible}",
      "#traderOkxAccountPanel .okx-ledger-item{display:grid;grid-template-columns:minmax(220px,1fr) minmax(190px,1fr) minmax(300px,1.3fr);align-items:center;gap:9px;min-width:0;border:1px solid rgba(120,179,197,.25);border-radius:10px;background:rgba(12,36,50,.75);padding:10px 13px}",
      "#traderOkxAccountPanel .okx-ledger-meta{display:flex;flex-direction:column;gap:3px;min-width:0}",
      "#traderOkxAccountPanel .okx-ledger-meta strong{font-size:13px;color:#effbff;font-weight:750}",
      "#traderOkxAccountPanel .okx-ledger-meta span{font-size:12px;color:#c0d2de;line-height:1.45}",
      "#traderOkxAccountPanel .okx-ledger-direction{font-size:13px;font-weight:650;color:#daebf2}",
      "#traderOkxAccountPanel .okx-ledger-amount{font-size:16px;font-weight:750;line-height:1.35;text-align:right;overflow-wrap:anywhere;letter-spacing:.012em;font-variant-numeric:tabular-nums}",
      "#traderOkxAccountPanel .okx-ledger-credit{color:#76f4b5}",
      "#traderOkxAccountPanel .okx-ledger-debit{color:#ffd39b}",
      "#traderOkxAccountPanel .okx-ledger-neutral{color:#e1edf1}",
      "#traderOkxAccountPanel .okx-ledger-empty{font-size:13px;line-height:1.6;padding:12px 0;color:#d6e9ee}",
      "#traderOkxAccountPanel  .okx-ledger-technical{margin-top:10px;border-top:1px solid rgba(120,179,197,.2);padding-top:11px;color:#b6cfdc}",
      "#traderOkxAccountPanel .okx-ledger-technical summary{cursor:pointer;font-size:12px;font-weight:650;line-height:1.5;padding:7px 0}",
      "#traderOkxAccountPanel .okx-ledger-technical p,#traderOkxAccountPanel .okx-ledger-technical li{font-size:12px;line-height:1.6;overflow-wrap:anywhere}",
      "@media(max-width:1050px){#traderOkxAccountPanel .okx-ledger-item{grid-template-columns:minmax(150px,1fr) minmax(150px,1fr)}#traderOkxAccountPanel .okx-ledger-amount{grid-column:1/-1;text-align:left}}",
      "@media(max-width:640px){#traderOkxAccountPanel .okx-ledger-item{grid-template-columns:1fr;gap:7px}#traderOkxAccountPanel .okx-ledger-amount{grid-column:1}#traderOkxAccountPanel .okx-ledger-head strong{font-size:16px}}",
      "#traderOkxAccountPanel .okx-foot{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-top:8px;color:#8ea4ba;font-size:12px}",
      "#traderOkxAccountPanel button,#traderOkxAccountPanel input{border:1px solid #436d7a;border-radius:8px;background:#123743;color:#fff;padding:7px 10px}",
      "#traderOkxAccountPanel button{cursor:pointer;font-weight:700}",
      "#traderOkxAccountPanel .okx-auth{display:grid;grid-template-columns:auto minmax(220px,1fr) auto;align-items:center;gap:8px;margin:8px 0 0;padding:8px 10px;border:1px solid rgba(255,201,103,.25);border-radius:10px;background:rgba(45,29,8,.25)}",
      "#traderOkxAccountPanel .okx-auth[hidden]{display:none!important}",
      "#traderOkxAccountPanel .okx-auth input{min-width:0;width:100%;height:34px;box-sizing:border-box}",
      "#traderOkxAccountPanel .okx-auth button{height:34px;white-space:nowrap}",
      "#traderOkxAccountPanel .okx-auth small{color:#d9c08d;white-space:nowrap}",
      "@media(max-width:1200px){#traderOkxAccountPanel .okx-primary{grid-template-columns:1fr 1fr 1fr}#traderOkxAccountPanel .okx-position,#traderOkxAccountPanel .okx-activity{grid-template-columns:repeat(2,minmax(0,1fr))}}",
      "@media(max-width:760px){#traderOkxAccountPanel .okx-primary,#traderOkxAccountPanel .okx-position,#traderOkxAccountPanel .okx-activity{grid-template-columns:1fr}#traderOkxAccountPanel .okx-auth{grid-template-columns:1fr}#traderOkxAccountPanel .okx-auth small{white-space:normal}.okx-ro{margin-left:0!important}}"
    ].join("");document.head.appendChild(style);
  }
  const p=document.createElement("details");p.id=PANEL_ID;p.open=true;p.dataset.state="loading";
  p.setAttribute("aria-label","Compte OKX réel · lecture seule via Aether Trust");
  p.innerHTML=[
    '<summary><i class="okx-live-dot" aria-hidden="true"></i><strong>COMPTE OKX · RÉEL</strong><span data-okx-state>INITIALISATION…</span><span class="okx-ro">LECTURE SEULE · AUCUN ORDRE</span></summary>',
    '<div class="okx-body"><div class="okx-primary">',
    '<article class="okx-card primary"><span>BTC détenu</span><b data-okx-btc>—</b><small data-okx-btcdetail>Trading / Funding</small></article>',
    '<article class="okx-card primary"><span>USDC disponible</span><b data-okx-usdc>—</b><small data-okx-usdcdetail>Trading / Funding</small></article>',
    '<article class="okx-card primary"><span>EUR disponible</span><b data-okx-eur>—</b><small data-okx-eurdetail>Trading / Funding</small></article>',
    '</div><div class="okx-position">',
    '<article class="okx-card"><span>Valeur BTC actuelle</span><b data-okx-positionvalue>—</b><small>Équivalent USD retourné par OKX</small></article>',
    '<article class="okx-card"><span>Prix moyen d’achat</span><b data-okx-avgcost>—</b><small data-okx-avgcosthint>Calculé seulement avec un historique prouvé</small></article>',
    '<article class="okx-card"><span>Montant total investi</span><b data-okx-committed>—</b><small data-okx-committedhint>Achats + frais prouvés</small></article>',
    '<article class="okx-card"><span>Gain / perte actuel</span><b data-okx-pnl>—</b><small data-okx-pnlhint>Valeur actuelle − montant investi</small></article>',
    '</div><p class="okx-position-proof" data-okx-positionproof>Historique d’acquisition en cours de qualification.</p><div class="okx-activity">',
    '<article class="okx-card"><span>Ordres ouverts</span><b data-okx-pending>—</b><small>SPOT OKX</small></article>',
    '<article class="okx-card"><span>Historique Spot</span><b data-okx-history>—</b><small>Ordres Spot · 3 mois, hors achat PayPal</small></article>',
    '<article class="okx-card"><span>Exécutions Spot</span><b data-okx-fills>—</b><small>Transactions Spot · 3 mois, hors achat PayPal</small></article>',
    '<article class="okx-card"><span>Frais BTC-USDC</span><b data-okx-fees>—</b><small>tarification du compte</small></article>',
    '</div><section class="okx-ledger" aria-label="Historique financier OKX en lecture seule"><div class="okx-ledger-head"><strong>HISTORIQUE DU COMPTE OKX</strong><button type="button" data-okx-ledgerrefresh>Actualiser l’historique</button></div><p role="status" data-okx-ledgerstatus>En attente de connexion.</p><div class="okx-ledger-summary" data-okx-ledgersummary hidden><strong data-okx-ledgersummarydate>—</strong><span data-okx-ledgersummaryeur>—</span><span>→</span><strong data-okx-ledgersummarybtc>—</strong><span>· Taux déduit : <b data-okx-ledgersummaryrate>—</b></span><small>Rapprochement indicatif des écritures OKX, pas une preuve du paiement externe ni du coût de toutes les acquisitions.</small></div><p data-okx-ledgerwarning></p><details class="okx-ledger-movements"><summary data-okx-ledgerdetailcount>Afficher les mouvements détaillés</summary><p class="okx-ledger-note">Chaque ligne correspond à une variation de solde, pas nécessairement à un achat distinct.</p><ul class="okx-ledger-results" data-okx-ledgerentries></ul></details><details class="okx-ledger-technical"><summary>Afficher les références et les sources OKX</summary><p data-okx-ledgercoverage>En attente de lecture.</p><ol data-okx-ledgerreferences></ol></details></section><form class="okx-auth" data-okx-auth hidden><small data-okx-authstatus>Aether Trust requis.</small><input data-okx-secret type="password" minlength="6" autocomplete="current-password" placeholder="Mot de passe Aether Trust"><button data-okx-connect type="submit">Connecter</button></form>',
    '<div class="okx-foot"><b data-okx-bridge>Bridge local 8787 · OKX Private REST</b><span>Dernière lecture : <span data-okx-updated>—</span></span><button type="button" data-okx-refresh>Actualiser</button></div></div>'
  ].join("");
  const caseStudy=document.getElementById("traderOkbCaseStudy");
  if(caseStudy?.parentElement===zone)zone.insertBefore(p,caseStudy);
  else{
    const analyst=document.getElementById("analyste");
    if(analyst?.parentElement===zone)analyst.insertAdjacentElement("afterend",p);
    else zone.appendChild(p);
  }
  p.querySelector("[data-okx-auth]")?.addEventListener("submit",submitInlineAuth);
  p.querySelector("[data-okx-refresh]")?.addEventListener("click",()=>void refresh({force:true}));
  p.querySelector("[data-okx-ledgerrefresh]")?.addEventListener("click",()=>void refreshLedger(true));
  p.addEventListener("toggle",()=>{if(p.open)void refresh({force:true});});
  bindCanonicalTrust();
  window.addEventListener("aether-trust:logout-requested",logoutBridge,{passive:true});
  window.addEventListener("pageshow",()=>{bindCanonicalTrust();if(p.open)void refresh({force:true});},{passive:true});
  document.addEventListener("visibilitychange",()=>{if(!document.hidden&&p.open)void refresh();},{passive:true});
  clearInterval(timer);timer=setInterval(()=>{if(!document.hidden&&p.open&&token())void refresh();},AUTO_REFRESH_MS);
  void refresh({force:true});
  return true;
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
globalThis.AgentCryptoTraderOkxAccount=Object.freeze({mount,refresh,login,logout:logoutBridge,read_only:true,bridge:BRIDGE,token_storage:"sessionStorage",okx_credentials_in_browser:false,real_orders:false});
})();