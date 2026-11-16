"""Bollinger mechanism diagnostics for certified monthly PAPER research.

Research-only. No network, no workspace writes, no parameter optimization.
"""
from __future__ import annotations

from datetime import datetime, timezone
import math
from statistics import mean

from src.engine import options, simulate
from tools.monthly_regime_map import RegimeMapError, _market_metrics, _pearson, _validate_continuity


def _month_label(ts: int) -> str:
    return datetime.fromtimestamp(ts, timezone.utc).strftime("%Y-%m")


def _signal_band_metrics(trades: list[dict]) -> dict:
    buy_widths, sell_widths, buy_depths, sell_depths = [], [], [], []
    for trade in trades:
        ctx = trade.get("signal_context") or {}
        middle = ctx.get("bb_middle")
        lower = ctx.get("bb_lower")
        upper = ctx.get("bb_upper")
        price = ctx.get("last_closed_price")
        if not all(isinstance(v, (int, float)) and math.isfinite(v) for v in (middle, lower, upper, price)):
            continue
        if middle <= 0:
            continue
        width = (upper - lower) / middle * 100
        if trade.get("side") == "BUY":
            buy_widths.append(width)
            buy_depths.append((lower - price) / middle * 100)
        elif trade.get("side") == "SELL":
            sell_widths.append(width)
            sell_depths.append((price - upper) / middle * 100)
    return {
        "mean_buy_band_width_pct": round(mean(buy_widths), 6) if buy_widths else None,
        "mean_sell_band_width_pct": round(mean(sell_widths), 6) if sell_widths else None,
        "mean_buy_signal_depth_pct": round(mean(buy_depths), 6) if buy_depths else None,
        "mean_sell_signal_depth_pct": round(mean(sell_depths), 6) if sell_depths else None,
        "buy_signal_count_with_band_context": len(buy_widths),
        "sell_signal_count_with_band_context": len(sell_widths),
    }


def _classification(net: float, zero: float) -> str:
    if zero > 0 and net < 0:
        return "FRICTION_FLIP"
    if zero <= 0 and net <= 0:
        return "SIGNAL_NEGATIVE_EVEN_WITHOUT_FRICTION"
    if zero > 0 and net >= 0:
        return "SURVIVES_FRICTION"
    return "MIXED_OR_EDGE_CASE"


def run_bollinger_mechanism_study(
    bars: list[tuple],
    raw_params: dict,
    *,
    warmup_hours: int = 720,
) -> dict:
    _validate_continuity(bars)
    if type(warmup_hours) is not int or warmup_hours < 60 or warmup_hours > 2160:
        raise RegimeMapError("Préchauffage Bollinger invalide")

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

    months = []
    for label, active_start, active_end in bounds:
        if active_start < warmup_hours:
            continue
        active = bars[active_start:active_end]
        if len(active) < 60:
            continue
        sample = bars[active_start - warmup_hours:active_end]

        net = simulate(sample, base, trade_start_index=warmup_hours)
        zero_params = dict(base)
        zero_params["fee"] = 0.0
        zero_params["slippage"] = 0.0
        zero = simulate(sample, zero_params, trade_start_index=warmup_hours)

        nr = net["results"]
        zr = zero["results"]
        analytics = net["analytics"]
        bands = _signal_band_metrics(net["trades"])
        market = _market_metrics(active)
        net_return = float(nr["return_pct"])
        zero_return = float(zr["return_pct"])

        months.append({
            "month": label,
            "classification": _classification(net_return, zero_return),
            "market": market,
            "bollinger": {
                "net_return_pct": net_return,
                "zero_friction_return_pct": zero_return,
                "friction_drag_pct": round(zero_return - net_return, 5),
                "fees_paid_usdt": nr["fees_paid_usdt"],
                "fills": nr["hypothetical_fills"],
                "closed_positions": analytics["closed_positions"],
                "mean_closed_position_hours": analytics["mean_closed_position_hours"],
                "time_in_position_pct": analytics["time_in_position_pct"],
                **bands,
            },
        })

    if len(months) < 2:
        raise RegimeMapError("Pas assez de mois pour l'étude Bollinger")

    fills = [float(m["bollinger"]["fills"]) for m in months]
    fees = [float(m["bollinger"]["fees_paid_usdt"]) for m in months]
    drags = [float(m["bollinger"]["friction_drag_pct"]) for m in months]
    vols = [float(m["market"]["realized_vol_annualized_pct"]) for m in months]
    nets = [float(m["bollinger"]["net_return_pct"]) for m in months]
    widths = [
        float(m["bollinger"]["mean_buy_band_width_pct"])
        if m["bollinger"]["mean_buy_band_width_pct"] is not None else 0.0
        for m in months
    ]

    flips = [m["month"] for m in months if m["classification"] == "FRICTION_FLIP"]
    signal_negative = [
        m["month"] for m in months
        if m["classification"] == "SIGNAL_NEGATIVE_EVEN_WITHOUT_FRICTION"
    ]
    survivors = [m["month"] for m in months if m["classification"] == "SURVIVES_FRICTION"]

    return {
        "schema": "seven.heaven.strategy_lab.bollinger_mechanism.v1",
        "status": "DESCRIPTIVE_FIXED_PARAMETER_PAPER_DIAGNOSTIC",
        "params": {
            "bb_period": base["bb_period"],
            "bb_sigma": base["bb_sigma"],
            "capital": base["capital"],
            "fee": base["fee"],
            "slippage": base["slippage"],
            "warmup_hours": warmup_hours,
        },
        "active_months": len(months),
        "months": months,
        "summary": {
            "friction_flip_months": flips,
            "signal_negative_even_without_friction_months": signal_negative,
            "survives_friction_months": survivors,
            "corr_fills_vs_friction_drag": _pearson(fills, drags),
            "corr_fees_vs_friction_drag": _pearson(fees, drags),
            "corr_volatility_vs_buy_band_width": _pearson(vols, widths),
            "corr_buy_band_width_vs_net_return": _pearson(widths, nets),
            "mean_friction_drag_pct": round(mean(drags), 5),
            "mean_fills_per_month": round(mean(fills), 3),
            "mean_fees_usdt_per_month": round(mean(fees), 5),
        },
        "methodology": {
            "monthly_capital_reset": True,
            "parameters_optimized": False,
            "band_width_used_as_signal": False,
            "warmup_fills_allowed": False,
        },
        "safety": {
            "paper_only": True,
            "orders_real": 0,
            "network_calls": 0,
            "workspace_writes": 0,
        },
    }
