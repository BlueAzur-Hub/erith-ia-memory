"use strict";
// Regression guard for the canonical Administrator readout. Pure, deterministic,
// no browser, exchange account, wallet, network, storage or order execution.
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const source=fs.readFileSync(path.join(__dirname,"../public/agent_crypto_erith_ia/administrator/app.js"),"utf8");

function extract(name){
  const start=source.indexOf("function "+name+"(");
  assert.ok(start>=0,"canonical function must exist: "+name);
  const next=source.indexOf("\nfunction ",start+10);
  assert.ok(next>start,"next function boundary must exist: "+name);
  return source.slice(start,next);
}
class TestDate extends Date {
  static now(){return Date.parse("2026-10-23T23:10:00Z");}
}
const functions=["atlasMarketFlowTruthLabel","atlasMathHorizonCoherence","atlasMathAmplitudeLabel","newsFeedAgeLabel","newsFeedEventAgeLabel"];
const script=functions.map(extract).join("\n")+"\n({"+functions.join(",")+"})";
const api=vm.runInNewContext(script,{Date:TestDate},{timeout:2000});

test("Market Flow public-current must never be labelled an old cache",()=>{
  assert.match(api.atlasMarketFlowTruthLabel("public-current"),/snapshot public récent/);
  assert.doesNotMatch(api.atlasMarketFlowTruthLabel("public-current"),/anciennes/);
  assert.match(api.atlasMarketFlowTruthLabel("public-delayed"),/retardé/);
  assert.match(api.atlasMarketFlowTruthLabel("recent-cache"),/cache récent/);
  assert.match(api.atlasMarketFlowTruthLabel("stale-cache"),/historiques anciennes/);
  assert.match(api.atlasMarketFlowTruthLabel("blocked"),/non confirmée/);
  assert.match(source,/const truthLabel = atlasMarketFlowTruthLabel\(truth.level\)/);
});

test("Math null or missing horizons must never count as measured zero",()=>{
  assert.equal(api.atlasMathHorizonCoherence({change24h:-1,change7d:null,change30d:null}),"Données insuffisantes");
  assert.equal(api.atlasMathHorizonCoherence({change24h:-1,change7d:undefined,change30d:""}),"Données insuffisantes");
  assert.equal(api.atlasMathHorizonCoherence({change24h:-1,change7d:-2,change30d:null}),"Cohérente baissière");
  assert.equal(api.atlasMathHorizonCoherence({change24h:3,change7d:0,change30d:null}),"Mixte");
  assert.equal(api.atlasMathHorizonCoherence({change24h:3,change7d:2,change30d:null}),"Cohérente haussière");
  assert.equal(api.atlasMathAmplitudeLabel(null),"Non mesurée");
  assert.equal(api.atlasMathAmplitudeLabel(undefined),"Non mesurée");
  assert.equal(api.atlasMathAmplitudeLabel(""),"Non mesurée");
  assert.equal(api.atlasMathAmplitudeLabel(0),"Faible");
  assert.equal(api.atlasMathAmplitudeLabel(-6),"Forte");
});

test("News age uses event time, not a collector-stored freshness badge",()=>{
  const event={event_time:"2026-10-23T09:17:57Z",freshness:{label:"Fraîche · moins de 12 h",hours:11.38}};
  assert.equal(api.newsFeedEventAgeLabel(event),"14 h");
  assert.equal(api.newsFeedEventAgeLabel({published_at:event.event_time}),"14 h");
  assert.equal(api.newsFeedEventAgeLabel({}),"Heure inconnue");
  assert.doesNotMatch(api.newsFeedEventAgeLabel(event),/moins de 12 h/);
  assert.doesNotMatch(source,/current\?\.freshness\?\.label \|\| newsFeedAgeLabel\(current\.event_time\)/);
  assert.match(source,/Ancienneté : \$\{newsFeedEventAgeLabel\(event\)\}/);
});


test("Radar research uses native Market and preserves source qualification",()=>{
  const radar=require("../public/agent_crypto_erith_ia/laboratoire/radar.js");
  const native=fs.readFileSync(path.join(__dirname,"../public/agent_crypto_erith_ia/administrator/js/market-radar-native.js"),"utf8");
  const category=fs.readFileSync(path.join(__dirname,"../public/agent_crypto_erith_ia/administrator/js/new-listings-native-category.js"),"utf8");
  assert.doesNotMatch(native,/function printMarket\(root,model\)/);
  assert.doesNotMatch(native,/Classement Radar détaillé/);
  assert.match(source,/state\.assetFilter === "radar"/);
  assert.match(source,/globalThis\.AtlasMarketRadarCategory=Object\.freeze/);
  assert.match(category,/AtlasMarketRadarCategory\?\.set\?\.\(true\)/);
  assert.match(category,/AtlasMarketRadarCategory\?\.set\?\.\(false\)/);
  assert.match(category,/!state\.radarOpen\)\{/);
  const coin={symbol:"SOL",priceUsd:100,marketCapUsd:1000000000,volume24hUsd:50000000,
    change24h:3,change7d:1,change30d:null};
  assert.equal(radar.eligibleResearchCoin(coin),true,"missing 30d must remain allowed");
  assert.equal(radar.eligibleResearchCoin({...coin,symbol:"USDT"}),false,"stablecoins excluded");
  assert.equal(radar.eligibleResearchCoin({...coin,volume24hUsd:1000}),false,"low liquidity excluded");
  assert.equal(radar.eligibleResearchCoin({...coin,change24h:null}),false,"unmeasured day excluded");
});
