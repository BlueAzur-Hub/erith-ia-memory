#!/usr/bin/env python3
"""Truthful Top250 history depth and annual-shard plan, metadata ONLY.

A Top250 identity, a source-proof month, a 12-month contiguous history,
and the first market trade are four different facts. This program never
pretends that the first archived month equals token inception, never
interpolates gaps and never fetches/writes candles.
"""
from __future__ import annotations
import argparse
import datetime as dt
import json
from pathlib import Path
import re

import import_historical_bulk as bulk

HOME=bulk.ROOT/"data/historical_archive_prototype"
CATALOG=HOME/"top250_history_catalog/index.json"
OUTPUT=HOME/"year_depth_index.json"
SCHEMA="aerith.public.ohlcv.top250.verifiable-year-depth.v1"
MONTH=re.compile(r"^20\d{2}-(?:0[1-9]|1[0-2])$")
DIGEST=re.compile(r"^[0-9a-f]{64}$")
RELEASE=re.compile(
    r"^crypto-spot-bulk-(?:20\d{2}-(?:0[1-9]|1[0-2])-1m|"
    r"add-20\d{2}-(?:0[1-9]|1[0-2])-1m-[a-f0-9]{12})$")

def require(ok,reason):
    if not ok:raise ValueError(reason)

def next_month(month):
    require(isinstance(month,str) and MONTH.fullmatch(month),"Invalid month")
    y,m=map(int,month.split("-"))
    return f"{y+(m==12):04d}-{m%12+1:02d}"

def spans(months):
    """Return all maximal contiguous monthly runs without filling any gap."""
    if not months:return []
    items=sorted(months)
    require(len(items)==len(set(items)),"Duplicate verified month")
    out=[[items[0]]]
    for item in items[1:]:
        if next_month(out[-1][-1])==item:
            out[-1].append(item)
        else:
            require(out[-1][-1]<item,"Chronological source error")
            out.append([item])
    return out

def annual_shards(runs):
    """Shard historical references by calendar year AND contiguous sequence."""
    shards=[]
    for span_id,months in enumerate(runs):
        part=[]
        for month in months:
            if part and month[:4]!=part[-1][:4]:
                shards.append({"year":int(part[0][:4]),"span":span_id,
                               "first_month":part[0],"last_month":part[-1],
                               "months":part})
                part=[]
            part.append(month)
        if part:
            shards.append({"year":int(part[0][:4]),"span":span_id,
                           "first_month":part[0],"last_month":part[-1],
                           "months":part})
    return shards

def valid_month(a,entry):
    month=entry.get("month")
    require(isinstance(month,str) and MONTH.fullmatch(month),"Invalid month")
    pair=entry.get("pair")
    require(isinstance(pair,str) and bulk.PAIR.fullmatch(pair)
            and pair==a["symbol"]+"USDT","Spot pair is not the asset symbol")
    require(entry.get("file")==pair+"-1m-"+month+".zip"
            and isinstance(entry.get("sha256"),str)
            and DIGEST.fullmatch(entry["sha256"])
            and isinstance(entry.get("release"),str)
            and RELEASE.fullmatch(entry["release"])
            and entry.get("candles")==bulk.bounds(month,"1m")[1],
            "Monthly ZIP, source digest or one-minute count unverified")

def build(catalog):
    require(catalog.get("schema")=="aerith.public.ohlcv.top250.monthly-coverage-catalog.v1"
            and catalog.get("ranked")==250 and catalog.get("quote")=="USDT"
            and isinstance(catalog.get("assets"),list)
            and len(catalog["assets"])==250,"No canonical 250-identity source")
    assets=catalog["assets"]
    require({a.get("rank") for a in assets}==set(range(1,251))
            and len({a.get("id") for a in assets})==250,
            "Invalid or repeated ranked identity")
    result=[]
    for a in sorted(assets,key=lambda row:row["rank"]):
        entries=a.get("months")
        require(isinstance(entries,list),"Missing monthly records")
        for item in entries:valid_month(a,item)
        months=[x["month"] for x in entries]
        runs=spans(months)
        longest=max((len(x) for x in runs),default=0)
        total=sum(x["candles"] for x in entries)
        require(total==a.get("candles"),"Source minute count mismatch")
        result.append({
            "id":a["id"],"rank":a["rank"],"symbol":a["symbol"],
            "first_verified_closed_month":min(months) if months else None,
            "last_verified_closed_month":max(months) if months else None,
            "verified_months":len(entries),"native_minutes":total,
            "longest_contiguous_months":longest,
            "at_least_12_consecutive_months":longest>=12,
            "at_least_24_consecutive_months":longest>=24,
            "contiguous_runs":[{"first_month":span[0],"last_month":span[-1],
                                "months":len(span)} for span in runs],
            "year_shards":annual_shards(runs),
            "first_exchange_trade_known":False,
            "token_creation_date_known":False,
            "earliest_possible_price_unverified":True
        })
    archived=sum(x["verified_months"]>0 for x in result)
    count=sum(x["native_minutes"] for x in result)
    require(archived==catalog["archived_assets"]
            and count==catalog["native_1m_candles"],
            "Canonical archive totals mismatch")
    year=sum(x["at_least_12_consecutive_months"] for x in result)
    two=sum(x["at_least_24_consecutive_months"] for x in result)
    return {
        "schema":SCHEMA,"ranked":250,"source":"Verified Binance Spot monthly ZIP catalog",
        "quote":"USDT","source_catalog_minutes":count,
        "archive_assets":archived,
        "assets_with_at_least_12_consecutive_closed_months":year,
        "assets_with_at_least_24_consecutive_closed_months":two,
        "assets_without_verified_year":250-year,
        "month_is_not_token_creation_date":True,
        "earliest_trade_date_not_inferred":True,
        "purpose":"Existing certified 1m months, truthful 12-month readiness, and annual chunk planning; not a synthetic first-trade series.",
        "assets":result}

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--catalog",type=Path,default=CATALOG)
    p.add_argument("--output",type=Path,default=OUTPUT)
    p.add_argument("--plan",action="store_true")
    args=p.parse_args()
    index=build(json.loads(args.catalog.read_text(encoding="utf-8")))
    summary={key:index[key] for key in (
       "ranked","archive_assets","assets_with_at_least_12_consecutive_closed_months",
       "assets_with_at_least_24_consecutive_closed_months",
       "assets_without_verified_year")}
    if args.plan:
        print("TRUE ONE-YEAR HISTORICAL COVERAGE "+
              json.dumps(summary,sort_keys=True),flush=True)
        return
    args.output.parent.mkdir(parents=True,exist_ok=True)
    temp=args.output.with_suffix(".tmp")
    temp.write_text(json.dumps(index,ensure_ascii=False,indent=2,
                               sort_keys=True)+"\n",encoding="utf-8")
    temp.replace(args.output)
    print("TRUE ONE-YEAR HISTORICAL COVERAGE "+
          json.dumps(summary,sort_keys=True),flush=True)

if __name__=="__main__":
    main()
