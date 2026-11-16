import math
import unittest

from tools.experimental_parabolic_sar import simulate_parabolic_sar


def synthetic_bars(count=1000):
    bars = []
    start = 1704067200
    for i in range(count):
        wave = 2400 * math.sin(i / 35.0)
        trend = ((i // 180) % 2 * -2 + 1) * (i % 180) * 22
        base = 42000 + wave + trend
        opening = base + 30 * math.sin(i / 3.0)
        closing = base + 55 * math.cos(i / 7.0)
        high = max(opening, closing) + 150
        low = min(opening, closing) - 150
        bars.append((start + i * 3600, opening, high, low, closing, 120 + i % 29))
    return bars


class ExperimentalParabolicSarTests(unittest.TestCase):
    def test_sar_is_paper_only_and_causal(self):
        bars = synthetic_bars()
        out = simulate_parabolic_sar(bars)
        self.assertEqual(out["status"], "RESEARCH_ONLY_HYPOTHETICAL_PAPER_BACKTEST")
        self.assertEqual(out["safety"]["orders_real"], 0)
        self.assertFalse(out["safety"]["runtime_integration"])
        self.assertEqual(out["params"]["af_step"], 0.02)
        self.assertEqual(out["params"]["af_max"], 0.20)
        self.assertGreater(out["results"]["hypothetical_fills"], 0)
        for fill in out["trades"]:
            self.assertEqual(fill["timestamp"] - fill["signal_bar_open_utc"], 3600)

    def test_current_unclosed_candle_cannot_change_fill_history(self):
        bars = synthetic_bars()
        first = simulate_parabolic_sar(bars)
        changed = list(bars)
        ts, o, h, l, c, v = changed[-1]
        changed[-1] = (ts, o, h * 2.5, l * 0.6, c * 1.8, v * 9)
        second = simulate_parabolic_sar(changed)
        self.assertEqual(first["trades"], second["trades"])

    def test_cost_scenarios_are_supported(self):
        bars = synthetic_bars()
        ideal = simulate_parabolic_sar(bars, fee=0.0, slippage=0.0)
        stress = simulate_parabolic_sar(bars, fee=0.002, slippage=0.001)
        self.assertEqual(ideal["safety"]["orders_real"], 0)
        self.assertEqual(stress["safety"]["orders_real"], 0)


if __name__ == "__main__":
    unittest.main()
