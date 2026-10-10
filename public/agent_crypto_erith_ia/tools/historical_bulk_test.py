#!/usr/bin/env python3
"""Offline multi-asset historical Binance month ZIP importer tests."""
import csv
import hashlib
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import zipfile
import import_historical_bulk as m

MONTH="2026-02"
INTERVAL="5m"
PAIRS=["BTCUSDT","DOGEUSDT","ADAUSDT"]
ASSETS=[{"id":x[:-4].lower(),"symbol":x[:-4],"pair":x,"rank":i+1,
         "archive_owner":"verified"} for i,x in enumerate(PAIRS)]

def build(pair,interval="5m",incomplete=False,gap=False,spoof=False,
          early_close=False,bad_close=False):
    begin,n,end=m.bounds(MONTH,interval)
    step=m.INTERVALS[interval]
    target=n-1 if incomplete else n
    s=io.StringIO(newline="")
    writer=csv.writer(s)
    for i in range(target):
        ts=begin+(i+(1 if gap and i==42 else 0))*step
        micro=ts*1000
        closing=(micro+step*1000//2 if early_close and i==42 else
                 (micro-1 if bad_close and i==42 else micro+step*1000-1))
        writer.writerow([micro,"10","12","9","11","25",closing,
                         "275","3","0","0","0"])
    b=io.BytesIO()
    name=f"{pair}-{interval}-{MONTH}.csv" if not spoof else "bitcoin-evil.csv"
    with zipfile.ZipFile(b,"w",compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr(name,s.getvalue())
    return b.getvalue()

def getter(mapping,bad_checksum=()):
    def go(url,cap=m.MAX_ZIP):
        target=url.split("/")[-1]
        pair=target.split("-")[0]
        if pair not in mapping:raise FileNotFoundError("404 source")
        binary=mapping[pair]
        if url.endswith(".CHECKSUM"):
            h=hashlib.sha256(binary).hexdigest()
            return (("0"*64 if pair in bad_checksum else h)+"  "+target).encode()
        return binary
    return go

class BulkTests(unittest.TestCase):
    def setUp(self):
        self.folder=tempfile.TemporaryDirectory()
        self.addCleanup(self.folder.cleanup)
        self.path=Path(self.folder.name)

    def test_six_pairs_month_plan_and_boundary(self):
        start,count,end=m.bounds(MONTH,INTERVAL)
        self.assertEqual(count,8064)
        self.assertEqual(end-start,28*86_400_000)
        self.assertTrue(start%86_400_000==0)
        with self.assertRaisesRegex(ValueError,"Invalid month"):
            m.bounds("../../secret","1m")
        with self.assertRaisesRegex(ValueError,"Unsafe Binance archive path"):
            m.url_for("../../evil","2026-02","1m")

    def test_multi_asset_parallel_full_month_and_checksum(self):
        z={pair:build(pair) for pair in PAIRS}
        result=m.execute(MONTH,INTERVAL,self.path,workers=3,limit=3,
                         assets=ASSETS,getter=getter(z))
        self.assertEqual(result["requested"],3)
        self.assertEqual(result["verified"],3)
        self.assertEqual(result["unavailable"],0)
        self.assertEqual(result["candles"],3*8064)
        self.assertEqual(len(list(self.path.glob("*.zip"))),3)
        self.assertEqual(json.loads((self.path/"manifest.json").read_text())["schema"],m.SCHEMA)
        self.assertEqual(set(x["status"] for x in result["assets"]),{"verified"})

    def test_missing_pair_does_not_block_others(self):
        z={p:build(p) for p in PAIRS[:2]}
        r=m.execute(MONTH,INTERVAL,self.path,workers=3,limit=3,
                    assets=ASSETS,getter=getter(z))
        self.assertEqual(r["verified"],2)
        self.assertEqual(r["unavailable"],1)
        self.assertIn("source",r["assets"][2]["reason"])
        self.assertEqual(r["candles"],2*8064)

    def test_checksum_mismatch_never_publishes_file(self):
        zipmap={PAIRS[0]:build(PAIRS[0])}
        r=m.execute(MONTH,INTERVAL,self.path,workers=1,limit=1,
                    assets=ASSETS,getter=getter(zipmap,{PAIRS[0]}))
        self.assertEqual(r["verified"],0)
        self.assertFalse(list(self.path.glob("*.zip")))

    def test_malformed_csv_path_and_gap_rejected(self):
        for raw in (build(PAIRS[0],gap=True),build(PAIRS[0],spoof=True),
                    build(PAIRS[0],incomplete=True)):
            with self.assertRaises(ValueError):
                m.check_csv(raw,PAIRS[0],MONTH,INTERVAL)

    def test_early_source_close_allowed_without_fabricating_missing_minutes(self):
        verified=m.check_csv(build(PAIRS[0],early_close=True),PAIRS[0],MONTH,INTERVAL)
        self.assertEqual(verified["candles"],8064)
        with self.assertRaisesRegex(ValueError,"closes outside"):
            m.check_csv(build(PAIRS[0],bad_close=True),PAIRS[0],MONTH,INTERVAL)

    def test_restart_immutable_asset_kept(self):
        zipmap={PAIRS[0]:build(PAIRS[0])}
        first=m.execute(MONTH,INTERVAL,self.path,workers=1,limit=1,
                        assets=ASSETS,getter=getter(zipmap))
        file=self.path/first["assets"][0]["file"]
        previous=file.read_bytes()
        second=m.execute(MONTH,INTERVAL,self.path,workers=1,limit=1,
                         assets=ASSETS,getter=getter(zipmap))
        self.assertEqual(second["verified"],1)
        self.assertEqual(file.read_bytes(),previous)
        zipmap[PAIRS[0]]=build(PAIRS[0],gap=True)
        r=m.execute(MONTH,INTERVAL,self.path,workers=1,limit=1,
                    assets=ASSETS,getter=getter(zipmap))
        self.assertEqual(r["verified"],0)
        self.assertEqual(file.read_bytes(),previous)

    def test_no_arbitrary_unqualified_250_without_registry(self):
        with self.assertRaisesRegex(ValueError,"Not enough verified"):
            m.execute(MONTH,INTERVAL,self.path,workers=2,limit=250,assets=ASSETS)
        with self.assertRaisesRegex(ValueError,"Unsafe worker"):
            m.execute(MONTH,INTERVAL,self.path,workers=50,limit=3,assets=ASSETS)

if __name__=="__main__":
    unittest.main(verbosity=2)
