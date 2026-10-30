"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const source = fs.readFileSync(path.join(__dirname, "../administrator/app.js"), "utf8");
const start = source.indexOf("function atlasVerifiedReferenceHistoryCache(");
assert.ok(start > 0, "missing stable cache evidence helper");
const functionText = source.slice(start).match(/^function [\s\S]*?\n}\n/);
assert.ok(functionText, "incomplete helper function");
const now = Date.now();
const day = 24 * 60 * 60 * 1000;
const create = (currency, pointAge = 2 * 60 * 1000, window = day, ok = true) => ({
  currency, quoteCurrency: currency, savedAt: now - 10_000,
  integrity: {ok},
  series: [[now - pointAge - window, 100], [now - pointAge - window / 2, 106], [now - pointAge, 110]]
});
let binance = create("EUR");
let coingecko = create("EUR");
const get = (coin, period, family) => family === "binance" ? binance : coingecko;
const api = Function("get", "now", `
  const atlasGetStoredChartResult = get;
  const atlasHistoricalDisplayQuote = row => ({currency:row.currency});
  const atlasChartNeedsRefresh = (row) => {
    const first = row.series[0][0], last = row.series.at(-1)[0];
    return first > now - 24 * 3600000 + 12 * 60000
      || last < now - 12 * 60000
      || last > now + 12 * 60000
      || last - first < 23.5 * 3600000;
  };
  ${functionText[0]}
  return atlasVerifiedReferenceHistoryCache;
`)(get, now);
const coin = {id:"bitcoin"};
assert.equal(api(coin,1,"EUR"),binance,"verified full-day EUR history is reusable");
binance=create("USD");
assert.equal(api(coin,1,"EUR"),coingecko,"never cross from native USD into EUR");
coingecko=create("EUR",2*60*1000,12*3600000);
assert.equal(api(coin,1,"EUR"),null,"never accept incomplete 12h cache as fresh 24h");
coingecko=create("EUR",2*60*1000,day,false);
assert.equal(api(coin,1,"EUR"),null,"never accept failed integrity evidence");
coingecko=create("EUR",60*60*1000,day);
assert.equal(api(coin,1,"EUR"),null,"never accept stale final tick");
assert.equal(api(coin,1,"EUR","coingecko",{allowStale:true}),coingecko,"explicit stale fallback is disclosed");
console.log("PASS: cache EUR source identity, full 24h coverage, integrity, freshness, explicit stale fallback");
