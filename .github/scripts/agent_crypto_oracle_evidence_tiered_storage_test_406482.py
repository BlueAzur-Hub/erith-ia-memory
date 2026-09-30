#!/usr/bin/env python3
from pathlib import Path
import json

ROOT=Path("public/agent_crypto_erith_ia")
MODULE=ROOT/"administrator/js/oracle-evidence-tiered-storage-foundation.js"
MANIFEST=ROOT/"data/oracle_evidence/manifest.json"

s=MODULE.read_text(encoding="utf-8")
m=json.loads(MANIFEST.read_text(encoding="utf-8"))

def need(cond,label):
    if not cond:
        raise SystemExit(f"FAIL: {label}")

need('const BUILD = "40.6.482";' in s,"build identity")
need('DEFAULT_CHUNK_ROWS = 500' in s,"default chunk 500")
need('MAX_CHUNK_ROWS = 1000' in s,"hard chunk max 1000")
need('index.openCursor' in s,"bounded cursor used")
need('.getAll(' not in s,"no getAll in cold foundation")
need('sha256Hex' in s and 'crypto.subtle.digest("SHA-256"' in s,"SHA-256 proof")
need('downloadPreparedBundle' in s,"single bundle export")
need('verifyColdChunk' in s,"cold readback verifier")
need('local_retention_allowed: false' in s,"local retention locked")
need('local_delete_api_exposed: false' in s,"no delete API")
need('browser_github_write: false' in s,"browser GitHub write disabled")
need('automatic_upload: false' in s,"automatic upload disabled")
need('github_token_in_browser: false' in s,"no GitHub token contract")
need('safe_bridge_required: true' in s,"safe Bridge required")
need('.delete(' not in s and '.clear(' not in s and '.put(' not in s,"foundation performs no IndexedDB mutation")
need('setInterval(' not in s and 'MutationObserver' not in s,"no timer or observer")
need('AtlasOracleEvidenceTieredStorageFoundation406482' in s,"runtime API exposed")

need(m["schema"]=="agent_crypto_oracle_evidence_cold_archive_manifest_v1","manifest schema")
need(m["build"]=="40.6.482","manifest build")
need(m["archived_rows"]==0,"initial archive empty")
need(m["chunks"]==[],"initial chunks empty")
need(m["watermark"] is None,"initial watermark null")
need(m["local_retention_allowed"] is False,"manifest retention locked")
need(m["github_token_in_browser"] is False,"manifest no browser token")
need(m["browser_github_write"] is False,"manifest no browser write")
need(m["transport"]["status"]=="PENDING_SAFE_BRIDGE","safe Bridge pending")

app=(ROOT/"administrator/app.js").read_text(encoding="utf-8")
need("atlasOracleEvidenceReadAllByCursor406481" in app,".481 cursor recovery preserved")
need('tx.objectStore(ATLAS_ORACLE_EVIDENCE_STORE).getAll()' not in app,".481 getAll remains removed")

print("40.6.482 ORACLE EVIDENCE TIERED STORAGE FOUNDATION HARNESS PASS")
