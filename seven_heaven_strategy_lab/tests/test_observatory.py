"""V2 observatory regression suite, fully offline and deterministic."""
import json
import math
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from src.engine import LabError
from src.observatory import (ORDER, TIMEFRAMES, aggregate_bars, compare,
                             run_one, run_with_diagnostics)
import src.server as server
from src.microscope import build_microscope, ALLOWED_WINDOWS


def build_bars(n=1440, base=100.0):
    bars=[]
    for i in range(n):
        opening=base+2.5*math.sin((i-1)/60)
        close=base+2.5*math.sin(i/60)
        bars.append((1767225600+i*60,opening,max(opening,close)+.7,
                     min(opening,close)-.7,close,1.25))
    return bars


def _microscope_fixture(*, timeframe="1h", rows=240, params=None):
    series=[]
    for i in range(rows):
        opening=100+7*math.sin((i-1)/8)
        closing=100+7*math.sin(i/8)
        series.append((1767225600+i*3600,opening,max(opening,closing)+1,
                       min(opening,closing)-1,closing,2.0+i%5))
    source={"id":"OKX_BTC_USDC_1H_1768089600",
            "sha256":"test-sha-verified-history","pair":"BTC/USDC",
            "base":"BTC","quote":"USDC","exchange":"OKX Spot",
            "source_timeframe":"1h"}
    raw={"kind":"EMA_CROSS","ema_fast":10,"ema_slow":30,
         "timeframe":timeframe,"fee":.001,"slippage":.0005,**(params or {})}
    run=run_one(series,raw,source_timeframe="1h")
    run["data"]["source_id"]=source["id"]
    run["data"]["source_sha256"]=source["sha256"]
    record={"id":"f"*32,"source_sha256":source["sha256"],
            "source":source,"run":run}
    return series,source,record


class MarketMicroscopeV42Tests(unittest.TestCase):
    def test_last_page_is_exact_same_sha_source_and_has_ohlcv_markers(self):
        bars,source,record=_microscope_fixture()
        panel=build_microscope(bars,record,source,limit=60)
        self.assertEqual(panel["status"],"SAME_VERIFIED_HISTORICAL_RUN_PAPER_ONLY")
        self.assertEqual(panel["start_index"],180)
        self.assertEqual(panel["total_bars"],240)
        self.assertEqual(panel["source_sha256"],source["sha256"])
        self.assertEqual(panel["candles"][0]["t"],bars[180][0])
        self.assertEqual(panel["candles"][-1]["t"],bars[-1][0])
        self.assertEqual(panel["candles"][0]["v"],bars[180][5])
        self.assertEqual(panel["safety"]["orders_real"],0)
        actual={t["timestamp"] for t in record["run"]["trades"]}
        self.assertTrue(all(m["t"] in actual for m in panel["markers"]))
        self.assertTrue(all(m["kind"]=="HYPOTHETICAL_NEXT_BAR_OPEN_FILL"
                            for m in panel["markers"]))

    def test_4h_aggregates_and_keeps_execution_marker_times(self):
        bars,source,record=_microscope_fixture(timeframe="4h")
        panel=build_microscope(bars,record,source,limit=60)
        self.assertEqual(panel["total_bars"],60)
        self.assertEqual(panel["timeframe"],"4h")
        self.assertEqual(panel["candles"][0]["o"],bars[0][1])
        self.assertEqual(panel["candles"][0]["c"],bars[3][4])
        self.assertAlmostEqual(panel["candles"][0]["v"],sum(b[5] for b in bars[:4]))
        self.assertTrue(all(c["t"]%14400==0 for c in panel["candles"]))
        self.assertTrue(all(m["t"] in {c["t"] for c in panel["candles"]}
                            for m in panel["markers"]))

    def test_indicator_display_has_no_future_candles(self):
        bars,source,record=_microscope_fixture()
        original=build_microscope(bars,record,source,limit=90,start_index=0)
        rewritten=list(bars)
        for i in range(95,len(rewritten)):
            t,o,h,l,c,v=rewritten[i]
            rewritten[i]=(t,o+200,h+200,l+200,c+200,v)
        changed=build_microscope(rewritten,record,source,limit=90,start_index=0)
        self.assertEqual(original["candles"],changed["candles"])
        for item in original["candles"]:
            self.assertTrue(math.isfinite(item["ema_fast"]))
            self.assertTrue(math.isfinite(item["ema_slow"]))
        self.assertIsNone(original["candles"][0]["sma20"])
        self.assertIsNotNone(original["candles"][19]["sma20"])

    def test_refuse_mismatched_sha_and_report_chronology_and_invalid_window(self):
        bars,source,record=_microscope_fixture()
        with self.assertRaisesRegex(LabError,"ne correspondent"):
            build_microscope(bars,record,{**source,"sha256":"wrong"},limit=60)
        with self.assertRaisesRegex(LabError,"chronologie"):
            changed={**record,"run":{**record["run"],
                "data":{**record["run"]["data"],"last_utc":0}}}
            build_microscope(bars,changed,source,limit=60)
        for bad in (0,200,"60",True,None):
            with self.subTest(limit=bad),self.assertRaises(LabError):
                build_microscope(bars,record,source,limit=bad)
        with self.assertRaisesRegex(LabError,"hors historique"):
            build_microscope(bars,record,source,limit=180,start_index=61)

    def test_v42_viewport_never_mutates_original_paper_report(self):
        import copy
        bars,source,record=_microscope_fixture()
        before=copy.deepcopy(record)
        for count in ALLOWED_WINDOWS:
            p=build_microscope(bars,record,source,limit=count)
            self.assertLessEqual(len(p["candles"]),count)
            self.assertEqual(p["safety"]["orders_real"],0)
        self.assertEqual(record,before)


class ObservatoryV2Tests(unittest.TestCase):
    def test_five_timeframes_are_explicit(self):
        self.assertEqual(TIMEFRAMES,{"1m":1,"5m":5,"15m":15,"1h":60,"4h":240})

    def test_correct_15m_ohlcv_aggregation(self):
        rows=build_bars(1440)
        result=aggregate_bars(rows,"15m")
        self.assertEqual(len(result),96)
        self.assertEqual(result[0][0],rows[0][0])
        self.assertEqual(result[0][1],rows[0][1])
        self.assertEqual(result[0][4],rows[14][4])
        self.assertAlmostEqual(result[0][2],max(r[2] for r in rows[:15]))
        self.assertAlmostEqual(result[0][3],min(r[3] for r in rows[:15]))
        self.assertAlmostEqual(result[0][5],15*1.25)

    def test_1m_identity_preserves_v1_calculation(self):
        from src.engine import simulate
        rows=build_bars(1000)
        p={"kind":"EMA_CROSS","capital":1000,"fee":.001,"slippage":.0005}
        old=simulate(rows,p)["results"]
        new=run_one(rows,{**p,"timeframe":"1m"})["results"]
        self.assertEqual(old,new)

    def test_reject_invalid_scale_and_missing_minute(self):
        rows=build_bars(1440)
        with self.assertRaises(LabError):
            aggregate_bars(rows,"3m")
        broken=list(rows)
        t,*tail=broken[13]
        broken[13]=(t+60,*tail)
        with self.assertRaisesRegex(LabError,"manquantes"):
            aggregate_bars(broken,"15m")

    def test_incomplete_period_or_wrong_alignment_refused(self):
        with self.assertRaises(LabError):
            aggregate_bars(build_bars(1441),"15m")
        rows=build_bars(1440)
        shifted=[(t+60,*v) for (t,*v) in rows]
        with self.assertRaises(LabError):
            aggregate_bars(shifted,"15m")

    def test_4h_needs_at_least_60_closed_bars(self):
        rows=build_bars(14400)
        bars=aggregate_bars(rows,"4h")
        self.assertEqual(len(bars),60)
        r=run_one(rows,{"kind":"CASH","timeframe":"4h"})
        self.assertEqual(r["results"]["return_pct"],0)
        self.assertEqual(r["data"]["rows"],60)

    def test_compare_six_models_preserves_cash_and_inventory(self):
        rows=build_bars(1440)
        report=compare(rows,{"kind":"EMA_CROSS","timeframe":"15m","capital":1000})
        self.assertEqual(report["schema"],"seven.heaven.strategy_lab.comparison.v2")
        self.assertEqual(len(report["rows"]),6)
        self.assertEqual([r["kind"] for r in report["rows"]],list(ORDER))
        self.assertEqual(report["aggregated_candles"],96)
        self.assertEqual(report["safety"]["orders_real"],0)
        for row in report["rows"]:
            self.assertGreaterEqual(row["cash_final"],0)
            self.assertGreaterEqual(row["base_inventory_btc"],0)
            self.assertAlmostEqual(row["equity_final"],
                row["cash_final"]+row["base_inventory_btc"]*rows[-1][4],places=3)

    def test_custom_rules_can_be_compared_to_six_reference_models(self):
        rows=build_bars(6000)
        params={"kind":"CUSTOM_RULES","timeframe":"1h","capital":1000,
                "entry_rule":"PRICE_ABOVE_EMA","filter_rule":"NONE",
                "exit_rule":"PRICE_BELOW_EMA","stop_loss_pct":3}
        report=compare(rows,params)
        self.assertEqual([row["kind"] for row in report["rows"]],
                         list(ORDER)+["CUSTOM_RULES"])
        self.assertEqual(report["status"],"SEVEN_MODELS_PAPER_ONLY")
        self.assertEqual(report["safety"]["orders_real"],0)
        self.assertEqual(report["rows"][-1]["label"],"Stratégie personnalisée")
        baseline=compare(rows,{"kind":"EMA_CROSS","timeframe":"1h","capital":1000})
        self.assertEqual(report["rows"][:6],baseline["rows"])

    def test_dca_frequency_is_in_minutes_not_candle_counts(self):
        rows=build_bars(6000)
        report=run_one(rows,{"kind":"DCA","timeframe":"1h","capital":1000,
                                 "dca_every":1440,"dca_quote":50,"fee":0,"slippage":0})
        self.assertEqual(report["data"]["dca_requested_minutes"],1440)
        self.assertEqual(report["data"]["dca_effective_minutes"],1440)
        self.assertEqual(report["params"]["dca_every"],1440)
        self.assertEqual(report["results"]["buy_events"],5)
        self.assertEqual([t["timestamp"] for t in report["trades"]],
                         [rows[i][0] for i in (0,1440,2880,4320,5760)])

    def test_dca_fractional_window_rounded_up_not_expanded_by_factor(self):
        rows=build_bars(1440)
        report=run_one(rows,{"kind":"DCA","timeframe":"15m","capital":1000,
                                 "dca_every":20,"dca_quote":10})
        self.assertEqual(report["data"]["dca_effective_minutes"],30)

    def test_zero_cost_counterfactual_explicit_and_nonadditive(self):
        rows=build_bars(1440)
        result, diag=run_with_diagnostics(rows,{"kind":"HOLD_100","timeframe":"1m"})
        self.assertEqual(diag["status"],"COUNTERFACTUAL_IDEAL_FILLS_ONLY")
        self.assertTrue(diag["not_additive_fee_decomposition"])
        self.assertGreaterEqual(diag["zero_friction_equity_final"],
                                result["results"]["equity_final"])
        self.assertEqual(result["safety"]["orders_real"],0)

    def test_v1_archive_remains_listable(self):
        with TemporaryDirectory() as tmp:
            old=server.WORKSPACE
            try:
                server.WORKSPACE=Path(tmp)
                folder=server.WORKSPACE/"results"
                folder.mkdir()
                record={"id":"a"*32,"created_utc":"2026-11-13T06:52:00+00:00",
                        "run":{"params":{"kind":"EMA_CROSS"},
                               "results":{"return_pct":-92.2},
                               "data":{"pair":"BTC/USDT"}}}
                (folder/("a"*32+".json")).write_text(json.dumps(record))
                items=server._list_records("results")
                self.assertEqual(items[0]["timeframe"],"1m")
                self.assertEqual(items[0]["results"]["return_pct"],-92.2)
            finally:
                server.WORKSPACE=old

    def test_endpoints_do_not_include_live_trade(self):
        src=Path(server.__file__).read_text(encoding="utf-8")
        self.assertIn('"/api/compare"',src)
        self.assertNotIn('"/api/trade",',src)
        self.assertEqual(server.Handler.server_version,"SevenHeavenStrategyLab/4.1")


if __name__=="__main__":
    unittest.main()
