from datetime import datetime, timezone
import calendar
import csv
import hashlib
import io
from pathlib import Path
import tempfile
import unittest
import zipfile

from tools.certify_binance_history import InventoryError, certify_directory


def write_fixture(root: Path, year: int, month: int, *, missing=False):
    name = f"BTCUSDT-1h-{year}-{month:02d}"
    factor = 1_000_000 if year >= 2025 else 1_000
    start = int(datetime(year, month, 1, tzinfo=timezone.utc).timestamp())
    count = calendar.monthrange(year, month)[1] * 24
    rows = []
    for i in range(count):
        t = (start + i * 3600) * factor
        rows.append([str(t), "70000", "70010", "69990", "70001", "3.5",
                     str(t + 3600 * factor - 1), "0", "1", "0", "0", "0"])
    if missing:
        rows.pop(12)
    csv_io = io.StringIO(newline="")
    csv.writer(csv_io).writerows(rows)
    blob_io = io.BytesIO()
    with zipfile.ZipFile(blob_io, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr(name + ".csv", csv_io.getvalue())
    blob = blob_io.getvalue()
    (root / (name + ".zip")).write_bytes(blob)
    (root / (name + ".zip.CHECKSUM")).write_text(
        hashlib.sha256(blob).hexdigest() + "  " + name + ".zip\n", encoding="ascii"
    )


class LongHistoryCertifierTests(unittest.TestCase):
    def test_three_contiguous_months_certify_without_side_effects(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for month in (1, 2, 3):
                write_fixture(root, 2019, month)
            out = certify_directory(root, require_contiguous=True)
            self.assertEqual(out["months_certified"], 3)
            self.assertEqual(out["months_rejected"], 0)
            self.assertEqual(out["months"][0]["month"], "2019-01")
            self.assertEqual(out["months"][1]["rows"], 672)
            self.assertEqual(out["safety"], {"orders_real": 0, "network_calls": 0, "workspace_writes": 0})

    def test_non_contiguous_block_is_rejected_when_requested(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            write_fixture(root, 2019, 1)
            write_fixture(root, 2019, 3)
            with self.assertRaises(InventoryError):
                certify_directory(root, require_contiguous=True)

    def test_month_with_missing_bar_is_reported_not_repaired(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            write_fixture(root, 2020, 1, missing=True)
            out = certify_directory(root)
            self.assertEqual(out["status"], "PARTIAL_WITH_REJECTIONS")
            self.assertEqual(out["months_certified"], 0)
            self.assertEqual(out["months_rejected"], 1)
            self.assertTrue(any(x in out["rejected"][0]["reason"] for x in ("Mois incomplet", "Bougies manquantes")))

    def test_missing_checksum_blocks_inventory(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            write_fixture(root, 2021, 5)
            next(root.glob("*.CHECKSUM")).unlink()
            with self.assertRaises(InventoryError):
                certify_directory(root)

    def test_orphan_checksum_blocks_inventory(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "BTCUSDT-1h-2021-05.zip.CHECKSUM").write_text("x", encoding="ascii")
            with self.assertRaises(InventoryError):
                certify_directory(root)


if __name__ == "__main__":
    unittest.main()
