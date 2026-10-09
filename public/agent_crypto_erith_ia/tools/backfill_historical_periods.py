#!/usr/bin/env python3
"""Seven Heaven · source-qualified long-period Spot OHLCV backfill.

Read-only --plan/--verify; --collect requires --enable-network, creates a
separate immutable archive. No replacement of R10, Universe, Top50 or Trader.
The 60d view is a slice of validated 90d 4h candles when available.
"Max" is intentionally NOT claimed by a fixed-year snapshot.
"""
from __future__ import annotations

import argparse
import gzip
import json
import math
from pathlib import Path
import re
import time

import audit_historical_coverage as coverage
from collect_historical_universe import (
    ROOT, atomic_write, digest, encoded, get_json, require, validate_rows,
)

OUTPUT = ROOT / "data/historical_archive_prototype/universe/long-periods"
SCHEMA = "aerith.public.ohlcv.spot.long-periods.index.v1"
BLOCK = "aerith.public.ohlcv.spot.long-periods.block.v1"
# A year is 365 UTC days; this is not a guarantee of 365d of trading history.
HORIZONS = {"90d": ("4h", 14_400_000, 540),
            "60d": ("4h", 14_400_000, 360),
            "1y": ("1d", 86_400_000, 365)}
FILE = re.compile(r"blocks/[a-z0-9-]+_(90d|60d|1y)_[a-f0-9]{16}\.json\.gz")


def candidates(report):
    rows = []
    for a in report["assets"]:
        if not a["archived"]:
            continue
        evidence = a["periods"].get("24h")
        require(evidence and evidence["quote"] == "USDT", "No source pair evidence")
        pair = evidence["pair"]
        require(re.fullmatch("[A-Z0-9]{2,22}USDT", pair) and
                all(x["pair"] == pair for x in a["periods"].values()),
                "Unqualified historical pair identity")
        rows.append({"rank": a["rank"], "id": a["id"], "symbol": a["symbol"],
                     "pair": pair, "owner": a["archive_owner"], "long_periods": {}})
    require(len(rows) == 24, "Unexpected coverage owners")
    return rows


def qualified(entry):
    """Exchange identity must be proven before querying any Binance kline."""
    payload = get_json("/api/v3/exchangeInfo", {"symbol": entry["pair"]})
    match = next((x for x in payload.get("symbols", [])
                  if x.get("symbol") == entry["pair"]), None)
    if not match:
        return False
    return (match.get("baseAsset") == entry["pair"][:-4] and
            match.get("quoteAsset") == "USDT" and
            match.get("status") == "TRADING" and
            match.get("isSpotTradingAllowed") is True and
            ("SPOT" in match.get("permissions", []) or
             any("SPOT" in p for p in match.get("permissionSets", []))))


def get_window(entry, period, now_ms):
    interval, step, size = HORIZONS[period]
    cutoff = ((now_ms - 90_000) // step) * step
    candles = validate_rows(get_json("/api/v3/klines",
                                     {"symbol": entry["pair"], "interval": interval,
                                      "startTime": cutoff-size*step,
                                      "endTime": cutoff-1, "limit": size}),
                            step, size, cutoff)
    data = {"schema": BLOCK, "source": "Binance Spot", "quote": "USDT",
            "asset_id": entry["id"], "pair": entry["pair"],
            "period": period, "interval": interval,
            "first_ms": candles[0][0], "last_ms": candles[-1][0],
            "rows": candles}
    raw = gzip.compress(encoded(data), compresslevel=9, mtime=0)
    checksum = digest(raw)
    name = "blocks/" + entry["id"] + "_" + period + "_" + checksum[:16] + ".json.gz"
    meta = {"file": name, "sha256": checksum, "asset_id": entry["id"],
            "pair": entry["pair"], "period": period, "interval": interval,
            "first_ms": data["first_ms"], "last_ms": data["last_ms"],
            "candles": len(candles)}
    return (name, raw, meta)


def validate(root=OUTPUT):
    path = root / "index.json"
    if not path.is_file():
        return {"state": "NOT_COLLECTED", "archived_assets": 0, "blocks": 0}
    doc = json.loads(path.read_bytes())
    require(doc.get("schema") == SCHEMA and doc.get("quote") == "USDT"
            and doc.get("source") == "Binance Spot"
            and doc.get("status") == "VERIFIED_MANUAL_BACKFILL", "Index not recognized")
    rows, blocks = doc.get("assets"), doc.get("blocks")
    require(isinstance(rows, list) and len(rows) == 24 and
            isinstance(blocks, list) and len(blocks) > 0 and
            doc.get("max_status") == "NOT_AVAILABLE_FROM_THIS_SNAPSHOT",
            "Archive rows or Max status invalid")
    approved = {a["id"]: a for a in rows}
    require(len(approved) == 24, "Duplicate long-period owners")
    seen = set()
    for info in blocks:
        period = info["period"]
        aid = info["asset_id"]
        require(period in HORIZONS and (aid, period) not in seen and aid in approved
                and approved[aid]["pair"] == info["pair"], "Unexpected long-period owner")
        seen.add((aid, period))
        require(info["interval"] == HORIZONS[period][0]
                and info["candles"] == HORIZONS[period][2], "Unexpected horizon count")
        name = info["file"]
        require(FILE.fullmatch(name) and
                name == f"blocks/{aid}_{period}_{info['sha256'][:16]}.json.gz" and
                re.fullmatch("[a-f0-9]{64}", info["sha256"]), "Invalid block reference")
        raw = (root / name).read_bytes()
        require(len(raw) <= 2_000_000 and digest(raw) == info["sha256"],
                "Long-period SHA-256 mismatch")
        block = json.loads(gzip.decompress(raw))
        interval, step, size = HORIZONS[period]
        require(block["schema"] == BLOCK and block["asset_id"] == aid
                and block["pair"] == info["pair"] and block["source"] == "Binance Spot"
                and block["quote"] == "USDT" and block["period"] == period
                and block["interval"] == interval and
                block["first_ms"] == info["first_ms"] and
                block["last_ms"] == info["last_ms"] and
                len(block["rows"]) == size and
                info["last_ms"] == info["first_ms"] + (size-1)*step,
                "Long-period block metadata invalid")
        for i, candle in enumerate(block["rows"]):
            require(isinstance(candle, list) and len(candle) == 8
                    and candle[0] == info["first_ms"] + i*step
                    and all(isinstance(v, (int,float)) and
                            not isinstance(v, bool) and math.isfinite(v)
                            for v in candle)
                    and candle[3] > 0
                    and candle[3] <= min(candle[1], candle[4])
                    and max(candle[1], candle[4]) <= candle[2]
                    and candle[5] >= 0 and candle[6] >= 0,
                    "Incomplete or corrupt long-period candle")
    for a in rows:
        available = a["long_periods"]
        require(isinstance(available, dict), "Missing horizon status")
        listed = {(a["id"], p) for p in HORIZONS
                  if available.get(p, {}).get("status") == "verified"}
        require(listed == {x for x in seen if x[0] == a["id"]},
                "Unindexed horizon or false verified status")
        if available.get("60d", {}).get("status") == "derived_from_90d":
            require((a["id"], "90d") in seen, "Unbacked 60d derivation")
    require(doc["verified_blocks"] == len(blocks)
            and doc["verified_candles"] == sum(x["candles"] for x in blocks),
            "Historical counters not verified")
    return {"state": "VERIFIED", "archived_assets": sum(
            any(s.get("status") in ("verified", "derived_from_90d")
                for s in a["long_periods"].values()) for a in rows),
            "blocks": len(blocks),
            "candles": doc["verified_candles"]}


def collect(root=OUTPUT, now_ms=None):
    require(not (root / "index.json").exists(),
            "Immutable long-period archive exists; never overwrite")
    now_ms = int(time.time()*1000) if now_ms is None else now_ms
    source = coverage.summarize()  # validates all existing archival owners
    rows = candidates(source)
    blobs = []
    for row in rows:
        try:
            is_live = qualified(row)
        except (ValueError, RuntimeError, OSError, KeyError) as exc:
            row["instrument_status"] = "exchange_check_failed"
            row["reason"] = type(exc).__name__
            continue
        if not is_live:
            row["instrument_status"] = "not_binance_spot_trading"
            continue
        row["instrument_status"] = "qualified_spot"
        # Try full 90d first; if incomplete, fall back to independently
        # provable 60d rather than claiming coverage we do not own.
        for period in ("90d", "1y"):
            try:
                item = get_window(row, period, now_ms)
            except (ValueError, RuntimeError, OSError, KeyError, TypeError) as exc:
                row["long_periods"][period] = {"status": "unavailable",
                                               "reason": type(exc).__name__}
                if period == "90d":
                    try:
                        fallback = get_window(row, "60d", now_ms)
                        blobs.append(fallback)
                        row["long_periods"]["60d"] = {"status": "verified"}
                    except (ValueError, RuntimeError, OSError, KeyError, TypeError) as other:
                        row["long_periods"]["60d"] = {"status": "unavailable",
                                                       "reason": type(other).__name__}
                continue
            blobs.append(item)
            row["long_periods"][period] = {"status": "verified"}
            if period == "90d":
                row["long_periods"]["60d"] = {"status": "derived_from_90d"}
        row["long_periods"]["Max"] = {"status": "NOT_AVAILABLE_FROM_THIS_SNAPSHOT"}
    require(blobs, "No complete qualified long-period series, refusing publication")
    index = {"schema": SCHEMA, "source": "Binance Spot", "quote": "USDT",
             "status": "VERIFIED_MANUAL_BACKFILL",
             "source_ranking_utc": source["market_snapshot_end_utc"],
             "snapshotted_at_ms": now_ms, "max_status": "NOT_AVAILABLE_FROM_THIS_SNAPSHOT",
             "assets": rows, "blocks": [item[2] for item in blobs],
             "verified_blocks": len(blobs),
             "verified_candles": sum(x[2]["candles"] for x in blobs)}
    for name, packed, _ in blobs:
        dest = root / name
        if dest.exists():
            require(dest.read_bytes() == packed, "Immutable long-period collision")
        else:
            atomic_write(dest, packed)
    atomic_write(root / "index.json", encoded(index))
    return validate(root)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--output-dir", type=Path, default=OUTPUT)
    flags = p.add_mutually_exclusive_group(required=True)
    flags.add_argument("--plan", action="store_true")
    flags.add_argument("--verify", action="store_true")
    flags.add_argument("--collect", action="store_true")
    p.add_argument("--enable-network", action="store_true")
    args = p.parse_args()
    if args.plan:
        report = coverage.summarize()
        result = {"mode": "OFFLINE_PLAN", "eligible": len(candidates(report)),
                  "horizons": {"60d":"slice of verified 90d or own 60d",
                              "90d":"4h x 540 complete candles",
                              "1y":"1d x 365 complete candles",
                              "Max":"not guaranteed; needs exchange-history pagination"},
                  "existing": validate(args.output_dir)}
    elif args.verify:
        result = validate(args.output_dir)
    else:
        require(args.enable_network, "Explicit --enable-network required")
        result = collect(args.output_dir)
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))


if __name__ == "__main__":
    main()
