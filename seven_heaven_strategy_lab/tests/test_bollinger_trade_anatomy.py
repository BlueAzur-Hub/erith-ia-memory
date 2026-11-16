from datetime import datetime, timezone
import unittest

from tools.bollinger_trade_anatomy import run_bollinger_trade_anatomy


def oscillating_hourly(start_ts: int, hours: int):
    bars = []
    for i in range(hours):
        ts = start_ts + i * 3600
        base = 100 + 5 * __import__("math").sin(i / 6)
        nxt = 100 + 5 * __import__("math").sin((i + 1) / 6)
        opening = base
        close = nxt
        high = max(opening, close) + 0.3
        low = min(opening, close) - 0.3
        bars.append((ts, opening, high, low, close, 20.0))
    return bars


class BollingerTradeAnatomyTests(unittest.TestCase):
    def test_closed_trade_anatomy_is_paper_only(self):
        start = int(datetime(2024, 1, 1, tzinfo=timezone.utc).timestamp())
        bars = oscillating_hourly(start, (31 + 29 + 31) * 24)
        out = run_bollinger_trade_anatomy(
            bars,
            {
                "kind": "BOLLINGER",
                "capital": 10000,
                "fee": 0.001,
                "slippage": 0.0005,
                "bb_period": 20,
                "bb_sigma": 2,
            },
        )
        self.assertGreater(out["closed_round_trips"], 0)
        self.assertFalse(out["methodology"]["parameters_optimized"])
        self.assertTrue(out["methodology"]["exit_candle_post_open_range_excluded_from_mfe_mae"])
        self.assertEqual(out["safety"]["orders_real"], 0)
        first = out["trades"][0]
        self.assertIn("mfe_pct", first)
        self.assertIn("mae_pct", first)
        self.assertIn("entry_band_width_pct", first)


if __name__ == "__main__":
    unittest.main()
