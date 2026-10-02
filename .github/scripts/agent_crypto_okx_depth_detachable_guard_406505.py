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
    "build_505": build.get("build")=="40.6.505",
    "parent_504": build.get("parent_build")=="40.6.504",
    "market_core_locked": build.get("market_core")=="38.15.11" and build.get("market_core_modified") is False,
    "index_505": "Build 40.6.505 · Administrator" in index,
    "detach_button": "Décrocher ↗" in depth and "Replacer ▣" in depth,
    "document_level_detach": "document.body.appendChild(root)" in depth,
    "detached_fixed": "position:fixed;inset:auto;z-index:1600" in depth,
    "drag_handlers": "function onDragStart" in depth and "function onDragMove" in depth and "function onDragEnd" in depth,
    "resize_detached": "resize:both" in depth,
    "restore_lecture": "state.open&&!state.detached" in depth and "detach_restores_lecture_technique:true" in depth,
    "image_visible_docked": "detail-project-visual{opacity:.72" in depth,
    "native_text_behind": "opacity:.20!important" in depth,
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
    raise SystemExit("40.6.505 guard failed: "+", ".join(failed))
print("40.6.505 DETACHABLE DEPTH GLASS GUARD PASS")
