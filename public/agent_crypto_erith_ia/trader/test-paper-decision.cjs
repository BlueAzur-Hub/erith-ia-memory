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

test("CT ticket identity survives new candles, not a new asset or source",()=>{
 const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
 const view=fs.readFileSync(path.join(__dirname,"trader-paper-decision-view.js"),"utf8");
 const begin=view.indexOf("function ticketSourceKey("),end=view.indexOf("function invalidate(",begin);
 assert.ok(begin>0&&end>begin);
 const key=vm.runInNewContext(view.slice(begin,end)+"\nticketSourceKey",Object.create(null));
 const ct={asset:"CT",coinId:"concrete",provider:"okx",instrument:"CT/USDT",
   currency:"USD",source:"OKX CT/USDT candles · USDT/USD CoinGecko",
   series:[[1,0.32],[2,0.31]]};
 assert.equal(key(ct),key({...ct,series:[[2,0.31],[3,0.30]],lastAt:"later"}));
 assert.equal(key(ct),key({...ct,instrument:"CT-USDT"}));
 assert.notEqual(key(ct),key({...ct,asset:"BTC"}));
 assert.notEqual(key(ct),key({...ct,instrument:"CT-USDC"}));
 assert.notEqual(key(ct),key({...ct,provider:"binance"}));
 assert.notEqual(key(ct),key({...ct,source:"wrong provider"}));
 assert.match(view,/nextSourceKey!==ticket\.dataset\.ticketSourceKey/);
 assert.match(view,/ticketSourceKey\(fresh\)!==sourceKey/);
 assert.match(view,/ticketSourceKey\(currentSource\)!==sourceKey/);
 assert.match(view,/Contrôle privé : /);
 // Run the actual invalidation code, not just a source-text assertion.
 const guard=view.slice(begin,view.indexOf("/* Order planning",end));
 let input=ct,seen="",updated=0;
 const ticket={open:true,dataset:{ticketSourceKey:key(ct)}};
 const box={open:true,dataset:{lastSelection:"coin|before"}};
 const ctx={
  panel:()=>box,document:{getElementById:()=>ticket},
  selection:()=>({input,historical:input?{
    qualified:{sourceIdentity:"coin",lastAt:"after"}
   }:null,historicalReason:"source non disponible"}),
  ticketStatus:x=>{seen=x},evaluate:()=>{updated++}
 };
 const execute=vm.runInNewContext(
  'let ticketRequest=0,requestId=0,lastStudyKey="existing";'+
  guard+';({run:invalidate,count:()=>ticketRequest})',ctx);
 execute.run();
 assert.equal(seen,""); // a new candle cannot invalidate the ticket
 assert.equal(execute.count(),0);
 assert.ok(updated>0); // but historical analysis may update
 input=null;execute.run();
 assert.match(seen,/Actif du graphique modifié/);
 assert.equal(execute.count(),1);
 input={...ct,asset:"BTC"};ticket.dataset.ticketSourceKey=key(ct);seen="";
 execute.run();
 assert.match(seen,/Actif du graphique modifié/);
 assert.equal(execute.count(),2);
});
test("OKX account snapshot remains usable during ordinary panel refresh",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const code=fs.readFileSync(path.join(__dirname,"trader-okx-account.js"),"utf8");
 const fn=code.slice(code.indexOf("async function ticketReadOnly("),code.indexOf("function feeLabel("));
 assert.doesNotMatch(fn,/panel\(\)\?\.dataset\.state!=="ready"/);
 assert.match(fn,/await refresh\(\{force:false\}\)/);
 assert.match(fn,/return summarizeTicketAccount\(ctCycleAccount,fees,instId,Date\.now\(\)\)/);
 assert.match(fn,/\["locked","error"\]/);
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
 assert.match(src,/const \{qualification,signal,journal,health\}=await reports\(\)/);
 assert.match(src,/if\(!s\.qualified\)/);
 assert.doesNotMatch(src,/if\(!s\.qualified\)\s*\{[\s\S]{0,280}return;/);
 assert.match(src,/Report status is independent/);
 assert.match(view,/qualifyHistoricalAsOf/);
 assert.match(view,/Cotation actuelle indisponible/);
 assert.match(view,/ÉTUDE HISTORIQUE DIFFÉRÉE/);
});

test("Trader distinguishes missing journal, stale heartbeat and published daily archive",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const view=fs.readFileSync(path.join(__dirname,"trader-paper-decision-view.js"),"utf8");
 assert.match(view,/radar-automation-health\.json/);
 assert.match(view,/WAITING_DAILY_ARCHIVE/);
 assert.match(view,/DAILY_ARCHIVE_MISSING/);
 assert.match(view,/QUALIFICATION_MISSING/);
 assert.match(view,/JOURNAL_NOT_PUBLISHED_FOR_TODAY/);
 assert.match(view,/PROSPECTIVE_JOURNAL_PUBLISHED/);
 assert.match(view,/healthAge<=18\*3600000/);
 assert.match(view,/Dernier contrôle/);
 assert.match(view,/Les horaires programmés ne constituent pas une preuve/);
});

/* Exactly the publicly observed OKX BTC/USDC Spot lot rules and best book.
   All values dated, NOT current account/quote data or investment advice. */
function btcSource(){return{asset:"BTC",coinId:"bitcoin",instrument:"BTC-USD",
 provider:"coingecko",currency:"USD"}}
function ticketArchive(){
 const pair="BTC-USDC",time="2026-10-20T03:18:44Z";
 return{schema:"erith.radar.okx-hourly-spot.v1",date_utc:"2026-10-20",
  orders_enabled:false,real_orders:0,paper_fills:0,
  hours:[{schema:"erith.radar.okx-hourly-spot.v1",hour_utc:"2026-10-20T03Z",
   observed_at_utc:time,instrument_type:"SPOT",no_quote_conversion:true,
   orders_enabled:false,real_orders:0,paper_fills:0,
   markets:[{pair,base:"BTC",quote:"USDC",status:"VERIFIED_PUBLIC_BOOK",
    rules:{minSz:"0.0001",lotSz:"0.00000001",tickSz:"0.1"},
    book5:{source_at_utc:time,market_fill_proven:false,
      bids:[["81780.5","0.02471696"]],asks:[["81780.6","0.04512476"]]}}]}]};
}
const T=Date.parse("2026-10-20T03:19:00Z");
function ticket(budget="10",override={}){
 return core.prepareSpotTicket({selected:btcSource(),archive:ticketArchive(),
  pair:"BTC-USDC",budgetQuote:budget,now:T,...override});
}
test("5 USDC is below the observed native BTC-USDC buy minimum",()=>{
 const r=ticket("5");
 assert.equal(r.status,"PREPARATION_NON_EXECUTABLE");
 assert.equal(r.native_min_quantity,"0.0001");
 assert.equal(r.minimum_buy_at_recorded_ask_quote,"8.17806");
 assert.equal(r.buy_quantity_minimum_met,false);
 assert.equal(r.net_exit_quantity_minimum_met,false);
 assert.match(r.blockers.join("|"),/minimum natif/i);
 assert.equal(r.account_verified,false);
 assert.equal(r.can_place_limit_order,false);
 assert.equal(r.trade_endpoint,null);
 assert.equal(r.orders_enabled,false);
});
test("10 USDC can meet public gross rule yet STILL fail net BASE-fee exit",()=>{
 const r=ticket("10");
 assert.equal(r.buy_quantity_minimum_met,true);
 assert.equal(r.net_exit_quantity_minimum_met,true);
 assert.ok(Number(r.sellable_lot_quantity)<Number(r.gross_buy_quantity));
 assert.ok(Number(r.estimated_base_fee)>0);
 assert.ok(Number(r.unsellable_dust)>=0);
 assert.ok(Number(r.hypothetical_immediate_exit_quote)<
   Number(r.hypothetical_buy_cost_quote));
 assert.ok(Number(r.hypothetical_break_even_bid_quote)>81780.5);
 assert.equal(r.fees_verified,false);
 assert.equal(r.trading_balance_verified,false);
 assert.equal(r.notional_filter_verified,false);
 assert.equal(r.executable,false);
 assert.equal(r.has_submit_action,false);
});
test("base fee makes an exactly-minimum native purchase NOT resellable",()=>{
 const r=ticket("8.17806");
 assert.equal(r.buy_quantity_minimum_met,true);
 assert.equal(r.net_exit_quantity_minimum_met,false);
 assert.match(r.blockers.join("|"),/revente au minimum natif/i);
 assert.equal(r.orders_enabled,false);
});
test("coin identity and exact quote pair never borrowed from another crypto",()=>{
 for(const selected of [
   {...btcSource(),coinId:"ethereum"},
   {...btcSource(),asset:"CT",coinId:"concrete"},
   {...btcSource(),provider:"okx"},
   {...btcSource(),instrument:"BTC-USDT"}
 ])assert.equal(ticket("10",{selected}).status,"BLOQUE");
 assert.equal(ticket("10",{pair:"ETH-USDC"}).status,"BLOQUE");
 assert.equal(ticket("10",{pair:"BTC-EUR"}).status,"BLOQUE");
});
test("stale books remain descriptive only, never live orders",()=>{
 const r=ticket("10",{now:T+3600*1000*2});
 assert.ok(r.book_age_minutes>=120);
 assert.match(r.blockers.join("|"),/différé/i);
 assert.equal(r.account_verified,false);
 assert.equal(r.can_place_limit_order,false);
 const future=ticket("10",{now:T-200000});
 assert.equal(future.status,"BLOQUE");
});
test("tampered book, duplicate exact pair and forced real orders fail closed",()=>{
 const original=ticketArchive();
 const clone=()=>JSON.parse(JSON.stringify(original));
 let a=clone();a.hours[0].markets[0].book5.asks[0][0]="81770.0";
 assert.equal(ticket("10",{archive:a}).status,"BLOQUE");
 a=clone();a.hours[0].markets.push({...a.hours[0].markets[0]});
 assert.equal(ticket("10",{archive:a}).status,"BLOQUE");
 a=clone();a.real_orders=1;
 assert.equal(ticket("10",{archive:a}).status,"BLOQUE");
 a=clone();a.hours[0].markets[0].rules.minSz="0.00000000000000000001";
 assert.equal(ticket("10",{archive:a}).status,"BLOQUE");
});
test("read-only ticket appears in existing Trader PAPER lab and never sends an order",()=>{
 const src=fs.readFileSync(path.join(__dirname,"trader-paper-decision-view.js"),"utf8");
 const coreSrc=fs.readFileSync(path.join(__dirname,"trader-paper-decision-core.js"),"utf8");
 assert.match(src,/traderOkxTicket/);
 assert.match(src,/Préparer un ticket OKX LIMIT/);
 assert.match(src,/budget\.value="5"/);
 assert.match(src,/data-ticket-budget/);
 assert.match(src,/data-ticket-quote/);
 assert.match(src,/data-ticket-report/);
 assert.match(src,/core\.prepareSpotTicket/);
 assert.match(src,/okx-hourly\/latest\.json/);
 assert.match(src,/credentials:"omit"/);
 assert.match(src,/ticketRequest\+\+/);
 assert.doesNotMatch(src,/\/api\/v5\/trade|\/trade\/order|Authorization:|sessionStorage|localStorage/);
 assert.doesNotMatch(coreSrc,/\/api\/v5\/trade|\/trade\/order|fetch\(/);
 assert.equal(core.realOrders,false);
 assert.equal(core.network,false);
});

test("existing OKX module yields narrow Trading-only quote and BTC-USDC account fees",()=>{
 const owner=require("./trader-okx-account.js");
 const at="2026-10-20T04:00:00Z",now=Date.parse(at)+30000;
 const acct={ok:true,read_only:true,fetched_at:at,
  trading:[{details:[{ccy:"USDC",availBal:"0",cashBal:"0"}]}],
  funding:[{ccy:"USDC",bal:"4.38668749",availBal:"4.38668749"}]};
 const fees={fees:[{instId:"BTC-USDC",maker:"-0.0008",taker:"-0.001"}]};
 const data=owner.summarizeTicketAccount(acct,fees,"BTC-USDC",now);
 assert.equal(data.verified,true);
 assert.equal(data.trading_available_quote,"0");
 assert.equal(data.funding_available_quote,"4.38668749");
 assert.equal(data.fee_maker_rate,"0.0008");
 assert.equal(data.fee_taker_rate,"0.001");
 assert.equal(data.fee_pair_verified,true);
 assert.equal(data.read_only,true);
 assert.equal(data.orders_enabled,false);
 assert.equal(data.real_orders,0);
 assert.equal(Object.hasOwn(data,"trading"),false);
 assert.equal(Object.hasOwn(data,"token"),false);
 const review=core.reviewSpotTicketAccount(ticket("10"),data,T);
 assert.equal(review.status,"COMPTE_NON_VERIFIE"); // private snapshot is later than T
 const dated=core.reviewSpotTicketAccount(ticket("10"),data,now);
 assert.equal(dated.status,"TRADING_INSUFFISANT");
 assert.equal(dated.funds_cover_public_scenario,false);
 assert.equal(dated.fee_maker_pct,"0.08");
 assert.equal(dated.fee_taker_pct,"0.1");
 assert.equal(dated.can_place_limit_order,false);
 assert.equal(dated.orders_enabled,false);
});
test("Funding is never counted as immediately available Trading capital",()=>{
 const owner=require("./trader-okx-account.js"),at="2026-10-20T03:18:50Z";
 const a={ok:true,read_only:true,fetched_at:at,trading:[],
  funding:[{ccy:"USDC",bal:"10",availBal:"10"}]};
 const summary=owner.summarizeTicketAccount(a,{fees:[]},"BTC-USDC",T);
 assert.equal(summary.verified,false);
 assert.equal(summary.trading_available_quote,null);
 assert.equal(summary.funding_available_quote,"10");
 const check=core.reviewSpotTicketAccount(ticket("10"),summary,T);
 assert.equal(check.status,"COMPTE_NON_VERIFIE");
 assert.equal(check.funds_cover_public_scenario,false);
 assert.equal(check.fees_verified,false);
});
test("A fresh larger Trading balance still cannot authorize any execution",()=>{
 const owner=require("./trader-okx-account.js"),at="2026-10-20T03:18:50Z";
 const a={ok:true,read_only:true,fetched_at:at,
  trading:[{details:[{ccy:"USDC",availBal:"12"}]}],funding:[]};
 const fees={fees:[{instId:"BTC-USDC",maker:"-0.0008",taker:"-0.001"}]};
 const ctx=owner.summarizeTicketAccount(a,fees,"BTC-USDC",T);
 const report=core.reviewSpotTicketAccount(ticket("10"),ctx,T);
 assert.equal(report.status,"SOLDE_SUFFISANT_POUR_ETUDE");
 assert.equal(report.funds_cover_public_scenario,true);
 assert.equal(report.fees_verified,true);
 assert.equal(report.can_place_limit_order,false);
 assert.equal(report.orders_enabled,false);
 assert.equal(report.real_orders,0);
});
test("Reject wrong-pair fees, expired Bridge results, duplicate or fake availBal",()=>{
 const owner=require("./trader-okx-account.js"),at="2026-10-20T03:18:50Z";
 const a={ok:true,read_only:true,fetched_at:at,
  trading:[{details:[{ccy:"USDC",availBal:"12"}]}],funding:[]};
 const wrong={fees:[{instId:"ETH-USDC",maker:"-0.0008",taker:"-0.001"}]};
 const ctx=owner.summarizeTicketAccount(a,wrong,"BTC-USDC",T);
 assert.equal(ctx.fee_pair_verified,false);
 assert.equal(core.reviewSpotTicketAccount(ticket("10"),ctx,T).fees_verified,false);
 assert.equal(owner.summarizeTicketAccount(a,wrong,"BTC-USDT",T).verified,false);
 assert.equal(owner.summarizeTicketAccount(a,wrong,"BTC-USDC",T+300000).verified,false);
 assert.equal(owner.summarizeTicketAccount({...a,trading:[{details:[
  {ccy:"USDC",availBal:"12"},{ccy:"USDC",availBal:"12"}]}]},wrong,"BTC-USDC",T).verified,false);
 assert.equal(owner.summarizeTicketAccount({...a,trading:[{details:[
  {ccy:"USDC",availBal:"Infinity"}]}]},wrong,"BTC-USDC",T).verified,false);
 assert.equal(owner.summarizeTicketAccount({...a,read_only:false},wrong,"BTC-USDC",T).verified,false);
});
test("Ticket requests no private endpoint: only the existing account owner talks to Bridge",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const ticketView=fs.readFileSync(path.join(__dirname,"trader-paper-decision-view.js"),"utf8");
 const accountModule=fs.readFileSync(path.join(__dirname,"trader-okx-account.js"),"utf8");
 assert.match(ticketView,/AgentCryptoTraderOkxAccount/);
 assert.match(ticketView,/owner\.ticketReadOnly\(pair\)/);
 assert.match(ticketView,/reviewSpotTicketAccount\(answer,context,Date\.now\(\)\)/);
 assert.doesNotMatch(ticketView,/\/okx\/account|\/okx\/fees|Bearer|secretKey|auth\/login/);
 assert.match(accountModule,/async function ticketReadOnly/);
 assert.match(accountModule,/ticketBtcFees=null/);
 assert.match(accountModule,/return summarizeTicketAccount/);
 assert.match(accountModule,/TICKET_PAIR=/);
 assert.doesNotMatch(accountModule,/\/api\/v5\/trade\/order/);
});


/* CT market belongs to an OKX native USDC pair. The separate chart may
   display CT-USDT converted to USD, but that price must NEVER price a USDC
   order. All market details below are deliberately offline test fixtures. */
function ctSource(){return{asset:"CT",instrument:"CT-USDT",provider:"okx",
 currency:"USD",source:"OKX CT/USDT candles · USDT/USD CoinGecko"};}
function ctArchive(){
 const a=JSON.parse(JSON.stringify(ticketArchive()));
 const m=a.hours[0].markets[0];m.pair="CT-USDC";m.base="CT";
 m.rules={minSz:"10",lotSz:"0.01",tickSz:"0.00001"};
 m.book5={source_at_utc:"2026-10-20T03:18:44Z",market_fill_proven:false,
  bids:[["0.31074","500"]],asks:[["0.31093","500"]]};
 return a;
}
function ctTicket(budget="3.2"){
 return core.prepareSpotTicket({selected:ctSource(),archive:ctArchive(),
  pair:"CT-USDC",budgetQuote:budget,now:T});
}
test("CT native USDC preflight identifies 10 CT minimum and buy fee trap",()=>{
 const normal=ctTicket();
 assert.equal(normal.pair,"CT-USDC");
 assert.equal(normal.native_min_quantity,"10.0");
 assert.equal(normal.native_lot,"0.01");
 assert.equal(normal.net_exit_quantity_minimum_met,true);
 const minimumOnly=ctTicket("3.1093");
 assert.equal(minimumOnly.gross_buy_quantity,"10.0");
 assert.equal(minimumOnly.net_exit_quantity_minimum_met,false,
   "buying exactly 10 CT fails the 10 CT exit minimum after BASE fee");
 assert.equal(minimumOnly.can_place_limit_order,false);
 assert.equal(normal.orders_enabled,false);
});
test("CT 100% preview tells full sellable amount and remaining unsellable dust",()=>{
 const ctx=null; // no Bridge: never guess a real account's exact fees
 const p=core.previewSpotExit({ticket:ctTicket(),context:ctx,
  targetPriceQuote:"0.39",now:T});
 assert.equal(p.status,"ETUDE_SORTIE");
 assert.equal(p.meets_native_exit_minimum,true);
 assert.ok(Number(p.maximum_sellable_base)>=10);
 assert.ok(Number(p.estimated_net_base)>Number(p.maximum_sellable_base));
 assert.ok(Number(p.residual_dust_base)>0);
 assert.equal(p.full_exit_without_dust,false);
 assert.equal(p.fees_verified,false);
 assert.equal(p.fee_status,"HYPOTHESE_0_10_PCT");
 assert.ok(Number(p.hypothetical_sale_net_quote)>Number(p.hypothetical_sale_fee_quote));
 assert.equal(p.orders_enabled,false);
 assert.equal(p.can_place_limit_order,false);
 assert.equal(p.real_orders,0);
});
test("CT private maker/taker belong to CT-USDC, never BTC or USDT",()=>{
 const owner=require("./trader-okx-account.js");
 const account={ok:true,read_only:true,fetched_at:"2026-10-20T03:18:50Z",
  trading:[{details:[{ccy:"USDC",availBal:"3.20"}]}],funding:[]};
 const right=owner.summarizeTicketAccount(account,{
  fees:[{instId:"CT-USDC",maker:"-0.0008",taker:"-0.001"}]},"CT-USDC",T);
 assert.equal(right.fee_pair_verified,true);
 assert.equal(right.trading_available_quote,"3.20");
 const p=core.previewSpotExit({ticket:ctTicket(),context:right,
  targetPriceQuote:"0.39",now:T});
 assert.equal(p.fees_verified,true);
 assert.equal(p.funds_cover_public_scenario,true);
 assert.equal(p.assumed_fee_pct,"0.1");
 assert.equal(p.orders_enabled,false);
 const wrong=owner.summarizeTicketAccount(account,{
  fees:[{instId:"BTC-USDC",maker:"-0.0008",taker:"-0.001"}]},"CT-USDC",T);
 assert.equal(wrong.fee_pair_verified,false);
 assert.equal(core.previewSpotExit({ticket:ctTicket(),context:wrong,
  targetPriceQuote:"0.39",now:T}).fees_verified,false);
});
test("CT fee diagnostic explains missing contract proof without granting order permissions",()=>{
 const owner=require("./trader-okx-account.js");
 const account={ok:true,read_only:true,fetched_at:"2026-10-20T03:18:50Z",
  trading:[{details:[{ccy:"USDC",availBal:"3.20"}]}],funding:[]};
 const query=fees=>owner.summarizeTicketAccount(account,fees,"CT-USDC",T);
 const missingId=query({fees:[{instType:"SPOT",maker:"-0.0008",taker:"-0.001",
   feeGroup:[{groupId:"1",maker:"-0.0008",taker:"-0.001"}]}]});
 assert.equal(missingId.verified,true);
 assert.equal(missingId.fee_pair_verified,false);
 assert.match(missingId.fee_reason,/instId absent/);
 assert.equal(missingId.orders_enabled,false);
 const wrong=query({fees:[{instId:"BTC-USDC",maker:"-0.0008",taker:"-0.001"}]});
 assert.equal(wrong.fee_pair_verified,false);
 assert.match(wrong.fee_reason,/paire différente/);
 assert.match(query(null).fee_reason,/Réponse des frais OKX absente/);
 const ambiguous=query({fees:[{instId:"CT-USDC",maker:"-0.0008",taker:"-0.001"},
  {instId:"CT-USDT",maker:"-0.0008",taker:"-0.001"}]});
 assert.equal(ambiguous.fee_pair_verified,false);
 assert.match(ambiguous.fee_reason,/Plusieurs lignes/);
 const exact=query({fees:[{instId:"CT-USDC",maker:"-0.0008",taker:"-0.001"}]});
 assert.equal(exact.fee_pair_verified,true);
 assert.equal(exact.fee_reason,null);
 const view=fs.readFileSync(path.join(__dirname,"trader-paper-decision-view.js"),"utf8");
 assert.match(view,/Diagnostic frais : /);
});
test("CT R23 fee envelope attests the exact pair when OKX rows omit instId",()=>{
 const owner=require("./trader-okx-account.js");
 const account={ok:true,read_only:true,fetched_at:"2026-10-20T03:18:50Z",
  trading:[{details:[{ccy:"USDC",availBal:"3.20"}]}],funding:[]};
 const response={ok:true,read_only:true,source:"OKX Private REST",
  bridge_version:"1.9.17",instId:"CT-USDC",fetched_at:"2026-10-20T03:18:55Z",
  fees:[{maker:"-0.0008",taker:"-0.001"}]};
 const review=(fees,when=T)=>owner.summarizeTicketAccount(account,fees,"CT-USDC",when);
 const accepted=review(response);
 assert.equal(accepted.verified,true);
 assert.equal(accepted.fee_pair_verified,true);
 assert.equal(accepted.fee_maker_rate,"0.0008");
 assert.equal(accepted.fee_taker_rate,"0.001");
 assert.equal(accepted.fee_reason,null);
 assert.equal(accepted.orders_enabled,false);
 const wrongOuter=review({...response,instId:"BTC-USDC"});
 assert.equal(wrongOuter.fee_pair_verified,false);
 assert.match(wrongOuter.fee_reason,/Enveloppe Bridge : paire différente/);
 const wrongInner=review({...response,fees:[{instId:"BTC-USDC",
  maker:"-0.0008",taker:"-0.001"}]});
 assert.equal(wrongInner.fee_pair_verified,false);
 assert.match(wrongInner.fee_reason,/paire différente/);
 const stale=review({...response,fetched_at:"2026-10-20T03:16:00Z"});
 assert.equal(stale.fee_pair_verified,false);
 assert.match(stale.fee_reason,/périmée/);
 assert.equal(review({...response,source:"autre source"}).fee_pair_verified,false);
 assert.equal(review({...response,read_only:false}).fee_pair_verified,false);
 assert.equal(review({...response,ok:false}).fee_pair_verified,false);
 assert.equal(review({...response,fees:[
  {maker:"-0.0008",taker:"-0.001"},{maker:"-0.0008",taker:"-0.001"}]}).fee_pair_verified,false);
 const exit=core.previewSpotExit({ticket:ctTicket(),context:accepted,
  targetPriceQuote:"0.39",now:T});
 assert.equal(exit.fees_verified,true);
 assert.equal(exit.orders_enabled,false);
});
test("CT native exit preview rejects invalid tick and wrong token identity",()=>{
 const tk=ctTicket("3.1093");
 const p=core.previewSpotExit({ticket:tk,targetPriceQuote:"0.39",now:T});
 assert.equal(p.status,"REVENTE_MINIMUM_IMPOSSIBLE");
 assert.equal(p.meets_native_exit_minimum,false);
 assert.equal(core.previewSpotExit({ticket:ctTicket(),targetPriceQuote:"0.390001",now:T}).status,
  "SORTIE_NON_EVALUABLE");
 const wrong=core.prepareSpotTicket({selected:{...ctSource(),
  instrument:"CT-USDC"},archive:ctArchive(),pair:"CT-USDC",
  budgetQuote:"3.2",now:T});
 assert.equal(wrong.status,"BLOQUE");
 const mismatch=core.prepareSpotTicket({selected:ctSource(),
  archive:ctArchive(),pair:"BTC-USDC",budgetQuote:"3.2",now:T});
 assert.equal(mismatch.status,"BLOQUE");
});
test("CT exit stays in existing Trader panel and remains read only",()=>{
 const view=fs.readFileSync(path.join(__dirname,"trader-paper-decision-view.js"),"utf8");
 const source=fs.readFileSync(path.join(__dirname,"trader-paper-decision-core.js"),"utf8");
 assert.match(view,/data-ticket-exit/);
 assert.match(view,/previewSpotExit/);
 assert.match(view,/poussière restante/);
 assert.match(view,/quoteSelect.value="USDC"/);
 assert.match(view,/budget.value="3,20"/);
 assert.doesNotMatch(view,/\/api\/v5\/trade\/order|Authorization:|Bearer /);
 assert.doesNotMatch(source,/fetch\(|\/api\/v5\/trade\/order/);
});

test("actual CT graphic uses CT/USDT slash, while the ticket prices CT-USDC natively",()=>{
 const selected={...ctSource(),instrument:"CT/USDT"};
 const archive=ctArchive();
 const ticket=core.prepareSpotTicket({selected,archive,pair:"CT-USDC",
  budgetQuote:"3.20",now:T});
 assert.equal(ticket.status,"PREPARATION_NON_EXECUTABLE");
 assert.equal(ticket.pair,"CT-USDC");
 assert.equal(ticket.best_ask_quote,"0.31093"); // native CT-USDC fixture
 assert.equal(ticket.buy_quantity_minimum_met,true);
 assert.equal(ticket.net_exit_quantity_minimum_met,true);
 const analysis=core.previewSpotExit({ticket,context:null,
  targetPriceQuote:"0.39",now:T});
 assert.equal(analysis.status,"ETUDE_SORTIE");
 assert.equal(analysis.meets_native_exit_minimum,true);
 assert.equal(analysis.orders_enabled,false);
 assert.equal(analysis.can_place_limit_order,false);
});
test("CT/USDT chart must not substitute a CT/USDC book or USDC balance",()=>{
 const bad={...ctSource(),instrument:"CT/USDC"};
 const output=core.prepareSpotTicket({selected:bad,archive:ctArchive(),
  pair:"CT-USDC",budgetQuote:"3.20",now:T});
 assert.equal(output.status,"BLOQUE");
 const ct=ctArchive();
 ct.hours[0].markets[0].pair="CT-USDT";
 assert.equal(core.prepareSpotTicket({selected:{...ctSource(),instrument:"CT/USDT"},
  archive:ct,pair:"CT-USDC",budgetQuote:"3.20",now:T}).status,"BLOQUE");
});


test("CT Hybrid variation summary accepts restored V7 line only when its canonical prices match",()=>{
 const vm=require("node:vm");
 const source=fs.readFileSync(path.join(__dirname,"../administrator/js/graph-line-candle-overlay.js"),"utf8");
 const start=Date.parse("2026-10-19T06:00:00Z"),points=300;
 const series=Array.from({length:points},(_,i)=>[start+i*300000,0.30+i*0.000001]);
 const n={selectedId:"concrete",selectedSymbol:"CT",
  selectedProvider:"okx",selectedPair:"CT/USDT"};
 const h={instrument:"CT/USDT",provider:"okx",currency:"USD",periodDays:1,
  source:"OKX CT/USDT candles · USDT/USD CoinGecko",series};
 let ownerActive=false,ownerCoin="concrete";
 const sandbox={};
 sandbox.globalThis=sandbox;
 sandbox.document={
  getElementById:id=>id==="atlasChartInsightOverlayTitle"?
    {textContent:"CT · Concrete · 24h · PRIX USD"}:null,
  querySelector:()=>null
 };
 sandbox.AgentCryptoNewListingLiveAsset={snapshot:()=>({
  active:true,id:"concrete",base:"CT",instrument:"CT-USDT",provider:"okx"
 })};
 sandbox.AgentCryptoNewListingsNativeCategory={
  snapshot:()=>n,mathSeriesSnapshot:()=>h
 };
 sandbox.AtlasExternalChart={state:()=>({active:ownerActive,coin_id:ownerCoin})};
 sandbox.Chart={register:()=>{}};
 vm.runInNewContext(source,sandbox,{timeout:2500});
 const graph=sandbox.AgentCryptoLineCandleOverlay;
 const draw=series.map(([x,y])=>({x,y}));
 const dataset={atlasCoin:{id:"concrete",symbol:"CT"},data:draw};
 const meta={type:"line",hidden:false,data:draw.map(()=>({x:1,y:1})),
  yScale:{getPixelForValue:()=>0}};
 const chart={data:{datasets:[dataset]},getDatasetMeta:()=>meta};
 assert.equal(graph.summaryOwnership({ds:dataset,meta}),true);
 assert.equal(graph.variationSummary(chart).bars.length,24);
 assert.equal(graph.variationSummary(chart).symbol,"CT");
 // A stale BTC line must never gain CT labels from the UI selection.
 const bad={...dataset,atlasCoin:{id:"bitcoin",symbol:"BTC"}};
 assert.equal(graph.summaryOwnership({ds:bad,meta}),false);
 // A different active chart owner is authoritative.
 ownerActive=true;ownerCoin="bitcoin";
 assert.equal(graph.summaryOwnership({ds:dataset,meta}),false);
 ownerActive=false;
 // Identical symbols are not sufficient. Source pair, source provider,
 // exact selected asset and prices must all agree.
 assert.equal(graph.summaryOwnership({ds:dataset,meta}),true);
 const wrongPrice={...dataset,data:draw.map((v,i)=>
  i===Math.floor(points/2)?{...v,y:v.y*1.15}:v)};
 assert.equal(graph.summaryOwnership({ds:wrongPrice,meta}),false);
 const saved=n.selectedPair;n.selectedPair="BTC/USDT";
 assert.equal(graph.summaryOwnership({ds:dataset,meta}),false);
 n.selectedPair=saved;
 const oldProvider=h.provider;h.provider="bitget";
 assert.equal(graph.summaryOwnership({ds:dataset,meta}),false);
 h.provider=oldProvider;
 assert.equal(graph.summaryOwnership({ds:dataset,meta}),true);
 assert.equal(graph.read_only,true);
});

test("CT ticket shows remaining blockers after verified OKX snapshot",()=>{
 const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
 const source=fs.readFileSync(path.join(__dirname,"trader-paper-decision-view.js"),"utf8");
 const start=source.indexOf("function ticketRemainingBlockers(");
 const end=source.indexOf("async function prepareTicket(",start);
 assert.ok(start>=0&&end>start);
 const reconcile=vm.runInNewContext(source.slice(start,end)+"\nticketRemainingBlockers",Object.create(null));
 const balance="Solde du compte Trading et devise réellement disponibles non vérifiés.";
 const fees="Frais réels de ce compte et de cette paire non vérifiés.";
 const book="Carnet public différé de 190 min : aucun prix actuel certifié.";
 const notional="Minimum de valeur/notionnel et autres filtres d'ordre à confirmer par OKX.";
 const ticket={blockers:[balance,fees,book,notional]};
 const before=JSON.stringify(ticket.blockers);
 const proven={account_verified:true,available_trading_quote:"3.2",
  fees_verified:true,funds_cover_public_scenario:true};
 assert.deepEqual(Array.from(reconcile(ticket,proven)),[book,notional]);
 assert.deepEqual(Array.from(reconcile(ticket,{...proven,fees_verified:false})),[fees,book,notional]);
 assert.deepEqual(Array.from(reconcile(ticket,{...proven,account_verified:false})),[balance,book,notional]);
 assert.deepEqual(Array.from(reconcile(ticket,{...proven,available_trading_quote:null})),[balance,book,notional]);
 assert.deepEqual(Array.from(reconcile(ticket,null)),[balance,fees,book,notional]);
 const uncovered=Array.from(reconcile(ticket,{...proven,funds_cover_public_scenario:false}));
 assert.equal(uncovered.includes(balance),false);
 assert.match(uncovered.at(-1),/Couverture du coût fictif/);
 assert.ok(uncovered.includes(book));
 assert.equal(JSON.stringify(ticket.blockers),before);
 assert.match(source,/BLOCAGES RESTANTS :/);
 assert.match(source,/Compte OKX lu via le Bridge existant, en lecture seule/);
 assert.doesNotMatch(source,/Aucun bouton d'achat et aucun appel privé/);
 assert.match(source,/STATUT : AUCUN ORDRE POSSIBLE DEPUIS CE TICKET/);
});

test("CT public Backend book changes PAPER levels only if exact, ordered and fresh",()=>{
 const at=Date.parse("2026-10-20T03:18:55Z");
 const sample={status:"ok",provider:"okx",pair:"CT-USDC",quote:"USDC",
  observed_at_utc:"2026-10-20T03:18:50Z",
  bids:[["0.30773","100"],["0.30772","200"]],
  asks:[["0.30785","100"],["0.30786","200"]]};
 const args={selected:ctSource(),archive:ctArchive(),pair:"CT-USDC",
  budgetQuote:"3.2",now:at};
 const valid=core.prepareSpotTicket({...args,liveBook:sample});
 assert.equal(valid.status,"PREPARATION_NON_EXECUTABLE");
 assert.equal(valid.source_book_kind,"LOCAL_BACKEND_OKX_CT_USDC");
 assert.equal(valid.best_ask_quote,"0.30785");
 assert.equal(valid.best_bid_quote,"0.30773");
 assert.equal(valid.source_book_at_utc,sample.observed_at_utc);
 assert.equal(valid.native_min_quantity,"10.0");
 assert.equal(valid.orders_enabled,false);
 for(const input of [
   {...sample,pair:"CT-USDT"},
   {...sample,quote:"USDT"},
   {...sample,provider:"bitget"},
   {...sample,status:"error"},
   {...sample,observed_at_utc:"2026-10-20T03:18:25Z"},
   {...sample,observed_at_utc:"2026-10-20T03:19:10Z"},
   {...sample,bids:[["0.308","100"]]},
   {...sample,asks:[]},
   {...sample,asks:[["0.30785","0"]]},
   {...sample,bids:[["0.30773","100"],["0.308","100"]]}
 ]){
  const fallback=core.prepareSpotTicket({...args,liveBook:input});
  assert.equal(fallback.source_book_kind,"DATED_PUBLIC_HOURLY_ARCHIVE");
  assert.equal(fallback.best_ask_quote,"0.31093");
  assert.equal(fallback.orders_enabled,false);
 }
 const original=core.prepareSpotTicket(args);
 assert.equal(original.best_ask_quote,"0.31093");
 assert.equal(original.source_book_kind,"DATED_PUBLIC_HOURLY_ARCHIVE");
 assert.equal(core.network,false);
 const view=fs.readFileSync(path.join(__dirname,"trader-paper-decision-view.js"),"utf8");
 assert.match(view,/market-book\?provider=okx&instrument=CT-USDC&limit=100/);
 assert.match(view,/credentials:"omit"/);
 assert.match(view,/readCtSpotPublicBook\(\)/);
 assert.match(view,/Règles Spot issues du relevé daté/);
 assert.doesNotMatch(view,/Authorization:|Bearer|\/trade\/order/);
});

test("CT fresh OKX public instruments rules override dated min, lot and tick only",()=>{
 const time=Date.parse("2026-10-20T03:19:00Z");
 const evidence={observed_at_utc:"2026-10-20T03:18:55Z",
   payload:{code:"0",data:[{instId:"CT-USDC",instType:"SPOT",baseCcy:"CT",
     quoteCcy:"USDC",state:"live",minSz:"10",lotSz:"0.01",tickSz:"0.0001"}]}};
 const live={status:"ok",provider:"okx",pair:"CT-USDC",quote:"USDC",
   observed_at_utc:"2026-10-20T03:18:55Z",bids:[["0.3112","100"]],
   asks:[["0.3113","100"]]};
 const args={selected:ctSource(),archive:ctArchive(),pair:"CT-USDC",
   budgetQuote:"3.2",now:time,liveBook:live,instrumentEvidence:evidence};
 const ticket=core.prepareSpotTicket(args);
 assert.equal(ticket.status,"PREPARATION_NON_EXECUTABLE");
 assert.equal(ticket.native_rules_verified,true);
 assert.equal(ticket.native_rules_kind,"OKX_PUBLIC_INSTRUMENTS_CT_USDC");
 assert.equal(ticket.native_tick,"0.0001");
 assert.equal(ticket.native_min_quantity,"10.0");
 assert.equal(ticket.native_lot,"0.01");
 assert.equal(ticket.minimum_gross_buy_to_resell_with_assumed_base_fee,"10.02");
 assert.equal(ticket.notional_filter_verified,false);
 assert.equal(ticket.fee_debit_currency_verified,false);
 assert.equal(ticket.orders_enabled,false);
 const changes=[
  {...evidence,observed_at_utc:"2026-10-20T03:16:00Z"},
  {...evidence,observed_at_utc:"2026-10-20T03:19:30Z"},
  {...evidence,payload:{code:"5",data:evidence.payload.data}},
  {...evidence,payload:{code:"0",data:[]}},
  {...evidence,payload:{code:"0",data:[...evidence.payload.data,...evidence.payload.data]}},
  {...evidence,payload:{code:"0",data:[{...evidence.payload.data[0],instId:"CT-USDT"}]}},
  {...evidence,payload:{code:"0",data:[{...evidence.payload.data[0],baseCcy:"BTC"}]}},
  {...evidence,payload:{code:"0",data:[{...evidence.payload.data[0],state:"suspend"}]}},
  {...evidence,payload:{code:"0",data:[{...evidence.payload.data[0],lotSz:"0"}]}},
 ];
 for(const invalid of changes){
  const bad=core.prepareSpotTicket({...args,instrumentEvidence:invalid});
  assert.equal(bad.native_rules_verified,false);
  assert.equal(bad.native_rules_kind,"DATED_PUBLIC_HOURLY_ARCHIVE");
  assert.equal(bad.native_tick,"0.00001");
  assert.equal(bad.orders_enabled,false);
 }
 const updated={...evidence,payload:{code:"0",data:[
  {...evidence.payload.data[0],minSz:"11"}]}};
 const constrained=core.prepareSpotTicket({...args,instrumentEvidence:updated});
 assert.equal(constrained.native_min_quantity,"11.0");
 assert.equal(constrained.minimum_gross_buy_to_resell_with_assumed_base_fee,"11.02");
 assert.equal(constrained.buy_quantity_minimum_met,false);
 assert.match(constrained.blockers.join("|"),/sous le minimum natif/i);
});
test("CT public rules and fee-buffer UI never claim notionnel or fee debit certainty",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const source=fs.readFileSync(path.join(__dirname,"trader-paper-decision-view.js"),"utf8");
 const coreCode=fs.readFileSync(path.join(__dirname,"trader-paper-decision-core.js"),"utf8");
 assert.match(source,/api\/v5\/public\/instruments\?instType=SPOT&instId=CT-USDC/);
 assert.match(source,/Promise\.allSettled/);
 assert.match(source,/instrumentEvidence,now:evaluatedAt/);
 assert.match(source,/Règles Spot issues du relevé daté/);
 assert.match(source,/NON CERTIFIÉS par cette lecture publique/);
 assert.match(source,/Frais débités en CT : HYPOTHÈSE/);
 assert.match(source,/Solde Trading couvrant uniquement le coût FICTIF/);
 assert.match(coreCode,/minimumGrossWithBaseFee/);
 assert.match(coreCode,/notional_filter_verified:false/);
 assert.match(coreCode,/fee_debit_currency_verified:false/);
 assert.doesNotMatch(source,/\/api\/v5\/trade\/order|\/trade\/order|Bearer|Authorization:/);
 assert.equal(core.realOrders,false);
});


test("CT feeType is accepted only from a fresh minimal private READ envelope",()=>{
 const owner=require("./trader-okx-account.js");
 const base={ok:true,read_only:true,orders_enabled:false,
  scope:"spot_fee_currency_mode_for_account",
  source:"OKX Private REST /api/v5/account/config",
  fetched_at:"2026-10-20T03:18:55Z",fee_amount_and_rounding_verified:false};
 const accepted=(v)=>owner.summarizeSpotFeeMode({...base,...v},T);
 assert.equal(accepted({fee_type:"0",fee_currency_for_spot_buy_ct_usdc:"CT"}).fee_type_verified,true);
 assert.equal(accepted({fee_type:"1",fee_currency_for_spot_buy_ct_usdc:"USDC"}).fee_type_verified,true);
 for(const bad of [
  {fee_type:"1",fee_currency_for_spot_buy_ct_usdc:"CT"},
  {fee_type:"2",fee_currency_for_spot_buy_ct_usdc:"USDC"},
  {fetched_at:"2026-10-20T03:15:00Z",fee_type:"1",fee_currency_for_spot_buy_ct_usdc:"USDC"},
  {orders_enabled:true,fee_type:"1",fee_currency_for_spot_buy_ct_usdc:"USDC"},
  {source:"Untrusted",fee_type:"1",fee_currency_for_spot_buy_ct_usdc:"USDC"},
  {fee_amount_and_rounding_verified:true,fee_type:"1",fee_currency_for_spot_buy_ct_usdc:"USDC"},
  {read_only:false,fee_type:"1",fee_currency_for_spot_buy_ct_usdc:"USDC"},
 ])assert.equal(accepted(bad).fee_type_verified,false);
});

test("CT PAPER quote-fee mode reduces gross quantity to respect same budget",()=>{
 const owner=require("./trader-okx-account.js");
 const privateAccount={ok:true,read_only:true,fetched_at:"2026-10-20T03:18:50Z",
  trading:[{details:[{ccy:"USDC",availBal:"3.20"}]}],funding:[]};
 const fees={fees:[{instId:"CT-USDC",maker:"-0.0008",taker:"-0.001"}]};
 const summarized=owner.summarizeTicketAccount(privateAccount,fees,"CT-USDC",T);
 const modeAt="2026-10-20T03:18:55.000Z";
 const ctx=(mode)=>({...summarized,fee_type_verified:true,fee_type:mode,
  fee_currency_for_spot_buy_ct_usdc:mode==="1"?"USDC":"CT",
  fee_type_at_utc:modeAt});
 const ticket=ctTicket();
 const base=core.previewSpotExit({ticket,context:ctx("0"),targetPriceQuote:"0.39",now:T});
 assert.equal(base.buy_fee_currency,"CT");
 assert.equal(base.buy_fee_currency_verified,true);
 assert.equal(base.quote_fee_budget_adjusted,false);
 assert.ok(Number(base.estimated_buy_fee_base)>0);
 assert.equal(base.orders_enabled,false);
 const quote=core.previewSpotExit({ticket,context:ctx("1"),targetPriceQuote:"0.39",now:T});
 assert.equal(quote.status,"ETUDE_SORTIE");
 assert.equal(quote.buy_fee_currency,"USDC");
 assert.equal(quote.buy_fee_currency_verified,true);
 assert.equal(quote.quote_fee_budget_adjusted,true);
 assert.ok(Number(quote.estimated_buy_fee_quote)>0);
 assert.equal(quote.estimated_buy_fee_base,"0.0");
 assert.ok(Number(quote.buy_quantity)<Number(ticket.gross_buy_quantity));
 assert.ok(Number(quote.total_buy_cost_quote)<=3.2);
 assert.ok(Number(quote.maximum_sellable_base)>=10);
 assert.equal(quote.residual_dust_base,"0.0");
 assert.equal(quote.paper_budget_covers_total_cost,true);
 assert.equal(quote.funds_cover_public_scenario,true);
 assert.equal(quote.orders_enabled,false);
 assert.equal(quote.real_orders,0);
 const stale=core.previewSpotExit({ticket,context:{...ctx("1"),
  fee_type_at_utc:"2026-10-20T03:15:00.000Z"},targetPriceQuote:"0.39",now:T});
 assert.equal(stale.buy_fee_currency_verified,false);
 assert.equal(stale.quote_fee_budget_adjusted,false);
 assert.equal(stale.buy_fee_currency,"CT");
});

test("feeType stays solely in existing authenticated owner and visible ticket",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const account=fs.readFileSync(path.join(__dirname,"trader-okx-account.js"),"utf8");
 const view=fs.readFileSync(path.join(__dirname,"trader-paper-decision-view.js"),"utf8");
 const coreCode=fs.readFileSync(path.join(__dirname,"trader-paper-decision-core.js"),"utf8");
 assert.match(account,/await bridge\("\/okx\/fee-type"\)/);
 assert.match(account,/summarizeSpotFeeMode/);
 assert.match(view,/Mode des frais d'achat OKX vérifié/);
 assert.match(view,/quote_fee_budget_adjusted/);
 assert.match(coreCode,/buy_fee_currency_verified/);
 assert.doesNotMatch(view,/\/okx\/fee-type|\/api\/v5\/account\/config|Authorization:|Bearer /);
 assert.doesNotMatch(account,/\/api\/v5\/trade\/order|set-fee-type/);
});


test("CT R25 Spot gates accept only fresh exact-pair private read-only proof",()=>{
 const owner=require("./trader-okx-account.js");
 const fixture={ok:true,read_only:true,orders_enabled:false,real_orders:0,
  source:"OKX account/public Spot GET proof",
  instId:"CT-USDC",base:"CT",quote:"USDC",tdMode:"cash",
  fetched_at:"2026-10-20T03:18:55Z",
  eligible_for_account:true,eligibility_verified:true,
  trade_quote_ccy_verified:true,trade_quote_ccy:"USDC",
  available_verified:true,account_max_verified:true,
  public_rules_verified:true,price_limits_verified:true,
  availBuy:"3.2",availSell:"0",maxBuy:"10.15",maxSell:"0",
  minSz:"10",lotSz:"0.01",tickSz:"0.0001",
  maxLmtSz:"1000",maxLmtAmt:"10000",buyLmt:"0.40",sellLmt:"0.20",
  blocked_reasons:[]};
 const summarize=change=>owner.summarizeSpotOrderGates({...fixture,...change},T);
 const yes=summarize({});
 assert.equal(yes.order_gates_verified,true);
 assert.equal(yes.order_gates.availBuy,"3.2");
 assert.equal(yes.order_gates.orders_enabled,false);
 for(const invalid of [
   {instId:"CT-USDT"},{base:"BTC"},{quote:"USD"},{tdMode:"cross"},
   {source:"attacker"},{real_orders:1},{orders_enabled:true},
   {trade_quote_ccy:"USD"},{eligible_for_account:false},
   {fetched_at:"2026-10-20T03:14:00Z"},{availBuy:"3.2 USDC"},
   {price_limits_verified:false},{public_rules_verified:false}
 ])assert.equal(summarize(invalid).order_gates_verified,false);
});
test("CT R25 constraints displayed in same PAPER ticket, never an order",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const owner=fs.readFileSync(path.join(__dirname,"trader-okx-account.js"),"utf8");
 const view=fs.readFileSync(path.join(__dirname,"trader-paper-decision-view.js"),"utf8");
 assert.match(owner,/await bridge\("\/okx\/order-gates\?instId=CT-USDC"\)/);
 assert.match(owner,/summarizeSpotOrderGates/);
 assert.match(view,/CONTROLES SPOT COMPTE/);
 assert.match(view,/maxLmtAmt/);
 assert.match(view,/aucune autorisation Trade/);
 assert.doesNotMatch(view,/\/okx\/order-gates|Bearer|\/api\/v5\/trade\/order/);
 assert.doesNotMatch(owner,/\/api\/v5\/trade\/order|\/auth\/register/);
});

test("R25 maxBuy mismatch blocks 10.23-like PAPER quantity and clamps preview",()=>{
 const owner=require("./trader-okx-account.js");
 const snapshot={ok:true,read_only:true,fetched_at:"2026-10-20T03:18:50Z",
  trading:[{details:[{ccy:"USDC",availBal:"3.2"}]}],funding:[]};
 const f={fees:[{instId:"CT-USDC",maker:"-0.0008",taker:"-0.001"}]};
 const account=owner.summarizeTicketAccount(snapshot,f,"CT-USDC",T);
 const evidence={ok:true,read_only:true,orders_enabled:false,real_orders:0,
  source:"OKX account/public Spot GET proof",instId:"CT-USDC",base:"CT",
  quote:"USDC",tdMode:"cash",fetched_at:"2026-10-20T03:18:55Z",
  eligible_for_account:true,eligibility_verified:true,
  trade_quote_ccy_verified:true,trade_quote_ccy:"USDC",
  available_verified:true,account_max_verified:true,public_rules_verified:true,
  price_limits_verified:true,availBuy:"3.2",availSell:"0",
  maxBuy:"10.1036662452591656",maxSell:"0",minSz:"10",lotSz:"0.01",
  tickSz:"0.00001",maxLmtSz:"1000",maxLmtAmt:"10000",
  buyLmt:"0.40",sellLmt:"0.20",blocked_reasons:[]};
 const gates=owner.summarizeSpotOrderGates(evidence,T);
 assert.equal(gates.order_gates_verified,true);
 const context={...account,...gates,fee_type_verified:true,fee_type:"0",
  fee_currency_for_spot_buy_ct_usdc:"CT",
  fee_type_at_utc:"2026-10-20T03:18:55Z"};
 const ticket=ctTicket();
 assert.ok(Number(ticket.gross_buy_quantity)>10.10);
 const chk=core.checkSpotOrderGates(ticket,context,T);
 assert.equal(chk.verified,true);
 assert.equal(chk.proposed_within_max_buy,false);
 assert.equal(chk.capped_buy_quantity,"10.1");
 assert.equal(chk.rules_match,true);
 assert.equal(chk.book_fresh,false); // archive is not a live order quote
 const review=core.reviewSpotTicketAccount(ticket,context,T);
 assert.equal(review.status,"DEPASSE_PLAFOND_ACHAT");
 assert.equal(review.funds_cover_public_scenario,true);
 assert.equal(review.scenario_within_account_max_buy,false);
 assert.match(review.reason,/supérieure au maximum/);
 const preview=core.previewSpotExit({ticket,context,
  targetPriceQuote:"0.39",now:T});
 assert.equal(preview.order_gates_adjusted,true);
 assert.equal(preview.buy_quantity,"10.1");
 assert.equal(preview.account_max_buy_base,"10.1036662452591656");
 assert.equal(preview.orders_enabled,false);
 assert.equal(preview.real_orders,0);
 assert.equal(preview.can_place_limit_order,false);
 assert.ok(Number(preview.maximum_sellable_base)>=10);
 const bad=core.previewSpotExit({ticket,context:{...context,
  order_gates_at_utc:"2026-10-20T03:15:00Z"},targetPriceQuote:"0.39",now:T});
 assert.equal(bad.limit_proof_verified,false);
 assert.equal(bad.order_gates_adjusted,false);
 assert.equal(bad.buy_quantity,ticket.gross_buy_quantity);
});

test("R25 PAPER source shows historic quantity as preliminary and never certifies orders",()=>{
 const view=fs.readFileSync(path.join(__dirname,"trader-paper-decision-view.js"),"utf8");
 assert.match(view,/Étude publique AVANT plafonds du compte/);
 assert.match(view,/QUANTITÉ PAPER CORRIGÉE/);
 assert.match(view,/Carnet ancien ou non qualifié/);
 assert.match(view,/maxBuy OKX/);
 assert.doesNotMatch(view,/\/api\/v5\/trade\/order|\/okx\/place-order|Bearer /);
});

test("CT live book diagnostic differentiates source, freshness and crossed data",()=>{
 const at=Date.parse("2026-10-20T03:18:55Z");
 const payload={status:"ok",provider:"okx",pair:"CT-USDC",quote:"USDC",
   observed_at_utc:"2026-10-20T03:18:50Z",
   bids:[["0.3077","100"],["0.3076","200"]],
   asks:[["0.3079","100"],["0.3080","200"]]};
 const diagnose=(changes,now=at)=>core.diagnoseCtLiveBook(
   changes===null?null:{...payload,...changes},"CT-USDC",now);
 assert.equal(diagnose({}).code,"LOCAL_OK");
 assert.equal(diagnose({}).accepted,true);
 assert.equal(diagnose(null).code,"NO_LOCAL_BOOK");
 assert.equal(diagnose({provider:"bitget"}).code,"PAIR_OR_SOURCE");
 assert.equal(diagnose({pair:"CT-USDT"}).code,"PAIR_OR_SOURCE");
 assert.equal(diagnose({observed_at_utc:"malformed"}).code,"TIMESTAMP_INVALID");
 assert.equal(diagnose({observed_at_utc:"2026-10-20T03:19:00Z"}).code,"TIMESTAMP_FUTURE");
 assert.equal(diagnose({observed_at_utc:"2026-10-20T03:18:34Z"}).code,"BOOK_STALE");
 assert.equal(diagnose({bids:[["0.3081","10"]]}).code,"BOOK_INVALID");
 assert.equal(diagnose({asks:[]}).code,"BOOK_INVALID");
 const old=core.prepareSpotTicket({selected:ctSource(),archive:ctArchive(),
    pair:"CT-USDC",budgetQuote:"3.2",now:at,
    liveBook:{...payload,observed_at_utc:"2026-10-20T03:18:34Z"}});
 assert.equal(old.source_book_kind,"DATED_PUBLIC_HOURLY_ARCHIVE");
 assert.equal(old.orders_enabled,false);
});

test("CT local transport diagnostic is visible and does not promote archive to live",()=>{
 const view=fs.readFileSync(path.join(__dirname,"trader-paper-decision-view.js"),"utf8");
 assert.match(view,/DIAGNOSTIC CARNET LOCAL/);
 assert.match(view,/BOOK_STALE|diagnoseCtLiveBook/);
 assert.match(view,/HTTP \(\\d\{3\}\)/);
 assert.match(view,/TIMEOUT : Backend local/);
 assert.match(view,/RESEAU LOCAL : requête impossible/);
 assert.match(view,/Repli historique GitHub uniquement/);
 assert.match(view,/setTimeout\(\(\)=>controller\.abort\(\),6500\)/);
 assert.doesNotMatch(view,/\/api\/v5\/trade\/order|\bBearer\b|Authorization:/);
});

test("CT local book clock tolerance rejects long future and stale quotes",()=>{
 const now=Date.parse("2026-10-20T22:16:00Z");
 const base={status:"ok",provider:"okx",pair:"CT-USDC",quote:"USDC",
  observed_at_utc:"2026-10-20T22:16:01.500Z",
  bids:[["0.3170","150"]],asks:[["0.3172","100"]]};
 assert.equal(core.diagnoseCtLiveBook(base,"CT-USDC",now).code,"LOCAL_OK");
 assert.ok(core.verifiedCtLiveBook(base,"CT-USDC",now));
 const future={...base,observed_at_utc:"2026-10-20T22:16:03Z"};
 assert.equal(core.diagnoseCtLiveBook(future,"CT-USDC",now).code,"TIMESTAMP_FUTURE");
 assert.equal(core.verifiedCtLiveBook(future,"CT-USDC",now),null);
 const old={...base,observed_at_utc:"2026-10-20T22:15:39Z"};
 assert.equal(core.diagnoseCtLiveBook(old,"CT-USDC",now).code,"BOOK_STALE");
 assert.equal(core.verifiedCtLiveBook(old,"CT-USDC",now),null);
});
test("CT PAPER technical details remain available under a readable summary",()=>{
 const src=fs.readFileSync(path.join(__dirname,"trader-paper-decision-view.js"),"utf8");
 assert.match(src,/data-ticket-brief/);
 assert.match(src,/data-ticket-technical/);
 assert.match(src,/Afficher le rapport technique complet/);
 assert.match(src,/CARNET CT\/USDC/);
});


test("LIMIT lifecycle remains paper from draft through partial fills and cancellation",()=>{
 const ticket={...ctTicket(),source_book_kind:"LOCAL_BACKEND_OKX_CT_USDC",
  source_book_at_utc:new Date(T-1500).toISOString()};
 const context={read_only:true,orders_enabled:false,real_orders:0,instId:"CT-USDC",
  fee_type_verified:true,fee_type:"0",fee_taker_rate:"0.001",
  order_gates_verified:true,order_gates_at_utc:new Date(T-1000).toISOString(),
  order_gates:{maxBuy:"10.11"}};
 const preview={status:"ETUDE_SORTIE",orders_enabled:false,real_orders:0,
  limit_proof_verified:true,book_fresh_for_execution:true,
  meets_native_exit_minimum:true,paper_budget_covers_total_cost:true,
  buy_quantity:"10.1"};
 const prepare=(mods={})=>core.startPaperLimitCycle({ticket,context,preview,
  qualifiedAt:T,now:T,nonce:1,...mods});
 const draft=prepare();
 assert.equal(draft.phase,"PAPER_DRAFT");
 assert.equal(draft.network,false);
 assert.equal(draft.storage,false);
 assert.equal(draft.real_orders,0);
 assert.equal(draft.send_attempts,0);
 assert.ok(Object.isFrozen(draft));
 assert.throws(()=>core.advancePaperLimitCycle(draft,
  {type:"PAPER_CONFIRM",confirmation:"ACHETER"},T+1000),/confirmation/i);
 const sent=core.advancePaperLimitCycle(draft,
  {type:"PAPER_CONFIRM",confirmation:"SIMULER"},T+1000);
 assert.equal(sent.phase,"PAPER_SUBMITTED");
 assert.equal(sent.send_attempts,0);
 assert.throws(()=>core.advancePaperLimitCycle(sent,
  {type:"PAPER_FILL_PART",quantity_ct:"3.00"},T+1200),/Transition interdite/);
 const accepted=core.advancePaperLimitCycle(sent,{type:"PAPER_ACCEPT"},T+1300);
 assert.equal(accepted.phase,"PAPER_ACCEPTED");
 const partial=core.advancePaperLimitCycle(accepted,
  {type:"PAPER_FILL_PART",quantity_ct:"3.00"},T+1400);
 assert.equal(partial.phase,"PAPER_PARTIAL");
 assert.equal(partial.filled,"3.0");
 assert.equal(partial.remaining,"7.1");
 assert.equal(partial.below_min_sell,true);
 assert.equal(partial.sellable,"2.99");
 assert.throws(()=>core.advancePaperLimitCycle(partial,
  {type:"PAPER_FILL_PART",quantity_ct:"7.10"},T+1500),/Partiel/);
 const canceled=core.advancePaperLimitCycle(partial,{type:"PAPER_CANCEL"},T+1600);
 assert.equal(canceled.phase,"PAPER_CANCELLED");
 assert.equal(canceled.filled,"3.0");
 assert.equal(canceled.real_orders,0);
 assert.throws(()=>core.advancePaperLimitCycle(canceled,{type:"PAPER_ACCEPT"},T+1800),/interdite/);
 const full=core.advancePaperLimitCycle(accepted,{type:"PAPER_FILL_REST"},T+1900);
 assert.equal(full.phase,"PAPER_FILLED");
 assert.equal(full.remaining,"0.0");
 assert.equal(full.below_min_sell,false);
 assert.equal(full.real_orders,0);
});
test("Unknown PAPER submission can only be reconciled, never retried",()=>{
 const ticket={...ctTicket(),source_book_kind:"LOCAL_BACKEND_OKX_CT_USDC",
  source_book_at_utc:new Date(T-1500).toISOString()};
 const context={read_only:true,orders_enabled:false,real_orders:0,instId:"CT-USDC",
  fee_type_verified:true,fee_type:"0",fee_taker_rate:"0.001",
  order_gates_verified:true,order_gates_at_utc:new Date(T-1000).toISOString(),
  order_gates:{maxBuy:"10.11"}};
 const preview={status:"ETUDE_SORTIE",orders_enabled:false,real_orders:0,
  limit_proof_verified:true,book_fresh_for_execution:true,
  meets_native_exit_minimum:true,paper_budget_covers_total_cost:true,buy_quantity:"10.1"};
 const args={ticket,context,preview,qualifiedAt:T,now:T,nonce:2};
 const draft=core.startPaperLimitCycle(args);
 const sent=core.advancePaperLimitCycle(draft,
  {type:"PAPER_CONFIRM",confirmation:"SIMULER"},T+1000);
 const unknown=core.advancePaperLimitCycle(sent,{type:"PAPER_UNKNOWN"},T+2000);
 assert.equal(unknown.phase,"PAPER_UNKNOWN");
 assert.equal(unknown.unknown,true);
 assert.throws(()=>core.advancePaperLimitCycle(unknown,{type:"PAPER_CONFIRM"},T+3000),/interdite/);
 assert.throws(()=>core.advancePaperLimitCycle(unknown,{type:"PAPER_ACCEPT"},T+3000),/interdite/);
 const reconciled=core.advancePaperLimitCycle(unknown,
  {type:"PAPER_RECONCILE_OPEN"},T+3500);
 assert.equal(reconciled.phase,"PAPER_ACCEPTED");
 const refused=core.advancePaperLimitCycle(unknown,
  {type:"PAPER_RECONCILE_REJECT"},T+3500);
 assert.equal(refused.phase,"PAPER_REJECTED");
 assert.equal(refused.send_attempts,0);
 assert.equal(core.startPaperLimitCycle({...args,context:{...context,instId:"CT-USDT"}}).ok,false);
 assert.equal(core.startPaperLimitCycle({...args,now:T+121000}).ok,true,
   "An already-validated PAPER snapshot remains usable after two minutes");
 assert.equal(core.startPaperLimitCycle({...args,now:T+15*60000+1000}).ok,false,
   "Expired PAPER study requires a new human validation");
 assert.equal(core.startPaperLimitCycle({...args,ticket:{...ticket,
   source_book_kind:"DATED_PUBLIC_HOURLY_ARCHIVE"}}).ok,false);
});
test("LIMIT lifecycle is embedded in the existing ticket with no trading API",()=>{
 const view=fs.readFileSync(path.join(__dirname,"trader-paper-decision-view.js"),"utf8");
 const coreText=fs.readFileSync(path.join(__dirname,"trader-paper-decision-core.js"),"utf8");
 for(const key of ["data-cycle-paper","data-cycle-qty","data-cycle-command",
   "PAPER_RECONCILE_OPEN","Afficher le rapport technique complet"])
   assert.ok(view.includes(key),"missing "+key);
 assert.match(view,/cyclePlan=\{ticket:answer,context,preview:exit,qualifiedAt\}/);
 assert.match(view,/cycleStatus\(\)/);
 assert.doesNotMatch(view,/\/api\/v5\/trade\/order|\/okx\/place-order|Bearer /);
 assert.doesNotMatch(coreText,/fetch\(|\/api\/v5\/trade\/order|localStorage/);
 assert.equal(core.realOrders,false);
});

test("Delayed click after a valid CT-USDC check uses the qualified PAPER snapshot",()=>{
 const ticket={...ctTicket(),source_book_kind:"LOCAL_BACKEND_OKX_CT_USDC",
  source_book_at_utc:new Date(T-500).toISOString()};
 const context={read_only:true,orders_enabled:false,real_orders:0,instId:"CT-USDC",
   fee_type_verified:true,fee_type:"0",fee_taker_rate:"0.001",
   order_gates_verified:true,order_gates_at_utc:new Date(T-1000).toISOString(),
   order_gates:{maxBuy:"10.11"}};
 const preview={status:"ETUDE_SORTIE",orders_enabled:false,real_orders:0,
  limit_proof_verified:true,book_fresh_for_execution:true,
  meets_native_exit_minimum:true,paper_budget_covers_total_cost:true,
  buy_quantity:"10.10"};
 const args={ticket,context,preview,qualifiedAt:T,now:T+140000,nonce:21};
 const started=core.startPaperLimitCycle(args);
 assert.equal(started.ok,true,started.reason);
 assert.equal(started.snapshot_only,true);
 assert.equal(started.not_a_live_quote,true);
 assert.equal(started.snapshot_age_seconds,140);
 assert.equal(started.orders_enabled,false);
 assert.equal(started.send_attempts,0);
 assert.equal(core.startPaperLimitCycle({...args,now:T+901000}).ok,false);
 assert.match(core.startPaperLimitCycle({...args,
  qualifiedAt:T-121000,now:T}).reason,/Carnet non récent/);
 assert.equal(core.startPaperLimitCycle({...args,
  qualifiedAt:T,preview:{...preview,book_fresh_for_execution:false}}).ok,false);
});


test("PAPER simulator shows only contextual actions; no typed confirmation",()=>{
 const src=fs.readFileSync(path.join(__dirname,"trader-paper-decision-view.js"),"utf8");
 assert.doesNotMatch(src,/setAttribute\("data-cycle-confirm"/);
 assert.match(src,/const confirmation=command==="confirm"\?"SIMULER":null/);
 assert.match(src,/btn\.hidden=!possible/);
 assert.match(src,/btn\.style\.display=possible\?"":"none"/);
 assert.match(src,/data-cycle-qty-label/);
 assert.match(src,/reject:phase==="PAPER_SUBMITTED"/);
 assert.match(src,/cancel:\["PAPER_ACCEPTED","PAPER_PARTIAL"\]/);
 assert.match(src,/Refuser \(avant acceptation\)/);
 assert.match(src,/Annuler \(après acceptation\)/);
 assert.doesNotMatch(src,/\/api\/v5\/trade\/order|\/okx\/place-order/);
});
test("PAPER-only confirmation never expires during user reading; partial cannot be rejected",()=>{
 const ticket={...ctTicket(),source_book_kind:"LOCAL_BACKEND_OKX_CT_USDC",
  source_book_at_utc:new Date(T-1000).toISOString()};
 const context={read_only:true,orders_enabled:false,real_orders:0,instId:"CT-USDC",
  fee_type_verified:true,fee_type:"0",fee_taker_rate:"0.001",
  order_gates_verified:true,order_gates_at_utc:new Date(T-1000).toISOString(),
  order_gates:{maxBuy:"10.11"}};
 const preview={status:"ETUDE_SORTIE",orders_enabled:false,real_orders:0,
  limit_proof_verified:true,book_fresh_for_execution:true,
  meets_native_exit_minimum:true,paper_budget_covers_total_cost:true,
  buy_quantity:"10.1"};
 const draft=core.startPaperLimitCycle({ticket,context,preview,qualifiedAt:T,now:T,nonce:30});
 assert.equal(draft.phase,"PAPER_DRAFT");
 const submitted=core.advancePaperLimitCycle(draft,
  {type:"PAPER_CONFIRM",confirmation:"SIMULER"},T+10*60*1000);
 assert.equal(submitted.phase,"PAPER_SUBMITTED");
 const accepted=core.advancePaperLimitCycle(submitted,{type:"PAPER_ACCEPT"},T+10*60*1000+1);
 const partial=core.advancePaperLimitCycle(accepted,
  {type:"PAPER_FILL_PART",quantity_ct:"3.00"},T+10*60*1000+2);
 const uncertain=core.advancePaperLimitCycle(partial,{type:"PAPER_UNKNOWN"},T+10*60*1000+3);
 assert.throws(()=>core.advancePaperLimitCycle(uncertain,{type:"PAPER_RECONCILE_REJECT"},T+10*60*1000+4),
   /partiellement rempli/);
 const cancelled=core.advancePaperLimitCycle(uncertain,
   {type:"PAPER_RECONCILE_CANCEL"},T+10*60*1000+5);
 assert.equal(cancelled.phase,"PAPER_CANCELLED");
 assert.equal(cancelled.filled,"3.0");
 assert.equal(cancelled.orders_enabled,false);
 assert.equal(cancelled.real_orders,0);
});


test("Option C visual order entry is sourced from verified CT-USDC evidence only",()=>{
 const vm=require("node:vm");
 const src=fs.readFileSync(path.join(__dirname,"trader-order-entry-view.js"),"utf8");
 const css=fs.readFileSync(path.join(__dirname,"trader-order-entry.css"),"utf8");
 const mirror=fs.readFileSync(path.join(__dirname,"trader-runtime-mirror.js"),"utf8");
 const owner=fs.readFileSync(path.join(__dirname,"trader-paper-decision-view.js"),"utf8");
 class N{
  constructor(tag){this.tag=tag;this.children=[];this.dataset={};
   this.className="";this.textContent="";this.attributes={};this.isConnected=false;}
  append(...nodes){this.children.push(...nodes);}
  setAttribute(k,v){this.attributes[k]=v;}
  replaceChildren(...nodes){this.children=[...nodes];}
  querySelector(sel){
   const keySelector=sel.startsWith("[data-")&&sel.endsWith("]")?
     sel.slice(6,-1):null;
   const chunks=keySelector?keySelector.split("="):[];
   const key=chunks.length?chunks[0].replace(/-([a-z])/g,(_,c)=>c.toUpperCase()):null;
   const expected=chunks[1]?chunks[1].split('"').join(""):null;
   const name=sel.startsWith(".")?sel.slice(1):null;
   const scan=n=>{
    if(name&&n.className.split(" ").includes(name))return n;
    if(key&&Object.hasOwn(n.dataset,key)&&(expected===null||n.dataset[key]===expected))
      return n;
    for(const child of n.children){const found=scan(child);if(found)return found;}
    return null;
   };
   return scan(this);
  }
  querySelectorAll(sel){
   const keys=sel.split(",").map(x=>x.trim()).filter(x=>
     x.startsWith("[data-")&&x.endsWith("]")).map(x=>
     x.slice(6,-1).replace(/-([a-z])/g,(_,c)=>c.toUpperCase()));
   const result=[];const scan=n=>{
    if(keys.some(k=>Object.hasOwn(n.dataset,k)))result.push(n);
    for(const child of n.children)scan(child);
   };
   scan(this);return result;
  }
 }
 const sandbox={document:{createElement:tag=>new N(tag)}};
 vm.runInNewContext(src,sandbox,{timeout:2000});
 const ui=sandbox.AgentCryptoTraderOrderEntryView;
 assert.equal(ui.realOrders,false);
 const fields={quoteLabel:new N("label"),budgetLabel:new N("label"),
   exitLabel:new N("label"),compute:new N("button")};
 fields.compute.classList={add:()=>{}};
 const node=ui.mount(fields);
 assert.ok(node,"visual surface must be mountable with existing controls");
 const recto=node.querySelector(".erith-gt-recto");
 const verso=node.querySelector(".erith-gt-verso");
 const grid=node.querySelector(".erith-od-grid");
 assert.ok(recto&&verso&&grid,"recto and verso must be one PAPER ticket");
 assert.equal(grid.children[0].children[1],fields.quoteLabel);
 assert.equal(grid.children[0].children[2],fields.budgetLabel);
 assert.equal(grid.children[1].children[1],fields.exitLabel);
 assert.ok(verso.querySelector("[data-od-evidence]")||
   verso.querySelector("[data-od-proof=\"pair\"]"),"back must contain OKX proofs");
 assert.ok(verso.querySelector("[data-od-events]"),"back must contain PAPER journal");
 assert.ok(node.querySelector(".erith-golden-back-reports"),"back owns the report slot");
 const compactBuy=node.querySelector('[data-od-guard="buy"]');
 const compactSell=node.querySelector('[data-od-guard="sell"]');
 const compactVerdict=node.querySelector("[data-od-verdict]");
 for(const part of [compactBuy,compactSell,compactVerdict]){
  assert.equal(part.tag,"details","native details retains accessible controls");
  assert.equal(part.open,false,"dense diagnostics initially collapsed");
  assert.equal(part.children[0].tag,"summary","summary is keyboard accessible");
 }
 assert.match(fields.compute.textContent,/aucun ordre/);
 const text=key=>node.querySelector('[data-od-field="'+key+'"]')?.textContent;
 const proof=key=>node.querySelector('[data-od-proof="'+key+'"]')?.textContent;
 ui.update({ticket:{pair:"CT-USDC",orders_enabled:false,source_book_kind:
  "LOCAL_BACKEND_OKX_CT_USDC",best_bid_quote:"0.312",best_ask_quote:"0.313",
  gross_buy_quantity:"10.3",hypothetical_buy_cost_quote:"3.22",
  native_rules_verified:true,native_min_quantity:"10",native_lot:"0.01",
  native_tick:"0.0001"},
  bookDiagnostic:{accepted:true},checkedAt:Date.parse("2026-10-21T00:00:00Z"),
  review:{account_verified:true,available_trading_quote:"3.2",
   fee_mode_verified:true,fee_buy_currency:"CT",fee_type:"0",
   funds_cover_public_scenario:true},
  context:{order_gates_verified:true,order_gates:{account_eligible:true,
   maxBuy:"10.20",available_verified:true,availSell:"0"}},
  preview:{orders_enabled:false,maximum_sellable_base:"10.18",
   buy_quantity:"10.2",total_buy_cost_quote:"3.1926",
   estimated_buy_fee_base:"0.0102",hypothetical_sale_net_quote:"3.89",
   hypothetical_sale_fee_quote:"0.0039",residual_dust_base:"0.0098"}});
 assert.equal(text("buyQty"),"10.2 CT");
 assert.equal(text("sellQty"),"10.18 CT");
 assert.equal(text("buyAvailable"),"3.2 USDC");
 assert.equal(text("sellAvailable"),"0 CT");
 assert.match(proof("orders"),/Trade désactivé/);
 const guard=kind=>node.querySelector('[data-od-guard-detail="'+kind+'"]')?.textContent||"";
 const guardTitle=kind=>node.querySelector('[data-od-guard-title="'+kind+'"]')?.textContent||"";
 assert.match(guardTitle("buy"),/minimum de quantité franchi/i);
 assert.match(guardTitle("sell"),/revente atteint/i);
 assert.match(guard("sell"),/résidu estimé/i);
 // Regression observed in Firefox: 3.20 USDC at ask 0.3384 purchases
 // 9.45 CT gross, below native minSz 10 CT. Funding is not Trading.
 ui.update({ticket:{pair:"CT-USDC",orders_enabled:false,source_book_kind:
   "LOCAL_BACKEND_OKX_CT_USDC",best_bid_quote:"0.338",best_ask_quote:"0.3384",
   native_min_quantity:"10",native_lot:"0.01",native_tick:"0.0001",
   native_rules_verified:true,study_budget_quote:"3.2",
   minimum_buy_at_recorded_ask_quote:"3.384",
   minimum_gross_buy_to_resell_with_assumed_base_fee:"10.02",
   minimum_gross_buy_cost_at_ask_with_assumed_base_fee:"3.390768",
   gross_buy_quantity:"9.45",hypothetical_buy_cost_quote:"3.19788"},
   bookDiagnostic:{accepted:true},
   review:{account_verified:true,available_trading_quote:"3.2",
    available_funding_quote:"1.18668749",fee_mode_verified:true,
    fee_buy_currency:"CT",fee_type:"0"},
   context:{order_gates_verified:true,order_gates:{
     account_max_verified:true,maxBuy:"9.452",available_verified:true,availSell:"0"}},
   preview:{orders_enabled:false,buy_quantity:"9.45",
    total_buy_cost_quote:"3.19788",maximum_sellable_base:"9.44",
    meets_native_exit_minimum:false,residual_dust_base:"0.00055",
    estimated_buy_fee_base:"0.00945"}});
 assert.match(guardTitle("buy"),/Minimum d'achat non atteint/);
 assert.match(guard("buy"),/9.45 CT projetés/);
 assert.match(guard("buy"),/3.384 USDC/);
 assert.match(guard("buy"),/0,184 USDC/);
 assert.match(guard("buy"),/plafond d'achat du compte/i);
 assert.match(guardTitle("sell"),/Revente en quantité minimale impossible/);
 assert.match(guard("sell"),/10.02 CT bruts/);
 assert.match(guard("sell"),/3.390768 USDC/);
 // Trading balance 3.2 remains the only trading value; no funding transfer.
 assert.equal(text("buyAvailable"),"3.2 USDC");
 assert.equal(src.includes("transfer("),false);
 // Integrated verdict: no theoretical proceeds may look executable below minSz.
 const verdictTitle=()=>node.querySelector("[data-od-verdict-title]")?.textContent||"";
 const verdictDetail=()=>node.querySelector("[data-od-verdict-detail]")?.textContent||"";
 const required=()=>node.querySelector("[data-od-verdict-budget]")?.textContent||"";
 assert.match(verdictTitle(),/SCÉNARIO NON ADMISSIBLE/);
 assert.match(verdictDetail(),/revente sous minSz/);
 assert.match(required(),/10.02 CT bruts/);
 assert.match(required(),/3.390768 USDC/);
 const quick=()=>node.querySelector("[data-od-verdict-quick]")?.textContent||"";
 assert.match(quick(),/Achat 9.45 \/ 10 CT/);
 assert.match(quick(),/Seuil ≈ 3.390768 USDC \(estimé\)/);
 assert.equal(compactVerdict.open,false,"key summary must remain visible without expanded text");
 // Expanded details retain owner-provided values across successive updates.
 compactBuy.open=true;compactVerdict.open=true;
 assert.match(guard("buy"),/9.45 CT projetés/);
 assert.match(required(),/Écart budget PAPER : 0,190768/);
 assert.match(required(),/0,190768 USDC/);
 assert.match(text("sellNet"),/NON RÉALISABLE/);
 assert.equal(required().includes("1.18668749"),false,
  "Funding assets must never be used as Trading in the verdict");
 // OKX maxBuy has 16 fractional digits; comparison must be exact, not discarded.
 ui.update({ticket:{pair:"CT-USDC",orders_enabled:false,
   source_book_kind:"LOCAL_BACKEND_OKX_CT_USDC",
   native_rules_verified:true,best_ask_quote:"0.3434",
   native_min_quantity:"10",native_lot:"0.01",
   study_budget_quote:"3.2",gross_buy_quantity:"9.31",
   minimum_gross_buy_to_resell_with_assumed_base_fee:"10.02",
   minimum_gross_buy_cost_at_ask_with_assumed_base_fee:"3.440868"},
   bookDiagnostic:{accepted:true},
   context:{order_gates_verified:true,order_gates:{
     maxBuy:"9.3174001748761294",account_max_verified:true}},
   review:{account_verified:true,available_trading_quote:"3.2",
     fee_mode_verified:true,fee_buy_currency:"CT",
     spot_gates:{verified:true}},
   preview:{orders_enabled:false,buy_quantity:"9.31",
     maximum_sellable_base:"9.3",meets_native_exit_minimum:false,
     hypothetical_sale_net_quote:"3.623373"}});
 assert.match(verdictDetail(),/maxBuy OKX inférieur au seuil requis/);
 assert.match(required(),/3.440868 USDC/);
 assert.equal(compactVerdict.open,true,"a refreshed estimate must not close user details");
 assert.match(required(),/maxBuy relevé \(9.3174001748761294 CT\)/);
 assert.match(text("sellNet"),/NON RÉALISABLE/);
 // A verified USDC debit mode requires the quote fee, not 10.02 CT.
 ui.update({ticket:{pair:"CT-USDC",orders_enabled:false,
   source_book_kind:"LOCAL_BACKEND_OKX_CT_USDC",
   native_rules_verified:true,best_ask_quote:"0.3434",
   native_min_quantity:"10",study_budget_quote:"4",
   gross_buy_quantity:"10"},
   bookDiagnostic:{accepted:true},
   review:{fee_mode_verified:true,fee_buy_currency:"USDC",
     fees_verified:true,fee_maker_pct:"0.08",fee_taker_pct:"0.1",
     account_verified:true,available_trading_quote:"4",
     spot_gates:{verified:true}},
   context:{order_gates_verified:true,order_gates:{maxBuy:"11"}},
   preview:{orders_enabled:false,buy_quantity:"10",
     meets_native_exit_minimum:true,maximum_sellable_base:"10",
     assumed_fee_pct:"0.1",hypothetical_sale_net_quote:"3.89"}});
 assert.match(required(),/10 CT bruts/);
 assert.match(required(),/3.437434 USDC/);
 assert.match(required(),/Frais USDC estimés/);
 assert.equal(required().includes("10.02"),false);
 // Unverified evidence must not be silently presented as verified.
 ui.update({ticket:{pair:"CT-USDC",orders_enabled:false,
   source_book_kind:"DATED_PUBLIC_HOURLY_ARCHIVE",
   native_min_quantity:"10",native_lot:"0.01",
   native_rules_verified:false,study_budget_quote:"3.2",
   minimum_buy_at_recorded_ask_quote:"3.384",gross_buy_quantity:"9.45"},
   bookDiagnostic:{accepted:false},review:null,preview:null,context:null});
 assert.match(guard("buy"),/Règles d'archive datée/);
 assert.equal(guard("buy").includes("solde Trading vérifié"),false);

 ui.updateCycle({paper:true,events:[{type:"PAPER_PREPARE",at:"t0"},{type:"PAPER_CANCEL",at:"t1"}]});
 assert.equal(node.querySelector("[data-od-events]").children.length,2);
 ui.update({ticket:{pair:"CT-USDT",orders_enabled:false}});
 assert.equal(node.dataset.ready,"false");
 assert.match(node.querySelector("[data-od-verdict-title]")?.textContent||"",/À VÉRIFIER/);
 assert.equal(text("buyQty"),"—");
 assert.match(proof("fresh"),/Vérification nécessaire/);
 assert.ok(css.includes("@media(max-width:880px)"));
 assert.ok(css.includes(".erith-od-guard>summary:focus-visible"));
 assert.ok(mirror.includes("trader-order-entry.css"));
 assert.ok(mirror.includes("trader-order-entry-view.js"));
 assert.ok(owner.includes("AgentCryptoTraderOrderEntryView?.update"));
 assert.match(owner,/VENTE NON ADMISSIBLE/);
 for(const forbidden of ["fetch(","XMLHttpRequest","localStorage","sessionStorage",
  "/api/v5/trade/order","Authorization","Bearer"])
  assert.equal(src.includes(forbidden),false,"unexpected trade capability: "+forbidden);
});

test("Option C stays inside the existing PAPER ticket, not a second trading owner",()=>{
 const view=fs.readFileSync(path.join(__dirname,"trader-paper-decision-view.js"),"utf8");
 const runtime=fs.readFileSync(path.join(__dirname,"trader-runtime-mirror.js"),"utf8");
 assert.ok(view.includes("const orderEntry=globalThis.AgentCryptoTraderOrderEntryView?.mount"));
 assert.ok(view.includes("backReports.append(brief,cycle,technical)"));
 assert.ok(view.includes("ticketBox.append(warning,orderEntry)"));
 assert.ok(view.includes("globalThis.AgentCryptoTraderOrderEntryView?.reset"));
 assert.ok(view.includes("globalThis.AgentCryptoTraderOrderEntryView?.updateCycle"));
 assert.ok(runtime.includes("loadOrderEntry=()=>add"));
 assert.ok(runtime.includes("trader-order-entry-view.js"));
 assert.equal(view.includes("/api/v5/trade/order"),false);
 assert.equal(view.includes("/okx/place-order"),false);
});
