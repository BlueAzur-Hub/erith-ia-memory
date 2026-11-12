#!/usr/bin/env python3
"""Independent offline audit of pinned BTC/ETH 1-minute spread and durations.

This checks released per-event-stream aggregates, calendar-minute source records,
threshold fraction/duration conservation and original quarter-hour references.
It does NOT independently recover every original market event from the CDN:
event-time episodes remain derived from the original archival streaming program.
No network access, account credentials, orders, or recurring monitoring.
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
SOURCE={
 "BTC":(ROOT/"okx_l2_btc_eth_2026_10_15_minute_spread_persistence_evidence/btc_usdc/SEVEN_HEAVEN_OKX_L2_ONE_MINUTE_PERSISTENCE_SOURCE_PROOFS.json",
        "ce90a9d8e84bb257eafe994d1d31a4ffae51f0b9"),
 "ETH":(ROOT/"okx_l2_btc_eth_2026_10_15_minute_spread_persistence_evidence/eth_usdc/SEVEN_HEAVEN_OKX_L2_ONE_MINUTE_PERSISTENCE_SOURCE_PROOFS.json",
        "589778261ecd2ce419c6df2f0fba3e44e195439d"),
 "AGGREGATE":(ROOT/"SEVEN_HEAVEN_OKX_BTC_ETH_ONE_MINUTE_SPREAD_PERSISTENCE_AGGREGATED_EVIDENCE_2026_11_12.json",
        "f2f27d004500454010fa9a5226d1cd97bf08702a"),
 "MINUTE_CSV":(ROOT/"SEVEN_HEAVEN_OKX_BTC_ETH_ONE_MINUTE_PAIRED_SPREADS_1440_ROWS_2026_11_12.csv",
        "ae4288015ba2276169079282e8133e6fda7bb674"),
}
EXPECTED_ARCHIVE_SHA={
 "BTC":"3b543b7333a6c71f4a8bf0ddf4e058fa84f61ad58092b3250784acc0964c7b44",
 "ETH":"048d039eed1d6a18c166f022e8fe02359308445be682d1405df09b61fbc03546"
}
THRESHOLDS=("0.1","0.5","1.0","2.0")
OUT=ROOT/"okx_l2_one_minute_event_time_independent_validation_2026_11_12_evidence"


def git_blob(raw):
    return hashlib.sha1(b"blob "+str(len(raw)).encode()+b"\0"+raw).hexdigest()


def load(repo,key):
    path,expected=SOURCE[key]
    raw=(repo/path).read_bytes()
    if git_blob(raw)!=expected:
        raise ValueError("Unpinned/changed Git blob "+str(path))
    if key=="MINUTE_CSV":
        return list(csv.DictReader(raw.decode("utf8").splitlines()))
    return json.loads(raw)


def equal_num(a,b,where,tol=0.00000002):
    x,y=float(a),float(b)
    if not math.isfinite(x) or not math.isfinite(y) or abs(x-y)>tol:
        raise ValueError(f"Mismatch {where}: {a} vs {b}")


def percentile(values,q):
    nums=sorted(values)
    k=(len(nums)-1)*q
    i=int(k)
    return nums[i]*(1-(k-i))+nums[min(i+1,len(nums)-1)]*(k-i)


def iso_ms(value):
    return round(datetime.fromisoformat(value).timestamp()*1000)


def verify(repo):
    source={name:load(repo,name) for name in ("BTC","ETH")}
    published=load(repo,"AGGREGATE")
    csvrows=load(repo,"MINUTE_CSV")
    if published["status"]!="TWO_PINNED_FULL_ARCHIVES_2880_MINUTES_AND_EVENT_TIME_PERSISTENCE_COMPARED":
        raise ValueError("Aggregate not published successfully")
    if len(csvrows)!=1440 or published["paired_minutes"]!=1440:
        raise ValueError("Required 1440 paired calendar minutes absent")
    if not published["read_only"] or published["orders_enabled"]:
        raise ValueError("Not a read-only study")

    for sym in ("BTC","ETH"):
        s=source[sym]
        if s["status"]!="full_archive_replayed_one_minute_with_event_time_persistence":
            raise ValueError("Source not successfully decoded")
        if not s["read_only"] or s["orders_enabled"]:
            raise ValueError("Source unexpectedly trading-enabled")
        result=s["result"]
        m=result["market"]
        if result["archive_sha256"]!=EXPECTED_ARCHIVE_SHA[sym] or not result["gzip_read_to_eof_crc_checked"]:
            raise ValueError("Whole compressed source SHA / gzip CRC not verified")
        if len(result["member_sha256"])!=64:
            raise ValueError("Unpacked member digest not recorded")
        if (not m["first_20_event_hashes_match_prior_proof"]
           or m["global_logical_continuity_proven"]):
            raise ValueError("Incorrect first 20 hashes or logical sequence claim")
        if len(s["reference_quarter_checks"])!=96 or not all(x["verified"] for x in s["reference_quarter_checks"]):
            raise ValueError("Original 96 quarter-hour anchors not crosschecked")
        if len(m["anchors"])!=96 or len(m["snapshot_events"])!=96 or len(m["minute_states"])!=1440:
            raise ValueError("Original 96 snapshot or minute grid incomplete")
        if published["sources"][sym]["sha"]!=SOURCE[sym][1]:
            raise ValueError("Aggregate references wrong source Git blob")
        if published["sources"][sym]["path"]!=str(SOURCE[sym][0]):
            raise ValueError("Wrong original source path")
        vals=[x["spread_bps"] for x in m["minute_states"]]
        for name,func in (
            ("minute_spread_mean_bp",statistics.mean),
            ("minute_spread_median_bp",statistics.median),
            ("minute_spread_p90_bp",lambda x:percentile(x,.9)),
            ("minute_max_bp",max),
            ("minute_min_bp",min),
        ):
            equal_num(published["summary"][sym][name],func(vals),f"{sym} {name}",1e-8)
        time=m["event_time_persistence"]
        period=m["last_ts_ms"]-m["first_ts_ms"]
        if time["covered_ms"]!=period or not 0<period<=86400000:
            raise ValueError("Event held-state time coverage invalid")
        equal_num(time["time_weighted_spread_bp"],
                  published["summary"][sym]["event_time_weighted_spread_mean_bp"],
                  sym+" event-time mean")
        for i,x in enumerate(m["minute_states"]):
            h,min_=divmod(i,60)
            expected=f"2026-10-15T{h:02}:{min_:02}:00+00:00"
            if x["anchor_utc"]!=expected or not 0<=x["offset_ms_after_anchor"]<=60000:
                raise ValueError("Minute grid or delay changed")
            if i%15==0:
                old=m["anchors"][i//15]
                for field in ("anchor_utc","sample_utc","best_bid","best_ask",
                              "spread_bps","offset_ms_after_anchor"):
                    if old[field]!=x[field]:
                        raise ValueError("Original 96 snapshot did not match same minute "+field)
                if old["after_event_number"]!=x["source_event_number"]:
                    raise ValueError("Minute event ID differs from snapshot")
        for key in THRESHOLDS:
            original=time["thresholds_bp"][key]
            new=published["summary"][sym]["thresholds"][key]
            count=sum(v>float(key) for v in vals)
            if new["minute_points_above"]!=count:
                raise ValueError("Minute threshold count mismatch")
            equal_num(new["minute_fraction"],count/1440,"minute fraction")
            if original["sum_duration_ms"]!=original["above_threshold_ms"]:
                raise ValueError("Episode duration sum vs integrated time mismatch")
            if original["above_threshold_ms"]!=new["event_time_ms_above"]:
                raise ValueError("Event time threshold total changed")
            equal_num(original["above_threshold_ms"]/period,
                      new["event_time_fraction_above"],"event fraction")
            for src_key,pub_key in (
                ("count","positive_duration_episodes"),
                ("ge_1s","episodes_at_least_1s"),
                ("ge_10s","episodes_at_least_10s"),
                ("ge_60s","episodes_at_least_60s"),
                ("max_duration_ms","max_continuous_duration_ms"),
            ):
                if original[src_key]!=new[pub_key]:
                    raise ValueError("Episode aggregate differs "+src_key)
            if not(original["count"]>=original["ge_1s"]>=original["ge_10s"]>=original["ge_60s"]):
                raise ValueError("Episode count monotonicity violated")
            longest=original["longest_20"]
            if len(longest)>20:
                raise ValueError("Top episodes too many")
            if longest:
                if original["max_duration_ms"]!=longest[0]["duration_ms"]:
                    raise ValueError("Longest episode length doesn't match top 20")
                if new["longest_interval"]!=longest[0]:
                    raise ValueError("Aggregate longest episode changed")
                for entry in longest:
                    if iso_ms(entry["end_utc"])-iso_ms(entry["start_utc"])!=entry["duration_ms"]:
                        raise ValueError("Episode timestamps do not match reported duration")
            if not 0<=original["above_threshold_ms"]<=period:
                raise ValueError("Duration exceeds observed time coverage")

    btc_minutes=source["BTC"]["result"]["market"]["minute_states"]
    eth_minutes=source["ETH"]["result"]["market"]["minute_states"]
    eth_wider=0;btc_wider=0
    for i,row in enumerate(csvrows):
        a,b=btc_minutes[i],eth_minutes[i]
        if row["utc_anchor"]!=a["anchor_utc"] or row["utc_anchor"]!=b["anchor_utc"]:
            raise ValueError("Sources are not paired on identical UTC calendar minute")
        for name,item in (("btc",a),("eth",b)):
            equal_num(row[name+"_spread_bp"],item["spread_bps"],name+" paired spread",1e-8)
            if row[name+"_sample_utc"]!=item["sample_utc"]:
                raise ValueError("Sample time changed")
            if int(row[name+"_sample_offset_ms"])!=item["offset_ms_after_anchor"]:
                raise ValueError("Sample source event delay changed")
        equal_num(row["eth_minus_btc_bp"],b["spread_bps"]-a["spread_bps"],
                  "paired difference",1e-7)
        if b["spread_bps"]>a["spread_bps"]:
            eth_wider+=1
        else:
            btc_wider+=1
    pairs=published["minute_spread_comparisons"]
    if pairs["eth_greater"]!=eth_wider or pairs["btc_greater"]!=btc_wider or pairs["equal"]!=0:
        raise ValueError("Minute ETH/BTC spread dominance differs")

    return {
        "schema":"seven-heaven.okx-minute-spread-persistence-independent-validation.v1",
        "status":"PINNED_TWO_ARCHIVES_2880_MINUTES_AND_FOUR_EVENT_TIME_THRESHOLD_AGGREGATES_VERIFIED",
        "read_only":True,"orders_enabled":False,
        "source_blobs_verified":{x:SOURCE[x][1] for x in SOURCE},
        "full_archive_sha256_verified_from_source_proofs":EXPECTED_ARCHIVE_SHA,
        "minutes_per_pair_verified":1440,
        "historical_quarter_hours_per_pair_verified":96,
        "paired_minute_rows_verified":len(csvrows),
        "event_thresholds_bp_checked":list(THRESHOLDS),
        "time_coverage_and_episode_conservation_checks_passed":True,
        "minutes_eth_spread_wider":eth_wider,
        "minutes_btc_spread_wider":btc_wider,
        "source_global_sequence_proven":False,
        "independence_limit":"Offline verification of pinned source proofs and their aggregate arithmetic. "
             "This does not reconstruct every archived market event a second time.",
        "scope_limit":"Historical event-held L2 states on 2026-10-15, not a market-wide or prospective result.",
    }


def selftest():
    assert git_blob(b"hello")=="b6fc4c620b67d95f953a5c1c1230aaab5db5a1b0"
    equal_num(percentile([1,2,3,4,5],.9),4.6,"type7 p90")
    assert iso_ms("2026-10-15T12:00:01.250+00:00")-iso_ms("2026-10-15T12:00:00.000+00:00")==1250
    try:
        equal_num(1,2,"negative case")
    except ValueError:
        pass
    else:
        raise AssertionError("Mismatch accepted")
    print("PASS: Git blob, calendar-episode timestamp, quantile and mismatch rejection")


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--repo-root",type=Path,default=Path("."))
    ap.add_argument("--selftest",action="store_true")
    args=ap.parse_args()
    if args.selftest:
        selftest()
        return
    evidence=verify(args.repo_root)
    dest=args.repo_root/OUT
    dest.mkdir(parents=True,exist_ok=True)
    (dest/"SEVEN_HEAVEN_OKX_MINUTE_SPREAD_PERSISTENCE_OFFLINE_INDEPENDENT_PROOFS.json").write_text(
        json.dumps(evidence,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print(json.dumps({"status":evidence["status"],
           "minutes":evidence["paired_minute_rows_verified"],
           "eth_wider":evidence["minutes_eth_spread_wider"]},indent=2))


if __name__=="__main__":
    main()
