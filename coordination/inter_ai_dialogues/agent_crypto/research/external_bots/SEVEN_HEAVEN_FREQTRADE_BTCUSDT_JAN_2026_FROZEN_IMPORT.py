#!/usr/bin/env python3
"""Exact immutable January Binance 1m CSV -> Freqtrade JSON positional OHLCV.

No new market download and no account data. Does not claim Freqtrade engine
execution unless the separate pinned/isolated Docker step succeeds.
"""
from __future__ import annotations
import argparse
import csv
import hashlib
import json
from pathlib import Path

EXPECTED_SHA = "38a2e6ce6e76ccfeca2e421679ee39ef4467f0426cf0064610b25100307f54c4"
EXPECTED_ROWS = 44640
EXPECTED_START = 1767225600
EXPECTED_LAST = 1769903940


def convert(csv_path: Path, dest: Path) -> dict:
    digest=hashlib.sha256(csv_path.read_bytes()).hexdigest()
    if digest!=EXPECTED_SHA:
        raise ValueError("BAD_IMMUTABLE_CSV_SHA256")
    rows=[]
    with csv_path.open("r",encoding="utf-8",newline="") as f:
        reader=csv.DictReader(f)
        if reader.fieldnames!=["timestamp","open","high","low","close","volume"]:
            raise ValueError("UNEXPECTED_OHLCV_COLUMNS")
        for idx,row in enumerate(reader):
            t=int(row["timestamp"])
            if idx>=EXPECTED_ROWS or t!=EXPECTED_START+60*idx:
                raise ValueError(f"MINUTE_GAP_OR_DUPLICATE_{idx}")
            o,h,l,c,v=(float(row[k]) for k in ("open","high","low","close","volume"))
            if not (0<l<=min(o,c)<=max(o,c)<=h and v>=0):
                raise ValueError(f"INVALID_OHLCV_{idx}")
            rows.append([t*1000,o,h,l,c,v])
    if len(rows)!=EXPECTED_ROWS or rows[-1][0]!=EXPECTED_LAST*1000:
        raise ValueError("INCOMPLETE_MONTH")
    dest.mkdir(parents=True,exist_ok=True)
    outfile=dest/"BTC_USDT-1m.json"
    outfile.write_text(json.dumps(rows,separators=(",",":"),allow_nan=False)+"\n",encoding="utf-8")
    report={
      "schema":"seven.heaven.freqtrade.source_import.v1",
      "status":"PASS_SOURCE_CONVERSION_NOT_BACKTEST",
      "source_sha256":EXPECTED_SHA,
      "pair":"BTC/USDT","timeframe":"1m",
      "first_timestamp_ms":rows[0][0],"last_timestamp_ms":rows[-1][0],
      "rows":len(rows),"output_file":outfile.name,
      "output_sha256":hashlib.sha256(outfile.read_bytes()).hexdigest(),
      "wallet_connection":False,"orders_sent":0,
    }
    (dest/"SEVEN_HEAVEN_FREQTRADE_DATA_SOURCE_AUDIT.json").write_text(
        json.dumps(report,indent=2)+"\n",encoding="utf-8")
    return report


if __name__=="__main__":
    ap=argparse.ArgumentParser()
    ap.add_argument("--source-csv",type=Path,required=True)
    ap.add_argument("--output-dir",type=Path,required=True)
    a=ap.parse_args()
    print(json.dumps(convert(a.source_csv,a.output_dir),indent=2))
