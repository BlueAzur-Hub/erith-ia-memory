#!/usr/bin/env python3
"""Offline checks for native KuCoin BNB/USDT historic independent candles."""
import json
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import TestCase,main
from unittest.mock import patch
from urllib.parse import parse_qs,urlparse

import audit_kucoin_bnb_sol_outages as m


class KuCoinEvidence(TestCase):
    def test_native_kucoin_spot_source_is_pair_and_interval_specific(self):
        t=1679661600000
        a=m.url("BNB",t,t+m.base.M)
        q=parse_qs(urlparse(a).query)
        self.assertEqual(q["symbol"],["BNB-USDT"])
        self.assertEqual(q["type"],["1min"])
        self.assertEqual(q["startAt"],[str(t//1000)])
        self.assertEqual(q["endAt"],[str((t+m.base.M-1)//1000)])
        with self.assertRaisesRegex(ValueError,"Invalid KuCoin source"):
            m.url("BTC",t,t+m.base.M)

    def test_native_kucoin_usdt_ohlcv_exact_timestamp_and_volume(self):
        t=1679661600000
        rows={"code":"200000","data":[
         [str(t//1000),"320","325","330","315","10.01","3290"],
         [str((t+m.base.M)//1000),"321","325","330","315","12","3900"]]}
        market,extra=m.parse(rows,t,t+m.base.M)
        self.assertEqual(len(market),1)
        self.assertEqual(extra,1)
        self.assertEqual(market[t][4],10.01)
        with self.assertRaisesRegex(ValueError,"Invalid KuCoin original OHLCV"):
            m.parse({"code":"200000","data":[[
               str(t//1000),"320","325","310","315","10","3290"]]},
               t,t+m.base.M)

    def test_exchange_denial_never_treated_as_no_global_trading(self):
        def unavailable(url,p):
            return {"status":"http_unavailable","http_status":403}
        t=1679661600000
        result,_=m.verify("BNB",t,t+m.base.M,unavailable)
        self.assertEqual(result["conclusion"],"source_inconclusive")
        self.assertEqual(result["quote"],"USDT")

    def test_five_targeted_windows_bnb4_sol1_and_cross_exchange_immutability(self):
        def mock(url,prefix):
            qs=parse_qs(urlparse(url).query)
            if prefix==m.ENDPOINT:
                t=int(qs["startAt"][0])
                return {"status":"http_200","sha256":"a"*64,
                   "json":{"code":"200000","data":[[
                    str(t),"320","325","330","315","10","3290"]]}}
            if prefix==m.base.CBASE:
                t=int(m.base.datetime.fromisoformat(
                      qs["start"][0].replace("Z","+00:00")).timestamp())
                return {"status":"http_200","sha256":"b"*64,"json":[
                  [t,310,340,315,320,5]]}
            raise AssertionError("Wrong independent venue")
        with TemporaryDirectory() as td:
            output=Path(td)/"index.json"
            doc=m.audit(output=output,fetch=mock)
            saved=json.loads(output.read_text())
        self.assertEqual(len(doc["samples"]),5)
        self.assertEqual(doc["summary"]["BNB"]["windows"],4)
        self.assertEqual(doc["summary"]["SOL"]["windows"],1)
        self.assertTrue(doc["quote_separated"])
        self.assertTrue(doc["no_synthetic_minutes"])
        self.assertTrue(all(x["kucoin"]["quote"]=="USDT" for x in doc["samples"]))
        self.assertEqual(saved["schema"],"seven.crypto.kucoin-bnb-sol-source-crosscheck.v1")


if __name__=="__main__":main(verbosity=2)
