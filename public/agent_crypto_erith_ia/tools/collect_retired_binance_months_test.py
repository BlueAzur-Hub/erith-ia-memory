#!/usr/bin/env python3
"""Offline guards for recovery of historically listed, now delisted Spot markets."""
import json
import os
from pathlib import Path
import unittest
from unittest.mock import patch

import collect_retired_binance_months as app
import import_historical_bulk as bulk

def sample_catalog():
    assets = [{"id": f"other-{i}", "symbol": f"K{i}", "rank": i,
               "months": [], "name": f"Crypto {i}"} for i in range(1, 251)]
    assets[13] = {"id": "monero", "rank": 14, "symbol": "XMR",
                  "name": "Monero", "months": []}
    return {"schema":"aerith.public.ohlcv.top250.monthly-coverage-catalog.v1",
            "ranked":250,"quote":"USDT","assets":assets}


class RetiredSpotRecoveryTests(unittest.TestCase):
    def test_exact_official_identity_and_pre_delisting_months(self):
        owner=app.historical_owner(sample_catalog())
        self.assertEqual((owner["id"],owner["pair"],owner["rank"]),
                         ("monero","XMRUSDT",14))
        self.assertEqual(app.MONTHS[0],"2023-12")
        self.assertEqual(app.MONTHS[-1],"2023-01")
        self.assertEqual(len(app.MONTHS),12)
        self.assertTrue(all(month<"2024-02" for month in app.MONTHS))
        self.assertEqual(len({app.supplement.add_tag(x,[owner]) for x in app.MONTHS}),12)

    def test_catalog_drift_or_already_archived_refused(self):
        for mutation in ("id", "symbol", "months"):
            catalog=sample_catalog()
            x=catalog["assets"][13]
            if mutation=="id": x["id"]="monero-classic"
            if mutation=="symbol": x["symbol"]="MXMR"
            if mutation=="months": x["months"]=[{"month":"2023-12"}]
            with self.assertRaisesRegex(ValueError,"Monero|identity|already"):
                app.historical_owner(catalog)

    def test_rank_13_preserves_exact_xmr_owner_and_stable_release_tag(self):
        catalog=sample_catalog()
        old=catalog["assets"][12]
        x=catalog["assets"][13]
        catalog["assets"][12]={"id":"monero","rank":13,"symbol":"XMR",
                                "name":"Monero","months":[]}
        catalog["assets"][13]={**old,"rank":14}
        owner=app.historical_owner(catalog)
        self.assertEqual(owner["rank"],13)
        self.assertEqual(owner["rank_at_notice"],14)
        self.assertEqual(app.supplement.add_tag("2023-12",[owner]),
            app.supplement.add_tag("2023-12",[
                {"id":"monero","pair":"XMRUSDT","rank":14}]))
        # Historical proof is never attributed to the new occupant of rank 14.
        self.assertEqual(catalog["assets"][13]["id"],"other-13")

    def test_archive_rows_must_match_exact_month_file_digest_and_owner_tag(self):
        for field in ("file","sha256","release","candles"):
            catalog=sample_catalog()
            m={"month":"2023-01","pair":"XMRUSDT",
               "file":"XMRUSDT-1m-2023-01.zip",
               "sha256":"a"*64,
               "release":app.supplement.add_tag("2023-01",[
                   {"id":"monero","pair":"XMRUSDT"}]),
               "candles":44640}
            bad={**m,field:{"file":"WRONG.zip","sha256":"0"*63,
                    "release":"crypto-spot-bulk-add-2023-01-1m-deadbeefdead",
                    "candles":1}[field]}
            catalog["assets"][13]["months"]=[bad]
            with self.assertRaisesRegex(ValueError,"Existing Monero"):
                app.historical_owner(catalog)
            catalog["assets"][13]["months"]=[m]
            self.assertEqual(app.historical_owner(catalog)["id"],"monero")

    def test_preexisting_release_must_prove_monero_zip_and_manifest(self):
        from unittest.mock import Mock
        tag=app.supplement.add_tag("2023-12",[{"id":"monero","pair":"XMRUSDT"}])
        good={"tagName":tag,"isDraft":False,"assets":[
            {"name":"manifest.json"},
            {"name":"XMRUSDT-1m-2023-12.zip"}]}
        with patch.object(app.subprocess,"run",return_value=Mock(
                returncode=0,stdout=json.dumps(good),stderr="")):
            self.assertTrue(app.already_published(tag))
        forged={**good,"assets":[{"name":"manifest.json"},
                                 {"name":"OTHERUSDT-1m-2023-12.zip"}]}
        with patch.object(app.subprocess,"run",return_value=Mock(
                returncode=0,stdout=json.dumps(forged),stderr="")):
            with self.assertRaisesRegex(ValueError,"release owner"):
                app.already_published(tag)
        with self.assertRaisesRegex(ValueError,"Unowned"):
            app.already_published("crypto-spot-bulk-add-2023-12-1m-deadbeefdead")

    def test_negative_download_never_creates_release(self):
        publishes=[]
        def fake_import(month,owner,folder):
            return None,"Official archive HTTP 404"
        with patch.dict(os.environ,{"GITHUB_ACTIONS":"true","GH_TOKEN":"dummy",
                                    "GITHUB_SHA":"a"*40,
                                    "GITHUB_REPOSITORY":"BlueAzur-Hub/erith-ia-memory"}):
            result=app.collect(sample_catalog(),months=2,exists=lambda tag:False,
                               importer=fake_import,
                               publisher=lambda *args: publishes.append(args))
        self.assertEqual(result["published"],[])
        self.assertEqual(len(result["unavailable"]),2)
        self.assertEqual(publishes,[])
        self.assertFalse(result["catalog_updated"])

    def test_immutable_existing_release_skips_publication(self):
        with patch.dict(os.environ,{"GITHUB_ACTIONS":"true","GH_TOKEN":"dummy",
                                    "GITHUB_SHA":"a"*40,
                                    "GITHUB_REPOSITORY":"BlueAzur-Hub/erith-ia-memory"}):
            result=app.collect(sample_catalog(),months=2,
                               exists=lambda tag:True,
                               importer=lambda *args:self.fail("No second import"),
                               publisher=lambda *args:self.fail("No overwrite"))
        self.assertEqual(len(result["already_published"]),2)
        self.assertFalse(result["published"])

    def test_runner_required(self):
        with patch.dict(os.environ,{"GITHUB_ACTIONS":"false"}):
            with self.assertRaisesRegex(ValueError,"GitHub runner"):
                app.collect(sample_catalog(),months=1,exists=lambda tag:True)

    def test_unbounded_or_future_months_rejected(self):
        with self.assertRaisesRegex(ValueError,"Unbounded"):
            app.collect(sample_catalog(),months=13)
        with self.assertRaisesRegex(ValueError,"Only pre-delisting"):
            app.probe(sample_catalog(),month="2024-03")

if __name__=="__main__":
    unittest.main(verbosity=2)
