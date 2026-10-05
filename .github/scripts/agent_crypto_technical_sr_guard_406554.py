#!/usr/bin/env python3
import json
from pathlib import Path

ROOT=Path("public/agent_crypto_erith_ia/administrator")
index=(ROOT/"index.html").read_text(encoding="utf-8")
js=(ROOT/"js/market-microscope-candles-406498.js").read_text(encoding="utf-8")
build=json.loads((ROOT/"build.json").read_text(encoding="utf-8"))

def need(ok,msg):
    if not ok:
        raise SystemExit("TECH_SR_406554_FAIL: "+msg)

need(build.get("build")=="40.6.554","build")
need(build.get("parent_build")=="40.6.553","parent")
need(build.get("market_core")=="38.15.11","Market Core")
need('market-microscope-candles-406498.js?v=40.6.554' in index,"cache token")
need('const BUILD="40.6.554"' in js,"module build")
need('function supportResistance' in js,"S/R algorithm preserved")
need('PIVOTS_VISIBLES_W2' in js,"S/R method preserved")
need('data-amm-indicator="sr"' in js,"S/R toggle preserved")
need('atlas-detail-subwindow atlas-primary-detail-window amm-tech-levels-native' in js,"native technical component preserved")
need('Contexte des niveaux' in js,"context box")
need('prix actuel à' in js,"human context wording")
need('font:950 14px/1.08' in js,"price prominence")
need('technical_sr_price_priority:true' in js,"price priority self-test")
need('technical_sr_context_separate:true' in js,"separate context self-test")
need('technical_sr_no_confidence_label:true' in js,"no confidence label self-test")
need('level.confidence' not in js[js.index('function technicalLevelsMarkup'):js.index('function syncTechnicalLevelsWindow')],"confidence label removed from markup")
need(' · indicatif · ' not in js,"indicatif UI removed")
need(' · confirmé · ' not in js,"confirmé UI removed")
need(' · fort · ' not in js,"fort UI removed")
need('recurring_timer:false' in js,"no timer")
need('real_order:false' in js,"no order")

scope=build.get("technical_reading_sr_price_priority_406554") or {}
need(scope.get("scope")=="TECHNICAL_READING_SR_INFORMATION_HIERARCHY_ONLY","scope")
need(scope.get("support_resistance_algorithm_changed") is False,"S/R algorithm unchanged")
need(scope.get("support_resistance_values_changed") is False,"S/R values unchanged")
need(scope.get("chart_sr_changed") is False,"chart unchanged")
need(scope.get("confidence_computation_changed") is False,"confidence computation unchanged")
need(scope.get("confidence_label_displayed") is False,"confidence label hidden")
need(scope.get("context_separated_from_primary_prices") is True,"context separated")
need(scope.get("supertrend_added") is False,"no Supertrend")
need(scope.get("new_timer") is False,"no timer metadata")
need(scope.get("new_observer") is False,"no observer")
need(scope.get("storage_write") is False,"no storage")
need(scope.get("market_core_modified") is False,"Market Core unchanged")

prev=build.get("technical_reading_sr_native_window_406553") or {}
need(prev.get("terrain")=="PASS_STRUCTURE_FIREFOX_TEXT_HIERARCHY_REWORK_REQUIRED_2026-10-05","40.6.553 terrain truth")

print(json.dumps({"ok":True,"build":"40.6.554","scope":"TECHNICAL_SR_INFORMATION_HIERARCHY_ONLY","terrain":"PENDING_FIREFOX"}))
