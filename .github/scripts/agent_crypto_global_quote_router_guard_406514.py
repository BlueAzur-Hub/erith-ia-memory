#!/usr/bin/env python3
from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[2]
ADMIN=ROOT/"public/agent_crypto_erith_ia/administrator"

def need(value,message):
    if not value:
        raise SystemExit("GLOBAL_QUOTE_406514_FAIL: "+message)

build=json.loads((ADMIN/"build.json").read_text(encoding="utf-8"))
index=(ADMIN/"index.html").read_text(encoding="utf-8")
archive=(ADMIN/"index-40.6.514.html").read_text(encoding="utf-8")
atlas=(ADMIN/"views/atlas.html").read_text(encoding="utf-8")
quote=(ADMIN/"js/quote-currency-architecture-406497.js").read_text(encoding="utf-8")
router=(ADMIN/"js/global-quote-router-406514.js").read_text(encoding="utf-8")
loader=(ADMIN/"js/post-boot-runtime-loader.js").read_text(encoding="utf-8")
depth=(ADMIN/"js/okx-microstructure-406499.js").read_text(encoding="utf-8")

need(build.get("build")=="40.6.514","build")
need(build.get("parent_build")=="40.6.513","parent")
need(build.get("release")=="GLOBAL QUOTE ROUTER · USD FOUNDATION","release")
need(build.get("market_core")=="38.15.11" and build.get("market_core_modified") is False,"market core")
need("Build 40.6.514 · Administrator" in index and "Build 40.6.514 · Administrator" in archive,"entries")
need('administrator-release" content="GLOBAL QUOTE ROUTER · USD FOUNDATION"' in index,"release meta")
need('global-quote-router-406514.js?v=40.6.514' in index,"router delivery")
need('id="atlasStableStackInterface">Build 40.6.514<' in atlas,"atlas interface")
need('const BUILD="40.6.514"' in loader,"loader build")
need('const state={displayCurrency:"USD",executionInstrument:"BTC-EUR",settlementAsset:"EUR"}' in quote,"USD default separation")
need('default_display_is_usd:defaultUsd' in quote and 'settlement_remains_eur:before.settlementAsset==="EUR"' in quote,"quote self-test")
need('const BUILD="40.6.514"' in router,"router build")
need('const SNAPSHOT_RELATIVE="../data/crypto/latest.json"' in router,"same-origin source truth")
need('payload?.source?.quote_currency!=="USD"' in router and 'payload?.fx?.usd_per_eur' in router,"USD+ECB validation")
need('canonical EUR runtime series × published ECB USD/EUR' in router,"chart conversion contract")
need("setInterval(" not in router and "new MutationObserver" not in router,"no recurring runtime")
need("localStorage" not in router and "indexedDB" not in router,"no storage write")
need("api.coingecko.com" not in router and "eea.okx.com" not in router,"no new external provider request")
need('execution_mutation:false' in router and 'settlement_mutation:false' in router and 'real_order:false' in router and 'wallet:false' in router,"safety locks")
need('const BUILD="40.6.513"' in depth and 'root.dataset.portalOwner="depth-40.6.513"' in depth,"Depth .513 frozen")
need('if(pair.quote!=="EUR")' in depth,"Depth native EUR truth preserved")
g=build.get("global_quote_router_406514") or {}
need(g.get("source_truth_native_quote")=="USD" and g.get("fx_source")=="ECB","build source truth")
need(g.get("execution_instrument")=="BTC-EUR" and g.get("settlement_asset")=="EUR","execution/settlement unchanged")
need(g.get("market_core_modified") is False and g.get("strategy_a_changed") is False and g.get("oracle_changed") is False and g.get("depth_changed") is False,"protected owners")
need(g.get("new_recurring_timer") is False and g.get("mutation_observer") is False and g.get("storage_write") is False,"bounded runtime")
print(json.dumps({"ok":True,"build":"40.6.514","market_core":"38.15.11","default_display":"USD","execution":"BTC-EUR","settlement":"EUR","source_truth":"CoinGecko USD + ECB FX","terrain":"PENDING_FIREFOX"},ensure_ascii=False))
