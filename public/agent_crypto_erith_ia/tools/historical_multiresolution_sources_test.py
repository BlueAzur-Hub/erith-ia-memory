#!/usr/bin/env python3
"""Fail-closed regression of multi-resolution records and native-minute separation."""
import copy
import json
import unittest

import verify_historical_multiresolution_sources as m

class MultiResolutionRegistryTests(unittest.TestCase):
    def source(self):
        return json.loads(m.REGISTRY.read_text()), json.loads(m.FED.read_text())

    def test_source_registry_grows_without_miscounting_native_minutes(self):
        x,c=self.source()
        verified=m.check_registry(x,c)
        self.assertGreaterEqual(len(verified),29)
        self.assertGreaterEqual(sum(a["native_candles"] for a in verified),21876)
        self.assertEqual(x["native_1m_added"],0)
        self.assertEqual(len({(a["id"],a["bar"]) for a in verified}),len(verified))

    def test_original_bitget_daily_timezone_and_real_gaps_are_not_fabricated(self):
        x,c=self.source()
        bitget=[a for a in x["assets"] if a["venue"]=="Bitget Spot"]
        self.assertGreaterEqual(len(bitget),13)
        self.assertGreaterEqual(sum(a["native_candles"] for a in bitget),7248)
        self.assertTrue(all(a["bar"]=="1D" and
                 a["native_session_start_modulo_utc_day_ms"]==57600000
                 and a["gaps_within_observed_span"]>=0 for a in bitget))
        for field,value in (("native_session_start_modulo_utc_day_ms",0),
                            ("gaps_within_observed_span",-1),
                            ("market","GHOSTUSDT"),("bar","1Dutc")):
            bad=copy.deepcopy(x)
            target=next(a for a in bad["assets"] if a["venue"]=="Bitget Spot")
            target[field]=value
            with self.subTest(field=field),self.assertRaises(ValueError):
                m.check_registry(bad,c)

    def test_named_bitget_source_proof_requires_original_project_notice(self):
        x,c=self.source()
        named=next(a for a in x["assets"]
                   if a.get("source_attestation")=="original-named-spot-listing")
        self.assertIn("/support/articles/",named["identity_evidence"])
        self.assertEqual(len([a for a in x["assets"]
             if a.get("source_attestation")=="original-named-spot-listing"]),6)
        for field,value in (("source_attestation","unproven"),
                            ("identity_evidence","https://example.net/fake"),
                            ("identity_evidence","https://www.bitget.com/price/BTC"),
                            ("instrument_evidence","https://example.net/instrument")):
            bad=copy.deepcopy(x)
            entry=next(a for a in bad["assets"]
                       if a.get("source_attestation")=="original-named-spot-listing")
            entry[field]=value
            with self.subTest(field=field),self.assertRaises(ValueError):
                m.check_registry(bad,c)

    def test_published_usdgo_and_vision_preserve_original_gaps_and_release_digests(self):
        x,c=self.source()
        m.check_registry(x,c)
        refs={a["id"]:a for a in x["assets"]}
        for cid,rank,symbol,candles,gaps,first,sha in (
            ("usdgo",69,"USDGO",209,2,1772553600000,
             "ecfb9b68ccea047ec1a4d05f1eeb200a91fbb1f0ee03bfbc20efb1ec5bba1196"),
            ("vision-3",209,"VSN",290,3,1765468800000,
             "89df11525a3585450450c73d5bfe8117f1945ec5601adce787b0f4e0784bca65")
        ):
            a=refs[cid]
            with self.subTest(cid=cid):
                self.assertEqual((a["rank"],a["symbol"]), (rank,symbol))
                self.assertEqual(a["native_candles"],candles)
                self.assertEqual(a["gaps_within_observed_span"],gaps)
                self.assertEqual(a["earliest_source_ms"],first)
                self.assertEqual(a["latest_source_ms"],1790697600000)
                self.assertEqual(a["sha256"],sha)
                self.assertEqual(a["quote"],"USDT")
                self.assertEqual(a["bar"],"1D")
                self.assertEqual(a["source_attestation"],"original-named-spot-listing")
                self.assertEqual(a["release_tag"],
                    "crypto-bitget-spot-native-daily-2026-09-usdgo-vision")
        # The same 1m month may already exist; never count its owner twice.
        self.assertGreater(c["assets"][68]["native_1m_count"],0)
        self.assertEqual(c["assets"][208]["id"],"vision-3")

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
        for field,value in (("sha256","0"*63),("filename","../evil.gz"),
                            ("release_tag","../../bad"),("bytes",9999999),
                            ("market","USDG-USD")):
            x,c=self.source()
            x["assets"][0][field]=value
            with self.subTest(field=field),self.assertRaises(ValueError):
                m.check_registry(x,c)

if __name__=="__main__":unittest.main(verbosity=2)
