#!/usr/bin/env python3
"""Seven Heaven: qualified remaining Top50 OHLCV cohort (independent snapshot).

Never writes into the existing R10/Universe/Top50 owners or the Trader.
The immutable October Top50 index is the ranking source, not a live top list.
Only explicitly mapped CoinGecko IDs may be probed; exchangeInfo must match
base, quote, TRADING and SPOT; each asset's three OHLCV windows must be complete.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path
import time

import collect_historical_cohort as source
from collect_historical_universe import ROOT, atomic_write, digest, encoded, require

BASELINE = source.OUTPUT
REGISTRY = ROOT / "data/historical_archive_prototype/historical-remaining-instruments.json"
OUTPUT = ROOT / "data/historical_archive_prototype/universe/cohorts/top50-additional"
REGISTRY_SCHEMA = "aerith.public.ohlcv.spot.remaining.instruments.v1"
EXTENSION_SCHEMA = "aerith.public.ohlcv.spot.remaining.snapshot.v1"
UNRESOLVED = {"identity_review_required", "spot_exchange_lookup_failed"}
ALLOWED_RESULT = {"archived_spot", "spot_pair_not_qualified",
                  "spot_exchange_lookup_failed", "historical_data_incomplete"}


def assemble(baseline=BASELINE, registry=REGISTRY):
    result = source.verify(baseline)
    require(result["mode"] == "VERIFIED" and result["new_assets"] == 12
            and result["series"] == 36, "Frozen Top50 reference is not verified")
    base_raw = (baseline/"index.json").read_bytes()
    source_index = json.loads(base_raw)
    registry_raw = registry.read_bytes()
    reg = json.loads(registry_raw)
    require(reg.get("schema") == REGISTRY_SCHEMA
            and reg.get("scope") == "immutable-top50-snapshot"
            and reg.get("source_quote") == "USDT"
            and reg.get("source_venue") == "Binance Spot",
            "Unrecognized candidate registry or quote")
    candidates = reg.get("candidate_symbols")
    deferred = reg.get("manual_review")
    require(isinstance(candidates, dict) and isinstance(deferred, dict)
            and set(candidates).isdisjoint(deferred)
            and len(candidates) == 15 and len(deferred) == 11,
            "All 26 unresolved identities must be classified exactly once")
    unresolved = {a["id"]: a for a in source_index["assets"]
                  if a["status"] in UNRESOLVED}
    require(len(unresolved) == 26 and
            set(unresolved) == set(candidates) | set(deferred),
            "Missing Top50 identity or unexpected archived-asset overlap")
    rows = []
    for raw in source_index["assets"]:
        item = dict(raw)
        aid = item["id"]
        if aid in candidates:
            symbol = candidates[aid]
            require(isinstance(symbol, str) and
                    source.SYMBOL.fullmatch(symbol) and
                    symbol == item["symbol"] and symbol != "USDT",
                    "Proposed pair symbol identity mismatch")
            item.update(status="candidate", pair=symbol+"USDT")
        elif aid in deferred:
            require(isinstance(deferred[aid], str)
                    and len(deferred[aid]) >= 18, "Missing review rationale")
            item.update(status="identity_review_required", pair=None,
                        review_reason=deferred[aid])
        else:
            require(item["status"] in ("existing_archive_protected", "archived_spot"),
                    "Existing archive owner unexpectedly unresolved")
            item.update(status="existing_archive_protected", pair=None)
        rows.append(item)
    return rows, {"baseline_sha256": digest(base_raw),
                  "registry_sha256": digest(registry_raw),
                  "market_sha256": source_index["market_sha256"],
                  "universe_sha256": source_index["universe_sha256"]}


def probe(baseline=BASELINE, registry=REGISTRY):
    rows, provenance = assemble(baseline, registry)
    summary = []
    for r in rows:
        if r["status"] != "candidate":
            continue
        try:
            ok = source.live_pair(r)
            state = "spot_qualified" if ok else "spot_pair_not_qualified"
        except (RuntimeError, ValueError, KeyError, OSError) as exc:
            state = "spot_exchange_lookup_failed"
        summary.append({"id": r["id"], "symbol": r["symbol"],
                        "pair": r["pair"], "state": state})
    return {"mode": "PROBE_NO_WRITES", "proposed": len(summary),
            "qualified": sum(x["state"] == "spot_qualified" for x in summary),
            "instruments": summary, **provenance}


def verify(output=OUTPUT, baseline=BASELINE, registry=REGISTRY):
    index_file = output/"index.json"
    if not index_file.exists():
        return {"mode": "NOT_COLLECTED", "new_assets": 0,
                "series": 0, "candles": 0}
    rows, source_info = assemble(baseline, registry)
    raw = json.loads(index_file.read_bytes())
    require(raw.get("extension_schema") == EXTENSION_SCHEMA
            and raw.get("baseline_sha256") == source_info["baseline_sha256"]
            and raw.get("registry_sha256") == source_info["registry_sha256"],
            "Unrecognized remaining cohort source identity")
    expected = {x["id"]: x for x in rows}
    require(len(raw.get("assets", [])) == 50
            and raw.get("verified_series") == len(raw.get("blocks", [])),
            "Incomplete additional cohort catalogue")
    for item in raw["assets"]:
        aid = item["id"]
        require(aid in expected and item["symbol"] == expected[aid]["symbol"]
                and item["rank"] == expected[aid]["rank"],
                "Additional cohort asset mismatch")
        if expected[aid]["status"] == "candidate":
            require(item["status"] in ALLOWED_RESULT
                    and item["pair"] == expected[aid]["pair"],
                    "Candidate status or pair mismatch")
        else:
            require(item["status"] == expected[aid]["status"]
                    and item["pair"] is None,
                    "Protected or unresolved asset mutated")
    return source.verify(output)


def collect(output=OUTPUT, baseline=BASELINE, registry=REGISTRY):
    require(not (output/"index.json").exists(),
            "Immutable additional Top50 archive already exists; never overwrite")
    rows, info = assemble(baseline, registry)
    end_ms = ((int((time.time()-90)*1000))//14_400_000)*14_400_000
    bundles = []
    for row in rows:
        if row["status"] != "candidate":
            continue
        try:
            qualified = source.live_pair(row)
        except (ValueError, RuntimeError, KeyError, OSError) as exc:
            row["status"] = "spot_exchange_lookup_failed"
            row["reason"] = type(exc).__name__
            continue
        if not qualified:
            row["status"] = "spot_pair_not_qualified"
            continue
        try:
            blocks = source.block_bundle(row, end_ms)
        except (ValueError, RuntimeError, KeyError, TypeError, OSError) as exc:
            row["status"] = "historical_data_incomplete"
            row["reason"] = type(exc).__name__
            continue
        row["status"] = "archived_spot"
        bundles.extend(blocks)
    require(bundles, "No newly qualified complete OHLCV: no publication")
    output_index = {
        "schema": source.SCHEMA, "extension_schema": EXTENSION_SCHEMA,
        "source": "Binance Spot REST /api/v3/klines", "quote": "USDT",
        "cohort": "top50", "status": "VERIFIED_MANUAL_SNAPSHOT",
        "snapshot_end_ms": end_ms, "assets": rows,
        "blocks": [b[2] for b in bundles],
        "verified_series": len(bundles),
        "verified_candles": sum(b[2]["candles"] for b in bundles),
        **info}
    for filename, payload, meta in bundles:
        target = output/filename
        if target.exists():
            require(target.read_bytes() == payload, "Immutable OHLCV collision")
        else:
            atomic_write(target, payload)
    atomic_write(output/"index.json", encoded(output_index))
    return verify(output, baseline, registry)


def main():
    arg = argparse.ArgumentParser(description=__doc__)
    arg.add_argument("--baseline-dir", type=Path, default=BASELINE)
    arg.add_argument("--registry", type=Path, default=REGISTRY)
    arg.add_argument("--output-dir", type=Path, default=OUTPUT)
    mode = arg.add_mutually_exclusive_group(required=True)
    mode.add_argument("--plan", action="store_true")
    mode.add_argument("--probe", action="store_true")
    mode.add_argument("--collect", action="store_true")
    mode.add_argument("--verify", action="store_true")
    arg.add_argument("--enable-network", action="store_true")
    a = arg.parse_args()
    if a.verify:
        result = verify(a.output_dir, a.baseline_dir, a.registry)
    elif a.plan:
        rows, provenance = assemble(a.baseline_dir, a.registry)
        result = {"mode": "OFFLINE_PLAN", "existing_archived": 24,
                  "candidates": sum(x["status"] == "candidate" for x in rows),
                  "manual_review": sum(x["status"] == "identity_review_required" for x in rows),
                  "candidate_assets": [
                      {"id": r["id"], "rank": r["rank"], "pair": r["pair"]}
                      for r in rows if r["status"] == "candidate"], **provenance}
    else:
        require(a.enable_network, "Explicit --enable-network required for network")
        if a.probe:
            result = probe(a.baseline_dir, a.registry)
        else:
            result = collect(a.output_dir, a.baseline_dir, a.registry)
    print(json.dumps(result, sort_keys=True, ensure_ascii=False))


if __name__ == "__main__":
    main()
