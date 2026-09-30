#!/usr/bin/env python3
from pathlib import Path
import json

ROOT=Path("public/agent_crypto_erith_ia")
ADMIN=ROOT/"administrator"
MODULE=ADMIN/"js/oracle-evidence-existing-bridge-integration.js"
LOADER=ADMIN/"js/post-boot-runtime-loader.js"
BUILD=ADMIN/"build.json"
MANIFEST=ROOT/"data/oracle_evidence/manifest.json"
LOCK=Path("coordination/inter_ai_dialogues/agent_crypto/BRIDGE_R17_V1_9_13_GITHUB_TRANSPORT_RESILIENCE_LOCK_40.6.485.md")

def need(cond,label):
    if not cond:
        raise SystemExit("FAIL: "+label)

s=MODULE.read_text(encoding="utf-8")
l=LOADER.read_text(encoding="utf-8")
d=json.loads(BUILD.read_text(encoding="utf-8"))
m=json.loads(MANIFEST.read_text(encoding="utf-8"))
lock=LOCK.read_text(encoding="utf-8")

need('const BUILD="40.6.485";' in s,"module build")
need('const BRIDGE_BASE="http://127.0.0.1:8787";' in s,"Bridge 8787")
need('const INGEST_TIMEOUT_MS=300000;' in s,"browser 300s timeout")
need('Bridge V1.9.13 requis' in s,"Bridge 1.9.13 required")
need('bridge_version_required:"1.9.13"' in s,"snapshot Bridge 1.9.13")
need('timeout_ms:INGEST_TIMEOUT_MS' in s,"ingest uses hardened wait")
need('.delete(' not in s and '.clear(' not in s and '.put(' not in s,"no local DB delete/write")
need('github_token_in_browser:false' in s and 'browser_github_write:false' in s,"browser GitHub lock")
need('automatic_upload:false' in s,"operator-triggered only")
need('127.0.0.1:8791' not in s,"no 8791")
need('oracle-evidence-existing-bridge-integration.js?v=40.6.485' in l,"loader .485")

need(d["build"]=="40.6.485","build truth")
need(d["market_core"]=="38.15.11","Market Core protected")
need(d["strategy_a_modified"] is False and d["strategy_a_business_logic_modified"] is False,"Strategy protected")
need(d["oracle_math_changed"] is False,"Oracle Math protected")
need(d["storage_schema_changed"] is False and d["retention_changed"] is False,"storage protected")
need(d["real_order"] is False,"no real order")
x=d["oracle_evidence_github_transport_resilience_406485"]
need(x["transport_owner"]=="Atlas-10 Crypto Bridge V1.9.13","transport owner")
need(x["github_large_write_timeout_seconds"]==180,"large write timeout")
need(x["github_readback_timeout_seconds"]==120,"readback timeout")
need(x["github_timeout_retries"]==1,"bounded retry")
need(x["browser_ingest_timeout_ms"]==300000,"browser timeout truth")
need(x["first_bundle_jsonl_bytes"]==4269455,"real bundle size fixture")
need(x["local_retention_allowed"] is False and x["local_delete_api_exposed"] is False,"retention locked")

need(m["build"]=="40.6.485","manifest build")
need(m["archived_rows"]==0 and m["chunks"]==[],"no false archive success")
need(m["transport"]["owner"]=="Atlas-10 Crypto Bridge V1.9.13","manifest owner")
need(m["transport"]["github_large_write_timeout_seconds"]==180,"manifest large timeout")
need(m["transport"]["github_readback_timeout_seconds"]==120,"manifest readback timeout")
need(m["transport"]["github_timeout_retries"]==1,"manifest retry")
need(m["local_retention_allowed"] is False,"manifest retention lock")

need("137bd1ac81a3cb8895e18bc1ef15236031f12e15156c676a17e145274c6bd313" in lock,"R17 EXE hash")
need("4,269,455" in lock,"real bundle bytes documented")
need("GITHUB_TIMEOUT" in lock and "Git Blob" in lock,"resilience contract documented")
need("77a69691932ebcfb82bc43c6e0da9289bad08054753280a8f80e6ab8d5a8bc7f" in lock,"Backend hash preserved")

print("40.6.485 ORACLE EVIDENCE GITHUB TRANSPORT RESILIENCE HARNESS PASS")
