#!/usr/bin/env python3
"""Original Gate/KuCoin Spot 1D OHLCV, exact CoinGecko owner, immutable gzip Release.

A verified venue symbol is NOT enough. Only qualified original CoinGecko IDs,
an independently confirmed active Spot instrument and actual native exchange
OHLCV rows may be archived. Never interpolate gaps, or relabel native USDT/USDC quotes as USD.
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
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

import discover_historical_spot_venues as owners

REPO="BlueAzur-Hub/erith-ia-memory"
BASE=owners.BASE
FED=BASE/"top250_multisource_coverage/index.json"
DAILY=BASE/"top250_multiresolution_sources/index.json"
PROOFS=BASE/"top250-alt-market-evidence.json"
OFFICIAL=BASE/"top250-official-spot-instruments.json"
DAY=86400000
START=int(dt.datetime(2013,1,1,tzinfo=dt.timezone.utc).timestamp()*1000)
END=int(dt.datetime(2026,10,1,tzinfo=dt.timezone.utc).timestamp()*1000)
WINDOW_DAYS=650
MAX_PAGES=24
MAX_CANDLES=5600
MAX_ASSETS=8
MAX_RESPONSE=1100000
SCHEMA="aerith.original-spot-native-daily.verified-source.v1"
MARKETS={
  "gate":"https://api.gateio.ws/api/v4/spot/candlesticks",
  "kucoin":"https://api.kucoin.com/api/v1/market/candles",
}
IDENTITY=re.compile(r"^[a-z0-9-]{2,100}$")
SHA=re.compile(r"^[a-f0-9]{64}$")
PAIR={
  "gate":re.compile(r"^[A-Z0-9]{1,30}_(?:USDT|USDC)$"),
  "kucoin":re.compile(r"^[A-Z0-9]{1,30}-(?:USDT|USDC)$"),
}
# Original KuCoin Spot announcement: trading began 2026-01-16 09:00 UTC.
# Native 1D opens at 00:00 UTC, so accept the genuine Jan 16 first session
# but reject any old/prior-token candles falsely relabeled as ULTIMA.
NAMED_ORIGINAL_SPOT_FIRST_UTC_DAY={
  ("ultima","kucoin","ULTIMA-USDT"):
    int(dt.datetime(2026,1,16,tzinfo=dt.timezone.utc).timestamp()*1000),
  # GUSD is Gate's yield-bearing stablecoin first Spot-listed in Aug 2025,
  # NOT pre-existing Gemini Dollar or another ticker collision.
  ("gusd","gate","GUSD_USDT"):
    int(dt.datetime(2025,8,28,tzinfo=dt.timezone.utc).timestamp()*1000),
}

def verify_named_venue_opening(owner,first_native_day):
    key=(owner.get("id"),owner.get("venue"),owner.get("pair"))
    if key not in NAMED_ORIGINAL_SPOT_FIRST_UTC_DAY:
        return
    need(owners.named_original_spot_proof(
         owner,owner.get("identity_proof")),
         "Original named Spot project owner or immutable listing notice changed")
    need(first_native_day>=NAMED_ORIGINAL_SPOT_FIRST_UTC_DAY[key],
         "Native Spot candles predate the original named project listing")

def need(cond,message):
    if not cond:
        raise ValueError(message)

def candidates(minute,daily,ledger,official):
    """Only independently checked CoinGecko owner and original Spot pair."""
    need(minute.get("schema")=="aerith.public.ohlcv.top250.federated-native-archives.v1"
         and minute.get("ranked")==250 and len(minute.get("assets",[]))==250
         and daily.get("schema")=="aerith.public.crypto.multiresolution-sources.v1"
         and daily.get("asset_count")==len(daily.get("assets",[]))
         and ledger.get("schema")==owners.SCHEMA and ledger.get("ranked")==250
         and official.get("schema")==
             "aerith.public.ohlcv.spot.top250.official-instrument-candidates.v1"
         and official.get("ranked")==250,
         "Untrusted live Top250 or native source provenance inventory")
    universe={a["id"]:a for a in minute["assets"]}
    need(len(universe)==250,"Repeated ranked CoinGecko owners")
    published={a["id"] for a in daily["assets"]}
    proofs={a["id"]:a for a in ledger.get("results",[])}
    instruments={a["id"]:a for a in official.get("assets",[])}
    result=[]
    for cid,m in universe.items():
        if (m["native_1m_count"]>0 or cid in published or
            not IDENTITY.fullmatch(cid)):
            continue
        row=proofs.get(cid)
        inst=instruments.get(cid)
        if (not row or not inst or row.get("status")!="exact_id_market_candidates"
                or row.get("rank")!=m["rank"] or row.get("symbol")!=m["symbol"]
                or inst.get("rank")!=m["rank"]
                or inst.get("symbol")!=m["symbol"]):
            continue
        sources=[]
        for proof in row.get("markets",[]):
            venue=proof.get("exchange")
            if venue not in MARKETS or proof.get("coin_id")!=cid:
                continue
            quote=proof.get("quote")
            if (proof.get("base")!=m["symbol"] or
                quote not in ("USDT","USDC") or m["symbol"]==quote):
                continue
            pair=(m["symbol"]+"_"+quote if venue=="gate"
                  else m["symbol"]+"-"+quote)
            if proof.get("market_pair_candidate")!=pair:
                continue
            if not any(i.get("venue")==venue and i.get("instrument")==pair
                  and i.get("base")==m["symbol"] and i.get("quote")==quote
                  and i.get("exchange_instrument_confirmed") is True
                  for i in inst.get("instruments",[])):
                continue
            # The CoinGecko proof is independently exact-ID, not a venue ticker.
            method=proof.get("proof_method")
            if method=="original_named_spot_listing":
                need(owners.named_original_spot_proof(m,proof),
                     "Original named non-EVM Spot listing does not prove CoinGecko ID")
            elif method is not None:
                need(method=="exact_coin_id_matching_evm_contract"
                     and proof.get("contract_platform") in
                        owners.CHAINS.values()
                     and owners.contract_address(proof.get("contract_address")),
                     "Incorrect original CoinGecko EVM contract proof")
            sources.append({"id":cid,"rank":m["rank"],"symbol":m["symbol"],
                "name":m["name"],"venue":venue,"pair":pair,"quote":quote,
                "identity_proof":proof})
        if sources:
            sources.sort(key=lambda x:(x["quote"]!="USDT",x["venue"]!="gate",x["venue"]))
            result.append(sources[0])
    result.sort(key=lambda x:x["rank"])
    need(len(result)==len({a["id"] for a in result}),
         "Repeated original exact CoinGecko market owner")
    return result

def dec(v):
    need(isinstance(v,str),"Original OHLCV field is not source decimal text")
    try:
        d=Decimal(v)
    except InvalidOperation as exc:
        raise ValueError("Original exchange decimal invalid") from exc
    need(d.is_finite(),"Nonfinite source price or volume")
    return d

def parse_bar(row,venue):
    need(venue in MARKETS and isinstance(row,list) and
         len(row) in ((7,8) if venue=="gate" else (7,)),
         "Wrong original native daily Spot columns")
    need(all(isinstance(x,str) for x in row[:7])
         and row[0].isdigit(),"Nontext original native Spot OHLCV fields")
    stamp=int(row[0])*1000
    need(START<=stamp<END and stamp%DAY==0,
         "Original daily UTC timestamp outside source window")
    if venue=="gate":
        # Gate: seconds, quote volume, close, high, low, open, base volume,
        # optional 'true' closed-window status (cannot archive unfinished bars).
        if len(row)==8:
            need(row[7] in ("true",True),"Original Gate 1D bar not closed")
        o,h,l,c,base,quote=map(dec,(row[5],row[3],row[4],
                                   row[2],row[6],row[1]))
    else:
        # KuCoin: seconds, open, close, high, low, base volume, turnover.
        o,h,l,c,base,quote=map(dec,(row[1],row[3],row[4],
                                   row[2],row[5],row[6]))
    need(min(o,h,l,c)>0 and l<=min(o,c) and max(o,c)<=h
         and min(base,quote)>=0,"Invalid original native OHLCV values")
    return stamp,row

def page(owner,start,end,opener=urlopen):
    venue=owner["venue"]
    pair=owner["pair"]
    need(venue in MARKETS and PAIR[venue].fullmatch(pair)
         and START<=start<end<=END and start%DAY==0 and end%DAY==0
         and (end-start)//DAY<=WINDOW_DAYS,
         "Unsafe native daily source request")
    if venue=="gate":
        args={"currency_pair":pair,"interval":"1d",
              "from":str(start//1000),"to":str(end//1000-1)}
    else:
        args={"symbol":pair,"type":"1day",
              "startAt":str(start//1000),"endAt":str(end//1000-1)}
    req=Request(MARKETS[venue]+"?"+urlencode(args),headers={
        "User-Agent":"SevenHeaven-OriginalSpotNativeDaily/1.0",
        "Accept":"application/json"})
    last=None
    for n in range(3):
        try:
            with opener(req,timeout=45) as response:
                need(response.status==200,"Official daily HTTP error")
                raw=response.read(MAX_RESPONSE+1)
            need(0<len(raw)<=MAX_RESPONSE,"Oversized native API response")
            parsed=json.loads(raw)
            if venue=="gate":
                need(isinstance(parsed,list) and len(parsed)<=1000,
                     "Gate returned an invalid Spot daily response")
                rows=parsed
            else:
                need(isinstance(parsed,dict) and parsed.get("code")=="200000"
                     and isinstance(parsed.get("data"),list)
                     and len(parsed["data"])<=1500,
                     "KuCoin rejected native Spot daily request")
                rows=parsed["data"]
            return rows,hashlib.sha256(raw).hexdigest()
        except (OSError,HTTPError,URLError,TimeoutError,ValueError,
                json.JSONDecodeError) as exc:
            last=exc
            if n<2:
                time.sleep(n+1)
    raise RuntimeError("Original exchange source unavailable: "+
        type(last).__name__+": "+str(last)[:140])

def acquire(owner,getter=page):
    need(owner.get("venue") in MARKETS
         and isinstance(owner.get("pair"),str)
         and PAIR[owner["venue"]].fullmatch(owner["pair"])
         and owner.get("quote") in ("USDT","USDC")
         and owner["pair"]==(owner["symbol"]+("_" if owner["venue"]=="gate" else "-")+owner["quote"])
         and owner["symbol"]!=owner["quote"]
         and IDENTITY.fullmatch(owner.get("id","")),
         "Untrusted exact owner and native quote")
    unique={};responses=[]
    current=END
    for n in range(MAX_PAGES):
        if current<=START:
            break
        first=max(START,current-WINDOW_DAYS*DAY)
        rows,digest=getter(owner,first,current)
        need(isinstance(digest,str) and SHA.fullmatch(digest),
             "Missing native source response SHA-256")
        responses.append(digest)
        seen=set()
        for row in rows:
            need(isinstance(row,list) and len(row)>=1
                 and isinstance(row[0],str) and row[0].isdigit(),
                 "Original native bar timestamp missing")
            stamp=int(row[0])*1000
            if not first<=stamp<current:
                # Boundary bars are never shifted, interpolated or claimed.
                continue
            stamp,native=parse_bar(row,owner["venue"])
            need(stamp not in seen and stamp not in unique,
                 "Repeated native daily timestamp across source pages")
            seen.add(stamp)
            unique[stamp]=native
        need(len(unique)<=MAX_CANDLES,"Unbounded daily history memory")
        current=first
    need(current==START,"Native source paging did not cover historic bound")
    need(bool(unique),"No original native OHLCV candle available")
    dates=sorted(unique)
    verify_named_venue_opening(owner,dates[0])
    span=(dates[-1]-dates[0])//DAY+1
    gaps=span-len(dates)
    need(gaps>=0 and len(dates)<=MAX_CANDLES,
         "Invalid native daily continuity")
    return {
      "schema":SCHEMA,"owner":owner,
      "venue":owner["venue"],"market":owner["pair"],
      "source_api":MARKETS[owner["venue"]],
      "original_quote":owner["quote"],"native_interval":"1D",
      "native_candles":len(dates),
      "earliest_returned_ms":dates[0],"latest_returned_ms":dates[-1],
      "calendar_days_without_source_bars":gaps,
      "query_start_inclusive_ms":START,"query_end_exclusive_ms":END,
      "queried_all_bounded_windows":True,
      "genesis_or_first_trade_proven":False,
      "no_synthetic_candles":True,
      "no_currency_conversion":True,
      "source_response_sha256":responses,
      "source_response_hashes_exchange_signed":False,
      "native_daily_rows":[unique[k] for k in dates],
    }

def pack(data):
    contents=(json.dumps(data,sort_keys=True,ensure_ascii=False,
               separators=(",",":"),allow_nan=False)+"\n").encode()
    return gzip.compress(contents,mtime=0)

def release_tag(cohort):
    names=",".join(x["id"]+"-"+x["venue"]+"-"+x["quote"] for x in cohort)
    digest=hashlib.sha256(names.encode()).hexdigest()[:12]
    return "crypto-gate-kucoin-spot-native-daily-2026-09-"+digest

def unreleased(cohort,chunk=MAX_ASSETS):
    need(1<=chunk<=MAX_ASSETS,"Unbounded source cohort")
    for start in range(0,len(cohort),chunk):
        group=cohort[start:start+chunk]
        tag=release_tag(group)
        prior=subprocess.run(["gh","release","view",tag,"--json","tagName"],
                             capture_output=True,text=True,timeout=35)
        if prior.returncode==0:
            continue
        need("not found" in prior.stderr.lower() or
             "http 404" in prior.stderr.lower(),
             "Prior GitHub immutable release state unknown")
        return group,tag
    return [],None

def probe(group):
    valid=[];unavailable=[]
    for owner in group:
        try:
            source=acquire(owner)
            valid.append(source)
            print("NATIVE ALT DAILY VERIFIED "+json.dumps({
                "id":owner["id"],"venue":owner["venue"],
                "market":owner["pair"],"candles":source["native_candles"],
                "gaps":source["calendar_days_without_source_bars"]},
                sort_keys=True),flush=True)
        except (ValueError,OSError,RuntimeError) as exc:
            unavailable.append({"id":owner["id"],"reason":
                (type(exc).__name__+": "+str(exc))[:160]})
            print("NATIVE ALT DAILY UNAVAILABLE "+
                  json.dumps(unavailable[-1],sort_keys=True),flush=True)
    return valid,unavailable

def publish(valid,unavailable,tag):
    need(bool(valid) and tag.startswith("crypto-gate-kucoin-spot-native-daily-2026-09-")
         and os.environ.get("GITHUB_ACTIONS")=="true"
         and os.environ.get("GITHUB_REPOSITORY")==REPO
         and os.environ.get("GITHUB_REF")=="refs/heads/main"
         and os.environ.get("GITHUB_SHA")
         and os.environ.get("GH_TOKEN"),
         "Only reviewed original GitHub main may publish valid native sources")
    with tempfile.TemporaryDirectory(prefix="native-alt-daily-") as td:
        dest=Path(td)
        entries=[]
        for src in valid:
            owner=src["owner"]
            filename=(owner["id"]+"-"+owner["pair"]+"-1D.json.gz")
            blob=pack(src)
            (dest/filename).write_bytes(blob)
            entries.append({
                "id":owner["id"],"rank":owner["rank"],
                "symbol":owner["symbol"],"venue":owner["venue"],
                "market":owner["pair"],"original_quote":owner["quote"],
                "interval":"1D","native_daily_bars":src["native_candles"],
                "gaps":src["calendar_days_without_source_bars"],
                "first_ms":src["earliest_returned_ms"],
                "last_ms":src["latest_returned_ms"],
                "filename":filename,"bytes":len(blob),
                "sha256":hashlib.sha256(blob).hexdigest()})
        manifest={
            "schema":"aerith.native-spot-daily-release-manifest.v1",
            "source":"Gate/KuCoin official public Spot OHLCV",
            "assets":entries,"unavailable":unavailable,
            "source_responses_exchange_signed":False,
            "quote":(entries[0]["original_quote"] if len({a["original_quote"] for a in entries})==1
                     else "mixed-native-USDT-USDC"),
            "quotes":sorted({a["original_quote"] for a in entries}),
            "native_interval":"1D",
            "no_synthetic_bars":True,"no_currency_conversion":True,
            "not_yet_counted_in_canonical_index":True,
        }
        (dest/"manifest.json").write_text(
            json.dumps(manifest,ensure_ascii=False,indent=2,sort_keys=True)+"\n")
        args=["gh","release","create",tag,
              *(str(dest/a["filename"]) for a in entries),
              str(dest/"manifest.json"),
              "--title","Original Gate KuCoin Spot native historical daily OHLCV",
              "--notes","Verified actual public Spot native daily bars in the explicit original per-asset USDT or USDC quote (NEVER USD), per-source SHA-256 and true source gaps. Neither trade genesis nor completeness before venue listing is asserted; no invented bars or orders. Indexed only after independent download verification.",
              "--target",os.environ["GITHUB_SHA"],"--latest=false"]
        proc=subprocess.run(args,capture_output=True,text=True,timeout=180)
        need(proc.returncode==0,
             "Could not publish genuine native historical Release: "+
             proc.stderr[-350:])
        print("NATIVE ALT DAILY SOURCE RELEASE "+json.dumps({
            "url":proc.stdout.strip(),"tag":tag,"assets":entries,
            "unavailable":unavailable},sort_keys=True),flush=True)

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    switches=parser.add_mutually_exclusive_group(required=True)
    switches.add_argument("--plan",action="store_true")
    switches.add_argument("--probe",action="store_true")
    switches.add_argument("--publish",action="store_true")
    parser.add_argument("--limit",type=int,default=MAX_ASSETS)
    args=parser.parse_args()
    need(1<=args.limit<=MAX_ASSETS,"Unsafe daily cohort limit")
    read=lambda path:json.loads(path.read_text(encoding="utf-8"))
    eligible=candidates(read(FED),read(DAILY),read(PROOFS),read(OFFICIAL))
    if args.plan:
        print("NATIVE ALT SPOT DAILY PLAN "+json.dumps({
            "qualified":len(eligible),"candidates":eligible[:args.limit],
            "published":False},sort_keys=True))
        return
    if args.probe:
        group=eligible[:args.limit]
        if not group:
            print("NATIVE ALT SPOT DAILY NOOP: no exact-ID source cohort")
            return
        valid,failed=probe(group)
        print("NATIVE ALT DAILY PROBE "+json.dumps({
            "real_assets":len(valid),"real_bars":sum(
                x["native_candles"] for x in valid),
            "unavailable":failed,"published":False},sort_keys=True))
        return
    # Publication is idempotent and never overwrites historical Releases.
    need(os.environ.get("GITHUB_ACTIONS")=="true" and
         os.environ.get("GITHUB_REF")=="refs/heads/main",
         "Publication disabled outside reviewed main CI")
    group,tag=unreleased(eligible,args.limit)
    if not group:
        print("NATIVE ALT DAILY NOOP: all eligible cohorts already released")
        return
    valid,failed=probe(group)
    if not valid:
        print("NATIVE ALT DAILY UNAVAILABLE: no genuine rows; no Release")
        return
    # One immutable release records the planned cohort, with only authentic
    # returned owners in the manifest; unavailable sources are never counted.
    publish(valid,failed,tag)

if __name__=="__main__":
    main()
