"""Equal-sleeve multi-asset Donchian portfolio, research-only.

Each asset receives an independent fixed cash sleeve. No cross-asset transfer or
rebalancing occurs. The per-asset signal/execution logic mirrors
tools.experimental_donchian.simulate_donchian and records a 4h equity series.
"""
from __future__ import annotations

import math

from src.engine import BASE_STEP, MIN_HYPOTHETICAL_NOTIONAL, LabError
from tools.experimental_donchian import simulate_donchian

FIXED_SYMBOLS=("BTCUSDT","ETHUSDT","BNBUSDT","XRPUSDT","SOLUSDT")


def simulate_sleeve_series(
    bars:list,
    *,
    capital:float,
    fee:float=0.001,
    slippage:float=0.0005,
    entry_period:int=55,
    exit_period:int=20,
):
    if not isinstance(bars,list) or len(bars)<entry_period+60:
        raise LabError("Historique insuffisant pour poche Donchian")
    cash=float(capital); quantity=0.0; paid_fees=0.0
    trades=[]; series=[]; peak=float(capital); max_dd=0.0

    def buy(ts,open_price,signal_ts,context):
        nonlocal cash,quantity,paid_fees
        if cash<MIN_HYPOTHETICAL_NOTIONAL:
            return
        price=open_price*(1+slippage)
        units=math.floor((cash/(price*(1+fee)))/BASE_STEP)*BASE_STEP
        notional=units*price
        commission=notional*fee
        cost=notional+commission
        if units<=0 or notional<MIN_HYPOTHETICAL_NOTIONAL or cost>cash+1e-7:
            return
        cash=max(0.0,cash-cost); quantity=units; paid_fees+=commission
        trades.append({"timestamp":ts,"side":"BUY","price":round(price,5),
                       "qty":round(units,8),"fee":round(commission,7),
                       "signal_bar_open_utc":signal_ts,"signal_context":context})

    def sell(ts,open_price,signal_ts,context):
        nonlocal cash,quantity,paid_fees
        if quantity<=0:
            return
        price=open_price*(1-slippage)
        notional=quantity*price
        if notional<MIN_HYPOTHETICAL_NOTIONAL:
            return
        commission=notional*fee
        cash+=notional-commission; paid_fees+=commission
        trades.append({"timestamp":ts,"side":"SELL","price":round(price,5),
                       "qty":round(quantity,8),"fee":round(commission,7),
                       "signal_bar_open_utc":signal_ts,"signal_context":context})
        quantity=0.0

    for i,(ts,opening,high,low,closing,volume) in enumerate(bars):
        signal_index=i-1
        if signal_index>=entry_period:
            signal_bar=bars[signal_index]
            signal_close=signal_bar[4]
            if quantity==0:
                prior=bars[signal_index-entry_period:signal_index]
                channel_high=max(b[2] for b in prior)
                if signal_close>channel_high:
                    buy(ts,opening,signal_bar[0],{"signal_close":signal_close,
                        "prior_entry_channel_high":channel_high,"entry_period":entry_period})
            elif signal_index>=exit_period:
                prior=bars[signal_index-exit_period:signal_index]
                channel_low=min(b[3] for b in prior)
                if signal_close<channel_low:
                    sell(ts,opening,signal_bar[0],{"signal_close":signal_close,
                         "prior_exit_channel_low":channel_low,"exit_period":exit_period})
        equity=cash+quantity*closing
        peak=max(peak,equity)
        max_dd=min(max_dd,(equity/peak-1)*100)
        series.append({"t":int(ts),"equity":equity,"invested":quantity>0})

    final=cash+quantity*bars[-1][4]
    return {
        "results":{
            "capital_initial":capital,
            "equity_final":round(final,6),
            "return_pct":round(100*(final/capital-1),5),
            "max_drawdown_pct":round(max_dd,5),
            "cash_final":round(cash,6),
            "base_inventory_units":round(quantity,8),
            "inventory_marked_usdt":round(quantity*bars[-1][4],6),
            "fees_paid_usdt":round(paid_fees,6),
            "hypothetical_fills":len(trades),
            "buy_events":sum(t["side"]=="BUY" for t in trades),
            "sell_events":sum(t["side"]=="SELL" for t in trades),
        },
        "trades":trades,
        "series":series,
    }


def equal_sleeve_portfolio(asset_bars:dict,*,total_capital=10000.0,fee=0.001,slippage=0.0005):
    if set(asset_bars)!=set(FIXED_SYMBOLS):
        raise LabError("Le portefeuille exige exactement BTC/ETH/BNB/XRP/SOL")
    first=asset_bars[FIXED_SYMBOLS[0]]
    timestamps=[int(b[0]) for b in first]
    if len(first)<115:
        raise LabError("Historique portefeuille insuffisant")
    for symbol in FIXED_SYMBOLS:
        bars=asset_bars[symbol]
        if len(bars)!=len(first) or [int(b[0]) for b in bars]!=timestamps:
            raise LabError("Sources multi-actifs non synchronisées")

    sleeve_capital=total_capital/len(FIXED_SYMBOLS)
    sleeves={}
    for symbol in FIXED_SYMBOLS:
        sim=simulate_sleeve_series(asset_bars[symbol],capital=sleeve_capital,fee=fee,slippage=slippage)
        # Parity guard against the canonical research simulator.
        ref=simulate_donchian(asset_bars[symbol],capital=sleeve_capital,fee=fee,slippage=slippage)
        for key in ("equity_final","return_pct","max_drawdown_pct","fees_paid_usdt","hypothetical_fills"):
            if sim["results"][key]!=ref["results"][key]:
                raise LabError(f"Parité Donchian rompue pour {symbol}: {key}")
        sleeves[symbol]=sim

    peak=float(total_capital); max_dd=0.0; combined=[]
    exposed_counts=[]
    for i,ts in enumerate(timestamps):
        equity=sum(sleeves[s]["series"][i]["equity"] for s in FIXED_SYMBOLS)
        exposed=sum(bool(sleeves[s]["series"][i]["invested"]) for s in FIXED_SYMBOLS)
        peak=max(peak,equity)
        max_dd=min(max_dd,(equity/peak-1)*100)
        combined.append({"t":ts,"equity":round(equity,6),"exposed_sleeves":exposed})
        exposed_counts.append(exposed)
    final=combined[-1]["equity"]
    btc_ref=simulate_donchian(asset_bars["BTCUSDT"],capital=total_capital,fee=fee,slippage=slippage)
    return {
        "schema":"seven.heaven.strategy_lab.donchian_equal_sleeve_portfolio.v1",
        "status":"FIXED_EQUAL_SLEEVES_NO_REBALANCING",
        "params":{"total_capital":total_capital,"sleeve_capital":sleeve_capital,
                  "symbols":list(FIXED_SYMBOLS),"fee":fee,"slippage":slippage,
                  "entry_period":55,"exit_period":20},
        "portfolio":{
            "equity_final":round(final,6),
            "return_pct":round(100*(final/total_capital-1),5),
            "max_drawdown_pct":round(max_dd,5),
            "fees_paid_usdt":round(sum(sleeves[s]["results"]["fees_paid_usdt"] for s in FIXED_SYMBOLS),6),
            "hypothetical_fills":sum(sleeves[s]["results"]["hypothetical_fills"] for s in FIXED_SYMBOLS),
            "mean_exposed_sleeves":round(sum(exposed_counts)/len(exposed_counts),4),
            "max_exposed_sleeves":max(exposed_counts),
        },
        "sleeves":{s:sleeves[s]["results"] for s in FIXED_SYMBOLS},
        "btc_only_reference":btc_ref["results"],
        "series":combined,
        "methodology":{"cross_asset_transfers":False,"periodic_rebalancing":False,
                       "weights_selected_after_result":False,"parity_guard":True},
        "safety":{"paper_only":True,"orders_real":0,"workspace_writes":0},
    }
