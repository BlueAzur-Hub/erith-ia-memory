/* Agent-Crypto @erith.IA — 40.6.230 LEGACY EVIDENCE READABILITY
   Preserves the existing 40.6.219 operator compatibility behavior and adds a
   presentation-only distinction between current G3 truth and historical evidence.
   No evidence row is deleted, collapsed, rewritten or promoted. No Market Core or
   Strategy A business logic is changed. PAPER ONLY · G3 PENDING · G9 LOCKED. */
(() => {
  "use strict";
  const BUILD = "40.6.230";
  const CREATOR_ID = "administratorCreatorShortcut406219";
  const STYLE_ID = "administratorOperatorCompatibility406219Style";
  const FOUNDATION_SRC = "./js/strategy-a-foundation-delegated-certification-406219.js?release=40.6.219";
  const BADGE_CLASS = "aof230-evidence-era";
  let queued = false;

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

  function ensureStyle() {
    if (byId(STYLE_ID)) {
      const existing = byId(STYLE_ID);
      if (!existing.textContent.includes("aof230-evidence-era")) existing.textContent += legacyStyle();
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
    ` + legacyStyle();
    document.head.appendChild(style);
  }

  function legacyStyle() {
    return `
      .${BADGE_CLASS}{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 8px;padding:6px 9px;border:1px solid rgba(122,160,184,.22);border-radius:8px;background:rgba(8,17,27,.72);font:800 9px/1.25 system-ui,sans-serif;letter-spacing:.045em;color:#9fb4c1}
      .${BADGE_CLASS}[data-era="superseded"]{border-color:rgba(255,190,92,.30);background:rgba(78,55,13,.16);color:#e7be70}
      .${BADGE_CLASS}[data-era="current"]{border-color:rgba(73,224,183,.38);background:rgba(18,82,69,.18);color:#74e7c5}
      .${BADGE_CLASS} small{font:700 9px/1.35 system-ui,sans-serif;letter-spacing:0;color:#8297a6}
      [data-aof230-evidence-era="historical"]{border-style:dashed!important}
      [data-aof230-evidence-era="superseded"]{border-color:rgba(255,190,92,.24)!important}
      [data-aof230-evidence-era="current"]{box-shadow:0 0 0 1px rgba(73,224,183,.08) inset}
    `;
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

  function badge(node, era, title, detail) {
    if (!node) return false;
    node.dataset.aof230EvidenceEra = era;
    let marker = node.querySelector(`:scope > .${BADGE_CLASS}`);
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

    for (const [id, era, title] of LEGACY_EVIDENCE) {
      const node = byId(id);
      if (!node) continue;
      const detail = era === "superseded"
        ? "Conservé pour audit · vérité opérateur actuelle : 40.6.228 / 40.6.229."
        : "Conservé comme preuve antérieure · ne définit plus à lui seul l’état courant de Gate 3.";
      if (badge(node, era, title, detail)) {
        if (era === "superseded") superseded++;
        else historical++;
      }
    }

    for (const [id, title] of CURRENT_EVIDENCE) {
      if (badge(byId(id), "current", title, "Autorité opérateur courante · G3 reste PENDING · G9 LOCKED.")) current++;
    }

    const dossier = byId("strategyADossier");
    if (dossier) dossier.dataset.aof230Readability = "legacy-evidence-labelled";
    return Object.freeze({historical,superseded,current});
  }

  function refresh(reason = "explicit") {
    if (typeof document === "undefined") return Object.freeze({build:BUILD,available:false});
    cleanupFailedWrappers();
    ensureStyle();
    const creator = ensureCreatorShortcut();
    const loaded = ensureFoundationLoader();
    const eras = markEvidenceEra();
    try { globalThis.AgentCryptoStrategyAFoundationDelegatedCertification?.run?.(`operator-refresh:${reason}`); } catch (_) {}
    return Object.freeze({
      build:BUILD,
      canonical_header_preserved:true,
      creator_shortcut_present:!!creator,
      foundation_owner_available:!!globalThis.AgentCryptoStrategyAFoundationDelegatedCertification,
      foundation_loader_already_available:loaded,
      readability_wrapper_removed:true,
      legacy_evidence_readability:true,
      evidence_eras:eras,
      presentation_only_except_delegated_foundation_loader:true,
      market_core_modified:false,
      strategy_a_business_logic_modified:false,
      gate_state_modified:false,
      real_order:false
    });
  }

  function schedule(reason = "event") {
    if (queued) return;
    queued = true;
    const run = () => { queued=false; refresh(reason); };
    try { requestAnimationFrame(run); } catch (_) { queueMicrotask(run); }
  }

  globalThis.AgentCryptoAdministratorOperatorFocus = Object.freeze({
    build:BUILD,
    refresh,
    markEvidenceEra,
    mount:"CANONICAL_HEADER_PRESERVED_PLUS_LEGACY_EVIDENCE_LABELS",
    presentation_only:false,
    delegated_foundation_loader:true,
    legacy_evidence_readability:true,
    recurring_timer:false,
    observer:false,
    storage_write:false,
    business_network_request:false,
    market_core_modified:false,
    strategy_a_business_logic_modified:false,
    gate_state_modified:false,
    real_order:false
  });

  if (typeof document !== "undefined") {
    document.addEventListener("agent-crypto:runtime-modules-ready", () => schedule("runtime-modules-ready"), {once:true});
    document.addEventListener("erith:system-hydrated", () => schedule("system-hydrated"), {once:true,passive:true});
    document.addEventListener("agent-crypto:evidence-data-changed", () => schedule("evidence-data-changed"), {passive:true});
    document.addEventListener("agent-crypto:evidence-refresh-complete", () => schedule("evidence-refresh-complete"), {passive:true});
    document.addEventListener("toggle", event => {
      if (event?.target?.closest?.("#strategyADossier,#strategyAEvidenceSupplements") || event?.target?.id === "strategyADossier") schedule("toggle");
    }, true);
    window.addEventListener("pageshow", () => schedule("pageshow"));
    window.addEventListener("load", () => schedule("load"), {once:true});
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => schedule("dom-ready"), {once:true});
    else schedule("script-load");
  }
})();
