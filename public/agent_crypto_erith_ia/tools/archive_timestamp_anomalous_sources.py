#!/usr/bin/env python3
"""Preserve early original Binance Spot 1m source files with off-grid opens.
This quarantine is NOT promoted to an exact UTC calendar 1m series.
The original milliseconds and every OHLCV text value are kept in SQLite.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import tempfile
import sqlite3
import audit_top5_incomplete_months as audit
import archive_top5_partial_months as archive

REPO="BlueAzur-Hub/erith-ia-memory"
TAG="crypto-binance-early-offgrid-original-sources"
ROOT=Path(__file__).resolve().parents[1]/"data/historical_archive_prototype"
PROOF=ROOT/"top5_original_source_anomalies/index.json"
EXPECTED={("ETHUSDT","2017-12"),("BNBUSDT","2017-12"),
          ("ETHUSDT","2018-02"),("BNBUSDT","2018-02")}
def need(check,message):
    if not check:raise ValueError(message)
def lock():
    raw=PROOF.read_bytes()
    j=json.loads(raw)
    need(j["schema"]=="seven.crypto.binance-2018-feb-source-anomaly-audit.v1"
         and len(j["assets"])==4
         and {(x["market_pair"],x["month"]) for x in j["assets"]}==EXPECTED
         and all(x["misaligned_time_rows"]>0 and x["rows_outside_target_month"]==0
                 and x["duplicate_open_time_rows"]==0 for x in j["assets"]),
         "Original source quarantine audit unavailable or altered")
    return j,hashlib.sha256(raw).hexdigest()
def stage(output):
    need(not output.exists(),"Refuse overwriting staged early original source")
    evidence,digest=lock()
    output.mkdir(parents=True)
    records=[]
    for e in sorted(evidence["assets"],key=lambda x:(x["month"],x["market_pair"])):
        pair,month=e["market_pair"],e["month"]
        name=f"{pair}-1m-{month}.zip"
        orig,checksum=audit.source_urls(pair,month)
        zipped=audit.fetch(orig,audit.MAX_ZIP)
        need(zipped["status"]=="downloaded","Binance original ZIP currently unavailable")
        check=audit.fetch(checksum,2048)
        need(check["status"]=="downloaded","Binance original CHECKSUM currently unavailable")
        binary,ck=zipped["bytes"],check["bytes"]
        audit.check_checksum(ck,binary,name)
        need(archive.sha_bytes(binary)==e["source_zip_sha256"]
             and archive.sha_bytes(ck)==e["official_checksum_sha256"],
             "Source original ZIP drift since read-only anomaly audit "+name)
        for filename,data in ((name,binary),(name+".CHECKSUM",ck)):
            path=output/filename
            need(not path.exists(),"Duplicate original source name")
            path.write_bytes(data)
        sqlite=output/f"{pair}-1m-{month}.sqlite"
        saved=archive.write_sqlite(binary,pair,month,sqlite)
        need(saved["native_rows"]==e["raw_original_rows"],
             "SQLite original rows differ from SHA-pinned ZIP data")
        with sqlite3.connect(sqlite) as db:
            opens=db.execute("SELECT COUNT(*),COUNT(DISTINCT open_time_ms) FROM candles").fetchone()
            need(opens==(e["raw_original_rows"],e["raw_original_rows"]),
                 "Unstable timestamp or duplicated original rows")
            # Count irregular open minutes WITHOUT silently rounding them.
            start,_,_=audit.month_bounds(month)
            irregular=db.execute("SELECT COUNT(*) FROM candles WHERE (open_time_ms - ?) % 60000 != 0",
                                 (start,)).fetchone()[0]
            need(irregular==e["misaligned_time_rows"],
                 "Source off-grid identity differs between scanner and SQLite")
        saved["sqlite_sha256"]=archive.sha_file(sqlite)
        row={
            "market_pair":pair,"month":month,"venue":"Binance Spot","quote":"USDT",
            "source_status":"original_sha256_verified_quarantined_offgrid",
            "original_rows":e["raw_original_rows"],
            "original_offgrid_open_times":e["misaligned_time_rows"],
            "original_strict_minute_aligned_rows":e["native_rows_in_target_month"],
            "calendar_missing_exact_minute_slots":e["missing_calendar_minutes"],
            "source_zip_sha256":e["source_zip_sha256"],
            "source_checksum_sha256":e["official_checksum_sha256"],
            "original_source_file":{"name":name,"bytes":len(binary),
                "sha256":archive.sha_bytes(binary),
                "url":f"https://github.com/{REPO}/releases/download/{TAG}/{name}"},
            "official_checksum":{"name":name+".CHECKSUM","bytes":len(ck),
                "sha256":archive.sha_bytes(ck),
                "url":f"https://github.com/{REPO}/releases/download/{TAG}/{name}.CHECKSUM"},
            "sqlite":{"name":sqlite.name,"bytes":saved["sqlite_bytes"],
                "sha256":saved["sqlite_sha256"],"rows":saved["native_rows"],
                "url":f"https://github.com/{REPO}/releases/download/{TAG}/{sqlite.name}"},
            "sqlite_keeps_original_millisecond_open_time":True,
            "utc_minute_calendar_aggregation_allowed":False,
            "source_ohlcv_recomputed":False,
            "cross_quote_conversion":False,
            "synthetic_ohlcv":0,
            "source_url":orig,"source_checksum_url":checksum}
        records.append(row)
        print("EARLY OFFGRID ORIGINAL SOURCE PRESERVED",
              json.dumps({"pair":pair,"month":month,"rows":row["original_rows"],
                "offgrid":row["original_offgrid_open_times"]},sort_keys=True),flush=True)
    doc={
        "schema":"seven.crypto.early-original-source-quarantine.v1",
        "release_tag":TAG,
        "release_page":f"https://github.com/{REPO}/releases/tag/{TAG}",
        "parent_source_anomaly_audit_path":
          "public/agent_crypto_erith_ia/data/historical_archive_prototype/top5_original_source_anomalies/index.json",
        "parent_source_anomaly_audit_sha256":digest,
        "source_months":len(records),
        "original_unmodified_native_ohlcv_rows":sum(r["original_rows"] for r in records),
        "original_offgrid_rows":sum(r["original_offgrid_open_times"] for r in records),
        "source":"Original Binance Spot ZIP and official CHECKSUM per asset/month",
        "native_quote":"USDT",
        "no_synthetic_candles":True,
        "excluded_from_strict_calendar_1m_catalog":True,
        "trader_interface_modified":False,
        "original_archive_files_retained":True,
        "status":"QUERYABLE_SOURCE_QUARANTINE_NOT_CONTINUOUS_MARKET_HISTORY",
        "records":records}
    (output/"manifest.json").write_text(json.dumps(doc,indent=2,sort_keys=True)+"\n")
    expected={"manifest.json"}|{r[k]["name"] for r in records
         for k in ("original_source_file","official_checksum","sqlite")}
    need({p.name for p in output.iterdir()}==expected and len(expected)==13,
         "Unexpected quarantine archive")
    need(doc["original_unmodified_native_ohlcv_rows"]==165650
         and doc["original_offgrid_rows"]==43204,
         "Original anomalous source totals differ from read-only audit")
    print("ORIGINAL OFFGRID MONTH QUARANTINE STAGED",json.dumps({
      "month_pairs":doc["source_months"],"original_rows":doc["original_unmodified_native_ohlcv_rows"],
      "offgrid_rows":doc["original_offgrid_rows"]},sort_keys=True))
    return doc
def self_test():
    with tempfile.TemporaryDirectory() as tmp:
        archive.self_test()
    print("PASS: original timestamp preserved, calendar-native promotion refused")
if __name__=="__main__":
    p=argparse.ArgumentParser()
    m=p.add_mutually_exclusive_group(required=True)
    m.add_argument("--stage",action="store_true")
    m.add_argument("--self-test",action="store_true")
    p.add_argument("--output",type=Path)
    a=p.parse_args()
    if a.self_test:self_test()
    else:
        need(a.output is not None and os.environ.get("GITHUB_ACTIONS")=="true"
             and os.environ.get("GITHUB_REPOSITORY")==REPO,
             "Quarantined originals may be staged only by authorized GitHub Actions")
        stage(a.output)
