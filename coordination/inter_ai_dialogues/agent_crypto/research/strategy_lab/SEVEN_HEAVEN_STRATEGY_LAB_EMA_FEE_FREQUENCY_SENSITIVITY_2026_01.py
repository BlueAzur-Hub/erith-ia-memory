#!/usr/bin/env python3
"""Predeclared fee / slippage / candle-interval stress test (no optimization).

Uses only the audited Binance BTCUSDT January 2026 archive from ERITH.IA.
Every configuration runs in the same original long-only PAPER engine. No
Freqtrade or Hummingbot calculation is represented by this script.

The combinations are chosen BEFORE examining any resulting performance. Do not
rank them as optimized choices; this is within-sample diagnostic research.
"""
from __future__ import annotations
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
from src.engine import load_bars, simulate

EXPECTED_CSV = "38a2e6ce6e76ccfeca2e421679ee39ef4467f0426cf0064610b25100307f54c4"
PERIODS = (1, 5, 15, 60, 240)
FRICTIONS = (
    ("OBSERVED_OKX_TAKER_PLUS_ASSUMED_SLIP", 0.001, 0.0005),
    ("TAKER_FEE_ONLY_NO_SLIP", 0.001, 0.0),
    ("SLIPPAGE_ONLY_NO_FEE", 0.0, 0.0005),
    ("IDEAL_ZERO_COST_BENCHMARK", 0.0, 0.0),
)


def compress_bars(data, size: int):
    if size not in PERIODS or len(data) % size:
        raise ValueError("Non-whole exact candle aggregation")
    grouped = []
    for i in range(0, len(data), size):
        group = data[i:i + size]
        assert all(group[n][0] == group[0][0] + n * 60 for n in range(size))
        grouped.append((group[0][0], group[0][1],
                        max(r[2] for r in group), min(r[3] for r in group),
                        group[-1][4], sum(r[5] for r in group)))
    assert grouped[0][0] == data[0][0]
    return grouped


def run(dataset: Path) -> dict:
    if hashlib.sha256(dataset.read_bytes()).hexdigest() != EXPECTED_CSV:
        raise ValueError("Frozen source SHA256 does not match our audited artifact")
    data = load_bars(dataset)
    assert len(data) == 44640
    outcomes = []
    for minutes in PERIODS:
        bars = compress_bars(data, minutes)
        for label, fee, slippage in FRICTIONS:
            result = simulate(bars, {
                "kind": "EMA_CROSS", "capital": 1000,
                "fee": fee, "slippage": slippage,
                "ema_fast": 10, "ema_slow": 30,
            })
            result_data = result["results"]
            if not (result["safety"]["paper_only"] and result["safety"]["orders_real"] == 0):
                raise AssertionError("Unexpected non-PAPER simulation")
            if result_data["cash_final"] < 0 or result_data["base_inventory_btc"] < 0:
                raise AssertionError("Negative inventory or cash")
            if abs(result_data["equity_final"] - (result_data["cash_final"] + result_data["inventory_marked_usdt"])) > 0.00001:
                raise AssertionError("Accounting invariant failed")
            outcomes.append({
                "timeframe": f"{minutes}m" if minutes < 60 else f"{minutes//60}h",
                "minutes_per_bar": minutes,
                "rows": len(bars),
                "fee_fraction_per_side": fee,
                "slippage_fraction_per_side": slippage,
                "assumption": label,
                **result_data,
            })
    baseline = {
        kind: simulate(data, {"kind": kind, "capital": 1000,
                               "fee": 0.001, "slippage": 0.0005})["results"]
        for kind in ("HOLD_50", "HOLD_100", "CASH")
    }
    return {
        "schema": "seven.heaven.strategy_lab.ema_cost_timeframe_sensitivity.v1",
        "status": "EXECUTED_INTERNAL_PAPER_COST_STRESS_ONLY",
        "dataset": {
            "source": "Binance Spot BTC/USDT January 2026, 44640 original 1m OHLCV bars",
            "sha256": EXPECTED_CSV,
            "first_utc": datetime.fromtimestamp(data[0][0], timezone.utc).isoformat(),
            "last_utc": datetime.fromtimestamp(data[-1][0], timezone.utc).isoformat(),
        },
        "model": "ERITH original Python long-only next-candle-open PAPER engine",
        "predeclared_ema_lengths": {"fast_bars": 10, "slow_bars": 30},
        "predeclared_timeframes": [1, 5, 15, 60, 240],
        "fee_model": "0.001 fraction = 0.10% per side; 0.0005 slippage fraction = 0.05% per side",
        "case_count": len(outcomes),
        "cases": outcomes,
        "baselines_on_1m": baseline,
        "limitations": [
            "This is an in-sample January 2026 diagnostic, not optimization or future expectancy",
            "EMA bar lengths are identical but clock-time sensitivity changes with timeframe",
            "Zero-cost runs are counterfactual and NOT available real execution",
            "Comparing cost scenarios is nonlinear: transaction counts and cash size can change",
            "Full fills at next candle open assume liquidity; no orderbook depth or queue",
            "Binance past prices and current observed OKX fees are different-source assumptions",
            "No independently executed Freqtrade/Hummingbot engine in this report",
        ],
        "safety": {"paper_only": True, "trading_keys": False, "live_orders": 0},
    }


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--csv", type=Path, required=True)
    p.add_argument("--output", type=Path, required=True)
    args = p.parse_args()
    result = run(args.csv)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False)+"\n", encoding="utf-8")
    print(json.dumps({
        "status": result["status"], "cases": result["case_count"],
        "baseline": result["baselines_on_1m"]["HOLD_50"]["return_pct"],
        "by_timeframe": [{"timeframe": x["timeframe"],
                          "scenario": x["assumption"],
                          "return_pct": x["return_pct"],
                          "fees_usdt": x["fees_paid_usdt"],
                          "fills": x["hypothetical_fills"],
                          "equity_final": x["equity_final"]}
                         for x in result["cases"]]}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
