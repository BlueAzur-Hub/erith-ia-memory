"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.resolve(__dirname, "../administrator/app.js"), "utf8");
const begin = source.indexOf("function atlasScannerDiagnosticSignature(");
const end = source.indexOf("function atlasScannerCommit(", begin);
assert.ok(begin >= 0 && end > begin, "Scanner diagnostic functions missing");
const helperSource = source.slice(begin, end);
const ids = ["btw", "pepe", "m", "zec", "near"];
const tx = (extra = {}) => ({
  preset:"gainers", period:1, marketFrameFingerprint:"frame1",
  candidateIds:ids, candidateCoins:ids.map(id=>({id,symbol:id.toUpperCase()})),
  windowEnd:Date.now(), ...extra
});
const entry = id => ({coin:{id},result:{series:[[1,100],[2,101]]}});
function setup(cover = () => ({ok:true}), align = rows => rows) {
  const scope = {atlasScannerSeriesCoversWindow:cover,atlasScannerAligned:align};
  vm.createContext(scope);
  vm.runInContext(helperSource +
    "\nthis.explainMissing = atlasScannerExplainMissing; this.diagnosticSignature = atlasScannerDiagnosticSignature; this.diagnosticCaption = atlasScannerDiagnosticCaption;",
    scope);
  return scope;
}
test("4/5 provider error is retained for the exact candidate", () => {
  const rows = setup().explainMissing(tx(),ids.slice(1),[{id:"btw",reason:"HTTP 429"}],[]);
  assert.equal(rows.length,1);
  assert.equal(rows[0].id,"btw");
  assert.equal(rows[0].kind,"fetch-or-validation");
  assert.match(rows[0].reason,/429/);
});
test("4/5 insufficient coverage is distinguishable from rejection", () => {
  const rows = setup(()=>({ok:false,reason:"24h coverage failure"}))
    .explainMissing(tx(),ids.slice(0,4),[],[entry("near")]);
  assert.equal(rows[0].kind,"coverage");
  assert.match(rows[0].reason,/coverage/);
});
test("4/5 individual insufficient alignment", () => {
  const rows = setup(()=>({ok:true}),()=>[])
    .explainMissing(tx(),ids.slice(0,4),[],[entry("near")]);
  assert.equal(rows[0].kind,"individual-alignment");
});
test("4/5 joint time alignment without asset substitution", () => {
  const rows = setup().explainMissing(tx(),ids.slice(0,4),[],[entry("near")]);
  assert.equal(rows[0].kind,"joint-alignment");
  assert.equal(rows[0].id,"near");
});
test("4/5 unknown cause is never invented", () => {
  const rows = setup().explainMissing(tx(),ids.slice(0,4),[],[]);
  assert.equal(rows[0].kind,"undetermined");
});
test("5/5 has no missing candidates", () => {
  assert.equal(setup().explainMissing(tx(),ids,[],[]).length,0);
});
test("EUR, USD, periods and five candidates have distinct signatures", () => {
  const sig=setup().diagnosticSignature;
  assert.notEqual(sig(tx(),"EUR"),sig(tx(),"USD"));
  assert.notEqual(sig(tx(),"EUR"),sig(tx({period:7}),"EUR"));
  assert.notEqual(sig(tx(),"EUR"),sig(tx({candidateIds:["other",...ids.slice(1)]}),"EUR"));
});
test("stale market frame cannot inherit an earlier 4/5 reason", () => {
  const sig=setup().diagnosticSignature;
  assert.notEqual(sig(tx(),"EUR"),sig(tx({marketFrameFingerprint:"frame2"}),"EUR"));
});
test("interrupt guard, canonical IDs and untouched alignment owner remain", () => {
  assert.match(source,/if \(!atlasScannerCurrent\(tx\)\) return false;/);
  assert.match(source,/const unavailableIds = tx\.candidateIds\.filter\(id => !ids\.includes\(id\)\);/);
  assert.match(source,/function atlasScannerAligned\(entries, period, candidateIds, windowEnd = null\)/);
});
test("later 5/5 may show prior partial once and keep its record", () => {
  assert.match(source,/previousPartial: previousPartial \? \{/);
  assert.match(source,/atlasScannerLastPartialDiagnostic = null;/);
  assert.match(source,/atlasScannerCommit\(tx, finalEntries, rejected, accepted\)/);
});
