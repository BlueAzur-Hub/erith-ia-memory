#!/usr/bin/env python3
"""Future-only OKX quote collection; no network in tests."""
import copy
import datetime as dt
import json
import pathlib
import sys
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from observe_okx_hurdle_followups import collect, due

BASE = dt.datetime(2026, 10, 18, 10, 0, 30, tzinfo=dt.timezone.utc)
GOOD = {"instType": "SPOT", "instId": "TOK-USDT", "baseCcy": "TOK",
        "quoteCcy": "USDT", "state": "live", "minSz": "1",
        "lotSz": "0.01", "tickSz": "0.01"}


def journal():
    return {"schema": "erith.radar.okx.hurdle-followups.v1",
            "orders_enabled": False, "paper_fills": 0, "real_orders": 0,
            "backtest": False, "studies": [{
                "id": "tok|2026-10-18", "symbol": "TOK", "pair": "TOK-USDT",
                "coin_id": "tok", "quote": "USDT",
                "entry_book_at_utc": "2026-10-18T10:00:30Z",
                "status": "HYPOTHETICAL_COST_STUDY_NO_FILL",
                "executed_order": False, "orders_enabled": False,
                "contract_identity_proven": False, "followups": []}]}


class FutureQuoteTests(unittest.TestCase):
    def fetch(self, at):
        def source(url):
            if "/public/instruments" in url:
                return {"code": "0", "data": [GOOD]}
            if "/market/books" in url:
                return {"code": "0", "data": [{
                    "ts": str(int(at.timestamp()*1000)-1000),
                    "bids": [["9.90", "30"]], "asks": [["10.00", "30"]]}]}
            raise AssertionError("Unexpected endpoint: " + url)
        return source

    def test_collects_24h_for_pair_not_in_next_day_top20(self):
        at = BASE+dt.timedelta(hours=24)
        found = collect(journal(), self.fetch(at), at)
        self.assertEqual(found["due_pairs"], 1)
        self.assertEqual(found["unavailable_pairs"], 0)
        self.assertEqual(len(found["candidates"]), 1)
        row = found["candidates"][0]
        self.assertEqual(row["id"], "tok")
        self.assertEqual(row["okx_spot"]["pair"], "TOK-USDT")
        self.assertEqual(row["okx_spot"]["rules"]["min_sz"], "1")
        self.assertEqual(row["okx_spot"]["best_book"]["best_bid_usdt"], "9.90")
        self.assertFalse(row["okx_spot"]["real_orders_enabled"])

    def test_independent_48h_when_24h_already_stored(self):
        existing = journal()
        existing["studies"][0]["followups"] = [{"window": "24h"}]
        at = BASE+dt.timedelta(hours=48)
        found = collect(existing, self.fetch(at), at)
        self.assertEqual(found["due_pairs"], 1)
        self.assertEqual(len(found["candidates"]), 1)

    def test_no_due_is_zero_network_requests_and_missing_journal_is_empty(self):
        def blocked(_):
            raise AssertionError("Network forbidden")
        at = BASE+dt.timedelta(hours=5)
        self.assertEqual(collect(journal(), blocked, at)["due_pairs"], 0)
        self.assertEqual(collect(None, blocked, at)["candidates"], [])

    def test_future_and_stale_slices_do_not_create_entries(self):
        for hours in (-1, 12, 37, 61, 400):
            self.assertEqual(due(journal(), BASE+dt.timedelta(hours=hours)), {})
        latest = journal()
        latest["studies"][0]["followups"] = [{"window": "24h"}, {"window": "48h"}]
        self.assertEqual(due(latest, BASE+dt.timedelta(hours=48)), {})

    def test_no_futures_suspended_duplicate_or_invalid_native_rules(self):
        at = BASE+dt.timedelta(hours=24)
        for rows in (
            [{**GOOD, "instType": "SWAP"}], [{**GOOD, "state": "suspend"}],
            [GOOD, GOOD], [{**GOOD, "minSz": "0"}], []
        ):
            def invalid(url):
                if "/public/instruments" in url:
                    return {"code": "0", "data": rows}
                raise AssertionError("No book request expected")
            result = collect(journal(), invalid, at)
            self.assertEqual(result["candidates"], [])
            self.assertEqual(result["unavailable_pairs"], 1)

    def test_symbol_collision_and_invalid_studies_block_observer(self):
        s = journal()["studies"][0]
        conflicting = copy.deepcopy(s)
        conflicting["id"] = "another|2026-10-18"
        conflicting["coin_id"] = "another"
        bad = journal()
        bad["studies"].append(conflicting)
        with self.assertRaises(ValueError):
            due(bad, BASE+dt.timedelta(hours=24))
        bad = journal()
        bad["studies"][0]["executed_order"] = True
        with self.assertRaises(ValueError):
            due(bad, BASE+dt.timedelta(hours=24))

    def test_external_data_malformed_never_certifies_a_book(self):
        at = BASE+dt.timedelta(hours=24)
        def invalid(url):
            if "/public/instruments" in url:
                return {"code": "0", "data": [GOOD]}
            return {"code": "0", "data": [{
                "ts": str(int(at.timestamp()*1000)-200000),
                "bids": [["9.90", "30"]], "asks": [["10.00", "30"]]}]}
        found = collect(journal(), invalid, at)
        self.assertEqual(found["unavailable_pairs"], 1)
        self.assertEqual(found["candidates"], [])

if __name__ == "__main__":
    unittest.main()
