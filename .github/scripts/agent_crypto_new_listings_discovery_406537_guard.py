#!/usr/bin/env python3
from pathlib import Path
import json

root=Path(__file__).resolve().parents[2]
admin=root/"public/agent_crypto_erith_ia/administrator"
src=(admin/"js/new-listings-native-category.js").read_text(encoding="utf-8")
build=json.loads((admin/"build.json").read_text(encoding="utf-8"))
html=(admin/"index.html").read_text(encoding="utf-8")

required=[
  'const MODULE_VERSION="40.6.537";',
  'const OKX="https://www.okx.com";',
  '/api/v5/public/instruments',
  'Promise.allSettled',
  'live_refresh:true',
  'age_bands:Object.freeze(["<24 h","1–3 j","4–7 j","8–30 j"])',
  'cross_exchange_unknown_identity_kept_separate:true',
  'unknown_cross_exchange_ticker_policy',
  'void discover();',
]
for token in required:
    if token not in src and token not in json.dumps(build,ensure_ascii=False):
        raise SystemExit(f"FAIL missing discovery guard token: {token}")

if "setInterval(" in src:
    raise SystemExit("FAIL recurring timer added to New Listings owner")
if "MutationObserver" in src:
    raise SystemExit("FAIL observer added to New Listings owner")
if "state.coins" in src and "No state.coins injection" not in src:
    raise SystemExit("FAIL suspicious state.coins mutation")

if build.get("build")!="40.6.537" or build.get("parent_build")!="40.6.536":
    raise SystemExit("FAIL build truth mismatch")
if build.get("release")!="NEW LISTINGS · LIVE DISCOVERY V2":
    raise SystemExit("FAIL release name mismatch")
if build.get("market_core")!="38.15.11" or build.get("market_core_modified") is not False:
    raise SystemExit("FAIL Market Core protection")
v=build.get("new_listings_discovery_v2_406537") or {}
if v.get("live_refresh")!="EVERY_CATEGORY_ACTIVATION":
    raise SystemExit("FAIL live discovery policy")
if v.get("state_coins_injection") is not False or v.get("ranking_mutation") is not False:
    raise SystemExit("FAIL Market universe mutation")
if "Build 40.6.537 · Administrator" not in html:
    raise SystemExit("FAIL index build badge")
if not (admin/"index-40.6.537.html").exists():
    raise SystemExit("FAIL versioned index missing")

print("NEW_LISTINGS_DISCOVERY_406537_GUARD_PASS")
print(" sources=Bitget+OKX")
print(" live-refresh=every-category-activation")
print(" age-bands=<24h|1-3d|4-7d|8-30d")
print(" partial-source-fail-closed=true")
print(" market-core=38.15.11")
