/* Agent-Crypto @erith.IA — 40.4.6
   ORACLE UI CONTINUITY / EXCLUSIVE HEAVY ACCORDION OWNER
   Presentation only. No engine OFF, no fetch, timer, observer or storage mutation. */
(()=>{
  "use strict";
  const BUILD="40.4.6";
  const suite=document.getElementById("oracle-analysis-suite");
  if(!suite || suite.dataset.oracleUiContinuity40406==="1") return;
  suite.dataset.oracleUiContinuity40406="1";
  const members=[
    document.getElementById("oracle-models-calibration"),
    suite.querySelector('[data-collapse-key="oracle-sources-runtime"]'),
    document.getElementById("oracle-evidence-explorer")
  ].filter(node=>node instanceof HTMLDetailsElement);
  const onToggle=event=>{
    const active=event.currentTarget;
    if(!active.open) return;
    members.forEach(other=>{ if(other!==active && other.open) other.open=false; });
  };
  members.forEach(node=>node.addEventListener("toggle",onToggle));
  try{
    globalThis.__AGENT_CRYPTO_ORACLE_UI_CONTINUITY_40406__=Object.freeze({
      build:BUILD,
      suite:"oracle-analysis-suite",
      members:Object.freeze(members.map(node=>node.id||node.dataset.collapseKey||"oracle-subsection")),
      one_heavy_subsection_open_at_once:true,
      collapsed_preview_owner:"existing Oracle V1 mirror",
      network_fetch:false,
      new_timer:false,
      new_observer:false,
      storage_mutation:false,
      oracle_engine_changed:false
    });
  }catch(_){}
})();
