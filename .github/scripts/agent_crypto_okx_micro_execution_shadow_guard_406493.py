#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
ROOT=Path("public/agent_crypto_erith_ia/administrator")
def fail(m): raise SystemExit("OKX_MICRO_EXECUTION_406493_FAIL: "+m)
def read(p):
    if not p.is_file(): fail("missing "+str(p))
    return p.read_text(encoding="utf-8")
def need(c,m):
    if not c: fail(m)
lab=read(ROOT/"js/strategy-a-okx-micro-execution-shadow-truth.js")
loader=read(ROOT/"js/post-boot-runtime-loader.js")
index=read(ROOT/"index.html")
build=json.loads(read(ROOT/"build.json"))
need('const BUILD="40.6.493"' in lab,"lab build")
need("EVIDENCE_SHADOW_NOT_GATE" in lab and "POTENTIEL ≠ PASS" in lab,"shadow safety labels")
need("MEASURED_ORDERBOOK" in lab and "FEE_FLOOR_ONLY" in lab,"three-mode evidence semantics")
need("fetch(" not in lab and "WebSocket(" not in lab,"new network capability")
need("localStorage." not in lab and "indexedDB." not in lab and "setInterval(" not in lab,"storage/timer capability")
need("real_order:false" in lab and "wallet:false" in lab and "api_key:false" in lab,"execution safety")
need('const BUILD="40.6.493";' in loader,"loader build")
need("strategy-a-execution-cost-truth.js?v=40.6.492" in loader,"492 source preserved")
need("strategy-a-okx-micro-execution-shadow-truth.js?v=40.6.493" in loader,"lab loader")
need(loader.index("strategy-a-execution-cost-truth.js?v=40.6.492") < loader.index("strategy-a-okx-micro-execution-shadow-truth.js?v=40.6.493"),"loader order")
need('name="agent-crypto-loaded-build" content="40.6.493"' in index,"index build")
need(build.get("build")=="40.6.493" and build.get("parent_build")=="40.6.492","build truth")
need(build.get("engine")=="38.15.11" and build.get("market_core_modified") is False,"market core protected")
x=build.get("okx_micro_execution_shadow_truth_406493") or {}
need(x.get("existing_backend")=="1.4.3" and x.get("bridge_modified") is False and x.get("backend_modified") is False,"R18/Backend unchanged")
need(x.get("potential_is_pass") is False and x.get("evidence_shadow_not_gate") is True,"no pass promotion")
need(x.get("strategy_thresholds_changed") is False and x.get("cost_gate_changed") is False and x.get("risk_governor_changed") is False,"strategy protected")
need((ROOT/"index-40.6.493.html").is_file(),"immutable entry")
print(json.dumps({"ok":True,"build":"40.6.493","market_core":"38.15.11","backend":"1.4.3","bridge_changed":False,"lab":"OKX_MICRO_EXECUTION_SHADOW","terrain":"PENDING_FIREFOX_RYZEN"},ensure_ascii=False,sort_keys=True))
