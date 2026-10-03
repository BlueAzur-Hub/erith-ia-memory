#!/usr/bin/env python3
from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[2]
ADMIN=ROOT/"public/agent_crypto_erith_ia/administrator"

build=json.loads((ADMIN/"build.json").read_text(encoding="utf-8"))
index=(ADMIN/"index.html").read_text(encoding="utf-8")
archive=(ADMIN/"index-40.6.512.html").read_text(encoding="utf-8")
atlas=(ADMIN/"views/atlas.html").read_text(encoding="utf-8")
loader=(ADMIN/"js/post-boot-runtime-loader.js").read_text(encoding="utf-8")
depth=(ADMIN/"js/okx-microstructure-406499.js").read_text(encoding="utf-8")

checks={
    "build_512": build.get("build")=="40.6.512",
    "parent_511": build.get("parent_build")=="40.6.511",
    "release_truth": build.get("release")=="DEPTH TRUE DOCK · BODY ONLY WHEN DETACHED",
    "market_core_locked": build.get("market_core")=="38.15.11" and build.get("market_core_modified") is False,
    "index_512": "Build 40.6.512 · Administrator" in index,
    "archive_512": "Build 40.6.512 · Administrator" in archive,
    "atlas_interface_truth": 'id="atlasStableStackInterface">Build 40.6.512<' in atlas,
    "loader_build_truth": 'const BUILD="40.6.512"' in loader,
    "depth_build_truth": 'const BUILD="40.6.512"' in depth,
    "real_dock_helper": "function dockIntoLectureTechnique()" in depth,
    "docked_parent_detail_panel": "if(root.parentElement!==panel)panel.appendChild(root);" in depth,
    "docked_absolute": 'position:"absolute"' in depth,
    "detached_parent_body": "if(root.parentElement!==document.body)document.body.appendChild(root);" in depth,
    "detached_fixed": 'position:"fixed"' in depth,
    "body_only_detached_contract": "body_portal_only_when_detached:true" in depth,
    "true_child_contract": "true_lecture_technique_child_dock:true" in depth,
    "docked_contract": "docked_inside_lecture_technique:true" in depth,
    "parent_contract": "docked_parent_is_detail_panel:true" in depth and "detached_parent_is_document_body:true" in depth,
    "no_dock_timer": "dockSyncTimer" not in depth and "startDockSync" not in depth and "stopDockSync" not in depth,
    "no_scroll_follow": 'window.addEventListener("scroll"' not in depth,
    "native_controls": all(token in depth for token in ("data-oms-move","data-oms-minimize","data-oms-detach","data-oms-maximize","data-oms-close")),
    "freshness_510_preserved": all(token in depth for token in ('"FRESH"','"STALE"','"OFFLINE"','"UNKNOWN"',"FRESH_MAX_AGE_MS")),
    "dynamic_units_preserved": 'Cumul ${esc(state.loadedAsset||state.requestedAsset||state.asset)}' in depth,
    "live_poll_preserved": 'const LIVE_MS=2000;' in depth,
    "backend_unchanged": build.get("depth_true_dock_406512",{}).get("backend_changed") is False,
    "bridge_unchanged": build.get("depth_true_dock_406512",{}).get("bridge_changed") is False,
    "no_real_order": build.get("real_order") is False,
}
failed=[k for k,v in checks.items() if not v]
for k,v in checks.items(): print(f"{k}: {'PASS' if v else 'FAIL'}")
if failed: raise SystemExit("40.6.512 guard failed: "+", ".join(failed))
print("40.6.512 DEPTH TRUE DOCK · BODY ONLY WHEN DETACHED GUARD PASS")
