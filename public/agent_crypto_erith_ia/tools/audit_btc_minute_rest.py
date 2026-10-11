#!/usr/bin/env python3
"""Investigate 5,881 missing BTCUSDT Binance Spot minutes via the public REST API.

Strictly independent read-only audit: never touch the frozen 1d reference, source
ZIPs, official 1m monthly originals, or Trader. Accepted rows MUST come directly
from Binance Spot /api/v3/klines at the exact missing minute timestamp and must
agree with a 1m original-source witness on the queried interval. HTTP denial,
empty API output, conflicts, and absent trade ZIPs are different outcomes.

Also inventories (HEAD only) original same-venue daily trades/aggTrades ZIPs as
possible future witnesses. A HEAD response is NOT a verified transaction file,
and trade data is NOT used to synthesize any missing 1m candle.
"""
from __future__ import annotations
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
import gzip
import hashlib
import json
from pathlib import Path
import re
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

import audit_btc_minute_gaps as previous
import freeze_btc_daily_reference as freeze

ROOT = freeze.ROOT
OUT = ROOT / "btc_minute_api_research"
BASE = "https://data-api.binance.vision/api/v3/klines"
TRADE_BASE = "https://data.binance.vision/data/spot/daily"
SCHEMA = "seven.crypto.btc.native-minute-rest-research.v1"
POLICY = "official_spot_btcusdt_1m_rest_utc_exact_with_native_witness.v1"
M = 60_000
LIMIT = 1000
SHA = re.compile(r"^[0-9a-f]{64}$")


def need(ok, reason):
    if not ok:
        raise ValueError(reason)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def iso(t):
    return datetime.fromtimestamp(t / 1000, timezone.utc).strftime("%Y-%m-%d")


def segments(timestamps):
    """Bound inclusive 1m windows; one extra original minute on each side."""
    seq = sorted(timestamps)
    need(len(seq) == len(set(seq)) and all(t % M == 0 for t in seq),
         "Duplicate or misaligned gap minute")
    pieces = []
    for t in seq:
        if not pieces or t != pieces[-1][-1] + M or len(pieces[-1]) >= LIMIT-4:
            pieces.append([t])
        else:
            pieces[-1].append(t)
    return [(p[0], p[-1] + M, len(p)) for p in pieces]


def api_url(start, end):
    need(isinstance(start, int) and isinstance(end, int)
         and start > 0 and end > start and start % M == 0 and end % M == 0
         and (end - start) // M <= LIMIT-4,
         "Unbounded Binance historical-minute request")
    qs = urlencode({"symbol": "BTCUSDT", "interval": "1m",
                    "startTime": start - M, "endTime": end,
                    "limit": LIMIT})
    return BASE + "?" + qs


def read_api(url):
    need(url.startswith(BASE + "?symbol=BTCUSDT&interval=1m&")
         and "limit=1000" in url and ".." not in url,
         "REST source is not official public BTC Spot klines")
    for attempt in range(3):
        try:
            with urlopen(Request(url, headers={
                    "Accept": "application/json",
                    "User-Agent": "Seven-Heaven-BTC-historical-evidence"}),
                    timeout=22) as rsp:
                need(rsp.status == 200, "Non-200 Binance REST response")
                raw = rsp.read(1_000_001)
            need(len(raw) <= 1_000_000, "Oversized Binance response")
            parsed = json.loads(raw)
            need(isinstance(parsed, list) and len(parsed) <= LIMIT
                 and all(isinstance(row, list) and len(row) == 12
                         for row in parsed),
                 "Unexpected Binance Kline response shape")
            return {"status": "api_200", "rows": parsed,
                    "response_sha256": sha(raw), "bytes": len(raw)}
        except HTTPError as exc:
            if exc.code in (400, 401, 403, 404, 418, 451):
                return {"status": "http_unavailable", "http_status": exc.code, "rows": []}
            if exc.code == 429:
                return {"status": "rate_limited", "http_status": 429, "rows": []}
            if attempt == 2:
                return {"status": "http_unavailable", "http_status": exc.code, "rows": []}
        except (TimeoutError, URLError, OSError) as exc:
            if attempt == 2:
                return {"status": "transport_error", "reason": type(exc).__name__, "rows": []}
        time.sleep(attempt + 1)
    raise RuntimeError("Could not classify Binance REST response")


def verify_api_rows(raw, start, end):
    """Parse native Binance kline JSON into the exact 11 fields of 1m sources."""
    need(isinstance(raw, list) and len(raw) <= LIMIT, "Bad native API row array")
    series = {}
    for row in raw:
        # Use original Binance native layout, including quote and taker volumes.
        item = previous.valid_row(row, start-M, end+M)
        t = item[0]
        need(start-M <= t <= end and t not in series,
             "API returned unrelated/duplicate minute")
        series[t] = item
    return series


def trade_probe(date, kind):
    need(kind in ("trades", "aggTrades")
         and re.fullmatch(r"\d{4}-\d{2}-\d{2}", date)
         and datetime.strptime(date, "%Y-%m-%d").strftime("%Y-%m-%d") == date,
         "Unapproved trade archive")
    fname = f"BTCUSDT-{kind}-{date}.zip"
    url = f"{TRADE_BASE}/{kind}/BTCUSDT/{fname}"
    try:
        with urlopen(Request(url, method="HEAD", headers={
                "User-Agent": "Seven-Heaven-source-inventory"}), timeout=12) as r:
            status = r.status
            size_raw = r.headers.get("Content-Length")
            size = int(size_raw) if size_raw and size_raw.isdigit() else None
            return {"date": date, "kind": kind, "url": url,
                    "status": "head_present" if status == 200 else "head_unexpected",
                    "http_status": status, "reported_bytes": size,
                    "downloaded_or_verified_trades": False}
    except HTTPError as exc:
        return {"date": date, "kind": kind, "url": url,
                "status": "head_not_found" if exc.code == 404 else "head_restricted",
                "http_status": exc.code, "downloaded_or_verified_trades": False}
    except (URLError, TimeoutError, OSError) as exc:
        return {"date": date, "kind": kind, "url": url,
                "status": "head_inconclusive", "reason": type(exc).__name__,
                "downloaded_or_verified_trades": False}


def trade_inventory(dates, probe=trade_probe):
    requests = [(date, kind) for date in sorted(dates)
                for kind in ("trades", "aggTrades")]
    items = []
    with ThreadPoolExecutor(max_workers=4) as pool:
        pending = {pool.submit(probe, d, k): (d, k) for d, k in requests}
        for job in as_completed(pending):
            items.append(job.result())
    need(len(items) == 2 * len(dates), "Incomplete trade ZIP inventory")
    return sorted(items, key=lambda x: (x["date"], x["kind"]))


def run(root=ROOT, output=OUT, fetch=read_api, probe=trade_probe,
        check_original=previous.original_month):
    root = Path(root)
    months, days, locks = previous.ledger(root)
    old = json.loads((root/"btc_minute_gap_audit/index.json").read_text())
    ref = freeze.build(root)
    need(old["schema"] == "seven.crypto.btc.native-minute-gap-audit-index.v1"
         and old["original_missing_minutes"] == 5881
         and old["recovered_native_minutes"] == 0
         and old["still_missing_minutes"] == 5881
         and old["dates_audited"] == 26
         and ref["utc_day_count"] == 3075
         and ref["one_minute_complete"] is False
         and old["canonical_sources"] == locks,
         "Original BTC daily and minute audit provenance changed")
    found = {}
    report = []
    per_month_new = {}
    for date in sorted(days):
        missing = days[date]
        month = date[:7]
        for start, end, n in segments(missing):
            url = api_url(start, end)
            response = fetch(url)
            status = response["status"]
            need(status in ("api_200", "http_unavailable", "rate_limited",
                            "transport_error"), "Unrecognized REST source status")
            rows = (verify_api_rows(response["rows"], start, end)
                    if status == "api_200" else {})
            wanted = {t: rows[t] for t in sorted(missing.intersection(rows))}
            outside = sorted(t for t in rows if t not in missing)
            record = {"date": date, "gap_start_ms": start,
                      "gap_end_exclusive_ms": end, "gap_minutes": n,
                      "source_url": url, "http_status": response.get("http_status",200)
                        if status == "api_200" else response.get("http_status"),
                      "api_status": status,
                      "api_response_sha256": response.get("response_sha256"),
                      "api_rows": len(rows), "candidate_rows": len(wanted),
                      "witness_rows": len(outside), "accepted_rows": 0,
                      "admission": "no_source_minute_at_missing_timestamp"}
            if status != "api_200":
                record["admission"] = "inconclusive_api_unavailable"
                record["api_error"] = response.get("reason")
            elif wanted:
                record["admission"] = "pending_monthly_witness_review"
                per_month_new.setdefault(month, []).append((record, wanted, rows))
            report.append(record)
    # Only download existing immutable original month ZIPs when the API has an
    # actual candidate minute. Require matching independent 1m overlapping rows.
    for month, candidates in sorted(per_month_new.items()):
        import tempfile
        with tempfile.TemporaryDirectory(prefix="btc-1m-rest-witness-") as tmp:
            original, meta = check_original(months[month], tmp)
        need(meta["source_zip_sha256"] == months[month]["source_zip_sha256"],
             "Monthly immutable original SHA changed")
        for rec, wanted, rows in candidates:
            witness = sorted(set(rows) & set(original))
            disagree = [t for t in witness
                        if not previous.exact_candle(rows[t], original[t])]
            rec["witness_rows"] = len(witness)
            rec["witness_conflicts"] = len(disagree)
            rec["witness_conflict_samples_ms"] = disagree[:10]
            if not witness or disagree:
                rec["admission"] = "quarantined_missing_or_conflicting_witness"
                continue
            rec["admission"] = "native_api_rows_sha_anchored_with_monthly_witness"
            for t, row in wanted.items():
                need(t not in original and t not in found and t in days[rec["date"]],
                     "REST would invent/duplicate native minute")
                found[t] = row
            rec["accepted_rows"] = len(wanted)
    for rec in report:
        rec["unfilled_minutes"] = rec["gap_minutes"]-rec["accepted_rows"]
        need(rec["unfilled_minutes"] >= 0, "Recovered more than the native gap")
    unresolved = sum(x["unfilled_minutes"] for x in report)
    need(sum(x["gap_minutes"] for x in report) == 5881
         and len(found)+unresolved == 5881,
         "Some 1m gaps were lost or silently synthesized")
    inventory = trade_inventory(days, probe)
    values = [list(found[t]) for t in sorted(found)]
    payload = {"schema": SCHEMA, "venue":"Binance Spot",
               "pair":"BTCUSDT", "quote":"USDT", "interval":"1m",
               "synthetic_rows": 0,
               "source_policy": POLICY,
               "columns":["open_time_ms","open","high","low","close",
                          "base_volume","close_time_ms","quote_volume",
                          "trade_count","taker_base_volume","taker_quote_volume"],
               "rows":values}
    zipraw = gzip.compress(json.dumps(payload, separators=(",",":"),
                                      sort_keys=True).encode(), mtime=0)
    result = {
        "schema":"seven.crypto.btc.native-minute-rest-research-index.v1",
        "source_policy": POLICY, "asset_id":"bitcoin",
        "venue":"Binance Spot", "pair":"BTCUSDT","quote":"USDT",
        "original_missing_minutes":5881,
        "rest_native_1m_accepted":len(found),
        "still_missing_or_not_certified":unresolved,
        "api_inconclusive_requested_minutes":sum(r["gap_minutes"] for r in report
                   if r["api_status"] != "api_200"),
        "api_segments_checked":len(report),"days_checked":len(days),
        "requests":report,
        "trade_archives_inventory":inventory,
        "trade_archives_downloaded":0,
        "trade_candles_reconstructed":0,
        "frozen_daily_reference_sha256":ref["locked_source"]["data_sha256"],
        "frozen_daily_reference_unchanged":True,
        "source_gap_catalog_sha256":locks["gap_catalog_sha256"],
        "prior_minute_audit_sha256":sha((root/"btc_minute_gap_audit/index.json").read_bytes()),
        "candidate_file":"candidate-original-api-minutes.json.gz",
        "candidate_sha256":sha(zipraw),"candidate_bytes":len(zipraw),
        "accepted_minutes_applied_to_1m_source":False,
        "notes":"Evidence only. API errors are not proof of empty historical trading. HTTP HEAD trade inventory does not attest original trades or permit kline synthesis."}
    dest = Path(output)
    dest.mkdir(parents=True, exist_ok=True)
    (dest/result["candidate_file"]).write_bytes(zipraw)
    (dest/"index.json").write_text(json.dumps(result, sort_keys=True,
                      indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print("BTC SPOT REST 1M RESEARCH",json.dumps({
      "segments":len(report), "missing":5881, "api_admitted":len(found),
      "still_missing_or_unconfirmed":unresolved,
      "api_inconclusive_requested":result["api_inconclusive_requested_minutes"],
      "trade_head_present":sum(x["status"]=="head_present" for x in inventory),
      "trade_head_not_found":sum(x["status"]=="head_not_found" for x in inventory)
      },sort_keys=True),flush=True)
    return result


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--audit-only",action="store_true")
    p.add_argument("--output",type=Path,default=OUT)
    opt=p.parse_args()
    if opt.audit_only:
        months,days,_=previous.ledger()
        print("BTC REST minute source scope",json.dumps({
          "dates":len(days),"months":len(months),
          "gap_segments":sum(len(segments(x)) for x in days.values()),
          "target_minutes":sum(len(x) for x in days.values()),
          "original_verified_daily_1d":3075},sort_keys=True))
    else:
        run(output=opt.output)


if __name__=="__main__":main()
