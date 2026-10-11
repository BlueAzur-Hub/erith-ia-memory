#!/usr/bin/env python3
"""Verify the single public multi-resolution source registry without rewriting 1m.

All source archives remain immutable GitHub Release assets. This registry
references exact native OKX 1Dutc and Bitget 1D Spot bars and does NOT mark an asset
archived in the independent native 1m Top250 catalogue.
"""
from __future__ import annotations
import argparse
import gzip
import hashlib
import json
from pathlib import Path
import re
from decimal import Decimal, InvalidOperation
from urllib.request import Request, urlopen

import import_historical_bulk as bulk
import verify_native_alt_spot_daily as independent_daily

ROOT=bulk.ROOT/"data/historical_archive_prototype"
REGISTRY=ROOT/"top250_multiresolution_sources/index.json"
FED=ROOT/"top250_multisource_coverage/index.json"
SCHEMA="aerith.public.crypto.multiresolution-sources.v1"
REPO="https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/"
SHA=re.compile(r"^[0-9a-f]{64}$")
FILE=re.compile(r"^[a-z0-9-]{1,90}-[A-Z0-9_-]+-1D(?:utc)?\.json\.gz$")
TAG=re.compile(r"^crypto-(?:okx|bitget|gate-kucoin)-spot-native-daily-2026-09-[a-z0-9-]+$")
DAY=86_400_000
END=1790812800000
MAX_FILE=600_000
MAX_PAYLOAD=5_000_000

def need(ok,msg):
    if not ok:raise ValueError(msg)

def check_registry(index,catalog):
    need(index.get("schema")==SCHEMA
         and index.get("ranked_universe")==250
         and index.get("native_bar")=="per-source-native-daily"
         and index.get("quote")=="USDT"
         and index.get("separate_from_native_1m_index") is True
         and index.get("native_1m_added")==0
         and index.get("exchange_signed_checksum") is False
         and index.get("synthetic_bars_added_by_collector") is False,
         "Untrusted separate native daily registry")
    need(catalog.get("schema")==
         "aerith.public.ohlcv.top250.federated-native-archives.v1"
         and catalog.get("ranked")==250 and len(catalog.get("assets",[]))==250,
         "Untrusted ranked Top250 owners")
    ranked={x["id"]:x for x in catalog["assets"]}
    need(len(ranked)==250,"Duplicate Top250 identity")
    entries=index.get("assets")
    need(isinstance(entries,list) and 1<=len(entries)<=250
         and len(entries)==index.get("asset_count"),
         "Unbounded or missing source references")
    seen=set();total=0
    for a in entries:
        cid=a["id"];coin=ranked.get(cid)
        need(cid not in seen and coin is not None,"Repeated or unknown owner")
        seen.add(cid)
        need(coin["rank"]==a["rank"] and coin["symbol"]==a["symbol"]
             and coin["name"]==a["name"] and coin["quote"]=="USDT",
             "Rank, CoinGecko symbol, owner name or quote changed")
        venue=a.get("venue")
        is_okx=venue=="OKX Spot"
        is_bitget=venue=="Bitget Spot"
        is_gate=venue=="Gate Spot"
        is_kucoin=venue=="KuCoin Spot"
        need(is_okx or is_bitget or is_gate or is_kucoin,
             "Unknown native Spot candle provider")
        expected_market=(a["symbol"]+"_USDT" if is_gate
             else a["symbol"]+"-USDT" if is_okx or is_kucoin
             else a["symbol"]+"USDT")
        expected_bar="1Dutc" if is_okx else "1D"
        need(a.get("bar")==expected_bar and
             a.get("market")==expected_market and
             a.get("quote")=="USDT","Mislabelled native daily pair or granularity")
        need(isinstance(a.get("native_candles"),int)
             and 1<=a["native_candles"]<=4500
             and isinstance(a.get("earliest_source_ms"),int)
             and isinstance(a.get("latest_source_ms"),int)
             and 0<a["earliest_source_ms"]<=a["latest_source_ms"]<END
             and isinstance(a.get("gaps_within_observed_span"),int)
             and a["gaps_within_observed_span"]>=0
             and ((a["latest_source_ms"]-a["earliest_source_ms"])//DAY+1
                  ==a["native_candles"]+a["gaps_within_observed_span"]),
             "Misleading day span or invented source gaps")
        if is_okx:
            need(a["gaps_within_observed_span"]==0
                 and a["earliest_source_ms"]%DAY==0
                 and a["latest_source_ms"]%DAY==0
                 and isinstance(a.get("identity_evidence"),str)
                 and a["identity_evidence"].startswith("https://www.okx.com/"),
                 "OKX native 1Dutc provenance invalid")
        else:
            offset=a.get("native_session_start_modulo_utc_day_ms")
            need(offset in (0,57_600_000)
                 and a["earliest_source_ms"]%DAY==offset
                 and a["latest_source_ms"]%DAY==offset,
                 "Original Bitget 1D daily session UTC offset modified")
            canonical="https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/"
            official=canonical+"top250-official-spot-instruments.json#"+cid
            need(a.get("instrument_evidence")==official,
                 "Missing independently confirmed Bitget instrument owner")
            named=a.get("source_attestation")=="original-named-spot-listing"
            if named:
                notice=a.get("identity_evidence")
                need(isinstance(notice,str) and
                     notice.startswith(("https://www.bitget.com/support/articles/",
                                        "https://www.bitget.com/asia/support/articles/",
                                        "https://www.bitget.com/fr/support/articles/"))
                     and notice.rsplit("/",1)[-1].isdigit(),
                     "No official named Bitget project evidence")
            else:
                need("source_attestation" not in a and
                     a.get("identity_evidence")==
                         canonical+"top250-alt-market-evidence.json#"+cid,
                     "Unproven exact Bitget CoinGecko-to-instrument ownership")
        need(isinstance(a.get("bytes"),int) and
             0<a["bytes"]<=MAX_FILE and
             isinstance(a.get("sha256"),str) and SHA.fullmatch(a["sha256"]),
             "Unverified original gzip SHA")
        filename=cid+"-"+expected_market+"-"+expected_bar+".json.gz"
        tag=a.get("release_tag")
        need(isinstance(tag,str) and TAG.fullmatch(tag)
             and tag.startswith("crypto-"+("okx" if is_okx else "bitget")+"-")
             and a.get("release_url")==REPO.replace("/download/","/tag/")+tag
             and a.get("filename")==filename
             and FILE.fullmatch(a["filename"]),
             "Unsafe immutable native source reference")
        total+=a["native_candles"]
    need(total==index.get("native_daily_candles"),
         "Daily source registry total mismatch")
    return entries

def verified_decimal(raw):
    need(isinstance(raw,str),"Native source price not original decimal text")
    try:value=Decimal(raw)
    except InvalidOperation as exc:
        raise ValueError("Nondecimal original daily OHLCV") from exc
    need(value.is_finite(),"Nonfinite native OHLCV")
    return value

def verify_source(a,opener=urlopen):
    url=REPO+a["release_tag"]+"/"+a["filename"]
    req=Request(url,headers={"User-Agent":"SevenHeaven-Historical-SHA-Registry/1.0"})
    with opener(req,timeout=90) as response:
        need(response.status==200,"Native archive unavailable")
        blob=response.read(MAX_FILE+1)
    need(len(blob)==a["bytes"]
         and hashlib.sha256(blob).hexdigest()==a["sha256"],
         "Original gzip bytes differ from indexed SHA-256")
    decoded=gzip.decompress(blob)
    need(0<len(decoded)<=MAX_PAYLOAD,"Oversized original OHLCV source")
    data=json.loads(decoded)
    owner=data["owner"]
    is_okx=a["venue"]=="OKX Spot"
    expected_schema=("aerith.okx.native-utc-daily-history.verified-response.v1"
         if is_okx else
         "aerith.bitget.native-exchange-daily-history.verified-response.v1")
    need(data.get("schema")==expected_schema
         and data.get("exchange")==a["venue"]
         and data.get("native_interval")==a["bar"]
         and data.get("quote")=="USDT"
         and data.get("filled_by_our_collector") is False
         and data.get("canonical_1m_federation_modified") is False
         and owner.get("id")==a["id"] and owner.get("rank")==a["rank"]
         and owner.get("symbol")==a["symbol"]
         and data.get("market")==a["market"]
         and data.get("native_candles")==a["native_candles"]
         and data.get("earliest_returned_ms")==a["earliest_source_ms"]
         and data.get("latest_returned_ms")==a["latest_source_ms"],
         "Wrong source owner, venue, native resolution or genuine OHLCV count")
    rows=data.get("native_daily_rows")
    need(isinstance(rows,list) and len(rows)==a["native_candles"],
         "Source missing original daily OHLCV rows")
    expected_len=9 if is_okx else 7
    need(all(isinstance(row,list) and len(row)==expected_len for row in rows),
         "Changed original Spot OHLCV field structure")
    ts=[int(row[0]) for row in rows]
    need(ts[0]==a["earliest_source_ms"] and ts[-1]==a["latest_source_ms"]
         and all(b>a and (b-a)%DAY==0 for a,b in zip(ts,ts[1:])),
         "Original session dates out of order, duplicated or shifted")
    gaps=sum((b-a)//DAY-1 for a,b in zip(ts,ts[1:]))
    need(gaps==a["gaps_within_observed_span"],
         "Invented or hidden native Spot day gaps")
    if is_okx:
        need(all(row[8]=="1" for row in rows)
             and all(stamp%DAY==0 for stamp in ts) and gaps==0,
             "OKX returned unconfirmed or nonnative 1Dutc bars")
    else:
        offset=a["native_session_start_modulo_utc_day_ms"]
        if a.get("source_attestation")=="original-named-spot-listing":
            need(owner.get("identity_evidence")==a.get("identity_evidence"),
                 "Bitget named original listing disagrees with archived exact owner")
        need(all(t%DAY==offset for t in ts)
             and data.get("native_session_start_modulo_utc_day_ms")==offset
             and data.get("native_daily_timezone_not_normalized") is True
             and data.get("calendar_days_without_native_bars")==gaps
             and data.get("historical_source_exhaustion_proven") is False,
             "Bitget native 1D timezone or query scope falsely re-labelled")
        for row in rows:
            need(all(isinstance(v,str) for v in row[:7]),
                 "Reconstructed Bitget native daily decimal fields")
            o,h,l,c,v,q=map(verified_decimal,row[1:7])
            need(min(o,h,l,c)>0 and l<=min(o,c) and max(o,c)<=h
                 and min(v,q)>=0,
                 "Native Bitget Spot candle price or volume outside reality")
    digests=data.get("native_source_response_sha256")
    need(isinstance(digests,list) and bool(digests)
         and all(isinstance(sha,str) and SHA.fullmatch(sha) for sha in digests)
         and data.get("source_response_digests_are_exchange_signed") is False,
         "Original API response integrity digests absent or falsely signed")
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
