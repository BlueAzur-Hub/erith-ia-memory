#!/usr/bin/env python3
from pathlib import Path
import copy
import hashlib
import importlib.util
import json

ROOT = Path("public/agent_crypto_erith_ia")
BRIDGE = ROOT / "tools/oracle_evidence_cold_bridge.py"
BROWSER = ROOT / "administrator/js/oracle-evidence-safe-bridge-ingest.js"
FOUNDATION = ROOT / "administrator/js/oracle-evidence-tiered-storage-foundation.js"
MANIFEST = ROOT / "data/oracle_evidence/manifest.json"

spec = importlib.util.spec_from_file_location("oracle_bridge_406483", BRIDGE)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

def need(cond, label):
    if not cond:
        raise SystemExit("FAIL: " + label)

rows = [
    {"schema":"atlas.oracle.evidence.v1","id":"100-a","t0":100,"build":"test"},
    {"schema":"atlas.oracle.evidence.v1","id":"200-b","t0":200,"build":"test"},
]
jsonl = "".join(json.dumps(row, separators=(",",":")) + "\n" for row in rows)
sha = hashlib.sha256(jsonl.encode("utf-8")).hexdigest()
bundle = {
    "schema":"agent_crypto_oracle_evidence_transport_bundle_v1",
    "build":"40.6.483",
    "created_at":"2026-09-30T03:30:00Z",
    "chunk":{
        "schema":"agent_crypto_oracle_evidence_cold_chunk_v1",
        "build":"40.6.483",
        "payload_format":"jsonl",
        "relative_path":"2026/09/30/evidence-100-200-2.jsonl",
        "row_count":2,
        "first_t0":100,
        "last_t0":200,
        "first_id":"100-a",
        "last_id":"200-b",
        "sha256":sha,
        "source_database":"agent_crypto_oracle_evidence_v1",
        "source_store":"observations",
        "watermark_after":{"t0":200,"id":"200-b"},
        "local_rows_deleted":False,
        "local_retention_allowed":False,
    },
    "jsonl":jsonl,
    "intended_cold_root":"public/agent_crypto_erith_ia/data/oracle_evidence/",
    "manifest_path":"public/agent_crypto_erith_ia/data/oracle_evidence/manifest.json",
    "bridge_ingest_required":True,
    "browser_github_write":False,
    "github_token_embedded":False,
    "local_delete_authorized":False,
}
validated = mod.validate_bundle(bundle)
need(validated["row_count"] == 2, "bundle row_count")
need(validated["sha256"] == sha, "bundle sha")
need(validated["relative_path"].endswith("-2.jsonl"), "bundle path")

manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
pending, is_new = mod.build_pending_manifest(manifest, validated)
need(is_new is True, "pending manifest creates chunk")
entry = pending["chunks"][-1]
need(entry["status"] == "WRITTEN_PENDING_VERIFY", "pending status")
need(pending["archived_rows"] == 0, "pending not archived")
need(pending["local_retention_allowed"] is False, "pending retention locked")

verified = mod.build_verified_manifest(pending, validated, "deadbeef")
entry = verified["chunks"][-1]
need(entry["status"] == "VERIFIED", "verified status")
need(verified["archived_rows"] == 2, "verified archived count")
need(verified["verification"]["verified_chunks"] == 1, "verified chunk count")
need(verified["watermark"] == {"t0":200,"id":"200-b"}, "verified watermark")
need(all(entry["verification"].values()), "verification proof complete")

tampered = copy.deepcopy(bundle)
tampered["jsonl"] = tampered["jsonl"].replace('"test"', '"tampered"', 1)
try:
    mod.validate_bundle(tampered)
except mod.BridgeError:
    pass
else:
    raise SystemExit("FAIL: tampered SHA accepted")

traversal = copy.deepcopy(bundle)
traversal["chunk"]["relative_path"] = "../escape.jsonl"
try:
    mod.validate_bundle(traversal)
except mod.BridgeError:
    pass
else:
    raise SystemExit("FAIL: path traversal accepted")

browser = BROWSER.read_text(encoding="utf-8")
foundation = FOUNDATION.read_text(encoding="utf-8")
bridge = BRIDGE.read_text(encoding="utf-8")
need('const BUILD="40.6.483";' in browser, "browser build identity")
need("127.0.0.1:8791" in browser, "loopback bridge endpoint")
need("X-Erith-Bridge-Intent" in browser, "explicit bridge intent header")
need("AtlasOracleEvidenceTieredStorageFoundation406482" in browser, ".482 foundation reused")
need(".delete(" not in browser and ".clear(" not in browser and ".put(" not in browser, "browser no IndexedDB delete/write")
need("github_token_in_browser:false" in browser, "browser token lock")
need("automatic_upload:false" in browser, "operator-triggered only")
need("setInterval(" not in browser and "MutationObserver" not in browser, "no timer/observer")
need("127.0.0.1" in bridge and 'HOST = "127.0.0.1"' in bridge, "bridge loopback only")
need("ERITH_GITHUB_TOKEN" in bridge and "gh auth token" not in bridge, "bridge auth source code present")
need("local_delete_api" in bridge, "bridge delete API lock")
need("ghp_" not in bridge and "github_pat_" not in bridge, "no hardcoded GitHub token")
need("AtlasOracleEvidenceTieredStorageFoundation406482" in foundation, ".482 foundation preserved")

print("40.6.483 ORACLE EVIDENCE SAFE BRIDGE HARNESS PASS")
