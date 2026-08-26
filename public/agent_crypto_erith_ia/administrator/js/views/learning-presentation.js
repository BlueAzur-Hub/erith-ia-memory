/* Agent-Crypto @erith.IA — 40.4.45
   LEARNING JOURNEY TRUE-LAZY PARSER GATE / CANONICAL PRESENTATION OWNER
   Loaded immediately BEFORE system-presentation.js. It intercepts only the one
   parser-mount call on #system-view-host, removes the recovered Learning 01→11
   sibling range from the System HTML string BEFORE browser HTML parsing, then
   inserts one compact Learning shell before the pedagogical journal.
   First disclosure/hash/target request fetches canonical views/system.html once,
   clones only Learning, then calls the resident app.js runtime rebind boundary.
   Learning state/progress/IndexedDB remain owned by app.js. No timer, observer,
   market/business network owner, storage policy, IndexedDB schema or reset is added. */
(()=>{
  "use strict";
  const BUILD="40.4.45";
  const SOURCE="./views/system.html";
  const HOST_ID="system-view-host";
  const FIRST_ID="learningExerciseGuide";
  const LAST_ID="expertLearningRoadmap";
  const JOURNAL_ID="learningPanel";
  const START_MARKER='<section class="learning-exercise-guide" id="learningExerciseGuide"';
  const END_MARKER='<div class="learning-panel" id="learningPanel"';
  const host=document.getElementById(HOST_ID);
  let sourcePromise=null;
  let sourceTemplate=null;
  let sourceFetchCount=0;
  let hydrationCount=0;
  let parserStripCount=0;
  let parserStrippedChars=0;
  let shell=null;
  let body=null;
  let lastError="";

  function siblingRange(first,last){
    if(!(first instanceof Element)||!(last instanceof Element)||first.parentNode!==last.parentNode)return null;
    const nodes=[]; let node=first;
    while(node){nodes.push(node);if(node===last)return nodes;node=node.nextSibling;}
    return null;
  }

  function stripLearningBeforeParse(html){
    const raw=String(html??"");
    let start=raw.indexOf(START_MARKER);
    const end=raw.indexOf(END_MARKER,start>=0?start:0);
    if(start<0||end<0||end<=start){
      lastError="parser-markers-not-found";
      return raw;
    }
    const commentStart=raw.lastIndexOf('<!-- ============================================================',start);
    if(commentStart>=0 && raw.slice(commentStart,start).includes('40.4.22')) start=commentStart;
    parserStripCount+=1;
    parserStrippedChars+=Math.max(0,end-start);
    lastError="";
    return raw.slice(0,start)+raw.slice(end);
  }

  function makeShell(){
    if(shell?.isConnected)return shell;
    const journal=document.getElementById(JOURNAL_ID);
    if(!journal?.parentNode){lastError="learning-journal-anchor-missing";return null;}
    shell=document.createElement("details");
    shell.className="atlas-collapse glass learning-lazy-shell";
    shell.dataset.learningLazyShell="true";
    shell.innerHTML=`<summary class="atlas-collapse-summary"><span class="atlas-collapse-icon" aria-hidden="true">▶</span><span class="atlas-collapse-title">Learning Journey · 01→11</span><span class="atlas-collapse-subtitle">Progression et IndexedDB conservées · contenu détaillé à la demande</span></summary><div class="atlas-collapse-body" data-learning-hydration="empty"><div class="learning-lazy-placeholder"><b>Parcours pédagogique prêt</b><span>Ouvre cette section pour matérialiser le cockpit, les leçons et la feuille de route.</span></div></div>`;
    journal.parentNode.insertBefore(shell,journal);
    body=shell.querySelector(':scope > .atlas-collapse-body');
    shell.addEventListener("toggle",()=>{if(shell.open)ensure();});
    hydrateHash();
    return shell;
  }

  if(host){
    const nativeInsert=host.insertAdjacentHTML;
    Object.defineProperty(host,"insertAdjacentHTML",{
      configurable:true,
      writable:true,
      value:function(position,html){
        const filtered=stripLearningBeforeParse(html);
        const result=nativeInsert.call(this,position,filtered);
        makeShell();
        return result;
      }
    });
  }else{
    lastError="system-host-missing";
  }

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
    if(!body)makeShell();
    if(!body)return false;
    if(body.dataset.learningHydration==="ready"){
      try{globalThis.atlasRebindLearningRuntime?.(body)||globalThis.atlasRebindLearningRuntime40442?.(body);}catch(_){}
      return true;
    }
    if(body.dataset.learningHydration==="loading"){
      try{await sourcePromise;}catch(_){}
      return body.dataset.learningHydration==="ready";
    }
    body.dataset.learningHydration="loading";
    try{
      const template=await sourceDocument();
      const nodes=sourceRange(template).map(node=>node.cloneNode(true));
      body.replaceChildren(...nodes);
      body.dataset.learningHydration="ready";
      hydrationCount+=1;
      try{globalThis.atlasRebindLearningRuntime?.(body)||globalThis.atlasRebindLearningRuntime40442?.(body);}catch(error){console.warn(`Agent-Crypto ${BUILD} · Learning runtime rebind failed`,error);}
      try{window.dispatchEvent(new CustomEvent("erith:learning-hydrated",{detail:{build:BUILD,target_id:String(targetId||"")}}));}catch(_){}
      if(targetId)requestAnimationFrame(()=>document.getElementById(targetId)?.scrollIntoView?.({block:"start",behavior:"smooth"}));
      return true;
    }catch(error){
      body.dataset.learningHydration="error";
      body.innerHTML=`<div class="learning-lazy-placeholder"><b>Présentation Learning indisponible</b><span>${String(error?.message||error||"Erreur inconnue")}</span></div>`;
      console.warn(`Agent-Crypto ${BUILD} · Learning hydration failed`,error);
      return false;
    }
  }

  const LEARNING_IDS=new Set([FIRST_ID,LAST_ID,"learningJourneyCockpit","learningFoundationPanel","learningFoundationLab","learningLessonPanel","learningCompletionPanel","learningIntegrityPanel"]);
  function hashTarget(){const id=decodeURIComponent(String(location.hash||"").replace(/^#/,""));return LEARNING_IDS.has(id)?id:"";}
  function hydrateHash(){const id=hashTarget();if(!id)return;if(!shell)makeShell();if(!shell)return;shell.open=true;ensure(id);}
  window.addEventListener("hashchange",hydrateHash,{passive:true});

  function snapshot(){return Object.freeze({build:BUILD,state:body?.dataset?.learningHydration||"parser-gate-armed",source:SOURCE,source_fetch_count:sourceFetchCount,hydration_count:hydrationCount,parser_strip_count:parserStripCount,parser_stripped_chars:parserStrippedChars,parser_learning_removed_before_dom:parserStripCount>0,last_error:lastError||null,runtime_owner:"app.js",runtime_rebind:"atlasRebindLearningRuntime",indexeddb_schema_changed:false,learning_state_reset:false,new_timer:false,new_observer:false,new_storage_owner:false,business_engine_changed:false});}
  const api=Object.freeze({build:BUILD,source:SOURCE,ensure,snapshot,runtime_owner:"app.js",parser_gate:true,indexeddb_schema_changed:false,learning_state_reset:false,new_timer:false,new_observer:false,new_storage_owner:false,business_engine_changed:false});
  globalThis.ErithLearningPresentation=api;
  globalThis.ErithLearningPresentation40445=api;
  globalThis.ErithLearningPresentation40444=api;
  globalThis.ErithLearningPresentation40443=api; // compatibility alias for 40.4.43 callers
  globalThis.__AGENT_CRYPTO_LEARNING_PRESENTATION_40445__=snapshot();
})();
