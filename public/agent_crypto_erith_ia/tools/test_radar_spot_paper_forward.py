#!/usr/bin/env python3
"""No-network scenario: entry quote is not a fill, exit only at future dated bid."""
import datetime as dt
import pathlib
import sys
import unittest
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from radar_spot_paper_forward import advance, empty

UTC=dt.timezone.utc


def snapshot(day="2026-10-20", t="08:17:00", ask="0.4", bid="0.399",
             address="0x"+"1"*40, proven=True, qualified="08:16:00"):
    time=day+"T"+t+"Z"
    qualified_at=day+"T"+qualified+"Z"
    slots=[{"coin_id":"quack-ai","symbol":"Q","venue":"Bitget","pair":"QUSDT",
            "quote":"USDT","platform":"ethereum","contract_address":address,
            "identity_proven":proven,"paper_entry_decision":"AWAIT_NEXT_DATED_BOOK_AND_COST_CHECK",
            "min_order_usdt":"5"}]
    slots.extend({"coin_id":"other-"+str(i),"identity_proven":False} for i in range(19))
    cand=[{"id":"quack-ai","market":{"provider":"Bitget","pair":"QUSDT","quote":"USDT",
                "book":{"best_bid_usdt":bid,"best_ask_usdt":ask,"spread_bps":25,
                        "exchange_timestamp_verified":True,
                        "observed_at_utc":day+"T08:15:00Z"}}}]
    cand.extend({"id":"other-"+str(i),"market":None} for i in range(19))
    identity={"schema":"erith.radar.spot-identity-prospective.v1",
              "collected_at_utc":time,"source_radar_day_utc":day,
              "qualification_at_utc":qualified_at,"paper_orders":0,"real_orders":0,
              "orders_enabled":False,"candidates":slots}
    qualification={"schema":"erith.radar.spot-qualification.v1",
                   "qualified_at_utc":qualified_at,"source_observation_date_utc":day,
                   "real_orders_enabled":False,"priority_research_ids":["quack-ai"],
                   "candidates":cand}
    return identity,qualification,dt.datetime.fromisoformat(time.replace("Z","+00:00"))


class Tests(unittest.TestCase):
    def test_entry_then_exit_after_48h_uses_future_bid_only(self):
        one,qual,at=snapshot()
        s=advance(one,qual,empty(),at)
        self.assertEqual(len(s["positions"]),1)
        self.assertEqual(s["paper_fills"],0)
        self.assertEqual(s["real_orders"],0)
        self.assertIsNone(s["positions"][0]["realized_profit_usdt"])
        self.assertEqual(s["positions"][0]["entry_ask_usdt"],"0.4")
        next_day,q2,at2=snapshot(day="2026-10-21",ask="0.51",bid="0.5")
        s2=advance(next_day,q2,s,at2)
        self.assertEqual(len(s2["positions"]),1)
        self.assertEqual(len(s2["closures"]),0)
        last,q3,at3=snapshot(day="2026-10-22",ask="0.51",bid="0.5")
        s3=advance(last,q3,s2,at3)
        self.assertEqual(len(s3["positions"]),0)
        self.assertEqual(len(s3["closures"]),1)
        closed=s3["closures"][0]
        self.assertEqual(closed["exit_bid_usdt"],"0.5")
        self.assertEqual(closed["status"],"HYPOTHETICAL_CLOSED_NO_FILL")
        self.assertGreater(float(closed["hypothetical_pnl_usdt"]),0)
        self.assertIsNone(closed["realized_profit_usdt"])
        self.assertFalse(closed["executed_order"])
        self.assertEqual(s3["paper_fills"],0)
        self.assertEqual(s3["real_orders"],0)

    def test_same_observation_cannot_count_twice(self):
        i,q,at=snapshot()
        s=advance(i,q,empty(),at)
        with self.assertRaisesRegex(ValueError,"relecture"):
            advance(i,q,s,at)

    def test_future_or_stale_data_fail_closed(self):
        i,q,at=snapshot()
        with self.assertRaisesRegex(ValueError,"périmées"):
            advance(i,q,empty(),at+dt.timedelta(minutes=20))
        q["qualified_at_utc"]="2026-10-19T08:16:00Z"
        with self.assertRaisesRegex(ValueError,"dates différentes"):
            advance(i,q,empty(),at)

    def test_unproven_contract_cannot_open(self):
        i,q,at=snapshot(proven=False)
        s=advance(i,q,empty(),at)
        self.assertEqual(s["positions"],[])

    def test_wrong_or_missing_future_identity_cannot_close(self):
        i,q,at=snapshot()
        s=advance(i,q,empty(),at)
        next_,q2,at2=snapshot(day="2026-10-22",address="0x"+"2"*40)
        t=advance(next_,q2,s,at2)
        self.assertEqual(len(t["positions"]),1)
        self.assertEqual(len(t["closures"]),0)

    def test_book_requires_exchange_time_and_spread(self):
        i,q,at=snapshot()
        q["candidates"][0]["market"]["book"]["exchange_timestamp_verified"]=False
        self.assertEqual(advance(i,q,empty(),at)["positions"],[])
        i,q,at=snapshot()
        q["candidates"][0]["market"]["book"]["spread_bps"]=180
        self.assertEqual(advance(i,q,empty(),at)["positions"],[])

    def test_reported_narrow_spread_cannot_hide_wide_real_book(self):
        i,q,at=snapshot(ask="0.4",bid="0.1")
        # Source claims 25bps, actual spread is thousands of basis points.
        self.assertEqual(q["candidates"][0]["market"]["book"]["spread_bps"],25)
        self.assertEqual(advance(i,q,empty(),at)["positions"],[])

    def test_accepted_spread_is_recomputed_from_original_bid_ask(self):
        i,q,at=snapshot(ask="0.4",bid="0.399")
        positions=advance(i,q,empty(),at)["positions"]
        self.assertEqual(len(positions),1)
        expected=(0.4-0.399)*20000/(0.4+0.399)
        self.assertAlmostEqual(float(positions[0]["entry_spread_bps"]),
                               expected,places=4)

    def test_no_retroactive_entry_from_price_or_old_book(self):
        i,q,at=snapshot()
        q["candidates"][0]["market"]["book"]["observed_at_utc"]="2026-10-19T08:15:00Z"
        self.assertEqual(advance(i,q,empty(),at)["positions"],[])
        i,q,at=snapshot()
        i["candidates"][0]["min_order_usdt"]="120"
        self.assertEqual(advance(i,q,empty(),at)["positions"],[])


if __name__=="__main__":
    unittest.main()
