#!/usr/bin/env python3
"""Independent payload-level verification of original Gate/KuCoin daily history.

The caller independently downloads and SHA256-verifies immutable release gzip
bytes first. This module then checks native original source rows and gaps.
"""
from __future__ import annotations

import re
import collect_native_alt_spot_daily as original

SHA=re.compile(r"^[a-f0-9]{64}$")
DAY=86400000

def need(ok,msg):
    if not ok:
        raise ValueError(msg)

def check_payload(document,indexed,url):
    need(indexed.get("venue") in ("Gate Spot","KuCoin Spot"),
         "Unrecognized independently acquired native venue")
    venue=("gate" if indexed["venue"]=="Gate Spot" else "kucoin")
    quote=indexed.get("quote")
    need(quote in ("USDT","USDC") and indexed["symbol"]!=quote
         and indexed["market"]==indexed["symbol"]+
             ("_" if venue=="gate" else "-")+quote,
         "Original native USDT/USDC Spot pair or source quote spoofed")
    own=document.get("owner",{})
    evidence=own.get("identity_proof",{})
    need(document.get("schema")==original.SCHEMA
         and document.get("venue")==venue
         and document.get("source_api")==original.MARKETS[venue]
         and document.get("original_quote")==quote
         and document.get("native_interval")=="1D"
         and document.get("market")==indexed["market"]
         and document.get("no_synthetic_candles") is True
         and document.get("no_currency_conversion") is True
         and document.get("queried_all_bounded_windows") is True
         and document.get("genesis_or_first_trade_proven") is False,
         "Original Gate/KuCoin daily provenance missing")
    need(own.get("id")==indexed["id"]
         and own.get("rank")==indexed["rank"]
         and own.get("symbol")==indexed["symbol"]
         and own.get("name")==indexed["name"]
         and own.get("venue")==venue
         and own.get("pair")==indexed["market"]
         and own.get("quote")==quote,
         "Original exact ranked owner, symbol, pair or quote changed")
    need(evidence.get("coin_id")==own["id"]
         and evidence.get("exchange")==venue
         and evidence.get("base")==own["symbol"]
         and evidence.get("quote")==quote
         and evidence.get("market_pair_candidate")==own["pair"],
         "Native source no longer matches the original CoinGecko proof")
    proof_method=evidence.get("proof_method")
    if proof_method is not None:
        need(proof_method=="exact_coin_id_matching_evm_contract"
             and evidence.get("contract_platform") in
                 original.owners.CHAINS.values()
             and original.owners.contract_address(
                 evidence.get("contract_address")) is not None,
             "Missing original EVM contract owner evidence")
    rows=document.get("native_daily_rows")
    count=indexed["native_candles"]
    need(isinstance(rows,list) and len(rows)==count
         and count==document.get("native_candles"),
         "Missing original daily OHLCV rows")
    stamps=[]
    for row in rows:
        stamp,source=original.parse_bar(row,venue)
        stamps.append(stamp)
    need(stamps[0]==indexed["earliest_source_ms"]
         and stamps[-1]==indexed["latest_source_ms"]
         and document.get("earliest_returned_ms")==stamps[0]
         and document.get("latest_returned_ms")==stamps[-1]
         and all(a<b and (b-a)%DAY==0 for a,b in zip(stamps,stamps[1:])),
         "Incorrect source timestamps or repeated native daily rows")
    gaps=sum((b-a)//DAY-1 for a,b in zip(stamps,stamps[1:]))
    need(gaps==indexed["gaps_within_observed_span"]
         and gaps==document.get("calendar_days_without_source_bars"),
         "Source gaps interpolated or hidden")
    sha_list=document.get("source_response_sha256")
    need(isinstance(sha_list,list) and bool(sha_list)
         and all(isinstance(x,str) and SHA.fullmatch(x) for x in sha_list)
         and document.get("source_response_hashes_exchange_signed") is False,
         "Missing original HTTP source digests or false exchange signature")
    return {"id":own["id"],"native_daily_candles":len(rows),
            "gzip_sha256":indexed["sha256"],"source":url}
