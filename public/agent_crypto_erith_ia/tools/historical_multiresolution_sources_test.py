#!/usr/bin/env python3
"""Fail-closed regression of multi-resolution records and native-minute separation."""
import copy
import json
import unittest

import verify_historical_multiresolution_sources as m

class MultiResolutionRegistryTests(unittest.TestCase):
    def source(self):
        return json.loads(m.REGISTRY.read_text()), json.loads(m.FED.read_text())

    def test_original_5_unique_sources_and_zero_miscounted_minutes(self):
        x,c=self.source()
        verified=m.check_registry(x,c)
        self.assertEqual(len(verified),5)
        self.assertEqual(sum(a["native_candles"] for a in verified),8004)
        self.assertEqual(x["native_1m_added"],0)
        self.assertEqual(len({(a["id"],a["bar"]) for a in verified}),5)

    def test_reject_wrong_rank_coin_id_or_spurious_asset(self):
        for mode in ("wrong ID","wrong rank","duplicate"):
            x,c=self.source()
            x=copy.deepcopy(x)
            if mode=="wrong ID": x["assets"][0]["id"]="imaginary-dollar"
            if mode=="wrong rank": x["assets"][0]["rank"]=999
            if mode=="duplicate": x["assets"][1]["id"]=x["assets"][0]["id"]
            with self.subTest(mode=mode),self.assertRaises(ValueError):
                m.check_registry(x,c)

    def test_reject_minute_relabelling_and_fabricated_coverage(self):
        for key,val in (("native_bar","1m"),("native_1m_added",8004),
                        ("native_daily_candles",9000)):
            x,c=self.source()
            x[key]=val
            with self.subTest(key=key),self.assertRaises(ValueError):
                m.check_registry(x,c)
        x,c=self.source()
        x["assets"][0]["bar"]="1m"
        with self.assertRaises(ValueError):m.check_registry(x,c)
        x,c=self.source()
        x["assets"][0]["gaps_within_observed_span"]=14
        with self.assertRaises(ValueError):m.check_registry(x,c)

    def test_reject_checksum_and_path_mutation(self):
        for field,value in (("sha256","0"*64),("filename","../evil.gz"),
                            ("release_tag","../../bad"),("bytes",9999999),
                            ("market","USDG-USD")):
            x,c=self.source()
            x["assets"][0][field]=value
            with self.subTest(field=field),self.assertRaises(ValueError):
                m.check_registry(x,c)

if __name__=="__main__":unittest.main(verbosity=2)
