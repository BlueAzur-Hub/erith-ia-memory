"""Research-only Bollinger age+negative conditional exit.

This is not part of the stable engine. It reproduces the fixed Bollinger PAPER
mechanics and optionally adds one causal exit: once age >= H hours, if the last
closed candle remains below the PAPER entry price, sell at the next candle open.
"""
from __future__ import annotations

from collections import deque
from datetime import datetime, timezone
import math

from src.engine import (
    BASE_STEP,
    MIN_HYPOTHETICAL_NOTIONAL,
    LabError,
    options,
    simulate,
)
from tools.monthly_regime_map import _validate_continuity


def simulate_bollinger_age_negative(
    bars: list[tuple],
    raw_params: dict,
    *,
    age_hours: int | None,
    trade_start_index: int = 0,
) -> dict:
    p=options(raw_params)
    p["kind"]="BOLLINGER"
    if age_hours is not None and age_hours not in (24,36,48,72):
        raise LabError("Horizon age+negative non pré-enregistré")
    if len(bars)<60:
        raise LabError("Historique trop court")
    if type(trade_start_index) is not int or not 0<=trade_start_index<len(bars):
        raise LabError("Début actif invalide")
    if len(bars)-trade_start_index<60:
        raise LabError("Fenêtre active trop courte")

    capital=p["capital"]; fee=p["fee"]; slip=p["slippage"]
    cash=capital; quantity=0.0; paid_fees=0.0; turnover=0.0
    rejected=0; fills=[]; age_exit_count=0
    peak=capital; max_dd=0.0; exposure_bars=0
    position_entry=None; position_entry_ts=None
    bb_window=deque(maxlen=p["bb_period"])

    def buy(ts, open_price):
        nonlocal cash,quantity,paid_fees,turnover,rejected,position_entry,position_entry_ts
        if cash<MIN_HYPOTHETICAL_NOTIONAL:
            rejected+=1; return False
        price=open_price*(1+slip)
        planned=cash
        units=math.floor((planned/(price*(1+fee)))/BASE_STEP)*BASE_STEP
        notional=units*price
        cost=notional*(1+fee)
        if units<=0 or notional<MIN_HYPOTHETICAL_NOTIONAL or cost>cash+1e-7:
            rejected+=1; return False
        cash=max(0.0,cash-cost)
        quantity+=units
        paid_fees+=notional*fee
        turnover+=notional
        position_entry=price
        position_entry_ts=ts
        fills.append({"timestamp":ts,"side":"BUY","price":price,"qty":units,"fee":notional*fee,"reason":"BOLLINGER_ENTRY"})
        return True

    def sell(ts, open_price, reason):
        nonlocal cash,quantity,paid_fees,turnover,rejected,position_entry,position_entry_ts,age_exit_count
        if quantity<=0:
            return False
        price=open_price*(1-slip)
        notional=quantity*price
        if notional<MIN_HYPOTHETICAL_NOTIONAL:
            rejected+=1; return False
        commission=notional*fee
        cash+=notional-commission
        paid_fees+=commission
        turnover+=notional
        fills.append({"timestamp":ts,"side":"SELL","price":price,"qty":quantity,"fee":commission,"reason":reason})
        if reason=="AGE_NEGATIVE_EXIT":
            age_exit_count+=1
        quantity=0.0
        position_entry=None
        position_entry_ts=None
        return True

    for i,(ts,o,h,l,c,volume) in enumerate(bars):
        active=i>=trade_start_index
        if i>=1:
            prev_close=float(bars[i-1][4])
            bb_window.append(prev_close)
            if len(bb_window)==p["bb_period"]:
                mean=sum(bb_window)/len(bb_window)
                std=math.sqrt(sum((v-mean)**2 for v in bb_window)/len(bb_window))
                lower=mean-p["bb_sigma"]*std
                upper=mean+p["bb_sigma"]*std
                if active and quantity>0:
                    if prev_close>upper:
                        sell(ts,o,"BOLLINGER_NORMAL_EXIT")
                    elif (age_hours is not None and position_entry is not None and position_entry_ts is not None
                          and ts-position_entry_ts>=age_hours*3600 and prev_close<position_entry):
                        sell(ts,o,"AGE_NEGATIVE_EXIT")
                elif active and quantity==0 and prev_close<lower:
                    buy(ts,o)
        if not active:
            continue
        if quantity>0:
            exposure_bars+=1
        equity=cash+quantity*c
        peak=max(peak,equity)
        max_dd=min(max_dd,(equity/peak-1)*100)

    final=cash+quantity*bars[-1][4]
    return {
        "return_pct":round(100*(final/capital-1),5),
        "equity_final":round(final,6),
        "max_drawdown_pct":round(max_dd,5),
        "fees_paid_usdt":round(paid_fees,6),
        "turnover_usdt":round(turnover,6),
        "hypothetical_fills":len(fills),
        "rejected_orders":rejected,
        "age_negative_exits":age_exit_count,
        "cash_final":round(cash,6),
        "base_inventory_btc":round(quantity,8),
        "time_in_position_pct":round(100*exposure_bars/(len(bars)-trade_start_index),3),
        "safety":{"paper_only":True,"orders_real":0},
    }


def _period_sample(bars,start_ts,end_ts,warmup=720):
    start_i=next((i for i,b in enumerate(bars) if int(b[0])>=start_ts),None)
    if start_i is None or start_i<warmup:
        raise LabError("Warmup période indisponible")
    end_i=next((i for i,b in enumerate(bars) if int(b[0])>=end_ts),len(bars))
    if end_i<=start_i:
        raise LabError("Période active vide")
    sample=bars[start_i-warmup:end_i]
    return sample,warmup


def run_selection_experiment(bars:list[tuple],raw_params:dict)->dict:
    _validate_continuity(bars)
    utc=lambda y,m,d:int(datetime(y,m,d,tzinfo=timezone.utc).timestamp())
    periods={
        "2024_SELECTION":(utc(2024,2,1),utc(2025,1,1)),
        "2025_KNOWN_VALIDATION":(utc(2025,1,1),utc(2026,1,1)),
        "2026_INDEPENDENT_CONFIRMATION":(utc(2026,1,1),utc(2026,11,1)),
    }
    samples={name:_period_sample(bars,*bounds) for name,bounds in periods.items()}

    sel_sample,sel_start=samples["2024_SELECTION"]
    baseline=simulate_bollinger_age_negative(sel_sample,raw_params,age_hours=None,trade_start_index=sel_start)
    candidates=[]
    for h in (24,36,48,72):
        r=simulate_bollinger_age_negative(sel_sample,raw_params,age_hours=h,trade_start_index=sel_start)
        eligible=(r["return_pct"]>baseline["return_pct"] and
                  r["max_drawdown_pct"]>=baseline["max_drawdown_pct"])
        candidates.append({"age_hours":h,"eligible":eligible,**r})

    eligible=[c for c in candidates if c["eligible"]]
    if eligible:
        selected=sorted(
            eligible,
            key=lambda c:(-c["return_pct"],-c["max_drawdown_pct"],c["hypothetical_fills"],-c["age_hours"])
        )[0]
        selected_mode="AGE_NEGATIVE_EXIT"
        selected_h=selected["age_hours"]
    else:
        selected_mode="BASELINE"
        selected_h=None

    evaluations={}
    for name,(sample,start_idx) in samples.items():
        base=simulate_bollinger_age_negative(sample,raw_params,age_hours=None,trade_start_index=start_idx)
        chosen=simulate_bollinger_age_negative(sample,raw_params,age_hours=selected_h,trade_start_index=start_idx)
        evaluations[name]={"baseline":base,"selected":chosen}

    return {
        "schema":"seven.heaven.strategy_lab.bollinger_age_negative_selection.v1",
        "status":"PREDECLARED_2024_SELECTION_2025_KNOWN_2026_INDEPENDENT_CONFIRMATION",
        "selection":{
            "baseline":baseline,
            "candidates_2024":candidates,
            "selected_mode":selected_mode,
            "selected_age_hours":selected_h,
            "criterion":"return strictly above baseline AND drawdown no worse; then max return, max drawdown, fewer fills, longer H",
        },
        "evaluations":evaluations,
        "methodology":{
            "selection_uses_2024_only":True,
            "year_2025_is_known_validation_not_blind":True,
            "year_2026_used_for_selection":False,
            "normal_bollinger_exit_has_priority":True,
            "age_exit_uses_previous_closed_candle_only":True,
        },
        "safety":{"paper_only":True,"orders_real":0,"workspace_writes":0},
    }
