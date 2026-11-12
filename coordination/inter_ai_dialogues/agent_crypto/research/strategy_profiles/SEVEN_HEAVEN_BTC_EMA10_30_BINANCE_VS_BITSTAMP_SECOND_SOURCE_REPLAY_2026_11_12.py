#!/usr/bin/env python3
"""Seven Heaven — independent Bitstamp BTC/USD vs archived Binance BTC/USDT EMA replay.

Historical paper simulation only. No API credentials and no trading orders.
Usage:
  python SEVEN_HEAVEN_BTC_EMA10_30_BINANCE_VS_BITSTAMP_SECOND_SOURCE_REPLAY_2026_11_12.py --output results.json
  python ...py --bitstamp-csv bitstamp.csv --binance-csv binance.csv --output results.json
  python ...py --self-test
The automatic download retrieves immutable GitHub *blobs*, never floating main.
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

BITSTAMP_REPO = "daniegitx1/btc-price-history"
BINANCE_REPO = "BlueAzur-Hub/erith-ia-memory"
BITSTAMP_BLOB = "0bd9a80472f46cbf47a678e9f17d6c5a9edab7f5"
BINANCE_BLOB = "c8ed2a206ea616ea87eeb83e31f7138d5b131588"
WARMUP_START, TEST_START, TEST_END = "2023-04-01", "2024-01-01", "2026-10-31"
DAYS_WARMUP, DAYS_TEST = 275, 1035


def git_blob_sha1(data: bytes) -> str:
    header = b"blob " + str(len(data)).encode() + b"\0"
    return hashlib.sha1(header + data).hexdigest()


def load_blob(repo: str, sha: str, local_file: Path | None) -> bytes:
    if local_file:
        raw = local_file.read_bytes()
    else:
        url = f"https://api.github.com/repos/{repo}/git/blobs/{sha}"
        request = Request(url, headers={
            "User-Agent": "Seven-Heaven-Crypto-Historical-Research",
            "Accept": "application/vnd.github+json"})
        with urlopen(request, timeout=40) as response:
            payload = json.load(response)
        if payload.get("encoding") != "base64":
            raise ValueError("Expected base64 Git blob")
        raw = base64.b64decode(payload["content"])
    actual = git_blob_sha1(raw)
    if actual != sha:
        raise ValueError(f"Source changed: expected Git blob {sha}, received {actual}")
    return raw


def parse_csv(raw: bytes) -> list[dict[str, str]]:
    text = raw.decode("utf-8-sig")
    return list(csv.DictReader(io.StringIO(text)))


def read_prices(raw: bytes) -> list[dict]:
    result = []
    for r in parse_csv(raw):
        if WARMUP_START <= r["date_utc"] <= TEST_END:
            result.append({
                "date": r["date_utc"], "open": float(r["open"]),
                "high": float(r["high"]), "low": float(r["low"]),
                "close": float(r["close"]), "volume": float(r["volume"]),
                "source": r["source"]})
    if (len(result), result[0]["date"], result[-1]["date"]) != (1310, WARMUP_START, TEST_END):
        raise ValueError("Incomplete Bitstamp daily coverage")
    for i, r in enumerate(result):
        if r["source"] != "bitstamp":
            raise ValueError("Not a Bitstamp row: " + r["date"])
        if not (0 < r["low"] <= min(r["open"], r["close"]) <=
                max(r["open"], r["close"]) <= r["high"] and r["volume"] >= 0):
            raise ValueError("Invalid Bitstamp OHLCV: " + r["date"])
        if i and (date.fromisoformat(r["date"]) -
                  date.fromisoformat(result[i-1]["date"])) != timedelta(days=1):
            raise ValueError("Missing or duplicated UTC date: " + r["date"])
    ema10 = ema30 = result[0]["close"]
    for i, r in enumerate(result):
        if i:
            ema10 += 2/11 * (r["close"] - ema10)
            ema30 += 2/31 * (r["close"] - ema30)
        r["ema10"], r["ema30"] = ema10, ema30
        r["bull"] = (ema10 > ema30 and r["close"] > ema30)
    return result


def read_binance_reference(raw: bytes) -> list[dict]:
    rows = []
    for r in parse_csv(raw):
        rows.append({"date": r["date"], "hold": float(r["btc_hold"]),
                     "ema": float(r["btc_ema"]),
                     "exposed": int(r["btc_exposed"])})
    if (len(rows), rows[0]["date"], rows[-1]["date"]) != (DAYS_TEST, TEST_START, TEST_END):
        raise ValueError("Wrong Binance benchmark coverage")
    for i, r in enumerate(rows):
        if r["hold"] <= 0 or r["ema"] <= 0 or r["exposed"] not in (0, 1):
            raise ValueError("Invalid Binance benchmark: " + r["date"])
        if i and (date.fromisoformat(r["date"]) -
                  date.fromisoformat(rows[i-1]["date"])) != timedelta(days=1):
            raise ValueError("Noncontinuous Binance benchmark")
    return rows


def simulate(days: list[dict], policy: str, factor: int) -> dict:
    if policy not in ("EMA", "HOLD") or factor not in (1, 2):
        raise ValueError("Invalid fixed strategy")
    fee, slip = .001 * factor, .0005 * factor
    cash, qty, peak, max_dd = 1000.0, 0.0, 1000.0, 0.0
    curve, trades, n_exposed = [], [], 0
    for i in range(DAYS_WARMUP, len(days)):
        r = days[i]
        desired = days[i-1]["bull"] if policy == "EMA" else True
        if desired and qty == 0 and cash > 0:
            qty = cash*(1-fee)/(r["open"]*(1+slip))
            cash = 0.0
            trades.append({"date": r["date"], "side": "BUY"})
        elif not desired and qty > 0 and policy == "EMA":
            cash = qty*r["open"]*(1-slip)*(1-fee)
            qty = 0.0
            trades.append({"date": r["date"], "side": "SELL"})
        equity = cash + qty*r["close"]*(1-slip)*(1-fee)
        peak = max(peak, equity)
        max_dd = min(max_dd, 100*(equity/peak-1))
        exposed = int(qty > 0)
        n_exposed += exposed
        curve.append({"date": r["date"], "equity": equity, "exposed": exposed})
    return {
        "final_usd": round(curve[-1]["equity"], 6),
        "return_pct": round(100*(curve[-1]["equity"]/1000-1), 6),
        "max_drawdown_pct": round(max_dd, 6),
        "trades": len(trades), "exposed_days": n_exposed,
        "curve": curve, "trades_ledger": trades}


def mean(x):
    return sum(x)/len(x)


def stdev(x):
    m = mean(x)
    return (sum((v-m)**2 for v in x)/len(x))**.5


def pearson(x, y):
    mx, my = mean(x), mean(y)
    return mean([(a-mx)*(b-my) for a, b in zip(x, y)])/(stdev(x)*stdev(y))


def replay(bitstamp: bytes, binance: bytes) -> dict:
    days, reference = read_prices(bitstamp), read_binance_reference(binance)
    if [r["date"] for r in days[DAYS_WARMUP:]] != [r["date"] for r in reference]:
        raise ValueError("Different trading dates")
    ema = simulate(days, "EMA", 1)
    hold = simulate(days, "HOLD", 1)
    ema2 = simulate(days, "EMA", 2)
    hold2 = simulate(days, "HOLD", 2)
    differences = [r["date"] for i, r in enumerate(reference)
                   if r["exposed"] != ema["curve"][i]["exposed"]]
    btc_source_returns = [r["close"]/days[i-1]["close"]-1
                          for i, r in enumerate(days) if i >= DAYS_WARMUP+1]
    btc_reference_returns = [r["hold"]/reference[i-1]["hold"]-1
                             for i, r in enumerate(reference) if i >= 1]
    absolute_differences = sorted(abs(a-b) for a, b in
                                  zip(btc_source_returns, btc_reference_returns))
    def summary(r):
        return {k: r[k] for k in ("final_usd", "return_pct", "max_drawdown_pct",
                                  "trades", "exposed_days")}
    return {
        "source_git_blob_sha1": {"bitstamp": BITSTAMP_BLOB, "binance": BINANCE_BLOB},
        "window": {"warmup_start": WARMUP_START, "test_start": TEST_START,
                   "test_end": TEST_END, "warmup_days": DAYS_WARMUP,
                   "test_days": DAYS_TEST, "return_pairs": len(btc_source_returns)},
        "bitstamp": {"ema": summary(ema), "hold": summary(hold),
                     "ema_doubled_cost": summary(ema2),
                     "hold_doubled_cost": summary(hold2)},
        "cross_source": {
            "exposure_agreement_days": DAYS_TEST-len(differences),
            "exposure_disagreement_dates": differences,
            "close_to_close_daily_return_pearson": round(
                pearson(btc_source_returns, btc_reference_returns), 9),
            "median_abs_daily_return_diff_percentage_points": round(
                100*absolute_differences[len(absolute_differences)//2], 6),
            "p95_abs_daily_return_diff_percentage_points": round(
                100*absolute_differences[int(.95*(len(absolute_differences)-1))], 6)},
        "bitstamp_trade_ledger": ema["trades_ledger"],
        "limits": ["USD Bitstamp vs USDT Binance; numeraire differs",
                   "retrospective time span already explored",
                   "hypothetical next-open fills; fees and slippage estimated",
                   "no live orders, no real-world profit guarantees"]}


def self_test():
    assert git_blob_sha1(b"hello") == "b6fc4c620b67d95f953a5c1c1230aaab5db5a1b0"
    assert round(pearson([1,2,3],[3,6,9]), 8) == 1.0
    assert round(stdev([3,3,3]), 8) == 0.0
    print("PASS: Git SHA-1, Pearson correlation, standard deviation")


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--bitstamp-csv", type=Path, help="Local copy of pinned external Bitstamp CSV")
    ap.add_argument("--binance-csv", type=Path, help="Local copy of pinned benchmark CSV")
    ap.add_argument("--output", type=Path, help="Write evidence as JSON; otherwise print")
    ap.add_argument("--self-test", action="store_true")
    a = ap.parse_args()
    if a.self_test:
        self_test()
        return
    bitstamp = load_blob(BITSTAMP_REPO, BITSTAMP_BLOB, a.bitstamp_csv)
    binance = load_blob(BINANCE_REPO, BINANCE_BLOB, a.binance_csv)
    evidence = replay(bitstamp, binance)
    result = json.dumps(evidence, ensure_ascii=False, indent=2)+"\n"
    if a.output:
        a.output.write_text(result, encoding="utf-8")
    else:
        print(result)


if __name__ == "__main__":
    main()
