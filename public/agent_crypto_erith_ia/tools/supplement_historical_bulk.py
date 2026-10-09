#!/usr/bin/env python3
"""Supplement immutable existing monthly Releases with NEW exact-ID approved coins.

Each month is processed as a parallel addendum: existing 31-asset historical ZIPs
and immutable GitHub Releases are NEVER replaced. New proof owners from Top250
identity ledger are checked against the Venue audit and Binance .CHECKSUM.
Future qualified IDs automatically flow into this runner without token patches.
"""
from __future__ import annotations
import argparse
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile

import import_historical_bulk as bulk
from orchestrate_historical_bulk import last_publishable, verify_month_output, need

RELEASE = re.compile(r"^crypto-spot-bulk-(20\d{2}-(?:0[1-9]|1[0-2]))-1m$")
ADDENDUM = re.compile(r"^crypto-spot-bulk-add-(20\d{2}-(?:0[1-9]|1[0-2]))-1m-[0-9a-f]{12}$")
UTC=dt.timezone.utc
MAX_MONTHS_PER_RUN=3


def release_entries():
    cp=subprocess.run(["gh","release","list","--limit","1000",
                       "--json","tagName,isDraft"],
                      check=True,capture_output=True,text=True,timeout=45)
    entries=json.loads(cp.stdout)
    need(isinstance(entries,list) and len(entries)<1000,
         "Release pagination incomplete")
    return entries


def existing_files(release_tag):
    cp=subprocess.run(["gh","release","view",release_tag,
                       "--json","assets,isDraft,url"],check=True,
                      capture_output=True,text=True,timeout=45)
    entry=json.loads(cp.stdout)
    need(not entry.get("isDraft") and isinstance(entry.get("assets"),list),
         "Unpublished or incomplete release")
    names=[a["name"] for a in entry["assets"]]
    need(len(set(names))==len(names) and "manifest.json" in names,
         "Duplicate archive or missing manifest in prior release")
    return set(names)


def choose(releases,approved,files,now=None,max_months=MAX_MONTHS_PER_RUN):
    need(1<=max_months<=MAX_MONTHS_PER_RUN,"Unsafe month batch")
    now=now or dt.datetime.now(UTC)
    cutoff=last_publishable(now)
    bases={}
    addenda={}
    for item in releases:
        if isinstance(item,dict):
            if item.get("isDraft"):
                continue
            name=item["tagName"]
        else:
            name=item
        need(isinstance(name,str),"Malformed release tag")
        match=RELEASE.fullmatch(name)
        if match and match.group(1)<=cutoff:
            bases[match.group(1)]=name
        match=ADDENDUM.fullmatch(name)
        if match and match.group(1)<=cutoff:
            addenda.setdefault(match.group(1),[]).append(name)
    pending=[]
    for month in sorted(bases,reverse=True):
        present=set()
        for name in [bases[month],*addenda.get(month,[])]:
            present.update(files(name))
        waiting=[a for a in approved
                 if f"{a['pair']}-1m-{month}.zip" not in present]
        if waiting:
            pending.append({"month":month,"assets":waiting,
                            "base_tag":bases[month]})
            if len(pending)>=max_months:
                break
    return pending


def add_tag(month,assets):
    need(assets and len({a["id"] for a in assets})==len(assets),
         "Addendum needs independent qualified assets")
    ids=";".join(sorted(a["id"]+"|"+a["pair"] for a in assets))
    checksum=hashlib.sha256(ids.encode()).hexdigest()[:12]
    return f"crypto-spot-bulk-add-{month}-1m-{checksum}"


def publish(month,folder,manifest,assets):
    tag=add_tag(month,assets)
    source=sorted(folder.glob("*.zip"))
    need(len(source)==manifest["verified"] and
         (folder/"manifest.json").is_file(),
         "Manifest or original verified Binance files missing")
    args=["gh","release","create",tag,*[str(x) for x in source],
          str(folder/"manifest.json"),
          "--target",os.environ["GITHUB_SHA"],
          "--title",f"Top250 confirmed CoinGecko-ID monthly addendum · {month}",
          "--notes",("Addendum for source-proven identities excluded from the original "
                     "monthly release. Original Binance Spot native 1m ZIPs verified "
                     "against .CHECKSUM, quote USDT. Never overwrite base archive; "
                     "unavailable means no invented candles."),
          "--latest=false"]
    subprocess.run(args,check=True,timeout=240)
    names=existing_files(tag)
    expected={x.name for x in source}|{"manifest.json"}
    need(names==expected,"New release assets do not match validated list")
    return f"https://github.com/{os.environ['GITHUB_REPOSITORY']}/releases/tag/{tag}"


def run(now=None,limit=MAX_MONTHS_PER_RUN,releases=None,files=None,
        output=None,importer=None,publisher=None):
    now=now or dt.datetime.now(UTC)
    new=bulk.confirmed_additions()
    need(len(new)<=250,"Unbounded approved identities")
    legacy=bulk.legacy_inventory()
    used={a["id"] for a in legacy}
    pairs={a["pair"] for a in legacy}
    for asset in new:
        need(asset["id"] not in used and asset["pair"] not in pairs,
             "Source identity overlap in addendum")
        used.add(asset["id"]);pairs.add(asset["pair"])
    entries=release_entries() if releases is None else releases
    reader=files or existing_files
    jobs=choose(entries,new,reader,now=now,max_months=limit)
    total={"schema":"aerith.public.ohlcv.spot.bulk-addendum.delivery.v1",
           "existing_archive_owners":len(legacy),"exact_id_new_owners":len(new),
           "months":[], "new_candles":0,"new_releases":0,
           "quote":"USDT","max_proven":False}
    runner=importer or (lambda month,assets,folder:bulk.execute(
        month,"1m",folder,workers=4,limit=len(assets),assets=assets))
    save=publisher or publish
    for job in jobs:
        month,assets=job["month"],job["assets"]
        with tempfile.TemporaryDirectory(prefix="seven-addendum-") as folder_name:
            folder=Path(folder_name)
            manifest=runner(month,assets,folder)
            candle_count=verify_month_output(folder,manifest,assets,month)
            result_url=save(month,folder,manifest,assets)
            total["months"].append({"month":month,"additional_assets_requested":len(assets),
                                    "verified":manifest["verified"],
                                    "unavailable":manifest["unavailable"],
                                    "candles":candle_count,"release":add_tag(month,assets),
                                    "url":result_url,"zip_bytes":manifest["zip_bytes"]})
            total["new_releases"]+=1
            total["new_candles"]+=candle_count
    return total


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--max-months",type=int,default=MAX_MONTHS_PER_RUN)
    p.add_argument("--plan",action="store_true")
    p.add_argument("--run",action="store_true")
    args=p.parse_args()
    need(args.plan != args.run,"Specify --plan or --run")
    a=bulk.confirmed_additions()
    jobs=choose(release_entries(),a,existing_files,max_months=args.max_months)
    if args.plan:
        print("ADDENDUM PLAN "+json.dumps({"new_id_approved":len(a),
             "months":[{"month":x["month"],"asset_ids":[p["id"] for p in x["assets"]]}
                      for x in jobs]},sort_keys=True))
        return
    need(os.environ.get("GH_TOKEN") and os.environ.get("GITHUB_SHA")
         and os.environ.get("GITHUB_REPOSITORY"),
         "Release publication needs GitHub Actions permissions")
    result=run(limit=args.max_months)
    print("ADDENDUM SUMMARY "+json.dumps(result,sort_keys=True,ensure_ascii=False))


if __name__=="__main__":
    main()
