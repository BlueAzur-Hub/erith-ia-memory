#!/usr/bin/env python3
"""Offline evidence and immutable source cohort tests for USDG, PI and FLR."""
import unittest
import collect_additional_okx_daily_history as addon

def fixture():
    records=[{"id":f"other-{i}","rank":i,"symbol":f"Z{i}",
              "name":"Other","source":None,"months":0,"quote":"USDT"}
             for i in range(1,251)]
    instruments=[]
    for cid,rank,ticker,name,_ in addon.PROOFS:
        records[rank-1]={"id":cid,"rank":rank,"symbol":ticker,
              "name":name,"source":None,"months":0,"quote":"USDT"}
        instruments.append({"id":cid,"rank":rank,"symbol":ticker,
           "instruments":[{"venue":"okx","base":ticker,"quote":"USDT",
                           "instrument":ticker+"-USDT",
                           "exchange_instrument_confirmed":True}]})
    return (
       {"schema":"aerith.public.ohlcv.top250.federated-native-archives.v1",
        "ranked":250,"assets":records},
       {"schema":"aerith.public.ohlcv.spot.top250.official-instrument-candidates.v1",
        "assets":instruments})

class OKXExpandedSourceTests(unittest.TestCase):
    def test_three_exact_project_names_and_official_pairs(self):
        result=addon.owners(*fixture())
        self.assertEqual([x["id"] for x in result],
                         ["global-dollar","pi-network","flare-networks"])
        self.assertEqual([x["instrument"] for x in result],
                         ["USDG-USDT","PI-USDT","FLR-USDT"])
        self.assertEqual(len({x["identity_evidence"] for x in result}),3)

    def test_never_claim_wrong_market_id_or_already_archived(self):
        for mutation in ("name","rank","pair","owner"):
            fed,venue=fixture()
            if mutation=="name": fed["assets"][36]["name"]="Fake"
            if mutation=="rank": fed["assets"][36]["rank"]=999
            if mutation=="pair": venue["assets"][0]["instruments"][0]["instrument"]="WRONG-USDT"
            if mutation=="owner":
                fed["assets"][36]["months"]=1
                fed["assets"][36]["source"]="Binance Spot official native 1m ZIPs"
            with self.subTest(mutation=mutation):
                with self.assertRaises(ValueError):addon.owners(fed,venue)

    def test_cannot_claim_usd_price_or_relabel_daily_as_minute(self):
        fed,venue=fixture()
        fed["assets"][36]["quote"]="USD"
        with self.assertRaisesRegex(ValueError,"Exact ranked"):
            addon.owners(fed,venue)

if __name__=="__main__":unittest.main(verbosity=2)
