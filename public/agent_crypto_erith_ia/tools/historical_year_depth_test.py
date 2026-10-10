#!/usr/bin/env python3
"""No invented first price, no stitched gaps, no wrong one-year claim."""
import copy
import json
import unittest

import build_historical_year_depth as years

class TruthfulDepthTests(unittest.TestCase):
    def catalog(self):
        return json.loads(years.CATALOG.read_text())

    def test_real_top250_one_year_truth_without_inception_claim(self):
        source=self.catalog()
        result=years.build(source)
        self.assertEqual(len(result["assets"]),250)
        self.assertEqual(result["archive_assets"],source["archived_assets"])
        self.assertGreaterEqual(result["assets_with_at_least_12_consecutive_closed_months"],25)
        self.assertLessEqual(result["assets_with_at_least_12_consecutive_closed_months"],
                             result["archive_assets"])
        self.assertEqual(result["assets_without_verified_year"],
                         250-result["assets_with_at_least_12_consecutive_closed_months"])
        self.assertTrue(result["earliest_trade_date_not_inferred"])
        self.assertTrue(result["month_is_not_token_creation_date"])
        btc=result["assets"][0]
        self.assertEqual(btc["id"],"bitcoin")
        verified=next(a for a in source["assets"] if a["id"]=="bitcoin")
        months=[item["month"] for item in verified["months"]]
        self.assertGreaterEqual(len(months),24)
        self.assertEqual(btc["first_verified_closed_month"],min(months))
        self.assertEqual(btc["last_verified_closed_month"],max(months))
        self.assertEqual(btc["native_minutes"],verified["candles"])
        self.assertEqual(btc["longest_contiguous_months"],
                         max(map(len,years.spans(months))))
        self.assertTrue(btc["at_least_24_consecutive_months"])
        # Never hardcode 2024 as the oldest year: verified Binance
        # addenda continue moving the frontier backwards.
        source_years=sorted({int(m[:4]) for m in months})
        # A calendar year can legitimately contain MULTIPLE separated
        # runs when the original Binance exchange halted trading.
        # The unique calendar years are unchanged, but distinct shards
        # preserve true gaps instead of stitching in fabricated candles.
        self.assertEqual(sorted({s["year"] for s in btc["year_shards"]}),
                         source_years)
        self.assertEqual(
            [(s["year"],s["span"],s["months"]) for s in btc["year_shards"]],
            [(s["year"],s["span"],s["months"]) for s in
             years.annual_shards(years.spans(months))])
        all_months=[m for shard in btc["year_shards"]
                    for m in shard["months"]]
        self.assertEqual(all_months,sorted(months))
        self.assertEqual(len(all_months),len(set(all_months)))
        self.assertTrue(all(
            all(m.startswith(str(shard["year"])) for m in shard["months"])
            for shard in btc["year_shards"]))
        self.assertFalse(btc["first_exchange_trade_known"])
        self.assertFalse(btc["token_creation_date_known"])
        self.assertTrue(all(a["rank"]==i+1 for i,a in enumerate(result["assets"])))

    def test_gap_never_becomes_contiguous_year(self):
        ms=["2025-01","2025-02","2025-04","2025-05","2025-06"]
        self.assertEqual(years.spans(ms),
                         [["2025-01","2025-02"],["2025-04","2025-05","2025-06"]])
        self.assertEqual([s["months"] for s in years.annual_shards(years.spans(ms))],
                         [["2025-01","2025-02"],["2025-04","2025-05","2025-06"]])
        with self.assertRaisesRegex(ValueError,"Duplicate verified"):
            years.spans(["2025-01","2025-01"])

    def test_calendar_year_is_sharded_without_reinterpreting_quote(self):
        dates=["2024-11","2024-12","2025-01","2025-02"]
        year=years.annual_shards([dates])
        self.assertEqual(year[0]["months"],["2024-11","2024-12"])
        self.assertEqual(year[1]["months"],["2025-01","2025-02"])
        self.assertEqual(year[0]["span"],year[1]["span"])
        self.assertEqual(years.next_month("2025-12"),"2026-01")

    def test_unverified_or_changed_zip_is_not_source_month(self):
        cat=self.catalog()
        row=next(a for a in cat["assets"] if a["months"])
        tests=[
            ("sha256","0"*63),
            ("file","fake.csv"),
            ("candles",33),
            ("release","another-exchange-unknown"),
            ("pair","WRONGUSDT")]
        for field,value in tests:
            changed=copy.deepcopy(cat)
            asset=next(a for a in changed["assets"] if a["id"]==row["id"])
            asset["months"][0][field]=value
            with self.subTest(field=field):
                with self.assertRaises(ValueError):
                    years.build(changed)

    def test_no_fabricated_asset_or_total(self):
        source=self.catalog()
        bad=copy.deepcopy(source)
        bad["assets"][2]["rank"]=2
        with self.assertRaisesRegex(ValueError,"ranked identity"):
            years.build(bad)
        bad=copy.deepcopy(source)
        bad["native_1m_candles"]+=1
        with self.assertRaisesRegex(ValueError,"totals mismatch"):
            years.build(bad)

if __name__=="__main__":
    unittest.main(verbosity=2)
