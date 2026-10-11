#!/usr/bin/env python3
"""Audit 5,881 missing Binance BTCUSDT 1m timestamps against ORIGINAL daily ZIPs.

Ground truth is the verified 21 partial native-month archives (ZIP + official
CHECKSUM) on GitHub Releases. For each of 26 affected UTC dates, download a
second, independent Binance Spot DAILY 1m ZIP + CHECKSUM from data.binance.vision.
Only accept new minutes that exist at the exact missing timestamp, with valid
OHLCV, and only if the overlapping daily/minute-source records agree exactly.

Output is a separate, SHA-pinned evidence archive, NEVER an overwrite of the
frozen daily reference or of the original monthly source. A 1d kline DOES NOT
recreate 1,440 missing 1m prices. No other trading venues are merged.
"""
from __future__ import annotations
import argparse
from collections import defaultdict
from datetime import datetime,timezone
from decimal import Decimal
from hashlib import sha256
import csv
import gzip
import io
import json
import math
from pathlib import Path
import re
import subprocess
import tempfile
import time
from urllib.error import HTTPError,URLError
from urllib.request import Request,urlopen
from zipfile import ZipFile

import btc_gap_archive
import freeze_btc_daily_reference as daily

ROOT=daily.ROOT
OUT=ROOT/"btc_minute_gap_audit"
D=86_400_000
M=60_000
DAY_ORIGIN="https://data.binance.vision/data/spot/daily/klines/BTCUSDT/1m/"
PAIR="BTCUSDT"
MONTH_RE=re.compile(r"^20\d{2}-(?:0[1-9]|1[0-2])$")
DAY_RE=re.compile(r"^20\d{2}-\d\d-\d\d$")
SOURCE_POLICY="binance_official_daily_1m_vs_sha_verified_monthly_1m.v1"
MAX_ZIP_BYTES=5_000_000


def need(ok,reason):
    if not ok:raise ValueError(reason)


def digest(raw):
    return sha256(raw).hexdigest()


def utc(ms):
    return datetime.fromtimestamp(ms/1000,timezone.utc).strftime("%Y-%m-%d")


def verify_checksum(raw,zipbytes,filename):
    need(raw is not None and len(raw)<2048, "Missing official Binance CHECKSUM")
    lines=raw.decode("ascii").strip().splitlines()
    need(len(lines)==1,"Unexpected Binance CHECKSUM file")
    m=re.fullmatch(r"([0-9a-fA-F]{64})\s+\*?(.+)",lines[0].strip())
    need(m is not None and m.group(2).strip()==filename,
         "Binance CHECKSUM refers to another source")
    need(m.group(1).lower()==digest(zipbytes),"Official Binance SHA-256 mismatch")


def download_public(url,cap=MAX_ZIP_BYTES,tries=3):
    need(url.startswith(DAY_ORIGIN) and ".." not in url and
         url.split("/")[-1].startswith("BTCUSDT-1m-"),
         "Unexpected public Binance Spot 1m URL")
    for i in range(tries):
        try:
            with urlopen(Request(url,headers={"User-Agent":"Seven-Heaven-BTC-1m-gap-audit",
                  "Accept":"application/octet-stream"}), timeout=30) as response:
                need(response.status==200,"Binance source returned non-200")
                raw=response.read(cap+1)
            need(0<len(raw)<=cap,"Empty/oversized Binance daily source")
            return raw
        except HTTPError as e:
            if e.code in (403,404,410):return None
            if i==tries-1:raise
        except (URLError,TimeoutError):
            if i==tries-1:raise
        time.sleep(i+1)
    raise RuntimeError("Daily 1m Binance source unavailable")


def original_month(entry,directory):
    month=entry["month"]
    need(MONTH_RE.fullmatch(month) is not None and
         entry["release_tag"]=="btc-spot-native-gap-"+month,
         "Unexpected canonical source release")
    filename="BTCUSDT-1m-"+month+".zip"
    output=Path(directory)
    def download(name):
        proc=subprocess.run([
            "gh","release","download",entry["release_tag"],
            "--repo","BlueAzur-Hub/erith-ia-memory",
            "--pattern",name,"--dir",str(output)],
            capture_output=True,timeout=80,check=True)
        path=output/name
        need(path.is_file() and 0<path.stat().st_size<MAX_ZIP_BYTES,
             "Missing/oversized original month ZIP/checksum")
        return path.read_bytes()
    raw=download(filename)
    checksum=download(filename+".CHECKSUM")
    need(digest(raw)==entry["source_zip_sha256"]==
         entry["files"]["archive"]["sha256"] and
         digest(checksum)==entry["files"]["checksum"]["sha256"],
         "Canonical BTC monthly original SHA-256 differs")
    meta,rows=btc_gap_archive.verify(raw,checksum.decode("ascii"),month)
    need(meta["native_rows"]==entry["native_rows"] and
         meta["missing_minutes"]==entry["missing_calendar_minutes"],
         "Canonical native monthly admission count mismatch")
    # Every row is the exact original 1m source, no reconstructed time slots.
    return {r[0]:r for r in rows},meta


def valid_row(r,first,end):
    need(len(r)==12 and all(x!="" for x in r[:9]),
         "Invalid native Binance 1m CSV width")
    t=int(r[0])
    t=t//1000 if t>=10**14 else t
    close=int(r[6])
    close=close//1000 if close>=10**14 else close
    need(first<=t<end and t%M==0 and close>=t and close<t+M,
         "Native minute timestamp, period or close time invalid")
    nums=[Decimal(r[j]) for j in (1,2,3,4,5,7,9,10)]
    need(all(v.is_finite() for v in nums) and
         min(nums[:4])>0 and nums[2]<=min(nums[0],nums[3])
         and max(nums[0],nums[3])<=nums[1] and
         all(v>=0 for v in nums[4:]) and int(r[8])>=0,
         "Invalid native 1m price, volume, or transaction value")
    return (t,r[1],r[2],r[3],r[4],r[5],close,r[7],int(r[8]),r[9],r[10])


def parse_day(raw,name,day):
    need(raw is not None and len(raw)<MAX_ZIP_BYTES and
         DAY_RE.fullmatch(day) is not None and
         name=="BTCUSDT-1m-"+day+".zip",
         "Unexpected Binance UTC daily 1m archive")
    first=int(datetime.strptime(day,"%Y-%m-%d").replace(tzinfo=timezone.utc).timestamp()*1000)
    result={}
    with ZipFile(io.BytesIO(raw)) as z:
        parts=[p for p in z.infolist() if not p.is_dir()]
        need(len(parts)==1 and parts[0].filename==name[:-4]+".csv"
             and parts[0].file_size<=1_000_000
             and parts[0].file_size<=max(1000,parts[0].compress_size*200),
             "Unexpected ZIP daily CSV or unsafe expansion")
        with z.open(parts[0]) as handle:
            reader=csv.reader(io.TextIOWrapper(handle,encoding="utf-8-sig",newline=""))
            for row in reader:
                item=valid_row(row,first,first+D)
                need(item[0] not in result and len(result)<1440,
                     "Duplicate or more than 1,440 native 1m records")
                result[item[0]]=item
    need(len(result)>0,"Empty official native BTC 1m day")
    return result


def exact_candle(a,b):
    # Compare numeric content, NOT textual decimal formatting, and never infer
    # a candle from partial timestamps. Source close_time may be corrected.
    return (a[0]==b[0] and a[8]==b[8] and
            all(Decimal(str(a[i]))==Decimal(str(b[i]))
                for i in (1,2,3,4,5,7,9,10)))


def day_source(day,downloader=download_public):
    need(DAY_RE.fullmatch(day) is not None and
         datetime.strptime(day,"%Y-%m-%d").strftime("%Y-%m-%d")==day,
         "Invalid UTC date")
    name="BTCUSDT-1m-"+day+".zip"
    url=DAY_ORIGIN+name
    raw=downloader(url,MAX_ZIP_BYTES)
    if raw is None:return None
    check=downloader(url+".CHECKSUM",2048)
    verify_checksum(check,raw,name)
    rows=parse_day(raw,name,day)
    return rows,{"archive_url":url,"checksum_url":url+".CHECKSUM",
                 "zip_sha256":digest(raw),"checksum_sha256":digest(check),
                 "pair":PAIR,"quote":"USDT","interval":"1m",
                 "venue":"Binance Spot","native_rows":len(rows)}


def ledger(root=ROOT):
    root=Path(root)
    canonical=json.loads((root/"btc_verified_gap_months/index.json").read_text())
    daily_ref=daily.build(root)
    frozen=root/"btc_daily_reference/index.json"
    if frozen.is_file():
        stored=json.loads(frozen.read_text())
        need(stored==daily_ref, "Frozen BTC 1d source unexpectedly changed")
    need(canonical["pair"]==PAIR and canonical["quote"]=="USDT"
         and canonical["missing_calendar_minutes"]==5881 and
         len(canonical["months"])==21, "Native minute source ledger changed")
    targets=defaultdict(set)
    months={}
    for row in canonical["months"]:
        month=row["month"]
        need(month not in months,"Duplicate partial source month")
        months[month]=row
        for gap in row["gaps"]:
            start,end=gap["start_ms"],gap["end_ms_exclusive"]
            need(end>start and (end-start)//M==gap["missing_minutes"],
                 "Malformed missing minute range")
            for t in range(start,end,M):
                targets[utc((t//D)*D)].add(t)
    need(len(targets)==26 and sum(map(len,targets.values()))==5881
         and set(targets)==set(x["date"] for x in json.loads(
             (root/"btc_native_daily_reconciliation/index.json").read_text()
             )["source_dates"]),
         "Gap candidate dates diverge from the original native daily audit")
    return months,dict(targets),{
        "gap_catalog_sha256":digest((root/"btc_verified_gap_months/index.json").read_bytes()),
        "daily_reference_sha256":daily_ref["locked_source"]["data_sha256"]}


def audit(root=ROOT,output=OUT,source_month=original_month,
          source_day=day_source):
    months,targets,locked=ledger(root)
    report=[],[]
    records,accepted,unresolved=[],{},0
    for month in sorted(months):
        if not any(date.startswith(month) for date in targets):continue
        with tempfile.TemporaryDirectory(prefix="seven-btc-1m-month-") as td:
            originals,admission=source_month(months[month],td)
        need(len(originals)==months[month]["native_rows"],
             "Monthly original row count changed")
        for date in sorted(d for d in targets if d.startswith(month)):
            missing=targets[date]
            first=int(datetime.strptime(date,"%Y-%m-%d").replace(tzinfo=timezone.utc).timestamp()*1000)
            before={t:r for t,r in originals.items() if first<=t<first+D}
            need(len(before)+len(missing)==1440 and not set(before)&missing,
                 "An original minute is counted twice or not at all")
            found=source_day(date)
            if found is None:
                records.append({"date":date,"status":"official_daily_unavailable",
                 "original_missing_minutes":len(missing),"recovered":0,
                 "still_missing":len(missing),"original_source_sha256":
                    admission["source_zip_sha256"]})
                unresolved+=len(missing)
                continue
            other,proof=found
            shared=set(before)&set(other)
            differences=[t for t in sorted(shared)
                         if not exact_candle(before[t],other[t])]
            new=set(other)-set(before)
            need(new<=missing,"Binance daily returned outside original gap ledger")
            if differences:
                # Quarantine ALL new rows for the affected day; never accept
                # a daily-source revision that also conflicts with originals.
                status="review_required_original_daily_disagreement"
                adds=[]
            else:
                status=("recovered_authentic_native_minutes" if new
                        else "daily_and_monthly_both_missing")
                adds=[other[t] for t in sorted(new)]
                for r in adds:accepted[r[0]]=r
            still=len(missing)-len(adds)
            unresolved+=still
            records.append({"date":date,"status":status,
              "original_missing_minutes":len(missing),
              "daily_zip_rows":len(other),"source_overlap_minutes":len(shared),
              "source_overlap_conflicts":len(differences),
              "conflict_examples_utc":[utc(t)+"T"+datetime.fromtimestamp(
                   t/1000,timezone.utc).strftime("%H:%MZ")
                   for t in differences[:8]],
              "recoverable_unapplied":len(new) if differences else 0,
              "recovered":len(adds),"still_missing":still,
              "original_source_sha256":admission["source_zip_sha256"],
              "official_daily_source":proof})
    need(len(records)==26 and
         sum(x["original_missing_minutes"] for x in records)==5881 and
         len(accepted)+unresolved==5881 and len(accepted)==len(set(accepted)),
         "Gap recovery audit lost, duplicated, or fabricated native minute slots")
    # Output candidate-only minute rows with exact timestamp/venue; do not
    # splice into source archives without a second independent review.
    candidates=[accepted[t] for t in sorted(accepted)]
    data={"schema":"seven.crypto.btc.native-minute-gap-evidence.v1",
          "venue":"Binance Spot","pair":PAIR,"quote":"USDT","interval":"1m",
          "columns":["open_time_ms","open","high","low","close",
                     "base_volume","close_time_ms","quote_volume",
                     "trade_count","taker_base_volume","taker_quote_volume"],
          "source_policy":SOURCE_POLICY,"synthetic_rows":0,
          "rows":candidates}
    raw=(json.dumps(data,separators=(",",":"),ensure_ascii=False)+"\n").encode()
    compressed=gzip.compress(raw,compresslevel=9,mtime=0)
    out=Path(output)
    out.mkdir(parents=True,exist_ok=True)
    (out/"native-minute-candidates.json.gz").write_bytes(compressed)
    index={"schema":"seven.crypto.btc.native-minute-gap-audit-index.v1",
      "asset_id":"bitcoin","pair":PAIR,"quote":"USDT","interval":"1m",
      "is_live":False,"is_all_time":False,"source_policy":SOURCE_POLICY,
      "original_missing_minutes":5881,
      "recovered_native_minutes":len(accepted),"still_missing_minutes":unresolved,
      "dates_audited":len(records),"months_audited":len(months),
      "candidate_file":"native-minute-candidates.json.gz",
      "candidate_sha256":digest(compressed),"candidate_bytes":len(compressed),
      "canonical_sources":locked,"days":records,
      "daily_reference_unchanged":True,"minute_series_patched":False,
      "notes":"Only independently SHA-verified same-venue daily original 1m ZIP additions. Original monthly 1m preserved. Native Binance 1d does not imply native 1m continuity."}
    (out/"index.json").write_text(json.dumps(index,indent=2,sort_keys=True,ensure_ascii=False)+"\n")
    print("BTC NATIVE 1M GAP RECHECK",json.dumps({
      "days":26,"original_missing":5881,"recovered":len(accepted),
      "still_missing":unresolved,
      "days_needing_review":sum(x["status"].startswith("review_required") for x in records),
      "daily_zips_missing":sum(x["status"]=="official_daily_unavailable" for x in records)
    },sort_keys=True),flush=True)
    return index


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--output",type=Path,default=OUT)
    p.add_argument("--audit-only",action="store_true")
    args=p.parse_args()
    if args.audit_only:
        m,days,proof=ledger()
        print("BTC 1M TARGETS",json.dumps({"months":len(m),"days":len(days),
             "missing":sum(map(len,days.values())),
             "per_day":[{"date":k,"missing":len(v)} for k,v in sorted(days.items())],
             "source_lock":proof},sort_keys=True))
    else:
        audit(output=args.output)


if __name__=="__main__": main()
