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

/* Administrator reload: evaluate the actual source helper, not a duplicate implementation. */
const graphRestartBegin=app.indexOf("function atlasGraphContextV7RecoverRestartMarket(");
const graphRestartEnd=app.indexOf("function atlasGraphContextV7Bootstrap()",graphRestartBegin);
const lastGraphBegin=app.indexOf("function atlasWorkspaceSnapshotHasSelection(");
const lastGraphEnd=app.indexOf("function atlasWorkspaceRead()",lastGraphBegin);
assert.ok(graphRestartBegin>0&&graphRestartEnd>graphRestartBegin,"Administrator V7 recovery present");
assert.ok(lastGraphBegin>0&&lastGraphEnd>lastGraphBegin,"Last-valid graph recovery present");
const graphRestartCode=app.slice(lastGraphBegin,lastGraphEnd)+"\n"
  +app.slice(graphRestartBegin,graphRestartEnd)+"\nthis.recover=atlasGraphContextV7RecoverRestartMarket;";
function checkAdminRestart(trader,lastValid,persisted){
  const ctx={
    atlasTraderIsRuntime:()=>trader,
    atlasWorkspaceReadJson:()=>lastValid,
    ATLAS_WORKSPACE_LAST_VALID_GRAPH_KEY:"last-valid",
    ATLAS_CURATED_TOP5_IDS:["bitcoin","ethereum","binancecoin","ripple","solana"],
    atlasGraphContextV7Normalize:value=>value,
    atlasWorkspaceSelectionIntentRead:()=>null
  };
  vm.runInNewContext(graphRestartCode,ctx,{timeout:2000});
  return ctx.recover(persisted);
}
const cleared={schema:"agent_crypto_graph_session_context_v7",sequence:8,
  market:{period:1,selectedCoinId:null,comparisonIds:[],comparisonPreset:"empty",
    selectionCleared:true,selectionIntent:"explicit-empty",detailCollapsed:true},
  traderExternalSelection:{id:"concrete",instrument:"CT-USDT"},oracle:{view:"continuation"}};
const savedBtc={period:1,selectedCoinId:"bitcoin",comparisonIds:["bitcoin"],
  comparisonPreset:"solo",chartView:{view:"price",scale:"linear",volume:true}};
const restoredBtc=checkAdminRestart(false,savedBtc,cleared);
assert.equal(restoredBtc.market.selectedCoinId,"bitcoin");
assert.equal(restoredBtc.market.selectionCleared,false);
assert.equal(restoredBtc.market.comparisonPreset,"solo");
assert.equal(restoredBtc.sequence,9);
assert.equal(restoredBtc.lastAction,"system-recover-restart-after-clear");
assert.equal(restoredBtc.traderExternalSelection.instrument,"CT-USDT");
assert.equal(checkAdminRestart(true,savedBtc,cleared),null,"Trader CT must be unaffected");
assert.equal(checkAdminRestart(false,savedBtc,{...cleared,market:{
  ...cleared.market,selectedCoinId:"bitcoin",comparisonIds:["bitcoin"],
  comparisonPreset:"solo",selectionCleared:false,selectionIntent:"selected"}}),null,
"An already restored BTC selection must remain unchanged");
const restoredFallback=checkAdminRestart(false,null,cleared);
assert.equal(restoredFallback.market.comparisonPreset,"rank-5");
assert.equal(restoredFallback.market.comparisonIds.join(","),
  "bitcoin,ethereum,binancecoin,ripple,solana");
assert.equal(restoredFallback.market.detailCollapsed,true);
assert.match(app,/restartRecoveredEmpty = !!recovered;/,"Cold boot must invoke recovery");
assert.match(app,/migratedLegacyEmptySeed \|\| restartRecoveredEmpty/,"Recovered V7 record must be persisted");
assert.match(app,/atlasClearGraphSelection\(\); atlasGraphContextV7CommitMarket\("handler-clear"\)/,
"Vider still clears immediately");
console.log("PASS Administrator Vider reload recovers last valid BTC or Top5, V7 persistence, CT untouched.");

console.log("PASS CT V7 identity preempts stale BTC chart/detail; no listing viewport jump; single memory owner.");
