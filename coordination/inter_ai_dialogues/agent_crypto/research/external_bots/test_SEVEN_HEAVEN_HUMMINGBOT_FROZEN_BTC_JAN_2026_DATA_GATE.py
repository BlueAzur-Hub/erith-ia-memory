"""Offline negative/positive fixtures for the immutable source gate (no bot installed)."""
import csv
from datetime import datetime, timezone
import importlib.util
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
import zipfile

FILE = Path(__file__).with_name("SEVEN_HEAVEN_HUMMINGBOT_FROZEN_BTC_JAN_2026_DATA_GATE.py")
spec = importlib.util.spec_from_file_location("frozen_gate", FILE)
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)


def make_zip(path: Path, *, rows: int, gap_row: int = -1, unit: str = "microseconds") -> None:
    mul = 1_000_000 if unit == "microseconds" else 1000
    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        with archive.open("BTCUSDT-1m-2026-01.csv", "w") as stream:
            for i in range(rows):
                t = gate.START + 60 * (i + (1 if i == gap_row else 0))
                row = [
                    str(t * mul), "70000.00", "70100.00", "69950.00",
                    "70040.00", "0.125", str((t + 60) * mul - 1),
                    "8750.0", "20", "0.05", "3500.0", "0"
                ]
                stream.write((",".join(row) + "\n").encode("ascii"))


class FrozenGateTests(unittest.TestCase):
    def test_exact_continuous_44640_rows_microseconds(self):
        with TemporaryDirectory() as td:
            root = Path(td)
            archive = root / gate.NAME
            make_zip(archive, rows=gate.EXPECTED)
            gate.SHA256 = gate.digest_file(archive)
            gate.ZIP_BYTES = archive.stat().st_size
            result = gate.convert(archive, root / "out")
            self.assertEqual(result["dataset"]["rows"], 44640)
            self.assertEqual(result["dataset"]["last_timestamp_sec"], gate.END)
            self.assertEqual(result["source"]["time_unit_in_source"], "microseconds")
            self.assertEqual(result["hummingbot_adapter_contract"]["feed_key"], "binance_BTC-USDT_1m")
            self.assertFalse(result["hummingbot_adapter_contract"]["controller_executed"])
            self.assertEqual(result["execution"]["orders"], 0)

    def test_wrong_sha_is_refused(self):
        with TemporaryDirectory() as td:
            root = Path(td)
            archive = root / gate.NAME
            make_zip(archive, rows=2)
            gate.ZIP_BYTES = archive.stat().st_size
            gate.SHA256 = "0" * 64
            with self.assertRaisesRegex(gate.GateError, "SHA256 mismatch"):
                gate.convert(archive, root / "out")

    def test_missing_minute_is_refused_without_publish(self):
        with TemporaryDirectory() as td:
            root = Path(td)
            archive = root / gate.NAME
            make_zip(archive, rows=8, gap_row=4, unit="milliseconds")
            gate.SHA256 = gate.digest_file(archive)
            gate.ZIP_BYTES = archive.stat().st_size
            with self.assertRaisesRegex(gate.GateError, "Timestamp gap"):
                gate.convert(archive, root / "out")
            self.assertFalse((root / "out" / "BTCUSDT-1m-2026-01_FROZEN_SOURCE_AUDIT.json").exists())


if __name__ == "__main__":
    unittest.main()
