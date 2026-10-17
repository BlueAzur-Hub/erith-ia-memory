#!/usr/bin/env python3
"""Read-only smoke test of all 35 canonical Raw GitHub historical periods.

GitHub Pages excludes cold archives by design; verify the canonical Raw source.
Never trust a GitHub Actions SUCCESS as proof that the Raw archive bytes agree.
No exchange requests, orders, trader/Interface writes or token storage.
"""
from __future__ import annotations
import argparse
import gzip
import hashlib
import json
import math
from pathlib import Path
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

import build_verified_periods as vault

BASE_URL = (
    "https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/main/public/agent_crypto_erith_ia/data/"
    "historical_archive_prototype/verified_periods/"
)
EXPECTED = {name: (interval, size) for name, interval, size in vault.WINDOWS}


def fetch(url, cap=500_000, retries=3):
    vault.need(url.startswith(BASE_URL), "Unexpected canonical archive URL")
    for attempt in range(retries):
        try:
            with urlopen(Request(url, headers={
                "User-Agent": "Seven-Heaven-Verified-Pages-Smoke",
                "Accept": "application/octet-stream"}), timeout=30) as reply:
                vault.need(reply.status == 200, "Raw archive returned non-200")
                data = reply.read(cap + 1)
            vault.need(0 < len(data) <= cap,
                       "Unexpected Raw archive response size: " + url)
            return data
        except (HTTPError, URLError, TimeoutError):
            if attempt + 1 == retries:
                raise
            time.sleep(2 * (attempt + 1))
    raise RuntimeError("Raw archive unavailable")


def audit(folder=vault.DEST):
    local = (Path(folder) / "index.json").read_bytes()
    public = fetch(BASE_URL + "index.json", 250_000)
    vault.need(local == public,
               "Raw GitHub archive index differs from version committed on main")
    index = json.loads(public)
    vault.need(index["schema"] == vault.INDEX_SCHEMA and
               index["quote"] == "USDT" and
               index["is_live"] is False and
               index["is_all_time"] is False and
               index["core_assets"] == 5 and
               index["periods_per_asset"] == 7,
               "Unexpected canonical Coffre catalog")
    found, intervals, sums = set(), 0, {}
    for asset in index["assets"]:
        aid = asset["id"]
        vault.need(aid in vault.PAIRS and aid not in found and
                   asset["pair"] == vault.PAIRS[aid] and
                   asset["quote"] == "USDT" and
                   asset["verified_closed_months"] == 12 and
                   asset["first_month"] == "2025-10" and
                   asset["last_month"] == "2026-09",
                   "Identity, quote, or source months mismatch")
        found.add(aid)
        periods = set()
        for item in asset["periods"]:
            period, filename = item["period"], item["file"]
            vault.need(period in EXPECTED and period not in periods and
                       filename == aid + "-" + period + ".json.gz" and
                       item["resolution"] == EXPECTED[period][0] and
                       0 < item["bytes"] <= 200_000 and
                       len(item["sha256"]) == 64,
                       "Invalid period metadata")
            periods.add(period)
            raw = fetch(BASE_URL + filename, 200_000)
            vault.need(len(raw) == item["bytes"] and
                       hashlib.sha256(raw).hexdigest() == item["sha256"],
                       "Raw archive differs from certified SHA-256: " + filename)
            plain = gzip.decompress(raw)
            vault.need(len(plain) < 8_000_000,
                       "Unbounded historical payload " + filename)
            obj = json.loads(plain)
            interval, count = EXPECTED[period]
            rows = obj["rows"]
            vault.need(obj["schema"] == vault.SCHEMA and
                       obj["asset_id"] == aid and obj["pair"] == vault.PAIRS[aid] and
                       obj["quote"] == "USDT" and obj["is_live"] is False and
                       obj["is_all_time"] is False and
                       obj["period"] == period and obj["resolution"] == interval and
                       obj["columns"] == vault.COLUMNS and
                       obj["last_source_month"] == "2026-09" and
                       obj["source"].startswith("Binance Spot") and
                       len(obj["native_source_months"]) >= 12 and
                       len(obj["source_projection_sha256"]) >= 1 and
                       rows[0][0] == item["start_ms"] == obj["start_ms"] and
                       rows[-1][0] + vault.STEPS[interval] ==
                       item["end_exclusive_ms"] == obj["end_exclusive_ms"],
                       "Source, period or UTC boundaries disagree")
            vault.validate(rows, interval, allow_gaps=period == "Max")
            gaps = vault.gaps(rows, interval)
            vault.need(obj["gaps"] == gaps and
                       len(gaps) == item["gaps"] and
                       len(rows) == item["bars"] and
                       (count is None or len(rows) == count),
                       "Unreported gap or incorrect coverage")
            intervals += 1
            sums[period] = sums.get(period, 0) + len(rows)
            print("PAGES VERIFIED", aid, period, len(rows),
                  "rows", len(gaps), "gaps", item["sha256"][:16], flush=True)
        vault.need(periods == set(EXPECTED), "Missing public historical period")
    vault.need(found == set(vault.PAIRS) and intervals == 35,
               "Canonical Coffre is missing a market or period")
    print("GITHUB RAW HISTORICAL SMOKE PASS", json.dumps({
        "assets": len(found), "files": intervals,
        "bars_by_period": sums, "source": BASE_URL,
        "raw_index_sha256": hashlib.sha256(public).hexdigest()},
        sort_keys=True), flush=True)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--folder", type=Path, default=vault.DEST)
    args = ap.parse_args()
    audit(args.folder)
