import math
import unittest

from tools.experimental_supertrend import simulate_supertrend


def synthetic_bars(count=1000):
    bars = []
    start = 1704067200
    for i in range(count):
        regime = 1 if (i // 120) % 2 == 0 else -1
        base = 40000 + regime * (i % 120) * 55 + 900 * math.sin(i / 11.0)
        opening = base + 35 * math.sin(i / 3.0)
        closing = base + 45 * math.cos(i / 5.0)
        high = max(opening, closing) + 180
        low = min(opening, closing) - 180
        bars.append((start + i * 3600, opening, high, low, closing, 100 + i % 23))
    return bars


class ExperimentalSuperTrendTests(unittest.TestCase):
    def test_supertrend_is_paper_only_and_causal(self):
        bars = synthetic_bars()
        out = simulate_supertrend(bars)
        self.assertEqual(out["status"], "RESEARCH_ONLY_HYPOTHETICAL_PAPER_BACKTEST")
        self.assertEqual(out["safety"]["orders_real"], 0)
        self.assertFalse(out["safety"]["runtime_integration"])
        self.assertEqual(out["params"]["atr_period"], 20)
        self.assertEqual(out["params"]["multiplier"], 4.0)
        self.assertGreater(out["results"]["hypothetical_fills"], 0)
        for fill in out["trades"]:
            self.assertEqual(fill["timestamp"] - fill["signal_bar_open_utc"], 3600)

    def test_current_unclosed_candle_cannot_change_prior_fill_history(self):
        bars = synthetic_bars()
        first = simulate_supertrend(bars)
        changed = list(bars)
        ts, o, h, l, c, v = changed[-1]
        changed[-1] = (ts, o, h * 3, l * 0.5, c * 2, v * 10)
        second = simulate_supertrend(changed)
        self.assertEqual(first["trades"], second["trades"])

    def test_cost_scenarios_remain_paper_only(self):
        bars = synthetic_bars()
        ideal = simulate_supertrend(bars, fee=0.0, slippage=0.0)
        stress = simulate_supertrend(bars, fee=0.002, slippage=0.001)
        self.assertEqual(ideal["safety"]["orders_real"], 0)
        self.assertEqual(stress["safety"]["orders_real"], 0)


if __name__ == "__main__":
    unittest.main()
