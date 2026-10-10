#!/usr/bin/env python3
"""Read-only Top250 exact-ID market discovery: OKX and Bitget, NOT an OHLCV archive."""
from __future__ import annotations
import argparse
import datetime as dt
import json
from pathlib import Path
import re
import time
import urllib.parse
import urllib.request

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/"data/historical_archive_prototype"
VENUE=BASE/"top250-venue-audit.json"
CATALOG=BASE/"top250_history_catalog/index.json"
OUTPUT=BASE/"top250-alt-market-evidence.json"
SCHEMA="aerith.public.ohlcv.spot.top250.alt-market-discovery.v1"
EXCHANGES=("okx","bitget")
QUOTES={"USDT":"tether","USDC":"usd-coin"}
ID=re.compile(r"^[a-z0-9-]{2,100}$")
ALNUM=re.compile(r"^[A-Z0-9]{1,30}$")
MAX_BATCH=12

def require(ok,message):
    if not ok: raise ValueError(message)

def universe(venue=VENUE,catalog=CATALOG):
    v=json.loads(venue.read_text())
    c=json.loads(catalog.read_text())
    require(v.get("total_ranked")==c.get("ranked")==250 and
            len(v.get("assets",[]))==len(c.get("assets",[]))==250,
            "Ranked source incomplete")
    idx={a["id"]:a for a in c["assets"]}
    archived={a["id"] for a in c["assets"] if a["months"]}
    require(len(idx)==len({a["id"] for a in v["assets"]})==250,
            "Repeated source identity")
    queue=[]
    for a in v["assets"]:
        require(a["id"] in idx and a["rank"]==idx[a["id"]]["rank"] and
                a["symbol"]==idx[a["id"]]["symbol"] and ID.fullmatch(a["id"]),
                "Venue/catalog exact ID mismatch")
        queue.append({k:a[k] for k in ("id","rank","symbol","name")})
    return sorted(queue,key=lambda x:x["rank"]),archived

def exact_candidates(tickers,asset,exchange):
    require(exchange in EXCHANGES and isinstance(tickers,list),"Bad exchange response")
    result=[]
    for t in tickers:
        if not isinstance(t,dict):continue
        market=t.get("market") or {}
        base,quote=t.get("base"),t.get("target")
        if not isinstance(market,dict) or market.get("identifier")!=exchange:continue
        if (base!=asset["symbol"] or not isinstance(base,str) or
            not ALNUM.fullmatch(base) or quote not in QUOTES or base==quote):continue
        if t.get("coin_id")!=asset["id"]:continue
        if t.get("target_coin_id") not in (None,QUOTES[quote]):continue
        if t.get("is_anomaly") is True or t.get("is_stale") is True or t.get("trust_score")=="red":
            continue
        pair=base+"-"+quote if exchange=="okx" else base+quote
        evidence={"coin_id":asset["id"],"exchange":exchange,"base":base,
                  "quote":quote,"market_pair_candidate":pair,
                  "exchange_instrument_confirmed":False,
                  "native_1m_month_confirmed":False}
        if evidence not in result:result.append(evidence)
    return result

def fetch(coin_id,exchange,page):
    require(ID.fullmatch(coin_id) and exchange in EXCHANGES and 1<=page<=2,
            "Unsafe exact-ID source request")
    params=urllib.parse.urlencode({"exchange_ids":exchange,"page":page})
    url=f"https://api.coingecko.com/api/v3/coins/{coin_id}/tickers?{params}"
    req=urllib.request.Request(url,headers={"User-Agent":"SevenHeaven-SpotArchiveDiscovery/1.0",
                                            "Accept":"application/json"})
    with urllib.request.urlopen(req,timeout=23) as response:
        require(response.status==200,"Source HTTP non-200")
        raw=response.read(1500001)
        require(0<len(raw)<=1500000,"Source response too large")
        obj=json.loads(raw)
        require(isinstance(obj.get("tickers"),list),"No source tickers")
        return obj["tickers"]

def inspect(asset,getter=fetch):
    matches=[];pages=0
    try:
        for exchange in EXCHANGES:
            for page in (1,2):
                rows=getter(asset["id"],exchange,page);pages+=1
                matches.extend(exact_candidates(rows,asset,exchange))
                if len(rows)<100:break
            else:
                return "source_pagination_incomplete",[],pages
        return ("exact_id_market_candidates" if matches else "market_not_confirmed",
                sorted(matches,key=lambda x:(x["exchange"],x["quote"])),pages)
    except (OSError,ValueError,RuntimeError,TypeError,KeyError,json.JSONDecodeError):
        return "source_unavailable",[],pages

def validate(doc,queue):
    require(doc.get("schema")==SCHEMA and isinstance(doc.get("results"),list),
            "Bad discovery evidence ledger")
    idx={a["id"]:a for a in queue};seen=set()
    for row in doc["results"]:
        aid=row.get("id")
        require(aid in idx and aid not in seen and
                row.get("rank")==idx[aid]["rank"] and
                row.get("symbol")==idx[aid]["symbol"],
                "Discovery identity changed")
        seen.add(aid)
        require(row.get("status") in ("exact_id_market_candidates","market_not_confirmed",
               "source_pagination_incomplete","source_unavailable") and
               isinstance(row.get("markets"),list),"Unknown discovery status")
        evidence=row["markets"]
        require(bool(evidence)==(row["status"]=="exact_id_market_candidates"),
                "Market claim without exact source")
        for p in evidence:
            require(p.get("coin_id")==aid and p.get("base")==row["symbol"] and
                    p.get("exchange") in EXCHANGES and p.get("quote") in QUOTES and
                    p.get("exchange_instrument_confirmed") is False and
                    p.get("native_1m_month_confirmed") is False,
                    "Unverified market or source ownership")
    return seen

def process(queue,prior=None,batch=MAX_BATCH,checker=inspect,delay=15,excluded=frozenset()):
    require(1<=batch<=MAX_BATCH and 0<=delay<=30,"Unbounded discovery batch")
    doc=prior or {"schema":SCHEMA,"results":[]};checked=validate(doc,queue)
    waiting=[a for a in queue if a["id"] not in excluded and a["id"] not in checked]
    if not waiting:
        retriable={x["id"] for x in doc["results"] if x["status"] in
                   ("source_unavailable","source_pagination_incomplete")}
        waiting=[a for a in queue if a["id"] not in excluded and a["id"] in retriable]
    records={x["id"]:x for x in doc["results"]}
    for i,a in enumerate(waiting[:batch]):
        if i and delay:time.sleep(delay)
        status,markets,pages=checker(a)
        records[a["id"]]={"id":a["id"],"rank":a["rank"],"symbol":a["symbol"],
                  "status":status,"markets":markets,"pages_checked":pages,
                  "checked_at":dt.datetime.now(dt.timezone.utc).isoformat()}
        print("ALT MARKET "+json.dumps({"id":a["id"],"status":status,
                                        "candidates":len(markets)},sort_keys=True),flush=True)
    result=sorted(records.values(),key=lambda x:x["rank"])
    output={"schema":SCHEMA,"ranked":250,
            "candidate_count":len(queue)-len(excluded),
            "checked_count":sum(x["id"] not in excluded for x in result),
            "market_candidate_count":sum(bool(x["markets"]) and x["id"] not in excluded
                                         for x in result),
            "source":"CoinGecko exact coin ID, exchange_ids okx or bitget",
            "quote":"USDT or USDC: never convert silently",
            "market_only_not_archived":True,
            "note":"Candidate market evidence only. Exchange instrument and complete genuine 1m source required before archival.",
            "results":result}
    validate(output,queue)
    return output

def main():
    cli=argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--plan",action="store_true")
    cli.add_argument("--probe",action="store_true")
    cli.add_argument("--batch-size",type=int,default=MAX_BATCH)
    cli.add_argument("--sleep",type=float,default=15)
    args=cli.parse_args()
    require(args.plan != args.probe,"Use --plan or --probe")
    queue,archived=universe()
    prior=json.loads(OUTPUT.read_text()) if OUTPUT.is_file() else None
    if prior:validate(prior,queue)
    if args.plan:
        print("ALT MARKET PLAN "+json.dumps({"ranked":250,"archived":len(archived),
              "candidate_count":250-len(archived),
              "checked":sum(x["id"] not in archived for x in prior["results"]) if prior else 0}))
        return
    result=process(queue,prior,args.batch_size,delay=args.sleep,excluded=archived)
    OUTPUT.parent.mkdir(parents=True,exist_ok=True)
    tmp=OUTPUT.with_suffix(".tmp")
    tmp.write_text(json.dumps(result,indent=2,sort_keys=True)+"\n")
    tmp.replace(OUTPUT)
    print("ALT MARKET SUMMARY "+json.dumps({k:result[k] for k in
          ("candidate_count","checked_count","market_candidate_count")},sort_keys=True))
if __name__=="__main__":
    main()
