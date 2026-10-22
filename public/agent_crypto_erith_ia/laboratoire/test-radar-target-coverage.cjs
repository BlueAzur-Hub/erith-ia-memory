"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {verify}=require("./radar-target-coverage.js");
const HOUR="2026-10-22T06Z",AT="2026-10-22T06:16:41Z";
const head={schema:"erith.radar.verified-target-hourly.latest.v1",
 hour_utc:HOUR,observed_at_utc:AT,markets_observed:3,
 orders_enabled:false,real_orders:0};
const report={schema:"erith.radar.target-coverage-and-queue.v1",
 latest_hour_utc:HOUR,as_of_observed_at_utc:AT,
 no_inferred_prices:true,observation_only:true,no_backfill:true,
 candidate_count:20,priority_count:10,orders_enabled:false,real_orders:0,
 queue_source_qualified_at_utc:"2026-10-20T18:37:23Z",
 identity_catalogue_collected_at_utc:"2026-10-20T18:37:46Z",
 coverage:{target_count:3,markets_observed_latest:3,
  hours_archived:1,expected_hours_since_first:1,hours_without_archive:0},
 assets:["BR","JCT","BEAM"].map(s=>({symbol:s,pair:s+"USDT",
  venue:"Bitget",quote:"USDT",hours_observed:1,hours_unavailable:0,
  hours_unarchived:0,latest_hour_observed:true,
  latest_real_price_usdt:"0.3",latest_spread_bps:"9.65",
  change_last_consecutive_hour_pct:null,reversal_certified:false,
  fill_certified:false})),
 priority_queue:["AUCTION","REZ","BAT","THETA","ALT","DOS","A","IOST","BR","COMP"]
  .map((symbol,i)=>({priority_rank:i+1,coin_id:"coin-"+symbol,
   symbol,venue_from_qualification:"Binance",
   identity_verified_at_catalogue:symbol==="BR",
   hourly_target_enabled:symbol==="BR",
   next_action:symbol==="BR"?"CONTINUE_VERIFIED_SPOT_OBSERVATION":
    "VERIFY_IDENTITY_BEFORE_ANY_HOURLY_PROMOTION",real_orders:0}))};
const clone=x=>structuredClone(x);
test("one archived hour means no hourly performance or reversal",()=>{
 const result=verify(report,head);
 assert.equal(result.coverage.hours_archived,1);
 assert.equal(result.assets[0].change_last_consecutive_hour_pct,null);
 assert.equal(result.queue.filter(q=>q.hourly_target_enabled).length,1);
 assert.equal(result.queue.length,10);
});

test("stale coverage is not masqueraded as current",()=>{
 const h=clone(head);h.hour_utc="2026-10-22T07Z";
 assert.throws(()=>verify(report,h),/périmé/);
 const r=clone(report);r.as_of_observed_at_utc="2026-10-22T07:16:41Z";
 assert.throws(()=>verify(r,head),/périmé/);
});
test("cannot promote nine symbol-only candidates",()=>{
 const r=clone(report);r.priority_queue[0].hourly_target_enabled=true;
 assert.throws(()=>verify(r,head),/Promotion/);
 r.priority_queue[0].identity_verified_at_catalogue=true;
 assert.throws(()=>verify(r,head),/Promotion/);
});
test("unavailable market must erase its price and hourly delta",()=>{
 const r=clone(report);
 r.assets[1].latest_hour_observed=false;
 r.assets[1].latest_real_price_usdt=null;
 r.assets[1].latest_spread_bps=null;
 r.assets[1].change_last_consecutive_hour_pct=null;
 r.assets[1].hours_observed=0;
 r.assets[1].hours_unavailable=1;
 r.coverage.markets_observed_latest=2;
 const h=clone(head);h.markets_observed=2;
 assert.equal(verify(r,h).assets[1].latest_real_price_usdt,null);
 r.assets[1].latest_real_price_usdt="0.2";
 assert.throws(()=>verify(r,h),/Prix recyclé/);
});
test("no candidate catalogue, exchange API or trading flow from browser",()=>{
 const page=fs.readFileSync(path.join(__dirname,"radar-historique.html"),"utf8");
 const source=fs.readFileSync(path.join(__dirname,"radar-target-coverage.js"),"utf8");
 assert.match(page,/data-target-priority-rows/);
 assert.match(page,/data-target-coverage-rows/);
 assert.match(page,/src="radar-target-coverage\.js"/);
 assert.match(source,/coverage-latest\.json/);
 assert.doesNotMatch(source,/\/api\/v3\/market|\/api\/v5\/trade|placeOrder|Authorization|Bearer |localStorage|indexedDB|setInterval\(/);
});
