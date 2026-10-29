'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createHash,webcrypto}=require('node:crypto');
const {loadFive,verifyRolling,idsFive}=require('../administrator/js/scanner-eur-archive-reader.js');
const NOW=Date.parse('2026-10-28T09:10:00Z');
const IDS=['bitway','pepe','memecore','layerzero','near'];
const FRAME='coingecko-top250-usd-ecb-eur-github_2026-10-28T09:02:58.438Z';
const prefix='https://example.org/repository/data/crypto/scanner_eur_archives/';
function sha(item){return 'sha256:'+createHash('sha256').update(JSON.stringify(item)).digest('hex')}
function fixture(){
 const entries={},files={};
 for(let i=0;i<IDS.length;i++){
   const id=IDS[i],start=NOW-86400000;
   const series=Array.from({length:289},(_,n)=>[start+n*300000,1+i+n/1000]);
   const rolling={schema:'agent_crypto_scanner_rolling_eur_history_v1',id,
     quoteCurrency:'EUR',periodDays:1,windowStart:new Date(start).toISOString(),
     windowEnd:new Date(NOW).toISOString(),status:'ready',pointCount:289,
     coverage:{conflicts:0,largestGapMs:300000},series};
   rolling.sha256=sha(rolling);
   const record={schema:'agent_crypto_scanner_native_eur_archive_v1',id,
     quoteCurrency:'EUR',periodDays:1,entries:[{frameId:FRAME}],rolling};
   record.sha256=sha(record);
   entries[id]={sha256:record.sha256};
   files['assets/'+id+'.json']=record;
 }
 files['last-run.json']={schema:'agent_crypto_scanner_native_eur_archive_manifest_v1',
   generatedAt:new Date(NOW).toISOString(),sourceSnapshot:FRAME,
   quote:'EUR',source:'CoinGecko',rankingQuote:'USD',entries};
 return files;
}
function requestFor(files,visited=[]){
 return async (url)=>{
   visited.push(url);
   const name=url.slice(prefix.length),record=files[name];
   return record?{ok:true,status:200,text:async()=>JSON.stringify(record)}
     :{ok:false,status:404,text:async()=>''};
 };
}
const run=(files,options={})=>loadFive({ids:IDS,marketFrameId:FRAME,
  archiveBaseUrl:prefix,now:NOW,cryptoAPI:webcrypto,
  fetchFn:requestFor(files),...options});
test('load exactly five real EUR archive identities, with exact frame and signed content',async()=>{
 const z=await run(fixture());
 assert.equal(z.status,'ready');assert.equal(z.readyCount,5);
 assert.deepEqual(z.requestedIds,IDS);
 for(const id of IDS){
   assert.equal(z.records[id].series.length,289);
   assert.equal(z.records[id].quoteCurrency,'EUR');
 }
});
test('stale archive is not promoted to live Firefox chart',async()=>{
 await assert.rejects(()=>run(fixture(),{now:NOW+30*60000}),/stale/);
});
test('Market Frame mismatch blocks all series before individual HTTP requests',async()=>{
 const visited=[];
 await assert.rejects(()=>run(fixture(),{marketFrameId:'other-market-frame',
   fetchFn:requestFor(fixture(),visited)}),/Market Frame/);
 assert.equal(visited.length,1);
});
test('wrong native quote, inconsistent manifest and tampering fail closed',async()=>{
 const files=fixture();files['assets/pepe.json'].quoteCurrency='USD';
 const r=await run(files);
 assert.equal(r.status,'partial');assert.equal(r.readyCount,4);
 assert.deepEqual(r.missing.map(x=>x.id),['pepe']);
 assert.equal(r.records.pepe,undefined);
});
test('single historical price changed after SHA commit is rejected',async()=>{
 const files=fixture();files['assets/bitway.json'].rolling.series[42][1]+=1;
 const r=await run(files);
 assert.equal(r.readyCount,4);assert.equal(r.missing[0].id,'bitway');
 assert.match(r.missing[0].reason,/SHA-256/);
});
test('missing member never triggers a sixth or lower-ranked asset fetch',async()=>{
 const files=fixture();delete files['assets/near.json'];
 const visited=[];const r=await run(files,{fetchFn:requestFor(files,visited)});
 assert.equal(r.readyCount,4);assert.equal(r.status,'partial');
 assert.equal(visited.length,6);
 assert.equal(visited.some(x=>x.includes('/other-token.json')),false);
});
test('mixed USD and EUR manifest is rejected',async()=>{
 const files=fixture();files['last-run.json'].quote='USD';
 await assert.rejects(()=>run(files),/source\/quotes/);
});
test('partial, gapped and incomplete windows can never claim ready',()=>{
 const f=fixture(),r=f['assets/pepe.json'].rolling;
 r.series.splice(80,13);
 assert.throws(()=>verifyRolling(r,'pepe',NOW),/Incomplete EUR 24h/);
 r.series=[];
 assert.throws(()=>verifyRolling(r,'pepe',NOW),/No certified/);
});
test('duplicate/foreign asset IDs are forbidden at boundary',()=>{
 assert.throws(()=>idsFive(['a','a','b','c','d']),/duplicate/);
 assert.throws(()=>idsFive(['a','b','c','d','INVALID SPACE']),/Invalid/);
});
test('path cannot escape its HTTPS archive prefix',async()=>{
 const files=fixture();const r=await run(files);
 assert.equal(Object.keys(r.records).length,5);
 await assert.rejects(()=>run(files,{archiveBaseUrl:'http://example.org/data/'}),/HTTPS/);
});
