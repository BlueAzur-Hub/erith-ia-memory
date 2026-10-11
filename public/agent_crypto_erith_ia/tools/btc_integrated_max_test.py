#!/usr/bin/env python3
"""BTC Max reconstructive admission tests. No network or exchange calls."""
import unittest
from datetime import datetime, timezone
from pathlib import Path

import build_btc_integrated_max as fix

def ms(date):
    return int(datetime.strptime(date, "%Y-%m-%d").replace(tzinfo=timezone.utc).timestamp()*1000)

def day_rows(day, excluded=None):
    start=ms(day)
    excluded=set(excluded or [])
    return [[start+j*60000,120.,124.,118.,121.,2.,240.,3]
            for j in range(1440) if j not in excluded]

class BtcReconstructionTests(unittest.TestCase):
    def test_one_missing_native_minute_must_not_become_daily_ohlcv(self):
        full=day_rows("2023-03-23")
        partial=day_rows("2023-03-24",range(760,840))
        next_day=day_rows("2023-03-25")
        candles,dropped=fix.native_rows_to_daily(full+partial+next_day,"2023-03")
        self.assertEqual(len(candles),2)
        self.assertEqual(len(dropped),1)
        self.assertEqual(dropped[0]["day_ms"],ms("2023-03-24"))
        self.assertEqual(dropped[0]["observed_minutes"],1360)
        self.assertEqual(dropped[0]["missing_minutes"],80)
        self.assertEqual([x[0] for x in candles],
                         [ms("2023-03-23"),ms("2023-03-25")])
        self.assertEqual(fix.prior.gaps(candles,"1d")[0]["missing_bars"],1)

    def test_full_day_calculates_real_ohlcv_volume(self):
        rows=day_rows("2023-03-23")
        data,gaps=fix.native_rows_to_daily(rows,"2023-03")
        self.assertFalse(gaps)
        self.assertEqual(data[0][:5],
                         [ms("2023-03-23"),120.,124.,118.,121.])
        self.assertEqual(data[0][5],2880.)
        self.assertEqual(data[0][6],345600.)
        self.assertEqual(data[0][7],4320)

    def test_wrong_source_month_must_be_rejected(self):
        with self.assertRaisesRegex(ValueError,"another month"):
            fix.native_rows_to_daily(day_rows("2023-04-01"),"2023-03")

    def test_full_and_partial_canonical_catalog_coverage(self):
        complete,partial,shards,digests,reused=fix.source_catalogs()
        self.assertGreaterEqual(len(complete),80)
        self.assertGreaterEqual(len(partial),21)
        self.assertEqual(len(set(complete)|set(partial)),101)
        self.assertIn("2023-03",partial)
        self.assertEqual(partial["2023-03"]["native_rows"],44560)
        self.assertEqual(partial["2023-03"]["missing_calendar_minutes"],80)
        self.assertIn("2018-05",complete)
        self.assertIn("2026-09",complete)
        self.assertTrue(set(reused)<=set(complete))
        self.assertGreaterEqual(len(reused),59)
        self.assertEqual(len(digests),3)

if __name__=="__main__":
    unittest.main(verbosity=2)
