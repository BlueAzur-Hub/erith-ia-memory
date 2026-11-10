#!/usr/bin/env python3
"""Seven Heaven — rolling public OKX BTC-USDC 1H Spot archive, no private API.

Collect up to 72 most recent COMPLETED hourly candles. Archive original UTC-hour
observations without cross-venue fallback, without interpolation, and without orders.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from pathlib import Path

HOUR_MS = 3_600_000
PAIR = 'BTC-USDC'
SCHEMA = 'seven.crypto.okx-spot-hourly-rolling.v1'
BASES = ('https://eea.okx.com', 'https://www.okx.com')
RESOURCE = '/api/v5/market/history-candles'
DEFAULT_DIR = Path('public/agent_crypto_erith_ia/laboratoire/btc-market-operations/spot-hourly')

class SourceError(RuntimeError):
    pass


def number(value, field, *, strictly_positive=False):
    try:
        n = Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        raise SourceError(f'{field}: invalid number') from None
    if not n.is_finite() or n < 0 or (strictly_positive and n <= 0):
        raise SourceError(f'{field}: nonfinite/nonpositive')
    return n


def parse_rows(message, now_ms):
    if not isinstance(message, dict) or str(message.get('code')) != '0' or not isinstance(message.get('data'), list):
        raise SourceError('OKX public history response failed/schema changed')
    current_hour = (now_ms // HOUR_MS) * HOUR_MS
    oldest_allowed = current_hour - 72 * HOUR_MS
    by_t = {}
    for raw in message['data']:
        if not isinstance(raw, list) or len(raw) < 9:
            raise SourceError('unexpected OKX history-candles row schema')
        try: t = int(raw[0])
        except (ValueError, TypeError): raise SourceError('invalid OKX candle timestamp') from None
        if t % HOUR_MS or t <= 0: raise SourceError('timestamp not aligned to UTC hour')
        if t >= current_hour:  # current/open candle must never enter the archive
            continue
        if t < oldest_allowed: continue
        if str(raw[8]) != '1': raise SourceError('unconfirmed candle in closed interval')
        if t in by_t: raise SourceError('duplicate OKX candle timestamp')
        o,h,l,c = [number(raw[i], name, strictly_positive=True) for i,name in zip(range(1,5),('open','high','low','close'))]
        v_btc, vol_ccy, v_usdc = [number(raw[i], name) for i,name in zip(range(5,8),('vol_btc','vol_ccy','vol_quote'))]
        if h < max(o,l,c) or l > min(o,h,c): raise SourceError('OHLC inconsistency')
        by_t[t] = {'t':t,'utc':datetime.fromtimestamp(t/1000, timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
                   'o':str(o),'h':str(h),'l':str(l),'c':str(c),
                   'v_btc':str(v_btc),'v_usdc_quote':str(v_usdc),'confirm':'1',
                   'instrument':PAIR,'venue':'OKX','market_type':'SPOT','bar':'1H','orders_enabled':False}
    if not by_t: raise SourceError('no closed hourly BTC-USDC candles found')
    expected_latest = current_hour - HOUR_MS
    if expected_latest not in by_t: raise SourceError('latest completed UTC hour missing in API response')
    ordered = [by_t[t] for t in sorted(by_t)]
    gaps = [t for t in range(ordered[0]['t'], expected_latest+HOUR_MS,HOUR_MS) if t not in by_t]
    if gaps: raise SourceError(f'{len(gaps)} missing UTC hours inside collected range')
    return ordered


def fetch(now_ms, transport=None):
    current_hour = (now_ms//HOUR_MS)*HOUR_MS
    params = urllib.parse.urlencode({'instId':PAIR,'bar':'1H','after':current_hour,'limit':100})
    errors = []
    for host in BASES:
        url = host + RESOURCE + '?' + params
        try:
            if transport:
                raw = transport(url)
            else:
                request = urllib.request.Request(url, headers={'User-Agent':'SevenHeaven-public-market-observer/1.0', 'Accept':'application/json'})
                with urllib.request.urlopen(request, timeout=20) as response:
                    raw = response.read(1_500_000)
            if isinstance(raw,str): raw=raw.encode('utf-8')
            if len(raw) >= 1_500_000: raise SourceError('oversized public exchange response')
            rows = parse_rows(json.loads(raw),now_ms)
            return rows, {'url':url,'response_sha256':hashlib.sha256(raw).hexdigest(),'exchange_signed':False}
        except (OSError, ValueError, SourceError) as exc:
            errors.append(f'{host}: {type(exc).__name__}: {str(exc)[:100]}')
    raise SourceError('OKX BTC-USDC history unavailable: '+ ' | '.join(errors))


def archive(rows, provenance, folder, now_ms):
    folder=Path(folder)
    # Validate the batch entirely before any files are changed.
    if not rows or any(r.get('instrument')!=PAIR or r.get('confirm')!='1' or r.get('orders_enabled') is not False for r in rows):
        raise SourceError('unsafe incoming BTC-USDC archive')
    if any(b['t']-a['t']!=HOUR_MS for a,b in zip(rows,rows[1:])): raise SourceError('incoming hours not contiguous')
    groups={}
    for row in rows: groups.setdefault(row['utc'][:10],[]).append(row)
    pending={}
    for day,batch in groups.items():
        path=folder/(day+'.jsonl')
        previous={}
        if path.exists():
            for line in path.read_text(encoding='utf-8').splitlines():
                if not line.strip(): continue
                old=json.loads(line)
                if old.get('t') in previous: raise SourceError('existing archive duplicate')
                previous[old['t']]=old
        for row in batch:
            if row['t'] in previous and previous[row['t']]!=row:
                raise SourceError(f'conflicting re-fetch for immutable UTC hour {row["utc"]}')
            previous[row['t']]=row
        pending[path]=''.join(json.dumps(x,sort_keys=True,separators=(',',':'))+'\n' for x in sorted(previous.values(),key=lambda x:x['t']))
    # Provenance is a snapshot of this public query; prior candles retain their values.
    latest = rows[-1]
    status={'schema':SCHEMA,'status':'READY_PUBLIC_SOURCE_NOT_EXCHANGE_SIGNED',
            'observation_only':True,'orders_enabled':False,'real_orders':0,
            'instrument':PAIR,'market_type':'SPOT','bar':'1H',
            'updated_at_utc':datetime.fromtimestamp(now_ms/1000,timezone.utc).isoformat(),
            'latest_closed_hour_utc':latest['utc'],'oldest_fetched_hour_utc':rows[0]['utc'],
            'validated_fetched_hours':len(rows),'last_source':provenance,
            'no_interpolation':True,'historical_source_not_exchange_signed':True,
            'notional_volume_unit':'USDC','base_volume_unit':'BTC',
            'limits':['GitHub schedule can be delayed or skipped','Only last fetched window is repaired automatically',
                      'No exchange signature or authenticated transaction-level audit']}
    folder.mkdir(parents=True, exist_ok=True)
    for path,text in pending.items(): path.write_text(text,encoding='utf-8')
    (folder/'status.json').write_text(json.dumps(status,ensure_ascii=False,sort_keys=True,indent=2)+'\n',encoding='utf-8')
    return status


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--out',type=Path,default=DEFAULT_DIR)
    p.add_argument('--fixture',action='store_true',help='no network, no persistence: demo UTC fixture')
    args=p.parse_args()
    now_ms=int(datetime.now(timezone.utc).timestamp()*1000)
    if args.fixture:
        t=(now_ms//HOUR_MS)*HOUR_MS
        data={'code':'0','data':[[str(t-HOUR_MS),'75000','76000','74000','75500','1.2','0','90000','1']]}
        print(json.dumps({'status':'FIXTURE_ONLY','rows':parse_rows(data,now_ms)},indent=2))
        return
    rows,proof=fetch(now_ms)
    status=archive(rows,proof,args.out,now_ms)
    print(json.dumps({'status':status['status'],'hours':status['validated_fetched_hours'],
                      'last':status['latest_closed_hour_utc'],'source':proof['url']},ensure_ascii=False))

if __name__=='__main__':main()
