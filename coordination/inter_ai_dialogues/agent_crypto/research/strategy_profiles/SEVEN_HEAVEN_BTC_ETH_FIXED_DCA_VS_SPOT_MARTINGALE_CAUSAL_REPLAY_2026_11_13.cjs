#!/usr/bin/env node
"use strict";
/* Seven Heaven — deterministic spot-only PAPER research comparing CASH/HOLD/
 * fixed monthly DCA/a bounded daily causal analogue of Spot DCA Martingale.
 * No authenticated APIs, trading accounts, network or actual orders.
 * Preserve the frozen protocol: SEVEN_HEAVEN_FIXED_DCA_AND_SPOT_MARTINGALE_DAILY_CAUSAL_PROTOCOL_2026_11_13.md
 */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const R="coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/";
const SOURCES={
 BTC:{file:"native_bitstamp_btc_eth_2024_2026_evidence/bitstamp_btcusd_daily_2023_2026.csv",
       sha256:"89a85a2f419244b3140f0518fb731f37c06abc3b73734433eb3fbf4642907dbb"},
 ETH:{file:"native_bitstamp_eth_2024_2026_evidence/bitstamp_ethusd_daily_2023_2026.csv",
       sha256:"881227ba20481322b6829c19d97b799d11a73ae155be8868cf5ec943039c6b49"}
};
const WINDOWS={
 "2024":["2024-01-01","2024-12-31"],
 "2025":["2025-01-01","2025-12-31"],
 "2026_JAN_OCT":["2026-01-01","2026-10-31"]
};
const METHODS=["CASH","HOLD","MONTHLY_DCA","SPOT_DCA_MARTINGALE_DAILY_PROXY"];
const PREC=10**9;
const round=(x,n=6)=>Number(x.toFixed(n));
const day=(x)=>Date.parse(x+"T00:00:00Z");
function loadSource(spec){
 const bytes=fs.readFileSync(path.join(process.cwd(),R,spec.file));
 assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"),spec.sha256,"Historical source SHA mismatch");
 const ls=bytes.toString("utf8").trim().split(/\r?\n/);
 assert.equal(ls.shift(),"date,open,high,low,close,volume");
 const rows=ls.map(line=>{
   const p=line.split(",");
   assert.equal(p.length,6);
   const z={date:p[0],open:+p[1],high:+p[2],low:+p[3],close:+p[4],volume:+p[5]};
   assert(Object.values(z).slice(1).every(Number.isFinite),"Nonfinite source field");
   assert(z.low>0 && z.volume>=0 && z.low<=Math.min(z.open,z.close) && z.high>=Math.max(z.open,z.close),"Invalid OHLC");
   return z;
 });
 assert.equal(rows.length,1310);assert.equal(rows[0].date,"2023-04-01");assert.equal(rows.at(-1).date,"2026-10-31");
 for(let i=1;i<rows.length;i++)assert.equal(day(rows[i].date)-day(rows[i-1].date),86400000,"CSV calendar gap/duplicate");
 return rows;
}
function simulate(rows,method,year,fee=0.001,slip=0.0005){
 const [start,end]=WINDOWS[year];
 const a=rows.filter(x=>x.date>=start&&x.date<=end);
 assert(a.length>0&&a[0].date===start&&a.at(-1).date===end,"Window coverage mismatch");
 const monthCount=new Set(a.map(r=>r.date.slice(0,7))).size;
 assert(monthCount===(year==="2026_JAN_OCT"?10:12));
 let cash=1000,qty=0,cost=0,lastBuyFill=0,safety=0,cycle=0;
 let cooldown=false,prevMonth="",buyCount=0,sellCount=0,peak=1000,maxDD=0;
 let exposedDays=0,maxMarkedInventoryUsd=0,maxCommittedUsd=0,underwaterFullSafetyDays=0;
 let totalIdleCash=0,skippedSafety=0,maxSafetyUsed=0;
 const tx=[],curve=[],cycleLogs=[];
 const BASE=40,MULT=1.8,STEP=0.05,TP=0.06,MAX_SAFETY=4;
 function buy(r,budget,kind,trigger){
   assert(budget>0&&budget<=cash+1e-9);
   const spent=Math.min(cash,budget);
   const fill=r.open*(1+slip),q=spent/(fill*(1+fee));
   assert(Number.isFinite(q)&&q>0&&q<=1e8);
   cash-=spent; qty+=q;cost+=spent;lastBuyFill=fill;
   if(Math.abs(cash)<1e-9)cash=0;
   buyCount++;
   tx.push({date:r.date,side:"BUY",reason:kind,signal_at:trigger||null,price_open:r.open,
     modeled_fill:round(fill,9),quote_debit_usd:round(spent,9),base_qty:round(q,12),
     cash_after:round(cash,9),safety_count_after:safety});
 }
 function sell(r,reason,trigger){
   assert(qty>0&&cost>0);
   const fill=r.open*(1-slip),proceeds=qty*fill*(1-fee);
   const net=proceeds-cost;
   cash+=proceeds;
   sellCount++;
   tx.push({date:r.date,side:"SELL",reason,signal_at:trigger||null,
     price_open:r.open,modeled_fill:round(fill,9),
     base_qty:round(qty,12),quote_net:round(proceeds,9),
     cycle_pnl_usd:round(net,9),cash_after:round(cash,9),safety_used:safety});
   cycleLogs.push({closed_at:r.date,pnl_usd:round(net,8),safety_buys:safety});
   qty=0;cost=0;lastBuyFill=0;maxSafetyUsed=Math.max(maxSafetyUsed,safety);
   safety=0;cycle++;
 }
 for(let i=0;i<a.length;i++){
   const r=a[i],previous=i?a[i-1]:null;
   if(method==="HOLD" && i===0) buy(r,cash,"INITIAL_HOLD");
   if(method==="MONTHLY_DCA" && r.date.slice(0,7)!==prevMonth){
     prevMonth=r.date.slice(0,7);
     buy(r,Math.min(cash,1000/monthCount),"FIXED_MONTHLY_QUOTA");
   }
   if(method==="SPOT_DCA_MARTINGALE_DAILY_PROXY"){
     let acted=false;
     if(previous && qty>0){
       const basis=cost/qty;
       if(previous.close>=basis*(1+TP)){
         sell(r,"PREVIOUS_CLOSE_TP_6PCT",previous.date);
         acted=true;
       }else if(safety<MAX_SAFETY && previous.close<=lastBuyFill*(1-STEP)){
         const planned=BASE*Math.pow(MULT,safety+1);
         if(cash+1e-9>=planned){
           safety++;
           buy(r,planned,"PREVIOUS_CLOSE_SAFETY_DOWN_5PCT",previous.date);
         }else skippedSafety++;
         acted=true;
       }
     }
     if(qty===0&&!acted&&cash>=BASE){buy(r,BASE,"START_NEW_CYCLE");}
     if(qty>0&&safety===MAX_SAFETY&&r.close<cost/qty)underwaterFullSafetyDays++;
     if(qty>0)maxCommittedUsd=Math.max(maxCommittedUsd,cost);
   }
   const liquidation=qty*r.close*(1-slip)*(1-fee);
   const equity=cash+liquidation;
   if(!Number.isFinite(equity)||!Number.isFinite(cash)||!Number.isFinite(qty)||cash< -1e-7||qty<0)
     throw Error("Cash/inventory accounting corrupted "+method+" "+r.date);
   if(method==="SPOT_DCA_MARTINGALE_DAILY_PROXY")
     assert(cost<=1000+100,"Safety cycle reserved budget unexpectedly exceeded 1100");
   peak=Math.max(peak,equity);
   maxDD=Math.min(maxDD,100*(equity/peak-1));
   if(qty>0)exposedDays++;
   maxMarkedInventoryUsd=Math.max(maxMarkedInventoryUsd,liquidation);
   totalIdleCash+=cash;
   curve.push({date:r.date,equity_usd:round(equity,8),cash_usd:round(cash,8),
     marked_inventory_usd:round(liquidation,8),safety_orders_used:safety});
 }
 const endEq=curve.at(-1).equity_usd;
 const endAssets={cash_usd:round(cash,8),base_qty:round(qty,12),
  marked_inventory_usd:round(qty*a.at(-1).close*(1-slip)*(1-fee),8)};
 assert(Math.abs(endAssets.cash_usd+endAssets.marked_inventory_usd-endEq)<1e-6);
 if(method==="CASH"){assert.equal(buyCount,0);assert.equal(sellCount,0);assert.equal(endEq,1000);}
 if(method==="HOLD"){assert.equal(buyCount,1);assert.equal(sellCount,0);}
 if(method==="MONTHLY_DCA"){assert.equal(buyCount,monthCount);assert.equal(sellCount,0);}
 return {asset_calendar:[start,end],days:a.length,method,
  final_usd:round(endEq,6),return_pct:round(100*(endEq/1000-1),6),
  max_drawdown_pct:round(maxDD,6),buy_count:buyCount,sell_count:sellCount,
  asset_exposure_days:exposedDays,asset_exposure_pct:round(100*exposedDays/a.length,3),
  average_idle_cash_usd:round(totalIdleCash/a.length,5),
  max_marked_inventory_usd:round(maxMarkedInventoryUsd,6),
  max_quote_committed_in_cycle_usd:round(maxCommittedUsd,6),
  completed_cycles:cycleLogs.length,open_cycle_base_inventory:endAssets.base_qty,
  max_safety_buys_used:maxSafetyUsed,skipped_safety_due_to_cash:skippedSafety,
  days_all_safety_used_and_underwater:underwaterFullSafetyDays,
  ending_balance:endAssets,actions:tx,cycles:cycleLogs,
  drawdown_calculation:"daily liquidatable equity, not intra-bar path"};
}
function run(){
 const baseline={},byYear={};
 for(const [asset,spec] of Object.entries(SOURCES)){
   const rows=loadSource(spec);
   baseline[asset]={daily_count:rows.length,range:[rows[0].date,rows.at(-1).date],sha256:spec.sha256};
   byYear[asset]={};
   for(const year of Object.keys(WINDOWS)){
     const slice=rows.filter(d=>d.date>=WINDOWS[year][0]&&d.date<=WINDOWS[year][1]);
     const changes=100*(slice.at(-1).close/slice[0].open-1);
     byYear[asset][year]={underlying_first_open_last_close_change_pct:round(changes,6),policies:{}};
     for(const m of METHODS){
       const normal=simulate(rows,m,year);
       const stressed=simulate(rows,m,year,.002,.001);
       byYear[asset][year].policies[m]={...normal,costs_doubled_return_pct:stressed.return_pct,
         stress_actions_buy_count:stressed.buy_count,stress_actions_sell_count:stressed.sell_count};
     }
   }
 }
 const result={schema:"seven-heaven.btc-eth-spot-fixed-dca-martingale-daily-proxy-v1",
  date:"2026-11-13",status:"RETROSPECTIVE_PAPER_EXPLORATORY_NO_LIVE_ORDERS",
  frozen_protocol:"SEVEN_HEAVEN_FIXED_DCA_AND_SPOT_MARTINGALE_DAILY_CAUSAL_PROTOCOL_2026_11_13.md",
  venue:"Bitstamp native historical BTC/USD and ETH/USD daily",source_provenance:baseline,
  windows:WINDOWS,methods:METHODS,capital_usd_per_policy_per_asset_per_window:1000,
  roundtrip_hypotheses:{fee_pct_per_side:0.1,slippage_pct_per_side:0.05},
  martingale_parameters:{initial_order_usd:40,drop_since_last_buy_pct:5,safety_multiplier:1.8,
    max_safety_buys:4,planned_full_cycle_total_usd:894.784,take_profit_vs_all_in_avg_cost_pct:6,
    trigger:"previous daily close; next daily open hypothetical fill",leverage:false,
    no_stop_loss:true,no_intraday_trigger:true},
  caveats:["This is NOT a faithful exchange-hosted OKX intraday DCA bot; daily causal proxy only",
   "USD Bitstamp, not OKX USDC; no authenticated eligibility, minSz/lotSz or historical book fills",
   "2024/2025/2026 already explored in other strategies: NO out-of-sample validation",
   "Equal initial bankroll but unequal time invested; compare average cash and maximum exposure",
   "Fixed 0.1% taker + 0.05% slippage per side are PAPER assumptions, not Bitstamp verified fees",
   "Stop-loss absent by design: large drawdowns possible; an open losing cycle is not a realized win",
   "No account order endpoint, connection, private key, trading action or recommendation"],
  results:byYear};
 return result;
}
const result=run();
if(process.argv.includes("--check")){
 const fp=path.join(process.cwd(),R,"seven_heaven_dca_martingale_causal_evidence",
  "SEVEN_HEAVEN_BTC_ETH_DCA_MARTINGALE_2026_11_13_PROOFS.json");
 const expected=JSON.parse(fs.readFileSync(fp,"utf8"));
 assert.deepEqual(result,expected,"Published proof differs from frozen replay");
 console.log("PASS: native Bitstamp SHA, continuous dates, capital/inventory invariants and proof match");
 process.exit(0);
}
const out=path.join(process.cwd(),R,"seven_heaven_dca_martingale_causal_evidence");
fs.mkdirSync(out,{recursive:true});
const jfile=path.join(out,"SEVEN_HEAVEN_BTC_ETH_DCA_MARTINGALE_2026_11_13_PROOFS.json");
const mfile=path.join(out,"SEVEN_HEAVEN_BTC_ETH_DCA_MARTINGALE_2026_11_13_REPORT.md");
for(const f of [jfile,mfile])if(fs.existsSync(f))throw Error("Existing immutable evidence; run --check instead");
const summary=[
"# Seven Heaven — First broader bot study: fixed DCA vs bounded Spot DCA Martingale daily proxy",
"",
"**2026-11-13 · HISTORICAL retrospective PAPER only; NOT OKX bot execution, not prospective validation.**",
"",
"## Method",
"",
"- Frozen before this replay: [DCA/Martingale protocol](../SEVEN_HEAVEN_FIXED_DCA_AND_SPOT_MARTINGALE_DAILY_CAUSAL_PROTOCOL_2026_11_13.md).",
"- Bitstamp BTC/USD and ETH/USD daily OHLC, three separate **1,000 USD** test budgets: calendar 2024, calendar 2025, Jan–Oct 2026.",
"- Four policies: no trade (CASH), immediate Buy & Hold, equal monthly purchases, bounded 40 USD + 4 safety buys after 5% drops with 1.8 multiplier and 6% prior-close take-profit (daily, next-open-only analogue).",
"- Hypothetical 0.10% fee + 0.05% slippage on both sides; cash earns 0%. No real orders, minSz, account access or venue-specific historical fill proof.",
"",
"## Returns and drawdowns (fictitious, final liquidatable balance)",
"",
"| Coin | Window | Underlying gross change | HOLD return | Fixed DCA return | Martingale proxy return | Martingale max DD | Martingale buys/sells | Martingale max committed USD |",
"|---|---|---:|---:|---:|---:|---:|---:|---:|"
];
for(const asset of ["BTC","ETH"]){
 for(const year of Object.keys(WINDOWS)){
   const w=result.results[asset][year];
   const H=w.policies.HOLD,D=w.policies.MONTHLY_DCA,M=w.policies.SPOT_DCA_MARTINGALE_DAILY_PROXY;
   summary.push("| "+asset+" | "+year+" | "+[w.underlying_first_open_last_close_change_pct,H.return_pct,D.return_pct,M.return_pct,M.max_drawdown_pct].map(x=>round(x,2).toFixed(2)+"%").join(" | ")+" | "+M.buy_count+"/"+M.sell_count+" | "+M.max_quote_committed_in_cycle_usd.toFixed(2)+" |");
 }
}
summary.push("",
"## Risk and interpretation",
"",
"1. Fair initial bankroll **is not** equal invested capital: monthly DCA and Martingale retain significant cash; compare \`average_idle_cash_usd\`, \`max_marked_inventory_usd\`, exposure days and drawdown, not return alone.",
"2. The Martingale trigger deliberately lacks a stop-loss and can retain a large losing inventory through declining markets. Trades counted as completed cycles must not hide still-open inventory at the final day.",
"3. The experiment uses **previous closed daily price** to trigger a next-open hypothetical buy/sell: it cannot claim to simulate intraday limit orders, the actual OKX Martingale bot, its user configuration or the order queue.",
"4. Every cohort (2024, 2025, early 2026) was already known from other Agent-Crypto studies. This is a **new strategy family**, but still an **exploratory historical comparison**, not blind validation.",
"5. Double-cost sensitivity and full per-event ledger are in the adjacent JSON. Do not tune the parameters on these results and then report the same periods as validation.",
"6. Before testing actual Spot Grid mechanisms, obtain or reconstruct sufficiently granular ordered prices. Daily OHLC alone cannot establish the order of touches within a grid.",
"",
"## Preservation",
"",
"- Deterministic standard-library Node.js replay: [source](../SEVEN_HEAVEN_BTC_ETH_FIXED_DCA_VS_SPOT_MARTINGALE_CAUSAL_REPLAY_2026_11_13.cjs).",
"- [Proof JSON including inventories and all entry/exit events](./SEVEN_HEAVEN_BTC_ETH_DCA_MARTINGALE_2026_11_13_PROOFS.json).",
"- No change to Administrator, Trader, Operator, Bridge, live bots or account permissions; separate strategy learning evidence only.",
"");
fs.writeFileSync(jfile,JSON.stringify(result,null,2)+"\n");
fs.writeFileSync(mfile,summary.join("\n")+"\n");
for(const asset of ["BTC","ETH"])for(const year of Object.keys(WINDOWS)){
 const w=result.results[asset][year],p=w.policies;
 console.log(asset+" "+year+" HOLD "+p.HOLD.return_pct+" DCA "+p.MONTHLY_DCA.return_pct+
   " MART "+p.SPOT_DCA_MARTINGALE_DAILY_PROXY.return_pct+
   " MART_DD "+p.SPOT_DCA_MARTINGALE_DAILY_PROXY.max_drawdown_pct+
   " TRADES "+p.SPOT_DCA_MARTINGALE_DAILY_PROXY.buy_count+"/"+p.SPOT_DCA_MARTINGALE_DAILY_PROXY.sell_count);
}
console.log(JSON.stringify({status:"PASS_CLOSED_HISTORY_EXPLORATION",proof:jfile,report:mfile},null,2));
