#!/usr/bin/env python3
import json
from pathlib import Path
R=Path("public/agent_crypto_erith_ia/administrator");i=(R/"index.html").read_text();j=(R/"js/market-microscope-candles-406498.js").read_text();b=json.loads((R/"build.json").read_text())
def need(x,m):
    if not x: raise SystemExit("VWAP_406559_FAIL: "+m)
need(b.get("build")=="40.6.559","build");need(b.get("parent_build")=="40.6.558","parent");need(b.get("market_core")=="38.15.11","core")
need("market-microscope-candles-406498.js?v=40.6.559" in i,"token");need('const BUILD="40.6.559"' in j,"js build")
need('vwap:false' in j,"default off");need('data-amm-indicator="vwap">VWAP</button>' in j,"button");need('function vwap(rows)' in j,"calc")
need('VWAP_CUMULATIVE_TYPICAL_PRICE_VOLUME' in j,"method");need('vwap_default_off:state.indicators.vwap===false' in j,"selftest")
s=b.get("candles_vwap_406559") or {};need(s.get("scope")=="CANDLES_VWAP_OPT_IN_ONLY","scope");need(s.get("data_source_changed") is False,"network")
need(s.get("new_timer") is False,"timer");need(s.get("market_core_modified") is False,"core modified")
print(json.dumps({"ok":True,"build":"40.6.559","terrain":"PENDING_FIREFOX"}))
