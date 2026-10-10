#!/usr/bin/env python3
"""Pilot: extend SHA256-verified Binance 1m months BACKWARD from current frontier.

This does not claim first coin creation / first trade and never modifies old ZIPs.
All positive months are published as separate immutable addendum Releases, which
the existing canonical catalog already knows how to verify and incorporate.
"""
from __future__ import annotations
import argparse
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile

import import_historical_bulk as bulk
import supplement_historical_bulk as supplement
from orchestrate_historical_bulk import month_before, verify_month_output

CATALOG=bulk.ROOT/"data/historical_archive_prototype/top250_history_catalog/index.json"
PILOT_IDS=("bitcoin","ethereum")
MAX_ASSETS=2
MAX_MONTHS=2
MONTH=re.compile(r"^20\d{2}-(?:0[1-9]|1[0-2])$")

def need(ok,reason):
    if not ok:raise ValueError(reason)

def inventory(catalog):
    need(catalog.get("ranked")==250 and catalog.get("quote")=="USDT"
         and len(catalog.get("assets",[]))==250,"Canonical ranked Top250 source invalid")
    owned={x["id"]:x for x in bulk.inventory()}
    ranked={x["id"]:x for x in catalog["assets"]}
    verified=[]
    for cid in PILOT_IDS:
        row=ranked.get(cid)
        owner=owned.get(cid)
        need(row is not None and owner is not None and
             len(row["months"])>=12 and row["rank"]==owner["rank"] and
             owner["pair"]==row["symbol"]+"USDT" and
             bulk.PAIR.fullmatch(owner["pair"]) is not None,
             "Pilot must preserve native Binance market owners")
        verified.append((row,owner))
    need(len(verified)==MAX_ASSETS,"Not all protected source identities present")
    return verified

def plan(catalog, months=MAX_MONTHS):
    need(1<=months<=MAX_MONTHS,"Unsafe historical batch size")
    owned=inventory(catalog)
    earliest=[min(x["month"] for x in row["months"]) for row,_ in owned]
    need(len(set(earliest))==1,"Pilot source frontiers have diverged")
    cursor=month_before(earliest[0])
    result=[]
    for _ in range(months):
        need(MONTH.fullmatch(cursor) is not None,"Invalid source month")
        result.append({"month":cursor,
                       "assets":[owner for _,owner in owned],
                       "published":False})
        cursor=month_before(cursor)
    return result

def run(catalog, months=MAX_MONTHS, importer=None, publisher=None,
        existing=None):
    jobs=plan(catalog,months)
    collect=importer or (lambda month,assets,folder:bulk.execute(
        month,"1m",folder,workers=2,limit=len(assets),assets=assets))
    publish=publisher or supplement.publish
    def remote_exists(tag):
        return subprocess.run(["gh","release","view",tag,"--json","tagName"],
                              capture_output=True,timeout=35).returncode==0
    is_published=existing or (lambda tag:False if publisher else remote_exists(tag))
    finished=[];unavailable=[]
    for job in jobs:
        month,assets=job["month"],job["assets"]
        tag=supplement.add_tag(month,assets)
        if is_published(tag):
            # If the catalog hasn't indexed this immutable Release yet,
            # stop and let its scheduled validator catch up. No repeat upload.
            print("EARLIER MONTH ALREADY RELEASED "+tag,flush=True)
            break
        with tempfile.TemporaryDirectory(prefix="seven-earliest-real-") as location:
            folder=Path(location)
            manifest=collect(month,assets,folder)
            verified_candles=verify_month_output(folder,manifest,assets,month)
            # If a historical source is missing, do not publish a release with
            # a false "first month" boundary or synthetic data.
            if manifest["verified"]!=len(assets):
                unavailable.append({"month":month,
                    "verified":manifest["verified"],
                    "unavailable":manifest["unavailable"]})
                break
            need(verified_candles==len(assets)*bulk.bounds(month,"1m")[1],
                 "Original full-month OHLCV count changed")
            tag=supplement.add_tag(month,assets)
            name=publish(month,folder,manifest,assets)
            finished.append({"month":month,"tag":tag,"url":name,
                 "native_candles":verified_candles})
            print("OLDER ORIGINAL MONTH "+json.dumps(finished[-1],
                   sort_keys=True),flush=True)
    return {"schema":"aerith.public.ohlcv.binance-backward-archive-pilot.v1",
            "source":"Binance Spot native 1m .ZIP and official CHECKSUM",
            "quote":"USDT","assets":list(PILOT_IDS),
            "published":finished,"unavailable":unavailable,
            "first_exchange_trade_proven":False,
            "token_creation_date_proven":False,
            "catalog_updated":False}

def main():
    cli=argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--plan",action="store_true")
    cli.add_argument("--collect",action="store_true")
    cli.add_argument("--months",type=int,default=MAX_MONTHS)
    args=cli.parse_args()
    need(args.plan!=args.collect,"Choose --plan or --collect")
    cat=json.loads(CATALOG.read_text())
    pending=plan(cat,args.months)
    if args.plan:
        print("EARLIER VERIFIED MONTH PLAN "+json.dumps({
            "months":[j["month"] for j in pending],
            "ids":list(PILOT_IDS),"sources_proven":False},sort_keys=True))
        return
    need(os.environ.get("GITHUB_ACTIONS")=="true" and os.environ.get("GH_TOKEN")
         and os.environ.get("GITHUB_REPOSITORY") and os.environ.get("GITHUB_SHA"),
         "Native historical Release writes must run via authorized GitHub Actions")
    result=run(cat,args.months)
    print("EARLIER VERIFIED MONTH SUMMARY "+json.dumps(result,
          ensure_ascii=False,sort_keys=True),flush=True)

if __name__=="__main__":
    main()
