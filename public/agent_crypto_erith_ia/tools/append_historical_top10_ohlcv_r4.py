#!/usr/bin/env python3
"""Seven Heaven R4 · bounded incremental Binance Spot OHLCV archive.

Base: immutable validated R2 gzip + manifest. Append: immutable dated delta gzip files.
Index rebuilt from the physical files; existing manifest/index checked before any writes.
No fake candles, no orders, no browser storage, no unbounded exchange requests.
"""
from __future__ import annotations

import datetime as dt
import gzip
import hashlib
import json
import math
from pathlib import Path
import time
import urllib.error
import urllib.parse
import urllib.request

BASE = Path(__file__).resolve().parents[1]
FOLDER = BASE / "data/historical_archive_prototype/ohlcv_spot_pilot"
SEED_MANIFEST = FOLDER / "manifest.json"
INDEX = FOLDER / "index.json"
DELTAS = FOLDER / "deltas"
MS = {"24h": (300000, "5m"), "7d": (3600000, "1h"), "30d": (14400000, "4h")}
MAX_NEW_PER_SERIES = 240
API = ("https://data-api.binance.vision", "https://api.binance.com")


def insist(condition, message):
    if not condition:
        raise ValueError(message)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def decode_gzip(raw):
    return json.loads(gzip.decompress(raw))


def candle(row, step):
    insist(isinstance(row, list) and len(row) == 8, "Invalid candle row shape")
    insist(all(isinstance(v, (int, float)) and math.isfinite(v) for v in row),
           "NaN/non-numeric OHLCV")
    t, o, hi, low, cl, base, quote, trades = row
    insist(isinstance(t, int) and t % step == 0, "Misaligned timestamp")
    insist(isinstance(trades, int) and trades >= 0, "Invalid trade count")
    insist(0 < low <= min(o, cl) <= max(o, cl) <= hi and base >= 0 and quote >= 0,
           "Invalid OHLC/volume")
    return t


def merge(state, key, rows, step):
    """Fail closed on any duplicated, reordered or missing candle in this series."""
    insist(isinstance(rows, list), "Candles not a list")
    previous = state.get(key)
    for row in rows:
        t = candle(row, step)
        if previous is not None:
            insist(t == previous["last"] + step, "Duplicate or gap: " + key + " / " + str(t))
            previous["last"] = t
            previous["count"] += 1
        else:
            previous = {"first": t, "last": t, "count": 1}
            state[key] = previous
    return len(rows)


def parse_key(coin, period):
    return coin + "|" + period


def read_seed():
    m = json.loads(SEED_MANIFEST.read_text(encoding="utf-8"))
    insist(m["schema"] == "aerith.public.ohlcv.spot.top10.pilot.manifest.v1",
           "Unexpected seed manifest")
    archive = m["archive"]
    insist(archive == "ohlcv_top10_2026-10-08.json.gz", "Seed is not immutable R2")
    raw = (FOLDER / archive).read_bytes()
    insist(len(raw) == m["archive_gzip_bytes"] and sha(raw) == m["archive_sha256"],
           "Seed archive SHA/size mismatch")
    source = decode_gzip(raw)
    insist(source["kind"] == "REAL_BINANCE_SPOT_OHLCV_NO_SYNTHETIC_BARS"
           and source["quote_asset"] == "USDT" and
           source["basket_reference"] == m["reference"], "Seed schema/reference mismatch")
    assets = source["assets"]
    insist(set(assets) == set(m["complete_assets"]) and len(assets) == 7,
           "Unexpected qualified assets in seed")
    state = {}
    for asset_id in sorted(assets):
        asset = assets[asset_id]
        insist(asset["quote"] == "USDT" and asset["pair"].endswith("USDT"),
               "Unexpected quote pair in seed")
        for period, (step, interval) in MS.items():
            dataset = asset["periods"][period]
            insist(dataset["interval"] == interval and isinstance(dataset["rows"], list),
                   "Missing seed period")
            insist(len(dataset["rows"]) == m["periods"][period]["candles_expected"],
                   "Seed count mismatch")
            merge(state, parse_key(asset_id, period), dataset["rows"], step)
            insist(state[parse_key(asset_id, period)]["last"] == dataset["last_open_ms"],
                   "Seed series endpoint mismatch")
    return m, assets, state, {"file": archive, "bytes": len(raw), "sha256": sha(raw)}


def get_deltas(assets, state):
    info = []
    if not DELTAS.exists():
        return info
    for path in sorted(DELTAS.glob("delta_*.json.gz")):
        raw = path.read_bytes()
        delta = decode_gzip(raw)
        insist(delta.get("schema") == "aerith.public.ohlcv.spot.increment.v1"
               and delta.get("quote_asset") == "USDT", "Unknown delta schema")
        updates = delta.get("updates")
        insist(isinstance(updates, list) and len(updates) > 0, "Empty/invalid saved delta")
        seen = set()
        for part in updates:
            aid, period, pair = part["id"], part["period"], part["pair"]
            insist(aid in assets and period in MS and assets[aid]["pair"] == pair,
                   "Unknown delta asset/pair")
            key = parse_key(aid, period)
            insist(key not in seen, "Repeated series within delta")
            seen.add(key)
            insist(len(part["rows"]) <= MAX_NEW_PER_SERIES, "Delta too large")
            merge(state, key, part["rows"], MS[period][0])
        info.append({"file": "deltas/" + path.name, "bytes": len(raw), "sha256": sha(raw),
                     "updates": len(updates), "candles": sum(len(x["rows"]) for x in updates)})
    return info


def coverage(assets, state):
    out = []
    for aid in sorted(assets):
        for period, (step, interval) in MS.items():
            s = state[parse_key(aid, period)]
            out.append({"id": aid, "pair": assets[aid]["pair"], "period": period,
                        "interval": interval, "first_open_ms": s["first"],
                        "last_open_ms": s["last"], "candles": s["count"]})
    return out


def index_payload(seed, manifest, assets, state, deltas, at):
    return {"schema": "aerith.public.ohlcv.spot.cumulative.index.v1",
            "source": "Binance Spot", "quote_asset": "USDT",
            "basket_reference": manifest["reference"],
            "updated_at": at, "seed": seed, "deltas": deltas,
            "coverage": coverage(assets, state),
            "series_count": len(state),
            "candles_total": sum(x["count"] for x in state.values()),
            "method": "Only contiguous closed candles; append immutable gzip deltas; no interpolation"}


def check_prior_index(prior, manifest, seed, existing, assets, state):
    insist(prior["schema"] == "aerith.public.ohlcv.spot.cumulative.index.v1"
           and prior["source"] == "Binance Spot" and prior["quote_asset"] == "USDT"
           and prior["basket_reference"] == manifest["reference"], "Prior index schema invalid")
    insist(prior["seed"] == seed and prior["deltas"] == existing,
           "Existing delta files disagree with index: fail closed")
    insist(prior["coverage"] == coverage(assets, state)
           and prior["candles_total"] == sum(x["count"] for x in state.values()),
           "Existing index coverage disagrees with delta files")


def plan_after(last_open, now_ms, step):
    """Return CLOSED candle count needed, bounded per series, never replay old data."""
    latest_closed_open = (now_ms // step - 1) * step
    if latest_closed_open <= last_open:
        return 0
    return min(MAX_NEW_PER_SERIES, (latest_closed_open - last_open) // step)


def query(pair, interval, start, step, wanted):
    params = urllib.parse.urlencode({
        "symbol": pair, "interval": interval, "startTime": start,
        "endTime": start + wanted * step - 1, "limit": wanted})
    errors = []
    for server in API:
        for attempt in range(2):
            try:
                req = urllib.request.Request(
                    server + "/api/v3/klines?" + params,
                    headers={"User-Agent": "SevenHeaven-Historical-R4/1.0",
                             "Accept": "application/json"})
                with urllib.request.urlopen(req, timeout=20) as resp:
                    rows = json.load(resp)
                insist(isinstance(rows, list), "Unexpected exchange response")
                compact = []
                for r in rows:
                    insist(isinstance(r, list) and len(r) >= 9,
                           "Unexpected Binance kline shape")
                    compact.append([int(r[0]), *[float(r[j]) for j in (1, 2, 3, 4, 5, 7)],
                                    int(r[8])])
                insist(len(compact) == wanted, "Exchange returned incomplete window")
                for i, row in enumerate(compact):
                    candle(row, step)
                    insist(row[0] == start + i * step, "Exchange supplied missing candle")
                return compact
            except (urllib.error.HTTPError, urllib.error.URLError,
                    TimeoutError, ValueError, OSError) as exc:
                errors.append(type(exc).__name__ + ":" + str(getattr(exc, "code", "")))
                if isinstance(exc, urllib.error.HTTPError) and exc.code in (400, 401, 403, 404, 451):
                    break
                if attempt == 0:
                    time.sleep(0.8)
    raise RuntimeError("Cannot retrieve exact OHLCV " + pair + "/" + interval
                       + ": " + ", ".join(errors)[:120])


def incremental(now):
    manifest, assets, state, seed = read_seed()
    existing = get_deltas(assets, state)
    previous = json.loads(INDEX.read_text(encoding="utf-8")) if INDEX.exists() else None
    if previous is not None:
        check_prior_index(previous, manifest, seed, existing, assets, state)
    else:
        insist(not existing, "Delta archive exists without index: fail closed")
    now_ms = int(now.timestamp() * 1000)
    updates = []
    # Deterministic series order, bounded <= 240 new candles / series / run.
    for aid in sorted(assets):
        pair = assets[aid]["pair"]
        for period, (step, interval) in MS.items():
            key = parse_key(aid, period)
            n = plan_after(state[key]["last"], now_ms, step)
            if n == 0:
                continue
            start = state[key]["last"] + step
            rows = query(pair, interval, start, step, n)
            insist(rows[-1][0] + step <= now_ms, "Last candle not closed")
            merge(state, key, rows, step)
            updates.append({"id": aid, "pair": pair, "period": period,
                            "interval": interval, "rows": rows})
            time.sleep(0.15)
    if not updates and previous is not None:
        print(json.dumps({"status": "NOOP", "reason": "No new closed candles",
                          "deltas": len(existing), "candles_total": previous["candles_total"]}))
        return
    timestamp = now.strftime("%Y%m%dT%H%M%SZ")
    if updates:
        DELTAS.mkdir(parents=True, exist_ok=True)
        name = "delta_" + timestamp + ".json.gz"
        target = DELTAS / name
        insist(not target.exists(), "Delta filename already exists; refusing overwrite")
        delta = {"schema": "aerith.public.ohlcv.spot.increment.v1",
                 "source": "Binance Spot", "quote_asset": "USDT",
                 "basket_reference": manifest["reference"],
                 "collected_at": now.isoformat().replace("+00:00", "Z"),
                 "updates": updates}
        payload = (json.dumps(delta, ensure_ascii=False, separators=(",", ":"), allow_nan=False) + "\n").encode("utf-8")
        compressed = gzip.compress(payload, compresslevel=9, mtime=0)
        insist(gzip.decompress(compressed) == payload, "gzip roundtrip failed")
        target.write_bytes(compressed)
        existing.append({"file": "deltas/" + name, "bytes": len(compressed),
                         "sha256": sha(compressed), "updates": len(updates),
                         "candles": sum(len(p["rows"]) for p in updates)})
    result = index_payload(seed, manifest, assets, state, existing,
                           now.isoformat().replace("+00:00", "Z"))
    INDEX.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": "ARCHIVED" if updates else "INDEX_CREATED",
                      "archive_count": len(existing),
                      "new_candles": sum(len(p["rows"]) for p in updates),
                      "series": result["series_count"],
                      "candles_total": result["candles_total"],
                      "quote": result["quote_asset"]}, ensure_ascii=False))


def self_test():
    # Unit tests: synthetic rows exist only in memory. NEVER publish synthetic candles.
    step = 300000
    def row(t):
        return [t, 2., 3., 1., 2.5, 100., 250., 10]
    state = {}
    insist(merge(state, "unit", [row(0), row(step)], step) == 2, "merge count")
    insist(merge(state, "unit", [], step) == 0, "empty append")
    insist(state["unit"]["count"] == 2, "idempotence empty append")
    for invalid in ([row(step)], [row(step * 3)]):
        try:
            merge(state, "unit", invalid, step)
        except ValueError:
            pass
        else:
            raise AssertionError("Duplicate/gap was accepted")
    insist(merge(state, "unit", [row(step * 2)], step) == 1, "append")
    insist(plan_after(step * 2, step * 4, step) == 1, "closed candle planning")
    insist(plan_after(step * 2, step * 3, step) == 0, "no replay")
    bad = row(step * 3)
    bad[2] = 0.4
    try:
        merge(state, "unit", [bad], step)
    except ValueError:
        pass
    else:
        raise AssertionError("Invalid OHLC was accepted")
    insist(state["unit"]["count"] == 3, "invalid bar mutated count")
    print("SELF_TEST_PASS: append-only, idempotent no-op, duplicate, gap, OHLC, closed bars")


def main():
    import argparse
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()
    if args.self_test:
        self_test()
    else:
        incremental(dt.datetime.now(dt.timezone.utc))


if __name__ == "__main__":
    main()
