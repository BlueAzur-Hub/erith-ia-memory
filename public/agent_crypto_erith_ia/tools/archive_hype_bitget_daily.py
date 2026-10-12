#!/usr/bin/env python3
"""Historical Bitget HYPEUSDT *Spot* 1D source, distinct from its futures.
Preserve venue-native daily session and raw API hashes, never promote 1D to 1m.
"""
from __future__ import annotations
import argparse
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import collect_native_bitget_daily_history as source

REPO="BlueAzur-Hub/erith-ia-memory"
TAG="crypto-top25-bitget-hype-native-daily-2026-09"
ROOT=Path(__file__).resolve().parents[1]/"data/historical_archive_prototype"
CAT=ROOT/"top250_multisource_coverage/index.json"
RANKING=ROOT/"top25_historical_expansion/index.json"
FIRST_SPOT="2024-12-18T10:00:00Z"
OFFICIAL="https://www.bitget.com/fr/support/articles/12560603819985"
START=int(dt.datetime(2024,12,1,tzinfo=dt.timezone.utc).timestamp()*1000)
END=int(dt.datetime(2026,10,1,tzinfo=dt.timezone.utc).timestamp()*1000)
ID="hyperliquid"
PAIR="HYPEUSDT"

def require(v,message):
    if not v:raise ValueError(message)
def check():
    c=CAT.read_bytes()
    ranked=json.loads(c)
    doc=json.loads(RANKING.read_text())
    require(ranked["ranked"]==250 and doc["schema"]=="seven.crypto.top25-expansion-plan.v1",
            "Missing frozen ranked spot archive")
    x=ranked["assets"][10]
    require(x["id"]==ID and x["rank"]==11 and x["symbol"]=="HYPE"
            and x["source"]=="Bitget Spot native 1m HTTPS" and x["quote"]=="USDT"
            and x["months"]==3 and x["native_1m_count"]==128160,
            "Bitget historical source identity changed")
    require(doc["added_assets"][0]["id"]==ID,"Top25 original ranking mismatch")
    return {"top250_catalog_sha256":hashlib.sha256(c).hexdigest(),
            "top25_plan_sha256":hashlib.sha256(RANKING.read_bytes()).hexdigest()}
def collect():
    pins=check()
    require(source.END==END and source.START<=START,
            "Underlying Bitget native historical UTC endpoint moved")
    source.START=START
    owner={"id":ID,"rank":11,"name":"Hyperliquid","symbol":"HYPE",
           "pair":PAIR,"venue":"bitget","quote":"USDT",
           "identity_evidence":OFFICIAL}
    result=source.acquire(owner)
    require(result["schema"]==source.SCHEMA and
            result["market"]==PAIR and result["native_interval"]=="1D" and
            result["exchange"]=="Bitget Spot" and result["quote"]=="USDT"
            and result["native_candles"]==len(result["native_daily_rows"])
            and result["utc_start_inclusive_ms"]==START and
            result["utc_end_exclusive_ms"]==END,
            "Wrong native Spot daily source owner or timeline")
    first_utc_day=int(dt.datetime(2024,12,18,tzinfo=dt.timezone.utc).timestamp()*1000)
    # Preserve the source discrepancy as an audit finding. A Bitget public
    # candle with an opening before its own public Spot listing is NOT yet
    # admissible as native HYPE Spot historical OHLCV; never promote it.
    result["pre_listing_source_timestamps_detected"]=(
        result["earliest_returned_ms"]<first_utc_day)
    result["pre_listing_source_rows"]=sum(
        int(row[0])<first_utc_day for row in result["native_daily_rows"])
    require(result["latest_returned_ms"]<END and
            result["native_candles"]>3 and
            result["filled_by_our_collector"] is False and
            result["source_response_digests_are_exchange_signed"] is False,
            "Unverified first-party source candle response")
    return result,pins
def stage(out):
    require(not out.exists(),"Refuse rewriting original native HYPE files")
    data,pins=collect()
    out.mkdir(parents=True)
    if data["pre_listing_source_timestamps_detected"]:
        report={
            "schema":"seven.crypto.top25-hype-original-spot-daily.v1",
            "status":"quarantine_provenance_before_official_spot_listing",
            "original_pair":"HYPEUSDT","venue":"Bitget Spot","original_granularity":"1D",
            "first_official_spot_trading_utc":FIRST_SPOT,
            "first_official_spot_announcement":OFFICIAL,
            "canonical_market_pins":pins,
            "first_native_source_open_ms":data["earliest_returned_ms"],
            "latest_native_source_open_ms":data["latest_returned_ms"],
            "source_native_daily_rows_observed_not_accepted":data["native_candles"],
            "pre_official_listing_source_rows":data["pre_listing_source_rows"],
            "response_sha256":data["native_source_response_sha256"],
            "source_digests_exchange_signed":False,
            "native_ohlcv_published":False,
            "original_native_daily_candles_accepted":0,
            "original_native_minute_candles_accepted":0,
            "no_relabel_or_candle_synthesis":True,"trader_interface_modified":False,
            "investigation":"Why the public Bitget SPOT history endpoint returns daily timestamps earlier than the independently published HYPE Spot listing; verify instrument identity/migration and native 1D timezone."
        }
        (out/"manifest.json").write_text(json.dumps(report,indent=2,sort_keys=True)+"\n")
        print("HYPE SPOT SOURCE PRELISTING QUARANTINE "+json.dumps({
            "first_open_ms":report["first_native_source_open_ms"],
            "native_rows_not_accepted":data["native_candles"],
            "before_listing":data["pre_listing_source_rows"]}),flush=True)
        return report
    name="hyperliquid-HYPEUSDT-BitgetSpot-1D.json.gz"
    packed=source.compress(data)
    (out/name).write_bytes(packed)
    summary={
        "schema":"seven.crypto.top25-hype-original-spot-daily.v1",
        "status":"source_post_official_listing_verified",
        "venue":"Bitget Spot","pair":PAIR,"ranked_coin_id":ID,
        "canonical_market_pins":pins,
        "official_spot_pair_launch_utc":FIRST_SPOT,
        "official_spot_announcement":OFFICIAL,
        "source_original_market":"HYPE/USDT","original_quote":"USDT",
        "granularity":"original venue-native 1D (NOT 1m)",
        "release_page":f"https://github.com/{REPO}/releases/tag/{TAG}",
        "source_retrieval":"Bitget API v3 market/history-candles category=SPOT interval=1D type=market",
        "native_source_daily_open_phase_ms":data["native_session_start_modulo_utc_day_ms"],
        "original_daily_bars":data["native_candles"],
        "original_first_open_ms":data["earliest_returned_ms"],
        "original_last_open_ms":data["latest_returned_ms"],
        "calendar_days_without_original_candle":data["calendar_days_without_native_bars"],
        "source_response_count":len(data["native_source_response_sha256"]),
        "native_response_sha256":data["native_source_response_sha256"],
        "source_response_digests_are_exchange_signed":False,
        "query_coverage_does_not_prove_market_genesis":True,
        "not_1m_candles":True,"trader_interface_modified":False,
        "no_synthetic_candles":True,"no_price_quote_conversion":True,
        "original_native_payload":{
            "name":name,"bytes":len(packed),
            "sha256":hashlib.sha256(packed).hexdigest(),
            "url":f"https://github.com/{REPO}/releases/download/{TAG}/{name}"},
        "readme":"Original native Bitget daily exchange opens are preserved, including UTC+8 sessions where applicable. This is NOT normalized to 1Dutc or fused with Binance Spot 1m."
    }
    (out/"manifest.json").write_text(json.dumps(summary,indent=2,sort_keys=True)+"\n")
    require({p.name for p in out.iterdir()}=={"manifest.json",name},
            "Unidentified source payload in archive")
    print("HYPE BITGET SPOT DAILY VERIFIED "+json.dumps({
        k:summary[k] for k in ("original_daily_bars","calendar_days_without_original_candle",
                               "native_source_daily_open_phase_ms","source_response_count")},sort_keys=True))
    return summary
def self_test():
    check()
    require(source.SCHEMA=="aerith.bitget.native-exchange-daily-history.verified-response.v1"
            and FIRST_SPOT=="2024-12-18T10:00:00Z",
            "Underlying verified Bitget source or historical pair listing changed")
    print("PASS: Bitget HYPEUSDT original Spot owner and native 1D granularity pinned")
if __name__=="__main__":
    p=argparse.ArgumentParser()
    mode=p.add_mutually_exclusive_group(required=True)
    mode.add_argument("--self-test",action="store_true")
    mode.add_argument("--collect",action="store_true")
    p.add_argument("--output",type=Path)
    opts=p.parse_args()
    if opts.self_test:self_test()
    else:
        require(opts.output is not None and os.environ.get("GITHUB_ACTIONS")=="true"
                and os.environ.get("GITHUB_REPOSITORY")==REPO,
                "Only authorized GitHub Actions may publish HYPE source evidence")
        stage(opts.output)
