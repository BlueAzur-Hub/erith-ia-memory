"""Read-only Vaulta and cross-snapshot identity regression.
The report captures a dated human incident. Do not rewrite it as new live market data.
"""
import json
import pathlib
import unittest

ROOT=pathlib.Path(__file__).resolve().parents[1]
AUDIT=ROOT/"data/crypto/research/vaulta-radar-display-audit.json"
CORE=ROOT/"data/crypto/latest.json"
EXT=ROOT/"data/crypto/extended.json"
HIST=ROOT/"data/historical_archive_prototype/top250_coverage_reconciliation.json"
PAGE=ROOT/"laboratoire/vaulta-case-study.html"
ATLAS=ROOT/"laboratoire/radar-priority-dossiers.html"
RADAR=ROOT/"laboratoire/radar-historique.html"
def load(file):return json.loads(file.read_text(encoding="utf-8"))

class VaultaAudit(unittest.TestCase):
 def test_report_explicitly_separates_coin_and_series_and_is_non_executable(self):
  d=load(AUDIT);v=d["vaulta"];graph=v["chart_24h"];fault=v["transition_issue"]
  self.assertEqual(d["schema"],"erith.research.vaulta-radar-display-audit.v1")
  self.assertTrue(d["read_only"])
  self.assertEqual(d["real_orders"],0)
  self.assertFalse(d["core_trader_modified"])
  self.assertEqual((v["coin_id"],v["symbol"],v["name"]),("vaulta","A","Vaulta"))
  self.assertEqual((graph["observed_coin_id"],graph["observed_symbol"]),("vaulta","A"))
  self.assertEqual(graph["observed_series_points"],288)
  self.assertEqual(fault["previous_line_coin"],"ZEC")
  self.assertEqual(fault["selected_title"],"A · Vaulta")
  self.assertEqual(fault["status"],"REPRODUCED_SCREENSHOTS_UNFIXED")
  self.assertNotEqual(fault["previous_line_price_usd_approx"],graph["observed_price_usd_approx"])
  self.assertTrue(all("ord" not in x.lower() for x in [fault["needed"]]))
  self.assertIn("/issues/618",fault["url"])
  self.assertIn("/issues/619",d["radar_top1000"]["issue"])

 def test_history_is_natively_daily_and_not_certified_connected_to_ui(self):
  d=load(AUDIT)["vaulta"]["native_daily_candles"]
  self.assertEqual((d["venue"],d["instrument"],d["quote"],d["interval"]),
                   ("OKX Spot","A-USDT","USDT","1Dutc"))
  self.assertEqual(d["count"],490)
  self.assertEqual((d["start_date_utc"],d["last_date_utc"]),
                   ("2025-05-29","2026-09-30"))
  self.assertFalse(d["first_trade_verified"])
  self.assertFalse(d["complete_since_first_trade_certified"])
  self.assertFalse(d["chart_browser_use_verified"])

 def test_current_canonical_snapshots_match_if_same_dated_capture(self):
  d=load(AUDIT);core=load(CORE);ext=load(EXT);old=load(HIST)
  v=d["vaulta"];sources=d["sources"]
  self.assertEqual(old["checkpoint_date_utc"],sources["historical_catalogue"]["checkpoint_date_utc"])
  if core.get("generated_at")==sources["core_market_snapshot"]["generated_at_utc"]:
   coin=next(x for x in core["coins"] if x["id"]=="vaulta")
   self.assertEqual((coin["symbol"],coin["rank"],coin["priceUsd"]),
                    ("A",v["rank_at_core_snapshot"],v["market_snapshot_usd"]))
  if (core.get("generated_at")==sources["core_market_snapshot"]["generated_at_utc"]
      and ext.get("generated_at")==sources["extended_market_snapshot"]["generated_at_utc"]):
   merged=core["coins"]+ext["coins"]
   self.assertEqual(len(merged),d["radar_top1000"]["combined_rows"])
   self.assertEqual(len({x["id"] for x in merged}),
                    d["radar_top1000"]["combined_unique_coin_ids"])
   shared=[x for x in ext["coins"] if any(y["id"]==x["id"] for y in core["coins"])]
   self.assertEqual([x["id"] for x in shared],
                    [x["coin_id"] for x in d["radar_top1000"]["duplicates"]])
  self.assertEqual(d["radar_top1000"]["combined_rows"],1000)
  self.assertEqual(d["radar_top1000"]["combined_unique_coin_ids"],999)
  self.assertEqual(d["radar_top1000"]["duplicates"][0]["coin_id"],"avant-usd")

 def test_human_page_and_navigation_without_trade_scripts(self):
  page=PAGE.read_text(encoding="utf-8")
  self.assertIn("Vaulta · A",page)
  self.assertIn("490 bougies",page)
  self.assertIn("09:14:40",page)
  self.assertIn("999 IDs",page)
  self.assertIn('vaulta-radar-display-audit.json',page)
  self.assertIn('issues/618',page)
  self.assertIn('issues/619',page)
  self.assertIn('vaulta-case-study.html',ATLAS.read_text(encoding="utf-8"))
  self.assertIn('vaulta-case-study.html',RADAR.read_text(encoding="utf-8"))
  self.assertNotIn("<script",page.lower())
  self.assertNotIn("placeOrder",page)
  self.assertNotIn("Authorization",page)

if __name__=="__main__":unittest.main()
