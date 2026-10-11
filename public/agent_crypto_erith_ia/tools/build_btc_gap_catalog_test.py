#!/usr/bin/env python3
"""BTC source-quality catalog: immutable Release digests and no double counting."""
import hashlib
import json
import unittest
import calendar
from datetime import datetime, timezone

import build_btc_gap_catalog as m


def sample(month="2023-03", gap_minutes=80, anomaly=False):
    year, mm = map(int, month.split("-"))
    start = int(datetime(year,mm,1,tzinfo=timezone.utc).timestamp()*1000)
    total = calendar.monthrange(year,mm)[1]*1440
    end = start+total*60000
    row = {
        "schema":"seven.btc.native.source-quality.v1", "month":month,
        "pair":"BTCUSDT", "quote":"USDT", "interval":"1m",
        "source":"Binance Spot official","canonical_import":False,
        "synthetic_rows":0,"source_zip_sha256":"a"*64,"sqlite_sha256":"b"*64,
        "first_open_ms":start,"last_open_ms":end-60000,
        "expected_minutes":total,"native_rows":total-gap_minutes,
        "missing_minutes":gap_minutes,
        "gaps":[{"start_ms":start+86400000,"end_ms_exclusive":start+86400000+gap_minutes*60000,
                 "minutes":gap_minutes}] if gap_minutes else [],
        "close_time_anomaly_count":1 if anomaly else 0,
        "close_time_anomalies":[{"open_time_ms":start,"source_close_time_ms":start-1,
                                  "offset_from_open_ms":-1}] if anomaly else [],
        "close_time_anomalies_kept_original":anomaly,
        "status":"source_with_gaps_and_close_time_anomaly" if anomaly else "source_verified_gaps",
    }
    raw = (json.dumps(row,sort_keys=True)+"\n").encode()
    names = {"zip":f"BTCUSDT-1m-{month}.zip",
             "checksum":f"BTCUSDT-1m-{month}.zip.CHECKSUM",
             "sqlite":f"BTCUSDT-1m-{month}.sqlite",
             "manifest":f"BTCUSDT-1m-{month}.json"}
    hashes = {"zip":"a"*64,"checksum":"c"*64,"sqlite":"b"*64,
              "manifest":hashlib.sha256(raw).hexdigest()}
    sizes = {"zip":2000000,"checksum":88,"sqlite":6000000,"manifest":len(raw)}
    release = {"tag_name":f"btc-spot-native-gap-{month}","draft":False,
               "html_url":"https://github.com/example/test",
               "assets":[{"name":filename, "digest":"sha256:"+hashes[k],
                          "size":sizes[k]} for k,filename in names.items()]}
    return release,raw


class BTCGapCatalogue(unittest.TestCase):
    def setUp(self):
        self.release,self.raw=sample()
        self.full={"ranked":250,"quote":"USDT",
                   "assets":[{"id":"bitcoin","symbol":"BTC",
                              "months":[{"month":"2023-02","candles":40320}]}]}
    def test_valid_verified_original_source_gap(self):
        result=m.verify_release(self.release,self.raw)
        self.assertEqual(result["native_rows"],44560)
        self.assertEqual(result["missing_minutes"],80)
        self.assertEqual(result["proof"]["zip"]["sha256"],"a"*64)
        self.assertFalse(result["canonical_full_month"])
    def test_no_double_counting_and_months_sort(self):
        another,raw=sample("2021-08",270)
        documents={self.release["tag_name"]:self.raw,another["tag_name"]:raw}
        result=m.build([self.release,another],
                       lambda release:documents[release["tag_name"]],
                       self.full,"1"*64)
        self.assertEqual(result["gap_months"],2)
        self.assertEqual(result["complete_months_in_canonical"],1)
        self.assertEqual(result["unique_months_total"],3)
        self.assertEqual(result["months"][0]["month"],"2021-08")
    def test_reject_corrupted_manifest_content(self):
        with self.assertRaisesRegex(ValueError,"digest"):
            m.verify_release(self.release,self.raw.replace(b"source_verified_gaps",b"source_bad"))
    def test_reject_changed_zip_sha(self):
        self.release["assets"][0]["digest"]="sha256:"+"d"*64
        with self.assertRaisesRegex(ValueError,"digest"):
            m.verify_release(self.release,self.raw)
    def test_reject_already_complete_month(self):
        self.full["assets"][0]["months"]=[{"month":"2023-03","candles":44640}]
        with self.assertRaisesRegex(ValueError,"Both complete and gap"):
            m.build([self.release],lambda _:self.raw,self.full,"1"*64)
    def test_reject_duplicate_release_tag(self):
        with self.assertRaisesRegex(ValueError,"Duplicate"):
            m.build([self.release,self.release],lambda _:self.raw,self.full,"1"*64)
    def test_reject_gap_count_mismatch(self):
        doc=json.loads(self.raw);doc["missing_minutes"]=81
        tampered=json.dumps(doc).encode()
        self.release["assets"][-1]["digest"]="sha256:"+hashlib.sha256(tampered).hexdigest()
        self.release["assets"][-1]["size"]=len(tampered)
        with self.assertRaisesRegex(ValueError,"calendar"):
            m.verify_release(self.release,tampered)
    def test_preserve_close_time_anomaly_not_repair(self):
        r,b=sample("2020-12",290,True)
        item=m.verify_release(r,b)
        self.assertEqual(item["close_time_anomaly_count"],1)
        self.assertEqual(item["native_rows"],44350)
        self.assertEqual(item["close_time_anomalies"][0]["offset_from_open_ms"],-1)
    def test_no_synthetic_source(self):
        doc=json.loads(self.raw);doc["synthetic_rows"]=1
        tampered=json.dumps(doc).encode()
        self.release["assets"][-1]["digest"]="sha256:"+hashlib.sha256(tampered).hexdigest()
        self.release["assets"][-1]["size"]=len(tampered)
        with self.assertRaisesRegex(ValueError,"provenance"):
            m.verify_release(self.release,tampered)


if __name__=="__main__":
    unittest.main(verbosity=2)
