/* 40.6.706 — execute the real selection/restoration functions. */
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const app = fs.readFileSync(path.join(__dirname,"../administrator/app.js"),"utf8");
const build = JSON.parse(fs.readFileSync(path.join(__dirname,"../administrator/build.json"),"utf8"));
assert.equal(build.build,"40.6.706");
function extract(name) {
  const start = app.indexOf(`function ${name}(`);
  assert.notEqual(start,-1,`missing ${name}`);
  const next=app.slice(start).match(/^function [\s\S]*?\n}\n/);
  assert.ok(next,`invalid function ${name}`);
  return next[0];
}
const fixture = ["bitcoin","ethereum","binancecoin","ripple","solana","tether"].map((id,i)=>({id,symbol:["BTC","ETH","BNB","XRP","SOL","USDT"][i]}));
const state = {coins:fixture,selectedCoinId:"tether",graphSelectionCleared:false,dataBroker:{comparison:{ids:["bitcoin","ethereum","tether","binancecoin","ripple"],preset:"rank-5",pendingIds:[],unavailableIds:[],renderedIds:[],results:{},status:"idle"}}};
const calls = [];
const mocks = {
 state, ATLAS_COMPARISON_MAX_SERIES:5,
 ATLAS_CURATED_TOP3_IDS:["bitcoin","ethereum","binancecoin"],
 ATLAS_CURATED_TOP5_IDS:["bitcoin","ethereum","binancecoin","ripple","solana"],
 atlasScannerTransaction:null,
 atlasClearComparisonCompletionTimer(){},atlasWorkspaceSelectionIntentWrite(){},
 atlasRenderComparisonControls(){},atlasWorkspaceScheduleSave(){},
 atlasBroadcastSelectedMarketChange(){},atlasRefreshSpotBook(){return Promise.resolve()},
 queueMicrotask(){},globalThis:{__atlasExternalChartContext:{active:false}},
};
vm.createContext(mocks);
vm.runInContext(["atlasCuratedTopIds","atlasCanonicalPresetIds","atlasComparisonIds","atlasSetComparisonIds"].map(extract).join("\n"),mocks);
const target=["bitcoin","ethereum","binancecoin","ripple","solana"];
function matches(actual,expected,msg){assert.deepEqual(Array.from(actual),expected,msg)}
// A stale USDT + missing SOL must not survive even a raw comparison read.
matches(mocks.atlasComparisonIds(),target,"stale Top 5 bypassed canonical IDs");
mocks.atlasSetComparisonIds(["bitcoin","ethereum","tether","binancecoin","ripple"],"tether",{preset:"rank-5"});
matches(state.dataBroker.comparison.ids,target,"set top 5 must restore SOL, not USDT");
assert.equal(state.selectedCoinId,"bitcoin");
assert.equal(state.dataBroker.comparison.preset,"rank-5");
// Top 3 remains fixed, scanners/manual must not be converted into Top 5.
mocks.atlasSetComparisonIds(["tether","bitcoin","ethereum"],"tether",{preset:"manual"});
matches(state.dataBroker.comparison.ids,["tether","bitcoin","ethereum"]);
mocks.atlasSetComparisonIds(["tether","ripple"],"tether",{preset:"gainers"});
matches(state.dataBroker.comparison.ids,["tether","ripple"]);
mocks.atlasSetComparisonIds(["tether","bitcoin","ethereum"],"tether",{preset:"rank-3"});
matches(state.dataBroker.comparison.ids,target.slice(0,3));
// Workspace restoration must normalize persisted IDs before selectedCoinId.
assert.match(app,/const canonicalRestoredIds = atlasCanonicalPresetIds\(restoredPreset\)/);
assert.match(app,/const rawIds = canonicalRestoredIds \|\|/);
assert.match(app,/const savedPrimary = canonicalRestoredIds \? ids\[0\]/);
// Presentation must retain its last visible preset while the new chart loads.
assert.match(app,/root\.dataset\.displayedPreset \|\| "rank-5"/);
assert.match(app,/if \(chartReady\) root\.dataset\.displayedPreset = displayedPreset/);
assert.match(app,/"TARGET TOP 5 LIVE"/);
console.log("PASS 40.6.706: canonical Top 5, stale USDT rejected, manual/scanners preserved, workspace restoration and visible cycle label");
