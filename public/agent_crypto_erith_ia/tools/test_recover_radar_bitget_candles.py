#!/usr/bin/env python3
"""Offline historical-recovery tests: exact identity, 96 proven candles, no fake book."""
import datetime as dt
import json
import pathlib
import tempfile
import unittest
import urllib.parse

import recover_radar_bitget_candles as r

UTC=dt.timezone.utc
DAY=dt.date(2026,10,22)
NOW=dt.datetime(2026,10,23,2,0,tzinfo=UTC)
ASSETS={x[1]:x for x in r.TARGETS}
BYPAIR={x[2]:x for x in r.TARGETS}
RAW_ID=json.loads(r.IDENTITY.read_text(encoding="utf-8"))


def native(url):
    u=urllib.parse.urlsplit(url)
    params=urllib.parse.parse_qs(u.query)
    if u.path.endswith("/coins"):
        target=ASSETS[params["coin"][0]]
        native_chain="BSC" if target[3]=="binance-smart-chain" else "ETH"
        return {"code":"00000","data":[{"coin":target[1],"chains":[{
            "chain":native_chain,"contractAddress":target[4]
        }]}]}
    if u.path.endswith("/instruments"):
        pair=params["symbol"][0]
        target=BYPAIR[pair]
        return {"code":"00000","data":[{"symbol":pair,"category":"SPOT",
                "baseCoin":target[1],"quoteCoin":"USDT","status":"online"}]}
    raise AssertionError("Unapproved live endpoint: "+url)


def rows(day=DAY):
    start=int(dt.datetime.combine(day,dt.time.min,tzinfo=UTC).timestamp()*1000)
    return [[str(start+i*r.STEP_MS),"1.1","1.2","1.0","1.1","100","110"]
            for i in reversed(range(96))]


def historical(url,broken_pair=None,short=False):
    u=urllib.parse.urlsplit(url)
    q=urllib.parse.parse_qs(u.query)
    pair=q["symbol"][0]
    result=rows()
    if pair==broken_pair and short:
        result=result[1:]
    return {"code":"00000","data":result}


class NativeHistoryTests(unittest.TestCase):
    def test_complete_day_exact_three_contract_matched_pairs(self):
        doc=r.recover_day(DAY,fetch_live=native,fetch_history=historical,
                          identity=RAW_ID,now=NOW)
        self.assertEqual(doc["asset_count"],3)
        self.assertEqual([x["pair"] for x in doc["assets"]],
                         ["BRUSDT","JCTUSDT","BEAMUSDT"])
        self.assertFalse(doc["original_hourly_observations_reconstructed"])
        self.assertFalse(doc["order_book_spread_available"])
        self.assertFalse(doc["orders_enabled"])
        self.assertEqual(doc["real_orders"],0)
        for asset in doc["assets"]:
            self.assertEqual(asset["count"],96)
            self.assertEqual(asset["sha256"],r.sha(asset["candles_15m"]))
        with tempfile.TemporaryDirectory() as folder:
            self.assertEqual(r.save(doc,pathlib.Path(folder))["status"],
                             "SAVED_HISTORICAL_CANDLES_ONLY")
            self.assertEqual(r.save(doc,pathlib.Path(folder))["status"],
                             "ALREADY_VERIFIED")
            original=json.loads((pathlib.Path(folder)/"2026-10-22.json").read_text())
            self.assertFalse(original["order_book_spread_available"])

    def test_one_missing_candle_cannot_certify_full_day(self):
        with self.assertRaisesRegex(ValueError,"95/96"):
            r.recover_day(DAY,fetch_live=native,
              fetch_history=lambda url:historical(url,broken_pair="BRUSDT",short=True),
              identity=RAW_ID,now=NOW)

    def test_duplicate_or_out_of_range_timestamps_not_invented(self):
        bars=rows()
        bars[0][0]=bars[1][0]
        with self.assertRaisesRegex(ValueError,"Duplicate"):
            r.normalize_candles(bars,DAY)
        bars=rows()[:-1]
        with self.assertRaisesRegex(ValueError,"95/96"):
            r.normalize_candles(bars,DAY)
        extra=rows()
        # Endpoint can include an adjacent prior interval at a boundary.
        extra.append([str(int(extra[-1][0])-r.STEP_MS),
                      "1.1","1.2","1.0","1.1","100","110"])
        self.assertEqual(len(r.normalize_candles(extra,DAY)),96)

    def test_native_contract_collision_rejected(self):
        def wrong(url):
            response=native(url)
            if "/coins" in url:
                response["data"][0]["chains"][0]["contractAddress"]="0x"+"a"*40
            return response
        with self.assertRaisesRegex(ValueError,"Unverified native token contract"):
            r.recover_day(DAY,fetch_live=wrong,
                          fetch_history=historical,identity=RAW_ID,now=NOW)

    def test_existing_archive_conflict_rejected(self):
        doc=r.recover_day(DAY,fetch_live=native,fetch_history=historical,
                          identity=RAW_ID,now=NOW)
        with tempfile.TemporaryDirectory() as folder:
            folder=pathlib.Path(folder)
            r.save(doc,folder)
            changed=json.loads(json.dumps(doc))
            changed["assets"][0]["candles_15m"][0]["close"]="1.15"
            changed["assets"][0]["sha256"]=r.sha(changed["assets"][0]["candles_15m"])
            with self.assertRaisesRegex(ValueError,"Conflicting prior"):
                r.save(changed,folder)

    def test_no_future_or_prelaunch_date(self):
        for date in (dt.date(2026,10,21),dt.date(2026,10,23)):
            with self.subTest(date=date):
                with self.assertRaisesRegex(ValueError,"Date outside"):
                    r.recover_day(date,fetch_live=native,fetch_history=historical,
                                  identity=RAW_ID,now=NOW)

if __name__=="__main__":
    unittest.main()
