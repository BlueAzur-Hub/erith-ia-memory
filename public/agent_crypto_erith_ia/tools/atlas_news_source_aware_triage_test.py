#!/usr/bin/env python3
"""Contract checks for source-aware AI/news reading: no financial signal."""
import copy
import json
import unittest
from pathlib import Path

import atlas_news_source_aware_triage as intel


BLOOM={
    "event_id":"news-bloom",
    "headline":"Bloom bot hackers loot $953K faster than you can microwave popcorn",
    "body":"Bloom pledged to reimburse nine traders after $953,000 was drained from 48 wallets, saying no private keys were accessed or compromised.",
    "source_count":1, "event_type":"security",
}
GLAM={
    "event_id":"news-glam",
    "headline":"AI agents help rescue ETH’s Glamsterdam fork, ‘Steal My Bitcoin’ site: Hodler’s Digest",
    "body":"Ethereum researchers set up an AI Agent message board to help rescue the Glamsterdam fork. Steal My Bitcoin site successfully hacked.",
    "source_count":1, "event_type":"security",
}
PROFIT={
    "headline":"AI trading bot claims $953K in profits",
    "body":"An unverified return claim published on social media.",
    "source_count":1,
}


class NewsArticleWatchTests(unittest.TestCase):
    def test_theft_is_not_ai_trading_profit(self):
        x=intel.classify(BLOOM)
        self.assertEqual(x["category"],"TRADING_BOT_SECURITY_INCIDENT")
        self.assertEqual(x["reported_usd_loss"],953000)
        self.assertIsNone(x["reported_usd_profit"])
        self.assertEqual(x["money_role"],"REPORTED_THEFT_NOT_PROFIT")
        self.assertTrue(x["claim_conflict_requires_review"])
        self.assertFalse(x["automated_trading_profit_proven"])
        self.assertFalse(x["bot_is_ai_agent_confirmed"])
        self.assertFalse(x["direct_market_trade_approved"])

    def test_multiple_digest_headlines_are_not_one_confirmed_critical_loss(self):
        x=intel.classify(GLAM)
        self.assertEqual(x["category"],"MULTI_STORY_DIGEST")
        self.assertTrue(x["multi_story_requires_separation"])
        self.assertIsNone(x["reported_usd_loss"])
        self.assertEqual(x["watch"],"REVIEW_STORIES_SEPARATELY")
        self.assertFalse(x["market_causality_proven"])

    def test_agent_security_research_is_not_autonomous_trading(self):
        x=intel.classify({
            "headline":"AI agents help rescue Ethereum Glamsterdam fork",
            "body":"Researchers use AI agents to scan potential vulnerabilities",
            "source_count":2})
        self.assertEqual(x["category"],"AI_ASSISTED_SECURITY_RESEARCH")
        self.assertEqual(x["money_role"],"NOT_A_TRADING_RESULT")
        self.assertFalse(x["independent_primary_confirmation_in_feed"])

    def test_unverified_performance_claim_not_counted_as_profit(self):
        x=intel.classify(PROFIT)
        self.assertIsNone(x["reported_usd_profit"])
        self.assertFalse(x["automated_trading_profit_proven"])

    def test_invalid_data_and_normalization_idempotent(self):
        with self.assertRaisesRegex(ValueError,"source count"):
            intel.classify({"source_count":True})
        doc={"events":[copy.deepcopy(BLOOM),copy.deepcopy(GLAM)]}
        one=intel.enrich(doc)
        two=intel.enrich(one)
        self.assertEqual(one,two)
        self.assertTrue(two["source_aware_article_triage"]["generated_from_canonical_news_only"])
        self.assertFalse(two["source_aware_article_triage"]["automatic_order"])

    def test_actual_canonical_news_archive_contains_two_articles(self):
        p=intel.DEFAULT
        if not p.exists():self.skipTest("Complete repository checkout required")
        data=json.loads(p.read_text(encoding="utf-8"))
        enriched=intel.enrich(data)
        found=[x for x in enriched["events"]
               if "bloom bot hackers" in x.get("headline","").lower()]
        found_g=[x for x in enriched["events"]
                 if "glamsterdam" in x.get("headline","").lower()
                 and "hodler" in x.get("headline","").lower()]
        # RSS is a moving seven-day window: an expired article is not a failure.
        for e in found:
            self.assertEqual(e["news_intelligence"]["category"],
                             "TRADING_BOT_SECURITY_INCIDENT")
        for e in found_g:
            self.assertEqual(e["news_intelligence"]["category"],"MULTI_STORY_DIGEST")
        self.assertTrue(all(not e["news_intelligence"]["direct_market_trade_approved"]
                            for e in enriched["events"]))
        self.assertEqual(enriched["source_aware_article_triage"]["events_scanned"],
                         len(enriched["events"]))


if __name__=="__main__":
    unittest.main(verbosity=2)
