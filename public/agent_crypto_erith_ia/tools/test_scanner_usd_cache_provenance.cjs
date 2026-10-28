"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.resolve(__dirname, "../administrator/app.js"), "utf8");
function extract(start, end) {
  const a = source.indexOf(start);
  const b = source.indexOf(end, a + start.length);
  assert.ok(a >= 0 && b > a, "Missing canonical function: " + start);
  return source.slice(a, b);
}
const provenance = extract("function atlasHistoryQuoteProvenance(", "\nfunction atlasValidateChartSeries(");
const cached = extract("function atlasScannerNativeUsdStored(", "\nfunction atlasScannerNativeUsdStore(");
const stored = extract("function atlasScannerNativeUsdStore(", "\nfunction atlasScannerStoredHistory(");
const script = [provenance, cached, stored,
  "this.read = atlasScannerNativeUsdStored; this.write = atlasScannerNativeUsdStore;"].join("\n");
function setup() {
  const ctx = {
    Date, Number, Math, Array, Map, Set,
    state: { chartCache: {}, dataBroker: { comparison: { results: {} } } },
    atlasScannerNativeUsdKey: () => "bitcoin:USD:coingecko:1",
    atlasNormalizeChartPayload: payload => payload.prices,
    atlasValidateChartSeries: () => ({ ok: true, metrics: { pointCount: 2 } }),
    atlasReadLocalChartStore: () => ctx.local,
    atlasWriteLocalChartStore: value => { ctx.local = value; }
  };
  ctx.local = {};
  vm.createContext(ctx);
  vm.runInContext(script, ctx);
  return ctx;
}
const sample = (sourceLabel, fields = {}) => ({
  currency: "USD", quoteCurrency: "USD", sourceFamily: "coingecko",
  source: sourceLabel, sourceMode: "coingecko-direct", periodDays: 1,
  series: [[1, 80100], [2, 80200]], ...fields
});

test("verified CoinGecko USD historical series is reusable without altering numeric values", () => {
  const c = setup(), rec = sample("CoinGecko market_chart USD · direct");
  c.state.dataBroker.comparison.results.bitcoin = rec;
  const out = c.read({ id: "bitcoin" }, 1);
  assert.equal(out?.currency, "USD");
  assert.equal(out?.quoteCurrency, "USD");
  assert.equal(out?.series[1][1], 80200);
});
test("EUR origin falsely labelled USD is excluded from USD cache", () => {
  const c = setup();
  c.state.dataBroker.comparison.results.bitcoin =
    sample("CoinGecko market_chart EUR · direct");
  assert.equal(c.read({ id: "bitcoin" }, 1), null);
});
test("USD metadata alone cannot qualify an unknown-origin historical series", () => {
  const c = setup();
  c.state.dataBroker.comparison.results.bitcoin =
    sample("Cache navigateur sans origine");
  assert.equal(c.read({ id: "bitcoin" }, 1), null);
});
test("USD writer rejects conflicting EUR origin and source without proof", () => {
  const c = setup();
  for (const origin of ["CoinGecko market_chart EUR · direct", "cache inconnu"]) {
    assert.throws(() => c.write({ id: "bitcoin" }, 1, sample(origin)),
      /historique USD natif|source.*USD|devise.*USD/i);
  }
  assert.equal(Object.keys(c.state.chartCache).length, 0);
});
test("USD writer stores verified source only, without touching EUR slots", () => {
  const c = setup();
  const eur = sample("CoinGecko market_chart EUR · direct", { currency: "EUR", quoteCurrency: "EUR" });
  c.local["bitcoin:1:coingecko:EUR"] = eur;
  const rec = sample("CoinGecko market_chart USD · direct");
  c.write({ id: "bitcoin" }, 1, rec);
  assert.equal(c.local["bitcoin:1:coingecko:EUR"], eur);
  assert.equal(c.local["bitcoin:USD:coingecko:1"].series[0][1], 80100);
  assert.equal(c.read({ id: "bitcoin" }, 1)?.series[1][1], 80200);
});


test("a seven-day comparison cannot be reused as the one-day USD history", () => {
  const c = setup(), wrong = sample("CoinGecko market_chart USD · direct", { periodDays: 7 });
  c.state.dataBroker.comparison.results.bitcoin = wrong;
  assert.equal(c.read({ id: "bitcoin" }, 1), null);
  c.local["bitcoin:USD:coingecko:1"] =
    sample("CoinGecko market_chart USD · direct", { periodDays: 1 });
  assert.equal(c.read({ id: "bitcoin" }, 1)?.periodDays, 1);
});

test("active comparison without an acquisition period cannot displace the exact slot", () => {
  const c = setup();
  c.state.dataBroker.comparison.results.bitcoin =
    sample("CoinGecko market_chart USD · direct", { periodDays: undefined, series: [[1, 99], [2, 99]] });
  c.local["bitcoin:USD:coingecko:1"] =
    sample("CoinGecko market_chart USD · direct");
  assert.equal(c.read({ id: "bitcoin" }, 1)?.series[1][1], 80200);
});

test("different coin identity cannot lend its USD cached prices", () => {
  const c = setup();
  c.local["bitcoin:USD:coingecko:1"] =
    sample("CoinGecko market_chart USD · direct", { coinId: "ethereum" });
  assert.equal(c.read({ id: "bitcoin" }, 1), null);
});

test("USD cache writer refuses a source from a different acquisition period", () => {
  const c = setup();
  assert.throws(() => c.write({ id: "bitcoin" }, 1,
    sample("CoinGecko market_chart USD · direct", { periodDays: 7 })),
    /historique USD natif/i);
  assert.equal(Object.keys(c.local).length, 0);
});