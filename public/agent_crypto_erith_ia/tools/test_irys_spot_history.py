#!/usr/bin/env python3
"""Offline synthetic contract tests; market fixtures are NEVER published."""
import datetime as dt
import pathlib
import sys
import tempfile
import unittest
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import collect_irys_spot_history as source

UTC = dt.timezone.utc
NOW = dt.datetime(2026, 10, 24, 5, 45, tzinfo=UTC)


def reply(route, params):
    if route.endswith("/instruments"):
        return [{"instId": "IRYS-USDC", "instType": "SPOT", "baseCcy": "IRYS",
                 "quoteCcy": "USDC", "state": "live"}]
    if route.endswith("/history-candles"):
        step = source.BARS[params["bar"]]
        last = int(NOW.timestamp() * 1000) // step * step - step
        return [[str(last - i * step), ".09", ".11", ".08", ".10",
                 "200", "1800", "18", "1"] for i in range(40)]
    raise AssertionError("Unexpected public market route")


class TestIrysSpotHistory(unittest.TestCase):
    def test_exact_native_public_history(self):
        data = source.collect(reply, NOW)
        self.assertEqual(data["pair"], "IRYS-USDC")
        self.assertEqual(data["quote"], "USDC")
        self.assertEqual(data["venue"], "OKX_EEA")
        self.assertFalse(data["orders_enabled"])
        self.assertFalse(data["account_access"])
        self.assertTrue(data["no_quote_conversion"])
        for bar in source.BARS:
            rows = data["candles"][bar]
            self.assertEqual(len(rows), 40)
            self.assertLess(int(rows[0][0]), int(rows[-1][0]))
            self.assertEqual(rows[-1][4], ".10")
            self.assertTrue(all(x[8-1] == "18" for x in rows))
        with tempfile.TemporaryDirectory() as d:
            out = source.save(data, pathlib.Path(d) / "irys-spot-candles.json")
            self.assertTrue(out.exists())
            self.assertIn('"quote": "USDC"', out.read_text())

    def test_unfinished_and_invalid_ohlc_are_not_released(self):
        step = source.BARS["15m"]
        last = int(NOW.timestamp() * 1000) // step * step - step
        rows = [[str(last - i * step), ".09", ".11", ".08", ".10",
                 "200", "1800", "18", "1"] for i in range(3)]
        rows[0][8] = "0"
        self.assertEqual(len(source.normalize(rows, step, NOW)), 2)
        rows[1][2] = ".07"
        with self.assertRaises(ValueError):
            source.normalize(rows, step, NOW)

    def test_wrong_pair_or_closed_listing_fails_closed(self):
        def wrong_pair(route, params):
            data = reply(route, params)
            if route.endswith("/instruments"):
                data[0]["quoteCcy"] = "USDT"
            return data
        with self.assertRaises(ValueError):
            source.collect(wrong_pair, NOW)

    def test_no_private_api_or_missing_source(self):
        with self.assertRaises(ValueError):
            source.fetch_public("/api/v5/trade/order", {"instId": "IRYS-USDC"})
        with self.assertRaises(ValueError):
            source.fetch_public("/api/v5/account/balance", {"instId": "IRYS-USDC"})
        with self.assertRaises(ValueError):
            source.collect(lambda path, args: [], NOW)


if __name__ == "__main__":
    unittest.main()
