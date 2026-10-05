#!/usr/bin/env python3
import json
from pathlib import Path
R=Path("public/agent_crypto_erith_ia/administrator");i=(R/"index.html").read_text();j=(R/"js/market-microscope-candles-406498.js").read_text();b=json.loads((R/"build.json").read_text())
def need(x,m):
    if not x: raise SystemExit("SAR_406558_FAIL: "+m)
need(b.get("build")=="40.6.558","build");need(b.get("parent_build")=="40.6.557","parent");need(b.get("market_core")=="38.15.11","core")
need("market-microscope-candles-406498.js?v=40.6.558" in i,"token");need('const BUILD="40.6.558"' in j,"js build")
need('sar:false' in j,"default off");need('data-amm-indicator="sar">SAR</button>' in j,"button");need('function parabolicSar(rows,step=.02,maxAf=.2)' in j,"calc")
need('PARABOLIC_SAR_CLASSIC' in j,"method");need('sar_default_off:state.indicators.sar===false' in j,"selftest")
s=b.get("candles_sar_406558") or {};need(s.get("scope")=="CANDLES_PARABOLIC_SAR_OPT_IN_ONLY","scope");need(s.get("step")==.02 and s.get("max_af")==.2,"params")
need(s.get("data_source_changed") is False,"network");need(s.get("new_timer") is False,"timer");need(s.get("market_core_modified") is False,"core modified")
print(json.dumps({"ok":True,"build":"40.6.558","terrain":"PENDING_FIREFOX"}))
