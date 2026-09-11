/* Agent-Crypto @erith.IA — 40.6.50
   Aether role visibility corrective lock.
   Responsibility: visibility only. Geometry remains owned by the canonical Administrator Window Manager.
   Contract: Aether is CLOSED on boot and after any view/role transition (Classique, Intermédiaire, Administrator).
   Opening remains explicit through the existing Aether operator controls. No timer, observer, storage or network owner. */
(() => {
  "use strict";
  const BUILD = "40.6.50";
  const WINDOW_ID = "aether-watch";
  const PANEL_ID = "atlasAetherStatusPanel4084";
  const TOGGLE_ID = "atlasAetherStatusToggle4084";

  function closeAether(reason = "role-visibility") {
    const panel = document.getElementById(PANEL_ID);
    const toggle = document.getElementById(TOGGLE_ID);
    if (panel) panel.dataset.aetherOperatorOpen406046 = "0";
    if (toggle) toggle.setAttribute("aria-expanded", "false");

    const manager = globalThis.ErithAdministratorWindows;
    if (manager?.getWindow?.(WINDOW_ID)) {
      if (panel) panel.hidden = false;
      manager.hide(WINDOW_ID, true);
    } else if (panel) {
      panel.hidden = true;
    }

    document.documentElement.dataset.aetherRoleVisibility406050 = reason;
    return true;
  }

  const closeAfterOwner = reason => queueMicrotask(() => closeAether(reason));

  closeAether("script-load");
  window.addEventListener("erith:administrator-mirror-ready", () => closeAfterOwner("window-manager-ready"), { once: true });
  window.addEventListener("atlas:v2mode", () => closeAfterOwner("role-transition"), { passive: true });
  window.addEventListener("pageshow", event => {
    if (event.persisted) closeAfterOwner("bfcache-restore");
  }, { passive: true });

  globalThis.ErithAetherRoleVisibility406050 = Object.freeze({
    build: BUILD,
    window_id: WINDOW_ID,
    boot_closed: true,
    intermediate_boot_closed: true,
    role_transition_closed: true,
    explicit_operator_open_preserved: true,
    geometry_owner: "ErithAdministratorWindows",
    new_timer: false,
    new_observer: false,
    new_storage_owner: false,
    new_network_owner: false,
    close: closeAether
  });
})();

/* ==========================================================================
   40.6.73 R4 — ACTIVE MARKET FICHE ABOVE AETHER LOCK
   ========================================================================== */
(() => {
  "use strict";

  const BUILD = "40.6.73 R4";
  const STYLE_ID = "atlasMarketFicheAboveAether406073R4";
  const ACTIVE_FICHE_SELECTOR = ".atlas-help-layer[data-market-help-coin-id]:not([hidden])";

  function install() {
    if (document.getElementById(STYLE_ID)) return true;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `${ACTIVE_FICHE_SELECTOR}{z-index:2147483647!important;}`;
    document.head.appendChild(style);
    document.documentElement.dataset.marketFicheAboveAether406073R4 = "1";
    return true;
  }

  install();

  globalThis.ErithMarketFicheAboveAether406073R4 = Object.freeze({
    build: BUILD,
    selector: ACTIVE_FICHE_SELECTOR,
    z_index: 2147483647,
    scope: "active floating crypto fiche only",
    aether_geometry_changed: false,
    aether_visibility_changed: false,
    window_manager_changed: false,
    market_core_changed: false,
    new_timer: false,
    new_observer: false,
    new_storage_owner: false,
    new_network_owner: false,
    install
  });
})();

/* ==========================================================================
   40.6.73 R5 — ACTIVE MARKET FICHE BODY-TOP PORTAL
   R4 proved that z-index alone is insufficient in the live Administrator stack.
   The fiche is already position:fixed and a direct body child. When it becomes
   active, move that existing node to the end of <body> so equal/clamped extreme
   z-index values resolve in favor of the operator's foreground fiche.
   No clone, no geometry owner, no observer, no timer, no storage/network owner.
   ========================================================================== */
(() => {
  "use strict";

  const BUILD = "40.6.73 R5";
  const LAYER_ID = "atlasHelpLayer";
  const MAX_Z = "2147483647";
  const EVENT_TYPES = ["pointerover", "focusin", "click", "keydown"];

  function activeFiche() {
    const layer = document.getElementById(LAYER_ID);
    if (!(layer instanceof HTMLElement)) return null;
    if (layer.hidden || layer.getAttribute("aria-hidden") === "true") return null;
    if (!layer.dataset.marketHelpCoinId) return null;
    return layer;
  }

  function promote(reason = "operator-market-fiche") {
    const layer = activeFiche();
    if (!layer || !document.body) return false;

    layer.style.setProperty("z-index", MAX_Z, "important");
    if (layer.parentElement !== document.body || layer !== document.body.lastElementChild) {
      document.body.append(layer);
    }

    layer.dataset.marketFicheForeground406073R5 = reason;
    document.documentElement.dataset.marketFicheForeground406073R5 = "1";
    return true;
  }

  function schedulePromote(event) {
    queueMicrotask(() => promote(event?.type || "interaction"));
  }

  EVENT_TYPES.forEach(type => document.addEventListener(type, schedulePromote, { passive: true }));
  queueMicrotask(() => promote("install"));

  globalThis.ErithMarketFicheForeground406073R5 = Object.freeze({
    build: BUILD,
    layer_id: LAYER_ID,
    z_index: Number(MAX_Z),
    strategy: "existing-node-body-tail-portal",
    events: Object.freeze([...EVENT_TYPES]),
    aether_geometry_changed: false,
    aether_visibility_changed: false,
    window_manager_changed: false,
    market_core_changed: false,
    clone_added: false,
    new_timer: false,
    new_observer: false,
    new_storage_owner: false,
    new_network_owner: false,
    promote
  });
})();

/* ==========================================================================
   40.6.74 C5 — AETHER WATCH V2 FIELD REFRAME

   Firefox 18:46 field capture proved C4 still restored a stale ~950 px floating
   Aether rectangle in the middle of a ~1250 px left workspace. That made the V2
   cells tiny even though the new artwork deliberately provides more room.

   C5 fixes the frame first, then typography:
   - one candidate stylesheet only (C2/C2.1/C3/C3.1/C4 retired from the DOM);
   - floating Aether uses the largest complete 16:9 rectangle available LEFT of
     the visible Lecture Technique rail when that rail exists;
   - stale undersized floating geometry is migrated through the existing canonical
     Window Manager applySnapshot/persistence path, not a second storage owner;
   - maximized/F11 still use the largest complete 16:9 viewport rectangle;
   - no recurring timer, MutationObserver, new network owner or Market Core edit.
   ========================================================================== */
(() => {
  "use strict";

  const BUILD = "40.6.74-candidate-5";
  const WINDOW_ID = "aether-watch";
  const PANEL_ID = "atlasAetherStatusPanel4084";
  const TOGGLE_ID = "atlasAetherStatusToggle4084";
  const DETAIL_ID = "detailPanel";
  const BACKPLATE = "./assets/aether/aether-observatory-master-v2-406074.png";
  const ATTR = "data-aether-backplate-v2-406074";
  const STYLE_ID = "aetherV2Reframe406074C5";
  const STYLE_HREF = "./aether-v2-reframe-406074-c5.css?v=406074-candidate-5";
  const MARGIN = 12;
  const MIN_WIDTH = 720;
  const MAX_FLOAT_WIDTH = 1450;
  const RATIO = 16 / 9;
  const RETIRED_LINK_IDS = Object.freeze([
    "aetherReadability406074",
    "aetherV2Stabilization406074C21",
    "aetherV2Refinement406074C3",
    "aetherV2Refinement406074C31",
    "aetherV2Reframe406074C4"
  ]);
  const root = document.documentElement;

  function retireCandidateLinks() {
    for (const id of RETIRED_LINK_IDS) document.getElementById(id)?.remove();
    return true;
  }

  function ensureC5Stylesheet() {
    retireCandidateLinks();
    let link = document.getElementById(STYLE_ID);
    if (!link) {
      link = document.createElement("link");
      link.id = STYLE_ID;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = STYLE_HREF;
    link.dataset.aetherCandidate406074 = "candidate-5-single-owner";
    root.dataset.aetherReadability406074 = "c5-styles-requested";
    return link;
  }

  function setBackplateState(state) {
    root.setAttribute(ATTR, state);
    return state;
  }

  function warmV2Backplate() {
    setBackplateState("loading");
    const image = new Image();
    image.decoding = "async";
    const src = new URL(BACKPLATE, document.baseURI).href;

    const activate = () => {
      setBackplateState("ready");
      root.dataset.aetherReadability406074 = "candidate-5-ready";
      return true;
    };
    const fallback = () => {
      setBackplateState("fallback-40.6.73");
      root.dataset.aetherReadability406074 = "candidate-5-fallback";
      return false;
    };

    image.addEventListener("load", () => {
      const decoded = typeof image.decode === "function" ? image.decode() : Promise.resolve();
      Promise.resolve(decoded).then(activate).catch(fallback);
    }, { once: true });
    image.addEventListener("error", fallback, { once: true });
    image.src = src;
    return { image, src };
  }

  function viewport() {
    return {
      width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
      height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    };
  }

  function visibleRect(node) {
    if (!(node instanceof HTMLElement)) return null;
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    if (node.hidden || style.display === "none" || style.visibility === "hidden") return null;
    if (rect.width <= 1 || rect.height <= 1) return null;
    return rect;
  }

  function workspaceRightBoundary(vw) {
    const detail = visibleRect(document.getElementById(DETAIL_ID));
    if (detail && detail.left > Math.max(MIN_WIDTH + MARGIN * 2, vw * .55)) {
      return Math.max(MIN_WIDTH + MARGIN * 2, detail.left - 8);
    }
    return vw - MARGIN;
  }

  function fit16x9(maxWidth, maxHeight) {
    let width = Math.min(maxWidth, maxHeight * RATIO);
    let height = width / RATIO;
    if (height > maxHeight) {
      height = maxHeight;
      width = height * RATIO;
    }
    return { width, height };
  }

  function targetFloatingGeometry() {
    const { width: vw, height: vh } = viewport();
    const rightBoundary = workspaceRightBoundary(vw);
    const railReserved = rightBoundary < vw - MARGIN - 4;
    const maxWidth = Math.max(MIN_WIDTH, Math.min(MAX_FLOAT_WIDTH, rightBoundary - MARGIN));
    const maxHeight = Math.max(405, vh - MARGIN * 2);
    const fitted = fit16x9(maxWidth, maxHeight);
    const width = Math.round(Math.max(MIN_WIDTH, Math.min(maxWidth, fitted.width)));
    const height = Math.round(width / RATIO);
    const x = Math.round(railReserved ? MARGIN : Math.max(MARGIN, (vw - width) / 2));
    const y = Math.round(Math.max(MARGIN, vh - height - MARGIN));
    return Object.freeze({ x, y, width, height, rightBoundary, railReserved });
  }

  function targetMaximizedGeometry() {
    const { width: vw, height: vh } = viewport();
    const fitted = fit16x9(vw - MARGIN * 2, vh - MARGIN * 2);
    return Object.freeze({
      x: Math.round(Math.max(MARGIN, (vw - fitted.width) / 2)),
      y: Math.round(Math.max(MARGIN, (vh - fitted.height) / 2)),
      width: Math.round(fitted.width),
      height: Math.round(fitted.height)
    });
  }

  function needsFloatingMigration(panel, target) {
    const rect = panel?.getBoundingClientRect?.();
    if (!rect || rect.width <= 1 || rect.height <= 1) return true;
    const ratioError = Math.abs((rect.width / rect.height) - RATIO);
    const underUsesWorkspace = rect.width < target.width * .88;
    const crossesRail = rect.right > target.rightBoundary + 6;
    const outsideViewport = rect.left < MARGIN - 2 || rect.top < MARGIN - 2
      || rect.right > window.innerWidth - MARGIN + 2 || rect.bottom > window.innerHeight - MARGIN + 2;
    return ratioError > .035 || underUsesWorkspace || crossesRail || outsideViewport;
  }

  function applyFloatingFrame({ force = false, persist = true } = {}) {
    const manager = globalThis.ErithAdministratorWindows;
    const win = manager?.getWindow?.(WINDOW_ID);
    const panel = document.getElementById(PANEL_ID);
    if (!manager || !win || !(panel instanceof HTMLElement)) return false;
    if (win.hidden || win.minimized || win.maximized || !win.floating) return false;

    const target = targetFloatingGeometry();
    if (!force && !needsFloatingMigration(panel, target)) return false;

    manager.applySnapshot({
      schema: "erith.admin.workspace.window-state.v1",
      windows: {
        [WINDOW_ID]: {
          floating: true,
          minimized: false,
          hidden: false,
          maximized: false,
          geometry: {
            x: target.x,
            y: target.y,
            width: target.width,
            height: target.height
          }
        }
      }
    }, { persist, captureResult: false });

    panel.dataset.aetherFloatingReframe406074C5 = `${target.width}x${target.height}@${target.x},${target.y}`;
    root.dataset.aetherFloatingReframe406074C5 = target.railReserved ? "left-of-detail" : "centered";
    return true;
  }

  function applyMaximizedFrame() {
    const panel = document.getElementById(PANEL_ID);
    if (!(panel instanceof HTMLElement) || !panel.classList.contains("admin-native-maximized")) return false;
    const target = targetMaximizedGeometry();
    panel.style.setProperty("left", `${target.x}px`, "important");
    panel.style.setProperty("top", `${target.y}px`, "important");
    panel.style.setProperty("right", "auto", "important");
    panel.style.setProperty("bottom", "auto", "important");
    panel.style.setProperty("width", `${target.width}px`, "important");
    panel.style.setProperty("height", `${target.height}px`, "important");
    panel.dataset.aetherReframe406074C5 = `${target.width}x${target.height}`;
    root.dataset.aetherMaximizedReframe406074C5 = "16x9";
    return true;
  }

  function reframeOpenAether(options = {}) {
    const manager = globalThis.ErithAdministratorWindows;
    const win = manager?.getWindow?.(WINDOW_ID);
    if (!win || win.hidden || win.minimized) return false;
    if (win.maximized) return applyMaximizedFrame();
    return applyFloatingFrame(options);
  }

  function afterCanonicalControl(options = {}) {
    queueMicrotask(() => reframeOpenAether(options));
  }

  function captureControl(event) {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    if (target.closest(`#${TOGGLE_ID}`)) {
      afterCanonicalControl({ force: false, persist: true });
      return;
    }
    if (target.closest(`#${PANEL_ID} .admin-native-maximize`)) {
      afterCanonicalControl({ force: false, persist: false });
    }
  }

  function resizeReframe() {
    const manager = globalThis.ErithAdministratorWindows;
    const win = manager?.getWindow?.(WINDOW_ID);
    if (!win || win.hidden || win.minimized) return;
    if (win.maximized) applyMaximizedFrame();
    else applyFloatingFrame({ force: false, persist: false });
  }

  ensureC5Stylesheet();
  const warm = warmV2Backplate();

  document.addEventListener("click", captureControl, true);
  window.addEventListener("resize", resizeReframe, { passive: true });
  window.addEventListener("pageshow", () => afterCanonicalControl({ force: false, persist: false }), { passive: true });
  afterCanonicalControl({ force: false, persist: true });

  globalThis.ErithAetherReadability406074 = Object.freeze({
    build: BUILD,
    stylesheet: STYLE_HREF,
    backplate: warm.src,
    activation_attribute: ATTR,
    candidate_only: true,
    global_build_promoted: false,
    single_candidate_stylesheet: true,
    retired_candidate_links: RETIRED_LINK_IDS,
    backplate_changed: true,
    backplate_binary_modified: false,
    painted_geometry_changed: true,
    floating_reframe: "largest-16:9-left-of-visible-detail-rail",
    maximize_reframe: "largest-16:9-inside-current-viewport",
    persisted_geometry_migration_via_window_manager: true,
    canonical_window_manager_apply_snapshot_used: true,
    window_manager_core_changed: false,
    market_core_changed: false,
    new_timer: false,
    new_observer: false,
    new_storage_owner: false,
    new_network_owner: false,
    reframeFloating: options => applyFloatingFrame(options),
    reframeMaximized: applyMaximizedFrame,
    state: () => Object.freeze({
      backplate: root.getAttribute(ATTR) || "unset",
      readability: root.dataset.aetherReadability406074 || "unset",
      stylesheet: document.getElementById(STYLE_ID)?.dataset?.aetherCandidate406074 || "missing",
      floating_frame: document.getElementById(PANEL_ID)?.dataset?.aetherFloatingReframe406074C5 || "native",
      maximized_frame: document.getElementById(PANEL_ID)?.dataset?.aetherReframe406074C5 || "native"
    })
  });
})();
