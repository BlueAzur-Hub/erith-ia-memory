#!/usr/bin/env python3
"""Three contract-matched Radar targets, public Bitget Spot only.
Reuse the existing hourly GitHub run; never schedule independently.
No real or pretend fill, no USD↔USDT conversion, no hidden fallback.
"""
from __future__ import annotations
import datetime as dt
import json
import os
import pathlib
import re
from decimal import Decimal
import collect_case_market_hourly as market
from prove_public_spot_contracts import PLATFORMS, address

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data/crypto/radar-verified-target-hourly"
IDENTITY = ROOT / "data/crypto/radar-opportunities/spot-identity-latest.json"
SCHEMA = "erith.radar.verified-target-hourly.v1"
# CoinGecko ID, symbol, exact native Bitget pair, chain, contract.
# Pinned from the Oct 20 contract cross-check, not guessed by symbol.
TARGETS = (
    ("bedrock-token", "BR", "BRUSDT", "binance-smart-chain",
     "0xff7d6a96ae471bbcd7713af9cb1feeb16cf56b41"),
    ("janction", "JCT", "JCTUSDT", "binance-smart-chain",
     "0xea37a8de1de2d9d10772eeb569e28bfa5cb17707"),
    ("beam-2", "BEAM", "BEAMUSDT", "ethereum",
     "0x62d0a8458ed7719fdaf978fe5929c6d342b0bfce"),
)
HTTP_CALLS_PER_TARGET = 5
MAX_HTTP_CALLS = len(TARGETS) * HTTP_CALLS_PER_TARGET

def require(cond, reason):
    if not cond:
        raise ValueError(reason)

def validated_targets(identity):
    require(identity.get("schema") == "erith.radar.spot-identity-prospective.v1"
            and identity.get("orders_enabled") is False
            and identity.get("real_orders") == 0
            and identity.get("candidate_count") == 20
            and isinstance(identity.get("candidates"),list),
            "Le catalogue canonique des identités est invalide")
    found = []
    for cid, sym, pair, network, pinned in TARGETS:
        matches = [x for x in identity["candidates"] if x.get("coin_id") == cid]
        require(len(matches) == 1, "Identité ambiguë ou retirée : " + cid)
        x = matches[0]
        require(x.get("symbol") == sym and x.get("venue") == "Bitget"
                and x.get("pair") == pair and x.get("quote") == "USDT"
                and x.get("identity_proven") is True
                and x.get("status") == "CONTRACT_MATCH_AT_COLLECTION"
                and x.get("platform") == network
                and address(x.get("contract_address")) == pinned
                and x.get("real_orders") == 0, "Le contrat historique ne concorde plus")
        found.append((cid,sym,pair,network,pinned))
    require(len(found) == 3 and len({x[2] for x in found}) == 3, "Trois marchés uniques attendus")
    return found

def native_proof(fetch, now, target):
    cid, sym, pair, network, pinned = target
    host = "api.bitget.com"
    coin = market.api(fetch,host,"/api/v3/market/coins",coin=sym).get("data")
    require(isinstance(coin,list), "Métadonnées Bitget indisponibles")
    rows = [x for x in coin if isinstance(x,dict) and x.get("coin")==sym]
    require(len(rows)==1 and isinstance(rows[0].get("chains"),list),
            "Identité native ambiguë")
    chain_matches = []
    for x in rows[0]["chains"]:
        if not isinstance(x,dict):
            continue
        if (PLATFORMS.get(str(x.get("chain","")).upper()) == network
                and address(x.get("contractAddress")) == pinned):
            chain_matches.append(x)
    require(len(chain_matches)==1, "Contrat ou réseau Bitget absent / incohérent")
    instrument = market.api(fetch,host,"/api/v3/market/instruments",
                            category="SPOT",symbol=pair).get("data")
    require(isinstance(instrument,list) and len(instrument)==1,
            "Paire Spot absente / doublonnée")
    i=instrument[0]
    require(i.get("symbol")==pair and i.get("category")=="SPOT"
            and i.get("baseCoin")==sym and i.get("quoteCoin")=="USDT"
            and i.get("status")=="online"
            and i.get("symbolType","crypto")=="crypto"
            and i.get("isRwa","NO")!="YES", "Paire Spot incorrecte")
    ticker = market.api(fetch,host,"/api/v3/market/tickers",category="SPOT",symbol=pair)
    t = ticker.get("data")
    require(isinstance(t,list) and len(t)==1 and t[0].get("symbol")==pair
            and t[0].get("category")=="SPOT", "Ticker mauvais marché")
    t=t[0]
    tick={"source_at_utc":market.stamp(t.get("ts"),now),
          "response_at_utc":market.stamp(ticker.get("requestTime"),now),
          "last":market.num(t.get("lastPrice")),
          "volume24h_base":market.num(t.get("volume24h"),True),
          "volume24h_quote":market.num(t.get("turnover24h"),True)}
    rawbook=market.api(fetch,host,"/api/v3/market/orderbook",
                       category="SPOT",symbol=pair,limit=5).get("data")
    require(isinstance(rawbook,dict), "Carnet absent")
    book=market.make_book(rawbook.get("b"),rawbook.get("a"),rawbook.get("ts"),now)
    candles=market.api(fetch,host,"/api/v3/market/candles",
                       category="SPOT",symbol=pair,interval="15m",limit=7).get("data")
    bars=market.closed_bars(candles,now,True)
    return {"identity":{"coin_id":cid,"platform":network,"contract_address":pinned,
                        "native_checked_at_utc":market.iso(now),
                        "same_chain_and_address":True},
            "ticker":tick,"book":book,"closed_15m":bars,
            "instrument_public_min_notional_usdt":market.num(i.get("minOrderAmount"))
               if isinstance(i.get("minOrderAmount"),str) else None,
            "execution_proven":False,"account_rules_verified":False}

def collect(fetch=market.public_json,now=None,identity=None):
    now=now or dt.datetime.now(market.UTC)
    require(now.utcoffset()==dt.timedelta(0),"UTC required")
    identity=identity if identity is not None else json.loads(IDENTITY.read_text(encoding="utf-8"))
    targets=validated_targets(identity)
    rows=[]
    for cid,sym,pair,network,pinned in targets:
        item={"coin_id":cid,"symbol":sym,"venue":"Bitget","pair":pair,
              "quote":"USDT","type":"SPOT","platform":network,
              "contract_address":pinned,"status":"UNAVAILABLE",
              "proof":None,"unavailable_reason":None}
        try:
            proof=native_proof(fetch,now,(cid,sym,pair,network,pinned))
            item.update(status="OBSERVED",proof=proof)
        except (ValueError,KeyError,TypeError,IndexError,OSError,TimeoutError) as exc:
            # No substitute price from another symbol, venue or earlier date.
            item["unavailable_reason"]=type(exc).__name__
        rows.append(item)
    return {"schema":SCHEMA,"record_kind":"public_spot_observation_not_trading_signal",
            "hour_utc":now.strftime("%Y-%m-%dT%HZ"),"observed_at_utc":market.iso(now),
            "selection_source_date_utc":identity["source_radar_day_utc"],
            "markets":rows,"total_targets":3,
            "markets_observed":sum(row["status"]=="OBSERVED" for row in rows),
            "max_http_requests":MAX_HTTP_CALLS,"no_backfill":True,
            "orders_enabled":False,"real_orders":0,"paper_fills":0,
            "account_access":False,"strategy_certified":False}

def save(doc,root=OUTPUT):
    require(doc.get("schema")==SCHEMA and doc.get("orders_enabled") is False
            and doc.get("real_orders")==0 and doc.get("paper_fills")==0
            and doc.get("total_targets")==3 and len(doc.get("markets",[]))==3,
            "Document hors politique de recherche")
    hour=doc["hour_utc"]
    require(re.fullmatch(r"\d{4}-\d\d-\d\dT\d\dZ",hour)
            and doc["observed_at_utc"][:13]==hour[:13], "Heure UTC invalide")
    root.mkdir(parents=True,exist_ok=True)
    daily=root/(hour[:10]+".json")
    if daily.exists():
        old=json.loads(daily.read_text(encoding="utf-8"))
        require(old.get("schema")==SCHEMA and old.get("date_utc")==hour[:10]
                and isinstance(old.get("hours"),list)
                and len({x["hour_utc"] for x in old["hours"]})==len(old["hours"]),
                "Archive existante invalide")
        records=old["hours"]
        if any(x["hour_utc"]==hour for x in records):
            return {"changed":False,"status":"IMMUTABLE_HOUR","hour":hour}
    else:
        records=[]
    require(len(records)<24 and all(x["hour_utc"]<hour for x in records),
            "Pas de reconstruction des heures sautées")
    records.append(doc)
    latest={"schema":"erith.radar.verified-target-hourly.latest.v1",
            "hour_utc":hour,"observed_at_utc":doc["observed_at_utc"],
            "source_date_utc":hour[:10],"target_count":3,
            "markets_observed":doc["markets_observed"],
            "per_asset":{x["symbol"]:x["status"] for x in doc["markets"]},
            "orders_enabled":False,"real_orders":0}
    for path,obj in ((daily,{"schema":SCHEMA,"date_utc":hour[:10],
                             "hours":records,"orders_enabled":False,"real_orders":0}),
                     (root/"latest.json",latest)):
        tmp=path.with_suffix(".writing")
        tmp.write_text(json.dumps(obj,ensure_ascii=False,indent=2,allow_nan=False)+"\n",
                       encoding="utf-8")
        os.replace(tmp,path)
    return {"changed":True,"hour":hour,"markets_observed":doc["markets_observed"]}

if __name__=="__main__":
    print(json.dumps(save(collect())))
