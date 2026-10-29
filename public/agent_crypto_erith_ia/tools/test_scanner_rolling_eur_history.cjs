'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {buildRolling24h,SCHEMA,WINDOW}=require('./scanner_rolling_eur_history.cjs');
const now=Date.parse('2026-10-28T09:00:00Z'),step=300000,base=now-WINDOW;
const id='figure-heloc';
function points(from,to){
  const rows=[];for(let t=from;t<=to;t+=step){
    rows.push([t,100+(t-base)/step/1000]);
  }return rows;
}
function evidence(raw,{coin=id,quote='EUR',http=200,frame='frame-snapshot-1',acquired=now,
  provider='CoinGecko',status='unavailable'}={}){
  const row={id:coin,quoteCurrency:quote,periodDays:1,source:'coingecko-market-chart',
    httpStatus:http,requestedAt:new Date(acquired).toISOString(),
    provenance:{provider,query:{vs_currency:quote.toLowerCase(),days:'1'}},
    status,...(status==='ready'?{series:raw}:{observedSeries:raw})};
  return {schema:SCHEMA,frameId:frame,requestedIds:[coin,'a','b','c','d'],
    periodDays:1,quoteCurrency:quote,results:[row]};
}
function build(envelopes){return buildRolling24h({envelopes,id,asOfMs:now})}
test('one 20h genuine series cannot claim full 24h',()=>{
  const x=build([evidence(points(base+4*3600000,now))]);
  assert.equal(x.status,'incomplete');assert.equal(x.series,undefined);
  assert.ok(x.observedSeries.length>200);
});
test('two overlapping 20h genuine acquisitions can cover 24h without fabricated points',()=>{
  const earlier=evidence(points(base,now-4*3600000),{acquired:now-4*3600000,frame:'early'});
  const later=evidence(points(base+4*3600000,now),{frame:'late'});
  const x=build([earlier,later]);
  assert.equal(x.status,'ready');assert.equal(x.pointCount,289);
  assert.equal(x.series[0][0],base);assert.equal(x.series.at(-1)[0],now);
  assert.equal(x.coverage.duplicates,193);
  assert.equal(x.coverage.conflicts,0);
  assert.match(x.sha256,/^sha256:[a-f0-9]{64}$/);
});
test('no EUR/USD/USDT identity swapping',()=>{
  for(const quote of ['USD','USDT','USDC']){
    const x=build([evidence(points(base,now),{quote})]);
    assert.equal(x.status,'incomplete');assert.equal(x.series,undefined);
  }
});
test('wrong CoinGecko ID cannot be joined into selected token',()=>{
  const x=build([evidence(points(base,now),{coin:'rain'})]);
  assert.equal(x.status,'incomplete');assert.equal(x.pointCount,0);
});
test('provider conflict and HTTP error never create ready data',()=>{
  for(const opts of [{provider:'Unknown'},{http:429}]){
    const x=build([evidence(points(base,now),opts)]);
    assert.equal(x.status,'incomplete');assert.equal(x.series,undefined);
  }
});
test('same timestamp divergent prices cannot be silently reconciled',()=>{
  const a=evidence(points(base,now),{frame:'a'});
  const changed=points(base,now);changed[25][1]+=1;
  const b=evidence(changed,{frame:'b'});
  const x=build([a,b]);
  assert.equal(x.status,'incomplete');assert.ok(x.coverage.conflicts>0);
});
test('interior history gaps remain incomplete even with valid endpoints',()=>{
  const p=points(base,now).filter(x=>x[0]<base+8*3600000||x[0]>base+12*3600000);
  const x=build([evidence(p)]);assert.equal(x.status,'incomplete');
  assert.ok(x.coverage.largestGapMs>30*60000);
});
test('invalid points are rejected instead of sanitized',()=>{
  const p=points(base,now);p[22][1]=0;
  const x=build([evidence(p)]);assert.equal(x.pointCount,0);
  assert.equal(x.status,'incomplete');
});
test('future and stale captures fail provenance qualification',()=>{
  const x=build([evidence(points(base,now),{acquired:now+3600000})]);
  assert.equal(x.status,'incomplete');
});
test('generic IDs, no fixed crypto symbol list',()=>{
  const coin='arbitrary-real-coingecko-id';
  const e=evidence(points(base,now),{coin,status:'ready'});
  const x=buildRolling24h({envelopes:[e],id:coin,asOfMs:now});
  assert.equal(x.status,'ready');assert.equal(x.id,coin);
});
