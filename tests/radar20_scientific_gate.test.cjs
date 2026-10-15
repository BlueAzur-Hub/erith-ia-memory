"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const path=require("node:path");
const {evaluate,run}=require("./radar20_scientific_gate.cjs");
const sha="a".repeat(64);
function sample(){
 const frozen={schema:"erith.trader.radar20.forward-protocol.v1",symbols:Array.from({length:20},(_,i)=>"S"+i),simulation_only:true,trading_orders_enabled:false,test_days:90,holding_hours:48,start_day_utc:"2026-10-14",capital_usdt:400};
 const idx={schema:"erith.radar20.forward.index.v1",orders_enabled:false,config_sha256:sha,days:[]};
 const forward={schema:"erith.radar20.forward.summary.v1",no_live_orders:true,strategy_certified:false,days_collected:0,protocol_sha256:sha,status:"WAITING_FOR_FIRST_DAY"};
 const ex={orders_enabled:false,simulations_only:true,account_fees_published:false,protocol_sha256:sha,observations:[{file:"observations/2026-10-14/04.json",signal_candidates:1,okx_book_reports:1,source_status:"ALL_20_COMPLETE"}]};
 const q=(profit,drawdown,trades)=>({orders_enabled:false,strategy_certified:false,primary:{capital_usdt:400,total_profit_net_usdt:profit,final_cash_usdt:400+profit,drawdown_pct:drawdown,completed_trades:trades,assumed_roundtrip_fee_pct:0.8}});
 const obs=[{schema:"erith.trader.radar20.execution-witness.v1",protocol_sha256:sha,orders_enabled:false,paper_only:true,not_an_order_fill:true,authenticated_account_data_accessed:false,authenticated_fee_included:false,offset_after_hour_seconds:100,source_status:"ALL_20_COMPLETE",signals:[{}],okx_books:[{account_fee_included:false,future_fill_guaranteed:false}]}];
 return {frozen,idx,forward,ex,history:q(97.75,32.24,149),stress:q(-222.36,57.17,109),obs};
}
const call=x=>evaluate(x.frozen,x.idx,x.forward,x.ex,x.history,x.stress,x.obs);
test("two distinct quarters, no six-month PnL, empty forward and late OKX evidence",()=>{
 const r=call(sample());
 assert.equal(r.integrity,"PASS");
 assert.equal(r.state,"RESEARCH_ONLY_NOT_VALIDATED");
 assert.deepEqual(r.distinct_retrospective_quarters.map(q=>q.net_usdt),[-222.36,97.75]);
 assert.equal(r.forward.signal_days_remaining,90);
 assert.equal(r.forward.source_days_required,92);
 assert.equal(r.execution_witness.delayed_after_signal_hour,1);
 assert.ok(r.blockers.includes("PROSPECTIVE_90_DAYS_INCOMPLETE"));
 assert.equal(r.profitability_certified,false);
});
test("must reject mismatched protocol",()=>{const s=sample();s.forward.protocol_sha256="b".repeat(64);assert.throws(()=>call(s),/consistent protocol fingerprints/);});
test("must reject fabricated prospective days",()=>{const s=sample();s.forward.days_collected=90;assert.throws(()=>call(s),/forward collection counters/);});
test("90 days of locked signals still require two settlement source days",()=>{
 const s=sample();
 s.idx.days=Array.from({length:90},(_,i)=>({day:new Date(Date.parse("2026-10-14T00:00:00Z")+i*86400000).toISOString().slice(0,10)}));
 s.forward.days_collected=90;s.forward.status="RUNNING";
 const r=call(s);
 assert.equal(r.forward.signal_days_collected,90);
 assert.equal(r.forward.signal_days_remaining,0);
 assert.equal(r.forward.source_days_collected,90);
 assert.equal(r.forward.settlement_days_collected,0);
 assert.ok(r.blockers.includes("SETTLEMENT_WINDOW_INCOMPLETE"));
 assert.ok(!r.blockers.includes("PROSPECTIVE_90_DAYS_INCOMPLETE"));
});
test("day 91 remains valid settlement and day 92 completes collection, never certification",()=>{
 for(const n of [91,92]){
   const s=sample();
   s.idx.days=Array.from({length:n},(_,i)=>({day:new Date(Date.parse("2026-10-14T00:00:00Z")+i*86400000).toISOString().slice(0,10)}));
   s.forward.days_collected=n;s.forward.status=n===92?"COMPLETE":"RUNNING";
   const r=call(s);
   assert.equal(r.forward.source_days_collected,n);
   assert.equal(r.forward.settlement_days_collected,n-90);
   assert.equal(r.profitability_certified,false);
   assert.equal(r.blockers.includes("SETTLEMENT_WINDOW_INCOMPLETE"),n<92);
 }
});
test("reject impossible source count, false completion and missing historical day",()=>{
 const t=sample();t.idx.days=Array.from({length:93},(_,i)=>({day:new Date(Date.parse("2026-10-14T00:00:00Z")+i*86400000).toISOString().slice(0,10)}));t.forward.days_collected=93;t.forward.status="COMPLETE";
 assert.throws(()=>call(t),/bounded 48h settlement/);
 const x=sample();x.forward.status="COMPLETE";assert.throws(()=>call(x),/forward status matches/);
 const y=sample();y.idx.days=[{day:"2026-10-16"}];y.forward.days_collected=1;y.forward.status="RUNNING";
 assert.throws(()=>call(y),/forward days contiguous/);
});
test("must reject real-order claim or fee inclusion",()=>{
 const s=sample();s.obs[0].okx_books[0].account_fee_included=true;assert.throws(()=>call(s),/not an authenticated trade/);
 const t=sample();t.ex.orders_enabled=true;assert.throws(()=>call(t),/never claims fills/);
});
test("must reject any historical capital arithmetic mismatch",()=>{const s=sample();s.history.primary.final_cash_usdt=400;assert.throws(()=>call(s),/capital arithmetic/);});
test("must reject invented or missing observation count",()=>{const s=sample();s.ex.observations[0].signal_candidates=4;assert.throws(()=>call(s),/witness counters/);});
test("repository evidence passes read-only checks, if repository fixture exists",()=>{
 const root=path.resolve(__dirname,"..");
 const r=run(root);
 assert.equal(r.integrity,"PASS");
 assert.equal(r.profitability_certified,false);
 assert.equal(r.execution_witness.authenticated_account_fees,false);
 assert.equal(r.distinct_retrospective_quarters.length,2);
 assert.equal(r.forward.protocol_days,90);
});
