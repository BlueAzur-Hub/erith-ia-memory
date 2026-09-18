/* Agent-Crypto @erith.IA — 40.6.245
   INTELLIGENCE / MEMORY / CREATION HYDRATION RECOVERY

   Re-arms existing Atlas cold-body owners after presentation residency restore.
   No duplicated body source, no second runtime owner, no timer or observer.
*/
(() => {
  "use strict";

  const BUILD="40.6.245";
  const COLD_KEYS=Object.freeze(["auto-reader","shared-memory","github-memory"]);
  const AUDIT_KEYS=Object.freeze(["stable-stack","analytical-truth","frame-truth","current-truth"]);
  let rearmCount=0;
  let hydrationRequests=0;

  function owner(){return globalThis.AgentCryptoAtlasPeripheralLazy||globalThis.AgentCryptoAtlasColdRouter||null;}

  function detailsFor(key){
    return document.querySelector(`details[data-collapse-key="${CSS.escape(key)}"]`)
      || document.getElementById(key);
  }

  function ensureCold(key,reason="operator"){
    const detail=detailsFor(key);
    if(!(detail instanceof HTMLDetailsElement)||detail.open!==true)return false;
    const api=owner();
    api?.attach?.();
    if(typeof api?.ensureBody==="function"){
      hydrationRequests+=1;
      void Promise.resolve(api.ensureBody(key)).catch(error=>console.warn("[40.6.245] Atlas hydrate",key,reason,error));
      return true;
    }
    return false;
  }

  function bindCold(key){
    const detail=detailsFor(key);
    if(!(detail instanceof HTMLDetailsElement)||detail.dataset.intelligenceRecovery406245==="1")return false;
    detail.dataset.intelligenceRecovery406245="1";
    detail.addEventListener("toggle",()=>{if(detail.open)ensureCold(key,"toggle");});
    detail.addEventListener("erith:presentation-resident",()=>{if(detail.open)ensureCold(key,"resident");});
    if(detail.open)ensureCold(key,"boot-open");
    rearmCount+=1;
    return true;
  }

  function bindAudit(key){
    const root=document.querySelector(`[data-atlas-current-audit-open="${CSS.escape(key)}"]`)?.closest("section,article,details,div");
    const button=document.querySelector(`[data-atlas-current-audit-open="${CSS.escape(key)}"]`);
    if(!(button instanceof HTMLElement)||button.dataset.intelligenceRecovery406245==="1")return false;
    button.dataset.intelligenceRecovery406245="1";
    button.addEventListener("click",()=>{
      const api=owner();
      if(typeof api?.ensureAudit==="function"){
        hydrationRequests+=1;
        void Promise.resolve(api.ensureAudit(key)).catch(error=>console.warn("[40.6.245] Atlas audit hydrate",key,error));
      }
    },true);
    rearmCount+=1;
    return !!root||true;
  }

  function bindBook(){
    document.querySelectorAll('[data-atlas-current-audit-open="book-readonly"],[data-atlas-current-audit-open="knowledge-library"]').forEach(button=>{
      if(!(button instanceof HTMLElement)||button.dataset.intelligenceRecovery406245==="1")return;
      button.dataset.intelligenceRecovery406245="1";
      button.addEventListener("click",()=>{
        const api=owner();
        if(typeof api?.ensureBookKnowledge==="function"){
          hydrationRequests+=1;
          void Promise.resolve(api.ensureBookKnowledge()).catch(error=>console.warn("[40.6.245] Atlas Book hydrate",error));
        }
      },true);
      rearmCount+=1;
    });
  }

  function bind(){
    owner()?.attach?.();
    COLD_KEYS.forEach(bindCold);
    AUDIT_KEYS.forEach(bindAudit);
    bindBook();

    const hot=document.getElementById("atlas-local-ai-collapse");
    if(hot instanceof HTMLDetailsElement&&hot.dataset.intelligenceRecovery406245!=="1"){
      hot.dataset.intelligenceRecovery406245="1";
      hot.addEventListener("erith:presentation-resident",()=>owner()?.attach?.());
      hot.addEventListener("toggle",()=>{if(hot.open)owner()?.attach?.();});
      rearmCount+=1;
    }
    return true;
  }

  globalThis.AgentCryptoIntelligenceFamilyRecovery406245=Object.freeze({
    build:BUILD,bind,ensureCold,
    snapshot:()=>Object.freeze({
      build:BUILD,rearm_count:rearmCount,hydration_requests:hydrationRequests,
      cold_keys:COLD_KEYS,audit_keys:AUDIT_KEYS,
      existing_owner_reused:true,new_body_source:false,new_fetch_owner:false,
      new_timer:false,new_observer:false,new_storage_owner:false,
      atlas_current_algorithm_changed:false,oracle_changed:false,strategy_a_changed:false
    })
  });

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});
  else bind();
})();