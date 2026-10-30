/* Administrator current static+semantic regression tests. Run with Node.js. */
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../administrator");
const app = fs.readFileSync(path.join(root,"app.js"),"utf8");
// Older USD asset is an existing repository dependency, not delivered or renamed
// in this scoped candidate.  Its runtime contract is unchanged.
const usdPath = path.join(root, "js/graph-native-usd-406520.js");
const usd = fs.existsSync(usdPath) ? fs.readFileSync(usdPath,"utf8") : null;
const capture = (source,name) => {
  const at=source.indexOf("function "+name+"(");
  assert.notEqual(at,-1,"missing function "+name);
  const tail=source.slice(at);
  const match=tail.match(/^function [\s\S]*?\n}\n/);
  assert.ok(match,"missing closing function "+name);
  return match[0];
};
const run=(src,name)=>Function(src+"\nreturn "+name)();
const top = run(capture(app,"atlasCuratedTopIds").replace(
 "function atlasCuratedTopIds", 'const ATLAS_CURATED_TOP3_IDS=["bitcoin","ethereum","binancecoin"]; const ATLAS_CURATED_TOP5_IDS=["bitcoin","ethereum","binancecoin","ripple","solana"];\nfunction atlasCuratedTopIds'
),"atlasCuratedTopIds");
assert.deepEqual(top(5),["bitcoin","ethereum","binancecoin","ripple","solana"]);
assert.deepEqual(top(3),["bitcoin","ethereum","binancecoin"]);
assert.match(app,/top5: curated\(ATLAS_CURATED_TOP5_IDS\)/);
assert.match(app,/top3: curated\(ATLAS_CURATED_TOP3_IDS\)/);
const sanitize=run(capture(app,"atlasSanitizeChartRows"),"atlasSanitizeChartRows");
assert.deepEqual(sanitize([[1,100],[2,101],[3,1000],[4,102]]),[[1,100],[2,101],[3,1000],[4,102]]);
const sample=run(capture(app,"atlasDownsampleNativeComparisonRows"),"atlasDownsampleNativeComparisonRows");
const values=sample(Array.from({length:841},(_,i)=>({t:i,price:i===420?150:100})),280);
assert.ok(values.length<=280 && values.some(p=>p.price===150),"peak must survive");
assert.match(app,/historique 24 h discontinu : trou temporel détecté/);
assert.match(app,/pic de prix non qualifié/);
assert.match(app,/point\?\.raw\?\.atlasLiveEndpoint === true/);
assert.match(app,/showTargetIdentity = displayedPreset === "solo"/);
assert.match(app,/length: annualUsdBasket \? 1 : Math\.min\(3, coins\.length\)/);
assert.match(app,/comparison.lastDirectRequestAt = nextSlot/);
assert.match(app,/fetched\[index\] = fetchedItem/);
if (usd !== null) assert.match(usd,/wrap\("atlasChartStorageKey",o=>function\(c,d,f\)\{return usd\(\)&&!canonicalTop5History\(d\)/);
if (usd !== null) assert.match(usd,/[,;]change24h=c\.change24hUsd/);
if (usd !== null) assert.doesNotMatch(usd,/const price=c\.priceUsd[^\n]*change24h=c\.change24h\b/);
const build=JSON.parse(fs.readFileSync(path.join(root,"build.json"),"utf8"));
assert.equal(build.build,"40.6.710");
assert.equal(build.published,false);
assert.match(app,/function atlasVerifiedReferenceHistoryCache\(/);
assert.match(app,/const cachedEur = atlasVerifiedReferenceHistoryCache\(coin, period, "EUR"\)/);
assert.match(app,/Math\.min\(12_000, ATLAS_COMPARISON_DIRECT_TIMEOUT_MS\)/);
assert.match(app,/Math\.min\(14_000, ATLAS_COMPARISON_DIRECT_TIMEOUT_MS\)/);
assert.doesNotMatch(app,/atlasCanonicalPresetSelection406706/);
assert.match(app,/totalTimeoutMs: 12_000/);
assert.match(app,/const deadline = budget > 0 \? Date\.now\(\) \+ budget : Infinity/);
assert.match(app,/atlasGetStoredChartResult\(coin, period, family, target\)/);
console.log("PASS: canonical Top3/Top5, ribbon, USD contract, caches, gaps, spikes, extrema, tooltip, preview metadata");
