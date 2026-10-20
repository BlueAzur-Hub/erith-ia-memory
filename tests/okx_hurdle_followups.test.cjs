"use strict";
const test=require("node:test"),a=require("node:assert/strict");
const watch=require("../public/agent_crypto_erith_ia/tools/build_okx_hurdle_followups.cjs");
function qualification(day="2026-10-18",bid="9.90",bidQty="100",quote="USDT"){
 const qualified=day+"T10:00:00Z",bookAt=day+"T10:00:30Z",collected=day+"T10:01:00Z";
 const ask=(Number(bid)>=10?(Number(bid)+0.10).toFixed(2):"10.50");
 const coin={id:"test-asset",symbol:"TOK",identity_status:"SYMBOL_ONLY_NOT_COIN_ID_PROVEN",
   okx_spot:{venue:"OKX",quote,pair:"TOK-"+quote,pair_observed:true,
      native_rules_verified:true,contract_identity_proven:false,
      real_orders_enabled:false,rules:{source:"OKX_PUBLIC_SPOT_INSTRUMENT",
       min_sz:"1",lot_sz:"0.01",tick_sz:"0.01",
       contract_identity_proven:false,fees_proven:false,orders_enabled:false},
      best_book:{schema:"erith.radar.okx.spot-best-book.v1",
       source:"OKX_PUBLIC_SPOT_BOOK",pair:"TOK-"+quote,quote,
       exchange_time_utc:bookAt,collected_at_utc:collected,
       best_bid_usdt:bid,best_ask_usdt:ask,
       best_bid_qty:bidQty,best_ask_qty:"100",
       market_execution_proven:false,fees_verified:false,orders_enabled:false}}};
 const candidates=[coin,...Array.from({length:19},(_,i)=>({
   id:"other-"+i,symbol:"OT"+i,identity_status:"SYMBOL_ONLY_NOT_COIN_ID_PROVEN",
   okx_spot:{venue:"OKX",quote:"USDT",pair:null,pair_observed:false,
     native_rules_verified:false,contract_identity_proven:false,
     real_orders_enabled:false,rules:null,best_book:null}}))];
 return {schema:"erith.radar.spot-qualification.v1",
   qualified_at_utc:qualified,source_observation_date_utc:day,
   quote:"USDT",real_orders_enabled:false,actual_execution_permissions:false,
   coin_id_matches_exchange_symbol_verified:false,candidates};
}
test("archives exact first qualifying book with all 20 candidates as denominator",()=>{
 const a1=watch.advance(null,qualification());
 a.equal(a1.schema,watch.SCHEMA);a.equal(a1.snapshots.length,1);
 a.equal(a1.snapshots[0].candidates,20);a.equal(a1.snapshots[0].cost_evaluable,1);
 a.equal(a1.studies.length,1);a.equal(a1.studies[0].followups.length,0);
 a.equal(a1.studies[0].executed_order,false);a.equal(a1.orders_enabled,false);
 a.equal(watch.advance(a1,qualification()).studies.length,1);
});
test("24h later same-venue quote can cross hurdle without being a fill",()=>{
 const prior=watch.advance(null,qualification());
 const next=watch.advance(prior,qualification("2026-10-19","10.80"));
 a.equal(next.studies.length,2,"new day also enters a prospectively dated study");
 const seen=next.studies[0].followups;
 a.equal(seen.length,1);a.equal(seen[0].window,"24h");
 a.equal(seen[0].elapsed_hours,24);
 a.equal(seen[0].status,"QUOTE_ABOVE_HYPOTHETICAL_HURDLE");
 a.equal(seen[0].execution_proven,false);
 a.equal(seen[0].orders_enabled,false);a.equal(seen[0].real_orders,0);
 a.equal(seen[0].hypothetical_pnl_usdt[0]==="-",false);
});
test("below threshold is a quoted theoretical loss, not a realized loss",()=>{
 const previous=watch.advance(null,qualification());
 const checked=watch.advance(previous,qualification("2026-10-19","9.60"));
 a.equal(checked.studies[0].followups[0].status,"QUOTE_BELOW_HYPOTHETICAL_HURDLE");
 a.ok(checked.studies[0].followups[0].hypothetical_pnl_pct<0);
 a.equal(checked.studies[0].followups[0].execution_proven,false);
});
test("insufficient best bid depth never counts as positive quote-based exit",()=>{
 const previous=watch.advance(null,qualification());
 const checked=watch.advance(previous,qualification("2026-10-19","10.40","1"));
 const first=checked.studies[0].followups[0];
 a.equal(first.status,"INSUFFICIENT_BEST_BID_DEPTH");
 a.equal(first.hypothetical_pnl_usdt,null);
});
test("same-day replay, missing market, 48h follow-up and backdated data",()=>{
 let state=watch.advance(null,qualification());
 state=watch.advance(state,qualification());
 a.equal(state.studies[0].followups.length,0);
 const absent=qualification("2026-10-19");absent.candidates[0].okx_spot.best_book=null;
 const missing=watch.advance(state,absent);
 a.equal(missing.studies[0].followups.length,0);
 state=watch.advance(state,qualification("2026-10-19","9.90"));
 const last=watch.advance(state,qualification("2026-10-20","10.50"));
 a.deepEqual(last.studies[0].followups.map(f=>f.window),["24h","48h"]);
 a.throws(()=>watch.advance(last,qualification("2026-10-17")),/désordre/);
});
test("crossed future bid or price off native tick does not count as an exit",()=>{
 const initial=watch.advance(null,qualification());
 const cross=qualification("2026-10-19","10.40");
 cross.candidates[0].okx_spot.best_book.best_ask_usdt="10.30";
 const bad=watch.advance(initial,cross);
 a.equal(bad.studies[0].followups.length,0);
 const off=qualification("2026-10-19","10.401");
 a.equal(watch.advance(initial,off).studies[0].followups.length,0);
});
test("USDC, bad identity, wrong future venue or invalid source fails closed",()=>{
 const q=qualification();q.candidates[0].okx_spot.quote="USDC";
 const result=watch.advance(null,q);
 a.equal(result.studies.length,0);
 let first=watch.advance(null,qualification());
 const bad=qualification("2026-10-19");
 bad.candidates[0].okx_spot.rules.source="OKX_FUTURES";
 first=watch.advance(first,bad);
 a.equal(first.studies[0].followups.length,0);
});
test("existing incompatible storage must not be silently reset",()=>{
 a.throws(()=>watch.advance({schema:"WRONG"},qualification()),/incompatible/);
});
