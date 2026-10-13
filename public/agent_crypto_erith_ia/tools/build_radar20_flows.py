#!/usr/bin/env python3
"""Create verified historical taker-flow derivatives for the original Radar 20.

Read canonical Top250 catalog + immutable monthly Binance release ZIPs. Never
modify price vault. No wallet, exchange API keys, orders, or live signal.
"""
from __future__ import annotations
import argparse
import calendar
from concurrent.futures import ThreadPoolExecutor, as_completed
import csv
import datetime as dt
import hashlib
import io
import json
import math
from pathlib import Path
import re
import statistics
import tempfile
import zipfile
from eth_flow_pilot import run_paper

HOME = Path(__file__).resolve().parents[1]
CATALOG = HOME/'data/historical_archive_prototype/top250_history_catalog/index.json'
SYMBOLS = ('ETH','SOL','XRP','ADA','LINK','AVAX','SUI','NEAR','UNI','AAVE',
           'LTC','BCH','DOT','HBAR','XLM','DOGE','PEPE','SHIB','APT','ARB')
MONTHS = ('2026-07','2026-08','2026-09')
THRESHOLDS = (.50,.55,.60,.65)
HOLD_HOURS = (12,48)
FEES = (.008,.012,.016)
SOURCE_MONTH = re.compile(r'^20\d{2}-(?:0[1-9]|1[0-2])$')
SOURCE_PAIR = re.compile(r'^[A-Z0-9]{2,40}USDT$')
SHA = re.compile(r'^[0-9a-f]{64}$')
COLUMNS = ['timestamp_ms','open_usdt','high_usdt','low_usdt','close_usdt',
           'volume_usdt','taker_buy_usdt','taker_sell_usdt','taker_buy_pct','trades']


def need(ok, why):
    if not ok: raise ValueError(why)


def write_json(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False)+'\n',encoding='utf8')


def sha256(raw): return hashlib.sha256(raw).hexdigest()


def source_inventory(catalog):
    need(catalog.get('schema')=='aerith.public.ohlcv.top250.monthly-coverage-catalog.v1', 'Unrecognized canonical catalog')
    need(catalog.get('ranked')==250 and catalog.get('quote')=='USDT', 'Catalog scope changed')
    assets=catalog.get('assets',[])
    need(len(assets)==250,'Incomplete Top250 catalog')
    sources=[]
    for symbol in SYMBOLS:
        candidates=[a for a in assets if a.get('symbol')==symbol]
        need(len(candidates)==1,f'Non-unique identity: {symbol}')
        item=candidates[0]
        for month in MONTHS:
            matches=[x for x in item.get('months',[]) if x.get('month')==month]
            need(len(matches)==1,f'Missing/duplicate source: {symbol} {month}')
            src=matches[0]
            pair=symbol+'USDT'
            need(SOURCE_PAIR.fullmatch(pair) and src.get('pair')==pair, f'Pair mismatch: {symbol} {month}')
            need(SOURCE_MONTH.fullmatch(month) and src.get('file')==f'{pair}-1m-{month}.zip', 'Unsafe source filename')
            need(SHA.fullmatch(src.get('sha256','')) is not None,'Missing source digest')
            year,mo=map(int,month.split('-'))
            need(src.get('candles')==calendar.monthrange(year,mo)[1]*1440,'Catalog source incomplete')
            release=src.get('release','')
            need(re.fullmatch(r'crypto-spot-bulk-(?:20\d{2}-(?:0[1-9]|1[0-2])-1m|add-20\d{2}-(?:0[1-9]|1[0-2])-1m-[a-f0-9]{12})',release) is not None,'Invalid release')
            sources.append(dict(asset_id=item['id'],symbol=symbol,pair=pair,month=month,
                                file=src['file'],sha256=src['sha256'],release=release,candles=src['candles']))
    need(len(sources)==60 and len({(x['pair'],x['month']) for x in sources})==60,'Radar 20 not complete')
    return sources


def parse_verified_zip(path, source):
    """Stream the 12 native Spot fields into full, contiguous hourly candles."""
    need(path.is_file() and 0<path.stat().st_size<=40_000_000,'Invalid source ZIP size')
    raw=path.read_bytes()
    need(sha256(raw)==source['sha256'],'ZIP checksum mismatch: '+source['file'])
    year,mo=map(int,source['month'].split('-'))
    start=int(dt.datetime(year,mo,1,tzinfo=dt.timezone.utc).timestamp()*1000)
    expected=calendar.monthrange(year,mo)[1]*1440
    hourly=[]; last_unit=None; count=0
    with zipfile.ZipFile(io.BytesIO(raw)) as z:
        csvname=source['file'][:-4]+'.csv'
        need(z.namelist()==[csvname],'Unexpected ZIP contents')
        info=z.getinfo(csvname)
        need(0<info.file_size<=160_000_000 and info.compress_size>0,'CSV size invalid')
        need(info.file_size<=max(info.compress_size*200,160_000),'ZIP bomb ratio')
        with z.open(csvname) as stream:
            for fields in csv.reader(io.TextIOWrapper(stream,encoding='utf-8-sig',newline='')):
                need(len(fields)==12,'Not 12-column Binance native Spot data')
                ms_raw=int(fields[0]);unit='us' if ms_raw>=10**15 else 'ms'
                if last_unit is None: last_unit=unit
                need(last_unit==unit,'Mixed time units')
                ms=ms_raw//1000 if unit=='us' else ms_raw
                need(count<expected and ms==start+count*60000,'Missing/duplicate/unaligned minute')
                close_raw=int(fields[6]);close_ms=close_raw//1000 if unit=='us' else close_raw
                need(ms<=close_ms<ms+60000,'Close timestamp invalid')
                op,hi,lo,cl,base,quote,buy_base,buy_quote=(float(fields[k]) for k in (1,2,3,4,5,7,9,10))
                need(all(map(math.isfinite,(op,hi,lo,cl,base,quote,buy_base,buy_quote))),'Nonfinite value')
                need(0<lo<=min(op,cl) and max(op,cl)<=hi,'Invalid OHLC')
                need(min(base,quote,buy_base,buy_quote)>=0,'Negative volume')
                tol=1e-7
                need(buy_quote<=quote+tol*max(quote,1) and buy_base<=base+tol*max(base,1),'Taker buy exceeds all trades')
                need((base==0)==(quote==0),'Contradictory volume')
                need(quote==0 or lo*(1-tol)<=quote/base<=hi*(1+tol),'Quote/base volume incompatible with prices')
                trades=int(fields[8]);need(trades>=0,'Negative trades')
                if count%60==0:
                    hourly.append(dict(timestamp_ms=ms,open=op,high=hi,low=lo,close=cl,
                                       quote_volume=0.,taker_buy_quote=0.,trades=0))
                h=hourly[-1]
                h['high']=max(h['high'],hi);h['low']=min(h['low'],lo);h['close']=cl
                h['quote_volume']+=quote;h['taker_buy_quote']+=buy_quote;h['trades']+=trades
                count+=1
    need(count==expected and len(hourly)==expected//60,'Month incomplete')
    for h in hourly:
        q=h['quote_volume'];b=h['taker_buy_quote']
        h['taker_buy_share']=b/q if q>0 else None
        h['taker_sell_quote']=q-b
        need(q>=0 and b>=0 and b<=q+1e-5,'Impossible hourly buy share')
    return hourly


def summarize(source,rows):
    total=sum(h['quote_volume'] for h in rows)
    buy=sum(h['taker_buy_quote'] for h in rows)
    active=[x['taker_buy_share'] for x in rows if x['taker_buy_share'] is not None]
    split=20*24
    experiments={}
    for threshold in THRESHOLDS:
        for duration in HOLD_HOURS:
            for fee in FEES:
                key=f'pressure_{int(threshold*100)}_hold_{duration}h_cost_{fee*100:.1f}pct'
                phases={}
                for label,start,end in [('train',0,split),('test',split,len(rows))]:
                    r=run_paper(rows,threshold=threshold,hold_hours=duration,start_hour=start,end_hour=end,fee_fraction=fee)
                    phases[label]={k:v for k,v in r.items() if k!='deals'}
                experiments[key]=phases
    packed=[]
    for h in rows:
        packed.append([h['timestamp_ms'],round(h['open'],8),round(h['high'],8),round(h['low'],8),
                       round(h['close'],8),round(h['quote_volume'],8),round(h['taker_buy_quote'],8),
                       round(h['taker_sell_quote'],8),round(100*h['taker_buy_share'],6) if h['taker_buy_share'] is not None else None,
                       h['trades']])
    return {'schema':'erith.trader.radar20.flows.monthly.v1','asset_id':source['asset_id'],
            'pair':source['pair'],'month':source['month'],'quote':'USDT','venue':'Binance Spot',
            'resolution':'1h','rows':packed,'columns':COLUMNS,'row_count':len(packed),
            'source':{'release':source['release'],'filename':source['file'],
                      'sha256':source['sha256'],'native_minutes_verified':source['candles']},
            'observed':{'quote_volume_usdt':round(total,5),'taker_buy_volume_usdt':round(buy,5),
                        'weighted_taker_buy_pct':round(100*buy/total,6) if total else None,
                        'hours_over_55pct':sum(x>=.55 for x in active),
                        'hours_over_60pct':sum(x>=.60 for x in active),
                        'hours_over_65pct':sum(x>=.65 for x in active)},
            'experiments':experiments,
            'method':{'train_first_days':20,'test_last_days':calendar.monthrange(*map(int,source['month'].split('-')))[1]-20,
                      'fees_roundtrip_pct':[.8,1.2,1.6], 'nominal_capital_usdt_per_independent_trial':400,
                      'position_usdt':100,'future_data_used':False,'slippage_model_validated':False,
                      'independent_monthly_trials_not_portfolio_backtest':True},
            'live':False,'strategy_certified':False,'orders_enabled':False}


def build(catalog_path:Path,out:Path,workers=4):
    from build_historical_shared_views import download_public_asset
    catalog=json.loads(catalog_path.read_text(encoding='utf8'))
    sources=source_inventory(catalog)
    out.mkdir(parents=True,exist_ok=True)
    index=[]
    def one(src):
        with tempfile.TemporaryDirectory(prefix='radar20-source-') as d:
            target=Path(d)/src['file']
            download_public_asset(src['release'],src['file'],target,40_000_000)
            rows=parse_verified_zip(target,src)
        payload=summarize(src,rows)
        path=out/src['pair']/f"{src['month']}.json"
        write_json(path,payload)
        return dict(pair=src['pair'],asset_id=src['asset_id'],month=src['month'],
                    path=f"{src['pair']}/{src['month']}.json",sha256=sha256(path.read_bytes()),
                    bytes=path.stat().st_size,hours=len(rows),source_zip_sha256=src['sha256'],
                    weighted_taker_buy_pct=payload['observed']['weighted_taker_buy_pct'])
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures={pool.submit(one,s):s for s in sources}
        for f in as_completed(futures):
            rec=f.result()  # FAIL CLOSED; workflow won't publish partial results.
            index.append(rec)
            print(f"VERIFIED {rec['pair']} {rec['month']} {rec['hours']} h",flush=True)
    index.sort(key=lambda x:(SYMBOLS.index(x['pair'][:-4]),x['month']))
    need(len(index)==60 and sum(x['hours'] for x in index)==sum(calendar.monthrange(2026,m)[1]*24*20 for m in (7,8,9)), 'Unexpected coverage')
    global_result={'schema':'erith.trader.radar20.flows.index.v1',
                   'markets':20,'months':list(MONTHS),'source':'Canonical historical Top250 release catalog',
                   'entries':index,'sample_size_warning':'60 independent monthly simulations are NOT one portfolio backtest',
                   'live':False,'strategy_certified':False,'orders_enabled':False}
    write_json(out/'index.json',global_result)
    return global_result


def main():
    p=argparse.ArgumentParser(description='Verified Radar20 / 60 immutable original archives / derived JSON')
    p.add_argument('--catalog',type=Path,default=CATALOG)
    p.add_argument('--out',type=Path,required=True)
    p.add_argument('--workers',type=int,default=4)
    a=p.parse_args(); need(1<=a.workers<=6,'Worker bound exceeded')
    result=build(a.catalog,a.out,a.workers)
    print(json.dumps({'status':'VERIFIED','assets':result['markets'],'months':len(result['months']),
                      'files':len(result['entries'])}))
if __name__=='__main__': main()