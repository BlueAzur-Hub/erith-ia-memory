#!/usr/bin/env python3
"""Acquire official Binance BTC 1m ZIP, verify and publish standalone SQLite proof.

This program never edits GitHub and never promotes partial data to the canonical
catalogue. The caller must store its output as an immutable research artifact.
"""
import argparse
import hashlib
import json
from pathlib import Path
import sqlite3
import urllib.request

from btc_gap_archive import verify

HOST='https://data.binance.vision/data/spot/monthly/klines/BTCUSDT/1m/'
DDL='''CREATE TABLE btc_1m(
    open_time_ms INTEGER PRIMARY KEY,
    open TEXT NOT NULL, high TEXT NOT NULL, low TEXT NOT NULL, close TEXT NOT NULL,
    base_volume TEXT NOT NULL, close_time_ms INTEGER NOT NULL,
    quote_volume TEXT NOT NULL, trade_count INTEGER NOT NULL,
    taker_base TEXT NOT NULL, taker_quote TEXT NOT NULL);
    CREATE TABLE metadata(key TEXT PRIMARY KEY,value TEXT NOT NULL);
'''


def download(url,cap):
    with urllib.request.urlopen(urllib.request.Request(
        url,headers={'User-Agent':'Seven-Heaven-BTC-History/1.0'}),timeout=90) as reply:
        if reply.status!=200:raise ValueError('Download HTTP status was not 200')
        data=reply.read(cap+1)
        if not 0<len(data)<=cap:raise ValueError('Unexpected download size')
        return data


def acquire(month,out,fetch=download):
    # Input date/identity validated before constructing any URL.
    import re
    if not re.fullmatch(r'20\d{2}-(0[1-9]|1[0-2])',month):
        raise ValueError('Invalid month')
    root=Path(out)
    root.mkdir(parents=True,exist_ok=True)
    filename=f'BTCUSDT-1m-{month}.zip'
    original=root/filename
    checksum=root/(filename+'.CHECKSUM')
    database=root/(f'BTCUSDT-1m-{month}.sqlite')
    manifest=root/(f'BTCUSDT-1m-{month}.json')
    for p in (original,checksum,database,manifest):
        if p.exists():raise ValueError('Refusing to overwrite existing archive '+p.name)
    url=HOST+filename
    zipped=fetch(url,55_000_000)
    expected=fetch(url+'.CHECKSUM',8192).decode('utf-8')
    result,rows=verify(zipped,expected,month)
    db=sqlite3.connect(database)
    try:
        db.executescript(DDL)
        db.executemany('INSERT INTO btc_1m VALUES (?,?,?,?,?,?,?,?,?,?,?)',rows)
        db.executemany('INSERT INTO metadata VALUES (?,?)',[
            ('month',month),('pair','BTCUSDT'),('quote','USDT'),
            ('source_zip_sha256',result['source_zip_sha256']),
            ('synthetic_rows','0')])
        db.commit()
        assert db.execute('PRAGMA quick_check').fetchone()[0]=='ok'
        assert db.execute('SELECT COUNT(*) FROM btc_1m').fetchone()[0]==result['native_rows']
    finally:
        db.close()
    original.write_bytes(zipped)
    checksum.write_text(expected)
    result['source_url']=url
    result['checksum_url']=url+'.CHECKSUM'
    result['sqlite_file']=database.name
    result['sqlite_sha256']=hashlib.sha256(database.read_bytes()).hexdigest()
    manifest.write_text(json.dumps(result,indent=2,sort_keys=True)+'\n')
    return result


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--month',default='2023-03')
    parser.add_argument('--output',type=Path,required=True)
    args=parser.parse_args()
    result=acquire(args.month,args.output)
    print(json.dumps({'month':result['month'],'native_rows':result['native_rows'],
                      'missing_minutes':result['missing_minutes'],
                      'gaps':len(result['gaps']),
                      'sha256':result['source_zip_sha256']},sort_keys=True))


if __name__=='__main__':
    main()
