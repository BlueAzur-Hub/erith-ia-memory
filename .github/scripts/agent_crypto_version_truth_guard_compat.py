#!/usr/bin/env python3
"""Agent-Crypto canonical versioning guard.

Contract:
- /administrator/ is the only executable update target;
- build.json is the published truth used by version-truth.js for update discovery;
- the loaded build is immutable for the current document;
- two canonical entry architectures are accepted:
  (a) legacy bootstrap -> runtime-shell document replacement;
  (b) direct materialized entry, which deliberately avoids document replacement;
- version-truth.js may detect a newer build, but never rewrites the running one;
- historical /releases/ entries are archives/compatibility only, never required
  for a successful update;
- Market Core 38.15.11 remains protected.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

BASE = Path("public/agent_crypto_erith_ia/administrator")
PROTECTED_ENGINE = "38.15.11"
SEMVER = re.compile(r"^\d+\.\d+\.\d+$")


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


def require_regex(text: str, markers: tuple[tuple[str, str], ...], label: str) -> None:
    missing = [name for name, pattern in markers if re.search(pattern, text, re.MULTILINE) is None]
    if missing:
        fail(f"{label} missing markers: {missing}")


def main() -> int:
    manifest = load_json(BASE / "build.json")
    published = str(manifest.get("build") or "").strip()
    engine = str(manifest.get("engine") or manifest.get("market_core") or "").strip()
    entry = str(manifest.get("entry") or "./").strip() or "./"

    if not SEMVER.fullmatch(published):
        fail(f"invalid published build: {published!r}")
    if manifest.get("published") is not True:
        fail("build.json must be published=true")
    if engine != PROTECTED_ENGINE:
        fail(f"protected Market Core drift: {engine!r}")
    if entry not in {"./", "."}:
        fail(f"published entry must stay canonical Administrator root: {entry!r}")

    current_truth = manifest.get("current_version_truth") or {}
    if current_truth.get("release_subfolder_required_for_update") not in {False, None}:
        fail("build.json still requires a release subfolder for update")

    index = read(BASE / "index.html")
    shell = read(BASE / "runtime-shell.html")
    version = read(BASE / "js/version-truth.js")
    modules = read(BASE / "js/runtime-modules.js")

    require(index, (
        'name="agent-crypto-loaded-build"',
        'name="agent-crypto-published-manifest" content="./build.json"',
    ), "index.html")

    legacy_bootstrap = (
        'async function canonicalIdentity()' in index
        and 'document.write(shell);' in index
    )
    direct_entry = (
        'static-direct-entry' in index
        and 'globalThis.AgentCryptoBootTruth=truth' in index.replace(" ", "")
        and 'document.write(shell);' not in index
        and 'document.open();' not in index
    )

    if legacy_bootstrap:
        require_regex(index, (
            ('canonical identity awaited', r'(?:const\s+truth\s*=\s*await\s+canonicalIdentity\(\)\s*;|const\s*\[\s*truth\s*,\s*rawShell\s*\]\s*=\s*await\s+Promise\.all\(\s*\[\s*canonicalIdentity\(\)\s*,\s*fetchShell\(\)\s*\]\s*\)\s*;)'),
            ('source: "canonical-build.json"', r'source\s*:\s*["\']canonical-build\.json["\']'),
            ('agent-crypto-version-owner", "canonical-entry"', r'["\']agent-crypto-version-owner["\']\s*,\s*["\']canonical-entry["\']'),
            ('globalThis.AgentCryptoBootTruth = truth;', r'globalThis\.AgentCryptoBootTruth\s*=\s*truth\s*;'),
        ), "index.html legacy bootstrap")
        entry_architecture = "legacy-bootstrap-runtime-shell"
    elif direct_entry:
        require_regex(index, (
            ('static loaded build matches manifest', rf'name=["\']agent-crypto-loaded-build["\']\s+content=["\']{re.escape(published)}["\']'),
            ('static administrator build matches manifest', rf'name=["\']administrator-build["\']\s+content=["\']{re.escape(published)}["\']'),
            ('static engine matches protected engine', rf'name=["\']atlas-engine-build["\']\s+content=["\']{re.escape(engine)}["\']'),
            ('static direct version owner', r'name=["\']agent-crypto-version-owner["\']\s+content=["\']static-direct-entry["\']'),
            ('direct truth build', rf'build\s*:\s*["\']{re.escape(published)}["\']'),
            ('direct truth source', r'source\s*:\s*["\']static-direct-entry["\']'),
        ), "index.html direct entry")
        if "const SHELL_URL" in index or "runtime-shell.html: HTTP" in index:
            fail("direct index.html still contains runtime-shell bootstrap fetch")
        entry_architecture = "direct-materialized-entry"
    else:
        fail("index.html matches neither accepted canonical entry architecture")

    for forbidden in (
        'build.json is never consulted to decide the loaded build',
        '<script src="./js/boot.js"></script>',
        'CANONICAL ENTRY 40.',
    ):
        if forbidden in index:
            fail(f"index.html retained obsolete version contract: {forbidden}")

    if "Build —" in index or "Build --" in index:
        fail("index.html contains a visible fake build placeholder")
    if not shell.lstrip().lower().startswith("<!doctype html>"):
        fail("runtime-shell.html is not a document")

    require(version, (
        'const MANIFEST = meta("agent-crypto-published-manifest") || "./build.json";',
        'loaded_build_authority: "canonical-entry"',
        'published_build_authority: "build.json"',
        'update_navigation_target: "canonical-administrator-root"',
        'release_subfolder_required: false',
        'reload_current_build: false',
        'recurring_timer: false',
        'state === "available"',
        'control.disabled = !available',
        'function canonicalEntry(manifest)',
        'window.addEventListener("pageshow"',
        'window.addEventListener("focus"',
        'visibilitychange',
    ), "version-truth.js")

    for forbidden in (
        "location.reload(",
        "syncFooter(",
        "syncMirror(",
        "applyTruth(",
        './releases/${manifest.build}/',
        'loaded_build_authority: "release-entry"',
        'release_subfolder_required: true',
        'const BUILD = "40.',
        'const ATLAS_BUILD = "40.',
        'const ADMIN_BUILD = "40.',
    ):
        if forbidden in version:
            fail(f"version-truth.js retained forbidden runtime authority: {forbidden}")

    require(modules, ('version_branching: false', 'versioned_filenames: false'), "runtime-modules.js")

    print(json.dumps({
        "ok": True,
        "published_build": published,
        "market_core": engine,
        "boot_authority": "administrator/index.html",
        "entry_architecture": entry_architecture,
        "loaded_authority": "canonical-entry",
        "published_authority": "build.json",
        "update_target": "administrator-root",
        "release_subfolder_required": False,
        "current_click_reload": False,
        "recurring_timer": False,
    }, ensure_ascii=False, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
