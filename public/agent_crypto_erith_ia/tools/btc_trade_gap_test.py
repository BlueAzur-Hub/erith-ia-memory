#!/usr/bin/env python3
"""Offline tests for native BTC trades, not OHLCV synthesis."""
import csv
from datetime import datetime,timezone
import hashlib
from io import BytesIO,StringIO
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from zipfile import ZipFile,ZIP_DEFLATED

import audit_btc_trade_gaps as source


def make_zip(date,minute_ids):
    name=f"BTCUSDT-trades-{date}.zip"
    zero=int(datetime.strptime(date,"%Y-%m-%d").replace(tzinfo=timezone.utc).timestamp()*1000)
    text=StringIO()
    writer=csv.writer(text)
    for idx,minute in enumerate(minute_ids,1):
        ts=zero+minute*60_000+100
        writer.writerow([idx,"25000.00","0.01","250.00",ts,"False","True"])
    buff=BytesIO()
    with ZipFile(buff,"w",ZIP_DEFLATED) as z:z.writestr(name[:-4]+".csv",text.getvalue())
    raw=buff.getvalue()
    check=(hashlib.sha256(raw).hexdigest()+"  "+name+"\n").encode()
    return name,raw,check,zero


class TradeAuditTests(unittest.TestCase):
    def test_source_1m_gaps_pin_and_three_dates(self):
        months,days,lock=source.prior.ledger()
        self.assertEqual(len(months),21)
        self.assertEqual(len(days),26)
        self.assertEqual(sum(map(len,days.values())),5881)
        self.assertEqual(len(source.DAYS),3)
        self.assertTrue(all(d in days for d in source.DAYS))
        self.assertEqual(source.daily.build()["utc_day_count"],3075)

    def test_checksum_must_match_original_and_zip_name(self):
        name,raw,check,zero=make_zip("2023-03-24",[0,1])
        source.official_checksum(check,raw,name)
        changed=bytearray(raw);changed[-2]^=1
        with self.assertRaisesRegex(ValueError,"SHA mismatch"):
            source.official_checksum(check,bytes(changed),name)
        with self.assertRaisesRegex(ValueError,"another trade file"):
            source.official_checksum(check,raw,"BTCUSDT-trades-2018-06-26.zip")

    def test_trade_rows_in_actual_gap_are_evidence_not_fake_candles(self):
        date="2023-03-24"
        gaps=source.prior.ledger()[1][date]
        first=min(gaps)
        midnight=int(datetime.strptime(date,"%Y-%m-%d").replace(tzinfo=timezone.utc).timestamp()*1000)
        minute=(first-midnight)//60_000
        name,raw,check,_=make_zip(date,[0,minute,minute+1,1439])
        result=source.inspect_trades(raw,name,date,gaps)
        self.assertEqual(result["native_trade_rows"],4)
        self.assertEqual(result["trade_rows_in_kline_gaps"],2)
        self.assertEqual(result["gap_minutes_with_at_least_one_trade"],2)
        self.assertEqual(result["candidate_native_klines_created"],0)
        self.assertEqual(result["gap_minutes_without_trade_in_this_file"],len(gaps)-2)

    def test_invalid_trade_pair_and_bad_archive_refused(self):
        name,raw,check,_=make_zip("2023-03-24",[0,1])
        with self.assertRaisesRegex(ValueError,"pair or day"):
            source.inspect_trades(raw,"ETHUSDT-trades-2023-03-24.zip",
                                  "2023-03-24",{source.prior.ledger()[1]["2023-03-24"].pop()})
        with self.assertRaises(Exception):
            source.inspect_trades(b"broken-zip",name,"2023-03-24",
                                  source.prior.ledger()[1]["2023-03-24"])

    def test_native_trade_source_unavailable_does_not_claim_no_trades(self):
        d="2018-06-26"
        gaps=source.prior.ledger()[1][d]
        def blocked(url,cap):
            return {"status":"http_unavailable","http_status":451}
        record=source.one_day(d,gaps,blocked)
        self.assertEqual(record["source_status"],"http_unavailable")
        self.assertEqual(record["native_klines_created"],0)
        self.assertNotIn("gap_minutes_without_trade_in_this_file",record)

    def test_real_checksum_fixture_source_path_and_no_kline_created(self):
        d="2023-03-24"
        name,raw,check,_=make_zip(d,[0,10,20])
        def mock(url,cap):
            return {"status":"downloaded","data":check if url.endswith(".CHECKSUM") else raw}
        rec=source.one_day(d,source.prior.ledger()[1][d],mock)
        self.assertEqual(rec["source_status"],"sha256_verified")
        self.assertEqual(rec["native_trade_rows"],3)
        self.assertEqual(rec["trade_rows_in_kline_gaps"],0)
        self.assertEqual(rec["native_klines_created"],0)
        self.assertTrue(rec["archive_url"].startswith(source.ORIGIN))


if __name__=="__main__":
    unittest.main(verbosity=2)
