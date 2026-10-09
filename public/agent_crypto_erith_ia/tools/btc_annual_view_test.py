#!/usr/bin/env python3
"""Offline regression tests of the annual BTC archive projection."""
import gzip
import json
import tempfile
import unittest
from pathlib import Path

import build_historical_btc_view as m

class BTCViewTests(unittest.TestCase):
    def test_twelve_published_months_no_gaps(self):
        tags=[f"crypto-spot-bulk-2025-{n:02d}-1m" for n in (10,11,12)]
        tags += [f"crypto-spot-bulk-2026-{n:02d}-1m" for n in range(1,10)]
        self.assertEqual(m.published_months(tags),
            ["2025-10","2025-11","2025-12"]+
            [f"2026-{n:02d}" for n in range(1,10)])
        with self.assertRaisesRegex(ValueError,"twelve contiguous"):
            m.published_months(tags[:-1])
        with self.assertRaisesRegex(ValueError,"twelve contiguous"):
            m.published_months(tags[:6]+tags[7:])
        self.assertEqual(m.month_previous("2026-01"),"2025-12")

    def test_volume_open_high_low_close_and_gap_rejection(self):
        minute=[]
        for i in range(60):
            minute.append([i*60000,100+i,110+i,90+i,101+i,
                           0.5,50.0,2])
        rows=m.aggregate(minute,300000)
        self.assertEqual(len(rows),12)
        self.assertEqual(rows[0][:5],[0,100,114,90,105])
        self.assertEqual(rows[0][5:], [2.5,250.0,10])
        hourly=m.aggregate(minute,3600000)
        self.assertEqual(len(hourly),1)
        self.assertEqual(hourly[0][:5],[0,100,169,90,160])
        self.assertEqual(hourly[0][5:],[30.0,3000.0,120])
        del minute[22]
        with self.assertRaisesRegex(ValueError,"Missing/duplicate"):
            m.aggregate(minute,300000)

    def test_written_index_hash_and_source_provenance(self):
        data={"schema":m.SCHEMA,"asset_id":"bitcoin","pair":"BTCUSDT",
              "quote":"USDT","first_open_ms":0,"last_open_ms":60000,
              "native_1m_count":2,
              "sources":[{"month":"2025-10","sha256":"a"*64,"candles":2}],
              "series":{"1m":[[0,1,2,1,2,1,1,1]],
                        "5m":[[0,1,2,1,2,1,1,1]],
                        "1h":[[0,1,2,1,2,1,1,1]]}}
        with tempfile.TemporaryDirectory() as tmp:
            output=Path(tmp)
            idx=m.write(output,data)
            blob=(output/"btc-history-year.json.gz").read_bytes()
            self.assertEqual(idx["sha256"],m.sha(blob))
            self.assertEqual(idx["bytes"],len(blob))
            self.assertEqual(idx["source_months"],["2025-10"])
            self.assertEqual(json.loads(gzip.decompress(blob)),data)
            self.assertEqual(json.loads((output/"index.json").read_text()),idx)

if __name__=="__main__":
    unittest.main(verbosity=2)
