"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const path=require("node:path");
const fs=require("node:fs");
const {seriesCurrencyEvidence,inspectHistoricalRecord,comparableSpot,proposedHistoryCacheKey}=require("./historical-quote-contract.cjs");
const fixture=JSON.parse(fs.readFileSync(path.resolve(__dirname,"../../../coordination/inter_ai_dialogues/agent_crypto/PREUVE_FIREFOX_PRIX_HISTORIQUES_5_ACTIFS_20261026.json"),"utf8"));
function sample(id,currency,days){return fixture.entries.map(inspectHistoricalRecord).find(x=>x.coinId===id&&x.currency===currency&&x.periodDays===days);}
test("relevé Firefox: 23 séries classées sans interpréter toutes les anciennes clés comme EUR",()=>{
 const inspected=fixture.entries.map(inspectHistoricalRecord);
 assert.equal(inspected.length,23);
 assert.equal(inspected.filter(x=>x.currency==="USD").length,15);
 assert.equal(inspected.filter(x=>x.currency==="EUR").length,8);
 assert.equal(inspected.filter(x=>x.conflict).length,0);
 assert.ok(inspected.every(x=>x.usable&&x.independentlyVerified===false));
});
test("clé ancienne bitcoin:1:coingecko revendique USD; aucune valeur transformée",()=>{
 const original=fixture.entries.find(e=>e.key==="bitcoin:1:coingecko");
 const inspected=inspectHistoricalRecord(original);
 assert.equal(inspected.currency,"USD");
 assert.equal(inspected.currencyEvidence,"metadata-or-key-declared");
 assert.deepEqual(inspected.rawPrices,original.samples.map(x=>x.priceRaw));
});
test("BTC spot USD regarde priceUsd, EUR regarde priceEur ; c.price ignoré",()=>{
 const usd=sample("bitcoin","USD",1);
 const eur=sample("bitcoin","EUR",1);
 assert.equal(comparableSpot({price:71366.61,priceEur:71366.61,priceUsd:80159.31},usd).price,80159.31);
 assert.equal(comparableSpot({price:71366.61,priceEur:71366.61,priceUsd:80159.31},eur).price,71366.61);
 assert.equal(comparableSpot({price:71366.61,priceEur:71366.61},usd),null);
});
test("contradictions et devises inconnues sont refusées",()=>{
 const samplePoint=[{timeMs:1792993810000,priceRaw:80000}];
 const conflict=inspectHistoricalRecord({coinId:"bitcoin",periodDays:1,currencyInKey:"USD",source:"CoinGecko market_chart EUR",samples:samplePoint});
 assert.equal(conflict.usable,false);assert.equal(conflict.conflict,true);
 const unknown=inspectHistoricalRecord({coinId:"bitcoin",periodDays:1,source:"cache",samples:samplePoint});
 assert.equal(unknown.currency,null);assert.throws(()=>proposedHistoryCacheKey(unknown));
});
test("USDC/USDT sont des devises distinctes d'USD",()=>{
 const series=[{timeMs:1792993810000,priceRaw:1}];
 for(const quote of ["USDC","USDT"]){
  const record=inspectHistoricalRecord({coinId:"bitcoin",periodDays:1,source:"Binance Spot BTC/"+quote,sourceFamily:"binance",samples:series});
  assert.equal(record.currency,quote);
  assert.equal(comparableSpot({priceUsd:80000},record),null);
 }
});
test("identité de cache canonique distingue la devise",()=>{
 assert.equal(proposedHistoryCacheKey(sample("bitcoin","USD",1)),"bitcoin:USD:coingecko:1");
 assert.equal(proposedHistoryCacheKey(sample("bitcoin","EUR",1)),"bitcoin:EUR:binance:1");
});
test("prix nuls, non chronologiques ou manquants rejetés",()=>{
 for(const samples of [[],[{timeMs:2,priceRaw:0}],[{timeMs:2,priceRaw:42},{timeMs:1,priceRaw:43}]]){
  const record=inspectHistoricalRecord({coinId:"bitcoin",currencyInKey:"USD",periodDays:1,source:"CoinGecko market_chart USD",samples});
  assert.equal(record.usable,false);
 }
});
