#!/usr/bin/env python3
"""Evidence-led cross-venue incident matrix; existing Crypto Coffre, read-only.

BTC: all 27 original verified Binance Spot BTCUSDT missing-minute intervals
(5,881 minutes), independently check Coinbase Exchange BTC/USD candles (1m).
ETH, BNB, XRP, SOL: compare four selected Binance outage windows, **checking
each Binance pair independently**; never assume the BTC pause affected it.

XRP Coinbase was suspended Jan 2021--July 2023. SOL listed Coinbase
June 2021. A Coinbase 404 or empty historical range is NOT proof of
worldwide inactivity or of an asset's Binance listing. Kraken probes are
independent exact-minute positive evidence only, not 1m coverage proof.

USD Coinbase/Kraken and USDT Binance are distinct, never merged or
converted. No invented OHLCV, no alteration to original indexed datasets.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
import gzip
import hashlib
import json
from pathlib import Path
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

HERE=Path(__file__).resolve().parents[1]/"data/historical_archive_prototype"
OUTPUT=HERE/"cross_venue_gap_matrix"/"index.json"
SOURCE=HERE/"btc_verified_gap_months/index.json"
SOURCE_REFERENCE=HERE/"btc_daily_reference/index.json"
M=60_000
MAX_MINUTES=250
SELECTED={"2020-12-21","2021-08-13","2021-09-29","2023-03-24"}
ASSETS={
 "BTC":{"binance":"BTCUSDT","coinbase":"BTC-USD","kraken":"XBTUSD"},
 "ETH":{"binance":"ETHUSDT","coinbase":"ETH-USD","kraken":"ETHUSD"},
 "BNB":{"binance":"BNBUSDT","coinbase":"BNB-USD","kraken":"BNBUSD"},
 "XRP":{"binance":"XRPUSDT","coinbase":"XRP-USD","kraken":"XRPUSD"},
 "SOL":{"binance":"SOLUSDT","coinbase":"SOL-USD","kraken":"SOLUSD"},
}
CBASE="https://api.exchange.coinbase.com/products/"
BBASE="https://data-api.binance.vision/api/v3/klines"
KBASE="https://api.kraken.com/0/public/Trades"
POLICY="native_venue_candles_utc_exact_non_fungible_quotes.v1"


def need(test,why):
    if not test:raise ValueError(why)


def iso(ms):
    return datetime.fromtimestamp(ms/1000,timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def sha(buf):return hashlib.sha256(buf).hexdigest()


def expected_range():
    raw=SOURCE.read_bytes()
    obj=json.loads(raw)
    need(obj["pair"]=="BTCUSDT" and obj["quote"]=="USDT" and
         obj["resolution"]=="1m" and obj["missing_calendar_minutes"]==5881,
         "Canonical native BTC gaps unexpectedly changed")
    base=json.loads(SOURCE_REFERENCE.read_text())
    need(base["utc_day_count"]==3075 and base["gaps_in_daily_series"]==0
         and base["one_minute_complete"] is False,
         "BTC daily reference is no longer locked")
    gaps=sorted(({"start_ms":g["start_ms"],"end_ms":g["end_ms_exclusive"],
       "missing":g["missing_minutes"],"day":iso(g["start_ms"])[:10]}
       for month in obj["months"] for g in month["gaps"]),
       key=lambda x:x["start_ms"])
    need(len(gaps)==27 and sum(g["missing"] for g in gaps)==5881
         and all((g["end_ms"]-g["start_ms"])//M==g["missing"] for g in gaps),
         "Original BTC gap clock has changed")
    return gaps,sha(raw),base["locked_source"]["data_sha256"]


def tasks():
    gaps,_,_=expected_range()
    out=[{"asset":"BTC",**g} for g in gaps]
    for asset in ("ETH","BNB","XRP","SOL"):
        for g in gaps:
            if g["day"] not in SELECTED:continue
            # Coinbase markets cannot corroborate a time when they did not
            # yet list the asset (SOL) or when trading was suspended (XRP).
            if asset=="SOL" and g["day"]<"2021-06-17":continue
            out.append({"asset":asset,**g})
    return out


def venue_policy(asset,date):
    if asset=="SOL" and date<"2021-06-17":
        return "coinbase_not_yet_listed"
    if asset=="XRP" and "2021-01-19"<=date<"2023-07-13":
        return "coinbase_xrp_trading_suspended"
    if asset=="BNB":
        # Current availability says nothing about earlier BNB-USD listing.
        # Querying the API is discovery, not presumption of active listing.
        return "historical_product_listing_unconfirmed"
    return "possible_historical_pair_verify_from_data"


def fetch(url,prefix,tries=2):
    need(url.startswith(prefix) and ".." not in url and
         url.startswith("https://"),"Unauthorized venue URL")
    for attempt in range(tries):
        try:
            with urlopen(Request(url,headers={"Accept":"application/json",
                     "User-Agent":"Seven-Heaven-source-qualified-audit"}),
                     timeout=24) as rsp:
                need(rsp.status==200,"Non-200 official venue response")
                raw=rsp.read(1_000_001)
            need(len(raw)<=1_000_000,"Oversized venue response")
            return {"status":"http_200","json":json.loads(raw),
                    "sha256":sha(raw)}
        except HTTPError as e:
            if e.code in (400,401,403,404,418,429,451):
                return {"status":"http_unavailable","http_status":e.code}
            if attempt==tries-1:
                return {"status":"http_error","http_status":e.code}
        except (URLError,TimeoutError,OSError,json.JSONDecodeError) as e:
            if attempt==tries-1:
                return {"status":"transport_inconclusive","reason":type(e).__name__}
        time.sleep(1+attempt)
    raise RuntimeError("Unclassified network response")


def slices(first,end):
    need(first<end and (end-first)%M==0 and first%M==0 and end%M==0,
         "Invalid aligned UTC gap")
    current=first
    while current<end:
        bound=min(end,current+M*MAX_MINUTES)
        yield current,bound
        current=bound


def coinbase_url(asset,first,end):
    need(asset in ASSETS and 0<(end-first)<=M*MAX_MINUTES,
         "Coinbase range exceeds 250 UTC minutes")
    qs=urlencode({"start":iso(first),"end":iso(end),"granularity":60})
    return CBASE+ASSETS[asset]["coinbase"]+"/candles?"+qs


def binance_url(asset,first,end):
    need(asset in ASSETS and 0<(end-first)<=M*MAX_MINUTES,
         "Binance range exceeds 250 UTC minutes")
    return BBASE+"?"+urlencode({"symbol":ASSETS[asset]["binance"],
       "interval":"1m","startTime":first,"endTime":end-M,"limit":1000})


def parse_coinbase(raw,first,end):
    need(isinstance(raw,list) and len(raw)<=300,"Bad Coinbase response list")
    accepted={};outside=0
    for row in raw:
        need(isinstance(row,list) and len(row)>=6
             and type(row[0]) in (int,float),
             "Invalid Coinbase native candle")
        t=int(row[0]*1000)
        try:
            lo,hi,op,cl,v=[Decimal(str(x)) for x in row[1:6]]
        except InvalidOperation as exc:raise ValueError("Coinbase decimal invalid") from exc
        need(t%M==0 and all(x.is_finite() for x in (lo,hi,op,cl,v))
             and lo>0 and lo<=min(op,cl) and max(op,cl)<=hi and v>=0,
             "Bad Coinbase OHLCV or UTC timestamp")
        if not first<=t<end:
            outside+=1
            continue
        need(t not in accepted,"Duplicated Coinbase native candle")
        accepted[t]=(op,hi,lo,cl,v)
    return accepted,outside


def parse_binance(raw,first,end):
    need(isinstance(raw,list) and len(raw)<=1000,
         "Bad Binance Spot kline response")
    accepted={};outside=0
    for row in raw:
        need(isinstance(row,list) and len(row)==12,
             "Invalid Binance Spot kline layout")
        t=int(row[0])
        try:
            op,hi,lo,cl,v=[Decimal(str(x)) for x in row[1:6]]
        except InvalidOperation as exc:raise ValueError("Binance decimal invalid") from exc
        need(t%M==0 and all(x.is_finite() for x in (op,hi,lo,cl,v))
             and lo>0 and lo<=min(op,cl) and max(op,cl)<=hi and v>=0,
             "Invalid Binance historical native OHLCV")
        if not first<=t<end:
            outside+=1
            continue
        need(t not in accepted,"Duplicated Binance source kline")
        accepted[t]=(op,hi,lo,cl,v)
    return accepted,outside


def check_market(asset,first,end,provider,request):
    need(asset in ASSETS and provider in ("coinbase","binance"),
         "Unexpected market provider")
    candles={};errors=[];sources=[];outside=0
    for s,e in slices(first,end):
        url=coinbase_url(asset,s,e) if provider=="coinbase" else binance_url(asset,s,e)
        rsp=request(url,CBASE if provider=="coinbase" else BBASE)
        sources.append({"start_utc":iso(s),"end_utc":iso(e),
             "url":url,"status":rsp["status"],"sha256":rsp.get("sha256"),
             "http_status":rsp.get("http_status")})
        if rsp["status"]!="http_200":
            errors.append(rsp["status"])
            continue
        parsed,extras=(parse_coinbase(rsp["json"],s,e) if provider=="coinbase"
                       else parse_binance(rsp["json"],s,e))
        outside+=extras
        for t,bar in parsed.items():
            need(t not in candles,"Overlapping batches created duplicate OHLCV")
            candles[t]=bar
        time.sleep(.10)
    expected=(end-first)//M
    found=len(candles);positive=sum(bar[4]>0 for bar in candles.values())
    checked={
       "exchange":"Coinbase Exchange" if provider=="coinbase" else "Binance Spot",
       "pair":ASSETS[asset]["coinbase" if provider=="coinbase" else "binance"],
       "quote":"USD" if provider=="coinbase" else "USDT","interval":"1m",
       "expected_minutes":expected,"candles_present":found,
       "positive_volume_minutes":positive,"missing_minutes":expected-found,
       "outside_window_rows_excluded":outside,
       "request_count":len(sources),"requests":sources,
       "status":"inconclusive_api" if errors else "verified_api_response",
       "response_errors":errors,
       "all_minutes_traded":not errors and positive==expected,
       "at_least_one_minute_traded":positive>0}
    if candles:
        for t in (min(candles),max(candles)):
            b=candles[t]
            checked.setdefault("sample_bars",[]).append({
                "timestamp":iso(t),"open":str(b[0]),"close":str(b[3]),
                "volume":str(b[4])})
    return checked


def kraken_url(asset,minute):
    need(asset in ASSETS and minute%M==0,"Kraken invalid exact minute")
    return KBASE+"?"+urlencode({"pair":ASSETS[asset]["kraken"],
                    "since":minute*1_000_000})


def probe_kraken(asset,first,end,request):
    ts=sorted({first,first+(end-first)//(2*M)*M,end-M})
    points=[]
    for t in ts:
        u=kraken_url(asset,t)
        rsp=request(u,KBASE)
        record={"time_utc":iso(t),"url":u,"status":rsp["status"],
                "response_sha256":rsp.get("sha256"),"http_status":rsp.get("http_status"),
                "verified_trades_at_minute":0}
        if rsp["status"]=="http_200":
            obj=rsp["json"]
            need(isinstance(obj,dict) and isinstance(obj.get("error"),list),
                 "Kraken malformed API JSON")
            if obj["error"]:
                record["status"]="api_error"
                record["error_codes"]=obj["error"]
            else:
                data=obj.get("result")
                need(isinstance(data,dict),"Kraken API missing trade page")
                k=next((x for x in data if x!="last"),None)
                need(k is not None and isinstance(data[k],list),
                     "Unexpected Kraken trade pair list")
                trades=0
                for tr in data[k]:
                    need(isinstance(tr,list) and len(tr)>=3,
                         "Malformed Kraken original trade")
                    p,q,st=(Decimal(str(tr[0])),Decimal(str(tr[1])),
                            Decimal(str(tr[2])))
                    need(all(x.is_finite() for x in (p,q,st)) and p>0 and q>0,
                         "Invalid Kraken original trade price/amount")
                    if t<=int(st*1000)<t+M:trades+=1
                record["verified_trades_at_minute"]=trades
                record["page_rows"]=len(data[k])
        points.append(record)
        time.sleep(.30)
    return {"exchange":"Kraken Spot","pair":ASSETS[asset]["kraken"],
      "quote":"USD","points":points,
      "sample_minutes_attempted":len(points),
      "exact_minute_positive_probes":sum(p["verified_trades_at_minute"]>0
                                         for p in points),
      "not_entire_interval_coverage":True}


def perform(output=OUTPUT,request=fetch,short=False):
    issues,source_sha,reference_sha=expected_range()
    targets=tasks()
    if short:targets=targets[:2]
    records=[]
    for i,item in enumerate(targets):
        a=item["asset"];s=item["start_ms"];e=item["end_ms"]
        if a=="XRP" and venue_policy(a,item["day"])=="coinbase_xrp_trading_suspended":
            cb={"exchange":"Coinbase Exchange","pair":"XRP-USD","quote":"USD",
                "status":"skipped_official_trading_suspension","candles_present":0,
                "positive_volume_minutes":0,"all_minutes_traded":False,
                "expected_minutes":(e-s)//M,"request_count":0}
        else:
            cb=check_market(a,s,e,"coinbase",request)
        binance=(None if a=="BTC" else check_market(a,s,e,"binance",request))
        # Kraken probes on all 4 alt assets; on BTC, several carefully
        # selected widely separated dates, preserving API request fairness.
        ka=probe_kraken(a,s,e,request) if (a!="BTC" or
          item["day"] in ("2018-06-26","2020-12-21","2021-08-13","2023-03-24")) else None
        records.append({"asset":a,"window_start_utc":iso(s),
          "window_end_exclusive_utc":iso(e),
          "window_calendar_minutes":item["missing"],
          "source_btc_binance_gap":a=="BTC",
          "alt_asset_binance_window_not_assumed_missing":a!="BTC",
          "coinbase_market_eligibility":venue_policy(a,item["day"]),
          "coinbase":cb,"binance_alt":binance,"kraken":ka,
          "independent_usd_trading_demonstrated":
            cb["positive_volume_minutes"]>0 or
            (ka is not None and ka["exact_minute_positive_probes"]>0)})
        print("SOURCE MATRIX",i+1,len(targets),a,iso(s),
              "Coinbase",cb["positive_volume_minutes"],"/",cb["expected_minutes"],
              "Kraken",ka["exact_minute_positive_probes"] if ka else "not sampled",
              flush=True)
    summary={}
    for asset in ASSETS:
        a=[r for r in records if r["asset"]==asset]
        summary[asset]={
          "windows":len(a),"calendar_minutes":sum(x["window_calendar_minutes"] for x in a),
          "coinbase_complete_windows":sum(r["coinbase"].get("all_minutes_traded",False) for r in a),
          "coinbase_any_trade_windows":sum(r["coinbase"]["positive_volume_minutes"]>0 for r in a),
          "kraken_any_trade_windows":sum(bool(r["kraken"]) and
                    r["kraken"]["exact_minute_positive_probes"]>0 for r in a),
          "independent_trading_windows":sum(r["independent_usd_trading_demonstrated"] for r in a),
          "binance_alt_pair_windows_with_bars":sum(bool(r["binance_alt"]) and
                            r["binance_alt"]["candles_present"]>0 for r in a)}
    need(sum(v["windows"] for v in summary.values())==len(records),
         "Cross-venue matrix rows lost")
    obj={"schema":"seven.crypto.cross-venue-historical-gap-matrix.v1",
        "policy":POLICY,"input_btc_gap_catalog_sha256":source_sha,
        "protected_daily_reference_sha256":reference_sha,
        "btc_expected_gap_minutes":5881 if not short else None,
        "btc_gap_windows_total":27 if not short else None,
        "focus_windows":["2020-12-21","2021-08-13","2021-09-29","2023-03-24"],
        "asset_list":list(ASSETS),"summary":summary,"rows":records,
        "historical_product_listing_is_not_inferred_from_today":True,
        "note":"BTC outage intervals are NOT automatically verified as Binance outage intervals for ETH BNB XRP SOL. Positive USD candles/spot trades prove activity only on named exchange, not Binance USDT candles. No historical source was rewritten, no minute OHLCV interpolated.",
        "trader_modified":False,"original_sources_modified":False}
    out=Path(output);out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(obj,sort_keys=True,indent=2,ensure_ascii=False)+"\n")
    print("MATRIX SUMMARY",json.dumps(summary,sort_keys=True),flush=True)
    return obj


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--audit-only",action="store_true")
    p.add_argument("--output",type=Path,default=OUTPUT)
    a=p.parse_args()
    if a.audit_only:
        x=tasks()
        print("SOURCE-SCOPED BTC TOP5 MATRIX",json.dumps({
            "tasks":len(x),"btc":sum(v["asset"]=="BTC" for v in x),
            "assets":{a:sum(t["asset"]==a for t in x) for a in ASSETS},
            "binance_1m_missing":5881,"source_sha":expected_range()[1]}))
    else:perform(output=a.output)


if __name__=="__main__":main()
