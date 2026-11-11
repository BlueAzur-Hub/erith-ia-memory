#!/usr/bin/env python3
"""Causal month-ahead BTCUSDT market-regime policy research, PAPER ONLY.

Uses historical Binance 1m ZIPs given by the user, checked against the existing
Q1/2026 source registries. No real order / API / account access.
Regime computed ONLY using fully CLOSED prior UTC days. Policy executes at next
month open and stays unchanged until the next month; interim portfolio follows
monthly hypothetical grid or hold. No fitted indicator thresholds.
"""
from pathlib import Path
import importlib.util, hashlib, json, csv, math, sys
import numpy as np
from datetime import datetime, timezone

ROOT=Path(__file__).resolve().parent
Q1=ROOT/'SEVEN_HEAVEN_SPOT_GRID_BTC_2024_2025_Q1_CONTINUOUS_REPLAY_2026_11_11.py'
spec=importlib.util.spec_from_file_location('grid_source',Q1)
grid=importlib.util.module_from_spec(spec);spec.loader.exec_module(grid)
MONTHS={
 '2024':[f'2024-{i:02d}' for i in range(1,4)],
 '2025':[f'2025-{i:02d}' for i in range(1,4)],
 '2026':[f'2026-{i:02d}' for i in range(1,11)]
}
# Same authoritative 2026 source SHA-256 used by the original ten-month study.
SHA2026={
'2026-01':'d28b369da32a6ea84ba0af517b1847ab67b2fcc1e0e111c1b24d56ae07240cb9',
'2026-02':'cee2e913ed07e02834e2387c65ca430fe3576f620588bad8a02229238f385407',
'2026-03':'a2c1e689d39aa7877e218f436f15162e9a4436778a377d32e9d9b81b081381cd',
'2026-04':'318afd4f5acfbcfbb40fbe727a77eee8e9e7b54d8941589c78a32283d90b4a01',
'2026-05':'62983d93c35e26ec6c29116c629e443b7ddfe3d301aca83331ff58112199d8d0',
'2026-06':'c8e1d5e70b766dd2312fc9cd7085785bb25708e27e75c21a5a5aaba61a6d07f5',
'2026-07':'3ef15c84353da48e1c7c5fd99b9751cb036bf8986ed47f7cd1be63359c0d4f6b',
'2026-08':'acab442e02745177063031d402929703ae983715010064b40cf811c4beb843d4',
'2026-09':'7a021fb5981cfdb1a56457d68fa81360ab27350c981ddfe63112b2322df44b56',
'2026-10':'17168f260306752e39177a6c038bb8952f52bf08ff20e36d8da6068732621f1c',
}
fee=.001; slip=.0005
START=1000.
STEM='SEVEN_HEAVEN_EMA_SUPERTREND_VOLATILITY_GRID_HOLD_REGIME_STUDY_2026_11_11'

def getrows(month):
    if month in grid.EXPECTED:
        return grid.load_month(month)
    p=ROOT/f'BTCUSDT-1m-{month}.zip'
    assert p.exists(),f'missing {p}'
    digest=hashlib.sha256(p.read_bytes()).hexdigest()
    assert digest==SHA2026[month],f'SHA mismatch {month}'
    # Use the same exact parser and continuous minute checks as Q1 study.
    grid.EXPECTED[month]=(SHA2026[month],0)  # calendar-derived below
    import calendar
    y,m=map(int,month.split('-'))
    grid.EXPECTED[month]=(SHA2026[month],calendar.monthrange(y,m)[1]*1440)
    return grid.load_month(month)

def daily_candles(rows):
    assert rows.shape[0]%1440==0
    ar=rows.reshape(-1,1440,5)
    return np.column_stack((ar[:,0,0],ar[:,0,1],np.max(ar[:,:,2],axis=1),np.min(ar[:,:,3],axis=1),ar[:,-1,4]))

def lagged_features(d):
    n=len(d); close=d[:,4]; high=d[:,2]; low=d[:,3]
    ema10=np.full(n,np.nan);ema30=np.full(n,np.nan);atr=np.full(n,np.nan)
    a10=2/11;a30=2/31
    for i in range(n):
        ema10[i]=(a10*close[i]+(1-a10)*ema10[i-1]) if i else close[i]
        ema30[i]=(a30*close[i]+(1-a30)*ema30[i-1]) if i else close[i]
    tr=np.array([high[i]-low[i] if not i else max(high[i]-low[i],abs(high[i]-close[i-1]),abs(low[i]-close[i-1])) for i in range(n)])
    atr[13]=np.mean(tr[:14])
    for i in range(14,n): atr[i]=(atr[i-1]*13+tr[i])/14
    # Wilder ATR14 x 3; historical daily bands, no future observations.
    st=np.full(n,np.nan); upper=np.full(n,np.nan);lowerband=np.full(n,np.nan);trend=np.zeros(n,dtype=int)
    for i in range(13,n):
        mid=(high[i]+low[i])/2
        u=mid+3*atr[i];l=mid-3*atr[i]
        if i>13:
            u=u if (u<upper[i-1] or close[i-1]>upper[i-1]) else upper[i-1]
            l=l if (l>lowerband[i-1] or close[i-1]<lowerband[i-1]) else lowerband[i-1]
        upper[i]=u;lowerband[i]=l
        if i==13: trend[i]=1 if close[i]>=mid else -1
        elif trend[i-1]==1:trend[i]= -1 if close[i]<l else 1
        else:trend[i]=1 if close[i]>u else -1
        st[i]=l if trend[i]==1 else u
    return dict(ema10=ema10,ema30=ema30,atr_pct=100*atr/close,st_trend=trend,supertrend_value=st)

def policy_defs():
    return ['EMA10_30','SUPERTREND_ATR14_X3','EMA_ST_ATR5','GRID20_MONTHLY','GRID30_MONTHLY','HOLD50_MONTHLY','HOLD100_MONTHLY']

def decide(name,feat,prev_day_idx):
    if name in ('GRID20_MONTHLY','GRID30_MONTHLY','HOLD50_MONTHLY','HOLD100_MONTHLY'):
        return name.split('_MONTHLY')[0]
    if prev_day_idx < 29: return 'HOLD50'  # no 30 closed days: fixed, declared warmup fallback
    j=prev_day_idx
    ema_bull=bool(feat['ema10'][j]>feat['ema30'][j])
    # Requiring price above EMA30 is a secondary, predeclared condition.
    ema_bull=ema_bull and bool(feat['close'][j]>feat['ema30'][j])
    st_bull=bool(feat['st_trend'][j]>0)
    vol_high=bool(feat['atr_pct'][j]>5.0)
    if name=='EMA10_30':return 'HOLD100' if ema_bull else 'GRID20'
    if name=='SUPERTREND_ATR14_X3':return 'HOLD100' if st_bull else 'GRID20'
    if name=='EMA_ST_ATR5':return 'HOLD50' if vol_high else ('HOLD100' if ema_bull and st_bull else 'GRID20')
    raise ValueError(name)

def calc_month(rows,variant,mode=0,fee_mult=1):
    if variant.startswith('GRID'):
        width=.20 if variant=='GRID20' else .30
        res,daily=grid.replay(rows,width,mode,fee*fee_mult,slip*fee_mult,False,0,0)
    elif variant.startswith('HOLD'):
        exposure=.5 if variant=='HOLD50' else 1.
        res,daily=grid.replay_hold(rows,exposure,fee*fee_mult,slip*fee_mult)
    else:raise ValueError(variant)
    assert len(daily)==len(rows)//1440
    return res,daily

def main():
    sources=[];all_results={};daily_csv=[];monthly_decisions=[]
    for year,months in MONTHS.items():
        chunks=[];by_month=[];offset=0
        for month in months:
            r,meta=getrows(month);sources.append({k:meta[k] for k in ('month','sha256_verified','minute_candles_verified','timestamp_unit')});chunks.append(r)
            by_month.append((month,offset,offset+len(r)))
            offset+=len(r)
        allrows=np.concatenate(chunks)
        assert np.all(np.diff(allrows[:,0])==60000),f'gaps {year}'
        days=daily_candles(allrows);feats=lagged_features(days);feats['close']=days[:,4]
        cache={}
        for month,start,end in by_month:
            subset=allrows[start:end]
            for v in ('GRID20','GRID30','HOLD50','HOLD100'):
                for fm in (1,2):
                    for model in (0,1) if v.startswith('GRID') else (0,):
                        cache[(month,v,fm,model)]=calc_month(subset,v,mode=model,fee_mult=fm)
        allvariants=policy_defs()
        for name in allvariants:
            for fm in (1,2):
                for model in ('TOUCH','CLOSE'):
                    if name.startswith('HOLD') and model=='CLOSE':continue
                    capital=START;peak=START;dd=0;series=[];decisions=[];counts={};prev_cash=None;prev_btc=None;prev_close_wealth=None
                    for month,start,end in by_month:
                        firstday=start//1440
                        signal=firstday-1
                        variant=decide(name,feats,signal)
                        # Move the previous inventory to this month's actual opening price
                        # before liquidating/rebalancing. This accounts for overnight gap.
                        if prev_cash is not None:
                            opening=float(allrows[start,1])
                            capital=prev_cash+prev_btc*opening*(1-fee*fm)*(1-slip*fm)
                        entry_capital=capital
                        # Ensure no decision uses any current month close.
                        assert signal*1440+1439 < start
                        res,dayarr=cache[(month,variant,fm,1 if model=='CLOSE' and variant.startswith('GRID') else 0)]
                        each_factor=dayarr[:,0]/START
                        daily_value=entry_capital*each_factor
                        for row in daily_value:
                            peak=max(peak,float(row));dd=min(dd,100*(float(row)/peak-1))
                        capital=float(daily_value[-1])
                        prev_cash=float(res[9])*entry_capital/START
                        prev_btc=float(res[10])*entry_capital/START
                        series.extend(daily_value.tolist())
                        counts[variant]=counts.get(variant,0)+1
                        day_info={
                          'month':month,'used_strategy':variant,
                          'signal_close_utc':None if signal<0 else datetime.fromtimestamp(days[signal,0]/1000,timezone.utc).strftime('%Y-%m-%d 23:59Z'),
                          'prior_close':None if signal<0 else round(float(days[signal,4]),4),
                          'ema10':None if signal<29 else round(float(feats['ema10'][signal]),3),
                          'ema30':None if signal<29 else round(float(feats['ema30'][signal]),3),
                          'supertrend_bull':None if signal<29 else bool(feats['st_trend'][signal]>0),
                          'atr_pct':None if signal<29 else round(float(feats['atr_pct'][signal]),3),
                          'monthly_net_change_pct':round(100*(each_factor[-1]-1),4),
                          'capital_at_month_open':round(entry_capital,5),
                          'capital_end':round(capital,5),
                        }
                        decisions.append(day_info)
                    key=f'{year}::{name}::{model}::x{fm}'
                    all_results[key]={
                      'year':int(year),'method':name,'fill_model':model,'costs_multiplier':fm,
                      'final_equity_usdt':round(capital,6),'net_return_pct':round((capital/START-1)*100,4),
                      'max_daily_drawdown_pct':round(dd,4),'choices':counts,'monthly_decisions':decisions
                    }
                    if fm==1 and model=='TOUCH':
                        monthly_decisions += [{'year':year,'method':name,**m} for m in decisions]
                        for i,value in enumerate(series):
                            daily_csv.append((datetime.fromtimestamp(days[i,0]/1000,timezone.utc).strftime('%Y-%m-%d'),int(year),name,round(value,5)))
        # Continuous hold baseline (no monthly liquidation) and fixed grid for comparable context
        for variant in ('HOLD50','HOLD100','GRID20','GRID30'):
            for fm in (1,2):
                if variant.startswith('GRID'):
                    res,daily=grid.replay(allrows,.2 if variant=='GRID20' else .3,0,fee*fm,slip*fm,False,0,0)
                else:
                    res,daily=grid.replay_hold(allrows,.5 if variant=='HOLD50' else 1.,fee*fm,slip*fm)
                key=f'{year}::{variant}_CONTINUOUS::TOUCH::x{fm}'
                all_results[key]={
                  'year':int(year),'method':variant+'_CONTINUOUS','fill_model':'TOUCH','costs_multiplier':fm,
                  'final_equity_usdt':round(float(res[0]),6),'net_return_pct':round(float(res[1]),4),
                  'max_daily_drawdown_pct':round(float(res[2]),4)}
                if fm==1:
                    for i,value in enumerate(daily[:,0]): daily_csv.append((datetime.fromtimestamp(days[i,0]/1000,timezone.utc).strftime('%Y-%m-%d'),int(year),variant+'_CONTINUOUS',round(float(value),5)))
        print('REPLAY_OK',year,len(allrows),'minutes',flush=True)
    output={'schema':'seven.crypto.ema-supertrend-grid-hold-lagged-monthly-regime.v1',
            'research_date':'2026-11-11','provenance':'Original Binance Spot BTCUSDT 1m ZIPs, registry sha256 checks',
            'periods':{y:ms for y,ms in MONTHS.items()},'verified_sources':sources,
            'hypothetical_costs':{'fee_per_side':fee,'slippage_per_side':slip,'stress_multiplier':2},
            'signal_description':'30 completed UTC-day warmup, EMA10 > EMA30 and close > EMA30; Wilder ATR14; SuperTrend ATR14 multiplier 3; ATR% >5% considered high volatility; previous day close only; monthly choices at first UTC open',
            'initial_warmup':'HOLD50 for January before 30 complete prior daily candles',
            'monthly_grid':'grid +/-20% or +/-30%, 10 levels; 50% BTC, 50% cash at start of each chosen grid month; monthly liquidation/reallocation between policies; hypothesized fills',
            'not_execution_verified':True,'no_optimization_or_forward_prospective_claim':True,
            'results':all_results}
    (ROOT/(STEM+'_PROOFS.json')).write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    with (ROOT/(STEM+'_EQUITY_DAILY.csv')).open('w',newline='',encoding='utf-8') as f:
        w=csv.writer(f);w.writerow(('date_utc','year','method','equity_usdt'));w.writerows(daily_csv)
    with (ROOT/(STEM+'_MONTHLY_DECISIONS.csv')).open('w',newline='',encoding='utf-8') as f:
        keys=list(monthly_decisions[0]);w=csv.DictWriter(f,fieldnames=keys);w.writeheader();w.writerows(monthly_decisions)
    print('SUMMARY')
    for y in MONTHS:
        for m in ('EMA10_30','SUPERTREND_ATR14_X3','EMA_ST_ATR5','GRID20_MONTHLY','GRID30_MONTHLY','HOLD50_MONTHLY','HOLD100_MONTHLY','HOLD50_CONTINUOUS','HOLD100_CONTINUOUS','GRID20_CONTINUOUS','GRID30_CONTINUOUS'):
            key=f'{y}::{m}::TOUCH::x1'
            z=all_results[key];print(y,m,z['net_return_pct'],z['max_daily_drawdown_pct'],z.get('choices',{}),flush=True)
    print('OUTPUT',STEM)

if __name__=='__main__': main()
