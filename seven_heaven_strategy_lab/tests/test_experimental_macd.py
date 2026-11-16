import math
import unittest

from tools.experimental_macd import simulate_macd


def synthetic_bars(count=900):
    bars = []
    start = 1704067200
    for i in range(count):
        base = 40000 + 3500 * math.sin(i / 18.0) + i * 8
        opening = base + 40 * math.sin(i / 3.0)
        closing = base + 60 * math.cos(i / 5.0)
        high = max(opening, closing) + 120
        low = min(opening, closing) - 120
        bars.append((start + i * 3600, opening, high, low, closing, 100 + i % 17))
    return bars


class ExperimentalMacdTests(unittest.TestCase):
    def test_macd_is_paper_only_and_next_bar_open_causal(self):
        bars = synthetic_bars()
        out = simulate_macd(bars)
        self.assertEqual(out["status"], "RESEARCH_ONLY_HYPOTHETICAL_PAPER_BACKTEST")
        self.assertEqual(out["safety"]["orders_real"], 0)
        self.assertFalse(out["safety"]["runtime_integration"])
        self.assertEqual(out["params"]["fast"], 12)
        self.assertEqual(out["params"]["slow"], 26)
        self.assertEqual(out["params"]["signal"], 9)
        self.assertGreater(out["results"]["hypothetical_fills"], 0)
        for fill in out["trades"]:
            self.assertEqual(fill["timestamp"] - fill["signal_bar_open_utc"], 3600)

    def test_last_unclosed_candle_cannot_change_fill_history(self):
        bars = synthetic_bars()
        first = simulate_macd(bars)
        changed = list(bars)
        ts, o, h, l, c, v = changed[-1]
        changed[-1] = (ts, o, h * 3, l * 0.5, c * 2, v * 10)
        second = simulate_macd(changed)
        self.assertEqual(first["trades"], second["trades"])

    def test_cost_scenarios_are_supported_without_real_orders(self):
        bars = synthetic_bars()
        ideal = simulate_macd(bars, fee=0.0, slippage=0.0)
        stress = simulate_macd(bars, fee=0.002, slippage=0.001)
        self.assertEqual(ideal["safety"]["orders_real"], 0)
        self.assertEqual(stress["safety"]["orders_real"], 0)


if __name__ == "__main__":
    unittest.main()
