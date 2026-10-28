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


// Execute the real scanner commit owner, not only its diagnostic helper.
const commitStart = source.indexOf("let atlasScannerLastPartialDiagnostic = null;");
const commitEnd = source.indexOf("// Reuse the same exact-ID native USD", commitStart);
assert.ok(commitStart >= 0 && commitEnd > commitStart, "Scanner commit owner not found");
const commitSource = source.slice(commitStart, commitEnd);

function mountCommitRuntime(config = {}) {
  const noop = () => {};
  const scope = {
    Date, Number, Math, Map, Set, Array,
    ATLAS_SCANNER_TARGET: 5,
    ATLAS_CANONICAL_MARKET_SOURCE: "market",
    atlasScannerCommitEpoch: 0,
    atlasScannerUiState: {status:"idle"},
    atlasScannerTransaction: null,
    atlasScannerQueuedRequest: null,
    displayCurrency: "EUR",
    captions: [],
    state: {
      coins: ids.map(id => ({id,symbol:id.toUpperCase()})),
      dataBroker: {comparison:{},chart:{}},
      selectedCoinId: null
    },
    els: {selectedAssetTitle:{textContent:""},mainChart:{}},
    window: {setTimeout:noop},
    console: {warn:noop}
  };
  Object.assign(scope, {
    atlasScannerCurrent: tx => tx?.cancelled !== true,
    atlasScannerAligned: entries => entries,
    atlasScannerSeriesCoversWindow: () => ({ok:true}),
    atlasChartDisplayCurrency: () => scope.displayCurrency,
    atlasExpectedChartContextKey: (coins,days) => coins.join(":") + ":" + days,
    atlasScannerStateSnapshot: () => ({detailCollapsed:false}),
    atlasScannerInvalidateChartWork: () => ++scope.atlasScannerCommitEpoch,
    atlasScannerHistorySummary: () => "direct",
    atlasChartContextMatches: () => true,
    drawComparisonChart: (_,entries) => {
      if (config.failDraw) throw new Error("simulated drawing error");
      return entries;
    },
    atlasScannerSetTransactionFlag:noop,
    atlasScannerSetUiState:(preset,status) => {
      scope.atlasScannerUiState = {preset,status};
    },
    atlasScannerLabel: () => "Hausses 5",
    setText:(el,value) => {el.textContent=value},
    atlasRenderComparisonDetail:noop,
    atlasChartV2RenderLegend:noop,
    atlasRenderComparisonControls:noop,
    atlasChartV2SyncControls:noop,
    atlasChartOverlayUpdate:noop,
    atlasRenderBrokerStrip:noop,
    atlasPatchMarketSelectionState:noop,
    renderMultiHorizon:noop,
    atlasRuntimeDemandWakeAtlas:noop,
    atlasSetCleanLensCollapsed:noop,
    atlasSetChartCaptionText: caption => scope.captions.push(caption),
    atlasExactTimestampLabel: () => "at test time",
    atlasWorkspaceWrite: () => true,
    atlasHideChartRefresh:noop,
    atlasScannerRestoreSnapshot:noop,
    atlasScannerVisibleFailure: () => false,
    fmtPct: amount => Number(amount).toFixed(2) + "%",
    fmtCompactEUR: {format:amount => String(amount)}
  });
  vm.createContext(scope);
  vm.runInContext(commitSource +
    "\nthis.commitScanner = atlasScannerCommit; this.getPartialRecord = () => atlasScannerLastPartialDiagnostic;",
    scope);
  return scope;
}
const runtimeEntry = id => ({
  coin: {id,symbol:id.toUpperCase()},
  atlasMarketMetric: 1,
  result: {
    series: [[1000, 41], [2000, 42]],
    integrity: {metrics:{lastTimestamp: 1720000000000}}
  }
});
const runtimeTx = (overrides = {}) => ({
  preset:"gainers",period:1,
  candidateIds:ids,candidateCoins:ids.map(id => ({id,symbol:id.toUpperCase()})),
  marketFrameFingerprint:"market-frame-1",marketFrameId:"market-frame-1",
  marketTimestamp:"2026-10-28T04:00:00Z",marketMode:"direct",
  marketBasisLabel:"Market 24 h",marketRequestedAssets:250,
  marketValidatedAssets:250,windowEnd:1720000000000,...overrides
});
test("real commit: 4/5 records exact rejection and visible caption", () => {
  const c = mountCommitRuntime();
  const four = ids.slice(1).map(runtimeEntry);
  assert.equal(c.commitScanner(runtimeTx(),four,[{id:"btw",symbol:"BTW",reason:"HTTP 429"}],four),true);
  const result = c.state.dataBroker.chart.result;
  assert.equal(c.state.dataBroker.comparison.status,"partial");
  assert.equal(result.scanner.availableCount,4);
  assert.deepEqual(Array.from(result.scanner.displayedIds),ids.slice(1));
  assert.equal(result.scanner.missingReasons[0].id,"btw");
  assert.equal(result.scanner.missingReasons[0].kind,"fetch-or-validation");
  assert.match(c.captions.at(-1),/Diagnostic 4\/5.*BTW.*429/);
  assert.equal(result.entries[0].result.series[0][1],41);
});
test("real commit: next 5/5 displays previous reason once, then clears it", () => {
  const c = mountCommitRuntime();
  const four = ids.slice(1).map(runtimeEntry);
  const all = ids.map(runtimeEntry);
  assert.equal(c.commitScanner(runtimeTx(),four,[{id:"btw",reason:"HTTP 429"}],four),true);
  assert.equal(c.commitScanner(runtimeTx(),all,[],all),true);
  assert.equal(c.state.dataBroker.comparison.status,"ready");
  assert.equal(c.state.dataBroker.chart.result.scanner.previousPartial.missingReasons[0].id,"btw");
  assert.match(c.captions.at(-1),/Chargement précédent.*429.*maintenant 5\/5/);
  assert.equal(c.getPartialRecord(),null);
  assert.equal(c.commitScanner(runtimeTx(),all,[],all),true);
  assert.equal(c.state.dataBroker.chart.result.scanner.previousPartial,null);
  assert.doesNotMatch(c.captions.at(-1),/Chargement précédent/);
});
test("real commit: EUR partial cannot become a USD or new-frame diagnostic", () => {
  const c = mountCommitRuntime();
  const four = ids.slice(1).map(runtimeEntry), all = ids.map(runtimeEntry);
  c.commitScanner(runtimeTx(),four,[{id:"btw",reason:"HTTP 429"}],four);
  c.displayCurrency = "USD";
  c.commitScanner(runtimeTx(),all,[],all);
  assert.equal(c.state.dataBroker.chart.result.scanner.previousPartial,null);
  c.displayCurrency = "EUR";
  c.commitScanner(runtimeTx({marketFrameFingerprint:"market-frame-2"}),all,[],all);
  assert.equal(c.state.dataBroker.chart.result.scanner.previousPartial,null);
});
test("real commit: aligned-out coin with available source is a time-compatibility rejection", () => {
  const c = mountCommitRuntime();
  const all = ids.map(runtimeEntry);
  assert.equal(c.commitScanner(runtimeTx(),all.slice(1),[],all),true);
  const row = c.state.dataBroker.chart.result.scanner.missingReasons[0];
  assert.equal(row.id,"btw");
  assert.equal(row.kind,"joint-alignment");
});
test("real commit: failed draw and cancelled transaction cannot publish partial evidence", () => {
  const four = ids.slice(1).map(runtimeEntry);
  const c = mountCommitRuntime({failDraw:true});
  assert.equal(c.commitScanner(runtimeTx(),four,[{id:"btw",reason:"HTTP 429"}],four),false);
  assert.equal(c.getPartialRecord(),null);
  const d = mountCommitRuntime();
  assert.equal(d.commitScanner(runtimeTx({cancelled:true}),four,[],four),false);
  assert.equal(d.getPartialRecord(),null);
});
