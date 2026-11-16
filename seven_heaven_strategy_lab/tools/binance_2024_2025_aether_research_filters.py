"""Aether Research controlled-filter study on strict-clean Binance 2024-2025."""
from __future__ import annotations

import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from tools.binance_2024_2025_replay import (
    CURRENT_CUSTOM, fetch_year, continuity, corpus_sha,
)
from src.filter_research import study


def main():
    bars_2024, _ = fetch_year(2024)
    bars_2025, _ = fetch_year(2025)
    bars = bars_2024 + bars_2025
    assert len(bars) == 17544
    continuity(bars)
    source = {
        "id": "BINANCE_BTCUSDT_2024_2025_STRICT_CLEAN_RESEARCH",
        "sha256": corpus_sha(bars),
        "exchange": "Binance Spot",
        "pair": "BTC/USDT",
        "base": "BTC",
        "quote": "USDT",
        "source_timeframe": "1h",
        "available_timeframes": ["1h", "4h"],
    }
    result = study(bars, CURRENT_CUSTOM, source)
    assert result["safety"]["orders_real"] == 0
    assert result["timeframe"] == "4h"
    assert result["total_bars"] == 4386
    assert result["summary"]["verification_windows"] == 2
    Path("binance_2024_2025_aether_research_filters.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False) + "\n",
        encoding="utf-8",
    )
    print("AETHER RESEARCH SUMMARY", json.dumps(result["summary"], ensure_ascii=False))
    for fold in result["folds"]:
        print(
            "FOLD",
            fold["fold"],
            "selected",
            fold["selection"]["key"],
            "selected_holdout",
            fold["selected_verification"]["return_pct"],
            "owner_holdout",
            fold["benchmarks"]["owner_original"]["return_pct"],
            "delta_pt",
            fold["selected_minus_owner_return_pct_points"],
            "double_cost",
            fold["selected_double_cost_verification"]["return_pct"],
        )
        for row in fold["candidates"]:
            print(
                "  CANDIDATE",
                row["key"],
                "selected_train", row["selected_on_training"],
                "train", row["training"]["return_pct"],
                "verify", row["verification"]["return_pct"],
                "fills", row["verification"]["hypothetical_fills"],
                "fees", row["verification"]["fees_paid_quote"],
            )
    print("PASS: Aether Research controlled filters completed on strict-clean 2024-2025")


if __name__ == "__main__":
    main()
