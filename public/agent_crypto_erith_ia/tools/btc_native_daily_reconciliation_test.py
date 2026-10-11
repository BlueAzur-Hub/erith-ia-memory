#!/usr/bin/env python3
"""Offline red-team tests for official-source native 1d gap recovery."""
import csv
from datetime import datetime, timezone
import hashlib
from io import BytesIO, StringIO
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from zipfile import ZipFile,ZIP_DEFLATED

import reconcile_btc_native_daily as target


def utc(d):
    return int(datetime.strptime(d,"%Y-%m-%d").replace(tzinfo=timezone.utc).timestamp()*1000)


def zip_bundle(month, days):
    name="BTCUSDT-1d-"+month+".zip"
    f=BytesIO()
    with ZipFile(f,"w",compression=ZIP_DEFLATED) as z:
        rows=[]
        for when in days:
            stamp=utc(when)
            rows.append([stamp,"100.00","110.00","90.00","105.00",
              "750.00",stamp+target.D-1,"78000.00","123",0,0,0])
        sio=StringIO()
        csv.writer(sio).writerows(rows)
        z.writestr(name[:-4]+".csv",sio.getvalue())
    payload=f.getvalue()
    checksum=(hashlib.sha256(payload).hexdigest()+"  "+name+"\n").encode()
    return name,payload,checksum


class NativeDailyRecovery(unittest.TestCase):
    def test_official_checksum_rejects_mutated_zip(self):
        name,data,check=zip_bundle("2023-03",["2023-03-23","2023-03-24"])
        target.parse_checksum(check,name,data)
        other=bytearray(data);other[-10]^=1
        with self.assertRaisesRegex(ValueError,"CHECKSUM"):
            target.parse_checksum(check,name,bytes(other))
        with self.assertRaisesRegex(ValueError,"filename"):
            target.parse_checksum(check,b"name.zip",data)

    def test_real_1d_parsing_preserves_ohlcv_and_utc(self):
        name,data,check=zip_bundle("2023-03",["2023-03-23","2023-03-24"])
        rows=target.parse_zip(data,name,"2023-03")
        self.assertEqual(set(rows),{utc("2023-03-23"),utc("2023-03-24")})
        self.assertEqual(rows[utc("2023-03-24")],
           [utc("2023-03-24"),100.0,110.0,90.0,105.0,750.0,78000.0,123])
        self.assertFalse(target.matches(rows[utc("2023-03-24")],
                     [utc("2023-03-24"),100,110,90,104,750,78000,123]))

    def test_verify_uses_exact_official_binance_pair_and_checksum(self):
        name,payload,checksum=zip_bundle("2023-03",["2023-03-23","2023-03-24"])
        asked=[]
        def download(url,_cap):
            asked.append(url)
            return checksum if url.endswith(".CHECKSUM") else payload
        result=target.fetch_verified("2023-03",downloader=download)
        self.assertEqual(result["proof"]["interval"],"1d")
        self.assertEqual(result["proof"]["pair"],"BTCUSDT")
        self.assertEqual(result["proof"]["quote"],"USDT")
        self.assertEqual(result["proof"]["zip_sha256"],target.hexdigest(payload))
        self.assertEqual(len(asked),2)
        self.assertTrue(all("data.binance.vision/data/spot/monthly/klines/BTCUSDT/1d/"
                            in x for x in asked))
        with self.assertRaisesRegex(ValueError,"month"):
            target.fetch_verified("2023/03",downloader=download)

    def test_monthly_unavailable_falls_back_to_exact_day_not_other_market(self):
        name,payload,checksum=zip_bundle("2023-03",["2023-03-24"])
        asked=[]
        def download(url,_cap):
            asked.append(url)
            if "/monthly/" in url:return None
            return checksum if url.endswith(".CHECKSUM") else payload
        result=target.fetch_verified("2023-03",downloader=download)
        self.assertIsNone(result)
        result=target.fetch_verified("2023-03",day=utc("2023-03-24"),
                                     downloader=download)
        self.assertIn(utc("2023-03-24"),result["bars"])
        self.assertTrue(result["proof"]["archive_url"].endswith(
                    "/daily/klines/BTCUSDT/1d/BTCUSDT-1d-2023-03-24.zip"))

    def test_source_coverage_counts_and_march_gap_from_existing_registries(self):
        index,obj,dates,missing,digests=target.read_original()
        self.assertEqual(len(dates),26)
        self.assertEqual(index["bars"],3049)
        self.assertEqual(sum(missing.values()),5881)
        self.assertEqual(missing[utc("2023-03-24")],80)
        self.assertEqual(len(digests),2)

    def test_mismatched_native_daily_source_never_fills_without_comparison(self):
        with tempfile.TemporaryDirectory() as tmp:
            # Synthetic 2-day archive, one missing day, at least one valid
            # same-source reference day on monthly ZIP for corroboration.
            d0=utc("2023-03-23");d1=utc("2023-03-24");d2=utc("2023-03-25")
            original=[d0,100.,110.,90.,105.,750.,78000.,123]
            final=[d2,100.,110.,90.,105.,750.,78000.,123]
            fake={"rows":[original,final]}
            idx={"sha256":"d"*64}
            def fake_read(_):
                return idx,fake,[d1],{d1:80},{"a":"e"*64}
            name,raw,checksum=zip_bundle("2023-03",["2023-03-23","2023-03-24"])
            def download(url,_):
                return checksum if url.endswith(".CHECKSUM") else raw
            with patch.object(target,"read_original",side_effect=fake_read):
                status=target.reconcile(home=tmp,output=tmp,downloader=download)
            self.assertEqual(status["native_1d_recovered"],1)
            self.assertEqual(status["unresolved_count"],0)
            self.assertEqual(status["bars"],3)
            self.assertEqual(status["missing_minutes_unchanged"],5881)
            self.assertEqual(status["source_dates"][0]["source"]["interval"],"1d")
            self.assertEqual(status["source_dates"][0]["native_minute_absent"],80)
            self.assertEqual(status["source_model"],
                             "different_native_1d_and_1m_provenance")
            # One deliberately conflicting unaffected original day: reject.
            fake["rows"][0][4]=130.
            with patch.object(target,"read_original",side_effect=fake_read):
                status=target.reconcile(home=tmp,output=tmp,downloader=download)
            self.assertEqual(status["native_1d_recovered"],0)
            self.assertEqual(status["source_dates"][0]["status"],"needs_review")


if __name__=="__main__":
    unittest.main(verbosity=2)
