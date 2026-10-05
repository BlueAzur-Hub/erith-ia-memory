#!/usr/bin/env python3
import json
from pathlib import Path

ROOT=Path("public/agent_crypto_erith_ia/administrator")
index=(ROOT/"index.html").read_text(encoding="utf-8")
js=(ROOT/"js/market-microscope-candles-406498.js").read_text(encoding="utf-8")
build=json.loads((ROOT/"build.json").read_text(encoding="utf-8"))

def need(ok,msg):
    if not ok:
        raise SystemExit("CANDLES_406548_FAIL: "+msg)

need(build.get("build")=="40.6.548","build")
need(build.get("market_core")=="38.15.11","Market Core")
need('market-microscope-candles-406498.js?v=40.6.548' in index,"candles cache token")
need('const BUILD="40.6.548"' in js,"module build")
need('const CORE_BUILD="40.6.498"' in js,"historical owner")
need('data-amm-indicator="ma"' in js and 'data-amm-indicator="ema"' in js,"indicator controls")
need('function exponentialAverage' in js,"EMA helper")
need('crosshair_xy:true' in js,"XY crosshair self-test")
need('visible_high_low:true' in js,"H/L markers")
need('freshness_truth:true' in js,"freshness truth")
need('candle_change_pct' in js,"candle delta")
need('recurring_timer:false' in js,"no recurring timer")
need('real_order:false' in js,"no order")
scope=build.get("market_microscope_candles_406548") or {}
need(scope.get("support_resistance_inference_added") is False,"no fake S/R")
need(scope.get("data_source_changed") is False,"data source unchanged")
need(scope.get("order_path_changed") is False,"order path unchanged")
need(scope.get("market_core_modified") is False,"Market Core unchanged")
print(json.dumps({"ok":True,"build":"40.6.548","terrain":"PENDING_FIREFOX"}))
