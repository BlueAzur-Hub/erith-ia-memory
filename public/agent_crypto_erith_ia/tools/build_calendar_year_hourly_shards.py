#!/usr/bin/env python3
"""Incremental calendar-year hourly views of every truly verified source month.

The existing last-12-month chart stays intact. This is a SEPARATE derived
read-only archive; each calendar-year segment is downloaded on demand later.
Every hourly candle comes solely from SHA256-checked native Binance Spot ZIPs.
The year of the first available ZIP is NOT proof of the first trade or launch.
"""
from __future__ import annotations
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import json
from pathlib import Path
import re
import tempfile

import build_historical_shared_views as shared
import build_historical_btc_view as candle
import build_historical_year_depth as depth

HOME=shared.HOME
CATALOG=shared.CATALOG
OUTPUT=HOME/"calendar_year_hourly_shards"
SCHEMA="aerith.public.ohlcv.calendar-year-hourly-shard.v1"
INDEX_SCHEMA="aerith.public.ohlcv.calendar-year-hourly-shard-index.v1"
MAX_BATCH=4
ASSET=re.compile(r"^[a-z0-9-]{1,90}$")

def need(ok,msg):
    if not ok:raise ValueError(msg)

def signature(row):
    refs=[{key:x[key] for key in ("month","pair","file","sha256","candles","release")}
          for x in sorted(row["months"],key=lambda a:a["month"])]
    return hashlib.sha256(json.dumps(refs,sort_keys=True,separators=(",",":")).encode()).hexdigest()

def candidates(catalog):
    verified=depth.build(catalog)
    by_id={a["id"]:a for a in catalog["assets"]}
    return [(a,by_id[a["id"]]) for a in verified["assets"]
            if a["verified_months"]>0]

def annual_groups(info,asset):
    """No 12-month ceiling. Split only by source gaps and calendar-year edges."""
    known={r["month"]:r for r in asset["months"]}
    groups=[]
    for shard in info["year_shards"]:
        month_refs=[known[m] for m in shard["months"]]
        need(len(month_refs)==len(shard["months"])
             and all(m["month"].startswith(str(shard["year"])) for m in month_refs),
             "Annual native month mapping broken")
        groups.append({"year":shard["year"],"span":shard["span"],
                       "source_months":month_refs})
    return groups

def aggregate_group(asset,group,temp_root):
    source_months=group["source_months"]
    need(0<len(source_months)<=12,"Unbounded per-year original source list")
    points=[];minutes=0;proven=[]
    last=None
    for src in source_months:
        full={"id":asset["id"],"pair":src["pair"],"month":src["month"],
              "file":src["file"],"release":src["release"],
              "sha256":src["sha256"],"candles":src["candles"]}
        rows=shared.source_record(full,shared.source_folder(full,temp_root))
        need(len(rows)==src["candles"],"Native minute loss in annual shard")
        if last is not None:
            need(rows[0][0]==last+60_000,"Source gap inside annual shard")
        hours=candle.aggregate(rows,3_600_000)
        need(len(hours)==len(rows)//60 and len(rows)%60==0,
             "Invalid hourly aggregation of source minutes")
        if points:
            need(hours[0][0]==points[-1][0]+3_600_000,
                 "Discontinuous hourly annual shard")
        points.extend(hours)
        minutes+=len(rows)
        last=rows[-1][0]
        proven.append({"month":src["month"],"release":src["release"],
                       "source_zip_sha256":src["sha256"],
                       "native_1m_count":len(rows)})
    need(points and minutes==len(points)*60,
         "Source minutes are not a continuous hourly series")
    return {"schema":SCHEMA,"asset_id":asset["id"],"pair":source_months[0]["pair"],
            "source":"Binance Spot official monthly native 1m ZIPs",
            "quote":"USDT","is_live":False,
            "token_creation_date_known":False,
            "first_trade_date_known":False,
            "year":group["year"],"contiguous_span":group["span"],
            "first_open_ms":points[0][0],"last_open_ms":points[-1][0],
            "native_1m_count":minutes,"interval":"1h",
            "columns":candle.COLS,"source_months":proven,"series":points}

def build_asset(info,asset,root):
    need(ASSET.fullmatch(asset["id"]) is not None,"Unsafe CoinGecko asset ID")
    files=[]
    for group in annual_groups(info,asset):
        data=aggregate_group(asset,group,root)
        compressed=shared.pack(data)
        filename=(asset["id"]+"-"+str(group["year"])+"-span"+
                  str(group["span"])+".json.gz")
        files.append((filename,compressed,{
            "file":filename,"year":group["year"],"span":group["span"],
            "first_open_ms":data["first_open_ms"],
            "last_open_ms":data["last_open_ms"],
            "first_month":data["source_months"][0]["month"],
            "last_month":data["source_months"][-1]["month"],
            "hourly_count":len(data["series"]),
            "native_1m_count":data["native_1m_count"],
            "source_months":data["source_months"],
            "sha256":shared.digest(compressed),"bytes":len(compressed)}))
    return files

def verify_existing(old,folder,catalog):
    existing={}
    if old is None:return existing
    need(old.get("schema")==INDEX_SCHEMA
         and isinstance(old.get("assets"),list),"Previous annual index invalid")
    ranked={x["id"]:x for x in catalog["assets"]}
    for a in old["assets"]:
        entry=ranked.get(a["id"])
        if not entry or not entry["months"] or a.get("source_signature")!=signature(entry):
            continue
        valid=True
        for shard in a.get("shards",[]):
            f=shard.get("file")
            if (not isinstance(f,str) or
                not f.startswith(a["id"]+"-") or
                not re.fullmatch(r"[a-z0-9-]+-\d{4}-span\d+\.json\.gz",f) or
                not (folder/f).is_file() or
                shared.digest((folder/f).read_bytes())!=shard.get("sha256")):
                valid=False;break
        if valid and a.get("shards"):
            existing[a["id"]]=a
    return existing

def build(catalog,folder,limit=2,workers=2):
    need(1<=limit<=MAX_BATCH and 1<=workers<=2,"Unsafe daily backfill limit")
    folder=Path(folder);folder.mkdir(parents=True,exist_ok=True)
    previous_file=folder/"index.json"
    previous=json.loads(previous_file.read_text()) if previous_file.exists() else None
    existing=verify_existing(previous,folder,catalog)
    candidates_all=candidates(catalog)
    queued=[(info,row) for info,row in candidates_all if row["id"] not in existing]
    picked=queued[:limit]
    with tempfile.TemporaryDirectory(prefix="seven-yearly-view-") as td:
        with ThreadPoolExecutor(max_workers=workers) as pool:
            tasks={pool.submit(build_asset,info,row,Path(td)):row
                   for info,row in picked}
            for job in as_completed(tasks):
                row=tasks[job]
                files=job.result()
                for name,raw,meta in files:
                    target=folder/name
                    if target.exists():
                        need(target.read_bytes()==raw,
                             "Immutable yearly chunk collision")
                    else:
                        target.write_bytes(raw)
                existing[row["id"]]={
                    "id":row["id"],"rank":row["rank"],"name":row["name"],
                    "symbol":row["symbol"],"pair":row["months"][-1]["pair"],
                    "quote":"USDT","source_signature":signature(row),
                    "verified_months":len(row["months"]),
                    "shards":[meta for _,_,meta in files]}
                print("VERIFIED YEARLY HISTORY "+json.dumps({
                    "id":row["id"],"months":len(row["months"]),
                    "year_shards":len(files)},sort_keys=True),flush=True)
    metas=sorted(existing.values(),key=lambda x:x["rank"])
    index={"schema":INDEX_SCHEMA,
           "source":"Binance Spot original checked monthly 1m ZIPs",
           "quote":"USDT","is_live":False,
           "ranked":250,"source_catalog_archived":catalog["archived_assets"],
           "materialized_assets":len(metas),
           "remaining_archived_assets":catalog["archived_assets"]-len(metas),
           "year_shards":sum(len(a["shards"]) for a in metas),
           "max_is_all_time":False,
           "first_exchange_trade_date_not_proven":True,
           "assets":metas}
    need(index["remaining_archived_assets"]>=0,"Invalid archival coverage")
    tmp=folder/"index.tmp"
    tmp.write_text(json.dumps(index,indent=2,ensure_ascii=False)+"\n")
    tmp.replace(folder/"index.json")
    return index

def main():
    cli=argparse.ArgumentParser()
    cli.add_argument("--output",type=Path,default=OUTPUT)
    cli.add_argument("--batch-size",type=int,default=2)
    cli.add_argument("--plan",action="store_true")
    args=cli.parse_args()
    catalog=json.loads(CATALOG.read_text())
    need(1<=args.batch_size<=MAX_BATCH,"Unsafe batch size")
    if args.plan:
        rows=candidates(catalog)
        print("YEAR-SHARDED HISTORY PLAN "+json.dumps({
            "archive_assets":catalog["archived_assets"],
            "first_assets":[{"id":a["id"],"months":a["verified_months"],
              "annual_shards":len(a["year_shards"])} for a,_ in rows[:args.batch_size]],
            "old_12_month_cutoff_removed_for_this_view":True,
            "source_inception_unknown":True},sort_keys=True),flush=True)
        return
    index=build(catalog,args.output,args.batch_size)
    print("YEAR-SHARDED HISTORICAL SUMMARY "+json.dumps({
        "materialized_assets":index["materialized_assets"],
        "year_shards":index["year_shards"],
        "remaining":index["remaining_archived_assets"]},sort_keys=True),flush=True)

if __name__=="__main__":
    main()
