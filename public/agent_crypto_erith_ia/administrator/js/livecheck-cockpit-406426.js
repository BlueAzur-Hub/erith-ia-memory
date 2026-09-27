/* Agent-Crypto @erith.IA — 40.6.426
   LIVECHECK COCKPIT / F11 VIEWPORT FIT
   Event-driven geometry only: no timer, no observer, no storage, no DOM move.
   ♥ Aether/Menu stays at the top. Graph + Technical Reading consume the middle.
   Target Top 5 ends the viewport. Market Flow remains untouched below the fold. */
(() => {
  "use strict";

  const BUILD = "40.6.426";
  const ROOT = document.documentElement;
  const ACTIVE_ATTR = "data-atlas-livecheck-cockpit";
  const HEIGHT_VAR = "--atlas-livecheck-cockpit-market-height";
  const MIN_WIDTH = 1101;
  const MIN_MARKET_HEIGHT = 430;
  const BOTTOM_GUARD = 4;
  let resizeFrame = 0;

  const byId = id => document.getElementById(id);
  const livecheckLink = () => document.querySelector('[data-atlas-essential-target="livecheck"]');
  const targetTop = () => document.querySelector("#market-workspace > .top5-ribbon");
  const viewportHeight = () => Math.max(0, document.documentElement.clientHeight || window.innerHeight || 0);

  function isSupportedSurface() {
    const domain = String(ROOT.dataset.atlasMarketDomain || "crypto").toLowerCase();
    return window.innerWidth >= MIN_WIDTH && domain !== "metals";
  }

  function measureNaturalBudget() {
    const live = byId("livecheck");
    const market = byId("market-zone");
    const top5 = targetTop();
    if (!(live instanceof HTMLElement) || !(market instanceof HTMLElement) || !(top5 instanceof HTMLElement)) return null;

    const liveRect = live.getBoundingClientRect();
    const marketRect = market.getBoundingClientRect();
    const top5Rect = top5.getBoundingClientRect();
    const vh = viewportHeight();
    if (!(vh > 0 && liveRect.height > 0 && top5Rect.height > 0)) return null;

    const gapLiveToMarket = Math.max(0, marketRect.top - liveRect.bottom);
    const gapMarketToTop5 = Math.max(0, top5Rect.top - marketRect.bottom);
    const available = Math.floor(
      vh
      - liveRect.height
      - gapLiveToMarket
      - gapMarketToTop5
      - top5Rect.height
      - BOTTOM_GUARD
    );

    return {
      viewport_height: Math.round(vh),
      livecheck_height: Math.round(liveRect.height),
      top5_height: Math.round(top5Rect.height),
      gap_live_market: Math.round(gapLiveToMarket),
      gap_market_top5: Math.round(gapMarketToTop5),
      market_height: Math.max(MIN_MARKET_HEIGHT, available)
    };
  }

  function scrollCockpitToTop() {
    const live = byId("livecheck");
    if (!(live instanceof HTMLElement)) return false;
    const top = Math.max(0, Math.round(window.scrollY + live.getBoundingClientRect().top - 2));
    window.scrollTo({ top, left: window.scrollX, behavior: "auto" });
    return true;
  }

  function applyGeometry(reason = "operator") {
    if (ROOT.getAttribute(ACTIVE_ATTR) !== "1" || !isSupportedSurface()) return false;
    const budget = measureNaturalBudget();
    if (!budget) return false;

    ROOT.style.setProperty(HEIGHT_VAR, `${budget.market_height}px`);
    ROOT.dataset.atlasLivecheckCockpitBuild = BUILD;
    ROOT.dataset.atlasLivecheckCockpitReason = reason;
    ROOT.dataset.atlasLivecheckCockpitMarketHeight = String(budget.market_height);
    ROOT.dataset.atlasLivecheckCockpitViewportHeight = String(budget.viewport_height);

    scrollCockpitToTop();

    globalThis.__AGENT_CRYPTO_LIVECHECK_COCKPIT_406426__ = Object.freeze({
      build: BUILD,
      active: true,
      reason,
      ...budget,
      market_flow_hidden: false,
      market_flow_moved: false,
      target_top_terminal_visible_strip: true,
      recurring_timer: false,
      observer: false,
      storage_write: false,
      window_manager_write: false,
      market_core_modified: false
    });
    return true;
  }

  function activate(reason = "livecheck") {
    if (!isSupportedSurface()) return false;

    // Measure before enabling the final CSS authority, so the two natural gaps
    // surrounding #market-zone remain the source of truth.
    const budget = measureNaturalBudget();
    if (!budget) return false;

    ROOT.style.setProperty(HEIGHT_VAR, `${budget.market_height}px`);
    ROOT.setAttribute(ACTIVE_ATTR, "1");
    ROOT.dataset.atlasLivecheckCockpitBuild = BUILD;
    ROOT.dataset.atlasLivecheckCockpitReason = reason;
    ROOT.dataset.atlasLivecheckCockpitMarketHeight = String(budget.market_height);
    ROOT.dataset.atlasLivecheckCockpitViewportHeight = String(budget.viewport_height);

    scrollCockpitToTop();

    globalThis.__AGENT_CRYPTO_LIVECHECK_COCKPIT_406426__ = Object.freeze({
      build: BUILD,
      active: true,
      reason,
      ...budget,
      market_flow_hidden: false,
      market_flow_moved: false,
      target_top_terminal_visible_strip: true,
      recurring_timer: false,
      observer: false,
      storage_write: false,
      window_manager_write: false,
      market_core_modified: false
    });
    return true;
  }

  function deactivate(reason = "navigation") {
    ROOT.removeAttribute(ACTIVE_ATTR);
    ROOT.style.removeProperty(HEIGHT_VAR);
    delete ROOT.dataset.atlasLivecheckCockpitMarketHeight;
    delete ROOT.dataset.atlasLivecheckCockpitViewportHeight;
    ROOT.dataset.atlasLivecheckCockpitReason = reason;
    return true;
  }

  function scheduleResizeFit(reason = "viewport-resize") {
    if (ROOT.getAttribute(ACTIVE_ATTR) !== "1") return;
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      applyGeometry(reason);
    });
  }

  document.addEventListener("click", event => {
    const control = event.target instanceof Element
      ? event.target.closest("[data-atlas-essential-target]")
      : null;
    if (!(control instanceof HTMLElement)) return;

    const target = String(control.dataset.atlasEssentialTarget || "");
    if (target === "livecheck") {
      activate("livecheck-quick-link");
      return;
    }

    if (ROOT.getAttribute(ACTIVE_ATTR) === "1") deactivate(`navigation:${target || "other"}`);
  }, true);

  window.addEventListener("resize", () => scheduleResizeFit("viewport-resize"), { passive: true });

  globalThis.AgentCryptoLivecheckCockpit406426 = Object.freeze({
    build: BUILD,
    activate,
    deactivate,
    refit: () => applyGeometry("manual-refit"),
    snapshot: () => ({
      build: BUILD,
      active: ROOT.getAttribute(ACTIVE_ATTR) === "1",
      market_height: Number(ROOT.dataset.atlasLivecheckCockpitMarketHeight || 0),
      viewport_height: Number(ROOT.dataset.atlasLivecheckCockpitViewportHeight || 0),
      market_flow_hidden: false,
      market_flow_moved: false,
      recurring_timer: false,
      observer: false,
      storage_write: false,
      window_manager_write: false,
      market_core_modified: false
    })
  });

  // The script is loaded after the interface markup. No automatic activation:
  // Livecheck remains the explicit operator action that opens this cockpit view.
  void livecheckLink();
})();
