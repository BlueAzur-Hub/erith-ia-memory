#!/usr/bin/env python3
import json
from pathlib import Path
R=Path("public/agent_crypto_erith_ia/administrator")
i=(R/"index.html").read_text(encoding="utf-8"); j=(R/"js/market-microscope-candles-406498.js").read_text(encoding="utf-8"); b=json.loads((R/"build.json").read_text(encoding="utf-8"))
def need(x,m):
    if not x: raise SystemExit("BOLL_406557_FAIL: "+m)
need(b.get("build")=="40.6.557","build");need(b.get("parent_build")=="40.6.556","parent");need(b.get("market_core")=="38.15.11","core")
need("market-microscope-candles-406498.js?v=40.6.557" in i,"token");need('const BUILD="40.6.557"' in j,"js build")
need('boll:false' in j,"default off");need('data-amm-indicator="boll">BOLL</button>' in j,"button");need('function bollinger(rows,period=20,multiplier=2)' in j,"calc")
need('BOLLINGER_SMA_STDDEV' in j,"method");need('bollinger_default_off:state.indicators.boll===false' in j,"selftest")
need((b.get("candles_supertrend_406556") or {}).get("terrain")=="PASS_FIREFOX_2026-10-05",".556 pass")
s=b.get("candles_bollinger_406557") or {};need(s.get("scope")=="CANDLES_BOLLINGER_OPT_IN_ONLY","scope");need(s.get("period")==20 and s.get("multiplier")==2,"params")
need(s.get("data_source_changed") is False,"network");need(s.get("new_timer") is False,"timer");need(s.get("market_core_modified") is False,"core modified")
print(json.dumps({"ok":True,"build":"40.6.557","terrain":"PENDING_FIREFOX"}))
