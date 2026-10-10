#!/usr/bin/env python3
"""Verified monthly 1m ZIPs -> bounded continuous hourly histories for all archived assets.

Never modifies 1m source Releases, monthly projections or market/trader caches.
A missing calendar month terminates the contiguous suffix instead of faking candles.
"""
from __future__ import annotations
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import json
from pathlib import Path
import re
import tempfile

import build_historical_shared_views as shared
import build_historical_btc_view as candles

HOME=shared.HOME
CATALOG=shared.CATALOG
OUTPUT=HOME/"shared_hourly_views"
SCHEMA="aerith.public.ohlcv.shared.contiguous-hourly-history.v1"
INDEX_SCHEMA="aerith.public.ohlcv.shared.contiguous-hourly-index.v1"
MAX_MONTHS=12
MAX_ASSETS=250

def need(ok,why):
    if not ok:raise ValueError(why)

def contiguous_suffix(row):
    """Only contiguous closed full months, newest first; stop at the first gap."""
    entries=sorted(row.get("months",[]),key=lambda x:x["month"])
    if not entries:return []
    need(len({x["month"] for x in entries})==len(entries),"Duplicate monthly archive for asset")
    selected=[entries[-1]]
    for previous in reversed(entries[:-1]):
        if candles.month_previous(selected[-1]["month"])!=previous["month"]:
            break
        selected.append(previous)
        if len(selected)>=MAX_MONTHS:break
    return list(reversed(selected))

def select(catalog):
    qualified=shared.pick(catalog)
    by_id={a["id"]:a for a in catalog["assets"]}
    work=[]
    for asset in qualified:
        segments=contiguous_suffix(by_id[asset["id"]])
        need(len(segments)>0 and len(segments)<=MAX_MONTHS and
             segments[-1]["month"]==asset["month"],"Source month chain invalid")
        jobs=[]
        for seg in segments:
            month=seg["month"]
            item={**asset,**seg}
            need(item["file"]==item["pair"]+"-1m-"+month+".zip" and
                 item["pair"]==asset["pair"] and
                 re.fullmatch(r"crypto-spot-bulk-(?:20\d{2}-\d{2}-1m|add-20\d{2}-\d{2}-1m-[a-f0-9]{12})",
                              item["release"]) is not None,
                 "Unsafe historical source mapping")
            jobs.append(item)
        work.append((asset,jobs))
    need(0<len(work)<=MAX_ASSETS,"No qualified historical assets")
    return work

def from_rows(asset,sources):
    """A sequence of monthly OHLCV 1h datasets, validated at minute precision upstream."""
    history=[];proof=[];last=None;native=0
    for meta,rows in sources:
        need(meta["id"]==asset["id"] and meta["pair"]==asset["pair"],
             "Cross-market history attempted")
        start=rows[0][0];stop=rows[-1][0]
        if last is not None:
            need(start==last+60000,"Discontinuous historical months")
        hours=candles.aggregate(rows,3600000)
        need(len(hours) in (672,696,720,744),"Incomplete hourly monthly series")
        if history:
            need(hours[0][0]==history[-1][0]+3600000,
                 "Missing hourly source sequence")
        history.extend(hours)
        proof.append({"month":meta["month"],"release":meta["release"],
                      "source_zip_sha256":meta["sha256"],"native_1m_count":len(rows)})
        native+=len(rows)
        last=stop
    need(0<len(proof)<=MAX_MONTHS and len(history)<=8784 and
         len(history)==native//60,
         "Bounded monthly hourly history inconsistent")
    return {"schema":SCHEMA,"asset_id":asset["id"],"pair":asset["pair"],
            "quote":"USDT","source":"Binance Spot official monthly 1m ZIPs",
            "is_live":False,"max_is_all_time":False,
            "scope":"contiguous_verified_closed_months",
            "first_open_ms":history[0][0],"last_open_ms":history[-1][0],
            "native_1m_count":native,"source_months":proof,
            "columns":candles.COLS,"interval":"1h","series":history}

def build_one(item,root):
    asset,sources=item
    verified=[]
    for src in sources:
        folder=shared.source_folder(src,root)
        rows=shared.source_record(src,folder)
        verified.append((src,rows))
    data=from_rows(asset,verified)
    binary=shared.pack(data)
    filename=asset["id"]+"-hourly.json.gz"
    meta={"id":asset["id"],"rank":asset["rank"],"name":asset["name"],
          "symbol":asset["symbol"],"pair":asset["pair"],
          "quote":"USDT","first_open_ms":data["first_open_ms"],
          "last_open_ms":data["last_open_ms"],
          "native_1m_count":data["native_1m_count"],
          "months":len(data["source_months"]),"first_month":data["source_months"][0]["month"],
          "last_month":data["source_months"][-1]["month"],
          "first_source_release":data["source_months"][0]["release"],
          "last_source_release":data["source_months"][-1]["release"],
          "hourly_count":len(data["series"]),
          "file":filename,"bytes":len(binary),"sha256":shared.digest(binary)}
    return filename,binary,meta

def emit(results,destination):
    need(0<len(results)<=MAX_ASSETS,"Missing historical projections")
    folder=Path(destination)
    folder.mkdir(parents=True,exist_ok=True)
    metas=[]
    for name,raw,meta in sorted(results,key=lambda t:t[2]["rank"]):
        need(name==meta["id"]+"-hourly.json.gz" and
             shared.digest(raw)==meta["sha256"],"Corrupted projected file")
        (folder/name).write_bytes(raw)
        metas.append(meta)
    index={"schema":INDEX_SCHEMA,"source":"Binance Spot official monthly 1m ZIPs",
           "quote":"USDT","is_live":False,"max_is_all_time":False,
           "scope":"contiguous_verified_closed_months",
           "archived_assets":len(metas),"assets":metas}
    (folder/"index.json").write_text(json.dumps(index,indent=2,ensure_ascii=False)+"\n")
    return index

def main():
    cli=argparse.ArgumentParser()
    cli.add_argument("--output",type=Path,default=OUTPUT)
    cli.add_argument("--workers",type=int,default=4)
    args=cli.parse_args()
    need(1<=args.workers<=4,"Excessive historical workers")
    selected=select(json.loads(CATALOG.read_text()))
    with tempfile.TemporaryDirectory(prefix="seven-hourly-history-") as temp:
        out=[]
        with ThreadPoolExecutor(max_workers=args.workers) as pool:
            jobs={pool.submit(build_one,item,temp):item[0]["id"] for item in selected}
            for future in as_completed(jobs):
                name,blob,meta=future.result()
                out.append((name,blob,meta))
                print("HOURLY HISTORICAL "+json.dumps({"id":meta["id"],
                      "months":meta["months"],"hourly":meta["hourly_count"],
                      "native_1m":meta["native_1m_count"],"compressed":meta["bytes"]}),
                      flush=True)
    index=emit(out,args.output)
    need(index["archived_assets"]==len(selected),"Catalog/output mismatch")
    print("HOURLY HISTORICAL SUMMARY "+json.dumps({
         "assets":index["archived_assets"],
         "with_60d":sum(m["hourly_count"]>=1440 for m in index["assets"]),
         "with_90d":sum(m["hourly_count"]>=2160 for m in index["assets"]),
         "with_1y":sum(m["hourly_count"]>=8760 for m in index["assets"]),
         "native_1m_represented":sum(m["native_1m_count"] for m in index["assets"])},
         sort_keys=True),flush=True)

if __name__=="__main__":main()
