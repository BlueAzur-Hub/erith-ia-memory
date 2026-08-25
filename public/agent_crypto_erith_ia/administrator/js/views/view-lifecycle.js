/* Agent-Crypto @erith.IA — 40.4.11
   PRESENTATION VIEW LIFECYCLE REGISTRY / MEASUREMENT-ONLY BASE
   40.4.11 activates no residency registration by itself.
   Later builds may register specific closed <details> bodies one family at a time.
   Same-node detach only: no clone, fetch, timer, observer, storage write or engine OFF. */
(()=>{
  "use strict";
  const BUILD="40.4.18";
  const DEFINITIONS=Object.freeze([
    Object.freeze({id:"projects",label:"Projet @erith.IA · Missions de vie",source:"./views/projects.html",roots:Object.freeze(["#missions-vie",'[data-collapse-key="fonds-erith"]','[data-collapse-key="association-erith"]','[data-collapse-key="aerith-enfance"]','[data-collapse-key="aerith-animaux"]','[data-collapse-key="aerith-terre-vivante"]']),risk:"low"}),
    Object.freeze({id:"operations",label:"03 · Préparation & opérations",source:"./views/operations.html",roots:Object.freeze([".atlas-layout-family-operations",'[data-collapse-key="situation"]','[data-collapse-key="questionnaire"]','[data-collapse-key="briefing"]','[data-collapse-key="planning"]']),risk:"low"}),
    Object.freeze({id:"system",label:"04 · Expérimentation & système",source:"./views/system.html",roots:Object.freeze([".atlas-layout-family-system","#atlasStorageHealth40198","#atlasGreyPlateForensic40393",'[data-collapse-key="simulation"]','[data-collapse-key="commandes"]','[data-collapse-key="backend"]','[data-collapse-key="safety"]','[data-collapse-key="physical-security"]']),risk:"medium"}),
    Object.freeze({id:"atlas",label:"02 · Intelligence, mémoire & création",source:"./views/atlas.html",roots:Object.freeze(["#atlas-local-ai-collapse",'[data-collapse-key="auto-reader"]','[data-collapse-key="shared-memory"]','[data-collapse-key="github-memory"]']),risk:"high"}),
    Object.freeze({id:"oracle",label:"Oracle · Analyse prospective & preuves",source:"./views/oracle.html",roots:Object.freeze(["#oracle-models-calibration",'[data-collapse-key="oracle-sources-runtime"]',"#oracle-evidence-explorer"]),risk:"high"})
  ]);
  const registrations=[];
  /* 40.4.17 — protected cockpit exclusion. Demand-residency is for extracted
     Administrator families only. Graphique + Lecture Technique are canonical
     always-resident cockpit owners and must never be detached by this registry. */
  const PROTECTED_COCKPIT_SELECTORS=Object.freeze(["#analyste","#detailPanel"]);
  const protectedCockpitNode=node=>Boolean(node?.closest?.(PROTECTED_COCKPIT_SELECTORS.join(",")));
  let bridgesBound=false,loadSweepBound=false;
  const uniq=items=>[...new Set(items.filter(Boolean))];
  const nodesFor=def=>uniq(def.roots.flatMap(selector=>[...document.querySelectorAll(selector)]));
  const subtreeCount=node=>{try{return 1+node.querySelectorAll("*").length;}catch{return 1;}};
  const measurementSnapshot=()=>Object.freeze(DEFINITIONS.map(def=>{
    const roots=nodesFor(def);
    return Object.freeze({id:def.id,label:def.label,source:def.source,risk:def.risk,roots:roots.length,subtree_nodes:roots.reduce((sum,node)=>sum+subtreeCount(node),0),connected:roots.filter(node=>node.isConnected).length});
  }));
  const bodyNodes=detail=>{const summary=detail.querySelector(":scope > summary");return [...detail.childNodes].filter(node=>node!==summary);};
  const findRecord=detail=>registrations.flatMap(reg=>reg.records).find(record=>record.detail===detail)||null;
  function ensureRecord(reg,detail){let record=reg.records.find(item=>item.detail===detail);if(record)return record;record={detail,nodes:[],fragment:null,detached:false,detach_count:0,restore_count:0,last_detached_at:null,last_restored_at:null};reg.records.push(record);return record;}
  function detachRecord(record){const detail=record.detail;if(!(detail instanceof HTMLDetailsElement)||detail.open||record.detached)return false;record.nodes=bodyNodes(detail);if(!record.nodes.length)return false;const fragment=document.createDocumentFragment();record.nodes.forEach(node=>fragment.appendChild(node));record.fragment=fragment;record.detached=true;record.detach_count+=1;record.last_detached_at=new Date().toISOString();detail.dataset.presentationResidency="detached";return true;}
  function restoreRecord(record){if(!record?.detached)return false;const detail=record.detail;if(record.fragment?.childNodes?.length)detail.appendChild(record.fragment);else record.nodes.forEach(node=>detail.appendChild(node));record.detached=false;record.restore_count+=1;record.last_restored_at=new Date().toISOString();detail.dataset.presentationResidency="resident";try{detail.dispatchEvent(new CustomEvent("erith:presentation-resident",{bubbles:false,detail:{registration:record.registration_id||""}}));}catch(_){}return true;}
  function cachedContainsId(record,id){if(!record?.detached||!id)return false;return record.nodes.some(node=>{if(node.nodeType!==1)return false;if(node.id===id)return true;try{return [...node.querySelectorAll("[id]")].some(child=>child.id===id);}catch{return false;}});}
  function restoreForHash(hash){const id=decodeURIComponent(String(hash||"").replace(/^#/,""));if(!id)return false;const record=registrations.flatMap(reg=>reg.records).find(item=>cachedContainsId(item,id));if(!record)return false;restoreRecord(record);record.detail.open=true;return true;}
  function bindBridges(){if(bridgesBound)return;bridgesBound=true;document.addEventListener("click",event=>{const anchor=event.target?.closest?.('a[href^="#"]');if(anchor)restoreForHash(anchor.getAttribute("href"));},true);window.addEventListener("hashchange",()=>restoreForHash(location.hash));}
  function initialSweep(){registrations.forEach(reg=>reg.records.forEach(record=>{if(!record.detail.open)detachRecord(record);}));restoreForHash(location.hash);}
  function scheduleInitialSweep(){if(document.readyState==="complete"){initialSweep();return;}if(loadSweepBound)return;loadSweepBound=true;window.addEventListener("load",initialSweep,{once:true});}
  function registerClosedBodyFamily(config={}){
    const id=String(config.id||"").trim();if(!id||registrations.some(reg=>reg.id===id))return registrations.find(reg=>reg.id===id)||null;
    const selectors=Object.freeze([...(config.selectors||[])].map(String));
    const details=uniq(selectors.flatMap(selector=>[...document.querySelectorAll(selector)]))
      .filter(node=>node instanceof HTMLDetailsElement)
      .filter(node=>!protectedCockpitNode(node));
    const reg={id,label:String(config.label||id),selectors,details,records:[],registered_at:new Date().toISOString()};
    details.forEach(detail=>{const record=ensureRecord(reg,detail);record.registration_id=id;detail.querySelector(":scope > summary")?.addEventListener("click",()=>{if(!detail.open)restoreRecord(record);},true);detail.addEventListener("toggle",()=>{if(detail.open)restoreRecord(record);else detachRecord(record);});});
    registrations.push(reg);bindBridges();scheduleInitialSweep();restoreForHash(location.hash);return reg;
  }
  function residencySnapshot(){
    return Object.freeze(registrations.map(reg=>Object.freeze({
      id:reg.id,
      label:reg.label,
      selectors:reg.selectors,
      details:reg.details.length,
      records:Object.freeze(reg.records.map(record=>Object.freeze({
        key:String(record.detail?.dataset?.collapseKey||record.detail?.id||""),
        open:record.detail?.open===true,
        connected:record.detail?.isConnected===true,
        detached:record.detached===true,
        cached_nodes:record.nodes.reduce((sum,node)=>sum+subtreeCount(node),0),
        detach_count:record.detach_count,
        restore_count:record.restore_count,
        last_detached_at:record.last_detached_at,
        last_restored_at:record.last_restored_at
      })))
    })));
  }
  const api=Object.freeze({build:BUILD,mode:"measurement-only-until-registered",definitions:DEFINITIONS,measurementSnapshot,residencySnapshot,registerClosedBodyFamily,restoreForHash,activeRegistrations:()=>registrations.length,clone_used:false,fetch_added:false,timer_added:false,observer_added:false,storage_write_added:false,engine_state_changed:false,technical_reading_protected:true,protected_cockpit_selectors:PROTECTED_COCKPIT_SELECTORS});
  globalThis.ErithPresentationLifecycle=api;globalThis.ErithPresentationLifecycle40411=api;
})();
