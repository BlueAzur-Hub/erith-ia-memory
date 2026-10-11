#!/usr/bin/env python3
"""Offline tests for five-market period materialization and gap-aware Max."""
import copy
import gzip
import json
import tempfile
import unittest
from pathlib import Path

import build_verified_periods as v


class PeriodTests(unittest.TestCase):
    def hour(self, timestamp, price=100):
        return [timestamp, price, price + 3, price - 3, price + 1, 2.5, 250, 3]

    def test_seven_exact_time_windows(self):
        self.assertEqual([x[0] for x in v.WINDOWS],
                         ["24h", "7j", "30j", "60j", "90j", "1an", "Max"])
        self.assertEqual([x[2] for x in v.WINDOWS],
                         [1440, 2016, 720, 1440, 2160, 365, None])
        self.assertEqual(len(v.PAIRS), 5)

    def test_daily_preserves_real_ohlcv_and_trades(self):
        rows = [self.hour(i * 3600000, 100 + i) for i in range(24)]
        candles = v.daily(rows)
        self.assertEqual(len(candles), 1)
        self.assertEqual(candles[0][0:5], [0, 100, 126, 97, 124])
        self.assertAlmostEqual(candles[0][5], 60.0)
        self.assertEqual(candles[0][6], 6000)
        self.assertEqual(candles[0][7], 72)

    def test_incomplete_day_refused(self):
        rows = [self.hour(i * 3600000) for i in range(24) if i != 8]
        with self.assertRaisesRegex(ValueError, "Incomplete historical day"):
            v.daily(rows)

    def test_max_gaps_documented_and_no_bridge(self):
        day = 86400000
        rows = [self.hour(i * 3600000) for i in range(24)]
        rows += [self.hour(3 * day + i * 3600000, 103) for i in range(24)]
        derived = v.daily(rows)
        self.assertEqual(len(derived), 2)
        self.assertEqual(v.gaps(derived, "1d"), [{
            "start_ms": day, "end_exclusive_ms": 3 * day, "missing_bars": 2
        }])
        with self.assertRaisesRegex(ValueError, "gap"):
            v.validate(derived, "1d")

    def test_duplicate_and_invalid_ohlcv_refused(self):
        rows = [self.hour(0), self.hour(0)]
        with self.assertRaisesRegex(ValueError, "Invalid OHLCV"):
            v.validate(rows, "1h", allow_gaps=True)
        rows = [self.hour(0), self.hour(3600000)]
        rows[1][3] = 110
        with self.assertRaisesRegex(ValueError, "Invalid OHLCV"):
            v.validate(rows, "1h")

    def test_deterministic_gzip_and_digest(self):
        obj = {"rows": [[0, 3.0, 4.0, 2.0, 3.5, 2, 4, 1]], "quote": "USDT"}
        raw = v.pack(obj)
        self.assertEqual(raw, v.pack(obj))
        self.assertEqual(json.loads(gzip.decompress(raw)), obj)

    def test_real_catalogs_qualify_exact_core_five(self):
        month = v.index(v.BASE, "shared_monthly_views",
                        "aerith.public.ohlcv.shared.monthly-index.v1")
        hour = v.index(v.BASE, "shared_hourly_views",
                       "aerith.public.ohlcv.shared.contiguous-hourly-index.v1")
        annual = v.index(v.BASE, "calendar_year_hourly_shards",
                         "aerith.public.ohlcv.calendar-year-hourly-shard-index.v1")
        for aid, pair in v.PAIRS.items():
            a = v.asset(month, aid)
            b = v.asset(hour, aid)
            c = v.asset(annual, aid)
            self.assertEqual((a["pair"], b["pair"], c["pair"]), (pair, pair, pair))
            self.assertEqual(a["month"], b["last_month"])
            self.assertEqual(b["months"], 12)
            self.assertGreaterEqual(len(c["shards"]), 1)
            self.assertEqual(b["native_1m_count"], b["hourly_count"] * 60)

    def test_wrong_byte_checksum_refused(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            folder = root / "shared_hourly_views"
            folder.mkdir()
            raw = v.pack({"quote": "USDT"})
            (folder / "example.json.gz").write_bytes(raw)
            with self.assertRaisesRegex(ValueError, "SHA-256"):
                v.source(root, "shared_hourly_views",
                         {"file": "example.json.gz", "bytes": len(raw),
                          "sha256": "0" * 64})


if __name__ == "__main__":
    unittest.main(verbosity=2)
