#!/usr/bin/env python3
from pathlib import Path
import json
import re

ROOT=Path("public/agent_crypto_erith_ia")
ADMIN=ROOT/"administrator"
QUEUE=ADMIN/"js/oracle-evidence-auto-archive-queue.js"
LOADER=ADMIN/"js/post-boot-runtime-loader.js"
BUILD=ADMIN/"build.json"

def need(cond,label):
    if not cond:
        raise SystemExit("FAIL: "+label)

q=QUEUE.read_text(encoding="utf-8")
l=LOADER.read_text(encoding="utf-8")
d=json.loads(BUILD.read_text(encoding="utf-8"))

need('const BUILD="40.6.486";' in q,"queue build")
need('const SOURCE_BUILD="40.6.482";' in q,"proven source build")
need('const BRIDGE_BASE="http://127.0.0.1:8787";' in q,"existing Bridge 8787")
need('const CHUNK_ROWS=500;' in q,"500 rows per chunk")
need('const REQUEST_TIMEOUT_MS=300000;' in q,"300s request timeout")
need('Bridge V1.9.13 requis' in q,"Bridge 1.9.13 required")
need('wait_for_verified_before_next:true' in q,"verified-before-next invariant")
need('sequential_only:true' in q and 'parallel_uploads:false' in q,"sequential no parallel")
need('fixed_target_at_start:true' in q,"fixed target")
need('resume_from_bridge_watermark_on_new_start:true' in q,"resume from Bridge watermark")
need('pause_after_current_chunk:true' in q and 'stop_after_current_chunk:true' in q,"safe pause stop")
need('AUTO_PAUSE_REQUESTED' in q and 'AUTO_STOP_REQUESTED' in q,"pause/stop request states")
need('AUTO_COMPLETE' in q and 'AUTO_CHUNK_VERIFIED' in q,"completion states")
need('state.watermark=mark(bundle.chunk.watermark_after)' in q,"watermark advances only after verified ingest")
need('const result=await ingestBundle(bundle);' in q,"verified ingest owner")
need('if(String(result?.status||"").toUpperCase()!=="VERIFIED")' in q,"bridge verified gate")
need('const target=await latestLocalMark();' in q,"target snapshot")
need('const rows=await readRowsAfter(state.watermark,state.target_watermark,CHUNK_ROWS);' in q,"bounded cursor")
need('if(localNow<state.starting_local_rows)' in q,"local count no-decrease invariant")
need('.delete(' not in q and '.clear(' not in q and '.put(' not in q,"no IndexedDB delete/write")
need('db.transaction(api.store,"readonly")' in q,"IndexedDB readonly")
need('browser_github_write:false' in q and 'github_token_in_browser:false' in q,"browser GitHub lock")
need('automatic_delete:false' in q and 'local_delete_api_exposed:false' in q,"no deletion")
need('setInterval(' not in q and 'MutationObserver' not in q,"no recurring timer/observer")
need('oracle-evidence-auto-archive-queue.js?v=40.6.486' in l,"loader includes queue")
need('oracle-evidence-existing-bridge-integration.js?v=40.6.485' in l,"proven transport owner retained")

need(d["build"]=="40.6.486","build truth")
need(d["market_core"]=="38.15.11","Market Core protected")
need(d["strategy_a_modified"] is False and d["strategy_a_business_logic_modified"] is False,"Strategy protected")
need(d["oracle_math_changed"] is False,"Oracle Math protected")
need(d["storage_schema_changed"] is False and d["retention_changed"] is False,"storage/retention protected")
need(d["real_order"] is False,"no real order")
x=d["oracle_evidence_automatic_sequential_cold_archive_406486"]
need(x["chunk_rows"]==500,"build chunk rows")
need(x["sequential_only"] is True and x["parallel_uploads"] is False,"build sequential truth")
need(x["wait_for_verified_before_next"] is True,"build verified gate")
need(x["fixed_target_at_start"] is True,"build fixed target")
need(x["new_rows_during_run"]=="DEFER_TO_NEXT_PASS","new rows deferred")
need(x["resume_source"]=="BRIDGE_VERIFIED_WATERMARK","resume source")
need(x["local_retention_allowed"] is False and x["local_delete_api_exposed"] is False,"retention locked")
need(x["browser_github_write"] is False and x["github_token_in_browser"] is False,"browser GitHub lock")

for old in ("406482","406483","406484","406485"):
    p=Path(f".github/workflows/agent-crypto-package-{old}.yml")
    t=p.read_text(encoding="utf-8")
    need("workflow_dispatch:" in t, f"historical {old} manual only")
    need("branches:" not in t.split("permissions:",1)[0], f"historical {old} no push branch trigger")

print("40.6.486 ORACLE EVIDENCE AUTOMATIC SEQUENTIAL COLD ARCHIVE HARNESS PASS")
