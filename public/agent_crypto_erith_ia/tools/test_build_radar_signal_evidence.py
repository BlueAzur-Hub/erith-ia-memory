#!/usr/bin/env python3
"""Offline evidence tests: missing ≠ zero, retrospective split ≠ prospective fill."""
import copy
import datetime as dt
import pathlib
import sys
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from build_radar_signal_evidence import build, strict_top50, strict_dynamic, top50_eval, SCHEMA


def top_observation(day, coin, pct=None):
    d = dt.date.fromisoformat(day)
    future = (d + dt.timedelta(days=7)).isoformat()
    observed = pct is not None
    return {
        "id": coin, "symbol": coin.upper(),
        "observed_at": day+"T12:00:00.000Z",
        "price_usd": 100,
        "selection_rule": "TOP50_RETROSPECTIVE_MOMENTUM_WITH_EUR_VOLUME_AND_CAP_FILTER",
        "future_7d_date": future,
        "observed_followup_at": future+"T13:00:00.000Z" if observed else None,
        "observed_followup_price_usd": 100*(1+pct/100) if observed else None,
        "followup_change_pct": pct,
        "followup_status": "OBSERVED_MARKET_SNAPSHOT" if observed else "ASSET_NOT_IN_TOP50",
    }


def history():
    return {
        "schema": "erith.radar.top50-retrospective-review.v1",
        "record_kind": "retrospective_descriptive_check_not_paper_trades",
        "followup_returns_ignore_fees": True,
        "trade_executions_recorded": False,
        "forward_horizon_days": 7,
        "observations": [
            top_observation("2026-09-18", "alpha", 3),
            top_observation("2026-09-19", "bravo", None),
            top_observation("2026-09-20", "charlie", 90),
            top_observation("2026-09-27", "delta", -2),
            top_observation("2026-09-28", "echo", 1),
            top_observation("2026-09-29", "foxtrot", None),
        ]
    }


def dynamic():
    def row(day, coin, group, ret):
        future = (dt.date.fromisoformat(day) + dt.timedelta(days=1)).isoformat()
        observed = ret is not None
        return {
            "id": coin, "symbol": coin.upper(), "group": group,
            "first_seen_date_utc": day,
            "observed_at_utc": day+"T10:00:00Z",
            "initial_price_usd": 10,
            "followup_1d": {
                "target_date_utc": future,
                "at_utc": future+"T11:00:00Z" if observed else None,
                "price_usd": 10*(1+ret/100) if observed else None,
                "change_pct": ret,
                "status": "OBSERVED_DAILY_SNAPSHOT" if observed else "NO_MATCHING_VERIFIED_PRICE",
            }
        }
    return {
        "schema": "erith.radar.dynamic-forward-observations.v1",
        "record_kind": "descriptive_daily_followup_not_paper_trades",
        "quote": "USD", "orders_enabled": False,
        "trade_executions_recorded": False,
        "fees_included": False, "identity_market_pair_certified": False,
        "source_archive_dates": ["2026-10-16", "2026-10-17"],
        "observations": [
            row("2026-10-16", "a", "momentum_24h_7d", 5),
            row("2026-10-16", "b", "momentum_24h_7d", None),
            row("2026-10-17", "c", "rebound_24h_only", -4),
        ]
    }


def qualification():
    return {
        "schema": "erith.radar.spot-qualification.v1",
        "qualified_at_utc": "2026-10-19T23:59:33Z",
        "real_orders_enabled": False,
        "coin_id_matches_exchange_symbol_verified": False,
        "candidates": [{"id": "r"+str(i), "okx_spot": {
            "pair_observed": i in (0, 1), "native_rules_verified": i == 0,
            "best_book_status": "DATED_PUBLIC_BOOK" if i == 0 else "NOT_COLLECTED",
        }} for i in range(20)]
    }


class SignalEvidenceTests(unittest.TestCase):
    def produce(self):
        return build(history(), dynamic(), qualification())

    def test_split_embargo_never_leaks_selected_historical_winner(self):
        result = self.produce()
        self.assertEqual(result["schema"], SCHEMA)
        p = result["top50_retro_7d"]["periods"]
        self.assertEqual(p["selection_descriptive"]["signals_total"], 2)
        self.assertEqual(p["selection_descriptive"]["followups_missing"], 1)
        self.assertEqual(p["embargo_7_days_excluded"]["signals_total"], 1)
        self.assertEqual(p["later_descriptive_validation"]["signals_total"], 3)
        later = p["later_descriptive_validation"]
        self.assertEqual(later["followups_observed"], 2)
        self.assertEqual(later["followups_missing"], 1)
        self.assertLess(later["cost_sensitivity_descriptive_only"]["0.8"]
                        ["mean_observed_gross_minus_assumed_friction_pct"], 0)
        self.assertFalse(result["top50_retro_7d"]["true_unseen_holdout"])
        self.assertFalse(result["strategy_certified"])

    def test_j1_groups_keep_missing_and_do_not_transfer_fees(self):
        out = self.produce()["radar_forward_j1"]["buckets"]
        self.assertEqual(out["momentum_24h_7d"]["signals_total"], 2)
        self.assertEqual(out["momentum_24h_7d"]["followups_missing"], 1)
        self.assertEqual(out["rebound_24h_only"]["followups_observed"], 1)
        self.assertFalse(out["rebound_24h_only"]["trading_costs_applied"])

    def test_no_trades_and_no_usd_usdt_conversion(self):
        out = self.produce()
        self.assertFalse(out["orders_enabled"])
        self.assertFalse(out["strategy_certified"])
        self.assertEqual(out["paper_fills"], 0)
        self.assertFalse(out["okx_context"]["okx_hurdle_journal_published"])
        self.assertIsNone(out["okx_context"]["paper_cost_studies"])
        self.assertEqual(out["okx_context"]["okx_pairs_observed"], 2)
        self.assertTrue(out["okx_context"]["no_executable_returns_derived_from_usd"])

    def test_unknown_radar_status_does_not_become_return(self):
        bad = dynamic()
        bad["observations"][0]["followup_1d"]["status"] = "FAKE_WIN"
        with self.assertRaises(ValueError):
            strict_dynamic(bad)
        bad = dynamic()
        bad["observations"][0]["followup_1d"]["change_pct"] = 50
        with self.assertRaises(ValueError):
            strict_dynamic(bad)

    def test_historical_future_wrong_day_and_missing_followup_fail_closed(self):
        bad = history()
        bad["observations"][0]["observed_followup_at"] = "2026-09-26T11:00:00Z"
        with self.assertRaises(ValueError):
            strict_top50(bad)
        bad = history()
        bad["observations"][1]["observed_followup_price_usd"] = 250
        with self.assertRaises(ValueError):
            strict_top50(bad)

    def test_only_predefined_rule_accepted_and_no_duplicate_asset_day(self):
        bad = history()
        bad["observations"][0]["selection_rule"] = "OPTIMIZED_ON_HOLDOUT"
        with self.assertRaises(ValueError):
            strict_top50(bad)
        bad = history()
        bad["observations"].append(copy.deepcopy(bad["observations"][0]))
        with self.assertRaises(ValueError):
            strict_top50(bad)

    def test_prospective_archive_is_optional_but_malformed_journal_is_not(self):
        good = self.produce()
        self.assertIsNone(good["okx_context"]["future_bid_followups"])
        with self.assertRaises(ValueError):
            build(history(), dynamic(), qualification(), {"schema":"unrecognized"})
        journal = {"schema":"erith.radar.okx.hurdle-followups.v1",
                   "orders_enabled":False,"paper_fills":0,"real_orders":0,
                   "studies":[{"followups":[{"window":"24h"}]}]}
        verified = build(history(),dynamic(),qualification(),journal)
        self.assertEqual(verified["okx_context"]["future_bid_followups"],1)

    def test_nonmatching_quote_is_not_okx_historical_return(self):
        bad = dynamic()
        bad["quote"] = "USDT"
        with self.assertRaises(ValueError):
            strict_dynamic(bad)

if __name__ == "__main__":
    unittest.main()
