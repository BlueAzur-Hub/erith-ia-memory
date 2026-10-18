"""Tests du bilan Spot Q/ICNT/FLUID, sans réseau ni exécution."""
import datetime as dt
import json
import pathlib
import tempfile
import unittest
from build_radar_priority_spot_comparison import build, publish, summarize, MARKETS, SCHEMA

def record(symbol, id_, venue, pair, at, close_at, price, spread):
    return {"at_utc":at, "coin_id":id_, "symbol":symbol, "venue":venue,
            "market":pair, "instrument_type":"SPOT", "quote":"USDT",
            "paper_only":True, "executed_order":False,
            "candles":{"last_closed_hour_utc":close_at, "close_usdt":price,
                       "last_21_bars_contiguous":True,"change_close_20h_pct":1.25},
            "book":{"spread_bps":spread, "bid_top20_notional_usdt":1100.,
                    "ask_top20_notional_usdt":1200.}}

def state(market, items):
    symbol, ident, venue, pair, path, schema=market
    return {"schema":schema,"coin_id":ident,"market":pair,"quote":"USDT",
            "paper_only":True,"orders_enabled":False,"executed_order":False,
            "last_observed_at":items[-1]["at_utc"],
            "recent_observations":items}

def mk(market, count=2):
    symbol, ident, venue, pair, path, schema=market
    start=dt.datetime(2026,10,17,1,tzinfo=dt.timezone.utc)
    items=[]
    for i in range(count):
        close=start+dt.timedelta(hours=i*6)
        at=close+dt.timedelta(hours=1,minutes=9)
        iso=lambda d:d.isoformat(timespec="seconds").replace("+00:00","Z")
        items.append(record(symbol,ident,venue,pair,iso(at),iso(close),
                            0.12+i*.01,8+i*2))
    return state(market,items)

class Tests(unittest.TestCase):
    def test_real_pair_identity_and_usdt_preserved(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=pathlib.Path(tmp)
            for market in MARKETS:
                dest=root/market[4]; dest.parent.mkdir(parents=True,exist_ok=True)
                dest.write_text(json.dumps(mk(market))+"\n")
            report=build(root)
            self.assertEqual(report["schema"],SCHEMA)
            self.assertEqual([x["symbol"] for x in report["markets"]],["Q","ICNT","FLUID"])
            self.assertEqual(report["quote"],"USDT")
            self.assertFalse(report["strategy_validated"])
            for row in report["markets"]:
                self.assertEqual(row["observation_count"],2)
                self.assertEqual(row["change_between_observed_closes_pct"],8.33333)
                self.assertEqual(row["span_between_closed_hours"],6)
                self.assertFalse(row["ready_for_window_research"])
                self.assertEqual(row["spread_delta_bps"],2)
            output=root/"report.json"
            self.assertTrue(publish(report,output))
            self.assertFalse(publish(report,output))
    def test_missing_markets_cannot_grow_fake_history(self):
        with tempfile.TemporaryDirectory() as tmp:
            row=build(pathlib.Path(tmp))
        self.assertEqual(sum(x["observation_count"] for x in row["markets"]),0)
        self.assertTrue(all(x["status"]=="NO_PROSPECTIVE_OBSERVATIONS"
                            and x["change_between_observed_closes_pct"] is None for x in row["markets"]))
    def test_repeated_same_hour_is_not_a_second_price_move(self):
        market=MARKETS[0]; obj=mk(market,2)
        obj["recent_observations"][1]["candles"]["last_closed_hour_utc"]=obj["recent_observations"][0]["candles"]["last_closed_hour_utc"]
        info=summarize(*market,(obj,json.dumps(obj).encode()))
        self.assertEqual(info["distinct_closed_hours"],1)
        self.assertIsNone(info["change_between_observed_closes_pct"])
    def test_bad_identity_and_unsafe_fills_rejected(self):
        market=MARKETS[1]
        for change in (
            lambda s:s.update(quote="USD"),
            lambda s:s["recent_observations"][0].update(coin_id="other-token"),
            lambda s:s.update(executed_order=True),
            lambda s:s["recent_observations"][1]["book"].update(spread_bps=float("nan")),
        ):
            obj=mk(market)
            change(obj)
            with self.assertRaises(ValueError):
                summarize(*market,(obj,json.dumps(obj).encode()))
    def test_research_eligibility_never_claims_a_strategy(self):
        market=MARKETS[2]; obj=mk(market,6)
        info=summarize(*market,(obj,json.dumps(obj).encode()))
        self.assertTrue(info["ready_for_window_research"])
        self.assertFalse(info["paper_strategy_validated"])
        self.assertFalse(info["identity_market_pair_certified"])
if __name__=="__main__":
    unittest.main()
