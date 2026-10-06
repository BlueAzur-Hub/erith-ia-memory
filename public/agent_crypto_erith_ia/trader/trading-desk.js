(() => {
  "use strict";
  const BUILD = "40.6.572";
  const PARENT = "40.6.571";
  const profileNode = document.getElementById("viewportProfile");

  function viewportProfile() {
    const w = window.innerWidth || 0;
    if (w >= 1500) return "wide";
    if (w >= 1180) return "desktop";
    if (w >= 800) return "transformer";
    if (w >= 620) return "compact";
    return "mobile";
  }

  function syncViewport() {
    const profile = viewportProfile();
    document.documentElement.dataset.traderViewport = profile;
    if (profileNode) profileNode.textContent = "viewport · " + profile;
  }

  globalThis.AgentCryptoTraderFoundation = Object.freeze({
    build: BUILD,
    parentAdministrator: PARENT,
    surface: "trader",
    execution: "disabled",
    phase: "foundation",
    duplicatedBusinessLogic: false,
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
        parent_administrator: PARENT,
        viewport: viewportProfile(),
        execution: "disabled",
        duplicated_business_logic: false
      };
    }
  });

  syncViewport();
  window.addEventListener("resize", syncViewport, { passive: true });
})();
