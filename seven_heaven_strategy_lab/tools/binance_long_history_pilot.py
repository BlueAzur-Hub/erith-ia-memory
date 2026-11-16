"""Network-only research pilot for certified Binance BTCUSDT 1h monthly archives.

This file is intentionally outside src/: it does not change the Strategy Lab runtime.
It downloads four official public monthly ZIPs + CHECKSUM files, then reuses the
V4.6.2 in-memory validator. No workspace access, no trading, no credentials.
"""
from __future__ import annotations

import calendar
import json
from pathlib import Path
import urllib.parse
import urllib.request

from src.binance_monthly_v46 import MAX_ZIP_BYTES, validate_month

BASE_URL = "https://data.binance.vision/data/spot/monthly/klines/BTCUSDT/1h"
PILOT_MONTHS = (
    (2019, 1),   # early target window, millisecond timestamps
    (2021, 5),   # high-volatility bull-cycle sample
    (2024, 1),   # recent pre-microsecond sample
    (2025, 1),   # first microsecond-era month
)
MAX_CHECKSUM_BYTES = 512


def download(url: str, limit: int) -> bytes:
    parsed = urllib.parse.urlsplit(url)
    if (parsed.scheme, parsed.hostname) != ("https", "data.binance.vision"):
        raise RuntimeError("Unexpected source host")
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Seven-Heaven-Strategy-Lab-History-Pilot/1.0"},
    )
    with urllib.request.urlopen(req, timeout=45) as response:
        final = urllib.parse.urlsplit(response.geturl())
        if (final.scheme, final.hostname) != ("https", "data.binance.vision"):
            raise RuntimeError("Unexpected redirect host")
        data = response.read(limit + 1)
    if not data or len(data) > limit:
        raise RuntimeError(f"Download size outside limit: {url}")
    return data


def run() -> dict:
    reports = []
    for year, month in PILOT_MONTHS:
        name = f"BTCUSDT-1h-{year}-{month:02d}.zip"
        zip_url = f"{BASE_URL}/{name}"
        checksum_url = zip_url + ".CHECKSUM"
        archive = download(zip_url, MAX_ZIP_BYTES)
        checksum = download(checksum_url, MAX_CHECKSUM_BYTES).decode("utf-8")
        report = validate_month(archive, checksum, year=year, month=month)
        expected_rows = calendar.monthrange(year, month)[1] * 24
        assert report["rows"] == expected_rows
        assert report["missing_bars"] == 0
        assert report["timestamp_input_unit"] == (
            "microseconds" if year >= 2025 else "milliseconds"
        )
        reports.append({
            key: report[key]
            for key in (
                "status", "exchange", "pair", "timeframe", "year", "month",
                "source_zip", "archive_sha256", "source_csv_sha256",
                "normalized_csv_sha256", "timestamp_input_unit",
                "first_utc", "last_utc", "rows", "missing_bars",
            )
        })
    return {
        "schema": "seven.heaven.strategy_lab.binance_long_history_pilot.v1",
        "status": "PASS" if len(reports) == len(PILOT_MONTHS) else "INCOMPLETE",
        "source": "OFFICIAL_BINANCE_PUBLIC_DATA",
        "pair": "BTC/USDT",
        "timeframe": "1h",
        "months_tested": len(reports),
        "reports": reports,
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
    target = Path("binance_long_history_pilot_evidence.json")
    target.write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))
