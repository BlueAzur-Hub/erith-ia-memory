"""Preregistered untouched 2022-2023 RSI45 holdout.

The preregistration was committed to main before this script was added:
SEVEN_HEAVEN_STRATEGY_LAB_2024_2025_RESULTS_AND_2022_2023_HOLDOUT_PREREG_2026_11_16.md

Only OWNER RSI<61 and CANDIDATE RSI<45 are evaluated. No alternative filter
may be selected after seeing this source.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import sys
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.binance_monthly_v46 import MAX_ZIP_BYTES, validate_month
from src.observatory import run_one, run_with_diagnostics

BASE_URL = "https://data.binance.vision/data/spot/monthly/klines/BTCUSDT/1h"
MAX_CHECKSUM_BYTES = 512
YEARS = (2022, 2023)

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


def download(url: str, limit: int) -> bytes:
    parsed = urllib.parse.urlsplit(url)
    if (parsed.scheme, parsed.hostname) != ("https", "data.binance.vision"):
        raise RuntimeError("Unexpected source host")
    req = urllib.request.Request(
        url, headers={"User-Agent": "Seven-Heaven-Strategy-Lab-Preregistered-Holdout/1.0"}
    )
    with urllib.request.urlopen(req, timeout=45) as response:
        final = urllib.parse.urlsplit(response.geturl())
        if (final.scheme, final.hostname) != ("https", "data.binance.vision"):
            raise RuntimeError("Unexpected redirect host")
        data = response.read(limit + 1)
    if not data or len(data) > limit:
        raise RuntimeError("Download size outside limit")
    return data


def fetch_year(year: int):
    bars = []
    months = []
    for month in range(1, 13):
        name = f"BTCUSDT-1h-{year}-{month:02d}.zip"
        url = f"{BASE_URL}/{name}"
        archive = download(url, MAX_ZIP_BYTES)
        checksum = download(url + ".CHECKSUM", MAX_CHECKSUM_BYTES).decode("utf-8")
        report = validate_month(archive, checksum, year=year, month=month)
        bars.extend(report["bars"])
        months.append({
            "year": year,
            "month": month,
            "rows": report["rows"],
            "archive_sha256": report["archive_sha256"],
            "normalized_csv_sha256": report["normalized_csv_sha256"],
        })
    return bars, months


def assert_continuity(bars):
    assert bars
    for prev, cur in zip(bars, bars[1:]):
        assert cur[0] == prev[0] + 3600


def corpus_sha(bars):
    h = hashlib.sha256()
    for t, o, hi, lo, c, v in bars:
        h.update(f"{t},{o:.12g},{hi:.12g},{lo:.12g},{c:.12g},{v:.12g}\n".encode())
    return h.hexdigest()


def metrics(run):
    r = run["results"]
    a = run["analytics"]
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


def case(bars):
    owner = run_one(bars, OWNER, source_timeframe="1h")
    candidate = run_one(bars, CANDIDATE, source_timeframe="1h")
    cash = run_one(bars, {**OWNER, "kind": "CASH"}, source_timeframe="1h")
    hold50 = run_one(bars, {**OWNER, "kind": "HOLD_50"}, source_timeframe="1h")
    return {
        "owner": metrics(owner),
        "candidate_rsi45": metrics(candidate),
        "cash": metrics(cash),
        "hold50": metrics(hold50),
        "candidate_minus_owner_return_pct_points": round(
            candidate["results"]["return_pct"] - owner["results"]["return_pct"], 5
        ),
        "candidate_minus_owner_drawdown_pct_points": round(
            candidate["results"]["max_drawdown_pct"] - owner["results"]["max_drawdown_pct"], 5
        ),
    }


def main():
    bars_2022, months_2022 = fetch_year(2022)
    bars_2023, months_2023 = fetch_year(2023)
    # Strict source gate: if any month was not a complete strict-valid source,
    # validate_month already raised and no performance result can be produced.
    assert len(bars_2022) == 8760
    assert len(bars_2023) == 8760
    assert_continuity(bars_2022)
    assert_continuity(bars_2023)
    bars = bars_2022 + bars_2023
    assert len(bars) == 17520
    assert_continuity(bars)

    cases = {
        "2022_RESET": case(bars_2022),
        "2023_RESET": case(bars_2023),
        "2022_2023_CONTINUOUS": case(bars),
    }

    owner_cont, owner_zero = run_with_diagnostics(
        bars, OWNER, source_timeframe="1h"
    )
    candidate_cont, candidate_zero = run_with_diagnostics(
        bars, CANDIDATE, source_timeframe="1h"
    )

    annual_replication = all(
        cases[key]["candidate_minus_owner_return_pct_points"] > 0
        for key in ("2022_RESET", "2023_RESET")
    )
    continuous_improvement = (
        cases["2022_2023_CONTINUOUS"]["candidate_minus_owner_return_pct_points"] > 0
    )
    owner_dd = cases["2022_2023_CONTINUOUS"]["owner"]["max_drawdown_pct"]
    candidate_dd = cases["2022_2023_CONTINUOUS"]["candidate_rsi45"]["max_drawdown_pct"]
    risk_guardrail = candidate_dd >= owner_dd - 5.0
    passed = continuous_improvement and annual_replication and risk_guardrail

    result = {
        "schema": "seven.heaven.strategy_lab.preregistered_rsi45_holdout_2022_2023.v1",
        "status": (
            "PREREGISTERED_HYPOTHESIS_PASS" if passed
            else "PREREGISTERED_HYPOTHESIS_FAIL"
        ),
        "preregistration": {
            "path": "coordination/inter_ai_dialogues/agent_crypto/research/strategy_lab/SEVEN_HEAVEN_STRATEGY_LAB_2024_2025_RESULTS_AND_2022_2023_HOLDOUT_PREREG_2026_11_16.md",
            "commit_before_source_inspection": "52ccecf4f755bf20fd40a09ffb18eb3ffe4dca00",
            "owner_rsi_threshold": 61,
            "candidate_rsi_threshold": 45,
            "only_parameter_changed": "rsi_entry_max",
        },
        "source": {
            "exchange": "Binance Spot",
            "pair": "BTC/USDT",
            "timeframe": "1h",
            "first_utc": "2022-01-01T00:00:00+00:00",
            "last_utc": "2023-12-31T23:00:00+00:00",
            "months_verified": 24,
            "rows_total": len(bars),
            "strict_continuity": True,
            "gap_filling": False,
            "combined_corpus_sha256": corpus_sha(bars),
            "months": months_2022 + months_2023,
        },
        "fixed_configuration": {
            "owner": OWNER,
            "candidate": CANDIDATE,
        },
        "cases": cases,
        "decision_rule": {
            "continuous_return_improvement": continuous_improvement,
            "annual_replication_both_years": annual_replication,
            "max_drawdown_not_more_than_5_points_worse": risk_guardrail,
            "all_required_for_pass": True,
            "pass": passed,
        },
        "continuous_zero_friction_counterfactual": {
            "owner": owner_zero,
            "candidate_rsi45": candidate_zero,
            "warning": "Counterfactual paths are non-additive and not realized execution.",
        },
        "continuous_full_results": {
            "owner": metrics(owner_cont),
            "candidate_rsi45": metrics(candidate_cont),
        },
        "limitations": [
            "PAPER only, hypothetical next-candle-open fills",
            "Static 0.10% fee and 0.05% slippage per side",
            "No historical order book or exchange-native stop execution",
            "No post-hoc tuning permitted on this holdout",
            "A pass would validate only this specific historical hypothesis, not future profitability",
        ],
        "safety": {
            "paper_only": True,
            "orders_real": 0,
            "credentials": 0,
            "workspace_reads": 0,
            "workspace_writes": 0,
        },
    }

    Path("preregistered_2022_2023_rsi45_holdout.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False) + "\n",
        encoding="utf-8",
    )

    print("SOURCE", json.dumps({
        "months_verified": result["source"]["months_verified"],
        "rows_total": result["source"]["rows_total"],
        "combined_corpus_sha256": result["source"]["combined_corpus_sha256"],
    }))
    for label, data in cases.items():
        print(
            label,
            "OWNER", data["owner"]["return_pct"],
            "RSI45", data["candidate_rsi45"]["return_pct"],
            "DELTA", data["candidate_minus_owner_return_pct_points"],
            "OWNER_DD", data["owner"]["max_drawdown_pct"],
            "RSI45_DD", data["candidate_rsi45"]["max_drawdown_pct"],
            "OWNER_FILLS", data["owner"]["hypothetical_fills"],
            "RSI45_FILLS", data["candidate_rsi45"]["hypothetical_fills"],
        )
    print("DECISION", json.dumps(result["decision_rule"]))
    print("STATUS", result["status"])


if __name__ == "__main__":
    main()
