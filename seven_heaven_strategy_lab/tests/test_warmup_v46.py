"""V4.6 regressions: legacy parity and explicit no-trade indicator warmup."""
from __future__ import annotations

import hashlib
import json
import math
import unittest

from src.engine import LabError, simulate
from src.filter_research import study as study_filters
from src.robustness import study as study_robustness


def oscillating(count=480, *, period=24):
    bars = []
    start = 1577836800
    for i in range(count):
        close = 10000 + 500 * math.sin(2 * math.pi * i / period) + i * 0.1
        opening = close - 10 * math.cos(2 * math.pi * i / period)
        bars.append((start + i * 3600, opening, max(opening, close) + 5,
                     min(opening, close) - 5, close, 10 + i % 7))
    return bars


def legacy_fixture():
    bars = []
    start = 1577836800
    for i in range(480):
        base = 7000 + 12 * i + 420 * math.sin(i / 11) + 170 * math.sin(i / 3.7)
        close = base + 35 * math.sin(i / 2.3)
        opening = base - 25 * math.cos(i / 4.1)
        bars.append((start + 3600 * i, opening,
                     max(opening, close) + 30 + i % 7,
                     min(opening, close) - 28 - i % 5,
                     close, 20 + (i % 19) * 1.7))
    return bars


PARAMS = {
    "capital": 10000, "fee": .001, "slippage": .0005,
    "ema_fast": 13, "ema_slow": 33, "bb_period": 20, "bb_sigma": 2,
    "dca_every": 24, "dca_quote": 50,
    "entry_rule": "EMA_CROSS_UP", "filter_rule": "RSI_BELOW",
    "exit_rule": "EMA_CROSS_DOWN", "rsi_period": 15,
    "rsi_entry_max": 66, "rsi_exit_min": 73,
    "volume_period": 22, "volume_multiplier": 1,
    "stop_loss_pct": 10, "take_profit_pct": 0,
}

LEGACY_FINANCIAL_HASHES = {
    "CASH": "99c5988736fc0796079441b347084f32a3e517c3a7ece5a1eac2b448f99960ad",
    "EMA_CROSS": "808f4d467e4eef8d41c723b101606e265aaa3afa27ec8f44c89cdb10024d4f17",
    "BOLLINGER": "72dc552b3725c22165f8ede3354d079b476dc4da0aad2022cdb3c3b5dc4b4e2d",
    "DCA": "3a0c2bcaf0172f7161185095aa34795d0396533f748ae3a95f8f84767016e96e",
    "HOLD_50": "40afa4246bd7a7aeef45f57a44977dbe5969494ae2a982c7cba6958edad43619",
    "HOLD_100": "c450a705a0fcbfe42196d67c650cf09baeaad16e455085cc651ce5fe385a00e3",
    "CUSTOM_RULES": "99c5988736fc0796079441b347084f32a3e517c3a7ece5a1eac2b448f99960ad",
}


class WarmupV46(unittest.TestCase):
    def test_default_path_preserves_v451_financial_outputs(self):
        bars = legacy_fixture()
        for kind, expected in LEGACY_FINANCIAL_HASHES.items():
            out = simulate(bars, {**PARAMS, "kind": kind})
            financial = {key: out[key] for key in ("results", "series", "trades", "analytics")}
            digest = hashlib.sha256(json.dumps(
                financial, sort_keys=True, separators=(",", ":")
            ).encode()).hexdigest()
            self.assertEqual(digest, expected, kind)

    def test_slow_ema_uses_warmup_but_cannot_trade_before_holdout(self):
        bars = oscillating()
        params = {**PARAMS, "kind": "EMA_CROSS", "ema_fast": 5, "ema_slow": 180}
        cold = simulate(bars[300:], params)
        warmed = simulate(bars, params, trade_start_index=300)
        self.assertEqual(cold["results"]["hypothetical_fills"], 0)
        self.assertGreaterEqual(warmed["results"]["hypothetical_fills"], 2)
        self.assertTrue(all(fill["timestamp"] >= bars[300][0] for fill in warmed["trades"]))
        self.assertEqual(warmed["data"]["warmup_rows"], 300)
        self.assertEqual(warmed["data"]["rows"], 180)

    def test_hold_and_dca_start_at_boundary_not_during_warmup(self):
        bars = oscillating()
        for kind in ("HOLD_50", "HOLD_100", "DCA"):
            out = simulate(bars, {**PARAMS, "kind": kind}, trade_start_index=300)
            self.assertTrue(out["trades"])
            self.assertEqual(out["trades"][0]["timestamp"], bars[300][0], kind)

    def test_invalid_or_too_short_active_window_is_rejected(self):
        bars = oscillating()
        for start in (-1, len(bars), len(bars) - 59, True):
            with self.assertRaises(LabError):
                simulate(bars, {**PARAMS, "kind": "CASH"}, trade_start_index=start)

    def test_scientific_and_filter_studies_report_no_trade_warmup(self):
        bars = oscillating(720, period=36)
        source = {
            "id": "SYNTHETIC_TEST_ONLY", "sha256": "a" * 64,
            "exchange": "Fixture", "pair": "BTC/USDT", "base": "BTC",
            "quote": "USDT", "source_timeframe": "1h",
            "available_timeframes": ["1h", "4h"],
        }
        requested = {**PARAMS, "kind": "EMA_CROSS", "timeframe": "1h"}
        scientific = study_robustness(bars, requested, source)
        filters = study_filters(bars, requested, source)
        self.assertEqual(scientific["schema"], "seven.heaven.strategy_lab.aether_scientific.walk_forward.v4_6")
        self.assertTrue(scientific["methodology"]["warmup_no_trade_enforced_by_engine"])
        self.assertTrue(all(fold["warmup"]["fills_allowed_during_warmup"] == 0
                            for fold in scientific["folds"]))
        self.assertEqual(filters["schema"], "seven.heaven.aether_research.controlled_filters.v4_6")
        self.assertTrue(filters["methodology"]["indicator_warmup_from_prior_training_only"])
        self.assertTrue(all(fold["warmup"]["trade_start_utc"] == fold["verification"]["first_bar_utc"]
                            for fold in filters["folds"]))


if __name__ == "__main__":
    unittest.main()
