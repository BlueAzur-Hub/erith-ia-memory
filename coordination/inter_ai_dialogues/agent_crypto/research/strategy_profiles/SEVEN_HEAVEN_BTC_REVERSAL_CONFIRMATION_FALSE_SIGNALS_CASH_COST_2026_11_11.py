#!/usr/bin/env python3
"""Seven Heaven | causal confirmation / cash whipsaw study (PAPER, no orders).
Replays 16 original SHA-checked Binance BTCUSDT 1m ZIP files from the Coffre.
Signal at UTC close D; assumed hypothetical trade at UTC open D+1.
No parameters selected on future outcomes; evaluation labels are ex post.
"""
import csv, json, datetime as dt, importlib.util
from pathlib import Path
import numpy as np

ROOT=Path(__file__).resolve().parent
STEM="SEVEN_HEAVEN_BTC_REVERSAL_CONFIRMATION_FALSE_SIGNALS_CASH_COST_2026_11_11"
SOURCE=ROOT/"SEVEN_HEAVEN_BTC_RSI_MACD_ADX_MARKET_REVERSAL_RESEARCH_2026_11_11.py"
spec=importlib.util.spec_from_file_location("seven_prior_rsi",SOURCE)
prior=importlib.util.module_from_spec(spec);spec.loader.exec_module(prior)
METHODS=("BUY_HOLD","EMA_RAW","EMA_CONFIRM_2D","ST_RAW","ST_CONFIRM_2D",
         "MACD_RAW","CONSENSUS_RAW","CONSENSUS_CONFIRM_2D",
         "CONSENSUS_FAST_EXIT_SLOW_ENTRY_1D_3D")
WARMUP=31

def day(ms):
    return dt.datetime.fromtimestamp(float(ms)/1000,dt.timezone.utc).strftime("%Y-%m-%d")

def confirmed(raw,needed_on,needed_off):
    """Causal streak counting: only already-closed days can alter a signal."""
    active=False;yes=0;no=0;out=[]
    for x in raw:
        if bool(x):yes+=1;no=0
        else:no+=1;yes=0
        if not active and yes>=needed_on:active=True
        elif active and no>=needed_off:active=False
        out.append(active)
    return np.array(out,dtype=bool)

def policy_states(bars):
    f=prior.indicators(bars);r=prior.states(bars,f)
    ema=r["EMA10_30"];st=r["SUPERTREND_ATR14_X3"];macd=r["MACD_12_26_9"]
    combined=r["TWO_OF_THREE"]
    return dict(BUY_HOLD=np.ones(len(bars),dtype=bool),EMA_RAW=ema,
                EMA_CONFIRM_2D=confirmed(ema,2,2),ST_RAW=st,
                ST_CONFIRM_2D=confirmed(st,2,2),MACD_RAW=macd,
                CONSENSUS_RAW=combined,CONSENSUS_CONFIRM_2D=confirmed(combined,2,2),
                CONSENSUS_FAST_EXIT_SLOW_ENTRY_1D_3D=confirmed(combined,3,1))

def cash_intervals(bars,portfolio):
    """Post-SELL windows explicitly separate from first pre-entry cash spell.
    Comparisons are gross BTC price changes, NOT additive profit amounts.
    Windows lasting past the data end are right-censored.
    """
    indices={day(x[0]):i for i,x in enumerate(bars)}
    cash_start=WARMUP;cash_price=float(bars[WARMUP,1])
    kind="INITIAL_NOT_ENTERED";exit_day=None;holding=False;out=[]
    for tr in portfolio["trade_ledger"]:
        idx=indices[tr["date_utc"]]
        if tr["side"]=="BUY":
            assert not holding
            n=idx-cash_start
            if n>0:
                change=100*(float(bars[idx,1])/cash_price-1)
                out.append(dict(kind=kind,start_day=day(bars[cash_start,0]),
                  end_day=day(bars[idx,0]),exit_day=exit_day,days=n,
                  start_price=cash_price,end_price=float(bars[idx,1]),
                  btc_price_change_pct=change,censored=False,
                  short_cash_whipsaw=kind=="AFTER_SELL" and n<=7,
                  short_cash_missed_rally=kind=="AFTER_SELL" and n<=7 and change>0))
            holding=True
        else:
            assert holding
            holding=False;cash_start=idx;cash_price=float(bars[idx,1])
            kind="AFTER_SELL";exit_day=tr["date_utc"]
    if not holding and len(bars)>cash_start:
        close=float(bars[-1,4])
        out.append(dict(kind=kind,start_day=day(bars[cash_start,0]),
          end_day=day(bars[-1,0]),exit_day=exit_day,
          days=len(bars)-cash_start,start_price=cash_price,end_price=close,
          btc_price_change_pct=100*(close/cash_price-1),censored=True,
          short_cash_whipsaw=False,short_cash_missed_rally=False))
    return out

def run():
    series,registry=prior.rev.read_all()  # ZIP SHA-256 and minute continuity verified
    result={};curve=[];windows_csv=[];checks_all=0
    for year,bars in series.items():
        state=policy_states(bars)
        checks=0
        for idx in (34,36,39,41,48,61,75,89,120,180,240,len(bars)-1):
            if idx>=len(bars):continue
            partial=policy_states(bars[:idx+1])
            for name in METHODS:
                assert bool(partial[name][-1])==bool(state[name][idx]),(year,name,idx)
                checks+=1
        assert confirmed([0,1,1,0,1,1,1,0,0],2,2).tolist()==[False,False,True,True,True,True,True,True,False]
        assert confirmed([0,1,1,0,1,1,1,0,0],3,1).tolist()==[False,False,False,False,False,False,True,False,False]
        checks+=2;checks_all+=checks
        strategies={};stress={}
        for name in METHODS:
            p=prior.simulate(bars,state[name])
            p2=prior.simulate(bars,state[name],2)
            windows=cash_intervals(bars,p)
            assert len(p["daily"])==len(bars)-WARMUP
            cash_days=sum(z["holding_btc"]==0 for z in p["daily"])
            assert sum(z["days"] for z in windows)==cash_days
            complete=[z for z in windows if z["kind"]=="AFTER_SELL" and not z["censored"]]
            sales=[z for z in windows if z["kind"]=="AFTER_SELL"]
            desc=dict(cash_days=cash_days,initial_cash_days=sum(z["days"] for z in windows if z["kind"]=="INITIAL_NOT_ENTERED"),
              post_sale_cash_days=sum(z["days"] for z in sales),
              short_cash_whipsaws_7d=sum(z["short_cash_whipsaw"] for z in complete),
              short_cash_whipsaws_and_missed_rise=sum(z["short_cash_missed_rally"] for z in complete),
              closed_cash_windows_ended_with_btc_rise=sum(z["btc_price_change_pct"]>0 for z in complete),
              closed_cash_windows_ended_with_btc_drop=sum(z["btc_price_change_pct"]<0 for z in complete),
              completed_cash_windows=len(complete),open_post_sale_windows=sum(z["censored"] for z in sales))
            strategies[name]={
               "net_return_pct":p["net_return_pct"],
               "final_equity_usdt":p["final_equity_usdt"],
               "max_close_to_close_drawdown_pct":p["max_close_to_close_drawdown_pct"],
               "total_trades":p["total_trades"],
               "exposure_days":p["exposure_days"],
               "cash_summary":desc,"trade_ledger":p["trade_ledger"]}
            stress[name]={"net_return_pct":p2["net_return_pct"],"final_equity_usdt":p2["final_equity_usdt"]}
            for r in p["daily"]:curve.append({"year":year,"strategy":name,**r})
            for w in windows:windows_csv.append({"year":year,"strategy":name,**w})
        result[year]={"sample_start":day(bars[WARMUP,0]),"sample_end":day(bars[-1,0]),
                      "trading_days":len(bars)-WARMUP,"causal_prefix_checks":checks,
                      "results":strategies,"stress_costs_x2":stress}
        print("PASS",year,"verified days",len(bars),"causal checks",checks)
    meta={"schema":"seven-heaven.btc-confirmation-whipsaw-cash-cost.v1",
        "date":"2026-11-11","research_only":True,"real_orders":False,
        "minute_bars_verified":sum(z["minute_candles_verified"] for z in registry),
        "registry":registry,"causal_checks":checks_all,
        "starting_capital_usdt":1000,"fee_side":.001,"slippage_side":.0005,
        "paper_entry":"day after completed UTC daily close, at next daily open",
        "cash_window_label":"post-sale to next buy, <=7 days short, price-rise status ex post only",
        "limitations":"Binance BTCUSDT, assumed next-open fills; no OKX book, no prospective validation",
        "by_period":result}
    (ROOT/(STEM+"_PROOFS.json")).write_text(json.dumps(meta,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    with (ROOT/(STEM+"_CASH_WINDOWS.csv")).open("w",newline="",encoding="utf-8") as f:
        cols=["year","strategy","kind","start_day","end_day","exit_day","days","start_price","end_price",
              "btc_price_change_pct","censored","short_cash_whipsaw","short_cash_missed_rally"]
        w=csv.DictWriter(f,fieldnames=cols);w.writeheader();w.writerows(windows_csv)
    with (ROOT/(STEM+"_EQUITY_DAILY.csv")).open("w",newline="",encoding="utf-8") as f:
        cols=["year","strategy","date_utc","equity_usdt","holding_btc"]
        w=csv.DictWriter(f,fieldnames=cols);w.writeheader();w.writerows(curve)
    print("COMPLETE",STEM,"source: 16 ZIPs; checks:",checks_all)

if __name__=="__main__":run()
