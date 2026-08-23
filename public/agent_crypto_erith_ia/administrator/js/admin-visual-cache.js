(() => {
  "use strict";

  const BUILD = "40.3.38";
  const DB_NAME = "agent_crypto_visual_cache_v1";
  const DB_VERSION = 1;
  const STORE = "assets";
  const GENERATION = "administrator-visuals-2026-08-23-v1";
  const CHART_OFFICE = "./assets/visual/admin-chart-office.png";
  const objectUrls = new Map();
  const stats = { memory: 0, indexeddb: 0, network: 0, miss: 0, error: 0 };

  function absolute(input) {
    try { return new URL(String(input || ""), document.baseURI).href; }
    catch (_) { return String(input || ""); }
  }

  function isCacheable(url) {
    try {
      const u = new URL(url, document.baseURI);
      if (u.origin !== location.origin) return false;
      return /\/assets\/(?:visual|images)\//.test(u.pathname) && /\.(?:png|jpe?g|webp|avif)$/i.test(u.pathname);
    } catch (_) { return false; }
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      if (!globalThis.indexedDB) return reject(new Error("IndexedDB unavailable"));
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error("Visual cache DB open failed"));
    });
  }

  async function read(id) {
    const db = await openDb();
    try {
      return await new Promise((resolve, reject) => {
        const req = db.transaction(STORE, "readonly").objectStore(STORE).get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error || new Error("Visual cache read failed"));
      });
    } finally { db.close(); }
  }

  async function write(record) {
    const db = await openDb();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error || new Error("Visual cache write failed"));
        tx.objectStore(STORE).put(record);
      });
    } finally { db.close(); }
  }

  function objectUrlFor(key, blob) {
    const existing = objectUrls.get(key);
    if (existing) {
      stats.memory += 1;
      return existing;
    }
    const url = URL.createObjectURL(blob);
    objectUrls.set(key, url);
    return url;
  }

  async function resolve(input, { allowNetwork = true } = {}) {
    const id = absolute(input);
    if (!isCacheable(id)) return { url: id, source: "direct", cached: false };

    const memoryUrl = objectUrls.get(id);
    if (memoryUrl) {
      stats.memory += 1;
      return { url: memoryUrl, source: "memory", cached: true };
    }

    try {
      const record = await read(id);
      if (record?.generation === GENERATION && record?.blob instanceof Blob && record.blob.size > 0) {
        stats.indexeddb += 1;
        return { url: objectUrlFor(id, record.blob), source: "indexeddb", cached: true, bytes: record.blob.size };
      }
    } catch (_) {
      stats.error += 1;
    }

    if (!allowNetwork) {
      stats.miss += 1;
      return null;
    }

    try {
      const response = await fetch(id, { cache: "force-cache", credentials: "same-origin" });
      if (!response.ok) throw new Error(`visual fetch ${response.status}`);
      const blob = await response.blob();
      if (!blob || !blob.size || (blob.type && !blob.type.startsWith("image/"))) throw new Error("invalid visual blob");
      try {
        await write({ id, generation: GENERATION, blob, mime: blob.type || "", bytes: blob.size, cached_at: Date.now() });
      } catch (_) {
        /* Cache persistence is an optimization. A failed write must never block the interface. */
      }
      stats.network += 1;
      return { url: objectUrlFor(id, blob), source: "network", cached: false, bytes: blob.size };
    } catch (error) {
      stats.error += 1;
      throw error;
    }
  }

  async function has(input) {
    const id = absolute(input);
    if (objectUrls.has(id)) return true;
    try {
      const record = await read(id);
      return Boolean(record?.generation === GENERATION && record?.blob instanceof Blob && record.blob.size > 0);
    } catch (_) { return false; }
  }

  async function clear() {
    for (const url of objectUrls.values()) {
      try { URL.revokeObjectURL(url); } catch (_) {}
    }
    objectUrls.clear();
    return await new Promise((resolve) => {
      try {
        const req = indexedDB.deleteDatabase(DB_NAME);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
        req.onblocked = () => resolve(false);
      } catch (_) { resolve(false); }
    });
  }

  function setChartBackground(url, source) {
    if (!url) return false;
    document.documentElement.style.setProperty("--agent-crypto-chart-office-cached", `url("${String(url).replaceAll('"', '%22')}")`);
    document.documentElement.dataset.visualChartSource = source || "unknown";
    return true;
  }

  function scheduleNetwork(task) {
    const run = () => { try { void task(); } catch (_) {} };
    if (typeof requestIdleCallback === "function") requestIdleCallback(run, { timeout: 1400 });
    else requestAnimationFrame(run);
  }

  async function bootChartBackground() {
    try {
      const local = await resolve(CHART_OFFICE, { allowNetwork: false });
      if (local?.url) {
        setChartBackground(local.url, local.source);
        return;
      }
    } catch (_) {}
    scheduleNetwork(async () => {
      try {
        const resolved = await resolve(CHART_OFFICE, { allowNetwork: true });
        if (resolved?.url) setChartBackground(resolved.url, resolved.source);
      } catch (_) {
        /* Last-resort direct URL. The graph remains usable even if the decorative background fails. */
        setChartBackground(CHART_OFFICE, "direct-fallback");
      }
    });
  }

  globalThis.AgentCryptoVisualCache40326 = Object.freeze({
    build: BUILD,
    database: DB_NAME,
    generation: GENERATION,
    resolve,
    has,
    clear,
    stats: () => Object.freeze({ ...stats }),
    chart_asset: CHART_OFFICE,
    persistent_blob_cache: true,
    network_on_cache_miss_only: true,
    preloads_full_library: false
  });

  document.documentElement.dataset.visualCacheBuild = BUILD;
  void bootChartBackground();
})();

/* ==========================================================================
   40.3.38 CANONICAL VISUAL OWNER
   Directional prewake / true-idle paint runtime formerly loaded as a separate
   js/admin-offscreen-paint-gate.js file. Runtime logic preserved here.
   ========================================================================== */
(() => {
  "use strict";

  const BUILD = "40.3.38";
  const ROOT_CLASS = "atlas-directional-paint-window-40338";
  const SLEEP_CLASS = "atlas-offscreen-paint-sleep-40338";
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
      "atlas-scroll-paint-moving-40334",
      "atlas-directional-paint-window-40335"
    );
    document.querySelectorAll(
      ".atlas-offscreen-paint-sleep-40333,.atlas-offscreen-paint-sleep-40334,.atlas-offscreen-paint-sleep-40335"
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

  globalThis.AtlasScrollPaint40338 = api;
  globalThis.AtlasScrollPaint40337 = api; /* compatibility alias */
  globalThis.AtlasOffscreenPaint40338 = api;
  globalThis.AtlasOffscreenPaint40337 = api; /* compatibility alias */
  globalThis.AtlasScrollPaint40335 = api; /* compatibility alias */
  globalThis.AtlasOffscreenPaint40335 = api; /* compatibility alias */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
