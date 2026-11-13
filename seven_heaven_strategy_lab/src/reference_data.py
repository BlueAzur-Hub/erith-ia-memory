"""Fetch and preserve the exact audited historical source, never live exchange APIs."""
from __future__ import annotations
import csv
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
import hashlib
import io
import json
import os
from pathlib import Path
import tempfile
import urllib.request
import zipfile

ZIP_NAME = "BTCUSDT-1m-2026-01.zip"
ZIP_URL = ("https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/"
           "crypto-spot-bulk-2026-01-1m/BTCUSDT-1m-2026-01.zip")
ZIP_SHA = "d28b369da32a6ea84ba0af517b1847ab67b2fcc1e0e111c1b24d56ae07240cb9"
ZIP_SIZE = 2127988
CSV_NAME = "BTCUSDT-1m-2026-01_HUMMINGBOT_CANDLES.csv"
CSV_SHA = "38a2e6ce6e76ccfeca2e421679ee39ef4467f0426cf0064610b25100307f54c4"
START = 1767225600
COUNT = 44640
MAX_ARCHIVE_BYTES = 4 * 1024 * 1024


class SourceError(ValueError):
    pass


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def dataset_status(workspace: Path) -> dict:
    file = Path(workspace) / "datasets" / CSV_NAME
    present = file.is_file() and digest(file.read_bytes()) == CSV_SHA
    return {
        "id": "BINANCE_BTCUSDT_2026_01_1M",
        "available": present,
        "rows_expected": COUNT,
        "pair": "BTC/USDT",
        "exchange": "Binance Spot",
        "month": "2026-01",
        "data_sha256": CSV_SHA,
        "historical": True,
    }


def _decimal(value: str, label: str) -> Decimal:
    try:
        n = Decimal(value)
    except InvalidOperation as exc:
        raise SourceError(f"Champ {label} invalide") from exc
    if not n.is_finite() or n < 0:
        raise SourceError(f"Champ {label} négatif ou infini")
    return n


def _convert(payload: bytes) -> bytes:
    if len(payload) != ZIP_SIZE or digest(payload) != ZIP_SHA:
        raise SourceError("Archive historique rejetée : taille/SHA-256 non conformes")
    output = io.StringIO(newline="")
    writer = csv.writer(output, lineterminator="\n")
    writer.writerow(["timestamp", "open", "high", "low", "close", "volume"])
    with zipfile.ZipFile(io.BytesIO(payload)) as archive:
        members = [x for x in archive.infolist() if not x.is_dir()]
        if len(members) != 1 or members[0].filename != "BTCUSDT-1m-2026-01.csv":
            raise SourceError("Contenu ZIP inattendu")
        if not (1 <= members[0].file_size <= 16000000):
            raise SourceError("Taille CSV non conforme")
        with archive.open(members[0]) as handle:
            reader = csv.reader(io.TextIOWrapper(handle, encoding="utf-8-sig", newline=""))
            for index, row in enumerate(reader):
                if index >= COUNT or len(row) != 12:
                    raise SourceError("Nombre de lignes ou colonnes inattendu")
                t = int(row[0])
                # The audited 2026 Binance archive uses microsecond open/close times.
                if t != (START + index * 60) * 1000000:
                    raise SourceError(f"Minute absente ou dupliquée : index {index}")
                if int(row[6]) != (START + (index + 1) * 60) * 1000000 - 1:
                    raise SourceError("Horodatage de fin de bougie invalide")
                o, h, l, c, v = [_decimal(row[k], str(k)) for k in (1, 2, 3, 4, 5)]
                if min(o, h, l, c) <= 0 or not l <= min(o, c) <= max(o, c) <= h:
                    raise SourceError("Prix OHLC invalides")
                if _decimal(row[7], "quote_volume") < 0 or int(row[8]) < 0:
                    raise SourceError("Volume/nombre de transactions invalide")
                _decimal(row[9], "taker_base")
                _decimal(row[10], "taker_quote")
                writer.writerow([t // 1000000, *(format(v, "f") for v in (o, h, l, c, v))])
            if index + 1 != COUNT:
                raise SourceError("Archive incomplète")
    data = output.getvalue().encode("utf-8")
    if digest(data) != CSV_SHA:
        raise SourceError("CSV normalisé différent de notre preuve SHA-256")
    return data


def install_reference(workspace: Path) -> dict:
    root = Path(workspace) / "datasets"
    root.mkdir(parents=True, exist_ok=True)
    target = root / CSV_NAME
    if dataset_status(workspace)["available"]:
        return dataset_status(workspace)
    # This is the only network operation in the application: a fixed public
    # release URL, on explicit user request. No arbitrary URL or exchange API.
    request = urllib.request.Request(
        ZIP_URL, headers={"User-Agent": "SevenHeavenStrategyLab/0.1"})
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            length = response.headers.get("Content-Length")
            if length is not None and int(length) > MAX_ARCHIVE_BYTES:
                raise SourceError("Archive distante trop volumineuse")
            payload = response.read(MAX_ARCHIVE_BYTES + 1)
    except (OSError, TimeoutError) as exc:
        raise SourceError("Téléchargement public impossible : " + str(exc)) from exc
    if len(payload) > MAX_ARCHIVE_BYTES:
        raise SourceError("Taille téléchargée excessive")
    validated = _convert(payload)
    fd, temp = tempfile.mkstemp(prefix=".validated-", dir=root)
    try:
        with os.fdopen(fd, "wb") as output:
            output.write(validated)
            output.flush()
            os.fsync(output.fileno())
        os.replace(temp, target)
    finally:
        if os.path.exists(temp):
            os.unlink(temp)
    return dataset_status(workspace)
