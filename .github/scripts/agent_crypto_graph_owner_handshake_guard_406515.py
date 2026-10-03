#!/usr/bin/env python3
from pathlib import Path
import json
import subprocess

ROOT=Path(__file__).resolve().parents[2]
ADMIN=ROOT/"public/agent_crypto_erith_ia/administrator"

def need(value,message):
    if not value:
        raise SystemExit("GRAPH_OWNER_HANDSHAKE_406515_FAIL: "+message)

build=json.loads((ADMIN/"build.json").read_text(encoding="utf-8"))
index=(ADMIN/"index.html").read_text(encoding="utf-8")
archive=(ADMIN/"index-40.6.515.html").read_text(encoding="utf-8")
atlas=(ADMIN/"views/atlas.html").read_text(encoding="utf-8")
router=(ADMIN/"js/global-quote-router-406514.js").read_text(encoding="utf-8")
handshake=(ADMIN/"js/graph-owner-handshake-406515.js").read_text(encoding="utf-8")
loader=(ADMIN/"js/post-boot-runtime-loader.js").read_text(encoding="utf-8")
quote=(ADMIN/"js/quote-currency-architecture-406497.js").read_text(encoding="utf-8")
depth=(ADMIN/"js/okx-microstructure-406499.js").read_text(encoding="utf-8")

need(build.get("build")=="40.6.515","build")
need(build.get("parent_build")=="40.6.514","parent")
need(build.get("release")=="GRAPH OWNER HANDSHAKE · USD COMMIT AFTER RENDER","release")
need(build.get("market_core")=="38.15.11" and build.get("market_core_modified") is False,"market core")
need("Build 40.6.515 · Administrator" in index and "Build 40.6.515 · Administrator" in archive,"entries")
need('administrator-release" content="GRAPH OWNER HANDSHAKE · USD COMMIT AFTER RENDER"' in index,"release meta")
need('global-quote-router-406514.js?v=40.6.515' in index,"router delivery")
need('graph-owner-handshake-406515.js?v=40.6.515' in index,"handshake delivery")
need('post-boot-runtime-loader.js?v=40.6.515' in index,"post-boot cache token")
need(index.index("global-quote-router-406514.js?v=40.6.515") < index.index("graph-owner-handshake-406515.js?v=40.6.515"),"router before handshake")
need('id="atlasStableStackInterface">Build 40.6.515<' in atlas,"atlas interface")
need('const BUILD="40.6.515"' in loader,"loader build")
need('const BUILD="40.6.515"' in router,"router build")
need("function prepareOwnerRender" in router and "function settleOwnerRender" in router,"router owner boundary")
need("ownerEpoch" in router and "expected!==state.ownerEpoch" in router,"stale owner lock")
need('globalThis.AgentCryptoGraphOwnerHandshake?.installed===true' in router,"control handshake route")
need('const BUILD="40.6.515"' in handshake,"handshake build")
for owner in ["atlasRenderChartResult","atlasChartV2RedrawFromBroker","renderComparisonAnalystPanel","atlasScannerRun","atlasExternalChartRender"]:
    need(owner in handshake,f"owner hook {owner}")
need("setInterval(" not in handshake and "new MutationObserver" not in handshake,"no recurring handshake runtime")
need("localStorage" not in handshake and "indexedDB" not in handshake,"no handshake storage")
need("fetch(" not in handshake,"no handshake network")
need('displayCurrency:"USD",executionInstrument:"BTC-EUR",settlementAsset:"EUR"' in quote,"USD default separation")
need('const BUILD="40.6.513"' in depth and 'root.dataset.portalOwner="depth-40.6.513"' in depth,"Depth .513 frozen")
need('if(pair.quote!=="EUR")' in depth,"Depth EUR-native truth preserved")
g=build.get("graph_owner_handshake_406515") or {}
need(g.get("event_driven") is True and g.get("recurring_timer") is False and g.get("mutation_observer") is False,"handshake build truth")
need(g.get("execution_instrument")=="BTC-EUR" and g.get("settlement_asset")=="EUR","execution/settlement")
need(g.get("oracle_changed") is False and g.get("aether_changed") is False and g.get("depth_changed") is False,"protected owners")
app_sha=subprocess.check_output(["git","hash-object",str(ADMIN/"app.js")],text=True).strip()
need(app_sha=="3507514b8a90366a7ca1b5d86e5cf3f700be31ab","protected app.js changed")
print(json.dumps({
    "ok":True,
    "build":"40.6.515",
    "market_core":"38.15.11",
    "default_display":"USD",
    "execution":"BTC-EUR",
    "settlement":"EUR",
    "handshake":"OWNER_PREPARE_RENDER_SETTLE_DISPLAY",
    "app_js_sha":app_sha,
    "terrain":"PENDING_FIREFOX"
},ensure_ascii=False))
