#!/usr/bin/env python3
"""Offline official Spot instrument evidence, no fabricated CoinGecko identity."""
import unittest
import audit_historical_spot_instruments as m


def universe():
    result = [
        {"id": f"asset-{i}", "rank": i, "symbol": f"COIN{i}",
         "name": f"Coin {i}"} for i in range(1,251)
    ]
    result[41].update(id="okb", symbol="OKB", name="OKB")
    result[65].update(id="bitget-token", symbol="BGB", name="Bitget Token")
    result[179].update(id="other-bgb", symbol="BGB", name="Other BGB (collision)")
    return result


def okx(base="OKB", quote="USDT", inst_type="SPOT", state="live"):
    return {"instType":inst_type, "instId": f"{base}-{quote}",
            "baseCcy":base,"quoteCcy":quote,"state":state}


def bitget(base="OKB",quote="USDT",category="SPOT",status="online"):
    return {"category":category,"symbol":base+quote,
            "baseCoin":base,"quoteCoin":quote,"status":status}


class OfficialInstrumentsTests(unittest.TestCase):
    def test_pair_must_be_real_spot_online_and_quote_unmodified(self):
        rows=[okx(),okx(state="suspend",base="BAD"),okx(inst_type="SWAP",base="FAKE"),
              okx(quote="BTC",base="TEST"),okx(base="USDT",quote="USDT")]
        parsed=m.parse_instruments("okx",{"code":"0","data":rows})
        self.assertEqual(parsed,{("OKB","USDT"):"OKB-USDT"})
        bit=m.parse_instruments("bitget",{"code":"00000","data":[
            bitget(),bitget(base="SOL",quote="USDC"),
            bitget(base="LEVERAGE",category="USDT-FUTURES"),
            bitget(base="OFF",status="offline")]})
        self.assertEqual(bit,{("OKB","USDT"):"OKBUSDT",
                              ("SOL","USDC"):"SOLUSDC"})
        with self.assertRaises(ValueError):
            m.parse_instruments("okx",{"code":"51000","data":[okx()]})
        with self.assertRaises(ValueError):
            m.parse_instruments("bitget",{"code":"99999","data":[bitget()]})

    def test_venue_proof_is_not_coin_identity_or_ohlcv_archive(self):
        data=m.build(universe(),{"asset-1"},{
            "okx":{"status":"success","symbols":{("OKB","USDT"):"OKB-USDT"},
                   "sha256":"a"*64},
            "bitget":{"status":"success","symbols":{("OKB","USDC"):"OKBUSDC",
                  ("BGB","USDT"):"BGBUSDT"},"sha256":"b"*64}
        },clock="test-date")
        self.assertEqual(data["candidate_count"],249)
        self.assertEqual(data["with_spot_instrument"],1)
        okb=next(x for x in data["assets"] if x["id"]=="okb")
        self.assertEqual(len(okb["instruments"]),2)
        self.assertEqual({x["quote"] for x in okb["instruments"]},{"USDT","USDC"})
        self.assertTrue(all(x["exchange_instrument_confirmed"] for x in okb["instruments"]))
        self.assertFalse(any(x["coin_id_confirmed"] or x["native_1m_month_confirmed"]
                            for x in okb["instruments"]))
        bgb=next(x for x in data["assets"] if x["id"]=="bitget-token")
        self.assertEqual(bgb["status"],"ambiguous_symbol")
        self.assertEqual(bgb["instruments"],[])
        self.assertFalse(data["no_orders"] is False)
        self.assertTrue(data["no_synthetic_candles"])

    def test_source_failure_never_claims_unverified_pair(self):
        def fetcher(venue):
            if venue=="okx":
                raise OSError("network unavailable")
            return {"code":"00000","data":[bitget()]}, "c"*64
        result=m.audit(universe(),{"asset-1"},fetcher=fetcher)
        self.assertEqual(result["markets"]["okx"]["status"],"source_unavailable")
        self.assertEqual(result["markets"]["bitget"]["status"],"success")
        self.assertEqual(result["with_spot_instrument"],1)
        with self.assertRaisesRegex(ValueError,"Ranked Top250"):
            m.build(universe()[:-1],set(),{})

    def test_rejects_nonmatching_symbol_instrument_and_derivatives(self):
        with self.assertRaisesRegex(ValueError,"Official Spot instrument"):
            m.parse_instruments("okx",{"code":"0","data":[]})
        mapped=m.parse_instruments("bitget",{"code":"00000","data":[
            {**bitget(),"symbol":"WRONGUSDT"},bitget(base="BAD",category="MARGIN"),
            bitget(base="SOL",quote="USDT")]})
        self.assertEqual(mapped,{("SOL","USDT"):"SOLUSDT"})


if __name__=="__main__":
    unittest.main(verbosity=2)
