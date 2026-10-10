#!/usr/bin/env python3
"""Verify and optionally publish original OKX Spot 1Dutc history as a *separate* source.

Never labels 1D as 1m; never merges with the Binance/Bitget 1m Top250 index.
The exchange may produce zero-trade bars itself. Response hashes document
retrieval integrity, but are NOT exchange-signed official archive checksums.
"""
from __future__ import annotations
import argparse
import datetime as dt
from decimal import Decimal, InvalidOperation
import gzip
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

import import_historical_bulk as bulk

BASE=bulk.ROOT/"data/historical_archive_prototype"
FED=BASE/"top250_multisource_coverage/index.json"
VENUES=BASE/"top250-official-spot-instruments.json"
ENDPOINT="https://www.okx.com/api/v5/market/history-candles"
REPO="BlueAzur-Hub/erith-ia-memory"
DAY=86_400_000
START=int(dt.datetime(2017,1,1,tzinfo=dt.timezone.utc).timestamp()*1000)
END=int(dt.datetime(2026,10,1,tzinfo=dt.timezone.utc).timestamp()*1000)
MAX_PAGES=55
MAX_RESPONSE=160_000
MAX_ROWS=5500
SCHEMA="aerith.okx.native-utc-daily-history.verified-response.v1"
SPECS=(
  ("okb",42,"OKB","OKB",
   "https://www.okx.com/en-eu/help/okx-to-list-kat-and-okb-on-spot-in-eea"),
  ("crypto-com-chain",39,"CRO","Cronos",
   "https://www.okx.com/en-us/help/important-notice-token-pairs-adjustment"),
)
TAG="crypto-okx-spot-native-daily-2026-09-okb-cro"

def need(test, message):
    if not test: raise ValueError(message)

def assets(fed,venue):
    need(fed.get("schema")=="aerith.public.ohlcv.top250.federated-native-archives.v1"
         and fed.get("ranked")==250 and len(fed.get("assets",[]))==250
         and len({a["id"] for a in fed["assets"]})==250,
         "Canonical Top250 identity source invalid")
    need(venue.get("schema")==
         "aerith.public.ohlcv.spot.top250.official-instrument-candidates.v1"
         and venue.get("ranked")==250,
         "Official Spot market census unavailable")
    ids={a["id"]:a for a in fed["assets"]}
    instruments={a["id"]:a for a in venue["assets"]}
    result=[]
    for cid,rank,symbol,name,proof in SPECS:
        a=ids.get(cid)
        need(a is not None and a["rank"]==rank and a["name"]==name
             and a["symbol"]==symbol and a["quote"]=="USDT"
             and a["months"]==0 and a["source"] is None,
             "Source already archived or identity changed: "+cid)
        market=instruments.get(cid)
        need(market is not None and market["rank"]==rank
             and market["symbol"]==symbol
             and any(m.get("venue")=="okx" and
                     m.get("instrument")==symbol+"-USDT" and
                     m.get("base")==symbol and m.get("quote")=="USDT" and
                     m.get("exchange_instrument_confirmed") is True
                     for m in market.get("instruments",[])),
             "No independent public OKX Spot pair evidence: "+cid)
        need(proof.startswith("https://www.okx.com/"),"Unsafe venue identity URL")
        result.append({"id":cid,"rank":rank,"name":name,"symbol":symbol,
                       "instrument":symbol+"-USDT","quote":"USDT",
                       "identity_evidence":proof})
    need(len(result)==2 and len({a["instrument"] for a in result})==2,
         "Duplicate source owners")
    return result

def number(value):
    need(isinstance(value,str),"Non-native OKX decimal")
    try: d=Decimal(value)
    except InvalidOperation as exc: raise ValueError("Malformed native decimal") from exc
    need(d.is_finite(),"Non-finite native decimal")
    return d

def validate(row, before):
    need(isinstance(row,list) and len(row)==9,"Unexpected native OKX OHLCV column count")
    ts=row[0]
    need(isinstance(ts,str) and ts.isdigit(),"Invalid OHLCV UTC timestamp")
    stamp=int(ts)
    need(0<stamp<before and stamp%DAY==0,"Out of window, unaligned or repeated daily bar")
    need(all(isinstance(v,str) for v in row),"Expected native OKX textual fields")
    o,h,l,c=map(number,row[1:5])
    v,quote_volume,quote_total=map(number,row[5:8])
    need(min(o,h,l,c)>0 and l<=min(o,c)<=max(o,c)<=h,
         "Native OHLC outside range")
    need(min(v,quote_volume,quote_total)>=0,"Negative Spot trading volume")
    need(row[8]=="1","Unconfirmed candle must never be archived")
    return stamp

def request_page(pair,before,opener=urlopen):
    need(re.fullmatch(r"[A-Z0-9]{1,30}-USDT",pair) is not None
         and 0<before<=END and before%DAY==0,
         "Unsafe OKX archive request")
    params=urlencode({"instId":pair,"bar":"1Dutc","after":str(before),"limit":"100"})
    req=Request(ENDPOINT+"?"+params,headers={
        "User-Agent":"SevenHeaven-VerifiedNative-SpotArchive/1.0",
        "Accept":"application/json"})
    last=None
    for attempt in range(3):
        try:
            with opener(req,timeout=45) as response:
                need(response.status==200,"OKX Spot daily public API HTTP failed")
                raw=response.read(MAX_RESPONSE+1)
            need(0<len(raw)<=MAX_RESPONSE,"OKX native daily response invalid size")
            j=json.loads(raw)
            need(isinstance(j,dict) and j.get("code")=="0"
                 and isinstance(j.get("data"),list)
                 and len(j["data"])<=100,"OKX rejected native UTC daily source")
            return j["data"],hashlib.sha256(raw).hexdigest()
        except (HTTPError,URLError,OSError,TimeoutError,ValueError) as exc:
            last=exc
            if attempt==2:break
            time.sleep(attempt+1)
    raise RuntimeError("OKX daily retrieval failed: "+type(last).__name__+": "+str(last)[:120])

def acquire(owner,fetcher=request_page):
    cursor=END
    unique={}
    page_hashes=[]
    source_end=False
    for _ in range(MAX_PAGES):
        rows,digest=fetcher(owner["instrument"],cursor)
        need(re.fullmatch(r"[0-9a-f]{64}",digest) is not None,
             "Missing source HTTP response digest")
        page_hashes.append(digest)
        if not rows:
            source_end=True
            break
        need(len(rows)<=100,"Exceeded documented native page limit")
        times=[validate(row,cursor) for row in rows]
        need(len(times)==len(set(times)) and
             all(a>b for a,b in zip(times,times[1:])),
             "Native page is not strictly newest-first")
        for stamp,row in zip(times,rows):
            need(stamp not in unique,"Duplicate daily timestamp across pages")
            if START<=stamp<END:
                unique[stamp]=row
        need(len(unique)<=MAX_ROWS,"Excessive native daily source data")
        new_cursor=min(times)
        need(new_cursor<cursor,"Non-advancing OKX pagination")
        cursor=new_cursor
        if cursor<START:
            source_end=True
            break
    need(bool(unique),"No native OKX daily history returned")
    selected=sorted(unique)
    missing=sum(b-a>DAY for a,b in zip(selected,selected[1:]))
    first,last=selected[0],selected[-1]
    span=(last-first)//DAY+1
    missing_days=span-len(selected)
    need(missing_days>=0 and missing_days<MAX_ROWS,
         "Impossible native daily source coverage")
    return {
       "schema":SCHEMA,"owner":owner,"exchange":"OKX Spot",
       "market":owner["instrument"],"quote":"USDT",
       "native_interval":"1Dutc","utc_start_inclusive_ms":START,
       "utc_end_exclusive_ms":END,"earliest_returned_ms":first,
       "latest_returned_ms":last,
       "native_candles":len(selected),"calendar_days_in_observed_span":span,
       "calendar_days_without_native_bars":missing_days,
       "has_source_gaps":missing_days>0,
       "source_exhausted_within_query_bounds":source_end,
       "genesis_or_first_exchange_trade_proven":False,
       "native_source_response_sha256":page_hashes,
       "source_response_digests_are_exchange_signed":False,
       "exchange_may_emit_zero_trade_candles":True,
       "filled_by_our_collector":False,
       "canonical_1m_federation_modified":False,
       "native_columns":["timestamp_ms","open","high","low","close",
                         "base_volume","quote_volume","quote_volume_total","confirm"],
       "native_daily_rows":[unique[t] for t in selected],
    }

def compress(payload):
    raw=(json.dumps(payload,ensure_ascii=False,sort_keys=True,
                    separators=(",",":"),allow_nan=False)+"\n").encode()
    return gzip.compress(raw,mtime=0)

def collect(owners,fetcher=request_page):
    result=[]
    for owner in owners:
        payload=acquire(owner,fetcher=fetcher)
        print("OKX NATIVE DAILY SOURCE VERIFIED "+json.dumps({
            "id":owner["id"],"market":owner["instrument"],
            "first":payload["earliest_returned_ms"],
            "last":payload["latest_returned_ms"],
            "daily_bars":payload["native_candles"],
            "gaps":payload["calendar_days_without_native_bars"],
            "pages":len(payload["native_source_response_sha256"]),
            "source_exhausted":payload["source_exhausted_within_query_bounds"],
        },sort_keys=True),flush=True)
        result.append(payload)
    return result

def main():
    p=argparse.ArgumentParser(description=__doc__)
    q=p.add_mutually_exclusive_group(required=True)
    q.add_argument("--plan",action="store_true")
    q.add_argument("--probe",action="store_true")
    q.add_argument("--publish",action="store_true")
    a=p.parse_args()
    fed=json.loads(FED.read_text(encoding="utf-8"))
    venues=json.loads(VENUES.read_text(encoding="utf-8"))
    owners=assets(fed,venues)
    if a.plan:
        print("OKX DAILY HISTORY PLAN "+json.dumps({
            "owners":owners,"interval":"1Dutc","max_pages":MAX_PAGES,
            "published":False},sort_keys=True));return
    payloads=collect(owners)
    if a.probe:
        print("OKX SOURCE PROBE COMPLETE; NO ARCHIVE PUBLISHED",flush=True)
        return
    need(os.environ.get("GITHUB_ACTIONS")=="true" and
         os.environ.get("GITHUB_REPOSITORY")==REPO and
         os.environ.get("GITHUB_REF")=="refs/heads/main" and
         os.environ.get("GH_TOKEN") and os.environ.get("GITHUB_SHA"),
         "Only reviewed main GitHub Actions may publish authentic native archive")
    existing=subprocess.run(["gh","release","view",TAG,"--json","tagName"],
                            capture_output=True,text=True,timeout=40)
    need(existing.returncode!=0 and ("not found" in existing.stderr.lower()
         or "http 404" in existing.stderr.lower()),
         "Immutable Release already exists or its state is unknown")
    with tempfile.TemporaryDirectory(prefix="okx-native-utc-") as temp:
        root=Path(temp)
        names=[]
        for data in payloads:
            cid=data["owner"]["id"]
            filename=cid+"-"+data["market"]+"-1Dutc.json.gz"
            blob=compress(data)
            (root/filename).write_bytes(blob)
            names.append({"id":cid,"name":filename,
                          "bytes":len(blob),
                          "sha256":hashlib.sha256(blob).hexdigest(),
                          "native_daily_bars":data["native_candles"]})
        manifest={
          "schema":"aerith.okx.native-daily-release-manifest.v1",
          "source":"OKX market/history-candles public 1Dutc Spot API",
          "assets":names,"native_1m_candles":0,"counted_in_top250_1m":False,
          "exchange_signed_archive_sha256":False,
          "original_quote":"USDT",
          "no_price_currency_conversion":True,
          "no_synthetic_interpolation":True,
        }
        (root/"manifest.json").write_text(json.dumps(manifest,indent=2,sort_keys=True)+"\n")
        cp=subprocess.run(["gh","release","create",TAG,
            *(str(root/x["name"]) for x in names),str(root/"manifest.json"),
            "--title","Native OKX Spot UTC daily history · OKB / Cronos",
            "--notes","Official public OKX 1Dutc Spot OHLCV retrieved and verified; response digests are not exchange-signed. Historical USD equivalents are NOT invented. NOT counted as native 1m in the Top250 until independent multi-resolution integration. No trades or orders.",
            "--target",os.environ["GITHUB_SHA"],"--latest=false"],
            capture_output=True,text=True,timeout=150)
        need(cp.returncode==0,"Immutable OKX archive Release failed: "+cp.stderr[-500:])
        print("OKX VERIFIED DAILY RELEASE "+json.dumps({"url":cp.stdout.strip(),
              "tag":TAG,"owners":names,"catalog_1m_modified":False},
              sort_keys=True),flush=True)

if __name__=="__main__":main()
