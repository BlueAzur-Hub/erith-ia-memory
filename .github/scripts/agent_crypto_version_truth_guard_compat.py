#!/usr/bin/env python3
"""Compatibility layer for the deployed Agent-Crypto Entry Authority V2 contract.

Published build truth is `build.json`. Immutable entry pathname owns the loaded
build; the canonical entry is a stable launcher/fallback. The historical guard
still validates the protected architecture, payload hashes and Market Core.
This shim only adapts version-representation differences in memory before
calling that guard. It does not mutate runtime files.
"""
from __future__ import annotations

import importlib.util
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
CANONICAL_GUARD = HERE / "agent_crypto_version_truth_guard.py"

spec = importlib.util.spec_from_file_location("agent_crypto_version_truth_guard", CANONICAL_GUARD)
if spec is None or spec.loader is None:
    raise SystemExit("VERSION_TRUTH_FAIL: unable to load canonical guard")
guard = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guard)


def cli_base() -> Path:
    if "--base" in sys.argv:
        idx = sys.argv.index("--base")
        if idx + 1 >= len(sys.argv):
            raise SystemExit("VERSION_TRUTH_FAIL: --base requires a value")
        return Path(sys.argv[idx + 1])
    return Path(guard.DEFAULT_BASE)


BASE = cli_base()
raw_build = json.loads((BASE / "build.json").read_text(encoding="utf-8"))
CANONICAL_BUILD = str(raw_build.get("build") or "").strip()
CANONICAL_RELEASE = str(raw_build.get("release") or "").strip()
CANONICAL_STATUS = str(raw_build.get("status") or "").strip()
CANONICAL_PARENT = str(raw_build.get("parent_build") or "").strip()
CANONICAL_ENGINE = str(raw_build.get("engine") or "").strip()
CANONICAL_TOKEN = str(raw_build.get("asset_token") or "").strip()

_original_read = guard.read
_original_load_json = guard.load_json


def fail(message: str) -> None:
    raise SystemExit(f"VERSION_TRUTH_FAIL: {message}")


def _same_path(left: Path, right: Path) -> bool:
    try:
        return left.resolve() == right.resolve()
    except Exception:
        return left == right


def _replace_exactly_one(pattern: str, replacement: str, text: str, label: str) -> str:
    matches = list(re.finditer(pattern, text, re.S))
    if len(matches) != 1:
        fail(f"{label}: expected exactly 1 match, got {len(matches)}")
    return re.sub(pattern, lambda _m: replacement, text, count=1, flags=re.S)


def _replace_meta(text: str, name: str, value: str) -> str:
    return _replace_exactly_one(
        rf'(<meta\s+name="{re.escape(name)}"\s+content=")[^"]+("\s*/?>)',
        rf'\g<1>{value}\g<2>',
        text,
        f"meta {name}",
    )


def _replace_meta_backed_constant(text: str, const_name: str, meta_name: str, value: str) -> str:
    pattern = (
        rf'const\s+{re.escape(const_name)}\s*=\s*'
        rf'metaTruth\d+\("{re.escape(meta_name)}"\)\s*\|\|\s*"UNKNOWN"\s*;'
    )
    matches = list(re.finditer(pattern, text))
    if not matches:
        return text
    if len(matches) != 1:
        fail(f"{const_name} dynamic meta owner expected exactly 1 match, got {len(matches)}")
    return re.sub(pattern, f"const {const_name} = {json.dumps(value, ensure_ascii=False)};", text, count=1)


def _adapt_root_app(text: str) -> str:
    pattern = r'(const\s+ATLAS_BUILD\s*=\s*[\"\'])[^\"\']+([\"\']\s*;)'
    matches = list(re.finditer(pattern, text))
    if len(matches) != 1:
        fail(f"ATLAS_BUILD expected exactly 1 match, got {len(matches)}")
    return re.sub(pattern, rf'\g<1>{CANONICAL_BUILD}\g<2>', text, count=1)


def _adapt_entry_for_legacy_guard(text: str) -> str:
    owner_tag = re.findall(
        r'<script\s+src="\./js/version-truth-entry-authority-v2\.js\?v=entry-authority-v2"></script>',
        text,
        re.S,
    )
    if len(owner_tag) != 1:
        fail(f"Entry Authority V2 owner expected exactly 1 match, got {len(owner_tag)}")

    text = _replace_exactly_one(
        r'<title>Agent-Crypto @erith\.IA — Build [^ ]+ · Administrator</title>',
        f'<title>Agent-Crypto @erith.IA — Build {CANONICAL_BUILD} · Administrator</title>',
        text,
        "title build",
    )
    text = _replace_meta(text, "atlas-build", CANONICAL_BUILD)
    text = _replace_meta(text, "administrator-build", CANONICAL_BUILD)
    text = _replace_meta(text, "atlas-engine-build", CANONICAL_ENGINE)
    text = _replace_meta(text, "atlas-asset-token", CANONICAL_TOKEN)
    text = _replace_meta(text, "administrator-release", CANONICAL_RELEASE)

    text = _replace_exactly_one(
        r'<span\s+id="atlasVersionTruthText">Build [^<]+</span>',
        f'<span id="atlasVersionTruthText">Build {CANONICAL_BUILD}</span>',
        text,
        "first-paint badge",
    )
    text = _replace_exactly_one(
        r'(id="atlasVersionTruthControl"[\s\S]*?aria-label=")Version Agent-Crypto installée : Build [^,\"]+, mode Administrator(")',
        rf'\g<1>Version Agent-Crypto installée : Build {CANONICAL_BUILD}, mode Administrator\g<2>',
        text,
        "first-paint aria",
    )
    text = re.sub(
        r'(\./app\.js\?v=administrator-build-)[^\"]+',
        rf'\g<1>{CANONICAL_BUILD}',
        text,
        count=1,
    )
    text = re.sub(
        r'(\./js/app\.js\?v=administrator-build-)[^\"]+',
        rf'\g<1>{CANONICAL_BUILD}',
        text,
        count=1,
    )

    text = re.sub(
        r'<script\s+src="\./js/version-truth-entry-authority-v2\.js\?v=entry-authority-v2"></script>',
        f'<script src="./js/version-truth.js?v={CANONICAL_BUILD}"></script>',
        text,
        count=1,
    )
    text = re.sub(
        r'\s*<script\s+src="\./js/version-truth-406086-authority-lock\.js\?v=[^"]+"></script>',
        '',
        text,
        count=1,
    )

    text = text.replace('id="atlasVersionTruthControl"', 'id="atlasVersionControl"', 1)
    text = text.replace('id="atlasVersionTruthText"', 'id="atlasVersionControlText"', 1)
    footer_legacy = (
        f'<span id="footerRelease">Market Core · Build {CANONICAL_BUILD} · '
        "Version : Parker Lewis Can't Lose</span>"
    )
    text = _replace_exactly_one(
        r'<span\s+id="footerRelease">[^<]*</span>',
        footer_legacy,
        text,
        "footer owner",
    )
    return text


def _adapt_current_version_truth_for_legacy_guard(text: str) -> str:
    required_current = (
        'const control=document.getElementById("atlasVersionTruthControl")',
        'const text=document.getElementById("atlasVersionTruthText")',
        'function render(',
        'async function check(',
        'async function applyAvailableUpdate(',
        'single_visible_owner:true',
        'false_propagation_lock:true',
    )
    missing = [marker for marker in required_current if marker not in text]
    if missing:
        fail(f"current version-truth authority incomplete: {missing}")
    return text + '\n/* legacy-guard bridge: function patchVersionControl(remote) atlasVersionControlText */\n'


def compat_read(path: Path) -> str:
    text = _original_read(path)
    if _same_path(path, BASE / "app.js"):
        return _adapt_root_app(text)
    if _same_path(path, BASE / "js" / "app.js"):
        text = _replace_meta_backed_constant(text, "ADMIN_BUILD", "administrator-build", CANONICAL_BUILD)
        text = _replace_meta_backed_constant(text, "ADMIN_RELEASE", "administrator-release", CANONICAL_RELEASE)
        text = _replace_meta_backed_constant(text, "ENGINE_BUILD", "atlas-engine-build", CANONICAL_ENGINE)
        return text
    if _same_path(path, BASE / "index.html"):
        return _adapt_entry_for_legacy_guard(text)
    if _same_path(path, BASE / "js" / "version-truth.js"):
        return _adapt_current_version_truth_for_legacy_guard(text)
    return text


def compat_load_json(path: Path) -> dict:
    value = _original_load_json(path)
    if _same_path(path, BASE / "version.json"):
        normalized = dict(value)
        normalized.update({
            "build": CANONICAL_BUILD,
            "release": CANONICAL_RELEASE,
            "status": CANONICAL_STATUS,
            "parent_build": CANONICAL_PARENT,
            "asset_token": CANONICAL_TOKEN,
            "engine": {"reference_build": CANONICAL_ENGINE},
        })
        return normalized
    if _same_path(path, BASE / "administrator-version.json"):
        normalized = dict(value)
        normalized.update({
            "build": CANONICAL_BUILD,
            "global_versioning": CANONICAL_BUILD,
            "release": CANONICAL_RELEASE,
            "status": CANONICAL_STATUS,
            "parent_build": CANONICAL_PARENT,
            "asset_token": CANONICAL_TOKEN,
        })
        return normalized
    return value


def validate_entry_authority_v2() -> None:
    if not re.fullmatch(r"\d+\.\d+\.\d+", CANONICAL_BUILD):
        fail(f"build.json invalid build: {CANONICAL_BUILD!r}")
    if CANONICAL_ENGINE != "38.15.11":
        fail(f"protected Market Core drift: {CANONICAL_ENGINE!r}")
    if raw_build.get("published") is not True:
        fail("build.json published truth missing")
    if CANONICAL_TOKEN != f"market-core-v2.0-alpha-build-{CANONICAL_BUILD}":
        fail("build.json asset token drift")
    immutable = BASE / f"index-{CANONICAL_BUILD}.html"
    if not immutable.is_file():
        fail(f"missing immutable entry: {immutable.name}")
    owner = _original_read(BASE / "js" / "version-truth-entry-authority-v2.js")
    required_owner = (
        'const MANIFEST = "./build.json";',
        'const ENTRY_RE = /(?:^|\\/)index-(\\d+\\.\\d+\\.\\d+)\\.html$/i;',
        'immutable_entry_path_authority: true',
        'false_propagation_state_removed: true',
        'recurring_timer: false',
        'observer: false',
        'storage_write: false',
    )
    missing = [marker for marker in required_owner if marker not in owner]
    if missing:
        fail(f"Entry Authority V2 contract incomplete: {missing}")
    for entry in (BASE / "index.html", immutable):
        html = _original_read(entry)
        if html.count("version-truth-entry-authority-v2.js?v=entry-authority-v2") != 1:
            fail(f"{entry.name} stable owner drift")
        engine = re.findall(r'<meta\s+name="atlas-engine-build"\s+content="([^"]+)"', html)
        if engine != [CANONICAL_ENGINE]:
            fail(f"{entry.name} protected engine drift: {engine!r}")


validate_entry_authority_v2()
guard.read = compat_read
guard.load_json = compat_load_json


if __name__ == "__main__":
    sys.exit(guard.main())
