"""Descriptive mechanism/regime study for fixed Donchian 55/20 4h.

Research-only: no network, no workspace writes, no filtering, no optimization.
All candidate pre-entry variables are computed from the closed signal candle and
its past only. MFE/MAE/duration/PnL are retrospective labels for closed trades.
"""
from __future__ import annotations

import math
from statistics import median, pstdev

from src.engine import LabError
from tools.experimental_donchian import simulate_donchian


def _pearson(xs, ys):
    if len(xs) != len(ys) or len(xs) < 2:
        return None
    mx=sum(xs)/len(xs); my=sum(ys)/len(ys)
    dx=[x-mx for x in xs]; dy=[y-my for y in ys]
    den=math.sqrt(sum(x*x for x in dx)*sum(y*y for y in dy))
    if den == 0:
        return None
    return round(sum(x*y for x,y in zip(dx,dy))/den,6)


def _true_ranges(bars):
    out=[]
    prev_close=None
    for _,o,h,l,c,_ in bars:
        h=float(h); l=float(l); c=float(c)
        tr=(h-l if prev_close is None else max(h-l,abs(h-prev_close),abs(l-prev_close)))
        out.append(tr)
        prev_close=c
    return out


def _wilder_at(values, period, index):
    if index < period-1:
        return None
    seed=sum(values[:period])/period
    if index == period-1:
        return seed
    value=seed
    for i in range(period,index+1):
        value=((period-1)*value+values[i])/period
    return value


def _pre_entry_metrics(bars, signal_index):
    if signal_index < 55:
        raise LabError("Signal Donchian sans historique 55")
    signal_close=float(bars[signal_index][4])
    prior=bars[signal_index-55:signal_index]
    prior_high=max(float(b[2]) for b in prior)
    prior_low=min(float(b[3]) for b in prior)
    old_close=float(bars[signal_index-55][4])
    closes=[float(b[4]) for b in bars[signal_index-55:signal_index+1]]
    path=sum(abs(closes[i]-closes[i-1]) for i in range(1,len(closes)))
    efficiency=(abs(signal_close-old_close)/path if path>0 else 0.0)
    trs=_true_ranges(bars[:signal_index+1])
    atr20=_wilder_at(trs,20,signal_index)
    if atr20 is None:
        raise LabError("ATR20 indisponible au signal")
    return {
        "breakout_excess_pct": round((signal_close/prior_high-1)*100,6),
        "channel_width_pct": round((prior_high-prior_low)/signal_close*100,6),
        "directional_return_55_pct": round((signal_close/old_close-1)*100,6),
        "efficiency_ratio_55": round(efficiency,6),
        "atr20_relative_pct": round(atr20/signal_close*100,6),
    }


def _pair_closed_trades(bars, trades):
    by_ts={int(b[0]):i for i,b in enumerate(bars)}
    rows=[]
    opened=None
    for fill in trades:
        side=fill.get("side")
        if side=="BUY":
            if opened is not None:
                raise LabError("Donchian: achat imbriqué inattendu")
            opened=fill
            continue
        if side!="SELL":
            continue
        if opened is None:
            raise LabError("Donchian: vente sans achat")
        buy=opened
        opened=None
        qty=float(fill["qty"])
        if abs(qty-float(buy["qty"]))>1e-7:
            raise LabError("Donchian: quantité incohérente")
        entry_ts=int(buy["timestamp"]); exit_ts=int(fill["timestamp"])
        signal_ts=int(buy["signal_bar_open_utc"])
        if entry_ts not in by_ts or exit_ts not in by_ts or signal_ts not in by_ts:
            raise LabError("Donchian: timestamp hors série")
        i0=by_ts[entry_ts]; i1=by_ts[exit_ts]; si=by_ts[signal_ts]
        if not (si < i0 < i1):
            raise LabError("Donchian: ordre temporel incohérent")
        pre=_pre_entry_metrics(bars,si)
        entry=float(buy["price"]); exitp=float(fill["price"])
        entry_fee=float(buy["fee"]); exit_fee=float(fill["fee"])
        cost=qty*entry+entry_fee
        proceeds=qty*exitp-exit_fee
        pnl=proceeds-cost
        ret=100*pnl/cost if cost else 0.0
        # Exit fill occurs at exit candle OPEN: exclude its later high/low.
        held=bars[i0:i1]
        highs=[float(b[2]) for b in held]
        lows=[float(b[3]) for b in held]
        mfe=(max(highs)/entry-1)*100 if highs else 0.0
        mae=(min(lows)/entry-1)*100 if lows else 0.0
        rows.append({
            **pre,
            "entry_utc":entry_ts,
            "exit_utc":exit_ts,
            "duration_bars_4h":i1-i0,
            "duration_hours":round((exit_ts-entry_ts)/3600,3),
            "return_net_pct":round(ret,6),
            "pnl_net_usdt":round(pnl,6),
            "winner":pnl>1e-7,
            "mfe_pct":round(mfe,6),
            "mae_pct":round(mae,6),
        })
    return rows


def _med(rows,key):
    vals=[float(r[key]) for r in rows]
    return round(float(median(vals)),6) if vals else None


def _trade_group(rows):
    return {
        "trades":len(rows),
        "wins":sum(bool(r["winner"]) for r in rows),
        "losses":sum(not bool(r["winner"]) for r in rows),
        "median_return_net_pct":_med(rows,"return_net_pct"),
        "median_duration_bars_4h":_med(rows,"duration_bars_4h"),
        "median_breakout_excess_pct":_med(rows,"breakout_excess_pct"),
        "median_channel_width_pct":_med(rows,"channel_width_pct"),
        "median_directional_return_55_pct":_med(rows,"directional_return_55_pct"),
        "median_efficiency_ratio_55":_med(rows,"efficiency_ratio_55"),
        "median_atr20_relative_pct":_med(rows,"atr20_relative_pct"),
        "median_mfe_pct":_med(rows,"mfe_pct"),
        "median_mae_pct":_med(rows,"mae_pct"),
    }


def _annual_regime(bars,donchian_result):
    closes=[float(b[4]) for b in bars]
    first_open=float(bars[0][1]); last_close=closes[-1]
    log_returns=[math.log(closes[i]/closes[i-1]) for i in range(1,len(closes))]
    vol=pstdev(log_returns)*math.sqrt(6*365)*100 if log_returns else 0.0
    peak=closes[0]; dd=0.0
    for c in closes:
        peak=max(peak,c)
        dd=min(dd,(c/peak-1)*100)
    path=sum(abs(closes[i]-closes[i-1]) for i in range(1,len(closes)))
    annual_er=(abs(closes[-1]-closes[0])/path if path>0 else 0.0)
    above=0; eligible=0
    for i in range(199,len(closes)):
        sma=sum(closes[i-199:i+1])/200
        eligible+=1
        above+=closes[i]>sma
    r=donchian_result["results"]
    return {
        "underlying_return_pct":round((last_close/first_open-1)*100,6),
        "realized_vol_4h_annualized_pct":round(vol,6),
        "underlying_max_drawdown_pct":round(dd,6),
        "annual_efficiency_ratio":round(annual_er,6),
        "pct_closes_above_sma200_after_warmup":round(100*above/eligible,6) if eligible else None,
        "donchian_fills":r["hypothetical_fills"],
        "donchian_return_pct":r["return_pct"],
        "donchian_max_drawdown_pct":r["max_drawdown_pct"],
    }


def analyze_asset_year(symbol,year,bars4h,*,fee=0.001,slippage=0.0005):
    result=simulate_donchian(bars4h,fee=fee,slippage=slippage,entry_period=55,exit_period=20)
    rows=_pair_closed_trades(bars4h,result["trades"])
    for row in rows:
        row["symbol"]=symbol
        row["year"]=year
    return {
        "symbol":symbol,
        "year":year,
        "closed_trades":rows,
        "trade_summary":{
            "all":_trade_group(rows),
            "winners":_trade_group([r for r in rows if r["winner"]]),
            "losers":_trade_group([r for r in rows if not r["winner"]]),
        },
        "regime":_annual_regime(bars4h,result),
        "safety":result["safety"],
    }


def summarize(asset_year_reports):
    trades=[]
    regimes=[]
    by_window={}
    for report in asset_year_reports:
        key=f'{report["symbol"]}_{report["year"]}'
        by_window[key]={
            "trade_summary":report["trade_summary"],
            "regime":report["regime"],
        }
        trades.extend(report["closed_trades"])
        regimes.append(report["regime"])
    winners=[r for r in trades if r["winner"]]
    losers=[r for r in trades if not r["winner"]]
    regime_returns=[float(r["donchian_return_pct"]) for r in regimes]
    return {
        "schema":"seven.heaven.strategy_lab.donchian_mechanism_regime.v1",
        "status":"DESCRIPTIVE_POSTHOC_NO_FILTER_NO_OPTIMIZATION",
        "windows":len(asset_year_reports),
        "closed_trades":len(trades),
        "overall_trade_groups":{
            "all":_trade_group(trades),
            "winners":_trade_group(winners),
            "losers":_trade_group(losers),
        },
        "by_window":by_window,
        "descriptive_regime_correlations":{
            "underlying_return_vs_donchian_return":_pearson(
                [float(r["underlying_return_pct"]) for r in regimes],regime_returns),
            "realized_vol_vs_donchian_return":_pearson(
                [float(r["realized_vol_4h_annualized_pct"]) for r in regimes],regime_returns),
            "underlying_drawdown_vs_donchian_return":_pearson(
                [float(r["underlying_max_drawdown_pct"]) for r in regimes],regime_returns),
            "annual_efficiency_vs_donchian_return":_pearson(
                [float(r["annual_efficiency_ratio"]) for r in regimes],regime_returns),
            "pct_above_sma200_vs_donchian_return":_pearson(
                [float(r["pct_closes_above_sma200_after_warmup"]) for r in regimes],regime_returns),
        },
        "methodology":{
            "pre_entry_variables_causal":True,
            "mfe_mae_duration_retrospective_only":True,
            "threshold_search_performed":False,
            "classifier_trained":False,
            "runtime_integration":False,
        },
        "safety":{"paper_only":True,"orders_real":0,"workspace_writes":0},
    }
