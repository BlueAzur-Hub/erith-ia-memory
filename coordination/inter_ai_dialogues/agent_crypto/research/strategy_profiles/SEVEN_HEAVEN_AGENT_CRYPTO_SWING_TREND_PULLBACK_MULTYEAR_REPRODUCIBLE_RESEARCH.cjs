#!/usr/bin/env node
'use strict';
// Seven Heaven — public offline research only, never an executable trading profile.
// Run from any working directory: node <this-file>. Requires Node 18+ and the public
// compressed Binance daily archive already committed in this same repository.
// No network, broker, wallet, account, API key, Bridge, or order integration.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const crypto=require('node:crypto'),assert=require('node:assert/strict');

const root=path.resolve(__dirname,'../../../../../');
const archivePath=path.join(root,'public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/bitcoin-Max.json.gz');
const expectedSha='812acb4a087cc43163760a6b397506bb7cb4bbcf8eca692fc686ef9f618b8bfd';
const compressed=fs.readFileSync(archivePath);
const sha=crypto.createHash('sha256').update(compressed).digest('hex');
assert.equal(sha,expectedSha,'Stop if the historical archive was replaced');
const archive=JSON.parse(zlib.gunzipSync(compressed).toString('utf8'));
assert.equal(archive.pair,'BTCUSDT');assert.equal(archive.interval,'1d');
assert.equal(archive.is_live,false);assert.equal(archive.rows.length,3075);
assert.deepEqual(archive.columns,['open_time_ms','open','high','low','close','base_volume','quote_volume','trade_count']);
const rows=archive.rows,days=rows.map(r=>new Date(r[0]).toISOString().slice(0,10));
for(let i=0;i<rows.length;i++){
  const r=rows[i];
  assert(r.slice(1,5).every(v=>Number.isFinite(v)&&v>0),'Invalid OHLC');
  assert(r[2]>=Math.max(r[1],r[4])&&r[3]<=Math.min(r[1],r[4]),'OHLC inconsistent');
  if(i)assert.equal(r[0]-rows[i-1][0],86400000,'Missing or duplicate daily bar');
}
function ema(period){
  let value=rows.slice(0,period).reduce((s,r)=>s+r[4],0)/period;
  return rows.map((r,i)=>{
    if(i<period-1)return null;
    if(i===period-1)return value;
    value+=(r[4]-value)*2/(period+1);
    return value;
  });
}
const ema5=ema(5),ema13=ema(13),ema34=ema(34);
const fee=.001,slippage=.0005,allocation=.20;
function testYear(year){
  const start=days.indexOf(year+'-01-22'),end=days.indexOf(year+'-12-31');
  assert(start>34&&end>start,'Missing complete study window');
  let cash=1000,btc=0,position=null,pendingEntry=false,pendingExit=false,exposureDays=0;
  let equitySeries=[],trades=[],bothTouchedStopFirst=0;
  function sell(price,i,reason){
    assert(position&&btc>0,'Cannot sell without paper position');
    const received=btc*price*(1-slippage)*(1-fee);
    const trade={entry:days[position.entryIndex],exit:days[i],reason,
      days:i-position.entryIndex+1,pnlUsdt:received-position.invested,
      returnPct:100*(received/position.invested-1)};
    cash+=received;btc=0;position=null;pendingExit=false;trades.push(trade);
  }
  for(let i=start;i<=end;i++){
    const [ts,open,high,low,close]=rows[i];
    // Only previous-day information may trigger today's opening actions.
    if(position&&pendingExit)sell(open,i,'EMA13 or max-duration exit at next open');
    if(!position&&pendingEntry){
      const invested=cash*allocation,entryPrice=open*(1+slippage);
      btc=invested*(1-fee)/entryPrice;cash-=invested;
      position={entryIndex:i,invested,stop:entryPrice*.95,target:entryPrice*1.10};
      pendingEntry=false;
    }
    if(position){
      exposureDays++;
      // Daily OHLC does not reveal whether stop or target happened first.
      // Favor the adverse stop if BOTH are touched on the same day.
      if(open<=position.stop)sell(open,i,'stop: gap below');
      else if(open>=position.target)sell(position.target,i,'take-profit: gap, conservative price');
      else if(low<=position.stop){
        if(high>=position.target)bothTouchedStopFirst++;
        sell(position.stop,i,'stop: conservative first touch');
      }
      else if(high>=position.target)sell(position.target,i,'take-profit');
    }
    // Use this close only for a NEXT-day decision.
    if(position){
      if(close<ema13[i]||i-position.entryIndex+1>=14)pendingExit=true;
    } else if(i<end){
      pendingEntry=i>start && rows[i-1][4]<=ema5[i-1] &&
        close>ema5[i] && ema13[i]>ema34[i] && close>ema34[i];
    }
    // Conservative liquidatable portfolio value at daily closing prices.
    equitySeries.push(cash+btc*close*(1-slippage)*(1-fee));
  }
  if(position){
    sell(rows[end][4],end,'fixed-year-end paper liquidation');
    equitySeries[equitySeries.length-1]=cash;
  }
  let peak=1000,maxDrawdownPct=0;
  for(const equity of equitySeries){
    peak=Math.max(peak,equity);
    maxDrawdownPct=Math.min(maxDrawdownPct,100*(equity/peak-1));
  }
  const firstOpen=rows[start][1],lastClose=rows[end][4];
  const hold=weight=>1000*(1-weight)+
    (1000*weight*(1-fee)/(firstOpen*(1+slippage)))*lastClose*(1-slippage)*(1-fee);
  const buyHold20Final=hold(.20),buyHold100Final=hold(1);
  return {year,start:days[start],end:days[end],days:end-start+1,
    swingFinal:cash,swingPct:100*(cash/1000-1),swingMaxDrawdownPct:maxDrawdownPct,
    tradesCount:trades.length,wins:trades.filter(t=>t.pnlUsdt>0).length,
    losses:trades.filter(t=>t.pnlUsdt<=0).length,exposureDays,
    exposurePct:100*exposureDays/(end-start+1),
    meanHoldingDays:trades.length?trades.reduce((a,t)=>a+t.days,0)/trades.length:0,
    buyHold20Final,buyHold20Pct:100*(buyHold20Final/1000-1),
    buyHold100Final,buyHold100Pct:100*(buyHold100Final/1000-1),
    bothTouchedStopFirst,trades};
}
const years=[2022,2023,2024,2025].map(testYear);
// Reconcile the existing Seven Heaven Buy & Hold baseline under identical
// annual dates, fee/slippage and Binance daily archive assumptions.
const reference={2022:-54.75,2023:85.03,2024:124.37,2025:-17.67};
for(const y of years){
  assert(Math.abs(y.buyHold100Pct-reference[y.year])<.025,
    'Existing Seven Heaven Buy & Hold baseline does not reconcile for '+y.year);
}
const result={
  schema:'seven.crypto.swing-trend-pullback-multiyear-research.v1',
  researchOnly:true,ordersEnabled:false,realOrders:0,
  source:{venue:'Binance Spot',instrument:'BTCUSDT',bar:'1d',
    archivePath:'public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/bitcoin-Max.json.gz',
    archiveSha256:sha,bars:rows.length,first:days[0],last:days.at(-1)},
  method:{window:'Jan 22–Dec 31, each year 2022–2025, reset 1000 USDT per year',
    price:'daily candle, previous completed close -> next daily open, no lookahead',
    ema:'EMA5/EMA13/EMA34 seeded by first-period SMA; full pre-2022 warmup',
    entry:'Previous close <= previous EMA5, new close > EMA5, EMA13 > EMA34, close > EMA34; next open',
    exit:'Fixed 5% stop, 10% target; otherwise daily close < EMA13 or 14-day max hold -> next open; liquidate on Dec 31',
    stopVsTarget:'If both touched on same daily candle, assume stop occurs first',
    portfolio:'1000 USDT; max 20% allocated per trade; rest stays in cash, long-only, no leverage',
    costs:'0.10% fees and 0.05% slippage EACH SIDE, modelled on all entries and exits',
    comparisons:'Buy & Hold 20% initial exposure (matched allocation) and Buy & Hold 100% (context)',
    omissions:'Taxes, funding, changing OKX fees, intra-day path, order-book liquidity, market impact, exchange execution'},
  years};
process.stdout.write(JSON.stringify(result,null,2)+'\n');