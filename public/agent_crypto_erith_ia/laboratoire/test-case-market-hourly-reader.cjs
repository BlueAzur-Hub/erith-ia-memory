"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {verify,analyze}=require("./case-market-hourly-reader.js");
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


function shiftUTC(text,h){
 return new Date(Date.parse(text)+h*3600000).toISOString().replace(".000Z","Z");
}
function shifted(hourDelta,zecLast="1280",axisLast=".31"){
 const record=copy(original);
 record.hour_utc=shiftUTC(original.at_utc,hourDelta).slice(0,13)+"Z";
 record.at_utc=shiftUTC(original.at_utc,hourDelta);
 record.markets[0].proof.ticker.last=zecLast;
 record.markets[1].proof.ticker.last=axisLast;
 for(const m of record.markets){
  m.proof.ticker.source_at_utc=shiftUTC(m.proof.ticker.source_at_utc,hourDelta);
  m.proof.book.source_at_utc=shiftUTC(m.proof.book.source_at_utc,hourDelta);
  for(const bar of m.proof.closed_15m){
   bar.open_at_utc=shiftUTC(bar.open_at_utc,hourDelta);
  }
 }
 return record;
}
function headed(doc){
 const last=doc.hours.at(-1);
 return {...HEAD,last_hour_utc:last.hour_utc,source_day:doc.date_utc,
  markets_observed:last.observed_markets};
}
test("first real archive: evidence is enough for a snapshot, not for a trend",()=>{
 const r=analyze(HEAD,day,null,Date.parse("2026-10-22T07:30:00Z"));
 assert.equal(r.archiveHours,1);
 assert.equal(r.expectedHours,1);
 assert.equal(r.hoursWithoutArchive,0);
 assert.equal(r.rows[0].observations,1);
 assert.equal(r.rows[0].firstToLastPct,null);
 assert.equal(r.rows[0].lastOneHourPct,null);
 assert.equal(r.rows[1].medianSpreadBps,2);
 assert.equal(r.reversalCertified,false);
 assert.equal(r.realOrders,0);
});
test("two consecutive observed hours permit only descriptive changes, not a reversal",()=>{
 const d=copy(day);d.hours.push(shifted(1,"1270",".29"));
 const r=analyze(headed(d),d,null,Date.parse("2026-10-22T08:30:00Z"));
 assert.equal(r.archiveHours,2);
 assert.equal(r.expectedHours,2);
 assert.equal(r.rows[0].observations,2);
 assert.equal(r.rows[1].observations,2);
 assert.equal(r.rows[0].consecutive,true);
 assert.ok(Math.abs(r.rows[0].lastOneHourPct - (1270/1286.7-1)*100)<1e-10);
 assert.ok(r.rows[1].lastOneHourPct<0);
 assert.equal(r.rows[0].decision,"DESCRIPTIVE_ONLY");
 assert.equal(r.rows[0].reversalCertified,false);
});
test("missing hour never interpolates a one-hour change or missing candle",()=>{
 const d=copy(day);d.hours.push(shifted(2,"1280",".32"));
 const r=analyze(headed(d),d,null,Date.parse("2026-10-22T09:30:00Z"));
 assert.equal(r.archiveHours,2);
 assert.equal(r.expectedHours,3);
 assert.equal(r.hoursWithoutArchive,1);
 assert.equal(r.rows[0].observations,2);
 assert.equal(r.rows[0].lastOneHourPct,null);
 assert.ok(r.rows[0].firstToLastPct<0);
});
test("unavailable exchange remains absent, no fictional replacement price",()=>{
 const d=copy(day);const r2=shifted(1);
 r2.markets[1]={symbol:"AXIS",venue:"BITGET",pair:"AXISUSDT",quote:"USDT",
  type:"SPOT",status:"UNAVAILABLE",proof:null};
 r2.observed_markets=1;d.hours.push(r2);
 const r=analyze(headed(d),d,null,Date.parse("2026-10-22T08:30:00Z"));
 assert.equal(r.rows[1].observations,1);
 assert.equal(r.rows[1].hoursUnavailable,1);
 assert.equal(r.rows[1].lastOneHourPct,null);
 assert.equal(r.rows[1].lastSpreadBps,2);
 assert.equal(r.rows[0].observations,2);
});
test("prior UTC day is validated and gaps remain gaps, no future observations",()=>{
 const p=copy(day);
 const old=shifted(-24);
 p.date_utc="2026-10-21";
 p.hours=[old];
 const result=analyze(HEAD,day,p,Date.parse("2026-10-22T07:30:00Z"));
 assert.equal(result.archiveHours,2);
 assert.equal(result.expectedHours,25);
 assert.equal(result.hoursWithoutArchive,23);
 assert.equal(result.rows[0].lastOneHourPct,null);
 const duplicated=copy(day);duplicated.hours.push(copy(duplicated.hours[0]));
 assert.throws(()=>analyze(HEAD,duplicated,null,Date.parse("2026-10-22T07:30:00Z")),/répétée|incohérentes/);
 const future=copy(day);future.hours.push(shifted(1));
 assert.throws(()=>analyze(HEAD,future,null,Date.parse("2026-10-22T08:30:00Z")),/fenêtre/);
});
test("only public dated GitHub archives are requested, no account or automated order",()=>{
 const reader=read("laboratoire/case-market-hourly-reader.js");
 const page=read("laboratoire/radar-historique.html");
 assert.match(page,/data-case-market-evolution/);
 assert.match(page,/data-case-market-evolution-rows/);
 assert.match(reader,/priorDayAvailable/);
 assert.match(reader,/renderEvolution\(doc,analyze\(head,day,previous\)\)/);
 assert.match(reader,/previous=await read\(/);
 assert.doesNotMatch(reader,/placeOrder|sendOrder|Authorization|Bearer |localStorage|indexedDB|setInterval\(/);
});
