'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {createHash}=require('node:crypto');
const bridge=require('./SEVEN_HEAVEN_BTC_OKX_NEWS_VERIFIED_HOURLY_BRIDGE.js');
const DATES=['2026-11-05','2026-11-08'];
const sha=text=>createHash('sha256').update(text).digest('hex');
function makeFixture(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'seven-hourly-'));
 const evidence=path.join(root,'evidence');fs.mkdirSync(evidence);
 const files=[];
 for(const [k,date] of DATES.entries()){
  const start=Date.parse(date+'T00:00:00Z');
  const rows=Array.from({length:24},(_,i)=>{
   const o=80000-k*3000-i*100,c=o-(i===15?1300:35),h=o+10,l=c-15,v=i===15?250:10;
   return {t:start+i*3600000,utc:new Date(start+i*3600000).toISOString(),o:String(o),h:String(h),l:String(l),c:String(c),v_btc:String(v),v_usdc_quote:String(v*o),confirm:'1'};
  });
  const volumes=rows.reduce((s,x)=>s+Number(x.v_btc),0);
  const doc={schema:'seven.crypto.okx-btc-hourly-event-study.v1',date_utc:date,venue:'OKX',instrument:'BTC-USDC',base:'BTC',quote:'USDC',bar:'1H',interval_minutes:60,market_type:'SPOT',
   collected_at_utc:'2026-11-10T14:32:21+00:00',hour_count:24,rows,all_candles_closed:true,timestamps_utc_contiguous:true,
   no_orders:true,private_account_access:false,causal_claim:false,status:'CAPTURED_FROM_PUBLIC_OKX_API_NOT_EXCHANGE_SIGNED',
   source:{host:'https://eea.okx.com',request_url:'https://eea.okx.com/api/v5/market/history-candles?instId=BTC-USDC&bar=1H',response_sha256:'a'.repeat(64)},
   summary:{total_volume_btc:String(volumes),peak_base_volume_hour_utc:rows[15].utc,peak_base_volume_btc:rows[15].v_btc,open_usdc_per_btc:rows[0].o,close_usdc_per_btc:rows[23].c}};
  const name=`btc-usdc-okx-1h-${date}.json`,text=JSON.stringify(doc,null,2)+'\n';
  fs.writeFileSync(path.join(evidence,name),text);files.push({date_utc:date,file:name,hour_count:24,sha256:sha(text)});
 }
 const manifest={schema:'seven.crypto.okx-btc-hourly-manifest.v1',instrument:'BTC-USDC',bar:'1H',orders_enabled:false,total_candles:48,complete_days:2,dates_utc:DATES,files};
 fs.writeFileSync(path.join(evidence,'index.json'),JSON.stringify(manifest,null,2)+'\n');
 const news={schema:'atlas_news_sentinel_world_to_market_v1',generated_at:'2026-11-10T08:52:17Z',status:'ok',causal_claim:false,
  freeze:{source_blob_sha:'b'.repeat(40),target_dates:DATES},summary:{sources_ok:14,sources_total:15,driver_coverage:{leverage:{events_72h:0,distinct_sources:0}}},
  events:DATES.map((day,k)=>({event_id:'event'+k,headline:'Bitcoin spot market headline test',source_name:'Test source',
   source_url:'https://example.org/public/market-event',event_time:day+(k?'T11:14:31Z':'T16:29:11Z'),assets:['BTC'],
   driver_domains:[k?'institutional_flows':'leverage'],source_count:1,causal_claim:false}))};
 const newsFile=path.join(root,'frozen.json');fs.writeFileSync(newsFile,JSON.stringify(news,null,2)+'\n');
 return {root,evidence,manifest,news,newsFile,cleanup:()=>fs.rmSync(root,{recursive:true,force:true})};
}
function mutateEvidence(f,date,update){
 const name=`btc-usdc-okx-1h-${date}.json`,file=path.join(f.evidence,name);
 const obj=JSON.parse(fs.readFileSync(file,'utf8'));update(obj);
 const data=JSON.stringify(obj,null,2)+'\n';fs.writeFileSync(file,data);
 const i=f.manifest.files.findIndex(x=>x.date_utc===date);f.manifest.files[i].sha256=sha(data);
 fs.writeFileSync(path.join(f.evidence,'index.json'),JSON.stringify(f.manifest,null,2)+'\n');
}
test('manifest + two canonical days: 48 candles, no calls to exchange',()=>{const f=makeFixture();try{const x=bridge.readEvidence(f.evidence);assert.equal(x.days.length,2);assert.equal(x.days.reduce((s,d)=>s+d.rows.length,0),48);assert.equal(x.days[0].summary.peak_volume_btc,250);}finally{f.cleanup();}});
test('core analyzes verified hourly facts with archived public news',()=>{const f=makeFixture();try{const x=bridge.analyzeVerified({base:f.evidence,newsFile:f.newsFile});assert.equal(x.candles,48);assert.equal(x.days,2);assert.equal(x.causal_claim,false);assert.equal(x.orders_enabled,false);assert.equal(x.findings[0].temporal_core.status,'MATCHED');assert.equal(x.findings[1].temporal_core.status,'MATCHED');assert.equal(x.findings[0].temporal_core.technical.ema_latest[2],null);assert.match(bridge.asMarkdown(x),/n’est publié|raccordement/i);}finally{f.cleanup();}});
test('source file hash mismatch must fail closed',()=>{const f=makeFixture();try{fs.appendFileSync(path.join(f.evidence,f.manifest.files[0].file),'\n');assert.throws(()=>bridge.readEvidence(f.evidence),/EVIDENCE_SHA_MISMATCH/);}finally{f.cleanup();}});
test('fake integrity after editing a missing hour still fails',()=>{const f=makeFixture();try{mutateEvidence(f,'2026-11-05',d=>{d.rows[11].t+=3600000;d.rows[11].utc=new Date(d.rows[11].t).toISOString();});assert.throws(()=>bridge.readEvidence(f.evidence),/CANDLE_TIME_GAP/);}finally{f.cleanup();}});
test('unclosed candle rejected even with recomputed SHA',()=>{const f=makeFixture();try{mutateEvidence(f,'2026-11-08',d=>{d.rows[19].confirm='0';});assert.throws(()=>bridge.readEvidence(f.evidence),/CANDLE_INVALID/);}finally{f.cleanup();}});
test('cross-venue instrument change rejected',()=>{const f=makeFixture();try{mutateEvidence(f,'2026-11-08',d=>{d.instrument='BTC-USDT';});assert.throws(()=>bridge.readEvidence(f.evidence),/EVIDENCE_PAIR_OR_VENUE/);}finally{f.cleanup();}});
test('volume sum mismatch rejected even with a valid manifest SHA',()=>{const f=makeFixture();try{mutateEvidence(f,'2026-11-05',d=>{d.rows[9].v_btc='999';});assert.throws(()=>bridge.readEvidence(f.evidence),/DAILY_VOLUME_SUM_MISMATCH/);}finally{f.cleanup();}});
test('wrong quote-currency volume rejected',()=>{const f=makeFixture();try{mutateEvidence(f,'2026-11-05',d=>{d.rows[6].v_usdc_quote='NaN';});assert.throws(()=>bridge.readEvidence(f.evidence),/BAD_NUMBER/);}finally{f.cleanup();}});
test('manifests with missing or extra days are blocked',()=>{const f=makeFixture();try{f.manifest.total_candles=24;fs.writeFileSync(path.join(f.evidence,'index.json'),JSON.stringify(f.manifest));assert.throws(()=>bridge.readEvidence(f.evidence),/MANIFEST_COUNTS/);}finally{f.cleanup();}});
test('duplicated source event rejected',()=>{const f=makeFixture();try{f.news.events.push({...f.news.events[0]});fs.writeFileSync(f.newsFile,JSON.stringify(f.news));assert.throws(()=>bridge.analyzeVerified({base:f.evidence,newsFile:f.newsFile}),/FROZEN_NEWS_DUPLICATE_OR_CAUSAL/);}finally{f.cleanup();}});
test('news without original Git blob provenance rejected',()=>{const f=makeFixture();try{f.news.freeze.source_blob_sha='';fs.writeFileSync(f.newsFile,JSON.stringify(f.news));assert.throws(()=>bridge.analyzeVerified({base:f.evidence,newsFile:f.newsFile}),/FROZEN_NEWS_PROVENANCE/);}finally{f.cleanup();}});
test('event not on selected days rejected',()=>{const f=makeFixture();try{f.news.events[0].event_time='2026-11-06T12:00:00Z';fs.writeFileSync(f.newsFile,JSON.stringify(f.news));assert.throws(()=>bridge.analyzeVerified({base:f.evidence,newsFile:f.newsFile}),/FROZEN_NEWS_OFF_TARGET/);}finally{f.cleanup();}});
test('unsafe causal claim in selected headline rejected',()=>{const f=makeFixture();try{f.news.events[0].causal_claim=true;fs.writeFileSync(f.newsFile,JSON.stringify(f.news));assert.throws(()=>bridge.analyzeVerified({base:f.evidence,newsFile:f.newsFile}),/FROZEN_NEWS_DUPLICATE_OR_CAUSAL/);}finally{f.cleanup();}});
test('refuses moving the fixed audit observation time',()=>{const f=makeFixture();try{assert.throws(()=>bridge.analyzeVerified({base:f.evidence,newsFile:f.newsFile,asOfUtc:'2026-11-20T15:00:00Z'}),/AS_OF_MUST_BE_FROZEN/);}finally{f.cleanup();}});
test('publication time relation never upgrades a post-peak report to cause',()=>{const peak=Date.parse('2026-11-05T15:00:00Z');assert.equal(bridge.eventRelation('2026-11-05T16:29:11Z',peak),'AFTER_PEAK_HOUR');assert.equal(bridge.eventRelation('2026-11-05T15:30:00Z',peak),'DURING_PEAK_HOUR');assert.equal(bridge.eventRelation('2026-11-05T14:15:00Z',peak),'BEFORE_PEAK_HOUR');assert.equal(bridge.eventRelation('2026-11-05T09:00:00Z',peak),'OUTSIDE_TWO_HOUR_CONTEXT');});
test('not a recommendation or a private account workflow',()=>{const f=makeFixture();try{const x=bridge.analyzeVerified({base:f.evidence,newsFile:f.newsFile});assert.equal(x.private_account_access,false);assert.equal(x.real_orders,0);assert.equal(x.exchange_signed,false);assert.equal(x.findings[0].temporal_core.advice,false);assert.equal(x.findings[0].temporal_core.coverage.quantitative_etf_flows_verified,false);}finally{f.cleanup();}});
