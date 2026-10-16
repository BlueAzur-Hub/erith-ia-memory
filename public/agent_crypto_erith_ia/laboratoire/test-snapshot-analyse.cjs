'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {analyse}=require('./snapshot-analyse.js');
const DAY=86400000;
const NOW=Date.UTC(2026,9,16,20);
function make(days=1, options={}) {
  const n=days*24+1;
  const series=Array.from({length:n},(_,i)=>[NOW-days*DAY+i*3600000,100+i*0.1]);
  return {assetId:'bitcoin',symbol:'BTC',provider:'coingecko',source:'CoinGecko historique USD',
    periodDays:days,currency:'USD',quoteCurrency:'USD',
    conversion:{required:false,verified:true,source:'coingecko',observedAt:new Date(NOW).toISOString()},
    published:true,integrityOk:true,selectionRevision:12,chartRevision:12,
    series, ...options};
}
const calc=(x,opts={})=>analyse(x,{nowMs:NOW,...opts});
test('24h published: ready, exact values, peak drawdown zero',()=>{
  const r=calc(make());
  assert.equal(r.status,'ready');assert.equal(r.points,25);assert.equal(r.coveragePct,100);
  assert.ok(Math.abs(r.metrics.changePeriodPct-2.4)<1e-10);
  assert.equal(r.metrics.low,100);assert.equal(r.metrics.high,102.4);
  assert.equal(r.metrics.maxDrawdownPct,0);assert.equal(r.integrity.identityVerified,true);
});
test('7j published: ready and local 24h clipping without fetch',()=>{
  const s=make(7);
  assert.equal(calc(s,{timeframe:'7j'}).status,'ready');
  const r=calc(s,{timeframe:'24h'});
  assert.equal(r.status,'ready');assert.equal(r.points,25);
});
test('30j not fabricated from short history',()=>{
  const r=calc(make(1),{timeframe:'30j'});
  assert.equal(r.status,'not_available');assert.equal(r.metrics.priceCurrent,null);
});
test('FIGR 7j with only 5j actual coverage is partial',()=>{
  const x=make(7);x.series=x.series.slice(48);
  const r=calc(x,{timeframe:'7j'});
  assert.equal(r.status,'partial');assert.ok(r.coveragePct<90);
  assert.equal(r.decisionLabel,'Observation partielle');
});
test('DNA young: absent 7j and partial 24h',()=>{
  const x=make(1);x.assetId='neosoul';x.symbol='DNA';x.series=x.series.slice(3);
  assert.equal(calc(x,{timeframe:'24h'}).status,'partial');
  assert.equal(calc(x,{timeframe:'7j'}).status,'not_available');
});
test('CT-USDT quoted as USD without independent proof is blocked',()=>{
  const x=make(1,{assetId:'concrete',symbol:'CT',instrument:'CT-USDT',provider:'okx',
   quoteCurrency:'USDT',conversion:{required:true,verified:false}});
  assert.equal(calc(x).status,'blocked');
  assert.equal(calc(x).metrics.priceCurrent,null);
});
test('CT verified converted price may be described if proof is explicit',()=>{
  const x=make(1,{assetId:'concrete',symbol:'CT',instrument:'CT-USDT',provider:'okx',
    quoteCurrency:'USDT',conversion:{required:true,verified:true,source:'horodatée',observedAt:new Date(NOW).toISOString()}});
  assert.equal(calc(x).status,'ready');
});
test('selection revisions and expected asset prevent stale response',()=>{
  const x=make(1,{chartRevision:11});assert.equal(calc(x).status,'blocked');
  assert.equal(calc(make(),{expectedAssetId:'neosoul'}).status,'blocked');
  assert.equal(calc(make(),{expectedRevision:11}).status,'blocked');
});
test('unverified publisher never yields metrics',()=>{
  for(const patch of [{published:false},{integrityOk:false},{provider:''},{source:''}]){
    assert.equal(calc(make(1,patch)).status,'blocked');
  }
});
test('fewer than 21 points, zero price and duplicate timestamps blocked',()=>{
  const x=make();x.series=x.series.slice(0,20);assert.equal(calc(x).status,'blocked');
  const z=make();z.series[2][1]=0;assert.equal(calc(z).status,'blocked');
  const d=make();d.series[2][0]=d.series[1][0];assert.equal(calc(d).status,'blocked');
});
test('gap beyond 20% of requested duration stays partial',()=>{
  const x=make();
  x.series=Array.from({length:289},(_,i)=>[NOW-DAY+i*300000,100+i*.01])
    .filter((_,i)=>i<30||i>115);
  assert.equal(calc(x).status,'partial');
});
test('stale points are partial and future points blocked',()=>{
  const x=make();assert.equal(calc(x,{nowMs:NOW+3600000}).status,'partial');
  assert.equal(calc(x,{nowMs:NOW-1}).status,'blocked');
});
test('explicit clock is necessary and computation is deterministic',()=>{
  assert.equal(analyse(make(),{timeframe:'24h'}).status,'blocked');
  assert.deepEqual(calc(make()),calc(make()));
});
test('a falling price computes positive drawdown and bearish reading',()=>{
  const x=make();x.series=x.series.map(([t,_],i)=>[t,120-i]);
  const r=calc(x);assert.equal(r.status,'ready');assert.equal(r.trendLabel,'baisse');
  assert.ok(r.metrics.maxDrawdownPct>0);assert.ok(r.metrics.changePeriodPct<0);
});
test('flat sampled range has null range position',()=>{
  const x=make();x.series=x.series.map(([t])=>[t,3]);
  const r=calc(x);assert.equal(r.status,'ready');assert.equal(r.metrics.rangePositionPct,null);
});
