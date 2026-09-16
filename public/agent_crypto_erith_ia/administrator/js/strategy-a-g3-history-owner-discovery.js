/* Agent-Crypto @erith.IA — 40.6.171 G3 HISTORY OWNER DISCOVERY
   Passive repository/runtime ownership discovery for Strategy A historical evidence.
   Distinguishes canonical Market Memory from the exact 24h chart series owner.
   No backtest, no gate promotion, no timer, no observer, no storage write, no network/order path. */
(() => {
  "use strict";
  const BUILD = "40.6.171";
  const ROOT_ID = "strategyAG3HistoryOwnerDiscovery";
  const DOSSIER_ID = "strategyADossier";
  const AFTER_ID = "strategyAG3StructuredTruth";
  const safeCall = (fn, fallback = null) => { try { return typeof fn === "function" ? fn() : fallback; } catch (_) { return fallback; } };
  const byId = id => typeof document !== "undefined" ? document.getElementById(id) : null;
  const integerOrNull = v => { if (v === null || v === undefined || typeof v === "boolean" || (typeof v === "string" && !v.trim())) return null; const n = Number(v); return Number.isFinite(n) ? Math.trunc(n) : null; };

  function explicitSeriesOwner() {
    for (const [name, api] of [["AgentCryptoMarketSeriesTruth", globalThis.AgentCryptoMarketSeriesTruth],["AgentCryptoHistoricalSeries", globalThis.AgentCryptoHistoricalSeries]]) {
      const snap = safeCall(api?.snapshot, null);
      if (snap && typeof snap === "object") return { name, available:true, snapshot:snap };
    }
    return null;
  }

  function snapshot(overrides = {}) {
    const stats = Object.prototype.hasOwnProperty.call(overrides,"market") ? overrides.market : safeCall(globalThis.atlasDecisionMemoryStats, null);
    const retro = Object.prototype.hasOwnProperty.call(overrides,"retrospective") ? overrides.retrospective : safeCall(globalThis.atlasRetrospectiveValidation?.derive, null);
    const explicit = Object.prototype.hasOwnProperty.call(overrides,"series") ? overrides.series : explicitSeriesOwner();
    const rows = Array.isArray(stats?.canonicalRecords) ? stats.canonicalRecords : Array.isArray(stats?.records) ? stats.records : [];
    const marketAvailable = !!stats && typeof stats === "object";
    const explicitAvailable = !!explicit?.available;
    return {
      schema:"agent_crypto_strategy_a_g3_history_owner_discovery_v1",
      build:BUILD,
      canonical_market_history:{
        owner:marketAvailable ? "atlasDecisionMemoryStats" : null,
        repository_source:marketAvailable ? "js/market-memory-collector.js" : null,
        available:marketAvailable,
        basis:stats?.basis || stats?.analyticalBasis || null,
        canonical_rows:integerOrNull(stats?.canonicalCount ?? stats?.distinctCount ?? rows.length),
        source_rows:integerOrNull(stats?.sourceRecordCount),
        collectors:Array.isArray(stats?.collectors) ? stats.collectors.length : null,
        rows_exposed:rows.length
      },
      retrospective_outcomes:{
        owner:retro && typeof retro === "object" ? "atlasRetrospectiveValidation.derive" : null,
        available:!!retro && typeof retro === "object",
        strict_time_semantics:retro?.strict_time_semantics === true,
        current_total:Array.isArray(retro?.currents) ? retro.currents.length : integerOrNull(retro?.current_count),
        current_evaluable:Array.isArray(retro?.evaluable) ? retro.evaluable.length : integerOrNull(retro?.evaluable_count)
      },
      exact_chart_24h_series:{
        owner:explicitAvailable ? explicit.name : null,
        available:explicitAvailable,
        status:explicitAvailable ? "EXPLICIT_STRUCTURED_OWNER" : "UNRESOLVED",
        certification_use:explicitAvailable ? "CANDIDATE_ONLY" : "NONE"
      },
      discovery_result: marketAvailable ? "CANONICAL_MARKET_MEMORY_OWNER_PROVEN" : "NO_CANONICAL_HISTORY_OWNER",
      chart_owner_claimed:false,
      visible_text_parsing:false,
      dataset_ready:false,
      backtest_ready:false,
      g3_state:"PENDING",
      paper_only:true,
      real_order:false,
      reason: explicitAvailable
        ? "Canonical Market Memory and an explicit structured chart-series owner are visible; neither creates replay labels or a G3 PASS."
        : "Canonical historical market observations are owned by atlasDecisionMemoryStats / Market Memory. The exact displayed 24h chart-series owner is not yet exposed as a certified structured API; no 300-point claim is promoted."
    };
  }

  function ensureStyle(){
    if (typeof document === "undefined" || byId(`${ROOT_ID}Style`)) return;
    const s=document.createElement("style"); s.id=`${ROOT_ID}Style`;
    s.textContent=`#${ROOT_ID}{margin-top:9px;padding:8px;border:1px solid rgba(106,196,255,.24);border-radius:8px;background:rgba(5,20,34,.32)}#${ROOT_ID} .t{font-size:8px;font-weight:950;letter-spacing:.08em;color:#72d8ff;text-transform:uppercase}#${ROOT_ID} .sub,#${ROOT_ID} .note{font-size:8px;color:#91adbd;margin-top:3px}#${ROOT_ID} .g{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px;margin-top:7px}#${ROOT_ID} .k{padding:6px;border:1px solid rgba(255,255,255,.06);border-radius:7px}#${ROOT_ID} .k span{font-size:7px;color:#7694a5;display:block;text-transform:uppercase}#${ROOT_ID} .k b{font-size:9px;color:#effaff;display:block;margin-top:3px}@media(max-width:900px){#${ROOT_ID} .g{grid-template-columns:repeat(2,minmax(0,1fr))}}`;
    document.head.appendChild(s);
  }
  function ensureRoot(){
    if (typeof document === "undefined") return null;
    const dossier=byId(DOSSIER_ID); if(!dossier) return null;
    let root=byId(ROOT_ID); if(root) return root;
    root=document.createElement("section"); root.id=ROOT_ID; root.dataset.build=BUILD;
    const after=byId(AFTER_ID); if(after && after.parentElement===dossier) after.insertAdjacentElement("afterend",root); else dossier.appendChild(root);
    return root;
  }
  function show(v){ return v===null||v===undefined||v==="" ? "INCONNU" : String(v); }
  function render(){
    const data=snapshot(); const root=ensureRoot(); if(!root) return data; ensureStyle();
    const m=data.canonical_market_history, r=data.retrospective_outcomes, c=data.exact_chart_24h_series;
    root.innerHTML=`<div class="t">G3 · HISTORY OWNER DISCOVERY · ${BUILD}</div><div class="sub">Découverte d'autorité structurée uniquement · aucune donnée écran promue en preuve.</div><div class="g">
      <div class="k"><span>Owner historique canonique</span><b>${show(m.owner)}</b></div><div class="k"><span>Lignes canoniques</span><b>${show(m.canonical_rows)}</b></div><div class="k"><span>Lignes source</span><b>${show(m.source_rows)}</b></div><div class="k"><span>Collecteurs</span><b>${show(m.collectors)}</b></div><div class="k"><span>Base</span><b>${show(m.basis)}</b></div>
      <div class="k"><span>Owner outcomes</span><b>${show(r.owner)}</b></div><div class="k"><span>Temps strict</span><b>${r.strict_time_semantics?"OUI":"NON / INCONNU"}</b></div><div class="k"><span>Owner série 24h exacte</span><b>${show(c.owner)}</b></div><div class="k"><span>Statut série 24h</span><b>${c.status}</b></div><div class="k"><span>G3</span><b>PENDING</b></div>
    </div><div class="note">${data.reason}</div>`;
    root.dataset.chart24hOwnerStatus=c.status; root.dataset.g3State="PENDING"; return data;
  }
  function selfTest(){
    const mock=snapshot({market:{canonicalCount:3,sourceRecordCount:4,collectors:["a","b"],basis:"MARKET",canonicalRecords:[{},{},{}]},retrospective:{strict_time_semantics:true,current_count:2,evaluable_count:1},series:null});
    const pass=mock.canonical_market_history.owner==="atlasDecisionMemoryStats"&&mock.canonical_market_history.canonical_rows===3&&mock.exact_chart_24h_series.status==="UNRESOLVED"&&mock.chart_owner_claimed===false&&mock.backtest_ready===false&&mock.g3_state==="PENDING";
    return {schema:"agent_crypto_strategy_a_g3_history_owner_discovery_self_test_v1",build:BUILD,pass};
  }
  globalThis.AgentCryptoStrategyAG3HistoryOwnerDiscovery=Object.freeze({build:BUILD,snapshot,render,self_test:selfTest,visible_text_parsing:false,chart_owner_claimed:false,backtest_ready:false,g3:"PENDING",recurring_timer:false,observer:false,storage_write:false,network:false,real_order:false,paper_only:true});
  if(typeof document!=="undefined"){
    const schedule=()=>{try{requestAnimationFrame(()=>render());}catch(_){queueMicrotask(render);}};
    document.addEventListener("agent-crypto:evidence-view-refreshed",schedule); document.addEventListener("agent-crypto:evidence-data-changed",schedule); document.addEventListener("agent-crypto:runtime-modules-ready",schedule,{once:true}); window.addEventListener("pageshow",schedule); if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true}); else schedule();
  }
})();