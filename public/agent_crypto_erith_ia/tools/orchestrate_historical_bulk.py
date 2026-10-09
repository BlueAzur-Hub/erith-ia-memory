#!/usr/bin/env python3
"""Automated sealed monthly Binance Spot backfill for the existing qualified cohort.

One process selects missing MONTHS (not individual coins), imports the already
qualified assets using import_historical_bulk.py and publishes immutable GitHub
Releases. No changes to existing Trader/Administrator/Market or old OHLCV blocks.
Conservative bound: one/two months per run; 1m native closed months, 7-day
publication grace. Release tags are checkpoints. No "Max" claim is made.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile

import import_historical_bulk as bulk

PREFIX = "crypto-spot-bulk-"
SUFFIX = "-1m"
FIRST_SCAN = "2017-01"  # conservative earlier-than-Binance-since-launch search
MAX_MONTHS_PER_RUN = 2
TAG = re.compile(r"^crypto-spot-bulk-(20\d{2}-(?:0[1-9]|1[0-2]))-1m$")
UTC = dt.timezone.utc


def need(ok, msg):
    if not ok:
        raise ValueError(msg)


def month_before(value):
    year, month = map(int, value.split("-"))
    return f"{year - 1:04d}-12" if month == 1 else f"{year:04d}-{month-1:02d}"


def last_publishable(now: dt.datetime):
    """Use monthly Binance ZIPs only after >=7 full UTC days of grace."""
    need(now.tzinfo is not None, "Time must include UTC zone")
    safe = now.astimezone(UTC) - dt.timedelta(days=7)
    return month_before(f"{safe.year:04d}-{safe.month:02d}")


def tag(month):
    bulk.bounds(month, "1m")
    return f"{PREFIX}{month}{SUFFIX}"


def select_months(now, present, count=MAX_MONTHS_PER_RUN, floor=FIRST_SCAN):
    need(1 <= count <= MAX_MONTHS_PER_RUN, "Unbounded months-per-run")
    bulk.bounds(floor, "1m")
    cutoff=last_publishable(now)
    need(floor <= cutoff, "Scan floor newer than last complete month")
    existing=set()
    for value in present:
        if isinstance(value,dict):
            need("tagName" in value, "Malformed release entry")
            if value.get("isDraft"):
                # Drafts do not prove a published historical month.
                continue
            value=value["tagName"]
        need(isinstance(value,str), "Untrusted tag")
        hit=TAG.fullmatch(value)
        if hit:
            existing.add(hit.group(1))
    chosen=[]
    cursor=cutoff
    while cursor>=floor and len(chosen)<count:
        if cursor not in existing:
            chosen.append(cursor)
        cursor=month_before(cursor)
    return chosen


def github_releases():
    cp=subprocess.run(["gh","release","list","--limit","1000",
                       "--json","tagName,isDraft"],
                      capture_output=True,text=True,timeout=45,check=True)
    result=json.loads(cp.stdout)
    need(isinstance(result,list) and len(result)<1000,
         "Release-list pagination limit reached; cannot safely plan")
    return result


def verify_month_output(folder: Path, manifest: dict, selected: list, month: str):
    need(manifest.get("schema")==bulk.SCHEMA and
         manifest.get("month")==month and manifest.get("interval")=="1m" and
         manifest.get("requested")==len(selected) and
         manifest.get("verified")+manifest.get("unavailable")==len(selected),
         "Month manifest not qualified for requested source inventory")
    indexed={a["id"]:a for a in selected}
    need(len(indexed)==len(selected),"Duplicate asset identity in cohort")
    checked=0
    for row in manifest["assets"]:
        identity=indexed.get(row.get("asset_id"))
        need(identity is not None and row.get("pair")==identity["pair"] and
             row.get("rank")==identity["rank"] and
             row.get("source")=="Binance Spot public monthly CSV" and
             row.get("quote")=="USDT","Archive changed identity/source")
        if row["status"]=="verified":
            file=folder/row["file"]
            need(file.name==row["file"] and file.is_file() and
                 bulk.sha256(file.read_bytes())==row["sha256"] and
                 row["candles"]==bulk.bounds(month,"1m")[1],
                 "SHA-256 or row count invalid after importer")
            checked+=row["candles"]
        else:
            need(row["status"]=="unavailable", "Unknown archive status")
    need(manifest["verified"]+manifest["unavailable"]==len(selected) and
         checked==manifest["candles"], "Count mismatch after import")
    return checked


def run(now=None,count=MAX_MONTHS_PER_RUN,floor=FIRST_SCAN,
        releases=None,publisher=None,importer=None,output_root=None):
    now=now or dt.datetime.now(UTC)
    listings=github_releases() if releases is None else releases
    months=select_months(now,listings,count,floor)
    assets=bulk.inventory()
    need(0 < len(assets) <= 250, "No qualified Spot inventory")
    summary={"schema":"aerith.public.ohlcv.spot.bulk-backfill.delivery.v1",
             "source":"Binance Spot native public monthly 1m",
             "quote":"USDT","owner_count":len(assets),
             "months_planned":months,"months":[],"published":0,
             "verified_candles":0,"max_proven":False}
    import_month=importer or (lambda month,folder:bulk.execute(
        month,"1m",folder,workers=4,limit=len(assets),assets=assets))
    def release_publish(month,folder,manifest):
        release=tag(month)
        files=sorted(folder.glob("*.zip"))
        need(len(files)==manifest["verified"],
             "Non-indexed ZIP or missing source asset in release")
        # Publish original official .zip blobs, never back into the Git history.
        cmd=["gh","release","create",release,
             *[str(p) for p in files],str(folder/"manifest.json"),
             "--target",os.environ["GITHUB_SHA"],
             "--title",f"Verified Binance Spot 1m UTC monthly OHLCV · {month}",
             "--notes",("Validated official Binance Spot monthly 1m ZIP checksums "
                "for independently approved CoinGecko IDs, USDT quote. "
                "Absent/incomplete pairs explicitly unavailable in manifest; "
                "this release does NOT prove Max or USD conversion."),
             "--latest=false"]
        subprocess.run(cmd,check=True,timeout=240)
        cp=subprocess.run(["gh","release","view",release,
                 "--json","assets,url,isDraft"],check=True,capture_output=True,
                 text=True,timeout=40)
        found=json.loads(cp.stdout)
        names={x["name"] for x in found["assets"]}
        expected={x.name for x in files}|{"manifest.json"}
        need(not found["isDraft"] and names==expected,
             "Published release incomplete; manual reconciliation required")
        return found["url"]
    publish=publisher or release_publish
    for month in months:
        with tempfile.TemporaryDirectory(prefix="seven-bulk-") if output_root is None else _managed(output_root/month) as folder_name:
            folder=Path(folder_name)
            folder.mkdir(parents=True,exist_ok=True)
            manifest=import_month(month,folder)
            candles=verify_month_output(folder,manifest,assets,month)
            # Even 0 verified is an honest published checkpoint with all unavailable,
            # allowing the backfill to pass listing dates without an infinite loop.
            url=publish(month,folder,manifest)
            summary["months"].append({"month":month,"release":tag(month),"url":url,
                 "verified":manifest["verified"],"unavailable":manifest["unavailable"],
                 "candles":candles,"zip_bytes":manifest["zip_bytes"]})
            summary["published"]+=1
            summary["verified_candles"]+=candles
    return summary


class _managed:
    """Test-friendly context: persistent scratch is never a Git path."""
    def __init__(self,path):self.path=path
    def __enter__(self):return str(self.path)
    def __exit__(self,*exc):return False


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--max-months",type=int,default=MAX_MONTHS_PER_RUN)
    p.add_argument("--floor",default=FIRST_SCAN)
    p.add_argument("--plan",action="store_true")
    p.add_argument("--run",action="store_true")
    args=p.parse_args()
    need(args.plan != args.run,"Specify --plan or --run")
    present=github_releases()
    if args.plan:
        approved=bulk.inventory()
        out={"mode":"BOUNDED_BACKFILL_PLAN",
             "source":"Binance Spot USDT native 1m",
             "qualified_assets":len(approved),
             "months":select_months(dt.datetime.now(UTC),present,args.max_months,args.floor),
             "max_proven":False}
    else:
        need(os.environ.get("GH_TOKEN") and os.environ.get("GITHUB_SHA"),
             "Release write permissions unavailable")
        out=run(count=args.max_months,floor=args.floor,releases=present)
    print("BACKFILL SUMMARY "+json.dumps(out,sort_keys=True,ensure_ascii=False))


if __name__=="__main__":
    main()
