#!/usr/bin/env python3
"""Seven Heaven: independent offline BTC vs ETH OKX L2 comparison verification.

Inputs are the two full-day 2026-10-15 public OKX JSON proofs already checked
against archive bytes and a preregistered comparison JSON.
No exchange request, no account, no order, no large archive download.
"""
from __future__ import annotations
import argparse
from datetime import date
import csv
import hashlib
import json
import math
from pathlib import Path
import statistics

ROOT=Path("coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles")
FILES={
 "BTC":ROOT/"okx_l2_btc_usdc_full_day_four_anchors_2026_11_12_evidence/SEVEN_HEAVEN_OKX_BTC_L2_FULL_DAY_FOUR_ANCHORS_PROOFS.json",
 "ETH":ROOT/"okx_l2_eth_usdc_full_day_four_anchors_2026_11_12_evidence/SEVEN_HEAVEN_OKX_ETH_L2_FULL_DAY_FOUR_ANCHORS_PROOFS.json",
 "COMPARE":ROOT/"SEVEN_HEAVEN_OKX_L2_BTC_ETH_USDC_SAME_DAY_FOUR_ANCHORS_COMPARISON_EVIDENCE_2026_11_12.json"
}
BLOB_SHA={
 "BTC":"a80617f03e2c00856c2e8ccb2ec2c7eb26fcbf40",
 "ETH":"621c7edd2367d1cc9acb3bb13d6c11838df0fb86",
 "COMPARE":"5c2795b7e39d21db557bd209db54ee6c0f23d44a",
}
EXPECTED_ARCHIVE_SHA={
 "BTC":"3b543b7333a6c71f4a8bf0ddf4e058fa84f61ad58092b3250784acc0964c7b44",
 "ETH":"048d039eed1d6a18c166f022e8fe02359308445be682d1405df09b61fbc03546"
}
OUTPUT=ROOT/"okx_l2_btc_eth_four_anchor_comparison_2026_11_12_evidence"
HOURS=("00:00","06:00","12:00","18:00")
NOTIONALS=(10,100,1000,10000,100000)
SIDES=("buy","sell")


def git_blob(raw):
    return hashlib.sha1(b"blob "+str(len(raw)).encode()+b"\0"+raw).hexdigest()


def loaded(path,sha):
    raw=path.read_bytes()
    if git_blob(raw)!=sha:
        raise ValueError("Pin mismatch: "+str(path))
    return json.loads(raw.decode("utf8"))


def close(actual,reference,where,tolerance=0.000001):
    if not math.isfinite(float(actual)) or abs(float(actual)-float(reference))>tolerance:
        raise ValueError("Cross-source mismatch "+where+": "+str(actual)+" vs "+str(reference))


def sources(repo):
    result={}
    for symbol in ("BTC","ETH"):
        d=loaded(repo/FILES[symbol],BLOB_SHA[symbol])
        if d["status"]!="full_archive_replayed_four_anchors":
            raise ValueError("Not a validated full-day "+symbol)
        if not d.get("read_only",True) or d.get("orders_enabled",False):
            raise ValueError("Non-PAPER source")
        x=d["result"]
        m=x["market"]
        if x["archive_sha256"]!=EXPECTED_ARCHIVE_SHA[symbol]:
            raise ValueError("Original compressed archive SHA changed")
        if not x["gzip_read_to_eof_crc_checked"] or not m["first_20_event_hashes_match_prior_proof"]:
            raise ValueError("Missing integrity or preflight checks")
        if m["global_logical_continuity_proven"]:
            raise ValueError("Source not allowed to claim complete logical seq chain")
        if len(m["anchors"])!=4:
            raise ValueError("Missing UTC anchor")
        if m["updates_without_sequence_verification"]!=m["updates"]:
            raise ValueError("Unexpected sequence status")
        result[symbol]=d
    return result


def recompute(repo):
    src=sources(repo)
    frozen=loaded(repo/FILES["COMPARE"],BLOB_SHA["COMPARE"])
    if frozen["status"]!="COMPARISON_COMPLETED_TWO_COMPLETE_STREAMED_ARCHIVES":
        raise ValueError("Published cross-asset schema changed")
    rows=[]
    compare=[]
    for i,hour in enumerate(HOURS):
        a=src["BTC"]["result"]["market"]["anchors"][i]
        b=src["ETH"]["result"]["market"]["anchors"][i]
        for t in (a,b):
            if t["anchor_utc"]!=f"2026-10-15T{hour}:00+00:00":
                raise ValueError("Anchor or date unexpectedly changed")
            if not 0<=t["offset_ms_after_anchor"]<=60000:
                raise ValueError("Anchor delay out of frozen range")
            if len(t["notionals"])!=5:
                raise ValueError("Wrong notional rows")
        x=frozen["comparative_spreads"][i]
        if x["hour_utc"]!=hour:
            raise ValueError("Not same hour in comparison")
        for symbol,t in (("btc",a),("eth",b)):
            close(x[symbol+"_spread_bps"],t["spread_bps"],f"{hour} spread {symbol}",1e-8)
        close(x["spread_diff_eth_minus_btc_bps"],
              b["spread_bps"]-a["spread_bps"],f"{hour} spread delta",1e-7)
        compare.append({"hour":hour,"btc_spread_bps":a["spread_bps"],
                        "eth_spread_bps":b["spread_bps"]})
        for j,notional in enumerate(NOTIONALS):
            left,right=a["notionals"][j],b["notionals"][j]
            if left["usdc"]!=notional or right["usdc"]!=notional:
                raise ValueError("Notional mismatch")
            for side in SIDES:
                btc=left[side];eth=right[side]
                if btc["status"]!="complete" or eth["status"]!="complete":
                    raise ValueError("Unavailable depth for "+str((hour,notional,side)))
                row={"hour_utc":hour,"notional_usdc":notional,"side":side,
                     "btc_price_cost_bps":btc["mid_to_vwap_bps"],
                     "eth_price_cost_bps":eth["mid_to_vwap_bps"],
                     "diff_eth_minus_btc_bps":round(
                         eth["mid_to_vwap_bps"]-btc["mid_to_vwap_bps"],6),
                     "btc_levels_consumed":btc["levels"],
                     "eth_levels_consumed":eth["levels"]}
                reference=frozen["cost_comparison"][len(rows)]
                for key in ("hour_utc","notional_usdc","side","btc_levels_consumed",
                            "eth_levels_consumed"):
                    if row[key]!=reference[key]:
                        raise ValueError("Row field mismatch "+key)
                for key in ("btc_price_cost_bps","eth_price_cost_bps",
                            "diff_eth_minus_btc_bps"):
                    close(row[key],reference[key],f"{hour} {notional} {side} {key}")
                rows.append(row)
    if len(rows)!=40 or len(compare)!=4:
        raise ValueError("Not all comparisons confirmed")
    stats={}
    for name in ("BTC","ETH"):
        vals=[r[name.lower()+"_spread_bps"] for r in compare]
        reference=frozen["summary"]["by_asset"][name]
        mean=statistics.mean(vals)
        med=statistics.median(vals)
        close(mean,reference["spread_4_anchors_mean_bps"],name+" mean")
        close(med,reference["median_bps"],name+" median")
        stats[name]={"spread_mean_4_points_bps":round(mean,8),
                     "spread_median_4_points_bps":round(med,8),
                     "complete_archive_events":src[name]["result"]["market"]["total_events"],
                     "archive_sha256":EXPECTED_ARCHIVE_SHA[name]}
    for value in ("1000","100000"):
        for side in SIDES:
            t=[r for r in rows if r["notional_usdc"]==int(value) and r["side"]==side]
            ref=frozen["summary"]["costs_means_for_four_anchors_only"][value][side]
            close(statistics.mean(r["btc_price_cost_bps"] for r in t),
                  ref["btc_4_anchor_mean_bps"],value+" BTC "+side)
            close(statistics.mean(r["eth_price_cost_bps"] for r in t),
                  ref["eth_4_anchor_mean_bps"],value+" ETH "+side)
    output={
        "schema":"seven-heaven.okx-btc-eth-four-anchor-independent-recalculation.v1",
        "date_utc":"2026-11-12",
        "status":"VERIFIED_FIXED_UTC_ANCHOR_BTC_ETH_40_CROSS_ASSET_VALUES",
        "read_only":True,"orders_enabled":False,
        "source_git_blob_sha1":BLOB_SHA,
        "all_source_hashes_match":True,
        "gzip_crc_sources_previously_verified":True,
        "source_logical_sequence_continuity_proven":False,
        "verified_spread_pairs":4,"verified_book_cost_pairs":len(rows),
        "summary":stats,
        "limits":[
            "Only four preregistered instants within one historical day.",
            "No guarantee of no lost source deltas absent sequence counters.",
            "No real trading, no fee rate or actual fill evidence.",
            "These OKX USDC books cannot price historical Bitstamp USD trades."]}
    return output,rows


def selftest():
    assert git_blob(b"hello")=="b6fc4c620b67d95f953a5c1c1230aaab5db5a1b0"
    close(statistics.mean((1,3,5,7)),4,"mean")
    try:
        close(2,3,"negative check")
    except ValueError:
        pass
    else:
        raise AssertionError("Incorrect mismatch accepted")
    print("PASS: Git blob pin formula and deterministic numeric comparison")


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--repo-root",type=Path,default=Path("."))
    p.add_argument("--output",type=Path)
    p.add_argument("--selftest",action="store_true")
    args=p.parse_args()
    if args.selftest:
        selftest()
        return
    summary,rows=recompute(args.repo_root)
    folder=args.output or args.repo_root/OUTPUT
    folder.mkdir(parents=True,exist_ok=True)
    (folder/"SEVEN_HEAVEN_OKX_L2_BTC_ETH_CROSS_ASSET_INDEPENDENT_PROOFS.json").write_text(
        json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    with (folder/"SEVEN_HEAVEN_OKX_L2_BTC_ETH_FOUR_HOUR_PAIRED_COSTS.csv").open(
        "w",newline="",encoding="utf8") as f:
        fields=list(rows[0])
        writer=csv.DictWriter(f,fieldnames=fields,lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
    print(json.dumps({"status":summary["status"],
          "verified_spread_pairs":summary["verified_spread_pairs"],
          "verified_cost_pairs":summary["verified_book_cost_pairs"],
          "summary":summary["summary"]},indent=2,ensure_ascii=False))


if __name__=="__main__":
    main()
