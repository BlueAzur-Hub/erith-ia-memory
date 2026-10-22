#!/usr/bin/env python3
"""Hourly PUBLIC Spot observations: ZEC-USDC OKX EEA / AXISUSDT Bitget.
Use the existing Radar hourly GitHub scheduler. No user account, orders,
WebSocket, fabricated backfill, USDT→USDC conversion or BUY/SELL signal.
"""
from __future__ import annotations
import datetime as dt
import json
import os
import pathlib
import re
import urllib.parse
import urllib.request
from decimal import Decimal, InvalidOperation

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "data/crypto/case-market-hourly"
SCHEMA = "erith.case-market-public-hourly.v1"
UTC = dt.timezone.utc
ROUTES = {
    "eea.okx.com": {
        "/api/v5/public/instruments": {"instType", "instId"},
        "/api/v5/market/ticker": {"instId"},
        "/api/v5/market/books": {"instId", "sz"},
        "/api/v5/market/candles": {"instId", "bar", "limit"},
    },
    "api.bitget.com": {
        "/api/v3/market/instruments": {"category", "symbol"},
        "/api/v3/market/tickers": {"category", "symbol"},
        "/api/v3/market/orderbook": {"category", "symbol", "limit"},
        "/api/v3/market/candles": {"category", "symbol", "interval", "limit"},
    },
}
MARKETS = (("ZEC", "OKX_EEA", "ZEC-USDC", "USDC"),
           ("AXIS", "BITGET", "AXISUSDT", "USDT"))


def require(ok, msg):
    if not ok:
        raise ValueError(msg)


def iso(value):
    return value.astimezone(UTC).isoformat(timespec="seconds").replace("+00:00", "Z")


def num(value, zero=False):
    require(isinstance(value, str) and 0 < len(value) < 60, "Decimal string missing")
    try:
        n = Decimal(value)
    except InvalidOperation as e:
        raise ValueError("Bad decimal") from e
    require(n.is_finite() and n < Decimal("1e24") and
            (n >= 0 if zero else n > 0), "Invalid numeric market observation")
    return value


def stamp(value, now, age_ms=300000):
    # Decimal strings and integer milliseconds are accepted, never inferred.
    require(str(value).isdigit() and len(str(value)) == 13, "Invalid exchange time")
    ms = int(value)
    current = int(now.timestamp() * 1000)
    require(-30000 <= current-ms <= age_ms, "Exchange data stale or future")
    return iso(dt.datetime.fromtimestamp(ms/1000, UTC))


def public_json(url):
    u = urllib.parse.urlsplit(url)
    require(u.scheme == "https" and u.port is None and u.username is None
            and u.password is None and u.hostname in ROUTES and
            u.path in ROUTES[u.hostname], "Non-public source prohibited")
    qs = urllib.parse.parse_qs(u.query, keep_blank_values=True)
    require(qs and set(qs).issubset(ROUTES[u.hostname][u.path]) and
            all(len(v) == 1 and v[0] for v in qs.values()), "Unexpected request")
    req = urllib.request.Request(url, headers={
        "Accept": "application/json", "User-Agent": "ERITH-IA-Public-Research/1.0"})
    with urllib.request.urlopen(req, timeout=12) as resp:
        final = urllib.parse.urlsplit(resp.url)
        require(resp.status == 200 and final.scheme == "https" and
                final.hostname == u.hostname and final.path == u.path,
                "Redirect or HTTP status not trusted")
        payload = resp.read(800001)
        require(0 < len(payload) <= 800000, "Missing or oversized response")
    return json.loads(payload)


def api(fetch, host, path, **params):
    require(path in ROUTES[host] and set(params) == ROUTES[host][path] or
            (path in ROUTES[host] and set(params).issubset(ROUTES[host][path])
             and len(params) > 0), "Public route only")
    obj = fetch("https://" + host + path + "?" + urllib.parse.urlencode(params))
    code = "0" if host == "eea.okx.com" else "00000"
    require(isinstance(obj, dict) and obj.get("code") == code, "Exchange rejected public request")
    return obj


def levels(raw, descending):
    require(isinstance(raw, list) and 1 <= len(raw) <= 5, "Book depth unavailable")
    result = []
    for level in raw:
        require(isinstance(level, list) and len(level) >= 2, "Invalid book level")
        result.append([num(level[0]), num(level[1])])
    prices = [Decimal(x[0]) for x in result]
    require(all((a>b if descending else a<b) for a,b in zip(prices, prices[1:])),
            "Book not sorted")
    return result


def make_book(bids, asks, exchange_ms, now):
    bid, ask = levels(bids, True), levels(asks, False)
    b, a = Decimal(bid[0][0]), Decimal(ask[0][0])
    require(b < a, "Crossed or locked book")
    depth_b = sum(Decimal(px)*Decimal(q) for px,q in bid)
    depth_a = sum(Decimal(px)*Decimal(q) for px,q in ask)
    return {"source_at_utc": stamp(exchange_ms, now), "bid5": bid, "ask5": ask,
            "best_bid": bid[0][0], "best_ask": ask[0][0],
            "spread_bps": str(((a-b)/((a+b)/2)*10000).quantize(Decimal("0.01"))),
            "top5_bid_quote_depth": str(depth_b.quantize(Decimal("0.0001"))),
            "top5_ask_quote_depth": str(depth_a.quantize(Decimal("0.0001"))),
            "fill_proven": False}


def closed_bars(raw, now, bitget):
    require(isinstance(raw, list), "Candle list unavailable")
    bars = {}
    now_ms = int(now.timestamp()*1000)
    step = 900000
    for r in raw:
        if not isinstance(r, list) or len(r) < (7 if bitget else 9):
            continue
        if not bitget and r[8] != "1":
            continue
        ms = int(r[0]) if str(r[0]).isdigit() else -1
        if ms % step or ms+step > now_ms-15000 or now_ms-ms > 3*3600000:
            continue
        try:
            op, hi, lo, cl = (num(r[i]) for i in (1,2,3,4))
            vb, vq = num(r[5], True), num(r[6 if bitget else 7], True)
            require(Decimal(lo) <= min(Decimal(op),Decimal(cl)) and
                    Decimal(hi) >= max(Decimal(op),Decimal(cl)), "Broken OHLC")
            bars[ms] = {"open_at_utc": iso(dt.datetime.fromtimestamp(ms/1000, UTC)),
                        "open":op,"high":hi,"low":lo,"close":cl,
                        "volume_base":vb,"volume_quote":vq}
        except (ValueError, InvalidOperation):
            continue
    require(bars, "No confirmed closed 15m candle")
    return [bars[x] for x in sorted(bars)[-4:]]


def okx(fetch, now):
    host="eea.okx.com"; pair="ZEC-USDC"
    identity=api(fetch,host,"/api/v5/public/instruments",instType="SPOT",instId=pair)["data"]
    require(isinstance(identity,list) and len(identity)==1, "ZEC Spot not listed")
    inst=identity[0]
    require(inst.get("instId")==pair and inst.get("instType")=="SPOT" and
            inst.get("baseCcy")=="ZEC" and inst.get("quoteCcy")=="USDC" and
            inst.get("state")=="live", "ZEC Spot identity not live")
    ticker=api(fetch,host,"/api/v5/market/ticker",instId=pair)["data"]
    require(isinstance(ticker,list) and len(ticker)==1 and ticker[0].get("instId")==pair,
            "ZEC Spot ticker identity invalid")
    t=ticker[0]
    tick={"source_at_utc":stamp(t.get("ts"),now),"last":num(t.get("last")),
          "volume24h_base":num(t.get("vol24h"),True),
          "volume24h_quote":num(t.get("volCcy24h"),True)}
    order=api(fetch,host,"/api/v5/market/books",instId=pair,sz=5)["data"]
    require(isinstance(order,list) and len(order)==1, "No ZEC Spot book")
    book=make_book(order[0].get("bids"),order[0].get("asks"),order[0].get("ts"),now)
    candles=api(fetch,host,"/api/v5/market/candles",instId=pair,bar="15m",limit=7)["data"]
    return {"ticker":tick,"book":book,"closed_15m":closed_bars(candles,now,False),
            "instrument_public_rules":{k:num(inst[k]) for k in ("minSz","lotSz","tickSz")}}


def bitget(fetch, now):
    host="api.bitget.com";pair="AXISUSDT"
    inst=api(fetch,host,"/api/v3/market/instruments",category="SPOT",symbol=pair)["data"]
    require(isinstance(inst,list) and len(inst)==1 and
            inst[0].get("symbol")==pair and inst[0].get("category")=="SPOT",
            "AXIS Spot identity not verifiable")
    ticker=api(fetch,host,"/api/v3/market/tickers",category="SPOT",symbol=pair)
    rows=ticker.get("data")
    require(isinstance(rows,list) and len(rows)==1 and
            rows[0].get("symbol")==pair and rows[0].get("category")=="SPOT",
            "AXIS Spot ticker identity invalid")
    t=rows[0]
    tick={"source_at_utc":stamp(ticker.get("requestTime"),now),
          "last":num(t.get("lastPrice")),
          "volume24h_base":num(t.get("volume24h"),True) if isinstance(t.get("volume24h"),str) else None,
          "volume24h_quote":num(t.get("turnover24h"),True) if isinstance(t.get("turnover24h"),str) else None}
    order=api(fetch,host,"/api/v3/market/orderbook",category="SPOT",symbol=pair,limit=5)["data"]
    require(isinstance(order,dict), "AXIS Spot book missing")
    book=make_book(order.get("b"),order.get("a"),order.get("ts"),now)
    candles=api(fetch,host,"/api/v3/market/candles",category="SPOT",symbol=pair,interval="15m",limit=7)["data"]
    return {"ticker":tick,"book":book,"closed_15m":closed_bars(candles,now,True),
            "instrument_public_rules":None}


def collect(fetch=public_json, now=None):
    now=now or dt.datetime.now(UTC)
    require(now.utcoffset()==dt.timedelta(0), "UTC required")
    rows=[]
    for symbol,venue,pair,quote in MARKETS:
        entry={"symbol":symbol,"venue":venue,"pair":pair,"quote":quote,"type":"SPOT",
               "status":"UNAVAILABLE","proof":None,"unavailable_reason":None}
        try:
            result=okx(fetch,now) if venue=="OKX_EEA" else bitget(fetch,now)
            entry.update(status="OBSERVED",proof=result)
        except (ValueError, KeyError, TypeError, IndexError, OSError, TimeoutError) as e:
            entry["unavailable_reason"]=type(e).__name__  # no invented price or error secrets
        rows.append(entry)
    return {"schema":SCHEMA,"record_kind":"public_non_executable_market_observation",
            "at_utc":iso(now),"hour_utc":now.strftime("%Y-%m-%dT%HZ"),
            "sources":["OKX_EEA_PUBLIC_REST","BITGET_PUBLIC_REST"],
            "markets":rows,"observed_markets":sum(x["status"]=="OBSERVED" for x in rows),
            "spot_only":True,"separate_native_quotes":True,"no_backfill":True,
            "orders_enabled":False,"real_orders":0,"paper_fills":0,
            "account_access":False,"trade_signal":False,
            "note":"Dated public quotes and closed bars; not synchronized exchange fills or guaranteed liquidity."}


def save(record, root=OUT):
    require(record.get("schema")==SCHEMA and record.get("orders_enabled") is False
            and record.get("real_orders")==0 and record.get("paper_fills")==0
            and record.get("trade_signal") is False, "Invalid PAPER-only policy")
    hour=record["hour_utc"]
    require(re.fullmatch(r"\d{4}-\d\d-\d\dT\d\dZ",hour) and
            record["at_utc"][:13]==hour[:13], "Invalid UTC hour")
    root.mkdir(parents=True,exist_ok=True)
    path=root/(hour[:10]+".json")
    if path.exists():
        existing=json.loads(path.read_text(encoding="utf-8"))
        require(existing.get("schema")==SCHEMA and existing.get("date_utc")==hour[:10]
                and isinstance(existing.get("hours"),list), "Existing archive invalid")
        hours=existing["hours"]
        require(len({x["hour_utc"] for x in hours})==len(hours),"Duplicate archival hour")
        if any(x.get("hour_utc")==hour for x in hours):
            return {"changed":False,"reason":"IMMUTABLE_HOUR","archive":str(path)}
    else:hours=[]
    require(len(hours)<24 and all(x["hour_utc"]<hour for x in hours),
            "Out-of-order or overflow: never backfill missed hours")
    hours.append(record)
    day={"schema":SCHEMA,"date_utc":hour[:10],"hours":hours,
         "orders_enabled":False,"real_orders":0}
    latest={"schema":"erith.case-market-hourly-status.v1","last_hour_utc":hour,
            "last_collected_at_utc":record["at_utc"],
            "markets_observed":record["observed_markets"],
            "per_asset":{x["symbol"]:x["status"] for x in record["markets"]},
            "source_day":hour[:10],"orders_enabled":False,"real_orders":0}
    for dest,doc in [(path,day),(root/"latest.json",latest)]:
        temp=dest.with_suffix(".writing")
        temp.write_text(json.dumps(doc,ensure_ascii=False,indent=2,allow_nan=False)+"\n",encoding="utf-8")
        os.replace(temp,dest)
    return {"changed":True,"archive":str(path),"markets_observed":record["observed_markets"]}


def main():
    record=collect()
    print(json.dumps(save(record)))
    if record["observed_markets"]==0:
        print("WARN: no recent valid public Spot quote; only unavailable states archived",file=__import__("sys").stderr)


if __name__=="__main__":
    main()
