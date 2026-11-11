#!/usr/bin/env python3
"""Seven Heaven — reproducible ETH/USDT EMA10/30 cross-asset PAPER replay.

Run from a checkout of https://github.com/BlueAzur-Hub/erith-ia-memory:
    python coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_ETH_EMA_CROSS_ASSET_2022_2024_2026_REPLAY_2026_11_12.py --repo-root . --outdir /tmp/eth_ema

Source: 5 verified gzip hourly shards of ETH/USDT, aggregated to UTC daily OHLCV.
No credentials, no orders, no network access, and no source archive modification.
"""
from __future__ import annotations
import argparse
import csv
import gzip
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

BASE = Path('public/agent_crypto_erith_ia/data/historical_archive_prototype/calendar_year_hourly_shards')
STEM = 'SEVEN_HEAVEN_ETH_EMA_CROSS_ASSET_2022_2024_2026_REPLAY_2026_11_12'
PROTOCOL = '46bf35f4392ad69088e45bd66843efcf929226b8'
HOUR = 3_600_000
DAY = 86_400_000
COLS = ['open_time_ms','open','high','low','close','base_volume','quote_volume','trade_count']
EXPECTED = {
    'ethereum-2022-span12-eeb3dbbe089f0d7d409918be1568fd4bc58ee6c11725f358cac7e65c408d40e0.json.gz': (2022, 8760),
    'ethereum-2023-span13-fec387cb9835e9679094b40dd1430b7ba75492b59b7a9e483a8bce8d0a982294.json.gz': (2023, 6600),
    'ethereum-2024-span13-12f5c738eac80ba281614e1f20fb42d3d255514a87bb1af90828a917e8133f4e.json.gz': (2024, 8784),
    'ethereum-2025-span13-a1abd476dd694759650799a51c6450c4614a085623b1b7c8e7a17b7ba4640ba6.json.gz': (2025, 8760),
    'ethereum-2026-span13-a9d1e5f3fb13b6a55fb0a28195f8eaee62f924a0245e0029ffb1de42d054ed64.json.gz': (2026, 7296),
}


def date(ms):
    return datetime.fromtimestamp(ms/1000,timezone.utc).date().isoformat()


def load(repo_root):
    source_dir = repo_root / BASE
    index = json.loads((source_dir/'index.json').read_text(encoding='utf-8'))
    asset = next(x for x in index['assets'] if x['id']=='ethereum')
    registry = {x['file']:x for x in asset['shards']}
    collections={}; proofs=[]
    for filename, (year, hours) in EXPECTED.items():
        raw = (source_dir/filename).read_bytes()
        digest = hashlib.sha256(raw).hexdigest()
        assert digest==filename.split('-')[-1].removesuffix('.json.gz'), (filename,digest)
        entry = registry[filename]
        assert digest == entry['sha256'] and hours == entry['hourly_count']
        document=json.loads(gzip.decompress(raw))
        assert document['asset_id']=='ethereum' and document['pair']=='ETHUSDT'
        assert document['interval']=='1h' and document['columns']==COLS
        assert len(document['series'])==hours
        assert document['first_open_ms']==entry['first_open_ms'] and document['last_open_ms']==entry['last_open_ms']
        rows=document['series']
        assert all(n[0]-p[0]==HOUR for p,n in zip(rows,rows[1:])), filename
        assert rows[0][0]==entry['first_open_ms'] and rows[-1][0]==entry['last_open_ms']
        collections[year]=rows
        proofs.append({'file':filename,'sha256_verified':digest,'hours':hours,'source_months':len(document['source_months'])})
    a=collections[2022]
    b=[*collections[2023],*collections[2024],*collections[2025],*collections[2026]]
    assert all(n[0]-p[0]==HOUR for p,n in zip(b,b[1:]))
    return a,b,proofs


def to_daily(hours):
    assert len(hours)%24==0
    daily=[]
    for i in range(0,len(hours),24):
        batch=hours[i:i+24]
        start=batch[0][0]
        assert start%DAY==0
        assert all(r[0]==start+k*HOUR for k,r in enumerate(batch))
        o=batch[0][1];c=batch[-1][4];hi=max(x[2] for x in batch);lo=min(x[3] for x in batch)
        vol=sum(x[5] for x in batch)
        assert lo>0 and lo<=min(o,c)<=max(o,c)<=hi and vol>0
        daily.append([start,o,hi,lo,c,vol])
    return daily


def signal(rows):
    fast=slow=rows[0][4]
    values=[]
    for i,row in enumerate(rows):
        c=row[4]
        if i:
            fast+=2/11*(c-fast)
            slow+=2/31*(c-slow)
        values.append(bool(fast>slow and c>slow))
    return values


def simulate(rows,sig,lo,hi,policy,mult):
    fee=.001*mult; slip=.0005*mult
    cash=1000.;qty=0.;peak=1000.;dd=0.;exposed=0;run=longest=0
    eq=[];trades=[]
    for i in range(lo,hi+1):
        ts,op,_,_,cl,_=rows[i]
        want=sig[i-1] if policy=='EMA' else policy in ('HOLD100','HOLD50')
        if policy=='HOLD50':
            if i==lo:
                budget=500.;qty=budget*(1-fee)/(op*(1+slip));cash-=budget
                trades.append({'date_utc':date(ts),'side':'BUY50','strategy':policy,'mult':mult,'reference_open':op,'qty_eth':qty,'cash_after':cash})
        elif want and qty==0 and cash>1e-9:
            qty=cash*(1-fee)/(op*(1+slip));cash=0
            trades.append({'date_utc':date(ts),'side':'BUY','strategy':policy,'mult':mult,'reference_open':op,'qty_eth':qty,'cash_after':cash})
        elif not want and qty>0 and policy=='EMA':
            cash+=qty*op*(1-slip)*(1-fee);qty=0
            trades.append({'date_utc':date(ts),'side':'SELL','strategy':policy,'mult':mult,'reference_open':op,'qty_eth':qty,'cash_after':cash})
        liquidatable=cash+qty*cl*(1-fee)*(1-slip)
        peak=max(peak,liquidatable)
        dd=min(dd,100*(liquidatable/peak-1))
        if qty>0:
            exposed+=1;run=0
        else:
            run+=1;longest=max(longest,run)
        eq.append({'date_utc':date(ts),'close':cl,'policy':policy,'mult':mult,'liquidatable_usdt':liquidatable,'cash_usdt':cash,'qty_eth':qty,'drawdown_running_pct':dd,'exposed':int(qty>0)})
    cap=eq[-1]['liquidatable_usdt']
    s={'capital_final_usdt':round(cap,6),'return_pct':round(100*(cap/1000-1),6),'max_drawdown_pct':round(dd,6),'trade_count':len(trades),'eth_exposure_pct':round(100*exposed/len(eq),6),'longest_cash_streak_days':longest,'days':len(eq)}
    return s,eq,trades


def output_csv(path,fields,rows):
    with path.open('w',newline='',encoding='utf-8') as f:
        writer=csv.DictWriter(f,fieldnames=fields)
        writer.writeheader();writer.writerows(rows)


def run(repo_root,outdir):
    a,b,sources=load(repo_root)
    a=to_daily(a);b=to_daily(b)
    assert len(a)==365 and len(b)==1310
    sigA=signal(a);sigB=signal(b)
    for rows,sig in [(a,sigA),(b,sigB)]:
        for k in (5,30,45,75,150,250,len(rows)):
            x=y=rows[0][4]
            for z in rows[1:k]:
                c=z[4];x+=2/11*(c-x);y+=2/31*(c-y)
            assert sig[k-1]==(x>y and rows[k-1][4]>y)
    periods={
        '2022_FEB_DEC':(a,sigA,'2022-02-01','2022-12-31'),
        '2024':(b,sigB,'2024-01-01','2024-12-31'),
        '2025':(b,sigB,'2025-01-01','2025-12-31'),
        '2026_JAN_OCT':(b,sigB,'2026-01-01','2026-10-31'),
        '2024_2026_CONTINUOUS':(b,sigB,'2024-01-01','2026-10-31')
    }
    results={};equity=[];alltrades=[]
    for key,(daily,sigs,start,end) in periods.items():
        where={date(r[0]):i for i,r in enumerate(daily)}
        lo,hi=where[start],where[end]
        assert lo>=1
        record={'start':start,'end':end,'days':hi-lo+1}
        for policy in ('EMA','HOLD100','HOLD50','CASH'):
            for mult in ((1,) if policy=='CASH' else (1,2)):
                s,d,t=simulate(daily,sigs,lo,hi,policy,mult)
                record[policy+'_cost'+str(mult)]=s
                if key in ('2022_FEB_DEC','2024_2026_CONTINUOUS'):
                    equity.extend({**x,'period':key} for x in d)
                    alltrades.extend({**x,'period':key} for x in t)
        results[key]=record
    proofs={
        'schema':'seven-heaven.eth-ema-cross-asset-2022-2026.v1',
        'date':'2026-11-12',
        'protocol_commit':PROTOCOL,
        'sources':sources,
        'rules':{'asset':'ETHUSDT Spot Binance','resolution':'1d UTC aggregated from verified hourly shards','fee_side':.001,'slip_side':.0005,'stress_multiplier':2,'signal':'EMA10(t)>EMA30(t) AND close(t)>EMA30(t)','action':'next UTC day opening t+1','portfolios':['EMA','HOLD100','HOLD50','CASH']},
        'integrity':{'hourly_shards':5,'total_hours':sum(x['hours'] for x in sources),'days_2022':len(a),'days_2023_apr_2026_oct':len(b),'all_hourly_contiguous_within_selected_segments':True,'daily_24_hour_complete':True,'causality_prefix_checks':14},
        'periods':results,
        'limits':['2018-2021 ETH shards discontinuous; no artificial annual fill','One hour OHLC is derived from Binance native 1m, not exchange fills','Historical only; no forecast or advice','BTC historical portfolio periods differ, direct percentage comparisons require date alignment','USDT is a counterparty exposure not modeled']
    }
    outdir.mkdir(parents=True,exist_ok=True)
    (outdir/(STEM+'_PROOFS.json')).write_text(json.dumps(proofs,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    output_csv(outdir/(STEM+'_EQUITY_DAILY.csv'),['period','date_utc','policy','mult','close','liquidatable_usdt','cash_usdt','qty_eth','drawdown_running_pct','exposed'],equity)
    output_csv(outdir/(STEM+'_TRADES.csv'),['period','date_utc','strategy','mult','side','reference_open','qty_eth','cash_after'],alltrades)
    return proofs


def selftest():
    from datetime import timedelta
    base=datetime(2022,1,1,tzinfo=timezone.utc)
    rows=[]
    for i in range(45):
        c=150-i if i<20 else 130+(i-20)*2
        ts=int((base+timedelta(days=i)).timestamp()*1000)
        rows.append([ts,c,c+1,c-1,c,12])
    sig=signal(rows)
    assert len(sig)==45 and not sig[0] and any(sig)
    a,eq,tx=simulate(rows,sig,31,44,'EMA',1)
    assert len(eq)==14 and a['trade_count'] == len(tx)
    assert all(x['liquidatable_usdt']>0 for x in eq)
    b,_,_=simulate(rows,sig,31,44,'HOLD50',1)
    assert b['trade_count']==1 and b['eth_exposure_pct']==100
    cash,_,_=simulate(rows,sig,31,44,'CASH',1)
    assert cash['return_pct']==0 and cash['trade_count']==0
    print('SELFTEST PASS — 45 synthetic days, causal EMA, 3 strategies, accounting')


def main():
    p=argparse.ArgumentParser()
    p.add_argument('--repo-root',type=Path,default=Path('.'))
    p.add_argument('--outdir',type=Path,default=Path('/tmp/seven_eth_ema'))
    p.add_argument('--selftest',action='store_true')
    p.add_argument('--check-proofs',type=Path,help='Optional comparison to public proof JSON')
    args=p.parse_args()
    if args.selftest:
        selftest();return
    proof=run(args.repo_root,args.outdir)
    if args.check_proofs:
        exp=json.loads(args.check_proofs.read_text(encoding='utf-8'))
        assert proof==exp,'Published proof JSON does not match replay'
        print('PROOF MATCH PASS')
    print(json.dumps({'source_sha':[(x['file'],x['sha256_verified']) for x in proof['sources']], 'results':{key:{p:v[p+'_cost1']['return_pct'] for p in ('EMA','HOLD100','HOLD50','CASH')} for key,v in proof['periods'].items()}},indent=2))

if __name__=='__main__':
    main()
