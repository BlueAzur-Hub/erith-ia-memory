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
    def test_never_archive_an_asset_already_in_minute_or_daily(self):
        cohort=[owner(),{**owner(),"id":"another","rank":50,
                          "symbol":"X","pair":"XUSDT"}]
        minute={"schema":"aerith.public.ohlcv.top250.federated-native-archives.v1",
                "ranked":250,"assets":[{"id":f"dummy-{i}","rank":i,
                      "symbol":f"T{i}","quote":"USDT","months":0}
                      for i in range(1,251)]}
        minute["assets"][46]={"id":"memecore","rank":47,"symbol":"M",
                              "quote":"USDT","months":0}
        minute["assets"][49]={"id":"another","rank":50,"symbol":"X",
                              "quote":"USDT","months":1}
        daily={"schema":"aerith.public.crypto.multiresolution-sources.v1",
               "asset_count":0,"assets":[]}
        self.assertEqual([a["id"] for a in
                          m.filter_unarchived(cohort,minute,daily)],["memecore"])
        daily["assets"]=[{"id":"memecore"}]
        daily["asset_count"]=1
        self.assertEqual(m.filter_unarchived(cohort,minute,daily),[])

    def test_single_character_bitget_owner_proven_by_two_independent_sources(self):
        rows=[{"id":f"other-{i}","rank":i,"symbol":f"T{i}",
               "quote":"USDT","months":0} for i in range(1,251)]
        led=[];spot=[]
        for cid,rank,sym in m.SINGLE_SYMBOL_OWNERS:
            rows[rank-1]={"id":cid,"rank":rank,"symbol":sym,
                          "quote":"USDT","months":0}
            led.append({"id":cid,"rank":rank,"symbol":sym,
                        "status":"exact_id_market_candidates",
                        "markets":[{"exchange":"bitget","coin_id":cid,
                                    "base":sym,"quote":"USDT",
                                    "market_pair_candidate":sym+"USDT"}]})
            spot.append({"id":cid,"rank":rank,"symbol":sym,
                         "instruments":[{"venue":"bitget","base":sym,
                                         "quote":"USDT",
                                         "instrument":sym+"USDT",
                                         "exchange_instrument_confirmed":True}]})
        cat={"ranked":250,"assets":rows}
        identity={"schema":"aerith.public.ohlcv.spot.top250.alt-market-discovery.v1",
                  "results":led}
        instruments={"schema":"aerith.public.ohlcv.spot.top250.official-instrument-candidates.v1",
                     "assets":spot}
        found=m.single_symbol_candidates(cat,identity,instruments)
        self.assertEqual([a["id"] for a in found],
            ["memecore","united-stables","build-on","quack-ai","humanity"])
        self.assertEqual([a["pair"] for a in found],
            ["MUSDT","UUSDT","BUSDT","QUSDT","HUSDT"])
        # An ambiguous one-letter ticker, wrong market identity or a
        # missing independent official instrument must refuse acquisition.
        cat["assets"][0]["symbol"]="M"
        with self.assertRaisesRegex(ValueError,"ambiguous"):
            m.single_symbol_candidates(cat,identity,instruments)
        cat["assets"][0]["symbol"]="T1"
        identity["results"][0]["markets"][0]["coin_id"]="unrelated"
        with self.assertRaisesRegex(ValueError,"exact-ID"):
            m.single_symbol_candidates(cat,identity,instruments)
        identity["results"][0]["markets"][0]["coin_id"]="memecore"
        instruments["assets"][0]["instruments"][0]["exchange_instrument_confirmed"]=False
        with self.assertRaisesRegex(ValueError,"Bitget Spot instrument"):
            m.single_symbol_candidates(cat,identity,instruments)

    def test_named_project_bitget_spot_sources_must_pass_independent_venue_proof(self):
        rows=[{"id":f"dummy-{i}","rank":i,"symbol":f"Z{i}",
               "name":"Other","quote":"USDT","months":0}
              for i in range(1,251)]
        official=[]
        for cid,rank,sym,name,notice in m.NAMED_SPOT_PROOFS:
            rows[rank-1]={"id":cid,"rank":rank,"symbol":sym,
                          "name":name,"quote":"USDT","months":0}
            official.append({"id":cid,"rank":rank,"symbol":sym,
                             "instruments":[{"venue":"bitget","base":sym,
                                "quote":"USDT","instrument":sym+"USDT",
                                "exchange_instrument_confirmed":True}]})
        c={"schema":"aerith.public.ohlcv.top250.federated-native-archives.v1",
           "ranked":250,"assets":rows}
        s={"schema":"aerith.public.ohlcv.spot.top250.official-instrument-candidates.v1",
           "assets":official}
        proven=m.named_spot_candidates(c,s)
        self.assertEqual([a["id"] for a in proven],
            ["usdgo","vision-3"])
        self.assertTrue(all("/support/articles/" in a["identity_evidence"]
                            for a in proven))
        c["assets"][68]["name"]="Another token"
        with self.assertRaisesRegex(ValueError,"CoinGecko identity"):
            m.named_spot_candidates(c,s)
        c["assets"][68]["name"]="USDGO"
        s["assets"][0]["instruments"][0]["instrument"]="WRONGUSDT"
        with self.assertRaisesRegex(ValueError,"Spot pair"):
            m.named_spot_candidates(c,s)

    def test_archived_named_owner_does_not_require_stale_candidate_instrument(self):
        rows=[{"id":f"other-{i}","rank":i,"symbol":f"Z{i}",
               "name":"Other","quote":"USDT","months":0}
              for i in range(1,251)]
        for cid,rank,sym,name,notice in m.NAMED_SPOT_PROOFS:
            rows[rank-1]={"id":cid,"rank":rank,"symbol":sym,
                          "name":name,"quote":"USDT","months":0}
        rows[68]["months"]=1
        minute={"schema":"aerith.public.ohlcv.top250.federated-native-archives.v1",
                "ranked":250,"assets":rows}
        daily={"schema":"aerith.public.crypto.multiresolution-sources.v1",
               "asset_count":1,"assets":[{"id":"vision-3"}]}
        # Both already exist. Official census may legitimately exclude them.
        official={"schema":"aerith.public.ohlcv.spot.top250.official-instrument-candidates.v1",
                  "assets":[]}
        named=m.named_spot_candidates(minute,official,daily)
        self.assertEqual(named,[])
        self.assertEqual(m.filter_unarchived(named,minute,daily),[])
        # A corrupted owner must still be rejected even if archived.
        minute["assets"][68]["symbol"]="WRONG"
        with self.assertRaisesRegex(ValueError,"CoinGecko identity"):
            m.named_spot_candidates(minute,official,daily)
        minute["assets"][68]["symbol"]="USDGO"
        daily["assets"].append({"id":"vision-3"})
        with self.assertRaisesRegex(ValueError,"native-daily"):
            m.named_spot_candidates(minute,official,daily)

    def test_empty_archived_cohort_never_fetches_or_republishes(self):
        with patch.object(m,"qualified_assets",return_value=[]):
            with patch.object(m,"collect",side_effect=AssertionError("network")):
                with patch.object(m,"publish",side_effect=AssertionError("release")):
                    for mode in ("--probe","--publish"):
                        with self.subTest(mode=mode),patch("sys.argv",
                                ["collect_native_bitget_daily_history.py",mode]):
                            m.main()

    def test_native_rows_and_true_unfilled_gaps(self):
        t=m.END-5*m.DAY
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

    def test_original_bitget_utc_plus_eight_daily_session_is_preserved(self):
        # Native 1D Spot rows can start at 00:00 local UTC+8, i.e. 16:00 UTC.
        stamp=m.END-4*m.DAY+16*60*60*1000
        self.assertEqual(m.parse_row([str(stamp),"2","3","1","2","4","8"])[0],
                         stamp)
        def fetch(pair,start,end):
            if start<=stamp<end:
                return [[str(stamp),"2","3","1","2","4","8"]],"f"*64
            return [],"e"*64
        with patch.object(m,"START",m.END-7*m.DAY):
            x=m.acquire(owner(),fetcher=fetch)
        self.assertEqual(x["native_session_start_modulo_utc_day_ms"],57600000)
        self.assertEqual(x["native_daily_rows"][0][0],str(stamp))
        self.assertTrue(x["native_daily_timezone_not_normalized"])

    def test_out_of_requested_window_is_excluded_never_reassigned(self):
        # Upstream Bitget history may return more than the requested range.
        stamp=m.END-3*m.DAY+57600000
        outside=m.END-8*m.DAY+57600000
        def fetch(pair,start,end):
            rows=[[str(outside),"2","3","1","2","4","8"],
                  [str(stamp),"2","3","1","2","4","8"]]
            return rows,"c"*64
        with patch.object(m,"START",m.END-5*m.DAY):
            data=m.acquire(owner(),fetcher=fetch)
        self.assertEqual(data["native_candles"],1)
        self.assertGreaterEqual(data["out_of_window_native_rows_excluded"],1)
        self.assertEqual(data["native_daily_rows"][0][0],str(stamp))

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
