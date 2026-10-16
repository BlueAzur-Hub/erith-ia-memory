"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {validate,evolve,entry,evaluate,buyWithQuote,sellBase,HORIZON,BUDGETS}=require("./neosoul_dna_paper.cjs");
const T0=Date.UTC(2026,9,16,17,0,0);
function instrument(symbol){
 return {code:"00000",data:[{category:"SPOT",symbol,baseCoin:symbol.slice(0,-4),
 quoteCoin:"USDT",status:"online",launchTime:"1792152000000",
 minOrderAmount:"1",quantityPrecision:"6"}]};
}
function orderbook(bids,asks,at=T0-2000){
 return {code:"00000",data:{ts:String(at),b:bids.map(x=>x.map(String)),a:asks.map(x=>x.map(String))}};
}
function payload(overrides={}){
 return {dnaInstrument:instrument("DNAUSDT"),fxInstrument:instrument("USDCUSDT"),
  dnaBook:orderbook([[0.299,10000],[0.298,10000]],[[0.301,10000],[0.302,10000]]),
  fxBook:orderbook([[0.9995,10000]],[[1.0005,10000]]),...overrides};
}
const initial=()=>({schema:"erith.dna.paper.48h.v1",status:"waiting_source",executed_order:false,started_at:null,scenarios:[],observations:[]});
test("verified Bitget SPOT quote keeps DNA and USDCUSDT as distinct markets",()=>{
 const s=validate(payload(),T0);
 assert.equal(s.market,"DNAUSDT");assert.equal(s.fx_market,"USDCUSDT");
 assert.ok(s.dna.ask>s.dna.bid);assert.ok(s.fx.ask>s.fx.bid);
 assert.equal(s.token_contract,"0xA991F61940095AEA0724ef54077223B048c5CF7b");
});
test("three independent entry sizes, costs and nonzero spread generate negative immediate exit",()=>{
 const s=validate(payload(),T0),state=evolve(initial(),s,T0);
 assert.equal(state.status,"open");
 assert.deepEqual(state.scenarios.map(x=>x.capital_usdc),BUDGETS);
 assert.ok(state.scenarios.every(x=>x.status==="open"));
 assert.equal(state.observations.length,1);
 const p=state.observations[0].scenarios;
 assert.ok(p.every(x=>x.status==="valued"&&x.pnl_usdc<0));
 assert.ok(p.every(x=>x.exit_usdc>0&&x.exit_usdc<x.capital_usdc));
 assert.ok(p[2].pnl_usdc<p[0].pnl_usdc);
 assert.equal(state.ends_not_before,new Date(T0+HORIZON).toISOString());
});
test("observation before 48h never finalizes or invents profit",()=>{
 const s=validate(payload(),T0),state=evolve(initial(),s,T0);
 const advance=evolve(state,validate(payload({
  dnaBook:orderbook([[0.320,10000]],[[0.322,10000]],T0+HORIZON-30000)
 }),T0+HORIZON-29000),T0+HORIZON-29000);
 assert.equal(advance.status,"open");assert.equal(advance.observations.length,2);
 assert.ok(advance.observations[1].scenarios[0].pnl_usdc>0);
});
test("final outcome uses actual observed book after 48h, never filled in from history",()=>{
 const s=validate(payload(),T0),first=evolve(initial(),s,T0),now=T0+HORIZON+360000;
 const final=evolve(first,validate(payload({
  dnaBook:orderbook([[0.340,10000]],[[0.342,10000]],now-5000),
  fxBook:orderbook([[0.9992,10000]],[[1.0007,10000]],now-5000)
 }),now),now);
 assert.equal(final.status,"complete");assert.equal(final.completed_at,new Date(now).toISOString());
 assert.equal(final.final.length,3);
 assert.ok(final.final.every(x=>x.pnl_usdc>0));
 assert.deepEqual(evolve(final,validate(payload(),T0),T0),final);
});
test("wrong instrument, missing bid, crossed or old books fail closed",()=>{
 assert.throws(()=>validate(payload({dnaInstrument:instrument("OTHERUSDT")}),T0),/DNAUSDT Spot/);
 assert.throws(()=>validate(payload({dnaBook:orderbook([],[[0.3,1]])}),T0),/missing/);
 assert.throws(()=>validate(payload({dnaBook:orderbook([[0.5,5]],[[0.3,5]])}),T0),/crossed/);
 assert.throws(()=>validate(payload({dnaBook:orderbook([[0.2,5]],[[0.3,5]],T0-300000)}),T0),/stale/);
});
test("insufficient order-book depth rejects 100 without filling at top-of-book",()=>{
 const s=validate(payload({dnaBook:orderbook([[0.299,1000]],[[0.301,180]])}),T0);
 const state=evolve(initial(),s,T0);
 assert.equal(state.scenarios[0].status,"open");
 assert.equal(state.scenarios[1].status,"open");
 assert.equal(state.scenarios[2].status,"blocked");
 assert.match(state.scenarios[2].reason,/asks insufficient/);
});
test("minimum amount and precision checked: blocked is not a loss or fabricated fill",()=>{
 const s=validate(payload({dnaInstrument:{code:"00000",data:[{
  ...instrument("DNAUSDT").data[0],minOrderAmount:"20"}]}}),T0);
 const state=evolve(initial(),s,T0);
 assert.equal(state.scenarios[0].status,"blocked");
 assert.equal(state.observations[0].scenarios[0].status,"blocked");
 assert.equal(state.observations[0].scenarios[0].pnl_usdc,undefined);
});
test("do not confuse orders with observed coin prices",()=>{
 assert.equal(buyWithQuote([{price:2,quantity:1}],10),null);
 assert.equal(sellBase([{price:1,quantity:1}],4),null);
 assert.throws(()=>evolve({...initial(),executed_order:true},validate(payload(),T0),T0),/order policy/);
});
