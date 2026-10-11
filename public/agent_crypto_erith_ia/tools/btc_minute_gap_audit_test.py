#!/usr/bin/env python3
"""Offline quality gates for pinned daily BTC and independent 1m gap source."""
import csv
import hashlib
from io import BytesIO,StringIO
import json
from pathlib import Path
import unittest
from zipfile import ZipFile,ZIP_DEFLATED

import audit_btc_minute_gaps as audit
import freeze_btc_daily_reference as ref


def fake_day(date,skip=()):
    first=int(__import__("datetime").datetime.strptime(
       date,"%Y-%m-%d").replace(tzinfo=__import__("datetime").timezone.utc).timestamp()*1000)
    buffer=StringIO()
    writer=csv.writer(buffer)
    for i in range(1440):
        if i in skip:continue
        t=first+i*60000
        writer.writerow([t,"100.00","102.00","99.00","101.00","2.5",
                          t+59999,"252.5","10","1.0","101.0","0"])
    name=f"BTCUSDT-1m-{date}.zip"
    mem=BytesIO()
    with ZipFile(mem,"w",ZIP_DEFLATED) as z:
        z.writestr(name[:-4]+".csv",buffer.getvalue())
    raw=mem.getvalue()
    check=(hashlib.sha256(raw).hexdigest()+"  "+name+"\n").encode()
    return name,raw,check


class Tests(unittest.TestCase):
    def test_frozen_daily_reference_checks_all_3075_original_days(self):
        obj=ref.build()
        self.assertEqual(obj["status"],"verified_frozen_closed_interval")
        self.assertEqual(obj["utc_day_count"],3075)
        self.assertEqual(obj["gaps_in_daily_series"],0)
        self.assertEqual(obj["one_minute_missing_original"],5881)
        self.assertFalse(obj["one_minute_complete"])
        self.assertTrue(obj["minute_coverage_not_claimed"])
        self.assertEqual(obj["daily_candle_provenance"],
                         {"minute_complete_derived_days":3049,
                          "independent_native_1d_days":26})
        self.assertEqual(len(obj["locked_source"]["data_sha256"]),64)

    def test_original_gap_ledger_exactly_matches_verified_native_1d_dates(self):
        months,days,locked=audit.ledger()
        self.assertEqual(len(months),21)
        self.assertEqual(len(days),26)
        self.assertEqual(sum(len(a) for a in days.values()),5881)
        self.assertEqual(len(days["2023-03-24"]),80)
        self.assertEqual(len(locked["daily_reference_sha256"]),64)

    def test_exact_binance_zip_and_checksum_proof_and_mutation_rejected(self):
        name,raw,check=fake_day("2023-03-24",range(760,840))
        audit.verify_checksum(check,raw,name)
        rows=audit.parse_day(raw,name,"2023-03-24")
        self.assertEqual(len(rows),1360)
        self.assertFalse(any(row[0] in [
           int(__import__("datetime").datetime(2023,3,24,
                     tzinfo=__import__("datetime").timezone.utc).timestamp()*1000)+760*60000]
           for row in rows.values()))
        changed=bytearray(raw);changed[-2]^=1
        with self.assertRaisesRegex(ValueError,"SHA-256"):
            audit.verify_checksum(check,bytes(changed),name)
        with self.assertRaisesRegex(ValueError,"another source"):
            audit.verify_checksum(check,raw,"ETHUSDT-1m-2023-03-24.zip")

    def test_only_real_present_minutes_are_eligible_for_recovery(self):
        day="2023-03-24"
        name,raw,check=fake_day(day,range(760,840))
        other=audit.parse_day(raw,name,day)
        full_name,full_raw,full_check=fake_day(day)
        every=audit.parse_day(full_raw,full_name,day)
        self.assertEqual(len(other),1360)
        self.assertEqual(len(every),1440)
        self.assertEqual(len(set(every)-set(other)),80)
        shared=set(every)&set(other)
        self.assertTrue(all(audit.exact_candle(every[t],other[t]) for t in shared))
        modified=list(every[next(iter(shared))]);modified[4]="102.01"
        self.assertFalse(audit.exact_candle(modified,other[next(iter(shared))]))
        self.assertEqual(len(set(every)-set(other)),80)

    def test_source_requests_are_official_spot_btcusdt_1m_only(self):
        name,raw,checksum=fake_day("2023-03-24")
        urls=[]
        def downloader(url,cap):
            urls.append(url)
            return checksum if url.endswith(".CHECKSUM") else raw
        data,proof=audit.day_source("2023-03-24",downloader)
        self.assertEqual(len(data),1440)
        self.assertEqual(proof["pair"],"BTCUSDT")
        self.assertEqual(proof["quote"],"USDT")
        self.assertEqual(proof["interval"],"1m")
        self.assertEqual(len(urls),2)
        self.assertTrue(all(u.startswith(audit.DAY_ORIGIN) for u in urls))
        self.assertTrue(urls[1].endswith(".CHECKSUM"))
        with self.assertRaisesRegex(ValueError,"date"):
            audit.day_source("2023-99-24",downloader)

    def test_daily_archive_missing_is_not_interpolated(self):
        self.assertIsNone(audit.day_source(
            "2023-03-24",lambda url,cap:None))
        name,raw,checksum=fake_day("2023-03-24",range(760,840))
        def only_partial(url,cap):
            return checksum if url.endswith(".CHECKSUM") else raw
        got,proof=audit.day_source("2023-03-24",only_partial)
        self.assertEqual(len(got),1360)
        self.assertEqual(len({i for i in range(1440) if i in range(760,840)}),80)


if __name__=="__main__":
    unittest.main(verbosity=2)
