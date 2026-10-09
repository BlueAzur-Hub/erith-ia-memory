#!/usr/bin/env python3
"""Seven Heaven · source-specific CoinGecko ↔ Binance Spot identity proofs.

Load Top250 venue candidate audit, query CoinGecko by EXACT coin ID and Binance
exchange, verify pair + market + quote and exclude stale/anomalous records.
Persist bounded batches. Network failures NEVER grant approval. The existing
Binance Spot/USDT archive owners remain untouched.
"""
from __future__ import annotations
import argparse
import datetime as dt
import hashlib
import json
from pathlib import Path
import re
import time
import urllib.error
import urllib.parse
import urllib.request

from collect_historical_universe import ROOT
VENUE = ROOT / "data/historical_archive_prototype/top250-venue-audit.json"
OUTPUT = ROOT / "data/historical_archive_prototype/top250-identity-evidence.json"
SCHEMA = "aerith.public.ohlcv.spot.coingecko-binance-identity-evidence.v1"
AUDIT_SCHEMA = "aerith.public.ohlcv.spot.discovery.top250.v1"
CG = "https://api.coingecko.com/api/v3"
ID = re.compile(r"^[a-z0-9-]{2,100}$")
PAIR = re.compile(r"^[A-Z0-9]{2,22}USDT$")
SHA = re.compile(r"^[0-9a-f]{64}$")
STEP_SECONDS = 7
MAX_BATCH = 12
MAX_PAGES = 3
USER_AGENT = "SevenHeaven-CoinGecko-Spot-Identity/1.0"

def need(ok, reason):
    if not ok:
        raise ValueError(reason)

def sha(raw):
    return hashlib.sha256(raw).hexdigest()

def load_audit(path=VENUE):
    raw=path.read_bytes()
    need(0<len(raw)<=2_000_000,"Venue audit oversized")
    doc=json.loads(raw)
    need(doc.get("schema")==AUDIT_SCHEMA and
         doc.get("total_ranked")==250 and len(doc.get("assets",[]))==250,
         "Venue audit incomplete")
    ranks=set()
    for a in doc["assets"]:
        need(a["rank"] not in ranks and
             isinstance(a["id"],str) and ID.fullmatch(a["id"]) and
             isinstance(a["status"],str),"Invalid venue audit")
        ranks.add(a["rank"])
    need(ranks==set(range(1,251)),"Top250 incomplete ranks")
    return doc,sha(raw)

def candidates(doc):
    result=[]
    for a in doc["assets"]:
        if a["status"]!="spot_candidate_identity_unverified":
            continue
        need(ID.fullmatch(a["id"]) and
             PAIR.fullmatch(a["proposed_pair"]) and
             a["proposed_pair"]==a["symbol"]+"USDT",
             "Unsafe unverified pair candidate")
        result.append(a)
    return result

def extract(tickers, asset):
    """Only positive source evidence for the exact CoinGecko ID and Binance Spot pair."""
    need(isinstance(tickers, list),"CoinGecko tickers malformed")
    matching=[]
    for t in tickers:
        if not isinstance(t,dict):continue
        market=t.get("market") or {}
        if not isinstance(market,dict):continue
        if (market.get("identifier")!="binance" or
            t.get("base")!=asset["symbol"] or t.get("target")!="USDT"):
            continue
        if t.get("coin_id") not in (None,asset["id"]):continue
        if t.get("target_coin_id") not in (None,"tether"):continue
        if t.get("is_anomaly") is True or t.get("is_stale") is True:continue
        if t.get("trust_score")=="red":continue
        url=t.get("trade_url")
        # No trading / URL opening; retained as evidence only.
        matching.append({"coin_id":asset["id"],
                         "base":asset["symbol"],"target":"USDT",
                         "market_identifier":"binance",
                         "ticker_coin_id":t.get("coin_id"),
                         "trade_url":url if isinstance(url,str) and url.startswith("https://") else None,
                         "trust_score":t.get("trust_score")})
    return matching

def get_tickers(coin_id, page):
    need(ID.fullmatch(coin_id) and 1<=page<=MAX_PAGES, "Unsafe CoinGecko request")
    params=urllib.parse.urlencode({"exchange_ids":"binance","page":page})
    url=f"{CG}/coins/{coin_id}/tickers?{params}"
    req=urllib.request.Request(url,headers={"User-Agent":USER_AGENT,
       "Accept":"application/json"})
    with urllib.request.urlopen(req,timeout=22) as response:
        need(response.status==200,"CoinGecko returned non-200")
        raw=response.read(1_500_001)
        need(0<len(raw)<=1_500_000,"CoinGecko response too large")
        body=json.loads(raw)
        need(isinstance(body.get("tickers"),list),"CoinGecko response not tickers")
        return body["tickers"]

def inspect_asset(asset,fetcher=get_tickers):
    found=[]
    try:
        for page in range(1,MAX_PAGES+1):
            tickers=fetcher(asset["id"],page)
            found.extend(extract(tickers,asset))
            if len(tickers)<100:
                return {"status":"approved_coingecko_binance_spot" if found else "identity_not_confirmed",
                        "evidence":found[:5],"pages":page}
        # Never assert absence if upstream pagination was truncated.
        return {"status":"source_pagination_incomplete","evidence":[],"pages":MAX_PAGES}
    except (ValueError,OSError,urllib.error.HTTPError,urllib.error.URLError,
            TimeoutError,RuntimeError,json.JSONDecodeError) as exc:
        return {"status":"source_unavailable","evidence":[],
                "reason":(type(exc).__name__+": "+str(exc))[:180]}

def validate_ledger(doc,audit):
    need(doc.get("schema")==SCHEMA and isinstance(doc.get("results"),list)
         and len(doc["results"])<=96,"Identity ledger malformed")
    byid={a["id"]:a for a in candidates(audit)}
    seen=set()
    for e in doc["results"]:
        aid=e.get("id")
        need(aid in byid and aid not in seen and
             e.get("pair")==byid[aid]["proposed_pair"] and
             e.get("rank")==byid[aid]["rank"] and
             e.get("status") in ("approved_coingecko_binance_spot",
                                 "identity_not_confirmed","source_unavailable",
                                 "source_pagination_incomplete"),
             "Stored identity evidence no longer matches current Top250")
        if e["status"]=="approved_coingecko_binance_spot":
            need(isinstance(e.get("evidence"),list) and len(e["evidence"])>0 and
                all(x["coin_id"]==aid and x["base"]==byid[aid]["symbol"] and
                    x["target"]=="USDT" and x["market_identifier"]=="binance"
                    for x in e["evidence"]),"Stored approval without exact identity")
        seen.add(aid)

def process(audit,existing=None,batch_size=MAX_BATCH,fetcher=get_tickers,
            delay=STEP_SECONDS,now=None):
    need(1<=batch_size<=MAX_BATCH,"Unbounded identity verification batch")
    queued=candidates(audit)
    ledger=existing or {"schema":SCHEMA,"results":[]}
    validate_ledger(ledger,audit)
    previous={x["id"]:x for x in ledger["results"]}
    # Retry only source failures. Negative identity evidence is not silently reversed.
    todo=[a for a in queued if a["id"] not in previous or
          previous[a["id"]]["status"] in ("source_unavailable","source_pagination_incomplete")]
    todo=todo[:batch_size]
    results=[]
    for i,a in enumerate(todo):
        if i and delay>0:time.sleep(delay)
        evidence=inspect_asset(a,fetcher)
        out={"id":a["id"],"rank":a["rank"],"symbol":a["symbol"],
             "pair":a["proposed_pair"],"checked_at":now or dt.datetime.now(dt.timezone.utc).isoformat(),**evidence}
        previous[a["id"]]=out
        results.append(out)
        print("IDENTITY "+json.dumps({"id":out["id"],"rank":out["rank"],"status":out["status"],"pages":out.get("pages")},sort_keys=True),flush=True)
    merged=sorted(previous.values(),key=lambda x:x["rank"])
    new={"schema":SCHEMA,"source":"CoinGecko exact coin ID /coins/{id}/tickers?exchange_ids=binance",
         "quote":"USDT","total_market_ranked":250,
         "candidate_count":len(queued),"checked_count":len(merged),
         "approved_count":sum(x["status"]=="approved_coingecko_binance_spot" for x in merged),
         "review_required_count":len(queued)-sum(x["status"]=="approved_coingecko_binance_spot" for x in merged),
         "results":merged,
         "note":"Only a Binance Spot ticker linked to the exact CoinGecko ID counts. This is an identity qualification ledger, NOT newly archived OHLCV."}
    validate_ledger(new,audit)
    return new,results

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--venue",type=Path,default=VENUE)
    p.add_argument("--ledger",type=Path,default=OUTPUT)
    p.add_argument("--batch-size",type=int,default=12)
    p.add_argument("--sleep",type=float,default=STEP_SECONDS)
    p.add_argument("--output",type=Path,default=None)
    p.add_argument("--plan",action="store_true")
    p.add_argument("--probe",action="store_true")
    a=p.parse_args()
    need(not(a.plan and a.probe) and (a.plan or a.probe),"Select --plan or --probe")
    audit,digest=load_audit(a.venue)
    previous=json.loads(a.ledger.read_text()) if a.ledger.is_file() else None
    if previous:validate_ledger(previous,audit)
    if a.plan:
        done={x["id"]:x["status"] for x in (previous or {}).get("results",[])}
        waiting=sum(x["id"] not in done for x in candidates(audit))
        print(json.dumps({"mode":"OFFLINE_IDENTITY_PLAN","market":250,
             "candidates":len(candidates(audit)),"pending":waiting,
             "checked":len(done),"audit_sha256":digest},sort_keys=True))
        return
    need(0<=a.sleep<=30,"Unsafe API delay")
    ledger,attempts=process(audit,previous,a.batch_size,delay=a.sleep)
    target=a.output or a.ledger
    target.parent.mkdir(parents=True,exist_ok=True)
    tmp=target.with_suffix(".tmp")
    tmp.write_text(json.dumps(ledger,indent=2,ensure_ascii=False,sort_keys=True)+"\n")
    tmp.replace(target)
    print("IDENTITY SUMMARY "+json.dumps({"attempted":len(attempts),"approved":ledger["approved_count"],
           "checked":ledger["checked_count"],"candidates":ledger["candidate_count"]},sort_keys=True))

if __name__=="__main__":
    main()
