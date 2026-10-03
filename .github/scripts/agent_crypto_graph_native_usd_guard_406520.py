#!/usr/bin/env python3
from pathlib import Path
import json, subprocess

ROOT=Path(__file__).resolve().parents[2]
ADMIN=ROOT/"public/agent_crypto_erith_ia/administrator"

def need(value,message):
    if not value:
        raise SystemExit("GRAPH_NATIVE_USD_406520_FAIL: "+message)

build=json.loads((ADMIN/"build.json").read_text(encoding="utf-8"))
index=(ADMIN/"index.html").read_text(encoding="utf-8")
archive=(ADMIN/"index-40.6.520.html").read_text(encoding="utf-8")
module=(ADMIN/"js/graph-native-usd-406520.js").read_text(encoding="utf-8")
quote=(ADMIN/"js/quote-currency-architecture-406497.js").read_text(encoding="utf-8")

need(build.get("build")=="40.6.520","build")
need(build.get("parent_build")=="40.6.519","parent")
need(build.get("release")=="GRAPH NATIVE USD SOURCE · CURRENCY-AWARE CACHE/CONTEXT","release")
need(build.get("market_core")=="38.15.11" and build.get("market_core_modified") is False,"market core")
need("Build 40.6.520 · Administrator" in index and "Build 40.6.520 · Administrator" in archive,"entries")
need('administrator-release" content="GRAPH NATIVE USD SOURCE · CURRENCY-AWARE CACHE/CONTEXT"' in index,"release meta")
need("graph-native-usd-406520.js" in index,"graph USD owner missing")
need(index.index("currency-domain-v2-406517.js") < index.index("graph-native-usd-406520.js") < index.index("market-fiche-display-406518.js"),"owner load order")
need("global-quote-router-406514.js" not in index,"failed .514 router loaded")
need("graph-owner-handshake-406515.js" not in index,"failed .515 handshake loaded")
need('const state={displayCurrency:"EUR",executionInstrument:"BTC-EUR",settlementAsset:"EUR"}' in quote,"EUR default changed")
need('const BUILD="40.6.520"' in module,"module build")
need("vs_currency=usd" in module,"native USD source missing")
need("CoinGecko market_chart USD" in module,"USD source truth missing")
need("USD:${String(f||" in module,"USD cache isolation missing")
need("single:${x[0]}:${p}:USD" in module,"USD context isolation missing")
need("browser_eur_to_usd_conversion:false" in module,"no-conversion contract")
need("stablecoins_relabelled_as_usd:false" in module,"stablecoin truth")
need("agent-crypto:quote-architecture-changed" in module,"currency event missing")

def blob(path):
    return subprocess.check_output(["git","hash-object",str(path)],text=True).strip()

hashes={
    "app":blob(ADMIN/"app.js"),
    "quote":blob(ADMIN/"js/quote-currency-architecture-406497.js"),
    "currency_domain":blob(ADMIN/"js/currency-domain-v2-406517.js"),
    "market_fiche":blob(ADMIN/"js/market-fiche-display-406518.js"),
    "oracle_aether":blob(ADMIN/"js/oracle-aether-display-406519.js"),
    "aether":blob(ADMIN/"js/aether.js"),
    "candles":blob(ADMIN/"js/market-microscope-candles-406498.js"),
    "depth":blob(ADMIN/"js/okx-microstructure-406499.js"),
}
need(hashes["app"]=="3507514b8a90366a7ca1b5d86e5cf3f700be31ab","app.js changed")
need(hashes["quote"]=="4495120737a24e7404dc71c9451220ace630d5c7","quote architecture changed")
need(hashes["currency_domain"]=="f057f588a914d1602179c288dd6303888cfd75ce","Currency Domain V2 changed")
need(hashes["market_fiche"]=="8fb3a066b7e2bc492a2c7234b43a3e08ac7ed533","Market/Fiche changed")
need(hashes["oracle_aether"]=="2d43bc7913c6f7000417e62b99d4ee2e9e05a701","Oracle/Aether owner changed")
need(hashes["aether"]=="143cbc3dd81690b551afe07156bafecec626d88b","Aether changed")
need(hashes["candles"]=="ea2ef80af94fa6e2be539886287c7f754025fe9b","candles changed")
need(hashes["depth"]=="2238da8a84fa21ac054ab1357f500d94476c1b43","depth changed")

scope=build.get("graph_native_usd_406520") or {}
need(scope.get("enabled") is True,"scope")
need(scope.get("usd_historical_source")=="CoinGecko market_chart?vs_currency=usd","USD source")
need(scope.get("currency_aware_cache") is True and scope.get("currency_aware_context") is True,"cache/context")
need(scope.get("browser_eur_to_usd_conversion") is False,"conversion")
need(scope.get("stablecoins_are_distinct_from_usd") is True,"stablecoin truth")
need(scope.get("app_js_changed") is False,"app.js scope")
need(scope.get("depth_changed") is False and scope.get("candles_changed") is False,"depth/candles protection")
need(scope.get("strategy_changed") is False and scope.get("backend_changed") is False and scope.get("bridge_changed") is False,"strategy/backend/bridge protection")

print(json.dumps({
  "ok":True,
  "build":"40.6.520",
  "release":"GRAPH NATIVE USD SOURCE · CURRENCY-AWARE CACHE/CONTEXT",
  "usd_source":"CoinGecko market_chart?vs_currency=usd",
  "market_core":"38.15.11",
  "protected_hashes":hashes,
  "terrain":"PENDING_FIREFOX"
},ensure_ascii=False))
