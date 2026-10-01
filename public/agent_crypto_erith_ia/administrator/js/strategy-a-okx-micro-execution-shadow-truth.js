/* Agent-Crypto @erith.IA — 40.6.493 OKX MICRO EXECUTION SHADOW TRUTH
   Passive laboratory layered after 40.6.492 Execution Cost Truth.
   Compares Market→Market, Post-only→Market and Post-only→Post-only for 10/25/50/100 EUR.
   Market→Market uses the measured OKX multi-level orderbook result already produced by 40.6.492.
   Post-only paths expose fee floors only: fill probability, queue position and adverse selection remain UNKNOWN.
   EVIDENCE_SHADOW_NOT_GATE: no Strategy threshold, Cost Gate, Risk Governor, Oracle, Market Core or execution capability changes.
   No fetch, WebSocket, key, wallet, order, storage write, recurring timer, observer or historical backfill. */
(()=>{
  "use strict";
  const BUILD="40.6.493", ROOT="strategyAOkxMicroExecutionShadowTruth", SIZES=Object.freeze([10,25,50,100]), MAX_SESSION_OBSERVATIONS=24;
  let last=null,lastCapturedKey=null;
  const observations=[];
  const n=v=>{if(v===null||v===undefined||typeof v==="boolean")return null;const x=Number(v);return Number.isFinite(x)?x:null;};
  const esc=v=>String(v??"—").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;"}[c]));
  const pct=v=>Number.isFinite(v)?(v>=0?"+":"")+v.toFixed(4)+" %":"—";
  const sourceSnapshot=()=>{try{return globalThis.AgentCryptoStrategyAExecutionCostTruth?.snapshot?.()||null;}catch(_){return null;}};
  const safetyMargin=c=>{const threshold=n(c?.strategy_threshold_pct),pedagogical=n(c?.pedagogical_cost_pct);return threshold!==null&&pedagogical!==null&&threshold>=pedagogical?threshold-pedagogical:null;};
  function classify(envelope,required,evidence){if(!Number.isFinite(envelope)||!Number.isFinite(required))return "UNKNOWN";if(envelope+1e-9<required)return "WAIT";return evidence==="MEASURED_ORDERBOOK"?"POTENTIAL_MEASURED":"POTENTIAL_FILL_UNKNOWN";}
  function evaluate(raw=sourceSnapshot()){
    if(!raw)return Object.freeze({schema:"agent_crypto_okx_micro_execution_shadow_v1",build:BUILD,status:"WAITING_EXECUTION_COST_TRUTH",rows:[]});
    const okx=raw?.venues?.okx||null,c=raw?.oracle_context||{},envelope=n(c?.oracle_envelope_median_pct),margin=safetyMargin(c),threshold=n(c?.strategy_threshold_pct);
    const simByAmount=new Map((Array.isArray(okx?.simulations)?okx.simulations:[]).map(x=>[n(x?.amount_eur),x]));
    const poMarket=n(okx?.post_only_market_fee_floor_pct),poPo=n(okx?.post_only_post_only_fee_floor_pct);
    const rows=SIZES.map(amount=>{
      const sim=simByAmount.get(amount)||null,mm=n(sim?.market_market_estimated_cost_pct),mmMeasured=okx?.ok===true&&okx?.depth_available===true&&mm!==null;
      const mode=(cost,evidence,fill)=>{const required=cost!==null&&margin!==null?cost+margin:null;return Object.freeze({cost_pct:cost,required_with_margin_pct:required,evidence,fill,state:classify(envelope,required,evidence)});};
      return Object.freeze({amount_eur:amount,market_market:mode(mm,mmMeasured?"MEASURED_ORDERBOOK":"UNKNOWN","SIMULATED_AGAINST_CURRENT_BOOK"),post_only_market:mode(poMarket,"FEE_FLOOR_ONLY","UNKNOWN_NOT_GUARANTEED"),post_only_post_only:mode(poPo,"FEE_FLOOR_ONLY","UNKNOWN_NOT_GUARANTEED")});
    });
    const count=(name,statePrefix)=>rows.filter(r=>String(r[name]?.state||"").startsWith(statePrefix)).length;
    return Object.freeze({
      schema:"agent_crypto_okx_micro_execution_shadow_v1",build:BUILD,source_build:String(raw?.build||"UNKNOWN"),generated_at:new Date().toISOString(),source_generated_at:raw?.generated_at||null,
      status:okx?.ok===true?"SHADOW_READY":"SHADOW_SOURCE_UNAVAILABLE",pair:"BTC/EUR",sizes_eur:SIZES.slice(),
      context:Object.freeze({oracle_envelope_median_pct:envelope,current_safety_margin_pct:margin,strategy_threshold_pct:threshold,pedagogical_cost_pct:n(c?.pedagogical_cost_pct),mfe_median_pct:n(c?.mfe_median_pct)}),
      rows,
      summary:Object.freeze({market_market_potential:count("market_market","POTENTIAL"),market_market_wait:count("market_market","WAIT"),post_only_market_potential:count("post_only_market","POTENTIAL"),post_only_market_wait:count("post_only_market","WAIT"),post_only_post_only_potential:count("post_only_post_only","POTENTIAL"),post_only_post_only_wait:count("post_only_post_only","WAIT")}),
      interpretation:Object.freeze({potential_is_not_pass:true,post_only_fill_not_proven:true,queue_position_unknown:true,adverse_selection_unknown:true,current_strategy_gate_unchanged:true}),
      protections:Object.freeze({evidence_shadow_not_gate:true,network_fetch:false,websocket:false,storage_write:false,recurring_timer:false,observer:false,api_key:false,wallet:false,real_order:false,automatic_order:false,historical_backfill:false,thresholds_changed:false,cost_gate_changed:false,risk_governor_changed:false,oracle_math_changed:false,market_core_changed:false,automatic_platform_choice:false})
    });
  }
  function compactObservation(lab){return Object.freeze({at:lab.source_generated_at||lab.generated_at,source_build:lab.source_build,status:lab.status,context:lab.context,summary:lab.summary,rows:lab.rows.map(r=>Object.freeze({amount_eur:r.amount_eur,market_market:r.market_market.state,post_only_market:r.post_only_market.state,post_only_post_only:r.post_only_post_only.state}))});}
  function capture(){const raw=sourceSnapshot(),lab=evaluate(raw);last=lab;const key=String(raw?.generated_at||raw?.measured_at||"");if(key&&key!==lastCapturedKey){lastCapturedKey=key;observations.push(compactObservation(lab));while(observations.length>MAX_SESSION_OBSERVATIONS)observations.shift();}return lab;}
  const statusText=s=>s==="POTENTIAL_MEASURED"?"POTENTIEL · MESURÉ":s==="POTENTIAL_FILL_UNKNOWN"?"POTENTIEL · FILL INCONNU":s==="WAIT"?"WAIT":"UNKNOWN";
  const statusClass=s=>String(s).startsWith("POTENTIAL")?"good":s==="WAIT"?"wait":"unknown";
  function cell(mode){if(!mode)return '<span class="unknown">UNKNOWN</span>';return '<div class="omes-cost">coût '+esc(pct(mode.cost_pct))+'</div><div class="omes-required">avec marge '+esc(pct(mode.required_with_margin_pct))+'</div><b class="'+statusClass(mode.state)+'">'+esc(statusText(mode.state))+'</b>';}
  function style(){if(document.getElementById(ROOT+"Style"))return;const s=document.createElement("style");s.id=ROOT+"Style";s.textContent="#"+ROOT+"{margin-top:10px;padding:13px;border:1px solid rgba(74,192,255,.35);border-radius:10px;background:rgba(5,18,32,.38)}#"+ROOT+" .omes-h{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap}#"+ROOT+" .omes-t{font-size:12px;font-weight:950;letter-spacing:.065em;color:#8fddff;line-height:1.35}#"+ROOT+" .omes-s,#"+ROOT+" .omes-note{font-size:10.5px;color:#a9bec8;line-height:1.5;margin-top:4px}#"+ROOT+" .omes-actions{display:flex;gap:8px}#"+ROOT+" .omes-actions button{min-height:38px!important;font-size:12px!important;padding:8px 12px!important}#"+ROOT+" .omes-k{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-top:10px}#"+ROOT+" .omes-k div{padding:8px;border-radius:7px;background:rgba(255,255,255,.035);min-width:0}#"+ROOT+" .omes-k span{display:block;font-size:9.5px;color:#8ca6b2}#"+ROOT+" .omes-k b{display:block;margin-top:2px;font-size:11.5px;color:#effaff;overflow-wrap:anywhere}#"+ROOT+" .omes-table-wrap{overflow-x:auto;margin-top:10px}#"+ROOT+" table{width:100%;min-width:840px;border-collapse:collapse;font-size:10.5px;line-height:1.35}#"+ROOT+" th,#"+ROOT+" td{padding:8px 7px;border-bottom:1px solid rgba(255,255,255,.07);vertical-align:top;text-align:left}#"+ROOT+" th{color:#b9d9e6;font-size:9.5px;letter-spacing:.03em}#"+ROOT+" .omes-cost{color:#eaf8ff;font-weight:700}#"+ROOT+" .omes-required{color:#8faab5;font-size:9.5px;margin:2px 0 4px}#"+ROOT+" .good{color:#8ff0c1}#"+ROOT+" .wait{color:#ffd37a}#"+ROOT+" .unknown{color:#aab0b6}#"+ROOT+" .omes-lock{margin-top:9px;padding:8px;border-radius:7px;background:rgba(255,211,122,.055);color:#d8c9a2;font-size:10.5px;line-height:1.5}@media(max-width:900px){#"+ROOT+" .omes-k{grid-template-columns:repeat(2,minmax(0,1fr))}}";document.head.appendChild(s);}
  function render(){
    if(typeof document==="undefined")return last;const anchor=document.getElementById("strategyAExecutionCostTruth");if(!anchor)return last;
    style();const lab=capture();let root=document.getElementById(ROOT);if(!root){root=document.createElement("section");root.id=ROOT;}if(root.previousElementSibling!==anchor){try{anchor.insertAdjacentElement("afterend",root);}catch(_){}}
    const c=lab.context||{},s=lab.summary||{},rows=Array.isArray(lab.rows)?lab.rows:[];
    root.innerHTML='<div class="omes-h"><div><div class="omes-t">STRATEGY A · OKX MICRO EXECUTION SHADOW TRUTH · '+BUILD+'</div><div class="omes-s">Laboratoire passif · compare 3 modes d’exécution sur le carnet déjà mesuré par 40.6.492 · EVIDENCE_SHADOW_NOT_GATE.</div></div><div class="omes-actions"><button class="btn small" id="'+ROOT+'Export" '+(!last?"disabled":"")+'>EXPORTER LAB</button></div></div>'+
      '<div class="omes-k"><div><span>Enveloppe Oracle médiane</span><b>'+esc(pct(c.oracle_envelope_median_pct))+'</b></div><div><span>Marge actuelle dérivée</span><b>'+esc(pct(c.current_safety_margin_pct))+'</b></div><div><span>Cost Gate existant</span><b>'+esc(pct(c.strategy_threshold_pct))+' · INCHANGÉ</b></div><div><span>Observations session</span><b>'+esc(observations.length)+' / '+MAX_SESSION_OBSERVATIONS+'</b></div></div>'+
      '<div class="omes-k"><div><span>Market→Market potentiels</span><b>'+esc(s.market_market_potential??0)+' / 4</b></div><div><span>Post-only→Market potentiels</span><b>'+esc(s.post_only_market_potential??0)+' / 4</b></div><div><span>Post-only→Post-only potentiels</span><b>'+esc(s.post_only_post_only_potential??0)+' / 4</b></div><div><span>Source</span><b>'+esc(lab.status||"—")+'</b></div></div>'+
      '<div class="omes-table-wrap"><table><thead><tr><th>Ticket</th><th>Market→Market</th><th>Post-only→Market</th><th>Post-only→Post-only</th></tr></thead><tbody>'+rows.map(r=>'<tr><td><b>'+esc(r.amount_eur)+' €</b></td><td>'+cell(r.market_market)+'</td><td>'+cell(r.post_only_market)+'</td><td>'+cell(r.post_only_post_only)+'</td></tr>').join("")+'</tbody></table></div>'+
      '<div class="omes-lock"><b>POTENTIEL ≠ PASS.</b> Market→Market utilise le coût simulé sur le carnet multi-niveaux courant. Les deux chemins Post-only affichent seulement un plancher de frais : exécution, position dans la file, partial fill et adverse selection restent INCONNUS. Aucun seuil Strategy A n’est modifié.</div>'+
      '<div class="omes-note">SESSION ONLY · aucune écriture IndexedDB/localStorage · aucune API privée · aucun ordre · aucune clé · aucun wallet.</div>';
    root.querySelector("#"+ROOT+"Export")?.addEventListener("click",exportJson);root.dataset.build=BUILD;root.dataset.readOnly="true";root.dataset.evidence="shadow-not-gate";return lab;
  }
  function exportJson(){if(!last)return false;try{const payload={...last,session_observations:observations.slice()};const b=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download="STRATEGY_A_OKX_MICRO_EXECUTION_SHADOW_40_6_493.json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);return true;}catch(_){return false;}}
  function selfTest(){
    const fixture={build:"40.6.492",generated_at:"2026-10-01T20:00:00Z",oracle_context:{oracle_envelope_median_pct:0.55,pedagogical_cost_pct:0.60,strategy_threshold_pct:0.80,mfe_median_pct:0.14},venues:{okx:{ok:true,depth_available:true,post_only_market_fee_floor_pct:0.30,post_only_post_only_fee_floor_pct:0.20,simulations:SIZES.map(amount=>({amount_eur:amount,market_market_estimated_cost_pct:0.40}))}}};
    const lab=evaluate(fixture),r=lab.rows[0];const checks=Object.freeze({build:lab.build===BUILD,market_market_wait:r.market_market.state==="WAIT",post_only_market_potential:r.post_only_market.state==="POTENTIAL_FILL_UNKNOWN",post_only_post_only_potential:r.post_only_post_only.state==="POTENTIAL_FILL_UNKNOWN",potential_never_pass:JSON.stringify(lab).includes('"PASS"')===false,no_storage:lab.protections.storage_write===false,no_network:lab.protections.network_fetch===false,no_order:lab.protections.real_order===false,gate_unchanged:lab.protections.cost_gate_changed===false});return Object.freeze({build:BUILD,pass:Object.values(checks).every(Boolean),checks});
  }
  globalThis.AgentCryptoOkxMicroExecutionShadowTruth=Object.freeze({build:BUILD,render,evaluate,snapshot:()=>last,session_observations:()=>observations.slice(),export_json:exportJson,self_test:selfTest,evidence_shadow_not_gate:true,network_fetch:false,websocket:false,storage_write:false,recurring_timer:false,api_key:false,wallet:false,real_order:false,thresholds_changed:false,cost_gate_changed:false,risk_governor_changed:false,oracle_math_changed:false,market_core_changed:false,automatic_platform_choice:false});
  if(typeof document!=="undefined"){
    let queued=false;const schedule=()=>{if(queued)return;queued=true;const run=()=>{queued=false;try{render();}catch(_){}};try{queueMicrotask(run);}catch(_){Promise.resolve().then(run);}};
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});else schedule();
    window.addEventListener("agent-crypto:strategy-a-execution-cost-measured",schedule,{passive:true});
    window.addEventListener("agent-crypto:postboot-runtime-ready",schedule,{passive:true});
    window.addEventListener("pageshow",schedule,{passive:true});
    document.addEventListener("toggle",event=>{if(event?.target?.id==="simulation"&&event.target.open===true)schedule();},true);
  }
})();
