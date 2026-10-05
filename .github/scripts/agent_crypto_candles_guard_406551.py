#!/usr/bin/env python3
import json
from pathlib import Path

ROOT=Path("public/agent_crypto_erith_ia/administrator")
index=(ROOT/"index.html").read_text(encoding="utf-8")
js=(ROOT/"js/market-microscope-candles-406498.js").read_text(encoding="utf-8")
build=json.loads((ROOT/"build.json").read_text(encoding="utf-8"))

def need(ok,msg):
    if not ok:
        raise SystemExit("CANDLES_406551_FAIL: "+msg)

need(build.get("build")=="40.6.551","build")
need(build.get("parent_build")=="40.6.550","parent build")
need(build.get("market_core")=="38.15.11","Market Core")
need('market-microscope-candles-406498.js?v=40.6.551' in index,"candles cache token")
need('const BUILD="40.6.551"' in js,"module build")
need('const CORE_BUILD="40.6.498"' in js,"historical owner")
need('data-amm-indicator="sr"' in js,"S/R control")
need('function supportResistance' in js,"S/R method")
need('function clusterPivots' in js,"pivot clustering")
need('PIVOTS_VISIBLES_W2' in js,"method truth")
need('atlasCandlesTechnicalLevels406551' in js,"technical reading supplement")
need('agent-crypto:candles-technical-levels' in js,"technical levels event")
need('support_resistance_pivots:true' in js,"S/R self-test flag")
need('technical_reading_bridge:true' in js,"LT bridge flag")
need('sr_read_only:true' in js,"read-only flag")
need('data-amm-indicator="ma"' in js and 'data-amm-indicator="ema"' in js,"MA/EMA preserved")
need('series_legend_dom:true' in js,"legend preserved")
need('adaptive_price_precision:true' in js,"price polish preserved")
need('recurring_timer:false' in js,"no recurring timer")
need('real_order:false' in js,"no order")

scope=build.get("market_microscope_candles_406551") or {}
need(scope.get("scope")=="CANDLES_SUPPORT_RESISTANCE_AND_TECHNICAL_READING_BRIDGE_ONLY","scope")
need(scope.get("support_resistance_inference_added") is True,"S/R added")
need(scope.get("supertrend_added") is False,"no Supertrend yet")
need(scope.get("bollinger_added") is False,"no Bollinger yet")
need(scope.get("sar_added") is False,"no SAR yet")
need(scope.get("vwap_added") is False,"no VWAP yet")
need(scope.get("volume_profile_added") is False,"no Volume Profile yet")
need(scope.get("data_source_changed") is False,"data source unchanged")
need(scope.get("order_path_changed") is False,"order path unchanged")
need(scope.get("new_timer") is False,"no timer")
need(scope.get("new_observer") is False,"no observer")
need(scope.get("storage_write") is False,"no storage")
need(scope.get("lecture_technique_business_logic_changed") is False,"LT business logic unchanged")
need(scope.get("lecture_technique_presentation_supplement_added") is True,"LT supplement")
need(scope.get("market_core_modified") is False,"Market Core unchanged")

prev=build.get("market_microscope_candles_406550") or {}
need(prev.get("terrain")=="PASS_FIREFOX_2026-10-05","40.6.550 terrain truth")

print(json.dumps({"ok":True,"build":"40.6.551","scope":"SUPPORT_RESISTANCE_AND_LT_BRIDGE","terrain":"PENDING_FIREFOX"}))
