#!/usr/bin/env python3
"""Read-only audit of anomalous Binance BTCUSDT 1m source close timestamps.

Original official ZIP + CHECKSUM first, no invented OHLCV, never publishes.
Used to distinguish authentic source-time peculiarities from malformed data.
"""
from __future__ import annotations
import argparse
import csv
from datetime import datetime,timezone
import hashlib
import io
import json
from pathlib import Path
import zipfile

import import_historical_bulk as bulk


def check(raw,expected,month):
    digest=hashlib.sha256(raw).hexdigest()
    if digest!=expected.lower():
        raise ValueError('Official Binance SHA-256 does not match')
    first,count,end=bulk.bounds(month,'1m')
    expected_csv='BTCUSDT-1m-'+month+'.csv'
    total=0
    invalid_closes=[]
    invalid_close_count=0
    gaps=[]
    previous=None
    with zipfile.ZipFile(io.BytesIO(raw)) as archive:
        if archive.namelist()!=[expected_csv]:
            raise ValueError('Unexpected Binance source member')
        with archive.open(expected_csv) as stream:
            for row in csv.reader(io.TextIOWrapper(stream,encoding='utf-8-sig',newline='')):
                if len(row)!=12:
                    raise ValueError('Unexpected Binance column count')
                stamp=int(row[0])
                unit='us' if stamp>=10**15 else 'ms'
                t=stamp//1000 if unit=='us' else stamp
                end_t=int(row[6])
                end_t=end_t//1000 if unit=='us' else end_t
                if t<first or t>=end or (t-first)%60000:
                    raise ValueError('Open time not aligned in official source month')
                if previous is not None and t<=previous:
                    raise ValueError('Out-of-order or duplicate minute')
                predecessor=first if previous is None else previous+60000
                if t>predecessor:
                    gaps.append({'start_ms':predecessor,
                                 'end_ms_exclusive':t,
                                 'minutes':(t-predecessor)//60000})
                if not t<=end_t<t+60000:
                    invalid_close_count+=1
                    record={'open_time_utc':datetime.fromtimestamp(
                         t/1000,timezone.utc).isoformat(),
                         'open_ms':t,'close_ms':end_t,'difference_ms':end_t-t}
                    if len(invalid_closes)<10:invalid_closes.append(record)
                previous=t
                total+=1
    if previous is None:raise ValueError('No BTC candles in official ZIP')
    if previous+60000<end:
        gaps.append({'start_ms':previous+60000,
                     'end_ms_exclusive':end,
                     'minutes':(end-previous-60000)//60000})
    return {'source':'Binance Spot original native BTCUSDT 1m ZIP',
            'quote':'USDT','month':month,
            'source_zip_sha256':digest,'calendar_minutes':count,
            'native_rows':total,
            'missing_minutes':sum(v['minutes'] for v in gaps),
            'timestamp_close_anomaly_examples':invalid_closes,
            'close_timestamp_anomaly_count':invalid_close_count,
            'anomaly_example_count':len(invalid_closes),
            'requires_manual_source_review':invalid_close_count>0,
            'source_original_saved_by_probe':False}


def main():
    p=argparse.ArgumentParser()
    p.add_argument('--month',default='2020-12')
    args=p.parse_args()
    if args.month!='2020-12':
        raise ValueError('This limited forensic probe is only for 2020-12')
    name,url=bulk.url_for('BTCUSDT',args.month,'1m')
    raw=bulk.download(url)
    signature=bulk.download(url+'.CHECKSUM',cap=8192).decode('utf-8').split()[0]
    report=check(raw,signature,args.month)
    print('BTC SOURCE TIME FORENSICS '+json.dumps(report,sort_keys=True),flush=True)


if __name__=='__main__':
    main()
