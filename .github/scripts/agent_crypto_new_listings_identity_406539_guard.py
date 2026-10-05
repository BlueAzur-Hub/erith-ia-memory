#!/usr/bin/env python3
from pathlib import Path
import json

root=Path(__file__).resolve().parents[2]
admin=root/"public/agent_crypto_erith_ia/administrator"
src=(admin/"js/new-listings-native-category.js").read_text(encoding="utf-8")
build=json.loads((admin/"build.json").read_text(encoding="utf-8"))
html=(admin/"index.html").read_text(encoding="utf-8")

required=[
  'const MODULE_VERSION="40.6.539";',
  'const COINGECKO="https://api.coingecko.com/api/v3";',
  'coingeckoId:"concrete"',
  'coingeckoId:"magic-hash"',
  'coingeckoId:"marscat-token"',
  'coingeckoId:"pons"',
  'coingeckoId:"canopy"',
  'function safeCoinGeckoImage',
  'function fetchCoinGeckoIdentity',
  'function enrichKnownIdentities',
  'sameId',
  'sameSymbol',
  'image:safeCoinGeckoImage(spec.image)||null',
  'const logo=coin?.image?',
  'identity_logos:true',
  'discoverBitget?.({days:30})'
]
for token in required:
    if token not in src:
        raise SystemExit(f"FAIL missing 40.6.539 token: {token}")

for forbidden in [
  '/api/v5/public/instruments',
  'fetchOkxRecent',
  'setInterval(',
  'MutationObserver'
]:
    if forbidden in src:
        raise SystemExit(f"FAIL forbidden New Listings behavior: {forbidden}")

if build.get("build")!="40.6.539" or build.get("parent_build")!="40.6.538":
    raise SystemExit("FAIL build truth mismatch")
if build.get("release")!="NEW LISTINGS · IDENTITY + LOGOS":
    raise SystemExit("FAIL release name mismatch")
if build.get("market_core")!="38.15.11" or build.get("market_core_modified") is not False:
    raise SystemExit("FAIL Market Core protection")

identity=build.get("new_listings_identity_logos_406539") or {}
if identity.get("discovery_changed") is not False:
    raise SystemExit("FAIL discovery changed")
if identity.get("price_pipeline_changed") is not False:
    raise SystemExit("FAIL price pipeline changed")
if identity.get("failure_policy")!="IDENTITY_FETCH_FAILURE_DOES_NOT_BLOCK_LISTING_PRICE_OR_DISCOVERY":
    raise SystemExit("FAIL identity failure policy")
if identity.get("mapped_assets")!={"CT":"concrete","MHA":"magic-hash","MCAT":"marscat-token","PONS":"pons","CNPY":"canopy"}:
    raise SystemExit("FAIL canonical identity map")
if "Build 40.6.539 · Administrator" not in html:
    raise SystemExit("FAIL index build badge")
if not (admin/"index-40.6.539.html").exists():
    raise SystemExit("FAIL versioned index missing")

print("NEW_LISTINGS_IDENTITY_406539_GUARD_PASS")
print(" discovery=unchanged-bitget-launchTime")
print(" canonical-proof=id+symbol")
print(" logos=coingecko-https-only")
print(" failure-policy=non-blocking")
print(" market-core=38.15.11")
