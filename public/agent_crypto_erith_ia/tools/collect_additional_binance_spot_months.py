#!/usr/bin/env python3
"""Recover certified Binance Spot 1m months for Stacks, Compound, Theta Network.

Separate immutable cohort from the eight-owner monthly group; never repeat
its releases. Uses exact CoinGecko Top250 IDs and Binance named Spot pages.
"""
from __future__ import annotations
import argparse
import datetime as dt
import json
import os
import subprocess
from pathlib import Path
import tempfile

import import_historical_bulk as bulk
import collect_qualified_binance_spot_months as main_batch
import supplement_historical_bulk as supplement
import orchestrate_historical_bulk as original

ROOT=bulk.ROOT/"data/historical_archive_prototype"
FED=ROOT/"top250_multisource_coverage/index.json"
REPO="BlueAzur-Hub/erith-ia-memory"
MAX_MONTHS=12
SPECS=(
 ("blockstack","Stacks","STX",91,
  "https://www.binance.com/en/trade/STX_USDT"),
 ("compound-governance-token","Compound","COMP",166,
  "https://www.binance.com/en/trade/COMP_USDT"),
 ("theta-token","Theta Network","THETA",176,
  "https://www.binance.com/en/trade/THETA_USDT"),
)
FIRST_FULL="2023-01"

def need(ok,msg):
    if not ok:raise ValueError(msg)

def owners(catalog):
    need(catalog.get("schema")=="aerith.public.ohlcv.top250.federated-native-archives.v1"
         and catalog.get("ranked")==250 and len(catalog.get("assets",[]))==250,
         "Missing ranked CoinGecko identity")
    byid={a["id"]:a for a in catalog["assets"]}
    need(len(byid)==250,"Duplicate CoinGecko identity")
    assets=[]
    for cid,name,symbol,rank,url in SPECS:
        row=byid.get(cid)
        need(row is not None and row.get("name")==name and
             row.get("symbol")==symbol and row.get("rank")==rank and
             row.get("quote")=="USDT" and
             (row.get("months")==0 and row.get("source") is None or
              row.get("months",0)>0 and
              row.get("source")=="Binance Spot official native 1m ZIPs") and
             bulk.PAIR.fullmatch(symbol+"USDT") is not None and
             url=="https://www.binance.com/en/trade/"+symbol+"_USDT",
             "Exchange named Spot owner or exact ID changed: "+cid)
        assets.append({"id":cid,"rank":rank,"symbol":symbol,
                       "pair":symbol+"USDT","archive_owner":
                       "official-binance-named-spot-pair",
                       "first_full_month":FIRST_FULL,"official_listing":url})
    return assets

def select(catalog,tags,now=None,limit=MAX_MONTHS):
    need(1<=limit<=MAX_MONTHS,"Unsafe batch size")
    assets=owners(catalog)
    now=now or dt.datetime.now(dt.timezone.utc)
    current=original.last_publishable(now)
    result=[]
    while current>=FIRST_FULL and len(result)<limit:
        tag=supplement.add_tag(current,assets)
        if tag not in tags:
            result.append({"month":current,"assets":assets,"tag":tag})
        current=original.month_before(current)
    return result

def main():
    p=argparse.ArgumentParser()
    mode=p.add_mutually_exclusive_group(required=True)
    mode.add_argument("--plan",action="store_true")
    mode.add_argument("--probe",action="store_true")
    mode.add_argument("--collect",action="store_true")
    p.add_argument("--months",type=int,default=MAX_MONTHS)
    a=p.parse_args()
    need(1<=a.months<=MAX_MONTHS,"Unsafe batch size")
    cat=json.loads(FED.read_text())
    owned=owners(cat)
    if a.plan:
        print("THREE QUALIFIED OWNERS "+json.dumps({
            "source":"Official Binance named Spot pair",
            "assets":[{"id":x["id"],"pair":x["pair"],
                       "source_page":x["official_listing"]} for x in owned],
            "published":0,"max_months_per_run":a.months},sort_keys=True))
        return
    if a.probe:
        with tempfile.TemporaryDirectory(prefix="seven-triple-source-") as td:
            r=bulk.execute(original.last_publishable(dt.datetime.now(dt.timezone.utc)),
                           "1m",Path(td),workers=3,limit=3,assets=owned)
        need(r["verified"]==3 and r["unavailable"]==0,
             "One named genuine Spot source failed ZIP/SHA/native OHLCV")
        print("THREE QUALIFIED NATIVE SPOT PROOFS "+
              json.dumps({"month":r["month"],"assets":[z["asset_id"] for z in r["assets"]],
                          "candles":r["candles"],"published":False},sort_keys=True))
        return
    need(os.getenv("GITHUB_ACTIONS")=="true" and os.getenv("GH_TOKEN")
         and os.getenv("GITHUB_SHA") and
         os.getenv("GITHUB_REPOSITORY")==REPO,
         "Immutable source write requires authorized GitHub Actions")
    jobs=select(cat,main_batch.all_release_tags(),limit=a.months)
    done=[]
    for job in jobs:
        cp=subprocess.run(["gh","release","view",job["tag"],"--json","tagName"],
                          capture_output=True,text=True,timeout=40)
        if cp.returncode==0:
            continue
        msg=(cp.stderr or cp.stdout).lower()
        need("not found" in msg or "http 404" in msg,
             "Release check transport error")
        row=main_batch.publish_one(job)
        done.append(row)
        print("THREE QUALIFIED NATIVE RELEASE "+json.dumps(row,sort_keys=True),flush=True)
    print("THREE QUALIFIED NATIVE SUMMARY "+json.dumps({
        "planned":len(jobs),"published":len(done),
        "native_1m_candles":sum(x["native_1m_candles"] for x in done),
        "catalog_updated":False,"new_source_owners_verified":len(owned)},
        sort_keys=True),flush=True)

if __name__=="__main__":main()
