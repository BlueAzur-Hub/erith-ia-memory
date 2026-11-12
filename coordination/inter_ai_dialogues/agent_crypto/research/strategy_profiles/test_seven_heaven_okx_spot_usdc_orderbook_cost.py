"""Seven Heaven offline tests: public OKX BTC/USDC + ETH/USDC snapshot math.
No network, no authentication and no actual orders.
"""
import hashlib
import importlib.util
import io
import json
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

FILE=Path(__file__).with_name("SEVEN_HEAVEN_OKX_SPOT_BTC_ETH_USDC_ORDERBOOK_ONE_SHOT_2026_11_12.py")
spec=importlib.util.spec_from_file_location("seven_okx_book_research",FILE)
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


def example(now, ask_levels=None, bid_levels=None):
    ask_levels=ask_levels or [["100.0","1","0","1"],["101.0","10","0","1"]]
    bid_levels=bid_levels or [["99.0","1","0","1"],["98.0","10","0","1"]]
    return {"code":"0","msg":"","data":[{
        "ts":str(int(now.timestamp()*1000)),
        "asks":ask_levels,"bids":bid_levels
    }]}


class CostMath(unittest.TestCase):
    def test_best_spread_and_zero_walk_small_order(self):
        now=datetime.now(timezone.utc)
        data=mod.analyse_book(example(now),"BTC-USDC",now)
        spread=(Decimal("100")-Decimal("99"))/(Decimal("199")/2)*10000
        self.assertAlmostEqual(data["spread_bps"],float(spread),places=5)
        first=data["amounts"][0]
        self.assertEqual(first["buy"]["book_levels_consumed"],1)
        self.assertEqual(first["sell"]["book_levels_consumed"],1)
        self.assertAlmostEqual(first["buy"]["beyond_half_spread_bps"],0,places=5)
        self.assertAlmostEqual(first["sell"]["beyond_half_spread_bps"],0,places=5)

    def test_walk_and_insufficient_depth(self):
        now=datetime.now(timezone.utc)
        data=mod.analyse_book(example(now),"ETH-USDC",now)
        one_thousand=next(x for x in data["amounts"] if x["notional_usdc"]=="1000")
        self.assertEqual(one_thousand["buy"]["status"],"complete")
        self.assertGreater(one_thousand["buy"]["beyond_half_spread_bps"],0)
        self.assertGreater(one_thousand["sell"]["beyond_half_spread_bps"],0)
        large=next(x for x in data["amounts"] if x["notional_usdc"]=="100000")
        self.assertEqual(large["buy"]["status"],"insufficient_visible_depth")
        self.assertEqual(large["sell"]["status"],"insufficient_visible_depth")

    def test_rejects_crossed_book_and_stale_timestamp(self):
        now=datetime.now(timezone.utc)
        crossed=example(now,ask_levels=[["99","3"]],bid_levels=[["100","3"]])
        with self.assertRaises(ValueError):
            mod.analyse_book(crossed,"ETH-USDC",now)
        stale=example(datetime(2025,1,1,tzinfo=timezone.utc))
        with self.assertRaises(ValueError):
            mod.analyse_book(stale,"ETH-USDC",now)

    def test_one_shot_preserves_original_api_bytes_and_pair(self):
        def fake_urlopen(request,timeout):
            self.assertEqual(request.get_method(),"GET")
            self.assertIn("instId=BTC-USDC",request.full_url)
            self.assertIn("sz=400",request.full_url)
            raw=json.dumps(example(datetime.now(timezone.utc))).encode()
            fake_urlopen.raw=raw
            return io.BytesIO(raw)
        with tempfile.TemporaryDirectory() as d:
            with patch.object(mod,"urlopen",side_effect=fake_urlopen):
                result=mod.one_pair("BTC-USDC",Path(d))
            self.assertEqual(result["status"],"complete")
            path=Path(d)/result["raw_data_file"]
            self.assertEqual(path.read_bytes(),fake_urlopen.raw)
            self.assertEqual(result["http_raw_sha256"],hashlib.sha256(path.read_bytes()).hexdigest())

    def test_offline_report_and_lf_csv(self):
        with tempfile.TemporaryDirectory() as d:
            out=Path(d)
            doc=mod.write_artifacts(out,[{"pair":"BTC-USDC","status":"unavailable","error_type":"test"},
                 {"pair":"ETH-USDC","status":"unavailable","error_type":"test"}])
            self.assertEqual(doc["status"],"unavailable")
            raw=(out/"SEVEN_HEAVEN_OKX_SPOT_USDC_COST_BY_NOTIONAL.csv").read_bytes()
            self.assertNotIn(bytes((13,)),raw)
            self.assertEqual(len(raw.splitlines()),21)
            self.assertFalse(doc["order_execution"])


if __name__=="__main__":
    unittest.main()
