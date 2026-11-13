"""V4.5 controlled filter research: causal, frozen inputs and no USB writes."""
import copy
import math
import unittest

from src.engine import LabError
from src.filter_research import study, _variations


def fixture(*,n=720,timeframe="1h",kind="CUSTOM_RULES",params=None):
    bars=[]
    base=1767225600 # 2026-01-01 UTC, hour and 4h aligned
    for i in range(n):
        opening=1750+110*math.sin((i-1)/16)+i*.15
        closing=1750+110*math.sin(i/16)+i*.15
        bars.append((base+i*3600,opening,max(opening,closing)+3,
                     min(opening,closing)-3,closing,10+i%5))
    source={
        "id":"OKX_ETH_USDC_1H_FROZEN_RESEARCH_FIXTURE",
        "sha256":"c"*64,"source_timeframe":"1h",
        "base":"ETH","quote":"USDC","pair":"ETH/USDC",
        "exchange":"OKX Spot","available_timeframes":["1h","4h"],
    }
    config={"kind":kind,"capital":10000,"timeframe":timeframe,
            "ema_fast":12,"ema_slow":32,"fee":0.001,"slippage":0.0005,
            "entry_rule":"EMA_CROSS_UP","exit_rule":"EMA_CROSS_DOWN",
            "filter_rule":"NONE","rsi_entry_max":60,
            "volume_period":20,"volume_multiplier":1.0,
            **(params or {})}
    return bars,source,config


class V45ResearchIntegrity(unittest.TestCase):
    def test_v45_two_strict_later_folds_source_fees_paper_only(self):
        bars,source,p=fixture(n=720)
        frozen=copy.deepcopy(bars),copy.deepcopy(source),copy.deepcopy(p)
        report=study(bars,p,source)
        self.assertEqual(report["source"]["sha256"],source["sha256"])
        self.assertEqual(report["source"]["pair"],"ETH/USDC")
        self.assertEqual(report["timeframe"],"1h")
        self.assertEqual(report["summary"]["verification_windows"],2)
        self.assertLessEqual(report["summary"]["variants_compared"],5)
        self.assertEqual(report["safety"]["orders_real"],0)
        self.assertTrue(report["methodology"]["no_new_workspace_files"])
        self.assertTrue(report["methodology"]["selection_uses_training_only"])
        first,second=report["folds"]
        self.assertLess(first["training"]["last_bar_utc"],first["verification"]["first_bar_utc"])
        self.assertLess(first["verification"]["last_bar_utc"],second["verification"]["first_bar_utc"])
        self.assertEqual(first["verification"]["last_bar_utc"]+3600,
                         second["verification"]["first_bar_utc"])
        self.assertEqual(second["training"]["last_bar_utc"]+3600,
                         second["verification"]["first_bar_utc"])
        self.assertEqual((bars,source,p),frozen)

    def test_same_window_all_filters_and_controls(self):
        bars,source,p=fixture(n=720)
        result=study(bars,p,source)
        for fold in result["folds"]:
            self.assertEqual(sum(r["selected_on_training"] for r in fold["candidates"]),1)
            self.assertEqual(fold["candidates"][0]["key"],"OWNER")
            self.assertEqual(fold["candidates"][0]["verification"],
                             fold["benchmarks"]["owner_original"])
            self.assertEqual(fold["benchmarks"]["cash"]["return_pct"],0)
            self.assertAlmostEqual(fold["selected_minus_owner_return_pct_points"],
                    fold["selected_verification"]["return_pct"]-
                    fold["benchmarks"]["owner_original"]["return_pct"],places=4)
            self.assertEqual(fold["candidate_count"],len(fold["candidates"]))
            self.assertTrue(all(r["training"]["equity_final"]>=0 for r in fold["candidates"]))
            self.assertTrue(all(r["verification"]["fees_paid_quote"]>=0 for r in fold["candidates"]))
            self.assertEqual(fold["selection"]["holdout_data_used_to_choose"],False)
            self.assertEqual(fold["selection"]["training_only"],True)

    def test_duplicate_filters_deduplicated_without_mutating_original(self):
        bars,source,params=fixture(params={"filter_rule":"RSI_BELOW","rsi_entry_max":45})
        cand,converted,canonical=_variations(__import__("src.engine",fromlist=["options"]).options(params))
        self.assertFalse(converted)
        self.assertEqual(len(cand),4)
        self.assertEqual(cand[0]["key"],"OWNER")
        self.assertEqual(cand[0]["params"]["rsi_entry_max"],45)
        self.assertEqual(cand[0]["params"]["filter_rule"],"RSI_BELOW")
        self.assertEqual(params["rsi_entry_max"],45)
        self.assertIn("VOLUME_ABOVE",[x["params"]["filter_rule"] for x in cand])

    def test_ema_standard_converts_to_equivalent_custom_engine_without_leakage(self):
        bars,source,params=fixture(kind="EMA_CROSS",n=480)
        report=study(bars,params,source)
        self.assertTrue(report["ema_converted_to_equivalent_custom_rules"])
        self.assertEqual(report["entry_rule"],"EMA_CROSS_UP")
        self.assertEqual(report["exit_rule"],"EMA_CROSS_DOWN")
        self.assertEqual(report["original_kind"],"EMA_CROSS")

    def test_first_fold_training_selection_independent_of_any_future_prices(self):
        bars,source,params=fixture(n=720)
        baseline=study(bars,params,source)
        mutated=copy.deepcopy(bars)
        end=baseline["folds"][0]["training"]["bars"]
        # Change only AFTER first fold's training. Future candles can diverge,
        # but training-only selection and its scores cannot be influenced.
        for i in range(end,len(mutated)):
            ts,o,h,l,c,v=mutated[i]
            mutated[i]=(ts,o*1.12,h*1.12,l*1.12,c*1.12,v)
        alternate=study(mutated,params,source)
        self.assertEqual(baseline["folds"][0]["selection"],
                         alternate["folds"][0]["selection"])
        self.assertEqual([x["training"] for x in baseline["folds"][0]["candidates"]],
                         [x["training"] for x in alternate["folds"][0]["candidates"]])

    def test_empty_trading_window_never_proclaimed_profitable(self):
        bars,source,p=fixture(n=480)
        bars=[(t,100,100,100,100,10) for t,_,_,_,_,_ in bars]
        outcome=study(bars,p,source)
        self.assertEqual(outcome["summary"]["selected_positive_windows"],0)
        self.assertEqual(outcome["summary"]["folds_with_selected_paper_activity"],0)
        for fold in outcome["folds"]:
            self.assertEqual(fold["selection"]["status"],
                             "NO_TRAINING_CLOSED_TRADE_RETAIN_OWNER_BASELINE")
            self.assertEqual(fold["selection"]["key"],"OWNER")
            self.assertEqual(fold["selected_verification"]["hypothetical_fills"],0)

    def test_source_4h_aggregation_and_minimum_history(self):
        bars,source,p=fixture(n=720,timeframe="4h")
        outcome=study(bars,p,source)
        self.assertEqual(outcome["total_bars"],180)
        self.assertEqual(outcome["summary"]["verification_windows"],1)
        self.assertEqual(outcome["folds"][0]["verification"]["bars"],72)
        short,source,p=fixture(n=240,timeframe="4h")
        with self.assertRaisesRegex(LabError,"150 bougies"):
            study(short,p,source)

    def test_reject_wrong_strategies_and_incompatible_horizon_source(self):
        bars,source,p=fixture(n=480)
        for kind in ("BOLLINGER","DCA","CASH","HOLD_50"):
            with self.subTest(kind=kind):
                with self.assertRaisesRegex(LabError,"uniquement"):
                    study(bars,{**p,"kind":kind},source)
        with self.assertRaisesRegex(LabError,"pas disponible"):
            study(bars,{**p,"timeframe":"5m"},source)
        with self.assertRaisesRegex(LabError,"provenance"):
            study(bars,p,{**source,"sha256":"bad"})

    def test_no_stop_or_exit_changes_in_variant_configs(self):
        bars,source,p=fixture(n=720,params={
            "stop_loss_pct":2,"take_profit_pct":5,
            "exit_rule":"PRICE_BELOW_EMA",
            "entry_rule":"PRICE_ABOVE_EMA",
            "rsi_period":16,
            "volume_period":22,
        })
        from src.engine import options
        choices,_,base=_variations(options(p))
        for choice in choices:
            q=choice["params"]
            for key in ("stop_loss_pct","take_profit_pct",
                        "exit_rule","entry_rule","ema_fast","ema_slow",
                        "rsi_period","volume_period","capital","fee","slippage"):
                self.assertEqual(q[key],base[key])
        report=study(bars,p,source)
        self.assertEqual(report["stop_loss_pct"],2)
        self.assertEqual(report["take_profit_pct"],5)
        self.assertEqual(report["entry_rule"],"PRICE_ABOVE_EMA")


if __name__=="__main__":
    unittest.main()
