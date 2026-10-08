#!/usr/bin/env python3
"""Seven Heaven R9: immutable compact OHLCV blocks for targeted read-only lookup.

This is a pilot SNAPSHOT of the exact verified R2+R4+R8 source state.
It never deletes/rewrites the original files and does not change the hourly R8 job.
Run from repository; import read-only validation primitives from the existing R4 collector.
"""
from __future__ import annotations

import argparse
import gzip
import hashlib
import json
from pathlib import Path

from append_historical_top10_ohlcv_r4 import (
    FOLDER, INDEX, MS, candle, check_prior_index, get_deltas,
    read_seed, sha, parse_key,
)

TARGET = FOLDER.parent / "compact_v1"
CATALOG = TARGET / "index.json"
SCHEMA = "aerith.public.ohlcv.spot.compact.index.v1"
BLOCK_SCHEMA = "aerith.public.ohlcv.spot.compact.series.v1"
COLUMNS = [
    "open_time_ms", "open", "high", "low", "close",
    "base_volume", "quote_volume", "trade_count",
]
MAX_SERIES = 21
MAX_SOURCE_DELTAS = 100  # Matches the existing bounded hourly R8 pilot


def ensure(test, message):
    if not test:
        raise ValueError(message)


def packed_json(obj):
    return (json.dumps(obj, ensure_ascii=False, allow_nan=False,
                       separators=(",", ":")) + "\n").encode("utf-8")


def unpack_gz(raw):
    return json.loads(gzip.decompress(raw))


def verified_source():
    """Replay existing data, verify physical SHA and index, return unchanged bars."""
    manifest, assets, state, seed = read_seed()
    entries = get_deltas(assets, state)
    ensure(INDEX.exists(), "R8 cumulative source index missing")
    source_bytes = INDEX.read_bytes()
    index = json.loads(source_bytes)
    check_prior_index(index, manifest, seed, entries, assets, state)
    ensure(len(entries) <= MAX_SOURCE_DELTAS, "Outside verified R8 pilot cap")
    ensure(index["series_count"] == MAX_SERIES, "Unexpected source series count")
    ensure(len(index["coverage"]) == MAX_SERIES, "Unexpected source coverage")

    raw_seed = unpack_gz((FOLDER / manifest["archive"]).read_bytes())
    ensure(raw_seed["quote_asset"] == "USDT" and
           raw_seed["kind"] == "REAL_BINANCE_SPOT_OHLCV_NO_SYNTHETIC_BARS",
           "Unexpected seed type")
    series = {
        parse_key(aid, period): list(raw_seed["assets"][aid]["periods"][period]["rows"])
        for aid in sorted(assets) for period in MS
    }
    for entry in entries:
        file = FOLDER / entry["file"]
        raw = file.read_bytes()
        ensure(len(raw) == entry["bytes"] and sha(raw) == entry["sha256"],
               "Delta physical digest disagrees: " + entry["file"])
        delta = unpack_gz(raw)
        ensure(delta["basket_reference"] == manifest["reference"] and
               delta["quote_asset"] == "USDT", "Unexpected delta provenance")
        for update in delta["updates"]:
            key = parse_key(update["id"], update["period"])
            ensure(key in series and assets[update["id"]]["pair"] == update["pair"],
                   "Unknown delta pair")
            series[key].extend(update["rows"])

    coverage = {parse_key(row["id"], row["period"]): row
                for row in index["coverage"]}
    ensure(len(coverage) == MAX_SERIES and len(series) == MAX_SERIES,
           "Series keys do not match")
    total = 0
    for key, rows in series.items():
        item = coverage.get(key)
        ensure(item is not None and len(rows) == item["candles"],
               "Series coverage/count mismatch: " + key)
        step = MS[item["period"]][0]
        previous = None
        for bar in rows:
            current = candle(bar, step)
            ensure(previous is None or current == previous + step,
                   "Duplicate/gap in source: " + key)
            previous = current
        ensure(rows[0][0] == item["first_open_ms"] and
               rows[-1][0] == item["last_open_ms"],
               "Series boundary mismatch: " + key)
        total += len(rows)
    ensure(total == index["candles_total"], "Source total mismatch")
    return index, sha(source_bytes), manifest, series


def block_for(coverage, rows):
    # New structure preserves EVERY numeric OHLCV datum in the source arrays.
    return {
        "schema": BLOCK_SCHEMA,
        "source": "Binance Spot",
        "quote_asset": "USDT",
        "id": coverage["id"],
        "pair": coverage["pair"],
        "period": coverage["period"],
        "interval": coverage["interval"],
        "columns": COLUMNS,
        "first_open_ms": coverage["first_open_ms"],
        "last_open_ms": coverage["last_open_ms"],
        "candles": coverage["candles"],
        "rows": rows,
    }


def build():
    source, source_sha, manifest, series = verified_source()
    prepared = []
    for item in source["coverage"]:
        rows = series[parse_key(item["id"], item["period"])]
        obj = block_for(item, rows)
        raw = packed_json(obj)
        zipped = gzip.compress(raw, compresslevel=9, mtime=0)
        ensure(unpack_gz(zipped) == obj, "Block gzip roundtrip mismatch")
        digest = sha(zipped)
        # Immutable filename: different content = different file, never overwrite.
        path = f"series/{item['id']}_{item['period']}_{digest[:16]}.json.gz"
        prepared.append((
            path, zipped,
            {
                "id": item["id"], "pair": item["pair"],
                "period": item["period"], "interval": item["interval"],
                "first_open_ms": item["first_open_ms"],
                "last_open_ms": item["last_open_ms"],
                "candles": item["candles"],
                "file": path, "bytes": len(zipped), "sha256": digest,
            }
        ))
    catalog = {
        "schema": SCHEMA,
        "status": "PILOT_SNAPSHOT_READ_ONLY",
        "source": "Binance Spot",
        "quote_asset": "USDT",
        "basket_reference": manifest["reference"],
        "source_index_file": "ohlcv_spot_pilot/index.json",
        "source_index_sha256": source_sha,
        "source_index_updated_at": source["updated_at"],
        "series_count": len(prepared),
        "candles_total": source["candles_total"],
        "source_delta_count": len(source["deltas"]),
        "source_seed": source["seed"],
        "series": [row[2] for row in prepared],
        "read_contract": "Fetch index and requested series block only; never infer live status",
    }
    ensure(catalog["series_count"] == MAX_SERIES, "Wrong block count")
    ensure(sum(v["candles"] for v in catalog["series"]) ==
           catalog["candles_total"], "Wrong cumulative total")
    for path, data, _ in prepared:
        target = TARGET / path
        if target.exists():
            ensure(target.read_bytes() == data,
                   "Existing immutable block content conflict: " + path)
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
    catalog_bytes = (json.dumps(catalog, ensure_ascii=False,
                                indent=2, allow_nan=False) + "\n").encode("utf-8")
    if CATALOG.exists() and CATALOG.read_bytes() == catalog_bytes:
        status = "NOOP"
    else:
        CATALOG.parent.mkdir(parents=True, exist_ok=True)
        CATALOG.write_bytes(catalog_bytes)
        status = "BUILT"
    verify()
    print(json.dumps({
        "status": status, "series": catalog["series_count"],
        "candles": catalog["candles_total"],
        "gzip_bytes": sum(len(zipped) for _, zipped, _ in prepared),
        "originals_untouched": True, "source_sha256": source_sha,
    }))


def verify():
    source, source_sha, manifest, series = verified_source()
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    ensure(catalog["schema"] == SCHEMA and
           catalog["source"] == "Binance Spot" and
           catalog["quote_asset"] == "USDT" and
           catalog["basket_reference"] == manifest["reference"],
           "Compact index provenance mismatch")
    ensure(catalog["source_index_sha256"] == source_sha,
           "Compact snapshot source index differs: rebuild explicitly")
    ensure(catalog["source_seed"] == source["seed"] and
           catalog["source_delta_count"] == len(source["deltas"]) and
           catalog["source_index_updated_at"] == source["updated_at"],
           "Compact index is not the exact source snapshot")
    ensure(catalog["series_count"] == MAX_SERIES and
           len(catalog["series"]) == MAX_SERIES and
           catalog["candles_total"] == source["candles_total"],
           "Compact summary differs from R8")
    coverage = {parse_key(item["id"], item["period"]): item
                for item in source["coverage"]}
    seen = set()
    total = 0
    for item in catalog["series"]:
        key = parse_key(item["id"], item["period"])
        ensure(key not in seen and key in coverage,
               "Duplicate/unqualified compact series")
        seen.add(key)
        ensure(item["file"].startswith("series/") and
               item["file"].endswith("_" + item["sha256"][:16] + ".json.gz"),
               "Unsafe compact filename")
        path = TARGET / item["file"]
        raw = path.read_bytes()
        ensure(len(raw) == item["bytes"] and sha(raw) == item["sha256"],
               "Compact block SHA/size mismatch: " + key)
        block = unpack_gz(raw)
        source_item = coverage[key]
        for field in ("id", "pair", "period", "interval",
                      "first_open_ms", "last_open_ms", "candles"):
            ensure(item[field] == source_item[field] and
                   block[field] == item[field],
                   "Compact coverage mismatch: " + key + "/" + field)
        ensure(block["schema"] == BLOCK_SCHEMA and
               block["source"] == "Binance Spot" and
               block["quote_asset"] == "USDT" and
               block["columns"] == COLUMNS, "Compact block schema invalid")
        # Exact array equality also tests all OHLCV values, not just timestamps.
        ensure(block["rows"] == series[key],
               "Compact block data differs from original: " + key)
        total += item["candles"]
    ensure(len(seen) == MAX_SERIES and total == source["candles_total"],
           "Compact verification is incomplete")
    print(json.dumps({"status": "VERIFIED_EQUIVALENT",
                      "series": len(seen), "candles": total,
                      "source_index_sha256": source_sha,
                      "originals_untouched": True}))


def self_test():
    sample = {
        "id": "bitcoin", "pair": "BTCUSDT",
        "period": "24h", "interval": "5m",
        "first_open_ms": 0, "last_open_ms": 300000, "candles": 2,
    }
    rows = [[0, 10., 11., 9., 10., 1., 10., 3],
            [300000, 10., 12., 9., 11., 2., 22., 5]]
    expected = block_for(sample, rows)
    x = gzip.compress(packed_json(expected), mtime=0)
    y = gzip.compress(packed_json(expected), mtime=0)
    ensure(x == y and unpack_gz(x) == expected, "Non-deterministic gzip")
    ensure(sha(x) == hashlib.sha256(x).hexdigest(), "Digest mismatch")
    ensure(expected["rows"] is rows, "Unexpected numeric conversion")
    print("SELF_TEST_PASS: deterministic gzip, numeric preservation, SHA, non-network fixture")


if __name__ == "__main__":
    args = argparse.ArgumentParser(description=__doc__)
    group = args.add_mutually_exclusive_group(required=True)
    group.add_argument("--build", action="store_true")
    group.add_argument("--verify", action="store_true")
    group.add_argument("--self-test", action="store_true")
    choice = args.parse_args()
    if choice.self_test:
        self_test()
    elif choice.build:
        build()
    else:
        verify()
