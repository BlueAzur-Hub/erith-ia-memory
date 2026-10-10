#!/usr/bin/env python3
"""Fail-closed Bitget native 1m offline tests: samples NEVER archival claims."""
import hashlib
import io
import json
import unittest
import urllib.parse
import probe_native_bitget_spot as m

def records():
    catalog={"ranked":250,"assets":[
        {"id":"token-"+str(i),"rank":i,"symbol":"K"+str(i),"months":[]}
        for i in range(1,251)]}
    catalog["assets"][74]={"id":"cosmos","rank":75,"symbol":"ATOM","months":[]}
    catalog["assets"][83]={"id":"lighter","rank":84,"symbol":"LIT","months":[]}
    exact={"schema":"aerith.public.ohlcv.spot.top250.alt-market-discovery.v1",
           "ranked":250,"results":[
        {"id":"cosmos","rank":75,"symbol":"ATOM",
         "status":"exact_id_market_candidates",
         "markets":[{"coin_id":"cosmos","base":"ATOM","exchange":"bitget",
                     "quote":"USDT","market_pair_candidate":"ATOMUSDT"}]},
        {"id":"lighter","rank":84,"symbol":"LIT",
         "status":"exact_id_market_candidates",
         "markets":[{"coin_id":"wrong-coin","base":"LIT","exchange":"bitget",
                     "quote":"USDT","market_pair_candidate":"LITUSDT"}]}]}
    spot={"schema":"aerith.public.ohlcv.spot.top250.official-instrument-candidates.v1",
          "ranked":250,"assets":[
        {"id":"cosmos","rank":75,"symbol":"ATOM","instruments":[
            {"venue":"bitget","instrument":"ATOMUSDT","base":"ATOM",
             "quote":"USDT","exchange_instrument_confirmed":True}]},
        {"id":"lighter","rank":84,"symbol":"LIT","instruments":[
            {"venue":"bitget","instrument":"LITUSDT","base":"LIT",
             "quote":"USDT","exchange_instrument_confirmed":True}]}]}
    return catalog,exact,spot

def candles(size=1000):
    return [[str(m.START_MS + i*m.STEP), "10", "12", "9", "11", "3", "33"]
            for i in range(size)]

class NativeBitgetProbeTests(unittest.TestCase):
    def test_two_independent_source_id_gates_and_no_leap_from_symbol(self):
        cat,exact,spot=records()
        self.assertEqual([x["id"] for x in m.candidates(cat,exact,spot)],["cosmos"])
        exact["results"][0]["markets"][0]["coin_id"]="wrong-coin"
        self.assertEqual(m.candidates(cat,exact,spot),[])
        exact["results"][0]["markets"][0]["coin_id"]="cosmos"
        cat["assets"][74]["months"]=[{"month":"2026-09"}]
        self.assertEqual(m.candidates(cat,exact,spot),[])

    def test_complete_one_thousand_native_minutes_but_not_month(self):
        result=m.normalized_window(list(reversed(candles())))
        self.assertEqual(result["sample_count"],1000)
        self.assertTrue(result["complete_sample_window"])
        cat,exact,spot=records()
        p=m.probe(cat,exact,spot,fetcher=lambda pair:(
            {"code":"00000","data":candles()},"a"*64))
        self.assertEqual(p["complete_samples"],1)
        self.assertEqual(p["full_native_months_archived"],0)
        self.assertFalse(p["is_historical_archive"])
        self.assertFalse(p["assets"][0]["full_native_1m_month_verified"])

    def test_missing_duplicate_wrong_time_and_invalid_ohlcv_rejected(self):
        for records in (
            candles(1000)[:5]+candles(1000)[6:],
            candles(1000)[:5]+[candles(1000)[4]]+candles(1000)[5:],
            [[str(m.START_MS-60000),"10","12","9","11","3","33"]],
            [[str(m.START_MS),"10","7","9","11","3","33"]],
            [[str(m.START_MS),"10","12","9","11","NaN","33"]]):
            with self.assertRaises(ValueError):
                m.normalized_window(records)
        self.assertFalse(m.normalized_window(candles(60))["complete_sample_window"])

    def test_source_failure_is_recorded_and_no_write_claim(self):
        cat,exact,spot=records()
        def denied(pair):raise OSError("HTTP 429")
        p=m.probe(cat,exact,spot,fetcher=denied)
        self.assertEqual(p["complete_samples"],0)
        self.assertEqual(p["assets"][0]["status"],"source_unavailable")
        self.assertEqual(p["full_native_months_archived"],0)

    def test_temporal_diagnostic_does_not_approve_wrong_window(self):
        cat,exact,spot=records()
        wrong=[[str(m.START_MS+42*m.STEP),"10","12","9","11","3","33"],
               [str(m.END_MS),"10","12","9","11","3","33"]]
        probe=m.probe(cat,exact,spot,fetcher=lambda pair:(
            {"code":"00000","data":wrong},"b"*64))
        row=probe["assets"][0]
        self.assertEqual(row["status"],"source_unavailable")
        self.assertEqual(row["observed_first_ms"],m.START_MS+42*m.STEP)
        self.assertEqual(row["observed_last_ms"],m.END_MS)
        self.assertEqual(row["observed_in_window"],1)
        self.assertEqual(probe["full_native_months_archived"],0)

    def test_bitget_start_is_exclusive_and_end_is_inclusive(self):
        class FakeResponse(io.BytesIO):
            status=200
            def __enter__(self):return self
            def __exit__(self,*args):self.close()
        def open_exact(request,timeout):
            self.assertEqual(timeout,35)
            parsed=urllib.parse.urlparse(request.full_url)
            self.assertEqual(parsed.scheme+"//"+parsed.netloc+parsed.path.replace(
                "/", "/",1),"https//api.bitget.com/api/v3/market/candles")
            values=urllib.parse.parse_qs(parsed.query)
            self.assertEqual(values["startTime"],[str(m.START_MS-m.STEP)])
            self.assertEqual(values["endTime"],[str(m.END_MS-m.STEP)])
            self.assertEqual(values["category"],["SPOT"])
            self.assertEqual(values["interval"],["1m"])
            self.assertEqual(values["limit"],["1000"])
            return FakeResponse(json.dumps({"code":"00000","data":candles()}).encode())
        payload,sha=m.fetch("ATOMUSDT",opener=open_exact)
        self.assertEqual(len(sha),64)
        self.assertEqual(m.normalized_window(payload["data"])["sample_count"],1000)

    def test_real_registry_offline_integrity(self):
        actual=json.loads(m.CATALOG.read_text())
        alt=json.loads(m.EXACT.read_text())
        spot=json.loads(m.INSTRUMENTS.read_text())
        chosen=m.candidates(actual,alt,spot)
        self.assertTrue(all(x["quote"]=="USDT" and x["venue"]=="bitget" for x in chosen))
        self.assertTrue(all(not next(a for a in actual["assets"] if a["id"]==x["id"])["months"]
                            for x in chosen))
        self.assertLessEqual(len(chosen),250)

if __name__=="__main__":
    unittest.main(verbosity=2)
