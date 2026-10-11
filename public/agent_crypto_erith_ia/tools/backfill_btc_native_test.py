#!/usr/bin/env python3
"""Offline checks for bounded BTC-only history without false claims."""
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import backfill_btc_native as m

def fixture(month,asset,folder,fail=False):
    expected=m.bulk.bounds(month,"1m")[1]
    item={"asset_id":"bitcoin","rank":1,"pair":"BTCUSDT",
          "source":"Binance Spot public monthly CSV","quote":"USDT",
          "interval":"1m","month":month}
    if fail:
        item.update(status="unavailable",reason="RuntimeError: HTTP 503")
    else:
        name="BTCUSDT-1m-"+month+".zip"
        payload=("fixture-"+month).encode()
        (folder/name).write_bytes(payload)
        item.update(status="verified",file=name,sha256=hashlib.sha256(payload).hexdigest(),
                    candles=expected,zip_bytes=len(payload))
    manifest={"schema":m.bulk.SCHEMA,"month":month,"interval":"1m",
              "requested":1,"verified":0 if fail else 1,"unavailable":1 if fail else 0,
              "candles":0 if fail else expected,
              "zip_bytes":0 if fail else item["zip_bytes"],"assets":[item]}
    (folder/"manifest.json").write_text(json.dumps(manifest))
    return manifest

class BTCBackfillTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.catalog=json.loads(m.CATALOG.read_text())
    def test_next_six_months_are_older_than_catalog_btc(self):
        months,owner=m.plan(self.catalog,6)
        first=min(x["month"] for x in next(a for a in self.catalog["assets"]
                                         if a["id"]=="bitcoin")["months"])
        self.assertEqual(months[0],m.month_before(first))
        self.assertEqual(len(months),len(set(months)))
        self.assertTrue(all(x<first and x>=m.FIRST_BINANCE_SCAN for x in months))
        self.assertEqual(owner["pair"],"BTCUSDT")
        self.assertEqual(owner["rank"],1)
    def test_no_unbounded_months(self):
        with self.assertRaisesRegex(ValueError,"Unbounded"):
            m.plan(self.catalog,7)
    def test_one_owner_no_ethereum_requirement(self):
        result=[]
        def upload(month,folder,manifest):
            self.assertEqual([x["asset_id"] for x in manifest["assets"]],["bitcoin"])
            result.append(month)
            return "https://example.invalid/release/"+month
        out=m.run(self.catalog,2,collect=lambda mo,folder:fixture(mo,None,folder),
                  publish=upload,exists=lambda mo:False)
        self.assertEqual(out["published"],2)
        self.assertEqual(result,out["requested_months"])
        self.assertEqual(out["added_native_candles"],sum(m.bulk.bounds(x,"1m")[1] for x in result))
        self.assertFalse(out["canonical_catalog_updated"])
    def test_http_503_never_becomes_permanent_or_blocks_next_month(self):
        month_list,_=m.plan(self.catalog,2)
        out=m.run(self.catalog,2,collect=lambda mo,folder:fixture(
            mo,None,folder,fail=mo==month_list[0]),
            publish=lambda *a:"https://example.invalid/release",exists=lambda mo:False)
        self.assertEqual([x["status"] for x in out["results"]],
                         ["source_unavailable_or_incomplete","published"])
        self.assertEqual(out["published"],1)
    def test_existing_release_prevents_double_publication(self):
        planned,_=m.plan(self.catalog,2)
        actual=[]
        out=m.run(self.catalog,2,collect=lambda mo,folder:fixture(mo,None,folder),
                  publish=lambda mo,folder,manifest:actual.append(mo) or mo,
                  exists=lambda mo:mo==planned[0])
        self.assertEqual(actual,[planned[1]])
        self.assertEqual(out["results"][0]["status"],"existing_release_wait_for_catalog")
    def test_real_source_gap_enters_immutable_separate_release(self):
        pending,_=m.plan(self.catalog,2)
        calls=[]
        def source(month,folder):
            if month==pending[0]:
                item={"asset_id":"bitcoin","rank":1,"pair":"BTCUSDT",
                      "source":"Binance Spot public monthly CSV",
                      "quote":"USDT","interval":"1m","month":month,
                      "status":"unavailable",
                      "reason":"ValueError: Missing/duplicate/unaligned candle"}
                manifest={"schema":m.bulk.SCHEMA,"month":month,"interval":"1m",
                          "requested":1,"verified":0,"unavailable":1,
                          "candles":0,"zip_bytes":0,"assets":[item]}
                (folder/"manifest.json").write_text(json.dumps(manifest))
                return manifest
            return fixture(month,None,folder)
        def gap_source(month,folder):
            calls.append(("preserved",month))
            return {"native_rows":43200-80,"missing_minutes":80,
                    "synthetic_rows":0,"source_zip_sha256":"a"*64}
        def gap_publish(month,folder,proof):
            calls.append(("released",month))
            return "https://example.invalid/partial"
        out=m.run(self.catalog,2,collect=source,
                  publish=lambda *a:"https://example.invalid/full",
                  exists=lambda mo:False,known_gap=lambda mo:False,
                  collect_gap=gap_source,publish_partial=gap_publish)
        self.assertEqual([v["status"] for v in out["results"]],
                         ["published_with_gaps","published"])
        self.assertEqual(out["gap_months"],1)
        self.assertEqual(out["full_months"],1)
        self.assertEqual(calls,[("preserved",pending[0]),("released",pending[0])])

    def test_completed_gap_release_is_skipped_for_next_season(self):
        months,_=m.plan(self.catalog,3)
        skipped,owner=m.plan(self.catalog,2,has_gap=lambda mo:mo==months[0])
        self.assertEqual(skipped,months[1:3])
        self.assertEqual(owner["pair"],"BTCUSDT")

    def test_final_2017_scan_floor(self):
        clone=json.loads(json.dumps(self.catalog))
        btc=next(x for x in clone["assets"] if x["id"]=="bitcoin")
        row=btc["months"][0].copy();row["month"]="2017-08"
        btc["months"]=[row]
        months,_=m.plan(clone,6)
        self.assertEqual(months,[])

if __name__=="__main__":
    unittest.main(verbosity=2)
