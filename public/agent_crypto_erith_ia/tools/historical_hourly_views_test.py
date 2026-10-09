#!/usr/bin/env python3
"""Regression tests: source-specific hourly history, gaps, true continuous year."""
import json
import tempfile
import unittest
from pathlib import Path
import build_historical_hourly_views as h
import import_historical_bulk as bulk
import build_historical_shared_views as s

class HourlyTests(unittest.TestCase):
 def catalog(self):return json.loads(h.CATALOG.read_text())
 def test_contiguous_suffix_never_crosses_a_missing_month(self):
  x={"months":[{"month":m} for m in
       ("2025-10","2025-11","2026-01","2026-02","2026-03")]}
  self.assertEqual([m["month"] for m in h.contiguous_suffix(x)],
                   ["2026-01","2026-02","2026-03"])
  self.assertEqual(h.contiguous_suffix({"months":[]}),[])
  with self.assertRaisesRegex(ValueError,"Duplicate"):
   h.contiguous_suffix({"months":[{"month":"2026-03"},{"month":"2026-03"}]})
 def test_real_top250_registry_yields_no_fake_assets(self):
  catalog=self.catalog()
  jobs=h.select(catalog)
  self.assertEqual(len(jobs),catalog["archived_assets"])
  self.assertEqual(len(jobs),33)
  self.assertTrue(all(1<=len(months)<=12 for _,months in jobs))
  self.assertTrue(all(x["id"]==m["id"] and x["pair"]==m["pair"]
    for x,months in jobs for m in months))
  self.assertTrue(any("bulk-add-" in month["release"]
    for _,months in jobs for month in months))
  self.assertGreater(sum(len(months) for _,months in jobs),250)
 def test_aggregate_two_real_calendar_month_shapes_without_fabrication(self):
  asset={"id":"bitcoin","pair":"BTCUSDT"}
  inputs=[]
  for month in ("2026-08","2026-09"):
   start,count,_=bulk.bounds(month,"1m")
   minute=[[start+n*60000,2.,3.,1.,2.5,0.5,2.0,2]
           for n in range(count)]
   inputs.append(({"id":"bitcoin","pair":"BTCUSDT","month":month,
        "release":"crypto-spot-bulk-"+month+"-1m",
        "sha256":"a"*64},minute))
  o=h.from_rows(asset,inputs)
  self.assertEqual(len(o["source_months"]),2)
  self.assertEqual(len(o["series"]),(31+30)*24)
  self.assertEqual(o["native_1m_count"],(31+30)*1440)
  self.assertEqual(o["series"][0][5:], [30.,120.,120])
  self.assertEqual(o["series"][-1][0],bulk.bounds("2026-09","1m")[2]-3600000)
  self.assertFalse(o["max_is_all_time"])
  disrupted=list(inputs)
  disrupted[1]=(disrupted[1][0],disrupted[1][1][1:])
  with self.assertRaisesRegex(ValueError,"Discontinuous"):
   h.from_rows(asset,disrupted)
 def test_hash_and_stable_single_file_per_asset(self):
  obj={"id":"bitcoin","rank":1,"name":"Bitcoin","symbol":"BTC",
    "pair":"BTCUSDT","months":2,"first_month":"2026-08",
    "last_month":"2026-09","first_open_ms":0,"last_open_ms":10,
    "native_1m_count":1,"hourly_count":1,
    "first_source_release":"crypto-spot-bulk-2026-08-1m",
    "last_source_release":"crypto-spot-bulk-2026-09-1m"}
  binary=s.pack({"data":"verified-hourly-test"})
  obj.update({"file":"bitcoin-hourly.json.gz","bytes":len(binary),
              "sha256":s.digest(binary)})
  with tempfile.TemporaryDirectory() as td:
   index=h.emit([(obj["file"],binary,obj)],td)
   self.assertEqual(index["archived_assets"],1)
   self.assertEqual(s.digest((Path(td)/obj["file"]).read_bytes()),obj["sha256"])

if __name__=="__main__":
 unittest.main(verbosity=2)
