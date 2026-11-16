from datetime import datetime, timezone
import unittest

from tools.monthly_regime_map import RegimeMapError, run_monthly_regime_map


def synthetic_hourly(start_ts: int, hours: int):
    bars = []
    close = 100.0
    for i in range(hours):
        ts = start_ts + i * 3600
        opening = close
        drift = 0.02 if (i // 240) % 2 == 0 else -0.01
        close = max(1.0, opening + drift)
        high = max(opening, close) + 0.1
        low = min(opening, close) - 0.1
        bars.append((ts, opening, high, low, close, 10.0))
    return bars


class MonthlyRegimeMapTests(unittest.TestCase):
    def test_two_months_after_720h_warmup(self):
        start = int(datetime(2024, 1, 1, tzinfo=timezone.utc).timestamp())
        hours = (31 + 29 + 31) * 24
        bars = synthetic_hourly(start, hours)
        out = run_monthly_regime_map(
            bars,
            {
                "kind": "EMA_CROSS",
                "capital": 10000,
                "fee": 0.001,
                "slippage": 0.0005,
                "dca_every": 1440,
                "dca_quote": 50,
            },
        )
        self.assertEqual(out["active_months"], 2)
        self.assertEqual([m["month"] for m in out["months"]], ["2024-02", "2024-03"])
        self.assertEqual(out["dca_effective_steps_1h"], 24)
        self.assertEqual(out["safety"]["orders_real"], 0)
        self.assertEqual(set(out["months"][0]["strategies"]), {
            "EMA_CROSS", "BOLLINGER", "DCA", "HOLD_50", "HOLD_100", "CASH"
        })

    def test_gap_is_rejected(self):
        start = int(datetime(2024, 1, 1, tzinfo=timezone.utc).timestamp())
        bars = synthetic_hourly(start, (31 + 29 + 31) * 24)
        bars.pop(1000)
        with self.assertRaises(RegimeMapError):
            run_monthly_regime_map(bars, {"kind": "EMA_CROSS"})


if __name__ == "__main__":
    unittest.main()
