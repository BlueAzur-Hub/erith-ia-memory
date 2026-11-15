"""Offline, reproducible security and time-unit tests for V4.6 archive pilot."""
from datetime import datetime, timezone
import calendar
import csv
import hashlib
import io
import unittest
import zipfile

from src.binance_monthly_v46 import MonthlyArchiveError, validate_month


def fixture(year=2020, month=2, *, mutate=None, entry=None, extra=False):
    name = f"BTCUSDT-1h-{year}-{month:02d}"
    factor = 1000000 if year >= 2025 else 1000
    start = int(datetime(year, month, 1, tzinfo=timezone.utc).timestamp())
    count = calendar.monthrange(year, month)[1] * 24
    rows = []
    for i in range(count):
        t = (start + i * 3600) * factor
        rows.append([str(t), "70000", "70010", "69990", "70001", "3.5",
                     str(t + 3600 * factor - 1), "0", "1", "0", "0", "0"])
    if mutate:
        mutate(rows)
    buffer = io.StringIO(newline="")
    csv.writer(buffer).writerows(rows)
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr(entry or name + ".csv", buffer.getvalue())
        if extra:
            z.writestr("unexpected.txt", "NO")
    blob = stream.getvalue()
    return blob, hashlib.sha256(blob).hexdigest() + "  " + name + ".zip"


class BinanceMonthlyV46Pilot(unittest.TestCase):
    def test_leap_day_2020_milliseconds_and_no_side_effects(self):
        blob, checksum = fixture()
        out = validate_month(blob, checksum, year=2020, month=2)
        self.assertEqual(out["rows"], 696)
        self.assertEqual(out["timestamp_input_unit"], "milliseconds")
        self.assertEqual(out["bars"][0][0], 1580515200)
        self.assertEqual(out["missing_bars"], 0)
        self.assertEqual(out["safety"], {"orders_real": 0, "network_calls": 0, "workspace_writes": 0})
        self.assertEqual(out["archive_sha256"], hashlib.sha256(blob).hexdigest())

    def test_january_2025_microseconds(self):
        blob, checksum = fixture(2025, 1)
        out = validate_month(blob, checksum, year=2025, month=1)
        self.assertEqual(out["rows"], 744)
        self.assertEqual(out["timestamp_input_unit"], "microseconds")
        self.assertEqual(out["bars"][0][0], 1735689600)

    def test_wrong_timestamp_scale_is_not_silently_converted(self):
        def bad(rows):
            rows[0][0] = str(int(rows[0][0]) // 1000)
        a, b = fixture(2025, 1, mutate=bad)
        with self.assertRaises(MonthlyArchiveError):
            validate_month(a, b, year=2025, month=1)

    def test_bad_expected_checksum_is_rejected(self):
        a, b = fixture()
        with self.assertRaises(MonthlyArchiveError):
            validate_month(a, "f" * 64 + "  BTCUSDT-1h-2020-02.zip", year=2020, month=2)

    def test_wrong_companion_file_name_is_rejected(self):
        a, b = fixture()
        with self.assertRaises(MonthlyArchiveError):
            validate_month(a, b.replace("BTCUSDT", "ETHUSDT"), year=2020, month=2)

    def test_zip_path_traversal_or_unexpected_file_is_rejected(self):
        a, b = fixture(entry="../BTCUSDT-1h-2020-02.csv")
        with self.assertRaises(MonthlyArchiveError):
            validate_month(a, b, year=2020, month=2)

    def test_more_than_one_file_is_rejected(self):
        a, b = fixture(extra=True)
        with self.assertRaises(MonthlyArchiveError):
            validate_month(a, b, year=2020, month=2)

    def test_missing_bar_is_rejected(self):
        def bad(rows):
            rows.pop(5)
        a, b = fixture(mutate=bad)
        with self.assertRaises(MonthlyArchiveError):
            validate_month(a, b, year=2020, month=2)

    def test_duplicate_timestamp_is_rejected(self):
        def bad(rows):
            rows[12][0] = rows[11][0]
        a, b = fixture(mutate=bad)
        with self.assertRaises(MonthlyArchiveError):
            validate_month(a, b, year=2020, month=2)

    def test_bad_ohlc_is_rejected(self):
        def bad(rows):
            rows[5][2] = "1"
        a, b = fixture(mutate=bad)
        with self.assertRaises(MonthlyArchiveError):
            validate_month(a, b, year=2020, month=2)

    def test_nonfinite_number_is_rejected(self):
        def bad(rows):
            rows[5][5] = "NaN"
        a, b = fixture(mutate=bad)
        with self.assertRaises(MonthlyArchiveError):
            validate_month(a, b, year=2020, month=2)

    def test_wrong_month_rejected(self):
        a, b = fixture()
        with self.assertRaises(MonthlyArchiveError):
            validate_month(a, b, year=2020, month=3)

    def test_excessive_archive_bytes_are_rejected(self):
        with self.assertRaises(MonthlyArchiveError):
            validate_month(b"Z" * 8000001, "f" * 64 + "  BTCUSDT-1h-2020-02.zip", year=2020, month=2)

    def test_replay_engine_compatible_cash_only(self):
        from src.engine import simulate
        a, b = fixture()
        out = validate_month(a, b, year=2020, month=2)
        report = simulate(out["bars"], {"kind": "CASH", "capital": 1000})
        self.assertEqual(report["safety"]["orders_real"], 0)
        self.assertEqual(report["results"]["return_pct"], 0.0)


if __name__ == "__main__":
    unittest.main()
