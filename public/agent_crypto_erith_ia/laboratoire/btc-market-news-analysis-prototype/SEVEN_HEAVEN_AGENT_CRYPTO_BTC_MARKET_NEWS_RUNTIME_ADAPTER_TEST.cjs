'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const adapter=require('./SEVEN_HEAVEN_AGENT_CRYPTO_BTC_MARKET_NEWS_READ_ONLY_RUNTIME_ADAPTER.js');
const fs=require('node:fs'),path=require('node:path');
const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,'SEVEN_HEAVEN_AGENT_CRYPTO_BTC_MARKET_NEWS_SYNTHETIC_EXAMPLE_INPUT.json'),'utf8'));
const AS_OF=fixture.asOfUtc;
const market=()=>structuredClone(fixture.market);
const news=()=>structuredClone(fixture.news);
test('runtime adapter exposes existing public API without changing app state',()=>{
 assert.equal(adapter.orders_enabled,false);assert.equal(adapter.no_auto_fetch,true);
 assert.equal(adapter.no_ui_changes,true);
});
test('reads only safe chart fields and never transmits private account data',()=>{
 const source=market();source.okxCredentials={secret:'NEVER_COPY'};
 let called=0;const runtime={AgentCryptoMarketMicroscope:{snapshot(){called++;return source;}}};
 const s=adapter.extractPublicMarket(runtime);
 assert.equal(called,1);assert.equal(s.rows.length,48);
 assert.ok(!JSON.stringify(s).includes('NEVER_COPY'));
 s.rows[0].v=0;assert.equal(source.rows[0].v,10);
});
test('fails closed if runtime owner does not exist',async()=>{
 let called=0;
 const r=await adapter.analyzeFromRuntime({runtime:{},fetchPublicNews:async()=>{called++;}});
 assert.equal(r.reason_code,'RUNTIME_SNAPSHOT_UNAVAILABLE');assert.equal(called,0);
});
test('fetch is explicit and anonymous and uses canonical public source',async()=>{
 const requests=[];
 const r=await adapter.analyzeFromRuntime({
   runtime:{AgentCryptoMarketMicroscope:{snapshot:()=>market()}},asOfUtc:AS_OF,
   fetchPublicNews:async(url,options)=>{
     requests.push({url,options});return {ok:true,json:async()=>news()};
   }});
 assert.equal(requests.length,1);assert.equal(requests[0].url,adapter.public_news_url);
 assert.deepEqual(requests[0].options,{credentials:'omit',cache:'no-store'});
 assert.equal(r.status,'MATCHED');
});
test('network and invalid JSON failures do not trigger alternative sources',async()=>{
 const runtime={AgentCryptoMarketMicroscope:{snapshot:market}};
 const network=await adapter.analyzeFromRuntime({runtime,asOfUtc:AS_OF,
   fetchPublicNews:async()=>{throw Error('network');}});
 assert.equal(network.reason_code,'PUBLIC_NEWS_NETWORK_ERROR');
 const json=await adapter.analyzeFromRuntime({runtime,asOfUtc:AS_OF,
   fetchPublicNews:async()=>({ok:true,json:async()=>{throw Error('bad json');}})});
 assert.equal(json.reason_code,'PUBLIC_NEWS_JSON_ERROR');
});