#!/usr/bin/env python3
"""Offline proof that older source months extend history, never fake genesis."""
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from unittest import mock

import backfill_earlier_native_months as m

class EarlierSourceTests(unittest.TestCase):
    def catalog(self):
        return json.loads(m.CATALOG.read_text())

    def test_bounded_older_months_from_real_authorized_source(self):
        cat=self.catalog()
        tasks=m.plan(cat,2)
        self.assertEqual(len(tasks),2)
        self.assertEqual(len(tasks[0]["assets"]),2)
        self.assertEqual({a["id"] for a in tasks[0]["assets"]},
                         {"bitcoin","ethereum"})
        first=min(x["month"] for x in
             next(a for a in cat["assets"] if a["id"]=="bitcoin")["months"])
        self.assertEqual(tasks[0]["month"],m.month_before(first))
        self.assertEqual(tasks[1]["month"],m.month_before(tasks[0]["month"]))
        self.assertTrue(all(a["pair"].endswith("USDT") for t in tasks
                            for a in t["assets"]))
        with self.assertRaisesRegex(ValueError,"Unsafe historical"):
            m.plan(cat,100)

    def fixture_importer(self,month,assets,folder,deny=False):
        expected=m.bulk.bounds(month,"1m")[1]
        rows=[]
        for i,a in enumerate(assets):
            file=f"{a['pair']}-1m-{month}.zip"
            status="unavailable" if deny and i==1 else "verified"
            item={"asset_id":a["id"],"rank":a["rank"],"pair":a["pair"],
                  "source":"Binance Spot public monthly CSV","quote":"USDT",
                  "month":month,"interval":"1m","status":status}
            if status=="verified":
                # Only an isolated test stub; production fetch_asset independently
                # validates the official checksum AND every source OHLCV line.
                payload=(a["id"]+month).encode()
                (folder/file).write_bytes(payload)
                item.update({"file":file,
                             "sha256":hashlib.sha256(payload).hexdigest(),
                             "candles":expected})
            rows.append(item)
        found=sum(x["status"]=="verified" for x in rows)
        manifest={"schema":m.bulk.SCHEMA,"month":month,"interval":"1m",
                  "requested":len(assets),"verified":found,
                  "unavailable":len(assets)-found,
                  "candles":found*expected,"assets":rows,
                  "zip_bytes":0}
        (folder/"manifest.json").write_text(json.dumps(manifest))
        return manifest

    def test_no_publication_after_source_missing(self):
        cat=self.catalog()
        published=[]
        out=m.run(cat,months=2,
                  importer=lambda mo,a,f:self.fixture_importer(mo,a,f,deny=True),
                  publisher=lambda mo,f,manifest,a:published.append(mo))
        self.assertEqual(out["published"],[])
        self.assertEqual(len(out["unavailable"]),1)
        self.assertEqual(published,[])
        self.assertFalse(out["first_exchange_trade_proven"])
        self.assertFalse(out["token_creation_date_proven"])

    def test_full_native_months_can_be_planned_and_published_separately(self):
        cat=self.catalog()
        published=[]
        def fake_publish(mo,folder,manifest,assets):
            self.assertEqual(manifest["verified"],2)
            self.assertEqual(len(list(folder.glob("*.zip"))),2)
            published.append(mo)
            return "proof-for-"+mo
        out=m.run(cat,months=2,importer=self.fixture_importer,
                  publisher=fake_publish)
        self.assertEqual(len(published),2)
        self.assertEqual(len(out["published"]),2)
        self.assertFalse(out["catalog_updated"])
        self.assertFalse(out["first_exchange_trade_proven"])
        self.assertTrue(all(x["native_candles"]>=56000
                            for x in out["published"]))

if __name__=="__main__":
    unittest.main(verbosity=2)
