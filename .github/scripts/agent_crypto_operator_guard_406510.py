#!/usr/bin/env python3
from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/"public/agent_crypto_erith_ia"
OP=BASE/"operator"
ADMIN=BASE/"administrator"

op_build=json.loads((OP/"build.json").read_text(encoding="utf-8"))
admin_build=json.loads((ADMIN/"build.json").read_text(encoding="utf-8"))
op_index=(OP/"index.html").read_text(encoding="utf-8")
op_entry=(OP/"index-40.6.510.html").read_text(encoding="utf-8")
admin_entry=(ADMIN/"index-40.6.509.html").read_text(encoding="utf-8")

checks={
    "operator_build_510": op_build.get("build")=="40.6.510",
    "operator_release": op_build.get("release")=="OPERATOR SHARED RUNTIME 509",
    "admin_source_509": op_build.get("administrator_source_build")=="40.6.509",
    "admin_current_509": admin_build.get("build")=="40.6.509",
    "market_core_shared": op_build.get("market_core")=="38.15.11" and admin_build.get("market_core")=="38.15.11",
    "market_core_not_modified": op_build.get("market_core_modified") is False,
    "admin_not_modified_by_operator_contract": op_build.get("administrator_modified") is False,
    "shared_runtime": op_build.get("runtime_mode")=="shared-administrator",
    "operator_not_third_engine": op_build.get("operator_is_third_build_line") is False,
    "paper_only": op_build.get("paper_only") is True,
    "no_admin_session": op_build.get("grants_administrator_session") is False,
    "no_real_trading": op_build.get("grants_real_trading") is False,
    "no_wallet": op_build.get("grants_wallet") is False,
    "no_secret": op_build.get("embeds_secret") is False,
    "backend_readonly": op_build.get("backend_contract")=="loopback-readonly",
    "operator_index_510": 'operator-delivery-build" content="40.6.510"' in op_index,
    "entry_points_to_admin_509": '../administrator/index-40.6.509.html?view=intermediate&amp;operator-entry=40.6.510&amp;profile=yohan' in op_entry,
    "admin_intermediate_contract_exists": 'requested === "intermediate"' in admin_entry and '? "operator"' in admin_entry,
    "admin_advanced_requires_owner": 'if (view === "advanced" && sessionRole !== "owner") view = "essential";' in admin_entry,
}

failed=[k for k,v in checks.items() if not v]
for k,v in checks.items():
    print(f"{k}: {'PASS' if v else 'FAIL'}")
if failed:
    raise SystemExit("40.6.510 Operator guard failed: "+", ".join(failed))
print("40.6.510 OPERATOR SHARED RUNTIME GUARD PASS")
