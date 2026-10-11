#!/usr/bin/env python3
"""Fetch original native Bitget Spot 1D OHLCV for unarchived Top250 assets.

Original public exchange records only. No interpolation, currency conversion,
or inflated 1m Top250 counts. Release payloads are immutable with SHA-256,
but raw Bitget API response digests are NOT exchange-signed proofs.
"""
from __future__ import annotations
import argparse
import datetime as dt
from decimal import Decimal, InvalidOperation
import gzip
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
import time
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

import probe_native_bitget_spot as source_proof

REPO="BlueAzur-Hub/erith-ia-memory"
ENDPOINT="https://api.bitget.com/api/v3/market/history-candles"
DAY=86400000
# 1D Bitget sessions may open at 00:00 UTC or 00:00 UTC+8. Preserve
# native timestamps and distinguish this from OKX native 1Dutc history.
NATIVE_DAY_BOUNDARIES=(0,16*60*60*1000)
START=int(dt.datetime(2017,1,1,tzinfo=dt.timezone.utc).timestamp()*1000)
END=int(dt.datetime(2026,10,1,tzinfo=dt.timezone.utc).timestamp()*1000)
WINDOW_DAYS=80
MAX_PAGES=65
MAX_RESPONSE=250000
MAX_CANDLES=3700
MAX_ASSETS=15
TAG="crypto-bitget-spot-native-daily-2026-09-usdgo-vision"
SCHEMA="aerith.bitget.native-exchange-daily-history.verified-response.v1"
SHA=re.compile(r"^[a-f0-9]{64}$")
PAIR=re.compile(r"^[A-Z0-9]{1,28}USDT$")

def need(cond,msg):
    if not cond: raise ValueError(msg)

def filter_unarchived(candidates,minute,daily):
    """Require the current living 1m + 1D source indexes, not a stale pilot list."""
    need(minute.get("schema")=="aerith.public.ohlcv.top250.federated-native-archives.v1"
         and minute.get("ranked")==250 and len(minute.get("assets",[]))==250
         and daily.get("schema")=="aerith.public.crypto.multiresolution-sources.v1"
         and len(daily.get("assets",[]))==daily.get("asset_count"),
         "Missing canonical top250 source inventories")
    byid={a["id"]:a for a in minute["assets"]}
    existing={a["id"] for a in daily["assets"]}
    need(len(byid)==250 and len(candidates)==len({a["id"] for a in candidates}),
         "Ambiguous exact source owner")
    picked=[]
    for a in candidates:
        m=byid.get(a["id"])
        need(m is not None and m["rank"]==a["rank"] and
             m["symbol"]==a["symbol"] and m["quote"]=="USDT",
             "Rank/quote of exact CoinGecko source changed")
        if m["months"]==0 and a["id"] not in existing:
            picked.append(a)
    need(len(picked)<=250,"Unbounded source cohort")
    return sorted(picked,key=lambda a:a["rank"])

SINGLE_SYMBOL_OWNERS=(
    ("memecore",47,"M"),
    ("united-stables",64,"U"),
    ("build-on",225,"B"),
    ("quack-ai",232,"Q"),
    ("humanity",245,"H"),
)

def single_symbol_candidates(minute,identity,official):
    """One-letter tickers require BOTH real venue proof and exact owner proof.

    The conservative legacy 1m sampler excludes one-letter symbols; this
    separate exact-ID cohort never weakens its validation or changes it.
    """
    need(minute.get("ranked")==250 and len(minute.get("assets",[]))==250
         and identity.get("schema")==
             "aerith.public.ohlcv.spot.top250.alt-market-discovery.v1"
         and official.get("schema")==
             "aerith.public.ohlcv.spot.top250.official-instrument-candidates.v1",
         "Missing original identity and venue evidence")
    catalog={x["id"]:x for x in minute["assets"]}
    proofs={x["id"]:x for x in identity["results"]}
    spots={x["id"]:x for x in official["assets"]}
    need(len(catalog)==250,"Repeated canonical owners")
    result=[]
    for cid,rank,symbol in SINGLE_SYMBOL_OWNERS:
        own=catalog.get(cid);evidence=proofs.get(cid);inst=spots.get(cid)
        need(own and own["rank"]==rank and own["symbol"]==symbol and
             own["quote"]=="USDT" and own["months"]==0 and
             len([a for a in catalog.values() if a["symbol"]==symbol])==1,
             "Unknown or ambiguous single-character CoinGecko owner: "+cid)
        pair=symbol+"USDT"
        need(evidence and evidence["rank"]==rank and
             evidence["symbol"]==symbol and
             evidence["status"]=="exact_id_market_candidates" and
             any(m.get("exchange")=="bitget" and m.get("coin_id")==cid
                 and m.get("base")==symbol and m.get("quote")=="USDT"
                 and m.get("market_pair_candidate")==pair
                 for m in evidence.get("markets",[])),
             "No exact-ID Bitget market proof for "+cid)
        need(inst and inst["rank"]==rank and inst["symbol"]==symbol and
             any(m.get("venue")=="bitget" and m.get("base")==symbol and
                 m.get("quote")=="USDT" and m.get("instrument")==pair and
                 m.get("exchange_instrument_confirmed") is True
                 for m in inst.get("instruments",[])),
             "No independently verified public Bitget Spot instrument: "+cid)
        result.append({"id":cid,"rank":rank,"symbol":symbol,"pair":pair,
                       "venue":"bitget","quote":"USDT"})
    need(len(result)==len(SINGLE_SYMBOL_OWNERS) and
         len({x["pair"] for x in result})==len(result),
         "Repeated original Spot pair")
    return sorted(result,key=lambda a:a["rank"])

NAMED_SPOT_PROOFS=(
  ("usdgo",69,"USDGO","USDGO",
   "https://www.bitget.com/asia/support/articles/12560603859340"),
  ("vision-3",209,"VSN","Vision",
   "https://www.bitget.com/support/articles/12560603845590"),
)

def named_spot_candidates(minute,official,daily=None):
    """CoinGecko exact-ID owner + Bitget named Spot project notice + live instrument."""
    need(minute.get("schema")==
         "aerith.public.ohlcv.top250.federated-native-archives.v1"
         and minute.get("ranked")==250 and len(minute.get("assets",[]))==250
         and official.get("schema")==
         "aerith.public.ohlcv.spot.top250.official-instrument-candidates.v1",
         "Untrusted Top250 or official Bitget Spot inventory")
    known={a["id"]:a for a in minute["assets"]}
    spot={a["id"]:a for a in official["assets"]}
    prior_daily={a["id"] for a in (daily or {}).get("assets",[])}
    need(daily is None or (daily.get("schema")==
             "aerith.public.crypto.multiresolution-sources.v1"
             and len(prior_daily)==daily.get("asset_count")
             and len(prior_daily)==len(daily.get("assets",[]))),
         "Untrusted existing native-daily source owners")
    need(len(known)==250,"Repeated CoinGecko ranked owner")
    selected=[]
    for cid,rank,sym,name,notice in NAMED_SPOT_PROOFS:
        a=known.get(cid)
        need(a and a["rank"]==rank and a["symbol"]==sym
             and a["name"]==name and a["quote"]=="USDT"
             and len([x for x in known.values() if x["symbol"]==sym])==1,
             "Wrong or ambiguous named project CoinGecko identity: "+cid)
        need(notice.startswith("https://www.bitget.com/")
             and "/support/articles/" in notice,
             "Missing original project-named Bitget Spot listing proof")
        # The official candidate census may stop listing already archived
        # owners, especially after the minute federation catches up.
        # Still validate their exact Top250 owner, but never reacquire them.
        if a["months"]>0 or cid in prior_daily:
            continue
        inst=spot.get(cid);pair=sym+"USDT"
        need(inst and inst["rank"]==rank and inst["symbol"]==sym
             and any(x.get("venue")=="bitget"
                     and x.get("base")==sym and x.get("quote")=="USDT"
                     and x.get("instrument")==pair
                     and x.get("exchange_instrument_confirmed") is True
                     for x in inst.get("instruments",[])),
             "No independently confirmed original Bitget Spot pair: "+cid)
        selected.append({"id":cid,"rank":rank,"symbol":sym,"pair":pair,
                         "quote":"USDT","venue":"bitget",
                         "identity_evidence":notice})
    need(len({a["id"] for a in selected})==len(selected)
         and len({a["pair"] for a in selected})==len(selected),
         "Duplicated project Spot identity")
    return selected

def qualified_assets():
    # The old Top250 pilot catalog can lag behind the actual living 1m
    # federation; qualify with the current 250 CoinGecko IDs and ranks.
    minute=json.loads((source_proof.BASE/"top250_multisource_coverage/index.json").read_text())
    official=json.loads(source_proof.INSTRUMENTS.read_text())
    daily=json.loads((source_proof.BASE/"top250_multiresolution_sources/index.json").read_text())
    candidates=named_spot_candidates(minute,official,daily)
    candidates=filter_unarchived(candidates,minute,daily)
    # A strict ranked batch bound limits runtime. Others remain eligible
    # for later verified releases and are never counted as archived.
    candidates=candidates[:MAX_ASSETS]
    for a in candidates:
        need(PAIR.fullmatch(a["pair"]) and a["quote"]=="USDT" and
             a["venue"]=="bitget" and a["rank"]>=1 and a["rank"]<=250,
             "Unsafe Spot identity/quote")
    return candidates

def dec(value):
    need(isinstance(value,str),"Expected source textual decimal")
    try: n=Decimal(value)
    except InvalidOperation as exc: raise ValueError("Invalid native Spot decimal") from exc
    need(n.is_finite(),"Nonfinite source OHLCV")
    return n

def parse_row(row):
    need(isinstance(row,list) and len(row)>=7 and
         all(isinstance(v,str) for v in row[:7]),"Invalid original Bitget daily row")
    stamp=int(row[0])
    need(START<=stamp<END and stamp%DAY in NATIVE_DAY_BOUNDARIES,
         "Not a closed native Bitget Spot daily candle; timestamp="+str(stamp))
    o,h,l,c,v,q=map(dec,row[1:7])
    need(min(o,h,l,c)>0 and l<=min(o,c) and max(o,c)<=h
         and min(v,q)>=0,"Native daily OHLCV invalid")
    return stamp,row[:7]

def request_page(pair,start,end,opener=urlopen):
    need(PAIR.fullmatch(pair) and START<=start<end<=END and
         start%DAY==0 and end%DAY==0 and
         1<=(end-start)//DAY<=WINDOW_DAYS,"Invalid bounded Bitget daily window")
    # Bitget v3 history-candles: original native 1D (not 1m), max 90-day
    # history interval and at most 100 entries. Overlap a boundary day.
    params=urlencode({"category":"SPOT","symbol":pair,"interval":"1D",
        "startTime":str(start-DAY),"endTime":str(end),
        "type":"market","limit":"100"})
    req=Request(ENDPOINT+"?"+params,headers={
        "User-Agent":"SevenHeaven-NativeBitgetHistoricalDaily/1.0",
        "Accept":"application/json"})
    error=None
    for attempt in range(3):
        try:
            with opener(req,timeout=40) as res:
                need(res.status==200,"Native Bitget HTTP status failed")
                raw=res.read(MAX_RESPONSE+1)
            need(0<len(raw)<=MAX_RESPONSE,"Bitget response oversize or empty")
            data=json.loads(raw)
            need(isinstance(data,dict) and data.get("code")=="00000" and
                 isinstance(data.get("data"),list) and len(data["data"])<=100,
                 "Bitget rejected historical native Spot 1D query")
            return data["data"],hashlib.sha256(raw).hexdigest()
        except (OSError,HTTPError,URLError,TimeoutError,ValueError) as exc:
            error=exc
            if attempt<2:time.sleep(attempt+1)
    raise RuntimeError("Original Bitget native 1D source unavailable: "+
                       type(error).__name__+": "+str(error)[:120])

def acquire(owner,fetcher=request_page):
    need(owner["venue"]=="bitget" and owner["quote"]=="USDT"
         and PAIR.fullmatch(owner["pair"]),"Unsafe exact-ID source owner")
    unique={}
    session_modulo=None
    excluded_native_rows=0
    digests=[]
    segments=0
    current=END
    while current>START:
        begin=max(START,current-WINDOW_DAYS*DAY)
        source_rows,sha=fetcher(owner["pair"],begin,current)
        need(SHA.fullmatch(sha),"Missing source-response integrity digest")
        digests.append(sha)
        segment_seen={}
        for row in source_rows:
            # Bitget may return one additional boundary interval. Exclude it
            # without creating or modifying any native source candle.
            need(isinstance(row,list) and row and
                 isinstance(row[0],str) and row[0].isdigit(),
                 "Invalid native source timestamp")
            boundary=int(row[0])
            if boundary<begin or boundary>=current:
                # Bitget sometimes includes rows outside startTime/endTime.
                # Never attach an out-of-window candle to another source
                # interval, even if it is a genuine exchange record.
                excluded_native_rows+=1
                continue
            stamp,native=parse_row(row)
            if session_modulo is None:
                session_modulo=stamp%DAY
            need(stamp%DAY==session_modulo,
                 "Mixed exchange daily opening times: cannot silently normalize")
            need(stamp not in segment_seen,"Repeated native daily timestamp")
            segment_seen[stamp]=native
            need(stamp not in unique,"Overlapping history segment duplicated")
            unique[stamp]=native
        need(len(unique)<=MAX_CANDLES,"Unbounded native daily source")
        segments+=1
        need(segments<=MAX_PAGES,"Exhaustive native pagination budget exhausted")
        current=begin
    need(bool(unique),"No actual native Bitget Spot 1D history")
    stamps=sorted(unique)
    gaps=((stamps[-1]-stamps[0])//DAY+1)-len(stamps)
    need(gaps>=0 and len(stamps)<=MAX_CANDLES,"Malformed daily date coverage")
    return {
        "schema":SCHEMA,"owner":owner,"exchange":"Bitget Spot",
        "market":owner["pair"],"quote":"USDT","native_interval":"1D",
        "utc_start_inclusive_ms":START,"utc_end_exclusive_ms":END,
        "earliest_returned_ms":stamps[0],"latest_returned_ms":stamps[-1],
        "native_candles":len(stamps),"calendar_days_without_native_bars":gaps,
        "native_session_start_modulo_utc_day_ms":session_modulo,
        "covered_query_start_ms":START,
        "historical_source_exhaustion_proven":False,
        "out_of_window_native_rows_excluded":excluded_native_rows,
        "requested_80_day_segments":segments,
        "first_trade_or_genesis_proven":False,
        "native_source_response_sha256":digests,
        "source_response_digests_are_exchange_signed":False,
        "filled_by_our_collector":False,
        "canonical_1m_federation_modified":False,
        "native_daily_timezone_not_normalized":True,
        "source_columns":["timestamp_ms","open","high","low","close",
                          "base_volume","quote_turnover"],
        "native_daily_rows":[unique[t] for t in stamps],
    }

def compress(data):
    blob=(json.dumps(data,sort_keys=True,ensure_ascii=False,
                     separators=(",",":"),allow_nan=False)+"\n").encode()
    return gzip.compress(blob,mtime=0)

def collect(owners):
    good=[]
    failures=[]
    for owner in owners:
        try:
            data=acquire(owner)
            good.append(data)
            print("BITGET NATIVE DAILY VERIFIED "+json.dumps({
                "id":owner["id"],"pair":owner["pair"],"candles":data["native_candles"],
                "first":data["earliest_returned_ms"],
                "last":data["latest_returned_ms"],
                "gaps":data["calendar_days_without_native_bars"],
                "out_of_window":data["out_of_window_native_rows_excluded"]},sort_keys=True),
                flush=True)
        except (ValueError,RuntimeError,OSError) as exc:
            failures.append({"id":owner["id"],
                             "reason":(type(exc).__name__+": "+str(exc))[:180]})
            print("BITGET NATIVE DAILY UNAVAILABLE "+
                  json.dumps(failures[-1],sort_keys=True),flush=True)
    need(len(good)>0,"No native daily source verified; refusing empty release")
    return good,failures

def publish(verified,failures):
    need(os.environ.get("GITHUB_ACTIONS")=="true" and
         os.environ.get("GITHUB_REPOSITORY")==REPO and
         os.environ.get("GITHUB_REF")=="refs/heads/main" and
         os.environ.get("GH_TOKEN") and os.environ.get("GITHUB_SHA"),
         "Native archives are published only by reviewed GitHub Actions")
    prior=subprocess.run(["gh","release","view",TAG,"--json","tagName"],
                         capture_output=True,text=True,timeout=40)
    need(prior.returncode!=0 and
         ("not found" in prior.stderr.lower() or
          "http 404" in prior.stderr.lower()),
         "Release already exists or missing-tag state not confirmed")
    with tempfile.TemporaryDirectory(prefix="bitget-native-1d-") as td:
        folder=Path(td); docs=[]
        for payload in verified:
            name=payload["owner"]["id"]+"-"+payload["market"]+"-1D.json.gz"
            compressed=compress(payload)
            (folder/name).write_bytes(compressed)
            docs.append({"id":payload["owner"]["id"],"rank":payload["owner"]["rank"],
                "pair":payload["market"],"quote":"USDT","interval":"1D",
                "identity_evidence":payload["owner"].get("identity_evidence"),
                "native_daily_count":payload["native_candles"],
                "first_source_ms":payload["earliest_returned_ms"],
                "last_source_ms":payload["latest_returned_ms"],
                "missing_native_days":payload["calendar_days_without_native_bars"],
                "filename":name,"bytes":len(compressed),
                "sha256":hashlib.sha256(compressed).hexdigest()})
        manifest={"schema":"aerith.bitget.native-daily-release-manifest.v1",
            "source":"Bitget public original Spot 1D history-candles",
            "quote":"USDT","interval":"1D","assets":docs,
            "unavailable":failures,"counted_in_canonical_1m_top250":False,
            "new_native_1m_candles":0,"no_synthetic_candles":True,
            "source_digests_are_exchange_signed":False}
        (folder/"manifest.json").write_text(json.dumps(
            manifest,sort_keys=True,ensure_ascii=False,indent=2)+"\n")
        proc=subprocess.run(["gh","release","create",TAG,
            *(str(folder/d["filename"]) for d in docs),
            str(folder/"manifest.json"),
            "--title","Authentic Bitget Spot native daily history · exact-ID Top250",
            "--notes","Original Bitget Spot historical 1D OHLCV in USDT, 2017-01-01 to 2026-09-30 requested range. Native exchange daily session times (often UTC+8) are preserved, NEVER relabelled 1Dutc. Real source timestamps only, missing days preserved; API response SHA-256 per segment. No trade genesis claim. Separate from 1m archives.",
            "--target",os.environ["GITHUB_SHA"],"--latest=false"],
            capture_output=True,text=True,timeout=180)
        need(proc.returncode==0,"Could not publish verified Bitget release: "+
             proc.stderr[-500:])
        print("BITGET NATIVE DAILY RELEASE "+json.dumps({
            "url":proc.stdout.strip(),"assets":docs,"unavailable":failures,
            "catalog_1m_untouched":True},sort_keys=True),flush=True)

def main():
    p=argparse.ArgumentParser(description=__doc__)
    g=p.add_mutually_exclusive_group(required=True)
    g.add_argument("--plan",action="store_true")
    g.add_argument("--probe",action="store_true")
    g.add_argument("--publish",action="store_true")
    opts=p.parse_args()
    owners=qualified_assets()
    if opts.plan:
        print("BITGET DAILY EXACT ID PLAN "+json.dumps({
            "assets":owners,"native_interval":"1D",
            "query_from":"2017-01-01","end_exclusive":"2026-10-01",
            "published":False},sort_keys=True))
        return
    if not owners:
        # An already committed immutable Release must not be re-downloaded or
        # re-created after native 1m catches up or the daily registry is linked.
        print("BITGET NATIVE DAILY NOOP: all qualified owners already archived; "
              "no new release and no synthetic data",flush=True)
        return
    acquired,failed=collect(owners)
    if opts.probe:
        print("BITGET DAILY NETWORK PROBE "+json.dumps({
            "verified":len(acquired),"failed":failed,
            "native_daily_candles":sum(d["native_candles"] for d in acquired),
            "published":False},sort_keys=True))
        return
    publish(acquired,failed)

if __name__=="__main__":
    main()
