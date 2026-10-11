#!/usr/bin/env python3
"""Read-only 3-day Bitcoin native Spot trade ZIP pilot for known 1m kline gaps.

The original 1m monthly and daily ZIPs contain 5,881 missing native klines.
A trade archive is an independent source; a trade inside a gap does not alone
certify a Binance native 1m OHLCV. Do not synthesize or merge any candles here.
"""
from __future__ import annotations
import argparse
from collections import defaultdict
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
from zipfile import ZipFile, BadZipFile

import audit_btc_minute_gaps as prior
import freeze_btc_daily_reference as daily

ROOT = daily.ROOT
OUT = ROOT / "btc_trade_gap_pilot"
DAYS = ("2018-06-26", "2020-12-21", "2023-03-24")
ORIGIN = "https://data.binance.vision/data/spot/daily/trades/BTCUSDT/"
LIMIT = 70_000_000
M = 60_000


def need(ok, why):
    if not ok: raise ValueError(why)


def hash256(x):
    return hashlib.sha256(x).hexdigest()


def get_public(url, cap=LIMIT):
    need(url.startswith(ORIGIN + "BTCUSDT-trades-") and ".." not in url,
         "Trade URL outside Binance official Spot source")
    for attempt in range(3):
        try:
            with urlopen(Request(url,headers={
              "User-Agent":"Seven-Heaven-trade-gap-source-audit",
              "Accept":"application/octet-stream"}),timeout=90) as response:
                need(response.status==200,"Unexpected HTTP status")
                data=response.read(cap+1)
            need(0<len(data)<=cap,"Empty/oversized official native trade response")
            return {"status":"downloaded", "data":data}
        except HTTPError as exc:
            if exc.code in (400,403,404,410,418,429,451):
                return {"status":"http_unavailable","http_status":exc.code}
            if attempt==2: return {"status":"http_unavailable","http_status":exc.code}
        except (URLError,TimeoutError,OSError) as exc:
            if attempt==2:
                return {"status":"transport_unavailable","error":type(exc).__name__}
        time.sleep(attempt+1)
    raise RuntimeError("No official trade response")


def official_checksum(raw, zip_data, filename):
    need(raw is not None and len(raw)<2048,"No official checksum")
    lines=raw.decode("ascii").strip().splitlines()
    need(len(lines)==1,"Unexpected checksum line count")
    m=re.fullmatch(r"([a-fA-F0-9]{64})\s+\*?(.+)",lines[0].strip())
    need(m and m.group(2).strip()==filename,"Checksum points at another trade file")
    need(m.group(1).lower()==hash256(zip_data),"Original Binance trade ZIP SHA mismatch")


def inspect_trades(archive, filename, date, missing):
    need(re.fullmatch(r"20\d{2}-\d{2}-\d{2}",date)
         and filename==f"BTCUSDT-trades-{date}.zip",
         "Invalid historical pair or day")
    midnight=int(datetime.strptime(date,"%Y-%m-%d").replace(
      tzinfo=timezone.utc).timestamp()*1000)
    need(missing and all(midnight<=t<midnight+86_400_000 and t%M==0
                         for t in missing), "Trade comparison has no valid native 1m gap")
    total=0
    in_gap_trades=0
    gap_trade_minutes=set()
    trades_elsewhere=0
    first_trade=None
    last_trade=None
    min_id=None
    max_id=None
    previous_id=None
    previous_time=None
    with ZipFile(io.BytesIO(archive)) as z:
        entries=[x for x in z.infolist() if not x.is_dir()]
        need(len(entries)==1 and entries[0].filename==filename[:-4]+".csv"
             and 0<entries[0].file_size<=650_000_000 and
             entries[0].file_size<=max(4_000,entries[0].compress_size*150),
             "Unexpected original trade CSV or unsafe decompression")
        with z.open(entries[0]) as stream:
            reader=csv.reader(io.TextIOWrapper(stream,encoding="utf-8-sig",newline=""))
            for i,r in enumerate(reader):
                if i==0 and r and r[0].lower() in ("id","tradeid","trade_id"):
                    continue
                need(len(r)==7,"Unexpected Binance Spot raw trade CSV layout")
                ident=int(r[0]);stamp=int(r[4])
                ts=stamp//1000 if stamp>=10**15 else stamp
                try:
                    price,qty,quote=(Decimal(r[1]),Decimal(r[2]),Decimal(r[3]))
                except InvalidOperation as exc: raise ValueError("Invalid native trade decimal") from exc
                need(price.is_finite() and qty.is_finite() and quote.is_finite()
                     and price>0 and qty>0 and quote>=0
                     and midnight<=ts<midnight+86_400_000
                     and (previous_id is None or ident>previous_id)
                     and (previous_time is None or ts>=previous_time)
                     and r[5].lower() in ("true","false")
                     and r[6].lower() in ("true","false"),
                     "Invalid date, order, numeric fields or flags in original trade")
                minute=(ts//M)*M
                total+=1
                if minute in missing:
                    in_gap_trades+=1
                    gap_trade_minutes.add(minute)
                else: trades_elsewhere+=1
                if first_trade is None:
                    first_trade=ts;min_id=ident
                last_trade=ts;max_id=ident
                previous_id=ident;previous_time=ts
    need(total>0 and total==in_gap_trades+trades_elsewhere,
         "Empty or unreconciled official trade ZIP")
    return {"native_trade_rows":total,
            "trade_rows_in_kline_gaps":in_gap_trades,
            "gap_minutes_with_at_least_one_trade":len(gap_trade_minutes),
            "gap_minutes_without_trade_in_this_file":len(missing)-len(gap_trade_minutes),
            "native_trade_rows_outside_gaps":trades_elsewhere,
            "first_trade_time_ms":first_trade,"last_trade_time_ms":last_trade,
            "first_trade_id":min_id,"last_trade_id":max_id,
            "gap_trade_minute_times_ms":sorted(gap_trade_minutes),
            "candidate_native_klines_created":0}


def one_day(date, gap_minutes, downloader=get_public):
    need(date in DAYS,"Date not part of the approved pilot")
    filename=f"BTCUSDT-trades-{date}.zip"
    url=ORIGIN+filename
    source=downloader(url,LIMIT)
    if source["status"]!="downloaded":
        return {"date":date,"source_status":source["status"],
                "http_status":source.get("http_status"),"native_klines_created":0}
    data=source["data"]
    checksum=downloader(url+".CHECKSUM",2048)
    if checksum["status"]!="downloaded":
        return {"date":date,"source_status":"checksum_unavailable",
                "http_status":checksum.get("http_status"),"native_klines_created":0}
    official_checksum(checksum["data"],data,filename)
    counts=inspect_trades(data,filename,date,gap_minutes)
    return {"date":date, "source_status":"sha256_verified",
            "archive_url":url,"checksum_url":url+".CHECKSUM",
            "zip_sha256":hash256(data),
            "checksum_sha256":hash256(checksum["data"]),
            "compressed_bytes":len(data),
            "original_missing_1m":len(gap_minutes),
            "native_klines_created":0,**counts}


def investigate(root=ROOT,out=OUT,downloader=get_public):
    _,days,lock=prior.ledger(root)
    frozen=daily.build(root)
    need(frozen["utc_day_count"]==3075
         and frozen["locked_source"]["data_sha256"]==lock["daily_reference_sha256"]
         and sum(len(v) for v in days.values())==5881,
         "Pinned BTC daily and native minute evidence changed")
    records=[one_day(date,days[date],downloader) for date in DAYS]
    need(len(records)==3 and all(r["native_klines_created"]==0 for r in records),
         "Accidental reconstruction or incomplete trade source audit")
    valid=[r for r in records if r["source_status"]=="sha256_verified"]
    result={"schema":"seven.crypto.btc.trades-gap-pilot.v1",
            "venue":"Binance Spot","pair":"BTCUSDT","quote":"USDT",
            "source":"original_official_daily_trades_zip_and_checksum",
            "trade_coverage_not_kline_coverage":True,
            "sample_dates":list(DAYS),"sample_count":3,
            "verified_trade_source_dates":len(valid),
            "sample_missing_1m":sum(len(days[d]) for d in DAYS),
            "observed_trades_in_gap_minutes":sum(r["trade_rows_in_kline_gaps"]
                                                  for r in valid),
            "observed_gap_minutes_with_trades":sum(r["gap_minutes_with_at_least_one_trade"]
                                                   for r in valid),
            "original_missing_1m_global":5881,
            "minute_candles_reconstructed":0,
            "source_daily_reference_sha256":lock["daily_reference_sha256"],
            "source_gap_catalog_sha256":lock["gap_catalog_sha256"],
            "records":records,
            "notes":"Trading activity in a missing 1m slot is evidence, not Binance-native OHLCV. Source-complete transaction reconstruction would require independent comparison against intact 1m candles. All source 1d and 1m files untouched."}
    out=Path(out);out.mkdir(parents=True,exist_ok=True)
    (out/"index.json").write_text(json.dumps(result,indent=2,
                            sort_keys=True,ensure_ascii=False)+"\n",encoding="utf-8")
    print("BTC TRADE GAP PILOT",json.dumps({
        "sample_dates":3,"verified_sources":len(valid),
        "sample_missing_minutes":result["sample_missing_1m"],
        "trades_in_gaps":result["observed_trades_in_gap_minutes"],
        "gap_minutes_with_trades":result["observed_gap_minutes_with_trades"],
        "candles_created":0},sort_keys=True),flush=True)
    return result


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--audit-only",action="store_true")
    p.add_argument("--output",type=Path,default=OUT)
    a=p.parse_args()
    if a.audit_only:
        _,days,lock=prior.ledger()
        print("BTC TRADE PILOT SCOPE",json.dumps({
            "dates":list(DAYS),"sample_missing":sum(len(days[d]) for d in DAYS),
            "global_missing":sum(len(x) for x in days.values()),
            "source_lock":lock},sort_keys=True))
    else:
        investigate(out=a.output)


if __name__=="__main__":main()
