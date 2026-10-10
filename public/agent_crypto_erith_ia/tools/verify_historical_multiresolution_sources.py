#!/usr/bin/env python3
"""Verify the single public multi-resolution source registry without rewriting 1m.

All source archives remain immutable GitHub Release assets. This registry
only references the original OKX 1Dutc Spot bars and does NOT mark an asset
archived in the independent native 1m Top250 catalogue.
"""
from __future__ import annotations
import argparse
import gzip
import hashlib
import json
from pathlib import Path
import re
from urllib.request import Request, urlopen

import import_historical_bulk as bulk

ROOT=bulk.ROOT/"data/historical_archive_prototype"
REGISTRY=ROOT/"top250_multiresolution_sources/index.json"
FED=ROOT/"top250_multisource_coverage/index.json"
SCHEMA="aerith.public.crypto.multiresolution-sources.v1"
REPO="https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/"
SHA=re.compile(r"^[0-9a-f]{64}$")
FILE=re.compile(r"^[a-z0-9-]{1,90}-[A-Z0-9]+-USDT-1Dutc\.json\.gz$")
TAG=re.compile(r"^crypto-okx-spot-native-daily-2026-09-[a-z0-9-]+$")
DAY=86_400_000
END=1790812800000
MAX_FILE=600_000
MAX_PAYLOAD=5_000_000

def need(ok,msg):
    if not ok:raise ValueError(msg)

def check_registry(index,catalog):
    need(index.get("schema")==SCHEMA
         and index.get("ranked_universe")==250
         and index.get("native_bar")=="1Dutc"
         and index.get("quote")=="USDT"
         and index.get("separate_from_native_1m_index") is True
         and index.get("native_1m_added")==0
         and index.get("exchange_signed_checksum") is False
         and index.get("synthetic_bars_added_by_collector") is False,
         "Untrusted separate native daily registry")
    need(catalog.get("schema")==
         "aerith.public.ohlcv.top250.federated-native-archives.v1" and
         catalog.get("ranked")==250 and len(catalog.get("assets",[]))==250,
         "Untrusted ranked Top250 owners")
    ranked={x["id"]:x for x in catalog["assets"]}
    need(len(ranked)==250,"Duplicate Top250 identity")
    entries=index.get("assets")
    need(isinstance(entries,list) and 1<=len(entries)<=250 and
         len(entries)==index.get("asset_count"),
         "Unbounded or missing source history references")
    seen=set()
    total=0
    for a in entries:
        cid=a["id"]
        coin=ranked.get(cid)
        need(cid not in seen and coin is not None,"Repeated/unknown CoinGecko owner")
        seen.add(cid)
        need(coin["rank"]==a["rank"] and coin["symbol"]==a["symbol"] and
             coin["name"]==a["name"] and coin["quote"]=="USDT",
             "Rank, symbol or quote changed")
        need(a.get("venue")=="OKX Spot" and a.get("bar")=="1Dutc"
             and a.get("quote")=="USDT" and
             a.get("market")==a["symbol"]+"-USDT",
             "Daily source market mismatched")
        need(isinstance(a.get("native_candles"),int) and
             1<=a["native_candles"]<=4500 and
             a.get("gaps_within_observed_span")==0 and
             isinstance(a.get("earliest_source_ms"),int) and
             isinstance(a.get("latest_source_ms"),int) and
             a["latest_source_ms"]<END and
             a["earliest_source_ms"]>0 and
             (a["latest_source_ms"]-a["earliest_source_ms"])//DAY+1
                ==a["native_candles"],
             "Misleading source OHLCV day-span coverage")
        need(isinstance(a.get("bytes"),int) and 0<a["bytes"]<=MAX_FILE and
             isinstance(a.get("sha256"),str) and SHA.fullmatch(a["sha256"]),
             "Unverified native gzip digest")
        need(isinstance(a.get("release_tag"),str) and
             TAG.fullmatch(a["release_tag"]) and
             a.get("release_url")==REPO.replace("/download/","/tag/")+a["release_tag"]
             and isinstance(a.get("filename"),str) and FILE.fullmatch(a["filename"]) and
             a["filename"]==cid+"-"+a["market"]+"-1Dutc.json.gz",
             "Unsafe immutable source reference")
        need(isinstance(a.get("identity_evidence"),str) and
             a["identity_evidence"].startswith("https://www.okx.com/"),
             "Missing venue project identity proof")
        total+=a["native_candles"]
    need(total==index.get("native_daily_candles"),"Multiresolution total mismatch")
    return entries

def verify_source(a,opener=urlopen):
    url=REPO+a["release_tag"]+"/"+a["filename"]
    request=Request(url,headers={"User-Agent":"SevenHeaven-Historical-SHA-Registry/1.0"})
    with opener(request,timeout=90) as response:
        need(response.status==200,"Source archive HTTP unavailable")
        blob=response.read(MAX_FILE+1)
    need(len(blob)==a["bytes"] and
         hashlib.sha256(blob).hexdigest()==a["sha256"],
         "Immutable source archive SHA-256 mismatch")
    decoded=gzip.decompress(blob)
    need(0<len(decoded)<=MAX_PAYLOAD,"Oversized source OHLCV decode")
    data=json.loads(decoded)
    owner=data["owner"]
    need(data.get("schema")=="aerith.okx.native-utc-daily-history.verified-response.v1"
         and data.get("exchange")=="OKX Spot"
         and data.get("native_interval")=="1Dutc"
         and data.get("quote")=="USDT"
         and data.get("filled_by_our_collector") is False
         and data.get("canonical_1m_federation_modified") is False
         and owner["id"]==a["id"] and owner["rank"]==a["rank"] and
         owner["symbol"]==a["symbol"] and
         data["market"]==a["market"] and
         data["native_candles"]==a["native_candles"] and
         data["earliest_returned_ms"]==a["earliest_source_ms"] and
         data["latest_returned_ms"]==a["latest_source_ms"],
         "Historical 1Dutc source ownership/integrity mismatch")
    rows=data.get("native_daily_rows")
    need(isinstance(rows,list) and len(rows)==a["native_candles"],
         "Missing native OHLCV entries")
    ts=[int(r[0]) for r in rows]
    need(all(b-a==DAY for a,b in zip(ts,ts[1:])) and
         ts[0]==a["earliest_source_ms"] and
         ts[-1]==a["latest_source_ms"] and
         all(isinstance(r,list) and len(r)==9 and r[8]=="1" for r in rows),
         "Unverified, non-contiguous or incomplete native UTC bars")
    need(isinstance(data.get("native_source_response_sha256"),list) and
         bool(data["native_source_response_sha256"]) and
         all(isinstance(d,str) and SHA.fullmatch(d)
             for d in data["native_source_response_sha256"]) and
         data.get("source_response_digests_are_exchange_signed") is False,
         "Source API response digests absent or falsely signed")
    return {"id":a["id"],"native_daily_candles":len(rows),
            "gzip_sha256":a["sha256"],"source":url}

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--offline",action="store_true")
    p.add_argument("--verify",action="store_true")
    args=p.parse_args()
    need(args.offline!=args.verify,"Select exactly one audit mode")
    index=json.loads(REGISTRY.read_text())
    catalog=json.loads(FED.read_text())
    assets=check_registry(index,catalog)
    if args.offline:
        print("MULTIRESOLUTION SOURCE REGISTRY OFFLINE VERIFIED "+json.dumps({
           "assets":len(assets),"native_daily_candles":index["native_daily_candles"],
           "native_1m_count_change":0},sort_keys=True))
        return
    details=[verify_source(a) for a in assets]
    print("MULTIRESOLUTION SOURCE REGISTRY LIVE ZIP VERIFIED "+json.dumps({
        "assets":len(details),
        "native_daily_candles":sum(x["native_daily_candles"] for x in details),
        "source_digests":[x["gzip_sha256"] for x in details],
        "source_registry_only":True},sort_keys=True))

if __name__=="__main__":main()
