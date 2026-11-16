"""StrategySpec v1 contracts.

These tests prove that StrategySpec is a portability layer around the existing
Seven engine, not a new financial engine.
"""
from __future__ import annotations

import math
import unittest

from src.engine import LabError, simulate
from src.strategy_spec import (
    SCHEMA,
    build_strategy_spec,
    explain_strategy_spec,
    strategy_spec_to_params,
    validate_strategy_spec,
)


def sample(n=2200):
    rows = []
    for i in range(n):
        base = 100.0 + 0.025*i + 7.0*math.sin(i/17.0) + 2.0*math.sin(i/5.0)
        nxt = 100.0 + 0.025*(i+1) + 7.0*math.sin((i+1)/17.0) + 2.0*math.sin((i+1)/5.0)
        rows.append((
            1704067200 + i*3600,
            base,
            max(base, nxt) + 0.45,
            min(base, nxt) - 0.45,
            nxt,
            100.0 + i % 13,
        ))
    return rows


class StrategySpecV1Tests(unittest.TestCase):
    def donchian_params(self):
        return {
            "kind": "DONCHIAN",
            "capital": 10000,
            "fee": 0.001,
            "slippage": 0.0005,
            "donchian_entry": 55,
            "donchian_exit": 20,
            "timeframe": "1h",
            "source_id": "TEST_BTCUSDT_1H",
        }

    def test_build_validate_and_explain_donchian(self):
        spec = build_strategy_spec(
            "Donchian 55/20 · test",
            self.donchian_params(),
            spec_id="1"*32,
        )
        self.assertEqual(spec["schema"], SCHEMA)
        self.assertEqual(spec["strategy"]["kind"], "DONCHIAN")
        self.assertEqual(spec["strategy"]["rules"], {
            "donchian_entry": 55,
            "donchian_exit": 20,
        })
        self.assertEqual(spec["market"], {
            "source_id": "TEST_BTCUSDT_1H",
            "timeframe": "1h",
        })
        self.assertEqual(len(spec["fingerprint_sha256"]), 64)
        checked = validate_strategy_spec(spec)
        self.assertEqual(checked, spec)
        explanation = explain_strategy_spec(spec)
        self.assertIn("55", explanation["intent"])
        self.assertIn("20", explanation["intent"])
        self.assertIn("bougie clôturée", explanation["execution"])
        self.assertIn("Aucun ordre réel", explanation["safety"])

    def test_roundtrip_preserves_native_financial_results_exactly(self):
        raw = self.donchian_params()
        spec = build_strategy_spec("Donchian parity", raw, spec_id="2"*32)
        replay = strategy_spec_to_params(spec)

        native = simulate(sample(), raw)
        from_spec = simulate(sample(), replay)

        self.assertEqual(native["params"], from_spec["params"])
        self.assertEqual(native["results"], from_spec["results"])
        self.assertEqual(native["trades"], from_spec["trades"])
        self.assertEqual(native["series"], from_spec["series"])

    def test_all_current_native_families_roundtrip_to_engine_options(self):
        families = [
            {"kind": "EMA_CROSS", "ema_fast": 10, "ema_slow": 30},
            {"kind": "BOLLINGER", "bb_period": 20, "bb_sigma": 2},
            {"kind": "DONCHIAN", "donchian_entry": 55, "donchian_exit": 20},
            {"kind": "DCA", "dca_every": 1440, "dca_quote": 50},
            {"kind": "HOLD_50"},
            {"kind": "HOLD_100"},
            {"kind": "CASH"},
            {
                "kind": "CUSTOM_RULES",
                "ema_fast": 10,
                "ema_slow": 30,
                "entry_rule": "EMA_CROSS_UP",
                "filter_rule": "RSI_BELOW",
                "exit_rule": "EMA_CROSS_DOWN",
                "rsi_period": 14,
                "rsi_entry_max": 60,
                "rsi_exit_min": 70,
                "volume_period": 20,
                "volume_multiplier": 1.2,
                "stop_loss_pct": 4,
                "take_profit_pct": 8,
            },
        ]
        for index, family in enumerate(families):
            with self.subTest(kind=family["kind"]):
                raw = {
                    "capital": 1000,
                    "fee": 0.001,
                    "slippage": 0.0005,
                    "timeframe": "4h",
                    "source_id": "SOURCE",
                    **family,
                }
                spec = build_strategy_spec(
                    "Spec " + family["kind"], raw,
                    spec_id=f"{index+10:032x}",
                )
                replay = strategy_spec_to_params(spec)
                self.assertEqual(replay["kind"], family["kind"])
                self.assertEqual(replay["timeframe"], "4h")
                self.assertEqual(replay["source_id"], "SOURCE")

    def test_fingerprint_detects_silent_strategy_mutation(self):
        spec = build_strategy_spec("Tamper", self.donchian_params(), spec_id="3"*32)
        spec["strategy"]["rules"]["donchian_entry"] = 99
        with self.assertRaisesRegex(LabError, "empreinte incohérente"):
            validate_strategy_spec(spec)

    def test_rejects_real_execution_contract(self):
        spec = build_strategy_spec("Safe", self.donchian_params(), spec_id="4"*32)
        spec["execution"]["real_orders"] = True
        with self.assertRaisesRegex(LabError, "exécution non autorisé"):
            validate_strategy_spec(spec)

    def test_rejects_unknown_or_mismatched_rules(self):
        spec = build_strategy_spec("Rules", self.donchian_params(), spec_id="5"*32)
        spec["strategy"]["rules"]["ema_fast"] = 10
        with self.assertRaisesRegex(LabError, "règles incompatibles"):
            validate_strategy_spec(spec)


if __name__ == "__main__":
    unittest.main()
