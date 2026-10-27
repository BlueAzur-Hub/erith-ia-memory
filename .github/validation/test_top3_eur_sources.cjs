"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const code=fs.readFileSync("public/agent_crypto_erith_ia/administrator/app.js","utf8");
function extract(start,end){
 const a=code.indexOf(start),b=code.indexOf(end,a+start.length);
 assert(a>=0&&b>a,"Expected existing code owner: "+start);
 return code.slice(a,b);
}
const functions=[
 extract("function atlasHistoryQuoteProvenance(","\nfunction atlasValidateChartSeries("),
 extract("function atlasHistoricalDisplayQuote(","\nfunction atlasComparisonTooltipRows("),
 extract("async function atlasFetchComparisonSeriesResilient(","\nfunction atlasSourceDockSafeUrl(")
].join("\n");
const eur=(family="coingecko")=>family==="binance"
 ? {source:"Binance Spot BTC/EUR · chandelles scanner",sourceFamily:"binance",sourceMode:"binance-scanner-direct-klines",currency:"EUR",quoteCurrency:"EUR",series:[[1,100],[2,101]],savedAt:2}
 : {source:"CoinGecko market_chart EUR · direct",sourceFamily:"coingecko",sourceMode:"coingecko-direct",currency:"EUR",quoteCurrency:"EUR",series:[[1,100],[2,101]],savedAt:2};
const usd=()=>({source:"CoinGecko market_chart USD · direct",sourceFamily:"coingecko",sourceMode:"coingecko-direct",currency:"USD",quoteCurrency:"USD",series:[[1,110],[2,111]],savedAt:3});
function setup({preset="rank-3",display="EUR",stored={},bridge=false,bridgeResult=null,binanceResult=eur("binance"),cgResult=eur(),binanceError=null,cgError=null}={}){
 const calls=[];
 const cx={console,Date,Number,String,Array,Set,Math,Error,Promise,
  state:{dataBroker:{comparison:{preset}}},
  AgentCryptoQuoteCurrencyArchitecture:{snapshot:()=>({displayCurrency:display})},
  atlasChartNeedsRefresh:()=>false,
  atlasGetStoredChartResult:(coin,period,family)=>stored[family]||null,
  atlasHistoryBridgeCanTry:()=>bridge,
  atlasRespectComparisonRequestSpacing:async()=>{},atlasComparisonAbortError:()=>false,
  atlasFetchBridgeHistory:async()=>{calls.push("bridge");return bridgeResult},
  fetchBinanceChartDirectDynamic:async()=>{calls.push("binance");if(binanceError)throw binanceError;return binanceResult},
  fetchCoinGeckoChartDirect:async()=>{calls.push("coingecko");if(cgError)throw cgError;return cgResult},
  atlasStoreChartResult:(coin,period,result,family)=>calls.push("store:"+family),
  atlasComparisonRetryableError:()=>false,
  atlasWaitWithSignal:async()=>{},
  atlasChartAbortError:()=>new Error("aborted"),
  atlasChartResultSourceFamily:row=>row.sourceFamily||"coingecko",
  ATLAS_COMPARISON_RETRY_DELAYS_MS:[0,0],ATLAS_COMPARISON_DIRECT_TIMEOUT_MS:1000
 };
 cx.globalThis=cx;vm.createContext(cx);vm.runInContext(functions,cx);
 return {cx,calls,run:(period=1)=>cx.atlasFetchComparisonSeriesResilient({id:"bitcoin",symbol:"BTC"},period,{})};
}
test("Top3 EUR refuses fresh cache carrying USD and obtains native EUR",async()=>{
 const t=setup({stored:{coingecko:usd()}});
 const ans=await t.run();
 assert.equal(ans.result.currency,"EUR");
 assert.equal(ans.source,"binance-direct");
 assert.deepEqual(t.calls,["binance","store:binance"]);
});
test("Top3 EUR refuses Bridge USD before taking Binance EUR",async()=>{
 const t=setup({bridge:true,bridgeResult:usd()});
 const ans=await t.run();
 assert.equal(ans.result.currency,"EUR");
 assert.deepEqual(t.calls,["bridge","binance","store:binance"]);
});
test("Top3 EUR ignores Binance USD and uses verified CoinGecko EUR",async()=>{
 const t=setup({binanceResult:usd()});
 const ans=await t.run();
 assert.equal(ans.result.currency,"EUR");
 assert.equal(ans.source,"coingecko-direct");
 assert.deepEqual(t.calls,["binance","coingecko","store:coingecko"]);
});
test("Top3 EUR never falls back to a USD-only cache when both sources fail",async()=>{
 const t=setup({stored:{coingecko:usd()},binanceError:new Error("offline"),cgError:new Error("offline")});
 const ans=await t.run();
 assert.equal(ans.source,"blocked");
 assert.equal(ans.result.blocked,true);
 assert.equal(ans.result.series.length,0);
});
test("Top3 EUR refuses an EUR-labelled cache whose source declares USD",async()=>{
 const contradictory={...usd(),currency:"EUR",quoteCurrency:"EUR"};
 const t=setup({stored:{coingecko:contradictory}});
 const ans=await t.run();
 assert.equal(ans.source,"binance-direct");
 assert.equal(ans.result.currency,"EUR");
});
test("Top3 EUR preserves genuine EUR cache over seven periods",async()=>{
 for(const p of [1,7,30,60,90,365,36500]){
  const t=setup({stored:{coingecko:eur()}});
  const ans=await t.run(p);
  assert.equal(ans.source,"fresh-cache");
  assert.equal(ans.result.currency,"EUR");
  assert.equal(t.calls.length,0);
 }
});
test("Top3 USD original path remains unchanged for subsequent USD work",async()=>{
 const t=setup({display:"USD",stored:{coingecko:usd()}});
 const ans=await t.run();
 assert.equal(ans.source,"fresh-cache");
 assert.equal(ans.result.currency,"USD");
});
test("Other comparison modes are not modified by Top3-specific guard",async()=>{
 const t=setup({preset:"rank-5",stored:{coingecko:usd()}});
 const ans=await t.run(7);
 assert.equal(ans.source,"fresh-cache");
});
