'use strict';
// Read-only rolling evidence builder: generic CoinGecko IDs, EUR-native only.
// No interpolation, no quote conversion, no fifth-asset substitution.
const crypto=require('node:crypto');
const SCHEMA='agent_crypto_scanner_server_history_v1';
const WINDOW=86400000, BOUNDARY=720000, GAP=1800000;
function buildRolling24h({envelopes,id,asOfMs,windowMs=WINDOW}={}) {
  if (!/^[a-z0-9][a-z0-9-]{0,99}$/.test(String(id||'')))
    throw Error('Exact CoinGecko ID required');
  if (!Number.isSafeInteger(asOfMs) || asOfMs<1600000000000 ||
      windowMs!==WINDOW || !Array.isArray(envelopes) || envelopes.length>96)
    throw Error('Bounded 24h evidence required');
  const start=asOfMs-windowMs;
  const rows=new Map(),sourceFrames=new Set(),rejects=[];
  let usableRecords=0,duplicates=0,conflicts=0;
  for(const envelope of envelopes){
    if (!envelope || envelope.schema!==SCHEMA || envelope.quoteCurrency!=='EUR' ||
        envelope.periodDays!==1 || !Array.isArray(envelope.requestedIds) ||
        !envelope.requestedIds.includes(id) || !Array.isArray(envelope.results)){
      rejects.push('invalid-envelope');continue;
    }
    const frame=String(envelope.frameId||'');
    if (!frame){rejects.push('missing-frame');continue}
    const record=envelope.results.find(x=>x?.id===id);
    const acquired=Date.parse(String(record?.requestedAt||''));
    const series=record?.status==='ready'?record.series:record?.observedSeries;
    if (!record || record.quoteCurrency!=='EUR' || record.periodDays!==1 ||
        record.source!=='coingecko-market-chart' || record.httpStatus!==200 ||
        record.provenance?.provider!=='CoinGecko' ||
        record.provenance.query?.vs_currency!=='eur' ||
        !Number.isFinite(acquired) || acquired>asOfMs+BOUNDARY ||
        acquired<start-2*WINDOW || !Array.isArray(series) ||
        series.length<2 || series.length>10000) {
      rejects.push('unqualified-source-or-period');continue;
    }
    let previous=-Infinity,valid=true;
    for(const point of series){
      if(!Array.isArray(point)||point.length<2 ||
         !Number.isSafeInteger(point[0])||!Number.isFinite(point[1]) ||
         point[1]<=0||point[0]<=previous||point[0]>acquired+BOUNDARY){
        valid=false;break;
      }
      previous=point[0];
    }
    if(!valid){rejects.push('invalid-source-observations');continue}
    usableRecords++;sourceFrames.add(frame);
    for(const point of series){
      const [time,price]=point;
      if(time<start-BOUNDARY||time>asOfMs+BOUNDARY)continue;
      const old=rows.get(time);
      if(old!==undefined){
        if(old!==price) conflicts++;
        else duplicates++;
      }else rows.set(time,price);
    }
  }
  const points=[...rows].sort((a,b)=>a[0]-b[0]);
  const first=points[0]?.[0],last=points.at(-1)?.[0];
  let largestGapMs=0;
  for(let i=1;i<points.length;i++){
    largestGapMs=Math.max(largestGapMs,points[i][0]-points[i-1][0]);
  }
  const covered=points.length>=40 && Number.isSafeInteger(first) &&
    Number.isSafeInteger(last) && first<=start+BOUNDARY &&
    last>=asOfMs-BOUNDARY && last-first>=23.5*3600000 &&
    largestGapMs<=GAP && conflicts===0;
  const result={schema:'agent_crypto_scanner_rolling_eur_history_v1',id,
    quoteCurrency:'EUR',periodDays:1,windowStart:new Date(start).toISOString(),
    windowEnd:new Date(asOfMs).toISOString(),status:covered?'ready':'incomplete',
    pointCount:points.length,usableRecords,sourceFrames:[...sourceFrames].sort(),
    coverage:{first:first??null,last:last??null,largestGapMs,duplicates,conflicts,
      boundaryCovered:Number.isSafeInteger(first)&&Number.isSafeInteger(last)&&
      first<=start+BOUNDARY&&last>=asOfMs-BOUNDARY},
    rejectedRecords:rejects,
    // Partial observations remain evidence only: no chart "series" until ready.
    ...(covered?{series:points}:{observedSeries:points})};
  result.sha256='sha256:'+crypto.createHash('sha256')
    .update(JSON.stringify(result)).digest('hex');
  return result;
}
module.exports={buildRolling24h,SCHEMA,WINDOW,BOUNDARY,GAP};
