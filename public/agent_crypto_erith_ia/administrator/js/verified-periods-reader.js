/* Seven Heaven — seven certified historical windows, in the ONE existing Coffre.
 * Uses GitHub Pages only; no Trader/Interface/IndexedDB writes and no live prices.
 * Distinct Binance Spot USDT OHLCV. Max is materialized history, not all-time.
 */
(() => {
"use strict";
const root=new URL("../../data/historical_archive_prototype/verified_periods/",document.currentScript.src);
const pairs=Object.freeze({bitcoin:"BTCUSDT",ethereum:"ETHUSDT",binancecoin:"BNBUSDT",ripple:"XRPUSDT",solana:"SOLUSDT"});
const windows=Object.freeze({"24h":["1m",1440],"7j":["5m",2016],"30j":["1h",720],
  "60j":["1h",1440],"90j":["1h",2160],"1an":["1d",365],"Max":["1d",null]});
const steps=Object.freeze({"1m":60000,"5m":300000,"1h":3600000,"1d":86400000});
const cols="open_time_ms,open,high,low,close,base_volume,quote_volume,trade_count";
const shaPattern=/^[a-f0-9]{64}$/;
const need=(v,s)=>{if(!v)throw Error(s)};
let index=null,pendingIndex=null;
const cache=new Map(),pending=new Map();

async function digest(raw){
 const hash=await crypto.subtle.digest("SHA-256",raw);
 return Array.from(new Uint8Array(hash),c=>c.toString(16).padStart(2,"0")).join("");
}
async function read(filename,cap){
 need(filename==="index.json"||
   /^(?:bitcoin|ethereum|binancecoin|ripple|solana)-(?:24h|7j|30j|60j|90j|1an|Max)\.json\.gz$/.test(filename),
   "Fichier historique non autorisé");
 const url=new URL(filename,root);
 need(url.origin===location.origin&&url.pathname.startsWith(root.pathname),"Source hors du Coffre");
 const reply=await fetch(url.href,{credentials:"omit",redirect:"error",cache:"no-store"});
 need(reply.ok,"Archive HTTP "+reply.status+" : "+filename);
 const raw=await reply.arrayBuffer();
 need(raw.byteLength>0&&raw.byteLength<=cap,"Taille d'archive invalide");
 return raw;
}
function validIndex(j){
 need(j?.schema==="seven.crypto.verified-period-index"&&
   j.quote==="USDT"&&j.is_live===false&&j.is_all_time===false&&
   j.source==="Binance Spot native verified 1m ZIPs"&&
   j.core_assets===5&&j.periods_per_asset===7&&j.assets?.length===5,
   "Catalogue Top 5 non certifié");
 const seen=new Set();
 for(const a of j.assets){
  need(Object.hasOwn(pairs,a.id)&&!seen.has(a.id)&&
    a.pair===pairs[a.id]&&a.quote==="USDT"&&
    a.verified_closed_months===12&&a.verified_native_minutes===525600&&
    a.first_month==="2025-10"&&a.last_month==="2026-09"&&
    a.max_scope==="materialized_calendar_year_shards_not_all_time"&&
    a.periods?.length===7,"Identité historique ou couverture incorrecte");
  seen.add(a.id);
  const periods=new Set();
  for(const p of a.periods){
   const wanted=windows[p.period];
   need(wanted&&!periods.has(p.period)&&
     p.file===a.id+"-"+p.period+".json.gz"&&p.resolution===wanted[0]&&
     (wanted[1]===null?p.bars>=365:p.bars===wanted[1])&&
     Number.isInteger(p.start_ms)&&Number.isInteger(p.end_exclusive_ms)&&
     p.end_exclusive_ms>p.start_ms&&p.end_exclusive_ms===Date.UTC(2026,9,1)&&
     Number.isInteger(p.bytes)&&p.bytes>0&&p.bytes<=200000&&
     shaPattern.test(p.sha256)&&Number.isInteger(p.gaps)&&p.gaps>=0&&
     (p.period==="Max"||p.gaps===0)&&
     Array.isArray(p.source_projections)&&p.source_projections.length>0&&
     p.source_projections.every(s=>shaPattern.test(s)),
     "Manifeste de période incorrect");
   periods.add(p.period);
  }
 }
 need(seen.size===5,"Univers pilote incomplet");
 return j;
}
async function getIndex(){
 if(index)return index;
 if(!pendingIndex)pendingIndex=(async()=>{
   need(crypto?.subtle&&typeof DecompressionStream==="function",
     "Firefox doit prendre en charge HTTPS, SHA-256 et gzip");
   const raw=await read("index.json",250000);
   return index=validIndex(JSON.parse(new TextDecoder().decode(raw)));
 })().catch(err=>{pendingIndex=null;throw err});
 return pendingIndex;
}
function listGaps(rows,ms){
 const gaps=[];
 for(let i=1;i<rows.length;i++){
  if(rows[i][0]!==rows[i-1][0]+ms)gaps.push({
    start_ms:rows[i-1][0]+ms,end_exclusive_ms:rows[i][0],
    missing_bars:(rows[i][0]-rows[i-1][0])/ms-1
  });
 }
 return gaps;
}
function validate(obj,meta,a){
 const [resolution,n]=windows[meta.period],step=steps[resolution];
 need(obj?.schema==="seven.crypto.verified-period-projection"&&
    obj.asset_id===a.id&&obj.pair===a.pair&&
    obj.quote==="USDT"&&obj.is_live===false&&obj.is_all_time===false&&
    obj.period===meta.period&&obj.resolution===resolution&&
    obj.columns?.join(",")===cols&&
    obj.start_ms===meta.start_ms&&
    obj.end_exclusive_ms===meta.end_exclusive_ms&&
    obj.last_source_month==="2026-09"&&
    obj.source==="Binance Spot original checked 1m monthly ZIP"&&
    obj.scope===(meta.period==="Max"?"materialized_verified_history":
                "last_verified_closed_archive_window")&&
    Array.isArray(obj.native_source_months)&&obj.native_source_months.length>=12&&
    Array.isArray(obj.source_projection_sha256)&&
    obj.source_projection_sha256.join(",")===meta.source_projections.join(","),
    "Provenance ou période non conforme");
 const rows=obj.rows;
 need(Array.isArray(rows)&&rows.length===meta.bars&&
   (n===null||rows.length===n)&&
   rows[0]?.[0]===meta.start_ms&&
   rows.at(-1)?.[0]+step===meta.end_exclusive_ms,
   "Bougies ou bornes UTC absentes");
 let last=null;
 for(const r of rows){
  need(Array.isArray(r)&&r.length===8&&r.every(Number.isFinite),
      "Bougie OHLCV non numérique");
  const [t,o,h,l,c,base,quote,trades]=r;
  need(Number.isInteger(t)&&t%step===0&&
    (last===null||t>last)&&
    (meta.period==="Max"||last===null||t===last+step)&&
    l>0&&l<=Math.min(o,c)&&Math.max(o,c)<=h&&
    base>=0&&quote>=0&&Number.isInteger(trades)&&trades>=0,
    "Valeur, volume, transaction ou chronologie invalide");
  last=t;
 }
 const found=listGaps(rows,step);
 need(JSON.stringify(obj.gaps)===JSON.stringify(found)&&found.length===meta.gaps,
   "Lacunes Max absentes ou différentes du registre");
 return {data:obj,metadata:{...a,...meta,month:a.last_month,
  native_1m_count:a.verified_native_minutes,source:"Binance Spot vérifié",
  scope:"certified-core5"},rows};
}
function isPilot(id){return Object.hasOwn(pairs,id)}
async function load(id,period){
 need(isPilot(id)&&Object.hasOwn(windows,period),"Actif ou période non certifiés Top 5");
 const key=id+"/"+period;
 if(cache.has(key)){
  const hit=cache.get(key);cache.delete(key);cache.set(key,hit);return hit;
 }
 if(pending.has(key))return pending.get(key);
 const work=(async()=>{
  const a=(await getIndex()).assets.find(x=>x.id===id);
  need(!!a,"Identité non indexée");
  const meta=a.periods.find(x=>x.period===period);
  need(!!meta,"Période non publiée");
  const compressed=await read(meta.file,200000);
  need(compressed.byteLength===meta.bytes&&await digest(compressed)===meta.sha256,
       "Empreinte SHA-256 du Coffre incorrecte");
  const plain=await new Response(new Blob([compressed]).stream()
            .pipeThrough(new DecompressionStream("gzip"))).text();
  need(new TextEncoder().encode(plain).byteLength<=8000000,
       "Projection décompressée trop grande");
  const result=validate(JSON.parse(plain),meta,a);
  cache.set(key,result);
  if(cache.size>8)cache.delete(cache.keys().next().value);
  return result;
 })().finally(()=>pending.delete(key));
 pending.set(key,work);return work;
}
window.SevenVerifiedPeriods=Object.freeze({index:getIndex,load,isPilot,windows});
})();
