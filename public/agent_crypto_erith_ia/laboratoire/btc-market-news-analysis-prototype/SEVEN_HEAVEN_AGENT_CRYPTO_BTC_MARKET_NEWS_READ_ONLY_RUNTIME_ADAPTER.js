/* ERITH.IA / Seven Heaven — Optional runtime-to-public-news adapter.
 * Not loaded by Administrator or Trader. No automatic fetch on import.
 * Invoked explicitly and only reads allowlisted public market fields.
 */
(function(root,factory){
 'use strict';
 const core=typeof module==='object'&&module.exports ?
   require('./SEVEN_HEAVEN_AGENT_CRYPTO_BTC_MARKET_NEWS_READ_ONLY_ANALYSIS_CORE.js') :
   root.SevenBtcMarketNewsAnalysisCore;
 const api=factory(core);
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.SevenBtcMarketNewsRuntimeAdapter=api;
})(typeof globalThis==='object'?globalThis:this,function(core){
 'use strict';
 const NEWS_URL='https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/main/public/agent_crypto_erith_ia/data/news/latest.json';
 const deny=(code,why)=>Object.freeze({schema:'seven.btc.market.news.analysis.proof.v1',
   status:'BLOCKED',reason_code:code,reason:why,orders_enabled:false,
   causal_claim:false,advice:false,matches:[],unmatched:[]});
 function extractPublicMarket(runtime){
   const get=runtime?.AgentCryptoMarketMicroscope?.snapshot;
   if(typeof get!=='function')return null;
   let s;try{s=get.call(runtime.AgentCryptoMarketMicroscope);}catch{return null;}
   if(!s||typeof s!=='object')return null;
   // Transfer ONLY public candles and indicators. Never transfer any account object.
   return {loadedInstrument:s.loadedInstrument,loadedBar:s.loadedBar,
     source:s.source,lastLoadedAt:s.lastLoadedAt,
     loading:s.loading===true,error:s.error||null,
     emaPeriods:Array.isArray(s.emaPeriods)?s.emaPeriods.slice(0,3):[],
     rows:Array.isArray(s.rows)?s.rows.map(r=>({t:r?.t,o:r?.o,h:r?.h,l:r?.l,
       c:r?.c,v:r?.v,confirm:r?.confirm})):[]};
 }
 function analyzeSnapshots({market,news,asOfUtc}){
   if(!core?.analyze)return deny('CORE_NOT_LOADED','Read-only core module is unavailable.');
   return core.analyze({market,news,asOfUtc});
 }
 async function analyzeFromRuntime({runtime,fetchPublicNews,asOfUtc}={}){
   const market=extractPublicMarket(runtime);
   if(!market)return deny('RUNTIME_SNAPSHOT_UNAVAILABLE','No public chart snapshot available in this runtime.');
   if(typeof fetchPublicNews!=='function')
     return deny('PUBLIC_NEWS_FETCH_UNAVAILABLE','The caller must explicitly supply a fetch function.');
   let response;
   try{response=await fetchPublicNews(NEWS_URL,{credentials:'omit',cache:'no-store'});}
   catch{return deny('PUBLIC_NEWS_NETWORK_ERROR','Public news request failed.');}
   if(!response?.ok || typeof response.json!=='function')
     return deny('PUBLIC_NEWS_HTTP_ERROR','Public news file is unavailable.');
   let news;
   try{news=await response.json();}catch{return deny('PUBLIC_NEWS_JSON_ERROR','Invalid public news JSON.');}
   return analyzeSnapshots({market,news,asOfUtc});
 }
 return Object.freeze({extractPublicMarket,analyzeSnapshots,analyzeFromRuntime,
   public_news_url:NEWS_URL,read_only:true,orders_enabled:false,
   no_auto_fetch:true,no_ui_changes:true});
});