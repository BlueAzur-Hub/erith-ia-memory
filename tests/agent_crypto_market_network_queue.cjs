'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const script=fs.readFileSync(path.join(__dirname,'../public/agent_crypto_erith_ia/administrator/app.js'),'utf8');
const start=script.indexOf('async function fetchWithTimeout(url, options = {}, timeout = 12000) {');
const end=script.indexOf('\nasync function fetchJsonWithRetry(',start);
assert.ok(start>=0&&end>start,'canonical fetchWithTimeout must remain present');
const source=script.slice(start,end);
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function abortError(){const e=new Error('aborted');e.name='AbortError';return e;}
function makeFetch({acquire,fetcher,release=()=>{}}){
  const sandbox={
    AbortController,setTimeout,clearTimeout,
    ATLAS_NETWORK_WAIT_TIMEOUT_MS:45000,
    atlasAcquireNetwork:acquire,
    atlasReleaseNetwork:release,
    fetch:fetcher
  };
  return vm.runInNewContext(source+'\nfetchWithTimeout',sandbox,{timeout:3000});
}

test('Extended Market request does not consume HTTP timeout while queued internally',async()=>{
  let calls=0,releases=0;
  const fetchWithTimeout=makeFetch({
    acquire:async()=>{await sleep(55);return 'source:1';},
    release:()=>{releases+=1;},
    fetcher:async(_url,options)=>{
      calls+=1;
      if(options.signal.aborted)throw abortError();
      return {ok:true,json:async()=>({source:'extended',count:750})};
    }
  });
  const result=await fetchWithTimeout('/data/crypto/extended.json',{networkKind:'source'},15);
  assert.equal(result.source,'extended');
  assert.equal(result.count,750);
  assert.equal(calls,1);
  assert.equal(releases,1);
});

test('A genuine HTTP stall still times out and releases the network permit',async()=>{
  let releases=0;
  const fetchWithTimeout=makeFetch({
    acquire:async()=> 'source:2',
    release:()=>{releases+=1;},
    fetcher:(_url,options)=>new Promise((_resolve,reject)=>{
      if(options.signal.aborted){reject(abortError());return;}
      options.signal.addEventListener('abort',()=>reject(abortError()),{once:true});
    })
  });
  await assert.rejects(fetchWithTimeout('/data/crypto/extended.json',{networkKind:'source'},20),
    error=>error.message==='Délai réseau dépassé');
  assert.equal(releases,1);
});

test('An operator cancellation during queue wait cancels instead of firing HTTP',async()=>{
  const controller=new AbortController();
  let fetches=0,releases=0;
  const fetchWithTimeout=makeFetch({
    acquire:(_kind,signal)=>new Promise((_resolve,reject)=>{
      if(signal?.aborted){reject(abortError());return;}
      signal?.addEventListener('abort',()=>reject(abortError()),{once:true});
    }),
    release:()=>{releases+=1;},
    fetcher:async()=>{fetches+=1;return{ok:true,json:async()=>({})};}
  });
  const pending=fetchWithTimeout('/data/crypto/extended.json',{networkKind:'source',signal:controller.signal},20);
  setTimeout(()=>controller.abort(),5);
  await assert.rejects(pending,error=>error.name==='AbortError');
  assert.equal(fetches,0);
  assert.equal(releases,0);
});
