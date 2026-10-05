#!/usr/bin/env python3
from pathlib import Path
import json, subprocess

root=Path(__file__).resolve().parents[2]
admin=root/"public/agent_crypto_erith_ia/administrator"
owner=admin/"js/new-listings-native-category.js"
build=json.loads((admin/"build.json").read_text(encoding="utf-8"))
html=(admin/"index.html").read_text(encoding="utf-8")

expected_blob="f3d3105437fe754bbd1521ca1b3db2602c699704"
actual_blob=subprocess.check_output(["git","hash-object",str(owner)],text=True).strip()
if actual_blob!=expected_blob:
    raise SystemExit(f"FAIL New Listings owner differs from validated 40.6.536: {actual_blob}")

src=owner.read_text(encoding="utf-8")
for forbidden in [
    '/api/v5/public/instruments',
    'fetchOkxRecent',
    'discovery_sources:Object.freeze(["Bitget","OKX"])',
    'live_refresh:true',
]:
    if forbidden in src:
        raise SystemExit(f"FAIL 40.6.537 discovery V2 residue: {forbidden}")

for required in [
    'discoverBitget?.({days:30})',
    'const MODULE_VERSION="40.6.534";',
    'provider:isCt?"okx":"bitget"' if False else 'const isCt=base==="CT";',
]:
    if required not in src:
        raise SystemExit(f"FAIL missing validated 40.6.536 token: {required}")

if build.get("build")!="40.6.538" or build.get("parent_build")!="40.6.537":
    raise SystemExit("FAIL build truth mismatch")
if build.get("release")!="NEW LISTINGS · DISCOVERY V2 ROLLBACK":
    raise SystemExit("FAIL release name mismatch")
if build.get("market_core")!="38.15.11" or build.get("market_core_modified") is not False:
    raise SystemExit("FAIL Market Core protection")
rb=build.get("new_listings_discovery_v2_rollback_406538") or {}
if rb.get("restored_blob_sha")!=expected_blob or rb.get("okx_discovery_removed") is not True:
    raise SystemExit("FAIL rollback manifest mismatch")
if "Build 40.6.538 · Administrator" not in html:
    raise SystemExit("FAIL index build badge")
if not (admin/"index-40.6.538.html").exists():
    raise SystemExit("FAIL versioned index missing")

print("NEW_LISTINGS_ROLLBACK_406538_GUARD_PASS")
print(" owner_blob="+actual_blob)
print(" rollback_target=40.6.536")
print(" market_core=38.15.11")
