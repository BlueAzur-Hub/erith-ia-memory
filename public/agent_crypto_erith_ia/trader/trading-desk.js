(() => {
  "use strict";
  const BUILD = "40.6.573";
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
    phase: "light-shell",
    duplicatedBusinessLogic: false,
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

  syncViewport();
  window.addEventListener("resize", syncViewport, { passive: true });
})();
