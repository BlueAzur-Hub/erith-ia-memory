#!/usr/bin/env python3
"""Public OKX quotes for ALREADY archived Radar PAPER studies, independently of today's Top20.

No order API, no balance, no new hypothetical entry, no historical backfill.
Uses the existing OKX instrument and best-book validation from Radar.
"""
from __future__ import annotations

import datetime as dt
import json
import pathlib
import re
import sys

from qualify_radar_targets import (
    get, iso, native_okx_spot_rules, okx_public_best_book, public_json, utcnow
)

ROOT = pathlib.Path(__file__).resolve().parents[1]
JOURNAL = ROOT / "data/crypto/radar-opportunities/okx-hurdle-followups.json"
SCHEMA = "erith.radar.okx.public-followup-observation.v1"
SYMBOL = re.compile(r"^[A-Z0-9]{1,16}$")


def check(condition, reason):
    if not condition:
        raise ValueError(reason)


def utc(value):
    check(isinstance(value, str) and value.endswith("Z"), "Invalid UTC")
    result = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    check(result.utcoffset() == dt.timedelta(0), "UTC required")
    return result


def due(journal, now):
    check(journal.get("schema") == "erith.radar.okx.hurdle-followups.v1"
          and journal.get("orders_enabled") is False
          and journal.get("paper_fills") == 0
          and journal.get("real_orders") == 0
          and journal.get("backtest") is False
          and isinstance(journal.get("studies"), list), "PAPER journal incompatible")
    pair_owner = {}
    wanted = {}
    for study in journal["studies"]:
        check(study.get("status") == "HYPOTHETICAL_COST_STUDY_NO_FILL"
              and study.get("executed_order") is False
              and study.get("orders_enabled") is False
              and study.get("contract_identity_proven") is False,
              "Study in journal not read-only")
        sym, pair, coin = (study.get("symbol"), study.get("pair"),
                           study.get("coin_id"))
        check(isinstance(sym, str) and SYMBOL.fullmatch(sym)
              and pair == sym + "-USDT"
              and isinstance(coin, str) and coin
              and study.get("quote") == "USDT", "Non-spot or unsafe pair")
        if pair in pair_owner:
            check(pair_owner[pair] == coin, "Symbol collision across coin ids")
        pair_owner[pair] = coin
        elapsed = (now - utc(study["entry_book_at_utc"])).total_seconds()/3600
        checks = study.get("followups")
        check(isinstance(checks, list) and len(checks) <= 2, "Bad followups")
        done = {x.get("window") for x in checks}
        if ((23 <= elapsed <= 36 and "24h" not in done)
            or (47 <= elapsed <= 60 and "48h" not in done)):
            wanted[pair] = (sym, coin)
    check(len(wanted) <= 100, "Too many simultaneous pairs")
    return wanted


def collect(journal, fetch=public_json, now=None):
    now = now or utcnow()
    check(now.utcoffset() == dt.timedelta(0), "Collection requires UTC")
    output = {"schema": SCHEMA, "observed_at_utc": iso(now),
              "orders_enabled": False, "real_orders": 0,
              "new_entries_created": 0, "candidates": [],
              "due_pairs": 0, "unavailable_pairs": 0,
              "note": "Public OKX Spot quotes only; no positions, fills or account access"}
    if journal is None:
        return output
    wanted = due(journal, now)
    output["due_pairs"] = len(wanted)
    if not wanted:
        return output
    instrument_data = get("OKX", "/api/v5/public/instruments", {"instType": "SPOT"}, fetch)
    check(isinstance(instrument_data, dict) and instrument_data.get("code") == "0"
          and isinstance(instrument_data.get("data"), list),
          "OKX public instrument API unavailable")
    by_pair = {}
    for row in instrument_data["data"]:
        if isinstance(row, dict) and row.get("instId") in wanted:
            by_pair.setdefault(row["instId"], []).append(row)
    for pair, (sym, coin) in sorted(wanted.items()):
        instruments = by_pair.get(pair, [])
        if len(instruments) != 1:
            output["unavailable_pairs"] += 1
            continue
        rules = native_okx_spot_rules(instruments[0], sym)
        if not rules:
            output["unavailable_pairs"] += 1
            continue
        try:
            book = okx_public_best_book(pair, rules, fetch, utcnow() if fetch is public_json else now)
        except (ValueError, KeyError, TypeError, OSError, TimeoutError):
            output["unavailable_pairs"] += 1
            continue
        output["candidates"].append({
            "id": coin, "symbol": sym,
            "okx_spot": {"venue": "OKX", "quote": "USDT", "pair": pair,
                         "pair_observed": True, "native_rules_verified": True,
                         "contract_identity_proven": False, "real_orders_enabled": False,
                         "rules": rules, "best_book": book}
        })
    return output


def main():
    journal = json.loads(JOURNAL.read_text(encoding="utf-8")) if JOURNAL.exists() else None
    result = collect(journal)
    if result["due_pairs"] and not result["candidates"]:
        raise ValueError("No public OKX book could be verified for due studies")
    sys.stdout.write(json.dumps(result, ensure_ascii=False, allow_nan=False) + "\n")
    print("OKX quotes due=%d verified=%d unavailable=%d" %
          (result["due_pairs"], len(result["candidates"]), result["unavailable_pairs"]),
          file=sys.stderr)


if __name__ == "__main__":
    main()
