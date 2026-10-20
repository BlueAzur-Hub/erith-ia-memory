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

test("automatic historical reading accepts BTC with existing PAPER lab proof, not OKX fills",()=>{
 const proof={ok:true,asset:"BTC",instrument:"BTC-USD",provider:"coingecko",
  currency:"USD",lastAt:"2026-10-20T03:56:50Z",
  sourceIdentity:"coingecko|BTC-USD|USD"};
 const historical={ok:true,asset:"BTC",sourceIdentity:proof.sourceIdentity,
  firstAt:"2026-10-19T04:00:00Z",lastAt:proof.lastAt,
  windows:276,profitablePct:0,medianProfit:-0.03482,
  bestProfit:-0.00653,worstProfit:-0.08947,capital:5,
  overlapping:true,retrospective:true,predictive:false,
  realOrders:false,feesProven:false};
 const summary=core.summarizeHistorical(historical,proof);
 assert.equal(summary.status,"HISTORICAL_ONLY");
 assert.equal(summary.windows,276);
 assert.equal(summary.positive_windows_pct,0);
 assert.equal(summary.median_profit_notional_usd,-0.03482);
 assert.equal(summary.orders_enabled,false);
 assert.equal(summary.strategy_certified,false);
 assert.equal(summary.okx_costs_verified,false);
 assert.equal(core.assess({selected:proof,now:NOW}).decision,"PREUVES_INSUFFISANTES");
 assert.match(core.assess({selected:proof,now:NOW}).reason,/BTC/);
});
test("historic summaries fail closed on other coins, forged profits, and absent records",()=>{
 const selected= {ok:true,asset:"BTC",sourceIdentity:"coingecko|BTC-USD|USD"};
 const valid={ok:true,asset:"BTC",sourceIdentity:selected.sourceIdentity,
  windows:22,profitablePct:10,medianProfit:-0.01,bestProfit:0.1,
  worstProfit:-0.4,capital:5,firstAt:"2026-10-18T02:00:00Z",
  lastAt:"2026-10-19T02:00:00Z",overlapping:true,retrospective:true,
  predictive:false,realOrders:false,feesProven:false};
 for(const bad of [
  {...valid,asset:"CT"},
  {...valid,realOrders:true},
  {...valid,overlapping:false},
  {...valid,feesProven:true},
  {...valid,medianProfit:Infinity},
  {...valid,windows:0},
  {...valid,profitablePct:101},
  null
 ])assert.equal(core.summarizeHistorical(bad,selected).status,"NOT_AVAILABLE");
});
test("the diagnostic refreshes on chart proof changes, without a new timer or reset",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const view=fs.readFileSync(path.join(__dirname,"trader-paper-decision-view.js"),"utf8");
 assert.match(view,/paper\.historicalStudy\(s\.input,cfg,s\.historical\.asOf\)/);
 assert.match(view,/core\.summarizeHistorical\(study,s\.historical\.qualified\)/);
 assert.match(view,/agent-crypto:graph-context-ready/);
 assert.match(view,/void evaluate\(false\)/);
 assert.match(view,/next===box\.dataset\.lastSelection/);
 assert.match(view,/data-decision-collector/);
 assert.match(view,/okx-hurdle-followups\.json/);
 assert.doesNotMatch(view,/Sélection modifiée : relancer/);
 assert.doesNotMatch(view,/setInterval\s*\(|localStorage|sessionStorage|\/api\/v5\/trade/);
});

test("a real BTC cache 20min old remains historical-only, not a current Spot quote",()=>{
 const paper=require("./trader-paper-lab-core.js");
 const now=Date.parse("2026-10-20T02:17:00Z");
 const end=now-20*60*1000-10*1000;
 const points=Array.from({length:289},(_,i)=>[
  end-(288-i)*5*60000,
  82000+i*0.25+Math.sin(i/5)*19
 ]);
 const input={asset:"BTC",instrument:"BTC-USD",provider:"coingecko",currency:"USD",
  source:"CoinGecko BTC USD direct",series:points};
 const live=paper.qualify(input,now);
 assert.equal(live.ok,false);
 assert.match(live.reason,/15 min/);
 const dated=core.qualifyHistoricalAsOf(input,paper,now);
 assert.equal(dated.ok,true);
 assert.ok(dated.ageMinutes>20&&dated.ageMinutes<21);
 assert.equal(dated.spotExecutionPermitted,false);
 const cfg={capital:5,entryFeePct:0.2,exitFeePct:0.2,
  spreadPct:0.1,slippagePct:0.1};
 const study=paper.historicalStudy(input,cfg,dated.asOf);
 const result=core.summarizeHistorical(study,dated.qualified);
 assert.equal(result.status,"HISTORICAL_ONLY");
 assert.equal(result.windows,277);
 assert.equal(result.orders_enabled,false);
 assert.equal(result.actual_executions,0);
 assert.equal(core.assess({selected:live,now}).decision,"PREUVES_INSUFFISANTES");
});
test("historical clock cannot accept future quotes, old archives or invalid identity",()=>{
 const paper=require("./trader-paper-lab-core.js");
 const now=Date.parse("2026-10-20T02:17:00Z");
 const end=now-20*60000;
 const input={asset:"BTC",instrument:"BTC-USD",provider:"coingecko",currency:"USD",
  source:"CoinGecko BTC USD direct",
  series:Array.from({length:26},(_,i)=>[end-(25-i)*60000,82000+i])};
 assert.equal(core.qualifyHistoricalAsOf(input,paper,now).ok,true);
 assert.equal(core.qualifyHistoricalAsOf(input,paper,end-1000).ok,false);
 assert.equal(core.qualifyHistoricalAsOf(input,paper,now+49*3600000).ok,false);
 assert.equal(core.qualifyHistoricalAsOf({...input,source:"Unknown API"},paper,now).ok,false);
 const wrong={...input,instrument:"ETH-USD"};
 assert.equal(core.qualifyHistoricalAsOf(wrong,paper,now).ok,false);
});
test("Radar status fetch stays reachable even when live selection is stale",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const view=fs.readFileSync(path.join(__dirname,"trader-paper-decision-view.js"),"utf8");
 const src=view.slice(view.indexOf("async function evaluate("),view.indexOf("function invalidate("));
 assert.match(src,/renderHistory\(s\)/);
 assert.match(src,/const \{qualification,signal,journal\}=await reports\(\)/);
 assert.match(src,/if\(!s\.qualified\)/);
 assert.doesNotMatch(src,/if\(!s\.qualified\)\s*\{[\s\S]{0,280}return;/);
 assert.match(src,/Report status is independent/);
 assert.match(view,/qualifyHistoricalAsOf/);
 assert.match(view,/Cotation actuelle indisponible/);
 assert.match(view,/ÉTUDE HISTORIQUE DIFFÉRÉE/);
});
