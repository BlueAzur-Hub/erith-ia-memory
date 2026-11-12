#!/usr/bin/env python3
"""Seven Heaven — BTC/ETH EMA equal-date dual-sleeve research (PAPER only).

From a checkout of https://github.com/BlueAzur-Hub/erith-ia-memory:
    python coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_BTC_ETH_EQUAL_DATE_EMA_DUAL_PORTFOLIO_REPLAY_2026_11_12.py --repo-root . --output /tmp/seven_btc_eth_dual

Does not place orders, access account credentials or modify historical source files.
The initial 2023-04 to 2023-12 data are only used to warm up indicators.
"""
from __future__ import annotations

import argparse
import csv
import gzip
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

SOURCE = Path("public/agent_crypto_erith_ia/data/historical_archive_prototype/calendar_year_hourly_shards")
STEM = "SEVEN_HEAVEN_BTC_ETH_EQUAL_DATE_EMA_DUAL_PORTFOLIO_REPLAY_2026_11_12"
PROTOCOL = "63164145e0fcd8e99c05574af975d3ff972017cc"
HOUR = 3600000
DAY = 86400000
COLUMNS = ["open_time_ms", "open", "high", "low", "close", "base_volume", "quote_volume", "trade_count"]
PERIODS = {
    "2024": ("2024-01-01", "2024-12-31"),
    "2025": ("2025-01-01", "2025-12-31"),
    "2026_JAN_OCT": ("2026-01-01", "2026-10-31"),
    "2024_2026_CONTINUOUS": ("2024-01-01", "2026-10-31"),
}
PREVIOUS_ETH_EMA_PCT = {
    "2024": -9.012245,
    "2025": 93.724644,
    "2026_JAN_OCT": 8.511035,
    "2024_2026_CONTINUOUS": 91.267741,
}


def date(ms):
    return datetime.fromtimestamp(ms / 1000, tz=timezone.utc).date().isoformat()


def r6(x):
    return round(x, 6)


def csv_write(path, fields, records):
    with path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(records)


def read_shards(repo_root):
    folder = repo_root / SOURCE
    index = json.loads((folder / "index.json").read_text(encoding="utf-8"))
    result = {}
    checks = []
    for asset, pair in (("bitcoin", "BTCUSDT"), ("ethereum", "ETHUSDT")):
        entry = next(x for x in index["assets"] if x["id"] == asset)
        selected = sorted((x for x in entry["shards"] if
            (x["year"] == 2023 and x["first_month"] == "2023-04") or 2024 <= x["year"] <= 2026),
            key=lambda x: x["year"])
        assert len(selected) == 4, (asset, len(selected))
        series = []
        for shard in selected:
            blob = (folder / shard["file"]).read_bytes()
            digest = hashlib.sha256(blob).hexdigest()
            assert digest == shard["sha256"], (asset, shard["file"], digest)
            assert len(blob) == shard["bytes"]
            doc = json.loads(gzip.decompress(blob))
            assert doc["asset_id"] == asset and doc["pair"] == pair
            assert doc["interval"] == "1h" and doc["columns"] == COLUMNS
            values = doc["series"]
            assert len(values) == shard["hourly_count"]
            assert values[0][0] == shard["first_open_ms"]
            assert values[-1][0] == shard["last_open_ms"]
            assert all(b[0] - a[0] == HOUR for a, b in zip(values, values[1:])), shard["file"]
            series.extend(values)
            checks.append({
                "asset": asset, "year": shard["year"], "file": shard["file"],
                "sha256_verified": digest, "hours": len(values),
            })
        assert len(series) == 31440
        assert all(b[0] - a[0] == HOUR for a, b in zip(series, series[1:]))
        result[asset] = series
    return result, checks


def to_daily(hourly):
    assert len(hourly) % 24 == 0
    data = []
    for offset in range(0, len(hourly), 24):
        hours = hourly[offset:offset+24]
        first = hours[0][0]
        assert first % DAY == 0
        assert all(row[0] == first + n * HOUR for n, row in enumerate(hours))
        op, close = hours[0][1], hours[-1][4]
        high = max(row[2] for row in hours)
        low = min(row[3] for row in hours)
        assert 0 < low <= min(op, close) <= max(op, close) <= high
        data.append({"date": date(first), "open": op, "close": close,
                     "high": high, "low": low})
    assert len(data) == 1310
    assert data[0]["date"] == "2023-04-01" and data[-1]["date"] == "2026-10-31"
    return data


def add_ema(days):
    ema10 = ema30 = days[0]["close"]
    for i, row in enumerate(days):
        if i:
            ema10 += 2 / 11 * (row["close"] - ema10)
            ema30 += 2 / 31 * (row["close"] - ema30)
        row["ema10"] = ema10
        row["ema30"] = ema30
        row["bull"] = ema10 > ema30 and row["close"] > ema30
    # Recompute selected prefixes to rule out future-price contamination.
    checks = 0
    for last in (k for k in (10, 30, 45, 90, 274, 366, 700, 950, 1300) if k < len(days)):
        x = y = days[0]["close"]
        for i in range(1, last + 1):
            x += 2 / 11 * (days[i]["close"] - x)
            y += 2 / 31 * (days[i]["close"] - y)
        assert abs(x - days[last]["ema10"]) < 1e-8
        assert abs(y - days[last]["ema30"]) < 1e-8
        checks += 1
    return checks


def run_portfolio(days, first, last, method, factor):
    assert first >= 1 and method in ("EMA", "HOLD", "CASH")
    fee = 0.001 * factor
    slippage = 0.0005 * factor
    cash, qty = 1000.0, 0.0
    peak, max_drawdown, exposed = 1000.0, 0.0, 0
    trades, curve = [], []
    for i in range(first, last + 1):
        row = days[i]
        desired = days[i-1]["bull"] if method == "EMA" else method == "HOLD"
        if desired and qty == 0 and cash > 0:
            qty = cash * (1 - fee) / (row["open"] * (1 + slippage))
            cash = 0.0
            trades.append({"date": row["date"], "side": "BUY", "price": row["open"],
                           "qty": qty, "cash_after": cash})
        elif not desired and qty > 0 and method == "EMA":
            cash += qty * row["open"] * (1 - slippage) * (1 - fee)
            qty = 0.0
            trades.append({"date": row["date"], "side": "SELL", "price": row["open"],
                           "qty": qty, "cash_after": cash})
        equity = cash + qty * row["close"] * (1 - slippage) * (1 - fee)
        peak = max(peak, equity)
        max_drawdown = min(max_drawdown, 100 * (equity / peak - 1))
        exposed += int(qty > 0)
        curve.append({"date": row["date"], "equity": equity, "exposed": int(qty > 0)})
    final = curve[-1]["equity"]
    return {"stats": {
        "final_usdt": r6(final), "return_pct": r6(100 * (final / 1000 - 1)),
        "max_drawdown_pct": r6(max_drawdown), "trades": len(trades),
        "exposure_pct": r6(100 * exposed / len(curve))},
        "curve": curve, "trades": trades}


def combine(first, second, kind):
    assert len(first["curve"]) == len(second["curve"])
    peak, drawdown, both_cash, streak, longest = 1000.0, 0.0, 0, 0, 0
    for a, b in zip(first["curve"], second["curve"]):
        assert a["date"] == b["date"]
        value = (a["equity"] + b["equity"]) / 2
        peak = max(peak, value)
        drawdown = min(drawdown, 100 * (value / peak - 1))
        if kind == "EMA":
            if not a["exposed"] and not b["exposed"]:
                both_cash += 1
                streak += 1
                longest = max(longest, streak)
            else:
                streak = 0
    s = first["stats"]
    t = second["stats"]
    out = {"final_usdt": r6((s["final_usdt"] + t["final_usdt"]) / 2),
           "return_pct": r6((s["return_pct"] + t["return_pct"]) / 2),
           "max_drawdown_pct": r6(drawdown), "trades": s["trades"] + t["trades"]}
    if kind == "EMA":
        n = len(first["curve"])
        out.update({"both_cash_days": both_cash, "both_cash_pct": r6(100 * both_cash / n),
                    "longest_both_cash_streak_days": longest})
    return out


def replay(repo_root, output):
    hourly, manifest = read_shards(repo_root)
    btc = to_daily(hourly["bitcoin"])
    eth = to_daily(hourly["ethereum"])
    assert all(x["date"] == y["date"] for x, y in zip(btc, eth))
    causal = add_ema(btc) + add_ema(eth)
    summary, daily, transactions = {}, [], []
    equalities = 0
    for label, (start, end) in PERIODS.items():
        lo = next(i for i, row in enumerate(btc) if row["date"] == start)
        hi = next(i for i, row in enumerate(btc) if row["date"] == end)
        assert lo > 0 and hi >= lo
        entry = {"start": start, "end": end, "days": hi-lo+1}
        for factor in (1, 2):
            B = run_portfolio(btc, lo, hi, "EMA", factor)
            E = run_portfolio(eth, lo, hi, "EMA", factor)
            BH = run_portfolio(btc, lo, hi, "HOLD", factor)
            EH = run_portfolio(eth, lo, hi, "HOLD", factor)
            for i, (b, e, bh, eh) in enumerate(zip(B["curve"], E["curve"], BH["curve"], EH["curve"])):
                assert b["date"] == e["date"] == bh["date"] == eh["date"]
                assert abs((b["equity"] + e["equity"]) / 2 - (e["equity"] + b["equity"]) / 2) < 1e-9
                equalities += 1
                if label == "2024_2026_CONTINUOUS" and factor == 1:
                    daily.append({"date": b["date"], "btc_ema": r6(b["equity"]),
                                  "eth_ema": r6(e["equity"]),
                                  "dual_ema": r6((b["equity"] + e["equity"]) / 2),
                                  "btc_hold": r6(bh["equity"]), "eth_hold": r6(eh["equity"]),
                                  "dual_hold": r6((bh["equity"] + eh["equity"]) / 2),
                                  "btc_exposed": b["exposed"], "eth_exposed": e["exposed"]})
            entry[f"cost{factor}"] = {
                "BTC_EMA": B["stats"], "ETH_EMA": E["stats"],
                "BTC_HOLD100": BH["stats"], "ETH_HOLD100": EH["stats"],
                "DUAL_EMA_50_50": combine(B, E, "EMA"),
                "DUAL_HOLD_50_50": combine(BH, EH, "HOLD"),
                "CASH_100": {"final_usdt": 1000, "return_pct": 0, "max_drawdown_pct": 0, "trades": 0}}
            if label == "2024_2026_CONTINUOUS" and factor == 1:
                for policy, run in (("BTC_EMA", B), ("ETH_EMA", E),
                                    ("BTC_HOLD100", BH), ("ETH_HOLD100", EH)):
                    transactions.extend({"policy": policy, **t} for t in run["trades"])
        assert abs(entry["cost1"]["ETH_EMA"]["return_pct"] - PREVIOUS_ETH_EMA_PCT[label]) < 1e-5
        summary[label] = entry
    evidence = {"schema": "seven-heaven.btc-eth-ema-equal-dates-fixed-sleeves.v1",
                "date_utc": "2026-11-12", "protocol_commit": PROTOCOL,
                "sources": manifest,
                "assumptions": {"instrument": "Binance Spot BTCUSDT and ETHUSDT",
                                "signal": "EMA10>EMA30 and close>EMA30, previous UTC daily close",
                                "fee_per_side": 0.001, "slippage_per_side": 0.0005,
                                "stress": 2,
                                "weights": "two independent 500 USDT sleeves, never rebalanced",
                                "fictitious_daily_open_execution": True},
                "checks": {"source_shards": 8, "source_hours_total": sum(x["hours"] for x in manifest),
                           "days_per_asset": 1310, "warmup_days": 275,
                           "comparable_days": 1035, "ema_prefix_checks": causal,
                           "daily_combined_equity_assertions": equalities,
                           "ethereum_prior_study_reproduced": True},
                "periods": summary,
                "limits": ["exploratory cross-asset check, not independent unused-sample validation",
                           "next UTC open fills assumed; queue and depth not simulated",
                           "USDT counterparty risk not modeled", "no rebalancing or weight optimization"]}
    output.mkdir(parents=True, exist_ok=True)
    (output / f"{STEM}_PROOFS.json").write_text(json.dumps(evidence, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    csv_write(output / f"{STEM}_EQUITY_DAILY.csv", ["date", "btc_ema", "eth_ema", "dual_ema",
                      "btc_hold", "eth_hold", "dual_hold", "btc_exposed", "eth_exposed"], daily)
    csv_write(output / f"{STEM}_TRADES.csv", ["policy", "date", "side", "price", "qty", "cash_after"], transactions)
    print(json.dumps({"checks": evidence["checks"], "periods": {k: {
        "EMA_50_50": v["cost1"]["DUAL_EMA_50_50"]["return_pct"],
        "HOLD_50_50": v["cost1"]["DUAL_HOLD_50_50"]["return_pct"]} for k, v in summary.items()}}, indent=2))
    expected = repo_root / "coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles" / f"{STEM}_PROOFS.json"
    if expected.exists():
        published = json.loads(expected.read_text(encoding="utf-8"))
        for period, value in summary.items():
            for policy, record in value["cost1"].items():
                old = published["periods"][period]["cost1"][policy]
                assert abs(record["final_usdt"] - old["final_usdt"]) < 1e-4, (period, policy, record, old)
                assert abs(record["max_drawdown_pct"] - old["max_drawdown_pct"]) < 1e-4
                assert record["trades"] == old["trades"]
        print("Published JSON results reproduced within tolerance")
    return evidence


def self_test():
    # All trades are at next day's opening; no access to future observations.
    d = []
    for i in range(50):
        close = 100 + i if i < 25 else 150-i
        d.append({"date": date(1672531200000+i*DAY), "open": close+.25,
                  "close": close, "high": close+1, "low": close-1})
    assert add_ema(d) == 3
    results = run_portfolio(d, 31, 49, "EMA", 1)
    hold = run_portfolio(d, 31, 49, "HOLD", 1)
    assert results["stats"]["trades"] >= 0
    dual = combine(results, results, "EMA")
    assert abs(dual["return_pct"] - results["stats"]["return_pct"]) < 1e-7
    assert abs(combine(hold, hold, "HOLD")["max_drawdown_pct"] - hold["stats"]["max_drawdown_pct"]) < 1e-7
    print("Synthetic replay, causal indicators and sleeve arithmetic: PASS")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--repo-root", type=Path, default=Path("."))
    p.add_argument("--output", type=Path, default=Path("/tmp/seven_btc_eth_equal_date"))
    p.add_argument("--self-test", action="store_true")
    args = p.parse_args()
    if args.self_test:
        self_test()
    else:
        replay(args.repo_root, args.output)
