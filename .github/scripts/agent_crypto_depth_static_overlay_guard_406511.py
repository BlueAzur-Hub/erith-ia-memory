#!/usr/bin/env python3
from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[2]
ADMIN=ROOT/"public/agent_crypto_erith_ia/administrator"

build=json.loads((ADMIN/"build.json").read_text(encoding="utf-8"))
index=(ADMIN/"index.html").read_text(encoding="utf-8")
archive=(ADMIN/"index-40.6.511.html").read_text(encoding="utf-8")
atlas=(ADMIN/"views/atlas.html").read_text(encoding="utf-8")
loader=(ADMIN/"js/post-boot-runtime-loader.js").read_text(encoding="utf-8")
depth=(ADMIN/"js/okx-microstructure-406499.js").read_text(encoding="utf-8")

checks={
    "build_511": build.get("build")=="40.6.511",
    "parent_510": build.get("parent_build")=="40.6.510",
    "release_truth": build.get("release")=="DEPTH STATIC OVERLAY · NO FOLLOW LOOP",
    "market_core_locked": build.get("market_core")=="38.15.11" and build.get("market_core_modified") is False,
    "index_511": "Build 40.6.511 · Administrator" in index,
    "archive_511": "Build 40.6.511 · Administrator" in archive,
    "meta_release": '<meta name="administrator-release" content="DEPTH STATIC OVERLAY · NO FOLLOW LOOP" />' in index,
    "atlas_interface_truth": 'id="atlasStableStackInterface">Build 40.6.511<' in atlas,
    "loader_build_truth": 'const BUILD="40.6.511"' in loader,
    "depth_build_truth": 'const BUILD="40.6.511"' in depth,
    "body_portal": 'document.body.appendChild(root)' in depth,
    "one_shot_snap": 'function snapToLectureTechnique()' in depth,
    "dock_target": 'document.getElementById("detailPanel")' in depth,
    "open_or_redock_snap": 'snapToLectureTechnique();' in depth,
    "no_dock_timer_symbol": "dockSyncTimer" not in depth,
    "no_dock_start_stop": "startDockSync" not in depth and "stopDockSync" not in depth,
    "no_180ms_follow_loop": "setInterval" not in depth or "180" not in depth,
    "no_scroll_follow_handler": 'window.addEventListener("scroll"' not in depth,
    "no_resize_follow_when_docked": 'else snapToLectureTechnique()' not in depth,
    "detachable": 'data-oms-detach' in depth and 'setDetached(!state.detached)' in depth,
    "native_controls": all(token in depth for token in ("data-oms-move","data-oms-minimize","data-oms-detach","data-oms-maximize","data-oms-close")),
    "graph_parent_static": "graph_parent_never_moved:true" in depth,
    "one_shot_contract": "one_shot_lecture_technique_snap:true" in depth,
    "no_follow_contract": "no_dock_follow_loop:true" in depth and "no_scroll_follow:true" in depth,
    "freshness_510_preserved": all(token in depth for token in ('"FRESH"','"STALE"','"OFFLINE"','"UNKNOWN"',"FRESH_MAX_AGE_MS")),
    "dynamic_units_preserved": 'Cumul ${esc(state.loadedAsset||state.requestedAsset||state.asset)}' in depth,
    "live_poll_preserved": 'const LIVE_MS=2000;' in depth,
    "backend_unchanged": build.get("depth_static_overlay_406511",{}).get("backend_changed") is False,
    "bridge_unchanged": build.get("depth_static_overlay_406511",{}).get("bridge_changed") is False,
    "no_real_order": build.get("real_order") is False,
    "no_new_timer": build.get("depth_static_overlay_406511",{}).get("new_recurring_timer") is False,
    "no_new_observer": build.get("depth_static_overlay_406511",{}).get("new_observer") is False,
}

failed=[k for k,v in checks.items() if not v]
for k,v in checks.items():
    print(f"{k}: {'PASS' if v else 'FAIL'}")
if failed:
    raise SystemExit("40.6.511 guard failed: "+", ".join(failed))
print("40.6.511 DEPTH STATIC OVERLAY · NO FOLLOW LOOP GUARD PASS")
