"""V4.3 chronology, source gates and PAPER-only robustness contracts."""
import copy
import math
import unittest

from src.engine import LabError
from src.robustness import study, MIN_RESEARCH, EMA_PRESETS


def sample(n=720, *, pair="ETH/USDC"):
    # Data source is a fictional *test fixture*, never advertised as live data.
    rows=[]
    for i in range(n):
        opening=2200+180*math.sin((i-1)/25)+55*math.sin((i-1)/7)
        close=2200+180*math.sin(i/25)+55*math.sin(i/7)
        rows.append((1767225600+i*3600,opening,max(opening,close)+9,
                     min(opening,close)-9,close,1.0+i%9))
    source={
        "id":"OKX_ETH_USDC_1H_TEST_FIXTURE", "sha256":"a"*64,
        "exchange":"OKX Spot","pair":pair,"base":"ETH","quote":"USDC",
        "source_timeframe":"1h","available_timeframes":["1h","4h"]
    }
    return rows,source


class WalkForwardScientificV43Tests(unittest.TestCase):
    def test_720_hourly_two_expanding_folds_nonoverlapping_tests(self):
        raw,source=sample()
        report=study(raw,{"kind":"EMA_CROSS","timeframe":"1h","capital":1000,
                          "ema_fast":12,"ema_slow":32,"fee":0.001,"slippage":0.0005},source)
        self.assertEqual(report["status"],"CHRONOLOGICAL_PAPER_RESEARCH_NOT_UNTOUCHED_BLIND_OOS")
        self.assertEqual(report["source"]["sha256"],source["sha256"])
        self.assertEqual(report["source"]["pair"],"ETH/USDC")
        self.assertEqual(report["timeframe"],"1h")
        self.assertEqual(report["total_bars"],720)
        self.assertEqual(report["summary"]["holdout_windows"],2)
        one,two=report["folds"]
        self.assertEqual(one["training"]["bars"],360)
        self.assertEqual(one["holdout"]["bars"],180)
        self.assertEqual(two["training"]["bars"],540)
        self.assertEqual(two["holdout"]["bars"],180)
        self.assertLess(one["training"]["last_bar_utc"],one["holdout"]["first_bar_utc"])
        self.assertLess(one["holdout"]["last_bar_utc"],two["holdout"]["first_bar_utc"])
        self.assertEqual(one["holdout"]["first_bar_utc"],raw[360][0])
        self.assertEqual(two["holdout"]["first_bar_utc"],raw[540][0])
        self.assertEqual(report["safety"]["orders_real"],0)
        self.assertTrue(all(f["selection"]["selected_on_training_only"] for f in report["folds"]))
        self.assertEqual(len(report["candidate_ema_pairs"]),5)

    def test_4h_eth_window_30days_independent_one_fold(self):
        raw,source=sample()
        report=study(raw,{"kind":"CUSTOM_RULES","timeframe":"4h","capital":10000,
                          "ema_fast":12,"ema_slow":32,"filter_rule":"RSI_BELOW",
                          "rsi_entry_max":60},source)
        self.assertEqual(report["timeframe"],"4h")
        self.assertEqual(report["total_bars"],180)
        self.assertEqual(len(report["folds"]),1)
        fold=report["folds"][0]
        self.assertEqual(fold["training"]["bars"],108)
        self.assertEqual(fold["holdout"]["bars"],72)
        self.assertEqual(fold["holdout"]["first_bar_utc"],raw[108*4][0])
        self.assertEqual(fold["selection"]["kind"],"CUSTOM_RULES")
        self.assertEqual(fold["holdout"]["benchmark_cash"]["return_pct"],0)

    def test_future_holdout_changes_never_influence_prior_selection(self):
        raw,source=sample()
        settings={"kind":"EMA_CROSS","timeframe":"1h","ema_fast":12,"ema_slow":32}
        original=study(raw,settings,source)
        shifted=list(raw)
        for i in range(540,len(raw)):
            t,o,h,l,c,v=raw[i]
            shifted[i]=(t,o*1.18,h*1.18,l*1.18,c*1.18,v)
        changed=study(shifted,settings,source)
        # Neither first fold nor training of second fold can see later candles.
        self.assertEqual(original["folds"][0],changed["folds"][0])
        self.assertEqual(original["folds"][1]["selection"],changed["folds"][1]["selection"])
        self.assertEqual(original["folds"][1]["training"],changed["folds"][1]["training"])
        self.assertNotEqual(original["folds"][1]["holdout"]["metrics"]["equity_final"],
                            changed["folds"][1]["holdout"]["metrics"]["equity_final"])

    def test_fixed_non_ema_kind_not_silently_tuned(self):
        raw,source=sample(240)
        for kind in ("CASH","DCA","BOLLINGER","HOLD_50"):
            with self.subTest(kind=kind):
                a=study(raw,{"kind":kind,"timeframe":"1h"},source)
                self.assertEqual(len(a["candidate_ema_pairs"]),1)
                self.assertEqual(a["folds"][0]["selection"]["candidates_considered"],1)
                self.assertEqual(a["folds"][0]["selection"]["kind"],kind)
                self.assertEqual(a["safety"]["orders_real"],0)
                for key in ("fee_x2","slippage_x2","both_x2"):
                    self.assertTrue(math.isfinite(a["folds"][0]["holdout"][key]["return_pct"]))

    def test_stress_evaluated_with_same_open_close_history_not_new_source(self):
        raw,source=sample(360)
        params={"kind":"EMA_CROSS","timeframe":"1h","fee":0.001,"slippage":0.0005}
        before=copy.deepcopy(raw),copy.deepcopy(params),copy.deepcopy(source)
        r=study(raw,params,source)
        fold=r["folds"][0]
        self.assertEqual(fold["stress_assumptions"]["fee_per_side_double_pct"],0.2)
        self.assertEqual(fold["stress_assumptions"]["slippage_per_side_double_pct"],0.1)
        self.assertEqual(fold["holdout"]["metrics"]["hypothetical_fills"],
                         fold["holdout"]["fee_x2"]["hypothetical_fills"])
        self.assertEqual((raw,params,source),before)
        self.assertFalse(r["methodology"]["limits"][1].startswith("Proven"))

    def test_short_4h_history_explained_no_fake_folds(self):
        raw,source=sample(240)
        with self.assertRaisesRegex(LabError,"150 bougies"):
            study(raw,{"kind":"EMA_CROSS","timeframe":"4h"},source)

    def test_broken_source_and_parameter_rejected(self):
        raw,source=sample(180)
        for invalid in ({**source,"sha256":""},
                        {**source,"available_timeframes":["4h"]}):
            with self.subTest(invalid=invalid),self.assertRaises(LabError):
                study(raw,{"kind":"EMA_CROSS","timeframe":"1h"},invalid)
        with self.assertRaises(LabError):
            study(raw,{"kind":"UNKNOWN","timeframe":"1h"},source)
        with self.assertRaises(LabError):
            study(raw,{"kind":"EMA_CROSS","timeframe":"7h"},source)


if __name__=="__main__":
    unittest.main()
