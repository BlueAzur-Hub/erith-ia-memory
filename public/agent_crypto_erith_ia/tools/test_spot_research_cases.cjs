"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const get=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const dir="data/crypto/research/";
const irys=get(dir+"irys.json"),zec=get(dir+"zcash.json"),hype=get(dir+"hyperliquid.json"),reg=get(dir+"spot-priority-watch.json");

test("Research records cannot become orders or certified PAPER results",()=>{
 for(const [symbol,d] of [["IRYS",irys],["ZEC",zec],["HYPE",hype]]){
  assert.equal(d.schema,"erith.crypto.asset-research-dossier.v1");
  assert.equal(d.symbol,symbol);
  assert.equal(d.trading_policy.orders_enabled,false);
  assert.equal(d.trading_policy.real_orders,0);
  assert.equal(d.trading_policy.strategy_certified,false);
 }
 assert.equal(reg.policy.orders_enabled,false);
 assert.equal(reg.policy.weekly_volume_global_ranking,false);
 assert.deepEqual(reg.assets.map(a=>a.symbol),["IRYS","ZEC","HYPE"]);
 assert.ok(reg.assets.every(a=>!a.execution_certified&&a.pair.endsWith("-USDC")));
});

test("IRYS seven closed UTC daily OHLCV bars reconcile to the native exchange archive",()=>{
 const native=get("data/crypto/okx-hourly/irys-spot-candles.json");
 assert.equal(native.pair,"IRYS-USDC");
 const x=irys.dated_native_evidence;
 // The live archive may acquire newer candles; audit the frozen observation window.
 const datedDaily=native.candles["1Dutc"].filter(a=>Number(a[0])>=Date.parse(x.daily_first_open_utc)&&Number(a[0])<=Date.parse(x.daily_last_open_utc));
 assert.equal(x.daily_bars_count,datedDaily.length);
 // 1H data are a sliding 299-bar window. A newer archive legitimately
 // replaces older hourly bars; only compare detailed counts on the SAME snapshot.
 if(native.generated_at_utc===x.archive_generated_at_utc){
  assert.equal(x.intraday_archive_counts["1H"],native.candles["1H"].length);
  assert.equal(x.zero_volume_candle_counts["1H"],native.candles["1H"].filter(a=>Number(a[5])===0).length);
 }else{
  assert.ok(Date.parse(native.generated_at_utc)>Date.parse(x.archive_generated_at_utc));
  assert.ok(x.zero_volume_candle_counts["1H"]<=x.intraday_archive_counts["1H"]);
 }
 const week=native.candles["1Dutc"].filter(a=>Number(a[0])>=Date.parse("2026-10-17T00:00:00Z")&&Number(a[0])<Date.parse("2026-10-24T00:00:00Z"));
 assert.equal(week.length,7);
 const sum=week.reduce((s,a)=>s+Number(a[7]),0);
 assert.ok(Math.abs(sum-x.last_7_closed_utc_days.quote_turnover_usdc)<0.001);
 const last=datedDaily.sort((a,b)=>Number(a[0])-Number(b[0])).at(-1);
 assert.equal(x.last_daily_bar_usdc.high,Number(last[2]));
 assert.equal(x.last_daily_bar_usdc.quote_turnover_usdc,Number(last[7]));
 assert.equal(irys.market_identity.orderbook_fill_proven,false);
});

test("ZEC quote and book figures refer to six actual OKX Spot snapshots, not summed rolling volume",()=>{
 const archive=get("data/crypto/case-market-hourly/2026-10-24.json");
 const addon=zec.native_market_addendum;
 // Hourly collector appends observations during the day; match original as-of cutoff.
 const snapshots=archive.hours.flatMap(h=>h.markets.filter(x=>
   x.pair==="ZEC-USDC"&&x.status==="OBSERVED"&&
   x.proof?.book?.source_at_utc>=addon.observed_at_utc_first&&
   x.proof?.book?.source_at_utc<=addon.observed_at_utc_last));
 assert.equal(snapshots.length,6);
 assert.equal(addon.snapshots_count,snapshots.length);
 const last=snapshots.at(-1),saved=addon.last_snapshot;
 assert.equal(saved.best_bid_usdc,Number(last.proof.book.best_bid));
 assert.equal(saved.best_ask_usdc,Number(last.proof.book.best_ask));
 assert.ok(saved.best_bid_usdc<saved.best_ask_usdc);
 assert.equal(saved.source_spread_bps,Number(last.proof.book.spread_bps));
 assert.equal(saved.rolling_24h_quote_turnover_usdc,Number(last.proof.ticker.volume24h_quote));
 assert.match(addon.volume_scope,/DO NOT SUM/);
 assert.equal(saved.fills_proven,false);
});

test("HYPE's missing price history stays explicitly missing and never copies another venue",()=>{
 assert.equal(hype.market_identity.canonical_spot_pair,"HYPE-USDC");
 assert.equal(hype.market_identity.orderbook_verified,false);
 assert.equal(hype.market_identity.spot_history_in_project_qualified,false);
 assert.equal(hype.user_capture_observation.seven_day_turnover_usdc,null);
 assert.equal(hype.user_capture_observation.rolling_turnover_24h_usdc,null);
 assert.equal(reg.assets.find(a=>a.symbol==="HYPE").verified_weekly_quote_turnover_usdc,null);
 assert.ok(hype.evidence_gaps.length>=3);
});

test("Every human case page exposes its source-linked research dossier",()=>{
 const links=[
  ["trader/irys-market-case-study.html","../data/crypto/research/irys.json"],
  ["laboratoire/zcash-case-study.html","../data/crypto/research/zcash.json"],
  ["laboratoire/hype-case-study.html","../data/crypto/research/hyperliquid.json"]
 ];
 for(const [page,link] of links)assert.ok(read(page).includes(link),page+" missing "+link);
 const knowledge=read("laboratoire/crypto-knowledge.html");
 for(const token of ["hype-case-study.html","zcash-case-study.html","irys-market-case-study.html","spot-priority-watch.json"])
  assert.ok(knowledge.includes(token),"Missing navigation "+token);
});
