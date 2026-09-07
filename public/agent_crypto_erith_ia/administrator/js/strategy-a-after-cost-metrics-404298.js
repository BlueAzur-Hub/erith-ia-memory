/*
  Agent-Crypto Administrator — Strategy A actual Paper after-cost evidence
  Build: 40.4.298
  Responsibility: consume the canonical local Paper reconciliation 40.4.264.
  UNKNOWN cost components are never coerced to zero. No profitability claim.
*/
(() => {
  "use strict";
  const BUILD="40.4.298";
  const SCHEMA="agent_crypto_strategy_a_after_cost_metrics_v2";
  const SAMPLE_MIN=30;
  const ROWS=[];
  const clone=v=>{try{return JSON.parse(JSON.stringify(v));}catch(_){return null;}};
  const finite=v=>Number.isFinite(Number(v));
  const val=v=>finite(v)?Number(v):null;
  const nonneg=v=>finite(v)?Math.max(0,Number(v)):null;
  function identity(row){return String(row?.reconciliation_id||row?.execution_id||"").trim();}
  function fromReconciliation(row={}){
    const id=identity(row); if(!id)return {ok:false,reason:"RECONCILIATION_ID_MISSING"};
    if(ROWS.some(r=>r.identity===id))return {ok:false,reason:"DUPLICATE_RECONCILIATION",identity:id};
    const qty=val(row.quantity_btc),entryRef=val(row.entry_reference_eur),exitRef=val(row.exit_reference_eur),net=val(row.net_pnl_eur);
    if(!(qty>0)||!(entryRef>0)||!(exitRef>0)||net===null)return {ok:false,reason:"INCOMPLETE_RECONCILIATION_FACTS",identity:id};
    const entryFee=nonneg(row.entry_fee_eur),exitFee=nonneg(row.exit_fee_eur),impact=nonneg(row.estimated_total_impact_eur);
    const spread=nonneg(row.spread_eur),slippage=nonneg(row.slippage_eur);
    const unknown=[]; if(spread===null)unknown.push("spread_eur"); if(slippage===null)unknown.push("slippage_eur");
    if(entryFee===null||exitFee===null)unknown.push("fees_eur"); if(impact===null)unknown.push("impact_eur");
    const fees=(entryFee??0)+(exitFee??0),knownImpact=impact??0,knownCosts=fees+knownImpact;
    const referenceGross=(exitRef-entryRef)*qty;
    const modeledNetKnown=referenceGross-knownCosts;
    const identityError=net-modeledNetKnown;
    const complete=unknown.length===0;
    const totalCosts=complete?knownCosts+(spread??0)+(slippage??0):"UNKNOWN";
    const out={
      schema:SCHEMA,build:BUILD,identity:id,reconciliation_id:row.reconciliation_id||null,execution_id:row.execution_id||null,trade_id:row.execution_id||id,
      at:String(row.closed_at||new Date().toISOString()),symbol:String(row.symbol||"BTC").toUpperCase(),paper_only:true,real_order:false,
      quantity_btc:qty,entry_reference_eur:entryRef,exit_reference_eur:exitRef,reference_gross_pnl_eur:referenceGross,
      costs:{entry_fee_eur:entryFee,exit_fee_eur:exitFee,fees_eur:entryFee===null||exitFee===null?"UNKNOWN":fees,impact_eur:impact,spread_eur:spread===null?"UNKNOWN":spread,slippage_eur:slippage===null?"UNKNOWN":slippage},
      known_costs_eur:knownCosts,total_costs_eur:totalCosts,cost_completeness:complete?"COMPLETE":"PARTIAL_MODEL",unknown_cost_components:unknown,
      authoritative_net_pnl_eur:net,net_pnl_eur:net,modeled_net_known_costs_eur:modeledNetKnown,accounting_identity_error_eur:identityError,
      accounting_identity_ok:Math.abs(identityError)<=1e-8,profitability_claim:false,source_owner:"strategyAReconcile404264"
    };
    ROWS.push(out);render();return {ok:true,row:clone(out)};
  }
  function summary(rows=ROWS){
    const list=(Array.isArray(rows)?rows:[]).filter(Boolean),n=list.length,complete=list.filter(r=>r.cost_completeness==="COMPLETE").length;
    const wins=list.filter(r=>val(r.net_pnl_eur)>0).length,losses=list.filter(r=>val(r.net_pnl_eur)<0).length;
    const refGross=list.reduce((a,r)=>a+(val(r.reference_gross_pnl_eur)||0),0),known=list.reduce((a,r)=>a+(val(r.known_costs_eur)||0),0),net=list.reduce((a,r)=>a+(val(r.net_pnl_eur)||0),0);
    let equity=0,peak=0,maxDd=0;for(const r of list){equity+=val(r.net_pnl_eur)||0;peak=Math.max(peak,equity);maxDd=Math.max(maxDd,peak-equity);}
    const allComplete=n>0&&complete===n;
    return {schema:"agent_crypto_strategy_a_after_cost_summary_v2",build:BUILD,trades:n,complete_cost_trades:complete,winners:wins,losers:losses,win_rate_pct:n?wins/n*100:0,reference_gross_pnl_eur:refGross,known_costs_eur:known,total_costs_eur:allComplete?list.reduce((a,r)=>a+Number(r.total_costs_eur||0),0):"UNKNOWN",net_pnl_eur:net,expectancy_eur_per_trade:n?net/n:0,max_drawdown_eur:maxDd,sample_state:n<SAMPLE_MIN?"INSUFFICIENT_SAMPLE":allComplete?"SAMPLE_READY":"COST_MODEL_INCOMPLETE",sample_min:SAMPLE_MIN,cost_model_complete:allComplete,profitability_claim:false,paper_only:true};
  }
  function selfTest(){
    const saved=ROWS.splice(0);try{
      const base={reconciliation_id:"T298",execution_id:"E298",closed_at:"2026-01-01T00:00:00Z",quantity_btc:1,entry_reference_eur:100,exit_reference_eur:110,entry_fee_eur:1,exit_fee_eur:1,estimated_total_impact_eur:2,net_pnl_eur:6};
      const a=fromReconciliation(base),dup=fromReconciliation(base),s=summary();
      const pass=a.ok===true&&dup.reason==="DUPLICATE_RECONCILIATION"&&a.row.cost_completeness==="PARTIAL_MODEL"&&a.row.total_costs_eur==="UNKNOWN"&&a.row.accounting_identity_ok===true&&s.sample_state==="INSUFFICIENT_SAMPLE"&&s.profitability_claim===false;
      return {schema:"agent_crypto_strategy_a_after_cost_self_test_v2",build:BUILD,pass,checks:{actual_reconciliation_consumed:a.ok===true,duplicate_refused:dup.reason==="DUPLICATE_RECONCILIATION",unknown_not_zero:a.row.total_costs_eur==="UNKNOWN",accounting_identity:a.row.accounting_identity_ok===true,no_profitability_claim:s.profitability_claim===false}};
    }finally{ROWS.splice(0);ROWS.push(...saved);render();}
  }
  function exportJson(){const payload={schema:"agent_crypto_strategy_a_after_cost_export_v2",build:BUILD,exported_at:new Date().toISOString(),summary:summary(),trades:clone(ROWS)||[],paper_only:true,real_orders:false};if(typeof document!=="undefined"){const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="STRATEGY_A_AFTER_COST_METRICS.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),0);}return payload;}
  function ensureStyle(){if(typeof document==="undefined")return;document.getElementById("strategyAAfterCostStyle404292")?.remove();if(document.getElementById("strategyAAfterCostStyle404298"))return;const st=document.createElement("style");st.id="strategyAAfterCostStyle404298";st.textContent=`#strategyAAfterCost404292{margin-top:10px;padding:10px;border:1px solid rgba(95,220,182,.22);border-radius:10px;background:rgba(3,23,20,.48)}#strategyAAfterCost404292 .sam-head{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:flex-start}#strategyAAfterCost404292 .sam-title{font-size:9px;font-weight:950;letter-spacing:.09em;color:#a8f1dc;text-transform:uppercase}#strategyAAfterCost404292 .sam-sub{font-size:8px;color:#7faaa0;margin-top:3px}#strategyAAfterCost404292 .sam-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:5px;margin-top:8px}#strategyAAfterCost404292 .sam-k{padding:6px;border:1px solid rgba(255,255,255,.06);border-radius:7px}#strategyAAfterCost404292 .sam-k span{display:block;font-size:7px;color:#78958e;text-transform:uppercase;font-weight:900}#strategyAAfterCost404292 .sam-k b{display:block;margin-top:3px;font-size:9px;color:#eefaf6}#strategyAAfterCost404292 .sam-foot{font-size:8px;color:#7e9c95;margin-top:7px}@media(max-width:950px){#strategyAAfterCost404292 .sam-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}`;document.head.appendChild(st);}
  function render(){if(typeof document==="undefined")return false;ensureStyle();const anchor=document.getElementById("strategyAPaperLifecycle404291")||document.getElementById("strategyAExperimentLedger404289");if(!anchor)return false;let p=document.getElementById("strategyAAfterCost404292");if(!p){p=document.createElement("section");p.id="strategyAAfterCost404292";anchor.insertAdjacentElement("afterend",p);}p.innerHTML=`<div class="sam-head"><div><div class="sam-title">PAPER V2 · ACTUAL AFTER-COST EVIDENCE</div><div class="sam-sub">Réconciliation Paper réelle du moteur local · UNKNOWN ≠ 0 · aucune conclusion de rentabilité.</div></div><button class="btn small" type="button" id="strategyAAfterCostExport404298">EXPORTER</button></div><div class="sam-grid"><div class="sam-k"><span>Trades</span><b data-sam="trades">0</b></div><div class="sam-k"><span>Coûts complets</span><b data-sam="complete">0</b></div><div class="sam-k"><span>Brut référence</span><b data-sam="gross">0,00 €</b></div><div class="sam-k"><span>Coûts connus</span><b data-sam="costs">0,00 €</b></div><div class="sam-k"><span>Net moteur</span><b data-sam="net">0,00 €</b></div><div class="sam-k"><span>Échantillon</span><b data-sam="sample">INSUFFICIENT_SAMPLE</b></div></div><div class="sam-foot">Frais/impact connus · spread/slippage restent UNKNOWN tant qu’ils ne sont pas réellement mesurés/modélisés séparément.</div>`;p.querySelector("#strategyAAfterCostExport404298")?.addEventListener("click",exportJson);const s=summary(),set=(k,v)=>{const n=p.querySelector(`[data-sam="${k}"]`);if(n)n.textContent=v;};set("trades",s.trades);set("complete",`${s.complete_cost_trades}/${s.trades}`);set("gross",`${s.reference_gross_pnl_eur.toFixed(2)} €`);set("costs",`${s.known_costs_eur.toFixed(2)} €`);set("net",`${s.net_pnl_eur.toFixed(2)} €`);set("sample",s.sample_state);return true;}
  const api=Object.freeze({build:BUILD,schema:SCHEMA,from_reconciliation:fromReconciliation,record_from_reconciliation:fromReconciliation,read:()=>clone(ROWS)||[],summary,self_test:selfTest,export_json:exportJson,render,sample_min:SAMPLE_MIN,paper_only:true,real_orders:false,network:false,storage_write:false,profitability_claim:false,unknown_cost_is_zero:false,actual_paper_connected:true});
  globalThis.AgentCryptoStrategyAAfterCostMetrics404298=api;
  globalThis.AgentCryptoStrategyAAfterCostMetrics404292=api;
  if(typeof document!=="undefined"){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render,{once:true});else render();}
})();
