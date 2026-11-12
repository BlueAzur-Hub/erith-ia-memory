#!/usr/bin/env python3
"""Read-only, pin-checked 15 Oct 2026 OKX BTC-USDC EMA5/13 and last PRE-open L2 audit.

Full source archives are streamed, never stored. No account credentials or orders.
Outputs compact public-only research proof. Fail closed on incomplete coverage.
"""
from __future__ import annotations
import argparse, hashlib, importlib.util, json, math, os, pathlib, sys, time
from datetime import datetime, timezone
from urllib.parse import urlencode
from urllib.request import urlopen, Request

ROOT=pathlib.Path('coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles')
ORIGINAL='SEVEN_HEAVEN_OKX_L2_BTC_ETH_2026_10_15_96_QUARTER_HOUR_FULL_DAY_STREAMING_AUDIT.py'
OUTNAME='SEVEN_HEAVEN_BTC_USDC_V5_EMA5_13_2026_10_15_CAUSAL_L2_PROOFS.json'
START=1792022400000 # 15 Oct 2026 00:00:00 UTC
END=1792108800000   # 16 Oct 2026 00:00:00 UTC
BAR_MS=900000
CANDLES=300
NOTIONAL=1000
FEE_PCT=.1
V5_SLIP_PCT=.05
CUTOFF_AGES_MS=(100,1000,10000)
API='https://www.okx.com/api/v5/market/history-candles'

def sha256(x): return hashlib.sha256(x).hexdigest()
def iso(ts): return datetime.fromtimestamp(ts/1000,timezone.utc).isoformat(timespec='milliseconds').replace('+00:00','Z')
def api_candles(fetch=None):
    """Obtain exactly 300 contiguous confirmed 15m OKX candles ending 15 Oct, no substitution."""
    fetch=fetch or http_fetch
    rows={}; pages=[]; cursor=END; last_oldest=END+1
    for page in range(1,10):
        url=API+'?'+urlencode({'instId':'BTC-USDC','bar':'15m','limit':'100','after':str(cursor)})
        raw=fetch(url); obj=json.loads(raw)
        if obj.get('code')!='0' or not isinstance(obj.get('data'),list) or not obj['data']:
            raise ValueError('OKX history-candles code/data invalid: '+str(obj.get('code')))
        times=[]
        for item in obj['data']:
            if len(item)<9: raise ValueError('Candle fields missing')
            stamp=int(item[0]);times.append(stamp)
            if stamp%BAR_MS:raise ValueError('Non-15m UTC timestamp')
            if item[8]!='1':raise ValueError('Unconfirmed OHLC candle within frozen target history')
            o,h,l,c=map(float,item[1:5])
            if not all(math.isfinite(v) and v>0 for v in (o,h,l,c)) or h<max(o,c,l) or l>min(o,c,h):
                raise ValueError('Invalid OHLC')
            if stamp>=END:continue
            canonical={'t':stamp,'o':o,'h':h,'l':l,'c':c,'confirm':'1'}
            if stamp in rows and rows[stamp]!=canonical:raise ValueError('Conflicting duplicate OHLC')
            rows[stamp]=canonical
        earliest=min(times)
        if earliest>=last_oldest:raise ValueError('Candle pagination not moving backward')
        pages.append({'index':page,'sha256_response':sha256(raw),'count':len(times),
                      'oldest':iso(min(times)),'newest':iso(max(times))})
        last_oldest=earliest
        if earliest<=END-CANDLES*BAR_MS:break
        cursor=earliest
        time.sleep(.15)
    target=[END-CANDLES*BAR_MS+i*BAR_MS for i in range(CANDLES)]
    missing=[iso(t) for t in target if t not in rows]
    if missing:raise ValueError('Target 300 contiguous OHLC candles unavailable: '+str(missing[:5]))
    candles=[rows[t] for t in target]
    return candles,{'provider':'OKX','pair':'BTC-USDC','bar':'15m','endpoint':API,
                    'pages':pages,'source_candles':len(candles),
                    'start_utc':iso(candles[0]['t']),'end_open_utc':iso(candles[-1]['t']),
                    'sha256_selected_ohlc':sha256(json.dumps(candles,separators=(',',':')).encode())}

def http_fetch(url):
    last=None
    for i in range(3):
        try:
            r=Request(url,headers={'User-Agent':'SevenHeavenReadOnlyEMA15m/1.0','Accept':'application/json'})
            with urlopen(r,timeout=35) as f:
                if f.status!=200:raise ValueError('HTTP '+str(f.status))
                return f.read(240000)
        except Exception as exc:
            last=exc;time.sleep(1+i)
    raise RuntimeError('Public OHLC endpoint inaccessible: '+str(last)[:220])

def ema(rows,n):
    arr=[None]*len(rows);alpha=2/(n+1);value=None
    for i,r in enumerate(rows):
        if value is None:
            if i+1<n:continue
            value=sum(x['c'] for x in rows[i-n+1:i+1])/n

        else:value=r['c']*alpha+value*(1-alpha)
        arr[i]=value
    return arr

def v4_events(rows):
    fast=ema(rows,5);slow=ema(rows,13);out=[]
    for i in range(1,len(rows)):
        if i+1>=len(rows) or any(x is None for x in (fast[i-1],slow[i-1],fast[i],slow[i])):continue
        prev=fast[i-1]-slow[i-1];curr=fast[i]-slow[i]
        direction='UP' if prev<=0 and curr>0 else ('DOWN' if prev>=0 and curr<0 else None)
        if direction:out.append({'index':i,'t':rows[i]['t'],'price':rows[i]['c'],
                                 'direction':direction,'next_open_ms':rows[i+1]['t'],
                                 'next_open_price':rows[i+1]['o']})
    return out

def build_actionable(events):
    """Match V5 long-only position state across entire 300-bar warm-up; filter fills on study date."""
    position=False;executions=[];ignored=0
    for e in events:
        if e['direction']=='UP':
            if position:ignored+=1;continue
            position=True;side='buy'
        else:
            if not position:ignored+=1;continue
            position=False;side='sell'
        if START<=e['next_open_ms']<END:
            executions.append({**e,'side':side,'v5_slippage_fill_price':round(e['next_open_price']*(1+V5_SLIP_PCT/100 if side=='buy' else 1-V5_SLIP_PCT/100),8)})
    return executions,{'ignored_signals':ignored,'position_open_at_end':position}

def load_replay(repo_root):
    path=repo_root/ROOT/ORIGINAL
    spec=importlib.util.spec_from_file_location('pinned_seven_oct15_l2',path)
    m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
    if m.START!=START or m.END!=END or m.ACTIVE_PAIR!='BTC-USDC':
        raise ValueError('Original pinned L2 reader is no longer same day/pair')
    if m.EXPECTED_ARCHIVE_SHA!='3b543b7333a6c71f4a8bf0ddf4e058fa84f61ad58092b3250784acc0964c7b44':
        raise ValueError('Pinned October L2 archive SHA changed')
    return m

def l2_before_open(repo_root):
    m=load_replay(repo_root)
    class BeforeReplay(m.FullDayReplay):
        def __init__(self,expected_hashes):
            super().__init__(expected_hashes);self.next_cutoff=0;self.pre=[]
        def process(self,line):
            obj=json.loads(line)
            ts=int(obj['ts'])
            while self.next_cutoff<96 and ts>=START+self.next_cutoff*BAR_MS:
                cutoff=START+self.next_cutoff*BAR_MS
                if self.prior_ts is None or self.prior_ts>=cutoff:
                    self.pre.append({'cutoff_ms':cutoff,'status':'NO_STRICTLY_PRIOR_STATE'})
                else:
                    age=cutoff-self.prior_ts
                    item=m.top_book_metrics(self.asks,self.bids,self.prior_ts,cutoff)
                    compact={'cutoff_ms':cutoff,'status':'PRE_CUTOFF_OBSERVED',
                             'last_source_ts_ms':self.prior_ts,'age_ms':age,
                             'event_number':self.events,'best_bid':item['best_bid'],
                             'best_ask':item['best_ask'],'spread_bp':item['spread_bps'],
                             'costs':next(x for x in item['notionals'] if x['usdc']==NOTIONAL)}
                    self.pre.append(compact)
                self.next_cutoff+=1
            super().process(line)
        def result(self):
            result=super().result();result['strictly_prior_cutoff_books']=self.pre
            return result
    m.FullDayReplay=BeforeReplay
    expected=m.preflight_checks(repo_root)
    data=m.read_full_archive(expected)
    market=data['market']
    if market['total_events']!=2346486 or market['snapshots']!=96:
        raise ValueError('Full replay event/snapshot counts changed')
    if len(market['strictly_prior_cutoff_books'])!=96:
        raise ValueError('Did not cross all 96 boundaries')
    reference=m.check_reference(repo_root,market)
    if len(reference)!=4 or any(not x['verified'] for x in reference):
        raise ValueError('Prior four-anchors check mismatched')
    compact={'events':market['total_events'],'snapshots':market['snapshots'],
             'first_event_ms':market['first_ts_ms'],'last_event_ms':market['last_ts_ms'],
             'archive_sha256':data['archive_sha256'],'member_sha256':data['member_sha256'],
             'archive_read_full':True,'gzip_crc_checked':data['gzip_read_to_eof_crc_checked'],
             'reference_anchors_verified':4,'global_l2_sequence_verified':False}
    return market['strictly_prior_cutoff_books'],compact

def merge_execution(e,by_cutoff):
    row={'signal_at_utc':iso(e['t']),'next_open_utc':iso(e['next_open_ms']),
         'side':e['side'],'reference_amount_usdc':NOTIONAL,
         'next_open_price':e['next_open_price'],
         'v5_slippage_fill_price':e['v5_slippage_fill_price'],
         'fee_taker_pct_each_side':FEE_PCT,'v5_fixed_slippage_pct_each_side':V5_SLIP_PCT}
    b=by_cutoff.get(e['next_open_ms'])
    if b is None:
        row['status']='UNPAIRED_NO_PRE_OPEN_BOOK';return row
    row['last_l2_utc']=iso(b['last_source_ts_ms']);row['age_ms']=b['age_ms']
    row['age_gate']={str(n)+'ms':b['age_ms']<=n for n in CUTOFF_AGES_MS}
    row['mid']=(float(b['best_bid'])+float(b['best_ask']))/2
    row['spread_bp']=b['spread_bp']
    cost=b['costs'][e['side']]
    if cost['status']!='complete':
        row['status']='UNPAIRED_INSUFFICIENT_DEPTH';return row
    row['book_vwap']=float(cost['vwap'])
    row['book_vs_mid_bp']=cost['mid_to_vwap_bps']
    row['book_vwap_vs_next_open_bp']=round((float(cost['vwap'])/e['next_open_price']-1)*10000,6)
    row['v5_fill_vs_next_open_bp']=round((e['v5_slippage_fill_price']/e['next_open_price']-1)*10000,6)
    row['status']='PRE_OPEN_BOOK_PAIRED_NOT_ACTUAL_FILL'
    return row

def build(repo_root,fetch=None):
    candles,ohlc=api_candles(fetch)
    events=v4_events(candles)
    executions,meta=build_actionable(events)
    before,archive=l2_before_open(repo_root)
    by_cutoff={x['cutoff_ms']:x for x in before if x['status']=='PRE_CUTOFF_OBSERVED'}
    matched=[merge_execution(e,by_cutoff) for e in executions]
    counts={k:sum(x['status']==k for x in matched) for k in sorted(set(x['status'] for x in matched))}
    age={str(ms):sum(x.get('age_gate',{}).get(str(ms)+'ms',False) for x in matched) for ms in CUTOFF_AGES_MS}
    return {
      'schema':'seven-heaven.okx-btc-usdc-v5-ema5-13-2026-10-15-preopen-l2.v1',
      'status':'REPRODUCED_HISTORICAL_PREOPEN_BOOK_ESTIMATES_NOT_ACTUAL_EXECUTION',
      'scope':{'day_utc':'2026-10-15','pair':'BTC-USDC','bar':'15m','ema_fast':5,'ema_slow':13,
               'historical_candles':CANDLES,'notional_reference_usdc':NOTIONAL,
               'maker_fee_pct_observed':.08,'taker_fee_pct_observed':FEE_PCT,'v5_slippage_pct':V5_SLIP_PCT},
      'ohlc':ohlc,'l2':archive,'v4_ema_cross_events':events,
      'events_all_300_bars':len(events),'executions_on_target_day':len(matched),
      'long_only':meta,'eligibility_counts':counts,'age_gate_counts':age,
      'strictly_prior_boundary_books':len(by_cutoff),
      'execution_estimates':matched,
      'limitations':['L2 event chronology has no verified seqId/prevSeqId upstream chain',
          'Pre-open L2 book is a hypothetical sweep and does not guarantee queue priority or executable fill',
          'V5 OHLC next.open references first trade, not synchronized quote/mid; price discrepancy includes movement, not pure slippage',
          'The first boundary at 00:00 has no pre-day L2 states in the selected daily archive',
          'Actual account fees on 2026-10-15 and per-pair fee exceptions are not proven by November screenshot'],
      'read_only':True,'orders':0}

def selftest():
    cs=[{'t':i*BAR_MS,'c':float(i+100),'o':float(i+100),'h':float(i+100),'l':float(i+100)} for i in range(40)]
    assert len(ema(cs,5))==40 and ema(cs,5)[3] is None and abs(ema(cs,5)[4]-102)<1e-9
    assert ema(cs,13)[11] is None and abs(ema(cs,13)[12]-106)<1e-9
    e={'index':25,'t':25*BAR_MS,'direction':'UP','next_open_ms':START+BAR_MS,
       'next_open_price':100.,'price':100.}
    merged=merge_execution({**e,'side':'buy','v5_slippage_fill_price':100.05},
        {START+BAR_MS:{'last_source_ts_ms':START+BAR_MS-50,'age_ms':50,'best_bid':'99.99','best_ask':'100.01',
                       'spread_bp':2.,'costs':{'buy':{'status':'complete','vwap':'100.02','mid_to_vwap_bps':2.},'sell':{'status':'complete','vwap':'99.98','mid_to_vwap_bps':2.}}}})
    assert merged['age_gate']['100ms'] and merged['status']=='PRE_OPEN_BOOK_PAIRED_NOT_ACTUAL_FILL'
    assert merged['v5_fill_vs_next_open_bp']==5
    assert iso(START)=='2026-10-15T00:00:00.000Z'
    print('PASS selftest: EMA seeding, causal cutoff gating, mid/fee/slippage semantics')

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--selftest',action='store_true')
    p.add_argument('--repo-root',type=pathlib.Path,default=pathlib.Path('.'))
    p.add_argument('--output',type=pathlib.Path)
    a=p.parse_args()
    if a.selftest:return selftest()
    output=a.output or (a.repo_root/ROOT/OUTNAME)
    output.parent.mkdir(parents=True,exist_ok=True)
    try: proof=build(a.repo_root)
    except Exception as ex:
        proof={'schema':'seven-heaven.okx-btc-usdc-v5-ema5-13-2026-10-15-preopen-l2.v1',
          'status':'INCOMPLETE_DATA_OR_COVERAGE_NO_RESULT','error_type':type(ex).__name__,
          'error':str(ex)[:450],'no_results_invented':True,'read_only':True,'orders':0}
    output.write_text(json.dumps(proof,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
    print(json.dumps({'status':proof['status'],'output':str(output),
           'events':proof.get('events_all_300_bars'),
           'executions':proof.get('executions_on_target_day'),
           'age_counts':proof.get('age_gate_counts'),
           'error':proof.get('error')},indent=2))
    if proof['status']=='INCOMPLETE_DATA_OR_COVERAGE_NO_RESULT':
        sys.exit(2)

if __name__=='__main__':main()
