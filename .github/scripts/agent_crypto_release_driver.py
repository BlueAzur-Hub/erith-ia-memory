#!/usr/bin/env python3
"""Canonical Agent-Crypto Administrator release identity writer.

This script owns version/publication identity only. It does not modify
Market Core, data collectors, chart engines, business semantics or
runtime scheduling. All current identity authorities are updated in one
operation, then the canonical read-only validator must prove convergence.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path

BASE = Path("public/agent_crypto_erith_ia/administrator")
PROTECTED_ENGINE = "38.15.11"

def die(message: str) -> None:
    raise SystemExit(f"RELEASE_DRIVER_FAIL: {message}")

def read(path: Path) -> str:
    if not path.is_file():
        die(f"missing file: {path}")
    return path.read_text(encoding="utf-8")

def write(path: Path, text: str) -> None:
    path.write_text(text, encoding="utf-8")

def load_json(path: Path) -> dict:
    value = json.loads(read(path))
    if not isinstance(value, dict):
        die(f"JSON root must be object: {path}")
    return value

def sub_one(text: str, pattern: str, replacement: str, label: str, flags: int = 0) -> str:
    result, count = re.subn(pattern, replacement, text, count=1, flags=flags)
    if count != 1:
        die(f"{label}: expected exactly one match, got {count}")
    return result

def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--build", required=True)
    parser.add_argument("--parent", required=True)
    parser.add_argument("--release", required=True)
    parser.add_argument("--status", required=True)
    parser.add_argument("--contract-key")
    parser.add_argument("--contract-json")
    parser.add_argument("--lineage-note")
    args = parser.parse_args()

    build = args.build.strip()
    parent = args.parent.strip()
    release = args.release.strip()
    status = args.status.strip()
    token = f"market-core-v2.0-alpha-build-{build}"
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")

    manifest_path = BASE / "version.json"
    mirror_path = BASE / "administrator-version.json"
    manifest = load_json(manifest_path)
    mirror = load_json(mirror_path)

    if str(manifest.get("build") or "") != parent:
        die(f"version.json parent mismatch: {manifest.get('build')} != {parent}")
    if str(mirror.get("build") or "") != parent:
        die(f"administrator-version.json parent mismatch: {mirror.get('build')} != {parent}")
    if str((manifest.get("engine") or {}).get("reference_build") or "") != PROTECTED_ENGINE:
        die("protected Market Core manifest identity changed before release")

    root_path = BASE / "app.js"
    root = read(root_path)
    root = sub_one(root, r'const\s+ATLAS_BUILD\s*=\s*["\'][^"\']+["\']\s*;', f'const ATLAS_BUILD = "{build}";', "root ATLAS_BUILD")
    write(root_path, root)

    admin_js_path = BASE / "js/app.js"
    admin_js = read(admin_js_path)
    admin_js = sub_one(admin_js, r'const\s+ADMIN_BUILD\s*=\s*["\'][^"\']+["\']\s*;', f'const ADMIN_BUILD = "{build}";', "ADMIN_BUILD")
    admin_js = sub_one(admin_js, r'const\s+ADMIN_RELEASE\s*=\s*["\'][^"\']*["\']\s*;', f'const ADMIN_RELEASE = "{release}";', "ADMIN_RELEASE")
    write(admin_js_path, admin_js)

    index_path = BASE / "index.html"
    index = read(index_path)
    index = sub_one(index, r'(<meta\s+name="atlas-build"\s+content=")[^"]+("\s*/?>)', rf'\g<1>{build}\g<2>', "index atlas-build")
    index = sub_one(index, r'(<meta\s+name="administrator-build"\s+content=")[^"]+("\s*/?>)', rf'\g<1>{build}\g<2>', "index administrator-build")
    index = sub_one(index, r'(<meta\s+name="administrator-release"\s+content=")[^"]*("\s*/?>)', rf'\g<1>{release}\g<2>', "index release")
    index = sub_one(index, r'(<meta\s+name="atlas-asset-token"\s+content=")[^"]+("\s*/?>)', rf'\g<1>{token}\g<2>', "index asset token")
    index = sub_one(index, r'<title>Agent-Crypto @erith\.IA — Build [^ ]+ · Administrator</title>', f'<title>Agent-Crypto @erith.IA — Build {build} · Administrator</title>', "index title")
    index = sub_one(index, r'(<button\s+[^>]*id="atlasVersionControl"[\s\S]*?aria-label="Version Agent-Crypto installée : Build )[^,"]+(, mode Administrator")', rf'\g<1>{build}\g<2>', "first-paint version aria")
    index = sub_one(index, r'(<span\s+id="atlasVersionControlText">Build )[^<]+(</span>)', rf'\g<1>{build}\g<2>', "first-paint version badge")
    index = sub_one(index, r'<script\s+src="\./js/version-truth\.js\?v=[^"]+"></script>', f'<script src="./js/version-truth.js?v={build}"></script>', "version truth cache token")
    index = sub_one(index, r'<script\s+src="\./app\.js\?v=administrator-build-[^"]+"></script>', f'<script src="./app.js?v=administrator-build-{build}"></script>', "root runtime cache token")
    index = sub_one(index, r'<script\s+src="\./js/app\.js\?v=administrator-build-[^"]+"></script>', f'<script src="./js/app.js?v=administrator-build-{build}"></script>', "admin runtime cache token")
    index = sub_one(index, r'(<span\s+id="footerRelease"[^>]*>[^<]*Market Core · Build )[^ ]+( · Version : Parker Lewis Can\'t Lose</span>)', rf'\g<1>{build}\g<2>', "footer build")
    write(index_path, index)

    manifest["release"] = release
    manifest["build"] = build
    manifest["asset_token"] = token
    manifest["status"] = status
    manifest["prepared_at"] = now
    manifest["published_at"] = now
    manifest["parent_build"] = parent
    manifest["revision"] = "V1"
    if args.lineage_note:
        lineage = str(manifest.get("lineage") or "")
        note = args.lineage_note.strip()
        if note and note not in lineage:
            manifest["lineage"] = lineage + " → " + note

    contract = None
    if bool(args.contract_key) != bool(args.contract_json):
        die("contract-key and contract-json must be supplied together")
    if args.contract_key:
        contract = json.loads(Path(args.contract_json).read_text(encoding="utf-8"))
        if not isinstance(contract, dict):
            die("contract JSON root must be object")
        manifest.setdefault("contracts", {})[args.contract_key] = contract

    mirror["build"] = build
    mirror["global_versioning"] = build
    mirror["release"] = release
    mirror["status"] = status
    mirror["prepared_at"] = now
    mirror["published_at"] = now
    mirror["parent_build"] = parent
    mirror["revision"] = "V1"
    mirror["asset_token"] = token
    if contract is not None:
        mirror.setdefault("contracts", {})[args.contract_key] = contract
    write(mirror_path, json.dumps(mirror, ensure_ascii=False, indent=2) + "\n")

    files = manifest.get("files")
    if not isinstance(files, dict) or not files:
        die("version.json files hash map missing")
    for rel in list(files):
        payload = BASE / str(rel)
        if not payload.is_file():
            die(f"manifest hash target missing: {rel}")
        files[rel] = sha256(payload)
    write(manifest_path, json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"ok": True, "build": build, "parent": parent, "release": release, "asset_token": token}, ensure_ascii=False))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
