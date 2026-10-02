#!/usr/bin/env python3
from pathlib import Path
import json
import re

ROOT=Path(__file__).resolve().parents[2]
ADMIN=ROOT/"public/agent_crypto_erith_ia/administrator"

build=json.loads((ADMIN/"build.json").read_text(encoding="utf-8"))
index=(ADMIN/"index.html").read_text(encoding="utf-8")
archive=(ADMIN/"index-40.6.509.html").read_text(encoding="utf-8")
atlas=(ADMIN/"views/atlas.html").read_text(encoding="utf-8")
loader=(ADMIN/"js/post-boot-runtime-loader.js").read_text(encoding="utf-8")
depth=(ADMIN/"js/okx-microstructure-406499.js").read_text(encoding="utf-8")

checks={
    "build_509": build.get("build")=="40.6.509",
    "parent_508": build.get("parent_build")=="40.6.508",
    "release_truth": build.get("release")=="ADMIN ENTRY META TRUTH SYNC",
    "market_core_locked": build.get("market_core")=="38.15.11" and build.get("market_core_modified") is False,
    "index_509": 'Build 40.6.509 · Administrator' in index,
    "archive_509": 'Build 40.6.509 · Administrator' in archive,
    "meta_release_fixed": '<meta name="administrator-release" content="ADMIN ENTRY META TRUTH SYNC" />' in index,
    "stale_meta_removed": '<meta name="administrator-release" content="OKX MICROSTRUCTURE" />' not in index,
    "atlas_interface_truth": 'id="atlasStableStackInterface">Build 40.6.509<' in atlas,
    "atlas_control_truth": 'id="atlasStableStackControl">V2.3.2R19<' in atlas,
    "atlas_bridge_truth": 'id="atlasStableStackBridge">V1.9.13 · non détecté<' in atlas,
    "loader_build_truth": 'const BUILD="40.6.509"' in loader,
    "depth_507_behavior_preserved": 'native_window_control_strip:true' in depth and 'exact_lecture_technique_dock_sync:true' in depth,
    "body_portal_preserved": 'document.body.appendChild(root)' in depth,
    "no_real_order": build.get("real_order") is False,
    "no_new_timer": build.get("new_recurring_timer") is False,
    "no_new_observer": build.get("new_observer") is False,
}

failed=[k for k,v in checks.items() if not v]
for k,v in checks.items():
    print(f"{k}: {'PASS' if v else 'FAIL'}")
if failed:
    raise SystemExit("40.6.509 guard failed: "+", ".join(failed))
print("40.6.509 ADMIN ENTRY META TRUTH SYNC GUARD PASS")
