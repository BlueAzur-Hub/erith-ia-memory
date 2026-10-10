#!/usr/bin/env python3
"""Immutable monthly Bitget Spot 1m source importer; never reconstruct missing candles.

Separate from Binance monthly archives and the Trader. This is a source
acquisition stage; the canonical Top250 catalog changes only after a second
independent catalog/reader compatibility review.
"""
from __future__ import annotations
import argparse
import calendar
import csv
import datetime as dt
from decimal import Decimal, InvalidOperation
import hashlib
import io
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import zipfile

import probe_native_bitget_spot as proof

SCHEMA="aerith.public.ohlcv.spot.bitget-native-month.index.v1"
SOURCE="Bitget Spot public native 1m API"
PAIR=proof.PAIR
MONTH=re.compile(r"^20\d{2}-(?:0[1-9]|1[0-2])$")
LIMIT=1000
STEP=60_000
MAX_ASSETS=3
MAX_PAGES=50
MAX_RESPONSE=800_000
MAX_ZIP=8_000_000
API=proof.API
HISTORY_API="https://api.bitget.com/api/v3/market/history-candles"
HISTORY_LIMIT=100

def require(ok,msg):
    if not ok:raise ValueError(msg)

def bounds(month):
    require(MONTH.fullmatch(month) is not None,"Unsafe source month")
    y,m=map(int,month.split("-"))
    start=dt.datetime(y,m,1,tzinfo=dt.timezone.utc)
    next_month=dt.datetime(y+int(m==12),m%12+1,1,tzinfo=dt.timezone.utc)
    count=calendar.monthrange(y,m)[1]*1440
    require(next_month<=dt.datetime.now(dt.timezone.utc).replace(day=1,hour=0,
                 minute=0,second=0,microsecond=0),
                 "Only fully closed native months may be archived")
    return int(start.timestamp()*1000),int(next_month.timestamp()*1000),count

def fetch_page(pair,start,end,count,opener=urllib.request.urlopen,endpoint=API):
    max_rows=HISTORY_LIMIT if endpoint==HISTORY_API else LIMIT
    require(endpoint in (API,HISTORY_API) and
            PAIR.fullmatch(pair) is not None and
            1<=count<=max_rows and end-start==count*STEP and
            start%STEP==0 and end%STEP==0,
            "Unsafe native Bitget paging request")
    params=urllib.parse.urlencode({"category":"SPOT","symbol":pair,"interval":"1m",
        "startTime":start-STEP,"endTime":end-STEP,"type":"market","limit":count})
    req=urllib.request.Request(endpoint+"?"+params,headers={
         "User-Agent":"SevenHeaven-NativeHistoricalArchive/1.0",
         "Accept":"application/json"})
    last=None
    for attempt in range(3):
        try:
            with opener(req,timeout=40) as response:
                require(response.status==200,"Bitget native response HTTP non-200")
                raw=response.read(MAX_RESPONSE+1)
            require(0<len(raw)<=MAX_RESPONSE,"Native source response size invalid")
            obj=json.loads(raw)
            require(obj.get("code")=="00000" and isinstance(obj.get("data"),list),
                    "Bitget native Spot API returned an error")
            return obj["data"],hashlib.sha256(raw).hexdigest()
        except urllib.error.HTTPError as exc:
            last=exc
            if exc.code not in (408,429,500,502,503,504) or attempt==2:break
            time.sleep(2**attempt)
        except (OSError,TimeoutError,ValueError,json.JSONDecodeError) as exc:
            last=exc
            if attempt==2:break
            time.sleep(2**attempt)
    raise RuntimeError("Source native Spot API failed: "+type(last).__name__)

def fetch_history_page(pair,start,end,count):
    """Official Bitget historical Spot API: maximum 100 genuine 1m rows per call."""
    return fetch_page(pair,start,end,count,endpoint=HISTORY_API)

def verify_page(rows,start,count):
    require(isinstance(rows,list) and len(rows)==count,"Partial native 1m page")
    raw_rows={}
    for row in rows:
        require(isinstance(row,list) and len(row)>=7,
                "Malformed native Spot 1m candle")
        ts=int(row[0])
        require(start<=ts<start+count*STEP and ts%STEP==0 and ts not in raw_rows,
                "Unaligned, duplicate or out-of-window native candle")
        vals=[]
        for field in row[1:7]:
            require(isinstance(field,(str,int,float)),"Invalid native candle field")
            try:decimal=Decimal(str(field))
            except InvalidOperation as e:raise ValueError("Invalid native decimal") from e
            require(decimal.is_finite(),"Nonfinite source value")
            vals.append(decimal)
        o,h,l,c,v,q=vals
        require(min(o,h,l,c)>0 and l<=min(o,c) and max(o,c)<=h
                and v>=0 and q>=0,"Invalid native candle price/volume")
        raw_rows[ts]=[str(ts),*[str(z) for z in row[1:7]]]
    expected=[start+i*STEP for i in range(count)]
    require(set(raw_rows)==set(expected),"Missing source minute in native page")
    return [raw_rows[t] for t in expected]

def verified_month(asset,month,fetcher=fetch_page,delay=0.12,
                   historical_fetcher=fetch_history_page):
    start,end,expected=bounds(month)
    require(expected<=MAX_PAGES*LIMIT and asset["quote"]=="USDT"
            and asset["venue"]=="bitget" and PAIR.fullmatch(asset["pair"]) is not None,
            "Invalid exact-ID Bitget month request")
    pages=[]; hashes=[]
    for at in range(start,end,LIMIT*STEP):
        count=min(LIMIT,(end-at)//STEP)
        recent=None
        try:
            rows,digest=fetcher(asset["pair"],at,at+count*STEP,count)
            recent=verify_page(rows,at,count)
        except (RuntimeError,ValueError) as exc:
            # The current-spot endpoint exposes only its recent candle range.
            # Older intervals require the separately documented history API.
            # Never accept a partial page from either endpoint.
            print("BITGET NATIVE PAGE FALLBACK "+json.dumps({
                "asset":asset["id"],"month":month,"start_ms":at,
                "reason":str(exc)[:80]},sort_keys=True),flush=True)
        if recent is not None:
            pages.extend(recent);hashes.append(digest)
        else:
            for earlier in range(at,at+count*STEP,HISTORY_LIMIT*STEP):
                size=min(HISTORY_LIMIT,(at+count*STEP-earlier)//STEP)
                rows,history_hash=historical_fetcher(
                    asset["pair"],earlier,earlier+size*STEP,size)
                try:
                    authenticated=verify_page(rows,earlier,size)
                except ValueError as exc:
                    # Diagnostic metadata only, never a replacement candle.
                    observed=[]
                    for source_row in rows[:HISTORY_LIMIT]:
                        try:
                            if isinstance(source_row,list) and source_row:
                                observed.append(int(source_row[0]))
                        except (ValueError,TypeError,OverflowError):
                            pass
                    diagnostic={"id":asset["id"],"expected_start_ms":earlier,
                      "expected_last_ms":earlier+(size-1)*STEP,"expected":size,
                      "observed":len(rows),
                      "observed_min_ms":min(observed) if observed else None,
                      "observed_max_ms":max(observed) if observed else None,
                      "reason":str(exc)}
                    # Emit complete bounded timing metadata once. The
                    # high-level manifest intentionally truncates error text.
                    print("BITGET HISTORY TIME WINDOW "+json.dumps(
                          diagnostic,sort_keys=True),flush=True)
                    raise ValueError("Historical Bitget 1m page rejected: "+
                                     json.dumps(diagnostic,sort_keys=True)) from exc
                pages.extend(authenticated)
                hashes.append(history_hash)
                if delay:time.sleep(min(delay,0.12))
        if delay and at+(LIMIT*STEP)<end:time.sleep(delay)
    require(len(pages)==expected and pages[0][0]==str(start)
            and pages[-1][0]==str(end-STEP),
            "Native Spot month is incomplete")
    return pages,hashes

def make_zip(asset,month,rows):
    start,_,expected=bounds(month)
    require(len(rows)==expected and rows[0][0]==str(start),
            "Refuse incomplete monthly native CSV")
    name=asset["pair"]+"-1m-"+month+".csv"
    buffer=io.StringIO(newline="")
    writer=csv.writer(buffer,lineterminator="\n")
    writer.writerows(rows)
    out=io.BytesIO()
    with zipfile.ZipFile(out,"w") as archive:
        info=zipfile.ZipInfo(name,date_time=(2020,1,1,0,0,0))
        info.compress_type=zipfile.ZIP_DEFLATED
        archive.writestr(info,buffer.getvalue().encode("utf-8"),
                         compress_type=zipfile.ZIP_DEFLATED,compresslevel=8)
    raw=out.getvalue()
    require(0<len(raw)<=MAX_ZIP,"Native monthly archive is oversized")
    return asset["pair"]+"-1m-"+month+".zip",raw

def release_tag(asset,month):
    require(proof.PAIR.fullmatch(asset["pair"]) is not None and
            proof.PAIR.fullmatch(asset["symbol"]+"USDT") is not None and
            asset["pair"]==asset["symbol"]+"USDT" and
            re.fullmatch(r"[a-z0-9-]{2,100}",asset["id"]) and
            MONTH.fullmatch(month) is not None,"Unsafe source release identity")
    return "crypto-spot-bitget-"+month+"-1m-"+asset["id"]

def execute_one(asset,month,folder,fetcher=fetch_page,delay=0.12,
                historical_fetcher=fetch_history_page):
    require(folder.is_dir(),"Need bounded empty working directory")
    rows,digests=verified_month(asset,month,fetcher=fetcher,delay=delay,
                               historical_fetcher=historical_fetcher)
    filename,raw=make_zip(asset,month,rows)
    sha=hashlib.sha256(raw).hexdigest()
    dest=folder/filename
    if dest.exists():
        require(hashlib.sha256(dest.read_bytes()).hexdigest()==sha,
                "Immutable monthly source collision")
    else:
        dest.write_bytes(raw)
    manifest={"schema":SCHEMA,"month":month,"interval":"1m",
              "quote":"USDT","source":SOURCE,"venue":"bitget",
              "requested":1,"verified":1,"unavailable":0,
              "candles":len(rows),"native_source_columns":
              ["timestamp","open","high","low","close","base_volume","quote_turnover"],
              "assets":[{"asset_id":asset["id"],"rank":asset["rank"],
                 "symbol":asset["symbol"],"pair":asset["pair"],
                 "quote":"USDT","source":SOURCE,"status":"verified",
                 "file":filename,"sha256":sha,"zip_bytes":len(raw),
                 "candles":len(rows),"month":month,"interval":"1m",
                 "raw_api_response_sha256":digests,
                 "historical_bytes_verified_locally":True}],
              "not_exchange_signed":True,"native_month_proven":True,
              "no_synthetic_candles":True}
    (folder/"manifest.json").write_text(json.dumps(manifest,indent=2,
                                    ensure_ascii=False,sort_keys=True)+"\n")
    return manifest

def publish(asset,month,folder,manifest):
    require(manifest.get("native_month_proven") is True and
            manifest.get("verified")==1 and
            manifest["assets"][0]["asset_id"]==asset["id"],
            "Refuse incomplete source publication")
    tag=release_tag(asset,month)
    if subprocess.run(["gh","release","view",tag,"--json","tagName"],
                       capture_output=True,timeout=35).returncode==0:
        print("EXISTING IMMUTABLE BITGET MONTH "+tag,flush=True)
        return tag
    subprocess.run(["gh","release","create",tag,
        str(folder/"manifest.json"),str(folder/manifest["assets"][0]["file"]),
        "--title","Verified native Bitget Spot 1m · "+asset["id"]+" · "+month,
        "--notes","Complete native 1m Spot USDT source, individually validated: 7 authentic fields per candle, contiguous month and ZIP SHA-256. No exchange-signed checksum claimed. Separate archive family pending Top250 catalog integration.",
        "--latest=false"],check=True,timeout=180)
    return tag

def main():
    cli=argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--plan",action="store_true")
    cli.add_argument("--collect",action="store_true")
    cli.add_argument("--month",default="2026-09")
    cli.add_argument("--limit",type=int,default=MAX_ASSETS)
    args=cli.parse_args()
    require(args.plan != args.collect,"Choose --plan or --collect")
    require(1<=args.limit<=MAX_ASSETS,"Unsafe asset limit")
    bounds(args.month)
    cat=json.loads(proof.CATALOG.read_text())
    ex=json.loads(proof.EXACT.read_text())
    spot=json.loads(proof.INSTRUMENTS.read_text())
    selected=proof.candidates(cat,ex,spot)[:args.limit]
    if args.plan:
        print("BITGET NATIVE MONTH PLAN "+json.dumps({"month":args.month,
           "assets":selected,"max_pages_each":MAX_PAGES,"archives_published":0},
           sort_keys=True),flush=True)
        return
    require(os.getenv("GITHUB_ACTIONS")=="true" and os.getenv("GH_TOKEN"),
            "Native month collection may run only under authorized GitHub Actions")
    done=[];failed=[]
    for asset in selected:
        tag=release_tag(asset,args.month)
        present=subprocess.run(["gh","release","view",tag,"--json","tagName"],
                capture_output=True,timeout=35).returncode==0
        if present:
            done.append({"id":asset["id"],"release":tag,"state":"already_published"})
            continue
        with tempfile.TemporaryDirectory(prefix="bitget-real-month-") as tmp:
            try:
                manifest=execute_one(asset,args.month,Path(tmp))
                tag=publish(asset,args.month,Path(tmp),manifest)
                done.append({"id":asset["id"],"release":tag,"state":"new_verified",
                    "candles":manifest["candles"]})
            except (OSError,ValueError,RuntimeError,TypeError,OverflowError,
                    zipfile.BadZipFile,subprocess.CalledProcessError) as exc:
                failed.append({"id":asset["id"],
                    "reason":(type(exc).__name__+": "+str(exc))[:190]})
        print("BITGET SOURCE MONTH STATUS "+json.dumps({
            "verified":len(done),"unavailable":len(failed),
            "last":asset["id"]},sort_keys=True),flush=True)
    print("BITGET NATIVE MONTH SUMMARY "+json.dumps({"month":args.month,
          "verified":done,"unavailable":failed,"catalog_updated":False},
          sort_keys=True),flush=True)

if __name__=="__main__":
    main()
