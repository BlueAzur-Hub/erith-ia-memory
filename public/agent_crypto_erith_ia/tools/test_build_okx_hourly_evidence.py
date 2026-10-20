#!/usr/bin/env python3
"""No-network tests: never invent hour-to-hour returns or executable orders."""
import copy
import datetime as dt
import pathlib
import sys
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import collect_okx_public_hourly as collector
import build_okx_hourly_evidence as evidence
from test_collect_okx_public_hourly import NOW, Feeds

FIRST = collector.collect(Feeds(), NOW)


def second():
    row=copy.deepcopy(FIRST)
    row["hour_utc"]="2026-10-20T11Z"
    row["observed_at_utc"]="2026-10-20T11:17:00Z"
    for market in row["markets"]:
        for key in ("book5","ticker"):
            if market[key]:
                market[key]["source_at_utc"]="2026-10-20T11:16:59Z"
        if market["book5"]:
            market["book5"]["asks"][0][0]="10.03"
        if market["pair"]=="ETH-EUR":
            market["status"]="PARTIAL_PUBLIC_DATA"
            market["book5"]=None
    return row


class ResearchEvidenceTests(unittest.TestCase):
    def test_first_hour_is_not_called_a_trend(self):
        r=evidence.build([FIRST], NOW)
        self.assertEqual(r["observed_hours_total"],1)
        self.assertEqual(r["pairs_with_public_books"],3)
        self.assertEqual(r["pairs_with_two_or_more_hours"],0)
        for pair in r["pairs"]:
            self.assertEqual(pair["status"],"AWAITING_SECOND_HOUR")
            self.assertIsNone(pair["observed_mid_change_pct"])
            self.assertFalse(pair["trading_signal"])
        self.assertEqual(r["real_orders"],0)
        self.assertEqual(r["paper_fills"],0)
        self.assertFalse(r["strategy_certified"])

    def test_second_hour_returns_are_only_native_pair_observations(self):
        r=evidence.build([FIRST, second()], NOW+dt.timedelta(hours=1))
        by_pair={p["pair"]:p for p in r["pairs"]}
        self.assertEqual(r["pairs_with_two_or_more_hours"],2)
        self.assertEqual(by_pair["BTC-USDC"]["book_samples"],2)
        self.assertEqual(by_pair["BTC-USDT"]["book_samples"],2)
        self.assertEqual(by_pair["ETH-EUR"]["book_samples"],1)
        self.assertIsNotNone(by_pair["BTC-USDC"]["observed_mid_change_pct"])
        self.assertEqual(by_pair["ETH-EUR"]["status"],"AWAITING_SECOND_HOUR")
        self.assertIsNone(by_pair["ETH-EUR"]["observed_mid_change_pct"])
        self.assertEqual(by_pair["BTC-USDC"]["quote"],"USDC")
        self.assertEqual(by_pair["BTC-USDT"]["quote"],"USDT")
        self.assertTrue(r["no_quote_conversion"])
        self.assertTrue(r["no_interpolation"])
        self.assertEqual(r["trading_signals_issued"],0)

    def test_missing_hour_not_interpolated_or_counted_twice(self):
        r=second()
        r["hour_utc"]="2026-10-20T12Z"
        r["observed_at_utc"]="2026-10-20T12:17:00Z"
        for market in r["markets"]:
            for key in ("book5","ticker"):
                if market[key]:market[key]["source_at_utc"]="2026-10-20T12:16:59Z"
        report=evidence.build([FIRST,r],NOW+dt.timedelta(hours=2))
        self.assertEqual(report["observed_hours_total"],2)
        self.assertEqual(report["pairs"][0]["book_samples"],2)
        with self.assertRaises(ValueError):
            evidence.build([FIRST,FIRST],NOW)

    def test_spoofed_currency_identity_future_and_crossed_books_fail_closed(self):
        scenarios=[]
        fake=copy.deepcopy(FIRST)
        fake["markets"][0]["quote"]="USDT"
        scenarios.append(fake)
        fake=copy.deepcopy(FIRST)
        fake["markets"][0]["book5"]["bids"][0][0]="1000"
        scenarios.append(fake)
        fake=copy.deepcopy(FIRST)
        fake["markets"][0]["book5"]["source_at_utc"]="2026-10-19T11:00:00Z"
        scenarios.append(fake)
        fake=copy.deepcopy(FIRST)
        fake["paper_fills"]=1
        scenarios.append(fake)
        for row in scenarios:
            with self.subTest(row=row["markets"][0]["pair"]):
                with self.assertRaises(ValueError):
                    evidence.build([row],NOW)
        with self.assertRaises(ValueError):
            evidence.build([FIRST],NOW-dt.timedelta(minutes=10))

    def test_partial_market_can_be_skipped_without_fictitious_zero_return(self):
        r=copy.deepcopy(FIRST)
        r["markets"][0]["status"]="PARTIAL_PUBLIC_DATA"
        r["markets"][0]["book5"]=None
        report=evidence.build([r],NOW)
        self.assertEqual(report["pairs_with_public_books"],2)
        self.assertFalse(any(p["pair"]=="BTC-USDC" for p in report["pairs"]))

    def test_ct_is_native_usdc_book_not_a_usdt_or_usd_conversion(self):
        source = copy.deepcopy(FIRST)
        ct = copy.deepcopy(source["markets"][0])
        ct["pair"] = "CT-USDC"
        ct["base"] = "CT"
        ct["quote"] = "USDC"
        source["markets"] = [ct]
        report = evidence.build([source], NOW)
        self.assertEqual(report["pairs_with_public_books"], 1)
        self.assertEqual(report["pairs"][0]["pair"], "CT-USDC")
        self.assertEqual(report["pairs"][0]["quote"], "USDC")
        self.assertFalse(report["strategy_certified"])
        self.assertEqual(report["real_orders"], 0)

if __name__=="__main__":
    unittest.main()
