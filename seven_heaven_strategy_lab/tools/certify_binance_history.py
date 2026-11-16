"""Offline certification harness for sets of Binance Spot BTCUSDT 1h monthly archives.

This research utility deliberately performs no network calls and no workspace writes.
It consumes local ZIP + .CHECKSUM pairs, delegates month-level validation to the
V4.6 validator, and emits a deterministic inventory suitable for later review.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
import argparse
import json
from pathlib import Path
import re

from src.binance_monthly_v46 import MonthlyArchiveError, validate_month

FILE_RE = re.compile(r"^BTCUSDT-1h-(20\d{2})-(0[1-9]|1[0-2])\.zip$")

HISTORICAL_INCIDENT_MONTHS = {
    (2019, 3), (2019, 5), (2019, 8), (2019, 11),
    (2020, 2), (2020, 3), (2020, 4), (2020, 6), (2020, 11), (2020, 12),
    (2021, 2), (2021, 3), (2021, 4), (2021, 8),
}


class InventoryError(ValueError):
    """A local archive set cannot be certified as an inventory."""


@dataclass(frozen=True, order=True)
class MonthKey:
    year: int
    month: int

    @property
    def label(self) -> str:
        return f"{self.year:04d}-{self.month:02d}"


def _next_month(key: MonthKey) -> MonthKey:
    return MonthKey(key.year + (1 if key.month == 12 else 0), 1 if key.month == 12 else key.month + 1)


def _discover(root: Path) -> list[tuple[MonthKey, Path, Path]]:
    root = Path(root).resolve()
    if not root.is_dir():
        raise InventoryError("Répertoire d'archives absent")
    found: list[tuple[MonthKey, Path, Path]] = []
    seen: set[MonthKey] = set()
    for zip_path in sorted(root.glob("BTCUSDT-1h-*.zip")):
        match = FILE_RE.fullmatch(zip_path.name)
        if not match:
            raise InventoryError(f"Nom d'archive inattendu: {zip_path.name}")
        key = MonthKey(int(match.group(1)), int(match.group(2)))
        if key in seen:
            raise InventoryError(f"Mois dupliqué: {key.label}")
        seen.add(key)
        checksum_path = zip_path.with_name(zip_path.name + ".CHECKSUM")
        if not checksum_path.is_file():
            raise InventoryError(f"CHECKSUM absent: {zip_path.name}")
        found.append((key, zip_path, checksum_path))
    if not found:
        raise InventoryError("Aucune archive BTCUSDT 1h trouvée")
    orphan_checksums = []
    for checksum_path in root.glob("BTCUSDT-1h-*.zip.CHECKSUM"):
        zip_path = checksum_path.with_name(checksum_path.name.removesuffix(".CHECKSUM"))
        if not zip_path.is_file():
            orphan_checksums.append(checksum_path.name)
    if orphan_checksums:
        raise InventoryError("CHECKSUM sans ZIP: " + ", ".join(sorted(orphan_checksums)))
    return found


def certify_directory(root: Path, *, require_contiguous: bool = False) -> dict:
    rows = []
    rejected = []
    discovered = _discover(root)
    if require_contiguous:
        for (current, *_), (following, *__) in zip(discovered, discovered[1:]):
            expected = _next_month(current)
            if following != expected:
                raise InventoryError(f"Bloc non contigu: {current.label} -> {following.label}; attendu {expected.label}")
    for key, zip_path, checksum_path in discovered:
        try:
            archive = zip_path.read_bytes()
            checksum = checksum_path.read_text(encoding="ascii")
            report = validate_month(archive, checksum, year=key.year, month=key.month)
        except (OSError, UnicodeError, MonthlyArchiveError) as exc:
            rejected.append({"month": key.label, "reason": str(exc)})
            continue
        rows.append({
            "month": key.label,
            "rows": report["rows"],
            "missing_bars": report["missing_bars"],
            "first_utc": report["first_utc"],
            "last_utc": report["last_utc"],
            "timestamp_input_unit": report["timestamp_input_unit"],
            "archive_sha256": report["archive_sha256"],
            "source_csv_sha256": report["source_csv_sha256"],
            "normalized_csv_sha256": report["normalized_csv_sha256"],
            "source_zip": report["source_zip"],
            "historical_incident_reported": (key.year, key.month) in HISTORICAL_INCIDENT_MONTHS,
        })
    return {
        "schema": "seven.heaven.binance_long_history_inventory.v1",
        "status": "COMPLETE" if not rejected else "PARTIAL_WITH_REJECTIONS",
        "exchange": "Binance Spot",
        "pair": "BTC/USDT",
        "timeframe": "1h",
        "certified_at_utc": datetime.now(timezone.utc).isoformat(),
        "source_directory": str(Path(root).resolve()),
        "months_seen": len(discovered),
        "months_certified": len(rows),
        "months_rejected": len(rejected),
        "require_contiguous": bool(require_contiguous),
        "months": rows,
        "rejected": rejected,
        "safety": {"orders_real": 0, "network_calls": 0, "workspace_writes": 0},
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Certifie hors ligne des archives mensuelles Binance BTCUSDT 1h.")
    parser.add_argument("directory", type=Path, help="Répertoire contenant ZIP + .CHECKSUM")
    parser.add_argument("--require-contiguous", action="store_true", help="Refuser les trous entre mois présents")
    args = parser.parse_args(argv)
    try:
        report = certify_directory(args.directory, require_contiguous=args.require_contiguous)
    except InventoryError as exc:
        print(json.dumps({"status": "INVENTORY_ERROR", "reason": str(exc)}, ensure_ascii=False))
        return 2
    print(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True))
    return 0 if report["months_rejected"] == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
