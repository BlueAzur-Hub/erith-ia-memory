'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {run,parseArgs,readJson,mergeManifestEntries}=require('./run_scanner_market_eur_archive.cjs');
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

test('new Market basket retains verified older native EUR evidence by identity',()=>{
 const hash='sha256:'+'a'.repeat(64);
 const previous={schema:'agent_crypto_scanner_native_eur_archive_manifest_v1',
   quote:'EUR',rankingQuote:'USD',source:'CoinGecko',sourceSnapshot:'prior-frame',
   entries:{oldcoin:{sha256:hash,status:'ready',pointCount:289}}};
 const current={newcoin:{sha256:'sha256:'+'b'.repeat(64),status:'ready'}};
 const seen=[];
 const result=mergeManifestEntries(current,previous,(id,e)=>{
   seen.push(id);return id==='oldcoin'&&e.sha256===hash;
 });
 assert.deepEqual(seen,['oldcoin']);
 assert.equal(Object.keys(result).length,2);
 assert.equal(result.oldcoin.sourceSnapshot,'prior-frame');
 assert.equal(result.newcoin.status,'ready');
});
test('rotating archive refuses unverified old assets or incompatible manifest',()=>{
 const previous={schema:'agent_crypto_scanner_native_eur_archive_manifest_v1',
   quote:'EUR',rankingQuote:'USD',source:'CoinGecko',sourceSnapshot:'old',
   entries:{untrusted:{sha256:'sha256:'+'1'.repeat(64)}}};
 assert.throws(()=>mergeManifestEntries({},previous,()=>false),/Unverified/);
 assert.throws(()=>mergeManifestEntries({}, {...previous,quote:'USD'},()=>true),/Incompatible/);
 assert.throws(()=>mergeManifestEntries({}, {...previous,entries:{'../escape':{sha256:'sha256:'+'1'.repeat(64)}}},()=>true),/Unverified/);
});
