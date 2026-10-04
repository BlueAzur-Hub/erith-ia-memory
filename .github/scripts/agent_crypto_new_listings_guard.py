#!/usr/bin/env python3
from pathlib import Path
import json, re, sys

ROOT=Path(__file__).resolve().parents[2]
ADMIN=ROOT/"public/agent_crypto_erith_ia/administrator"
INDEX=(ADMIN/"index.html").read_text(encoding="utf-8")
OWNER=(ADMIN/"js/new-listings-native-category.js").read_text(encoding="utf-8")
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
    need("deactivate();" in body, "canonical exit does not deactivate external context")
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
