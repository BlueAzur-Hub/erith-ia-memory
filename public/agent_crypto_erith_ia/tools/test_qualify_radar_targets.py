#!/usr/bin/env python3
"""Tests hors réseau: ne jamais simuler des identités comme vérifiées."""
import datetime as dt
import json
import pathlib
import sys
import unittest

sys.path.insert(0,str(pathlib.Path(__file__).resolve().parent))
from qualify_radar_targets import candidate_list, qualify, market_detail, candle_rows, native_okx_spot_rules, okx_public_best_book, SCHEMA, HOUR

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
 def test_okx_dated_top_quote_retained_even_if_binance_candles_chosen(self):
  instrument={"instType":"SPOT","instId":"TOK0-USDT","baseCcy":"TOK0",
    "quoteCcy":"USDT","state":"live","minSz":"1","lotSz":"0.01","tickSz":"0.01"}
  def source(url):
   if "public/instruments" in url:return {"code":"0","data":[instrument]}
   if "/v5/market/books" in url:
    self.assertIn("instId=TOK0-USDT",url)
    return {"code":"0","data":[{"ts":str(int(NOW.timestamp()*1000)-3000),
      "bids":[["9.9","100","0","1"]],"asks":[["10","100","0","1"]]}]}
   return responder(url)
  report=qualify(sample(),source,NOW)
  row=next(x for x in report["candidates"] if x["symbol"]=="TOK0")
  self.assertEqual(row["market"]["provider"],"Binance")
  self.assertEqual(row["okx_spot"]["best_book_status"],"DATED_PUBLIC_BOOK")
  book=row["okx_spot"]["best_book"]
  self.assertEqual(book["pair"],"TOK0-USDT")
  self.assertEqual(book["best_bid_usdt"],"9.9")
  self.assertEqual(book["best_ask_usdt"],"10")
  self.assertEqual(book["best_bid_qty"],"100")
  self.assertFalse(book["market_execution_proven"])
  self.assertFalse(book["orders_enabled"])
  self.assertFalse(row["okx_spot"]["contract_identity_proven"])

 def test_stale_future_wrong_tick_and_crossed_okx_books_fail_closed(self):
  rules={"source":"OKX_PUBLIC_SPOT_INSTRUMENT","tick_sz":"0.01"}
  valid={"code":"0","data":[{"ts":str(int(NOW.timestamp()*1000)-3000),
    "bids":[["9.9","100"]],"asks":[["10","100"]]}]}
  for change in ("stale","future","wrong_tick","crossed","empty"):
   import copy
   data=copy.deepcopy(valid)
   b=data["data"][0]
   if change=="stale":b["ts"]=str(int(NOW.timestamp()*1000)-150_000)
   if change=="future":b["ts"]=str(int(NOW.timestamp()*1000)+15_000)
   if change=="wrong_tick":b["bids"][0][0]="9.991"
   if change=="crossed":b["bids"][0][0]="10"
   if change=="empty":b["asks"]=[]
   with self.subTest(change=change):
    with self.assertRaises((ValueError,KeyError,TypeError)):
     okx_public_best_book("TOK0-USDT",rules,lambda url:data,NOW)
  self.assertRaises(ValueError,okx_public_best_book,
    "TOK0-USDC",rules,lambda url:valid,NOW)

 def test_okx_spot_rules_survive_binance_first_selection(self):
  def okx_and_binance(url):
   if "/v5/market/books" in url:
    return {"code":"0","data":[{"ts":str(int(NOW.timestamp()*1000)-1500),
      "bids":[["9.9","100"]],"asks":[["10","100"]]}]}
   if "public/instruments" in url:
    return {"code":"0","data":[{"instType":"SPOT","instId":"TOK0-USDT",
      "baseCcy":"TOK0","quoteCcy":"USDT","state":"live",
      "minSz":"10","lotSz":"0.01","tickSz":"0.00001"},
      {"instType":"SWAP","instId":"TOK1-USDT-SWAP","baseCcy":"TOK1",
       "quoteCcy":"USDT","state":"live","minSz":"1","lotSz":"1","tickSz":"0.1"}]}
   return responder(url)
  out=qualify(sample(),okx_and_binance,NOW)
  first=next(c for c in out["candidates"] if c["symbol"]=="TOK0")
  self.assertEqual(first["market"]["provider"],"Binance")
  self.assertEqual(first["okx_spot"]["pair"],"TOK0-USDT")
  self.assertTrue(first["okx_spot"]["native_rules_verified"])
  self.assertEqual(first["okx_spot"]["rules"]["min_sz"],"10")
  self.assertEqual(first["okx_spot"]["rules"]["lot_sz"],"0.01")
  self.assertEqual(first["okx_spot"]["rules"]["tick_sz"],"0.00001")
  self.assertEqual(first["okx_spot"]["best_book_status"],"DATED_PUBLIC_BOOK")
  self.assertFalse(first["okx_spot"]["best_book"]["market_execution_proven"])
  self.assertFalse(first["okx_spot"]["contract_identity_proven"])
  self.assertFalse(first["okx_spot"]["real_orders_enabled"])
  second=next(c for c in out["candidates"] if c["symbol"]=="TOK1")
  self.assertFalse(second["okx_spot"]["pair_observed"])
  self.assertIsNone(second["okx_spot"]["rules"])

 def test_okx_spot_rules_require_real_positive_public_fields(self):
  original={"instType":"SPOT","instId":"TOK-USDT","baseCcy":"TOK",
      "quoteCcy":"USDT","state":"live","minSz":"10","lotSz":"0.01","tickSz":"0.0001"}
  self.assertEqual(native_okx_spot_rules(original,"TOK")["min_sz"],"10")
  for edit in ({"instType":"SWAP"},{"state":"suspend"},{"quoteCcy":"USDC"},
               {"instId":"TOK-USD"},{"minSz":None},{"minSz":"0"},
               {"lotSz":"NaN"},{"tickSz":"1e-8"},{"lotSz":"-1"},
               {"tickSz":"0.0000000000000000001"}):
   self.assertIsNone(native_okx_spot_rules({**original,**edit},"TOK"))
  self.assertIsNone(native_okx_spot_rules(original,"WRONG"))

 def test_duplicate_okx_spot_rows_never_certify_any_rules(self):
  good={"instType":"SPOT","instId":"TOK0-USDT","baseCcy":"TOK0",
        "quoteCcy":"USDT","state":"live","minSz":"10",
        "lotSz":"0.01","tickSz":"0.00001"}
  def duplicate(url):
   if "public/instruments" in url:return {"code":"0","data":[good,good]}
   return responder(url)
  out=qualify(sample(),duplicate,NOW)
  first=next(c for c in out["candidates"] if c["symbol"]=="TOK0")
  self.assertFalse(first["okx_spot"]["native_rules_verified"])
  self.assertIsNone(first["okx_spot"]["pair"])

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
 def test_binance_requests_only_targeted_symbols(self):
  from urllib.parse import urlsplit,parse_qs
  seen=[]
  def bounded(url):
   if "/exchangeInfo" in url:
    query=parse_qs(urlsplit(url).query)
    self.assertEqual(len(query),1)
    self.assertIn("symbol",query)
    seen.append(query["symbol"][0])
   return responder(url)
  result=qualify(sample(),bounded,NOW)
  self.assertEqual(len(set(seen)),20)
  self.assertEqual(result["markets_with_public_evidence"],20)

 def test_no_market_metadata_no_fabricated_pair(self):
  def broken(url):
   if "exchangeInfo" in url:raise OSError("réseau indisponible")
   return responder(url)
  out=qualify(sample(),broken,NOW)
  self.assertTrue(all(r["status"]=="NO_OBSERVED_SPOT_PAIR" for r in out["candidates"]))
  self.assertEqual(out["priority_research_ids"],[])

if __name__=="__main__": unittest.main()
