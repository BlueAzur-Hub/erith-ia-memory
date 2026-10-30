#!/usr/bin/env python3
"""Read-only triage of Top250 IDs without indexed native Spot 1m/1D OHLCV.

Exact CoinGecko IDs from canonical year/minute/daily indexes are the only join
keys. Older venue/ticker evidence is a historical research lead, not instrument
permission. This never submits orders, fetches prices, imports or creates candles.
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
import hashlib
import json
from pathlib import Path

import audit_vault_source_union as source_union

ROOT = source_union.ROOT
ADDITIONAL = {
    "venue": "top250-venue-audit.json",
    "identity": "top250-identity-evidence.json",
    "alternative": "top250-alt-market-evidence.json",
    "official": "top250-official-spot-instruments.json",
    "private": "wbt_private_status.json",
}
SCHEMA = "aerith.public.ohlcv.top250.missing-identity-qualification.readonly.v1"


def require(ok, why):
    if not ok:
        raise ValueError(why)


def by_id(rows, label, unique=True):
    require(isinstance(rows, list), "Invalid " + label + " evidence list")
    found = defaultdict(list)
    for row in rows:
        require(isinstance(row, dict) and isinstance(row.get("id"), str)
                and row["id"].strip(), "Evidence record without CoinGecko ID")
        found[row["id"]].append(row)
    if unique:
        require(all(len(records) == 1 for records in found.values()),
                "Duplicate exact-ID " + label + " evidence")
    return found


def reconcile(year, minute, daily, venue, identity, alternative, official, private):
    source = source_union.audit(year, minute, daily)
    require(venue.get("schema") == "aerith.public.ohlcv.spot.discovery.top250.v1"
            and venue.get("total_ranked") == 250, "Venue source unexpected")
    require(identity.get("schema") ==
            "aerith.public.ohlcv.spot.coingecko-binance-identity-evidence.v1",
            "CoinGecko identity ledger unexpected")
    require(alternative.get("schema") ==
            "aerith.public.ohlcv.spot.top250.alt-market-discovery.v1",
            "Alternative market ledger unexpected")
    require(official.get("schema") ==
            "aerith.public.ohlcv.spot.top250.official-instrument-candidates.v1",
            "Official Spot instrument ledger unexpected")
    require(private.get("schema") == "seven.crypto.wbt.private-evidence.status.v1"
            and private.get("asset_id") == "whitebit"
            and private.get("publication_status") ==
                "SUMMARY_METADATA_ONLY_SOURCE_CANDLES_NOT_PUBLISHED",
            "Private WBT rights boundary must be preserved")

    venue_ids = by_id(venue.get("assets"), "venue")
    identity_ids = by_id(identity.get("results"), "identity", unique=False)
    alt_ids = by_id(alternative.get("results"), "alternative", unique=False)
    official_ids = by_id(official.get("assets"), "official instrument")

    missing = source["without_both_indexed_native_sources"]
    results = []
    for row in missing:
        aid, current_symbol = row["id"], row["symbol"]
        v = venue_ids[aid][0] if aid in venue_ids else None
        official_row = official_ids[aid][0] if aid in official_ids else None
        old_rows = identity_ids.get(aid, []) + alt_ids.get(aid, [])
        older_symbols = sorted({x["symbol"] for x in old_rows + (
            [official_row] if official_row else []) if
            isinstance(x.get("symbol"), str) and x["symbol"] != current_symbol})
        instruments = official_row.get("instruments", []) if official_row else []
        require(isinstance(instruments, list), "Invalid official instruments")
        require(all(isinstance(x, dict) for x in instruments),
                "Official instrument record invalid")
        native_confirmed = bool(official_row and
                                official_row.get("native_1m_month_confirmed") is True)
        matching_candidates = [
            {"venue": x.get("venue"), "instrument": x.get("instrument"),
             "base": x.get("base"), "quote": x.get("quote"),
             "coin_id_confirmed": x.get("coin_id_confirmed") is True,
             "native_1m_month_confirmed": x.get("native_1m_month_confirmed") is True}
            for x in instruments
        ]
        alt_candidate = any(x.get("status") == "exact_id_market_candidates"
                            and any(m.get("coin_id") == aid
                                    for m in x.get("markets", [])
                                    if isinstance(m, dict))
                            for x in alt_ids.get(aid, []))
        private_metadata = aid == private["asset_id"]
        if private_metadata:
            category = "private_source_metadata_only"
        elif older_symbols:
            category = "historical_symbol_divergence_review"
        elif matching_candidates or alt_candidate:
            category = "spot_market_candidates_identity_unverified"
        else:
            category = "no_qualified_source_in_examined_ledgers"

        # No candidate is promoted to a source merely because its ticker exists.
        # Public OHLCV requires separate, exact-ID Spot ownership, rights and
        # original native-source verification through the existing collectors.
        results.append({
            "rank": row["rank"], "id": aid, "symbol": current_symbol,
            "category": category,
            "venue_status": v.get("status") if v else "not_in_venue_ledger",
            "official_status": official_row.get("status") if official_row else "not_in_official_ledger",
            "identity_evidence_statuses": sorted({
                x.get("status", "unspecified") for x in identity_ids.get(aid, [])}),
            "alt_evidence_statuses": sorted({
                x.get("status", "unspecified") for x in alt_ids.get(aid, [])}),
            "previous_symbols_requiring_review": older_symbols,
            "official_instrument_candidates": matching_candidates,
            "exact_coin_id_alt_market_candidate": alt_candidate,
            "private_source_only": private_metadata,
            "public_minute_source_confirmed": False,
            "public_daily_source_confirmed": False,
            "original_native_month_confirmed_in_instrument_ledger": native_confirmed,
            "automatic_collection_approved": False,
            "reason": (
                "Private owner-only OHLCV metadata; no public redistribution"
                if private_metadata else
                "Historical evidence uses a different symbol for the same ID; verify asset migration and contract"
                if older_symbols else
                "Spot market/instrument candidates are not proof of same asset or native month"
                if matching_candidates or alt_candidate else
                "No independently qualified Spot source in these older evidence registries"),
        })
    counts = Counter(x["category"] for x in results)
    require(len(results) ==
            source["summary"]["no_indexed_1m_or_1d_asset_inside_top250"]
            and not any(x["automatic_collection_approved"] for x in results),
            "Unexplained missing ID or unsafe source approval")
    return {
        "schema": SCHEMA, "status": "EVIDENCE_TRIAGE_ONLY_NOT_LIVE_VENUE_VERIFICATION",
        "ranked": 250, "uncovered_identities": len(results),
        "categories": dict(sorted(counts.items())),
        "venue_snapshot": venue.get("market_snapshot_at"),
        "official_instruments_checked_at": official.get("checked_at"),
        "source_union_summary": source["summary"],
        "private_wbt_metadata": {
            "asset_id": private["asset_id"],
            "publication_status": private["publication_status"],
            "source_candle_data_public": False,
            "trader_imported": private.get("trader_imported"),
        },
        "records": results,
        "limitations": [
            "Evidence ledgers were collected at different historical snapshots and may be stale.",
            "Rank and symbol changes never imply an identical trading instrument.",
            "A token's ticker may collide with a different token or old denomination.",
            "A listed Spot instrument does not prove CoinGecko ID, OHLCV source or redistribution rights.",
            "No public archive may be inferred from private WBT source metadata.",
            "Only existing source collectors may append real, verified OHLCV; no direct automatic collection approved here.",
        ],
    }


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--root", type=Path, default=ROOT)
    cli.add_argument("--output", type=Path)
    args = cli.parse_args()
    docs, fingerprints = {}, {}
    for key, path in {**source_union.SOURCES, **ADDITIONAL}.items():
        raw = (args.root / path).read_bytes()
        docs[key] = json.loads(raw)
        fingerprints[key] = {"path": path,
                             "sha256": hashlib.sha256(raw).hexdigest()}
    report = reconcile(
        docs["binance_year"], docs["minute"], docs["daily"],
        docs["venue"], docs["identity"], docs["alternative"],
        docs["official"], docs["private"])
    report["source_file_sha256"] = fingerprints
    content = json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(content, encoding="utf-8")
    else:
        print(content, end="")


if __name__ == "__main__":
    main()
