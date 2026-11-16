"""Aether Scientific replay on the strict-clean Binance 2024-2025 corpus."""
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
from src.robustness import study


def main():
    bars_2024, _ = fetch_year(2024)
    bars_2025, _ = fetch_year(2025)
    bars = bars_2024 + bars_2025
    assert len(bars) == 17544
    continuity(bars)
    sha = corpus_sha(bars)
    source = {
        "id": "BINANCE_BTCUSDT_2024_2025_STRICT_CLEAN_RESEARCH",
        "sha256": sha,
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
    assert result["summary"]["holdout_windows"] == 2
    Path("binance_2024_2025_aether_scientific.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False) + "\n",
        encoding="utf-8",
    )
    print("AETHER SCIENTIFIC SUMMARY", json.dumps(result["summary"], ensure_ascii=False))
    for fold in result["folds"]:
        print(
            "FOLD",
            fold["fold"],
            "selected",
            f"{fold['selection']['ema_fast']}/{fold['selection']['ema_slow']}",
            "training",
            fold["training"]["metrics"]["return_pct"],
            "holdout",
            fold["holdout"]["metrics"]["return_pct"],
            "holdout_dd",
            fold["holdout"]["metrics"]["max_drawdown_pct"],
            "fills",
            fold["holdout"]["metrics"]["hypothetical_fills"],
            "hold50",
            fold["holdout"]["benchmark_hold_50"]["return_pct"],
            "cash",
            fold["holdout"]["benchmark_cash"]["return_pct"],
            "both_x2",
            fold["holdout"]["both_x2"]["return_pct"],
        )
    print("PASS: Aether Scientific completed on strict-clean 2024-2025 corpus")


if __name__ == "__main__":
    main()
