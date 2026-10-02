#!/usr/bin/env python3
import json
from pathlib import Path
R=Path("public/agent_crypto_erith_ia/administrator")
def need(v,m):
    if not v: raise SystemExit("QUOTE_CURRENCY_406497_FAIL: "+m)
index=(R/"index.html").read_text(encoding="utf-8")
js=(R/"js/quote-currency-architecture-406497.js").read_text(encoding="utf-8")
build=json.loads((R/"build.json").read_text(encoding="utf-8"))
need('agent-crypto-loaded-build" content="40.6.497"' in index,"index build")
need('quote-currency-architecture-406497.js?v=40.6.497' in index,"delivery")
need('executionInstrument:"BTC-EUR"' in js and 'settlementAsset:"EUR"' in js,"defaults")
need('execution_mutation_from_display:false' in js,"separation lock")
need(build.get("build")=="40.6.497","build")
q=build.get("quote_currency_architecture_406497") or {}
need(q.get("display_changes_execution_instrument") is False,"execution invariant")
need(q.get("market_core_modified") is False and build.get("market_core")=="38.15.11","market core")
print(json.dumps({"ok":True,"build":"40.6.497","terrain":"PENDING_FIREFOX"}))
