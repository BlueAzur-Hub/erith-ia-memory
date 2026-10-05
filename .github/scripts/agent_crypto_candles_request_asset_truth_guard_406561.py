#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path("public/agent_crypto_erith_ia/administrator")
index = (ROOT / "index.html").read_text(encoding="utf-8")
js = (ROOT / "js/market-microscope-candles-406498.js").read_text(encoding="utf-8")
build = json.loads((ROOT / "build.json").read_text(encoding="utf-8"))

def need(ok, msg):
    if not ok:
        raise SystemExit("REQUEST_ASSET_TRUTH_406561_FAIL: " + msg)

need(build.get("build") == "40.6.561", "build")
need(build.get("parent_build") == "40.6.560", "parent")
need(build.get("market_core") == "38.15.11", "Market Core")
need("market-microscope-candles-406498.js?v=40.6.561" in index, "microscope cache token")
need('const BUILD="40.6.561"' in js, "module build")

# Canonical selection truth: no finite crypto-symbol whitelist fallback.
need('typeof globalThis.getSelectedCoin==="function"' in js, "canonical getSelectedCoin owner")
need('texts.match(/\\b(BTC|ETH|BNB|' not in js, "legacy finite symbol whitelist removed")

# Latest request wins.
need('let requestToken=0,activeController=null' in js, "request owner")
need('const REQUEST_TIMEOUT_MS=12000' in js, "bounded timeout")
need('activeController?.abort()' in js, "abort previous request")
need('const token=++requestToken' in js, "monotonic request token")
need('if(controller.signal.aborted||token!==requestToken)return false' in js, "stale response blocked")
need('requestedBar:"15m"' in js and 'loadedBar:null' in js, "requested/loaded bar split")
need('requestedInstrument:"BTC-EUR"' in js and 'loadedInstrument:null' in js, "requested/loaded instrument split")
need('fetchCandles?.({bar,limit:300,signal})' in js, "New Listing abort signal forwarded")
need('fetch(url,{cache:"no-store",signal})' in js, "OKX abort signal forwarded")

# Canonical Market selection synchronization.
need('function installCanonicalSelectionHook()' in js, "selection hook")
need('const names=["atlasSelectMarketCoin","atlasSetComparisonIds"]' in js, "selection owners")
need('reason:`canonical:${name}`' in js, "canonical reload reason")

# Existing indicator and S/R owners preserved.
need('function supportResistance' in js and 'PIVOTS_VISIBLES_W2' in js, "S/R preserved")
need('function supertrend(rows,period=10,multiplier=3)' in js, "Supertrend preserved")
need('function bollinger(rows,period=20,multiplier=2)' in js, "Bollinger preserved")
need('function parabolicSar(rows,step=.02,maxAf=.2)' in js, "SAR preserved")
need('function vwap(rows)' in js, "VWAP preserved")
need('function volumeProfile(rows,bins=24)' in js, "VP preserved")
need('real_order:false' in js, "no order")
need('recurring_timer:false' in js, "no recurring timer")

scope = build.get("candles_request_asset_truth_406561") or {}
need(scope.get("scope") == "CANDLES_REQUEST_ASSET_TRUTH_LOCK_ONLY", "scope")
need(scope.get("canonical_market_selection_owner") == "global getSelectedCoin().symbol", "canonical owner metadata")
need(scope.get("latest_request_wins") is True, "latest request wins metadata")
need(scope.get("abort_previous_request") is True, "abort metadata")
need(scope.get("request_timeout_ms") == 12000, "timeout metadata")
need(scope.get("requested_context_separate_from_loaded_context") is True, "context split metadata")
need(scope.get("indicator_math_changed") is False, "indicator math unchanged")
need(scope.get("support_resistance_algorithm_changed") is False, "S/R unchanged")
need(scope.get("technical_reading_changed") is False, "Technical Reading unchanged")
need(scope.get("depth_changed") is False, "Depth unchanged")
need(scope.get("data_source_changed") is False, "data source unchanged")
need(scope.get("new_timer") is False, "no recurring timer metadata")
need(scope.get("new_observer") is False, "no observer")
need(scope.get("storage_write") is False, "no storage")
need(scope.get("market_core_modified") is False, "Market Core unchanged")
need(scope.get("real_order") is False, "no real order")

print(json.dumps({
    "ok": True,
    "build": "40.6.561",
    "scope": "CANDLES_REQUEST_ASSET_TRUTH_LOCK_ONLY",
    "terrain": "PENDING_FIREFOX",
    "market_core": "38.15.11"
}))
