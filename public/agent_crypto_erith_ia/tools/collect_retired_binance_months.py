#!/usr/bin/env python3
"""Recover official Binance Spot XMR/USDT history despite the 2024 delisting.

The original 2024-02-06 Binance notice identifies Monero (XMR), its Spot
XMR/USDT pair and 2024-02-20 removal. The Top250 exact ID is 'monero'.
Only verified full, PRE-DELIST monthly original 1m ZIP + .CHECKSUM are published.
No invented current price, no update to Trader, no overwrite of existing data.
"""
from __future__ import annotations
import argparse
import datetime as dt
import json
import os
from pathlib import Path
import subprocess
import tempfile

import import_historical_bulk as bulk
from orchestrate_historical_bulk import verify_month_output
import supplement_historical_bulk as supplement

ROOT = bulk.ROOT / "data/historical_archive_prototype"
CATALOG = ROOT / "top250_history_catalog/index.json"
NOTICE = "https://www.binance.com/en/support/announcement/detail/f73b083ba6834771b07dbe5319917ae5"
ASSET_ID, PAIR, RANK = "monero", "XMRUSDT", 14
# Full 2023 precedes the officially announced 2024-02-20 delisting.
MONTHS = tuple(f"2023-{m:02d}" for m in range(12, 0, -1))
MAX_PER_RUN = 12


def require(ok, message):
    if not ok:
        raise ValueError(message)


def historical_owner(catalog):
    require(catalog.get("schema") == "aerith.public.ohlcv.top250.monthly-coverage-catalog.v1"
            and catalog.get("ranked") == 250 and catalog.get("quote") == "USDT"
            and len(catalog.get("assets", [])) == 250,
            "Canonical exact-ID catalog unavailable")
    items = [x for x in catalog["assets"] if x.get("id") == ASSET_ID]
    require(len(items) == 1, "Monero exact ID missing or duplicated")
    x = items[0]
    require(x.get("rank") == RANK and x.get("symbol") == "XMR"
            and x.get("name") == "Monero", "Binance notice vs catalog identity mismatch")
    require(x.get("months") == [], "Monero already archived; reconcile before republishing")
    require(bulk.PAIR.fullmatch(PAIR) is not None, "Invalid official Spot pair")
    return {"id": ASSET_ID, "symbol": "XMR", "pair": PAIR,
            "rank": RANK, "archive_owner": "official-binance-2024-02-06-delisting"}


def already_published(tag):
    cp = subprocess.run(["gh", "release", "view", tag, "--json", "tagName,isDraft"],
                        capture_output=True, text=True, timeout=45)
    if cp.returncode != 0:
        # A real GitHub transport outage must not be confused with absence:
        # return this result only if standard not-found information is present.
        msg = (cp.stderr or cp.stdout).lower()
        require("not found" in msg or "release not found" in msg
                or "http 404" in msg, "Release visibility uncertain; refuse overwrite")
        return False
    row = json.loads(cp.stdout)
    require(row.get("tagName") == tag and row.get("isDraft") is False,
            "Source release exists but is not confirmed immutable/public")
    return True


def import_one(month, owner, output):
    manifest = bulk.execute(month, "1m", output,
                            workers=1, limit=1, assets=[owner])
    candles = verify_month_output(output, manifest, [owner], month)
    require(manifest["requested"] == 1 and len(manifest["assets"]) == 1,
            "Incorrect source proof owner")
    if manifest["verified"] != 1:
        return None, manifest["assets"][0].get("reason", "Source unavailable")
    require(candles == bulk.bounds(month, "1m")[1],
            "Native 1m source must be a complete calendar month")
    return manifest, None


def probe(catalog, month="2023-12"):
    require(month in MONTHS, "Only pre-delisting candidate month allowed")
    owner = historical_owner(catalog)
    with tempfile.TemporaryDirectory(prefix="seven-xmr-probe-") as td:
        manifest, error = import_one(month, owner, Path(td))
    require(manifest is not None, "Official XMR Spot source not verified: " + str(error))
    return {"month": month, "id": ASSET_ID, "pair": PAIR,
            "candles": manifest["candles"], "quote": "USDT",
            "official_delisting_notice": NOTICE, "published": False}


def collect(catalog, months=MAX_PER_RUN, exists=already_published, importer=import_one,
            publisher=supplement.publish):
    require(1 <= months <= MAX_PER_RUN, "Unbounded source collection")
    owner = historical_owner(catalog)
    require(os.environ.get("GITHUB_ACTIONS") == "true"
            and os.environ.get("GH_TOKEN")
            and os.environ.get("GITHUB_REPOSITORY") == "BlueAzur-Hub/erith-ia-memory"
            and os.environ.get("GITHUB_SHA"),
            "Real source publication is permitted only on the existing GitHub runner")
    published = []
    missing = []
    prior = []
    for month in MONTHS[:months]:
        tag = supplement.add_tag(month, [owner])
        if exists(tag):
            prior.append(tag)
            continue
        with tempfile.TemporaryDirectory(prefix="seven-retired-spot-") as td:
            folder = Path(td)
            manifest, error = importer(month, owner, folder)
            if manifest is None:
                missing.append({"month": month, "reason": error})
                continue
            url = publisher(month, folder, manifest, [owner])
            published.append({"month": month, "release": tag,
                              "url": url, "candles": manifest["candles"]})
            print("RETIRED BINANCE SPOT ARCHIVE " + json.dumps(published[-1],
                  sort_keys=True), flush=True)
    return {"schema": "aerith.public.ohlcv.retired-spot-delisting-recovery.v1",
            "asset_id": ASSET_ID, "source": "Binance Spot official monthly archive",
            "quote": "USDT", "interval": "1m", "notice": NOTICE,
            "published": published, "already_published": prior,
            "unavailable": missing, "catalog_updated": False,
            "trader_unchanged": True}


def main():
    p = argparse.ArgumentParser(description=__doc__)
    choices = p.add_mutually_exclusive_group(required=True)
    choices.add_argument("--plan", action="store_true")
    choices.add_argument("--probe", action="store_true")
    choices.add_argument("--collect", action="store_true")
    p.add_argument("--months", type=int, default=MAX_PER_RUN)
    a = p.parse_args()
    require(1 <= a.months <= MAX_PER_RUN, "Unsafe month count")
    cat = json.loads(CATALOG.read_text(encoding="utf-8"))
    owner = historical_owner(cat)
    if a.plan:
        result = {"mode": "PRE_DELIST_SPOT_PLAN", "asset": owner,
                  "months": list(MONTHS[:a.months]), "claimed_archives": 0,
                  "official_notice": NOTICE}
    elif a.probe:
        result = probe(cat)
    else:
        result = collect(cat, a.months)
    print("RETIRED BINANCE HISTORY " + json.dumps(result, sort_keys=True,
                                                 ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
