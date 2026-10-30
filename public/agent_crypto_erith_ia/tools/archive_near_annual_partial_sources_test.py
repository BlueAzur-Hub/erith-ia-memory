#!/usr/bin/env python3
"""Tests of immutable original-source staging guards, no market/network orders."""
from copy import deepcopy
from pathlib import Path
import json
import tempfile
import unittest
from unittest.mock import patch

import archive_near_annual_partial_sources as stage
import import_historical_bulk as bulk
import probe_near_annual_spot_month as probe


def valid_record(asset_id):
    rows, before = stage.EXPECTED[asset_id]
    return {
        "asset_id": asset_id,
        "original_source": {
            "original_native_minutes_observed": rows,
            "missing_before_first_original": before,
            "missing_inside_original_span": 0,
            "missing_after_last_original": 0,
            "full_month_native_minutes_expected": 44640,
            "has_full_month": False,
            "quote": "USDT",
            "native_resolution": "1m",
            "source_status": "ORIGINAL_ZIP_CHECKSUM_AND_OHLCV_VERIFIED_PARTIAL",
            "official_checksum_sha256": "a"*64,
            "source_sha256": "a"*64,
        },
    }


class PartialOriginalVaultTests(unittest.TestCase):
    def test_never_synthesize_a_calendar_month(self):
        self.assertEqual(sum(x[0] for x in stage.EXPECTED.values()), 120000)
        self.assertEqual(sum(x[1] for x in stage.EXPECTED.values()), 13920)
        self.assertEqual(stage.TOTAL_ORIGINAL+stage.TOTAL_PRELISTING,3*44640)
        for aid in stage.EXPECTED:
            stage.validate_record(valid_record(aid))
            bad=deepcopy(valid_record(aid))
            bad["original_source"]["has_full_month"]=True
            with self.assertRaisesRegex(ValueError,"cannot be promoted"):
                stage.validate_record(bad)

    def test_wrong_quote_original_checksum_or_internal_gap_is_rejected(self):
        for field,value in [("quote","USD"),("missing_inside_original_span",1),
                            ("missing_after_last_original",2),
                            ("official_checksum_sha256","b"*64)]:
            bad=valid_record("morpho")
            bad["original_source"][field]=value
            with self.subTest(field=field):
                with self.assertRaises(ValueError):
                    stage.validate_record(bad)

    def test_no_overwrite_or_network_when_stage_dir_is_not_empty(self):
        with tempfile.TemporaryDirectory() as root:
            folder=Path(root)/"nonempty"
            folder.mkdir()
            (folder/"manifest.json").write_text("already archived")
            with patch.object(bulk,"download",side_effect=AssertionError("Network forbidden")):
                with self.assertRaisesRegex(ValueError,"must start empty"):
                    stage.stage(folder)
            self.assertEqual((folder/"manifest.json").read_text(),"already archived")

    def test_uncertified_staged_source_is_never_accepted(self):
        with tempfile.TemporaryDirectory() as root:
            folder=Path(root)
            (folder/"manifest.json").write_text(json.dumps({
                "schema":stage.SCHEMA,"source_quote":"USDT",
                "release_tag":stage.RELEASE_TAG,
                "annual_full_months_added":0,"catalog_months_rewritten":0,
                "synthetic_candles":0,
                "original_source_ohlcv_rows":0,
                "prelisting_calendar_slots_not_filled":0,
                "internal_missing_slots":0,
                "assets":[],
            }))
            with self.assertRaisesRegex(ValueError,"manifest inconsistent"):
                stage.verify(folder)


if __name__ == "__main__":
    unittest.main(verbosity=2)
