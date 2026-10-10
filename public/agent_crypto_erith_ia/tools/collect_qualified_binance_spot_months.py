#!/usr/bin/env python3
"""Native Binance Spot monthly 1m backfill for independently named Top250 owners.

Reuses the protected Binance verifier, immutable GitHub Releases and canonical
Top250 federation; never writes to Trader/Interface or invents candles.
Binance official Spot announcements independently attest each name/pair,
including the documented Render/Polygon migrations.
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
import orchestrate_historical_bulk as original
import supplement_historical_bulk as supplement

ROOT=bulk.ROOT/"data/historical_archive_prototype"
FEDERATED=ROOT/"top250_multisource_coverage/index.json"
MAX_MONTHS=12
REPO="BlueAzur-Hub/erith-ia-memory"
SPECS=(
 # CoinGecko exact ID, symbol, rank on frozen Top250, first entire plausible
 # Binance Spot month, official project/market evidence (not ticker guesses).
 ("jupiter-exchange-solana","JUP",70,"2024-02",
  "https://www.binance.com/en/support/announcement/detail/7b5c643c3d8a4c9a9d443b1ceefb0015"),
 ("polygon-ecosystem-token","POL",76,"2024-10",
  "https://www.binance.com/en/support/announcement/detail/6a6de383727f4659a3050f7982e1620f"),
 ("render-token","RENDER",81,"2024-08",
  "https://www.binance.com/en/support/announcement/detail/d1f2ae8d99b24439a7a900caa9bb6b3b"),
 ("pancakeswap-token","CAKE",95,"2021-01",
  "https://www.binance.com/en/support/announcement/detail/0f5870aecd574798a729cf6147da87a8"),
 ("jito-governance-token","JTO",159,"2024-01",
  "https://www.binance.com/en/support/announcement/detail/6282d0aaa23040b6a68c1b9ad9fc3e74"),
 ("conflux-token","CFX",162,"2021-04",
  "https://www.binance.com/en/support/announcement/detail/cd4d635399374a68ace90874ce8b9eb2"),
 ("eigenlayer","EIGEN",181,"2024-11",
  "https://www.binance.com/en/support/announcement/detail/29494a3db1034233b65522b9e122d079"),
 ("dogwifcoin","WIF",183,"2024-04",
  "https://www.binance.com/en/support/announcement/detail/90ad67fe5be7483ea058191bfde677e4"),
)
MAX_PAGES=100
MSTAMP=re.compile(r"^20\d\d-(?:0[1-9]|1[0-2])$")

def need(ok,message):
    if not ok:raise ValueError(message)

def owners(fed):
    need(fed.get("schema")=="aerith.public.ohlcv.top250.federated-native-archives.v1"
         and fed.get("ranked")==250 and fed.get("assets")
         and len(fed["assets"])==250 and
         len({a["id"] for a in fed["assets"]})==250,
         "Frozen ranked identity source changed")
    indexed={x["id"]:x for x in fed["assets"]}
    chosen=[]
    for cid,symbol,rank,first,link in SPECS:
        need(cid in indexed and MSTAMP.fullmatch(first) is not None and
             link.startswith("https://www.binance.com/en/support/announcement/detail/"),
             "Unverified exact-ID proof")
        a=indexed[cid]
        need(a["rank"]==rank and a["symbol"]==symbol
             and (a["months"]==0 and a["source"] is None or
                  a["months"]>0 and a["source"]=="Binance Spot official native 1m ZIPs")
             and a["quote"]=="USDT" and bulk.PAIR.fullmatch(symbol+"USDT") is not None,
             "Rank, pair, owner or quote has changed: "+cid)
        chosen.append({"id":cid,"rank":rank,"symbol":symbol,"pair":symbol+"USDT",
                       "archive_owner":"official-binance-spot-project-attestation",
                       "first_full_month":first,"official_listing":link})
    need(len(chosen)==len(SPECS)==len({a["pair"] for a in chosen}),
         "Duplicate owner or Spot source pair")
    return sorted(chosen,key=lambda x:x["rank"])

def all_release_tags():
    found=set()
    for page in range(1,MAX_PAGES+1):
        p=subprocess.run(["gh","api",f"repos/{REPO}/releases?per_page=100&page={page}"],
                         capture_output=True,text=True,check=True,timeout=90)
        rows=json.loads(p.stdout)
        need(isinstance(rows,list) and len(rows)<=100,"Malformed Release registry")
        for x in rows:
            tag=x.get("tag_name")
            need(isinstance(tag,str) and isinstance(x.get("draft"),bool),
                 "Unknown immutable Release state")
            need(tag not in found,"Duplicate Release tag")
            if not x["draft"]:found.add(tag)
        if len(rows)<100:return found
    raise ValueError("Truncated Release registry: refuse duplicate publication")

def select(fed,tags,now=None,limit=MAX_MONTHS):
    need(1<=limit<=MAX_MONTHS,"Excessive native ZIP batch size")
    universe=owners(fed)
    now=now or dt.datetime.now(dt.timezone.utc)
    last=original.last_publishable(now)
    oldest=min(x["first_full_month"] for x in universe)
    selected=[]
    month=last
    while month>=oldest and len(selected)<limit:
        eligible=[a for a in universe if month>=a["first_full_month"]]
        tag=supplement.add_tag(month,eligible) if eligible else None
        if eligible and tag not in tags:
            selected.append({"month":month,"assets":eligible,"tag":tag})
        month=original.month_before(month)
    return selected

def publish_one(job,fetcher=bulk.execute,writer=supplement.publish):
    month,qualified=job["month"],job["assets"]
    with tempfile.TemporaryDirectory(prefix="seven-real-batch-") as td:
        folder=Path(td)
        manifest=fetcher(month,"1m",folder,workers=4,
                         limit=len(qualified),assets=qualified)
        verified=original.verify_month_output(folder,manifest,qualified,month)
        provenance={a["id"]:{"pair":a["pair"],"first_full_month":a["first_full_month"],
                             "official_listing":a["official_listing"]}
                    for a in qualified}
        manifest["exact_id_official_listing_evidence"]=provenance
        manifest["source_discovery_mode"]="historically_qualified_spot"
        for a in manifest["assets"]:
            if a["status"]=="unavailable":
                marker=folder/(a["pair"]+"-1m-"+month+".unavailable.json")
                need(not marker.exists(),"Duplicate unavailable proof")
                marker.write_text(json.dumps({
                    "schema":"aerith.public.ohlcv.spot.bulk-monthly.unavailable.v1",
                    "asset_id":a["asset_id"],"pair":a["pair"],
                    "month":month,"interval":"1m",
                    "status":"unavailable","source":"Binance Spot native 1m",
                    "reason":a.get("reason","source incomplete"),
                    "no_synthetic_candles":True},sort_keys=True)+"\n")
        (folder/"manifest.json").write_text(
            json.dumps(manifest,indent=2,sort_keys=True)+"\n")
        url=writer(month,folder,manifest,qualified)
        return {"month":month,"release":job["tag"],"url":url,
                "verified_assets":manifest["verified"],
                "unavailable_assets":manifest["unavailable"],
                "native_1m_candles":verified}

def main():
    p=argparse.ArgumentParser(description=__doc__)
    mode=p.add_mutually_exclusive_group(required=True)
    mode.add_argument("--plan",action="store_true")
    mode.add_argument("--probe",action="store_true")
    mode.add_argument("--collect",action="store_true")
    p.add_argument("--months",type=int,default=MAX_MONTHS)
    a=p.parse_args()
    need(1<=a.months<=MAX_MONTHS,"Unsafe collection size")
    fed=json.loads(FEDERATED.read_text())
    selected=owners(fed)
    if a.plan:
        print("QUALIFIED SPOT IMPORT PLAN "+json.dumps({
            "assets":[{"id":x["id"],"pair":x["pair"],
                       "official_listing":x["official_listing"]} for x in selected],
            "max_months":a.months,"published":0},sort_keys=True))
        return
    if a.probe:
        # The PR's real-network source proof is the exact same import engine,
        # without any Releases or federation mutation.
        with tempfile.TemporaryDirectory(prefix="qualified-native-proof-") as td:
            m=bulk.execute(original.last_publishable(dt.datetime.now(dt.timezone.utc)),
                           "1m",Path(td),workers=4,limit=len(selected),assets=selected)
        need(m["verified"]==len(selected),
             "Not all independently qualified Spot archives passed native SHA/full-month checks")
        print("QUALIFIED SPOT NETWORK VERIFIED "+json.dumps({
            "month":m["month"],"owners":[x["asset_id"] for x in m["assets"]],
            "candles":m["candles"],"published":False},sort_keys=True))
        return
    need(os.environ.get("GITHUB_ACTIONS")=="true" and os.environ.get("GH_TOKEN")
         and os.environ.get("GITHUB_SHA")
         and os.environ.get("GITHUB_REPOSITORY")==REPO,
         "Official native releases may only be published from authorized GitHub Actions")
    jobs=select(fed,all_release_tags(),limit=a.months)
    result=[]
    for job in jobs:
        # Recheck the exact immutable checkpoint immediately before writing.
        check=subprocess.run(["gh","release","view",job["tag"],"--json","tagName"],
                              capture_output=True,text=True,timeout=40)
        if check.returncode==0:
            print("QUALIFIED SPOT ALREADY PUBLISHED "+job["tag"],flush=True)
            continue
        msg=(check.stderr or check.stdout).lower()
        need("not found" in msg or "http 404" in msg,
             "Release registry error is not a proved missing tag")
        row=publish_one(job)
        result.append(row)
        print("QUALIFIED SPOT VERIFIED RELEASE "+json.dumps(row,sort_keys=True),flush=True)
    print("QUALIFIED SPOT BULK SUMMARY "+json.dumps({
        "planned":len(jobs),"published":len(result),
        "source_verified_owners":len(selected),
        "new_month_candles":sum(x["native_1m_candles"] for x in result),
        "archive_publications":result,"catalog_updated":False,
        "fed_count_unmodified_in_this_run":True},sort_keys=True),flush=True)

if __name__=="__main__":main()
