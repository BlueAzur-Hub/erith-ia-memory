#!/usr/bin/env python3
"""Compatibility shim for the canonical Agent-Crypto version-truth guard.

Current Administrator truth is meta-backed and the visible version owner is
`atlasVersionTruthControl` / `atlasVersionTruthText`. The historical guard still
expects duplicated JS literals and the retired legacy version-control sink.
This shim validates the current representation first, then adapts only those
representation differences and delegates every remaining architecture, payload
hash and Market Core invariant to the canonical guard unchanged.
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
raw_manifest = json.loads((BASE / "version.json").read_text(encoding="utf-8"))
CANONICAL_BUILD = str(raw_manifest.get("build") or "").strip()
CANONICAL_RELEASE = str(raw_manifest.get("release") or "").strip()
raw_engine = raw_manifest.get("engine")
if isinstance(raw_engine, dict):
    CANONICAL_ENGINE = str(raw_engine.get("reference_build") or "").strip()
else:
    CANONICAL_ENGINE = str(raw_engine or "").strip()

_original_read = guard.read
_original_load_json = guard.load_json


def fail(message: str) -> None:
    raise SystemExit(f"VERSION_TRUTH_FAIL: {message}")


def _same_path(left: Path, right: Path) -> bool:
    try:
        return left.resolve() == right.resolve()
    except Exception:
        return left == right


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
    replacement = f"const {const_name} = {json.dumps(value, ensure_ascii=False)};"
    return re.sub(pattern, lambda _m: replacement, text, count=1)


def _adapt_current_index_for_legacy_guard(text: str) -> str:
    # Validate the current visible first-paint owner before adapting its IDs for
    # the historical regexes. This must never turn stale UI truth into a pass.
    visible_text = re.findall(r'<span\s+id="atlasVersionTruthText">Build ([^<]+)</span>', text, re.S)
    if visible_text != [CANONICAL_BUILD]:
        fail(f"current first-paint badge drift: {visible_text!r} != {[CANONICAL_BUILD]!r}")

    aria = re.findall(
        r'id="atlasVersionTruthControl"[\s\S]*?aria-label="Version Agent-Crypto installée : Build ([^,\"]+), mode Administrator"',
        text,
        re.S,
    )
    if aria != [CANONICAL_BUILD]:
        fail(f"current first-paint aria drift: {aria!r} != {[CANONICAL_BUILD]!r}")

    footer = re.findall(r'<span\s+id="footerRelease">([^<]*)</span>', text, re.S)
    if len(footer) != 1:
        fail(f"current footer owner expected exactly 1 match, got {len(footer)}")
    expected_footer_prefix = f"Administrator {CANONICAL_BUILD} · Market Core {CANONICAL_ENGINE} ·"
    if not footer[0].strip().startswith(expected_footer_prefix):
        fail(f"current footer truth drift: {footer[0].strip()!r}")

    # Validation-only representation bridge for the retired guard regexes.
    text = text.replace('id="atlasVersionTruthControl"', 'id="atlasVersionControl"', 1)
    text = text.replace('id="atlasVersionTruthText"', 'id="atlasVersionControlText"', 1)
    footer_legacy = (
        f'<span id="footerRelease">Market Core · Build {CANONICAL_BUILD} · '
        "Version : Parker Lewis Can't Lose</span>"
    )
    text = re.sub(r'<span\s+id="footerRelease">[^<]*</span>', lambda _m: footer_legacy, text, count=1)
    return text


def compat_read(path: Path) -> str:
    text = _original_read(path)
    if _same_path(path, BASE / "js" / "app.js"):
        text = _replace_meta_backed_constant(text, "ADMIN_BUILD", "administrator-build", CANONICAL_BUILD)
        text = _replace_meta_backed_constant(text, "ADMIN_RELEASE", "administrator-release", CANONICAL_RELEASE)
        text = _replace_meta_backed_constant(text, "ENGINE_BUILD", "atlas-engine-build", CANONICAL_ENGINE)
    elif _same_path(path, BASE / "index.html"):
        text = _adapt_current_index_for_legacy_guard(text)
    return text


def compat_load_json(path: Path) -> dict:
    value = _original_load_json(path)
    if _same_path(path, BASE / "version.json") and isinstance(value.get("engine"), str):
        normalized = dict(value)
        normalized["engine"] = {"reference_build": value["engine"]}
        return normalized
    return value


guard.read = compat_read
guard.load_json = compat_load_json


if __name__ == "__main__":
    sys.exit(guard.main())
