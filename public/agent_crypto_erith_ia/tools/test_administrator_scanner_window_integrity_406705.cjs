/* Regression: an unverified 24h scanner basket must never use manual Base 100 overlap. */
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const app = fs.readFileSync(path.join(__dirname, "../administrator/app.js"), "utf8");
function sourceOf(name) {
  const start = app.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `Missing ${name}`);
  const match = app.slice(start).match(/^function [\s\S]*?\n}\n/);
  assert.ok(match, `Missing function end ${name}`);
  return match[0];
}
const build = Function(`
  const atlasChartRules = () => ({minPoints: 3});
  const atlasComparisonMaximumPoints = () => 420;
  const atlasComparisonRows = entry => entry.result.series.map(([t, price]) => ({t, price}));
  const atlasDownsampleNativeComparisonRows = rows => rows;
  const atlasBuildNativeComparisonTimeline = entries => [...new Set(
    entries.flatMap(entry => entry.rows.map(row => row.t))
  )].sort((a,b)=>a-b);
  ${sourceOf("atlasBuildAlignedComparisonEntries")}
  return atlasBuildAlignedComparisonEntries;
`)();
const hour = 3600_000;
const end = Date.parse("2026-10-30T00:00:00Z");
const begin = end - 24*hour;
function entry(id, {verified = true, windowEnd = end, scanner = true}={}) {
  const e = { coin: {id}, result: { series: [
    [begin, 100], [begin + 12*hour, 110], [end, 120]
  ] }};
  if (scanner) {
    e.atlasScannerVerified24h = verified;
    e.atlasScannerWindowEnd = windowEnd;
  }
  return e;
}
const approved = [entry("btc"), entry("eth")];
const aligned = build(approved,1);
assert.equal(aligned.length, 2, "Verified scanner basket must keep both histories");
assert.equal(aligned[0].baselineTargetAt, begin, "Baseline must use the target window");
assert.equal(aligned[1].data[0].y, 100, "Real first price must be 100");
assert.deepEqual(build([entry("btc"), entry("eth", {verified:false})], 1), [],
  "Unverified scanner cannot fall back to manual overlap");
assert.deepEqual(build([entry("btc"), entry("eth", {windowEnd:end+2_000})], 1), [],
  "Different scanner windows cannot be compared as manual histories");
assert.deepEqual(build([entry("btc"), entry("eth", {scanner:false})], 1), [],
  "Mixed scanner/manual provenance cannot silently inherit the manual path");
assert.equal(build([entry("btc",{scanner:false}), entry("eth",{scanner:false})],1).length,2,
  "True manual comparisons must keep their common-overlap behavior");
console.log("PASS: verified 24h scanner clock, invalid/mixed windows rejected, manual mode preserved");
