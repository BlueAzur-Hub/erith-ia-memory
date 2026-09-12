/* Agent-Crypto @erith.IA — 40.6.91
   PRIVATE BACKEND / SOURCE INTELLIGENCE SCRIPT DEMAND LOADER
   40.6.91 repairs Sources accordion demand + places Source Truth inside Sources.
   Existing private-backend-sources.js remains the single Source Truth owner.
   No polling, observer, storage write, wallet or trading endpoint is introduced. */
(()=>{
  "use strict";
  const INSTANCE_KEY="__ERITH_PRIVATE_SOURCE_DEMAND_406091_BOUND__";
  if(globalThis[INSTANCE_KEY])return;
  globalThis[INSTANCE_KEY]=true;
  const BUILD="40.6.91";
  const SRC="./js/views/private-backend-sources.js?v=administrator-build-40.6.91-source-debug-1";
  let state="idle",promise=null,reason="",loadedAt=0,lastError="";
  const sourceDetails=()=>document.querySelector('details[data-collapse-key="sources"]');
  const sourceBody=()=>sourceDetails()?.querySelector(":scope > .atlas-collapse-body")||sourceDetails()?.querySelector(".atlas-collapse-body")||null;
  const sourceReason=why=>String(why||"").startsWith("sources");

  function placeInSources(){
    try{globalThis.ErithPrivateBackendSources4054?.mount?.();}catch(_){}
    const panel=document.getElementById("privateBackendV1"),host=sourceBody();
    if(!panel||!host)return false;
    if(panel.parentElement!==host)host.insertBefore(panel,host.firstElementChild||null);
    panel.dataset.sourceTruthHost406091="sources";
    return true;
  }
  function settleReady(why){state="ready";loadedAt=Date.now();lastError="";if(sourceReason(why))placeInSources();return true;}

  function ensure(why="operator"){
    reason=String(why||"operator");
    if(state==="ready"||globalThis.ErithPrivateBackendSources4054||globalThis.__AGENT_CRYPTO_SOURCE_INTELLIGENCE_40459__){settleReady(reason);return Promise.resolve(true);}
    if(promise)return promise;
    state="loading";
    promise=new Promise(resolve=>{
      const existing=document.querySelector('script[data-private-source-demand-40486="true"]');
      if(existing){
        if(globalThis.ErithPrivateBackendSources4054||existing.dataset.loaded==="true"){resolve(settleReady(reason));return;}
        existing.addEventListener("load",()=>{existing.dataset.loaded="true";resolve(settleReady(reason));},{once:true});
        existing.addEventListener("error",()=>{state="error";lastError="load-error";resolve(false);},{once:true});
        return;
      }
      const script=document.createElement("script");
      script.src=SRC;
      script.async=true;
      script.dataset.privateSourceDemand40486="true";
      script.addEventListener("load",()=>{script.dataset.loaded="true";settleReady(reason);try{window.dispatchEvent(new CustomEvent("erith:private-source-runtime-loaded",{detail:{build:BUILD,reason}}));}catch(_){}resolve(true);},{once:true});
      script.addEventListener("error",()=>{state="error";lastError="script-load-error";resolve(false);},{once:true});
      document.head.appendChild(script);
    }).finally(()=>{promise=null;});
    return promise;
  }

  function clickDemand(event){
    const target=event.target instanceof Element?event.target:null;
    if(!target)return;
    const sourceNav=target.closest('[data-atlas-essential-target="sources"],[aria-controls="sources"],a[href="#sources"],details[data-collapse-key="sources"] > summary,#liveSourcesCollapse > summary');
    const backend=target.closest('details[data-collapse-key="backend"] > summary,a[href="#backend"],a[href="#privateBackendV1"]');
    if(sourceNav)void ensure("sources-click").then(()=>placeInSources());
    else if(backend)void ensure("backend");
  }
  document.addEventListener("click",clickDemand,true);

  const sources=sourceDetails();
  sources?.addEventListener("toggle",()=>{if(sources.open)void ensure("sources-open").then(()=>placeInSources());});
  const backend=document.querySelector('details[data-collapse-key="backend"]');
  backend?.addEventListener("toggle",()=>{if(backend.open)void ensure("backend-open");});
  window.addEventListener("erith:system-hydrated",event=>{
    const key=String(event?.detail?.key||"");
    if(key==="sources"&&sourceDetails()?.open)void ensure("sources-hydrated").then(()=>placeInSources());
    if(key==="backend"&&document.querySelector('details[data-collapse-key="backend"]')?.open)void ensure("backend-hydrated");
  },{passive:true});

  const hash=String(location.hash||"");
  if(["#sources","#backend","#privateBackendV1","#privateSourceIntelligence4056"].includes(hash)){
    const why=hash==="#sources"?"sources-hash":"direct-hash";
    void ensure(why).then(()=>{if(sourceReason(why))placeInSources();});
  }

  globalThis.ErithPrivateSourceDemand40486=Object.freeze({
    build:BUILD,ensure,placeInSources,
    snapshot:()=>Object.freeze({state,reason,loaded_at:loadedAt,last_error:lastError,parser_boot_loaded:false,source:SRC,source_truth_host:document.getElementById("privateBackendV1")?.dataset?.sourceTruthHost406091||null}),
    sources_toggle_owner:true,source_truth_sources_placement:true,existing_script_race_repaired:true,
    new_timer:false,new_observer:false,new_storage_owner:false,new_network_owner:false
  });
})();
