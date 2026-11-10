#!/usr/bin/env python3
"""Seven Heaven: public BTC derivative liquidation event WITNESS (not market totals).

No account/API keys, no trades, no Bridge, no secrets, no browser/Trader modifications.
OBSERVATION ONLY: websocket feeds can be partial or unavailable; preserve coverage.
"""
from __future__ import annotations
import argparse
import asyncio
import hashlib
import json
import os
import sys
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any

SCHEMA = "seven.crypto.public-liquidation-witness.v1"
SOURCES = {
    "bybit": ("wss://stream.bybit.com/v5/public/linear", {"op": "subscribe", "args": ["allLiquidation.BTCUSDT"]}),
    "binance": ("wss://fstream.binance.com/market/ws/btcusdt@forceOrder", None),
    "okx": ("wss://ws.okx.com:8443/ws/v5/public", {"op": "subscribe", "args": [{"channel": "liquidation-orders", "instType": "SWAP"}]}),
}
CAPTURE_LIMIT = 70000


def iso(ms: int) -> str:
    return datetime.fromtimestamp(ms / 1000, tz=timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def safe_decimal(v: Any) -> Decimal:
    if not isinstance(v, (str, int, float)) or isinstance(v, bool):
        raise ValueError("invalid numeric type")
    try: n = Decimal(str(v))
    except (InvalidOperation, ValueError): raise ValueError("invalid decimal")
    if not n.is_finite() or n <= 0: raise ValueError("nonpositive numeric data")
    return n


def safe_timestamp(v: Any, received_ms: int) -> int:
    try: t = int(v)
    except (ValueError, TypeError): raise ValueError("invalid event timestamp")
    # Some OKX market reports arrive late. Retain event-time and receipt-time separately.
    if t < 1_577_836_800_000 or t > received_ms + 90_000 or t < received_ms - 12 * 3600_000:
        raise ValueError("event timestamp out of accepted range")
    return t


def record(provider: str, instrument: str, event_ms: int, received_ms: int,
           liquidated_side: str, source_side: str, size: Decimal,
           price: Decimal, price_kind: str, notional_kind: str) -> dict:
    sym = instrument.upper()
    if liquidated_side not in ("long", "short") or provider not in SOURCES:
        raise ValueError("invalid source/side")
    basis = f"{provider}|{sym}|{event_ms}|{liquidated_side}|{size}|{price}"
    event_key = hashlib.sha256(basis.encode()).hexdigest()[:24]
    # Bybit/ Binance BTCUSDT linear size is BTC and price is USDT per BTC.
    # On OKX, size is contracts; without a verified ctVal we deliberately omit notional.
    if notional_kind == "indicative_usdt":
        notional = str(size * price)
        size_unit = "BTC"
    else:
        notional = None
        size_unit = "CONTRACTS_UNVERIFIED_MULTIPLIER"
    return {
        "event_key": event_key, "provider": provider, "venue_market": "DERIVATIVES",
        "instrument": sym, "event_at_utc": iso(event_ms), "received_at_utc": iso(received_ms),
        "event_ts_ms": event_ms, "received_ts_ms": received_ms,
        "liquidated_position_side": liquidated_side, "source_order_side": source_side,
        "size": str(size), "size_unit": size_unit, "price": str(price),
        "price_unit": "USDT_per_BTC" if notional else "CONTRACT_PRICE_NOT_SPOT",
        "price_kind": price_kind, "indicative_notional_usdt": notional,
        "notional_method": "size_x_reported_price_not_executed_spot_value" if notional else "unavailable_contract_multiplier",
        "coverage": "bybit_claims_all_on_subscribed_instrument" if provider == "bybit" else "exchange_sampled_not_market_total",
        "causal_claim": False, "orders_enabled": False,
    }


def parse(provider: str, payload: dict, received_ms: int) -> list[dict]:
    """Strict allowlist; discard unrelated instruments or subscription acknowledgements."""
    if not isinstance(payload, dict) or provider not in SOURCES: raise ValueError("invalid payload")
    data = payload.get("data", payload)
    out = []
    if provider == "bybit":
        if payload.get("topic") != "allLiquidation.BTCUSDT": return []
        if not isinstance(data, list): raise ValueError("Bybit data not a list")
        for x in data:
            if not isinstance(x, dict) or x.get("s") != "BTCUSDT": continue
            side = x.get("S")
            if side not in ("Buy", "Sell"): continue
            out.append(record(provider, "BTCUSDT", safe_timestamp(x.get("T"), received_ms), received_ms,
                              "long" if side == "Buy" else "short", side.lower(),
                              safe_decimal(x.get("v")), safe_decimal(x.get("p")),
                              "BANKRUPTCY_NOT_EXECUTED_PRICE", "indicative_usdt"))
    elif provider == "binance":
        x = data
        if not isinstance(x, dict) or x.get("e") != "forceOrder" or not isinstance(x.get("o"), dict): return []
        y = x["o"]
        if y.get("s") != "BTCUSDT" or y.get("S") not in ("BUY", "SELL"): return []
        if x.get("st") not in (None, 1): return []  # USD-M linear only
        # Count a fill quantity, not an unexecuted order's original size.
        if y.get("X") != "FILLED": return []
        quantity = safe_decimal(y.get("z"))
        price = safe_decimal(y.get("ap"))
        out.append(record(provider, "BTCUSDT", safe_timestamp(y.get("T"), received_ms), received_ms,
                          "long" if y["S"] == "SELL" else "short", y["S"].lower(),
                          quantity, price, "AVERAGE_FILL_PRICE", "indicative_usdt"))
    else:
        if payload.get("arg", {}).get("channel") != "liquidation-orders": return []
        if not isinstance(data, list): raise ValueError("OKX data not a list")
        for group in data:
            if not isinstance(group, dict): continue
            sym = group.get("instId", "")
            if sym not in ("BTC-USDT-SWAP", "BTC-USDC-SWAP"): continue
            for x in group.get("details", []):
                if not isinstance(x, dict) or x.get("side") not in ("buy", "sell"): continue
                out.append(record(provider, sym, safe_timestamp(x.get("ts"), received_ms), received_ms,
                                  "long" if x["side"] == "sell" else "short", x["side"],
                                  safe_decimal(x.get("sz")), safe_decimal(x.get("bkPx") or x.get("px")),
                                  "LIQUIDATION_PRICE_PROVIDER", "unknown_contracts"))
    return out


async def listen(provider: str, duration: float, max_events: int) -> tuple[list[dict], dict]:
    import websockets
    started_ms = int(datetime.now(timezone.utc).timestamp() * 1000)
    cutoff = asyncio.get_running_loop().time() + duration
    events, seen = [], set()
    connected_ms = 0
    errors = []
    reconnects = 0
    while asyncio.get_running_loop().time() < cutoff and len(events) < max_events:
        socket_started = None
        try:
            url, subscription = SOURCES[provider]
            async with websockets.connect(url, open_timeout=12, close_timeout=4, ping_interval=20, ping_timeout=15, max_size=2_000_000) as ws:
                socket_started = asyncio.get_running_loop().time()
                if subscription:
                    await ws.send(json.dumps(subscription, separators=(",", ":")))
                while asyncio.get_running_loop().time() < cutoff and len(events) < max_events:
                    remaining = cutoff - asyncio.get_running_loop().time()
                    if remaining <= 0: break
                    try: raw = await asyncio.wait_for(ws.recv(), timeout=min(remaining, 10))
                    except asyncio.TimeoutError: continue
                    received_ms = int(datetime.now(timezone.utc).timestamp() * 1000)
                    try:
                        obj = json.loads(raw)
                        for ev in parse(provider, obj, received_ms):
                            if ev["event_key"] not in seen:
                                seen.add(ev["event_key"]);events.append(ev)
                    except (ValueError, TypeError, json.JSONDecodeError) as exc:
                        # A malformed provider record is rejected; this is not a verified numeric observation.
                        errors.append("BAD_RECORD:" + type(exc).__name__)
        except Exception as exc:
            errors.append("CONNECT_OR_STREAM:" + type(exc).__name__)
        finally:
            if socket_started is not None:
                connected_ms += max(0, round((asyncio.get_running_loop().time() - socket_started)*1000))
        if asyncio.get_running_loop().time() < cutoff:
            reconnects += 1
            await asyncio.sleep(min(3, max(0, cutoff - asyncio.get_running_loop().time())))
    end_ms = int(datetime.now(timezone.utc).timestamp() * 1000)
    health = {
        "provider": provider, "started_at_utc": iso(started_ms), "finished_at_utc": iso(end_ms),
        "observed_connection_ms": connected_ms,
        "window_ms": max(1, end_ms - started_ms),
        "coverage_ratio_within_run": round(min(1, connected_ms / max(1, end_ms - started_ms)), 4),
        "recorded_events": len(events), "reconnects": reconnects,
        "errors": sorted(set(errors))[:10],
        "status": "OBSERVED_PARTIAL_EXCHANGE_FEED" if connected_ms > 0 else "NO_VERIFIED_COVERAGE",
        "source_completeness": "bybit_per_instrument_reported_all" if provider == "bybit" else "underreported_by_provider",
    }
    return events, health


def store(directory: Path, observations: list[dict], health: list[dict]) -> dict:
    """Persist sanitized dated events and independent coverage status. No empty=zero inference."""
    directory.mkdir(parents=True, exist_ok=True)
    present = {}
    # Multi-day archive is append-only, each event assigned by its exchange event timestamp.
    for ev in observations:
        day = ev["event_at_utc"][:10]
        present.setdefault(day, []).append(ev)
    for day, events in present.items():
        path = directory / f"{day}.jsonl"
        prior = {}
        if path.is_file():
            for line in path.read_text(encoding="utf-8").splitlines():
                if line.strip():
                    old = json.loads(line)
                    if old.get("event_key"): prior[old["event_key"]] = old
        for ev in events: prior[ev["event_key"]] = ev
        sorted_rows = sorted(prior.values(), key=lambda x:(x["event_ts_ms"], x["event_key"]))
        path.write_text("".join(json.dumps(x, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for x in sorted_rows), encoding="utf-8")
    latest = {"schema": SCHEMA, "updated_at_utc": iso(int(datetime.now(timezone.utc).timestamp()*1000)),
              "observation_only": True, "orders_enabled": False, "real_orders": 0,
              "claim_complete_market_total": False, "historical_backfill": False,
              "coverage": "SAMPLED_RUNS_WITH_GAPS_NOT_24_7",
              "this_run": health, "observed_events_this_run": len(observations),
              "sources": list(SOURCES),
              "notes": ["No live stream history before collection started",
                        "Provider-side sampling and missed periods undercount liquidations",
                        "Zero received events is not proof of zero liquidations",
                        "Never aggregate this feed as all-market total or compare directly with OKX Spot volume"]}
    (directory / "status.json").write_text(json.dumps(latest, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8")
    return latest


async def main_async(duration: float, directory: Path) -> dict:
    results = await asyncio.gather(*(listen(p, duration, CAPTURE_LIMIT) for p in SOURCES))
    events = [e for feed, _ in results for e in feed]
    health = [h for _, h in results]
    return store(directory, events, health)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--duration", type=int, default=120, help="seconds of timed observation")
    p.add_argument("--out", type=Path, default=Path("public/agent_crypto_erith_ia/laboratoire/liquidation-monitor/observations"))
    p.add_argument("--fixture", action="store_true", help="offline demo; no network")
    args = p.parse_args()
    if not 2 <= args.duration <= 700: p.error("duration must be 2-700s")
    if args.fixture:
        now_ms = int(datetime.now(timezone.utc).timestamp()*1000)
        examples = [
            ("bybit", {"topic":"allLiquidation.BTCUSDT", "data":[{"T":now_ms-1000,"s":"BTCUSDT","S":"Buy","v":"0.02","p":"76000"}]}),
            ("binance", {"e":"forceOrder", "o":{"s":"BTCUSDT","S":"SELL","X":"FILLED","z":"0.03","ap":"75900","T":now_ms-1000}}),
            ("okx", {"arg":{"channel":"liquidation-orders"},"data":[{"instId":"BTC-USDT-SWAP","details":[{"side":"sell","sz":"9","bkPx":"76100","ts":str(now_ms-1000)}]}]})]
        obs = [e for provider, msg in examples for e in parse(provider,msg,now_ms)]
        print(json.dumps({"status":"FIXTURE_ONLY_NO_NETWORK", "events":obs},ensure_ascii=False,indent=2))
        return 0
    obj = asyncio.run(main_async(args.duration, args.out))
    print(json.dumps({"status":obj["coverage"],"events":obj["observed_events_this_run"],"sources":obj["this_run"]}, ensure_ascii=False))
    return 0

if __name__ == "__main__":
    sys.exit(main())
