#!/usr/bin/env python3
"""Offline tests for continuous GitHub Release monthly historical accumulation."""
import datetime as dt
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import import_historical_bulk as bulk
import orchestrate_historical_bulk as app

UTC=dt.timezone.utc
ASSETS=[{"id":"bitcoin","pair":"BTCUSDT","rank":1,"symbol":"BTC",
         "archive_owner":"historical-r10"},
        {"id":"ethereum","pair":"ETHUSDT","rank":2,"symbol":"ETH",
         "archive_owner":"historical-r10"}]

def fixture(month,folder,all_unavailable=False,tamper=False):
    rows=[]
    count=bulk.bounds(month,"1m")[1]
    for i,a in enumerate(ASSETS):
        if (i==1 or all_unavailable):
            rows.append({"asset_id":a["id"],"pair":a["pair"],"rank":a["rank"],
                         "source":"Binance Spot public monthly CSV","quote":"USDT",
                         "month":month,"interval":"1m","status":"unavailable",
                         "reason":"Full month unavailable"})
            continue
        name=a["pair"]+"-1m-"+month+".zip"
        data=("validated-public-binance-zip-"+month).encode()
        (folder/name).write_bytes(data+b"tampered" if tamper else data)
        rows.append({"asset_id":a["id"],"pair":a["pair"],"rank":a["rank"],
                     "source":"Binance Spot public monthly CSV","quote":"USDT",
                     "month":month,"interval":"1m","status":"verified",
                     "file":name,"sha256":bulk.sha256(data),"candles":count,
                     "zip_bytes":len(data)})
    manifest={"schema":bulk.SCHEMA,"month":month,"interval":"1m",
              "requested":len(rows),"verified":sum(x["status"]=="verified" for x in rows),
              "unavailable":sum(x["status"]!="verified" for x in rows),
              "candles":sum(x.get("candles",0) for x in rows),
              "zip_bytes":sum(x.get("zip_bytes",0) for x in rows),
              "assets":rows}
    (folder/"manifest.json").write_text(json.dumps(manifest))
    return manifest

class PlanTests(unittest.TestCase):
    def test_months_skip_existing_release_and_continue_backwards(self):
        now=dt.datetime(2026,10,9,tzinfo=UTC)
        r=app.select_months(now,["crypto-spot-bulk-2026-09-1m"],count=2)
        self.assertEqual(r,["2026-08","2026-07"])
        r=app.select_months(now,["crypto-spot-bulk-2026-09-1m",
                                "crypto-spot-bulk-2026-08-1m"],count=2)
        self.assertEqual(r,["2026-07","2026-06"])

    def test_seven_months_complete_btc_year_without_changing_old_releases(self):
        now=dt.datetime(2026,10,9,tzinfo=UTC)
        present=[app.tag(f"2026-{i:02d}") for i in range(5,10)]
        months=app.select_months(now,present,count=7)
        self.assertEqual(months,["2026-04","2026-03","2026-02",
                                 "2026-01","2025-12","2025-11","2025-10"])
        self.assertEqual(len(set(months)),7)
        with self.assertRaisesRegex(ValueError,"Unbounded"):
            app.select_months(now,present,count=8)

    def test_monthly_release_lag_and_all_future_months_refused(self):
        self.assertEqual(app.last_publishable(dt.datetime(2026,11,6,tzinfo=UTC)),"2026-09")
        self.assertEqual(app.last_publishable(dt.datetime(2026,11,8,tzinfo=UTC)),"2026-10")
        r=app.select_months(dt.datetime(2026,10,9,tzinfo=UTC),[],
                            floor="2026-09")
        self.assertEqual(r,["2026-09"])
        r=app.select_months(dt.datetime(2026,10,9,tzinfo=UTC),
                            ["crypto-spot-bulk-2026-09-1m"],floor="2026-09")
        self.assertEqual(r,[])
        with self.assertRaisesRegex(ValueError,"Unbounded"):
            app.select_months(dt.datetime(2026,10,9,tzinfo=UTC),[],count=250)

    def test_malformed_or_draft_release_is_not_a_checkpoint(self):
        now=dt.datetime(2026,10,9,tzinfo=UTC)
        r=app.select_months(now,[{"tagName":"crypto-spot-bulk-2026-09-1m","isDraft":True}],count=1)
        self.assertEqual(r,["2026-09"])
        self.assertEqual(app.tag("2026-08"),"crypto-spot-bulk-2026-08-1m")

    @patch.object(bulk,"inventory",return_value=ASSETS)
    def test_two_months_accumulate_without_waiting_for_new_assets(self,_):
        months=[]
        with tempfile.TemporaryDirectory() as td:
            root=Path(td)
            def publish(month,folder,manifest):
                months.append((month,manifest["verified"]))
                self.assertEqual(len(list(folder.glob("*.zip"))),manifest["verified"])
                return "https://github.com/example/releases/tag/"+app.tag(month)
            result=app.run(dt.datetime(2026,10,9,tzinfo=UTC),2,
                releases=["crypto-spot-bulk-2026-09-1m"],
                importer=lambda month,folder:fixture(month,folder),
                publisher=publish,output_root=root)
            self.assertEqual(result["months_planned"],["2026-08","2026-07"])
            self.assertEqual(result["published"],2)
            self.assertEqual(result["verified_candles"],(31+31)*1440)
            self.assertEqual([x[0] for x in months],["2026-08","2026-07"])
            self.assertFalse(result["max_proven"])

    @patch.object(bulk,"inventory",return_value=ASSETS)
    def test_bad_sha_blocks_release_publication(self,_):
        with tempfile.TemporaryDirectory() as td:
            published=[]
            with self.assertRaisesRegex(ValueError,"SHA-256"):
                app.run(dt.datetime(2026,10,9,tzinfo=UTC),1,
                    releases=["crypto-spot-bulk-2026-09-1m"],
                    importer=lambda month,folder:fixture(month,folder,tamper=True),
                    publisher=lambda *args:published.append(args),
                    output_root=Path(td))
            self.assertEqual(published,[])

    @patch.object(bulk,"inventory",return_value=ASSETS)
    def test_incomplete_historical_month_has_explicit_checkpoint(self,_):
        with tempfile.TemporaryDirectory() as td:
            called=[]
            result=app.run(dt.datetime(2026,10,9,tzinfo=UTC),1,
                releases=["crypto-spot-bulk-2026-09-1m"],
                importer=lambda month,folder:fixture(month,folder,all_unavailable=True),
                publisher=lambda month,folder,manifest:called.append(manifest) or "stub",
                output_root=Path(td))
            self.assertEqual(result["verified_candles"],0)
            self.assertEqual(result["months"][0]["unavailable"],2)
            self.assertEqual(result["published"],1)
            self.assertEqual(len(called),1)

if __name__=="__main__":
    unittest.main(verbosity=2)
