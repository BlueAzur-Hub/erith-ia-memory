"""Preregistered segmented 2022-2023 RSI45 holdout.

This experiment runs only after:
- the original continuous source gate failed before performance;
- source-only diagnostics identified the single March 2023 discontinuity;
- the segmented replacement design and 4h alignment correction were committed
  to main before any owner/candidate result was calculated.

No post-hoc strategy selection is permitted.
"""
from __future__ import annotations

import calendar
import csv
from decimal import Decimal, InvalidOperation
from datetime import datetime, timezone
import hashlib
import io
import json
import math
from pathlib import Path
import re
import sys
import urllib.parse
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.binance_monthly_v46 import MAX_ZIP_BYTES, validate_month
from src.observatory import run_one, run_with_diagnostics

BASE_URL = "https://data.binance.vision/data/spot/monthly/klines/BTCUSDT/1h"
MAX_CHECKSUM_BYTES = 512
MARCH_2023_ARCHIVE_SHA256 = "7f2afb8e0179a57ac31eab5205660298ba5eb77039ac2e21aef9b715ff3d06ce"

OWNER = {
    "kind": "CUSTOM_RULES",
    "timeframe": "4h",
    "capital": 10_000,
    "fee": 0.001,
    "slippage": 0.0005,
    "ema_fast": 11,
    "ema_slow": 31,
    "entry_rule": "PRICE_ABOVE_EMA",
    "filter_rule": "RSI_BELOW",
    "rsi_entry_max": 61,
    "exit_rule": "PRICE_BELOW_EMA",
    "rsi_exit_min": 71,
    "rsi_period": 15,
    "volume_period": 21,
    "volume_multiplier": 1,
    "stop_loss_pct": 20,
    "take_profit_pct": 0,
}
CANDIDATE = {**OWNER, "rsi_entry_max": 45}

A_START = int(datetime(2022, 1, 1, tzinfo=timezone.utc).timestamp())
A_END = int(datetime(2023, 3, 24, 11, tzinfo=timezone.utc).timestamp())
INVALID_OPEN = int(datetime(2023, 3, 24, 12, tzinfo=timezone.utc).timestamp())
MISSING_OPEN = int(datetime(2023, 3, 24, 13, tzinfo=timezone.utc).timestamp())
ALIGNMENT_BUFFER = {
    int(datetime(2023, 3, 24, 14, tzinfo=timezone.utc).timestamp()),
    int(datetime(2023, 3, 24, 15, tzinfo=timezone.utc).timestamp()),
}
B_START = int(datetime(2023, 3, 24, 16, tzinfo=timezone.utc).timestamp())
B_END = int(datetime(2023, 12, 31, 23, tzinfo=timezone.utc).timestamp())


def download(url: str, limit: int) -> bytes:
    p = urllib.parse.urlsplit(url)
    if (p.scheme, p.hostname) != ("https", "data.binance.vision"):
        raise RuntimeError("Unexpected source host")
    req = urllib.request.Request(
        url, headers={"User-Agent": "Seven-Heaven-Segmented-Holdout/1.0"}
    )
    with urllib.request.urlopen(req, timeout=45) as response:
        final = urllib.parse.urlsplit(response.geturl())
        if (final.scheme, final.hostname) != ("https", "data.binance.vision"):
            raise RuntimeError("Unexpected redirect host")
        data = response.read(limit + 1)
    if not data or len(data) > limit:
        raise RuntimeError("Download size outside limit")
    return data


def fetch_strict_month(year: int, month: int):
    name = f"BTCUSDT-1h-{year}-{month:02d}.zip"
    url = f"{BASE_URL}/{name}"
    archive = download(url, MAX_ZIP_BYTES)
    checksum = download(url + ".CHECKSUM", MAX_CHECKSUM_BYTES).decode("utf-8")
    report = validate_month(archive, checksum, year=year, month=month)
    return report["bars"], {
        "year": year, "month": month, "mode": "STRICT_MONTH",
        "rows_used": report["rows"],
        "archive_sha256": report["archive_sha256"],
        "normalized_csv_sha256": report["normalized_csv_sha256"],
    }


def finite_decimal(value: str, *, allow_zero=False) -> Decimal:
    try:
        x = Decimal(value)
    except (InvalidOperation, ValueError) as exc:
        raise RuntimeError("Invalid decimal in March 2023 source") from exc
    if not x.is_finite() or x < 0 or (not allow_zero and x <= 0):
        raise RuntimeError("Invalid numeric range in March 2023 source")
    return x


def fetch_march_2023_strict_rows_excluding_known_anomaly():
    year, month = 2023, 3
    stem = "BTCUSDT-1h-2023-03"
    zip_name, csv_name = stem + ".zip", stem + ".csv"
    url = f"{BASE_URL}/{zip_name}"
    archive = download(url, MAX_ZIP_BYTES)
    checksum = download(url + ".CHECKSUM", MAX_CHECKSUM_BYTES).decode("utf-8").strip()
    m = re.fullmatch(r"([0-9a-fA-F]{64})\s+\*?" + re.escape(zip_name), checksum)
    if not m:
        raise RuntimeError("Unexpected CHECKSUM format for March 2023")
    observed = hashlib.sha256(archive).hexdigest()
    if observed != m.group(1).lower() or observed != MARCH_2023_ARCHIVE_SHA256:
        raise RuntimeError("March 2023 archive does not match preregistered source")
    with zipfile.ZipFile(io.BytesIO(archive)) as z:
        if z.namelist() != [csv_name]:
            raise RuntimeError("Unexpected March ZIP members")
        payload = z.read(csv_name)
    rows = list(csv.reader(io.StringIO(payload.decode("utf-8"), newline="")))
    if len(rows) != 743:
        raise RuntimeError("March 2023 source row count changed")

    bars = []
    saw_invalid = False
    opens = set()
    for line_no, row in enumerate(rows, 1):
        if len(row) != 12 or not row[0].isdigit() or not row[6].isdigit():
            raise RuntimeError(f"Invalid March row {line_no}")
        open_raw, close_raw = int(row[0]), int(row[6])
        if len(row[0]) != 13 or open_raw % 1000:
            raise RuntimeError("Unexpected March timestamp unit")
        ts = open_raw // 1000
        opens.add(ts)
        opening = finite_decimal(row[1])
        high = finite_decimal(row[2])
        low = finite_decimal(row[3])
        closing = finite_decimal(row[4])
        volume = finite_decimal(row[5], allow_zero=True)
        if high < max(opening, closing) or low > min(opening, closing) or low > high:
            raise RuntimeError("March OHLC inconsistency")
        expected_close = open_raw + 3_600_000 - 1
        if ts == INVALID_OPEN:
            if close_raw == expected_close:
                raise RuntimeError("Known March irregular close unexpectedly changed")
            if close_raw - expected_close != -1_218_353:
                raise RuntimeError("Known March irregular close delta changed")
            saw_invalid = True
            continue
        if close_raw != expected_close:
            raise RuntimeError("Unexpected additional March close anomaly")
        bars.append((ts, float(opening), float(high), float(low), float(closing), float(volume)))

    if not saw_invalid or MISSING_OPEN in opens:
        raise RuntimeError("Preregistered March anomaly no longer matches")
    return bars, {
        "year": 2023, "month": 3,
        "mode": "CHECKSUM_VERIFIED_STRICT_ROWS_EXCLUDING_KNOWN_ANOMALY",
        "archive_sha256": observed,
        "source_rows": 743,
        "strict_rows_retained": len(bars),
        "excluded_irregular_close_utc": "2023-03-24T12:00:00+00:00",
        "missing_utc": "2023-03-24T13:00:00+00:00",
    }


def continuous(bars):
    return all(b[0] == a[0] + 3600 for a, b in zip(bars, bars[1:]))


def metric(run):
    r, a = run["results"], run["analytics"]
    return {
        "return_pct": r["return_pct"],
        "equity_final": r["equity_final"],
        "max_drawdown_pct": r["max_drawdown_pct"],
        "fees_paid_usdt": r["fees_paid_usdt"],
        "turnover_usdt": r["turnover_usdt"],
        "hypothetical_fills": r["hypothetical_fills"],
        "closed_positions": a["closed_positions"],
        "win_rate_pct": a["win_rate_pct"],
        "profit_factor": a["profit_factor"],
        "time_in_position_pct": a["time_in_position_pct"],
    }


def run_segment(bars):
    owner = run_one(bars, OWNER, source_timeframe="1h")
    candidate = run_one(bars, CANDIDATE, source_timeframe="1h")
    cash = run_one(bars, {**OWNER, "kind": "CASH"}, source_timeframe="1h")
    hold = run_one(bars, {**OWNER, "kind": "HOLD_50"}, source_timeframe="1h")
    owner_full, owner_zero = run_with_diagnostics(bars, OWNER, source_timeframe="1h")
    cand_full, cand_zero = run_with_diagnostics(bars, CANDIDATE, source_timeframe="1h")
    assert metric(owner) == metric(owner_full)
    assert metric(candidate) == metric(cand_full)
    return {
        "owner": metric(owner),
        "candidate_rsi45": metric(candidate),
        "cash": metric(cash),
        "hold50": metric(hold),
        "candidate_minus_owner_return_pct_points": round(
            candidate["results"]["return_pct"] - owner["results"]["return_pct"], 5
        ),
        "candidate_minus_owner_drawdown_pct_points": round(
            candidate["results"]["max_drawdown_pct"] - owner["results"]["max_drawdown_pct"], 5
        ),
        "zero_friction": {
            "owner": owner_zero,
            "candidate_rsi45": cand_zero,
        },
    }


def main():
    all_valid = []
    provenance = []
    for year, months in ((2022, range(1, 13)), (2023, range(1, 13))):
        for month in months:
            if (year, month) == (2023, 3):
                bars, meta = fetch_march_2023_strict_rows_excluding_known_anomaly()
            else:
                bars, meta = fetch_strict_month(year, month)
            all_valid.extend(bars)
            provenance.append(meta)

    all_valid.sort(key=lambda x: x[0])
    # Source-derived exclusions fixed by preregistration.
    used = [
        b for b in all_valid
        if b[0] != INVALID_OPEN and b[0] not in ALIGNMENT_BUFFER
    ]
    segment_a = [b for b in used if A_START <= b[0] <= A_END]
    segment_b = [b for b in used if B_START <= b[0] <= B_END]

    assert len(segment_a) == 10_740 and len(segment_a) % 4 == 0
    assert len(segment_b) == 6_776 and len(segment_b) % 4 == 0
    assert segment_a[0][0] == A_START and segment_a[-1][0] == A_END
    assert segment_b[0][0] == B_START and segment_b[-1][0] == B_END
    assert A_START % 14_400 == 0 and B_START % 14_400 == 0
    assert continuous(segment_a) and continuous(segment_b)

    results = {
        "SEGMENT_A": run_segment(segment_a),
        "SEGMENT_B": run_segment(segment_b),
    }

    conditions = {}
    for key, data in results.items():
        conditions[key] = {
            "return_improvement": data["candidate_minus_owner_return_pct_points"] > 0,
            "drawdown_guardrail": (
                data["candidate_rsi45"]["max_drawdown_pct"]
                >= data["owner"]["max_drawdown_pct"] - 5.0
            ),
        }
    passed = all(
        c["return_improvement"] and c["drawdown_guardrail"]
        for c in conditions.values()
    )

    result = {
        "schema": "seven.heaven.strategy_lab.segmented_rsi45_holdout_2022_2023.v1",
        "status": (
            "PREREGISTERED_SEGMENTED_HYPOTHESIS_SUPPORTED"
            if passed else "PREREGISTERED_SEGMENTED_HYPOTHESIS_FAIL"
        ),
        "preregistration": {
            "path": "coordination/inter_ai_dialogues/agent_crypto/research/strategy_lab/SEVEN_HEAVEN_STRATEGY_LAB_2022_2023_SOURCE_GATE_AND_SEGMENTED_HOLDOUT_PREREG_2026_11_16.md",
            "final_alignment_commit_before_performance": "60221baaa825f4938fb693070c1de64394481c0e",
            "only_strategy_parameter_changed": "rsi_entry_max",
            "owner": 61,
            "candidate": 45,
        },
        "source": {
            "exchange": "Binance Spot", "pair": "BTC/USDT",
            "source_timeframe": "1h",
            "anomaly_policy": "NO_FILL_NO_INTERPOLATION_SPLIT_AND_RESET",
            "segment_a_rows_1h": len(segment_a),
            "segment_b_rows_1h": len(segment_b),
            "excluded_irregular_close": "2023-03-24T12:00:00+00:00",
            "missing_source_hour": "2023-03-24T13:00:00+00:00",
            "alignment_buffer_excluded": [
                "2023-03-24T14:00:00+00:00",
                "2023-03-24T15:00:00+00:00",
            ],
            "provenance": provenance,
        },
        "fixed_configuration": {"owner": OWNER, "candidate": CANDIDATE},
        "results": results,
        "decision_rule": {
            "segment_a": conditions["SEGMENT_A"],
            "segment_b": conditions["SEGMENT_B"],
            "all_four_conditions_required": True,
            "pass": passed,
        },
        "limitations": [
            "PAPER only with hypothetical next-candle-open fills",
            "Static 0.10% fee and 0.05% slippage per side",
            "Segments use fresh capital and are not compounded across the source gap",
            "No position or indicator state crosses the missing-data boundary",
            "No post-hoc filter or EMA selection allowed",
            "Support would apply only to this historical experiment, not future profitability",
        ],
        "safety": {
            "paper_only": True, "orders_real": 0, "credentials": 0,
            "workspace_reads": 0, "workspace_writes": 0,
        },
    }

    Path("segmented_2022_2023_rsi45_holdout.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False) + "\n",
        encoding="utf-8",
    )
    for key, data in results.items():
        print(
            key,
            "OWNER", data["owner"]["return_pct"],
            "RSI45", data["candidate_rsi45"]["return_pct"],
            "DELTA", data["candidate_minus_owner_return_pct_points"],
            "OWNER_DD", data["owner"]["max_drawdown_pct"],
            "RSI45_DD", data["candidate_rsi45"]["max_drawdown_pct"],
            "OWNER_FILLS", data["owner"]["hypothetical_fills"],
            "RSI45_FILLS", data["candidate_rsi45"]["hypothetical_fills"],
            "OWNER_FEES", data["owner"]["fees_paid_usdt"],
            "RSI45_FEES", data["candidate_rsi45"]["fees_paid_usdt"],
        )
    print("DECISION", json.dumps(result["decision_rule"], ensure_ascii=False))
    print("STATUS", result["status"])


if __name__ == "__main__":
    main()
