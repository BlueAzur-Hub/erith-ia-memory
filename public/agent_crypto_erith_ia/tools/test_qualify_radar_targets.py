#!/usr/bin/env python3
"""Tests hors réseau: ne jamais simuler des identités comme vérifiées."""
import datetime as dt
import json
import pathlib
import sys
import unittest

sys.path.insert(0,str(pathlib.Path(__file__).resolve().parent))
from qualify_radar_targets import candidate_list, qualify, market_detail, candle_rows, SCHEMA, HOUR

NOW=dt.datetime(2026,10,17,12,40,tzinfo=dt.timezone.utc)
def sample():
 records=[]
 for i in range(20):
  records.append(dict(id="asset-"+str(i),name="Asset "+str(i),
    symbol="TOK"+str(i),rank=i+1,volume24hUsd=20_000_000-i*1_000_000,
    change24h=8.0,change7d=2.0))
 return {"schema":"erith.radar.opportunity-observation.v1",
         "observed_date_utc":"2026-10-17",
         "source_times_utc":{"core":"2026-10-17T12:30:00Z","extended":"2026-10-17T12:30:00Z"},
         "groups":{"momentum_24h_7d":records[:10],"rebound_24h_only":records[10:]}}
def responder(url):
 if "exchangeInfo" in url:
  return {"symbols":[{"baseAsset":"TOK"+str(i),"quoteAsset":"USDT",
     "symbol":"TOK"+str(i)+"USDT","status":"TRADING","isSpotTradingAllowed":True} for i in range(20)]}
 if "public/instruments" in url: return {"code":"0","data":[]}
 if "v3/market/instruments" in url:return {"code":"00000","data":[]}
 if "/klines" in url:
  hour=int(NOW.timestamp()*1000)//HOUR*HOUR
  return [[hour-(25-i)*HOUR,"10","10","10","10","1",
            hour-(24-i)*HOUR-1,"10","1","1","5","0"] for i in range(26)]
 if "/depth" in url:
  return {"bids":[["9.9","50"],["9.8","10"]],"asks":[["10","50"],["10.1","10"]]}
 raise AssertionError("Unexpected endpoint "+url)

class Tests(unittest.TestCase):
 def test_full_read_only_research_priorities(self):
  out=qualify(sample(),responder,NOW,
    universe=[{"symbol":"TOK"+str(i)} for i in range(20)])
  self.assertEqual(out["schema"],SCHEMA)
  self.assertEqual(len(out["candidates"]),20)
  self.assertEqual(out["markets_with_public_evidence"],20)
  self.assertEqual(len(out["priority_research_ids"]),10)
  self.assertFalse(out["real_orders_enabled"])
  self.assertFalse(out["coin_id_matches_exchange_symbol_verified"])
  for row in out["candidates"]:
   self.assertEqual(row["identity_status"],"SYMBOL_ONLY_NOT_COIN_ID_PROVEN")
   self.assertEqual(row["market"]["candles"]["closed_bars"],20)
   self.assertFalse(row["market"]["real_fees_known"])
   self.assertFalse(row["market"]["book"]["exchange_timestamp_verified"])
   self.assertGreater(row["market"]["estimated_roundtrip_cost_pct"],0)
 def test_missing_depth_not_priority(self):
  def bad(u):
   if "/depth" in u:return {"bids":[],"asks":[]}
   return responder(u)
  out=qualify(sample(),bad,NOW)
  self.assertEqual(out["markets_with_public_evidence"],0)
  self.assertTrue(all(r["status"]=="SOURCE_INCOMPLETE" for r in out["candidates"]))
 def test_symbol_collision_is_hard_stop_for_coin(self):
  universe=[{"symbol":"TOK"+str(i)} for i in range(20)]+[{"symbol":"TOK0"}]
  out=qualify(sample(),responder,NOW,universe=universe)
  self.assertEqual(out["candidates"][0]["status"],"AMBIGUOUS_SYMBOL")
  self.assertNotIn("asset-0",out["priority_research_ids"])
 def test_old_or_wrong_day_rejected(self):
  with self.assertRaisesRegex(ValueError,"jour"):
   candidate_list(sample(),NOW+dt.timedelta(days=1))
  s=sample();s["source_times_utc"]["core"]="2026-10-10T12:30:00Z"
  with self.assertRaisesRegex(ValueError,"anciennes"):
   candidate_list(s,NOW)
 def test_candles_need_consecutive_fresh_closes(self):
  r=responder("https://data-api.binance.vision/api/v3/klines?symbol=TOK0USDT")
  r[20][0]+=1000
  with self.assertRaisesRegex(ValueError,"Trous"):
   candle_rows("Binance",r,int(NOW.timestamp()*1000))
 def test_no_market_metadata_no_fabricated_pair(self):
  def broken(url):
   if "exchangeInfo" in url:raise OSError("réseau indisponible")
   return responder(url)
  out=qualify(sample(),broken,NOW)
  self.assertTrue(all(r["status"]=="NO_OBSERVED_SPOT_PAIR" for r in out["candidates"]))
  self.assertEqual(out["priority_research_ids"],[])

if __name__=="__main__": unittest.main()
