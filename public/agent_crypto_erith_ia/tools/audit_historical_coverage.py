#!/usr/bin/env python3
"""Read-only source-of-truth Top 50 OHLCV coverage report.

Merges existing R10 index, Universe pilot/increments, and Top50 cohort/increments.
No network, writes, guessed trading pairs or synthetic OHLCV.
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
import datetime as dt
import json
from pathlib import Path

import collect_historical_cohort as cohort
import collect_historical_universe as pilot
import extend_historical_cohort as extension
import extend_historical_universe as universe
import historical_archive_partitions as partitions
import collect_historical_remaining as remaining

BASE = pilot.ROOT / "data/historical_archive_prototype"
R10 = BASE / "ohlcv_spot_pilot/index.json"
UNIVERSE = BASE / "universe"
COHORT = UNIVERSE / "cohorts/top50"
ADDITIONAL = UNIVERSE / "cohorts/top50-additional"
SCHEMA = "aerith.public.ohlcv.spot.coverage.top50.v1"
PERIODS = ("24h", "7d", "30d")
PENDING = {"identity_review_required", "spot_exchange_lookup_failed",
           "spot_pair_not_qualified", "historical_data_incomplete"}


def require(flag, why):
    if not flag:
        raise ValueError(why)


def utc(ms):
    return dt.datetime.fromtimestamp(ms / 1000, tz=dt.timezone.utc).isoformat()


def summarize(catalog=COHORT, pilot_root=UNIVERSE, r10_path=R10, additional_dir=ADDITIONAL):
    # These existing validators read and hash all blobs, and verify incremental
    # continuity. They deliberately refuse corrupt/missing archive entries.
    cohort_check = cohort.verify(catalog)
    require(cohort_check.get("mode") == "VERIFIED", "Top50 archive unavailable")
    a_ledger, a_ids, a_original, a_tip = extension.inspect(catalog)
    u_ledger, u_ids, u_original, u_tip = universe.inspect(pilot_root)
    r10 = json.loads(r10_path.read_bytes())
    require(r10.get("schema") == "aerith.public.ohlcv.spot.cumulative.index.v1"
            and r10.get("quote_asset") == "USDT"
            and r10.get("series_count") == 21, "Legacy R10 index unexpected")
    legacy = defaultdict(dict)
    for c in r10.get("coverage", []):
        require(c.get("period") in PERIODS
                and c.get("pair", "").endswith("USDT"), "Legacy OHLCV index mismatch")
        key = c["period"]
        require(key not in legacy[c["id"]], "Duplicate legacy series")
        legacy[c["id"]][key] = c
    require(len(legacy) == 7 and all(len(c) == 3 for c in legacy.values()),
            "Seven legacy assets / 21 series expected")
    extra = {}
    extension_result = remaining.verify(additional_dir, catalog)
    if extension_result["mode"] == "VERIFIED":
        extension = json.loads((additional_dir / "index.json").read_bytes())
        approved_extra = {a["id"] for a in extension["assets"]
                          if a["status"] == "archived_spot"}
        extra = {(b["asset_id"], b["period"]): b for b in extension["blocks"]}
        require(len(extra) == len(approved_extra)*len(PERIODS),
                "Additional owner has incomplete historical coverage")
    root = json.loads((catalog / "index.json").read_bytes())
    require(root.get("schema") == cohort.SCHEMA and len(root.get("assets", [])) == 50,
            "Top 50 snapshot invalid")
    ranked = root["assets"]
    items = []
    used = set()
    for expected_rank, a in enumerate(ranked, 1):
        aid, status = a["id"], a["status"]
        require(a["rank"] == expected_rank and aid not in used,
                "Invalid or duplicated market rank")
        used.add(aid)
        owner = ("top50" if aid in a_ids else
                 "universe" if aid in u_ids else
                 "legacy_r10" if aid in legacy else
                 "top50_additional" if (aid, "24h") in extra else None)
        if owner == "top50":
            require(status == "archived_spot", "Top 50 status/owner mismatch")
        elif owner in ("universe", "legacy_r10"):
            require(status == "existing_archive_protected", "Existing owner mismatch")
        elif owner == "top50_additional":
            require(status in PENDING, "Additional archive overlaps existing owner")
        else:
            require(status in PENDING, "Unarchived asset status not qualified")
        coverage = {}
        for period in PERIODS:
            key = (aid, period)
            if owner == "top50":
                block, latest = a_original[key], a_tip[key]
            elif owner == "universe":
                block, latest = u_original[key], u_tip[key]
            elif owner == "legacy_r10":
                block = legacy[aid][period]
                latest = block["last_open_ms"]
            elif owner == "top50_additional":
                block = extra[key]
                latest = block["last_ms"]
            else:
                continue
            first = block.get("first_open_ms", block.get("first_ms"))
            last = block.get("last_open_ms", block.get("last_ms"))
            require(type(first) is int and type(last) is int and latest >= last,
                    "Historical bounds invalid")
            coverage[period] = {"pair": block["pair"], "interval": block["interval"],
                                "first_open_ms": first, "last_open_ms": latest,
                                "last_utc": utc(latest), "source": "Binance Spot",
                                "quote": "USDT",
                                "integrity": "source_index" if owner == "legacy_r10"
                                             else "sha256_verified"}
        items.append({"rank": expected_rank, "id": aid, "symbol": a["symbol"],
                      "name": a["name"],
                      "status": "archived_spot_additional" if owner == "top50_additional" else status,
                      "archived": bool(owner), "archive_owner": owner,
                      "periods": coverage})
    owners = Counter(x["archive_owner"] for x in items if x["archived"])
    states = Counter(x["status"] for x in items)
    require(owners["legacy_r10"] == 7 and owners["universe"] == 5
            and owners["top50"] == 12
            and owners["top50_additional"] == len(extra)//len(PERIODS)
            and sum(owners.values()) == 24 + len(extra)//len(PERIODS),
            "Archived owner drift")
    require(sum(states.values()) == 50, "Market ranking incomplete")
    return {"schema": SCHEMA,
            "ranking_source": "Top50 immutable Cohort index; not current live Market",
            "market_snapshot_end_ms": root["snapshot_end_ms"],
            "market_snapshot_end_utc": utc(root["snapshot_end_ms"]),
            "total_ranked": 50, "archived_assets": sum(owners.values()),
            "unarchived_assets": 50-sum(owners.values()),
            "unarchived_statuses": {k:v for k,v in states.items() if k in PENDING},
            "archive_owners": dict(owners),
            "original_series": 21 + len(u_original) + len(a_original) + len(extra),
            "universe_incremental_chunks": len(u_ledger["chunks"]) + sum(p["chunks"] for p in u_ledger.get("partitions", [])),
            "cohort_incremental_chunks": len(a_ledger["chunks"]) + sum(p["chunks"] for p in a_ledger.get("partitions", [])),
            "universe_incremental_candles": sum(x["candles"] for x in u_ledger["chunks"]) + sum(p["candles"] for p in u_ledger.get("partitions", [])),
            "cohort_incremental_candles": sum(x["candles"] for x in a_ledger["chunks"]) + sum(p["candles"] for p in a_ledger.get("partitions", [])),
            "universe_sealed_partitions": len(u_ledger.get("partitions", [])),
            "cohort_sealed_partitions": len(a_ledger.get("partitions", [])),
            "status_note": "Coverage from a frozen Top50 market snapshot, not live rankings. 24h/7d/30d archive owners only; no implied complete 60d/90d/1y/Max.",
            "assets": items}


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--unarchived-only", action="store_true")
    p.add_argument("--compact", action="store_true")
    args = p.parse_args()
    doc = summarize()
    if args.unarchived_only:
        doc["assets"] = [a for a in doc["assets"] if not a["archived"]]
    print(json.dumps(doc, ensure_ascii=False, sort_keys=True,
                     separators=(",", ":") if args.compact else None, indent=None if args.compact else 2))


if __name__ == "__main__":
    main()
