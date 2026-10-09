#!/usr/bin/env python3
"""Build a small, immutable-source BTC browser view from verified monthly Releases.

Full native 1m history remains exclusively in GitHub Releases. This module
generates a compact read-only projection; it never rewrites source candles.
"""
from __future__ import annotations
import argparse
import calendar
import csv
import datetime as dt
import gzip
import hashlib
import io
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
import zipfile

import import_historical_bulk as bulk

REPO="BlueAzur-Hub/erith-ia-memory"
OUT=bulk.ROOT/"data/historical_archive_prototype/btc_annual_view"
SCHEMA="aerith.public.ohlcv.btc.verified-monthly-view.v1"
INDEX_SCHEMA="aerith.public.ohlcv.btc.verified-monthly-index.v1"
MONTH=re.compile(r"^crypto-spot-bulk-(20\d{2}-(?:0[1-9]|1[0-2]))-1m$")
COLS=["open_time_ms","open","high","low","close","base_volume","quote_volume","trade_count"]
MAX_MONTHS=12

def need(ok,reason):
    if not ok:raise ValueError(reason)

def sha(raw):return hashlib.sha256(raw).hexdigest()

def month_previous(month):
    year,mon=map(int,month.split("-"))
    return f"{year-1:04d}-12" if mon==1 else f"{year:04d}-{mon-1:02d}"

def published_months(releases):
    found=set()
    for r in releases:
        if isinstance(r,str):r={"tagName":r,"isDraft":False}
        name=r.get("tagName")
        match=MONTH.fullmatch(name or "")
        if match and not r.get("isDraft"):found.add(match.group(1))
    need(bool(found),"No published monthly Release")
    recent=max(found)
    months=[recent]
    while len(months)<MAX_MONTHS and month_previous(months[-1]) in found:
        months.append(month_previous(months[-1]))
    need(len(months)==MAX_MONTHS,
         "BTC annual view requires twelve contiguous published monthly Releases")
    return list(reversed(months))

def aggregate(rows,step):
    """Re-aggregate authentic 1m candles; do not interpolate missing minutes."""
    result=[]
    previous=None
    for r in rows:
        t,o,h,l,c,v,q,n=r
        need(t%60000==0 and (previous is None or t==previous+60000),
             "Missing/duplicate one-minute candle in projection")
        previous=t
        key=t//step*step
        if not result or result[-1][0]!=key:
            result.append([key,o,h,l,c,v,q,n])
        else:
            b=result[-1]
            b[2]=max(b[2],h);b[3]=min(b[3],l);b[4]=c
            b[5]+=v;b[6]+=q;b[7]+=n
    for b in result:
        b[5]=round(b[5],10);b[6]=round(b[6],10)
    return result

def parse_month(raw,month):
    start,count,_=bulk.bounds(month,"1m")
    name=f"BTCUSDT-1m-{month}.csv"
    with zipfile.ZipFile(io.BytesIO(raw)) as archive:
        need(archive.namelist()==[name],"Archive CSV identity mismatch")
        with archive.open(name) as stream:
            reader=csv.reader(io.TextIOWrapper(stream,encoding="utf-8-sig",newline=""))
            rows=[]
            for f in reader:
                need(len(f)==12,"Unexpected CSV columns")
                stamp=int(f[0]);t=stamp//1000 if stamp>=10**15 else stamp
                o,h,l,c,v,q=[float(f[j]) for j in (1,2,3,4,5,7)]
                rows.append([t,o,h,l,c,v,q,int(f[8])])
    need(len(rows)==count and rows[0][0]==start and rows[-1][0]==start+(count-1)*60000,
         "Incomplete source month")
    return rows

def load_source(month,folder):
    manifest=json.loads((folder/"manifest.json").read_text())
    need(manifest.get("schema")==bulk.SCHEMA and
         manifest.get("month")==month and manifest.get("interval")=="1m",
         "Unverified Release manifest")
    found=[r for r in manifest.get("assets",[]) if r.get("asset_id")=="bitcoin" and r.get("pair")=="BTCUSDT"]
    need(len(found)==1 and found[0].get("status")=="verified" and
         found[0].get("source")=="Binance Spot public monthly CSV" and
         found[0].get("quote")=="USDT","Bitcoin identity or source not verified")
    source=found[0];name=f"BTCUSDT-1m-{month}.zip"
    need(source.get("file")==name,"Release filename mismatch")
    raw=(folder/name).read_bytes()
    need(sha(raw)==source["sha256"],"SHA-256 mismatch against official import manifest")
    checked=bulk.check_csv(raw,"BTCUSDT",month,"1m")
    need(checked["candles"]==source["candles"],"Source candle count mismatch")
    return parse_month(raw,month),{"month":month,"tag":f"crypto-spot-bulk-{month}-1m",
                                  "sha256":sha(raw),"candles":checked["candles"]}

def build(inputs):
    need(1<=len(inputs)<=MAX_MONTHS,"Invalid source months")
    times=[];sources=[]
    for month,folder in inputs:
        rows,meta=load_source(month,Path(folder))
        if times:need(rows[0][0]==times[-1][0]+60000,"Gap between validated months")
        times.extend(rows);sources.append(meta)
    need(times and len(times)<=527040,"Unbounded BTC history")
    minute=times[-1440:]
    five=aggregate(times[-43200:],300000)
    hourly=aggregate(times,3600000)
    need(len(minute)==1440 and len(five)==8640,"Latest archived windows incomplete")
    need(len(hourly) in (8760,8784),"Not one calendar year of hourly history")
    result={"schema":SCHEMA,"asset_id":"bitcoin","pair":"BTCUSDT",
            "source":"Binance Spot official monthly 1m ZIPs",
            "quote":"USDT","is_live":False,"max_is_all_time":False,
            "first_open_ms":times[0][0],"last_open_ms":times[-1][0],
            "native_1m_count":len(times),
            "columns":COLS,"sources":sources,
            "series":{"1m":minute,"5m":five,"1h":hourly}}
    return result

def write(output,data):
    output=Path(output);output.mkdir(parents=True,exist_ok=True)
    raw=json.dumps(data,separators=(",",":"),ensure_ascii=False,allow_nan=False).encode()
    stream=io.BytesIO()
    with gzip.GzipFile(filename="",mode="wb",fileobj=stream,compresslevel=9,mtime=0) as gz:
        gz.write(raw)
    compressed=stream.getvalue()
    need(0<len(compressed)<=3500000,"Browser view exceeds size limit")
    index={"schema":INDEX_SCHEMA,"file":"btc-history-year.json.gz",
           "bytes":len(compressed),"sha256":sha(compressed),"native_1m_count":data["native_1m_count"],
           "first_open_ms":data["first_open_ms"],"last_open_ms":data["last_open_ms"],
           "source_months":[x["month"] for x in data["sources"]],
           "series_counts":{key:len(value) for key,value in data["series"].items()},
           "quote":"USDT","pair":"BTCUSDT","max_is_all_time":False}
    (output/"btc-history-year.json.gz").write_bytes(compressed)
    (output/"index.json").write_text(json.dumps(index,indent=2,sort_keys=True)+"\n")
    return index

def cli():
    p=argparse.ArgumentParser()
    p.add_argument("--input-root",type=Path)
    p.add_argument("--output",type=Path,default=OUT)
    p.add_argument("--months",nargs="+")
    p.add_argument("--download",action="store_true")
    a=p.parse_args()
    need(bool(a.input_root) != bool(a.download),"Specify --input-root or --download")
    if a.download:
        proc=subprocess.run(["gh","release","list","--limit","1000","--json","tagName,isDraft"],
                            check=True,capture_output=True,text=True,timeout=60)
        months=published_months(json.loads(proc.stdout))
        with tempfile.TemporaryDirectory(prefix="aerith-btc-year-") as td:
            root=Path(td)
            for month in months:
                folder=root/month;folder.mkdir()
                subprocess.run(["gh","release","download",f"crypto-spot-bulk-{month}-1m",
                                "--pattern","BTCUSDT-1m-"+month+".zip",
                                "--pattern","manifest.json","--dir",str(folder)],
                               check=True,timeout=200)
            result=write(a.output,build([(m,root/m) for m in months]))
    else:
        need(a.months and len(a.months)==12,"Provide twelve months")
        months=a.months
        need(months==sorted(months) and all(month_previous(months[i])==months[i-1]
                        for i in range(1,len(months))),"Non-contiguous months")
        result=write(a.output,build([(m,a.input_root/m) for m in months]))
    print("BTC HISTORICAL VIEW "+json.dumps(result,sort_keys=True))

if __name__=="__main__":cli()
