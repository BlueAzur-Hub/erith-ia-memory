#!/usr/bin/env python3
"""Read-only exploratory trade-count/flow sequence diagnostics on verified Binance
Spot USDT HOUR bars. No native 1m/5m history is stored in these derived files.

The 20-asset universe and both quarters are frozen. Do NOT use ex-post results
to issue signals or claim historical execution. No network, accounts or orders.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import math
import statistics
from collections import Counter, defaultdict
from pathlib import Path

from analyze_radar20_regimes import PERIODS, SYMBOLS, canonical, read_data

DATA_ROOT = Path(__file__).resolve().parents[1] / "data/trader_flux"
OUT_FILE = DATA_ROOT / "radar20_regimes/native_activity.json"
SCHEMA = "erith.radar20.native-hourly-trades-activity.v1"
HOUR_MS = 3600000
BASELINE_HOURS = 24
RELATIVE_VOLUME_THRESHOLD = 1.5
RELATIVE_TRADE_THRESHOLD = 1.5
BUY_THRESHOLD = 55.0
SELL_THRESHOLD = 45.0
STREAK = 3
FUTURE_HOURS = (4, 24, 48)
ROUNDTRIP_ASSUMED_PCT = 0.8


def must(test, message):
    if not test:
        raise ValueError(message)


def groups():
    return [dict(start_utc=start, end_utc=start + 4, market_hours=0,
                 high_activity_hours=0, buyer_hours=0, seller_hours=0,
                 buyer_sequences=0, seller_sequences=0, native_trades=0,
                 volume_usdt=0.0)
            for start in range(0, 24, 4)]


def scan_asset(rows, symbol):
    """Returns all hourly observations and first *third* bar of each streak.

    h is a closed signal hour. Future hypothetical long entry uses open[h+1].
    No overlapping event for >3 consecutive hours of same type.
    """
    must(isinstance(rows, list) and len(rows) >= BASELINE_HOURS + STREAK,
         "Native hourly source incomplete")
    prior = None
    run = 0
    observations, events = [], []
    for i, row in enumerate(rows):
        must(len(row) == 10 and isinstance(row[9], int) and row[9] >= 0,
             "Native trade count absent")
        must(all(isinstance(row[k], (float, int)) and math.isfinite(row[k])
                 for k in (1, 4, 5, 6, 7, 8)), "Invalid hourly quote or price")
        must(row[1] > 0 and row[4] > 0 and row[5] >= 0 and 0 <= row[8] <= 100,
             "Invalid hourly market measurement")
        if i:
            must(row[0] == rows[i - 1][0] + HOUR_MS, "Native hourly archive gap")
        if i < BASELINE_HOURS:
            continue
        old = rows[i - BASELINE_HOURS:i]
        volume_base = statistics.median(x[5] for x in old)
        trades_base = statistics.median(x[9] for x in old)
        qualified = volume_base > 0 and trades_base > 0
        volume_ratio = row[5] / volume_base if qualified else None
        trade_ratio = row[9] / trades_base if qualified else None
        burst = (qualified and volume_ratio >= RELATIVE_VOLUME_THRESHOLD
                 and trade_ratio >= RELATIVE_TRADE_THRESHOLD)
        side = ("buyer" if row[8] >= BUY_THRESHOLD
                else "seller" if row[8] <= SELL_THRESHOLD else "balanced") if burst else None
        at = dt.datetime.fromtimestamp(row[0]/1000, tz=dt.timezone.utc)
        o = {"symbol": symbol, "index": i, "hour_utc": at.hour,
             "weekday_utc": at.weekday(), "time_utc": at.isoformat().replace("+00:00", "Z"),
             "trades": row[9], "volume_usdt": row[5], "burst": bool(burst),
             "side": side, "volume_ratio": volume_ratio,
             "trade_ratio": trade_ratio, "taker_buy_pct": row[8],
             "mean_trade_usdt": row[5]/row[9] if row[9] else None}
        observations.append(o)
        if side in ("buyer", "seller") and side == prior:
            run += 1
        else:
            run = 1 if side in ("buyer", "seller") else 0
        prior = side if side in ("buyer", "seller") else None
        if run != STREAK:
            continue
        # The third completed bar first establishes the sequence: no
        # previous bar is allowed to masquerade as an earlier prediction.
        outcomes = {}
        entry_index = i + 1
        for hours in FUTURE_HOURS:
            exit_index = entry_index + hours
            if exit_index >= len(rows):
                outcomes[str(hours)] = None
                continue
            entry = rows[entry_index][1]
            exit_price = rows[exit_index][1]
            must(entry > 0 and exit_price > 0, "Forward open missing")
            # Pure hypothetical price-only long, 0.4% fee each side:
            # not spread, slippage, lot size or a cash portfolio.
            net_pct = ((exit_price / entry) * (1-0.004)**2 - 1) * 100
            outcomes[str(hours)] = net_pct
        events.append({"symbol": symbol, "side": side,
                       "hour_utc": at.hour, "weekday_utc": at.weekday(),
                       "time_utc": o["time_utc"], "outcomes": outcomes,
                       "volume_ratio": volume_ratio, "trade_ratio": trade_ratio})
    return observations, events


def future_summary(events, hours):
    vals = [e["outcomes"][str(hours)] for e in events
            if e["outcomes"][str(hours)] is not None]
    return {"measured": len(vals), "not_measured": len(events)-len(vals),
            "positive_after_assumed_cost": sum(v > 0 for v in vals),
            "positive_rate_pct": round(sum(v > 0 for v in vals)/len(vals)*100, 2)
                                 if vals else None,
            "median_net_pct": round(statistics.median(vals), 4) if vals else None}


def summarise(observations, events):
    grouped = groups()
    for x in observations:
        g = grouped[x["hour_utc"] // 4]
        g["market_hours"] += 1
        g["native_trades"] += x["trades"]
        g["volume_usdt"] += x["volume_usdt"]
        if x["burst"]:
            g["high_activity_hours"] += 1
        if x["side"] == "buyer":
            g["buyer_hours"] += 1
        if x["side"] == "seller":
            g["seller_hours"] += 1
    for e in events:
        g = grouped[e["hour_utc"] // 4]
        g[e["side"] + "_sequences"] += 1
    for g in grouped:
        g["volume_usdt"] = round(g["volume_usdt"], 2)
        g["mean_native_trade_usdt"] = (round(g["volume_usdt"]/g["native_trades"], 2)
                                      if g["native_trades"] else None)
    types = {}
    for typ in ("buyer", "seller"):
        subset = [e for e in events if e["side"] == typ]
        types[typ] = {
            "sequences": len(subset),
            "forward_long_only": {str(h): future_summary(subset, h)
                                  for h in FUTURE_HOURS}}
    return {"native_hourly_trade_count_total": sum(o["trades"] for o in observations),
            "market_hours_evaluated": len(observations),
            "volume_usdt": round(sum(o["volume_usdt"] for o in observations), 2),
            "high_activity_hours": sum(o["burst"] for o in observations),
            "types": types, "time_windows_4h_utc": grouped}


def compute(root=DATA_ROOT):
    partitions = [(PERIODS[0], root/"radar20_retro_stress"/"sources"),
                  (PERIODS[1], root/"radar20")]
    output = []
    combined_counts = Counter()
    for months, path in partitions:
        series, proof = read_data(path, months)
        obs, events = [], []
        for sym in SYMBOLS:
            a, b = scan_asset(series[sym], sym)
            obs.extend(a)
            events.extend(b)
        period = summarise(obs, events)
        period["period"] = months[0] + ".." + months[-1]
        period["provenance"] = proof
        period["assets"] = len(series)
        period["native_resolution"] = "1h"
        # Count sequences per symbol; no post-hoc sorting by "winner".
        per_symbol = {}
        for symbol in SYMBOLS:
            subset = [e for e in events if e["symbol"] == symbol]
            per_symbol[symbol] = {
                "buyer_sequences": sum(e["side"] == "buyer" for e in subset),
                "seller_sequences": sum(e["side"] == "seller" for e in subset)}
        period["by_symbol"] = per_symbol
        combined_counts.update({
            "market_hours": len(obs),
            "buyer_sequences": period["types"]["buyer"]["sequences"],
            "seller_sequences": period["types"]["seller"]["sequences"]})
        output.append(period)
    must(len(output) == 2 and all(x["assets"] == 20 for x in output),
         "Unverified retrospective universe")
    return {
        "schema": SCHEMA, "mode": "EX_POST_HOURLY_OBSERVATION_NOT_SIGNALS",
        "source": "120_SHA256_VERIFIED_BINANCE_SPOT_HOURLY_USDT_FILES",
        "periods": output,
        "market_hours": combined_counts["market_hours"],
        "definition": {
            "hours_baseline_prior": BASELINE_HOURS,
            "native_trade_count": "Binance Spot aggregate number of executed trades in each archived 1h candle; not unique persons or orders",
            "high_activity": "Both completed-hour quote volume and trade count are >=1.5x their median in the PRECEDING 24 completed hours",
            "buyer_hour": "High activity, taker buy share >=55% of quote volume",
            "seller_hour": "High activity, taker buy share <=45% of quote volume",
            "sequence": "First third consecutive completed hour of same buy/sell type; longer streak only counted once",
            "entry_for_forward_long": "OPEN of hour after third bar is complete, 4/24/48h later OPEN of same pair",
            "forward_fee_assumption": "0.4% on entry and 0.4% on exit; 0.8% approx roundtrip, price-only, no liquidity rules",
            "execution_proven": False, "assumptions_predefined_for_descriptive_audit": True
        },
        "granularity_limit": "Hourly bars only. Individual 1m/5m volume, minute trade count and repeated participant identities are NOT available in these derived archives.",
        "no_hindsight_optimisation": True, "no_portfolio": True,
        "not_out_of_sample": True, "prediction": False, "automatic_signals": 0,
        "orders_enabled": False, "real_orders": 0, "paper_fills": 0,
        "disclaimer": "The 20 historical assets were selected retrospectively. Hour/time, forward-return and pressure comparisons are descriptive only, not an executable or profitable strategy."
    }


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--data-root", type=Path, default=DATA_ROOT)
    p.add_argument("--out-file", type=Path, default=OUT_FILE)
    args=p.parse_args()
    report=compute(args.data_root)
    args.out_file.parent.mkdir(parents=True, exist_ok=True)
    body=canonical(report)
    if not args.out_file.exists() or args.out_file.read_bytes() != body:
        args.out_file.write_bytes(body)
    print(json.dumps({
        "status": "PASS", "hours": report["market_hours"],
        "buyer_sequences": sum(x["types"]["buyer"]["sequences"] for x in report["periods"]),
        "seller_sequences": sum(x["types"]["seller"]["sequences"] for x in report["periods"]),
        "path": str(args.out_file), "real_orders": 0
    }))


if __name__ == "__main__":
    main()
