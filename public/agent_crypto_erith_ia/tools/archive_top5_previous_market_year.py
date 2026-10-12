#!/usr/bin/env python3
"""Source-authenticated Binance Spot 2018 backward continuation for ETH BNB XRP.
SOLUSDT is treated separately; a missing 2018 source is NOT no global SOL price.
Reuses the already tested original ZIP/SQLite quarter collector and guards.
"""
from __future__ import annotations
import argparse
import json
import hashlib
from pathlib import Path
import archive_top5_historical_quarters as source
import archive_top5_first_market_year as strict

ROOT=Path(__file__).resolve().parents[1]/"data/historical_archive_prototype"
OLD=ROOT/"top5_earlier_source_vault/history_index.json"
ASSETS=("ethereum","binancecoin","ripple","solana")
QUARTERS={
 "q1":("2018-01","2018-02","2018-03"),
 "q2":("2018-04","2018-05","2018-06"),
 "q3":("2018-07","2018-08","2018-09"),
 "q4":("2018-10","2018-11","2018-12")}
def need(x,why):
    if not x: raise ValueError(why)
def prepare():
    source.QUARTERS=QUARTERS
    source.ASSETS=ASSETS
def stage(quarter,out):
    need(quarter in QUARTERS,"Invalid 2018 quarter")
    # Source ZIPs with unusable source timestamps become explicit quarantined
    # records, NOT proof of a trade outage and NOT synthetic candle repairs.
    strict.QUARTERS=QUARTERS
    doc=strict.stage(quarter,out)
    doc["schema"]="seven.crypto.top5-earlier-quarter-native-vault.v1"
    doc["quarantined_source_months"]=sum(
        r["status"]=="invalid_source_needs_review" for r in doc["rows"])
    (out/"manifest.json").write_text(json.dumps(doc,indent=2,sort_keys=True)+"\n")
    return doc
def merge(folder,out):
    earlier=json.loads(OLD.read_text(encoding="utf-8"))
    need(earlier["schema"]=="seven.crypto.top5-earlier-native-history-roadmap.v2"
         and earlier["source_months_scanned"]==112
         and earlier["source_months_verified"]==93
         and earlier["covered_source_month_span"]=="2019-01 to 2021-04 (not coin inception)",
         "Earlier original-source starting index drift")
    need(earlier["source_gap_interpretation"]["proven_pre_pair_launch_absences_1m"]==14760,
         "Proven SOLUSDT listing must remain qualified")
    quarter_rows=[]
    for q,months in QUARTERS.items():
        file=folder/f"quarter-{q}.json"
        raw=file.read_bytes(); x=json.loads(raw)
        need(x["schema"]=="seven.crypto.top5-earlier-quarter-native-vault.v1"
             and x["quarter"]==q and x["first_month"]==months[0]
             and x["last_month"]==months[-1] and x["requested_source_months"]==12
             and x["source_verified_months"]+x["source_unavailable_months"]==12
             and x["no_synthetic_rows"] is True and len(x["rows"])==12,
             "2018 original quarter malformed")
        need(all(r["asset_id"] in ASSETS and r["month"] in months
                 and r["quote"]=="USDT" for r in x["rows"]),
             "2018 exchange/quote identity mismatch")
        quarter_rows.append((q,raw,x))
    added_native=sum(x["native_1m_candles"] for _,_,x in quarter_rows)
    added_gaps=sum(x["native_1m_missing"] for _,_,x in quarter_rows)
    added_verified=sum(x["source_verified_months"] for _,_,x in quarter_rows)
    result={
        **earlier,
        "schema":"seven.crypto.top5-earlier-native-history-roadmap.v3",
        "covered_source_month_span":"2018-01 to 2021-04 (not coin inception)",
        "source_months_scanned":earlier["source_months_scanned"]+48,
        "source_months_verified":earlier["source_months_verified"]+added_verified,
        "source_months_unavailable":earlier["source_months_unavailable"]+48-added_verified,
        "original_native_1m_archived":earlier["original_native_1m_archived"]+added_native,
        "native_source_gaps_minutes":earlier["native_source_gaps_minutes"]+added_gaps,
        "previous_2020_2021_archive_counts_preserved":True,
        "quarters_2018":[{
            "quarter":q,
            "index_path":f"top5_earlier_source_vault/batches/quarter-2018-{q}.json",
            "source_manifest_sha256":hashlib.sha256(raw).hexdigest(),
            "release_page":doc["release_page"],
            "source_months_verified":doc["source_verified_months"],
            "source_months_unavailable":doc["source_unavailable_months"],
            "native_1m_candles":doc["native_1m_candles"],
            "missing_native_minutes":doc["native_1m_missing"]}
            for q,raw,doc in quarter_rows]
    }
    # Only verified pre-launch absence remains classified as such.
    # Other missing minutes are unclassified or previously classified downtime.
    result["spot_pair_first_listing_sources"]={
        "ETHUSDT":{"official_notice":"https://www.binance.com/en/support/announcement/detail/115001094331","market_start_utc":"2017-08-17T04:00:00Z"},
        "BNBUSDT":{"official_notice":"https://www.binance.com/pt-BR/support/announcement/detail/115002584432","announced_available_utc_date":"2017-11-06","exact_first_minute_not_proven":True},
        "XRPUSDT":{"official_notice":"https://www.binance.com/en-NZ/support/announcement/detail/360003376012","announced_available_utc_date":"2018-05-04","exact_first_minute_not_proven":True},
        "SOLUSDT":{"official_notice":"https://www.binance.com/es-LA/support/announcement/detail/cf77f566c9b64cc791fc152679175de8","market_start_utc":"2020-08-11T06:00:00Z"}
    }
    result["source_gap_interpretation"]={
        **earlier["source_gap_interpretation"],
        "original_calendar_missing_1m_in_verified_archives":result["native_source_gaps_minutes"],
        "unclassified_or_known_operational_1m_outside_this_pair_launch":
             result["native_source_gaps_minutes"]-14760,
        "classification_rechecked_against_2018_original_sources":True}
    need(result["original_native_1m_archived"]>earlier["original_native_1m_archived"],
         "No authenticated historical native candles acquired")
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(result,indent=2,sort_keys=True)+"\n",encoding="utf-8")
    print("2018 HISTORIC BACKFILL MERGED "+json.dumps({
        "new_source_months":added_verified,"new_native_candles":added_native,
        "new_missing_original_minutes":added_gaps,
        "total_source_months":result["source_months_verified"],
        "total_native_candles":result["original_native_1m_archived"]},sort_keys=True),flush=True)
    return result
if __name__=="__main__":
    cli=argparse.ArgumentParser()
    mode=cli.add_mutually_exclusive_group(required=True)
    mode.add_argument("--quarter",choices=QUARTERS)
    mode.add_argument("--merge",type=Path)
    mode.add_argument("--self-test",action="store_true")
    cli.add_argument("--output",type=Path)
    opt=cli.parse_args()
    if opt.self_test:
        source.early.self_test()
        need(len({m for s in QUARTERS.values() for m in s})==12,"2018 quarters overlap")
        need(all(m<"2020-01" for s in QUARTERS.values() for m in s),"Wrong historic year")
        print("PASS: source-locked native 2018 independent UTC quarter partitions")
    elif opt.quarter:
        need(opt.output is not None,"Output required")
        stage(opt.quarter,opt.output)
    else:
        need(opt.output is not None,"Output required")
        merge(opt.merge,opt.output)
