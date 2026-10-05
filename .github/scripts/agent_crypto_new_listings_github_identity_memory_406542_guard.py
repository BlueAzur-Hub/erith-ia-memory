#!/usr/bin/env python3
from pathlib import Path
import json, re, sys

root=Path(__file__).resolve().parents[2]
admin=root/"public/agent_crypto_erith_ia/administrator"
src=(admin/"js/new-listings-native-category.js").read_text(encoding="utf-8")
html=(admin/"index.html").read_text(encoding="utf-8")
build=json.loads((admin/"build.json").read_text(encoding="utf-8"))
registry=json.loads((admin/"data/new-listings-identities.json").read_text(encoding="utf-8"))

errors=[]
def need(ok,msg):
    if not ok: errors.append(msg)

need('const MODULE_VERSION="40.6.542";' in src,"owner version mismatch")
need('IDENTITY_REGISTRY_URL="./data/new-listings-identities.json"' in src,"registry URL missing")
need("function loadIdentityRegistry" in src,"registry loader missing")
need("GitHub identity memory" in src,"GitHub identity source missing")
need("identity_github_registry_primary:true" in src,"self-test registry primary missing")
need("identity_embedded_logos:true" in src,"embedded logo self-test missing")
need("identity_retry_storm_removed:true" in src,"retry-storm guard missing")
need("fetchCoinGeckoIdentityFallback" not in src,"individual CoinGecko fallback survived")
need("IDENTITY_FALLBACK_RETRY_DELAYS" not in src,"individual retry delays survived")
need("localStorage" not in src and "indexedDB" not in src,"identity owner unexpectedly writes browser storage")
need("AtlasExternalChart?.present" in src,"public graph owner API missing")
need("__atlasExternalChartContext" not in src,"private graph context access returned")

need(registry.get("schema")=="agent_crypto_new_listings_identity_registry_v1","registry schema mismatch")
need(registry.get("version")=="40.6.542","registry version mismatch")
ids=registry.get("identities") or {}
expected={"concrete":"CT","magic-hash":"MHA","marscat-token":"MCAT","pons":"PONS","canopy":"CNPY"}
need(set(ids)==set(expected),"registry identity set mismatch")
for cg,symbol in expected.items():
    row=ids.get(cg) or {}
    need(row.get("symbol")==symbol,f"{cg}: symbol mismatch")
    need(row.get("coingeckoId")==cg,f"{cg}: CoinGecko id mismatch")
    need(row.get("verified") is True,f"{cg}: not verified")
    image=str(row.get("image") or "")
    need(image.startswith("data:image/png;base64,"),f"{cg}: embedded PNG missing")
    need(len(image)>500,f"{cg}: embedded PNG suspiciously small")

need(build.get("build")=="40.6.542","build truth mismatch")
need(build.get("parent_build")=="40.6.541","parent build mismatch")
need(build.get("release")=="NEW LISTINGS · GITHUB IDENTITY MEMORY","release name mismatch")
need(build.get("market_core")=="38.15.11","Market Core changed")
need(build.get("market_core_modified") is False,"Market Core marked modified")
identity=build.get("new_listings_github_identity_memory_406542") or {}
need(identity.get("registry")=="data/new-listings-identities.json","build registry path mismatch")
need(identity.get("retry_storm_removed") is True,"build retry storm flag missing")
need(identity.get("discovery_changed") is False,"Bitget discovery marked changed")
need(identity.get("price_pipeline_changed") is False,"price pipeline marked changed")
need(identity.get("graph_owner_changed") is False,"graph owner marked changed")

need("Build 40.6.542 · Administrator" in html,"index build badge missing")
need((admin/"index-40.6.542.html").exists(),"versioned index missing")

if errors:
    print("NEW_LISTINGS_GITHUB_IDENTITY_MEMORY_406542_GUARD_FAIL")
    for e in errors: print(" -",e)
    sys.exit(1)

print("NEW_LISTINGS_GITHUB_IDENTITY_MEMORY_406542_GUARD_PASS")
print(" identity_owner=GitHub static registry")
print(" known_identities=5")
print(" embedded_logos=5")
print(" individual_retry_storm=removed")
print(" live_market_pipeline=unchanged")
print(" market_core=38.15.11")
