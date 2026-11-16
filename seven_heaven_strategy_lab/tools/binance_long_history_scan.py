"""Full target-window checksum/continuity scan for Binance BTCUSDT 1h archives.

Research-only. Downloads official public monthly ZIP + CHECKSUM files for
2019-2021 and 2024-2025, validates each with the V4.6.2 validator, and writes
only compact evidence. It never touches workspace and never performs trading.
"""
from __future__ import annotations

import calendar
import json
from pathlib import Path
import sys
import time
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.binance_monthly_v46 import MAX_ZIP_BYTES, validate_month

BASE_URL = "https://data.binance.vision/data/spot/monthly/klines/BTCUSDT/1h"
YEARS = (2019, 2020, 2021, 2024, 2025)
MONTHS = tuple((year, month) for year in YEARS for month in range(1, 13))
MAX_CHECKSUM_BYTES = 512


def download(url: str, limit: int, attempts: int = 3) -> bytes:
    parsed = urllib.parse.urlsplit(url)
    if (parsed.scheme, parsed.hostname) != ("https", "data.binance.vision"):
        raise RuntimeError("Unexpected source host")
    last = None
    for attempt in range(attempts):
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "Seven-Heaven-Strategy-Lab-History-Scan/1.0"},
            )
            with urllib.request.urlopen(req, timeout=45) as response:
                final = urllib.parse.urlsplit(response.geturl())
                if (final.scheme, final.hostname) != ("https", "data.binance.vision"):
                    raise RuntimeError("Unexpected redirect host")
                data = response.read(limit + 1)
            if not data or len(data) > limit:
                raise RuntimeError(f"Download size outside limit: {url}")
            return data
        except Exception as exc:
            last = exc
            if attempt + 1 < attempts:
                time.sleep(1.0 + attempt)
    raise RuntimeError(f"Download failed after {attempts} attempts: {url}") from last


def run() -> dict:
    reports = []
    failures = []
    total_rows = 0
    for idx, (year, month) in enumerate(MONTHS, 1):
        name = f"BTCUSDT-1h-{year}-{month:02d}.zip"
        zip_url = f"{BASE_URL}/{name}"
        checksum_url = zip_url + ".CHECKSUM"
        try:
            archive = download(zip_url, MAX_ZIP_BYTES)
            checksum = download(checksum_url, MAX_CHECKSUM_BYTES).decode("utf-8")
            report = validate_month(archive, checksum, year=year, month=month)
            expected_rows = calendar.monthrange(year, month)[1] * 24
            assert report["rows"] == expected_rows
            assert report["missing_bars"] == 0
            assert report["timestamp_input_unit"] == (
                "microseconds" if year >= 2025 else "milliseconds"
            )
            total_rows += report["rows"]
            reports.append({
                "year": year,
                "month": month,
                "rows": report["rows"],
                "missing_bars": report["missing_bars"],
                "timestamp_input_unit": report["timestamp_input_unit"],
                "first_utc": report["first_utc"],
                "last_utc": report["last_utc"],
                "archive_sha256": report["archive_sha256"],
                "normalized_csv_sha256": report["normalized_csv_sha256"],
            })
            print(f"PASS {idx:02d}/{len(MONTHS)} {year}-{month:02d} rows={report['rows']} unit={report['timestamp_input_unit']}")
        except Exception as exc:
            failures.append({
                "year": year,
                "month": month,
                "source_zip": name,
                "error_type": type(exc).__name__,
                "error": str(exc),
            })
            print(f"FAIL {idx:02d}/{len(MONTHS)} {year}-{month:02d}: {type(exc).__name__}: {exc}")
    return {
        "schema": "seven.heaven.strategy_lab.binance_long_history_scan.v2",
        "status": "COMPLETE_WITH_SOURCE_GAPS" if failures else "PASS",
        "source": "OFFICIAL_BINANCE_PUBLIC_DATA",
        "pair": "BTC/USDT",
        "timeframe": "1h",
        "target_years": list(YEARS),
        "months_attempted": len(MONTHS),
        "months_verified": len(reports),
        "months_failed": len(failures),
        "total_rows_verified": total_rows,
        "first_verified_utc": reports[0]["first_utc"] if reports else None,
        "last_verified_utc": reports[-1]["last_utc"] if reports else None,
        "reports": reports,
        "failures": failures,
        "safety": {
            "paper_only": True,
            "orders_real": 0,
            "credentials": 0,
            "workspace_reads": 0,
            "workspace_writes": 0,
        },
    }


if __name__ == "__main__":
    result = run()
    target = Path("binance_long_history_scan_evidence.json")
    target.write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(
        f"SCAN COMPLETE: {result['months_verified']}/{result['months_attempted']} months verified, "
        f"{result['months_failed']} failed, {result['total_rows_verified']} hourly candles verified"
    )
