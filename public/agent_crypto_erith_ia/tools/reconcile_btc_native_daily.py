#!/usr/bin/env python3
"""Audited BTCUSDT 1d gap recovery from Binance's *native* Spot kline ZIPs.

The 1d bar is never synthesized from incomplete 1m candles. Existing complete
1m-derived 1d bars stay unchanged. New bars retain their exact original 1d ZIP
and .CHECKSUM evidence and do NOT imply the minute gaps have been repaired.

This script is read-only until writing a new, separate derived archive.
No exchange keys, live prices, trading, fiat conversion or unlabelled venue mixing.
"""
from __future__ import annotations

import argparse
import csv
from datetime import datetime, timezone
import gzip
import hashlib
from io import BytesIO, TextIOWrapper
import json
import math
from pathlib import Path
import re
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from zipfile import ZipFile

import build_verified_periods as verified

HOME = Path(__file__).resolve().parents[1] / "data/historical_archive_prototype"
OUT = HOME / "btc_native_daily_reconciliation"
D = 86_400_000
M = 60_000
ORIGIN = "https://data.binance.vision/data/spot"
COLUMNS = verified.COLUMNS
SHA = re.compile(r"^[0-9a-f]{64}$")
MONTH = re.compile(r"^\d{4}-(0[1-9]|1[0-2])$")
ZIP_CAP = 8_000_000
SCHEMA = "seven.crypto.btc.native-1d-reconciliation.v1"
INDEX_SCHEMA = "seven.crypto.btc.native-1d-reconciliation-index.v1"


def require(condition, why):
    if not condition:
        raise ValueError(why)


def hexdigest(blob):
    return hashlib.sha256(blob).hexdigest()


def iso(ms):
    return datetime.fromtimestamp(ms/1000, tz=timezone.utc).strftime("%Y-%m-%d")


def read_original(home=HOME):
    root = Path(home)
    index_raw = (root/"btc_max_integrated/index.json").read_bytes()
    index = json.loads(index_raw)
    require(index["schema"] == "seven.crypto.btc.integrated-max-index.v1"
            and index["pair"] == "BTCUSDT" and index["quote"] == "USDT"
            and index["complete_months"] >= 80 and index["partial_months"] >= 21
            and index["missing_days"] == 26 and index["bars"] == 3049,
            "BTC original archive changed; re-audit the contract")
    path = root/"btc_max_integrated"/index["file"]
    raw = path.read_bytes()
    require(len(raw) == index["bytes"] and hexdigest(raw) == index["sha256"],
            "SHA-256 mismatch in pre-existing BTC Max")
    base = json.loads(gzip.decompress(raw))
    require(base["schema"] == "seven.crypto.btc.integrated-max.v1"
            and base["pair"] == "BTCUSDT" and base["quote"] == "USDT"
            and base["columns"] == COLUMNS and base["interval"] == "1d"
            and base["rows"][0][0] == index["first_open_ms"]
            and base["rows"][-1][0] == index["last_open_ms"],
            "Original Max OHLCV metadata differs from SHA-qualified index")
    verified.validate(base["rows"], "1d", allow_gaps=True)
    need_gaps = verified.gaps(base["rows"], "1d")
    require(need_gaps == base["gaps"] == index["gaps"],
            "Original minute-derived Max lost unreported calendar gaps")
    missing = [g["start_ms"]+i*D for g in need_gaps
               for i in range(g["missing_bars"])]
    require(len(missing) == 26 and len(set(missing)) == 26,
            "Expected 26 unique minute-incomplete UTC dates")
    partial = json.loads((root/"btc_verified_gap_months/index.json").read_text())
    require(partial["pair"] == "BTCUSDT" and partial["quote"] == "USDT"
            and partial["missing_calendar_minutes"] == 5881,
            "The canonical partial-month index changed")
    qualified = {}
    for record in partial["months"]:
        for gap in record["gaps"]:
            a, b = gap["start_ms"], gap["end_ms_exclusive"]
            d = (a//D)*D
            while d < b:
                overlap = max(0, min(b,d+D)-max(a,d))
                if overlap:
                    qualified[d] = qualified.get(d,0)+overlap//M
                d += D
    require(set(qualified) == set(missing)
            and sum(qualified.values()) == partial["missing_calendar_minutes"]
            and qualified.get(1679616000000) == 80,
            "Minute provenance and reported missing days disagree")
    return index, base, sorted(missing), qualified, {
        "btc_max_integrated/index.json":hexdigest(index_raw),
        "btc_verified_gap_months/index.json":
            hexdigest((root/"btc_verified_gap_months/index.json").read_bytes())}


def get_https(url, max_size=ZIP_CAP, tries=3):
    require(url.startswith(ORIGIN+"/") and ".." not in url,
            "Not a permitted official Binance data URL")
    for attempt in range(tries):
        try:
            with urlopen(Request(url, headers={
                "User-Agent":"Seven-Heaven-native-Binance-daily-audit",
                "Accept":"application/octet-stream"}),timeout=25) as response:
                require(response.status == 200, "Not HTTP 200")
                data=response.read(max_size+1)
            require(0 < len(data) <= max_size,"Oversized/empty official response")
            return data
        except HTTPError as exc:
            if exc.code in (403,404,410):
                return None
            if attempt+1 == tries:
                raise
        except (URLError, TimeoutError):
            if attempt+1 == tries:
                raise
        time.sleep(attempt+1)
    raise RuntimeError("Could not fetch official ZIP")


def parse_checksum(raw, filename, zipbytes):
    require(raw is not None and len(raw)<4096, "Missing/corrupt official CHECKSUM")
    line=raw.decode("ascii").strip().splitlines()
    require(len(line)==1,"Unexpected checksum file")
    match=re.fullmatch(r"([0-9a-fA-F]{64})\s+\*?(.+)",line[0].strip())
    require(match and match.group(2).strip()==filename,
            "Official CHECKSUM filename/format differs")
    require(match.group(1).lower()==hexdigest(zipbytes),
            "Binance ZIP fails its official CHECKSUM")


def parse_zip(raw, filename, month):
    require(raw is not None and len(raw)<=ZIP_CAP and MONTH.fullmatch(month),
            "Missing 1d source ZIP")
    with ZipFile(BytesIO(raw)) as z:
        names=[info for info in z.infolist() if not info.is_dir()]
        need=filename[:-4]+".csv"
        require(len(names)==1 and names[0].filename==need
                and not names[0].filename.startswith(("/","."))
                and names[0].file_size < 800_000,
                "Unexpected CSV payload inside native 1d ZIP")
        with z.open(names[0]) as stream:
            reader=csv.reader(TextIOWrapper(stream,encoding="utf-8-sig",newline=""))
            result={}
            for i,row in enumerate(reader):
                if i==0 and row and row[0].strip().lower() in ("open_time","open time"):
                    continue
                require(len(row)==12, "Invalid Binance Spot kline CSV width")
                raw_time=int(row[0])
                ts=raw_time//1000 if raw_time>=10**14 else raw_time
                price=[float(row[j]) for j in (1,2,3,4)]
                vol=float(row[5]);qvol=float(row[7]);ntrades=int(row[8])
                close_time=int(row[6])
                close_ms=close_time//1000 if close_time>=10**14 else close_time
                require(ts%D==0 and close_ms==ts+D-1 and
                        datetime.fromtimestamp(ts/1000,timezone.utc).strftime("%Y-%m")==month
                        and len(result)<32 and
                        all(math.isfinite(x) for x in (*price,vol,qvol)) and
                        price[2]>0 and price[2]<=min(price[0],price[3])
                        and max(price[0],price[3])<=price[1]
                        and vol>=0 and qvol>=0 and ntrades>=0 and ts not in result,
                        "Invalid native Binance UTC day/OHLCV")
                result[ts]=[ts,price[0],price[1],price[2],price[3],vol,qvol,ntrades]
    require(bool(result), "Empty verified source month")
    return result


def fetch_verified(month, day=None, downloader=get_https):
    require(MONTH.fullmatch(month), "Invalid official source month")
    prefix="monthly" if day is None else "daily"
    suffix=month if day is None else iso(day)
    if day is not None:
        require(suffix.startswith(month+"-"), "Daily ZIP date does not match month")
    fname="BTCUSDT-1d-"+suffix+".zip"
    url=f"{ORIGIN}/{prefix}/klines/BTCUSDT/1d/{fname}"
    raw=downloader(url,ZIP_CAP)
    if raw is None:
        return None
    check=downloader(url+".CHECKSUM",4096)
    require(check is not None,"Official 1d source ZIP lacks CHECKSUM: "+fname)
    parse_checksum(check,fname,raw)
    series=parse_zip(raw,fname,month)
    return {"bars":series,
            "proof":{"interval":"1d","venue":"Binance Spot","pair":"BTCUSDT",
               "quote":"USDT","archive_url":url,
               "checksum_url":url+".CHECKSUM",
               "zip_sha256":hexdigest(raw),
               "checksum_sha256":hexdigest(check),
               "file":fname}}


def matches(reference, candidate):
    # A different archive resolution may differ slightly after historical
    # corrections; do not silently claim identical data when they disagree.
    for a,b in zip(reference[1:7],candidate[1:7]):
        if abs(a-b)>max(0.02,abs(a)*0.00001):
            return False
    return reference[7]==candidate[7]


def reconcile(home=HOME, output=OUT, downloader=get_https):
    root=Path(home)
    index,base,missing,minute_gaps,digests=read_original(root)
    original={r[0]:r for r in base["rows"]}
    months=sorted({iso(t)[:7] for t in missing})
    recovered,records,source_proofs=[],[],[]
    for month in months:
        month_times=[t for t in missing if iso(t).startswith(month)]
        candidate=fetch_verified(month,downloader=downloader)
        source="monthly" if candidate is not None else "daily"
        parsed = {t:candidate for t in month_times} if candidate else {}
        if candidate is None:
            for t in month_times:
                parsed[t]=fetch_verified(month,day=t,downloader=downloader)
        for t in month_times:
            src=parsed[t]
            if src is None or t not in src["bars"]:
                records.append({"date":iso(t),"open_time_ms":t,"status":"unavailable",
                  "native_minute_absent":minute_gaps[t],
                  "source_lookup":source})
                continue
            # Require at least one corroborating full-minute day within the
            # same independently downloaded native daily source ZIP.
            comparisons=[]
            for test_ts,row in src["bars"].items():
                if test_ts in original:
                    comparisons.append({"date":iso(test_ts),
                        "equal":matches(original[test_ts],row)})
            conflicts=[x for x in comparisons if not x["equal"]]
            proof=src["proof"]
            if len(comparisons)<1 or conflicts:
                records.append({"date":iso(t),"open_time_ms":t,
                  "status":"needs_review","native_minute_absent":minute_gaps[t],
                  "corroborated_days":len(comparisons),
                  "conflicting_days":conflicts[:6],"source":proof})
                continue
            bar=src["bars"][t]
            verified.validate([bar],"1d")
            recovered.append(bar)
            source_proofs.append({"open_time_ms":t,"date":iso(t),
                "native_1d":proof,"corroborated_days":len(comparisons),
                "native_1m_missing_minutes":minute_gaps[t]})
            records.append({"date":iso(t),"open_time_ms":t,"status":"recovered",
                "native_minute_absent":minute_gaps[t],
                "source":proof,"corroborated_days":len(comparisons)})
    all_rows={r[0]:r for r in base["rows"]}
    for r in recovered:
        require(r[0] not in all_rows, "Duplicated native daily candle")
        all_rows[r[0]]=r
    final=[all_rows[t] for t in sorted(all_rows)]
    verified.validate(final,"1d",allow_gaps=True)
    require(len(records)==len(missing) and
            len(set(r["open_time_ms"] for r in records))==len(missing) and
            len(final)==len(base["rows"])+len(recovered),
            "A day was silently dropped or fabricated")
    unresolved=[r for r in records if r["status"]!="recovered"]
    obj={"schema":SCHEMA,"asset_id":"bitcoin","pair":"BTCUSDT","quote":"USDT",
      "interval":"1d","is_live":False,"is_all_time":False,
      "scope":"qualified_1m_daily_plus_official_native_1d",
      "columns":COLUMNS,"source":"Binance Spot original verified 1m and native 1d",
      "native_1m_gaps_preserved":True,"rows":final,
      "native_1d_overrides":source_proofs,
      "gaps":verified.gaps(final,"1d"),
      "original_btc_max_sha256":index["sha256"]}
    compressed=verified.pack(obj)
    out=Path(output);out.mkdir(parents=True,exist_ok=True)
    (out/"bitcoin-Max.json.gz").write_bytes(compressed)
    status={"schema":INDEX_SCHEMA,"asset_id":"bitcoin","pair":"BTCUSDT",
       "quote":"USDT","is_live":False,"is_all_time":False,
       "file":"bitcoin-Max.json.gz","bytes":len(compressed),
       "sha256":hexdigest(compressed),"bars":len(final),
       "original_bars":len(base["rows"]),"native_1d_recovered":len(recovered),
       "unresolved_count":len(unresolved),
       "unresolved_dates":[x["date"] for x in unresolved],
       "missing_minutes_unchanged":5881,
       "first_open_ms":final[0][0],"last_open_ms":final[-1][0],
       "gaps":obj["gaps"],"source_catalog_sha256":digests,
       "original_btc_max_sha256":index["sha256"],
       "source_dates":records,"source_model":"different_native_1d_and_1m_provenance"}
    (out/"index.json").write_text(json.dumps(status,indent=2,ensure_ascii=False)+"\n")
    print("BTC NATIVE 1D RECONCILIATION",json.dumps({
        "missing_days_initial":26,"native_1d_recovered":len(recovered),
        "unresolved":len(unresolved),"reconciled_days":len(final),
        "source_minutes_absent_unchanged":5881},sort_keys=True),flush=True)
    return status


def main():
    cli=argparse.ArgumentParser()
    cli.add_argument("--output",type=Path,default=OUT)
    cli.add_argument("--audit-only",action="store_true")
    args=cli.parse_args()
    if args.audit_only:
        _,_,missing,minute_gaps,digests=read_original()
        print("NATIVE BTC 1D CANDIDATE DAYS",json.dumps({
           "dates":[{"date":iso(t),"missing_minutes":minute_gaps[t]} for t in missing],
           "month_count":len({iso(t)[:7] for t in missing}),
           "index_sha256":digests},sort_keys=True))
    else:
        reconcile(output=args.output)


if __name__=="__main__":
    main()
