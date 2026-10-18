"use strict";
const test=require("node:test"),a=require("node:assert/strict"),e=require("./spot-paper-order-engine.js");
const at="2026-10-18T10:00:00Z",later="2026-10-18T10:01:00Z";
const order=(opt={})=>({pair:"ICNTUSDT",venue:"Bitget",base:"ICNT",quote:"USDT",instrumentType:"SPOT",type:"LIMIT",
 side:"BUY",quantity:"10",priceUSDT:"0.17",tickSize:"0.0001",lotStep:"0.01",minQuantity:"1",minNotionalUSDT:"1",...opt});
const book=(opt={})=>({pair:"ICNTUSDT",venue:"Bitget",quote:"USDT",instrumentType:"SPOT",
 atUTC:later,bestBidUSDT:"0.1599",bestAskUSDT:"0.16",bestBidQty:"100",bestAskQty:"100",...opt});
test("PAPER lifecycle only fills with future matching Spot quote",()=>{
 const s=e.place(e.create({capitalUSDT:"100"}),order(),at);
 a.equal(e.tick(s,book({bestAskUSDT:"0.18"}),later),s);
 a.throws(()=>e.tick(s,book({atUTC:at}),later),/prospectif/);
 const filled=e.tick(s,book(),later);
 a.equal(filled.holdings.ICNT,"10.0");a.equal(filled.pending,null);
 a.equal(filled.events.at(-1).type,"PAPER_FILLED");a.equal(filled.events.at(-1).simulated,true);
 a.equal(e.tradeEndpoint,null);a.equal(e.network,false);a.equal(e.bridge,false);
});
test("partial best bid ask depth and cancel keeps position",()=>{
 let s=e.place(e.create({capitalUSDT:"100"}),order(),at);
 s=e.tick(s,book({bestAskQty:"3"}),later);
 a.equal(s.pending.remaining,"7.0");a.equal(s.holdings.ICNT,"3.0");
 s=e.cancel(s,"2026-10-18T10:01:30Z");
 a.equal(s.pending,null);a.equal(s.holdings.ICNT,"3.0");
});
test("kill switch prevents further paper placements",()=>{
 let s=e.place(e.create({capitalUSDT:"100"}),order(),at);
 s=e.kill(s,later);a.equal(s.halted,true);a.equal(s.pending,null);
 a.throws(()=>e.place(s,order(),later),/bloqué/);
});
test("reject wrong quote, markets, numeric precision, quantities, limit and sell without holding",()=>{
 const s=e.create({capitalUSDT:"100"});
 for(const o of [order({quote:"USD"}),order({pair:"OTHERUSDT"}),order({type:"MARKET"}),
  order({quantity:"0.001"}),order({priceUSDT:"0.16999"}),order({quantity:"500"}),
  order({side:"SELL"}),order({quantity:"1e3"})])a.throws(()=>e.place(s,o,at));
});
test("stale, crossed, mismatched, wide spread quote never fills",()=>{
 const s=e.place(e.create({capitalUSDT:"100"}),order(),at);
 for(const b of [book({atUTC:"2026-10-18T09:55:00Z"}),book({venue:"OKX"}),
  book({bestBidUSDT:"0.18"}),book({bestBidUSDT:"0.12"})])
  a.throws(()=>e.tick(s,b,later));
 a.equal(s.pending.remaining,"10.0");
});
test("expiry, immutability and no private I/O remain invariant",()=>{
 let s=e.place(e.create({capitalUSDT:"100"}),order(),at);
 a.equal(Object.isFrozen(s.pending),true);
 s=e.tick(s,book(),"2026-10-18T11:01:00Z");
 a.equal(s.pending,null);a.equal(s.events.at(-1).type,"PAPER_EXPIRED");
 a.equal(e.storage,false);a.equal(e.realOrders,false);
});
