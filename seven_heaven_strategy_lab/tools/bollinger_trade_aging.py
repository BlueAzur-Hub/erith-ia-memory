"""Causal aging diagnostics for fixed Bollinger PAPER round-trips.

No time-stop is applied. The study observes positions that are still open at
pre-registered ages and labels them later with their eventual closed outcome.
"""
from __future__ import annotations

from datetime import datetime, timezone
from statistics import mean, median

from src.engine import options, simulate
from tools.bollinger_trade_anatomy import _pair_closed_trades
from tools.monthly_regime_map import RegimeMapError, _validate_continuity

HORIZONS = (12, 24, 36, 48, 72)


def _month_label(ts: int) -> str:
    return datetime.fromtimestamp(ts, timezone.utc).strftime("%Y-%m")


def _avg(rows: list[dict], key: str):
    if not rows:
        return None
    return round(mean(float(r[key]) for r in rows), 6)


def _med(rows: list[dict], key: str):
    if not rows:
        return None
    return round(float(median(float(r[key]) for r in rows)), 6)


def _summary(rows: list[dict]) -> dict:
    if not rows:
        return {
            "positions": 0,
            "eventual_wins": 0,
            "eventual_win_rate_pct": None,
            "mean_eventual_return_pct": None,
            "median_eventual_return_pct": None,
            "mean_mark_return_pct": None,
            "mean_mae_so_far_pct": None,
        }
    wins = sum(bool(r["eventual_winner"]) for r in rows)
    return {
        "positions": len(rows),
        "eventual_wins": wins,
        "eventual_win_rate_pct": round(100 * wins / len(rows), 3),
        "mean_eventual_return_pct": _avg(rows, "eventual_return_pct"),
        "median_eventual_return_pct": _med(rows, "eventual_return_pct"),
        "mean_mark_return_pct": _avg(rows, "mark_return_pct"),
        "mean_mae_so_far_pct": _avg(rows, "mae_so_far_pct"),
    }


def run_bollinger_trade_aging(
    bars: list[tuple],
    raw_params: dict,
    *,
    warmup_hours: int = 720,
    horizons: tuple[int, ...] = HORIZONS,
) -> dict:
    _validate_continuity(bars)
    if tuple(horizons) != HORIZONS:
        raise RegimeMapError("Horizons Bollinger non pré-enregistrés")
    base = options(raw_params)
    base["kind"] = "BOLLINGER"

    bounds = []
    start = 0
    current = _month_label(int(bars[0][0]))
    for i in range(1, len(bars)):
        label = _month_label(int(bars[i][0]))
        if label != current:
            bounds.append((current, start, i))
            current = label
            start = i
    bounds.append((current, start, len(bars)))

    observations = {h: [] for h in horizons}
    for label, active_start, active_end in bounds:
        if active_start < warmup_hours:
            continue
        active = bars[active_start:active_end]
        if len(active) < 60:
            continue
        sample = bars[active_start - warmup_hours:active_end]
        result = simulate(sample, base, trade_start_index=warmup_hours)
        trades = _pair_closed_trades(result["trades"], sample)
        by_ts = {int(b[0]): i for i, b in enumerate(sample)}
        for trade in trades:
            entry_ts = int(trade["entry_utc"])
            exit_ts = int(trade["exit_utc"])
            i0 = by_ts[entry_ts]
            duration = (exit_ts - entry_ts) / 3600
            for h in horizons:
                if duration < h:
                    continue
                # At age h, the candle opening exactly at h is not yet closed.
                completed = sample[i0:i0 + h]
                if len(completed) != h:
                    raise RegimeMapError("Fenêtre d'âge incomplète")
                mark_close = float(completed[-1][4])
                lows = [float(b[3]) for b in completed]
                entry_price = float(trade["entry_price"])
                mark_ret = (mark_close / entry_price - 1) * 100
                mae_so_far = (min(lows) / entry_price - 1) * 100
                observations[h].append({
                    "month": label,
                    "year": int(label[:4]),
                    "age_hours": h,
                    "mark_return_pct": round(mark_ret, 6),
                    "mae_so_far_pct": round(mae_so_far, 6),
                    "currently_positive": mark_ret >= 0,
                    "eventual_winner": bool(trade["winner"]),
                    "eventual_return_pct": float(trade["return_on_cost_pct"]),
                })

    horizon_reports = {}
    for h in horizons:
        rows = observations[h]
        if not rows:
            raise RegimeMapError(f"Aucune position observable à {h} h")
        horizon_reports[str(h)] = {
            "all": _summary(rows),
            "currently_positive": _summary([r for r in rows if r["currently_positive"]]),
            "currently_negative": _summary([r for r in rows if not r["currently_positive"]]),
            "year_2024": _summary([r for r in rows if r["year"] == 2024]),
            "year_2025": _summary([r for r in rows if r["year"] == 2025]),
        }

    return {
        "schema": "seven.heaven.strategy_lab.bollinger_trade_aging.v1",
        "status": "CAUSAL_OBSERVATION_ONLY_NO_TIME_STOP",
        "params": {
            "bb_period": base["bb_period"],
            "bb_sigma": base["bb_sigma"],
            "capital": base["capital"],
            "fee": base["fee"],
            "slippage": base["slippage"],
            "warmup_hours": warmup_hours,
            "horizons_hours": list(horizons),
        },
        "horizons": horizon_reports,
        "methodology": {
            "time_stop_applied": False,
            "post_horizon_data_used_for_current_state": False,
            "eventual_outcome_used_only_as_label": True,
            "monthly_capital_reset": True,
            "warmup_fills_allowed": False,
        },
        "safety": {
            "paper_only": True,
            "orders_real": 0,
            "network_calls": 0,
            "workspace_writes": 0,
        },
    }
