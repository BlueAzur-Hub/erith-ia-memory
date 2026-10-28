'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {planMarket,appendEvidence,SHA,verifyEvidence}=require('./scanner_market_eur_archive.cjs');
const NOW=Date.parse('2026-10-28T09:10:00Z'),WINDOW=86400000;
function market(name='snapshot-test',now=NOW){
 const coins=Array.from({length:25},(_,i)=>({
   id:'example-asset-'+(i+1),symbol:'A'+(i+1),rank:i+1,
   priceEur:1.1,priceUsd:1.25,change24h:i-12,changeQuoteCurrency:'USD',
   volume24hUsd:i===11?1e9:1000+i
 }));
 return {schema:'agent_crypto_public_market_snapshot_v1',snapshot_id:name,
   generated_at:new Date(now).toISOString(),source:{provider_id:'coingecko',quote_currency:'USD'},
   coins};
}
const data=(from,to)=>{const rows=[];for(let t=from;t<=to;t+=300000)rows.push([t,1+(t-(NOW-WINDOW))/300000/10000]);return rows};
function envelope(batch,sourceRows=data(NOW-WINDOW,NOW),captured=NOW,status='ready'){
 const results=batch.ids.map(id=>({
   id,status,httpStatus:200,quoteCurrency:'EUR',periodDays:1,
   source:'coingecko-market-chart',requestedAt:new Date(captured).toISOString(),
   provenance:{provider:'CoinGecko',query:{vs_currency:'eur',days:'1'}},
   ...(status==='ready'?{series:sourceRows}:{observedSeries:sourceRows})
 }));
 const e={schema:'agent_crypto_scanner_server_history_v1',frameId:batch.frameId,
   requestedIds:batch.ids,quoteCurrency:'EUR',periodDays:1,
   results,status:'ready'};
 e.sha256=SHA(e);
 return e;
}
test('live market rankings and exact five-ID batches are generic',()=>{
 const p=planMarket(market(),{universe:25,budget:20,offset:0,nowMs:NOW});
 assert.equal(p.batches.length,4);assert.equal(p.ids.length,20);
 assert.equal(new Set(p.ids).size,20);
 assert.deepEqual(p.priorities.gainers,['example-asset-25','example-asset-24','example-asset-23','example-asset-22','example-asset-21']);
 assert.deepEqual(p.priorities.losers,['example-asset-1','example-asset-2','example-asset-3','example-asset-4','example-asset-5']);
 assert.equal(p.priorities.volumes[0],'example-asset-12');
 assert.equal(p.historyQuote,'EUR');assert.equal(p.rankingQuote,'USD');
 p.batches.forEach(b=>assert.equal(b.ids.length,5));
});
test('rotating offset changes lower-ranked reserve without a per-token rule',()=>{
 const a=planMarket(market(),{universe:25,budget:20,offset:0,nowMs:NOW});
 const b=planMarket(market(),{universe:25,budget:20,offset:8,nowMs:NOW});
 assert.notDeepEqual(a.ids,b.ids);
 for(const id of a.priorities.gainers)assert.ok(b.ids.includes(id));
});
test('unavailable Market ranks and stale frames do not authorize collection',()=>{
 assert.throws(()=>planMarket(market(),{universe:100,budget:20,nowMs:NOW}),/rank range/);
 assert.throws(()=>planMarket(market(),{universe:25,budget:20,nowMs:NOW+4*3600000}),/stale/);
 assert.throws(()=>planMarket(market(),{universe:25,budget:22,nowMs:NOW}),/quota/);
});
test('duplicate Market rank, duplicate identity or wrong quote is refused',()=>{
 const a=market();a.coins[3].rank=2;
 assert.throws(()=>planMarket(a,{universe:25,budget:20,nowMs:NOW}),/Duplicate/);
 const b=market();b.source.quote_currency='USDT';
 assert.throws(()=>planMarket(b,{universe:25,budget:20,nowMs:NOW}),/provenance/);
});
test('native EUR exact-five evidence produces only hash-verified per-ID archives',()=>{
 const p=planMarket(market(),{universe:25,budget:20,nowMs:NOW});
 const e=envelope(p.batches[0]);
 const z=appendEvidence({plan:p,batchIndex:0,envelope:e,asOfMs:NOW});
 assert.deepEqual(Object.keys(z),p.batches[0].ids);
 for(const q of Object.values(z)){
   assert.equal(q.rolling.status,'ready');
   assert.equal(q.rolling.series.length,289);
   assert.equal(q.quoteCurrency,'EUR');
   assert.match(q.sha256,/^sha256:[a-f0-9]{64}$/);
 }
});
test('tampered source SHA or wrong batch cannot poison an archive',()=>{
 const p=planMarket(market(),{universe:25,budget:20,nowMs:NOW});
 const e=envelope(p.batches[0]);
 e.results[0].series[0][1]=999;
 assert.throws(()=>appendEvidence({plan:p,batchIndex:0,envelope:e,asOfMs:NOW}),/SHA-256/);
 const wrong=envelope(p.batches[0]);wrong.frameId='wrong-frame';wrong.sha256=SHA(wrong);
 assert.throws(()=>verifyEvidence(p,0,wrong),/mismatch/);
});
test('a partial HTTP 200 keeps true observations but never labels 20h as complete',()=>{
 const p=planMarket(market(),{universe:25,budget:20,nowMs:NOW});
 const e=envelope(p.batches[0],data(NOW-WINDOW+4*3600000,NOW),NOW,'unavailable');
 const a=appendEvidence({plan:p,batchIndex:0,envelope:e,asOfMs:NOW});
 const z=Object.values(a)[0];
 assert.equal(z.rolling.status,'incomplete');
 assert.equal(z.rolling.series,undefined);
 assert.ok(z.rolling.observedSeries.length>200);
 assert.equal(z.entries[0].result.status,'unavailable');
});
test('a second genuine capture can complete the rolling window without invention',()=>{
 const earlyTime=NOW-4*3600000;
 const aPlan=planMarket(market('early-market',earlyTime),{universe:25,budget:20,nowMs:earlyTime});
 const bPlan=planMarket(market('late-market',NOW),{universe:25,budget:20,nowMs:NOW});
 const earlier=envelope(aPlan.batches[0],data(NOW-WINDOW,earlyTime),earlyTime,'unavailable');
 const later=envelope(bPlan.batches[0],data(NOW-WINDOW+4*3600000,NOW),NOW,'unavailable');
 const first=appendEvidence({plan:aPlan,batchIndex:0,envelope:earlier,asOfMs:NOW});
 const second=appendEvidence({plan:bPlan,batchIndex:0,envelope:later,previous:first,asOfMs:NOW});
 for(const k of Object.keys(second)){
   assert.equal(second[k].rolling.status,'ready');
   assert.equal(second[k].rolling.pointCount,289);
   assert.equal(second[k].entries.length,2);
 }
});
test('reprocessing an identical envelope is idempotent',()=>{
 const p=planMarket(market(),{universe:25,budget:20,nowMs:NOW});
 const e=envelope(p.batches[0]);
 const a=appendEvidence({plan:p,batchIndex:0,envelope:e,asOfMs:NOW});
 const b=appendEvidence({plan:p,batchIndex:0,envelope:e,previous:a,asOfMs:NOW});
 assert.equal(b[p.batches[0].ids[0]].entries.length,1);
});
test('tampered persistent evidence is refused rather than silently repaired',()=>{
 const p=planMarket(market(),{universe:25,budget:20,nowMs:NOW});
 const e=envelope(p.batches[0]);
 const a=appendEvidence({plan:p,batchIndex:0,envelope:e,asOfMs:NOW});
 a[p.batches[0].ids[0]].entries[0].result.series[0][1]=99;
 assert.throws(()=>appendEvidence({plan:p,batchIndex:0,envelope:e,previous:a,asOfMs:NOW}),/integrity/);
});
