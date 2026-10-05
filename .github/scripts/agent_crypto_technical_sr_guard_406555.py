#!/usr/bin/env python3
import json
from pathlib import Path

ROOT=Path("public/agent_crypto_erith_ia/administrator")
index=(ROOT/"index.html").read_text(encoding="utf-8")
js=(ROOT/"js/market-microscope-candles-406498.js").read_text(encoding="utf-8")
build=json.loads((ROOT/"build.json").read_text(encoding="utf-8"))

def need(ok,msg):
    if not ok:
        raise SystemExit("TECH_SR_406555_FAIL: "+msg)

need(build.get("build")=="40.6.555","build")
need(build.get("parent_build")=="40.6.554","parent")
need(build.get("market_core")=="38.15.11","Market Core")
need("market-microscope-candles-406498.js?v=40.6.555" in index,"cache token")
need('const BUILD="40.6.555"' in js,"module build")
need("function supportResistance" in js,"S/R algorithm preserved")
need("PIVOTS_VISIBLES_W2" in js,"S/R method preserved")
need('data-amm-indicator="sr"' in js,"S/R toggle preserved")
need("amm-tech-price" in js,"dedicated price span")
need("font:950 22px/1 ui-monospace,monospace!important" in js,"22px numeric visibility")
need("font:900 8.5px/1 system-ui,sans-serif!important" in js,"secondary unit")
need("Contexte des niveaux" in js,"context preserved")
need("technical_sr_price_visibility:true" in js,"visibility self-test")
need("recurring_timer:false" in js,"no timer")
need("real_order:false" in js,"no order")

prev=build.get("technical_reading_sr_price_priority_406554") or {}
need(prev.get("terrain")=="FAIL_FIREFOX_PRICE_STILL_TOO_SMALL_2026-10-05","40.6.554 terrain truth")

scope=build.get("technical_reading_sr_price_visibility_406555") or {}
need(scope.get("scope")=="TECHNICAL_READING_SR_PRICE_TYPOGRAPHY_ONLY","scope")
need(scope.get("support_resistance_algorithm_changed") is False,"S/R algorithm unchanged")
need(scope.get("support_resistance_values_changed") is False,"S/R values unchanged")
need(scope.get("chart_sr_changed") is False,"chart unchanged")
need(scope.get("touch_count_changed") is False,"touches unchanged")
need(scope.get("context_wording_changed") is False,"context unchanged")
need(scope.get("market_core_modified") is False,"Market Core unchanged")
need(scope.get("new_timer") is False,"no timer metadata")
need(scope.get("new_observer") is False,"no observer")
need(scope.get("storage_write") is False,"no storage")

print(json.dumps({"ok":True,"build":"40.6.555","scope":"TECHNICAL_SR_PRICE_TYPOGRAPHY_ONLY","terrain":"PENDING_FIREFOX"}))
