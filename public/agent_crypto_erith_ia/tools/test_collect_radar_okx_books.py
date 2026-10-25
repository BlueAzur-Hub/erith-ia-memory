"""No-network regression tests for public OKX three-pair book collector."""
import datetime as dt
import json
import tempfile
import unittest
from pathlib import Path
from urllib.parse import urlsplit, parse_qs
import collect_radar_okx_books as collector

class Tests(unittest.TestCase):
    def setUp(self):
        self.now=dt.datetime(2026,10,25,10,42,tzinfo=dt.timezone.utc)
        self.ts=str(int(self.now.timestamp()*1000)-1000)
    def fake(self,url):
        path=urlsplit(url).path
        pair=parse_qs(urlsplit(url).query)["instId"][0]
        sym=pair.split("-")[0]
        if path.endswith("/instruments"):
            return {"code":"0","data":[{"instId":pair,"instType":"SPOT",
                "baseCcy":sym,"quoteCcy":"USDC","state":"live",
                "minSz":"0.001","lotSz":"0.001","tickSz":"0.0001"}]}
        if path.endswith("/ticker"):
            return {"code":"0","data":[{"instId":pair,"ts":self.ts,
                "last":"1.001","vol24h":"100","volCcy24h":"100.1"}]}
        if path.endswith("/books"):
            return {"code":"0","data":[{"ts":self.ts,
                "bids":[["1.000","10","0","1"]],
                "asks":[["1.002","12","0","1"]]}]}
        if path.endswith("/candles"):
            return {"code":"0","data":[]}
        raise ValueError("Unapproved route")
    def test_exact_pairs_immutability_and_orders_disabled(self):
        doc=collector.collect(fetch=self.fake,now=self.now)
        self.assertEqual([x["pair"] for x in doc["markets"]],
                         ["SAHARA-USDC","T-USDC","GRASS-USDC"])
        self.assertEqual(doc["observed_count"],3)
        self.assertFalse(doc["orders_enabled"])
        self.assertEqual(doc["real_orders"],0)
        self.assertEqual(doc["paper_fills"],0)
        self.assertEqual(doc["markets"][0]["proof"]["closed_15m_status"],"UNAVAILABLE")
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            self.assertTrue(collector.save(doc,root)["changed"])
            self.assertFalse(collector.save(doc,root)["changed"])
            self.assertEqual(len(json.loads((root/"2026-10-25.json").read_text())["hours"]),1)
    def test_reject_wrong_quote_without_fallback(self):
        def wrong(url):
            item=self.fake(url)
            if urlsplit(url).path.endswith("/instruments"):
                item["data"][0]["quoteCcy"]="USDT"
            return item
        doc=collector.collect(fetch=wrong,now=self.now)
        self.assertEqual(doc["observed_count"],0)
        self.assertTrue(all(x["status"]=="UNAVAILABLE" and x["proof"] is None
                            for x in doc["markets"]))
    def test_reject_crossed_order_book(self):
        def crossed(url):
            item=self.fake(url)
            if urlsplit(url).path.endswith("/books"):
                item["data"][0]["bids"][0][0]="1.005"
            return item
        doc=collector.collect(fetch=crossed,now=self.now)
        self.assertEqual(doc["observed_count"],0)

if __name__=="__main__":
    unittest.main()
