"""BTC Spot official ZIP admission preserving missing minute ranges.

Raw source ZIP + official .CHECKSUM required. No synthetic candles.
Distinct from existing strict-full-month canonical importer.
"""
import calendar
import csv
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
import hashlib
import io
import re
import zipfile


class AdmissionError(ValueError):
    pass


def verify(raw: bytes, checksum: str, month: str, pair: str = 'BTCUSDT'):
    if not re.fullmatch(r'20\d{2}-(0[1-9]|1[0-2])', month):
        raise AdmissionError('Invalid month')
    if pair != 'BTCUSDT' or not 0 < len(raw) <= 55_000_000:
        raise AdmissionError('Invalid BTC source or ZIP size')
    measured = hashlib.sha256(raw).hexdigest()
    expected = checksum.strip().split()[0].lower() if checksum.strip() else ''
    if not re.fullmatch('[a-f0-9]{64}', expected) or measured != expected:
        raise AdmissionError('Official Binance ZIP checksum mismatch')
    y,m = map(int,month.split('-'))
    first = int(datetime(y,m,1,tzinfo=timezone.utc).timestamp()*1000)
    end = first+calendar.monthrange(y,m)[1]*86_400_000
    total = (end-first)//60_000
    last = None
    gaps=[]
    count=0
    timestamp_unit=None
    original_rows=[]
    try:
        with zipfile.ZipFile(io.BytesIO(raw)) as z:
            required=f'{pair}-1m-{month}.csv'
            if z.namelist()!=[required]:
                raise AdmissionError('Unexpected source CSV')
            info=z.getinfo(required)
            if not info.compress_size or info.file_size>160_000_000 or info.file_size>max(220*info.compress_size,160000):
                raise AdmissionError('Unsafe ZIP expansion')
            with z.open(info) as stream:
                for r in csv.reader(io.TextIOWrapper(stream,encoding='utf-8-sig',newline='')):
                    if len(r)!=12: raise AdmissionError('Unexpected native Binance CSV column count')
                    stamp=int(r[0]);unit='us' if stamp>=10**15 else 'ms'
                    if timestamp_unit and timestamp_unit!=unit:raise AdmissionError('Mixed timestamp units')
                    timestamp_unit=unit
                    ts=stamp//1000 if unit=='us' else stamp
                    if not first<=ts<end or (ts-first)%60_000:
                        raise AdmissionError('Invalid source minute timestamp')
                    if last is not None and ts<=last:
                        raise AdmissionError('Duplicate or out-of-order minute')
                    before=first if last is None else last+60_000
                    if before<ts:
                        gaps.append({'start_ms':before,'end_ms_exclusive':ts,
                                     'minutes':(ts-before)//60_000})
                    ct=int(r[6]);close=ct//1000 if unit=='us' else ct
                    if not ts<=close<ts+60_000:
                        raise AdmissionError('Invalid close timestamp')
                    try:
                        vals=[Decimal(r[i]) for i in (1,2,3,4,5,7,9,10)]
                        count_trades=int(r[8])
                    except (InvalidOperation,ValueError) as exc:
                        raise AdmissionError('Invalid numeric field') from exc
                    o,h,l,c,v,q,tb,tq=vals
                    if not all(n.is_finite() for n in vals) or min(o,h,l,c)<=0 or l>min(o,c) or h<max(o,c) or min(v,q,tb,tq)<0 or count_trades<0:
                        raise AdmissionError('Invalid OHLCV data')
                    original_rows.append((ts,r[1],r[2],r[3],r[4],r[5],close,r[7],count_trades,r[9],r[10]))
                    last=ts
                    count+=1
    except (zipfile.BadZipFile,OSError,UnicodeError,csv.Error) as exc:
        raise AdmissionError('Malformed archive') from exc
    if last is None:raise AdmissionError('Empty source archive')
    if last+60_000<end:
        gaps.append({'start_ms':last+60_000,'end_ms_exclusive':end,
                     'minutes':(end-last-60_000)//60_000})
    missing=sum(x['minutes'] for x in gaps)
    if count+missing!=total:raise AdmissionError('Calendar reconciliation error')
    return {'schema':'seven.btc.native.source-quality.v1','pair':pair,'month':month,
            'interval':'1m','quote':'USDT','source':'Binance Spot official',
            'source_zip_sha256':measured,'expected_minutes':total,
            'native_rows':count,'missing_minutes':missing,
            'gaps':gaps,'first_open_ms':original_rows[0][0],
            'last_open_ms':last,'timestamp_unit':timestamp_unit,
            'synthetic_rows':0,'status':'source_verified_gaps' if missing else 'source_verified_complete',
            'canonical_import':False}, original_rows
