#!/usr/bin/env python3
"""Agent-Crypto Administrator canonical version-truth validator.

Read-only CI helper.  The canonical public manifest is the declared release
identity; every first-paint/runtime/mirror authority must agree with it.
No market data, business logic, runtime state or protected Market Core is
modified by this script.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

DEFAULT_BASE = Path("public/agent_crypto_erith_ia/administrator")
PROTECTED_ENGINE = "38.15.11"


def fail(message: str) -> None:
    raise SystemExit(f"VERSION_TRUTH_FAIL: {message}")


def read(path: Path) -> str:
    if not path.is_file():
        fail(f"missing file: {path}")
    return path.read_text(encoding="utf-8")


def load_json(path: Path) -> dict:
    try:
        value = json.loads(read(path))
    except Exception as exc:  # pragma: no cover - CI diagnostic path
        fail(f"invalid JSON {path}: {exc}")
    if not isinstance(value, dict):
        fail(f"JSON root must be object: {path}")
    return value


def one(pattern: str, text: str, label: str) -> str:
    matches = re.findall(pattern, text, re.S)
    if len(matches) != 1:
        fail(f"{label}: expected exactly 1 match, got {len(matches)}")
    value = matches[0]
    if isinstance(value, tuple):
        value = value[0]
    return str(value)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def numeric_build(value: str):
    match = re.fullmatch(r"(\d+)\.(\d+)\.(\d+)", value or "")
    return tuple(int(part) for part in match.groups()) if match else None


def validate(base: Path, expected_build: str | None = None, expected_release: str | None = None) -> dict:
    index = read(base / "index.html")
    root = read(base / "app.js")
    admin_js = read(base / "js/app.js")
    market_stack = read(base / "js/market-stack.js")
    manifest = load_json(base / "version.json")
    mirror = load_json(base / "administrator-version.json")

    build = str(manifest.get("build") or "").strip()
    release = str(manifest.get("release") or "").strip()
    token = str(manifest.get("asset_token") or "").strip()
    parent = str(manifest.get("parent_build") or "").strip()
    revision = str(manifest.get("revision") or "").strip()

    if numeric_build(build) is None:
        fail(f"canonical build is not numeric x.y.z: {build!r}")
    if expected_build and build != expected_build:
        fail(f"canonical build {build!r} != expected {expected_build!r}")
    if expected_release and release != expected_release:
        fail(f"canonical release {release!r} != expected {expected_release!r}")
    if not release:
        fail("canonical release is empty")

    expected_token = f"market-core-v2.0-alpha-build-{build}"
    if token != expected_token:
        fail(f"canonical asset token drift: {token!r} != {expected_token!r}")

    # Normal numbered releases must advance exactly one patch step.  Revision
    # parents (for example 40.4.167R1) intentionally fall outside this check.
    current_num = numeric_build(build)
    parent_num = numeric_build(parent)
    if parent_num is not None:
        if current_num[:2] != parent_num[:2] or current_num[2] != parent_num[2] + 1:
            fail(f"non-sequential numeric release: parent {parent!r} -> build {build!r}")

    actual = {
        "meta_atlas_build": one(r'<meta\s+name="atlas-build"\s+content="([^"]+)"\s*/?>', index, "meta atlas-build"),
        "meta_admin_build": one(r'<meta\s+name="administrator-build"\s+content="([^"]+)"\s*/?>', index, "meta administrator-build"),
        "meta_engine_build": one(r'<meta\s+name="atlas-engine-build"\s+content="([^"]+)"\s*/?>', index, "meta atlas-engine-build"),
        "meta_asset_token": one(r'<meta\s+name="atlas-asset-token"\s+content="([^"]+)"\s*/?>', index, "meta atlas-asset-token"),
        "meta_release": one(r'<meta\s+name="administrator-release"\s+content="([^"]+)"\s*/?>', index, "meta administrator-release"),
        "title_build": one(r'<title>Agent-Crypto @erith\.IA — Build ([^ ]+) · Administrator</title>', index, "title build"),
        "root_runtime_build": one(r"const\s+ATLAS_BUILD\s*=\s*[\"']([^\"']+)[\"']\s*;", root, "ATLAS_BUILD"),
        "admin_runtime_build": one(r"const\s+ADMIN_BUILD\s*=\s*[\"']([^\"']+)[\"']\s*;", admin_js, "ADMIN_BUILD"),
        "admin_release": one(r"const\s+ADMIN_RELEASE\s*=\s*[\"']([^\"']+)[\"']\s*;", admin_js, "ADMIN_RELEASE"),
        "admin_engine_build": one(r"const\s+ENGINE_BUILD\s*=\s*[\"']([^\"']+)[\"']\s*;", admin_js, "ENGINE_BUILD"),
        "root_cache_build": one(r'<script\s+src="\./app\.js\?v=administrator-build-([^"]+)"></script>', index, "root app cache build"),
        "admin_cache_build": one(r'<script\s+src="\./js/app\.js\?v=administrator-build-([^"]+)"></script>', index, "admin app cache build"),
        "footer_build": one(r"id=\"footerRelease\"[^>]*>[^<]*Market Core · Build ([^ ]+) · Version : Parker Lewis Can't Lose</span>", index, "footer build"),
        "first_paint_badge_build": one(r'<span\s+id="atlasVersionControlText">Build ([^<]+)</span>', index, "first-paint badge build"),
        "first_paint_aria_build": one(r'id="atlasVersionControl"[\s\S]*?aria-label="Version Agent-Crypto installée : Build ([^,"]+), mode Administrator"', index, "first-paint aria build"),
        "version_truth_cache_build": one(r'<script\s+src="\./js/version-truth\.js\?v=([^"]+)"></script>', index, "version truth cache build"),
    }

    for key in (
        "meta_atlas_build",
        "meta_admin_build",
        "title_build",
        "root_runtime_build",
        "admin_runtime_build",
        "root_cache_build",
        "admin_cache_build",
        "footer_build",
        "first_paint_badge_build",
        "first_paint_aria_build",
        "version_truth_cache_build",
    ):
        if actual[key] != build:
            fail(f"{key} drift: {actual[key]!r} != {build!r}")

    if actual["meta_asset_token"] != expected_token:
        fail("HTML asset token drift")
    if "atlasVersionControlText" in market_stack:
        fail("market-stack illegally owns the global version badge")
    if actual["meta_release"] != release or actual["admin_release"] != release:
        fail("release identity drift between manifest / HTML / administrator runtime")

    if str(mirror.get("build") or "").strip() != build:
        fail("administrator mirror build drift")
    if str(mirror.get("global_versioning") or "").strip() != build:
        fail("administrator mirror global_versioning drift")
    if str(mirror.get("release") or "").strip() != release:
        fail("administrator mirror release drift")
    if str(mirror.get("asset_token") or "").strip() != expected_token:
        fail("administrator mirror asset_token drift")
    if str(mirror.get("parent_build") or "").strip() != parent:
        fail("administrator mirror parent_build drift")
    if revision and str(mirror.get("revision") or "").strip() != revision:
        fail("administrator mirror revision drift")

    engine = str(manifest.get("engine", {}).get("reference_build") or "").strip()
    if engine != PROTECTED_ENGINE:
        fail(f"protected Market Core manifest changed: {engine!r}")
    if actual["meta_engine_build"] != PROTECTED_ENGINE or actual["admin_engine_build"] != PROTECTED_ENGINE:
        fail("protected Market Core first-paint/runtime identity changed")

    # 40.4.213 — Market architecture truth convergence guard.
    market_contract = read(base / "js/markets-domain-contract.js")
    architecture = load_json(base / "architecture/markets-domain-canonical.json")
    if "MARKET_CASCADE_SHELL" in market_contract or "PLANNED_INERT" in market_contract:
        fail("loaded markets-domain-contract still advertises retired inert/cascade architecture")
    expected_market_order = ["crypto", "metals", "indices", "energy", "cross-market"]
    if architecture.get("order") != expected_market_order:
        fail(f"market architecture order drift: {architecture.get('order')!r}")
    owners = architecture.get("owners") or {}
    if owners.get("router") != "js/market-stack.js" or owners.get("parallel_runtime") != "js/parallel-markets.js":
        fail("market architecture owner drift")
    domains = architecture.get("domains") or {}
    for domain in ("crypto", "metals", "indices", "energy", "cross-market"):
        if not str((domains.get(domain) or {}).get("state") or "").startswith("ACTIVE"):
            fail(f"market architecture active-domain drift: {domain}")

    files = manifest.get("files")
    if not isinstance(files, dict) or not files:
        fail("version.json files hash map missing")
    for rel, expected_hash in files.items():
        payload = base / str(rel)
        if not payload.is_file():
            fail(f"manifest hash target missing: {rel}")
        got = sha256(payload)
        if got != str(expected_hash):
            fail(f"payload hash drift: {rel}: {expected_hash} != {got}")

    result = {
        "ok": True,
        "build": build,
        "release": release,
        "parent_build": parent,
        "revision": revision,
        "asset_token": token,
        "market_core": PROTECTED_ENGINE,
        "hashed_payloads": len(files),
    }
    print("VERSION_TRUTH_PASS " + json.dumps(result, ensure_ascii=False, sort_keys=True))
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", default=str(DEFAULT_BASE))
    parser.add_argument("--expected-build")
    parser.add_argument("--expected-release")
    args = parser.parse_args()
    validate(Path(args.base), args.expected_build, args.expected_release)
    return 0


if __name__ == "__main__":
    sys.exit(main())
