#!/usr/bin/env python3
"""ERITH Radar 20 public execution witness. Research only; NEVER places orders.

One immutable hourly evidence file. Reads only completed Binance Spot 1h bars
and current OKX public order books for the same 20 markets as the frozen Radar.
The book is a delayed observation, never a reconstructed fill at the hour open.
Authenticated account fees are intentionally NOT collected or published.
"""
from __future__ import annotations
import argparse
import datetime as dt
import hashlib
import json
import math
import pathlib
import statistics
import urllib.parse
import urllib.request

SYMBOLS = ('ETH','SOL','XRP','ADA','LINK','AVAX','SUI','NEAR','UNI','AAVE',
           'LTC','BCH','DOT','HBAR','XLM','DOGE','PEPE','SHIB','APT','ARB')
HOUR_MS = 3_600_000
START = dt.datetime(2026,10,14,tzinfo=dt.timezone.utc)
END = START+dt.timedelta(days=90)
MAX_DELAY_S = 45*60
BUDGET_USDT = 100.0
PROTOCOL_SHA = '212833da065e71420bc01dc77fb296749b993ee0f6d7856cc5e2b0b560d833d6'
HERE = pathlib.Path(__file__).resolve().parents[1]
OUT = HERE/'data/trader_flux/radar20_execution'
CFG = HERE/'data/trader_flux/radar20_forward/experiment.json'
SCHEMA = 'erith.trader.radar20.execution-witness.v1'


def ensure(ok, message):
    if not ok: raise ValueError(message)


def json_bytes(obj):
    return (json.dumps(obj,sort_keys=True,ensure_ascii=False,separators=(',',':'),allow_nan=False)+'\n').encode('utf-8')


def digest(b): return hashlib.sha256(b).hexdigest()


def iso_ms(ms):
    return dt.datetime.fromtimestamp(ms/1000,dt.timezone.utc).isoformat().replace('+00:00','Z')


def utcnow(): return dt.datetime.now(dt.timezone.utc)


def read_public_json(url, *, max_bytes=500000, timeout=15):
    req=urllib.request.Request(url,headers={'User-Agent':'Erith-Radar20-Execution-Witness/1.0','Accept':'application/json'})
    with urllib.request.urlopen(req,timeout=timeout) as res:
        b=res.read(max_bytes+1)
        ensure(res.status==200 and 0<len(b)<=max_bytes,'Public endpoint returned no bounded data')
        return json.loads(b)


def validate_protocol():
    raw=CFG.read_bytes()
    ensure(digest(raw)==PROTOCOL_SHA,'Original Radar A/B protocol was modified')
    config=json.loads(raw)
    ensure(config['symbols']==list(SYMBOLS) and config['start_day_utc']=='2026-10-14'
           and config['capital_usdt']==400 and config['ticket_usdt']==100
           and config['market_trend_threshold_pct']==3 and config['taker_buy_threshold_pct']==50
           and config['volume_median_lookback_hours']==24 and config['trend_lookback_hours']==72
           and not config['trading_orders_enabled'],'Radar A/B settings differ')


def parse_hourly_73(raw, decision_ms):
    ensure(isinstance(raw,list) and len(raw)==73,'Expected precisely 73 Binance Spot completed hours')
    cleaned=[]
    for i,rec in enumerate(raw):
        ensure(isinstance(rec,list) and len(rec)>=11,'Invalid Binance candle shape')
        # Binance returns millisecond timestamps unless microseconds explicitly requested.
        ts=int(rec[0]);end=int(rec[6]);expected=decision_ms-(73-i)*HOUR_MS
        ensure(ts==expected and ts<=end<ts+HOUR_MS,'Missing, duplicate, future or unclosed Binance hour')
        op,hi,lo,cl,quote,buy=(float(rec[j]) for j in (1,2,3,4,7,10))
        ensure(all(map(math.isfinite,(op,hi,lo,cl,quote,buy))) and 0<lo<=min(op,cl)
               and max(op,cl)<=hi and quote>=0 and 0<=buy<=quote*(1+1e-8),'Invalid price or taker volume')
        trades=int(rec[8]);ensure(trades>=0,'Invalid trade count')
        cleaned.append((ts,cl,quote,buy,round(100*buy/quote,8) if quote else None))
    return cleaned


def compute_candidates(market_hours):
    """Observable pre-entry eligibility, NOT a cash-constrained portfolio decision."""
    ensure(set(market_hours)==set(SYMBOLS),'Incomplete 20-market Binance input')
    market_change=statistics.median(100*(series[-1][1]/series[0][1]-1)
                                     for series in market_hours.values())
    candidates=[]
    for sym in SYMBOLS:
        bars=market_hours[sym];ensure(len(bars)==73,'Incomplete historical input')
        previous_volumes=[b[2] for b in bars[-25:-1]]
        base=statistics.median(previous_volumes)
        _,close,vol,buy,share=bars[-1]
        if share is None or share<50 or vol<=base or vol<=0:continue
        candidates.append({'pair':sym+'-USDT','binance_pair':sym+'USDT',
            'signal_closed_hour_utc':iso_ms(bars[-1][0]),
            'signal_hour_close_usdt':round(close,10),
            'taker_buy_pct':round(share,6),'quote_volume_usdt':round(vol,6),
            'volume_to_median_24h':round(vol/base,6) if base>0 else None,
            'candidate_A':True,'candidate_B':market_change>=3})
    candidates.sort(key=lambda r:(-r['taker_buy_pct'],-(r['volume_to_median_24h'] or 0),r['pair']))
    return round(market_change,7),candidates


def estimate_book(book, *, now_ms, budget=BUDGET_USDT):
    """Spend quote across asks, immediately sell acquired base across bids.

    Only public visible levels. Account fees, precision/lot steps, real slippage,
    order execution latency and future depth are NOT included.
    """
    ensure(isinstance(book,dict),'Malformed OKX order book')
    stamp=int(book['ts'])
    age=(now_ms-stamp)/1000
    ensure(-5<=age<=120,'OKX order book is stale or in the future')
    asks=book.get('asks',[]);bids=book.get('bids',[])
    ensure(isinstance(asks,list) and isinstance(bids,list) and asks and bids,'No market depth')
    def parse(levels,descending):
        prev=None;out=[]
        for item in levels:
            ensure(isinstance(item,list) and len(item)>=2,'Malformed depth level')
            price,qty=float(item[0]),float(item[1])
            ensure(math.isfinite(price) and math.isfinite(qty) and price>0 and qty>=0,'Invalid depth values')
            if prev is not None:
                ensure((price<=prev if descending else price>=prev),'Unsorted depth')
            prev=price
            if qty:out.append((price,qty))
        ensure(out,'Empty depth')
        return out
    a=parse(asks,False);b=parse(bids,True)
    ensure(b[0][0]<=a[0][0],'Crossed book/preopening auction')
    left=budget;quantity=0.
    for px,qty in a:
        spent=min(left,px*qty);quantity+=spent/px;left-=spent
        if left<=1e-8:break
    ensure(left<=1e-8,'Insufficient ask liquidity at observed levels')
    leftbase=quantity;proceeds=0.
    for px,qty in b:
        traded=min(leftbase,qty);proceeds+=traded*px;leftbase-=traded
        if leftbase<=1e-10:break
    ensure(leftbase<=1e-10,'Insufficient bid liquidity at observed levels')
    return {'status':'PUBLIC_BOOK_MEASURED_FEES_EXCLUDED',
            'book_exchange_time_utc':iso_ms(stamp),'book_age_seconds':round(age,2),
            'best_bid_usdt':b[0][0],'best_ask_usdt':a[0][0],
            'ask_levels_seen':len(asks),'bid_levels_seen':len(bids),
            'spread_bps':round(10000*(a[0][0]-b[0][0])/((a[0][0]+b[0][0])/2),5),
            'quoted_buy_budget_usdt':budget,'public_book_base_acquired':round(quantity,12),
            'public_book_immediate_resale_usdt':round(proceeds,8),
            'instant_spread_depth_only_cost_pct':round(100*(budget-proceeds)/budget,6),
            'account_fee_included':False,'future_fill_guaranteed':False}


def snapshot(decision_hour,*, now=None, klines_fetch=None, book_fetch=None):
    now=now or utcnow()
    now_ms=int(now.timestamp()*1000)
    ms=int(decision_hour.timestamp()*1000)
    ensure(decision_hour.tzinfo is not None and decision_hour.minute==0 and decision_hour.second==0,'Decision must be a UTC hour boundary')
    delta=(now_ms-ms)/1000
    ensure(0<=delta,'Cannot collect future decision')
    result={'schema':SCHEMA,'hour_utc':iso_ms(ms),'observed_at_utc':iso_ms(now_ms),
            'offset_after_hour_seconds':round(delta,2),'protocol_sha256':PROTOCOL_SHA,
            'quote':'USDT','source_market':'Binance Spot','execution_market':'OKX Spot public',
            'paper_only':True,'orders_enabled':False,'authenticated_account_data_accessed':False,
            'authenticated_fee_included':False,'not_an_order_fill':True,
            'latency_note':'OKX snapshot occurs at recorded observation time, NOT at simulated entry hour-open',
            'source_status':None,'market_trend_72h_pct':None,'signals':[], 'okx_books':[]}
    if delta>MAX_DELAY_S:
        result['source_status']='TOO_LATE_FOR_OBSERVATION';return result
    if klines_fetch is None:
        def klines_fetch(sym):
            args=urllib.parse.urlencode({'symbol':sym+'USDT','interval':'1h','startTime':ms-73*HOUR_MS,
                                         'endTime':ms-1,'limit':73})
            return read_public_json('https://data-api.binance.vision/api/v3/klines?'+args)
    if book_fetch is None:
        def book_fetch(sym):
            args=urllib.parse.urlencode({'instId':sym+'-USDT','sz':100})
            return read_public_json('https://www.okx.com/api/v5/market/books?'+args)
    hourly={};missing=[]
    for sym in SYMBOLS:
        try:hourly[sym]=parse_hourly_73(klines_fetch(sym),ms)
        except Exception as e:missing.append({'pair':sym+'USDT','error_type':type(e).__name__})
    if missing:
        result['source_status']='INCOMPLETE_BINANCE_INPUT_NO_SIGNALS';result['missing']=missing
        return result
    result['source_status']='ALL_20_COMPLETE'
    trend,signals=compute_candidates(hourly)
    result['market_trend_72h_pct']=trend;result['signals']=signals
    # Collect at most the candidate market books, not historical fills.
    for sig in signals:
        sym=sig['binance_pair'][:-4]
        try:
            obj=book_fetch(sym)
            ensure(obj.get('code')=='0' and isinstance(obj.get('data'),list) and len(obj['data'])==1,
                   'OKX market book unavailable')
            measured=estimate_book(obj['data'][0],now_ms=int(utcnow().timestamp()*1000))
            result['okx_books'].append({'pair':sym+'-USDT',**measured})
        except Exception as e:
            result['okx_books'].append({'pair':sym+'-USDT','status':'UNAVAILABLE',
                                        'reason_type':type(e).__name__,'fee_included':False})
    return result


def run(now=None, *, out=OUT, klines_fetch=None,book_fetch=None):
    validate_protocol()
    now=now or utcnow()
    # UTC normalized and validate duration / disable test after 90 days.
    now=now.astimezone(dt.timezone.utc)
    if now<START:
        print(json.dumps({'status':'NOT_STARTED','start':'2026-10-14T00:00:00Z'}));return None
    if now>=END:
        print(json.dumps({'status':'END_OF_90_DAY_WINDOW'}));return None
    hour=now.replace(minute=0,second=0,microsecond=0)
    fname=f'observations/{hour:%Y-%m-%d}/{hour:%H}.json'
    dest=out/fname
    if dest.exists():
        print(json.dumps({'status':'ALREADY_ARCHIVED','hour':iso_ms(int(hour.timestamp()*1000))}));return None
    report=snapshot(hour,now=now,klines_fetch=klines_fetch,book_fetch=book_fetch)
    payload=json_bytes(report)
    index_path=out/'index.json'
    if index_path.exists():
        index=json.loads(index_path.read_bytes())
        ensure(index['schema']==SCHEMA+'.index' and index['protocol_sha256']==PROTOCOL_SHA,'Observer index contract changed')
        for it in index['observations']:
            f=out/it['file']
            ensure(f.exists() and digest(f.read_bytes())==it['sha256'],'Previous hourly evidence changed')
        ensure(not any(x['file']==fname for x in index['observations']),'Duplicated hour')
    else:
        index={'schema':SCHEMA+'.index','protocol_sha256':PROTOCOL_SHA,
               'simulations_only':True,'orders_enabled':False,'account_fees_published':False,'observations':[]}
    dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(payload)
    index['observations'].append({'file':fname,'sha256':digest(payload),'source_status':report['source_status'],
                                  'signal_candidates':len(report['signals']),'okx_book_reports':len(report['okx_books'])})
    index['observations'].sort(key=lambda x:x['file'])
    index_path.write_bytes(json_bytes(index))
    print(json.dumps({'status':'ARCHIVED','file':fname,'source_status':report['source_status'],
                      'signal_candidates':len(report['signals']),
                      'books_measured':sum(x['status']=='PUBLIC_BOOK_MEASURED_FEES_EXCLUDED' for x in report['okx_books'])}))
    return report


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--smoke',action='store_true',help='Confirm one public Binance and OKX REST request (does not archive)')
    args=ap.parse_args()
    if args.smoke:
        validate_protocol()
        for name,url in [('Binance','https://data-api.binance.vision/api/v3/klines?symbol=ETHUSDT&interval=1h&limit=2'),
                         ('OKX','https://www.okx.com/api/v5/market/books?instId=ETH-USDT&sz=5')]:
            data=read_public_json(url)
            ensure((isinstance(data,list) and len(data)==2) if name=='Binance'
                   else isinstance(data,dict) and data.get('code')=='0' and bool(data.get('data')),
                   'Public market smoke failed: '+name)
            print('PUBLIC_API_OK',name)
    else:run()
if __name__=='__main__': main()
