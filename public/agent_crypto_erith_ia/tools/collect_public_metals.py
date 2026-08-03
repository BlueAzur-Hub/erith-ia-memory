#!/usr/bin/env python3
"""Collect public metals data for Agent-Crypto @erith.IA Build 28.2.58.

Public sources, no provider key:
- Gold API: current indicative XAU/XAG/XPT/XPD/HG prices.
- Yahoo Finance chart endpoint: one-year daily futures series.
- ECB SDMX: daily USD/EUR reference rate.

The public page never contacts these providers. GitHub Actions runs this collector,
commits static JSON, and GitHub Pages serves the same files to every device.
Crypto files are never read or modified.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import math
import os
import shutil
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import quote

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

UTC = timezone.utc
SCHEMA_VERSION = "2.0.0"
BUILD_TARGET = "28.2.58"
USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0 Safari/537.36 "
    "Agent-Crypto-ERITH-IA-Public-Metals/28.2.58"
)


@dataclass(frozen=True)
class Metal:
    asset_id: str
    name: str
    symbol: str
    future_symbol: str
    market: str
    unit: str
    unit_label_fr: str


METALS: tuple[Metal, ...] = (
    Metal("gold", "Or", "XAU", "GC=F", "COMEX", "troy_ounce", "USD / once troy"),
    Metal("silver", "Argent", "XAG", "SI=F", "COMEX", "troy_ounce", "USD / once troy"),
    Metal("platinum", "Platine", "XPT", "PL=F", "NYMEX", "troy_ounce", "USD / once troy"),
    Metal("palladium", "Palladium", "XPD", "PA=F", "NYMEX", "troy_ounce", "USD / once troy"),
    Metal("copper", "Cuivre", "HG", "HG=F", "COMEX", "pound", "USD / livre"),
)
ASSET_ORDER = {metal.asset_id: index for index, metal in enumerate(METALS)}
EXPECTED_ASSETS = [metal.asset_id for metal in METALS]

GOLD_API_BASE = "https://api.gold-api.com/price"
YAHOO_CHART_BASE = "https://query1.finance.yahoo.com/v8/finance/chart"
ECB_USD_EUR_URL = (
    "https://data-api.ecb.europa.eu/service/data/EXR/"
    "D.USD.EUR.SP00.A?lastNObservations=10&format=csvdata"
)


def utc_now() -> datetime:
    return datetime.now(tz=UTC)


def iso(value: datetime | None = None) -> str:
    return (value or utc_now()).astimezone(UTC).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def parse_time(value: Any) -> str | None:
    if value is None or value == "":
        return None
    if isinstance(value, (int, float)) and math.isfinite(float(value)):
        number = float(value)
        if number > 10_000_000_000:
            number /= 1000.0
        try:
            return iso(datetime.fromtimestamp(number, tz=UTC))
        except (ValueError, OSError, OverflowError):
            return None
    text = str(value).strip()
    if not text:
        return None
    if text.isdigit():
        return parse_time(int(text))
    try:
        return iso(datetime.fromisoformat(text.replace("Z", "+00:00")))
    except ValueError:
        return None


def date_key(value: Any) -> str | None:
    stamp = parse_time(value)
    return stamp[:10] if stamp else None


def finite_number(value: Any) -> float | None:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return number if math.isfinite(number) else None


def positive_number(value: Any) -> float | None:
    number = finite_number(value)
    return number if number is not None and number > 0 else None


def first_number(payload: dict[str, Any], keys: Iterable[str], *, positive: bool = False) -> float | None:
    for key in keys:
        if key not in payload:
            continue
        number = positive_number(payload[key]) if positive else finite_number(payload[key])
        if number is not None:
            return number
    return None


def canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False)


def sha256_json(value: Any) -> str:
    return "sha256:" + hashlib.sha256(canonical_json(value).encode("utf-8")).hexdigest()


def atomic_write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=False, allow_nan=False) + "\n"
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(text, encoding="utf-8", newline="\n")
    os.replace(temp, path)


def read_json(path: Path) -> dict[str, Any] | None:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
        return value if isinstance(value, dict) else None
    except Exception:
        return None


def build_session() -> requests.Session:
    retry = Retry(
        total=4,
        connect=4,
        read=4,
        status=4,
        backoff_factor=0.8,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=frozenset({"GET"}),
        respect_retry_after_header=True,
    )
    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT, "Accept": "application/json,text/csv;q=0.9,*/*;q=0.8"})
    session.mount("https://", HTTPAdapter(max_retries=retry))
    return session


def get_json(session: requests.Session, url: str, timeout: float) -> dict[str, Any]:
    response = session.get(url, timeout=timeout)
    response.raise_for_status()
    payload = response.json()
    if not isinstance(payload, dict):
        raise RuntimeError(f"Réponse JSON objet attendue : {url}")
    return payload


def get_text(session: requests.Session, url: str, timeout: float) -> str:
    response = session.get(url, timeout=timeout, headers={"Accept": "text/csv"})
    response.raise_for_status()
    return response.text


def load_fixture(fixtures: Path | None, filename: str) -> Any | None:
    if fixtures is None:
        return None
    path = fixtures / filename
    if not path.is_file():
        raise FileNotFoundError(f"Fixture absente : {path}")
    if path.suffix.lower() == ".json":
        return json.loads(path.read_text(encoding="utf-8"))
    return path.read_text(encoding="utf-8")


def gold_api_quote(
    session: requests.Session,
    metal: Metal,
    timeout: float,
    received_at: str,
    fixtures: Path | None,
) -> dict[str, Any]:
    payload = load_fixture(fixtures, f"gold_api_{metal.symbol}.json")
    if payload is None:
        payload = get_json(session, f"{GOLD_API_BASE}/{metal.symbol}", timeout)
    if not isinstance(payload, dict):
        raise RuntimeError(f"Gold API {metal.symbol}: objet JSON attendu")

    response_symbol = str(payload.get("symbol") or metal.symbol).upper()
    if response_symbol != metal.symbol:
        raise RuntimeError(f"Gold API {metal.symbol}: symbole reçu {response_symbol}")
    response_currency = str(payload.get("currency") or "USD").upper()
    if response_currency != "USD":
        raise RuntimeError(f"Gold API {metal.symbol}: devise reçue {response_currency}, USD requise")

    price = first_number(payload, ("price", "value", "rate", "current_price"), positive=True)
    if price is None:
        raise RuntimeError(f"Gold API {metal.symbol}: prix positif absent")

    source_time = next(
        (
            stamp for stamp in (
                parse_time(payload.get(key))
                for key in (
                    "updatedAt", "updated_at", "timestamp", "lastUpdated", "last_updated",
                    "price_timestamp", "server_time", "date",
                )
            ) if stamp
        ),
        None,
    )

    return {
        "asset_id": metal.asset_id,
        "domain": "metals",
        "symbol": metal.symbol,
        "source_id": "gold_api",
        "source_name": "Gold API",
        "provider_symbol": metal.symbol,
        "instrument_type": "spot_reference",
        "market": "indicative_public_reference",
        "currency": "USD",
        "unit": metal.unit,
        "unit_label_fr": metal.unit_label_fr,
        "unit_basis": "market_symbol_convention",
        "price": price,
        "bid": first_number(payload, ("bid", "best_bid"), positive=True),
        "ask": first_number(payload, ("ask", "best_ask"), positive=True),
        "change": first_number(payload, ("change", "price_change", "change_24h")),
        "change_percent": first_number(
            payload,
            ("changePercent", "change_percent", "percent_change", "change_24h_percent", "chp"),
        ),
        "source_time": source_time,
        "received_at": received_at,
        "data_state": "data_current" if source_time else "date_unqualified",
        "delay_seconds": None,
        "licence_state": "public_terms",
        "provenance_note": (
            f"Cotation indicative publique Gold API {metal.symbol}, unité qualifiée {metal.unit_label_fr}, "
            "collectée automatiquement sans clé fournisseur."
        ),
    }


def yahoo_future_series(
    session: requests.Session,
    metal: Metal,
    timeout: float,
    received_at: str,
    fixtures: Path | None,
) -> dict[str, Any]:
    fixture_name = f"yahoo_{metal.future_symbol.replace('=', '_')}.json"
    payload = load_fixture(fixtures, fixture_name)
    if payload is None:
        encoded = quote(metal.future_symbol, safe="")
        payload = get_json(
            session,
            f"{YAHOO_CHART_BASE}/{encoded}?range=1y&interval=1d&events=history",
            timeout,
        )
    if not isinstance(payload, dict):
        raise RuntimeError(f"Yahoo {metal.future_symbol}: objet JSON attendu")

    chart = payload.get("chart")
    result_list = chart.get("result") if isinstance(chart, dict) else None
    error = chart.get("error") if isinstance(chart, dict) else None
    if error:
        raise RuntimeError(f"Yahoo {metal.future_symbol}: {error}")
    if not isinstance(result_list, list) or not result_list or not isinstance(result_list[0], dict):
        raise RuntimeError(f"Yahoo {metal.future_symbol}: résultat absent")
    result = result_list[0]

    timestamps = result.get("timestamp")
    indicators = result.get("indicators")
    quote_rows = indicators.get("quote") if isinstance(indicators, dict) else None
    quote_data = quote_rows[0] if isinstance(quote_rows, list) and quote_rows else None
    adj_rows = indicators.get("adjclose") if isinstance(indicators, dict) else None
    adj_data = adj_rows[0] if isinstance(adj_rows, list) and adj_rows else {}
    if not isinstance(timestamps, list) or not isinstance(quote_data, dict):
        raise RuntimeError(f"Yahoo {metal.future_symbol}: séries OHLC absentes")

    opens = quote_data.get("open") or []
    highs = quote_data.get("high") or []
    lows = quote_data.get("low") or []
    closes = quote_data.get("close") or []
    volumes = quote_data.get("volume") or []
    adjcloses = adj_data.get("adjclose") if isinstance(adj_data, dict) else []
    meta = result.get("meta") if isinstance(result.get("meta"), dict) else {}
    currency = str(meta.get("currency") or "USD").upper()
    if currency != "USD":
        raise RuntimeError(f"Yahoo {metal.future_symbol}: devise reçue {currency}, USD requise")

    by_date: dict[str, dict[str, Any]] = {}
    previous_close: float | None = None
    for index, stamp in enumerate(timestamps):
        close_value = positive_number(closes[index] if index < len(closes) else None)
        point_time = parse_time(stamp)
        day = date_key(stamp)
        if close_value is None or not point_time or not day:
            continue
        change_percent = None
        if previous_close is not None and previous_close > 0:
            change_percent = ((close_value - previous_close) / previous_close) * 100.0
        by_date[day] = {
            "date": day,
            "time": point_time,
            "open": positive_number(opens[index] if index < len(opens) else None),
            "high": positive_number(highs[index] if index < len(highs) else None),
            "low": positive_number(lows[index] if index < len(lows) else None),
            "close": close_value,
            "adj_close": positive_number(adjcloses[index] if index < len(adjcloses) else None),
            "volume": finite_number(volumes[index] if index < len(volumes) else None),
            "change_percent": change_percent,
        }
        previous_close = close_value

    points = [by_date[day] for day in sorted(by_date)]
    if len(points) < 200:
        raise RuntimeError(f"Yahoo {metal.future_symbol}: historique annuel insuffisant ({len(points)} points)")
    span_days = (
        datetime.fromisoformat(points[-1]["time"].replace("Z", "+00:00"))
        - datetime.fromisoformat(points[0]["time"].replace("Z", "+00:00"))
    ).days
    if span_days < 320:
        raise RuntimeError(f"Yahoo {metal.future_symbol}: période insuffisante ({span_days} jours)")

    return {
        "schema": "agent_crypto_metals_daily_series_v1",
        "version": SCHEMA_VERSION,
        "asset_id": metal.asset_id,
        "symbol": metal.symbol,
        "provider_symbol": metal.future_symbol,
        "name": metal.name,
        "instrument_type": "future_continuous",
        "market": metal.market,
        "currency": "USD",
        "unit": metal.unit,
        "unit_label_fr": metal.unit_label_fr,
        "unit_basis": "exchange_contract_convention",
        "interval": "1d",
        "range": "1y",
        "source_id": "yahoo_finance",
        "source_name": "Yahoo Finance",
        "exchange_name": meta.get("exchangeName") or meta.get("fullExchangeName") or metal.market,
        "timezone": meta.get("exchangeTimezoneName") or "UTC",
        "received_at": received_at,
        "points_count": len(points),
        "oldest_at": points[0]["time"],
        "newest_at": points[-1]["time"],
        "points": points,
        "integrity": {
            "fabricated_points_forbidden": True,
            "source_timestamp_preserved": True,
            "daily_date_deduplicated": True,
            "minimum_one_year_span_required": True,
            "crypto_history_reuse_forbidden": True,
        },
    }


def ecb_fx(
    session: requests.Session,
    timeout: float,
    received_at: str,
    fixtures: Path | None,
) -> dict[str, Any]:
    text = load_fixture(fixtures, "ecb_usd_eur.csv")
    if text is None:
        text = get_text(session, ECB_USD_EUR_URL, timeout)
    reader = csv.DictReader(io.StringIO(str(text)))
    observations: list[dict[str, Any]] = []
    for row in reader:
        period = row.get("TIME_PERIOD") or row.get("TIME") or row.get("time_period")
        value = positive_number(row.get("OBS_VALUE") or row.get("value") or row.get("obs_value"))
        if not period or value is None:
            continue
        observations.append({"date": str(period), "usd_per_eur": value, "eur_per_usd": 1.0 / value})
    if not observations:
        raise RuntimeError("BCE USD/EUR: aucune observation exploitable")
    observations.sort(key=lambda row: row["date"])
    latest = observations[-1]
    return {
        "schema": "agent_crypto_fx_reference_v1",
        "version": SCHEMA_VERSION,
        "pair": "USD/EUR",
        "series_key": "EXR.D.USD.EUR.SP00.A",
        "source_id": "ecb",
        "source_name": "Banque centrale européenne",
        "frequency": "daily",
        "source_date": latest["date"],
        "usd_per_eur": latest["usd_per_eur"],
        "eur_per_usd": latest["eur_per_usd"],
        "received_at": received_at,
        "observations": observations,
        "provenance_note": "Taux de référence quotidien BCE ; conversion informative distincte des prix source USD.",
    }


def archive_legacy_metals(data_dir: Path) -> None:
    existing = read_json(data_dir / "latest.json")
    if str(existing.get("provider_id") if existing else "") != "metals_dev":
        return
    archive = data_dir / "archive" / "metals_dev_2026-08-01"
    archive.mkdir(parents=True, exist_ok=True)
    for relative in ("latest.json", "status.json", "ryzen_report.json", "history/index.json"):
        source = data_dir / relative
        target = archive / relative
        if source.is_file() and not target.exists():
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target)
    history_dir = data_dir / "history"
    if history_dir.is_dir():
        for source in history_dir.glob("ryzen7_metals_*.json"):
            target = archive / "history" / source.name
            target.parent.mkdir(parents=True, exist_ok=True)
            if not target.exists():
                shutil.copy2(source, target)


def enrich_quotes_with_fx(quotes: list[dict[str, Any]], fx: dict[str, Any]) -> None:
    eur_per_usd = positive_number(fx.get("eur_per_usd"))
    if eur_per_usd is None:
        raise RuntimeError("BCE USD/EUR: facteur EUR/USD invalide")
    for item in quotes:
        price = positive_number(item.get("price"))
        if price is None:
            raise RuntimeError(f"Prix courant invalide pour {item.get('symbol')}")
        item["price_eur"] = price * eur_per_usd
        item["fx_source_id"] = "ecb"
        item["fx_source_name"] = "Banque centrale européenne"
        item["fx_source_date"] = fx["source_date"]
        item["fx_eur_per_usd"] = eur_per_usd


def build_history_response(series_by_asset: dict[str, dict[str, Any]], received_at: str) -> dict[str, Any]:
    points_by_asset = {
        asset_id: {point["date"]: point for point in series["points"]}
        for asset_id, series in series_by_asset.items()
    }
    common_dates = set.intersection(*(set(points) for points in points_by_asset.values()))
    if len(common_dates) < 200:
        raise RuntimeError(f"Historique commun 5/5 insuffisant ({len(common_dates)} jours)")

    snapshots: list[dict[str, Any]] = []
    for day in sorted(common_dates):
        quotes: list[dict[str, Any]] = []
        for metal in METALS:
            series = series_by_asset[metal.asset_id]
            point = points_by_asset[metal.asset_id][day]
            quotes.append({
                "asset_id": metal.asset_id,
                "domain": "metals",
                "symbol": metal.symbol,
                "source_id": "yahoo_finance",
                "source_name": f"Yahoo Finance · {metal.market}",
                "provider_symbol": metal.future_symbol,
                "instrument_type": "future_continuous",
                "market": metal.market,
                "currency": "USD",
                "unit": metal.unit,
                "unit_label_fr": metal.unit_label_fr,
                "unit_basis": "exchange_contract_convention",
                "price": point["close"],
                "bid": None,
                "ask": None,
                "change": None,
                "change_percent": point["change_percent"],
                "source_time": point["time"],
                "received_at": received_at,
                "data_state": "data_historical",
                "delay_seconds": None,
                "licence_state": "public_web_terms",
                "provenance_note": (
                    f"Historique quotidien public {metal.future_symbol}, marché {metal.market}, "
                    f"unité {metal.unit_label_fr}; série Futures distincte de la cotation indicative courante."
                ),
            })
        snapshots.append({
            "schema": "agent_crypto_metals_snapshot_v1",
            "version": SCHEMA_VERSION,
            "snapshot_id": f"public-futures-{day}",
            "saved_at": f"{day}T00:00:00.000Z",
            "source_mode": "github_actions_public_archive",
            "provider_id": "yahoo_finance",
            "provider_name": "Yahoo Finance · Futures métaux",
            "assets_expected": EXPECTED_ASSETS,
            "assets_count": len(quotes),
            "quote_currencies": ["USD"],
            "quotes": quotes,
            "state": "ready",
            "integrity": {
                "quotes_connected": True,
                "no_invented_values": True,
                "crypto_data_reuse_forbidden": True,
                "source_timestamp_required": True,
                "received_timestamp_required": True,
                "currency_required_for_numeric_price": True,
                "unit_required_for_numeric_price": True,
                "single_snapshot_must_not_draw_chart": True,
                "public_collection_only": True,
                "secret_fields_forbidden": True,
                "spot_and_futures_series_separated": True,
            },
        })

    return {
        "schema": "agent_crypto_metals_history_response_v1",
        "version": SCHEMA_VERSION,
        "source_mode": "github_actions_public_archive",
        "generated_at": received_at,
        "count": len(snapshots),
        "snapshots": snapshots,
        "integrity": {
            "fabricated_points_forbidden": True,
            "crypto_history_reuse_forbidden": True,
            "source_time_preserved": True,
            "duplicate_snapshot_ids_forbidden": True,
            "complete_five_asset_snapshots_only": True,
            "spot_and_futures_series_separated": True,
        },
    }


def current_snapshot(quotes: list[dict[str, Any]], received_at: str) -> dict[str, Any]:
    payload = {
        "schema": "agent_crypto_metals_snapshot_v1",
        "version": SCHEMA_VERSION,
        "snapshot_id": "github-actions-public-metals-" + received_at.replace(":", "-").replace(".", "-"),
        "saved_at": received_at,
        "source_mode": "github_actions_public_archive",
        "provider_id": "gold_api",
        "provider_name": "Gold API",
        "assets_expected": EXPECTED_ASSETS,
        "assets_count": len(quotes),
        "quote_currencies": ["USD"],
        "quotes": sorted(quotes, key=lambda row: ASSET_ORDER[row["asset_id"]]),
        "state": "ready" if len(quotes) == len(METALS) else "partial",
        "integrity": {
            "quotes_connected": len(quotes) == len(METALS),
            "no_invented_values": True,
            "crypto_data_reuse_forbidden": True,
            "source_timestamp_required": False,
            "received_timestamp_required": True,
            "currency_required_for_numeric_price": True,
            "unit_required_for_numeric_price": True,
            "single_snapshot_must_not_draw_chart": True,
            "public_collection_only": True,
            "secret_fields_forbidden": True,
            "spot_and_futures_series_separated": True,
        },
    }
    payload["fingerprint"] = sha256_json({"saved_at": received_at, "quotes": payload["quotes"]})
    return payload


def build_status(
    received_at: str,
    history: dict[str, Any],
    series_by_asset: dict[str, dict[str, Any]],
    fx: dict[str, Any],
) -> dict[str, Any]:
    oldest = min(series["oldest_at"] for series in series_by_asset.values())
    newest = max(series["newest_at"] for series in series_by_asset.values())
    return {
        "schema": "agent_crypto_metals_collector_status_v1",
        "version": SCHEMA_VERSION,
        "status": "ready",
        "provider_id": "public_metals_multi_source",
        "provider_name": "Gold API + Yahoo Finance Futures + BCE",
        "bridge_required": False,
        "public_page_mode": "github_actions_archive_reader",
        "last_attempt_at": received_at,
        "last_success_at": received_at,
        "last_error": None,
        "assets_expected": len(METALS),
        "assets_received": len(METALS),
        "quota": {"plan": "public_no_key", "limit": None, "remaining": None, "period": None, "reset_at": None},
        "sources": [
            {"id": "gold_api", "role": "current_indicative_prices", "authentication": "none", "state": "ready"},
            {"id": "yahoo_finance", "role": "one_year_daily_futures", "authentication": "none", "state": "ready"},
            {"id": "ecb", "role": "usd_eur_reference_rate", "authentication": "none", "state": "ready"},
        ],
        "history": {
            "file": "history/public_1y.json",
            "snapshots": history["count"],
            "oldest_at": oldest,
            "newest_at": newest,
            "series_points": {asset_id: series["points_count"] for asset_id, series in series_by_asset.items()},
        },
        "fx": {"pair": fx["pair"], "source_date": fx["source_date"], "eur_per_usd": fx["eur_per_usd"]},
        "security": {
            "api_key_present_in_public_files": False,
            "browser_direct_keyed_request_forbidden": True,
            "crypto_cache_separation_required": True,
            "secret_fields_forbidden_in_import": True,
            "provider_fetch_not_performed_by_public_page": True,
            "manual_ryzen_publication_required": False,
        },
        "updated_at": received_at,
        "collector": "tools/collect_public_metals.py",
    }


def build_degraded_status(data_dir: Path, received_at: str, errors: list[str], source_states: dict[str, str]) -> dict[str, Any]:
    previous = read_json(data_dir / "status.json") or {}
    previous_latest = read_json(data_dir / "latest.json") or {}
    previous_ready = previous.get("status") in {"ready", "degraded"} and previous_latest.get("assets_count") == len(METALS)
    return {
        "schema": "agent_crypto_metals_collector_status_v1",
        "version": SCHEMA_VERSION,
        "status": "degraded" if previous_ready else "unavailable",
        "provider_id": "public_metals_multi_source",
        "provider_name": "Gold API + Yahoo Finance Futures + BCE",
        "bridge_required": False,
        "public_page_mode": "github_actions_archive_reader",
        "last_attempt_at": received_at,
        "last_success_at": previous.get("last_success_at") if previous_ready else None,
        "last_error": " | ".join(errors)[:4000],
        "assets_expected": len(METALS),
        "assets_received": int(previous_latest.get("assets_count") or 0) if previous_ready else 0,
        "quota": {"plan": "public_no_key", "limit": None, "remaining": None, "period": None, "reset_at": None},
        "sources": [
            {"id": source_id, "authentication": "none", "state": source_states.get(source_id, "unavailable")}
            for source_id in ("gold_api", "yahoo_finance", "ecb")
        ],
        "history": previous.get("history") if previous_ready else None,
        "fx": previous.get("fx") if previous_ready else None,
        "fallback": {
            "last_valid_snapshot_preserved": bool(previous_ready),
            "last_valid_history_preserved": bool(previous_ready),
            "invented_replacement_values": False,
        },
        "security": {
            "api_key_present_in_public_files": False,
            "browser_direct_keyed_request_forbidden": True,
            "crypto_cache_separation_required": True,
            "secret_fields_forbidden_in_import": True,
            "provider_fetch_not_performed_by_public_page": True,
            "manual_ryzen_publication_required": False,
        },
        "updated_at": received_at,
        "collector": "tools/collect_public_metals.py",
    }


def build_index(received_at: str, history: dict[str, Any], series_by_asset: dict[str, dict[str, Any]]) -> dict[str, Any]:
    entries = [
        {
            "asset_id": metal.asset_id,
            "symbol": metal.symbol,
            "provider_symbol": metal.future_symbol,
            "file": f"../series/{metal.asset_id}.json",
            "points": series_by_asset[metal.asset_id]["points_count"],
            "oldest_at": series_by_asset[metal.asset_id]["oldest_at"],
            "newest_at": series_by_asset[metal.asset_id]["newest_at"],
            "provider_id": "yahoo_finance",
        }
        for metal in METALS
    ]
    return {
        "schema": "agent_crypto_metals_history_index_v1",
        "version": SCHEMA_VERSION,
        "directory": "data/metals/history",
        "history_response": "public_1y.json",
        "entries": entries,
        "files": len(entries) + 1,
        "snapshots": history["count"],
        "oldest_at": min(entry["oldest_at"] for entry in entries),
        "newest_at": max(entry["newest_at"] for entry in entries),
        "updated_at": received_at,
        "integrity": {
            "fabricated_points_forbidden": True,
            "crypto_history_reuse_forbidden": True,
            "source_time_preserved": True,
            "duplicate_snapshot_ids_forbidden": True,
            "complete_five_asset_snapshots_only": True,
        },
    }


def build_manifest(received_at: str, state: str, status: dict[str, Any], errors: list[str] | None = None) -> dict[str, Any]:
    payload = {
        "schema": "agent_crypto_public_metals_collection_manifest_v1",
        "version": SCHEMA_VERSION,
        "generated_at": received_at,
        "build_target": BUILD_TARGET,
        "state": state,
        "assets": [metal.symbol for metal in METALS],
        "current_provider": "gold_api",
        "history_provider": "yahoo_finance",
        "fx_provider": "ecb",
        "status": status.get("status"),
        "errors": errors or [],
        "files": {
            "latest": "data/metals/latest.json",
            "status": "data/metals/status.json",
            "history": "data/metals/history/public_1y.json",
            "history_index": "data/metals/history/index.json",
            "fx": "data/metals/fx/usd_eur.json",
            "series": [f"data/metals/series/{metal.asset_id}.json" for metal in METALS],
        },
        "integrity": {
            "no_api_key": True,
            "no_manual_ryzen_publication": True,
            "crypto_data_untouched": True,
            "five_of_five_required": True,
            "minimum_one_year_history_required": True,
            "spot_and_futures_series_separated": True,
            "last_valid_data_preserved_on_failure": True,
        },
    }
    payload["fingerprint"] = sha256_json(payload)
    return payload


def validate_output(
    snapshot: dict[str, Any],
    history: dict[str, Any],
    status: dict[str, Any],
    series_by_asset: dict[str, dict[str, Any]],
) -> None:
    if snapshot.get("assets_count") != len(METALS):
        raise RuntimeError(f"Snapshot courant incomplet: {snapshot.get('assets_count')}/{len(METALS)}")
    if {row.get("asset_id") for row in snapshot.get("quotes", [])} != set(EXPECTED_ASSETS):
        raise RuntimeError("Panier courant incohérent")
    if history.get("count", 0) < 200:
        raise RuntimeError(f"Historique public insuffisant: {history.get('count', 0)} snapshots")
    if any(snapshot_row.get("assets_count") != len(METALS) for snapshot_row in history.get("snapshots", [])):
        raise RuntimeError("Historique contient un snapshot incomplet")
    if set(series_by_asset) != set(EXPECTED_ASSETS):
        raise RuntimeError("Séries Métaux incomplètes")
    if any(series.get("points_count", 0) < 200 for series in series_by_asset.values()):
        raise RuntimeError("Une série Métaux contient moins de 200 points")
    if status.get("security", {}).get("api_key_present_in_public_files") is not False:
        raise RuntimeError("Verrou sécurité public absent")


def main() -> int:
    parser = argparse.ArgumentParser(description="Collecteur public Métaux Agent-Crypto")
    parser.add_argument("--root", default="public/agent_crypto_erith_ia", help="Racine de l'interface dans le dépôt")
    parser.add_argument("--timeout", type=float, default=25.0)
    parser.add_argument("--fixtures", type=Path, default=None, help="Fixtures hors ligne pour tests")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    data_dir = root / "data" / "metals"
    data_dir.mkdir(parents=True, exist_ok=True)
    archive_legacy_metals(data_dir)

    received_at = iso()
    session = build_session()
    errors: list[str] = []
    source_states = {"gold_api": "ready", "yahoo_finance": "ready", "ecb": "ready"}

    quotes: list[dict[str, Any]] = []
    for metal in METALS:
        try:
            quotes.append(gold_api_quote(session, metal, args.timeout, received_at, args.fixtures))
        except Exception as exc:
            source_states["gold_api"] = "unavailable"
            errors.append(f"Gold API {metal.symbol}: {exc}")

    series_by_asset: dict[str, dict[str, Any]] = {}
    for metal in METALS:
        try:
            series_by_asset[metal.asset_id] = yahoo_future_series(session, metal, args.timeout, received_at, args.fixtures)
        except Exception as exc:
            source_states["yahoo_finance"] = "unavailable"
            errors.append(f"Yahoo {metal.future_symbol}: {exc}")

    fx: dict[str, Any] = {}
    try:
        fx = ecb_fx(session, args.timeout, received_at, args.fixtures)
    except Exception as exc:
        source_states["ecb"] = "unavailable"
        errors.append(f"BCE USD/EUR: {exc}")

    if errors:
        status = build_degraded_status(data_dir, received_at, errors, source_states)
        atomic_write_json(data_dir / "status.json", status)
        atomic_write_json(data_dir / "collector_manifest.json", build_manifest(received_at, "degraded", status, errors))
        print(json.dumps({"status": status["status"], "errors": errors}, ensure_ascii=False))
        return 0

    enrich_quotes_with_fx(quotes, fx)
    snapshot = current_snapshot(quotes, received_at)
    history = build_history_response(series_by_asset, received_at)
    status = build_status(received_at, history, series_by_asset, fx)
    index = build_index(received_at, history, series_by_asset)
    validate_output(snapshot, history, status, series_by_asset)

    atomic_write_json(data_dir / "latest.json", snapshot)
    atomic_write_json(data_dir / "status.json", status)
    atomic_write_json(data_dir / "history" / "public_1y.json", history)
    atomic_write_json(data_dir / "history" / "index.json", index)
    atomic_write_json(data_dir / "fx" / "usd_eur.json", fx)
    for asset_id, series in series_by_asset.items():
        atomic_write_json(data_dir / "series" / f"{asset_id}.json", series)
    atomic_write_json(data_dir / "collector_manifest.json", build_manifest(received_at, "ready", status))

    print(json.dumps({
        "status": "ok",
        "received_at": received_at,
        "quotes": len(quotes),
        "history_snapshots": history["count"],
        "series_points": {key: value["points_count"] for key, value in series_by_asset.items()},
        "fx_date": fx["source_date"],
    }, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"COLLECTOR_FATAL: {exc}", file=sys.stderr)
        raise
