#!/usr/bin/env python3
"""Deterministic native-quote analysis of ALREADY archived public OKX hourly books.

Only source-backed observations. No price interpolation, paper fills, signal
selection, USD/USDC/USDT/EUR conversion or account access.
"""
from __future__ import annotations

import datetime as dt
import json
import os
import pathlib
import statistics
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / "data/crypto/okx-hourly"
SCHEMA = "erith.radar.okx-hourly-evidence.v1"
SOURCE = "erith.radar.okx-hourly-spot.v1"
UTC = dt.timezone.utc


def require(x, why):
    if not x:
        raise ValueError(why)


def decimal(value, positive=True):
    require(isinstance(value, str), "Decimal must retain the original string")
    try:
        d = Decimal(value)
    except InvalidOperation as exc:
        raise ValueError("Invalid decimal") from exc
    require(d.is_finite() and (d > 0 if positive else d >= 0) and
            d < Decimal("1e24"), "Out-of-range decimal")
    return d


def rounded(d, places=4):
    return str(d.quantize(Decimal(10) ** -places, rounding=ROUND_HALF_UP))


def parse_iso(stamp):
    require(isinstance(stamp, str) and stamp.endswith("Z"), "UTC timestamp required")
    t = dt.datetime.fromisoformat(stamp.replace("Z", "+00:00"))
    require(t.utcoffset() == dt.timedelta(0), "UTC timestamp required")
    return t


def sample(market, observation_time):
    if market.get("status") != "VERIFIED_PUBLIC_BOOK":
        return None
    pair, base, quote = market.get("pair"), market.get("base"), market.get("quote")
    require(base in ("BTC", "ETH", "SOL", "XRP", "OKB") and
            quote in ("USDC", "USDT", "EUR") and pair == base + "-" + quote,
            "Native Spot base/quote identity mismatch")
    book = market.get("book5")
    ticker = market.get("ticker")
    require(isinstance(book, dict) and isinstance(ticker, dict) and
            book.get("market_fill_proven") is False, "Public book contract invalid")
    bids, asks = book.get("bids"), book.get("asks")
    require(isinstance(bids, list) and isinstance(asks, list) and bids and asks,
            "Missing first-book quantities")
    require(all(isinstance(level, list) and len(level) == 2 for level in (bids[0], asks[0])),
            "Book levels invalid")
    bid, bqty, ask, aqty = (decimal(bids[0][0]), decimal(bids[0][1]),
                            decimal(asks[0][0]), decimal(asks[0][1]))
    require(bid < ask, "Crossed book")
    for x in (book["source_at_utc"], ticker["source_at_utc"]):
        at = parse_iso(x)
        require(abs((at - observation_time).total_seconds()) <= 180,
                "Book/ticker not contemporaneous with hourly observation")
    # A ticker can update between public API calls; do not require equal prices.
    spread_bps = (ask-bid) / ((ask+bid)/2) * 10000
    mid = (ask+bid)/2
    return {"pair": pair, "base": base, "quote": quote,
            "mid": mid, "spread": spread_bps,
            "bid_depth": bid*bqty, "ask_depth": ask*aqty,
            "book_at_utc": book["source_at_utc"]}


def build(hours, now):
    require(now.tzinfo is not None and now.utcoffset() == dt.timedelta(0),
            "Clock must be UTC")
    buckets = {}
    seen_hours = set()
    latest_hour = None
    for row in sorted(hours, key=lambda r: r.get("hour_utc", "")):
        require(row.get("schema") == SOURCE and row.get("orders_enabled") is False and
                row.get("real_orders") == 0 and row.get("paper_fills") == 0 and
                row.get("no_quote_conversion") is True and
                row.get("instrument_type") == "SPOT", "Incompatible hourly archive")
        at = parse_iso(row.get("observed_at_utc"))
        hour = at.strftime("%Y-%m-%dT%HZ")
        require(hour == row.get("hour_utc") and hour not in seen_hours and at <= now,
                "Hour is invalid, duplicated or from future")
        seen_hours.add(hour)
        if latest_hour is None or at > latest_hour:
            latest_hour = at
        require(isinstance(row.get("markets"), list), "Missing markets")
        seen_pairs = set()
        for market in row["markets"]:
            require(isinstance(market, dict) and isinstance(market.get("pair"), str),
                    "Invalid market entry")
            pair = market["pair"]
            require(pair not in seen_pairs, "Duplicate instrument in same hour")
            seen_pairs.add(pair)
            point = sample(market, at)
            if point is not None:
                buckets.setdefault(pair, []).append((at, point))
    require(seen_hours, "No genuine public hourly observations")
    # Window is anchored on last actual publication, never on an invented time.
    cutoff = latest_hour - dt.timedelta(hours=24)
    rows = []
    for pair, items in sorted(buckets.items()):
        items = sorted(((t, s) for t, s in items if t >= cutoff), key=lambda x: x[0])
        if not items:
            continue
        first, last = items[0][1], items[-1][1]
        spreads = [s["spread"] for _, s in items]
        count = len(items)
        mid_change = ((last["mid"]/first["mid"]-1)*100) if count >= 2 else None
        rows.append({
            "pair": pair, "quote": last["quote"],
            "book_samples": count,
            "first_source_utc": first["book_at_utc"],
            "last_source_utc": last["book_at_utc"],
            "latest_mid_native_quote": rounded(last["mid"], 8),
            "latest_spread_bps": rounded(last["spread"], 2),
            "median_spread_bps": rounded(statistics.median(spreads), 2),
            "max_spread_bps": rounded(max(spreads), 2),
            "best_bid_level_value_native_quote": rounded(last["bid_depth"], 4),
            "best_ask_level_value_native_quote": rounded(last["ask_depth"], 4),
            "observed_mid_change_pct": rounded(mid_change, 4) if mid_change is not None else None,
            "status": "DESCRIPTIVE_ONLY" if count >= 2 else "AWAITING_SECOND_HOUR",
            "trading_signal": False, "market_fill_proven": False,
        })
    require(rows, "No validated public book to analyse")
    return {
        "schema": SCHEMA,
        "kind": "public_observational_spreads_and_native_quote_prices",
        "as_of_utc": latest_hour.isoformat(timespec="seconds").replace("+00:00", "Z"),
        "observed_hours_total": len(seen_hours),
        "pairs_with_public_books": len(rows),
        "pairs_with_two_or_more_hours": sum(r["book_samples"] >= 2 for r in rows),
        "quotes_separate": ["USDC", "USDT", "EUR"],
        "no_interpolation": True, "no_quote_conversion": True,
        "strategy_certified": False, "trading_signals_issued": 0,
        "orders_enabled": False, "real_orders": 0, "paper_fills": 0,
        "note": "Spreads and visible book depth are snapshots, not realizable fills. "+
                "Mid-price changes compare native same-pair prices across observed hours only.",
        "pairs": rows,
    }


def read_archives(day):
    dates = [day - dt.timedelta(days=1), day]
    hours = []
    for d in dates:
        f = DATA / (d.isoformat() + ".json")
        if not f.exists():
            continue
        doc = json.loads(f.read_text(encoding="utf8"))
        require(doc.get("schema") == SOURCE and doc.get("date_utc") == d.isoformat()
                and isinstance(doc.get("hours"), list), "Invalid dated archive")
        hours.extend(doc["hours"])
    return hours


def main():
    latest = json.loads((DATA/"latest.json").read_text(encoding="utf8"))
    require(latest.get("schema") == "erith.radar.okx-hourly-health.v1" and
            latest.get("orders_enabled") is False and latest.get("real_orders") == 0,
            "Invalid collector status")
    day = dt.date.fromisoformat(latest["date_utc"])
    r = build(read_archives(day), dt.datetime.now(UTC))
    require(r["as_of_utc"].startswith(latest["date_utc"]) and
            r["as_of_utc"][:13] == latest["last_hour_utc"][:13],
            "Evidence cannot be based on older hour than collector status")
    destination = DATA/"research-latest.json"
    temp = destination.with_suffix(".writing")
    temp.write_text(json.dumps(r, ensure_ascii=False, indent=2, allow_nan=False) + "\n",
                    encoding="utf8")
    os.replace(temp, destination)
    print(json.dumps({"as_of_utc":r["as_of_utc"],
                      "pairs_with_public_books":r["pairs_with_public_books"],
                      "pairs_with_two_or_more_hours":r["pairs_with_two_or_more_hours"]}))


if __name__ == "__main__":
    main()
