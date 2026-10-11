#!/usr/bin/env python3
"""Verified five-market OHLCV period materializer, derived from existing Coffre projections.

No exchange calls, synthetic candles, USD conversion, trades or changes to Trader.
The upstream projections are already derived from original ZIPs; their bytes and
their documented source SHA-256 references are checked again before use.
"""
from __future__ import annotations

import argparse
import gzip
import hashlib
import io
import json
import math
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent / "data/historical_archive_prototype"
DEST = BASE / "verified_periods"
PAIRS = {"bitcoin": "BTCUSDT", "ethereum": "ETHUSDT",
         "binancecoin": "BNBUSDT", "ripple": "XRPUSDT", "solana": "SOLUSDT"}
STEPS = {"1m": 60_000, "5m": 300_000, "1h": 3_600_000, "1d": 86_400_000}
WINDOWS = (("24h", "1m", 1440), ("7j", "5m", 2016),
           ("30j", "1h", 720), ("60j", "1h", 1440),
           ("90j", "1h", 2160), ("1an", "1d", 365),
           ("Max", "1d", None))
SCHEMA = "seven.crypto.verified-period-projection"
INDEX_SCHEMA = "seven.crypto.verified-period-index"
COLUMNS = ["open_time_ms", "open", "high", "low", "close",
           "base_volume", "quote_volume", "trade_count"]


def need(condition, message):
    if not condition:
        raise ValueError(message)


def sha256(raw):
    return hashlib.sha256(raw).hexdigest()


def pack(value):
    raw = json.dumps(value, ensure_ascii=False, allow_nan=False,
                     separators=(",", ":")).encode("utf-8")
    stream = io.BytesIO()
    with gzip.GzipFile(fileobj=stream, mode="wb", filename="", mtime=0,
                       compresslevel=9) as gz:
        gz.write(raw)
    return stream.getvalue()


def index(root, part, schema):
    obj = json.loads((root / part / "index.json").read_text(encoding="utf-8"))
    need(obj["schema"] == schema, "Unrecognized source index: " + part)
    need(obj.get("quote") == "USDT", "USD and USDT must not be conflated")
    return obj


def asset(index_obj, asset_id):
    matches = [item for item in index_obj["assets"] if item["id"] == asset_id]
    need(len(matches) == 1, "Missing or repeated asset identity: " + asset_id)
    return matches[0]


def source(root, part, meta):
    filename = meta["file"]
    need(Path(filename).name == filename and filename.endswith(".json.gz"),
         "Unsafe archive file name")
    raw = (root / part / filename).read_bytes()
    need(len(raw) == meta["bytes"] and sha256(raw) == meta["sha256"],
         "Source projection SHA-256 mismatch: " + filename)
    need(len(raw) < 3_000_000, "Source projection unexpectedly large")
    obj = json.loads(gzip.decompress(raw))
    need(obj.get("asset_id") in PAIRS and
         obj.get("pair") == PAIRS[obj["asset_id"]] and
         obj.get("quote") == "USDT" and obj.get("is_live") is False,
         "Wrong market, quote, or projection scope")
    need(obj.get("columns") == COLUMNS and
         obj.get("first_open_ms") == meta["first_open_ms"] and
         obj.get("last_open_ms") == meta["last_open_ms"],
         "Source metadata differs from payload")
    return obj


def validate(rows, interval, allow_gaps=False):
    step = STEPS[interval]
    need(bool(rows), "Empty series")
    previous = None
    for row in rows:
        need(isinstance(row, list) and len(row) == 8 and
             all(isinstance(v, (int, float)) and math.isfinite(v) for v in row),
             "Malformed OHLCV row")
        t, op, high, low, close, base, quote, trades = row
        need(isinstance(t, int) and t % step == 0 and
             (previous is None or t > previous) and
             (allow_gaps or previous is None or t == previous + step) and
             low > 0 and low <= min(op, close) <= max(op, close) <= high and
             base >= 0 and quote >= 0 and
             isinstance(trades, int) and trades >= 0,
             "Invalid OHLCV, UTC cadence or unlabelled gap")
        previous = t
    return rows


def daily(hourly):
    """Roll up only full authentic 24-hour days, not inferred minutes."""
    validate(hourly, "1h", allow_gaps=True)
    groups = {}
    for row in hourly:
        groups.setdefault(row[0] // STEPS["1d"] * STEPS["1d"], []).append(row)
    result = []
    for day, rows in sorted(groups.items()):
        need(len(rows) == 24 and all(row[0] == day + i * STEPS["1h"]
                                    for i, row in enumerate(rows)),
             "Incomplete historical day; refuse synthetic daily OHLCV")
        result.append([day, rows[0][1], max(x[2] for x in rows),
                       min(x[3] for x in rows), rows[-1][4],
                       sum(x[5] for x in rows), sum(x[6] for x in rows),
                       sum(x[7] for x in rows)])
    return validate(result, "1d", allow_gaps=True)


def gaps(rows, interval):
    step = STEPS[interval]
    return [{"start_ms": a[0] + step, "end_exclusive_ms": b[0],
             "missing_bars": (b[0] - a[0]) // step - 1}
            for a, b in zip(rows, rows[1:]) if b[0] != a[0] + step]


def strict_tail(rows, count, interval):
    need(len(rows) >= count, "Insufficient real observations")
    tail = rows[-count:]
    return validate(tail, interval)


def build_asset(root, month_index, hour_index, annual_index, asset_id):
    month_meta = asset(month_index, asset_id)
    hour_meta = asset(hour_index, asset_id)
    year_meta = asset(annual_index, asset_id)
    need(month_meta["pair"] == hour_meta["pair"] == year_meta["pair"] == PAIRS[asset_id],
         "Pair identity drift")
    need(hour_meta["months"] == 12 and hour_meta["hourly_count"] in (8760, 8784) and
         hour_meta["native_1m_count"] == hour_meta["hourly_count"] * 60,
         "No verified twelve-month native source for " + asset_id)
    need(hour_meta["last_month"] == month_meta["month"],
         "Hourly and monthly projections have different cutoffs")
    mon = source(root, "shared_monthly_views", month_meta)
    hour = source(root, "shared_hourly_views", hour_meta)
    need(mon["schema"] == "aerith.public.ohlcv.shared.monthly-projection.v1" and
         hour["schema"] == "aerith.public.ohlcv.shared.contiguous-hourly-history.v1" and
         hour["native_1m_count"] == hour_meta["native_1m_count"] and
         len(hour["source_months"]) == 12,
         "Unqualified source projection")
    for item in hour["source_months"]:
        need(isinstance(item.get("source_zip_sha256"), str) and
             len(item["source_zip_sha256"]) == 64 and
             item.get("release", "").startswith("crypto-spot-bulk-"),
             "Unverified native month provenance")
    need(hour["source_months"][-1]["source_zip_sha256"] ==
         mon["source_zip_sha256"], "Latest native source ZIP differs")
    minutes = validate(mon["series"]["1m"], "1m")
    fives = validate(mon["series"]["5m"], "5m")
    hours = validate(hour["series"], "1h")
    need(len(minutes) == 1440 and len(fives) >= 2016 and
         len(hours) == hour_meta["hourly_count"] and
         hours[-1][0] + STEPS["1h"] - STEPS["1m"] == minutes[-1][0],
         "Historical end alignment mismatch")

    shards = sorted(year_meta.get("shards", []), key=lambda x: x["first_open_ms"])
    need(bool(shards), "No materialized Max shards for " + asset_id)
    max_hours = []
    proof = []
    for meta in shards:
        obj = source(root, "calendar_year_hourly_shards", meta)
        need(obj["schema"] == "aerith.public.ohlcv.calendar-year-hourly-shard.v1" and
             obj["asset_id"] == asset_id and obj["interval"] == "1h" and
             len(obj["source_months"]) == len(meta["source_months"]) and
             obj["native_1m_count"] == meta["native_1m_count"],
             "Unqualified calendar-year shard")
        validate(obj["series"], "1h")
        need(len(obj["series"]) == meta["hourly_count"] and
             (not max_hours or obj["series"][0][0] > max_hours[-1][0]),
             "Overlap or duplicated historical source")
        max_hours.extend(obj["series"])
        proof.extend(obj["source_months"])
    need(max_hours[-1][0] == hours[-1][0],
         "Annual shards end at a different historical cutoff")
    validate(max_hours, "1h", allow_gaps=True)
    annual_days = daily(hours)
    max_days = daily(max_hours)
    need(len(annual_days) >= 365 and len(max_days) >= len(annual_days),
         "Missing verified annual projection")

    histories = {"24h": strict_tail(minutes, 1440, "1m"),
                 "7j": strict_tail(fives, 2016, "5m"),
                 "30j": strict_tail(hours, 720, "1h"),
                 "60j": strict_tail(hours, 1440, "1h"),
                 "90j": strict_tail(hours, 2160, "1h"),
                 "1an": strict_tail(annual_days, 365, "1d"),
                 "Max": max_days}
    outputs = []
    for period, interval, expected in WINDOWS:
        rows = histories[period]
        validate(rows, interval, allow_gaps=period == "Max")
        if expected is not None:
            need(len(rows) == expected, "Unexpected window length")
        breaks = gaps(rows, interval)
        need(period == "Max" or not breaks,
             "Unexpected gap in a certified short period")
        obj = {"schema": SCHEMA, "asset_id": asset_id, "pair": PAIRS[asset_id],
               "quote": "USDT", "is_live": False, "period": period,
               "resolution": interval, "columns": COLUMNS,
               "is_all_time": False,
               "scope": "materialized_verified_history" if period == "Max"
                        else "last_verified_closed_archive_window",
               "source": "Binance Spot original checked 1m monthly ZIP",
               "last_source_month": hour_meta["last_month"],
               "native_source_months": hour["source_months"] if period != "Max" else proof,
               "source_projection_sha256": [month_meta["sha256"], hour_meta["sha256"]]
                       if period != "Max" else [s["sha256"] for s in shards],
               "start_ms": rows[0][0], "end_exclusive_ms": rows[-1][0] + STEPS[interval],
               "gaps": breaks, "rows": rows}
        raw = pack(obj)
        name = asset_id + "-" + period + ".json.gz"
        outputs.append((name, raw, {
            "period": period, "resolution": interval, "file": name,
            "sha256": sha256(raw), "bytes": len(raw), "bars": len(rows),
            "start_ms": obj["start_ms"], "end_exclusive_ms": obj["end_exclusive_ms"],
            "gaps": len(breaks), "source_projections": obj["source_projection_sha256"]}))
    return {"id": asset_id, "pair": PAIRS[asset_id], "quote": "USDT",
            "verified_closed_months": 12, "verified_native_minutes": hour_meta["native_1m_count"],
            "first_month": hour_meta["first_month"], "last_month": hour_meta["last_month"],
            "max_scope": "materialized_calendar_year_shards_not_all_time",
            "periods": [meta for _, _, meta in outputs]}, outputs


def build(root=BASE, output=DEST):
    root, output = Path(root), Path(output)
    monthly = index(root, "shared_monthly_views",
                    "aerith.public.ohlcv.shared.monthly-index.v1")
    hourly = index(root, "shared_hourly_views",
                   "aerith.public.ohlcv.shared.contiguous-hourly-index.v1")
    annual = index(root, "calendar_year_hourly_shards",
                   "aerith.public.ohlcv.calendar-year-hourly-shard-index.v1")
    results = [build_asset(root, monthly, hourly, annual, aid) for aid in PAIRS]
    dates = {(m["first_month"], m["last_month"]) for m, _ in results}
    need(len(dates) == 1, "Pilot markets cannot be joined across different periods")
    output.mkdir(parents=True, exist_ok=True)
    for _, files in results:
        for name, binary, metadata in files:
            need(sha256(binary) == metadata["sha256"], "Materialization changed")
            (output / name).write_bytes(binary)
    summary = {"schema": INDEX_SCHEMA, "quote": "USDT", "is_live": False,
               "is_all_time": False, "source": "Binance Spot native verified 1m ZIPs",
               "scope": "12 verified closed months plus available annual shards",
               "core_assets": len(results), "periods_per_asset": len(WINDOWS),
               "assets": [metadata for metadata, _ in results]}
    (output / "index.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("VERIFIED PERIODS", json.dumps({
        "assets": len(results), "periods": len(WINDOWS),
        "materialized_files": len(results) * len(WINDOWS),
        "first_month": next(iter(dates))[0], "last_month": next(iter(dates))[1],
        "minute_source_candles": sum(a["verified_native_minutes"] for a, _ in results)
    }, sort_keys=True), flush=True)
    return summary


if __name__ == "__main__":
    cli = argparse.ArgumentParser()
    cli.add_argument("--root", type=Path, default=BASE)
    cli.add_argument("--output", type=Path, default=DEST)
    args = cli.parse_args()
    build(args.root, args.output)
