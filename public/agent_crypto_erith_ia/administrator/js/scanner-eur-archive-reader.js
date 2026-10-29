/* Agent-Crypto / Seven: read-only EUR archive consumer.
 * May be loaded by a future Firefox preview after verified archive publication.
 * No graph mutation, conversion, cache promotion, order or Market selection.
 */
(function(root) {
'use strict';
const ID=/^[a-z0-9][a-z0-9-]{0,99}$/;
const WINDOW=86400000, BOUNDARY=12*60000, MAX_GAP=30*60000;
const MANIFEST='agent_crypto_scanner_native_eur_archive_manifest_v1';
const ARCHIVE='agent_crypto_scanner_native_eur_archive_v1';
const ROLLING='agent_crypto_scanner_rolling_eur_history_v1';
function insist(ok,msg){if(!ok)throw Error(msg)}
function idsFive(ids){
  insist(Array.isArray(ids)&&ids.length===5,'Exactly five IDs required');
  const clean=ids.map(v=>String(v||'').trim().toLowerCase());
  insist(clean.every(x=>ID.test(x))&&new Set(clean).size===5,'Invalid or duplicate IDs');
  return clean;
}
async function digest(value,cryptoAPI=root.crypto){
  insist(!!cryptoAPI?.subtle?.digest,'WebCrypto unavailable');
  const input=new TextEncoder().encode(JSON.stringify(value));
  const bytes=new Uint8Array(await cryptoAPI.subtle.digest('SHA-256',input));
  return 'sha256:'+Array.from(bytes,x=>x.toString(16).padStart(2,'0')).join('');
}
async function validHash(record,cryptoAPI){
  if(!record||typeof record!=='object'||typeof record.sha256!=='string')return false;
  const {sha256,...payload}=record;
  return sha256===await digest(payload,cryptoAPI);
}
function verifyRolling(r,id,now){
  insist(r?.schema===ROLLING && r.id===id && r.quoteCurrency==='EUR'
    && r.periodDays===1 && r.status==='ready'
    && Array.isArray(r.series) && r.series.length>=40,'No certified EUR 24h series');
  const start=Date.parse(r.windowStart||''),end=Date.parse(r.windowEnd||'');
  insist(Number.isFinite(start)&&Number.isFinite(end)
    &&end-start===WINDOW&&end<=now+120000&&now-end<=BOUNDARY,
    'Historical window is stale or inconsistent');
  let prev=-Infinity,maxGap=0;
  for(const point of r.series){
    insist(Array.isArray(point)&&point.length===2
      &&Number.isSafeInteger(point[0])&&Number.isFinite(point[1])&&point[1]>0
      &&point[0]>prev&&point[0]<=now+BOUNDARY,
      'Invalid native EUR observation');
    if(prev!==-Infinity)maxGap=Math.max(maxGap,point[0]-prev);
    prev=point[0];
  }
  const first=r.series[0][0],last=r.series.at(-1)[0];
  insist(first<=start+BOUNDARY&&last>=end-BOUNDARY
    &&last-first>=23.5*3600000&&maxGap<=MAX_GAP,
    'Incomplete EUR 24h window');
  insist(r.coverage?.conflicts===0&&r.coverage?.largestGapMs<=MAX_GAP,
    'Source price conflict or gap');
  return {first,last,points:r.series.length};
}
async function validateOne({record,manifest,id,now,cryptoAPI}){
  insist(record?.schema===ARCHIVE&&record.id===id&&record.quoteCurrency==='EUR'
    &&record.periodDays===1, 'Wrong archive ID or currency');
  insist(manifest?.entries?.[id]?.sha256===record.sha256,
    'Manifest/asset digest mismatch');
  insist(await validHash(record,cryptoAPI),'Archive SHA-256 mismatch');
  insist(await validHash(record.rolling,cryptoAPI),'Rolling data SHA-256 mismatch');
  insist(Array.isArray(record.entries)&&record.entries.length>0,
    'Archive has no original source evidence');
  const summary=verifyRolling(record.rolling,id,now);
  return {id,points:summary.points,first:summary.first,last:summary.last,
    quoteCurrency:'EUR',source:'CoinGecko archived observations',
    series:record.rolling.series};
}
async function verifyManifest(manifest,marketFrameId,now){
  insist(manifest?.schema===MANIFEST&&manifest.quote==='EUR'
    &&manifest.source==='CoinGecko'&&manifest.rankingQuote==='USD',
    'Unverified archive manifest/source/quotes');
  insist(typeof marketFrameId==='string'&&marketFrameId.length>0
    &&manifest.sourceSnapshot===marketFrameId,'Archive does not match Market Frame');
  const generated=Date.parse(manifest.generatedAt||'');
  insist(Number.isFinite(now)&&Number.isFinite(generated)&&generated<=now+120000
    &&now-generated<=BOUNDARY,'Archive manifest stale');
  insist(manifest.entries&&typeof manifest.entries==='object',
    'No archive entries');
}
async function loadFive({ids,marketFrameId,archiveBaseUrl,now=Date.now(),
  fetchFn=root.fetch,cryptoAPI=root.crypto}={}){
  const exact=idsFive(ids);
  insist(typeof fetchFn==='function','Fetch unavailable');
  const base=new URL(archiveBaseUrl);
  insist(base.protocol==='https:'&&base.username===''&&base.password==='',
    'Only HTTPS archive allowed');
  const prefix=base.href.endsWith('/')?base.href:base.href+'/';
  async function read(file){
    const url=new URL(file,prefix);
    insist(url.protocol===base.protocol&&url.origin===base.origin
      &&url.href.startsWith(prefix),'Archive path escape refused');
    const response=await fetchFn(url.href,{cache:'no-store',credentials:'omit'});
    insist(response?.ok,'Archive HTTP '+String(response?.status||'unknown'));
    const body=await response.text();
    insist(body.length<=2500000,'Oversized archive');
    return JSON.parse(body);
  }
  const manifest=await read('last-run.json');
  await verifyManifest(manifest,marketFrameId,now);
  const records={},missing=[];
  // Load each exact selected ID; never search a sixth token or silently convert USD.
  for(const id of exact){
    try{
      const record=await read('assets/'+id+'.json');
      records[id]=await validateOne({record,manifest,id,now,cryptoAPI});
    }catch(error){
      missing.push({id,reason:String(error?.message||error).slice(0,180)});
    }
  }
  return {schema:'agent_crypto_scanner_eur_archive_read_result_v1',
    frameId:marketFrameId,quoteCurrency:'EUR',requestedIds:exact,
    readyCount:exact.length-missing.length,
    status:missing.length?'partial':'ready',records,missing};
}
const api=Object.freeze({idsFive,digest,validHash,verifyRolling,validateOne,verifyManifest,loadFive});
if(typeof module==='object'&&module.exports)module.exports=api;
root.AgentCryptoEurArchiveReader=api;
})(typeof globalThis!=='undefined'?globalThis:this);
