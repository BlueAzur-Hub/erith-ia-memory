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

CURRENT = str(BUILD.get("build") or "").strip()
PARENT = str(BUILD.get("parent_build") or "").strip()
need(bool(CURRENT), "current build")
need(bool(PARENT), "parent build")
need(BUILD.get("market_core") == "38.15.11", "Market Core")
need(f"market-microscope-candles.js?v={CURRENT}" in INDEX, "canonical runtime cache token")
need("market-microscope-candles-406498.js" not in INDEX, "legacy runtime referenced by current index")
need(not (ROOT / "js/market-microscope-candles-406498.js").exists(), "legacy runtime file still active")
need(f'const BUILD="{CURRENT}"' in JS, "module build")
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
need("strict_null_ohlc_rejected:nullOhlcRejected" in JS, "null OHLC validation")
need("strict_incoherent_ohlc_rejected:incoherentOhlcRejected" in JS, "OHLC coherence validation")
need("empty_parsed_series_rejected:emptySeriesRejected" in JS, "empty parsed series validation")
need("timeout_has_explicit_error:timeoutTruth" in JS, "timeout truth self-test")
need("OKX_LOCAL_TIMEOUT" in JS, "explicit local timeout error")
need("OKX_LOCAL_UNAVAILABLE" in JS, "explicit local backend unavailable error")
need("canFallbackToUsdc(error)" in JS, "bounded EUR to USDC fallback")
need('network:"OKX_PUBLIC_VIA_LOCAL_BACKEND_ON_DEMAND_OR_NEW_LISTING_PROVIDER"' in JS, "network truth")
need('storage_scope:"INDICATOR_STATE_ONLY"' in JS, "bounded storage scope")
need('class="amm-intervals"><small>INTERVALLE</small>' in JS, "stable interval control row")
need("flex-wrap:nowrap" in JS, "non-wrapping Microscope control rows")
need("else if(c.parentElement!==host)host.appendChild(c);" in JS, "controls idempotent reparent")
need("if(root.parentElement!==sh)sh.appendChild(root);" in JS, "chart root idempotent reparent")
need("function scheduleLayoutRefresh()" in JS, "bounded view layout refresh")
need('window.addEventListener("atlas:v2mode",scheduleLayoutRefresh' in JS, "v2 mode layout refresh")
need('window.addEventListener("atlas:admin-graph",scheduleLayoutRefresh' in JS, "admin graph layout refresh")
need("view_layout_refresh_no_fetch:true" in JS, "layout refresh no-fetch contract")
need("stable_control_rows:true" in JS, "stable control row export")
need("compact_meta:true" in JS, "compact meta export")
need("verbose_indicator_meta_removed:true" in JS, "verbose meta removal export")
need("O/H/L/C + Volume · ${indicators}" not in JS, "verbose indicator inventory still rendered in header")
need("${shownInstrument} · ${shownBar} · ${state.rows.length} bougies · ${metaProvider}" in JS, "compact runtime metadata contract")
need("real_order:false" in JS, "no real orders")
need("recurring_timer:false" in JS, "no recurring timer")

scope = BUILD.get("market_microscope_runtime") or {}
need(scope.get("owner") == "js/market-microscope-candles.js", "manifest canonical owner")
need(scope.get("transport_owner") == "js/okx-local-backend-transport.js", "manifest transport owner")
need(scope.get("transport_runtime") == "LOCAL_BACKEND_127.0.0.1_8790", "manifest local backend truth")
need(scope.get("direct_browser_okx_fetch") is False, "direct browser OKX disabled")
need(scope.get("timeout_silent_fixed") is True, "timeout repair manifest")
need(scope.get("strict_ohlc_validation") is True, "strict OHLC manifest")
need(scope.get("empty_parsed_series_rejected") is True, "empty series manifest")
need(scope.get("eur_fallback_on_transport_failure") is False, "transport failure fallback guard")
need(scope.get("stable_control_rows") is True, "manifest stable control rows")
need(scope.get("indicators_row_separate") is True, "manifest indicator row")
need(scope.get("interval_row_separate") is True, "manifest interval row")
need(scope.get("control_row_wrapping") is False, "manifest non-wrapping controls")
need(scope.get("idempotent_mount_reparent") is True, "manifest idempotent mount")
need(scope.get("view_layout_refresh_no_fetch") is True, "manifest layout refresh no fetch")
need(scope.get("mode_persistence_added") is False, "no hidden mode persistence")
need(scope.get("interval_persistence_added") is False, "no hidden interval persistence")
need(scope.get("compact_meta") is True, "manifest compact meta")
need(scope.get("verbose_indicator_meta_removed") is True, "manifest verbose meta removed")
need(scope.get("meta_no_indicator_duplication") is True, "manifest no indicator duplication")
need(scope.get("meta_single_line") is True, "manifest single-line meta")
need(scope.get("storage_changed") is False, "manifest storage unchanged")
need(scope.get("formulas_changed") is False, "formulas unchanged")
need(scope.get("market_core_modified") is False, "Market Core unchanged")
need(scope.get("no_storage_deletion") is True, "storage non-destructive")

print(json.dumps({
    "ok": True,
    "build": CURRENT,
    "parent": PARENT,
    "runtime": "js/market-microscope-candles.js",
    "transport": scope.get("transport_runtime"),
    "indicator_state_owner": scope.get("indicator_state_owner"),
    "market_core": BUILD.get("market_core"),
    "terrain": "PENDING_FIREFOX"
}))
