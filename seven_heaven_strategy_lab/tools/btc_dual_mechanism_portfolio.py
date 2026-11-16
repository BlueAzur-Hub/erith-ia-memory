"""Fixed 50/50 BTC portfolio: Donchian 55/20 + Bollinger 20/2 on 4h.

Research-only. Two independent sleeves, no transfers, no rebalancing.
Both sleeve implementations are parity-checked against their canonical research
engines before the combined portfolio is accepted.
"""
from __future__ import annotations

from collections import deque
import math

from src.engine import BASE_STEP, MIN_HYPOTHETICAL_NOTIONAL, LabError, simulate
from tools.donchian_equal_sleeve_portfolio import simulate_sleeve_series
from tools.experimental_donchian import simulate_donchian


def _pearson(xs,ys):
    if len(xs)!=len(ys) or len(xs)<2:
        return None
    mx=sum(xs)/len(xs); my=sum(ys)/len(ys)
    dx=[x-mx for x in xs]; dy=[y-my for y in ys]
    den=math.sqrt(sum(x*x for x in dx)*sum(y*y for y in dy))
    if den==0:
        return None
    return round(sum(x*y for x,y in zip(dx,dy))/den,6)


def simulate_bollinger_series(
    bars:list,
    *,
    capital:float,
    fee:float=0.001,
    slippage:float=0.0005,
    period:int=20,
    sigma:float=2.0,
):
    if not isinstance(bars,list) or len(bars)<60:
        raise LabError("Historique insuffisant pour poche Bollinger")
    cash=float(capital); quantity=0.0; paid_fees=0.0
    trades=[]; series=[]; peak=float(capital); max_dd=0.0
    window=deque(maxlen=period)

    def buy(ts,open_price):
        nonlocal cash,quantity,paid_fees
        if cash<MIN_HYPOTHETICAL_NOTIONAL:
            return
        price=open_price*(1+slippage)
        units=math.floor((cash/(price*(1+fee)))/BASE_STEP)*BASE_STEP
        notional=units*price; commission=notional*fee; cost=notional+commission
        if units<=0 or notional<MIN_HYPOTHETICAL_NOTIONAL or cost>cash+1e-7:
            return
        cash=max(0.0,cash-cost); quantity=units; paid_fees+=commission
        trades.append({"timestamp":int(ts),"side":"BUY","price":round(price,5),
                       "qty":round(units,8),"fee":round(commission,7)})

    def sell(ts,open_price):
        nonlocal cash,quantity,paid_fees
        if quantity<=0:
            return
        price=open_price*(1-slippage)
        notional=quantity*price
        if notional<MIN_HYPOTHETICAL_NOTIONAL:
            return
        commission=notional*fee
        cash+=notional-commission; paid_fees+=commission
        trades.append({"timestamp":int(ts),"side":"SELL","price":round(price,5),
                       "qty":round(quantity,8),"fee":round(commission,7)})
        quantity=0.0

    for i,(ts,o,h,l,c,v) in enumerate(bars):
        if i>=1:
            prev_close=float(bars[i-1][4])
            window.append(prev_close)
            if len(window)==period:
                middle=sum(window)/period
                std=math.sqrt(sum((x-middle)**2 for x in window)/period)
                lower=middle-sigma*std; upper=middle+sigma*std
                if quantity==0 and prev_close<lower:
                    buy(ts,o)
                elif quantity>0 and prev_close>upper:
                    sell(ts,o)
        equity=cash+quantity*float(c)
        peak=max(peak,equity)
        max_dd=min(max_dd,(equity/peak-1)*100)
        series.append({"t":int(ts),"equity":equity,"invested":quantity>0})

    final=cash+quantity*float(bars[-1][4])
    return {
        "results":{
            "capital_initial":capital,
            "equity_final":round(final,6),
            "return_pct":round(100*(final/capital-1),5),
            "max_drawdown_pct":round(max_dd,5),
            "cash_final":round(cash,6),
            "base_inventory_btc":round(quantity,8),
            "inventory_marked_usdt":round(quantity*float(bars[-1][4]),6),
            "fees_paid_usdt":round(paid_fees,6),
            "hypothetical_fills":len(trades),
            "buy_events":sum(t["side"]=="BUY" for t in trades),
            "sell_events":sum(t["side"]=="SELL" for t in trades),
        },
        "trades":trades,
        "series":series,
    }


def run_dual_mechanism_portfolio(bars4h:list,*,total_capital=10000.0,fee=0.001,slippage=0.0005):
    if not isinstance(bars4h,list) or len(bars4h)<115:
        raise LabError("Historique 4h insuffisant")
    sleeve=total_capital/2.0

    don=simulate_sleeve_series(bars4h,capital=sleeve,fee=fee,slippage=slippage)
    don_ref=simulate_donchian(bars4h,capital=sleeve,fee=fee,slippage=slippage)
    for key in ("equity_final","return_pct","max_drawdown_pct","fees_paid_usdt","hypothetical_fills"):
        if don["results"][key]!=don_ref["results"][key]:
            raise LabError("Parité Donchian rompue: "+key)

    bol=simulate_bollinger_series(bars4h,capital=sleeve,fee=fee,slippage=slippage)
    bol_ref=simulate(bars4h,{
        "kind":"BOLLINGER","capital":sleeve,"fee":fee,"slippage":slippage,
        "bb_period":20,"bb_sigma":2
    })
    for key in ("equity_final","return_pct","max_drawdown_pct","fees_paid_usdt","hypothetical_fills"):
        if bol["results"][key]!=bol_ref["results"][key]:
            raise LabError("Parité Bollinger rompue: "+key)

    peak=float(total_capital); max_dd=0.0; combined=[]
    both_exposed=0
    don_returns=[]; bol_returns=[]
    prev_d=don["series"][0]["equity"]; prev_b=bol["series"][0]["equity"]
    for i in range(len(bars4h)):
        ds=don["series"][i]; bs=bol["series"][i]
        if ds["t"]!=bs["t"]:
            raise LabError("Séries mécanismes désynchronisées")
        equity=ds["equity"]+bs["equity"]
        peak=max(peak,equity)
        max_dd=min(max_dd,(equity/peak-1)*100)
        if ds["invested"] and bs["invested"]:
            both_exposed+=1
        if i>0:
            don_returns.append(ds["equity"]/prev_d-1 if prev_d else 0.0)
            bol_returns.append(bs["equity"]/prev_b-1 if prev_b else 0.0)
        prev_d=ds["equity"]; prev_b=bs["equity"]
        combined.append({"t":ds["t"],"equity":round(equity,6),
                         "donchian_invested":bool(ds["invested"]),
                         "bollinger_invested":bool(bs["invested"])})

    final=combined[-1]["equity"]
    don_full=simulate_donchian(bars4h,capital=total_capital,fee=fee,slippage=slippage)
    bol_full=simulate(bars4h,{
        "kind":"BOLLINGER","capital":total_capital,"fee":fee,"slippage":slippage,
        "bb_period":20,"bb_sigma":2
    })
    return {
        "schema":"seven.heaven.strategy_lab.btc_dual_mechanism_portfolio.v1",
        "status":"FIXED_50_50_DONCHIAN_BOLLINGER_NO_REBALANCING",
        "params":{"total_capital":total_capital,"sleeve_capital":sleeve,
                  "donchian":"55/20","bollinger":"20/2","timeframe":"4h",
                  "fee":fee,"slippage":slippage},
        "portfolio":{
            "equity_final":round(final,6),
            "return_pct":round(100*(final/total_capital-1),5),
            "max_drawdown_pct":round(max_dd,5),
            "fees_paid_usdt":round(don["results"]["fees_paid_usdt"]+bol["results"]["fees_paid_usdt"],6),
            "hypothetical_fills":don["results"]["hypothetical_fills"]+bol["results"]["hypothetical_fills"],
            "both_mechanisms_exposed_pct":round(100*both_exposed/len(bars4h),5),
            "sleeve_equity_return_correlation_4h":_pearson(don_returns,bol_returns),
        },
        "sleeves":{"DONCHIAN":don["results"],"BOLLINGER":bol["results"]},
        "references":{"DONCHIAN_100":don_full["results"],"BOLLINGER_100":bol_full["results"],"CASH_RETURN_PCT":0.0},
        "methodology":{"cross_sleeve_transfers":False,"periodic_rebalancing":False,
                       "weights_selected_after_result":False,
                       "donchian_parity_guard":True,"bollinger_parity_guard":True},
        "safety":{"paper_only":True,"orders_real":0,"workspace_writes":0},
    }
