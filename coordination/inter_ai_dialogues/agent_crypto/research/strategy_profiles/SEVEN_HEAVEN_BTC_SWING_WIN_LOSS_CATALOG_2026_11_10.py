#!/usr/bin/env python3
"""Seven Heaven: research-only inventory of BTC strategy wins and failures."""
import gzip,hashlib,json,sys
from datetime import datetime,timezone
from statistics import pstdev
from pathlib import Path
DATA='public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/bitcoin-Max.json.gz'
SHA='812acb4a087cc43163760a6b397506bb7cb4bbcf8eca692fc686ef9f618b8bfd'
NAMES={
'CASH':'Liquidités, témoin','BUY_HOLD':'Acheter et conserver, témoin',
'EMA20_50':'Tendance EMA20 > EMA50','EMA50_200':'Tendance EMA50 > EMA200',
'PRICE_EMA200':'Clôture au-dessus de EMA200',
'MOM90':'Momentum positif 90 jours','MOM180':'Momentum positif 180 jours',
'DON20':'Cassure 20 j, sortie 10 j','DON55':'Cassure 55 j, sortie 20 j',
'DON20_TREND':'Cassure 20 j avec filtre EMA50/200',
'PULLBACK_FILTERED':'Repli EMA10 avec filtre EMA50/200',
'REBOUND_FILTERED':'Rebond RSI35 au-dessus de EMA200',
'REBOUND_UNFILTERED':'Rebond RSI35 sans filtre EMA200 (ablation)',
'MEANREV_Z2':'Retour à la moyenne, écart-type 2 sur 20 j'}
STOPS={'DON20':(3,60),'DON55':(3,120),'DON20_TREND':(3,60),
'PULLBACK_FILTERED':(2.5,30),'REBOUND_FILTERED':(2,15),
'REBOUND_UNFILTERED':(2,15),'MEANREV_Z2':(2,15)}
def ema(a,n):
 out=[None]*len(a);avg=sum(a[:n])/n
 for i in range(n-1,len(a)):
  if i>n-1:avg+=(a[i]-avg)*2/(n+1)
  out[i]=avg
 return out
def run(source):
 raw=Path(source).read_bytes();sha=hashlib.sha256(raw).hexdigest()
 assert sha==SHA,'Source must match verified historical dataset'
 obj=json.loads(gzip.decompress(raw))
 assert obj['pair']=='BTCUSDT' and obj['interval']=='1d' and len(obj['rows'])==3075
 B=[]
 for r in obj['rows']:
  t,o,h,l,c,v=r[:6]
  assert o>0 and l>0 and c>0 and h>=max(o,c) and l<=min(o,c) and v>=0
  if B:assert t-B[-1]['t']==86400000
  B.append(dict(t=t,date=datetime.fromtimestamp(t/1000,timezone.utc).date().isoformat(),o=o,h=h,l=l,c=c,v=v))
 start=next(i for i,b in enumerate(B) if b['date']=='2019-01-01')
 end=next(i for i,b in enumerate(B) if b['date']=='2026-09-30')
 assert start>=200 and end-start+1==2830
 C=[b['c'] for b in B];N=len(B);E={p:ema(C,p) for p in (10,20,50,200)}
 highs={p:[None if i<p else max(b['h'] for b in B[i-p:i]) for i in range(N)] for p in (20,55)}
 lows={p:[None if i<p else min(b['l'] for b in B[i-p:i]) for i in range(N)] for p in (10,20)}
 tr=[B[0]['h']-B[0]['l']]+[max(B[i]['h']-B[i]['l'],abs(B[i]['h']-C[i-1]),abs(B[i]['l']-C[i-1])) for i in range(1,N)]
 atr=[None]*N;avg=sum(tr[:14])/14;atr[13]=avg
 for i in range(14,N):avg=(avg*13+tr[i])/14;atr[i]=avg
 rsi=[None]*N;g=l=0.
 for i in range(1,N):
  d=C[i]-C[i-1];g1=max(d,0);l1=max(-d,0)
  if i<=14:
   g+=g1;l+=l1
   if i==14:g/=14;l/=14
  else:g=(13*g+g1)/14;l=(13*l+l1)/14
  if i>=14:rsi[i]=100 if l==0 else 100-100/(1+g/l)
 mean=[None]*N;sd=[None]*N
 for i in range(19,N):
  w=C[i-19:i+1];mean[i]=sum(w)/20;sd[i]=pstdev(w)
 def entry(k,i):
  c=C[i]
  if k=='EMA20_50':return E[20][i]>E[50][i]
  if k=='EMA50_200':return E[50][i]>E[200][i]
  if k=='PRICE_EMA200':return c>E[200][i]
  if k=='MOM90':return c>C[i-90]
  if k=='MOM180':return c>C[i-180]
  if k=='DON20':return c>highs[20][i]
  if k=='DON55':return c>highs[55][i]
  if k=='DON20_TREND':return c>highs[20][i] and E[50][i]>E[200][i]
  if k=='PULLBACK_FILTERED':return E[50][i]>E[200][i] and c>E[50][i] and C[i-1]<=E[10][i-1] and c>E[10][i]
  if k in ('REBOUND_FILTERED','REBOUND_UNFILTERED'):
   return rsi[i-1]<35<=rsi[i] and (k=='REBOUND_UNFILTERED' or c>E[200][i])
  if k=='MEANREV_Z2':return c<mean[i]-2*sd[i]
  raise AssertionError(k)
 def exit_signal(k,i):
  if k in ('DON20','DON20_TREND'):return C[i]<lows[10][i]
  if k=='DON55':return C[i]<lows[20][i]
  if k=='PULLBACK_FILTERED':return C[i]<E[20][i]
  if k in ('REBOUND_FILTERED','REBOUND_UNFILTERED'):return C[i]>E[20][i] or rsi[i]>=60
  if k=='MEANREV_Z2':return C[i]>=mean[i]
  return False
 filtered=sum(entry('REBOUND_FILTERED',i) for i in range(start,end+1))
 unfiltered=sum(entry('REBOUND_UNFILTERED',i) for i in range(start,end+1))
 assert (filtered,unfiltered)==(13,57),f'RSI independent count regression {(filtered,unfiltered)}'
 def sim(k,fee,slip):
  if k=='CASH':return dict(key=k,net_pct=0.,max_dd_pct=0.,trades=0,wins=0,losses=0,exposure_pct=0.,yearly={str(y):0. for y in range(2019,2027)})
  if k=='BUY_HOLD':
   qty=1000*(1-fee)/(B[start]['o']*(1+slip))
   equity=[qty*B[i]['c']*(1-fee)*(1-slip) for i in range(start,end+1)]
   trade_count=1;wins=int(equity[-1]>1000);losses=1-wins;exposed=len(equity)
  else:
   cash=1000.;qty=0.;entered=None;stop=None;pending=None;trades=[];equity=[];exposed=0
   protection=STOPS.get(k)
   for i in range(start,end+1):
    b=B[i]
    def sell(price):
     nonlocal cash,qty,stop,entered
     if qty==0:return
     proceeds=qty*price*(1-slip)*(1-fee)
     trades.append(dict(bought=B[entered[0]]['date'],sold=b['date'],profit=proceeds-entered[1]))
     cash+=proceeds;qty=0.;stop=None;entered=None
    if pending=='sell' and qty>0:sell(b['o'])
    elif pending=='buy' and qty==0:
     spent=cash;price=b['o']*(1+slip)
     qty=spent*(1-fee)/price;cash=0.;entered=(i,spent)
     stop=price-protection[0]*atr[i-1] if protection else None
     assert stop is None or stop>0
    pending=None
    if qty>0 and protection:
     if b['o']<=stop:sell(b['o'])
     elif b['l']<=stop:sell(stop)
    if qty>0:
     exposed+=1
     if protection:
      mul,max_days=protection
      if exit_signal(k,i) or i-entered[0]+1>=max_days:pending='sell'
      stop=max(stop,b['c']-mul*atr[i])
     elif not entry(k,i):pending='sell'
    elif i<end and entry(k,i):pending='buy'
    equity.append(cash+qty*b['c']*(1-slip)*(1-fee))
   if qty>0:
    sell(B[end]['c'])
    equity[-1]=cash
   trade_count=len(trades);wins=sum(t['profit']>0 for t in trades);losses=trade_count-wins
   if k in ('REBOUND_FILTERED','REBOUND_UNFILTERED'):
    cap=filtered if k=='REBOUND_FILTERED' else unfiltered
    assert trade_count<=cap,'Trade count exceeds RSI signals; simulation bug'
  peak=1000.;maxdd=0.;yearly={};prev=1000.
  for j,v in enumerate(equity):
   peak=max(peak,v);maxdd=min(maxdd,100*(v/peak-1))
   i=start+j;y=B[i]['date'][:4]
   if i==end or B[i+1]['date'][:4]!=y:
    yearly[y]=round(100*(v/prev-1),3);prev=v
  return dict(key=k,net_pct=round(100*(equity[-1]/1000-1),3),
   max_dd_pct=round(maxdd,3),trades=trade_count,wins=wins,losses=losses,
   exposure_pct=round(100*exposed/len(equity),2),yearly=yearly)
 normal=[dict(sim(k,.001,.0005),label=name) for k,name in NAMES.items()]
 double=[sim(k,.002,.001) for k in NAMES]
 hold=next(r for r in normal if r['key']=='BUY_HOLD')
 for r in normal:
  r['underperforms_buy_hold']=r['net_pct']<hold['net_pct']
  r['loses_money']=r['net_pct']<0
  r['loss_years']=[y for y,p in r['yearly'].items() if p<0]
  r['underperform_years']=[y for y,p in r['yearly'].items() if p<hold['yearly'][y]]
 return dict(schema='seven.crypto.btc.strategy-failures.v1',read_only=True,orders_enabled=False,
  source=dict(pair='BTCUSDT Spot Binance daily',sha256=sha,rows=len(B)),
  model=dict(period_start=B[start]['date'],period_end=B[end]['date'],days=end-start+1,
   starting_balance_usdt=1000,fee_per_side=.001,slippage_per_side=.0005,
   no_leverage=True,close_signal_next_open_fill=True,annual_capital_reset=False,
   stops_ohlc_simplification=True,all_rules_declared_before_calculation=True,
   no_untouched_out_of_sample=True,prospective_validity_not_proven=True),
  rsi_signal_invariants=dict(filtered=filtered,unfiltered=unfiltered),
  strategies=normal,double_costs=[dict(key=r['key'],net_pct=r['net_pct'],trades=r['trades']) for r in double])
if __name__=='__main__':
 result=run(sys.argv[1] if len(sys.argv)>1 else DATA)
 destination=Path(sys.argv[2]) if len(sys.argv)>2 else Path('/tmp/seven_btc_failures_research.json')
 destination.write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n')
 print('SEVEN_BTC_FAILURES '+json.dumps(result,ensure_ascii=False,separators=(',',':')))
