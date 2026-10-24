#!/usr/bin/env python3
"""No-network tests. Synthetic candles are only fixtures, never published."""
from __future__ import annotations
import datetime as dt
import json
import pathlib
import sys
import tempfile
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import collect_okx_spot_universe_history as m

NOW = dt.datetime(2026, 10, 24, 3, 26, tzinfo=dt.timezone.utc)


class FakeExchange:
    def __init__(self, missing=()):
        self.missing = set(missing)
        self.calls = []
    def __call__(self, route, params):
        self.calls.append((route, dict(params)))
        pair = params["instId"]
        if pair.split("-")[0] in self.missing:
            raise ValueError("No public Spot instrument")
        symbol, quote = pair.split("-")
        if route == "/api/v5/public/instruments":
            return [{"instId": pair, "instType": "SPOT", "baseCcy": symbol,
                     "quoteCcy": quote, "state": "live"}]
        assert route == "/api/v5/market/history-candles"
        period = m.verified.BARS[params["bar"]]
        start = int(NOW.timestamp() * 1000) // period * period - 2 * period
        return [[str(start - j * period), "0.09", "0.11", "0.08", "0.10",
                 "22", "2", "2", "1"] for j in range(5)]


class SpotHistoryTests(unittest.TestCase):
    def test_selected_pairs_native_usdc_and_daily_archive(self):
        with tempfile.TemporaryDirectory() as temp:
            root = pathlib.Path(temp)
            api = FakeExchange()
            report = m.update(fetch=api, now=NOW, root=root, feed_path=root / "missing.json")
            self.assertEqual(report["requested_pairs"], len(m.SYMBOLS))
            self.assertEqual(report["covered_pairs"], len(m.SYMBOLS))
            self.assertEqual(len(report["updated_pairs"]), len(m.SYMBOLS))
            self.assertEqual(len(api.calls), len(m.SYMBOLS)*4)
            self.assertEqual(len(m.NEW_OFFERS), 24)
            self.assertTrue({"XWDC", "XNFLX", "LIT", "CT", "XDP", "CARDS", "EURC"} <= set(m.NEW_OFFERS))
            self.assertTrue({"XAMZN", "XAAPL", "XGOOGL", "XNVDA", "XTSLA", "XINTC"} <= set(m.NEW_OFFERS))
            self.assertEqual(set(m.NEW_OFFERS) & set(m.SYMBOLS[:24]), set())
            self.assertEqual(set(m.SYMBOLS).__len__(), len(m.SYMBOLS))
            self.assertEqual(set(m.TOP_GAINERS_ADDITIONAL), {"BOME", "OL", "GOAT"})
            self.assertEqual(m.target_path("KAT", root).name, "kat-usdc.json")
            for symbol in m.SYMBOLS:
                saved = json.loads(m.target_path(symbol, root).read_text())
                self.assertTrue(m.valid_archive(saved, symbol+"-USDC"))
                self.assertEqual(saved["quote"], "USDC")
                self.assertEqual(
                    saved["instrument_group"],
                    "x_prefixed_instrument" if symbol.startswith("X")
                    else "stablecoin_pair" if symbol == "EURC"
                    else "crypto_spot_pair"
                )
                self.assertFalse(saved["orders_enabled"])
                self.assertFalse(saved["account_access"])
                self.assertEqual(len(saved["candles"]["1Dutc"]), 5)
            next_run = m.update(fetch=api, now=NOW, root=root, feed_path=root / "missing.json")
            self.assertEqual(next_run["updated_pairs"], [])
            self.assertEqual(len(api.calls), len(m.SYMBOLS)*4, "No duplicate requests in same UTC day")

    def test_absent_instrument_not_fabricated_and_old_history_retained(self):
        with tempfile.TemporaryDirectory() as temp:
            root = pathlib.Path(temp)
            first = m.update(fetch=FakeExchange(), now=NOW, root=root, feed_path=root / "missing.json")
            self.assertEqual(first["covered_pairs"], len(m.SYMBOLS))
            next_day = NOW + dt.timedelta(days=1)
            down = FakeExchange(m.SYMBOLS)
            report = m.update(fetch=down, now=next_day, root=root, feed_path=root / "missing.json")
            self.assertEqual(report["covered_pairs"], len(m.SYMBOLS))
            self.assertEqual(len(report["failed_this_attempt"]), len(m.SYMBOLS))
            self.assertEqual(len(report["updated_pairs"]), 0)
            self.assertEqual(
                json.loads(m.target_path("DOS", root).read_text())["generated_at_utc"],
                NOW.isoformat(timespec="seconds").replace("+00:00", "Z"))
        with tempfile.TemporaryDirectory() as temp:
            report = m.update(fetch=FakeExchange(m.SYMBOLS), now=NOW,
                              root=pathlib.Path(temp), feed_path=pathlib.Path(temp) / "missing.json")
            self.assertEqual(report["covered_pairs"], 0)
            self.assertEqual(len(report["failed_this_attempt"]), len(m.SYMBOLS))


    def test_paginated_history_and_exact_native_values(self):
        class Paged(FakeExchange):
            def __call__(self, route, params):
                self.calls.append((route, dict(params)))
                pair = params["instId"]
                if route.endswith("/instruments"):
                    base = pair.split("-")[0]
                    return [{"instId": pair, "instType": "SPOT", "baseCcy": base,
                             "quoteCcy": "USDC", "state": "live"}]
                step = m.verified.BARS[params["bar"]]
                most_recent = int(NOW.timestamp() * 1000) // step * step - step
                if "after" in params:
                    most_recent = int(params["after"]) - step
                    count = 120
                else:
                    count = 300
                return [[str(most_recent - j*step), "0.09", "0.11", "0.08",
                         "0.10", "22", "2", "2", "1"] for j in range(count)]
        fetch = Paged()
        saved = m.collect_pair("KAT", fetch=fetch, now=NOW)
        self.assertEqual(len(saved["candles"]["15m"]), 420)
        self.assertEqual(len(saved["candles"]["1H"]), 420)
        self.assertEqual(len(saved["candles"]["1Dutc"]), 420)
        self.assertEqual(saved["quote"], "USDC")
        pages = [x for x in fetch.calls if x[0].endswith("history-candles")]
        self.assertEqual(len(pages), 6)
        self.assertEqual(sum("after" in args for _, args in pages), 3)

    def test_merge_real_archive_and_preserve_previous_on_outage(self):
        old = m.collect_pair("KAT", fetch=FakeExchange(), now=NOW)
        added = {k: len(v) for k, v in old["candles"].items()}
        class Fresh(FakeExchange):
            def __call__(self, route, params):
                self.calls.append((route, dict(params)))
                if route.endswith("/instruments"):
                    return [{"instId": params["instId"], "instType": "SPOT",
                             "baseCcy": "KAT", "quoteCcy": "USDC", "state": "live"}]
                step = m.verified.BARS[params["bar"]]
                later = int((NOW + dt.timedelta(days=2)).timestamp() * 1000)
                most_recent = later // step * step - step
                return [[str(most_recent-j*step), "0.09", "0.11", "0.08",
                         "0.10", "22", "2", "2", "1"] for j in range(5)]
        updated = m.collect_pair("KAT", fetch=Fresh(), now=NOW + dt.timedelta(days=2),
                                 previous=old)
        self.assertTrue(all(len(updated["candles"][bar]) > count
                            for bar, count in added.items()))
        self.assertEqual(updated["candles"]["1Dutc"][0], old["candles"]["1Dutc"][0])
        self.assertTrue(m.valid_archive(updated, "KAT-USDC"))

    def test_new_public_feed_usdc_pairs_are_bounded_and_verified(self):
        with tempfile.TemporaryDirectory() as temp:
            path = pathlib.Path(temp) / "feed.json"
            path.write_text(json.dumps({"read_only": True, "entries": [
                {"provider": "okx", "instrument_type": "SPOT", "base": "NEWCOIN",
                 "providerSymbol": "NEWCOIN-USDC", "quote": "USDC", "state": "live"},
                {"provider": "okx", "instrument_type": "SPOT", "base": "FAKE",
                 "providerSymbol": "FAKE-USDT", "quote": "USDT", "state": "live"},
                {"provider": "bitget", "instrument_type": "SPOT", "base": "OTH",
                 "providerSymbol": "OTH-USDC", "quote": "USDC", "state": "live"}
            ]}), encoding="utf-8")
            self.assertEqual(m.observed_symbols(path), ("NEWCOIN",))
            report = m.update(fetch=FakeExchange(), now=NOW, root=pathlib.Path(temp),
                              feed_path=path)
            self.assertIn("NEWCOIN-USDC", report["updated_pairs"])
            self.assertEqual(report["requested_pairs"], len(m.SYMBOLS)+1)

    def test_wrong_quote_or_non_spot_refused(self):
        def wrong(route, args):
            rows = FakeExchange()(route, args)
            if route.endswith("/instruments"):
                rows[0]["baseCcy"] = "BTC"
            return rows
        with self.assertRaises(ValueError):
            m.collect_pair("KAT", fetch=wrong, now=NOW)
        with self.assertRaises(ValueError):
            m.collect_pair("BTC", fetch=FakeExchange(), now=NOW)
        with self.assertRaises(ValueError):
            m.target_path("../trade")


if __name__ == "__main__":
    unittest.main()
