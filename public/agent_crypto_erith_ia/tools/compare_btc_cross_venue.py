#!/usr/bin/env python3
"""Compare independent real BTC/USD trading against Binance BTC/USDT pause.

2023-03-24 12:40..14:00 UTC, 80 minutes. Entire Coinbase Exchange BTC-USD
minute candle interval, plus independent Kraken XBTUSD historical Trades
probes (separated across the interval). Quote USD, NEVER Binance USDT.
No fabricated OHLCV, no keys, no changes to Trader or canonical archives.

If venue API cannot be queried or refuses deep history, report INCONCLUSIVE.
An HTTP 200 alone is not proof of historic trades: exact timestamp, volume and
price validation is required. Logs and JSON give UTC sample evidence and limits.
"""
from __future__ import annotations
import argparse
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from hashlib import sha256
import json
from pathlib import Path
import time
from urllib.parse import urlencode
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1] / "data/historical_archive_prototype"
OUT = ROOT / "btc_cross_exchange_incident_2023_03_24"
BINANCE_GAP_INDEX = ROOT / "btc_verified_gap_months/index.json"
COINBASE_ENDPOINT = "https://api.exchange.coinbase.com/products/BTC-USD/candles"
KRAKEN_ENDPOINT = "https://api.kraken.com/0/public/Trades"
START = 1679661600000 # 2023-03-24T12:40:00Z
END = 1679666400000   # 2023-03-24T14:00:00Z
MINUTE = 60_000
EXPECTED = (END - START) // MINUTE
# Five probes, rather than claiming 80-minute completeness from 5 pages.
PROBE_MINUTES = (0, 19, 39, 59, 79)


def need(ok, why):
    if not ok:
        raise ValueError(why)


def iso(ms):
    return datetime.fromtimestamp(ms / 1000, timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def digest(raw):
    return sha256(raw).hexdigest()


def source_check(root=ROOT):
    raw = (Path(root) / "btc_verified_gap_months/index.json").read_bytes()
    meta = json.loads(raw)
    btc = next(x for x in meta["months"] if x["month"] == "2023-03")
    gaps = btc["gaps"]
    need(meta["pair"] == "BTCUSDT" and meta["quote"] == "USDT"
         and len(gaps) == 1 and gaps[0]["start_ms"] == START
         and gaps[0]["end_ms_exclusive"] == END
         and gaps[0]["missing_minutes"] == 80,
         "Our Binance source gap is not the audited 80-minute incident")
    return digest(raw)


def http_json(url, allowed_prefix, max_bytes=320000):
    need(url.startswith(allowed_prefix + "?") and ".." not in url,
         "External URL isn't an allowed official exchange API")
    for attempt in range(3):
        try:
            with urlopen(Request(url, headers={
                "User-Agent": "Seven-Heaven-cross-venue-evidence",
                "Accept": "application/json"}), timeout=27) as rsp:
                need(rsp.status == 200, "Unexpected venue HTTP status")
                raw = rsp.read(max_bytes + 1)
            need(0 < len(raw) <= max_bytes, "Unexpected source response size")
            return {"status": "http_200", "json": json.loads(raw),
                    "sha256": digest(raw), "bytes": len(raw)}
        except HTTPError as exc:
            if exc.code in (400, 401, 403, 404, 418, 429, 451):
                return {"status": "http_restricted", "http_status": exc.code}
            if attempt == 2:
                return {"status": "http_error", "http_status": exc.code}
        except (URLError, TimeoutError, OSError, json.JSONDecodeError) as exc:
            if attempt == 2:
                return {"status": "request_inconclusive",
                        "cause": type(exc).__name__}
        time.sleep(attempt + 1)
    raise RuntimeError("Venue public source status not classified")


def coinbase_url():
    args = urlencode({"start": iso(START), "end": iso(END),
                      "granularity": 60})
    return COINBASE_ENDPOINT + "?" + args


def check_coinbase(result):
    checked = {"venue":"Coinbase Exchange","pair":"BTC-USD",
               "quote":"USD","interval":"1m","source_url":coinbase_url(),
               "requested_first_open_utc":iso(START),
               "requested_end_exclusive_utc":iso(END),
               "expected_minutes":EXPECTED,
               "source_status":result["status"],
               "response_sha256":result.get("sha256"),
               "http_status":result.get("http_status"),
               "minute_candles":0, "positive_volume_minutes":0,
               "negative_or_invalid_rows":0, "missing_minutes":EXPECTED}
    if result["status"] != "http_200":
        checked["conclusion"] = "inconclusive_source_unavailable"
        return checked
    data = result["json"]
    need(isinstance(data,list) and len(data)<=300,
         "Coinbase returned unexpected candle structure or count")
    timestamps={}
    for x in data:
        need(isinstance(x,list) and len(x)>=6,
             "Invalid Coinbase historical OHLCV row")
        ts=x[0]*1000
        low,high,opening,closing,volume=map(Decimal,map(str,x[1:6]))
        need(isinstance(ts,int) and ts%MINUTE==0 and START<=ts<END
             and ts not in timestamps and all(v.is_finite()
             for v in (low,high,opening,closing,volume))
             and low>0 and low<=min(opening,closing)
             and max(opening,closing)<=high and volume>=0,
             "Invalid Coinbase minute timestamp, OHLCV or duplicate")
        timestamps[ts]=(volume,opening,high,low,closing)
    checked["minute_candles"]=len(timestamps)
    checked["positive_volume_minutes"]=sum(v[0]>0 for v in timestamps.values())
    checked["missing_minutes"]=EXPECTED-len(timestamps)
    checked["all_80_minutes_present"]=len(timestamps)==EXPECTED
    for t in (START,START+40*MINUTE,END-MINUTE):
        if t in timestamps:
            v=timestamps[t]
            checked.setdefault("samples",[]).append({
                "open_time_utc":iso(t),"open_usd":str(v[1]),
                "high_usd":str(v[2]),"low_usd":str(v[3]),
                "close_usd":str(v[4]),"btc_volume":str(v[0])})
    checked["conclusion"]=(
       "historic_btc_usd_trading_verified_entire_interval"
       if checked["all_80_minutes_present"] and checked["positive_volume_minutes"]==80
       else "historic_btc_usd_trading_verified_partial_interval"
       if checked["positive_volume_minutes"]>0
       else "no_verified_trades_in_response")
    return checked


def kraken_url(minute_start):
    need(minute_start%MINUTE==0 and START<=minute_start<END,
         "Kraken trade timestamp outside target incident")
    return KRAKEN_ENDPOINT+"?"+urlencode({
        "pair":"XBTUSD","since":str(minute_start*1_000_000)})


def check_kraken_probe(t,result):
    record={"minute_open_utc":iso(t),"source_url":kraken_url(t),
            "source_status":result["status"],
            "response_sha256":result.get("sha256"),
            "http_status":result.get("http_status"),
            "verified_trade_in_this_minute":False}
    if result["status"]!="http_200":
        record["conclusion"]="inconclusive_source_unavailable"
        return record
    obj=result["json"]
    need(isinstance(obj,dict) and
         isinstance(obj.get("error"),list),"Unexpected Kraken Trades response")
    if obj["error"]:
        record["conclusion"]="inconclusive_kraken_api_error"
        record["api_errors"]=obj["error"]
        return record
    res=obj.get("result")
    need(isinstance(res,dict),"Missing Kraken historical trades result")
    pair_key=next((k for k in res if k!="last"),None)
    need(pair_key is not None and isinstance(res[pair_key],list)
         and len(res[pair_key])<=1000,
         "Unexpected Kraken XBTUSD historical result")
    seen=[]
    for trade in res[pair_key]:
        need(isinstance(trade,list) and len(trade)>=4,
             "Unexpected Kraken raw trade")
        try:
            price,amount,ts=(Decimal(str(trade[0])),
                             Decimal(str(trade[1])),
                             Decimal(str(trade[2])))
        except InvalidOperation as exc:
            raise ValueError("Invalid Kraken trade numeric values") from exc
        need(price.is_finite() and amount.is_finite() and ts.is_finite()
             and price>0 and amount>0, "Kraken trade has invalid price/amount/time")
        ms=int(ts*1000)
        if t<=ms<t+MINUTE:
            seen.append((price,amount,ms))
    record["page_trade_count"]=len(res[pair_key])
    record["trades_at_exact_minute"]=len(seen)
    record["verified_trade_in_this_minute"]=bool(seen)
    if seen:
        record["example"]={"trade_time_utc":iso(seen[0][2]),
            "price_usd":str(seen[0][0]),"btc_volume":str(seen[0][1])}
    record["conclusion"]=("historical_trade_verified_exact_minute" if seen
          else "no_exact_minute_trade_in_first_page_not_proof_of_no_trading")
    return record


def audit(root=ROOT,output=OUT, fetch=http_json):
    source_hash=source_check(root)
    cu=coinbase_url()
    coinbase=check_coinbase(fetch(cu,COINBASE_ENDPOINT))
    probes=[]
    for offset in PROBE_MINUTES:
        t=START+offset*MINUTE
        probes.append(check_kraken_probe(t,fetch(kraken_url(t),KRAKEN_ENDPOINT)))
        # Conservative gap between public requests, avoid bursting Kraken.
        time.sleep(1)
    has_coinbase=coinbase["positive_volume_minutes"]>0
    has_kraken=any(p["verified_trade_in_this_minute"] for p in probes)
    obj={"schema":"seven.crypto.btc.cross-venue-incident-evidence.v1",
         "incident":"Binance Spot outage 2023-03-24",
         "first_utc":iso(START),"end_exclusive_utc":iso(END),
         "requested_minutes":EXPECTED,
         "binance":{"pair":"BTCUSDT","quote":"USDT","venue":"Binance Spot",
           "native_1m_gap_minutes":80,
           "gap_source_catalog_sha256":source_hash},
         "coinbase_exchange":coinbase,
         "kraken_spot":{"venue":"Kraken Spot","pair":"XBTUSD","quote":"USD",
                        "probes":probes,
                        "exact_minute_trade_probes":sum(p["verified_trade_in_this_minute"] for p in probes),
                        "samples_attempted":len(probes)},
         "other_venues_trading_during_binance_outage":(has_coinbase or has_kraken),
         "data_represent_real_independent_venue":True,
         "comparing_not_replacing_binance_bars":True,
         "binance_missing_1m_recovered":0,
         "limitations":"Kraken Trades probe only 5 minutes, not all 80; Coinbase historical candle count reflects 1-minute OHLCV only if response available. Independent USD venues are not Binance USDT."}
    dest=Path(output);dest.mkdir(parents=True,exist_ok=True)
    (dest/"index.json").write_text(json.dumps(obj,indent=2,sort_keys=True,
                        ensure_ascii=False)+"\n",encoding="utf-8")
    print("BTC MARCH2023 CROSS-VENUE",json.dumps({
       "coinbase_status":coinbase["source_status"],
       "coinbase_real_minutes":coinbase["positive_volume_minutes"],
       "coinbase_rows":coinbase["minute_candles"],
       "kraken_valid_trade_probes":obj["kraken_spot"]["exact_minute_trade_probes"],
       "outage_was_global":False if has_coinbase or has_kraken else "not established",
       "global_btc_trading_continued":obj["other_venues_trading_during_binance_outage"]
    },sort_keys=True),flush=True)
    return obj


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--output",type=Path,default=OUT)
    p.add_argument("--audit-only",action="store_true")
    a=p.parse_args()
    if a.audit_only:
        print("SOURCE AUDIT",json.dumps({"binance_sha256":source_check(),
             "interval":[iso(START),iso(END)],
             "coinbase_url":coinbase_url(),
             "kraken_sample_minutes":[iso(START+i*MINUTE) for i in PROBE_MINUTES]}))
    else:audit(output=a.output)


if __name__=="__main__":main()
