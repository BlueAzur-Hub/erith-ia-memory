"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {verify}=require("./case-market-hourly-reader.js");
const BASE=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(BASE,p),"utf8");
const HOUR="2026-10-22T07Z",AT="2026-10-22T07:22:00Z";
const HEAD={schema:"erith.case-market-hourly-status.v1",last_hour_utc:HOUR,
 source_day:"2026-10-22",orders_enabled:false,real_orders:0,markets_observed:2};
const book=(bid,ask)=>({source_at_utc:"2026-10-22T07:21:30Z",best_bid:bid,best_ask:ask,
 spread_bps:"2.00",top5_bid_quote_depth:"300.0000",top5_ask_quote_depth:"400.0000",
 bid5:[[bid,"1"]],ask5:[[ask,"1"]],fill_proven:false});
const bar=p=>({open_at_utc:"2026-10-22T07:00:00Z",
 open:p,high:p,low:p,close:p,volume_base:"1",volume_quote:"1"});
const market=(symbol,venue,pair,quote,last,bid,ask)=>({
 symbol,venue,pair,quote,type:"SPOT",status:"OBSERVED",unavailable_reason:null,
 proof:{ticker:{source_at_utc:"2026-10-22T07:21:30Z",last},
       book:book(bid,ask),closed_15m:[bar(last)]}});
const original={schema:"erith.case-market-public-hourly.v1",spot_only:true,
 separate_native_quotes:true,orders_enabled:false,real_orders:0,paper_fills:0,
 trade_signal:false,hour_utc:HOUR,at_utc:AT,observed_markets:2,
 markets:[market("ZEC","OKX_EEA","ZEC-USDC","USDC","1286.7","1286.5","1286.8"),
          market("AXIS","BITGET","AXISUSDT","USDT",".3",".299",".301")]};
const day={schema:"erith.case-market-public-hourly.v1",date_utc:"2026-10-22",
 orders_enabled:false,real_orders:0,hours:[original]};
const copy=x=>structuredClone(x);
test("reads only the exact two separate Spot-native markets",()=>{
 const x=verify(HEAD,day,Date.parse("2026-10-22T07:30:00Z"));
 assert.equal(x.markets.length,2);assert.equal(x.markets[0].quote,"USDC");
 assert.equal(x.markets[1].quote,"USDT");assert.equal(x.realOrders,0);
 assert.equal(x.ageMinutes,8);
});
test("no missing market price is invented",()=>{
 const a=copy(day),h=copy(HEAD);
 a.hours[0].markets[1]={symbol:"AXIS",venue:"BITGET",pair:"AXISUSDT",quote:"USDT",
  type:"SPOT",status:"UNAVAILABLE",proof:null};
 a.hours[0].observed_markets=1;h.markets_observed=1;
 const r=verify(h,a,Date.parse("2026-10-22T07:30:00Z"));
 assert.equal(r.markets[1].status,"UNAVAILABLE");
 assert.equal(r.markets[1].last,undefined);
});
test("rejects future bar, crossed quotes, Futures identity, fake accounts",()=>{
 const now=Date.parse("2026-10-22T07:30:00Z");
 let x=copy(day);x.hours[0].markets[0].proof.closed_15m[0].open_at_utc="2026-10-22T07:15:00Z";
 assert.throws(()=>verify(HEAD,x,now),/Bougie/);
 x=copy(day);x.hours[0].markets[0].proof.book.best_bid="1290";
 assert.throws(()=>verify(HEAD,x,now),/Carnet/);
 x=copy(day);x.hours[0].markets[1].type="FUTURES";
 assert.throws(()=>verify(HEAD,x,now),/Identité/);
 x=copy(day);x.hours[0].orders_enabled=true;
 assert.throws(()=>verify(HEAD,x,now),/Observation/);
});
test("reader only loads dated GitHub static JSON and mounts in Radar",()=>{
 const reader=read("laboratoire/case-market-hourly-reader.js");
 const html=read("laboratoire/radar-historique.html");
 assert.match(html,/id="case-market-history"/);
 assert.match(html,/case-market-hourly-reader\.js/);
 assert.match(html,/ZEC-USDC/);assert.match(html,/AXISUSDT/);
 assert.match(reader,/\.\.\/data\/crypto\/case-market-hourly\/latest\.json/);
 assert.doesNotMatch(reader,/\/api\/v5\/trade|placeOrder|order\/place|Authorization|Bearer /);
 assert.doesNotMatch(reader,/localStorage|indexedDB|setInterval\(/);
});
