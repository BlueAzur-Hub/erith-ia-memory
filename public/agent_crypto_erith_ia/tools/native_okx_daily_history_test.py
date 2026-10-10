#!/usr/bin/env python3
"""Offline provenance and no-synthetic-bar tests for original OKX daily history."""
import hashlib
import gzip
import json
import unittest
import collect_native_okx_daily_history as m

def fake_sources():
    records=[{"id":f"item-{i}","rank":i,"symbol":f"C{i}",
              "name":f"Coin {i}","source":None,"months":0,"quote":"USDT"}
             for i in range(1,251)]
    sources=[]
    for cid,rank,symbol,name,_ in m.SPECS:
        records[rank-1]={"id":cid,"rank":rank,"symbol":symbol,"name":name,
                         "source":None,"months":0,"quote":"USDT"}
        sources.append({"id":cid,"rank":rank,"symbol":symbol,
                        "instruments":[{"venue":"okx","instrument":symbol+"-USDT",
                         "base":symbol,"quote":"USDT",
                         "exchange_instrument_confirmed":True}]})
    return ({"schema":"aerith.public.ohlcv.top250.federated-native-archives.v1",
             "ranked":250,"assets":records},
            {"schema":"aerith.public.ohlcv.spot.top250.official-instrument-candidates.v1",
             "ranked":250,"assets":sources})

def bar(stamp,confirmed="1",vol="5"):
    return [str(stamp),"12","14","11","13",vol,"60","65",confirmed]

class NativeOKXDailyTests(unittest.TestCase):
    def test_exact_owners_and_public_spot_market_are_both_required(self):
        fed,venue=fake_sources()
        own=m.assets(fed,venue)
        self.assertEqual([o["id"] for o in own],["okb","crypto-com-chain"])
        self.assertEqual([o["instrument"] for o in own],["OKB-USDT","CRO-USDT"])
        fed["assets"][41]["symbol"]="OTHER"
        with self.assertRaisesRegex(ValueError,"identity changed"):
            m.assets(fed,venue)
        fed,venue=fake_sources()
        venue["assets"][0]["instruments"][0]["exchange_instrument_confirmed"]=False
        with self.assertRaisesRegex(ValueError,"public OKX"):
            m.assets(fed,venue)
        fed,venue=fake_sources()
        fed["assets"][38]["months"]=1
        with self.assertRaisesRegex(ValueError,"Source already archived"):
            m.assets(fed,venue)

    def test_full_native_day_preserves_quote_and_source_text(self):
        fed,venue=fake_sources()
        owner=m.assets(fed,venue)[0]
        pages=[]
        def fetch(pair,before):
            pages.append((pair,before))
            if before==m.END:
                return [bar(m.END-m.DAY),bar(m.END-2*m.DAY)],"a"*64
            if before==m.END-2*m.DAY:
                return [bar(m.END-3*m.DAY)],"b"*64
            return [],"c"*64
        result=m.acquire(owner,fetcher=fetch)
        self.assertEqual(result["native_candles"],3)
        self.assertEqual(result["calendar_days_without_native_bars"],0)
        self.assertTrue(result["source_exhausted_within_query_bounds"])
        self.assertTrue(result["exchange_may_emit_zero_trade_candles"])
        self.assertFalse(result["filled_by_our_collector"])
        self.assertEqual(result["quote"],"USDT")
        self.assertEqual(result["native_interval"],"1Dutc")
        self.assertEqual(len(pages),3)
        packed=m.compress(result)
        self.assertEqual(packed,m.compress(result))
        self.assertEqual(json.loads(gzip.decompress(packed))["native_candles"],3)
        self.assertEqual(len(result["native_source_response_sha256"]),3)

    def test_missing_daily_bar_is_not_interpolated(self):
        owner=m.assets(*fake_sources())[0]
        def fetch(pair,before):
            if before==m.END:
                return [bar(m.END-m.DAY),bar(m.END-3*m.DAY)],"d"*64
            return [],"e"*64
        proof=m.acquire(owner,fetch)
        self.assertEqual(proof["native_candles"],2)
        self.assertTrue(proof["has_source_gaps"])
        self.assertEqual(proof["calendar_days_without_native_bars"],1)
        self.assertEqual(len(proof["native_daily_rows"]),2)
        self.assertFalse(proof["genesis_or_first_exchange_trade_proven"])

    def test_bad_ohlc_incomplete_or_outside_daily_timestamp_refused(self):
        stamp=m.END-m.DAY
        for row in (
           bar(stamp,confirmed="0"),
           bar(stamp,vol="-1"),
           [str(stamp),"12","10","11","13","5","60","65","1"],
           bar(stamp+60000),
           bar(m.END),
           [str(stamp),"NaN","14","11","13","5","60","65","1"],
        ):
            with self.subTest(row=row):
                with self.assertRaises(ValueError):
                    m.validate(row,m.END)

    def test_duplicate_page_rows_and_bad_cursor_fail_closed(self):
        owner=m.assets(*fake_sources())[0]
        with self.assertRaisesRegex(ValueError,"newest-first"):
            m.acquire(owner,lambda p,c:([bar(m.END-m.DAY),bar(m.END-2*m.DAY),
                                        bar(m.END-m.DAY)],"f"*64))
        with self.assertRaisesRegex(ValueError,"source HTTP response digest"):
            m.acquire(owner,lambda p,c:([bar(m.END-m.DAY)],"0"))
        with self.assertRaisesRegex(ValueError,"No native OKX"):
            m.acquire(owner,lambda p,c:([],"c"*64))

    def test_cannot_mix_candle_periods_or_dollar_quotes(self):
        with self.assertRaisesRegex(ValueError,"Unsafe OKX"):
            m.request_page("OKB-USD",m.END)
        with self.assertRaisesRegex(ValueError,"Unsafe OKX"):
            m.request_page("OKB-USDT",m.END+m.DAY)

if __name__=="__main__":
    unittest.main(verbosity=2)
