"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const view=require("./radar-okx-hourly.js");
const NOW=Date.parse("2026-10-20T03:20:00Z");
const pair=(name="BTC-USDC")=>({
 pair:name,quote:name.split("-")[1],book_samples:1,
 first_source_utc:"2026-10-20T03:18:44Z",
 last_source_utc:"2026-10-20T03:18:44Z",
 latest_mid_native_quote:"81780.55",
 latest_spread_bps:"0.01",median_spread_bps:"0.01",max_spread_bps:"0.01",
 best_bid_level_value_native_quote:"2021.3653",
 best_ask_level_value_native_quote:"3690.3299",
 observed_mid_change_pct:null,status:"AWAITING_SECOND_HOUR",
 trading_signal:false,market_fill_proven:false
});
const data=(pairs=[pair()])=>({
 schema:"erith.radar.okx-hourly-evidence.v1",
 kind:"public_observational_spreads_and_native_quote_prices",
 as_of_utc:"2026-10-20T03:18:44Z",
 observed_hours_total:1,pairs_with_public_books:pairs.length,
 pairs_with_two_or_more_hours:pairs.filter(x=>x.book_samples>=2).length,
 quotes_separate:["USDC","USDT","EUR"],
 no_interpolation:true,no_quote_conversion:true,strategy_certified:false,
 trading_signals_issued:0,orders_enabled:false,real_orders:0,paper_fills:0,pairs
});
test("One genuine snapshot is NOT a trend or a trading signal",()=>{
 const model=view.valid(data(),NOW);
 assert.equal(model.withTrend,0);
 assert.equal(model.pairs[0].change,null);
 assert.equal(model.pairs[0].status,"UNE_HEURE");
 assert.equal(model.stale,false);
 assert.equal(model.realOrders,false);
 assert.equal(model.strategyCertified,false);
});
test("Two real observations compare only within the same exact spot pair",()=>{
 const second={...pair(),book_samples:2,status:"DESCRIPTIVE_ONLY",
  observed_mid_change_pct:"0.43"};
 const doc={...data([second]),observed_hours_total:2};
 const model=view.valid(doc,NOW);
 assert.equal(model.withTrend,1);
 assert.equal(model.pairs[0].change,0.43);
 assert.equal(model.pairs[0].quote,"USDC");
 assert.throws(()=>view.valid({...doc,pairs_with_two_or_more_hours:0},NOW),/couverture/i);
});
test("CT now belongs to the immutable six-asset native-quote archive, not a trading signal",()=>{
 const cases=["BTC","ETH","SOL","XRP","OKB","CT"].flatMap(base=>
  ["USDC","USDT","EUR"].map(quote=>pair(base+"-"+quote)));
 const report=data(cases);
 const model=view.valid(report,NOW);
 assert.equal(model.pairs.length,18);
 assert.equal(model.realOrders,false);
 assert.equal(model.strategyCertified,false);
 assert.equal(model.noQuoteConversion,true);
 assert.throws(()=>view.valid(data([...cases,pair("DOGE-USDT")]),NOW),
  /Paire|incompatible/i);
});
test("Never mix stablecoin quotes or duplicate a symbol",()=>{
 const m=view.valid(data([pair("BTC-USDC"),pair("BTC-USDT"),pair("BTC-EUR")]),NOW);
 assert.deepEqual(new Set(m.pairs.map(x=>x.quote)),new Set(["USDC","USDT","EUR"]));
 assert.throws(()=>view.valid(data([pair(),pair()]),NOW),/Paire|doublon|incohérent/i);
 assert.throws(()=>view.valid(data([{...pair(),quote:"USDT"}]),NOW),/Paire/i);
 assert.throws(()=>view.valid(data([pair("BTC-USD")]),NOW),/Paire/i);
});
test("Stale evidence remains archived, never current or predicted",()=>{
 const model=view.valid(data(),NOW+3*3600000);
 assert.equal(model.stale,true);
 assert.ok(model.ageMinutes>120);
 assert.throws(()=>view.valid(data(),NOW-130000),/futur/i);
});
test("Reject forged fills, nonnumeric spreads and invented changes",()=>{
 const source=data();
 for(const bad of [
   {...source,orders_enabled:true}, {...source,real_orders:1},
   {...source,paper_fills:1},{...source,strategy_certified:true},
   {...source,no_quote_conversion:false},
   {...source,pairs:[{...pair(),latest_spread_bps:"Infinity"}]},
   {...source,pairs:[{...pair(),observed_mid_change_pct:"10"}]},
   {...source,pairs:[{...pair(),book_samples:2}]},
   {...source,pairs:[{...pair(),market_fill_proven:true}]}
 ])assert.throws(()=>view.valid(bad,NOW));
});
test("Existing Radar owns the UI; standalone-only public fetch, no private API",()=>{
 const html=fs.readFileSync(path.join(__dirname,"radar.html"),"utf8");
 const js=fs.readFileSync(path.join(__dirname,"radar-okx-hourly.js"),"utf8");
 assert.match(html,/radar-okx-hourly-details/);
 assert.match(html,/radar-okx-hourly-status/);
 assert.match(html,/radar-okx-hourly\.js/);
 assert.match(html,/Bilan JSON horodaté/);
 assert.match(js,/research-latest\.json/);
 assert.match(js,/credentials:"omit"/);
 assert.match(js,/cache:"no-store"/);
 assert.match(js,/replaceChildren/);
 assert.doesNotMatch(js,/\/api\/v5\/trade|secretKey|localStorage|setInterval/);
 assert.equal(view.valid(data(),NOW).pairs.length,1);
});

test("Validator reads the REAL published immutable OKX report, not just fixtures",()=>{
 const archive=path.resolve(__dirname,"../data/crypto/okx-hourly/research-latest.json");
 const published=JSON.parse(fs.readFileSync(archive,"utf8"));
 const model=view.valid(published,Date.parse(published.as_of_utc)+60000);
 assert.equal(model.pairs.length,published.pairs_with_public_books);
 assert.equal(model.withTrend,published.pairs_with_two_or_more_hours);
 assert.equal(model.realOrders,false);
 assert.equal(model.noQuoteConversion,true);
});
