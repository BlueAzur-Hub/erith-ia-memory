"use strict";
/* Strict documentary reconciliation against real public indexes; no API or trades. */
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const api=require("./coffre-radar-dossiers.js");
const base=path.join(__dirname,"..");
function load(relative){return JSON.parse(fs.readFileSync(path.join(base,relative),"utf8"));}
function fixtures(){return Object.fromEntries(Object.entries(api.SOURCES)
  .map(([key,relative])=>[key,load(relative)]));}
test("current Radar dossier bridge uses exact ids and published sources",()=>{
 const src=fixtures(),out=api.reconcile(src);
 assert.equal(out.counts.total,src.cohort.count);
 assert.equal(out.counts.documented,1);
 assert.equal(out.counts.needsKnowledge,19);
 assert.equal(out.counts.spot,src.cohort.spot_documented);
 assert.equal(out.counts.matched,src.identity.identity_proven_count);
 assert.equal(out.counts.daily,4);
 assert.equal(out.counts.minute,2);
 assert.equal(out.counts.paperReady,0);
 assert.ok(out.dossiers.every(x=>x.paperAllowed===false&&x.blockers.length>0));
 assert.deepEqual(out.dossiers.filter(x=>x.minuteCandles>0).map(x=>x.id).sort(),
  ["spacex-bstocks-tokenized-stock","tezos"]);
});
test("no status is inferred from a ticker collision or untrusted trade permission",()=>{
 const src=fixtures();const id=src.cohort.candidates.find(x=>x.coin_id==="lab");
 const proof=src.identity.candidates.find(x=>x.coin_id==="lab");
 assert.ok(proof.identity_proven);
 id.spot.pair="DIFFERENTUSDT";
 const out=api.reconcile(src);
 assert.equal(out.dossiers.find(x=>x.id==="lab").contractMatched,false);
 assert.equal(out.dossiers.find(x=>x.id==="lab").paperAllowed,false);
 src.cohort.orders_enabled=true;
 assert.throws(()=>api.reconcile(src),/Provenance invalide/);
});
test("duplicate ID, missing documents or synthetic V5 readiness fail closed",()=>{
 const src=fixtures();
 src.cohort.candidates[1].coin_id=src.cohort.candidates[0].coin_id;
 assert.throws(()=>api.reconcile(src),/dupliqué|droits/);
 const s2=fixtures();s2.daily.assets[1].id=s2.daily.assets[0].id;
 assert.throws(()=>api.reconcile(s2),/dupliqué/);
 const s3=fixtures();s3.knowledge.schema="unknown";
 assert.throws(()=>api.reconcile(s3),/Provenance invalide/);
});