/* Agent-Crypto @erith.IA — 40.4.21
   RESIDENCY AUDIT TRUTH + OPERATOR EVIDENCE LOCK
   Read-only manual diagnostic. No automatic sweep, timer, observer, fetch,
   storage write, engine mutation or presentation mutation.

   40.4.19 corrects one diagnostic ambiguity from 40.4.18:
   - tracked_subtree_nodes = all nodes owned by registered records;
   - detached_subtree_nodes = only nodes currently held outside the connected DOM.
   The legacy cached_subtree_nodes alias is preserved and now means detached nodes. */
(()=>{
  "use strict";
  const BUILD="40.4.21";
  const PROTECTED=Object.freeze(["#analyste","#detailPanel"]);
  const EXPECTED_FAMILIES=Object.freeze(["projects","operations","system","atlas","oracle"]);
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
  const familyRollup=registrations=>Object.freeze(registrations.map(reg=>{
    const records=Array.isArray(reg?.records)?reg.records:[];
    const detached=records.filter(record=>record?.detached===true);
    const trackedNodes=records.reduce((sum,record)=>sum+(Number(record?.cached_nodes)||0),0);
    const detachedNodes=detached.reduce((sum,record)=>sum+(Number(record?.cached_nodes)||0),0);
    return Object.freeze({
      id:String(reg?.id||""),
      details:Number(reg?.details||records.length||0),
      records:records.length,
      detached_records:detached.length,
      resident_records:records.length-detached.length,
      tracked_subtree_nodes:trackedNodes,
      detached_subtree_nodes:detachedNodes
    });
  }));
  function run(){
    const life=globalThis.ErithPresentationLifecycle;
    const lifecyclePresent=!!life;
    const registrations=lifecyclePresent&&typeof life.residencySnapshot==="function"?life.residencySnapshot():[];
    const measurements=lifecyclePresent&&typeof life.measurementSnapshot==="function"?life.measurementSnapshot():[];
    const protectedState=protectedSnapshot();
    const ids=duplicateIds();
    const violations=[];
    if(!lifecyclePresent)violations.push("lifecycle-missing");
    protectedState.forEach(item=>{
      if(!item.exists)violations.push(`protected-missing:${item.selector}`);
      else if(!item.connected)violations.push(`protected-disconnected:${item.selector}`);
    });
    ids.forEach(id=>violations.push(`duplicate-id:${id}`));
    const registrationIds=registrations.map(reg=>String(reg?.id||"")).filter(Boolean);
    EXPECTED_FAMILIES.forEach(id=>{if(!registrationIds.includes(id))violations.push(`missing-registration:${id}`);});
    registrationIds.forEach(id=>{if(!EXPECTED_FAMILIES.includes(id))violations.push(`unexpected-registration:${id}`);});
    registrations.forEach(reg=>{
      (reg.records||[]).forEach(record=>{
        if(record.open&&record.detached)violations.push(`open-detached:${reg.id}:${record.key}`);
        if(!record.connected)violations.push(`details-disconnected:${reg.id}:${record.key}`);
      });
    });
    const rollup=familyRollup(registrations);
    const lazyTransports=Object.freeze({
      projects:globalThis.ErithProjectsPresentation40420?.snapshot?.()||null,
      operations:globalThis.ErithOperationsPresentation40421?.snapshot?.()||null
    });
    const totalRecords=rollup.reduce((n,item)=>n+item.records,0);
    const detachedRecords=rollup.reduce((n,item)=>n+item.detached_records,0);
    const trackedNodes=rollup.reduce((n,item)=>n+item.tracked_subtree_nodes,0);
    const detachedNodes=rollup.reduce((n,item)=>n+item.detached_subtree_nodes,0);
    return Object.freeze({
      build:BUILD,
      generated_at:now(),
      mode:"read-only-manual-audit",
      lifecycle_present:lifecyclePresent,
      lifecycle_build:String(life?.build||""),
      expected_registrations:EXPECTED_FAMILIES.length,
      active_registrations:Number(life?.activeRegistrations?.()||0),
      registered_records:totalRecords,
      protected_cockpit:Object.freeze(protectedState),
      duplicate_ids:Object.freeze(ids),
      detached_records:detachedRecords,
      resident_records:totalRecords-detachedRecords,
      tracked_subtree_nodes:trackedNodes,
      detached_subtree_nodes:detachedNodes,
      cached_subtree_nodes:detachedNodes,
      family_rollup:rollup,
      lazy_transports:lazyTransports,
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
  const api=Object.freeze({
    build:BUILD,
    run,
    protected_selectors:PROTECTED,
    expected_families:EXPECTED_FAMILIES,
    read_only:true,
    automatic_run:false,
    timer_added:false,
    observer_added:false,
    fetch_added:false,
    storage_write_added:false,
    dom_mutation_added:false
  });
  globalThis.ErithResidencyAudit40419=api;
  globalThis.ErithResidencyAudit=api;
})();
