#!/usr/bin/env python3
"""Public OKX BTC-USDC 1H historical OHLCV case-study capture; no accounts/orders."""
from __future__ import annotations

import argparse
import hashlib
import json
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

PAIR = "BTC-USDC"
BAR = "1H"
DAYS = ("2026-11-05", "2026-11-08")
HOUR_MS = 3_600_000
HOSTS = ("https://eea.okx.com", "https://www.okx.com")
API_PATH = "/api/v5/market/history-candles"
SCHEMA = "seven.crypto.okx-btc-hourly-event-study.v1"


class EvidenceError(RuntimeError):
    """A source or its response has insufficient authenticated market structure."""


def decimal_value(value, name, *, positive=False):
    try:
        out = Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        raise EvidenceError(f"Invalid numeric {name}: {value!r}") from None
    if not out.is_finite() or (positive and out <= 0) or (not positive and out < 0):
        raise EvidenceError(f"Negative, zero or non-finite {name}: {value!r}")
    return out


def utc_ms(day):
    d = datetime.strptime(day, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    return int(d.timestamp() * 1000)


def iso(ms):
    return datetime.fromtimestamp(ms / 1000, timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def validate_candle(raw):
    if not isinstance(raw, list) or len(raw) != 9:
        raise EvidenceError("Unexpected OKX history-candles row layout (expected nine columns)")
    try:
        ts = int(raw[0])
    except (TypeError, ValueError):
        raise EvidenceError("Invalid OKX timestamp") from None
    if ts <= 0 or ts % HOUR_MS != 0:
        raise EvidenceError(f"Non-hourly UTC timestamp: {ts}")
    o, h, low, c = (decimal_value(raw[i], ("open", "high", "low", "close")[i-1], positive=True)
                      for i in range(1, 5))
    if h < max(o, c, low) or low > min(o, c, h):
        raise EvidenceError(f"OHLC invalid at {ts}")
    for i in (5, 6, 7):
        decimal_value(raw[i], ("vol_btc", "vol_ccy", "vol_quote")[i-5])
    if str(raw[8]) != "1":
        raise EvidenceError(f"Unclosed OKX candle {ts}; cannot treat as historic proof")
    return {"t": ts, "utc": iso(ts), "o": str(raw[1]), "h": str(raw[2]),
            "l": str(raw[3]), "c": str(raw[4]), "v_btc": str(raw[5]),
            "vol_ccy": str(raw[6]), "v_usdc_quote": str(raw[7]), "confirm": "1"}


def extract_day(raw_rows, day):
    if not isinstance(raw_rows, list):
        raise EvidenceError("OKX data must be an array")
    start = utc_ms(day)
    end = start + 24 * HOUR_MS
    by_ts = {}
    for raw in raw_rows:
        if not isinstance(raw, list) or not raw:
            raise EvidenceError("Malformed historical row")
        try:
            ts = int(raw[0])
        except (TypeError, ValueError):
            raise EvidenceError("Invalid historical timestamp") from None
        if start <= ts < end:
            if ts in by_ts:
                raise EvidenceError(f"Duplicate OKX hour {iso(ts)}")
            by_ts[ts] = validate_candle(raw)
    expected = [start + h * HOUR_MS for h in range(24)]
    missing = [iso(t) for t in expected if t not in by_ts]
    if missing:
        raise EvidenceError(f"Missing {len(missing)}/24 UTC hourly candles for {day}: {', '.join(missing[:4])}")
    return [by_ts[t] for t in expected]


def validate_api(data):
    if not isinstance(data, dict) or str(data.get("code")) != "0":
        raise EvidenceError(f"OKX public API returned non-success status: {data.get('code') if isinstance(data, dict) else None}")
    if not isinstance(data.get("data"), list):
        raise EvidenceError("OKX public API has no data array")
    return data["data"]


def get_history_page(day, fetch=None):
    """OKX `after` means STRICTLY EARLIER than the supplied millisecond timestamp."""
    end = utc_ms(day) + 24 * HOUR_MS
    params = urlencode({"instId": PAIR, "bar": BAR, "after": str(end), "limit": "100"})
    errors = []
    for host in HOSTS:
        url = host + API_PATH + "?" + params
        try:
            if fetch is None:
                req = Request(url, headers={"User-Agent": "SevenHeaven-public-OHLCV-research/1.0", "Accept": "application/json"})
                with urlopen(req, timeout=25) as response:
                    raw = response.read(2_000_000)
                    if len(raw) >= 2_000_000:
                        raise EvidenceError("Source API response oversized")
            else:
                raw = fetch(url)
            if isinstance(raw, str):
                raw = raw.encode("utf-8")
            data = json.loads(raw)
            rows = validate_api(data)
            extract_day(rows, day)  # A valid HTTP response still needs exactly 24 complete hourly bars.
            # Do not fall back to a different exchange or alter the instrument/bar.
            return rows, {"request_url": url, "host": host, "response_sha256": hashlib.sha256(raw).hexdigest()}
        except (OSError, URLError, HTTPError, TimeoutError, ValueError, EvidenceError) as exc:
            errors.append(f"{host}: {type(exc).__name__}: {str(exc)[:160]}")
    raise EvidenceError("All public OKX endpoints unavailable: " + " | ".join(errors))


def summarize(rows):
    start = Decimal(rows[0]["o"])
    close = Decimal(rows[-1]["c"])
    total_btc = sum((Decimal(r["v_btc"]) for r in rows), Decimal(0))
    total_quote = sum((Decimal(r["v_usdc_quote"]) for r in rows), Decimal(0))
    max_hour = max(rows, key=lambda r: Decimal(r["v_btc"]))
    return {"open_usdc_per_btc": str(start), "close_usdc_per_btc": str(close),
            "change_pct": str((close / start - 1) * 100),
            "low_usdc_per_btc": str(min(Decimal(r["l"]) for r in rows)),
            "high_usdc_per_btc": str(max(Decimal(r["h"]) for r in rows)),
            "total_volume_btc": str(total_btc), "total_quote_volume_usdc": str(total_quote),
            "peak_base_volume_hour_utc": max_hour["utc"],
            "peak_base_volume_btc": max_hour["v_btc"]}


def build_day(day, fetch=None, captured_at=None):
    if day not in DAYS:
        raise EvidenceError("This case-study collector only permits the approved UTC dates")
    raw, proof = get_history_page(day, fetch)
    rows = extract_day(raw, day)
    return {"schema": SCHEMA, "status": "CAPTURED_FROM_PUBLIC_OKX_API_NOT_EXCHANGE_SIGNED",
            "date_utc": day, "collected_at_utc": captured_at or datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "source": proof, "venue": "OKX", "market_type": "SPOT", "instrument": PAIR,
            "quote": "USDC", "base": "BTC", "bar": BAR, "interval_minutes": 60,
            "hour_count": 24, "timestamps_utc_contiguous": True, "all_candles_closed": True,
            "no_orders": True, "private_account_access": False, "causal_claim": False,
            "volume_units": {"v_btc": "BTC base units", "vol_ccy": "OKX volCcy as returned", "v_usdc_quote": "USDC quote units"},
            "summary": summarize(rows), "rows": rows,
            "limitations": ["Spot volume does not measure forced derivatives liquidations or net sellers",
                            "ETF fund flows are not contained in the OKX API",
                            "OHLCV responses are not exchange-signed; not a transaction-level audit",
                            "No news or liquidation cause may be attributed to an individual candle"]}


def json_bytes(obj):
    return (json.dumps(obj, ensure_ascii=False, indent=2, sort_keys=True) + "\n").encode("utf-8")


def publish(output_dir, fetch=None, captured_at=None):
    out = Path(output_dir)
    # Atomic public case-study publication: validate both days BEFORE writing either file.
    snapshots = {day: build_day(day, fetch=fetch, captured_at=captured_at) for day in DAYS}
    for day, obj in snapshots.items():
        old = out / f"btc-usdc-okx-1h-{day}.json"
        if old.exists():
            existing = json.loads(old.read_text(encoding="utf-8"))
            stable_fields = ("instrument", "bar", "date_utc", "rows")
            if any(existing.get(k) != obj[k] for k in stable_fields):
                raise EvidenceError(f"Refuse to overwrite an existing different source record for {day}")
            # Archived records are immutable if candles match.
            snapshots[day] = existing
    out.mkdir(parents=True, exist_ok=True)
    manifest = {"schema": "seven.crypto.okx-btc-hourly-manifest.v1", "status": "PUBLIC_SOURCE_CAPTURE_NOT_EXCHANGE_SIGNED",
                "instrument": PAIR, "bar": BAR, "dates_utc": list(DAYS), "complete_days": len(snapshots),
                "total_candles": 48, "orders_enabled": False,
                "files": []}
    for day in DAYS:
        name = f"btc-usdc-okx-1h-{day}.json"
        data = json_bytes(snapshots[day])
        path = out / name
        path.write_bytes(data)
        manifest["files"].append({"date_utc": day, "file": name,
                                  "sha256": hashlib.sha256(data).hexdigest(), "hour_count": 24})
    (out / "index.json").write_bytes(json_bytes(manifest))
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", required=True, help="The immutable public evidence directory")
    args = parser.parse_args()
    result = publish(args.output)
    print(json.dumps({"status": result["status"], "days": result["complete_days"],
                      "candles": result["total_candles"], "files": result["files"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
