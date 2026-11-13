"""V3 public OKX collector: deterministic offline API fixtures and safety tests."""
from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.parse import urlsplit, parse_qs
import hashlib
import json
import unittest

from src.engine import LabError, load_bars
from src.observatory import aggregate_bars, compare, run_one
from src.okx_public import (
    ALLOWED_SPOT, COUNT, INSTRUMENT_PATH, HISTORY_PATH, MIN_FREE_BYTES,
    PublicMarketError, _get, _candle, collect, list_sources, read_source
)

START = 1767225600  # 2026-01-01T00:00:00Z
END = START + COUNT*3600
NOW = END + 3000


class FakeOKX:
    """Public REST-shaped mock; never contacts an exchange."""
    def __init__(self, *, missing=None, incomplete=None, corrupt=False, days=10):
        self.hits = []
        self.candles = []
        for i in range(days * 24):
            if i == missing:
                continue
            t = START + i*3600
            price = 60000 + i*8
            data = [str(t*1000), str(price), str(price+20),
                    str(price-20), str(price+5), "3.2",
                    "0", "0", "0" if i == incomplete else "1"]
            if corrupt and i == 101:
                data[2] = str(price-30)
            self.candles.append(data)
        self.candles.sort(key=lambda c:int(c[0]),reverse=True)

    def __call__(self,url):
        self.hits.append(url)
        parsed=urlsplit(url)
        q={k:v[0] for k,v in parse_qs(parsed.query).items()}
        if parsed.path == INSTRUMENT_PATH:
            return {"code":"0","data":[{
                "instType":"SPOT","instId":q["instId"],"state":"live",
                "tickSz":"0.1","lotSz":"0.000001","minSz":"0.00001",
            }]}
        if parsed.path == HISTORY_PATH:
            self.assert_query(q)
            rows=self.candles
            if "after" in q:
                rows=[r for r in rows if int(r[0])<int(q["after"])]
            return {"code":"0","data":rows[:int(q["limit"])]}
        return {"code":"50001","msg":"No endpoint","data":[]}

    def assert_query(self,q):
        assert q["bar"]=="1H"
        assert 1<=int(q["limit"])<=100
        assert q["instId"] in ALLOWED_SPOT


class OKXSourceTests(unittest.TestCase):
    def test_collect_240_closed_hourly_spot_and_replay_one_and_four_hours(self):
        with TemporaryDirectory() as tmp:
            root=Path(tmp)
            fake=FakeOKX()
            source=collect(root,"BTC-USDC",now=NOW,transport=fake,min_free_bytes=1)
            self.assertEqual(source["rows"],240)
            self.assertEqual(source["pair"],"BTC/USDC")
            self.assertEqual(source["quote"],"USDC")
            self.assertEqual(source["close_boundary_utc"],"2026-01-11T00:00:00+00:00")
            self.assertTrue(all("order" not in url for url in fake.hits))
            manifest,bars=read_source(root,source["id"])
            self.assertEqual(len(bars),240)
            self.assertEqual(bars[-1][0],END-3600)
            self.assertEqual(manifest["sha256"],hashlib.sha256((root/"okx_sources"/(source["id"]+".csv")).read_bytes()).hexdigest())
            c1=compare(bars,{"kind":"EMA_CROSS","timeframe":"1h","capital":1000},
                       source_timeframe="1h",source_label="OKX Spot BTC/USDC")
            self.assertEqual(c1["aggregated_candles"],240)
            self.assertEqual(len(c1["rows"]),6)
            c4=compare(bars,{"kind":"EMA_CROSS","timeframe":"4h","capital":1000},
                       source_timeframe="1h",source_label="OKX Spot BTC/USDC")
            self.assertEqual(c4["aggregated_candles"],60)
            self.assertEqual(c4["safety"]["orders_real"],0)
            self.assertEqual(aggregate_bars(bars,"4h",source_timeframe="1h")[0][0],START)
            with self.assertRaisesRegex(LabError,"plus fines"):
                aggregate_bars(bars,"15m",source_timeframe="1h")

    def test_30_and_90_day_closed_history_with_separate_source_identity(self):
        for days in (30, 90):
            with self.subTest(days=days), TemporaryDirectory() as tmp:
                root = Path(tmp)
                end = START + days * 24 * 3600
                now = end + 3000
                end_date = datetime.fromtimestamp(end, timezone.utc).strftime("%Y-%m-%d")
                fake = FakeOKX(days=days)
                source = collect(root, "BTC-USDC", transport=fake, now=now,
                                 days=days, end_date=end_date, min_free_bytes=1)
                self.assertEqual(source["rows"], days * 24)
                self.assertEqual(source["days"], days)
                self.assertTrue(source["id"].endswith("_N" + str(days * 24)))
                self.assertEqual(source["historical_end_date_utc"], end_date)
                self.assertTrue(any("after=" in url for url in fake.hits if HISTORY_PATH in url))
                manifest, bars = read_source(root, source["id"])
                self.assertEqual(len(bars), days * 24)
                self.assertEqual(bars[0][0], START)
                self.assertEqual(bars[-1][0], end - 3600)
                self.assertEqual(manifest["sha256"], source["sha256"])
                compared = compare(bars, {"kind": "EMA_CROSS", "timeframe": "4h",
                                "capital": 1000}, source_timeframe="1h",
                                source_label="OKX Spot BTC/USDC")
                self.assertEqual(compared["aggregated_candles"], days * 6)
                self.assertEqual(compared["safety"]["orders_real"], 0)

    def test_historical_invalid_dates_and_durations_rejected_before_network(self):
        with TemporaryDirectory() as tmp:
            root = Path(tmp)
            fake = FakeOKX()
            for invalid in (0, 11, 365, "30", True, None):
                with self.subTest(days=invalid), self.assertRaises(PublicMarketError):
                    collect(root, "BTC-USDC", now=NOW, transport=fake,
                            days=invalid, min_free_bytes=1)
            for invalid in ("2027-01-01", "2026-1-02", "2026-02-30", "bad", 14):
                with self.subTest(date=invalid), self.assertRaises(PublicMarketError):
                    collect(root, "BTC-USDC", now=NOW, transport=fake,
                            days=10, end_date=invalid, min_free_bytes=1)
            self.assertFalse(fake.hits)

    def test_legacy_v3_cached_source_remains_readable_with_v31(self):
        with TemporaryDirectory() as tmp:
            root = Path(tmp)
            old = collect(root, "ETH-USDC", now=NOW, transport=FakeOKX(), min_free_bytes=1)
            self.assertEqual(old["rows"], 240)
            self.assertNotIn("_N", old["id"])
            original, bars = read_source(root, old["id"])
            self.assertEqual(original["sha256"], old["sha256"])
            self.assertEqual(len(bars), 240)

    def test_cached_reimport_avoids_network(self):
        with TemporaryDirectory() as tmp:
            root=Path(tmp)
            source=collect(root,"ETH-USDC",now=NOW,transport=FakeOKX(),min_free_bytes=1)
            def never(_):
                raise AssertionError("No API should be called when cached source is verified")
            cached=collect(root,"ETH-USDC",now=NOW,transport=never,min_free_bytes=1)
            self.assertEqual(source,cached)
            listed=list_sources(root)
            self.assertEqual(len(listed["sources"]),1)
            self.assertEqual(listed["sources"][0]["base"],"ETH")
            self.assertGreater(listed["free_bytes"],0)

    def test_existing_verified_cache_remains_readable_below_reserve(self):
        with TemporaryDirectory() as tmp:
            root=Path(tmp)
            source=collect(root,"BTC-USDC",now=NOW,transport=FakeOKX(),min_free_bytes=1)
            cached=collect(root,"BTC-USDC",now=NOW,
                transport=lambda _:self.fail("Cached archive must not call public APIs"),
                min_free_bytes=10**20)
            self.assertEqual(cached["sha256"],source["sha256"])

    def test_reject_missing_candle_no_partial_files(self):
        with TemporaryDirectory() as tmp:
            root=Path(tmp)
            with self.assertRaisesRegex(PublicMarketError,"manquante"):
                collect(root,"BTC-USDC",now=NOW,transport=FakeOKX(missing=119),min_free_bytes=1)
            self.assertFalse(list((root/"okx_sources").glob("*.json")))
            self.assertFalse(list((root/"okx_sources").glob("*.csv")))

    def test_reject_unclosed_candle_without_creating_fake_data(self):
        with TemporaryDirectory() as tmp:
            with self.assertRaisesRegex(PublicMarketError,"manquante"):
                collect(Path(tmp),"BTC-USDC",now=NOW,transport=FakeOKX(incomplete=100),min_free_bytes=1)

    def test_reject_bad_ohlc(self):
        with TemporaryDirectory() as tmp:
            with self.assertRaisesRegex(PublicMarketError,"OHLC"):
                collect(Path(tmp),"BTC-USDC",now=NOW,transport=FakeOKX(corrupt=True),min_free_bytes=1)

    def test_reject_pairs_other_than_allowlisted_spot(self):
        with TemporaryDirectory() as tmp:
            for pair in ("BTC-USDC-SWAP","DOGE-USDC","BTC-EUR","https://evil.example"):
                with self.assertRaises(PublicMarketError):
                    collect(Path(tmp),pair,now=NOW,transport=FakeOKX(),min_free_bytes=1)

    def test_reject_under_usb_reserve_before_network(self):
        with TemporaryDirectory() as tmp:
            with self.assertRaisesRegex(PublicMarketError,"Espace USB insuffisant"):
                collect(Path(tmp),"BTC-USDC",now=NOW,
                        transport=lambda _:self.fail("No network when storage below reserve"),
                        min_free_bytes=10**20)

    def test_refuse_tampered_cache(self):
        with TemporaryDirectory() as tmp:
            root=Path(tmp)
            source=collect(root,"BTC-USDC",now=NOW,transport=FakeOKX(),min_free_bytes=1)
            file=root/"okx_sources"/(source["id"]+".csv")
            file.write_bytes(file.read_bytes().replace(b"60000",b"69999"))
            with self.assertRaisesRegex(PublicMarketError,"SHA-256"):
                read_source(root,source["id"])

    def test_reject_invalid_candle_time_price_and_api_endpoint(self):
        bad=[str(START*1000),"100","99","98","100","5","4","4","1"]
        with self.assertRaises(PublicMarketError):
            _candle(bad,END)
        with self.assertRaises(PublicMarketError):
            _get("/api/v5/trade/order",{"instId":"BTC-USDC"},transport=FakeOKX())

    def test_reject_api_non_success_and_instrument_suspend(self):
        with TemporaryDirectory() as tmp:
            with self.assertRaises(PublicMarketError):
                collect(Path(tmp),"BTC-USDC",now=NOW,
                        transport=lambda url:{"code":"50004","msg":"temporarily unavailable","data":[]},
                        min_free_bytes=1)
            def suspended(url):
                if INSTRUMENT_PATH in url:
                    return {"code":"0","data":[{"instType":"SPOT","instId":"BTC-USDC","state":"suspend",
                                               "tickSz":"0.1","lotSz":"0.001","minSz":"0.001"}]}
                return FakeOKX()(url)
            with self.assertRaisesRegex(PublicMarketError,"non disponible"):
                collect(Path(tmp),"BTC-USDC",now=NOW,transport=suspended,min_free_bytes=1)


if __name__=="__main__":
    unittest.main()
