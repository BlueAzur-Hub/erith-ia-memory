/* Agent-Crypto @erith.IA — 40.6.215 ADMINISTRATOR OPERATOR FOCUS UX
   Presentation/navigation only. Adds a readable operator strip, stronger hierarchy
   for Evidence, direct section jumps, and a safe full-banner crop for Aerith-10
   Créatrice. No Market Core, Strategy A, Atlas, Oracle, Risk, Gate, storage, network
   or order behavior is changed. */
(() => {
  "use strict";
  const BUILD = "40.6.215";
  const ROOT_ID = "administratorOperatorFocus406215";
  let queued = false;

  const byId = id => document.getElementById(id);
  const esc = v => String(v ?? "—").replace(/[&<>\"]/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;"}[m]));

  function ensureStyle() {
    if (byId(`${ROOT_ID}Style`)) return;
    const style = document.createElement("style");
    style.id = `${ROOT_ID}Style`;
    style.textContent = `
      #${ROOT_ID}{position:sticky;top:6px;z-index:1750;margin:8px 12px;padding:8px 10px;border:1px solid rgba(111,238,255,.26);border-radius:12px;background:rgba(4,15,27,.93);backdrop-filter:blur(12px);box-shadow:0 10px 28px rgba(0,0,0,.25);display:flex;align-items:center;gap:8px;flex-wrap:wrap}
      #${ROOT_ID} .aof-state{flex:1 1 360px;min-width:250px;font:850 11px/1.3 system-ui,sans-serif;color:#e7f8ff}
      #${ROOT_ID} .aof-state b{color:#9fffd9}#${ROOT_ID} .aof-nav{display:flex;gap:6px;flex-wrap:wrap}
      #${ROOT_ID} button{appearance:none;border:1px solid rgba(255,255,255,.14);border-radius:999px;background:rgba(255,255,255,.055);color:#ddecf4;padding:7px 10px;font:900 10px/1 system-ui,sans-serif;cursor:pointer}
      #${ROOT_ID} button:hover{border-color:rgba(120,238,255,.42);background:rgba(73,192,226,.12)}
      #${ROOT_ID} button[data-aof="creator"]{border-color:rgba(255,176,232,.25);color:#ffd2ef}
      #strategyAEvidenceSupplements{font-size:12px!important;line-height:1.45!important}
      #strategyAEvidenceSupplements .saesh-title{font-size:12px!important;letter-spacing:.07em!important}
      #strategyAEvidenceSupplements .saesh-sub,#strategyAEvidenceSupplements .saesh-state{font-size:10px!important}
      #strategyAEvidenceSupplements section [style*="font-size:8px"],#strategyAEvidenceSupplements section [style*="font-size: 8px"]{font-size:10.5px!important;line-height:1.4!important}
      #strategyAEvidenceSupplements section [style*="font-size:7px"],#strategyAEvidenceSupplements section [style*="font-size: 7px"]{font-size:9.5px!important}
      #strategyAEvidenceSupplements small{font-size:9.5px!important}
      #strategyAEvidenceSupplements b{line-height:1.35}
      #strategyAG3CascadeCheckpoint,#strategyAG3DurableDecisionEvidence,#strategyAG3PostHorizonOutcome,#strategyAG3T0WindowOverlapProof{box-shadow:0 0 0 1px rgba(118,235,255,.06),0 8px 18px rgba(0,0,0,.12)}
      #strategyAG3StructuredTruth,#strategyAG3HistoryOwnerDiscovery,#strategyAG3HistoricalEvidenceAdapter,#strategyAG3T0DecisionProof,#strategyAG3ReplayDataset,#strategyAG3DecisionReplay{opacity:.86}
      .aerith10-loader-card::before{background-size:contain!important;background-position:center top!important;background-repeat:no-repeat!important;background-color:rgba(7,10,20,.88)!important;min-height:160px!important;max-height:none!important}
      .aerith10-creator-quick-link[data-aof-enhanced="true"]{font-weight:950!important;outline:1px solid rgba(255,177,231,.16);outline-offset:1px}
      @media(max-width:900px){#${ROOT_ID}{top:3px;margin:5px 6px}.aerith10-loader-card::before{min-height:120px!important}}
    `;
    document.head.appendChild(style);
  }

  function findSection(regex) {
    const candidates = Array.from(document.querySelectorAll("h1,h2,h3,h4,summary,.section-title,.panel-title"));
    const hit = candidates.find(n => regex.test(String(n.textContent || "").replace(/\s+/g," ").trim()));
    return hit?.closest?.("section,details,article,main") || hit || null;
  }

  function resolveTarget(name) {
    if (name === "top") return document.body;
    if (name === "evidence") return byId("strategyAEvidenceSupplements") || byId("strategyADossier");
    if (name === "creator") return byId("aerith10-creator");
    if (name === "simulation") return findSection(/Simulation micro-transactions|Pilote de simulation/i);
    if (name === "market") return findSection(/Comparaison BTC|Prix du marché des cryptomonnaies|MARKET SNAPSHOT/i);
    return null;
  }

  function jump(name) {
    if (name === "top") { window.scrollTo({top:0,behavior:"smooth"}); return true; }
    const target = resolveTarget(name);
    if (!target) return false;
    if (name === "creator" && "open" in target) target.open = true;
    target.scrollIntoView({behavior:"smooth",block:"start"});
    return true;
  }

  function humanState() {
    let cp = null, out = null;
    try { cp = globalThis.AgentCryptoStrategyAG3CascadeCheckpoint?.snapshot?.() || null; } catch (_) {}
    try { out = globalThis.AgentCryptoStrategyAG3PostHorizonOutcome?.snapshot?.() || null; } catch (_) {}
    const blocker = cp?.checkpoint?.blocker || "ÉTAT EN COURS";
    if (blocker === "READY_FOR_DECISION_REPLAY") {
      const got = Number(out?.certified_horizons || 0), total = Number(out?.expected_horizons || 0);
      return `<b>Gate 3 · replay prêt.</b> Résultats après décision : ${esc(got)} / ${esc(total)} horizon(s) observé(s).`;
    }
    if (blocker === "NO_T0_DECISION_INSIDE_CERTIFIED_WINDOW") return `<b>Gate 3.</b> L’historique doit encore rattraper la décision PAPER.`;
    if (blocker === "NO_CERTIFIED_T0_DECISION") return `<b>Gate 3.</b> Aucune décision PAPER certifiée n’est encore disponible.`;
    if (blocker === "TEMPORAL_WINDOW_NOT_CERTIFIED") return `<b>Gate 3.</b> La fenêtre historique 24 h n’est pas encore certifiée.`;
    return `<b>Gate 3.</b> ${esc(blocker)}`;
  }

  function ensureRoot() {
    ensureStyle();
    let root = byId(ROOT_ID);
    if (!root) {
      root = document.createElement("nav");
      root.id = ROOT_ID;
      root.setAttribute("aria-label","Navigation opérateur Administrator");
      root.innerHTML = `<div class="aof-state" data-aof-state></div><div class="aof-nav"><button type="button" data-aof="top">↑ Haut</button><button type="button" data-aof="market">Marché</button><button type="button" data-aof="simulation">Simulation</button><button type="button" data-aof="evidence">Gate 3 / preuves</button><button type="button" data-aof="creator">Créatrice</button></div>`;
      const clusters = byId("atlasProjectsCluster")?.parentElement;
      const anchor = clusters?.parentElement || document.querySelector("header") || document.body.firstElementChild;
      if (anchor?.parentElement) anchor.insertAdjacentElement("afterend",root);
      else document.body.prepend(root);
      root.addEventListener("click", event => {
        const b = event.target.closest?.("button[data-aof]");
        if (b) jump(b.dataset.aof);
      });
    }
    root.dataset.build = BUILD;
    const state = root.querySelector("[data-aof-state]");
    if (state) state.innerHTML = humanState();
    document.querySelectorAll('a[href="#aerith10-creator"]').forEach(a => a.dataset.aofEnhanced = "true");
    return root;
  }

  function refresh() { ensureRoot(); return {build:BUILD,root_present:!!byId(ROOT_ID),creator_present:!!byId("aerith10-creator"),evidence_present:!!byId("strategyAEvidenceSupplements")}; }
  function schedule() { if (queued) return; queued=true; const run=()=>{queued=false;refresh();}; try{requestAnimationFrame(run);}catch(_){queueMicrotask(run);} }

  globalThis.AgentCryptoAdministratorOperatorFocus = Object.freeze({
    build: BUILD, root_id: ROOT_ID, refresh, jump,
    presentation_only: true, recurring_timer:false, observer:false, storage_write:false,
    business_network_request:false, market_core_modified:false, strategy_a_business_logic_modified:false,
    real_order:false
  });

  document.addEventListener("agent-crypto:evidence-refresh-complete",schedule);
  document.addEventListener("agent-crypto:evidence-data-changed",schedule);
  window.addEventListener("pageshow",schedule);
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded",schedule,{once:true}); else schedule();
})();
