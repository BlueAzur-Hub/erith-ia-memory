#!/usr/bin/env python3
"""Radar -> Spot evidence -> PAPER decision audit; no trading, no network.

Uses immutable public Radar date snapshots, the *later* Spot qualification record,
and existing Q/ICNT/FLUID public observation states. Later evidence NEVER
retroactively authorizes a trade at the Radar detection timestamp.
"""
from __future__ import annotations
import argparse
import datetime as dt
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RADAR = ROOT / "data/crypto/radar-opportunities"
STATES = (
    ("quack-ai", ROOT / "data/trader_flux/q_paper/state.json"),
    ("impossible-cloud-network-token", ROOT / "data/trader_flux/radar_priority_spot/icnt/state.json"),
    ("instadapp", ROOT / "data/trader_flux/radar_priority_spot/fluid/state.json"),
)
DEST = RADAR / "spot-paper-audit.json"
SCHEMA = "erith.radar.spot-paper-decision-audit.v1"
DAY = dt.timedelta(days=1)


def require(condition, message):
    if not condition:
        raise ValueError(message)


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def utc(value):
    require(isinstance(value, str) and value.endswith("Z"), "horodatage non UTC")
    out = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    require(out.utcoffset() == dt.timedelta(0), "horodatage hors UTC")
    return out


def positive(value):
    return isinstance(value, (float, int)) and not isinstance(value, bool) and math.isfinite(value) and value > 0


def selected(doc):
    require(doc.get("schema") == "erith.radar.opportunity-observation.v1"
            and doc.get("record_kind") == "prospective_snapshot"
            and doc.get("orders_enabled") is False
            and doc.get("simulation_only") is True,
            "archive Radar non certifiée")
    date = doc["observed_date_utc"]
    require(len(date) == 10 and date == dt.date.fromisoformat(date).isoformat(),
            "date Radar invalide")
    seen = set()
    result = []
    for kind in ("momentum_24h_7d", "rebound_24h_only"):
        for item in doc.get("groups", {}).get(kind, []):
            coin = item.get("id")
            require(isinstance(coin, str) and coin and coin not in seen,
                    "identité manquante ou dupliquée")
            seen.add(coin)
            at = utc(item.get("sourceSnapshot"))
            require(at.date().isoformat() == date and positive(item.get("priceUsd")),
                    "prix de détection invalide")
            result.append((kind, item, at))
    return result


def last_value(doc, coin_id, expected_day):
    records = []
    records.extend(doc.get("tracked_candidates") or [])
    for kind in ("momentum_24h_7d", "rebound_24h_only"):
        records.extend(doc.get("groups", {}).get(kind, []))
    for row in records:
        if row.get("id") != coin_id:
            continue
        price = row.get("price_usd", row.get("priceUsd"))
        stamp = row.get("observed_at_utc", row.get("sourceSnapshot"))
        if positive(price) and stamp:
            when = utc(stamp)
            if when.date().isoformat() == expected_day:
                return (float(price), when)
    return None


def spot_evidence(coin_id, symbol, first_at, qualification, states):
    # The qualification was taken on the LAST day: never call it an entry-day proof.
    matches = [x for x in qualification.get("candidates", []) if x.get("id") == coin_id]
    require(len(matches) <= 1, "qualification à identités dupliquées")
    state = states.get(coin_id)
    book_sample = None
    if state:
        require(state.get("coin_id") == coin_id and
                state.get("paper_only") is True and state.get("orders_enabled") is False and
                state.get("executed_order") is False and state.get("quote") == "USDT",
                "observation Spot incompatible")
        valid = []
        for o in state.get("recent_observations", []):
            if (o.get("coin_id") != coin_id or o.get("symbol") != symbol
                or o.get("market") != state.get("market")
                or o.get("venue") != state.get("venue")
                or o.get("instrument_type") != "SPOT" or o.get("quote") != "USDT"
                or o.get("paper_only") is not True or o.get("executed_order") is not False):
                raise ValueError("observation Spot d'identité incohérente")
            when = utc(o["at_utc"])
            book = o.get("book", {})
            # Ignore old or malformed books; NEVER look up future quote for past entry.
            if (when >= first_at and positive(book.get("best_ask_usdt"))
                and positive(book.get("best_bid_usdt"))
                and book["best_ask_usdt"] > book["best_bid_usdt"]
                and book.get("book_age_seconds", 999) <= 120
                and book.get("book_age_seconds", -999) >= 0):
                valid.append((when, o))
        if valid:
            valid.sort(key=lambda v: v[0])
            when, sample = valid[0]
            book_sample = {"venue": sample["venue"], "pair": sample["market"],
                           "quote": "USDT", "observed_at_utc": when.isoformat().replace("+00:00", "Z"),
                           "best_ask_usdt": sample["book"]["best_ask_usdt"],
                           "best_bid_usdt": sample["book"]["best_bid_usdt"],
                           "observation_later_than_signal": when > first_at,
                           "identity_certified": False}

    q = matches[0] if matches else None
    qual_snapshot = None
    if q and q.get("market"):
        m = q["market"]
        require(q.get("symbol") == symbol, "qualification de symbole contradictoire")
        qual_at = utc(qualification["qualified_at_utc"])
        require(qual_at >= first_at, "qualification future utilisée comme preuve antérieure")
        qual_snapshot = {"venue": m.get("provider"), "pair": m.get("pair"),
                         "quote": m.get("quote"),
                         "recorded_at_utc": qualification["qualified_at_utc"],
                         "identity_certified": False,
                         "status": q.get("status"),
                         "public_spread_bps_at_snapshot": m.get("book", {}).get("spread_bps"),
                         "later_than_detection": True}
    return {"early_public_spot_book": book_sample,
            "later_spot_qualification": qual_snapshot,
            "contract_identity_proven": False,
            "quote_conversion_usd_to_usdt_proven": False}


def build(folder=RADAR, states_override=None):
    dates = sorted(p.stem for p in folder.glob("20??-??-??.json"))
    require(len(dates) >= 3, "trois journées Radar indispensables")
    # The 48-hour audit is fixed at the first and third most recent archived
    # days. It does not revise the prospectively published entry-day candidates.
    first, mid, last = dates[-3:]
    require(dt.date.fromisoformat(last) - dt.date.fromisoformat(first) == DAY * 2,
            "archives quotidiennes discontinues : pas de fausse fenêtre 48h")
    old, end = read(folder / f"{first}.json"), read(folder / f"{last}.json")
    require(end.get("observed_date_utc") == last and
            old.get("observed_date_utc") == first and end.get("orders_enabled") is False,
            "archives horodatées invalides")
    initial = selected(old)
    qualification = read(folder / "qualification-latest.json")
    require(qualification.get("schema") == "erith.radar.spot-qualification.v1"
            and qualification.get("source_observation_date_utc") == last
            and qualification.get("real_orders_enabled") is False
            and qualification.get("actual_execution_permissions") is False
            and qualification.get("coin_id_matches_exchange_symbol_verified") is False,
            "qualification Spot datée non compatible")
    qual_at = utc(qualification["qualified_at_utc"])
    require(qual_at.date().isoformat() == last,
            "qualification non réalisée lors du dernier jour")
    states = states_override
    if states is None:
        states = {coin: read(p) for coin, p in STATES if p.exists()}

    records = []
    for group, entry, detected in initial:
        id_, symbol = entry["id"], entry["symbol"]
        later = last_value(end, id_, last)
        price = float(entry["priceUsd"])
        change = round(100 * (later[0] / price - 1), 5) if later and later[1] > detected else None
        spot = spot_evidence(id_, symbol, detected, qualification, states)
        observed = (spot["early_public_spot_book"] is not None
                    or spot["later_spot_qualification"] is not None)
        blocked = ("CONTRACT_IDENTITY_UNVERIFIED" if observed
                   else "NO_PUBLIC_SPOT_BOOK_OR_PAIR_FOR_CANDIDATE")
        records.append({
            "coin_id": id_, "symbol": symbol, "name": entry.get("name", symbol),
            "detected_group": group, "detected_at_utc": detected.isoformat().replace("+00:00", "Z"),
            "entry_day_aggregate_price_usd": price,
            "last_day_aggregate_at_utc": later[1].isoformat().replace("+00:00", "Z") if later else None,
            "last_day_aggregate_price_usd": later[0] if later else None,
            "aggregate_change_pct_observed": change,
            "outcome_state": "OBSERVED_LATER" if change is not None else "NO_COMPARABLE_LATER_PRICE",
            "spot": spot,
            "paper": {"decision": "BLOCKED", "reason": blocked,
                      "entry_at_utc": None, "entry_price_usdt": None,
                      "exit_price_usdt": None, "net_profit_usdt": None,
                      "executed_order": False, "trade_count": 0},
        })
    require(len(records) == len(initial) and len({x["coin_id"] for x in records}) == len(records),
            "incomplet ou doublon d'audit")
    counted = sum(x["aggregate_change_pct_observed"] is not None and
                  x["aggregate_change_pct_observed"] > 0 for x in records)
    has_spot = sum(x["spot"]["early_public_spot_book"] is not None or
                   x["spot"]["later_spot_qualification"] is not None for x in records)
    return {
        "schema": SCHEMA, "read_only": True, "orders_enabled": False,
        "trades_executed": 0, "paper_trades_opened": 0,
        "analysis_is_retroactive": True, "strategy_certified": False,
        "source_first_day_utc": first, "source_last_day_utc": last,
        "source_intermediate_day_utc": mid,
        "qualification_observed_at_utc": qualification["qualified_at_utc"],
        "source_basis": "Archived Radar CoinGecko USD groups plus later Spot USDT evidence",
        "qualification_time_is_not_entry_time": True,
        "total_detected": len(records),
        "later_prices_comparable": sum(x["aggregate_change_pct_observed"] is not None for x in records),
        "later_price_rises": counted, "public_spot_evidence_candidates": has_spot,
        "blocked_paper_candidates": len(records),
        "no_eligible_paper_trade_without_contract_and_timestamp_proof": True,
        "note": ("Variations CoinGecko USD sur deux jours ≠ rendement Spot USDT exécuté. "
                 "Qualif Spot du dernier jour = preuve TARDIVE, jamais preuve à l'entrée. "
                 "Toutes les entrées PAPER restent bloquées en l'absence d'identité de contrat "
                 "certifiée, carnet au bon instant et hypothèses de frais vérifiables. "
                 "Les baisses et dossiers sans cotation restent visibles."),
        "candidates": records
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="vérifier l'archive sans écriture")
    args = parser.parse_args()
    report = build()
    serialized = json.dumps(report, ensure_ascii=False, sort_keys=True, indent=2) + "\n"
    if args.check:
        require(DEST.exists() and DEST.read_text(encoding="utf-8") == serialized,
                "le dossier publié n'est pas synchronisé")
    else:
        DEST.write_text(serialized, encoding="utf-8")
    print("Radar→Spot→PAPER:", report["source_first_day_utc"], "→",
          report["source_last_day_utc"], "| detected:", report["total_detected"],
          "| later rises:", report["later_price_rises"], "| Spot evidence:",
          report["public_spot_evidence_candidates"], "| PAPER trades:", 0)


if __name__ == "__main__":
    main()
