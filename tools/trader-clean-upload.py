#!/usr/bin/env python3
"""Trader CLEAN_UPLOAD: modified source files only. Never archives or Pages."""
import argparse
import hashlib
import json
import subprocess
import zipfile
from pathlib import Path

ROOT = "public/agent_crypto_erith_ia/"
SCOPES = {"trader", "administrator", "laboratoire"}
EXT = {".js", ".mjs", ".html", ".css", ".json", ".md", ".txt"}
LIMIT = 1_000_000

def allowed(name):
    p = Path(name)
    parts = p.parts
    return (len(parts) >= 4 and parts[:2] == ("public", "agent_crypto_erith_ia")
            and parts[2] in SCOPES and p.suffix.lower() in EXT
            and ".." not in parts and not p.is_absolute()
            and not set(parts).intersection({"data", "releases", "downloads", "archives"}))

def digest(content):
    return hashlib.sha256(content).hexdigest()

def pack(base, head, destination):
    names = sorted(set(
        p.decode("utf-8") for p in
        subprocess.check_output(["git", "diff", "--no-renames", "--name-only", "-z", base, head, "--",
                                 ROOT + "trader/", ROOT + "administrator/", ROOT + "laboratoire/"]).split(bytes([0]))
        if p))
    selected, deleted, excluded, media = [], [], [], []
    for name in names:
        path = Path(name)
        if not allowed(name):
            if path.suffix.lower() in {".png", ".jpeg", ".jpg", ".gif", ".webp", ".avif", ".svg"}:
                media.append(name)
            else:
                excluded.append(name)
            continue
        if path.is_symlink():
            raise ValueError("Symbolic link is not a deliverable Trader file: " + name)
        if path.is_file():
            selected.append((name, path.read_bytes()))
        else:
            deleted.append(name)
    manifest = {
        "schema": "agent.crypto.trader.clean-upload.v1",
        "base": base, "head": head,
        "modified_files": [{"path": name, "bytes": len(content), "sha256": digest(content)}
                           for name, content in selected],
        "deleted_files": deleted,
        "media_excluded_separate_delivery_required": media,
        "other_excluded": excluded,
        "not_complete_site": True, "not_vault_archive": True,
        "self_contained": not bool(media or deleted)
    }
    destination = Path(destination)
    destination.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(destination, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for name, content in selected:
            z.writestr(name, content)
        z.writestr("CLEAN_UPLOAD_MANIFEST.json", json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
    size = destination.stat().st_size
    if size > LIMIT:
        destination.unlink()
        raise ValueError(f"CLEAN_UPLOAD too large: {size} bytes (limit {LIMIT}). Split the correction.")
    if not selected and not deleted and not media:
        destination.unlink()
        raise ValueError("No Trader changes to package; refusing a misleading empty version.")
    with zipfile.ZipFile(destination) as z:
        assert z.testzip() is None and len(z.namelist()) == len(set(z.namelist()))
    (destination.parent / (destination.name + ".sha256")).write_text(
        digest(destination.read_bytes()) + "  " + destination.name + "\n", encoding="utf-8")
    print(json.dumps({"zip": str(destination), "bytes": size, "changed": len(selected),
                      "deleted": len(deleted), "separate_media": len(media)}, indent=2))
    return manifest

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--base", required=True)
    p.add_argument("--head", required=True)
    p.add_argument("--output", default="out/AGENT_CRYPTO_TRADER_CLEAN_UPLOAD.zip")
    opts = p.parse_args()
    pack(opts.base, opts.head, opts.output)
