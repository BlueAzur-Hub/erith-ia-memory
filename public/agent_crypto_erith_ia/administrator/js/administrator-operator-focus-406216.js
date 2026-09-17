/* Agent-Crypto @erith.IA — 40.6.231 LEGACY LABELS MOUNT REPAIR
   Preserves the 40.6.219 operator compatibility behavior, the 40.6.230 evidence-era
   labels, and repairs their mount timing after lazy hydration/render cycles.
   No evidence value is rewritten. No Market Core or Strategy A business logic is changed.
   PAPER ONLY · G3 PENDING · G9 LOCKED. */
(() => {
  "use strict";
  const BUILD = "40.6.231";
  const CREATOR_ID = "administratorCreatorShortcut406219";
  const STYLE_ID = "administratorOperatorCompatibility406219Style";
  const FOUNDATION_SRC = "./js/strategy-a-foundation-delegated-certification-406219.js?release=40.6.219";
  const BADGE_CLASS = "aof231-evidence-era";
  const LEGEND_ID = "strategyAG3EvidenceEraLegend406231";
  let queued = false;
  let lastReceipt = null;

  const byId = id => typeof document !== "undefined" ? document.getElementById(id) : null;

  const LEGACY_EVIDENCE = Object.freeze([
    ["strategyAG3StructuredTruth", "historical", "PREUVE HISTORIQUE · lecture audit"],
    ["strategyAG3HistoryOwnerDiscovery", "historical", "PREUVE HISTORIQUE · lecture audit"],
    ["strategyAG3HistoricalEvidenceAdapter", "historical", "PREUVE HISTORIQUE · lecture audit"],
    ["strategyAG3T0DecisionProof", "historical", "PREUVE HISTORIQUE · lecture audit"],
    ["strategyAG3ReplayDataset", "historical", "PREUVE HISTORIQUE · lecture audit"],
    ["strategyAG3DecisionReplay", "historical", "PREUVE HISTORIQUE · lecture audit"],
    ["strategyAG3CascadeCheckpoint", "historical", "PREUVE HISTORIQUE · checkpoint 40.6.200"],
    ["strategyAG3ProspectiveT0Capture", "historical", "PREUVE HISTORIQUE · capture T0"],
    ["strategyAG3DurableDecisionEvidence", "historical", "PREUVE HISTORIQUE · mémoire durable"],
    ["strategyAG3T0WindowOverlapProof", "historical", "PREUVE HISTORIQUE · overlap T0"],
    ["strategyAG3PostHorizonOutcome", "superseded", "SUPERSEDED · ancienne sémantique horizon"],
    ["strategyAG3OutcomeCertification406222", "superseded", "SUPERSEDED · receipt 40.6.222"],
    ["strategyAG3RealisticReplayReadiness406223", "superseded", "SUPERSEDED · readiness 40.6.223"],
    ["strategyAG3CurrentTruthSurface406225", "superseded", "SUPERSEDED · résumé 40.6.225"],
    ["strategyAG3StrictDecisionTimeTruth406226", "superseded", "SUPERSEDED · vérité T0 40.6.226"],
    ["strategyAG3StrictTruthMountProof406227", "superseded", "SUPERSEDED · preuve de montage 40.6.227"]
  ]);

  const CURRENT_EVIDENCE = Object.freeze([
    ["strategyAG3StrictOutcomeRevalidation406228", "ACTUEL · vérité données + outcomes"],
    ["strategyAG3StrictExecutionRealismRebind406229", "ACTUEL · chantier G3 · réalisme d’exécution"]
  ]);

  function cleanupFailedWrappers() {
    [
      "administratorOperatorFocus406215",
      "administratorOperatorFocus406216",
      "administratorOperatorFocus406217",
      "administratorOperatorFocus406218",
      "administratorOperatorEvidenceSummary406217",
      "administratorOperatorEvidenceSummary406218",
      "administratorCreatorShortcut406217",
      "administratorCreatorShortcut406218"
    ].forEach(id => byId(id)?.remove());
    byId("strategyADossier")?.classList.remove("aof218-collapsed");
    byId("strategyAEvidenceSupplements")?.classList.remove("aof218-simple");
  }

  function evidenceStyle() {
    return `
      #${LEGEND_ID}{margin:10px 0;padding:10px 12px;border:1px solid rgba(73,224,183,.30);border-radius:10px;background:rgba(8,27,31,.78);color:#dbe7ef;font:800 10px/1.45 system-ui,sans-serif}
      #${LEGEND_ID} strong{color:#78efd0;letter-spacing:.06em}
      #${LEGEND_ID} span{color:#9fb4c1;font-weight:700}
      .${BADGE_CLASS}{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 8px;padding:6px 9px;border:1px solid rgba(122,160,184,.22);border-radius:8px;background:rgba(8,17,27,.72);font:800 9px/1.25 system-ui,sans-serif;letter-spacing:.045em;color:#9fb4c1}
      .${BADGE_CLASS}[data-era="historical"]{border-style:dashed}
      .${BADGE_CLASS}[data-era="superseded"]{border-color:rgba(255,190,92,.30);background:rgba(78,55,13,.16);color:#e7be70}
      .${BADGE_CLASS}[data-era="current"]{border-color:rgba(73,224,183,.38);background:rgba(18,82,69,.18);color:#74e7c5}
      .${BADGE_CLASS} small{font:700 9px/1.35 system-ui,sans-serif;letter-spacing:0;color:#8297a6}
      [data-aof231-evidence-era="historical"]{border-style:dashed!important}
      [data-aof231-evidence-era="superseded"]{border-color:rgba(255,190,92,.24)!important}
      [data-aof231-evidence-era="current"]{box-shadow:0 0 0 1px rgba(73,224,183,.08) inset}
    `;
  }

  function ensureStyle() {
    const existing = byId(STYLE_ID);
    if (existing) {
      if (!existing.textContent.includes(BADGE_CLASS)) existing.textContent += evidenceStyle();
      return;
    }
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #strategyAEvidenceSupplements{font-size:12px!important;line-height:1.55!important}
      #strategyAEvidenceSupplements .saesh-title{font-size:13px!important;letter-spacing:.055em!important}
      #strategyAEvidenceSupplements .saesh-sub,#strategyAEvidenceSupplements .saesh-state{font-size:11px!important;line-height:1.45!important}
      #strategyADossier [style*="font-size:7px"],#strategyADossier [style*="font-size: 7px"]{font-size:10px!important;line-height:1.45!important}
      #strategyADossier [style*="font-size:8px"],#strategyADossier [style*="font-size: 8px"]{font-size:10.5px!important;line-height:1.45!important}
      #strategyADossier [style*="font-size:9px"],#strategyADossier [style*="font-size: 9px"]{font-size:11px!important;line-height:1.45!important}
      .aerith10-loader-card::before{background-size:contain!important;background-position:center top!important;background-repeat:no-repeat!important;background-color:rgba(7,10,20,.88)!important;min-height:160px!important;max-height:none!important}
      #${CREATOR_ID}{margin-left:6px;border:1px solid rgba(255,176,232,.28);border-radius:999px;background:rgba(255,255,255,.045);color:#ffd2ef;padding:6px 9px;font:900 9px/1 system-ui,sans-serif;cursor:pointer}
      #${CREATOR_ID}:hover{background:rgba(255,176,232,.10)}
      @media(max-width:620px){.aerith10-loader-card::before{min-height:120px!important}}
    ` + evidenceStyle();
    document.head.appendChild(style);
  }

  function ensureCreatorShortcut() {
    let button = byId(CREATOR_ID);
    const anchor = byId("atlasProjectsCluster");
    if (!anchor?.parentElement) return null;
    if (!button) {
      button = document.createElement("button");
      button.id = CREATOR_ID;
      button.type = "button";
      button.textContent = "Créatrice";
      button.setAttribute("aria-label", "Ouvrir Aerith-10 Créatrice");
      button.addEventListener("click", () => {
        const target = byId("aerith10-creator");
        if (!target) return;
        if ("open" in target) target.open = true;
        target.scrollIntoView({behavior:"smooth",block:"start"});
      });
    }
    if (button.parentElement !== anchor.parentElement || button.previousElementSibling !== anchor) anchor.insertAdjacentElement("afterend", button);
    return button;
  }

  function ensureFoundationLoader() {
    if (globalThis.AgentCryptoStrategyAFoundationDelegatedCertification) return true;
    if (document.querySelector('script[data-agent-crypto-foundation-219="true"]')) return false;
    const script = document.createElement("script");
    script.src = FOUNDATION_SRC;
    script.async = false;
    script.dataset.agentCryptoFoundation219 = "true";
    script.addEventListener("load", () => {
      try { globalThis.AgentCryptoStrategyAFoundationDelegatedCertification?.run?.("operator-compatibility-load"); } catch (_) {}
    }, {once:true});
    (document.body || document.documentElement).appendChild(script);
    return false;
  }

  function stableHost() {
    return byId("strategyADossier")
      || byId("strategyAEvidenceSupplements")
      || byId("strategyAG3StrictOutcomeRevalidation406228")?.parentElement
      || byId("strategyAG3StrictExecutionRealismRebind406229")?.parentElement
      || null;
  }

  function ensureLegend() {
    const host = stableHost();
    if (!host) return null;
    let node = byId(LEGEND_ID);
    if (!node) {
      node = document.createElement("div");
      node.id = LEGEND_ID;
      node.setAttribute("role", "note");
    }
    node.innerHTML = `<strong>LECTURE G3 · 40.6.231</strong> · ACTUEL = 40.6.228 / 40.6.229 · <span>PREUVE HISTORIQUE = trace conservée · SUPERSEDED = conclusion remplacée · G3 PENDING · G9 LOCKED.</span>`;
    const anchor = byId("strategyAG3StrictOutcomeRevalidation406228") || byId("strategyAG3StrictExecutionRealismRebind406229");
    if (anchor?.parentElement === host) {
      if (node.parentElement !== host || node.nextElementSibling !== anchor) host.insertBefore(node, anchor);
    } else if (node.parentElement !== host) host.prepend(node);
    return node;
  }

  function badge(node, era, title, detail) {
    if (!node) return false;
    node.dataset.aof231EvidenceEra = era;
    let marker = Array.from(node.children || []).find(child => child?.classList?.contains(BADGE_CLASS));
    if (!marker) {
      marker = document.createElement("div");
      marker.className = BADGE_CLASS;
      node.prepend(marker);
    }
    marker.dataset.era = era;
    marker.innerHTML = `<span>${title}</span><small>${detail}</small>`;
    return true;
  }

  function markEvidenceEra() {
    let historical = 0;
    let superseded = 0;
    let current = 0;
    let missing = 0;

    for (const [id, era, title] of LEGACY_EVIDENCE) {
      const node = byId(id);
      if (!node) { missing++; continue; }
      const detail = era === "superseded"
        ? "Conservé pour audit · vérité opérateur actuelle : 40.6.228 / 40.6.229."
        : "Conservé comme preuve antérieure · ne définit plus à lui seul l’état courant de Gate 3.";
      if (badge(node, era, title, detail)) {
        if (era === "superseded") superseded++;
        else historical++;
      }
    }

    for (const [id, title] of CURRENT_EVIDENCE) {
      const node = byId(id);
      if (!node) { missing++; continue; }
      if (badge(node, "current", title, "Autorité opérateur courante · G3 reste PENDING · G9 LOCKED.")) current++;
    }

    const dossier = byId("strategyADossier");
    if (dossier) dossier.dataset.aof231Readability = "legacy-evidence-labelled";
    return Object.freeze({historical,superseded,current,missing});
  }

  function refresh(reason = "explicit") {
    if (typeof document === "undefined") return Object.freeze({build:BUILD,available:false});
    cleanupFailedWrappers();
    ensureStyle();
    const creator = ensureCreatorShortcut();
    const loaded = ensureFoundationLoader();
    const legend = ensureLegend();
    const eras = markEvidenceEra();
    try { globalThis.AgentCryptoStrategyAFoundationDelegatedCertification?.run?.(`operator-refresh:${reason}`); } catch (_) {}
    lastReceipt = Object.freeze({
      build:BUILD,
      reason,
      host_id:stableHost()?.id || null,
      legend_present:!!legend,
      evidence_eras:eras,
      canonical_header_preserved:true,
      creator_shortcut_present:!!creator,
      foundation_owner_available:!!globalThis.AgentCryptoStrategyAFoundationDelegatedCertification,
      foundation_loader_already_available:loaded,
      legacy_evidence_readability:true,
      mount_repair:true,
      presentation_only_except_delegated_foundation_loader:true,
      market_core_modified:false,
      strategy_a_business_logic_modified:false,
      gate_state_modified:false,
      real_order:false,
      paper_only:true,
      g3:"PENDING",
      g9:"LOCKED"
    });
    return lastReceipt;
  }

  function schedule(reason = "event") {
    if (queued) return;
    queued = true;
    const run = () => {
      try {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            queued = false;
            refresh(reason);
          });
        });
      } catch (_) {
        queueMicrotask(() => { queued=false; refresh(reason); });
      }
    };
    run();
  }

  globalThis.AgentCryptoAdministratorOperatorFocus = Object.freeze({
    build:BUILD,
    refresh,
    markEvidenceEra,
    snapshot:()=>lastReceipt || refresh("snapshot"),
    mount:"CANONICAL_HEADER_PRESERVED_PLUS_LEGACY_LABELS_MOUNT_REPAIR",
    presentation_only:false,
    delegated_foundation_loader:true,
    legacy_evidence_readability:true,
    legacy_labels_mount_repair:true,
    recurring_timer:false,
    observer:false,
    storage_write:false,
    business_network_request:false,
    market_core_modified:false,
    strategy_a_business_logic_modified:false,
    gate_state_modified:false,
    real_order:false,
    paper_only:true,
    g3:"PENDING",
    g9:"LOCKED"
  });

  if (typeof document !== "undefined") {
    document.addEventListener("agent-crypto:runtime-modules-ready", () => schedule("runtime-modules-ready"), {once:true});
    document.addEventListener("erith:system-hydrated", () => schedule("system-hydrated"), {passive:true});
    document.addEventListener("agent-crypto:evidence-data-changed", () => schedule("evidence-data-changed"), {passive:true});
    document.addEventListener("agent-crypto:evidence-refresh-complete", () => schedule("evidence-refresh-complete"), {passive:true});
    document.addEventListener("agent-crypto:market-series-updated", () => schedule("market-series-updated"), {passive:true});
    document.addEventListener("toggle", event => {
      if (event?.target?.closest?.("#strategyADossier,#strategyAEvidenceSupplements") || event?.target?.id === "strategyADossier") schedule("toggle-settled");
    }, true);
    document.addEventListener("click", event => {
      if (event?.target?.closest?.("#strategyADossier,#strategyAEvidenceSupplements")) schedule("click-settled");
    }, true);
    window.addEventListener("pageshow", () => schedule("pageshow"));
    window.addEventListener("load", () => schedule("load"), {once:true});
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => schedule("dom-ready"), {once:true});
    else schedule("script-load");
  }
})();
