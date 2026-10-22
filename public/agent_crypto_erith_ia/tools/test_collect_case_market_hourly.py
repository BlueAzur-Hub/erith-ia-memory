#!/usr/bin/env python3
"""Synthetic fixtures ONLY for CI: no fixture observation is published as market data."""
import datetime as dt
import json
import pathlib
import tempfile
import unittest
from urllib.parse import urlsplit, parse_qs
import collect_case_market_hourly as source

UTC=dt.timezone.utc
NOW=dt.datetime(2026,10,22,7,22,tzinfo=UTC)
MS=int(NOW.timestamp()*1000)
def nowms():return str(MS-30000)
def ladder(price):
    from decimal import Decimal
    p=Decimal(str(price))
    return ([[str(p-Decimal(".001")*i-Decimal(".001")),"2"] for i in range(5)],
            [[str(p+Decimal(".001")*i+Decimal(".001")),"2"] for i in range(5)])
def ohlc(bitget,price):
    import datetime
    p=str(price);q=str(price*1.01)
    hour_ms=int(dt.datetime(2026,10,22,7,0,tzinfo=UTC).timestamp()*1000)
    rows=[]
    for i in range(4):
        ms=hour_ms-i*900000
        row=[str(ms),p,q,p,p,"12","20"]
        if not bitget:row+=["20","1"]
        rows.append(row)
    return rows
def mock(url):
    u=urlsplit(url);params=parse_qs(u.query);h=u.hostname
    if h=="eea.okx.com":
        if u.path.endswith("instruments"):
            return {"code":"0","data":[{"instId":"ZEC-USDC","instType":"SPOT","baseCcy":"ZEC",
                    "quoteCcy":"USDC","state":"live","minSz":".01","lotSz":".0001","tickSz":".01"}]}
        if u.path.endswith("/ticker"):
            return {"code":"0","data":[{"instId":"ZEC-USDC","ts":nowms(),"last":"100",
                                           "vol24h":"100","volCcy24h":"10000"}]}
        if u.path.endswith("/books"):
            bid,ask=ladder(100)
            return {"code":"0","data":[{"ts":nowms(),"bids":bid,"asks":ask}]}
        if u.path.endswith("/candles"):
            return {"code":"0","data":ohlc(False,100)}
    if h=="api.bitget.com":
        if u.path.endswith("/instruments"):
            return {"code":"00000","data":[{"symbol":"AXISUSDT","category":"SPOT"}]}
        if u.path.endswith("/tickers"):
            return {"code":"00000","requestTime":MS-30000,"data":[{"symbol":"AXISUSDT",
                    "category":"SPOT","lastPrice":"0.3","volume24h":"500","turnover24h":"150"}]}
        if u.path.endswith("/orderbook"):
            bid,ask=ladder(.3)
            return {"code":"00000","data":{"b":bid,"a":ask,"ts":nowms()}}
        if u.path.endswith("/candles"):
            return {"code":"00000","data":ohlc(True,.3)}
    raise AssertionError("Unexpected API "+url)

class TestEvidence(unittest.TestCase):
    def test_real_contract_with_synthetic_fixtures(self):
        rec=source.collect(mock,NOW)
        self.assertEqual(rec["schema"],source.SCHEMA)
        self.assertEqual(rec["observed_markets"],2)
        self.assertEqual([(m["venue"],m["pair"],m["quote"]) for m in rec["markets"]],
                         [("OKX_EEA","ZEC-USDC","USDC"),("BITGET","AXISUSDT","USDT")])
        self.assertTrue(rec["spot_only"] and rec["separate_native_quotes"])
        self.assertFalse(rec["orders_enabled"])
        self.assertEqual(rec["real_orders"],0)
        for market in rec["markets"]:
            self.assertEqual(market["status"],"OBSERVED")
            self.assertLessEqual(len(market["proof"]["closed_15m"]),4)
            self.assertFalse(market["proof"]["book"]["fill_proven"])
            self.assertGreater(float(market["proof"]["book"]["spread_bps"]),0)
            self.assertLess(float(market["proof"]["closed_15m"][-1]["close"]),100000)
            self.assertTrue(market["proof"]["book"]["source_at_utc"].endswith("Z"))

    def test_stale_book_must_fail_closed_no_fabricated_pair(self):
        def stale(url):
            d=mock(url)
            if "eea.okx.com" in url and "/books?" in url:
                d["data"][0]["ts"]=str(MS-3600000)
            return d
        rec=source.collect(stale,NOW)
        self.assertEqual(rec["observed_markets"],1)
        self.assertEqual(rec["markets"][0]["status"],"UNAVAILABLE")
        self.assertIsNone(rec["markets"][0]["proof"])
        self.assertEqual(rec["markets"][1]["status"],"OBSERVED")

    def test_missing_source_explicit_without_substitute_price(self):
        def down(url):raise ValueError("fixture intentionally unavailable")
        rec=source.collect(down,NOW)
        self.assertEqual(rec["observed_markets"],0)
        for x in rec["markets"]:
            self.assertIsNone(x["proof"])
            self.assertEqual(x["status"],"UNAVAILABLE")
            self.assertEqual(x["unavailable_reason"],"ValueError")
        self.assertEqual(rec["real_orders"],0)

    def test_immutable_utc_hour_and_no_backfilling(self):
        rec=source.collect(mock,NOW)
        with tempfile.TemporaryDirectory() as tmp:
            root=pathlib.Path(tmp)
            first=source.save(rec,root)
            self.assertTrue(first["changed"])
            day=root/"2026-10-22.json"
            initial=day.read_bytes()
            self.assertFalse(source.save(rec,root)["changed"])
            self.assertEqual(day.read_bytes(),initial)
            later=source.collect(mock,NOW+dt.timedelta(hours=1))
            later["hour_utc"]="2026-10-22T06Z"
            with self.assertRaises(ValueError):source.save(later,root)
            self.assertEqual(day.read_bytes(),initial)
            self.assertEqual(json.loads((root/"latest.json").read_text())["markets_observed"],2)

    def test_api_route_and_spread_security(self):
        with self.assertRaises(ValueError):
            source.api(mock,"eea.okx.com","/api/v5/trade/order",instId="ZEC-USDC")
        with self.assertRaises(ValueError):
            source.make_book([["100","1"]],[["99","1"]],nowms(),NOW)
        with self.assertRaises(ValueError):
            source.num("NaN")
        with self.assertRaises(ValueError):
            source.stamp(str(MS-3600000),NOW)
        future=[[str(MS+900000),"1","2",".5","1","1","1","1","1"]]
        with self.assertRaises(ValueError):
            source.closed_bars(future,NOW,False)

if __name__=="__main__":
    unittest.main()
