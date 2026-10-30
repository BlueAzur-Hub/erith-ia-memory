#!/usr/bin/env python3
"""Prove a genuine missing older Binance Spot minute month for near-annual assets.

Read canonical 12-month index and independently approved exact CoinGecko-ID
Binance ownership. --plan is strictly offline; --probe validates the original
official monthly ZIP and .CHECKSUM using the existing protected importer,
then deletes temporary downloaded data. Neither mode creates a Git release,
alters a source index, invents OHLCV or places orders.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import tempfile

import import_historical_bulk as bulk
import orchestrate_historical_bulk as older
from build_historical_year_depth import next_month

SOURCE = bulk.ROOT / "data/historical_archive_prototype/year_depth_index.json"
TARGET_MONTH = "2025-10"
LATEST_VERIFIED = "2026-09"
TARGET_IDS = ("aster-2", "morpho", "doublezero")
SCHEMA = "aerith.public.ohlcv.spot.near-year.month.probe.v1"


def require(flag, message):
    if not flag:
        raise ValueError(message)


def choose(year, approved):
    """Choose only exactly-proven owners and verify the precise annual gap."""
    require(year.get("schema") ==
            "aerith.public.ohlcv.top250.verifiable-year-depth.v1"
            and year.get("ranked") == 250
            and year.get("quote") == "USDT"
            and len(year.get("assets", [])) == 250,
            "Unexpected monthly provenance")
    indexed = {x["id"]: x for x in year["assets"]}
    require(len(indexed) == 250, "Duplicate CoinGecko ID")
    byid = {x["id"]: x for x in approved}
    require(len(byid) == len(approved), "Duplicate approved source ID")
    owners = []
    for aid in TARGET_IDS:
        row = indexed.get(aid)
        src = byid.get(aid)
        require(row is not None and src is not None,
                "Exact CoinGecko ID has no independent Binance Spot approval: " + aid)
        require(row.get("longest_contiguous_months") == 11
                and row.get("at_least_12_consecutive_months") is False
                and row.get("first_verified_closed_month") == "2025-11"
                and row.get("last_verified_closed_month") == LATEST_VERIFIED
                and next_month(TARGET_MONTH) == row["first_verified_closed_month"]
                and any(s.get("first_month") == "2025-11"
                        and s.get("last_month") == LATEST_VERIFIED
                        and s.get("months") == 11
                        for s in row.get("contiguous_runs", [])),
                "Annual month gap changed; refuse stale requested month: " + aid)
        require(src.get("symbol") == row["symbol"]
                and src.get("pair") == row["symbol"] + "USDT"
                and bulk.PAIR.fullmatch(src["pair"])
                and src.get("archive_owner") == "coingecko-binance-exact-id",
                "Source owner, pair or quote changed: " + aid)
        owners.append(src)
    require(len({x["pair"] for x in owners}) == len(TARGET_IDS),
            "Shared/ticker-colliding Spot pair detected")
    return owners


def run(source_path=SOURCE, probe=False):
    original = source_path.read_bytes()
    year = json.loads(original)
    owners = choose(year, bulk.confirmed_additions())
    start, expect, end = bulk.bounds(TARGET_MONTH, "1m")
    report = {
        "schema": SCHEMA,
        "month": TARGET_MONTH,
        "source": "Binance Spot official monthly 1m ZIP + .CHECKSUM",
        "quote": "USDT",
        "original_year_depth_sha256": hashlib.sha256(original).hexdigest(),
        "status": "PROBE_NOT_PUBLISHED" if probe else "OFFLINE_PLAN_NOT_PROVEN",
        "requested_identities": len(owners),
        "expected_native_1m_per_full_month": expect,
        "first_open_ms": start,
        "end_exclusive_ms": end,
        "all_requested_source_months_verified": False,
        "new_releases": 0,
        "new_catalog_rows": 0,
        "automatic_orders": False,
        "assets": [],
    }
    if probe:
        with tempfile.TemporaryDirectory(prefix="seven-near-annual-source-") as location:
            root = Path(location)
            for asset in owners:
                result = bulk.fetch_asset(asset, TARGET_MONTH, "1m", root)
                assert result["status"] in ("verified", "unavailable")
                if result["status"] == "verified":
                    require(result.get("candles") == expect
                            and (root / result["file"]).is_file()
                            and bulk.sha256((root / result["file"]).read_bytes())
                                == result["sha256"],
                            "Original source bytes or month count changed")
                report["assets"].append(result)
        # Temporary original ZIP bytes are discarded, not published.
    else:
        for asset in owners:
            name, url = bulk.url_for(asset["pair"], TARGET_MONTH, "1m")
            report["assets"].append({
                "asset_id": asset["id"], "pair": asset["pair"],
                "rank": asset["rank"], "month": TARGET_MONTH,
                "source_zip_name": name, "source_url": url,
                "status": "NOT_YET_PROBED"})
    report["verified_assets"] = sum(x.get("status") == "verified"
                                     for x in report["assets"])
    report["all_requested_source_months_verified"] = (probe and report["verified_assets"] == len(owners))
    report["verified_original_minutes"] = sum(x.get("candles", 0)
                                                for x in report["assets"])
    require(source_path.read_bytes() == original, "Source index mutated")
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    modes = parser.add_mutually_exclusive_group(required=True)
    modes.add_argument("--plan", action="store_true")
    modes.add_argument("--probe", action="store_true")
    parser.add_argument("--output", type=Path)
    options = parser.parse_args()
    report = run(probe=options.probe)
    value = json.dumps(report, ensure_ascii=False, sort_keys=True, indent=2) + "\n"
    if options.output:
        options.output.parent.mkdir(parents=True, exist_ok=True)
        options.output.write_text(value)
    else:
        print(value, end="")


if __name__ == "__main__":
    main()
