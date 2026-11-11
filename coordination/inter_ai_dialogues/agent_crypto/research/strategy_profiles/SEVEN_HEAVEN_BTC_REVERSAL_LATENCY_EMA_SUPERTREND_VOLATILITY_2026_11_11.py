#!/usr/bin/env python3
"""Seven Heaven: causal daily reversal timing and hypothetical BTC/cash portfolio.

READ ONLY: checks SHA256 of 16 original Binance BTCUSDT 1m files supplied
by the user, reproduces daily OHLC from those exact minutes, uses a previous
closed UTC daily bar to schedule a hypothetical trade at next UTC day open.
Zero exchange API calls, zero actual orders or account use.

The 10% 30-day rolling drawdown events are evaluation labels, NOT future-known
signals. Parameters are fixed here before examining outcome in the report.

Dependency: numpy and preceding grid source/parser modules in same folder.
"""
import csv, datetime as dt, importlib.util, json, math
from pathlib import Path
import numpy as np

ROOT=Path(__file__).resolve().parent
STEM='SEVEN_HEAVEN_BTC_REVERSAL_LATENCY_EMA_SUPERTREND_VOLATILITY_2026_11_11'
SRC=ROOT/'SEVEN_HEAVEN_EMA_SUPERTREND_VOLATILITY_GRID_HOLD_REGIME_STUDY_2026_11_11.py'
sp=importlib.util.spec_from_file_location('seven_previous_causal',SRC)
prior=importlib.util.module_from_spec(sp)
sp.loader.exec_module(prior)
MONTHS=prior.MONTHS
FEE=.001; SLIP=.0005; START=1000.; FIRST_DAY_IDX=31
POLICIES=('HOLD_BTC','EMA10_30','SUPERTREND_ATR14_X3','ATR14_PCT5_RISKOFF','DRAWDOWN30_10_5')


def day_utc(ms):return dt.datetime.fromtimestamp(ms/1000,dt.timezone.utc).strftime('%Y-%m-%d')


def rolling30_drawdown(daily):
    close=daily[:,4];hi=np.full(len(close),np.nan);dd=np.full(len(close),np.nan)
    for i in range(29,len(close)):
        hi[i]=np.max(close[i-29:i+1]);dd[i]=100*(close[i]/hi[i]-1)
    return hi,dd


def policy_states(feats, daily, rolling_dd):
    close=daily[:,4];n=len(daily)
    ema=(feats['ema10']>feats['ema30']) & (close>feats['ema30'])
    st=feats['st_trend']>0
    vol=feats['atr_pct']<=5.0
    trail=np.zeros(n,dtype=bool);active=True
    for i in range(29,n):
        # 10% stop, rearm on recovery to less than 5% drawdown from
        # rolling 30-day closing peak. Uses close through i only.
        if active and rolling_dd[i]<=-10:active=False
        elif not active and rolling_dd[i]>=-5:active=True
        trail[i]=active
    return {'HOLD_BTC':np.ones(n,dtype=bool),
            'EMA10_30':ema,'SUPERTREND_ATR14_X3':st,
            'ATR14_PCT5_RISKOFF':vol,'DRAWDOWN30_10_5':trail}


def simulate(daily,signal,fee_mult=1):
    assert len(daily)==len(signal)
    n=len(daily);buyfac=(1-FEE*fee_mult)/(1+SLIP*fee_mult)
    sellfac=(1-FEE*fee_mult)*(1-SLIP*fee_mult)
    cash=START;btc=0.;peak=START;worst_dd=0.;trade_log=[];equity=[];exposure_days=0
    for i in range(FIRST_DAY_IDX,n):
        # Only yesterday's closed candle can trigger today open execution.
        yesterday=i-1
        desired=bool(signal[yesterday]);opening=float(daily[i,1]);closing=float(daily[i,4])
        if desired and btc==0.:
            btc=cash*buyfac/opening
            trade_log.append({'date_utc':day_utc(daily[i,0]),'type':'BUY','price_usdt':round(opening,4),
                              'signal_day_utc':day_utc(daily[yesterday,0])})
            cash=0.
        if (not desired) and btc>0.:
            cash=btc*opening*sellfac
            trade_log.append({'date_utc':day_utc(daily[i,0]),'type':'SELL','price_usdt':round(opening,4),
                              'signal_day_utc':day_utc(daily[yesterday,0])})
            btc=0.
        if btc>0:exposure_days+=1
        net=cash+btc*closing*sellfac
        peak=max(peak,net);worst_dd=min(worst_dd,100*(net/peak-1))
        equity.append({'date_utc':day_utc(daily[i,0]),'equity_usdt':round(net,6),
                       'exposed_btc':int(btc>0),'position_btc':round(btc,10),
                       'cash_usdt':round(cash,6),'signal_day':day_utc(daily[yesterday,0])})
    final=equity[-1]['equity_usdt']
    return {'final_equity_usdt':round(final,5),'net_return_pct':round(100*(final/START-1),4),
            'max_daily_drawdown_pct':round(worst_dd,4),
            'buy_count':sum(x['type']=='BUY' for x in trade_log),
            'sell_count':sum(x['type']=='SELL' for x in trade_log),
            'exposed_days':exposure_days,'days':len(equity),
            'transaction_log':trade_log,'equity_daily':equity}


def drawdown_events(daily,rolling_dd,states,portfolios):
    # Non-overlapping drawdown *episodes*, hysteresis from -10% to -5%.
    # Re-entry of risk episode after recovery only. Labels retrospectively
    # analyze causal stop thresholds and DO NOT enter indicator features.
    close=daily[:,4];events=[];armed=True
    n=len(close)
    for i in range(FIRST_DAY_IDX,n):
        if armed and rolling_dd[i]<=-10.0:
            peak_start=max(0,i-29);peak_idx=peak_start+int(np.argmax(close[peak_start:i+1]))
            ev={'threshold_day_utc':day_utc(daily[i,0]),
                'trailing_peak_day_utc':day_utc(daily[peak_idx,0]),
                'trailing_peak_close_usdt':round(float(close[peak_idx]),4),
                'threshold_close_usdt':round(float(close[i]),4),
                'threshold_drawdown_pct':round(float(rolling_dd[i]),4),
                'days_from_peak_to_threshold':int(i-peak_idx),
                'signals':{}}
            for name in ('EMA10_30','SUPERTREND_ATR14_X3','ATR14_PCT5_RISKOFF'):
                v=states[name]
                before_sales=[t['date_utc'] for t in portfolios[name]['transaction_log'] if t['type']=='SELL' and t['date_utc']<=ev['threshold_day_utc']]
                if not bool(v[i]):
                    ev['signals'][name]={'already_risk_off_at_threshold_close':True,
                       'days_after_threshold_to_next_off_signal':0,
                       'last_actual_simulated_sell_before_or_on_threshold':before_sales[-1] if before_sales else None,
                       'not_holding_btc_at_threshold_day_close':not bool(portfolios[name]['equity_daily'][i-FIRST_DAY_IDX]['exposed_btc'])}
                else:
                    flip=next((j for j in range(i+1,min(n,i+31)) if not bool(v[j])),None)
                    ev['signals'][name]={'already_risk_off_at_threshold_close':False,
                      'days_after_threshold_to_next_off_signal':None if flip is None else flip-i,
                      'next_hypothetical_sell_day_utc':day_utc(daily[flip+1,0]) if flip is not None and flip+1<n else None,
                      'change_from_threshold_to_signal_close_pct':None if flip is None else round(100*(close[flip]/close[i]-1),3),
                      'observation_right_censored':flip is None and i+30>=n}
            events.append(ev);armed=False
        elif not armed and rolling_dd[i]>-5.0:armed=True
    return events


def delayed_exit_case(daily,states,portfolio,reference_date):
    dates=[day_utc(x) for x in daily[:,0]]
    if reference_date not in dates:return None
    idx=dates.index(reference_date)
    result={'reference_day':reference_date,'reference_close_usdt':float(daily[idx,4])}
    for name in ('EMA10_30','SUPERTREND_ATR14_X3','ATR14_PCT5_RISKOFF'):
        current=bool(states[name][idx]);next_idx=next((j for j in range(idx,len(daily)) if not states[name][j]),None)
        sale_idx=next_idx+1 if next_idx is not None and next_idx+1<len(daily) else None
        result[name]={'long_on_reference_close':current,
          'first_risk_off_day_on_or_after_reference':None if next_idx is None else dates[next_idx],
          'earliest_risk_off_execution_day':None if sale_idx is None else dates[sale_idx],
          'open_price_usdt_at_execution':None if sale_idx is None else float(daily[sale_idx,1]),
          'change_vs_reference_close_pct':None if sale_idx is None else round(100*(daily[sale_idx,1]/daily[idx,4]-1),4),
          'actual_sells_in_window': [x for x in portfolio[name]['transaction_log'] if x['type']=='SELL' and x['date_utc']>=reference_date][:3]}
    return result


def prefix_invariance(daily):
    # Recalculate indicators from a prefix to prove the full-series vector
    # does not use any future day's price to determine any earlier day's state.
    feats=prior.lagged_features(daily)
    _,dd=rolling30_drawdown(daily)
    full=policy_states(feats,daily,dd)
    indexes=sorted(set([29,30,45,59,89,120,240,len(daily)-1]))
    ntests=0
    for k in indexes:
        if k>=len(daily):continue
        d=daily[:k+1]
        small=prior.lagged_features(d)
        _,dd_small=rolling30_drawdown(d)
        pre=policy_states(small,d,dd_small)
        for name in POLICIES:
            assert bool(pre[name][k])==bool(full[name][k]),(name,k)
            ntests+=1
        for field in ('ema10','ema30','atr_pct'):
            a=small[field][-1];b=feats[field][k]
            assert (np.isnan(a) and np.isnan(b)) or abs(a-b)<1e-8,(field,k)
            ntests+=1
    return ntests


def read_all():
    found={};sources=[]
    for y,months in MONTHS.items():
        chunks=[]
        for month in months:
            arr,meta=prior.getrows(month)
            chunks.append(arr)
            sources.append({k:meta[k] for k in ('month','sha256_verified','minute_candles_verified','timestamp_unit')})
        whole=np.concatenate(chunks)
        assert np.all(np.diff(whole[:,0])==60000),f'data gap {y}'
        found[y]=prior.daily_candles(whole)
    assert sum(x['minute_candles_verified'] for x in sources)==698400
    return found,sources


def main():
    series,sources=read_all();by_year={};rows_csv=[];events_csv=[]
    for year,daily in series.items():
        feats=prior.lagged_features(daily);_,rolling_dd=rolling30_drawdown(daily)
        states=policy_states(feats,daily,rolling_dd)
        checks=prefix_invariance(daily)
        portfolios={name:simulate(daily,states[name],1) for name in POLICIES}
        stress={name:simulate(daily,states[name],2) for name in POLICIES}
        events=drawdown_events(daily,rolling_dd,states,portfolios)
        case=delayed_exit_case(daily,states,portfolios,'2025-02-01' if year=='2025' else '2026-05-01')
        for name,p in portfolios.items():
            for d in p['equity_daily']:
                rows_csv.append({'year':year,'policy':name,**d})
        for e in events:events_csv.append({'year':year,**{k:v for k,v in e.items() if k!='signals'},
                                          **{f'{name}_riskoff':e['signals'][name]['already_risk_off_at_threshold_close'] for name in ('EMA10_30','SUPERTREND_ATR14_X3','ATR14_PCT5_RISKOFF')}})
        by_year[year]={'start_date_utc':day_utc(daily[FIRST_DAY_IDX,0]),
            'end_date_utc':day_utc(daily[-1,0]),
            'trading_days':len(daily)-FIRST_DAY_IDX,'prefix_causality_assertions':checks,
            'results':{name:{k:v for k,v in p.items() if k!='equity_daily'} for name,p in portfolios.items()},
            'stress_results':{name:{k:v for k,v in p.items() if k not in ('equity_daily','transaction_log')} for name,p in stress.items()},
            'drawdown_events':events,'focused_case':case}
        print(year, 'months',len(MONTHS[year]),'prefix_asserts',checks,'events',len(events),flush=True)
        for name in POLICIES:
            p=portfolios[name]
            print('  ',name,'return',p['net_return_pct'],'max_dd',p['max_daily_drawdown_pct'],'buys',p['buy_count'],'sells',p['sell_count'],flush=True)
    out={'schema':'seven.heaven.crypto.reversal-latency-daily-2026-11-11.v1',
        'research_date':'2026-11-11','source':'Binance Spot BTCUSDT original user ZIPs; SHA256 and 1m continuity verified',
        'all_verified_sources':sources,'total_verified_minutes':sum(z['minute_candles_verified'] for z in sources),
        'signal_rule':'A day D closes and indicators evaluate using only the OHLC through D; hypothetical fills occur at D+1 UTC open',
        'period_warmup':'January daily candles are used for indicators; start paper portfolios on Feb 1 UTC open of each period with fresh 1000 USDT',
        'policies':{'EMA10_30':'Long BTC if EMA10>EMA30 AND close>EMA30, else cash',
            'SUPERTREND_ATR14_X3':'Long BTC if SuperTrend direction from existing canonical study is bullish, else cash',
            'ATR14_PCT5_RISKOFF':'Long BTC if Wilder ATR14 / close <=5%, else cash; ATR is not direction-sensitive',
            'DRAWDOWN30_10_5':'Causal 30d rolling high close; exit BTC when close drawdown reaches 10%, reenter when recovery improves above -5%',
            'HOLD_BTC':'Buy BTC at Feb 1 UTC open and keep through period end'},
        'execution_assumptions':{'fee_per_side':FEE,'slippage_per_side':SLIP,'stress_cost_multiplier':2,'no_live_orders':True},
        'event_definition':'A first 10% daily-close drawdown from 30d rolling peak, next event only after recovery above -5%; labels are retrospective evaluation not future trading inputs',
        'not_forecasting_or_certified_execution':True,'years':by_year}
    (ROOT/(STEM+'_PROOFS.json')).write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    with (ROOT/(STEM+'_EQUITY_DAILY.csv')).open('w',newline='',encoding='utf-8') as f:
        w=csv.DictWriter(f,fieldnames=['year','policy','date_utc','equity_usdt','exposed_btc','position_btc','cash_usdt','signal_day']);w.writeheader();w.writerows(rows_csv)
    with (ROOT/(STEM+'_DRAWDOWN_EVENTS.csv')).open('w',newline='',encoding='utf-8') as f:
        if events_csv:
            w=csv.DictWriter(f,fieldnames=list(events_csv[0]));w.writeheader();w.writerows(events_csv)
    print('RESEARCH_COMPLETE',STEM,flush=True)

if __name__=='__main__':main()
