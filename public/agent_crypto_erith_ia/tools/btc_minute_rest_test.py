#!/usr/bin/env python3
"""Offline tests: official Binance REST BTC minute audit; zero synthetic klines."""
import gzip
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch
from urllib.parse import parse_qs, urlparse

import audit_btc_minute_rest as m


def row(t):
    return [t, "100.00", "101.00", "99.00", "100.50",
            "2.00", t+59999, "201.00", 7, "1.00", "100.50", "0"]


class RestAndTrades(unittest.TestCase):
    def test_canonical_3075_day_reference_and_5881_missing_minutes_protected(self):
        months, days, proof = m.previous.ledger()
        ref = m.freeze.build()
        self.assertEqual(len(days),26)
        self.assertEqual(len(months),21)
        self.assertEqual(sum(map(len,days.values())),5881)
        self.assertEqual(ref["utc_day_count"],3075)
        self.assertFalse(ref["one_minute_complete"])
        self.assertEqual(ref["locked_source"]["data_sha256"],
                         proof["daily_reference_sha256"])

    def test_segments_cover_every_missing_timestamp_once(self):
        _,days,_=m.previous.ledger()
        for date,ts in days.items():
            pieces=m.segments(ts)
            self.assertEqual(sum(p[2] for p in pieces),len(ts))
            self.assertTrue(all(1<=p[2]<=996 for p in pieces))
            self.assertTrue(all((p[1]-p[0])//60000==p[2] for p in pieces))
        self.assertEqual(sum(len(m.segments(x)) for x in days.values()),
                         sum(len(m.segments(x)) for x in days.values()))

    def test_rest_endpoint_exactly_btcusdt_utc_1m_and_bounded(self):
        _,days,_=m.previous.ledger()
        t=min(days["2023-03-24"])
        url=m.api_url(t,t+60000)
        x=urlparse(url)
        p=parse_qs(x.query)
        self.assertEqual(x.netloc,"data-api.binance.vision")
        self.assertEqual(p["interval"],["1m"])
        self.assertEqual(p["symbol"],["BTCUSDT"])
        self.assertEqual(p["limit"],["1000"])
        self.assertEqual(int(p["startTime"][0]),t-60000)
        self.assertEqual(int(p["endTime"][0]),t+60000)
        with self.assertRaisesRegex(ValueError,"Unbounded"):
            m.api_url(t,t+1000*60000)

    def test_native_price_and_trade_ohlcv_must_be_valid(self):
        _,days,_=m.previous.ledger()
        t=min(days["2023-03-24"])
        valid=m.verify_api_rows([row(t)],t,t+60000)
        self.assertEqual(len(valid),1)
        self.assertEqual(valid[t][0],t)
        corrupted=row(t);corrupted[2]="98.0"
        with self.assertRaisesRegex(ValueError,"Invalid native 1m price"):
            m.verify_api_rows([corrupted],t,t+60000)
        with self.assertRaisesRegex(ValueError,"duplicate"):
            m.verify_api_rows([row(t),row(t)],t,t+60000)

    def test_no_data_from_api_remains_unresolved_not_fabricated(self):
        def empty(_):
            return {"status":"api_200","rows":[],"response_sha256":"a"*64,"bytes":2}
        def probe(d,k):
            return {"date":d,"kind":k,"status":"head_inconclusive",
                    "downloaded_or_verified_trades":False}
        with TemporaryDirectory() as tmp:
            ix=m.run(output=tmp,fetch=empty,probe=probe)
            self.assertEqual(ix["rest_native_1m_accepted"],0)
            self.assertEqual(ix["still_missing_or_not_certified"],5881)
            self.assertEqual(ix["api_inconclusive_requested_minutes"],0)
            self.assertEqual(len(ix["trade_archives_inventory"]),52)
            self.assertEqual(ix["trade_archives_downloaded"],0)
            self.assertEqual(ix["trade_candles_reconstructed"],0)
            candidate=gzip.decompress((Path(tmp)/ix["candidate_file"]).read_bytes())
            self.assertEqual(len(json.loads(candidate)["rows"]),0)

    def test_api_unavailable_cannot_be_mislabeled_as_empty_market_history(self):
        def blocked(_):
            return {"status":"http_unavailable","http_status":451,"rows":[]}
        def probe(d,k):
            return {"date":d,"kind":k,"status":"head_restricted",
                    "http_status":403,"downloaded_or_verified_trades":False}
        with TemporaryDirectory() as tmp:
            ix=m.run(output=tmp,fetch=blocked,probe=probe)
        self.assertEqual(ix["rest_native_1m_accepted"],0)
        self.assertEqual(ix["still_missing_or_not_certified"],5881)
        self.assertEqual(ix["api_inconclusive_requested_minutes"],5881)
        self.assertTrue(all(q["admission"]=="inconclusive_api_unavailable"
                            for q in ix["requests"]))

    def test_one_real_api_minute_needs_matching_original_month_witness(self):
        months,days,_=m.previous.ledger()
        t=min(days["2018-06-26"])
        matching=row(t-60000)
        candidate=row(t)
        def fake(url):
            p=parse_qs(urlparse(url).query)
            start=int(p["startTime"][0])+60000
            end=int(p["endTime"][0])
            if start <= t < end:
                return {"status":"api_200","rows":[matching,candidate],
                        "response_sha256":"f"*64,"bytes":250}
            return {"status":"api_200","rows":[],"response_sha256":"b"*64,"bytes":2}
        def orig_ok(entry,tmp):
            return ({t-60000:m.previous.valid_row(matching,t-60000,t)},
                    {"source_zip_sha256":entry["source_zip_sha256"]})
        def probe(d,k):
            return {"date":d,"kind":k,"status":"head_not_found",
                    "http_status":404,"downloaded_or_verified_trades":False}
        with TemporaryDirectory() as tmp:
            ix=m.run(output=tmp,fetch=fake,probe=probe,check_original=orig_ok)
            payload=json.loads(gzip.decompress((Path(tmp)/ix["candidate_file"]).read_bytes()))
        self.assertEqual(ix["rest_native_1m_accepted"],1)
        self.assertEqual(ix["still_missing_or_not_certified"],5880)
        self.assertEqual(payload["rows"][0][0],t)
        self.assertEqual(payload["synthetic_rows"],0)
        self.assertFalse(ix["accepted_minutes_applied_to_1m_source"])


if __name__=="__main__":
    unittest.main(verbosity=2)
