"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const core=require("./trader-paper-decision-core.js");
const engine=require("./spot-paper-order-engine.js");
const NOW=Date.parse("2026-10-20T00:00:00Z");
function selected(id="test-market"){
 return {ok:true,asset:"TOK",coinId:id,provider:"coingecko",currency:"USD",
  sourceIdentity:"coingecko|TOK-USD|USD|"+id,ageMs:30000};
}
function signal(){
 return {schema:"erith.radar.signal-evidence-audit.v1",
  kind:"RESEARCH_AUDIT_NOT_STRATEGY_SELECTION",
  orders_enabled:false,strategy_certified:false,real_orders:0,paper_fills:0,
  top50_retro_7d:{true_unseen_holdout:false,source_quote:"USD",
   periods:{later_descriptive_validation:{
     signals_total:46,followups_observed:36,followups_missing:10,
     mean_observed_gross_change_pct:-5.18728}}},
  radar_forward_j1:{quote:"USD"},okx_context:{quote:"USDT",
   no_executable_returns_derived_from_usd:true}};
}
function candidate(){
 return {id:"test-market",symbol:"TOK",identity_status:"SYMBOL_ONLY_NOT_COIN_ID_PROVEN",
  okx_spot:{venue:"OKX",pair:"TOK-USDT",quote:"USDT",
   pair_observed:true,native_rules_verified:true,
   contract_identity_proven:false,account_access_proven:false,
   real_fees_proven:false,real_orders_enabled:false,
   rules:{source:"OKX_PUBLIC_SPOT_INSTRUMENT",min_sz:"1",lot_sz:"0.01",tick_sz:"0.01",
    contract_identity_proven:false,fees_proven:false,orders_enabled:false},
   best_book:{schema:"erith.radar.okx.spot-best-book.v1",source:"OKX_PUBLIC_SPOT_BOOK",
    pair:"TOK-USDT",quote:"USDT",
    exchange_time_utc:"2026-10-19T23:59:30Z",
    collected_at_utc:"2026-10-19T23:59:31Z",
    best_bid_usdt:"9.90",best_ask_usdt:"10.00",
    best_bid_qty:"100",best_ask_qty:"100",
    market_execution_proven:false,fees_verified:false,orders_enabled:false}}};
}
function qualification(row=candidate()){
 return {schema:"erith.radar.spot-qualification.v1",quote:"USDT",
  actual_execution_permissions:false,real_orders_enabled:false,
  coin_id_matches_exchange_symbol_verified:false,
  candidates:[row,...Array.from({length:19},(_,i)=>({id:"other"+i,symbol:"OT"+i}))]};
}
function assess(override={}){
 return core.assess({selected:selected(),qualification:qualification(),
  signal:signal(),engine,now:NOW,...override});
}
test("a fresh exactly matched OKX book is only A_ETUDIER cost research, not buy",()=>{
 const r=assess();
 assert.equal(r.decision,"A_ETUDIER");
 assert.equal(r.pair,"TOK-USDT");
 assert.ok(r.break_even_bid_rise_pct>0);
 assert.ok(r.immediate_paper_loss_pct<0);
 assert.match(r.context,/pas cette paire/);
 assert.equal(r.orders_enabled,false);
 assert.equal(r.executable,false);
 assert.equal(r.contract_identity_proven,false);
 assert.equal(r.actual_fees_verified,false);
 assert.equal(r.account_access_verified,false);
 assert.equal(r.strategy_certified,false);
 assert.equal(engine.realOrders,false);
 assert.equal(engine.tradeEndpoint,null);
});
test("invalid or ambiguous CoinGecko asset never borrows a symbol's OKX book",()=>{
 assert.equal(assess({selected:selected("other-market")}).decision,"PREUVES_INSUFFISANTES");
 assert.equal(assess({selected:{...selected(),sourceIdentity:"wrong"}}).decision,"PREUVES_INSUFFISANTES");
 assert.equal(assess({selected:{...selected(),ageMs:16*60000}}).decision,"PREUVES_INSUFFISANTES");
 assert.equal(assess({selected:{ok:true,asset:"CT",coinId:null,provider:"okx"}}).decision,"PREUVES_INSUFFISANTES");
 const q=qualification();
 q.candidates[1]={id:"other2",symbol:"TOK"};
 assert.equal(assess({qualification:q}).decision,"PREUVES_INSUFFISANTES");
});
test("stale public books are useful context, NOT a decision today",()=>{
 const old=candidate();old.okx_spot.best_book.exchange_time_utc="2026-10-19T20:59:54Z";
 old.okx_spot.best_book.collected_at_utc="2026-10-19T20:59:54Z";
 const r=assess({qualification:qualification(old)});
 assert.equal(r.decision,"PREUVES_INSUFFISANTES");
 assert.match(r.reason,/trop ancien/);
});
test("fresh minimum or visible liquidity refusal REJETER only 100 USDT scenario",()=>{
 const qty=candidate();qty.okx_spot.rules.min_sz="10";
 const result=assess({qualification:qualification(qty)});
 assert.equal(result.decision,"REJETER");
 assert.match(result.reason,/GROSS_QUANTITY_BELOW_OKX_MINIMUM/);
 const depth=candidate();depth.okx_spot.best_book.best_ask_qty="2";
 assert.equal(assess({qualification:qualification(depth)}).decision,"REJETER");
 const sell=candidate();sell.okx_spot.best_book.best_bid_qty="2";
 assert.equal(assess({qualification:qualification(sell)}).decision,"REJETER");
});
test("wrong Spot source and invalid price evidence fail closed",()=>{
 const swap=candidate();swap.okx_spot.rules.source="OKX_FUTURES";
 assert.equal(assess({qualification:qualification(swap)}).decision,"PREUVES_INSUFFISANTES");
 const bad=candidate();bad.okx_spot.best_book.best_bid_usdt="10.05";
 assert.equal(assess({qualification:qualification(bad)}).decision,"PREUVES_INSUFFISANTES");
 const book=candidate();book.okx_spot.best_book.exchange_time_utc="2026-10-19T23:00:00Z";
 assert.equal(assess({qualification:qualification(book)}).decision,"PREUVES_INSUFFISANTES");
 const q=qualification();q.candidates.pop();
 assert.equal(assess({qualification:q}).decision,"PREUVES_INSUFFISANTES");
});
test("absent or false strategy evidence never declares an opportunity",()=>{
 assert.equal(assess({signal:null}).decision,"PREUVES_INSUFFISANTES");
 assert.equal(assess({signal:{...signal(),strategy_certified:true}}).decision,"PREUVES_INSUFFISANTES");
 assert.equal(assess({engine:null}).decision,"PREUVES_INSUFFISANTES");
});
test("read-only add-on reuses old Trader Lab, no new page, no orders",()=>{
 const parent=__dirname;
 const mirror=fs.readFileSync(path.join(parent,"trader-runtime-mirror.js"),"utf8");
 const lab=fs.readFileSync(path.join(parent,"trader-paper-lab-view.js"),"utf8");
 const view=fs.readFileSync(path.join(parent,"trader-paper-decision-view.js"),"utf8");
 assert.match(mirror,/view\.onload=/);
 assert.match(mirror,/trader-paper-decision-core\.js/);
 assert.match(mirror,/trader-paper-decision-view\.js/);
 assert.match(view,/getElementById\("traderPaperLab"\)/);
 assert.match(view,/parent\.insertBefore\(section,more\)/);
 assert.match(view,/AgentCryptoTraderPaperLab\?\.source/);
 assert.match(view,/qualification-latest\.json/);
 assert.match(view,/signal-evidence\.json/);
 assert.match(view,/fetch\(BASE\+/);
 assert.match(view,/cache:"no-store"/);
 assert.match(view,/requestId\+\+/);
 assert.doesNotMatch(view,/\/(trade|okx)\/order|localStorage|sessionStorage|setInterval/);
 assert.doesNotMatch(lab,/fetch\(/,"existing PAPER lab keeps the no-network invariant");
 assert.doesNotMatch(mirror,/atlasSelectMarketCoin\(|scrollIntoView\(/);
 assert.equal(core.network,false);
 assert.equal(core.storage,false);
});
