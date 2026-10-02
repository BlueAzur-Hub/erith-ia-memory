#!/usr/bin/env python3
from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[2]
ADMIN=ROOT/"public/agent_crypto_erith_ia/administrator"
build=json.loads((ADMIN/"build.json").read_text(encoding="utf-8"))
index=(ADMIN/"index.html").read_text(encoding="utf-8")
depth=(ADMIN/"js/okx-microstructure-406499.js").read_text(encoding="utf-8")
candles=(ADMIN/"js/market-microscope-candles-406498.js").read_text(encoding="utf-8")

checks={
    "build_506": build.get("build")=="40.6.506",
    "parent_505": build.get("parent_build")=="40.6.505",
    "market_core_locked": build.get("market_core")=="38.15.11" and build.get("market_core_modified") is False,
    "index_506": "Build 40.6.506 · Administrator" in index,
    "always_body_portal": 'document.body.appendChild(root)' in depth and 'root.dataset.portalOwner="depth-40.6.506"' in depth,
    "dock_rect_mirror": "function dockRect()" in depth and "getBoundingClientRect" in depth and "function applyDockRect()" in depth,
    "no_panel_reparent": 'panel.appendChild(root)' not in depth,
    "graph_parent_never_moved": "graph_parent_never_moved:true" in depth,
    "pointer_isolated": "event.stopPropagation()" in depth,
    "drag_handlers": "function onDragStart" in depth and "function onDragMove" in depth and "function onDragEnd" in depth,
    "local_orderbook": 'BACKEND+"/orderbook"' in depth,
    "live_2s": "const LIVE_MS=2000" in depth,
    "candles_zoom_preserved": "function onWheel" in candles and "function onPointerDown" in candles,
    "no_real_order": "real_order:false" in depth,
    "no_wallet": "wallet:false" in depth,
}
failed=[k for k,v in checks.items() if not v]
for k,v in checks.items():
    print(f"{k}: {'PASS' if v else 'FAIL'}")
if failed:
    raise SystemExit("40.6.506 guard failed: "+", ".join(failed))
print("40.6.506 INDEPENDENT DEPTH PORTAL GUARD PASS")
