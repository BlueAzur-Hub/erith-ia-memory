/* Agent-Crypto Trader · Compte OKX réel · READ ONLY via Aether Trust / Bridge 8787. */
(()=>{
"use strict";
const PANEL_ID="traderOkxAccountPanel";
const STYLE_ID="traderOkxAccountStyle";
const TOKEN_KEY="agent_crypto_bridge_owner_token_v1";
const ROLE_KEY="agent_crypto_local_access_session_v1";
const BRIDGE="http://127.0.0.1:8787";
const AUTO_REFRESH_MS=60000;
let timer=0;
let inflight=null;

const panel=()=>document.getElementById(PANEL_ID);
const q=(name)=>panel()?.querySelector(`[data-okx-${name}]`)||null;
const text=(name,value)=>{const el=q(name);if(el)el.textContent=String(value??"—");};
const token=()=>{try{return sessionStorage.getItem(TOKEN_KEY)||"";}catch(_){return"";}};
const owner=()=>{try{return sessionStorage.getItem(ROLE_KEY)==="owner";}catch(_){return false;}};
const saveToken=value=>{try{if(value)sessionStorage.setItem(TOKEN_KEY,value);else sessionStorage.removeItem(TOKEN_KEY);}catch(_){}};
const fmt=(value,digits=8)=>Number.isFinite(Number(value))?Number(value).toLocaleString("fr-FR",{maximumFractionDigits:digits}):"—";
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
  const present=Boolean(tr||fu);
  const sum=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)?a+b:Number.isFinite(a)?a:Number.isFinite(b)?b:NaN;
  return {present,total:sum(trTotal,fuTotal),available:sum(trAvail,fuAvail),frozen:sum(trFrozen,fuFrozen),trading:Number.isFinite(trTotal)?trTotal:NaN,funding:Number.isFinite(fuTotal)?fuTotal:NaN};
}
function feeLabel(payload){
  const row=Array.isArray(payload?.fees)?payload.fees[0]:null;
  if(!row)return"—";
  const maker=row.maker??row.makerU??row.makerUSDC,taker=row.taker??row.takerU??row.takerUSDC;
  if(maker==null&&taker==null)return"OK";
  const pct=v=>Number.isFinite(Number(v))?(Number(v)*100).toLocaleString("fr-FR",{maximumFractionDigits:4})+" %":"—";
  return `Maker ${pct(maker)} · Taker ${pct(taker)}`;
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
function paintData(account,orders,fills,fees){
  paintAsset("BTC",asset(account,"BTC"));
  paintAsset("USDC",asset(account,"USDC"));
  paintAsset("EUR",asset(account,"EUR"));
  text("pending",Array.isArray(orders?.pending)?orders.pending.length:0);
  text("history",Array.isArray(orders?.history_3m)?orders.history_3m.length:0);
  text("fills",Array.isArray(fills?.fills_3m)?fills.fills_3m.length:0);
  text("fees",feeLabel(fees));
  text("bridge",`Bridge ${account?.bridge_version||orders?.bridge_version||"—"} · ${account?.site||"OKX"} · READ ONLY`);
  const date=new Date(account?.fetched_at||Date.now());
  text("updated",Number.isFinite(date.getTime())?date.toLocaleString("fr-FR"):"à l'instant");
  setState("ready","COMPTE OKX RÉEL · CONNECTÉ");
  showAuth(false);
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
      return true;
    }catch(error){
      if(error?.status===401){saveToken("");setState("locked","SESSION BRIDGE À RÉAUTHENTIFIER");showAuth(true,"La session Bridge n'est plus valide. Entre le mot de passe Aether Trust.");}
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
}

function mount(){
  if(panel())return true;
  const zone=document.getElementById("market-zone");if(!zone)return false;
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement("style");style.id=STYLE_ID;style.textContent=[
      "#traderOkxAccountPanel{grid-column:1/-1;display:block;box-sizing:border-box;width:99%;margin:14px auto 0;color:#d7eff0;background:linear-gradient(180deg,rgba(7,29,42,.97),rgba(5,19,29,.96));border:1px solid rgba(83,222,222,.34);border-radius:14px;overflow:hidden;font:12px system-ui,sans-serif}",
      "#traderOkxAccountPanel>summary{padding:13px 14px;cursor:pointer;display:flex;align-items:center;gap:10px;flex-wrap:wrap;list-style:none;font-size:14px;font-weight:800}",
      "#traderOkxAccountPanel>summary::-webkit-details-marker{display:none}",
      "#traderOkxAccountPanel .okx-live-dot{width:9px;height:9px;border-radius:50%;background:#8796a1;box-shadow:0 0 0 3px rgba(135,150,161,.12)}",
      "#traderOkxAccountPanel[data-state='ready'] .okx-live-dot{background:#58ef9c;box-shadow:0 0 0 3px rgba(88,239,156,.12)}",
      "#traderOkxAccountPanel[data-state='error'] .okx-live-dot{background:#ff8799}",
      "#traderOkxAccountPanel [data-okx-state]{color:#85e9df;font-size:11px;font-weight:700}",
      "#traderOkxAccountPanel .okx-ro{margin-left:auto;padding:4px 8px;border:1px solid rgba(88,239,156,.26);border-radius:999px;color:#8cf2b5;font-size:10px;letter-spacing:.08em}",
      "#traderOkxAccountPanel .okx-body{border-top:1px solid rgba(83,222,222,.16);padding:12px 14px 14px}",
      "#traderOkxAccountPanel .okx-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px}",
      "#traderOkxAccountPanel .okx-card{min-width:0;padding:10px;border:1px solid rgba(142,164,186,.17);border-radius:10px;background:rgba(5,18,28,.72)}",
      "#traderOkxAccountPanel .okx-card span{display:block;color:#8ea4ba;font-size:9px;text-transform:uppercase;letter-spacing:.06em}",
      "#traderOkxAccountPanel .okx-card b{display:block;margin-top:4px;color:#eefafa;font-size:13px;line-height:1.3;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}",
      "#traderOkxAccountPanel .okx-card small{display:block;margin-top:4px;color:#91a9b7;font-size:9px;line-height:1.35}",
      "#traderOkxAccountPanel .okx-foot{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-top:10px;color:#8ea4ba;font-size:10px}",
      "#traderOkxAccountPanel button,#traderOkxAccountPanel input{border:1px solid #436d7a;border-radius:8px;background:#123743;color:#fff;padding:7px 10px}",
      "#traderOkxAccountPanel button{cursor:pointer;font-weight:700}",
      "#traderOkxAccountPanel .okx-auth{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:10px 0 0;padding:10px;border:1px solid rgba(255,201,103,.25);border-radius:10px;background:rgba(45,29,8,.25)}",
      "#traderOkxAccountPanel .okx-auth[hidden]{display:none!important}",
      "#traderOkxAccountPanel .okx-auth input{min-width:220px}",
      "#traderOkxAccountPanel .okx-auth small{color:#d9c08d}",
      "@media(max-width:1200px){#traderOkxAccountPanel .okx-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}",
      "@media(max-width:760px){#traderOkxAccountPanel .okx-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.okx-ro{margin-left:0!important}}"
    ].join("");document.head.appendChild(style);
  }
  const p=document.createElement("details");p.id=PANEL_ID;p.open=true;p.dataset.state="loading";
  p.setAttribute("aria-label","Compte OKX réel · lecture seule via Aether Trust");
  p.innerHTML=[
    '<summary><i class="okx-live-dot" aria-hidden="true"></i><strong>COMPTE OKX · RÉEL</strong><span data-okx-state>INITIALISATION…</span><span class="okx-ro">READ ONLY · AUCUN ORDRE</span></summary>',
    '<div class="okx-body"><div class="okx-grid">',
    '<article class="okx-card"><span>BTC</span><b data-okx-btc>—</b><small data-okx-btcdetail>Trading / Funding</small></article>',
    '<article class="okx-card"><span>USDC</span><b data-okx-usdc>—</b><small data-okx-usdcdetail>Trading / Funding</small></article>',
    '<article class="okx-card"><span>EUR</span><b data-okx-eur>—</b><small data-okx-eurdetail>Trading / Funding</small></article>',
    '<article class="okx-card"><span>Ordres ouverts</span><b data-okx-pending>—</b><small>SPOT OKX</small></article>',
    '<article class="okx-card"><span>Historique</span><b data-okx-history>—</b><small>ordres · 3 mois</small></article>',
    '<article class="okx-card"><span>Fills</span><b data-okx-fills>—</b><small>exécutions · 3 mois</small></article>',
    '<article class="okx-card"><span>Frais BTC-USDC</span><b data-okx-fees>—</b><small>barème du compte</small></article>',
    '</div><form class="okx-auth" data-okx-auth hidden><small data-okx-authstatus>Aether Trust requis.</small><input data-okx-secret type="password" minlength="6" autocomplete="current-password" placeholder="Mot de passe Aether Trust"><button data-okx-connect type="submit">Connecter le compte</button></form>',
    '<div class="okx-foot"><b data-okx-bridge>Bridge local 8787 · OKX Private REST</b><span>Dernière lecture : <span data-okx-updated>—</span></span><button type="button" data-okx-refresh>Actualiser</button><span>P&L : prochain bloc · historique des acquisitions à reconstruire sans invention.</span></div></div>'
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