#!/usr/bin/env python3
"""Offline-only fixtures. No synthetic market numbers are committed as observations."""
import datetime as dt
import json
import pathlib
import tempfile
import unittest
from urllib.parse import urlsplit,parse_qs
import collect_radar_verified_targets as target

NOW=dt.datetime(2026,10,22,9,40,tzinfo=dt.timezone.utc)
STAMP=str(int(NOW.timestamp()*1000)-20000)
COINS={s:(cid,net,contract) for cid,s,pair,net,contract in target.TARGETS}
PLATFORM={"binance-smart-chain":"BSC","ethereum":"ETH"}

def catalogue():
    return {"schema":"erith.radar.spot-identity-prospective.v1",
      "orders_enabled":False,"real_orders":0,"candidate_count":20,
      "source_radar_day_utc":"2026-10-20",
      "candidates":[{"coin_id":cid,"symbol":s,"venue":"Bitget","pair":pair,
        "quote":"USDT","identity_proven":True,"status":"CONTRACT_MATCH_AT_COLLECTION",
        "platform":net,"contract_address":contract,"real_orders":0}
        for cid,s,pair,net,contract in target.TARGETS]+
        [{"coin_id":"unverified-"+str(i)} for i in range(17)]}

def fake(url):
    u=urlsplit(url);q=parse_qs(u.query)
    sym=q.get("coin",[None])[0] or q.get("symbol",[None])[0].replace("USDT","")
    if sym not in COINS:
        raise ValueError("No verified symbol")
    cid,network,contract=COINS[sym];pair=sym+"USDT"
    if u.path.endswith("/coins"):
        return {"code":"00000","data":[{"coin":sym,"chains":[
            {"chain":PLATFORM[network],"contractAddress":contract}]}]}
    if u.path.endswith("/instruments"):
        return {"code":"00000","data":[{"category":"SPOT","baseCoin":sym,
            "quoteCoin":"USDT","symbol":pair,"status":"online",
            "isRwa":"NO","symbolType":"crypto","minOrderAmount":"1"}]}
    if u.path.endswith("/tickers"):
        return {"code":"00000","requestTime":int(STAMP),"data":[{
            "symbol":pair,"category":"SPOT","ts":STAMP,
            "lastPrice":"0.25","volume24h":"10000","turnover24h":"2500"}]}
    if u.path.endswith("/orderbook"):
        return {"code":"00000","data":{"ts":STAMP,
            "b":[[.2499,100],[.2498,200]],
            "a":[[.2501,150],[.2502,200]]}}
    if u.path.endswith("/candles"):
        t=int(dt.datetime(2026,10,22,9,0,tzinfo=dt.timezone.utc).timestamp()*1000)
        return {"code":"00000","data":[
            [str(t),"0.25","0.26","0.24","0.25","2000","500"],
            [str(t-900000),"0.25","0.26","0.24","0.25","2000","500"]]}
    raise AssertionError("API not allowlisted "+url)

class TargetTests(unittest.TestCase):
    def test_three_verified_symbols_only_with_native_contract_and_market(self):
        calls=[]
        def bounded(url):
            calls.append(url)
            return fake(url)
        rec=target.collect(bounded,NOW,catalogue())
        self.assertEqual(rec["markets_observed"],3)
        self.assertEqual(len(calls),15)
        self.assertEqual(rec["max_http_requests"],15)
        self.assertEqual([x["symbol"] for x in rec["markets"]],["BR","JCT","BEAM"])
        self.assertEqual([x["pair"] for x in rec["markets"]],["BRUSDT","JCTUSDT","BEAMUSDT"])
        self.assertEqual({x["quote"] for x in rec["markets"]},{"USDT"})
        self.assertFalse(rec["orders_enabled"])
        self.assertEqual(rec["real_orders"],0)
        for x in rec["markets"]:
            self.assertTrue(x["proof"]["identity"]["same_chain_and_address"])
            self.assertFalse(x["proof"]["execution_proven"])
            self.assertGreater(float(x["proof"]["book"]["spread_bps"]),0)
            self.assertLessEqual(len(x["proof"]["closed_15m"]),4)
        self.assertTrue(all("/api/v3/market/" in v for v in calls))
        self.assertEqual(len([v for v in calls if "/coins?" in v]),3)

    def test_symbol_only_or_changed_contract_blocks_without_ticker(self):
        def changed(url):
            d=fake(url)
            if "/coins?" in url and "coin=BR" in url:
                d["data"][0]["chains"][0]["contractAddress"]="0x"+"1"*40
            return d
        calls=[]
        def tracked(url):
            calls.append(url)
            return changed(url)
        out=target.collect(tracked,NOW,catalogue())
        self.assertEqual(out["markets_observed"],2)
        self.assertEqual(out["markets"][0]["status"],"UNAVAILABLE")
        self.assertIsNone(out["markets"][0]["proof"])
        self.assertFalse(any("BRUSDT" in s for s in calls))
        self.assertEqual(out["markets"][1]["status"],"OBSERVED")
        self.assertEqual(out["markets"][2]["status"],"OBSERVED")

    def test_bad_catalogue_fails_before_all_requests(self):
        doc=catalogue()
        doc["candidates"][0]["identity_proven"]=False
        with self.assertRaises(ValueError):target.collect(fake,NOW,doc)
        doc=catalogue()
        doc["candidates"][2]["contract_address"]="0x"+"1"*40
        with self.assertRaises(ValueError):target.collect(fake,NOW,doc)
        doc=catalogue()
        doc["candidates"].append(doc["candidates"][0])
        with self.assertRaises(ValueError):target.collect(fake,NOW,doc)

    def test_stale_exchange_data_is_not_laundered(self):
        def stale(url):
            d=fake(url)
            if "/orderbook?" in url and "symbol=JCTUSDT" in url:
                d["data"]["ts"]=str(int(STAMP)-3600000)
            return d
        out=target.collect(stale,NOW,catalogue())
        self.assertEqual(out["markets_observed"],2)
        self.assertIsNone(out["markets"][1]["proof"])

    def test_archive_utc_immutable_and_no_backfill(self):
        out=target.collect(fake,NOW,catalogue())
        with tempfile.TemporaryDirectory() as tmp:
            root=pathlib.Path(tmp)
            self.assertTrue(target.save(out,root)["changed"])
            archive=root/"2026-10-22.json"
            first=archive.read_bytes()
            self.assertFalse(target.save(out,root)["changed"])
            self.assertEqual(first,archive.read_bytes())
            older=target.collect(fake,NOW,catalogue());older["hour_utc"]="2026-10-22T08Z"
            with self.assertRaises(ValueError):target.save(older,root)
            self.assertEqual(json.loads((root/"latest.json").read_text())["markets_observed"],3)
            self.assertEqual(first,archive.read_bytes())

if __name__=="__main__":
    unittest.main()
