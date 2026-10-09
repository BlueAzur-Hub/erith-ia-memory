#!/usr/bin/env python3
"""Offline proof-ledger → bulk importer and immutable addendum tests."""
import datetime as dt
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import import_historical_bulk as bulk
import supplement_historical_bulk as supp

UTC=dt.timezone.utc
NOW=dt.datetime(2026,10,9,tzinfo=UTC)

PROVEN=[
 {"id":"hyperliquid","symbol":"HYPE","pair":"HYPEUSDT","rank":11,
  "archive_owner":"coingecko-binance-exact-id"},
 {"id":"polkadot","symbol":"DOT","pair":"DOTUSDT","rank":51,
  "archive_owner":"coingecko-binance-exact-id"},
 {"id":"aster-2","symbol":"ASTER","pair":"ASTERUSDT","rank":52,
  "archive_owner":"coingecko-binance-exact-id"}
]
LEGACY=[{"id":"bitcoin","symbol":"BTC","pair":"BTCUSDT","rank":1,
         "archive_owner":"legacy-r10"}]


def original(month):
    return "crypto-spot-bulk-"+month+"-1m"


def fixture(month,assets,folder):
    folder.mkdir(parents=True,exist_ok=True)
    first=assets[0]
    count=bulk.bounds(month,"1m")[1]
    name=f"{first['pair']}-1m-{month}.zip"
    data=b"test-fixture-only"
    (folder/name).write_bytes(data)
    records=[]
    for i,a in enumerate(assets):
        row={"asset_id":a["id"],"rank":a["rank"],"pair":a["pair"],
             "source":"Binance Spot public monthly CSV","quote":"USDT",
             "month":month,"interval":"1m"}
        if i==0:
            row.update(status="verified",candles=count,file=name,
                       sha256=hashlib.sha256(data).hexdigest(),zip_bytes=len(data))
        else:
            row.update(status="unavailable",reason="Month not yet fully listed")
        records.append(row)
    index={"schema":bulk.SCHEMA,"month":month,"interval":"1m",
           "requested":len(records),"verified":1,
           "unavailable":len(records)-1,"candles":count,
           "zip_bytes":len(data),"assets":records}
    (folder/"manifest.json").write_text(json.dumps(index))
    return index


class SupplementTests(unittest.TestCase):
    def test_real_exact_coingecko_id_evidence_expands_inventory(self):
        extra=bulk.confirmed_additions()
        self.assertGreaterEqual(len(extra),3)
        self.assertTrue({"hyperliquid","polkadot","aster-2"}
                        <= {x["id"] for x in extra})
        all_assets=bulk.inventory()
        self.assertEqual(len(all_assets),len(bulk.legacy_inventory())+len(extra))
        self.assertEqual(len({x["pair"] for x in all_assets}),len(all_assets))

    def test_source_tampering_or_cross_token_proof_fails_closed(self):
        with tempfile.TemporaryDirectory() as tmp:
            v=Path(tmp)/"venue.json";l=Path(tmp)/"ledger.json"
            v.write_bytes(bulk.VENUE_AUDIT.read_bytes())
            source=json.loads(bulk.IDENTITY_LEDGER.read_bytes())
            good=next(x for x in source["results"] if x["status"]=="approved_coingecko_binance_spot")
            good["evidence"][0]["ticker_coin_id"]="different-coin"
            l.write_text(json.dumps(source))
            with self.assertRaisesRegex(ValueError,"Identity approval inconsistent"):
                bulk.confirmed_additions(v,l)

    def test_prior_31_immutable_months_revisited_as_supplements(self):
        tags=[original("2026-09"),original("2026-08"),original("2026-07")]
        def existing(tag):
            return {"manifest.json","BTCUSDT-1m-"+tag[-10:-3]+".zip"}
        jobs=supp.choose(tags,PROVEN,existing,now=NOW)
        self.assertEqual([x["month"] for x in jobs],["2026-09","2026-08","2026-07"])
        self.assertTrue(all(len(x["assets"])==3 for x in jobs))

    def test_existing_addendum_deduplicates_coins_and_keeps_new_ones(self):
        month="2026-09"
        addon=supp.add_tag(month,PROVEN[:2])
        tags=[original(month),addon]
        def exist(tag):
            if tag==addon:
                return {"manifest.json","HYPEUSDT-1m-2026-09.zip",
                        "DOTUSDT-1m-2026-09.zip"}
            return {"manifest.json","BTCUSDT-1m-2026-09.zip"}
        jobs=supp.choose(tags,PROVEN,exist,now=NOW)
        self.assertEqual(len(jobs),1)
        self.assertEqual([x["id"] for x in jobs[0]["assets"]],["aster-2"])

    def test_second_run_no_new_assets_no_duplicate_releases(self):
        release_month="2026-09"
        tags=[original(release_month),supp.add_tag(release_month,PROVEN)]
        def files(t):
            if t.startswith("crypto-spot-bulk-add-"):
                return {"manifest.json"} | {
                    f"{x['pair']}-1m-{release_month}.zip" for x in PROVEN}
            return {"manifest.json","BTCUSDT-1m-2026-09.zip"}
        self.assertEqual(supp.choose(tags,PROVEN,files,now=NOW),[])

    def test_run_checks_sha_and_publishes_multiple_months(self):
        with patch.object(bulk,"confirmed_additions",return_value=PROVEN), \
             patch.object(bulk,"legacy_inventory",return_value=LEGACY):
            tags=[original("2026-09"),original("2026-08")]
            seen=[]
            def publisher(month,folder,manifest,assets):
                seen.append((month,manifest["verified"],len(assets)))
                self.assertTrue((folder/"manifest.json").exists())
                return "https://github.com/example/releases/tag/"+supp.add_tag(month,assets)
            r=supp.run(now=NOW,limit=2,releases=tags,
                       files=lambda tag:{"manifest.json","BTCUSDT-1m-2026-09.zip"},
                       importer=fixture,publisher=publisher)
            self.assertEqual(r["new_releases"],2)
            self.assertEqual(r["new_candles"],(30+31)*1440)
            self.assertEqual(seen,[("2026-09",1,3),("2026-08",1,3)])

    def test_bad_published_checksum_blocks_addendum(self):
        with patch.object(bulk,"confirmed_additions",return_value=PROVEN), \
             patch.object(bulk,"legacy_inventory",return_value=LEGACY):
            called=[]
            def wrong(month,assets,folder):
                result=fixture(month,assets,folder)
                result["assets"][0]["sha256"]="0"*64
                return result
            with self.assertRaisesRegex(ValueError,"SHA-256"):
                supp.run(now=NOW,limit=1,releases=[original("2026-09")],
                         files=lambda tag:{"manifest.json"},
                         importer=wrong,publisher=lambda *a:called.append(a))
            self.assertEqual(called,[])


    def test_incomplete_pairs_persist_negative_checkpoint_once(self):
        with patch.object(bulk,"confirmed_additions",return_value=PROVEN), \
             patch.object(bulk,"legacy_inventory",return_value=LEGACY):
            month="2026-09"
            tags=[original(month)]
            evidence={}
            def save(m,folder,manifest,assets):
                self.assertEqual(manifest["verified"],1)
                self.assertEqual(manifest["unavailable"],2)
                names={x.name for x in folder.iterdir()}
                self.assertIn("DOTUSDT-1m-2026-09.unavailable.json",names)
                self.assertIn("ASTERUSDT-1m-2026-09.unavailable.json",names)
                self.assertIn("HYPEUSDT-1m-2026-09.zip",names)
                evidence["names"]=names
                return "validated"
            result=supp.run(now=NOW,limit=1,releases=tags,
                      files=lambda name:{"manifest.json"},
                      importer=fixture,publisher=save)
            self.assertEqual(result["new_releases"],1)
            self.assertEqual(result["months"][0]["unavailable"],2)
            supplement=supp.add_tag(month,PROVEN)
            jobs=supp.choose([*tags,supplement],PROVEN,
                 lambda tag: evidence["names"] if tag==supplement
                             else {"BTCUSDT-1m-2026-09.zip","manifest.json"},now=NOW)
            self.assertEqual(jobs,[])

    def test_max_three_months_and_no_unproven_pairs(self):
        with self.assertRaisesRegex(ValueError,"Unsafe month"):
            supp.choose([original("2026-09")],PROVEN,lambda t:set(),now=NOW,max_months=250)
        with patch.object(bulk,"confirmed_additions",return_value=[]), \
             patch.object(bulk,"legacy_inventory",return_value=LEGACY):
            self.assertEqual(supp.run(now=NOW,releases=[original("2026-09")],
                             files=lambda t:{"manifest.json"})["new_releases"],0)


if __name__=="__main__":
    unittest.main(verbosity=2)
