import math
import unittest

from tools.experimental_donchian import simulate_donchian


def synthetic_bars(count=1200):
    bars = []
    start = 1704067200
    for i in range(count):
        cycle = i % 240
        slope = cycle * 45 if cycle < 120 else (240 - cycle) * 45
        base = 35000 + slope + 500 * math.sin(i / 9.0)
        opening = base + 25 * math.sin(i / 4.0)
        closing = base + 40 * math.cos(i / 6.0)
        # Narrow synthetic wicks let the rising/falling regimes produce
        # confirmed close breakouts beyond the prior Donchian channel.
        high = max(opening, closing) + 8
        low = min(opening, closing) - 8
        bars.append((start + i * 3600, opening, high, low, closing, 90 + i % 31))
    return bars


class ExperimentalDonchianTests(unittest.TestCase):
    def test_donchian_is_paper_only_and_causal(self):
        bars = synthetic_bars()
        out = simulate_donchian(bars)
        self.assertEqual(out["status"], "RESEARCH_ONLY_HYPOTHETICAL_PAPER_BACKTEST")
        self.assertEqual(out["safety"]["orders_real"], 0)
        self.assertFalse(out["safety"]["runtime_integration"])
        self.assertEqual(out["params"]["entry_period"], 55)
        self.assertEqual(out["params"]["exit_period"], 20)
        self.assertGreater(out["results"]["hypothetical_fills"], 0)
        for fill in out["trades"]:
            self.assertEqual(fill["timestamp"] - fill["signal_bar_open_utc"], 3600)

    def test_current_unclosed_candle_cannot_change_fill_history(self):
        bars = synthetic_bars()
        first = simulate_donchian(bars)
        changed = list(bars)
        ts, o, h, l, c, v = changed[-1]
        changed[-1] = (ts, o, h * 3, l * 0.5, c * 2, v * 10)
        second = simulate_donchian(changed)
        self.assertEqual(first["trades"], second["trades"])

    def test_cost_scenarios_are_supported(self):
        bars = synthetic_bars()
        ideal = simulate_donchian(bars, fee=0.0, slippage=0.0)
        stress = simulate_donchian(bars, fee=0.002, slippage=0.001)
        self.assertEqual(ideal["safety"]["orders_real"], 0)
        self.assertEqual(stress["safety"]["orders_real"], 0)


if __name__ == "__main__":
    unittest.main()
