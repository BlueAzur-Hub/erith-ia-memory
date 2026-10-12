#!/usr/bin/env python3
"""Authentic Binance Spot 2017 first-year source verification (Jul-Dec).
Original Binance Spot native 1m ZIP, CHECKSUM and SQLite, zero interpolation.
A pre-listing source file is NOT a broken historical market.
"""
from __future__ import annotations
import argparse
from concurrent.futures import ThreadPoolExecutor,as_completed
import hashlib
import json
import os
from pathlib import Path
import archive_top5_historical_quarters as source

ROOT=Path(__file__).resolve().parents[1]/"data/historical_archive_prototype"
OLD=ROOT/"top5_earlier_source_vault/history_index.json"
REPO="BlueAzur-Hub/erith-ia-memory"
ASSETS=("ethereum","binancecoin","ripple","solana")
QUARTERS={
    "q3":("2017-07","2017-08","2017-09"),
    "q4":("2017-10","2017-11","2017-12"),
}
LISTINGS={
    "ethereum":{"pair":"ETHUSDT","first_trading_utc":"2017-08-17T04:00:00Z",
                "official_notice":"https://www.binance.com/en/support/announcement/detail/115001094331"},
    "binancecoin":{"pair":"BNBUSDT","available_announced_utc_date":"2017-11-06",
                   "first_exact_minute_unknown":True,
                   "official_notice":"https://www.binance.com/pt-BR/support/announcement/detail/115002584432"},
    "ripple":{"pair":"XRPUSDT","available_announced_utc_date":"2018-05-04",
              "first_exact_minute_unknown":True,
              "official_notice":"https://www.binance.com/en-NZ/support/announcement/detail/360003376012"},
    "solana":{"pair":"SOLUSDT","first_trading_utc":"2020-08-11T06:00:00Z",
              "official_notice":"https://www.binance.com/es-LA/support/announcement/detail/cf77f566c9b64cc791fc152679175de8"}
}
def need(x,msg):
    if not x:raise ValueError(msg)
def release_tag(q):
    v=QUARTERS[q]
    return f"crypto-top5-binance-original-{v[0]}_{v[-1]}"
def stage(q,out,workers=3):
    need(q in QUARTERS and 1<=workers<=3 and not out.exists(),
         "Invalid bounded first-year quarter or path")
    lock=source.early.registry()
    tag=release_tag(q)
    source.early.RELEASE=f"https://github.com/{REPO}/releases/download/{tag}/"
    out.mkdir(parents=True)
    rows=[]
    with ThreadPoolExecutor(max_workers=workers) as pool:
        tasks={pool.submit(source.early.save_one,asset,month,out):(asset,month)
               for asset in ASSETS for month in QUARTERS[q]}
        for future in as_completed(tasks):
            cid,month=tasks[future]
            try:
                val=future.result()
            except (ValueError,OSError,OverflowError,UnicodeError) as exc:
                # Keep this exact original month visible as invalid, never as
                # "no trades" or a verified missing source. Do not publish it.
                pair=source.early.audit.TARGETS[cid][0]
                zipname=f"{pair}-1m-{month}.zip"
                for suffix in (".zip",".zip.CHECKSUM",".sqlite"):
                    candidate=out/(f"{pair}-1m-{month}"+suffix)
                    if candidate.exists(): candidate.unlink()
                val={"asset_id":cid,"month":month,"market_pair":pair,
                     "quote":"USDT","no_invented_bars":True,
                     "source_url":source.early.audit.source_urls(pair,month)[0],
                     "status":"invalid_source_needs_review",
                     "source_validation_error_type":type(exc).__name__,
                     "source_validation_error":str(exc)[:180],
                     "verified_native_rows":0}
            need((val["asset_id"],val["month"])==tasks[future],
                 "Wrong native Spot asset/month owner")
            # Do not claim all pre-start 1m records were trading suspensions.
            notice=LISTINGS[val["asset_id"]]
            begin=notice.get("first_trading_utc",notice.get("available_announced_utc_date"))
            val["known_official_pair_listing"]=notice
            val["calendar_month_before_announced_pair_listing"]=val["month"]<begin[:7]
            rows.append(val)
            print("BINANCE FIRST-YEAR NATIVE SOURCE "+json.dumps({
                "asset":val["asset_id"],"month":val["month"],
                "status":val["status"],"rows":val["verified_native_rows"],
                "before_pair_listing":val["calendar_month_before_announced_pair_listing"]
            },sort_keys=True),flush=True)
    rows.sort(key=lambda r:(r["asset_id"],r["month"]))
    good=[r for r in rows if r["status"] in ("complete_native_1m","partial_or_close_time_anomaly")]
    need(len(rows)==12 and len({(r["asset_id"],r["month"]) for r in rows})==12,
         "2017 month grid incomplete")
    need(len(good)>=1,
         "No original Binance 2017 Spot data could be authenticated")
    # Official first listing dates are constraints, not permission to invent
    # pre-start trading; an unexpectedly early native source needs review.
    need(not any(r["calendar_month_before_announced_pair_listing"] and
                 r["status"] in ("complete_native_1m","partial_or_close_time_anomaly")
                 for r in good),"Native source contradicts official pair launch date")
    files={"manifest.json"}|{r[k]["name"] for r in good
                            for k in ("original_source","official_checksum","sqlite")}
    need({p.name for p in out.iterdir()}|{"manifest.json"}==files,
         "Staging includes unexpected native source files")
    j={
        "schema":"seven.crypto.top5-first-year-binance-source-vault.v1",
        "quarter":q,"first_month":QUARTERS[q][0],"last_month":QUARTERS[q][-1],
        "release_tag":tag,"release_page":f"https://github.com/{REPO}/releases/tag/{tag}",
        "source":"Original Binance Spot 1m ZIP with official CHECKSUM + authentic SQLite OHLCV",
        "identity_index_sha256":lock,"quote":"USDT","assets":list(ASSETS),
        "official_spot_pair_launches":LISTINGS,
        "requested_source_months":12,"source_verified_months":len(good),
        "source_unavailable_months":12-len(good),
        "native_1m_candles":sum(r["verified_native_rows"] for r in good),
        "native_1m_missing":sum(r["missing_native_minutes"] for r in good),
        "fully_complete_source_months":sum(r["status"]=="complete_native_1m" for r in good),
        "original_close_time_anomalies":sum(r["source_close_time_anomalies"] for r in good),
        "pre_listing_unavailable_source_months":sum(
            r["calendar_month_before_announced_pair_listing"]
            and r["status"] not in ("complete_native_1m","partial_or_close_time_anomaly")
            for r in rows),
        "no_synthetic_rows":True,"first_trade_not_inferred_from_file":True,
        "no_cross_quote_conversion":True,"trader_interface_modified":False,
        "rows":rows,
        "notes":"Before the official listing, absent USDT rows are not an exchange outage. Date-only first pair listings do not establish exact start minutes."}
    (out/"manifest.json").write_text(json.dumps(j,indent=2,sort_keys=True)+"\n")
    need({p.name for p in out.iterdir()}==files,"2017 archive file inventory mismatch")
    print("2017 FIRST-YEAR ORIGINAL SOURCE STAGED "+json.dumps({
        k:j[k] for k in ("quarter","source_verified_months","source_unavailable_months",
                         "native_1m_candles","native_1m_missing",
                         "pre_listing_unavailable_source_months")},sort_keys=True),flush=True)
    return j
def merge(folder,out):
    old=json.loads(OLD.read_text())
    need(old["schema"]=="seven.crypto.top5-earlier-native-history-roadmap.v3"
         and old["source_months_scanned"]==160
         and old["source_months_verified"]>=110
         and old["covered_source_month_span"]=="2018-01 to 2021-04 (not coin inception)"
         and len(old.get("quarters_2018",[]))==4,
         "2018 historical baseline not yet fully certified")
    original=[]
    for q,months in QUARTERS.items():
        f=folder/f"quarter-{q}.json";raw=f.read_bytes()
        z=json.loads(raw)
        need(z["schema"]=="seven.crypto.top5-first-year-binance-source-vault.v1"
             and z["quarter"]==q and z["first_month"]==months[0]
             and z["last_month"]==months[-1] and z["requested_source_months"]==12
             and z["source_verified_months"]+z["source_unavailable_months"]==12
             and len(z["rows"])==12 and z["no_synthetic_rows"] is True,
             "Invalid original 2017 source quarter")
        for record in z["rows"]:
            need(record["asset_id"] in ASSETS and record["month"] in months
                 and record["quote"]=="USDT" and record["no_invented_bars"] is True,
                 "Corrupt original first-year source")
        original.append((q,raw,z))
    total_native=sum(x["native_1m_candles"] for _,_,x in original)
    verified=sum(x["source_verified_months"] for _,_,x in original)
    missing=sum(x["native_1m_missing"] for _,_,x in original)
    need(verified>=1 and total_native>0,"No verifiable original native data")
    doc={
        **old,
        "schema":"seven.crypto.top5-earlier-native-history-roadmap.v4",
        "covered_source_month_span":"2017-07 to 2021-04 (not coin inception)",
        "source_months_scanned":old["source_months_scanned"]+24,
        "source_months_verified":old["source_months_verified"]+verified,
        "source_months_unavailable":old["source_months_unavailable"]+24-verified,
        "original_native_1m_archived":old["original_native_1m_archived"]+total_native,
        "native_source_gaps_minutes":old["native_source_gaps_minutes"]+missing,
        "spot_pair_first_listing_sources":LISTINGS,
        "quarters_2017":[{
            "quarter":q,"index_path":f"top5_earlier_source_vault/batches/quarter-2017-{q}.json",
            "source_manifest_sha256":hashlib.sha256(raw).hexdigest(),
            "release_page":x["release_page"],
            "source_months_verified":x["source_verified_months"],
            "source_months_unavailable":x["source_unavailable_months"],
            "native_1m_candles":x["native_1m_candles"],
            "missing_native_minutes":x["native_1m_missing"]}
            for q,raw,x in original]
    }
    doc["source_gap_interpretation"]={
        **old["source_gap_interpretation"],
        "original_calendar_missing_1m_in_verified_archives":doc["native_source_gaps_minutes"],
        "unclassified_or_known_operational_1m_outside_this_pair_launch":
            doc["native_source_gaps_minutes"]-14760,
        "before_first_binance_usdt_pair_no_data_created":True
    }
    need(doc["source_months_verified"]+doc["source_months_unavailable"]==
         doc["source_months_scanned"],"Inconsistent year history")
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(doc,indent=2,sort_keys=True)+"\n")
    print("2017-2021 ORIGINAL HISTORY "+json.dumps({
        "new_candles":total_native,"new_source_months":verified,
        "total_candles":doc["original_native_1m_archived"],
        "total_source_months":doc["source_months_verified"]},sort_keys=True),flush=True)
    return doc
if __name__=="__main__":
    p=argparse.ArgumentParser()
    grp=p.add_mutually_exclusive_group(required=True)
    grp.add_argument("--quarter",choices=QUARTERS)
    grp.add_argument("--merge",type=Path)
    grp.add_argument("--self-test",action="store_true")
    p.add_argument("--output",type=Path)
    a=p.parse_args()
    if a.self_test:
        source.early.self_test()
        need(len(QUARTERS)==2 and len({m for ms in QUARTERS.values() for m in ms})==6,
             "Incorrect first-year months")
        need(LISTINGS["ethereum"]["first_trading_utc"]=="2017-08-17T04:00:00Z",
             "Original ETHUSDT listing proof drift")
        print("PASS: official Binance first-year pair date guards")
    elif a.quarter:
        need(a.output is not None and os.environ.get("GITHUB_ACTIONS")=="true"
             and os.environ.get("GITHUB_REPOSITORY")==REPO,
             "Only authorized first-year source staging")
        stage(a.quarter,a.output)
    else:
        need(a.output is not None,"History index destination required")
        merge(a.merge,a.output)
