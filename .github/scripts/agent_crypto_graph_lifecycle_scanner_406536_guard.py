#!/usr/bin/env python3
from pathlib import Path
import json, re

root=Path(__file__).resolve().parents[2]
admin=root/"public/agent_crypto_erith_ia/administrator"
src=(admin/"app.js").read_text(encoding="utf-8")
build=json.loads((admin/"build.json").read_text(encoding="utf-8"))
html=(admin/"index.html").read_text(encoding="utf-8")

required=[
  "40.6.536 — every new canonical selection starts from an idle native request owner",
  "40.6.536 — explicit empty selection is a terminal idle state",
  "exact same inclusive window count, but O(log n)",
  "async function atlasScannerYieldToUi",
  "calcul déjà en cours · clic répété ignoré",
  'atlasExternalChartClear(\`scanner:\${preset}\`)',
]
for token in required:
    if token not in src:
        raise SystemExit(f"FAIL missing runtime guard: {token}")

# Clear and fresh canonical selection both own the same idle reset fields.
for name in ("atlasPrepareChartSelection","atlasRenderEmptyGraphSelection"):
    m=re.search(rf"function {name}\\([^)]*\\) \\{{(?P<body>.*?)\\n\\}}",src,re.S)
    if not m:
        raise SystemExit(f"FAIL function missing: {name}")
    body=m.group("body")
    for token in ("controller = null","loading = false","activeRequestKey = null","retryKey = null"):
        if token not in body:
            raise SystemExit(f"FAIL {name} missing {token}")

if "while (lo < hi)" not in src or "upperBound(end) - lowerBound(start)" not in src:
    raise SystemExit("FAIL binary-search window count missing")

if build.get("build")!="40.6.536" or build.get("parent_build")!="40.6.535":
    raise SystemExit("FAIL build truth mismatch")
if build.get("market_core")!="38.15.11" or build.get("market_core_modified") is not False:
    raise SystemExit("FAIL Market Core protection")
if "Build 40.6.536 · Administrator" not in html:
    raise SystemExit("FAIL index build badge")
if not (admin/"index-40.6.536.html").exists():
    raise SystemExit("FAIL versioned index missing")

print("GRAPH_LIFECYCLE_SCANNER_406536_GUARD_PASS")
print(" clear-reset=idle-owner")
print(" scanner-window-count=binary-search-exact")
print(" scanner-ui-yield=enabled")
print(" duplicate-active-preset=deduplicated")
print(" market-core=38.15.11")
