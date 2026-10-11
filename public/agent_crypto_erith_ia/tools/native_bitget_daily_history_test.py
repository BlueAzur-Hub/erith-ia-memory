#!/usr/bin/env python3
"""Fail-closed native Bitget 1D archive and exact-ID provenance tests."""
import datetime as dt
import hashlib
import json
import unittest
from unittest.mock import patch
import collect_native_bitget_daily_history as m

def owner():
    return {"id":"memecore","rank":47,"symbol":"M","pair":"MUSDT",
            "quote":"USDT","venue":"bitget"}

class DailyHistoryTests(unittest.TestCase):
    def test_native_rows_and_true_unfilled_gaps(self):
        t=m.START
        def fetch(pair,start,end):
            self.assertEqual(pair,"MUSDT")
            sample=[]
            for day in (0,2):
                ts=t+day*m.DAY
                if start<=ts<end:
                    sample.append([str(ts),"10.0","12.0","9.0","11.0","2","21"])
            return sample,"a"*64
        with patch.object(m,"START",m.END-5*m.DAY):
            d=m.acquire(owner(),fetcher=fetch)
        self.assertEqual(d["native_candles"],2)
        self.assertEqual(d["calendar_days_without_native_bars"],1)
        self.assertFalse(d["filled_by_our_collector"])
        self.assertFalse(d["canonical_1m_federation_modified"])
        self.assertEqual(len(d["native_daily_rows"]),2)
        self.assertEqual(d["quote"],"USDT")
        self.assertEqual(d["native_interval"],"1D")
        self.assertEqual(m.compress(d),m.compress(d))

    def test_fail_wrong_native_price_timestamp_and_duplicate(self):
        ts=m.END-3*m.DAY
        good=[str(ts),"2.0","3","1","2","1","2"]
        for bad in ([str(ts+1),*good[1:]],
                    [good[0],"2","1","3","2","1","2"],
                    [good[0],"2","3","1","2","nan","2"]):
            with self.assertRaises(ValueError):m.parse_row(bad)
        def repeat(pair,start,end):
            return [good,good],"b"*64
        with patch.object(m,"START",m.END-5*m.DAY):
            with self.assertRaisesRegex(ValueError,"Repeated"):
                m.acquire(owner(),fetcher=repeat)

    def test_native_historical_window_and_quote_bounds(self):
        ts=m.END-4*m.DAY
        good=[str(ts),"2","3","1","2","1","2"]
        with self.assertRaisesRegex(ValueError,"Invalid bounded"):
            m.request_page("MUSDT",m.START,m.END)
        for changed in ({"quote":"USD"},{"venue":"okx"},
                        {"pair":"../MUSDT"}):
            with patch.object(m,"START",m.END-5*m.DAY):
                with self.assertRaises(ValueError):
                    m.acquire({**owner(),**changed},fetcher=lambda *args:([good],"a"*64))

    def test_no_network_publication_or_empty_release(self):
        with patch.object(m,"qualified_assets",return_value=[]):
            with self.assertRaisesRegex(ValueError,"No native"):
                m.collect([])
        with self.assertRaisesRegex(ValueError,"only by reviewed"):
            with patch.dict("os.environ",{"GITHUB_ACTIONS":"false"},clear=True):
                m.publish([],[])

if __name__=="__main__":
    unittest.main(verbosity=2)
