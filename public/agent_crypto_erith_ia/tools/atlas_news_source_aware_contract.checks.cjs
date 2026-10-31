#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const target=path.join(__dirname,"..","administrator","js","event-intelligence.js");
const source=fs.readFileSync(target,"utf8");
const bloom={
 event_id:"bloom-case",event_time:"2026-10-27T09:07:37Z",
 source_name:"Cointelegraph",
 headline:"Bloom bot hackers loot $953K",
 source_count:1,event_type:"security",
 news_intelligence:{
 schema:"atlas_news_source_aware_article_triage_v1",
 category:"TRADING_BOT_SECURITY_INCIDENT",
 watch:"SECURITY_AND_CUSTODY_REVIEW",
 money_role:"REPORTED_THEFT_NOT_PROFIT",
 reported_usd_loss:953000,
 claim_conflict_requires_review:true,
 source_truth:"RSS_SUMMARY_ONLY_NOT_FULL_ARTICLE_FACT_CHECK"
 }
};
const digest={
 event_id:"eth-glamsterdam",event_time:"2026-10-25T22:48:40Z",
 source_name:"Cointelegraph",
 headline:"AI agents help rescue ETH Glamsterdam fork — Hodler’s Digest",
 news_intelligence:{
 category:"MULTI_STORY_DIGEST",watch:"REVIEW_STORIES_SEPARATELY",
 multi_story_requires_separation:true,
 reported_usd_loss:null
 }
};
const generic={event_id:"other",event_time:"2026-10-27Z",
 source_name:"CoinDesk",headline:"BTC trading volume update"};
const context={
 AgentCryptoNewsEventSource:{
   snapshot:()=>({current:bloom,events:[bloom,digest,generic]})
 }
};
vm.runInNewContext(source,context,{filename:target,timeout:1000});
const api=context.AtlasEventIntelligence;
assert.ok(api&&api.read_only);
assert.equal(api.new_fetch,false);
assert.equal(api.new_storage_owner,false);
assert.equal(api.automatic_order,false);
const records=api.archive();
assert.equal(records.length,3);
assert.equal(records[0].news_intelligence.reported_usd_loss,953000);
assert.equal(records[0].news_intelligence.reported_usd_profit,null);
assert.equal(records[0].news_intelligence.money_role,"REPORTED_THEFT_NOT_PROFIT");
assert.equal(records[0].news_intelligence.direct_market_trade_approved,false);
assert.equal(records[0].financial_signal,false);
assert.equal(records[1].news_intelligence.category,"MULTI_STORY_DIGEST");
assert.equal(records[1].news_intelligence.multi_story_requires_separation,true);
assert.equal(records[1].news_intelligence.reported_usd_loss,null);
assert.equal(records[2].news_intelligence.category,"UNCLASSIFIED");
assert.equal(api.watches().length,2);
assert.equal(api.current().news_intelligence.claim_conflict_requires_review,true);
assert.equal(api.normalize(null),null);
console.log("NEWS SOURCE-AWARE TRIAGE READ-ONLY CONTRACT PASS (3 events, 2 watches, 0 orders)");
