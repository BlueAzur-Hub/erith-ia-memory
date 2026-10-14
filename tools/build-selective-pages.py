#!/usr/bin/env python3
"""Build a lean, reviewable GitHub Pages directory without deleting Git sources."""
from __future__ import annotations
import argparse
import json
from html.parser import HTMLParser
from pathlib import Path
import re
import shutil
import subprocess
from urllib.parse import unquote, urlsplit

ROOTS = ("public/", "assets/")
ROOT_FILES = {"index.html", "app.js", "style.css", ".nojekyll"}
ARCHIVE_EXT = (".zip", ".rar", ".7z", ".exe", ".msi", ".dll", ".iso")
LEGACY_ADMIN_HTML = re.compile(r"^public/agent_crypto_erith_ia/administrator/index-\d+(?:\.\d+)+\.html$", re.I)
ORACLE_JSONL = re.compile(r"^public/agent_crypto_erith_ia/data/oracle_evidence/.+\.jsonl$", re.I)
PART_FILE = re.compile(r"\.(?:sh\.)?part\d{3,}$", re.I)
MAX_BYTES = 900_000_000
REQUIRED = (
    "index.html",
    "public/agent_crypto_erith_ia/administrator/index.html",
    "public/agent_crypto_erith_ia/trader/trading-desk.html",
    "public/agent_crypto_erith_ia/administrator/historical-vault.html",
    "public/agent_crypto_erith_ia/trader/historical-inventory.html",
    "public/agent_crypto_erith_ia/trader/source-catalogue.html",
    "public/agent_crypto_erith_ia/trader/verified-reader.html",
    "public/agent_crypto_erith_ia/data/historical_archive_prototype/compact_v1/index.json",
    "public/agent_crypto_erith_ia/data/historical_archive_prototype/verified_periods/index.json",
    "public/agent_crypto_erith_ia/laboratoire/cas-ecole-concrete.md",
    "assets/images/technical-reading/technical-random-01.png",
    "assets/images/technical-reading/admin-technical-reading-default.png",
    "assets/images/visual/admin-chart-office.png",
)

def include(path: str) -> bool:
    if path in ROOT_FILES: return True
    if not path.startswith(ROOTS): return False
    return not (path.lower().endswith(ARCHIVE_EXT) or PART_FILE.search(path)
                or LEGACY_ADMIN_HTML.fullmatch(path) or ORACLE_JSONL.fullmatch(path))

class Refs(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []
    def handle_starttag(self, tag, attrs):
        key = {"script":"src","link":"href","img":"src","iframe":"src","source":"src"}.get(tag)
        if key:
            url = dict(attrs).get(key)
            if url: self.urls.append(url)

def build(src: Path, dst: Path, max_bytes: int = MAX_BYTES):
    src, dst = src.resolve(), dst.resolve()
    if not src.is_dir() or dst == src: raise ValueError("Invalid source/destination")
    if dst.exists() and any(dst.iterdir()): raise ValueError("Destination must be empty")
    raw = subprocess.check_output(["git","-C",str(src),"ls-files","-z"])
    staged = []
    skipped_files = skipped_bytes = bytes_total = 0
    for part in raw.split(b"\0"):
        if not part: continue
        path = part.decode("utf-8")
        if ".." in Path(path).parts or path.startswith("/"): raise ValueError("Unsafe path")
        f = src / path
        if not f.is_file() or f.is_symlink(): continue
        n = f.stat().st_size
        if include(path):
            staged.append((f, path))
            bytes_total += n
        else:
            skipped_files += 1
            skipped_bytes += n
    if bytes_total > max_bytes: raise ValueError(f"Site too large: {bytes_total}")
    for origin, name in staged:
        target = dst / name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(origin, target)
    (dst / ".nojekyll").touch()
    missing = [p for p in REQUIRED if not (dst / p).is_file()]
    for name in ("index.html","public/agent_crypto_erith_ia/administrator/index.html",
                 "public/agent_crypto_erith_ia/trader/trading-desk.html"):
        page = dst / name
        if not page.is_file(): continue
        h = Refs()
        h.feed(page.read_text(encoding="utf-8"))
        for raw_url in h.urls:
            u = urlsplit(raw_url)
            if u.scheme or u.netloc or raw_url.startswith(("#","//")) or u.path.startswith("/"): continue
            if not u.path: continue
            target = (page.parent / unquote(u.path)).resolve()
            if dst not in target.parents or not target.is_file():
                missing.append(name+" -> "+raw_url)
    if missing: raise ValueError("Site references missing: "+", ".join(missing[:25]))
    report = {"schema":"erith.crypto.pages.selective.v1",
              "selected_files":len(staged),"selected_bytes":bytes_total,
              "excluded_files":skipped_files,"excluded_bytes":skipped_bytes,
              "oracle_jsonl_in_pages":False,"old_admin_versions_in_pages":False,
              "source_git_unchanged":True,"firefox_verified":False}
    (dst/"publication-manifest.json").write_text(json.dumps(report,indent=2)+"\n",encoding="utf-8")
    return report

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--source",default=".")
    parser.add_argument("--destination",default="_site")
    args = parser.parse_args()
    print(json.dumps(build(Path(args.source),Path(args.destination)),indent=2))
