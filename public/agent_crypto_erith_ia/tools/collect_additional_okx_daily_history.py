#!/usr/bin/env python3
"""Acquire second independently named OKX Spot UTC-daily source cohort.

Global Dollar, Pi Network and Flare are each independently identified by
their official OKX spot-listing notices. Never convert USDT to USD and never
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

TAG="crypto-okx-spot-native-daily-2026-09-usdg-pi-flr"
PROOFS=(
 ("global-dollar",37,"USDG","Global Dollar",
  "https://www.okx.com/en-gb/help/okx-will-launch-usdg-usdt-for-spot-trading"),
 ("pi-network",82,"PI","Pi Network",
  "https://www.okx.com/en-us/help/okx-to-list-pi-pi-network-for-spot-trading"),
 ("flare-networks",105,"FLR","Flare",
  "https://www.okx.com/en-us/help/okx-to-distribute-flare-network-flr-airdrop-and-enable-spot-trading"),
)

def owners(fed,venues):
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
    result=[]
    for cid,rank,ticker,name,proof in PROOFS:
        row=indexed.get(cid)
        daily.need(row is not None and row["rank"]==rank and
             row["symbol"]==ticker and row["name"]==name and
             row["months"]==0 and row["source"] is None and row["quote"]=="USDT",
             "Exact ranked crypto ID changed or 1m already archived: "+cid)
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
    daily.need(len(result)==len(PROOFS)==len({x["instrument"] for x in result}),
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
             "--title","Native OKX Spot UTC daily history · Global Dollar, Pi, Flare",
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
    qualified=owners(fed,spot)
    if args.plan:
        print("OKX THREE MORE DAILY PLAN "+json.dumps({
            "owners":qualified,"source_interval":"1Dutc","published":False},
            sort_keys=True));return
    rows=daily.collect(qualified)
    if args.probe:
        print("OKX SECONDARY SOURCE PROBE COMPLETE; NO PUBLICATION",flush=True)
        return
    publish(rows)

if __name__=="__main__":
    main()
