#!/usr/bin/env python3
"""Acquire a separately verified native OKX UTC-daily Spot source cohort.

Each asset has independent proof of its real named OKX Spot listing. Never convert USDT to USD and never
count 1Dutc bars as 1m. Reuses source validation from OKX first cohort.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile

import collect_native_okx_daily_history as daily

TAG="crypto-okx-spot-native-daily-2026-09-leo-cc-nft-a-fluid-s"
PROOFS=(
 ("leo-token",18,"LEO","LEO Token",
  "https://www.okx.com/en-ae/help/okx-to-adjust-the-minimum-trade-amount-of-spots-2023-11-29"),
 ("canton-network",24,"CC","Canton",
  "https://www.okx.com/en-us/help/okx-to-list-cc-canton-for-spot-trading"),
 ("apenft",168,"NFT","AINFT",
  "https://www.okx.com/en-eu/help/okx-will-list-apenft-nft-token-for-spot-trading-and-launch-nft-staking"),
 ("vaulta",201,"A","Vaulta",
  "https://www.okx.com/en-eu/help/okx-completed-eos-token-migration"),
 ("instadapp",202,"FLUID","Fluid",
  "https://www.okx.com/en-us/help/okx-to-list-fluid-fluid-for-spot-trading"),
 ("sonic-3",203,"S","Sonic",
  "https://www.okx.com/en-gb/help/okx-completed-ftm-token-migration"),
)

def owners(fed,venues,published=None):
    daily.need(fed.get("schema")==
          "aerith.public.ohlcv.top250.federated-native-archives.v1"
          and fed.get("ranked")==250 and len(fed.get("assets",[]))==250
          and len({a["id"] for a in fed["assets"]})==250,
          "Non-canonical Top250 source")
    daily.need(venues.get("schema")==
          "aerith.public.ohlcv.spot.top250.official-instrument-candidates.v1",
          "Missing official venue inventory")
    indexed={a["id"]:a for a in fed["assets"]}
    instruments={a["id"]:a for a in venues.get("assets",[])}
    # This immutable historical cohort has already been released. An
    # official audit now excludes archived owners: do not require their
    # old trading-pair hint or recollect unchanged native candles.
    refs={} if published is None else {a["id"]:a for a in published.get("assets",[])}
    if published is not None:
        daily.need(published.get("schema")==
              "aerith.public.crypto.multiresolution-sources.v1" and
              len(refs)==published.get("asset_count")==len(published.get("assets",[])),
              "Malformed existing native daily archive registry")
    result=[]
    for cid,rank,ticker,name,proof in PROOFS:
        row=indexed.get(cid)
        daily.need(row is not None and row["rank"]==rank and
             row["symbol"]==ticker and row["name"]==name and
             row["months"]==0 and row["source"] is None and row["quote"]=="USDT",
             "Exact ranked crypto ID changed or 1m already archived: "+cid)
        prior=refs.get(cid)
        if prior:
            daily.need(prior.get("rank")==rank and
                 prior.get("symbol")==ticker and prior.get("name")==name and
                 prior.get("venue")=="OKX Spot" and
                 prior.get("market")==ticker+"-USDT" and
                 prior.get("bar")=="1Dutc" and prior.get("quote")=="USDT" and
                 prior.get("release_tag")==TAG and
                 isinstance(prior.get("native_candles"),int) and
                 prior["native_candles"]>0 and prior.get("sha256"),
                 "Published native daily source identity or checksum mismatch: "+cid)
            continue
        venue=instruments.get(cid)
        daily.need(venue and venue["rank"]==rank and venue["symbol"]==ticker
             and any(x.get("venue")=="okx" and x.get("base")==ticker
                  and x.get("quote")=="USDT" and
                  x.get("instrument")==ticker+"-USDT" and
                  x.get("exchange_instrument_confirmed") is True
                  for x in venue.get("instruments",[])),
             "Official native OKX Spot pair is not confirmed: "+cid)
        daily.need(proof.startswith("https://www.okx.com/") and
             "/help/" in proof,"Missing official Spot project listing")
        result.append({"id":cid,"rank":rank,"name":name,
            "symbol":ticker,"quote":"USDT","instrument":ticker+"-USDT",
            "identity_evidence":proof})
    daily.need(len(result)==len({x["instrument"] for x in result}),
               "Repeated Spot owner")
    return result

def publish(payloads):
    daily.need(os.getenv("GITHUB_ACTIONS")=="true"
         and os.getenv("GITHUB_REPOSITORY")==daily.REPO
         and os.getenv("GITHUB_REF")=="refs/heads/main"
         and os.getenv("GH_TOKEN") and os.getenv("GITHUB_SHA"),
         "Only reviewed production GitHub Actions may publish")
    check=subprocess.run(["gh","release","view",TAG,"--json","tagName"],
                         capture_output=True,text=True,timeout=40)
    daily.need(check.returncode!=0 and
         ("not found" in check.stderr.lower() or
          "http 404" in check.stderr.lower()),
         "Previous immutable Release exists or GitHub state unknown")
    with tempfile.TemporaryDirectory(prefix="okx-second-native-daily-") as td:
        folder=Path(td)
        docs=[]
        for obj in payloads:
            cid=obj["owner"]["id"]
            filename=cid+"-"+obj["market"]+"-1Dutc.json.gz"
            blob=daily.compress(obj)
            (folder/filename).write_bytes(blob)
            docs.append({
              "id":cid,"market":obj["market"],"interval":"1Dutc",
              "source_first_ms":obj["earliest_returned_ms"],
              "source_last_ms":obj["latest_returned_ms"],
              "native_daily_count":obj["native_candles"],
              "missing_source_days":obj["calendar_days_without_native_bars"],
              "source_end_observed":obj["source_exhausted_within_query_bounds"],
              "filename":filename,"bytes":len(blob),
              "sha256":hashlib.sha256(blob).hexdigest()})
        manifest={"schema":"aerith.okx.native-daily-release-manifest.v1",
                  "source":"OKX public Spot history-candles 1Dutc",
                  "assets":docs,"counted_in_canonical_1m_top250":False,
                  "native_1m_candles":0,"quote":"USDT",
                  "response_digests_are_exchange_signed":False,
                  "no_currency_conversion":True,
                  "no_synthetic_candles_added_by_collector":True}
        (folder/"manifest.json").write_text(json.dumps(
                    manifest,sort_keys=True,indent=2)+"\n")
        cmd=["gh","release","create",TAG,
             *(str(folder/x["filename"]) for x in docs),
             str(folder/"manifest.json"),
             "--title","Native OKX Spot UTC daily history · LEO, CC, NFT, A, FLUID, S",
             "--notes","Original public OKX Spot 1Dutc OHLCV, with timestamps, original USDT quote and SHA-256 of retrieved responses. Unlike Binance ZIPs, OKX responses are not exchange-signed archives. Not yet part of the canonical native 1m Top250 counter. No trading orders and no interpolated candles.",
             "--target",os.environ["GITHUB_SHA"],"--latest=false"]
        proc=subprocess.run(cmd,capture_output=True,text=True,timeout=150)
        daily.need(proc.returncode==0,
              "Cannot publish authentic daily source: "+proc.stderr[-450:])
        print("OKX VERIFIED SECONDARY DAILY RELEASE "+json.dumps({
              "url":proc.stdout.strip(),"tag":TAG,"assets":docs,
              "catalog_1m_untouched":True},sort_keys=True),flush=True)

def main():
    p=argparse.ArgumentParser(description=__doc__)
    group=p.add_mutually_exclusive_group(required=True)
    group.add_argument("--plan",action="store_true")
    group.add_argument("--probe",action="store_true")
    group.add_argument("--publish",action="store_true")
    args=p.parse_args()
    fed=json.loads(daily.FED.read_text(encoding="utf-8"))
    spot=json.loads(daily.VENUES.read_text(encoding="utf-8"))
    registry=json.loads((daily.FED.parent/
               "top250_multiresolution_sources/index.json").read_text(encoding="utf-8"))
    qualified=owners(fed,spot,registry)
    if args.plan:
        print("OKX SIX VERIFIED DAILY PLAN "+json.dumps({
            "owners":qualified,"source_interval":"1Dutc","published":False},
            sort_keys=True));return
    if not qualified:
        print("OKX SIX VERIFIED DAILY NOOP: all original sources already "
              "published, do not recreate the immutable Release",flush=True)
        return
    rows=daily.collect(qualified)
    if args.probe:
        print("OKX SIX VERIFIED DAILY SOURCE PROBE COMPLETE; NO PUBLICATION",flush=True)
        return
    publish(rows)

if __name__=="__main__":
    main()
