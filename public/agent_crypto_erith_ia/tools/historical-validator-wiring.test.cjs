"use strict";
// Reproduction in an isolated VM of the unchanged production validator.
// No network, no browser state and no production writes.
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {inspectHistoricalRecord,historicalSpotParity}=require("./historical-quote-contract.cjs");
const root=path.resolve(__dirname,"..");
const source=fs.readFileSync(path.join(root,"administrator/app.js"),"utf8");
const evidence=JSON.parse(fs.readFileSync(path.resolve(__dirname,"../../../coordination/inter_ai_dialogues/agent_crypto/PREUVE_FIREFOX_PRIX_HISTORIQUES_5_ACTIFS_20261026.json"),"utf8"));
function originalValidator(){
 const start=source.indexOf("function atlasValidateChartSeries(");
 const end=source.indexOf("\nconst atlasChartLocalStoreRuntime",start);
 assert.ok(start>0&&end>start,"Original validator source markers must exist");
 const context={
  atlasChartRules:()=>({minPoints:2,minCoverageHours:1}),
  atlasChartCoverageHours:series=>(series.at(-1)[0]-series[0][0])/3600000,
  atlasChartFreshness:()=>({level:"fresh",ageMs:0,label:"frais"}),
  atlasCoinPriceIsComparable:()=>true,
  ATLAS_CHART_MAX_FUTURE_MS:5*60*1000,
  ATLAS_CHART_PRICE_GAP_WARN_PCT:2.5,
  Date,Number,Math,Array
 };
 vm.runInNewContext(source.slice(start,end)+"\nthis.validate=atlasValidateChartSeries;",context,{timeout:1000});
 return context.validate;
}
function bitcoinUsdFixture(){
 const entry=evidence.entries.find(row=>row.key==="bitcoin:USD:coingecko:1");
 assert.ok(entry,"Firefox 24h native USD fixture must exist");
 return entry;
}
test("The unchanged app.js still warns about USD/EUR spread when c.price is EUR",()=>{
 const entry=bitcoinUsdFixture();
 const first=entry.samples[0],last=entry.samples.at(-1);
 const coin={id:"bitcoin",source:"CoinGecko",price:71366.61,priceEur:71366.61,priceUsd:80159.31,spotUpdatedAt:last.timeIso};
 const result=originalValidator()({c:coin,days:1,prices:[[first.timeMs,first.priceRaw],[last.timeMs,last.priceRaw]],sourceMode:"coingecko-direct"});
 assert.equal(result.ok,true);
 assert.ok(result.metrics.priceGapPct>12 && result.metrics.priceGapPct<13);
 assert.ok(result.warnings.some(message=>message.includes("écart prix/courbe")));
});
test("Contract parity on the SAME Firefox prices compares USD with priceUsd instead",()=>{
 const entry=bitcoinUsdFixture();
 const record=inspectHistoricalRecord(entry);
 const last=entry.samples.at(-1);
 const spot={source:"CoinGecko",price:71366.61,priceEur:71366.61,priceUsd:80159.31,spotUpdatedAt:last.timeIso};
 const parity=historicalSpotParity(spot,record,last.priceRaw,last.timeMs);
 assert.equal(parity.comparable,true);
 assert.equal(parity.currency,"USD");
 assert.equal(parity.spotField,"priceUsd");
 assert.ok(parity.gapPct<0.01);
 assert.equal(parity.warn,false);
});
test("USD parity refuses source mismatch or historical timestamp far from spot",()=>{
 const entry=bitcoinUsdFixture(),record=inspectHistoricalRecord(entry),last=entry.samples.at(-1);
 const spot={source:"CoinGecko",priceUsd:80159.31,spotUpdatedAt:last.timeIso};
 assert.equal(historicalSpotParity({...spot,source:"Binance"},record,last.priceRaw,last.timeMs).comparable,false);
 assert.equal(historicalSpotParity({...spot,spotUpdatedAt:"2026-10-24T05:50:10.000Z"},record,last.priceRaw,last.timeMs).comparable,false);
});
test("Inventory guards all 11 callers before a shared validator migration",()=>{
 const occurrences=[...source.matchAll(/\batlasValidateChartSeries\s*\(/g)].map(m=>source.slice(0,m.index).split("\n").length);
 assert.equal(occurrences.length,12,"one definition + eleven use sites, review migration mapping if changed");
 assert.deepEqual(occurrences,[5663,5796,10737,15765,15879,50202,50228,50259,50330,50370,50401,54006]);
});
