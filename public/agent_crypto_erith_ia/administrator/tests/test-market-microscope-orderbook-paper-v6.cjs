/* Deterministic V6 PAPER order-book smoke/regression fixtures; no network or order API. */
"use strict";
const assert=require("node:assert/strict");
const path=require("node:path");
require(path.join(__dirname,"../js/market-microscope-orderbook-paper-v6.js"));
const api=globalThis.ErithMarketBookPaperV6;
assert.equal(api.read_only,true);
assert.equal(api.real_order,false);
assert.equal(api.uses_historical_book,false);
const NOW=Date.parse("2026-11-06T06:37:30Z");
const basicBook=()=>({
  provider:"okx",freshness:"FRESH",loading:false,error:null,external:false,
  pair:"BTC/USDC",loadedAsset:"BTC",loadedQuote:"USDC",
  sourceObservedAt:new Date(NOW-1000).toISOString(),
  bids:[[100,4],[99,20]],asks:[[102,4],[103,20]]
});
const chart=()=>({loadedInstrument:"BTC-USDC",source:"OKX public candles",loading:false,error:null});
const settings=(side="BUY",quoteBudget=1000,feePercent=0.1)=>({side,quoteBudget,feePercent});
let passed=0;
function test(name,fn){try{fn();passed++;process.stdout.write("PASS "+name+"\n");}catch(e){process.stderr.write("FAIL "+name+" "+String(e.stack||e)+"\n");process.exitCode=1;}}
test("buy sweep: quote budget includes fee, no order",()=>{
 const r=api.simulate(basicBook(),chart(),settings(),NOW);
 assert.equal(r.ok,true);assert.equal(r.mode,"LIVE_BOOK_INSTANT_PAPER");
 assert.equal(r.levelsUsed,2);assert.ok(r.vwap>102);assert.ok(r.impactBestBps>0);
 assert.ok(Math.abs(r.totalQuote-1000)<1e-7);assert.ok(r.feeQuote>0);
 assert.equal(r.orders,0);assert.equal(r.read_only,true);assert.equal(r.quote,"USDC");
});
test("sell sweep: base quantity from mid reference, fee reduces proceeds",()=>{
 const r=api.simulate(basicBook(),chart(),settings("SELL"),NOW);
 assert.equal(r.ok,true);assert.equal(r.levelsUsed,2);assert.ok(r.vwap<100);
 assert.ok(r.totalQuote<r.grossQuote);assert.ok(r.feeQuote>0);assert.equal(r.orders,0);
});
test("fee increases on fixed buy budget, modeled BTC quantity decreases",()=>{
 const noFee=api.simulate(basicBook(),chart(),settings("BUY",1000,0),NOW);
 const withFee=api.simulate(basicBook(),chart(),settings("BUY",1000,0.1),NOW);
 assert.equal(noFee.ok,true);assert.equal(withFee.ok,true);
 assert.ok(noFee.baseQuantity>withFee.baseQuantity);
});
test("too little visible depth is refused, not partially filled",()=>{
 const b=basicBook();b.asks=[[102,0.0001]];
 const r=api.simulate(b,chart(),settings(),NOW);
 assert.equal(r.ok,false);assert.equal(r.code,"INSUFFICIENT_LIQUIDITY");
});
test("stale timestamp refused even if badge says FRESH",()=>{
 const b=basicBook();b.sourceObservedAt=new Date(NOW-30000).toISOString();
 assert.equal(api.simulate(b,chart(),settings(),NOW).code,"BOOK_STALE");
});
test("book timestamp >5s future refused",()=>{
 const b=basicBook();b.sourceObservedAt=new Date(NOW+6000).toISOString();
 assert.equal(api.simulate(b,chart(),settings(),NOW).code,"BOOK_STALE");
});
test("stale badge refused even if timestamp is recent",()=>{
 const b=basicBook();b.freshness="STALE";
 assert.equal(api.simulate(b,chart(),settings(),NOW).code,"BOOK_CONTEXT");
});
test("different book quote or chart instrument refused",()=>{
 const b=basicBook();b.loadedQuote="EUR";
 assert.equal(api.simulate(b,chart(),settings(),NOW).code,"BOOK_CONTEXT");
 const c=chart();c.loadedInstrument="ETH-USDC";
 assert.equal(api.simulate(basicBook(),c,settings(),NOW).code,"BOOK_CONTEXT");
});
test("unsupported or stale chart refused",()=>{
 const c=chart();c.source="CoinGecko";
 assert.equal(api.simulate(basicBook(),c,settings(),NOW).code,"CHART_UNAVAILABLE");
});
test("external book and empty depth refused",()=>{
 const ext=basicBook();ext.external=true;
 assert.equal(api.simulate(ext,chart(),settings(),NOW).code,"BOOK_CONTEXT");
 const empty=basicBook();empty.asks=[];
 assert.equal(api.simulate(empty,chart(),settings(),NOW).code,"BOOK_LEVELS");
});
test("crossed and unsorted books rejected",()=>{
 const crossed=basicBook();crossed.bids=[[105,3],[99,5]];
 assert.equal(api.simulate(crossed,chart(),settings(),NOW).code,"BOOK_CROSSED");
 const unsorted=basicBook();unsorted.asks=[[103,4],[102,20]];
 assert.equal(api.simulate(unsorted,chart(),settings(),NOW).code,"BOOK_LEVELS");
});
test("nonpositive and infinite levels rejected",()=>{
 const a=basicBook();a.bids=[[100,-2],[99,3]];
 assert.equal(api.simulate(a,chart(),settings(),NOW).code,"BOOK_LEVELS");
 const b=basicBook();b.asks=[[102,Infinity]];
 assert.equal(api.simulate(b,chart(),settings(),NOW).code,"BOOK_LEVELS");
});
test("invalid user settings rejected",()=>{
 for(const s of [settings("BUY",1),settings("BUY",1000,-1),settings("SHORT"),settings("BUY",Infinity)]){
  assert.equal(api.simulate(basicBook(),chart(),s,NOW).code,"SETTINGS_INVALID");
 }
});
test("no modification of source snapshot arrays",()=>{
 const b=basicBook(),copy=JSON.stringify(b);
 const r=api.simulate(b,chart(),settings(),NOW);
 assert.equal(r.ok,true);assert.equal(JSON.stringify(b),copy);
});
test("one-level full fill gives no book impact beyond best ask",()=>{
 const b=basicBook();b.asks=[[102,100],[103,20]];
 const r=api.simulate(b,chart(),settings("BUY",100,0.1),NOW);
 assert.equal(r.ok,true);assert.equal(r.levelsUsed,1);
 assert.ok(Math.abs(r.impactBestBps)<1e-9);
 assert.ok(r.deviationMidBps>0); // spread still matters
});
process.stdout.write(passed+"/15 V6 historical-safe instant-depth tests passed\n");
if(passed!==15)process.exitCode=1;
