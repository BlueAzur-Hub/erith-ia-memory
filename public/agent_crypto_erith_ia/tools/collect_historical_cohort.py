#!/usr/bin/env python3
"""Seven Heaven · isolated, manual Top 50 Binance Spot historical cohort.

The existing 7 R10 and 5 Universe assets stay with their original collectors.
Never changes Administrator/Trader, current Universe or R10/R11. Candidate
identity comes from an explicit CoinGecko-ID registry, then exchangeInfo.
"""
from __future__ import annotations

import argparse
import gzip
import json
import math
from pathlib import Path
import re
import time

from collect_historical_universe import (ROOT, PERIODS, BLOCK_SCHEMA, atomic_write,
                                         digest, encoded, get_json, require,
                                         validate_rows)

MARKET = ROOT / "data/crypto/latest.json"
REGISTRY = ROOT / "data/historical_archive_prototype/historical-cohort-instruments.json"
UNIVERSE = ROOT / "data/historical_archive_prototype/universe/index.json"
OUTPUT = ROOT / "data/historical_archive_prototype/universe/cohorts/top50"
SCHEMA = "aerith.public.ohlcv.spot.cohort.index.v1"
REGISTRY_SCHEMA = "aerith.public.ohlcv.spot.cohort.instruments.v1"
SCOPE = 50
ID = re.compile(r"^[a-z0-9-]{2,100}$")
SYMBOL = re.compile(r"^[A-Z0-9]{2,22}$")
FILENAME = re.compile(r"blocks/[a-z0-9-]+_(24h|7d|30d)_[a-f0-9]{16}\.json\.gz")


def assemble(snapshot=MARKET, registry_path=REGISTRY, existing_path=UNIVERSE):
    market_raw = snapshot.read_bytes()
    universe_raw = existing_path.read_bytes()
    registry_raw = registry_path.read_bytes()
    coins = json.loads(market_raw).get("coins")
    universe = json.loads(universe_raw)
    registry = json.loads(registry_raw)
    require(isinstance(coins, list) and len(coins) >= SCOPE, "Top 50 Market incomplete")
    require(registry.get("schema") == REGISTRY_SCHEMA
            and registry.get("cohort") == "top50", "Invalid cohort registry")
    require(universe.get("publication") == "MANUAL_BOUNDED_PILOT_NOT_LIVE"
            and universe.get("quote") == "USDT"
            and len(universe.get("blocks", [])) == 15, "Historical Universe baseline unexpected")
    protected = {r["id"]: r["symbol"] for r in universe["assets"]
                 if r.get("qualification") in ("qualified_spot", "legacy_preserved")}
    require(len(protected) == 12 and len(set(protected.values())) == 12,
            "Twelve existing historical assets not uniquely identified")
    candidates = registry.get("candidate_symbols")
    require(isinstance(candidates, dict) and 1 <= len(candidates) <= 35, "Invalid candidate list")
    require(set(candidates).isdisjoint(protected), "Never recollect existing archive owners")
    for asset_id, symbol in candidates.items():
        require(ID.fullmatch(asset_id) and isinstance(symbol, str)
                and SYMBOL.fullmatch(symbol), "Invalid or ambiguous approved ticker")
    entries, seen_ids, seen_symbols = [], set(), set()
    for rank, coin in enumerate(coins[:SCOPE], 1):
        aid = coin.get("id")
        symbol = str(coin.get("symbol", "")).upper()
        require(isinstance(aid, str) and ID.fullmatch(aid) and aid not in seen_ids
                and coin.get("rank") == rank, "Top 50 ranking or identity corrupted")
        seen_ids.add(aid)
        # CoinGecko Market may contain unusual or duplicate symbols, but these
        # must not silently become exchange instruments.
        uniqueness = symbol not in seen_symbols
        seen_symbols.add(symbol)
        if aid in protected:
            require(symbol == protected[aid], "Existing archive asset symbol changed")
            state = "existing_archive_protected"
        elif aid in candidates and candidates[aid] == symbol and uniqueness:
            state = "candidate"
        else:
            state = "identity_review_required"
        entries.append({"rank": rank, "id": aid, "symbol": symbol,
                        "name": str(coin.get("name", ""))[:100],
                        "status": state,
                        "pair": symbol+"USDT" if state == "candidate" else None})
    require(len(entries) == SCOPE, "Incomplete Top 50 classification")
    return entries, {"market_sha256": digest(market_raw),
                     "registry_sha256": digest(registry_raw),
                     "universe_sha256": digest(universe_raw),
                     "protected_ids": sorted(protected)}


def live_pair(row):
    pair = row["pair"]
    try:
        payload = get_json("/api/v3/exchangeInfo", {"symbol": pair})
        entry = next((x for x in payload.get("symbols", [])
                      if x.get("symbol") == pair), None)
    except (ValueError, RuntimeError, OSError, KeyError) as exc:
        raise ValueError("Binance exchangeInfo unavailable for "+pair+
                         " ("+type(exc).__name__+")") from exc
    if entry is None:
        return False
    allowed = ("SPOT" in entry.get("permissions", []) or
               any("SPOT" in group for group in entry.get("permissionSets", [])))
    return (entry.get("symbol") == pair and
            entry.get("baseAsset") == row["symbol"] and
            entry.get("quoteAsset") == "USDT" and
            entry.get("status") == "TRADING" and
            entry.get("isSpotTradingAllowed") is True and allowed)


def block_bundle(row, end_ms):
    prepared = []
    for period, (interval, step, count) in PERIODS.items():
        raw = get_json("/api/v3/klines",
                       {"symbol": row["pair"], "interval": interval,
                        "startTime": end_ms-count*step,
                        "endTime": end_ms-1, "limit": count})
        candles = validate_rows(raw, step, count, end_ms)
        payload = {"schema": BLOCK_SCHEMA, "asset_id": row["id"], "symbol": row["symbol"],
                   "pair": row["pair"], "source": "Binance Spot", "quote": "USDT",
                   "period": period, "interval": interval,
                   "first_ms": candles[0][0], "last_ms": candles[-1][0], "rows": candles}
        packed = gzip.compress(encoded(payload), compresslevel=9, mtime=0)
        sha = digest(packed)
        filename = "blocks/"+row["id"]+"_"+period+"_"+sha[:16]+".json.gz"
        info = {"file": filename, "sha256": sha, "asset_id": row["id"],
                "pair": row["pair"], "period": period, "interval": interval,
                "candles": len(candles), "first_ms": candles[0][0],
                "last_ms": candles[-1][0]}
        prepared.append((filename, packed, info))
    return prepared


def verify(output=OUTPUT):
    index_file = output / "index.json"
    if not index_file.exists():
        return {"mode": "NOT_COLLECTED", "series": 0, "candles": 0}
    index = json.loads(index_file.read_bytes())
    require(index.get("schema") == SCHEMA and index.get("quote") == "USDT"
            and index.get("cohort") == "top50"
            and index.get("status") == "VERIFIED_MANUAL_SNAPSHOT"
            and index.get("source") == "Binance Spot REST /api/v3/klines",
            "Unrecognized Top 50 index")
    rows, blocks = index.get("assets"), index.get("blocks")
    require(isinstance(rows, list) and len(rows) == SCOPE
            and isinstance(blocks, list) and len(blocks) > 0
            and len(blocks) % len(PERIODS) == 0, "Top 50 catalogue invalid")
    approved = {row["id"]: row["pair"] for row in rows
                if row["status"] == "archived_spot"}
    require(len(approved)*len(PERIODS) == len(blocks),
            "Top 50 archived assets/periods mismatch")
    require(all(re.fullmatch("[a-f0-9]{64}", index.get(k, ""))
                for k in ("market_sha256", "registry_sha256", "universe_sha256")),
            "Top 50 source provenance missing")
    seen = set()
    total = 0
    for meta in blocks:
        period, aid, pair = meta["period"], meta["asset_id"], meta["pair"]
        key = (aid, period)
        require(period in PERIODS and key not in seen and approved.get(aid) == pair,
                "Duplicate or unapproved historical series")
        seen.add(key)
        name = meta["file"]
        require(isinstance(name, str) and FILENAME.fullmatch(name)
                and name == "blocks/"+aid+"_"+period+"_"+meta["sha256"][:16]+".json.gz",
                "Invalid historical block path")
        raw = (output/name).read_bytes()
        require(len(raw) <= 2_000_000 and digest(raw) == meta["sha256"],
                "Top 50 SHA-256 verification failed")
        block = json.loads(gzip.decompress(raw))
        step, count = PERIODS[period][1:]
        require(block.get("schema") == BLOCK_SCHEMA and
                block.get("asset_id") == aid and block.get("pair") == pair
                and block.get("period") == period and
                block.get("quote") == "USDT" and block.get("source") == "Binance Spot"
                and block.get("interval") == PERIODS[period][0]
                and block.get("first_ms") == meta["first_ms"]
                and block.get("last_ms") == meta["last_ms"]
                and isinstance(block.get("rows"), list)
                and len(block["rows"]) == count
                and meta["candles"] == count, "Historical block metadata inconsistent")
        for n, row in enumerate(block["rows"]):
            require(isinstance(row, list) and len(row) == 8
                    and row[0] == meta["first_ms"]+n*step
                    and all(isinstance(v, (int, float)) and
                            not isinstance(v, bool) and math.isfinite(v)
                            for v in row)
                    and row[3] > 0 and row[3] <= min(row[1], row[4])
                    and max(row[1], row[4]) <= row[2]
                    and row[5] >= 0 and row[6] >= 0,
                    "Historical candle gap or invalid OHLCV")
        require(meta["last_ms"] == meta["first_ms"]+(count-1)*step,
                "Top 50 temporal discontinuity")
        total += count
    require(total == index.get("verified_candles") and
            len(blocks) == index.get("verified_series"),
            "Top 50 manifest counters mismatch")
    return {"mode": "VERIFIED", "series": len(blocks),
            "candles": total, "new_assets": len(approved)}


def collect(snapshot=MARKET, registry=REGISTRY, universe=UNIVERSE, output=OUTPUT):
    require(not (output/"index.json").exists(),
            "Existing Top 50 snapshot is immutable; never overwrite")
    entries, provenance = assemble(snapshot, registry, universe)
    # Align windows on a common last CLOSED 4-hour boundary.
    end_ms = (int((time.time()-90)*1000)//14_400_000)*14_400_000
    bundles = []
    for row in entries:
        if row["status"] != "candidate":
            continue
        try:
            supported = live_pair(row)
        except (ValueError, RuntimeError, OSError) as exc:
            row["status"] = "spot_exchange_lookup_failed"
            row["reason"] = str(exc)[:140]
            continue
        if not supported:
            row["status"] = "spot_pair_not_qualified"
            continue
        try:
            asset_bundles = block_bundle(row, end_ms)
        except (ValueError, RuntimeError, KeyError, TypeError, OSError) as exc:
            row["status"] = "historical_data_incomplete"
            row["reason"] = str(exc)[:140]
            continue
        row["status"] = "archived_spot"
        bundles.extend(asset_bundles)
    require(bundles, "No complete new historical series: no publication")
    index = {"schema": SCHEMA, "source": "Binance Spot REST /api/v3/klines",
             "quote": "USDT", "cohort": "top50", "status": "VERIFIED_MANUAL_SNAPSHOT",
             "snapshot_end_ms": end_ms, "assets": entries,
             "blocks": [b[2] for b in bundles],
             "verified_series": len(bundles),
             "verified_candles": sum(b[2]["candles"] for b in bundles),
             **provenance}
    for filename, packed, _ in bundles:
        location = output/filename
        if location.exists():
            require(location.read_bytes() == packed,
                    "Immutable historical block collision")
        else:
            atomic_write(location, packed)
    atomic_write(output/"index.json", encoded(index))
    return verify(output)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--snapshot", type=Path, default=MARKET)
    ap.add_argument("--registry", type=Path, default=REGISTRY)
    ap.add_argument("--universe", type=Path, default=UNIVERSE)
    ap.add_argument("--output-dir", type=Path, default=OUTPUT)
    flags = ap.add_mutually_exclusive_group(required=True)
    flags.add_argument("--plan", action="store_true")
    flags.add_argument("--verify", action="store_true")
    flags.add_argument("--collect", action="store_true")
    ap.add_argument("--enable-network", action="store_true")
    args = ap.parse_args()
    if args.plan:
        rows, provenance = assemble(args.snapshot, args.registry, args.universe)
        result = {"mode": "PLAN_OFFLINE", "scope": 50,
                  "protected": sum(x["status"] == "existing_archive_protected" for x in rows),
                  "candidates": sum(x["status"] == "candidate" for x in rows),
                  "review_required": sum(x["status"] == "identity_review_required" for x in rows),
                  "assets": rows, **provenance}
    elif args.verify:
        result = verify(args.output_dir)
    else:
        require(args.enable_network, "Network requires explicit --enable-network")
        result = collect(args.snapshot, args.registry, args.universe, args.output_dir)
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))


if __name__ == "__main__":
    main()
