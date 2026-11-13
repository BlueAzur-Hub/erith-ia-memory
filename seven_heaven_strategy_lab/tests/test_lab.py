"""Offline unit tests for the independent PAPER engine and secure data gate."""
import csv
import math
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from src.engine import LabError, load_bars, options, simulate
from src.reference_data import SourceError, _convert, dataset_status
from src.server import STATIC


def bars_constant(count=300, price=100.0):
    return [(1767225600 + i * 60, price, price, price, price, 1.0)
            for i in range(count)]


def bars_waves(count=300):
    rows = []
    for i in range(count):
        center = 100 + 8 * math.sin(i / 8)
        close = center + math.sin(i / 3)
        open_price = 100 + 8 * math.sin((i - 1) / 8)
        rows.append((1767225600 + i * 60, open_price, max(open_price, close) + 1,
                     min(open_price, close) - 1, close, 1.0))
    return rows


class PaperEngineTests(unittest.TestCase):
    def test_50_percent_buy_hold_preserves_cash_and_inventory(self):
        record = simulate(bars_constant(), {"kind": "HOLD_50", "fee": 0, "slippage": 0})
        r = record["results"]
        self.assertAlmostEqual(r["equity_final"], 1000, places=5)
        self.assertAlmostEqual(r["cash_final"], 500, places=4)
        self.assertAlmostEqual(r["base_inventory_btc"], 5, places=7)
        self.assertEqual(r["buy_events"], 1)
        self.assertEqual(r["sell_events"], 0)
        self.assertEqual(record["safety"]["orders_real"], 0)

    def test_cash_baseline_never_trades(self):
        record = simulate(bars_waves(), {"kind": "CASH"})
        self.assertEqual(record["results"]["hypothetical_fills"], 0)
        self.assertEqual(record["results"]["return_pct"], 0)
        self.assertEqual(record["results"]["max_drawdown_pct"], 0)

    def test_taker_fees_reduce_equity(self):
        bars = bars_constant()
        no_fee = simulate(bars, {"kind": "HOLD_100", "fee": 0, "slippage": 0})
        with_fee = simulate(bars, {"kind": "HOLD_100", "fee": 0.001, "slippage": 0})
        self.assertLess(with_fee["results"]["equity_final"], no_fee["results"]["equity_final"])
        self.assertGreater(with_fee["results"]["fees_paid_usdt"], 0)

    def test_ema_orders_are_causal_and_next_bar_open(self):
        original = bars_waves()
        changed = list(original)
        for i in range(160, len(original)):
            _, o, h, l, c, v = changed[i]
            changed[i] = (changed[i][0], o + 400, h + 400, l + 400, c + 400, v)
        first = simulate(original, {"kind": "EMA_CROSS"})
        second = simulate(changed, {"kind": "EMA_CROSS"})
        # Later prices cannot alter previous signals or fills.
        cutoff = changed[160][0]
        a = [t for t in first["trades"] if t["timestamp"] < cutoff]
        b = [t for t in second["trades"] if t["timestamp"] < cutoff]
        self.assertEqual(a, b)

    def test_ema_uses_next_candle_open_not_close(self):
        rows = bars_waves(500)
        result = simulate(rows, {"kind": "EMA_CROSS"})
        opens = {t: o for t, o, _, _, _, _ in rows}
        for t in result["trades"]:
            target = opens[t["timestamp"]]
            if t["side"] == "BUY":
                self.assertAlmostEqual(t["price"], target * 1.0005, places=4)
            else:
                self.assertAlmostEqual(t["price"], target * 0.9995, places=4)

    def test_dca_does_not_spend_more_than_wallet(self):
        run = simulate(bars_constant(1000), {"kind": "DCA",
                        "capital": 1000, "dca_every": 1, "dca_quote": 250})
        r = run["results"]
        self.assertGreater(r["buy_events"], 0)
        self.assertGreaterEqual(r["cash_final"], 0)
        self.assertGreaterEqual(r["base_inventory_btc"], 0)
        self.assertLess(r["fees_paid_usdt"], 10)

    def test_bollinger_on_flat_market_is_no_trade(self):
        r = simulate(bars_constant(200), {"kind": "BOLLINGER"})
        self.assertEqual(r["results"]["hypothetical_fills"], 0)

    def test_ema_param_guard(self):
        with self.assertRaises(LabError):
            options({"ema_fast": 40, "ema_slow": 10})

    def test_reject_nan_and_unbounded_fee(self):
        for bad in ("NaN", "Infinity", "-0.1", "0.10"):
            with self.assertRaises(LabError, msg=bad):
                options({"fee": bad})

    def test_unknown_strategy_and_overexposure(self):
        with self.assertRaises(LabError):
            options({"kind": "LIVE"})
        for kind in ("DCA", "HOLD_100", "EMA_CROSS", "BOLLINGER"):
            r = simulate(bars_waves(), {"kind": kind})
            self.assertGreaterEqual(r["results"]["cash_final"], 0)
            self.assertGreaterEqual(r["results"]["base_inventory_btc"], 0)
            self.assertEqual(r["safety"]["leverage"], 1)

    def test_csv_gaps_rejected(self):
        with TemporaryDirectory() as td:
            file = Path(td) / "bars.csv"
            with file.open("w", newline="", encoding="utf-8") as h:
                writer = csv.writer(h)
                writer.writerow(["timestamp", "open", "high", "low", "close", "volume"])
                for i in range(70):
                    t = 1767225600 + (i + (1 if i == 41 else 0)) * 60
                    writer.writerow([t, 100, 100, 100, 100, 1])
            with self.assertRaisesRegex(LabError, "minute"):
                load_bars(file, expected_count=None)

    def test_source_gate_rejects_unauthenticated_archive(self):
        with self.assertRaises(SourceError):
            _convert(b"not an authenticated market archive")

    def test_dataset_not_available_until_verified(self):
        with TemporaryDirectory() as td:
            self.assertFalse(dataset_status(Path(td))["available"])

    def test_static_files_allowlist(self):
        self.assertEqual(set(STATIC), {"/", "/index.html", "/app.js", "/styles.css"})
        self.assertNotIn("/api/trade", STATIC)


if __name__ == "__main__":
    unittest.main()
