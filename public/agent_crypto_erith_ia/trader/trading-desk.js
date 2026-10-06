(() => {
  "use strict";
  const BUILD = "40.6.576";
  const ADMIN_BASE = "40.6.571";
  const profileNode = document.getElementById("viewportProfile");

  function viewportProfile() {
    const w = window.innerWidth || 0;
    if (w >= 1500) return "wide";
    if (w >= 1180) return "desktop";
    if (w >= 820) return "compact-desktop";
    return "mobile";
  }

  function syncViewport() {
    const profile = viewportProfile();
    document.documentElement.dataset.traderViewport = profile;
    if (profileNode) profileNode.textContent = "viewport · " + profile;
  }

  function togglePanel(button) {
    const id = button.dataset.collapseTarget;
    const panel = id ? document.getElementById(id) : null;
    if (!panel) return;
    const collapsed = panel.dataset.collapsed === "true";
    const next = !collapsed;
    panel.dataset.collapsed = String(next);
    button.setAttribute("aria-expanded", String(!next));
    button.textContent = next ? "Afficher" : "Réduire";
  }

  document.addEventListener("click", event => {
    const button = event.target instanceof Element ? event.target.closest("[data-collapse-target]") : null;
    if (button) togglePanel(button);
  });

  globalThis.AgentCryptoTraderFoundation = Object.freeze({
    build: BUILD,
    administratorBase: ADMIN_BASE,
    surface: "trader",
    execution: "disabled",
    phase: "depth-owner-plus-rail-collapse",
    duplicatedBusinessLogic: false,
    mountedOwners: Object.freeze({ candles: true, market: false, depth: true, technicalReading: false, mathCore: false }),
    shellBehaviors: Object.freeze({ supportRailCollapsesOnDepthMinimize: true, graphReclaimsWidth: true }),
    omittedSections: Object.freeze(["Aether","Atlas","Oracle","Veille","Sources","Decision Board","Other Administrator sections"]),
    canonicalOwners: Object.freeze({
      market: "../administrator/app.js#marketSnapshotPanel",
      candles: "../administrator/js/market-microscope-candles.js",
      depth: "../administrator/js/okx-microstructure-406499.js",
      technicalReading: "../administrator/app.js#detailPanel",
      mathCore: "../administrator/app.js#math",
      quoteCurrency: "../administrator/js/quote-currency-architecture-406497.js"
    }),
    snapshot() {
      return {
        build: BUILD,
        administrator_base: ADMIN_BASE,
        viewport: viewportProfile(),
        execution: "disabled",
        duplicated_business_logic: false
      };
    }
  });

  function mountExistingCandlesOwner() {
    const quote = globalThis.AgentCryptoQuoteCurrencyArchitecture;
    const candles = globalThis.AgentCryptoMarketMicroscope;
    try { quote?.setDisplayCurrency?.("USD", { reason: "trader-default-usd" }); } catch (_) {}
    const mounted = !!candles?.mount?.();
    if (mounted) {
      try { candles.setMode?.("candles"); } catch (_) {}
      document.documentElement.dataset.traderCandlesOwner = "mounted";
    } else {
      document.documentElement.dataset.traderCandlesOwner = "missing";
    }
    return mounted;
  }

  function mountExistingDepthOwner() {
    const depth = globalThis.AgentCryptoOkxMicrostructure;
    const mounted = !!depth?.mount?.();
    if (mounted) {
      try { depth.setOpen?.(true); } catch (_) {}
      document.documentElement.dataset.traderDepthOwner = "mounted";
    } else {
      document.documentElement.dataset.traderDepthOwner = "missing";
    }
    return mounted;
  }

  function depthSnapshot() {
    try { return globalThis.AgentCryptoOkxMicrostructure?.snapshot?.() || null; } catch (_) { return null; }
  }

  function syncSupportRail() {
    const snap = depthSnapshot();
    const compact = !!snap && (snap.minimized === true || snap.open === false);
    document.body.dataset.traderRailCompact = compact ? "true" : "false";
    return compact;
  }

  function restoreSupportRail() {
    document.body.dataset.traderRailCompact = "false";
    const depth = globalThis.AgentCryptoOkxMicrostructure;
    try { depth?.setMinimized?.(false); } catch (_) {}
    try { depth?.setOpen?.(true); } catch (_) {}
    requestAnimationFrame(syncSupportRail);
  }

  document.getElementById("traderDetailRailToggle")?.addEventListener("click", restoreSupportRail);

  document.addEventListener("click", event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    if (target.closest("#atlasOkxMicrostructure [data-oms-minimize], #atlasOkxMicrostructure [data-oms-close]")) {
      requestAnimationFrame(() => requestAnimationFrame(syncSupportRail));
    }
  }, true);

  const bootOwners = () => {
    syncViewport();
    mountExistingCandlesOwner();
    mountExistingDepthOwner();
    requestAnimationFrame(syncSupportRail);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootOwners, { once: true });
  } else {
    bootOwners();
  }
  window.addEventListener("pageshow", () => {
    mountExistingCandlesOwner();
    mountExistingDepthOwner();
    requestAnimationFrame(syncSupportRail);
  }, { passive: true });
  window.addEventListener("resize", syncViewport, { passive: true });
})();
