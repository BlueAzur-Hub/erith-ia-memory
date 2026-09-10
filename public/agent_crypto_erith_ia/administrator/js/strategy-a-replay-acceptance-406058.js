/* Agent-Crypto Administrator — Strategy A Replay Acceptance Matrix Render Repair
   Build: 40.6.58 · Repairs the 40.6.57 acceptance panel mount only.
   Uses existing Strategy A replay 40.4.290 + canonical spec 40.6.56.
   No automatic replay execution. No live ledger mutation, network, storage, timer or observer. */
(() => {
  "use strict";
  const BUILD="40.6.58";
  const PANEL_ID="strategyAReplayAcceptance406058";
  const EXPECTED=Object.freeze({
    PASS_TO_PAPER:"PAPER_SIMULATED",
    DATA_STALE_STOP:"STOP",
    DIRECTION_WAIT:"WAIT",
    BTC24_WAIT:"WAIT",
    COST_WAIT:"WAIT",
    DUPLICATE_STOP:"STOP",
    RISK_REJECT:"STOP"
  });
  const clone=v=>{try{return JSON.parse(JSON.stringify(v));}catch(_){return null;}};
  const replay=()=>globalThis.AgentCryptoStrategyAReplay404290||null;
  const spec=()=>globalThis.AgentCryptoStrategyACanonicalSpec406056||null;

  function normalize(raw){
    const source=Array.isArray(raw?.checks)?raw.checks:[];
    const rows=Object.entries(EXPECTED).map(([scenario,expected])=>{
      const hit=source.find(x=>x?.scenario===scenario)||null;
      const actual=hit?.actual??null;
      return {scenario,expected,actual,pass:actual===expected};
    });
    return {
      schema:"agent_crypto_strategy_a_replay_acceptance_matrix_v1",
      build:BUILD,
      replay_build:replay()?.build||null,
      spec_build:spec()?.build||null,
      passed:rows.filter(x=>x.pass).length,
      total:rows.length,
      pass:rows.every(x=>x.pass),
      rows,
      spec_audit:typeof spec()?.audit==="function"?spec().audit():null,
      safety:{
        deterministic:true,isolated_from_live:true,
        experiment_ledger_mutated:false,live_paper_ledger_mutated:false,
        local_storage_write:false,network_request:false,kraken_network:false,
        wallet:false,credentials:false,real_orders:false
      }
    };
  }

  function renderResult(result){
    const panel=document.getElementById(PANEL_ID);if(!panel)return false;
    const summary=panel.querySelector("[data-sara-summary]");
    const grid=panel.querySelector("[data-sara-grid]");
    if(summary)summary.textContent=result
      ? `${result.pass?"PASS":"FAIL"} · ${result.passed}/${result.total} scénarios · replay ${result.replay_build||"N/D"} · spec ${result.spec_audit?.status||"N/D"}`
      : "Non exécutée — clic opérateur requis.";
    if(grid){
      grid.replaceChildren();
      for(const row of result?.rows||[]){
        const el=document.createElement("div");
        el.className="sara-case";
        el.dataset.pass=String(row.pass);
        el.textContent=`${row.scenario} · ${row.actual??"N/D"} / ${row.expected}`;
        grid.appendChild(el);
      }
    }
    return true;
  }

  function run(){
    const r=replay();
    if(!r||typeof r.self_test!=="function"){
      const result=normalize({checks:[]});
      renderResult(result);
      return result;
    }
    const before=typeof r.read==="function"?JSON.stringify(r.read()):null;
    const raw=r.self_test();
    try{r.render?.();}catch(_){}
    const after=typeof r.read==="function"?JSON.stringify(r.read()):null;
    const result=normalize(raw);
    result.safety.replay_result_store_unchanged=(before===null||after===null)?null:before===after;
    renderResult(result);
    return clone(result);
  }

  function exportJson(result){
    const payload=result||run();
    if(typeof Blob!=="undefined"){
      const blob=new Blob([JSON.stringify(payload,null,2)+"\n"],{type:"application/json"});
      const url=URL.createObjectURL(blob),a=document.createElement("a");
      a.href=url;a.download="STRATEGY_A_REPLAY_ACCEPTANCE.json";
      document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
    }
    return clone(payload);
  }

  function ensureStyle(){
    if(document.getElementById("strategyAReplayAcceptanceStyle406058"))return;
    const s=document.createElement("style");
    s.id="strategyAReplayAcceptanceStyle406058";
    s.textContent=`
      #${PANEL_ID}{margin:8px 0;padding:9px 10px;border:1px solid rgba(150,120,255,.24);border-radius:10px;background:rgba(9,8,24,.48)}
      #${PANEL_ID} .sara-head{display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap}
      #${PANEL_ID} .sara-title{font:950 9px/1.2 system-ui,sans-serif;letter-spacing:.08em;color:#c7b6ff}
      #${PANEL_ID} .sara-actions{display:flex;gap:5px;flex-wrap:wrap}
      #${PANEL_ID} .sara-summary{margin-top:6px;font:800 9px/1.25 system-ui,sans-serif;color:#9ab0c0}
      #${PANEL_ID} .sara-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;margin-top:7px}
      #${PANEL_ID} .sara-case{padding:6px;border-radius:7px;border:1px solid rgba(255,255,255,.07);font:700 8px/1.2 system-ui,sans-serif;color:#b8cad7}
      #${PANEL_ID} .sara-case[data-pass="true"]{border-color:rgba(91,219,171,.3);color:#9aefc3}
      #${PANEL_ID} .sara-case[data-pass="false"]{border-color:rgba(255,112,112,.35);color:#ffaaaa}
      @media(max-width:950px){#${PANEL_ID} .sara-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}`;
    document.head.appendChild(s);
  }

  function anchor(){
    return document.getElementById("strategyAReplaySandbox404290")
      || document.getElementById("strategyACanonicalSpec406056")
      || document.querySelector("[data-strategy-a-replay]")
      || null;
  }

  function mount(){
    ensureStyle();
    let panel=document.getElementById(PANEL_ID);
    if(panel)return true;
    const host=anchor();
    if(!host)return false;
    panel=document.createElement("section");
    panel.id=PANEL_ID;
    panel.dataset.strategyAReplayAcceptanceBuild=BUILD;
    panel.innerHTML='<div class="sara-head"><div class="sara-title">REPLAY ACCEPTANCE MATRIX · 7 CHEMINS · ISOLÉE DU LIVE</div><div class="sara-actions"><button type="button" class="btn small" data-sara-run>EXÉCUTER 7/7</button><button type="button" class="btn small" data-sara-export>EXPORTER</button></div></div><div class="sara-summary" data-sara-summary>Non exécutée — clic opérateur requis.</div><div class="sara-grid" data-sara-grid></div>';
    host.insertAdjacentElement("afterend",panel);
    panel.querySelector("[data-sara-run]")?.addEventListener("click",run);
    panel.querySelector("[data-sara-export]")?.addEventListener("click",()=>exportJson());
    document.documentElement.dataset.strategyAReplayAcceptance406058="mounted";
    return true;
  }

  function mountWhenReady(){
    if(mount())return;
    // One bounded readiness bridge only: replay/spec panels are created during DOMContentLoaded.
    // Disconnect immediately after mount; no recurring observer remains.
    const observer=new MutationObserver(()=>{if(mount())observer.disconnect();});
    observer.observe(document.body,{childList:true,subtree:true});
    queueMicrotask(()=>{if(mount())observer.disconnect();});
    window.addEventListener("load",()=>{mount();observer.disconnect();},{once:true});
  }

  const api=Object.freeze({
    build:BUILD,expected:clone(EXPECTED),run,normalize,mount,export_json:exportJson,
    automatic_run:false,paper_only:true,real_orders:false,network:false,
    storage_write:false,recurring_timer:false,recurring_observer:false
  });
  globalThis.AgentCryptoStrategyAReplayAcceptance406058=api;
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mountWhenReady,{once:true});
  else mountWhenReady();
})();
