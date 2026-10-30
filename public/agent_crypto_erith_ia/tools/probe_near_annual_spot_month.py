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
import csv
import hashlib
import io
import json
import math
from pathlib import Path
import tempfile
import zipfile

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



def inspect_original_partial_source(asset, month, getter=bulk.download):
    """Verify the original official checksum, valid observed bars and true gaps.

    No timestamp is inserted, extrapolated or altered; no OHLCV is persisted.
    An incomplete original month is useful provenance, NOT a certified year.
    """
    name, url = bulk.url_for(asset["pair"], month, "1m")
    raw = getter(url)
    checksum = getter(url + ".CHECKSUM", cap=8192)
    digest = hashlib.sha256(raw).hexdigest()
    official = checksum.decode("utf-8").strip().split()[0].lower()
    require(len(official) == 64 and official == digest,
            "Original Binance monthly ZIP CHECKSUM mismatch")
    start, expected, end = bulk.bounds(month, "1m")
    step = 60_000
    with zipfile.ZipFile(io.BytesIO(raw)) as archive:
        csv_name = name[:-4] + ".csv"
        require(archive.namelist() == [csv_name], "Unexpected monthly CSV members")
        info = archive.getinfo(csv_name)
        require(info.file_size <= 160_000_000 and info.compress_size > 0
                and info.file_size <= max(200 * info.compress_size, 160_000),
                "CSV size or compression ratio unsafe")
        count = 0
        gaps = 0
        first_ms = None
        last_ms = None
        unit = None
        gap_examples = []
        with archive.open(info) as handle:
            rows = csv.reader(io.TextIOWrapper(handle, encoding="utf-8-sig", newline=""))
            for fields in rows:
                require(len(fields) == 12, "Invalid official OHLCV columns")
                timestamp = int(fields[0])
                source_unit = "us" if timestamp >= 10**15 else "ms"
                require(unit is None or unit == source_unit, "Mixed source timestamp units")
                unit = source_unit
                current = timestamp // 1000 if unit == "us" else timestamp
                require(start <= current < end and (current - start) % step == 0,
                        "Source open outside exact monthly 1m UTC grid")
                require(last_ms is None or current > last_ms,
                        "Original source minutes not strictly increasing")
                if last_ms is None:
                    first_ms = current
                else:
                    missing = (current - last_ms) // step - 1
                    if missing and len(gap_examples) < 20:
                        gap_examples.append({"after_ms": last_ms,
                                             "before_ms": current,
                                             "missing_minutes": missing})
                    gaps += missing
                closed = int(fields[6])
                close_ms = closed // 1000 if unit == "us" else closed
                require(current <= close_ms < current + step,
                        "Source close outside original minute")
                prices = [float(fields[i]) for i in (1,2,3,4)]
                volume = float(fields[5])
                quote_volume = float(fields[7])
                require(all(math.isfinite(x) for x in (*prices,volume,quote_volume))
                        and all(x > 0 for x in prices)
                        and prices[2] <= min(prices[0],prices[3])
                        and max(prices[0],prices[3]) <= prices[1]
                        and volume >= 0 and quote_volume >= 0
                        and int(fields[8]) >= 0,
                        "Untrusted original Spot OHLCV")
                count += 1
                last_ms = current
                require(count <= expected, "Original source exceeds monthly grid")
    require(count > 0, "No original native minute bars in claimed source")
    before = (first_ms - start) // step
    after = (end - step - last_ms) // step
    require(count + before + gaps + after == expected,
            "Calendar slots do not reconcile with original source rows")
    return {
        "source_zip": name, "source_url": url,
        "source_sha256": digest, "official_checksum_sha256": official,
        "quote": "USDT", "native_resolution": "1m",
        "full_month_native_minutes_expected": expected,
        "original_native_minutes_observed": count,
        "missing_before_first_original": before,
        "missing_inside_original_span": gaps,
        "missing_after_last_original": after,
        "first_original_open_ms": first_ms,
        "last_original_open_ms": last_ms,
        "timestamp_unit_in_source": unit,
        "internal_gap_examples": gap_examples,
        "has_full_month": count == expected,
        "public_source_release_created": False,
        "source_status": "ORIGINAL_ZIP_CHECKSUM_AND_OHLCV_VERIFIED_PARTIAL",
    }


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
                if result["status"] == "unavailable":
                    try:
                        result["original_partial_source"] = inspect_original_partial_source(
                            asset, TARGET_MONTH)
                    except (OSError, ValueError, RuntimeError,
                            UnicodeError, zipfile.BadZipFile, csv.Error) as error:
                        result["original_partial_evidence_error"] = (
                            type(error).__name__ + ": " + str(error)[:160])
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
    report["verified_original_minutes_in_incomplete_sources"] = sum(
        x.get("original_partial_source", {}).get("original_native_minutes_observed", 0)
        for x in report["assets"])
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
