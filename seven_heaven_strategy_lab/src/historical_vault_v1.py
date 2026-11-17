"""Historical Vault V1 — explicit, verified annual Binance Spot installer.

This module bridges the canonical Seven historical-depth index into the Strategy
Lab without pretending that remote/indexed archives are already installed.
Only a small audited set of complete years is installable in V1. Each install
is explicit, public-data only, checksum-gated, gap-intolerant, aggregated from
native 1m to 1h and written into the generic Source Catalog namespace.

No account access, API keys, private endpoints or real orders exist here.
"""
from __future__ import annotations

import calendar
import csv
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
import hashlib
import io
import json
import os
from pathlib import Path
import shutil
import stat
import urllib.error
import urllib.parse
import urllib.request
import uuid
import zipfile

from src.engine import LabError, load_bars
from src.catalog_source_v48 import read_source as read_catalog_source, CatalogSourceError
from src.historical_bundle_v3 import available as historical_bundle_available, install_from_bundle

ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT_PATH = ROOT / "data" / "historical_vault_v1.json"
CATALOG_ROOT = "catalog_sources"
BASE_URL = "https://data.binance.vision/data/spot/monthly/klines"
RESERVE_BYTES = 2_500_000_000
WRITE_BUDGET_BYTES = 25_000_000
MAX_CHECKSUM_BYTES = 512
MAX_ZIP_BYTES = 20_000_000
MAX_CSV_BYTES = 90_000_000
MAX_COMPRESSION_RATIO = 650


class HistoricalVaultError(LabError):
    """A historical source was refused before becoming executable."""


def snapshot() -> dict:
    try:
        raw = json.loads(SNAPSHOT_PATH.read_text(encoding="utf-8"))
    except (OSError, ValueError, TypeError) as exc:
        raise HistoricalVaultError("Historical Vault : index local absent ou illisible") from exc
    if raw.get("schema") != "seven.historical_vault.v1" or not isinstance(raw.get("assets"), list):
        raise HistoricalVaultError("Historical Vault : index local incompatible")
    return raw


def source_id(symbol: str, year: int) -> str:
    return f"CAT_BINANCE_{symbol}USDT_1H_{year}"


def _asset(symbol: str) -> dict:
    symbol = str(symbol or "").upper()
    for row in snapshot()["assets"]:
        if row.get("symbol") == symbol:
            return row
    raise HistoricalVaultError("Historical Vault : actif non autorisé dans V1")


def _installable(symbol: str, year: int) -> dict:
    row = _asset(symbol)
    if type(year) is not int or year not in row.get("installable_years", []):
        raise HistoricalVaultError("Historical Vault : année non certifiée comme complète dans V1")
    if row.get("indexed_years", {}).get(str(year)) != 12:
        raise HistoricalVaultError("Historical Vault : l'index canonique ne prouve pas 12 mois fermés")
    return row


def _free_bytes(workspace: Path) -> int:
    workspace.mkdir(parents=True, exist_ok=True)
    return shutil.disk_usage(workspace).free


def _ensure_reserve(workspace: Path) -> int:
    free = _free_bytes(workspace)
    if free < RESERVE_BYTES + WRITE_BUDGET_BYTES:
        raise HistoricalVaultError("Espace insuffisant : réserve locale de 2,5 Go protégée")
    return free


def _download(url: str, limit: int) -> bytes:
    parsed = urllib.parse.urlsplit(url)
    if (parsed.scheme, parsed.hostname) != ("https", "data.binance.vision"):
        raise HistoricalVaultError("Historical Vault : hôte public non autorisé")
    req = urllib.request.Request(url, headers={"User-Agent": "Seven-Heaven-Strategy-Lab/4.9 Historical-Vault-V1"})
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            final = urllib.parse.urlsplit(response.geturl())
            if (final.scheme, final.hostname) != ("https", "data.binance.vision"):
                raise HistoricalVaultError("Historical Vault : redirection de source refusée")
            length = response.headers.get("Content-Length")
            if length is not None and (not length.isdecimal() or int(length) > limit):
                raise HistoricalVaultError("Historical Vault : téléchargement au-dessus de la limite")
            chunks, total = [], 0
            while True:
                block = response.read(min(65536, limit + 1 - total))
                if not block:
                    break
                total += len(block)
                if total > limit:
                    raise HistoricalVaultError("Historical Vault : téléchargement au-dessus de la limite")
                chunks.append(block)
    except HistoricalVaultError:
        raise
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        raise HistoricalVaultError("Historical Vault : Binance Public Data indisponible") from exc
    payload = b"".join(chunks)
    if not payload:
        raise HistoricalVaultError("Historical Vault : téléchargement public vide")
    return payload


def _decimal(raw: str, *, allow_zero: bool = False) -> Decimal:
    try:
        value = Decimal(raw)
    except (InvalidOperation, ValueError, TypeError) as exc:
        raise HistoricalVaultError("Historical Vault : nombre OHLCV invalide") from exc
    if not value.is_finite() or value < 0 or (not allow_zero and value == 0) or value > Decimal("1e20"):
        raise HistoricalVaultError("Historical Vault : OHLCV hors limites")
    return value


def _validate_month(pair: str, year: int, month: int, archive: bytes, checksum: str) -> dict:
    """Validate one complete native 1m month and aggregate it causally to 1h."""
    if not isinstance(pair, str) or not pair.endswith("USDT") or not pair[:-4].isalnum():
        raise HistoricalVaultError("Historical Vault : paire Binance invalide")
    if type(year) is not int or type(month) is not int or not 2024 <= year <= 2025 or not 1 <= month <= 12:
        raise HistoricalVaultError("Historical Vault : année/mois hors V1")
    if not isinstance(archive, bytes) or not 0 < len(archive) <= MAX_ZIP_BYTES:
        raise HistoricalVaultError("Historical Vault : archive ZIP absente ou trop volumineuse")
    if not isinstance(checksum, str) or len(checksum) > MAX_CHECKSUM_BYTES:
        raise HistoricalVaultError("Historical Vault : CHECKSUM absent ou invalide")
    stem = f"{pair}-1m-{year}-{month:02d}"
    zip_name, csv_name = stem + ".zip", stem + ".csv"
    import re
    match = re.fullmatch(r"([0-9a-fA-F]{64})\s+\*?" + re.escape(zip_name), checksum.strip())
    if not match:
        raise HistoricalVaultError("Historical Vault : format CHECKSUM ou nom de ZIP inattendu")
    expected = match.group(1).lower()
    observed = hashlib.sha256(archive).hexdigest()
    if observed != expected:
        raise HistoricalVaultError("Historical Vault : SHA-256 du ZIP différent du CHECKSUM")
    try:
        with zipfile.ZipFile(io.BytesIO(archive)) as z:
            files = z.infolist()
            if len(files) != 1 or files[0].filename != csv_name or files[0].is_dir():
                raise HistoricalVaultError("Historical Vault : contenu ZIP inattendu")
            info = files[0]
            if info.flag_bits & 1 or stat.S_IFMT(info.external_attr >> 16) == stat.S_IFLNK:
                raise HistoricalVaultError("Historical Vault : ZIP chiffré ou lien symbolique interdit")
            if not 0 < info.file_size <= MAX_CSV_BYTES or not 0 < info.compress_size:
                raise HistoricalVaultError("Historical Vault : CSV absent, vide ou trop volumineux")
            if info.file_size / info.compress_size > MAX_COMPRESSION_RATIO:
                raise HistoricalVaultError("Historical Vault : ratio ZIP suspect")
            payload = z.read(info)
    except HistoricalVaultError:
        raise
    except (zipfile.BadZipFile, EOFError, OSError, RuntimeError, ValueError) as exc:
        raise HistoricalVaultError("Historical Vault : ZIP illisible ou corrompu") from exc
    try:
        text = payload.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise HistoricalVaultError("Historical Vault : CSV non UTF-8") from exc

    first_second = int(datetime(year, month, 1, tzinfo=timezone.utc).timestamp())
    minute_count = calendar.monthrange(year, month)[1] * 24 * 60
    bars_hourly = []
    hour = None
    unit = None
    rows = 0
    for index, row in enumerate(csv.reader(io.StringIO(text, newline=""))):
        if len(row) != 12:
            raise HistoricalVaultError(f"Historical Vault : colonnes Binance inattendues ligne {index + 1}")
        open_raw, close_raw = row[0], row[6]
        if not open_raw.isascii() or not open_raw.isdecimal() or not close_raw.isascii() or not close_raw.isdecimal():
            raise HistoricalVaultError("Historical Vault : horodatage non entier")
        if unit is None:
            if len(open_raw) == 13:
                unit = 1_000
            elif len(open_raw) == 16:
                unit = 1_000_000
            else:
                raise HistoricalVaultError("Historical Vault : unité temporelle inconnue")
        if len(open_raw) != (13 if unit == 1_000 else 16):
            raise HistoricalVaultError("Historical Vault : unité temporelle changeante")
        stamp = int(open_raw)
        second = stamp // unit
        if stamp % unit or second != first_second + index * 60:
            raise HistoricalVaultError("Historical Vault : minute manquante, dupliquée ou désordonnée")
        if int(close_raw) != stamp + unit * 60 - 1:
            raise HistoricalVaultError("Historical Vault : clôture minute incorrecte")
        opening, high, low, closing, volume = (
            _decimal(row[1]), _decimal(row[2]), _decimal(row[3]),
            _decimal(row[4]), _decimal(row[5], allow_zero=True),
        )
        if high < max(opening, closing) or low > min(opening, closing) or low > high:
            raise HistoricalVaultError("Historical Vault : OHLC incohérent")
        bucket = index // 60
        if hour is None or bucket != hour[0]:
            if hour is not None:
                bars_hourly.append((hour[1], float(hour[2]), float(hour[3]), float(hour[4]), float(hour[5]), float(hour[6])))
            hour = [bucket, second, opening, high, low, closing, volume]
        else:
            hour[3] = max(hour[3], high)
            hour[4] = min(hour[4], low)
            hour[5] = closing
            hour[6] += volume
        rows += 1
        if rows > minute_count:
            raise HistoricalVaultError("Historical Vault : trop de minutes dans le mois")
    if rows != minute_count:
        raise HistoricalVaultError(f"Historical Vault : mois incomplet ({rows}/{minute_count} minutes)")
    if hour is not None:
        bars_hourly.append((hour[1], float(hour[2]), float(hour[3]), float(hour[4]), float(hour[5]), float(hour[6])))
    expected_hours = calendar.monthrange(year, month)[1] * 24
    if len(bars_hourly) != expected_hours:
        raise HistoricalVaultError("Historical Vault : agrégation horaire incomplète")
    return {
        "pair": pair, "year": year, "month": month,
        "source_zip": zip_name, "archive_sha256": observed,
        "source_csv_sha256": hashlib.sha256(payload).hexdigest(),
        "rows_1m": rows, "rows_1h": len(bars_hourly),
        "timestamp_input_unit": "microseconds" if unit == 1_000_000 else "milliseconds",
        "bars": bars_hourly,
    }


def _serialize_bars(bars: list) -> bytes:
    out = io.StringIO(newline="")
    w = csv.writer(out, lineterminator="\n")
    w.writerow(("timestamp", "open", "high", "low", "close", "volume"))
    for row in bars:
        w.writerow(row)
    return out.getvalue().encode("utf-8")


def _atomic_bytes(path: Path, payload: bytes):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name("." + path.name + "." + uuid.uuid4().hex + ".tmp")
    try:
        with tmp.open("wb") as f:
            f.write(payload)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, path)
    finally:
        tmp.unlink(missing_ok=True)


def install_year(workspace: Path, symbol: str, year: int) -> dict:
    """Install one audited full year as a generic local catalog source."""
    row = _installable(symbol, year)
    symbol = row["symbol"]
    sid = source_id(symbol, year)
    try:
        manifest, _ = read_catalog_source(workspace, sid)
        return manifest
    except (CatalogSourceError, OSError, ValueError, TypeError):
        pass

    # V3 first uses the frozen five-asset annual bundle verified in the shared Seven
    # archive. This avoids redundant monthly downloads for all ten canonical
    # 2024/2025 asset-years while preserving exact SHA/provenance checks. The
    # Binance Public Data V1 path remains as a bounded fallback.
    if historical_bundle_available(symbol, year):
        return install_from_bundle(workspace, symbol, year, sid)

    workspace = Path(workspace).resolve()
    free_before = _ensure_reserve(workspace)
    pair_compact = symbol + "USDT"
    all_bars, months = [], []
    for month in range(1, 13):
        name = f"{pair_compact}-1m-{year}-{month:02d}.zip"
        url = f"{BASE_URL}/{pair_compact}/1m/{name}"
        checksum_url = url + ".CHECKSUM"
        checksum_bytes = _download(checksum_url, MAX_CHECKSUM_BYTES)
        try:
            checksum = checksum_bytes.decode("ascii")
        except UnicodeDecodeError as exc:
            raise HistoricalVaultError("Historical Vault : CHECKSUM non ASCII") from exc
        archive = _download(url, MAX_ZIP_BYTES)
        verified = _validate_month(pair_compact, year, month, archive, checksum)
        all_bars.extend(verified.pop("bars"))
        months.append({**verified, "source_url": url, "checksum_url": checksum_url})

    expected_hours = (366 if calendar.isleap(year) else 365) * 24
    if len(all_bars) != expected_hours:
        raise HistoricalVaultError("Historical Vault : année horaire incomplète")
    for i in range(1, len(all_bars)):
        if all_bars[i][0] != all_bars[i - 1][0] + 3600:
            raise HistoricalVaultError("Historical Vault : discontinuité horaire entre deux mois")
    normalized = _serialize_bars(all_bars)
    _ensure_reserve(workspace)
    stored_sha = hashlib.sha256(normalized).hexdigest()
    first = datetime.fromtimestamp(all_bars[0][0], timezone.utc).isoformat()
    last = datetime.fromtimestamp(all_bars[-1][0], timezone.utc).isoformat()
    close_boundary = datetime(year + 1, 1, 1, tzinfo=timezone.utc).isoformat()
    manifest = {
        "schema": "seven.source_catalog.dataset.v1",
        "id": sid,
        "exchange": "Binance Spot",
        "pair": symbol + "/USDT", "base": symbol, "quote": "USDT",
        "source_timeframe": "1h", "available_timeframes": ["1h", "4h"],
        "rows": len(all_bars), "first_utc": first, "last_utc": last,
        "close_boundary_utc": close_boundary,
        "stored_csv_sha256": stored_sha,
        "certification": "BINANCE_PUBLIC_CHECKSUMS_12_MONTHS_FULL_YEAR",
        "historical_vault": {
            "schema": "seven.historical_vault.installed_year.v1",
            "asset_id": row["id"], "rank_at_snapshot": row["rank"], "year": year,
            "source_snapshot_path": "data/historical_vault_v1.json",
            "source_snapshot_blob_sha": snapshot()["source"]["git_blob_sha"],
            "source_native_timeframe": "1m", "aggregation": "strict 60x1m -> 1h",
            "months": months,
            "raw_archives_retained": False,
            "free_bytes_before_import": free_before,
            "reserve_bytes": RESERVE_BYTES,
        },
        "safety": {"orders_real": 0, "account_reads": 0, "private_keys": False, "public_data_only": True},
    }
    folder = workspace / CATALOG_ROOT / sid
    _atomic_bytes(folder / "bars.csv", normalized)
    _atomic_bytes(folder / "manifest.json", (json.dumps(manifest, ensure_ascii=False, indent=2, allow_nan=False) + "\n").encode("utf-8"))
    # Re-open through the generic loader: this is the final acceptance gate.
    # If that gate refuses the source, roll back the just-written install so an
    # incomplete/invalid source can never remain visible as a local catalogue.
    try:
        accepted, bars = read_catalog_source(workspace, sid)
        if len(bars) != expected_hours:
            raise HistoricalVaultError("Historical Vault : source installée refusée à la relecture")
    except Exception:
        for name in ("manifest.json", "bars.csv"):
            try:
                (folder / name).unlink()
            except FileNotFoundError:
                pass
        try:
            folder.rmdir()
        except OSError:
            pass
        raise
    return accepted


def vault_status(workspace: Path) -> dict:
    idx = snapshot()
    assets = []
    for asset in idx["assets"]:
        years = []
        for year in asset.get("installable_years", []):
            sid = source_id(asset["symbol"], year)
            installed = False
            manifest = None
            try:
                manifest, _ = read_catalog_source(workspace, sid)
                installed = True
            except (CatalogSourceError, OSError, ValueError, TypeError):
                pass
            years.append({
                "year": year, "source_id": sid, "installed": installed,
                "rows_1h": manifest.get("rows") if manifest else ((366 if calendar.isleap(year) else 365) * 24),
                "certification": manifest.get("certification") if manifest else "INDEXED_FULL_YEAR_NOT_INSTALLED",
            })
        assets.append({**asset, "years": years})
    return {
        "schema": idx["schema"], "source": idx["source"], "summary": idx["summary"],
        "install_contract": idx["install_contract"], "assets": assets,
        "safety": {"paper_only": True, "orders_real": 0, "account_access": False},
    }
