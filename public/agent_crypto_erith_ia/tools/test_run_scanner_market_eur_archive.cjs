'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {run,parseArgs,readJson}=require('./run_scanner_market_eur_archive.cjs');
test('default producer is offline and cannot make network requests',async()=>{
 const a=parseArgs([]);
 assert.equal(a.mode,'plan');assert.equal(a.network,'off');
 const s=await run(a);
 assert.equal(s.network,false);
 assert.equal(s.historyQuote,'EUR');
 assert.equal(s.rankingQuote,'USD');
 assert.equal(s.selected.length,20);
 assert.equal(s.groups.length,4);
 assert.equal(s.claim.includes('not the live browser'),true);
});
test('explicit network option alone is not sufficient',async()=>{
 const a=parseArgs(['--mode=collect','--network=yes']);
 const old=process.env.ERITH_EUR_ARCHIVE_NETWORK;
 try{
   delete process.env.ERITH_EUR_ARCHIVE_NETWORK;
   await assert.rejects(()=>run(a),/explicit/);
 }finally{if(old===undefined)delete process.env.ERITH_EUR_ARCHIVE_NETWORK;
 else process.env.ERITH_EUR_ARCHIVE_NETWORK=old}
});
test('unknown controls and bad numeric quotas fail',()=>{
 assert.throws(()=>parseArgs(['--mode=trade']),/plan\/collect/);
 assert.throws(()=>parseArgs(['--budget=18.5']),/Nonintegral/);
 assert.throws(()=>parseArgs(['--hidden-action=yes']),/Unknown/);
});
test('oversized/corrupted local evidence is not silently accepted',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'seven-eur-'));
 try{
   const f=path.join(root,'bad.json');
   fs.writeFileSync(f,'{invalid}');
   assert.throws(()=>readJson(f),SyntaxError);
   assert.throws(()=>readJson(path.join(root,'no.json')), /ENOENT/);
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
