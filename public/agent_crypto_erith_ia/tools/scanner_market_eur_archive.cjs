'use strict';
// Seven / Agent-Crypto: read-only, bounded dynamic Market plan and incremental
// evidence archive. Never alter browser charts, orders, or quote denominations.
const crypto=require('node:crypto');
const {buildRolling24h}=require('./scanner_rolling_eur_history.cjs');
const PLAN_SCHEMA='agent_crypto_scanner_market_eur_plan_v1';
const ARCHIVE_SCHEMA='agent_crypto_scanner_native_eur_archive_v1';
const COHORT_SCHEMA='agent_crypto_scanner_server_history_v1';
const SHA=v=>'sha256:'+crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const ID=/^[a-z0-9][a-z0-9-]{0,99}$/;
const FRAME=/^[A-Za-z0-9._:-]{3,128}$/;
const HOUR=3600000;
function insist(ok,msg){if(!ok)throw Error(msg)}
function positive(v){return typeof v==='number'&&Number.isFinite(v)&&v>0}
function exactSHA(input){
  if(!input||typeof input!=='object'||typeof input.sha256!=='string')return false;
  const {sha256,...payload}=input;
  return sha256===SHA(payload);
}
function planMarket(snapshot,{universe=100,budget=20,offset=0,nowMs=Date.now()}={}){
  insist(snapshot?.schema==='agent_crypto_public_market_snapshot_v1'
    &&snapshot.source?.provider_id==='coingecko' &&snapshot.source?.quote_currency==='USD',
    'Market snapshot owner / USD ranking provenance not qualified');
  insist(Array.isArray(snapshot.coins)&&snapshot.coins.length>0 &&
    typeof snapshot.snapshot_id==='string'&&FRAME.test(snapshot.snapshot_id),
    'Market snapshot identity missing');
  const generated=Date.parse(snapshot.generated_at||'');
  insist(Number.isSafeInteger(nowMs)&&Number.isFinite(generated)
    &&generated<=nowMs+120000 && nowMs-generated<=3*HOUR,
    'Market snapshot stale or not dated');
  insist(Number.isInteger(universe)&&universe>=5&&universe<=1000
    &&Number.isInteger(budget)&&budget>=5&&budget<=25&&budget%5===0
    &&Number.isSafeInteger(offset)&&offset>=0,
    'Invalid bounded universe / quota / cursor');
  const byRank=new Map(),ids=new Set();
  for(const coin of snapshot.coins){
    if(!Number.isInteger(coin?.rank)||coin.rank<1||coin.rank>universe)continue;
    insist(ID.test(String(coin.id||''))&&!ids.has(coin.id)&&!byRank.has(coin.rank),
      'Duplicate or invalid Market identity/rank');
    ids.add(coin.id);byRank.set(coin.rank,coin);
  }
  insist(byRank.size===universe,'Requested Market rank range not complete');
  const ranked=[...byRank.values()].sort((a,b)=>a.rank-b.rank);
  const eligible=ranked.filter(c=>positive(c.priceEur)&&positive(c.priceUsd));
  insist(eligible.length>=budget,'Not enough identity- and quote-qualified Market assets');
  const changes=eligible.filter(c=>typeof c.change24h==='number'&&Number.isFinite(c.change24h)
    &&c.changeQuoteCurrency==='USD');
  const volumes=eligible.filter(c=>positive(c.volume24hUsd));
  insist(changes.length>=5&&volumes.length>=5,
    'Market ranking metrics unavailable with verified USD quote');
  const cmpRank=(a,b)=>a.rank-b.rank;
  const heads={
    gainers:[...changes].sort((a,b)=>b.change24h-a.change24h||cmpRank(a,b)).slice(0,5),
    losers:[...changes].sort((a,b)=>a.change24h-b.change24h||cmpRank(a,b)).slice(0,5),
    volumes:[...volumes].sort((a,b)=>b.volume24hUsd-a.volume24hUsd||cmpRank(a,b)).slice(0,5)
  };
  const wanted=[],seen=new Set();
  function add(c){if(c&&!seen.has(c.id)&&wanted.length<budget){seen.add(c.id);wanted.push(c.id)}}
  // Prioritize currently changing top-five cohorts; never special-case a token.
  for(const cohort of Object.values(heads))for(const c of cohort)add(c);
  // Remaining slots rotate deterministically across the entire rank universe.
  for(let n=0;n<ranked.length&&wanted.length<budget;n++){
    add(ranked[(n+(offset%ranked.length))%ranked.length]);
  }
  insist(wanted.length===budget,'Cannot fill complete five-ID batches');
  const batches=[];
  for(let k=0;k<wanted.length;k+=5) {
    const id= snapshot.snapshot_id+':b'+(k/5);
    insist(FRAME.test(id),'Snapshot frame identity too long for collector');
    batches.push({index:k/5,frameId:id,ids:wanted.slice(k,k+5)});
  }
  return {schema:PLAN_SCHEMA,snapshotId:snapshot.snapshot_id,
    snapshotAt:snapshot.generated_at,createdAt:new Date(nowMs).toISOString(),
    universe,budget,offset,rankingQuote:'USD',historyQuote:'EUR',
    source:'CoinGecko public Market snapshot',
    priorities:Object.fromEntries(Object.entries(heads).map(([mode,coins])=>[mode,coins.map(c=>c.id)])),
    ids:wanted,batches};
}
function verifyEvidence(plan,batchIndex,envelope){
  insist(plan?.schema===PLAN_SCHEMA&&plan.historyQuote==='EUR'
    &&plan.rankingQuote==='USD'&&Array.isArray(plan.batches),'Bad Market cohort plan');
  const batch=plan.batches[batchIndex];
  insist(batch&&envelope?.schema===COHORT_SCHEMA&&exactSHA(envelope)
    &&envelope.frameId===batch.frameId
    &&envelope.quoteCurrency==='EUR'&&envelope.periodDays===1
    &&Array.isArray(envelope.requestedIds)
    &&JSON.stringify(envelope.requestedIds)===JSON.stringify(batch.ids),
    'Envelope mismatch: snapshot, batch, quote or SHA-256');
  insist(Array.isArray(envelope.results)&&envelope.results.length===5
    &&envelope.results.every((r,i)=>r?.id===batch.ids[i]),
    'Five exact returned identities required');
  return batch;
}
function checkObservation(record,asOfMs){
  const observations=record?.status==='ready'?record?.series:record?.observedSeries;
  if(record?.httpStatus!==200 ||record?.quoteCurrency!=='EUR'
    ||record?.periodDays!==1||record?.source!=='coingecko-market-chart'
    ||record?.provenance?.provider!=='CoinGecko'
    ||record?.provenance?.query?.vs_currency!=='eur'
    ||!Array.isArray(observations)||observations.length<2||observations.length>10000) return false;
  const captured=Date.parse(record.requestedAt||'');
  if(!Number.isFinite(captured)||captured>asOfMs+720000||captured<asOfMs-48*HOUR)return false;
  let prior=-Infinity;
  for(const point of observations){
    if(!Array.isArray(point)||point.length<2||!Number.isSafeInteger(point[0])
      ||!positive(point[1])||point[0]<=prior||point[0]>captured+720000)return false;
    prior=point[0];
  }
  return true;
}
function appendEvidence({plan,batchIndex,envelope,previous={},asOfMs=Date.now()}={}){
  insist(Number.isSafeInteger(asOfMs),'Invalid archive clock');
  const batch=verifyEvidence(plan,batchIndex,envelope);
  const results={};
  for(const item of envelope.results){
    const id=item.id, old=previous[id]||null;
    if(old)insist(old.schema===ARCHIVE_SCHEMA&&old.id===id
      &&old.quoteCurrency==='EUR'&&exactSHA(old)
      &&Array.isArray(old.entries),'Stored archive integrity/identity error');
    const records=old?old.entries.slice():[];
    if(checkObservation(item,asOfMs)){
      const entry={frameId:envelope.frameId,requestedIds:[...envelope.requestedIds],
        envelopeSha256:envelope.sha256,requestedAt:item.requestedAt,
        // Never alias a mutable transport object into persistent evidence.
        result:structuredClone(item)};
      if(!records.some(r=>r.envelopeSha256===entry.envelopeSha256
        &&r.requestedAt===entry.requestedAt))records.push(entry);
    }
    const retained=records.filter(r=>r&&r.result?.id===id
      &&checkObservation(r.result,asOfMs))
      .sort((a,b)=>Date.parse(a.requestedAt)-Date.parse(b.requestedAt))
      .slice(-24);
    const frames=retained.map(entry=>({
      schema:COHORT_SCHEMA,frameId:entry.frameId,
      requestedIds:entry.requestedIds,quoteCurrency:'EUR',periodDays:1,
      results:[entry.result]
    }));
    const rolling=buildRolling24h({envelopes:frames,id,asOfMs});
    const next={schema:ARCHIVE_SCHEMA,id,quoteCurrency:'EUR',periodDays:1,
      updatedAt:new Date(asOfMs).toISOString(),entries:retained,rolling};
    next.sha256=SHA(next);
    results[id]=next;
  }
  insist(Object.keys(results).length===5,'No incomplete batch commits');
  return results;
}
module.exports={planMarket,appendEvidence,verifyEvidence,checkObservation,
  exactSHA,SHA,PLAN_SCHEMA,ARCHIVE_SCHEMA};
