'use strict';
/* Seven Heaven — public, read-only historical recipe. No network, accounts, or orders. */
const fs=require('node:fs'),path=require('node:path');
const core=require('../SEVEN_HEAVEN_AGENT_CRYPTO_BTC_MARKET_NEWS_READ_ONLY_ANALYSIS_CORE.js');
const base=__dirname;
const csv=name=>fs.readFileSync(path.join(base,name),'utf8').trim().split(/\r?\n/).slice(1);
const cells=line=>line.split(',');
const rows=csv('chart_exchange_okx_btcusdc_daily_utc_2026-10-05_2026-11-09.csv').map(line=>{
 const [date,o,h,l,c,v]=cells(line);
 return {t:Date.parse(date+'T00:00:00Z'),o:+o,h:+h,l:+l,c:+c,v:+v,confirm:'1'};
});
const news=fs.readFileSync(path.join(base,'btc_selected_news_from_administrator_2026-11-10.tsv'),'utf8').trim().split(/\r?\n/).slice(1).map(line=>{
 const [event_id,event_time,headline,source_name,source_url,drivers]=line.split('\t');
 return {event_id,event_time,headline,source_name,source_url,
 driver_domains:drivers?drivers.split(';'):[],assets:['BTC'],causal_claim:false};
});
const input={asOfUtc:'2026-11-10T12:00:00Z',market:{
 loadedInstrument:'BTC-USDC',loadedBar:'1j',mode:'candles',
 source:'ChartExchange third-party daily listings labeled OKX BTC/USDC; NOT directly downloaded from OKX API',
 lastLoadedAt:null,loading:false,error:null,emaPeriods:[5,13,34],rows
},news:{schema:'atlas_news_sentinel_world_to_market_v1',
 generated_at:'2026-11-10T08:52:17.689742+00:00',status:'ok',causal_claim:false,
 summary:{sources_ok:14,sources_total:15,driver_coverage:{
 institutional_flows:{events_72h:5,distinct_sources:3},leverage:{events_72h:0,distinct_sources:0}}},
 events:news}};
const result=core.analyze(input);
if(result.status!=='MATCHED'||result.counts.matched!==7||result.counts.unmatched!==2||
 result.orders_enabled!==false||result.causal_claim!==false||result.technical.ema_fast_relative_to_slow!=='BELOW')
 throw Error('Historical recipe regression failed: '+JSON.stringify(result.counts));
const outfile=path.join(base,'SEVEN_HEAVEN_BTC_REAL_MARKET_PARTIAL_RECIPE_RESULT_2026_11_10.json');
fs.writeFileSync(outfile,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,counts:result.counts,
 ema:result.technical.ema_latest,unmatched:result.unmatched.map(x=>x.reason_code),
 provenance:'SECONDARY OKX-labeled ChartExchange data; NOT a native OKX API certification',
 orders_enabled:result.orders_enabled,causal_claim:result.causal_claim},null,2));
