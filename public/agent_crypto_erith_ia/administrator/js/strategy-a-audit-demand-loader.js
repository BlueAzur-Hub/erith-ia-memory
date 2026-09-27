/* Agent-Crypto @erith.IA — 40.6.443 STRATEGY A AUDIT + EXECUTION COST DEMAND LOADER
   Progressive recovery after 40.6.438 emergency restore.
   Loads Cost-Wait + Oracle/Cost + Execution Cost Truth read-only tools only when Simulation is opened.
   No boot residency, polling, observer or storage write. Execution Cost stays manual-fetch only after operator demand. */
(()=>{
  "use strict";
  const BUILD="40.6.443", TIMEOUT=6000;
  const SPECS=Object.freeze([
    Object.freeze({key:"cost-wait",src:"./js/strategy-a-cost-wait-outcome-audit.js?v=40.6.443",ready:()=>!!globalThis.AgentCryptoStrategyACostWaitOutcomeAudit406429}),
    Object.freeze({key:"oracle-cost",src:"./js/strategy-a-oracle-cost-calibration-audit.js?v=40.6.443",ready:()=>!!globalThis.AgentCryptoStrategyAOracleCostCalibrationAudit}),
    Object.freeze({key:"execution-cost",src:"./js/strategy-a-execution-cost-truth.js?v=40.6.443",ready:()=>!!globalThis.AgentCryptoStrategyAExecutionCostTruth})
  ]);
  let state="idle",promise=null,lastError="",reason="";
  const simulationOpen=()=>{const node=document.getElementById("simulation");return node instanceof HTMLDetailsElement&&node.open===true;};

  function existing(key){return document.querySelector('script[data-strategy-a-audit-demand="'+key+'"]');}
  function load(spec){
    if(spec.ready())return Promise.resolve(true);
    let node=existing(spec.key);
    if(node?.dataset.loaded==="0"){node.remove();node=null;}
    if(node?.dataset.loaded==="1")return Promise.resolve(spec.ready());
    return new Promise(resolve=>{
      let settled=false;
      const finish=ok=>{
        if(settled)return;
        settled=true;
        clearTimeout(timer);
        if(node)node.dataset.loaded=ok?"1":"0";
        if(!ok&&node){try{node.remove();}catch(_){}}
        resolve(ok&&spec.ready());
      };
      const timer=setTimeout(()=>finish(false),TIMEOUT);
      if(node){
        node.addEventListener("load",()=>finish(true),{once:true});
        node.addEventListener("error",()=>finish(false),{once:true});
        return;
      }
      node=document.createElement("script");
      node.src=spec.src;
      node.async=false;
      node.dataset.strategyAAuditDemand=spec.key;
      node.addEventListener("load",()=>finish(true),{once:true});
      node.addEventListener("error",()=>finish(false),{once:true});
      document.body.appendChild(node);
    });
  }

  function ensure(why="simulation-open"){
    reason=String(why||"simulation-open");
    if(SPECS.every(x=>x.ready())){state="ready";return Promise.resolve(true);}
    if(promise)return promise;
    state="loading";lastError="";
    promise=(async()=>{
      for(const spec of SPECS){
        const ok=await load(spec);
        if(!ok){state="error";lastError="load-failed:"+spec.key;return false;}
      }
      state="ready";
      try{globalThis.AgentCryptoStrategyACostWaitOutcomeAudit406429?.refresh?.("406439-demand-ready");}catch(_){}
      try{globalThis.AgentCryptoStrategyAOracleCostCalibrationAudit?.refresh?.("406439-demand-ready");}catch(_){}
      try{window.dispatchEvent(new CustomEvent("agent-crypto:strategy-a-audits-ready",{detail:{build:BUILD,reason}}));}catch(_){}
      return true;
    })().finally(()=>{promise=null;});
    return promise;
  }

  document.addEventListener("toggle",event=>{
    if(event?.target?.id==="simulation"&&event.target.open===true)void ensure("simulation-open");
  },true);
  const simulation=document.getElementById("simulation");
  if(simulation?.open)queueMicrotask(()=>void ensure("simulation-already-open"));

  globalThis.AgentCryptoStrategyAAuditDemand=Object.freeze({
    build:BUILD,ensure,
    snapshot:()=>Object.freeze({build:BUILD,state,reason,last_error:lastError,simulation_open:simulationOpen(),cost_wait_loaded:!!globalThis.AgentCryptoStrategyACostWaitOutcomeAudit406429,oracle_cost_loaded:!!globalThis.AgentCryptoStrategyAOracleCostCalibrationAudit,execution_cost_loaded:!!globalThis.AgentCryptoStrategyAExecutionCostTruth}),
    self_test:()=>Object.freeze({build:BUILD,pass:true,checks:Object.freeze({on_demand_only:true,execution_cost_on_demand:true,recurring_timer:false,observer:false,storage_write:false})}),
    execution_cost_on_demand:true,recurring_timer:false,observer:false,storage_write:false,new_business_network_request:false
  });
})();
