#!/usr/bin/env python3
"""Diagnose CoinGecko coverage for Agent-Crypto without mutating market snapshots.

Purpose:
- explain why canonical Top-250 can contain fewer than 250 accepted rows;
- explain coverage gaps/ties across ranks 1..1000;
- preserve canonical collectors and prices unchanged.

Read-only with respect to exchange/market execution. Writes only
data/crypto/coverage_diagnostics.json for observability.
"""
from __future__ import annotations

import argparse
import json
import math
import os
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

UTC = timezone.utc
SCHEMA = "agent_crypto_public_coverage_diagnostics_v1"
PAGES = (1, 2, 3, 4)
PER_PAGE = 250
USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "Chrome/126 Safari/537.36 Agent-Crypto-ERITH-IA-Coverage-Diagnostics/40.6.98"
)


def iso(value: datetime | None = None) -> str:
    return (value or datetime.now(tz=UTC)).astimezone(UTC).isoformat(
        timespec="milliseconds"
    ).replace("+00:00", "Z")


def finite(value: Any) -> float | None:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return number if math.isfinite(number) else None


def positive(value: Any) -> float | None:
    number = finite(value)
    return number if number is not None and number > 0 else None


def read_json(path: Path) -> dict[str, Any] | None:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
        return value if isinstance(value, dict) else None
    except Exception:
        return None


def atomic_write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2, allow_nan=False) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    os.replace(temp, path)


def build_session() -> requests.Session:
    retry = Retry(
        total=2,
        connect=2,
        read=2,
        status=2,
        backoff_factor=1.0,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=frozenset({"GET"}),
        respect_retry_after_header=True,
    )
    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": USER_AGENT,
            "Accept": "application/json",
            "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.7",
        }
    )
    session.mount("https://", HTTPAdapter(max_retries=retry))
    return session


def fetch_page(
    session: requests.Session, page: int, timeout: float
) -> list[dict[str, Any]]:
    url = (
        "https://api.coingecko.com/api/v3/coins/markets"
        f"?vs_currency=usd&order=market_cap_desc&per_page={PER_PAGE}&page={page}"
        "&locale=fr&precision=full&sparkline=false"
        "&price_change_percentage=1h,24h,7d,30d"
    )
    response = session.get(url, timeout=timeout)
    if response.status_code == 429:
        raise RuntimeError(f"CoinGecko HTTP 429 page {page}")
    response.raise_for_status()
    payload = response.json()
    if not isinstance(payload, list):
        raise RuntimeError(f"CoinGecko page {page}: JSON array expected")
    return [row for row in payload if isinstance(row, dict)]


def classify(
    rows: list[dict[str, Any]], rank_min: int, rank_max: int
) -> dict[str, Any]:
    seen_ids: set[str] = set()
    accepted: list[dict[str, Any]] = []
    rejected: list[dict[str, Any]] = []
    reasons: Counter[str] = Counter()

    for index, row in enumerate(rows, start=1):
        coin_id = str(row.get("id") or "").strip()
        symbol = str(row.get("symbol") or "").upper()
        name = str(row.get("name") or "")
        rank_value = finite(row.get("market_cap_rank"))
        price = positive(row.get("current_price"))
        row_reasons: list[str] = []

        if not coin_id:
            row_reasons.append("missing_id")
        elif coin_id in seen_ids:
            row_reasons.append("duplicate_id")

        if rank_value is None:
            row_reasons.append("missing_or_invalid_rank")
        elif not (rank_min <= rank_value <= rank_max):
            row_reasons.append("rank_outside_contract")

        if price is None:
            row_reasons.append("missing_or_nonpositive_price")

        if row_reasons:
            reasons.update(row_reasons)
            rejected.append(
                {
                    "source_index": index,
                    "id": coin_id or None,
                    "symbol": symbol or None,
                    "name": name or None,
                    "rank": int(rank_value) if rank_value is not None else None,
                    "current_price": finite(row.get("current_price")),
                    "reasons": row_reasons,
                }
            )
            continue

        seen_ids.add(coin_id)
        accepted.append(
            {
                "id": coin_id,
                "symbol": symbol,
                "rank": int(rank_value),
            }
        )

    ranks = [item["rank"] for item in accepted]
    rank_counts = Counter(ranks)
    represented = sorted(rank_counts)
    unrepresented = [
        rank for rank in range(rank_min, rank_max + 1) if rank not in rank_counts
    ]
    tied = {
        str(rank): count
        for rank, count in sorted(rank_counts.items())
        if count > 1
    }
    duplicate_rank_rows = sum(count - 1 for count in rank_counts.values() if count > 1)

    return {
        "contract": {"rank_min": rank_min, "rank_max": rank_max},
        "raw_rows_received": len(rows),
        "accepted_rows": len(accepted),
        "rejected_rows": len(rejected),
        "rejected_by_reason": dict(sorted(reasons.items())),
        "rejected_samples": rejected[:50],
        "accepted_unique_ids": len(seen_ids),
        "distinct_ranks": len(represented),
        "unrepresented_ranks": unrepresented,
        "tied_ranks": tied,
        "duplicate_rank_rows": duplicate_rank_rows,
        "min_rank_observed": min(represented) if represented else None,
        "max_rank_observed": max(represented) if represented else None,
        "note": (
            "unrepresented_ranks are rank labels absent from accepted rows, not proof "
            "that CoinGecko failed to return an asset; market_cap_rank can be tied "
            "or non-contiguous."
        ),
    }


def persisted_summary(data_root: Path) -> dict[str, Any]:
    latest = read_json(data_root / "latest.json") or {}
    extended = read_json(data_root / "extended.json") or {}
    return {
        "core": {
            "schema": latest.get("schema"),
            "generated_at": latest.get("generated_at"),
            "snapshot_id": latest.get("snapshot_id"),
            "assets_count": int(latest.get("assets_count") or 0),
            "requested_assets": int(latest.get("requested_assets") or 0),
        },
        "extended": {
            "schema": extended.get("schema"),
            "generated_at": extended.get("generated_at"),
            "snapshot_id": extended.get("snapshot_id"),
            "assets_count": int(extended.get("assets_count") or 0),
            "rank_min": int(extended.get("rank_min") or 0),
            "rank_max": int(extended.get("rank_max") or 0),
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default="public/agent_crypto_erith_ia")
    parser.add_argument("--timeout", type=float, default=25.0)
    args = parser.parse_args()

    root = Path(args.root).resolve()
    data_root = root / "data" / "crypto"
    output = data_root / "coverage_diagnostics.json"
    generated_at = iso()

    session = build_session()
    pages: dict[int, list[dict[str, Any]]] = {}
    page_errors: dict[str, str] = {}
    for page in PAGES:
        try:
            pages[page] = fetch_page(session, page, args.timeout)
        except Exception as exc:
            pages[page] = []
            page_errors[str(page)] = f"{type(exc).__name__}: {exc}"

    core = classify(pages[1], 1, 250) if pages[1] else None
    extended_rows = pages[2] + pages[3] + pages[4]
    extended = classify(extended_rows, 251, 1000) if extended_rows else None

    all_accepted: list[tuple[str, int]] = []
    if core:
        core_rows = pages[1]
        # Accepted identity/rank pairs are recomputed with the same canonical guards.
        seen: set[str] = set()
        for row in core_rows:
            coin_id = str(row.get("id") or "").strip()
            rank = finite(row.get("market_cap_rank"))
            if (
                coin_id
                and coin_id not in seen
                and rank is not None
                and 1 <= rank <= 250
                and positive(row.get("current_price")) is not None
            ):
                seen.add(coin_id)
                all_accepted.append((coin_id, int(rank)))
    if extended:
        seen: set[str] = set()
        for row in extended_rows:
            coin_id = str(row.get("id") or "").strip()
            rank = finite(row.get("market_cap_rank"))
            if (
                coin_id
                and coin_id not in seen
                and rank is not None
                and 251 <= rank <= 1000
                and positive(row.get("current_price")) is not None
            ):
                seen.add(coin_id)
                all_accepted.append((coin_id, int(rank)))

    global_ids = [coin_id for coin_id, _ in all_accepted]
    global_ranks = [rank for _, rank in all_accepted]
    rank_counts = Counter(global_ranks)
    id_counts = Counter(global_ids)
    global_diag = {
        "accepted_rows": len(all_accepted),
        "unique_ids": len(set(global_ids)),
        "duplicate_ids_across_scopes": sorted(
            coin_id for coin_id, count in id_counts.items() if count > 1
        ),
        "distinct_ranks": len(rank_counts),
        "tied_rank_labels": sum(1 for count in rank_counts.values() if count > 1),
        "duplicate_rank_rows": sum(
            count - 1 for count in rank_counts.values() if count > 1
        ),
        "unrepresented_ranks_1_1000": [
            rank for rank in range(1, 1001) if rank not in rank_counts
        ],
        "max_rank_observed": max(global_ranks) if global_ranks else None,
    }

    payload = {
        "schema": SCHEMA,
        "version": "1.0.0",
        "build_context": "40.6.98",
        "generated_at": generated_at,
        "source": {
            "provider": "CoinGecko",
            "endpoint_family": "coins/markets",
            "pages": list(PAGES),
            "per_page": PER_PAGE,
            "quote_currency": "USD",
            "purpose": "coverage_diagnostics_only",
        },
        "page_rows_received": {
            str(page): len(rows) for page, rows in pages.items()
        },
        "page_errors": page_errors,
        "core_1_250": core,
        "extended_251_1000": extended,
        "combined_1_1000": global_diag,
        "persisted_snapshots": persisted_summary(data_root),
        "interpretation": {
            "accepted_count_is_not_expected_to_equal_rank_span": True,
            "reason": (
                "CoinGecko market_cap_rank may contain ties/gaps and canonical "
                "collectors reject missing IDs, duplicate IDs, invalid/out-of-scope "
                "ranks, and missing/non-positive prices."
            ),
            "no_synthetic_fill": True,
        },
        "security": {
            "api_key_required": False,
            "wallet_action_allowed": False,
            "exchange_order_allowed": False,
            "canonical_snapshot_mutated": False,
            "browser_runtime_changed": False,
        },
    }
    atomic_write_json(output, payload)
    print(
        json.dumps(
            {
                "status": "ready" if not page_errors else "partial",
                "core": core["accepted_rows"] if core else 0,
                "extended": extended["accepted_rows"] if extended else 0,
                "unique": global_diag["unique_ids"],
                "page_errors": page_errors,
                "output": str(output),
            },
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
