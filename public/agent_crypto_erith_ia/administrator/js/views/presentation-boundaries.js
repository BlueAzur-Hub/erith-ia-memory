/* Agent-Crypto @erith.IA — 40.4.67
   MODULAR PRESENTATION BOUNDARY / ATLAS TRUE SOURCE-LAZY TRUTH
   Presentation is externalized; shared truth/state/memory/engines remain in the main runtime. */
(()=>{
  "use strict";
  const BUILD="40.4.67";
  const REGISTRY=Object.freeze({
    build:BUILD,
    mode:"atlas-source-lazy-oracle-true-lazy-operations-projects-lazy-system-partial-lazy",
    extraction_active:true,runtime_mutation:false,network_fetch:true,
    network_fetch_scope:"Atlas/Oracle/Operations/System/Projects canonical same-origin fragments only after their own demand boundaries",
    duplicate_engine:false,
    hosts:Object.freeze({atlas:"atlas-view-host",oracle:"oracle-view-host",operations:"operations-view-host",system:"system-view-host",projects:"projects-view-host"}),
    fragments:Object.freeze({atlas:"./views/atlas.html",oracle:"./views/oracle.html",operations:"./views/operations.html",system:"./views/system.html",projects:"./views/projects.html"}),
    legacy_owner:"./index.html",
    oracle:Object.freeze({status:"external-presentation-shell-mounted-heavy-bodies-lazy",family:"01 · Analyse & décision",suite:"Oracle — Analyse prospective & preuves",canonical_fragment:"./views/oracle.html",transport:"./js/views/oracle-presentation.js",anchors:Object.freeze(["oracle-analysis-suite","oracle-models-calibration","oracle-evidence-explorer"]),rule:"40.4.41 true-lazy heavy bodies; Oracle engine/Evidence/history remain shared and persistent"}),
    atlas:Object.freeze({status:"external-presentation-shell-mounted-source-lazy",family:"02 · Intelligence, mémoire & création",canonical_fragment:"./views/atlas.html",transport:"./js/views/atlas-presentation.js",anchors:Object.freeze(["atlasLayoutFamily02","atlas-local-ai-collapse"]),rule:"40.4.67 shells only at boot; heavy Atlas markup fetched/hydrated on disclosure; Atlas truth/state/memory/CURRENT remain shared and persistent"}),
    operations:Object.freeze({status:"external-presentation-shell-mounted-body-lazy",family:"03 · Préparation & opérations",canonical_fragment:"./views/operations.html",transport:"./js/views/operations-presentation.js",anchors:Object.freeze(["atlasLayoutFamily03","situation","questionnaire","briefing","planning"]),rule:"header + four stable shells at boot; bodies hydrate on first disclosure"}),
    system:Object.freeze({status:"external-presentation-partial-lazy",family:"04 · Expérimentation & système",canonical_fragment:"./views/system.html",transport:"./js/views/system-presentation.js",anchors:Object.freeze(["atlasLayoutFamily04","atlasStorageHealth40198","atlasGreyPlateForensic40393","simulation","commandes","backend","safety","physical-security"]),rule:"40.4.24 peripheral bodies lazy; Storage/Grey/Simulation still resident before 40.4.68"}),
    projects:Object.freeze({status:"external-presentation-shell-mounted-body-lazy",family:"@erith.IA · Missions de vie",canonical_fragment:"./views/projects.html",transport:"./js/views/projects-presentation.js",anchors:Object.freeze(["missions-vie","fonds-erith-ia","association-erith-ia","aerith-enfance","aerith-animaux","aerith-terre-vivante"]),rule:"Missions hero + five shells at boot; project bodies hydrate on disclosure"}),
    invariants:Object.freeze(["one document","one Binance/WebSocket owner","one V7/IndexedDB owner","one Evidence owner","one Oracle engine owner","one Atlas truth/state owner","Atlas CURRENT engine remains resident even when Atlas presentation is absent","Atlas shell IDs exist before downstream runtime scripts execute","late Atlas action bindings are idempotently rebound after hydration","Operations/Projects stable proxy anchors preserve routing","hidden or unmounted presentation is not an engine OFF command","no financial execution owner added"])
  });
  function snapshot(){
    const ids=[...REGISTRY.oracle.anchors,...REGISTRY.atlas.anchors,...REGISTRY.operations.anchors,...REGISTRY.system.anchors,...REGISTRY.projects.anchors];
    const present=Object.fromEntries(ids.map(id=>[id,!!document.getElementById(id)]));
    return Object.freeze({build:BUILD,mode:REGISTRY.mode,present,atlas_lazy:globalThis.ErithAtlasPresentation40467?.snapshot?.()||null,oracle_lazy:globalThis.ErithOraclePresentation?.snapshot?.()||null,operations_lazy:globalThis.ErithOperationsPresentation40421?.snapshot?.()||null,projects_lazy:globalThis.ErithProjectsPresentation40420?.snapshot?.()||null,checked_at:new Date().toISOString()});
  }
  function publish(){try{globalThis.__AGENT_CRYPTO_PRESENTATION_BOUNDARY_SNAPSHOT_40405__=snapshot();}catch(_){}}
  globalThis.AgentCryptoPresentationBoundaries40405=Object.freeze({...REGISTRY,snapshot});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",publish,{once:true});else publish();
})();
