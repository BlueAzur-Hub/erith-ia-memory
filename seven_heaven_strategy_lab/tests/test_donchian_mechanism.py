import math
import unittest

from tools.donchian_mechanism import analyze_donchian_mechanism


def synthetic_bars(count=1500):
    bars = []
    start = 1704067200
    for i in range(count):
        cycle = i % 300
        slope = cycle * 52 if cycle < 150 else (300 - cycle) * 52
        base = 34000 + slope + 420 * math.sin(i / 10.0)
        opening = base + 18 * math.sin(i / 3.0)
        closing = base + 30 * math.cos(i / 6.0)
        high = max(opening, closing) + 6
        low = min(opening, closing) - 6
        bars.append((start + i * 3600, opening, high, low, closing, 100 + i % 19))
    return bars


class DonchianMechanismTests(unittest.TestCase):
    def test_diagnostics_are_descriptive_and_paper_only(self):
        out = analyze_donchian_mechanism(synthetic_bars(), annual_bars=8760)
        self.assertEqual(out["status"], "POST_HOC_DESCRIPTIVE_RESEARCH_ONLY")
        self.assertEqual(out["safety"]["orders_real"], 0)
        self.assertFalse(out["safety"]["filter_optimization"])
        self.assertFalse(out["safety"]["runtime_integration"])
        self.assertTrue(out["safety"]["mfe_mae_retrospective_only"])
        self.assertGreater(out["summary"]["closed_positions"], 0)
        self.assertEqual(
            out["summary"]["closed_positions"],
            out["summary"]["winning_positions"] + out["summary"]["losing_positions"],
        )

    def test_pre_entry_features_are_finite_and_causal_fields_exist(self):
        out = analyze_donchian_mechanism(synthetic_bars(), annual_bars=8760)
        for row in out["positions"]:
            self.assertLess(row["entry_signal_utc"], row["entry_fill_utc"])
            for key in (
                "breakout_excess_pct",
                "channel_width_pct",
                "directional_return_55_pct",
                "efficiency_ratio_55",
                "atr20_pct",
                "duration_bars",
                "net_pnl_pct",
                "mfe_pct",
                "mae_pct",
            ):
                self.assertTrue(math.isfinite(float(row[key])))

    def test_regime_descriptor_has_no_optimized_threshold(self):
        out = analyze_donchian_mechanism(synthetic_bars(), annual_bars=8760)
        self.assertIn("realized_vol_annualized_pct", out["regime"])
        self.assertIn("annual_efficiency_ratio", out["regime"])
        self.assertIn("sma200_occupancy_above_pct", out["regime"])
        self.assertNotIn("recommended_filter", out)
        self.assertNotIn("threshold", out)


if __name__ == "__main__":
    unittest.main()
