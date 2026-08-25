/* Agent-Crypto @erith.IA — 40.4.0
   MODULAR PRESENTATION BOUNDARY / INERT SCAFFOLD
   Inventory only. No DOM move, clone, hide, fetch, mount or render in this build. */
(()=>{
  "use strict";
  const BUILD="40.4.0";
  const REGISTRY=Object.freeze({
    build:BUILD,
    mode:"legacy-dom-inventory",
    extraction_active:false,
    runtime_mutation:false,
    network_fetch:false,
    duplicate_engine:false,
    future_hosts:Object.freeze({atlas:"atlas-view-host",oracle:"oracle-view-host"}),
    future_fragments:Object.freeze({atlas:"./views/atlas.html",oracle:"./views/oracle.html"}),
    legacy_owner:"./index.html",
    oracle:Object.freeze({
      status:"legacy-in-index",
      anchors:Object.freeze(["oracle-analysis-suite","oracle-lab-dashboard","oracle-infrastructure-observatory","oracle-evidence-explorer"]),
      rule:"presentation may move later; Oracle engine/Evidence/history remain shared and persistent"
    }),
    atlas:Object.freeze({
      status:"legacy-in-index",
      anchors:Object.freeze(["atlas-local-ai-collapse","decision-board","atlasMultiCollectorDetails40357"]),
      rule:"presentation may move later; Atlas truth/state/memory remain shared and persistent"
    }),
    invariants:Object.freeze([
      "one document",
      "one Binance/WebSocket owner",
      "one V7/IndexedDB owner",
      "one Evidence owner",
      "one Oracle engine owner",
      "one Atlas truth/state owner",
      "view extraction must not reset retained runtime state",
      "hidden or unmounted presentation is not an engine OFF command"
    ])
  });
  function snapshot(){
    const ids=[...REGISTRY.oracle.anchors,...REGISTRY.atlas.anchors];
    const present=Object.fromEntries(ids.map(id=>[id,!!document.getElementById(id)]));
    return Object.freeze({build:BUILD,mode:REGISTRY.mode,present,checked_at:new Date().toISOString()});
  }
  function publish(){try{globalThis.__AGENT_CRYPTO_PRESENTATION_BOUNDARY_SNAPSHOT_40400__=snapshot();}catch(_){}}
  try{globalThis.AgentCryptoPresentationBoundaries40400=Object.freeze({...REGISTRY,snapshot});}catch(_){ }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",publish,{once:true});else publish();
})();
