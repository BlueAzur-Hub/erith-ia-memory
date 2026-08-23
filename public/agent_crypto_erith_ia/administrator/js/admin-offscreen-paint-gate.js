(() => {
  "use strict";

  const BUILD = "40.3.33";
  const ROOT_CLASS = "atlas-offscreen-paint-gate-40333";
  const SLEEP_CLASS = "atlas-offscreen-paint-sleep-40333";
  const ROOT_MARGIN = "2400px 0px 2400px 0px";
  const FLOATING_SELECTOR = ".admin-native-floating-shell,.admin-native-direct-floating,[data-admin-native-shell]";

  const TARGET_SELECTORS = Object.freeze([
    "main > #market-zone",
    "main > #atlasMetalsAnalysisFoundation",
    "main > section.atlas-family-member",
    "main > details.atlas-family-member",
    "main > #missions-vie",
    "main > details.life-project-collapse",
    "main > details.live-sources-collapse",
    "#atlasLocalReportSuite",
    "#atlasSharedSynthesisCard > section",
    "#atlasSharedSynthesisCard > details"
  ]);

  const state = {
    supported: "IntersectionObserver" in window,
    enabled: false,
    targets: 0,
    sleeping: 0,
    sleeps: 0,
    wakes: 0,
    callbacks: 0,
    last_path: "boot",
    last_target: null,
    root_margin: ROOT_MARGIN
  };

  let observer = null;
  let targets = [];
  let targetSet = new Set();

  function collectTargets() {
    const set = new Set();
    for (const selector of TARGET_SELECTORS) {
      document.querySelectorAll(selector).forEach((node) => set.add(node));
    }
    return [...set];
  }

  function rebuildTargetSet(nextTargets) {
    targets = nextTargets;
    targetSet = new Set(nextTargets);
    state.targets = targets.length;
  }

  function floatingOwned(element) {
    if (!(element instanceof Element)) return false;
    return !!element.closest(FLOATING_SELECTOR) || !!element.querySelector(FLOATING_SELECTOR);
  }

  function mustStayAwake(element) {
    if (!(element instanceof Element)) return true;
    const active = document.activeElement;
    if (active instanceof Element && (active === element || element.contains(active))) return true;
    if (floatingOwned(element)) return true;
    return false;
  }

  function setAwake(element, awake, reason) {
    if (!(element instanceof Element)) return;
    if (!awake && mustStayAwake(element)) awake = true;

    const wasSleeping = element.classList.contains(SLEEP_CLASS);
    if (awake && wasSleeping) {
      element.classList.remove(SLEEP_CLASS);
      state.sleeping = Math.max(0, state.sleeping - 1);
      state.wakes += 1;
    } else if (!awake && !wasSleeping) {
      element.classList.add(SLEEP_CLASS);
      state.sleeping += 1;
      state.sleeps += 1;
    }

    state.last_path = reason;
    state.last_target = element.id || element.dataset?.adminNativeWindow || element.tagName;
  }

  function wakeAll(reason = "manual") {
    for (const element of targets) setAwake(element, true, reason);
    return state.sleeping;
  }

  function targetChainForNode(node) {
    const chain = [];
    let element = node instanceof Element ? node : null;
    while (element && element !== document.body) {
      if (targetSet.has(element)) chain.push(element);
      element = element.parentElement;
    }
    return chain;
  }

  function wakeNodeChain(node, reason) {
    const chain = targetChainForNode(node);
    for (const element of chain) setAwake(element, true, reason);
    return chain.length;
  }

  function wakeHashTarget(reason = "hash") {
    const rawHash = location.hash ? location.hash.slice(1) : "";
    if (!rawHash) return 0;
    let id = rawHash;
    try { id = decodeURIComponent(rawHash); } catch (_) { /* preserve raw hash */ }
    const node = document.getElementById(id);
    return wakeNodeChain(node, reason);
  }

  function attachObserver() {
    if (!state.supported || !targets.length) {
      state.enabled = false;
      state.last_path = "fallback-visible";
      wakeAll("fallback-visible");
      return false;
    }

    observer = new IntersectionObserver((entries) => {
      state.callbacks += 1;
      for (const entry of entries) {
        setAwake(
          entry.target,
          entry.isIntersecting,
          entry.isIntersecting ? "observer-wake" : "observer-sleep"
        );
      }
    }, { root: null, rootMargin: ROOT_MARGIN, threshold: 0 });

    for (const element of targets) observer.observe(element);
    state.enabled = true;
    state.last_path = "observer-active";
    return true;
  }

  function refresh() {
    wakeAll("refresh");
    observer?.disconnect();
    observer = null;
    rebuildTargetSet(collectTargets());
    attachObserver();
    wakeHashTarget("refresh-hash");
    return { ...state };
  }

  function init() {
    document.documentElement.classList.add(ROOT_CLASS);
    rebuildTargetSet(collectTargets());
    attachObserver();
    wakeHashTarget("initial-hash");

    document.addEventListener("focusin", (event) => {
      wakeNodeChain(event.target, "focus");
    }, true);

    document.addEventListener("click", (event) => {
      const source = event.target instanceof Element ? event.target : null;
      const link = source?.closest('a[href^="#"]');
      if (!link) return;
      const href = link.getAttribute("href") || "";
      let id = href.slice(1);
      try { id = decodeURIComponent(id); } catch (_) { /* preserve raw id */ }
      if (id) wakeNodeChain(document.getElementById(id), "anchor");
    }, true);

    window.addEventListener("hashchange", () => wakeHashTarget("hashchange"), { passive: true });
    window.addEventListener("beforeprint", () => wakeAll("print"), { passive: true });
  }

  globalThis.AtlasOffscreenPaint40333 = Object.freeze({
    build: BUILD,
    policy: "existing native sections only; visibility paint sleep; no DOM relocation/content-visibility/contain",
    state: () => ({ ...state }),
    wakeAll,
    refresh
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
