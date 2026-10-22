"use strict";
const assert=require("node:assert/strict");
const test=require("node:test");
const fs=require("node:fs");
const path=require("node:path");
const file=path.resolve(__dirname,"../public/agent_crypto_erith_ia/administrator/js/okx-microstructure-406499.js");
const source=fs.readFileSync(file,"utf8");
require(file);
const micro=globalThis.AgentCryptoOkxMicrostructure;
const base=Date.parse("2026-10-22T06:40:00Z");
test("an accepted book becomes stale after 15 seconds, without another request",()=>{
 assert.equal(micro.freshness_at(new Date(base).toISOString(),"FRESH",base),"FRESH");
 assert.equal(micro.freshness_at(new Date(base).toISOString(),"FRESH",base+15000),"FRESH");
 assert.equal(micro.freshness_at(new Date(base).toISOString(),"FRESH",base+15001),"STALE");
 assert.equal(micro.freshness_at("2026-10-22T05:43:14Z","FRESH",base),"STALE");
});
test("bad, missing, future or unavailable source never shows FRESH",()=>{
 assert.equal(micro.freshness_at(null,"FRESH",base),"UNKNOWN");
 assert.equal(micro.freshness_at("not-an-iso","FRESH",base),"UNKNOWN");
 assert.equal(micro.freshness_at(new Date(base+5001).toISOString(),"FRESH",base),"UNKNOWN");
 assert.equal(micro.freshness_at(new Date(base-1000).toISOString(),"OFFLINE",base),"OFFLINE");
 assert.equal(micro.freshness_at(new Date(base-1000).toISOString(),"STALE",base),"STALE");
 assert.equal(micro.freshness_at(new Date(base-1000).toISOString(),"UNKNOWN",base),"UNKNOWN");
});
test("view and exported snapshot use current source age, not sticky FRESH",()=>{
 assert.match(source,/const freshness=state\.loading\?"UNKNOWN":bookFreshnessAt\(state\.sourceObservedAt,state\.freshness\)/);
 assert.match(source,/snapshot:\(\)=>Object\.freeze\(\{\.\.\.state,freshness:bookFreshnessAt/);
 assert.match(source,/ancien relevé masqué/);
 assert.match(source,/if\(freshness!=="FRESH"\)\{/);
 assert.match(source,/visibilitychange/);
 assert.match(source,/else if\(state\.open\)\{render\(\);scheduleLive\(\);\}/);
 assert.equal(micro.validation_contract.fresh_max_age_ms,15000);
 assert.equal(micro.read_only,true);
 assert.equal(micro.real_order,false);
});
