#!/usr/bin/env node
'use strict';
// Seven Heaven independent RESEARCH only. No trading account, network call or order.
// Three pre-specified swing families; no fitting of parameters on the validation sets.
// Run from a local checkout: node <this-file> > swing_results.json
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const zlib=require('node:zlib');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'../../../../../');
const archivePath=path.join(root,'public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/bitcoin-Max.json.gz');
const dataBytes=fs.readFileSync(archivePath);
const sha=crypto.createHash('sha256').update(dataBytes).digest('hex');
assert.equal(sha,'812acb4a087cc43163760a6b397506bb7cb4bbcf8eca692fc686ef9f618b8bfd','Historical source changed: stop');
const archive=JSON.parse(zlib.gunzipSync(dataBytes).toString('utf8'));
assert.equal(archive.pair,'BTCUSDT');
assert.equal(archive.interval,'1d');
assert.equal(archive.rows.length,3075);
assert.equal(archive.is_live,false);
const bars=archive.rows.map(r=>({t:r[0],o:r[1],h:r[2],l:r[3],c:r[4],v:r[5]}));
const dates=bars.map(b=>new Date(b.t).toISOString().slice(0,10));
bars.forEach((b,i)=>{
  assert([b.o,b.h,b.l,b.c,b.v].every(Number.isFinite),'Nonfinite OHLCV');
  assert(b.o>0 && b.h>=Math.max(b.o,b.c) && b.l<=Math.min(b.o,b.c) && b.l>0,'Invalid OHLC');
  if(i)assert.equal(b.t-bars[i-1].t,86400000,'Gap in daily source');
});
function ema(p){
  let s=0,v=null;
  return bars.map((b,i)=>{
    if(i<p-1){s+=b.c;return null}
    if(i===p-1){s+=b.c;v=s/p;return v}
    v+=(b.c-v)*2/(p+1);return v;
  });
}
function sma(p,field){
  let sum=0;
  return bars.map((b,i)=>{
    sum+=b[field];
    if(i>=p)sum-=bars[i-p][field];
    return i>=p-1?sum/p:null;
  });
}
const e10=ema(10),e20=ema(20),e50=ema(50),e200=ema(200);
const v20=sma(20,'v');
const prev20High=bars.map((_,i)=>i<20?null:Math.max(...bars.slice(i-20,i).map(x=>x.h)));
const prev10Low=bars.map((_,i)=>i<10?null:Math.min(...bars.slice(i-10,i).map(x=>x.l)));
const tr=bars.map((b,i)=>i===0?b.h-b.l:Math.max(b.h-b.l,Math.abs(b.h-bars[i-1].c),Math.abs(b.l-bars[i-1].c)));
let atrv=null,trs=0;
const atr=tr.map((t,i)=>{if(i<13){trs+=t;return null}if(i===13){trs+=t;atrv=trs/14;return atrv}atrv=(atrv*13+t)/14;return atrv});
const rsi=Array(bars.length).fill(null);
let avGain=0,avLoss=0;
for(let i=1;i<bars.length;i++){
  const d=bars[i].c-bars[i-1].c,g=Math.max(d,0),l=Math.max(-d,0);
  if(i<=14){avGain+=g;avLoss+=l;if(i===14){avGain/=14;avLoss/=14}}
  else {avGain=(13*avGain+g)/14;avLoss=(13*avLoss+l)/14}
  if(i>=14)rsi[i]=avLoss===0?100:100-100/(1+avGain/avLoss);
}
// Rules are declared before annual performance is computed.
// These are transparent educational models inspired by common trader families,
// not claims of endorsement by Charles Schwab and not optimized on these prices.
const plans={
 PULLBACK:{
  label:'Repli dans la tendance (EMA 10/20/50/200)',
  atrStop:2.5,maxDays:30,
  entry:i=>i>0 && e200[i]!==null && e50[i]>e200[i] &&
    bars[i].c>e50[i] && bars[i-1].c<=e10[i-1] && bars[i].c>e10[i],
  exit:i=>bars[i].c<e20[i]
 },
 BREAKOUT:{
  label:'Cassure du plus haut 20 jours, sortie plus bas 10 jours',
  atrStop:3,maxDays:60,
  entry:i=>prev20High[i]!=null && e200[i]!=null &&
    e50[i]>e200[i] && bars[i].c>prev20High[i],
  exit:i=>bars[i].c<prev10Low[i]
 },
 REBOUND:{
  label:'Rebond RSI 35 avec filtre de tendance longue',
  atrStop:2,maxDays:15,
  entry:i=>i>0 && rsi[i-1]!=null && rsi[i-1]<35 && rsi[i]>=35 &&
    e200[i]!=null && bars[i].c>e200[i],
  exit:i=>bars[i].c>e20[i] || rsi[i]>=60
 }
};
const windows=[
  {year:2020,last:'2020-12-31',period:'DESIGN'},
  {year:2021,last:'2021-12-31',period:'DESIGN'},
  {year:2022,last:'2022-12-31',period:'DESIGN'},
  {year:2023,last:'2023-12-31',period:'VALIDATION'},
  {year:2024,last:'2024-12-31',period:'VALIDATION'},
  {year:2025,last:'2025-12-31',period:'CONFIRMATION'},
  {year:2026,last:'2026-09-30',period:'CONFIRMATION_PARTIAL'}
];
function testWindow(plan,win,cap,costMultiplier=1){
  const start=dates.indexOf(win.year+'-01-01'),end=dates.indexOf(win.last);
  assert(start>=220 && end>start,'Missing year window');
  const fee=.001*costMultiplier,slip=.0005*costMultiplier;
  let cash=1000,qty=0,entry=null,pending=null,stop=null,peakClose=null;
  const trades=[],daily=[],exposedDates=[];
  function exit(price,index,reason){
    assert(qty>0 && entry,'Paper sell with no paper buy');
    const proceeds=qty*price*(1-slip)*(1-fee);
    const income=proceeds-entry.spend;
    cash+=proceeds;
    trades.push({entry:dates[entry.i],exit:dates[index],days:index-entry.i+1,
      reason,pnl:income,pct:100*income/entry.spend});
    qty=0;entry=null;stop=null;
  }
  for(let i=start;i<=end;i++){
    const b=bars[i];
    // Pending instructions always originate from the PREVIOUS daily close.
    if(pending?.type==='exit' && entry)exit(b.o,i,'daily close or duration -> next open');
    else if(pending?.type==='buy' && !entry){
      const spend=cash*cap,buyPrice=b.o*(1+slip);
      if(spend>0){
        qty=spend*(1-fee)/buyPrice;cash-=spend;
        entry={i,spend};
        stop=buyPrice-plans[plan].atrStop*pending.knownAtr;
        assert(stop>0 && stop<buyPrice,'Invalid ATR stop');
      }
    }
    pending=null;
    if(entry){
      exposedDates.push(i);
      // The stop is already known before observing today's high/low.
      // A gap below stop fills at the worse opening, never at the stop price.
      if(b.o<=stop)exit(b.o,i,'stop gap');
      else if(b.l<=stop)exit(stop,i,'stop touched, assumed filled at stop before selling cost');
    }
    if(entry){
      const age=i-entry.i+1;
      if(plans[plan].exit(i)||age>=plans[plan].maxDays)
        pending={type:'exit'};
      // Ratchet trail only AFTER today's close. No same-day future knowledge.
      stop=Math.max(stop,b.c-plans[plan].atrStop*atr[i]);
    }else if(i<end && plans[plan].entry(i)){
      pending={type:'buy',knownAtr:atr[i]};
    }
    daily.push(cash+qty*b.c*(1-slip)*(1-fee));
  }
  if(entry){exit(bars[end].c,end,'window end hypothetical liquidation');daily[daily.length-1]=cash}
  let high=1000,maxDd=0;const returns=[];
  for(let i=0;i<daily.length;i++){
    high=Math.max(high,daily[i]);
    maxDd=Math.min(maxDd,100*(daily[i]/high-1));
    if(i>0)returns.push(daily[i]/daily[i-1]-1);
  }
  const avg=returns.reduce((s,x)=>s+x,0)/Math.max(1,returns.length);
  const varr=returns.reduce((s,x)=>s+(x-avg)**2,0)/Math.max(1,returns.length-1);
  const sharpe=varr>0?(avg/Math.sqrt(varr))*Math.sqrt(365):null;
  const open=bars[start].o,lastClose=bars[end].c;
  function hold(fraction){
    return 1000*(1-fraction)+(1000*fraction*(1-fee)/(open*(1+slip)))*lastClose*(1-slip)*(1-fee);
  }
  const control=hold(cap),fullHold=hold(1);
  return{
    year:win.year,stage:win.period,from:dates[start],to:dates[end],days:end-start+1,
    capitalCapPct:100*cap,costMultiplier,
    final:cash,returnPct:100*(cash/1000-1),maxDrawdownPct:maxDd,sharpe,
    trades:trades.length,wins:trades.filter(t=>t.pnl>0).length,
    losses:trades.filter(t=>t.pnl<=0).length,
    exposureDays:exposedDates.length,exposurePct:100*exposedDates.length/(end-start+1),
    buyHoldMatchedFinal:control,buyHoldMatchedPct:100*(control/1000-1),
    buyHoldFullFinal:fullHold,buyHoldFullPct:100*(fullHold/1000-1),
    tradeLog:trades
  };
}
const results=[];
for(const [name,plan] of Object.entries(plans)){
  for(const cap of [.25,1]){
    for(const win of windows)results.push({method:name,...testWindow(name,win,cap)});
  }
}
// One perturbation: double BOTH fees and assumed slippage, no fitting.
const doubledCosts=[];
for(const name of Object.keys(plans))
  for(const win of windows.slice(3))
    doubledCosts.push({method:name,...testWindow(name,win,1,2)});
const stages={
 DESIGN:[2020,2021,2022],
 VALIDATION:[2023,2024],
 CONFIRMATION:[2025,2026]
};
function aggregate(method,cap,years,highCosts=false){
  const pool=(highCosts?doubledCosts:results).filter(x=>x.method===method && x.capitalCapPct===cap*100 && years.includes(x.year));
  assert.equal(pool.length,years.length);
  const compound=key=>pool.reduce((p,r)=>p*r[key]/1000,1000);
  const final=compound('final'),control=compound('buyHoldMatchedFinal');
  return {method,capPct:100*cap,years,final,returnPct:100*(final/1000-1),
    matchedBuyHoldFinal:control,matchedBuyHoldReturnPct:100*(control/1000-1),
    trades:pool.reduce((sum,r)=>sum+r.trades,0),
    wins:pool.reduce((sum,r)=>sum+r.wins,0),
    maxAnnualDrawdownPct:Math.min(...pool.map(r=>r.maxDrawdownPct)),
    exposureDays:pool.reduce((sum,r)=>sum+r.exposureDays,0),
    sampleDays:pool.reduce((sum,r)=>sum+r.days,0)};
}
const summary={};
for(const [k,yrs] of Object.entries(stages)){
  summary[k]=[];
  for(const name of Object.keys(plans))
    for(const cap of [.25,1])summary[k].push(aggregate(name,cap,yrs));
}
const stress=Object.keys(plans).map(name=>aggregate(name,1,[2023,2024,2025,2026],true));
const output={
 schema:'seven.crypto.btc.swing-research-multifamily-split-v1',researchOnly:true,ordersEnabled:false,
 source:{archive:'public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/bitcoin-Max.json.gz',
   sha256:sha,market:'Binance Spot',pair:'BTCUSDT',bar:'1d',rows:bars.length,start:dates[0],end:dates.at(-1)},
 design:{methods:plans,entryExecution:'Next day open after completed daily close',
  exitExecution:'Next day open after completed close, immediate historical stop with conservative gaps',
  position:'One BTC long position at a time; no borrowing, no shorts, no real orders; 1000 USDT annual reset',
  costs:'0.10% fee + 0.05% slippage each direction (two-sided); double-cost stress also run',
  caps:'25% and 100% of available cash, Buy & Hold benchmarks matched to each initial exposure',
  split:'2020–2022 design diagnostics, 2023–2024 validation, 2025–Sep2026 confirmation; no parameter search',
  caveats:'Historical replay only; source is Binance BTC/USDT daily, not OKX BTC/USDC; order book depth, fees by volume, stop slippage and intraday tick sequence not observable; no genuinely prospective data'},
 summary,stress,annual:results
};
if(output.ordersEnabled||!output.researchOnly)throw Error('unsafe output');
console.log(JSON.stringify(output,null,2));
