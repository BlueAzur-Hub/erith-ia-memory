#!/usr/bin/env python3
"""Offline tests for the isolated historical universe pilot. No public requests."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

PATH = Path(__file__).with_name("collect_historical_universe.py")
spec = importlib.util.spec_from_file_location("historical_universe_collector", PATH)
collector = importlib.util.module_from_spec(spec)
spec.loader.exec_module(collector)


class UniverseTests(unittest.TestCase):
    def test_market_identity_and_legacy_protected(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / "market.json"
            source.write_bytes(collector.encoded({"coins": [
                {"id": "bitcoin", "symbol": "BTC", "rank": 1},
                {"id": "dogecoin", "symbol": "DOGE", "rank": 2},
                {"id": "tether", "symbol": "USDT", "rank": 3},
            ]}))
            registry = {"bitcoin": {"symbol": "BTC", "mode": "legacy"},
                        "dogecoin": {"symbol": "DOGE", "mode": "pilot"}}
            rows, _ = collector.market(source, 3, registry)
            self.assertEqual([x["qualification"] for x in rows],
                             ["legacy_preserved", "candidate", "identity_review_required"])
            self.assertEqual([x["candidate_pair"] for x in rows], [None, "DOGEUSDT", None])

    def test_collect_verify_and_corruption_rejection(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source, register, archive = root / "market.json", root / "approved.json", root / "store"
            source.write_bytes(collector.encoded({"coins": [
                {"id": "bitcoin", "symbol": "BTC", "rank": 1},
                {"id": "dogecoin", "symbol": "DOGE", "rank": 2},
            ]}))
            register.write_bytes(collector.encoded({"schema": "aerith.public.ohlcv.spot.universe.instruments.v1",
                "assets": {"bitcoin": {"symbol": "BTC", "mode": "legacy"},
                           "dogecoin": {"symbol": "DOGE", "mode": "pilot"}}}))
            fixed_time = 1760000000
            cutoff = (int((fixed_time - 90) * 1000) // 14_400_000) * 14_400_000
            def fake_get(url, args):
                if url.endswith("exchangeInfo"):
                    return {"symbols": [{"symbol": "DOGEUSDT", "baseAsset": "DOGE",
                       "quoteAsset": "USDT", "status": "TRADING",
                       "isSpotTradingAllowed": True, "permissionSets": [["SPOT"]]}]}
                interval = next(v for v in collector.PERIODS.values() if v[0] == args["interval"])
                step, count = interval[1], interval[2]
                self.assertEqual(args["startTime"], cutoff - step * count)
                self.assertEqual(args["endTime"], cutoff - 1)
                rows = []
                for i in range(count):
                    opened = cutoff - count * step + step * i
                    rows.append([opened, "10", "12", "9", "11", "3", opened + step - 1,
                                 "33", 2, "0", "0", "0"])
                return rows
            with patch.object(collector, "get_json", side_effect=fake_get), patch.object(collector.time, "time", return_value=fixed_time):
                report = collector.collect(source, register, archive, 2)
            self.assertEqual(report["series"], 3)
            self.assertEqual(report["candles"], 288+168+180)
            self.assertEqual(collector.validate_index(archive)["blocks"], 3)
            index = json.loads((archive / "index.json").read_text())
            self.assertEqual(index["assets"][0]["qualification"], "legacy_preserved")
            self.assertEqual({x["asset_id"] for x in index["blocks"]}, {"dogecoin"})
            with self.assertRaisesRegex(ValueError, "no replacement"):
                collector.collect(source, register, archive, 2)
            block = archive / index["blocks"][0]["file"]
            block.write_bytes(block.read_bytes() + b"tampered")
            with self.assertRaisesRegex(ValueError, "digest mismatch"):
                collector.validate_index(archive)

    def test_missing_closed_candle_rejected(self):
        end = 4_000_000
        with self.assertRaisesRegex(ValueError, "Missing candle"):
            collector.validate_rows([], 300_000, 2, end)


if __name__ == "__main__":
    unittest.main(verbosity=2)
