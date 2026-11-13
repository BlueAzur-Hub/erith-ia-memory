"""Seven Heaven Strategy Lab: auditable long-only Spot PAPER simulation.

No brokerage access or order routing. Signals only use already CLOSED candles;
execution is delayed to the OPEN of the following candle. Prices are from a
frozen Binance history, not live OKX quotes. No hidden leverage or borrowing.
These deterministic assumptions are not a fill-quality certification.
"""
from __future__ import annotations

from collections import deque
import csv
import math
from pathlib import Path

KINDS = {"HOLD_50", "HOLD_100", "CASH", "EMA_CROSS", "BOLLINGER", "DCA", "CUSTOM_RULES"}
ENTRY_RULES = {"EMA_CROSS_UP", "PRICE_ABOVE_EMA"}
FILTER_RULES = {"NONE", "RSI_BELOW", "VOLUME_ABOVE"}
EXIT_RULES = {"EMA_CROSS_DOWN", "PRICE_BELOW_EMA", "RSI_ABOVE"}
COLS = ["timestamp", "open", "high", "low", "close", "volume"]
BASE_STEP = 0.00000001
MIN_HYPOTHETICAL_NOTIONAL = 5.0  # LAB assumption, not historical OKX/Binance rules


class LabError(ValueError):
    pass


def _finite(value, low, high, label):
    try:
        n = float(value)
    except (ValueError, TypeError, OverflowError) as exc:
        raise LabError(f"{label}: nombre invalide") from exc
    if not math.isfinite(n) or not low <= n <= high:
        raise LabError(f"{label}: valeur hors limites [{low}, {high}]")
    return n


def options(raw):
    if not isinstance(raw, dict):
        raise LabError("Paramètres incorrects")
    kind = raw.get("kind", "EMA_CROSS")
    if kind not in KINDS:
        raise LabError("Stratégie inconnue")
    result = {
        "kind": kind,
        "capital": _finite(raw.get("capital", 1000), 100, 100000, "Capital USDT"),
        # These are fractions, not percentages. OKX observed taker 0.10% = 0.001.
        "fee": _finite(raw.get("fee", 0.001), 0, 0.01, "Frais par côté"),
        "slippage": _finite(raw.get("slippage", 0.0005), 0, 0.02, "Glissement par côté"),
        "ema_fast": int(_finite(raw.get("ema_fast", 10), 2, 150, "EMA rapide")),
        "ema_slow": int(_finite(raw.get("ema_slow", 30), 3, 400, "EMA lente")),
        "bb_period": int(_finite(raw.get("bb_period", 20), 5, 250, "Bollinger période")),
        "bb_sigma": _finite(raw.get("bb_sigma", 2), 0.5, 4, "Bollinger écart-type"),
        "dca_every": int(_finite(raw.get("dca_every", 1440), 1, 100000, "DCA intervalle en minutes")),
        "dca_quote": _finite(raw.get("dca_quote", 50), 5, 100000, "DCA montant USDT"),
        "entry_rule": raw.get("entry_rule", "EMA_CROSS_UP"),
        "filter_rule": raw.get("filter_rule", "NONE"),
        "exit_rule": raw.get("exit_rule", "EMA_CROSS_DOWN"),
        "rsi_period": int(_finite(raw.get("rsi_period", 14), 2, 100, "RSI période")),
        "rsi_entry_max": _finite(raw.get("rsi_entry_max", 60), 1, 99, "RSI entrée maximum"),
        "rsi_exit_min": _finite(raw.get("rsi_exit_min", 70), 1, 99, "RSI sortie minimum"),
        "volume_period": int(_finite(raw.get("volume_period", 20), 2, 200, "Volume période")),
        "volume_multiplier": _finite(raw.get("volume_multiplier", 1.0), 0.1, 5, "Volume multiplicateur"),
        "stop_loss_pct": _finite(raw.get("stop_loss_pct", 0), 0, 50, "Stop loss %"),
        "take_profit_pct": _finite(raw.get("take_profit_pct", 0), 0, 200, "Take profit %"),
    }
    if result["ema_fast"] >= result["ema_slow"]:
        raise LabError("L'EMA rapide doit être inférieure à l'EMA lente")
    if not isinstance(result["entry_rule"], str) or result["entry_rule"] not in ENTRY_RULES:
        raise LabError("Règle d'entrée personnalisée non autorisée")
    if not isinstance(result["filter_rule"], str) or result["filter_rule"] not in FILTER_RULES:
        raise LabError("Filtre personnalisé non autorisé")
    if not isinstance(result["exit_rule"], str) or result["exit_rule"] not in EXIT_RULES:
        raise LabError("Règle de sortie personnalisée non autorisée")
    return result


def load_bars(path: Path, expected_count=44640, *, interval_seconds=60):
    if interval_seconds not in (60, 3600):
        raise LabError("Intervalle de source non autorisé")
    bars = []
    last = None
    with Path(path).open("r", encoding="utf-8", newline="") as fh:
        reader = csv.DictReader(fh)
        if reader.fieldnames != COLS:
            raise LabError("CSV : colonnes inattendues")
        for row in reader:
            try:
                ts = int(row["timestamp"])
                o, h, l, c, vol = [float(row[k]) for k in COLS[1:]]
            except (TypeError, ValueError) as exc:
                raise LabError("CSV : valeurs invalides") from exc
            if last is not None and ts != last + interval_seconds:
                raise LabError("CSV : minute manquante ou doublonnée" if interval_seconds == 60 else "CSV : bougie horaire manquante ou doublonnée")
            if not all(map(math.isfinite, [o, h, l, c, vol])) or min(o, h, l, c) <= 0 or vol < 0:
                raise LabError("CSV : prix ou volumes invalides")
            if not l <= min(o, c) <= max(o, c) <= h:
                raise LabError("CSV : incohérence OHLC")
            bars.append((ts, o, h, l, c, vol))
            last = ts
            if len(bars) > 150000:
                raise LabError("CSV trop volumineux")
    if len(bars) < 60 or (expected_count is not None and len(bars) != expected_count):
        raise LabError("CSV incomplet")
    return bars


def simulate(bars, raw_options):
    p = options(raw_options)
    if len(bars) < 60:
        raise LabError("Historique trop court pour ce laboratoire")
    kind, capital, fee, slip = p["kind"], p["capital"], p["fee"], p["slippage"]
    cash, quantity, paid_fees, turnover, trades = capital, 0.0, 0.0, 0.0, []
    rejected = 0
    peak, max_dd, points = capital, 0.0, []
    ema_fast = ema_slow = previous_diff = None
    custom_fast = custom_slow = custom_prev_diff = position_entry = None
    changes = deque(maxlen=p["rsi_period"])
    volumes = deque(maxlen=p["volume_period"])
    alpha_fast, alpha_slow = 2 / (p["ema_fast"] + 1), 2 / (p["ema_slow"] + 1)
    bb_window = deque(maxlen=p["bb_period"])
    downsample = max(1, len(bars) // 240)

    def buy(ts, open_price, quote):
        nonlocal cash, quantity, paid_fees, turnover, rejected, position_entry
        if cash < MIN_HYPOTHETICAL_NOTIONAL or quote < MIN_HYPOTHETICAL_NOTIONAL:
            rejected += 1
            return
        price = open_price * (1 + slip)
        planned = min(quote, cash)
        units = math.floor((planned / (price * (1 + fee))) / BASE_STEP) * BASE_STEP
        notional = units * price
        cost = notional * (1 + fee)
        if units <= 0 or notional < MIN_HYPOTHETICAL_NOTIONAL or cost > cash + 1e-7:
            rejected += 1
            return
        cash = max(0.0, cash - cost)
        quantity += units
        position_entry = price
        paid_fees += notional * fee
        turnover += notional
        trades.append({"timestamp": ts, "side": "BUY", "price": round(price, 5),
                       "qty": round(units, 8), "fee": round(notional * fee, 7),
                       "cash_after": round(cash, 5)})

    def sell(ts, open_price):
        nonlocal cash, quantity, paid_fees, turnover, rejected, position_entry
        if quantity <= 0:
            return
        price = open_price * (1 - slip)
        notional = quantity * price
        if notional < MIN_HYPOTHETICAL_NOTIONAL:
            rejected += 1
            return
        commission = notional * fee
        cash += notional - commission
        paid_fees += commission
        turnover += notional
        trades.append({"timestamp": ts, "side": "SELL", "price": round(price, 5),
                       "qty": round(quantity, 8), "fee": round(commission, 7),
                       "cash_after": round(cash, 5)})
        quantity = 0.0
        position_entry = None

    for i, (ts, o, h, l, c, volume) in enumerate(bars):
        # Signals use previous CLOSED candle only; order is at this candle's OPEN.
        if i == 0 and kind in ("HOLD_50", "HOLD_100"):
            buy(ts, o, capital * (0.5 if kind == "HOLD_50" else 1.0))
        elif kind == "DCA" and i % p["dca_every"] == 0:
            if cash >= MIN_HYPOTHETICAL_NOTIONAL:
                buy(ts, o, p["dca_quote"])
        elif i >= 1 and kind in ("EMA_CROSS", "BOLLINGER"):
            prev_close = bars[i - 1][4]
            if kind == "EMA_CROSS":
                if ema_fast is None:
                    ema_fast = ema_slow = prev_close
                else:
                    ema_fast_before, ema_slow_before = ema_fast, ema_slow
                    ema_fast = alpha_fast * prev_close + (1 - alpha_fast) * ema_fast
                    ema_slow = alpha_slow * prev_close + (1 - alpha_slow) * ema_slow
                    curr_diff = ema_fast - ema_slow
                    if i >= p["ema_slow"]:
                        if previous_diff is not None and previous_diff <= 0 < curr_diff and quantity == 0:
                            buy(ts, o, cash)
                        elif previous_diff is not None and previous_diff >= 0 > curr_diff and quantity > 0:
                            sell(ts, o)
                    previous_diff = curr_diff
            else:
                bb_window.append(prev_close)
                if len(bb_window) == p["bb_period"]:
                    mean = sum(bb_window) / len(bb_window)
                    std = math.sqrt(sum((v - mean) ** 2 for v in bb_window) / len(bb_window))
                    if prev_close < mean - p["bb_sigma"] * std and quantity == 0:
                        buy(ts, o, cash)
                    elif prev_close > mean + p["bb_sigma"] * std and quantity > 0:
                        sell(ts, o)
        elif i >= 1 and kind == "CUSTOM_RULES":
            # Signals are based exclusively on the last CLOSED candle.
            prev_close, prev_volume = bars[i - 1][4], bars[i - 1][5]
            if custom_fast is None:
                custom_fast = custom_slow = prev_close
            else:
                custom_fast = alpha_fast * prev_close + (1 - alpha_fast) * custom_fast
                custom_slow = alpha_slow * prev_close + (1 - alpha_slow) * custom_slow
            diff = custom_fast - custom_slow
            if i >= 2:
                changes.append(prev_close - bars[i - 2][4])
            volumes.append(prev_volume)
            rsi = None
            if len(changes) == p["rsi_period"]:
                gains = sum(max(v, 0.0) for v in changes)
                losses = sum(max(-v, 0.0) for v in changes)
                rsi = (50.0 if gains == losses == 0
                       else (100.0 if losses == 0 else 100.0 * gains / (gains + losses)))
            ready = i >= p["ema_slow"] and custom_prev_diff is not None
            if ready and quantity:
                exit_signal = (
                    (p["exit_rule"] == "EMA_CROSS_DOWN" and custom_prev_diff >= 0 > diff)
                    or (p["exit_rule"] == "PRICE_BELOW_EMA" and prev_close < custom_slow)
                    or (p["exit_rule"] == "RSI_ABOVE" and rsi is not None and rsi > p["rsi_exit_min"])
                )
                stop_triggered = (position_entry is not None and p["stop_loss_pct"] > 0
                                  and prev_close <= position_entry * (1 - p["stop_loss_pct"] / 100))
                target_triggered = (position_entry is not None and p["take_profit_pct"] > 0
                                    and prev_close >= position_entry * (1 + p["take_profit_pct"] / 100))
                if exit_signal or stop_triggered or target_triggered:
                    sell(ts, o)
            elif ready and quantity == 0:
                entry_signal = (
                    (p["entry_rule"] == "EMA_CROSS_UP" and custom_prev_diff <= 0 < diff)
                    or (p["entry_rule"] == "PRICE_ABOVE_EMA" and custom_fast > custom_slow
                        and prev_close > custom_slow)
                )
                filter_ok = (
                    p["filter_rule"] == "NONE"
                    or (p["filter_rule"] == "RSI_BELOW" and rsi is not None
                        and rsi < p["rsi_entry_max"])
                    or (p["filter_rule"] == "VOLUME_ABOVE"
                        and len(volumes) == p["volume_period"]
                        and prev_volume >= p["volume_multiplier"] * sum(volumes) / len(volumes))
                )
                if entry_signal and filter_ok:
                    buy(ts, o, cash)
            custom_prev_diff = diff
        equity = cash + quantity * c  # open inventory marked to each close
        if equity > peak:
            peak = equity
        max_dd = min(max_dd, (equity / peak - 1) * 100)
        if i % downsample == 0 or i == len(bars) - 1:
            points.append({"t": ts, "price": round(c, 4), "equity": round(equity, 4)})

    final = cash + quantity * bars[-1][4]
    # Unrealized inventory and cash are included, no forced end liquidation.
    return {
        "schema": "seven.heaven.strategy_lab.paper.v1",
        "model": "NEXT_BAR_OPEN_LONG_ONLY_CASH_AND_INVENTORY",
        "status": "HYPOTHETICAL_PAPER_BACKTEST",
        "params": p,
        "data": {"rows": len(bars), "first_utc": bars[0][0], "last_utc": bars[-1][0],
                 "pair": "BTC/USDT", "exchange": "Binance Spot historical 2026-01",
                 "timeframe": "1m"},
        "results": {
            "capital_initial": capital,
            "equity_final": round(final, 6),
            "return_pct": round(100 * (final / capital - 1), 5),
            "max_drawdown_pct": round(max_dd, 5),
            "cash_final": round(cash, 6),
            "base_inventory_btc": round(quantity, 8),
            "inventory_marked_usdt": round(quantity * bars[-1][4], 6),
            "fees_paid_usdt": round(paid_fees, 6),
            "turnover_usdt": round(turnover, 6),
            "buy_events": sum(t["side"] == "BUY" for t in trades),
            "sell_events": sum(t["side"] == "SELL" for t in trades),
            "rejected_orders": rejected,
            "hypothetical_fills": len(trades),
        },
        "series": points,
        "trades": trades,
        "warnings": [
            "Simulation PAPER interne, PAS un backtest Freqtrade ou Hummingbot",
            "Prix historiques Binance, PAS cours ni execution Spot OKX",
            "Signaux sur cloture passee, ordres supposes executes a l'ouverture suivante",
            "Aucun carnet d'ordres, latence ou file Maker; glissement fixe hypothétique",
            "Regle taille 1e-8 BTC / minimum 5 USDT HYPOTHETIQUE, non certifiee exchange",
            "Frais Taker OKX 0,10% comme hypothese et non frais historiques Binance",
            "Inventaire restant inclus dans la valeur finale; pas de liquidation forcee",
            "Règles personnelles déclaratives, aucun code utilisateur exécuté",
            "Stop et objectif personnalisés évalués sur la dernière clôture, puis fill fictif à l'ouverture suivante ; pas de stop garanti",
        ],
        "safety": {"paper_only": True, "leverage": 1, "private_keys_used": False, "orders_real": 0},
    }
