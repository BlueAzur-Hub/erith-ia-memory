#!/usr/bin/env python3
"""Seven Heaven · bulk Binance Spot monthly native-candle importer (read-only unless --import).

Loads the EXISTING qualified CoinGecko-ID ↔ Binance Spot pair inventory.
Downloads monthly official public-data ZIP + .CHECKSUM; verifies every OHLCV CSV
candle, timestamps and full-month coverage. An individual asset failure does
not stop the others. Never writes into R10, Top50, Universe, Trader or Admin.
Bulk binary files are prepared for GitHub Release assets, not git history.
"""
from __future__ import annotations

import argparse
import calendar
from concurrent.futures import ThreadPoolExecutor, as_completed
import csv
import datetime as dt
import hashlib
import io
import json
import math
from pathlib import Path
import re
import time
import urllib.error
import urllib.request
import zipfile

import audit_historical_coverage as coverage

SCHEMA = "aerith.public.ohlcv.spot.bulk-monthly.index.v1"
HOST = "https://data.binance.vision"
MONTH = re.compile(r"^20[0-9]{2}-(0[1-9]|1[0-2])$")
PAIR = re.compile(r"^[A-Z0-9]{2,22}USDT$")
INTERVALS = {"1m": 60_000, "5m": 300_000}
MAX_PARALLEL = 6
MAX_ZIP = 45_000_000
USER_AGENT = "SevenHeaven-Crypto-BulkArchive/1.0"

def need(ok, why):
    if not ok:
        raise ValueError(why)

def sha256(data):
    return hashlib.sha256(data).hexdigest()

def inventory():
    """Source is a verified, frozen Top50 history inventory, not ticker guesswork."""
    report = coverage.summarize()
    need(report["total_ranked"] == 50 and
         report["archived_assets"] >= 24 and
         report["archived_assets"] <= 50, "Top50 archive registry unavailable")
    candidates, ids, pairs = [], set(), set()
    for a in report["assets"]:
        if not a["archived"]:
            continue
        aid, symbol = a["id"], a["symbol"]
        periods = a["periods"]
        need(len(periods) == 3 and set(periods) == {"24h", "7d", "30d"},
             "Asset has no complete source evidence")
        pair = symbol + "USDT"
        need(PAIR.fullmatch(pair) and
             all(p["pair"] == pair and p["quote"] == "USDT" and
                 p["source"] == "Binance Spot" for p in periods.values()),
             "Unqualified source identity: " + aid)
        need(aid not in ids and pair not in pairs, "Duplicate Spot identity")
        ids.add(aid);pairs.add(pair)
        candidates.append({"id": aid, "symbol": symbol, "pair": pair,
                           "archive_owner": a["archive_owner"], "rank": a["rank"]})
    return candidates

def bounds(month, interval):
    need(MONTH.fullmatch(month) and interval in INTERVALS,
         "Invalid month/interval")
    year, mon = (int(x) for x in month.split("-"))
    start = dt.datetime(year, mon, 1, tzinfo=dt.timezone.utc)
    count = calendar.monthrange(year, mon)[1] * 86_400_000 // INTERVALS[interval]
    return int(start.timestamp()*1000), int(count), int(start.timestamp()*1000) + count*INTERVALS[interval]

def url_for(pair, month, interval):
    need(PAIR.fullmatch(pair) and MONTH.fullmatch(month) and
         interval in INTERVALS, "Unsafe Binance archive path")
    name = f"{pair}-{interval}-{month}.zip"
    url = f"{HOST}/data/spot/monthly/klines/{pair}/{interval}/{name}"
    return name,url

def download(url, cap=MAX_ZIP):
    need(url.startswith(HOST+"/data/spot/monthly/klines/"),"Unknown archive host")
    last = None
    for trial in range(2):
        try:
            req = urllib.request.Request(url,headers={"User-Agent":USER_AGENT})
            with urllib.request.urlopen(req,timeout=35) as resp:
                need(resp.status==200,"Binance HTTP status invalid")
                data = resp.read(cap+1)
                need(0<len(data)<=cap,"Remote archive exceeds bounded limit")
                return data
        except (OSError,ValueError,urllib.error.URLError) as err:
            last=err
            if trial==0:time.sleep(0.5)
    raise RuntimeError(f"Public Binance download failure: {type(last).__name__}")

def check_csv(raw, pair, month, interval):
    start,expected,end=bounds(month,interval)
    step=INTERVALS[interval]
    need(len(raw)<=MAX_ZIP,"ZIP too large")
    with zipfile.ZipFile(io.BytesIO(raw)) as archive:
        names=archive.namelist()
        expected_name=f"{pair}-{interval}-{month}.csv"
        need(names==[expected_name],"Monthly archive must contain one expected CSV")
        info=archive.getinfo(expected_name)
        need(info.file_size<=160_000_000,"Uncompressed CSV exceeds limit")
        need(info.compress_size>0 and info.file_size<=max(info.compress_size*200,160000),
             "CSV compression ratio exceeds safety bound")
        with archive.open(info) as stream:
            reader=csv.reader(io.TextIOWrapper(stream,encoding="utf-8-sig",newline=""))
            count=0
            last=None
            unit=None
            for fields in reader:
                need(len(fields)==12,"Unexpected Spot CSV column count")
                t=int(fields[0])
                current_unit="us" if t>=10**15 else "ms"
                if unit is None:unit=current_unit
                need(current_unit==unit,"Mixed Binance timestamp units")
                when=t//1000 if unit=="us" else t
                need(when==start+count*step,"Missing/duplicate/unaligned candle")
                close_stamp=int(fields[6])
                closed=close_stamp//1000 if unit=="us" else close_stamp
                need(closed>=when+step-1 and closed<when+step,
                     "Malformed Binance close timestamp")
                op,hi,lo,cl,vol,quote_vol=[float(fields[k]) for k in (1,2,3,4,5,7)]
                need(all(math.isfinite(v) for v in (op,hi,lo,cl,vol,quote_vol))
                     and op>0 and cl>0 and lo>0 and
                     lo<=min(op,cl) and max(op,cl)<=hi and
                     vol>=0 and quote_vol>=0 and
                     int(fields[8])>=0,"Invalid Spot OHLCV / trades")
                count+=1;last=when
                need(count<=expected,"Month has more rows than expected")
    need(count==expected,"Month incomplete: "+str(count)+"/"+str(expected))
    return {"candles":count,"first_open_ms":start,
            "last_open_ms":last,"timestamp_unit":unit}

def fetch_asset(asset, month, interval, output, getter=download):
    name,url=url_for(asset["pair"],month,interval)
    item={"asset_id":asset["id"],"rank":asset["rank"],"pair":asset["pair"],
          "source":"Binance Spot public monthly CSV","quote":"USDT",
          "interval":interval,"month":month,"status":"unavailable"}
    started=time.monotonic()
    try:
        raw=getter(url)
        checksum=getter(url+".CHECKSUM",cap=8192)
        observed=sha256(raw)
        expected=checksum.decode("utf-8").strip().split()[0].lower()
        need(bool(re.fullmatch("[a-f0-9]{64}",expected)) and observed==expected,
             "Binance official CHECKSUM mismatch")
        check=check_csv(raw,asset["pair"],month,interval)
        # Every row was validated BEFORE any file is published to output.
        dest=output/name
        if dest.exists():
            need(sha256(dest.read_bytes())==observed,"Existing immutable asset changed")
        else:
            dest.parent.mkdir(parents=True,exist_ok=True)
            tmp=dest.with_suffix(".tmp")
            tmp.write_bytes(raw)
            tmp.replace(dest)
        item.update(check)
        item.update(status="verified",file=name,sha256=observed,
                    zip_bytes=len(raw))
    except (OSError,ValueError,RuntimeError,OverflowError,UnicodeError,
            zipfile.BadZipFile,csv.Error) as err:
        item.update(status="unavailable",reason=f"{type(err).__name__}: {str(err)[:110]}")
    item["seconds"]=round(time.monotonic()-started,3)
    return item

def execute(month,interval,output,workers=4,limit=31,assets=None,getter=download):
    need(1<=workers<=MAX_PARALLEL and 1<=limit<=250,
         "Unsafe worker/asset limit")
    bounds(month,interval)
    approved=inventory() if assets is None else assets
    need(len(approved)>=limit, "Not enough verified assets for requested batch")
    approved=approved[:limit]
    output.mkdir(parents=True,exist_ok=True)
    rows=[None]*len(approved)
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures={pool.submit(fetch_asset,a,month,interval,output,getter):i
                 for i,a in enumerate(approved)}
        for task in as_completed(futures):
            i=futures[task]
            rows[i]=task.result()
            print("BULK "+json.dumps(rows[i],sort_keys=True),flush=True)
    need(all(r is not None for r in rows),"Incomplete task result set")
    manifest={"schema":SCHEMA,"market_scope":"qualified Top50 archived inventory",
              "source":"Binance public Spot monthly klines","quote":"USDT",
              "month":month,"interval":interval,
              "requested":len(approved),
              "verified":sum(r["status"]=="verified" for r in rows),
              "unavailable":sum(r["status"]!="verified" for r in rows),
              "candles":sum(r.get("candles",0) for r in rows),
              "zip_bytes":sum(r.get("zip_bytes",0) for r in rows),
              "assets":rows,
              "max_status":"NOT_PROVEN_BY_ONE_MONTH"}
    # The manifest itself is small and Git-safe. ZIP archives live in Releases.
    result=output/"manifest.json"
    temp=result.with_suffix(".tmp")
    temp.write_text(json.dumps(manifest,indent=2,ensure_ascii=False,sort_keys=True)+"\n")
    temp.replace(result)
    return manifest

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--month",default="2026-09")
    p.add_argument("--interval",choices=tuple(INTERVALS),default="1m")
    p.add_argument("--limit",type=int,default=31)
    p.add_argument("--workers",type=int,default=4)
    p.add_argument("--output-dir",type=Path,default=Path("/tmp/aerith-bulk-archive"))
    modes=p.add_mutually_exclusive_group(required=True)
    modes.add_argument("--plan",action="store_true")
    modes.add_argument("--import-month",action="store_true")
    args=p.parse_args()
    approved=inventory()
    need(1<=args.limit<=min(250,len(approved)),"Requested limit exceeds verified inventory")
    first,expected,last=bounds(args.month,args.interval)
    if args.plan:
        print(json.dumps({"mode":"QUALIFIED_OFFLINE_PLAN","month":args.month,
           "interval":args.interval,"count":args.limit,"expected_rows_each":expected,
           "total_potential_rows":args.limit*expected,"first_ms":first,
           "end_exclusive_ms":last,"assets":approved[:args.limit]},
           sort_keys=True))
    else:
        result=execute(args.month,args.interval,args.output_dir,
                       workers=args.workers,limit=args.limit,assets=approved)
        print("BULK SUMMARY "+json.dumps({k:result[k] for k in
            ("requested","verified","unavailable","candles","zip_bytes")},
            sort_keys=True))

if __name__=="__main__":
    main()
