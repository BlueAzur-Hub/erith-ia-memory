#!/usr/bin/env python3
"""Offline regression gates for authentic Kraken Spot native historical daily."""
import copy
import datetime as dt
import gzip
import json
import pathlib
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0,str(pathlib.Path(__file__).resolve().parent))
import collect_native_kraken_daily_history as m

class KrakenNativeDailyProof(unittest.TestCase):
    def owners(self):
        f=m.read(m.FED)
        d=m.read(m.DAILY)
        o=m.read(m.OFFICIAL)
        return f,d,o

    def test_all_original_named_coin_ids_match_canonical_frozen_ranking(self):
        fed,daily,official=self.owners()
        selected=m.candidate_owners(fed,daily,official)
        self.assertEqual({a["id"] for a in selected},
            {"sofiusd","euro-coin","apxusd","cash-4"})
        self.assertEqual({a["quote"] for a in selected},{"USDT","USDC"})
        self.assertEqual(len({a["symbol"] for a in selected}),4)
        self.assertTrue(all(a["original_named_notice"].startswith(
            "https://blog.kraken.com/product/asset-listings/")
            for a in selected))
        self.assertTrue(all(a["coingecko_identity_url"]==
            "https://www.coingecko.com/en/coins/"+a["id"]
            for a in selected))
        # An existing published daily owner MUST NOT be recollected.
        published=copy.deepcopy(daily)
        published["assets"].append({"id":"sofiusd"})
        published["asset_count"]+=1
        self.assertNotIn("sofiusd",
            {a["id"] for a in m.candidate_owners(fed,published,official)})

    def test_no_alias_or_quote_roulette_or_stale_official_pair(self):
        f,d,official=self.owners()
        bad=copy.deepcopy(f)
        next(a for a in bad["assets"] if a["id"]=="sofiusd")["name"]="Other SOFID"
        with self.assertRaisesRegex(ValueError,"original-owner"):
            m.candidate_owners(bad,d,official)
        bad=copy.deepcopy(official)
        item=next(a for a in bad["assets"] if a["id"]=="sofiusd")
        item["instruments"]=[x for x in item["instruments"]
                             if x["instrument"]!="SOFID/USDT"]
        with self.assertRaisesRegex(ValueError,"independent active Spot"):
            m.candidate_owners(f,d,bad)
        bad=copy.deepcopy(official)
        item=next(a for a in bad["assets"] if a["id"]=="euro-coin")
        item["instruments"]=[x for x in item["instruments"]
                             if x["venue"]!="kraken"]
        with self.assertRaisesRegex(ValueError,"independent active Spot"):
            m.candidate_owners(f,d,bad)

    def test_genuine_kraken_daily_rows_preserve_gaps_not_zeros(self):
        owner=next(a for a in m.candidate_owners(*self.owners())
                   if a["id"]=="sofiusd")
        start=owner["first_listed_ms"]//1000
        candle=lambda stamp,volume="18.4",trades=2:[
            stamp,"1.00","1.02","0.99","1.01","1.005",
            volume,trades]
        rows=[candle(start),candle(start+86400,"0",0),
              candle(start+2*86400),candle(start+5*86400)]
        result=m.source_rows(rows,owner)
        self.assertEqual(result["bars"],3)
        self.assertEqual(result["gaps"],3)
        self.assertEqual(result["zero_trade_days_excluded"],1)
        self.assertEqual(len(result["rows"]),3)
        src={**result,"owner":owner,"source_response_sha256":["a"*64,"b"*64],
             "native_source_pair_key":"SOFIDUSDT"}
        data=json.loads(gzip.decompress(m.compressed(src)))
        self.assertEqual(data["original_quote"],"USDT")
        self.assertEqual(data["native_interval"],"1D")
        self.assertEqual(data["calendar_days_without_source_bars"],3)
        self.assertFalse(data["genesis_or_first_trade_proven"])
        self.assertTrue(data["source_has_only_last_720_daily_rows"])
        self.assertTrue(data["no_synthetic_candles"])
        self.assertEqual(data["original_rows"],result["rows"])

    def test_reject_pricing_inconsistency_clock_overlap_and_incomplete_day(self):
        owner=next(a for a in m.candidate_owners(*self.owners())
                   if a["id"]=="sofiusd")
        first=owner["first_listed_ms"]//1000
        row=lambda stamp:[stamp,"1.00","1.03","0.98","1.02",
                          "1.005","25",4]
        with self.assertRaisesRegex(ValueError,"out of order"):
            m.source_rows([row(first),row(first)],owner)
        with self.assertRaisesRegex(ValueError,"predates"):
            m.source_rows([row(first-86400)],owner)
        bad=row(first)
        bad[2]="0.95"
        with self.assertRaisesRegex(ValueError,"prices"):
            m.source_rows([bad],owner)
        bad=row(first)
        bad[6]="0"
        with self.assertRaisesRegex(ValueError,"zero-trade"):
            m.source_rows([bad],owner)
        with self.assertRaisesRegex(ValueError,"layout"):
            m.source_rows([[first,"1","2","3","4"]],owner)
        with self.assertRaisesRegex(ValueError,"No closed"):
            m.source_rows([row(m.END//1000)],owner)

    def test_immutable_release_requires_real_main_ci(self):
        owner=next(a for a in m.candidate_owners(*self.owners())
                   if a["id"]=="sofiusd")
        self.assertEqual(len(m.cohort_tag([owner]).split("-")[-1]),12)
        with patch.dict("os.environ",{},clear=True):
            with self.assertRaisesRegex(ValueError,"Only canonical main"):
                m.release([{"owner":owner}],[],"crypto-kraken-spot-native-daily-2026-09-a")

if __name__=="__main__":
    unittest.main(verbosity=2)
