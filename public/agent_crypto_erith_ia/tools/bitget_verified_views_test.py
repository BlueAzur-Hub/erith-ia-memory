#!/usr/bin/env python3
"""Offline regression: two genuine source schemas, never a synthetic trade count."""
import csv
import io
import json
from pathlib import Path
import zipfile
import unittest

import build_bitget_verified_views as b
import probe_native_bitget_spot as proof
import collect_native_bitget_month as importer

class BitgetFederationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.catalog=json.loads(b.CATALOG.read_text())
        cls.exact=json.loads(proof.EXACT.read_text())
        cls.spot=json.loads(proof.INSTRUMENTS.read_text())
        cls.asset=b.source_candidates(cls.catalog,cls.exact,cls.spot)["cosmos"]

    def fixture(self,count=43200,asset=None):
        asset=asset or self.asset
        month="2026-09"
        tag=f"crypto-spot-bitget-{month}-1m-{asset['id']}"
        name=f"{asset['pair']}-1m-{month}.zip"
        start,_,expected=b.bulk.bounds(month,"1m")
        self.assertEqual(expected,43200)
        text=io.StringIO(newline="")
        writer=csv.writer(text,lineterminator="\n")
        for i in range(count):
            writer.writerow([start+i*60000,"10.1","12.2","9.4","11.7","3.2","32.12"])
        binary=io.BytesIO()
        with zipfile.ZipFile(binary,"w",compression=zipfile.ZIP_DEFLATED) as archive:
            archive.writestr(name[:-4]+".csv",text.getvalue())
        raw=binary.getvalue()
        manifest={"schema":importer.SCHEMA,"month":month,"interval":"1m",
                  "source":importer.SOURCE,"quote":"USDT","venue":"bitget",
                  "native_month_proven":True,"not_exchange_signed":True,
                  "no_synthetic_candles":True,"requested":1,"verified":1,
                  "unavailable":0,"candles":expected,
                  "native_source_columns":["timestamp","open","high","low",
                     "close","base_volume","quote_turnover"],
                  "assets":[{"asset_id":asset["id"],"rank":asset["rank"],
                      "pair":asset["pair"],"quote":"USDT",
                      "source":importer.SOURCE,"status":"verified",
                      "file":name,"sha256":b.digest(raw),
                      "zip_bytes":len(raw),"candles":expected}]}
        manifest_raw=json.dumps(manifest,sort_keys=True).encode()
        meta={name:{"size":len(raw),"digest":"sha256:"+b.digest(raw)},
              "manifest.json":{"size":len(manifest_raw),
                               "digest":"sha256:"+b.digest(manifest_raw)}}
        files={name:raw,"manifest.json":manifest_raw}
        return tag,(lambda t:meta),(lambda t,n,*args:files[n])

    def test_full_verified_month_is_federated_without_fake_trade_count(self):
        tag,metadata,downloader=self.fixture()
        projections,alt,union=b.build(self.catalog,self.exact,self.spot,[tag],
                                      metadata,downloader)
        self.assertEqual(len(projections),1)
        self.assertEqual(alt["archived_assets"],1)
        self.assertFalse(alt["trade_count_available"])
        self.assertEqual(union["archived_assets"],self.catalog["archived_assets"]+1)
        self.assertEqual(union["bitget_archived_assets"],1)
        self.assertEqual(union["native_1m_candles"],
                         self.catalog["native_1m_candles"]+43200)
        self.assertFalse(union["first_trade_date_known"])
        import gzip
        obj=json.loads(gzip.decompress(projections[0][1]))
        self.assertEqual(obj["native_columns"],list(b.COLUMNS))
        self.assertEqual(len(obj["series"]["1m"]),1440)
        self.assertEqual(len(obj["series"]["5m"]),8640)
        self.assertEqual(len(obj["series"]["1h"]),720)
        self.assertTrue(all(len(v)==7 for seq in obj["series"].values() for v in seq))
        self.assertFalse(obj["trade_count_available"])
        self.assertTrue(all(x["quote"]=="USDT" for x in union["assets"]))
        self.assertEqual(union["groups"][-1]["archived"],union["archived_assets"])

    def test_short_source_month_is_rejected_even_if_manifest_claims_43200(self):
        tag,metadata,downloader=self.fixture(count=43199)
        with self.assertRaisesRegex(ValueError,"incomplete"):
            b.build(self.catalog,self.exact,self.spot,[tag],metadata,downloader)

    def test_github_zip_digest_tampering_rejected(self):
        tag,metadata,downloader=self.fixture()
        good=metadata(tag)
        good[next(k for k in good if k!="manifest.json")]["digest"]="sha256:"+"0"*64
        with self.assertRaisesRegex(ValueError,"ZIP SHA256"):
            b.build(self.catalog,self.exact,self.spot,[tag],lambda _:good,downloader)

    def test_wrong_coin_id_cannot_take_verified_other_coin_history(self):
        tag,metadata,downloader=self.fixture()
        untrusted=tag.replace("cosmos","unknown-coin")
        projections,alt,union=b.build(self.catalog,self.exact,self.spot,[untrusted],
                                      metadata,downloader)
        self.assertEqual(len(projections),0)
        self.assertEqual(alt["archived_assets"],0)
        self.assertEqual(union["archived_assets"],self.catalog["archived_assets"])
        with self.assertRaisesRegex(ValueError,"Conflicting"):
            b.federate(self.catalog,[{"id":"bitcoin","months":1,
                                     "native_1m_count":43200}])

    def test_gap_and_price_range_cannot_be_aggregated_as_real_bars(self):
        rows=[[0,10.,12.,9.,11.,3.,33.],
              [60000,11.,13.,10.,12.,4.,44.]]
        out=b.aggregate(rows,300000)
        self.assertEqual(len(out),1)
        self.assertEqual(out[0][5],7.)
        self.assertEqual(out[0][6],77.)
        with self.assertRaisesRegex(ValueError,"contiguous"):
            b.aggregate([rows[0],{**{}}],300000)

if __name__=="__main__":
    unittest.main(verbosity=2)
