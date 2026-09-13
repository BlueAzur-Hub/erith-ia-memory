/* Agent-Crypto @erith.IA — Strategy A ↔ TRADUS Outcome Memory
   Administrator 40.6.117 bounded hotfix.
   Derived read-only evidence from the existing comparative shadow ledger.
   Measures the first later observed quote at/after T+5, T+15 and T+60.
   Late samples remain explicitly late. NO_TRADE/OFF/WAIT are never scored as directional calls.
   No fetch, recurring timer, MutationObserver, storage write, strategy mutation, wallet or order path. */
(()=>{
  "use strict";

  const OWNER="strategy-tradus-outcome-memory";
  const STATUS_ID="strategyTradusOutcomeMemoryStatus";
  const EVENT_NAME="agentcrypto:strategy-tradus-outcome-memory";
  const HORIZONS=Object.freeze([
    Object.freeze({key:"t5",label:"T+5",minutes:5,tolerance_seconds:120}),
    Object.freeze({key:"t15",label:"T+15",minutes:15,tolerance_seconds:300}),
    Object.freeze({key:"t60",label:"T+60",minutes:60,tolerance_seconds:900})
  ]);
  let lastModel=null;

  const clone=v=>{try{return JSON.parse(JSON.stringify(v));}catch(_){return null;}};
  const finite=v=>{if(v===null||v===undefined||typeof v==="boolean"||String(v).trim()==="")return null;const n=Number(v);return Number.isFinite(n)?n:null;};
  const upper=v=>String(v??"").trim().toUpperCase();
  const runtimeBuild=()=>String(globalThis.ErithVersionTruth?.build||new URLSearchParams(location.search||"").get("ac-build")||document.querySelector('meta[name="administrator-build"]')?.content||"40.6.117").trim();

  function midOf(row){
    const bid=finite(row?.bid??row?.tick?.bid);
    const ask=finite(row?.ask??row?.tick?.ask);
    if(bid===null||ask===null||bid<=0||ask<=0||bid>ask)return null;
    return (bid+ask)/2;
  }

  function atMs(row){
    const value=Date.parse(String(row?.at||""));
    return Number.isFinite(value)?value:null;
  }

  function tradusSignal(row){return upper(row?.signal?.action??row?.signal??"NO_TRADE")||"NO_TRADE";}
  function strategyDecision(row){
    const value=row?.strategy_a;
    if(value&&typeof value==="object")return upper(value.decision||value.phase||"INCONNU")||"INCONNU";
    return upper(value||"INCONNU")||"INCONNU";
  }
  function strategyDirection(row){
    const value=row?.strategy_a;
    const n=finite(value&&typeof value==="object"?value.direction_score:row?.strategy_a_direction);
    return n;
  }
  function comparisonState(row){
    const value=row?.comparison;
    if(value&&typeof value==="object")return upper(value.state||"COMPARAISON")||"COMPARAISON";
    return upper(value||"COMPARAISON")||"COMPARAISON";
  }

  function directionClaim(value){
    const state=upper(value);
    if(/\b(BUY|LONG)\b/.test(state))return "BUY";
    if(/\b(SELL|SHORT)\b/.test(state))return "SELL";
    return null;
  }

  function directionalOutcome(claim,returnRatio){
    if(!claim)return "NO_DIRECTIONAL_CLAIM";
    const r=finite(returnRatio);
    if(r===null)return "UNKNOWN";
    if(Math.abs(r)<1e-12)return "FLAT";
    if(claim==="BUY")return r>0?"ALIGNED":"OPPOSED";
    if(claim==="SELL")return r<0?"ALIGNED":"OPPOSED";
    return "NO_DIRECTIONAL_CLAIM";
  }

  function readLedger(){
    try{
      const rows=globalThis.AgentCryptoTradusShadowLedger406066?.read?.();
      return Array.isArray(rows)?rows.slice():[];
    }catch(_){return [];}
  }

  function normalizeRows(sourceRows=readLedger()){
    const seen=new Set();
    const out=[];
    for(const row of sourceRows){
      const ms=atMs(row),mid=midOf(row);
      if(ms===null||mid===null)continue;
      const id=String(row?.id||[row?.at,mid,tradusSignal(row),strategyDecision(row),comparisonState(row)].join("|"));
      if(seen.has(id))continue;
      seen.add(id);
      out.push(Object.freeze({
        id,at:String(row.at),at_ms:ms,symbol:String(row?.symbol||row?.tick?.symbol||"BTCEUR"),mid_eur:mid,
        tradus_signal:tradusSignal(row),strategy_a:strategyDecision(row),strategy_a_direction:strategyDirection(row),comparison:comparisonState(row)
      }));
    }
    out.sort((a,b)=>a.at_ms-b.at_ms);
    return out;
  }

  function settle(base,quotes,horizon){
    const targetMs=base.at_ms+horizon.minutes*60_000;
    const sample=quotes.find(row=>row.at_ms>=targetMs&&row.at_ms>base.at_ms);
    if(!sample){
      return Object.freeze({label:horizon.label,state:"PENDING",target_at:new Date(targetMs).toISOString(),resolved_at:null,lateness_seconds:null,baseline_mid_eur:base.mid_eur,resolved_mid_eur:null,return_ratio:null,return_pct:null,tradus_outcome:"PENDING",strategy_a_outcome:"PENDING"});
    }
    const ret=sample.mid_eur/base.mid_eur-1;
    const late=Math.max(0,(sample.at_ms-targetMs)/1000);
    const state=late<=horizon.tolerance_seconds?"SETTLED":"SETTLED_LATE";
    return Object.freeze({
      label:horizon.label,state,target_at:new Date(targetMs).toISOString(),resolved_at:sample.at,lateness_seconds:Number(late.toFixed(3)),
      baseline_mid_eur:base.mid_eur,resolved_mid_eur:sample.mid_eur,return_ratio:ret,return_pct:ret*100,
      tradus_outcome:directionalOutcome(directionClaim(base.tradus_signal),ret),
      strategy_a_outcome:directionalOutcome(directionClaim(base.strategy_a),ret)
    });
  }

  function modelFromRows(sourceRows=readLedger()){
    const rows=normalizeRows(sourceRows);
    const observations=rows.map(base=>Object.freeze({
      id:base.id,at:base.at,symbol:base.symbol,baseline_mid_eur:base.mid_eur,tradus_signal:base.tradus_signal,
      strategy_a:base.strategy_a,strategy_a_direction:base.strategy_a_direction,comparison:base.comparison,
      horizons:Object.freeze(Object.fromEntries(HORIZONS.map(h=>[h.key,settle(base,rows,h)])))
    }));
    const horizonSummary={};
    for(const h of HORIZONS){
      const outcomes=observations.map(row=>row.horizons[h.key]);
      horizonSummary[h.key]=Object.freeze({
        label:h.label,total:outcomes.length,
        settled:outcomes.filter(x=>x.state==="SETTLED"||x.state==="SETTLED_LATE").length,
        exactish:outcomes.filter(x=>x.state==="SETTLED").length,
        late:outcomes.filter(x=>x.state==="SETTLED_LATE").length,
        pending:outcomes.filter(x=>x.state==="PENDING").length,
        tradus_aligned:outcomes.filter(x=>x.tradus_outcome==="ALIGNED").length,
        tradus_opposed:outcomes.filter(x=>x.tradus_outcome==="OPPOSED").length,
        tradus_no_claim:outcomes.filter(x=>x.tradus_outcome==="NO_DIRECTIONAL_CLAIM").length
      });
    }
    return Object.freeze({
      schema:"agent_crypto_strategy_tradus_outcome_memory_v1",owner:OWNER,build:runtimeBuild(),generated_at_utc:new Date().toISOString(),
      observations:Object.freeze(observations),horizons:Object.freeze(horizonSummary),
      interpretation:"First later observed quote at/after each horizon. Late samples are labelled SETTLED_LATE. Directional alignment is descriptive evidence, not after-cost profitability.",
      contract:Object.freeze({derived_read_only:true,source_owner:"AgentCryptoTradusShadowLedger406066",paper_shadow_only:true,financial_signal:false,automatic_order:false,real_order:false,fetch:false,recurring_timer:false,mutation_observer:false,storage_write:false,strategy_mutation:false,tradus_mutation:false,wallet:false})
    });
  }

  function statusText(model){
    const parts=HORIZONS.map(h=>{
      const s=model.horizons[h.key]||{settled:0,total:0,late:0};
      return `${h.label} ${s.settled}/${s.total}${s.late?` · ${s.late} tardif${s.late>1?"s":""}`:""}`;
    });
    return `OUTCOME MEMORY · ${parts.join(" · ")}`;
  }

  function render(){
    const model=modelFromRows();
    lastModel=model;
    if(typeof document!=="undefined"){
      const host=document.querySelector("#multiStrategyShadowLedger406066 .ms-foot")||document.querySelector("#strategyTradusComparativeIntelligence .sti-foot");
      if(host){
        let node=document.getElementById(STATUS_ID);
        if(!node){node=document.createElement("span");node.id=STATUS_ID;node.dataset.owner=OWNER;host.append(document.createTextNode(" · "),node);}
        node.textContent=statusText(model);
        node.title="Mesure dérivée des observations existantes. Un échantillon tardif reste signalé tardif ; aucune rentabilité n’est déduite.";
      }
      try{document.dispatchEvent(new CustomEvent(EVENT_NAME,{detail:clone(model)}));}catch(_){}
    }
    return model;
  }

  function schedule(){queueMicrotask(()=>{try{requestAnimationFrame(()=>render());}catch(_){render();}});}

  function selfTest(){
    const t0="2026-09-13T10:00:00.000Z";
    const rows=[
      {id:"a",at:t0,bid:100,ask:100,signal:"BUY",strategy_a:"NO TRADE",comparison:"DIVERGENCE"},
      {id:"b",at:"2026-09-13T10:05:30.000Z",bid:101,ask:101,signal:"NO_TRADE",strategy_a:"NO TRADE",comparison:"CONVERGENCE"},
      {id:"c",at:"2026-09-13T10:16:00.000Z",bid:99,ask:99,signal:"SELL",strategy_a:"NO TRADE",comparison:"DIVERGENCE"}
    ];
    const m=modelFromRows(rows);
    const a=m.observations[0];
    const checks={
      t5_settled:a?.horizons?.t5?.state==="SETTLED",
      t5_buy_aligned:a?.horizons?.t5?.tradus_outcome==="ALIGNED",
      t15_settled:a?.horizons?.t15?.state==="SETTLED",
      no_trade_not_scored:a?.horizons?.t5?.strategy_a_outcome==="NO_DIRECTIONAL_CLAIM",
      t60_pending:a?.horizons?.t60?.state==="PENDING",
      no_side_effect_contract:m.contract.fetch===false&&m.contract.recurring_timer===false&&m.contract.storage_write===false&&m.contract.real_order===false
    };
    return Object.freeze({schema:"agent_crypto_strategy_tradus_outcome_memory_self_test_v1",pass:Object.values(checks).every(Boolean),checks});
  }

  ["agentcrypto:tradus-shadow-observation","agentcrypto:strategy-a-auto-cycle"].forEach(name=>document.addEventListener(name,schedule,{passive:true}));
  window.addEventListener("erith:system-hydrated",schedule,{passive:true});
  window.addEventListener("pageshow",schedule,{passive:true});
  if(document.readyState==="loading")window.addEventListener("load",schedule,{once:true,passive:true});else schedule();

  globalThis.AgentCryptoStrategyTradusOutcomeMemory=Object.freeze({owner:OWNER,event:EVENT_NAME,horizons:HORIZONS,model:modelFromRows,read:()=>clone(lastModel||modelFromRows()),render,self_test:selfTest,contract:Object.freeze({derived_read_only:true,storage_write:false,fetch:false,recurring_timer:false,mutation_observer:false,real_order:false})});
})();
