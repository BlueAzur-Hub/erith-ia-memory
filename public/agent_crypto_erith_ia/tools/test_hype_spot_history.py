#!/usr/bin/env python3
"""Synthetic offline tests for genuine HYPE/USDC EEA Spot evidence."""
import datetime as dt
import json
import pathlib
import sys
import tempfile
import unittest
import urllib.parse
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parent))
import collect_hype_spot_history as h

NOW=dt.datetime(2026,10,24,9,30,tzinfo=dt.timezone.utc)
MS=str(int(NOW.timestamp()*1000)-1000)


def native(route,params):
    if route.endswith("/instruments"):
        return [{"instId":"HYPE-USDC","instType":"SPOT","baseCcy":"HYPE",
                 "quoteCcy":"USDC","state":"live",
                 "minSz":"0.01","lotSz":"0.0001","tickSz":"0.001"}]
    if route.endswith("/history-candles"):
        interval=h.BARS[params["bar"]]
        end=int(NOW.timestamp()*1000)//interval*interval-interval
        return [[str(end-i*interval),"75","77","74","76",
                 "120","9000","9120","1"] for i in range(10)]
    raise AssertionError("Unknown native endpoint")


def market(url):
    path=urllib.parse.urlsplit(url)
    assert path.hostname=="eea.okx.com",url
    pair=urllib.parse.parse_qs(path.query).get("instId",[""])[0]
    assert pair=="HYPE-USDC",url
    if path.path.endswith("/books"):
        return {"code":"0","data":[{"ts":MS,
               "bids":[["76.000","1.1"],["75.990","3"]],
               "asks":[["76.010","2"],["76.020","4"]]}]}
    if path.path.endswith("/ticker"):
        return {"code":"0","data":[{"ts":MS,"instId":"HYPE-USDC",
                 "last":"76.005","bidPx":"76.000","askPx":"76.010",
                 "vol24h":"123","volCcy24h":"9350"}]}
    raise AssertionError("Unknown books route")


class HypeHistoryTests(unittest.TestCase):
    def test_native_spot_candles_and_book(self):
        x=h.collect(native,NOW,market)
        self.assertEqual(x["pair"],"HYPE-USDC")
        self.assertEqual(x["quote"],"USDC")
        self.assertFalse(x["orders_enabled"])
        self.assertEqual(x["real_orders"],0)
        self.assertEqual(x["public_instrument_rules"]["minSz"],"0.01")
        self.assertEqual(x["spot_book_observation"]["status"],"VERIFIED_PUBLIC_BOOK")
        self.assertEqual(x["spot_book_observation"]["ticker"]["volume24h_quote"],"9350")
        self.assertEqual(x["spot_book_observation"]["book5"]["bids"][0][0],"76.000")
        self.assertEqual(x["spot_book_observation"]["book5"]["market_fill_proven"],False)
        self.assertEqual(set(x["candles"]),{"15m","1H","1Dutc"})
        self.assertEqual(len(x["candles"]["1Dutc"]),10)
        with tempfile.TemporaryDirectory() as t:
            folder=pathlib.Path(t)
            h.save(x,folder/"candles.json")
            self.assertEqual(h.save_book_observation(x,folder/"books")["hours"],1)
            a=json.loads((folder/"books"/"2026-10-24.json").read_text())
            self.assertEqual(a["observations"][0]["hour_utc"],"2026-10-24T09Z")
            self.assertEqual(a["observations"][0]["market_fill_proven"],False)
            self.assertEqual(h.save_book_observation(x,folder/"books")["reason"],"IMMUTABLE_HOUR")
            self.assertEqual(len(json.loads((folder/"books"/"2026-10-24.json").read_text())["observations"]),1)

    def test_missing_book_is_never_replaced_by_fake_quote(self):
        def bad(url):
            if "/books?" in url: raise TimeoutError("book unavailable")
            return market(url)
        x=h.collect(native,NOW,bad)
        snap=x["spot_book_observation"]
        self.assertEqual(snap["status"],"UNAVAILABLE")
        self.assertIsNone(snap["book5"])
        self.assertIsNone(snap["ticker"])
        self.assertEqual(snap["reason"],"TimeoutError")
        with tempfile.TemporaryDirectory() as d:
            h.save_book_observation(x,pathlib.Path(d))
            a=json.loads((pathlib.Path(d)/"2026-10-24.json").read_text())
            self.assertEqual(a["observations"][0]["status"],"UNAVAILABLE")

    def test_wrong_market_identity_and_non_spot_never_pass(self):
        for field,value in [("baseCcy","NOT_HYPE"),("quoteCcy","USDT"),("instType","SWAP"),("state","suspend")]:
            def spoof(route,params):
                x=native(route,params)
                if route.endswith("/instruments"):x[0][field]=value
                return x
            with self.subTest(field=field),self.assertRaises(ValueError):
                h.collect(spoof,NOW,market)

    def test_crossed_book_refused_but_native_candles_kept(self):
        def crossed(url):
            reply=market(url)
            if "/books?" in url:
                reply["data"][0]["bids"][0][0]="76.015"
            return reply
        x=h.collect(native,NOW,crossed)
        self.assertEqual(x["spot_book_observation"]["status"],"UNAVAILABLE")
        self.assertIsNone(x["spot_book_observation"]["book5"])
        self.assertEqual(len(x["candles"]["15m"]),10)

    def test_private_api_blocked(self):
        for route in ["/api/v5/account/balance","/api/v5/trade/order"]:
            with self.assertRaises(ValueError):h.fetch_public(route,{"instId":"HYPE-USDC"})

    def test_existing_books_never_backfill_or_rewrite(self):
        first=h.collect(native,NOW,market)
        later=h.collect(native,NOW+dt.timedelta(hours=1),market)
        with tempfile.TemporaryDirectory() as d:
            folder=pathlib.Path(d)
            h.save_book_observation(first,folder)
            self.assertEqual(h.save_book_observation(later,folder)["hours"],2)
            import copy
            earlier=copy.deepcopy(first)
            earlier["generated_at_utc"]="2026-10-24T08:30:00Z"
            earlier["spot_book_observation"]["at_utc"]=earlier["generated_at_utc"]
            with self.assertRaisesRegex(ValueError,"out of order"):
                h.save_book_observation(earlier,folder)


if __name__=="__main__":
    unittest.main()
