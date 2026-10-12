#!/usr/bin/env python3
"""Restore two official first-listing-month original Spot 1m archives.
SHIBUSDT May-2021; QNTUSDT July-2021, without changing other source dates.
Original Binance ZIP + CHECKSUM; exact OHLCV SQLite; gaps kept explicit.
"""
from __future__ import annotations
import argparse
from concurrent.futures import ThreadPoolExecutor,as_completed
from pathlib import Path
import json
import os
import archive_top50_pilot_spot as original

ROOT=Path(__file__).resolve().parents[1]/"data/historical_archive_prototype"
REPO="BlueAzur-Hub/erith-ia-memory"
TAG="crypto-top50-original-first-listing-shib-qnt-2021"
TARGETS=(("shiba-inu","2021-05"),("quant-network","2021-07"))
def need(v,why):
    if not v:raise ValueError(why)
def self_test():
    original.self_test()
    doc=original.pin_catalog()
    need(len(TARGETS)==2 and
        original.ASSETS["shiba-inu"]["first_pair_utc"]=="2021-05-10T11:00:00Z" and
        original.ASSETS["quant-network"]["first_pair_utc"]=="2021-07-29T06:00:00Z",
        "Original public first Spot listing evidence changed")
    need(all(original.ASSETS[coin]["pair"]==original.ASSETS[coin]["symbol"]+"USDT"
             for coin,_ in TARGETS),"Wrong original Spot quote pair")
    print("PASS: exact 2021 first-trading-month sources SHIBUSDT + QNTUSDT with official Binance signatures")
def stage(out):
    need(not out.exists(),"Refuse replacing native first-month archive")
    pins=original.pin_catalog()
    original.BATCH="first-listing-shib-qnt-2021"
    # Match base collector's released URLs to this exact immutable tag.
    need(original.release_tag(original.BATCH)==TAG,
         "Release identity cannot be attached to exact original source")
    out.mkdir(parents=True)
    rows=[]
    with ThreadPoolExecutor(max_workers=2) as pool:
        futures={pool.submit(original.one,cid,month,out):(cid,month)
                 for cid,month in TARGETS}
        for fut in as_completed(futures):
            row=fut.result()
            need((row["asset_id"],row["month"])==futures[fut],
                 "Wrong native original Spot timestamp ownership")
            rows.append(row)
            print("TOP50 FIRST ORIGINAL NATIVE MONTH "+json.dumps({
                "asset":row["asset_id"],"month":row["month"],"status":row["status"],
                "original_native_rows":row["native_rows"]},sort_keys=True),flush=True)
    rows.sort(key=lambda x:x["asset_id"])
    approved=[r for r in rows if r["status"] in original.STATUS_OK]
    strict=[r for r in approved if r["strict_utc_aligned"]]
    need(len(rows)==2 and all(r["status"] in original.STATUS_OK for r in rows)
         and all(r["strict_utc_aligned"] for r in approved),
         "First listing month native source incomplete or unverified: do not publish")
    need(all(r["native_rows"]>0 and r["missing_1m_minutes"]>0 for r in strict),
         "Original listing month must preserve pre-listing calendar gap")
    expected={"manifest.json"}|{r[k]["name"] for r in approved
            for k in ("source_zip","official_checksum","sqlite")}
    need({f.name for f in out.iterdir()}|{"manifest.json"}==expected and len(expected)==7,
         "Unexpected original source output inventory")
    doc={
        "schema":"seven.crypto.top50-first-listing-original-months.v1",
        "original_market_pairs":["SHIBUSDT","QNTUSDT"],
        "months_by_original_market":{"SHIBUSDT":"2021-05","QNTUSDT":"2021-07"},
        "ranked_catalog_pins":pins,
        "release_page":f"https://github.com/{REPO}/releases/tag/{TAG}",
        "source":"Original Binance Spot native monthly 1m ZIP plus official CHECKSUM",
        "native_quote":"USDT","native_granularity":"1m",
        "verified_original_month_pairs":2,
        "strict_native_original_rows":sum(r["native_rows"] for r in rows),
        "prelisting_plus_other_missing_calendar_minutes":sum(r["missing_1m_minutes"] for r in rows),
        "original_listing_start":{
            "SHIBUSDT":{"utc":"2021-05-10T11:00:00Z","official":"https://www.binance.com/en/support/announcement/detail/f1fe616e688b452f9d736753cb2d947a"},
            "QNTUSDT":{"utc":"2021-07-29T06:00:00Z","official":"https://www.binance.com/en/support/announcement/detail/053a6010adc844e29e3859a460e32d12"}
        },
        "no_price_or_volume_adjustment":True,"no_synthetic_candles":True,
        "not_all_time_history":True,"trader_interface_unchanged":True,
        "records":rows}
    (out/"manifest.json").write_text(json.dumps(doc,indent=2,sort_keys=True)+"\n")
    need({f.name for f in out.iterdir()}==expected,"Native source file mismatch")
    print("TOP50 FIRST-LISTING ORIGINAL SOURCE VERIFIED "+json.dumps({
         "months":2,"native_rows":doc["strict_native_original_rows"],
         "source_gaps":doc["prelisting_plus_other_missing_calendar_minutes"]}))
if __name__=="__main__":
    p=argparse.ArgumentParser()
    t=p.add_mutually_exclusive_group(required=True)
    t.add_argument("--self-test",action="store_true")
    t.add_argument("--stage",action="store_true")
    p.add_argument("--output",type=Path)
    x=p.parse_args()
    if x.self_test:self_test()
    else:
       need(x.output is not None and os.environ.get("GITHUB_ACTIONS")=="true"
            and os.environ.get("GITHUB_REPOSITORY")==REPO,
            "Original source processing only in authorized GitHub Actions")
       stage(x.output)
