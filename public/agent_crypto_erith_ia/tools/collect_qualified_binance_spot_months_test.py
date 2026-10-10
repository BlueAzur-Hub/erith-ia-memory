#!/usr/bin/env python3
"""Offline source-owner, batch-window and immutable publication regressions."""
import datetime as dt
import json
from pathlib import Path
import tempfile
import unittest

import collect_qualified_binance_spot_months as app
import import_historical_bulk as bulk


def catalog():
    rows=[{"id":"other-"+str(i),"rank":i,"name":"Other",
           "symbol":"K"+str(i),"quote":"USDT","source":None,"months":0}
          for i in range(1,251)]
    for cid,symbol,rank,_,_ in app.SPECS:
        rows[rank-1]={"id":cid,"rank":rank,"name":symbol,"symbol":symbol,
                      "quote":"USDT","source":None,"months":0}
    return {"schema":"aerith.public.ohlcv.top250.federated-native-archives.v1",
            "ranked":250,"assets":rows}

class QualifiedSourceTests(unittest.TestCase):
    def test_eight_exact_ids_and_attested_trading_pairs(self):
        owned=app.owners(catalog())
        self.assertEqual(len(owned),8)
        self.assertEqual(len({a["pair"] for a in owned}),8)
        self.assertEqual(len({a["id"] for a in owned}),8)
        self.assertTrue(all(a["archive_owner"].startswith("official-binance")
                            for a in owned))
        self.assertTrue(all("binance.com/en/support/announcement/detail/"
                            in a["official_listing"] for a in owned))

    def test_frozen_id_rank_or_quote_cannot_be_reused(self):
        for field,value in (("id","wrong"),("rank",999),
                            ("quote","USD"),("symbol","M")):
            j=catalog()
            j["assets"][69][field]=value  # Jupiter, frozen rank 70
            with self.assertRaises(ValueError):
                app.owners(j)

    def test_preexisting_bitget_owner_cannot_be_double_counted(self):
        j=catalog()
        j["assets"][69].update({"months":1,"source":"Bitget Spot native 1m HTTPS"})
        with self.assertRaisesRegex(ValueError,"owner or quote"):
            app.owners(j)
        j["assets"][69].update({"months":2,"source":"Binance Spot official native 1m ZIPs"})
        self.assertEqual(len(app.owners(j)),8)

    def test_unique_immutable_month_tags_and_backwards_plan(self):
        now=dt.datetime(2026,10,12,tzinfo=dt.timezone.utc)
        first=app.select(catalog(),set(),now=now,limit=2)
        self.assertEqual([a["month"] for a in first],["2026-09","2026-08"])
        self.assertEqual(len(first[0]["assets"]),8)
        skip=app.select(catalog(),{first[0]["tag"]},now=now,limit=2)
        self.assertEqual([a["month"] for a in skip],["2026-08","2026-07"])
        with self.assertRaisesRegex(ValueError,"Excessive"):
            app.select(catalog(),set(),now=now,limit=13)

    def test_early_months_only_choose_listed_market_owners(self):
        now=dt.datetime(2021,6,12,tzinfo=dt.timezone.utc)
        picked=app.select(catalog(),set(),now=now,limit=1)
        self.assertEqual(picked[0]["month"],"2021-05")
        self.assertEqual([a["symbol"] for a in picked[0]["assets"]],["CAKE","CFX"])

    def test_missing_sources_remain_explicit_no_synthetic_candles(self):
        assets=app.owners(catalog())
        job={"month":"2026-09","assets":assets,"tag":app.supplement.add_tag("2026-09",assets)}
        writes=[]
        def importer(month,interval,folder,workers,limit,assets):
            out={"schema":bulk.SCHEMA,"month":month,"interval":interval,
                 "requested":len(assets),"verified":0,"unavailable":len(assets),
                 "candles":0,"assets":[{"asset_id":a["id"],"rank":a["rank"],
                 "pair":a["pair"],"source":"Binance Spot public monthly CSV",
                 "quote":"USDT","month":month,"interval":interval,
                 "status":"unavailable","reason":"not listed"} for a in assets]}
            (folder/"manifest.json").write_text(json.dumps(out))
            return out
        def writer(month,folder,manifest,owners):
            assert len(list(folder.glob("*.unavailable.json")))==8
            assert not list(folder.glob("*.zip"))
            proof=json.loads((folder/"manifest.json").read_text())
            assert len(proof["exact_id_official_listing_evidence"])==8
            assert all(json.loads(x.read_text())["no_synthetic_candles"]
                       for x in folder.glob("*.unavailable.json"))
            writes.append(1)
            return "https://github.com/example/source-proof"
        row=app.publish_one(job,importer,writer)
        self.assertEqual(row["native_1m_candles"],0)
        self.assertEqual(row["unavailable_assets"],8)
        self.assertEqual(writes,[1])

if __name__=="__main__":unittest.main(verbosity=2)
