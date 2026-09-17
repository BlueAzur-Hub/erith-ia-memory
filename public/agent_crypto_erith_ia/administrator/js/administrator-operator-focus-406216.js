/* Agent-Crypto @erith.IA — 40.6.219 CERTIFICATION-FIRST OPERATOR COMPATIBILITY
   40.6.218 readability surface did not appear in the Firefox export. Do not keep
   iterating on cosmetic wrappers while the operator is fatigued. This compatibility
   asset preserves the canonical header, Créatrice framing and legible Evidence type,
   then loads the bounded G2/G7 delegated foundation certification owner.
   No Market Core or Strategy A business logic is changed. */
(() => {
  "use strict";
  const BUILD = "40.6.219";
  const CREATOR_ID = "administratorCreatorShortcut406219";
  const STYLE_ID = "administratorOperatorCompatibility406219Style";
  const FOUNDATION_SRC = "./js/strategy-a-foundation-delegated-certification-406219.js?release=40.6.219";
  let queued = false;

  const byId = id => typeof document !== "undefined" ? document.getElementById(id) : null;

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
    if (byId(STYLE_ID)) return;
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
    `;
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

  function refresh(reason = "explicit") {
    if (typeof document === "undefined") return Object.freeze({build:BUILD,available:false});
    cleanupFailedWrappers();
    ensureStyle();
    const creator = ensureCreatorShortcut();
    const loaded = ensureFoundationLoader();
    try { globalThis.AgentCryptoStrategyAFoundationDelegatedCertification?.run?.(`operator-refresh:${reason}`); } catch (_) {}
    return Object.freeze({
      build:BUILD,
      canonical_header_preserved:true,
      creator_shortcut_present:!!creator,
      foundation_owner_available:!!globalThis.AgentCryptoStrategyAFoundationDelegatedCertification,
      foundation_loader_already_available:loaded,
      readability_wrapper_removed:true,
      presentation_only_except_delegated_foundation_loader:true,
      market_core_modified:false,
      strategy_a_business_logic_modified:false,
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
    mount:"CANONICAL_HEADER_PRESERVED",
    presentation_only:false,
    delegated_foundation_loader:true,
    recurring_timer:false,
    observer:false,
    storage_write:false,
    business_network_request:false,
    market_core_modified:false,
    strategy_a_business_logic_modified:false,
    real_order:false
  });

  if (typeof document !== "undefined") {
    document.addEventListener("agent-crypto:runtime-modules-ready", () => schedule("runtime-modules-ready"), {once:true});
    document.addEventListener("erith:system-hydrated", () => schedule("system-hydrated"), {once:true,passive:true});
    window.addEventListener("pageshow", () => schedule("pageshow"));
    window.addEventListener("load", () => schedule("load"), {once:true});
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => schedule("dom-ready"), {once:true});
    else schedule("script-load");
  }
})();
