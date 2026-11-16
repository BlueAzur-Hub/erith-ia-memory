from datetime import datetime, timezone
import math
import unittest

from tools.bollinger_trade_aging import run_bollinger_trade_aging


def oscillating_hourly(start_ts: int, hours: int):
    bars = []
    for i in range(hours):
        ts = start_ts + i * 3600
        opening = 100 + 5 * math.sin(i / 6)
        close = 100 + 5 * math.sin((i + 1) / 6)
        high = max(opening, close) + 0.3
        low = min(opening, close) - 0.3
        bars.append((ts, opening, high, low, close, 20.0))
    return bars


class BollingerTradeAgingTests(unittest.TestCase):
    def test_aging_is_observational_only(self):
        start = int(datetime(2024, 1, 1, tzinfo=timezone.utc).timestamp())
        bars = oscillating_hourly(start, (31 + 29 + 31) * 24)
        out = run_bollinger_trade_aging(
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
        self.assertFalse(out["methodology"]["time_stop_applied"])
        self.assertFalse(out["methodology"]["post_horizon_data_used_for_current_state"])
        self.assertEqual(out["params"]["horizons_hours"], [12, 24, 36, 48, 72])
        self.assertGreater(out["horizons"]["12"]["all"]["positions"], 0)
        self.assertEqual(out["safety"]["orders_real"], 0)


if __name__ == "__main__":
    unittest.main()
