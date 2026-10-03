#!/usr/bin/env python3
from pathlib import Path
import json, subprocess

ROOT=Path(__file__).resolve().parents[2]
ADMIN=ROOT/"public/agent_crypto_erith_ia/administrator"

def need(v,m):
    if not v:
        raise SystemExit("ROLLBACK_SAFE_406516_FAIL: "+m)

build=json.loads((ADMIN/"build.json").read_text(encoding="utf-8"))
index=(ADMIN/"index.html").read_text(encoding="utf-8")
archive=(ADMIN/"index-40.6.516.html").read_text(encoding="utf-8")
quote=(ADMIN/"js/quote-currency-architecture-406497.js").read_text(encoding="utf-8")
loader=(ADMIN/"js/post-boot-runtime-loader.js").read_text(encoding="utf-8")
atlas=(ADMIN/"views/atlas.html").read_text(encoding="utf-8")
depth=(ADMIN/"js/okx-microstructure-406499.js").read_text(encoding="utf-8")

need(build.get("build")=="40.6.516","build")
need(build.get("parent_build")=="40.6.515","parent")
need(build.get("release")=="ROLLBACK SAFE CHECKPOINT · RESTORE 40.6.513 RUNTIME","release")
need(build.get("market_core")=="38.15.11" and build.get("market_core_modified") is False,"market core")
need("Build 40.6.516 · Administrator" in index and "Build 40.6.516 · Administrator" in archive,"entries")
need('administrator-release" content="ROLLBACK SAFE CHECKPOINT · RESTORE 40.6.513 RUNTIME"' in index,"release meta")
need("global-quote-router-406514.js" not in index,"failed 40.6.514 router still loaded")
need("graph-owner-handshake-406515.js" not in index,"failed 40.6.515 handshake still loaded")
need('const state={displayCurrency:"EUR",executionInstrument:"BTC-EUR",settlementAsset:"EUR"}' in quote,"stable EUR default")
need('const BUILD="40.6.516"' in loader,"loader build")
need('id="atlasStableStackInterface">Build 40.6.516<' in atlas,"atlas interface")
need('const BUILD="40.6.513"' in depth and 'root.dataset.portalOwner="depth-40.6.513"' in depth,"Depth .513")
need('if(pair.quote!=="EUR")' in depth,"Depth native EUR")
rb=build.get("rollback_safe_406516") or {}
need(rb.get("rollback_target_runtime")=="40.6.513","rollback target")
need(rb.get("failed_global_quote_router_loaded") is False and rb.get("failed_graph_owner_handshake_loaded") is False,"failed runtime disabled")
need(rb.get("default_display_currency")=="EUR","rollback display")
need(rb.get("execution_instrument")=="BTC-EUR" and rb.get("settlement_asset")=="EUR","execution separation")
need(rb.get("depth_changed") is False and rb.get("oracle_changed") is False and rb.get("aether_changed") is False,"protected owners")
quote_sha=subprocess.check_output(["git","hash-object",str(ADMIN/"js/quote-currency-architecture-406497.js")],text=True).strip()
app_sha=subprocess.check_output(["git","hash-object",str(ADMIN/"app.js")],text=True).strip()
need(quote_sha=="4495120737a24e7404dc71c9451220ace630d5c7","quote architecture not exact 40.6.513 baseline")
need(app_sha=="3507514b8a90366a7ca1b5d86e5cf3f700be31ab","app.js changed")
print(json.dumps({
  "ok":True,
  "build":"40.6.516",
  "rollback_runtime":"40.6.513",
  "default_display":"EUR",
  "market_core":"38.15.11",
  "quote_sha":quote_sha,
  "app_sha":app_sha,
  "terrain":"PENDING_FIREFOX"
},ensure_ascii=False))
