#!/usr/bin/env python3
"""Agent-Crypto versioning guard.

Contract:
- loaded build belongs to the release entry being executed;
- published build belongs to build.json;
- the update control may compare them, but must never rewrite the loaded build;
- a published successor must exist as an immutable release directory before it
  can become the published pointer;
- no current-build click may reload the application.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

BASE = Path("public/agent_crypto_erith_ia/administrator")
PROTECTED_ENGINE = "38.15.11"
SEMVER = re.compile(r"^\d+\.\d+\.\d+$")
LOADED_META = re.compile(r'<meta\s+name=["\']agent-crypto-loaded-build["\']\s+content=["\']([^"\']+)["\']', re.I)


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


def loaded_build_from_index(index: str, label: str) -> str:
    match = LOADED_META.search(index)
    if not match:
        fail(f"{label} has no agent-crypto-loaded-build meta")
    build = match.group(1).strip()
    if not SEMVER.fullmatch(build):
        fail(f"{label} loaded build invalid: {build!r}")
    return build


def main() -> int:
    manifest = load_json(BASE / "build.json")
    published = str(manifest.get("build") or "").strip()
    engine = str(manifest.get("engine") or manifest.get("market_core") or "").strip()
    if not SEMVER.fullmatch(published):
        fail(f"invalid published build: {published!r}")
    if manifest.get("published") is not True:
        fail("build.json must be published=true")
    if engine != PROTECTED_ENGINE:
        fail(f"protected Market Core drift: {engine!r}")

    index = read(BASE / "index.html")
    shell = read(BASE / "runtime-shell.html")
    version = read(BASE / "js/version-truth.js")
    modules = read(BASE / "js/runtime-modules.js")

    loaded = loaded_build_from_index(index, "index.html")

    require(index, (
        'name="agent-crypto-loaded-build"',
        'name="agent-crypto-published-manifest" content="./build.json"',
        'build.json is never consulted to decide the loaded build',
        'globalThis.AgentCryptoBootTruth = truth;',
        'document.write(shell);',
    ), "index.html")
    if '<script src="./js/boot.js"></script>' in index:
        fail("index.html still delegates loaded-build identity to cacheable boot.js")
    if "Build —" in index or "Build --" in index:
        fail("index.html contains a visible fake build placeholder")

    if not shell.lstrip().lower().startswith("<!doctype html>"):
        fail("runtime-shell.html is not a document")

    require(version, (
        'const MANIFEST = meta("agent-crypto-published-manifest") || "./build.json";',
        'loaded_build_authority: "release-entry"',
        'published_build_authority: "build.json"',
        'reload_current_build: false',
        'state === "available"',
        'control.disabled = !available',
        './releases/${manifest.build}/',
    ), "version-truth.js")

    for forbidden in (
        "location.reload(",
        "syncFooter(",
        "syncMirror(",
        "applyTruth(",
        'const BUILD = "40.',
        'const ATLAS_BUILD = "40.',
        'const ADMIN_BUILD = "40.',
    ):
        if forbidden in version:
            fail(f"version-truth.js retained forbidden runtime authority: {forbidden}")

    require(modules, ('version_branching: false', 'versioned_filenames: false'), "runtime-modules.js")

    # Current 40.6.124 is the transition release at root. Every published
    # successor must be fully materialized as an immutable directory before
    # build.json can point to it.
    if published != loaded:
        release_dir = BASE / "releases" / published
        release_index_path = release_dir / "index.html"
        release_index = read(release_index_path)
        release_loaded = loaded_build_from_index(release_index, str(release_index_path))
        if release_loaded != published:
            fail(f"published release entry mismatch: {release_loaded!r} != {published!r}")
        if not (release_dir / "runtime-shell.html").is_file():
            fail(f"published immutable release missing runtime-shell.html: {release_dir}")
        if not (release_dir / "js" / "version-truth.js").is_file():
            fail(f"published immutable release missing js/version-truth.js: {release_dir}")

    print(json.dumps({
        "ok": True,
        "loaded_build": loaded,
        "published_build": published,
        "market_core": engine,
        "loaded_authority": "release-entry",
        "published_authority": "build.json",
        "current_click_reload": False,
        "immutable_successor_required": published != loaded,
    }, ensure_ascii=False, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
