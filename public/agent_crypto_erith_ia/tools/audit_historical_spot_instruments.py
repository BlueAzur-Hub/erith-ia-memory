#!/usr/bin/env python3
"""Read-only official OKX/Bitget Spot instrument audit for unarchived Top250.

An instrument match is NEVER proof of a CoinGecko asset identity, a historical
OHLCV month, an archive, or a trading permission. No order endpoints or keys.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
from pathlib import Path
import re
from urllib.request import Request, urlopen

import discover_historical_spot_venues as discovery

BASE = discovery.BASE
OUTPUT = BASE / "top250-official-spot-instruments.json"
SCHEMA = "aerith.public.ohlcv.spot.top250.official-instrument-candidates.v1"
ENDPOINTS = {
    "okx": "https://www.okx.com/api/v5/public/instruments?instType=SPOT",
    "bitget": "https://api.bitget.com/api/v3/market/instruments?category=SPOT",
}
QUOTES = frozenset({"USDT", "USDC"})
PAIR = re.compile(r"^[A-Z0-9]{1,30}$")
MAX_BYTES = 12_000_000


def need(valid, reason):
    if not valid:
        raise ValueError(reason)


def fetch_document(venue):
    need(venue in ENDPOINTS, "Unknown official venue")
    req = Request(ENDPOINTS[venue], headers={
        "User-Agent": "SevenHeaven-SpotInstrument-Evidence/1.0",
        "Accept": "application/json",
    })
    with urlopen(req, timeout=45) as response:
        need(response.status == 200, "Official instrument API HTTP error")
        raw = response.read(MAX_BYTES + 1)
    need(0 < len(raw) <= MAX_BYTES, "Official instrument response oversized")
    return json.loads(raw), hashlib.sha256(raw).hexdigest()


def parse_instruments(venue, document):
    need(venue in ENDPOINTS and isinstance(document, dict), "Unknown instrument source")
    if venue == "okx":
        need(document.get("code") == "0", "OKX rejected public Spot request")
    else:
        need(document.get("code") == "00000", "Bitget rejected public Spot request")
    data = document.get("data")
    need(isinstance(data, list) and 0 < len(data) <= 100000,
         "Official Spot instrument inventory missing or unbounded")
    symbols = {}
    for item in data:
        if not isinstance(item, dict):
            continue
        if venue == "okx":
            base, quote = item.get("baseCcy"), item.get("quoteCcy")
            inst = item.get("instId")
            is_spot = item.get("instType") == "SPOT" and item.get("state") == "live"
            expected = f"{base}-{quote}"
        else:
            base, quote = item.get("baseCoin"), item.get("quoteCoin")
            inst = item.get("symbol")
            is_spot = item.get("category") == "SPOT" and item.get("status") == "online"
            expected = f"{base}{quote}"
        if not is_spot or not isinstance(base, str) or not PAIR.fullmatch(base):
            continue
        if quote not in QUOTES or base == quote or inst != expected:
            continue
        key = (base, quote)
        need(key not in symbols or symbols[key] == inst,
             "Conflicting source instruments for the same pair")
        symbols[key] = inst
    return symbols


def build(queue, archived, sources, clock=None):
    """Map exact platform instruments to symbols; *never* to proven coin IDs."""
    need(len(queue) == 250 and len({x["id"] for x in queue}) == 250
         and len({x["rank"] for x in queue}) == 250, "Ranked Top250 incomplete")
    need(all(name in ENDPOINTS and isinstance(rows, dict)
             for name, rows in sources.items()), "Malformed source inventory")
    remaining = [asset for asset in queue if asset["id"] not in archived]
    symbols = {}
    for item in queue:
        symbols.setdefault(item["symbol"], set()).add(item["id"])
    records = []
    for asset in remaining:
        sym = asset["symbol"]
        ambiguous = len(symbols[sym]) != 1
        candidates = []
        if isinstance(sym, str) and PAIR.fullmatch(sym) and not ambiguous:
            for venue in sorted(sources):
                data = sources[venue]
                if data.get("status") != "success":
                    continue
                for quote in sorted(QUOTES):
                    instrument = data["symbols"].get((sym, quote))
                    if instrument:
                        candidates.append({
                            "venue": venue, "instrument": instrument,
                            "base": sym, "quote": quote,
                            "exchange_instrument_confirmed": True,
                            "coin_id_confirmed": False,
                            "native_1m_month_confirmed": False,
                        })
        status = ("ambiguous_symbol" if ambiguous else
                  "instrument_candidates_not_identity_proof" if candidates else
                  "no_verifiable_instrument")
        records.append({
            "id": asset["id"], "rank": asset["rank"], "symbol": sym,
            "status": status, "instruments": candidates,
            "archived": False, "coin_id_confirmed": False,
            "native_1m_month_confirmed": False,
        })
    need(len(records) == 250-len(archived) and
         len({x["id"] for x in records}) == len(records), "Incomplete candidates")
    metadata = {
        venue: {
            "status": source["status"],
            "instruments": len(source.get("symbols", {})),
            "source_sha256": source.get("sha256"),
            "reason": source.get("reason"),
            "url": ENDPOINTS[venue],
        } for venue, source in sorted(sources.items())
    }
    return {
        "schema": SCHEMA, "ranked": 250, "archived_assets_at_audit": len(archived),
        "candidate_count": len(records),
        "with_spot_instrument": sum(bool(x["instruments"]) for x in records),
        "source": "Official public OKX and Bitget Spot instrument inventories",
        "checked_at": clock or dt.datetime.now(dt.timezone.utc).isoformat(),
        "markets": metadata, "assets": records,
        "note": ("Symbol-matched official instruments are candidates ONLY. "
                 "CoinGecko-ID ↔ venue instrument provenance and complete native "
                 "one-minute OHLCV are mandatory before any new archive."),
        "no_synthetic_candles": True, "no_orders": True,
    }


def audit(queue, archived, fetcher=fetch_document):
    sources = {}
    for venue in ENDPOINTS:
        try:
            document, source_hash = fetcher(venue)
            rows = parse_instruments(venue, document)
            sources[venue] = {
                "status": "success", "symbols": rows,
                "sha256": source_hash,
            }
        except (OSError, ValueError, TypeError, KeyError, TimeoutError) as exc:
            sources[venue] = {
                "status": "source_unavailable",
                "reason": (type(exc).__name__ + ": " + str(exc))[:160],
            }
    return build(queue, archived, sources)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--plan", action="store_true")
    parser.add_argument("--probe", action="store_true")
    args = parser.parse_args()
    need(args.plan != args.probe, "Select --plan or --probe")
    queue, archived = discovery.universe()
    if args.plan:
        print("OFFICIAL SPOT PLAN " + json.dumps({
            "ranked": len(queue), "archived": len(archived),
            "remaining": len(queue)-len(archived),
            "sources": sorted(ENDPOINTS)}, sort_keys=True))
        return
    result = audit(queue, archived)
    if all(x["status"] == "source_unavailable" for x in result["markets"].values()):
        # A transient pair of upstream errors may not erase prior evidence.
        print("OFFICIAL SPOT SOURCES UNAVAILABLE: original evidence unchanged", flush=True)
        return
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    tmp = OUTPUT.with_suffix(".tmp")
    tmp.write_text(json.dumps(result, indent=2, ensure_ascii=False, sort_keys=True) + "\n")
    tmp.replace(OUTPUT)
    print("OFFICIAL SPOT SUMMARY " + json.dumps({
        "candidates": result["candidate_count"],
        "with_spot_instrument": result["with_spot_instrument"],
        "sources": {k:v["status"] for k,v in result["markets"].items()}
    }, sort_keys=True), flush=True)


if __name__ == "__main__":
    main()
