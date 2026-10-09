#!/usr/bin/env python3
"""Append-only historical Top 50 cohort: 12 previously verified Spot assets.

The cohort's immutable snapshot, the five-asset Universe and R10/R11 remain
untouched. Reuse the proven Universe SHA-256, OHLCV, and instrument validators.
No trading, browser calls, cron, or network unless explicitly --collect.
"""
from __future__ import annotations

import argparse
import gzip
import json
from pathlib import Path
import re
import time

import collect_historical_cohort as cohort
import extend_historical_universe as engine
import historical_archive_partitions as partitions
from collect_historical_universe import (
    PERIODS, atomic_write, digest, encoded, require, validate_rows,
)

OUTPUT = cohort.OUTPUT
LEDGER_SCHEMA = "aerith.public.ohlcv.spot.cohort.incremental.index.v1"
MAX_ROWS = engine.MAX_ROWS_PER_SERIES
MAX_CHUNKS = engine.MAX_LEDGER_CHUNKS
MODE = "MANUAL_APPEND_ONLY_CLOSED_CANDLES"


def baseline(root: Path):
    """Return 12 approved source instruments after verifying all original gzip."""
    checked = cohort.verify(root)
    require(checked.get("mode") == "VERIFIED" and
            checked.get("new_assets") == 12 and
            checked.get("series") == 36, "Cohort not verified or no longer twelve assets")
    raw = (root / "index.json").read_bytes()
    index = json.loads(raw)
    approved = {a["id"]: a["pair"] for a in index["assets"]
                if a.get("status") == "archived_spot"}
    require(len(approved) == 12, "Unexpected cohort approvals")
    originals = {}
    for b in index["blocks"]:
        k = (b["asset_id"], b["period"])
        require(k not in originals and k[0] in approved and
                b["pair"] == approved[k[0]] and
                b["interval"] == PERIODS[k[1]][0] and
                b["candles"] == PERIODS[k[1]][2],
                "Original cohort series identity mismatch")
        originals[k] = b
    require(len(originals) == len(approved) * len(PERIODS),
            "Missing original cohort series")
    return digest(raw), approved, originals


def inspect(root: Path):
    source_sha, approved, originals = baseline(root)
    ledger_file = root / "incremental/index.json"
    empty = {"schema": LEDGER_SCHEMA, "baseline_sha256": source_sha,
             "source": "Binance Spot", "quote": "USDT",
             "mode": MODE, "chunks": []}
    ledger = json.loads(ledger_file.read_bytes()) if ledger_file.exists() else empty
    require(ledger.get("schema") == LEDGER_SCHEMA and
            ledger.get("baseline_sha256") == source_sha and
            ledger.get("source") == "Binance Spot" and
            ledger.get("quote") == "USDT" and
            ledger.get("mode") == MODE, "Cohort incremental identity mismatch")
    chunks = ledger.get("chunks")
    require(isinstance(chunks, list) and len(chunks) <= MAX_CHUNKS,
            "Cohort incremental journal exceeds capacity")
    last = {key: b["last_ms"] for key, b in originals.items()}
    names = set()
    for b in partitions.all_chunks(root / "incremental", ledger):
        require(isinstance(b, dict) and
                isinstance(b.get("file"), str) and
                engine.NAME.fullmatch(b["file"]) and
                b["file"] not in names and
                re.fullmatch("[a-f0-9]{64}", b.get("sha256", "")),
                "Cohort incremental file/metadata invalid")
        names.add(b["file"])
        name_id, name_period, name_start, name_end, prefix = engine.NAME.fullmatch(b["file"]).groups()
        key = (b.get("asset_id"), b.get("period"))
        require(key in last and name_id == key[0] and name_period == key[1] and
                b.get("pair") == approved[key[0]] and
                b.get("interval") == PERIODS[key[1]][0] and
                b.get("sha256", "").startswith(prefix) and
                b.get("first_ms") == int(name_start) and
                b.get("last_ms") == int(name_end) and
                type(b.get("candles")) is int and 0 < b["candles"] <= MAX_ROWS,
                "Cohort incremental metadata mismatch")
        raw = (root / "incremental" / b["file"]).read_bytes()
        engine.check_chunk(raw, b, key[1], last[key] + PERIODS[key[1]][1])
        last[key] = b["last_ms"]
    return ledger, approved, originals, last


def plan(root: Path, now_ms: int, max_rows: int):
    require(1 <= max_rows <= MAX_ROWS, "Invalid bounded batch size")
    ledger, approved, original, last = inspect(root)
    windows = []
    for (asset_id, period) in sorted(original):
        interval, step, _ = PERIODS[period]
        # Exclude currently forming candles with a fixed safety margin.
        end = ((now_ms - 90_000) // step) * step
        first = last[(asset_id, period)] + step
        available = max(0, (end - first) // step)
        count = min(available, max_rows)
        windows.append({"asset_id": asset_id, "period": period,
                        "pair": approved[asset_id], "interval": interval,
                        "step": step, "first_ms": first,
                        "end_exclusive_ms": first + count * step,
                        "available": available, "count": count})
    return ledger, windows


def collect(root: Path, now_ms: int, max_rows: int):
    ledger, windows = plan(root, now_ms, max_rows)
    active = [w for w in windows if w["count"]]
    if not active:
        return {"result": "NOOP", "new_chunks": 0, "new_candles": 0}
    require(len(ledger["chunks"]) + len(active) <= MAX_CHUNKS,
            "Cohort journal capacity reached")
    # The existing Universe guard checks base/quote/permissions for every pair.
    engine.ensure_instruments(active)
    prepared = []
    for w in active:
        rows = engine.get_json("/api/v3/klines", {
            "symbol": w["pair"], "interval": w["interval"],
            "startTime": w["first_ms"],
            "endTime": w["end_exclusive_ms"] - 1,
            "limit": w["count"]})
        checked = validate_rows(rows, w["step"], w["count"],
                                w["end_exclusive_ms"])
        block = {"schema": engine.CHUNK_SCHEMA,
                 "source": "Binance Spot", "quote": "USDT",
                 "asset_id": w["asset_id"], "pair": w["pair"],
                 "period": w["period"], "interval": w["interval"],
                 "first_ms": checked[0][0],
                 "last_ms": checked[-1][0], "rows": checked}
        payload = gzip.compress(encoded(block), compresslevel=9, mtime=0)
        sha = digest(payload)
        name = "blocks/" + w["asset_id"] + "_" + w["period"] + "_" + (
            str(block["first_ms"]) + "_" + str(block["last_ms"])
            + "_" + sha[:16] + ".json.gz")
        meta = {"file": name, "sha256": sha,
                "asset_id": w["asset_id"], "pair": w["pair"],
                "period": w["period"], "interval": w["interval"],
                "candles": len(checked), "first_ms": block["first_ms"],
                "last_ms": block["last_ms"]}
        engine.check_chunk(payload, meta, w["period"], w["first_ms"])
        prepared.append((name, payload, meta))
    # Prepare/validate ALL series before writing ANY index entry.
    # Blobs are content-addressed and immutable. Index is written last.
    for name, payload, meta in prepared:
        target = root / "incremental" / name
        if target.exists():
            require(target.read_bytes() == payload, "Immutable chunk collision")
        else:
            atomic_write(target, payload)
    new_index = {**ledger,
                 "chunks": [*ledger["chunks"], *(item[2] for item in prepared)]}
    new_index, sealed = partitions.rotate(root / "incremental", new_index)
    partitions.persist_partitions(root / "incremental", sealed, atomic_write)
    atomic_write(root / "incremental/index.json", encoded(new_index))
    inspect(root)
    return {"result": "APPENDED", "new_chunks": len(prepared),
            "new_candles": sum(item[2]["candles"] for item in prepared),
            "remaining_eligible": sum(max(0, w["available"]-w["count"])
                                      for w in windows)}


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--output-dir", type=Path, default=OUTPUT)
    cli.add_argument("--max-rows", type=int, default=MAX_ROWS)
    flags = cli.add_mutually_exclusive_group(required=True)
    flags.add_argument("--plan", action="store_true")
    flags.add_argument("--verify", action="store_true")
    flags.add_argument("--collect", action="store_true")
    cli.add_argument("--enable-network", action="store_true")
    args = cli.parse_args()
    require(1 <= args.max_rows <= MAX_ROWS, "Invalid bounded batch size")
    if args.verify:
        ledger, approved, originals, last = inspect(args.output_dir)
        outcome = {"mode": "VERIFY", "assets": len(approved),
                   "baseline_series": len(originals),
                   "incremental_chunks": len(ledger["chunks"]),
                   "incremental_candles": sum(x["candles"] for x in partitions.all_chunks(args.output_dir / "incremental", ledger)),
                   "sealed_partitions": len(ledger.get("partitions", []))}
    elif args.plan:
        ledger, windows = plan(args.output_dir, int(time.time()*1000), args.max_rows)
        outcome = {"mode": "PLAN_OFFLINE", "existing_chunks": len(ledger["chunks"]),
                   "requests": sum(bool(w["count"]) for w in windows),
                   "candles_cap": sum(w["count"] for w in windows),
                   "remaining_eligible": sum(max(0, w["available"]-w["count"])
                                             for w in windows)}
    else:
        require(args.enable_network, "--collect explicitly requires --enable-network")
        outcome = {"mode": "COLLECT",
                   **collect(args.output_dir, int(time.time()*1000), args.max_rows)}
    print(json.dumps(outcome, ensure_ascii=False, sort_keys=True))


if __name__ == "__main__":
    main()
