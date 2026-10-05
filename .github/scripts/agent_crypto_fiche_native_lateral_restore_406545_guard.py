#!/usr/bin/env python3
from pathlib import Path
import json, sys

root=Path(__file__).resolve().parents[2]
admin=root/"public/agent_crypto_erith_ia/administrator"
app=(admin/"app.js").read_text(encoding="utf-8")
css=(admin/"style.css").read_text(encoding="utf-8")
aether=(admin/"js/aether-role-visibility.js").read_text(encoding="utf-8")
build=json.loads((admin/"build.json").read_text(encoding="utf-8"))
html=(admin/"index.html").read_text(encoding="utf-8")
errors=[]

def need(ok,msg):
    if not ok: errors.append(msg)

# Native 28.3.46-28.3.48 owner must still be present.
for token in [
 'const ATLAS_MARKET_CARD_MODE_KEY = "agent_crypto_erith_ia_market_card_mode_v1";',
 'function atlasMarketCardDockAvailability()',
 'function atlasMarketCardDockHost()',
 'function atlasRenderMarketCardDock(target, definition)',
 'function atlasSetMarketCardMode(mode)',
 'data-market-card-mode="floating"',
 'data-market-card-mode="dock"',
 'grid.classList.add("market-card-dock-active")'
]:
    need(token in app,f"native app contract missing: {token}")

# Exact restored geometry must still exist.
for token in [
 'BUILD 40.1.2 — FICHE CRYPTO LATERAL DOCK RESTORE LOCK',
 '.market-workspace-grid.market-card-dock-active.math-dock-rail',
 'minmax(980px, 1fr)',
 'minmax(320px, 390px)',
 '#atlasMarketCardDockHost.atlas-market-card-dock-host',
 'position: sticky',
 'overflow-y: auto',
 'scrollbar-gutter: stable'
]:
    need(token in css,f"historical CSS missing: {token}")

# Later competing portal must be retired.
need('build: "40.6.545"' in aether,"restore marker missing")
need('strategy: "native-app-js-only"' in aether,"native owner marker missing")
need('body_tail_portal: false' in aether,"body-tail portal not retired")
need('extra_document_event_listeners: false' in aether,"extra event listener marker")
need('document.body.append(layer)' not in aether,"body-tail append survived")
need('EVENT_TYPES = ["pointerover", "focusin", "click", "keydown"]' not in aether,"competing event listeners survived")
need('function promote(reason = "operator-market-fiche")' not in aether,"competing promote function survived")

need(build.get("build")=="40.6.545","build truth")
need(build.get("parent_build")=="40.6.544","parent truth")
need(build.get("market_core")=="38.15.11","Market Core changed")
scope=build.get("fiche_crypto_native_lateral_restore_406545") or {}
need(scope.get("native_owner")=="administrator/app.js","native owner truth")
need(scope.get("body_tail_portal") is False,"portal truth")
need(scope.get("lateral_restored") is True,"lateral restore truth")
need(scope.get("logos_changed") is False,"logo scope crossed")
need("Build 40.6.545 · Administrator" in html,"index build badge")
need((admin/"index-40.6.545.html").exists(),"versioned index missing")

if errors:
    print("FICHE_CRYPTO_NATIVE_LATERAL_RESTORE_406545_GUARD_FAIL")
    for e in errors: print(" -",e)
    sys.exit(1)

print("FICHE_CRYPTO_NATIVE_LATERAL_RESTORE_406545_GUARD_PASS")
print(" native_owner=app.js")
print(" restored_from=28.3.46+28.3.47+28.3.48+40.1.2")
print(" competing_body_tail_portal=retired")
print(" market_core=38.15.11")
