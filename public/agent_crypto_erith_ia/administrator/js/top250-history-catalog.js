/* Seven Heaven · provenance-only Top250 history catalog; no trades, no local writes. */
(() => {
"use strict";
const source=new URL("../../data/historical_archive_prototype/top250_history_catalog/index.json",document.currentScript.src);
const $=id=>document.getElementById(id);
const check=(ok,msg)=>{if(!ok)throw Error(msg)};
let catalog=null;
function metric(label,value){
 const div=document.createElement("div"),sm=document.createElement("small"),b=document.createElement("b");
 div.className="metric";sm.textContent=label;b.textContent=value;div.append(sm,b);return div;
}
function tableCell(tr,value){
 const td=document.createElement("td");td.textContent=String(value);tr.append(td);return td;
}
function display(){
 if(!catalog)return;
 const limit=Number($("top250-limit").value),query=$("top250-search").value.trim().toLowerCase();
 const only=$("top250-available").checked;
 const filtered=catalog.assets.filter(a=>a.rank<=limit&&(!only||a.months.length>0)&&
   (!query||[a.id,a.symbol,a.name,String(a.rank)].some(x=>x.toLowerCase().includes(query))));
 const body=document.createDocumentFragment();
 for(const a of filtered){
  const tr=document.createElement("tr");
  tableCell(tr,a.rank);tableCell(tr,a.name+" · "+a.symbol);
  tableCell(tr,a.months.length?"Archivé":"À collecter");
  tableCell(tr,a.months.length);
  tableCell(tr,a.candles.toLocaleString("fr-FR"));
  tableCell(tr,a.months[0]?.month??"—");
  const last=tableCell(tr,"");
  const rec=a.months.at(-1);
  if(rec){
   const label=document.createElement("a");
   label.textContent=rec.month+" · ZIP";
   label.href="https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/"+encodeURIComponent(rec.release);
   label.target="_blank";label.rel="noopener noreferrer";last.append(label);
  }else last.textContent="—";
  body.append(tr);
 }
 $("top250-rows").replaceChildren(body);
 $("top250-listed").textContent=filtered.length+" actifs affichés · couverture historique, pas une liste de prix live";
}
function validate(j){
 check(j?.schema==="aerith.public.ohlcv.top250.monthly-coverage-catalog.v1"&&
       j.ranked===250&&j.quote==="USDT"&&j.source.startsWith("Binance Spot")&&
       Array.isArray(j.assets)&&j.assets.length===250,"Catalogue historique inconnu");
 const ids=new Set();
 let total=0,covered=0;
 for(let i=0;i<250;i++){
  const a=j.assets[i];
  check(a.rank===i+1&&typeof a.id==="string"&&!ids.has(a.id)&&
        typeof a.symbol==="string"&&typeof a.name==="string"&&
        Array.isArray(a.months)&&Number.isInteger(a.candles)&&a.candles>=0,
        "Classement/identité historique altéré");
  ids.add(a.id);
  check(a.months.reduce((s,m)=>{
    check(/^\d{4}-(0[1-9]|1[0-2])$/.test(m.month)&&
      /^crypto-spot-bulk-\d{4}-\d\d-1m$/.test(m.release)&&
      /^[A-F0-9]+USDT$/.test(m.pair)&&/^[a-f0-9]{64}$/.test(m.sha256)&&
      Number.isInteger(m.candles)&&m.candles>0,"Pointeur historique non qualifié");
    return s+m.candles;
  },0)===a.candles,"Compte de bougies discordant");
  total+=a.candles;if(a.months.length)covered++;
 }
 check(covered===j.archived_assets&&total===j.native_1m_candles,
       "Catalogue source incohérent");
}
async function init(){
 const status=$("top250-status");
 status.textContent="Lecture du registre historique public…";
 try{
  check(source.origin===location.origin,"Source externe refusée");
  const r=await fetch(source.href,{credentials:"omit",cache:"no-store",redirect:"error"});
  check(r.ok,"HTTP "+r.status+" : catalogue non encore publié");
  const t=await r.text();
  check(t.length>0&&t.length<2000000,"Catalogue trop volumineux");
  const next=JSON.parse(t);validate(next);catalog=next;
  const summary=$("top250-summary"),frag=document.createDocumentFragment();
  frag.append(metric("Identités classées","250"));
  frag.append(metric("Avec mois vérifiés",String(next.archived_assets)+"/250"));
  frag.append(metric("Mois couverts",String(next.release_months)));
  frag.append(metric("Bougies natives 1 minute",next.native_1m_candles.toLocaleString("fr-FR")));
  summary.replaceChildren(frag);
  const counts=next.groups.map(g=>"Top "+g.top+" : "+g.with_history+"/"+g.top).join(" · ");
  $("top250-counts").textContent=counts+" · Binance Spot USDT seulement ; les actifs absents nécessitent d'autres sources.";
  status.textContent="Catalogue disponible · seuls les mois complets validés sont comptabilisés";
  display();
 }catch(e){status.textContent="Catalogue indisponible : "+String(e?.message||e);}
}
for(const key of ["top250-limit","top250-search","top250-available"])
 $(key)?.addEventListener(key==="top250-search"?"input":"change",display);
init();
window.SevenTop250Catalog=Object.freeze({read:()=>catalog});
})();