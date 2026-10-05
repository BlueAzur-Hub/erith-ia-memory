#!/usr/bin/env python3
from pathlib import Path
import json

root=Path(__file__).resolve().parents[2]
admin=root/"public/agent_crypto_erith_ia/administrator"
src=(admin/"js/new-listings-native-category.js").read_text(encoding="utf-8")
build=json.loads((admin/"build.json").read_text(encoding="utf-8"))
html=(admin/"index.html").read_text(encoding="utf-8")

required=[
  'const MODULE_VERSION="40.6.540";',
  'const DISCOVERY_COOLDOWN_MS=15000;',
  'const IDENTITY_FAILURE_TTL_MS=8000;',
  'IDENTITY_RETRY_DELAYS=Object.freeze([0,320,900])',
  'function radarProof',
  'status=launchOk&&priceOk&&volumeOk?"CONFIRMÉ":"CANDIDAT"',
  'function recomputeRadarStatus',
  'async function discover({force=false}={})',
  'void discover({force:false});',
  'Radar Bitget',
  'identity_sequential_retry:true',
  'safe_radar:true',
  'discoverBitget?.({days:30})'
]
for token in required:
    if token not in src:
        raise SystemExit(f"FAIL missing 40.6.540 token: {token}")

for forbidden in [
  '/api/v5/public/instruments',
  'fetchOkxRecent',
  'setInterval(',
  'MutationObserver'
]:
    if forbidden in src:
        raise SystemExit(f"FAIL forbidden safe-radar behavior: {forbidden}")

if build.get("build")!="40.6.540" or build.get("parent_build")!="40.6.539":
    raise SystemExit("FAIL build truth mismatch")
if build.get("release")!="NEW LISTINGS · SAFE RADAR":
    raise SystemExit("FAIL release name mismatch")
if build.get("market_core")!="38.15.11" or build.get("market_core_modified") is not False:
    raise SystemExit("FAIL Market Core protection")

radar=build.get("new_listings_safe_radar_406540") or {}
if radar.get("discovery_provider")!="Bitget SPOT instruments launchTime":
    raise SystemExit("FAIL discovery provider changed")
if radar.get("secondary_exchange_discovery") is not False or radar.get("okx_listtime_discovery") is not False:
    raise SystemExit("FAIL secondary discovery enabled")
if radar.get("price_pipeline_changed") is not False or radar.get("graph_owner_changed") is not False:
    raise SystemExit("FAIL protected pipeline changed")
if radar.get("identity_fetch_mode")!="SEQUENTIAL_WITH_RETRY":
    raise SystemExit("FAIL identity retry mode")
if radar.get("identity_failure_non_blocking") is not True:
    raise SystemExit("FAIL identity failure policy")

if "Build 40.6.540 · Administrator" not in html:
    raise SystemExit("FAIL index build badge")
if not (admin/"index-40.6.540.html").exists():
    raise SystemExit("FAIL versioned index missing")

print("NEW_LISTINGS_SAFE_RADAR_406540_GUARD_PASS")
print(" discovery=Bitget-launchTime-only")
print(" refresh=category-open-cooldown-15s")
print(" confirmed=launchTime+price+positive-volume")
print(" candidate=incomplete-market-proof")
print(" identity=sequential-retry")
print(" market-core=38.15.11")
