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

    def test_gate_original_spot_pairs_only_when_tradable(self):
        data=[
            {"id":"MNT_USDT","base":"MNT","base_name":"Mantle",
             "quote":"USDT","trade_status":"tradable"},
            {"id":"GT_USDC","base":"GT","quote":"USDC",
             "trade_status":"tradable"},
            {"id":"HALT_USDT","base":"HALT","quote":"USDT",
             "trade_status":"untradable"},
            {"id":"BUY_USDT","base":"BUY","quote":"USDT",
             "trade_status":"buyable"},
            {"id":"SELL_USDT","base":"SELL","quote":"USDT",
             "trade_status":"sellable"},
            {"id":"FUT_USDT","base":"FUT","quote":"USDT",
             "trade_status":"tradable","category":"SPOT-FUTURES"},
            {"id":"WRONG_USDT","base":"WRONG","quote":"USDC",
             "trade_status":"tradable"},
        ]
        parsed=m.parse_instruments("gate",data)
        # Gate API exposes a Spot-only collection; an extra category field
        # cannot upgrade or reinterpret a pair. We require exact ID/quote.
        self.assertEqual(parsed,{
            ("MNT","USDT"):"MNT_USDT",
            ("GT","USDC"):"GT_USDC",
            ("FUT","USDT"):"FUT_USDT"})
        with self.assertRaisesRegex(ValueError,"Gate expected"):
            m.parse_instruments("gate",{"data":data})
        with self.assertRaisesRegex(ValueError,"inventory"):
            m.parse_instruments("gate",[])

    def test_kucoin_original_spot_pairs_and_enable_trading(self):
        def sym(base,quote="USDT",enabled=True):
            return {"baseCurrency":base,"quoteCurrency":quote,
                    "symbol":base+"-"+quote,"enableTrading":enabled}
        rows=[sym("KCS"),sym("AKT","USDC"),sym("HALT",enabled=False),
              sym("STOP","USDT",enabled="true"),
              {**sym("WRONG"),"symbol":"WRONG-USDC"},
              sym("OTH","BTC")]
        out=m.parse_instruments("kucoin",{"code":"200000","data":rows})
        self.assertEqual(out,{
            ("KCS","USDT"):"KCS-USDT",
            ("AKT","USDC"):"AKT-USDC"})
        with self.assertRaisesRegex(ValueError,"KuCoin"):
            m.parse_instruments("kucoin",{"code":"400000","data":rows})

    def test_kraken_original_wsname_and_status_never_auto_approve_owner(self):
        good={"wsname":"DAI/USDT","altname":"DAIUSDT","status":"online"}
        usdc={"wsname":"EURC/USDC","status":"online"}
        inactive={"wsname":"FAKE/USDT","status":"cancel_only"}
        unknown={"wsname":"WRONG/USDT-ALT","status":"online"}
        parsed=m.parse_instruments("kraken",{"error":[],"result":{
            "DAIUSDT":good,"EURCUSDC":usdc,"FAKEUSDT":inactive,
            "WRONGUSDT":unknown}})
        self.assertEqual(parsed,{
            ("DAI","USDT"):"DAI/USDT",
            ("EURC","USDC"):"EURC/USDC"})
        with self.assertRaisesRegex(ValueError,"Kraken rejected"):
            m.parse_instruments("kraken",{"error":["EGeneral:Offline"],
                                           "result":{"DAIUSDT":good}})
        with self.assertRaisesRegex(ValueError,"Kraken rejected"):
            m.parse_instruments("kraken",{"error":[],"result":[]})
        with self.assertRaisesRegex(ValueError,"inventory"):
            m.parse_instruments("kraken",{"error":[],"result":{}})

    def test_coinbase_exchange_spot_products_do_not_claim_futures_or_halted_pairs(self):
        def product(base,quote="USDT",status="online",disabled=False,
                    cancel=False,post=False):
            return {"id":base+"-"+quote,"base_currency":base,
                "quote_currency":quote,"status":status,
                "trading_disabled":disabled,"cancel_only":cancel,
                "post_only":post}
        src=[
            product("DAI","USDC"),product("EURC","USDT"),
            product("OFF",status="offline"),product("HALT",disabled=True),
            product("CANCEL",cancel=True),product("POST",post=True),
            product("FAKE","BTC"),
            {**product("WRONG"),"id":"WRONG-USDC"}
        ]
        parsed=m.parse_instruments("coinbase",src)
        self.assertEqual(parsed,{("DAI","USDC"):"DAI-USDC",
                                 ("EURC","USDT"):"EURC-USDT"})
        with self.assertRaisesRegex(ValueError,"Gate/Coinbase"):
            m.parse_instruments("coinbase",{"data":src})

    def test_six_venues_discovery_remains_candidate_only(self):
        data=m.build(universe(),{"asset-1"},{
            "coinbase":{"status":"success",
                        "symbols":{("COIN2","USDC"):"COIN2-USDC"},
                        "sha256":"a"*64},
            "kraken":{"status":"success",
                      "symbols":{("COIN2","USDT"):"COIN2/USDT"},
                      "sha256":"b"*64}
        },clock="proof-time")
        c=next(x for x in data["assets"] if x["id"]=="asset-2")
        self.assertEqual({x["venue"] for x in c["instruments"]},
                         {"coinbase","kraken"})
        self.assertFalse(c["coin_id_confirmed"])
        self.assertFalse(c["native_1m_month_confirmed"])
        self.assertFalse(c["archived"])
        self.assertTrue(all(x["exchange_instrument_confirmed"]
                            and x["coin_id_confirmed"] is False
                            and x["native_1m_month_confirmed"] is False
                            for x in c["instruments"]))

    def test_four_venue_symbol_matching_never_certifies_coin_identity(self):
        original=universe()
        # This is a pure scheduling hint; the same symbol might belong to a
        # different CoinGecko ID at the source venue.
        official=m.build(original,{"asset-1"},{
            "okx":{"status":"source_unavailable","reason":"429"},
            "bitget":{"status":"source_unavailable","reason":"429"},
            "gate":{"status":"success",
                    "symbols":{("COIN2","USDT"):"COIN2_USDT"},
                    "sha256":"a"*64},
            "kucoin":{"status":"success",
                      "symbols":{("COIN2","USDC"):"COIN2-USDC"},
                      "sha256":"b"*64},
        },clock="proof-time")
        target=next(x for x in official["assets"] if x["id"]=="asset-2")
        self.assertEqual({x["venue"] for x in target["instruments"]},
                         {"gate","kucoin"})
        self.assertEqual({x["quote"] for x in target["instruments"]},
                         {"USDT","USDC"})
        self.assertFalse(target["coin_id_confirmed"])
        self.assertFalse(target["native_1m_month_confirmed"])
        self.assertTrue(all(not x["coin_id_confirmed"]
                            for x in target["instruments"]))
        self.assertFalse(target["archived"])

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
