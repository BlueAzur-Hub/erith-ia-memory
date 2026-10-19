"use strict";
const test=require("node:test"),a=require("node:assert/strict"),e=require("./spot-paper-order-engine.js");
const at="2026-10-18T10:00:00Z",later="2026-10-18T10:01:00Z";
const order=(opt={})=>({pair:"ICNTUSDT",venue:"Bitget",base:"ICNT",quote:"USDT",instrumentType:"SPOT",type:"LIMIT",
 side:"BUY",quantity:"10",priceUSDT:"0.17",tickSize:"0.0001",lotStep:"0.01",minQuantity:"1",minNotionalUSDT:"1",...opt});
const book=(opt={})=>({pair:"ICNTUSDT",venue:"Bitget",quote:"USDT",instrumentType:"SPOT",
 atUTC:later,bestBidUSDT:"0.1599",bestAskUSDT:"0.16",bestBidQty:"100",bestAskQty:"100",...opt});
test("PAPER lifecycle only fills with future matching Spot quote",()=>{
 const s=e.place(e.create({capitalUSDT:"100"}),order(),at);
 a.equal(e.tick(s,book({bestAskUSDT:"0.18",bestBidUSDT:"0.1799"}),later),s);
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

test("every base-fee PAPER buy must leave an exchange-lot sellable net position",()=>{
 const s=e.create({capitalUSDT:"100",takerFeeBps:10,buyFeeCurrency:"BASE"});
 const setup={quantity:"10",priceUSDT:"0.3",minQuantity:"10",lotStep:"0.01",
  tickSize:"0.0001",minNotionalUSDT:"1"};
 a.throws(()=>e.place(s,order(setup),at),/quantité nette sous minimum de revente/);
 const g=e.exitCheck({grossQuantity:"10",priceUSDT:"0.3",
   minQuantity:"10",lotStep:"0.01",minNotionalUSDT:"1",
   feeBps:10,feeCurrency:"BASE"});
 a.equal(g.ok,false);
 a.equal(g.netQuantity,"9.99");
 a.equal(g.lotSellableQuantity,"9.99");
 a.equal(g.orders_enabled,false);
 // Just meeting the gross minimum does not prove the net is sellable.
 a.throws(()=>e.place(s,order({...setup,quantity:"10.01"}),at),/quantité nette/);
 const accepted=e.place(s,order({...setup,quantity:"10.02"}),at);
 a.equal(accepted.pending.projectedExit.ok,true);
 a.equal(accepted.pending.projectedExit.lotSellableQuantity,"10.0");
 a.equal(accepted.pending.projectedExit.marketRulesVerified,false);
});
test("base fee and partial fill remain visible as non-sellable size risk",()=>{
 let s=e.create({capitalUSDT:"100",takerFeeBps:10,buyFeeCurrency:"BASE"});
 s=e.place(s,order({quantity:"10.02",priceUSDT:"0.3",
    minQuantity:"10",lotStep:"0.01",minNotionalUSDT:"1"}),at);
 s=e.tick(s,book({bestAskUSDT:"0.29",bestBidUSDT:"0.2899",bestAskQty:"3"}),later);
 a.equal(s.holdings.ICNT,"2.997");
 a.equal(s.events.at(-1).buyFeeBase,"0.003");
 a.equal(s.events.at(-1).feeUSDT,"0.0");
 a.equal(s.events.at(-1).exitRuleStatus,"BLOCKED_NET_SIZE_OR_NOTIONAL");
 a.equal(s.events.at(-1).lotSellableQuantity,"2.99");
 a.equal(s.pending.remaining,"7.02");
 a.throws(()=>e.place(e.cancel(s,"2026-10-18T10:01:10Z"),
   order({side:"SELL",quantity:"2.99",priceUSDT:"0.29",
    minQuantity:"10",lotStep:"0.01",minNotionalUSDT:"1"}),later),/Contraintes/);
});
test("fee currency and exit notional are explicit; quote-fee model stays unchanged",()=>{
 const input={grossQuantity:"10.02",priceUSDT:"0.1",minQuantity:"10",
    lotStep:"0.01",minNotionalUSDT:"2",feeBps:10,feeCurrency:"BASE"};
 a.equal(e.exitCheck(input).ok,false,"sellable units alone do not satisfy min notional");
 a.equal(e.exitCheck({...input,minNotionalUSDT:"1"}).ok,true);
 a.equal(e.exitCheck({...input,minNotionalUSDT:"1",feeCurrency:"QUOTE"}).buyFeeBase,"0.0");
 a.throws(()=>e.exitCheck({...input,feeCurrency:"UNKNOWN"}),/devise/);
 a.throws(()=>e.create({capitalUSDT:"100",buyFeeCurrency:"UNKNOWN"}),/devise/);
 const s=e.place(e.create({capitalUSDT:"100",takerFeeBps:10,buyFeeCurrency:"QUOTE"}),
     order({quantity:"10",priceUSDT:"0.3",minQuantity:"10",minNotionalUSDT:"1"}),at);
 a.equal(s.pending.projectedExit.ok,true);
 a.equal(s.pending.projectedExit.buyFeeBase,"0.0");
});
