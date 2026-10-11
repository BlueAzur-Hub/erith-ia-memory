#!/usr/bin/env python3
"""Import actual Kraken Spot native 1D OHLC for *named* Top250 assets.

This uses the existing Official Spot Census GitHub Actions job, not a parallel
scheduler. A ticker/AssetPairs row alone never identifies a CoinGecko owner:
each allowlisted asset has an original Kraken project-named listing notice,
an exact frozen CoinGecko ID/rank/name/symbol, and a live exact Spot wsname.
Only CLOSED, traded 1D rows may enter an immutable gzip GitHub Release.
Kraken REST OHLC returns up to the last 720 rows, NOT complete trade history.
"""
from __future__ import annotations
import argparse
from decimal import Decimal, InvalidOperation
import datetime as dt
import gzip
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT=Path(__file__).resolve().parents[1]/"data/historical_archive_prototype"
FED=ROOT/"top250_multisource_coverage/index.json"
DAILY=ROOT/"top250_multiresolution_sources/index.json"
OFFICIAL=ROOT/"top250-official-spot-instruments.json"
REPO="BlueAzur-Hub/erith-ia-memory"
DAY=86400000
END=int(dt.datetime(2026,10,1,tzinfo=dt.timezone.utc).timestamp()*1000)
MAX_ASSETS=5
MAX_BYTES=800000
API="https://api.kraken.com/0/public/"
SCHEMA="aerith.kraken.native-daily-historical-original-spot.v1"
# Original Kraken project-named notices, verified independently of Kraken's
# active instrument snapshot. Listed calendar UTC day bounds are fail-closed.
NAMED=(
    # Current MakerDAO MULTI-collateral DAI, not the original
    # Single-Collateral Dai renamed SAI in the dated Kraken migration notice.
    # The source boundary must be after the Dec-2019 upgrade, not
    # a legacy pre-upgrade listing that later became SAI.
    ("dai",27,"DAI","Dai","DAI/USDT","2019-12-02",
     "https://blog.kraken.com/news/kraken-is-supporting-dais-multi-collateral-upgrade"),
    ("euro-coin",116,"EURC","EURC","EURC/USDC","2025-09-18",
     "https://blog.kraken.com/product/asset-listings/eurc-is-available-for-trading"),
    ("sofiusd",139,"SOFID","SoFiUSD","SOFID/USDT","2026-09-04",
     "https://blog.kraken.com/product/asset-listings/sofid-is-available-for-trading"),
    ("apxusd",145,"APXUSD","apxUSD","APXUSD/USDC","2026-04-20",
     "https://blog.kraken.com/product/asset-listings/apxusd-is-available-for-trading"),
    ("cash-4",248,"CASH","CASH","CASH/USDC","2026-01-27",
     "https://blog.kraken.com/product/asset-listings/cash-is-available-for-trading"),
)
def need(ok,msg):
    if not ok: raise ValueError(msg)

def read(path):
    return json.loads(path.read_text(encoding="utf-8"))

def candidate_owners(fed,daily,official):
    need(fed.get("schema")=="aerith.public.ohlcv.top250.federated-native-archives.v1"
         and fed.get("ranked")==250 and len(fed.get("assets",[]))==250
         and daily.get("schema")=="aerith.public.crypto.multiresolution-sources.v1"
         and daily.get("asset_count")==len(daily.get("assets",[]))
         and official.get("schema")==
             "aerith.public.ohlcv.spot.top250.official-instrument-candidates.v1"
         and official.get("ranked")==250,
         "Untrusted ranked owner, native archive or Spot instrument index")
    owner={x["id"]:x for x in fed["assets"]}
    spot={x["id"]:x for x in official["assets"]}
    already={x["id"] for x in daily["assets"]}
    need(len(owner)==250,"Duplicate ranked owner")
    picked=[]
    for cid,rank,symbol,name,pair,listed,notice in NAMED:
        a=owner.get(cid)
        need(a and a["rank"]==rank and a["symbol"]==symbol and
             a["name"]==name and a["quote"]=="USDT" and
             len([x for x in owner.values() if x["symbol"]==symbol])==1 and
             ((notice.startswith("https://blog.kraken.com/product/asset-listings/")
               and notice.endswith("-is-available-for-trading"))
              or (cid=="dai" and notice==
                "https://blog.kraken.com/news/kraken-is-supporting-dais-multi-collateral-upgrade")),
             "Changed named Kraken project original-owner attestation: "+cid)
        if a["native_1m_count"]>0 or cid in already:
            continue
        quote=pair.split("/")[-1]
        inst=spot.get(cid)
        need(quote in ("USDT","USDC") and pair==symbol+"/"+quote
             and inst and inst["rank"]==rank and inst["symbol"]==symbol
             and any(x.get("venue")=="kraken" and
                     x.get("instrument")==pair and
                     x.get("base")==symbol and x.get("quote")==quote and
                     x.get("exchange_instrument_confirmed") is True
                     for x in inst.get("instruments",[])),
             "Kraken original named listing lacks independent active Spot pair: "+cid)
        earliest=int(dt.datetime.fromisoformat(listed).replace(tzinfo=dt.timezone.utc).timestamp()*1000)
        picked.append({"id":cid,"rank":rank,"name":name,"symbol":symbol,
                       "venue":"kraken","pair":pair,"quote":quote,
                       "listed":listed,"first_listed_ms":earliest,
                       "original_named_notice":notice,
                       "coingecko_identity_url":"https://www.coingecko.com/en/coins/"+cid})
    need(len(picked)==len({x["id"] for x in picked}) and
         len(picked)<=MAX_ASSETS,"Duplicate or unbounded source cohort")
    return picked

def public(path,params):
    url=API+path+"?"+urlencode(params)
    req=Request(url,headers={"User-Agent":"SevenHeaven-Original-Kraken-OHLC-1D/1",
                             "Accept":"application/json"})
    with urlopen(req,timeout=24) as resp:
        need(resp.status==200,"Original Kraken source HTTP status not 200")
        raw=resp.read(MAX_BYTES+1)
    need(0<len(raw)<=MAX_BYTES,"Original Kraken source response too large")
    data=json.loads(raw)
    need(isinstance(data,dict) and data.get("error")==[]
         and isinstance(data.get("result"),dict),
         "Kraken returned error or malformed original source")
    return data["result"],hashlib.sha256(raw).hexdigest()

def source_decimal(value):
    need(isinstance(value,str),"Kraken native OHLC not decimal text")
    try: x=Decimal(value)
    except InvalidOperation as ex:
        raise ValueError("Kraken returned malformed source decimal") from ex
    need(x.is_finite(),"Kraken returned non-finite native data")
    return x

def source_rows(rows,owner):
    need(isinstance(rows,list) and 1<=len(rows)<=720,
         "Unbounded or absent Kraken native daily OHLC rows")
    accepted=[]; last=None; zero_trade=0
    for row in rows:
        need(isinstance(row,list) and len(row)==8 and
             type(row[0]) is int and type(row[7]) is int,
             "Incorrect original Kraken native 1D field layout")
        stamp=row[0]*1000
        need(stamp%DAY==0 and stamp>0 and
             (last is None or stamp>last),
             "Kraken native 1D source clock duplicated or out of order")
        last=stamp
        # The public REST response always includes the *current unfinished*
        # bar. Stop at 2026-09-30, never persist an unfinished trading day.
        if stamp>=END:continue
        need(stamp>=owner["first_listed_ms"],
             "Native OHLC predates the original Kraken project listing")
        o,h,l,c,vwap,volume=map(source_decimal,row[1:7])
        n=row[7]
        need(o>0 and h>=max(o,c,l) and l>0 and l<=min(o,c,h)
             and vwap>=0 and volume>=0 and n>=0,
             "Native Kraken OHLC prices or original source volumes invalid")
        if volume==0 or n==0:
            need(volume==0 and n==0,"Inconsistent zero-trade native Kraken day")
            zero_trade+=1
            continue
        accepted.append(row)
    need(bool(accepted),"No closed traded Kraken Spot 1D source rows")
    times=[r[0]*1000 for r in accepted]
    gaps=(times[-1]-times[0])//DAY+1-len(times)
    need(gaps>=0,"Invalid original Kraken source gap count")
    return {"rows":accepted,"bars":len(accepted),"gaps":gaps,
            "zero_trade_days_excluded":zero_trade,
            "first_ms":times[0],"last_ms":times[-1]}

def acquire(owner):
    pair=owner["pair"].replace("/","")
    pairs,phash=public("AssetPairs",{"pair":pair})
    need(len(pairs)==1,"Kraken original instrument not unique")
    instrument=next(iter(pairs.values()))
    need(isinstance(instrument,dict) and
         instrument.get("wsname")==owner["pair"] and
         instrument.get("status")=="online",
         "Kraken current Spot pair differs from approved official instrument")
    data,ohash=public("OHLC",{"pair":pair,"interval":1440})
    keys=[k for k in data if k!="last"]
    need(len(keys)==1 and isinstance(data.get("last"),int),
         "Kraken native OHLC instrument mismatch")
    series=source_rows(data[keys[0]],owner)
    return {**series,"owner":owner,"source_response_sha256":[phash,ohash],
            "native_source_pair_key":keys[0]}

def compressed(src):
    o=src["owner"]
    data={"schema":SCHEMA,"exchange":"Kraken Spot",
          "venue":"kraken","coin_id":o["id"],"rank":o["rank"],
          "name":o["name"],"symbol":o["symbol"],
          "market":o["pair"],"original_quote":o["quote"],
          "native_interval":"1D","earliest_source_ms":src["first_ms"],
          "latest_source_ms":src["last_ms"],
          "native_candles":src["bars"],
          "calendar_days_without_source_bars":src["gaps"],
          "zero_trade_days_excluded":src["zero_trade_days_excluded"],
          "source_api":API+"OHLC","source_instrument_api":API+"AssetPairs",
          "first_listed_ms":o["first_listed_ms"],
          "original_named_spot_notice":o["original_named_notice"],
          "coingecko_identity_url":o["coingecko_identity_url"],
          "source_response_sha256":src["source_response_sha256"],
          "source_response_hashes_exchange_signed":False,
          "original_rows":src["rows"],"no_synthetic_candles":True,
          "no_currency_conversion":True,
          "genesis_or_first_trade_proven":False,
          "source_has_only_last_720_daily_rows":True}
    return gzip.compress(json.dumps(data,sort_keys=True,separators=(",",":")).encode(),mtime=0)

def cohort_tag(cohort):
    payload=json.dumps([(c["id"],c["pair"]) for c in cohort],
                       sort_keys=True).encode()
    return ("crypto-kraken-spot-native-daily-2026-09-"+
            hashlib.sha256(payload).hexdigest()[:12])

def run_cohort(cohort):
    valid=[];failed=[]
    for owner in cohort:
        try:
            result=acquire(owner)
            valid.append(result)
            print("NATIVE KRAKEN VERIFIED "+json.dumps({
                "id":owner["id"],"bars":result["bars"],
                "first_ms":result["first_ms"],"last_ms":result["last_ms"],
                "gaps":result["gaps"],"quote":owner["quote"]}),flush=True)
        except (ValueError,TimeoutError,OSError,KeyError) as exc:
            failed.append({"id":owner["id"],"reason":str(exc)[:300]})
            print("NATIVE KRAKEN UNAVAILABLE "+json.dumps(failed[-1]),flush=True)
    return valid,failed

def release(valid,failed,tag):
    need(bool(valid) and os.environ.get("GITHUB_ACTIONS")=="true"
         and os.environ.get("GITHUB_REPOSITORY")==REPO
         and os.environ.get("GITHUB_REF")=="refs/heads/main"
         and os.environ.get("GITHUB_SHA") and os.environ.get("GH_TOKEN"),
         "Only canonical main Actions may publish original OHLCV")
    with tempfile.TemporaryDirectory(prefix="kraken-original-daily-") as td:
        target=Path(td);entries=[]
        for src in valid:
            o=src["owner"]
            filename=o["id"]+"-"+o["pair"].replace("/","-")+"-1D.json.gz"
            blob=compressed(src)
            (target/filename).write_bytes(blob)
            entries.append({"id":o["id"],"rank":o["rank"],
                 "symbol":o["symbol"],"venue":"kraken","market":o["pair"],
                 "original_quote":o["quote"],"native_bar":"1D",
                 "first_ms":src["first_ms"],"last_ms":src["last_ms"],
                 "bars":src["bars"],"gaps":src["gaps"],"filename":filename,
                 "bytes":len(blob),"sha256":hashlib.sha256(blob).hexdigest()})
        (target/"manifest.json").write_text(json.dumps({
            "schema":"aerith.kraken.verified-native-1d-release-manifest.v1",
            "source":"Kraken Spot original REST OHLC last 720 rows",
            "assets":entries,"unavailable":failed,
            "no_currency_conversion":True,"no_synthetic_bars":True,
            "not_yet_indexed":True},sort_keys=True,indent=2)+"\n")
        cmd=["gh","release","create",tag,
             *(str(target/x["filename"]) for x in entries),
             str(target/"manifest.json"),
             "--title","Kraken original Spot native 1D OHLC provenance",
             "--notes","Real closed Kraken Spot native 1D OHLC only; original USDT/USDC quote and original named project listing. Kraken REST is last 720 daily rows only, not market inception. SHA256 and gaps recorded; canonical index requires separate independent verification.",
             "--target",os.environ["GITHUB_SHA"],"--latest=false"]
        p=subprocess.run(cmd,capture_output=True,text=True,timeout=120)
        need(p.returncode==0,"Kraken source Release failed: "+p.stderr[-350:])
        print("NATIVE KRAKEN SOURCE RELEASE "+json.dumps({
            "url":p.stdout.strip(),"tag":tag,"assets":entries,
            "unavailable":failed},sort_keys=True),flush=True)

def main():
    p=argparse.ArgumentParser(description=__doc__)
    modes=p.add_mutually_exclusive_group(required=True)
    modes.add_argument("--plan",action="store_true")
    modes.add_argument("--probe",action="store_true")
    modes.add_argument("--publish",action="store_true")
    p.add_argument("--limit",type=int,default=MAX_ASSETS)
    args=p.parse_args()
    need(1<=args.limit<=MAX_ASSETS,"Kraken cohort limit exceeded")
    qualified=candidate_owners(read(FED),read(DAILY),read(OFFICIAL))
    cohort=qualified[:args.limit]
    if args.plan:
        print("NATIVE KRAKEN PLAN "+json.dumps({
            "eligible":len(qualified),"selected":cohort,"publishes":False}))
        return
    if not cohort:
        print("NATIVE KRAKEN NOOP: no qualified original Spot owners")
        return
    if args.probe:
        valid,failed=run_cohort(cohort)
        print("NATIVE KRAKEN PROBE "+json.dumps({
            "valid":len(valid),"native_daily_bars":sum(x["bars"] for x in valid),
            "unavailable":failed,"published":False}),flush=True)
        return
    need(os.environ.get("GITHUB_ACTIONS")=="true" and
         os.environ.get("GITHUB_REF")=="refs/heads/main",
         "Kraken immutable Release publication disabled outside main CI")
    tag=cohort_tag(cohort)
    r=subprocess.run(["gh","release","view",tag],capture_output=True,text=True,timeout=30)
    if r.returncode==0:
        print("NATIVE KRAKEN NOOP: existing immutable "+tag,flush=True)
        return
    valid,failed=run_cohort(cohort)
    if not valid:
        print("NATIVE KRAKEN UNAVAILABLE: no genuine OHLCV; no Release",flush=True)
        return
    release(valid,failed,tag)

if __name__=="__main__":
    main()
