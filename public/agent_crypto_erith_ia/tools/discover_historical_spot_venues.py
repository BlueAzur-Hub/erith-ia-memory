#!/usr/bin/env python3
"""Read-only Top250 exact-ID market discovery: OKX and Bitget, NOT an OHLCV archive."""
from __future__ import annotations
import argparse
import datetime as dt
import json
import os
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
OFFICIAL=BASE/"top250-official-spot-instruments.json"
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

def fetch_exchange(coin_id,exchange,page):
    """CoinGecko's second documented exact-ID route, never a symbol search."""
    require(ID.fullmatch(coin_id) and exchange in EXCHANGES and 1<=page<=2,
            "Unsafe exchange-specific exact-ID request")
    params=urllib.parse.urlencode({"coin_ids":coin_id,"page":page})
    url=f"https://api.coingecko.com/api/v3/exchanges/{exchange}/tickers?{params}"
    req=urllib.request.Request(url,headers={
        "User-Agent":"SevenHeaven-SpotArchiveDiscovery/1.0",
        "Accept":"application/json"})
    with urllib.request.urlopen(req,timeout=23) as response:
        require(response.status==200,"Exchange source HTTP non-200")
        raw=response.read(1500001)
        require(0<len(raw)<=1500000,"Exchange source response too large")
        obj=json.loads(raw)
        require(isinstance(obj.get("tickers"),list),"Bad source exchange tickers")
        return obj["tickers"]

def inspect(asset,getter=fetch,exchange_getter=None):
    """Retain only complete venue-specific exact-ID proofs.

    One exchange's 429 must not discard an independently proven instrument
    from the other exchange. It never turns the failed venue into a negative.
    """
    matches=[];pages=0;unavailable=False;incomplete=False
    errors=(OSError,ValueError,RuntimeError,TypeError,KeyError,json.JSONDecodeError)
    for exchange in EXCHANGES:
        local=[];venue_error=False
        try:
            for page in (1,2):
                try:
                    rows=getter(asset["id"],exchange,page)
                except errors:
                    if exchange_getter is None or page!=1:
                        raise
                    rows=exchange_getter(asset["id"],exchange,page)
                pages+=1
                local.extend(exact_candidates(rows,asset,exchange))
                if len(rows)<100:
                    if not local and page==1 and exchange_getter is not None:
                        backup=exchange_getter(asset["id"],exchange,page)
                        pages+=1
                        local.extend(exact_candidates(backup,asset,exchange))
                        if len(backup)>=100:
                            incomplete=True
                            venue_error=True
                    break
            else:
                # No positive proof survives truncated pagination for this venue.
                incomplete=True
                venue_error=True
        except errors:
            unavailable=True
            venue_error=True
        if not venue_error:
            matches.extend(local)
    if matches:
        # All included venue proofs were independently completed and checked.
        seen=set();unique=[]
        for x in sorted(matches,key=lambda v:(v["exchange"],v["quote"])):
            k=(x["exchange"],x["quote"],x["market_pair_candidate"])
            if k not in seen:
                seen.add(k);unique.append(x)
        return "exact_id_market_candidates",unique,pages
    if incomplete:
        return "source_pagination_incomplete",[],pages
    if unavailable:
        return "source_unavailable",[],pages
    return "market_not_confirmed",[],pages

def official_priority(queue,archived,path=OFFICIAL):
    """A symbol-only instrument is a scheduling hint, NEVER an ID approval."""
    if not Path(path).is_file():
        return set()
    doc=json.loads(Path(path).read_text(encoding="utf-8"))
    if doc.get("schema")!="aerith.public.ohlcv.spot.top250.official-instrument-candidates.v1":
        return set()
    rows=doc.get("assets")
    audit_count=doc.get("archived_assets_at_audit")
    # A successful archive extends the current archived set. It must not
    # invalidate still-unarchived, exact-ID-matched official instruments.
    # Reject a regressing count or any changed rank/symbol/identity.
    if (doc.get("ranked")!=250 or not isinstance(rows,list)
        or not isinstance(audit_count,int) or isinstance(audit_count,bool)
        or audit_count<0 or audit_count>len(archived)
        or len(rows)!=250-audit_count):
        return set()
    byid={a["id"]:a for a in queue}
    seen=set();selected=set()
    for x in rows:
        aid=x.get("id")
        require(aid in byid and aid not in seen
                and x.get("rank")==byid[aid]["rank"]
                and x.get("symbol")==byid[aid]["symbol"],
                "Instrument scheduling hint does not belong to ranked Top250")
        seen.add(aid)
        if x.get("instruments"):
            require(isinstance(x["instruments"],list),"Invalid official instrument matches")
            if aid not in archived: selected.add(aid)
    require({a["id"] for a in queue if a["id"] not in archived}<=seen,
            "Official candidate universe changed since audit")
    return selected

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

def process(queue,prior=None,batch=MAX_BATCH,checker=inspect,delay=15,
            excluded=frozenset(),preferred=frozenset()):
    require(1<=batch<=MAX_BATCH and 0<=delay<=30,"Unbounded discovery batch")
    doc=prior or {"schema":SCHEMA,"results":[]};checked=validate(doc,queue)
    unseen=[a for a in queue if a["id"] not in excluded and a["id"] not in checked]
    # Reserve at most one third of a batch for stale source errors. Otherwise
    # 429s from the first few exact IDs can block new qualification indefinitely.
    now=dt.datetime.now(dt.timezone.utc)
    recoverable={r["id"]:r for r in doc["results"] if r["status"] in
                 ("source_unavailable","source_pagination_incomplete")}
    retries=[]
    for a in queue:
        r=recoverable.get(a["id"])
        if a["id"] in excluded or not r:
            continue
        try:
            previous=dt.datetime.fromisoformat(r["checked_at"])
            require(previous.tzinfo is not None,"Discovery timestamp must include UTC offset")
            age=now-previous.astimezone(dt.timezone.utc)
        except (ValueError,KeyError,TypeError,AttributeError):
            age=dt.timedelta(days=1)
        if age>=dt.timedelta(minutes=90):
            retries.append((age,a))
    # Official Spot symbols are hints, never CoinGecko identity proofs.
    # Oldest failed probes first: rechecking only low ranks forever starves
    # other known matches whenever APIs remain rate-limited.
    unseen.sort(key=lambda a:(a["id"] not in preferred,a["rank"]))
    retries.sort(key=lambda item:(-item[0].total_seconds(),
                                  item[1]["id"] not in preferred,item[1]["rank"]))
    retry_limit=min(len(retries),max(1,batch//3)) if unseen else batch
    waiting=[*(a for _,a in retries[:retry_limit]),*unseen[:batch-retry_limit]]
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

# Contract-based exact-ID corroboration uses two public source inventories,
# rather than accepting a ticker as proof of ownership. It is intentionally
# restricted to unambiguous EVM contracts with independently named chains.
CONTRACT=re.compile(r"^0x[0-9a-f]{40}$")
CHAINS={
    "ERC20":"ethereum", "ETH":"ethereum", "ETHEREUM":"ethereum",
    "BEP20":"binance-smart-chain", "BSC":"binance-smart-chain",
    "ARB":"arbitrum-one", "ARBITRUM":"arbitrum-one",
    "BASE":"base", "MATIC":"polygon-pos", "POLYGON":"polygon-pos",
    "OP":"optimistic-ethereum", "OPTIMISM":"optimistic-ethereum",
}
CG_PLATFORMS="https://api.coingecko.com/api/v3/coins/list?include_platform=true"
BITGET_COINS="https://api.bitget.com/api/v2/spot/public/coins"

def contract_address(value):
    if not isinstance(value,str):return None
    normalized=value.strip().lower()
    if not CONTRACT.fullmatch(normalized) or int(normalized[2:],16)==0:
        return None
    return normalized

def contract_matches(queue,archived,official,coins,bitget_coins):
    """CoinGecko exact ID + same on-chain contract + Bitget genuine Spot pair.

    A shared ticker, token name, unverified network alias, duplicate contract
    or non-EVM native currency NEVER qualifies as historical OHLCV provenance.
    """
    require(isinstance(coins,list) and isinstance(bitget_coins,dict)
            and bitget_coins.get("code")=="00000"
            and isinstance(bitget_coins.get("data"),list),
            "Missing complete independent public contract sources")
    require(len(coins)>1000 and len(bitget_coins["data"])>100,
            "Unexpectedly partial asset inventory")
    require(official.get("schema")==
            "aerith.public.ohlcv.spot.top250.official-instrument-candidates.v1"
            and official.get("ranked")==250,"Official Spot audit unavailable")
    present={}
    cg_symbols={}
    for record in coins:
        if not isinstance(record,dict):continue
        cid,platforms=record.get("id"),record.get("platforms")
        if not isinstance(cid,str) or not isinstance(platforms,dict):continue
        if isinstance(record.get("symbol"),str):
            cg_symbols[cid]=record["symbol"].upper()
        for platform,address in platforms.items():
            normalized=contract_address(address)
            if platform in CHAINS.values() and normalized:
                present.setdefault((platform,normalized),set()).add(cid)
    bitget={}
    for record in bitget_coins["data"]:
        if isinstance(record,dict) and isinstance(record.get("coin"),str):
            bitget.setdefault(record["coin"].upper(),[]).append(record)
    official_map={a.get("id"):a for a in official.get("assets",[])
                  if isinstance(a,dict)}
    result={}
    for asset in queue:
        aid,symbol=asset["id"],asset["symbol"]
        if aid in archived or cg_symbols.get(aid)!=symbol:continue
        row=official_map.get(aid)
        if not row or row.get("rank")!=asset["rank"] or row.get("symbol")!=symbol:
            continue
        pair=symbol+"USDT"
        instruments=row.get("instruments",[])
        if not isinstance(instruments,list) or not any(
            isinstance(p,dict) and p.get("venue")=="bitget"
            and p.get("instrument")==pair and p.get("base")==symbol
            and p.get("quote")=="USDT"
            and p.get("exchange_instrument_confirmed") is True
            for p in instruments):
            continue
        records=bitget.get(symbol,[])
        if len(records)!=1 or not isinstance(records[0].get("chains"),list):
            continue
        found=[]
        for chain in records[0]["chains"]:
            if not isinstance(chain,dict):continue
            network=CHAINS.get(str(chain.get("chain","")).upper())
            address=contract_address(chain.get("contractAddress"))
            if network and address and present.get((network,address))=={aid}:
                found.append((network,address))
        # More than one independently matching chain is acceptable, but the
        # CoinGecko ownership must be unique for each respective contract.
        if found:
            platform,address=sorted(set(found))[0]
            result[aid]={"coin_id":aid,"exchange":"bitget","base":symbol,
                         "quote":"USDT","market_pair_candidate":pair,
                         "exchange_instrument_confirmed":False,
                         "native_1m_month_confirmed":False,
                         "proof_method":"exact_coin_id_matching_evm_contract",
                         "contract_platform":platform,
                         "contract_address":address}
    return result

def public_inventory(url,max_size):
    require(url in (CG_PLATFORMS,BITGET_COINS),"Unapproved inventory source")
    req=urllib.request.Request(url,headers={
        "User-Agent":"SevenHeaven-Coffre-ContractProof/1.0",
        "Accept":"application/json"})
    with urllib.request.urlopen(req,timeout=40) as response:
        require(response.status==200,"Official inventory returned non-200")
        raw=response.read(max_size+1)
        require(0<len(raw)<=max_size,"Official inventory incomplete/oversized")
    return json.loads(raw)

def enrich_contracts(queue,archived,doc,official,coingecko,bitget):
    """Append only verified first-owner contract proofs to existing ledger."""
    matches=contract_matches(queue,archived,official,coingecko,bitget)
    records={r["id"]:r for r in doc["results"]}
    now=dt.datetime.now(dt.timezone.utc).isoformat()
    additions=[]
    for asset in queue:
        aid=asset["id"]
        if aid not in matches:continue
        previous=records.get(aid)
        if previous and previous["status"]=="exact_id_market_candidates":
            continue
        records[aid]={"id":aid,"rank":asset["rank"],"symbol":asset["symbol"],
                      "status":"exact_id_market_candidates",
                      "markets":[matches[aid]],"pages_checked":0,
                      "checked_at":now}
        additions.append(aid)
    updated=dict(doc)
    updated["results"]=sorted(records.values(),key=lambda r:r["rank"])
    updated["checked_count"]=sum(r["id"] not in archived
                                 for r in updated["results"])
    updated["market_candidate_count"]=sum(bool(r["markets"])
        and r["id"] not in archived for r in updated["results"])
    if additions:
        updated["source"]=(doc["source"]+
             "; exact-ID CoinGecko contract matched to Bitget official chain")
    validate(updated,queue)
    return updated,additions

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
              "checked":sum(x["id"] not in archived for x in prior["results"]) if prior else 0,
              "official_priority_assets":len(official_priority(queue,archived))}))
        return
    priority=official_priority(queue,archived)
    result=process(queue,prior,args.batch_size,
                   checker=lambda a:inspect(a,exchange_getter=fetch_exchange),
                   delay=args.sleep,excluded=archived,preferred=priority)
    # Keep the two large inventories to once per hour in scheduled runs;
    # a reviewed source-code push checks the new source promptly.
    number=os.environ.get("GITHUB_RUN_NUMBER","0")
    inventory_due=(os.environ.get("GITHUB_EVENT_NAME")=="push"
                   or (number.isdecimal() and int(number)%4==0))
    if inventory_due:
        try:
            official=json.loads(OFFICIAL.read_text(encoding="utf-8"))
            cg=public_inventory(CG_PLATFORMS,40_000_000)
            bitget=public_inventory(BITGET_COINS,15_000_000)
            result,added=enrich_contracts(queue,archived,result,official,cg,bitget)
            print("EXACT CONTRACT SOURCE "+json.dumps(
                {"qualified_ids":added,"count":len(added)},sort_keys=True),
                flush=True)
        except (OSError,ValueError,TypeError,KeyError,
                json.JSONDecodeError) as exc:
            print("EXACT CONTRACT SOURCE UNAVAILABLE "+
                  type(exc).__name__+": "+str(exc)[:180],flush=True)
    else:
        print("EXACT CONTRACT SOURCE DEFERRED: hourly inventory quota",flush=True)
    OUTPUT.parent.mkdir(parents=True,exist_ok=True)
    tmp=OUTPUT.with_suffix(".tmp")
    tmp.write_text(json.dumps(result,indent=2,sort_keys=True)+"\n")
    tmp.replace(OUTPUT)
    print("ALT MARKET SUMMARY "+json.dumps({k:result[k] for k in
          ("candidate_count","checked_count","market_candidate_count")},sort_keys=True))
if __name__=="__main__":
    main()
