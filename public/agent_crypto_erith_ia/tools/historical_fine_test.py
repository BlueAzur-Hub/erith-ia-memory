#!/usr/bin/env python3
"""Offline regressions for source-qualified DOGE 5m UTC daily archive."""
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import collect_historical_fine as fine


def good_source():
    return {"assets":[{"id":"dogecoin","symbol":"DOGE","archived":True,
             "periods":{name:{"pair":"DOGEUSDT","quote":"USDT"}
                        for name in ("24h","7d","30d")}}]}


def mock_binance(endpoint, args):
    if endpoint.endswith("exchangeInfo"):
        return {"symbols":[{"symbol":"DOGEUSDT","baseAsset":"DOGE",
                 "quoteAsset":"USDT","status":"TRADING",
                 "isSpotTradingAllowed":True,"permissionSets":[["SPOT"]]}]}
    assert endpoint.endswith("klines") and args["symbol"] == "DOGEUSDT"
    assert args["interval"] == "5m" and args["limit"] == 288
    start=args["startTime"]
    return [[start+i*fine.STEP, "10", "12", "9", "11", "8",
             start+(i+1)*fine.STEP-1, "88", 3, "0", "0", "0"]
            for i in range(288)]


class FineHistoryTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root=Path(self.tmp.name)/"doge-5m"
        self.now=1_800_000_000_000
        self.source=patch.object(fine.coverage,"summarize",return_value=good_source())
        self.network=patch.object(fine,"get_json",side_effect=mock_binance)
        self.source.start();self.network.start()
        self.addCleanup(self.network.stop);self.addCleanup(self.source.stop)

    def bootstrap(self,days=3):
        return fine.collect(self.root,"bootstrap",days,self.now)

    def test_closed_full_utc_days_have_real_5m_candles_and_sha256(self):
        result=self.bootstrap()
        self.assertEqual(result["status"],"VERIFIED")
        self.assertEqual(result["new_candles"],864)
        self.assertEqual(result["new_blocks"],3)
        idx=json.loads((self.root/"index.json").read_bytes())
        self.assertEqual(idx["max_status"],"NOT_REACHED_OR_PROVEN")
        self.assertEqual(idx["quote"],"USDT")
        self.assertTrue(all(b["candles"]==288 for b in idx["blocks"]))
        self.assertEqual(len(list((self.root/"blocks").glob("*.json.gz"))),3)

    def test_append_is_continuous_and_never_duplicates(self):
        self.bootstrap(1)
        later=self.now+fine.DAY*2
        result=fine.collect(self.root,"append",2,later)
        self.assertEqual(result["new_candles"],576)
        self.assertEqual(fine.verify(self.root)["blocks"],3)
        self.assertEqual(fine.collect(self.root,"append",2,later)["status"],"NOOP")

    def test_backward_history_keeps_old_immutable_blocks(self):
        self.bootstrap(2)
        baseline=json.loads((self.root/"index.json").read_bytes())
        first=baseline["blocks"][0]
        raw=(self.root/first["file"]).read_bytes()
        result=fine.collect(self.root,"backfill",3,self.now)
        self.assertEqual(result["new_blocks"],3)
        self.assertEqual(fine.verify(self.root)["blocks"],5)
        self.assertEqual((self.root/first["file"]).read_bytes(),raw)

    def test_immutable_restart_refuses_second_bootstrap(self):
        self.bootstrap(1)
        with self.assertRaisesRegex(ValueError,"never reset"):
            self.bootstrap(1)

    def test_sha256_tampering_refused(self):
        self.bootstrap(1)
        idx=json.loads((self.root/"index.json").read_bytes())
        block=self.root/idx["blocks"][0]["file"]
        block.write_bytes(block.read_bytes()+b"tamper")
        with self.assertRaisesRegex(ValueError,"SHA-256"):
            fine.verify(self.root)

    def test_gap_in_index_refused(self):
        self.bootstrap(3)
        idx=json.loads((self.root/"index.json").read_bytes())
        idx["blocks"].pop(1)
        idx["verified_blocks"]-=1
        idx["verified_candles"]-=fine.COUNT
        (self.root/"index.json").write_text(json.dumps(idx))
        with self.assertRaisesRegex(ValueError,"gap"):
            fine.verify(self.root)

    def test_wrong_coingecko_identity_refused_before_network(self):
        self.source.stop()
        with patch.object(fine.coverage,"summarize",return_value={"assets":[]}):
            with self.assertRaisesRegex(ValueError,"cannot prove pilot identity"):
                fine.collect(self.root,"bootstrap",1,self.now)
        self.source.start()

    def test_bad_spot_trading_pair_refused(self):
        def fake(endpoint,args):
            if endpoint.endswith("exchangeInfo"):return {"symbols":[]}
            return mock_binance(endpoint,args)
        self.network.stop()
        with patch.object(fine,"get_json",side_effect=fake):
            with self.assertRaisesRegex(ValueError,"No unique"):
                fine.collect(self.root,"bootstrap",1,self.now)
        self.network.start()

    def test_cap_and_future_incomplete_days_are_refused(self):
        with self.assertRaisesRegex(ValueError,"Invalid bounded"):
            fine.ranges(self.root,"bootstrap",31,self.now)
        with self.assertRaisesRegex(ValueError,"Invalid bounded"):
            fine.ranges(self.root,"bootstrap",0,self.now)
        self.bootstrap(1)
        self.assertEqual(fine.collect(self.root,"append",5,self.now)["status"],"NOOP")


if __name__=="__main__":
    unittest.main(verbosity=2)
