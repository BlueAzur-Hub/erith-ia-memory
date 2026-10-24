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
# Additional real OKX/USDC Spot listings shown in "Nouvelles offres" on 2026-10-24.
# CP-USDC already belongs to SYMBOLS above. CT may also be monitored elsewhere,
# but its dedicated 15m/1H/1Dutc history was not covered here.
NEW_OFFERS = (
    "XWDC", "XNFLX", "LIT", "CT", "XDP", "CARDS", "EURC", "XAMZN",
    "XAAPL", "XMETA", "XHOOD", "XGOOGL", "XNVDA", "XTSLA",
    "XSPCX", "XSOXL", "XSKHY", "XQQQ", "XNBIS", "XMU",
    "XMSTR", "XMRVL", "XLITE", "XINTC"
)
# Latest additional Top hausse members observed, not falsely tagged as new listings.
TOP_GAINERS_ADDITIONAL = ("BOME", "OL", "GOAT")
SYMBOLS = SYMBOLS + NEW_OFFERS + TOP_GAINERS_ADDITIONAL
SCHEMA = "erith.okx-native-spot-candles.v1"
FEED = ROOT / "administrator/data/new-listings-public-feed.json"
# Max calls per first backfill: 5*15m + 9*1H + 3*1Dutc, plus
# a single public SPOT instrument identity check. Subsequent daily runs
# normally need only one fresh page per period.
PAGE_CAPS = {"15m": 5, "1H": 9, "1Dutc": 3}
TARGET_DAYS = {"15m": 14, "1H": 100, "1Dutc": 730}
# Bounded physical storage while retaining at least 30d/1y history.
MAX_SAVED_ROWS = {"15m": 2880, "1H": 8760, "1Dutc": 3650}
MAX_FEED_EXTRAS = 12


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


def observed_symbols(feed_path=FEED):
    """Discover only exact, already-catalogued OKX Spot USDC pairs (never by ticker guess)."""
    try:
        feed = json.loads(pathlib.Path(feed_path).read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return ()
    if not isinstance(feed, dict) or feed.get("read_only") is not True:
        return ()
    rows = feed.get("entries")
    if not isinstance(rows, list):
        return ()
    extras = []
    for row in rows:
        if not isinstance(row, dict):
            continue
        base = str(row.get("base") or "")
        pair = base + "-USDC"
        if (row.get("provider") != "okx" or row.get("instrument_type") != "SPOT"
                or row.get("quote") != "USDC" or row.get("state") != "live"
                or row.get("providerSymbol") != pair
                or not (2 <= len(base) <= 15 and base.isascii() and base.isalnum()
                        and base.upper() == base) or base in SYMBOLS or base in extras):
            continue
        extras.append(base)
        if len(extras) >= MAX_FEED_EXTRAS:
            break
    return tuple(extras)


def target_path(symbol, root=OUT, allowed_symbols=SYMBOLS):
    verified.require(symbol in allowed_symbols, "Non-whitelisted market")
    return root / (symbol.lower() + "-usdc.json")


def collect_pair(symbol, fetch=verified.fetch_public, now=None, previous=None,
                 allowed_symbols=SYMBOLS):
    verified.require(symbol in allowed_symbols, "Symbol outside the verified operator universe")
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
    previous = previous if valid_archive(previous, pair) else None
    candles = {}
    cutoff_now_ms = int(now.timestamp() * 1000)
    for bar, interval_ms in verified.BARS.items():
        # Retain verified older OHLCV instead of overwriting it each UTC day.
        by_time = {int(row[0]): list(row) for row in
                   (previous["candles"][bar] if previous else [])}
        oldest_cursor = None
        target_ms = cutoff_now_ms - TARGET_DAYS[bar] * 86400000
        for _ in range(PAGE_CAPS[bar]):
            params = {"instId": pair, "bar": bar, "limit": "300"}
            if oldest_cursor is not None:
                params["after"] = str(oldest_cursor)
            raw = fetch("/api/v5/market/history-candles", params)
            if not raw:
                break
            confirmed = verified.normalize(raw, interval_ms, now)
            # New native observations override any earlier version of the same
            # confirmed bar. Never insert synthetic timestamps or values.
            for point in confirmed:
                by_time[int(point[0])] = point
            next_cursor = min(int(point[0]) for point in raw)
            if oldest_cursor is not None:
                verified.require(next_cursor < oldest_cursor,
                                 "Historical pagination made no backward progress")
            if min(by_time) <= target_ms or len(raw) < 300:
                break
            oldest_cursor = next_cursor
        rows = [by_time[k] for k in sorted(by_time)]
        candles[bar] = rows[-MAX_SAVED_ROWS[bar]:]
        verified.require(len(candles[bar]) >= 2, "Insufficient authentic OHLCV")
    result = {
        "schema": SCHEMA,
        "record_kind": "confirmed_public_spot_ohlcv_not_fills",
        "venue": "OKX_EEA", "instrument_type": "SPOT", "pair": pair,
        "base": symbol, "quote": "USDC",
        "source": "https://eea.okx.com/api/v5/market/history-candles",
        "generated_at_utc": now.isoformat(timespec="seconds").replace("+00:00", "Z"),
        "bar_interval_ms": verified.BARS,
        "history_collection_mode": "paged_bounded",
        "listing_group": ("okx_new_offers_2026-10-24"
                          if symbol in NEW_OFFERS else "okx_top_gainers_2026-10-24"
                          if symbol in SYMBOLS else "public_listings_feed"),
        "instrument_group": ("x_prefixed_instrument" if symbol.startswith("X")
                             else "stablecoin_pair" if symbol == "EURC"
                             else "crypto_spot_pair"),
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


def update(fetch=verified.fetch_public, now=None, root=OUT, feed_path=FEED):
    now = now or dt.datetime.now(UTC)
    verified.require(now.utcoffset() == dt.timedelta(0), "UTC required")
    day = now.date().isoformat()
    selected = SYMBOLS + observed_symbols(feed_path)
    archived, failures, new_archives = [], [], []
    for symbol in selected:
        pair = symbol + "-USDC"
        dest = target_path(symbol, root, selected)
        older = read_previous(dest, pair)
        if (older and str(older.get("generated_at_utc", "")).startswith(day)
                and older.get("history_collection_mode") == "paged_bounded"):
            data = older
        else:
            try:
                data = collect_pair(symbol, fetch=fetch, now=now,
                                    previous=older, allowed_symbols=selected)
                write_atomic(dest, data)
                new_archives.append(pair)
            except (ValueError, TypeError, KeyError, OSError, TimeoutError) as err:
                data = older
                failures.append({"pair": pair, "reason": type(err).__name__})
        if data:
            archived.append({
                "pair": pair, "quote": "USDC",
                "instrument_group": data.get("instrument_group", "unclassified_old_archive"),
                "source_date_utc": data["generated_at_utc"][:10],
                "bars": {bar: len(data["candles"][bar]) for bar in verified.BARS},
                "first_day_open_utc": data["candles"]["1Dutc"][0][0],
                "last_day_open_utc": data["candles"]["1Dutc"][-1][0]
            })
    manifest = {
        "schema": "erith.okx-spot-universe-coverage.v1",
        "source_date_utc": day,
        "requested_pairs": len(selected),
        "covered_pairs": len(archived),
        "archives": archived,
        "failed_this_attempt": failures,
        "native_quote": "USDC",
        "orders_enabled": False, "account_access": False
    }
    dest = root / "coverage.json"
    try:
        prior = json.loads(dest.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        prior = None
    if prior != manifest:
        write_atomic(dest, manifest)
    return {**manifest, "updated_pairs": sorted(new_archives)}


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
