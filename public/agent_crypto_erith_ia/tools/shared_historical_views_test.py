#!/usr/bin/env python3
"""Offline regression of shared market projections, coverage and SHA metadata."""
import gzip
import io
import json
import tempfile
import unittest
from unittest import mock
from pathlib import Path

import build_historical_shared_views as s
import import_historical_bulk as bulk

class SharedHistoryTests(unittest.TestCase):
    def catalog(self):
        return json.loads(s.CATALOG.read_text())

    def test_real_catalog_honest_qualified_count_and_addenda(self):
        current=self.catalog()
        picked=s.pick(current)
        self.assertEqual(len(picked),current["archived_assets"])
        self.assertEqual(len({a["id"] for a in picked}),len(picked))
        self.assertIn("bitcoin",{a["id"] for a in picked})
        self.assertIn("polkadot",{a["id"] for a in picked})
        self.assertIn("aster-2",{a["id"] for a in picked})
        self.assertGreaterEqual(len(picked),30)
        # A genuinely delisted market (such as XMR/USDT) has a valid
        # latest archived month older than the active source cutoff.
        # Never require one artificial global "latest" month.
        source_by_id={a["id"]:a for a in current["assets"] if a["months"]}
        for chosen in picked:
            month=max(source_by_id[chosen["id"]]["months"],
                      key=lambda x:x["month"])
            self.assertEqual(chosen["month"],month["month"])
            self.assertEqual(chosen["pair"],month["pair"])
            self.assertEqual(chosen["sha256"],month["sha256"])
        self.assertTrue(any("-add-" in a["release"] for a in picked))

    def test_fake_asset_never_gets_a_projection(self):
        x=self.catalog()
        x["archived_assets"]=250
        with self.assertRaisesRegex(ValueError,"Missing verified assets"):
            s.pick(x)
        x=self.catalog()
        real=next(a for a in x["assets"] if a["months"])
        real["months"][-1]["file"]="../unsafe.zip"
        with self.assertRaisesRegex(ValueError,"Bad source month"):
            s.pick(x)

    def test_native_months_aggregate_without_synthetic_prices(self):
        a=s.pick(self.catalog())[0]
        a={**a,"month":"2026-09","candles":43200}
        first,count,_=bulk.bounds("2026-09","1m")
        rows=[[first+i*60000,100.0,102.0,99.0,101.0,0.5,50.0,2]
              for i in range(count)]
        p=s.projection(a,rows)
        self.assertEqual(len(p["series"]["1m"]),1440)
        self.assertEqual(len(p["series"]["5m"]),8640)
        self.assertEqual(len(p["series"]["1h"]),720)
        self.assertEqual(p["series"]["5m"][0][5:], [2.5,250.0,10])
        self.assertEqual(p["series"]["1h"][0][5:], [30.0,3000.0,120])
        self.assertEqual(p["last_open_ms"],first+(count-1)*60000)
        self.assertFalse(p["is_live"])
        self.assertFalse(p["max_is_all_time"])
        with self.assertRaisesRegex(ValueError,"Insufficient"):
            s.projection(a,rows[:-1])

    def test_public_release_asset_download_avoids_rest_api(self):
        release="crypto-spot-bulk-2026-09-1m"
        with tempfile.TemporaryDirectory() as td:
            target=Path(td)/"manifest.json"
            with mock.patch.object(s,"urlopen",return_value=io.BytesIO(b"real-release-bytes")) as get:
                s.download_public_asset(release,"manifest.json",target,100)
                self.assertEqual(target.read_bytes(),b"real-release-bytes")
                self.assertEqual(get.call_count,1)
                request=get.call_args.args[0]
                self.assertEqual(request.full_url,
                    "https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/"
                    +release+"/manifest.json")
                self.assertNotIn("api.github.com",request.full_url)

    def test_release_manifest_is_cached_across_assets(self):
        release="crypto-spot-bulk-2026-09-1m"
        assets=[
            {"release":release,"pair":"BTCUSDT","month":"2026-09",
             "file":"BTCUSDT-1m-2026-09.zip"},
            {"release":release,"pair":"ETHUSDT","month":"2026-09",
             "file":"ETHUSDT-1m-2026-09.zip"}
        ]
        calls=[]
        def fake_download(tag,name,target,limit):
            calls.append((tag,name))
            target.write_bytes(b"untrusted fixture bytes")
        with tempfile.TemporaryDirectory() as td:
            with mock.patch.object(s,"download_public_asset",side_effect=fake_download):
                self.assertEqual(s.source_folder(assets[0],td),
                                 s.source_folder(assets[1],td))
                s.source_folder(assets[0],td)
            self.assertEqual(calls,[(release,"manifest.json"),
                                    (release,"BTCUSDT-1m-2026-09.zip"),
                                    (release,"ETHUSDT-1m-2026-09.zip")])
            with self.assertRaisesRegex(ValueError,"Unsafe public"):
                s.source_folder({**assets[0],"release":"../../evil"},td)
            with self.assertRaisesRegex(ValueError,"Unsafe public"):
                s.source_folder({**assets[0],"file":"../manifest.json"},td)

    def test_deterministic_gzip_and_exact_index_hash(self):
        raw=s.pack({"month":"2026-09","asset_id":"bitcoin"})
        self.assertEqual(raw,s.pack({"month":"2026-09","asset_id":"bitcoin"}))
        entry={"id":"bitcoin","rank":1,"name":"Bitcoin","symbol":"BTC",
               "pair":"BTCUSDT","month":"2026-09","first_open_ms":0,
               "last_open_ms":60000,"native_1m_count":43200,
               "release":"crypto-spot-bulk-2026-09-1m",
               "source_zip_sha256":"a"*64,"file":"bitcoin.json.gz",
               "sha256":s.digest(raw),"bytes":len(raw),
               "series_counts":{"1m":1440,"5m":8640,"1h":720}}
        with tempfile.TemporaryDirectory() as folder:
            result=s.emit([("bitcoin.json.gz",raw,entry)],folder)
            self.assertEqual(result["archived_assets"],1)
            self.assertEqual(s.digest((Path(folder)/"bitcoin.json.gz").read_bytes()),
                             result["assets"][0]["sha256"])
            self.assertEqual(json.loads(gzip.decompress(raw)),{"month":"2026-09","asset_id":"bitcoin"})

if __name__=="__main__":
    unittest.main(verbosity=2)
