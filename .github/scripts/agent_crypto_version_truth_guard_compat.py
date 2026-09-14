#!/usr/bin/env python3
"""Agent-Crypto BOOT / VERSION clean-room guard.

Release numbers belong to build.json and Git history. They must not select or
name active runtime owners. Market Core 38.15.11 remains protected.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

BASE = Path("public/agent_crypto_erith_ia/administrator")
PROTECTED_ENGINE = "38.15.11"
SEMVER = re.compile(r"^\d+\.\d+\.\d+$")
VERSIONED_JS = re.compile(r"-\d{6}(?:-[a-z0-9-]+)?\.js", re.I)


def fail(message: str) -> None:
    raise SystemExit(f"VERSION_TRUTH_FAIL: {message}")


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
        fail(f"JSON root must be object: {path}")
    return value


def require(text: str, markers: tuple[str, ...], label: str) -> None:
    missing = [marker for marker in markers if marker not in text]
    if missing:
        fail(f"{label} missing markers: {missing}")


def main() -> int:
    truth = load_json(BASE / "build.json")
    build = str(truth.get("build") or "").strip()
    engine = str(truth.get("engine") or truth.get("market_core") or "").strip()
    if not SEMVER.fullmatch(build):
        fail(f"invalid published build: {build!r}")
    if truth.get("published") is not True:
        fail("build.json must be published=true")
    if engine != PROTECTED_ENGINE:
        fail(f"protected Market Core drift: {engine!r}")

    index = read(BASE / "index.html")
    boot = read(BASE / "js/boot.js")
    shell = read(BASE / "runtime-shell.html")
    version = read(BASE / "js/version-truth.js")
    modules = read(BASE / "js/runtime-modules.js")

    require(index, ('<script src="./js/boot.js"></script>', 'Agent-Crypto Administrator — Initialisation'), "index.html")
    if re.search(r"40\.6\.\d+", index):
        fail("index.html contains a release number")
    if "index-" in index or "ac-build" in index:
        fail("index.html retained immutable-entry/version handoff logic")

    require(boot, ('const MANIFEST_URL = "./build.json";', 'const SHELL_URL = "./runtime-shell.html";', 'globalThis.AgentCryptoBootTruth = truth;'), "boot.js")
    if re.search(r"40\.6\.\d+", boot):
        fail("boot.js contains a release number")

    if not shell.lstrip().lower().startswith("<!doctype html>"):
        fail("runtime-shell.html is not a document")

    require(version, ('const MANIFEST = "./build.json";', 'const RUNTIME_REGISTRY = "./js/runtime-modules.js";', 'build_json_authority: true', 'version_branching: false'), "version-truth.js")
    for forbidden in ("version-truth-406086", "index-", "ac-build", "atLeast(", "ensureSuccessor"):
        if forbidden in version:
            fail(f"version-truth.js retained legacy branch logic: {forbidden}")

    require(modules, ('version_branching: false', 'versioned_filenames: false'), "runtime-modules.js")
    if re.search(r"40\.6\.\d+", modules):
        fail("runtime-modules.js contains a release number")
    if VERSIONED_JS.search(modules):
        fail("runtime-modules.js loads a build-numbered JavaScript filename")

    stable = (
        "js/generated-report-version-truth.js",
        "js/pedagogy-version-truth.js",
        "js/local-ai-contract-consistency.js",
        "js/tradus-strategy-a-reconcile.js",
        "js/dex-freshness-guard.js",
        "js/local-dialogue-presentation.js",
        "js/tradus-canonical-strategy-reader.js",
        "js/strategy-a-auto-start.js",
        "js/tradus-autonomous-refresh.js",
    )
    for rel in stable:
        if not (BASE / rel).is_file():
            fail(f"missing stable runtime owner: {rel}")

    print(json.dumps({
        "ok": True,
        "build": build,
        "market_core": engine,
        "release_authority": "build.json",
        "boot": "js/boot.js",
        "runtime_shell": "runtime-shell.html",
        "version_owner": "js/version-truth.js",
        "runtime_registry": "js/runtime-modules.js",
        "versioned_runtime_filenames": False,
    }, ensure_ascii=False, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
