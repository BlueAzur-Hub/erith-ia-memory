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
    "build_504": build.get("build")=="40.6.504",
    "parent_503": build.get("parent_build")=="40.6.503",
    "market_core_locked": build.get("market_core")=="38.15.11" and build.get("market_core_modified") is False,
    "index_504": "Build 40.6.504 · Administrator" in index,
    "full_panel_inset": "position:absolute;z-index:90;inset:0" in depth,
    "panel_dimming": "atlas-depth-active" in depth and "opacity:.08" in depth,
    "darker_overlay": "rgba(2,10,17,.965)" in depth and "blur(14px)" in depth,
    "larger_title": "font:950 15px/1.08" in depth,
    "larger_kpi": "font:950 13px/1.16" in depth,
    "larger_rows": "font:900 12px/1 ui-monospace" in depth,
    "six_asks": 'rowsHtml(state.asks,"ask",6)' in depth,
    "six_bids": 'rowsHtml(state.bids,"bid",6)' in depth,
    "live_2s": "const LIVE_MS=2000" in depth,
    "open_only_timer": 'timer_scope:"OPEN_ONLY"' in depth,
    "local_orderbook": 'BACKEND+"/orderbook"' in depth,
    "candles_zoom_preserved": "function onWheel" in candles and "function onPointerDown" in candles,
    "no_real_order": "real_order:false" in depth,
    "no_wallet": "wallet:false" in depth,
}
failed=[k for k,v in checks.items() if not v]
for k,v in checks.items():
    print(f"{k}: {'PASS' if v else 'FAIL'}")
if failed:
    raise SystemExit("40.6.504 guard failed: "+", ".join(failed))
print("40.6.504 DEPTH FULL PANEL READABILITY GUARD PASS")
