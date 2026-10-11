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

    def test_eight_original_gate_kucoin_venues_with_immutable_hashes_and_gaps(self):
        registry,catalog=self.source()
        approved=m.check_registry(registry,catalog)
        alternative=[a for a in approved
                     if a.get("release_tag")=="crypto-gate-kucoin-spot-native-daily-2026-09-370f70bb12a5"]
        self.assertEqual(len(alternative),8)
        self.assertEqual(sum(a["native_candles"] for a in alternative),10034)
        self.assertGreaterEqual(len(approved),52)
        self.assertGreaterEqual(registry["native_daily_candles"],50717)
        known={a["id"] for a in approved}
        self.assertEqual(len(known),len(approved))
        self.assertEqual({a["id"] for a in alternative},{
            "rain","ondo-us-dollar-yield","mantle","usdd",
            "gatechain-token","kucoin-shares","akedo","derive"})
        kucoin=next(a for a in alternative if a["id"]=="kucoin-shares")
        self.assertEqual(kucoin["gaps_within_observed_span"],78)
        self.assertEqual(kucoin["native_candles"],3187)
        self.assertTrue(all(a["quote"]=="USDT" and a["bar"]=="1D"
                        and a["source_attestation"]=="verified-original-spot-owner"
                        and a["native_session_start_modulo_utc_day_ms"]==0
                        for a in alternative))
        for name,value in (
            ("source_attestation","unverified"),
            ("original_source_api","https://example.invalid/api"),
            ("instrument_evidence","https://not-a-spot-market.test"),
            ("market","DUMMY_USDT"),
            ("sha256","0"*63),
            ("gaps_within_observed_span",0),
        ):
            changed=copy.deepcopy(registry)
            bad=next(a for a in changed["assets"]
                     if a["id"]=="kucoin-shares")
            bad[name]=value
            with self.subTest(name=name),self.assertRaises(ValueError):
                m.check_registry(changed,catalog)

    def test_two_additional_immutable_gate_kucoin_cohorts_have_original_native_rows(self):
        registry,minute=self.source()
        approved=m.check_registry(registry,minute)
        expected={
            "pieverse":(132,321,"a4e5521fc4709c6cdb17ba10470f212b5fb0f330e60a72289790ec6acec078fa"),
            "unibase":(137,384,"7c1b19c41f33eddf0da25a3acc541f13380f01438d1d477bcc70c45f6f4858f6"),
            "spx6900":(138,662,"ce61e4ad928d1b94ca8ec13663384f61bdf6408454b57a28491aeca0f5487cde"),
            "ape-and-pepe":(149,680,"8848715fce175713e62d89bf7b04edd76223b13d54a64b8c3932851fbe982a4d"),
            "crvusd":(180,1141,"75029b49a2664dd0e436a6af3fc5f9c4385ce863140122c2d21f52f3cd1a75dd"),
            "useless-3":(194,447,"c307c1d7c6affb6e12b703b591078bf4a94235837155e462cdb86025b451f2b3"),
            "origintrail":(197,885,"537228bfca087fce1544912b200ccf71867d76781a908c3d8a5f2aeb7cd6b9b6"),
            "chain-2":(208,1643,"44a084e83da8d5a69261e906884f99d8e99a96437d97fffef02fc150801bc86a"),
            "aioz-network":(227,2003,"66e5b5a3bae444763fc087d47dd415f2fa6a8d7cfc1d752a1a8eb2ea7bf202b8"),
            "geodnet":(233,828,"cc599ee105ae608f9b46d77ecc2a1f5c629966de9b30de70a7c4866f49cd3db1"),
            "stronghold-token":(241,1478,"f54058fdf4896929936e02a2c9e84d45abaa17dcde6854bb581bed983a1d11a5")
        }
        sources={a["id"]:a for a in approved}
        minute_ids={a["id"] for a in minute["assets"] if a["native_1m_count"]>0}
        self.assertFalse(set(expected) & minute_ids)
        self.assertGreaterEqual(len(set(sources)|minute_ids),193)
        self.assertEqual(sum(bars for _,bars,_ in expected.values()),10472)
        for cid,(rank,bars,sha) in expected.items():
            with self.subTest(cid=cid):
                a=sources[cid]
                self.assertEqual(a["rank"],rank)
                self.assertEqual(a["native_candles"],bars)
                self.assertEqual(a["sha256"],sha)
                self.assertEqual(a["gaps_within_observed_span"],0)
                self.assertEqual(a["venue"],"Gate Spot")
                self.assertEqual(a["bar"],"1D")
                self.assertEqual(a["quote"],"USDT")
                self.assertIn(a["release_tag"],(
                    "crypto-gate-kucoin-spot-native-daily-2026-09-edfaafab1819",
                    "crypto-gate-kucoin-spot-native-daily-2026-09-8e71573a011c"))
                self.assertEqual(a["source_attestation"],"verified-original-spot-owner")
                self.assertIn("top250-alt-market-evidence.json#",a["identity_evidence"])

    def test_original_xdc_beldex_akash_immutable_daily_cohort(self):
        registry,minute=self.source()
        checked=m.check_registry(registry,minute)
        rows={a["id"]:a for a in checked}
        actual={
            "xdce-crowd-sale":(92,"XDC","KuCoin Spot","XDC-USDT",
                1973,1620345600000,
                "e31031f3528a8e55d610b03ab82c5531408877f5f2f1843069fcfbc1e7cd32d2"),
            "beldex":(106,"BDX","Gate Spot","BDX_USDT",
                1505,1660780800000,
                "8a397789c7d616be2746c36d361282ea734811acafdc362ed1afbb19d2baa368"),
            "akash-network":(178,"AKT","Gate Spot","AKT_USDT",
                2029,1615507200000,
                "9c0e6b5c45ebd24df0c299c12795a7e4ca6196252d70fa0696e96f66ea3c5dc1")
        }
        for cid,(rank,symbol,venue,pair,bars,first,digest) in actual.items():
            with self.subTest(cid=cid):
                a=rows[cid]
                self.assertEqual((a["rank"],a["symbol"],a["venue"],a["market"]),
                                 (rank,symbol,venue,pair))
                self.assertEqual((a["native_candles"],
                                  a["gaps_within_observed_span"]), (bars,0))
                self.assertEqual(a["earliest_source_ms"],first)
                self.assertEqual(a["latest_source_ms"],1790726400000)
                self.assertEqual(a["bar"],"1D")
                self.assertEqual(a["quote"],"USDT")
                self.assertEqual(a["sha256"],digest)
                self.assertEqual(a["source_attestation"],
                                 "verified-original-spot-owner")
                self.assertEqual(a["release_tag"],
                    "crypto-gate-kucoin-spot-native-daily-2026-09-dcb93d4569f4")
                self.assertNotIn(cid,{x["id"] for x in minute["assets"]
                                     if x["native_1m_count"]>0})
        self.assertEqual(sum(v[4] for v in actual.values()),5507)
        self.assertEqual(len(checked),52)
        self.assertEqual(registry["native_daily_candles"],50717)

    def test_refuse_forged_xdc_contract_owner_and_native_quote(self):
        index,catalog=self.source()
        for field,forged in (
            ("rank",999),("symbol","NOTXDC"),("quote","USD"),
            ("market","XDC-USDC"),("sha256","0"*64),
            ("source_attestation","unchecked"),
            ("gaps_within_observed_span",1),
            ("identity_evidence","https://example.invalid/identity"),
            ("original_source_api","https://example.invalid/ohlcv")
        ):
            changed=copy.deepcopy(index)
            row=next(a for a in changed["assets"] if a["id"]=="xdce-crowd-sale")
            row[field]=forged
            with self.subTest(field=field),self.assertRaises(ValueError):
                m.check_registry(changed,catalog)

    def test_tether_has_genuine_kucoin_usdc_not_usd_daily_archive(self):
        registry,minute=self.source()
        assets=m.check_registry(registry,minute)
        tether=next(a for a in assets if a["id"]=="tether")
        self.assertEqual(registry["quote"],"mixed-native-USDT-USDC")
        self.assertEqual((tether["rank"],tether["name"],tether["symbol"]),
                         (3,"Tether","USDT"))
        self.assertEqual((tether["venue"],tether["market"],tether["quote"]),
                         ("KuCoin Spot","USDT-USDC","USDC"))
        self.assertEqual((tether["bar"],tether["native_candles"],
                          tether["gaps_within_observed_span"]),
                         ("1D",2828,71))
        self.assertEqual(tether["earliest_source_ms"],1540339200000)
        self.assertEqual(tether["latest_source_ms"],1790726400000)
        self.assertEqual(tether["filename"],"tether-USDT-USDC-1D.json.gz")
        self.assertEqual(tether["sha256"],
            "7110d3bcd6bcf7033cdf0f0b3584e72da3fbf92ef5ef004603a29cf9883a88ad")
        self.assertEqual(tether["release_tag"],
            "crypto-gate-kucoin-spot-native-daily-2026-09-170e06b173cd")
        self.assertNotEqual(tether["quote"],"USD")
        for mutation,value in (
            ("quote","USD"),("quote","USDT"),("market","USDT-USD"),
            ("market","USDT-USDT"),("source_attestation","false"),
            ("gaps_within_observed_span",0),("sha256","f"*63)
        ):
            modified=copy.deepcopy(registry)
            next(a for a in modified["assets"] if a["id"]=="tether")[mutation]=value
            with self.subTest(mutation=mutation),self.assertRaises(ValueError):
                m.check_registry(modified,minute)
        for top in ("USDT","USDC","USD"):
            changed=copy.deepcopy(registry)
            changed["quote"]=top
            with self.subTest(global_quote=top),self.assertRaises(ValueError):
                m.check_registry(changed,minute)

    def test_original_kucoin_quote_proof_checks_source_payload_not_just_filename(self):
        from verify_native_alt_spot_daily import check_payload
        registry,_=self.source()
        indexed=copy.deepcopy(next(a for a in registry["assets"] if a["id"]=="tether"))
        stamp=1790726400000
        indexed["earliest_source_ms"]=stamp
        indexed["latest_source_ms"]=stamp
        indexed["native_candles"]=1
        indexed["gaps_within_observed_span"]=0
        original=[str(stamp//1000),"0.9999","1.0000",
                  "1.0001","0.9998","3.0","3.1"]
        proof={"coin_id":"tether","exchange":"kucoin","base":"USDT",
               "quote":"USDC","market_pair_candidate":"USDT-USDC",
               "proof_method":"exact_coin_id_matching_evm_contract",
               "contract_platform":"ethereum",
               "contract_address":"0xdac17f958d2ee523a2206206994597c13d831ec7"}
        owner={"id":"tether","rank":3,"symbol":"USDT","name":"Tether",
               "venue":"kucoin","pair":"USDT-USDC","quote":"USDC",
               "identity_proof":proof}
        source={"schema":"aerith.original-spot-native-daily.verified-source.v1",
                "owner":owner,"venue":"kucoin",
                "source_api":"https://api.kucoin.com/api/v1/market/candles",
                "original_quote":"USDC","native_interval":"1D",
                "market":"USDT-USDC","no_synthetic_candles":True,
                "no_currency_conversion":True,"queried_all_bounded_windows":True,
                "genesis_or_first_trade_proven":False,"native_candles":1,
                "native_daily_rows":[original],"earliest_returned_ms":stamp,
                "latest_returned_ms":stamp,"calendar_days_without_source_bars":0,
                "source_response_sha256":["a"*64],
                "source_response_hashes_exchange_signed":False}
        result=check_payload(source,indexed,"https://github.com/source")
        self.assertEqual(result["native_daily_candles"],1)
        for field,value in (
            ("original_quote","USD"),("original_quote","USDT"),
            ("market","USDT-USD"),("native_interval","1m")):
            incorrect=copy.deepcopy(source)
            incorrect[field]=value
            with self.subTest(field=field),self.assertRaises(ValueError):
                check_payload(incorrect,indexed,"https://github.com/source")
        bad=copy.deepcopy(source)
        bad["owner"]["identity_proof"]["quote"]="USD"
        with self.assertRaises(ValueError):
            check_payload(bad,indexed,"https://github.com/source")

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
