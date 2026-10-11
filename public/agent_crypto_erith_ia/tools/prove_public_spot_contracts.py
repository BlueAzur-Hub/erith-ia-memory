#!/usr/bin/env python3
"""Cross-check exact CoinGecko IDs against public Gate or KuCoin EVM contracts.

This is a READ-ONLY ownership qualification, NOT source OHLCV history. Venue
symbols and generic token names alone cannot become approved archive owners.
"""
from __future__ import annotations

import re

ADDRESS=re.compile(r"^0x[0-9a-f]{40}$")
SCHEMA="aerith.public.ohlcv.spot.top250.official-instrument-candidates.v1"
PLATFORMS={
    "ETH":"ethereum","ERC20":"ethereum","ETHEREUM":"ethereum",
    "BSC":"binance-smart-chain","BEP20":"binance-smart-chain",
    "ARB":"arbitrum-one","ARBITRUM":"arbitrum-one",
    "BASE":"base","POLYGON":"polygon-pos","MATIC":"polygon-pos",
    "OP":"optimistic-ethereum","OPTIMISM":"optimistic-ethereum",
}
ENDPOINTS={
    "gate":"https://api.gateio.ws/api/v4/spot/currencies",
    "kucoin":"https://api.kucoin.com/api/v3/currencies",
}

def check(cond,reason):
    if not cond:
        raise ValueError(reason)

def address(value):
    if not isinstance(value,str):
        return None
    result=value.strip().lower()
    if not ADDRESS.fullmatch(result) or int(result[2:],16)==0:
        return None
    return result

def source_rows(document,venue):
    check(venue in ENDPOINTS,"Unknown original public Spot venue")
    if venue=="gate":
        check(isinstance(document,list) and len(document)>100,
              "Gate native currency inventory incomplete")
        return document
    check(isinstance(document,dict) and document.get("code")=="200000"
          and isinstance(document.get("data"),list)
          and len(document["data"])>100,
          "KuCoin native currency inventory incomplete")
    return document["data"]

def proven_contracts(queue,archived,official,coingecko,document,venue):
    """Return candidates only if one exact public contract has ONE CG owner."""
    rows=source_rows(document,venue)
    check(isinstance(coingecko,list) and len(coingecko)>1000,
          "CoinGecko exact-ID platform inventory incomplete")
    check(official.get("schema")==SCHEMA and official.get("ranked")==250,
          "Official Spot source instruments not independently confirmed")
    check(len(queue)==250 and len({x["id"] for x in queue})==250,
          "Incomplete ranked CoinGecko owner universe")
    owned={};symbols={}
    for x in coingecko:
        if not isinstance(x,dict) or not isinstance(x.get("id"),str):
            continue
        cid=x["id"]
        if isinstance(x.get("symbol"),str):
            symbols[cid]=x["symbol"].upper()
        for network,addr in (x.get("platforms") or {}).items():
            a=address(addr)
            if network in PLATFORMS.values() and a:
                owned.setdefault((network,a),set()).add(cid)
    venue_coins={}
    key="currency"
    for item in rows:
        if isinstance(item,dict) and isinstance(item.get(key),str):
            venue_coins.setdefault(item[key].upper(),[]).append(item)
    official_map={x.get("id"):x for x in official.get("assets",[])
                  if isinstance(x,dict)}
    found={}
    for asset in queue:
        cid,sym=asset["id"],asset["symbol"]
        if cid in archived or symbols.get(cid)!=sym:
            continue
        info=official_map.get(cid)
        if (not info or info.get("rank")!=asset["rank"] or
                info.get("symbol")!=sym):
            continue
        pairs=[]
        for p in info.get("instruments",[]):
            if not isinstance(p,dict) or p.get("venue")!=venue:
                continue
            q=p.get("quote")
            if q not in ("USDT","USDC"):
                continue
            expected=(sym+"_"+q if venue=="gate" else sym+"-"+q)
            if (p.get("base")==sym and p.get("instrument")==expected
                    and p.get("exchange_instrument_confirmed") is True):
                pairs.append((q,expected))
        if not pairs:
            continue
        copies=venue_coins.get(sym,[])
        if len(copies)!=1 or not isinstance(copies[0].get("chains"),list):
            continue
        coin=copies[0]
        if venue=="gate" and coin.get("trade_disabled") is True:
            continue
        matches=[]
        for entry in coin["chains"]:
            if not isinstance(entry,dict):
                continue
            chain=(entry.get("name") if venue=="gate"
                   else entry.get("chainName"))
            raw=(entry.get("addr") if venue=="gate"
                 else entry.get("contractAddress"))
            network=PLATFORMS.get(str(chain).upper())
            normalized=address(raw)
            if network and normalized and owned.get((network,normalized))=={cid}:
                matches.append((network,normalized))
        if not matches:
            continue
        quote,pair=sorted(set(pairs),key=lambda p:(p[0]!="USDT",p[0]))[0]
        network,contract=sorted(set(matches))[0]
        found[cid]={
            "coin_id":cid,"exchange":venue,"base":sym,"quote":quote,
            "market_pair_candidate":pair,
            "exchange_instrument_confirmed":False,
            "native_1m_month_confirmed":False,
            "proof_method":"exact_coin_id_matching_evm_contract",
            "contract_platform":network,"contract_address":contract,
            "independent_original_venue_contract_inventory":ENDPOINTS[venue],
        }
    return found
