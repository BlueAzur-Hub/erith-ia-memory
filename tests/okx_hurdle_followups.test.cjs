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

test("future-only observations continue older assets without changing selected daily snapshots",()=>{
 const opening=watch.advance(null,qualification());
 const row=qualification("2026-10-19","10.80").candidates[0];
 const later={schema:"erith.radar.okx.public-followup-observation.v1",
  orders_enabled:false,real_orders:0,new_entries_created:0,
  candidates:[row]};
 const future=watch.advanceFutureOnly(opening,later);
 a.equal(future.snapshots.length,opening.snapshots.length);
 a.equal(future.studies.length,opening.studies.length);
 a.equal(future.studies[0].followups.length,1);
 a.equal(future.studies[0].followups[0].window,"24h");
 a.equal(future.studies[0].followups[0].execution_proven,false);
 a.equal(opening.studies[0].followups.length,0,"input journal remains immutable");
 const again=watch.advanceFutureOnly(future,later);
 a.equal(again.studies[0].followups.length,1,"same followup is not counted twice");
});
test("future-only market proof rejects falsified, duplicated or non-USDT rows",()=>{
 const opening=watch.advance(null,qualification());
 const row=qualification("2026-10-19","10.80").candidates[0];
 const observation={schema:"erith.radar.okx.public-followup-observation.v1",
  orders_enabled:false,real_orders:0,candidates:[row]};
 for(const corrupt of [
   {...observation,orders_enabled:true},
   {...observation,candidates:[row,row]},
   {...observation,candidates:[{...row,okx_spot:{...row.okx_spot,quote:"USDC"}}]},
   {...observation,schema:"nonexistent"},
   {...observation,candidates:[{...row,okx_spot:{...row.okx_spot,contract_identity_proven:true}}]}
 ]){
  a.throws(()=>watch.advanceFutureOnly(opening,corrupt));
 }
 const wrong={...row,okx_spot:{...row.okx_spot,best_book:{...row.okx_spot.best_book,
    exchange_time_utc:"2026-10-20T11:00:30Z"}}};
 const tooLate=watch.advanceFutureOnly(opening,{...observation,candidates:[wrong]});
 a.equal(tooLate.studies[0].followups.length,0,"out-of-window quotes cannot close a study");
});

test("future-only CLI writes JSON parseable by the NEXT autonomous run",()=>{
 const fs=require("node:fs"),os=require("node:os"),path=require("node:path");
 const {spawnSync}=require("node:child_process");
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"radar-json-"));
 try{
  const root=path.join(tmp,"public","agent_crypto_erith_ia");
  const toolsDir=path.join(root,"tools"),trader=path.join(root,"trader");
  const data=path.join(root,"data","crypto","radar-opportunities");
  for(const dir of [toolsDir,trader,data])fs.mkdirSync(dir,{recursive:true});
  fs.copyFileSync(path.join(__dirname,"../public/agent_crypto_erith_ia/tools/build_okx_hurdle_followups.cjs"),
   path.join(toolsDir,"build_okx_hurdle_followups.cjs"));
  fs.copyFileSync(path.join(__dirname,"../public/agent_crypto_erith_ia/trader/spot-paper-order-engine.js"),
   path.join(trader,"spot-paper-order-engine.js"));
  const first=watch.advance(null,qualification());
  const ledger=path.join(data,"okx-hurdle-followups.json");
  fs.writeFileSync(ledger,JSON.stringify(first,null,2)+"\n");
  const row=qualification("2026-10-19","10.80").candidates[0];
  const observation=path.join(tmp,"future.json");
  fs.writeFileSync(observation,JSON.stringify({
   schema:"erith.radar.okx.public-followup-observation.v1",
   orders_enabled:false,real_orders:0,new_entries_created:0,candidates:[row]}));
  const cmd=path.join(toolsDir,"build_okx_hurdle_followups.cjs");
  const call=spawnSync(process.execPath,[cmd,"--future-only",observation],{encoding:"utf8",timeout:10000});
  a.equal(call.status,0,call.stderr);
  const summary=JSON.parse(call.stdout.trim());
  a.equal(summary.status,"READ_ONLY_QUOTES");
  a.equal(summary.followups,1);
  const updated=JSON.parse(fs.readFileSync(ledger,"utf8"));
  a.equal(updated.studies[0].followups.length,1);
  const again=spawnSync(process.execPath,[cmd,"--future-only",observation],{encoding:"utf8",timeout:10000});
  a.equal(again.status,0,again.stderr);
  a.equal(JSON.parse(again.stdout.trim()).changed,false);
  a.equal(JSON.parse(fs.readFileSync(ledger,"utf8")).studies[0].followups.length,1);
 }finally{fs.rmSync(tmp,{recursive:true,force:true})}
});
