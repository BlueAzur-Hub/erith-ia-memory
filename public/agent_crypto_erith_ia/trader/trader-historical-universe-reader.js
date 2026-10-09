/* Seven Heaven · Trader-only historical universe reader. Immutable public blocks; no storage or trading. */
(()=>{"use strict";
const ROOT=new URL("../data/historical_archive_prototype/universe/",document.currentScript.src);
const INDEX="aerith.public.ohlcv.spot.universe.index.v1";
const BLOCK="aerith.public.ohlcv.spot.universe.block.v1";
const SPECS={"24h":[300000,"5m",288],"7d":[3600000,"1h",168],"30d":[14400000,"4h",180]};
let pending=null;
function need(condition,reason){if(!condition)throw Error(reason);}
const finite=v=>typeof v==="number"&&Number.isFinite(v);
async function download(path){
 need(path==="index.json"||/^blocks\/[a-z0-9-]+_(24h|7d|30d)_[a-f0-9]{16}\.json\.gz$/.test(path),
      "Chemin Universe refusé");
 const url=new URL(path,ROOT);
 need(url.origin===location.origin&&url.pathname.startsWith(ROOT.pathname),"Origine Universe interdite");
 const response=await fetch(url.href,{credentials:"omit",cache:"no-store",redirect:"error"});
 need(response.ok,"Archive Universe HTTP "+response.status);
 const raw=await response.arrayBuffer();
 need(raw.byteLength>0&&raw.byteLength<=2000000,"Bloc Universe trop volumineux");
 return raw;
}
async function catalog(){
 if(!pending)pending=(async()=>{
  const index=JSON.parse(new TextDecoder().decode(await download("index.json")));
  need(index.schema===INDEX&&index.quote==="USDT"&&index.source==="Binance Spot REST /api/v3/klines"&&
   index.publication==="MANUAL_BOUNDED_PILOT_NOT_LIVE","Index Universe non qualifié");
  need(Number.isInteger(index.universe_size)&&index.universe_size>0&&index.universe_size<=250&&
   Array.isArray(index.assets)&&index.assets.length===index.universe_size,"Univers incohérent");
  need(/^[a-f0-9]{64}$/.test(index.registry_sha256)&&
   /^[a-f0-9]{64}$/.test(index.market?.sha256||""),"Provenance Universe absente");
  need(Array.isArray(index.blocks)&&Number.isInteger(index.verified_series)&&
   index.blocks.length===index.verified_series&&index.blocks.length>0,"Séries Universe incohérentes");
  need(Number.isInteger(index.snapshot_end_ms)&&index.snapshot_end_ms>0,
       "Horodatage de collecte invalide");
  const approvals=new Map();
  for(const asset of index.assets){
   need(/^[a-z0-9-]{2,100}$/.test(asset.id)&&
     /^[A-Z0-9]{2,22}$/.test(asset.symbol),"Identité d'actif invalide");
   if(asset.qualification==="qualified_spot"){
    need(asset.candidate_pair===asset.symbol+"USDT","Paire non qualifiée");
    approvals.set(asset.id,asset.candidate_pair);
   }
  }
  const seen=new Set();
  let total=0;
  for(const block of index.blocks){
   const spec=SPECS[block.period],key=block.asset_id+"|"+block.period;
   need(!seen.has(key)&&spec&&approvals.get(block.asset_id)===block.pair,
        "Série Universe non qualifiée ou dupliquée");
   seen.add(key);
   need(block.interval===spec[1]&&block.candles===spec[2]&&
       Number.isInteger(block.first_ms)&&Number.isInteger(block.last_ms)&&
       block.last_ms===block.first_ms+(block.candles-1)*spec[0]&&
       block.first_ms%spec[0]===0&&block.last_ms<index.snapshot_end_ms,
       "Couverture Universe incohérente");
   need(/^[a-f0-9]{64}$/.test(block.sha256)&&
       block.file==="blocks/"+block.asset_id+"_"+block.period+"_"+block.sha256.slice(0,16)+".json.gz",
       "Identité SHA-256 Universe invalide");
   total+=block.candles;
  }
  need(total===index.verified_candles,"Comptage Universe incorrect");
  return index;
 })().catch(e=>{pending=null;throw e;});
 return pending;
}
async function listCoverage(){
 const c=await catalog();
 return{snapshot:true,quote:c.quote,source:"Binance Spot",archiveFamily:"universe",
  updatedAt:new Date(c.snapshot_end_ms).toISOString(),
  coverage:c.blocks.map(b=>({id:b.asset_id,pair:b.pair,period:b.period,interval:b.interval,
                            candles:b.candles,first_open_ms:b.first_ms,last_open_ms:b.last_ms}))};
}
function refreshIndex(){pending=null;return listCoverage();}
async function readSeries({assetId,period}){
 need(typeof assetId==="string"&&Object.hasOwn(SPECS,period),"Sélection Universe invalide");
 const c=await catalog(),entry=c.blocks.find(b=>b.asset_id===assetId&&b.period===period);
 need(entry,"Archive Universe absente");
 const compressed=await download(entry.file);
 const digest=await crypto.subtle.digest("SHA-256",compressed);
 const hex=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("");
 need(hex===entry.sha256,"Empreinte SHA-256 Universe invalide");
 need(typeof DecompressionStream==="function","Décompression gzip indisponible");
 const text=await new Response(new Blob([compressed]).stream().pipeThrough(new DecompressionStream("gzip"))).text();
 need(new TextEncoder().encode(text).byteLength<=10000000,"Archive décompressée trop volumineuse");
 const b=JSON.parse(text),spec=SPECS[period];
 need(b.schema===BLOCK&&b.asset_id===assetId&&b.pair===entry.pair&&b.period===period&&
      b.interval===spec[1]&&b.quote==="USDT"&&b.source==="Binance Spot"&&
      b.first_ms===entry.first_ms&&b.last_ms===entry.last_ms&&b.symbol+"USDT"===b.pair,
      "Archive Universe hors contexte");
 need(Array.isArray(b.rows)&&b.rows.length===entry.candles,"Archive Universe incomplète");
 for(let i=0;i<b.rows.length;i++){
  const r=b.rows[i];
  need(Array.isArray(r)&&r.length===8&&r.every(finite),"OHLCV Universe invalide");
  const [t,o,h,l,close,v,q,n]=r;
  need(Number.isInteger(t)&&t===entry.first_ms+i*spec[0]&&
       Number.isInteger(n)&&n>=0&&l>0&&l<=Math.min(o,close)&&
       Math.max(o,close)<=h&&v>=0&&q>=0,"Chronologie ou prix Universe invalide");
 }
 return {metadata:{id:assetId,pair:entry.pair,period,interval:spec[1],quote:"USDT",
   source:"Binance Spot",sourceIndexUpdatedAt:new Date(c.snapshot_end_ms).toISOString(),
   status:"VALIDATED_SNAPSHOT",isLive:false,graphConnected:false,archiveFamily:"universe",
   firstOpenMs:entry.first_ms,lastOpenMs:entry.last_ms,points:entry.candles},
   candles:b.rows};
}
globalThis.SevenHistoricalUniverseReader=Object.freeze({listCoverage,refreshIndex,readSeries});
})();