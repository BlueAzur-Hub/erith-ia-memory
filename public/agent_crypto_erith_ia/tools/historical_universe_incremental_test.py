#!/usr/bin/env python3
"""Offline regression and failure-atomicity tests for Universe incremental history."""
import json
import gzip
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import collect_historical_universe as initial
import extend_historical_universe as incr

IDS = {"usd-coin": "USDC", "dogecoin": "DOGE", "chainlink": "LINK",
       "cardano": "ADA", "stellar": "XLM"}


def baseline(directory):
    root = Path(directory)
    end = (1_800_000_000_000 // 14_400_000) * 14_400_000
    assets = [{"id": aid, "symbol": symbol, "name": aid, "rank": i+1,
               "candidate_pair": symbol+"USDT", "qualification": "qualified_spot"}
              for i, (aid, symbol) in enumerate(IDS.items())]
    rows = []
    for aid, symbol in IDS.items():
        for period, (interval, step, count) in initial.PERIODS.items():
            start = end - step * count
            candles = [[start + i * step, 10.0, 12.0, 9.0, 11.0, 3.0, 33.0, 2]
                       for i in range(count)]
            payload = {"schema": initial.BLOCK_SCHEMA, "source": "Binance Spot",
                       "asset_id": aid, "symbol": symbol, "pair": symbol+"USDT",
                       "quote": "USDT", "period": period, "interval": interval,
                       "first_ms": candles[0][0], "last_ms": candles[-1][0],
                       "rows": candles}
            zipped = gzip.compress(initial.encoded(payload), mtime=0)
            sha = initial.digest(zipped)
            name = f"blocks/{aid}_{period}_{sha[:16]}.json.gz"
            path = root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(zipped)
            rows.append({"file": name, "sha256": sha, "asset_id": aid,
                         "pair": symbol+"USDT", "period": period,
                         "interval": interval, "candles": count,
                         "first_ms": start, "last_ms": candles[-1][0]})
    index = {"schema": initial.SCHEMA, "source": "Binance Spot REST /api/v3/klines",
             "quote": "USDT", "publication": "MANUAL_BOUNDED_PILOT_NOT_LIVE",
             "assets": assets, "blocks": rows, "universe_size": 20,
             "verified_series": len(rows), "verified_candles": sum(r["candles"] for r in rows),
             "snapshot_end_ms": end, "market": {"sha256": "b"*64}, "registry_sha256": "c"*64}
    (root / "index.json").write_bytes(initial.encoded(index))
    return root, end


def mock_exchange_and_klines(path, args, missing=False):
    if path.endswith("exchangeInfo"):
        return {"symbols": [{"symbol": symbol+"USDT", "baseAsset": symbol,
                              "quoteAsset": "USDT", "status": "TRADING",
                              "isSpotTradingAllowed": True, "permissionSets": [["SPOT"]]}
                            for symbol in IDS.values()]}
    start, stop, count = args["startTime"], args["endTime"], args["limit"]
    interval = next(value for value in incr.PERIODS.values() if value[0] == args["interval"])
    step = interval[1]
    if missing and args["symbol"] == "DOGEUSDT":
        count -= 1
    return [[start + i*step, "10", "12", "9", "11", "3",
             start+i*step+step-1, "33", 2, "0", "0", "0"] for i in range(count)]


class IncrementalTests(unittest.TestCase):
    def test_first_append_repeat_noop_and_later_append_is_contiguous(self):
        with tempfile.TemporaryDirectory() as d:
            root, end = baseline(d)
            original = (root / "index.json").read_bytes()
            now = end + 5 * 3_600_000
            with patch.object(incr, "get_json", side_effect=mock_exchange_and_klines) as request:
                first = incr.append(root, now, 288)
                self.assertEqual(first["result"], "APPENDED")
                self.assertGreater(first["new_candles"], 0)
                self.assertEqual(incr.inspect(root)[0]["schema"], incr.LEDGER_SCHEMA)
                before = (root / "incremental/index.json").read_bytes()
                requests_before = request.call_count
                self.assertEqual(incr.append(root, now, 288)["result"], "NOOP")
                self.assertEqual(request.call_count, requests_before)
                self.assertEqual(before, (root / "incremental/index.json").read_bytes())
                second = incr.append(root, now + 2*3_600_000, 288)
                self.assertEqual(second["result"], "APPENDED")
                self.assertGreater(second["new_candles"], 0)
            ledger, assets, series, progress = incr.inspect(root)
            self.assertEqual(len(assets), 5)
            self.assertGreater(len(ledger["chunks"]), 5)
            self.assertEqual(len(series), 15)
            self.assertEqual(original, (root / "index.json").read_bytes())
            for meta in ledger["chunks"]:
                self.assertEqual(meta["pair"], IDS[meta["asset_id"]]+"USDT")
            self.assertEqual(len(list((root / "incremental/blocks").glob("*.json.gz"))),
                             len(ledger["chunks"]))

    def test_gap_fails_closed_does_not_publish_index_or_legacy_changes(self):
        with tempfile.TemporaryDirectory() as d:
            root, end = baseline(d)
            original = (root / "index.json").read_bytes()
            with patch.object(incr, "get_json", side_effect=lambda p,a:mock_exchange_and_klines(p,a,missing=True)):
                with self.assertRaisesRegex(ValueError, "Missing candle"):
                    incr.append(root, end+5*3_600_000, 288)
            self.assertFalse((root / "incremental/index.json").exists())
            self.assertEqual(original, (root / "index.json").read_bytes())
            self.assertEqual(incr.inspect(root)[0]["chunks"], [])

    def test_sha_tampering_and_baseline_replacement_are_rejected(self):
        with tempfile.TemporaryDirectory() as d:
            root, end = baseline(d)
            with patch.object(incr, "get_json", side_effect=mock_exchange_and_klines):
                incr.append(root, end+5*3_600_000, 288)
            ledger, _, _, _ = incr.inspect(root)
            tampered = root / "incremental" / ledger["chunks"][0]["file"]
            tampered.write_bytes(tampered.read_bytes() + b"tamper")
            with self.assertRaisesRegex(ValueError, "SHA-256"):
                incr.inspect(root)
        with tempfile.TemporaryDirectory() as d:
            root, end = baseline(d)
            with patch.object(incr, "get_json", side_effect=mock_exchange_and_klines):
                incr.append(root, end+5*3_600_000, 288)
            base = root / "index.json"
            base.write_bytes(base.read_bytes() + b" ")
            with self.assertRaisesRegex(ValueError, "ledger identity"):
                incr.inspect(root)

    def test_batch_cap_and_offline_planning(self):
        with tempfile.TemporaryDirectory() as d:
            root, end = baseline(d)
            with self.assertRaisesRegex(ValueError, "Invalid bounded"):
                incr.readiness(root, end+40*24*3_600_000, 289)
            ledger, windows = incr.readiness(root, end+40*24*3_600_000, 288)
            self.assertEqual(len(windows), 15)
            self.assertTrue(all(w["count"] <= 288 for w in windows))
            self.assertEqual(ledger["chunks"], [])
            self.assertTrue(any(w["available"] > 288 for w in windows))
            self.assertFalse((root / "incremental/index.json").exists())

    def test_mismatched_exchange_pair_is_refused(self):
        with tempfile.TemporaryDirectory() as d:
            root, end = baseline(d)
            def wrong(path, args):
                response = mock_exchange_and_klines(path, args)
                if path.endswith("exchangeInfo"):
                    response["symbols"][0]["quoteAsset"] = "USDC"
                return response
            with patch.object(incr, "get_json", side_effect=wrong):
                with self.assertRaisesRegex(ValueError, "no longer approved"):
                    incr.append(root, end + 5 * 3_600_000, 288)
            self.assertFalse((root / "incremental/index.json").exists())


    def test_missing_exchange_instrument_has_safe_failure_and_no_writes(self):
        with tempfile.TemporaryDirectory() as d:
            root, end = baseline(d)
            with patch.object(incr, "get_json", return_value={"symbols": []}):
                with self.assertRaisesRegex(ValueError, "no longer approved"):
                    incr.append(root, end + 5 * 3_600_000, 288)
            self.assertFalse((root / "incremental/index.json").exists())



if __name__ == "__main__":
    unittest.main(verbosity=2)
