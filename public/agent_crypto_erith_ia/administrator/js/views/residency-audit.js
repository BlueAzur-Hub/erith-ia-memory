/* Agent-Crypto @erith.IA — 40.4.18
   RESIDENCY LIFECYCLE AUDIT / READ-ONLY MANUAL DIAGNOSTIC
   No automatic sweep, no timer, observer, fetch, storage write or DOM mutation.
   The audit reads the 40.4.11+ same-node residency registry and reports invariants only. */
(()=>{
  "use strict";
  const BUILD="40.4.18";
  const life=globalThis.ErithPresentationLifecycle;
  const PROTECTED=Object.freeze(["#analyste","#detailPanel"]);
  const now=()=>new Date().toISOString();
  const safeCount=node=>{try{return node?1+node.querySelectorAll("*").length:0;}catch{return node?1:0;}};
  const duplicateIds=()=>{
    const seen=new Map(),dupes=[];
    document.querySelectorAll("[id]").forEach(node=>{
      const id=String(node.id||""); if(!id)return;
      const count=(seen.get(id)||0)+1; seen.set(id,count); if(count===2)dupes.push(id);
    });
    return dupes;
  };
  const protectedSnapshot=()=>PROTECTED.map(selector=>{
    const node=document.querySelector(selector);
    return Object.freeze({selector,exists:!!node,connected:node?.isConnected===true,subtree_nodes:safeCount(node)});
  });
  function run(){
    const lifecyclePresent=!!life;
    const registrations=lifecyclePresent&&typeof life.residencySnapshot==="function"?life.residencySnapshot():[];
    const measurements=lifecyclePresent&&typeof life.measurementSnapshot==="function"?life.measurementSnapshot():[];
    const violations=[];
    protectedSnapshot().forEach(item=>{
      if(!item.exists)violations.push(`protected-missing:${item.selector}`);
      else if(!item.connected)violations.push(`protected-disconnected:${item.selector}`);
    });
    const ids=duplicateIds();
    ids.forEach(id=>violations.push(`duplicate-id:${id}`));
    registrations.forEach(reg=>{
      (reg.records||[]).forEach(record=>{
        if(record.open&&record.detached)violations.push(`open-detached:${reg.id}:${record.key}`);
        if(!record.connected)violations.push(`details-disconnected:${reg.id}:${record.key}`);
      });
    });
    const detachedRecords=registrations.reduce((n,reg)=>n+(reg.records||[]).filter(r=>r.detached).length,0);
    const cachedNodes=registrations.reduce((n,reg)=>n+(reg.records||[]).reduce((s,r)=>s+(Number(r.cached_nodes)||0),0),0);
    return Object.freeze({
      build:BUILD,
      generated_at:now(),
      mode:"read-only-manual-audit",
      lifecycle_present:lifecyclePresent,
      lifecycle_build:String(life?.build||""),
      active_registrations:Number(life?.activeRegistrations?.()||0),
      protected_cockpit:Object.freeze(protectedSnapshot()),
      duplicate_ids:Object.freeze(ids),
      detached_records:detachedRecords,
      cached_subtree_nodes:cachedNodes,
      measurements,
      registrations,
      healthy:violations.length===0,
      violations:Object.freeze(violations),
      mutations_performed:false,
      timer_added:false,
      observer_added:false,
      fetch_added:false,
      storage_write_added:false,
      engine_state_changed:false
    });
  }
  const api=Object.freeze({build:BUILD,run,protected_selectors:PROTECTED,read_only:true,automatic_run:false,timer_added:false,observer_added:false,fetch_added:false,storage_write_added:false,dom_mutation_added:false});
  globalThis.ErithResidencyAudit40418=api;
})();
