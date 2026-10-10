#!/usr/bin/env python3
"""Proof-only union of native Binance/Bitget monthly SPOT 1m ZIP archives.

Never converts USDT to USD, fabricates unavailable candles or changes the
canonical Binance reader. A separate source family is counted only after
both exact-ID market proof and independent ZIP SHA/CSV continuity checks.
"""
from __future__ import annotations

import argparse
import calendar
import csv
from decimal import Decimal, InvalidOperation
import hashlib
import io
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
import zipfile

from probe_native_bitget_spot import CATALOG, EXACT, INSTRUMENTS
from build_historical_year_depth import spans

ROOT=CATALOG.parent
OUTPUT=ROOT/"top250_verified_multisource_index.json"
RELEASE_RE=re.compile(r"^crypto-spot-bitget-(20\d{2}-(?:0[1-9]|1[0-2]))-1m-([a-z0-9-]{2,100})$")
SOURCE_SCHEMA="aerith.public.ohlcv.spot.bitget-native-month.index.v1"
SCHEMA="aerith.public.ohlcv.top250.multi-source-coverage.v1"
MAX_RELEASES_PER_RUN=24
STEP=60_000

def need(ok,reason):
    if not ok:raise ValueError(reason)

def get_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))

def sha(raw):
    return hashlib.sha256(raw).hexdigest()

def interval(month):
    year,m=map(int,month.split("-"))
    from datetime import datetime,timezone
    start=int(datetime(year,m,1,tzinfo=timezone.utc).timestamp()*1000)
    candles=calendar.monthrange(year,m)[1]*1440
    return start,candles

def authorized(catalog,alt,spot,id,pair):
    by_id={a["id"]:a for a in catalog["assets"]}
    row=by_id.get(id)
    need(row and pair==row["symbol"]+"USDT","Unknown Top250 exact-ID/pair")
    id_proof=next((v for v in alt["results"] if v["id"]==id),None)
    venue=next((v for v in spot["assets"] if v["id"]==id),None)
    need(id_proof and id_proof["status"]=="exact_id_market_candidates"
         and id_proof["rank"]==row["rank"]
         and id_proof["symbol"]==row["symbol"],"CoinGecko-ID proof absent")
    need(any(p.get("coin_id")==id and p.get("exchange")=="bitget"
         and p.get("base")==row["symbol"] and p.get("quote")=="USDT"
         and p.get("market_pair_candidate")==pair
         for p in id_proof.get("markets",[])),
         "Exact-ID Bitget market ownership unproven")
    need(venue and venue["rank"]==row["rank"]
         and venue["symbol"]==row["symbol"]
         and any(p.get("venue")=="bitget"
           and p.get("instrument")==pair and p.get("quote")=="USDT"
           and p.get("exchange_instrument_confirmed") is True
           for p in venue.get("instruments",[])),
         "Independent official Bitget SPOT instrument absent")
    return row

def validate_month(tag,manifest,zip_bytes,catalog,alt,spot):
    match=RELEASE_RE.fullmatch(tag)
    need(match is not None,"Invalid native Bitget release tag")
    month,id=match.groups()
    m=manifest
    need(m.get("schema")==SOURCE_SCHEMA and m.get("month")==month
         and m.get("interval")=="1m" and m.get("venue")=="bitget"
         and m.get("quote")=="USDT" and m.get("no_synthetic_candles") is True
         and m.get("native_month_proven") is True
         and m.get("verified")==1 and m.get("requested")==1
         and m.get("unavailable")==0 and len(m.get("assets",[]))==1,
         "Unqualified native Bitget monthly manifest")
    rec=m["assets"][0]
    pair=rec.get("pair")
    owner=authorized(catalog,alt,spot,id,pair)
    expected_start,count=interval(month)
    filename=pair+"-1m-"+month+".zip"
    need(rec.get("asset_id")==id and rec.get("rank")==owner["rank"]
         and rec.get("symbol")==owner["symbol"] and
         rec.get("source")==m.get("source")
         and rec.get("quote")=="USDT"
         and rec.get("status")=="verified"
         and rec.get("month")==month and rec.get("interval")=="1m"
         and rec.get("file")==filename
         and rec.get("candles")==count and m.get("candles")==count
         and rec.get("zip_bytes")==len(zip_bytes)
         and re.fullmatch(r"[a-f0-9]{64}",rec.get("sha256",""))
         and rec["sha256"]==sha(zip_bytes),"Native ZIP checksum/identity mismatch")
    need(0<len(zip_bytes)<12_000_000,"Unexpected ZIP size")
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as archive:
        need(archive.namelist()==[pair+"-1m-"+month+".csv"],
             "ZIP member filename mismatch")
        with archive.open(archive.namelist()[0]) as handle:
            reader=csv.reader(io.TextIOWrapper(handle,encoding="utf-8",newline=""))
            counted=0
            for row in reader:
                need(len(row)==7,"Missing/extra native Bitget source field")
                ts=int(row[0])
                need(ts==expected_start+counted*STEP,
                     "Native candle gap, duplicate, or wrong month")
                try: o,h,l,c,v,q=[Decimal(val) for val in row[1:7]]
                except (InvalidOperation,ValueError) as ex:
                    raise ValueError("Invalid native source OHLCV") from ex
                need(all(x.is_finite() for x in (o,h,l,c,v,q)) and
                     l>0 and l<=min(o,c)<=max(o,c)<=h
                     and v>=0 and q>=0,"Invalid source OHLCV prices/volumes")
                counted+=1
                need(counted<=count,"Too many source minutes")
    need(counted==count,"Incomplete genuine Bitget monthly ZIP")
    return {"month":month,"exchange":"bitget","pair":pair,"quote":"USDT",
            "release":tag,"filename":filename,"sha256":rec["sha256"],
            "native_1m_candles":count,
            "price_origin":"Bitget Spot native USDT",
            "source_columns":7}

def build_index(catalog,bitget):
    need(catalog.get("ranked")==250 and
         len(catalog.get("assets",[]))==250 and
         catalog.get("quote")=="USDT","Canonical Top250 invalid")
    groups={}
    for item in bitget:
        key=(item["id"],item["month"])
        need(key not in groups,"Repeated source Bitget monthly ZIP")
        groups[key]=item
    rows=[];total=0;year=0;firsts=0
    for asset in catalog["assets"]:
        id=asset["id"]
        native_binance={m["month"] for m in asset["months"]}
        bm=sorted((v for (asset_id,_),v in groups.items() if asset_id==id),
                  key=lambda x:x["month"])
        months=sorted(native_binance|{m["month"] for m in bm})
        run=spans(months)
        longest=max((len(part) for part in run),default=0)
        row={"id":id,"rank":asset["rank"],"name":asset["name"],
             "symbol":asset["symbol"],"quote":"USDT",
             "binance_verified_months":len(native_binance),
             "bitget_verified_months":len(bm),
             "bitget_proofs":bm,
             "unique_verified_months":len(months),
             "first_verified_month":months[0] if months else None,
             "last_verified_month":months[-1] if months else None,
             "longest_contiguous_months":longest,
             "at_least_one_verified_month":bool(months),
             "at_least_12_consecutive_months":longest>=12,
             "token_creation_date_proven":False,
             "first_exchange_trade_date_proven":False}
        rows.append(row); total+=bool(months);year+=longest>=12
        firsts+=bool(bm) and not native_binance
    need(len(rows)==250 and total>=catalog["archived_assets"],
         "Impossible union count")
    return {"schema":SCHEMA,"ranked":250,"quote":"USDT",
            "assets_with_verified_month":total,
            "assets_with_12_consecutive_months":year,
            "binance_archive_assets":catalog["archived_assets"],
            "bitget_new_distinct_assets":firsts,
            "bitget_verified_months":len(bitget),
            "source":"Immutable verified Binance native ZIP index + separately SHA-checked Bitget Spot ZIPs",
            "one_month_is_not_one_year":True,
            "first_trade_not_proven":True,
            "does_not_replace_binance_readers":True,
            "not_live_prices":True,"assets":rows}

def release_tags():
    cp=subprocess.run(["gh","release","list","--limit","900",
                       "--json","tagName,isDraft,isPrerelease"],
                      capture_output=True,text=True,check=True,timeout=65)
    releases=json.loads(cp.stdout)
    need(len(releases)<900,"Release listing pagination limit reached")
    return sorted((v["tagName"] for v in releases
                   if not v["isDraft"] and not v["isPrerelease"]
                   and RELEASE_RE.fullmatch(v["tagName"])))

def downloaded(tag):
    with tempfile.TemporaryDirectory(prefix="bitget-verified-month-") as tmp:
        subprocess.run(["gh","release","download",tag,"--dir",tmp,
                        "--pattern","manifest.json",
                        "--pattern","*.zip"],check=True,timeout=120,
                       capture_output=True)
        paths=sorted(Path(tmp).iterdir())
        need(len(paths)==2 and len(list(Path(tmp).glob("*.zip")))==1 and
             len(list(Path(tmp).glob("manifest.json")))==1,
             "Release must have one manifest and one immutable source ZIP")
        manifest=get_json(Path(tmp)/"manifest.json")
        zip_path=next(Path(tmp).glob("*.zip"))
        return manifest,zip_path.read_bytes()

def main():
    cli=argparse.ArgumentParser()
    cli.add_argument("--plan",action="store_true")
    cli.add_argument("--build",action="store_true")
    cli.add_argument("--output",type=Path,default=OUTPUT)
    args=cli.parse_args()
    need(args.plan!=args.build,"Choose --plan or --build")
    catalog,alt,spot=[get_json(p) for p in (CATALOG,EXACT,INSTRUMENTS)]
    if args.plan:
        print("VERIFIED MULTISOURCE PLAN "+json.dumps({
           "ranked":250,"binance":catalog["archived_assets"],
           "bitget_additions": "Count only after independent ZIP checks",
           "max_downloads":MAX_RELEASES_PER_RUN},sort_keys=True))
        return
    need(os.environ.get("GH_TOKEN") and os.environ.get("GITHUB_ACTIONS")=="true",
         "Only authorized GitHub Actions can build source release index")
    tags=release_tags()
    need(len(tags)<=MAX_RELEASES_PER_RUN,
         "Too many pending releases; bounded pilot requires expansion")
    validated=[]
    for tag in tags:
        manifest,raw=downloaded(tag)
        checked=validate_month(tag,manifest,raw,catalog,alt,spot)
        id=RELEASE_RE.fullmatch(tag).group(2)
        validated.append({"id":id,**checked})
        print("VERIFIED SECOND-SOURCE MONTH "+tag,flush=True)
    output=build_index(catalog,validated)
    args.output.parent.mkdir(parents=True,exist_ok=True)
    temp=args.output.with_suffix(".tmp")
    temp.write_text(json.dumps(output,sort_keys=True,ensure_ascii=False,indent=2)+"\n")
    temp.replace(args.output)
    print("VERIFIED MULTISOURCE COVERAGE "+json.dumps({
        "total":output["assets_with_verified_month"],
        "one_year":output["assets_with_12_consecutive_months"],
        "bitget_added":output["bitget_new_distinct_assets"],
        "bitget_months":len(validated)},sort_keys=True,flush=True))

if __name__=="__main__":main()
