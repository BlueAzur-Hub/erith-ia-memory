#!/usr/bin/env python3
"""Qualification en lecture seule des 20 candidats Radar; aucune exécution ni API privée.

L'existence d'une paire SYMBOL/USDT n'identifie pas à elle seule un token CoinGecko.
Les dix priorités sont des DOSSIERS DE RECHERCHE, jamais des signaux d'achat.
"""
from __future__ import annotations
import datetime as dt
from concurrent.futures import ThreadPoolExecutor
import json
import math
import pathlib
from decimal import Decimal, InvalidOperation
import time
import urllib.parse
import urllib.error
import urllib.request

from observe_radar20_execution import estimate_book

ROOT=pathlib.Path(__file__).resolve().parents[1]
DATA=ROOT/"data/crypto/radar-opportunities"
SCHEMA="erith.radar.spot-qualification.v1"
BUDGET=100.0
FEE_PCT_SIDE=0.1  # Hypothèse pédagogique, PAS le tarif du compte
HOUR=3600000
MAX_SPREAD_BPS=150.0  # Plafond exploratoire 1,5 %, à valider sur données futures
MAX_COST_PCT=2.0    # Frais et traversée du carnet pour 100 USDT fictifs
VENUES=("Binance","OKX","Bitget")
HOSTS={
 "Binance":"https://data-api.binance.vision",
 "OKX":"https://www.okx.com",
 "Bitget":"https://api.bitget.com",
}

def utcnow():
 return dt.datetime.now(dt.timezone.utc)

def ensure(ok,message):
 if not ok: raise ValueError(message)

def iso(t):
 return t.astimezone(dt.timezone.utc).isoformat(timespec="seconds").replace("+00:00","Z")

def public_json(url):
 """Only explicitly constructed public market endpoints, never orders/accounts."""
 req=urllib.request.Request(url,headers={"Accept":"application/json","User-Agent":"Erith-Radar-Research/1.0"})
 with urllib.request.urlopen(req,timeout=12) as response:
  raw=response.read(6_000_001)
  ensure(response.status==200 and 0<len(raw)<=6_000_000,"Réponse API absente ou trop volumineuse")
  return json.loads(raw)

def get(provider,path,params,fetch):
 return fetch(HOSTS[provider]+path+"?"+urllib.parse.urlencode(params))

def candidate_list(snapshot,now):
 ensure(snapshot.get("schema")=="erith.radar.opportunity-observation.v1","Archive Radar incompatible")
 date=snapshot.get("observed_date_utc")
 ensure(date and date==now.date().isoformat(),"Observation du jour absente : pas de réemploi silencieux")
 times=[dt.datetime.fromisoformat(s.replace("Z","+00:00")) for s in snapshot["source_times_utc"].values()]
 ensure(all(t.tzinfo and 0<=(now-t).total_seconds()<=36*3600 for t in times),"Sources Radar trop anciennes ou futures")
 rows=[]
 for group in ("momentum_24h_7d","rebound_24h_only"):
  for rec in snapshot.get("groups",{}).get(group,[]):
   symbol=str(rec.get("symbol","")).upper()
   ensure(symbol.isascii() and symbol.isalnum() and 1<=len(symbol)<=16,"Symbole non sûr")
   ensure(rec.get("id") and rec.get("name") and isinstance(rec.get("volume24hUsd"),(int,float)),"Candidat incomplet")
   rows.append({**rec,"group":group})
 ensure(len(rows)>=20,"Moins de vingt candidats Radar : qualification suspendue")
 ensure(len({r["id"] for r in rows})==len(rows),"Actif Radar dupliqué")
 return sorted(rows,key=lambda r:(-r["volume24hUsd"],r["id"]))[:20]


def native_okx_spot_rules(row, symbol):
 """Exact public OKX SPOT/USDT quantity, lot and price steps (NOT coin identity)."""
 if not isinstance(row, dict) or not isinstance(symbol, str):
  return None
 if (row.get("instType")!="SPOT" or row.get("state")!="live"
     or row.get("baseCcy")!=symbol or row.get("quoteCcy")!="USDT"
     or row.get("instId")!=symbol+"-USDT"):
  return None
 values={}
 for name in ("minSz","lotSz","tickSz"):
  raw=row.get(name)
  if not isinstance(raw,str) or len(raw)>45 or not raw or (
       not raw.replace(".","",1).isdigit() or raw.count(".")>1
       or raw.startswith(".") or raw.endswith(".")):
   return None
  try:
   number=Decimal(raw)
  except InvalidOperation:
   return None
  if (not number.is_finite() or number<=0
      or number.as_tuple().exponent < -18 or number>=Decimal("1000000000000")):
   return None
  values[name]=raw
 return {"min_sz":values["minSz"],"lot_sz":values["lotSz"],
         "tick_sz":values["tickSz"],"source":"OKX_PUBLIC_SPOT_INSTRUMENT",
         "contract_identity_proven":False,"fees_proven":False,
         "account_access_proven":False,"orders_enabled":False}


def venue_instruments(fetch,candidates):
 """Aucune substitution Futures/Margin; toute panne laisse une source indisponible."""
 result={}
 endpoints={
  "Binance":("/api/v3/exchangeInfo",{}),
  "OKX":("/api/v5/public/instruments",{"instType":"SPOT"}),
  "Bitget":("/api/v3/market/instruments",{"category":"SPOT"}),
 }
 for venue,(path,args) in endpoints.items():
  if venue=="Binance":
   # Binance full exchangeInfo can exceed several megabytes. Request ONLY the
   # 20 exact spot symbols; do not download or process the entire exchange index.
   def inspect(asset):
    sym=asset["symbol"]
    try:
     raw=get("Binance",path,{"symbol":sym+"USDT"},fetch)
     ensure(isinstance(raw.get("symbols"),list),"Métadonnées Binance invalides")
     for x in raw["symbols"]:
      if x.get("baseAsset")==sym and x.get("quoteAsset")=="USDT" and x.get("status")=="TRADING" and x.get("isSpotTradingAllowed",True):
       return sym,x["symbol"],None
     return sym,None,None
    except urllib.error.HTTPError as err:
     if err.code in (400,404): return sym,None,None  # symbole non coté
     return sym,None,str(err)
    except (ValueError,KeyError,TypeError,OSError,TimeoutError) as err:
     return sym,None,str(err)
   with ThreadPoolExecutor(max_workers=4) as pool:
    inspected=list(pool.map(inspect,candidates))
   pairs={sym:pair for sym,pair,_ in inspected if pair}
   failures=[err for _,_,err in inspected if err]
   result[venue]={"pairs":pairs,"error":"API Binance indisponible ("+str(len(failures))+"/20)" if len(failures)==len(candidates) else None}
   continue
  try:
   raw=get(venue,path,args,fetch)
   if venue=="OKX":
    ensure(raw.get("code")=="0" and isinstance(raw.get("data"),list),"Métadonnées OKX invalides")
    live=[r for r in raw["data"] if isinstance(r,dict) and
          isinstance(r.get("baseCcy"),str) and r.get("baseCcy") and
          r.get("quoteCcy")=="USDT" and r.get("state")=="live" and
          r.get("instType")=="SPOT" and
          r.get("instId")==r["baseCcy"]+"-USDT"]
    grouped={}
    for item in live:grouped.setdefault(item["baseCcy"],[]).append(item)
    # Duplicate native instruments are ambiguous; never overwrite silently.
    pairs={sym:rows[0]["instId"] for sym,rows in grouped.items() if len(rows)==1}
    native_rules={sym:rules for sym,rows in grouped.items() if len(rows)==1
                  for rules in [native_okx_spot_rules(rows[0],sym)] if rules}
   else:
    ensure(raw.get("code")=="00000" and isinstance(raw.get("data"),list),"Métadonnées Bitget invalides")
    pairs={r["baseCoin"].upper():r["symbol"] for r in raw["data"] if
     r.get("quoteCoin")=="USDT" and r.get("status")=="online" and
     r.get("category")=="SPOT" and r.get("symbolType","crypto")=="crypto" and
     r.get("isRwa","NO")!="YES"}
   result[venue]={"pairs":pairs,"rules":native_rules if venue=="OKX" else {},"error":None}
  except (ValueError,KeyError,TypeError,OSError,TimeoutError) as exc:
   result[venue]={"pairs":{},"error":str(exc)[:180]}
 return result

def candle_rows(venue,raw,now_ms):
 if venue=="Binance":
  ensure(isinstance(raw,list),"Bougies Binance absentes")
  rows=[(int(r[0]),float(r[4])) for r in raw if isinstance(r,list) and len(r)>6
        and int(r[6])<now_ms]
 elif venue=="OKX":
  ensure(raw.get("code")=="0" and isinstance(raw.get("data"),list),"Bougies OKX absentes")
  rows=[(int(r[0]),float(r[4])) for r in raw["data"] if len(r)>=9 and r[8]=="1"]
 else:
  ensure(raw.get("code")=="00000" and isinstance(raw.get("data"),list),"Bougies Bitget absentes")
  rows=[(int(r[0]),float(r[4])) for r in raw["data"] if len(r)>=7 and int(r[0])+HOUR<=now_ms]
 rows=sorted(rows)
 ensure(len(rows)>=20,"Moins de 20 bougies horaires closes")
 last=rows[-20:]
 ensure(all(math.isfinite(v) and v>0 for _,v in last),"Prix OHLC invalides")
 ensure(all(last[i][0]-last[i-1][0]==HOUR for i in range(1,len(last))),"Trous dans les bougies horaires")
 ensure(0<=now_ms-(last[-1][0]+HOUR)<=3*HOUR,"Bougies horaires périmées")
 return {"closed_bars":len(last),"first_hour_utc":iso(dt.datetime.fromtimestamp(last[0][0]/1000,dt.timezone.utc)),
         "last_closed_hour_utc":iso(dt.datetime.fromtimestamp(last[-1][0]/1000,dt.timezone.utc)),
         "last_close_usdt":last[-1][1]}

def market_detail(venue,pair,fetch,now):
 if venue=="Binance":
  candles=get(venue,"/api/v3/klines",{"symbol":pair,"interval":"1h","limit":26},fetch)
  book=get(venue,"/api/v3/depth",{"symbol":pair,"limit":20},fetch)
  source_ts=None
  ensure(isinstance(book,dict),"Carnet Binance invalide")
  normalized={"bids":book.get("bids"),"asks":book.get("asks"),
              "ts":int(now.timestamp()*1000)}
 elif venue=="OKX":
  candles=get(venue,"/api/v5/market/candles",{"instId":pair,"bar":"1H","limit":26},fetch)
  book=get(venue,"/api/v5/market/books",{"instId":pair,"sz":20},fetch)
  ensure(book.get("code")=="0" and book.get("data"),"Carnet OKX invalide")
  normalized=book["data"][0]
  source_ts=int(normalized["ts"])
 else:
  candles=get(venue,"/api/v3/market/candles",{"category":"SPOT","symbol":pair,"interval":"1H","limit":26},fetch)
  book=get(venue,"/api/v3/market/orderbook",{"category":"SPOT","symbol":pair,"limit":20},fetch)
  ensure(book.get("code")=="00000" and isinstance(book.get("data"),dict),"Carnet Bitget invalide")
  b=book["data"];normalized={"bids":b.get("b"),"asks":b.get("a"),"ts":b.get("ts")}
  source_ts=int(normalized["ts"])
 now_ms=int(now.timestamp()*1000)
 bars=candle_rows(venue,candles,now_ms)
 # Binance depth REST has NO market-generated timestamp: mark it explicitly.
 measured=estimate_book(normalized,now_ms=now_ms,budget=BUDGET)
 resale=float(measured["public_book_immediate_resale_usdt"])
 mid=(measured["best_bid_usdt"]+measured["best_ask_usdt"])/2
 ensure(abs(mid/bars["last_close_usdt"]-1)<=0.15,"Cours carnet/bougies divergent (>15 %)")
 modeled=round(100*(1-(resale/BUDGET)*(1-FEE_PCT_SIDE/100)**2),5)
 return {"provider":venue,"pair":pair,"quote":"USDT","candles":bars,
   "book":{"best_bid_usdt":measured["best_bid_usdt"],"best_ask_usdt":measured["best_ask_usdt"],
    "spread_bps":measured["spread_bps"],"book_age_seconds":measured["book_age_seconds"] if source_ts else None,
    "exchange_timestamp_verified":source_ts is not None,
    "observed_at_utc":iso(now),"public_book_roundtrip_loss_pct":measured["instant_spread_depth_only_cost_pct"]},
   "illustrative_ticket_usdt":BUDGET,"assumed_fee_pct_each_side":FEE_PCT_SIDE,
   "estimated_roundtrip_cost_pct":modeled,"real_fees_known":False,
   "minimum_order_verified":False,"slippage_future_guaranteed":False}

def qualify(snapshot,fetch=public_json,now=None,universe=None):
 now=now or utcnow()
 chosen=candidate_list(snapshot,now)
 venues=venue_instruments(fetch,chosen)
 # Symbols can collide even inside CoinGecko Top1000: never alias them silently.
 collisions={}
 for asset in universe or []:
  sym=str(asset.get("symbol","")).upper()
  collisions[sym]=collisions.get(sym,0)+1
 rows=[]
 for asset in chosen:
  native_pair=venues["OKX"]["pairs"].get(asset["symbol"])
  native_rules=venues["OKX"].get("rules",{}).get(asset["symbol"])
  # Keep native OKX market evidence independently of Binance-first chart selection.
  # Matching an exchange base symbol does NOT prove a CoinGecko contract identity.
  okx_candidate={"venue":"OKX","quote":"USDT","pair":native_pair,
    "pair_observed":bool(native_pair),"native_rules_verified":bool(native_pair and native_rules),
    "rules":native_rules if native_pair else None,
    "observation_utc":iso(now) if native_pair else None,
    "contract_identity_proven":False,"account_access_proven":False,
    "real_fees_proven":False,"real_orders_enabled":False}
  entry={"id":asset["id"],"name":asset["name"],"symbol":asset["symbol"],
         "group":asset["group"],"rank":asset["rank"],"change24h_pct":asset["change24h"],
         "change7d_pct":asset["change7d"],"aggregated_volume24h_usd":asset["volume24hUsd"],
         "identity_status":"SYMBOL_ONLY_NOT_COIN_ID_PROVEN","pair_status":"NOT_VERIFIED",
         "status":"SOURCE_INCOMPLETE","errors":[],"market":None,"okx_spot":okx_candidate}
  if collisions.get(asset["symbol"],1)>1:
   entry["status"]="AMBIGUOUS_SYMBOL"
   entry["errors"].append("Symbole partagé par plusieurs identifiants CoinGecko")
   rows.append(entry);continue
  anypair=False
  for venue in VENUES:
   pair=venues[venue]["pairs"].get(asset["symbol"])
   if not pair:continue
   anypair=True
   entry["pair_status"]="SPOT_SYMBOL_PAIR_OBSERVED"
   try:
    market=market_detail(venue,pair,fetch,utcnow() if fetch is public_json else now)
    entry["market"]=market
    if market["book"]["spread_bps"]>MAX_SPREAD_BPS or market["estimated_roundtrip_cost_pct"]>MAX_COST_PCT:
     entry["status"]="EXCESSIVE_OBSERVED_COST"
    else:
     entry["status"]="RESEARCH_DATA_QUALIFIED_IDENTITY_REVIEW"
    break
   except (ValueError,KeyError,TypeError,OSError,TimeoutError) as exc:
    entry["errors"].append(venue+": "+str(exc)[:130])
  if not anypair:
   entry["status"]="NO_OBSERVED_SPOT_PAIR" if any(not v["error"] for v in venues.values()) else "VENUES_UNAVAILABLE"
  rows.append(entry)
 measured=[r for r in rows if r["market"] is not None]
 good=[r for r in measured if r["status"]=="RESEARCH_DATA_QUALIFIED_IDENTITY_REVIEW"]
 good.sort(key=lambda r:(r["market"]["estimated_roundtrip_cost_pct"],
                          -r["aggregated_volume24h_usd"],r["id"]))
 priority=[r["id"] for r in good[:10]]
 return {"schema":SCHEMA,"source_observation_date_utc":snapshot["observed_date_utc"],
   "source_times_utc":snapshot["source_times_utc"],"qualified_at_utc":iso(now),
   "universe_preselected":len(chosen),"venues":{v:{"available":not info["error"],"error":info["error"]} for v,info in venues.items()},
   "markets_with_public_evidence":len(measured),"priority_eligible_count":len(good),"priority_research_ids":priority,
   "limits":{"max_spread_bps":MAX_SPREAD_BPS,"max_modeled_roundtrip_cost_pct":MAX_COST_PCT},
   "priority_target_count":10,"priority_not_force_filled":True,
   "priority_order":"lower illustrative roundtrip cost, then higher historical aggregate volume",
   "quote":"USDT","budget_usdt":BUDGET,"fee_per_side_pct_hypothesis":FEE_PCT_SIDE,
   "coin_id_matches_exchange_symbol_verified":False,"actual_execution_permissions":False,
   "real_orders_enabled":False,"portfolio_access":False,
   "notes":["Binance/OKX/Bitget publics Spot uniquement; aucun Future ni API privée.",
    "Symbole Spot seul ne prouve pas l'identité CoinGecko; examen manuel des contrats ou listings indispensable.",
    "Les frais sont des hypothèses, la profondeur un instantané; aucun achat n'est conseillé.",
    "Ne comparer ni USDT, ni USDC, ni USD comme devises identiques.",
    "Absence de données = dossier incomplet, jamais score artificiel."],
   "candidates":rows}

def main():
 now=utcnow()
 source=DATA/(now.date().isoformat()+".json")
 ensure(source.is_file(),"Aucun snapshot Radar du jour, qualification non publiée")
 snapshot=json.loads(source.read_text(encoding="utf-8"))
 core=json.loads((ROOT/"data/crypto/latest.json").read_text(encoding="utf-8"))
 ext=json.loads((ROOT/"data/crypto/extended.json").read_text(encoding="utf-8"))
 result=qualify(snapshot,now=now,universe=[*core["coins"],*ext["coins"]])
 out=DATA/"qualification-latest.json"
 out.write_text(json.dumps(result,ensure_ascii=False,indent=2,allow_nan=False)+"\n",encoding="utf-8")
 print(json.dumps({"file":str(out),"candidates":len(result["candidates"]),
                   "measured":result["markets_with_public_evidence"],
                   "priority":len(result["priority_research_ids"])},ensure_ascii=False))
if __name__=="__main__":
 main()
