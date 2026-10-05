#!/usr/bin/env python3
from pathlib import Path
import json

root=Path(__file__).resolve().parents[2]
admin=root/"public/agent_crypto_erith_ia/administrator"
src=(admin/"js/new-listings-native-category.js").read_text(encoding="utf-8")
build=json.loads((admin/"build.json").read_text(encoding="utf-8"))
html=(admin/"index.html").read_text(encoding="utf-8")

required=[
  'const MODULE_VERSION="40.6.541";',
  'COINGECKO+"/coins/markets"',
  'function fetchCoinGeckoIdentitiesBatch',
  'function fetchCoinGeckoIdentityFallback',
  'IDENTITY_FALLBACK_START_DELAY_MS=1200',
  'IDENTITY_FALLBACK_RETRY_DELAYS=Object.freeze([0,900,2200])',
  'identity_batch_markets:true',
  'identity_individual_fallback:true',
  'identity_exact_id_symbol:true',
  'identity_failure_non_blocking:true',
  'discoverBitget?.({days:30})',
  'Radar Bitget'
]
for token in required:
    if token not in src:
        raise SystemExit(f"FAIL missing 40.6.541 token: {token}")

for forbidden in [
  '/api/v5/public/instruments',
  'fetchOkxRecent',
  'setInterval(',
  'MutationObserver',
  'IDENTITY_RETRY_DELAYS=Object.freeze([0,320,900])',
  'await sleep(140)'
]:
    if forbidden in src:
        raise SystemExit(f"FAIL forbidden 40.6.541 behavior: {forbidden}")

if build.get("build")!="40.6.541" or build.get("parent_build")!="40.6.540":
    raise SystemExit("FAIL build truth mismatch")
if build.get("release")!="NEW LISTINGS · BATCHED IDENTITY":
    raise SystemExit("FAIL release name mismatch")
if build.get("market_core")!="38.15.11" or build.get("market_core_modified") is not False:
    raise SystemExit("FAIL Market Core protection")

identity=build.get("new_listings_batched_identity_406541") or {}
if identity.get("identity_endpoint_primary")!="CoinGecko /coins/markets":
    raise SystemExit("FAIL primary identity endpoint")
if identity.get("identity_fetch_mode")!="ONE_BATCH_THEN_DELAYED_INDIVIDUAL_FALLBACK":
    raise SystemExit("FAIL identity fetch mode")
if identity.get("discovery_changed") is not False:
    raise SystemExit("FAIL discovery changed")
if identity.get("price_pipeline_changed") is not False or identity.get("graph_owner_changed") is not False:
    raise SystemExit("FAIL protected pipeline changed")

if "Build 40.6.541 · Administrator" not in html:
    raise SystemExit("FAIL index build badge")
if not (admin/"index-40.6.541.html").exists():
    raise SystemExit("FAIL versioned index missing")

print("NEW_LISTINGS_BATCHED_IDENTITY_406541_GUARD_PASS")
print("discovery=Bitget-launchTime-only")
print("identity=coins-markets-batch")
print("fallback=unresolved-only-delayed")
print("proof=exact-id+symbol")
print("market-core=38.15.11")
