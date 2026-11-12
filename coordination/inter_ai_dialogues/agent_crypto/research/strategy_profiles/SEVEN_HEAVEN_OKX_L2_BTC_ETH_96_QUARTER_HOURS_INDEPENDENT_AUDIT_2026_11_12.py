#!/usr/bin/env python3
"""Independent, offline verification of 2026-10-15 OKX BTC/ETH 96 quarter-hours.

Six pinned Git blob SHA1 hashes protect the original inputs, derived JSON,
and pair-wise CSVs. Calculates each of 96 BTC/ETH spreads and all 960
paired simulated book cost sides again. No network access or orders.
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
FILES={
    "BTC":ROOT/"okx_l2_96_quarter_hour_2026_10_15_evidence/btc_usdc/SEVEN_HEAVEN_OKX_L2_96_STATES_SOURCE_PROOFS.json",
    "ETH":ROOT/"okx_l2_96_quarter_hour_2026_10_15_evidence/eth_usdc/SEVEN_HEAVEN_OKX_L2_96_STATES_SOURCE_PROOFS.json",
    "derived":ROOT/"SEVEN_HEAVEN_OKX_L2_BTC_ETH_2026_10_15_96_QUARTER_HOUR_PAIRED_COMPARISON_PROOFS.json",
    "spreads":ROOT/"SEVEN_HEAVEN_OKX_L2_BTC_ETH_2026_10_15_96_QUARTER_HOUR_PAIRED_SPREADS.csv",
    "costs":ROOT/"SEVEN_HEAVEN_OKX_L2_BTC_ETH_2026_10_15_96_QUARTER_HOUR_PAIRED_COSTS.csv",
}
PIN={
    "BTC":"ca8f55de07bee5ef73663bd1613d6b56a655e4a4",
    "ETH":"b3be3c7fea85042b770c5f1bb6cdc0d8749cf530",
    "derived":"59d400de7b9fc6dbe31a17c1e9b313312241fb7a",
    "spreads":"21a4127c226952e66e536cd627bffd279ed98de7",
    "costs":"aeb2ae1e2fa26b5fb7cf4afbea9d25f461d3e11d",
}
EXPECTED_SHA={
    "BTC":"3b543b7333a6c71f4a8bf0ddf4e058fa84f61ad58092b3250784acc0964c7b44",
    "ETH":"048d039eed1d6a18c166f022e8fe02359308445be682d1405df09b61fbc03546",
}
OUT=ROOT/"okx_l2_96_quarter_hour_independent_verification_2026_11_12_evidence"

def blob(raw):
    return hashlib.sha1(b"blob "+str(len(raw)).encode()+b"\x00"+raw).hexdigest()

def get(root,name):
    raw=(root/FILES[name]).read_bytes()
    if blob(raw)!=PIN[name]:
        raise ValueError("Changed source Git blob "+name)
    return raw

def close(x,y,label,tol=1e-6):
    a=float(x);b=float(y)
    if not math.isfinite(a) or not math.isfinite(b) or abs(a-b)>tol:
        raise ValueError(f"{label} differs {x} vs {y}")

def pct(nums,p):
    x=sorted(nums)
    idx=(len(x)-1)*p
    lo=int(idx)
    hi=min(lo+1,len(x)-1)
    return x[lo]*(1-(idx-lo))+x[hi]*(idx-lo)

def run(root):
    src={k:json.loads(get(root,k)) for k in ("BTC","ETH")}
    derived=json.loads(get(root,"derived"))
    spreads=list(csv.DictReader(get(root,"spreads").decode("utf8").splitlines()))
    costs=list(csv.DictReader(get(root,"costs").decode("utf8").splitlines()))
    if derived["status"]!="NINETY_SIX_SNAPSHOT_PAIRS_VERIFIED":
        raise ValueError("Derived result not finalized")
    if len(spreads)!=96 or len(costs)!=960 or len(derived["paired_spreads"])!=96:
        raise ValueError("Paired row count must equal 96 + 960")
    per={}
    for sym in ("BTC","ETH"):
        doc=src[sym]
        if doc["status"]!="full_archive_replayed_ninety_six_states":
            raise ValueError("Unvalidated full-day source "+sym)
        if not doc["read_only"] or doc["orders_enabled"]:
            raise ValueError("Source is not read-only")
        r=doc["result"]
        m=r["market"]
        if r["archive_sha256"]!=EXPECTED_SHA[sym] or not r["gzip_read_to_eof_crc_checked"]:
            raise ValueError("Source archive SHA or gzip invalid")
        if len(m["anchors"])!=96 or len(m["snapshot_events"])!=96:
            raise ValueError("Missing fixed or observed snapshots")
        if m["global_logical_continuity_proven"]:
            raise ValueError("Source improperly claims sequence continuity")
        if len(doc["reference_four_checks"])!=4 or not all(x["verified"] for x in doc["reference_four_checks"]):
            raise ValueError("Prior four anchor parity missing")
        for i,a in enumerate(m["anchors"]):
            hour,minute=divmod(i*15,60)
            if a["anchor_utc"]!=f"2026-10-15T{hour:02}:{minute:02}:00+00:00":
                raise ValueError("Calendar grid is not stable")
            if a["source_event_action"]!="snapshot":
                raise ValueError("Selected state is not original 15-minute snapshot")
            if not 0<=a["offset_ms_after_anchor"]<=60_000:
                raise ValueError("Snapshot offset out of allowed 60 seconds")
            z=m["snapshot_events"][i]
            if (z["closest_quarter_index"]!=i or
                z["event_number"]!=a["after_event_number"] or
                z["event_utc"]!=a["sample_utc"]):
                raise ValueError("Snapshot catalog fails 96-anchor pairing")
        vals=[a["spread_bps"] for a in m["anchors"]]
        summary=doc["summary_96_stable_states"]
        close(statistics.mean(vals),summary["mean_bps"],sym+" avg")
        close(statistics.median(vals),summary["median_bps"],sym+" median")
        close(pct(vals,.9),summary["p90_bps"],sym+" p90")
        main=derived["spread_descriptives"][sym]
        close(statistics.mean(vals),main["mean_96_bp"],sym+" published avg")
        close(statistics.median(vals),main["median_96_bp"],sym+" published median")
        close(pct(vals,.9),main["p90_96_bp"],sym+" published p90")
        per[sym]={
            "source_git_blob_sha1":PIN[sym],
            "whole_archive_sha256":r["archive_sha256"],
            "snapshots":96,
            "spread_mean_96_bps":statistics.mean(vals),
            "spread_median_96_bps":statistics.median(vals),
            "spread_p90_96_bps":pct(vals,.9),
            "source_total_events":m["total_events"],
        }

    matched=0
    for index,(published,csvrow) in enumerate(zip(derived["paired_spreads"],spreads)):
        a=src["BTC"]["result"]["market"]["anchors"][index]
        b=src["ETH"]["result"]["market"]["anchors"][index]
        if a["anchor_utc"]!=b["anchor_utc"]!=published["anchor_utc"]:
            raise ValueError("Anchor times disagree")
        if published["anchor_utc"]!=a["anchor_utc"] or csvrow["anchor_utc"]!=a["anchor_utc"]:
            raise ValueError("Cross comparison is shifted")
        for sym,row in (("btc",a),("eth",b)):
            close(row["spread_bps"],published[sym+"_spread_bp"],sym+" derived spread",1e-8)
            close(row["spread_bps"],csvrow[sym+"_spread_bp"],sym+" CSV spread",1e-8)
            if row["sample_utc"]!=csvrow[sym+"_sample_utc"]:
                raise ValueError("Paired timestamps differ")
        close(b["spread_bps"]-a["spread_bps"],
              published["eth_minus_btc_bp"],"spread difference",1e-7)
        close(b["spread_bps"]-a["spread_bps"],
              csvrow["eth_minus_btc_bp"],"CSV spread difference",1e-7)
        if b["spread_bps"]>a["spread_bps"]:
            matched+=1
    if matched!=derived["paired_summary"]["eth_spread_exceeds_btc_count"]:
        raise ValueError("BTC vs ETH 96-way dominance count differs")

    index_cost={}
    for r in costs:
        key=(r["anchor_utc"],int(r["notional_usdc"]),r["side"])
        if key in index_cost:
            raise ValueError("Duplicate cost pair")
        index_cost[key]=r
    checked=0
    for i in range(96):
        a=src["BTC"]["result"]["market"]["anchors"][i]
        b=src["ETH"]["result"]["market"]["anchors"][i]
        for j,notional in enumerate((10,100,1000,10000,100000)):
            for side in ("buy","sell"):
                key=(a["anchor_utc"],notional,side)
                published=index_cost.get(key)
                if published is None:
                    raise ValueError("Missing cost pair")
                bval=b["notionals"][j][side]
                aval=a["notionals"][j][side]
                for name,z in (("btc",aval),("eth",bval)):
                    if published[name+"_status"]!=z["status"]:
                        raise ValueError("Cost status differs")
                    if z["status"]=="complete":
                        close(published[name+"_cost_bp"],z["mid_to_vwap_bps"],name+" book price",1e-6)
                        if int(published[name+"_levels"])!=z["levels"]:
                            raise ValueError("Consumed number of levels differs")
                    elif published[name+"_cost_bp"]:
                        raise ValueError("Depth was unavailable but cost invented")
                if aval["status"]=="complete" and bval["status"]=="complete":
                    close(bval["mid_to_vwap_bps"]-aval["mid_to_vwap_bps"],
                          published["eth_minus_btc_cost_bp"],"cross cost delta",1e-6)
                checked+=1
    if checked!=960:
        raise ValueError("Not all 960 paired costs checked")
    for n in (1000,100000):
        for side in ("buy","sell"):
            for sym in ("BTC","ETH"):
                values=[a["notionals"][[10,100,1000,10000,100000].index(n)][side]["mid_to_vwap_bps"]
                        for a in src[sym]["result"]["market"]["anchors"]]
                q=derived["cost_descriptives"][str(n)][side][sym]
                close(statistics.mean(values),q["mean_96_bp"],f"{sym} {n} {side} mean")
                close(pct(values,.9),q["p90_96_bp"],f"{sym} {n} {side} p90")
    return {
        "schema":"seven-heaven.okx-l2-ninety-six-pairs-independent-verification.v1",
        "status":"NINETY_SIX_SPREAD_PAIRS_AND_NINE_HUNDRED_SIXTY_DEPTH_PAIRS_REPRODUCED",
        "read_only":True,"orders_enabled":False,
        "paired_spreads_verified":96,"paired_cost_sides_verified":960,
        "source_snapshot_hours_verified":192,
        "source_four_point_reconciliation_verified_for_both":True,
        "source_logical_sequence_continuity_proven":False,
        "git_blob_pins":PIN,
        "stats":per,
        "eth_spread_exceeds_btc_count":matched,
        "limitations":[
            "96 exactly preselected quarter-hours in one day only.",
            "Cannot certify upstream message continuity without sequence counters.",
            "Research is static orderbook pricing only; not actual fills or account fees.",
            "No extrapolation to three-month orderbook distributions or EMA return."],
    }

def selftest():
    assert blob(b"hello")=="b6fc4c620b67d95f953a5c1c1230aaab5db5a1b0"
    assert pct([1,2,3,4,5],.9)==4.6
    try:
        close(1,2,"negative test")
    except ValueError:
        pass
    else:
        raise AssertionError("mismatch was accepted")
    print("PASS: Git blob SHA, type-7 quantile and negative mismatch check")

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--repo-root",type=Path,default=Path("."))
    ap.add_argument("--selftest",action="store_true")
    args=ap.parse_args()
    if args.selftest:
        selftest()
        return
    result=run(args.repo_root)
    target=args.repo_root/OUT
    target.mkdir(parents=True,exist_ok=True)
    (target/"SEVEN_HEAVEN_OKX_L2_96_SNAPSHOT_PAIR_INDEPENDENT_PROOFS.json").write_text(
        json.dumps(result,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    print(json.dumps({"status":result["status"],
          "spreads":result["paired_spreads_verified"],
          "cost_pairs":result["paired_cost_sides_verified"],
          "eth_exceeds_btc":result["eth_spread_exceeds_btc_count"]},indent=2))

if __name__=="__main__":
    main()
