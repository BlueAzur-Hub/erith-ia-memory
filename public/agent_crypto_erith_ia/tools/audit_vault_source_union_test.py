#!/usr/bin/env python3
"""Truth checks: never invent one-year coverage or join IDs by symbol."""
import json
import unittest
from pathlib import Path
import audit_vault_source_union as v


def fixture():
    years = [
        {"rank": i + 1, "id": f"coin-{i}", "symbol": f"X{i}",
         "verified_months": 12 if i == 0 else (11 if i == 1 else 0),
         "longest_contiguous_months": 12 if i == 0 else (11 if i == 1 else 0),
         "at_least_12_consecutive_months": i == 0,
         "last_verified_closed_month": "2026-09" if i < 2 else None}
        for i in range(250)]
    minute = [
        {"rank": x["rank"], "id": x["id"], "symbol": x["symbol"],
         "native_1m_count": 500 if i < 2 else 0}
        for i, x in enumerate(years)]
    daily = [{"id": "coin-2", "native_candles": 366, "quote": "USDC"},
             {"id": "outside", "native_candles": 12, "quote": "USDT"}]
    return (
        {"ranked": 250, "quote": "USDT", "assets": years, "archive_assets": 2,
         "assets_with_at_least_12_consecutive_closed_months": 1},
        {"ranked": 250, "quote": "USDT", "assets": minute, "archived_assets": 2},
        {"quote": "mixed-native-USDT-USDC", "assets": daily, "asset_count": 2})


class TruthTests(unittest.TestCase):
    def test_union_does_not_double_count_and_annual_is_separate(self):
        r = v.audit(*fixture())
        self.assertEqual(r["summary"]["indexed_1m_or_1d_assets_inside_top250"], 3)
        self.assertEqual(r["summary"]["no_indexed_1m_or_1d_asset_inside_top250"], 247)
        self.assertEqual(r["summary"]["daily_spot_assets_outside_top250"], 1)
        self.assertEqual([x["id"] for x in r["near_verified_12_months"]], ["coin-1"])
        self.assertEqual(r["summary"]["binance_12_consecutive_closed_months"], 1)

    def test_unknown_coin_id_does_not_fall_back_to_symbol(self):
        y, m, d = fixture()
        m["assets"][0]["id"] = "wrong-coin"
        with self.assertRaisesRegex(ValueError, "IDs/ranks"):
            v.audit(y, m, d)

    def test_no_wrong_quote_or_invented_annual_streak(self):
        y, m, d = fixture()
        d["assets"][0]["quote"] = "USD"
        with self.assertRaisesRegex(ValueError, "quote invalid"):
            v.audit(y, m, d)
        y, m, d = fixture()
        y["assets"][1]["at_least_12_consecutive_months"] = True
        with self.assertRaisesRegex(ValueError, "month status"):
            v.audit(y, m, d)

    def test_real_index_rosters_and_source_totals(self):
        if not all((v.ROOT / p).exists() for p in v.SOURCES.values()):
            self.skipTest("Only available in GitHub repository checkout")
        docs = {key: json.loads((v.ROOT / p).read_text(encoding="utf-8"))
                for key, p in v.SOURCES.items()}
        r = v.audit(docs["binance_year"], docs["minute"], docs["daily"])
        s = r["summary"]
        self.assertEqual(s["indexed_1m_or_1d_assets_inside_top250"]
                         + s["no_indexed_1m_or_1d_asset_inside_top250"], 250)
        self.assertLessEqual(s["binance_12_consecutive_closed_months"],
                             s["federated_spot_1m_assets"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
