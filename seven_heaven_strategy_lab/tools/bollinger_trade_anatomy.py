"""Trade-level anatomy for fixed Bollinger PAPER research.

No network, no workspace writes, no tuning. Closed round-trips only.
"""
from __future__ import annotations

from datetime import datetime, timezone
import math
from statistics import mean, median

from src.engine import options, simulate
from tools.monthly_regime_map import RegimeMapError, _pearson, _validate_continuity


def _month_label(ts: int) -> str:
    return datetime.fromtimestamp(ts, timezone.utc).strftime("%Y-%m")


def _band_metrics(ctx: dict, *, side: str) -> tuple[float | None, float | None]:
    middle = ctx.get("bb_middle")
    lower = ctx.get("bb_lower")
    upper = ctx.get("bb_upper")
    price = ctx.get("last_closed_price")
    vals = (middle, lower, upper, price)
    if not all(isinstance(v, (int, float)) and math.isfinite(v) for v in vals):
        return None, None
    if middle <= 0:
        return None, None
    width = (upper - lower) / middle * 100
    if side == "BUY":
        depth = (lower - price) / middle * 100
    else:
        depth = (price - upper) / middle * 100
    return round(width, 6), round(depth, 6)


def _pair_closed_trades(trades: list[dict], bars: list[tuple]) -> list[dict]:
    by_ts = {int(b[0]): i for i, b in enumerate(bars)}
    opened = None
    out = []
    for fill in trades:
        side = fill.get("side")
        if side == "BUY":
            if opened is not None:
                raise RegimeMapError("Bollinger : achat imbriqué inattendu")
            opened = fill
            continue
        if side != "SELL":
            continue
        if opened is None:
            raise RegimeMapError("Bollinger : vente sans achat")
        buy = opened
        opened = None
        qty = float(fill["qty"])
        if abs(qty - float(buy["qty"])) > 1e-7:
            raise RegimeMapError("Bollinger : quantité de round-trip incohérente")
        entry_price = float(buy["price"])
        exit_price = float(fill["price"])
        entry_fee = float(buy["fee"])
        exit_fee = float(fill["fee"])
        cost = qty * entry_price + entry_fee
        proceeds = qty * exit_price - exit_fee
        pnl = proceeds - cost
        ret = 100 * pnl / cost if cost else 0.0
        entry_ts = int(buy["timestamp"])
        exit_ts = int(fill["timestamp"])
        if entry_ts not in by_ts or exit_ts not in by_ts:
            raise RegimeMapError("Bollinger : fill hors série active")
        i0, i1 = by_ts[entry_ts], by_ts[exit_ts]
        if i1 <= i0:
            raise RegimeMapError("Bollinger : durée de trade invalide")
        # Exit occurs at the exit candle OPEN, so do not use that candle's later high/low.
        held = bars[i0:i1]
        highs = [float(b[2]) for b in held]
        lows = [float(b[3]) for b in held]
        mfe = (max(highs) / entry_price - 1) * 100 if highs else 0.0
        mae = (min(lows) / entry_price - 1) * 100 if lows else 0.0
        entry_width, entry_depth = _band_metrics(buy.get("signal_context") or {}, side="BUY")
        exit_width, exit_depth = _band_metrics(fill.get("signal_context") or {}, side="SELL")
        out.append({
            "entry_utc": entry_ts,
            "exit_utc": exit_ts,
            "duration_hours": round((exit_ts - entry_ts) / 3600, 3),
            "entry_price": round(entry_price, 8),
            "exit_price": round(exit_price, 8),
            "qty": round(qty, 8),
            "pnl_net_usdt": round(pnl, 6),
            "return_on_cost_pct": round(ret, 6),
            "winner": pnl > 1e-7,
            "entry_band_width_pct": entry_width,
            "entry_signal_depth_pct": entry_depth,
            "exit_band_width_pct": exit_width,
            "exit_signal_depth_pct": exit_depth,
            "mfe_pct": round(mfe, 6),
            "mae_pct": round(mae, 6),
        })
    return out


def _group_summary(rows: list[dict]) -> dict:
    if not rows:
        return {
            "trades": 0,
            "wins": 0,
            "losses": 0,
            "median_return_pct": None,
            "mean_duration_hours": None,
            "mean_entry_band_width_pct": None,
            "mean_entry_signal_depth_pct": None,
            "mean_mfe_pct": None,
            "mean_mae_pct": None,
        }
    def avg(key):
        vals = [float(r[key]) for r in rows if r.get(key) is not None]
        return round(mean(vals), 6) if vals else None
    return {
        "trades": len(rows),
        "wins": sum(bool(r["winner"]) for r in rows),
        "losses": sum(not bool(r["winner"]) for r in rows),
        "median_return_pct": round(float(median(r["return_on_cost_pct"] for r in rows)), 6),
        "mean_return_pct": round(mean(float(r["return_on_cost_pct"]) for r in rows), 6),
        "mean_duration_hours": avg("duration_hours"),
        "mean_entry_band_width_pct": avg("entry_band_width_pct"),
        "mean_entry_signal_depth_pct": avg("entry_signal_depth_pct"),
        "mean_exit_band_width_pct": avg("exit_band_width_pct"),
        "mean_exit_signal_depth_pct": avg("exit_signal_depth_pct"),
        "mean_mfe_pct": avg("mfe_pct"),
        "mean_mae_pct": avg("mae_pct"),
    }


def run_bollinger_trade_anatomy(
    bars: list[tuple],
    raw_params: dict,
    *,
    warmup_hours: int = 720,
) -> dict:
    _validate_continuity(bars)
    if type(warmup_hours) is not int or warmup_hours < 60 or warmup_hours > 2160:
        raise RegimeMapError("Préchauffage trade anatomy invalide")
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

    all_rows = []
    month_counts = {}
    for label, active_start, active_end in bounds:
        if active_start < warmup_hours:
            continue
        active = bars[active_start:active_end]
        if len(active) < 60:
            continue
        sample = bars[active_start - warmup_hours:active_end]
        result = simulate(sample, base, trade_start_index=warmup_hours)
        rows = _pair_closed_trades(result["trades"], sample)
        for row in rows:
            row["month"] = label
            row["year"] = int(label[:4])
        all_rows.extend(rows)
        month_counts[label] = len(rows)

    if not all_rows:
        raise RegimeMapError("Aucun round-trip Bollinger clôturé")

    wins = [r for r in all_rows if r["winner"]]
    losses = [r for r in all_rows if not r["winner"]]
    y2024 = [r for r in all_rows if r["year"] == 2024]
    y2025 = [r for r in all_rows if r["year"] == 2025]

    returns = [float(r["return_on_cost_pct"]) for r in all_rows]
    durations = [float(r["duration_hours"]) for r in all_rows]
    entry_widths = [float(r["entry_band_width_pct"]) for r in all_rows]
    entry_depths = [float(r["entry_signal_depth_pct"]) for r in all_rows]
    mfes = [float(r["mfe_pct"]) for r in all_rows]
    maes = [float(r["mae_pct"]) for r in all_rows]

    return {
        "schema": "seven.heaven.strategy_lab.bollinger_trade_anatomy.v1",
        "status": "FIXED_PARAMETER_CLOSED_ROUND_TRIP_DIAGNOSTIC",
        "params": {
            "bb_period": base["bb_period"],
            "bb_sigma": base["bb_sigma"],
            "capital": base["capital"],
            "fee": base["fee"],
            "slippage": base["slippage"],
            "warmup_hours": warmup_hours,
        },
        "closed_round_trips": len(all_rows),
        "month_trade_counts": month_counts,
        "groups": {
            "all": _group_summary(all_rows),
            "winners": _group_summary(wins),
            "losers": _group_summary(losses),
            "year_2024": _group_summary(y2024),
            "year_2025": _group_summary(y2025),
        },
        "correlations": {
            "duration_vs_return": _pearson(durations, returns),
            "entry_band_width_vs_return": _pearson(entry_widths, returns),
            "entry_signal_depth_vs_return": _pearson(entry_depths, returns),
            "mfe_vs_return": _pearson(mfes, returns),
            "mae_vs_return": _pearson(maes, returns),
        },
        "trades": all_rows,
        "methodology": {
            "closed_round_trips_only": True,
            "exit_candle_post_open_range_excluded_from_mfe_mae": True,
            "parameters_optimized": False,
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
