#!/usr/bin/env python3
"""Offline tests: exact-ID approval, closed-month gap and no publication."""
from copy import deepcopy
import hashlib
import unittest
from unittest.mock import patch

import import_historical_bulk as bulk
import probe_near_annual_spot_month as probe


class NearAnnualSourceTests(unittest.TestCase):
    def records(self):
        import json
        return json.loads(probe.SOURCE.read_bytes()), bulk.confirmed_additions()

    def test_three_exact_approved_owners_and_proven_gap(self):
        year, owners = self.records()
        chosen = probe.choose(year, owners)
        self.assertEqual([x["id"] for x in chosen], list(probe.TARGET_IDS))
        self.assertTrue(all(x["pair"] == x["symbol"] + "USDT" for x in chosen))
        _, candles, _ = bulk.bounds(probe.TARGET_MONTH, "1m")
        self.assertEqual(candles, 44640)

    def test_rejects_unapproved_coin_owner_or_symbol_change(self):
        year, approved = self.records()
        with self.assertRaisesRegex(ValueError, "no independent Binance Spot approval"):
            probe.choose(year, [a for a in approved if a["id"] != "morpho"])
        changed = deepcopy(year)
        item = next(x for x in changed["assets"] if x["id"] == "aster-2")
        item["symbol"] = "WRONG"
        with self.assertRaisesRegex(ValueError, "pair or quote changed"):
            probe.choose(changed, approved)

    def test_rejects_year_gap_change_instead_of_faking_missing_history(self):
        year, approved = self.records()
        changed = deepcopy(year)
        item = next(x for x in changed["assets"] if x["id"] == "morpho")
        item["longest_contiguous_months"] = 12
        item["at_least_12_consecutive_months"] = True
        with self.assertRaisesRegex(ValueError, "Annual month gap changed"):
            probe.choose(changed, approved)

    def test_offline_plan_cannot_use_network_or_claim_month(self):
        with patch.object(bulk, "fetch_asset",
                          side_effect=AssertionError("Offline plan used network")):
            value = probe.run(probe=False)
        self.assertFalse(value["source_month_is_verified"])
        self.assertEqual(value["verified_assets"], 0)
        self.assertEqual(value["new_releases"], 0)
        self.assertEqual(value["new_catalog_rows"], 0)
        self.assertEqual(len(value["assets"]), 3)
        self.assertTrue(all(x["status"] == "NOT_YET_PROBED" for x in value["assets"]))

    def test_mocked_probe_checks_sha_but_does_not_publish(self):
        _, expected, _ = bulk.bounds(probe.TARGET_MONTH, "1m")
        def synthetic_test_double(asset, month, interval, folder):
            # Unit-test fixture only; NOT a real candle and never published.
            content = ("UNIT-TEST-FIXTURE:" + asset["id"]).encode()
            filename = asset["pair"] + "-test-source.zip"
            (folder / filename).write_bytes(content)
            return {
                "asset_id": asset["id"], "pair": asset["pair"],
                "status": "verified", "candles": expected,
                "file": filename,
                "sha256": hashlib.sha256(content).hexdigest(),
            }
        with patch.object(bulk, "fetch_asset", side_effect=synthetic_test_double):
            result = probe.run(probe=True)
        self.assertEqual(result["verified_assets"], 3)
        self.assertEqual(result["verified_original_minutes"], 3 * expected)
        self.assertFalse(result["source_month_is_verified"])
        self.assertEqual(result["new_releases"], 0)
        self.assertEqual(result["new_catalog_rows"], 0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
