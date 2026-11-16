"""Research-only Binance monthly validator for an explicit small symbol allowlist.

BTCUSDT delegates to the unchanged V4.6 validator. The preregistered research
allowlist uses the same strict monthly invariants for ETH/BNB/XRP/SOL. No network or file writes.
"""
from __future__ import annotations

import calendar
import csv
from datetime import datetime, timezone
import hashlib
import io
import re
import stat
import zipfile

from src.binance_monthly_v46 import (
    INTERVAL,
    MAX_COMPRESSION_RATIO,
    MAX_CSV_BYTES,
    MAX_ZIP_BYTES,
    MonthlyArchiveError,
    SECONDS_PER_BAR,
    _decimal,
    validate_month,
)

ALLOWED_SYMBOLS = {
    "BTCUSDT": ("BTC", "USDT"),
    "ETHUSDT": ("ETH", "USDT"),
    "BNBUSDT": ("BNB", "USDT"),
    "XRPUSDT": ("XRP", "USDT"),
    "SOLUSDT": ("SOL", "USDT"),
}


def validate_symbol_month(
    archive: bytes,
    checksum: str,
    *,
    symbol: str,
    year: int,
    month: int,
) -> dict:
    if symbol not in ALLOWED_SYMBOLS:
        raise MonthlyArchiveError("Symbole hors allowlist recherche")
    if symbol == "BTCUSDT":
        return validate_month(archive, checksum, year=year, month=month)

    if type(year) is not int or type(month) is not int or not 2019 <= year <= 2025 or not 1 <= month <= 12:
        raise MonthlyArchiveError("Année/mois hors recherche 2019-2025")
    if not isinstance(archive, bytes) or not 0 < len(archive) <= MAX_ZIP_BYTES:
        raise MonthlyArchiveError("Archive ZIP absente ou trop volumineuse")
    if not isinstance(checksum, str) or len(checksum) > 512:
        raise MonthlyArchiveError("Empreinte publiée absente ou invalide")

    name = f"{symbol}-{INTERVAL}-{year}-{month:02d}"
    zip_name = name + ".zip"
    csv_name = name + ".csv"
    match = re.fullmatch(r"([0-9a-fA-F]{64})\s+\*?" + re.escape(zip_name), checksum.strip())
    if not match:
        raise MonthlyArchiveError("Format CHECKSUM ou nom de ZIP inattendu")

    expected = match.group(1).lower()
    observed = hashlib.sha256(archive).hexdigest()
    if observed != expected:
        raise MonthlyArchiveError("Le SHA-256 du ZIP ne correspond pas au CHECKSUM fourni")

    try:
        with zipfile.ZipFile(io.BytesIO(archive)) as z:
            files = z.infolist()
            if len(files) != 1 or files[0].filename != csv_name or files[0].is_dir():
                raise MonthlyArchiveError("Contenu ZIP inattendu, multiple ou chemin non sûr")
            info = files[0]
            if info.flag_bits & 1 or stat.S_IFMT(info.external_attr >> 16) == stat.S_IFLNK:
                raise MonthlyArchiveError("Entrée ZIP chiffrée ou lien symbolique interdit")
            if not 0 < info.file_size <= MAX_CSV_BYTES or not 0 < info.compress_size:
                raise MonthlyArchiveError("CSV absent, vide ou trop volumineux")
            if info.file_size / info.compress_size > MAX_COMPRESSION_RATIO:
                raise MonthlyArchiveError("Ratio de compression ZIP suspect")
            payload = z.read(info)
    except (zipfile.BadZipFile, EOFError, OSError, RuntimeError, ValueError) as exc:
        raise MonthlyArchiveError("Archive ZIP illisible ou corrompue") from exc

    try:
        csv_text = payload.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise MonthlyArchiveError("CSV non UTF-8") from exc

    first = int(datetime(year, month, 1, tzinfo=timezone.utc).timestamp())
    count = calendar.monthrange(year, month)[1] * 24
    unit = 1_000_000 if year >= 2025 else 1_000
    bars = []
    normal = io.StringIO(newline="")
    writer = csv.writer(normal, lineterminator="\n")

    for index, row in enumerate(csv.reader(io.StringIO(csv_text, newline=""))):
        if len(row) != 12:
            raise MonthlyArchiveError(f"Colonnes Binance inattendues à la ligne {index + 1}")
        open_raw, close_raw = row[0], row[6]
        if not open_raw.isascii() or not close_raw.isascii() or not open_raw.isdecimal() or not close_raw.isdecimal():
            raise MonthlyArchiveError("Horodatage non entier")
        if len(open_raw) != (16 if year >= 2025 else 13):
            raise MonthlyArchiveError("Unité temporelle incompatible: ms avant 2025, µs à partir de 2025")
        stamp = int(open_raw)
        second = stamp // unit
        if stamp % unit or second != first + index * SECONDS_PER_BAR:
            raise MonthlyArchiveError("Bougies manquantes, dupliquées, désordonnées ou hors mois")
        if int(close_raw) != stamp + unit * SECONDS_PER_BAR - 1:
            raise MonthlyArchiveError("Clôture de bougie incorrecte")

        opening, high, low, closing, volume = (
            _decimal(row[1]),
            _decimal(row[2]),
            _decimal(row[3]),
            _decimal(row[4]),
            _decimal(row[5], allow_zero=True),
        )
        if high < max(opening, closing) or low > min(opening, closing) or low > high:
            raise MonthlyArchiveError("OHLC incohérent")

        bars.append((second, float(opening), float(high), float(low), float(closing), float(volume)))
        writer.writerow((second, str(opening), str(high), str(low), str(closing), str(volume)))
        if index >= count:
            raise MonthlyArchiveError("Trop de bougies pour le mois demandé")

    if len(bars) != count:
        raise MonthlyArchiveError(f"Mois incomplet: {len(bars)} bougies au lieu de {count}")

    base, quote = ALLOWED_SYMBOLS[symbol]
    return {
        "schema": "seven.heaven.binance_monthly_1h.multi_asset_research.v1",
        "status": "CHECKSUM_MATCHED_COMPLETE_MONTH_VALIDATED",
        "exchange": "Binance Spot",
        "pair": f"{base}/{quote}",
        "base": base,
        "quote": quote,
        "symbol": symbol,
        "timeframe": "1h",
        "year": year,
        "month": month,
        "source_zip": zip_name,
        "archive_sha256": observed,
        "source_csv_sha256": hashlib.sha256(payload).hexdigest(),
        "normalized_csv_sha256": hashlib.sha256(normal.getvalue().encode("utf-8")).hexdigest(),
        "timestamp_input_unit": "microseconds" if year >= 2025 else "milliseconds",
        "first_utc": datetime.fromtimestamp(bars[0][0], timezone.utc).isoformat(),
        "last_utc": datetime.fromtimestamp(bars[-1][0], timezone.utc).isoformat(),
        "rows": len(bars),
        "missing_bars": 0,
        "bars": bars,
        "safety": {"orders_real": 0, "network_calls": 0, "workspace_writes": 0},
    }
