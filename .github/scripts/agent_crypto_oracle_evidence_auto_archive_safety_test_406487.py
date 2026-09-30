#!/usr/bin/env python3
from pathlib import Path
import json

ROOT=Path("public/agent_crypto_erith_ia")
ADMIN=ROOT/"administrator"
QUEUE=ADMIN/"js/oracle-evidence-auto-archive-safety-gates.js"
INTEGRATION=ADMIN/"js/oracle-evidence-existing-bridge-integration.js"
LOADER=ADMIN/"js/post-boot-runtime-loader.js"
BUILD=ADMIN/"build.json"

def need(cond,label):
    if not cond:
        raise SystemExit("FAIL: "+label)

q=QUEUE.read_text(encoding="utf-8")
i=INTEGRATION.read_text(encoding="utf-8")
l=LOADER.read_text(encoding="utf-8")
d=json.loads(BUILD.read_text(encoding="utf-8"))

need('const BUILD="40.6.487";' in q,"queue build")
need('const BUILD="40.6.487";' in i,"integration build")
need('const SOURCE_BUILD="40.6.482";' in q,"proven bundle source")
need('const BRIDGE_BASE="http://127.0.0.1:8787";' in q,"Bridge 8787")
need('payload?.enabled!==true' in q,"queue enabled gate")
need('if(!state.bridge.ready) throw new Error("Bridge Oracle Evidence désactivé · enabled=false");' in i,"manual enabled gate")
need('__ATLAS_ORACLE_EVIDENCE_ARCHIVE_LOCK__' in q and '__ATLAS_ORACLE_EVIDENCE_ARCHIVE_LOCK__' in i,"shared archive lock")
need('manual.disabled=true' in q,"manual button disabled")
need('manual_mass_ingest_disabled:true' in q,"manual mass ingest lock truth")
need('exact_public_receipt_required:true' in q,"exact public receipt truth")
need('FINAL_PUBLIC_EXACT_VERIFY_PASS' in q,"exact final public verify state")
need('PUBLISHED_EXACT_VERIFY_PASS' in i,"integration exact public verify state")
need('chunks.find(x=>String(x?.relative_path||"")===String(expected.relative_path))' in q,"queue exact receipt lookup")
need('chunks.find(x=>String(x?.relative_path||"")===String(expected.relative_path||""))' in i,"integration exact receipt lookup")
need('Number(bridge.archived_rows||0)>0' in i,"manual bootstrap-only gate")
need('Archivage manuel 500 désactivé après bootstrap' in i,"manual stale-manifest guard")
need('const CHUNK_ROWS=500;' in q,"500 chunk size")
need('wait_for_verified_before_next:true' in q,"verified before next")
need('parallel_uploads:false' in q and 'sequential_only:true' in q,"sequential only")
need('fixed_target_at_start:true' in q,"fixed target")
need('resume_from_bridge_watermark_on_new_start:true' in q,"resume from Bridge watermark")
need('pause_after_current_chunk:true' in q and 'stop_after_current_chunk:true' in q,"safe pause/stop")
need('db.transaction(api.store,"readonly")' in q,"IndexedDB readonly")
need('.delete(' not in q and '.clear(' not in q and '.put(' not in q,"no local DB mutation")
need('browser_github_write:false' in q and 'github_token_in_browser:false' in q,"browser GitHub lock")
need('oracle-evidence-existing-bridge-integration.js?v=40.6.487' in l,"loader integration 487")
need('oracle-evidence-auto-archive-safety-gates.js?v=40.6.487' in l,"loader queue 487")
need('oracle-evidence-auto-archive-queue.js?v=40.6.486' not in l,"old 486 queue not loaded")

need(d["build"]=="40.6.487","build truth")
need(d["market_core"]=="38.15.11","Market Core protected")
need(d["strategy_a_modified"] is False and d["strategy_a_business_logic_modified"] is False,"Strategy protected")
need(d["oracle_math_changed"] is False,"Oracle Math protected")
need(d["storage_schema_changed"] is False and d["retention_changed"] is False,"storage protected")
need(d["real_order"] is False,"no real order")
x=d["oracle_evidence_auto_archive_safety_gates_406487"]
need(x["bridge_enabled_required"] is True,"build enabled gate")
need(x["manual_mass_ingest_disabled"] is True,"build manual lock")
need(x["exact_public_receipt_required"] is True,"build exact receipt")
need(x["chunk_rows"]==500,"build chunk size")
need(x["sequential_only"] is True and x["parallel_uploads"] is False,"build sequential")
need(x["wait_for_verified_before_next"] is True,"build verified gate")
need(x["local_retention_allowed"] is False and x["local_delete_api_exposed"] is False,"retention locked")

for old in ("406481","406482","406483","406484","406485","406486"):
    p=Path(f".github/workflows/agent-crypto-package-{old}.yml")
    t=p.read_text(encoding="utf-8")
    need("workflow_dispatch:" in t,f"historical {old} manual only")
    need("branches:" not in t.split("permissions:",1)[0],f"historical {old} no push/pr branch trigger")

print("40.6.487 ORACLE EVIDENCE AUTO ARCHIVE SAFETY GATES HARNESS PASS")
