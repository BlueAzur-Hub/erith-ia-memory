#!/usr/bin/env python3
"""Offline regression on seven REAL published additional Top50 OHLCV snapshots.

Reuse exactly the existing twelve-asset engine, mock only Binance responses,
never mutate actual GitHub/source archives, and verify sealed partitions.
"""
import json
from pathlib import Path
import shutil
import tempfile
import unittest
from unittest.mock import patch

import audit_historical_coverage as audit
import collect_historical_remaining as additional
import extend_historical_cohort as incremental
import extend_historical_universe as engine
import historical_archive_partitions as partitions
from historical_cohort_incremental_test import network


def copy_source(where):
    root = Path(where) / "top50-additional"
    shutil.copytree(additional.OUTPUT, root)
    baseline = (root / "index.json").read_bytes()
    return root, baseline, json.loads(baseline)["snapshot_end_ms"]


class AdditionalIncrementalTests(unittest.TestCase):
    def test_existing_seven_real_owners_are_verified(self):
        ledger, approved, originals, latest = incremental.inspect(additional.OUTPUT)
        self.assertEqual(len(approved), 7)
        self.assertEqual(len(originals), 21)
        self.assertEqual(set(approved), {"usds", "ethena-usde", "usd1-wlfi",
                                        "quant-network", "tether-gold",
                                        "pump-fun", "ripple-usd"})
        self.assertTrue(all(approved[aid] == originals[aid, p]["pair"]
                            for aid in approved for p in ("24h", "7d", "30d")))

    def test_append_noop_restart_integrity_and_audit(self):
        with tempfile.TemporaryDirectory() as folder:
            root, original, end = copy_source(folder)
            now = end + 5 * 3_600_000
            ledger, candidates = incremental.plan(root, now, 288)
            self.assertEqual(len(candidates), 21)
            self.assertGreater(sum(w["count"] for w in candidates), 0)
            with patch.object(engine, "get_json", side_effect=network):
                first = incremental.collect(root, now, 288)
                self.assertEqual(first["result"], "APPENDED")
                self.assertGreater(first["new_chunks"], 0)
                self.assertGreater(first["new_candles"], 0)
                journal = (root / "incremental/index.json").read_bytes()
                self.assertEqual(incremental.collect(root, now, 288)["result"], "NOOP")
                self.assertEqual((root / "incremental/index.json").read_bytes(), journal)
                incremental.collect(root, now + 2 * 3_600_000, 288)
            ledger, approved, originals, tips = incremental.inspect(root)
            self.assertEqual((root / "index.json").read_bytes(), original)
            self.assertEqual(len(approved), 7)
            self.assertEqual(len(originals), 21)
            self.assertGreater(len(ledger["chunks"]), first["new_chunks"])
            self.assertTrue(all(tips[(a,p)] >= originals[(a,p)]["last_ms"]
                                for (a,p) in originals))
            inventory = audit.summarize(additional_dir=root)
            self.assertEqual(inventory["archived_assets"],31)
            self.assertEqual(inventory["original_series"],93)
            self.assertGreater(inventory["additional_incremental_candles"],0)
            last = next(iter(ledger["chunks"]))
            damaged = root / "incremental" / last["file"]
            damaged.write_bytes(damaged.read_bytes()+b"altered")
            with self.assertRaisesRegex(ValueError, "SHA-256"):
                incremental.inspect(root)

    def test_missing_closed_candle_rejects_whole_batch(self):
        with tempfile.TemporaryDirectory() as folder:
            root, frozen, end = copy_source(folder)
            def invalid(endpoint, params):
                data = network(endpoint, params)
                if endpoint.endswith("/klines") and params["symbol"] == "USDSUSDT":
                    return data[:-1]
                return data
            with patch.object(engine, "get_json", side_effect=invalid):
                with self.assertRaisesRegex(ValueError, "Missing candle"):
                    incremental.collect(root, end + 5 * 3_600_000, 288)
            self.assertEqual((root/"index.json").read_bytes(), frozen)
            self.assertFalse((root/"incremental/index.json").exists())

    def test_wrong_spot_pair_cannot_be_archived(self):
        with tempfile.TemporaryDirectory() as folder:
            root, frozen, end = copy_source(folder)
            def wrong(endpoint, params):
                data = network(endpoint, params)
                if endpoint.endswith("/exchangeInfo"):
                    data["symbols"][0]["quoteAsset"] = "USDC"
                return data
            with patch.object(engine, "get_json", side_effect=wrong):
                with self.assertRaisesRegex(ValueError, "no longer approved"):
                    incremental.collect(root, end + 5 * 3_600_000, 288)
            self.assertEqual((root/"index.json").read_bytes(), frozen)
            self.assertFalse((root/"incremental/index.json").exists())

    def test_sealed_reference_partition_preserves_every_block(self):
        with tempfile.TemporaryDirectory() as folder:
            root, frozen, end = copy_source(folder)
            with patch.object(partitions, "SEAL_THRESHOLD", 12), (
                 patch.object(partitions, "KEEP_RECENT", 3)), (
                 patch.object(engine, "get_json", side_effect=network)):
                incremental.collect(root, end + 5 * 3_600_000, 288)
                ledger, _, _, _ = incremental.inspect(root)
                self.assertEqual(len(ledger["partitions"]), 1)
                self.assertEqual(len(ledger["chunks"]), 3)
                self.assertEqual(len(list(partitions.all_chunks(root/"incremental",ledger))),
                                 first_count := ledger["partitions"][0]["chunks"]+3)
                incremental.collect(root, end + 7 * 3_600_000, 288)
            ledger, _, _, _ = incremental.inspect(root)
            self.assertEqual(len(ledger["partitions"]), 2)
            self.assertEqual((root/"index.json").read_bytes(), frozen)
            self.assertGreater(len(list(partitions.all_chunks(root/"incremental",ledger))),
                               first_count)
            self.assertEqual(len(list((root/"incremental/blocks").glob("*.gz"))),
                             len(list(partitions.all_chunks(root/"incremental",ledger))))
            part = root/"incremental"/ledger["partitions"][0]["file"]
            part.write_bytes(part.read_bytes() + b"tamper")
            with self.assertRaisesRegex(ValueError,"SHA-256"):
                incremental.inspect(root)


if __name__ == "__main__":
    unittest.main(verbosity=2)
