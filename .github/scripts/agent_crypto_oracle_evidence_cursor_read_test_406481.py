#!/usr/bin/env python3
from pathlib import Path
import re

APP=Path("public/agent_crypto_erith_ia/administrator/app.js")
s=APP.read_text(encoding="utf-8")

def need(cond,label):
    if not cond:
        raise SystemExit(f"FAIL: {label}")

need("async function atlasOracleEvidenceReadAllByCursor406481" in s,"cursor reader exists")
need("store.openCursor()" in s,"openCursor used")
need('tx.objectStore(ATLAS_ORACLE_EVIDENCE_STORE).getAll()' not in s,"old full-store getAll removed")
need("readPromise = atlasOracleEvidenceReadAllByCursor406481().then(rows => {" in s,"common reader routed to cursor")
need("summary.count <= ATLAS_ORACLE_EVIDENCE_MAX_ROWS" in s,"prune uses count fast-path")
need('atlasOracleEvidenceAll({fresh:true})' in s,"prune full read only above retention cap")
need("AtlasOracleEvidenceCursorReadRecovery406481" in s,"runtime truth surface exists")
need('evidence_rows_deleted:false' in s,"no evidence deletion contract")
need('schema_changed:false' in s,"schema unchanged contract")
need('retention_changed:false' in s,"retention unchanged contract")
need('oracle_math_changed:false' in s,"oracle math unchanged")
need('strategy_a_changed:false' in s,"strategy unchanged")
need('market_core_changed:false' in s,"market core unchanged")
need('getall_for_full_evidence:false' in s,"getAll lock")
need('cursor_reads_406481' in s and 'cursor_rows_406481' in s,"cursor telemetry")
need('async function atlasOracleEvidencePut(row)' in s,"put owner preserved")
need('async function atlasOracleEvidenceDelete(ids)' in s,"delete owner preserved")
need('async function atlasOracleEvidenceColdSummary()' in s,"cold summary preserved")
need('const ATLAS_ORACLE_EVIDENCE_MAX_ROWS = 50000' in s,"retention cap unchanged")

cursor=re.search(r'async function atlasOracleEvidenceReadAllByCursor406481\(\)\{(.*?)\n\}',s,re.S)
need(cursor is not None,"cursor body extractable")
body=cursor.group(1)
need(".delete(" not in body and ".clear(" not in body and ".put(" not in body,"cursor reader is read-only")
need("cursor.continue()" in body,"cursor progresses")
need("rows.push(cursor.value)" in body,"cursor preserves rows")

print("40.6.481 ORACLE EVIDENCE CURSOR READ HARNESS PASS")
