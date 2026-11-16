"""Source-only diagnostics for the preregistered 2022-2023 holdout.

This script NEVER runs a strategy. It verifies official Binance CHECKSUMs and
maps missing hours / irregular close timestamps so the source gate can be
documented without revealing any performance result.
"""
from __future__ import annotations

import calendar
import csv
from datetime import datetime, timezone
import hashlib
import io
import json
from pathlib import Path
import re
import urllib.parse
import urllib.request
import zipfile

BASE_URL = "https://data.binance.vision/data/spot/monthly/klines/BTCUSDT/1h"
YEARS = (2022, 2023)
MAX_ZIP_BYTES = 8_000_000
MAX_CHECKSUM_BYTES = 512


def download(url: str, limit: int) -> bytes:
    parsed = urllib.parse.urlsplit(url)
    if (parsed.scheme, parsed.hostname) != ("https", "data.binance.vision"):
        raise RuntimeError("Unexpected source host")
    req=urllib.request.Request(url,headers={"User-Agent":"Seven-Heaven-Source-Gate-Diagnostics/1.0"})
    with urllib.request.urlopen(req,timeout=45) as response:
        final=urllib.parse.urlsplit(response.geturl())
        if (final.scheme,final.hostname)!=("https","data.binance.vision"):
            raise RuntimeError("Unexpected redirect host")
        data=response.read(limit+1)
    if not data or len(data)>limit:
        raise RuntimeError("Download size outside limit")
    return data


def iso(sec:int)->str:
    return datetime.fromtimestamp(sec,timezone.utc).isoformat()


def inspect(year:int,month:int)->dict:
    stem=f"BTCUSDT-1h-{year}-{month:02d}"
    zip_name=stem+".zip"
    csv_name=stem+".csv"
    url=f"{BASE_URL}/{zip_name}"
    archive=download(url,MAX_ZIP_BYTES)
    checksum=download(url+".CHECKSUM",MAX_CHECKSUM_BYTES).decode().strip()
    m=re.fullmatch(r"([0-9a-fA-F]{64})\s+\*?"+re.escape(zip_name),checksum)
    if not m:
        raise RuntimeError("Unexpected CHECKSUM format")
    observed=hashlib.sha256(archive).hexdigest()
    if observed!=m.group(1).lower():
        raise RuntimeError("CHECKSUM mismatch")
    with zipfile.ZipFile(io.BytesIO(archive)) as z:
        if z.namelist()!=[csv_name]:
            raise RuntimeError("Unexpected ZIP members")
        rows=list(csv.reader(io.StringIO(z.read(csv_name).decode("utf-8"),newline="")))
    unit=1_000
    start=int(datetime(year,month,1,tzinfo=timezone.utc).timestamp())
    expected_count=calendar.monthrange(year,month)[1]*24
    expected={start+i*3600 for i in range(expected_count)}
    actual=[]
    close_bad=[]
    for idx,row in enumerate(rows,1):
        if len(row)!=12 or not row[0].isdigit() or not row[6].isdigit():
            raise RuntimeError(f"Invalid row {idx}")
        op=int(row[0]); cl=int(row[6]); sec=op//unit
        actual.append(sec)
        if op%unit:
            raise RuntimeError(f"Off-grid open timestamp line {idx}")
        exp_close=op+unit*3600-1
        if cl!=exp_close:
            close_bad.append({
                "line":idx,"open_utc":iso(sec),
                "delta_ms":cl-exp_close,
                "actual_close_raw":cl,"expected_close_raw":exp_close,
            })
    seen={}
    for sec in actual: seen[sec]=seen.get(sec,0)+1
    duplicates=[{"open_utc":iso(sec),"count":n} for sec,n in sorted(seen.items()) if n>1]
    missing=sorted(expected-set(actual))
    unexpected=sorted(set(actual)-expected)
    ordering=sum(1 for a,b in zip(actual,actual[1:]) if b<=a)
    anomaly=bool(len(rows)!=expected_count or missing or unexpected or duplicates or close_bad or ordering)
    return {
        "year":year,"month":month,"archive_sha256":observed,
        "rows":len(rows),"expected_rows":expected_count,
        "missing_count":len(missing),"missing_utc":[iso(x) for x in missing],
        "unexpected_count":len(unexpected),"unexpected_utc":[iso(x) for x in unexpected],
        "duplicates":duplicates,"ordering_errors":ordering,
        "close_mismatch_count":len(close_bad),"close_mismatches":close_bad,
        "anomalous":anomaly,
    }


def main():
    records=[]
    for year in YEARS:
        for month in range(1,13):
            r=inspect(year,month)
            records.append(r)
            print(
                f"{'ANOMALY' if r['anomalous'] else 'CLEAN'} {year}-{month:02d} "
                f"rows={r['rows']}/{r['expected_rows']} missing={r['missing_count']} "
                f"close={r['close_mismatch_count']}"
            )
    anomalies=[r for r in records if r["anomalous"]]
    result={
        "schema":"seven.heaven.strategy_lab.preregistered_source_gate_2022_2023.v1",
        "status":"SOURCE_GATE_FAIL" if anomalies else "SOURCE_GATE_PASS",
        "months_inspected":24,
        "months_clean":24-len(anomalies),
        "months_anomalous":len(anomalies),
        "records":records,
        "performance_runs":0,
        "policy":"SOURCE_DIAGNOSTICS_ONLY_NO_STRATEGY_NO_GAP_FILLING",
        "safety":{"orders_real":0,"workspace_reads":0,"workspace_writes":0},
    }
    Path("source_gate_2022_2023_diagnostics.json").write_text(
        json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8"
    )
    print("SOURCE GATE",json.dumps({
        "status":result["status"],"clean":result["months_clean"],
        "anomalous":result["months_anomalous"],"performance_runs":0
    }))


if __name__=="__main__":
    main()
