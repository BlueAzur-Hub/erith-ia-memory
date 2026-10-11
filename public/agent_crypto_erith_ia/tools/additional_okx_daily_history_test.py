#!/usr/bin/env python3
"""Offline proofs and immutable native sources for six further OKX Spot assets."""
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
    def test_six_exact_project_names_and_official_pairs(self):
        result=addon.owners(*fixture())
        self.assertEqual([x["id"] for x in result],
                         ["leo-token","canton-network","apenft","vaulta","instadapp","sonic-3"])
        self.assertEqual([x["instrument"] for x in result],
                         ["LEO-USDT","CC-USDT","NFT-USDT","A-USDT","FLUID-USDT","S-USDT"])
        self.assertEqual(len({x["identity_evidence"] for x in result}),6)

    def test_never_claim_wrong_market_id_or_already_archived(self):
        for mutation in ("name","rank","pair","owner"):
            fed,venue=fixture()
            if mutation=="name": fed["assets"][17]["name"]="Fake"
            if mutation=="rank": fed["assets"][17]["rank"]=999
            if mutation=="pair": venue["assets"][0]["instruments"][0]["instrument"]="WRONG-USDT"
            if mutation=="owner":
                fed["assets"][17]["months"]=1
                fed["assets"][17]["source"]="Binance Spot official native 1m ZIPs"
            with self.subTest(mutation=mutation):
                with self.assertRaises(ValueError):addon.owners(fed,venue)

    def test_existing_native_release_not_recollected_when_official_census_rotates(self):
        fed,_=fixture()
        # The current official audit omits owners that already have real 1D
        # OHLCV. This is not evidence of a missing trading pair.
        venues={"schema":"aerith.public.ohlcv.spot.top250.official-instrument-candidates.v1",
                "assets":[]}
        rows=[]
        for cid,rank,ticker,name,_ in addon.PROOFS:
            rows.append({"id":cid,"rank":rank,"symbol":ticker,"name":name,
                "venue":"OKX Spot","market":ticker+"-USDT","bar":"1Dutc",
                "quote":"USDT","native_candles":1,"sha256":"a"*64,
                "release_tag":addon.TAG})
        published={"schema":"aerith.public.crypto.multiresolution-sources.v1",
                   "asset_count":len(rows),"assets":rows}
        self.assertEqual(addon.owners(fed,venues,published),[])
        # Missing one source record is not silently certified as archived:
        # without venue proof, collection must fail closed.
        missing={"schema":published["schema"],"asset_count":len(rows)-1,
                 "assets":rows[:-1]}
        with self.assertRaisesRegex(ValueError,"Official native OKX"):
            addon.owners(fed,venues,missing)
        changed={"schema":published["schema"],"asset_count":len(rows),
                 "assets":[{**rows[0],"market":"OTHER-USDT"},*rows[1:]]}
        with self.assertRaisesRegex(ValueError,"Published native"):
            addon.owners(fed,venues,changed)

    def test_cannot_claim_usd_price_or_relabel_daily_as_minute(self):
        fed,venue=fixture()
        fed["assets"][17]["quote"]="USD"
        with self.assertRaisesRegex(ValueError,"Exact ranked"):
            addon.owners(fed,venue)

if __name__=="__main__":unittest.main(verbosity=2)
