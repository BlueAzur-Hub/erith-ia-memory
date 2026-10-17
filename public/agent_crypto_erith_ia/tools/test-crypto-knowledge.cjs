'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const read = name=>fs.readFileSync(path.join(root,name),'utf8');
const data=JSON.parse(read('data/crypto/research/asset-knowledge.json'));
const qualification=JSON.parse(read('data/crypto/radar-opportunities/qualification-latest.json'));
assert.equal(data.schema,'erith.crypto.asset-research-knowledge.v1');
assert.equal(data.candidate_count,20);
assert.equal(data.candidates.length,20);
assert.equal(data.documented_spot_markets,14);
assert.equal(data.qualification_snapshot_at,qualification.qualified_at_utc);
assert.equal(new Set(data.candidates.map(x=>x.coin_id)).size,20);
for(const d of data.candidates){
 const q=qualification.candidates.find(x=>x.id===d.coin_id);
 assert(q,'missing candidate '+d.coin_id);
 assert.equal(d.symbol,q.symbol);
 assert.equal(d.identity_coin_gecko_exchange_token_verified,false);
 assert.equal(d.investment_action,'OBSERVE_ONLY');
 assert.equal(d.independent_usage_metrics,null,'do not invent adoption metrics');
 assert.equal(Boolean(d.research_spot_market),Boolean(q.market));
 if(d.research_spot_market){
  assert.equal(d.research_spot_market.pair,q.market.pair);
  assert.equal(d.research_spot_market.provider,q.market.provider);
  assert.equal(d.research_spot_market.hypothetical_roundtrip_pct_100usdt,q.market.estimated_roundtrip_cost_pct);
 }
}
const html=read('laboratoire/crypto-knowledge.html');
assert.match(html,/https:\/\/raw\.githubusercontent\.com\/BlueAzur-Hub\/erith-ia-memory\/main\/public\/agent_crypto_erith_ia\/data\/crypto\/research\/asset-knowledge\.json/);
assert.match(html,/Aucun ordre réel/);
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
assert.equal(scripts.length,1);
new vm.Script(scripts[0],{filename:'crypto-knowledge-inline.js'});
const radar=read('administrator/js/market-radar-native.js');
new vm.Script(radar,{filename:'market-radar-native.js'});
assert.match(radar,/crypto-knowledge\.html/);
const qpage=read('trader/quack-ai-case-study.html');
assert.match(qpage,/const rawRoot="https:\/\/raw\.githubusercontent\.com\//);
assert.doesNotMatch(qpage,/const rawRoot="\.\.\/data\//);
assert.match(read('laboratoire/CARTOGRAPHIE_CRYPTO_USAGES_ET_CIBLES.md'),/144\/250/);
console.log('Crypto knowledge: 20 candidate identities, 14 Spot evidence, external RAW routing, JS scripts and existing Radar link verified.');
