#!/usr/bin/env python3
"""Offline verification of August, September, October 2026 OKX BTC/ETH
minute-spread and event-held interval persistence on six SHA-pinned proofs.

Independently checks published 4,320 paired UTC minute rows, 8,640 source
minute states, thresholds, time conservation, and three-day pooled statistics.
This reuses the source proof outputs; it does NOT download or replay millions
of raw L2 events independently. Research only, no account or trades.
"""
from __future__ import annotations
import argparse
import csv
from datetime import datetime
import hashlib
import json
import math
from pathlib import Path
import statistics

ROOT=Path("coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles")
DATES=("2026-08-15","2026-09-15","2026-10-15")
SYMS=("BTC","ETH")
THRESHOLDS=("0.1","0.5","1.0","2.0")
SRC_SHA={
 "2026-08-15|BTC":"ba18e34c39292e0f7a00d6224107321845a143b3",
 "2026-08-15|ETH":"c3e0cbc1a63a80d0b34a3da6f00a642bc96265cf",
 "2026-09-15|BTC":"331cc91e748dcdefb4d8c95a2843ac5b1b17528f",
 "2026-09-15|ETH":"9752fe05062f43e88ddcda34c215eba680f424af",
 "2026-10-15|BTC":"ce90a9d8e84bb257eafe994d1d31a4ffae51f0b9",
 "2026-10-15|ETH":"589778261ecd2ce419c6df2f0fba3e44e195439d",
}
SUMMARY=ROOT/"SEVEN_HEAVEN_OKX_BTC_ETH_THREE_DAYS_ONE_MINUTE_EVENT_TIME_PERSISTENCE_COMPARATIVE_PROOFS_2026_11_12.json"
SUMMARY_SHA="3790a41c05be23ec001f799cd5e48e3ce28720ec"
MINUTES=ROOT/"SEVEN_HEAVEN_OKX_BTC_ETH_THREE_DAYS_PAIRED_MINUTE_SPREADS_4320_ROWS_2026_11_12.csv"
MINUTES_SHA="0c06f32548ff6fa240a8b7040d8f9c0dc23da05c"
OUT=ROOT/"okx_l2_three_days_eventtime_persistence_independent_2026_11_12_evidence"

def gitblob(raw):
    return hashlib.sha1(b"blob "+str(len(raw)).encode()+b"\0"+raw).hexdigest()

def pinned(root,path,sha):
    raw=(root/path).read_bytes()
    if gitblob(raw)!=sha:
        raise ValueError("Immutable source Git blob does not match "+str(path))
    return raw

def close(a,b,label,tol=2e-7):
    x,y=float(a),float(b)
    if not math.isfinite(x) or not math.isfinite(y) or abs(x-y)>tol:
        raise ValueError(f"{label} differs: {a!r} vs {b!r}")

def percentile(data,p):
    x=sorted(data)
    h=(len(x)-1)*p
    k=int(h)
    return x[k]*(1-(h-k))+x[min(len(x)-1,k+1)]*(h-k)

def ms(iso):
    return round(datetime.fromisoformat(iso).timestamp()*1000)

def verify(repo):
    derived=json.loads(pinned(repo,SUMMARY,SUMMARY_SHA))
    rows=list(csv.DictReader(pinned(repo,MINUTES,MINUTES_SHA).decode("utf8").splitlines()))
    if derived["status"]!="SIX_PINNED_FULL_ARCHIVES_8640_MINUTE_STATES_AND_EVENT_TIME_PERSISTENCE":
        raise ValueError("Published status is not successfully completed")
    if derived["dates_utc"]!=list(DATES) or derived["instruments"]!=["BTC-USDC","ETH-USDC"]:
        raise ValueError("Published dates and instruments are not pre-registered")
    if len(rows)!=4320 or derived["counts"]["minute_states"]!=8640:
        raise ValueError("Missing expected 3*1440 paired minute rows")
    if not derived["read_only"] or derived["orders_enabled"]:
        raise ValueError("A read-only study was modified into a trading workflow")
    sources={}
    for day in DATES:
        for sym in SYMS:
            k=day+"|"+sym
            published=derived["source_proofs"][k]
            if published["git_blob_sha1"]!=SRC_SHA[k]:
                raise ValueError("Published source pin differs from preregistered pin "+k)
            path=Path(published["path"])
            expected=(
                ROOT/"okx_l2_btc_eth_2026_10_15_minute_spread_persistence_evidence"/
                (sym.lower()+"_usdc")/"SEVEN_HEAVEN_OKX_L2_ONE_MINUTE_PERSISTENCE_SOURCE_PROOFS.json"
                if day=="2026-10-15"
                else
                ROOT/"okx_l2_aug_sep_one_minute_event_time_spread_persistence_2026_11_12_evidence"/day/
                (sym.lower()+"_usdc")/"SEVEN_HEAVEN_OKX_L2_ONE_MINUTE_PERSISTENCE_SOURCE_PROOFS.json"
            )
            if path!=expected:
                raise ValueError("Published source path points to wrong date or pair "+k)
            doc=json.loads(pinned(repo,path,SRC_SHA[k]))
            if (doc["status"]!="full_archive_replayed_one_minute_with_event_time_persistence"
                or not doc["read_only"] or doc["orders_enabled"]
                or doc["day_utc"]!=day or doc["pair"]!=sym+"-USDC"):
                raise ValueError("Invalid per-archive status or identity "+k)
            full=doc["result"];market=full["market"];event=market["event_time_persistence"]
            if (not full["gzip_read_to_eof_crc_checked"]
                or len(full["archive_sha256"])!=64 or len(full["member_sha256"])!=64
                or market["global_logical_continuity_proven"]
                or not market["first_20_event_hashes_match_prior_proof"]):
                raise ValueError("Archive SHA/CRC or sequence-quality claims invalid "+k)
            if full["archive_sha256"]!=published["archive_sha256"]:
                raise ValueError("Archived whole-file SHA differs "+k)
            if (len(market["minute_states"])!=1440
                or len(market["anchors"])!=96 or market["snapshots"]!=96
                or len(market["snapshot_events"])!=96
                or len(doc["reference_quarter_checks"])!=96
                or not all(c["verified"] for c in doc["reference_quarter_checks"])):
                raise ValueError("Missing source data or historical 96-point parity "+k)
            if not 0<event["covered_ms"]<=86400000 or event["covered_ms"]!=market["last_ts_ms"]-market["first_ts_ms"]:
                raise ValueError("Source coverage duration not conserved "+k)
            if event["covered_ms"]!=published["covered_ms"] or market["total_events"]!=published["events"]:
                raise ValueError("Published source events/coverage changed "+k)
            states=market["minute_states"]
            for index,minute in enumerate(states):
                hh,mm=divmod(index,60)
                if minute["anchor_utc"]!=f"{day}T{hh:02}:{mm:02}:00+00:00":
                    raise ValueError("Minute UTC anchor missing/moved "+k)
                if not 0<=minute["offset_ms_after_anchor"]<=60000:
                    raise ValueError("Minute observation outside pre-registered tolerance "+k)
                if index%15==0:
                    old=market["anchors"][index//15]
                    for field in ("anchor_utc","sample_utc","best_bid","best_ask","spread_bps","offset_ms_after_anchor"):
                        if minute[field]!=old[field]:
                            raise ValueError("Old 96 source states differ from sampled minute "+k+field)
                    if minute["source_event_number"]!=old["after_event_number"]:
                        raise ValueError("Original event number differs "+k)
            values=[x["spread_bps"] for x in states]
            stat=derived["per_day"][day][sym]
            for field,value in (
                ("minute_spread_mean_bp",statistics.mean(values)),
                ("minute_spread_median_bp",statistics.median(values)),
                ("minute_spread_p90_bp",percentile(values,.9)),
                ("minute_spread_max_bp",max(values)),
                ("event_time_spread_weighted_mean_bp",event["time_weighted_spread_bp"]),
            ):
                close(stat[field],value,k+" "+field)
            if stat["event_time_covered_ms"]!=event["covered_ms"]:
                raise ValueError("Daily time coverage modified "+k)
            for threshold in THRESHOLDS:
                raw=event["thresholds_bp"][threshold]
                pub=stat["thresholds_bp"][threshold]
                count=sum(x>float(threshold) for x in values)
                if raw["sum_duration_ms"]!=raw["above_threshold_ms"] or not 0<=raw["above_threshold_ms"]<=event["covered_ms"]:
                    raise ValueError("Sum of contiguous episodes differs from event time "+k)
                if raw["above_threshold_ms"]!=pub["integrated_time_ms_above"]:
                    raise ValueError("Published time spent beyond threshold changed "+k)
                if pub["minute_count_above"]!=count:
                    raise ValueError("Published minute threshold frequency changed "+k)
                close(pub["minute_fraction_above"],count/1440,k+" "+threshold+" minute fraction",1e-12)
                close(pub["integrated_time_fraction_above"],
                      raw["above_threshold_ms"]/event["covered_ms"],
                      k+" "+threshold+" event time fraction",1e-12)
                if not raw["count"]>=raw["ge_1s"]>=raw["ge_10s"]>=raw["ge_60s"]:
                    raise ValueError("Nonmonotonic episode length classes "+k)
                for x,y in (
                    ("count","positive_duration_episodes"),
                    ("ge_1s","episodes_ge_1s"),
                    ("ge_10s","episodes_ge_10s"),
                    ("ge_60s","episodes_ge_60s"),
                    ("max_duration_ms","longest_continuous_episode_ms"),
                    ("right_censored_at_final_event","right_censored_at_last_event"),
                ):
                    if raw[x]!=pub[y]:
                        raise ValueError("Published episode metric differs "+k+" "+x)
                longest=raw["longest_20"]
                if longest:
                    if len(longest)>20 or raw["max_duration_ms"]!=longest[0]["duration_ms"]:
                        raise ValueError("Long episode list inconsistent "+k)
                    if pub["longest_episode_details"]!=longest[0]:
                        raise ValueError("Published episode timestamp changed "+k)
                    for item in longest:
                        if ms(item["end_utc"])-ms(item["start_utc"])!=item["duration_ms"]:
                            raise ValueError("Episode timestamps not compatible with duration "+k)
            sources[k]=doc

    dominance={"eth_greater":0,"btc_greater":0,"equal":0}
    if len(set((v["date_utc"],v["hour_minute_utc"]) for v in rows))!=4320:
        raise ValueError("Duplicate minute rows")
    for j,row in enumerate(rows):
        day=DATES[j//1440]
        index=j%1440
        a=sources[day+"|BTC"]["result"]["market"]["minute_states"][index]
        b=sources[day+"|ETH"]["result"]["market"]["minute_states"][index]
        if row["date_utc"]!=day or a["anchor_utc"]!=b["anchor_utc"] or row["hour_minute_utc"]!=a["anchor_utc"][11:16]:
            raise ValueError("Combined comparison incorrectly aligns date or minute")
        for sym,item in (("btc",a),("eth",b)):
            close(row[sym+"_spread_bp"],item["spread_bps"],"paired minute source spread",1e-8)
            if row[sym+"_actual_utc"]!=item["sample_utc"] or int(row[sym+"_delay_ms"])!=item["offset_ms_after_anchor"]:
                raise ValueError("Paired source timestamp/delay differs")
        close(row["eth_minus_btc_bp"],b["spread_bps"]-a["spread_bps"],"paired delta spread",1e-7)
        d=b["spread_bps"]-a["spread_bps"]
        dominance["eth_greater" if d>0 else "btc_greater" if d<0 else "equal"]+=1
    if dominance!=derived["counts"]["paired_spread_competition"]:
        raise ValueError("Cross-market minute dominance differs")
    for sym in SYMS:
        vals=[v["spread_bps"] for day in DATES for v in sources[day+"|"+sym]["result"]["market"]["minute_states"]]
        pooled=derived["pooled_three_separate_days_descriptive_only"][sym]
        close(statistics.mean(vals),pooled["spread_minute_mean_bp"],"three-day minute mean "+sym)
        close(statistics.median(vals),pooled["spread_minute_median_bp"],"three-day median "+sym)
        close(percentile(vals,.9),pooled["spread_minute_p90_bp"],"three-day p90 "+sym)
        all_covered=sum(sources[d+"|"+sym]["result"]["market"]["event_time_persistence"]["covered_ms"] for d in DATES)
        total_weight=sum(sources[d+"|"+sym]["result"]["market"]["event_time_persistence"]["time_weighted_spread_bp"]*
                         sources[d+"|"+sym]["result"]["market"]["event_time_persistence"]["covered_ms"] for d in DATES)
        if pooled["event_time_covered_ms"]!=all_covered:
            raise ValueError("Time coverage across 3 independent days changed "+sym)
        close(total_weight/all_covered,pooled["event_time_weighted_spread_mean_bp"],"pooled time-weighted spread "+sym)
        for th in THRESHOLDS:
            total=sum(sources[d+"|"+sym]["result"]["market"]["event_time_persistence"]["thresholds_bp"][th]["above_threshold_ms"] for d in DATES)
            p=pooled["thresholds_bp"][th]
            if total!=p["above_ms_sum_three_distinct_days"]:
                raise ValueError("Total above-threshold time differs "+sym+th)
            close(total/all_covered,p["above_fraction_of_three_observed_day_coverage"],
                  "pooled threshold time fraction "+sym+th,1e-12)
            if p["minute_above_count"]!=sum(v>float(th) for v in vals):
                raise ValueError("Pooled minute count differs "+sym+th)

    if sum(sources[k]["result"]["market"]["total_events"] for k in sources)!=9628137:
        raise ValueError("Archived source event count not expected")
    return {
        "schema":"seven-heaven.okx-three-calendar-day-minute-persistence-offline-audit.v1",
        "status":"SIX_PINNED_L2_SOURCES_8640_MINUTES_4320_PAIRED_AND_FOUR_EVENT_TIME_THRESHOLDS_VALIDATED",
        "read_only":True,"orders_enabled":False,
        "verified_source_git_blobs_sha1":SRC_SHA,
        "verified_aggregate_git_blob_sha1":SUMMARY_SHA,
        "verified_paired_csv_git_blob_sha1":MINUTES_SHA,
        "total_archives":6,"total_original_source_events":9628137,
        "minute_states_verified":8640,"paired_minute_rows_verified":4320,
        "quarter_hour_reference_matches_per_archive":96,
        "four_threshold_time_conservation_validated_for_all_six":True,
        "minute_spread_dominance":dominance,
        "upstream_L2_sequence_continuity_proven":False,
        "independence_limit":"Recomputed the archived minute outputs and event-time aggregates independently "
            "from six immutable GitHub JSON source proofs; did NOT re-download or independently "
            "decode every raw OKX NDJSON event a second time.",
        "representativity_limit":"Three isolated historical calendar days are not a statistical market sample."
    }

def selftest():
    assert gitblob(b"hello")=="b6fc4c620b67d95f953a5c1c1230aaab5db5a1b0"
    close(percentile([1,2,3,4,5],.9),4.6,"type-7 percentile")
    assert ms("2026-10-15T12:00:01.250+00:00")-ms("2026-10-15T12:00:00.000+00:00")==1250
    try:close(1,2,"negative")
    except ValueError:pass
    else:raise AssertionError("Numeric mismatch not detected")
    print("PASS: immutable blob checks, interpolated percentiles, timestamp precision, mismatches")

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--repo-root",type=Path,default=Path("."))
    parser.add_argument("--selftest",action="store_true")
    args=parser.parse_args()
    if args.selftest:
        selftest();return
    result=verify(args.repo_root)
    path=args.repo_root/OUT
    path.mkdir(parents=True,exist_ok=True)
    (path/"SEVEN_HEAVEN_OKX_THREE_DAYS_ONE_MINUTE_EVENTTIME_INDEPENDENT_RECALC_PROOFS.json").write_text(
        json.dumps(result,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    print(json.dumps({"status":result["status"],
        "events":result["total_original_source_events"],
        "paired_minutes":result["paired_minute_rows_verified"],
        "minute_states":result["minute_states_verified"]},indent=2))

if __name__=="__main__":
    main()
