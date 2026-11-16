"""Research-only causal Parabolic SAR PAPER simulator.

Standard AF step 0.02 / max 0.20 by default. The V4.6.2 runtime is not modified.
Signals are derived from already CLOSED candles and any hypothetical fill occurs
at the following candle OPEN.
"""
from __future__ import annotations

import math

from src.engine import BASE_STEP, MIN_HYPOTHETICAL_NOTIONAL, LabError


def _sar_states(bars: list, *, af_step: float, af_max: float) -> list:
    if len(bars) < 3:
        raise LabError("Historique insuffisant pour SAR")
    states = [None] * len(bars)

    b0, b1 = bars[0], bars[1]
    trend = 1 if b1[4] >= b0[4] else -1
    psar = min(b0[3], b1[3]) if trend > 0 else max(b0[2], b1[2])
    ep = max(b0[2], b1[2]) if trend > 0 else min(b0[3], b1[3])
    af = af_step
    states[1] = {"trend": trend, "flip": 0, "sar": psar, "ep": ep, "af": af}

    for i in range(2, len(bars)):
        _, _, high, low, close, _ = bars[i]
        previous_trend = trend
        candidate = psar + af * (ep - psar)

        if trend > 0:
            candidate = min(candidate, bars[i - 1][3], bars[i - 2][3])
            if low < candidate:
                trend = -1
                psar = ep
                ep = low
                af = af_step
            else:
                psar = candidate
                if high > ep:
                    ep = high
                    af = min(af_max, af + af_step)
        else:
            candidate = max(candidate, bars[i - 1][2], bars[i - 2][2])
            if high > candidate:
                trend = 1
                psar = ep
                ep = high
                af = af_step
            else:
                psar = candidate
                if low < ep:
                    ep = low
                    af = min(af_max, af + af_step)

        states[i] = {
            "trend": trend,
            "flip": trend - previous_trend,
            "sar": psar,
            "ep": ep,
            "af": af,
            "close": close,
        }
    return states


def simulate_parabolic_sar(
    bars: list,
    *,
    capital: float = 10000.0,
    fee: float = 0.001,
    slippage: float = 0.0005,
    af_step: float = 0.02,
    af_max: float = 0.20,
) -> dict:
    if not isinstance(bars, list) or len(bars) < 80:
        raise LabError("Historique insuffisant pour SAR")
    if not all(isinstance(v, (int, float)) and math.isfinite(v) for v in (af_step, af_max)):
        raise LabError("Paramètres SAR invalides")
    if not 0 < af_step <= af_max <= 1:
        raise LabError("Paramètres SAR hors limites")
    for name, value, low, high in (
        ("capital", capital, 100.0, 100000.0),
        ("fee", fee, 0.0, 0.01),
        ("slippage", slippage, 0.0, 0.02),
    ):
        if not isinstance(value, (int, float)) or not math.isfinite(value) or not low <= value <= high:
            raise LabError(f"{name}: valeur invalide")

    states = _sar_states(bars, af_step=af_step, af_max=af_max)
    cash = float(capital)
    quantity = 0.0
    paid_fees = 0.0
    trades = []
    peak = float(capital)
    max_dd = 0.0

    def buy(ts, open_price, signal_ts, context):
        nonlocal cash, quantity, paid_fees
        if cash < MIN_HYPOTHETICAL_NOTIONAL:
            return
        price = open_price * (1 + slippage)
        units = math.floor((cash / (price * (1 + fee))) / BASE_STEP) * BASE_STEP
        notional = units * price
        commission = notional * fee
        cost = notional + commission
        if units <= 0 or notional < MIN_HYPOTHETICAL_NOTIONAL or cost > cash + 1e-7:
            return
        cash = max(0.0, cash - cost)
        quantity = units
        paid_fees += commission
        trades.append({
            "timestamp": ts, "side": "BUY", "price": round(price, 5),
            "qty": round(units, 8), "fee": round(commission, 7),
            "signal_bar_open_utc": signal_ts,
            "reason_code": "PARABOLIC_SAR_FLIP_BULLISH",
            "signal_context": context,
        })

    def sell(ts, open_price, signal_ts, context):
        nonlocal cash, quantity, paid_fees
        if quantity <= 0:
            return
        price = open_price * (1 - slippage)
        notional = quantity * price
        if notional < MIN_HYPOTHETICAL_NOTIONAL:
            return
        commission = notional * fee
        cash += notional - commission
        paid_fees += commission
        trades.append({
            "timestamp": ts, "side": "SELL", "price": round(price, 5),
            "qty": round(quantity, 8), "fee": round(commission, 7),
            "signal_bar_open_utc": signal_ts,
            "reason_code": "PARABOLIC_SAR_FLIP_BEARISH",
            "signal_context": context,
        })
        quantity = 0.0

    for i, (ts, opening, high, low, closing, volume) in enumerate(bars):
        if i >= 2:
            state = states[i - 1]
            if state is not None and state["flip"]:
                context = {
                    "sar": state["sar"],
                    "extreme_point": state["ep"],
                    "acceleration_factor": state["af"],
                    "last_closed_price": bars[i - 1][4],
                    "new_trend": "BULLISH" if state["trend"] > 0 else "BEARISH",
                }
                if state["flip"] > 0 and quantity == 0:
                    buy(ts, opening, bars[i - 1][0], context)
                elif state["flip"] < 0 and quantity > 0:
                    sell(ts, opening, bars[i - 1][0], context)

        equity = cash + quantity * closing
        peak = max(peak, equity)
        max_dd = min(max_dd, (equity / peak - 1) * 100)

    final = cash + quantity * bars[-1][4]
    return {
        "schema": "seven.heaven.strategy_lab.experimental.parabolic_sar.v1",
        "status": "RESEARCH_ONLY_HYPOTHETICAL_PAPER_BACKTEST",
        "params": {
            "af_step": af_step,
            "af_max": af_max,
            "capital": capital,
            "fee": fee,
            "slippage": slippage,
        },
        "data": {
            "rows": len(bars),
            "first_utc": bars[0][0],
            "last_utc": bars[-1][0],
            "execution_model": "PREVIOUS_CLOSED_CANDLE_SIGNAL_NEXT_BAR_OPEN",
        },
        "results": {
            "capital_initial": capital,
            "equity_final": round(final, 6),
            "return_pct": round(100 * (final / capital - 1), 5),
            "max_drawdown_pct": round(max_dd, 5),
            "cash_final": round(cash, 6),
            "base_inventory_btc": round(quantity, 8),
            "inventory_marked_usdt": round(quantity * bars[-1][4], 6),
            "fees_paid_usdt": round(paid_fees, 6),
            "hypothetical_fills": len(trades),
            "buy_events": sum(t["side"] == "BUY" for t in trades),
            "sell_events": sum(t["side"] == "SELL" for t in trades),
        },
        "trades": trades,
        "safety": {
            "paper_only": True,
            "orders_real": 0,
            "account_keys": False,
            "runtime_integration": False,
        },
    }
