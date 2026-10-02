#!/usr/bin/env python3
from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[2]
ADMIN=ROOT/"public/agent_crypto_erith_ia/administrator"
build=json.loads((ADMIN/"build.json").read_text(encoding="utf-8"))
index=(ADMIN/"index.html").read_text(encoding="utf-8")
candles=(ADMIN/"js/market-microscope-candles-406498.js").read_text(encoding="utf-8")
depth=(ADMIN/"js/okx-microstructure-406499.js").read_text(encoding="utf-8")

checks={
    "build_501": build.get("build")=="40.6.501",
    "parent_500": build.get("parent_build")=="40.6.500",
    "market_core_locked": build.get("market_core")=="38.15.11" and build.get("market_core_modified") is False,
    "index_501": "Build 40.6.501 · Administrator" in index,
    "wheel_zoom": "function onWheel" in candles and "wheel_zoom:true" in candles,
    "drag_pan": "function onPointerDown" in candles and "drag_pan:true" in candles,
    "reset_view": "function resetView" in candles,
    "fullspace_padding": "const pad={l:18,r:64,t:42,b:22}" in candles,
    "depth_docked": "depth_docked_overlay:true" in depth and "chart-shell" in depth,
    "depth_help": "BID = meilleur achat" in depth,
    "no_order_candles": "real_order:false" in candles,
    "no_order_depth": "real_order:false" in depth,
}
failed=[k for k,v in checks.items() if not v]
for k,v in checks.items():
    print(f"{k}: {'PASS' if v else 'FAIL'}")
if failed:
    raise SystemExit("40.6.501 guard failed: "+", ".join(failed))
print("40.6.501 MARKET MICROSCOPE UX GUARD PASS")
