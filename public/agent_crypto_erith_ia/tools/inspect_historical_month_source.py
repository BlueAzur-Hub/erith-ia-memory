#!/usr/bin/env python3
"""Read-only month-bound forensic proof for two original Binance Spot February 2018 ZIPs.
Retains SHA-256, exact source row counts and wrong-calendar timestamps.
Never corrects, moves, drops or interpolates an exchange-native candle.
"""
from __future__ import annotations
import argparse
import csv
from datetime import datetime,timezone
import hashlib
import io
import json
from pathlib import Path
from zipfile import ZipFile
import audit_top5_incomplete_months as audit

TARGETS=("ETHUSDT","BNBUSDT")
MONTH="2018-02"
MAX_ANOMALY_EXAMPLES=20
def need(condition, why):
    if not condition:raise ValueError(why)
def read(pair):
    url,checkurl=audit.source_urls(pair,MONTH)
    zipobj=audit.fetch(url,audit.MAX_ZIP)
    need(zipobj["status"]=="downloaded","Official source ZIP unavailable: "+pair)
    ck=audit.fetch(checkurl,2048)
    need(ck["status"]=="downloaded","Official ZIP checksum unavailable: "+pair)
    raw=zipobj["bytes"]
    checksum=ck["bytes"]
    name=f"{pair}-1m-{MONTH}.zip"
    audit.check_checksum(checksum,raw,name)
    start,end,calendar=audit.month_bounds(MONTH)
    sample=[]
    wrong_calendar=0
    misaligned=0
    duplicate=0
    out_of_order=0
    source_rows=0
    valid_calendar_unique=set()
    prev=None
    min_ts=None
    max_ts=None
    cols=[]
    with ZipFile(io.BytesIO(raw)) as z:
        expected=f"{pair}-1m-{MONTH}.csv"
        need(z.namelist()==[expected],"Unexpected original market file")
        with z.open(expected) as stream:
            for row in csv.reader(io.TextIOWrapper(stream,encoding="utf-8-sig",newline="")):
                source_rows+=1
                if len(row)!=12:
                    if len(cols)<10:cols.append({"source_row":source_rows,"columns":len(row)})
                    continue
                t=int(row[0]);t=t//1000 if t>=10**15 else t
                min_ts=t if min_ts is None else min(t,min_ts)
                max_ts=t if max_ts is None else max(t,max_ts)
                calendar_ok=start<=t<end
                minute_ok=(t-start)%60000==0
                if not calendar_ok:wrong_calendar+=1
                if not minute_ok:misaligned+=1
                if prev is not None and t<prev:out_of_order+=1
                if prev is not None and t==prev:duplicate+=1
                prev=t
                if calendar_ok and minute_ok:
                    if t in valid_calendar_unique:duplicate+=1
                    valid_calendar_unique.add(t)
                if (not calendar_ok or not minute_ok) and len(sample)<MAX_ANOMALY_EXAMPLES:
                    sample.append({"source_row":source_rows,
                                   "open_ms":t,
                                   "open_utc":datetime.fromtimestamp(t/1000,timezone.utc).isoformat(),
                                   "in_target_month":calendar_ok,"minute_aligned":minute_ok})
    need(source_rows>0 and len(cols)==0,"Malformed Binance source field structure")
    result={
        "exchange":"Binance Spot","market_pair":pair,"quote":"USDT",
        "month":MONTH,"source_zip_url":url,"source_checksum_url":checkurl,
        "source_zip_sha256":hashlib.sha256(raw).hexdigest(),
        "official_checksum_sha256":hashlib.sha256(checksum).hexdigest(),
        "source_file_bytes":len(raw),"raw_original_rows":source_rows,
        "expected_calendar_minutes":calendar,
        "native_rows_in_target_month":len(valid_calendar_unique),
        "missing_calendar_minutes":calendar-len(valid_calendar_unique),
        "rows_outside_target_month":wrong_calendar,
        "misaligned_time_rows":misaligned,
        "duplicate_open_time_rows":duplicate,"out_of_order_rows":out_of_order,
        "first_original_open_utc":datetime.fromtimestamp(min_ts/1000,timezone.utc).isoformat(),
        "last_original_open_utc":datetime.fromtimestamp(max_ts/1000,timezone.utc).isoformat(),
        "source_time_anomaly_examples":sample,
        "provenance":"Original Binance official Spot monthly 1m CSV, exact market and SHA-256-verified ZIP; read-only.",
        "classified_source_quality":"requires_original_timestamp_investigation"
          if wrong_calendar or misaligned or duplicate or out_of_order else "calendar_structurally_valid",
        "original_month_rewritten":False,"synthetic_candles":0,
        "source_trade_absence_proven":False,
        "all_gaps_are_outages":False}
    print("2018 FEB ORIGINAL SOURCE ANOMALY",json.dumps({
      "pair":pair,"original_rows":source_rows,"out_of_bounds":wrong_calendar,
      "native_month_rows":len(valid_calendar_unique),
      "original_sha256":result["source_zip_sha256"]},sort_keys=True),flush=True)
    return result
def main():
    p=argparse.ArgumentParser()
    p.add_argument("--output",type=Path,required=True)
    a=p.parse_args()
    rows=[read(p) for p in TARGETS]
    doc={"schema":"seven.crypto.binance-2018-feb-source-anomaly-audit.v1",
         "assets":rows,
         "no_native_source_rewritten":True,"no_synthetic_ohlcv":True,
         "trader_interface_modified":False,
         "policy":"Forensic read-only. An untrusted source row is never automatically imported as a valid 1m bar."}
    a.output.parent.mkdir(parents=True,exist_ok=True)
    a.output.write_text(json.dumps(doc,indent=2,sort_keys=True)+"\n")
    print("EARLY NATIVE SOURCE ANOMALY AUDIT COMPLETED",len(rows))
if __name__=="__main__":main()
