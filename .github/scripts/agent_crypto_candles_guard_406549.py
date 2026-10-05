#!/usr/bin/env python3
import json
from pathlib import Path

ROOT=Path("public/agent_crypto_erith_ia/administrator")
index=(ROOT/"index.html").read_text(encoding="utf-8")
js=(ROOT/"js/market-microscope-candles-406498.js").read_text(encoding="utf-8")
build=json.loads((ROOT/"build.json").read_text(encoding="utf-8"))

def need(ok,msg):
    if not ok:
        raise SystemExit("CANDLES_406549_FAIL: "+msg)

need(build.get("build")=="40.6.549","build")
need(build.get("parent_build")=="40.6.548","parent build")
need(build.get("market_core")=="38.15.11","Market Core")
need('market-microscope-candles-406498.js?v=40.6.549' in index,"candles cache token")
need('const BUILD="40.6.549"' in js,"module build")
need('const CORE_BUILD="40.6.498"' in js,"historical owner")
need('data-amm-indicator="ma"' in js and 'data-amm-indicator="ema"' in js,"indicator controls preserved")
need('human_readable_inspector:true' in js,"human readable inspector self-test")
need('full_french_labels:true' in js,"French labels self-test")
need('default_visible_rows:view.count<=72' in js,"readable default viewport")
need('OUVERTURE' in js and 'PLUS HAUT' in js and 'PLUS BAS' in js and 'CLÔTURE' in js and 'VARIATION' in js and 'VOLUME' in js,"human labels")
need('crosshair_xy:true' in js,"XY crosshair preserved")
need('visible_high_low:true' in js,"H/L truth preserved")
need('freshness_truth:true' in js,"freshness truth preserved")
need('recurring_timer:false' in js,"no recurring timer")
need('real_order:false' in js,"no order")
scope=build.get("market_microscope_candles_406549") or {}
need(scope.get("scope")=="CANDLES_HUMAN_READABILITY_ONLY","scope")
need(scope.get("support_resistance_inference_added") is False,"no fake S/R")
need(scope.get("supertrend_added") is False,"no Supertrend yet")
need(scope.get("bollinger_added") is False,"no Bollinger yet")
need(scope.get("sar_added") is False,"no SAR yet")
need(scope.get("vwap_added") is False,"no VWAP yet")
need(scope.get("volume_profile_added") is False,"no Volume Profile yet")
need(scope.get("data_source_changed") is False,"data source unchanged")
need(scope.get("order_path_changed") is False,"order path unchanged")
need(scope.get("market_core_modified") is False,"Market Core unchanged")
prev=build.get("market_microscope_candles_406548") or {}
need(prev.get("terrain")=="FUNCTIONAL_PRESENT_UX_REJECTED_FIREFOX","40.6.548 terrain truth")
print(json.dumps({"ok":True,"build":"40.6.549","scope":"HUMAN_READABILITY_ONLY","terrain":"PENDING_FIREFOX"}))
