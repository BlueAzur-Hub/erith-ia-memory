"""Research-only causal Donchian 55/20 PAPER simulator.

Entry uses a CLOSED candle whose close exceeds the prior 55-bar high channel.
Exit uses a CLOSED candle whose close falls below the prior 20-bar low channel.
Hypothetical execution is delayed to the next candle OPEN.
"""
from __future__ import annotations

import math

from src.engine import BASE_STEP, MIN_HYPOTHETICAL_NOTIONAL, LabError


def simulate_donchian(
    bars: list,
    *,
    capital: float = 10000.0,
    fee: float = 0.001,
    slippage: float = 0.0005,
    entry_period: int = 55,
    exit_period: int = 20,
) -> dict:
    minimum = max(entry_period, exit_period) + 60
    if not isinstance(bars, list) or len(bars) < minimum:
        raise LabError("Historique insuffisant pour Donchian")
    if type(entry_period) is not int or type(exit_period) is not int:
        raise LabError("Périodes Donchian invalides")
    if not 2 <= exit_period < entry_period <= 500:
        raise LabError("Périodes Donchian hors limites")
    for name, value, low, high in (
        ("capital", capital, 100.0, 100000.0),
        ("fee", fee, 0.0, 0.01),
        ("slippage", slippage, 0.0, 0.02),
    ):
        if not isinstance(value, (int, float)) or not math.isfinite(value) or not low <= value <= high:
            raise LabError(f"{name}: valeur invalide")

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
            "reason_code": "DONCHIAN_55_CLOSE_BREAKOUT",
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
            "reason_code": "DONCHIAN_20_CLOSE_BREAKDOWN",
            "signal_context": context,
        })
        quantity = 0.0

    for i, (ts, opening, high, low, closing, volume) in enumerate(bars):
        signal_index = i - 1
        if signal_index >= entry_period:
            signal_bar = bars[signal_index]
            signal_close = signal_bar[4]
            if quantity == 0:
                prior = bars[signal_index - entry_period:signal_index]
                channel_high = max(b[2] for b in prior)
                if signal_close > channel_high:
                    buy(ts, opening, signal_bar[0], {
                        "signal_close": signal_close,
                        "prior_entry_channel_high": channel_high,
                        "entry_period": entry_period,
                    })
            elif signal_index >= exit_period:
                prior = bars[signal_index - exit_period:signal_index]
                channel_low = min(b[3] for b in prior)
                if signal_close < channel_low:
                    sell(ts, opening, signal_bar[0], {
                        "signal_close": signal_close,
                        "prior_exit_channel_low": channel_low,
                        "exit_period": exit_period,
                    })

        equity = cash + quantity * closing
        peak = max(peak, equity)
        max_dd = min(max_dd, (equity / peak - 1) * 100)

    final = cash + quantity * bars[-1][4]
    return {
        "schema": "seven.heaven.strategy_lab.experimental.donchian.v1",
        "status": "RESEARCH_ONLY_HYPOTHETICAL_PAPER_BACKTEST",
        "params": {
            "entry_period": entry_period,
            "exit_period": exit_period,
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
            "base_inventory_units": round(quantity, 8),
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
