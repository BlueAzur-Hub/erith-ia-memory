#!/usr/bin/env python3
"""Spot OHLCV historical Top 10 pilot. Read-only exchange requests; bounded GitHub archive.
No orders, no keys, no changes to any existing Market/Graph/Trader runtime.
"""
from __future__ import annotations
import argparse
import datetime as dt
import gzip
import hashlib
import json
import math
import os
from pathlib import Path
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
ANCHOR = ROOT / "data/historical_archive_prototype/top10/2026-10-01_2026-10-07/manifest.json"
OUTPUT = ROOT / "data/historical_archive_prototype/ohlcv_spot_pilot"
ENDPOINTS = ("https://data-api.binance.vision", "https://api.binance.com")
# Fixed reference top-10 basket. Not dynamically substituted with a different coin.
PAIRS = {"bitcoin": "BTCUSDT", "ethereum": "ETHUSDT", "binancecoin": "BNBUSDT",
         "ripple": "XRPUSDT", "solana": "SOLUSDT", "tron": "TRXUSDT",
         "zcash": "ZECUSDT"}
# 24h = 288 5m, 7d = 168 1h, 30d = 180 4h; <= 1000 klines/request.
PERIODS = {"24h": ("5m", 300_000, 288), "7d": ("1h", 3_600_000, 168),
           "30d": ("4h", 14_400_000, 180)}
MAX_POINTS = 288 + 168 + 180

def load_anchor():
    obj = json.loads(ANCHOR.read_text(encoding="utf-8"))
    assets = obj.get("assets") or []
    if len(assets) != 10 or len({x["id"] for x in assets}) != 10:
        raise ValueError("historical Top 10 anchor invalid")
    return obj, assets

def candles_valid(rows, interval_ms, expected, start_ms, end_ms):
    if not isinstance(rows, list) or len(rows) != expected:
        raise ValueError(f"wrong candles length {len(rows) if isinstance(rows, list) else 'not list'} / {expected}")
    compact = []
    for index, row in enumerate(rows):
        if not isinstance(row, list) or len(row) < 9:
            raise ValueError("missing OHLCV columns")
        t = int(row[0])
        if t != start_ms + index * interval_ms or t > end_ms:
            raise ValueError(f"time gap or open candle at position {index}")
        o, h, l, c, volume, quote_volume = [float(row[j]) for j in (1, 2, 3, 4, 5, 7)]
        trades = int(row[8])
        if (not all(math.isfinite(v) for v in (o, h, l, c, volume, quote_volume))
                or not (0 < l <= min(o, c) <= max(o, c) <= h)
                or volume < 0 or quote_volume < 0 or trades < 0):
            raise ValueError(f"invalid OHLCV at {index}")
        compact.append([t, o, h, l, c, volume, quote_volume, trades])
    return compact

def request_klines(pair, interval, start_ms, end_ms, expected):
    args = urllib.parse.urlencode(dict(symbol=pair, interval=interval,
                                      startTime=start_ms, endTime=end_ms,
                                      limit=expected))
    errors = []
    for base in ENDPOINTS:
        url = base + "/api/v3/klines?" + args
        for attempt in range(2):
            try:
                req = urllib.request.Request(url, headers={
                    "User-Agent": "ERITH-IA-public-historical-research/1.0",
                    "Accept": "application/json"})
                with urllib.request.urlopen(req, timeout=18) as resp:
                    data = json.load(resp)
                if not isinstance(data, list):
                    raise ValueError("exchange returned non-list payload")
                return data, base
            except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, ValueError) as exc:
                errors.append(f"{base}: {type(exc).__name__} {getattr(exc, 'code', '')}")
                if isinstance(exc, urllib.error.HTTPError) and exc.code in (400, 401, 403, 404, 451):
                    break
                if attempt == 0:
                    time.sleep(1)
    raise RuntimeError("; ".join(errors)[:240])

def collect(now: dt.datetime, output: Path):
    anchor, assets = load_anchor()
    if now.tzinfo is None:
        raise ValueError("UTC timezone required")
    now_ms = int(now.timestamp() * 1000)
    data = {"schema": "aerith.public.ohlcv.spot.top10.pilot.v1",
            "kind": "REAL_BINANCE_SPOT_OHLCV_NO_SYNTHETIC_BARS",
            "basket_reference": anchor.get("anchor", {}).get("snapshot_id"),
            "captured_at": now.isoformat().replace("+00:00", "Z"),
            "quote_asset": "USDT", "source": "Binance Spot REST /api/v3/klines",
            "columns": ["open_time_ms", "open", "high", "low", "close",
                        "base_volume", "quote_volume", "trade_count"],
            "periods": {k: {"interval": v[0], "candles_expected": v[2]} for k, v in PERIODS.items()},
            "assets": {}, "unavailable": []}
    for asset in assets:
        asset_id = asset["id"]
        if asset_id not in PAIRS:
            data["unavailable"].append({"id": asset_id, "reason": "instrument_not_qualified_no_substitution"})
            continue
        pair = PAIRS[asset_id]
        entry = {"pair": pair, "quote": "USDT", "periods": {}}
        for label, (interval, span, count) in PERIODS.items():
            end_open = (now_ms // span - 1) * span
            start = end_open - (count - 1) * span
            try:
                raw, endpoint = request_klines(pair, interval, start, end_open + span - 1, count)
                entry["periods"][label] = {"interval": interval,
                    "start_open_ms": start, "last_open_ms": end_open,
                    "endpoint": endpoint, "rows": candles_valid(raw, span, count, start, end_open)}
            except Exception as exc:
                entry["periods"][label] = {"status": "unavailable",
                    "reason": str(exc)[:240]}
            time.sleep(0.3)  # bounded and exchange-friendly
        valid = [k for k, v in entry["periods"].items() if "rows" in v]
        if valid:
            data["assets"][asset_id] = entry
        else:
            data["unavailable"].append({"id": asset_id, "pair": pair,
                                        "reason": "all_periods_unavailable"})
    complete = [k for k, v in data["assets"].items() if len(v["periods"]) == 3 and
                all("rows" in p for p in v["periods"].values())]
    if len(complete) < 5:
        raise RuntimeError(f"Fail closed: only {len(complete)} complete OHLCV assets; no publication.")
    output.mkdir(parents=True, exist_ok=True)
    day = now.strftime("%Y-%m-%d")
    archive = output / f"ohlcv_top10_{day}.json.gz"
    raw = (json.dumps(data, separators=(",", ":"), ensure_ascii=False, allow_nan=False) + "\n").encode("utf-8")
    with archive.open("wb") as f:
        with gzip.GzipFile(filename="", mode="wb", fileobj=f, compresslevel=9, mtime=0) as gz:
            gz.write(raw)
    with gzip.open(archive, "rb") as stream:
        restored = stream.read()
    if restored != raw:
        raise RuntimeError("gzip roundtrip mismatch")
    pairs_qualified = {k: list(v["periods"]) for k, v in data["assets"].items()}
    manifest = {
        "schema": "aerith.public.ohlcv.spot.top10.pilot.manifest.v1",
        "status": "partial_real_data", "archive": archive.name,
        "created_at": data["captured_at"], "reference": data["basket_reference"],
        "top10_reference_count": len(assets),
        "spot_pairs_qualified": len(complete), "complete_assets": complete,
        "pairs_qualified_or_partial": pairs_qualified,
        "unavailable": data["unavailable"], "periods": data["periods"],
        "quote_asset": "USDT", "pricing_warning": "USDT is not USD, EUR or OKX USDC",
        "archive_raw_bytes": len(raw), "archive_gzip_bytes": archive.stat().st_size,
        "archive_sha256": hashlib.sha256(archive.read_bytes()).hexdigest(),
        "method": "real OHLCV spot API; closed candles only; gaps reject; no fallback to market snapshots",
        "real_orders": False, "wrote_browser_storage": False, "modified_market_core": False}
    (output / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False,
                                         indent=2) + "\n", encoding="utf-8")
    return manifest

def self_test():
    t = 1_700_000_000_000
    t = t // 300_000 * 300_000
    rows = [[t+i*300_000,"2.0","2.2","1.8","2.1","100",
             t+(i+1)*300_000-1,"210",10] for i in range(3)]
    good = candles_valid(rows, 300_000, 3, t, t+600_000)
    assert len(good) == 3 and good[0][1] == 2
    bad = [list(x) for x in rows]
    bad[1][0] += 300_000
    try:
        candles_valid(bad, 300_000, 3, t, t+600_000)
    except ValueError:
        pass
    else:
        raise AssertionError("time gaps must be rejected")
    bad = [list(x) for x in rows]
    bad[1][2] = "1.0"
    try:
        candles_valid(bad, 300_000, 3, t, t+600_000)
    except ValueError:
        pass
    else:
        raise AssertionError("invalid high price must be rejected")
    assert MAX_POINTS == 636
    print("SELF_TEST_PASS: OHLCV integrity, chronological gaps, invalid prices, point budget")

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--output-dir", type=Path, default=OUTPUT)
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return
    result = collect(dt.datetime.now(dt.timezone.utc), args.output_dir)
    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
