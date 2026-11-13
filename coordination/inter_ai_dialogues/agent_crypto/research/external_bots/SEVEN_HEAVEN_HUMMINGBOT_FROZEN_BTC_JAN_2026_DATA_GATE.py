#!/usr/bin/env python3
"""Immutable Binance BTCUSDT 1m ZIP -> audited Hummingbot candle CSV.

Research gate 1 ONLY: this program does not import/run Hummingbot, trade, download
any market data, access accounts, or calculate strategies. It refuses wrong
sources, missing/duplicate candles, mixed time units and malformed OHLCV.

Example:
 python SEVEN_HEAVEN_HUMMINGBOT_FROZEN_BTC_JAN_2026_DATA_GATE.py \
   --archive BTCUSDT-1m-2026-01.zip --output-dir /tmp/erith-hummingbot-gate
"""
from __future__ import annotations

import argparse
import csv
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
import hashlib
import io
import json
from pathlib import Path
import sys
import zipfile

SCHEMA = "seven.heaven.external_bot.frozen_candles_gate.v1"
NAME = "BTCUSDT-1m-2026-01.zip"
SHA256 = "d28b369da32a6ea84ba0af517b1847ab67b2fcc1e0e111c1b24d56ae07240cb9"
ZIP_BYTES = 2127988
EXPECTED = 44640
START = int(datetime(2026, 1, 1, tzinfo=timezone.utc).timestamp())
END = int(datetime(2026, 1, 31, 23, 59, tzinfo=timezone.utc).timestamp())
HEADER = ("timestamp", "open", "high", "low", "close", "volume")
FEED_KEY = "binance_BTC-USDT_1m"


class GateError(ValueError):
    pass


def require(condition: bool, message: str) -> None:
    if not condition:
        raise GateError(message)


def digest_file(p: Path) -> str:
    h = hashlib.sha256()
    with p.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def micro_or_milli_to_seconds(raw: str) -> tuple[int, str]:
    val = int(raw)
    if 1_000_000_000_000_000 <= val < 10_000_000_000_000_000:
        require(val % 1_000_000 == 0, "microsecond timestamp off 1s boundary")
        return val // 1_000_000, "microseconds"
    if 1_000_000_000_000 <= val < 10_000_000_000_000:
        require(val % 1000 == 0, "millisecond timestamp off 1s boundary")
        return val // 1000, "milliseconds"
    raise GateError("Unsupported Binance time units")


def finite_nonnegative(v: str, label: str) -> Decimal:
    try:
        d = Decimal(v)
    except InvalidOperation as e:
        raise GateError("Invalid decimal " + label) from e
    require(d.is_finite() and d >= 0, "Invalid or negative " + label)
    return d


def convert(archive: Path, output_dir: Path) -> dict:
    require(archive.is_file(), "Missing frozen archive")
    require(archive.name == NAME, "Unexpected filename")
    require(archive.stat().st_size == ZIP_BYTES, "Archive size changed")
    require(digest_file(archive) == SHA256, "Archive SHA256 mismatch")
    output_dir.mkdir(parents=True, exist_ok=True)
    csv_path = output_dir / "BTCUSDT-1m-2026-01_HUMMINGBOT_CANDLES.csv"
    manifest_path = output_dir / "BTCUSDT-1m-2026-01_FROZEN_SOURCE_AUDIT.json"
    total = 0
    prev = None
    units = None
    sum_volume = Decimal("0")
    min_low = None
    max_high = None
    try:
        with zipfile.ZipFile(archive) as z:
            members = [x for x in z.infolist() if not x.is_dir()]
            require(len(members) == 1, "ZIP must contain exactly one CSV")
            member = members[0]
            require(member.filename == "BTCUSDT-1m-2026-01.csv",
                    "Unexpected archive member")
            require(member.file_size > 0 and member.file_size <= 16_000_000,
                    "Unreasonable uncompressed size")
            with z.open(member) as src, csv_path.open("w", encoding="utf-8", newline="") as dst:
                reader = csv.reader(io.TextIOWrapper(src, encoding="utf-8-sig", newline=""))
                writer = csv.writer(dst, lineterminator="\n")
                writer.writerow(HEADER)
                for row in reader:
                    require(len(row) == 12, "Expected 12 Binance native fields")
                    t, this_unit = micro_or_milli_to_seconds(row[0])
                    if units is None:
                        units = this_unit
                    require(units == this_unit, "Mixed time units")
                    expected_timestamp = START + total * 60
                    require(t == expected_timestamp, "Timestamp gap, duplicate, unsorted row or out-of-range candle at row " + str(total + 1))
                    require(t <= END, "Too many minutes")
                    # Binance has 1m close_time in the source time unit, ending at
                    # the final subunit before the next opening timestamp.
                    mul = 1_000_000 if units == "microseconds" else 1000
                    require(int(row[6]) == (t + 60) * mul - 1, "Invalid close timestamp")
                    o, h, l, c = (finite_nonnegative(row[i], str(i)) for i in (1, 2, 3, 4))
                    v = finite_nonnegative(row[5], "volume")
                    require(o > 0 and h > 0 and l > 0 and c > 0, "Nonpositive BTC quote")
                    require(l <= o <= h and l <= c <= h, "OHLC inconsistency")
                    require(finite_nonnegative(row[7], "quote_volume") >= 0, "Invalid quote volume")
                    require(int(row[8]) >= 0, "Negative trade count")
                    require(finite_nonnegative(row[9], "taker_buy_base") >= 0, "Invalid taker base")
                    require(finite_nonnegative(row[10], "taker_buy_quote") >= 0, "Invalid taker quote")
                    writer.writerow([t, *(format(d, "f") for d in (o, h, l, c, v))])
                    total += 1
                    prev = t
                    sum_volume += v
                    min_low = l if min_low is None else min(l, min_low)
                    max_high = h if max_high is None else max(h, max_high)
        require(total == EXPECTED and prev == END, "Incomplete January history")
        result = {
            "schema": SCHEMA, "status": "PASS_FROZEN_DATASET_GATE",
            "source": {
                "exchange": "Binance Spot", "pair": "BTCUSDT",
                "month_utc": "2026-01", "name": NAME,
                "sha256": SHA256, "bytes": ZIP_BYTES, "time_unit_in_source": units,
                "release": "crypto-spot-bulk-2026-01-1m"
            },
            "dataset": {
                "rows": total, "first_timestamp_sec": START,
                "last_timestamp_sec": END, "spacing_seconds": 60,
                "volume_base_btc": str(sum_volume),
                "min_low_quote_usdt": str(min_low),
                "max_high_quote_usdt": str(max_high)
            },
            "hummingbot_adapter_contract": {
                "feed_key": FEED_KEY,
                "columns": list(HEADER),
                "timestamp_unit": "unix_epoch_seconds",
                "normalized_csv": csv_path.name,
                "sha256": digest_file(csv_path),
                "installed_and_imported": False,
                "controller_executed": False
            },
            "execution": {
                "orders": 0, "exchange_api_keys_used": False,
                "fills_observed": False, "strategy_returns_computed": False
            },
            "warnings": [
                "Validated immutable candles only, NOT a Hummingbot backtest",
                "Binance BTCUSDT data differ from OKX EEA BTCUSDC",
                "No historical order book or maker queue positions are present",
                "Provider preload and matching trading rules require separate engine test"
            ]
        }
        manifest_path.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        return result
    except Exception:
        csv_path.unlink(missing_ok=True)
        manifest_path.unlink(missing_ok=True)
        raise


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--archive", required=True, type=Path)
    ap.add_argument("--output-dir", required=True, type=Path)
    args = ap.parse_args()
    try:
        result = convert(args.archive, args.output_dir)
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return 0
    except (GateError, ValueError, OSError, zipfile.BadZipFile) as exc:
        print("FROZEN_SOURCE_GATE_FAILED: " + str(exc), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
