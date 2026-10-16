/* ERITH.IA · LAB PAPER : l'interface lit les propriétaires graphiques existants. */
(()=>{
"use strict";
const core=globalThis.AgentCryptoPaperLabCore;
if(!core||typeof document==="undefined")return;
const ID="traderPaperLab",captures=new Map(),positions=new Map(),journal=[];
const qs=key=>document.getElementById(ID)?.querySelector("[data-lab-"+key+"]");
const show=(key,value)=>{const node=qs(key);if(node)node.textContent=String(value??"—")};
const safe=fn=>{try{return fn()}catch(_){return null}};
const parse=value=>{const n=Number(String(value??"").replace(",","."));return Number.isFinite(n)?n:NaN};
const fmt=(value,d=6)=>Number.isFinite(value)?value.toLocaleString("fr-FR",{maximumFractionDigits:d}):"—";
function source(){
  const ext=safe(()=>globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.());
  if(ext?.active){
    const row=safe(()=>globalThis.AgentCryptoNewListingsNativeCategory?.mathSeriesSnapshot?.());
    if(!row)return {reason:"CT : ligne native non chargée ou non qualifiée"};
    return {input:{asset:"CT",instrument:row.instrument,provider:row.provider,
      currency:row.currency,source:row.source,series:row.series}};
  }
  const coin=safe(()=>globalThis.getSelectedCoin?.());
  if(coin?.id!=="bitcoin"||String(coin.symbol||"").toUpperCase()!=="BTC")
    return {reason:"Sélectionne BTC Solo 24h USD, ou CT dans Nouveaux listings."};
  const ch=safe(()=>typeof state!=="undefined"?state?.dataBroker?.chart:null);
  if(ch?.status!=="ready"||ch.coinId!=="bitcoin"||ch.period!==1||
     ch.contextKey!=="single:bitcoin:1:USD"||ch.result?.blocked)
    return {reason:"BTC : série 24h USD du graphique non prête."};
  const r=ch.result;
  if(r.currency!=="USD"||!/coingecko/i.test(String(r.source||"")+" "+String(r.sourceFamily||"")))
    return {reason:"BTC : série USD CoinGecko sans provenance suffisante."};
  return {input:{asset:"BTC",instrument:"BTC-USD",provider:"coingecko",
    currency:"USD",source:r.source,series:r.series}};
}
function assumptions(){
  const out={};
  for(const key of ["capital","entryFeePct","exitFeePct","spreadPct","slippagePct"])
    out[key]=parse(qs(key)?.value);
  return out;
}
function refresh(){
  show("observations",["BTC","CT"].map(a=>{
    const c=captures.get(a);
    return a+": "+(c?fmt(c.price,a==="BTC"?2:8)+" USD · "+
      c.points+" points · "+c.source+" · "+new Date(c.lastAt).toLocaleString("fr-FR")
      :"aucune observation");
  }).join("\n"));
  show("open",positions.size?[...positions.values()].map(p=>p.entry.asset+
    " · "+fmt(p.entry.price,8)+" USD · "+p.entry.lastAt).join("\n"):"Aucune");
  show("journal",journal.length?journal.map(j=>j.at+" · "+j.kind+" · "+j.asset+
    (j.result?" · "+fmt(j.result.paperProfit,6)+" USD papier":"")).join("\n"):"Journal vide (session volatile)");
}
function take(){
  const s=source();
  if(!s.input){show("status",s.reason);return null;}
  const c=core.qualify(s.input);
  if(!c.ok){show("status",c.reason);return null;}
  captures.set(c.asset,c);
  show("status","Observation "+c.asset+" qualifiée · "+c.points+
    " points · "+c.source+" · "+Math.round(c.ageMs/1000)+" s de décalage.");
  refresh();return c;
}
function simulate(){
  const c=take();if(!c)return null;
  const p=core.assess({...assumptions(),price:c.price});
  if(!p.ok){show("status",p.reason);return null;}
  show("result","Prix observé "+c.asset+" : "+fmt(c.price,8)+" USD\n"+
    "Capital "+fmt(p.capital,2)+" USD papier ; quantité fictive "+fmt(p.quantity,9)+" "+c.asset+
    "\nFrais entrée/sortie "+fmt(p.entryFeePct,2)+"/"+fmt(p.exitFeePct,2)+" %"+
    " ; spread "+fmt(p.spreadPct,2)+" % ; glissement / côté "+fmt(p.slippagePct,2)+" %"+
    "\nPoint mort après coûts : hausse de "+fmt(p.breakEvenMovePct,3)+" %"+
    "\n"+p.scenarios.map(r=>(r.movePct>0?"+":"")+r.movePct+" % de cours → "+
      (r.profit>0?"+":"")+fmt(r.profit,6)+" USD papier ("+fmt(r.returnPct,2)+" %)").join("\n")+
    "\nPas de contrôle de carnet ou minimum d'ordre ; pas de prédiction.");
  return p;
}
function add(kind,asset,more={}){
  journal.push({at:new Date().toISOString(),kind,asset,...more});
  if(journal.length>30)journal.shift();
}
function begin(){
  const c=take();if(!c)return;
  const p=core.assess({...assumptions(),price:c.price});
  if(!p.ok){show("status",p.reason);return;}
  if(positions.has(c.asset)){show("status","Expérience PAPER "+c.asset+" déjà ouverte.");return;}
  positions.set(c.asset,{entry:c,config:assumptions()});
  add("OUVERTURE_PAPER",c.asset,{entryAt:c.lastAt,source:c.source});
  show("status","Départ PAPER "+c.asset+" enregistré. Comparer après une nouvelle cotation.");
  refresh();
}
function finish(){
  const c=take();if(!c)return;
  const p=positions.get(c.asset);
  if(!p){show("status","Aucune entrée PAPER ouverte pour "+c.asset);return;}
  const r=core.prospective(p.entry,c,p.config);
  if(!r.ok){show("status",r.reason);return;}
  positions.delete(c.asset);
  add("EVALUATION_PAPER",c.asset,{result:r});
  show("result","Évaluation PAPER "+c.asset+" · cours "+fmt(r.movePct,3)+" %"+
    " · résultat "+(r.paperProfit>0?"+":"")+fmt(r.paperProfit,6)+
    " USD fictifs ; ni ordre, ni gain réel.");
  show("status","Comparaison prospective réalisée sur deux relevés publics datés.");
  refresh();
}
function mount(){
  if(document.getElementById(ID))return true;
  const zone=document.getElementById("market-zone");if(!zone)return false;
  const style=document.createElement("style");style.id="traderPaperLabStyle";
  style.textContent="#traderPaperLab{grid-column:1/-1;display:block;margin:12px 0 28px;background:#081d2a;color:#e2f5f0;border:1px solid #427781;border-radius:12px;font:13px/1.5 system-ui,sans-serif;overflow:hidden}"+
    "#traderPaperLab summary{padding:14px;color:#e8d5a4;font-weight:750;cursor:pointer;background:#092b3a}"+
    "#traderPaperLab .pl-body{padding:14px}#traderPaperLab .pl-fields{display:flex;flex-wrap:wrap;gap:12px}"+
    "#traderPaperLab label{display:grid;gap:4px;font-size:12px}#traderPaperLab input{width:135px;background:#031622;color:white;border:1px solid #416d76;padding:7px;border-radius:6px}"+
    "#traderPaperLab button{margin:8px 5px 5px 0;padding:8px 11px;background:#155266;color:#eaffff;border:1px solid #3b9bab;border-radius:8px;cursor:pointer}"+
    "#traderPaperLab pre{white-space:pre-wrap;overflow-wrap:anywhere;padding:10px;background:#041723;border:1px solid #284c59;border-radius:7px;color:#d3f9eb}"+
    "#traderPaperLab [data-lab-status]{color:#e3cf91}";
  document.head.appendChild(style);
  const node=document.createElement("details");node.id=ID;
  node.innerHTML=[
    '<summary>LABORATOIRE PAPER · BTC / CT · calculs après coûts · aucun ordre</summary>',
    '<div class="pl-body"><p>Choisir BTC Solo 24h USD ou CT dans Nouveaux listings. Les deux cas sont capturés séparément depuis les propriétaires graphiques existants.</p>',
    '<div class="pl-fields">',
    '<label>Capital USD fictif<input data-lab-capital value="5" inputmode="decimal"></label>',
    '<label>Frais achat (%)<input data-lab-entryFeePct value="0,2" inputmode="decimal"></label>',
    '<label>Frais vente (%)<input data-lab-exitFeePct value="0,2" inputmode="decimal"></label>',
    '<label>Spread total (%)<input data-lab-spreadPct value="0,1" inputmode="decimal"></label>',
    '<label>Glissement par côté (%)<input data-lab-slippagePct value="0,1" inputmode="decimal"></label>',
    '</div><p>Hypothèses ajustables, PAS les coûts OKX certifiés. USD notionnels : ni USD ni USDT ne sont traités automatiquement comme des USDC. Minimums et profondeur non évalués.</p>',
    '<button type="button" data-lab-capture>Capturer la source</button>',
    '<button type="button" data-lab-simulate>Simuler −5 / 0 / +5 %</button>',
    '<button type="button" data-lab-begin>Ouvrir scénario prospectif</button>',
    '<button type="button" data-lab-finish>Évaluer sur un nouveau relevé</button>',
    '<button type="button" data-lab-copy>Copier le journal</button>',
    '<p role="status" data-lab-status>En attente d’une capture volontaire.</p>',
    '<h4>Observations BTC / CT</h4><pre data-lab-observations></pre>',
    '<h4>Résultat</h4><pre data-lab-result>Pas de valeur inventée.</pre>',
    '<h4>Observations PAPER ouvertes</h4><pre data-lab-open></pre>',
    '<h4>Journal prospectif · session seulement</h4><pre data-lab-journal></pre>',
    '<p>Une évaluation exige une cotation ultérieure de la même paire/source. Aucun fetch nouveau, aucun ordre OKX, aucune sauvegarde automatique, aucune promotion des gates Strategy A. Le journal non exporté disparaît à la fermeture de la page.</p></div>'
  ].join("");
  zone.appendChild(node);
  for(const [key,fn] of [["capture",take],["simulate",simulate],["begin",begin],["finish",finish]])
    qs(key)?.addEventListener("click",fn);
  qs("copy")?.addEventListener("click",async()=>{
    try{await navigator.clipboard.writeText(JSON.stringify({paper:true,realOrders:false,events:journal},null,2));
      show("status","Journal PAPER copié localement. Aucun envoi.");}
    catch(_){show("status","Copie refusée par Firefox ; aucune donnée transmise.");}
  });
  node.addEventListener("toggle",()=>{if(node.open)refresh()});
  refresh();return true;
}
globalThis.AgentCryptoTraderPaperLab=Object.freeze({mount,take,simulate,begin,finish,source,
  snapshot:()=>({captured:[...captures.keys()],open:[...positions.keys()],
    journalCount:journal.length,realOrders:false,network:false,storage:false}),
  realOrders:false,network:false,storage:false,bridge:false,readOnly:true});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
else mount();
})();
