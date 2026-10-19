#!/usr/bin/env python3
"""Synthetic contract checks for chronological Radar/Spot/PAPER audit."""
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

MODULE = Path(__file__).with_name("radar_spot_paper_audit.py")
spec = importlib.util.spec_from_file_location("radar_audit", MODULE)
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


def signal(coin, price, stamp):
    return {"id": coin, "symbol": "Q" if coin == "quack-ai" else "BR",
            "name": coin, "priceUsd": price, "sourceSnapshot": stamp}


def day(day, candidates, tracked=()):
    return {"schema": "erith.radar.opportunity-observation.v1",
            "record_kind": "prospective_snapshot",
            "observed_date_utc": day, "orders_enabled": False,
            "simulation_only": True,
            "groups": {"momentum_24h_7d": candidates, "rebound_24h_only": []},
            "tracked_candidates": list(tracked)}


def qualification(at, candidates):
    return {"schema": "erith.radar.spot-qualification.v1",
            "qualified_at_utc": at, "source_observation_date_utc": at[:10],
            "real_orders_enabled": False,
            "actual_execution_permissions": False,
            "coin_id_matches_exchange_symbol_verified": False,
            "candidates": candidates}


def book(at="2026-10-17T20:00:41Z", ask=0.1255, coin="quack-ai"):
    return {"coin_id": coin, "symbol": "Q", "market": "QUSDT",
            "venue": "Bitget", "instrument_type": "SPOT", "quote": "USDT",
            "paper_only": True, "executed_order": False,
            "at_utc": at, "book": {"best_bid_usdt": 0.1253,
                                   "best_ask_usdt": ask, "book_age_seconds": 0}}


def state(rows):
    return {"coin_id": "quack-ai", "market": "QUSDT", "venue": "Bitget",
            "quote": "USDT", "paper_only": True, "orders_enabled": False,
            "executed_order": False, "recent_observations": rows}


class RadarSpotPaperTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.folder = Path(self.tmp.name)
        self.put("2026-10-17.json", day("2026-10-17",
                 [signal("quack-ai", 0.071, "2026-10-17T10:35:04Z"),
                  signal("bedrock-token", .39, "2026-10-17T10:35:04Z")]))
        self.put("2026-10-18.json", day("2026-10-18", []))
        self.put("2026-10-19.json", day("2026-10-19", [],
                 [{"id": "quack-ai", "price_usd": .12,
                   "observed_at_utc": "2026-10-19T11:14:00Z"}]))
        self.put("qualification-latest.json", qualification("2026-10-19T20:05:29Z", [
             {"id": "quack-ai", "symbol": "Q", "status": "RESEARCH_DATA_QUALIFIED_IDENTITY_REVIEW",
              "market": {"provider": "Bitget", "pair": "QUSDT", "quote": "USDT",
                         "book": {"spread_bps": 14}}}]))
        self.states = {"quack-ai": state([book()])}

    def put(self, name, document):
        (self.folder / name).write_text(json.dumps(document), encoding="utf-8")

    def test_every_signal_retained_including_loser_or_missing_price(self):
        x = audit.build(self.folder, self.states)
        self.assertEqual((x["total_detected"], x["later_prices_comparable"],
                          x["later_price_rises"], x["blocked_paper_candidates"]), (2, 1, 1, 2))
        self.assertEqual(x["trades_executed"], 0)
        self.assertTrue(all(k["paper"]["entry_price_usdt"] is None for k in x["candidates"]))
        self.assertTrue(all(k["paper"]["net_profit_usdt"] is None for k in x["candidates"]))
        self.assertEqual(x["candidates"][0]["spot"]["early_public_spot_book"]["pair"], "QUSDT")
        self.assertIsNone(x["candidates"][1]["last_day_aggregate_price_usd"])
        self.assertEqual(x["candidates"][1]["paper"]["reason"], "NO_PUBLIC_SPOT_BOOK_OR_PAIR_FOR_CANDIDATE")

    def test_late_qualification_never_authorizes_earlier_radar_signal(self):
        x = audit.build(self.folder, self.states)["candidates"][0]
        self.assertEqual(x["paper"]["decision"], "BLOCKED")
        self.assertTrue(x["spot"]["later_spot_qualification"]["later_than_detection"])
        self.assertFalse(x["spot"]["contract_identity_proven"])
        self.assertEqual(x["paper"]["reason"], "CONTRACT_IDENTITY_UNVERIFIED")

    def test_mistyped_symbol_cannot_claim_spot_pair(self):
        self.states["quack-ai"]["recent_observations"][0]["symbol"] = "OTHER"
        with self.assertRaises(ValueError):
            audit.build(self.folder, self.states)

    def test_mismatched_date_never_uses_future_book(self):
        self.states["quack-ai"]["recent_observations"] = [book("2026-10-20T04:00:00Z")]
        x = audit.build(self.folder, self.states)["candidates"][0]
        self.assertIsNone(x["spot"]["early_public_spot_book"])

    def test_no_matching_last_price_does_not_get_zero_return(self):
        x = audit.build(self.folder, self.states)["candidates"][1]
        self.assertIsNone(x["aggregate_change_pct_observed"])
        self.assertEqual(x["outcome_state"], "NO_COMPARABLE_LATER_PRICE")

    def test_delay_of_next_day_qualification_is_not_hard_failure(self):
        self.put("qualification-latest.json", qualification("2026-10-16T20:00:00Z", []))
        x = audit.build(self.folder, self.states)
        self.assertIsNone(x["qualification_observed_at_utc"])
        self.assertIsNone(x["candidates"][0]["spot"]["later_spot_qualification"])

    def test_missing_day_or_duplicated_radar_identity_refused(self):
        (self.folder / "2026-10-18.json").unlink()
        with self.assertRaises(ValueError):
            audit.build(self.folder, self.states)
        self.put("2026-10-18.json", day("2026-10-18", []))
        self.put("2026-10-17.json", day("2026-10-17", [
            signal("quack-ai", .071, "2026-10-17T10:35:04Z"),
            signal("quack-ai", .072, "2026-10-17T10:35:04Z")]))
        with self.assertRaises(ValueError):
            audit.build(self.folder, self.states)


if __name__ == "__main__":
    unittest.main()
