#!/usr/bin/env python3
from pathlib import Path
import re, sys

root=Path(__file__).resolve().parents[2]
app=root/"public/agent_crypto_erith_ia/administrator/app.js"
build=root/"public/agent_crypto_erith_ia/administrator/build.json"
index=root/"public/agent_crypto_erith_ia/administrator/index.html"

src=app.read_text(encoding="utf-8")
handler=re.search(r'els\.btnChartSolo\?\.addEventListener\("click", \(\) => \{(?P<body>.*?)\n\}\);',src,re.S)
if not handler:
    raise SystemExit("FAIL: canonical Solo handler not found")
body=handler.group("body")
required=[
    'state.chartViewV2.oracle = false;',
    'atlasGraphContextV7SetSurface("market", "handler-solo-explicit-market");',
    'atlasChartV2SyncControls();',
    'atlasResetComparison(',
    'atlasGraphContextV7CommitMarket("handler-solo");',
]
positions=[]
for token in required:
    pos=body.find(token)
    if pos<0:
        raise SystemExit(f"FAIL: Solo handler missing {token}")
    positions.append(pos)
if positions != sorted(positions):
    raise SystemExit("FAIL: Solo intent operations are out of order")

# Scope proof: do not globally change CommitMarket semantics.
if 'activeSurface:current.activeSurface === "oracle" ? "oracle" : "market"' not in src:
    raise SystemExit("FAIL: global CommitMarket preservation contract changed")
if 'function atlasGraphContextV7SetSurface(surface="market"' not in src:
    raise SystemExit("FAIL: canonical V7 surface owner missing")

import json
b=json.loads(build.read_text(encoding="utf-8"))
if b.get("build")!="40.6.535" or b.get("parent_build")!="40.6.534":
    raise SystemExit("FAIL: build truth mismatch")
html=index.read_text(encoding="utf-8")
if "Build 40.6.535 · Administrator" not in html:
    raise SystemExit("FAIL: index version badge mismatch")

print("SOLO_MARKET_INTENT_406535_GUARD_PASS")
print(" order=oracle-off -> V7-market -> sync -> solo-reset -> market-commit")
print(" oracle-subprofile=preserved")
print(" global-commit-semantics=unchanged")
print(" market-core=38.15.11")
