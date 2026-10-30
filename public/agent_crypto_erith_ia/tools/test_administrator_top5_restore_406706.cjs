"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const app = fs.readFileSync(path.join(__dirname,"../administrator/app.js"),"utf8");
const capture = name => {
  const start=app.indexOf("function "+name+"(");
  assert.ok(start>=0,"missing "+name);
  const block=app.slice(start).match(/^function [\s\S]*?\n}\n/);
  assert.ok(block,"truncated "+name);
  return block[0];
};
const setup = [
  'const ATLAS_COMPARISON_MAX_SERIES=5;',
  'const ATLAS_CURATED_TOP3_IDS=["bitcoin","ethereum","binancecoin"];',
  'const ATLAS_CURATED_TOP5_IDS=["bitcoin","ethereum","binancecoin","ripple","solana"];',
  'const ATLAS_WORKSPACE_PRESETS=["solo","rank-3","rank-5","gainers","losers","volume","manual","empty"];',
  'const ATLAS_WORKSPACE_PERIODS=[1,7,30,60,90,365,36500];',
  'const ATLAS_ADMIN_GRAPH_MODES=["normal"];',
  'const ATLAS_SCANNER_PRESETS=new Set(["gainers","losers","volume"]);',
  'const ATLAS_RELEASE="Build 40.6.706";',
  'const atlasGraphContextV7DetailWindowsNormalize=()=>({});',
  ...["atlasCuratedTopIds","atlasCanonicalPresetSelection406706","atlasOperatorGraphProfileNormalize","atlasGraphContextV7NormalizeMarket","atlasComparisonIds"].map(capture)
].join("\n");
const state={coins:["bitcoin","ethereum","binancecoin","ripple","solana","tether"].map(id=>({id})),selectedCoinId:"tether",graphSelectionCleared:false,dataBroker:{comparison:{preset:"rank-5",ids:["bitcoin","ethereum","tether","binancecoin","ripple"]}}};
const x=Function("state",setup+";return {p:atlasOperatorGraphProfileNormalize,v:atlasGraphContextV7NormalizeMarket,i:atlasComparisonIds};")(state);
const expected=["bitcoin","ethereum","binancecoin","ripple","solana"];
assert.deepEqual(x.i(),expected);
for(const ids of [[],["tether"],["bitcoin","ethereum","tether","binancecoin","ripple"]]){
  assert.deepEqual(x.p({comparisonPreset:"rank-5",comparisonIds:ids,selectedCoinId:"tether"}).comparisonIds,expected);
  assert.deepEqual(x.v({comparisonPreset:"rank-5",comparisonIds:ids,selectedCoinId:"tether"}).comparisonIds,expected);
}
assert.deepEqual(x.p({comparisonPreset:"manual",comparisonIds:["tether","solana"]}).comparisonIds,["tether","solana"]);
assert.deepEqual(x.v({comparisonPreset:"gainers",comparisonIds:["tether","solana"]}).comparisonIds,["tether","solana"]);
state.coins=state.coins.filter(c=>c.id!=="solana");
assert.deepEqual(x.i(),expected.slice(0,4));
assert.match(app,/exactCanonicalIds406706/);
assert.match(app,/scannerMarked && !scannerNative/);
console.log("PASS: 40.6.706 canonical Top5 profiles, V7, active selection, manual/scanner isolation and missing SOL");
