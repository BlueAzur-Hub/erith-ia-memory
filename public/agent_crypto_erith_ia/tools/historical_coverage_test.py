#!/usr/bin/env python3
"""Offline tests of Top50 source-of-truth inventory; real archived blobs are read."""
from collections import Counter
import unittest

import audit_historical_coverage as coverage


class CoverageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.report = coverage.summarize()

    def test_exact_market_and_owner_separation(self):
        d = self.report
        self.assertEqual(d["total_ranked"], 50)
        self.assertEqual(len(d["assets"]), 50)
        self.assertEqual(d["archived_assets"], 24)
        self.assertEqual(d["unarchived_assets"], 26)
        self.assertEqual(d["archive_owners"],
                         {"legacy_r10": 7, "universe": 5, "top50": 12})
        self.assertEqual([a["rank"] for a in d["assets"]], list(range(1, 51)))
        self.assertEqual(len(set(a["id"] for a in d["assets"])), 50)

    def test_no_imaginary_history_or_cross_source_conversion(self):
        for a in self.report["assets"]:
            self.assertEqual(bool(a["periods"]), a["archived"])
            if a["archived"]:
                self.assertEqual(set(a["periods"]), {"24h", "7d", "30d"})
                for entry in a["periods"].values():
                    self.assertEqual(entry["quote"], "USDT")
                    self.assertGreaterEqual(entry["last_open_ms"], entry["first_open_ms"])
            else:
                self.assertIsNone(a["archive_owner"])
                self.assertEqual(a["periods"], {})
                self.assertIn(a["status"], coverage.PENDING)

    def test_current_increments_are_not_confused_with_new_assets(self):
        d = self.report
        self.assertGreaterEqual(d["cohort_incremental_chunks"], 24)
        self.assertGreaterEqual(d["cohort_incremental_candles"], 432)
        self.assertGreaterEqual(d["universe_incremental_chunks"], 10)
        self.assertGreaterEqual(d["universe_incremental_candles"], 135)
        self.assertEqual(d["original_series"], 72)

    def test_unresolved_instruments_are_explicit(self):
        d = self.report
        missing = [a for a in d["assets"] if not a["archived"]]
        self.assertEqual(len(missing), 26)
        self.assertEqual(sum(d["unarchived_statuses"].values()), 26)
        self.assertTrue(any(a["symbol"] == "FIGR_HELOC" for a in missing))
        self.assertTrue(any(a["symbol"] == "CRO" for a in missing))


if __name__ == "__main__":
    unittest.main(verbosity=2)
