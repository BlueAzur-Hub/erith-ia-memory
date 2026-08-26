/* Agent-Crypto @erith.IA — 40.4.35
   ATLAS PRESENTATION LAZY OWNER · CURRENT AUDIT WAVE 1
   Existing 40.4.30 owners are preserved: Auto Reader + Shared Memory + GitHub Memory
   presentation bodies hydrate on first disclosure while their runtimes remain resident.
   40.4.31 additionally removes only four read-only CURRENT audit bodies at boot:
   Stable Stack, Analytical Truth, Snapshot/LIVE Truth and CURRENT Transaction Truth.
   Their section roots remain connected so runtime ownership/state can continue safely;
   first operator disclosure restores the exact canonical inner markup from views/atlas.html
   and asks app.js to render the already-owned state. No timer, observer or storage owner added. */
(()=>{
  "use strict";
  const BUILD="40.4.35";
  const SOURCE="./views/atlas.html";
  const TARGETS=Object.freeze({
    "auto-reader":Object.freeze({label:"Atlas Auto Reader"}),
    "shared-memory":Object.freeze({label:"Shared Memory"}),
    "github-memory":Object.freeze({label:"GitHub Memory"})
  });
  const BOOK_KNOWLEDGE_SECTIONS=Object.freeze({
    "book-readonly":Object.freeze({id:"atlasBookReadOnlyKnowledge",titleId:"atlasBookReadOnlyTitle",eyebrow:"SHARED READ-ONLY KNOWLEDGE · RYZEN → BOOK",title:"Miroir et lecture Book",subtitle:"Runtime et mémoire conservés · présentation chargée à la demande"}),
    "knowledge-library":Object.freeze({id:"atlasKnowledgeLibrary",titleId:"atlasKnowledgeLibraryTitle",eyebrow:"BIBLIOTHÈQUE PÉDAGOGIQUE PERMANENTE · SANS BRIDGE",title:"Dictionnaire Crypto / Banque / Bourse",subtitle:"56 définitions conservées · cartes et contrôles chargés à la demande"})
  });
  const AUDIT_SECTIONS=Object.freeze({
    "stable-stack":Object.freeze({
      id:"atlasStableStack",
      titleId:"atlasStableStackTitle",
      eyebrow:"PILE STABLE CONSOLIDÉE · PRODUCTION / LECTURE",
      title:"Interface, Control Center, Bridge et mémoire",
      subtitle:"État déjà calculé · matérialiser les détails à la demande"
    }),
    "analytical-truth":Object.freeze({
      id:"atlasAnalyticalTruth",
      titleId:"atlasAnalyticalTruthTitle",
      eyebrow:"VÉRITÉ ANALYTIQUE · EMPREINTE V2",
      title:"Contexte, sources, preuves et qualité statistique",
      subtitle:"Lecture seule · aucun recalcul déclenché par l’ouverture"
    }),
    "frame-truth":Object.freeze({
      id:"atlasFrameTruth",
      titleId:"atlasFrameTruthTitle",
      eyebrow:"COHÉRENCE TEMPORELLE · SNAPSHOT / LIVE",
      title:"Snapshot analysé et marché live",
      subtitle:"Présentation différée · état runtime conservé"
    }),
    "current-truth":Object.freeze({
      id:"atlasCurrentTruth33",
      titleId:"atlasCurrentTruth33Title",
      eyebrow:"CURRENT TRUTH · ÉTAT TRANSACTIONNEL",
      title:"Pourquoi cette analyse est CURRENT",
      subtitle:"Relit seulement l’état produit par le pipeline"
    })
  });
  const nativeInsert=Element.prototype.insertAdjacentHTML;
  let armed=true;
  let sourcePromise=null;
  let fetchCount=0;
  const hydrated=new Set();
  const auditHydrated=new Set();
  let bookKnowledgeHydrated=false;

  function escRe(value){return String(value).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");}
  function detailsBounds(source,key){
    const re=new RegExp(`<details\\b[^>]*data-collapse-key=["']${escRe(key)}["'][^>]*>`,`i`);
    const hit=re.exec(source);
    if(!hit)return null;
    const start=hit.index;
    const summaryClose=source.indexOf("</summary>",start);
    if(summaryClose<0)return null;
    const bodyStart=summaryClose+"</summary>".length;
    const close=source.indexOf("</details>",bodyStart);
    if(close<0)return null;
    return {start,bodyStart,close};
  }
  function sectionBounds(source,id){
    const re=new RegExp(`<section\\b[^>]*\\bid=["']${escRe(id)}["'][^>]*>`,`i`);
    const hit=re.exec(source);
    if(!hit)return null;
    const start=hit.index;
    const openEnd=start+hit[0].length;
    const token=/<\/?section\b[^>]*>/ig;
    token.lastIndex=start;
    let depth=0;
    let match;
    while((match=token.exec(source))){
      if(/^<\/section/i.test(match[0])) depth-=1;
      else depth+=1;
      if(depth===0){
        return {start,openEnd,close:match.index,end:token.lastIndex};
      }
    }
    return null;
  }
  function shellBody(key){
    const label=TARGETS[key]?.label||key;
    return `\n      <div class="atlas-collapse-body atlas-peripheral-lazy-body-40425" data-atlas-peripheral-lazy="${key}" data-atlas-hydrated-40425="0"><p class="atlas-local-response-empty">${label} · contenu chargé uniquement à l’ouverture.</p></div>\n    `;
  }
  function stripBody(source,key){
    const b=detailsBounds(source,key);
    if(!b)return source;
    return source.slice(0,b.bodyStart)+shellBody(key)+source.slice(b.close);
  }
  function auditShell(key,spec){
    return `\n        <div class="section-head compact atlas-current-audit-shell-40431" data-atlas-current-audit-shell-40431="${key}">\n          <div>\n            <p class="eyebrow">${spec.eyebrow}</p>\n            <h5 id="${spec.titleId}">${spec.title}</h5>\n            <p class="planning-intro">${spec.subtitle}</p>\n          </div>\n          <button class="btn" type="button" data-atlas-current-audit-open-40431="${key}" aria-controls="${spec.id}">Ouvrir les détails</button>\n        </div>\n      `;
  }
  function stripAuditSection(source,key,spec){
    const b=sectionBounds(source,spec.id);
    if(!b)return source;
    return source.slice(0,b.openEnd)+auditShell(key,spec)+source.slice(b.close);
  }
  function preprocess(source){
    let next=String(source||"");
    for(const key of Object.keys(TARGETS)) next=stripBody(next,key);
    for(const [key,spec] of Object.entries(AUDIT_SECTIONS)) next=stripAuditSection(next,key,spec);
    for(const [key,spec] of Object.entries(BOOK_KNOWLEDGE_SECTIONS)) next=stripAuditSection(next,key,spec);
    return next;
  }
  function targetDetails(key){return document.querySelector(`details[data-collapse-key="${key}"]`);}
  function sourceText(){
    if(!sourcePromise){
      fetchCount+=1;
      sourcePromise=fetch(SOURCE,{cache:"force-cache",credentials:"same-origin"}).then(response=>{
        if(!response.ok)throw new Error(`Atlas source HTTP ${response.status}`);
        return response.text();
      });
    }
    return sourcePromise;
  }
  function bodyHtml(source,key){
    const b=detailsBounds(source,key);
    if(!b)throw new Error(`Atlas lazy source missing: ${key}`);
    const fragment=source.slice(b.bodyStart,b.close);
    const template=document.createElement("template");
    template.innerHTML=fragment;
    const body=template.content.querySelector(":scope > .atlas-collapse-body")||template.content.querySelector(".atlas-collapse-body");
    if(!body)throw new Error(`Atlas lazy body missing: ${key}`);
    return body.innerHTML;
  }
  function auditInnerHtml(source,spec){
    const b=sectionBounds(source,spec.id);
    if(!b)throw new Error(`Atlas audit source missing: ${spec.id}`);
    return source.slice(b.openEnd,b.close);
  }
  async function hydrate(key){
    if(hydrated.has(key))return true;
    const details=targetDetails(key);
    if(!details)return false;
    details.dataset.atlasHydration40425="loading";
    try{
      const source=await sourceText();
      if(!details.open)return false;
      const body=details.querySelector(":scope > .atlas-collapse-body");
      if(!body)return false;
      const template=document.createElement("template");
      template.innerHTML=bodyHtml(source,key);
      body.replaceChildren(template.content.cloneNode(true));
      body.dataset.atlasHydrated40425="1";
      details.dataset.atlasHydration40425="ready";
      hydrated.add(key);
      try{
        const owner=globalThis.AgentCryptoAtlasPeripheralRebind||globalThis.AgentCryptoAtlasPeripheralRebind40425;
        owner?.rebind?.(key);
      }catch(error){console.warn("[40.4.31] Atlas peripheral rebind",error);}
      try{details.dispatchEvent(new CustomEvent("erith:presentation-resident",{bubbles:true,detail:{family:"atlas",key,build:BUILD}}));}catch(_){}
      return true;
    }catch(error){
      details.dataset.atlasHydration40425="error";
      const body=details.querySelector(":scope > .atlas-collapse-body");
      if(body)body.innerHTML=`<p class="atlas-local-response-empty">Chargement différé indisponible · ${String(error?.message||error)}</p>`;
      return false;
    }
  }
  async function hydrateAudit(key){
    if(auditHydrated.has(key))return true;
    const spec=AUDIT_SECTIONS[key];
    const root=spec&&document.getElementById(spec.id);
    if(!spec||!root)return false;
    root.dataset.atlasAuditHydration40431="loading";
    try{
      const source=await sourceText();
      const template=document.createElement("template");
      template.innerHTML=auditInnerHtml(source,spec);
      root.replaceChildren(template.content.cloneNode(true));
      root.dataset.atlasAuditHydration40431="ready";
      auditHydrated.add(key);
      try{
        const owner=globalThis.AgentCryptoAtlasPeripheralRebind||globalThis.AgentCryptoAtlasPeripheralRebind40425;
        owner?.rebind?.("current-audit");
      }catch(error){console.warn("[40.4.31] Atlas CURRENT audit rebind",error);}
      try{root.dispatchEvent(new CustomEvent("erith:presentation-resident",{bubbles:true,detail:{family:"atlas",key:`current-audit:${key}`,build:BUILD}}));}catch(_){}
      return true;
    }catch(error){
      root.dataset.atlasAuditHydration40431="error";
      const shell=root.querySelector("[data-atlas-current-audit-shell-40431]");
      if(shell){
        const note=shell.querySelector(".planning-intro");
        if(note)note.textContent=`Chargement différé indisponible · ${String(error?.message||error)}`;
      }
      return false;
    }
  }
  async function hydrateBookKnowledge(){
    if(bookKnowledgeHydrated)return true;
    const roots=Object.entries(BOOK_KNOWLEDGE_SECTIONS).map(([key,spec])=>[key,spec,document.getElementById(spec.id)]);
    if(roots.some(([, ,root])=>!root))return false;
    roots.forEach(([, ,root])=>root.dataset.atlasBookKnowledgeHydration40434="loading");
    try{
      const source=await sourceText();
      for(const [key,spec,root] of roots){
        const template=document.createElement("template");
        template.innerHTML=auditInnerHtml(source,spec);
        root.replaceChildren(template.content.cloneNode(true));
        root.dataset.atlasBookKnowledgeHydration40434="ready";
      }
      bookKnowledgeHydrated=true;
      try{globalThis.AgentCryptoAtlasPeripheralRebind?.rebind?.("book-knowledge");}catch(error){console.warn("[40.4.34] Atlas Book/Knowledge rebind",error);}
      roots.forEach(([key,,root])=>{try{root.dispatchEvent(new CustomEvent("erith:presentation-resident",{bubbles:true,detail:{family:"atlas",key:`book-knowledge:${key}`,build:BUILD}}));}catch(_){}});
      return true;
    }catch(error){
      roots.forEach(([, ,root])=>root.dataset.atlasBookKnowledgeHydration40434="error");
      return false;
    }
  }
  function attachPeripheral(){
    for(const key of Object.keys(TARGETS)){
      const details=targetDetails(key);
      if(!details||details.dataset.atlasPeripheralLazyReady40425==="1")continue;
      details.dataset.atlasPeripheralLazyReady40425="1";
      details.addEventListener("toggle",()=>{if(details.open)hydrate(key);});
      if(details.open)hydrate(key);
    }
  }
  function attachAudit(){
    for(const [key,spec] of Object.entries(AUDIT_SECTIONS)){
      const root=document.getElementById(spec.id);
      if(!root||root.dataset.atlasCurrentAuditReady40431==="1")continue;
      root.dataset.atlasCurrentAuditReady40431="1";
      const button=root.querySelector(`[data-atlas-current-audit-open-40431="${key}"]`);
      if(button)button.addEventListener("click",()=>hydrateAudit(key));
    }
  }
  function attachBookKnowledge(){
    for(const [key,spec] of Object.entries(BOOK_KNOWLEDGE_SECTIONS)){
      const root=document.getElementById(spec.id);
      if(!root||root.dataset.atlasBookKnowledgeReady40434==="1")continue;
      root.dataset.atlasBookKnowledgeReady40434="1";
      root.querySelector(`[data-atlas-current-audit-open-40431="${key}"]`)?.addEventListener("click",()=>hydrateBookKnowledge());
    }
  }
  function attach(){attachPeripheral();attachAudit();attachBookKnowledge();}

  Element.prototype.insertAdjacentHTML=function(position,html){
    if(armed&&this?.id==="atlas-view-host"&&String(position).toLowerCase()==="beforebegin"&&typeof html==="string"){
      const result=nativeInsert.call(this,position,preprocess(html));
      armed=false;
      Element.prototype.insertAdjacentHTML=nativeInsert;
      attach();
      try{
        const contract=Object.freeze({
          build:BUILD,
          source:SOURCE,
          targets:Object.keys(TARGETS),
          current_audit_targets:Object.keys(AUDIT_SECTIONS),
          book_knowledge_targets:Object.keys(BOOK_KNOWLEDGE_SECTIONS),
          boot_bodies_absent:true,
          current_audit_roots_resident:true,
          current_audit_bodies_absent_at_boot:true,
          fetch_count:()=>fetchCount,
          hydrated:()=>[...hydrated],
          current_audit_hydrated:()=>[...auditHydrated],
          book_knowledge_hydrated:()=>bookKnowledgeHydrated,
          runtime_owner:"app.js",
          auto_reader_runtime_preserved:true,
          auto_reader_collection_boot_preserved:true,
          github_auto_load_preserved:true,
          current_pipeline_runtime_preserved:true,
          current_audit_read_only_presentation:true,
          new_timer:false,
          new_observer:false,
          storage_owner_added:false
        });
        globalThis.AgentCryptoAtlasPeripheralLazy=contract;
        globalThis.__AGENT_CRYPTO_ATLAS_PERIPHERAL_LAZY_40425__=contract;
        globalThis.__AGENT_CRYPTO_ATLAS_CURRENT_AUDIT_LAZY_40431__=contract;
      }catch(_){}
      return result;
    }
    return nativeInsert.call(this,position,html);
  };
})();
