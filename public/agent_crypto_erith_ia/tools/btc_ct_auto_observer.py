#!/usr/bin/env python3
"""ERITH Seven | BTC/CT public-only hourly PAPER observer.

No account authentication, no API keys, no orders, no wallet balances and no
browser runtime. A signal on a CLOSED 1h candle is NEVER called an execution.
A paper entry, if any, uses a LATER closed candle, with assumed costs.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import math
import pathlib
import statistics
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "trader_flux" / "btc_ct_auto_paper"
HOUR = 3600000
UTC = dt.timezone.utc
PAIR = {
    "BTC": {"venue": "Binance Spot", "symbol": "BTCUSDT", "quote": "USDT"},
    "CT": {"venue": "OKX Spot", "symbol": "CT-USDT", "quote": "USDT"},
}
CONFIG = {
    "paper_notional_usdt": 5.0,
    "buy_fee_pct": 0.2,
    "sell_fee_pct": 0.2,
    "spread_total_pct": 0.1,
    "slippage_per_side_pct": 0.1,
    "max_holding_hours": 24,
    "min_volume_multiple": 1.2,
    "min_bounce_below_ma24_pct": 1.5,
    "breakout_above_high_pct": 0.1,
    "max_age_hours": 2.5,
}
VERSION = "erith.btc-ct.hourly-paper.v1"
HEADERS = {"User-Agent": "Erith-Seven-Public-Paper-Observer/1.0", "Accept": "application/json"}


def now_ms():
    return int(dt.datetime.now(UTC).timestamp() * 1000)


def stamp(ms):
    return dt.datetime.fromtimestamp(ms / 1000, UTC).isoformat().replace("+00:00", "Z")


def public_json(url):
    if not (url.startswith("https://data-api.binance.vision/api/v3/klines?") or
            url.startswith("https://www.okx.com/api/v5/market/candles?")):
        raise ValueError("Only two public market endpoints are allowed")
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=14) as resp:
        if resp.status != 200:
            raise ValueError("Public HTTP " + str(resp.status))
        return json.load(resp)


def finite_positive(value):
    try:
        v = float(value)
    except (TypeError, ValueError):
        raise ValueError("Non-numeric candle field") from None
    if not math.isfinite(v) or v <= 0:
        raise ValueError("Invalid non-positive candle price")
    return v


def parse_btc(data, now):
    if not isinstance(data, list):
        raise ValueError("Binance unexpected structure")
    out = []
    for r in data:
        if not isinstance(r, list) or len(r) < 7:
            raise ValueError("Invalid Binance bar")
        t = int(r[0])
        if t % HOUR or int(r[6]) > now:
            continue  # closed candles only
        o, h, l, c = [finite_positive(r[i]) for i in (1, 2, 3, 4)]
        volume = float(r[5])
        if not math.isfinite(volume) or volume < 0 or h < max(o, c, l) or l > min(o, c, h):
            raise ValueError("Binance OHLCV inconsistent")
        out.append({"t": t, "o": o, "h": h, "l": l, "c": c, "v": volume})
    return out


def parse_ct(data, now):
    if not isinstance(data, dict) or str(data.get("code")) != "0" or not isinstance(data.get("data"), list):
        raise ValueError("OKX unexpected structure")
    out = []
    for r in data["data"]:
        if not isinstance(r, list) or len(r) < 9:
            raise ValueError("Invalid OKX bar")
        t = int(r[0])
        if t % HOUR or str(r[8]) != "1" or t + HOUR > now:
            continue  # unclosed OKX candles never qualify
        o, h, l, c = [finite_positive(r[i]) for i in (1, 2, 3, 4)]
        volume = float(r[5])
        if not math.isfinite(volume) or volume < 0 or h < max(o, c, l) or l > min(o, c, h):
            raise ValueError("OKX OHLCV inconsistent")
        out.append({"t": t, "o": o, "h": h, "l": l, "c": c, "v": volume})
    return sorted(out, key=lambda x: x["t"])


def acquire(symbol, now, reader=public_json):
    if symbol == "BTC":
        url = "https://data-api.binance.vision/api/v3/klines?" + urllib.parse.urlencode(
            {"symbol": "BTCUSDT", "interval": "1h", "limit": "100"})
        data = parse_btc(reader(url), now)
    elif symbol == "CT":
        url = "https://www.okx.com/api/v5/market/candles?" + urllib.parse.urlencode(
            {"instId": "CT-USDT", "bar": "1H", "limit": "100"})
        data = parse_ct(reader(url), now)
    else:
        raise ValueError("Unrecognized market")
    if len(data) < 48:
        raise ValueError("Fewer than 48 valid closed bars")
    recent = data[-48:]
    if any(recent[i]["t"] - recent[i - 1]["t"] != HOUR for i in range(1, len(recent))):
        raise ValueError("Missing hourly source bars")
    if now - (data[-1]["t"] + HOUR) < 0 or now - (data[-1]["t"] + HOUR) > CONFIG["max_age_hours"] * HOUR:
        raise ValueError("Stale or future public candle")
    return recent


def choose_signal(rows):
    """Separate, fixed, competing hypotheses. No lookahead and no trade call."""
    last, previous, before = rows[-1], rows[-2], rows[-3]
    closes = [r["c"] for r in rows]
    median_volume = statistics.median(r["v"] for r in rows[-25:-1])
    if median_volume <= 0:
        return {"kind": "WAIT", "why": "missing baseline volume"}
    ratio = last["v"] / median_volume
    ma24 = statistics.mean(closes[-24:])
    ma12 = statistics.mean(closes[-12:])
    ma36 = statistics.mean(closes[-36:])
    if (last["c"] < ma24 * (1 - CONFIG["min_bounce_below_ma24_pct"] / 100)
            and previous["c"] <= before["c"] and last["c"] > previous["c"]
            and ratio >= CONFIG["min_volume_multiple"]):
        return {"kind": "REBOUND", "why": "dip below MA24, first higher close, volume-confirmed", "volume_multiple": round(ratio, 3)}
    former_high = max(r["h"] for r in rows[-25:-1])
    if (ma12 > ma36 and last["c"] > former_high * (1 + CONFIG["breakout_above_high_pct"] / 100)
            and ratio >= CONFIG["min_volume_multiple"] * 1.1):
        return {"kind": "BREAKOUT", "why": "MA12 above MA36, closed breakout, volume-confirmed", "volume_multiple": round(ratio, 3)}
    return {"kind": "WAIT", "why": "No confirmed rebound or trend breakout", "volume_multiple": round(ratio, 3)}


def spread_side():
    return CONFIG["spread_total_pct"] / 200 + CONFIG["slippage_per_side_pct"] / 100


def entry_math(spot):
    """No fill claim. A hypothetical entry at a future closed-bar observation."""
    cost = CONFIG["paper_notional_usdt"]
    buy_price = spot * (1 + spread_side())
    units = (cost * (1 - CONFIG["buy_fee_pct"] / 100)) / buy_price
    return buy_price, units


def exit_math(spot, units):
    return spot * (1 - spread_side()) * units * (1 - CONFIG["sell_fee_pct"] / 100)


def blank():
    return {"schema": VERSION, "orders_enabled": False, "account_access": False,
            "simulation_only": True, "config": CONFIG,
            "markets": {name: {"last_hour": None, "pending": None, "open": None,
                               "decision": "NOT_OBSERVED", "reason": "Waiting for public data",
                               "closed": 0, "wins": 0, "pnl_usdt": 0.0, "last_price_usdt": None,
                               "source_time": None, "error": None}
                        for name in PAIR}, "events": []}


def event_add(state, symbol, candle, kind, **more):
    event = {"at": stamp(candle["t"] + HOUR), "asset": symbol, "type": kind,
             "venue": PAIR[symbol]["venue"], "instrument": PAIR[symbol]["symbol"],
             "quote": "USDT", "paper": True, "executed_order": False, **more}
    state["events"].append(event)
    state["events"] = state["events"][-150:]
    return event


def advance(state, symbol, rows, signal_fn=choose_signal):
    m = state["markets"][symbol]
    last = rows[-1]
    closed_hour = last["t"] + HOUR
    if m["last_hour"] is not None and closed_hour <= m["last_hour"]:
        return None
    if m["last_hour"] is not None and closed_hour - m["last_hour"] > 2 * HOUR:
        m["pending"] = None  # never invent a fill through a data gap
        m["decision"] = "PAUSE"
        m["reason"] = "Data gap: no reconstructed order or entry"
        m["last_hour"], m["source_time"], m["last_price_usdt"] = closed_hour, stamp(closed_hour), last["c"]
        return event_add(state, symbol, last, "GAP_PAUSE", reason=m["reason"])
    m["last_hour"], m["source_time"], m["last_price_usdt"], m["error"] = (
        closed_hour, stamp(closed_hour), last["c"], None)
    opened = m["open"]
    if opened is not None:
        held = (closed_hour - opened["entry_hour"]) / HOUR
        target = 3.0 if opened["model"] == "REBOUND" else 4.0
        move = 100 * (last["c"] / opened["reference_price"] - 1)
        why = ("TAKE_PROFIT" if move >= target else "STOP" if move <= -2.0 else
               "TIMEOUT" if held >= CONFIG["max_holding_hours"] else None)
        if why:
            proceeds = exit_math(last["c"], opened["quantity"])
            pnl = proceeds - CONFIG["paper_notional_usdt"]
            m["open"], m["closed"] = None, m["closed"] + 1
            m["wins"] += int(pnl > 0)
            m["pnl_usdt"] = round(m["pnl_usdt"] + pnl, 8)
            m["decision"], m["reason"] = "EXIT_PAPER", why + " on a closed bar, no executable fill proven"
            return event_add(state, symbol, last, "EXIT_PAPER", strategy=opened["model"],
                             reason=why, observed_exit=last["c"], assumed_proceeds=round(proceeds, 8),
                             net_usdt=round(pnl, 8), holding_hours=held)
        m["decision"], m["reason"] = "HOLD_PAPER", "Paper position open; no exit threshold reached"
        return event_add(state, symbol, last, "HOLD_PAPER", strategy=opened["model"], move_pct=round(move, 4))
    waiting = m["pending"]
    if waiting is not None:
        if closed_hour == waiting["signal_hour"] + HOUR:
            buy, units = entry_math(last["c"])
            m["open"] = {"model": waiting["model"], "entry_hour": closed_hour,
                         "reference_price": last["c"], "assumed_buy_price": buy, "quantity": units}
            m["pending"] = None
            m["decision"], m["reason"] = "PAPER_OPEN", "Later closed-bar reference, not an executable order"
            return event_add(state, symbol, last, "PAPER_OPEN", strategy=m["open"]["model"],
                             price=last["c"], assumed_buy=round(buy, 9),
                             quantity=round(units, 12), notional_usdt=CONFIG["paper_notional_usdt"])
        m["pending"] = None
        m["decision"], m["reason"] = "WAIT", "Missed next bar; no retrospective assumed entry"
        return event_add(state, symbol, last, "SIGNAL_EXPIRED", reason=m["reason"])
    model = signal_fn(rows)
    if model["kind"] != "WAIT":
        m["pending"] = {"model": model["kind"], "signal_hour": closed_hour}
        m["decision"], m["reason"] = "PAPER_SIGNAL", model["why"] + " (await later bar)"
        return event_add(state, symbol, last, "PAPER_SIGNAL", strategy=model["kind"], reason=model["why"])
    m["decision"], m["reason"] = "WAIT", model["why"]
    return event_add(state, symbol, last, "WAIT", reason=model["why"])


def save_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8")


def run(*, now=None, reader=public_json, out=OUT):
    ts = now if now is not None else now_ms()
    path = out / "state.json"
    state = json.loads(path.read_text(encoding="utf-8")) if path.exists() else blank()
    if state.get("schema") != VERSION or state.get("orders_enabled") is not False or state.get("simulation_only") is not True:
        raise ValueError("Unknown or unsafe prior state")
    changed = not path.exists()
    updates = []
    for name in ("BTC", "CT"):
        try:
            rows = acquire(name, ts, reader)
            event = advance(state, name, rows)
            if event is not None:
                changed = True
                updates.append(event)
        except Exception as exc:
            # Never substitute prices or fabricate a trade on connection failure.
            reason = type(exc).__name__ + ": " + str(exc)[:140]
            market = state["markets"][name]
            if market.get("error") != reason:
                market["error"] = reason
                market["decision"] = "SOURCE_UNAVAILABLE"
                market["reason"] = "No new paper decision with invalid source"
                changed = True
            print(name, "SOURCE_UNAVAILABLE", reason)
    if changed:
        save_json(path, state)
        for event in updates:
            day = event["at"][:10]
            file = out / "journal" / (day + ".json")
            rows = json.loads(file.read_text(encoding="utf-8")) if file.exists() else []
            if not any(e["asset"] == event["asset"] and e["at"] == event["at"] for e in rows):
                rows.append(event)
                save_json(file, rows)
    print(json.dumps({"paper_only": True, "new_observations": len(updates),
                      "markets": {k: {"decision": v["decision"], "last": v["source_time"],
                                      "closed": v["closed"], "net_paper_usdt": v["pnl_usdt"],
                                      "error": v["error"]} for k, v in state["markets"].items()}},
                     ensure_ascii=False, sort_keys=True))
    return state


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", type=pathlib.Path, default=OUT)
    ap.add_argument("--check", action="store_true", help="Validate module and schema, no network and no write")
    args = ap.parse_args()
    if args.check:
        print("PASS: public-only PAPER observer module; no network in --check")
    else:
        run(out=args.out)
