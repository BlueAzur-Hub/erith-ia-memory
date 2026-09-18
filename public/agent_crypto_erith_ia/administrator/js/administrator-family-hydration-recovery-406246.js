/* Agent-Crypto @erith.IA — 40.6.246
   ADMINISTRATOR FAMILY HYDRATION RECOVERY
   System / Operations / Projects compatibility rearm.

   Reuses existing presentation owners and existing lifecycle.
   No replacement markup, no duplicate body source, no polling, no observer.
*/
(() => {
  "use strict";

  const BUILD="40.6.246";
  const OWNER_DEFS=Object.freeze([
    Object.freeze({name:"operations",global:"ErithOperationsPresentation"}),
    Object.freeze({name:"system",global:"ErithSystemPresentation"}),
    Object.freeze({name:"projects",global:"ErithProjectsPresentation"})
  ]);

  let bound=0;
  let ensureRequests=0;
  let routeRecoveries=0;

  function api(def){return globalThis[def.global]||null;}

  function entries(def){
    const owner=api(def);
    if(!owner)return [];
    const keys=Array.isArray(owner.keys)?owner.keys:[];
    const anchors=owner.anchors&&typeof owner.anchors==="object"?owner.anchors:{};
    return keys.map(key=>Object.freeze({
      key,
      anchor:String(anchors[key]||key)
    }));
  }

  function detailFor(key){
    return document.querySelector(`details[data-collapse-key="${CSS.escape(String(key))}"]`);
  }

  function ensure(def,key,reason="operator"){
    const owner=api(def);
    const detail=detailFor(key);
    if(!owner||typeof owner.ensureBody!=="function"||!(detail instanceof HTMLDetailsElement)||detail.open!==true)return false;
    ensureRequests+=1;
    void Promise.resolve(owner.ensureBody(key)).catch(error=>{
      console.warn(`[40.6.246] ${def.name} hydration recovery`,key,reason,error);
    });
    return true;
  }

  function bindEntry(def,entry){
    const detail=detailFor(entry.key);
    if(!(detail instanceof HTMLDetailsElement))return false;
    const marker=`administratorFamilyRecovery406246${def.name}`;
    if(detail.dataset[marker]==="1")return false;
    detail.dataset[marker]="1";
    detail.addEventListener("toggle",()=>{
      if(detail.open)ensure(def,entry.key,"toggle");
    });
    detail.addEventListener("erith:presentation-resident",()=>{
      if(detail.open)ensure(def,entry.key,"resident");
    });
    if(detail.open)ensure(def,entry.key,"boot-open");
    bound+=1;
    return true;
  }

  function targetMatch(id){
    const target=String(id||"").replace(/^#/,"");
    if(!target)return null;
    for(const def of OWNER_DEFS){
      for(const entry of entries(def)){
        if(target===entry.key||target===entry.anchor)return {def,entry};
      }
    }
    return null;
  }

  function recoverRoute(id,reason="route"){
    const hit=targetMatch(id);
    if(!hit)return false;
    const {def,entry}=hit;
    const lifecycle=globalThis.ErithPresentationLifecycle;
    try{lifecycle?.restoreForHash?.(`#${entry.anchor}`);}catch(_){}
    const detail=detailFor(entry.key);
    if(!(detail instanceof HTMLDetailsElement))return false;
    if(!detail.open)detail.open=true;
    queueMicrotask(()=>ensure(def,entry.key,reason));
    routeRecoveries+=1;
    return true;
  }

  function bindRoutes(){
    if(document.documentElement.dataset.administratorFamilyRouteRecovery406246==="1")return;
    document.documentElement.dataset.administratorFamilyRouteRecovery406246="1";
    document.addEventListener("click",event=>{
      const anchor=event.target instanceof Element?event.target.closest('a[href^="#"]'):null;
      if(!anchor)return;
      const id=anchor.getAttribute("href")||"";
      recoverRoute(id,"anchor");
    },true);
    window.addEventListener("hashchange",()=>recoverRoute(location.hash,"hash"),{passive:true});
  }

  function bind(){
    OWNER_DEFS.forEach(def=>entries(def).forEach(entry=>bindEntry(def,entry)));
    bindRoutes();
    recoverRoute(location.hash,"boot-hash");
    return true;
  }

  function snapshot(){
    const owners={};
    OWNER_DEFS.forEach(def=>{
      const owner=api(def);
      owners[def.name]=Object.freeze({
        present:!!owner,
        keys:entries(def).map(x=>x.key),
        owner_snapshot:typeof owner?.snapshot==="function"?owner.snapshot():null
      });
    });
    return Object.freeze({
      build:BUILD,bound,ensure_requests:ensureRequests,route_recoveries:routeRecoveries,
      owners:Object.freeze(owners),
      existing_owners_reused:true,replacement_markup:false,new_body_source:false,
      new_timer:false,new_observer:false,new_storage_owner:false,new_business_network_owner:false,
      market_core_changed:false,atlas_changed:false,oracle_changed:false,strategy_a_changed:false
    });
  }

  globalThis.AgentCryptoAdministratorFamilyHydrationRecovery406246=Object.freeze({
    build:BUILD,bind,recoverRoute,snapshot,
    new_timer:false,new_observer:false,new_storage_owner:false,new_business_network_owner:false
  });

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});
  else bind();
})();