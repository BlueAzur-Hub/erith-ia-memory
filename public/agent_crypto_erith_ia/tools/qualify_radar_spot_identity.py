#!/usr/bin/env python3
"""Prospective public Spot identity: exact EVM chain+contract cross-source.

Called ONLY after today's Radar Spot qualification. A symbol or a price cannot
prove an asset identity. No private API, trade, fill, historic reconstruction or
USD/USDT equivalence. Exchanges beyond public Bitget native coin contracts
are marked unsupported, not assumed verified.
"""
from __future__ import annotations
import argparse
import datetime as dt
import json
import pathlib
import urllib.parse
import urllib.request

from prove_public_spot_contracts import PLATFORMS, address

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / "data/crypto/radar-opportunities"
SCHEMA = "erith.radar.spot-identity-prospective.v1"
COINGECKO = "https://api.coingecko.com/api/v3/coins/list?include_platform=true"
BITGET_COIN = "https://api.bitget.com/api/v3/market/coins"
BITGET_INSTRUMENT = "https://api.bitget.com/api/v3/market/instruments"
MIN_CATALOG = 1000
MAX_QUALIFICATION_AGE = dt.timedelta(minutes=20)


def require(ok, reason):
    if not ok:
        raise ValueError(reason)


def instant(raw):
    require(isinstance(raw, str) and raw.endswith("Z"), "date UTC absente")
    value = dt.datetime.fromisoformat(raw.replace("Z", "+00:00"))
    require(value.utcoffset() == dt.timedelta(0), "date non UTC")
    return value


def iso(value):
    return value.astimezone(dt.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def public_json(url):
    require(url == COINGECKO or url.startswith(BITGET_COIN + "?coin=") or
            url.startswith(BITGET_INSTRUMENT + "?category=SPOT&symbol="),
            "Only explicitly approved public endpoints allowed")
    req = urllib.request.Request(url, headers={"User-Agent": "Erith-Radar-Paper-Research/1.0",
                                                 "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=16) as response:
        data = response.read(36_000_001)
        require(response.status == 200 and 0 < len(data) <= 36_000_000,
                "réponse publique absente ou trop volumineuse")
    return json.loads(data)


def coingecko_owners(rows, strict=True):
    require(isinstance(rows, list) and len(rows) >= (MIN_CATALOG if strict else 2),
            "inventaire CoinGecko incomplet")
    ids, owners, by_id = set(), {}, {}
    for x in rows:
        if not isinstance(x, dict) or not isinstance(x.get("id"), str) or not x["id"]:
            continue
        require(x["id"] not in ids, "identité CoinGecko dupliquée")
        ids.add(x["id"])
        by_id[x["id"]] = x
        for network, raw in (x.get("platforms") or {}).items():
            a = address(raw)
            if a and network in PLATFORMS.values():
                owners.setdefault((network, a), set()).add(x["id"])
    return by_id, owners


def native_chain_matches(coin_response, symbol, coin_id, cg, owners):
    require(coin_response.get("code") == "00000" and
            isinstance(coin_response.get("data"), list), "réponse Bitget coins invalide")
    rows = [x for x in coin_response["data"] if isinstance(x, dict) and
            x.get("coin") == symbol]
    require(len(rows) == 1 and isinstance(rows[0].get("chains"), list),
            "identité native Bitget absente ou ambiguë")
    cg_platforms = cg.get("platforms") or {}
    matched = []
    for chain in rows[0]["chains"]:
        if not isinstance(chain, dict):
            continue
        platform = PLATFORMS.get(str(chain.get("chain", "")).upper())
        addr = address(chain.get("contractAddress"))
        if (platform and addr and address(cg_platforms.get(platform)) == addr and
                owners.get((platform, addr)) == {coin_id}):
            matched.append((platform, addr))
    return sorted(set(matched))


def instrument_metadata(response, pair, symbol):
    require(response.get("code") == "00000" and isinstance(response.get("data"), list),
            "instruments Bitget indisponibles")
    instruments = [x for x in response["data"] if
                   x.get("category") == "SPOT" and x.get("symbol") == pair and
                   x.get("baseCoin") == symbol and x.get("quoteCoin") == "USDT" and
                   x.get("status") == "online" and x.get("symbolType", "crypto") == "crypto" and
                   x.get("isRwa", "NO") != "YES"]
    require(len(instruments) == 1, "paire native Spot non unique ou désactivée")
    raw = instruments[0].get("minOrderAmount")
    require(isinstance(raw, str), "minimum Spot absent")
    from decimal import Decimal, InvalidOperation
    try:
        min_order = Decimal(raw)
    except InvalidOperation as e:
        raise ValueError("minimum Spot invalide") from e
    require(min_order.is_finite() and min_order > 0, "minimum Spot non positif")
    return str(min_order)



def instrument_exit_filters(response, pair, symbol):
    """Optional native Spot exit filters; never certify a trade from identity alone."""
    from decimal import Decimal, InvalidOperation
    rows = [x for x in response.get("data", []) if
            isinstance(x, dict) and x.get("category") == "SPOT" and
            x.get("symbol") == pair and x.get("baseCoin") == symbol and
            x.get("quoteCoin") == "USDT" and x.get("status") == "online" and
            x.get("symbolType", "crypto") == "crypto" and x.get("isRwa", "NO") != "YES"]
    if len(rows) != 1:
        return None
    row = rows[0]
    try:
        min_qty = Decimal(str(row.get("minOrderQty")))
        quantity_precision = int(row["quantityPrecision"])
        price_precision = int(row["pricePrecision"])
        if (isinstance(row["quantityPrecision"], bool) or
            isinstance(row["pricePrecision"], bool) or
            str(row["quantityPrecision"]) != str(quantity_precision) or
            str(row["pricePrecision"]) != str(price_precision) or
            not 0 <= quantity_precision <= 8 or not 0 <= price_precision <= 8 or
            not min_qty.is_finite() or min_qty <= 0 or min_qty.as_tuple().exponent < -8):
            return None
    except (ValueError, TypeError, KeyError, InvalidOperation):
        return None
    lot_step = Decimal(1).scaleb(-quantity_precision)
    tick_size = Decimal(1).scaleb(-price_precision)
    # Tick/lot here come from public precision, not private account permissions.
    return {"min_quantity": str(min_qty), "lot_step": str(lot_step),
            "tick_size": str(tick_size), "rules_source": "Bitget public SPOT instrument"}


def build(qualification, coins, coin_lookup, instrument_lookup, now, strict_catalog=True):
    require(now.tzinfo is not None and now.utcoffset() == dt.timedelta(0), "UTC obligatoire")
    require(qualification.get("schema") == "erith.radar.spot-qualification.v1" and
            qualification.get("real_orders_enabled") is False and
            qualification.get("actual_execution_permissions") is False and
            qualification.get("coin_id_matches_exchange_symbol_verified") is False,
            "qualification Radar non authentifiée")
    when = instant(qualification.get("qualified_at_utc"))
    require(dt.timedelta(0) <= now - when <= MAX_QUALIFICATION_AGE,
            "Qualification Spot trop ancienne ou future")
    require(qualification.get("source_observation_date_utc") == now.date().isoformat(),
            "Qualification Spot ne correspond pas au jour Radar")
    candidates = qualification.get("candidates")
    require(isinstance(candidates, list) and len(candidates) == 20 and
            len({x["id"] for x in candidates}) == 20, "sélection Radar incomplète")
    by_id, owners = coingecko_owners(coins, strict_catalog)
    report = []
    for entry in candidates:
        coin_id, sym, m = entry["id"], entry["symbol"], entry.get("market")
        row = {"coin_id": coin_id, "symbol": sym, "detected_at_utc": None,
               "venue": m.get("provider") if isinstance(m, dict) else None,
               "pair": m.get("pair") if isinstance(m, dict) else None,
               "quote": m.get("quote") if isinstance(m, dict) else None,
               "status": "NO_PUBLIC_SPOT_EVIDENCE",
               "identity_proven": False, "platform": None, "contract_address": None,
               "min_order_usdt": None, "spot_exit_rules": None,
               "paper_entry_decision": "BLOCKED", "paper_entry_price_usdt": None,
               "paper_exit_price_usdt": None, "paper_pnl_usdt": None,
               "paper_orders": 0, "real_orders": 0}
        if not m:
            report.append(row)
            continue
        if m.get("provider") != "Bitget" or m.get("quote") != "USDT":
            row["status"] = "NATIVE_CONTRACT_SOURCE_NOT_SUPPORTED"
            report.append(row)
            continue
        if m.get("pair") != sym + "USDT" or not sym.isascii() or not sym.isalnum():
            row["status"] = "PAIR_IDENTITY_MISMATCH"
            report.append(row)
            continue
        cg = by_id.get(coin_id)
        if not cg or str(cg.get("symbol", "")).upper() != sym:
            row["status"] = "COINGECKO_ID_OR_SYMBOL_MISMATCH"
            report.append(row)
            continue
        try:
            matches = native_chain_matches(coin_lookup(sym), sym, coin_id, cg, owners)
            require(len(matches) >= 1, "aucun contrat EVM identique et unique")
            instrument = instrument_lookup(m["pair"])
            min_order = instrument_metadata(instrument, m["pair"], sym)
            exit_filters = instrument_exit_filters(instrument, m["pair"], sym)
        except (ValueError, KeyError, TypeError, OSError, TimeoutError) as error:
            row["status"] = "PUBLIC_IDENTITY_EVIDENCE_MISSING"
            row["reason"] = str(error)[:150]
            report.append(row)
            continue
        row.update({"identity_proven": True, "status": "CONTRACT_MATCH_AT_COLLECTION",
                    "platform": matches[0][0], "contract_address": matches[0][1],
                    "min_order_usdt": min_order, "spot_exit_rules": exit_filters})
        # Identity proof alone never implies an available historical or future fill.
        row["paper_entry_decision"] = "AWAIT_NEXT_DATED_BOOK_AND_COST_CHECK"
        report.append(row)
    return {
        "schema": SCHEMA, "collected_at_utc": iso(now),
        "source_radar_day_utc": qualification["source_observation_date_utc"],
        "qualification_at_utc": qualification["qualified_at_utc"],
        "coin_source": COINGECKO, "exchange_coin_source": BITGET_COIN,
        "exchange_instrument_source": BITGET_INSTRUMENT,
        "catalog_size": len(coins), "candidate_count": len(report),
        "identity_proven_count": sum(x["identity_proven"] for x in report),
        "decisions_not_executions": True, "orders_enabled": False,
        "paper_orders": 0, "real_orders": 0,
        "no_prior_trades_reconstructed": True,
        "notes": [
            "Contrats EVM vérifiés uniquement par adresse et réseau identiques, propriétaire CoinGecko unique.",
            "Pas de transfert automatique de preuve vers les autres exchanges ou chaînes.",
            "Un minimum d'ordre connu et une paire existante ne constituent pas un fill PAPER.",
            "Le rapport est postérieur au signal Radar, jamais une certification rétroactive.",
            "Aucun cours USD agrégé n'est converti implicitement en prix de vente USDT.",
        ], "candidates": report
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    out = DATA / "spot-identity-latest.json"
    if args.check:
        j = json.loads(out.read_text(encoding="utf-8"))
        require(j.get("schema") == SCHEMA and j.get("orders_enabled") is False and
                j.get("paper_orders") == 0 and j.get("real_orders") == 0 and
                len(j.get("candidates", [])) == j.get("candidate_count") == 20 and
                sum(x.get("identity_proven") is True for x in j["candidates"]) == j["identity_proven_count"] and
                all(x.get("paper_entry_price_usdt") is None and
                    x.get("paper_pnl_usdt") is None for x in j["candidates"]),
                "publication identité Spot invalide")
        print("Identity publication verified:", j["collected_at_utc"])
        return
    qualification = json.loads((DATA / "qualification-latest.json").read_text(encoding="utf-8"))
    now = dt.datetime.now(dt.timezone.utc)
    # Never reuse a stale Spot qualification to manufacture a 'new signal'.
    instant(qualification["qualified_at_utc"])
    require(dt.timedelta(0) <= now-instant(qualification["qualified_at_utc"]) <= MAX_QUALIFICATION_AGE,
            "Qualification Radar devenue périmée avant collecte identité")
    coingecko = public_json(COINGECKO)
    def get_coin(symbol):
        return public_json(BITGET_COIN + "?coin=" + urllib.parse.quote(symbol))
    def get_instrument(pair):
        return public_json(BITGET_INSTRUMENT + "?category=SPOT&symbol=" + urllib.parse.quote(pair))
    report = build(qualification, coingecko, get_coin, get_instrument,
                   dt.datetime.now(dt.timezone.utc))
    out.write_text(json.dumps(report, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8")
    print("Spot identities:", report["identity_proven_count"], "/", report["candidate_count"],
          "PAPER trades: 0; orders: DISABLED")


if __name__ == "__main__":
    main()
