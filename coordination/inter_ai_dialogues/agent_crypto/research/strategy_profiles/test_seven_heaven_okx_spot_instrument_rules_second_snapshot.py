"""Offline tests for public-only OKX instrument rules and second-book snapshot."""
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch
from decimal import Decimal
import importlib.util
import hashlib
import io
import json
import tempfile
import unittest

FILE=Path(__file__).with_name("SEVEN_HEAVEN_OKX_SPOT_BTC_ETH_USDC_INSTRUMENT_RULES_SECOND_SNAPSHOT_2026_11_12.py")
spec=importlib.util.spec_from_file_location("seven_instrument_rules",FILE)
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

def metadata(pair):
    base=pair.split("-")[0]
    return {"code":"0","data":[{"instId":pair,"instType":"SPOT",
         "baseCcy":base,"quoteCcy":"USDC",
         "state":"live","minSz":"0.0001","lotSz":"0.0001",
         "tickSz":"0.01","maxLmtSz":"10","maxMktSz":"3"}]}

class InstrumentTests(unittest.TestCase):
    def test_pair_and_spot_identity(self):
        d=mod.read_metadata(metadata("BTC-USDC"),"BTC-USDC")
        self.assertEqual(d["baseCcy"],"BTC")
        self.assertEqual(d["state"],"live")
        for corrupt in [{"instType":"SWAP"},{"baseCcy":"ETH"},{"quoteCcy":"USDT"},
                        {"instId":"ETH-USDC"}]:
            v=metadata("BTC-USDC")
            v["data"][0].update(corrupt)
            with self.assertRaises(ValueError):
                mod.read_metadata(v,"BTC-USDC")

    def test_reject_nonpositive_step_and_missing(self):
        for key,val in (("minSz","0"),("lotSz","-1"),("tickSz","NaN"),
                        ("tickSz","")):
            v=metadata("ETH-USDC")
            v["data"][0][key]=val
            with self.assertRaises((ValueError,ArithmeticError)):
                mod.read_metadata(v,"ETH-USDC")

    def test_decimal_rounding_and_minimum(self):
        m=mod.read_metadata(metadata("ETH-USDC"),"ETH-USDC")
        a=mod.estimate_limit_size("10","2003.00",m)
        self.assertEqual(a["theoretical_base_quantity_at_best_ask"],"0.0049")
        self.assertTrue(a["base_quantity_at_least_minSz"])
        self.assertTrue(a["best_ask_is_tick_grid_aligned"])
        self.assertLessEqual(Decimal(a["theoretical_quote_used_usdc"]),Decimal("10"))
        b=mod.estimate_limit_size("0.01","2003.00",m)
        self.assertFalse(b["base_quantity_at_least_minSz"])

    def test_book_pricing_mismatched_tick(self):
        m=mod.read_metadata(metadata("ETH-USDC"),"ETH-USDC")
        a=mod.estimate_limit_size("100","2003.001",m)
        self.assertFalse(a["best_ask_is_tick_grid_aligned"])

    def test_evidence_is_LF_and_no_orders(self):
        old={"BTC-USDC":{"book_at_utc":"2026-11-12T15:27:25.507Z",
                "spread_bps":0.014006,"best_bid":"71400.0","best_ask":"71400.1"},
             "ETH-USDC":{"book_at_utc":"2026-11-12T15:27:25.657Z",
                "spread_bps":0.049925,"best_bid":"2002.99","best_ask":"2003.0"}}
        res=[{"pair":p,"status":"unavailable"} for p in mod.PAIR]
        with tempfile.TemporaryDirectory() as d:
            output=Path(d)
            evidence=mod.produce(res,old,output)
            self.assertFalse(evidence["order_execution"])
            self.assertEqual(evidence["status"],"unavailable")
            bytes_csv=(output/"SEVEN_HEAVEN_OKX_INSTRUMENT_RULES_LIMIT_SIZE_EXAMPLES.csv").read_bytes()
            self.assertNotIn(bytes((13,)),bytes_csv)
            self.assertEqual(len(bytes_csv.splitlines()),9)

    def test_source_url_only_get(self):
        m=metadata("BTC-USDC")
        seen=[]
        def fake(req,timeout):
            self.assertEqual(req.get_method(),"GET")
            self.assertIn("/public/instruments",req.full_url)
            seen.append(req.full_url)
            return io.BytesIO(json.dumps(m).encode())
        with patch.object(mod,"urlopen",side_effect=fake):
            url,raw,at=mod.get_public(mod.META_URL,{"instType":"SPOT","instId":"BTC-USDC"})
        self.assertEqual(len(seen),1)
        self.assertEqual(hashlib.sha256(raw).hexdigest(),mod.sha256(raw))
        self.assertEqual(json.loads(raw)["data"][0]["instId"],"BTC-USDC")


if __name__=="__main__":
    unittest.main()
