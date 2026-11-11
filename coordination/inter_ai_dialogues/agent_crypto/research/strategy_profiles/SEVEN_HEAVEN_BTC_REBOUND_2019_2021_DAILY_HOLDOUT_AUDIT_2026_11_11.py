#!/usr/bin/env python3
"""Seven Heaven: frozen daily BTC/USDT rebound audit 2019--2021.

Replays reconciled Binance Spot BTCUSDT 1d data. 2021 is a designated
chronological holdout, not a tuning set. No orders or account access.
"""
from __future__ import annotations
import argparse, csv, datetime as dt, gzip, hashlib, json, math, statistics
from pathlib import Path

STEM = 'SEVEN_HEAVEN_BTC_REBOUND_2019_2021_DAILY_HOLDOUT_AUDIT_2026_11_11'
SOURCE_SHA256 = '812acb4a087cc43163760a6b397506bb7cb4bbcf8eca692fc686ef9f618b8bfd'
PROTOCOL_COMMIT = '2bd4c0d0b47d615471291eaa28b0726c3574010b'
FEE, SLIP = 0.001, 0.0005


def date(ms):
    return dt.datetime.fromtimestamp(ms / 1000, dt.timezone.utc).strftime('%Y-%m-%d')


def load(path):
    b = Path(path).read_bytes()
    assert hashlib.sha256(b).hexdigest() == SOURCE_SHA256, 'Gzip SHA256 mismatch'
    obj = json.loads(gzip.decompress(b))
    assert obj['pair'] == 'BTCUSDT' and obj['interval'] == '1d'
    assert obj['columns'] == ['open_time_ms','open','high','low','close','base_volume','quote_volume','trade_count']
    rows = obj['rows']
    assert len(rows) == 3075 and date(rows[0][0]) == '2018-05-01' and date(rows[-1][0]) == '2026-09-30'
    assert all(rows[i][0]-rows[i-1][0]==86400000 for i in range(1,len(rows))), 'Missing 1d dates'
    assert all(0 < r[3] <= min(r[1],r[4]) <= max(r[1],r[4]) <= r[2] and r[5]>=0 for r in rows)
    windows = {str(y):[r for r in rows if date(r[0])[:4] == str(y)] for y in (2019,2020,2021)}
    assert [len(windows[str(y)]) for y in (2019,2020,2021)] == [365,366,365]
    return windows, obj


def ema(values, length):
    a=2/(length+1);prev=None;out=[]
    for v in values:
        prev=v if prev is None else a*v+(1-a)*prev
        out.append(prev)
    return out


def events_candidates(rows, threshold=.025, cooldown=10):
    """Causal candidate rule, 30 UTC daily closes warmup per year."""
    out=[];last=-cooldown-100
    for i in range(30,len(rows)):
        peak=max(r[4] for r in rows[i-30:i]);prev=rows[i-1][4]
        if prev/peak-1 <= -threshold+1e-12 and rows[i][4] > prev and i-last>cooldown:
            out.append(i);last=i
    return out


def mark_return(buy_price, sell_close, costs=1):
    buyfac=(1-FEE*costs)/(1+SLIP*costs)
    sellfac=(1-FEE*costs)*(1-SLIP*costs)
    return 100*(buyfac*sellfac*sell_close/buy_price-1)


def summarize(rows):
    n=len(rows)
    if not n:return dict(n=0,win_count=0,win_rate_pct=None,mean_return_pct=None,median_return_pct=None,stress_mean_return_pct=None,wilson95_pct=None)
    wins=sum(x['net_j3_j10_pct']>0 for x in rows)
    mean=statistics.mean(x['net_j3_j10_pct'] for x in rows)
    rate=wins/n;z=1.96;den=1+z*z/n;cen=(rate+z*z/(2*n))/den;radius=z/den*math.sqrt(rate*(1-rate)/n+z*z/(4*n*n))
    return dict(n=n,win_count=wins,win_rate_pct=round(100*rate,2),
      mean_return_pct=round(mean,5),median_return_pct=round(statistics.median(x['net_j3_j10_pct'] for x in rows),5),
      stress_mean_return_pct=round(statistics.mean(x['stress_j3_j10_pct'] for x in rows),5),
      wilson95_pct=[round(100*(cen-radius),2),round(100*(cen+radius),2)])


def audit_year(year,rows):
    closes=[r[4] for r in rows];e10=ema(closes,10);e30=ema(closes,30)
    candidates=events_candidates(rows);legacy=events_candidates(rows,.05,21)
    out=[];checks=0
    for i in candidates:
        priorpeak=max(closes[i-30:i]);event={'year':year,'date_utc':date(rows[i][0]),'index':i,
            'prior_drawdown_pct':round(100*(closes[i-1]/priorpeak-1),5),
            'right_censored':i+10>=len(rows)}
        if not event['right_censored']:
            c3=all(closes[k]>closes[k-1] for k in (i,i+1,i+2))
            low3=all(rows[k][3]>rows[k-1][3] for k in (i,i+1,i+2))
            vol_avg=statistics.mean(rows[k][5] for k in range(i-18,i+2))
            vol=rows[i+2][5]>=vol_avg
            trend=e10[i+2]>e30[i+2] and closes[i+2]>e30[i+2]
            b1=rows[i+1][1];b3=rows[i+3][1];close10=rows[i+10][4]
            event.update(c3=c3,low3=low3,vol=vol,trend=trend,all_filters=c3 and low3 and vol and trend,
              volume_ratio=round(rows[i+2][5]/vol_avg,6) if vol_avg else None,
              open_j1=b1,open_j3=b3,close_j10=close10,
              net_c1_pct=round(mark_return(b1,close10),6),
              net_j3_j10_pct=round(mark_return(b3,close10),6),
              stress_j3_j10_pct=round(mark_return(b3,close10,2),6),
              delay_price_move_pct=round(100*(b3/b1-1),6),
              outcome='RISE_GE_3' if 100*(close10/b3-1)>=3 else 'FALL_LE_MINUS_3' if 100*(close10/b3-1)<=-3 else 'RANGE')
            assert event['vol']==(rows[i+2][5]>=statistics.mean(r[5] for r in rows[i-18:i+2]))
            assert event['net_j3_j10_pct']==round(mark_return(b3,close10),6)
            checks+=2
        out.append(event)
    scored=[r for r in out if not r['right_censored']]
    keys={'ALL':lambda r:True,'C3':lambda r:r['c3'],
      'C3_LOWS':lambda r:r['c3'] and r['low3'],
      'C3_VOLUME':lambda r:r['c3'] and r['vol'],
      'C3_EMA':lambda r:r['c3'] and r['trend'],
      'C3_ALL':lambda r:r['all_filters']}
    groups={name:summarize([r for r in scored if pred(r)]) for name,pred in keys.items()}
    incremental={}
    for feat in ('low3','vol','trend'):
        yes=[r for r in scored if r['c3'] and r[feat]]
        no=[r for r in scored if r['c3'] and not r[feat]]
        incremental[feat]={'yes':summarize(yes),'no':summarize(no),'estimable_both_ge5':len(yes)>=5 and len(no)>=5}
    # 9 prefix-invariance checks + 2 extra accounting checks for each event
    for j in (30,35,40,49,60,75,100,130,len(rows)-1):
        if j>=len(rows):continue
        assert events_candidates(rows[:j+1]) == [x for x in candidates if x<=j]
        checks+=1
    summary=dict(year=year,days=len(rows),candidates=len(out),evaluable=len(scored),censored=len(out)-len(scored),
        legacy_5pct_21d_candidates=len(legacy),groups=groups,incremental=incremental,
        c3_rejected_c1_winners=sum(not r['c3'] and r['net_c1_pct']>0 for r in scored),
        c3_rejected_c1_losers=sum(not r['c3'] and r['net_c1_pct']<=0 for r in scored),
        c3_confirmation_lag_median_pct=round(statistics.median(r['delay_price_move_pct'] for r in scored if r['c3']),5) if any(r['c3'] for r in scored) else None,
        assertions=checks)
    return summary,out


def main():
    a=argparse.ArgumentParser();a.add_argument('--daily-gzip',type=Path,required=True);a.add_argument('--output-dir',type=Path,default=Path('.'));args=a.parse_args()
    windows,source=load(args.daily_gzip)
    result={};events=[]
    for y,rows in windows.items():
        info,es=audit_year(y,rows);result[y]=info;events.extend(es)
    out=args.output_dir;out.mkdir(parents=True,exist_ok=True)
    proof=dict(schema='seven-heaven.btc-daily-2019-2021-holdout.v1',pair='BTCUSDT',period='2019-01-01 to 2021-12-31',
      source_sha256=SOURCE_SHA256,source_schema=source['schema'],source_interval='1d',
      native_1m_gap_warning=True,protocol_commit=PROTOCOL_COMMIT,
      discovery_years=[2019,2020],heldout_year=2021,
      costs={'fee_side':FEE,'slippage_side':SLIP,'stress_multiplier':2},
      source_days=3075,audited_days=1096,source_1d_reconciled=True,
      data_issues=['Mixed 1m-derived and native 1d recovered days; do not claim fully native 1m coverage',
      'Historical screening only; no prospective trading validation',
      'Episodes are isolated: mean return cannot be compounded'],by_year=result)
    (out/(STEM+'_PROOFS.json')).write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n')
    with (out/(STEM+'_EVENTS.csv')).open('w',newline='',encoding='utf-8') as f:
        fields=['year','date_utc','index','prior_drawdown_pct','right_censored','c3','low3','vol','trend','all_filters','volume_ratio','open_j1','open_j3','close_j10','net_c1_pct','net_j3_j10_pct','stress_j3_j10_pct','delay_price_move_pct','outcome'];w=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore');w.writeheader();w.writerows(events)
    for y,one in result.items():
        print(y,'events',one['candidates'],'scored',one['evaluable'],'C3',one['groups']['C3']['n'],'C3 win',one['groups']['C3']['win_count'],'checks',one['assertions'])
    print('Result files:',out/(STEM+'_PROOFS.json'),out/(STEM+'_EVENTS.csv'))


if __name__ == '__main__':main()
