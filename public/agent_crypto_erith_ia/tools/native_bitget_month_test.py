#!/usr/bin/env python3
"""Offline proof: a Bitget month is exactly all native one-minute SPOT rows."""
import csv
import hashlib
import io
import json
from pathlib import Path
import tempfile
import unittest
import zipfile
import urllib.parse

import collect_native_bitget_month as m

ASSET={"id":"cosmos","rank":75,"symbol":"ATOM",
       "pair":"ATOMUSDT","quote":"USDT","venue":"bitget"}

def correct(pair,start,end,count):
    assert pair=="ATOMUSDT"
    assert end-start==count*m.STEP
    return ([[str(start+i*m.STEP),"10.000","12.000","9.000","11.000",
             "2.000","20.000"] for i in range(count)],"a"*64)

class NativeBitgetMonthTests(unittest.TestCase):
    def test_immutable_exact_43200_rows_and_seven_authentic_columns(self):
        with tempfile.TemporaryDirectory() as temp:
            output=Path(temp)
            result=m.execute_one(ASSET,"2026-09",output,
                                 fetcher=correct,delay=0)
            self.assertEqual(result["verified"],1)
            self.assertEqual(result["candles"],43200)
            self.assertTrue(result["not_exchange_signed"])
            self.assertTrue(result["no_synthetic_candles"])
            entry=result["assets"][0]
            self.assertEqual(len(entry["raw_api_response_sha256"]),44)
            self.assertEqual(entry["source"],m.SOURCE)
            raw=(output/entry["file"]).read_bytes()
            self.assertEqual(hashlib.sha256(raw).hexdigest(),entry["sha256"])
            with zipfile.ZipFile(io.BytesIO(raw)) as archive:
                self.assertEqual(archive.namelist(),["ATOMUSDT-1m-2026-09.csv"])
                with archive.open("ATOMUSDT-1m-2026-09.csv") as stream:
                    rows=list(csv.reader(io.TextIOWrapper(stream)))
            self.assertEqual(len(rows),43200)
            self.assertTrue(all(len(row)==7 for row in rows))
            self.assertEqual(rows[0][0],str(m.bounds("2026-09")[0]))
            self.assertEqual(rows[-1][0],str(m.bounds("2026-09")[1]-m.STEP))
            result2=m.execute_one(ASSET,"2026-09",output,
                                  fetcher=correct,delay=0)
            self.assertEqual(result2["assets"][0]["sha256"],entry["sha256"])

    def test_one_incomplete_recent_page_falls_back_to_authentic_history(self):
        first=m.bounds("2026-09")[0]
        def insufficient_recent(pair,start,end,count):
            rows,sha=correct(pair,start,end,count)
            return (rows[:-1] if start==first else rows),sha
        history=[]
        def exact_history(pair,start,end,count):
            history.append((start,count))
            self.assertLessEqual(count,100)
            return correct(pair,start,end,count)
        with tempfile.TemporaryDirectory() as work:
            result=m.execute_one(ASSET,"2026-09",Path(work),
                        fetcher=insufficient_recent,delay=0,
                        historical_fetcher=exact_history)
            self.assertEqual(result["verified"],1)
            self.assertEqual(len(history),10)
            self.assertEqual(len(result["assets"][0]["raw_api_response_sha256"]),53)

    def test_missing_duplicate_wrong_quote_or_bad_value_halts(self):
        start,_,_=m.bounds("2026-09")
        good=[[str(start+i*m.STEP),"10","12","9","11","2","20"]
              for i in range(5)]
        for bad in [good[:-1],good[:4]+[good[3]],
                    good[:4]+[[str(start+4*m.STEP),"10","8","9","11","2","20"]],
                    good[:4]+[[str(start+4*m.STEP),"10","12","9","11","nan","20"]]]:
            with self.assertRaises(ValueError):
                m.verify_page(bad,start,5)
        with self.assertRaisesRegex(ValueError,"exact-ID"):
            m.verified_month({**ASSET,"quote":"USDC"},"2026-09",
                             fetcher=correct,delay=0)

    def test_bad_second_page_never_creates_partial_archive(self):
        def broken(pair,start,end,count):
            rows,digest=correct(pair,start,end,count)
            if start>m.bounds("2026-09")[0]:
                rows.pop()
            return rows,digest
        with tempfile.TemporaryDirectory() as temp:
            with self.assertRaisesRegex(ValueError,"Historical Bitget 1m page rejected"):
                m.execute_one(ASSET,"2026-09",Path(temp),
                              fetcher=broken,historical_fetcher=broken,delay=0)
            self.assertEqual(list(Path(temp).iterdir()),[])

    def test_history_and_recent_api_boundaries_are_distinct(self):
        start=m.bounds("2026-09")[0]
        end=start+100*m.STEP
        requested=[]
        class FakeResponse(io.BytesIO):
            status=200
            def __enter__(self):return self
            def __exit__(self,*args):self.close()
        def fake_open(req,timeout):
            parsed=urllib.parse.urlparse(req.full_url)
            params=urllib.parse.parse_qs(parsed.query)
            requested.append((parsed.path,int(params["startTime"][0]),
                              int(params["endTime"][0])))
            return FakeResponse(b'{"code":"00000","data":[]}')
        for endpoint in (m.API,m.HISTORY_API):
            rows,digest=m.fetch_page("ATOMUSDT",start,end,100,
                                      opener=fake_open,endpoint=endpoint)
            self.assertEqual(rows,[])
            self.assertEqual(len(digest),64)
        self.assertEqual(requested,[
            ("/api/v3/market/candles",start-m.STEP,end-m.STEP),
            ("/api/v3/market/history-candles",start,end)])
        with self.assertRaisesRegex(ValueError,"Unsafe native"):
            m.fetch_page("ATOMUSDT",start,end,101,
                         opener=fake_open,endpoint=m.HISTORY_API)

    def test_closed_month_and_release_identity(self):
        self.assertEqual(m.bounds("2026-09")[2],43200)
        self.assertEqual(m.release_tag(ASSET,"2026-09"),
                         "crypto-spot-bitget-2026-09-1m-cosmos")
        for unsafe in ({**ASSET,"pair":"BTCUSDT"},
                       {**ASSET,"id":"../../bad"},
                       {**ASSET,"symbol":"ATOM;rm"}):
            with self.assertRaises(ValueError):
                m.release_tag(unsafe,"2026-09")
        with self.assertRaises(ValueError):
            m.bounds("2026-13")

    def test_no_unsupported_id_claims_from_current_proof(self):
        src=json.loads(m.proof.CATALOG.read_text())
        alt=json.loads(m.proof.EXACT.read_text())
        venue=json.loads(m.proof.INSTRUMENTS.read_text())
        matches=m.proof.candidates(src,alt,venue)
        self.assertTrue(all(a["pair"]==a["symbol"]+"USDT"
                            and a["venue"]=="bitget" for a in matches))
        self.assertTrue(all(not next(c for c in src["assets"]
                           if c["id"]==a["id"])["months"] for a in matches))

if __name__=="__main__":
    unittest.main(verbosity=2)
