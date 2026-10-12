#!/usr/bin/env python3
"""Evidence-only original WhiteBIT WBT_USDT Spot instrument census.
No market candle extraction, price redistribution or artificial continuity.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.error import HTTPError,URLError

ROOT=Path(__file__).resolve().parents[1]/"data/historical_archive_prototype"
CATALOG=ROOT/"top250_multisource_coverage/index.json"
REGISTRY=ROOT/"top25_historical_expansion/instrument_resolution.json"
API="https://whitebit.com/api/v4/public/markets"
OFFICIAL="https://help.whitebit.com/hc/en-gb/articles/19480314291613-How-to-buy-WBT"
EXPORT="https://help.whitebit.com/hc/en-gb/articles/21922302527773-Historical-Market-Data"
LIMIT=4_000_000
EXPECTED="WBT_USDT"
def need(x,s):
    if not x:raise ValueError(s)
def pin():
    c=CATALOG.read_bytes();x=json.loads(c)
    row=x["assets"][14]
    need(x["ranked"]==250 and row["rank"]==15 and row["id"]=="whitebit"
         and row["symbol"]=="WBT" and row["quote"]=="USDT"
         and row["native_1m_count"]==0 and row["months"]==0,
         "WBT coin ownership changed")
    r=REGISTRY.read_bytes();j=json.loads(r)
    original=next(a for a in j["source_scope"] if a["id"]=="whitebit")
    need(original["market"]==EXPECTED and original["venue"]=="WhiteBIT Spot"
         and original["original_1m_months_verified"]==0,
         "Original WhiteBIT instrument record changed")
    return {"top250_canonical_sha256":hashlib.sha256(c).hexdigest(),
            "top25_instrument_register_sha256":hashlib.sha256(r).hexdigest()}
def retrieve(opener=urlopen):
    req=Request(API,headers={"Accept":"application/json",
         "User-Agent":"SevenHeaven-Provenance-Only-SpotMarketCensus/1.0"})
    try:
        with opener(req,timeout=35) as response:
            need(response.status==200,"Market census returned non-200")
            content=response.read(LIMIT+1)
        need(0<len(content)<=LIMIT,"Market census unexpectedly empty/large")
        data=json.loads(content)
        need(isinstance(data,list),"Unexpected WhiteBIT official market schema")
        markets=[row for row in data if isinstance(row,dict)
                 and row.get("name")==EXPECTED]
        need(len(markets)<=1,"Ambiguous exact Spot instrument identity")
        if not markets:
            return {"status":"exact_instrument_absent","response_sha256":hashlib.sha256(content).hexdigest(),
                    "response_instruments_count":len(data),"original_market_proven":False}
        row=markets[0]
        need(row.get("stock")=="WBT" and row.get("money")=="USDT"
             and row.get("type")=="spot",
             "Public instrument does not confirm the exact WBT Spot owner")
        return {"status":"exact_whitebit_spot_instrument_verified",
                "response_sha256":hashlib.sha256(content).hexdigest(),
                "response_instruments_count":len(data),
                "original_market_proven":True,
                "instrument":{"name":row["name"],"stock":row["stock"],
                              "money":row["money"],"type":row["type"],
                              "tradesEnabled":row.get("tradesEnabled")}}
    except (HTTPError,URLError,TimeoutError,OSError,ValueError,KeyError,json.JSONDecodeError) as exc:
        return {"status":"source_unavailable_or_invalid",
                "original_market_proven":False,
                "source_error_type":type(exc).__name__,
                "source_error_context":str(exc)[:160]}
def main():
    cli=argparse.ArgumentParser()
    cli.add_argument("--output",type=Path,required=True)
    args=cli.parse_args()
    pins=pin()
    evidence=retrieve()
    doc={"schema":"seven.crypto.top25-whitebit-instrument-proof.v1",
         "source_market_inventory":API,"provider_identity_proof":OFFICIAL,
         "provider_historical_export_docs":EXPORT,
         "rank":15,"ranked_coin_id":"whitebit","original_symbol":"WBT",
         "venue":"WhiteBIT Spot","pair":EXPECTED,"quote":"USDT",
         "ranked_source_immutable_pins":pins,**evidence,
         "source_response_digest_exchange_signed":False,
         "native_original_1m_ohlcv_archived":0,
         "no_ohlcv_download_performed":True,
         "historical_data_redistribution_rights_not_granted_or_assumed":True,
         "missing_original_ohlcv_must_not_be_synthesized":True,
         "trader_interface_unchanged":True}
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(doc,indent=2,sort_keys=True)+"\n")
    print("WHITEBIT ORIGINAL WBT SPOT MARKET IDENTITY "+json.dumps({
       "status":doc["status"],"proven":doc["original_market_proven"],
       "archived_native_1m":0},sort_keys=True),flush=True)
if __name__=="__main__":main()
