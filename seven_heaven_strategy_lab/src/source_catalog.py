"""Seven Heaven Source Catalog v1: normalized metadata for verified local datasets."""
from __future__ import annotations
from copy import deepcopy
from datetime import datetime, timezone
import re
from src.engine import LabError

SCHEMA="seven.source_catalog.v1"
ENTRY_SCHEMA="seven.source_catalog.entry.v1"
_ALLOWED_TF={"1m","5m","15m","1h","4h"}
_SHA=re.compile(r"^[0-9a-f]{64}$")

def _iso_from_epoch(value):
    return datetime.fromtimestamp(int(value), timezone.utc).isoformat()

def _clean_sha(value,label="sha256"):
    if not isinstance(value,str) or not _SHA.fullmatch(value.lower()): raise LabError("Source Catalog : "+label+" invalide")
    return value.lower()

def normalize_source(raw):
    """Normalize existing source manifests without exposing absolute/private paths."""
    if not isinstance(raw,dict): raise LabError("Source Catalog : source invalide")
    sid=raw.get("id"); pair=raw.get("pair"); base=raw.get("base"); quote=raw.get("quote")
    if not all(isinstance(x,str) and x.strip() for x in (sid,pair,base,quote)): raise LabError("Source Catalog : identité incomplète")
    exchange=str(raw.get("exchange") or "").strip()
    if not exchange: raise LabError("Source Catalog : exchange absent")
    tf=raw.get("source_timeframe") or raw.get("bar")
    if tf not in _ALLOWED_TF: raise LabError("Source Catalog : timeframe source invalide")
    available=list(raw.get("available_timeframes") or [tf])
    if not available or any(x not in _ALLOWED_TF for x in available): raise LabError("Source Catalog : timeframes invalides")
    rows=raw.get("rows")
    if rows is not None and (type(rows) is not int or rows <= 0): raise LabError("Source Catalog : rows invalide")
    first=raw.get("first_utc")
    if first is None and raw.get("first_timestamp") is not None: first=_iso_from_epoch(raw["first_timestamp"])
    last=raw.get("last_utc")
    if last is None and raw.get("last_timestamp") is not None: last=_iso_from_epoch(raw["last_timestamp"])
    end=raw.get("close_boundary_utc")
    sha=_clean_sha(raw.get("sha256") or raw.get("stored_csv_sha256"))
    kind=raw.get("source_kind","UNKNOWN")
    certification=raw.get("certification")
    if not certification:
        certification={"BINANCE_MONTHLY_CERTIFIED":"OFFICIAL_CHECKSUM_MATCHED_COMPLETE_MONTH",
                       "OKX_PUBLIC_ARCHIVE":"SHA256_CONTIGUOUS_CLOSED_CANDLES",
                       "LEGACY_BINANCE_V1_V2":"SHA256_REFERENCE_ARCHIVE"}.get(kind,"VERIFIED_LOCAL_SOURCE")
    archive_sha=raw.get("source_archive_sha256") or raw.get("archive_sha256_observed")
    integrity={"status":certification,"sha256":sha}
    if archive_sha: integrity["archive_sha256"]=_clean_sha(archive_sha,"archive_sha256")
    return {"schema":ENTRY_SCHEMA,"source_id":sid,"id":sid,"source_kind":kind,"exchange":exchange,"market_type":"SPOT",
            "pair":pair,"base":base,"quote":quote,"source_timeframe":tf,"bar":tf,"available_timeframes":available,
            "coverage":{"first_utc":first,"last_utc":last,"close_boundary_utc":end,"rows":rows},
            "rows":rows,"first_timestamp":raw.get("first_timestamp"),"last_timestamp":raw.get("last_timestamp"),
            "close_boundary_utc":end,"sha256":sha,"source_archive_sha256":archive_sha,
            "integrity":integrity,"storage":{"scope":"LOCAL_WORKSPACE","private_absolute_path_exposed":False},
            "safety":{"public_market_data":True,"account_keys":False,"orders_real":0}}

def build_catalog(entries, *, free_bytes=None, reserve_bytes=None):
    normalized=[normalize_source(x) for x in entries]
    normalized.sort(key=lambda x:(x["base"],x["quote"],x["exchange"],x["coverage"].get("first_utc") or "",x["source_id"]))
    facets={"assets":sorted({x["base"] for x in normalized}),"quotes":sorted({x["quote"] for x in normalized}),
            "exchanges":sorted({x["exchange"] for x in normalized}),"timeframes":sorted({tf for x in normalized for tf in x["available_timeframes"]}),
            "certification_statuses":sorted({x["integrity"]["status"] for x in normalized})}
    result={"schema":SCHEMA,"sources":normalized,"facets":facets,"count":len(normalized),"paper_only":True}
    if free_bytes is not None: result["free_bytes"]=int(free_bytes)
    if reserve_bytes is not None: result["reserve_bytes"]=int(reserve_bytes)
    return result

def source_for_api(entry): return deepcopy(entry)
