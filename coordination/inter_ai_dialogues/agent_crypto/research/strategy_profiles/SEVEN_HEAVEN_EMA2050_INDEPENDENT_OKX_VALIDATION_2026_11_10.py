#!/usr/bin/env python3
"""Read-only independent price-source and recent-period check for pre-specified EMA strategies."""
import datetime as dt, hashlib, gzip, json, time, urllib.request, urllib.parse, statistics
from pathlib import Path
ROOT=Path(__file__).resolve().parents[5]
ARCH=ROOT/'public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/bitcoin-Max.json.gz'
SHA='812acb4a087cc43163760a6b397506bb7cb4bbcf8eca692fc686ef9f618b8bfd'
PAIR='BTC-USDC';END='2026-11-09';WARM='2025-08-21'
def now():return dt.datetime.now(dt.timezone.utc).isoformat()
def daily(ts):return dt.datetime.fromtimestamp(int(ts)/1000,dt.timezone.utc).date().isoformat()
def okx():
    path='https://www.okx.com/api/v5/market/history-candles'
    rows={};cursor=None;pages=[];latest=None
    for k in range(12):
        params={'instId':PAIR,'bar':'1Dutc','limit':'100'}
        if cursor:params['after']=str(cursor)
        url=path+'?'+urllib.parse.urlencode(params)
        error=None;data=None
        for retry in range(4):
            try:
                request=urllib.request.Request(url,headers={'User-Agent':'SevenHeavenBTCResearch/1.0 (public candles, no authentication)','Accept':'application/json'})
                with urllib.request.urlopen(request,timeout=25) as resp:payload=json.loads(resp.read())
                if payload.get('code')!='0':raise RuntimeError('OKX business error '+repr(payload.get('code'))+' '+repr(payload.get('msg')))
                data=payload['data']
                if not data:raise RuntimeError('OKX empty page')
                break
            except Exception as e:
                error=str(e);time.sleep(min(6,1+retry))
        if data is None:raise RuntimeError('OKX unavailable; abort without declaring validation: '+str(error))
        stamps=[int(r[0]) for r in data];pages.append(dict(n=len(data),oldest=daily(min(stamps)),latest=daily(max(stamps))))
        if latest is None:latest=daily(max(stamps))
        for r in data:
            if len(r)<9:raise RuntimeError('OKX candle missing confirm')
            stamp=int(r[0]);date=daily(stamp)
            if stamp%86400000!=0:raise RuntimeError('Non-UTC daily timestamp')
            if r[8]!='1':continue
            vals=[float(r[i]) for i in range(1,6)]
            o,h,l,c,v=vals
            if not(o>0 and h>=max(o,c) and 0<l<=min(o,c) and v>=0):raise RuntimeError('Bad OKX OHLCV '+date)
            cand=dict(t=stamp,date=date,o=o,h=h,l=l,c=c,v=v)
            if date in rows and rows[date]!=cand:raise RuntimeError('Conflicting duplicate '+date)
            rows[date]=cand
        cursor=min(stamps)
        if daily(cursor)<=WARM:break
    if not rows:raise RuntimeError('No confirmed OKX candles')
    ds=sorted(rows);target=[(dt.date.fromisoformat(WARM)+dt.timedelta(days=i)).isoformat() for i in range((dt.date.fromisoformat(END)-dt.date.fromisoformat(WARM)).days+1)]
    missing=[x for x in target if x not in rows]
    if missing:raise RuntimeError('Missing confirmed OKX days; abort rather than fabricate '+str(missing[:8])+' count='+str(len(missing)))
    return [rows[d] for d in target],dict(source=path,instrument=PAIR,bar='1Dutc',pages=pages,retrieved_at_utc=now(),first=WARM,last=END,closed_candles=len(target),last_api_timestamp=latest)
def binance():
    content=ARCH.read_bytes()
    assert hashlib.sha256(content).hexdigest()==SHA
    d=json.loads(gzip.decompress(content))
    assert d['pair']=='BTCUSDT' and d['interval']=='1d' and len(d['rows'])==3075
    rows=[]
    for row in d['rows']:
        t,o,h,l,c,v=row[:6]
        if WARM<=daily(t)<='2026-09-30':
            rows.append(dict(t=t,date=daily(t),o=o,h=h,l=l,c=c,v=v))
    assert rows[0]['date']==WARM and rows[-1]['date']=='2026-09-30'
    return rows
def ema(bars,k):
    out=[None]*len(bars);v=sum(x['c'] for x in bars[:k])/k
    for i in range(k-1,len(bars)):
        if i>k-1:v+=(bars[i]['c']-v)*2/(k+1)
        out[i]=v
    return out
def indications(bars):
    e20=ema(bars,20);e50=ema(bars,50);e200=ema(bars,200)
    c=[x['c'] for x in bars]
    return {'EMA20_50':[bool(e20[i] and e50[i] and e20[i]>e50[i]) for i in range(len(bars))],
            'EMA50_200':[bool(e50[i] and e200[i] and e50[i]>e200[i]) for i in range(len(bars))],
            'MOM180':[bool(i>=180 and c[i]>c[i-180]) for i in range(len(bars))]}
def simulate(bars,signals,key,start,end,fee=.001,slip=.0005):
    indexes={b['date']:i for i,b in enumerate(bars)}
    if start not in indexes or end not in indexes:raise ValueError('missing period')
    a,b=indexes[start],indexes[end]
    assert a>200 and b>a
    qty=0.;cash=1000.;entered=None;trades=[];daily=[];days_exposed=0;buy_days=[]
    for i in range(a,b+1):
        bar=bars[i]
        # signal known from the preceding *closed* UTC daily candle only
        on=signals[key][i-1]
        if on and qty==0:
            spent=cash;price=bar['o']*(1+slip);qty=spent*(1-fee)/price;cash=0.
            entered=(bar['date'],spent);buy_days.append(bar['date'])
        elif not on and qty>0:
            net=qty*bar['o']*(1-slip)*(1-fee)
            trades.append(dict(bought=entered[0],sold=bar['date'],net_pct=100*(net/entered[1]-1)))
            cash=net;qty=0.;entered=None
        if qty>0:days_exposed+=1
        daily.append(cash+qty*bar['c']*(1-slip)*(1-fee))
    if qty>0:
        net=qty*bars[b]['c']*(1-slip)*(1-fee)
        trades.append(dict(bought=entered[0],sold=bars[b]['date'],net_pct=100*(net/entered[1]-1),forced_close=True))
        cash=net;daily[-1]=cash
    peak=1000.;dd=0.
    for v in daily:
        peak=max(peak,v);dd=min(dd,100*(v/peak-1))
    buy=bars[a]['o']*(1+slip);buy_hold_qty=1000*(1-fee)/buy
    hold=buy_hold_qty*bars[b]['c']*(1-slip)*(1-fee)
    return dict(method=key,start=start,end=end,days=b-a+1,net_return_pct=round(100*(cash/1000-1),4),
      buy_hold_pct=round(100*(hold/1000-1),4),alpha_pct_points=round(100*((cash-hold)/1000),4),
      max_drawdown_pct=round(dd,4),trades=len(trades),wins=sum(x['net_pct']>0 for x in trades),
      losses=sum(x['net_pct']<=0 for x in trades),exposure_pct=round(100*days_exposed/(b-a+1),2),
      closed_day_signals=sum(signals[key][a-1:b]),buy_days=buy_days,trade_log=trades)
def main():
    ok,meta=okx();bn=binance()
    assert len(bn)==406,'same warmup 21 Aug 2025–30 Sep 2026 required'
    O=indications(ok);B=indications(bn);rows=[]
    periods=[('overlap','2026-04-01','2026-09-30'),
             ('recent','2026-10-01','2026-11-09'),
             ('combined','2026-04-01','2026-11-09')]
    for family,signals,bars in [('OKX',O,ok),('BINANCE',B,bn)]:
        for name,a,b in periods:
            if b>bars[-1]['date']:continue
            for key in ['EMA20_50','EMA50_200','MOM180']:
                x=simulate(bars,signals,key,a,b)
                x.update(venue=family,period=name)
                rows.append(x)
                if family=='OKX' and key=='EMA20_50':
                    stress=simulate(bars,signals,key,a,b,.002,.001)
                    rows[-1]['double_cost_net_return_pct']=stress['net_return_pct']
    # compare underlying source on the exact same daily decision dates
    overlap_dates=[b['date'] for b in bn if '2026-04-01'<=b['date']<='2026-09-30']
    bo={b['date']:i for i,b in enumerate(bn)}
    oo={b['date']:i for i,b in enumerate(ok)}
    mismatches={key:[d for d in overlap_dates if B[key][bo[d]]!=O[key][oo[d]]] for key in O}
    result=dict(status='VERIFIED_NO_LIVE_ORDERS',meta=meta,binance_sha256=SHA,
      methodology=dict(asset_reference='BTC Spot in USDC vs USDT (different quote assets)',signal_at='UTC daily close',fictitious_fill='next UTC daily open',fee_each_side=.001,slippage_each_side=.0005,no_leverage=True,capital_start=1000,
      same_indicator_warmup_start=WARM,recent_period_disjoint_from_previous_overlap=True,
      date_utc_today_excluded='2026-11-10 (not closed as of research)',blind_future_out_of_sample=False),
      crossvenue_signal_mismatches=mismatches,results=rows)
    out=Path('/tmp/seven_independent_okx_ema_validation.json')
    out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print('SEVEN_VALIDATION_EVIDENCE '+json.dumps(result,ensure_ascii=False,separators=(',',':')))
if __name__=='__main__':main()
