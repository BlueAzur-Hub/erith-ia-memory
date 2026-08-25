/* Agent-Crypto @erith.IA — 40.4.3
   MODULAR PRESENTATION BOUNDARY / ATLAS 02 + ORACLE SUITE + OPERATIONS 03 EXTRACTION
   Presentation is externalized; shared truth/state/memory/engines remain in the main runtime. */
(()=>{
  "use strict";
  const BUILD="40.4.3";
  const REGISTRY=Object.freeze({
    build:BUILD,
    mode:"atlas-oracle-operations-extracted-boot-parity",
    extraction_active:true,
    runtime_mutation:false,
    network_fetch:false,
    duplicate_engine:false,
    hosts:Object.freeze({atlas:"atlas-view-host",oracle:"oracle-view-host",operations:"operations-view-host"}),
    fragments:Object.freeze({atlas:"./views/atlas.html",oracle:"./views/oracle.html",operations:"./views/operations.html"}),
    legacy_owner:"./index.html",
    oracle:Object.freeze({
      status:"external-presentation-parser-mounted",
      family:"01 · Analyse & décision",
      suite:"Oracle — Analyse prospective & preuves",
      canonical_fragment:"./views/oracle.html",
      transport:"./js/views/oracle-presentation.js",
      anchors:Object.freeze(["oracle-analysis-suite","oracle-lab-dashboard","oracle-infrastructure-observatory","oracle-evidence-explorer"]),
      rule:"presentation moved; Oracle engine/Evidence/history remain shared and persistent"
    }),
    atlas:Object.freeze({
      status:"external-presentation-parser-mounted",
      family:"02 · Intelligence, mémoire & création",
      canonical_fragment:"./views/atlas.html",
      transport:"./js/views/atlas-presentation.js",
      anchors:Object.freeze(["atlasLayoutFamily02","atlas-local-ai-collapse","decision-board","atlasMultiCollectorDetails40357"]),
      rule:"presentation moved; Atlas truth/state/memory remain shared and persistent"
    }),
    operations:Object.freeze({
      status:"external-presentation-parser-mounted",
      family:"03 · Préparation & opérations",
      canonical_fragment:"./views/operations.html",
      transport:"./js/views/operations-presentation.js",
      anchors:Object.freeze(["atlasLayoutFamily03","situation","questionnaire","briefing","planning"]),
      rule:"presentation moved; operator state/questionnaire/briefing/planning logic remain shared in the main runtime"
    }),
    invariants:Object.freeze([
      "one document",
      "one Binance/WebSocket owner",
      "one V7/IndexedDB owner",
      "one Evidence owner",
      "one Oracle engine owner",
      "one Atlas truth/state owner",
      "Atlas family 02 IDs exist before downstream runtime scripts execute",
      "Oracle suite IDs exist before downstream runtime scripts execute",
      "Operations family 03 IDs exist before downstream runtime scripts execute",
      "view extraction must not reset retained runtime state",
      "hidden or unmounted presentation is not an engine OFF command"
    ])
  });
  function snapshot(){
    const ids=[...REGISTRY.oracle.anchors,...REGISTRY.atlas.anchors,...REGISTRY.operations.anchors];
    const present=Object.fromEntries(ids.map(id=>[id,!!document.getElementById(id)]));
    return Object.freeze({build:BUILD,mode:REGISTRY.mode,present,checked_at:new Date().toISOString()});
  }
  function publish(){try{globalThis.__AGENT_CRYPTO_PRESENTATION_BOUNDARY_SNAPSHOT_40403__=snapshot();}catch(_){}}
  try{globalThis.AgentCryptoPresentationBoundaries40403=Object.freeze({...REGISTRY,snapshot});}catch(_){}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",publish,{once:true});else publish();
})();
