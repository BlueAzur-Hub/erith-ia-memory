#!/usr/bin/env node
"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {trackPreviousCandidates,buildDynamicFollowups,selectedCandidates}=require("./radar_opportunity_history.cjs");
const ts=d=>d+"T10:00:00Z";
const candidate=(id,p,date)=>({id,symbol:id.toUpperCase(),priceUsd:p,sourceSnapshot:ts(date)});
const snap=(date,coins)=>({schema:"erith.radar.opportunity-observation.v1",observed_date_utc:date,
 groups:{momentum_24h_7d:coins,rebound_24h_only:[]}});
test("a previously selected coin is tracked even after exiting today's Momentum list",()=>{
 const prior=snap("2026-10-17",[candidate("quack-ai",.1,"2026-10-17")]);
 const current={coins:[{id:"quack-ai",symbol:"Q",rank:202,priceUsd:.08}]};
 const tracked=trackPreviousCandidates(current,{coins:[]},{trend:[],rebound:[],sourceTimes:{core:ts("2026-10-18"),extended:ts("2026-10-18")}},[prior],"2026-10-18");
 assert.equal(tracked.length,1);assert.equal(tracked[0].id,"quack-ai");
 assert.equal(tracked[0].price_usd,.08);assert.equal(tracked[0].status,"OBSERVED_TOP1000");
});
test("future daily price is compared only by exact asset id and calendar day",()=>{
 const d1=snap("2026-10-17",[candidate("quack-ai",.1,"2026-10-17")]);
 const d2=snap("2026-10-18",[]);d2.tracked_candidates=[{id:"quack-ai",price_usd:.08,observed_at_utc:ts("2026-10-18")}];
 const result=buildDynamicFollowups([d2,d1]),first=result.observations[0];
 assert.equal(first.followup_1d.change_pct,-20);assert.equal(first.followup_1d.elapsed_hours,24);
 assert.equal(first.followup_7d.change_pct,null);
 assert.equal(first.followup_7d.status,"AWAITING_FUTURE_DAY");
});
test("symbol collision, absent matching asset or missing day never fabricate performance",()=>{
 const d1=snap("2026-10-17",[candidate("quack-ai",.1,"2026-10-17")]);
 const d2=snap("2026-10-18",[candidate("another-id",.2,"2026-10-18")]);
 const d3=snap("2026-10-24",[candidate("another-id",.5,"2026-10-24")]);
 const result=buildDynamicFollowups([d1,d2,d3]).observations.find(x=>x.id==="quack-ai");
 assert.equal(result.followup_1d.change_pct,null);
 assert.equal(result.followup_7d.change_pct,null);
 assert.equal(result.followup_1d.status,"NO_MATCHING_VERIFIED_PRICE");
});
test("one-day gap after latest archive is marked pending or missing, never zero",()=>{
 const a=snap("2026-10-17",[candidate("icnt",.1,"2026-10-17")]);
 const b=snap("2026-10-20",[candidate("other",.2,"2026-10-20")]);
 const result=buildDynamicFollowups([a,b]).observations.find(x=>x.id==="icnt");
 assert.equal(result.followup_1d.status,"MISSING_DATED_SNAPSHOT");assert.equal(result.followup_1d.change_pct,null);
});
test("daily tracked metrics include measured 24h volume and market capitalization",()=>{
 const prior=snap("2026-10-17",[candidate("icnt",.10,"2026-10-17")]);
 const core={coins:[{id:"icnt",symbol:"ICNT",rank:470,priceUsd:.125,volume24hUsd:1700000,marketCapUsd:25000000}]};
 const r=trackPreviousCandidates(core,{coins:[]},{trend:[],rebound:[],sourceTimes:{core:ts("2026-10-18"),extended:ts("2026-10-18")}},[prior],"2026-10-18");
 assert.equal(r[0].volume_24h_usd,1700000);
 assert.equal(r[0].market_cap_usd,25000000);
});
test("market-volume comparison reports observations, not extrapolated trading volume",()=>{
 const base=snap("2026-10-17",[{...candidate("icnt",.10,"2026-10-17"),volume24hUsd:1000000,marketCapUsd:12000000,rank:450}]);
 const next=snap("2026-10-18",[]);
 next.tracked_candidates=[{id:"icnt",price_usd:.11,volume_24h_usd:1500000,market_cap_usd:12500000,rank:440,observed_at_utc:ts("2026-10-18")}];
 const f=buildDynamicFollowups([base,next]).observations[0];
 assert.equal(f.initial_volume_24h_usd,1000000);
 assert.equal(f.followup_1d.volume_24h_usd,1500000);
 assert.equal(f.followup_1d.change_pct,10);
 assert.equal(f.followup_7d.change_pct,null);
});

test("Capital scout beyond the top-12 gets future dated tracking",()=>{
 const previous=snap("2026-10-22",Array.from({length:12},(_,i)=>candidate("hot"+i,1,"2026-10-22")));
 previous.scout_candidates=[candidate("moderate",2,"2026-10-22")];
 assert.equal(selectedCandidates(previous).length,13);
 const current={coins:[{id:"moderate",symbol:"MOD",rank:190,priceUsd:2.1,
   marketCapUsd:80000000,volume24hUsd:8000000}]};
 const tracked=trackPreviousCandidates(current,{coins:[]},
  {trend:[],rebound:[],sourceTimes:{core:ts("2026-10-23"),extended:ts("2026-10-23")}},
  [previous],"2026-10-23");
 assert.equal(tracked.find(x=>x.id==="moderate").price_usd,2.1);
 const r=buildDynamicFollowups([previous,{...snap("2026-10-23",[]),tracked_candidates:tracked}]);
 const observed=r.observations.find(x=>x.id==="moderate");
 assert.equal(observed.group,"seven_capital_scout");
 assert.equal(observed.followup_1d.change_pct,5);
});
