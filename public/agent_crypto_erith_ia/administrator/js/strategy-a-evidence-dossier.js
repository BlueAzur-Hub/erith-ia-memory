/*
  Agent-Crypto Administrator — Strategy A Paper V2 evidence dossier passive truth lock
  Build: 40.6.161
  Responsibility: read existing evidence without executing hidden self-tests or mutating lab state.
  After-cost readiness requires strict numeric facts plus COMPLETE + VERIFIED accounting truth.
  Null, blank, boolean and partial rows never count as complete evidence.
  40.6.161: expose G1 after-cost data truth already computed by the dossier; no gate promotion.
  No backtest fabrication, no network, no exchange call, no real order.
*/
(() => {
  "use strict";
  const BUILD="40.6.161";
  const SCHEMA="agent_crypto_strategy_a_evidence_dossier_v2";
  const clone=v=>{try{return JSON.parse(JSON.stringify(v));}catch(_){return null;}};
  const num=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
  const knownNumber=v=>{
    if(v===null||v===undefined||typeof v==="boolean")return null;
    if(typeof v==="string"&&!v.trim())return null;
    const n=Number(v);return Number.isFinite(n)?n:null;
  };
  const safeCall=(fn,fallback=null)=>{try{return typeof fn==="function"?fn():fallback;}catch(error){return {error:String(error?.message||error)}}};

  function datasetReadiness(rows=[],kind="generic"){
    const list=(Array.isArray(rows)?rows:[]).filter(r=>r&&typeof r==="object");
    const ids=new Set(),dups=[];let chronological=true,last=-Infinity,complete=0,missingId=0,missingTimestamp=0;
    let numericUnknownRows=0,unverifiedAfterCostRows=0;
    for(const row of list){
      const id=String(row.trade_id||row.cycle_id||row.replay_id||"").trim();
      if(!id)missingId++;else{if(ids.has(id))dups.push(id);ids.add(id);}
      const t=Date.parse(row.at||row.captured_at||row.timestamp||row.created_at||"");
      if(!Number.isFinite(t))missingTimestamp++;else{if(t<last)chronological=false;last=Math.max(last,t);}
      if(row.trade_id){
        const net=knownNumber(row.net_pnl_eur),totalCosts=knownNumber(row.total_costs_eur);
        const numericKnown=net!==null&&totalCosts!==null&&totalCosts>=0;
        const accountingVerified=kind!=="after_cost"||(row.cost_completeness==="COMPLETE"&&row.accounting_identity_status==="VERIFIED"&&row.accounting_identity_ok===true);
        if(!numericKnown)numericUnknownRows++;
        else if(kind==="after_cost"&&!accountingVerified)unverifiedAfterCostRows++;
        if(numericKnown&&accountingVerified)complete++;
      }
    }
    const duplicateIds=[...new Set(dups)];
    const integrityReady=list.length>0&&missingId===0&&missingTimestamp===0&&duplicateIds.length===0&&chronological;
    const allAfterCostComplete=kind==="after_cost"&&list.length>0&&complete===list.length;
    return {
      schema:"agent_crypto_strategy_a_dataset_readiness_v3",build:BUILD,kind,rows:list.length,unique_ids:ids.size,
      duplicate_ids:duplicateIds,missing_ids:missingId,missing_timestamps:missingTimestamp,chronological,
      after_cost_complete_rows:complete,numeric_unknown_rows:numericUnknownRows,unverified_after_cost_rows:unverifiedAfterCostRows,data_integrity_ready:integrityReady,
      strict_numeric_truth:true,after_cost_requires_verified_identity:kind==="after_cost",
      backtest_ready:false,out_of_sample_ready:false,walk_forward_ready:false,
      monte_carlo_ready:integrityReady&&allAfterCostComplete&&complete>=30,
      reason:!list.length?"No evidence rows supplied.":!integrityReady?"Evidence integrity incomplete: duplicates, IDs, timestamps or chronology must be resolved.":kind==="after_cost"&&!allAfterCostComplete?"After-cost rows are incomplete, numerically unknown or not VERIFIED.":"Evidence collected; historical market replay dataset and certified outcome labels still required.",
      fabricated_data:false
    };
  }

  function snapshot(){
    const experiment=globalThis.AgentCryptoStrategyAExperimentLedger;
    const replay=globalThis.AgentCryptoStrategyAReplay;
    const lifecycle=globalThis.AgentCryptoStrategyAPaperLifecycle;
    const metrics=globalThis.AgentCryptoStrategyAAfterCostMetrics;
    const safety=globalThis.AgentCryptoStrategyASafetyCertification;
    const experimentRows=safeCall(experiment?.read,[])||[];
    const afterRows=safeCall(metrics?.read,[])||[];
    const safetyMatrix=safeCall(safety?.certification_matrix,{gates:[]})||{gates:[]};
    const metricsSummary=safeCall(metrics?.summary,{trades:0,sample_state:"INSUFFICIENT_SAMPLE"})||{};
    const gates=(Array.isArray(safetyMatrix.gates)?safetyMatrix.gates:[]).map(g=>({...g}));
    const unresolved=gates.filter(g=>!["FOUNDATION_PASS","PASS"].includes(String(g.state))).map(g=>({gate:g.gate,state:g.state,label:g.label}));
    const gate2=gates.find(g=>g.gate===2);
    return {
      schema:SCHEMA,build:BUILD,generated_at:new Date().toISOString(),
      deterministic_foundation:{state:gate2?.state||"EVIDENCE_REQUIRED",pass:gate2?.state==="FOUNDATION_PASS",implicit_tests_executed:false,modules:{replay:!!replay,lifecycle:!!lifecycle,after_cost:!!metrics,safety:!!safety}},
      experiment_ledger:{summary:safeCall(experiment?.summary,{}),cycles:clone(experimentRows)||[]},
      after_cost:{summary:metricsSummary,trades:clone(afterRows)||[]},
      dataset:{experiment:datasetReadiness(experimentRows,"experiment"),after_cost:datasetReadiness(afterRows,"after_cost")},
      certification:{gates,unresolved,certified_for_live:false,micro_live_locked:true},
      next_evidence:["historical realistic backtest dataset","out-of-sample holdout","walk-forward windows","Monte Carlo / stress after adequate complete after-cost Paper sample","continued real Paper observation","Auto A integration remains separate"],
      passive_read:true,implicit_self_tests:false,paper_only:true,real_orders:false,network:false,credentials:false,wallet:false,profitability_claim:false,fabricated_backtest:false
    };
  }

  function selfTest(){
    const bad=datasetReadiness([{trade_id:"A",at:"2026-01-01T00:00:00Z",net_pnl_eur:1,total_costs_eur:.1,cost_completeness:"COMPLETE",accounting_identity_status:"VERIFIED",accounting_identity_ok:true},{trade_id:"A",at:"",net_pnl_eur:-1,total_costs_eur:.1,cost_completeness:"COMPLETE",accounting_identity_status:"VERIFIED",accounting_identity_ok:true}],"after_cost");
    const unknown=datasetReadiness([{trade_id:"U1",at:"2026-01-01T00:00:00Z",net_pnl_eur:null,total_costs_eur:"",cost_completeness:"COMPLETE",accounting_identity_status:"VERIFIED",accounting_identity_ok:true},{trade_id:"U2",at:"2026-01-01T00:01:00Z",net_pnl_eur:false,total_costs_eur:0,cost_completeness:"COMPLETE",accounting_identity_status:"VERIFIED",accounting_identity_ok:true}],"after_cost");
    const partial=datasetReadiness([{trade_id:"P1",at:"2026-01-01T00:00:00Z",net_pnl_eur:1,total_costs_eur:0,cost_completeness:"PARTIAL_MODEL",accounting_identity_status:"INDETERMINATE_COSTS",accounting_identity_ok:null}],"after_cost");
    const before=JSON.stringify({life:(globalThis.AgentCryptoStrategyAPaperLifecycle)?.diagnostic_snapshot?.()||null,safety:(globalThis.AgentCryptoStrategyASafetyCertification)?.snapshot?.()||null,metrics:globalThis.AgentCryptoStrategyAAfterCostMetrics?.read?.()||[]});
    const d=snapshot();
    const after=JSON.stringify({life:(globalThis.AgentCryptoStrategyAPaperLifecycle)?.diagnostic_snapshot?.()||null,safety:(globalThis.AgentCryptoStrategyASafetyCertification)?.snapshot?.()||null,metrics:globalThis.AgentCryptoStrategyAAfterCostMetrics?.read?.()||[]});
    const strictUnknown=unknown.after_cost_complete_rows===0&&unknown.numeric_unknown_rows===2&&unknown.monte_carlo_ready===false;
    const strictVerified=partial.after_cost_complete_rows===0&&partial.unverified_after_cost_rows===1&&partial.monte_carlo_ready===false;
    const pass=bad.data_integrity_ready===false&&bad.monte_carlo_ready===false&&strictUnknown&&strictVerified&&d.certification.certified_for_live===false&&d.fabricated_backtest===false&&d.paper_only===true&&before===after;
    return {schema:"agent_crypto_strategy_a_evidence_dossier_self_test_v3",build:BUILD,pass,checks:{bad_dataset_rejected:bad.data_integrity_ready===false,null_blank_boolean_not_complete:strictUnknown,partial_unverified_not_complete:strictVerified,no_fake_monte_carlo:bad.monte_carlo_ready===false,no_fake_backtest:d.dataset.after_cost.backtest_ready===false,micro_live_locked:d.certification.micro_live_locked===true,paper_only:d.paper_only===true,passive_snapshot_no_state_mutation:before===after}};
  }

  function exportJson(){const payload=snapshot();if(typeof document!=="undefined"){const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="STRATEGY_A_EVIDENCE_DOSSIER.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),0);}return payload;}
  function ensureStyle(){if(typeof document==="undefined"||document.getElementById("strategyADossierStyle"))return;const st=document.createElement("style");st.id="strategyADossierStyle";st.textContent=`#strategyADossier{margin-top:10px;padding:10px;border:1px solid rgba(132,174,255,.22);border-radius:10px;background:rgba(7,15,31,.48)}#strategyADossier .sad-head{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}#strategyADossier .sad-title{font-size:9px;font-weight:950;letter-spacing:.09em;color:#bdd2ff;text-transform:uppercase}#strategyADossier .sad-sub{font-size:8px;color:#8598b7;margin-top:3px}#strategyADossier .sad-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px;margin-top:8px}#strategyADossier .sad-k{padding:6px;border:1px solid rgba(255,255,255,.06);border-radius:7px}#strategyADossier .sad-k span{font-size:7px;color:#7588a7;display:block;text-transform:uppercase}#strategyADossier .sad-k b{font-size:9px;color:#edf3ff;display:block;margin-top:3px}#strategyADossier .sad-truth{margin-top:9px;padding:8px;border:1px solid rgba(255,201,91,.16);border-radius:8px;background:rgba(25,20,8,.22)}#strategyADossier .sad-truth-title{font-size:8px;font-weight:950;letter-spacing:.08em;color:#f2d78c;text-transform:uppercase}#strategyADossier .sad-truth-sub{font-size:8px;color:#a99c78;margin-top:3px}#strategyADossier .sad-truth-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px;margin-top:6px}#strategyADossier .sad-truth-k{padding:6px;border:1px solid rgba(255,255,255,.055);border-radius:7px}#strategyADossier .sad-truth-k span{font-size:7px;color:#9e9478;display:block;text-transform:uppercase}#strategyADossier .sad-truth-k b{font-size:9px;color:#fff4d0;display:block;margin-top:3px}#strategyADossier .sad-reason{margin-top:7px;font-size:8px;line-height:1.4;color:#c8bc9b}#strategyADossier .sad-foot{font-size:8px;color:#8190a9;margin-top:7px}@media(max-width:950px){#strategyADossier .sad-grid,#strategyADossier .sad-truth-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}`;document.head.appendChild(st);}
  function render(){
    if(typeof document==="undefined")return false;
    ensureStyle();
    const anchor=document.getElementById("strategyASafety")||document.getElementById("strategyAAfterCost");
    if(!anchor)return false;
    document.getElementById("strategyADossier")?.remove();
    const p=document.createElement("section");
    p.id="strategyADossier";
    p.dataset.strategyAG1AfterCostTruthBuild=BUILD;
    p.innerHTML=`<div class="sad-head"><div><div class="sad-title">STRATEGY A · PAPER V2 · EVIDENCE DOSSIER</div><div class="sad-sub">Lecture strictement passive : aucune consultation n'exécute les autotests du laboratoire.</div></div><button class="btn small" id="strategyADossierExport" type="button">EXPORTER DOSSIER</button></div><div class="sad-grid"><div class="sad-k"><span>Fondation déterministe</span><b data-sad="det">—</b></div><div class="sad-k"><span>Cycles réels</span><b data-sad="cycles">0</b></div><div class="sad-k"><span>Trades après coûts</span><b data-sad="trades">0</b></div><div class="sad-k"><span>Gates non soldés</span><b data-sad="pending">—</b></div><div class="sad-k"><span>Micro-live</span><b data-sad="live">LOCKED</b></div></div><div class="sad-truth"><div class="sad-truth-title">G1 · AFTER-COST DATA TRUTH</div><div class="sad-truth-sub">Diagnostic passif du propriétaire AgentCryptoStrategyAAfterCostMetrics · aucun PASS créé par cette vue.</div><div class="sad-truth-grid"><div class="sad-truth-k"><span>Lignes after-cost</span><b data-g1="rows">0</b></div><div class="sad-truth-k"><span>IDs uniques</span><b data-g1="ids">0/0</b></div><div class="sad-truth-k"><span>COMPLETE + VERIFIED</span><b data-g1="verified">0/0</b></div><div class="sad-truth-k"><span>IDs manquants</span><b data-g1="missingIds">0</b></div><div class="sad-truth-k"><span>Timestamps manquants</span><b data-g1="missingTs">0</b></div><div class="sad-truth-k"><span>Doublons</span><b data-g1="dups">0</b></div><div class="sad-truth-k"><span>Chronologie</span><b data-g1="chronology">OK</b></div><div class="sad-truth-k"><span>Numérique UNKNOWN</span><b data-g1="unknown">0</b></div><div class="sad-truth-k"><span>Non VERIFIED</span><b data-g1="unverified">0</b></div><div class="sad-truth-k"><span>Intégrité dataset</span><b data-g1="integrity">NOT READY</b></div></div><div class="sad-reason" data-g1="reason">G1 reste EVIDENCE_REQUIRED tant que la preuve owner n'est pas complète.</div></div><div class="sad-foot">Aucun backtest inventé · aucun résultat fabriqué · dataset incomplet/dupliqué jamais promu · PAPER ONLY.</div>`;
    anchor.insertAdjacentElement("afterend",p);
    p.querySelector("#strategyADossierExport")?.addEventListener("click",exportJson);
    const d=snapshot();
    const set=(k,v)=>{const n=p.querySelector(`[data-sad="${k}"]`);if(n)n.textContent=v;};
    set("det",d.deterministic_foundation.pass?"PASS":"EVIDENCE_REQUIRED");
    set("cycles",num(d.experiment_ledger?.summary?.cycles));
    set("trades",num(d.after_cost?.summary?.trades));
    set("pending",d.certification.unresolved.length);
    set("live","LOCKED");
    const a=d.dataset?.after_cost||{};
    const setG1=(k,v)=>{const n=p.querySelector(`[data-g1="${k}"]`);if(n)n.textContent=String(v);};
    const rows=num(a.rows),unique=num(a.unique_ids),complete=num(a.after_cost_complete_rows);
    setG1("rows",rows);
    setG1("ids",`${unique}/${rows}`);
    setG1("verified",`${complete}/${rows}`);
    setG1("missingIds",num(a.missing_ids));
    setG1("missingTs",num(a.missing_timestamps));
    setG1("dups",Array.isArray(a.duplicate_ids)?a.duplicate_ids.length:0);
    setG1("chronology",a.chronological===true?"OK":"NON");
    setG1("unknown",num(a.numeric_unknown_rows));
    setG1("unverified",num(a.unverified_after_cost_rows));
    setG1("integrity",a.data_integrity_ready===true?"READY":"NOT READY");
    const reason=!rows
      ?"Aucune ligne after-cost fournie par l'owner : G1 reste EVIDENCE_REQUIRED."
      :a.data_integrity_ready!==true
        ?"Intégrité incomplète : résoudre doublons, IDs, timestamps ou chronologie. G1 reste EVIDENCE_REQUIRED."
        :complete!==rows
          ?"Lignes after-cost incomplètes, numériquement inconnues ou non VERIFIED. G1 reste EVIDENCE_REQUIRED."
          :"Données after-cost cohérentes dans ce diagnostic ; cette vue ne certifie pas G1 et ne crée aucun PASS.";
    setG1("reason",reason);
    return true;
  }

  const api=Object.freeze({build:BUILD,schema:SCHEMA,snapshot,dataset_readiness:datasetReadiness,self_test:selfTest,export_json:exportJson,render,paper_only:true,real_orders:false,network:false,profitability_claim:false,fabricated_backtest:false,passive_read:true,implicit_self_tests:false,strict_dataset_completeness_406019:true,null_blank_boolean_complete_row:false,after_cost_verified_identity_required:true,g1_after_cost_data_truth_406161:true,g1_state_change:false,g1_certified:false});
  globalThis.AgentCryptoStrategyAEvidenceDossier=api;
  if(typeof document!=="undefined"){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render,{once:true});else render();}
})();
