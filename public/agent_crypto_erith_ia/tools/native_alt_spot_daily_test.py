#!/usr/bin/env python3
"""Fail-closed native Gate and KuCoin daily source/owner/continuity tests."""
import copy
import datetime as dt
import hashlib
import json
import unittest
from unittest.mock import patch

import collect_native_alt_spot_daily as m

PAIR={"id":"mantle","rank":56,"name":"Mantle","symbol":"MNT",
      "quote":"USDT","venue":"gate","pair":"MNT_USDT",
      "identity_proof":{"exchange":"gate","coin_id":"mantle",
                        "base":"MNT","quote":"USDT",
                        "market_pair_candidate":"MNT_USDT",
                        "proof_method":"exact_coin_id_matching_evm_contract",
                        "contract_platform":"ethereum",
                        "contract_address":"0x"+"ab"*20}}

def catalogs():
    assets=[{"id":f"other-{i}","rank":i,"name":"Other",
             "symbol":f"Q{i}","native_1m_count":0}
             for i in range(1,251)]
    assets[55]={**assets[55],"id":"mantle","name":"Mantle","symbol":"MNT"}
    minute={"schema":"aerith.public.ohlcv.top250.federated-native-archives.v1",
            "ranked":250,"assets":assets}
    daily={"schema":"aerith.public.crypto.multiresolution-sources.v1",
           "asset_count":0,"assets":[]}
    evidence={"schema":m.owners.SCHEMA,"ranked":250,"results":[
        {"id":"mantle","rank":56,"symbol":"MNT",
         "status":"exact_id_market_candidates",
         "markets":[PAIR["identity_proof"]]}]}
    official={"schema":"aerith.public.ohlcv.spot.top250.official-instrument-candidates.v1",
              "ranked":250,"assets":[{
                  "id":"mantle","rank":56,"symbol":"MNT",
                  "instruments":[{"venue":"gate","base":"MNT",
                     "quote":"USDT","instrument":"MNT_USDT",
                     "exchange_instrument_confirmed":True}]}]}
    return minute,daily,evidence,official

class NativeAlternativeDailyTests(unittest.TestCase):
    def test_proven_exact_owner_and_original_spot_pair_only(self):
        minute,daily,ledger,official=catalogs()
        owned=m.candidates(minute,daily,ledger,official)
        self.assertEqual([x["id"] for x in owned],["mantle"])
        self.assertEqual(owned[0]["pair"],"MNT_USDT")
        self.assertEqual(owned[0]["venue"],"gate")
        self.assertEqual(owned[0]["quote"],"USDT")
        minute["assets"][55]["native_1m_count"]=1
        self.assertEqual(m.candidates(minute,daily,ledger,official),[])
        minute["assets"][55]["native_1m_count"]=0
        daily["assets"]=[{"id":"mantle"}];daily["asset_count"]=1
        self.assertEqual(m.candidates(minute,daily,ledger,official),[])
        daily["assets"]=[];daily["asset_count"]=0
        broken=copy.deepcopy(ledger)
        broken["results"][0]["markets"][0]["coin_id"]="other"
        self.assertEqual(m.candidates(minute,daily,broken,official),[])
        broken=copy.deepcopy(official)
        broken["assets"][0]["instruments"][0]["exchange_instrument_confirmed"]=False
        self.assertEqual(m.candidates(minute,daily,ledger,broken),[])
        broken=copy.deepcopy(ledger)
        broken["results"][0]["markets"][0]["contract_address"]="wrong"
        with self.assertRaisesRegex(ValueError,"contract proof"):
            m.candidates(minute,daily,broken,official)

    def test_exact_tether_usdt_usdc_native_quote_is_never_usd(self):
        minute,daily,ledger,official=catalogs()
        minute["assets"][2]={"id":"tether","rank":3,"name":"Tether",
                             "symbol":"USDT","native_1m_count":0}
        proof={"exchange":"kucoin","coin_id":"tether",
               "base":"USDT","quote":"USDC",
               "market_pair_candidate":"USDT-USDC",
               "proof_method":"exact_coin_id_matching_evm_contract",
               "contract_platform":"ethereum",
               "contract_address":"0xdac17f958d2ee523a2206206994597c13d831ec7"}
        ledger["results"].append({"id":"tether","rank":3,"symbol":"USDT",
            "status":"exact_id_market_candidates","markets":[proof]})
        official["assets"].append({"id":"tether","rank":3,"symbol":"USDT",
            "instruments":[{"venue":"kucoin","base":"USDT","quote":"USDC",
                            "instrument":"USDT-USDC",
                            "exchange_instrument_confirmed":True}]})
        qualified=m.candidates(minute,daily,ledger,official)
        own=next(a for a in qualified if a["id"]=="tether")
        self.assertEqual(own["pair"],"USDT-USDC")
        self.assertEqual(own["venue"],"kucoin")
        self.assertEqual(own["quote"],"USDC")
        with patch.object(m,"START",m.END-3*m.DAY):
            stamp=m.END-m.DAY
            original=[str(stamp//1000),"0.9999","1.0002",
                      "1.0003","0.9998","5.0","5.1"]
            payload=m.acquire(own,getter=lambda o,start,end:
                ([original] if start<=stamp<end else [],"a"*64))
        self.assertEqual(payload["native_candles"],1)
        self.assertEqual(payload["original_quote"],"USDC")
        self.assertNotEqual(payload["original_quote"],"USD")
        self.assertEqual(payload["native_daily_rows"],[original])
        self.assertEqual(m.pack(payload),m.pack(payload))
        altered=copy.deepcopy(ledger)
        altered["results"][-1]["markets"][0]["quote"]="USD"
        self.assertNotIn("tether",{a["id"] for a in
                         m.candidates(minute,daily,altered,official)})
        altered=copy.deepcopy(official)
        altered["assets"][-1]["instruments"][0]["quote"]="USD"
        self.assertNotIn("tether",{a["id"] for a in
                         m.candidates(minute,daily,ledger,altered)})
        for wrong in ({**own,"quote":"USD"},
                      {**own,"pair":"USDT-USD"},
                      {**own,"pair":"USDT-USDT"},
                      {**own,"quote":"USDT"}):
            with self.assertRaises(ValueError):
                m.acquire(wrong,getter=lambda *args:([], "a"*64))

    def test_verified_original_named_native_spot_is_not_a_symbol_guess(self):
        minute,daily,ledger,official=catalogs()
        # AKT has its own native Cosmos chain: no EVM-contract matching.
        own={"id":"akash-network","rank":178,"name":"Akash Network",
             "symbol":"AKT","native_1m_count":0}
        minute["assets"][177]=own
        notice="https://www.gate.com/fr/announcements/article/19761/Gate.io-will-list-Akash-Network-AKT"
        proof={"coin_id":"akash-network","exchange":"gate",
               "base":"AKT","quote":"USDT",
               "market_pair_candidate":"AKT_USDT",
               "exchange_instrument_confirmed":False,
               "native_1m_month_confirmed":False,
               "proof_method":"original_named_spot_listing",
               "original_named_spot_notice":notice}
        ledger["results"].append({"id":"akash-network","rank":178,
            "symbol":"AKT","status":"exact_id_market_candidates",
            "markets":[proof]})
        official["assets"].append({"id":"akash-network","rank":178,"symbol":"AKT",
            "instruments":[{"venue":"gate","instrument":"AKT_USDT",
                            "base":"AKT","quote":"USDT",
                            "exchange_instrument_confirmed":True}]})
        assets=m.candidates(minute,daily,ledger,official)
        result=next(a for a in assets if a["id"]=="akash-network")
        self.assertEqual(result["pair"],"AKT_USDT")
        self.assertEqual(result["venue"],"gate")
        self.assertEqual(result["quote"],"USDT")
        for field,value in (
            ("original_named_spot_notice","https://bogus.invalid"),
            ("quote","USD"),
            ("coin_id","unrelated"),
            ("base","FAKE")
        ):
            wrong=copy.deepcopy(ledger)
            wrong["results"][-1]["markets"][0][field]=value
            if field=="quote" or field=="base" or field=="coin_id":
                self.assertNotIn("akash-network",{x["id"] for x in
                    m.candidates(minute,daily,wrong,official)})
            else:
                with self.assertRaisesRegex(ValueError,"named non-EVM"):
                    m.candidates(minute,daily,wrong,official)
        minute["assets"][177]["name"]="Another Akash"
        with self.assertRaisesRegex(ValueError,"named non-EVM"):
            m.candidates(minute,daily,ledger,official)

    def test_original_gate_ohlcv_and_confirmed_quote_and_daily_timestamp(self):
        stamp=m.END-m.DAY
        row=[str(stamp//1000),"23","2","3","1","2","4","true"]
        self.assertEqual(m.parse_bar(row,"gate")[0],stamp)
        self.assertEqual(m.parse_bar(row[:-1],"gate")[0],stamp)
        for wrong in (
            [*row[:6],"-1","true"],  # negative base volume
            [*row[:3],"1","3",*row[5:]], # low/high inverted
            [*row[:7],"false"],  # open source candle
            [str(stamp//1000+20),*row[1:]], # shifted day
            [str(m.END//1000),*row[1:]], # incomplete end
            [*row[:6],"not-a-volume","true"],
            row[:5],
        ):
            with self.subTest(wrong=wrong),self.assertRaises(ValueError):
                m.parse_bar(wrong,"gate")

    def test_original_kucoin_ohlcv_and_source_quote(self):
        stamp=m.END-m.DAY
        original=[str(stamp//1000),"2","2","3","1","4","8"]
        self.assertEqual(m.parse_bar(original,"kucoin")[0],stamp)
        bad=[str(stamp//1000),"2","2","1","3","4","8"]
        with self.assertRaises(ValueError):m.parse_bar(bad,"kucoin")

    def test_missing_native_days_are_preserved_without_synthetic_bars(self):
        with patch.object(m,"START",m.END-8*m.DAY):
            dates=[m.END-6*m.DAY,m.END-3*m.DAY,m.END-m.DAY]
            def fetch(owner,start,end):
                data=[]
                for stamp in dates:
                    if start<=stamp<end:
                        data.append([str(stamp//1000),"24","2","3","1","2","4"])
                return data,"a"*64
            with patch.object(m,"WINDOW_DAYS",3):
                a=m.acquire(PAIR,getter=fetch)
        self.assertEqual(a["native_candles"],3)
        self.assertEqual(a["calendar_days_without_source_bars"],3)
        self.assertEqual(len(a["native_daily_rows"]),3)
        self.assertFalse(a["genesis_or_first_trade_proven"])
        self.assertTrue(a["no_synthetic_candles"])
        self.assertTrue(a["no_currency_conversion"])
        self.assertEqual(a["original_quote"],"USDT")
        self.assertEqual(m.pack(a),m.pack(a))

    def test_fail_closed_pagination_and_proof_writes(self):
        with patch.object(m,"START",m.END-3*m.DAY):
            row=[str((m.END-m.DAY)//1000),"24","2","3","1","2","4"]
            def duplicate(owner,start,end):
                return [row,row],"a"*64
            with self.assertRaisesRegex(ValueError,"Repeated"):
                m.acquire(PAIR,getter=duplicate)
            def corrupt(owner,start,end):
                return [row],"incorrect"
            with self.assertRaisesRegex(ValueError,"SHA-256"):
                m.acquire(PAIR,getter=corrupt)
            with patch.object(m,"MAX_PAGES",0):
                with self.assertRaisesRegex(ValueError,"did not cover"):
                    m.acquire(PAIR,getter=duplicate)
        with self.assertRaisesRegex(ValueError,"reviewed original GitHub"):
            with patch.dict("os.environ",{"GITHUB_ACTIONS":"false"},clear=True):
                m.publish([{"owner":PAIR}],[],"wrong")

    def test_provider_identity_never_relabels_quotes(self):
        for modified in (
            {**PAIR,"pair":"MNT_USDC"},
            {**PAIR,"quote":"USD"},
            {**PAIR,"venue":"unknown"},
            {**PAIR,"id":"../fake"}
        ):
            with self.assertRaises(ValueError):
                m.acquire(modified,getter=lambda *args:([],"a"*64))

if __name__=="__main__":
    unittest.main(verbosity=2)
