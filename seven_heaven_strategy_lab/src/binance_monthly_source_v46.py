"""Bounded V4.6 adapter for one certified Binance monthly 1h source.

The user explicitly triggers the import. Only fixed official public URLs are
reachable; no URL or symbol comes from the request. Raw downloads are validated
in memory and are never mixed with the legacy Binance V1/V2 or OKX folders.
"""
from __future__ import annotations

import csv
from datetime import datetime, timezone
import hashlib
import io
import json
import os
from pathlib import Path
import shutil
import urllib.error
import urllib.parse
import urllib.request
import uuid

from src.binance_monthly_v46 import MAX_ZIP_BYTES, MonthlyArchiveError, validate_month
from src.engine import LabError, load_bars

SOURCE_ID = "BINANCE_SPOT_BTCUSDT_1H_2020_01"
ALLOWED_MONTH = (2020, 1)
SOURCE_ROOT = "binance_monthly_sources"
RESERVE_BYTES = 2_500_000_000
WRITE_BUDGET_BYTES = 5_000_000
MAX_CHECKSUM_BYTES = 512
BASE_URL = "https://data.binance.vision/data/spot/monthly/klines/BTCUSDT/1h"


class MonthlySourceError(LabError):
    """The source is unavailable or failed an integrity/storage gate."""


def _urls(year: int, month: int) -> tuple[str, str, str]:
    if (year, month) != ALLOWED_MONTH:
        raise MonthlySourceError("Le pilote V4.6 autorise uniquement BTCUSDT 1h · janvier 2020")
    name = f"BTCUSDT-1h-{year}-{month:02d}.zip"
    url = f"{BASE_URL}/{name}"
    return name, url, url + ".CHECKSUM"


def _free_bytes(path: Path) -> int:
    path.mkdir(parents=True, exist_ok=True)
    return shutil.disk_usage(path).free


def _ensure_reserve(workspace: Path):
    free = _free_bytes(workspace)
    if free < RESERVE_BYTES + WRITE_BUDGET_BYTES:
        raise MonthlySourceError(
            "Espace insuffisant : réserve USB de 2,5 Go protégée avant import V4.6"
        )
    return free


def _download(url: str, limit: int) -> bytes:
    parsed = urllib.parse.urlsplit(url)
    if (parsed.scheme, parsed.hostname) != ("https", "data.binance.vision"):
        raise MonthlySourceError("Hôte Binance public non autorisé")
    request = urllib.request.Request(url, headers={
        "User-Agent": "Seven-Heaven-Strategy-Lab/4.6 public-data-validator"
    })
    try:
        with urllib.request.urlopen(request, timeout=25) as response:
            final = urllib.parse.urlsplit(response.geturl())
            if (final.scheme, final.hostname) != ("https", "data.binance.vision"):
                raise MonthlySourceError("Redirection de source publique refusée")
            length = response.headers.get("Content-Length")
            if length is not None and (not length.isdecimal() or int(length) > limit):
                raise MonthlySourceError("Téléchargement public plus volumineux que la limite")
            chunks = []
            total = 0
            while True:
                block = response.read(min(65536, limit + 1 - total))
                if not block:
                    break
                total += len(block)
                if total > limit:
                    raise MonthlySourceError("Téléchargement public plus volumineux que la limite")
                chunks.append(block)
    except MonthlySourceError:
        raise
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        raise MonthlySourceError("Téléchargement Binance public indisponible") from exc
    payload = b"".join(chunks)
    if not payload:
        raise MonthlySourceError("Téléchargement Binance public vide")
    return payload


def _atomic_bytes(path: Path, payload: bytes):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name("." + path.name + "." + uuid.uuid4().hex + ".tmp")
    try:
        with temporary.open("wb") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def _serialize_bars(bars: list) -> bytes:
    output = io.StringIO(newline="")
    writer = csv.writer(output, lineterminator="\n")
    writer.writerow(("timestamp", "open", "high", "low", "close", "volume"))
    for row in bars:
        writer.writerow(row)
    return output.getvalue().encode("utf-8")


def install(workspace: Path, *, year: int = 2020, month: int = 1) -> dict:
    """Download once on explicit request, certify, then store normalized bars."""
    workspace = Path(workspace).resolve()
    zip_name, zip_url, checksum_url = _urls(year, month)
    try:
        cached, _ = read_source(workspace, SOURCE_ID)
    except MonthlySourceError:
        pass
    else:
        return cached
    free_before = _ensure_reserve(workspace)
    checksum_bytes = _download(checksum_url, MAX_CHECKSUM_BYTES)
    try:
        checksum_text = checksum_bytes.decode("ascii")
    except UnicodeDecodeError as exc:
        raise MonthlySourceError("CHECKSUM Binance non ASCII") from exc
    archive = _download(zip_url, MAX_ZIP_BYTES)
    try:
        validated = validate_month(archive, checksum_text, year=year, month=month)
    except MonthlyArchiveError as exc:
        raise MonthlySourceError(str(exc)) from exc
    normalized = _serialize_bars(validated["bars"])
    _ensure_reserve(workspace)
    folder = workspace / SOURCE_ROOT / SOURCE_ID
    data_path = folder / "bars.csv"
    manifest_path = folder / "manifest.json"
    stored_sha = hashlib.sha256(normalized).hexdigest()
    now = datetime.now(timezone.utc).isoformat()
    manifest = {
        "schema": "seven.heaven.binance_monthly_source.v4_6",
        "id": SOURCE_ID,
        "status": "CERTIFIED_COMPLETE_MONTH_NORMALIZED_READ_ONLY_SOURCE",
        "exchange": "Binance Spot",
        "pair": "BTC/USDT", "base": "BTC", "quote": "USDT",
        "source_timeframe": "1h", "bar": "1h",
        "available_timeframes": ["1h", "4h"],
        "year": year, "month": month, "rows": validated["rows"],
        "first_utc": validated["first_utc"], "last_utc": validated["last_utc"],
        "close_boundary_utc": "2020-02-01T00:00:00+00:00",
        "missing_bars": validated["missing_bars"],
        "timestamp_input_unit": validated["timestamp_input_unit"],
        "source_zip": zip_name, "source_zip_url": zip_url,
        "source_checksum_url": checksum_url,
        "published_checksum_text": checksum_text.strip(),
        "archive_sha256_expected": checksum_text.split()[0].lower(),
        "archive_sha256_observed": validated["archive_sha256"],
        "source_csv_sha256": validated["source_csv_sha256"],
        "validator_normalized_rows_sha256": validated["normalized_csv_sha256"],
        "stored_csv": "bars.csv", "stored_csv_sha256": stored_sha,
        "archive_download_bytes": len(archive),
        "normalized_storage_bytes": len(normalized),
        "certified_utc": now,
        "free_bytes_before_import": free_before,
        "reserve_bytes": RESERVE_BYTES,
        "raw_zip_retained": False,
        "safety": {"orders_real": 0, "private_keys": False,
                   "account_reads": 0, "workspace_scope": SOURCE_ROOT},
    }
    # Publish data first and manifest last. A partial folder without a manifest
    # is never listed or accepted as a source after an interrupted write.
    _atomic_bytes(data_path, normalized)
    _atomic_bytes(
        manifest_path,
        (json.dumps(manifest, ensure_ascii=False, indent=2, allow_nan=False) + "\n").encode("utf-8"),
    )
    return manifest


def _manifest_path(workspace: Path) -> Path:
    return Path(workspace).resolve() / SOURCE_ROOT / SOURCE_ID / "manifest.json"


def read_source(workspace: Path, source_id: str) -> tuple[dict, list]:
    if source_id != SOURCE_ID:
        raise MonthlySourceError("Source mensuelle Binance V4.6 inconnue")
    manifest_path = _manifest_path(workspace)
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, ValueError, TypeError) as exc:
        raise MonthlySourceError("Manifeste mensuel Binance absent ou illisible") from exc
    required = {
        "schema": "seven.heaven.binance_monthly_source.v4_6",
        "id": SOURCE_ID, "exchange": "Binance Spot", "pair": "BTC/USDT",
        "source_timeframe": "1h", "rows": 744, "missing_bars": 0,
    }
    if any(manifest.get(key) != value for key, value in required.items()):
        raise MonthlySourceError("Identité du manifeste mensuel Binance incompatible")
    data_path = manifest_path.parent / "bars.csv"
    try:
        payload = data_path.read_bytes()
    except OSError as exc:
        raise MonthlySourceError("Historique normalisé Binance absent") from exc
    if hashlib.sha256(payload).hexdigest() != manifest.get("stored_csv_sha256"):
        raise MonthlySourceError("Empreinte de l'historique normalisé Binance invalide")
    try:
        bars = load_bars(data_path, expected_count=744, interval_seconds=3600)
    except LabError as exc:
        raise MonthlySourceError(str(exc)) from exc
    first = datetime.fromtimestamp(bars[0][0], timezone.utc).isoformat()
    last = datetime.fromtimestamp(bars[-1][0], timezone.utc).isoformat()
    if first != manifest.get("first_utc") or last != manifest.get("last_utc"):
        raise MonthlySourceError("Bornes UTC différentes du manifeste certifié")
    return manifest, bars


def list_sources(workspace: Path) -> list:
    try:
        manifest, _ = read_source(workspace, SOURCE_ID)
    except MonthlySourceError:
        return []
    return [{
        "id": manifest["id"], "exchange": manifest["exchange"],
        "pair": manifest["pair"], "base": manifest["base"], "quote": manifest["quote"],
        "bar": manifest["bar"], "rows": manifest["rows"],
        "sha256": manifest["stored_csv_sha256"],
        "source_archive_sha256": manifest["archive_sha256_observed"],
        "close_boundary_utc": manifest["close_boundary_utc"],
        "available_timeframes": manifest["available_timeframes"],
        "certification": "OFFICIAL_CHECKSUM_MATCHED_COMPLETE_MONTH",
        "year": manifest["year"], "month": manifest["month"],
    }]
