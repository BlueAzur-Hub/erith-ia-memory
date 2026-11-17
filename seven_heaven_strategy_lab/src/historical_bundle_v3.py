"""Historical Bundle V3 — five-asset annual archive for Strategy Lab V4.9.

The bundle freezes ten verified Binance Spot calendar years: BTC, ETH, BNB, XRP
and SOL for 2024 and 2025. Each 1h shard was derived from canonical monthly 1m
archives and is revalidated locally before it can enter the Source Catalog.
No account access, private key, live endpoint or real order is involved.
"""
from __future__ import annotations
from datetime import datetime, timezone
import calendar, csv, gzip, hashlib, io, json, math, os, shutil, uuid
from pathlib import Path

from src.engine import LabError
from src.catalog_source_v48 import read_source as read_catalog_source

ROOT=Path(__file__).resolve().parents[1]
BUNDLE_ROOT=ROOT/'data'/'historical_bundle_v3'
MANIFEST_PATH=BUNDLE_ROOT/'MANIFEST.json'
CATALOG_ROOT='catalog_sources'
RESERVE_BYTES=2_500_000_000
WRITE_BUDGET_BYTES=20_000_000
SCHEMA='seven.strategy_lab.historical_bundle.v2'
SHARD_SCHEMA='aerith.public.ohlcv.calendar-year-hourly-shard.v1'
COLUMNS=['open_time_ms','open','high','low','close','base_volume','quote_volume','trade_count']

class HistoricalBundleError(LabError): pass

def _manifest()->dict:
    try: raw=json.loads(MANIFEST_PATH.read_text(encoding='utf-8'))
    except (OSError,ValueError,TypeError) as exc: raise HistoricalBundleError('Historical Bundle V3 : manifeste absent ou illisible') from exc
    if (raw.get('schema')!=SCHEMA or raw.get('pair_quote')!='USDT' or raw.get('timeframe')!='1h' or
        raw.get('paper_only') is not True or not isinstance(raw.get('datasets'),list)):
        raise HistoricalBundleError('Historical Bundle V3 : manifeste incompatible')
    seen=set()
    for d in raw['datasets']:
        key=(d.get('symbol'),d.get('year'))
        if key in seen: raise HistoricalBundleError('Historical Bundle V3 : dataset dupliqué')
        seen.add(key)
    return raw

def _entry(symbol:str,year:int):
    symbol=str(symbol or '').upper()
    if type(year) is not int: return None
    matches=[d for d in _manifest()['datasets'] if d.get('symbol')==symbol and d.get('year')==year]
    return matches[0] if len(matches)==1 else None

def available(symbol:str,year:int)->bool:
    return _entry(symbol,year) is not None

def _file_for(entry:dict)->Path:
    name=entry.get('filename')
    if not isinstance(name,str) or Path(name).name!=name or not name.endswith('.json.gz'):
        raise HistoricalBundleError('Historical Bundle V3 : nom de shard invalide')
    p=BUNDLE_ROOT/name
    if not p.is_file(): raise HistoricalBundleError('Historical Bundle V3 : shard annuel introuvable')
    if type(entry.get('bytes')) is int and p.stat().st_size!=entry['bytes']:
        raise HistoricalBundleError('Historical Bundle V3 : taille du shard annuel non conforme')
    return p

def _atomic(path:Path,payload:bytes):
    path.parent.mkdir(parents=True,exist_ok=True)
    tmp=path.with_name('.'+path.name+'.'+uuid.uuid4().hex+'.tmp')
    try:
        tmp.write_bytes(payload); os.replace(tmp,path)
    finally: tmp.unlink(missing_ok=True)

def _validate(entry:dict):
    p=_file_for(entry); payload=p.read_bytes(); observed=hashlib.sha256(payload).hexdigest()
    if observed!=entry.get('sha256'): raise HistoricalBundleError('Historical Bundle V3 : SHA-256 du shard annuel non conforme')
    try:
        with gzip.open(io.BytesIO(payload),'rt',encoding='utf-8') as fh: shard=json.load(fh)
    except (OSError,ValueError,TypeError,UnicodeDecodeError) as exc: raise HistoricalBundleError('Historical Bundle V3 : shard gzip/json invalide') from exc
    symbol=entry['symbol']; pair=symbol+'USDT'; year=entry['year']; expected_rows=(366 if calendar.isleap(year) else 365)*24
    if (shard.get('schema')!=SHARD_SCHEMA or shard.get('asset_id')!=entry.get('asset_id') or shard.get('pair')!=pair or
        shard.get('quote')!='USDT' or shard.get('year')!=year or shard.get('contiguous_span')!=entry.get('source_span') or
        shard.get('interval')!='1h' or shard.get('columns')!=COLUMNS or len(shard.get('series',[]))!=expected_rows or
        entry.get('rows')!=expected_rows or shard.get('is_live') is not False):
        raise HistoricalBundleError('Historical Bundle V3 : identité ou dimensions du shard incompatibles')
    expected_native=expected_rows*60
    if shard.get('native_1m_count')!=expected_native:
        raise HistoricalBundleError('Historical Bundle V3 : couverture 1m source incomplète')
    months=shard.get('source_months')
    expected_months=[f'{year}-{m:02d}' for m in range(1,13)]
    if (not isinstance(months,list) or len(months)!=12 or [x.get('month') for x in months]!=expected_months or
        any(not isinstance(x.get('source_zip_sha256'),str) or len(x['source_zip_sha256'])!=64 for x in months)):
        raise HistoricalBundleError('Historical Bundle V3 : provenance mensuelle incomplète')
    series=shard['series']; bars=[]; last=None
    first_expected=int(datetime(year,1,1,tzinfo=timezone.utc).timestamp())
    for row in series:
        if not isinstance(row,list) or len(row)!=8: raise HistoricalBundleError('Historical Bundle V3 : ligne OHLCV invalide')
        ms=row[0]
        if type(ms) is not int or ms%1000: raise HistoricalBundleError('Historical Bundle V3 : horodatage invalide')
        ts=ms//1000
        if last is None and ts!=first_expected: raise HistoricalBundleError('Historical Bundle V3 : début annuel incorrect')
        if last is not None and ts!=last+3600: raise HistoricalBundleError('Historical Bundle V3 : discontinuité horaire')
        try: o,h,l,c,v=[float(row[x]) for x in (1,2,3,4,5)]
        except (TypeError,ValueError,OverflowError) as exc: raise HistoricalBundleError('Historical Bundle V3 : OHLCV non numérique') from exc
        if not all(math.isfinite(x) for x in (o,h,l,c,v)) or min(o,h,l,c)<=0 or v<0 or not l<=min(o,c)<=max(o,c)<=h:
            raise HistoricalBundleError('Historical Bundle V3 : OHLCV incohérent')
        bars.append((ts,o,h,l,c,v)); last=ts
    if last!=int(datetime(year+1,1,1,tzinfo=timezone.utc).timestamp())-3600:
        raise HistoricalBundleError('Historical Bundle V3 : fin annuelle incorrecte')
    return shard,bars,observed

def _csv_bytes(bars)->bytes:
    sio=io.StringIO(newline=''); w=csv.writer(sio,lineterminator='\n'); w.writerow(['timestamp','open','high','low','close','volume'])
    for row in bars: w.writerow(row)
    return sio.getvalue().encode('utf-8')

def install_from_bundle(workspace:Path,symbol:str,year:int,source_id:str)->dict:
    entry=_entry(symbol,year)
    if entry is None: raise HistoricalBundleError('Historical Bundle V3 : année absente du bundle local')
    workspace=Path(workspace).resolve(); workspace.mkdir(parents=True,exist_ok=True)
    if shutil.disk_usage(workspace).free < RESERVE_BYTES + WRITE_BUDGET_BYTES:
        raise HistoricalBundleError('Historical Bundle V3 : réserve locale de 2,5 Go protégée')
    try:
        manifest,_=read_catalog_source(workspace,source_id); return manifest
    except Exception: pass
    shard,bars,shard_sha=_validate(entry)
    payload=_csv_bytes(bars); csv_sha=hashlib.sha256(payload).hexdigest()
    manifest={
      'schema':'seven.source_catalog.dataset.v1','id':source_id,'exchange':'Binance Spot',
      'pair':symbol+'/USDT','base':symbol,'quote':'USDT','source_timeframe':'1h','available_timeframes':['1h','4h'],
      'rows':len(bars),'first_utc':datetime.fromtimestamp(bars[0][0],timezone.utc).isoformat(),
      'last_utc':datetime.fromtimestamp(bars[-1][0],timezone.utc).isoformat(),
      'close_boundary_utc':datetime(year+1,1,1,tzinfo=timezone.utc).isoformat(),
      'stored_csv_sha256':csv_sha,
      'certification':'SEVEN_VERIFIED_ANNUAL_SHARD_SHA256_MONTHLY_PROVENANCE',
      'historical_vault':{
        'schema':'seven.historical_vault.installed_year.v3','year':year,'asset_id':shard.get('asset_id'),
        'pair_compact':shard.get('pair'),'annual_shard_sha256':shard_sha,'annual_shard_schema':shard.get('schema'),
        'source_span':shard.get('contiguous_span'),'source':shard.get('source'),'source_native_timeframe':'1m','stored_timeframe':'1h',
        'native_1m_count':shard.get('native_1m_count'),'source_months':shard.get('source_months'),
        'bundle_schema':SCHEMA,'bundle_path':'data/historical_bundle_v3','bundle_filename':entry.get('filename'),
        'raw_1m_archives_retained':False,
      },
      'safety':{'orders_real':0,'account_reads':0,'private_keys':False,'public_data_only':True,'paper_only':True},
    }
    folder=workspace/CATALOG_ROOT/source_id
    _atomic(folder/'bars.csv',payload)
    _atomic(folder/'manifest.json',(json.dumps(manifest,ensure_ascii=False,indent=2,allow_nan=False)+'\n').encode('utf-8'))
    try:
        accepted,loaded=read_catalog_source(workspace,source_id)
        if len(loaded)!=len(bars): raise HistoricalBundleError('Historical Bundle V3 : relecture du catalogue incomplète')
        return accepted
    except Exception:
        for n in ('manifest.json','bars.csv'): (folder/n).unlink(missing_ok=True)
        try: folder.rmdir()
        except OSError: pass
        raise
