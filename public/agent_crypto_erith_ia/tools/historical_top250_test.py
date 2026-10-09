#!/usr/bin/env python3
"""Offline Top250 venue qualification regression tests (no live API needed)."""
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import probe_historical_top250 as m

def samples():
    coins=[{"id":"coin-"+str(i),"rank":i+1,"name":"Coin "+str(i),
            "symbol":"T"+str(i)} for i in range(250)]
    coins[0].update(id="bitcoin",name="Bitcoin",symbol="BTC")
    coins[1].update(id="ethereum",name="Ethereum",symbol="ETH")
    coins[2].update(id="tether",name="Tether",symbol="USDT")
    coins[3].update(id="unverified",name="Unverified token",symbol="FAKE")
    coins[4].update(id="collision",name="Collision token",symbol="T5")
    return {"schema":"agent_crypto_public_market_snapshot_v1",
            "assets_count":250,"generated_at":"2026-10-09T17:00:00Z",
            "coins":coins}

def venue():
    symbols=[]
    for symbol in ["BTC","ETH","FAKE","T5","T6","T7"]:
        symbols.append({"symbol":symbol+"USDT","baseAsset":symbol,
                        "quoteAsset":"USDT","status":"TRADING",
                        "isSpotTradingAllowed":True,"permissionSets":[["SPOT"]]})
    return {"symbols":symbols}

class ProbeTests(unittest.TestCase):
    def test_stages_approved_and_candidates_distinct(self):
        d=m.build(samples(),"a"*64,
                  {"bitcoin":{"pair":"BTCUSDT","source_owner":"legacy_r10"},
                   "ethereum":{"pair":"ETHUSDT","source_owner":"legacy_r10"}},venue(),
                  "2026-10-09T18:00:00Z")
        self.assertEqual(d["total_ranked"],250)
        self.assertEqual(d["approved_for_import"],2)
        self.assertEqual([s["top"] for s in d["stages"]],[50,100,250])
        self.assertEqual(d["stages"][0]["approved_current"],2)
        self.assertEqual(d["assets"][0]["status"],"approved_existing_archive")
        self.assertFalse(d["assets"][3]["can_import"])
        self.assertEqual(d["assets"][3]["status"],"spot_candidate_identity_unverified")
        self.assertEqual(d["assets"][2]["status"],"self_quote_not_tradable")
        self.assertEqual(d["assets"][4]["status"],"symbol_collision")
        self.assertEqual(d["assets"][5]["status"],"symbol_collision")

    def test_missing_venue_pair_never_marked_approved(self):
        d=m.build(samples(),"0"*64,{},{"symbols":[]},"fixed")
        self.assertEqual(d["approved_for_import"],0)
        self.assertEqual(d["assets"][0]["status"],"pair_absent")

    def test_existing_spot_archive_can_be_historical_but_not_current(self):
        d=m.build(samples(),"0"*64,{"bitcoin":{"pair":"BTCUSDT",
             "source_owner":"legacy_r10"}},{"symbols":[]},"fixed")
        self.assertEqual(d["assets"][0]["status"],"approved_archive_spot_not_current")
        self.assertFalse(d["assets"][0]["can_import"])

    def test_wrong_proven_identity_fails_closed(self):
        with self.assertRaisesRegex(ValueError,"conflicting ranked symbol"):
            m.build(samples(),"0"*64,
                    {"bitcoin":{"pair":"ETHUSDT","source_owner":"legacy_r10"}},venue(),"fixed")

    def test_250_unique_ranks_required_before_probe(self):
        d=samples()
        d["coins"][10]["rank"]=10
        with tempfile.TemporaryDirectory() as t:
            file=Path(t)/"bad.json";file.write_text(json.dumps(d))
            with self.assertRaisesRegex(ValueError,"Duplicate/ambiguous"):
                m.snapshot(file)

    def test_bounded_probe_is_file_only_and_idempotent(self):
        d=samples()
        with tempfile.TemporaryDirectory() as t:
            market=Path(t)/"market.json"
            out=Path(t)/"generated.json"
            market.write_text(json.dumps(d))
            approved={"bitcoin":{"pair":"BTCUSDT","source_owner":"legacy_r10"}}
            result=m.probe(out,market,approved,venue())
            self.assertEqual(result["total_ranked"],250)
            saved=json.loads(out.read_text())
            self.assertEqual(saved["assets"][0]["status"],"approved_existing_archive")
            self.assertEqual(saved["approved_for_import"],1)
            self.assertEqual(json.loads(market.read_text()),d)
            self.assertEqual(list(Path(t).glob("*.json")), [market,out])

    def test_symbol_spot_status_checks_require_real_permission(self):
        symbol={"symbol":"BTCUSDT","baseAsset":"BTC","quoteAsset":"USDT",
                "status":"TRADING","isSpotTradingAllowed":True,
                "permissionSets":[["SPOT","MARGIN"]]}
        self.assertTrue(m.is_spot(symbol))
        for k,v in [("status","HALT"),("isSpotTradingAllowed",False),
                    ("permissionSets",[["MARGIN"]])]:
            bad={**symbol,k:v}
            self.assertFalse(m.is_spot(bad))

if __name__=="__main__":
    unittest.main(verbosity=2)
