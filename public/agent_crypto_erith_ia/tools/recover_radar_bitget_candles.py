#!/usr/bin/env python3
"""Recover authentic Bitget Spot 15m candles; NEVER reconstruct missed book snapshots.

Archives are a separate historical evidence layer. A bad/short API response
never becomes a complete 24-hour study and never mutates live hourly records.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import pathlib
import urllib.parse
import urllib.request
from decimal import Decimal

import collect_case_market_hourly as market
from collect_radar_verified_targets import (TARGETS, IDENTITY, ROOT, validated_targets)
from prove_public_spot_contracts import PLATFORMS, address

DEST = ROOT / "data/crypto/radar-verified-target-history"
SCHEMA = "erith.radar.verified-target-history-15m.v1"
UTC = dt.timezone.utc
STEP_MS = 15 * 60 * 1000
EARLIEST_DAY = dt.date(2026, 10, 22)
ENDPOINT = "/api/v3/market/history-candles"
HOST = "api.bitget.com"


def require(ok, message):
    if not ok:
        raise ValueError(message)


def canonical(obj):
    return json.dumps(obj, sort_keys=True, ensure_ascii=False,
                      separators=(",", ":"), allow_nan=False).encode("utf-8")


def sha(obj):
    return hashlib.sha256(canonical(obj)).hexdigest()


def historical_json(url):
    u = urllib.parse.urlsplit(url)
    require(u.scheme == "https" and u.hostname == HOST and
            u.path == ENDPOINT and u.username is None and u.password is None and
            u.port is None and u.fragment == "", "Untrusted Bitget source")
    q = urllib.parse.parse_qs(u.query)
    require(set(q) == {"category", "symbol", "interval", "startTime", "endTime", "limit"} and
            all(len(v) == 1 for v in q.values()) and
            q["category"] == ["SPOT"] and q["interval"] == ["15m"] and
            q["limit"] == ["100"] and q["symbol"][0] in {x[2] for x in TARGETS} and
            q["startTime"][0].isdigit() and q["endTime"][0].isdigit(),
            "Unapproved historical request")
    request = urllib.request.Request(url, headers={
        "Accept": "application/json", "User-Agent": "ERITH-IA-Public-Research/1.0"})
    with urllib.request.urlopen(request, timeout=22) as response:
        final = urllib.parse.urlsplit(response.url)
        require(response.status == 200 and final.scheme == "https" and
                final.hostname == HOST and final.path == ENDPOINT,
                "Untrusted API redirect")
        raw = response.read(1200001)
        require(0 < len(raw) <= 1200000, "Malformed/oversized historical payload")
    return json.loads(raw)


def current_native_identity(fetch_live, target):
    """Recheck the exact token chain/contract and native Spot pair at recovery."""
    cid, symbol, pair, chain, contract = target
    coins = market.api(fetch_live, HOST, "/api/v3/market/coins", coin=symbol).get("data")
    require(isinstance(coins, list), "Bitget coin metadata unavailable")
    match = [r for r in coins if isinstance(r, dict) and r.get("coin") == symbol]
    require(len(match) == 1 and isinstance(match[0].get("chains"), list),
            "Ambiguous native Spot identity")
    chains = [c for c in match[0]["chains"] if isinstance(c, dict) and
              PLATFORMS.get(str(c.get("chain", "")).upper()) == chain and
              address(c.get("contractAddress")) == contract]
    require(len(chains) == 1, "Unverified native token contract")
    instruments = market.api(fetch_live, HOST, "/api/v3/market/instruments",
                             category="SPOT", symbol=pair).get("data")
    require(isinstance(instruments, list) and len(instruments) == 1,
            "Instrument unavailable or ambiguous")
    instrument = instruments[0]
    require(instrument.get("symbol") == pair and
            instrument.get("category") == "SPOT" and
            instrument.get("baseCoin") == symbol and
            instrument.get("quoteCoin") == "USDT" and
            instrument.get("isRwa", "NO") != "YES",
            "Wrong native Spot instrument")
    return instrument.get("status", "unknown")


def normalize_candles(raw, day):
    require(isinstance(raw, list), "Historical candles missing")
    start = int(dt.datetime.combine(day, dt.time.min, tzinfo=UTC).timestamp()*1000)
    end = start + 24*60*60*1000
    candles = {}
    for row in raw:
        require(isinstance(row, list) and len(row) >= 7, "Malformed OHLCV row")
        require(str(row[0]).isdigit(), "Invalid candle timestamp")
        stamp = int(row[0])
        if not start <= stamp < end:
            # Bitget documents one extra candle near range boundaries.
            continue
        require(stamp % STEP_MS == 0 and stamp not in candles,
                "Duplicate/misaligned native 15m candle")
        op,hi,lo,cl = [market.num(row[i]) for i in (1,2,3,4)]
        vb,vq = market.num(row[5], True),market.num(row[6], True)
        require(Decimal(lo) <= min(Decimal(op),Decimal(cl)) and
                Decimal(hi) >= max(Decimal(op),Decimal(cl)),
                "Invalid native OHLC")
        candles[stamp] = {
            "open_at_utc": market.iso(dt.datetime.fromtimestamp(stamp/1000, UTC)),
            "open": op, "high": hi, "low": lo, "close": cl,
            "volume_base": vb, "volume_quote": vq
        }
    # A partial response is still authentic evidence; missing bars are kept as gaps.
    require(0 < len(candles) <= 96, "No native historical 15m candle returned")
    return [candles[k] for k in sorted(candles)]


def missing_slots(day, bars):
    start=int(dt.datetime.combine(day,dt.time.min,tzinfo=UTC).timestamp()*1000)
    existing={x["open_at_utc"] for x in bars}
    return [market.iso(dt.datetime.fromtimestamp(ms/1000,UTC))
            for ms in range(start,start+24*60*60*1000,STEP_MS)
            if market.iso(dt.datetime.fromtimestamp(ms/1000,UTC)) not in existing]


def recovery_asset(target, day, bars, native_status):
    cid,symbol,pair,network,contract=target
    missing=missing_slots(day,bars)
    return {
        "coin_id":cid,"symbol":symbol,"pair":pair,"venue":"Bitget",
        "type":"SPOT","quote":"USDT","chain":network,"contract":contract,
        "status":("COMPLETE_NATIVE_15M" if not missing else
                  "PARTIAL_NATIVE_15M" if bars else "NATIVE_HISTORY_UNAVAILABLE"),
        "native_current_status":native_status,
        "candles_15m":bars,"count":len(bars),"sha256":sha(bars),
        "missing_slots_utc":missing,"missing_count":len(missing),
        "source_endpoint":ENDPOINT
    }


def recover_day(day, fetch_live=market.public_json,
                fetch_history=historical_json, identity=None, now=None):
    now=now or dt.datetime.now(UTC)
    require(isinstance(day,dt.date) and not isinstance(day,dt.datetime) and
            EARLIEST_DAY <= day < now.date(), "Date outside closed daily range")
    identity=identity if identity is not None else json.loads(IDENTITY.read_text(encoding="utf-8"))
    verified=validated_targets(identity)
    start=int(dt.datetime.combine(day,dt.time.min,tzinfo=UTC).timestamp()*1000)
    stop=start+24*60*60*1000
    records=[]
    for target in verified:
        cid,symbol,pair,network,contract=target
        native_status=current_native_identity(fetch_live,target)
        params=urllib.parse.urlencode({
            "category":"SPOT","symbol":pair,"interval":"15m",
            # Endpoints can round range edges. Filter source by exact UTC day.
            "startTime":str(start-2*STEP_MS),
            "endTime":str(stop+STEP_MS),"limit":"100"})
        try:
            payload=fetch_history("https://"+HOST+ENDPOINT+"?"+params)
        except (OSError,TimeoutError):
            bars=[]
        else:
            require(isinstance(payload,dict) and payload.get("code")=="00000",
                    "History endpoint rejected pair "+pair)
            try:
                bars=normalize_candles(payload.get("data"),day)
            except ValueError as exc:
                if str(exc)!="No native historical 15m candle returned":
                    raise
                bars=[]
        records.append(recovery_asset(target,day,bars,native_status))
    return {
        "schema":SCHEMA,"date_utc":day.isoformat(),
        "recovered_at_utc":market.iso(now),
        "original_hourly_observations_reconstructed":False,
        "historical_data_type":"SPOT_CLOSED_15M_CANDLES_ONLY",
        "source_quote":"USDT","source_venue":"Bitget",
        "asset_count":len(records),"assets":records,
        "orders_enabled":False,"real_orders":0,"paper_fills":0,
        "account_access":False,"order_book_spread_available":False,
        "source_identity_catalogue_date":identity.get("source_radar_day_utc"),
        "note":"Native historical OHLCV; missing intervals explicit; NOT missing live hourly orderbooks."
    }

def validate_document(doc):
    require(doc.get("schema")==SCHEMA and doc.get("real_orders")==0 and
            doc.get("orders_enabled") is False and
            doc.get("order_book_spread_available") is False and
            doc.get("original_hourly_observations_reconstructed") is False and
            doc.get("asset_count")==3 and len(doc.get("assets",[]))==3,
            "Invalid historical evidence schema")
    day=dt.date.fromisoformat(doc["date_utc"])
    require([x.get("pair") for x in doc["assets"]]==[x[2] for x in TARGETS],
            "Historical pair reordering or symbol collision")
    for row,target in zip(doc["assets"],TARGETS):
        require((row.get("coin_id"),row.get("symbol"),row.get("pair"),
                 row.get("chain"),row.get("contract")) ==
                (target[0],target[1],target[2],target[3],target[4]) and
                row.get("type")=="SPOT" and row.get("quote")=="USDT" and
                row.get("source_endpoint")==ENDPOINT,
                "Unverified historical identity")
        candles=row.get("candles_15m")
        require(isinstance(candles,list) and 0<=len(candles)<=96 and
                row.get("count")==len(candles) and
                row.get("sha256")==sha(candles),
                "Native historical digest mismatch")
        stamps=[x.get("open_at_utc") for x in candles]
        require(len(stamps)==len(set(stamps)) and stamps==sorted(stamps),
                "Repeated/disordered historical candle")
        require(all(isinstance(t,str) and t.endswith("Z") and
                    t[:10]==doc["date_utc"] and t[11:16][-2:] in
                    ("00","15","30","45") and t[17:19]=="00" for t in stamps),
                "Historical candle outside closed UTC interval")
        gaps=missing_slots(day,candles)
        require(row.get("missing_slots_utc")==gaps and
                row.get("missing_count")==len(gaps) and
                row.get("status")==("COMPLETE_NATIVE_15M" if not gaps else
                                   "PARTIAL_NATIVE_15M" if candles
                                   else "NATIVE_HISTORY_UNAVAILABLE"),
                "False historical coverage label")


def save(doc, root=DEST):
    validate_document(doc)
    if sum(x["count"] for x in doc["assets"])==0:
        return {"status":"HISTORICAL_SOURCE_UNAVAILABLE","date_utc":doc["date_utc"]}
    root.mkdir(parents=True,exist_ok=True)
    target=root/(doc["date_utc"]+".json")
    if target.exists():
        prior=json.loads(target.read_text(encoding="utf-8"))
        validate_document(prior)
        require(prior["date_utc"]==doc["date_utc"],
                "Mixed historical source days")
        appended=0
        for i,target_tuple in enumerate(TARGETS):
            before=prior["assets"][i]
            after=doc["assets"][i]
            stored={bar["open_at_utc"]:bar for bar in before["candles_15m"]}
            for bar in after["candles_15m"]:
                ts=bar["open_at_utc"]
                require(ts not in stored or stored[ts]==bar,
                        "Conflicting prior verified historical evidence")
                if ts not in stored:
                    appended+=1
                    stored[ts]=bar
            merged=sorted(stored.values(),key=lambda x:x["open_at_utc"])
            doc["assets"][i]=recovery_asset(target_tuple,
                                            dt.date.fromisoformat(doc["date_utc"]),
                                            merged,after["native_current_status"])
        if not appended:
            return {"status":"ALREADY_VERIFIED_NO_NEW_BARS",
                    "date_utc":doc["date_utc"],
                    "verified_bars":sum(x["count"] for x in prior["assets"])}
        doc["first_recovered_at_utc"]=prior.get(
            "first_recovered_at_utc",prior["recovered_at_utc"])
    else:
        doc["first_recovered_at_utc"]=doc["recovered_at_utc"]
    validate_document(doc)
    temp=target.with_suffix(".writing")
    temp.write_text(json.dumps(doc,ensure_ascii=False,indent=2,allow_nan=False)+"\n",
                    encoding="utf-8")
    os.replace(temp,target)
    bars=sum(x["count"] for x in doc["assets"])
    return {"status":"SAVED_HISTORICAL_CANDLES_ONLY",
            "date_utc":doc["date_utc"],
            "assets":3,"bars":bars,"expected_bars":288,
            "missing_bars":288-bars}

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--date",help="Explicit closed UTC day YYYY-MM-DD")
    p.add_argument("--lookback",type=int,default=1,
                   help="Attempt at most three most recent closed UTC days")
    args=p.parse_args()
    require(1<=args.lookback<=3,"Lookback outside safe bounds")
    now=dt.datetime.now(UTC)
    if args.date:
        day=dt.date.fromisoformat(args.date)
        dates=[day]
    else:
        dates=[now.date()-dt.timedelta(days=x) for x in range(1,args.lookback+1)
               if now.date()-dt.timedelta(days=x)>=EARLIEST_DAY]
    for day in dates:
        saved=DEST/(day.isoformat()+".json")
        if saved.exists():
            current=json.loads(saved.read_text(encoding="utf-8"))
            validate_document(current)
            require(current.get("date_utc")==day.isoformat(),
                    "Existing historical evidence outside intended day")
            if all(x.get("count")==96 for x in current["assets"]):
                print(json.dumps({"status":"ALREADY_VERIFIED",
                                  "date_utc":day.isoformat(),"bars":288}))
                continue
            # Genuine partial series may gain more source bars on later retries.
        try:
            report=save(recover_day(day,now=now))
        except (OSError,ValueError,TimeoutError) as exc:
            # No invented bars or false completion. Retry a missing day later.
            print(json.dumps({"status":"HISTORICAL_SOURCE_UNAVAILABLE",
                              "date_utc":day.isoformat(),
                              "reason":str(exc)[:140]}))
            continue
        print(json.dumps(report))


if __name__=="__main__":
    main()
