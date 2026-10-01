#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
ROOT=Path("public/agent_crypto_erith_ia/administrator")
def fail(m): raise SystemExit("OKX_ORDERBOOK_406492_FAIL: "+m)
def read(p):
    if not p.is_file(): fail("missing "+str(p))
    return p.read_text(encoding="utf-8")
def need(c,m):
    if not c: fail(m)
cost=read(ROOT/"js/strategy-a-execution-cost-truth.js")
loader=read(ROOT/"js/post-boot-runtime-loader.js")
index=read(ROOT/"index.html")
build=json.loads(read(ROOT/"build.json"))
arch=json.loads(read(ROOT/"architecture/private-backend-sources.json"))
need('const BUILD="40.6.492"' in cost,"cost truth build")
need('orderbook_endpoint:"http://127.0.0.1:8790/orderbook?asset=BTC&depth=100"' in cost,"loopback orderbook route")
need("function okxOrderbookFromBackend" in cost and "async function fetchOkxBackendBook" in cost,"orderbook parser/fetch")
need("MULTI_LEVEL_ORDERBOOK_FROM_PRIVATE_BACKEND" in cost,"multi-level scope")
need("okx_orderbook_depth_drives_slippage_when_available:true" in cost,"slippage contract")
need("TOP_OF_BOOK_FALLBACK_ORDERBOOK_UNAVAILABLE" in cost,"safe fallback")
need("www.okx.com/api/v5/market/books" not in cost,"browser direct OKX books")
need("direct_okx_browser_internet:false" in cost,"direct browser lock")
need("real_order:false" in cost and "wallet:false" in cost and "api_key:false" in cost,"execution safety")
need('const BUILD="40.6.492";' in loader,"loader build")
need("strategy-a-execution-cost-truth.js?v=40.6.492" in loader,"cost truth cache token")
need('name="agent-crypto-loaded-build" content="40.6.492"' in index,"index build")
need(build.get("build")=="40.6.492" and build.get("parent_build")=="40.6.491","build truth")
need(build.get("engine")=="38.15.11" and build.get("market_core_modified") is False,"market core protected")
x=build.get("okx_orderbook_depth_truth_406492") or {}
need(x.get("backend_required")=="1.4.3" and x.get("backend_read_only") is True,"backend contract")
need(x.get("strategy_thresholds_changed") is False and x.get("cost_gate_changed") is False and x.get("risk_governor_changed") is False,"strategy protected")
need(arch.get("backend_version")=="1.4.3","architecture backend version")
a=arch.get("okx_orderbook_depth_406492") or {}
need(a.get("direct_browser_okx") is False and a.get("trading_endpoint") is False,"architecture safety")
need((ROOT/"index-40.6.492.html").is_file(),"immutable entry")
print(json.dumps({"ok":True,"build":"40.6.492","market_core":"38.15.11","backend":"1.4.3","okx_orderbook_depth":True,"terrain":"PENDING_FIREFOX_RYZEN"},ensure_ascii=False,sort_keys=True))
