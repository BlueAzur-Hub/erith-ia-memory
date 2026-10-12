#!/usr/bin/env python3
"""Read-only official Binance BTCUSDT original trades vs 23 unchecked 1m gap-days.
No OHLCV replacement, no interpolation, no archive modifications.
Evidence is valid only with matching Binance ZIP and CHECKSUM SHA256.
"""
from __future__ import annotations
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import sys
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
import time
import audit_btc_trade_gaps as native
import audit_btc_minute_gaps as previous
import freeze_btc_daily_reference as frozen

ROOT = frozen.ROOT
PILOT = ROOT / "btc_trade_gap_pilot" / "index.json"
ORIGIN = "https://data.binance.vision/data/spot/daily/trades/BTCUSDT/"
MAX_ARCHIVE = 250_000_000
M = 60_000

def need(test, reason):
    if not test:
        raise ValueError(reason)

def scope():
    months, days, locks = previous.ledger(ROOT)
    old = json.loads(PILOT.read_text(encoding="utf-8"))
    verified = [r for r in old["records"] if r.get("source_status") == "sha256_verified"]
    sampled = {r["date"] for r in verified}
    ref = frozen.build(ROOT)
    need(len(months) == 21 and len(days) == 26, "BTC locked gap catalog changed")
    need(sum(map(len, days.values())) == 5881, "BTC gap minute count changed")
    need(len(verified) == 3 and sum(r["original_missing_1m"] for r in verified) == 910,
         "Original 3-day raw-trades pilot is not fully verified")
    need(ref["utc_day_count"] == 3075 and ref["locked_source"]["data_sha256"] == locks["daily_reference_sha256"],
         "BTC daily protected reference changed")
    remaining = sorted(set(days).difference(sampled))
    need(len(remaining) == 23 and sum(len(days[d]) for d in remaining) == 4971,
         "Unchecked day/minute count mismatch")
    return days, remaining, locks

def get(url, cap, attempts=3):
    need(url.startswith(ORIGIN + "BTCUSDT-trades-") and ".." not in url,
         "Non-Binance or malformed source")
    for attempt in range(attempts):
        try:
            with urlopen(Request(url, headers={"User-Agent":"Seven-Heaven-Trade-Integrity-Audit",
                                               "Accept":"application/octet-stream"}), timeout=100) as rsp:
                need(rsp.status == 200, "Source non-200")
                raw = rsp.read(cap+1)
            need(0 < len(raw) <= cap, "Source too large or empty")
            return {"status":"downloaded", "data":raw}
        except HTTPError as e:
            if e.code in (400,403,404,410,418,429,451):
                return {"status":"http_unavailable", "http_status":e.code}
            if attempt == attempts-1: return {"status":"http_unavailable", "http_status":e.code}
        except (URLError, TimeoutError, OSError) as e:
            if attempt == attempts-1:
                return {"status":"transport_unavailable", "error":str(type(e).__name__)}
        time.sleep(attempt+1)
    return {"status":"inconclusive"}

def verify_day(date, missing, download=get):
    filename=f"BTCUSDT-trades-{date}.zip"
    link=ORIGIN+filename
    result={"date":date,"original_missing_minutes":len(missing),
            "source_zip_url":link,"source_checksum_url":link+".CHECKSUM",
            "status":"not_verified","native_candles_created":0,
            "zero_original_trades_proven":False}
    try:
        raw=download(link, MAX_ARCHIVE)
        if raw["status"]!="downloaded":
            return {**result,"status":raw["status"],"http_status":raw.get("http_status")}
        ck=download(link+".CHECKSUM",2048)
        if ck["status"]!="downloaded":
            return {**result,"status":"checksum_unavailable","http_status":ck.get("http_status")}
        native.official_checksum(ck["data"],raw["data"],filename)
        parsed=native.inspect_trades(raw["data"],filename,date,missing)
        need(parsed["gap_minutes_with_at_least_one_trade"]<=len(missing),
             "Out-of-bounds trade minutes")
        return {**result,"status":"source_sha256_verified","zero_original_trades_proven":
                parsed["trade_rows_in_kline_gaps"]==0,
                "zip_sha256":hashlib.sha256(raw["data"]).hexdigest(),
                "checksum_sha256":hashlib.sha256(ck["data"]).hexdigest(),
                "compressed_bytes":len(raw["data"]),
                "native_trade_rows":parsed["native_trade_rows"],
                "trade_rows_in_missing_kline_minutes":parsed["trade_rows_in_kline_gaps"],
                "minutes_with_trades":parsed["gap_minutes_with_at_least_one_trade"],
                "minutes_without_trades":parsed["gap_minutes_without_trade_in_this_file"],
                "min_trade_time_ms":parsed["first_trade_time_ms"],
                "max_trade_time_ms":parsed["last_trade_time_ms"],
                "candidate_native_klines_created":0}
    except Exception as e:
        return {**result,"status":"source_validation_failed",
                "error_type":type(e).__name__,"error":str(e)[:180]}

def audit(shard, shards, output):
    days, remaining, lock=scope()
    need(shards == 4 and shard in range(shards), "Expected four disjoint bounded shards")
    target=[d for i,d in enumerate(remaining) if i%shards==shard]
    rows=[verify_day(d,days[d]) for d in target]
    doc={"schema":"seven.crypto.btc.remaining-original-trades-shard.v1",
         "source_policy":"original_binance_spot_trades_zip_official_checksum_no_synthesis",
         "shard":shard,"shards":shards,"days":rows,
         "expected_days":len(target),
         "expected_gap_minutes":sum(len(days[d]) for d in target),
         "verified_gap_minutes":sum(x["original_missing_minutes"] for x in rows
                                    if x["status"]=="source_sha256_verified"),
         "unverified_gap_minutes":sum(x["original_missing_minutes"] for x in rows
                                      if x["status"]!="source_sha256_verified"),
         "source_locks":lock,
         "trader_modified":False, "original_files_modified":False}
    need(doc["verified_gap_minutes"]+doc["unverified_gap_minutes"]==doc["expected_gap_minutes"],
         "Incomplete shard reconciliation")
    output.parent.mkdir(parents=True,exist_ok=True)
    output.write_text(json.dumps(doc,sort_keys=True,indent=2)+"\n",encoding="utf-8")
    print("ORIGINAL BTC RAW TRADE AUDIT",json.dumps({"shard":shard,
        "verified_days":sum(x["status"]=="source_sha256_verified" for x in rows),
        "days":len(target),"verified_gap_minutes":doc["verified_gap_minutes"],
        "unverified_gap_minutes":doc["unverified_gap_minutes"]}),flush=True)

def merge(folder, output):
    days, remaining,lock=scope()
    files=sorted(folder.glob("btc-trade-shard-*.json"))
    need(len(files)==4, "Missing shard results")
    docs=[json.loads(f.read_text(encoding="utf-8")) for f in files]
    need({d["shard"] for d in docs}==set(range(4)), "Duplicate or missing shard index")
    need(all(d["source_locks"]==lock for d in docs),"Cross-shard source drift")
    all_rows=[r for d in docs for r in d["days"]]
    need(len(all_rows)==23 and len({r["date"] for r in all_rows})==23,
         "Incorrect audit day set")
    need({r["date"] for r in all_rows}==set(remaining),"Wrong original gap dates")
    need(sum(r["original_missing_minutes"] for r in all_rows)==4971,
         "Original gap minute mismatch")
    old=json.loads(PILOT.read_text(encoding="utf-8"))
    original=old["records"]
    checked=[r for r in all_rows if r["status"]=="source_sha256_verified"]
    doc={"schema":"seven.crypto.btc.remaining-original-trades-audit.v1",
         "venue":"Binance Spot","pair":"BTCUSDT","quote":"USDT",
         "known_original_missing_1m":5881,
         "previous_verified_trade_minutes":910,
         "additional_gap_minutes_covered_by_verified_archive":sum(r["original_missing_minutes"] for r in checked),
         "remaining_gap_minutes_without_verified_trade_archive":sum(r["original_missing_minutes"] for r in all_rows if r not in checked),
         "additional_verified_gap_minutes_with_trades":sum(r.get("minutes_with_trades",0) for r in checked),
         "additional_verified_gap_minutes_without_trades":sum(r.get("minutes_without_trades",0) for r in checked),
         "pilot_source_zip_sha256":[r["zip_sha256"] for r in original],
         "source_locks":lock, "source_scope":"23 previously unchecked days, original public Binance daily trades ZIP and CHECKSUM",
         "status":"all_23_original_trade_days_verified" if len(checked)==23 else "partial_audit_unverified_sources_exist",
         "records":sorted(all_rows,key=lambda r:r["date"]),
         "no_synthetic_ohlcv":True,"original_binance_source_modified":False,
         "coinbase_kraken_history_modified":False,"trader_modified":False}
    need(doc["additional_verified_gap_minutes_with_trades"]+
         doc["additional_verified_gap_minutes_without_trades"]==
         doc["additional_gap_minutes_covered_by_verified_archive"],
         "Trade archive reconciliation error")
    need(doc["additional_gap_minutes_covered_by_verified_archive"]+
         doc["remaining_gap_minutes_without_verified_trade_archive"]==4971,
         "Missing statuses not accounted for")
    output.parent.mkdir(parents=True,exist_ok=True)
    output.write_text(json.dumps(doc,sort_keys=True,indent=2)+"\n",encoding="utf-8")
    print("BTC ADDITIONAL ORIGINAL TRADE AUDIT SUMMARY",json.dumps({k:doc[k] for k in (
        "status","additional_gap_minutes_covered_by_verified_archive",
        "remaining_gap_minutes_without_verified_trade_archive",
        "additional_verified_gap_minutes_with_trades",
        "additional_verified_gap_minutes_without_trades")}),flush=True)

def main():
    parser=argparse.ArgumentParser()
    group=parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--shard",type=int)
    group.add_argument("--merge",type=Path)
    parser.add_argument("--shards",type=int,default=4)
    parser.add_argument("--output",type=Path,required=True)
    a=parser.parse_args()
    if a.merge is not None: merge(a.merge,a.output)
    else: audit(a.shard,a.shards,a.output)
if __name__=="__main__":main()
