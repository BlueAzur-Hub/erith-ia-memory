#!/usr/bin/env python3
"""Read-only Binance native 1m source validation for 14 non-full Top5 months.

Validate original monthly ZIP + official CHECKSUM and audit *every source row*.
Never interpolate, synthesize, or publish original price/volume data.
A missing source is not proof of no trades. No modifications to trading apps.
"""
from __future__ import annotations
import argparse
import calendar
import csv
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
import hashlib
import io
import json
from pathlib import Path
import re
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from zipfile import ZipFile, ZIP_DEFLATED, BadZipFile

M = 60_000
SOURCE = "https://data.binance.vision/data/spot/monthly/klines/"
# Exactly the non-certified months found by the source-locked year-depth index.
TARGETS = {
    "ethereum": ("ETHUSDT", ("2021-08","2021-09","2023-03")),
    "binancecoin": ("BNBUSDT", ("2021-08","2021-09","2023-03")),
    "ripple": ("XRPUSDT", ("2021-08","2021-09","2023-03")),
    "solana": ("SOLUSDT", ("2021-08","2021-09","2021-12","2023-02","2023-03")),
}
MAX_ZIP = 55_000_000
MAX_CSV = 245_000_000
SHA = re.compile(r"[0-9a-fA-F]{64}")
MONTH = re.compile(r"20\d\d-(?:0[1-9]|1[0-2])")
def need(condition, error):
    if not condition: raise ValueError(error)
def h256(b): return hashlib.sha256(b).hexdigest()
def dt_string(t):
    return datetime.fromtimestamp(t/1000, timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
def month_bounds(month):
    need(bool(MONTH.fullmatch(month)), "Invalid month")
    y,m=map(int,month.split("-"))
    first=int(datetime(y,m,1,tzinfo=timezone.utc).timestamp()*1000)
    last=first+calendar.monthrange(y,m)[1]*86_400_000
    return first,last,(last-first)//M
def source_urls(pair,month):
    need(pair in {p for p, _ in TARGETS.values()} and MONTH.fullmatch(month),
         "Unsupported exchange source")
    prefix=f"{SOURCE}{pair}/1m/{pair}-1m-{month}.zip"
    return prefix, prefix+".CHECKSUM"
def fetch(url, maximum, attempts=2):
    need(url.startswith(SOURCE) and ".." not in url, "Unexpected network endpoint")
    for n in range(attempts):
        try:
            with urlopen(Request(url,headers={"User-Agent":"Seven-Heaven-Original-Spot-OHLCV-Audit"}),timeout=65) as rs:
                need(rs.status==200, "Non-200 source")
                data=rs.read(maximum+1)
            need(0<len(data)<=maximum, "Empty / oversized source")
            return {"status":"downloaded","bytes":data}
        except HTTPError as exc:
            if exc.code in (400,403,404,410,418,429,451):
                return {"status":"http_unavailable","http_code":exc.code}
            if n==attempts-1:
                return {"status":"http_unavailable","http_code":exc.code}
        except (OSError, URLError,TimeoutError) as exc:
            if n==attempts-1:
                return {"status":"transport_unavailable","error_type":type(exc).__name__}
        time.sleep(n+1)
    return {"status":"unresolved"}
def check_checksum(check, raw, name):
    need(len(check)<=2048,"Invalid checksum length")
    line=check.decode("ascii").strip().splitlines()
    need(len(line)==1,"Invalid checksum line count")
    words=line[0].split()
    need(len(words)>=1 and SHA.fullmatch(words[0]),"Invalid official SHA")
    if len(words)>=2:
        need(words[-1].lstrip("*")==name,"Checksum belongs to wrong ZIP")
    need(words[0].lower()==h256(raw),"Official Binance ZIP hash mismatch")

def inspect_zip(raw, pair, month):
    first,last,expected=month_bounds(month)
    fname=f"{pair}-1m-{month}.csv"
    prev=None
    count=0
    zero_volume=0
    bad_close_time_count=0
    gaps=[]
    unit=None
    with ZipFile(io.BytesIO(raw)) as z:
        files=[f for f in z.infolist() if not f.is_dir()]
        need(len(files)==1 and files[0].filename==fname,"Unexpected source CSV or path")
        info=files[0]
        need(0<info.file_size<=MAX_CSV and info.compress_size>0 and
             info.file_size<=max(info.compress_size*220,160000),
             "Unsafe ZIP compression ratio")
        with z.open(info) as stream:
            rows=csv.reader(io.TextIOWrapper(stream,encoding="utf-8-sig",newline=""))
            for row in rows:
                need(len(row)==12,"Unexpected Binance native 1m columns")
                stamp=int(row[0]); nowunit="us" if stamp>=10**15 else "ms"
                need(unit is None or unit==nowunit,"Mixed native time unit")
                unit=nowunit
                t=stamp//1000 if unit=="us" else stamp
                need(first<=t<last and (t-first)%M==0,"Invalid minute or bounds")
                need(prev is None or prev<t,"Duplicate/out of order original candle")
                expected_open=first if prev is None else prev+M
                if t>expected_open:
                    gaps.append({"start_utc":dt_string(expected_open),
                                 "end_exclusive_utc":dt_string(t),
                                 "missing_minutes":(t-expected_open)//M})
                close_t=int(row[6]);close_t=close_t//1000 if unit=="us" else close_t
                if not t<=close_t<t+M: bad_close_time_count+=1
                try:
                    nums=[Decimal(row[i]) for i in (1,2,3,4,5,7,9,10)]
                    trade_count=int(row[8])
                except (ValueError,InvalidOperation) as ex: raise ValueError("Invalid OHLCV") from ex
                o,hi,lo,cl,v,q,tv,tq=nums
                need(all(x.is_finite() for x in nums) and min(o,hi,lo,cl)>0 and
                     lo<=min(o,cl) and hi>=max(o,cl) and
                     min(v,q,tv,tq)>=0 and trade_count>=0,
                     "Invalid original price/volume/trade fields")
                zero_volume+=int(v==0)
                prev=t;count+=1
                need(count<=expected,"Too many original source candles")
    need(count>0,"Original archive contains no rows")
    if prev+M<last:
        gaps.append({"start_utc":dt_string(prev+M),"end_exclusive_utc":dt_string(last),
                     "missing_minutes":(last-prev-M)//M})
    missing=sum(x["missing_minutes"] for x in gaps)
    need(missing+count==expected,"Native source calendar sum mismatch")
    return {
        "status":"native_source_complete_month" if missing==0 and bad_close_time_count==0 else
                "native_source_partially_missing_or_anomalous",
        "pair":pair,"quote":"USDT","month":month,"source_rows":count,"calendar_minutes":expected,
        "missing_1m":missing,"gaps":gaps,"zero_volume_native_candles":zero_volume,
        "close_time_anomalies":bad_close_time_count,
        "first_utc":dt_string(first),"last_exclusive_utc":dt_string(last),
        "original_ohlcv_preserved":True,"synthetic_ohlcv_rows":0}

def one(pair,month,download=fetch):
    name=f"{pair}-1m-{month}.zip"
    url,check_url=source_urls(pair,month)
    first,last,expected=month_bounds(month)
    base={"pair":pair,"quote":"USDT","month":month,"expected_minutes":expected,
          "url":url,"checksum_url":check_url,"source_verified":False,
          "no_trades_in_missing_minutes_proven":False,"synthetic_rows":0}
    arc=download(url,MAX_ZIP)
    if arc["status"]!="downloaded":
        return {**base,"status":arc["status"],"http_code":arc.get("http_code")}
    check=download(check_url,2048)
    if check["status"]!="downloaded":
        return {**base,"status":"checksum_unavailable","http_code":check.get("http_code")}
    try:
        check_checksum(check["bytes"],arc["bytes"],name)
        checked=inspect_zip(arc["bytes"],pair,month)
        need(checked["pair"]==pair,"Wrong original pair")
        return {**base,**checked,"source_verified":True,
                "zip_sha256":h256(arc["bytes"]),"checksum_sha256":h256(check["bytes"]),
                "zip_bytes":len(arc["bytes"])}
    except (ValueError,UnicodeError,BadZipFile, OSError,csv.Error,OverflowError) as exc:
        return {**base,"status":"invalid_source_needs_review",
                "issue_type":type(exc).__name__,"issue":str(exc)[:170]}
def self_test():
    pair="ETHUSDT";month="2021-08"
    f,_,expected=month_bounds(month)
    def makebar(t,price):
        return [str(t),str(price),str(price),"1",str(price),"0.25",str(t+59999),"0.25",
                "1","0.10","0.10","0"]
    rawbuf=io.StringIO();writer=csv.writer(rawbuf)
    writer.writerow(makebar(f,10));writer.writerow(makebar(f+2*M,12))
    bio=io.BytesIO()
    with ZipFile(bio,"w",ZIP_DEFLATED) as z:z.writestr(f"{pair}-1m-{month}.csv",rawbuf.getvalue())
    zipdata=bio.getvalue();result=inspect_zip(zipdata,pair,month)
    need(result["source_rows"]==2 and result["missing_1m"]==expected-2,
         "Missing intervals not correctly accounted for")
    need(result["gaps"][0]["missing_minutes"]==1,"Missing interior minute lost")
    ck=(h256(zipdata)+"  "+f"{pair}-1m-{month}.zip"+"\n").encode()
    check_checksum(ck,zipdata,f"{pair}-1m-{month}.zip")
    try:check_checksum(ck,zipdata+b"x",f"{pair}-1m-{month}.zip")
    except ValueError: pass
    else:raise AssertionError("Checksum mismatch accepted")
    try:inspect_zip(zipdata,"BNBUSDT",month)
    except ValueError:pass
    else:raise AssertionError("Wrong asset accepted")
    print("PASS: fake isolated test fixture never published; checksum, exact pair, gap arithmetic")
def main():
    p=argparse.ArgumentParser()
    p.add_argument("--asset",choices=tuple(TARGETS))
    p.add_argument("--self-test",action="store_true")
    p.add_argument("--output",type=Path)
    args=p.parse_args()
    if args.self_test: self_test();return
    need(args.asset is not None and args.output is not None,
         "--asset and --output required")
    pair,months=TARGETS[args.asset]
    rows=[one(pair,m) for m in months]
    good=[r for r in rows if r["source_verified"]]
    result={"schema":"seven.crypto.top5-original-altcoin-month-gap-audit.v1",
            "source":"Binance Spot monthly original native 1m ZIP with official CHECKSUM",
            "asset_id":args.asset,"pair":pair,"quote":"USDT",
            "months_targeted":len(months),"months_verified":len(good),
            "months_not_verified":len(months)-len(good),
            "source_rows_verified":sum(x["source_rows"] for x in good),
            "source_missing_1m":sum(x["missing_1m"] for x in good),
            "zero_source_transactions_in_missing_minutes_proven":False,
            "no_interpolation":True,"trader_modified":False,
            "months":rows}
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(result,sort_keys=True,indent=2)+"\n",encoding="utf-8")
    print("NATIVE ALTCOIN MONTH AUDIT",json.dumps({
        "asset":args.asset,"months_verified":len(good),
        "months_targeted":len(months),
        "missing_1m":result["source_missing_1m"],
        "source_rows":result["source_rows_verified"]}),flush=True)
if __name__=="__main__":main()
