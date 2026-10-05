#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path("public/agent_crypto_erith_ia/administrator")
index = (ROOT / "index.html").read_text(encoding="utf-8")
js = (ROOT / "js/market-microscope-candles-406498.js").read_text(encoding="utf-8")
build = json.loads((ROOT / "build.json").read_text(encoding="utf-8"))

def need(ok, msg):
    if not ok:
        raise SystemExit("INDICATOR_TRUTH_406562_FAIL: " + msg)

need(build.get("build") == "40.6.562", "build")
need(build.get("parent_build") == "40.6.561", "parent")
need(build.get("market_core") == "38.15.11", "Market Core")
need("market-microscope-candles-406498.js?v=40.6.562" in index, "microscope cache token")
need('const BUILD="40.6.562"' in js, "module build")

# MA / EMA must be computed on full loaded history, then sliced into the viewport.
need('movingAverage(state.rows,n).slice(view.start,view.start+rows.length)' in js, "MA full-history projection")
need('exponentialAverage(state.rows,n).slice(view.start,view.start+rows.length)' in js, "EMA full-history projection")
need('movingAverage(rows,n),color' not in js, "legacy viewport MA draw removed")
need('exponentialAverage(rows,n),color' not in js, "legacy viewport EMA draw removed")

# S/R remains visible-window pivots but its presentation truth must refresh with current/distance.
need('method:"PIVOTS_VISIBLES_W2"' in js, "S/R method")
need('levels.support?.distancePct' in js and 'levels.resistance?.distancePct' in js, "S/R distance signature")
need('levels.current' in js, "S/R current reference signature")
need('"dernière clôture":"clôture visible"' in js, "historical/latest wording")
need('state.lastLevels=null' in js, "stale levels clear")
need('host.removeAttribute("data-event-signature")' in js, "S/R event signature reset")

# Indicator state and VWAP truth label.
need('renderSeriesLegend();if(key==="sr"&&!state.indicators.sr)renderTechnicalLevels(null);renderState();draw();' in js, "indicator summary refresh")
need('["VWAP fenêtre","#f0c36d"]' in js, "VWAP legend label")
need('state.indicators.vwap?"VWAP fenêtre":null' in js, "VWAP state label")
need('VWAP_CUMULATIVE_TYPICAL_PRICE_VOLUME' in js, "VWAP method unchanged")

# Deterministic numeric references.
for token in [
    "ma_ema_full_history_projection:maEmaFullHistory",
    "supertrend_reference_10x3:stReference",
    "bollinger_reference_20x2:bollReference",
    "sar_reference_002_020:sarReference",
    "vwap_reference_window:vwapReferenceOk",
    "volume_profile_reference_24_bins:vpReferenceOk",
]:
    need(token in js, "missing self-test " + token)

# Preserve request/asset truth and safety boundaries.
need('latest_request_wins:true' in js, "40.6.561 request truth preserved")
need('request_timeout_ms:REQUEST_TIMEOUT_MS' in js, "40.6.561 timeout preserved")
need('real_order:false' in js, "no order")
need('recurring_timer:false' in js, "no recurring timer")

scope = build.get("candles_indicator_truth_406562") or {}
need(scope.get("scope") == "CANDLES_INDICATOR_TRUTH_LOCK_ONLY", "scope")
need(scope.get("ma_ema_full_loaded_history") is True, "MA/EMA metadata")
need(scope.get("support_resistance_algorithm_changed") is False, "S/R algorithm unchanged")
need(scope.get("support_resistance_last_levels_clear_when_disabled") is True, "S/R clear metadata")
need(scope.get("vwap_label") == "VWAP fenêtre", "VWAP label metadata")
need(scope.get("numerical_reference_self_tests") is True, "numeric tests metadata")
need(scope.get("request_asset_truth_406561_preserved") is True, "request truth preserved metadata")
need(scope.get("indicator_formulas_changed") is False, "indicator formulas unchanged")
need(scope.get("depth_changed") is False, "Depth unchanged")
need(scope.get("new_listings_business_logic_changed") is False, "New Listings unchanged")
need(scope.get("usd_architecture_changed") is False, "USD unchanged")
need(scope.get("technical_reading_business_logic_changed") is False, "Technical Reading business logic unchanged")
need(scope.get("market_core_modified") is False, "Market Core unchanged")
need(scope.get("strategy_a_business_logic_modified") is False, "Strategy A unchanged")
need(scope.get("new_timer") is False, "no timer")
need(scope.get("new_observer") is False, "no observer")
need(scope.get("new_storage_owner") is False, "no storage owner")
need(scope.get("new_business_network_request") is False, "no business request")
need(scope.get("real_order") is False, "no real order")

print(json.dumps({
    "ok": True,
    "build": "40.6.562",
    "scope": "CANDLES_INDICATOR_TRUTH_LOCK_ONLY",
    "terrain": "PENDING_FIREFOX",
    "market_core": "38.15.11"
}))
