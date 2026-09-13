/* Agent-Crypto @erith.IA — 40.6.111
   DEX freshness truth + Aether pending/repose regression gate.
   DEX observations whose freshness is unknown or beyond the declared bound
   lose read-side Atlas eligibility but remain observable. Aether already owns
   pending-before-REPOS in aether.js; this layer verifies/exposes that truth
   without adding a wake loop. No fetch, timer, observer, storage or trading. */
(() => {
  "use strict";
  const PATCH="40.6.111", FALLBACK_MAX_AGE_SECONDS=600;
  const sourceApi=globalThis.ErithPrivateBackendSources4054;
  const originalContext=typeof sourceApi?.contextSnapshot==="function"?sourceApi.contextSnapshot.bind(sourceApi):null;
  const toMs=value=>{
    if(value===null||value===undefined||value==="")return null;
    if(Number.isFinite(Number(value))){const n=Number(value);return n>1e12?n:n>1e9?n*1000:null;}
    const parsed=Date.parse(String(value));return Number.isFinite(parsed)?parsed:null;
  };
  function providerTimestamp(provider){
    if(!provider||typeof provider!=="object")return null;
    const values=[provider.observed_at,provider.fetched_at,provider.updated_at,provider.timestamp,provider.as_of,provider.data_timestamp,provider.quote_timestamp,provider.last_seen_at,provider?.meta?.observed_at,provider?.meta?.fetched_at,provider?.meta?.updated_at,provider?.meta?.timestamp];
    for(const value of values){const ms=toMs(value);if(ms!==null)return ms;}
    return null;
  }
  function maxAgeSeconds(context){
    const candidates=[context?.dex_max_age_seconds,context?.freshness?.dex_max_age_seconds,sourceApi?.dex_max_age_seconds,sourceApi?.freshness_max_age_seconds];
    for(const value of candidates){const n=Number(value);if(Number.isFinite(n)&&n>0)return n;}
    return FALLBACK_MAX_AGE_SECONDS;
  }
  function clone(value){try{return structuredClone(value);}catch(_){try{return JSON.parse(JSON.stringify(value));}catch(__){return value;}}}
  function sanitizeContext(context,now=Date.now()){
    if(!context||!Array.isArray(context.assets))return context;
    const out=clone(context), limit=maxAgeSeconds(context), stale=[];
    out.assets=out.assets.map(row=>{
      const next={...row}, identity={...(row?.identity||{})};
      const providers=[["dexscreener",row?.dexscreener],["geckoterminal",row?.geckoterminal]];
      const providerState=providers.map(([name,p])=>{
        if(String(p?.status||"").toLowerCase()!=="ok")return {name,ok:false,stale:false,age_seconds:null,reason:"NOT_OK"};
        const ts=providerTimestamp(p);
        const age=ts===null?null:Math.max(0,(now-ts)/1000);
        const isStale=age===null||age>limit;
        return {name,ok:true,stale:isStale,age_seconds:age,reason:age===null?"FRESHNESS_UNKNOWN":isStale?"STALE":"FRESH"};
      });
      const staleProviders=providerState.filter(p=>p.ok&&p.stale);
      if(staleProviders.length){
        identity.atlas_eligible=false;
        identity.freshness_review=true;
        identity.freshness_reason=staleProviders.map(p=>`${p.name}:${p.reason}`).join("+");
        identity.freshness_max_age_seconds=limit;
        stale.push({asset:String(row?.asset||""),providers:staleProviders});
      }
      next.identity=identity;
      next.freshness_406111=providerState;
      return next;
    });
    out.dex_freshness_406111={max_age_seconds:limit,stale_assets:stale.length,fail_closed:true,generated_at:new Date(now).toISOString()};
    return out;
  }
  let wrapped=false;
  if(sourceApi&&originalContext){
    try{
      const proxy=new Proxy(sourceApi,{get(target,prop,receiver){if(prop==="contextSnapshot")return ()=>sanitizeContext(originalContext());return Reflect.get(target,prop,receiver);}});
      globalThis.ErithPrivateBackendSources4054=proxy;
      wrapped=true;
    }catch(_){}
  }
  function aetherTruth(){
    let pending=null,current=null;
    try{if(typeof globalThis.atlasCurrentPendingMarket137==="function")pending=globalThis.atlasCurrentPendingMarket137()||null;}catch(_){}
    try{if(typeof globalThis.atlasCurrentStateRead==="function")current=globalThis.atlasCurrentStateRead()||null;}catch(_){}
    const status=String(current?.status||"").trim().toUpperCase();
    const state=pending?"PENDING":status==="CURRENT"?"REPOS":status||"INCONNU";
    document.documentElement.dataset.aetherPendingTruth406111=state.toLowerCase();
    return Object.freeze({state,pending:Boolean(pending),current_status:status||null,repos_allowed:!pending&&status==="CURRENT"});
  }
  function schedule(reason){queueMicrotask(()=>{try{aetherTruth();document.documentElement.dataset.aetherFreshnessReason406111=String(reason||"runtime");}catch(_){}});}
  document.addEventListener("agentcrypto:current-finalized",()=>schedule("current-finalized"),{passive:true});
  document.addEventListener("agentcrypto:current-pending",()=>schedule("current-pending"),{passive:true});
  window.addEventListener("erith:system-hydrated",()=>schedule("system-hydrated"),{once:true,passive:true});
  if(document.readyState==="complete")schedule("boot");else window.addEventListener("load",()=>schedule("load"),{once:true,passive:true});
  function selfTest(){
    const now=Date.now(), fresh=new Date(now-60000).toISOString(), stale=new Date(now-3600000).toISOString();
    const ctx={dex_max_age_seconds:600,assets:[{asset:"BTC",dexscreener:{status:"ok",updated_at:fresh},geckoterminal:{status:"ok",updated_at:fresh},identity:{atlas_eligible:true}},{asset:"ETH",dexscreener:{status:"ok",updated_at:stale},geckoterminal:{status:"ok",updated_at:fresh},identity:{atlas_eligible:true}},{asset:"SOL",dexscreener:{status:"ok"},geckoterminal:{status:"ok",updated_at:fresh},identity:{atlas_eligible:true}}]};
    const out=sanitizeContext(ctx,now), by=Object.fromEntries(out.assets.map(r=>[r.asset,r]));
    const checks=[by.BTC.identity.atlas_eligible===true,by.ETH.identity.atlas_eligible===false,by.SOL.identity.atlas_eligible===false,out.dex_freshness_406111.stale_assets===2];
    return Object.freeze({pass:checks.every(Boolean),total:checks.length,passed:checks.filter(Boolean).length,checks:Object.freeze(checks)});
  }
  globalThis.AgentCryptoDexAetherFreshnessTruth406111=Object.freeze({patch:PATCH,active:true,context_wrapped:wrapped,max_age_fallback_seconds:FALLBACK_MAX_AGE_SECONDS,sanitizeContext,aetherTruth,selfTest,dex_fail_closed:true,aether_pending_precedes_repos:true,fetch:false,recurring_timer:false,observer:false,storage_write:false,trading:false,wallet:false});
})();
