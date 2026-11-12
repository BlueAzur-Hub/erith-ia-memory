#!/usr/bin/env python3
"""Reproduce all three-date OKX L2 96-quarter-hour cross-asset comparisons.

Six source proofs, one summary JSON, two CSV outputs PINNED by their Git
blob SHA-1. Standard library only. Reads neither exchanges nor account data.
No market orders, no scheduled tasks or runtime credential access.
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
HOURS=tuple(f"{i//4:02}:{(i%4)*15:02}" for i in range(96))
NOTIONALS=(10,100,1000,10000,100000)
SIDES=("buy","sell")
TITLE="SEVEN_HEAVEN_OKX_L2_BTC_ETH_AUGUST_SEPTEMBER_OCTOBER_2026_96_QUARTER_HOUR_"
DERIVED={
    "proof":(ROOT/(TITLE+"THREE_DAY_AGGREGATED_PROOFS_2026_11_12.json"),
             "22f8306b9e1ef0fe19198dbb7573537c61aec75d"),
    "spreads":(ROOT/(TITLE+"PAIRED_SPREADS_288_ROWS_2026_11_12.csv"),
               "1cd617b6229e23e6d1ef7b1b62d4ee6a691ab659"),
    "costs":(ROOT/(TITLE+"PAIRED_DEPTH_COSTS_2880_ROWS_2026_11_12.csv"),
             "4cc4d6e6cfda04da29a36ea23fb490ccd03e9238"),
}
PINS={
    "2026-08-15|BTC-USDC":"ae4d975242a113f8ab81a28bca334b8d62973ce8",
    "2026-08-15|ETH-USDC":"afd81ec52fbbc03c51a946a0dea5ce93f9732275",
    "2026-09-15|BTC-USDC":"1d173cd27be2ac971326850e1d81dfe5ad4a0857",
    "2026-09-15|ETH-USDC":"eb882de160670bc8f7099645af86a07ab3a31dd6",
    "2026-10-15|BTC-USDC":"ca8f55de07bee5ef73663bd1613d6b56a655e4a4",
    "2026-10-15|ETH-USDC":"b3be3c7fea85042b770c5f1bb6cdc0d8749cf530",
}
ARCHIVE_SHA={
    "2026-08-15|BTC-USDC":"a8af512dabf96c6e5c8af37a0e19eb11ebce88ed232308cba9a63a37053fc130",
    "2026-08-15|ETH-USDC":"9da303d949bce4f25248f7d3f6b7e34e2be6ed426b4945a395c3097d7932bfca",
    "2026-09-15|BTC-USDC":"53ab528063479e83dbd833be63615d09cee209897d39021403a88fd6f2d31460",
    "2026-09-15|ETH-USDC":"694464feb71a39dccff0188087079f3d200b50e51efc4a4120b454e4a9213924",
    "2026-10-15|BTC-USDC":"3b543b7333a6c71f4a8bf0ddf4e058fa84f61ad58092b3250784acc0964c7b44",
    "2026-10-15|ETH-USDC":"048d039eed1d6a18c166f022e8fe02359308445be682d1405df09b61fbc03546",
}
OUT=ROOT/"okx_l2_three_days_96_quarter_hours_independent_2026_11_12_evidence"

def git_blob(raw):
    return hashlib.sha1(b"blob "+str(len(raw)).encode()+b"\0"+raw).hexdigest()

def content(root,path,pin):
    raw=(root/path).read_bytes()
    if git_blob(raw)!=pin:
        raise ValueError(f"Pinned git blob SHA mismatch at {path}")
    return raw

def source_path(date,pair):
    slug=pair.lower().replace("-","_")
    if date=="2026-10-15":
        return ROOT/"okx_l2_96_quarter_hour_2026_10_15_evidence"/slug/"SEVEN_HEAVEN_OKX_L2_96_STATES_SOURCE_PROOFS.json"
    return ROOT/"okx_l2_aug_sep_96_quarter_hour_2026_11_12_evidence"/date/slug/"SEVEN_HEAVEN_OKX_L2_96_STATES_SOURCE_PROOFS.json"

def numeric_equal(a,b,context,tol=0.000002):
    x=float(a);y=float(b)
    if not math.isfinite(x) or not math.isfinite(y) or abs(x-y)>tol:
        raise ValueError(f"{context}: {a} not equal to {b}")

def percentile(nums,q):
    x=sorted(nums)
    n=(len(x)-1)*q
    i=int(n)
    j=min(i+1,len(x)-1)
    return x[i]*(1-(n-i))+x[j]*(n-i)

def median(nums):
    return statistics.median(nums)

def analyze(root):
    saved=json.loads(content(root,*DERIVED["proof"]))
    csvsp=list(csv.DictReader(content(root,*DERIVED["spreads"]).decode("utf8").splitlines()))
    csvco=list(csv.DictReader(content(root,*DERIVED["costs"]).decode("utf8").splitlines()))
    if saved["status"]!="SIX_FULL_ARCHIVES_576_STATES_288_PAIRED_SPREADS_2880_PAIRED_COSTS":
        raise ValueError("Combined proof status changed")
    if saved["dates_utc"]!=list(DATES) or saved["instruments"]!=list(PAIRS):
        raise ValueError("Changed date or instrument list")
    if len(csvsp)!=288 or len(csvco)!=2880:
        raise ValueError("Missing paired spread or book-cost CSV rows")
    sources={}
    for day in DATES:
        for pair in PAIRS:
            k=day+"|"+pair
            path=source_path(day,pair)
            o=json.loads(content(root,path,PINS[k]))
            if (o["status"]!="full_archive_replayed_ninety_six_states"
                or not o["read_only"] or o["orders_enabled"]):
                raise ValueError("Not a validated read-only day/pair "+k)
            r=o["result"]
            m=r["market"]
            if (r["archive_sha256"]!=ARCHIVE_SHA[k] or
                not r["gzip_read_to_eof_crc_checked"] or
                m["global_logical_continuity_proven"] or
                not m["first_20_event_hashes_match_prior_proof"]):
                raise ValueError("Day/pair source CRC, SHA or sequence claims fail "+k)
            if len(o["reference_four_checks"])!=4 or not all(x["verified"] for x in o["reference_four_checks"]):
                raise ValueError("Missing reference agreement "+k)
            if len(m["anchors"])!=96 or m["snapshots"]!=96 or len(m["snapshot_events"])!=96:
                raise ValueError("Missing 96 states and snapshots "+k)
            if saved["sources"][k]["git_blob_sha1"]!=PINS[k]:
                raise ValueError("Source digest in published combined proof changed")
            for i,hour in enumerate(HOURS):
                a=m["anchors"][i]
                if (a["anchor_utc"]!=f"{day}T{hour}:00+00:00" or
                    a["source_event_action"]!="snapshot" or
                    not (0<=a["offset_ms_after_anchor"]<=60000)):
                    raise ValueError("Fixed snapshot grid broken "+k+" "+hour)
                z=m["snapshot_events"][i]
                if (z["event_number"]!=a["after_event_number"] or
                    z["closest_quarter_index"]!=i or
                    z["event_utc"]!=a["sample_utc"]):
                    raise ValueError("Original snapshot not corresponding to anchor "+k+" "+hour)
            sources[k]=o

    spreads_by_key={}
    for r in csvsp:
        key=(r["date_utc"],r["hour_utc"])
        if key in spreads_by_key:
            raise ValueError("Duplicate UTC pair in spread output")
        spreads_by_key[key]=r
    costs_by_key={}
    for r in csvco:
        key=(r["date_utc"],r["hour_utc"],int(r["notional_usdc"]),r["side"])
        if key in costs_by_key:
            raise ValueError("Duplicate notionals in cost output")
        costs_by_key[key]=r

    spread_count=0;cost_count=0;eth_wider=0;btc_wider=0;equal=0;full_events=0
    for day in DATES:
        for pair in PAIRS:
            full_events+=sources[day+"|"+pair]["result"]["market"]["total_events"]
            vals=[x["spread_bps"] for x in sources[day+"|"+pair]["result"]["market"]["anchors"]]
            ref=saved["per_day"][day][pair]
            numeric_equal(statistics.mean(vals),ref["mean_bp"],"daily mean "+day+" "+pair)
            numeric_equal(median(vals),ref["median_bp"],"daily median "+day+" "+pair)
            numeric_equal(percentile(vals,.1),ref["p10_bp"],"daily p10 "+day+" "+pair)
            numeric_equal(percentile(vals,.9),ref["p90_bp"],"daily p90 "+day+" "+pair)
        for i,hour in enumerate(HOURS):
            a=sources[day+"|BTC-USDC"]["result"]["market"]["anchors"][i]
            b=sources[day+"|ETH-USDC"]["result"]["market"]["anchors"][i]
            row=spreads_by_key.get((day,hour))
            if row is None:
                raise ValueError("Missing spread pair")
            numeric_equal(a["spread_bps"],row["btc_spread_bp"],"BTC raw spread",1e-8)
            numeric_equal(b["spread_bps"],row["eth_spread_bp"],"ETH raw spread",1e-8)
            numeric_equal(b["spread_bps"]-a["spread_bps"],row["eth_minus_btc_bp"],"Cross spread diff",1e-7)
            if row["btc_sample_utc"]!=a["sample_utc"] or row["eth_sample_utc"]!=b["sample_utc"]:
                raise ValueError("Original snapshot timestamps changed")
            if int(row["btc_delay_ms"])!=a["offset_ms_after_anchor"] or int(row["eth_delay_ms"])!=b["offset_ms_after_anchor"]:
                raise ValueError("Original snapshot delays changed")
            delta=b["spread_bps"]-a["spread_bps"]
            if delta>0:eth_wider+=1
            elif delta<0:btc_wider+=1
            else:equal+=1
            spread_count+=1
            for ix,amount in enumerate(NOTIONALS):
                for side in SIDES:
                    row=costs_by_key.get((day,hour,amount,side))
                    if row is None:
                        raise ValueError("Missing a pair of book-side costs")
                    x=a["notionals"][ix][side]
                    y=b["notionals"][ix][side]
                    for sym,v in (("btc",x),("eth",y)):
                        if row[sym+"_status"]!=v["status"]:
                            raise ValueError("Source book depth status changed")
                        if v["status"]=="complete":
                            numeric_equal(v["mid_to_vwap_bps"],row[sym+"_price_cost_bp"],"Book price",1e-6)
                            if int(row[sym+"_levels_consumed"])!=v["levels"]:
                                raise ValueError("Changed number of levels consumed")
                        elif row[sym+"_price_cost_bp"]:
                            raise ValueError("Invented book cost for insufficient depth")
                    if x["status"]=="complete" and y["status"]=="complete":
                        numeric_equal(y["mid_to_vwap_bps"]-x["mid_to_vwap_bps"],
                                      row["eth_minus_btc_cost_bp"],"Relative book-price cost",1e-6)
                    cost_count+=1
    if spread_count!=288 or cost_count!=2880 or full_events!=saved["counts"]["full_archive_events"]:
        raise ValueError("Incomplete counts of independently verified studies")
    if (saved["counts"]["comparisons"]["eth_spread_gt_btc"]!=eth_wider or
        saved["counts"]["comparisons"]["btc_spread_gt_eth"]!=btc_wider or
        saved["counts"]["comparisons"]["equal_spread"]!=equal):
        raise ValueError("Cross-asset dominance count mismatch")
    for pair in PAIRS:
        arr=[a["spread_bps"] for day in DATES
             for a in sources[day+"|"+pair]["result"]["market"]["anchors"]]
        stat=saved["descriptive_across_three_days"][pair]
        for key,v in (("mean_288_bp",statistics.mean(arr)),("median_288_bp",median(arr)),
                      ("p10_288_bp",percentile(arr,.1)),("p90_288_bp",percentile(arr,.9))):
            numeric_equal(v,stat[key],pair+" "+key)
        for amount in (1000,100000):
            for side in SIDES:
                vals=[a["notionals"][NOTIONALS.index(amount)][side]["mid_to_vwap_bps"]
                      for day in DATES for a in sources[day+"|"+pair]["result"]["market"]["anchors"]]
                if len(vals)!=288:
                    raise ValueError("Not all depth scores available")
                numeric_equal(statistics.mean(vals),
                              stat[f"{amount}_{side}_cost_mean_288_bp"],
                              pair+" "+str(amount)+" "+side+" cost mean")
                numeric_equal(percentile(vals,.9),
                              stat[f"{amount}_{side}_cost_p90_288_bp"],
                              pair+" "+str(amount)+" "+side+" cost p90")

    return {
        "schema":"seven-heaven.okx-l2-aug-sep-oct-96-quarters-independent.v1",
        "status":"SIX_ARCHIVES_576_STATES_288_SPREADS_2880_COST_PAIRS_INDEPENDENTLY_REPRODUCED",
        "read_only":True,"orders_enabled":False,
        "source_blobs_verified":PINS,
        "derived_output_blobs_verified":{key:sha for key,(_,sha) in DERIVED.items()},
        "verified_source_archives":6,"verified_book_states":576,
        "verified_spread_pairs":spread_count,
        "verified_cost_pairs":cost_count,
        "verified_complete_archive_events":full_events,
        "eth_spread_gt_btc":eth_wider,"btc_spread_gt_eth":btc_wider,
        "equal_spread":equal,
        "all_source_sha_crc_claims_checked":True,
        "upstream_source_sequence_completeness_proven":False,
        "limits":[
            "Only 96 predetermined instants on 3 past dates, not continuous time average.",
            "Gzip CRC and SHA certify the files read, not upstream missing market messages.",
            "Historical quotes do not demonstrate real fills, fees or EMA profitability.",
            "Snapshot pair timestamps may differ by milliseconds; no atomic synchronization."
        ],
    }

def selftest():
    assert git_blob(b"hello")=="b6fc4c620b67d95f953a5c1c1230aaab5db5a1b0"
    numeric_equal(percentile([1,2,3,4,5],.9),4.6,"type7")
    try:numeric_equal(0,1,"negative test")
    except ValueError:pass
    else:raise AssertionError("Mismatch silently accepted")
    print("PASS: git blob formula, type7 p90, and negative numerical mismatch")

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--repo-root",type=Path,default=Path("."))
    p.add_argument("--selftest",action="store_true")
    opts=p.parse_args()
    if opts.selftest:
        selftest();return
    result=analyze(opts.repo_root)
    dest=opts.repo_root/OUT
    dest.mkdir(parents=True,exist_ok=True)
    (dest/"SEVEN_HEAVEN_OKX_L2_THREE_DATES_96_QUARTER_HOUR_INDEPENDENT_PROOFS.json").write_text(
        json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print(json.dumps({"status":result["status"],"archives":result["verified_source_archives"],
        "states":result["verified_book_states"],"spread_pairs":result["verified_spread_pairs"],
        "cost_pairs":result["verified_cost_pairs"]},indent=2))

if __name__=="__main__":
    main()
