"""Research replay on the strict-clean Binance BTCUSDT 1h corpus for 2024-2025.

Uses the accepted V4.6.2 engine through observatory.compare/run_with_diagnostics.
No runtime integration, no workspace access, no credentials, no real orders.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from tools.binance_long_history_scan import download, BASE_URL, MAX_CHECKSUM_BYTES
from src.binance_monthly_v46 import MAX_ZIP_BYTES, validate_month
from src.observatory import compare, run_with_diagnostics

YEARS = (2024, 2025)
CAPITAL = 10_000
FEE = 0.001
SLIPPAGE = 0.0005

# Exact current profile visible in the owner screenshot supplied on 2026-11-16.
CURRENT_CUSTOM = {
    "kind": "CUSTOM_RULES",
    "timeframe": "4h",
    "capital": CAPITAL,
    "fee": FEE,
    "slippage": SLIPPAGE,
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


def fetch_year(year: int):
    bars = []
    months = []
    for month in range(1, 13):
        name = f"BTCUSDT-1h-{year}-{month:02d}.zip"
        url = f"{BASE_URL}/{name}"
        archive = download(url, MAX_ZIP_BYTES)
        checksum = download(url + ".CHECKSUM", MAX_CHECKSUM_BYTES).decode("utf-8")
        report = validate_month(archive, checksum, year=year, month=month)
        months.append({
            "year": year,
            "month": month,
            "rows": report["rows"],
            "archive_sha256": report["archive_sha256"],
            "normalized_csv_sha256": report["normalized_csv_sha256"],
            "timestamp_input_unit": report["timestamp_input_unit"],
        })
        bars.extend(report["bars"])
    return bars, months


def continuity(bars):
    assert bars
    for prev, cur in zip(bars, bars[1:]):
        assert cur[0] == prev[0] + 3600, (
            f"Non-continuous corpus: {prev[0]} -> {cur[0]}"
        )


def corpus_sha(bars):
    h = hashlib.sha256()
    for t, o, hi, lo, c, v in bars:
        h.update(f"{t},{o:.12g},{hi:.12g},{lo:.12g},{c:.12g},{v:.12g}\n".encode())
    return h.hexdigest()


def compact_comparison(result):
    return {
        "timeframe": result["timeframe"],
        "source_timeframe": result["source_timeframe"],
        "aggregated_candles": result["aggregated_candles"],
        "params": result["params"],
        "rows": result["rows"],
        "safety": result["safety"],
        "warnings": result["warnings"],
    }


def main():
    bars_2024, months_2024 = fetch_year(2024)
    bars_2025, months_2025 = fetch_year(2025)
    assert len(bars_2024) == 8784  # leap year
    assert len(bars_2025) == 8760
    continuity(bars_2024)
    continuity(bars_2025)
    all_bars = bars_2024 + bars_2025
    continuity(all_bars)
    assert len(all_bars) == 17544

    cases = {}
    for label, bars in (
        ("2024_RESET", bars_2024),
        ("2025_RESET", bars_2025),
        ("2024_2025_CONTINUOUS", all_bars),
    ):
        comparison = compare(
            bars,
            CURRENT_CUSTOM,
            source_timeframe="1h",
            source_label=f"Binance Spot BTC/USDT · {label}",
        )
        assert comparison["safety"]["orders_real"] == 0
        assert len(comparison["rows"]) == 7
        cases[label] = compact_comparison(comparison)

    custom_run, friction = run_with_diagnostics(
        all_bars, CURRENT_CUSTOM, source_timeframe="1h"
    )
    assert custom_run["safety"]["orders_real"] == 0
    result = {
        "schema": "seven.heaven.strategy_lab.binance_2024_2025_replay.v1",
        "status": "PASS_STRICT_CLEAN_CORPUS_INTERNAL_PAPER_REPLAY",
        "source": {
            "exchange": "Binance Spot",
            "pair": "BTC/USDT",
            "source_timeframe": "1h",
            "first_utc": "2024-01-01T00:00:00+00:00",
            "last_utc": "2025-12-31T23:00:00+00:00",
            "rows_2024": len(bars_2024),
            "rows_2025": len(bars_2025),
            "rows_total": len(all_bars),
            "combined_corpus_sha256": corpus_sha(all_bars),
            "months": months_2024 + months_2025,
            "strict_continuity": True,
            "gap_filling": False,
        },
        "research_configuration": {
            "profile_origin": "OWNER_SCREENSHOT_2026_11_16",
            "capital_usdt": CAPITAL,
            "fee_per_side": FEE,
            "slippage_per_side": SLIPPAGE,
            "custom_profile": CURRENT_CUSTOM,
            "annual_cases_reset_capital": True,
            "continuous_case_carries_portfolio_through_2024_2025": True,
        },
        "comparisons": cases,
        "continuous_custom_strategy": {
            "results": custom_run["results"],
            "analytics": custom_run["analytics"],
            "friction_counterfactual": friction,
        },
        "limitations": [
            "PAPER only; next-candle-open hypothetical fills",
            "Static 0.10% fee and 0.05% slippage per side are modelling assumptions",
            "No historical order book, queue priority or exchange-native stops",
            "Annual reset cases are independent experiments and must not be compounded",
            "The current profile was already visible/tuned on other data; this is not a blind strategy-discovery result",
            "No claim of future profitability",
        ],
        "safety": {
            "paper_only": True,
            "orders_real": 0,
            "credentials": 0,
            "workspace_reads": 0,
            "workspace_writes": 0,
        },
    }
    Path("binance_2024_2025_replay_evidence.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False) + "\n",
        encoding="utf-8",
    )
    for label, case in cases.items():
        print("\n", label)
        for row in case["rows"]:
            print(
                f"{row['kind']:12s} return={row['return_pct']:8.3f}% "
                f"dd={row['max_drawdown_pct']:8.3f}% fees={row['fees_paid_usdt']:10.2f} "
                f"fills={row['hypothetical_fills']:4d}"
            )
    print("\nCUSTOM continuous friction:", json.dumps(friction, ensure_ascii=False))
    print("PASS: 2024-2025 strict-clean continuous replay completed")


if __name__ == "__main__":
    main()
