#!/usr/bin/env python3
"""Seven Heaven -- ETH/USD second-provider EMA10/30 restricted clean-window replay.

No orders or private API credentials. Fetches two immutable GitHub blobs,
checks their SHA-1 Git object identifiers, then calculates PAPER results.
Python 3.10+; standard library only.

python SEVEN_HEAVEN_ETH_USD_SECOND_PROVIDER_EMA_CONTIGUOUS_REPLAY_2026_11_12.py --output-prefix ./eth_second_provider
python ...py --source-csv ./ETH-USD.csv --benchmark-csv ./SEVEN_...EQUITY_DAILY.csv --output-prefix ./eth_second_provider
python ...py --self-test
"""
from __future__ import annotations

import argparse
import base64
import csv
from datetime import date, timedelta
import hashlib
import io
import json
from pathlib import Path
from urllib.request import Request, urlopen

SOURCE_REPO = "SeedFlora/idx-daily-data"
SOURCE_BLOB = "f92d8c4fce1ea30f16b0195d0ea5f05b9e4fe185"
BENCHMARK_REPO = "BlueAzur-Hub/erith-ia-memory"
BENCHMARK_BLOB = "c8ed2a206ea616ea87eeb83e31f7138d5b131588"
PROTOCOL_COMMIT = "f8b1bfbc5564a73cf8a8c2b947ec55096896c5dc"

WARMUP_FIRST = "2025-06-28"
TEST_FIRST = "2025-09-26"
TEST_LAST = "2026-07-31"
WARMUP_DAYS = 90
TEST_DAYS = 309
SOURCE_EXPECTED_DAYS = 399
FEES = 0.001
SLIPPAGE = 0.0005


def blob_sha(data: bytes) -> str:
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\x00" + data).hexdigest()


def get_source(repo: str, sha: str, local: Path | None) -> bytes:
    if local:
        data = local.read_bytes()
    else:
        request = Request(
            f"https://api.github.com/repos/{repo}/git/blobs/{sha}",
            headers={"Accept": "application/vnd.github+json",
                     "User-Agent": "Seven-Heaven-Research-ReadOnly"})
        with urlopen(request, timeout=40) as resp:
            obj = json.load(resp)
        if obj.get("encoding") != "base64":
            raise ValueError("GitHub blob does not have base64 encoding")
        data = base64.b64decode(obj["content"])
    if blob_sha(data) != sha:
        raise ValueError("Pinned GitHub blob SHA-1 does not match source bytes")
    return data


def read_csv(data: bytes) -> list[dict[str, str]]:
    return list(csv.DictReader(io.StringIO(data.decode("utf-8-sig"))))


def parse_ohlc(data: bytes) -> tuple[list[dict], list[dict]]:
    raw = read_csv(data)
    gaps = []
    for left, right in zip(raw, raw[1:]):
        diff = (date.fromisoformat(right["Date"]) -
                date.fromisoformat(left["Date"])).days
        if diff <= 0:
            raise ValueError("Unordered/duplicate source dates")
        if diff > 1:
            gaps.append({"after": left["Date"], "before": right["Date"],
                         "missing_days": diff - 1})
    expected_gaps = [
        ("2026-07-31", "2026-08-14", 13),
        ("2026-09-14", "2026-09-18", 3),
        ("2026-10-05", "2026-10-30", 24)]
    if [(g["after"], g["before"], g["missing_days"]) for g in gaps] != expected_gaps:
        raise ValueError("Source gap ledger differs from protocol; stop")
    days = []
    for row in raw:
        if not (WARMUP_FIRST <= row["Date"] <= TEST_LAST):
            continue
        day = {
            "date": row["Date"], "open": float(row["Open"]),
            "high": float(row["High"]), "low": float(row["Low"]),
            "close": float(row["Close"]), "volume": float(row["Volume"])}
        if not (0 < day["low"] <= min(day["open"], day["close"]) <=
                max(day["open"], day["close"]) <= day["high"]
                and day["volume"] >= 0):
            raise ValueError("Bad OHLCV on " + day["date"])
        days.append(day)
    if (len(days), days[0]["date"], days[-1]["date"]) != (
            SOURCE_EXPECTED_DAYS, WARMUP_FIRST, TEST_LAST):
        raise ValueError("Unexpected contiguous source window")
    for a, b in zip(days, days[1:]):
        if date.fromisoformat(b["date"]) - date.fromisoformat(a["date"]) != timedelta(days=1):
            raise ValueError("Gap in designated test interval")
    e10 = e30 = days[0]["close"]
    for i, day in enumerate(days):
        if i:
            e10 += 2 / 11 * (day["close"] - e10)
            e30 += 2 / 31 * (day["close"] - e30)
        day["ema10"], day["ema30"] = e10, e30
        day["bull"] = e10 > e30 and day["close"] > e30
    return days, gaps


def parse_benchmark(data: bytes) -> list[dict]:
    benchmark = []
    for row in read_csv(data):
        if TEST_FIRST <= row["date"] <= TEST_LAST:
            benchmark.append({
                "date": row["date"], "exposed": int(row["eth_exposed"]),
                "eth_hold": float(row["eth_hold"])})
    if len(benchmark) != TEST_DAYS or benchmark[0]["date"] != TEST_FIRST or benchmark[-1]["date"] != TEST_LAST:
        raise ValueError("Binance comparator does not cover matching dates")
    return benchmark


def simulate(days: list[dict], policy: str, factor: int) -> dict:
    assert policy in ("EMA", "HOLD") and factor in (1, 2)
    fee, slip = FEES * factor, SLIPPAGE * factor
    cash, qty, high, drawdown = 1000.0, 0.0, 1000.0, 0.0
    curve, trades = [], []
    for i in range(WARMUP_DAYS, len(days)):
        row = days[i]
        target = days[i-1]["bull"] if policy == "EMA" else True
        if target and not qty and cash:
            qty = cash * (1 - fee) / (row["open"] * (1 + slip))
            cash = 0.0
            trades.append({"date": row["date"], "side": "BUY"})
        elif not target and qty and policy == "EMA":
            cash = qty * row["open"] * (1 - fee) * (1 - slip)
            qty = 0.0
            trades.append({"date": row["date"], "side": "SELL"})
        liquidatable = cash + qty * row["close"] * (1 - fee) * (1 - slip)
        high = max(high, liquidatable)
        drawdown = min(drawdown, 100 * (liquidatable / high - 1))
        curve.append({"date": row["date"], "equity": liquidatable,
                      "exposed": int(qty > 0)})
    return {
        "final_usd": round(curve[-1]["equity"], 6),
        "return_pct": round(100 * (curve[-1]["equity"] / 1000 - 1), 6),
        "max_drawdown_pct": round(drawdown, 6),
        "trades": len(trades),
        "exposure_days": sum(r["exposed"] for r in curve),
        "trade_ledger": trades,
        "curve": curve}


def statistics(eth_data: bytes, bin_data: bytes) -> tuple[dict, list[dict]]:
    days, gaps = parse_ohlc(eth_data)
    comparator = parse_benchmark(bin_data)
    results = {
        "ema": simulate(days, "EMA", 1),
        "ema_double_cost": simulate(days, "EMA", 2),
        "hold": simulate(days, "HOLD", 1),
        "hold_double_cost": simulate(days, "HOLD", 2)}
    curve = results["ema"]["curve"]
    if len(curve) != TEST_DAYS:
        raise ValueError("Unexpected test period length")
    mismatches = []
    for row, ref in zip(curve, comparator):
        if row["date"] != ref["date"]:
            raise ValueError("Nonaligned dates")
        if row["exposed"] != ref["exposed"]:
            mismatches.append({
                "date": row["date"], "second_provider_exposed": row["exposed"],
                "binance_exposed": ref["exposed"]})
    def avg(v):
        return sum(v) / len(v)
    def sd(v):
        return (avg([(x - avg(v)) ** 2 for x in v])) ** .5
    a = [days[i]["close"] / days[i-1]["close"] - 1
         for i in range(WARMUP_DAYS + 1, len(days))]
    b = [comparator[i]["eth_hold"] / comparator[i-1]["eth_hold"] - 1
         for i in range(1, len(comparator))]
    if len(a) != 308 or len(b) != 308:
        raise ValueError("Daily return pairs not 308")
    correlation = avg([(x-avg(a))*(y-avg(b)) for x,y in zip(a,b)])/(sd(a)*sd(b))
    stats = {
        "schema": "seven-heaven.eth-usd-second-provider-ema-contiguous.v1",
        "date": "2026-11-12",
        "protocol_commit": PROTOCOL_COMMIT,
        "source": {"repo": SOURCE_REPO, "git_blob_sha1": SOURCE_BLOB,
                   "provenance": "Third-party Yahoo-style aggregated ETH-USD OHLCV; exchange not authenticated",
                   "gaps_in_full_dataset": gaps},
        "benchmark": {"repo": BENCHMARK_REPO, "git_blob_sha1": BENCHMARK_BLOB,
                      "provenance": "Original Binance Spot ETH/USDT EMA/HOLD daily portfolio ledger"},
        "window": {"warmup_first": WARMUP_FIRST, "warmup_days": WARMUP_DAYS,
                   "test_first": TEST_FIRST, "test_last": TEST_LAST,
                   "test_days": TEST_DAYS},
        "results": {k: {kk: v[kk] for kk in
                     ("final_usd", "return_pct", "max_drawdown_pct", "trades", "exposure_days")}
                    for k, v in results.items()},
        "cross_source": {"tested_days": TEST_DAYS, "agree_days": TEST_DAYS-len(mismatches),
                         "mismatched_days": len(mismatches),
                         "exposure_disagreement_dates": [r["date"] for r in mismatches],
                         "daily_return_correlation": round(correlation, 9)},
        "no_orders": True,
        "limitations": [
            "Only 309 days after 90-day warmup, not 2024-2026 full",
            "Source has three separate 2026 gaps; never interpolate",
            "Different source and USD/USDT numeraire; not a third exchange-certified ETH feed",
            "Binance benchmark initialized April 2023, alternate source June 2025",
            "Fictitious daily next-open fills, fixed fees/slippage, no real orders",
            "No prospective validation or trading recommendation"]}
    return stats, mismatches


def self_test() -> None:
    assert blob_sha(b"hello") == "b6fc4c620b67d95f953a5c1c1230aaab5db5a1b0"
    days = []
    for i in range(400):
        day = date(2025, 6, 28) + timedelta(days=i)
        price = 100 + 0.2*i
        days.append({"date": day.isoformat(), "open": price, "close": price,
                     "bull": i>5})
    result = simulate(days, "EMA", 1)
    assert len(result["curve"]) == 310
    assert result["trades"] == 1
    print("PASS: hash and next-open simulation on synthetic data")


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--source-csv", type=Path, help="Pinned ETH-USD source CSV local file")
    p.add_argument("--benchmark-csv", type=Path, help="Pinned Binance benchmark CSV local file")
    p.add_argument("--output-prefix", type=Path, help="Optional local output prefix")
    p.add_argument("--self-test", action="store_true")
    a = p.parse_args()
    if a.self_test:
        self_test()
        return
    primary = get_source(SOURCE_REPO, SOURCE_BLOB, a.source_csv)
    baseline = get_source(BENCHMARK_REPO, BENCHMARK_BLOB, a.benchmark_csv)
    stats, mismatches = statistics(primary, baseline)
    output = json.dumps(stats, ensure_ascii=False, indent=2) + "\n"
    if a.output_prefix:
        out = a.output_prefix
        out.with_suffix(".json").write_text(output, encoding="utf-8")
        with out.with_suffix(".csv").open("w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=[
                "date", "second_provider_exposed", "binance_exposed"])
            w.writeheader()
            w.writerows(mismatches)
    else:
        print(output)


if __name__ == "__main__":
    main()
