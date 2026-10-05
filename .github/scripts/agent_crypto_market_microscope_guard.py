#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path("public/agent_crypto_erith_ia/administrator")
INDEX = (ROOT / "index.html").read_text(encoding="utf-8")
JS_PATH = ROOT / "js/market-microscope-candles.js"
JS = JS_PATH.read_text(encoding="utf-8")
BUILD = json.loads((ROOT / "build.json").read_text(encoding="utf-8"))

def need(ok, msg):
    if not ok:
        raise SystemExit("MARKET_MICROSCOPE_GUARD_FAIL: " + msg)

need(BUILD.get("build") == "40.6.563", "current build")
need(BUILD.get("parent_build") == "40.6.562", "parent build")
need(BUILD.get("market_core") == "38.15.11", "Market Core")
need("market-microscope-candles.js?v=40.6.563" in INDEX, "canonical runtime cache token")
need("market-microscope-candles-406498.js" not in INDEX, "legacy runtime referenced by current index")
need(not (ROOT / "js/market-microscope-candles-406498.js").exists(), "legacy runtime file still active")
need('const BUILD="40.6.563"' in JS, "module build")
need('const HISTORICAL_CORE_BUILD="40.6.498"' in JS, "historical lineage metadata")
need('const INDICATOR_STORAGE_KEY="agentCrypto.marketMicroscope.indicators.v1"' in JS, "stable indicator state owner")
need("indicators:readIndicatorState()" in JS, "indicator state restore")
need("persistIndicatorState();" in JS, "indicator state persist")
need("localStorage?.setItem(INDICATOR_STORAGE_KEY" in JS, "localStorage persistence")
need("sessionStorage?.setItem(INDICATOR_STORAGE_KEY" in JS, "sessionStorage fallback")
need("atlasCandlesTechnicalLevels406551" not in JS, "versioned DOM id remains")
need("__agentCryptoMicroscope561" not in JS and "__agentCryptoMicroscope562" not in JS, "versioned hook marker remains")
need("__agentCryptoMicroscopeHook" in JS and "__agentCryptoMicroscopeOriginal" in JS, "stable hook markers")
need("movingAverage(state.rows,n).slice(view.start,view.start+rows.length)" in JS, "MA full-history projection")
need("exponentialAverage(state.rows,n).slice(view.start,view.start+rows.length)" in JS, "EMA full-history projection")
need('method:"PIVOTS_VISIBLES_W2"' in JS, "S/R method")
need("latest_request_wins:true" in JS, "latest request wins")
need("request_timeout_ms:REQUEST_TIMEOUT_MS" in JS, "request timeout")
need("indicator_state_roundtrip:indicatorRoundTrip" in JS, "indicator roundtrip self-test")
need('storage_scope:"INDICATOR_STATE_ONLY"' in JS, "bounded storage scope")
need("real_order:false" in JS, "no real orders")
need("recurring_timer:false" in JS, "no recurring timer")

scope = BUILD.get("market_microscope_runtime") or {}
need(scope.get("owner") == "js/market-microscope-candles.js", "manifest canonical owner")
need(scope.get("formulas_changed") is False, "formulas unchanged")
need(scope.get("market_core_modified") is False, "Market Core unchanged")
need(scope.get("no_storage_deletion") is True, "storage non-destructive")

print(json.dumps({
    "ok": True,
    "build": BUILD.get("build"),
    "runtime": "js/market-microscope-candles.js",
    "indicator_state_owner": scope.get("indicator_state_owner"),
    "market_core": BUILD.get("market_core"),
    "terrain": "PENDING_FIREFOX"
}))
