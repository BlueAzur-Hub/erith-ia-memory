#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
ROOT=Path("public/agent_crypto_erith_ia/administrator")
def fail(m): raise SystemExit("ATOMICITY_406491_FAIL: "+m)
def read(p):
    if not p.is_file(): fail("missing "+str(p))
    return p.read_text(encoding="utf-8")
def need(c,m):
    if not c: fail(m)
ret=read(ROOT/"js/oracle-evidence-retention-atomicity-406491.js")
auto=read(ROOT/"js/oracle-evidence-auto-archive-safety-gates.js")
loader=read(ROOT/"js/post-boot-runtime-loader.js")
index=read(ROOT/"index.html")
build=json.loads(read(ROOT/"build.json"))
manifest=json.loads(read(Path("public/agent_crypto_erith_ia/data/oracle_evidence/manifest.json")))
need('const BUILD = "40.6.491";' in ret,"retention build")
need("async function deleteExactChunkTransaction" in ret,"atomic helper")
need('db.transaction(api.store, "readwrite")' in ret,"readwrite tx")
need("const request = store.get(id);" in ret,"exact reread")
need("JSON.stringify(current) !== expected" in ret,"exact value compare")
need("const request = store.delete(id);" in ret,"exact delete")
need("deleteExactChunkTransaction(proof.chunk, proof.cold.rows)" in ret,"atomic helper used")
need("async function deleteExactIds" not in ret,"old split delete remains")
atomic=ret[ret.index("async function deleteExactChunkTransaction"):ret.index("async function assertIdsAbsent")]
need("crypto.subtle" not in atomic and "sha256Hex(" not in atomic,"digest inside tx")
need("single_readwrite_transaction: true" in ret and "atomic_exact_value_match: true" in ret,"atomic receipt")
need(".clear(" not in ret and "indexedDB.deleteDatabase" not in ret,"global delete api")
need('const BUILD="40.6.491";' in auto,"auto build")
need("starting:false" in auto and "if(state.running||state.starting||state.paused) return snapshot();" in auto,"single flight")
need("state.pending_at_start=await countRowsAfter(remoteWatermark,target);" in auto,"watermark count")
need('progress_count_mode:"ROWS_AFTER_VERIFIED_WATERMARK_TO_FIXED_TARGET"' in auto,"progress contract")
need('const BUILD="40.6.491";' in loader,"loader build")
need("oracle-evidence-retention-atomicity-406491.js?v=40.6.491" in loader,"atomic loader")
need("oracle-evidence-verified-hot-window-retention-406490.js?v=40.6.490" not in loader,"old retention still loaded")
need('name="agent-crypto-loaded-build" content="40.6.491"' in index,"index build")
need(build.get("build")=="40.6.491" and build.get("engine")=="38.15.11","build truth")
a=build.get("oracle_evidence_retention_atomicity_406491") or {}
need(a.get("single_indexeddb_readwrite_transaction") is True and a.get("automatic_delete") is False,"build atomic flags")
q=build.get("oracle_evidence_auto_archive_safety_gates_406487") or {}
need(q.get("single_flight_start") is True and q.get("progress_count_mode")=="ROWS_AFTER_VERIFIED_WATERMARK_TO_FIXED_TARGET","auto flags")
chunks=manifest.get("chunks") if isinstance(manifest.get("chunks"),list) else []
need(manifest.get("archived_rows")==36056 and len(chunks)==74,"cold inventory")
need(all(str(x.get("status","")).upper()=="VERIFIED" for x in chunks),"cold verification")
for v in ("406489","406490"):
    p=Path(f".github/workflows/agent-crypto-package-{v}.yml")
    t=read(p)
    need("workflow_dispatch:" in t and "\npush:" not in t and "\npull_request:" not in t,f"historical workflow {v} automatic")
print(json.dumps({"ok":True,"build":"40.6.491","market_core":"38.15.11","retention_atomic":True,"single_flight_auto":True,"watermark_progress":True,"terrain":"PENDING_FIREFOX"},ensure_ascii=False,sort_keys=True))
