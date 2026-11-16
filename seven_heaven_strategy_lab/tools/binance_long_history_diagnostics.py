"""Diagnose official Binance BTCUSDT 1h archive irregularities without repairing them.

Research-only. CHECKSUM is verified first. The script reports missing/duplicate/
off-grid open timestamps and close-time mismatches, but never fabricates candles.
"""
from __future__ import annotations

import calendar
import csv
from datetime import datetime, timezone
import hashlib
import io
import json
from pathlib import Path
import re
import sys
import time
import urllib.parse
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

BASE_URL = "https://data.binance.vision/data/spot/monthly/klines/BTCUSDT/1h"
YEARS = (2019, 2020, 2021, 2024, 2025)
MONTHS = tuple((year, month) for year in YEARS for month in range(1, 13))
MAX_ZIP_BYTES = 8_000_000
MAX_CHECKSUM_BYTES = 512
SECONDS_PER_BAR = 3600


def download(url: str, limit: int, attempts: int = 3) -> bytes:
    parsed = urllib.parse.urlsplit(url)
    if (parsed.scheme, parsed.hostname) != ("https", "data.binance.vision"):
        raise RuntimeError("Unexpected source host")
    last = None
    for attempt in range(attempts):
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "Seven-Heaven-Strategy-Lab-History-Diagnostics/1.0"},
            )
            with urllib.request.urlopen(req, timeout=45) as response:
                final = urllib.parse.urlsplit(response.geturl())
                if (final.scheme, final.hostname) != ("https", "data.binance.vision"):
                    raise RuntimeError("Unexpected redirect host")
                data = response.read(limit + 1)
            if not data or len(data) > limit:
                raise RuntimeError("Download size outside limit")
            return data
        except Exception as exc:
            last = exc
            if attempt + 1 < attempts:
                time.sleep(1.0 + attempt)
    raise RuntimeError(f"Download failed: {url}") from last


def iso(second: int) -> str:
    return datetime.fromtimestamp(second, timezone.utc).isoformat()


def inspect_month(year: int, month: int) -> dict:
    stem = f"BTCUSDT-1h-{year}-{month:02d}"
    zip_name = stem + ".zip"
    csv_name = stem + ".csv"
    zip_url = f"{BASE_URL}/{zip_name}"
    archive = download(zip_url, MAX_ZIP_BYTES)
    checksum = download(zip_url + ".CHECKSUM", MAX_CHECKSUM_BYTES).decode("utf-8").strip()
    match = re.fullmatch(r"([0-9a-fA-F]{64})\s+\*?" + re.escape(zip_name), checksum)
    if not match:
        raise RuntimeError("Unexpected CHECKSUM format")
    observed = hashlib.sha256(archive).hexdigest()
    expected_sha = match.group(1).lower()
    if observed != expected_sha:
        raise RuntimeError("CHECKSUM mismatch")
    with zipfile.ZipFile(io.BytesIO(archive)) as z:
        names = z.namelist()
        if names != [csv_name]:
            raise RuntimeError(f"Unexpected ZIP members: {names}")
        payload = z.read(csv_name)
    rows = list(csv.reader(io.StringIO(payload.decode("utf-8"), newline="")))
    unit = 1_000_000 if year >= 2025 else 1_000
    start = int(datetime(year, month, 1, tzinfo=timezone.utc).timestamp())
    expected_count = calendar.monthrange(year, month)[1] * 24
    expected_seconds = {start + i * SECONDS_PER_BAR for i in range(expected_count)}
    actual_seconds = []
    off_grid = []
    close_mismatches = []
    invalid_rows = []
    for idx, row in enumerate(rows, 1):
        if len(row) != 12 or not row[0].isdigit() or not row[6].isdigit():
            invalid_rows.append({"line": idx, "columns": len(row)})
            continue
        raw_open = int(row[0])
        raw_close = int(row[6])
        second = raw_open // unit
        actual_seconds.append(second)
        if raw_open % unit:
            off_grid.append({"line": idx, "raw_open": raw_open})
        expected_close = raw_open + unit * SECONDS_PER_BAR - 1
        if raw_close != expected_close:
            close_mismatches.append({
                "line": idx,
                "open_utc": iso(second),
                "actual_close_raw": raw_close,
                "expected_close_raw": expected_close,
                "delta_raw_units": raw_close - expected_close,
            })
    seen = {}
    duplicates = []
    for sec in actual_seconds:
        seen[sec] = seen.get(sec, 0) + 1
    duplicates = [
        {"open_utc": iso(sec), "count": count}
        for sec, count in sorted(seen.items()) if count > 1
    ]
    actual_set = set(actual_seconds)
    missing = sorted(expected_seconds - actual_set)
    unexpected = sorted(actual_set - expected_seconds)
    ordering_errors = sum(
        1 for a, b in zip(actual_seconds, actual_seconds[1:])
        if b <= a
    )
    anomalous = bool(
        len(rows) != expected_count or invalid_rows or off_grid or
        close_mismatches or duplicates or missing or unexpected or ordering_errors
    )
    return {
        "year": year,
        "month": month,
        "source_zip": zip_name,
        "archive_sha256": observed,
        "checksum_match": True,
        "timestamp_input_unit": "microseconds" if year >= 2025 else "milliseconds",
        "row_count": len(rows),
        "expected_row_count": expected_count,
        "missing_count": len(missing),
        "missing_first_10_utc": [iso(x) for x in missing[:10]],
        "unexpected_count": len(unexpected),
        "unexpected_first_10_utc": [iso(x) for x in unexpected[:10]],
        "duplicate_count": len(duplicates),
        "duplicates_first_10": duplicates[:10],
        "off_grid_count": len(off_grid),
        "off_grid_first_10": off_grid[:10],
        "close_mismatch_count": len(close_mismatches),
        "close_mismatch_first_10": close_mismatches[:10],
        "ordering_error_count": ordering_errors,
        "invalid_row_count": len(invalid_rows),
        "anomalous": anomalous,
    }


def run() -> dict:
    anomalies = []
    clean = 0
    for idx, (year, month) in enumerate(MONTHS, 1):
        record = inspect_month(year, month)
        if record["anomalous"]:
            anomalies.append(record)
            print(
                f"ANOMALY {idx:02d}/60 {year}-{month:02d} "
                f"rows={record['row_count']}/{record['expected_row_count']} "
                f"missing={record['missing_count']} close={record['close_mismatch_count']}"
            )
        else:
            clean += 1
            print(f"CLEAN {idx:02d}/60 {year}-{month:02d}")
    return {
        "schema": "seven.heaven.strategy_lab.binance_history_diagnostics.v1",
        "status": "COMPLETE",
        "source": "OFFICIAL_BINANCE_PUBLIC_DATA",
        "pair": "BTC/USDT",
        "timeframe": "1h",
        "months_inspected": len(MONTHS),
        "months_clean": clean,
        "months_anomalous": len(anomalies),
        "anomalies": anomalies,
        "policy": "REPORT_ONLY_NO_GAP_FILLING",
        "safety": {"orders_real": 0, "workspace_reads": 0, "workspace_writes": 0},
    }


if __name__ == "__main__":
    result = run()
    Path("binance_long_history_diagnostics.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(
        f"DIAGNOSTICS COMPLETE: {result['months_clean']} clean, "
        f"{result['months_anomalous']} anomalous"
    )
