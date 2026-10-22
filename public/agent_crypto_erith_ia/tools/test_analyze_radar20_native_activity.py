#!/usr/bin/env python3
"""Pure synthetic contract tests; the CI also rebuilds with 120 SHA-checked source files."""
import datetime as dt
import unittest

from analyze_radar20_native_activity import (
    HOUR_MS, scan_asset, summarise, future_summary, compute, must
)

START = int(dt.datetime(2026, 4, 1, tzinfo=dt.timezone.utc).timestamp()*1000)


def bars(n=85):
    result = []
    for i in range(n):
        v, trades, pct = 100.0, 10, 50.0
        if 25 <= i <= 27 or 80 <= i <= 82:
            v, trades, pct = 400.0, 40, 60.0
        if 40 <= i <= 42:
            v, trades, pct = 400.0, 40, 40.0
        price=100.0+i*.01
        result.append([START + i*HOUR_MS, price, price, price, price,
                       v, v*pct/100, v*(100-pct)/100, pct, trades])
    return result


class NativeHourlyActivityTest(unittest.TestCase):
    def test_three_hour_sequences_are_nonoverlapping_and_native(self):
        obs, events=scan_asset(bars(), "ETH")
        self.assertEqual(len(obs), 85-24)
        self.assertEqual(len(events), 3)
        self.assertEqual([x["side"] for x in events], ["buyer","seller","buyer"])
        self.assertEqual([x["index"] for x in obs if x["burst"]][:3], [25,26,27])
        self.assertEqual(events[0]["time_utc"], "2026-04-02T03:00:00Z")
        self.assertAlmostEqual(events[0]["trade_ratio"],4.0)
        self.assertEqual(obs[3]["trades"], 40)
        self.assertAlmostEqual(obs[3]["mean_trade_usdt"],10.0)
        self.assertIsNotNone(events[0]["outcomes"]["48"])
        self.assertIsNone(events[1]["outcomes"]["48"])
        self.assertIsNone(events[2]["outcomes"]["4"])
        self.assertIsNone(events[2]["outcomes"]["24"])
        self.assertIsNone(events[2]["outcomes"]["48"])
        result=summarise(obs,events)
        self.assertEqual(result["types"]["buyer"]["sequences"],2)
        self.assertEqual(result["types"]["seller"]["sequences"],1)
        self.assertEqual(result["types"]["buyer"]["forward_long_only"]["4"]["measured"],1)
        self.assertEqual(result["types"]["buyer"]["forward_long_only"]["4"]["not_measured"],1)
        self.assertEqual(sum(x["market_hours"] for x in result["time_windows_4h_utc"]),len(obs))
        self.assertEqual(sum(x["buyer_sequences"] for x in result["time_windows_4h_utc"]),2)
        self.assertEqual(sum(x["seller_sequences"] for x in result["time_windows_4h_utc"]),1)

    def test_single_burst_or_break_is_not_3h_sequence(self):
        rows=bars()
        rows[26][5]=100.0
        rows[26][9]=10
        obs,ev=scan_asset(rows,"SOL")
        self.assertFalse(any(e["time_utc"]=="2026-04-02T03:00:00Z" for e in ev))
        self.assertGreater(len(obs),0)

    def test_no_future_prices_from_series_end(self):
        obs,ev=scan_asset(bars(),"BTC")
        tail=ev[-1]
        self.assertIsNone(tail["outcomes"]["4"])
        self.assertEqual(future_summary([tail],4)["positive_rate_pct"],None)

    def test_native_trade_count_required_and_contiguous(self):
        bad=bars()
        bad[30][9]=None
        with self.assertRaisesRegex(ValueError,"Native trade count"):
            scan_asset(bad,"BTC")
        bad=bars()
        bad[31][0]+=HOUR_MS
        with self.assertRaisesRegex(ValueError,"gap"):
            scan_asset(bad,"BTC")
        bad=bars()
        bad[30][5]=float("nan")
        with self.assertRaisesRegex(ValueError,"Invalid hourly"):
            scan_asset(bad,"BTC")

    def test_not_a_minutely_frequency_or_trading_system(self):
        obs,ev=scan_asset(bars(),"BTC")
        self.assertGreater(sum(x["trades"] for x in obs),len(obs))
        # 30 trades over one hour is NOT 30 traders and cannot be
        # distributed into 1/5-minute bins without native evidence.
        self.assertTrue(all(x["hour_utc"] in range(24) for x in obs))


if __name__ == "__main__":
    unittest.main()
