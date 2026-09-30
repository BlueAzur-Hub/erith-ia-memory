#!/usr/bin/env python3
from pathlib import Path
import json

ROOT=Path("public/agent_crypto_erith_ia")
ADMIN=ROOT/"administrator"
MODULE=ADMIN/"js/oracle-evidence-existing-bridge-integration.js"
FOUNDATION=ADMIN/"js/oracle-evidence-tiered-storage-foundation.js"
LOADER=ADMIN/"js/post-boot-runtime-loader.js"
BUILD=ADMIN/"build.json"
MANIFEST=ROOT/"data/oracle_evidence/manifest.json"
SOURCE_LOCK=Path("coordination/inter_ai_dialogues/agent_crypto/BRIDGE_R16_V1_9_12_ORACLE_EVIDENCE_SOURCE_LOCK_40.6.484.md")
OLD_JS=ADMIN/"js/oracle-evidence-safe-bridge-ingest.js"
OLD_TOOL=ROOT/"tools/oracle_evidence_cold_bridge.py"

def need(cond,label):
    if not cond:
        raise SystemExit("FAIL: "+label)

s=MODULE.read_text(encoding="utf-8")
f=FOUNDATION.read_text(encoding="utf-8")
l=LOADER.read_text(encoding="utf-8")
d=json.loads(BUILD.read_text(encoding="utf-8"))
m=json.loads(MANIFEST.read_text(encoding="utf-8"))
lock=SOURCE_LOCK.read_text(encoding="utf-8")

need('const BUILD="40.6.484";' in s,"module build")
need('const BRIDGE_BASE="http://127.0.0.1:8787";' in s,"existing Bridge 8787")
need("127.0.0.1:8791" not in s,"no 8791 module endpoint")
need('agent_crypto_bridge_auth_40375_token' in s,"existing Bridge session key reused")
need('"Authorization":"Bearer "+token' in s,"Bridge bearer session used")
need('/oracle-evidence/status' in s and '/oracle-evidence/ingest' in s,"bounded Bridge routes")
need('AtlasOracleEvidenceTieredStorageFoundation406482' in s,"40.6.482 foundation reused")
need('.delete(' not in s and '.clear(' not in s and '.put(' not in s,"no IndexedDB delete/write")
need('automatic_upload:false' in s,"operator-triggered only")
need('local_retention_allowed:false' in s and 'local_delete_api_exposed:false' in s,"retention locked")
need('setInterval(' not in s and 'MutationObserver' not in s,"no new timer/observer")
need('oracle-evidence-existing-bridge-integration.js?v=40.6.484' in l,"loader uses 40.6.484 owner")
need('oracle-evidence-safe-bridge-ingest.js?v=40.6.483' not in l,"loader no longer uses 40.6.483 owner")
need('AtlasOracleEvidenceTieredStorageFoundation406482' in f,"foundation preserved")
need(not OLD_JS.exists(),"superseded 40.6.483 browser owner removed")
need(not OLD_TOOL.exists(),"superseded standalone 8791 tool removed")

need(d["build"]=="40.6.484","build truth")
need(d["market_core"]=="38.15.11","Market Core protected")
need(d["strategy_a_modified"] is False and d["strategy_a_business_logic_modified"] is False,"Strategy A protected")
need(d["oracle_math_changed"] is False,"Oracle Math protected")
need(d["storage_schema_changed"] is False and d["retention_changed"] is False,"storage/retention protected")
need(d["real_order"] is False,"no real order")
x=d["oracle_evidence_existing_bridge_integration_406484"]
need(x["bridge_url"]=="http://127.0.0.1:8787","build Bridge truth")
need(x["backend_url"]=="http://127.0.0.1:8790" and x["backend_modified"] is False,"backend preserved")
need(x["standalone_8791_superseded"] is True,"8791 superseded")
need(x["local_retention_allowed"] is False and x["local_delete_api_exposed"] is False,"build retention lock")
need(x["github_token_in_browser"] is False and x["browser_github_write"] is False,"browser GitHub lock")

need(m["build"]=="40.6.484","manifest build")
need(m["local_retention_allowed"] is False,"manifest retention lock")
need(m["github_token_in_browser"] is False and m["browser_github_write"] is False,"manifest browser lock")
need(m["transport"]["endpoint"]=="http://127.0.0.1:8787/oracle-evidence/ingest","manifest existing Bridge endpoint")
need(m["transport"]["automatic_upload"] is False,"manifest no auto upload")
need(m["transport"]["standalone_8791_superseded"] is True,"manifest 8791 superseded")

need("Bridge V1.9.12" in lock,"Bridge source lock version")
need("6e4ffd5812c2f39d3d583364b96b7fdcd5d63bcb9b97f9f1503d6ab7f7f15f40" in lock,"R16 EXE hash locked")
need("77a69691932ebcfb82bc43c6e0da9289bad08054753280a8f80e6ab8d5a8bc7f" in lock,"Backend unchanged hash locked")

print("40.6.484 ORACLE EVIDENCE EXISTING BRIDGE INTEGRATION HARNESS PASS")
