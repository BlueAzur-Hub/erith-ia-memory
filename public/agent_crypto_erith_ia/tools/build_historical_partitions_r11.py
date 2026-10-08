#!/usr/bin/env python3
"""R11 offline prototype: sealed UTC OHLCV partitions + non-published pending tail.

Never change the R2/R8 source, R9 compact catalog, browser UI or R10 scheduler.
The only output is a caller-chosen standalone partitions_r11 directory.
"""
from __future__ import annotations
import argparse
import datetime as dt
import gzip
import json
import re
import tempfile
from pathlib import Path
from append_historical_top10_ohlcv_r4 import MS, candle, parse_key, sha
from build_historical_compact_r9 import COLUMNS, packed_json, verified_source

UTC = dt.timezone.utc
SCHEMA = "aerith.public.ohlcv.spot.partitions.r11.index.v1"
BLOCK = "aerith.public.ohlcv.spot.partitions.r11.sealed.v1"

def need(ok, why):
    if not ok:
        raise ValueError(why)

def bucket(period, timestamp):
    t = dt.datetime.fromtimestamp(timestamp / 1000, tz=UTC)
    if period == "24h":
        start = t.replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + dt.timedelta(days=1)
        name = "day-" + start.strftime("%Y%m%d")
    elif period == "7d":
        start = (t - dt.timedelta(days=t.weekday())).replace(
            hour=0, minute=0, second=0, microsecond=0)
        end = start + dt.timedelta(days=7)
        name = "week-" + start.strftime("%Y%m%d")
    elif period == "30d":
        start = t.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end = (start.replace(year=start.year+1, month=1) if start.month == 12
               else start.replace(month=start.month+1))
        name = "month-" + start.strftime("%Y%m")
    else:
        raise ValueError("Unqualified period")
    return name, int(start.timestamp()*1000), int(end.timestamp()*1000)

def plan(source, source_sha, manifest, series):
    need(source["source"] == "Binance Spot" and source["quote_asset"] == "USDT",
         "Unqualified original source")
    need(re.fullmatch(r"[a-f0-9]{64}", source_sha) is not None,
         "Missing original index digest")
    need(source["series_count"] == 21 and len(source["coverage"]) == 21,
         "21 series required")
    need(len(source["deltas"]) <= 100, "100 delta safety limit exceeded")
    asof = dt.datetime.fromisoformat(source["updated_at"].replace("Z", "+00:00"))
    need(asof.tzinfo is not None and asof.utcoffset() == dt.timedelta(0),
         "Expected UTC snapshot")
    asof_ms = int(asof.timestamp()*1000)
    entries, blobs, all_keys = [], {}, set()
    for item in source["coverage"]:
        aid, period, pair = item["id"], item["period"], item["pair"]
        key = parse_key(aid, period)
        need(key in series and key not in all_keys, "Missing/repeated R8 series")
        all_keys.add(key)
        need(re.fullmatch(r"[a-z0-9-]+", aid) is not None and
             re.fullmatch(r"[A-Z0-9]+USDT", pair) is not None,
             "Bad asset or quote")
        need(period in MS and item["interval"] == MS[period][1],
             "Bad interval")
        rows, step = series[key], MS[period][0]
        need(len(rows) == item["candles"] and len(rows) > 0 and
             rows[0][0] == item["first_open_ms"] and
             rows[-1][0] == item["last_open_ms"], "Coverage changed")
        chunks = []
        prev = None
        for row in rows:
            t = candle(row, step)
            need((prev is None or t == prev+step) and t+step <= asof_ms,
                 "Gap, duplicate or unclosed candle")
            prev = t
            name, lo, hi = bucket(period, t)
            if not chunks or chunks[-1][0] != name:
                chunks.append((name, lo, hi, []))
            chunks[-1][3].append(row)
        sealed, pending, tail_started = [], [], False
        for name, lo, hi, bars in chunks:
            summary = {"bucket": name, "bucket_start_ms": lo,
                       "bucket_end_ms": hi, "first_open_ms": bars[0][0],
                       "last_open_ms": bars[-1][0], "candles": len(bars)}
            complete = hi <= asof_ms and bars[-1][0]+step == hi
            if complete:
                need(not tail_started, "Sealed bucket after unfinished bucket")
                block = {"schema": BLOCK, "source": "Binance Spot",
                         "quote_asset": "USDT", "id": aid, "pair": pair,
                         "period": period, "interval": item["interval"],
                         "columns": COLUMNS, **summary, "rows": bars}
                zipped = gzip.compress(packed_json(block), compresslevel=9, mtime=0)
                digest = sha(zipped)
                fname = f"series/{aid}_{period}_{name}_{digest[:16]}.json.gz"
                need(fname not in blobs, "Repeated partition filename")
                blobs[fname] = zipped
                sealed.append({**summary, "file": fname,
                               "bytes": len(zipped), "sha256": digest})
            else:
                tail_started = True
                pending.append({**summary, "rows_sha256": sha(packed_json(bars))})
        entries.append({"id": aid, "pair": pair, "period": period,
                        "interval": item["interval"],
                        "first_open_ms": item["first_open_ms"],
                        "last_open_ms": item["last_open_ms"],
                        "candles": len(rows), "sealed": sealed, "pending": pending})
    need(all_keys == set(series), "Unexpected R8 series")
    catalog = {"schema": SCHEMA, "status": "OFFLINE_PILOT_ONLY",
               "source": "Binance Spot", "quote_asset": "USDT",
               "basket_reference": manifest["reference"],
               "source_index_sha256": source_sha,
               "source_index_updated_at": source["updated_at"],
               "source_delta_count": len(source["deltas"]),
               "source_seed": source["seed"],
               "series_count": len(entries),
               "candles_total": source["candles_total"],
               "sealed_blocks_total": sum(len(x["sealed"]) for x in entries),
               "pending_candles_total": sum(sum(p["candles"] for p in x["pending"])
                                            for x in entries),
               "bucket_policy": {"24h": "UTC day", "7d": "UTC Monday week",
                                 "30d": "UTC calendar month"},
               "note": "Unsealed candles remain only in the verified R8/R9 source",
               "series": entries}
    need(sum(e["candles"] for e in entries) == source["candles_total"],
         "Source candle count mismatch")
    return catalog, blobs

def ensure_destination(target):
    target = Path(target)
    need(target.name == "partitions_r11",
         "Writes allowed only in an explicit partitions_r11 directory")
    return target

def build(target, catalog, blobs):
    target = ensure_destination(target)
    result = "NOOP"
    for name, data in blobs.items():
        path = target/name
        if path.exists():
            need(path.read_bytes() == data, "Immutable partition conflict")
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
            result = "BUILT"
    payload = json.dumps(catalog, ensure_ascii=False, indent=2,
                         allow_nan=False).encode("utf-8")+b"\n"
    index = target/"index.json"
    if not index.exists() or index.read_bytes() != payload:
        target.mkdir(parents=True, exist_ok=True)
        index.write_bytes(payload)
        result = "BUILT"
    return result

def verify(target, expected, series):
    target = ensure_destination(target)
    index = json.loads((target/"index.json").read_text(encoding="utf-8"))
    need(index == expected, "Partition catalog differs from verified R8")
    totals, seals, tails = 0, 0, 0
    for item in index["series"]:
        key = parse_key(item["id"], item["period"])
        original = series[key]
        reconstructed = []
        for part in item["sealed"]:
            name = part["file"]
            need(re.fullmatch(
                r"series/[a-z0-9-]+_(24h|7d|30d)_(day|week|month)-[0-9]{6,8}_[a-f0-9]{16}\.json\.gz",
                name) is not None and
                name.endswith("_"+part["sha256"][:16]+".json.gz"),
                "Unsafe or mismatched shard path")
            data = (target/name).read_bytes()
            need(len(data) == part["bytes"] and sha(data) == part["sha256"],
                 "Partition SHA-256 failure")
            block = json.loads(gzip.decompress(data))
            need(block["schema"] == BLOCK and block["source"] == "Binance Spot"
                 and block["quote_asset"] == "USDT" and block["columns"] == COLUMNS
                 and all(block[k] == item[k] for k in
                         ("id", "pair", "period", "interval"))
                 and all(block[k] == part[k] for k in
                         ("bucket", "bucket_start_ms", "bucket_end_ms",
                          "first_open_ms", "last_open_ms", "candles"))
                 and len(block["rows"]) == part["candles"],
                 "Partition payload changed")
            reconstructed.extend(block["rows"])
            seals += 1
        for part in item["pending"]:
            start = len(reconstructed)
            remaining = original[start:start+part["candles"]]
            need(len(remaining) == part["candles"] and
                 sha(packed_json(remaining)) == part["rows_sha256"],
                 "Unsealed tail digest mismatch")
            reconstructed.extend(remaining)
            tails += len(remaining)
        need(reconstructed == original, "R11 differs from original OHLCV: "+key)
        previous, step = None, MS[item["period"]][0]
        for row in reconstructed:
            t = candle(row, step)
            need(previous is None or t == previous+step,
                 "Partition seam gap/duplicate")
            previous = t
        need(reconstructed[0][0] == item["first_open_ms"] and
             previous == item["last_open_ms"], "Partition bounds mismatch")
        totals += len(reconstructed)
    need(totals == index["candles_total"] and
         seals == index["sealed_blocks_total"] and
         tails == index["pending_candles_total"],
         "Partition count mismatch")
    return {"result": "R11_VERIFIED_EQUAL_TO_R8", "series": len(index["series"]),
            "candles": totals, "sealed_blocks": seals,
            "pending_candles": tails, "source_untouched": True}

def self_test():
    def stamp(year, month, day, hour=0, minute=0):
        return int(dt.datetime(year,month,day,hour,minute,tzinfo=UTC).timestamp()*1000)
    def bar(t): return [t,2.0,3.0,1.0,2.5,10.0,25.0,3]
    offsets = {"24h": [stamp(2026,10,7,23,50),stamp(2026,10,7,23,55),
                         stamp(2026,10,8,0),stamp(2026,10,8,0,5)],
               "7d": [stamp(2026,10,4,22),stamp(2026,10,4,23),
                       stamp(2026,10,5,0),stamp(2026,10,5,1)],
               "30d": [stamp(2026,9,30,20),stamp(2026,10,1,0),
                        stamp(2026,10,1,4)]}
    source = {"source":"Binance Spot", "quote_asset":"USDT",
              "updated_at":"2026-10-08T06:00:00Z", "deltas":[],
              "seed":{"file":"test-only"}, "series_count":21,"coverage":[]}
    manifest = {"reference":"synthetic-memory-only"}
    values = {}
    for n in range(7):
        aid, pair = "unitcoin"+str(n), "UNIT"+str(n)+"USDT"
        for period in MS:
            rows = [bar(t) for t in offsets[period]]
            values[parse_key(aid,period)] = rows
            source["coverage"].append({"id":aid, "pair":pair,
                "period":period,"interval":MS[period][1],
                "first_open_ms":rows[0][0],"last_open_ms":rows[-1][0],
                "candles":len(rows)})
    source["candles_total"] = sum(len(x) for x in values.values())
    catalog, zipped = plan(source, "a"*64, manifest, values)
    need(catalog["sealed_blocks_total"] == 21 and
         catalog["pending_candles_total"] > 0,
         "Expected sealed and pending fixtures")
    with tempfile.TemporaryDirectory() as d:
        dest = Path(d)/"partitions_r11"
        need(build(dest,catalog,zipped) == "BUILT","First build missing")
        need(build(dest,catalog,zipped) == "NOOP","Repeated build not idempotent")
        need(verify(dest,catalog,values)["candles"] == source["candles_total"],
             "Source reconstruction failed")
        name = next(iter(zipped))
        file = dest/name
        original = file.read_bytes()
        file.write_bytes(original[:-1]+bytes([original[-1]^1]))
        try: verify(dest,catalog,values)
        except ValueError as e: need("SHA-256" in str(e),"Wrong tamper rejection")
        else: raise AssertionError("Tampered block accepted")
        file.write_bytes(original)
        with (dest/"index.json").open("r",encoding="utf-8") as f: index = json.load(f)
        index["candles_total"] += 1
        (dest/"index.json").write_text(json.dumps(index),encoding="utf-8")
        try: verify(dest,catalog,values)
        except ValueError: pass
        else: raise AssertionError("Tampered index accepted")
    bad = {k:list(v) for k,v in values.items()}
    key = next(iter(bad))
    bad[key] = [list(row) for row in bad[key]]
    bad[key][1][0] += MS[key.split("|")[1]][0]
    try: plan(source,"a"*64,manifest,bad)
    except ValueError: pass
    else: raise AssertionError("Gap/duplicate accepted")
    print(json.dumps({"status":"R11_SELF_TEST_PASS","sealed":21,
                      "tested":"idempotence,SHA-tamper,index-tamper,seam-gap"}))

def main():
    p=argparse.ArgumentParser(description=__doc__)
    choices=p.add_mutually_exclusive_group(required=True)
    for opt in ("self-test","plan","build","verify"):
        choices.add_argument("--"+opt,action="store_true")
    p.add_argument("--target",type=Path)
    a=p.parse_args()
    if a.self_test:
        self_test()
        return
    source, digest, manifest, series = verified_source()
    catalog, blocks = plan(source,digest,manifest,series)
    if a.plan:
        print(json.dumps({"status":"R11_PLAN_ONLY", "series":catalog["series_count"],
              "candles":catalog["candles_total"],
              "sealed_blocks":catalog["sealed_blocks_total"],
              "pending_candles":catalog["pending_candles_total"],
              "bytes_proposed":sum(map(len,blocks.values()))}))
        return
    need(a.target is not None,"Specify --target explicitly")
    if a.build: print(json.dumps({"write":build(a.target,catalog,blocks),
                                  **verify(a.target,catalog,series)}))
    else: print(json.dumps(verify(a.target,catalog,series)))

if __name__=="__main__":
    main()
