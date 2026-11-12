#!/usr/bin/env python3
"""Seven Heaven read-only independent verification of 6 OKX L2 source proofs.

Three preregistered calendar dates × two USDC Spot instruments × 4 UTC anchors.
Verifies immutable Git blobs, six source digests, 24 anchor rows, all 240 cost
rows, 12 paired spreads, per-day and 12-point means/medians. Never calls OKX
or places market orders. Python stdlib only.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
from pathlib import Path
import statistics

ROOT=Path("coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles")
DATES=("2026-08-15","2026-09-15","2026-10-15")
PAIRS=("BTC-USDC","ETH-USDC")
HOURS=("00:00","06:00","12:00","18:00")
AMOUNTS=(10,100,1000,10000,100000)
SIDES=("buy","sell")
PUBLISH_PROOF=ROOT/"SEVEN_HEAVEN_OKX_L2_BTC_ETH_CALENDAR_THREE_DATES_2026_08_09_10_RESEARCH_PROOFS_2026_11_12.json"
SPREAD_CSV=ROOT/"SEVEN_HEAVEN_OKX_L2_BTC_ETH_CALENDAR_THREE_DATES_2026_08_09_10_SPREADS_24_ANCHORS_2026_11_12.csv"
COST_CSV=ROOT/"SEVEN_HEAVEN_OKX_L2_BTC_ETH_CALENDAR_THREE_DATES_2026_08_09_10_BOOK_COSTS_240_SIDES_2026_11_12.csv"
SOURCE_BLOBS={
 "2026-08-15_BTC-USDC":"7e78002061c8ecf01ef178e0ee90920480b665ce",
 "2026-08-15_ETH-USDC":"65bd1adfbd7a4a1098b7392cfcc49f6b2059bbc8",
 "2026-09-15_BTC-USDC":"214d213c6085e44636c4e34f2b46596cd4c73fea",
 "2026-09-15_ETH-USDC":"37f18a89b92b36e418775b4fd1e4fe19c90d7486",
 "2026-10-15_BTC-USDC":"a80617f03e2c00856c2e8ccb2ec2c7eb26fcbf40",
 "2026-10-15_ETH-USDC":"621c7edd2367d1cc9acb3bb13d6c11838df0fb86"
}
PINNED={
 str(PUBLISH_PROOF):"511a6b2ca4932e6183d239dcaf159c375c76c34c",
 str(SPREAD_CSV):"ab0b7ce0a9bc08457fb0655ec5ca72dda34504e6",
 str(COST_CSV):"d434d7cb6c8f0aea7c8374f2fda891643b2566f6"
}
OUTPUT=ROOT/"okx_l2_calendar_three_dates_independent_validation_2026_11_12_evidence"


def blob_sha(raw):
    return hashlib.sha1(b"blob "+str(len(raw)).encode()+b"\0"+raw).hexdigest()


def safe_read(root,path,sha):
    content=(root/path).read_bytes()
    if blob_sha(content)!=sha:
        raise ValueError(f"Git blob SHA mismatch: {path}")
    return content


def near(a,b,label,tol=0.000002):
    if a is None or b is None or not math.isfinite(float(a)) or abs(float(a)-float(b))>tol:
        raise ValueError(f"Recalculation mismatch for {label}: {a!r} != {b!r}")


def source_path(date,pair):
    if date=="2026-10-15":
        first=pair.split("-")[0].lower()
        upper=pair.split("-")[0]
        return ROOT/f"okx_l2_{first}_usdc_full_day_four_anchors_2026_11_12_evidence/SEVEN_HEAVEN_OKX_{upper}_L2_FULL_DAY_FOUR_ANCHORS_PROOFS.json"
    return (ROOT/"okx_l2_calendar_multiday_2026_11_12_evidence"/date/
            pair.lower().replace("-","_")/"SEVEN_HEAVEN_OKX_L2_MULTIDAY_FOUR_ANCHORS_PROOFS.json")


def recalculate(repo_root):
    published=json.loads(safe_read(repo_root,PUBLISH_PROOF,PINNED[str(PUBLISH_PROOF)]))
    spread_rows=list(csv.DictReader(safe_read(repo_root,SPREAD_CSV,PINNED[str(SPREAD_CSV)]).decode("utf8").splitlines()))
    cost_rows=list(csv.DictReader(safe_read(repo_root,COST_CSV,PINNED[str(COST_CSV)]).decode("utf8").splitlines()))
    if len(spread_rows)!=24 or len(cost_rows)!=240:
        raise ValueError("Output CSV does not contain 24 + 240 expected records")
    if published["status"]!="SIX_ARCHIVES_VERIFIED_TWELVE_PAIRED_ANCHORS_AND_240_COSTS":
        raise ValueError("Published status changed")
    if published["days_utc"]!=list(DATES) or published["pairs"]!=list(PAIRS):
        raise ValueError("Calendar or instrument selection differs from frozen protocol")

    source={}
    result_spreads=[]
    result_costs=[]
    source_integrity={}
    for day in DATES:
        for pair in PAIRS:
            key=day+"_"+pair
            path=source_path(day,pair)
            doc=json.loads(safe_read(repo_root,path,SOURCE_BLOBS[key]))
            if doc["status"]!="full_archive_replayed_four_anchors" or doc["orders_enabled"]:
                raise ValueError("Incomplete or trading-enabled input source")
            details=doc["result"]
            market=details["market"]
            if (not details["gzip_read_to_eof_crc_checked"]
                or market["global_logical_continuity_proven"]):
                raise ValueError("Invalid quality/continuity statement")
            if len(market["anchors"])!=4:
                raise ValueError("Four fixed UTC observations not found")
            pin=published["source_index"][key]
            if pin["blob_sha1"]!=SOURCE_BLOBS[key]:
                raise ValueError("Published SHA pin changed")
            if (pin["archive_sha256"]!=details["archive_sha256"]
                or pin["unpacked_sha256"]!=details["member_sha256"]
                or pin["events"]!=market["total_events"]):
                raise ValueError("Wrong source provenance")
            source[key]=doc
            source_integrity[key]={
                "source_blob_sha1":SOURCE_BLOBS[key],
                "complete_archive_sha256":details["archive_sha256"],
                "member_sha256":details["member_sha256"],
                "events":market["total_events"],
                "global_sequence_continuity_proven":False}
            for index,hour in enumerate(HOURS):
                a=market["anchors"][index]
                if a["anchor_utc"][:10]!=day or a["anchor_utc"][11:16]!=hour:
                    raise ValueError("Wrong date/hour in primary archive")
                if not (0<=a["offset_ms_after_anchor"]<=60000):
                    raise ValueError("Anchor failed 60-second tolerance")
                row={"day_utc":day,"pair":pair,"hour_utc":hour,
                     "observed_utc":a["sample_utc"],
                     "delay_ms":a["offset_ms_after_anchor"],
                     "best_bid":a["best_bid"],"best_ask":a["best_ask"],
                     "spread_bps":a["spread_bps"],"asks_active":a["asks_active"],
                     "bids_active":a["bids_active"],"event_index":a["after_event_number"]}
                result_spreads.append(row)
                for i,amount in enumerate(AMOUNTS):
                    n=a["notionals"][i]
                    if n["usdc"]!=amount:
                        raise ValueError("Notional shifted")
                    for side in SIDES:
                        r=n[side]
                        result_costs.append({"day_utc":day,"hour_utc":hour,
                            "pair":pair,"notional_usdc":amount,"side":side,
                            "depth_status":r["status"],
                            "price_cost_bps":r.get("mid_to_vwap_bps"),
                            "levels_consumed":r.get("levels")})
    if len(result_spreads)!=24 or len(result_costs)!=240:
        raise ValueError("Reconstructed proof count invalid")

    # Published order is date then hour then BTC/ETH, while independent
    # source loop above visits each asset across four hours.
    spread_by_key={(r["day_utc"],r["pair"],r["hour_utc"]):r for r in result_spreads}
    cost_by_key={(r["day_utc"],r["pair"],r["hour_utc"],r["notional_usdc"],r["side"]):r for r in result_costs}
    for r in spread_rows:
        key=(r["day_utc"],r["pair"],r["hour_utc"])
        if key not in spread_by_key:
            raise ValueError("Unexpected spread CSV key")
        ref=spread_by_key[key]
        for field in ("observed_utc","best_bid","best_ask"):
            if r[field]!=str(ref[field]):
                raise ValueError("Spread source field differs: "+field)
        for field in ("delay_ms","asks_active","bids_active","event_index"):
            if int(r[field])!=ref[field]:
                raise ValueError("Spread source int differs: "+field)
        near(r["spread_bps"],ref["spread_bps"],str(key)+" spread",1e-8)
    for r in cost_rows:
        key=(r["day_utc"],r["pair"],r["hour_utc"],int(r["notional_usdc"]),r["side"])
        if key not in cost_by_key:
            raise ValueError("Unexpected cost CSV key")
        ref=cost_by_key[key]
        if r["depth_status"]!=ref["depth_status"]:
            raise ValueError("Cost status differs")
        if ref["depth_status"]=="complete":
            near(r["price_cost_bps"],ref["price_cost_bps"],str(key)+" cost",1e-6)
            if int(r["levels_consumed"])!=ref["levels_consumed"]:
                raise ValueError("Consumed levels changed")
        elif r["price_cost_bps"] or r["levels_consumed"]:
            raise ValueError("Invented value for unavailable depth")

    # Independently rebuild the aggregate reference values.
    for day in DATES:
        for pair in PAIRS:
            a=[r["spread_bps"] for r in result_spreads if r["day_utc"]==day and r["pair"]==pair]
            target=published["per_day"][day][pair]
            near(statistics.mean(a),target["four_anchor_spread_mean_bps"],day+" "+pair+" mean")
            near(statistics.median(a),target["median_bps"],day+" "+pair+" median")
            for n in (1000,100000):
                for side in SIDES:
                    vals=[r["price_cost_bps"] for r in result_costs if r["day_utc"]==day and r["pair"]==pair
                          and r["notional_usdc"]==n and r["side"]==side]
                    if all(v is not None for v in vals):
                        near(statistics.mean(vals),target["costs_before_fees"][str(n)][side]["four_anchor_mean_price_cost_bps"],
                             f"{day} {pair} {n} {side} mean")
    for pair in PAIRS:
        v=[r["spread_bps"] for r in result_spreads if r["pair"]==pair]
        stats=published["overall_12_point_descriptives"][pair]
        near(statistics.mean(v),stats["twelve_anchor_spread_mean_bps"],pair+" twelve-point mean")
        near(statistics.median(v),stats["median_bps"],pair+" twelve-point median")
        for n in (1000,100000):
            for side in SIDES:
                vals=[r["price_cost_bps"] for r in result_costs if r["pair"]==pair
                      and r["notional_usdc"]==n and r["side"]==side]
                if all(v is not None for v in vals):
                    near(statistics.mean(vals),stats[f"twelve_anchor_{n}_{side}_price_cost_mean_bps"],
                         pair+" "+str(n)+" "+side+" 12pt average")

    proof={"schema":"seven-heaven.okx-l2-calendar-three-day-independent-verification.v1",
           "status":"SIX_SOURCE_BLOBS_24_SPREADS_240_COSTS_AND_ALL_PUBLISHED_AGGREGATES_REPRODUCED",
           "read_only":True,"orders_enabled":False,
           "six_archive_sources":source_integrity,
           "published_aggregate_git_blob_sha1":PINNED[str(PUBLISH_PROOF)],
           "spread_csv_git_blob_sha1":PINNED[str(SPREAD_CSV)],
           "book_cost_csv_git_blob_sha1":PINNED[str(COST_CSV)],
           "verified_sources":6,"verified_spread_points":24,"verified_book_cost_points":240,
           "source_logical_sequence_continuity_proven":False,
           "caveat":"Three dates and four instants per day are descriptive only; no fee or execution history validated."}
    return proof


def selftest():
    assert blob_sha(b"hello")=="b6fc4c620b67d95f953a5c1c1230aaab5db5a1b0"
    near(0.12345,0.123451,"floating point")
    try:
        near(0.1,0.2,"must fail")
    except ValueError:
        pass
    else:
        raise AssertionError("Difference not caught")
    print("PASS: source SHA formula and numeric mismatch refusal")


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--repo-root",type=Path,default=Path("."))
    p.add_argument("--output",type=Path)
    p.add_argument("--selftest",action="store_true")
    args=p.parse_args()
    if args.selftest:
        selftest()
        return
    proof=recalculate(args.repo_root)
    target=args.output or args.repo_root/OUTPUT
    target.mkdir(parents=True,exist_ok=True)
    file=target/"SEVEN_HEAVEN_OKX_L2_THREE_DATES_INDEPENDENT_REPRODUCTION_PROOFS.json"
    file.write_text(json.dumps(proof,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    print(json.dumps({"status":proof["status"],"verified_sources":proof["verified_sources"],
          "verified_spreads":proof["verified_spread_points"],
          "verified_costs":proof["verified_book_cost_points"]},indent=2))


if __name__=="__main__":
    main()
