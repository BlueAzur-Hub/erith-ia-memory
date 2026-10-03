#!/usr/bin/env python3
from pathlib import Path
import json, subprocess

ROOT=Path(__file__).resolve().parents[2]
ADMIN=ROOT/"public/agent_crypto_erith_ia/administrator"

def need(value,message):
    if not value:
        raise SystemExit("MARKET_FICHE_USD_406518_FAIL: "+message)

build=json.loads((ADMIN/"build.json").read_text(encoding="utf-8"))
index=(ADMIN/"index.html").read_text(encoding="utf-8")
archive=(ADMIN/"index-40.6.518.html").read_text(encoding="utf-8")
module=(ADMIN/"js/market-fiche-display-406518.js").read_text(encoding="utf-8")
quote=(ADMIN/"js/quote-currency-architecture-406497.js").read_text(encoding="utf-8")

need(build.get("build")=="40.6.518","build")
need(build.get("parent_build")=="40.6.517","parent")
need(build.get("release")=="MARKET + FICHE USD PROJECTION · EXPLICIT VALUES ONLY","release")
need(build.get("market_core")=="38.15.11" and build.get("market_core_modified") is False,"market core")
need("Build 40.6.518 · Administrator" in index and "Build 40.6.518 · Administrator" in archive,"entries")
need('administrator-release" content="MARKET + FICHE USD PROJECTION · EXPLICIT VALUES ONLY"' in index,"release meta")
need("currency-domain-v2-406517.js" in index,"currency domain missing")
need("market-fiche-display-406518.js" in index,"market fiche owner missing")
need(index.index("currency-domain-v2-406517.js") < index.index("market-fiche-display-406518.js"),"owner must load after Currency Domain V2")
need("global-quote-router-406514.js" not in index,"failed .514 router loaded")
need("graph-owner-handshake-406515.js" not in index,"failed .515 handshake loaded")
need('const state={displayCurrency:"EUR",executionInstrument:"BTC-EUR",settlementAsset:"EUR"}' in quote,"EUR default changed")
need('const BUILD="40.6.518"' in module,"module build")
need('eur_to_usd_conversion:false' in module,"no-conversion contract")
need('graph_changed:false' in module and 'oracle_changed:false' in module and 'aether_changed:false' in module,"protected owner flags")

def blob(path):
    return subprocess.check_output(["git","hash-object",str(path)],text=True).strip()

hashes={
    "app":blob(ADMIN/"app.js"),
    "quote":blob(ADMIN/"js/quote-currency-architecture-406497.js"),
    "currency_domain":blob(ADMIN/"js/currency-domain-v2-406517.js"),
    "candles":blob(ADMIN/"js/market-microscope-candles-406498.js"),
    "depth":blob(ADMIN/"js/okx-microstructure-406499.js"),
    "aether":blob(ADMIN/"js/aether.js"),
}
need(hashes["app"]=="3507514b8a90366a7ca1b5d86e5cf3f700be31ab","app.js changed")
need(hashes["quote"]=="4495120737a24e7404dc71c9451220ace630d5c7","quote architecture changed")
need(hashes["currency_domain"]=="f057f588a914d1602179c288dd6303888cfd75ce","Currency Domain V2 changed")
need(hashes["candles"]=="ea2ef80af94fa6e2be539886287c7f754025fe9b","candles changed")
need(hashes["depth"]=="2238da8a84fa21ac054ab1357f500d94476c1b43","depth changed")
need(hashes["aether"]=="8c2ca19cd80a0f0fbfa3367012f4a7e531245fda","aether changed")

scope=build.get("market_fiche_display_406518") or {}
need(scope.get("enabled") is True,"scope manifest")
need(scope.get("owners")==["Market","Fiche"],"owners")
need(scope.get("default_display_currency")=="EUR","display default")
need(scope.get("analysis_currency")=="EUR","analysis currency")
need(scope.get("execution_instrument")=="BTC-EUR" and scope.get("settlement_asset")=="EUR","execution settlement")
need(scope.get("browser_eur_to_usd_conversion") is False,"conversion")
need(scope.get("app_js_changed") is False and scope.get("broker_changed") is False,"core/broker scope")
need(scope.get("graph_changed") is False and scope.get("oracle_changed") is False and scope.get("aether_changed") is False,"owner scope")

print(json.dumps({
  "ok":True,
  "build":"40.6.518",
  "release":"MARKET + FICHE USD PROJECTION · EXPLICIT VALUES ONLY",
  "owners":["Market","Fiche"],
  "market_core":"38.15.11",
  "protected_hashes":hashes,
  "terrain":"PENDING_FIREFOX"
},ensure_ascii=False))
