(() => {
  "use strict";

  const BUILD = "40.3.35";
  const ROOT_CLASS = "atlas-directional-paint-window-40335";
  const SLEEP_CLASS = "atlas-offscreen-paint-sleep-40335";
  const WAKE_MARGIN = "9000px 0px 9000px 0px";
  const SCROLL_IDLE_MS = 750;
  const BOOT_IDLE_MS = 1400;
  const SLEEP_BUFFER_PX = 7600;
  const MOTION_AHEAD_PX = 10000;
  const MOTION_BEHIND_PX = 2600;
  const MOTION_NEUTRAL_PX = 7000;
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
    direction: "idle",
    targets: 0,
    sleeping: 0,
    sleeps: 0,
    wakes: 0,
    callbacks: 0,
    motion_starts: 0,
    motion_frames: 0,
    band_wakes: 0,
    idle_passes: 0,
    last_path: "boot",
    last_target: null,
    wake_margin: WAKE_MARGIN,
    sleep_buffer_px: SLEEP_BUFFER_PX,
    motion_ahead_px: MOTION_AHEAD_PX,
    motion_behind_px: MOTION_BEHIND_PX,
    scroll_idle_ms: SCROLL_IDLE_MS
  };

  let observer = null;
  let targets = [];
  let targetSet = new Set();
  let idleTimer = 0;
  let motionRaf = 0;
  let lastScrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);
  let directionHint = "idle";

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
    if (!(element instanceof Element)) return false;
    if (!awake && mustStayAwake(element)) awake = true;

    const wasSleeping = element.classList.contains(SLEEP_CLASS);
    if (awake && wasSleeping) {
      element.classList.remove(SLEEP_CLASS);
      state.sleeping = Math.max(0, state.sleeping - 1);
      state.wakes += 1;
      state.last_path = reason;
      state.last_target = element.id || element.dataset?.adminNativeWindow || element.tagName;
      return true;
    }
    if (!awake && !wasSleeping) {
      element.classList.add(SLEEP_CLASS);
      state.sleeping += 1;
      state.sleeps += 1;
      state.last_path = reason;
      state.last_target = element.id || element.dataset?.adminNativeWindow || element.tagName;
      return true;
    }
    return false;
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

  function resolveDirection(currentY) {
    const delta = currentY - lastScrollY;
    if (Math.abs(delta) >= 2) return delta > 0 ? "down" : "up";
    return directionHint === "down" || directionHint === "up" ? directionHint : "neutral";
  }

  function wakeMotionBand(reason = "motion-band") {
    motionRaf = 0;
    if (document.hidden) return 0;

    const currentY = Math.max(0, window.scrollY || window.pageYOffset || 0);
    const direction = resolveDirection(currentY);
    lastScrollY = currentY;
    directionHint = "idle";
    state.direction = direction;

    const viewportHeight = Math.max(window.innerHeight || 0, 1);
    let topLimit;
    let bottomLimit;
    if (direction === "down") {
      topLimit = -MOTION_BEHIND_PX;
      bottomLimit = viewportHeight + MOTION_AHEAD_PX;
    } else if (direction === "up") {
      topLimit = -MOTION_AHEAD_PX;
      bottomLimit = viewportHeight + MOTION_BEHIND_PX;
    } else {
      topLimit = -MOTION_NEUTRAL_PX;
      bottomLimit = viewportHeight + MOTION_NEUTRAL_PX;
    }

    let changed = 0;
    for (const element of targets) {
      if (!(element instanceof Element)) continue;
      if (mustStayAwake(element)) {
        if (setAwake(element, true, reason + "-protected")) changed += 1;
        continue;
      }
      const rect = element.getBoundingClientRect();
      if (rect.bottom >= topLimit && rect.top <= bottomLimit) {
        if (setAwake(element, true, reason + "-" + direction)) changed += 1;
      }
    }

    state.motion_frames += 1;
    state.band_wakes += changed;
    state.last_path = reason + "-" + direction;
    return changed;
  }

  function scheduleMotionBand(reason = "motion") {
    if (motionRaf) return;
    motionRaf = window.requestAnimationFrame(() => wakeMotionBand(reason));
  }

  function finishMotion(reason = "motion-idle") {
    idleTimer = 0;
    /* 40.3.34 bug fix: clear moving BEFORE the idle sleep pass. */
    state.moving = false;
    state.direction = "idle";
    sleepFarTargets(reason);
    state.last_path = reason;
  }

  function scheduleIdle(reason, delay = SCROLL_IDLE_MS) {
    if (idleTimer) window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => finishMotion(reason), delay);
  }

  function markMoving(reason = "scroll", hint = "idle") {
    if (hint === "down" || hint === "up") directionHint = hint;
    if (!state.moving) {
      state.moving = true;
      state.motion_starts += 1;
    }
    /* Never wake all targets. Only the directional viewport corridor is prewoken. */
    scheduleMotionBand(reason + "-prewake");
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
        /* Wake-only safety net. Sleeping is owned exclusively by the idle pass. */
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
    if (motionRaf) window.cancelAnimationFrame(motionRaf);
    motionRaf = 0;
    state.moving = false;
    state.direction = "idle";
    wakeAll("refresh");
    observer?.disconnect();
    observer = null;
    rebuildTargetSet(collectTargets());
    attachObserver();
    lastScrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);
    wakeHashTarget("refresh-hash");
    scheduleMotionBand("refresh-band");
    scheduleIdle("refresh-idle", BOOT_IDLE_MS);
    return { ...state };
  }

  function onScrollKey(event) {
    if (event.defaultPrevented) return;
    const key = event.key;
    if (["ArrowDown", "PageDown", "End", " "].includes(key)) {
      markMoving("keyboard-scroll", "down");
    } else if (["ArrowUp", "PageUp", "Home"].includes(key)) {
      markMoving("keyboard-scroll", "up");
    }
  }

  function init() {
    document.documentElement.classList.remove(
      "atlas-offscreen-paint-gate-40333",
      "atlas-scroll-paint-continuity-40334",
      "atlas-scroll-paint-moving-40334"
    );
    document.querySelectorAll(
      ".atlas-offscreen-paint-sleep-40333,.atlas-offscreen-paint-sleep-40334"
    ).forEach((node) => {
      node.classList.remove("atlas-offscreen-paint-sleep-40333", "atlas-offscreen-paint-sleep-40334");
    });
    document.documentElement.classList.add(ROOT_CLASS);

    rebuildTargetSet(collectTargets());
    attachObserver();
    lastScrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);
    wakeHashTarget("initial-hash");

    window.addEventListener("wheel", (event) => {
      markMoving("wheel", event.deltaY > 0 ? "down" : event.deltaY < 0 ? "up" : "idle");
    }, { passive: true, capture: true });
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
      wakeHashTarget("hashchange");
      markMoving("hashchange");
    }, { passive: true });

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        /* Do not impersonate a scroll on visibility return; 40.3.32 owns runtime return. */
        scheduleMotionBand("visibility-return-band");
        scheduleIdle("visibility-return-idle", 950);
      }
    }, { passive: true });

    window.addEventListener("beforeprint", () => wakeAll("print"), { passive: true });

    /* Initial construction remains fully visible; far-off sleep arms only after boot settles. */
    scheduleMotionBand("boot-band");
    scheduleIdle("boot-idle", BOOT_IDLE_MS);
  }

  const api = Object.freeze({
    build: BUILD,
    policy: "directional prewake corridor; no wake-all on movement; observer wake-only; true idle far-off sleep; no DOM relocation/content-visibility/contain",
    state: () => ({ ...state }),
    wakeAll,
    refresh,
    sleepFarTargets
  });

  globalThis.AtlasScrollPaint40335 = api;
  globalThis.AtlasOffscreenPaint40335 = api;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
