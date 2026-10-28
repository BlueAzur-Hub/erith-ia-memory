'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {exactIds,validatePoints,requestCoin,collect,SCHEMA}=require('./scanner_verified_history.cjs');
const now=Date.parse('2026-10-28T06:00:00Z');
const ids=['quant-network','monero','figure-heloc','rain','ripple-usd'];
const points=()=>Array.from({length:289},(_,i)=>[now-86400000+i*300000,100+i/100]);
const mock=(status,payload)=>async (url,opts)=>({ok:status>=200&&status<300,status,text:async()=>JSON.stringify(payload),url});
const run=(fetchFn,more={})=>collect({ids,frameId:'market-frame-42',fetchFn,now,spacingMs:0,...more});
test('exact five IDs, order and identity required',()=>{
 assert.deepEqual(exactIds(ids),ids);
 for(const bad of [ids.slice(1),[...ids, 'extra'],['rain','rain',...ids.slice(2)],['RAIN/USD',...ids.slice(1)]]){
   assert.throws(()=>exactIds(bad));
 }
});
test('289 genuine EUR points span fixed 24h',()=>{
 const x=validatePoints(points(),now);assert.equal(x.ok,true);assert.equal(x.pointCount,289);
});
test('no price invented or repaired from malformed series',()=>{
 for(const mutate of [x=>x[0][1]=NaN,x=>x[50][1]=0,x=>x[1][0]=x[0][0],x=>x[5][0]=now+1200000,x=>x.splice(-20)]){
 const x=points();mutate(x);assert.equal(validatePoints(x,now).ok,false);
 }
});
test('no stale 24h partial-series qualification',()=>{
 assert.equal(validatePoints(points().slice(22),now).ok,false);
 assert.equal(validatePoints(points().slice(0,265),now).ok,false);
});
test('reject missing interior intervals even with complete endpoints',()=>{
 const s=points();
 s.splice(50,12);
 const v=validatePoints(s,now);
 assert.equal(v.ok,false);
 assert.match(v.reason,/interior gap/);
});
test('server request retains exact ID, EUR query and original values',async()=>{
 let observed;
 const f=async(url,options)=>{observed={url,options};return mock(200,{prices:points()})(url,options)};
 const r=await requestCoin(f,'rain',now,{timeoutMs:2000});
 assert.equal(r.status,'ready');assert.equal(r.id,'rain');assert.equal(r.quoteCurrency,'EUR');
 assert.match(observed.url,/\/coins\/rain\/market_chart\?vs_currency=eur&days=1&precision=full/);
 assert.equal(r.series[10][1],points()[10][1]);
 assert.equal(r.provenance.provider,'CoinGecko');
});
test('HTTP 429 remains explicit; never creates historical rows',async()=>{
 const r=await requestCoin(mock(429,{error:'rate limit'}),'rain',now);
 assert.equal(r.httpStatus,429);assert.equal(r.status,'unavailable');assert.equal(r.series,undefined);
 assert.match(r.error,/429/);
});
test('HTTP 500 and 404 are distinct and remain unavailable',async()=>{
 for(const status of [404,500]){const r=await requestCoin(mock(status,{}),'rain',now);assert.equal(r.httpStatus,status);assert.equal(r.status,'unavailable')}
});
test('NetworkError stays unknown HTTP; no fabricated 429',async()=>{
 const r=await requestCoin(async()=>{throw new TypeError('NetworkError when attempting to fetch resource')},'rain',now);
 assert.equal(r.httpStatus,null);assert.match(r.error,/NetworkError/);assert.doesNotMatch(r.error,/429/);
});
test('malformed JSON and missing series fail closed',async()=>{
 const malformed=await requestCoin(async()=>({ok:true,status:200,text:async()=>'{bad'}),'rain',now);
 assert.equal(malformed.status,'unavailable');
 const missing=await requestCoin(mock(200,{prices:[]}),'rain',now);
 assert.equal(missing.status,'unavailable');
});
test('five-source partial does not substitute a sixth coin',async()=>{
 const f=async url=>url.includes('/rain/')?mock(429,{})(url):mock(200,{prices:points()})(url);
 const r=await run(f);
 assert.equal(r.schema,SCHEMA);assert.equal(r.status,'partial');assert.equal(r.readyCount,4);
 assert.deepEqual(r.results.map(x=>x.id),ids);
 assert.equal(r.results.find(x=>x.id==='rain').series,undefined);
});
test('five valid histories preserve identity, chronological points and currency',async()=>{
 const r=await run(mock(200,{prices:points()}));
 assert.equal(r.status,'ready');assert.equal(r.readyCount,5);
 assert.equal(r.results.every(x=>x.quoteCurrency==='EUR'&&x.series?.length===289),true);
 assert.match(r.sha256,/^sha256:[a-f0-9]{64}$/);
});
test('USD/USDT substitution is never attempted',async()=>{
 const requests=[];await run(async(url,options)=>{requests.push(url);return mock(200,{prices:points()})(url,options)});
 assert.equal(requests.length,5);
 assert.equal(requests.every(url=>url.includes('vs_currency=eur')&&!url.includes('vs_currency=usd')&&!url.includes('vs_currency=usdt')),true);
});
test('reject missing frame metadata',async()=>{
 await assert.rejects(()=>run(mock(200,{prices:points()}),{frameId:''}),/Frame identity/);
});

test('incomplete upstream 20h remains native EUR evidence but never a chart series',async()=>{
 const partial=points().slice(48);
 const calls=[];
 const fetchFn=async(url,options)=>{
   calls.push(url);return mock(200,{prices:partial})(url,options);
 };
 const r=await requestCoin(fetchFn,'figure-heloc',now,{timeoutMs:1000});
 assert.equal(r.status,'unavailable');assert.equal(r.httpStatus,200);
 assert.equal(r.series,undefined);
 assert.equal(r.observedSeries.length,partial.length);
 assert.equal(r.quoteCurrency,'EUR');
 assert.equal(r.provenance.provider,'CoinGecko');
 assert.equal(calls.length,2);
 assert.match(calls[0],/precision=full/);
 assert.doesNotMatch(calls[1],/precision=/);
});
test('generic precision fallback accepts genuine complete EUR data for any ID',async()=>{
 const partial=points().slice(48);
 const requests=[];
 const fetchFn=async(url,options)=>{
   requests.push(url);
   return mock(200,{prices:url.includes('precision=full')?partial:points()})(url,options);
 };
 const r=await requestCoin(fetchFn,'any-valid-coin-id',now,{timeoutMs:1000});
 assert.equal(r.status,'ready');assert.equal(r.series.length,289);
 assert.equal(r.provenance.query.vs_currency,'eur');
 assert.equal(r.provenance.query.precision,undefined);
 assert.equal(requests.length,2);
});
