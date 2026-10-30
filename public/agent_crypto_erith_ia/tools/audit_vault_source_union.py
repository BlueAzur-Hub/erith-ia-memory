#!/usr/bin/env python3
"""Read-only reconciliation of the Top250 Binance yearly, federated 1m, and Spot 1D indexes.

Records are matched by exact CoinGecko ID, never by symbol. Index presence is
NOT re-verification of source ZIP bytes or proof of coverage since first trade.
This script fetches no markets and never modifies a source index or OHLCV.
"""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "data/historical_archive_prototype"
SOURCES = {
    "binance_year": "year_depth_index.json",
    "minute": "top250_multisource_coverage/index.json",
    "daily": "top250_multiresolution_sources/index.json",
}


def require(ok, reason):
    if not ok:
        raise ValueError(reason)


def audit(year, minute, daily):
    require(year.get("ranked") == minute.get("ranked") == 250, "Top250 roster size differs")
    require(year.get("quote") == minute.get("quote") == "USDT", "Minute quote mismatch")
    require(daily.get("quote") == "mixed-native-USDT-USDC", "Daily quote contract mismatch")
    ya, ma, da = year.get("assets"), minute.get("assets"), daily.get("assets")
    require(all(isinstance(rows, list) for rows in (ya, ma, da))
            and len(ya) == len(ma) == 250, "Incomplete Top250 assets")
    require(all(isinstance(x, dict) for x in ya + ma + da), "Invalid source asset")
    akeys = [(x.get("rank"), x.get("id")) for x in ya]
    mkeys = [(x.get("rank"), x.get("id")) for x in ma]
    require(akeys == mkeys and [x[0] for x in akeys] == list(range(1, 251))
            and len({x[1] for x in akeys}) == 250
            and all(isinstance(x[1], str) and x[1] for x in akeys),
            "Source IDs/ranks disagree; never join by symbol")
    daily_ids = [x.get("id") for x in da]
    require(len(set(daily_ids)) == len(daily_ids)
            and daily.get("asset_count") == len(da)
            and all(isinstance(x, str) and x for x in daily_ids),
            "Daily IDs inconsistent")
    require(all(type(x.get("native_1m_count")) is int
                and x["native_1m_count"] >= 0 for x in ma),
            "Unverified native 1m counts")
    require(all(type(x.get("native_candles")) is int
                and x["native_candles"] > 0 and x.get("quote") in ("USDT", "USDC")
                for x in da), "Daily count or quote invalid")
    require(all(type(x.get("longest_contiguous_months")) is int
                and type(x.get("verified_months")) is int
                and 0 <= x["longest_contiguous_months"] <= x["verified_months"]
                and x.get("at_least_12_consecutive_months")
                   == (x["longest_contiguous_months"] >= 12) for x in ya),
            "Year-depth individual month status invalid")
    annual = {x["id"] for x in ya if x["at_least_12_consecutive_months"]}
    minute_ids = {x["id"] for x in ma if x["native_1m_count"] > 0}
    roster = {x["id"] for x in ya}
    daily_in = set(daily_ids) & roster
    either = minute_ids | daily_in
    missing = [x for x in ya if x["id"] not in either]
    partial = [x for x in ya if 0 < x["verified_months"] and
               not x["at_least_12_consecutive_months"]]
    require(year.get("archive_assets") == sum(x["verified_months"] > 0 for x in ya)
            and year.get("assets_with_at_least_12_consecutive_closed_months") == len(annual),
            "Year-depth summary disagrees with IDs")
    require(minute.get("archived_assets") == len(minute_ids),
            "Minute federation summary disagrees with IDs")
    require(annual <= minute_ids, "Annual source absent from minute federation")
    return {
        "schema": "aerith.public.ohlcv.top250.source-union.readonly.v1",
        "status": "INDEX_PRESENCE_NOT_SOURCE_ZIP_BYTE_REAUDIT",
        "ranked": 250,
        "summary": {
            "binance_monthly_1m_assets": year["archive_assets"],
            "binance_12_consecutive_closed_months": len(annual),
            "binance_partial_monthly_assets_without_year": len(partial),
            "binance_zero_verified_month_assets": sum(x["verified_months"] == 0 for x in ya),
            "federated_spot_1m_assets": len(minute_ids),
            "daily_spot_assets_all_universes": len(daily_ids),
            "daily_spot_assets_inside_top250": len(daily_in),
            "daily_spot_assets_outside_top250": len(set(daily_ids) - roster),
            "both_1m_and_1d_assets_inside_top250": len(minute_ids & daily_in),
            "indexed_1m_or_1d_assets_inside_top250": len(either),
            "no_indexed_1m_or_1d_asset_inside_top250": len(missing),
        },
        "near_verified_12_months": [
            {"rank": x["rank"], "id": x["id"], "symbol": x["symbol"],
             "longest_contiguous_months": 11,
             "last_verified_closed_month": x["last_verified_closed_month"]}
            for x in partial if x["longest_contiguous_months"] == 11],
        "without_both_indexed_native_sources": [
            {"rank": x["rank"], "id": x["id"], "symbol": x["symbol"]}
            for x in missing],
        "daily_source_identities_outside_top250": sorted(set(daily_ids) - roster),
        "limitations": [
            "Index presence does not rehash source ZIP bytes.",
            "Daily bars cannot be silently upgraded into native one-minute candles.",
            "A verified month does not establish first trade or continuous lifetime coverage.",
            "USD, USDT and USDC remain separate quotes; no synthetic conversion.",
            "Absent from these two indexes does not imply absent from every market.",
        ],
    }


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--root", type=Path, default=ROOT)
    cli.add_argument("--output", type=Path)
    args = cli.parse_args()
    docs, fingerprints = {}, {}
    for key, rel in SOURCES.items():
        content = (args.root / rel).read_bytes()
        docs[key] = json.loads(content)
        fingerprints[key] = {"path": rel, "sha256": hashlib.sha256(content).hexdigest()}
    report = audit(docs["binance_year"], docs["minute"], docs["daily"])
    report["source_file_sha256"] = fingerprints
    output = json.dumps(report, ensure_ascii=False, sort_keys=True, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(output, encoding="utf-8")
    else:
        print(output, end="")


if __name__ == "__main__":
    main()
