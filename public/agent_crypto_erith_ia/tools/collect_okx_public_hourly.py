#!/usr/bin/env python3
"""Hourly public OKX EEA Spot snapshots: no account, order, WebSocket or Bridge.

One dated observation/UTC hour, independent of Firefox. Quotes are NOT fungible:
USDC, USDT and EUR instruments are recorded separately. Never synthesise fills.
"""
from __future__ import annotations

import datetime as dt
import json
import os
import pathlib
import re
import sys
import urllib.parse
import urllib.request
from decimal import Decimal, InvalidOperation

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "data/crypto/okx-hourly"
HOST = "https://eea.okx.com"
ASSETS = ("BTC", "ETH", "SOL", "XRP", "OKB")
QUOTES = ("USDC", "USDT", "EUR")
MAX_PAIRS = len(ASSETS) * len(QUOTES)
ROUTES = {
    "/api/v5/public/instruments": {"instType"},
    "/api/v5/market/ticker": {"instId"},
    "/api/v5/market/books": {"instId", "sz"},
    "/api/v5/market/candles": {"instId", "bar", "limit"},
    "/api/v5/market/trades": {"instId", "limit"},
}
SCHEMA = "erith.radar.okx-hourly-spot.v1"
UTC = dt.timezone.utc


def require(value, message):
    if not value:
        raise ValueError(message)


def iso(time):
    return time.astimezone(UTC).isoformat(timespec="seconds").replace("+00:00", "Z")


def number(raw, allow_zero=False):
    require(isinstance(raw, str) and 0 < len(raw) < 60, "Invalid decimal")
    try:
        value = Decimal(raw)
    except InvalidOperation as err:
        raise ValueError("Invalid decimal") from err
    require(value.is_finite() and (value >= 0 if allow_zero else value > 0)
            and value < Decimal("1e24"), "Nonpositive or nonfinite decimal")
    return raw


def millis(raw, now, max_age_ms=180000):
    require(isinstance(raw, str) and re.fullmatch(r"\d{13}", raw), "Bad exchange timestamp")
    n = int(raw)
    current = int(now.timestamp() * 1000)
    require(0 <= current - n <= max_age_ms or 0 <= n - current <= 30000,
            "Exchange event is stale or future")
    return iso(dt.datetime.fromtimestamp(n / 1000, tz=UTC))


def public_json(url):
    u = urllib.parse.urlsplit(url)
    require(u.scheme == "https" and u.hostname == "eea.okx.com" and
            u.port is None and u.username is None and u.password is None and
            u.path in ROUTES, "Not an allowlisted public EEA endpoint")
    q = urllib.parse.parse_qs(u.query, keep_blank_values=True)
    require(set(q).issubset(ROUTES[u.path]) and all(len(v) == 1 for v in q.values()),
            "Unexpected API query parameter")
    request = urllib.request.Request(url, headers={
        "Accept": "application/json",
        "User-Agent": "ERITH-IA-Public-Radar/1.0",
    })
    # urllib follows redirects by default. Reject any redirect to a different host.
    with urllib.request.urlopen(request, timeout=12) as response:
        final = urllib.parse.urlsplit(response.url)
        require(final.scheme == "https" and final.hostname == "eea.okx.com",
                "API redirected outside EEA domain")
        raw = response.read(4_000_001)
        require(response.status == 200 and 0 < len(raw) <= 4_000_000,
                "Empty/oversized API response")
        return json.loads(raw)


def api(fetch, path, **params):
    require(path in ROUTES and set(params).issubset(ROUTES[path]), "Forbidden endpoint")
    url = HOST + path + "?" + urllib.parse.urlencode(params)
    reply = fetch(url)
    require(isinstance(reply, dict) and reply.get("code") == "0" and
            isinstance(reply.get("data"), list), "Invalid OKX public response")
    return reply["data"]


def instruments(fetch):
    raw = api(fetch, "/api/v5/public/instruments", instType="SPOT")
    eligible = {}
    for row in raw:
        if not isinstance(row, dict):
            continue
        base, quote, pair = row.get("baseCcy"), row.get("quoteCcy"), row.get("instId")
        if (row.get("instType") != "SPOT" or row.get("state") != "live" or
                base not in ASSETS or quote not in QUOTES or pair != base + "-" + quote):
            continue
        require(pair not in eligible, "Duplicate OKX Spot listing")
        try:
            rules = {k: number(row[k]) for k in ("minSz", "lotSz", "tickSz")}
        except (KeyError, ValueError):
            continue
        eligible[pair] = {"pair": pair, "base": base, "quote": quote,
                          "rules": rules}
    require(len(eligible) <= MAX_PAIRS, "Unexpected Spot pair count")
    return [eligible[a + "-" + q] for a in ASSETS for q in QUOTES
            if a + "-" + q in eligible]


def book(fetch, pair, now):
    rows = api(fetch, "/api/v5/market/books", instId=pair, sz=5)
    require(len(rows) == 1 and isinstance(rows[0], dict), "Missing best-book")
    row = rows[0]
    observed = millis(row.get("ts"), now)
    def side(name, descending):
        raw = row.get(name)
        require(isinstance(raw, list) and 1 <= len(raw) <= 5, "Book side missing")
        levels = [[number(entry[0]), number(entry[1])] for entry in raw
                  if isinstance(entry, list) and len(entry) >= 2]
        require(len(levels) == len(raw), "Invalid book level")
        values = [Decimal(x[0]) for x in levels]
        require(all((a > b if descending else a < b) for a, b in
                    zip(values, values[1:])), "Unsorted book")
        return levels
    bids, asks = side("bids", True), side("asks", False)
    bid, ask = Decimal(bids[0][0]), Decimal(asks[0][0])
    require(bid < ask, "Crossed or locked book")
    return {"source_at_utc": observed, "bids": bids, "asks": asks,
            "spread_bps": str(((ask - bid) / ((ask + bid) / 2) * 10000).quantize(
                Decimal("0.01"))),
            "market_fill_proven": False}


def ticker(fetch, pair, now):
    rows = api(fetch, "/api/v5/market/ticker", instId=pair)
    require(len(rows) == 1 and rows[0].get("instId") == pair, "Ticker mismatch")
    row = rows[0]
    return {"source_at_utc": millis(row.get("ts"), now),
            "last": number(row.get("last")),
            "bid": number(row.get("bidPx")),
            "ask": number(row.get("askPx")),
            "volume24h_base": number(row.get("vol24h"), True),
            "volume24h_quote": number(row.get("volCcy24h"), True)}


def candles(fetch, pair, now):
    raw = api(fetch, "/api/v5/market/candles", instId=pair, bar="1m", limit=4)
    completed = []
    for row in raw:
        if not isinstance(row, list) or len(row) < 9 or row[8] != "1":
            continue
        try:
            stamp = millis(row[0], now, max_age_ms=24 * 3600000)
            o, h, low, close, volume = (number(row[i]) for i in (1, 2, 3, 4, 5))
            require(Decimal(low) <= min(Decimal(o), Decimal(close)) and
                    Decimal(h) >= max(Decimal(o), Decimal(close)),
                    "Bad OHLC")
            completed.append({"time_utc": stamp, "open": o, "high": h,
                              "low": low, "close": close, "volume_base": volume})
        except ValueError:
            continue
    require(completed, "No completed 1m candle")
    return max(completed, key=lambda r: r["time_utc"])


def trades(fetch, pair, now):
    raw = api(fetch, "/api/v5/market/trades", instId=pair, limit=5)
    result = []
    for row in raw:
        if not isinstance(row, dict) or row.get("instId") != pair or
                row.get("side") not in ("buy", "sell"):
            continue
        try:
            result.append({"time_utc": millis(row["ts"], now, 24 * 3600000),
                           "side": row["side"], "price": number(row["px"]),
                           "quantity_base": number(row["sz"])})
        except (KeyError, ValueError):
            continue
    require(result, "No recent public trade")
    return result


def collect(fetch=public_json, now=None):
    now = now or dt.datetime.now(UTC)
    require(now.utcoffset() == dt.timedelta(0), "UTC collector required")
    pairs = instruments(fetch)
    require(pairs, "No validated Spot markets returned by EEA instruments API")
    markets = []
    for spec in pairs:
        pair = spec["pair"]
        entry = {**spec, "status": "UNAVAILABLE", "ticker": None,
                 "book5": None, "last_closed_1m": None, "recent_trades": None,
                 "missing": []}
        for key, fn in (("ticker", ticker), ("book5", book)):
            try:
                entry[key] = fn(fetch, pair, now)
            except (ValueError, KeyError, TypeError, OSError, TimeoutError) as err:
                entry["missing"].append(key + ":" + type(err).__name__)
        # The main USDC instrument is preferred for supplementary 1m/trades.
        # If it is not listed, fall back to USDT; never convert between quotes.
        wanted = next((q for q in ("USDC", "USDT", "EUR")
                       if any(x["base"] == spec["base"] and x["quote"] == q for x in pairs)), None)
        if spec["quote"] == wanted:
            for key, fn in (("last_closed_1m", candles), ("recent_trades", trades)):
                try:
                    entry[key] = fn(fetch, pair, now)
                except (ValueError, KeyError, TypeError, OSError, TimeoutError) as err:
                    entry["missing"].append(key + ":" + type(err).__name__)
        entry["status"] = ("VERIFIED_PUBLIC_BOOK" if entry["book5"] and entry["ticker"]
                           else "PARTIAL_PUBLIC_DATA" if entry["book5"] or entry["ticker"]
                           else "UNAVAILABLE")
        markets.append(entry)
    observed = sum(m["status"] == "VERIFIED_PUBLIC_BOOK" for m in markets)
    require(observed >= 1, "No pair had both a dated public ticker and book: refuse empty archive")
    return {"schema": SCHEMA, "record_kind": "public_hourly_market_observation_not_trades",
            "source": "OKX_EEA_PUBLIC_REST", "observed_at_utc": iso(now),
            "hour_utc": now.strftime("%Y-%m-%dT%HZ"),
            "instrument_type": "SPOT", "quote_currencies": list(QUOTES),
            "markets_expected": len(pairs), "markets_verified": observed,
            "status": "READY" if observed == len(pairs) else "PARTIAL",
            "markets": markets, "no_quote_conversion": True,
            "no_coin_contract_identity_inferred": True,
            "prices_not_trade_executions": True,
            "real_orders": 0, "paper_fills": 0, "orders_enabled": False,
            "account_access": False,
            "note": "Public snapshots; Spot listed pair != verified CoinGecko token contract. No guaranteed fill."}


def save(record, root=OUT):
    require(record.get("schema") == SCHEMA and record.get("orders_enabled") is False
            and record.get("real_orders") == 0 and record.get("paper_fills") == 0,
            "Refuse executable or malformed observation")
    hour = record["hour_utc"]
    require(re.fullmatch(r"\d{4}-\d\d-\d\dT\d\dZ", hour) and
            record["observed_at_utc"].startswith(hour[:10]), "Invalid hour")
    root.mkdir(parents=True, exist_ok=True)
    dated = root / (hour[:10] + ".json")
    if dated.exists():
        content = json.loads(dated.read_text(encoding="utf-8"))
        require(content.get("schema") == SCHEMA and content.get("date_utc") == hour[:10]
                and isinstance(content.get("hours"), list), "Existing archive invalid")
        hours = content["hours"]
        require(all(x.get("hour_utc") != hour for x in hours),
                "Hour already published: immutable observation, no silent replacement")
    else:
        hours = []
    require(len(hours) < 24, "Daily hourly archive already full")
    hours.append(record)
    hours.sort(key=lambda x: x["hour_utc"])
    day = {"schema": SCHEMA, "date_utc": hour[:10],
           "record_kind": "dated_public_hourly_observations",
           "orders_enabled": False, "real_orders": 0, "paper_fills": 0,
           "hours": hours}
    summary = {"schema": "erith.radar.okx-hourly-health.v1",
               "last_hour_utc": hour, "last_observed_at_utc": record["observed_at_utc"],
               "markets_expected": record["markets_expected"],
               "markets_verified": record["markets_verified"],
               "status": record["status"], "date_utc": hour[:10],
               "quotes": list(QUOTES), "orders_enabled": False,
               "real_orders": 0, "paper_fills": 0}
    for p, data in ((dated, day), (root / "latest.json", summary)):
        temp = p.with_suffix(".writing")
        temp.write_text(json.dumps(data, ensure_ascii=False, indent=2,
                                   allow_nan=False) + "\n", encoding="utf-8")
        os.replace(temp, p)
    return {"archive": str(dated), "hours": len(hours), "latest": str(root / "latest.json")}


def main():
    record = collect()
    report = save(record)
    print(json.dumps({**report, "status": record["status"],
                      "verified": record["markets_verified"],
                      "pairs": record["markets_expected"]}))


if __name__ == "__main__":
    main()
