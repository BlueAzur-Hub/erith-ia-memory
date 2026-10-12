#!/usr/bin/env python3
"""First source-verified backward collection for ETH/BNB/XRP/SOL, Jan-Apr 2021.
Preserves every original Binance Spot OHLCV candle and explicit gaps.
Original ZIP and checksum plus queryable SQLite are stored in a separate
immutable Release; no ticker substitution, synthetic candle or Trader change.
"""
from __future__ import annotations
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import json
from pathlib import Path
import sqlite3
import os
import tempfile
import io
import csv
from zipfile import ZipFile,ZIP_DEFLATED
import audit_top5_incomplete_months as audit
import archive_top5_partial_months as vault

ROOT=Path(__file__).resolve().parents[1]/"data/historical_archive_prototype"
CATALOG=ROOT/"top250_multisource_coverage/index.json"
FROM="2021-01"
TO="2021-04"
MONTHS=("2021-01","2021-02","2021-03","2021-04")
TAG="crypto-top5-binance-earlier-2021-01_2021-04"
RELEASE=f"https://github.com/{vault.REPO}/releases/download/{TAG}/"
ASSETS=("ethereum","binancecoin","ripple","solana")

def need(x,why):
    if not x: raise ValueError(why)
def registry():
    raw=CATALOG.read_bytes()
    doc=json.loads(raw)
    need(doc.get("ranked")==250 and doc.get("quote")=="USDT"
         and len(doc.get("assets",[]))==250,"Historical identity registry changed")
    ranked={a["id"]:a for a in doc["assets"]}
    for cid in ASSETS:
        row=ranked.get(cid)
        need(row and row["source"]=="Binance Spot official native 1m ZIPs"
             and row["months"]>=60 and row["quote"]=="USDT"
             and row["symbol"]+"USDT"==audit.TARGETS[cid][0],
             "Unverified source owner for "+cid)
    return vault.sha_bytes(raw)

def save_one(cid,month,out,download=audit.fetch):
    pair=audit.TARGETS[cid][0]
    zname=f"{pair}-1m-{month}.zip"
    curl,chkurl=audit.source_urls(pair,month)
    base={"asset_id":cid,"month":month,"market_pair":pair,"quote":"USDT",
          "source_url":curl,"official_checksum_url":chkurl,
          "no_substitution":True,"no_invented_bars":True}
    response=download(curl,audit.MAX_ZIP)
    if response.get("status")!="downloaded":
        return {**base,"status":"source_unavailable","source_http_status":response.get("http_code"),
                "source_network_status":response.get("status"),"verified_native_rows":0}
    checksum=download(chkurl,2048)
    if checksum.get("status")!="downloaded":
        return {**base,"status":"checksum_unavailable","source_http_status":checksum.get("http_code"),
                "verified_native_rows":0}
    raw,ck=response["bytes"],checksum["bytes"]
    audit.check_checksum(ck,raw,zname)
    verify=audit.inspect_zip(raw,pair,month)
    need(verify["source_rows"]>0
         and verify["source_rows"]+verify["missing_1m"]==verify["calendar_minutes"]
         and sum(y["missing_minutes"] for y in verify["gaps"])==verify["missing_1m"],
         "Original 1m month calendar invalid")
    ckname=zname+".CHECKSUM";sqlname=f"{pair}-1m-{month}.sqlite"
    for file,contents in ((zname,raw),(ckname,ck)):
        p=out/file
        need(not p.exists(),"Duplicate source ZIP/checksum")
        p.write_bytes(contents)
    sqlpath=out/sqlname
    details=vault.write_sqlite(raw,pair,month,sqlpath)
    need(details["native_rows"]==verify["source_rows"],"SQLite rows differ")
    # The existing generic writer defaults to 'noncomplete'. Change this field
    # only for actually complete source months; no OHLCV is ever altered.
    full=(verify["missing_1m"]==0 and verify["close_time_anomalies"]==0)
    if full:
        conn=sqlite3.connect(sqlpath)
        try:
            conn.execute("UPDATE metadata SET value='true' WHERE key='is_source_complete'")
            conn.commit()
            need(conn.execute("PRAGMA quick_check").fetchone()[0]=="ok",
                 "Source query store failed integrity check")
        finally:conn.close()
    details["sqlite_sha256"]=vault.sha_file(sqlpath)
    details["sqlite_bytes"]=sqlpath.stat().st_size
    return {**base,"status":"complete_native_1m" if full else "partial_or_close_time_anomaly",
            "venue":"Binance Spot","resolution":"1m","source_zip_sha256":vault.sha_bytes(raw),
            "source_checksum_sha256":vault.sha_bytes(ck),"verified_native_rows":verify["source_rows"],
            "expected_calendar_minutes":verify["calendar_minutes"],
            "missing_native_minutes":verify["missing_1m"],
            "gap_windows":verify["gaps"],"zero_volume_original_candles":verify["zero_volume_native_candles"],
            "source_close_time_anomalies":verify["close_time_anomalies"],
            "first_source_month_not_proven":True,"token_creation_date_not_inferred":True,
            "original_source":{"name":zname,"bytes":len(raw),"sha256":vault.sha_bytes(raw),"url":RELEASE+zname},
            "official_checksum":{"name":ckname,"bytes":len(ck),"sha256":vault.sha_bytes(ck),"url":RELEASE+ckname},
            "sqlite":{"name":sqlname,"bytes":details["sqlite_bytes"],"sha256":details["sqlite_sha256"],
                      "rows":details["native_rows"],"url":RELEASE+sqlname},
            "synthetic_candles":0}
def stage(out,workers=3):
    need(not out.exists(),"Refuse to overwrite already-staged source")
    need(1<=workers<=4,"Unbounded concurrent source downloads")
    lock=registry()
    out.mkdir(parents=True)
    rows=[]
    with ThreadPoolExecutor(max_workers=workers) as pool:
        pending={pool.submit(save_one,cid,month,out):(cid,month)
                 for cid in ASSETS for month in MONTHS}
        for job in as_completed(pending):
            r=job.result()
            rows.append(r)
            print("OLDER NATIVE SPOT MONTH "+json.dumps({
                "asset":r["asset_id"],"month":r["month"],"status":r["status"],
                "native_rows":r.get("verified_native_rows",0),
                "missing_minutes":r.get("missing_native_minutes")},sort_keys=True),flush=True)
    rows.sort(key=lambda x:(x["asset_id"],x["month"]))
    good=[x for x in rows if x["status"] in ("complete_native_1m","partial_or_close_time_anomaly")]
    need(len(rows)==16 and len({(r["asset_id"],r["month"]) for r in rows})==16,
         "Historical scan incomplete or duplicate source")
    need(len(good)>=8, "Insufficient official original source archives for this pilot")
    report={
      "schema":"seven.crypto.top5-original-earlier-source-vault.v1",
      "scope":"Binance Spot ETHUSDT BNBUSDT XRPUSDT SOLUSDT four monthly 1m ZIPs per pair, 2021-01 to 2021-04",
      "release_tag":TAG,"release_page":f"https://github.com/{vault.REPO}/releases/tag/{TAG}",
      "catalog_source_git_path":"public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_multisource_coverage/index.json",
      "catalog_source_sha256":lock,"assets":list(ASSETS),
      "first_month":FROM,"last_month":TO,"source_months_requested":16,
      "source_months_verified":len(good),
      "source_months_unavailable":16-len(good),
      "verified_original_candles":sum(r["verified_native_rows"] for r in good),
      "missing_native_minutes_in_verified_months":sum(r["missing_native_minutes"] for r in good),
      "source_complete_months":sum(r["status"]=="complete_native_1m" for r in good),
      "native_close_time_anomalies":sum(r["source_close_time_anomalies"] for r in good),
      "original_files_kept_in_release":True,
      "no_synthetic_candles":True,"quote":"USDT",
      "trader_interface_modified":False,
      "rows":rows,
      "notes":"Earlier archive month is not coin creation, first trade, or full-history proof. Partial original months are stored with holes. An unavailable source is NOT zero market trades."}
    (out/"manifest.json").write_text(json.dumps(report,sort_keys=True,indent=2)+"\n",encoding="utf-8")
    need({p.name for p in out.iterdir()}==
         {"manifest.json"} | {r[key]["name"] for r in good
                              for key in ("original_source","official_checksum","sqlite")},
         "Unrecognized files staged in original source Release")
    print("TOP5 OLDER ORIGINAL BINANCE SOURCE STAGED "+json.dumps({k:report[k] for k in
         ("source_months_verified","source_months_unavailable","verified_original_candles",
          "missing_native_minutes_in_verified_months","source_complete_months")}),flush=True)
    return report
def self_test():
    vault.self_test()
    lock=registry()
    need(len(lock)==64,"Verified identity SHA missing")
    need(len(MONTHS)==4 and all(m<"2021-05" for m in MONTHS),"Wrong historical months")
    need(len(ASSETS)==4,"Wrong historical pairs")
    print("PASS: bounded Top5 historical identity, safe isolated source test")

if __name__=="__main__":
    p=argparse.ArgumentParser()
    c=p.add_mutually_exclusive_group(required=True)
    c.add_argument("--stage",action="store_true")
    c.add_argument("--self-test",action="store_true")
    p.add_argument("--output",type=Path)
    p.add_argument("--workers",type=int,default=3)
    a=p.parse_args()
    if a.self_test:self_test()
    else:
        need(a.output is not None and os.environ.get("GITHUB_ACTIONS")=="true"
             and os.environ.get("GITHUB_REPOSITORY")==vault.REPO,
             "Historical Release staging requires authorized GitHub Actions")
        stage(a.output,a.workers)
