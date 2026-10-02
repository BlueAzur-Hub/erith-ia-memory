#!/usr/bin/env python3
from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[2]
ADMIN=ROOT/"public/agent_crypto_erith_ia/administrator"
build=json.loads((ADMIN/"build.json").read_text(encoding="utf-8"))
index=(ADMIN/"index.html").read_text(encoding="utf-8")
atlas=(ADMIN/"views/atlas.html").read_text(encoding="utf-8")
depth=(ADMIN/"js/okx-microstructure-406499.js").read_text(encoding="utf-8")

checks={
    "build_508": build.get("build")=="40.6.508",
    "parent_507": build.get("parent_build")=="40.6.507",
    "market_core_locked": build.get("market_core")=="38.15.11" and build.get("market_core_modified") is False,
    "index_508": "Build 40.6.508 · Administrator" in index,
    "atlas_interface_truth": 'id="atlasStableStackInterface">Build 40.6.508<' in atlas,
    "atlas_control_truth": 'id="atlasStableStackControl">V2.3.2R19<' in atlas,
    "atlas_bridge_truth": 'id="atlasStableStackBridge">V1.9.13 · non détecté<' in atlas,
    "stale_interface_removed": "Build 39.7.0" not in atlas,
    "stale_control_removed": "V2.3.2R13" not in atlas,
    "stale_bridge_removed": "V1.9.11" not in atlas,
    "depth_507_behavior_preserved": 'native_window_control_strip:true' in depth and 'exact_lecture_technique_dock_sync:true' in depth,
    "body_portal_preserved": 'document.body.appendChild(root)' in depth,
    "no_real_order": build.get("real_order") is False,
}
failed=[k for k,v in checks.items() if not v]
for k,v in checks.items():
    print(f"{k}: {'PASS' if v else 'FAIL'}")
if failed:
    raise SystemExit("40.6.508 guard failed: "+", ".join(failed))
print("40.6.508 FINAL ADMIN TRUTH FREEZE GUARD PASS")
