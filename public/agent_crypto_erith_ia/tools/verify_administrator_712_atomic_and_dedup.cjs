"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "../administrator");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "build.json"), "utf8"));
assert.match(manifest.build, /^40\.6\.(?:71[2-9]|7[2-9]\d|[8-9]\d\d)$/);
assert.equal(manifest.engine, "38.15.11");
assert(html.includes(manifest.build));
assert(app.includes("atlasComparisonRequestKey712"));
assert(app.includes("atlasComparisonDurations712"));
assert(app.includes("latencyMs: Math.max(0, Date.now() - atlasComparisonStartedAt712)"));
assert(app.includes("finalEntries.length === ATLAS_SCANNER_TARGET"));
assert(app.includes("prevalidated.length !== ATLAS_SCANNER_TARGET"));
assert(app.includes("entry.coin?.id !== tx.candidateIds[index]"));
assert(app.includes("finalEntries.every((entry, index) => entry.coin?.id === tx.candidateIds[index])"));
assert(app.includes("atlasScannerSeriesCoversWindow"));
assert(app.includes("atlasScannerNativeUsdStored"));
assert(app.includes("atlasComparisonCertifiedCurrency"));
assert(app.includes('["rank-3", "rank-5", "gainers", "losers", "volume"]'));
const fnSrc = app.slice(app.indexOf("async function renderComparisonAnalystPanel("), app.indexOf("function atlasNormalizeSparkline("));
assert(fnSrc.length > 6000 && fnSrc.includes("atlasComparisonRequestKey712"));
let aborts = 0, started = 0;
const coins = ["bitcoin","ethereum","binancecoin","ripple","solana"].map(id=>({id,symbol:id}));
const state = {
  dataBroker:{comparison:{preset:"rank-5"}},
  chartPeriodDays:1,
  comparisonRenderToken:7,
  chartEngineV2:{loading:true,activeRequestKey:JSON.stringify(["rank-5",coins.map(c=>c.id),1,"USD"]),
    controller:{signal:{aborted:false},abort(){aborts++;}}}
};
const ctx = {state,AbortController,JSON,
  atlasScannerTransaction:null,atlasScannerQueuedRequest:null,
  atlasComparisonCoins:()=>coins,atlasCuratedTopIds:()=>coins.map(c=>c.id),
  atlasRequestedHistoricalCurrency:()=>"USD",
  atlasClearChartRetryTimer(){started++;},
  atlasClearComparisonCompletionTimer(){started++;}
};
vm.createContext(ctx);
vm.runInContext(fnSrc,ctx);
(async()=>{
  await ctx.renderComparisonAnalystPanel({renderAll:true});
  await ctx.renderComparisonAnalystPanel({renderAll:true});
  assert.equal(state.comparisonRenderToken,7,"same context must keep token");
  assert.equal(aborts,0,"same context must not abort controller");
  assert.equal(started,0,"same context must not clear acquisition timers");
  const scannerSrc = app.slice(app.indexOf("function atlasScannerCommit("),app.indexOf("function atlasScannerNativeUsdKey("));
  assert(scannerSrc.length > 5000);
  const ctx2={ATLAS_SCANNER_TARGET:5,atlasScannerCurrent:()=>true,
    atlasScannerAligned:(x)=>x.map(entry=>entry),
    atlasScannerInvalidateChartWork(){throw Error("partial commit must not enter transaction");}};
  vm.createContext(ctx2);vm.runInContext(scannerSrc,ctx2);
  const tx={candidateIds:coins.map(c=>c.id)};
  const entries=coins.map(coin=>({coin,result:{series:[[1,1],[2,2]]}}));
  assert.equal(ctx2.atlasScannerCommit(tx,entries.slice(0,3),[]),false,"3/5 cannot commit");
  assert.equal(ctx2.atlasScannerCommit(tx,[entries[1],entries[0],...entries.slice(2)],[]),false,"wrong market ordering cannot commit");
  console.log("PASS Administrator 40.6.712 static source invariants and deterministic reentrancy/partial-scanner gates");
})().catch(error=>{console.error(error);process.exitCode=1});
