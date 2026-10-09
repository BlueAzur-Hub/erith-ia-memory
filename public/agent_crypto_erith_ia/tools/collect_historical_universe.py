#!/usr/bin/env python3
"""Seven Heaven · bounded historical universe collector, independent of R2–R11.

No trading, keys, browser storage or schedule. Only --collect uses public Binance
Spot endpoints. No guessed ticker silently becomes a qualified instrument.
"""
from __future__ import annotations

import argparse
import datetime as dt
import gzip
import hashlib
import json
import math
import os
from pathlib import Path
import re
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT = ROOT / "data/crypto/latest.json"
OUTPUT = ROOT / "data/historical_archive_prototype/universe"
INSTRUMENTS = ROOT / "data/historical_archive_prototype/historical-universe-instruments.json"
ENDPOINTS = ("https://data-api.binance.vision", "https://api.binance.com")
SCHEMA = "aerith.public.ohlcv.spot.universe.index.v1"
BLOCK_SCHEMA = "aerith.public.ohlcv.spot.universe.block.v1"
PERIODS = {"24h": ("5m", 300_000, 288), "7d": ("1h", 3_600_000, 168),
           "30d": ("4h", 14_400_000, 180)}
MAX_UNIVERSE = 20
# Identity approvals are data, not hard-coded Market or Graph behaviour.
# mode=legacy means the R10 owner continues to collect; never duplicate that
# series here. mode=pilot enables bounded new collection after exchangeInfo.
ID = re.compile(r"^[a-z0-9-]{2,100}$")
SYMBOL = re.compile(r"^[A-Z0-9]{2,22}$")


def require(ok, reason):
    if not ok:
        raise ValueError(reason)


def encoded(obj):
    return (json.dumps(obj, sort_keys=True, ensure_ascii=False,
                       separators=(",", ":")) + "\n").encode("utf-8")


def digest(data):
    return hashlib.sha256(data).hexdigest()


def instrument_registry(path):
    raw = path.read_bytes()
    doc = json.loads(raw)
    require(doc.get("schema") == "aerith.public.ohlcv.spot.universe.instruments.v1",
            "Invalid instrument registry schema")
    assets = doc.get("assets")
    require(isinstance(assets, dict), "Invalid instrument registry")
    for aid, info in assets.items():
        require(ID.fullmatch(aid) is not None and isinstance(info, dict)
                and SYMBOL.fullmatch(info.get("symbol", "")) is not None
                and info.get("mode") in ("legacy", "pilot"), "Bad registry entry")
    return assets, digest(raw)


def market(path, limit, registry):
    require(1 <= limit <= MAX_UNIVERSE, "Top exceeds bounded pilot")
    raw = path.read_bytes()
    obj = json.loads(raw)
    coins = obj.get("coins")
    require(isinstance(coins, list) and len(coins) >= limit,
            "Market snapshot incomplete")
    rows, ids, symbols = [], set(), {}
    for pos, coin in enumerate(coins[:limit], 1):
        aid = coin.get("id", "")
        symbol = str(coin.get("symbol", "")).upper()
        rank = coin.get("rank")
        require(ID.fullmatch(aid) is not None and aid not in ids,
                "Invalid or duplicate market ID")
        require(rank == pos, "Market rank is not contiguous")
        ids.add(aid)
        symbols.setdefault(symbol, []).append(aid)
        rows.append({"id": aid, "symbol": symbol, "rank": pos,
                     "name": str(coin.get("name", ""))[:100]})
    for row in rows:
        symbol = row["symbol"]
        reg = registry.get(row["id"], {})
        identity_ok = (reg.get("symbol") == symbol and
                       len(symbols[symbol]) == 1 and
                       SYMBOL.fullmatch(symbol) is not None and symbol != "USDT")
        is_pilot = identity_ok and reg.get("mode") == "pilot"
        row["candidate_pair"] = symbol + "USDT" if is_pilot else None
        row["qualification"] = ("candidate" if is_pilot else
                                "legacy_preserved" if identity_ok and reg.get("mode") == "legacy"
                                else "identity_review_required")
    return rows, {"snapshot_id": obj.get("snapshot_id"),
                  "generated_at": obj.get("generated_at"), "sha256": digest(raw)}


def get_json(path, params):
    query = urllib.parse.urlencode(params)
    failures = []
    for origin in ENDPOINTS:
        url = origin + path + ("?" + query if query else "")
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "SevenHeaven-Historical-Pilot/1"})
            with urllib.request.urlopen(req, timeout=18) as response:
                require(response.status == 200, "HTTP status not 200")
                raw = response.read(2_000_001)
                require(len(raw) <= 2_000_000, "Public response too large")
                return json.loads(raw)
        except (OSError, ValueError, urllib.error.URLError) as exc:
            failures.append(type(exc).__name__)
    raise RuntimeError("Public Binance endpoints unavailable: " + ",".join(failures))


def qualify(rows):
    candidates = [r["candidate_pair"] for r in rows if r["candidate_pair"]]
    if not candidates:
        return []
    payload = get_json("/api/v3/exchangeInfo", {"symbols": json.dumps(candidates, separators=(",", ":"))})
    listed = {x.get("symbol"): x for x in payload.get("symbols", [])}
    for row in rows:
        pair = row["candidate_pair"]
        if not pair:
            continue
        entry = listed.get(pair)
        if not entry:
            row["qualification"] = "pair_unavailable"
        elif (entry.get("symbol") == pair and entry.get("baseAsset") == row["symbol"]
              and entry.get("quoteAsset") == "USDT" and entry.get("status") == "TRADING"
              and entry.get("isSpotTradingAllowed", True) is True
              and ("SPOT" in entry.get("permissions", []) or
                   any("SPOT" in group for group in entry.get("permissionSets", [])))):
            row["qualification"] = "qualified_spot"
        else:
            row["qualification"] = "pair_not_spot_trading"
    return [r for r in rows if r["qualification"] == "qualified_spot"]


def validate_rows(rows, interval_ms, expected, end_ms):
    require(isinstance(rows, list) and len(rows) == expected, "Missing candle(s)")
    start = end_ms - interval_ms * expected
    checked = []
    for i, candle in enumerate(rows):
        require(isinstance(candle, list) and len(candle) >= 9, "Malformed OHLCV row")
        opened = candle[0]
        require(isinstance(opened, int) and opened == start + i * interval_ms,
                "Gap, duplicate or unaligned timestamp")
        require(isinstance(candle[6], int) and candle[6] < end_ms and
                candle[6] >= opened + interval_ms - 1,
                "Unclosed or inconsistent candle")
        vals = [float(candle[k]) for k in (1, 2, 3, 4, 5, 7)]
        op, hi, lo, close, volume, qvolume = vals
        require(all(math.isfinite(v) for v in vals) and op > 0 and close > 0
                and lo > 0 and lo <= min(op, close) <= max(op, close) <= hi
                and volume >= 0 and qvolume >= 0, "Invalid price or volume")
        checked.append([opened, *vals, int(candle[8])])
    return checked


def atomic_write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(prefix=".candidate-", dir=path.parent)
    try:
        with os.fdopen(fd, "wb") as handle:
            handle.write(data)
        os.replace(tmp, path)
    finally:
        if os.path.exists(tmp):
            os.unlink(tmp)


def validate_index(path):
    index_path = path / "index.json"
    if not index_path.exists():
        return {"checked": 0, "blocks": 0}
    index = json.loads(index_path.read_text(encoding="utf-8"))
    require(index.get("schema") == SCHEMA and index.get("quote") == "USDT", "Index schema/quote")
    files = set()
    for block in index.get("blocks", []):
        name = block["file"]
        require(re.fullmatch(r"blocks/[a-z0-9-]+_(24h|7d|30d)_[a-f0-9]{16}\.json\.gz", name),
                "Unsafe block path")
        require(name not in files, "Duplicate block reference")
        files.add(name)
        payload = (path / name).read_bytes()
        require(digest(payload) == block["sha256"], "Block digest mismatch")
        decoded = json.loads(gzip.decompress(payload))
        require(decoded["schema"] == BLOCK_SCHEMA and decoded["quote"] == "USDT"
                and decoded["asset_id"] == block["asset_id"]
                and decoded["period"] == block["period"], "Block identity mismatch")
        period = PERIODS[block["period"]]
        require(len(decoded["rows"]) == period[2], "Block row count mismatch")
        for i, row in enumerate(decoded["rows"]):
            require(row[0] == decoded["first_ms"] + i * period[1]
                    and all(math.isfinite(v) for v in row[1:7]), "Invalid archived candle")
        require(decoded["rows"][0][0] == decoded["first_ms"] and
                decoded["rows"][-1][0] == decoded["last_ms"], "Archive bounds mismatch")
    return {"checked": index.get("universe_size"), "blocks": len(files)}


def collect(snapshot, registry_path, output, limit):
    # An index is append-only by identity/period: no silent overwrite of past catalogues.
    require(not (output / "index.json").exists(),
            "Independent pilot archive exists; no replacement or implicit append")
    registry, registry_hash = instrument_registry(registry_path)
    rows, market_meta = market(snapshot, limit, registry)
    accepted = qualify(rows)
    # End each window at the same most recent CLOSED four-hour boundary.
    end_ms = (int((time.time() - 90) * 1000) // 14_400_000) * 14_400_000
    produced = []
    for asset in accepted:
        for name, (interval, spacing, expected) in PERIODS.items():
            try:
                raw = get_json("/api/v3/klines", {
                    "symbol": asset["candidate_pair"], "interval": interval,
                    "startTime": end_ms - expected * spacing,
                    "endTime": end_ms - 1, "limit": expected})
                cleaned = validate_rows(raw, spacing, expected, end_ms)
            except (RuntimeError, OSError, ValueError, KeyError, TypeError) as exc:
                asset.setdefault("period_failures", {})[name] = str(exc)[:130]
                continue
            block = {"schema": BLOCK_SCHEMA, "asset_id": asset["id"],
                     "symbol": asset["symbol"], "pair": asset["candidate_pair"],
                     "source": "Binance Spot", "quote": "USDT", "period": name,
                     "interval": interval, "first_ms": cleaned[0][0],
                     "last_ms": cleaned[-1][0], "rows": cleaned}
            packed = gzip.compress(encoded(block), compresslevel=9, mtime=0)
            checksum = digest(packed)
            filename = f"blocks/{asset['id']}_{name}_{checksum[:16]}.json.gz"
            produced.append((filename, packed, {"file": filename,
                         "sha256": checksum, "asset_id": asset["id"],
                         "pair": asset["candidate_pair"], "period": name,
                         "interval": interval, "candles": len(cleaned),
                         "first_ms": cleaned[0][0], "last_ms": cleaned[-1][0]}))
    require(produced, "No complete verified OHLCV series: refuse publication")
    out_index = {"schema": SCHEMA, "source": "Binance Spot REST /api/v3/klines",
                 "quote": "USDT", "universe_size": limit, "market": market_meta,
                 "registry_sha256": registry_hash,
                 "legacy_owner": "ohlcv_spot_pilot/R10_R11_unchanged",
                 "snapshot_end_ms": end_ms, "assets": rows,
                 "blocks": [x[2] for x in produced],
                 "verified_series": len(produced),
                 "verified_candles": sum(x[2]["candles"] for x in produced),
                 "publication": "MANUAL_BOUNDED_PILOT_NOT_LIVE"}
    # Blocks are content-addressed. Publish the index only after all block writes succeed.
    for name, packed, _ in produced:
        location = output / name
        if location.exists():
            require(location.read_bytes() == packed, "Immutable block collision")
        else:
            atomic_write(location, packed)
    atomic_write(output / "index.json", encoded(out_index))
    validate_index(output)
    return {"qualified": len(accepted), "series": len(produced),
            "candles": out_index["verified_candles"], "assets": limit}


def self_test():
    end = 14_400_000 * 100
    width = 300_000
    def bar(i):
        opened = end - 2 * width + i * width
        return [opened, "10", "12", "9", "11", "3", opened + width - 1,
                "34", 2, "0", "0", "0"]
    ok = [bar(0), bar(1)]
    require(len(validate_rows(ok, width, 2, end)) == 2, "Synthetic positive test")
    for corrupted in ([bar(0), bar(0)], [bar(0)], [bar(0), bar(1)[:6]],
                      [bar(0), [*bar(1)[:2], "8", *bar(1)[3:]]]):
        try:
            validate_rows(corrupted, width, 2, end)
        except (ValueError, IndexError):
            pass
        else:
            raise AssertionError("Negative candle test wrongly accepted")
    with tempfile.TemporaryDirectory() as tmp:
        p = Path(tmp)
        coins = [{"id": "bitcoin", "symbol": "BTC", "rank": 1},
                 {"id": "tether", "symbol": "USDT", "rank": 2},
                 {"id": "dogecoin", "symbol": "DOGE", "rank": 3}]
        (p / "market.json").write_bytes(encoded({"coins": coins}))
        registry = {"bitcoin": {"symbol": "BTC", "mode": "legacy"},
                    "dogecoin": {"symbol": "DOGE", "mode": "pilot"}}
        rows, _ = market(p / "market.json", 3, registry)
        require([r["qualification"] for r in rows] ==
                ["legacy_preserved", "identity_review_required", "candidate"],
                "Candidate qualification test")
        require(validate_index(p / "archive")["blocks"] == 0, "Empty index test")
    return {"status": "SELF_TEST_PASS", "negative_cases": 4,
            "rules": "strict_pair_identity_closed_ohlcv_immutable_blocks"}


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--snapshot", type=Path, default=SNAPSHOT)
    ap.add_argument("--output-dir", type=Path, default=OUTPUT)
    ap.add_argument("--instruments", type=Path, default=INSTRUMENTS)
    ap.add_argument("--limit", type=int, default=20)
    group = ap.add_mutually_exclusive_group(required=True)
    group.add_argument("--self-test", action="store_true")
    group.add_argument("--plan", action="store_true")
    group.add_argument("--collect", action="store_true")
    group.add_argument("--verify", action="store_true")
    ap.add_argument("--enable-network", action="store_true")
    args = ap.parse_args()
    if args.self_test:
        result = self_test()
    elif args.plan:
        registry, registry_hash = instrument_registry(args.instruments)
        rows, meta = market(args.snapshot, args.limit, registry)
        result = {"mode": "READ_ONLY_NO_NETWORK", "market": meta,
                  "registry_sha256": registry_hash,
                  "assets": rows, "candidates": sum(x["qualification"] == "candidate" for x in rows)}
    elif args.verify:
        result = {"mode": "VERIFY", **validate_index(args.output_dir)}
    else:
        require(args.enable_network, "Collect needs explicit --enable-network")
        result = {"mode": "COLLECT", **collect(args.snapshot, args.instruments, args.output_dir, args.limit)}
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))


if __name__ == "__main__":
    main()
