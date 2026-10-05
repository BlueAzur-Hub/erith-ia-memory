#!/usr/bin/env python3
import json
from pathlib import Path

ROOT=Path("public/agent_crypto_erith_ia/administrator")
index=(ROOT/"index.html").read_text(encoding="utf-8")
js=(ROOT/"js/market-microscope-candles-406498.js").read_text(encoding="utf-8")
build=json.loads((ROOT/"build.json").read_text(encoding="utf-8"))

def need(ok,msg):
    if not ok:
        raise SystemExit("SUPERTREND_406556_FAIL: "+msg)

need(build.get("build")=="40.6.556","build")
need(build.get("parent_build")=="40.6.555","parent")
need(build.get("market_core")=="38.15.11","Market Core")
need("market-microscope-candles-406498.js?v=40.6.556" in index,"cache token")
need('const BUILD="40.6.556"' in js,"module build")
need('supertrend:false' in js,"Supertrend default off")
need('data-amm-indicator="supertrend">SUPER</button>' in js,"SUPER button")
need('function supertrend(rows,period=10,multiplier=3)' in js,"Supertrend calculation")
need('SUPERTREND_ATR_WILDER' in js,"Supertrend method")
need('supertrend(state.rows,10,3)' in js,"10x3 invocation")
need('supertrend_default_off:state.indicators.supertrend===false' in js,"default-off self test")
need('supertrend_opt_in:true' in js,"opt-in self test")
need('function supportResistance' in js and 'PIVOTS_VISIBLES_W2' in js,"S/R preserved")
need('technical_sr_price_visibility:true' in js,".555 readability preserved")
need('recurring_timer:false' in js,"no timer")
need('real_order:false' in js,"no order")

prev=build.get("technical_reading_sr_price_visibility_406555") or {}
need(prev.get("terrain")=="PASS_FIREFOX_2026-10-05",".555 terrain PASS")

scope=build.get("candles_supertrend_406556") or {}
need(scope.get("scope")=="CANDLES_SUPERTREND_OPT_IN_ONLY","scope")
need(scope.get("method")=="SUPERTREND_ATR_WILDER","method")
need(scope.get("period")==10,"period")
need(scope.get("multiplier")==3,"multiplier")
need(scope.get("default_enabled") is False,"default")
need(scope.get("support_resistance_algorithm_changed") is False,"S/R unchanged")
need(scope.get("technical_reading_changed") is False,"Technical Reading unchanged")
need(scope.get("data_source_changed") is False,"data source unchanged")
need(scope.get("new_timer") is False,"no timer metadata")
need(scope.get("new_observer") is False,"no observer")
need(scope.get("storage_write") is False,"no storage")
need(scope.get("market_core_modified") is False,"Market Core unchanged")

print(json.dumps({"ok":True,"build":"40.6.556","scope":"CANDLES_SUPERTREND_OPT_IN_ONLY","terrain":"PENDING_FIREFOX"}))
