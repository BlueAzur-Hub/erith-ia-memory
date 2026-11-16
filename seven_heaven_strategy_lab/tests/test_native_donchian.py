"""Native Donchian integration contracts.

The native engine must remain financially identical to the already-used
research-only experimental Donchian reference for the same 55/20 parameters.
"""
from __future__ import annotations

import math
import unittest

from src.engine import LabError, options, simulate
from src.observatory import compare
from src.robustness import study
from tools.experimental_donchian import simulate_donchian


def sample(n=2200):
    rows=[]
    for i in range(n):
        # Deterministic trending/oscillating fixture produces breakouts and exits.
        base=100.0 + 0.025*i + 7.0*math.sin(i/17.0) + 2.0*math.sin(i/5.0)
        nxt=100.0 + 0.025*(i+1) + 7.0*math.sin((i+1)/17.0) + 2.0*math.sin((i+1)/5.0)
        opening=base
        close=nxt
        rows.append((
            1704067200 + i*3600,
            opening,
            max(opening,close)+0.45,
            min(opening,close)-0.45,
            close,
            100.0 + i%13,
        ))
    return rows


class NativeDonchianTests(unittest.TestCase):
    def params(self, **extra):
        return {
            "kind":"DONCHIAN",
            "capital":10000,
            "fee":0.001,
            "slippage":0.0005,
            "donchian_entry":55,
            "donchian_exit":20,
            **extra,
        }

    def test_options_defaults_and_period_guard(self):
        p=options({"kind":"DONCHIAN"})
        self.assertEqual(p["donchian_entry"],55)
        self.assertEqual(p["donchian_exit"],20)
        with self.assertRaises(LabError):
            options({"kind":"DONCHIAN","donchian_entry":20,"donchian_exit":20})
        with self.assertRaises(LabError):
            options({"kind":"DONCHIAN","donchian_entry":20,"donchian_exit":21})

    def test_native_financial_parity_with_experimental_reference(self):
        bars=sample()
        native=simulate(bars,self.params())
        reference=simulate_donchian(
            bars,capital=10000,fee=0.001,slippage=0.0005,
            entry_period=55,exit_period=20,
        )
        nr=native["results"]
        rr=reference["results"]
        for key in (
            "equity_final","return_pct","max_drawdown_pct","cash_final",
            "fees_paid_usdt","hypothetical_fills",
        ):
            self.assertEqual(nr[key],rr[key],key)
        self.assertEqual(nr["base_inventory_btc"],rr["base_inventory_units"])
        self.assertEqual(len(native["trades"]),len(reference["trades"]))
        self.assertGreater(len(native["trades"]),0)
        for a,b in zip(native["trades"],reference["trades"]):
            for key in ("timestamp","side","price","qty","fee"):
                self.assertEqual(a[key],b[key],key)

    def test_trace_is_causal_and_forensics_ready(self):
        run=simulate(sample(),self.params())
        buy=next(t for t in run["trades"] if t["side"]=="BUY")
        self.assertEqual(buy["reason_code"],"DONCHIAN_CLOSE_BREAKOUT")
        self.assertLess(buy["signal_bar_open_utc"],buy["timestamp"])
        self.assertEqual(buy["signal_context"]["entry_period"],55)
        self.assertEqual(buy["signal_context"]["exit_period"],20)
        self.assertIn("prior_entry_channel_high",buy["signal_context"])
        sells=[t for t in run["trades"] if t["side"]=="SELL"]
        self.assertTrue(sells)
        self.assertEqual(sells[0]["reason_code"],"DONCHIAN_CLOSE_BREAKDOWN")
        self.assertIn("prior_exit_channel_low",sells[0]["signal_context"])

    def test_comparator_includes_native_donchian(self):
        report=compare(
            sample(960),
            {**self.params(),"timeframe":"1h"},
            source_timeframe="1h",
            source_label="TEST BTC/USDT",
        )
        kinds=[row["kind"] for row in report["rows"]]
        self.assertEqual(len(kinds),7)
        self.assertIn("DONCHIAN",kinds)
        self.assertEqual(report["status"],"SEVEN_MODELS_PAPER_ONLY")

    def test_scientific_keeps_donchian_fixed_and_warms_channel(self):
        raw=sample(720)
        source={
            "id":"DONCHIAN_NATIVE_TEST",
            "sha256":"a"*64,
            "exchange":"TEST",
            "pair":"BTC/USDT",
            "base":"BTC",
            "quote":"USDT",
            "source_timeframe":"1h",
            "available_timeframes":["1h","4h"],
        }
        report=study(raw,{**self.params(),"timeframe":"1h"},source)
        self.assertEqual(report["selected_kind"],"DONCHIAN")
        self.assertEqual(len(report["candidate_ema_pairs"]),1)
        self.assertTrue(all(
            fold["selection"]["candidates_considered"]==1
            for fold in report["folds"]
        ))
        self.assertTrue(all(
            fold["warmup"]["requested_bars"]>=56
            for fold in report["folds"]
        ))
        self.assertEqual(report["safety"]["orders_real"],0)


if __name__=="__main__":
    unittest.main()
