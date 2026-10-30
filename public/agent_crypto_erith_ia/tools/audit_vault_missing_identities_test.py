#!/usr/bin/env python3
"""Negative tests prevent candidate instruments from becoming fake source assets."""
import copy
import hashlib
import json
import unittest

import audit_vault_missing_identities as audit
from audit_vault_source_union_test import fixture


def evidence():
    return (
        {"schema": "aerith.public.ohlcv.spot.discovery.top250.v1",
         "total_ranked": 250, "assets": [{"id": "coin-3", "status": "pair_absent"}]},
        {"schema": "aerith.public.ohlcv.spot.coingecko-binance-identity-evidence.v1",
         "results": [{"id": "coin-4", "status": "identity_not_confirmed"}]},
        {"schema": "aerith.public.ohlcv.spot.top250.alt-market-discovery.v1",
         "results": [{"id": "coin-3", "symbol": "X3",
                      "status": "exact_id_market_candidates",
                      "markets": [{"coin_id": "coin-3", "exchange": "gate"}]}]},
        {"schema": "aerith.public.ohlcv.spot.top250.official-instrument-candidates.v1",
         "assets": [{"id": "coin-3", "symbol": "X3",
                     "status": "instrument_candidates_not_identity_proof",
                     "instruments": [{"venue": "gate", "base": "X3", "quote": "USDT",
                                      "instrument": "X3_USDT",
                                      "coin_id_confirmed": False,
                                      "exchange_instrument_confirmed": True}],
                     "coin_id_confirmed": False,
                     "native_1m_month_confirmed": False}]},
        {"schema": "seven.crypto.wbt.private-evidence.status.v1",
         "asset_id": "whitebit",
         "publication_status": "SUMMARY_METADATA_ONLY_SOURCE_CANDLES_NOT_PUBLISHED",
         "trader_imported": False}
    )


class MissingIdentityAuditTests(unittest.TestCase):
    def test_market_candidates_do_not_qualify_ohlcv(self):
        y,m,d=fixture()
        r=audit.reconcile(y,m,d,*evidence())
        x=next(v for v in r["records"] if v["id"] == "coin-3")
        self.assertEqual(x["category"], "spot_market_candidates_identity_unverified")
        self.assertFalse(x["automatic_collection_approved"])
        self.assertTrue(x["exact_coin_id_alt_market_candidate"])
        self.assertEqual(r["uncovered_identities"], 247)
        self.assertEqual(sum(r["categories"].values()), 247)
        self.assertFalse(any(q["public_minute_source_confirmed"] for q in r["records"]))

    def test_symbol_divergence_blocks_candidate_even_with_a_matching_id(self):
        y,m,d=fixture()
        source=list(evidence())
        source[3]["assets"][0]["symbol"]="OLD"
        r=audit.reconcile(y,m,d,*source)
        x=next(v for v in r["records"] if v["id"]=="coin-3")
        self.assertEqual(x["category"], "historical_symbol_divergence_review")
        self.assertEqual(x["previous_symbols_requiring_review"], ["OLD"])
        self.assertFalse(x["automatic_collection_approved"])

    def test_private_wbt_metadata_never_imported(self):
        y,m,d=fixture()
        y["assets"][5]["id"]="whitebit"
        m["assets"][5]["id"]="whitebit"
        r=audit.reconcile(y,m,d,*evidence())
        x=next(v for v in r["records"] if v["id"]=="whitebit")
        self.assertEqual(x["category"], "private_source_metadata_only")
        self.assertTrue(x["private_source_only"])
        self.assertFalse(x["automatic_collection_approved"])

    def test_duplicate_id_and_unknown_private_status_fail(self):
        y,m,d=fixture()
        ev=list(evidence())
        ev[0]["assets"].append(copy.deepcopy(ev[0]["assets"][0]))
        with self.assertRaisesRegex(ValueError, "Duplicate exact-ID"):
            audit.reconcile(y,m,d,*ev)
        ev=list(evidence())
        ev[4]["publication_status"]="PUBLIC"
        with self.assertRaisesRegex(ValueError, "rights boundary"):
            audit.reconcile(y,m,d,*ev)

    def test_real_records_preserve_provenance_and_no_source_writes(self):
        if not all((audit.ROOT / p).is_file()
                   for p in {**audit.source_union.SOURCES,**audit.ADDITIONAL}.values()):
            self.skipTest("Only runs inside complete repository checkout")
        before={}
        data={}
        for k,path in {**audit.source_union.SOURCES,**audit.ADDITIONAL}.items():
            raw=(audit.ROOT/path).read_bytes()
            before[k]=hashlib.sha256(raw).hexdigest()
            data[k]=json.loads(raw)
        r=audit.reconcile(data["binance_year"],data["minute"],data["daily"],
                          data["venue"],data["identity"],data["alternative"],
                          data["official"],data["private"])
        self.assertEqual(r["uncovered_identities"],
                         r["source_union_summary"]["no_indexed_1m_or_1d_asset_inside_top250"])
        self.assertFalse(any(x["automatic_collection_approved"] for x in r["records"]))
        found={x["id"]:x for x in r["records"]}
        if "whitebit" in found:
            self.assertEqual(found["whitebit"]["category"],
                             "private_source_metadata_only")
        if "pearl-2" in found:
            self.assertIn("PRL", found["pearl-2"]["previous_symbols_requiring_review"])
        self.assertEqual(before,{k:hashlib.sha256(
            (audit.ROOT/path).read_bytes()).hexdigest()
            for k,path in {**audit.source_union.SOURCES,**audit.ADDITIONAL}.items()})


if __name__ == "__main__":
    unittest.main(verbosity=2)
