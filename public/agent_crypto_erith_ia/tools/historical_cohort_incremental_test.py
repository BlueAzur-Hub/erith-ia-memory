#!/usr/bin/env python3
"""Offline Top 50 incremental archive regressions: no API, no real archive writes."""
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import collect_historical_cohort as source
import extend_historical_cohort as target
import extend_historical_universe as engine
from historical_cohort_test import fixture, fake_get


def prepared(root):
    snapshot, registry, universe, archive = fixture(root)
    def initial_get(endpoint, params):
        if endpoint.endswith("exchangeInfo") and params.get("symbol") == "CROUSDT":
            raise RuntimeError("not qualified during the actual Top 50 pilot")
        return fake_get(endpoint, params)
    with patch.object(source, "get_json", side_effect=initial_get), (
         patch.object(source.time, "time", return_value=1_800_000_000)):
        answer = source.collect(snapshot, registry, universe, archive)
    assert answer["new_assets"] == 12, answer
    return archive, json.loads((archive / "index.json").read_bytes())["snapshot_end_ms"]


def network(endpoint, params, missing=False):
    if endpoint.endswith("exchangeInfo"):
        pairs = json.loads(params["symbols"])
        return {"symbols": [
            {"symbol": p, "baseAsset": p[:-4], "quoteAsset": "USDT",
             "status": "TRADING", "isSpotTradingAllowed": True,
             "permissionSets": [["SPOT"]]} for p in pairs]}
    interval = next(x for x in engine.PERIODS.values()
                    if x[0] == params["interval"])
    step, count = interval[1], params["limit"]
    if missing and params["symbol"] == "NEARUSDT":
        count -= 1
    return [[params["startTime"] + step*i, "10", "12", "9", "11", "3",
             params["startTime"] + step*(i+1) - 1, "33", 2, "0", "0", "0"]
            for i in range(count)]


class IncrementalCohortTests(unittest.TestCase):
    def test_initial_twelve_then_append_noop_and_restart(self):
        with tempfile.TemporaryDirectory() as work:
            root, end = prepared(work)
            before = (root / "index.json").read_bytes()
            later = end + 5*3_600_000
            with patch.object(engine, "get_json", side_effect=network):
                first = target.collect(root, later, 288)
                self.assertEqual(first["result"], "APPENDED")
                self.assertGreater(first["new_candles"], 0)
                manifest = (root / "incremental/index.json").read_bytes()
                self.assertEqual(target.collect(root, later, 288)["result"], "NOOP")
                self.assertEqual(manifest, (root / "incremental/index.json").read_bytes())
                self.assertEqual(target.collect(root, later + 2*3_600_000, 288)["result"], "APPENDED")
            journal, owners, series, progress = target.inspect(root)
            self.assertEqual(len(owners), 12)
            self.assertEqual(len(series), 36)
            self.assertEqual(len({x["asset_id"] for x in journal["chunks"]}), 12)
            self.assertEqual(before, (root / "index.json").read_bytes())

    def test_missing_candle_blocks_publication(self):
        with tempfile.TemporaryDirectory() as work:
            root, end = prepared(work)
            before = (root / "index.json").read_bytes()
            with patch.object(engine, "get_json",
                              side_effect=lambda p,a:network(p,a,missing=True)):
                with self.assertRaisesRegex(ValueError, "Missing candle"):
                    target.collect(root, end+5*3_600_000, 288)
            self.assertFalse((root / "incremental/index.json").exists())
            self.assertEqual(before, (root / "index.json").read_bytes())

    def test_invalid_pair_and_sha_fail_closed(self):
        with tempfile.TemporaryDirectory() as work:
            root, end = prepared(work)
            def bad_pair(endpoint, params):
                result = network(endpoint, params)
                if endpoint.endswith("exchangeInfo"):
                    result["symbols"][0]["quoteAsset"] = "USDC"
                return result
            with patch.object(engine, "get_json", side_effect=bad_pair):
                with self.assertRaisesRegex(ValueError, "no longer approved"):
                    target.collect(root, end+5*3_600_000, 288)
            self.assertFalse((root / "incremental/index.json").exists())
            with patch.object(engine, "get_json", side_effect=network):
                target.collect(root, end+5*3_600_000, 288)
            ledger, _, _, _ = target.inspect(root)
            f = root / "incremental" / ledger["chunks"][0]["file"]
            f.write_bytes(f.read_bytes()+b"tamper")
            with self.assertRaisesRegex(ValueError, "SHA-256"):
                target.inspect(root)

    def test_source_baseline_must_not_change(self):
        with tempfile.TemporaryDirectory() as work:
            root, end = prepared(work)
            with patch.object(engine, "get_json", side_effect=network):
                target.collect(root, end+5*3_600_000, 288)
            p = root / "index.json"
            p.write_bytes(p.read_bytes()+b" ")
            with self.assertRaisesRegex(ValueError, "identity mismatch"):
                target.inspect(root)

    def test_limited_batch_and_offline_plan(self):
        with tempfile.TemporaryDirectory() as work:
            root, end = prepared(work)
            with self.assertRaisesRegex(ValueError, "Invalid bounded"):
                target.plan(root, end+80*24*3_600_000, 289)
            ledger, windows = target.plan(root, end+80*24*3_600_000, 288)
            self.assertEqual(len(windows), 36)
            self.assertTrue(any(x["available"]>288 for x in windows))
            self.assertTrue(all(0<=x["count"]<=288 for x in windows))
            self.assertFalse((root / "incremental/index.json").exists())


if __name__ == "__main__":
    unittest.main(verbosity=2)
