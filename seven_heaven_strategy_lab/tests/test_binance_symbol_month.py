import calendar
import csv
from datetime import datetime, timezone
import hashlib
import io
import unittest
import zipfile

from src.binance_monthly_v46 import MonthlyArchiveError
from tools.binance_symbol_month import validate_symbol_month


def fixture(symbol="ETHUSDT", year=2024, month=1, *, remove_index=None):
    factor = 1_000_000 if year >= 2025 else 1_000
    start = int(datetime(year, month, 1, tzinfo=timezone.utc).timestamp())
    count = calendar.monthrange(year, month)[1] * 24
    rows = []
    for i in range(count):
        t = (start + i * 3600) * factor
        rows.append([
            str(t), "2300", "2310", "2290", "2305", "12.5",
            str(t + 3600 * factor - 1), "0", "1", "0", "0", "0"
        ])
    if remove_index is not None:
        rows.pop(remove_index)
    csv_io = io.StringIO(newline="")
    csv.writer(csv_io).writerows(rows)
    name = f"{symbol}-1h-{year}-{month:02d}"
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr(name + ".csv", csv_io.getvalue())
    blob = buf.getvalue()
    checksum = hashlib.sha256(blob).hexdigest() + "  " + name + ".zip"
    return blob, checksum


class BinanceSymbolMonthTests(unittest.TestCase):
    def test_eth_month_is_strictly_certified(self):
        blob, checksum = fixture()
        out = validate_symbol_month(blob, checksum, symbol="ETHUSDT", year=2024, month=1)
        self.assertEqual(out["pair"], "ETH/USDT")
        self.assertEqual(out["rows"], 744)
        self.assertEqual(out["missing_bars"], 0)
        self.assertEqual(out["safety"]["orders_real"], 0)

    def test_2025_eth_microseconds_are_accepted(self):
        blob, checksum = fixture(year=2025, month=2)
        out = validate_symbol_month(blob, checksum, symbol="ETHUSDT", year=2025, month=2)
        self.assertEqual(out["timestamp_input_unit"], "microseconds")
        self.assertEqual(out["rows"], 672)

    def test_gap_is_rejected_not_repaired(self):
        blob, checksum = fixture(remove_index=100)
        with self.assertRaises(MonthlyArchiveError):
            validate_symbol_month(blob, checksum, symbol="ETHUSDT", year=2024, month=1)

    def test_fixed_top5_research_symbols_are_certified(self):
        expected = {
            "BNBUSDT": "BNB/USDT",
            "XRPUSDT": "XRP/USDT",
            "SOLUSDT": "SOL/USDT",
        }
        for symbol, pair in expected.items():
            with self.subTest(symbol=symbol):
                blob, checksum = fixture(symbol=symbol)
                out = validate_symbol_month(blob, checksum, symbol=symbol, year=2024, month=1)
                self.assertEqual(out["pair"], pair)
                self.assertEqual(out["rows"], 744)

    def test_symbol_outside_allowlist_is_rejected(self):
        blob, checksum = fixture(symbol="ADAUSDT")
        with self.assertRaises(MonthlyArchiveError):
            validate_symbol_month(blob, checksum, symbol="ADAUSDT", year=2024, month=1)


if __name__ == "__main__":
    unittest.main()
