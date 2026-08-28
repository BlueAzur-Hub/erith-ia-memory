/* Agent-Crypto @erith.IA — 40.4.86
   SECONDARY ANALYSIS PRESENTATION TRUE-DEMAND
   News Sentinel, News-to-Market explanation and extended News source plan keep their summaries resident,
   while closed bodies leave the live document through the existing same-node presentation lifecycle.
   No clone, fetch, timer, observer, storage write or business engine is added. Metals 40.4.66 remains unchanged. */
(()=>{
  "use strict";
  const BUILD="40.4.86";
  const life=globalThis.ErithPresentationLifecycle;
  if(!life)return;
  const selectors=Object.freeze([
    '#news-sentinel',
    '#news-market-explanation',
    'details[data-collapse-key="news-plan"]'
  ]);
  const registration=life.registerClosedBodyFamily({id:"secondary-analysis",label:"Analyse secondaire · News",selectors});
  globalThis.ErithSecondaryDomainDemand40486=Object.freeze({
    build:BUILD,
    strategy:"closed-body-same-node-detach",
    selectors,
    registered:!!registration,
    news_runtime_network_gate:"news disclosure open + document visible",
    metals_runtime:"40.4.66 demand owner preserved",
    clone_used:false,
    fetch_added:false,
    timer_added:false,
    observer_added:false,
    storage_write_added:false,
    engine_state_changed:false,
    snapshot:()=>life.residencySnapshot()
  });
})();
