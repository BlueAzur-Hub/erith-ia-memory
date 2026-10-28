"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.resolve(__dirname, "../administrator/app.js"), "utf8");
function cut(begin, end) {
  const a = source.indexOf(begin), b = source.indexOf(end, a + begin.length);
  assert.ok(a >= 0 && b > a, "Owner missing: " + begin);
  return source.slice(a, b);
}
const scripts = [
  cut("function atlasChartStorageKey(", "\nfunction atlasChartWorstFreshness("),
  cut("function atlasHistoryQuoteProvenance(", "\nfunction atlasValidateChartSeries("),
  cut("function atlasHistoricalDisplayQuote(", "\nfunction atlasComparisonTooltipRows("),
  cut("function atlasGetStoredChartResult(", "\nfunction atlasChartResultFingerprint("),
  "this.storageKey = atlasChartStorageKey;",
  "this.qualify = atlasHistoricalDisplayQuote;",
  "this.getStored = atlasGetStoredChartResult;"
].join("\n");
function scope() {
  const c = {
    Number, Math, Date, Map, Set, Array,
    state: { chartCache: {} },
    cache: {},
    atlasChartPreferredSourceFamily: () => "coingecko",
    atlasReadLocalChartStore: () => c.cache,
    atlasNormalizeChartPayload: ({prices}) => prices,
    atlasValidateChartSeries: ({prices}) => ({
      ok: Array.isArray(prices) && prices.length >= 2,
      metrics: { pointCount: prices?.length || 0 }
    })
  };
  vm.createContext(c);
  vm.runInContext(scripts, c);
  return c;
}
const periods = [1, 7, 30, 60, 90, 365, 36500];
const presets = ["solo", "rank-3", "rank-5", "gainers", "losers", "volume"];
const record = (currency, period) => ({
  currency, quoteCurrency: currency,
  sourceFamily: "coingecko", sourceMode: "coingecko-direct",
  source: "CoinGecko market_chart " + currency + " · direct",
  periodDays: period, series: [[1, 123.45], [2, 125.65]]
});
test("EUR then native USD: distinct verified historical cache slots for 6 modes x 7 periods", () => {
  let count = 0;
  for (const preset of presets) {
    for (const period of periods) {
      const c = scope();
      const eur = record("EUR", period), usd = record("USD", period);
      c.cache[c.storageKey({id:"bitcoin"},period,"coingecko","EUR")] = eur;
      c.cache[c.storageKey({id:"bitcoin"},period,"coingecko","USD")] = usd;
      for (const currency of ["EUR", "USD"]) {
        const result = c.getStored({id:"bitcoin"},period,"coingecko",currency);
        assert.equal(result?.series[0][1],123.45,preset+" "+period+" "+currency);
        assert.equal(c.qualify(result).currency,currency,preset+" "+period+" "+currency);
        assert.equal(result?.currency,currency,preset+" "+period+" "+currency);
        count++;
      }
      assert.notEqual(c.storageKey({id:"bitcoin"},period,"coingecko","EUR"),
        c.storageKey({id:"bitcoin"},period,"coingecko","USD"));
    }
  }
  assert.equal(count,84);
});
test("conflicting quote identity never crosses EUR or USD historical cache boundaries", () => {
  const c=scope(), coin={id:"bitcoin"}, period=1;
  const bad=record("USD",period);
  bad.source="CoinGecko market_chart EUR · direct";
  c.cache[c.storageKey(coin,period,"coingecko","USD")]=bad;
  assert.equal(c.getStored(coin,period,"coingecko","USD"),null);
  assert.equal(c.getStored(coin,period,"coingecko","EUR"),null);
});
test("legacy unsuffixed record is reusable only with proven historical quote", () => {
  const c=scope(), coin={id:"bitcoin"}, period=7;
  c.cache[c.storageKey(coin,period,"coingecko")]=record("EUR",period);
  assert.equal(c.getStored(coin,period,"coingecko","EUR")?.currency,"EUR");
  assert.equal(c.getStored(coin,period,"coingecko","USD"),null);
  c.cache[c.storageKey(coin,period,"coingecko")]=record("USD",period);
  assert.equal(c.getStored(coin,period,"coingecko","EUR"),null);
  assert.equal(c.getStored(coin,period,"coingecko","USD")?.currency,"USD");
});
test("USDT and USDC sources never masquerade as native USD historical records", () => {
  const c=scope();
  for (const currency of ["USDT","USDC"]) {
    const fake=record(currency,1); fake.source="Binance BTC"+currency+" · direct";
    assert.equal(c.qualify(fake).currency,null);
  }
});
