#!/usr/bin/env python3
import json
from pathlib import Path
R=Path("public/agent_crypto_erith_ia/administrator")
def need(v,m):
    if not v: raise SystemExit("OKX_MICROSTRUCTURE_406499_FAIL: "+m)
i=(R/"index.html").read_text(encoding="utf-8"); j=(R/"js/okx-microstructure-406499.js").read_text(encoding="utf-8"); b=json.loads((R/"build.json").read_text(encoding="utf-8"))
need('agent-crypto-loaded-build" content="40.6.499"' in i,"index build")
for t in ['quote-currency-architecture-406497.js?v=40.6.499','market-microscope-candles-406498.js?v=40.6.499','okx-microstructure-406499.js?v=40.6.499']: need(t in i,t)
for t in ['/api/v5/market/ticker','/api/v5/market/books','/api/v5/market/books-rpi','/api/v5/market/trades','recurring_timer:false','private_api:false','real_order:false']: need(t in j,t)
need(b.get("build")=="40.6.499" and b.get("market_core")=="38.15.11","build/core")
x=b.get("okx_microstructure_406499") or {}
need(x.get("websocket") is False and x.get("new_recurring_timer") is False and x.get("private_api") is False,"read-only scope")
print(json.dumps({"ok":True,"build":"40.6.499","terrain":"PENDING_FIREFOX"}))
