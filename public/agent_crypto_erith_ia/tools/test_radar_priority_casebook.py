"""Integrity of the six human Radar dossiers vs canonical dated Spot archives."""
import json
import pathlib
import re
import unittest

ROOT=pathlib.Path(__file__).resolve().parents[1]
DATA=ROOT/"data/crypto/radar-opportunities"
HTML=ROOT/"laboratoire/radar-priority-dossiers.html"
RADAR=ROOT/"laboratoire/radar-historique.html"
EXPECTED={
 "auction":("AUCTION",1,"Binance","AUCTIONUSDT"),
 "theta-token":("THETA",4,"Binance","THETAUSDT"),
 "dappos":("DOS",6,"OKX","DOS-USDT"),
 "vaulta":("A",7,"Binance","AUSDT"),
 "iostoken":("IOST",8,"Binance","IOSTUSDT"),
 "compound-governance-token":("COMP",10,"Binance","COMPUSDT")
}
def load(name):
 return json.loads((DATA/name).read_text(encoding="utf-8"))

class Casebook(unittest.TestCase):
 def test_dated_evidence_reconciles_exact_identifiers_and_pairs(self):
  q=load("qualification-latest.json")
  ids=load("spot-identity-latest.json")
  d=load("priority-casebook.json")
  self.assertEqual(d["schema"],"erith.radar.priority-casebook.v1")
  self.assertEqual(d["qualification_at_utc"],q["qualified_at_utc"])
  self.assertEqual(d["identity_catalogue_at_utc"],ids["collected_at_utc"])
  self.assertEqual(d["research_window"],q["source_observation_date_utc"])
  self.assertEqual(d["focus_count"],6)
  self.assertEqual(d["focus_ids"],list(EXPECTED))
  self.assertEqual(d["priority_total"],10)
  qm={x["id"]:x for x in q["candidates"]}
  im={x["coin_id"]:x for x in ids["candidates"]}
  for r in d["candidates"]:
   cid=r["coin_id"]
   self.assertIn(cid,EXPECTED)
   sym,rank,venue,pair=EXPECTED[cid]
   x=qm[cid];i=im[cid];m=x["market"]
   self.assertEqual((r["symbol"],r["rank"],r["historical_market"]["venue"],
                     r["historical_market"]["pair"]),(sym,rank,venue,pair))
   self.assertEqual(q["priority_research_ids"][rank-1],cid)
   self.assertEqual(i["symbol"],sym)
   self.assertEqual(i["venue"],venue)
   self.assertEqual(i["pair"],pair)
   self.assertEqual(i["status"],"NATIVE_CONTRACT_SOURCE_NOT_SUPPORTED")
   self.assertFalse(i["identity_proven"])
   self.assertEqual(r["archival_identity_status"],i["status"])
   self.assertEqual(r["historical_market"]["book_at_utc"],m["book"]["observed_at_utc"])
   self.assertEqual(r["historical_market"]["bid"],str(m["book"]["best_bid_usdt"]))
   self.assertEqual(r["historical_market"]["ask"],str(m["book"]["best_ask_usdt"]))
   self.assertEqual(r["historical_market"]["spread_bps"],str(m["book"]["spread_bps"]))
   self.assertEqual(r["historical_market"]["closed_bars"],m["candles"]["closed_bars"])
   self.assertEqual(r["historical_market"]["source_book_timestamp_verified"],
                    m["book"]["exchange_timestamp_verified"])
   ok=x["okx_spot"]
   self.assertEqual(r["secondary_okx_pair_archived"],ok["pair"] if ok["pair_observed"] else None)
   self.assertFalse(r["project_token_reference"]["exchange_identity_proven"])
   self.assertFalse(r["exchange_contract_identity_proven"])
   self.assertFalse(r["current_spot_market_verified"])
   self.assertFalse(r["account_spot_available_verified"])
   self.assertFalse(r["admitted_to_hourly_collection"])
   self.assertFalse(r["orders_enabled"])
   self.assertFalse(r["position_taken"])

 def test_human_page_has_six_full_cards_reachable_from_radar(self):
  html=HTML.read_text(encoding="utf-8")
  root=RADAR.read_text(encoding="utf-8")
  self.assertEqual(html.count('class="case-card"'),6)
  self.assertEqual(html.count('class="index-item"'),10)
  for cid in EXPECTED:
   self.assertIn('id="'+cid+'"',html)
  for name in ["AXIS","ZEC","CT","REZ","BAT","ALT","BR"]:
   self.assertIn(name,html)
  self.assertIn("radar-priority-dossiers.html",root)
  self.assertIn("priority-casebook.json",html)
  self.assertIn("20 octobre 2026",html)
  self.assertIn("aucune cotation du 22 octobre".lower(),
                html.lower().replace("les prix du carnet reproduits ci-dessous sont des photographies du 20 octobre, pas des cotations du 22 octobre.","aucune cotation du 22 octobre"))
  self.assertNotIn("<script",html.lower())
  self.assertNotIn("placeOrder",html)
  self.assertNotIn("api_key",html.lower())

 def test_project_sources_non_transferable_and_non_executable(self):
  d=load("priority-casebook.json")
  self.assertTrue(d["research_only"])
  self.assertTrue(d["reused_existing_hourly_workflow"])
  self.assertFalse(d["account_access"])
  self.assertFalse(d["orders_enabled"])
  self.assertEqual(d["real_orders"],0)
  self.assertEqual(d["new_exchange_calls"],0)
  self.assertEqual(d["new_hourly_instruments"],0)
  self.assertEqual(d["priorities_existing_focus"],["renzo","basic-attention-token","altlayer"])
  self.assertEqual(d["priority_under_hourly_observation"],["bedrock-token"])
  for x in d["candidates"]:
   source=x["project_token_reference"]
   self.assertRegex(source["reference_url"],r"^https://")
   self.assertTrue(source["reference_authority"] in {
    "AGGREGATOR_TOKEN_REFERENCE","PROJECT_NATIVE_NETWORK",
    "OFFICIAL_EXCHANGE_REGIONAL_LISTING","PROJECT_NATIVE_MIGRATION",
    "PROJECT_OFFICIAL_TOKEN_CONTRACT"})
   if source["contract"] and source["contract"].startswith("0x"):
    self.assertRegex(source["contract"],r"^0x[0-9a-f]{40}$")
   self.assertIsInstance(x["next_evidence"],str)
   self.assertTrue(len(x["next_evidence"])>20)
  dos=next(x for x in d["candidates"] if x["coin_id"]=="dappos")
  self.assertEqual(dos["historical_market"]["venue"],"OKX")
  self.assertIn("tr.okx.com",dos["project_token_reference"]["reference_url"])
  self.assertFalse(dos["account_spot_available_verified"])
  vaulta=next(x for x in d["candidates"] if x["coin_id"]=="vaulta")
  self.assertEqual(vaulta["project_token_reference"]["contract"],"core.vaulta")

if __name__=="__main__":
 unittest.main()
