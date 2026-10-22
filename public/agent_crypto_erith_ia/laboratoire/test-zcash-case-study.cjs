"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),
 fs=require("node:fs"),path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const data=JSON.parse(read("data/crypto/research/zcash.json"));
const model=require("./zcash-paper-model.js");
const page=read("laboratoire/zcash-case-study.html");
const radar=read("laboratoire/radar-historique.html");
test("official ZEC documentary source, distinct quote and Futures",()=>{
 assert.equal(data.schema,"erith.crypto.asset-research-dossier.v1");
 assert.equal(data.asset_id,"zcash");
 assert.equal(data.market_identity.canonical_spot_pair,"ZEC-USDC");
 assert.equal(data.market_identity.instrument_type,"SPOT");
 assert.equal(data.market_identity.individual_account_access_verified,false);
 assert.equal(data.trading_policy.orders_enabled,false);
 assert.equal(data.trading_policy.real_orders,0);
 assert.equal(data.trading_policy.decision,"OBSERVE_AND_PAPER_ONLY");
 assert.equal(data.comparison_derivatives.realized_gain_certified,false);
 assert.equal(data.market_identity.instrument_rules_min_sz,null);
 assert.equal(data.market_identity.instrument_rules_lot_sz,null);
 assert.equal(data.market_identity.instrument_rules_tick_sz,null);
 assert.equal(data.paper_model.minimum_and_lot_check,"UNKNOWN");
 assert.equal(data.paper_model.not_historical_fill,true);
 assert.equal(data.paper_model.prices_from_different_screenshot_times,true);
 assert.ok(data.official_research.length>=5);
 assert.ok(data.screenshot_observations[0].market.includes("ZEC/USDC"));
 assert.equal(data.paper_model.exit_bid_scenarios_usdc.length,3);
});
test("spot math accounts for fee in ZEC at entry and USDC at exit",()=>{
 const m=model.simulate({budget_usdc:10,entry_ask_usdc:1285.86,exit_bid_usdc:1297.85,
  buy_fee_percent:.1,sell_fee_percent:.1});
 const base=10/1285.86;
 assert.ok(Math.abs(m.net_zec-base*.999)<1e-12);
 assert.ok(Math.abs(m.sale_proceeds_usdc-base*.999*1297.85*.999)<1e-10);
 assert.ok(m.pnl_usdc>0);
 assert.equal(m.quote,"USDC");assert.equal(m.real_orders,0);
 assert.equal(m.execution_proven,false);assert.equal(m.minSz_verified,false);
});
test("a flat price loses the assumed roundtrip costs",()=>{
 const m=model.simulate({budget_usdc:10,entry_ask_usdc:100,exit_bid_usdc:100,buy_fee_percent:.1,sell_fee_percent:.1});
 assert.ok(m.pnl_usdc<0);
 assert.ok(Math.abs(m.pnl_pct-(-0.1999))<1e-9);
});
test("invalid assumptions fail closed",()=>{
 const base={budget_usdc:10,entry_ask_usdc:1285.86,exit_bid_usdc:1297.85,buy_fee_percent:.1,sell_fee_percent:.1};
 for(const change of [{budget_usdc:0},{entry_ask_usdc:0},{exit_bid_usdc:NaN},{buy_fee_percent:20},{sell_fee_percent:-1}]){
  assert.throws(()=>model.simulate({...base,...change}),RangeError);
 }
});
test("one native Cas d'école and readable standalone page, no order functionality",()=>{
 assert.match(page,/href="..\/data\/crypto\/research\/zcash.json"/);
 assert.match(page,/src="zcash-paper-model.js"/);
 assert.match(page,/ZEC-USDC/);
 assert.match(page,/aucun ordre/i);
 assert.match(radar,/href="zcash-case-study.html"/);
 
 
 
 
 assert.ok(!/fetch\s*\(/.test(read("laboratoire/zcash-paper-model.js")));
 assert.ok(!/localStorage|indexedDB|XMLHttpRequest|sendOrder|placeOrder|createOrder|navigator\.sendBeacon/.test(read("laboratoire/zcash-paper-model.js")));
 assert.match(page,/aucune cotation en temps réel|ni des cotations en temps réel/i);
});
