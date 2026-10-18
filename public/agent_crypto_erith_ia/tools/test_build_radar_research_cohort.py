import unittest
from build_radar_research_cohort import build
def make():
 ids=["quack-ai","impossible-cloud-network-token","instadapp","the-sandbox","lighter","vaulta",
      "kamino","reserve-rights-token","mina-protocol","numeraire","axelar","metis-token",
      "bedrock-token","clearpool","meta-2-2","orbio-so","folks","hive_dollar","swarm-network","apex-token-2"]
 records=[]
 for n,i in enumerate(ids):
  market={"provider":"Binance","pair":"XUSDT","quote":"USDT","book":{"spread_bps":5},"estimated_roundtrip_cost_pct":0.3} if n<14 else None
  records.append({"id":i,"symbol":"X","name":i,"market":market,
      "pair_status":"SPOT_SYMBOL_PAIR_OBSERVED" if market else "NOT_VERIFIED",
      "status":"RESEARCH_DATA_QUALIFIED_IDENTITY_REVIEW" if market else "NO_OBSERVED_SPOT_PAIR",
      "change24h_pct":4,"change7d_pct":-3,"group":"rebound_24h_only"})
 q={"schema":"erith.radar.spot-qualification.v1","coin_id_matches_exchange_symbol_verified":False,
 "real_orders_enabled":False,"priority_research_ids":ids[:10],"candidates":records}
 h={"schema":"erith.radar.dynamic-forward-observations.v1","quote":"USD","orders_enabled":False,
    "source_archive_dates":["2026-10-17"],
    "observations":[{"id":"quack-ai","followup_1d":{"status":"AWAITING_FUTURE_DAY"}}]}
 return q,h
class Tests(unittest.TestCase):
 def test_all_candidates_and_evidence_classes(self):
  q,h=make();v=build(q,h)
  self.assertEqual((v["count"],v["spot_documented"],v["additional_spot"],v["unpaired"]),(20,14,4,6))
  self.assertFalse(v["orders_enabled"])
  self.assertEqual(v["candidates"][0]["group"],"primary_research")
  self.assertEqual(v["candidates"][0]["detections_archived"],1)
  self.assertEqual(v["candidates"][0]["j1_observed"],0)
 def test_wrong_currency_duplicate_coin_and_fake_authorization_rejected(self):
  for corrupt in [
    lambda q:q.update(real_orders_enabled=True),
    lambda q:q["candidates"][0]["market"].update(quote="USD"),
    lambda q:q["candidates"][1].update(id="quack-ai")]:
   q,h=make();corrupt(q)
   with self.assertRaises(ValueError):build(q,h)
 def test_unknown_spot_and_overheat_stay_visible(self):
  q,h=make();q["candidates"][0]["change24h_pct"]=140
  q["candidates"][0]["market"]["estimated_roundtrip_cost_pct"]=0.9
  v=build(q,h);f=v["candidates"][0]["risks_and_missing_evidence"]
  self.assertIn("extreme_24h_move",f);self.assertIn("high_hypothetical_cost",f)
  absent=next(x for x in v["candidates"] if x["coin_id"]=="meta-2-2")
  self.assertIsNone(absent["spot"]);self.assertFalse(absent["trade_authorized"])
if __name__=="__main__":unittest.main()
