#!/usr/bin/env python3
"""Public OKX EEA Spot books: SAHARA/T/GRASS, append-only hourly evidence.
Reuse the EXISTING Radar hourly workflow. No private account or order access.
"""
from __future__ import annotations
import datetime as dt
import json
import os
import pathlib
import re
import collect_case_market_hourly as market

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data/crypto/radar-okx-book-hourly"
SCHEMA = "erith.radar.okx.public-spot-books.v1"
TARGETS = (
    ("sahara-ai", "SAHARA", "SAHARA-USDC"),
    ("threshold-network-token", "T", "T-USDC"),
    ("grass", "GRASS", "GRASS-USDC"),
)

def require(value, reason):
    if not value:
        raise ValueError(reason)

def capture(fetch, now, symbol, pair):
    host = "eea.okx.com"
    instruments = market.api(fetch, host, "/api/v5/public/instruments",
                             instType="SPOT", instId=pair).get("data")
    require(isinstance(instruments, list) and len(instruments) == 1,
            "Spot instrument absent or ambiguous")
    inst = instruments[0]
    require(isinstance(inst, dict) and inst.get("instId") == pair
            and inst.get("instType") == "SPOT" and inst.get("baseCcy") == symbol
            and inst.get("quoteCcy") == "USDC" and inst.get("state") == "live",
            "Instrument identity or state inconsistent")
    rules = {k:market.num(inst[k]) for k in ("minSz", "lotSz", "tickSz")}
    tickers = market.api(fetch, host, "/api/v5/market/ticker", instId=pair).get("data")
    require(isinstance(tickers, list) and len(tickers) == 1
            and tickers[0].get("instId") == pair, "Ticker identity mismatch")
    t = tickers[0]
    ticker = {
        "source_at_utc":market.stamp(t.get("ts"),now),
        "last":market.num(t.get("last")),
        "volume24h_base":market.num(t.get("vol24h"),True),
        "volume24h_quote_usdc":market.num(t.get("volCcy24h"),True)}
    orders = market.api(fetch, host, "/api/v5/market/books", instId=pair, sz=5).get("data")
    require(isinstance(orders,list) and len(orders)==1, "Spot book unavailable")
    book = market.make_book(orders[0].get("bids"),orders[0].get("asks"),
                            orders[0].get("ts"),now)
    bars,bar_status = [],"UNAVAILABLE"
    try:
        candle_rows = market.api(fetch, host, "/api/v5/market/candles",
                                 instId=pair, bar="15m", limit=7).get("data")
        bars = market.closed_bars(candle_rows,now,False)
        bar_status = "CONFIRMED_CLOSED_BARS"
    except (ValueError, KeyError, TypeError, IndexError, OSError, TimeoutError):
        pass
    return {
        "ticker":ticker,"book":book,"instrument_public_rules":rules,
        "closed_15m":bars,"closed_15m_status":bar_status,
        "exchange_symbol_verified":True,"token_contract_verified":False,
        "account_access_verified":False,"min_notional_verified":False,
        "fees_verified":False,"execution_proven":False}

def collect(fetch=market.public_json,now=None):
    now = now or dt.datetime.now(market.UTC)
    require(now.utcoffset()==dt.timedelta(0),"UTC required")
    rows=[]
    for cid,sym,pair in TARGETS:
        entry={"coin_id":cid,"symbol":sym,"venue":"OKX_EEA",
               "pair":pair,"quote":"USDC","type":"SPOT",
               "status":"UNAVAILABLE","proof":None,"unavailable_reason":None}
        try:
            entry.update(status="OBSERVED",proof=capture(fetch,now,sym,pair))
        except (ValueError,KeyError,TypeError,IndexError,OSError,TimeoutError) as exc:
            entry["unavailable_reason"]=type(exc).__name__
        rows.append(entry)
    return {"schema":SCHEMA,"record_kind":"PUBLIC_SAMPLED_BOOK_NO_EXECUTION_PROOF",
            "hour_utc":now.strftime("%Y-%m-%dT%HZ"),
            "observed_at_utc":market.iso(now),
            "markets":rows,"target_count":len(TARGETS),
            "observed_count":sum(x["status"]=="OBSERVED" for x in rows),
            "no_historical_book_backfill":True,
            "orders_enabled":False,"real_orders":0,"paper_fills":0,
            "account_access":False}

def save(doc,root=OUTPUT):
    require(doc.get("schema")==SCHEMA and doc.get("target_count")==len(TARGETS)
            and len(doc.get("markets",[]))==len(TARGETS)
            and doc.get("orders_enabled") is False and doc.get("real_orders")==0
            and doc.get("paper_fills")==0,"Not a public PAPER-only observation")
    hour=doc["hour_utc"]
    require(re.fullmatch(r"\d{4}-\d\d-\d\dT\d\dZ",hour)
            and doc["observed_at_utc"][:13]==hour[:13],"UTC mismatch")
    root.mkdir(parents=True,exist_ok=True)
    path=root/(hour[:10]+".json")
    if path.exists():
        old=json.loads(path.read_text(encoding="utf-8"))
        require(old.get("schema")==SCHEMA and old.get("date_utc")==hour[:10]
                and isinstance(old.get("hours"),list),"Existing day invalid")
        hours=old["hours"]
        require(len(hours)==len({r["hour_utc"] for r in hours}),"Duplicate hour")
        if any(r["hour_utc"]==hour for r in hours):
            return {"changed":False,"status":"IMMUTABLE_HOUR"}
    else:
        hours=[]
    require(len(hours)<24 and all(r["hour_utc"]<hour for r in hours),
            "Missing hours must never be reconstructed")
    hours.append(doc)
    day={"schema":SCHEMA,"date_utc":hour[:10],"hours":hours,
         "orders_enabled":False,"real_orders":0}
    latest={"schema":"erith.radar.okx.public-spot-books.latest.v1",
            "hour_utc":hour,"observed_at_utc":doc["observed_at_utc"],
            "day":hour[:10],"observed_count":doc["observed_count"],
            "per_asset":{x["symbol"]:x["status"] for x in doc["markets"]},
            "orders_enabled":False,"real_orders":0}
    for dest,content in ((path,day),(root/"latest.json",latest)):
        temp=dest.with_suffix(".writing")
        temp.write_text(json.dumps(content,ensure_ascii=False,indent=2,
                                   allow_nan=False)+"\n",encoding="utf-8")
        os.replace(temp,dest)
    return {"changed":True,"observed_count":doc["observed_count"],
            "hour_utc":hour}

if __name__=="__main__":
    print(json.dumps(save(collect()),ensure_ascii=False))
