#!/usr/bin/env python3
"""Official KuCoin historical Spot BNB-USDT and SOL-USDT gap evidence.

KuCoin listed BNB-USDT 2019-06-19 (official announcement). Unlike Coinbase or
Kraken unverified 2020-2023 BNB markets, KuCoin's BNB/USDT is an independent
historic spot market. Test four Binance-gap windows. Also verify 2021-08-13
SOL-USDT against one missing minute in Coinbase SOL/USD; quote currencies are
NOT interchangeable.

Never backfill a Binance bar from KuCoin, nor infer an OHLCV candle from the
presence or absence of an unrelated venue. No original archive edits.
"""
from __future__ import annotations
import argparse
from decimal import Decimal,InvalidOperation
from hashlib import sha256
import json
from pathlib import Path
from urllib.parse import urlencode

import audit_cross_venue_gap_matrix as base

ROOT=base.HERE
SOURCE=ROOT/"cross_venue_gap_matrix/index.json"
OUTPUT=ROOT/"kucoin_bnb_sol_crosscheck/index.json"
ENDPOINT="https://api.kucoin.com/api/v1/market/candles"
POLICY="kucoin_spot_native_1m_gap_evidence_non_fungible_quotes.v1"


def need(ok,msg):
    if not ok:raise ValueError(msg)


def url(asset,first,end):
    need(asset in ("BNB","SOL") and first%base.M==0 and
         (end-first)%base.M==0 and 0<end-first<=1500*base.M,
         "Invalid KuCoin source request")
    return ENDPOINT+"?"+urlencode({"symbol":asset+"-USDT","type":"1min",
        "startAt":first//1000,"endAt":(end-1)//1000})


def parse(response,first,end):
    need(isinstance(response,dict) and response.get("code")=="200000"
         and isinstance(response.get("data"),list)
         and len(response["data"])<=1500,"KuCoin did not certify the original response")
    bars={};extra=0
    for row in response["data"]:
        need(isinstance(row,list) and len(row)>=7,"Unexpected KuCoin native Spot candle")
        t=int(row[0])*1000
        try:
            op,cl,hi,lo,volume,turnover=map(Decimal,map(str,row[1:7]))
        except InvalidOperation as e:raise ValueError("Invalid KuCoin historic prices") from e
        need(t%base.M==0 and all(x.is_finite() for x in (op,cl,hi,lo,volume,turnover))
             and lo>0 and lo<=min(op,cl) and max(op,cl)<=hi
             and volume>=0 and turnover>=0,"Invalid KuCoin original OHLCV")
        if not first<=t<end:
            extra+=1
            continue
        need(t not in bars,"Duplicated KuCoin 1m source")
        bars[t]=(op,hi,lo,cl,volume,turnover)
    return bars,extra


def verify(asset,first,end,fetch=base.fetch):
    address=url(asset,first,end)
    rsp=fetch(address,ENDPOINT)
    out={"venue":"KuCoin Spot","pair":asset+"-USDT","quote":"USDT",
         "url":address,"start_utc":base.iso(first),"end_exclusive_utc":base.iso(end),
         "expected_minutes":(end-first)//base.M,"source_status":rsp["status"],
         "http_status":rsp.get("http_status"),"response_sha256":rsp.get("sha256"),
         "minute_bars":0,"positive_volume_minutes":0,
         "outside_window_bars":0,"samples":[]}
    if rsp["status"]!="http_200":
        out["conclusion"]="source_inconclusive"
        return out,{}
    obj=rsp["json"]
    if not isinstance(obj,dict) or obj.get("code")!="200000":
        out["conclusion"]="exchange_api_error_or_unsupported_source"
        out["exchange_error_code"]=obj.get("code") if isinstance(obj,dict) else None
        return out,{}
    candles,extras=parse(obj,first,end)
    out["minute_bars"]=len(candles)
    out["positive_volume_minutes"]=sum(v[4]>0 for v in candles.values())
    out["outside_window_bars"]=extras
    out["missing_minutes"]=out["expected_minutes"]-len(candles)
    for t in (min(candles),max(candles)) if candles else ():
        x=candles[t]
        out["samples"].append({"minute_utc":base.iso(t),"open":str(x[0]),
                         "close":str(x[3]),"base_volume":str(x[4])})
    out["conclusion"]=("all_minutes_traded_on_independent_kucoin" if
         out["positive_volume_minutes"]==out["expected_minutes"] else
         "some_historical_kucoin_trading_verified" if out["positive_volume_minutes"] else
         "no_verified_kucoin_trading_in_historical_response")
    return out,candles


def audit(output=OUTPUT,fetch=base.fetch):
    meta=json.loads(SOURCE.read_text())
    need(meta["schema"]=="seven.crypto.cross-venue-historical-gap-matrix.v1"
         and len(meta["rows"])==42 and meta["btc_expected_gap_minutes"]==5881,
         "Cross-venue matrix is not the accepted source")
    candidate=[r for r in meta["rows"] if r["asset"]=="BNB"]
    need(len(candidate)==4,"Expected precisely four BNB comparison windows")
    for t in meta["rows"]:
        if t["asset"]=="SOL" and t["window_start_utc"].startswith("2021-08-13"):
            candidate.append(t)
    need(len(candidate)==5,"Expected SOL partial Coinbase source comparison")
    evidence=[]
    for row in candidate:
        a=row["asset"];start=base.datetime.fromisoformat(
             row["window_start_utc"].replace("Z","+00:00"))
        end=base.datetime.fromisoformat(
             row["window_end_exclusive_utc"].replace("Z","+00:00"))
        s=int(start.timestamp()*1000);e=int(end.timestamp()*1000)
        market,candles=verify(a,s,e,fetch)
        result={"asset":a,"original_binance_gap_reference":row["window_start_utc"],
                "source_btc_window_minutes":row["window_calendar_minutes"],
                "binance_pair":row["binance_alt"]["pair"],
                "binance_spot_rows_in_window":row["binance_alt"]["candles_present"],
                "kucoin":market,"no_cross_exchange_candle_substitution":True}
        if a=="SOL":
            # Re-fetch Coinbase's 1m response for precise UTC missing minute;
            # never assume which minute was absent from the summary count.
            original={}
            probes=[]
            for cb_start,cb_end in base.slices(s,e):
                cp_url=base.coinbase_url(a,cb_start,cb_end)
                rsp=fetch(cp_url,base.CBASE)
                probes.append({"source_url":cp_url,"status":rsp["status"],
                               "response_sha256":rsp.get("sha256")})
                if rsp["status"]=="http_200":
                    piece,_=base.parse_coinbase(rsp["json"],cb_start,cb_end)
                    need(not set(piece)&set(original),"Coinbase independent minute is duplicated")
                    original.update(piece)
            cb={"status":"verified_api_response" if all(
                  q["status"]=="http_200" for q in probes) else "inconclusive_api",
                "pair":"SOL-USD","quote":"USD",
                "requests":probes,"valid_minute_bars":len(original)}
            if cb["status"]=="verified_api_response":
                missing=sorted(set(range(s,e,base.M))-set(original))
                cb["historical_missing_minutes"]=[base.iso(t) for t in missing]
                cb["missing_source_minute_on_kucoin"]=[
                    {"minute_utc":base.iso(t),
                     "kucoin_native_trade":t in candles and candles[t][4]>0}
                    for t in missing]
            result["coinbase_second_independent_query"]=cb
        evidence.append(result)
        print("KUCOIN CROSSCHECK",a,row["window_start_utc"],
              market["positive_volume_minutes"],"of",row["window_calendar_minutes"],
              market["conclusion"],flush=True)
    doc={"schema":"seven.crypto.kucoin-bnb-sol-source-crosscheck.v1",
         "source_policy":POLICY,
         "cross_venue_matrix_sha256":sha256(SOURCE.read_bytes()).hexdigest(),
         "quote_separated":True,"binance_originals_unchanged":True,
         "coinbase_originals_unchanged":True,"no_synthetic_minutes":True,
         "samples":evidence,
         "summary":{a:{"windows":sum(v["asset"]==a for v in evidence),
                       "traded_windows":sum(v["asset"]==a and
                         v["kucoin"]["positive_volume_minutes"]>0 for v in evidence),
                       "fully_traded_windows":sum(v["asset"]==a and
                         v["kucoin"]["conclusion"]=="all_minutes_traded_on_independent_kucoin"
                         for v in evidence)} for a in ("BNB","SOL")},
         "notes":"KuCoin BNB-USDT listed June 19 2019. Exact independent historical spot evidence; does not imply Binance-generated candles or full global price coverage."}
    target=Path(output);target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(json.dumps(doc,sort_keys=True,indent=2,ensure_ascii=False)+"\n")
    print("KUCOIN SOURCE SUMMARY",json.dumps(doc["summary"],sort_keys=True))
    return doc


def main():
    p=argparse.ArgumentParser();p.add_argument("--audit-only",action="store_true")
    p.add_argument("--output",type=Path,default=OUTPUT)
    a=p.parse_args()
    if a.audit_only:
        j=json.loads(SOURCE.read_text())
        print("EXPECTED SOURCE MATRIX",len(j["rows"]),"BNB 4 SOL1",
              "sha256",sha256(SOURCE.read_bytes()).hexdigest())
    else:audit(output=a.output)


if __name__=="__main__":main()
