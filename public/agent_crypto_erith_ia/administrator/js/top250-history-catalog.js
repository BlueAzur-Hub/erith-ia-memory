/* Seven Heaven · one canonical Top250 view, read-only · Binance + Bitget. */
(() => {
"use strict";
const ROOT=new URL("../../data/historical_archive_prototype/",document.currentScript.src);
const $=id=>document.getElementById(id);
const check=(ok,msg)=>{if(!ok)throw Error(msg)};
let catalog=null,binance=null,bitget=null,yearDepth=null,privateWBT=null;
function metric(label,value){
 const div=document.createElement("div"),small=document.createElement("small"),b=document.createElement("b");
 div.className="metric";small.textContent=label;b.textContent=value;div.append(small,b);return div;
}
function cell(row,value){
 const td=document.createElement("td");td.textContent=String(value);row.append(td);return td;
}
async function getJson(name,limit=2000000){
 const path=new URL(name,ROOT);
 check(path.origin===location.origin&&path.pathname.startsWith(ROOT.pathname),"Origine du Coffre interdite");
 const res=await fetch(path.href,{credentials:"omit",cache:"no-store",redirect:"error"});
 check(res.ok,"Index indisponible : "+name+" HTTP "+res.status);
 const body=await res.text();check(body.length>0&&body.length<=limit,"Index trop volumineux : "+name);
 return JSON.parse(body);
}
function validate(fed,bin,alt,depth){
 check(fed?.schema==="aerith.public.ohlcv.top250.federated-native-archives.v1"&&
  fed.ranked===250&&fed.quote==="USDT"&&fed.is_live===false&&
  fed.assets?.length===250&&Number.isInteger(fed.archived_assets)&&
  Number.isInteger(fed.binance_archived_assets)&&Number.isInteger(fed.bitget_archived_assets)&&
  fed.archived_assets===fed.binance_archived_assets+fed.bitget_archived_assets,
  "Catalogue fédéré Top250 incorrect");
 check(bin?.schema==="aerith.public.ohlcv.top250.monthly-coverage-catalog.v1"&&
  bin.archived_assets===fed.binance_archived_assets&&bin.assets?.length===250&&
  alt?.schema==="aerith.public.ohlcv.verified-bitget-spot-month-views.v1"&&
  alt.archived_assets===fed.bitget_archived_assets&&
  alt.assets?.length===fed.bitget_archived_assets&&
  depth?.schema==="aerith.public.ohlcv.top250.verifiable-year-depth.v1"&&
  depth.archive_assets<=fed.binance_archived_assets&&depth.source_catalog_minutes<=bin.native_1m_candles&&depth.ranked===250,
  "Les sources du Coffre ne concordent pas");
 const ids=new Set(),alternatives=new Map(alt.assets.map(a=>[a.id,a]));
 let total=0,have=0,binCount=0,altCount=0;
 for(let i=0;i<250;i++){
  const a=fed.assets[i],origin=bin.assets[i];
  check(a.rank===i+1&&a.id===origin.id&&a.symbol===origin.symbol&&
   !ids.has(a.id)&&typeof a.name==="string"&&
   Number.isInteger(a.months)&&a.months>=0&&
   Number.isInteger(a.native_1m_count)&&a.native_1m_count>=0,
   "Identités fédérées incohérentes");
  ids.add(a.id);total+=a.native_1m_count;
  const archived=a.months>0;
  if(archived)have++;
  if(origin.months.length){
   check(a.months===origin.months.length&&a.native_1m_count===origin.candles&&
    a.source==="Binance Spot official native 1m ZIPs","Archive Binance altérée");
   binCount++;
  }else if(archived){
   const b=alternatives.get(a.id);
   check(!!b&&b.symbol===a.symbol&&Array.isArray(b.months)&&
    b.months.length===a.months&&
    b.total_verified_1m_count===a.native_1m_count&&
    a.source==="Bitget Spot native 1m HTTPS","Archive Bitget incohérente");
   altCount++;
  }else check(a.native_1m_count===0&&a.source===null,"Fausse archive signalée");
 }
 check(have===fed.archived_assets&&binCount===fed.binance_archived_assets&&
  altCount===fed.bitget_archived_assets&&total===fed.native_1m_candles,
  "Comptage fédéré incohérent");
 check(depth.assets_with_at_least_12_consecutive_closed_months<=binCount&&
  depth.assets_with_at_least_24_consecutive_closed_months<=
  depth.assets_with_at_least_12_consecutive_closed_months,
  "Indice annuel incohérent");
}
function show(){
 if(!catalog)return;
 const limit=Number($("top250-limit").value),query=$("top250-search").value.trim().toLowerCase();
 const only=$("top250-available").checked;
 const rows=catalog.assets.filter(a=>a.rank<=limit&&(!only||a.months>0||(a.id==="whitebit"&&privateWBT))&&
   (!query||[a.id,a.symbol,a.name,String(a.rank)].some(x=>x.toLowerCase().includes(query))));
 const frag=document.createDocumentFragment(),altMap=new Map(bitget.assets.map(a=>[a.id,a]));
 for(const a of rows){
  const row=document.createElement("tr"),source=binance.assets[a.rank-1];
  const wbt=a.id==="whitebit"&&privateWBT?.asset_id==="whitebit";
  cell(row,a.rank);cell(row,a.name+" · "+a.symbol);
  cell(row,a.months?(source.months.length?"Binance Spot":"Bitget Spot"):wbt?"WhiteBIT Spot · privé vérifié":"À collecter");
  cell(row,wbt?"—":a.months);
  cell(row,wbt?privateWBT.candle_rows.toLocaleString("fr-FR")+" (privé)":a.native_1m_count.toLocaleString("fr-FR"));
  const b=altMap.get(a.id);
  cell(row,source.months[0]?.month??b?.months?.[0]??(wbt?privateWBT.first_open_utc.slice(0,10):"—"));
  const last=cell(row,wbt?privateWBT.last_open_utc.slice(0,10)+" · privé":"—");
  let tag=null,label=null;
  if(source.months.length){
   const item=source.months.at(-1);tag=item.release;label=item.month+" · ZIP";
  }else if(b){
   tag=b.release;label=b.month+" · ZIP";
  }
  if(tag&&/^crypto-spot-(?:bulk|bitget)-[a-zA-Z0-9-]+$/.test(tag)){
   const aLink=document.createElement("a");
   aLink.href="https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/"+encodeURIComponent(tag);
   aLink.textContent=label;aLink.rel="noopener noreferrer";aLink.target="_blank";
   last.replaceChildren(aLink);
  }
  const action=cell(row,"");
  if(a.months){
   const btn=document.createElement("button");btn.type="button";
   btn.textContent="Voir les bougies";btn.className="vault-select";
   btn.setAttribute("aria-label","Consulter les bougies de "+a.name);
   btn.addEventListener("click",()=>document.dispatchEvent(new CustomEvent(
    "seven-vault-select",{detail:{id:a.id}})));
   action.append(btn);
  }else if(wbt){
   const aLink=document.createElement("a");aLink.href="#wbt-private-proof";
   aLink.textContent="Statut privé";action.append(aLink);
  }else action.textContent="—";
  frag.append(row);
 }
 $("top250-rows").replaceChildren(frag);
 $("top250-listed").textContent=rows.length+" actifs affichés · Binance / Bitget : archives publiques · WBT : preuve privée distincte, non consultable en ligne · pas de cours live";
}

function validatePrivateWbt(v){
 check(v?.schema==="seven.crypto.wbt.private-evidence.status.v1"&&
  v.asset_id==="whitebit"&&v.symbol==="WBT"&&v.venue==="WhiteBIT Spot"&&
  v.market==="WBT_USDT"&&v.quote==="USDT"&&v.resolution==="1m"&&
  v.publication_status==="SUMMARY_METADATA_ONLY_SOURCE_CANDLES_NOT_PUBLISHED"&&
  v.not_live===true&&v.trader_imported===false,"Preuve WBT privée non conforme");
 check(Number.isInteger(v.candle_rows)&&v.candle_rows>0&&
  Number.isInteger(v.represented_days)&&v.represented_days>0&&
  v.partial_first_day_rows===601&&
  v.full_days+1===v.represented_days&&
  v.years?.reduce((sum,a)=>sum+a.days,0)===v.represented_days&&
  v.years?.reduce((sum,a)=>sum+a.rows,0)===v.candle_rows,
  "Comptage WBT privé non conforme");
 check(v.first_open_utc==="2022-08-25T13:59:00Z"&&
  v.last_open_utc==="2026-10-11T23:59:00Z"&&
  /^[a-f0-9]{64}$/.test(v.private_manifest_sha256),
  "Provenance WBT privée incorrecte");
}
function showPrivateWbt(){
 const host=$("wbt-private-metrics"),status=$("wbt-private-status");
 if(!host||!status||!privateWBT)return;
 const v=privateWBT,frag=document.createDocumentFragment();
 for(const [label,value] of [
  ["Bougies originales 1m",v.candle_rows.toLocaleString("fr-FR")],
  ["Journées représentées",v.represented_days.toLocaleString("fr-FR")],
  ["Première bougie UTC","25/08/2022 · 13:59"],
  ["Dernière archive UTC","11/10/2026"],
  ["Minutes manquantes observées",String(v.internal_missing_minute_slots)],
  ["Disponibilité","Privé · hors GitHub"]
 ])frag.append(metric(label,value));
 host.replaceChildren(frag);
 status.textContent="Métadonnées publiques uniquement · source WhiteBIT Spot WBT/USDT vérifiée sur fichiers privés · aucun prix publié, aucune lecture Trader.";
}
async function init(){
 const status=$("top250-status");status.textContent="Contrôle des index fédérés…";
 try{
  const [fed,bin,alt,depth]=await Promise.all([
   getJson("top250_multisource_coverage/index.json",300000),
   getJson("top250_history_catalog/index.json"),
   getJson("bitget_verified_views/index.json",150000),
   getJson("year_depth_index.json",1200000)
  ]);
  validate(fed,bin,alt,depth);catalog=fed;binance=bin;bitget=alt;yearDepth=depth;
  $("top250-title").textContent="Coffre Top 250 · Binance + Bitget ("+fed.archived_assets+"/250 archivés)";
  const frag=document.createDocumentFragment();
  for(const [label,value] of [
   ["Univers classé","250"],["Au moins un mois",fed.archived_assets+"/250"],
   ["≥ 12 mois vérifiés (Binance)",String(depth.assets_with_at_least_12_consecutive_closed_months)],
   ["≥ 24 mois vérifiés (Binance)",String(depth.assets_with_at_least_24_consecutive_closed_months)],
   ["Sources Binance / Bitget",fed.binance_archived_assets+" / "+fed.bitget_archived_assets],
   ["Bougies 1 min",fed.native_1m_candles.toLocaleString("fr-FR")]
  ])frag.append(metric(label,value));
  $("top250-summary").replaceChildren(frag);
  $("top250-counts").textContent=fed.groups.map(x=>"Top "+x.top+" : "+x.archived+"/"+x.top).join(" · ")+
   " · les actifs avec une année vérifiée sont mesurés séparément";
  status.textContent="Catalogue fédéré vérifié · une source par crypto · aucun prix inventé"+(depth.archive_assets<fed.binance_archived_assets?" · index annuel en synchronisation ("+depth.archive_assets+"/"+fed.binance_archived_assets+")":"");
  show();
  void getJson("wbt_private_status.json",12000).then(v=>{
   validatePrivateWbt(v);privateWBT=v;showPrivateWbt();show();
  }).catch(e=>{
   const target=$("wbt-private-status");
   if(target)target.textContent="Fiche WBT non chargée : "+String(e?.message||e);
  });
 }catch(e){
  $("top250-title").textContent="Coffre Top 250 · catalogue fédéré indisponible";
  status.textContent="Vérification refusée : "+String(e?.message||e);
 }
}
for(const key of ["top250-limit","top250-search","top250-available"])
 $(key)?.addEventListener(key==="top250-search"?"input":"change",show);
void init();
window.SevenTop250Catalog=Object.freeze({read:()=>catalog});
})();