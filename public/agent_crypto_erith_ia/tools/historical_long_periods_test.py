#!/usr/bin/env python3
"""Offline backfill regression: 24 qualified owners, source gaps and integrity."""
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import backfill_historical_periods as m


def source_report():
    return {"market_snapshot_end_utc":"2026-10-09T12:00:00+00:00",
            "assets":[{"rank":i+1,"id":f"asset-{i}","symbol":f"T{i}",
                       "archived":True,"archive_owner":"top50",
                       "periods":{p:{"pair":f"T{i}USDT","quote":"USDT"}
                                  for p in ("24h","7d","30d")}}
                       for i in range(24)]}


def fetch(endpoint, args, gap=False):
    if endpoint.endswith("exchangeInfo"):
        symbol=args["symbol"]
        return {"symbols":[{"symbol":symbol,"baseAsset":symbol[:-4],
                "quoteAsset":"USDT","status":"TRADING",
                "isSpotTradingAllowed":True,"permissionSets":[["SPOT"]]}]}
    step=14_400_000 if args["interval"]=="4h" else 86_400_000
    count=args["limit"]
    if gap and args["symbol"]=="T0USDT" and count==540:
        count-=1
    return [[args["startTime"]+i*step,"10","12","9","11","3",
             args["startTime"]+(i+1)*step-1,"33",2,"0","0","0"]
            for i in range(count)]


class LongPeriodTests(unittest.TestCase):
    def test_complete_90d_and_year_and_no_fake_max(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)/"archive"
            with patch.object(m.coverage,"summarize",return_value=source_report()), (
                 patch.object(m,"get_json",side_effect=fetch)):
                result=m.collect(root,now_ms=1_800_000_000_000)
            self.assertEqual(result["state"],"VERIFIED")
            self.assertEqual(result["blocks"],48)
            index=json.loads((root/"index.json").read_bytes())
            self.assertEqual(index["max_status"],"NOT_AVAILABLE_FROM_THIS_SNAPSHOT")
            self.assertEqual(index["assets"][0]["long_periods"]["60d"]["status"],
                             "derived_from_90d")
            self.assertEqual(index["assets"][0]["long_periods"]["1y"]["status"],"verified")
            with self.assertRaisesRegex(ValueError,"never overwrite"):
                with patch.object(m.coverage,"summarize",return_value=source_report()):
                    m.collect(root,now_ms=1_800_000_000_000)
            first=root/index["blocks"][0]["file"]
            first.write_bytes(first.read_bytes()+b"tamper")
            with self.assertRaisesRegex(ValueError,"SHA-256"):
                m.validate(root)

    def test_incomplete_90d_uses_independent_verified_60d(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)/"archive"
            with patch.object(m.coverage,"summarize",return_value=source_report()), (
                 patch.object(m,"get_json",
                              side_effect=lambda p,a:fetch(p,a,gap=True))):
                result=m.collect(root,now_ms=1_800_000_000_000)
            self.assertEqual(result["state"],"VERIFIED")
            index=json.loads((root/"index.json").read_bytes())
            asset=index["assets"][0]
            self.assertEqual(asset["long_periods"]["90d"]["status"],"unavailable")
            self.assertEqual(asset["long_periods"]["60d"]["status"],"verified")
            self.assertFalse(any(x["asset_id"]=="asset-0" and x["period"]=="90d"
                                 for x in index["blocks"]))
            self.assertTrue(any(x["asset_id"]=="asset-0" and x["period"]=="60d"
                                for x in index["blocks"]))

    def test_unqualified_asset_produces_no_blocks(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)/"archive"
            def blocked(endpoint, params):
                if endpoint.endswith("exchangeInfo") and params["symbol"]=="T5USDT":
                    return {"symbols":[]}
                return fetch(endpoint, params)
            with patch.object(m.coverage,"summarize",return_value=source_report()), (
                 patch.object(m,"get_json",side_effect=blocked)):
                m.collect(root,now_ms=1_800_000_000_000)
            data=json.loads((root/"index.json").read_bytes())
            self.assertEqual(data["assets"][5]["instrument_status"],
                             "not_binance_spot_trading")
            self.assertFalse(any(x["asset_id"]=="asset-5" for x in data["blocks"]))
            self.assertEqual(m.validate(root)["archived_assets"],23)

    def test_unverified_pair_is_rejected_before_network(self):
        d=source_report()
        d["assets"][2]["periods"]["7d"]["pair"]="OTHERUSDT"
        with self.assertRaisesRegex(ValueError,"Unqualified"):
            m.candidates(d)
        d["assets"][2]["periods"]["7d"]["pair"]="T2USDT"
        d["assets"][0]["periods"]["24h"]["quote"]="USD"
        with self.assertRaisesRegex(ValueError,"No source pair"):
            m.candidates(d)


if __name__=="__main__":
    unittest.main(verbosity=2)
