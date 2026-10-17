"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {study}=require("../laboratoire/dna-decision-review.js");
function base(){
 return {schema:"erith.dna.paper.48h.v1",mode:"PAPER",executed_order:false,
  order_permissions:false,private_account_access:false,market:"DNAUSDT",
  venue:"Bitget",type:"SPOT",quote:"USDT",
  token:{contract:"0xA991F61940095AEA0724ef54077223B048c5CF7b"},
  scenarios:[10,25,100].map(capital_usdc=>({capital_usdc,status:"open"})),observations:[]};
}
function row(at,bid,ask,pct){
 return {observed_at:at,dna_book_at:at,fx_book_at:at,dna_bid:bid,dna_ask:ask,
  dna_spread_pct:200*(ask-bid)/(ask+bid),fx_bid:1.001,fx_ask:1.002,
  scenarios:[10,25,100].map(capital_usdc=>({
   capital_usdc,status:"valued",pnl_pct:pct,pnl_usdc:capital_usdc*pct/100}))};
}
test("five certified-style DNA snapshots: first alert is a gap, not a fill",()=>{
 const s=base();
 s.observations=[
  row("2026-10-16T16:17:48Z",.2879,.28911,-.83),
  row("2026-10-16T22:49:28Z",.27085,.27276,-6.77),
  row("2026-10-16T23:51:15Z",.28442,.2864,-2.05),
  row("2026-10-17T04:20:55Z",.29556,.29691,1.78),
  row("2026-10-17T12:10:20Z",.27361,.27484,-5.78)];
 const o=study(s);
 assert.equal(o.order_decision,"NO_ORDER");
 assert.equal(o.futures_decision,"INSUFFICIENT_OKX_FUTURES_DATA");
 assert.deepEqual(o.candidate_spot_timestamps,[]);
 assert.equal(o.portfolios[0].first_threshold.kind,"loss");
 assert.equal(o.portfolios[0].first_threshold.observed_pct,-6.77);
 assert.equal(o.portfolios[0].best.pnl_pct,1.78);
 assert.equal(o.portfolios[0].last,-5.78);
});
test("identity, account policy, duplicate time and crossed books fail closed",()=>{
 const s=base();s.observations=[row("2026-10-16T16:17:48Z",.2879,.28911,-.83)];
 assert.throws(()=>study({...s,market:"BTCUSDT"}),/identity/);
 assert.throws(()=>study({...s,executed_order:true}),/policy/);
 const q=structuredClone(s);q.observations.push(structuredClone(q.observations[0]));
 assert.throws(()=>study(q),/time/);
 const b=structuredClone(s);b.observations[0].dna_ask=.27;
 assert.throws(()=>study(b),/integrity/);
});
test("narrow rising Spot candles never authorize a trade",()=>{
 const s=base();s.observations=[
  row("2026-10-16T16:00:00Z",.27,.2708,0),
  row("2026-10-16T17:00:00Z",.28,.2808,0),
  row("2026-10-16T18:00:00Z",.29,.2908,0)];
 const result=study(s);
 assert.equal(result.candidate_spot_timestamps.length,1);
 assert.equal(result.order_decision,"NO_ORDER");
 assert.equal(result.futures_decision,"INSUFFICIENT_OKX_FUTURES_DATA");
});
test("empty history cannot create an entry",()=>{
 const result=study(base());
 assert.equal(result.count,0);
 assert.equal(result.portfolios[0].best,null);
 assert.equal(result.portfolios[0].first_threshold,undefined);
});
