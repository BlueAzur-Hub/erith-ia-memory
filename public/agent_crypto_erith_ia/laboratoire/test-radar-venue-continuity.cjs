/* Read-only tests. Run: node test-radar-venue-continuity.cjs
 * Requires local source JSON copied from public repo paths. */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const moduleAPI=require("./radar-venue-continuity.js");
const read=(p)=>JSON.parse(fs.readFileSync(path.join(__dirname,p),"utf8"));
const matrix=read("../data/historical_archive_prototype/cross_venue_gap_matrix/index.json");
const incidents=read("../data/historical_archive_prototype/exchange_incident_register/index.json");
const e=moduleAPI.compileEvidence(matrix,incidents);
assert.equal(e.entries.length,6);
assert.equal(e.coinbase_total_verified_minutes,940);
assert.equal(e.orders_enabled,false);
assert.equal(moduleAPI.classifyHistoricalMinute("2023-03-24T13:59:00Z","BTC",e).binance_paper_allowed,false);
assert.equal(moduleAPI.classifyHistoricalMinute("2023-03-24T14:00:00Z","BTC",e).status,"NOT_A_CLASSIFIED_WINDOW");
assert.equal(moduleAPI.classifyHistoricalMinute("2021-09-29T07:15:00Z","ETH",e).alternative.quote,"USD");
const invalid=structuredClone(matrix);
invalid.rows.find(x=>x.asset==="ETH"&&x.window_start_utc==="2021-08-13T02:00:00Z").coinbase.candles_present--;
assert.throws(()=>moduleAPI.compileEvidence(invalid,incidents),/Coinbase non prouvée/);
console.log("PASS · 6 registres validés · 940 bougies Coinbase · fermeture Binance · contrôle négatif");
