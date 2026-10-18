#!/usr/bin/env python3
"""Compare *observed* public Spot Q/ICNT/FLUID candles and books, never simulate fills.

Strict quote USDT, CoinGecko identity/contract not certified. Report is derived
only from previously collected immutable public Spot observations. Never backfill.
"""
from __future__ import annotations

import datetime as dt
import hashlib
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FOLDER = ROOT / "data/trader_flux"
DEST = FOLDER / "radar_priority_spot/comparison.json"
SCHEMA = "erith.radar.priority-spot-comparison.v1"
MARKETS = (
    ("Q", "quack-ai", "Bitget", "QUSDT", "q_paper/state.json",
     "erith.quack-ai.spot-paper.observations.v1"),
    ("ICNT", "impossible-cloud-network-token", "Bitget", "ICNTUSDT",
     "radar_priority_spot/icnt/state.json",
     "erith.radar.priority-spot-paper.observations.v1"),
    ("FLUID", "instadapp", "OKX", "FLUID-USDT",
     "radar_priority_spot/fluid/state.json",
     "erith.radar.priority-spot-paper.observations.v1"),
)

def require(condition, message):
    if not condition:
        raise ValueError(message)

def instant(value):
    require(isinstance(value, str), "horodatage UTC absent")
    at = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    require(at.tzinfo is not None and at.utcoffset() == dt.timedelta(0),
            "horodatage non UTC")
    return at

def number(value, label, positive=False):
    require(isinstance(value, (int, float)) and not isinstance(value, bool)
            and math.isfinite(value), label + " invalide")
    if positive:
        require(value > 0, label + " non positif")
    return float(value)

def summarize(symbol, coin_id, venue, pair, relpath, schema, source):
    base = {"symbol": symbol, "coin_id": coin_id, "venue": venue,
            "pair": pair, "quote": "USDT",
            "identity_market_pair_certified": False,
            "paper_strategy_validated": False, "orders_enabled": False,
            "source_path": "data/trader_flux/" + relpath}
    if source is None:
        return {**base, "status": "NO_PROSPECTIVE_OBSERVATIONS",
                "observation_count": 0, "market_price_usdt": None,
                "change_between_observed_closes_pct": None,
                "ready_for_window_research": False}
    content, raw = source
    require(content.get("schema") == schema and content.get("coin_id") == coin_id
            and content.get("market") == pair and content.get("quote") == "USDT"
            and content.get("paper_only") is True
            and content.get("orders_enabled") is False
            and content.get("executed_order") is False,
            symbol + " : schéma ou instrument incompatible")
    items = content.get("recent_observations")
    require(isinstance(items, list) and 0 < len(items) <= 168,
            symbol + " : observations absentes ou excessives")
    cleaned = []
    for record in items:
        require(record.get("coin_id") == coin_id and record.get("market") == pair
                and record.get("symbol") == symbol and record.get("quote") == "USDT"
                and record.get("venue") == venue
                and record.get("instrument_type") == "SPOT"
                and record.get("paper_only") is True and
                record.get("executed_order") is False,
                symbol + " : incohérence de provenance Spot")
        at = instant(record["at_utc"])
        candle = record.get("candles") or {}
        book = record.get("book") or {}
        closed = instant(candle["last_closed_hour_utc"])
        require(closed <= at and candle.get("last_21_bars_contiguous") is True,
                symbol + " : bougies non prouvées")
        price = number(candle.get("close_usdt"), "prix", True)
        spread = number(book.get("spread_bps"), "spread")
        bid = number(book.get("bid_top20_notional_usdt"), "profondeur bid")
        ask = number(book.get("ask_top20_notional_usdt"), "profondeur ask")
        require(spread >= 0 and bid >= 0 and ask >= 0,
                symbol + " : profondeur négative")
        cleaned.append((at, closed, price, spread, bid, ask))
    require(all(cleaned[i][0] > cleaned[i-1][0] for i in range(1, len(cleaned))),
            symbol + " : observation dupliquée ou ordre rétrograde")
    require(content.get("last_observed_at") == items[-1]["at_utc"],
            symbol + " : dernier instant d'état incohérent")
    # Different collection timestamps can refer to the *same* closed candle:
    # never count that as a second distinct price move.
    by_hour = {}
    for row in cleaned:
        by_hour[row[1]] = row
    ordered = sorted(by_hour.values(), key=lambda x: x[1])
    require(all(ordered[i][1] > ordered[i-1][1] for i in range(1, len(ordered))),
            "ordre bougies incompatible")
    first, last = ordered[0], ordered[-1]
    span = round((last[1] - first[1]).total_seconds()/3600, 2)
    has_move = len(ordered) >= 2 and span > 0
    change = round((last[2] / first[2] - 1) * 100, 5) if has_move else None
    spreads = [x[3] for x in cleaned]
    research_ready = len(ordered) >= 4 and span >= 24
    return {
        **base,
        "status": "WINDOW_RESEARCH_POSSIBLE" if research_ready else "OBSERVATIONS_INSUFFICIENT",
        "source_sha256": hashlib.sha256(raw).hexdigest(),
        "observation_count": len(cleaned), "distinct_closed_hours": len(ordered),
        "first_observed_at_utc": items[0]["at_utc"],
        "last_observed_at_utc": items[-1]["at_utc"],
        "first_closed_hour_utc": first[1].isoformat().replace("+00:00", "Z"),
        "last_closed_hour_utc": last[1].isoformat().replace("+00:00", "Z"),
        "span_between_closed_hours": span,
        "market_price_usdt": last[2],
        "change_between_observed_closes_pct": change,
        "last_spread_bps": cleaned[-1][3],
        "first_spread_bps": cleaned[0][3],
        "spread_delta_bps": round(cleaned[-1][3] - cleaned[0][3], 5)
                            if len(cleaned) >= 2 else None,
        "smallest_observed_bid_top20_usdt": min(x[4] for x in cleaned),
        "smallest_observed_ask_top20_usdt": min(x[5] for x in cleaned),
        "ready_for_window_research": research_ready,
        "missing_evidence": [
            "contract_identity_not_certified",
            "real_fees_and_slippage_unknown",
        ] + ([] if research_ready else ["at_least_4_distinct_closed_hours_over_24h_required"]),
    }

def build(folder=FOLDER):
    markets = []
    for symbol, coin_id, venue, pair, relpath, schema in MARKETS:
        path = folder / relpath
        source = (json.loads(path.read_text(encoding="utf-8")),path.read_bytes()) if path.exists() else None
        markets.append(summarize(symbol, coin_id, venue, pair, relpath, schema, source))
    observed = [x["last_observed_at_utc"] for x in markets if x.get("last_observed_at_utc")]
    return {
        "schema": SCHEMA, "provenance": "existing_public_spot_paper_state_files",
        "quote": "USDT", "source_as_of_utc": max(observed) if observed else None,
        "orders_enabled": False, "paper_trades_executed": False,
        "identity_market_pair_certified": False, "strategy_validated": False,
        "historical_data_backfilled": False,
        "note": "Observations disparates; les périodes ne sont pas synchronisées entre actifs. "
                "Le comparatif ne prouve ni des prix d'exécution, ni des rendements de stratégie. "
                "USDT coté n'est pas USD converti. Seules les clôtures réellement présentes comptent.",
        "markets": markets,
    }

def publish(report, path=DEST):
    raw = json.dumps(report, ensure_ascii=False, indent=2, allow_nan=False) + "\n"
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and path.read_text(encoding="utf-8") == raw:
        return False
    path.write_text(raw, encoding="utf-8")
    return True

if __name__ == "__main__":
    report = build()
    changed = publish(report)
    print(json.dumps({"file": str(DEST), "changed": changed,
                      "observed": {x["symbol"]: x["observation_count"] for x in report["markets"]}},
                     ensure_ascii=False))
