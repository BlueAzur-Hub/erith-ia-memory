#!/usr/bin/env python3
"""Durably stage authenticated Binance Spot original partial 1m months.
Writes original ZIP + official CHECKSUM + queryable SQLite and manifest.
Every record remains exchange-specific; missing 1m are explicit, never invented.
Only stages local files. The workflow alone controls GitHub Release publication.
"""
from __future__ import annotations
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
import csv
import hashlib
import io
import json
import os
from pathlib import Path
import sqlite3
import tempfile
from zipfile import ZipFile, ZIP_DEFLATED
import audit_top5_incomplete_months as audit

ROOT=Path(__file__).resolve().parents[1]/"data/historical_archive_prototype"
EVIDENCE=ROOT/"top5_original_gap_audit/index.json"
REPO="BlueAzur-Hub/erith-ia-memory"
TAG="crypto-top5-binance-partial-months-2026-10"
RELEASE=f"https://github.com/{REPO}/releases/download/{TAG}/"
ASSET_LIMIT=14
DDL="""CREATE TABLE candles (
    open_time_ms INTEGER PRIMARY KEY,
    open TEXT NOT NULL, high TEXT NOT NULL, low TEXT NOT NULL, close TEXT NOT NULL,
    base_volume TEXT NOT NULL, close_time_ms INTEGER NOT NULL,
    quote_volume TEXT NOT NULL, trade_count INTEGER NOT NULL,
    taker_base_volume TEXT NOT NULL, taker_quote_volume TEXT NOT NULL
);
CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
"""
def need(test,why):
    if not test: raise ValueError(why)
def sha_bytes(x): return hashlib.sha256(x).hexdigest()
def sha_file(p):
    with open(p,"rb") as f:
        dig=hashlib.sha256()
        for chunk in iter(lambda:f.read(1024*1024),b""): dig.update(chunk)
    return dig.hexdigest()
def ms(raw):
    stamp=int(raw)
    return stamp//1000 if stamp>=10**15 else stamp
def write_sqlite(zipped,pair,month,output):
    """Write original native OHLCV rows; source raw precision retained as TEXT."""
    name=f"{pair}-1m-{month}.csv"
    need(not output.exists(),"Refuse overwrite of SQLite "+str(output))
    db=sqlite3.connect(output)
    try:
        db.executescript(DDL)
        count=0
        with ZipFile(io.BytesIO(zipped)) as arch:
            need(arch.namelist()==[name],"Unexpected original CSV file")
            with arch.open(name) as f:
                reader=csv.reader(io.TextIOWrapper(f,encoding="utf-8-sig",newline=""))
                batch=[]
                for row in reader:
                    need(len(row)==12,"Unexpected original Spot CSV columns")
                    batch.append((ms(row[0]),row[1],row[2],row[3],row[4],row[5],
                                  ms(row[6]),row[7],int(row[8]),row[9],row[10]))
                    if len(batch)>=2000:
                        db.executemany("INSERT INTO candles VALUES (?,?,?,?,?,?,?,?,?,?,?)",batch)
                        count+=len(batch);batch=[]
                if batch:
                    db.executemany("INSERT INTO candles VALUES (?,?,?,?,?,?,?,?,?,?,?)",batch)
                    count+=len(batch)
        db.executemany("INSERT INTO metadata VALUES (?,?)", [
            ("pair",pair),("month",month),("quote","USDT"),("venue","Binance Spot"),
            ("source_zip_sha256",sha_bytes(zipped)),("native_rows",str(count)),
            ("synthetic_rows","0"),("is_source_complete","false")])
        db.commit()
        need(db.execute("PRAGMA quick_check").fetchone()[0]=="ok","SQLite integrity check failed")
        need(db.execute("SELECT COUNT(*) FROM candles").fetchone()[0]==count,
             "Missing SQLite stored candles")
        need(db.execute("SELECT COUNT(DISTINCT open_time_ms) FROM candles").fetchone()[0]==count,
             "Duplicate SQLite minute")
        first,last= db.execute("SELECT MIN(open_time_ms), MAX(open_time_ms) FROM candles").fetchone()
    finally:db.close()
    return {"native_rows":count,"sqlite_first_open_ms":first,"sqlite_last_open_ms":last,
            "sqlite_sha256":sha_file(output),"sqlite_bytes":output.stat().st_size}

def evidence():
    raw=EVIDENCE.read_bytes()
    src=json.loads(raw)
    need(src["schema"]=="seven.crypto.top5-original-altcoin-native-gap-evidence.v1"
         and src["months_targeted"]==14 and src["months_source_verified"]==14
         and src["source_native_rows"]==612999 and src["missing_native_1m"]==1881,
         "Pinned genuine Binance archive audit changed")
    expected=[]
    for item in src["assets"]:
        want=audit.TARGETS.get(item["asset_id"])
        need(want is not None and item["pair"]==want[0] and
             {row["month"] for row in item["months"]}==set(want[1]),
             "Canonical asset ownership or source months changed")
        for row in item["months"]:
            need(row["source_verified"] and row["pair"]==want[0]
                 and row["quote"]=="USDT" and row["synthetic_rows"]==0
                 and row["source_rows"]>0 and len(row["zip_sha256"])==64,
                 "Unqualified native 1m source")
            expected.append((item["asset_id"],row))
    need(len(expected)==ASSET_LIMIT, "Historical source inventory mismatch")
    return sorted(expected,key=lambda x:(x[0],x[1]["month"])),sha_bytes(raw)

def stage_one(asset,row,output,downloader=audit.fetch):
    pair,month=row["pair"],row["month"]
    name=f"{pair}-1m-{month}.zip"
    checkname=name+".CHECKSUM"
    dbname=f"{pair}-1m-{month}.sqlite"
    url,checkurl=audit.source_urls(pair,month)
    zipped=downloader(url,audit.MAX_ZIP)
    need(zipped.get("status")=="downloaded","Original Binance ZIP unavailable "+name)
    ck=downloader(checkurl,2048)
    need(ck.get("status")=="downloaded","Original Binance CHECKSUM unavailable "+name)
    raw,check=zipped["bytes"],ck["bytes"]
    audit.check_checksum(check,raw,name)
    need(sha_bytes(raw)==row["zip_sha256"] and
         sha_bytes(check)==row["checksum_sha256"],
         "Original source differs from locked 14-month audit: "+name)
    scan=audit.inspect_zip(raw,pair,month)
    need(scan["source_rows"]==row["source_rows"] and
         scan["missing_1m"]==row["missing_1m"] and
         scan["gaps"]==row["gaps"] and
         scan["close_time_anomalies"]==row["close_time_anomalies"],
         "Native rows or gap intervals differ from immutable evidence: "+name)
    folder=output
    for filename,bytes_ in ((name,raw),(checkname,check)):
        p=folder/filename
        need(not p.exists(),"Duplicate staged source file "+filename)
        p.write_bytes(bytes_)
    sqlite=write_sqlite(raw,pair,month,folder/dbname)
    need(sqlite["native_rows"]==row["source_rows"],
         "Query store does not contain all source rows "+name)
    return {
        "asset_id":asset,"venue":"Binance Spot","pair":pair,"quote":"USDT",
        "resolution":"1m","month":month,"status":row["status"],
        "native_rows":scan["source_rows"],"calendar_minutes":scan["calendar_minutes"],
        "missing_minutes":scan["missing_1m"],"missing_intervals":scan["gaps"],
        "source_close_time_anomalies":scan["close_time_anomalies"],
        "original_zip":{"name":name,"bytes":len(raw),"sha256":sha_bytes(raw),"url":RELEASE+name},
        "official_checksum":{"name":checkname,"bytes":len(check),"sha256":sha_bytes(check),"url":RELEASE+checkname},
        "sqlite":{"name":dbname,"bytes":sqlite["sqlite_bytes"],"sha256":sqlite["sqlite_sha256"],
                  "rows":sqlite["native_rows"],"url":RELEASE+dbname},
        "source_url":url,"source_checksum_url":checkurl,
        "source_verified":True,"synthetic_candles":0,
        "close_time_is_original":True,"in_top250_full_month_catalog":False}

def stage(output,workers=3):
    need(1<=workers<=4,"Unsafe parallel archive count")
    need(not output.exists(),"Refuse to overwrite existing staged source directory")
    output.mkdir(parents=True)
    targets,lock=evidence()
    produced=[]
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures={pool.submit(stage_one,cid,r,output):(cid,r["month"]) for cid,r in targets}
        for future in as_completed(futures):
            cid,month=futures[future];r=future.result()
            need(r["asset_id"]==cid and r["month"]==month,"Wrong archive owner")
            produced.append(r)
            print("PRESERVED AUTHENTIC NATIVE MONTH "+json.dumps({
                "asset":cid,"month":month,"rows":r["native_rows"],
                "missing":r["missing_minutes"]},sort_keys=True),flush=True)
    produced.sort(key=lambda r:(r["asset_id"],r["month"]))
    need(len(produced)==14 and sum(r["native_rows"] for r in produced)==612999
         and sum(r["missing_minutes"] for r in produced)==1881,
         "Original full/partial counts changed")
    docs={
        "schema":"seven.crypto.top5-original-partial-sqlite-source-vault.v1",
        "release_tag":TAG,"release_page":f"https://github.com/{REPO}/releases/tag/{TAG}",
        "source":"Official Binance Spot native 1m ZIP and original CHECKSUM",
        "original_audit_git_path":"public/agent_crypto_erith_ia/data/historical_archive_prototype/top5_original_gap_audit/index.json",
        "original_audit_sha256":lock,
        "assets":["ethereum","binancecoin","ripple","solana"],
        "months":produced,
        "stored_months":len(produced),"stored_original_candles":612999,
        "original_missing_minutes":1881,
        "synthetic_rows":0,"native_quote":"USDT","quote_conversion_applied":False,
        "original_monthly_zips_preserved":True,
        "separate_from_complete_month_canonical_catalog":True,
        "trader_interface_modified":False,
        "not_token_genesis_history":True,
        "sqlite_table":"candles",
        "notes":"The original source ZIP and official CHECKSUM are saved in the Release, along with a queryable SQLite containing every authentic source candle. Missing minutes are absent, not zero-filled or interpolated. One SOL Dec 2021 close-time anomaly is preserved exactly."}
    (output/"manifest.json").write_text(json.dumps(docs,indent=2,sort_keys=True)+"\n",encoding="utf-8")
    print("TOP5 PARTIAL SOURCE STAGED "+json.dumps({k:docs[k] for k in
         ("stored_months","stored_original_candles","original_missing_minutes","synthetic_rows")}),flush=True)
    return docs

def self_test():
    audit.self_test()
    pair="ETHUSDT";month="2021-08"
    start,_,expected=audit.month_bounds(month)
    csvbuf=io.StringIO();wr=csv.writer(csvbuf)
    for i in (0,2):
        t=start+i*60000
        wr.writerow([t,"100.100","101.00","100.00","100.500","0.250",t+59999,
                     "25.00",1,"0.125","12.50","0"])
    bio=io.BytesIO()
    with ZipFile(bio,"w",ZIP_DEFLATED) as z:
        z.writestr(f"{pair}-1m-{month}.csv",csvbuf.getvalue())
    with tempfile.TemporaryDirectory() as tmp:
        stats=write_sqlite(bio.getvalue(),pair,month,Path(tmp)/"candidate.sqlite")
        db=sqlite3.connect(Path(tmp)/"candidate.sqlite")
        try:
            rows=db.execute("SELECT open_time_ms,open,close FROM candles ORDER BY open_time_ms").fetchall()
        finally:db.close()
        need(stats["native_rows"]==2 and rows==[(start,"100.100","100.500"),
              (start+2*60000,"100.100","100.500")],"Not exactly original source rows")
        need(audit.inspect_zip(bio.getvalue(),pair,month)["missing_1m"]==expected-2,
             "Gap was synthesized in local fixture")
    print("PASS: original precision persisted, no invented gap candle, safe SQLite")

if __name__=="__main__":
    p=argparse.ArgumentParser()
    a=p.add_mutually_exclusive_group(required=True)
    a.add_argument("--stage",action="store_true")
    a.add_argument("--self-test",action="store_true")
    p.add_argument("--output",type=Path)
    p.add_argument("--workers",type=int,default=3)
    args=p.parse_args()
    if args.self_test:self_test()
    else:
        need(args.output is not None,"Output directory required")
        need(os.environ.get("GITHUB_ACTIONS")=="true" and
             os.environ.get("GITHUB_REPOSITORY")==REPO,
             "Authenticated source staging requires GitHub Actions")
        stage(args.output,args.workers)
