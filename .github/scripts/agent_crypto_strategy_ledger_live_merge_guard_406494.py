#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path

ROOT=Path("public/agent_crypto_erith_ia/administrator")

def fail(message: str):
    raise SystemExit("STRATEGY_LEDGER_LIVE_MERGE_406494_FAIL: "+message)

def read(path: Path) -> str:
    if not path.is_file():
        fail("missing "+str(path))
    return path.read_text(encoding="utf-8")

def need(condition: bool, message: str):
    if not condition:
        fail(message)

facade=read(ROOT/"js/strategy-a-g3-prospective-t0-capture.js")
loader=read(ROOT/"js/strategy-a-evidence-demand-loader.js")
postboot=read(ROOT/"js/post-boot-runtime-loader.js")
index=read(ROOT/"index.html")
build=json.loads(read(ROOT/"build.json"))

need('const BUILD = "40.6.494";' in facade,"facade build")
need("function mergeLedgerViews" in facade,"merge helper absent")
need('absorb(genericRows, "generic")' in facade,"generic view absent")
need('absorb(prospectiveRows, "prospective")' in facade,"prospective view absent")
need('absorb(exactRows, "exact")' in facade,"exact live view absent")
need(facade.index('absorb(genericRows, "generic")') < facade.index('absorb(prospectiveRows, "prospective")') < facade.index('absorb(exactRows, "exact")'),"merge priority order")
need("exact_live_priority: true" in facade and "live_ledger_merge_truth: true" in facade,"live priority flags")
need("return merged.slice(-240);" in facade,"bounded facade contract")
need('const BUILD = "40.6.494";' in loader,"evidence loader delivery build")
need('"./js/strategy-a-g3-prospective-t0-capture.js": "40.6.494"' in loader,"facade cache identity")
need('name="agent-crypto-loaded-build" content="40.6.494"' in index,"index build")
need('strategy-a-evidence-demand-loader.js?v=40.6.494' in index,"loader cache bust")
need("strategy-a-execution-cost-truth.js?v=40.6.492" in postboot,"40.6.492 source changed")
need("strategy-a-okx-micro-execution-shadow-truth.js?v=40.6.493" in postboot,"40.6.493 shadow changed")
need(build.get("build")=="40.6.494" and build.get("parent_build")=="40.6.493","build truth")
need(build.get("engine")=="38.15.11" and build.get("market_core_modified") is False,"Market Core protection")
x=build.get("strategy_ledger_live_merge_truth_406494") or {}
need(x.get("owner")=="js/strategy-a-g3-prospective-t0-capture.js","owner truth")
need(x.get("exact_live_priority") is True and x.get("bounded_visible_rows")==240,"merge contract truth")
p=x.get("protected") or {}
for key in ["strategy_thresholds_changed","cost_gate_changed","oracle_math_changed","risk_policy_changed","paper_execution_changed","backend_modified","bridge_modified","new_timer","new_observer","new_network","storage_schema_changed","real_order"]:
    need(p.get(key) is False,"protected flag "+key)
need((ROOT/"index-40.6.494.html").is_file(),"immutable entry")
print(json.dumps({"ok":True,"build":"40.6.494","fix":"STRATEGY_LEDGER_LIVE_MERGE_TRUTH","market_core":"38.15.11","terrain":"PENDING_FIREFOX_NEXT_AUTO_A_CYCLE"},ensure_ascii=False,sort_keys=True))
