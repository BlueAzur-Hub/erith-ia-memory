"""Historical Bundle V2 — install verified annual hourly shards shipped with the Lab.

The bundle contains frozen, non-live Binance Spot 1h series already derived from
canonical Seven monthly 1m archives. Installation is local-only: validate the
bundle SHA-256, provenance fields and exact hourly continuity, then materialize
it into the generic Source Catalog namespace. No account access or real orders.
"""
from __future__ import annotations
from datetime import datetime, timezone
import csv, gzip, hashlib, io, json, math, os, shutil, uuid
from pathlib import Path

from src.engine import LabError, load_bars
from src.catalog_source_v48 import read_source as read_catalog_source

ROOT=Path(__file__).resolve().parents[1]
BUNDLE_ROOT=ROOT/'data'/'historical_bundle_v2'
MANIFEST_PATH=BUNDLE_ROOT/'MANIFEST.json'
CATALOG_ROOT='catalog_sources'
RESERVE_BYTES=2_500_000_000
WRITE_BUDGET_BYTES=10_000_000
SCHEMA='seven.strategy_lab.historical_bundle.v1'
SHARD_SCHEMA='aerith.public.ohlcv.calendar-year-hourly-shard.v1'
COLUMNS=['open_time_ms','open','high','low','close','base_volume','quote_volume','trade_count']

class HistoricalBundleError(LabError): pass

def _manifest()->dict:
    try: raw=json.loads(MANIFEST_PATH.read_text(encoding='utf-8'))
    except (OSError,ValueError,TypeError) as exc: raise HistoricalBundleError('Historical Bundle V2 : manifeste absent ou illisible') from exc
    if raw.get('schema')!=SCHEMA or raw.get('timeframe')!='1h' or not isinstance(raw.get('datasets'),list):
        raise HistoricalBundleError('Historical Bundle V2 : manifeste incompatible')
    return raw

def _entry(symbol:str,year:int):
    symbol=str(symbol or '').upper()
    if type(year) is not int: return None
    for d in _manifest()['datasets']:
        if d.get('symbol')==symbol and d.get('year')==year: return d
    return None

def available(symbol:str,year:int)->bool:
    return _entry(symbol,year) is not None

def _file_for(entry:dict)->Path:
    prefix=('bitcoin' if entry['symbol']=='BTC' else 'ethereum')+f"-{entry['year']}-span13-"
    matches=list(BUNDLE_ROOT.glob(prefix+'*.json.gz'))
    if len(matches)!=1: raise HistoricalBundleError('Historical Bundle V2 : shard annuel introuvable ou ambigu')
    return matches[0]

def _atomic(path:Path,payload:bytes):
    path.parent.mkdir(parents=True,exist_ok=True)
    tmp=path.with_name('.'+path.name+'.'+uuid.uuid4().hex+'.tmp')
    try:
        tmp.write_bytes(payload); os.replace(tmp,path)
    finally: tmp.unlink(missing_ok=True)

def _validate(entry:dict):
    p=_file_for(entry); payload=p.read_bytes(); observed=hashlib.sha256(payload).hexdigest()
    if observed!=entry.get('sha256'): raise HistoricalBundleError('Historical Bundle V2 : SHA-256 du shard annuel non conforme')
    try:
        with gzip.open(io.BytesIO(payload),'rt',encoding='utf-8') as fh: shard=json.load(fh)
    except (OSError,ValueError,TypeError,UnicodeDecodeError) as exc: raise HistoricalBundleError('Historical Bundle V2 : shard gzip/json invalide') from exc
    symbol=entry['symbol']; pair=symbol+'USDT'; expected_rows=8784 if entry['year']==2024 else 8760
    if (shard.get('schema')!=SHARD_SCHEMA or shard.get('pair')!=pair or shard.get('year')!=entry['year'] or
        shard.get('interval')!='1h' or shard.get('columns')!=COLUMNS or len(shard.get('series',[]))!=expected_rows or
        entry.get('rows')!=expected_rows):
        raise HistoricalBundleError('Historical Bundle V2 : identité ou dimensions du shard incompatibles')
    months=shard.get('source_months')
    if not isinstance(months,list) or len(months)!=12 or [x.get('month') for x in months] != [f"{entry['year']}-{m:02d}" for m in range(1,13)]:
        raise HistoricalBundleError('Historical Bundle V2 : provenance mensuelle incomplète')
    series=shard['series']; bars=[]; last=None
    for i,row in enumerate(series):
        if not isinstance(row,list) or len(row)!=8: raise HistoricalBundleError('Historical Bundle V2 : ligne OHLCV invalide')
        ms=row[0]
        if type(ms) is not int or ms%1000: raise HistoricalBundleError('Historical Bundle V2 : horodatage invalide')
        ts=ms//1000
        if last is not None and ts!=last+3600: raise HistoricalBundleError('Historical Bundle V2 : discontinuité horaire')
        try: o,h,l,c,v=[float(row[x]) for x in (1,2,3,4,5)]
        except (TypeError,ValueError,OverflowError) as exc: raise HistoricalBundleError('Historical Bundle V2 : OHLCV non numérique') from exc
        if not all(math.isfinite(x) for x in (o,h,l,c,v)) or min(o,h,l,c)<=0 or v<0 or not l<=min(o,c)<=max(o,c)<=h:
            raise HistoricalBundleError('Historical Bundle V2 : OHLCV incohérent')
        bars.append((ts,o,h,l,c,v)); last=ts
    return shard,bars,observed

def _csv_bytes(bars)->bytes:
    sio=io.StringIO(newline=''); w=csv.writer(sio,lineterminator='\n'); w.writerow(['timestamp','open','high','low','close','volume'])
    for row in bars: w.writerow(row)
    return sio.getvalue().encode('utf-8')

def install_from_bundle(workspace:Path,symbol:str,year:int,source_id:str)->dict:
    entry=_entry(symbol,year)
    if entry is None: raise HistoricalBundleError('Historical Bundle V2 : année absente du bundle local')
    workspace=Path(workspace).resolve(); workspace.mkdir(parents=True,exist_ok=True)
    if shutil.disk_usage(workspace).free < RESERVE_BYTES + WRITE_BUDGET_BYTES:
        raise HistoricalBundleError('Historical Bundle V2 : réserve locale de 2,5 Go protégée')
    # Idempotent re-open first.
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
        'schema':'seven.historical_vault.installed_year.v2','year':year,'asset_id':shard.get('asset_id'),
        'pair_compact':shard.get('pair'),'annual_shard_sha256':shard_sha,'annual_shard_schema':shard.get('schema'),
        'source':shard.get('source'),'source_native_timeframe':'1m','stored_timeframe':'1h',
        'native_1m_count':shard.get('native_1m_count'),'source_months':shard.get('source_months'),
        'bundle_schema':SCHEMA,'bundle_path':'data/historical_bundle_v2','raw_1m_archives_retained':False,
      },
      'safety':{'orders_real':0,'account_reads':0,'private_keys':False,'public_data_only':True,'paper_only':True},
    }
    folder=workspace/CATALOG_ROOT/source_id
    _atomic(folder/'bars.csv',payload)
    _atomic(folder/'manifest.json',(json.dumps(manifest,ensure_ascii=False,indent=2,allow_nan=False)+'\n').encode('utf-8'))
    try:
        accepted,loaded=read_catalog_source(workspace,source_id)
        if len(loaded)!=len(bars): raise HistoricalBundleError('Historical Bundle V2 : relecture du catalogue incomplète')
        return accepted
    except Exception:
        for n in ('manifest.json','bars.csv'): (folder/n).unlink(missing_ok=True)
        try: folder.rmdir()
        except OSError: pass
        raise
