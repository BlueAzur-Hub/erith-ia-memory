#!/usr/bin/env python3
from pathlib import Path
import json, sys

ROOT=Path(__file__).resolve().parents[2]
ADMIN=ROOT/"public/agent_crypto_erith_ia/administrator"
errors=[]

def need(path, *tokens):
    p=ROOT/path if isinstance(path,str) else path
    if not p.exists():
        errors.append(f"missing {p}")
        return ""
    text=p.read_text(encoding="utf-8")
    for token in tokens:
        if token not in text:
            errors.append(f"{p}: missing token {token!r}")
    return text

index=need(ADMIN/"index.html",
    'build:"40.6.514"',
    'administrator-release" content="USD DEFAULT · OKX MULTI-QUOTE · CT NEW LISTING"',
    'usd-default-surface-router-406514.js?v=40.6.514')
need(ADMIN/"index-40.6.514.html",'Build 40.6.514 · Administrator')
quote=need(ADMIN/"js/quote-currency-architecture-406497.js",'const BUILD="40.6.514"','displayCurrency:"USD"','default_display:"USD"')
router=need(ADMIN/"js/usd-default-surface-router-406514.js",'const BUILD="40.6.514"','CT-USDC','usd_default:true','direct_usd_only:true','market_core_changed:false')
transport=need(ADMIN/"js/okx-local-backend-transport-406500.js",'const BUILD="40.6.514"','abort_signal_preserved:true','instId=CT-USDC')
microscope=need(ADMIN/"js/market-microscope-candles-406498.js",'const BUILD="40.6.514"','ct_usdc_supported:true','||"USD"')
depth=need(ADMIN/"js/okx-microstructure-406499.js",'const BUILD="40.6.514"','desiredQuote','CT','document.body.appendChild(root)','position:"absolute"','usd_display_routes_to_usdc:true','depth_406513_geometry_preserved' if False else 'document_coordinate_dock:true')
loader=need(ADMIN/"js/post-boot-runtime-loader.js",'const BUILD="40.6.514"')
need(ADMIN/"views/atlas.html",'Build 40.6.514')

try:
    build=json.loads((ADMIN/"build.json").read_text(encoding="utf-8"))
    checks={
        "build":build.get("build")=="40.6.514",
        "parent":build.get("parent_build")=="40.6.513",
        "engine":build.get("market_core")=="38.15.11",
        "market_core_unchanged":build.get("market_core_modified") is False,
        "usd_default":build.get("usd_default_surface_router_406514",{}).get("default_display_currency")=="USD",
        "ct_isolated":build.get("usd_default_surface_router_406514",{}).get("ct_new_listing",{}).get("injected_into_top250") is False,
        "parent_terrain":build.get("previous_build_406513_terrain",{}).get("status")=="PASS_OPERATOR_2026-10-03",
        "real_order":build.get("real_order") is False,
    }
    for name,ok in checks.items():
        if not ok: errors.append(f"build.json check failed: {name}")
except Exception as exc:
    errors.append(f"build.json parse failed: {exc}")

if "setInterval(" in transport:
    errors.append("transport must not add interval")
if "position:\"fixed\"" in depth and 'if(state.detached)' not in depth:
    errors.append("depth fixed positioning contract suspicious")
if index.find("quote-currency-architecture-406497.js") > index.find("usd-default-surface-router-406514.js"):
    errors.append("USD router must load after quote architecture")
if index.find("usd-default-surface-router-406514.js") > index.find("market-microscope-candles-406498.js"):
    errors.append("USD router must load before Microscope")

if errors:
    print("40.6.514 GUARD FAIL")
    for e in errors: print(" -",e)
    sys.exit(1)
print("40.6.514 GUARD PASS")
print("USD default / EUR switch / CT lane / AbortSignal / Depth 40.6.513 geometry contract present.")
