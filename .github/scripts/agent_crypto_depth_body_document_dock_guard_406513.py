#!/usr/bin/env python3
from pathlib import Path
import json,re

ROOT=Path(__file__).resolve().parents[2]
ADMIN=ROOT/"public/agent_crypto_erith_ia/administrator"

build=json.loads((ADMIN/"build.json").read_text(encoding="utf-8"))
index=(ADMIN/"index.html").read_text(encoding="utf-8")
archive=(ADMIN/"index-40.6.513.html").read_text(encoding="utf-8")
atlas=(ADMIN/"views/atlas.html").read_text(encoding="utf-8")
loader=(ADMIN/"js/post-boot-runtime-loader.js").read_text(encoding="utf-8")
depth=(ADMIN/"js/okx-microstructure-406499.js").read_text(encoding="utf-8")

snap=re.search(r"function snapToLectureTechnique\(\)\{(?P<body>.*?)\n  \}\n  function applyPlacement",depth,re.S)
snap_body=snap.group("body") if snap else ""

checks={
    "build_513": build.get("build")=="40.6.513",
    "parent_512": build.get("parent_build")=="40.6.512",
    "release_truth": build.get("release")=="DEPTH BODY DOCUMENT DOCK · RESTORE + CORRECT",
    "market_core_locked": build.get("market_core")=="38.15.11" and build.get("market_core_modified") is False,
    "index_513": "Build 40.6.513 · Administrator" in index,
    "archive_513": "Build 40.6.513 · Administrator" in archive,
    "meta_release": '<meta name="administrator-release" content="DEPTH BODY DOCUMENT DOCK · RESTORE + CORRECT" />' in index,
    "atlas_interface_truth": 'id="atlasStableStackInterface">Build 40.6.513<' in atlas,
    "loader_build_truth": 'const BUILD="40.6.513"' in loader,
    "depth_build_truth": 'const BUILD="40.6.513"' in depth,
    "body_portal_mount": "document.body.appendChild(root)" in depth,
    "body_portal_owner": 'root.dataset.portalOwner="depth-40.6.513"' in depth,
    "snap_exists": bool(snap),
    "docked_absolute_not_fixed": 'position:"absolute"' in snap_body and 'position:"fixed"' not in snap_body,
    "document_scroll_coordinates": "r.left+scrollX" in depth and "r.top+scrollY" in depth,
    "snap_keeps_body_parent": "root.parentElement!==document.body" in snap_body and "document.body.appendChild(root)" in snap_body,
    "never_child_docked": "dockIntoLectureTechnique" not in depth and "panel.appendChild(root)" not in depth,
    "no_dock_timer": "dockSyncTimer" not in depth and "startDockSync" not in depth and "stopDockSync" not in depth,
    "no_180ms_follow_loop": "setInterval" not in depth,
    "no_scroll_follow_handler": 'window.addEventListener("scroll"' not in depth,
    "resize_is_bounded_resnap": 'else if(state.open)snapToLectureTechnique()' in depth,
    "detached_fixed": 'Object.assign(root.style,{position:"fixed",left:state.floatX+"px"' in depth,
    "native_controls": all(token in depth for token in ("data-oms-move","data-oms-minimize","data-oms-detach","data-oms-maximize","data-oms-close")),
    "independent_contract": "body_portal_docked_and_detached:true" in depth and "document_coordinate_dock:true" in depth,
    "natural_scroll_contract": "scroll_moves_naturally_with_document:true" in depth,
    "freshness_510_preserved": all(token in depth for token in ('"FRESH"','"STALE"','"OFFLINE"','"UNKNOWN"',"FRESH_MAX_AGE_MS")),
    "dynamic_units_preserved": 'Cumul ${esc(state.loadedAsset||state.requestedAsset||state.asset)}' in depth,
    "live_poll_preserved": 'const LIVE_MS=2000;' in depth,
    "no_real_order": build.get("real_order") is False,
    "no_new_timer": build.get("depth_body_document_dock_406513",{}).get("new_recurring_timer") is False,
    "no_new_observer": build.get("depth_body_document_dock_406513",{}).get("new_observer") is False,
}

failed=[k for k,v in checks.items() if not v]
for k,v in checks.items():
    print(f"{k}: {'PASS' if v else 'FAIL'}")
if failed:
    raise SystemExit("40.6.513 guard failed: "+", ".join(failed))
print("40.6.513 DEPTH BODY DOCUMENT DOCK · RESTORE + CORRECT GUARD PASS")
