#!/usr/bin/env python3
"""Agent-Crypto current version-delivery contract validator.

Validates the deployed chain exactly as it exists:
index*.html -> compatibility bootstrap -> Entry Authority V2 -> build.json.
The loaded build comes from the immutable entry pathname (or ac-build fallback),
not from stale embedded first-paint metadata. This helper is read-only and does
not validate or mutate market/business behavior.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

DEFAULT_BASE = Path("public/agent_crypto_erith_ia/administrator")
PROTECTED_ENGINE = "38.15.11"
BOOTSTRAP = "js/version-truth-406086-authority-lock.js"
OWNER = "js/version-truth-entry-authority-v2.js"


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


def numeric(value: str):
    match = re.fullmatch(r"(\d+)\.(\d+)\.(\d+)", value or "")
    return tuple(int(part) for part in match.groups()) if match else None


def one(pattern: str, text: str, label: str) -> str:
    matches = re.findall(pattern, text, re.S)
    if len(matches) != 1:
        fail(f"{label}: expected exactly 1 match, got {len(matches)}")
    value = matches[0]
    if isinstance(value, tuple):
        value = value[0]
    return str(value)


def validate(base: Path) -> dict:
    truth = load_json(base / "build.json")
    build = str(truth.get("build") or "").strip()
    parent = str(truth.get("parent_build") or "").strip()
    engine = str(truth.get("engine") or "").strip()
    token = str(truth.get("asset_token") or "").strip()

    current = numeric(build)
    previous = numeric(parent)
    if current is None:
        fail(f"invalid published build {build!r}")
    if previous is None or current[:2] != previous[:2] or current[2] != previous[2] + 1:
        fail(f"non-sequential published build {parent!r} -> {build!r}")
    if truth.get("published") is not True:
        fail("build.json published truth missing")
    if engine != PROTECTED_ENGINE:
        fail(f"protected Market Core drift: {engine!r}")
    if token != f"market-core-v2.0-alpha-build-{build}":
        fail(f"asset token drift: {token!r}")

    canonical = base / "index.html"
    immutable = base / f"index-{build}.html"
    bootstrap_path = base / BOOTSTRAP
    owner_path = base / OWNER
    for path in (canonical, immutable, bootstrap_path, owner_path):
        if not path.is_file():
            fail(f"missing version contract file: {path}")

    bootstrap = read(bootstrap_path)
    owner = read(owner_path)

    bootstrap_required = (
        'const KEY = "__ERITH_VERSION_TRUTH_ENTRY_AUTHORITY_V2_LOADING__";',
        'globalThis.ErithVersionTruth?.owner === "version-truth-entry-authority-v2"',
        'script.src = "./js/version-truth-entry-authority-v2.js?v=administrator-build-40.6.87-version-fix-1";',
        'script.async = false;',
        'document.head.appendChild(script);',
    )
    missing = [marker for marker in bootstrap_required if marker not in bootstrap]
    if missing:
        fail(f"compatibility bootstrap contract incomplete: {missing}")
    forbidden_bootstrap = ("setInterval(", "new MutationObserver(", "new IntersectionObserver(", "localStorage.setItem(", "sessionStorage.setItem(")
    for marker in forbidden_bootstrap:
        if marker in bootstrap:
            fail(f"compatibility bootstrap gained forbidden recurring/storage primitive: {marker}")

    owner_required = (
        'const ENGINE = "38.15.11";',
        'const OWNER = "version-truth-entry-authority-v2";',
        'const MANIFEST = "./build.json";',
        'const BUILD_PARAM = "ac-build";',
        'const ENTRY_RE = /(?:^|\\/)index-(\\d+\\.\\d+\\.\\d+)\\.html$/i;',
        'const BUILD = String(entryMatch?.[1] || (BUILD_RE.test(requestedBuild) ? requestedBuild : embeddedBuild) || "UNKNOWN").trim();',
        'const ownerPresent = html.includes("version-truth-406086-authority-lock.js");',
        'immutable_entry_path_authority: true',
        'canonical_build_param_fallback: true',
        'false_propagation_state_removed: true',
        'recurring_timer: false',
        'observer: false',
        'storage_write: false',
    )
    missing = [marker for marker in owner_required if marker not in owner]
    if missing:
        fail(f"Entry Authority V2 contract incomplete: {missing}")
    forbidden_owner = ("setInterval(", "new MutationObserver(", "new IntersectionObserver(", "localStorage.setItem(", "sessionStorage.setItem(")
    for marker in forbidden_owner:
        if marker in owner:
            fail(f"Entry Authority V2 gained forbidden recurring/storage primitive: {marker}")

    bootstrap_tag = re.compile(r'<script\s+src="\./js/version-truth-406086-authority-lock\.js\?v=[^"]+"></script>')
    for path in (canonical, immutable):
        html = read(path)
        if len(bootstrap_tag.findall(html)) != 1:
            fail(f"{path.name} compatibility bootstrap count drift")
        engines = re.findall(r'<meta\s+name="atlas-engine-build"\s+content="([^"]+)"', html)
        if engines != [PROTECTED_ENGINE]:
            fail(f"{path.name} protected engine drift: {engines!r}")

    immutable_name = immutable.name
    path_match = re.fullmatch(r"index-(\d+\.\d+\.\d+)\.html", immutable_name)
    if not path_match or path_match.group(1) != build:
        fail(f"immutable pathname authority drift: {immutable_name}")

    # Static proof of the two supported loaded-build routes in the owner.
    if "entryMatch?.[1] ||" not in owner:
        fail("immutable pathname no longer has first loaded-build priority")
    if "BUILD_RE.test(requestedBuild) ? requestedBuild : embeddedBuild" not in owner:
        fail("canonical ac-build fallback no longer precedes embedded metadata")

    result = {
        "ok": True,
        "build": build,
        "parent_build": parent,
        "market_core": engine,
        "published_truth": "build.json",
        "bootstrap": BOOTSTRAP,
        "runtime_owner": OWNER,
        "immutable_entry": immutable_name,
    }
    print("VERSION_TRUTH_PASS " + json.dumps(result, ensure_ascii=False, sort_keys=True))
    return result


def main() -> int:
    base = DEFAULT_BASE
    if "--base" in sys.argv:
        idx = sys.argv.index("--base")
        if idx + 1 >= len(sys.argv):
            fail("--base requires a value")
        base = Path(sys.argv[idx + 1])
    validate(base)
    return 0


if __name__ == "__main__":
    sys.exit(main())
