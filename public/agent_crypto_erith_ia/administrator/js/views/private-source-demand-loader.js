/* Agent-Crypto @erith.IA — stable Source Truth demand loader
   40.6.93 removes build-specific ownership from the loader.
   40.6.96+ loads the bounded post-handoff stabilization layer by immutable entry build.
   Source Truth stays in its canonical Backend / API host.
   private-backend-sources.js remains the single Source Truth runtime owner.
   No polling, observer, storage write, wallet or trading endpoint is introduced. */
(()=>{
  "use strict";
  const INSTANCE_KEY="__ERITH_PRIVATE_SOURCE_DEMAND_STABLE_BOUND__";
  if(globalThis[INSTANCE_KEY])return;
  globalThis[INSTANCE_KEY]=true;
  const metaBuild=()=>String(document.querySelector('meta[name="administrator-build"]')?.content||"").trim();
  const pathBuild=()=>String(location.pathname||"").match(/(?:^|\/)index-(\d+\.\d+\.\d+)\.html$/i)?.[1]||"";
  const BUILD=String(globalThis.ErithVersionTruth?.build||pathBuild()||metaBuild()||"runtime").trim();
  const SRC=`./js/views/private-backend-sources.js?v=administrator-build-${encodeURIComponent(BUILD)}`;
  let state="idle",promise=null,reason="",loadedAt=0,lastError="";

  const parts=value=>String(value||"").split(".").map(x=>Number.parseInt(x,10)||0);
  const atLeast=target=>{const A=parts(BUILD),B=parts(target),n=Math.max(A.length,B.length);for(let i=0;i<n;i+=1){const d=(A[i]||0)-(B[i]||0);if(d)return d>0;}return true;};

  function ensurePostHandoff(){
    if(!atLeast("40.6.96"))return false;
    if(globalThis.__AGENT_CRYPTO_POST_HANDOFF_406096__)return true;
    if(document.querySelector('script[data-agent-crypto-post-handoff-406096="true"]'))return true;
    const script=document.createElement("script");
    script.src=`./js/agent-crypto-post-handoff-406096.js?v=administrator-build-${encodeURIComponent(BUILD)}`;
    script.async=false;
    script.dataset.agentCryptoPostHandoff406096="true";
    document.head.appendChild(script);
    return true;
  }

  function settleReady(){state="ready";loadedAt=Date.now();lastError="";return true;}

  function ensure(why="operator"){
    reason=String(why||"operator");
    if(state==="ready"||globalThis.ErithPrivateBackendSources4054||globalThis.__AGENT_CRYPTO_SOURCE_INTELLIGENCE_40459__){settleReady();return Promise.resolve(true);}
    if(promise)return promise;
    state="loading";
    promise=new Promise(resolve=>{
      const existing=document.querySelector('script[data-private-source-demand-stable="true"],script[data-private-source-demand-40486="true"]');
      if(existing){
        if(globalThis.ErithPrivateBackendSources4054||existing.dataset.loaded==="true"){resolve(settleReady());return;}
        existing.addEventListener("load",()=>{existing.dataset.loaded="true";resolve(settleReady());},{once:true});
        existing.addEventListener("error",()=>{state="error";lastError="load-error";resolve(false);},{once:true});
        return;
      }
      const script=document.createElement("script");
      script.src=SRC;
      script.async=true;
      script.dataset.privateSourceDemandStable="true";
      script.addEventListener("load",()=>{script.dataset.loaded="true";settleReady();try{window.dispatchEvent(new CustomEvent("erith:private-source-runtime-loaded",{detail:{build:BUILD,reason}}));}catch(_){}resolve(true);},{once:true});
      script.addEventListener("error",()=>{state="error";lastError="script-load-error";resolve(false);},{once:true});
      document.head.appendChild(script);
    }).finally(()=>{promise=null;});
    return promise;
  }

  function clickDemand(event){
    const target=event.target instanceof Element?event.target:null;
    if(!target)return;
    const sourceNav=target.closest('[data-atlas-essential-target="sources"],[aria-controls="sources"],a[href="#sources"]');
    const backend=target.closest('details[data-collapse-key="backend"] > summary,a[href="#backend"],a[href="#privateBackendV1"]');
    if(sourceNav)void ensure("sources");
    else if(backend)void ensure("backend");
  }
  document.addEventListener("click",clickDemand,true);

  const backend=document.querySelector('details[data-collapse-key="backend"]');
  backend?.addEventListener("toggle",()=>{if(backend.open)void ensure("backend-open");});
  window.addEventListener("erith:system-hydrated",event=>{if(String(event?.detail?.key||"")==="backend"&&document.querySelector('details[data-collapse-key="backend"]')?.open)void ensure("backend-hydrated");},{passive:true});

  const hash=String(location.hash||"");
  if(["#sources","#backend","#privateBackendV1","#privateSourceIntelligence4056"].includes(hash))void ensure("direct-hash");
  ensurePostHandoff();

  const API=Object.freeze({
    build:BUILD,
    ensure,
    ensurePostHandoff,
    snapshot:()=>Object.freeze({state,reason,loaded_at:loadedAt,last_error:lastError,parser_boot_loaded:false,source:SRC,source_truth_host:"backend"}),
    stable_owner:true,
    source_truth_backend_placement_restored:true,
    sources_reparenting:false,
    post_handoff_stabilization:atLeast("40.6.96"),
    new_timer:false,
    new_observer:false,
    new_storage_owner:false,
    new_network_owner:false
  });
  globalThis.ErithPrivateSourceDemand=API;
  globalThis.ErithPrivateSourceDemand40486=API;
})();
