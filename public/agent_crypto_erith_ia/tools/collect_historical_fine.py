#!/usr/bin/env python3
"""Seven Heaven · daily sealed 5m Spot OHLCV fine-history, independent of all prior archives.

The first stage is deliberately ONE approved DOGE/USDT pilot; never alter R9/R10,
Universe, Top50, Trader, Administrator or the existing collectors. Every full UTC
day is immutable and SHA-256 addressed. Supports repeated forward append and
backward backfill, with strict continuity and fail-closed Binance spot checks.
"""
from __future__ import annotations

import argparse
import gzip
import json
from pathlib import Path
import re
import time

import audit_historical_coverage as coverage
from collect_historical_universe import ROOT, atomic_write, digest, encoded, get_json, require, validate_rows

OUTPUT = ROOT / "data/historical_archive_prototype/universe/fine-history/dogecoin/5m"
SCHEMA = "aerith.public.ohlcv.spot.fine-history.index.v1"
BLOCK = "aerith.public.ohlcv.spot.fine-history.daily-block.v1"
DAY = 86_400_000
STEP = 300_000
COUNT = DAY // STEP  # 288 CLOSED 5-minute candles / full UTC day
PAIR = "DOGEUSDT"
ASSET = "dogecoin"
QUOTE = "USDT"
NAME = re.compile(r"^blocks/(1[0-9]{12})_([a-f0-9]{16})\.json\.gz$")
SHA = re.compile(r"^[a-f0-9]{64}$")
MAX_DAYS_PER_RUN = 30
MAX_BLOCKS = 3650  # safety capacity, NOT evidence of a real Max historical start


def identity():
    """Only reuse an already archived, CoinGecko-ID-qualified Spot pair."""
    report = coverage.summarize()
    hits = [a for a in report["assets"] if a["id"] == ASSET]
    require(len(hits) == 1 and hits[0]["archived"]
            and hits[0]["symbol"] == "DOGE"
            and len(hits[0]["periods"]) == 3
            and all(p["pair"] == PAIR and p["quote"] == QUOTE
                    for p in hits[0]["periods"].values()),
            "Existing archive cannot prove pilot identity")
    return hits[0]


def spot_is_trading():
    info = get_json("/api/v3/exchangeInfo", {"symbol": PAIR})
    found = [a for a in info.get("symbols", []) if a.get("symbol") == PAIR]
    require(len(found) == 1, "No unique DOGE Binance Spot pair")
    asset = found[0]
    require(asset.get("baseAsset") == "DOGE" and asset.get("quoteAsset") == QUOTE
            and asset.get("status") == "TRADING"
            and asset.get("isSpotTradingAllowed") is True
            and ("SPOT" in asset.get("permissions", [])
                 or any("SPOT" in grp for grp in asset.get("permissionSets", []))),
            "Binance instrument not qualified for Spot")


def check_meta(b):
    require(isinstance(b, dict) and isinstance(b.get("first_ms"), int)
            and b["first_ms"] > 0 and b["first_ms"] % DAY == 0
            and b.get("last_ms") == b["first_ms"] + DAY - STEP
            and b.get("candles") == COUNT and b.get("interval") == "5m"
            and b.get("asset_id") == ASSET and b.get("pair") == PAIR
            and SHA.fullmatch(b.get("sha256", "")), "Fine-history metadata invalid")
    name = "blocks/" + str(b["first_ms"]) + "_" + b["sha256"][:16] + ".json.gz"
    require(b.get("file") == name and NAME.fullmatch(name),
            "Fine-history block path or fingerprint invalid")


def verify(root=OUTPUT):
    index_file = root / "index.json"
    if not index_file.is_file():
        return {"status": "NOT_COLLECTED", "blocks": 0, "candles": 0}
    doc = json.loads(index_file.read_bytes())
    require(doc.get("schema") == SCHEMA and doc.get("source") == "Binance Spot"
            and doc.get("quote") == QUOTE and doc.get("asset_id") == ASSET
            and doc.get("pair") == PAIR and doc.get("interval") == "5m"
            and doc.get("status") == "VERIFIED_FULL_UTC_DAYS_NOT_LIVE"
            and doc.get("max_status") == "NOT_REACHED_OR_PROVEN"
            and isinstance(doc.get("blocks"), list)
            and 0 < len(doc["blocks"]) <= MAX_BLOCKS,
            "Fine-history catalogue invalid")
    blocks = doc["blocks"]
    require(doc.get("first_ms") == blocks[0].get("first_ms")
            and doc.get("last_ms") == blocks[-1].get("last_ms")
            and doc.get("verified_blocks") == len(blocks)
            and doc.get("verified_candles") == len(blocks) * COUNT,
            "Fine-history counters invalid")
    seen = set()
    for i, meta in enumerate(blocks):
        check_meta(meta)
        require(meta["file"] not in seen, "Repeated fine-history block")
        seen.add(meta["file"])
        if i:
            require(meta["first_ms"] == blocks[i-1]["first_ms"] + DAY,
                    "Fine-history gap, duplicate or out-of-order UTC day")
        raw = (root / meta["file"]).read_bytes()
        require(0 < len(raw) <= 2_000_000 and digest(raw) == meta["sha256"],
                "Fine-history SHA-256 mismatch")
        bar = json.loads(gzip.decompress(raw))
        require(bar.get("schema") == BLOCK and bar.get("source") == "Binance Spot"
                and bar.get("quote") == QUOTE and bar.get("asset_id") == ASSET
                and bar.get("pair") == PAIR and bar.get("interval") == "5m"
                and bar.get("first_ms") == meta["first_ms"]
                and bar.get("last_ms") == meta["last_ms"]
                and isinstance(bar.get("rows"), list)
                and len(bar["rows"]) == COUNT,
                "Fine-history block invalid")
        for j, row in enumerate(bar["rows"]):
            require(isinstance(row, list) and len(row) == 8
                    and row[0] == meta["first_ms"] + j * STEP
                    and isinstance(row[7], int) and row[7] >= 0
                    and all(isinstance(v, (int, float)) and not isinstance(v, bool)
                            for v in row[1:7])
                    and row[3] > 0 and row[3] <= min(row[1], row[4])
                    <= max(row[1], row[4]) <= row[2]
                    and row[5] >= 0 and row[6] >= 0,
                    "Fine-history OHLCV corrupt")
    return {"status": "VERIFIED", "blocks": len(blocks),
            "candles": len(blocks) * COUNT,
            "first_ms": blocks[0]["first_ms"], "last_ms": blocks[-1]["last_ms"]}


def closed_day_end(now_ms):
    # A 90-second buffer; only fully CLOSED UTC days, never partial current day.
    return ((now_ms - 90_000) // DAY) * DAY


def ranges(root, mode, days, now_ms):
    require(mode in ("bootstrap", "append", "backfill")
            and isinstance(days, int) and 1 <= days <= MAX_DAYS_PER_RUN,
            "Invalid bounded collection request")
    state = verify(root)
    end = closed_day_end(now_ms)
    if mode == "bootstrap":
        require(state["status"] == "NOT_COLLECTED",
                "Fine-history already exists: never reset")
        return [(t, t + DAY) for t in range(end - days * DAY, end, DAY)]
    require(state["status"] == "VERIFIED", "Fine-history baseline not yet collected")
    if mode == "append":
        start = state["last_ms"] + STEP
        if end <= start:
            return []
        return [(t, t + DAY) for t in range(start, min(end, start+days*DAY), DAY)]
    first = state["first_ms"]
    return [(t, t+DAY) for t in range(first-days*DAY, first, DAY)]


def fetch_day(start):
    """Request only previously closed full UTC days; no guessed missing values."""
    rows = get_json("/api/v3/klines",
                    {"symbol": PAIR, "interval": "5m",
                     "startTime": start, "endTime": start + DAY - 1,
                     "limit": COUNT})
    checked = validate_rows(rows, STEP, COUNT, start + DAY)
    record = {"schema": BLOCK, "source": "Binance Spot", "quote": QUOTE,
              "asset_id": ASSET, "pair": PAIR, "interval": "5m",
              "first_ms": start, "last_ms": start + DAY - STEP, "rows": checked}
    raw = gzip.compress(encoded(record), compresslevel=9, mtime=0)
    checksum = digest(raw)
    name = "blocks/" + str(start) + "_" + checksum[:16] + ".json.gz"
    meta = {"file": name, "sha256": checksum, "asset_id": ASSET,
            "pair": PAIR, "interval": "5m", "first_ms": start,
            "last_ms": start+DAY-STEP, "candles": COUNT}
    check_meta(meta)
    return name, raw, meta


def collect(root, mode, days, now_ms):
    identity()
    requested = ranges(root, mode, days, now_ms)
    if not requested:
        return {"status": "NOOP", "blocks": 0, "candles": 0}
    spot_is_trading()
    current = json.loads((root/"index.json").read_bytes()) if mode != "bootstrap" else None
    require(len(requested) + len(current["blocks"] if current else []) <= MAX_BLOCKS,
            "Fine-history archival safety capacity reached")
    prepared = [fetch_day(start) for start, _ in requested]
    before = current["blocks"] if current else []
    merged = ([m for _, _, m in prepared] + before if mode == "backfill"
              else before + [m for _, _, m in prepared])
    require(all(merged[i]["first_ms"] == merged[i-1]["first_ms"] + DAY
                for i in range(1, len(merged))),
            "Fine-history collected days not continuous")
    index = {"schema": SCHEMA, "source": "Binance Spot", "quote": QUOTE,
             "asset_id": ASSET, "pair": PAIR, "interval": "5m",
             "status": "VERIFIED_FULL_UTC_DAYS_NOT_LIVE",
             "max_status": "NOT_REACHED_OR_PROVEN", "blocks": merged,
             "first_ms": merged[0]["first_ms"], "last_ms": merged[-1]["last_ms"],
             "verified_blocks": len(merged), "verified_candles": len(merged)*COUNT}
    # All network calls are done and validated BEFORE any new archive is exposed.
    for name, raw, _ in prepared:
        dest = root / name
        if dest.exists():
            require(dest.read_bytes() == raw, "Immutable daily archive collision")
        else:
            atomic_write(dest, raw)
    atomic_write(root/"index.json", encoded(index))
    result = verify(root)
    result["new_blocks"] = len(prepared)
    result["new_candles"] = len(prepared)*COUNT
    return result


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--output-dir", type=Path, default=OUTPUT)
    p.add_argument("--days", type=int, default=30)
    p.add_argument("--mode", choices=("bootstrap", "append", "backfill"), default="bootstrap")
    flags = p.add_mutually_exclusive_group(required=True)
    flags.add_argument("--plan", action="store_true")
    flags.add_argument("--verify", action="store_true")
    flags.add_argument("--collect", action="store_true")
    p.add_argument("--enable-network", action="store_true")
    args = p.parse_args()
    if args.verify:
        result = verify(args.output_dir)
    elif args.plan:
        identity()
        windows = ranges(args.output_dir, args.mode, args.days, int(time.time()*1000))
        result = {"mode":"PLAN_OFFLINE", "days":len(windows),
                  "first_ms":windows[0][0] if windows else None,
                  "last_ms":windows[-1][1]-STEP if windows else None}
    else:
        require(args.enable_network, "Fine-history collection requires explicit --enable-network")
        result = collect(args.output_dir,args.mode,args.days,int(time.time()*1000))
    print(json.dumps(result,sort_keys=True,ensure_ascii=False))


if __name__ == "__main__":
    main()
