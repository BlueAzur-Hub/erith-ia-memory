#!/usr/bin/env python3
from pathlib import Path
import json, subprocess

ROOT=Path(__file__).resolve().parents[2]
ADMIN=ROOT/"public/agent_crypto_erith_ia/administrator"

def need(v,m):
    if not v:
        raise SystemExit("CURRENCY_DOMAIN_V2_406517_FAIL: "+m)

build=json.loads((ADMIN/"build.json").read_text(encoding="utf-8"))
index=(ADMIN/"index.html").read_text(encoding="utf-8")
archive=(ADMIN/"index-40.6.517.html").read_text(encoding="utf-8")
domain=(ADMIN/"js/currency-domain-v2-406517.js").read_text(encoding="utf-8")
quote=(ADMIN/"js/quote-currency-architecture-406497.js").read_text(encoding="utf-8")

need(build.get("build")=="40.6.517","build")
need(build.get("parent_build")=="40.6.516","parent")
need(build.get("release")=="CURRENCY DOMAIN V2 · ADDITIVE CONTRACT ONLY","release")
need(build.get("market_core")=="38.15.11" and build.get("market_core_modified") is False,"market core")
need("Build 40.6.517 · Administrator" in index and "Build 40.6.517 · Administrator" in archive,"entries")
need('administrator-release" content="CURRENCY DOMAIN V2 · ADDITIVE CONTRACT ONLY"' in index,"release meta")
need("currency-domain-v2-406517.js" in index,"currency domain not loaded")
need(index.index("quote-currency-architecture-406497.js") < index.index("currency-domain-v2-406517.js"),"currency domain must load after quote architecture")
need("global-quote-router-406514.js" not in index,"failed .514 router loaded")
need("graph-owner-handshake-406515.js" not in index,"failed .515 handshake loaded")
need('const state={displayCurrency:"EUR",executionInstrument:"BTC-EUR",settlementAsset:"EUR"}' in quote,"EUR default changed")
need('const BUILD="40.6.517"' in domain,"domain build")
need("legacy_price_semantics_changed:false" in domain,"legacy semantics guard")
need("spot_broker_changed:false" in domain,"spot broker guard")
need("chart_owner_changed:false" in domain,"chart owner guard")
need("analysisCurrency:ANALYSIS_CURRENCY" in domain,"analysis currency")

def blob(path):
    return subprocess.check_output(["git","hash-object",str(path)],text=True).strip()

hashes={
    "app":blob(ADMIN/"app.js"),
    "quote":blob(ADMIN/"js/quote-currency-architecture-406497.js"),
    "candles":blob(ADMIN/"js/market-microscope-candles-406498.js"),
    "depth":blob(ADMIN/"js/okx-microstructure-406499.js"),
    "aether":blob(ADMIN/"js/aether.js"),
}
need(hashes["app"]=="3507514b8a90366a7ca1b5d86e5cf3f700be31ab","app.js changed")
need(hashes["quote"]=="4495120737a24e7404dc71c9451220ace630d5c7","quote architecture changed")
need(hashes["candles"]=="ea2ef80af94fa6e2be539886287c7f754025fe9b","candles changed")
need(hashes["depth"]=="2238da8a84fa21ac054ab1357f500d94476c1b43","depth changed")
need(hashes["aether"]=="8c2ca19cd80a0f0fbfa3367012f4a7e531245fda","aether changed")

cd=build.get("currency_domain_v2_406517") or {}
need(cd.get("enabled") is True,"domain manifest")
need(cd.get("visual_change") is False,"visual change")
need(cd.get("analysis_currency")=="EUR","analysis currency manifest")
need(cd.get("default_display_currency")=="EUR","display manifest")
need(cd.get("execution_instrument")=="BTC-EUR","execution manifest")
need(cd.get("settlement_asset")=="EUR","settlement manifest")
need(cd.get("app_js_changed") is False and cd.get("spot_broker_changed") is False and cd.get("chart_owner_changed") is False,"owner scope")

print(json.dumps({
  "ok":True,
  "build":"40.6.517",
  "release":"CURRENCY DOMAIN V2 · ADDITIVE CONTRACT ONLY",
  "market_core":"38.15.11",
  "protected_hashes":hashes,
  "terrain":"PENDING_FIREFOX"
},ensure_ascii=False))
