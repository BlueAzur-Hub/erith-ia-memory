"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {verifyRegistry}=require("./radar.js");
const root=path.resolve(__dirname,"../administrator");
const reader=fs.readFileSync(path.join(root,"js/market-radar-native.js"),"utf8");
const radar=fs.readFileSync(path.join(__dirname,"radar.js"),"utf8");
const right=JSON.parse(fs.readFileSync(path.join(root,"data/new-listings-public-feed.json"),"utf8"));
const old=JSON.parse(fs.readFileSync(path.join(root,"data/new-listings-identities.json"),"utf8"));
test("reproduces the wrong registry schema and confirms the correct canonical feed",()=>{
 assert.notEqual(old.schema,right.schema);
 assert.equal(right.schema,"erith.seven.public-spot-listings-feed.v1");
 assert.throws(()=>verifyRegistry(old),/Catalogue d'identités Spot public invalide/);
 const verified=verifyRegistry(right);
 assert.ok(verified instanceof Map);
 assert.ok(verified.size>=1);
 assert.ok([...verified.values()].every(x=>x.coingeckoId&&x.pair&&x.symbol));
});
test("native Trader and standalone Radar prefer same canonical feed with RAW fallback",()=>{
 for(const text of [reader,radar]){
  assert.match(text,/administrator\/data\/new-listings-public-feed\.json/);
  assert.match(text,/raw\.githubusercontent\.com\/BlueAzur-Hub\/erith-ia-memory\/main/);
  assert.doesNotMatch(text,/new-listings-identities\.json/);
 }
 assert.match(reader,/const local="\.\/data\/new-listings-public-feed\.json"/);
 assert.match(radar,/async function readPublicIdentityRegistry/);
});
test("rejects ticker-only as exact token identity",()=>{
 const entries=structuredClone(right);
 for(const row of entries.entries)row.identity_status="VENUE_SYMBOL_ONLY";
 assert.equal(verifyRegistry(entries).size,0);
 assert.throws(()=>verifyRegistry({...right,trade_permission:true}),/Catalogue d'identités Spot public invalide/);
});
