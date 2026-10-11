#!/usr/bin/env python3
"""Pin a historical BTC daily reference without changing candle files.

Reference is Binance Spot BTCUSDT 1d, 2018-05-01..2026-09-30 inclusive:
3,049 verified complete-minute aggregates + 26 verified original Binance
native 1d days. This DOES NOT certify missing minute candles, nor all-time BTC.
"""
from __future__ import annotations
from datetime import datetime, timezone
import argparse
import gzip
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "data/historical_archive_prototype"
OUTPUT = ROOT / "btc_daily_reference" / "index.json"
INDEX = "btc_native_daily_reconciliation/index.json"
EXPECTED_START = 1525132800000  # 2018-05-01 UTC
EXPECTED_END = 1790726400000    # 2026-09-30 UTC
DAY = 86_400_000


def check(ok, message):
    if not ok:
        raise ValueError(message)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def build(root=ROOT):
    root = Path(root)
    manifest_data=(root / INDEX).read_bytes()
    manifest=json.loads(manifest_data)
    check(manifest["schema"]=="seven.crypto.btc.native-1d-reconciliation-index.v1"
          and manifest["asset_id"]=="bitcoin" and manifest["pair"]=="BTCUSDT"
          and manifest["quote"]=="USDT" and manifest["is_live"] is False
          and manifest["is_all_time"] is False
          and manifest["file"]=="bitcoin-Max.json.gz"
          and manifest["bars"]==3075 and manifest["original_bars"]==3049
          and manifest["native_1d_recovered"]==26 and manifest["unresolved_count"]==0
          and manifest["missing_minutes_unchanged"]==5881
          and manifest["first_open_ms"]==EXPECTED_START
          and manifest["last_open_ms"]==EXPECTED_END
          and manifest["gaps"]==[] and len(manifest["source_dates"])==26,
          "Native BTC daily reference contract changed: refuse freezing")
    compressed=(root/"btc_native_daily_reconciliation"/manifest["file"]).read_bytes()
    check(len(compressed)==manifest["bytes"] and sha(compressed)==manifest["sha256"],
          "SHA-256 of certified BTC daily archive mismatch")
    candle=json.loads(gzip.decompress(compressed))
    rows=candle["rows"]
    check(candle["schema"]=="seven.crypto.btc.native-1d-reconciliation.v1"
          and candle["asset_id"]=="bitcoin" and candle["pair"]=="BTCUSDT"
          and candle["quote"]=="USDT" and candle["interval"]=="1d"
          and candle["is_live"] is False and candle["is_all_time"] is False
          and candle["native_1m_gaps_preserved"] is True
          and candle["source"]=="Binance Spot original verified 1m and native 1d"
          and candle["columns"]==
          ["open_time_ms","open","high","low","close",
           "base_volume","quote_volume","trade_count"]
          and len(rows)==3075 and len(candle["native_1d_overrides"])==26
          and candle["gaps"]==[], "Daily source payload is not trusted")
    for i,r in enumerate(rows):
        check(len(r)==8 and r[0]==EXPECTED_START+i*DAY
              and r[3]>0 and r[3]<=min(r[1],r[4])
              and max(r[1],r[4])<=r[2]
              and r[5]>=0 and r[6]>=0 and type(r[7]) is int and r[7]>=0,
              "UTC continuity / OHLCV daily invariant failed")
    check(rows[-1][0]==EXPECTED_END, "BTC historical reference end shifted")
    proof_dates={p["open_time_ms"] for p in candle["native_1d_overrides"]}
    check(len(proof_dates)==26 and
          all(p["native_1d"]["pair"]=="BTCUSDT"
              and p["native_1d"]["quote"]=="USDT"
              and p["native_1d"]["interval"]=="1d"
              and p["native_1d"]["venue"]=="Binance Spot"
              and len(p["native_1d"]["zip_sha256"])==64
              and len(p["native_1d"]["checksum_sha256"])==64
              for p in candle["native_1d_overrides"]),
          "Official daily source evidence missing")
    return {
      "schema":"seven.crypto.btc.daily-reference.v1",
      "status":"verified_frozen_closed_interval",
      "asset_id":"bitcoin","venue":"Binance Spot","pair":"BTCUSDT",
      "quote":"USDT","resolution":"1d","is_live":False,"is_all_time":False,
      "first_open_utc":"2018-05-01T00:00:00Z",
      "last_open_utc":"2026-09-30T00:00:00Z",
      "utc_day_count":3075,"daily_coverage_pct":100,
      "gaps_in_daily_series":0,
      "one_minute_missing_original":5881,
      "one_minute_complete":False,
      "minute_coverage_not_claimed":True,
      "daily_candle_provenance":{
         "minute_complete_derived_days":3049,"independent_native_1d_days":26},
      "locked_source":{
          "index_path":INDEX,
          "index_sha256":sha(manifest_data),
          "data_path":"btc_native_daily_reconciliation/bitcoin-Max.json.gz",
          "data_sha256":sha(compressed),
          "data_bytes":len(compressed),
          "source_catalog_sha256":manifest["source_catalog_sha256"]},
      "notes":"Frozen source reference. Do not rewrite source archives. Daily 1d continuity does not repair missing native 1m candles. No USD conversion and not BTC all-time."
    }


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--output",type=Path,default=OUTPUT)
    p.add_argument("--check-only",action="store_true")
    args=p.parse_args()
    obj=build()
    if args.check_only:
        print("VERIFIED BTC DAILY REFERENCE",json.dumps(obj,sort_keys=True))
        return
    args.output.parent.mkdir(parents=True,exist_ok=True)
    # Stable canonical JSON, reproducible SHA, no timestamps or synthetic values.
    args.output.write_text(json.dumps(obj,sort_keys=True,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print("FROZEN VERIFIED BTC DAILY REFERENCE",obj["utc_day_count"],obj["locked_source"]["data_sha256"])


if __name__=="__main__":main()
