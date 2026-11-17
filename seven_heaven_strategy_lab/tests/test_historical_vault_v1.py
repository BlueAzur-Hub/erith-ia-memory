from __future__ import annotations
import calendar
import csv
from datetime import datetime, timezone
from decimal import Decimal
import hashlib
import io
import json
from pathlib import Path
import zipfile

import pytest

from src import historical_vault_v1 as hv
from src.catalog_source_v48 import read_source as read_catalog_source


def _minute_zip(pair: str, year: int, month: int):
    start = int(datetime(year, month, 1, tzinfo=timezone.utc).timestamp())
    count = calendar.monthrange(year, month)[1] * 24 * 60
    unit = 1_000 if year == 2024 else 1_000_000
    out = io.StringIO(newline="")
    writer = csv.writer(out, lineterminator="\n")
    for i in range(count):
        t = (start + i * 60) * unit
        price = Decimal("100") + Decimal(i) / Decimal("100000")
        writer.writerow([
            str(t), str(price), str(price + 1), str(price - 1), str(price + Decimal("0.25")),
            "2.5", str(t + unit * 60 - 1), "0", "1", "0", "0", "0"
        ])
    csv_bytes = out.getvalue().encode()
    name = f"{pair}-1m-{year}-{month:02d}.csv"
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr(name, csv_bytes)
    archive = buf.getvalue()
    zip_name = name[:-4] + ".zip"
    checksum = hashlib.sha256(archive).hexdigest() + "  " + zip_name
    return archive, checksum


def test_snapshot_is_bounded_and_truthful():
    data = hv.snapshot()
    assert data["summary"] == {
        "ranked_identities": 250,
        "archive_assets": 122,
        "assets_with_12_consecutive_months": 108,
        "assets_with_24_consecutive_months": 90,
        "assets_without_verified_year": 142,
        "source_catalog_minutes": 248087520,
    }
    assert [a["symbol"] for a in data["assets"]] == ["BTC", "ETH", "BNB", "XRP", "SOL"]
    assert all(a["installable_years"] == [2024, 2025] for a in data["assets"])
    assert all(a["indexed_years"]["2024"] == 12 and a["indexed_years"]["2025"] == 12 for a in data["assets"])


@pytest.mark.parametrize("year,unit_name", [(2024,"milliseconds"),(2025,"microseconds")])
def test_month_validator_checks_checksum_continuity_and_aggregates_1h(year,unit_name):
    archive, checksum = _minute_zip("BTCUSDT", year, 1)
    result = hv._validate_month("BTCUSDT", year, 1, archive, checksum)
    assert result["rows_1m"] == 31 * 24 * 60
    assert result["rows_1h"] == 31 * 24
    assert len(result["bars"]) == 31 * 24
    assert result["timestamp_input_unit"] == unit_name
    first = result["bars"][0]
    assert first[0] == int(datetime(year, 1, 1, tzinfo=timezone.utc).timestamp())
    assert first[1] == pytest.approx(100.0)
    assert first[2] > first[1]
    assert first[4] > first[1]
    bad = bytearray(archive); bad[-8] ^= 1
    with pytest.raises(hv.HistoricalVaultError, match="SHA-256"):
        hv._validate_month("BTCUSDT", year, 1, bytes(bad), checksum)


def test_install_year_is_atomic_catalog_source(monkeypatch, tmp_path):
    def fake_download(url, limit):
        return b"checksum" if url.endswith(".CHECKSUM") else b"archive"

    def fake_validate(pair, year, month, archive, checksum):
        start = int(datetime(year, month, 1, tzinfo=timezone.utc).timestamp())
        hours = calendar.monthrange(year, month)[1] * 24
        bars=[]
        for i in range(hours):
            t=start+i*3600
            bars.append((t,100.0,101.0,99.0,100.5,10.0))
        return {
            "pair":pair,"year":year,"month":month,"source_zip":f"{pair}-1m-{year}-{month:02d}.zip",
            "archive_sha256":hashlib.sha256(f"{pair}-{year}-{month}".encode()).hexdigest(),
            "source_csv_sha256":hashlib.sha256(f"csv-{pair}-{year}-{month}".encode()).hexdigest(),
            "rows_1m":calendar.monthrange(year,month)[1]*24*60,"rows_1h":hours,
            "timestamp_input_unit":"milliseconds","bars":bars,
        }

    monkeypatch.setattr(hv, "historical_bundle_available", lambda symbol, year: False)
    monkeypatch.setattr(hv, "historical_bundle_available", lambda symbol, year: False)
    monkeypatch.setattr(hv, "_download", fake_download)
    monkeypatch.setattr(hv, "_validate_month", fake_validate)
    monkeypatch.setattr(hv, "_ensure_reserve", lambda workspace: 10_000_000_000)
    manifest = hv.install_year(tmp_path, "ETH", 2025)
    assert manifest["id"] == "CAT_BINANCE_ETHUSDT_1H_2025"
    assert manifest["pair"] == "ETH/USDT"
    assert manifest["rows"] == 365 * 24
    assert manifest["certification"] == "BINANCE_PUBLIC_CHECKSUMS_12_MONTHS_FULL_YEAR"
    accepted, bars = read_catalog_source(tmp_path, manifest["id"])
    assert accepted["stored_csv_sha256"] == manifest["stored_csv_sha256"]
    assert len(bars) == 365 * 24
    assert not any(tmp_path.rglob("*.zip"))
    status = hv.vault_status(tmp_path)
    eth = next(a for a in status["assets"] if a["symbol"] == "ETH")
    assert next(y for y in eth["years"] if y["year"] == 2025)["installed"] is True



def test_install_year_rolls_back_if_generic_catalog_rejects(monkeypatch, tmp_path):
    def fake_download(url, limit):
        return b"checksum" if url.endswith(".CHECKSUM") else b"archive"

    def fake_validate(pair, year, month, archive, checksum):
        start = int(datetime(year, month, 1, tzinfo=timezone.utc).timestamp())
        hours = calendar.monthrange(year, month)[1] * 24
        bars = [(start+i*3600,100.0,101.0,99.0,100.5,10.0) for i in range(hours)]
        return {
            "pair":pair,"year":year,"month":month,"source_zip":f"{pair}-1m-{year}-{month:02d}.zip",
            "archive_sha256":hashlib.sha256(f"{pair}-{year}-{month}".encode()).hexdigest(),
            "source_csv_sha256":hashlib.sha256(f"csv-{pair}-{year}-{month}".encode()).hexdigest(),
            "rows_1m":calendar.monthrange(year,month)[1]*24*60,"rows_1h":hours,
            "timestamp_input_unit":"milliseconds","bars":bars,
        }

    monkeypatch.setattr(hv, "historical_bundle_available", lambda symbol, year: False)
    monkeypatch.setattr(hv, "_download", fake_download)
    monkeypatch.setattr(hv, "_validate_month", fake_validate)
    monkeypatch.setattr(hv, "_ensure_reserve", lambda workspace: 10_000_000_000)
    real_reader = hv.read_catalog_source
    calls = {"n": 0}
    def reject_after_write(workspace, sid):
        calls["n"] += 1
        # Initial probe should behave normally (missing source); final acceptance is refused.
        if calls["n"] == 1:
            return real_reader(workspace, sid)
        raise hv.CatalogSourceError("synthetic final rejection")
    monkeypatch.setattr(hv, "read_catalog_source", reject_after_write)

    with pytest.raises(hv.CatalogSourceError, match="synthetic final rejection"):
        hv.install_year(tmp_path, "BTC", 2024)
    folder = tmp_path / hv.CATALOG_ROOT / hv.source_id("BTC", 2024)
    assert not folder.exists()

def test_v1_refuses_non_whitelisted_year_and_asset(tmp_path):
    with pytest.raises(hv.HistoricalVaultError):
        hv.install_year(tmp_path, "DOGE", 2025)
    with pytest.raises(hv.HistoricalVaultError):
        hv.install_year(tmp_path, "BTC", 2023)
