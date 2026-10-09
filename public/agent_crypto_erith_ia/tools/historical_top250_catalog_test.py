#!/usr/bin/env python3
"""Offline Top250 catalog regression: identities, unavailable months and SHA refs."""
import json
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
