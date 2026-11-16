from datetime import datetime, timezone
import unittest

from tools.bollinger_mechanism import run_bollinger_mechanism_study


def synthetic_hourly(start_ts: int, hours: int):
    bars = []
    close = 100.0
    for i in range(hours):
        ts = start_ts + i * 3600
        opening = close
        cycle = (i % 96) / 96.0
        move = 0.12 if cycle < 0.45 else (-0.10 if cycle < 0.9 else 0.02)
        close = max(1.0, opening + move)
        high = max(opening, close) + 0.2
        low = min(opening, close) - 0.2
        bars.append((ts, opening, high, low, close, 10.0))
    return bars


class BollingerMechanismTests(unittest.TestCase):
    def test_monthly_diagnostic_is_paper_only(self):
        start = int(datetime(2024, 1, 1, tzinfo=timezone.utc).timestamp())
        bars = synthetic_hourly(start, (31 + 29 + 31) * 24)
        out = run_bollinger_mechanism_study(
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
        self.assertEqual(out["active_months"], 2)
        self.assertEqual(out["params"]["bb_period"], 20)
        self.assertEqual(out["params"]["bb_sigma"], 2)
        self.assertFalse(out["methodology"]["parameters_optimized"])
        self.assertEqual(out["safety"]["orders_real"], 0)
        self.assertIn("friction_drag_pct", out["months"][0]["bollinger"])


if __name__ == "__main__":
    unittest.main()
