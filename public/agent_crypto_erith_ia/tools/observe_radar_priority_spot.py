#!/usr/bin/env python3
"""Prospective public Spot measurements for ICNT and FLUID; no orders or private access.

These are exchange-symbol markets: matching a CoinGecko token contract requires separate proof.
Quote currency stays USDT. Historical prices are never backfilled or inferred.
"""
from __future__ import annotations
import datetime as dt
import json
import math
import pathlib
import urllib.parse
import urllib.request

BASE = pathlib.Path(__file__).resolve().parents[1] / "data/trader_flux/radar_priority_spot"
HOUR = 3_600_000
SCHEMA = "erith.radar.priority-spot-paper.observations.v1"
TARGETS = (
    {"id": "impossible-cloud-network-token", "symbol": "ICNT", "venue": "Bitget",
     "pair": "ICNTUSDT", "base": "ICNT"},
    {"id": "instadapp", "symbol": "FLUID", "venue": "OKX",
     "pair": "FLUID-USDT", "base": "FLUID"},
)

def require(ok, description):
    if not ok:
        raise ValueError(description)

def iso(t):
    return t.astimezone(dt.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")

def public_get(venue, endpoint, params):
    host = {"Bitget": "https://api.bitget.com", "OKX": "https://www.okx.com"}[venue]
    url = host + endpoint + "?" + urllib.parse.urlencode(params)
    request = urllib.request.Request(url, headers={
        "User-Agent": "ERITH-Public-Radar-Paper/1.0", "Accept": "application/json"})
    with urllib.request.urlopen(request, timeout=15) as response:
        require(response.status == 200, "réponse HTTP non valide")
        data = response.read(1_000_001)
        require(len(data) <= 1_000_000, "réponse trop volumineuse")
        raw = json.loads(data)
    require(raw.get("code") == ("00000" if venue == "Bitget" else "0"), "API Spot publique refusée")
    return raw.get("data")

def validate_candles(raw, now, venue):
    require(isinstance(raw, list), "bougies absentes")
    n = int(now.timestamp() * 1000)
    rows = []
    for item in raw:
        if not isinstance(item, list) or len(item) < (9 if venue == "OKX" else 7):
            continue
        t = int(item[0])
        if venue == "OKX" and str(item[8]) != "1":
            continue  # explicit closed candle
        if t + HOUR > n:
            continue
        op, high, low, close, vol = [float(v) for v in item[1:6]]
        quote = float(item[7] if venue == "OKX" else item[6])
        require(all(math.isfinite(x) for x in (op, high, low, close, vol, quote))
                and min(op, high, low, close) > 0 and min(vol, quote) >= 0,
                "bougie non numérique ou négative")
        require(low <= min(op, close) <= max(op, close) <= high, "OHLC incohérent")
        rows.append((t, op, high, low, close, vol, quote))
    rows = sorted({r[0]: r for r in rows}.values())
    require(len(rows) >= 21, "moins de 21 bougies closes")
    rows = rows[-21:]
    require(all(rows[i][0] - rows[i-1][0] == HOUR for i in range(1, len(rows))),
            "bougies horaires discontinues")
    delay = n - (rows[-1][0] + HOUR)
    require(0 <= delay <= 2 * HOUR, "bougie récente absente ou future")
    last, first = rows[-1], rows[0]
    return {
        "last_closed_hour_utc": iso(dt.datetime.fromtimestamp(last[0] / 1000, dt.timezone.utc)),
        "close_usdt": last[4],
        "change_close_20h_pct": round(100 * (last[4] / first[4] - 1), 5),
        "last_hour_volume_base": last[5],
        "last_hour_quote_volume_usdt": last[6],
        "median_prior_20h_volume_base": round(sum(sorted(r[5] for r in rows[:-1])[9:11]) / 2, 5),
        "last_21_bars_contiguous": True,
    }

def validate_book(raw, now, venue):
    if venue == "OKX":
        require(isinstance(raw, list) and raw and isinstance(raw[0], dict),
                "carnet OKX absent")
        raw = raw[0]
        bids, asks = raw.get("bids"), raw.get("asks")
    else:
        require(isinstance(raw, dict), "carnet Bitget absent")
        bids, asks = raw.get("b"), raw.get("a")
    now_ms = int(now.timestamp() * 1000)
    stamp = int(raw["ts"])
    age = (now_ms - stamp) / 1000
    require(-3 <= age <= 120, "carnet futur ou périmé")
    def side(items):
        require(isinstance(items, list) and items, "niveaux absents")
        rows = []
        for item in items[:20]:
            require(isinstance(item, list) and len(item) >= 2, "niveau mal formé")
            price, size = float(item[0]), float(item[1])
            require(math.isfinite(price) and math.isfinite(size)
                    and price > 0 and size > 0, "niveau invalide")
            rows.append((price, size))
        return rows
    b, a = side(bids), side(asks)
    bid = max(x[0] for x in b)
    ask = min(x[0] for x in a)
    require(bid < ask, "carnet croisé")
    return {
        "best_bid_usdt": bid, "best_ask_usdt": ask,
        "spread_bps": round((ask - bid) * 20000 / (ask + bid), 5),
        "book_timestamp_utc": iso(dt.datetime.fromtimestamp(stamp / 1000, dt.timezone.utc)),
        "book_age_seconds": round(max(0, age), 3),
        "bid_top20_notional_usdt": round(sum(p * q for p, q in b), 4),
        "ask_top20_notional_usdt": round(sum(p * q for p, q in a), 4),
    }

def observe(target, fetch=public_get, now=None):
    now = now or dt.datetime.now(dt.timezone.utc)
    require(now.tzinfo is not None, "horloge UTC obligatoire")
    market, venue, base = target["pair"], target["venue"], target["base"]
    if venue == "Bitget":
        instruments = fetch(venue, "/api/v3/market/instruments",
                            {"category": "SPOT", "symbol": market})
        require(isinstance(instruments, list) and any(
            x.get("category") == "SPOT" and x.get("symbol") == market
            and x.get("baseCoin") == base and x.get("quoteCoin") == "USDT"
            and x.get("status") == "online" for x in instruments),
            "instrument Bitget Spot non certifié")
        candles = fetch(venue, "/api/v3/market/candles",
                        {"category": "SPOT", "symbol": market, "interval": "1H", "limit": 26})
        book = fetch(venue, "/api/v3/market/orderbook",
                     {"category": "SPOT", "symbol": market, "limit": 20})
    else:
        instruments = fetch(venue, "/api/v5/public/instruments",
                            {"instType": "SPOT", "instId": market})
        require(isinstance(instruments, list) and any(
            x.get("instType") == "SPOT" and x.get("instId") == market
            and x.get("baseCcy") == base and x.get("quoteCcy") == "USDT"
            and x.get("state") == "live" for x in instruments),
            "instrument OKX Spot non certifié")
        candles = fetch(venue, "/api/v5/market/candles",
                        {"instId": market, "bar": "1H", "limit": 30})
        book = fetch(venue, "/api/v5/market/books",
                     {"instId": market, "sz": 20})
    c = validate_candles(candles, now, venue)
    b = validate_book(book, now, venue)
    mid = (b["best_bid_usdt"] + b["best_ask_usdt"]) / 2
    require(abs(mid / c["close_usdt"] - 1) <= .20,
            "écart carnet / dernière bougie supérieur à 20 %")
    return {
        "at_utc": iso(now), "coin_id": target["id"], "symbol": target["symbol"],
        "venue": venue, "market": market, "instrument_type": "SPOT",
        "quote": "USDT", "identity_status": "EXCHANGE_SPOT_SYMBOL_ONLY_CONTRACT_NOT_VERIFIED",
        "candles": c, "book": b, "source": venue + " public Spot",
        "paper_only": True, "orders_enabled": False, "executed_order": False,
    }

def save(entry, base=BASE):
    allowed = {x["id"]: x for x in TARGETS}
    target = allowed.get(entry.get("coin_id"))
    require(target is not None and entry.get("market") == target["pair"]
            and entry.get("venue") == target["venue"] and entry.get("quote") == "USDT"
            and entry.get("paper_only") is True and entry.get("orders_enabled") is False
            and entry.get("executed_order") is False
            and entry.get("identity_status") == "EXCHANGE_SPOT_SYMBOL_ONLY_CONTRACT_NOT_VERIFIED",
            "enregistrement PAPER ou identité incompatible")
    at = dt.datetime.fromisoformat(entry["at_utc"].replace("Z", "+00:00"))
    day = at.date().isoformat()
    root = base / target["symbol"].lower()
    daily = root / "observations" / (day + ".json")
    state = root / "state.json"
    previous = json.loads(state.read_text(encoding="utf-8")) if state.exists() else {}
    require(not previous or previous.get("schema") == SCHEMA and
            previous.get("coin_id") == target["id"] and
            previous.get("market") == target["pair"], "état précédent incompatible")
    if previous.get("last_observed_at") and previous["last_observed_at"] >= entry["at_utc"]:
        return False
    old = json.loads(daily.read_text(encoding="utf-8")) if daily.exists() else {}
    require(not old or old.get("schema") == SCHEMA and
            old.get("date_utc") == day and old.get("coin_id") == target["id"],
            "archive quotidienne incompatible")
    rows = old.get("observations", [])
    require(isinstance(rows, list) and all(
        v.get("paper_only") is True and v.get("market") == target["pair"] for v in rows),
        "archive corrompue")
    require(not rows or rows[-1]["at_utc"] < entry["at_utc"], "doublon quotidien")
    rows.append(entry)
    recent = (previous.get("recent_observations", []) + [entry])[-168:]
    record = {
        "schema": SCHEMA, "coin_id": target["id"],
        "market": target["pair"], "venue": target["venue"] + " Spot",
        "quote": "USDT", "identity_market_pair_certified": False,
        "paper_only": True, "orders_enabled": False, "executed_order": False,
        "first_observed_at": previous.get("first_observed_at") or entry["at_utc"],
        "last_observed_at": entry["at_utc"], "last": entry,
        "recent_observations": recent,
        "limitations": ["Premier relevé prospectif uniquement, aucune rétro-datation.",
                        "Identité de contrat non démontrée par le symbole de la paire.",
                        "USDT coté, aucune conversion artificielle en USD.",
                        "Pas de simulation d'exécution réelle ni de frais de compte vérifiés."],
    }
    daily.parent.mkdir(parents=True, exist_ok=True)
    daily.write_text(json.dumps({
        "schema": SCHEMA, "date_utc": day, "coin_id": target["id"],
        "observations": rows}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    state.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return True

def main():
    done, failures = [], []
    for target in TARGETS:
        try:
            item = observe(target)
            if save(item):
                done.append(target["symbol"])
            else:
                print("Observation déjà publiée :", target["symbol"])
        except Exception as e:
            failures.append({"symbol": target["symbol"], "reason": str(e)})
            print("Non archivé :", target["symbol"], str(e))
    print(json.dumps({"new_verified_observations": done, "refused": failures},
                     ensure_ascii=False))
    if not done:
        raise SystemExit("Aucune nouvelle observation certifiée ; aucun chiffre suppléé.")

if __name__ == "__main__":
    main()
