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
            report = m.update(fetch=api, now=NOW, root=root)
            self.assertEqual(report["requested_pairs"], 48)
            self.assertEqual(report["covered_pairs"], 48)
            self.assertEqual(len(report["updated_pairs"]), 48)
            self.assertEqual(len(api.calls), 48*4)
            self.assertEqual(len(m.NEW_OFFERS), 24)
            self.assertTrue({"XWDC", "XNFLX", "LIT", "CT", "XDP", "CARDS", "EURC"} <= set(m.NEW_OFFERS))
            self.assertTrue({"XAMZN", "XAAPL", "XGOOGL", "XNVDA", "XTSLA", "XINTC"} <= set(m.NEW_OFFERS))
            self.assertEqual(set(m.NEW_OFFERS) & set(m.SYMBOLS[:-24]), set())
            self.assertEqual(set(m.SYMBOLS).__len__(), len(m.SYMBOLS))
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
            next_run = m.update(fetch=api, now=NOW, root=root)
            self.assertEqual(next_run["updated_pairs"], [])
            self.assertEqual(len(api.calls), 48*4, "No duplicate requests in same UTC day")

    def test_absent_instrument_not_fabricated_and_old_history_retained(self):
        with tempfile.TemporaryDirectory() as temp:
            root = pathlib.Path(temp)
            first = m.update(fetch=FakeExchange(), now=NOW, root=root)
            self.assertEqual(first["covered_pairs"], 48)
            next_day = NOW + dt.timedelta(days=1)
            down = FakeExchange(m.SYMBOLS)
            report = m.update(fetch=down, now=next_day, root=root)
            self.assertEqual(report["covered_pairs"], 48)
            self.assertEqual(len(report["failed_this_attempt"]), 48)
            self.assertEqual(len(report["updated_pairs"]), 0)
            self.assertEqual(
                json.loads(m.target_path("DOS", root).read_text())["generated_at_utc"],
                NOW.isoformat(timespec="seconds").replace("+00:00", "Z"))
        with tempfile.TemporaryDirectory() as temp:
            report = m.update(fetch=FakeExchange(m.SYMBOLS), now=NOW,
                              root=pathlib.Path(temp))
            self.assertEqual(report["covered_pairs"], 0)
            self.assertEqual(len(report["failed_this_attempt"]), 48)

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
