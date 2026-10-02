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
    "build_502": build.get("build")=="40.6.502",
    "parent_501": build.get("parent_build")=="40.6.501",
    "market_core_locked": build.get("market_core")=="38.15.11" and build.get("market_core_modified") is False,
    "index_502": "Build 40.6.502 · Administrator" in index,
    "depth_local_orderbook": 'BACKEND+"/orderbook"' in depth,
    "no_direct_okx_depth": "eea.okx.com" not in depth and "www.okx.com" not in depth,
    "bottom_dock": "depth_bottom_dock:true" in depth and "bottom:8px" in depth,
    "book_tab": 'data-oms-tab="book"' in depth,
    "depth_tab": 'data-oms-tab="depth"' in depth,
    "depth_bands": "[5,10,25]" in depth,
    "candles_zoom_preserved": "function onWheel" in candles and "function onPointerDown" in candles,
    "no_real_order": "real_order:false" in depth,
    "no_wallet": "wallet:false" in depth,
    "no_timer": "recurring_timer:false" in depth,
}
failed=[k for k,v in checks.items() if not v]
for k,v in checks.items():
    print(f"{k}: {'PASS' if v else 'FAIL'}")
if failed:
    raise SystemExit("40.6.502 guard failed: "+", ".join(failed))
print("40.6.502 OKX ORDERBOOK DEPTH DOCK GUARD PASS")
