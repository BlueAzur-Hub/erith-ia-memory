#!/usr/bin/env python3
from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[2]
ADMIN=ROOT/"public/agent_crypto_erith_ia/administrator"
build=json.loads((ADMIN/"build.json").read_text(encoding="utf-8"))
index=(ADMIN/"index.html").read_text(encoding="utf-8")
depth=(ADMIN/"js/okx-microstructure-406499.js").read_text(encoding="utf-8")

checks={
    "build_507": build.get("build")=="40.6.507",
    "parent_506": build.get("parent_build")=="40.6.506",
    "market_core_locked": build.get("market_core")=="38.15.11" and build.get("market_core_modified") is False,
    "index_507": "Build 40.6.507 · Administrator" in index,
    "native_strip": "admin-native-controls admin-native-controls-native" in depth,
    "native_move": "admin-native-move" in depth and "data-oms-move" in depth,
    "native_minimize": "admin-native-minimize" in depth and "data-oms-minimize" in depth,
    "native_float": "admin-native-float" in depth and "data-oms-detach" in depth,
    "native_maximize": "admin-native-maximize" in depth and "data-oms-maximize" in depth,
    "native_hide": "admin-native-hide" in depth and "data-oms-close" in depth,
    "no_text_detach": "Décrocher ↗" not in depth,
    "dock_sync": "dockSyncTimer" in depth and "setInterval" in depth and "180" in depth,
    "body_portal": 'document.body.appendChild(root)' in depth,
    "graph_static": "graph_parent_never_moved:true" in depth,
    "live_2s": "const LIVE_MS=2000" in depth,
    "no_order": "real_order:false" in depth and "wallet:false" in depth,
}
failed=[k for k,v in checks.items() if not v]
for k,v in checks.items():
    print(f"{k}: {'PASS' if v else 'FAIL'}")
if failed:
    raise SystemExit("40.6.507 guard failed: "+", ".join(failed))
print("40.6.507 NATIVE WINDOW CHROME + EXACT DOCK GUARD PASS")
