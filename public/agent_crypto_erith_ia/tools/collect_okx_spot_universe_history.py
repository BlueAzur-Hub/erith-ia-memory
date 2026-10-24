#!/usr/bin/env python3
"""Bounded OKX EEA Spot historical candle coverage for pairs observed by the operator.

Extends the EXISTING Radar hourly workflow; each asset is archived at most once
per UTC date to limit GitHub growth. Only genuine exchange OHLCV in native USDC.
No account, private data, orders, fills, fiat conversions or invented backfill.
"""
from __future__ import annotations

import datetime as dt
import json
import os
import pathlib

import collect_irys_spot_history as verified

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "data/crypto/okx-hourly/spot-candles"
UTC = dt.timezone.utc

# Observed Spot USDC pairs in the operator's 2026-10-24 OKX rankings.
# IRYS is already collected separately by the same scheduled Radar job.
SYMBOLS = (
    "KAT", "CP", "DOS", "KMNO", "SAFE", "PROS", "WCT", "ZORA", "BARD",
    "ARKM", "BIGTIME", "AI", "BABY", "AVNT", "CVC", "AGLD", "ANIME",
    "CORE", "DATA", "SOPH", "AUCTION", "BREV", "BASED", "SAHARA"
)
SCHEMA = "erith.okx-native-spot-candles.v1"


def valid_archive(data, pair):
    return (isinstance(data, dict)
            and data.get("schema") == SCHEMA
            and data.get("venue") == "OKX_EEA"
            and data.get("instrument_type") == "SPOT"
            and data.get("pair") == pair
            and data.get("base") == pair.split("-")[0]
            and data.get("quote") == "USDC"
            and data.get("orders_enabled") is False
            and data.get("real_orders") == 0
            and data.get("no_quote_conversion") is True
            and set(data.get("candles", {})) == set(verified.BARS)
            and all(isinstance(data["candles"][b], list)
                    and len(data["candles"][b]) >= 2 for b in verified.BARS))


def target_path(symbol, root=OUT):
    verified.require(symbol in SYMBOLS, "Non-whitelisted market")
    return root / (symbol.lower() + "-usdc.json")


def collect_pair(symbol, fetch=verified.fetch_public, now=None):
    verified.require(symbol in SYMBOLS, "Symbol outside the verified operator universe")
    now = now or dt.datetime.now(UTC)
    verified.require(now.utcoffset() == dt.timedelta(0), "UTC required")
    pair = symbol + "-USDC"
    instruments = fetch("/api/v5/public/instruments",
                        {"instType": "SPOT", "instId": pair})
    verified.require(isinstance(instruments, list) and len(instruments) == 1,
                     "Exact Spot instrument missing")
    row = instruments[0]
    verified.require(row.get("instId") == pair
                     and row.get("instType") == "SPOT"
                     and row.get("baseCcy") == symbol
                     and row.get("quoteCcy") == "USDC"
                     and row.get("state") == "live",
                     "Instrument identity or listing not verified")
    candles = {}
    for bar, interval_ms in verified.BARS.items():
        rows = fetch("/api/v5/market/history-candles",
                     {"instId": pair, "bar": bar, "limit": "300"})
        candles[bar] = verified.normalize(rows, interval_ms, now)
    result = {
        "schema": SCHEMA,
        "record_kind": "confirmed_public_spot_ohlcv_not_fills",
        "venue": "OKX_EEA", "instrument_type": "SPOT", "pair": pair,
        "base": symbol, "quote": "USDC",
        "source": "https://eea.okx.com/api/v5/market/history-candles",
        "generated_at_utc": now.isoformat(timespec="seconds").replace("+00:00", "Z"),
        "bar_interval_ms": verified.BARS,
        "candles": candles, "no_quote_conversion": True,
        "orders_enabled": False, "real_orders": 0, "paper_fills": 0,
        "account_access": False
    }
    verified.require(valid_archive(result, pair), "Archive format invalid")
    return result


def write_atomic(dest, data):
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp = dest.with_suffix(".writing")
    try:
        # Compact JSON to prevent unnecessary growth of public Git history.
        tmp.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":"),
                                  allow_nan=False) + "\n", encoding="utf-8")
        os.replace(tmp, dest)
    finally:
        if tmp.exists():
            tmp.unlink()


def read_previous(path, pair):
    try:
        obj = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None
    return obj if valid_archive(obj, pair) else None


def update(fetch=verified.fetch_public, now=None, root=OUT):
    now = now or dt.datetime.now(UTC)
    verified.require(now.utcoffset() == dt.timedelta(0), "UTC required")
    day = now.date().isoformat()
    archived, failures, new_archives = [], [], []
    for symbol in SYMBOLS:
        pair = symbol + "-USDC"
        dest = target_path(symbol, root)
        older = read_previous(dest, pair)
        if older and str(older.get("generated_at_utc", "")).startswith(day):
            data = older
        else:
            try:
                data = collect_pair(symbol, fetch=fetch, now=now)
                write_atomic(dest, data)
                new_archives.append(pair)
            except (ValueError, TypeError, KeyError, OSError, TimeoutError) as err:
                data = older
                failures.append({"pair": pair, "reason": type(err).__name__})
        if data:
            archived.append({
                "pair": pair, "quote": "USDC",
                "source_date_utc": data["generated_at_utc"][:10],
                "bars": {bar: len(data["candles"][bar]) for bar in verified.BARS},
                "first_day_open_utc": data["candles"]["1Dutc"][0][0],
                "last_day_open_utc": data["candles"]["1Dutc"][-1][0]
            })
    # The manifest distinguishes fresh coverage, retained older evidence, and absence.
    manifest = {
        "schema": "erith.okx-spot-universe-coverage.v1",
        "source_date_utc": day,
        "requested_pairs": len(SYMBOLS),
        "covered_pairs": len(archived),
        "updated_pairs": sorted(new_archives),
        "archives": archived,
        "failed_this_attempt": failures,
        "native_quote": "USDC",
        "orders_enabled": False, "account_access": False
    }
    # Ignore updated_pairs in comparison: don't churn the manifest every hour.
    dest = root / "coverage.json"
    try:
        prior = json.loads(dest.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        prior = None
    if prior != manifest:
        write_atomic(dest, manifest)
    return manifest


def main():
    manifest = update()
    print(json.dumps({
        "requested": manifest["requested_pairs"],
        "covered": manifest["covered_pairs"],
        "updated": manifest["updated_pairs"],
        "failed": manifest["failed_this_attempt"],
        "orders": 0
    }))
    # Nonzero if ALL missing; the Radar job must not turn empty coverage into success.
    verified.require(manifest["covered_pairs"] > 0, "No verified Spot candle archives")


if __name__ == "__main__":
    main()
