#!/usr/bin/env python3
from pathlib import Path
import json, re, sys

ROOT=Path(__file__).resolve().parents[2]
ADMIN=ROOT/"public/agent_crypto_erith_ia/administrator"
INDEX=(ADMIN/"index.html").read_text(encoding="utf-8")
OWNER=(ADMIN/"js/new-listings-native-category.js").read_text(encoding="utf-8")
APP=(ADMIN/"app.js").read_text(encoding="utf-8")
BUILD=json.loads((ADMIN/"build.json").read_text(encoding="utf-8"))

errors=[]
def need(ok,msg):
    if not ok: errors.append(msg)

# Stable runtime ownership: release numbers belong to metadata, not identity.
need("new-listings-native-category.js" in INDEX, "stable New Listings owner is not loaded")
need(re.search(r'new-listings-native-category-\d+\.js', INDEX) is None,
     "versioned New Listings runtime owner is loaded")
need(re.search(r'\bstate\d{3,}\b', OWNER) is None,
     "version-numbered state identifier found")
need(re.search(r'AgentCryptoNewListingsNativeCategory\d+', OWNER) is None,
     "version-numbered public API found")
need("const state={" in OWNER, "canonical state object missing")
need("globalThis.AgentCryptoNewListingsNativeCategory=" in OWNER,
     "canonical public API missing")
need("__atlasExternalChartContext" not in OWNER,
     "New Listings owner reaches into private graph context")
need("atlasExternalChartDraw" not in OWNER,
     "New Listings owner calls private graph draw function")
need("AtlasExternalChart?.present" in OWNER,
     "New Listings owner does not use the public graph owner API")
need("function atlasExternalChartPresent" in APP,
     "app.js public external-series presenter missing")
need("present:atlasExternalChartPresent" in APP,
     "AtlasExternalChart public presenter not exported")
need("if (atlasExternalChartActive())" in APP and "atlasChartOverlayExternal" in APP,
     "external chart overlay ownership missing")
need("newListingOpen406" not in OWNER and "newListingSources406" not in OWNER,
     "versioned dataset accessor survived stable-owner migration")

# Exit contract: external listing context must yield to existing native controls.
for selector in (
    "#btnChartSolo","#btnChartTop3","#btnChartTop5",
    "#btnChartGainers","#btnChartLosers","#btnChartVolume5",
    "#btnChartReset","#btnChartClear","#targetTop5Cycle",
    "#marketFlowCycle","#marketRows tr[data-market-row-id403115]",
):
    need(selector in OWNER, f"canonical exit selector missing: {selector}")

m=re.search(r'function bindCanonicalExit\(\)\{(?P<body>.*?)\n  \}', OWNER, re.S)
need(m is not None, "bindCanonicalExit missing")
if m:
    body=m.group("body")
    need("deactivate({clearChart:false});" in body,
         "canonical exit must release listing state without clearing canvas before native handler")
    need("stopImmediatePropagation" not in body, "canonical exit blocks native handler")
    need("preventDefault" not in body, "canonical exit prevents native handler")

need('market_core' in BUILD and BUILD.get('market_core')=="38.15.11",
     "Market Core truth changed")
need(BUILD.get('market_core_modified') is False, "Market Core marked modified")

if errors:
    print("NEW_LISTINGS_CANONICAL_GUARD_FAIL")
    for e in errors: print(" -",e)
    sys.exit(1)

print("NEW_LISTINGS_CANONICAL_GUARD_PASS")
print(" owner=js/new-listings-native-category.js")
print(" state=state")
print(" api=AgentCryptoNewListingsNativeCategory")
print(" market_core=38.15.11")
