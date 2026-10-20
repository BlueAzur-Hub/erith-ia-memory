#!/usr/bin/env python3
"""Offline contract tests. No external network, account or WebSocket."""
from __future__ import annotations
import copy
import datetime as dt
import json
import pathlib
import sys
import tempfile
import urllib.parse
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import collect_okx_public_hourly as m

NOW = dt.datetime(2026, 10, 20, 10, 17, tzinfo=dt.timezone.utc)
MS = str(int(NOW.timestamp() * 1000) - 1000)


def inst(pair, state="live", instrument_type="SPOT"):
    base, quote = pair.split("-")
    return {"instType": instrument_type, "state": state, "instId": pair,
            "baseCcy": base, "quoteCcy": quote,
            "minSz": "0.001", "lotSz": "0.001", "tickSz": "0.01"}


class Feeds:
    def __init__(self, book_fault=None):
        self.calls = []
        self.book_fault = book_fault
    def __call__(self, url):
        self.calls.append(url)
        u = urllib.parse.urlsplit(url)
        assert u.netloc == "eea.okx.com"
        assert u.path in m.ROUTES and "account" not in url and "trade/order" not in url
        q = urllib.parse.parse_qs(u.query)
        pair = q.get("instId", [""])[0]
        if u.path == "/api/v5/public/instruments":
            return {"code": "0", "data": [
                inst("BTC-USDC"), inst("BTC-USDT"), inst("ETH-EUR"),
                inst("ETH-USDC", "suspend"), inst("SOL-USDC", instrument_type="SWAP"),
                inst("BTC-EUR", "preopen"),
                inst("OTHER-USDT")]}
        if u.path == "/api/v5/market/ticker":
            return {"code": "0", "data": [{
                "instId": pair, "ts": MS, "last": "9.95", "bidPx": "9.9",
                "askPx": "10", "vol24h": "1000", "volCcy24h": "9950"}]}
        if u.path == "/api/v5/market/books":
            if self.book_fault == "stale" and pair == "BTC-USDT":
                stamp = str(int(MS) - 600000)
            else:
                stamp = MS
            bids = [["9.9", "10"], ["9.8", "100"]]
            asks = [["10", "15"], ["10.1", "100"]]
            if self.book_fault == "cross":
                bids[0][0] = "10.1"
            return {"code": "0", "data": [{"ts": stamp, "bids": bids, "asks": asks}]}
        if u.path == "/api/v5/market/candles":
            return {"code": "0", "data": [
                [str(int(MS) - 60000), "10", "11", "9", "10.5", "7", "70", "70", "1"],
                [MS, "10.5", "10.6", "10.1", "10.3", "8", "80", "80", "0"]]}
        if u.path == "/api/v5/market/trades":
            return {"code": "0", "data": [{
                "instId": pair, "ts": MS, "side": "buy", "px": "10",
                "sz": "2", "tradeId": "1234"}]}
        raise AssertionError(url)


class HourlyCollectorTests(unittest.TestCase):
    def test_public_eea_and_no_quote_substitution(self):
        feed = Feeds()
        record = m.collect(feed, NOW)
        self.assertEqual(record["markets_expected"], 3)
        self.assertEqual(record["markets_verified"], 3)
        self.assertEqual(record["status"], "READY")
        by_pair = {x["pair"]: x for x in record["markets"]}
        self.assertEqual(set(by_pair), {"BTC-USDC", "BTC-USDT", "ETH-EUR"})
        self.assertEqual(by_pair["BTC-USDC"]["quote"], "USDC")
        self.assertEqual(by_pair["BTC-USDT"]["quote"], "USDT")
        self.assertEqual(by_pair["ETH-EUR"]["quote"], "EUR")
        self.assertFalse(record["account_access"])
        self.assertFalse(record["orders_enabled"])
        self.assertEqual(record["real_orders"], 0)
        self.assertTrue(record["no_quote_conversion"])
        self.assertTrue(all("https://eea.okx.com/" in s for s in feed.calls))
        self.assertEqual(sum("/market/candles" in s for s in feed.calls), 2,
                         "only preferred base-quote pairs have minute candles")
        self.assertEqual(by_pair["BTC-USDC"]["last_closed_1m"]["close"], "10.5")
        self.assertIsNone(by_pair["BTC-USDT"]["last_closed_1m"])
        self.assertEqual(by_pair["ETH-EUR"]["recent_trades"][0]["side"], "buy")

    def test_stale_book_partial_not_a_false_success(self):
        r = m.collect(Feeds(book_fault="stale"), NOW)
        rows = {x["pair"]: x for x in r["markets"]}
        self.assertEqual(rows["BTC-USDT"]["status"], "PARTIAL_PUBLIC_DATA")
        self.assertIsNone(rows["BTC-USDT"]["book5"])
        self.assertTrue(rows["BTC-USDT"]["missing"])
        self.assertEqual(r["markets_verified"], 2)

    def test_crossed_books_are_refused_not_executable(self):
        with self.assertRaises(ValueError):
            m.collect(Feeds(book_fault="cross"), NOW)

    def test_market_api_cannot_call_private_routes(self):
        with self.assertRaises(ValueError):
            m.api(Feeds(), "/api/v5/account/balance")
        with self.assertRaises(ValueError):
            m.api(Feeds(), "/api/v5/trade/order")

    def test_invalid_instrument_metadata_excluded_or_fails_closed(self):
        f = Feeds()
        self.assertEqual(len(m.instruments(f)), 3)
        def duplicate(url):
            x = f(url)
            if "/public/instruments" in url:
                x["data"].append(copy.deepcopy(x["data"][0]))
            return x
        with self.assertRaises(ValueError):
            m.instruments(duplicate)

    def test_writer_archives_hour_once_and_keeps_prior_history(self):
        r = m.collect(Feeds(), NOW)
        with tempfile.TemporaryDirectory() as path:
            root = pathlib.Path(path)
            first = m.save(r, root)
            self.assertEqual(first["hours"], 1)
            day = json.loads((root / "2026-10-20.json").read_text())
            self.assertEqual(len(day["hours"]), 1)
            self.assertEqual(day["hours"][0]["hour_utc"], "2026-10-20T10Z")
            summary = json.loads((root / "latest.json").read_text())
            self.assertEqual(summary["status"], "READY")
            # No rewriting a prior hourly book when GitHub retries the task.
            later = copy.deepcopy(r)
            later["markets"][0]["book5"]["bids"][0][0] = "9999"
            again = m.save(later, root)
            self.assertEqual(again["hours"], 1)
            self.assertEqual(json.loads((root / "2026-10-20.json").read_text())["hours"][0],
                             r)
            next_hour = copy.deepcopy(r)
            next_hour["hour_utc"] = "2026-10-20T11Z"
            next_hour["observed_at_utc"] = "2026-10-20T11:17:00Z"
            m.save(next_hour, root)
            self.assertEqual(len(json.loads((root / "2026-10-20.json").read_text())["hours"]), 2)
            self.assertEqual(json.loads((root / "latest.json").read_text())["last_hour_utc"],
                             "2026-10-20T11Z")

    def test_writer_denies_fake_fills_and_false_zero(self):
        r = m.collect(Feeds(), NOW)
        with tempfile.TemporaryDirectory() as path:
            for fake in ({**r, "orders_enabled": True},
                         {**r, "real_orders": 1},
                         {**r, "paper_fills": 1}):
                with self.assertRaises(ValueError):
                    m.save(fake, pathlib.Path(path))

    def test_ticker_and_book_time_guard(self):
        self.assertEqual(m.millis(MS, NOW), "2026-10-20T10:16:59Z")
        with self.assertRaises(ValueError):
            m.millis(str(int(MS) - 400000), NOW)
        with self.assertRaises(ValueError):
            m.millis(str(int(MS) + 400000), NOW)


if __name__ == "__main__":
    unittest.main()
