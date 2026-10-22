#!/usr/bin/env python3
"""A changing CoinGecko page must not publish an invented Top1000 rank."""
import unittest
import collect_public_crypto_extended as collector

FX = {"eur_per_usd": 0.90}
def market_rows():
    return [
        {"id": f"coingecko-asset-{rank}", "symbol": f"C{rank}",
         "market_cap_rank": rank, "current_price": 1.0,
         "last_updated": "2026-10-22T12:00:00Z"}
        for rank in range(251, 1001)
    ]

class RankIntegrityTests(unittest.TestCase):
    def test_full_750_unique_ranks_are_preserved_exactly(self):
        coins = collector.normalize_extended(market_rows(), FX)
        self.assertEqual(len(coins), 750)
        self.assertEqual([x["rank"] for x in coins], list(range(251, 1001)))

    def test_duplicate_rank_and_missing_rank_rejected_not_repaired(self):
        rows = market_rows()
        # Reproduces 22 Oct: a duplicate rank 488 and missing rank 484.
        rows[484-251]["market_cap_rank"] = 488
        with self.assertRaisesRegex(RuntimeError, "Extended rank integrity"):
            collector.normalize_extended(rows, FX)
        self.assertEqual(rows[484-251]["market_cap_rank"], 488)

    def test_missing_or_repeated_identity_not_promoted(self):
        rows = market_rows()
        rows[300]["id"] = rows[299]["id"]
        with self.assertRaisesRegex(RuntimeError, "Extended rank integrity"):
            collector.normalize_extended(rows, FX)

if __name__ == "__main__":
    unittest.main()
