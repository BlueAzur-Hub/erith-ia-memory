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
 const known=new Set(src.knowledge.candidates.map(x=>x.coin_id));
 const daily=new Map(src.daily.assets.map(x=>[x.id,x.native_candles||0]));
 const minute=new Map(src.minute.assets.map(x=>[x.id,x.native_1m_count||0]));
 assert.equal(out.counts.documented,src.cohort.candidates.filter(x=>known.has(x.coin_id)).length);
 assert.equal(out.counts.needsKnowledge,out.counts.total-out.counts.documented);
 assert.equal(out.counts.spot,src.cohort.candidates.filter(x=>!!x.spot).length);
 assert.equal(out.counts.matched,out.dossiers.filter(x=>x.contractMatched).length);
 assert.equal(out.counts.daily,src.cohort.candidates.filter(x=>daily.get(x.coin_id)>0).length);
 assert.equal(out.counts.minute,src.cohort.candidates.filter(x=>minute.get(x.coin_id)>0).length);
 assert.equal(out.counts.paperReady,0);
 assert.ok(out.dossiers.every(x=>x.paperAllowed===false&&x.blockers.length>0));
 assert.ok(out.dossiers.every(x=>x.dailyCandles===(daily.get(x.id)||0)));
 assert.ok(out.dossiers.every(x=>x.minuteCandles===(minute.get(x.id)||0)));
});
test("no status is inferred from a ticker collision or untrusted trade permission",()=>{
 const src=fixtures();
 const proven=src.identity.candidates.find(x=>x.identity_proven===true&&
   src.cohort.candidates.some(c=>c.coin_id===x.coin_id&&c.spot));
 assert.ok(proven,"At least one matched contract in current research snapshot");
 const id=src.cohort.candidates.find(x=>x.coin_id===proven.coin_id);
 id.spot.pair="DIFFERENTUSDT";
 const out=api.reconcile(src);
 assert.equal(out.dossiers.find(x=>x.id===proven.coin_id).contractMatched,false);
 assert.equal(out.dossiers.find(x=>x.id===proven.coin_id).paperAllowed,false);
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