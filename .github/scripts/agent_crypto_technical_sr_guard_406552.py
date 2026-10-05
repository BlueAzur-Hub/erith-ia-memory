#!/usr/bin/env python3
import json
from pathlib import Path

ROOT=Path("public/agent_crypto_erith_ia/administrator")
index=(ROOT/"index.html").read_text(encoding="utf-8")
js=(ROOT/"js/market-microscope-candles-406498.js").read_text(encoding="utf-8")
build=json.loads((ROOT/"build.json").read_text(encoding="utf-8"))

def need(ok,msg):
    if not ok:
        raise SystemExit("TECH_SR_406552_FAIL: "+msg)

need(build.get("build")=="40.6.552","build")
need(build.get("parent_build")=="40.6.551","parent")
need(build.get("market_core")=="38.15.11","Market Core")
need('market-microscope-candles-406498.js?v=40.6.552' in index,"cache token")
need('const BUILD="40.6.552"' in js,"module build")
need('function supportResistance' in js,"S/R algorithm preserved")
need('function clusterPivots' in js,"S/R clustering preserved")
need('PIVOTS_VISIBLES_W2' in js,"S/R method preserved")
need('data-amm-indicator="sr"' in js,"S/R toggle preserved")
need('document.createElement("details")' in js,"collapsible details")
need('amm-tech-levels-summary' in js,"collapsible summary")
need('amm-tech-levels-body' in js,"collapsible body")
need('technical_sr_glass:true' in js,"glass self-test")
need('technical_sr_collapsible:true' in js,"collapsible self-test")
need('technical_sr_compact_summary:true' in js,"compact summary self-test")
need('backdrop-filter:blur(2px)' in js,"glass background")
need('recurring_timer:false' in js,"no timer")
need('real_order:false' in js,"no order")

scope=build.get("technical_reading_sr_glass_collapsible_406552") or {}
need(scope.get("scope")=="TECHNICAL_READING_SR_PRESENTATION_ONLY","scope")
need(scope.get("support_resistance_algorithm_changed") is False,"S/R algorithm unchanged")
need(scope.get("support_resistance_values_changed") is False,"S/R values unchanged")
need(scope.get("lecture_technique_business_logic_changed") is False,"LT business logic unchanged")
need(scope.get("lecture_technique_presentation_changed") is True,"LT presentation changed")
need(scope.get("supertrend_added") is False,"no Supertrend")
need(scope.get("new_timer") is False,"no timer metadata")
need(scope.get("new_observer") is False,"no observer")
need(scope.get("storage_write") is False,"no storage")
need(scope.get("market_core_modified") is False,"Market Core unchanged")

prev=build.get("market_microscope_candles_406551") or {}
need(prev.get("terrain")=="PASS_FUNCTIONAL_FIREFOX_POLISH_REQUIRED_2026-10-05","40.6.551 terrain truth")

print(json.dumps({"ok":True,"build":"40.6.552","scope":"TECHNICAL_SR_PRESENTATION_ONLY","terrain":"PENDING_FIREFOX"}))
