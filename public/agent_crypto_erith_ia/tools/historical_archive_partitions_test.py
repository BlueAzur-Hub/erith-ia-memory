#!/usr/bin/env python3
"""Offline tests of sealed manifest rotation with the two real collection engines."""
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import historical_archive_partitions as sealing
import extend_historical_universe as universe
import extend_historical_cohort as cohort
from historical_universe_incremental_test import baseline, mock_exchange_and_klines
from historical_cohort_incremental_test import prepared, network


class SealedArchiveTests(unittest.TestCase):
    def test_universe_seal_reopen_append_noop_and_tamper(self):
        with tempfile.TemporaryDirectory() as d:
            root, end = baseline(d)
            frozen = (root/"index.json").read_bytes()
            t = end + 5 * 3_600_000
            with patch.object(sealing, "SEAL_THRESHOLD", 9), (
                 patch.object(sealing, "KEEP_RECENT", 2)), (
                 patch.object(universe, "get_json", side_effect=mock_exchange_and_klines)):
                first = universe.append(root, t, 288)
                self.assertEqual(first["result"], "APPENDED")
                ledger, _, _, _ = universe.inspect(root)
                self.assertEqual(len(ledger["partitions"]), 1)
                self.assertEqual(len(ledger["chunks"]), 2)
                self.assertEqual(len(list(sealing.all_chunks(root/"incremental",ledger))), 15)
                pre_noop=(root/"incremental/index.json").read_bytes()
                self.assertEqual(universe.append(root,t,288)["result"],"NOOP")
                self.assertEqual(pre_noop,(root/"incremental/index.json").read_bytes())
                second=universe.append(root,t+2*3_600_000,288)
                self.assertEqual(second["result"],"APPENDED")
            ledger, _, _, _ = universe.inspect(root)
            all_entries=list(sealing.all_chunks(root/"incremental",ledger))
            self.assertEqual(len(all_entries), 25)
            self.assertEqual(len(ledger["partitions"]), 2)
            self.assertEqual(len(ledger["chunks"]), 2)
            self.assertEqual((root/"index.json").read_bytes(), frozen)
            self.assertEqual(len(list((root/"incremental/blocks").glob("*.gz"))),25)
            # A sealed manifest is an immutable SHA-256 verified object.
            manifest=root/"incremental"/ledger["partitions"][0]["file"]
            manifest.write_bytes(manifest.read_bytes()+b"untrusted")
            with self.assertRaisesRegex(ValueError,"SHA-256"):
                universe.inspect(root)

    def test_top50_seal_restart_and_candle_tampering(self):
        with tempfile.TemporaryDirectory() as d:
            root, end=prepared(d)
            original=(root/"index.json").read_bytes()
            with patch.object(sealing,"SEAL_THRESHOLD",20), (
                 patch.object(sealing,"KEEP_RECENT",4)), (
                 patch.object(universe,"get_json",side_effect=network)):
                cohort.collect(root,end+5*3_600_000,288)
                ledger, _, _, _ = cohort.inspect(root)
                self.assertEqual(len(ledger["partitions"]),1)
                self.assertEqual(len(ledger["chunks"]),4)
                self.assertEqual(len(list(sealing.all_chunks(root/"incremental",ledger))),36)
                cohort.collect(root,end+7*3_600_000,288)
            ledger, _, _, _ = cohort.inspect(root)
            self.assertEqual(len(ledger["partitions"]),2)
            self.assertEqual(len(ledger["chunks"]),4)
            self.assertEqual(len(list(sealing.all_chunks(root/"incremental",ledger))),60)
            self.assertEqual(original,(root/"index.json").read_bytes())
            self.assertEqual(len(list((root/"incremental/blocks").glob("*.gz"))),60)
            first=next(sealing.all_chunks(root/"incremental",ledger))
            candle_file=root/"incremental"/first["file"]
            candle_file.write_bytes(candle_file.read_bytes()+b"tamper")
            with self.assertRaisesRegex(ValueError,"SHA-256"):
                cohort.inspect(root)

    def test_reject_missing_duplicate_or_corrupt_manifest_without_any_mutation(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d)
            journal={"chunks":[{"candles":1} for _ in range(10)]}
            with patch.object(sealing,"SEAL_THRESHOLD",8), (
                 patch.object(sealing,"KEEP_RECENT",2)):
                rotated,files=sealing.rotate(root,journal)
            self.assertEqual(journal["chunks"],[{"candles":1} for _ in range(10)])
            self.assertEqual(len(files),1)
            self.assertFalse((root/files[0][0]).exists())
            sealing.persist_partitions(root,files,lambda p,c:(p.parent.mkdir(parents=True,exist_ok=True),p.write_bytes(c)))
            chunks=list(sealing.all_chunks(root,rotated))
            self.assertEqual(chunks,journal["chunks"])
            corrupt={**rotated,"partitions":rotated["partitions"]*2}
            with self.assertRaisesRegex(ValueError,"Invalid sealed partition path"):
                list(sealing.all_chunks(root,corrupt))
            rotated["partitions"][0]["sha256"]="0"*64
            with self.assertRaisesRegex(ValueError,"Invalid sealed partition path"):
                list(sealing.all_chunks(root,rotated))


if __name__=="__main__":
    unittest.main(verbosity=2)
