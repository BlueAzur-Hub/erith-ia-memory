/* Seven Heaven · Shared read-only OHLCV reader for the verified historical vault.
 * One common Top250 catalog, one monthly projection per genuinely archived asset.
 * No network on period changes. Never trades, writes IndexedDB, or changes Trader.
 */
(() => {
"use strict";
const base=new URL("../../data/historical_archive_prototype/shared_monthly_views/",document.currentScript.src);
const bitgetBase=new URL("../../data/historical_archive_prototype/bitget_verified_views/",document.currentScript.src);
const periods={"24h":["1m",1440],"7j":["5m",2016],"30j":["5m",8640],
               "mois":["1h",null]};
const intervalMs={"1m":60000,"5m":300000,"1h":3600000};
const byId=id=>document.getElementById(id);
const need=(ok,msg)=>{if(!ok)throw Error(msg)};
let index=null,loadingIndex=null,bitgetIndex=null,bitgetLoading=null,seq=0;
const cache=new Map(),inflight=new Map();
const sha256=raw=>crypto.subtle.digest("SHA-256",raw).then(h=>
 Array.from(new Uint8Array(h),x=>x.toString(16).padStart(2,"0")).join(""));
async function fetchAsset(name,cap){
 need(/^(?:index\.json|[a-z0-9-]{1,90}\.json\.gz)$/.test(name),"Archive non autorisée");
 const u=new URL(name,base);
 need(u.origin===location.origin&&u.pathname.startsWith(base.pathname),"Origine interdite");
 const r=await fetch(u.href,{cache:"no-store",credentials:"omit",redirect:"error"});
 need(r.ok,"HTTP "+r.status+" : "+name);
 const bytes=await r.arrayBuffer();
 need(bytes.byteLength>0&&bytes.byteLength<=cap,"Taille d'archive inattendue");
 return bytes;
}
function validateIndex(j){
 need(j?.schema==="aerith.public.ohlcv.shared.monthly-index.v1"&&
      j.quote==="USDT"&&j.scope==="latest_verified_closed_month"&&
      j.source==="Binance Spot official monthly 1m ZIPs"&&
      j.is_live===false&&j.max_is_all_time===false&&
      Number.isInteger(j.archived_assets)&&j.archived_assets>0&&
      j.archived_assets<=250&&j.assets?.length===j.archived_assets,
      "Contrat d'index historique incorrect");
 const seen=new Set();
 for(const a of j.assets){
  need(/^[a-z0-9-]{1,90}$/.test(a.id)&&!seen.has(a.id)&&
       /^[A-Z0-9]{2,22}USDT$/.test(a.pair)&&
       /^\d{4}-(0[1-9]|1[0-2])$/.test(a.month)&&
       a.file===a.id+".json.gz"&&
       /^[a-f0-9]{64}$/.test(a.sha256)&&
       /^[a-f0-9]{64}$/.test(a.source_zip_sha256)&&
       Number.isInteger(a.bytes)&&a.bytes>0&&a.bytes<=2000000&&
       Number.isInteger(a.native_1m_count)&&
       a.native_1m_count>=40320&&a.native_1m_count<=44640&&
       a.release.startsWith("crypto-spot-bulk-")&&
       a.series_counts?.["1m"]===1440&&
       a.series_counts?.["5m"]>=8064&&
       [672,696,720,744].includes(a.series_counts?.["1h"]),
       "Index d'actif non qualifié");
  seen.add(a.id);
 }
}
async function getIndex(){
 if(index)return index;
 if(!loadingIndex)loadingIndex=(async()=>{
  need(crypto?.subtle&&typeof DecompressionStream==="function",
       "Firefox doit supporter HTTPS, SHA-256 et gzip");
  const raw=await fetchAsset("index.json",150000);
  const j=JSON.parse(new TextDecoder().decode(raw));
  validateIndex(j);
  return index=j;
 })().catch(e=>{loadingIndex=null;throw e});
 return loadingIndex;
}

async function getBitgetIndex(){
 if(bitgetIndex)return bitgetIndex;
 if(!bitgetLoading)bitgetLoading=(async()=>{
  need(crypto?.subtle&&typeof DecompressionStream==="function","Contrôle Bitget impossible");
  const r=await fetch(new URL("index.json",bitgetBase),{cache:"no-store",credentials:"omit",redirect:"error"});
  need(r.ok,"Index Bitget HTTP "+r.status);
  const text=await r.text();
  need(text.length>0&&text.length<150000,"Index Bitget trop volumineux");
  const j=JSON.parse(text);
  need(j.schema==="aerith.public.ohlcv.verified-bitget-spot-month-views.v1"&&
   j.quote==="USDT"&&j.trade_count_available===false&&j.not_exchange_signed===true&&
   j.source==="Bitget Spot public native 1m API"&&
   j.assets?.length===j.archived_assets,"Index Bitget incorrect");
  const seen=new Set();
  for(const a of j.assets){
   need(/^[a-z0-9-]{2,100}$/.test(a.id)&&!seen.has(a.id)&&
    a.file===a.id+"-bitget-month.json.gz"&&
    /^[A-Z0-9]{2,30}USDT$/.test(a.pair)&&
    /^\d{4}-(?:0[1-9]|1[0-2])$/.test(a.month)&&
    Array.isArray(a.months)&&a.months.includes(a.month)&&
    /^crypto-spot-bitget-\d{4}-(?:0[1-9]|1[0-2])-1m-[a-z0-9-]+$/.test(a.release)&&
    a.release.endsWith("-"+a.id)&&
    /^[a-f0-9]{64}$/.test(a.sha256)&&
    /^[a-f0-9]{64}$/.test(a.source_zip_sha256)&&
    Number.isInteger(a.bytes)&&a.bytes>0&&a.bytes<=2000000&&
    a.series_counts?.["1m"]===1440&&
    [672,696,720,744].includes(a.series_counts?.["1h"])&&
    Number.isInteger(a.native_1m_count)&&
    Number.isInteger(a.total_verified_1m_count)&&
    a.total_verified_1m_count>=a.native_1m_count,
    "Identité ou intégrité Bitget incorrecte");
   seen.add(a.id);
  }
  return bitgetIndex=j;
 })().catch(e=>{bitgetLoading=null;throw e});
 return bitgetLoading;
}
function verifyBitget(data,m){
 need(data.schema==="aerith.public.ohlcv.verified-bitget-spot-month.v1"&&
  data.asset_id===m.id&&data.pair===m.pair&&data.month===m.month&&
  data.quote==="USDT"&&data.source==="Bitget Spot public native 1m API"&&
  data.is_live===false&&data.not_exchange_signed===true&&
  data.trade_count_available===false&&
  data.native_columns?.join(",")==="open_time_ms,open,high,low,close,base_volume,quote_turnover"&&
  data.source_release===m.release&&data.source_zip_sha256===m.source_zip_sha256&&
  data.native_1m_count===m.native_1m_count&&
  data.first_open_ms===m.first_open_ms&&data.last_open_ms===m.last_open_ms,
  "Provenance native Bitget incorrecte");
 for(const [interval,count] of Object.entries(m.series_counts)){
  need(Object.hasOwn(intervalMs,interval),"Intervalle Bitget inconnu");
  const series=data.series?.[interval],step=intervalMs[interval];
  need(Array.isArray(series)&&series.length===count,"Série Bitget incomplète");
  let previous=null;
  for(const row of series){
   need(Array.isArray(row)&&row.length===7&&row.every(Number.isFinite),
    "Bitget utilise sept champs natifs");
   const [ts,o,h,l,c,volume,quote]=row;
   need(Number.isInteger(ts)&&ts%step===0&&(previous===null||ts===previous+step)&&
    l>0&&l<=Math.min(o,c)&&Math.max(o,c)<=h&&volume>=0&&quote>=0,
    "Continuité ou OHLCV Bitget incohérents");
   previous=ts;
  }
  need(previous===Math.floor(m.last_open_ms/step)*step,"Fin de série Bitget incohérente");
 }
}
async function loadBitget(id){
 const cached=cache.get(id);if(cached)return cached;
 if(inflight.has(id))return inflight.get(id);
 const job=(async()=>{
  const metadata=(await getBitgetIndex()).assets.find(a=>a.id===id);
  need(!!metadata,"Cette crypto Bitget n'est pas archivée");
  const url=new URL(metadata.file,bitgetBase);
  need(url.origin===location.origin&&url.pathname.startsWith(bitgetBase.pathname),"Origine Bitget interdite");
  const response=await fetch(url.href,{cache:"no-store",credentials:"omit",redirect:"error"});
  need(response.ok,"Archive Bitget HTTP "+response.status);
  const compressed=await response.arrayBuffer();
  need(compressed.byteLength===metadata.bytes&&
       await sha256(compressed)===metadata.sha256,"SHA-256 Bitget incorrect");
  const plain=await new Response(new Blob([compressed]).stream().pipeThrough(
     new DecompressionStream("gzip"))).text();
  need(plain.length<7500000,"Archive Bitget décompressée trop grande");
  const data=JSON.parse(plain);
  verifyBitget(data,metadata);
  const item={data,metadata:{...metadata,source:"Bitget Spot",months:metadata.months.length}};
  cache.set(id,item);if(cache.size>3)cache.delete(cache.keys().next().value);
  return item;
 })().finally(()=>inflight.delete(id));
 inflight.set(id,job);
 return job;
}

function validateData(obj,m){
 need(obj?.schema==="aerith.public.ohlcv.shared.monthly-projection.v1"&&
      obj.asset_id===m.id&&obj.pair===m.pair&&obj.month===m.month&&
      obj.quote==="USDT"&&obj.source==="Binance Spot official monthly 1m ZIP"&&
      obj.source_release===m.release&&obj.source_zip_sha256===m.source_zip_sha256&&
      obj.scope==="latest_verified_closed_month"&&
      obj.is_live===false&&obj.max_is_all_time===false&&
      obj.native_1m_count===m.native_1m_count&&
      obj.first_open_ms===m.first_open_ms&&obj.last_open_ms===m.last_open_ms&&
      obj.columns?.join(",")==="open_time_ms,open,high,low,close,base_volume,quote_volume,trade_count",
      "Provenance ou devise non qualifiée");
 for(const [interval,expected]of Object.entries(m.series_counts)){
  need(Object.hasOwn(intervalMs,interval),"Résolution inconnue");
  const rows=obj.series?.[interval],step=intervalMs[interval];
  need(Array.isArray(rows)&&rows.length===expected,"Couverture de période incohérente");
  let previous=null;
  for(const row of rows){
   need(Array.isArray(row)&&row.length===8&&row.every(Number.isFinite),
        "Bougie altérée");
   const [t,o,h,l,c,v,q,n]=row;
   need(Number.isInteger(t)&&t%step===0&&
        (previous===null||t===previous+step)&&
        l>0&&l<=Math.min(o,c)&&Math.max(o,c)<=h&&
        v>=0&&q>=0&&Number.isInteger(n)&&n>=0,
        "Prix, volume, horodatage ou continuité invalide");
   previous=t;
  }
  need(previous===Math.floor(m.last_open_ms/step)*step,
       "Dernière bougie incohérente");
 }
}
async function loadOne(id){
 if(cache.has(id)){const x=cache.get(id);cache.delete(id);cache.set(id,x);return x}
 if(inflight.has(id))return inflight.get(id);
 const work=(async()=>{
   const metadata=(await getIndex()).assets.find(a=>a.id===id);
   need(!!metadata,"Cryptomonnaie non archivée");
   const compressed=await fetchAsset(metadata.file,2000000);
   need(compressed.byteLength===metadata.bytes&&
        await sha256(compressed)===metadata.sha256,
        "Empreinte SHA-256 de la projection incorrecte");
   const plain=await new Response(new Blob([compressed]).stream().pipeThrough(
      new DecompressionStream("gzip"))).text();
   need(new TextEncoder().encode(plain).byteLength<=7500000,
        "Données décompressées trop volumineuses");
   const data=JSON.parse(plain);
   validateData(data,metadata);
   cache.set(id,{data,metadata});
   if(cache.size>3)cache.delete(cache.keys().next().value);
   return {data,metadata};
 })().finally(()=>inflight.delete(id));
 inflight.set(id,work);
 return work;
}
function selectPeriod(archive,period){
 need(Object.hasOwn(periods,period),"Période inconnue");
 const [interval,size]=periods[period],all=archive.data.series[interval];
 const rows=size===null?all:all.slice(-size);
 need(size===null||rows.length===size,
      "Cette archive ne contient pas "+period+" complets (aucune bougie inventée)");
 need(rows.length>0,"Période absente");
 return {rows,interval,pair:archive.data.pair,quote:"USDT",
  asset_id:archive.data.asset_id,month:archive.data.month,
  isLive:false,maxIsAllTime:false};
}
function format(t){return new Date(t).toLocaleString("fr-FR",{timeZone:"UTC"})+" UTC"}
function chart(rows){
 const node=byId("shared-curve"),ctx=node.getContext("2d");
 const w=node.width,h=node.height;
 ctx.fillStyle="#0b1a29";ctx.fillRect(0,0,w,h);
 const step=Math.max(1,Math.ceil(rows.length/(w-28)));
 const values=[];
 for(let n=0;n<rows.length;n+=step)values.push(rows[n][4]);
 if(values.at(-1)!==rows.at(-1)[4])values.push(rows.at(-1)[4]);
 const low=Math.min(...values),high=Math.max(...values),range=high-low||1;
 ctx.beginPath();ctx.lineWidth=1.5;ctx.strokeStyle="#79d8eb";
 values.forEach((p,i)=>{
  const x=12+i*(w-24)/Math.max(1,values.length-1),y=12+(high-p)*(h-24)/range;
  if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);
 });
 ctx.stroke();
}
function display(view,metadata){
 chart(view.rows);
 byId("shared-status").textContent="Vérifié · "+view.pair+" · "+view.rows.length.toLocaleString("fr-FR")+
   " bougies "+view.interval+" · périodes suivantes lues sans téléchargement";
 byId("shared-source").textContent=(metadata.source==="Bitget Spot"?"Bitget Spot (7 champs natifs, sans transactions)":"Binance Spot")+" · "+view.quote+" · mois "+metadata.month+
   " · "+format(view.rows[0][0])+" → "+format(view.rows.at(-1)[0])+
   " · source native : "+metadata.native_1m_count.toLocaleString("fr-FR")+
   " bougies 1m"+(metadata.months?" · "+metadata.months+" mois validés":"")+
   " · pas de temps réel · Max = historique contigu archivé, pas historique total";
 const node=byId("shared-table"),head=document.createElement("tr");
 for(const title of ["UTC","Ouverture","Haut","Bas","Clôture","Volume base"]){
  const th=document.createElement("th");th.textContent=title;head.append(th);
 }
 node.replaceChildren(head);
 for(const r of view.rows.slice(-8)){
  const tr=document.createElement("tr");
  for(const v of [format(r[0]),r[1],r[2],r[3],r[4],r[5]]){
   const td=document.createElement("td");td.textContent=String(v);tr.append(td);
  }
  node.append(tr);
 }
}
async function show(){
 const ticket=++seq,button=byId("shared-read");
 const id=byId("shared-asset").value,period=byId("shared-period").value;
 button.disabled=true;
 byId("shared-status").textContent="Lecture de l'archive vérifiée…";
 byId("shared-table").replaceChildren();
 const canvas=byId("shared-curve");
 canvas.getContext("2d").clearRect(0,0,canvas.width,canvas.height);
 try{
  const extra=Object.hasOwn({"60j":1,"90j":1,"1an":1,"Max":1},period);
  const alternative=(await getBitgetIndex()).assets.some(a=>a.id===id);
  if(alternative&&extra)throw Error("Bitget : 60j/90j/1an/Max non matérialisés ; choisir 24h, 7j, 30j ou Mois source.");
  const archive=alternative?await loadBitget(id):extra
    ? await window.SevenHourlyHistory.loadOne(id)
    : await loadOne(id);
  const selection=extra
    ? window.SevenHourlyHistory.selectPeriod(archive,period)
    : selectPeriod(archive,period);
  if(ticket===seq)display(selection,archive.metadata);
 }catch(e){
  if(ticket===seq){
   byId("shared-status").textContent="Lecture refusée : "+String(e?.message||e);
   byId("shared-table").replaceChildren();
  }
 }finally{if(ticket===seq)button.disabled=false}
}
async function init(){
 try{
  const x=await getIndex();
  let alt={assets:[]},warning="";
  try{alt=await getBitgetIndex()}catch(e){warning=" · Bitget indisponible : "+String(e?.message||e)}
  const select=byId("shared-asset");select.replaceChildren();
  for(const a of [...x.assets,...alt.assets].sort((a,b)=>a.rank-b.rank)){
   const option=document.createElement("option");
   option.value=a.id;option.textContent="#"+a.rank+" · "+a.name+" ("+a.pair+")";
   select.append(option);
  }
  byId("shared-status").textContent=(x.archived_assets+alt.assets.length)+
   " cryptos disponibles · dernier mois vérifié · lecture sur demande"+warning;
  byId("shared-read").disabled=false;
 }catch(e){
  byId("shared-status").textContent="Index indisponible : "+String(e?.message||e);
 }
}
byId("shared-read")?.addEventListener("click",()=>void show());
byId("shared-period")?.addEventListener("change",()=>{
 if(Object.hasOwn({"60j":1,"90j":1,"1an":1,"Max":1},byId("shared-period").value) ||
    cache.has(byId("shared-asset").value))void show();
});
byId("shared-asset")?.addEventListener("change",()=>{
 byId("shared-status").textContent="Actif sélectionné · cliquer pour lire le mois archivé";
});
document.addEventListener("seven-vault-select",event=>{
 const id=event.detail?.id,select=byId("shared-asset");
 if(![...select.options].some(option=>option.value===id)){
  byId("shared-status").textContent="Archive non disponible pour "+String(id);
  return;
 }
 select.value=id;
 byId("shared-month-reader").open=true;
 void show();
 byId("shared-month-reader").scrollIntoView({behavior:"smooth",block:"start"});
});
byId("shared-read").disabled=true;
void init();
window.SevenSharedHistory=Object.freeze({index:getIndex,loadOne,loadBitget,selectPeriod});
})();