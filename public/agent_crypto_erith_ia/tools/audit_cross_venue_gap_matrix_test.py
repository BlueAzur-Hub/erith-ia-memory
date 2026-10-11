#!/usr/bin/env python3
"""Offline evidence-gate tests for BTC 27 pauses and Top5 comparison windows."""
import json
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import TestCase,main
from unittest.mock import patch
from urllib.parse import urlparse,parse_qs

import audit_cross_venue_gap_matrix as m


class MatrixTests(TestCase):
    def test_27_original_btc_gaps_and_frozen_daily_reference(self):
        gaps,source_sha,reference_sha=m.expected_range()
        self.assertEqual(len(gaps),27)
        self.assertEqual(sum(v["missing"] for v in gaps),5881)
        self.assertEqual(len(source_sha),64)
        self.assertEqual(len(reference_sha),64)
        self.assertIn("2023-03-24",[v["day"] for v in gaps])

    def test_venue_specific_listing_and_suspension_policy(self):
        self.assertEqual(m.venue_policy("XRP","2021-08-13"),
                         "coinbase_xrp_trading_suspended")
        self.assertEqual(m.venue_policy("XRP","2023-03-24"),
                         "coinbase_xrp_trading_suspended")
        self.assertEqual(m.venue_policy("SOL","2020-12-21"),
                         "coinbase_not_yet_listed")
        self.assertEqual(m.venue_policy("BNB","2023-03-24"),
                         "historical_product_listing_unconfirmed")
        assets=[x["asset"] for x in m.tasks()]
        self.assertEqual(assets.count("BTC"),27)
        self.assertEqual(assets.count("ETH"),4)
        self.assertEqual(assets.count("BNB"),4)
        self.assertEqual(assets.count("XRP"),1)
        self.assertEqual(assets.count("SOL"),3)

    def test_coinbase_candle_outside_utc_is_excluded_but_validated(self):
        start=1679661600000
        a=[(start-m.M)//1000,1,3,2,2,1]
        b=[start//1000,1,3,2,2,4]
        c=[(start+m.M)//1000,1,3,2,2,3]
        rows,outside=m.parse_coinbase([a,b,c],start,start+m.M)
        self.assertEqual(outside,2)
        self.assertEqual(len(rows),1)
        self.assertEqual(rows[start][4],4)
        with self.assertRaisesRegex(ValueError,"Duplicated"):
            m.parse_coinbase([b,b],start,start+m.M)
        corrupted=[start//1000,1,1,2,2,4]
        with self.assertRaisesRegex(ValueError,"OHLCV"):
            m.parse_coinbase([corrupted],start,start+m.M)

    def test_exact_binance_quote_is_usdt_and_missing_cannot_be_inferred(self):
        s=1679661600000
        url=m.binance_url("BNB",s,s+m.M)
        params=parse_qs(urlparse(url).query)
        self.assertEqual(params["symbol"],["BNBUSDT"])
        self.assertEqual(params["interval"],["1m"])
        self.assertEqual(params["endTime"],[str(s)])
        def empty(u,p):return {"status":"http_200","json":[],"sha256":"a"*64}
        with patch.object(m.time,"sleep",return_value=None):
            x=m.check_market("BNB",s,s+m.M,"binance",empty)
        self.assertEqual(x["quote"],"USDT")
        self.assertEqual(x["candles_present"],0)
        self.assertEqual(x["status"],"verified_api_response")
        self.assertFalse(x["at_least_one_minute_traded"])

    def test_coinbase_http_unavailable_not_no_global_market(self):
        s=1679661600000
        def blocked(u,p):return {"status":"http_unavailable","http_status":404}
        x=m.check_market("ETH",s,s+m.M,"coinbase",blocked)
        self.assertEqual(x["status"],"inconclusive_api")
        self.assertEqual(x["positive_volume_minutes"],0)
        self.assertFalse(x["all_minutes_traded"])

    def test_kraken_exact_native_trade_is_positive_only_for_that_minute(self):
        s=1679661600000
        def provider(u,p):
            t=int(parse_qs(urlparse(u).query)["since"][0])//1_000_000
            return {"status":"http_200","sha256":"a"*64,
                    "json":{"error":[],"result":{"XXBTZUSD":[
                     ["27000.0","0.5",(t+1000)/1000,"s","m"]],
                     "last":str(t*1_000_000)}}}
        with patch.object(m.time,"sleep",return_value=None):
            a=m.probe_kraken("BTC",s,s+80*m.M,provider)
        self.assertEqual(a["sample_minutes_attempted"],3)
        self.assertEqual(a["exact_minute_positive_probes"],3)
        self.assertTrue(a["not_entire_interval_coverage"])

    def test_full_matrix_mock_preserves_venue_and_no_fabricated_history(self):
        def provider(u,prefix):
            qs=parse_qs(urlparse(u).query)
            if prefix==m.CBASE:
                st=qs["start"][0].replace("Z","+00:00")
                t=int(__import__("datetime").datetime.fromisoformat(st).timestamp())
                return {"status":"http_200","sha256":"a"*64,
                        "json":[[t,1,3,2,2,4]]}
            if prefix==m.BBASE:
                return {"status":"http_200","sha256":"b"*64,"json":[]}
            if prefix==m.KBASE:
                return {"status":"http_unavailable","http_status":404}
            raise AssertionError("Bad upstream venue")
        with TemporaryDirectory() as temp:
            with patch.object(m.time,"sleep",return_value=None):
                r=m.perform(output=Path(temp)/"index.json",request=provider)
            saved=json.loads((Path(temp)/"index.json").read_text())
        self.assertEqual(len(r["rows"]),39)
        self.assertEqual(r["summary"]["BTC"]["windows"],27)
        self.assertEqual(r["summary"]["ETH"]["windows"],4)
        self.assertEqual(r["summary"]["BNB"]["windows"],4)
        self.assertEqual(r["summary"]["XRP"]["windows"],1)
        self.assertEqual(r["summary"]["SOL"]["windows"],3)
        self.assertEqual(r["btc_expected_gap_minutes"],5881)
        self.assertEqual(r["btc_gap_windows_total"],27)
        self.assertEqual(sum(x["window_calendar_minutes"] for x in r["rows"]
                 if x["asset"]=="BTC"),5881)
        self.assertEqual(saved["policy"],m.POLICY)
        self.assertFalse(saved["trader_modified"])
        self.assertFalse(saved["original_sources_modified"])
        for x in r["rows"]:
            self.assertEqual(x["coinbase"]["quote"],"USD")
            if x["binance_alt"]:self.assertEqual(x["binance_alt"]["quote"],"USDT")
            if x["kraken"]:self.assertEqual(x["kraken"]["quote"],"USD")


if __name__=="__main__":main(verbosity=2)
