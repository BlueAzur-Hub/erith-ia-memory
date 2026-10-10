#!/usr/bin/env python3
"""Federate *verified* Bitget Spot monthly source ZIPs with the frozen Binance vault.

Separate native 7-column Bitget payloads from Binance's 12-column source ZIPs.
Never invent trade_count, convert USDT->USD, infer genesis or overwrite old
legacy hourly/monthly views. Publishes a source-fingerprinted extension index.
"""
from __future__ import annotations
import argparse
import csv
import datetime as dt
from decimal import Decimal, InvalidOperation
import hashlib
import io
import json
import math
from pathlib import Path
import re
import subprocess
from urllib.request import Request,urlopen
import zipfile

import import_historical_bulk as bulk
import build_historical_shared_views as shared
import probe_native_bitget_spot as probe
import collect_native_bitget_month as bitget

HOME=shared.HOME
CATALOG=HOME/"top250_history_catalog/index.json"
ALT=HOME/"bitget_verified_views"
FEDERATED=HOME/"top250_multisource_coverage/index.json"
INDEX_SCHEMA="aerith.public.ohlcv.verified-bitget-spot-month-views.v1"
VIEW_SCHEMA="aerith.public.ohlcv.verified-bitget-spot-month.v1"
FEDERATED_SCHEMA="aerith.public.ohlcv.top250.federated-native-archives.v1"
TAG=re.compile(r"^crypto-spot-bitget-(20\d{2}-(?:0[1-9]|1[0-2]))-1m-([a-z0-9-]{2,100})$")
ZIP_MAX=10_000_000
CSV_MAX=30_000_000
MANIFEST_MAX=200_000
COLUMNS=("open_time_ms","open","high","low","close","base_volume","quote_turnover")

def need(ok,msg):
    if not ok:raise ValueError(msg)

def digest(raw):
    return hashlib.sha256(raw).hexdigest()

def source_candidates(catalog,exact,official):
    return {a["id"]:a for a in probe.candidates(catalog,exact,official)}

def listed_tags():
    cp=subprocess.run(["gh","release","list","--limit","1000",
                      "--json","tagName,isDraft"],check=True,
                      capture_output=True,text=True,timeout=45)
    tags=json.loads(cp.stdout)
    need(isinstance(tags,list) and len(tags)<1000,"Release pagination incomplete")
    return [r["tagName"] for r in tags if not r.get("isDraft")
            and TAG.fullmatch(r.get("tagName",""))]

def release_info(tag):
    need(TAG.fullmatch(tag) is not None,"Unsafe Bitget historical source tag")
    cp=subprocess.run(["gh","release","view",tag,"--json",
                       "assets,isDraft"],check=True,capture_output=True,
                      text=True,timeout=50)
    item=json.loads(cp.stdout)
    need(item.get("isDraft") is False and isinstance(item.get("assets"),list),
         "Unpublished or malformed historical Bitget Release")
    indexed={a["name"]:a for a in item["assets"]}
    need(len(indexed)==len(item["assets"]),"Duplicate Release source file")
    return indexed

def download(tag,name,max_bytes=ZIP_MAX,reader=urlopen):
    need(TAG.fullmatch(tag) is not None and
         (name=="manifest.json" or
          re.fullmatch(r"[A-Z0-9]{2,30}USDT-1m-20\d{2}-(?:0[1-9]|1[0-2])\.zip",name)),
         "Unsafe Bitget source filename")
    uri=("https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/"
         +tag+"/"+name)
    request=Request(uri,headers={"User-Agent":"SevenHeaven-TrueBitgetSourceReader",
                                  "Accept":"application/octet-stream"})
    with reader(request,timeout=95) as response:
        need(response.status==200,"Bitget GitHub release source returned non-200")
        body=response.read(max_bytes+1)
    need(0<len(body)<=max_bytes,"Native Bitget Release too large or empty")
    return body

def check_source(raw,asset,month):
    """Verify every actual native Bitget source row, including exact minute count."""
    expected_start,expected,_=bulk.bounds(month,"1m")
    name=asset["pair"]+"-1m-"+month+".csv"
    rows=[]
    with zipfile.ZipFile(io.BytesIO(raw)) as archive:
        need(archive.namelist()==[name],"Bitget ZIP source identity mismatch")
        member=archive.getinfo(name)
        need(0<member.file_size<=CSV_MAX and member.compress_size>0
             and member.file_size<=max(member.compress_size*200,100000),
             "Unsafe Bitget 1m CSV expansion")
        with archive.open(member) as content:
            reader=csv.reader(io.TextIOWrapper(content,encoding="utf-8-sig",
                                               newline=""))
            for fields in reader:
                need(len(fields)==7,"Bitget source must have exactly seven native fields")
                ts=int(fields[0])
                need(ts==expected_start+len(rows)*60000,
                     "Missing, duplicated or misaligned native Bitget minute")
                try:
                    numbers=[Decimal(f) for f in fields[1:]]
                except (InvalidOperation,TypeError) as e:
                    raise ValueError("Bitget native source decimal invalid") from e
                need(all(v.is_finite() for v in numbers),"Nonfinite Bitget price")
                o,h,l,c,volume,quote=numbers
                need(min(o,h,l,c)>0 and l<=min(o,c) and max(o,c)<=h
                     and volume>=0 and quote>=0,"Invalid genuine Spot OHLCV")
                rows.append([ts,*[float(v) for v in numbers]])
                need(len(rows)<=expected,"Too many source one-minute bars")
    need(len(rows)==expected,"Native Bitget full calendar month incomplete")
    return rows

def aggregate(rows,step):
    need(step in (300000,3600000) and rows,"Unsupported derived interval")
    bars=[];prior=None
    for ts,o,h,l,c,v,q in rows:
        need(ts%60000==0 and (prior is None or ts==prior+60000),
             "One-minute data is not authentic and contiguous")
        prior=ts
        time_bucket=ts//step*step
        if not bars or bars[-1][0]!=time_bucket:
            bars.append([time_bucket,o,h,l,c,v,q])
        else:
            item=bars[-1]
            item[2]=max(item[2],h);item[3]=min(item[3],l)
            item[4]=c;item[5]+=v;item[6]+=q
    for bar in bars:
        bar[5]=round(bar[5],12)
        bar[6]=round(bar[6],12)
    return bars

def verify_release(tag,asset,metadata=release_info,downloader=download):
    match=TAG.fullmatch(tag)
    need(match is not None and match.group(2)==asset["id"],
         "Bitget tag CoinGecko identity mismatch")
    month=match.group(1)
    named=metadata(tag)
    archive_file=asset["pair"]+"-1m-"+month+".zip"
    need(set(named)=={"manifest.json",archive_file},
         "Unexpected or missing immutable source files")
    manifest_raw=downloader(tag,"manifest.json",MANIFEST_MAX)
    need(named["manifest.json"].get("digest")=="sha256:"+digest(manifest_raw) and
         len(manifest_raw)==named["manifest.json"].get("size"),
         "Bitget manifest GitHub asset checksum mismatch")
    m=json.loads(manifest_raw)
    need(m.get("schema")==bitget.SCHEMA and m.get("native_month_proven") is True
         and m.get("not_exchange_signed") is True and
         m.get("no_synthetic_candles") is True and
         m.get("source")==bitget.SOURCE and m.get("quote")=="USDT"
         and m.get("month")==month and m.get("interval")=="1m"
         and m.get("requested")==m.get("verified")==1
         and m.get("unavailable")==0 and len(m.get("assets",[]))==1,
         "Unqualified Bitget month source manifest")
    row=m["assets"][0]
    need(row.get("asset_id")==asset["id"] and row.get("rank")==asset["rank"]
         and row.get("pair")==asset["pair"] and row.get("quote")=="USDT"
         and row.get("source")==bitget.SOURCE and row.get("status")=="verified"
         and row.get("file")==archive_file and row.get("candles")==bulk.bounds(month,"1m")[1]
         and m.get("native_source_columns")==[
             "timestamp","open","high","low","close","base_volume","quote_turnover"],
         "Bitget native source asset ID, month or true field count mismatch")
    zip_raw=downloader(tag,archive_file)
    need(named[archive_file].get("digest")=="sha256:"+digest(zip_raw)
         and row.get("sha256")==digest(zip_raw)
         and row.get("zip_bytes")==len(zip_raw),
         "Bitget original ZIP SHA256 differs from Release manifest")
    rows=check_source(zip_raw,asset,month)
    return {"asset_id":asset["id"],"rank":asset["rank"],"month":month,
            "pair":asset["pair"],"release":tag,"file":archive_file,
            "source_zip_sha256":digest(zip_raw),"native_1m_count":len(rows),
            "rows":rows}

def projection(proven):
    rows=proven["rows"]
    data={"schema":VIEW_SCHEMA,"asset_id":proven["asset_id"],
          "pair":proven["pair"],"quote":"USDT",
          "source":bitget.SOURCE,"is_live":False,
          "not_exchange_signed":True,"trade_count_available":False,
          "native_columns":list(COLUMNS),
          "month":proven["month"],"first_open_ms":rows[0][0],
          "last_open_ms":rows[-1][0],"native_1m_count":len(rows),
          "source_release":proven["release"],
          "source_zip_sha256":proven["source_zip_sha256"],
          "series":{"1m":rows[-1440:],
                    "5m":aggregate(rows[-min(43200,len(rows)):],300000),
                    "1h":aggregate(rows,3600000)}}
    need(len(data["series"]["1m"])==1440 and
         len(data["series"]["5m"])>=8064 and
         len(data["series"]["1h"]) in (672,696,720,744),
         "Native Bitget historical projection broken")
    return data

def federate(catalog,items):
    ids={a["id"] for a in catalog["assets"] if a["months"]}
    fresh={}
    for a in items:
        need(a["id"] not in ids and a["id"] not in fresh,
             "Conflicting Binance/Bitget CoinGecko source owners")
        fresh[a["id"]]=a
    result=[]
    for a in catalog["assets"]:
        alternate=fresh.get(a["id"])
        if alternate:
            result.append({"id":a["id"],"rank":a["rank"],"symbol":a["symbol"],
              "name":a["name"],"source":"Bitget Spot native 1m HTTPS",
              "quote":"USDT","months":alternate["months"],
              "native_1m_count":alternate["native_1m_count"]})
        else:
            result.append({"id":a["id"],"rank":a["rank"],"symbol":a["symbol"],
              "name":a["name"],"source":"Binance Spot official native 1m ZIPs" if a["months"] else None,
              "quote":"USDT","months":len(a["months"]),
              "native_1m_count":a["candles"]})
    have=sum(bool(x["months"]) for x in result)
    minutes=sum(x["native_1m_count"] for x in result)
    need(have==catalog["archived_assets"]+len(fresh) and
         minutes==catalog["native_1m_candles"]+
            sum(x["native_1m_count"] for x in fresh.values()),
         "Native federated archived ownership or one-minute count inconsistent")
    return {"schema":FEDERATED_SCHEMA,"ranked":250,"quote":"USDT",
       "archived_assets":have,"binance_archived_assets":catalog["archived_assets"],
       "bitget_archived_assets":len(fresh),"native_1m_candles":minutes,
       "first_trade_date_known":False,"is_live":False,
       "note":"Two independent complete-month source formats. Native Bitget 7 fields; no synthetic trade count, no USDT=>USD.",
       "groups":[{"top":k,"archived":sum(bool(x["months"]) for x in result[:k])}
                 for k in (10,50,100,250)],
       "assets":result}

def build(catalog,exact,official,tags,metadata=release_info,downloader=download):
    candidates=source_candidates(catalog,exact,official)
    tags=[t for t in tags if TAG.fullmatch(t) and TAG.fullmatch(t).group(2) in candidates]
    need(len(tags)==len(set(tags)) and len(tags)<=250,
         "Duplicate or unbounded native Bitget historical releases")
    collections={}
    latest={}
    for tag in tags:
        asset=candidates[TAG.fullmatch(tag).group(2)]
        source=verify_release(tag,asset,metadata,downloader)
        cid=asset["id"]
        collections.setdefault(cid,[]).append(source)
        if cid not in latest or latest[cid]["month"]<source["month"]:
            latest[cid]=source
    projections=[]
    for cid,source in latest.items():
        asset=candidates[cid]
        view=projection(source)
        raw=shared.pack(view)
        name=cid+"-bitget-month.json.gz"
        months=sorted({x["month"] for x in collections[cid]})
        projections.append((name,raw,{
          "id":cid,"rank":asset["rank"],"symbol":asset["symbol"],
          "pair":asset["pair"],"quote":"USDT","month":source["month"],
          "months":months,"file":name,"sha256":digest(raw),"bytes":len(raw),
          "native_1m_count":len(source["rows"]),
          "source_zip_sha256":source["source_zip_sha256"],
          "release":source["release"],
          "first_open_ms":view["first_open_ms"],
          "last_open_ms":view["last_open_ms"],
          "series_counts":{k:len(v) for k,v in view["series"].items()}
        }))
    metas=[m for _,_,m in sorted(projections,key=lambda v:v[2]["rank"])]
    altindex={"schema":INDEX_SCHEMA,"quote":"USDT","source":bitget.SOURCE,
          "not_exchange_signed":True,"trade_count_available":False,
          "archived_assets":len(metas),"assets":metas}
    owner=[{"id":a["id"],"months":len(collections[a["id"]]),
            "native_1m_count":sum(len(x["rows"]) for x in collections[a["id"]])}
           for a in metas]
    combined=federate(catalog,owner)
    return projections,altindex,combined

def main():
    cli=argparse.ArgumentParser()
    cli.add_argument("--plan",action="store_true")
    cli.add_argument("--build",action="store_true")
    args=cli.parse_args()
    need(args.plan!=args.build,"Choose --plan or --build")
    catalog=json.loads(CATALOG.read_text())
    exact=json.loads(probe.EXACT.read_text())
    official=json.loads(probe.INSTRUMENTS.read_text())
    if args.plan:
        print("SPOT MULTISOURCE SOURCE PLAN "+json.dumps({
          "binance":catalog["archived_assets"],
          "bitget_exact_id_candidates":list(source_candidates(catalog,exact,official)),
          "native_column_schemas":[12,7],
          "full_native_months_not_assumed":True},sort_keys=True))
        return
    projections,altindex,combined=build(catalog,exact,official,listed_tags())
    need(combined["archived_assets"]>catalog["archived_assets"],
         "No new full verified Spot archive to federate")
    ALT.mkdir(parents=True,exist_ok=True)
    for name,raw,m in projections:
        need(digest(raw)==m["sha256"],"Derived native Bitget projection changed")
        (ALT/name).write_bytes(raw)
    (ALT/"index.json").write_text(json.dumps(altindex,indent=2,sort_keys=True)+"\n")
    FEDERATED.parent.mkdir(parents=True,exist_ok=True)
    FEDERATED.write_text(json.dumps(combined,indent=2,
                                    ensure_ascii=False)+"\n")
    print("VERIFIED SPOT MULTISOURCE SUMMARY "+json.dumps({
      "binance":combined["binance_archived_assets"],
      "bitget":combined["bitget_archived_assets"],
      "total":combined["archived_assets"],
      "native_1m":combined["native_1m_candles"]},sort_keys=True))

if __name__=="__main__":
    main()
