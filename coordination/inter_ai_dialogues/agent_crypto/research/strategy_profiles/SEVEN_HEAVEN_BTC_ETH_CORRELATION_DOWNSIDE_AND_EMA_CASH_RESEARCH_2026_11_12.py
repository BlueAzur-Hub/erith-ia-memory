#!/usr/bin/env python3
"""Seven Heaven: BTC/ETH correlation and downside analysis from fixed research CSV.
Read only; no exchange account, trading API or order. Requires Python 3.9+.
"""
import argparse
import csv
import hashlib
import io
import json
import math
from pathlib import Path
from urllib.request import urlopen

SOURCE_URL = ('https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/main/'
              'coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/'
              'SEVEN_HEAVEN_BTC_ETH_EQUAL_DATE_EMA_DUAL_PORTFOLIO_REPLAY_2026_11_12_EQUITY_DAILY.csv')
SOURCE_GIT_BLOB_SHA1 = 'c8ed2a206ea616ea87eeb83e31f7138d5b131588'
COLS = ('btc_ema','eth_ema','dual_ema','btc_hold','eth_hold','dual_hold','btc_exposed','eth_exposed')


def git_blob_sha1(data):
    return hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()


def load_csv(data, check_hash=True):
    if check_hash and git_blob_sha1(data) != SOURCE_GIT_BLOB_SHA1:
        raise ValueError('Source file differs from the pinned GitHub blob SHA-1')
    rows = []
    for r in csv.DictReader(io.StringIO(data.decode('utf-8-sig'))):
        rows.append({'date':r['date'], **{k:float(r[k]) for k in COLS}})
    if len(rows) != 1035 or rows[0]['date'] != '2024-01-01' or rows[-1]['date'] != '2026-10-31':
        raise ValueError('Wrong calendar coverage or row count')
    for i,r in enumerate(rows):
        if abs(r['dual_ema']-(r['btc_ema']+r['eth_ema'])/2)>0.000002:
            raise ValueError('EMA portfolio reconciliation failure at row '+str(i))
        if abs(r['dual_hold']-(r['btc_hold']+r['eth_hold'])/2)>0.000002:
            raise ValueError('Hold portfolio reconciliation failure at row '+str(i))
        if any(r[k]<=0 for k in COLS[:6]):
            raise ValueError('Nonpositive equity at row '+str(i))
    if len({r['date'] for r in rows})!=len(rows):
        raise ValueError('Duplicate date')
    return rows


def avg(a):
    return sum(a)/len(a)


def sd(a):
    m=avg(a)
    return math.sqrt(sum((x-m)**2 for x in a)/len(a))


def correlation(a,b):
    ma=avg(a); mb=avg(b)
    return sum((x-ma)*(y-mb) for x,y in zip(a,b))/len(a)/(sd(a)*sd(b))


def drawdown(rows,col):
    high=1000.0
    worst=0.0; when=None
    for r in rows:
        high=max(high,r[col])
        v=r[col]/high-1
        if v<worst:
            worst=v; when=r['date']
    return {'max_drawdown_pct':round(worst*100,3),'trough_date':when}


def summarize(rows):
    daily=[]
    for prev,curr in zip(rows,rows[1:]):
        daily.append({'date':curr['date'],'year':curr['date'][:4],
                      'btc':curr['btc_hold']/prev['btc_hold']-1,
                      'eth':curr['eth_hold']/prev['eth_hold']-1,
                      'hold':curr['dual_hold']/prev['dual_hold']-1,
                      'ema':curr['dual_ema']/prev['dual_ema']-1,
                      'btc_exposed':int(curr['btc_exposed']),
                      'eth_exposed':int(curr['eth_exposed'])})
    def by_group(a):
        both=[r for r in a if r['btc']<0 and r['eth']<0]
        btcdown=sum(r['btc']<0 for r in a)
        ethdown=sum(r['eth']<0 for r in a)
        return {'daily_return_pairs':len(a),
                'pearson_corr':round(correlation([r['btc'] for r in a],[r['eth'] for r in a]),6),
                'days_both_down':len(both), 'btc_down_days':btcdown, 'eth_down_days':ethdown,
                'both_down_given_btc_down_pct':round(len(both)/btcdown*100,2),
                'btc_daily_volatility_pct':round(sd([r['btc'] for r in a])*100,3),
                'eth_daily_volatility_pct':round(sd([r['eth'] for r in a])*100,3),
                'mixed_hold_daily_volatility_pct':round(sd([r['hold'] for r in a])*100,3),
                'mixed_ema_daily_volatility_pct':round(sd([r['ema'] for r in a])*100,3)}
    ordered=sorted(x['btc'] for x in daily)
    q05=ordered[math.floor(.05*(len(ordered)-1))]
    shock=[x for x in daily if x['btc']<=q05]
    return {'source_git_blob_sha1':SOURCE_GIT_BLOB_SHA1,'start':rows[0]['date'],
            'end':rows[-1]['date'],'equity_rows':len(rows),
            'statistics':{'all':by_group(daily),**{y:by_group([r for r in daily if r['year']==y])
                                                   for y in ('2024','2025','2026')}},
            'exposure_days':{'both_cash':sum(not r['btc_exposed'] and not r['eth_exposed'] for r in rows),
                             'both_exposed':sum(bool(r['btc_exposed']) and bool(r['eth_exposed']) for r in rows),
                             'btc_only':sum(bool(r['btc_exposed']) and not r['eth_exposed'] for r in rows),
                             'eth_only':sum(not r['btc_exposed'] and bool(r['eth_exposed']) for r in rows)},
            'max_drawdown':{k:drawdown(rows,k) for k in
                            ('btc_hold','eth_hold','dual_hold','btc_ema','eth_ema','dual_ema')},
            'worst_5pct_btc_days':{'threshold_pct':round(q05*100,3),'n':len(shock),
                                   'eth_down_days':sum(r['eth']<0 for r in shock),
                                   'average_eth_return_pct':round(avg([r['eth'] for r in shock])*100,3),
                                   'average_mixed_hold_return_pct':round(avg([r['hold'] for r in shock])*100,3)}}


def selftest():
    assert round(correlation([1,2,3], [2,4,6]),6)==1.0
    assert round(sd([1,1,1]),6)==0.0
    assert git_blob_sha1(b'hello')=='b6fc4c620b67d95f953a5c1c1230aaab5db5a1b0'
    print('Self-test OK: correlation, dispersion and Git blob hash')


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--csv',type=Path,help='Original GitHub CSV already downloaded')
    p.add_argument('--output',type=Path,help='Optional JSON destination')
    p.add_argument('--selftest',action='store_true')
    a=p.parse_args()
    if a.selftest:
        selftest(); return
    if a.csv:
        data=a.csv.read_bytes()
    else:
        with urlopen(SOURCE_URL,timeout=30) as f: data=f.read()
    result=summarize(load_csv(data))
    raw=json.dumps(result,ensure_ascii=False,indent=2)
    if a.output:
        a.output.write_text(raw+'\n',encoding='utf-8')
    print(raw)


if __name__=='__main__':
    main()
