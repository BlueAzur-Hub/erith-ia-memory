"""Descriptive monthly market/regime map for certified 1h PAPER research.

This module is research-only. It does not classify regimes as trading signals,
does not write workspace state, and does not perform network calls.
"""
from __future__ import annotations

from datetime import datetime, timezone
import math
from statistics import median, pstdev

from src.engine import LabError, options, simulate
from src.observatory import ORDER


class RegimeMapError(ValueError):
    """The monthly descriptive study cannot be performed safely."""


def _month_label(ts: int) -> str:
    return datetime.fromtimestamp(ts, timezone.utc).strftime("%Y-%m")


def _pearson(xs: list[float], ys: list[float]) -> float | None:
    if len(xs) != len(ys) or len(xs) < 2:
        return None
    mx = sum(xs) / len(xs)
    my = sum(ys) / len(ys)
    dx = [x - mx for x in xs]
    dy = [y - my for y in ys]
    den = math.sqrt(sum(x * x for x in dx) * sum(y * y for y in dy))
    if den == 0:
        return None
    return round(sum(x * y for x, y in zip(dx, dy)) / den, 6)


def _market_metrics(active: list[tuple]) -> dict:
    if len(active) < 2:
        raise RegimeMapError("Mois actif trop court")
    first_open = float(active[0][1])
    last_close = float(active[-1][4])
    closes = [float(b[4]) for b in active]
    log_returns = [math.log(closes[i] / closes[i - 1]) for i in range(1, len(closes))]
    vol = pstdev(log_returns) * math.sqrt(24 * 365) * 100 if log_returns else 0.0
    peak = closes[0]
    max_dd = 0.0
    for close in closes:
        peak = max(peak, close)
        max_dd = min(max_dd, (close / peak - 1) * 100)
    return {
        "market_return_pct": round((last_close / first_open - 1) * 100, 5),
        "realized_vol_annualized_pct": round(vol, 5),
        "market_max_drawdown_pct": round(max_dd, 5),
        "first_open": round(first_open, 8),
        "last_close": round(last_close, 8),
        "active_bars": len(active),
    }


def _validate_continuity(bars: list[tuple]) -> None:
    if not isinstance(bars, list) or len(bars) < 1440:
        raise RegimeMapError("Historique 1h insuffisant")
    for i, bar in enumerate(bars):
        if not isinstance(bar, tuple) or len(bar) < 6:
            raise RegimeMapError("Bougie 1h invalide")
        if i and int(bar[0]) != int(bars[i - 1][0]) + 3600:
            raise RegimeMapError("Historique 1h non continu")


def run_monthly_regime_map(
    bars: list[tuple],
    raw_params: dict,
    *,
    warmup_hours: int = 720,
) -> dict:
    """Run independent monthly PAPER experiments with a fixed trailing warmup."""
    _validate_continuity(bars)
    if type(warmup_hours) is not int or warmup_hours < 60 or warmup_hours > 2160:
        raise RegimeMapError("Préchauffage mensuel invalide")

    base = options(raw_params)
    requested_dca_minutes = base["dca_every"]
    effective_dca_steps = max(1, math.ceil(requested_dca_minutes / 60))

    bounds: list[tuple[str, int, int]] = []
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
        market = _market_metrics(active)
        strategies = {}
        for kind in ORDER:
            params = dict(base)
            params["kind"] = kind
            params["dca_every"] = effective_dca_steps
            result = simulate(sample, params, trade_start_index=warmup_hours)
            r = result["results"]
            strategies[kind] = {
                "return_pct": r["return_pct"],
                "equity_final": r["equity_final"],
                "max_drawdown_pct": r["max_drawdown_pct"],
                "fees_paid_usdt": r["fees_paid_usdt"],
                "hypothetical_fills": r["hypothetical_fills"],
                "rejected_orders": r["rejected_orders"],
                "cash_final": r["cash_final"],
                "base_inventory_btc": r["base_inventory_btc"],
            }
        months.append({
            "month": label,
            "warmup_hours": warmup_hours,
            "market": market,
            "strategies": strategies,
        })

    if len(months) < 2:
        raise RegimeMapError("Pas assez de mois actifs après préchauffage")

    market_returns = [m["market"]["market_return_pct"] for m in months]
    market_vols = [m["market"]["realized_vol_annualized_pct"] for m in months]
    summary = {}
    for kind in ORDER:
        returns = [m["strategies"][kind]["return_pct"] for m in months]
        hold = [m["strategies"]["HOLD_100"]["return_pct"] for m in months]
        best_i = max(range(len(months)), key=lambda i: returns[i])
        worst_i = min(range(len(months)), key=lambda i: returns[i])
        summary[kind] = {
            "months": len(months),
            "positive_months": sum(v > 0 for v in returns),
            "beats_cash_months": sum(v > 0 for v in returns),
            "beats_hold_100_months": sum(v > h for v, h in zip(returns, hold)),
            "median_return_pct": round(float(median(returns)), 5),
            "best_month": months[best_i]["month"],
            "best_return_pct": returns[best_i],
            "worst_month": months[worst_i]["month"],
            "worst_return_pct": returns[worst_i],
            "corr_with_market_return": _pearson(market_returns, returns),
            "corr_with_realized_vol": _pearson(market_vols, returns),
        }

    return {
        "schema": "seven.heaven.strategy_lab.monthly_regime_map.v1",
        "status": "DESCRIPTIVE_MONTHLY_PAPER_RESEARCH_NO_REGIME_SIGNAL",
        "source_timeframe": "1h",
        "warmup_hours": warmup_hours,
        "active_months": len(months),
        "dca_requested_minutes": requested_dca_minutes,
        "dca_effective_steps_1h": effective_dca_steps,
        "months": months,
        "summary": summary,
        "methodology": {
            "capital_resets_each_month": True,
            "monthly_returns_not_compounded": True,
            "warmup_fills_allowed": False,
            "regime_metrics_are_descriptive_only": True,
        },
        "safety": {
            "paper_only": True,
            "orders_real": 0,
            "network_calls": 0,
            "workspace_writes": 0,
        },
    }
