#!/usr/bin/env python3
"""Rank-complete adapter for Agent-Crypto CoinGecko ranks 251..1000.

The canonical extended collector remains owner of normalization, FX, schemas and
writes. This adapter fetches additional CoinGecko pages only when pages 2..4 do
not reach market_cap_rank 1000 because of ties or unranked rows.

No synthetic asset, price, rank, wallet, order or runtime mutation is introduced.
"""
from __future__ import annotations

from typing import Any

import collect_public_crypto_extended as base

BASE_PAGES = (2, 3, 4)
MAX_FALLBACK_PAGE = 7


def _max_valid_rank(rows: list[dict[str, Any]]) -> int | None:
    ranks: list[int] = []
    for row in rows:
        coin_id = str(row.get("id") or "").strip()
        rank = base.finite(row.get("market_cap_rank"))
        price = base.positive(row.get("current_price"))
        if (
            coin_id
            and rank is not None
            and 251 <= rank <= 1000
            and price is not None
        ):
            ranks.append(int(rank))
    return max(ranks) if ranks else None


def fetch_extended_rank_complete(session, timeout: float) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    fetched_pages: list[int] = []

    for page in BASE_PAGES:
        page_rows = base.fetch_page(session, page, timeout)
        if len(page_rows) < 100:
            raise RuntimeError(
                f"CoinGecko page {page} incomplete: {len(page_rows)}/{base.PER_PAGE}"
            )
        rows.extend(page_rows)
        fetched_pages.append(page)

    next_page = 5
    while (_max_valid_rank(rows) or 0) < 1000 and next_page <= MAX_FALLBACK_PAGE:
        page_rows = base.fetch_page(session, next_page, timeout)
        if not page_rows:
            break
        rows.extend(page_rows)
        fetched_pages.append(next_page)
        next_page += 1

    base.PAGES = tuple(fetched_pages)
    return rows


base.fetch_extended = fetch_extended_rank_complete


if __name__ == "__main__":
    raise SystemExit(base.main())
