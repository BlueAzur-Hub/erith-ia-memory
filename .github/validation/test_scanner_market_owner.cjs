"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const app=fs.readFileSync("public/agent_crypto_erith_ia/administrator/app.js","utf8");
function fragment(a,b){const i=app.indexOf(a),j=app.indexOf(b,i+1);assert(i>=0&&j>i,a);return app.slice(i,j)}
const ids=["bitcoin","ethereum","binancecoin","ripple","solana"];
const pool=ids.map((id,i)=>({id,symbol:id.toUpperCase(),rank:i+1,priceUsd:99+i,priceEur:null}));
let captured=null;
const ctx={Number,String,Array,Date,Set,AbortController,Promise,console,
  ATLAS_SCANNER_TARGET:5,ATLAS_SCANNER_DIRECT_LIMIT:18,
  ATLAS_SCANNER_PRESETS:new Set(["gainers"]),
  atlasScannerSequence:0,atlasScannerTransaction:null,atlasScannerQueuedRequest:null,
  state:{liveOk:true,coins:pool.slice(0,4),chartPeriodDays:1,dataBroker:{market:{mode:"direct"}}},
  atlasScannerLabel:()=> "Hausses 5",atlasScannerVisibleFailure:()=>false,
  atlasScannerCancel:()=>{},atlasScannerInvalidateChartWork:()=>{},
  atlasScannerStateSnapshot:()=>({}),atlasScannerPool:()=>pool,
  atlasCurrentMarketFrame:()=>({id:"market",mode:"direct",fingerprint:"f",validatedAssets:250,requestedAssets:250,timestamp:Date.now()}),
  atlasScannerMarketMetricLabel:()=> "Market 24h",atlasScannerSetTransactionFlag:()=>{},atlasScannerSetUiState:()=>{},
  atlasMarketFrameShortId:()=> "market",atlasScannerProgress:()=>{},atlasRenderComparisonControls:()=>{},
  atlasScannerRun:tx=>{captured=tx;return Promise.resolve(true)}
};ctx.globalThis=ctx;vm.createContext(ctx);
vm.runInContext(fragment("function atlasScannerStart(","\nfunction atlasHandleGainersClickV286("),ctx);
assert.equal(ctx.atlasScannerStart("gainers",5),true);
assert.deepEqual(Array.from(captured.candidateIds),ids);
assert.deepEqual(Array.from(captured.candidateCoins||[],c=>c.id),ids,"candidate dropped before scanner work");
assert.equal(captured.candidateCoins[4].priceUsd,103);
const scanned=[];
const runner={Number,String,Array,Date,Set,Promise,console,ATLAS_SCANNER_TARGET:5,ATLAS_SCANNER_NETWORK_CONCURRENCY:2,
 state:ctx.state,atlasScannerLabel:()=> "Hausses 5",atlasScannerSetUiState:()=>{},atlasScannerSetTransactionFlag:()=>{},
 atlasScannerProgress:()=>{},atlasRenderComparisonControls:()=>{},atlasScannerYieldToUi:async()=>true,
 atlasScannerCurrent:()=>scanned.length<5,atlasScannerStoredHistory:c=>{scanned.push(c.id);return null},
 atlasHistoryQuoteProvenance:()=>({}),atlasScannerSeriesCoversWindow:()=>({ok:true}),atlasChartNeedsRefresh:()=>false,
 atlasScannerAligned:()=>[],atlasScannerCommit:()=>true,atlasScannerFetchDirect:async()=>({result:null}),
 ATLAS_SCANNER_SPACING_MS:0,atlasWaitWithSignal:async()=>{},atlasScannerVisibleFailure:()=>false
};runner.globalThis=runner;vm.createContext(runner);
vm.runInContext("async "+fragment("function atlasScannerRun(","\nfunction atlasScannerStart("),runner);
(async()=>{await runner.atlasScannerRun(captured);assert.deepEqual(scanned,ids);console.log("PASS: five market-owned candidates are considered after stale state.coins")})().catch(e=>{console.error(e);process.exitCode=1});
