#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path

ROOT=Path("public/agent_crypto_erith_ia/administrator")

def fail(msg: str):
    raise SystemExit("OKX_DEMO_FILL_HORIZON_406496_FAIL: "+msg)

def read(path: Path) -> str:
    if not path.is_file():
        fail("missing "+str(path))
    return path.read_text(encoding="utf-8")

def need(cond: bool, msg: str):
    if not cond:
        fail(msg)

lab=read(ROOT/"js/strategy-a-okx-micro-execution-shadow-truth.js")
loader=read(ROOT/"js/post-boot-runtime-loader.js")
index=read(ROOT/"index.html")
build=json.loads(read(ROOT/"build.json"))

need('const BUILD="40.6.496";' in lab, "lab build")
need("OKX DEMO V5 · ENTRÉE POST-ONLY · 10 €" in lab, "Demo evidence surface")
for token in ["full_fills:4","fill_rate_pct:40.0","first_fill_median_s:20.0","observed_entry_fee_pct:0.1"]:
    need(token in lab, "V5 token "+token)
for token in ["0.14471091461074842","0.135735502276726","0.08432971556435374","-0.4500473426133213","-0.6458978080861073"]:
    need(token in lab, "horizon token "+token)
need("ROUND-TRIP INCONNU" in lab, "round-trip boundary")
need("25/50/100 € n’ont pas de preuve de fill V5" in lab, "ticket-size boundary")
need("FAIL_BENCHMARK_FROZEN" in lab and "strategy_a2_started:false" in lab, "V1 freeze / A2 not started")
need('strategy-a-okx-micro-execution-shadow-truth.js?v=40.6.496' in loader, "loader cache pin")
need('const BUILD="40.6.496";' in loader, "postboot build")
need('name="agent-crypto-loaded-build" content="40.6.496"' in index, "index build truth")
need((ROOT/"index-40.6.496.html").is_file(), "immutable entry")
need(build.get("build")=="40.6.496" and build.get("parent_build")=="40.6.495", "build truth")
need(build.get("market_core")=="38.15.11" and build.get("market_core_modified") is False, "Market Core protection")
x=build.get("okx_demo_fill_horizon_evidence_406496") or {}
need(x.get("attempts")==10 and x.get("filled")==4 and x.get("fill_rate_pct")==40.0, "V5 fill summary")
need(x.get("first_fill_median_s")==20.0 and x.get("observed_entry_fee_pct")==0.1, "V5 time/fee summary")
need(x.get("conclusion")=="LONGER_HORIZON_NOT_VALIDATED_IN_V5_SAMPLE", "horizon conclusion")
need(x.get("strategy_a_v1_status")=="FAIL_BENCHMARK_FROZEN" and x.get("strategy_a2_started") is False, "V1/A2 boundary")
need(x.get("entry_leg_demo_proven") is True and x.get("round_trip_fill_proven") is False and x.get("live_fill_proven") is False, "Demo/live boundary")
need(x.get("source_sha256")=="930bb9d35cfdbcd3c2a0632063918e8c7a8b2afb424da8d99aa4bf7ae1b4425b", "source fingerprint")
p=x.get("protected") or {}
for key in ["strategy_thresholds_changed","cost_gate_changed","oracle_math_changed","risk_policy_changed","paper_execution_changed","execution_cost_truth_406492_changed","backend_modified","bridge_modified","market_core_modified","new_recurring_timer","mutation_observer","storage_schema_changed","real_order","wallet","api_key"]:
    need(p.get(key) is False, "protected flag "+key)
need('strategy-a-execution-cost-truth.js?v=40.6.492' in loader, "40.6.492 delivery changed")
print(json.dumps({"ok":True,"build":"40.6.496","fix":"OKX_DEMO_FILL_HORIZON_EVIDENCE_TRUTH","market_core":"38.15.11","terrain":"PENDING_FIREFOX"},ensure_ascii=False,sort_keys=True))
