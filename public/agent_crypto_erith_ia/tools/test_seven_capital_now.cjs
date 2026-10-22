'use strict';
const assert=require('node:assert/strict');
const {shortlist,study,studySourceSnapshots,markdown}=require('./seven_capital_now.cjs');
const day='2026-10-22';
const at=day+'T10:00:00.000Z',now=Date.parse(day+'T10:05:00.000Z');
function row(i,change){
 return {id:'id-'+i,symbol:'T'+i,rank:100+i,priceUsd:2,
  sourceSnapshot:at,change24h:change,change7d:5,
  volume24hUsd:8000000,marketCapUsd:80000000};
}
const hot=Array.from({length:12},(_,i)=>row(i,18+i));
const mod=[row(20,9),row(21,7),row(22,6),row(23,5)];
const sample={scoutUniverse:[...hot,...mod],
 sourceTimes:{core:at,extended:at}};
const first=shortlist(sample,now);
assert.equal(first.status,'RESEARCH_CANDIDATES_ONLY');
assert.equal(first.policy_matches,4);
assert.deepEqual(first.selected.map(x=>x.symbol),['T20','T21','T22']);
assert.equal(shortlist(sample,now+9*3600000).status,'STALE_OR_DIFFERENT_UTC_DAY');
assert.throws(()=>shortlist({...sample,scoutUniverse:[mod[0],mod[0]]},now),/invalides/);
(async()=>{
 let count=0;
 const missing=await study(sample,async url=>{count++;return {code:'0',data:[]};},now);
 assert.equal(count,3);
 assert.deepEqual(missing.market_results.map(x=>x.status),
  ['NO_PUBLIC_SPOT_USDC_PAIR_AT_CHECK','NO_PUBLIC_SPOT_USDC_PAIR_AT_CHECK','NO_PUBLIC_SPOT_USDC_PAIR_AT_CHECK']);
 assert.equal(missing.market_results.every(x=>x.can_trade_10_usdc===false),true);
 assert.equal(missing.real_orders,0);
 assert.equal(missing.paper_fills,0);
 assert.equal(missing.net_profit_usdc,null);
 assert.match(markdown(missing),/NON ÉTABLI/);
 const outage=await study(sample,async()=>{throw Error('network unavailable');},now);
 assert.equal(outage.market_results.length,3);
 assert.equal(outage.market_results.every(x=>x.status==='SOURCE_UNAVAILABLE'),true);
 assert.equal(outage.real_orders,0);
 const good={
  schema:'agent_crypto_public_market_snapshot_v1',
  source:{provider_id:'coingecko'},generated_at:at,
  coins:Array.from({length:250},(_,i)=>({id:'coin-'+(i+1),symbol:'R'+(i+1),rank:i+1}))
 };
 const duplicate={
  schema:'agent_crypto_public_extended_market_snapshot_v1',
  source:{provider_id:'coingecko'},generated_at:at,
  coins:Array.from({length:750},(_,i)=>({id:'coin-'+(i+251),symbol:'R'+(i+251),rank:i+251}))
 };
 duplicate.coins[233].rank=488;
 const blocked=await studySourceSnapshots(good,duplicate,
   async()=>{throw Error('bad catalog must not call OKX');},now);
 assert.equal(blocked.status,'BLOCKED_INVALID_PUBLIC_UNIVERSE');
 assert.equal(blocked.selected.length,0);
 assert.equal(blocked.market_results.length,0);
 assert.equal(blocked.real_orders,0);
 assert.equal(blocked.paper_fills,0);
 assert.equal(blocked.net_profit_usdc,null);
 assert.match(markdown(blocked),/BLOCKED_INVALID_PUBLIC_UNIVERSE/);
 const stale=await study(sample,async()=>{throw Error('should not fetch');},now+9*3600000);
 assert.equal(stale.market_results.length,0);
 assert.equal(stale.net_profit_usdc,null);
 console.log('Seven Capital immediate USDC preflight: full universe, top 3, outage, no orders PASS');
})().catch(e=>{console.error(e);process.exitCode=1;});
