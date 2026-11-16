"""Research-only causal SuperTrend 20/4 PAPER simulator.

The module is deliberately isolated from the V4.6.2 runtime. Indicator state is
updated only from already CLOSED candles; any hypothetical trade executes at the
OPEN of the following candle.
"""
from __future__ import annotations

import math

from src.engine import BASE_STEP, MIN_HYPOTHETICAL_NOTIONAL, LabError


def simulate_supertrend(
    bars: list,
    *,
    capital: float = 10000.0,
    fee: float = 0.001,
    slippage: float = 0.0005,
    atr_period: int = 20,
    multiplier: float = 4.0,
) -> dict:
    if not isinstance(bars, list) or len(bars) < atr_period + 60:
        raise LabError("Historique insuffisant pour SuperTrend")
    if type(atr_period) is not int or atr_period < 2 or atr_period > 200:
        raise LabError("Période ATR SuperTrend invalide")
    if not isinstance(multiplier, (int, float)) or not math.isfinite(multiplier) or not 0.1 <= multiplier <= 20:
        raise LabError("Multiplicateur SuperTrend invalide")
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

    tr_seed = []
    atr = None
    prev_indicator_close = None
    final_upper = None
    final_lower = None
    trend = None

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
            "reason_code": "SUPERTREND_FLIP_BULLISH",
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
            "reason_code": "SUPERTREND_FLIP_BEARISH",
            "signal_context": context,
        })
        quantity = 0.0

    def update_indicator(bar):
        nonlocal atr, prev_indicator_close, final_upper, final_lower, trend
        ts, opening, high, low, closing, volume = bar
        tr = (high - low if prev_indicator_close is None else
              max(high - low, abs(high - prev_indicator_close), abs(low - prev_indicator_close)))

        if atr is None:
            tr_seed.append(tr)
            prev_indicator_close = closing
            if len(tr_seed) < atr_period:
                return None
            atr = sum(tr_seed[-atr_period:]) / atr_period
            mid = (high + low) / 2.0
            final_upper = mid + multiplier * atr
            final_lower = mid - multiplier * atr
            trend = 1 if closing >= mid else -1
            return {
                "flip": 0, "trend": trend, "atr": atr,
                "upper": final_upper, "lower": final_lower, "close": closing,
            }

        previous_upper = final_upper
        previous_lower = final_lower
        previous_trend = trend
        previous_close = prev_indicator_close

        atr = ((atr_period - 1) * atr + tr) / atr_period
        mid = (high + low) / 2.0
        basic_upper = mid + multiplier * atr
        basic_lower = mid - multiplier * atr
        final_upper = (basic_upper if basic_upper < previous_upper or previous_close > previous_upper
                       else previous_upper)
        final_lower = (basic_lower if basic_lower > previous_lower or previous_close < previous_lower
                       else previous_lower)

        if previous_trend < 0 and closing > previous_upper:
            trend = 1
        elif previous_trend > 0 and closing < previous_lower:
            trend = -1
        else:
            trend = previous_trend

        prev_indicator_close = closing
        return {
            "flip": trend - previous_trend,
            "trend": trend,
            "atr": atr,
            "upper": final_upper,
            "lower": final_lower,
            "close": closing,
        }

    for i, (ts, opening, high, low, closing, volume) in enumerate(bars):
        if i >= 1:
            signal_bar = bars[i - 1]
            state = update_indicator(signal_bar)
            if state is not None and state["flip"]:
                context = {
                    "atr": state["atr"],
                    "final_upper": state["upper"],
                    "final_lower": state["lower"],
                    "last_closed_price": state["close"],
                    "new_trend": "BULLISH" if state["trend"] > 0 else "BEARISH",
                }
                if state["flip"] > 0 and quantity == 0:
                    buy(ts, opening, signal_bar[0], context)
                elif state["flip"] < 0 and quantity > 0:
                    sell(ts, opening, signal_bar[0], context)

        equity = cash + quantity * closing
        peak = max(peak, equity)
        max_dd = min(max_dd, (equity / peak - 1) * 100)

    final = cash + quantity * bars[-1][4]
    return {
        "schema": "seven.heaven.strategy_lab.experimental.supertrend.v1",
        "status": "RESEARCH_ONLY_HYPOTHETICAL_PAPER_BACKTEST",
        "params": {
            "atr_period": atr_period,
            "multiplier": multiplier,
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
