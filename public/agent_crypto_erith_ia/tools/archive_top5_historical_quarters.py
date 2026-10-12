#!/usr/bin/env python3
"""Historical native Binance Spot Top5 2020 quarterly source backfill.
Four independent bounded 12-source quarters; original ZIP, signed checksum
comparison, native SQLite, explicit UTC gaps; no OHLCV synthesis.
"""
from __future__ import annotations
import argparse
from concurrent.futures import ThreadPoolExecutor,as_completed
from pathlib import Path
import json
import os
import hashlib
import archive_top5_earlier_months as early

REPO="BlueAzur-Hub/erith-ia-memory"
QUARTERS={
    "q1":("2020-01","2020-02","2020-03"),
    "q2":("2020-04","2020-05","2020-06"),
    "q3":("2020-07","2020-08","2020-09"),
    "q4":("2020-10","2020-11","2020-12"),
}
ASSETS=("ethereum","binancecoin","ripple","solana")
ROOT=Path(__file__).resolve().parents[1]/"data/historical_archive_prototype"
SOURCE_ONE=ROOT/"top5_earlier_source_vault/index.json"
MAX_PARALLEL=3

def need(x,reason):
    if not x:raise ValueError(reason)
def release_tag(quarter):
    ms=QUARTERS[quarter]
    return f"crypto-top5-binance-original-{ms[0]}_{ms[-1]}"
def stage(quarter,output,workers=MAX_PARALLEL):
    need(quarter in QUARTERS and 1<=workers<=3 and not output.exists(),
         "Invalid 2020 quarter or staging path")
    source=early.registry()
    tag=release_tag(quarter)
    early.RELEASE=f"https://github.com/{REPO}/releases/download/{tag}/"
    output.mkdir(parents=True)
    rows=[]
    with ThreadPoolExecutor(max_workers=workers) as pool:
        jobs={pool.submit(early.save_one,cid,mo,output):(cid,mo)
             for cid in ASSETS for mo in QUARTERS[quarter]}
        for f in as_completed(jobs):
            x=f.result()
            need(x["asset_id"]==jobs[f][0] and x["month"]==jobs[f][1],
                 "Wrong source pair or historic month")
            rows.append(x)
            print("2020 ORIGINAL SOURCE "+json.dumps({
                "asset":x["asset_id"],"month":x["month"],
                "status":x["status"],"native_rows":x["verified_native_rows"],
                "missing_minutes":x.get("missing_native_minutes")},sort_keys=True),flush=True)
    rows.sort(key=lambda x:(x["asset_id"],x["month"]))
    good=[r for r in rows if r["status"] in ("complete_native_1m","partial_or_close_time_anomaly")]
    need(len(rows)==12 and len({(r["asset_id"],r["month"]) for r in rows})==12,
         "Invalid quarter source set")
    need(len(good)>=6, "Insufficient source ZIPs: do not imply no market trades")
    names={"manifest.json"}|{r[k]["name"] for r in good for k in ("original_source","official_checksum","sqlite")}
    need(names=={p.name for p in output.iterdir()}|{"manifest.json"},
         "Unexpected staged source files")
    summary={
        "schema":"seven.crypto.top5-earlier-quarter-native-vault.v1",
        "quarter":quarter,"release_tag":tag,
        "release_page":f"https://github.com/{REPO}/releases/tag/{tag}",
        "first_month":QUARTERS[quarter][0],"last_month":QUARTERS[quarter][-1],
        "assets":list(ASSETS),"requested_source_months":12,
        "source_verified_months":len(good),"source_unavailable_months":len(rows)-len(good),
        "native_1m_candles":sum(x["verified_native_rows"] for x in good),
        "native_1m_missing":sum(x["missing_native_minutes"] for x in good),
        "fully_complete_source_months":sum(x["status"]=="complete_native_1m" for x in good),
        "original_close_time_anomalies":sum(x["source_close_time_anomalies"] for x in good),
        "original_identity_index_sha256":source,
        "source":"Original Binance Spot 1m ZIP and official CHECKSUM; stored full native OHLCV as queryable SQLite",
        "quote":"USDT",
        "is_all_time":False,"first_trade_not_proven":True,
        "no_synthetic_rows":True,"no_exchange_substitution":True,
        "trader_interface_modified":False,
        "rows":rows,
        "disclaimer":"No file is invented for unavailable months. Original partial data contain only real source timestamps; source gaps are explicitly retained."
    }
    (output/"manifest.json").write_text(json.dumps(summary,indent=2,sort_keys=True)+"\n",encoding="utf-8")
    need(names=={p.name for p in output.iterdir()},"Unexpected source data in Release")
    print("2020 QUARTER SOURCE STAGED "+json.dumps({k:summary[k] for k in
         ("quarter","source_verified_months","source_unavailable_months",
          "native_1m_candles","native_1m_missing")}),flush=True)
    return summary

def h(x):return hashlib.sha256(x).hexdigest()
def merge(manifest_folder,out):
    need(out.parent.exists(),"Output index directory not provisioned")
    basic=json.loads(SOURCE_ONE.read_text())
    need(basic.get("schema")=="seven.crypto.top5-original-earlier-source-vault.v1"
         and basic.get("source_months_verified")==16
         and basic.get("first_month")=="2021-01" and basic.get("last_month")=="2021-04",
         "Pinned Jan-Apr 2021 source index missing")
    collection=[]
    for q, months in QUARTERS.items():
        p=manifest_folder/f"quarter-{q}.json"
        raw=p.read_bytes();j=json.loads(raw)
        need(j["schema"]=="seven.crypto.top5-earlier-quarter-native-vault.v1"
             and j["quarter"]==q and j["first_month"]==months[0]
             and j["last_month"]==months[-1]
             and j["requested_source_months"]==12
             and j["source_verified_months"]+j["source_unavailable_months"]==12
             and j["no_synthetic_rows"] is True and len(j["rows"])==12,
             "Incorrect historical quarter report")
        for row in j["rows"]:
            need(row["quote"]=="USDT" and row["no_invented_bars"] is True
                 and row["asset_id"] in ASSETS and row["month"] in months,
                 "Wrong exchange pair or season")
        collection.append((q,raw,j))
    total_requested=16+sum(x[2]["requested_source_months"] for x in collection)
    total_verified=basic["source_months_verified"]+sum(x[2]["source_verified_months"] for x in collection)
    native=basic["verified_original_candles"]+sum(x[2]["native_1m_candles"] for x in collection)
    gaps=basic["missing_native_minutes_in_verified_months"]+sum(x[2]["native_1m_missing"] for x in collection)
    result={
        "schema":"seven.crypto.top5-earlier-native-history-roadmap.v1",
        "source":"Original Binance Spot 1m OHLCV, official source ZIP+CHECKSUM, queryable SQLite in immutable Releases",
        "quote":"USDT","assets":list(ASSETS),
        "covered_source_month_span":"2020-01 to 2021-04 (not coin inception)",
        "source_months_scanned":total_requested,
        "source_months_verified":total_verified,
        "source_months_unavailable":total_requested-total_verified,
        "original_native_1m_archived":native,"native_source_gaps_minutes":gaps,
        "no_interpolated_candles":True,"all_time_history_not_proven":True,
        "other_stored_2021_noncomplete_months_in_separate_vault":True,
        "jan_apr_2021":{
            "index_path":"top5_earlier_source_vault/index.json",
            "release_page":basic["release_page"],
            "stored_original_candles":basic["verified_original_candles"],
            "source_months_verified":basic["source_months_verified"]},
        "quarters_2020":[{
            "quarter":q,
            "index_path":f"top5_earlier_source_vault/batches/quarter-{q}.json",
            "manifest_sha256":h(raw),
            "release_page":doc["release_page"],
            "source_months_verified":doc["source_verified_months"],
            "source_months_unavailable":doc["source_unavailable_months"],
            "native_1m_candles":doc["native_1m_candles"],
            "missing_native_minutes":doc["native_1m_missing"]}
            for q,raw,doc in collection]}
    out.write_text(json.dumps(result,indent=2,sort_keys=True)+"\n",encoding="utf-8")
    print("2020+2021 HISTORICAL SOURCE ROADMAP "+json.dumps({k:result[k] for k in
         ("source_months_scanned","source_months_verified","source_months_unavailable",
          "original_native_1m_archived","native_source_gaps_minutes")}),flush=True)
    return result

def main():
    p=argparse.ArgumentParser()
    group=p.add_mutually_exclusive_group(required=True)
    group.add_argument("--quarter",choices=QUARTERS.keys())
    group.add_argument("--merge",type=Path)
    group.add_argument("--self-test",action="store_true")
    p.add_argument("--output",type=Path,required=False)
    a=p.parse_args()
    if a.self_test:
        early.self_test()
        need(len(QUARTERS)==4 and len({m for ms in QUARTERS.values() for m in ms})==12,
             "Invalid 2020 partition")
        print("PASS: source-pinned four original 2020 quarters")
        return
    need(a.output is not None,"Output required")
    if a.quarter is not None:
        need(os.environ.get("GITHUB_ACTIONS")=="true"
             and os.environ.get("GITHUB_REPOSITORY")==REPO,"Only authorized GitHub Actions")
        stage(a.quarter,a.output)
    else:
        merge(a.merge,a.output)
if __name__=="__main__":main()
