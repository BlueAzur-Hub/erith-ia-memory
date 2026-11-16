"""Descriptive Donchian 55/20 mechanism diagnostics.

Research-only. This module does not alter the trading rule and does not create
or optimize filters. Pre-entry features are strictly causal; MFE/MAE and PnL are
retrospective diagnostics for fully closed PAPER positions.
"""
from __future__ import annotations

import math
from statistics import median, pstdev

from src.engine import LabError
from tools.experimental_donchian import simulate_donchian


def _efficiency(closes: list[float]) -> float:
    if len(closes) < 2:
        return 0.0
    path = sum(abs(b - a) for a, b in zip(closes, closes[1:]))
    return 0.0 if path == 0 else abs(closes[-1] - closes[0]) / path


def _wilder_atr(bars: list, period: int) -> list[float | None]:
    if period < 2:
        raise LabError("Période ATR invalide")
    trs: list[float] = []
    out: list[float | None] = [None] * len(bars)
    atr = None
    for i, (_, _, high, low, close, _) in enumerate(bars):
        prev_close = bars[i - 1][4] if i else None
        tr = high - low if prev_close is None else max(
            high - low, abs(high - prev_close), abs(low - prev_close)
        )
        trs.append(tr)
        if i == period - 1:
            atr = sum(trs[:period]) / period
            out[i] = atr
        elif i >= period and atr is not None:
            atr = ((period - 1) * atr + tr) / period
            out[i] = atr
    return out


def _market_max_drawdown_pct(bars: list) -> float:
    peak = bars[0][1]
    worst = 0.0
    for bar in bars:
        close = bar[4]
        peak = max(peak, close)
        worst = min(worst, (close / peak - 1) * 100)
    return worst


def _sma_occupancy_pct(bars: list, period: int = 200) -> float | None:
    if len(bars) <= period:
        return None
    closes = [b[4] for b in bars]
    above = 0
    total = 0
    running = sum(closes[:period])
    for i in range(period, len(closes)):
        running += closes[i] - closes[i - period]
        sma = running / period
        above += closes[i] > sma
        total += 1
    return 100 * above / total if total else None


def _median_or_none(rows: list[dict], key: str) -> float | None:
    values = [float(r[key]) for r in rows if r.get(key) is not None]
    return round(median(values), 6) if values else None


def _position_summary(rows: list[dict]) -> dict:
    winners = [r for r in rows if r["net_pnl_pct"] > 0]
    losers = [r for r in rows if r["net_pnl_pct"] <= 0]

    def group(items: list[dict]) -> dict:
        return {
            "count": len(items),
            "median_net_pnl_pct": _median_or_none(items, "net_pnl_pct"),
            "median_duration_bars": _median_or_none(items, "duration_bars"),
            "median_breakout_excess_pct": _median_or_none(items, "breakout_excess_pct"),
            "median_channel_width_pct": _median_or_none(items, "channel_width_pct"),
            "median_directional_return_55_pct": _median_or_none(items, "directional_return_55_pct"),
            "median_efficiency_ratio_55": _median_or_none(items, "efficiency_ratio_55"),
            "median_atr20_pct": _median_or_none(items, "atr20_pct"),
            "median_mfe_pct": _median_or_none(items, "mfe_pct"),
            "median_mae_pct": _median_or_none(items, "mae_pct"),
        }

    return {
        "closed_positions": len(rows),
        "winning_positions": len(winners),
        "losing_positions": len(losers),
        "win_rate_pct": round(100 * len(winners) / len(rows), 6) if rows else None,
        "all": group(rows),
        "winners": group(winners),
        "losers": group(losers),
    }


def analyze_donchian_mechanism(
    bars: list,
    *,
    fee: float = 0.001,
    slippage: float = 0.0005,
    entry_period: int = 55,
    exit_period: int = 20,
    atr_period: int = 20,
    annual_bars: int = 2190,
) -> dict:
    if not isinstance(bars, list) or len(bars) < max(entry_period, 200) + 10:
        raise LabError("Historique insuffisant pour diagnostic Donchian")

    sim = simulate_donchian(
        bars,
        fee=fee,
        slippage=slippage,
        entry_period=entry_period,
        exit_period=exit_period,
    )
    atr = _wilder_atr(bars, atr_period)
    by_ts = {bar[0]: i for i, bar in enumerate(bars)}
    positions = []
    active = None

    for trade in sim["trades"]:
        if trade["side"] == "BUY":
            active = trade
            continue
        if trade["side"] != "SELL" or active is None:
            continue

        buy = active
        sell = trade
        active = None
        signal_ts = buy["signal_bar_open_utc"]
        signal_index = by_ts.get(signal_ts)
        entry_index = by_ts.get(buy["timestamp"])
        exit_index = by_ts.get(sell["timestamp"])
        if signal_index is None or entry_index is None or exit_index is None:
            raise LabError("Horodatage de fill Donchian introuvable")
        if signal_index < entry_period or exit_index <= entry_index:
            raise LabError("Position Donchian incohérente")

        prior = bars[signal_index - entry_period:signal_index]
        signal_close = bars[signal_index][4]
        channel_high = max(b[2] for b in prior)
        channel_low = min(b[3] for b in prior)
        closes = [b[4] for b in bars[signal_index - entry_period:signal_index + 1]]
        atr_value = atr[signal_index]

        held = bars[entry_index:exit_index]
        entry_price = float(buy["price"])
        qty = float(buy["qty"])
        entry_cost = qty * entry_price + float(buy["fee"])
        exit_proceeds = qty * float(sell["price"]) - float(sell["fee"])
        net_pnl_pct = 100 * (exit_proceeds / entry_cost - 1) if entry_cost else 0.0

        positions.append({
            "entry_fill_utc": buy["timestamp"],
            "exit_fill_utc": sell["timestamp"],
            "entry_signal_utc": signal_ts,
            "entry_price": entry_price,
            "exit_price": float(sell["price"]),
            "duration_bars": exit_index - entry_index,
            "net_pnl_pct": round(net_pnl_pct, 6),
            "breakout_excess_pct": round(100 * (signal_close / channel_high - 1), 6),
            "channel_width_pct": round(100 * (channel_high - channel_low) / signal_close, 6),
            "directional_return_55_pct": round(
                100 * (signal_close / bars[signal_index - entry_period][4] - 1), 6
            ),
            "efficiency_ratio_55": round(_efficiency(closes), 6),
            "atr20_pct": round(100 * atr_value / signal_close, 6) if atr_value is not None else None,
            "mfe_pct": round(
                100 * (max(b[2] for b in held) / entry_price - 1), 6
            ) if held else None,
            "mae_pct": round(
                100 * (min(b[3] for b in held) / entry_price - 1), 6
            ) if held else None,
        })

    closes = [b[4] for b in bars]
    log_returns = [
        math.log(b / a) for a, b in zip(closes, closes[1:]) if a > 0 and b > 0
    ]
    realized_vol = (
        100 * pstdev(log_returns) * math.sqrt(annual_bars)
        if len(log_returns) > 1 else 0.0
    )
    market_return = 100 * (bars[-1][4] / bars[0][1] - 1)

    return {
        "schema": "seven.heaven.strategy_lab.donchian_mechanism.v1",
        "status": "POST_HOC_DESCRIPTIVE_RESEARCH_ONLY",
        "strategy": {
            "entry_period": entry_period,
            "exit_period": exit_period,
            "fee": fee,
            "slippage": slippage,
        },
        "regime": {
            "underlying_return_pct": round(market_return, 6),
            "realized_vol_annualized_pct": round(realized_vol, 6),
            "underlying_max_drawdown_pct": round(_market_max_drawdown_pct(bars), 6),
            "annual_efficiency_ratio": round(_efficiency(closes), 6),
            "sma200_occupancy_above_pct": (
                round(_sma_occupancy_pct(bars, 200), 6)
                if _sma_occupancy_pct(bars, 200) is not None else None
            ),
            "donchian_return_pct": sim["results"]["return_pct"],
            "donchian_fills": sim["results"]["hypothetical_fills"],
        },
        "positions": positions,
        "summary": _position_summary(positions),
        "open_position_excluded": bool(sim["results"]["base_inventory_units"]),
        "safety": {
            "paper_only": True,
            "orders_real": 0,
            "filter_optimization": False,
            "runtime_integration": False,
            "mfe_mae_retrospective_only": True,
        },
    }
