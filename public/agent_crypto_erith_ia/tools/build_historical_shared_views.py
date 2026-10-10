#!/usr/bin/env python3
"""One reusable, bounded monthly projection for all already archived Top250 assets.

All source 1m ZIPs stay immutable in GitHub Releases. The output is a compact
SHA256-verified Pages view per *actual* archived asset, not fake Top250 prices.
This is a derived browser view, NOT another exchange collector or live feed.
"""
from __future__ import annotations
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import gzip
import hashlib
import io
import json
from pathlib import Path
import re
import tempfile
import threading
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

import import_historical_bulk as bulk
import build_historical_btc_view as candles

HOME=bulk.ROOT/"data/historical_archive_prototype"
CATALOG=HOME/"top250_history_catalog/index.json"
DEST=HOME/"shared_monthly_views"
SCHEMA="aerith.public.ohlcv.shared.monthly-projection.v1"
INDEX_SCHEMA="aerith.public.ohlcv.shared.monthly-index.v1"
IDENTITY=re.compile(r"^[a-z0-9-]{1,90}$")
MAX_ASSETS=250
MAX_GZIP=2_000_000
MAX_MANIFEST=1_000_000

def need(ok,reason):
    if not ok:raise ValueError(reason)

def digest(raw):
    return hashlib.sha256(raw).hexdigest()

def pack(obj):
    raw=json.dumps(obj,separators=(",",":"),ensure_ascii=False,allow_nan=False).encode()
    buffer=io.BytesIO()
    with gzip.GzipFile(filename="",mode="wb",fileobj=buffer,mtime=0,compresslevel=9) as g:
        g.write(raw)
    zipped=buffer.getvalue()
    need(0<len(zipped)<=MAX_GZIP,"Projected archive exceeds permitted size")
    return zipped

def pick(catalog):
    need(catalog.get("schema")=="aerith.public.ohlcv.top250.monthly-coverage-catalog.v1"
         and catalog.get("ranked")==250 and catalog.get("quote")=="USDT"
         and isinstance(catalog.get("assets"),list) and len(catalog["assets"])==250,
         "Not a verified Top250 historical catalog")
    selected=[]
    for row in catalog["assets"]:
        paths=row["months"]
        if not paths:continue
        aid=row["id"]
        need(IDENTITY.fullmatch(aid) is not None and 1<=row["rank"]<=250,
             "Unsafe asset ID")
        latest=max(paths,key=lambda x:x["month"])
        month=latest["month"]
        pair=latest["pair"]
        need(bulk.PAIR.fullmatch(pair) and
             re.fullmatch(r"20\d{2}-(?:0[1-9]|1[0-2])",month) and
             latest["file"]==pair+"-1m-"+month+".zip" and
             re.fullmatch(r"[0-9a-f]{64}",latest["sha256"]) and
             latest["candles"]==bulk.bounds(month,"1m")[1] and
             latest["release"].startswith("crypto-spot-bulk-"),
             "Bad source month reference")
        selected.append({"id":aid,"rank":row["rank"],"symbol":row["symbol"],
                         "name":row["name"],**latest})
    need(0<len(selected)<=MAX_ASSETS and len(selected)==catalog["archived_assets"],
         "Missing verified assets")
    need(len({x["id"] for x in selected})==len(selected),"Duplicate asset ID")
    return selected

# Download immutable public Release assets without the GitHub REST API. # The gh CLI performs a REST asset lookup for each source and exhausted # installation API quotas when the catalog grew beyond fifty assets.
SOURCE_RELEASE=re.compile(r"^crypto-spot-bulk-(?:20\d{2}-(?:0[1-9]|1[0-2])-1m|add-20\d{2}-(?:0[1-9]|1[0-2])-1m-[a-f0-9]{12})$")
SOURCE_FILE=re.compile(r"^[A-Z0-9]{1,40}-1m-20\d{2}-(?:0[1-9]|1[0-2])\.zip$")
MAX_SOURCE_ZIP=40_000_000
_SOURCE_LOCK_GUARD=threading.Lock()
_SOURCE_LOCKS={}

def download_public_asset(release, filename, destination, limit):
    """Read one bounded public GitHub Release asset through the CDN, never REST."""
    need(SOURCE_RELEASE.fullmatch(release) is not None and
         (filename=="manifest.json" or SOURCE_FILE.fullmatch(filename) is not None),
         "Unsafe public historical source reference")
    url=("https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/"
         +release+"/"+filename)
    partial=destination.with_name(destination.name+".part")
    for attempt in range(4):
        try:
            request=Request(url,headers={"User-Agent":"Seven-Heaven-Historical-Vault",
                                         "Accept":"application/octet-stream"})
            total=0
            with urlopen(request,timeout=90) as response:
                with partial.open("wb") as stream:
                    while True:
                        chunk=response.read(min(1048576,limit-total+1))
                        if not chunk:break
                        total+=len(chunk)
                        need(total<=limit,"Historical source exceeds permitted size")
                        stream.write(chunk)
            need(total>0,"Empty historical source download")
            partial.replace(destination)
            return
        except HTTPError as exc:
            partial.unlink(missing_ok=True)
            if exc.code not in (403,408,429,500,502,503,504) or attempt==3:
                raise
            time.sleep(2**attempt)
        except (URLError, TimeoutError, ConnectionError):
            partial.unlink(missing_ok=True)
            if attempt==3:raise
            time.sleep(2**attempt)
        except Exception:
            partial.unlink(missing_ok=True)
            raise

def source_folder(asset, root):
    """Share verified Release downloads between worker threads in this build."""
    release=asset["release"]
    filename=asset["file"]
    need(SOURCE_RELEASE.fullmatch(release) is not None and
         SOURCE_FILE.fullmatch(filename) is not None and
         filename==asset["pair"]+"-1m-"+asset["month"]+".zip",
         "Unsafe public historical source reference")
    folder=Path(root)/release
    folder.mkdir(parents=True,exist_ok=True)
    for name,limit in (("manifest.json",MAX_MANIFEST),
                       (filename,MAX_SOURCE_ZIP)):
        target=folder/name
        with _SOURCE_LOCK_GUARD:
            lock=_SOURCE_LOCKS.setdefault(str(target),threading.Lock())
        with lock:
            if not target.is_file():
                download_public_asset(release,name,target,limit)
    return folder

def source_record(asset, folder):
    manifest_raw=(folder/"manifest.json").read_bytes()
    need(0<len(manifest_raw)<=MAX_MANIFEST,"Manifest size invalid")
    manifest=json.loads(manifest_raw)
    need(manifest.get("schema")==bulk.SCHEMA and
         manifest.get("month")==asset["month"] and
         manifest.get("interval")=="1m" and
         manifest.get("quote")=="USDT","Monthly source manifest mismatch")
    matching=[r for r in manifest.get("assets",[])
              if r.get("asset_id")==asset["id"] and r.get("pair")==asset["pair"]]
    need(len(matching)==1,"No exact source identity in Release manifest")
    record=matching[0]
    need(record.get("status")=="verified" and
         record.get("source")=="Binance Spot public monthly CSV" and
         record.get("quote")=="USDT" and record.get("file")==asset["file"] and
         record.get("sha256")==asset["sha256"] and
         record.get("candles")==asset["candles"],
         "Unqualified source ZIP, asset or SHA")
    raw=(folder/asset["file"]).read_bytes()
    need(digest(raw)==asset["sha256"],"Original ZIP SHA256 mismatch")
    inspected=bulk.check_csv(raw,asset["pair"],asset["month"],"1m")
    need(inspected["candles"]==asset["candles"],"Original one-minute OHLCV mismatch")
    rows=candles.parse_month(raw,asset["month"],asset["pair"])
    need(len(rows)==asset["candles"],"CSV parser lost native candles")
    return rows

def projection(asset, rows):
    need(len(rows)==asset["candles"] and len(rows)>=1440,
         "Insufficient complete source month")
    minute=rows[-1440:]
    five=candles.aggregate(rows[-min(len(rows),43200):],300000)
    hour=candles.aggregate(rows,3600000)
    need(len(minute)==1440 and len(five)>=8064 and
         len(hour) in (672,696,720,744),"Broken monthly aggregation")
    return {"schema":SCHEMA,"asset_id":asset["id"],"pair":asset["pair"],
            "quote":"USDT","source":"Binance Spot official monthly 1m ZIP",
            "is_live":False,"max_is_all_time":False,"scope":"latest_verified_closed_month",
            "month":asset["month"],"first_open_ms":rows[0][0],
            "last_open_ms":rows[-1][0],"native_1m_count":len(rows),
            "source_release":asset["release"],"source_zip_sha256":asset["sha256"],
            "columns":candles.COLS,
            "series":{"1m":minute,"5m":five,"1h":hour}}

def prepare_one(asset,tmp):
    folder=source_folder(asset,tmp)
    data=projection(asset,source_record(asset,folder))
    packed=pack(data)
    name=asset["id"]+".json.gz"
    return name,packed,{
        "id":asset["id"],"rank":asset["rank"],"name":asset["name"],"symbol":asset["symbol"],
        "pair":asset["pair"],"month":asset["month"],
        "first_open_ms":data["first_open_ms"],
        "last_open_ms":data["last_open_ms"],"native_1m_count":data["native_1m_count"],
        "release":asset["release"],"source_zip_sha256":asset["sha256"],
        "file":name,"sha256":digest(packed),"bytes":len(packed),
        "series_counts":{k:len(rows) for k,rows in data["series"].items()}
    }

def emit(result,folder):
    need(0<len(result)<=MAX_ASSETS,"Invalid projection count")
    folder=Path(folder)
    folder.mkdir(parents=True,exist_ok=True)
    metas=[]
    for name,raw,meta in sorted(result,key=lambda x:x[2]["rank"]):
        need(name==meta["id"]+".json.gz" and digest(raw)==meta["sha256"],
             "Projection artifact changed")
        (folder/name).write_bytes(raw)
        metas.append(meta)
    index={"schema":INDEX_SCHEMA,"source":"Binance Spot official monthly 1m ZIPs",
           "quote":"USDT","scope":"latest_verified_closed_month",
           "is_live":False,"max_is_all_time":False,"archived_assets":len(metas),
           "assets":metas}
    (folder/"index.json").write_text(json.dumps(index,ensure_ascii=False,indent=2)+"\n")
    return index

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--output",type=Path,default=DEST)
    p.add_argument("--workers",type=int,default=4)
    args=p.parse_args()
    need(1<=args.workers<=6,"Unsafe number of worker processes")
    selected=pick(json.loads(CATALOG.read_text()))
    results=[]
    with tempfile.TemporaryDirectory(prefix="seven-shared-view-") as temp:
        with ThreadPoolExecutor(max_workers=args.workers) as pool:
            jobs={pool.submit(prepare_one,asset,temp):asset["id"] for asset in selected}
            for job in as_completed(jobs):
                name,packed,meta=job.result()
                results.append((name,packed,meta))
                print("SHARED MONTH "+json.dumps({"id":meta["id"],"month":meta["month"],
                      "native_1m_count":meta["native_1m_count"],
                      "bytes":meta["bytes"]}),flush=True)
    index=emit(results,args.output)
    need(index["archived_assets"]==len(selected),"Lost asset projections")
    print("SHARED HISTORICAL VIEWS "+json.dumps({
         "archived_assets":index["archived_assets"],
         "native_1m_bars_represented":sum(a["native_1m_count"] for a in index["assets"]),
         "quote":"USDT","mode":"verified one-month derived projections"},sort_keys=True))

if __name__=="__main__":
    main()
