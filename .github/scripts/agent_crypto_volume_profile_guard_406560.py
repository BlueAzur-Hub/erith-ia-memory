#!/usr/bin/env python3
import json
from pathlib import Path
R=Path("public/agent_crypto_erith_ia/administrator");i=(R/"index.html").read_text();j=(R/"js/market-microscope-candles-406498.js").read_text();b=json.loads((R/"build.json").read_text())
def need(x,m):
    if not x: raise SystemExit("VP_406560_FAIL: "+m)
need(b.get("build")=="40.6.560","build");need(b.get("parent_build")=="40.6.559","parent");need(b.get("market_core")=="38.15.11","core")
need("market-microscope-candles-406498.js?v=40.6.560" in i,"token");need('const BUILD="40.6.560"' in j,"js build")
need('vp:false' in j,"default off");need('data-amm-indicator="vp">VP</button>' in j,"button");need('function volumeProfile(rows,bins=24)' in j,"calc")
need('VOLUME_PROFILE_OHLCV_TYPICAL_PRICE_APPROX' in j,"truth method");need('volume_profile_default_off:state.indicators.vp===false' in j,"selftest")
s=b.get("candles_volume_profile_406560") or {};need(s.get("scope")=="CANDLES_VOLUME_PROFILE_APPROX_OPT_IN_ONLY","scope")
need(s.get("approximation_truth")=="CANDLE_TYPICAL_PRICE_BINNING_NOT_TICK_LEVEL_PROFILE","truth");need(s.get("bins")==24,"bins")
need(s.get("data_source_changed") is False,"network");need(s.get("new_timer") is False,"timer");need(s.get("market_core_modified") is False,"core modified")
print(json.dumps({"ok":True,"build":"40.6.560","terrain":"PENDING_FIREFOX","truth":"OHLCV_APPROX"}))
