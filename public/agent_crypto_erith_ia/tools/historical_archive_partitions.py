#!/usr/bin/env python3
"""Sealed, SHA-256 indexed *metadata* partitions for append-only Spot OHLCV.

Do not relocate or delete existing OHLCV gzip blocks. Only move their existing
manifest entries into immutable, content-addressed gzip manifests when an
active ledger grows. The root index always points to all sealed partitions and
its remaining active chunk entries. No change to asset identity or quote.
"""
from __future__ import annotations

import gzip
import hashlib
import json
from pathlib import Path
import re

SCHEMA = "aerith.public.ohlcv.spot.incremental.partition.v1"
PARTITION_NAME = re.compile(r"^partitions/part_([0-9]{6})_([a-f0-9]{16})\.json\.gz$")
SHA = re.compile(r"^[a-f0-9]{64}$")
SEAL_THRESHOLD = 360
KEEP_RECENT = 72
MAX_PARTITIONS = 10000
MAX_PARTITION_BLOCKS = 1000
MAX_COMPRESSED_BYTES = 4_000_000
MAX_DECODED_BYTES = 4_000_000


def demand(ok, why):
    if not ok:
        raise ValueError(why)


def pack(obj):
    return json.dumps(obj, sort_keys=True, ensure_ascii=False,
                      separators=(",", ":")).encode("utf-8")


def sha256(raw):
    return hashlib.sha256(raw).hexdigest()


def safe_unzip(raw):
    demand(len(raw) <= MAX_COMPRESSED_BYTES, "Oversized sealed metadata partition")
    # Bound decompressed bytes, even if the archive has an extreme ratio.
    import zlib
    decoder = zlib.decompressobj(wbits=16 + zlib.MAX_WBITS)
    data = decoder.decompress(raw, MAX_DECODED_BYTES + 1)
    demand(len(data) <= MAX_DECODED_BYTES and decoder.eof
           and not decoder.unconsumed_tail and not decoder.unused_data,
           "Invalid or oversized compressed partition")
    return json.loads(data)


def all_chunks(root: Path, ledger: dict):
    """Iterate sealed partitions in order, then the active root index entries."""
    refs = ledger.get("partitions", [])
    chunks = ledger.get("chunks")
    demand(isinstance(refs, list) and len(refs) <= MAX_PARTITIONS,
           "Invalid sealed partition list")
    demand(isinstance(chunks, list) and len(chunks) <= 5000,
           "Invalid active chunk list")
    seen = set()
    for number, meta in enumerate(refs, 1):
        demand(isinstance(meta, dict) and
               isinstance(meta.get("file"), str) and
               isinstance(meta.get("sha256"), str) and SHA.fullmatch(meta["sha256"]),
               "Sealed partition metadata invalid")
        match = PARTITION_NAME.fullmatch(meta["file"])
        demand(match is not None and int(match.group(1)) == number
               and meta["sha256"].startswith(match.group(2))
               and meta["file"] not in seen, "Invalid sealed partition path")
        seen.add(meta["file"])
        raw = (root / meta["file"]).read_bytes()
        demand(sha256(raw) == meta["sha256"], "Sealed partition SHA-256 mismatch")
        record = safe_unzip(raw)
        items = record.get("chunks")
        demand(record.get("schema") == SCHEMA
               and record.get("ordinal") == number
               and isinstance(items, list)
               and 1 <= len(items) <= MAX_PARTITION_BLOCKS
               and meta.get("chunks") == len(items)
               and meta.get("candles") == sum(x["candles"] for x in items),
               "Sealed partition index/body mismatch")
        for entry in items:
            yield entry
    for entry in chunks:
        yield entry


def rotate(root: Path, ledger: dict):
    """Return (new ledger, immutable files). No filesystem side effects here.

    The caller writes returned manifest files first, then publishes root index
    last. A failed write cannot make the root reference a missing partition.
    """
    refs = list(ledger.get("partitions", []))
    active = list(ledger["chunks"])
    demand(len(refs) <= MAX_PARTITIONS, "Too many sealed partitions")
    if len(active) < SEAL_THRESHOLD:
        return ledger, []
    demand(0 < KEEP_RECENT < SEAL_THRESHOLD <= 5000,
           "Invalid bounded archive partition policy")
    pending = active[:-KEEP_RECENT]
    new_files = []
    while pending:
        take = pending[:MAX_PARTITION_BLOCKS]
        pending = pending[len(take):]
        ordinal = len(refs) + 1
        demand(ordinal <= MAX_PARTITIONS, "Sealed manifest capacity reached")
        raw = gzip.compress(pack({"schema": SCHEMA, "ordinal": ordinal,
                                  "chunks": take}), compresslevel=9, mtime=0)
        checksum = sha256(raw)
        filename = f"partitions/part_{ordinal:06d}_{checksum[:16]}.json.gz"
        refs.append({"file": filename, "sha256": checksum,
                     "chunks": len(take),
                     "candles": sum(item["candles"] for item in take)})
        new_files.append((filename, raw))
    # No candle block is deleted: only references move to an immutable manifest.
    new_index = {**ledger, "partitions": refs, "chunks": active[-KEEP_RECENT:]}
    return new_index, new_files


def persist_partitions(root: Path, new_files, atomic_write):
    for filename, payload in new_files:
        dest = root / filename
        if dest.exists():
            demand(dest.read_bytes() == payload, "Immutable partition collision")
        else:
            atomic_write(dest, payload)
