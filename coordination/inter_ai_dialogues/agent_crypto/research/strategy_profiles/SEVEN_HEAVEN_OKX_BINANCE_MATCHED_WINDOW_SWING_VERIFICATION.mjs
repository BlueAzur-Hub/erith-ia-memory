#!/usr/bin/env node
// Independently compare ONE common historical window using pre-registered Swing
// strategy rules on OKX Spot BTC-USDC and Binance Spot BTC-USDT.
// Research only. No account, keys, orders or real-time execution.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'../../../../../');
const archivePath=path.join(root,'public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/bitcoin-Max.json.gz');
const archiveBytes=fs.readFileSync(archivePath);
const binSha=createHash('sha256').update(archiveBytes).digest('hex');
assert.equal(binSha,'812acb4a087cc43163760a6b397506bb7cb4bbcf8eca692fc686ef9f618b8bfd');
const bin=JSON.parse(zlib.gunzipSync(archiveBytes).toString());
assert.equal(bin.pair,'BTCUSDT');assert.equal(bin.interval,'1d');assert.equal(bin.rows.length,3075);
const snapshotFile='/tmp/seven_okx_daily_research_rows.json';
const okxRows=JSON.parse(fs.readFileSync(snapshotFile,'utf8'));
const coverage=JSON.parse(fs.readFileSync('/tmp/seven_okx_history_coverage.json','utf8'));
assert.equal(coverage.readOnly,true);assert.equal(coverage.ordersEnabled,false);
assert.equal(coverage.contiguous,true);
const digest=createHash('sha256').update(JSON.stringify(okxRows)).digest('hex');
assert.equal(digest,coverage.sha256,'OKX records differ from verified public response');
const min=Math.max(bin.rows[0][0],okxRows[0][0]),max=Math.min(bin.rows.at(-1)[0],okxRows.at(-1)[0]);
const binMap=new Map(bin.rows.map(r=>[r[0],r]));
const okxMap=new Map(okxRows.map(r=>[r[0],r]));
const stamps=[...okxMap.keys()].filter(t=>t>=min && t<=max).sort((a,b)=>a-b);
assert(stamps.length>=250,'Insufficient overlap for identical warm-up');
for(let i=1;i<stamps.length;i++)assert.equal(stamps[i]-stamps[i-1],86400000,'Missing common calendar day');
const btcDates=stamps.map(t=>new Date(t).toISOString().slice(0,10));
assert.equal(btcDates[0],'2025-08-21','Archived window changed; audit manually');
assert.equal(btcDates.at(-1),'2026-09-30','Archived window changed; audit manually');
function checked(r){
  assert(r&&r.length>=6,'Missing OHLCV');
  const [t,o,h,l,c,v]=r;
  assert([t,o,h,l,c,v].every(Number.isFinite));
  assert(o>0&&c>0&&l>0&&h>=Math.max(o,c)&&l<=Math.min(o,c)&&v>=0);
  return {t,o,h,l,c,v};
}
const datasets={
 OKX:stamps.map(t=>checked(okxMap.get(t))),
 BINANCE:stamps.map(t=>checked(binMap.get(t)))
};
const startIdx=btcDates.indexOf('2026-04-01'),endIdx=btcDates.indexOf('2026-09-30');
assert(startIdx>=210&&endIdx>startIdx,'Insufficient shared EMA 200 warm-up');
const methods=['PULLBACK','BREAKOUT','REBOUND'];
const fee=.001,slip=.0005;
function compute(prices,method,cap){
 const N=prices.length;
 function ema(p){let sum=0,v=null;return prices.map((b,i)=>{if(i<p-1){sum+=b.c;return null}if(i===p-1){v=(sum+b.c)/p;return v}v+=(b.c-v)*2/(p+1);return v})}
 const E10=ema(10),E20=ema(20),E50=ema(50),E200=ema(200);
 const hi20=prices.map((_,i)=>i<20?null:Math.max(...prices.slice(i-20,i).map(b=>b.h)));
 const lo10=prices.map((_,i)=>i<10?null:Math.min(...prices.slice(i-10,i).map(b=>b.l)));
 const TR=prices.map((b,i)=>i?Math.max(b.h-b.l,Math.abs(b.h-prices[i-1].c),Math.abs(b.l-prices[i-1].c)):b.h-b.l);
 let sum=0,av=null;const ATR=TR.map((t,i)=>{if(i<13){sum+=t;return null}if(i===13){av=(sum+t)/14;return av}av=(av*13+t)/14;return av});
 let g=0,l=0;const RSI=Array(N).fill(null);
 for(let i=1;i<N;i++){
   const d=prices[i].c-prices[i-1].c,gain=Math.max(d,0),loss=Math.max(-d,0);
   if(i<=14){g+=gain;l+=loss;if(i===14){g/=14;l/=14}}
   else{g=(13*g+gain)/14;l=(13*l+loss)/14}
   if(i>=14)RSI[i]=l===0?100:100-100/(1+g/l);
 }
 const rules={
 PULLBACK:{max:30,atr:2.5,
   signal:i=>i>0&&E200[i]!=null&&E50[i]>E200[i]&&prices[i].c>E50[i]&&prices[i-1].c<=E10[i-1]&&prices[i].c>E10[i],
   exit:i=>prices[i].c<E20[i]},
 BREAKOUT:{max:60,atr:3,
   signal:i=>hi20[i]!=null&&E200[i]!=null&&E50[i]>E200[i]&&prices[i].c>hi20[i],
   exit:i=>prices[i].c<lo10[i]},
 REBOUND:{max:15,atr:2,
   signal:i=>i>0&&RSI[i-1]!=null&&RSI[i-1]<35&&RSI[i]>=35&&E200[i]!=null&&prices[i].c>E200[i],
   exit:i=>prices[i].c>E20[i]||RSI[i]>=60}
 };
 const rule=rules[method];
 let cash=1000,btc=0,entry=null,stop=null,pending=null;
 const tradeLog=[],daily=[];
 const sell=(price,i,reason)=>{
   assert(entry&&btc>0);
   const received=btc*price*(1-slip)*(1-fee);
   cash+=received;
   tradeLog.push({bought:btcDates[entry.i],sold:btcDates[i],reason,pct:100*(received/entry.cost-1),durationDays:i-entry.i+1});
   btc=0;entry=null;stop=null;
 };
 for(let i=startIdx;i<=endIdx;i++){
   const b=prices[i];
   if(pending==='SELL'&&entry)sell(b.o,i,'previous close triggered exit');
   else if(pending?.type==='BUY'&&!entry){
     const cost=cash*cap,exec=b.o*(1+slip);
     btc=cost*(1-fee)/exec;cash-=cost;
     stop=exec-rule.atr*pending.atr;
     assert(stop>0&&stop<exec);
     entry={i,cost};
   }
   pending=null;
   if(entry){
     // Overnight gap below stop is paid at the worse opening.
     if(b.o<=stop)sell(b.o,i,'stop at gap open');
     else if(b.l<=stop)sell(stop,i,'stop touched');
   }
   if(entry){
     if(rule.exit(i)||i-entry.i+1>=rule.max)pending='SELL';
     stop=Math.max(stop,b.c-rule.atr*ATR[i]); // update stop AFTER today's candle
   }else if(i<endIdx&&rule.signal(i)){
     pending={type:'BUY',atr:ATR[i]};
   }
   daily.push(cash+btc*b.c*(1-slip)*(1-fee));
 }
 if(entry){sell(prices[endIdx].c,endIdx,'forced end-of-window valuation');daily[daily.length-1]=cash}
 const benchmark=1000*(1-cap)+(1000*cap*(1-fee)/(prices[startIdx].o*(1+slip)))*prices[endIdx].c*(1-slip)*(1-fee);
 let high=1000,dd=0;
 for(const x of daily){high=Math.max(high,x);dd=Math.min(dd,100*(x/high-1))}
 return {method,capitalCapPct:100*cap,final:cash,returnPct:100*(cash/1000-1),
  benchmarkReturnPct:100*(benchmark/1000-1),maxDrawdownPct:dd,
  trades:tradeLog.length,wins:tradeLog.filter(x=>x.pct>0).length,
  tradeLog};
}
const baseline=[];
for(const [venue,prices] of Object.entries(datasets)){
  for(const method of methods)for(const cap of [.25,1])
    baseline.push({venue,...compute(prices,method,cap)});
}
const relativeCloseDiffs=stamps.map((_,i)=>100*(datasets.OKX[i].c/datasets.BINANCE[i].c-1));
const result={schema:'seven.crypto.okx-binance.swing-comparison-matched-dates.v1',
  researchOnly:true,ordersEnabled:false,realOrders:0,
  reproducible:true,approvedForTrading:false,
  pairContexts:{OKX:'BTC-USDC Spot',BINANCE:'BTC-USDT Spot'},
  sources:{OKX:{days:okxRows.length,first:coverage.firstUTC,last:coverage.lastUTC,digest:coverage.sha256},
    BINANCE:{archiveSha256:binSha,days:bin.rows.length}},
  comparison:{from:btcDates[startIdx],to:btcDates[endIdx],tradingDays:endIdx-startIdx+1,
    identicalDailyBarWindow:true,sameIndicatorWarmupStart:btcDates[0],warmupDays:startIdx,
    quoteCurrenciesNotIdentical:true,
    minCloseDifferencePct:Math.min(...relativeCloseDiffs),
    maxCloseDifferencePct:Math.max(...relativeCloseDiffs)},
  assumptions:{feesPerSide:fee,slippagePerSide:slip,positions:'BTC long only; no leverage, no orders',
    benchmark:'Matched Buy & Hold initial cash allocation, same first open and last close'},
  annual:baseline};
fs.writeFileSync('/tmp/seven_okx_binance_matched_research.json',JSON.stringify(result,null,2));
console.log('MATCHED_SWING_RESULT '+JSON.stringify({window:result.comparison,results:baseline.map(({venue,method,capitalCapPct,returnPct,benchmarkReturnPct,trades,wins,maxDrawdownPct})=>({venue,method,capitalCapPct,returnPct,benchmarkReturnPct,trades,wins,maxDrawdownPct}))}));
