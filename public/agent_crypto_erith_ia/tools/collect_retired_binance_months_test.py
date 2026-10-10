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
