"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const engine=require("../public/agent_crypto_erith_ia/trader/spot-paper-order-engine.js");
const COLLECTED="2026-10-18T10:01:00Z",BOOK_AT="2026-10-18T10:00:30Z";
function fixture(){
 return {symbol:"TOK0",identity_status:"SYMBOL_ONLY_NOT_COIN_ID_PROVEN",okx_spot:{
  pair:"TOK0-USDT",pair_observed:true,native_rules_verified:true,
  venue:"OKX",quote:"USDT",contract_identity_proven:false,
  real_orders_enabled:false,rules:{
   min_sz:"1",lot_sz:"0.01",tick_sz:"0.01",source:"OKX_PUBLIC_SPOT_INSTRUMENT",
   contract_identity_proven:false,fees_proven:false,orders_enabled:false},
  best_book_status:"DATED_PUBLIC_BOOK",best_book:{
   schema:"erith.radar.okx.spot-best-book.v1",source:"OKX_PUBLIC_SPOT_BOOK",
   pair:"TOK0-USDT",quote:"USDT",exchange_time_utc:BOOK_AT,
   collected_at_utc:COLLECTED,best_bid_usdt:"9.90",best_ask_usdt:"10.00",
   best_bid_qty:"100",best_ask_qty:"100",
   market_execution_proven:false,fees_verified:false,orders_enabled:false}
 }};
}
const audit=x=>engine.previewOkxSpot(x);
test("100 USDT PAPER best-level ask to immediate bid is a LOSS after hypothetical fees",()=>{
 const r=audit(fixture());
 assert.equal(r.status,"HYPOTHETICAL_IMMEDIATE_ROUNDTRIP_ONLY");
 assert.equal(r.grossBuyQuantity,"10.0");
 assert.equal(r.netSellableQuantity,"9.99");
 assert.equal(r.hypotheticalImmediatePnlSign,"-");
 assert.ok(r.hypotheticalImmediatePnlPct<0);
 assert.ok(r.approximateBidRiseToBreakEvenPct>0);
 assert.equal(r.futureExitPriceProven,false);
 assert.equal(r.actualFeesVerified,false);
 assert.equal(r.contractIdentityProven,false);
 assert.equal(r.marketExecutionProven,false);
 assert.equal(r.orders_enabled,false);
 assert.equal(r.executable,false);
 assert.equal(engine.tradeEndpoint,null);
});
test("after BASE fee, minimum size may block the sale even if gross order meets minimum",()=>{
 const x=fixture();x.okx_spot.rules.min_sz="10";
 assert.equal(audit(x).reason,"NET_QUANTITY_BELOW_OKX_EXIT_MINIMUM");
});
test("best-level liquidity is a hard condition, not a guessed fill",()=>{
 for(const side of ["best_ask_qty","best_bid_qty"]){
  const x=fixture();x.okx_spot.best_book[side]="5";
  const r=audit(x);
  assert.equal(r.status,"NOT_EVALUABLE");
  assert.match(r.reason,/DEPTH_INSUFFICIENT/);
 }
});
test("no USDC or futures/identity shortcut",()=>{
 for(const change of [
  x=>x.okx_spot.quote="USDC",
  x=>x.okx_spot.pair="TOK0-USDC",
  x=>x.okx_spot.contract_identity_proven=true,
  x=>x.okx_spot.real_orders_enabled=true,
  x=>x.okx_spot.rules.source="OKX_FUTURES",
  x=>x.identity_status="CONTRACT_MATCH_AT_COLLECTION",
  x=>x.okx_spot.best_book.fees_verified=true
 ]){
  const x=fixture();change(x);
  assert.equal(audit(x).status,"NOT_EVALUABLE");
 }
});
test("missing, stale, crossed, mis-ticked or too precise evidence is rejected",()=>{
 for(const change of [
  x=>{x.okx_spot.best_book=null},
  x=>{x.okx_spot.best_book.exchange_time_utc="2026-10-18T09:50:00Z"},
  x=>{x.okx_spot.best_book.best_bid_usdt="10.10"},
  x=>{x.okx_spot.best_book.best_ask_usdt="10.00001"},
  x=>{x.okx_spot.rules.tick_sz="0.0000000000000000001"}
 ]){
  const x=fixture();change(x);
  assert.equal(audit(x).status,"NOT_EVALUABLE");
 }
});
test("OKX native tiny price tick (9 decimals) is calculated exactly",()=>{
 const x=fixture();
 x.symbol="PEPE";x.okx_spot.pair="PEPE-USDT";
 x.okx_spot.best_book.pair="PEPE-USDT";
 x.okx_spot.rules={...x.okx_spot.rules,min_sz:"100000",lot_sz:"1",tick_sz:"0.000000001"};
 x.okx_spot.best_book.best_ask_usdt="0.000004000";
 x.okx_spot.best_book.best_bid_usdt="0.000003990";
 x.okx_spot.best_book.best_ask_qty="40000000";
 x.okx_spot.best_book.best_bid_qty="40000000";
 const r=audit(x);
 assert.equal(r.status,"HYPOTHETICAL_IMMEDIATE_ROUNDTRIP_ONLY");
 assert.equal(r.orders_enabled,false);
 assert.equal(r.hypotheticalImmediatePnlSign,"-");
});
