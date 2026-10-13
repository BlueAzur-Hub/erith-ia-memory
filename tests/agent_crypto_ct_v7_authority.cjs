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
console.log("PASS CT V7 identity preempts stale BTC chart/detail; no listing viewport jump; single memory owner.");
