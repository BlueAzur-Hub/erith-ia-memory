(() => {
  "use strict";

  const BUILD = "40.3.34";
  const ROOT_CLASS = "atlas-scroll-paint-continuity-40334";
  const MOVING_CLASS = "atlas-scroll-paint-moving-40334";
  const SLEEP_CLASS = "atlas-offscreen-paint-sleep-40334";
  const WAKE_MARGIN = "6000px 0px 6000px 0px";
  const SCROLL_IDLE_MS = 650;
  const BOOT_IDLE_MS = 1100;
  const SLEEP_BUFFER_PX = 5200;
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
    moving: false,
    targets: 0,
    sleeping: 0,
    sleeps: 0,
    wakes: 0,
    callbacks: 0,
    motion_starts: 0,
    idle_passes: 0,
    last_path: "boot",
    last_target: null,
    wake_margin: WAKE_MARGIN,
    sleep_buffer_px: SLEEP_BUFFER_PX,
    scroll_idle_ms: SCROLL_IDLE_MS
  };

  let observer = null;
  let targets = [];
  let targetSet = new Set();
  let idleTimer = 0;

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
    return wakeNodeChain(document.getElementById(id), reason);
  }

  function sleepFarTargets(reason = "idle-sleep") {
    if (state.moving || document.hidden) return state.sleeping;
    const viewportHeight = Math.max(window.innerHeight || 0, 1);
    const topLimit = -SLEEP_BUFFER_PX;
    const bottomLimit = viewportHeight + SLEEP_BUFFER_PX;

    for (const element of targets) {
      if (!(element instanceof Element)) continue;
      if (mustStayAwake(element)) {
        setAwake(element, true, reason + "-protected");
        continue;
      }
      const rect = element.getBoundingClientRect();
      const near = rect.bottom >= topLimit && rect.top <= bottomLimit;
      setAwake(element, near, near ? reason + "-near" : reason + "-far");
    }
    state.idle_passes += 1;
    return state.sleeping;
  }

  function finishMotion(reason = "motion-idle") {
    idleTimer = 0;
    sleepFarTargets(reason);
    state.moving = false;
    document.documentElement.classList.remove(MOVING_CLASS);
    state.last_path = reason;
  }

  function scheduleIdle(reason, delay = SCROLL_IDLE_MS) {
    if (idleTimer) window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => finishMotion(reason), delay);
  }

  function markMoving(reason = "scroll") {
    if (!state.moving) {
      state.moving = true;
      state.motion_starts += 1;
      document.documentElement.classList.add(MOVING_CLASS);
      /* Remove stale 40.3.34 sleep marks before the next paint. */
      wakeAll(reason + "-prewake");
    }
    state.last_path = reason;
    scheduleIdle(reason + "-idle");
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
        /* 40.3.34 observer is wake-only. Sleep is deferred to the idle pass. */
        if (entry.isIntersecting) setAwake(entry.target, true, "observer-prewake");
      }
    }, { root: null, rootMargin: WAKE_MARGIN, threshold: 0 });

    for (const element of targets) observer.observe(element);
    state.enabled = true;
    state.last_path = "observer-wake-only";
    return true;
  }

  function refresh() {
    if (idleTimer) window.clearTimeout(idleTimer);
    idleTimer = 0;
    state.moving = false;
    document.documentElement.classList.remove(MOVING_CLASS);
    wakeAll("refresh");
    observer?.disconnect();
    observer = null;
    rebuildTargetSet(collectTargets());
    attachObserver();
    wakeHashTarget("refresh-hash");
    scheduleIdle("refresh-idle", BOOT_IDLE_MS);
    return { ...state };
  }

  function onScrollKey(event) {
    if (event.defaultPrevented) return;
    const key = event.key;
    if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(key)) {
      markMoving("keyboard-scroll");
    }
  }

  function init() {
    document.documentElement.classList.remove("atlas-offscreen-paint-gate-40333");
    document.querySelectorAll(".atlas-offscreen-paint-sleep-40333").forEach((node) => {
      node.classList.remove("atlas-offscreen-paint-sleep-40333");
    });
    document.documentElement.classList.add(ROOT_CLASS);

    rebuildTargetSet(collectTargets());
    attachObserver();
    wakeHashTarget("initial-hash");

    /* wheel/keydown fire before the scroll paint; scroll covers scrollbar drag and programmatic movement. */
    window.addEventListener("wheel", () => markMoving("wheel"), { passive: true, capture: true });
    window.addEventListener("scroll", () => markMoving("scroll"), { passive: true, capture: true });
    window.addEventListener("keydown", onScrollKey, { capture: true });
    window.addEventListener("touchmove", () => markMoving("touchmove"), { passive: true, capture: true });

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

    window.addEventListener("hashchange", () => {
      markMoving("hashchange");
      wakeHashTarget("hashchange");
    }, { passive: true });

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        markMoving("visibility-return");
      }
    }, { passive: true });

    window.addEventListener("beforeprint", () => wakeAll("print"), { passive: true });

    /* Do not hide anything during initial construction; arm far-off sleep only after boot settles. */
    scheduleIdle("boot-idle", BOOT_IDLE_MS);
  }

  const api = Object.freeze({
    build: BUILD,
    policy: "scroll continuity first; observer wake-only; far-off sleep only after idle; no DOM relocation/content-visibility/contain",
    state: () => ({ ...state }),
    wakeAll,
    refresh,
    sleepFarTargets
  });

  globalThis.AtlasScrollPaint40334 = api;
  globalThis.AtlasOffscreenPaint40334 = api;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
