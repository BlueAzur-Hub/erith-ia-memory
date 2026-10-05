#!/usr/bin/env python3
import json
from pathlib import Path

ROOT=Path("public/agent_crypto_erith_ia/administrator")
index=(ROOT/"index.html").read_text(encoding="utf-8")
js=(ROOT/"js/market-microscope-candles-406498.js").read_text(encoding="utf-8")
build=json.loads((ROOT/"build.json").read_text(encoding="utf-8"))

def need(ok,msg):
    if not ok:
        raise SystemExit("TECH_SR_406553_FAIL: "+msg)

need(build.get("build")=="40.6.553","build")
need(build.get("parent_build")=="40.6.552","parent")
need(build.get("market_core")=="38.15.11","Market Core")
need('market-microscope-candles-406498.js?v=40.6.553' in index,"cache token")
need('const BUILD="40.6.553"' in js,"module build")
need('function supportResistance' in js,"S/R algorithm preserved")
need('PIVOTS_VISIBLES_W2' in js,"S/R method preserved")
need('data-amm-indicator="sr"' in js,"S/R toggle preserved")
need('atlas-detail-subwindow atlas-primary-detail-window amm-tech-levels-native' in js,"native technical component")
need('data-window-state' in js,"native window state")
need('Repères Support / Résistance' in js,"native title")
need('Support</b> : zone où le prix a récemment rebondi ou ralenti sa baisse.' in js,"plain support explanation")
need('Résistance</b> : zone où le prix a récemment bloqué ou ralenti sa hausse.' in js,"plain resistance explanation")
need('Touches</b> : nombre de réactions observées autour du niveau.' in js,"plain touches explanation")
need('technical_sr_native_window:true' in js,"native self-test")
need('technical_sr_plain_language:true' in js,"plain-language self-test")
need('technical_sr_collapsible:true' in js,"collapsible self-test")
need('technical_sr_compact_summary:true' in js,"compact summary self-test")
need('repères locaux' not in js.lower(),"repères locaux removed from UI")
need('pas une certitude de marché ni un ordre' not in js.lower(),"generic disclaimer removed from UI")
need('recurring_timer:false' in js,"no timer")
need('real_order:false' in js,"no order")

scope=build.get("technical_reading_sr_native_window_406553") or {}
need(scope.get("scope")=="TECHNICAL_READING_SR_NATIVE_COMPONENT_PRESENTATION_ONLY","scope")
need(scope.get("support_resistance_algorithm_changed") is False,"S/R algorithm unchanged")
need(scope.get("support_resistance_values_changed") is False,"S/R values unchanged")
need(scope.get("chart_sr_changed") is False,"chart unchanged")
need(scope.get("lecture_technique_business_logic_changed") is False,"LT business logic unchanged")
need(scope.get("lecture_technique_native_component_reused") is True,"native component reused")
need(scope.get("supertrend_added") is False,"no Supertrend")
need(scope.get("new_timer") is False,"no timer metadata")
need(scope.get("new_observer") is False,"no observer")
need(scope.get("storage_write") is False,"no storage")
need(scope.get("market_core_modified") is False,"Market Core unchanged")

prev=build.get("technical_reading_sr_glass_collapsible_406552") or {}
need(prev.get("terrain")=="REJECTED_FIREFOX_PRESENTATION_2026-10-05","40.6.552 terrain truth")

print(json.dumps({"ok":True,"build":"40.6.553","scope":"TECHNICAL_SR_NATIVE_COMPONENT_PRESENTATION_ONLY","terrain":"PENDING_FIREFOX"}))
