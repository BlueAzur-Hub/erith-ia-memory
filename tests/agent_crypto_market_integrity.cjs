/* Agent-Crypto market integrity regression checks.
   Pure read-only module tests; no browser storage, orders, network or timers. */
"use strict";
const assert = require("node:assert/strict");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "../public/agent_crypto_erith_ia/administrator/js");

globalThis.AgentCryptoMarketInstrumentResolver = Object.freeze({
  self_test: () => ({pass:true})
});
require(path.join(ROOT,"okx-market-pair-resolver.js"));
require(path.join(ROOT,"okx-microstructure-406499.js"));
require(path.join(ROOT,"graph-native-usd-406520.js"));

const resolver=globalThis.AgentCryptoOkxMarketPairResolver?.self_test?.();
assert.equal(resolver?.pass,true,"OKX pair resolver self-test");
const depth=globalThis.AgentCryptoOkxMicrostructure?.self_test?.();
assert.equal(depth?.pass,true,JSON.stringify(depth?.checks,null,2));
assert.equal(depth.checks.ct_graph_priority_test,true,"Visible external CT outranks BTC fallback");
assert.equal(depth.checks.wrong_btc_book_hidden_test,true,"Never display BTC as CT orderbook");
assert.equal(depth.checks.small_price_levels_preserved,true,"Price precision for CT");
assert.equal(depth.checks.requested_asset_must_match_payload,true);
const graph=globalThis.AgentCryptoGraphNativeUsd406520?.self_test?.();
assert.equal(graph?.pass,true,JSON.stringify(graph?.checks,null,2));
assert.equal(graph.checks.top5_native_usd_quote,true,"Top 5 USD native snapshot only");
assert.equal(graph.checks.top5_stale_usd_refused,true,"Top 5 stale USD rejected");
assert.equal(graph.checks.no_eur_to_usd_browser_conversion,true);
assert.equal(graph.checks.top5_24h_canonical_history_owner,true);
console.log("PASS: CT book identity, stale BTC block, low-price decimals, Top 5 native USD and stale-source refusal");
