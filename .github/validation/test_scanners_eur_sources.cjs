"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const app=fs.readFileSync("public/agent_crypto_erith_ia/administrator/app.js","utf8");
function part(a,b){const i=app.indexOf(a),j=app.indexOf(b,i+a.length);assert(i>=0&&j>i,"owner "+a);return app.slice(i,j)}
const fns=[
 part("function atlasHistoryQuoteProvenance(","\nfunction atlasValidateChartSeries("),
 part("function atlasHistoricalDisplayQuote(","\nfunction atlasComparisonTooltipRows("),
 part("function atlasScannerStoredHistory(","\nasync function atlasScannerYieldToUi("),
 part("async function atlasScannerFetchDirect(","\nconst ATLAS_SCANNER_COLLECTOR_SCHEMA")
].join("\n");
const eur={source:"CoinGecko market_chart EUR · direct",sourceFamily:"coingecko",currency:"EUR",quoteCurrency:"EUR",series:[[1,11],[2,12]],savedAt:1};
const usd={source:"CoinGecko market_chart USD · direct",sourceFamily:"coingecko",currency:"USD",quoteCurrency:"USD",series:[[1,14],[2,15]],savedAt:3};
const eurBinance={source:"Binance Spot BTC/EUR",sourceFamily:"binance",currency:"EUR",quoteCurrency:"EUR",series:[[1,11],[2,12]],savedAt:2};
function context({display="EUR",stored={},cg=eur,bridge=eur,binance=eurBinance,useBridge=true}={}){
 const actions=[];
 const g={console,Date,Number,String,Array,Set,Math,Error,Promise,
  state:{dataBroker:{comparison:{results:{bitcoin:stored.current||null}}}},
  atlasScannerNativeUsdRequested:()=>display==="USD",
  atlasScannerNativeUsdStored:()=>usd,
  atlasGetStoredChartResult:(coin,p,f)=>stored[f]||null,
  atlasRespectComparisonRequestSpacing:async()=>{},
  atlasScannerSeriesCoversWindow:()=>({ok:true}),
  atlasStoreChartResult:(coin,p,v,f)=>actions.push("store:"+f),
  atlasComparisonAbortError:()=>false,
  atlasDeviceComputeAllowed:()=>useBridge,
  atlasHistoryBridgeCanTry:()=>useBridge,
  atlasFetchBridgeHistory:async()=>{actions.push("bridge");return bridge},
  fetchCoinGeckoChartDirect:async()=>{actions.push("coingecko");return cg},
  fetchBinanceChartDirectDynamic:async()=>{actions.push("binance");return binance},
  atlasScannerSafeExchangeSymbol:()=>true,
  atlasWaitWithSignal:async()=>{},
  ATLAS_SCANNER_BRIDGE_FAST_TIMEOUT_MS:1000,
  atlasChartAbortError:()=>new Error("aborted")
 };
 g.globalThis=g;vm.createContext(g);vm.runInContext(fns,g);
 const coin={id:"bitcoin",symbol:"BTC"};
 const tx={period:1,controller:{signal:{aborted:false}},preset:"gainers"};
 return {g,actions,cache:()=>g.atlasScannerStoredHistory(coin,1,tx),fetch:()=>g.atlasScannerFetchDirect(tx,coin)};
}
test("EUR scanner rejects USD current history, selects original verified EUR cache",()=>{
 const t=context({stored:{current:usd,binance:eurBinance,coingecko:eur}});
 const v=t.cache();assert.equal(v.currency,"EUR");
 assert.equal(v.sourceFamily,"binance");
});
test("EUR scanner never treats USD-only history as an EUR cache",()=>{
 const t=context({stored:{current:usd,coingecko:usd}});
 assert.equal(t.cache(),null);
});
test("EUR scanner supports historic EUR records without refreshing them",()=>{
 const t=context({stored:{current:eur}});
 assert.equal(t.cache().currency,"EUR");
});
test("USD scanner still selects the existing native USD store",()=>{
 const t=context({display:"USD",stored:{current:eur}});
 assert.equal(t.cache().currency,"USD");
});
test("EUR scanner refuses CoinGecko USD and accepts verified Bridge EUR",async()=>{
 const t=context({cg:usd,bridge:eur});
 const result=await t.fetch();assert.equal(result.result.currency,"EUR");
 assert.match(result.provider,/bridge-/);
 assert.deepEqual(t.actions,["coingecko","bridge","store:coingecko"]);
});
test("EUR scanner rejects USD from CoinGecko and Bridge, takes Binance EUR",async()=>{
 const t=context({cg:usd,bridge:usd,binance:eurBinance});
 const result=await t.fetch();assert.equal(result.result.currency,"EUR");
 assert.equal(result.provider,"binance-browser");
 assert.deepEqual(t.actions,["coingecko","bridge","binance","store:binance"]);
});
test("EUR scanner refuses three USD sources rather than drawing wrong currency",async()=>{
 const t=context({cg:usd,bridge:usd,binance:usd});
 const result=await t.fetch();assert.equal(result.source,"blocked");
 assert.equal(result.result,null);
 assert.equal(t.actions.filter(x=>x.startsWith("store:")).length,0);
});
test("EUR scanner keeps direct EUR CoinGecko as the first source",async()=>{
 const t=context();const result=await t.fetch();
 assert.equal(result.result.currency,"EUR");
 assert.deepEqual(t.actions,["coingecko","store:coingecko"]);
});
