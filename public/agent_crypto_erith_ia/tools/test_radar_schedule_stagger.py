#!/usr/bin/env python3
"""Prevent recurrence of the :17 schedule burst among the core Radar/Atlas owners."""
import pathlib
import re
import unittest

ROOT=pathlib.Path(__file__).resolve().parents[4]
DIR=ROOT / ".github/workflows"

OWNERS={
    "atlas_market_collector.yml": {17},
    "atlas_news_collector.yml": {51},
    "radar-okx-public-hourly.yml": {38},
    "seven-priority-spot-paper.yml": {29},
    "atlas-public-crypto-market-clock.yml": {5,15,25,35,45,55},
}

def minutes(filename):
    code=(DIR/filename).read_text(encoding="utf8")
    rows=re.findall(r"^\s*-\s*cron:\s*['\"]?(\d+(?:,\d+)*)(?:\s+|\")",code,re.M)
    if len(rows)!=1:
        raise ValueError(f"Expected one cron schedule for {filename}: {rows}")
    return {int(x) for x in rows[0].split(",")}

class ScheduleTests(unittest.TestCase):
    def test_owners_are_spread_across_minute_buckets(self):
        for owner,expected in OWNERS.items():
            with self.subTest(owner=owner):
                self.assertEqual(minutes(owner),expected)
        self.assertEqual([name for name in OWNERS if 17 in minutes(name)],
                         ["atlas_market_collector.yml"])
        self.assertEqual(len(set.union(*(minutes(n) for n in OWNERS))),10)
        # The producer remains canonical; the watchdog stays 10-min periodic.
        watchdog=sorted(minutes("atlas-public-crypto-market-clock.yml"))
        self.assertEqual([b-a for a,b in zip(watchdog,watchdog[1:])],
                         [10]*5)

    def test_hourly_collector_writes_only_on_main_and_retains_single_lock(self):
        code=(DIR/"radar-okx-public-hourly.yml").read_text(encoding="utf8")
        self.assertIn("if: github.event_name != 'pull_request' && github.ref == 'refs/heads/main'",code)
        self.assertIn("'radar-spot-target-qualification'",code)
        self.assertIn("python -m unittest discover",code)
        self.assertNotIn("trade/order",code)

if __name__=="__main__":
    unittest.main()
