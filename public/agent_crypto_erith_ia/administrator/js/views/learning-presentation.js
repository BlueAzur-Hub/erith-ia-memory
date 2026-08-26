/* Agent-Crypto @erith.IA — 40.4.43
   LEARNING JOURNEY BOOT RESIDENCY TRUE-LAZY / RUNTIME REBIND LOCK
   The 40.4.22 recovered Learning block is removed synchronously immediately
   after System presentation mount, before app.js captures Learning DOM refs.
   On first Learning disclosure (or Learning hash navigation), the presentation
   is read from canonical views/system.html, injected once, then rebound through
   the 40.4.42 runtime boundary. Learning state/progress/IndexedDB stay in app.js.
   No timer, observer, market/network business owner or storage policy is added.
   One same-origin static source fetch is allowed on first Learning hydration. */
(()=>{
  "use strict";
  const BUILD="40.4.43";
  const SOURCE="./views/system.html";
  const FIRST_ID="learningExerciseGuide";
  const LAST_ID="expertLearningRoadmap";
  let sourcePromise=null;
  let sourceTemplate=null;
  let sourceFetchCount=0;
  let hydrationCount=0;
  let strippedNodeCount=0;
  let lastError="";

  function siblingRange(first,last){
    if(!(first instanceof Element)||!(last instanceof Element)||first.parentNode!==last.parentNode)return null;
    const nodes=[]; let node=first;
    while(node){
      nodes.push(node);
      if(node===last)return nodes;
      node=node.nextSibling;
    }
    return null;
  }

  const liveFirst=document.getElementById(FIRST_ID);
  const liveLast=document.getElementById(LAST_ID);
  const liveRange=siblingRange(liveFirst,liveLast);
  if(!liveRange?.length){
    globalThis.__AGENT_CRYPTO_LEARNING_PRESENTATION_40443__=Object.freeze({build:BUILD,state:"fallback-resident",reason:"learning-range-not-found",new_timer:false,new_observer:false,storage_policy_changed:false,indexeddb_schema_changed:false});
    return;
  }

  const parent=liveFirst.parentNode;
  const shell=document.createElement("details");
  shell.className="atlas-collapse glass learning-lazy-shell-40443";
  shell.dataset.learningLazyShell40443="true";
  shell.innerHTML=`<summary class="atlas-collapse-summary"><span class="atlas-collapse-icon" aria-hidden="true">▶</span><span class="atlas-collapse-title">Learning Journey · 01→11</span><span class="atlas-collapse-subtitle">Progression et IndexedDB conservées · contenu détaillé à la demande</span></summary><div class="atlas-collapse-body" data-learning-hydration-40443="empty"><div class="learning-lazy-placeholder-40443"><b>Parcours pédagogique prêt</b><span>Ouvre cette section pour matérialiser le cockpit, les leçons et la feuille de route.</span></div></div>`;
  parent.insertBefore(shell,liveFirst);
  liveRange.forEach(node=>{ if(node.nodeType===Node.ELEMENT_NODE) strippedNodeCount+=1+node.querySelectorAll("*").length; node.remove(); });

  const body=shell.querySelector(':scope > .atlas-collapse-body');
  function sourceDocument(){
    if(sourceTemplate)return Promise.resolve(sourceTemplate);
    if(sourcePromise)return sourcePromise;
    sourceFetchCount+=1;
    sourcePromise=fetch(SOURCE,{credentials:"same-origin",cache:"default"})
      .then(response=>{if(!response.ok)throw new Error(`Learning source HTTP ${response.status}`);return response.text();})
      .then(text=>{const template=document.createElement("template");template.innerHTML=text;sourceTemplate=template;lastError="";return template;})
      .catch(error=>{lastError=String(error?.message||error||"Learning source unavailable");sourcePromise=null;throw error;});
    return sourcePromise;
  }

  function sourceRange(template){
    const first=template.content.querySelector(`#${FIRST_ID}`);
    const last=template.content.querySelector(`#${LAST_ID}`);
    const nodes=siblingRange(first,last);
    if(!nodes?.length)throw new Error("Learning source range missing");
    return nodes;
  }

  async function ensure(targetId=""){
    if(body.dataset.learningHydration40443==="ready"){
      try{globalThis.atlasRebindLearningRuntime?.(body)||globalThis.atlasRebindLearningRuntime40442?.(body);}catch(_){}
      return true;
    }
    if(body.dataset.learningHydration40443==="loading"){
      try{await sourcePromise;}catch(_){}
      return body.dataset.learningHydration40443==="ready";
    }
    body.dataset.learningHydration40443="loading";
    try{
      const template=await sourceDocument();
      const nodes=sourceRange(template).map(node=>node.cloneNode(true));
      body.replaceChildren(...nodes);
      body.dataset.learningHydration40443="ready";
      hydrationCount+=1;
      try{globalThis.atlasRebindLearningRuntime?.(body)||globalThis.atlasRebindLearningRuntime40442?.(body);}catch(error){console.warn(`Agent-Crypto ${BUILD} · Learning runtime rebind failed`,error);}
      try{window.dispatchEvent(new CustomEvent("erith:learning-hydrated",{detail:{build:BUILD,target_id:String(targetId||"")}}));}catch(_){}
      if(targetId){requestAnimationFrame(()=>document.getElementById(targetId)?.scrollIntoView?.({block:"start",behavior:"smooth"}));}
      return true;
    }catch(error){
      body.dataset.learningHydration40443="error";
      body.innerHTML=`<div class="learning-lazy-placeholder-40443"><b>Présentation Learning indisponible</b><span>${String(error?.message||error||"Erreur inconnue")}</span></div>`;
      console.warn(`Agent-Crypto ${BUILD} · Learning hydration failed`,error);
      return false;
    }
  }

  shell.addEventListener("toggle",()=>{if(shell.open)ensure();});

  const LEARNING_IDS=new Set([FIRST_ID,LAST_ID,"learningJourneyCockpit","learningFoundationPanel","learningFoundationLab","learningLessonPanel","learningCompletionPanel","learningIntegrityPanel"]);
  function hashTarget(){const id=decodeURIComponent(String(location.hash||"").replace(/^#/,""));return LEARNING_IDS.has(id)?id:"";}
  function hydrateHash(){const id=hashTarget();if(!id)return;shell.open=true;ensure(id);}
  window.addEventListener("hashchange",hydrateHash,{passive:true});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",hydrateHash,{once:true});else hydrateHash();

  function snapshot(){return Object.freeze({build:BUILD,state:body.dataset.learningHydration40443||"empty",source:SOURCE,source_fetch_count:sourceFetchCount,hydration_count:hydrationCount,stripped_nodes_at_boot:strippedNodeCount,last_error:lastError||null,runtime_owner:"app.js",runtime_rebind:"atlasRebindLearningRuntime40442",indexeddb_schema_changed:false,learning_state_reset:false,new_timer:false,new_observer:false,new_storage_owner:false,business_engine_changed:false});}
  const api=Object.freeze({build:BUILD,source:SOURCE,shell,ensure,snapshot,runtime_owner:"app.js",indexeddb_schema_changed:false,learning_state_reset:false,new_timer:false,new_observer:false,new_storage_owner:false,business_engine_changed:false});
  globalThis.ErithLearningPresentation40443=api;
  globalThis.ErithLearningPresentation=api;
  globalThis.__AGENT_CRYPTO_LEARNING_PRESENTATION_40443__=snapshot();
})();
