#!/usr/bin/env python3
import json
from pathlib import Path
R=Path("public/agent_crypto_erith_ia/administrator")
def need(v,m):
    if not v: raise SystemExit("MICROSCOPE_406498_FAIL: "+m)
i=(R/"index.html").read_text(encoding="utf-8"); j=(R/"js/market-microscope-candles-406498.js").read_text(encoding="utf-8"); b=json.loads((R/"build.json").read_text(encoding="utf-8"))
need('agent-crypto-loaded-build" content="40.6.498"' in i,"index build")
need('quote-currency-architecture-406497.js?v=40.6.498' in i,"497 cumulative")
need('market-microscope-candles-406498.js?v=40.6.498' in i,"498 delivery")
for t in ['OHLC','MA5','MA10','MA20','api/v5/market/candles','recurring_timer:false','real_order:false']: need(t in j,t)
need(b.get("build")=="40.6.498" and b.get("market_core")=="38.15.11","build/core")
x=b.get("market_microscope_candles_406498") or {}
need(x.get("native_price_base100_preserved") is True and x.get("new_recurring_timer") is False,"scope")
print(json.dumps({"ok":True,"build":"40.6.498","terrain":"PENDING_FIREFOX"}))
