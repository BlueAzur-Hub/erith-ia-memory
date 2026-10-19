"use strict";
/* BTC 1a in the existing Bougies mode: verified source and real OHLC price scale.
 * No browser, real network, private data, Bridge or orders. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const filename=path.join(__dirname,"../public/agent_crypto_erith_ia/administrator/js/market-microscope-candles.js");
const source=fs.readFileSync(filename,"utf8");
new vm.Script(source);
assert.match(source,/new URL\("\.\/verified-periods-reader\.js"/);
assert.match(source,/reader\.load\("bitcoin","1an"\)/);
assert.match(source,/pack\.data\?\.pair!=="BTCUSDT"/);
assert.match(source,/r\.t%86400000!==0/);
assert.match(source,/verifiedBtcAnnual\(\)/);
assert.match(source,/s\?\.loadedBar==="1m"&&!s\?\.archivePeriod/,"Annual archive must not trigger minute refresh");
assert.match(source,/state\.archivePeriod==="1an"\?state\.rows\.length/);
const day=86400000,t0=Date.UTC(2025,9,1);
const valid=Array.from({length:365},(_,i)=>{const p=80000+i*8;return[t0+day*i,p,p+300,p-400,p+80,100+i,5000,9]});
const live=Array.from({length:40},(_,i)=>{const p=82000+i;return{t:Date.UTC(2026,9,19,1)+i*60000,o:p,h:p+5,l:p-5,c:p+1,v:20}});
async function flush(){for(let i=0;i<12;i++)await Promise.resolve();await new Promise(r=>setImmediate(r));}
function harness({bars=valid,defer=false,initialPeriod="365",initialBar=null,marketRows=live}={}){
 let period=initialPeriod,asset="BTC",annualCalls=0,marketCalls=0,resolveAnnual;
 const listeners={};
 const reader={load:(id,p)=>{
   annualCalls++;assert.equal(id,"bitcoin");assert.equal(p,"1an");
   return defer?new Promise(r=>{resolveAnnual=r}):Promise.resolve({data:{
     asset_id:"bitcoin",pair:"BTCUSDT",quote:"USDT",period:"1an",resolution:"1d"},rows:bars});
 }};
 const c={
   console,Date,URL,AbortController,setTimeout,clearTimeout,queueMicrotask,
   localStorage:{getItem(key){return key==="agentCrypto.marketMicroscope.bar.v1"?initialBar:null},setItem(){}},
   document:{
     currentScript:{src:"https://example.org/public/agent_crypto_erith_ia/administrator/js/market-microscope-candles.js"},
     readyState:"loading",
     addEventListener(name,fn){(listeners["doc:"+name]??=[]).push(fn)},
     querySelector(q){if(q==="#analyste .period-tabs .period-btn.active")return{dataset:{period}};return null},
     querySelectorAll(){return[]},
     getElementById(){return null},
     createElement(){return{style:{},addEventListener(){}}},
     head:{appendChild(){}}
   },
   addEventListener(name,fn){(listeners[name]??=[]).push(fn)},
   AgentCryptoQuoteCurrencyArchitecture:{snapshot(){return{displayCurrency:"USD"}}},
   getSelectedCoin(){return{symbol:asset,id:"bitcoin"}},
   AgentCryptoNewListingLiveAsset:{snapshot(){return{active:false}}},
   SevenVerifiedPeriods:reader,
   AgentCryptoMarketInstrumentResolver:{
     async resolve(){marketCalls++;return{available:true,provider:"binance",instrument:"BTC-USDT",quote:"USDT"}},
     async fetchCandles(){return{provider:"binance",instrument:"BTC-USDT",quote:"USDT",rows:marketRows}}
   }
 };
 c.window=c;c.globalThis=c;
 vm.runInNewContext(source,c,{timeout:1500});
 return {api:c.AgentCryptoMarketMicroscope,
    get period(){return period},set period(v){period=v},
    set asset(v){asset=v},
    get annualCalls(){return annualCalls},get marketCalls(){return marketCalls},
    resolveArchive(){assert.equal(typeof resolveAnnual,"function");resolveAnnual({data:{
      asset_id:"bitcoin",pair:"BTCUSDT",quote:"USDT",period:"1an",resolution:"1d"},rows:bars})},
    emit(name){(listeners[name]||[]).forEach(fn=>fn({detail:{}}))}
 };
}
(async()=>{
 const p=harness();
 p.api.setMode("candles");await flush();
 let state=p.api.snapshot();
 assert.equal(p.annualCalls,1);
 assert.equal(p.marketCalls,0,"Annual must NOT silently use 300 exchange candles");
 assert.equal(state.archivePeriod,"1an");
 assert.equal(state.loadedInstrument,"BTC-USDT");
 assert.equal(state.loadedBar,"1j");
 assert.equal(state.rows.length,365);
 assert.equal(p.api.viewport().count,365,"Full year must be navigable before zoom");
 assert.equal(state.rows[0].o,80000);
 assert.equal(state.rows[0].h,80300);
 assert.equal(state.rows[0].l,79600);
 assert.equal(state.rows[0].c,80080);
 assert.equal(state.rows.at(-1).t,t0+364*day);
 assert.match(state.source,/USDT, non USD/);
 p.period="1";p.emit("atlas:admin-graph");await flush();
 state=p.api.snapshot();
 assert.equal(p.marketCalls,1);
 assert.equal(state.archivePeriod,null);
 assert.equal(state.loadedBar,"15m");
 assert.equal(state.rows.length,40);
 assert.equal(p.api.viewport().count,40);
 const bad=harness({bars:valid.slice(1)});
 bad.api.setMode("candles");await flush();
 assert.equal(bad.api.snapshot().rows.length,0);
 assert.equal(bad.api.snapshot().errorCode,"BTC_YEAR_CONTEXT_INVALID");
 assert.equal(bad.marketCalls,0,"Bad archive must not fall back to short market candles");
 const race=harness({defer:true});
 race.api.setMode("candles");await flush();
 race.period="1";race.emit("atlas:admin-graph");await flush();
 assert.equal(race.api.snapshot().rows.length,40);
 race.resolveArchive();await flush();
 assert.equal(race.api.snapshot().loadedBar,"15m");
 assert.equal(race.api.snapshot().archivePeriod,null);
 assert.equal(race.api.snapshot().rows.length,40,"Late archive must never overwrite another period");
 // Full 300 fetched OHLCV are retained for indicators, but only the chosen
 // period is initially visible. Switching duration must not refetch candles.
 const hourly=Array.from({length:300},(_,i)=>{
   const value=80000+i;
   return{t:Date.UTC(2026,9,6)+i*3600000,o:value,h:value+8,l:value-8,c:value+2,v:15};
 });
 const context=harness({initialPeriod:"1",initialBar:"1h",marketRows:hourly});
 context.api.setMode("candles");await flush();
 assert.equal(context.api.snapshot().rows.length,300,"Retain all source candles for indicators");
 assert.equal(context.api.snapshot().loadedBar,"1h");
 assert.equal(context.api.viewport().count,24,"24h at 1h = 24 visible candles, not 300");
 assert.equal(context.api.viewport().start,276);
 assert.equal(context.marketCalls,1);
 context.period="7";context.emit("atlas:admin-graph");await flush();
 assert.equal(context.api.viewport().count,168,"7j at 1h = 168 visible candles");
 assert.equal(context.marketCalls,1,"Period-only change must not refetch the same candles");
 context.period="30";context.emit("atlas:admin-graph");await flush();
 assert.equal(context.api.viewport().count,300,"Incomplete 30j displays only available source");
 assert.equal(context.marketCalls,1);
 context.period="1";context.emit("atlas:admin-graph");await flush();
 assert.equal(context.api.viewport().count,24,"Return to 24h restores exact visible interval");
 assert.equal(context.marketCalls,1);
 assert.match(source,/COUVERTURE PARTIELLE/,"Unsupported durations must be explicitly identified");
 console.log("PASS annual OHLCV; 24h=24x1h; 7j=168x1h; incomplete 30j; no redundant fetch; late response blocked");
})().catch(error=>{console.error(error);process.exitCode=1});
