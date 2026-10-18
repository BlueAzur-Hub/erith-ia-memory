#!/usr/bin/env python3
"""Historical research watchlist from verified Radar snapshots. No trading signals."""
from __future__ import annotations
import json,pathlib,math
from collections import Counter
ROOT=pathlib.Path(__file__).resolve().parents[1]
SOURCE=ROOT/"data/crypto/radar-opportunities"
SCHEMA="erith.radar.research-cohort.v1"
def check(value,msg):
 if not value:raise ValueError(msg)
def numeric(v):
 return v if type(v) in (int,float) and math.isfinite(v) else None
def build(q,h):
 check(q.get("schema")=="erith.radar.spot-qualification.v1" and
       q.get("coin_id_matches_exchange_symbol_verified") is False and
       q.get("real_orders_enabled") is False,"Qualification non autorisée")
 check(h.get("schema")=="erith.radar.dynamic-forward-observations.v1" and
       h.get("quote")=="USD" and h.get("orders_enabled") is False,"Historique différent")
 records=q.get("candidates");priority=q.get("priority_research_ids")
 check(isinstance(records,list) and len(records)==20 and
       isinstance(priority,list) and len(priority)<=20,"20 candidats attendus")
 ids=[x.get("id") for x in records]
 check(all(isinstance(x,str) and x for x in ids) and len(set(ids))==20 and
       len(set(priority))==len(priority) and set(priority)<=set(ids),"Collision CoinGecko ID")
 follow=h.get("observations")
 check(isinstance(follow,list),"Archive prospective absente")
 counts=Counter(r.get("id") for r in follow)
 output=[]
 for c in records:
  market=c.get("market")
  if market is not None:
   check(c.get("pair_status")=="SPOT_SYMBOL_PAIR_OBSERVED" and
      market.get("provider") in ("Binance","OKX","Bitget") and
      market.get("quote")=="USDT" and isinstance(market.get("pair"),str) and market["pair"],
      "Paire Spot non vérifiée")
  else:check(c.get("status")=="NO_OBSERVED_SPOT_PAIR","Absence Spot non documentée")
  group="primary_research" if c["id"] in priority else "additional_spot_research" if market else "no_observed_spot"
  cost=numeric(market.get("estimated_roundtrip_cost_pct")) if market else None
  flags=["token_contract_not_verified"] if market else ["no_spot_pair"]
  if numeric(c.get("change24h_pct")) is not None and abs(c["change24h_pct"])>=25:flags.append("extreme_24h_move")
  if cost is not None and cost>=0.6:flags.append("high_hypothetical_cost")
  if market and market.get("book",{}).get("exchange_timestamp_verified") is not True:flags.append("book_time_unverified")
  mine=[x for x in follow if x.get("id")==c["id"]]
  output.append({"coin_id":c["id"],"symbol":c.get("symbol"),"name":c.get("name"),"group":group,
    "movement_class":c.get("group"),"rank_at_snapshot":c.get("rank"),
    "change24h_pct_at_snapshot":numeric(c.get("change24h_pct")),
    "change7d_pct_at_snapshot":numeric(c.get("change7d_pct")),
    "volume24h_aggregate_usd":numeric(c.get("aggregated_volume24h_usd")),
    "spot":None if not market else {"venue":market["provider"],"pair":market["pair"],"quote":"USDT",
      "spread_bps_at_snapshot":numeric(market.get("book",{}).get("spread_bps")),
      "roundtrip_cost_pct_assumed":cost},
    "detections_archived":counts.get(c["id"],0),
    "j1_observed":sum(x.get("followup_1d",{}).get("status")=="OBSERVED_DAILY_SNAPSHOT" for x in mine),
    "j7_observed":sum(x.get("followup_7d",{}).get("status")=="OBSERVED_DAILY_SNAPSHOT" for x in mine),
    "risks_and_missing_evidence":flags,"identity_certified":False,"trade_authorized":False})
 order={"primary_research":0,"additional_spot_research":1,"no_observed_spot":2}
 output.sort(key=lambda x:(order[x["group"]],x["coin_id"]))
 return {"schema":SCHEMA,"source_qualification_at_utc":q.get("qualified_at_utc"),
  "source_observation_date_utc":q.get("source_observation_date_utc"),
  "forward_archive_dates_utc":h.get("source_archive_dates",[]),
  "count":len(output),"spot_documented":sum(x["spot"] is not None for x in output),
  "additional_spot":sum(x["group"]=="additional_spot_research" for x in output),
  "unpaired":sum(x["spot"] is None for x in output),
  "reference":{"coin_id":"bitcoin","role":"benchmark","market_series_embedded":False},
  "orders_enabled":False,"strategy_certified":False,
  "note":"Recherche, pas classement d'achat. Prix/volume agrégés en USD, Spot en USDT; données datées. Identité de contrat non certifiée. Pas de rendement inventé.",
  "candidates":output}
def main():
 a=build(json.loads((SOURCE/"qualification-latest.json").read_text()),
         json.loads((SOURCE/"dynamic-followups.json").read_text()))
 out=SOURCE/"research-cohort.json"
 text=json.dumps(a,ensure_ascii=False,indent=2,allow_nan=False)+"\n"
 if not out.exists() or out.read_text()!=text:out.write_text(text)
 print(json.dumps({"file":str(out),"count":a["count"],"spot":a["spot_documented"],"unpaired":a["unpaired"]}))
if __name__=="__main__":main()
