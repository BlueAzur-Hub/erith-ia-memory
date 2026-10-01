#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path

ROOT=Path("public/agent_crypto_erith_ia/administrator")

def fail(msg: str):
    raise SystemExit("OKX_SHADOW_EVIDENCE_406495_FAIL: "+msg)

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

need('const BUILD="40.6.495";' in lab, "lab build")
need("LINKED_CYCLE_EXPECTED_MOVE" in lab, "linked-cycle comparator")
for token in ["FULL_ORDERBOOK_FRESH","PARTIAL_TOP_OF_BOOK_FRESH","STALE_HISTORY","SOURCE_UNAVAILABLE"]:
    need(token in lab, "coverage state "+token)
need("CURRENT_VIEW_MAX_AGE_SECONDS=120" in lab, "freshness age contract")
need("required_with_margin_pct" in lab and "cost_pct" in lab, "numeric observation history")
need("four_of_four_means_four_ticket_sizes_not_four_executable_opportunities" in lab, "4/4 semantics")
need('strategy-a-okx-micro-execution-shadow-truth.js?v=40.6.495' in loader, "loader cache pin")
need('const BUILD="40.6.495";' in loader, "postboot build")
need('name="agent-crypto-loaded-build" content="40.6.495"' in index, "index build truth")
need((ROOT/"index-40.6.495.html").is_file(), "immutable entry")
need(build.get("build")=="40.6.495" and build.get("parent_build")=="40.6.494", "build truth")
need(build.get("market_core")=="38.15.11" and build.get("market_core_modified") is False, "Market Core protection")
x=build.get("okx_shadow_evidence_truth_406495") or {}
need(x.get("source_owner_modified") is False, "40.6.492 protection")
need(x.get("historical_oracle_median_preserved") is True, "historical median preservation")
need(x.get("linked_cycle_context_added") is True, "linked cycle context")
need(x.get("packaging_tree_preserved") is True, "tree packaging truth")
need(x.get("ci_historical_self_skip") is True, "future CI self skip")
p=x.get("protected") or {}
for key in ["strategy_thresholds_changed","cost_gate_changed","oracle_math_changed","risk_policy_changed","paper_execution_changed","backend_modified","bridge_modified","new_recurring_timer","mutation_observer","storage_schema_changed","real_order"]:
    need(p.get(key) is False, "protected flag "+key)
need('strategy-a-execution-cost-truth.js?v=40.6.492' in loader, "40.6.492 delivery changed")
print(json.dumps({"ok":True,"build":"40.6.495","fix":"OKX_SHADOW_EVIDENCE_TRUTH","market_core":"38.15.11","terrain":"PENDING_FIREFOX"},ensure_ascii=False,sort_keys=True))
