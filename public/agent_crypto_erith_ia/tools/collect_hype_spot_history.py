#!/usr/bin/env python3
"""Archive genuine, closed OKX EEA HYPE-USDC Spot candles using the EXISTING hourly scheduler.

Native USDC prices are never relabelled USD/EUR; no account, Bridge or orders.
"""
from __future__ import annotations
import datetime as dt
import json
import os
import pathlib
import urllib.parse
import urllib.request
from decimal import Decimal, InvalidOperation

# Reuse the existing, unit-tested strict EEA public ticker and five-level
# order-book parser. Never read credentials, account endpoints or perpetuals.
import collect_okx_public_hourly as hourly

ROOT = pathlib.Path(__file__).resolve().parents[1]
DEST = ROOT / "data/crypto/okx-hourly/hype-spot-candles.json"
HOST = "eea.okx.com"
PAIR = "HYPE-USDC"
BARS = {"15m": 900000, "1H": 3600000, "1Dutc": 86400000}
UTC = dt.timezone.utc


def require(condition, reason):
    if not condition:
        raise ValueError(reason)


def numeric(value, allow_zero=False):
    require(isinstance(value, str) and 0 < len(value) < 64, "Invalid native numeric field")
    try:
        d = Decimal(value)
    except InvalidOperation as err:
        raise ValueError("Invalid native decimal") from err
    require(d.is_finite() and d < Decimal("1e24") and
            (d >= 0 if allow_zero else d > 0), "Nonpositive or nonfinite quote")
    return d


def fetch_public(route, params):
    allowed = {
        "/api/v5/public/instruments": {"instType", "instId"},
        "/api/v5/market/history-candles": {"instId", "bar", "limit", "after"},
    }
    require(route in allowed and params and set(params).issubset(allowed[route]),
            "Private or unexpected endpoint forbidden")
    require(all(isinstance(v, str) and v for v in params.values()), "Bad API parameter")
    url = "https://" + HOST + route + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"Accept": "application/json",
                                              "User-Agent": "ERITH-IA-Public-Candles/1.0"})
    with urllib.request.urlopen(req, timeout=15) as response:
        target = urllib.parse.urlsplit(response.url)
        require(response.status == 200 and target.scheme == "https" and
                target.hostname == HOST and target.path == route,
                "Redirect or unexpected HTTP response")
        raw = response.read(2000001)
        require(0 < len(raw) <= 2000000, "Missing or oversized market data")
    result = json.loads(raw)
    require(isinstance(result, dict) and result.get("code") == "0"
            and isinstance(result.get("data"), list), "Invalid OKX public reply")
    return result["data"]


def normalize(rows, interval_ms, now):
    require(isinstance(rows, list), "No candle rows")
    by_time = {}
    now_ms = int(now.timestamp() * 1000)
    for row in rows:
        require(isinstance(row, list) and len(row) >= 9, "Incomplete exchange candle")
        require(isinstance(row[0], str) and row[0].isdigit(), "Invalid candle timestamp")
        ts = int(row[0])
        if row[8] != "1":  # Never publish an unfinished interval.
            continue
        require(0 < ts and ts % interval_ms == 0 and ts + interval_ms <= now_ms,
                "Future or misaligned candle")
        op, high, low, close = (numeric(row[i]) for i in (1, 2, 3, 4))
        require(low <= min(op, close) <= max(op, close) <= high,
                "Invalid OHLC geometry")
        numeric(row[5], True)
        numeric(row[6], True)
        numeric(row[7], True)
        candle = [row[i] for i in range(8)]
        if ts in by_time:
            require(by_time[ts] == candle, "Conflicting duplicate candle")
        by_time[ts] = candle
    output = [by_time[k] for k in sorted(by_time)]
    require(len(output) >= 2, "Insufficient completed candles")
    return output


def collect(fetch=fetch_public, now=None, book_fetch=hourly.public_json):
    now = now or dt.datetime.now(UTC)
    require(now.utcoffset() == dt.timedelta(0), "UTC clock required")
    instruments = fetch("/api/v5/public/instruments",
                        {"instType": "SPOT", "instId": PAIR})
    require(len(instruments) == 1, "Exact HYPE-USDC Spot instrument unavailable")
    inst = instruments[0]
    require(inst.get("instId") == PAIR and inst.get("instType") == "SPOT"
            and inst.get("baseCcy") == "HYPE" and inst.get("quoteCcy") == "USDC"
            and inst.get("state") == "live", "HYPE-USDC identity or trading state mismatch")
    series = {}
    for bar, interval in BARS.items():
        raw = fetch("/api/v5/market/history-candles",
                    {"instId": PAIR, "bar": bar, "limit": "300"})
        series[bar] = normalize(raw, interval, now)
    # An instrument's existence does not imply its book is fresh or tradeable.
    # Missing/unavailable books never become simulated fills or synthetic quotes.
    captured = {"status": "UNAVAILABLE", "book5": None, "ticker": None,
                "reason": None, "at_utc": now.isoformat(timespec="seconds").replace("+00:00", "Z")}
    try:
        parsed_book = hourly.book(book_fetch, PAIR, now)
        parsed_ticker = hourly.ticker(book_fetch, PAIR, now)
        captured.update(status="VERIFIED_PUBLIC_BOOK", book5=parsed_book,
                        ticker=parsed_ticker)
    except (OSError, ValueError, KeyError, TypeError, TimeoutError) as exc:
        captured["reason"] = type(exc).__name__
    rules = {key: str(numeric(inst[key])) for key in ("minSz", "lotSz", "tickSz")}
    return {"schema": "erith.okx-native-spot-candles.v1",
            "record_kind": "confirmed_public_spot_ohlcv_not_fills",
            "venue": "OKX_EEA", "instrument_type": "SPOT",
            "pair": PAIR, "base": "HYPE", "quote": "USDC",
            "source": "https://eea.okx.com/api/v5/market/history-candles",
            "generated_at_utc": now.isoformat(timespec="seconds").replace("+00:00", "Z"),
            "bar_interval_ms": BARS, "candles": series, "public_instrument_rules": rules,
            "spot_book_observation": captured,
            "no_quote_conversion": True, "orders_enabled": False,
            "real_orders": 0, "paper_fills": 0, "account_access": False}


BOOK_DIR = ROOT / "data/crypto/okx-hourly/hype-spot-books"


def save_book_observation(data, folder=BOOK_DIR):
    """Append genuine snapshots once per UTC hour; never rewrite or backfill."""
    require(data.get("pair") == PAIR and data.get("quote") == "USDC"
            and data.get("orders_enabled") is False and data.get("real_orders") == 0
            and data.get("paper_fills") == 0, "Non-read-only HYPE record")
    when = data["generated_at_utc"]
    require(when.endswith("Z") and len(when) == 20 and
            data["spot_book_observation"]["at_utc"] == when, "Mismatched UTC snapshot")
    hour = when[:13] + "Z"
    folder.mkdir(parents=True, exist_ok=True)
    target = folder / (when[:10] + ".json")
    if target.exists():
        previous = json.loads(target.read_text(encoding="utf-8"))
        require(previous.get("schema") == "erith.okx-hype-public-book-daily.v1"
                and previous.get("date_utc") == when[:10]
                and previous.get("real_orders") == 0
                and isinstance(previous.get("observations"), list), "Corrupt prior HYPE book archive")
        items = previous["observations"]
    else:
        items = []
    require(len({x["hour_utc"] for x in items}) == len(items),
            "Duplicate preexisting hourly HYPE book")
    if any(x["hour_utc"] == hour for x in items):
        return {"changed": False, "reason": "IMMUTABLE_HOUR", "file": str(target)}
    require(len(items) < 24 and all(x["hour_utc"] < hour for x in items),
            "HYPE hourly book is out of order")
    snap = data["spot_book_observation"]
    if snap["status"] == "VERIFIED_PUBLIC_BOOK":
        require(snap["book5"] is not None and snap["ticker"] is not None,
                "Claimed HYPE book has no native source")
    else:
        require(snap["status"] == "UNAVAILABLE" and
                snap["book5"] is None and snap["ticker"] is None,
                "Incomplete HYPE market data labelled verified")
    items.append({"hour_utc": hour, "pair": PAIR, "base": "HYPE",
                  "quote": "USDC", "instrument_type": "SPOT",
                  "observed_at_utc": when, **snap, "market_fill_proven": False})
    obj = {"schema": "erith.okx-hype-public-book-daily.v1", "date_utc": when[:10],
           "pair": PAIR, "quote": "USDC", "source": "OKX_EEA_PUBLIC_REST",
           "orders_enabled": False, "real_orders": 0, "paper_fills": 0,
           "observations": items}
    temp = target.with_suffix(".writing")
    try:
        temp.write_text(json.dumps(obj, ensure_ascii=False, indent=2, allow_nan=False) + "\n",
                        encoding="utf-8")
        os.replace(temp, target)
    finally:
        if temp.exists():
            temp.unlink()
    return {"changed": True, "file": str(target), "hours": len(items)}


def save(data, dest=DEST):
    require(data.get("schema") == "erith.okx-native-spot-candles.v1"
            and data.get("pair") == PAIR and data.get("quote") == "USDC"
            and data.get("orders_enabled") is False and data.get("real_orders") == 0,
            "Invalid archive contract")
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp = dest.with_suffix(".writing")
    try:
        tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2,
                                  allow_nan=False) + "\n", encoding="utf-8")
        os.replace(tmp, dest)
    finally:
        if tmp.exists():
            tmp.unlink()
    return dest


def main():
    data = collect()
    # A dated public book must be preserved independently of rolling OHLCV.
    archive = save_book_observation(data)
    dest = save(data)
    print(json.dumps({"saved": str(dest), "book_archive": archive,
                      "book_status": data["spot_book_observation"]["status"],
                      "pair": data["pair"], "native_quote": data["quote"],
                      "confirmed_candles": {k: len(v) for k, v in data["candles"].items()},
                      "orders": 0}))


if __name__ == "__main__":
    main()
