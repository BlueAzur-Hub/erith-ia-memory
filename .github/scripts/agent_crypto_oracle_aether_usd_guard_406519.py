#!/usr/bin/env python3
from pathlib import Path
import json, subprocess

ROOT=Path(__file__).resolve().parents[2]
ADMIN=ROOT/"public/agent_crypto_erith_ia/administrator"

def need(value,message):
    if not value:
        raise SystemExit("ORACLE_AETHER_USD_406519_FAIL: "+message)

build=json.loads((ADMIN/"build.json").read_text(encoding="utf-8"))
index=(ADMIN/"index.html").read_text(encoding="utf-8")
archive=(ADMIN/"index-40.6.519.html").read_text(encoding="utf-8")
module=(ADMIN/"js/oracle-aether-display-406519.js").read_text(encoding="utf-8")
aether=(ADMIN/"js/aether.js").read_text(encoding="utf-8")
quote=(ADMIN/"js/quote-currency-architecture-406497.js").read_text(encoding="utf-8")

need(build.get("build")=="40.6.519","build")
need(build.get("parent_build")=="40.6.518","parent")
need(build.get("release")=="ORACLE + AETHER USD PRESENTATION · MODEL UNCHANGED","release")
need(build.get("market_core")=="38.15.11" and build.get("market_core_modified") is False,"market core")
need("Build 40.6.519 · Administrator" in index and "Build 40.6.519 · Administrator" in archive,"entries")
need('administrator-release" content="ORACLE + AETHER USD PRESENTATION · MODEL UNCHANGED"' in index,"release meta")
need("oracle-aether-display-406519.js" in index,"oracle/aether owner missing")
need(index.index("market-fiche-display-406518.js") < index.index("oracle-aether-display-406519.js"),"owner load order")
need("global-quote-router-406514.js" not in index,"failed .514 router loaded")
need("graph-owner-handshake-406515.js" not in index,"failed .515 handshake loaded")
need('const state={displayCurrency:"EUR",executionInstrument:"BTC-EUR",settlementAsset:"EUR"}' in quote,"EUR default changed")
need('const BUILD="40.6.519"' in module,"module build")
need('eur_to_usd_conversion:false' in module,"no conversion contract")
need('oracle_model_changed:false' in module and 'oracle_math_changed:false' in module and 'oracle_evidence_changed:false' in module,"oracle invariant")
need('function aetherDisplayCurrency()' in aether,"aether display owner")
need('coin?.priceUsd' in aether,"aether explicit USD missing")
need('agent-crypto:quote-architecture-changed' in aether,"aether currency event missing")

def blob(path):
    return subprocess.check_output(["git","hash-object",str(path)],text=True).strip()

hashes={
    "app":blob(ADMIN/"app.js"),
    "quote":blob(ADMIN/"js/quote-currency-architecture-406497.js"),
    "currency_domain":blob(ADMIN/"js/currency-domain-v2-406517.js"),
    "market_fiche":blob(ADMIN/"js/market-fiche-display-406518.js"),
    "candles":blob(ADMIN/"js/market-microscope-candles-406498.js"),
    "depth":blob(ADMIN/"js/okx-microstructure-406499.js"),
    "aether":blob(ADMIN/"js/aether.js"),
}
need(hashes["app"]=="3507514b8a90366a7ca1b5d86e5cf3f700be31ab","app.js changed")
need(hashes["quote"]=="4495120737a24e7404dc71c9451220ace630d5c7","quote architecture changed")
need(hashes["currency_domain"]=="f057f588a914d1602179c288dd6303888cfd75ce","Currency Domain V2 changed")
need(hashes["market_fiche"]=="8fb3a066b7e2bc492a2c7234b43a3e08ac7ed533","Market/Fiche 40.6.518 changed")
need(hashes["candles"]=="ea2ef80af94fa6e2be539886287c7f754025fe9b","candles changed")
need(hashes["depth"]=="2238da8a84fa21ac054ab1357f500d94476c1b43","depth changed")

scope=build.get("oracle_aether_display_406519") or {}
need(scope.get("enabled") is True,"scope")
need(scope.get("owners")==["Oracle presentation","Aether presentation"],"owners")
need(scope.get("browser_eur_to_usd_conversion") is False,"conversion")
need(scope.get("oracle_model_changed") is False and scope.get("oracle_math_changed") is False and scope.get("oracle_evidence_changed") is False,"oracle model/math/evidence")
need(scope.get("graph_changed") is False and scope.get("market_fiche_changed") is False,"protected display owners")
need(scope.get("app_js_changed") is False and scope.get("broker_changed") is False,"core/broker")

print(json.dumps({
  "ok":True,
  "build":"40.6.519",
  "release":"ORACLE + AETHER USD PRESENTATION · MODEL UNCHANGED",
  "owners":["Oracle presentation","Aether presentation"],
  "market_core":"38.15.11",
  "protected_hashes":hashes,
  "terrain":"PENDING_FIREFOX"
},ensure_ascii=False))
