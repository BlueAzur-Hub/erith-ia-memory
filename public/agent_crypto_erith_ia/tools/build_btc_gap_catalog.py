#!/usr/bin/env python3
"""Independent, read-only audit of Bitcoin gap Releases; not the canonical gap index.

No downloads of large ZIPs, no trading writes and no synthetic candles.
A release is indexed only when its manifest digest, ZIP SHA-256 identity,
SQLite digest, timing, calendar counts and original provenance agree.
"""
from __future__ import annotations
import argparse
import calendar
import datetime as dt
import hashlib
import json
from pathlib import Path
import re
import subprocess
import tempfile

REPO = "BlueAzur-Hub/erith-ia-memory"
HOME = Path(__file__).resolve().parents[1] / "data/historical_archive_prototype"
FULL_CATALOG = HOME / "top250_history_catalog/index.json"
OUTPUT = HOME / "btc_source_gap_audit/index.json"
TAG = re.compile(r"^btc-spot-native-gap-(20\d{2}-(?:0[1-9]|1[0-2]))$")
SHA = re.compile(r"^[0-9a-f]{64}$")
MAX_RELEASE_PAGES = 100
MAX_GAP_RELEASES = 160


def require(ok, message):
    if not ok:
        raise ValueError(message)


def fetch_releases():
    """Fail closed when a release page is missing or pagination is exhausted."""
    rows = []
    for page in range(1, MAX_RELEASE_PAGES + 1):
        p = subprocess.run(
            ["gh", "api", f"repos/{REPO}/releases?per_page=100&page={page}"],
            check=True, capture_output=True, text=True, timeout=90)
        group = json.loads(p.stdout)
        require(isinstance(group, list) and len(group) <= 100, "Invalid GitHub releases page")
        rows.extend(group)
        if len(group) < 100:
            return rows
    raise ValueError("GitHub release listing exceeds safe pagination limit")


def manifest_from_release(release):
    tag = release["tag_name"]
    month = TAG.fullmatch(tag).group(1)
    filename = f"BTCUSDT-1m-{month}.json"
    with tempfile.TemporaryDirectory(prefix="btc-gap-catalog-") as td:
        command = ["gh", "release", "download", tag, "--pattern",
                   filename, "--dir", td, "--repo", REPO]
        subprocess.run(command, check=True, timeout=110, capture_output=True, text=True)
        path = Path(td) / filename
        require(path.is_file() and 30 < path.stat().st_size < 2_000_000,
                "Missing or oversized source manifest: " + tag)
        return path.read_bytes()


def file_info(asset):
    require(isinstance(asset.get("digest"), str) and
            asset["digest"].startswith("sha256:") and
            bool(SHA.fullmatch(asset["digest"][7:])),
            "Missing SHA-256 on GitHub Release asset")
    require(isinstance(asset.get("size"), int) and asset["size"] > 0,
            "Invalid immutable GitHub asset length")
    return {"name": asset["name"], "size_bytes": asset["size"],
            "sha256": asset["digest"][7:]}


def verify_release(release, raw_manifest):
    match = TAG.fullmatch(release.get("tag_name", ""))
    require(match is not None and not release.get("draft"),
            "Expected a published, unambiguous BTC source release")
    month = match.group(1)
    assets = release.get("assets")
    require(isinstance(assets, list) and len(assets) == 4,
            "Gap Release must contain the four proof files")
    names = {
        "zip": f"BTCUSDT-1m-{month}.zip",
        "checksum": f"BTCUSDT-1m-{month}.zip.CHECKSUM",
        "sqlite": f"BTCUSDT-1m-{month}.sqlite",
        "manifest": f"BTCUSDT-1m-{month}.json"
    }
    evidence = {item["name"]: item for item in assets}
    require(set(evidence) == set(names.values()), "Unexpected or missing proof asset")
    manifest_info = file_info(evidence[names["manifest"]])
    require(len(raw_manifest) == manifest_info["size_bytes"] and
            hashlib.sha256(raw_manifest).hexdigest() == manifest_info["sha256"],
            "Downloaded manifest does not match official immutable Release digest")
    data = json.loads(raw_manifest)
    require(data.get("schema") == "seven.btc.native.source-quality.v1" and
            data.get("month") == month and
            data.get("pair") == "BTCUSDT" and
            data.get("quote") == "USDT" and
            data.get("interval") == "1m" and
            data.get("source") == "Binance Spot official" and
            data.get("canonical_import") is False and
            data.get("synthetic_rows") == 0,
            "BTC monthly source identity/provenance unqualified")
    require(data.get("status") in
            ("source_verified_gaps", "source_with_gaps_and_close_time_anomaly"),
            "Not a gap-qualified source")
    y, m = map(int, month.split("-"))
    start = int(dt.datetime(y, m, 1, tzinfo=dt.timezone.utc).timestamp() * 1000)
    end = start + calendar.monthrange(y, m)[1] * 86_400_000
    expected = (end - start) // 60_000
    native = data.get("native_rows")
    missing = data.get("missing_minutes")
    require(isinstance(native, int) and native > 0 and
            isinstance(missing, int) and missing >= 0 and
            native + missing == expected == data.get("expected_minutes"),
            "Source month candles do not balance calendar minutes")
    require(isinstance(data.get("first_open_ms"), int) and
            isinstance(data.get("last_open_ms"), int) and
            start <= data["first_open_ms"] <= data["last_open_ms"] < end,
            "Source open times fall outside UTC month")
    gaps = data.get("gaps")
    require(isinstance(gaps, list) and len(gaps) < 10_000, "Invalid source gap ledger")
    total_gaps = 0
    previous_end = start
    for gap in gaps:
        a, b, minutes = (gap.get("start_ms"), gap.get("end_ms_exclusive"), gap.get("minutes"))
        require(all(isinstance(v, int) for v in (a, b, minutes)) and
                previous_end <= a < b <= end and
                a % 60_000 == b % 60_000 == 0 and
                minutes == (b - a) // 60_000 and minutes > 0,
                "Gap ledger has overlaps, wrong count or invalid UTC bounds")
        total_gaps += minutes
        previous_end = b
    require(total_gaps == missing, "Missing-minute total disagrees with gap ledger")
    anomalies = data.get("close_time_anomalies", [])
    anomaly_count = data.get("close_time_anomaly_count", 0)
    require(isinstance(anomaly_count, int) and 0 <= anomaly_count <= 2 and
            isinstance(anomalies, list) and len(anomalies) == anomaly_count,
            "Source close-time anomaly provenance incomplete")
    require(missing > 0 or anomaly_count > 0, "No source gaps/anomalies")
    if anomaly_count:
        require(data.get("close_time_anomalies_kept_original") is True,
                "Changed/corrected source timestamps cannot be admitted as originals")
    original_zip = file_info(evidence[names["zip"]])
    sqlite = file_info(evidence[names["sqlite"]])
    require(original_zip["sha256"] == data.get("source_zip_sha256") and
            sqlite["sha256"] == data.get("sqlite_sha256"),
            "Original ZIP or SQLite source digest differs from manifest")
    return {
        "month": month, "status": data["status"],
        "venue": "Binance Spot", "pair": "BTCUSDT", "quote": "USDT",
        "interval": "1m", "canonical_full_month": False,
        "native_rows": native, "calendar_minutes": expected,
        "missing_minutes": missing, "gaps": gaps,
        "close_time_anomaly_count": anomaly_count,
        "close_time_anomalies": anomalies,
        "synthetic_rows": 0,
        "first_open_ms": data["first_open_ms"],
        "last_open_ms": data["last_open_ms"],
        "release_tag": release["tag_name"],
        "release_url": release.get("html_url", ""),
        "proof": {key: file_info(evidence[val]) for key, val in names.items()},
        "source_url": data.get("source_url"),
        "source_checksum_url": data.get("checksum_url")
    }


def build(releases, get_manifest, canonical, canonical_digest):
    require(canonical.get("ranked") == 250 and canonical.get("quote") == "USDT",
            "Canonical Top250 source missing")
    row = next((a for a in canonical.get("assets", []) if a.get("id") == "bitcoin"), None)
    require(row is not None and row.get("symbol") == "BTC", "Canonical BTC identity missing")
    full = {a["month"] for a in row.get("months", [])}
    require(len(full) == len(row.get("months", [])), "Duplicate full-month BTC source")
    entries = []
    seen_tags = set()
    for release in releases:
        tag = release.get("tag_name", "")
        match = TAG.fullmatch(tag)
        if not match or release.get("draft"):
            continue
        require(tag not in seen_tags, "Duplicate published gap Release tag")
        seen_tags.add(tag)
        entry = verify_release(release, get_manifest(release))
        require(entry["month"] not in full, "Both complete and gap-qualified BTC month")
        entries.append(entry)
    require(len(entries) <= MAX_GAP_RELEASES, "Unbounded source gap inventory")
    entries.sort(key=lambda a: a["month"])
    count = sum(x["native_rows"] for x in entries)
    complete = sum(int(rowx.get("candles", 0)) for rowx in row["months"])
    return {
        "schema": "seven.btc.source-quality-catalog.v1",
        "scope": "source-qualified-partial-months-research-not-strict-canonical",
        "asset_id": "bitcoin", "venue": "Binance Spot",
        "pair": "BTCUSDT", "quote": "USDT", "resolution": "1m",
        "is_live": False, "no_synthetic_candles": True,
        "canonical_catalog_sha256": canonical_digest,
        "complete_months_in_canonical": len(full),
        "complete_native_candles_in_canonical": complete,
        "gap_months": len(entries),
        "gap_month_native_rows": count,
        "gap_calendar_minutes_missing": sum(x["missing_minutes"] for x in entries),
        "unique_months_total": len(full) + len(entries),
        "unique_native_rows_total": complete + count,
        "earliest_covered_month": min(full | {x["month"] for x in entries}) if full or entries else None,
        "latest_covered_month": max(full | {x["month"] for x in entries}) if full or entries else None,
        "note": "A gap or source close-time anomaly is not a synthetic candle. Missing minutes remain absent and old close timestamps remain uncorrected. This is a verified source inventory, not a continuous history or proof of a full first-to-last-trade feed.",
        "months": entries
    }


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--catalog", type=Path, default=FULL_CATALOG)
    p.add_argument("--output", type=Path, default=OUTPUT)
    args = p.parse_args()
    raw = args.catalog.read_bytes()
    report = build(fetch_releases(), manifest_from_release,
                   json.loads(raw), hashlib.sha256(raw).hexdigest())
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, sort_keys=True, indent=2) + "\n",
                           encoding="utf-8")
    print("BTC GAP MONTH CATALOG " + json.dumps({
        "complete_months": report["complete_months_in_canonical"],
        "gap_months": report["gap_months"],
        "total_unique_months": report["unique_months_total"],
        "gap_native_rows": report["gap_month_native_rows"],
        "total_native_rows": report["unique_native_rows_total"],
        "earliest_month": report["earliest_covered_month"]}, sort_keys=True), flush=True)


if __name__ == "__main__":
    main()
