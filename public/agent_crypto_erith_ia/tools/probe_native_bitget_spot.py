#!/usr/bin/env python3
"""Strict read-only Bitget 1m SPOT source sampling: NOT an archive.

Only assets proven by an exact CoinGecko ID / Bitget ticker AND a separate
official active Spot instrument can be requested. A sample never counts as
a complete 1m month or changes the existing Binance archive.
"""
from __future__ import annotations
import argparse
import datetime as dt
import hashlib
import json
from decimal import Decimal, InvalidOperation
from pathlib import Path
import re
import urllib.error
import urllib.parse
import urllib.request

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/"data/historical_archive_prototype"
CATALOG=BASE/"top250_history_catalog/index.json"
EXACT=BASE/"top250-alt-market-evidence.json"
INSTRUMENTS=BASE/"top250-official-spot-instruments.json"
OUTPUT=BASE/"top250-bitget-native-1m-probe.json"
SCHEMA="aerith.public.ohlcv.spot.bitget.exact-id-native-probe.v1"
API="https://api.bitget.com/api/v3/market/candles"
PAIR=re.compile(r"^[A-Z0-9]{2,30}USDT$")
MONTH="2026-09"
START=dt.datetime(2026,9,29,tzinfo=dt.timezone.utc)
START_MS=int(START.timestamp()*1000)
STEP=60_000
WINDOW=1000
END_MS=START_MS+WINDOW*STEP
MAX_BYTES=800_000
MAX_ASSETS=3

def require(ok,message):
    if not ok:raise ValueError(message)

def candidates(catalog,identity,spot):
    """A public exchange instrument alone is NOT sufficient proof of ownership."""
    require(catalog.get("ranked")==250 and len(catalog.get("assets",[]))==250,
            "Invalid canonical Top250 ranking")
    require(identity.get("schema")==
            "aerith.public.ohlcv.spot.top250.alt-market-discovery.v1",
            "Missing exact-ID CoinGecko Spot market proofs")
    require(spot.get("schema")==
            "aerith.public.ohlcv.spot.top250.official-instrument-candidates.v1",
            "Missing independently confirmed official Spot instrument census")
    idx={a["id"]:a for a in catalog["assets"]}
    check={a["id"]:a for a in spot["assets"]}
    require(len(idx)==250 and identity.get("ranked")==250
            and spot.get("ranked")==250,"Repeated CoinGecko ID or incomplete census")
    result=[]
    for item in identity["results"]:
        cid=item["id"]
        if item.get("status")!="exact_id_market_candidates":
            continue
        asset=idx.get(cid)
        attested=check.get(cid)
        if not asset or not attested or asset["months"]:
            continue
        if asset["rank"]!=item["rank"] or asset["symbol"]!=item["symbol"]:
            continue
        if attested["rank"]!=item["rank"] or attested["symbol"]!=item["symbol"]:
            continue
        expected=asset["symbol"]+"USDT"
        if PAIR.fullmatch(expected) is None:
            continue
        source=any(m.get("coin_id")==cid and m.get("base")==asset["symbol"]
            and m.get("exchange")=="bitget" and m.get("quote")=="USDT"
            and m.get("market_pair_candidate")==expected for m in item.get("markets",[]))
        venue=any(m.get("venue")=="bitget" and m.get("instrument")==expected
            and m.get("base")==asset["symbol"] and m.get("quote")=="USDT"
            and m.get("exchange_instrument_confirmed") is True
            for m in attested["instruments"])
        if source and venue:
            result.append({"id":cid,"rank":asset["rank"],"symbol":asset["symbol"],
                           "pair":expected,"venue":"bitget","quote":"USDT"})
    return sorted(result,key=lambda a:a["rank"])

def fetch(pair, opener=urllib.request.urlopen):
    require(PAIR.fullmatch(pair) is not None,"Unsafe Bitget instrument")
    params=urllib.parse.urlencode({"category":"SPOT","symbol":pair,
        # Bitget uses >startTime and <=endTime for bounded 1m pages.
        # Request one minute before each desired edge; validation still
        # demands the exact intended [START_MS,END_MS) 1000-minute window.
        "interval":"1m","startTime":START_MS-STEP,"endTime":END_MS-STEP,
        "type":"market","limit":WINDOW})
    request=urllib.request.Request(API+"?"+params,headers={
        "User-Agent":"SevenHeaven-VerifiedNativeSpotSampling/1.0",
        "Accept":"application/json"})
    with opener(request,timeout=35) as response:
        require(response.status==200,"Bitget public Spot endpoint HTTP non-200")
        raw=response.read(MAX_BYTES+1)
    require(0<len(raw)<=MAX_BYTES,"Bitget candle response empty or oversized")
    payload=json.loads(raw)
    require(payload.get("code")=="00000"
            and isinstance(payload.get("data"),list),"Bitget candle error")
    return payload,hashlib.sha256(raw).hexdigest()

def normalized_window(rows):
    require(isinstance(rows,list) and 0<len(rows)<=WINDOW,
            "Invalid native 1m window row count")
    seen=set()
    output=[]
    for row in rows:
        require(isinstance(row,list) and len(row)>=7,"Malformed Bitget native Spot row")
        ts=int(row[0])
        require(START_MS<=ts<END_MS and ts%STEP==0 and ts not in seen,
                "Nonexistent, unaligned or repeated native 1m candle")
        seen.add(ts)
        try:
            o,h,l,c,v,q=(Decimal(str(x)) for x in row[1:7])
        except (InvalidOperation,TypeError) as exc:
            raise ValueError("Invalid native decimal OHLCV") from exc
        require(all(x.is_finite() for x in (o,h,l,c,v,q))
                and min(o,h,l,c)>0 and l<=min(o,c)<=max(o,c)<=h
                and v>=0 and q>=0,
                "Invalid native Spot OHLCV range")
        output.append(ts)
    output.sort()
    require(all(b-a==STEP for a,b in zip(output,output[1:])),
            "Missing or duplicated native 1m candle inside sample")
    return {"sample_count":len(output),"first_ms":output[0],
            "last_ms":output[-1],
            "complete_sample_window":len(output)==WINDOW
               and output[0]==START_MS and output[-1]==END_MS-STEP}

def probe(catalog,identity,spot,fetcher=fetch,limit=MAX_ASSETS):
    require(1<=limit<=MAX_ASSETS,"Unsafe source sampling limit")
    chosen=candidates(catalog,identity,spot)[:limit]
    rows=[]
    for a in chosen:
        item={**a,"sample_start_ms":START_MS,"sample_end_exclusive_ms":END_MS,
              "full_native_1m_month_verified":False,"status":"source_unavailable"}
        payload=None
        try:
            payload,sha=fetcher(a["pair"])
            item["response_sha256"]=sha
            # Bounded timestamp diagnostics only. Never store unaudited rows
            # or classify out-of-window candles as authentic source history.
            raw=payload.get("data",[])
            if isinstance(raw,list):
                times=[]
                for row in raw[:WINDOW]:
                    try:
                        if isinstance(row,list) and row:
                            times.append(int(row[0]))
                    except (ValueError,TypeError,OverflowError):
                        pass
                item["observed_row_count"]=len(raw)
                if times:
                    item["observed_first_ms"]=min(times)
                    item["observed_last_ms"]=max(times)
                    item["observed_in_window"]=sum(START_MS<=t<END_MS and t%STEP==0
                                                  for t in times)
            measured=normalized_window(raw)
            item.update(measured)
            item["status"]=("sample_window_complete" if measured["complete_sample_window"]
                            else "sample_partial_not_archived")
        except (OSError,ValueError,TypeError,OverflowError,json.JSONDecodeError,
                urllib.error.URLError) as exc:
            item["reason"]=(type(exc).__name__+": "+str(exc))[:180]
        rows.append(item)
        print("NATIVE SAMPLE "+json.dumps({"id":a["id"],"status":item["status"],
              "count":item.get("sample_count",0)},sort_keys=True),flush=True)
    return {"schema":SCHEMA,"venue":"Bitget Spot","quote":"USDT",
            "interval":"1m","sample_month":MONTH,
            "sample_start_ms":START_MS,"sample_end_exclusive_ms":END_MS,
            "exact_id_and_instrument_required":True,
            "full_native_months_archived":0,"is_historical_archive":False,
            "sampled":len(rows),"complete_samples":
              sum(x["status"]=="sample_window_complete" for x in rows),
            "assets":rows,"note":"Source API sample only. No complete monthly candle proof or synthetic fills."}

def main():
    cli=argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--plan",action="store_true")
    cli.add_argument("--probe",action="store_true")
    cli.add_argument("--limit",type=int,default=MAX_ASSETS)
    args=cli.parse_args()
    require(args.plan != args.probe,"Choose --plan or --probe")
    cat=json.loads(CATALOG.read_text())
    identity=json.loads(EXACT.read_text())
    spot=json.loads(INSTRUMENTS.read_text())
    selected=candidates(cat,identity,spot)
    if args.plan:
        print("BITGET EXACT ID PROBE PLAN "+json.dumps({"assets":selected[:args.limit],
            "maximum_sample_candles":WINDOW,"months_archived":0},sort_keys=True))
        return
    result=probe(cat,identity,spot,limit=args.limit)
    OUTPUT.parent.mkdir(parents=True,exist_ok=True)
    tmp=OUTPUT.with_suffix(".tmp")
    tmp.write_text(json.dumps(result,indent=2,sort_keys=True)+"\n")
    tmp.replace(OUTPUT)
    print("BITGET EXACT ID PROBE "+json.dumps({"sampled":result["sampled"],
        "complete_samples":result["complete_samples"],
        "full_native_months_archived":0},sort_keys=True))

if __name__=="__main__":
    main()
