"use strict";
/* Read-only contract test for persistent CT identity and passive viewport.
   No browser, remote network, market storage, Graph Core or actual orders. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const root=path.resolve(__dirname,"../public/agent_crypto_erith_ia");
const app=fs.readFileSync(path.join(root,"administrator/app.js"),"utf8");
const listings=fs.readFileSync(path.join(root,"administrator/js/new-listings-native-category.js"),"utf8");
const replay=fs.readFileSync(path.join(root,"trader/ct-selection-memory.js"),"utf8");

const helperBegin=app.indexOf("function atlasTraderIsRuntime() {");
const helperEnd=app.indexOf("function atlasTraderExternalSelectionCommit(",helperBegin);
assert.ok(helperBegin>0&&helperEnd>helperBegin,"V7 external selection helper present");
const helper=app.slice(helperBegin,helperEnd);
function check({surface,query,selection}){
  const sandbox={
    document:{documentElement:{dataset:{agentCryptoSurface:surface}}},
    location:{search:query},
    URLSearchParams,
    atlasGraphContextV7Read:()=>({traderExternalSelection:selection})
  };
  vm.runInNewContext(helper+"\nthis.isCt=atlasTraderCtSelectionOwnsView;",sandbox);
  return sandbox.isCt();
}
const CT={id:"concrete",provider:"okx",instrument:"CT-USDT",view:"line"};
assert.equal(check({surface:"trader",query:"",selection:CT}),true);
assert.equal(check({surface:"",query:"?surface=trader",selection:CT}),true,
  "Prioritize the saved external graph even before iframe mount");
assert.equal(check({surface:"trader",query:"?surface=trader",selection:null}),false);
assert.equal(check({surface:"",query:"",selection:CT}),false,
  "A normal Administrator view is not affected");
assert.equal(check({surface:"trader",query:"",selection:{id:"bitcoin"}}),false);

assert.match(app,/function atlasWorkspaceRestoreCachedGraph\(ids, period, preset\) \{\s*\/\/[^\n]*\n[^\n]*\n\s*if \(atlasTraderCtSelectionOwnsView\(\)\) return false;/);
assert.match(app,/function atlasRenderChartResult\([^]*?\{\s*if \(atlasTraderCtSelectionOwnsView\(\) && c\?\.id!=="concrete"\) return;/);
assert.match(app,/function drawLineChart\([^]*?\{\s*\/\/[^\n]*\n\s*if \(atlasTraderCtSelectionOwnsView\(\) && result\?\.coin\?\.id!=="concrete"\) return;/);
assert.match(app,/function drawComparisonChart\([^]*?\{\s*if \(atlasTraderCtSelectionOwnsView\(\)\) return \[\];/);
assert.match(app,/function atlasRenderCompactDetailSummary\([^]*?\{\s*if \(atlasTraderCtSelectionOwnsView\(\) && coin\?\.id!=="concrete"\) return;/);
assert.match(app,/function atlasRenderAssetDetail\([^]*?\{\s*\/\/[^\n]*\n[^\n]*\n\s*if \(atlasTraderCtSelectionOwnsView\(\) && c\?\.id!=="concrete"\) return;/);
assert.doesNotMatch(listings,/document\.getElementById\("analyste"\)\?\.scrollIntoView/);
assert.match(replay,/atlasTraderExternalSelectionRead\(\)/);
assert.doesNotMatch(replay,/localStorage\.setItem|indexedDB\.open|setInterval\(/,
  "CT replay must keep one V7 authority and no independent persistence");

/* Administrator startup must not persist Vider as a blank page.
   Test the deployed V7 source helper, not an independently reimplemented fix. */
const graphRestartBegin=app.indexOf("function atlasGraphContextV7RecoverRestartMarket(");
const graphRestartEnd=app.indexOf("function atlasGraphContextV7Bootstrap()",graphRestartBegin);
assert.ok(graphRestartBegin>0&&graphRestartEnd>graphRestartBegin,"Administrator V7 restart owner exists");
const graphRestartCode=app.slice(graphRestartBegin,graphRestartEnd)
  +"\nthis.recover=atlasGraphContextV7RecoverRestartMarket;";
function checkAdminRestart(trader,persisted){
  const ctx={atlasTraderIsRuntime:()=>trader,atlasGraphContextV7Normalize:value=>value};
  vm.runInNewContext(graphRestartCode,ctx,{timeout:2000});
  return ctx.recover(persisted);
}
const cleared={schema:"agent_crypto_graph_session_context_v7",sequence:8,
  activeSurface:"oracle",
  market:{period:7,selectedCoinId:null,comparisonIds:[],comparisonPreset:"empty",
    selectionCleared:true,selectionIntent:"explicit-empty",detailCollapsed:true,
    detailWindows:{},chartView:{view:"base100",scale:"logarithmic",volume:false}},
  traderExternalSelection:{id:"concrete",instrument:"CT-USDT"},oracle:{view:"continuation"}};
const reboot=checkAdminRestart(false,cleared);
assert.equal(reboot.market.selectedCoinId,"bitcoin");
assert.equal(reboot.market.comparisonIds.join(","),"bitcoin");
assert.equal(reboot.market.comparisonPreset,"solo");
assert.equal(reboot.market.period,1);
assert.equal(reboot.market.chartView.view,"price");
assert.equal(reboot.market.chartView.scale,"linear");
assert.equal(reboot.market.chartView.volume,true);
assert.equal(reboot.activeSurface,"market");
assert.equal(reboot.market.selectionCleared,false);
assert.equal(reboot.market.selectionIntent,"selected");
assert.equal(reboot.market.detailCollapsed,true,"The Technical Reading window preference survives");
assert.equal(reboot.sequence,9);
assert.equal(reboot.lastAction,"system-recover-empty-btc");
assert.equal(reboot.traderExternalSelection.instrument,"CT-USDT","Never erase the canonical CT record");
assert.equal(checkAdminRestart(true,cleared),null,"Trader CT must remain untouched");
assert.equal(checkAdminRestart(false,{...cleared,market:{...cleared.market,
  selectedCoinId:"bitcoin",comparisonIds:["bitcoin"],comparisonPreset:"solo",
  selectionCleared:false,selectionIntent:"selected"}}),null,"Previously saved BTC must be preserved");
assert.equal(checkAdminRestart(false,{...cleared,market:{...cleared.market,
  selectedCoinId:"bitcoin",comparisonIds:["bitcoin","ethereum","binancecoin","ripple","solana"],
  comparisonPreset:"rank-5",selectionCleared:false,selectionIntent:"selected"}}),null,
  "Explicit Top5 remains persistent across F5");
assert.equal(checkAdminRestart(false,{...cleared,market:{...cleared.market,
  selectionCleared:false,selectionIntent:"transient-empty"}}).market.selectedCoinId,"bitcoin",
  "Old transient empty snapshots also restart on BTC");
assert.equal(checkAdminRestart(false,{...cleared,market:null}).market.selectedCoinId,"bitcoin",
  "Legacy empty profile also restores BTC");
assert.match(app,/restartRecoveredEmpty = !!recovered;/,"V7 must invoke the recovery before hydration");
assert.match(app,/if \(restartRecoveredEmpty\)/,"The repaired V7 profile must be saved");
assert.match(app,/atlasGraphContextV7QueuePersist\(atlasGraphContextV7Read\(\),"system-recover-empty-btc"\)/,
  "Persist the repaired context in the canonical IndexedDB row");
assert.match(app,/atlasClearGraphSelection\(\); atlasGraphContextV7CommitMarket\("handler-clear"\)/,
  "Vider continues to empty the graph immediately");
assert.match(app,/if \(!atlasGraphContextV7Ready\) return false;/,
  "Do not restore market while V7 boot read is incomplete");
console.log("PASS Administrator: Vider is transient, empty V7 restarts BTC, Top5 stays saved, Trader CT isolated.");

console.log("PASS CT V7 identity preempts stale BTC chart/detail; no listing viewport jump; single memory owner.");
