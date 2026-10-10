#!/usr/bin/env python3
"""Offline Top250 catalog regression: identities, unavailable months and SHA refs."""
import json
import hashlib
from unittest import mock
import unittest
from pathlib import Path

import build_historical_top250_catalog as cat
from collect_historical_universe import ROOT

AUDIT=ROOT/"data/historical_archive_prototype/top250-venue-audit.json"

class Top250CoverageTests(unittest.TestCase):
    def setup_rows(self,with_zip=True):
        venue=json.loads(AUDIT.read_text())
        expected="BTCUSDT-1m-2026-09.zip"
        row={"asset_id":"bitcoin","rank":1,"pair":"BTCUSDT",
             "quote":"USDT","source":"Binance Spot public monthly CSV",
             "status":"verified" if with_zip else "unavailable"}
        if with_zip:
            row.update({"file":expected,"candles":43200,"sha256":"a"*64})
        release={"tag_name":"crypto-spot-bulk-2026-09-1m",
                 "assets":[{"name":expected,"digest":"sha256:"+"a"*64}]}
        manifest={"schema":"aerith.public.ohlcv.spot.bulk-monthly.index.v1",
                  "month":"2026-09","interval":"1m","requested":1,
                  "verified":int(with_zip),"unavailable":int(not with_zip),
                  "candles":43200 if with_zip else 0,"assets":[row]}
        return venue,{"2026-09":(release,manifest)}

    def test_full_history_not_capped_to_old_150_release_pilot(self):
        """Offline simulated manifests only, never interpreted as live OHLCV."""
        self.assertGreaterEqual(cat.MAX_VERIFIED_MONTHLY_RELEASES,1000)
        manifest={"schema":cat.bulk.SCHEMA,"month":"2026-09",
                  "interval":"1m","requested":1,"verified":1,
                  "unavailable":0,"assets":[{"asset_id":"bitcoin"}]}
        raw=json.dumps(manifest,sort_keys=True).encode()
        releases=[{"tag_name":
                  f"crypto-spot-bulk-add-2026-09-1m-{n:012x}",
                  "draft":False,"assets":[{"name":"manifest.json",
                  "digest":"sha256:"+hashlib.sha256(raw).hexdigest(),
                  "size":len(raw)}]}
                  for n in range(151)]
        gathered=cat.gather(releases,lambda _:raw)
        self.assertEqual(len(gathered),151)
        releases[-1]["assets"][0]["digest"]="sha256:"+"0"*64
        with self.assertRaisesRegex(ValueError,"Manifest checksum mismatch"):
            cat.gather(releases,lambda _:raw)

    def test_paged_release_inventory_does_not_stop_after_700_entries(self):
        """Exercise pagination without network requests or any real ZIP writes."""
        seen=[]
        def mocked_run(args,**_):
            page=int(args[-1].split("page=")[-1])
            seen.append(page)
            count=100 if page<=8 else 1
            return type("Reply",(),{"stdout":json.dumps(
                [{"tag_name":f"proof-{page}-{i}"} for i in range(count)])})()
        with mock.patch.object(cat.subprocess,"run",side_effect=mocked_run):
            result=cat.listed_releases()
        self.assertEqual(len(result),801)
        self.assertEqual(seen,list(range(1,10)))

    def test_full_250_with_only_one_real_verified_month(self):
        venue,monthly=self.setup_rows()
        result=cat.build(venue,monthly)
        self.assertEqual(len(result["assets"]),250)
        self.assertEqual(result["archived_assets"],1)
        self.assertEqual(result["native_1m_candles"],43200)
        self.assertEqual(result["groups"][-1]["with_history"],1)
        self.assertEqual(result["assets"][0]["id"],"bitcoin")
        self.assertEqual(len(result["assets"][0]["months"]),1)
        self.assertEqual(result["assets"][1]["candles"],0)

    def test_addendum_verified_month_joins_original_without_duplicate_time(self):
        venue,monthly=self.setup_rows()
        dot=next(a for a in venue["assets"] if a["id"]=="polkadot")
        record={"asset_id":"polkadot","rank":dot["rank"],"pair":"DOTUSDT",
          "quote":"USDT","source":"Binance Spot public monthly CSV",
          "status":"verified","file":"DOTUSDT-1m-2026-09.zip",
          "candles":43200,"sha256":"b"*64}
        release={"tag_name":"crypto-spot-bulk-add-2026-09-1m-123456789abc",
          "assets":[{"name":record["file"],"digest":"sha256:"+"b"*64}]}
        manifest={"schema":"aerith.public.ohlcv.spot.bulk-monthly.index.v1",
          "month":"2026-09","interval":"1m","requested":1,"verified":1,
          "unavailable":0,"candles":43200,"assets":[record]}
        monthly["addendum"]=(release,manifest)
        result=cat.build(venue,monthly)
        self.assertEqual(result["release_months"],1)
        self.assertEqual(result["release_count"],2)
        self.assertEqual(result["archived_assets"],2)
        self.assertEqual(result["native_1m_candles"],86400)
        self.assertEqual(next(x for x in result["assets"] if x["id"]=="polkadot")["months"][0]["release"],
                         release["tag_name"])

    def test_unavailable_is_never_counted_as_candles(self):
        venue,monthly=self.setup_rows(False)
        result=cat.build(venue,monthly)
        self.assertEqual(result["archived_assets"],0)
        self.assertEqual(result["assets"][0]["missing_months"],["2026-09"])

    def test_tampered_or_missing_zip_digest_blocks_catalog(self):
        venue,monthly=self.setup_rows()
        monthly["2026-09"][0]["assets"][0]["digest"]="sha256:"+"b"*64
        with self.assertRaisesRegex(ValueError,"Unverified ZIP"):
            cat.build(venue,monthly)

    def test_repeated_id_and_unknown_source_block_catalog(self):
        venue,monthly=self.setup_rows()
        bad=monthly["2026-09"][1]["assets"][0]
        bad["asset_id"]="wrong-id"
        with self.assertRaisesRegex(ValueError,"Unknown"):
            cat.build(venue,monthly)
        venue,monthly=self.setup_rows()
        monthly["2026-09"][1]["assets"][0]["quote"]="USD"
        with self.assertRaisesRegex(ValueError,"Source, currency"):
            cat.build(venue,monthly)

if __name__=="__main__":
    unittest.main(verbosity=2)
