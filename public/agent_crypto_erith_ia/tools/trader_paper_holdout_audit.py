#!/usr/bin/env python3
"""Reproduce a conservative four-market retrospective holdout audit.

No orders, balances, network, tuning on holdout or changes to monthly archives.
Archived "test" slices (last 10-11 days) are precomputed, independent
100-USDT hypothetical trades, NOT one 400-USDT portfolio.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "data" / "trader_flux"
PAIRS = ("ETHUSDT", "SOLUSDT", "XRPUSDT", "LTCUSDT")
MONTHS = ("04", "05", "06", "07", "08", "09")
MODELS = tuple(
    f"pressure_{pressure}_hold_{hours}h_cost_{cost}pct"
    for pressure in (50, 55, 60, 65)
    for hours in (12, 48)
    for cost in ("0.8", "1.2", "1.6")
)

def archive_path(pair: str, month: str) -> Path:
    collection = "radar20_retro_stress/sources" if int(month) <= 6 else "radar20"
    return ROOT / collection / pair / f"2026-{month}.json"

def read_archive(pair: str, month: str) -> dict:
    path = archive_path(pair, month)
    doc = json.loads(path.read_text(encoding="utf-8"))
    if (doc.get("pair") != pair or doc.get("venue") != "Binance Spot"
        or doc.get("quote") != "USDT"
        or doc.get("month") != f"2026-{month}"
        or len(doc.get("rows", [])) != doc.get("row_count")
        or doc.get("row_count", 0) < 650
        or not doc.get("source", {}).get("sha256")
        or doc.get("orders_enabled") is not False
        or doc.get("strategy_certified") is not False
        or any(k not in doc.get("experiments", {}) for k in MODELS)):
        raise ValueError(f"Unverified archived source: {path}")
    return doc

def evaluate(archives: dict, model: str, months: tuple[str, ...]) -> dict:
    trades = wins = 0
    total = 0.0
    for pair in PAIRS:
        for month in months:
            item = archives[(pair, month)]["experiments"][model]["test"]
            if (item.get("trades", -1) < 0 or item.get("wins", -1) < 0
                or item["wins"] > item["trades"]
                or item.get("end_hour", 0) <= item.get("start_hour", 0)):
                raise ValueError(f"Inconsistent evaluation: {pair}/{month}/{model}")
            trades += item["trades"]
            wins += item["wins"]
            total += item["total_profit_usdt"]
    return {"trades": trades, "wins": wins,
            "sum_independent_trials_usdt": round(total, 6),
            "mean_per_trial_usdt": round(total / trades, 6) if trades else None}

def audit() -> dict:
    data = {(pair, month): read_archive(pair, month)
            for pair in PAIRS for month in MONTHS}
    train_months = MONTHS[:3]
    holdout_months = MONTHS[3:]
    rules = []
    for pressure in (50, 55, 60, 65):
        for hours in (12, 48):
            model = f"pressure_{pressure}_hold_{hours}h_cost_0.8pct"
            rules.append({"model": model,
                          "selection": evaluate(data, model, train_months),
                          "holdout": evaluate(data, model, holdout_months)})
    # One rule selected ONLY from April-June; holdout outcomes cannot influence choice.
    best = max(rules, key=lambda row: (row["selection"]["sum_independent_trials_usdt"],
                                     row["model"]))
    sensitivity = {}
    for cost in ("0.8", "1.2", "1.6"):
        model = best["model"].replace("cost_0.8pct", f"cost_{cost}pct")
        sensitivity[cost] = {"selection": evaluate(data, model, train_months),
                             "holdout": evaluate(data, model, holdout_months)}
    return {"kind": "RETROSPECTIVE_DIAGNOSTIC_NOT_FORWARD_VALIDATION",
            "read_only": True, "orders_enabled": False,
            "markets": list(PAIRS), "source_files": len(data),
            "model_family": "threshold 50/55/60/65, hold 12/48 hours",
            "selection": "April-June 2026 trailing test slices of each month",
            "holdout": "July-September 2026 trailing test slices of each month",
            "ticket_usdt_per_independent_trial": 100,
            "selection_criterion": "highest summed independent PAPER profits at 0.8% fee",
            "best_by_selection": best,
            "fee_sensitivity_of_selected_rule": sensitivity,
            "all_rules": rules,
            "caveats": [
                "Archive is retrospectively assembled; months are not prospective validation",
                "Monthly experiments were predefined but the wider research already explored thresholds",
                "Only four markets chosen from available historical series",
                "Aggregates are NOT the P&L of a single 400-USDT constrained portfolio",
                "Source is Binance Spot USDT; cost, slippage and execution on OKX unverified",
                "A zero-trade baseline is 0 nominal USDT and not risk-matched",
                "Observed holdout successes for unselected rules must not be promoted",
            ]}

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()
    result = audit()
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(f"Archived sources checked: {result['source_files']}; orders: disabled")
        for row in result["all_rules"]:
            a, b = row["selection"], row["holdout"]
            print(f"{row['model']}: April-June {a['sum_independent_trials_usdt']:+.3f} "
                  f"({a['trades']} trades); July-Sept "
                  f"{b['sum_independent_trials_usdt']:+.3f} ({b['trades']} trades)")
        choice = result["best_by_selection"]
        print("PRESELECTED by April-June only:", choice["model"])
        print("VERDICT: diagnostic only; no strategy certified or real orders.")

if __name__ == "__main__":
    main()
