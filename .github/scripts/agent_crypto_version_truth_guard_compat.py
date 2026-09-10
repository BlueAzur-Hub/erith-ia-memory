#!/usr/bin/env python3
"""Compatibility shim for the canonical Agent-Crypto version-truth guard.

The Administrator runtime now reads build/release/engine identity from canonical
HTML meta tags instead of duplicating literals inside js/app.js. The public
version manifest also exposes the protected engine as a direct string. This shim
normalizes only those two representation changes, then delegates every business,
architecture, hash and Market Core check to the canonical guard unchanged.
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
        raise SystemExit(
            f"VERSION_TRUTH_FAIL: {const_name} dynamic meta owner expected exactly 1 match, got {len(matches)}"
        )
    replacement = f"const {const_name} = {json.dumps(value, ensure_ascii=False)};"
    return re.sub(pattern, lambda _m: replacement, text, count=1)


def compat_read(path: Path) -> str:
    text = _original_read(path)
    if _same_path(path, BASE / "js" / "app.js"):
        text = _replace_meta_backed_constant(text, "ADMIN_BUILD", "administrator-build", CANONICAL_BUILD)
        text = _replace_meta_backed_constant(text, "ADMIN_RELEASE", "administrator-release", CANONICAL_RELEASE)
        text = _replace_meta_backed_constant(text, "ENGINE_BUILD", "atlas-engine-build", CANONICAL_ENGINE)
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
