"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const engine=require("../public/agent_crypto_erith_ia/trader/spot-paper-order-engine.js");

function fixture(qty="100.2",minimum="100"){
 const entered="2026-10-20T10:00:30Z",qualified="2026-10-20T10:00:00Z";
 const addr="0x"+"1".repeat(40);
 const position={coin_id:"quack-ai",symbol:"Q",pair:"QUSDT",venue:"Bitget",
   quote:"USDT",platform:"ethereum",contract_address:addr,
   status:"HYPOTHETICAL_NO_FILL",executed_order:false,notional_usdt:"100",
   entry_quote_at_utc:entered,entry_ask_usdt:"1.00",
   hypothetical_quantity:qty,realized_profit_usdt:null};
 const ledger={schema:"erith.radar.spot-paper-forward-shadow.v1",
   orders_enabled:false,real_orders:0,paper_fills:0,execution_proven:false,
   positions:[position]};
 const identity={schema:"erith.radar.spot-identity-prospective.v1",
   orders_enabled:false,real_orders:0,qualification_at_utc:qualified,
   source_radar_day_utc:"2026-10-20",collected_at_utc:"2026-10-20T10:01:00Z",
   candidates:[{coin_id:"quack-ai",venue:"Bitget",pair:"QUSDT",quote:"USDT",
     platform:"ethereum",contract_address:addr,identity_proven:true,
     paper_entry_decision:"AWAIT_NEXT_DATED_BOOK_AND_COST_CHECK",
     min_order_usdt:"1",spot_exit_rules:{min_quantity:minimum,
       lot_step:"0.01",tick_size:"0.01",rules_source:"Bitget public SPOT instrument"}}]};
 const qualification={schema:"erith.radar.spot-qualification.v1",
   real_orders_enabled:false,qualified_at_utc:qualified,source_observation_date_utc:"2026-10-20",
   candidates:[{id:"quack-ai",market:{provider:"Bitget",pair:"QUSDT",quote:"USDT",
     book:{best_bid_usdt:"0.99",best_ask_usdt:"1.00",exchange_timestamp_verified:true,
       observed_at_utc:entered}}}]};
 return {ledger,identity,qualification};
}
const audit=x=>engine.auditRadarShadow(x.ledger,x.identity,x.qualification);
test("validated prospective paper evidence uses the existing exact net-exit-size guard",()=>{
 const r=audit(fixture());
 assert.equal(r.status,"READ_ONLY_AUDIT");
 assert.equal(r.checked,1);assert.equal(r.notCertified,0);
 assert.equal(r.results[0].status,"HYPOTHETICAL_SIZE_OK");
 assert.equal(r.results[0].lotSellableQuantity,"100.09");
 assert.equal(r.results[0].marketRulesVerified,false);
 assert.equal(r.executable,false);assert.equal(r.orders_enabled,false);
 assert.equal(engine.realOrders,false);assert.equal(engine.tradeEndpoint,null);
});
test("a gross minimum becomes non-sellable after conservative base fees",()=>{
 const r=audit(fixture("100","100"));
 assert.equal(r.checked,0);
 assert.equal(r.results[0].status,"NET_EXIT_SIZE_BLOCKED");
 assert.equal(r.results[0].lotSellableQuantity,"99.9");
});
test("missing filters remain unproven even when the exact contract matches",()=>{
 const x=fixture();x.identity.candidates[0].spot_exit_rules=null;
 assert.equal(audit(x).results[0].reason,"NATIVE_EXIT_FILTERS_MISSING");
 assert.equal(audit(x).checked,0);
});
test("cross-exchange, wrong contract and symbol-only matches are refused",()=>{
 const cases=[
  x=>{x.identity.candidates[0].contract_address="0x"+"2".repeat(40)},
  x=>{x.identity.candidates[0].identity_proven=false},
  x=>{x.identity.candidates[0].venue="OKX"},
  x=>{x.ledger.positions[0].pair="OTHERUSDT"},
  x=>{x.qualification.candidates[0].market.provider="OKX"},
  x=>{x.identity.candidates[0].spot_exit_rules.rules_source="OKX public SPOT instrument"}];
 for(const alter of cases){const x=fixture();alter(x);assert.equal(audit(x).checked,0);}
});
test("book and proof must refer to the same dated observation",()=>{
 const cases=[
  x=>{x.qualification.candidates[0].market.book.exchange_timestamp_verified=false},
  x=>{x.qualification.candidates[0].market.book.observed_at_utc="2026-10-20T10:02:00Z"},
  x=>{x.identity.collected_at_utc="2026-10-20T11:01:00Z"},
  x=>{x.qualification.candidates[0].market.book.best_ask_usdt="1.01"},
  x=>{x.qualification.candidates[0].market.book.best_bid_usdt="0.991"}];
 for(const alter of cases){const x=fixture();alter(x);assert.equal(audit(x).checked,0);}
});
test("precision, lot size and unsupported quantities fail closed without any fill",()=>{
 const cases=[
  x=>{x.ledger.positions[0].hypothetical_quantity="1e9"},
  x=>{x.identity.candidates[0].spot_exit_rules.lot_step="0"},
  x=>{x.identity.candidates[0].spot_exit_rules.min_quantity="0.000000001"},
  x=>{x.ledger.positions[0].hypothetical_quantity="0.001"},
  x=>{x.ledger.paper_fills=1}];
 for(const alter of cases){const x=fixture();alter(x);assert.equal(audit(x).checked||0,0);}
});
test("prior Radar shadow records without new native filters stay historical, not certified",()=>{
 const x=fixture();
 delete x.identity.candidates[0].spot_exit_rules;
 assert.equal(audit(x).results[0].status,"NOT_CERTIFIED");
 assert.equal(audit(x).results[0].executable,false);
});

test("Radar does not mislabel missing public Spot rules as rejected trades",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const file=path.join(__dirname,"../public/agent_crypto_erith_ia/laboratoire/radar-spot-paper.js");
 const view=fs.readFileSync(file,"utf8");
 assert.match(view,/Revente nette non évaluable/);
 assert.match(view,/NATIVE_EXIT_FILTERS_MISSING/);
 assert.doesNotMatch(view,/tailles théoriques admissibles sous frais BASE/);
});

test("existing Radar panel summarizes independent OKX public Spot rules without promising trades",()=>{
 const view=require("../public/agent_crypto_erith_ia/laboratoire/radar-spot-paper.js");
 const rows=Array.from({length:20},(_,i)=>({symbol:"TOK"+i,okx_spot:{
   venue:"OKX",quote:"USDT",pair:null,pair_observed:false,native_rules_verified:false,
   rules:null,contract_identity_proven:false,real_orders_enabled:false}}));
 rows[0].okx_spot={...rows[0].okx_spot,pair:"TOK0-USDT",pair_observed:true,
   native_rules_verified:true,rules:{source:"OKX_PUBLIC_SPOT_INSTRUMENT",
     min_sz:"10",lot_sz:"0.01",tick_sz:"0.00001"}};
 rows[1].okx_spot={...rows[1].okx_spot,pair:"TOK1-USDT",pair_observed:true,
   native_rules_verified:false};
 const report={schema:"erith.radar.spot-qualification.v1",
   venues:{OKX:{available:true}},candidates:rows};
 const summary=view.okxSpotSummary(report);
 assert.match(summary,/2 paires candidates/);
 assert.match(summary,/1 règles publiques/);
 assert.match(summary,/Identité CoinGecko, accès au compte, frais réels et ordre non certifiés/);
 assert.match(view.okxSpotSummary({...report,venues:{OKX:{available:false}}}),/en attente/);
 assert.match(view.okxSpotSummary({...report,candidates:rows.map(x=>({symbol:x.symbol}))}),/en attente/);
 rows[0].okx_spot.rules.tick_sz="NaN";
 assert.match(view.okxSpotSummary(report),/0 règles publiques/);
});
