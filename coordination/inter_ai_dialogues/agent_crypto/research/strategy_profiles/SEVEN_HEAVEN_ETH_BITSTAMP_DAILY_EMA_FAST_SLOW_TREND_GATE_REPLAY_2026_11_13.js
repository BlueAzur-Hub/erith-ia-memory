#!/usr/bin/env node
"use strict";
/*
 Seven Heaven: reproducible retrospective PAPER test, no API credentials,
 no orders. Run from the repository root:
 node coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_ETH_BITSTAMP_DAILY_EMA_FAST_SLOW_TREND_GATE_REPLAY_2026_11_13.js
*/
const fs = require("node:fs");
const crypto = require("node:crypto");
const path = require("node:path");
const root = process.cwd();
const rel = "coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/native_bitstamp_eth_2024_2026_evidence/bitstamp_ethusd_daily_2023_2026.csv";
const bytes = fs.readFileSync(path.join(root, rel));
const gitBlobSha = crypto.createHash("sha1")
  .update(Buffer.from("blob " + bytes.length + "\0"))
  .update(bytes).digest("hex");
if (gitBlobSha !== "49e8f3e8f89fdc2929d2e37d1cc5e4904813621e")
  throw Error("Source Git blob differs from published, reviewed CSV");
const lines = bytes.toString("utf8").trim().split(/\r?\n/);
if (lines.shift() !== "date,open,high,low,close,volume")
  throw Error("Unexpected Bitstamp source columns");
const days = lines.map(line => {
  const a = line.split(",");
  if (a.length !== 6) throw Error("Malformed daily row");
  const d = {date:a[0], open:+a[1],high:+a[2],low:+a[3],close:+a[4],volume:+a[5]};
  if (![d.open,d.high,d.low,d.close,d.volume].every(Number.isFinite)
      || d.low <= 0 || d.low > Math.min(d.open,d.close)
      || d.high < Math.max(d.open,d.close) || d.volume < 0)
    throw Error("Bad OHLCV at " + d.date);
  return d;
});
if (days.length !== 1310 || days[0].date !== "2023-04-01"
    || days.at(-1).date !== "2026-10-31") throw Error("Unexpected source date range");
for (let i=1;i<days.length;i++) {
  const delta=Date.parse(days[i].date+"T00:00:00Z")-Date.parse(days[i-1].date+"T00:00:00Z");
  if (delta!==86400000) throw Error("Gap/duplicate: "+days[i].date);
}
let e5=days[0].close,e13=e5,e10=e5,e30=e5;
for (let i=0;i<days.length;i++) {
  const d=days[i];
  if (i) {
    e5+=(2/6)*(d.close-e5);
    e13+=(2/14)*(d.close-e13);
    e10+=(2/11)*(d.close-e10);
    e30+=(2/31)*(d.close-e30);
  }
  d.fast=e5>e13 && d.close>e13;
  d.slow=e10>e30 && d.close>e30;
  d.filtered=d.fast && d.slow;
}
const start=days.findIndex(d=>d.date==="2024-01-01");
if (start!==275 || days.length-start!==1035) throw Error("Warmup/test mismatch");
const factorFee=0.001,factorSlip=0.0005;
function replay(method,multiplier=1) {
  const fee=factorFee*multiplier,slip=factorSlip*multiplier;
  let cash=1000,qty=0,peak=1000,maxDD=0,orders=0,exposed=0;
  const curve=[];
  for (let i=start;i<days.length;i++) {
    const d=days[i],signal=days[i-1];
    const want=method==="hold" ? true : !!signal[method];
    if (want && qty===0) {
      qty=cash*(1-fee)/(d.open*(1+slip));cash=0;orders++;
    } else if (!want && qty>0) {
      cash=qty*d.open*(1-slip)*(1-fee);qty=0;orders++;
    }
    const equity=cash+qty*d.close*(1-slip)*(1-fee);
    peak=Math.max(peak,equity);
    maxDD=Math.min(maxDD,100*(equity/peak-1));
    if(qty>0)exposed++;
    curve.push({date:d.date,equity,exposed:Number(qty>0)});
  }
  const yearly={},round=x=>+x.toFixed(6);
  let previous=1000;
  for (const year of ["2024","2025","2026"]) {
    const group=curve.filter(x=>x.date.startsWith(year));
    const end=group.at(-1).equity;
    yearly[year]={return_pct:round(100*(end/previous-1)),
       exposed_days:group.filter(x=>x.exposed).length,days:group.length};
    previous=end;
  }
  return {final_usd:round(curve.at(-1).equity),
    return_pct:round(100*(curve.at(-1).equity/1000-1)),
    max_drawdown_pct:round(maxDD),transactions:orders,exposed_days:exposed,
    yearly_continuous:yearly};
}
const stats={};
for(const method of ["fast","slow","filtered","hold"]) {
  stats[method]={...replay(method),stress_costs_x2_return_pct:replay(method,2).return_pct};
}
if (Math.abs(stats.slow.return_pct-89.548633)>0.0001
    || Math.abs(stats.slow.max_drawdown_pct-(-54.100527))>0.0001
    || stats.slow.transactions!==54 || stats.slow.exposed_days!==442)
  throw Error("Does not reproduce established Bitstamp EMA10/30 baseline");
const overlap={both:0,slow_only:0,fast_only:0,neither:0};
for(let i=start;i<days.length;i++) {
  const p=days[i-1];
  const k=p.fast && p.slow ? "both" : p.slow ? "slow_only"
    : p.fast ? "fast_only" : "neither";
  overlap[k]++;
}
const result={
  status:"RETROSPECTIVE_PAPER_ONLY_NO_ORDERS",
  source:rel,git_blob_sha1:gitBlobSha,
  warmup_utc:["2023-04-01","2023-12-31"],
  test_utc:["2024-01-01","2026-10-31"],
  periods:"One continuous 1035-day capital path; yearly returns derived from that path.",
  fee_pct_per_side:0.1,slippage_pct_per_side:0.05,
  fast:"EMA5>EMA13 AND close>EMA13",
  slow:"EMA10>EMA30 AND close>EMA30",
  filtered:"fast AND slow",
  execution:"At next day open based on previous UTC daily close; liquidatable value at each daily close",
  allocation:"100% ETH/USD or 100% USD cash, no leverage, no rebalancing",
  overlap_days:overlap,stats,
  caveats:["Previously investigated 2024-2026 dates: NOT a fresh out-of-sample validation",
    "Fixed fee/slippage hypothesis; no depth, tax or live orders",
    "Bitstamp ETH/USD, not OKX ETH/USDC or Binance ETH/USDT",
    "USD idle return assumed 0%; not a practical performance guarantee"]
};
console.log(JSON.stringify(result,null,2));
