#!/usr/bin/env python3
"""Prospective, public-quote PAPER shadow ledger. NO fills, account access or orders.

A position is an explicit hypothetical quote-at-ask, NOT executable entry.
Only qualified identity and a contemporaneous venue's book permit the scenario;
later bid and hypothetical fees close it >= 48 h later, never retroactively.
"""
from __future__ import annotations
import datetime as dt
from decimal import Decimal, InvalidOperation
import json
from pathlib import Path
from qualify_radar_spot_identity import SCHEMA as ID_SCHEMA, instant, iso

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data/crypto/radar-opportunities"
OUTPUT = DATA / "spot-paper-forward.json"
SCHEMA = "erith.radar.spot-paper-forward-shadow.v1"
TICKET = Decimal("100")
FEE_SIDE = Decimal("0.001")  # Hypothetical 0.1% per side, not OKX/Bitget fees.
SLIPPAGE_SIDE = Decimal("0.001")
MAX_SPREAD_BPS = Decimal("150")
CAP = 4
HOLD = dt.timedelta(hours=48)


def ensure(ok, why):
    if not ok:
        raise ValueError(why)


def decimal(v):
    try:
        x = Decimal(str(v))
    except (InvalidOperation, TypeError) as e:
        raise ValueError("prix ou limite illisible") from e
    ensure(x.is_finite() and x > 0, "prix ou limite non positif")
    return x


def fresh_book(qualification, identity, item, now):
    m = next((x.get("market") for x in qualification["candidates"]
              if x["id"] == item["coin_id"]), None)
    if not m or m.get("provider") != "Bitget" or m.get("pair") != item["pair"] \
            or m.get("quote") != "USDT":
        return None
    b = m.get("book") or {}
    if b.get("exchange_timestamp_verified") is not True:
        return None
    at = instant(b.get("observed_at_utc"))
    if not dt.timedelta(0) <= now - at <= dt.timedelta(minutes=8):
        return None
    if abs(at - instant(qualification["qualified_at_utc"])) > dt.timedelta(minutes=8):
        return None
    bid, ask = decimal(b.get("best_bid_usdt")), decimal(b.get("best_ask_usdt"))
    spread = decimal(b.get("spread_bps"))
    if bid >= ask:
        return None
    # Trust original best bid/ask prices, not an inconsistent quoted spread.
    # The source computes mid-price basis points rounded to five decimals.
    measured_spread = (ask - bid) * Decimal("20000") / (ask + bid)
    if (measured_spread > MAX_SPREAD_BPS or spread > MAX_SPREAD_BPS
            or abs(measured_spread - spread) > Decimal("1")):
        return None
    return {"at_utc": iso(at), "bid_usdt": str(bid), "ask_usdt": str(ask),
            "spread_bps": str(round(measured_spread, 5))}


def empty():
    return {"schema": SCHEMA, "orders_enabled": False, "real_orders": 0,
            "paper_fills": 0, "execution_proven": False,
            "ticket_usdt": str(TICKET), "max_shadow_positions": CAP,
            "fee_side_fraction_assumed": str(FEE_SIDE),
            "slippage_side_fraction_assumed": str(SLIPPAGE_SIDE),
            "minimum_holding_hours": 48,
            "last_observation_at_utc": None, "positions": [], "closures": [],
            "seen_candidate_ids": []}


def validate(state):
    ensure(state.get("schema") == SCHEMA and state.get("orders_enabled") is False and
           state.get("real_orders") == 0 and state.get("paper_fills") == 0 and
           state.get("execution_proven") is False and state.get("ticket_usdt") == "100" and
           state.get("minimum_holding_hours") == 48 and
           state.get("max_shadow_positions") == CAP and
           isinstance(state.get("positions"), list) and isinstance(state.get("closures"), list) and
           isinstance(state.get("seen_candidate_ids"), list), "ledger PAPER invalide")
    ensure(len(state["positions"]) <= CAP and
           len(set(state["seen_candidate_ids"])) == len(state["seen_candidate_ids"]) and
           all(x.get("status") == "HYPOTHETICAL_CLOSED_NO_FILL" and
               x.get("executed_order") is False and x.get("realized_profit_usdt") is None
               for x in state["closures"]),
           "archive PAPER incohérente")
    ensure(all(p.get("status") == "HYPOTHETICAL_NO_FILL" and
               p.get("coin_id") in state["seen_candidate_ids"] and
               p.get("quote") == "USDT" for p in state["positions"]), "position papier falsifiée")
    return state


def advance(identity, qualification, state, now):
    validate(state)
    ensure(identity.get("schema") == ID_SCHEMA and identity.get("orders_enabled") is False and
           identity.get("paper_orders") == 0 and identity.get("real_orders") == 0 and
           qualification.get("schema") == "erith.radar.spot-qualification.v1" and
           qualification.get("real_orders_enabled") is False, "source Spot non attestée")
    acquired = instant(identity["collected_at_utc"])
    qual_at = instant(qualification["qualified_at_utc"])
    ensure(identity.get("qualification_at_utc") == qualification["qualified_at_utc"] and
           identity.get("source_radar_day_utc") == qualification["source_observation_date_utc"] and
           dt.timedelta(0) <= now - acquired <= dt.timedelta(minutes=12) and
           dt.timedelta(0) <= acquired - qual_at <= dt.timedelta(minutes=20),
           "sources de dates différentes ou périmées")
    previous = state.get("last_observation_at_utc")
    ensure(previous is None or acquired > instant(previous), "relecture du même relevé interdite")
    rows = identity.get("candidates", [])
    ensure(len(rows) == 20 and len({x["coin_id"] for x in rows}) == 20,
           "identités candidates incomplètes")
    out = json.loads(json.dumps(state))
    out["last_observation_at_utc"] = iso(acquired)
    positions, closures = [], list(out["closures"])
    lookup = {x["coin_id"]: x for x in rows}
    for position in state["positions"]:
        matched = lookup.get(position["coin_id"])
        if (not matched or matched.get("identity_proven") is not True or
            matched.get("platform") != position["platform"] or
            matched.get("contract_address") != position["contract_address"] or
            matched.get("pair") != position["pair"]):
            positions.append(position)  # No liquidation without same exact owner + book.
            continue
        book = fresh_book(qualification, identity, matched, acquired)
        if not book or acquired - instant(position["entry_quote_at_utc"]) < HOLD:
            positions.append(position)
            continue
        bid = decimal(book["bid_usdt"])
        qty = decimal(position["hypothetical_quantity"])
        gross = qty * bid
        end = gross * (1-FEE_SIDE-SLIPPAGE_SIDE)
        pnl = end - TICKET
        closures.append({
            **position, "status": "HYPOTHETICAL_CLOSED_NO_FILL",
            "exit_quote_at_utc": book["at_utc"], "exit_bid_usdt": str(bid),
            "hypothetical_exit_after_cost_usdt": str(round(end, 8)),
            "hypothetical_pnl_usdt": str(round(pnl, 8)),
            "hypothetical_percent": str(round(100*pnl/TICKET, 6)),
            "realized_profit_usdt": None, "executed_order": False
        })
    out["positions"] = positions
    out["closures"] = closures
    seen = set(state["seen_candidate_ids"])
    priority = set(qualification.get("priority_research_ids", []))
    # Selection was frozen in the qualification, BEFORE these candidate future exits.
    for item in rows:
        cid = item["coin_id"]
        if cid in seen or len(out["positions"]) >= CAP or cid not in priority \
                or item.get("identity_proven") is not True or \
                item.get("paper_entry_decision") != "AWAIT_NEXT_DATED_BOOK_AND_COST_CHECK":
            continue
        book = fresh_book(qualification, identity, item, acquired)
        if not book or decimal(item["min_order_usdt"]) > TICKET:
            continue
        ask = decimal(book["ask_usdt"])
        qty = TICKET * (1-FEE_SIDE-SLIPPAGE_SIDE) / ask
        out["positions"].append({
            "coin_id": cid, "symbol": item["symbol"], "pair": item["pair"],
            "venue": item["venue"], "quote": "USDT",
            "platform": item["platform"], "contract_address": item["contract_address"],
            "status": "HYPOTHETICAL_NO_FILL", "entry_quote_at_utc": book["at_utc"],
            "entry_ask_usdt": str(ask), "entry_spread_bps": book["spread_bps"],
            "hypothetical_quantity": str(round(qty, 12)),
            "notional_usdt": str(TICKET), "executed_order": False,
            "realized_profit_usdt": None, "maximum_book_level_size_unverified": True,
            "tick_lot_verified": False, "fee_and_slippage_assumed": True
        })
        seen.add(cid)
    out["seen_candidate_ids"] = sorted(seen)
    return validate(out)


def main():
    identity_path = DATA / "spot-identity-latest.json"
    if not identity_path.is_file():
        print("No dated Spot identity yet; no PAPER entry")
        return
    identity = json.loads(identity_path.read_text(encoding="utf-8"))
    qualification = json.loads((DATA/"qualification-latest.json").read_text(encoding="utf-8"))
    state = json.loads(OUTPUT.read_text(encoding="utf-8")) if OUTPUT.exists() else empty()
    updated = advance(identity, qualification, state, dt.datetime.now(dt.timezone.utc))
    OUTPUT.write_text(json.dumps(updated, ensure_ascii=False, sort_keys=True, indent=2) + "\n",
                      encoding="utf-8")
    print("PAPER shadow:", len(updated["positions"]), "open /", len(updated["closures"]),
          "closed. Real orders 0; fills 0; prices hypothetical.")


if __name__ == "__main__":
    main()
