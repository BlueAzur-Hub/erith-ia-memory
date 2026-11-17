"""Generic read-only catalog datasets for Strategy Lab V4.8 Gate 2.

A dataset is installed outside the code under:
  workspace/catalog_sources/<source_id>/manifest.json
  workspace/catalog_sources/<source_id>/bars.csv

The loader never accepts arbitrary paths and never downloads or trades. This is
the portability bridge that lets certified SOL/XRP/etc. histories become usable
without adding a Python pair allowlist for each asset.
"""
from __future__ import annotations
from datetime import datetime, timezone
import hashlib, json, re
from pathlib import Path
from src.engine import LabError, load_bars

ROOT_NAME="catalog_sources"
SCHEMA="seven.source_catalog.dataset.v1"
_ID=re.compile(r"^[A-Z0-9][A-Z0-9_.-]{2,119}$")
_ASSET=re.compile(r"^[A-Z0-9]{2,16}$")
_SHA=re.compile(r"^[0-9a-f]{64}$")
_INTERVALS={"1m":60,"1h":3600}
_ALLOWED_BY_SOURCE={"1m":["1m","5m","15m","1h","4h"],"1h":["1h","4h"]}

class CatalogSourceError(LabError): pass

def _folder(workspace:Path, source_id:str)->Path:
    if not isinstance(source_id,str) or not _ID.fullmatch(source_id): raise CatalogSourceError("Source Catalog : identifiant générique invalide")
    return Path(workspace).resolve()/ROOT_NAME/source_id

def _validate_manifest(raw:dict, source_id:str)->dict:
    if not isinstance(raw,dict) or raw.get("schema")!=SCHEMA or raw.get("id")!=source_id: raise CatalogSourceError("Source Catalog : manifeste générique incompatible")
    base,quote=raw.get("base"),raw.get("quote")
    if not isinstance(base,str) or not _ASSET.fullmatch(base) or not isinstance(quote,str) or not _ASSET.fullmatch(quote): raise CatalogSourceError("Source Catalog : actifs invalides")
    if raw.get("pair")!=base+"/"+quote: raise CatalogSourceError("Source Catalog : paire incohérente")
    exchange=raw.get("exchange")
    if not isinstance(exchange,str) or not 1<=len(exchange.strip())<=64: raise CatalogSourceError("Source Catalog : exchange invalide")
    tf=raw.get("source_timeframe")
    if tf not in _INTERVALS: raise CatalogSourceError("Source Catalog : timeframe natif non supporté")
    available=raw.get("available_timeframes")
    if not isinstance(available,list) or not available or any(x not in _ALLOWED_BY_SOURCE[tf] for x in available): raise CatalogSourceError("Source Catalog : timeframes dérivés invalides")
    rows=raw.get("rows")
    if type(rows) is not int or not 60<=rows<=150000: raise CatalogSourceError("Source Catalog : nombre de bougies invalide")
    sha=raw.get("stored_csv_sha256")
    if not isinstance(sha,str) or not _SHA.fullmatch(sha): raise CatalogSourceError("Source Catalog : SHA-256 invalide")
    cert=raw.get("certification")
    if not isinstance(cert,str) or not 3<=len(cert)<=96: raise CatalogSourceError("Source Catalog : certification absente")
    return raw

def read_source(workspace:Path, source_id:str):
    folder=_folder(workspace,source_id); mf=folder/'manifest.json'; csvf=folder/'bars.csv'
    try: raw=json.loads(mf.read_text(encoding='utf-8')); payload=csvf.read_bytes()
    except (OSError,ValueError,TypeError) as exc: raise CatalogSourceError("Source Catalog : dataset générique absent ou illisible") from exc
    m=_validate_manifest(raw,source_id)
    if hashlib.sha256(payload).hexdigest()!=m['stored_csv_sha256']: raise CatalogSourceError("Source Catalog : SHA-256 du dataset générique non conforme")
    bars=load_bars(csvf,expected_count=m['rows'],interval_seconds=_INTERVALS[m['source_timeframe']])
    first=datetime.fromtimestamp(bars[0][0],timezone.utc).isoformat(); last=datetime.fromtimestamp(bars[-1][0],timezone.utc).isoformat()
    if m.get('first_utc') and m['first_utc']!=first: raise CatalogSourceError("Source Catalog : première bougie incohérente")
    if m.get('last_utc') and m['last_utc']!=last: raise CatalogSourceError("Source Catalog : dernière bougie incohérente")
    normalized={**m,'first_utc':first,'last_utc':last,'sha256':m['stored_csv_sha256'],'source_kind':'CATALOG_REGISTERED_V1'}
    return normalized,bars

def list_sources(workspace:Path):
    root=Path(workspace).resolve()/ROOT_NAME; out=[]
    if not root.is_dir(): return out
    for folder in sorted(root.iterdir()):
        if not folder.is_dir() or not _ID.fullmatch(folder.name): continue
        try:
            m,_=read_source(workspace,folder.name)
            out.append({k:m.get(k) for k in ('id','exchange','pair','base','quote','source_timeframe','available_timeframes','rows','first_utc','last_utc','close_boundary_utc','sha256','certification','source_kind')})
        except (CatalogSourceError,OSError,ValueError,TypeError): continue
    return out
