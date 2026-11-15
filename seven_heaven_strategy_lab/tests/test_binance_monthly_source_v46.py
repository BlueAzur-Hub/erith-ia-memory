"""Offline tests for the bounded V4.6 monthly source adapter."""
from __future__ import annotations

import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from src.binance_monthly_source_v46 import (
    MonthlySourceError, RESERVE_BYTES, SOURCE_ID, install, list_sources, read_source,
)
from tests.test_binance_monthly_v46 import fixture


class BinanceMonthlySourceV46(unittest.TestCase):
    def test_install_certifies_and_stores_only_normalized_source(self):
        archive, checksum = fixture(2020, 1)
        with tempfile.TemporaryDirectory() as temp:
            workspace = Path(temp)
            with patch("src.binance_monthly_source_v46._download",
                       side_effect=[checksum.encode("ascii"), archive]):
                manifest = install(workspace)
            self.assertEqual(manifest["id"], SOURCE_ID)
            self.assertEqual(manifest["rows"], 744)
            self.assertFalse(manifest["raw_zip_retained"])
            folder = workspace / "binance_monthly_sources" / SOURCE_ID
            self.assertEqual(sorted(p.name for p in folder.iterdir()), ["bars.csv", "manifest.json"])
            loaded, bars = read_source(workspace, SOURCE_ID)
            self.assertEqual(loaded["archive_sha256_expected"], loaded["archive_sha256_observed"])
            self.assertEqual(len(bars), 744)
            sources = list_sources(workspace)
            self.assertEqual(len(sources), 1)
            self.assertEqual(sources[0]["certification"], "OFFICIAL_CHECKSUM_MATCHED_COMPLETE_MONTH")

    def test_bad_checksum_leaves_no_accepted_source(self):
        archive, checksum = fixture(2020, 1)
        bad = ("f" * 64 + "  BTCUSDT-1h-2020-01.zip").encode("ascii")
        with tempfile.TemporaryDirectory() as temp:
            workspace = Path(temp)
            with patch("src.binance_monthly_source_v46._download",
                       side_effect=[bad, archive]):
                with self.assertRaises(MonthlySourceError):
                    install(workspace)
            self.assertEqual(list_sources(workspace), [])
            self.assertFalse((workspace / "binance_monthly_sources" / SOURCE_ID / "manifest.json").exists())

    def test_disk_reserve_stops_before_network(self):
        with tempfile.TemporaryDirectory() as temp:
            with patch("src.binance_monthly_source_v46._free_bytes", return_value=RESERVE_BYTES), \
                 patch("src.binance_monthly_source_v46._download") as download:
                with self.assertRaises(MonthlySourceError):
                    install(Path(temp))
                download.assert_not_called()

    def test_tampered_normalized_csv_is_rejected(self):
        archive, checksum = fixture(2020, 1)
        with tempfile.TemporaryDirectory() as temp:
            workspace = Path(temp)
            with patch("src.binance_monthly_source_v46._download",
                       side_effect=[checksum.encode("ascii"), archive]):
                install(workspace)
            path = workspace / "binance_monthly_sources" / SOURCE_ID / "bars.csv"
            path.write_bytes(path.read_bytes() + b"\n")
            with self.assertRaises(MonthlySourceError):
                read_source(workspace, SOURCE_ID)

    def test_manifest_identity_is_rechecked(self):
        archive, checksum = fixture(2020, 1)
        with tempfile.TemporaryDirectory() as temp:
            workspace = Path(temp)
            with patch("src.binance_monthly_source_v46._download",
                       side_effect=[checksum.encode("ascii"), archive]):
                install(workspace)
            path = workspace / "binance_monthly_sources" / SOURCE_ID / "manifest.json"
            data = json.loads(path.read_text(encoding="utf-8"))
            data["pair"] = "ETH/USDT"
            path.write_text(json.dumps(data), encoding="utf-8")
            with self.assertRaises(MonthlySourceError):
                read_source(workspace, SOURCE_ID)

    def test_second_explicit_import_reuses_verified_cache_without_network(self):
        archive, checksum = fixture(2020, 1)
        with tempfile.TemporaryDirectory() as temp:
            workspace = Path(temp)
            with patch("src.binance_monthly_source_v46._download",
                       side_effect=[checksum.encode("ascii"), archive]):
                original = install(workspace)
            with patch("src.binance_monthly_source_v46._download") as download, \
                 patch("src.binance_monthly_source_v46._free_bytes", return_value=0):
                cached = install(workspace)
            download.assert_not_called()
            self.assertEqual(cached["stored_csv_sha256"], original["stored_csv_sha256"])


if __name__ == "__main__":
    unittest.main()
