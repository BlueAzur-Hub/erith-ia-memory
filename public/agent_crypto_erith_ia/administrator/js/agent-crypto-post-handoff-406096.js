/* Agent-Crypto @erith.IA — post-handoff bounded stabilization
   40.6.96: Strategy A Paper V2 self-proof runs once automatically after page load.
   40.6.97: existing retrospective-validation.js is activated after its dependencies exist.
   40.6.98: Source Truth/Source Intelligence gains a read-side per-provider freshness gate.
   No trading, wallet, private API, recurring timer, MutationObserver, or storage owner. */
(()=>{
  "use strict";

  const PATCH="40.6.98";
  const buildFromPath=()=>String(location.pathname||"").match(/(?:^|\/)index-(\d+\.\d+\.\d+)\.html$/i)?.[1]||"";
  const metaBuild=()=>String(document.querySelector('meta[name="administrator-build"]')?.content||"").trim();
  const BUILD=String(globalThis.ErithVersionTruth?.build||buildFromPath()||metaBuild()||"0.0.0").trim();
  const parts=value=>String(value||"").split(".").map(x=>Number.parseInt(x,10)||0);
  const atLeast=target=>{const A=parts(BUILD),B=parts(target),n=Math.max(A.length,B.length);for(let i=0;i<n;i+=1){const d=(A[i]||0)-(B[i]||0);if(d)return d>0;}return true;};
  const onReady=fn=>{
    const run=()=>{try{requestAnimationFrame(()=>requestAnimationFrame(fn));}catch(_){queueMicrotask(fn);}};
    if(document.readyState==="complete")run();
    else window.addEventListener("load",run,{once:true});
  };

  let strategyReceipt=null;
  function runStrategyProofOnce(){
    if(strategyReceipt)return strategyReceipt;
    const api=globalThis.AgentCryptoStrategyAPaperAfterCostAcceptance406063;
    if(!api||typeof api.run!=="function")return null;
    try{
      const receipt=api.run();
      strategyReceipt=receipt||{pass:false,reason:"EMPTY_RECEIPT"};
      document.documentElement.dataset.strategyAPaperAutoProof406096=strategyReceipt?.pass===true?"pass":"fail";
      try{document.dispatchEvent(new CustomEvent("agentcrypto:strategy-a-paper-proof-auto",{detail:strategyReceipt}));}catch(_){}
      return strategyReceipt;
    }catch(error){
      strategyReceipt={pass:false,reason:"AUTO_PROOF_EXCEPTION",error:String(error?.message||error)};
      document.documentElement.dataset.strategyAPaperAutoProof406096="fail";
      return strategyReceipt;
    }
  }

  let retrospectiveRenderFrame=0;
  function renderRetrospectiveBounded(){
    try{globalThis.atlasDecisionBoardDualMemory3950?.render?.();}catch(_){}
    const api=globalThis.atlasRetrospectiveValidation3960;
    const anchor=document.getElementById("decisionDualMemory395")||document.getElementById("decisionMemoryV2");
    if(api&&typeof api.render==="function"&&anchor){
      try{
        api.render();
        document.documentElement.dataset.retrospectiveValidation406097="active";
        return true;
      }catch(_){
        document.documentElement.dataset.retrospectiveValidation406097="render-error";
        return false;
      }
    }
    if(retrospectiveRenderFrame>=60){
      document.documentElement.dataset.retrospectiveValidation406097="dependency-timeout";
      return false;
    }
    retrospectiveRenderFrame+=1;
    try{requestAnimationFrame(renderRetrospectiveBounded);}
    catch(_){queueMicrotask(renderRetrospectiveBounded);}
    return false;
  }

  function activateRetrospective(){
    retrospectiveRenderFrame=0;
    if(globalThis.atlasRetrospectiveValidation3960){
      renderRetrospectiveBounded();
      return true;
    }
    const existing=document.querySelector('script[data-retrospective-activation-406097="true"]');
    if(existing){
      renderRetrospectiveBounded();
      return true;
    }
    const script=document.createElement("script");
    script.src=`./js/retrospective-validation.js?v=administrator-build-${encodeURIComponent(BUILD)}`;
    script.async=false;
    script.dataset.retrospectiveActivation406097="true";
    script.addEventListener("load",()=>{
      retrospectiveRenderFrame=0;
      renderRetrospectiveBounded();
    },{once:true});
    script.addEventListener("error",()=>{document.documentElement.dataset.retrospectiveValidation406097="load-error";},{once:true});
    document.head.appendChild(script);
    return true;
  }

  const observedMs=value=>{
    if(value===null||value===undefined||value==="")return null;
    const numeric=Number(value);
    if(Number.isFinite(numeric)&&numeric>0)return numeric;
    const parsed=Date.parse(String(value));
    return Number.isFinite(parsed)?parsed:null;
  };
  const ageSeconds=(value,now=Date.now())=>{const ms=observedMs(value);return ms===null?null:Math.max(0,Math.round((now-ms)/1000));};
  const numeric=value=>(value===null||value===undefined||value==="")?null:(Number.isFinite(Number(value))?Number(value):null);
  const consensus=values=>{
    const vals=values.map(numeric).filter(v=>v!==null&&v>0);
    if(vals.length<2)return {providers:vals.length,spread_pct:null,verdict:"insufficient"};
    const mean=vals.reduce((a,b)=>a+b,0)/vals.length;
    const spread=mean?((Math.max(...vals)-Math.min(...vals))/mean*100):null;
    const verdict=spread!==null&&spread<=0.25?"coherent":spread!==null&&spread<=0.75?"watch":"divergent";
    return {providers:vals.length,spread_pct:spread,verdict};
  };

  function freshnessLimitSeconds(api){
    try{
      const ms=Number(api?.automationSnapshot?.()?.min_interval_ms);
      if(Number.isFinite(ms)&&ms>0)return Math.max(120,Math.ceil(ms/1000)+60);
    }catch(_){}
    return 300;
  }

  function guardTruth(raw,api){
    if(!raw||!Array.isArray(raw.assets))return raw;
    const limit=freshnessLimitSeconds(api),now=Date.now();
    let maxAge=0,knownAges=0,staleProviders=0,freshComparable=0;
    const assets=raw.assets.map(row=>{
      const observed=row?.observed||{};
      const ages={
        binance:ageSeconds(observed.binance_ms,now),
        kraken:ageSeconds(observed.kraken_utc,now),
        coinbase:ageSeconds(observed.coinbase_utc,now),
        okx:ageSeconds(observed.okx_utc,now)
      };
      const fresh={};
      for(const key of Object.keys(ages)){
        const age=ages[key];
        fresh[key]=age!==null&&age<=limit;
        if(age!==null){knownAges+=1;maxAge=Math.max(maxAge,age);if(age>limit)staleProviders+=1;}
      }
      const prices={
        binance:fresh.binance?numeric(row.binance):null,
        kraken:fresh.kraken?numeric(row.kraken):null,
        coinbase:fresh.coinbase?numeric(row.coinbase):null,
        okx:fresh.okx?numeric(row.okx):null
      };
      const c=consensus([prices.binance,prices.kraken,prices.coinbase,prices.okx]);
      if(c.providers>=2)freshComparable+=1;
      return Object.freeze({...row,...prices,consensus:c,freshness:Object.freeze({limit_seconds:limit,ages:Object.freeze(ages),fresh:Object.freeze(fresh),usable_providers:c.providers})});
    });
    return Object.freeze({...raw,assets:Object.freeze(assets),freshness_gate:Object.freeze({mode:"FAIL_CLOSED_READ_SIDE",limit_seconds:limit,max_age_seconds:knownAges?maxAge:null,known_samples:knownAges,stale_providers:staleProviders,comparable_assets:freshComparable,total_assets:assets.length,ready:freshComparable===assets.length})});
  }

  function guardIntelligence(raw,truth){
    if(!raw)return raw;
    const gate=truth?.freshness_gate||null;
    if(!gate)return raw;
    const cex=Object.freeze({...raw.cex,comparable_assets:Math.min(Number(raw?.cex?.comparable_assets||0),Number(gate.comparable_assets||0)),freshness_gate:true});
    const freshness=Object.freeze({...raw.freshness,cex_max_age_seconds:gate.max_age_seconds,cex_limit_seconds:gate.limit_seconds,cex_stale_providers:gate.stale_providers});
    const rules=Object.freeze({...raw.rules,per_provider_freshness_gate:true,stale_cex_excluded_from_comparison:true});
    return Object.freeze({...raw,state:gate.ready?raw.state:"partial",cex,freshness,rules,freshness_gate:gate});
  }

  let sourceRaw=null,sourceGuard=null;
  function applySourceUiGuard(){
    if(!sourceGuard)return null;
    const truth=sourceGuard.snapshot?.()||null;
    const intel=sourceGuard.sourceIntelligence?.()||null;
    const gate=truth?.freshness_gate||intel?.freshness_gate||null;
    if(!gate||gate.ready)return gate;
    const badge=document.getElementById("privateSourceIntelligenceStatus4056");
    if(badge){badge.className="pill warn";badge.textContent="FRAÎCHEUR PARTIELLE";}
    const detail=document.getElementById("privateSourceIntelligenceDetail4056");
    if(detail)detail.textContent=`CEX frais ${gate.comparable_assets}/${gate.total_assets} · ${gate.stale_providers} cotation(s) périmée(s) exclue(s) · TTL ${gate.limit_seconds}s · lecture seule`;
    const backendBadge=document.getElementById("privateBackendStatus4053");
    if(backendBadge){backendBadge.className="pill warn";backendBadge.textContent="CEX À RAFRAÎCHIR";}
    return gate;
  }

  function installSourceGuard(){
    const api=globalThis.ErithPrivateBackendSources4054;
    if(!api||api.__freshness_guard_406098===true)return !!api;
    sourceRaw=api;
    const wrapper={...api};
    wrapper.snapshot=()=>guardTruth(sourceRaw.snapshot?.(),sourceRaw);
    wrapper.sourceIntelligence=()=>guardIntelligence(sourceRaw.sourceIntelligence?.(),wrapper.snapshot());
    wrapper.refresh=async(...args)=>{const result=await sourceRaw.refresh?.(...args);applySourceUiGuard();return result;};
    wrapper.refreshAll=async(...args)=>{const result=await sourceRaw.refreshAll?.(...args);applySourceUiGuard();return result;};
    wrapper.autoRefresh=async(...args)=>{const result=await sourceRaw.autoRefresh?.(...args);applySourceUiGuard();return result;};
    wrapper.__freshness_guard_406098=true;
    wrapper.freshness_guard_build="40.6.98";
    wrapper.freshness_gate_mode="FAIL_CLOSED_READ_SIDE";
    sourceGuard=Object.freeze(wrapper);
    globalThis.__ERITH_PRIVATE_BACKEND_SOURCES_RAW_406098__=sourceRaw;
    globalThis.ErithPrivateBackendSources4054=sourceGuard;
    applySourceUiGuard();
    document.documentElement.dataset.sourceFreshnessGuard406098="active";
    return true;
  }

  if(atLeast("40.6.96"))onReady(runStrategyProofOnce);
  if(atLeast("40.6.97"))onReady(activateRetrospective);
  if(atLeast("40.6.98")){
    onReady(()=>{installSourceGuard();applySourceUiGuard();});
    window.addEventListener("erith:private-source-runtime-loaded",()=>{installSourceGuard();applySourceUiGuard();},{once:true});
    document.addEventListener("erith:source-intelligence",applySourceUiGuard,{passive:true});
    document.addEventListener("agentcrypto:current-finalized",applySourceUiGuard,{passive:true});
    window.addEventListener("pageshow",applySourceUiGuard,{passive:true});
    document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")applySourceUiGuard();},{passive:true});
  }

  globalThis.__AGENT_CRYPTO_POST_HANDOFF_406096__=Object.freeze({
    patch:PATCH,
    build:BUILD,
    strategy_auto_proof:atLeast("40.6.96"),
    retrospective_activation:atLeast("40.6.97"),
    source_freshness_guard:atLeast("40.6.98"),
    strategyReceipt:()=>strategyReceipt,
    runStrategyProofOnce,
    activateRetrospective,
    installSourceGuard,
    applySourceUiGuard,
    recurring_timer:false,
    observer:false,
    storage_write:false,
    trading:false
  });
})();
