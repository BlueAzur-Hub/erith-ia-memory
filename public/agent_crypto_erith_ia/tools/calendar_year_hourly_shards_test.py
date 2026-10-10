#!/usr/bin/env python3
"""Annual native hourly projections: no 12-month truncation, no gaps or invented first trades."""
import copy
import json
from pathlib import Path
import tempfile
import unittest
from unittest import mock

import build_calendar_year_hourly_shards as m
import build_historical_year_depth as depth

class CalendarYearShardTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.catalog=json.loads(m.CATALOG.read_text())
        cls.infos={a["id"]:a for a,_ in m.candidates(cls.catalog)}
        cls.assets={a["id"]:a for a in cls.catalog["assets"]}

    def test_btc_spans_all_26_verified_months_by_calendar_year(self):
        info=self.infos["bitcoin"]
        src=self.assets["bitcoin"]
        groups=m.annual_groups(info,src)
        self.assertEqual(len(groups),3)
        self.assertEqual([x["year"] for x in groups],[2024,2025,2026])
        self.assertEqual([len(x["source_months"]) for x in groups],[5,12,9])
        self.assertEqual(sum(len(g["source_months"]) for g in groups),26)
        self.assertEqual(info["first_verified_closed_month"],"2024-08")
        self.assertEqual(info["last_verified_closed_month"],"2026-09")
        self.assertTrue(all(g["span"]==0 for g in groups))
        self.assertEqual(len(m.signature(src)),64)

    def test_native_verified_hours_no_synthetic_ticks(self):
        src=self.assets["bitcoin"]
        group=m.annual_groups(self.infos["bitcoin"],src)[-1]
        one={"year":group["year"],"span":group["span"],
             "source_months":[group["source_months"][0]]}
        first,count,_=m.shared.bulk.bounds(one["source_months"][0]["month"],"1m")
        rows=[[first+i*60000,10.0,12.0,9.0,11.0,3.0,33.0,2]
              for i in range(count)]
        with mock.patch.object(m.shared,"source_folder",return_value=Path("/tmp/fixture")), (
             mock.patch.object(m.shared,"source_record",return_value=rows)):
            out=m.aggregate_group(src,one,Path("/tmp/fixture"))
        self.assertEqual(out["native_1m_count"],count)
        self.assertEqual(len(out["series"]),count//60)
        self.assertEqual(out["source_months"][0]["source_zip_sha256"],
                         one["source_months"][0]["sha256"])
        self.assertFalse(out["first_trade_date_known"])
        self.assertFalse(out["token_creation_date_known"])
        self.assertEqual(out["quote"],"USDT")
        self.assertEqual(out["series"][0][5],180)

    def test_gap_does_not_merge_two_annual_source_runs(self):
        row=copy.deepcopy(self.assets["bitcoin"])
        row["months"]=[x for x in row["months"]
                       if x["month"] in ("2025-01","2025-03")]
        row["candles"]=sum(x["candles"] for x in row["months"])
        mock_catalog=copy.deepcopy(self.catalog)
        replaced=next(x for x in mock_catalog["assets"] if x["id"]=="bitcoin")
        replaced.update(row)
        mock_catalog["native_1m_candles"]=sum(a["candles"] for a in mock_catalog["assets"])
        info=next(x for x in depth.build(mock_catalog)["assets"] if x["id"]=="bitcoin")
        self.assertEqual(info["longest_contiguous_months"],1)
        groups=m.annual_groups(info,row)
        self.assertEqual(len(groups),2)
        self.assertNotEqual(groups[0]["span"],groups[1]["span"])

    def test_existing_shard_requires_matching_sha_and_source_signature(self):
        row=self.assets["bitcoin"]
        with tempfile.TemporaryDirectory() as td:
            folder=Path(td)
            name="bitcoin-2024-span0.json.gz"
            raw=b"verified locally derived gzip bytes"
            (folder/name).write_bytes(raw)
            old={"schema":m.INDEX_SCHEMA,"assets":[{
                "id":"bitcoin","rank":1,
                "source_signature":m.signature(row),
                "shards":[{"file":name,"sha256":m.shared.digest(raw)}]}]}
            present=m.verify_existing(old,folder,self.catalog)
            self.assertIn("bitcoin",present)
            old["assets"][0]["shards"][0]["sha256"]="0"*64
            self.assertNotIn("bitcoin",m.verify_existing(old,folder,self.catalog))
            old["assets"][0]["shards"][0]["sha256"]=m.shared.digest(raw)
            old["assets"][0]["source_signature"]="0"*64
            self.assertNotIn("bitcoin",m.verify_existing(old,folder,self.catalog))

    def test_batch_limits_reject_unbounded_backfill(self):
        with tempfile.TemporaryDirectory() as td:
            with self.assertRaisesRegex(ValueError,"Unsafe daily"):
                m.build(self.catalog,Path(td),limit=300,workers=2)
        first=m.candidates(self.catalog)
        self.assertGreaterEqual(len(first),25)
        self.assertEqual(len({x["id"] for _,x in first}),len(first))

if __name__=="__main__":
    unittest.main(verbosity=2)
