#!/usr/bin/env python3
"""Seven Heaven · append-only Binance Spot history for verified Universe assets.

Protects the original Universe index and all R2–R11 archives. New OHLCV is
written to an independently verified, content-addressed incremental ledger.
No cron, browser storage, trading keys, conversions, or unapproved instruments.
"""
from __future__ import annotations

import argparse
import gzip
import json
from pathlib import Path
import re
import time

from collect_historical_universe import (
    BLOCK_SCHEMA, OUTPUT, PERIODS, SCHEMA, atomic_write, digest, encoded,
    get_json, require, validate_index, validate_rows,
)

LEDGER_SCHEMA = "aerith.public.ohlcv.spot.universe.incremental.index.v1"
CHUNK_SCHEMA = "aerith.public.ohlcv.spot.universe.incremental.chunk.v1"
SOURCE = "Binance Spot"
MAX_ROWS_PER_SERIES = 288
MAX_ASSETS = 5
MAX_LEDGER_CHUNKS = 5000
MAX_GZIP = 2_000_000
NAME = re.compile(r"^blocks/([a-z0-9-]+)_(24h|7d|30d)_([0-9]{13})_([0-9]{13})_([a-f0-9]{16})\.json\.gz$")


def baseline(root: Path):
    """Baseline remains entirely immutable; only pre-qualified assets are used."""
    source = root / "index.json"
    raw = source.read_bytes()
    index = json.loads(raw)
    require(index.get("schema") == SCHEMA and index.get("quote") == "USDT"
            and index.get("publication") == "MANUAL_BOUNDED_PILOT_NOT_LIVE",
            "Unrecognized immutable Universe baseline")
    assets = {a["id"]: a for a in index["assets"]
              if a.get("qualification") == "qualified_spot"}
    require(len(assets) == MAX_ASSETS, "Expected five approved pilot assets")
    require(all(a.get("candidate_pair") == a["symbol"] + "USDT"
                and re.fullmatch("[A-Z0-9]{2,22}", a["symbol"])
                for a in assets.values()), "Unqualified baseline pair")
    require(len(index.get("blocks", [])) == MAX_ASSETS * len(PERIODS),
            "Incomplete original Universe archive")
    require(index.get("verified_series") == len(index["blocks"]), "Baseline count mismatch")
    # Validate all original compressed files before proceeding.
    verified = validate_index(root)
    require(verified["blocks"] == len(index["blocks"]), "Baseline verification failed")
    originals = {}
    for item in index["blocks"]:
        asset_id, period = item["asset_id"], item["period"]
        require(asset_id in assets and period in PERIODS and
                item["pair"] == assets[asset_id]["candidate_pair"]
                and item["interval"] == PERIODS[period][0]
                and item["candles"] == PERIODS[period][2],
                "Baseline identity/period mismatch")
        key = (asset_id, period)
        require(key not in originals, "Duplicate baseline series")
        originals[key] = item
    return index, digest(raw), assets, originals


def check_chunk(raw: bytes, meta: dict, period: str, expected_first: int):
    require(len(raw) <= MAX_GZIP and digest(raw) == meta["sha256"],
            "Incremental SHA-256 mismatch")
    record = json.loads(gzip.decompress(raw))
    step = PERIODS[period][1]
    rows = record.get("rows")
    require(record.get("schema") == CHUNK_SCHEMA and
            record.get("source") == SOURCE and record.get("quote") == "USDT"
            and record.get("asset_id") == meta["asset_id"] and
            record.get("pair") == meta["pair"] and
            record.get("period") == period and
            record.get("interval") == PERIODS[period][0] and
            record.get("first_ms") == meta["first_ms"] and
            record.get("last_ms") == meta["last_ms"] and
            record.get("first_ms") == expected_first and
            isinstance(rows, list) and
            0 < len(rows) <= MAX_ROWS_PER_SERIES and len(rows) == meta["candles"],
            "Incremental block mismatch")
    require(record["last_ms"] == record["first_ms"] + step * (len(rows) - 1),
            "Incremental block discontinuity")
    for i, row in enumerate(rows):
        require(isinstance(row, list) and len(row) == 8 and
                isinstance(row[0], int) and
                row[0] == expected_first + i * step and
                isinstance(row[7], int) and row[7] >= 0 and
                all(isinstance(v, (int, float)) and not isinstance(v, bool)
                    for v in row[1:7]), "Incremental candle format mismatch")
        import math
        _, opened, high, low, closed, vol, quote_vol, _ = row
        require(all(math.isfinite(x) for x in row[1:7]) and
                low > 0 and low <= min(opened, closed) <= max(opened, closed) <= high
                and vol >= 0 and quote_vol >= 0, "Incremental OHLCV invalid")


def inspect(root: Path):
    """Verify the full original archive and every incremental chain."""
    original, baseline_sha, assets, series = baseline(root)
    ledger_path = root / "incremental/index.json"
    default = {"schema": LEDGER_SCHEMA, "baseline_sha256": baseline_sha,
               "source": SOURCE, "quote": "USDT",
               "mode": "MANUAL_APPEND_ONLY_CLOSED_CANDLES",
               "chunks": []}
    if not ledger_path.exists():
        return default, assets, series, {key: b["last_ms"] for key, b in series.items()}
    ledger = json.loads(ledger_path.read_bytes())
    require(ledger.get("schema") == LEDGER_SCHEMA and
            ledger.get("baseline_sha256") == baseline_sha and
            ledger.get("source") == SOURCE and ledger.get("quote") == "USDT"
            and ledger.get("mode") == default["mode"], "Incremental ledger identity mismatch")
    chunks = ledger.get("chunks")
    require(isinstance(chunks, list) and len(chunks) <= MAX_LEDGER_CHUNKS,
            "Incremental ledger exceeds bounds")
    progress = {key: b["last_ms"] for key, b in series.items()}
    seen_names = set()
    for meta in chunks:
        require(isinstance(meta, dict) and
                isinstance(meta.get("file"), str) and
                isinstance(meta.get("sha256"), str) and
                re.fullmatch("[a-f0-9]{64}", meta["sha256"]),
                "Incremental block metadata missing")
        match = NAME.fullmatch(meta["file"])
        require(match and meta["file"] not in seen_names,
                "Unsafe/duplicate incremental block")
        seen_names.add(meta["file"])
        asset_id, period, start, end, prefix = match.groups()
        key = (asset_id, period)
        require(key in progress and meta["asset_id"] == asset_id
                and meta["period"] == period and meta["pair"] == assets[asset_id]["candidate_pair"]
                and meta["interval"] == PERIODS[period][0]
                and meta["sha256"].startswith(prefix)
                and meta["first_ms"] == int(start) and meta["last_ms"] == int(end)
                and isinstance(meta.get("candles"), int)
                and meta["candles"] >= 1, "Incremental index mismatch")
        first = progress[key] + PERIODS[period][1]
        raw = (root / "incremental" / meta["file"]).read_bytes()
        check_chunk(raw, meta, period, first)
        progress[key] = meta["last_ms"]
    return ledger, assets, series, progress


def readiness(root: Path, now_ms: int, max_rows: int):
    ledger, assets, original, progress = inspect(root)
    require(1 <= max_rows <= MAX_ROWS_PER_SERIES, "Invalid bounded batch size")
    windows = []
    for (asset_id, period), baseline_entry in sorted(original.items()):
        interval, step, _ = PERIODS[period]
        # A 90-second grace and floor exclude currently forming Binance candles.
        exclusive_end = ((now_ms - 90_000) // step) * step
        start = progress[(asset_id, period)] + step
        available = max(0, (exclusive_end - start) // step)
        count = min(available, max_rows)
        windows.append({"asset_id": asset_id, "pair": assets[asset_id]["candidate_pair"],
                        "period": period, "interval": interval, "step": step,
                        "first_ms": start, "end_exclusive_ms": start + count * step,
                        "available": available, "count": count})
    return ledger, windows


def ensure_instruments(windows):
    pairs = sorted(set(w["pair"] for w in windows if w["count"] > 0))
    if not pairs:
        return
    response = get_json("/api/v3/exchangeInfo", {"symbols": json.dumps(pairs, separators=(",", ":"))})
    found = {entry.get("symbol"): entry for entry in response.get("symbols", [])}
    for pair in pairs:
        entry = found.get(pair, {})
        require(entry.get("symbol") == pair and
                entry.get("baseAsset") == pair[:-4] and
                entry.get("quoteAsset") == "USDT" and
                entry.get("status") == "TRADING" and
                entry.get("isSpotTradingAllowed") is True and
                ("SPOT" in entry.get("permissions", []) or
                 any("SPOT" in group for group in entry.get("permissionSets", []))),
                "Exchange instrument no longer approved: " + pair)


def append(root: Path, now_ms: int, max_rows: int):
    ledger, windows = readiness(root, now_ms, max_rows)
    active = [w for w in windows if w["count"]]
    if not active:
        return {"result": "NOOP", "new_chunks": 0, "new_candles": 0,
                "note": "No new closed candle since previous snapshot"}
    require(len(ledger["chunks"]) + len(active) <= MAX_LEDGER_CHUNKS,
            "Incremental journal capacity reached")
    ensure_instruments(active)
    prepared = []
    # Prepare ALL rows first. If any pair or interval is missing: fail closed.
    for w in active:
        rows = get_json("/api/v3/klines",
                        {"symbol": w["pair"], "interval": w["interval"],
                         "startTime": w["first_ms"],
                         "endTime": w["end_exclusive_ms"] - 1, "limit": w["count"]})
        cleaned = validate_rows(rows, w["step"], w["count"], w["end_exclusive_ms"])
        block = {"schema": CHUNK_SCHEMA, "source": SOURCE, "quote": "USDT",
                 "asset_id": w["asset_id"], "pair": w["pair"], "period": w["period"],
                 "interval": w["interval"], "first_ms": cleaned[0][0],
                 "last_ms": cleaned[-1][0], "rows": cleaned}
        raw = gzip.compress(encoded(block), compresslevel=9, mtime=0)
        checksum = digest(raw)
        file = ("blocks/" + w["asset_id"] + "_" + w["period"] + "_" +
                str(block["first_ms"]) + "_" + str(block["last_ms"]) +
                "_" + checksum[:16] + ".json.gz")
        meta = {"file": file, "sha256": checksum, "asset_id": w["asset_id"],
                "pair": w["pair"], "period": w["period"], "interval": w["interval"],
                "first_ms": block["first_ms"], "last_ms": block["last_ms"],
                "candles": len(cleaned)}
        check_chunk(raw, meta, w["period"], w["first_ms"])
        prepared.append((file, raw, meta))
    # Content-addressed blocks are immutable. Index is published last.
    for file, raw, meta in prepared:
        dest = root / "incremental" / file
        if dest.exists():
            require(dest.read_bytes() == raw, "Immutable chunk collision")
        else:
            atomic_write(dest, raw)
    new_ledger = {**ledger, "chunks": [*ledger["chunks"], *(x[2] for x in prepared)]}
    atomic_write(root / "incremental/index.json", encoded(new_ledger))
    inspect(root)
    return {"result": "APPENDED", "new_chunks": len(prepared),
            "new_candles": sum(x[2]["candles"] for x in prepared),
            "remaining_eligible": sum(max(0, w["available"] - w["count"]) for w in windows)}


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--output-dir", type=Path, default=OUTPUT)
    ap.add_argument("--max-rows", type=int, default=MAX_ROWS_PER_SERIES)
    group = ap.add_mutually_exclusive_group(required=True)
    group.add_argument("--plan", action="store_true")
    group.add_argument("--verify", action="store_true")
    group.add_argument("--collect", action="store_true")
    ap.add_argument("--enable-network", action="store_true")
    args = ap.parse_args()
    require(1 <= args.max_rows <= MAX_ROWS_PER_SERIES, "Invalid bounded batch size")
    now_ms = int(time.time() * 1000)
    if args.verify:
        ledger, assets, original, progress = inspect(args.output_dir)
        result = {"mode": "VERIFY", "assets": len(assets),
                  "baseline_series": len(original), "incremental_chunks": len(ledger["chunks"]),
                  "incremental_candles": sum(x["candles"] for x in ledger["chunks"])}
    elif args.plan:
        ledger, windows = readiness(args.output_dir, now_ms, args.max_rows)
        result = {"mode": "PLAN_OFFLINE", "new_requests": sum(bool(w["count"]) for w in windows),
                  "new_candles_cap": sum(w["count"] for w in windows),
                  "remaining_eligible_after_batch": sum(max(0, w["available"]-w["count"]) for w in windows),
                  "existing_chunks": len(ledger["chunks"]),
                  "windows": [{k: w[k] for k in ("asset_id", "pair", "period", "first_ms", "end_exclusive_ms", "count")}
                              for w in windows]}
    else:
        require(args.enable_network, "--collect explicitly needs --enable-network")
        result = {"mode": "COLLECT", **append(args.output_dir, now_ms, args.max_rows)}
    print(json.dumps(result, sort_keys=True, ensure_ascii=False))


if __name__ == "__main__":
    main()
