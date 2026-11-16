"""Research-only MACD 12/26/9 PAPER simulator.

Not wired into the Strategy Lab runtime. Signals use the previous CLOSED 1h
candle only and hypothetical fills occur at the following candle OPEN.
"""
from __future__ import annotations

import math

from src.engine import BASE_STEP, MIN_HYPOTHETICAL_NOTIONAL, LabError


def simulate_macd(
    bars: list,
    *,
    capital: float = 10000.0,
    fee: float = 0.001,
    slippage: float = 0.0005,
    fast: int = 12,
    slow: int = 26,
    signal: int = 9,
) -> dict:
    if not isinstance(bars, list) or len(bars) < slow + signal + 60:
        raise LabError("Historique insuffisant pour MACD")
    if not (1 < fast < slow and signal >= 2):
        raise LabError("Paramètres MACD invalides")
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

    alpha_fast = 2.0 / (fast + 1)
    alpha_slow = 2.0 / (slow + 1)
    alpha_signal = 2.0 / (signal + 1)
    ema_fast = None
    ema_slow = None
    signal_ema = None
    previous_hist = None

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
        quantity += units
        paid_fees += commission
        trades.append({
            "timestamp": ts,
            "side": "BUY",
            "price": round(price, 5),
            "qty": round(units, 8),
            "fee": round(commission, 7),
            "signal_bar_open_utc": signal_ts,
            "reason_code": "MACD_LINE_CROSS_ABOVE_SIGNAL",
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
            "timestamp": ts,
            "side": "SELL",
            "price": round(price, 5),
            "qty": round(quantity, 8),
            "fee": round(commission, 7),
            "signal_bar_open_utc": signal_ts,
            "reason_code": "MACD_LINE_CROSS_BELOW_SIGNAL",
            "signal_context": context,
        })
        quantity = 0.0

    for i, (ts, opening, high, low, closing, volume) in enumerate(bars):
        if i >= 1:
            prev_ts, _, _, _, prev_close, _ = bars[i - 1]
            if ema_fast is None:
                ema_fast = ema_slow = prev_close
                signal_ema = 0.0
                current_hist = 0.0
            else:
                ema_fast = alpha_fast * prev_close + (1 - alpha_fast) * ema_fast
                ema_slow = alpha_slow * prev_close + (1 - alpha_slow) * ema_slow
                macd = ema_fast - ema_slow
                signal_ema = alpha_signal * macd + (1 - alpha_signal) * signal_ema
                current_hist = macd - signal_ema
                if i >= slow + signal and previous_hist is not None:
                    context = {
                        "macd": macd,
                        "signal": signal_ema,
                        "histogram": current_hist,
                        "previous_histogram": previous_hist,
                        "last_closed_price": prev_close,
                    }
                    if previous_hist <= 0 < current_hist and quantity == 0:
                        buy(ts, opening, prev_ts, context)
                    elif previous_hist >= 0 > current_hist and quantity > 0:
                        sell(ts, opening, prev_ts, context)
            previous_hist = current_hist

        equity = cash + quantity * closing
        peak = max(peak, equity)
        max_dd = min(max_dd, (equity / peak - 1) * 100)

    final = cash + quantity * bars[-1][4]
    return {
        "schema": "seven.heaven.strategy_lab.experimental.macd.v1",
        "status": "RESEARCH_ONLY_HYPOTHETICAL_PAPER_BACKTEST",
        "params": {
            "fast": fast,
            "slow": slow,
            "signal": signal,
            "capital": capital,
            "fee": fee,
            "slippage": slippage,
            "timeframe": "1h",
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
