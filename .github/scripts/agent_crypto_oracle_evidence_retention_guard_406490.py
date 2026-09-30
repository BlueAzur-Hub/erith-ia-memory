#!/usr/bin/env python3
"""Static safety proof for Agent-Crypto 40.6.490.

This guard never opens IndexedDB and never exercises a real deletion. It proves
the shipped source contains the mandatory retention gates and none of the
forbidden global-delete APIs.
"""
from __future__ import annotations

import json
import hashlib
import re
import subprocess
from pathlib import Path


ROOT = Path("public/agent_crypto_erith_ia/administrator")
MODULE = ROOT / "js/oracle-evidence-verified-hot-window-retention-406490.js"
LOADER = ROOT / "js/post-boot-runtime-loader.js"
BUILD = ROOT / "build.json"
INDEX = ROOT / "index.html"
MANIFEST = Path("public/agent_crypto_erith_ia/data/oracle_evidence/manifest.json")


def fail(message: str) -> None:
    raise SystemExit(f"RETENTION_406490_STATIC_FAIL: {message}")


def read(path: Path) -> str:
    if not path.is_file():
        fail(f"missing file: {path}")
    return path.read_text(encoding="utf-8")


def load_json(path: Path) -> dict:
    try:
        value = json.loads(read(path))
    except Exception as exc:
        fail(f"invalid JSON {path}: {exc}")
    if not isinstance(value, dict):
        fail(f"JSON root must be an object: {path}")
    return value


def require(text: str, markers: tuple[str, ...], label: str) -> None:
    missing = [marker for marker in markers if marker not in text]
    if missing:
        fail(f"{label} missing markers: {missing}")


def between(text: str, start: str, end: str, label: str) -> str:
    begin = text.find(start)
    finish = text.find(end, begin + len(start))
    if begin < 0 or finish < 0:
        fail(f"cannot isolate {label}")
    return text[begin:finish]


def main() -> int:
    module = read(MODULE)
    loader = read(LOADER)
    index = read(INDEX)
    build = load_json(BUILD)
    manifest = load_json(MANIFEST)

    # Absolute destructive API exclusions.
    forbidden = {
        "objectStore.clear": r"\.clear\s*\(",
        "indexedDB.deleteDatabase": r"indexedDB\s*\.\s*deleteDatabase\s*\(",
    }
    for name, pattern in forbidden.items():
        if re.search(pattern, module):
            fail(f"forbidden API present: {name}")

    require(module, (
        'const BUILD = "40.6.490";',
        "const HOT_MIN_ROWS = 10000;",
        "const CANARY_MAX_ROWS = 500;",
        'db.transaction(api.store, "readonly")',
        'db.transaction(api.store, "readwrite")',
        "const request = store.delete(id);",
        "deleteExactIds(finalLocal.ids)",
        'automatic_delete: false',
        'delete_all_api_exposed: false',
    ), "bounded exact-key deletion")
    if module.count("deleteExactIds(") != 2:
        fail("exact-key delete helper has an unexpected call surface")

    # The only automatic action in the mount path is preview().
    mount = between(module, "function ensurePanel()", "function render()", "mount path")
    require(mount, ("startPreview", "void preview().catch"), "automatic preview")
    for marker in ("deleteVerifiedChunk(candidate)", "deleteExactIds(", "runCanary();", "continueToHotWindow();"):
        if marker in mount:
            fail(f"automatic mount path can reach deletion: {marker}")

    # Canary and explicit confirmation gates.
    canary = between(module, "async function runCanary()", "async function rerunSizingProbe()", "canary")
    continuation = between(module, "async function continueToHotWindow()", "function snapshot()", "continuation")
    require(canary, (
        "if (state.canary_pass) return snapshot();",
        "Number(chunk.row_count) <= CANARY_MAX_ROWS",
        "operatorConfirm(",
        "deleteVerifiedChunk(candidate)",
        'status: "RETENTION_CANARY_PASS"',
    ), "canary gate")
    require(continuation, (
        'state.canary_pass === true',
        'state.canary_receipt?.status === "RETENTION_CANARY_PASS"',
        'operatorConfirm(',
        'state.action = "HOT_RETENTION_STOPPED"',
    ), "continuation gate")
    require(module, (
        "canary.disabled = state.running || state.preview_running || state.canary_pass;",
        "continuation.disabled = state.running || state.preview_running || !state.canary_pass;",
        'id="btnOracleHot490Continue" disabled',
    ), "disabled continuation button")

    # Mandatory independent public/local proof and exact boundaries.
    verify = between(module, "async function verifyChunkBeforeDelete(candidate)", "async function deleteExactIds(ids)", "pre-delete proof")
    require(verify, (
        "const manifest = await fetchManifest();",
        "assertVerifiedChunk(current, manifest.watermark);",
        "const cold = await readColdProof(current);",
        "const local = await readLocalProof(current);",
        'assert(cold.sha256 === local.sha256, "SHA public/local divergent")',
        "compareMark(cold.first, local.first) === 0",
        "compareMark(cold.last, local.last) === 0",
    ), "GitHub/local double proof")
    require(module, (
        'assert(sha256 === String(chunk.sha256), "SHA-256 public divergent")',
        'assert(sha256 === String(chunk.sha256), "SHA-256 local divergent")',
        'assert(rows.length === Number(chunk.row_count)',
        'Number(first.t0) === Number(chunk.first_t0)',
        'String(first.id || "") === String(chunk.first_id || "")',
        'Number(last.t0) === Number(chunk.last_t0)',
        'String(last.id || "") === String(chunk.last_id || "")',
        'compareMark(lastMark(chunk), watermark) <= 0',
    ), "hash/row-count/boundary proof")

    # HOT >= 10,000 before and after every transaction.
    delete_one = between(module, "async function deleteVerifiedChunk(candidate)", "function operatorConfirm(message)", "chunk deletion")
    require(delete_one, (
        'before - Number(proof.chunk.row_count) >= HOT_MIN_ROWS',
        'remaining >= HOT_MIN_ROWS',
        "await assertIdsAbsent(finalLocal.ids);",
    ), "HOT invariant")

    # Version Truth and load order.
    module_ref = "oracle-evidence-verified-hot-window-retention-406490.js?v=40.6.490"
    sizing_ref = "oracle-evidence-hot-window-sizing-406489.js?v=40.6.489"
    require(loader, ('const BUILD="40.6.490";', sizing_ref, module_ref), "runtime loader")
    if loader.index(sizing_ref) >= loader.index(module_ref):
        fail("40.6.490 must load after the READ ONLY 40.6.489 probe")
    require(index, (
        'name="agent-crypto-loaded-build" content="40.6.490"',
        "Build 40.6.490 · Administrator",
        "post-boot-runtime-loader.js?v=40.6.490",
    ), "canonical index Version Truth")

    retention = build.get("oracle_evidence_verified_hot_window_retention_406490") or {}
    expected_build_flags = {
        "hot_min_rows": 10000,
        "canary_required": True,
        "canary_max_rows": 500,
        "continue_disabled_until_canary_pass": True,
        "complete_verified_chunks_only": True,
        "public_sha256_required": True,
        "local_canonical_sha256_required": True,
        "stop_on_first_mismatch": True,
        "automatic_delete": False,
        "delete_all_api_exposed": False,
        "cold_archive_modified": False,
    }
    if build.get("build") != "40.6.490" or build.get("engine") != "38.15.11":
        fail("build or protected Market Core Version Truth mismatch")
    for key, expected in expected_build_flags.items():
        if retention.get(key) != expected:
            fail(f"build.json retention flag mismatch: {key}")

    # Cold archive input is internally complete; the test does not mutate it.
    chunks = manifest.get("chunks") if isinstance(manifest.get("chunks"), list) else []
    if len(chunks) != 74 or manifest.get("archived_rows") != 36056:
        fail("expected cold archive inventory 36,056 / 74 not present")
    if any(str(chunk.get("status", "")).upper() != "VERIFIED" for chunk in chunks):
        fail("cold archive contains a non-VERIFIED chunk")
    if sum(int(chunk.get("row_count") or 0) for chunk in chunks) != 36056:
        fail("cold archive row_count sum mismatch")

    cold_root = MANIFEST.parent
    cold_bytes = 0
    for chunk in chunks:
        relative = str(chunk.get("relative_path") or "")
        path = cold_root / relative
        if not relative or ".." in Path(relative).parts or not path.is_file():
            fail(f"cold chunk path invalid or missing: {relative}")
        try:
            raw = subprocess.check_output(("git", "show", f"HEAD:{path.as_posix()}"))
        except subprocess.CalledProcessError as exc:
            fail(f"cannot read tracked cold blob: {relative}: {exc}")
        cold_bytes += len(raw)
        if hashlib.sha256(raw).hexdigest() != str(chunk.get("sha256") or ""):
            fail(f"cold chunk SHA-256 mismatch: {relative}")
        lines = raw.splitlines()
        if len(lines) != int(chunk.get("row_count") or 0):
            fail(f"cold chunk row_count mismatch: {relative}")
        try:
            first = json.loads(lines[0])
            last = json.loads(lines[-1])
        except Exception as exc:
            fail(f"cold chunk boundary JSON invalid: {relative}: {exc}")
        expected = (
            int(chunk.get("first_t0") or 0),
            str(chunk.get("first_id") or ""),
            int(chunk.get("last_t0") or 0),
            str(chunk.get("last_id") or ""),
        )
        observed = (
            int(first.get("t0") or 0),
            str(first.get("id") or ""),
            int(last.get("t0") or 0),
            str(last.get("id") or ""),
        )
        if observed != expected:
            fail(f"cold chunk first/last boundary mismatch: {relative}")

    print(json.dumps({
        "ok": True,
        "build": "40.6.490",
        "market_core": "38.15.11",
        "automatic_delete": False,
        "delete_all_api": False,
        "canary_required": True,
        "hot_min_rows": 10000,
        "public_sha256_required": True,
        "local_sha256_required": True,
        "verified_chunks": len(chunks),
        "archived_rows": manifest.get("archived_rows"),
        "cold_bytes_verified": cold_bytes,
        "real_indexeddb_touched": False,
    }, ensure_ascii=False, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
