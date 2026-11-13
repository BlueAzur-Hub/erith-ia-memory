"""V4.4 trade forensic proof: exact fill replay, OHLC excursions, cost ledger."""
import copy
import math
import unittest

from src.engine import LabError
from src.observatory import run_one
from src.forensics import diagnose, _one_position


def fixture(kind="EMA_CROSS", *, rows=720, extra=None):
    candles=[]
    for i in range(rows):
        o=2100+100*math.sin((i-1)/15)+i*.03
        c=2100+100*math.sin(i/15)+i*.03
        candles.append((1767225600+i*3600,o,max(o,c)+3,min(o,c)-3,c,
                        10+(i%7)))
    source={"id":"OKX_ETH_USDC_1H_PAPER_FIXTURE","sha256":"b"*64,
            "exchange":"OKX Spot","pair":"ETH/USDC",
            "base":"ETH","quote":"USDC","source_timeframe":"1h"}
    params={"kind":kind,"capital":1000,"timeframe":"1h",
            "fee":0.001,"slippage":0.0005,
            "ema_fast":10,"ema_slow":30,
            **(extra or {})}
    run=run_one(candles,params,source_timeframe="1h")
    run["data"]["source_id"]=source["id"]
    run["data"]["source_sha256"]=source["sha256"]
    record={"id":"a"*32,"source_sha256":source["sha256"],
            "source":source,"run":run}
    return record,candles,source


class V44TradeDecisionForensics(unittest.TestCase):
    def test_all_original_fills_and_equity_replay_exactly_with_documented_causes(self):
        record,bars,source=fixture()
        before=copy.deepcopy(record)
        result=diagnose(record,bars,source)
        self.assertEqual(result["status"],"DETERMINISTIC_REPLAY_MATCHES_SAVED_PAPER_FILLS")
        self.assertEqual(result["source"]["pair"],"ETH/USDC")
        self.assertEqual(result["source"]["sha256"],source["sha256"])
        self.assertEqual(result["metrics"]["total_original_fills_verified"],
                         len(record["run"]["trades"]))
        self.assertEqual(result["metrics"]["closed_positions"],
                         record["run"]["analytics"]["closed_positions"])
        self.assertAlmostEqual(result["metrics"]["realized_net_pnl_quote"],
                               record["run"]["analytics"]["realized_pnl_quote"],places=2)
        self.assertEqual(result["safety"]["orders_real"],0)
        self.assertEqual(record,before)
        for p in result["positions_latest_first"]:
            self.assertEqual(p["base_unit"],"ETH")
            self.assertIn("RECONSTRUCTED_CAUSAL_TRIGGER",p["explanation_status"])
            for e in p["entries"]:
                self.assertEqual(e["reason_code"],"EMA_CROSS_UP")
                self.assertEqual(e["signal_bar_open_utc"]+3600,e["utc"])
                self.assertIn("ema_fast",e["signal_context"])
            if p["exit"]:
                self.assertEqual(p["exit"]["reason_code"],"EMA_CROSS_DOWN")
                self.assertEqual(p["exit"]["signal_bar_open_utc"]+3600,
                                 p["exit"]["utc"])

    def test_previous_versions_without_trace_reconstruct_causes_no_disk_upgrade(self):
        record,bars,source=fixture("CUSTOM_RULES",extra={
            "entry_rule":"EMA_CROSS_UP","exit_rule":"EMA_CROSS_DOWN",
            "filter_rule":"NONE"})
        for fill in record["run"]["trades"]:
            fill.pop("reason_code",None)
            fill.pop("signal_bar_open_utc",None)
            fill.pop("signal_context",None)
        before=copy.deepcopy(record)
        report=diagnose(record,bars,source)
        self.assertEqual(record,before)
        self.assertTrue(any(t["reason_code"].startswith("RULE_EMA_CROSS_UP")
                            for pos in report["positions_latest_first"]
                            for t in pos["entries"]))
        self.assertTrue(all(p["exit"]["reason_code"].startswith("RULE_EMA_CROSS_DOWN")
                            for p in report["positions_latest_first"] if p["exit"]))

    def test_dca_open_multiple_entries_and_open_pnl_not_claimed_closed(self):
        record,bars,source=fixture("DCA",rows=200,extra={
            "dca_every":60,"dca_quote":40,"capital":1000})
        report=diagnose(record,bars,source)
        self.assertEqual(report["metrics"]["open_positions"],1)
        self.assertEqual(report["metrics"]["closed_positions"],0)
        self.assertEqual(report["metrics"]["winning_closed_positions"],0)
        position=report["positions_latest_first"][0]
        self.assertEqual(position["status"],"OPEN")
        self.assertGreater(position["entry_count"],1)
        self.assertIsNone(position["price_excursion"])
        self.assertIsNone(position["closed_utc"])
        self.assertTrue(all(e["reason_code"]=="DCA_PERIODIC_ALLOCATION"
                            for e in position["entries"]))
        self.assertEqual(position["exit_reason_code"],None)

    def test_exits_ignore_exit_candle_wick_after_hypothetical_open(self):
        source={"base":"ETH","quote":"USDC"}
        candles=[
            (100,100,105,95,102,3),
            (200,102,110,96,105,3),
            (300,105,999,1,200,3),  # massive wick AFTER assumed exit at OPEN
        ]
        opening={"timestamp":100,"side":"BUY","price":100.05,"qty":1,
                 "fee":0.1,"reason_code":"EMA_CROSS_UP",
                 "signal_bar_open_utc":None,"signal_context":{}}
        closing={"timestamp":300,"side":"SELL","price":104.95,"qty":1,
                 "fee":0.1,"reason_code":"EMA_CROSS_DOWN",
                 "signal_bar_open_utc":200,"signal_context":{}}
        audit=_one_position([opening],closing,candles,{100:0,200:1,300:2},source)
        self.assertEqual(audit["holding_bars"],2)
        self.assertEqual(audit["price_excursion"]["highest_wick"],110)
        self.assertEqual(audit["price_excursion"]["lowest_wick"],95)
        self.assertNotEqual(audit["price_excursion"]["highest_wick"],999)
        self.assertNotEqual(audit["price_excursion"]["lowest_wick"],1)

    def test_stop_uses_last_close_not_wick_and_shows_composite_causes_when_applicable(self):
        bars=[]
        for i in range(200):
            px=100+i*.6 if i<100 else 160-(i-100)*1.1
            prev=100+(i-1)*.6 if i<=100 else 160-(i-101)*1.1
            bars.append((1767225600+i*3600,prev,max(prev,px)+2,
                         min(prev,px)-2,px,1.0))
        source={"id":"OKX_ETH_1H_RISK","sha256":"f"*64,
                "exchange":"OKX Spot","pair":"ETH/USDC",
                "base":"ETH","quote":"USDC","source_timeframe":"1h"}
        run=run_one(bars,{
            "kind":"CUSTOM_RULES","timeframe":"1h",
            "ema_fast":10,"ema_slow":30,"entry_rule":"PRICE_ABOVE_EMA",
            "exit_rule":"RSI_ABOVE","rsi_exit_min":99,
            "stop_loss_pct":0.8,"capital":1000,
        },source_timeframe="1h")
        run["data"].update({"source_id":source["id"],"source_sha256":source["sha256"]})
        saved={"id":"a"*32,"run":run,"source":source,"source_sha256":source["sha256"]}
        audited=diagnose(saved,bars,source)
        self.assertTrue(any(p["exit"] and "STOP_ON_PREVIOUS_CLOSE" in p["exit_reason_code"]
                            for p in audited["positions_latest_first"]))
        for p in audited["positions_latest_first"]:
            if p["exit"] and "STOP_ON_PREVIOUS_CLOSE" in p["exit_reason_code"]:
                t=p["exit"]
                self.assertEqual(t["signal_bar_open_utc"]+3600,t["utc"])
                self.assertLessEqual(t["signal_context"]["last_closed_price"],
                                     t["signal_context"]["position_entry"]*(1-0.008))

    def test_sha_or_fill_or_capital_discrepancy_rejected(self):
        record,bars,source=fixture()
        wrong={**source,"sha256":"c"*64}
        with self.assertRaisesRegex(LabError,"SHA-256"):
            diagnose(record,bars,wrong)
        changed=copy.deepcopy(record)
        changed["run"]["trades"][0]["price"]+=.15
        with self.assertRaisesRegex(LabError,"diffère"):
            diagnose(changed,bars,source)
        changed2=copy.deepcopy(record)
        changed2["run"]["results"]["equity_final"]+=1.0
        with self.assertRaisesRegex(LabError,"capital final"):
            diagnose(changed2,bars,source)
        changed3=copy.deepcopy(record)
        changed3["run"]["data"]["last_utc"]=0
        with self.assertRaisesRegex(LabError,"fenêtre historique"):
            diagnose(changed3,bars,source)

    def test_classic_strategy_reason_codes_not_buy_signal_at_initial_allocation(self):
        for kind,expected in (("HOLD_50","BUY_AND_HOLD_INITIAL_ALLOCATION"),
                              ("BOLLINGER","BOLLINGER_CLOSE_BELOW_LOWER")):
            with self.subTest(kind=kind):
                rec,bars,source=fixture(kind)
                r=diagnose(rec,bars,source)
                if r["positions_latest_first"]:
                    entries=[e for p in r["positions_latest_first"] for e in p["entries"]]
                    self.assertTrue(all(e["reason_code"]==expected for e in entries))
                    if kind=="HOLD_50":
                        self.assertTrue(all(e["signal_bar_open_utc"] is None for e in entries))


if __name__=="__main__":
    unittest.main()
