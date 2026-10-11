#!/usr/bin/env python3
"""Reconstruct BTC Max without discarding genuine partially populated months.

Sources:
  * complete monthly Binance BTCUSDT 1m ZIP Releases, SHA-256 checked;
  * independently qualified BTC gap ZIP Releases and official CHECKSUM;
  * already materialized certified 1h annual shards (strict-full months).

No interpolation, synthesized candles, token history claims or market queries.
Any UTC day missing even one 1m candle is EXCLUDED from certified 1d bars;
its original missing-minute intervals stay in the provenance audit.
"""
from __future__ import annotations
import argparse
from collections import defaultdict
from datetime import datetime, timezone
import gzip
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile

import btc_gap_archive
import build_historical_btc_view as candle
import build_verified_periods as prior

HOME = Path(__file__).resolve().parents[1] / "data/historical_archive_prototype"
FULL = HOME / "top250_history_catalog/index.json"
PARTIAL = HOME / "btc_verified_gap_months/index.json"
ANNUAL = HOME / "calendar_year_hourly_shards/index.json"
OUTPUT = HOME / "btc_max_integrated"
REPO = "BlueAzur-Hub/erith-ia-memory"
D = 86_400_000
M = 60_000


def need(ok, reason):
    if not ok:
        raise ValueError(reason)


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def source_catalogs(home=HOME):
    full = json.loads((home / "top250_history_catalog/index.json").read_text())
    partial = json.loads((home / "btc_verified_gap_months/index.json").read_text())
    annual = json.loads((home / "calendar_year_hourly_shards/index.json").read_text())
    a = next(x for x in full["assets"] if x["id"] == "bitcoin")
    s = next(x for x in annual["assets"] if x["id"] == "bitcoin")
    need(full["quote"] == "USDT" and partial["pair"] == "BTCUSDT" and
         partial["quote"] == "USDT" and annual["quote"] == "USDT",
         "USD/USDT or market identity mismatch")
    complete = {x["month"]: x for x in a["months"]}
    incomplete = {x["month"]: x for x in partial["months"]}
    need(len(complete) == len(a["months"]) and
         len(incomplete) == len(partial["months"]) and
         not set(complete).intersection(incomplete),
         "Ambiguous, duplicated or conflicting source month")
    month_set = set(complete) | set(incomplete)
    need(len(complete) >= 80 and len(incomplete) >= 21 and
         {"2018-05", "2023-03", "2026-09"}.issubset(month_set),
         "Incomplete canonical BTC source inventory")
    years = set()
    for y in range(2018, 2027):
        for month in range(1, 13):
            if (y, month) < (2018, 5) or (y, month) > (2026, 9):
                continue
            years.add(f"{y:04d}-{month:02d}")
    need(years <= month_set, "A calendar source month is entirely absent")
    shards = s["shards"]
    reused = {}
    for shard in shards:
        for record in shard["source_months"]:
            m = record["month"]
            need(m in complete and m not in reused and
                 complete[m]["sha256"] == record["source_zip_sha256"],
                 "Annual shard provenance conflicts with native source catalog")
            reused[m] = shard["file"]
    need(set(reused) <= set(complete), "Invalid annual shard catalog")
    proof = {k: digest((home / k).read_bytes()) for k in (
        "top250_history_catalog/index.json",
        "btc_verified_gap_months/index.json",
        "calendar_year_hourly_shards/index.json")}
    return complete, incomplete, shards, proof, reused


def gh_release_file(tag, filename, dest):
    need(tag.startswith(("crypto-spot-bulk-", "btc-spot-native-gap-")) and
         "/" not in tag and filename.startswith("BTCUSDT-1m-") and
         filename.endswith((".zip", ".zip.CHECKSUM")),
         "Source file/tag not allowed")
    dest = Path(dest)
    dest.mkdir(parents=True, exist_ok=True)
    result = subprocess.run([
        "gh", "release", "download", tag, "--repo", REPO,
        "--pattern", filename, "--dir", str(dest)], check=True,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=120)
    path = dest / filename
    need(path.is_file() and 0 < path.stat().st_size < 55_000_000,
         "Missing, empty or oversized source Release ZIP")
    return path.read_bytes()


def native_rows_to_daily(rows, month):
    """No daily OHLCV exists unless all 1,440 original UTC minutes exist."""
    groups = defaultdict(list)
    for row in rows:
        need(len(row) == 8 and all(isinstance(x, (int, float)) for x in row),
             "Invalid native minute candle")
        t = row[0]
        need(isinstance(t, int) and t % M == 0 and
             datetime.fromtimestamp(t / 1000, timezone.utc).strftime("%Y-%m") == month,
             "Native candle belongs to another month")
        groups[(t // D) * D].append(row)
    results, dropped = [], []
    for day, group in sorted(groups.items()):
        ordered = sorted(group, key=lambda r: r[0])
        if len(ordered) != 1440 or any(r[0] != day + j * M
                                       for j, r in enumerate(ordered)):
            dropped.append({"day_ms": day, "observed_minutes": len(ordered),
                            "missing_minutes": 1440 - len(ordered)})
            continue
        prior.validate(ordered, "1m")
        results.append([day, ordered[0][1],
                        max(x[2] for x in ordered), min(x[3] for x in ordered),
                        ordered[-1][4], sum(x[5] for x in ordered),
                        sum(x[6] for x in ordered), sum(x[7] for x in ordered)])
    prior.validate(results, "1d", allow_gaps=True) if results else None
    return results, dropped


def gap_source_rows(entry, path):
    month = entry["month"]
    zip_name = f"BTCUSDT-1m-{month}.zip"
    raw = gh_release_file(entry["release_tag"], zip_name, path)
    checked = entry["files"]["archive"]
    need(len(raw) == checked["bytes"] and digest(raw) == checked["sha256"] and
         digest(raw) == entry["source_zip_sha256"],
         "Archived partial original ZIP is not the verified SHA")
    checksum = gh_release_file(entry["release_tag"], zip_name + ".CHECKSUM", path)
    need(digest(checksum) == entry["files"]["checksum"]["sha256"],
         "Original partial source checksum was substituted")
    qualified, source_rows = btc_gap_archive.verify(raw, checksum.decode(), month)
    need(qualified["native_rows"] == entry["native_rows"] and
         qualified["missing_minutes"] == entry["missing_calendar_minutes"] and
         qualified["source_zip_sha256"] == checked["sha256"],
         "Partial source failed original minute/gap verification")
    rows = [[int(r[0]),float(r[1]),float(r[2]),float(r[3]),float(r[4]),
             float(r[5]),float(r[7]),int(r[8])] for r in source_rows]
    # Original rows contain the source's exact native values: no fill/correction.
    return rows, qualified


def full_source_rows(entry, path):
    month = entry["month"]
    zip_name = entry["file"]
    need(zip_name == f"BTCUSDT-1m-{month}.zip", "Unexpected monthly pair")
    raw = gh_release_file(entry["release"], zip_name, path)
    need(digest(raw) == entry["sha256"], "Complete month source SHA-256 mismatch")
    rows = candle.parse_month(raw, month, "BTCUSDT")
    need(len(rows) == entry["candles"], "Original native minute rows differ")
    return rows


def build(home=HOME, output=OUTPUT, loader=gh_release_file):
    complete, partial, shards, catalog_proof, reused = source_catalogs(home)
    # A test may inject an alternative loader by replacing gh_release_file;
    # production always uses GitHub Release assets with immutable proof digests.
    all_rows, details, reused_months = {}, [], set()
    folder = Path(home) / "calendar_year_hourly_shards"
    for shard in shards:
        filename = shard["file"]
        need(Path(filename).name == filename and filename.endswith(".json.gz"),
             "Unsafe annual shard filename")
        raw = (folder / filename).read_bytes()
        need(digest(raw) == shard["sha256"] and len(raw) == shard["bytes"],
             "Published annual shard SHA-256 mismatch")
        src = json.loads(gzip.decompress(raw))
        need(src["asset_id"] == "bitcoin" and src["pair"] == "BTCUSDT" and
             src["quote"] == "USDT" and src["interval"] == "1h" and
             src["source"] == "Binance Spot official monthly native 1m ZIPs" and
             src["native_1m_count"] == shard["native_1m_count"] and
             src["columns"] == prior.COLUMNS and
             len(src["series"]) == shard["hourly_count"],
             "Annual shard payload does not match certified ledger")
        prior.validate(src["series"], "1h")
        for bar in prior.daily(src["series"]):
            month = datetime.fromtimestamp(bar[0]/1000, timezone.utc).strftime("%Y-%m")
            need(month in complete and month in reused and
                 bar[0] not in all_rows, "Overlapping/mislabeled annual source")
            all_rows[bar[0]] = bar
        reused_months.update(r["month"] for r in shard["source_months"])
    need(reused_months == set(reused), "Reused annual months do not balance")
    for month in sorted(complete):
        row = complete[month]
        if month in reused:
            details.append({"month": month, "type": "complete",
                            "source_sha256": row["sha256"],
                            "native_rows": row["candles"], "derived_from": "year_hourly_shard"})
            continue
        with tempfile.TemporaryDirectory(prefix="btc-full-") as td:
            source_rows = full_source_rows(row, td)
        days, lost = native_rows_to_daily(source_rows, month)
        need(not lost, "Strict-complete month unexpectedly contains incomplete UTC days")
        for bar in days:
            need(bar[0] not in all_rows, "Duplicate daily candle across source months")
            all_rows[bar[0]] = bar
        details.append({"month": month, "type": "complete",
                        "source_sha256": row["sha256"],
                        "native_rows": row["candles"], "derived_from": "verified_source_zip"})
    for month in sorted(partial):
        row = partial[month]
        with tempfile.TemporaryDirectory(prefix="btc-partial-") as td:
            bars, qualified = gap_source_rows(row, td)
        complete_days, lost = native_rows_to_daily(bars, month)
        for bar in complete_days:
            need(bar[0] not in all_rows, "Duplicate daily candle across source months")
            all_rows[bar[0]] = bar
        details.append({"month": month, "type": "partial",
                        "source_sha256": row["source_zip_sha256"],
                        "native_rows": len(bars),
                        "missing_source_minutes": qualified["missing_minutes"],
                        "gaps": qualified["gaps"],
                        "omitted_incomplete_days": lost,
                        "valid_daily_rows": len(complete_days),
                        "derived_from": "original_gap_zip_checksum_verified"})
    rows = [all_rows[k] for k in sorted(all_rows)]
    prior.validate(rows, "1d", allow_gaps=True)
    interruptions = prior.gaps(rows, "1d")
    need(len(rows) >= 2900 and
         rows[0][0] == int(datetime(2018,5,1,tzinfo=timezone.utc).timestamp()*1000) and
         rows[-1][0] == int(datetime(2026,9,30,tzinfo=timezone.utc).timestamp()*1000),
         "Incomplete reconstructed BTC source horizon")
    # March 2023 has 44,560 real native minutes and exactly 80 missing.
    march = next(x for x in details if x["month"] == "2023-03")
    need(march["native_rows"] == 44560 and
         march["missing_source_minutes"] == 80 and
         march["valid_daily_rows"] == 30 and
         len(march["omitted_incomplete_days"]) == 1 and
         march["omitted_incomplete_days"][0]["missing_minutes"] == 80,
         "March 2023 was lost or an incomplete day was silently fabricated")
    obj = {"schema": "seven.crypto.btc.integrated-max.v1",
           "asset_id": "bitcoin", "pair": "BTCUSDT", "quote": "USDT",
           "source": "Binance Spot native monthly ZIPs, checked SHA-256",
           "columns": prior.COLUMNS, "interval": "1d", "is_live": False,
           "is_all_time": False, "scope": "complete_and_qualified_partial_2018_2026",
           "first_open_ms": rows[0][0], "last_open_ms": rows[-1][0],
           "gaps": interruptions, "source_months": details, "rows": rows}
    compressed = prior.pack(obj)
    output = Path(output)
    output.mkdir(parents=True, exist_ok=True)
    filename = "bitcoin-Max.json.gz"
    (output/filename).write_bytes(compressed)
    summary = {
        "schema": "seven.crypto.btc.integrated-max-index.v1",
        "asset_id": "bitcoin", "pair": "BTCUSDT", "quote": "USDT",
        "is_live": False, "is_all_time": False,
        "file": filename, "bytes": len(compressed), "sha256": digest(compressed),
        "bars": len(rows), "first_open_ms": rows[0][0], "last_open_ms": rows[-1][0],
        "source_months": len(details), "complete_months": len(complete),
        "partial_months": len(partial), "missing_days": sum(x["missing_bars"] for x in interruptions),
        "missing_source_minutes": sum(x["missing_calendar_minutes"] for x in partial.values()),
        "gaps": interruptions, "source_catalog_sha256": catalog_proof}
    (output/"index.json").write_text(json.dumps(summary,ensure_ascii=False,
                                                   indent=2)+"\n",encoding="utf-8")
    print("BTC MAX RECONSTRUCTED",json.dumps({
        "first": rows[0][0], "last": rows[-1][0], "days": len(rows),
        "full_months": len(complete), "partial_months": len(partial),
        "gap_days": summary["missing_days"],
        "march2023_daily": march["valid_daily_rows"],
        "source_minutes_missing": summary["missing_source_minutes"]},sort_keys=True), flush=True)
    return summary


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=OUTPUT)
    parser.add_argument("--audit-only", action="store_true")
    opt = parser.parse_args()
    if opt.audit_only:
        complete, partial, shards, digests, reused = source_catalogs()
        print("BTC MAX INPUTS",json.dumps({"full":len(complete),"partial":len(partial),
              "annual_reused_months":len(reused),"original_zips_to_fetch":
              len(complete)-len(reused)+len(partial),
              "source_index_sha256":digests},sort_keys=True))
        return
    build(output=opt.output)

if __name__ == "__main__":
    main()
