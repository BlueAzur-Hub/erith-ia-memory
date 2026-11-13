"""Public OKX Spot historical 1H source for Seven Heaven Strategy Lab V3.

No API credentials, no order endpoints and no background polling. Collect only
by explicit user action, use bounded pagination, strict closed-candle UTC
continuity, immutable SHA-256 datasets and a USB free-space reserve.
"""
from __future__ import annotations

import csv
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
import hashlib
import io
import json
import os
from pathlib import Path
import re
import shutil
import tempfile
import time
from urllib.parse import urlencode
import urllib.error
import urllib.request

PUBLIC_BASE = "https://www.okx.com"
INSTRUMENT_PATH = "/api/v5/public/instruments"
HISTORY_PATH = "/api/v5/market/history-candles"
ALLOWED_SPOT = ("BTC-USDC", "ETH-USDC", "BTC-USDT", "ETH-USDT")
BASE_INTERVAL_SECONDS = 3600
COUNT = 240  # ten full UTC days; even 4h boundary for fair 1H/4H replay
PAGE_LIMIT = 100
MAX_PAGES = 6
MIN_FREE_BYTES = 2_500_000_000  # protect ~2.5GB for owner's private files
MAX_RESPONSE_BYTES = 850_000
SOURCE_ID = re.compile(r"^OKX_(BTC|ETH)_(USDC|USDT)_1H_[0-9]{10}$")
CSV_HEADER = "timestamp,open,high,low,close,volume\n"


class PublicMarketError(ValueError):
    """Actionable public-data failure. Never fake candles."""


def _amount(value, *, positive=False):
    try:
        result = Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError) as exc:
        raise PublicMarketError("Valeur numérique OKX illisible") from exc
    if not result.is_finite() or result < 0 or (positive and result == 0):
        raise PublicMarketError("Prix/volume OKX non valide")
    return result


def _get(path: str, params: dict, *, transport=None) -> dict:
    if path not in (INSTRUMENT_PATH, HISTORY_PATH):
        raise PublicMarketError("API publique non autorisée")
    url = PUBLIC_BASE + path + "?" + urlencode(params)
    if transport is None:
        def transport(url):
            request = urllib.request.Request(
                url, headers={"User-Agent": "SevenHeavenStrategyLab/3.0 (+public-market-data)"})
            with urllib.request.urlopen(request, timeout=16) as response:
                if not response.geturl().startswith(PUBLIC_BASE + "/"):
                    raise PublicMarketError("Redirection hors OKX refusée")
                body = response.read(MAX_RESPONSE_BYTES + 1)
            if len(body) > MAX_RESPONSE_BYTES:
                raise PublicMarketError("Réponse distante trop volumineuse")
            return json.loads(body.decode("utf-8"))
    try:
        payload = transport(url)
    except (TimeoutError, OSError, urllib.error.URLError, json.JSONDecodeError) as exc:
        raise PublicMarketError("API publique OKX inaccessible : " + str(exc)) from exc
    if not isinstance(payload, dict) or payload.get("code") != "0" or not isinstance(payload.get("data"), list):
        raise PublicMarketError("Réponse OKX invalide : " +
                                str(payload.get("msg", ""))[:120] if isinstance(payload, dict)
                                else "Réponse OKX non conforme")
    return payload


def _rules(pair: str, transport=None):
    data = _get(INSTRUMENT_PATH, {"instType": "SPOT", "instId": pair}, transport=transport)["data"]
    entries = [r for r in data if isinstance(r, dict) and r.get("instId") == pair
               and r.get("instType") == "SPOT"]
    if len(entries) != 1:
        raise PublicMarketError("Instrument Spot OKX absent ou ambigu")
    entry = entries[0]
    if entry.get("state") != "live":
        raise PublicMarketError("Instrument Spot OKX non disponible : " + str(entry.get("state")))
    for field in ("tickSz", "lotSz", "minSz"):
        _amount(entry.get(field), positive=True)
    base, quote = pair.split("-")
    return {
        "exchange": "OKX", "market_type": "SPOT",
        "instId": pair, "base": base, "quote": quote,
        "tickSz": entry["tickSz"], "lotSz": entry["lotSz"], "minSz": entry["minSz"],
        "state_at_collection": entry["state"],
        "note": "Rules observed at collection; NOT certified as past trading constraints.",
    }


def _candle(row, boundary: int):
    if not isinstance(row, list) or len(row) < 9:
        raise PublicMarketError("Bougie OKX incomplète")
    stamp = int(row[0])
    if stamp < 0 or stamp % (BASE_INTERVAL_SECONDS * 1000):
        raise PublicMarketError("Bougie OKX hors clôture horaire UTC")
    if row[8] not in ("0", "1"):
        raise PublicMarketError("État confirm de bougie inconnu")
    t = stamp // 1000
    if t >= boundary or row[8] == "0":
        return None  # open/incomplete candle is never silently accepted
    o, h, l, c, v = (_amount(x, positive=(i != 4))
                      for i, x in enumerate(row[1:6]))
    if not l <= min(o, c) <= max(o, c) <= h:
        raise PublicMarketError("Prix OHLC contradictoires")
    return (t, o, h, l, c, v)


def _atomic_write(path: Path, data: bytes):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, filename = tempfile.mkstemp(prefix=".okx-verified-", dir=path.parent)
    try:
        with os.fdopen(fd, "wb") as handle:
            handle.write(data)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(filename, path)
    finally:
        if os.path.exists(filename):
            os.unlink(filename)


def _target_dir(workspace: Path):
    return Path(workspace) / "okx_sources"


def _validate_cached(workspace: Path, source_id: str):
    if not SOURCE_ID.fullmatch(source_id):
        raise PublicMarketError("Identifiant d'archive OKX invalide")
    root = _target_dir(workspace)
    manifest_file = root / (source_id + ".json")
    csv_file = root / (source_id + ".csv")
    if not manifest_file.is_file() or not csv_file.is_file():
        raise PublicMarketError("Archive OKX absente de cette clé USB")
    manifest = json.loads(manifest_file.read_text(encoding="utf-8"))
    if manifest.get("id") != source_id or manifest.get("source") != "OKX Spot public history-candles 1H":
        raise PublicMarketError("Manifeste OKX incorrect")
    raw = csv_file.read_bytes()
    if hashlib.sha256(raw).hexdigest() != manifest.get("sha256"):
        raise PublicMarketError("Archive OKX modifiée ou corrompue : SHA-256 non conforme")
    if manifest.get("rows") != COUNT:
        raise PublicMarketError("Archives OKX incomplètes")
    return manifest, csv_file


def list_sources(workspace: Path) -> dict:
    root = _target_dir(workspace)
    sources = []
    if root.is_dir():
        for item in sorted(root.glob("OKX_*.json"), reverse=True)[:100]:
            try:
                manifest, _ = _validate_cached(workspace, item.stem)
                sources.append(manifest)
            except (PublicMarketError, OSError, ValueError, KeyError, TypeError):
                continue
    return {"sources": sources, "free_bytes": shutil.disk_usage(workspace).free,
            "reserve_bytes": MIN_FREE_BYTES, "public_connected": True}


def read_source(workspace: Path, source_id: str):
    from src.engine import load_bars
    manifest, csv_file = _validate_cached(workspace, source_id)
    bars = load_bars(csv_file, expected_count=COUNT, interval_seconds=BASE_INTERVAL_SECONDS)
    if len(bars) != COUNT or bars[0][0] != manifest["first_timestamp"] or bars[-1][0] != manifest["last_timestamp"]:
        raise PublicMarketError("Période du cache OKX incohérente")
    for i, b in enumerate(bars):
        if b[0] != manifest["first_timestamp"] + i * BASE_INTERVAL_SECONDS:
            raise PublicMarketError("Trou/duplication dans le cache OKX")
    return manifest, bars


def collect(workspace: Path, pair: str, *, transport=None, now=None, min_free_bytes=MIN_FREE_BYTES):
    if pair not in ALLOWED_SPOT:
        raise PublicMarketError("Paire refusée ; BTC/ETH contre USDC/USDT Spot uniquement")
    root = _target_dir(workspace)
    root.mkdir(parents=True, exist_ok=True)
    now = time.time() if now is None else now
    # Use the last COMPLETE 4H UTC boundary, so the 240 x 1H candles
    # can also replay 60 x full 4H candles without hidden partial bars.
    end = int(now // (4 * BASE_INTERVAL_SECONDS)) * (4 * BASE_INTERVAL_SECONDS)
    start = end - COUNT * BASE_INTERVAL_SECONDS
    source_id = f"OKX_{pair.replace('-', '_')}_1H_{end}"
    try:
        cached, _ = _validate_cached(workspace, source_id)
        return cached
    except PublicMarketError as exc:
        if "absente" not in str(exc):
            raise

    # Existing verified archives remain usable even when the owner's USB
    # has less than the planned reserve. Refuse only NEW data downloads.
    free = shutil.disk_usage(root).free
    if free < min_free_bytes:
        raise PublicMarketError(
            f"Espace USB insuffisant : {free / 1e9:.2f} Go libres ; "
            f"réserve minimale demandée {min_free_bytes / 1e9:.2f} Go. "
            "Conserver tes archives privées ; utiliser la clé 32 Go si nécessaire.")

    rules = _rules(pair, transport=transport)
    selected = {}
    after = None
    previous_oldest = None
    for page in range(MAX_PAGES):
        args = {"instId": pair, "bar": "1H", "limit": str(PAGE_LIMIT)}
        if after is not None:
            args["after"] = str(after)
        rows = _get(HISTORY_PATH, args, transport=transport)["data"]
        if not rows:
            break
        stamps = []
        for row in rows:
            if not isinstance(row, list) or not row:
                raise PublicMarketError("Page OKX contient une bougie invalide")
            stamps.append(int(row[0]))
            candle = _candle(row, end)
            if candle is None:
                continue
            if start <= candle[0] < end:
                old = selected.get(candle[0])
                if old is not None and old != candle:
                    raise PublicMarketError("Doublon OKX avec cours différents")
                selected[candle[0]] = candle
        oldest = min(stamps)
        if previous_oldest is not None and oldest >= previous_oldest:
            raise PublicMarketError("Pagination OKX sans progrès")
        previous_oldest = oldest
        after = oldest
        if oldest <= start * 1000:
            break
    timestamps = list(range(start, end, BASE_INTERVAL_SECONDS))
    missing = [t for t in timestamps if t not in selected]
    if missing:
        raise PublicMarketError(
            f"OKX : {len(missing)} bougie(s) manquante(s) dans la période ; "
            "archive refusée. Vérifier l'historique et réessayer.")
    out = io.StringIO(newline="")
    writer = csv.writer(out, lineterminator="\n")
    writer.writerow(["timestamp", "open", "high", "low", "close", "volume"])
    for stamp in timestamps:
        data = selected[stamp]
        writer.writerow([data[0], *(format(p, "f") for p in data[1:])])
    blob = out.getvalue().encode("utf-8")
    sha = hashlib.sha256(blob).hexdigest()
    manifest = {
        "schema": "seven.heaven.market.okx.public_1h_source.v3",
        "id": source_id,
        "source": "OKX Spot public history-candles 1H",
        "endpoint": HISTORY_PATH,
        "status": "COMPLETE_CLOSED_240_1H_CANDLES",
        "exchange": "OKX Spot", "market_type": "SPOT",
        "pair": pair.replace("-", "/"), "instId": pair,
        "base": rules["base"], "quote": rules["quote"],
        "bar": "1h", "rows": COUNT, "first_timestamp": start,
        "last_timestamp": end - BASE_INTERVAL_SECONDS,
        "close_boundary_utc": datetime.fromtimestamp(end, timezone.utc).isoformat(),
        "collected_at_utc": datetime.fromtimestamp(now, timezone.utc).isoformat(),
        "sha256": sha, "bytes": len(blob),
        "rules_observed": rules,
        "available_timeframes": ["1h", "4h"],
        "meaning": "Recent public CLOSED candles, not a realtime trade or a historic book; "
                   "instrument rules at collection are not automatically used for fills.",
        "paper_only": True, "live_orders": 0,
    }
    csv_file = root / (source_id + ".csv")
    manifest_file = root / (source_id + ".json")
    _atomic_write(csv_file, blob)
    _atomic_write(manifest_file, (json.dumps(manifest, indent=2, ensure_ascii=False) + "\n").encode())
    return _validate_cached(workspace, source_id)[0]
