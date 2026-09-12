#!/usr/bin/env python3
"""Rank-complete adapter for the canonical Agent-Crypto Top-250 collector.

The canonical collector remains the owner of normalization, FX, schemas and writes.
This adapter only widens CoinGecko pagination when page 1 does not actually contain
all valid market_cap_rank labels through 250.

No synthetic asset, price, rank, wallet, order or runtime mutation is introduced.
"""
from __future__ import annotations

from typing import Any

import collect_public_crypto as base

ORIGINAL_FETCH = base.fetch_coingecko


def _valid_ranked_ids(rows: list[dict[str, Any]]) -> tuple[set[str], set[int]]:
    seen: set[str] = set()
    ranks: set[int] = set()
    for row in rows:
        coin_id = str(row.get("id") or "").strip()
        rank = base.finite(row.get("market_cap_rank"))
        price = base.positive(row.get("current_price"))
        if (
            not coin_id
            or coin_id in seen
            or rank is None
            or not (1 <= rank <= 250)
            or price is None
        ):
            continue
        seen.add(coin_id)
        ranks.add(int(rank))
    return seen, ranks


def fetch_coingecko_rank_complete(session, timeout: float) -> list[dict[str, Any]]:
    rows = ORIGINAL_FETCH(session, timeout)
    ids, ranks = _valid_ranked_ids(rows)
    if len(ids) >= 250 and 250 in ranks:
        return rows

    fallback_url = base.COINGECKO_URL.replace("&page=1", "&page=2")
    response = session.get(fallback_url, timeout=timeout)
    if response.status_code == 429:
        raise RuntimeError("CoinGecko HTTP 429 (quota temporaire · fallback page 2)")
    response.raise_for_status()
    payload = response.json()
    if not isinstance(payload, list):
        raise RuntimeError("CoinGecko fallback page 2: tableau JSON attendu")

    # Append raw rows only; canonical normalize_market remains the sole filter/owner.
    rows.extend(row for row in payload if isinstance(row, dict))
    return rows


base.fetch_coingecko = fetch_coingecko_rank_complete


if __name__ == "__main__":
    raise SystemExit(base.main())
