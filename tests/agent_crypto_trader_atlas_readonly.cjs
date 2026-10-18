"use strict";
/* Reader-only Atlas production gate: no Browser network, no real order. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "../public/agent_crypto_erith_ia");
const app = fs.readFileSync(path.join(root, "administrator/app.js"), "utf8");
const trader = fs.readFileSync(path.join(root, "trader/trading-desk.html"), "utf8");
new vm.Script(app, {filename:"administrator/app.js"});
assert.match(trader, /administrator\/index\.html\?surface=trader/, "Trader uses native shared runtime");
const guard = app.match(/function atlasTraderPassiveReportSurface\(\) \{[\s\S]*?\n\}/);
assert.ok(guard, "Producer surface predicate must exist");
const isReader = search => {
  const ctx={location:{search},URLSearchParams};
  vm.runInNewContext(guard[0]+"\nthis.reader=atlasTraderPassiveReportSurface();",ctx);
  return ctx.reader;
};
assert.equal(isReader("?surface=trader"),true, "Trader must never produce");
assert.equal(isReader("?surface=administrator"),false, "Administrator must still produce");
assert.equal(isReader(""),false, "Direct Administrator remains producer-capable");
assert.equal(isReader("?surface=trader&source=BTC"),true, "Reader mode cannot be bypassed by asset");
for(const [name,expected] of Object.entries({
  atlasLocalReportsRunAll:1, atlasLocalConclusionRun:1,
  atlasLocalReportsOpenAutomaticCycle:1, atlasLocalReportsScheduleAutomatic:5,
  atlasCurrentPendingAutoKick:2, atlasCurrentPendingMarket137:1,
  atlasLocalDialogueRunSummary:1, atlasLocalDialogueAsk:1,
  atlasQuestionAsk37:1, atlasQuestionChain37:1,
  atlasAutonomousOperatorTick35:1
})){
  const pattern=new RegExp("(?:async\\s+)?function\\s+"+name+"(?:\\d+)?\\s*\\([^\\n]*?\\)\\s*\\{\\s*if\\s*\\(atlasTraderPassiveReportSurface\\(\\)\\)\\s*return false;","g");
  const matches=app.match(pattern)||[];
  assert.equal(matches.length,expected,name+" must refuse Trader production immediately");
}
assert.match(app, /function atlasDeviceComputeAllowed\(\) \{\s*return atlasDeviceComputeRoleRead\(\) === ATLAS_DEVICE_COMPUTE_ROLES\.PRODUCTION;/,
 "Do not change global device compute roles: history/market/Bridge consumers need them");
assert.match(app, /async function atlasFetchBridgeHistory\(/,"Historical Bridge read remains defined");
assert.match(app, /async function atlasScannerCollectorFetchLatest\(/,"Scanner collector contract unchanged");
console.log("PASS Trader reader Atlas/Aerith no-production gates; Ryzen Administrator remains enabled");
