#!/usr/bin/env python3
"""Seven Heaven · Top250 venue discovery and conservative CoinGecko identity audit.

Read the existing public CoinGecko-ranked Top250 snapshot plus proven historical
archive owners; query Binance exchangeInfo only ONCE for the entire universe.
Binance base symbols alone never prove a CoinGecko asset ID. Only historical
source-proven pairs are "approved"; others enter automated identity review.
Does not trade, download candle ZIPs, modify existing archives, or change UI.
"""
from __future__ import annotations

import argparse
from collections import Counter
import datetime as dt
import hashlib
import json
from pathlib import Path
import re
import urllib.error
import urllib.request

from collect_historical_universe import ROOT
import audit_historical_coverage as coverage

SNAPSHOT = ROOT / "data/crypto/latest.json"
SCHEMA = "aerith.public.ohlcv.spot.discovery.top250.v1"
MAX_SIZE = 10_000_000
ID = re.compile(r"^[a-z0-9-]{2,100}$")
SYMBOL = re.compile(r"^[A-Z0-9]{2,22}$")
ORIGINS = ("https://data-api.binance.vision", "https://api.binance.com")

def require(ok, msg):
    if not ok:
        raise ValueError(msg)

def snapshot(path=SNAPSHOT):
    raw = path.read_bytes()
    require(len(raw) < 2_000_000, "Snapshot oversized")
    doc = json.loads(raw)
    coins = doc.get("coins")
    require(doc.get("schema") == "agent_crypto_public_market_snapshot_v1"
            and isinstance(coins, list) and len(coins) == 250
            and doc.get("assets_count") == 250,
            "Source Top250 not a qualified ranking snapshot")
    ids = set()
    for rank, a in enumerate(coins, 1):
        require(a.get("rank") == rank and isinstance(a.get("id"), str)
                and ID.fullmatch(a["id"]) and a["id"] not in ids
                and isinstance(a.get("symbol"), str)
                and isinstance(a.get("name"), str),
                "Duplicate/ambiguous Top250 rank or id")
        ids.add(a["id"])
    return doc, hashlib.sha256(raw).hexdigest()

def historical_approvals():
    report = coverage.summarize()
    require(report["total_ranked"] == 50 and 24 <= report["archived_assets"] <= 50,
            "Original OHLCV owners not qualified")
    approved = {}
    for a in report["assets"]:
        if not a["archived"]:
            continue
        identity = a["id"]
        require(identity not in approved and
                all(x["source"] == "Binance Spot" and x["quote"] == "USDT"
                    and x["pair"] == a["symbol"]+"USDT"
                    for x in a["periods"].values()),
                "Original archive identity cannot be reused")
        approved[identity] = {"pair": a["symbol"]+"USDT", "source_owner": a["archive_owner"]}
    return approved

def exchange_info():
    failures = []
    for host in ORIGINS:
        try:
            req = urllib.request.Request(host+"/api/v3/exchangeInfo",
                  headers={"User-Agent":"SevenHeaven-Historical-Top250/1"})
            with urllib.request.urlopen(req, timeout=25) as r:
                require(r.status == 200, "Bad Binance status")
                raw = r.read(MAX_SIZE+1)
                require(len(raw) > 0 and len(raw) <= MAX_SIZE, "Binance exchangeInfo oversized")
                doc = json.loads(raw)
                require(isinstance(doc.get("symbols"), list) and len(doc["symbols"]) > 100,
                        "Binance exchangeInfo incomplete")
                return doc
        except (OSError, urllib.error.URLError, ValueError) as exc:
            failures.append(type(exc).__name__)
    raise RuntimeError("Cannot retrieve Binance Spot exchangeInfo: "+",".join(failures))

def is_spot(s):
    return (s.get("status") == "TRADING" and
            s.get("isSpotTradingAllowed") is True and
            ("SPOT" in s.get("permissions", []) or
             any("SPOT" in group for group in s.get("permissionSets", []))))

def build(doc, source_hash, owners, exchange, generated_at=None):
    coins=doc["coins"]
    require(len(coins)==250, "Must assess all Top250 coins")
    symbol_counts=Counter(a["symbol"].upper() for a in coins)
    book = {}
    for b in exchange.get("symbols", []):
        pair=b.get("symbol")
        if isinstance(pair,str) and pair not in book:
            book[pair]=b
    rows=[]
    for a in coins:
        symbol = a["symbol"].upper()
        aid=a["id"]
        pair=symbol+"USDT"
        status="identity_review_required"
        evidence="No independent proof of CoinGecko ID on Binance"
        if not SYMBOL.fullmatch(symbol):
            status="nonstandard_symbol"; evidence="Ticker cannot safely map to Binance Spot"
        elif symbol=="USDT":
            status="self_quote_not_tradable"; evidence="USDTUSDT is not a valid Spot history"
        elif symbol_counts[symbol]>1:
            status="symbol_collision"; evidence="CoinGecko Top250 includes duplicated ticker"
        else:
            info = book.get(pair)
            if info is None:
                status="pair_absent";evidence="Not listed as Binance symbol/USDT"
            elif info.get("baseAsset")!=symbol or info.get("quoteAsset")!="USDT":
                status="venue_identity_mismatch";evidence="Binance base/quote does not match ticker"
            elif not is_spot(info):
                status="not_spot_trading";evidence="Binance pair not active Spot"
            else:
                status="spot_candidate_identity_unverified"
                evidence="Binance Spot pair exists; CoinGecko asset identity not independently proven"
        if aid in owners:
            require(owners[aid]["pair"]==pair and status not in ("nonstandard_symbol","symbol_collision","self_quote_not_tradable"),
                    "Existing approved owner has conflicting ranked symbol: "+aid)
            if status=="spot_candidate_identity_unverified":
                status="approved_existing_archive"
                evidence="Existing SHA-verified historical source owner: "+owners[aid]["source_owner"]
            else:
                status="approved_archive_spot_not_current"
                evidence="Previously proven archive identity, but current Binance status differs"
        rows.append({"rank":a["rank"],"id":aid,"name":a["name"],
                     "symbol":symbol,"proposed_pair":pair if SYMBOL.fullmatch(symbol) else None,
                     "status":status,"source_evidence":evidence,
                     "can_import":status=="approved_existing_archive"})
    require(len(rows)==250 and len(set(x["id"] for x in rows))==250, "Inventory incomplete")
    stages=[]
    for size in (50,100,250):
        group=rows[:size]
        tally=Counter(x["status"] for x in group)
        stages.append({"top":size,"approved_current":sum(x["can_import"] for x in group),
                       "spot_candidates_identity_review":tally["spot_candidate_identity_unverified"],
                       "not_qualified":size-sum(x["can_import"] for x in group),
                       "by_status":dict(sorted(tally.items()))})
    return {"schema":SCHEMA, "source":"CoinGecko Top250 snapshot + Binance Spot exchangeInfo",
            "snapshot_sha256":source_hash, "market_snapshot_at":doc.get("generated_at"),
            "probed_at_utc":generated_at or dt.datetime.now(dt.timezone.utc).isoformat(),
            "quote":"USDT","venue":"Binance Spot","total_ranked":250,
            "approved_for_import":sum(x["can_import"] for x in rows),
            "candidates_require_independent_identity":sum(
                x["status"]=="spot_candidate_identity_unverified" for x in rows),
            "stages":stages,"assets":rows,
            "note":"A Binance ticker match is a venue candidate, NOT a verified CoinGecko asset ID. No fake 250 coverage."}

def probe(output, market=SNAPSHOT, approved=None, exchange=None):
    doc,checksum=snapshot(market)
    ownership = historical_approvals() if approved is None else approved
    venue = exchange_info() if exchange is None else exchange
    index=build(doc,checksum,ownership,venue)
    # Export a small audit JSON only; never modify existing market snapshot.
    output.parent.mkdir(parents=True,exist_ok=True)
    tmp=output.with_suffix(".tmp")
    tmp.write_text(json.dumps(index,sort_keys=True,ensure_ascii=False,indent=2)+"\n")
    tmp.replace(output)
    return index

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--snapshot",type=Path,default=SNAPSHOT)
    parser.add_argument("--output",type=Path,default=Path("/tmp/top250-pair-audit.json"))
    methods=parser.add_mutually_exclusive_group(required=True)
    methods.add_argument("--plan",action="store_true")
    methods.add_argument("--probe",action="store_true")
    args=parser.parse_args()
    doc,sha=snapshot(args.snapshot)
    if args.plan:
        report=historical_approvals()
        print(json.dumps({"mode":"OFFLINE_RANKING_ONLY","ranked":len(doc["coins"]),
                          "previously_approved":len(report),"snapshot_sha256":sha,
                          "note":"Requires venue network probe before candidate pair conclusions"},
                          sort_keys=True))
    else:
        output=probe(args.output,args.snapshot)
        print("TOP250 RESULT "+json.dumps({"total_ranked":output["total_ranked"],
              "approved_for_import":output["approved_for_import"],
              "candidates_require_independent_identity":output["candidates_require_independent_identity"],
              "stages":output["stages"]},sort_keys=True))

if __name__=="__main__":
    main()
