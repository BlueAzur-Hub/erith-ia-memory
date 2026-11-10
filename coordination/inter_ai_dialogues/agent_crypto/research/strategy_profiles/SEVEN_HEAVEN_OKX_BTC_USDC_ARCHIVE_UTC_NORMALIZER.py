#!/usr/bin/env python3
"""Research-only validation of OKX Spot BTC-USDC archived minute candles.

This consumes already downloaded official ZIPs. It performs NO network requests,
account operations, order placement, or live market actions. Source archives use
UTC+08 day boundaries; valid UTC days require minutes from TWO adjacent ZIPs.

Crucial policy: historical confirm='0' is NEVER silently rewritten to '1'.
Those candles are quarantined and cannot enter a validated backtest dataset.
Identical duplicates are dropped; conflicting duplicates STOP processing.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import re
import sys
import zipfile
from collections import Counter
from datetime import datetime, timedelta, timezone
from decimal import Decimal, InvalidOperation
from pathlib import Path

MS_MINUTE = 60_000
UTC = timezone.utc
FIELDS = ("open", "high", "low", "close", "vol")
REQUIRED = ("instrument_name", "open_time", "confirm") + FIELDS
NAME = re.compile(r"BTC-USDC-candlesticks-(\d{4}-\d\d-\d\d)\.zip$")
MAX_UNCOMPRESSED = 5_000_000


class ArchiveError(ValueError):
    pass


def _number(value: str, field: str) -> Decimal:
    try:
        parsed = Decimal(str(value))
    except (InvalidOperation, TypeError):
        raise ArchiveError(f"invalid {field}: {value!r}") from None
    if not parsed.is_finite():
        raise ArchiveError(f"non-finite {field}")
    return parsed


def load_zip(source: str | Path) -> dict:
    source = Path(source)
    match = NAME.fullmatch(source.name)
    if match is None:
        raise ArchiveError(f"unexpected OKX filename: {source.name}")
    date = match.group(1)
    start = int((datetime.fromisoformat(date).replace(tzinfo=UTC) -
                 timedelta(hours=8)).timestamp() * 1000)
    expected_stamps = set(range(start, start + 1440 * MS_MINUTE, MS_MINUTE))
    raw = source.read_bytes()
    if len(raw) > 5_000_000:
        raise ArchiveError("compressed ZIP over size limit")
    with zipfile.ZipFile(io.BytesIO(raw)) as z:
        names = z.namelist()
        if len(names) != 1 or names[0] != source.stem + ".csv":
            raise ArchiveError("unexpected ZIP members (possible unsafe input)")
        info = z.getinfo(names[0])
        if info.file_size > MAX_UNCOMPRESSED:
            raise ArchiveError("ZIP decompression size limit")
        stream = io.StringIO(z.read(names[0]).decode("utf-8-sig"))
        reader = csv.DictReader(stream)
        if reader.fieldnames is None or any(k not in reader.fieldnames for k in REQUIRED):
            raise ArchiveError("CSV columns missing")
        minutes = {}
        duplicate_count = 0
        for row in reader:
            if row.get("instrument_name") != "BTC-USDC":
                raise ArchiveError("wrong instrument in source")
            try:
                stamp = int(row["open_time"])
            except (ValueError, TypeError):
                raise ArchiveError("invalid timestamp") from None
            if stamp not in expected_stamps:
                raise ArchiveError(f"timestamp outside UTC+8 file window: {stamp}")
            if row["confirm"] not in ("0", "1"):
                raise ArchiveError(f"invalid confirmation flag: {row['confirm']}")
            o, h, lo, c, vol = [_number(row[k], k) for k in FIELDS]
            if not (o > 0 and lo > 0 and c > 0 and vol >= 0 and
                    lo <= o <= h and lo <= c <= h):
                raise ArchiveError(f"invalid OHLCV at {stamp}")
            candle = (o, h, lo, c, vol, row["confirm"])
            if stamp in minutes:
                if minutes[stamp] != candle:
                    raise ArchiveError(f"CONFLICTING DUPLICATES at {stamp}")
                duplicate_count += 1
            else:
                minutes[stamp] = candle
    if set(minutes) != expected_stamps:
        raise ArchiveError(f"incomplete UTC+8 file: {len(minutes)} / 1440 minutes")
    flags = dict(Counter(m[5] for m in minutes.values()))
    return {
        "archive_date": date, "source": source.name,
        "zip_sha256": hashlib.sha256(raw).hexdigest(),
        "source_rows": len(minutes) + duplicate_count,
        "unique_minutes": len(minutes), "identical_duplicates_removed": duplicate_count,
        "confirm_counts_unique": flags,
        "decision": "CONFIRMED" if set(flags) == {"1"} else "QUARANTINED_UNCONFIRMED",
        "minutes": minutes,
    }


def audit(paths: list[str | Path]) -> dict:
    if len(paths) != len(set(map(str, paths))):
        raise ArchiveError("duplicate source filename arguments")
    files = [load_zip(p) for p in paths]
    by_date = {}
    minutes = {}
    for f in files:
        if f["archive_date"] in by_date:
            raise ArchiveError(f"repeated archive date: {f['archive_date']}")
        by_date[f["archive_date"]] = f
        for t, row in f["minutes"].items():
            if t in minutes:
                raise ArchiveError("archive windows overlap")
            minutes[t] = row

    all_days = sorted({datetime.fromtimestamp(t / 1000, UTC).date().isoformat()
                       for t in minutes})
    reconstructed = []
    for day in all_days:
        begin = int(datetime.fromisoformat(day).replace(tzinfo=UTC).timestamp() * 1000)
        stamps = range(begin, begin + 1440 * MS_MINUTE, MS_MINUTE)
        found = [minutes[t] for t in stamps if t in minutes]
        if len(found) != 1440:
            reconstructed.append({
                "utc_date": day, "status": "INCOMPLETE",
                "available_minutes": len(found), "used_for_backtest": False,
            })
            continue
        counts = dict(Counter(row[5] for row in found))
        confirmed = counts.get("1", 0) == 1440
        record = {
            "utc_date": day,
            "status": "VALIDATED" if confirmed else "QUARANTINED_UNCONFIRMED",
            "available_minutes": 1440, "confirm_counts": counts,
            "used_for_backtest": confirmed,
        }
        if confirmed:
            record["ohlcv"] = {
                "open": str(found[0][0]),
                "high": str(max(x[1] for x in found)),
                "low": str(min(x[2] for x in found)),
                "close": str(found[-1][3]),
                "base_volume": str(sum((x[4] for x in found), Decimal("0"))),
            }
        reconstructed.append(record)
    summary = {
        "schema": "seven.okx.btc-usdc.archive-utc-audit.v1",
        "research_only": True, "orders_enabled": False,
        "rules": {
            "identical_duplicates": "deduplicate by minute timestamp",
            "conflicting_duplicates": "ERROR; no output",
            "confirm_zero": "quarantine; never rewrite as confirmed",
            "day_boundary": "UTC 00:00 to 23:59 from UTC+8 source ZIPs",
            "incomplete_days": "exclude; never interpolate",
        },
        "files": [{k: v for k, v in f.items() if k != "minutes"} for f in files],
        "summary": {
            "files_checked": len(files),
            "duplicate_minutes_removed": sum(f["identical_duplicates_removed"] for f in files),
            "validated_days": sum(x["status"] == "VALIDATED" for x in reconstructed),
            "quarantined_days": sum(x["status"] == "QUARANTINED_UNCONFIRMED" for x in reconstructed),
            "incomplete_days": sum(x["status"] == "INCOMPLETE" for x in reconstructed),
        },
        "utc_days": reconstructed,
    }
    return summary


def _fixture(directory: Path, date: str, confirm: str,
             duplicate: bool = False, corrupt: bool = False) -> Path:
    """Make deterministic full-size ZIPs for unit tests; no market data."""
    start = int((datetime.fromisoformat(date).replace(tzinfo=UTC) -
                 timedelta(hours=8)).timestamp() * 1000)
    filename = f"BTC-USDC-candlesticks-{date}.zip"
    rows = []
    for i in range(1440):
        # A known increasing series makes UTC aggregation testable precisely.
        price = Decimal(20_000) + Decimal(i) / 10
        row = ["BTC-USDC", str(price), str(price + 2),
               str(price - 2), str(price + 1), "1", "0", "0",
               str(start + i * MS_MINUTE), confirm]
        rows.append(row)
    if duplicate:
        rows = rows + [r[:] for r in rows]
    if corrupt:
        rows[-1][1] = "99999"  # duplicated timestamp with different open
    csvout = io.StringIO()
    writer = csv.writer(csvout, lineterminator="\n")
    writer.writerow(["instrument_name", "open", "high", "low", "close",
                     "vol", "vol_ccy", "vol_quote", "open_time", "confirm"])
    writer.writerows(rows)
    target = directory / filename
    with zipfile.ZipFile(target, "w", compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr(target.stem + ".csv", csvout.getvalue())
    return target


def self_test() -> None:
    import tempfile
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        a = _fixture(root, "2025-02-15", "1", duplicate=True)
        b = _fixture(root, "2025-02-16", "1")
        fa = load_zip(a)
        assert fa["source_rows"] == 2880
        assert fa["unique_minutes"] == 1440
        assert fa["identical_duplicates_removed"] == 1440
        good = audit([a, b])
        assert good["summary"]["validated_days"] == 1
        day = next(x for x in good["utc_days"] if x["utc_date"] == "2025-02-15")
        assert day["status"] == "VALIDATED"
        assert day["ohlcv"]["open"] == str(Decimal(20000) + Decimal(480) / 10)
        assert day["ohlcv"]["close"] == str(Decimal(20000) + Decimal(479) / 10 + 1)
        assert day["ohlcv"]["base_volume"] == "1440"
        # The older CSV flag is preserved; a 0 cannot pass as confirmed.
        _fixture(root, "2025-02-16", "0")
        hold = audit([a, b])
        assert hold["summary"]["validated_days"] == 0
        assert any(x["status"] == "QUARANTINED_UNCONFIRMED" for x in hold["utc_days"])
        # Conflicting duplicates must STOP, not pick an arbitrary market price.
        _fixture(root, "2025-02-15", "1", duplicate=True, corrupt=True)
        try:
            audit([a])
        except ArchiveError as e:
            assert "CONFLICTING DUPLICATES" in str(e)
        else:
            raise AssertionError("conflicting duplicate was silently accepted")
    print("PASS: identical duplicates; conflict rejection; confirm quarantine; UTC day reassembly")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archives", nargs="*", help="Official OKX BTC-USDC daily ZIPs")
    parser.add_argument("--output", help="JSON evidence path; no trade operations")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return
    if not args.archives:
        parser.error("at least one official ZIP archive must be provided")
    try:
        data = audit(args.archives)
    except (ArchiveError, zipfile.BadZipFile, UnicodeError, OSError) as exc:
        print(f"OKX_ARCHIVE_AUDIT_FAILED: {exc}", file=sys.stderr)
        sys.exit(2)
    serialized = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    if args.output:
        Path(args.output).write_text(serialized, encoding="utf-8")
    print("OKX_ARCHIVE_AUDIT " + json.dumps({
        "summary": data["summary"],
        "files": [{k: x[k] for k in ("archive_date", "decision",
                    "identical_duplicates_removed", "confirm_counts_unique")}
                  for x in data["files"]],
        "utc_days": data["utc_days"],
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
