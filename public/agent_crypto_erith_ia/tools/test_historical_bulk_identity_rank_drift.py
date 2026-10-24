#!/usr/bin/env python3
"""Dated market-cap rank changes must not reassign or invalidate Spot identities."""
import copy
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
import import_historical_bulk as bulk

VENUE = bulk.VENUE_AUDIT
LEDGER = bulk.IDENTITY_LEDGER

class VerifiedHistoricalIdentity(unittest.TestCase):
    def study(self,change=None):
        venue=json.loads(VENUE.read_text(encoding="utf-8"))
        ledger=json.loads(LEDGER.read_text(encoding="utf-8"))
        # Keep every authentic candidate. Only alter controlled fixtures.
        if change: change(venue,ledger)
        with TemporaryDirectory() as d:
            v=Path(d)/"venue.json"
            l=Path(d)/"ledger.json"
            v.write_text(json.dumps(venue))
            l.write_text(json.dumps(ledger))
            return bulk.confirmed_additions(v,l)

    def test_real_gram_rank_drift_keeps_coingecko_id_and_exchange_pair(self):
        additions=self.study()
        gram=next(x for x in additions if x["id"]=="the-open-network")
        venue=json.loads(VENUE.read_text())
        historical=next(x for x in venue["assets"] if x["id"]=="the-open-network")
        self.assertEqual(gram["rank"], historical["rank"])
        self.assertEqual(gram["symbol"], "GRAM")
        self.assertEqual(gram["pair"], "GRAMUSDT")

    def test_stale_ranked_universe_approval_is_excluded_not_reassigned(self):
        venue=json.loads(VENUE.read_text())
        out=self.study()
        ids={x["id"] for x in out}
        self.assertNotIn("superfarm", ids)
        self.assertNotIn("orca", ids)
        self.assertNotIn("golem", ids)
        self.assertTrue(ids.issubset({x["id"] for x in venue["assets"]}))

    def test_historical_approval_outside_dated_top250_is_preserved_not_counted(self):
        baseline=self.study()
        def add_old_proof(venue,ledger):
            stale=copy.deepcopy(next(x for x in ledger["results"]
                                    if x["status"]=="approved_coingecko_binance_spot"))
            stale["id"]="no-longer-ranked-historical-id"
            ledger["results"].append(stale)
            # The current-universe counts do not change for an old ID.
        self.assertEqual(self.study(add_old_proof), baseline)

    def test_active_top250_ledger_counter_is_still_strict(self):
        def invalidate(venue,ledger):
            ledger["checked_count"]-=1
        with self.assertRaisesRegex(ValueError,"Corrupt current Top250 identity provenance"):
            self.study(invalidate)

    def test_repeated_approved_id_is_blocked(self):
        def tamper(venue,ledger):
            evidence=next(x for x in ledger["results"]
                          if x["id"]=="the-open-network")
            ledger["results"].append(copy.deepcopy(evidence))
            ledger["checked_count"]+=1
        with self.assertRaisesRegex(ValueError,"Repeated approved CoinGecko ID"):
            self.study(tamper)

    def test_foreign_symbol_cannot_claim_gram_approved_source(self):
        def tamper(venue,ledger):
            row=next(x for x in ledger["results"] if x["id"]=="the-open-network")
            row["symbol"]="TON"
        with self.assertRaisesRegex(ValueError,"Identity approval inconsistent"):
            self.study(tamper)

    def test_wrong_binance_pair_cannot_claim_gram_coin_id(self):
        def tamper(venue,ledger):
            row=next(x for x in ledger["results"] if x["id"]=="the-open-network")
            row["pair"]="TONUSDT"
        with self.assertRaisesRegex(ValueError,"Identity approval inconsistent"):
            self.study(tamper)

    def test_false_native_coingecko_id_still_rejected(self):
        def tamper(venue,ledger):
            row=next(x for x in ledger["results"] if x["id"]=="the-open-network")
            row["evidence"][0]["coin_id"]="another-coin"
        with self.assertRaisesRegex(ValueError,"Identity approval inconsistent"):
            self.study(tamper)

if __name__=="__main__":
    unittest.main()
