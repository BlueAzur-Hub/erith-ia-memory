"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const app=fs.readFileSync("public/agent_crypto_erith_ia/administrator/app.js","utf8");
function extract(a,b){const i=app.indexOf(a),j=app.indexOf(b,i+a.length);assert(i>=0&&j>i,a);return app.slice(i,j)}
const functions=[
extract("function atlasHistoryQuoteProvenance(","\nfunction atlasValidateChartSeries("),
extract("function atlasHistoricalDisplayQuote(","\nfunction atlasComparisonTooltipRows("),
extract("async function atlasFetchComparisonSeriesResilient(","\nfunction atlasSourceDockSafeUrl(")
].join("\n");
const eurBinance={source:"Binance Spot BTC/EUR · chandelles",sourceFamily:"binance",currency:"EUR",quoteCurrency:"EUR",series:[[1,100],[2,102]]};
const eurCg={source:"CoinGecko market_chart EUR · direct",sourceFamily:"coingecko",currency:"EUR",quoteCurrency:"EUR",series:[[1,100],[2,102]]};
const usdCg={source:"CoinGecko market_chart USD · direct",sourceFamily:"coingecko",currency:"USD",quoteCurrency:"USD",series:[[1,110],[2,112]]};
function build({display="EUR",canonical=eurBinance,canonicalError=null,stored={},cg=eurCg,cgError=null,preset="rank-5"}={}){
 const calls=[];
 const cx={console,Date,Number,String,Array,Set,Math,Error,Promise,
  state:{dataBroker:{comparison:{preset}}},
  AgentCryptoQuoteCurrencyArchitecture:{snapshot:()=>({displayCurrency:display})},
  atlasChartNeedsRefresh:()=>false,
  atlasGetStoredChartResult:(coin,period,family)=>stored[family]||null,
  atlasHistoryBridgeCanTry:()=>false,
  atlasRespectComparisonRequestSpacing:async()=>{},
  atlasComparisonAbortError:()=>false,
  atlasFetchTargetTop5BinanceEur24hTruth:async()=>{calls.push("binance-eur");if(canonicalError)throw canonicalError;return canonical},
  fetchBinanceChartDirectDynamic:async()=>{calls.push("binance-dynamic");throw new Error("unavailable")},
  fetchCoinGeckoChartDirect:async()=>{calls.push("coingecko-eur");if(cgError)throw cgError;return cg},
  atlasStoreChartResult:(coin,p,result,family)=>calls.push("store:"+family),
  atlasComparisonRetryableError:()=>false,
  atlasWaitWithSignal:async()=>{},
  atlasChartAbortError:()=>new Error("aborted"),
  atlasChartResultSourceFamily:row=>row.sourceFamily||"coingecko",
  ATLAS_COMPARISON_RETRY_DELAYS_MS:[0,0],ATLAS_COMPARISON_DIRECT_TIMEOUT_MS:1000
 };
 cx.globalThis=cx;vm.createContext(cx);vm.runInContext(functions,cx);
 return{calls,run:()=>cx.atlasFetchComparisonSeriesResilient({id:"bitcoin",symbol:"BTC"},1,{})};
}
test("Top 5 EUR 24h preserves direct Binance BTC/EUR if available",async()=>{
 const x=build(),v=await x.run();
 assert.equal(v.source,"binance-eur-direct-24h-truth");
 assert.equal(v.result.currency,"EUR");
 assert.deepEqual(x.calls,["binance-eur","store:binance"]);
});
test("Top 5 EUR preserves verified Binance EUR cache after direct failure",async()=>{
 const x=build({canonicalError:new Error("offline"),stored:{binance:eurBinance}}),v=await x.run();
 assert.equal(v.result.currency,"EUR");assert.match(v.source,/binance-eur-direct-24h-preserved-cache/);
 assert.deepEqual(x.calls,["binance-eur"]);
});
test("Top 5 EUR obtains real CoinGecko EUR if Binance unavailable, never USD cache",async()=>{
 const x=build({canonicalError:new Error("offline"),stored:{binance:usdCg},cg:eurCg}),v=await x.run();
 assert.equal(v.result.currency,"EUR");assert.equal(v.source,"coingecko-eur-direct-after-binance");
 assert.deepEqual(x.calls,["binance-eur","coingecko-eur","store:coingecko"]);
});
test("Top 5 EUR reuses verified EUR cache only after both direct sources fail",async()=>{
 const x=build({canonicalError:new Error("offline"),cgError:new Error("429"),stored:{binance:usdCg,coingecko:eurCg}}),v=await x.run();
 assert.equal(v.result.currency,"EUR");
 assert.equal(v.source,"coingecko-eur-verified-cache");
});
test("Top 5 EUR never treats contradictory EUR-labelled USD source as valid",async()=>{
 const falseEur={...usdCg,quoteCurrency:"EUR",currency:"EUR"};
 const x=build({canonicalError:new Error("offline"),cgError:new Error("offline"),stored:{binance:falseEur,coingecko:usdCg}}),v=await x.run();
 assert.equal(v.source,"eur-source-unavailable");
 assert.equal(v.result.blocked,true);
});
test("Top 5 USD does not force the historical Binance EUR path",async()=>{
 const x=build({display:"USD",stored:{coingecko:usdCg}}),v=await x.run();
 assert.equal(v.source,"fresh-cache");
 assert.equal(v.result.currency,"USD");
 assert.equal(x.calls.length,0);
});
