#!/usr/bin/env node
"use strict";
/* Seven Heaven 2026-11-13, deterministic read-only PAPER replay.
Run from the root of BlueAzur-Hub/erith-ia-memory:
 node coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_BTC_ETH_DAILY_CASH_OPPORTUNITY_CONFIRMATION_AND_RISK_REPLAY_2026_11_13.js --check
The --check mode compares recomputed results to the archived proof.
No network, credentials, account API or order submission.
*/
const fs=require("node:fs");
const crypto=require("node:crypto");
const path=require("node:path");
const ROOT="coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/";
const SOURCE={
  "BTC": {
    "file": "native_bitstamp_btc_eth_2024_2026_evidence/bitstamp_btcusd_daily_2023_2026.csv",
    "sha256": "89a85a2f419244b3140f0518fb731f37c06abc3b73734433eb3fbf4642907dbb"
  },
  "ETH": {
    "file": "native_bitstamp_eth_2024_2026_evidence/bitstamp_ethusd_daily_2023_2026.csv",
    "sha256": "881227ba20481322b6829c19d97b799d11a73ae155be8868cf5ec943039c6b49"
  }
};
function analysisEngine(csvByAsset) {
  const series={}, start=275, first="2024-01-01", last="2026-10-31";
  for (const [asset,textData] of Object.entries(csvByAsset)) {
    const lines=textData.trim().split(/\r?\n/);
    if(lines.shift()!=="date,open,high,low,close,volume")throw Error("CSV header mismatch: "+asset);
    const a=lines.map(line=>{
      const v=line.split(",");
      if(v.length!==6)throw Error("Malformed CSV row");
      const x={date:v[0],o:+v[1],h:+v[2],l:+v[3],c:+v[4],volume:+v[5]};
      if (![x.o,x.h,x.l,x.c,x.volume].every(Number.isFinite)
      || x.l<=0||x.l>Math.min(x.o,x.c)||x.h<Math.max(x.o,x.c)||x.volume<0)
         throw Error("Invalid source row "+x.date);
      return x;
    });
    if(a.length!==1310||a[0].date!=="2023-04-01"||a[start].date!==first||a.at(-1).date!==last)
       throw Error("Unexpected coverage");
    for(let i=1;i<a.length;i++)
      if(Date.parse(a[i].date+"T00:00:00Z")-Date.parse(a[i-1].date+"T00:00:00Z")!==86400000)
         throw Error("Missing/duplicate day "+a[i].date);
    let e5=a[0].c,e13=e5,e10=e5,e30=e5;
    for(let i=0;i<a.length;i++){
      const x=a[i];
      if(i){
        e5+=(2/6)*(x.c-e5); e13+=(2/14)*(x.c-e13);
        e10+=(2/11)*(x.c-e10);e30+=(2/31)*(x.c-e30);
      }
      x.fast=e5>e13&&x.c>e13;
      x.slow=e10>e30&&x.c>e30;
      x.gate=x.fast&&x.slow;
    }
    // Symmetric 2/3 closed-day confirmations and an explicitly asymmetric comparator.
    for(const method of ["c2","c3","e1n2"]){
      let state=false,prev=null,count=0;
      for(const x of a){
        count=x.slow===prev?count+1:1;
        prev=x.slow;
        const needed=method==="c2"?2:method==="c3"?3:(x.slow?2:1);
        if(count>=needed)state=x.slow;
        x[method]=state;
      }
    }
    series[asset]=a;
  }
  const round=x=>+x.toFixed(6);
  function replay(a,method,fee=.001,slippage=.0005) {
    let cash=1000,qty=0,peak=1000,worst=0;
    const curve=[],trades=[],windows=[];
    let activeCash=null;
    for(let i=start;i<a.length;i++){
      const x=a[i],signal=a[i-1],want=method==="hold"?true:!!signal[method];
      if(want&&qty===0){
        if(activeCash){
          const w={...activeCash,end:x.date,end_price:x.o,days:i-activeCash.i,ret_pct:round(100*(x.o/activeCash.start_price-1)),censored:false};
          delete w.i; windows.push(w); activeCash=null;
        }
        qty=cash*(1-fee)/(x.o*(1+slippage));cash=0;
        trades.push({date:x.date,side:"BUY",opening_price:x.o});
      }else if(!want&&qty>0){
        cash=qty*x.o*(1-slippage)*(1-fee);qty=0;
        trades.push({date:x.date,side:"SELL",opening_price:x.o});
        activeCash={start:x.date,start_price:x.o,i,initial:false};
      }
      if(!want&&qty===0&&!activeCash)activeCash={start:x.date,start_price:x.o,i,initial:true};
      const equity=cash+qty*x.c*(1-slippage)*(1-fee);
      peak=Math.max(peak,equity);
      worst=Math.min(worst,100*(equity/peak-1));
      curve.push({date:x.date,equity,exposed:qty>0});
    }
    if(activeCash) {
      const end=a.at(-1);
      const w={...activeCash,end:end.date,end_price:end.c,days:a.length-activeCash.i,ret_pct:round(100*(end.c/activeCash.start_price-1)),censored:true};
      delete w.i;windows.push(w);
    }
    const final=curve.at(-1).equity;
    let earlier=1000,yearly={};
    for(const year of ["2024","2025","2026"]){
      const part=curve.filter(x=>x.date.startsWith(year));
      const e=part.at(-1).equity;
      yearly[year]={return_pct:round(100*(e/earlier-1)),
        exposed_days:part.filter(x=>x.exposed).length,
        cash_days:part.filter(x=>!x.exposed).length};
      earlier=e;
    }
    const full=windows.filter(w=>!w.initial&&!w.censored);
    const rising=full.filter(w=>w.ret_pct>0),falling=full.filter(w=>w.ret_pct<0);
    return {
      final_usd:round(final),return_pct:round(100*(final/1000-1)),
      max_drawdown_pct:round(worst),transactions:trades.length,
      exposed_days:curve.filter(x=>x.exposed).length,
      cash_days:curve.filter(x=>!x.exposed).length,
      yearly_continuous:yearly,
      cash_windows:{
        completed:full.length,positive:rising.length,negative:falling.length,
        rise_ge_3_pct:rising.filter(w=>w.ret_pct>=3).length,
        decline_le_minus_3_pct:falling.filter(w=>w.ret_pct<=-3).length,
        quick_reentry_le_7_days:full.filter(w=>w.days<=7).length,
        best_avoided_decline:falling.reduce((best,x)=>!best||x.ret_pct<best.ret_pct?x:best,null),
        worst_missed_rise:rising.reduce((best,x)=>!best||x.ret_pct>best.ret_pct?x:best,null),
        censored_at_end:windows.filter(w=>w.censored).length,
        full_list:windows
      },trades,curve
    };
  }
  const models=["hold","fast","slow","gate","c2","c3","e1n2"];
  const all={},curves={};
  for(const [asset,a] of Object.entries(series)){
    all[asset]={};curves[asset]={};
    for(const model of models){
      const net=replay(a,model),gross=replay(a,model,0,0),
           stress=replay(a,model,.002,.001);
      // Exact telescoping identity: gross relative to always-hold = inverse
      // product of price ratios between ALL (including censored) cash windows.
      const cashLog=gross.cash_windows.full_list.reduce(
        (s,w)=>s+Math.log(w.end_price/w.start_price),0);
      const holdGross=series[asset].at(-1).c/series[asset][start].o;
      const priceTiming=gross.final_usd/(1000*holdGross);
      const factor=Math.exp(-cashLog);
      if(Math.abs(factor-priceTiming)>1e-9)throw Error("Cash attribution identity failure "+asset+" "+model);
      curves[asset][model]=net.curve;
      all[asset][model]={
        return_pct:net.return_pct,final_usd:net.final_usd,
        gross_no_cost_return_pct:gross.return_pct,
        cost_penalty_percentage_points:round(gross.return_pct-net.return_pct),
        stress_double_cost_return_pct:stress.return_pct,
        max_drawdown_pct:net.max_drawdown_pct,transactions:net.transactions,
        exposed_days:net.exposed_days,cash_days:net.cash_days,
        yearly_continuous:net.yearly_continuous,
        cash_timing_gross_relative_to_hold:round(factor),
        cash_log_missed_upside:round(gross.cash_windows.full_list.reduce(
          (s,w)=>s+Math.max(0,Math.log(w.end_price/w.start_price)),0)),
        cash_log_avoided_downside:round(gross.cash_windows.full_list.reduce(
          (s,w)=>s+Math.min(0,Math.log(w.end_price/w.start_price)),0)),
        windows_summary:Object.fromEntries(Object.entries(net.cash_windows).filter(([k])=>k!=="full_list")),
        windows: (model==="slow"||model==="c2") ? net.cash_windows.full_list : undefined,
        trades: (model==="slow") ? net.trades : undefined
      };
    }
  }
  const mixes={};
  for(const model of models){
    const bc=curves.BTC[model],ec=curves.ETH[model];
    if(bc.length!==1035||ec.length!==1035)throw Error("Dual mismatch");
    let peak=1000,worst=0;
    const avg=bc.map((v,i)=>{if(v.date!==ec[i].date)throw Error("Portfolio calendar mismatch");const value=(v.equity+ec[i].equity)/2;peak=Math.max(peak,value);worst=Math.min(worst,100*(value/peak-1));return{date:v.date,eq:value}});
    const netEnd=avg.at(-1).eq;
    mixes[model]={capital_usd:round(netEnd),return_pct:round(100*(netEnd/1000-1)),
      max_drawdown_pct:round(worst),
      transactions:all.BTC[model].transactions+all.ETH[model].transactions,
      stress_double_cost_return_pct:round((all.BTC[model].stress_double_cost_return_pct+all.ETH[model].stress_double_cost_return_pct)/2),
      yearly_continuous:{}};
    let prev=1000;
    for(const year of ["2024","2025","2026"]){
      const end=avg.filter(x=>x.date.startsWith(year)).at(-1).eq;
      mixes[model].yearly_continuous[year]=round(100*(end/prev-1));prev=end;
    }
  }
  // Two independent, earlier published replay reference values.
  if(Math.abs(all.BTC.slow.return_pct-65.781857)>0.0001
  ||Math.abs(all.ETH.slow.return_pct-89.548633)>0.0001
  ||all.BTC.slow.transactions!==68||all.ETH.slow.transactions!==54
  ||Math.abs(mixes.slow.return_pct-77.665245)>0.0001)
    throw Error("Published 12-Nov replay reference mismatch");
  return {schema:"seven-heaven.btc-eth-daily-cash-windows-multimodel-v1",
    research_date:"2026-11-13",status:"RETROSPECTIVE_PAPER_ONLY_NO_ACTUAL_ORDERS",
    source:"Bitstamp native BTC/USD and ETH/USD, 1310 UTC calendar days each",
    warmup:["2023-04-01","2023-12-31"],study:["2024-01-01","2026-10-31"],
    method_definitions:{
      hold:"Buy at first test-day open, stay invested until valuation at final close",
      fast:"EMA5 > EMA13 AND close > EMA13",
      slow:"EMA10 > EMA30 AND close > EMA30",
      gate:"fast AND slow",
      c2:"EMA10/30 raw state must persist for 2 daily closes before both entries and exits",
      c3:"EMA10/30 raw state must persist for 3 daily closes before both entries and exits",
      e1n2:"EMA10/30 one bearish close to exit and two bullish closes to enter"},
    fee_pct_side:0.1,slippage_pct_side:0.05,
    note:"Yearly performance is the actual continuous portfolio change, never a yearly reset.",
    results:all,dual_50_50_initial_unrebalanced:mixes};
}
const csv={};
for(const [asset,source] of Object.entries(SOURCE)){
 const buf=fs.readFileSync(path.join(process.cwd(),ROOT,source.file));
 const sha=crypto.createHash("sha256").update(buf).digest("hex");
 if(sha!==source.sha256)throw Error("Reference SHA256 mismatch for "+asset+": "+sha);
 csv[asset]=buf.toString("utf8");
}
const result=analysisEngine(csv);
if(process.argv.includes("--check")){
 const p=path.join(process.cwd(),ROOT,"SEVEN_HEAVEN_BTC_ETH_DAILY_CASH_OPPORTUNITY_CONFIRMATION_AND_RISK_PROOFS_2026_11_13.json");
 const expected=JSON.parse(fs.readFileSync(p,"utf8"));
 if(JSON.stringify(result)!==JSON.stringify(expected.results))throw Error("Published proof differs from native replay");
 console.log("SUCCESS 1310+1310 native days; 1035-day portfolios; archived proof and cash-timing identities checked");
}else console.log(JSON.stringify(result,null,2));
