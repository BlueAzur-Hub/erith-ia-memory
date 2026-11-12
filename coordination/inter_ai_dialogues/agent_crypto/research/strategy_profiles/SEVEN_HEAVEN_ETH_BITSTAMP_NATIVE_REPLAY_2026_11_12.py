#!/usr/bin/env python3
"""One-time read-only ETH/USD Bitstamp native daily EMA10/30 PAPER research.

Run from repository root: python coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_ETH_BITSTAMP_NATIVE_REPLAY_2026_11_12.py
Only public GET requests; no account credentials and no trading orders.
"""
from __future__ import annotations

import argparse
import csv
from datetime import datetime, timedelta, timezone
import hashlib
import io
import json
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

BASE = Path('coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles')
BENCH = BASE / 'SEVEN_HEAVEN_BTC_ETH_EQUAL_DATE_EMA_DUAL_PORTFOLIO_REPLAY_2026_11_12_EQUITY_DAILY.csv'
BENCH_SHA = 'c8ed2a206ea616ea87eeb83e31f7138d5b131588'
EVIDENCE = BASE / 'native_bitstamp_eth_2024_2026_evidence'
FIRST = '2023-04-01'
TEST_FIRST = '2024-01-01'
LAST = '2026-10-31'
EXPECTED_WARMUP = 275
EXPECTED_TEST = 1035
STEP = 86400
END_INITIAL = 1793491199  # 2026-10-31 23:59:59 UTC, a closed day
API_URL = 'https://www.bitstamp.net/api/v2/ohlc/ethusd/'


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def git_blob_sha(data):
    return hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()


def date_for_epoch(ts):
    value = datetime.fromtimestamp(int(ts), timezone.utc)
    if value.hour != 0 or value.minute != 0 or value.second != 0:
        raise ValueError(f'Not a UTC midnight daily candle: {ts}')
    return value.date().isoformat()


def parse_row(x):
    d = date_for_epoch(x['timestamp'])
    r = {'date': d, 'open': float(x['open']), 'high': float(x['high']),
         'low': float(x['low']), 'close': float(x['close']),
         'volume': float(x['volume'])}
    if (not all(float(r[k]) > 0 for k in ('open','high','low','close'))
        or r['volume'] < 0 or r['low'] > min(r['open'],r['close'])
        or r['high'] < max(r['open'],r['close'])):
        raise ValueError('Invalid native daily OHLCV: ' + d)
    return r


def collect():
    all_rows = {}
    request_log = []
    end = END_INITIAL
    for n in range(4):
        args = urlencode({'step': STEP, 'limit': 1000, 'end': end, 'exclude_current_candle':'true'})
        url = API_URL + '?' + args
        req = Request(url, headers={'User-Agent':'Seven-Heaven-Research-PAPER-ReadOnly/1.0',
                                     'Accept':'application/json'})
        with urlopen(req, timeout=35) as response:
            raw = response.read(1800000)
        data = json.loads(raw)
        if data.get('data', {}).get('pair', '').replace(' ','').upper() not in ('ETH/USD','ETHUSD'):
            raise ValueError('Unexpected Bitstamp pair in API response')
        page = data['data']['ohlc']
        if not page or len(page)>1000:
            raise ValueError('Invalid Bitstamp API page count')
        ts = [int(v['timestamp']) for v in page]
        for v in page:
            r=parse_row(v)
            if r['date'] in all_rows and all_rows[r['date']] != r:
                raise ValueError('Conflicting overlapping candles '+r['date'])
            all_rows[r['date']]=r
        low=min(ts)
        request_log.append({'end_requested_utc':datetime.fromtimestamp(end,timezone.utc).isoformat(),
             'received_rows':len(page),'first_returned_utc':date_for_epoch(low),
             'last_returned_utc':date_for_epoch(max(ts)),'api_response_sha256':sha256(raw)})
        if date_for_epoch(low) <= FIRST:
            break
        end = low - 1
    else:
        raise ValueError('Exhausted safe paging limit without reaching 2023-04-01')
    chosen=sorted((r for k,r in all_rows.items() if FIRST<=k<=LAST),key=lambda x:x['date'])
    validate_days(chosen)
    return chosen,request_log


def validate_days(rows):
    expected=EXPECTED_WARMUP+EXPECTED_TEST
    if len(rows)!=expected or rows[0]['date']!=FIRST or rows[-1]['date']!=LAST:
        raise ValueError(f'Incomplete native source: expected {expected} daily records, got {len(rows)}')
    for previous,r in zip(rows,rows[1:]):
        a=datetime.strptime(previous['date'],'%Y-%m-%d').date()
        b=datetime.strptime(r['date'],'%Y-%m-%d').date()
        if b-a != timedelta(days=1):
            raise ValueError('Gap or duplicate source day: '+r['date'])
        if not (0<r['low']<=min(r['open'],r['close'])<=max(r['open'],r['close'])<=r['high'] and r['volume']>=0):
            raise ValueError('Invalid OHLCV for '+r['date'])
    assert rows[EXPECTED_WARMUP]['date']==TEST_FIRST


def add_ema(rows):
    e10=e30=rows[0]['close']
    for i,r in enumerate(rows):
        if i:
            e10 += (2/11)*(r['close']-e10)
            e30 += (2/31)*(r['close']-e30)
        r['bull'] = bool(e10>e30 and r['close']>e30)
    return rows


def paper(rows,method,cost_factor=1):
    fee=.001*cost_factor
    slip=.0005*cost_factor
    cash,qty,peak,worst=1000.,0.,1000.,0.
    curve=[]
    trades=[]
    for i in range(EXPECTED_WARMUP,len(rows)):
        r=rows[i]
        want = rows[i-1]['bull'] if method=='EMA' else method=='HOLD'
        if want and qty==0 and cash>0:
            qty = cash*(1-fee)/(r['open']*(1+slip))
            cash=0.
            trades.append({'date':r['date'],'side':'BUY'})
        elif not want and qty>0 and method=='EMA':
            cash=qty*r['open']*(1-slip)*(1-fee)
            qty=0.
            trades.append({'date':r['date'],'side':'SELL'})
        equity=cash+qty*r['close']*(1-slip)*(1-fee)
        peak=max(peak,equity)
        worst=min(worst,100*(equity/peak-1))
        curve.append({'date':r['date'],'equity':equity,'exposed':int(qty>0)})
    return {'final_usd':round(curve[-1]['equity'],6),'return_pct':round(100*(curve[-1]['equity']/1000-1),6),
            'max_drawdown_pct':round(worst,6),'trades':len(trades),'exposed_days':sum(x['exposed'] for x in curve),
            'curve':curve, 'trade_dates':trades}


def read_benchmark(path):
    raw=path.read_bytes()
    if git_blob_sha(raw)!=BENCH_SHA:
        raise ValueError('Unrecognized Binance benchmark Git blob SHA-1')
    series=list(csv.DictReader(io.StringIO(raw.decode('utf-8'))))
    if len(series)!=EXPECTED_TEST or series[0]['date']!=TEST_FIRST or series[-1]['date']!=LAST:
        raise ValueError('Binance reference calendar mismatch')
    return series


def correlation(x,y):
    def mean(a): return sum(a)/len(a)
    def sd(a):
        mu=mean(a)
        return (sum((v-mu)**2 for v in a)/len(a))**0.5
    mu_x=mean(x);mu_y=mean(y)
    return sum((a-mu_x)*(b-mu_y) for a,b in zip(x,y))/len(x)/sd(x)/sd(y)


def export(rows,log,ref,output):
    output.mkdir(parents=True,exist_ok=True)
    add_ema(rows)
    sims={k:paper(rows,kind,factor) for k,kind,factor in
          [('EMA','EMA',1),('EMA_COST_X2','EMA',2),('HOLD','HOLD',1),('HOLD_COST_X2','HOLD',2)]}
    curve=sims['EMA']['curve']
    if len(curve)!=len(ref) or any(a['date']!=b['date'] for a,b in zip(curve,ref)):
        raise ValueError('Cross-source date mismatch')
    disagreements=[{'date':a['date'],'bitstamp_exposed':a['exposed'],'binance_exposed':int(b['eth_exposed'])}
        for a,b in zip(curve,ref) if a['exposed']!=int(b['eth_exposed'])]
    bitreturns=[rows[i]['close']/rows[i-1]['close']-1 for i in range(EXPECTED_WARMUP+1,len(rows))]
    binreturns=[float(ref[i]['eth_hold'])/float(ref[i-1]['eth_hold'])-1 for i in range(1,len(ref))]
    summary={
        'schema':'seven-heaven.bitstamp-eth-usd-daily-ema-native-v1',
        'instrument':'Bitstamp Spot ETH/USD; Binance Spot ETH/USDT benchmark',
        'status':'NATIVE_API_REPLAY_EXECUTED',
        'research_type':'retrospective_paper_only','orders_enabled':False,
        'source_api':API_URL,'api_retrieval_log':log,
        'warmup_utc':[FIRST,'2023-12-31'],'simulation_utc':[TEST_FIRST,LAST],
        'daily_source_count':len(rows),'test_days':len(curve),
        'source_sha256':None,'benchmark_git_blob_sha1':BENCH_SHA,
        'stats':{name:{k:v[k] for k in ('final_usd','return_pct','max_drawdown_pct','trades','exposed_days')}
                 for name,v in sims.items()},
        'comparison':{'daily_signal_agree':len(ref)-len(disagreements),
             'daily_signal_disagree':len(disagreements),'disagreement_dates':disagreements,
             'daily_return_correlation':round(correlation(bitreturns,binreturns),9),
             'daily_return_pairs':len(bitreturns)},
        'limitations':['Same 2024-2026 period previously investigated, not a new temporal holdout',
            'Bitstamp ETH/USD versus Binance ETH/USDT; USD and USDT are different quote assets',
            'Fixed costs and theoretical next-day open fills; no real orders',
            'Public API OHLC data is not cryptographically signed by Bitstamp']}
    csvbuf=io.StringIO()
    writer=csv.DictWriter(csvbuf,fieldnames=['date','open','high','low','close','volume'],lineterminator='\n')
    writer.writeheader();writer.writerows([{k:r[k] for k in writer.fieldnames} for r in rows])
    source_bytes=csvbuf.getvalue().encode('utf-8')
    summary['source_sha256']=sha256(source_bytes)
    (output/'bitstamp_ethusd_daily_2023_2026.csv').write_bytes(source_bytes)
    with (output/'eth_ema_binance_bitstamp_disagreements.csv').open('w',newline='',encoding='utf-8') as f:
        w=csv.DictWriter(f,fieldnames=['date','bitstamp_exposed','binance_exposed'],lineterminator='\n')
        w.writeheader();w.writerows(disagreements)
    (output/'eth_ema_bitstamp_native_proofs.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    report=['# Seven Heaven — Native Bitstamp ETH/USD replay','',
      '**État vérifié :** calcul PAPER rétrospectif sur API OHLC officielle Bitstamp ; aucun ordre réel.','',
      f"**Période :** {TEST_FIRST} à {LAST}, {len(curve)} jours ; EMA 10/30 figées.",'',
      '| Portefeuille fictif | Rendement net | Baisse max | Opérations |','|---|---:|---:|---:|']
    for label in ('EMA','EMA_COST_X2','HOLD','HOLD_COST_X2'):
        s=summary['stats'][label]
        report.append(f"| {label} | {s['return_pct']:+.2f} % | {s['max_drawdown_pct']:.2f} % | {s['trades']} |")
    report.extend(['',f"**Concordance des positions Binance :** {summary['comparison']['daily_signal_agree']}/{len(ref)} jours ; {len(disagreements)} désaccord(s).",
      f"**Corrélation des rendements quotidiens :** {summary['comparison']['daily_return_correlation']:.6f}.",'',
      '**Limites :** même passé déjà exploré, USD ≠ USDT, frais et ouvertures fictifs ; ni prévision, ni ordre réel.',
      'La liste exhaustive des désaccords et les horodatages des requêtes sont dans les fichiers CSV/JSON du même dossier.',''])
    (output/'SEVEN_HEAVEN_ETH_BITSTAMP_NATIVE_2024_2026_REPLAY_REPORT.md').write_text('\n'.join(report),encoding='utf-8')
    return summary


def selftest():
    assert git_blob_sha(b'hello')=='b6fc4c620b67d95f953a5c1c1230aaab5db5a1b0'
    assert date_for_epoch(1680307200)=='2023-04-01'
    example={'timestamp':'1680307200','open':'100','high':'104','low':'99','close':'102','volume':'1.5'}
    assert parse_row(example)['date']=='2023-04-01'
    try: parse_row({**example,'low':'103'})
    except ValueError: pass
    else: raise AssertionError('bad OHLC was accepted')
    assert round(correlation([1,2,3],[10,20,30]),6)==1.0
    print('PASS: SHA, UTC candle, invalid OHLC rejection, correlation')


def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--repo-root',type=Path,default=Path('.'))
    ap.add_argument('--output',type=Path)
    ap.add_argument('--selftest',action='store_true')
    args=ap.parse_args()
    if args.selftest: selftest();return
    rows,log=collect()
    bench=read_benchmark(args.repo_root/BENCH)
    out=args.output or args.repo_root/EVIDENCE
    doc=export(rows,log,bench,out)
    print(json.dumps({'status':doc['status'],'source_count':doc['daily_source_count'],
       'test_days':doc['test_days'],'signal_agree':doc['comparison']['daily_signal_agree'],
       'results':doc['stats']},indent=2))

if __name__=='__main__': main()
