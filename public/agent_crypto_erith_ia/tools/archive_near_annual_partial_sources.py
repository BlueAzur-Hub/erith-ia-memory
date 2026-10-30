#!/usr/bin/env python3
"""Preserve original partial October 2025 Spot 1m ZIPs in a separate source vault.

Reuses exact-ID owner evidence and the existing official Binance checksum /
OHLCV source probe. NEVER promote partial months to canonical full-month
catalogs. The CLI stages/verifies bytes only; GitHub Actions separately gates
immutable Release publication after main merge. No trading or guessed candles.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path

import import_historical_bulk as bulk
import probe_near_annual_spot_month as probe

SCHEMA="aerith.public.ohlcv.spot.near-year-partial-original.v1"
RELEASE_TAG="crypto-spot-binance-near-year-partial-2025-10"
EXPECTED={
    "aster-2":(36720,7920),
    "morpho":(40860,3780),
    "doublezero":(42420,2220),
}
TOTAL_ORIGINAL=120000
TOTAL_PRELISTING=13920


def need(flag,reason):
    if not flag:
        raise ValueError(reason)


def validate_record(record):
    asset_id=record.get("asset_id")
    need(asset_id in EXPECTED,"Not an independently qualified near-year source")
    source=record.get("original_source")
    need(isinstance(source,dict),"Missing original native source evidence")
    observed,missing=EXPECTED[asset_id]
    need(source.get("original_native_minutes_observed")==observed
         and source.get("missing_before_first_original")==missing
         and source.get("missing_inside_original_span")==0
         and source.get("missing_after_last_original")==0
         and source.get("full_month_native_minutes_expected")==44640
         and source.get("has_full_month") is False
         and source.get("quote")=="USDT"
         and source.get("native_resolution")=="1m"
         and source.get("source_status")==
             "ORIGINAL_ZIP_CHECKSUM_AND_OHLCV_VERIFIED_PARTIAL"
         and source.get("official_checksum_sha256")==source.get("source_sha256"),
         "Partial market history cannot be promoted or changed")


def stage(folder:Path,getter=bulk.download):
    need(not folder.exists() or not any(folder.iterdir()),
         "Stage directory must start empty; never overwrite an archive")
    folder.mkdir(parents=True,exist_ok=True)
    source_bytes=probe.SOURCE.read_bytes()
    owners=probe.choose(json.loads(source_bytes),bulk.confirmed_additions())
    need(len(owners)==3,"Unqualified near-year Spot cohort")
    rows=[]
    for asset in owners:
        name,url=bulk.url_for(asset["pair"],probe.TARGET_MONTH,"1m")
        raw_zip=getter(url)
        raw_checksum=getter(url+".CHECKSUM",cap=8192)
        def exact_get(address,cap=bulk.MAX_ZIP):
            if address==url:return raw_zip
            if address==url+".CHECKSUM":return raw_checksum
            raise ValueError("Attempted unapproved external Spot source")
        original=probe.inspect_original_partial_source(
            asset,probe.TARGET_MONTH,getter=exact_get)
        r={"asset_id":asset["id"],"pair":asset["pair"],"quote":"USDT",
           "source":"Binance Spot official original monthly 1m ZIP",
           "month":probe.TARGET_MONTH,"original_source":original,
           "zip_filename":name,"zip_bytes":len(raw_zip),
           "zip_sha256":hashlib.sha256(raw_zip).hexdigest(),
           "checksum_filename":name+".CHECKSUM",
           "checksum_bytes":len(raw_checksum),
           "checksum_sha256":hashlib.sha256(raw_checksum).hexdigest()}
        validate_record(r)
        need(r["zip_sha256"]==original["source_sha256"],
             "Source ZIP differs from official witness")
        (folder/name).write_bytes(raw_zip)
        (folder/(name+".CHECKSUM")).write_bytes(raw_checksum)
        rows.append(r)
    result={
        "schema":SCHEMA,
        "source":"Binance Spot official original 1m ZIP and checksum documents",
        "source_quote":"USDT",
        "source_month":probe.TARGET_MONTH,
        "release_tag":RELEASE_TAG,
        "annual_full_months_added":0,
        "catalog_months_rewritten":0,
        "original_source_ohlcv_rows":sum(
            x["original_source"]["original_native_minutes_observed"] for x in rows),
        "prelisting_calendar_slots_not_filled":sum(
            x["original_source"]["missing_before_first_original"] for x in rows),
        "internal_missing_slots":sum(
            x["original_source"]["missing_inside_original_span"] for x in rows),
        "synthetic_candles":0,
        "source_year_depth_sha256":hashlib.sha256(source_bytes).hexdigest(),
        "assets":rows,
        "limitations":[
            "Three source months begin after UTC month start and do NOT count as complete months.",
            "The missing early calendar slots are before each recorded first Spot candle.",
            "Only the original source ZIP bytes and official checksum files are published.",
            "No inferred first token creation date, no USD conversion, no interpolation.",
            "Trader, Administrator, Market Core and original monthly source catalogs unchanged.",
        ],
    }
    need(result["original_source_ohlcv_rows"]==TOTAL_ORIGINAL
         and result["prelisting_calendar_slots_not_filled"]==TOTAL_PRELISTING
         and result["internal_missing_slots"]==0,
         "Source completeness changed; research before publication")
    (folder/"manifest.json").write_text(
        json.dumps(result,sort_keys=True,ensure_ascii=False,indent=2)+"\n",
        encoding="utf-8")
    return verify(folder)


def verify(folder:Path):
    r=json.loads((folder/"manifest.json").read_text(encoding="utf-8"))
    need(r.get("schema")==SCHEMA and r.get("source_quote")=="USDT"
         and r.get("release_tag")==RELEASE_TAG
         and r.get("annual_full_months_added")==0
         and r.get("catalog_months_rewritten")==0
         and r.get("synthetic_candles")==0
         and r.get("original_source_ohlcv_rows")==TOTAL_ORIGINAL
         and r.get("prelisting_calendar_slots_not_filled")==TOTAL_PRELISTING
         and r.get("internal_missing_slots")==0
         and isinstance(r.get("assets"),list)
         and len(r["assets"])==3,
         "Partial source release manifest inconsistent")
    owned=set()
    found={"manifest.json"}
    for row in r["assets"]:
        validate_record(row)
        aid=row["asset_id"]
        need(aid not in owned,"Duplicate protected Spot source ID")
        owned.add(aid)
        for stem in ("zip","checksum"):
            name=row[stem+"_filename"]
            need(name not in found and "/" not in name and "\\" not in name,
                 "Unsafe or repeated source asset path")
            found.add(name)
            raw=(folder/name).read_bytes()
            need(len(raw)==row[stem+"_bytes"] and
                 hashlib.sha256(raw).hexdigest()==row[stem+"_sha256"],
                 "Staged original source asset digest mismatch")
        need(row["zip_sha256"]==row["original_source"]["official_checksum_sha256"],
             "Staged ZIP does not match official checksum")
        original_url = row["original_source"]["source_url"]
        def local_get(url, cap=bulk.MAX_ZIP):
            if url == original_url:
                return (folder/row["zip_filename"]).read_bytes()
            if url == original_url+".CHECKSUM":
                return (folder/row["checksum_filename"]).read_bytes()
            raise ValueError("Unexpected local source URL")
        rechecked = probe.inspect_original_partial_source(
            {"id": aid,"pair": row["pair"]},probe.TARGET_MONTH,getter=local_get)
        need(rechecked == row["original_source"],
             "Replayed staged OHLCV differs from approved original-source evidence")
    need(owned==set(EXPECTED) and found=={x.name for x in folder.iterdir()},
         "Source-only Release directory contains unexpected files")
    return r


def main():
    p=argparse.ArgumentParser(description=__doc__)
    flags=p.add_mutually_exclusive_group(required=True)
    flags.add_argument("--plan",action="store_true")
    flags.add_argument("--stage",action="store_true")
    flags.add_argument("--verify",action="store_true")
    p.add_argument("--output",type=Path)
    args=p.parse_args()
    if args.stage:
        need(args.output is not None,"Source stage needs an isolated destination")
        result=stage(args.output)
    elif args.verify:
        need(args.output is not None,"Source verify needs existing stage")
        result=verify(args.output)
    else:
        result={
            "mode":"SOURCE_ONLY_PLAN_NOT_PUBLISHED",
            "source_ids":list(EXPECTED),
            "source_month":probe.TARGET_MONTH,
            "original_rows_expected_from_real_PR_probe":TOTAL_ORIGINAL,
            "prelisting_calendar_slots_expected":TOTAL_PRELISTING,
            "release_tag":RELEASE_TAG,
            "annual_full_months_added":0,
            "synthetic_candles":0,
        }
    print("NEAR YEAR ORIGINAL SOURCE VAULT "+json.dumps(result,ensure_ascii=False,sort_keys=True))


if __name__=="__main__":
    main()
