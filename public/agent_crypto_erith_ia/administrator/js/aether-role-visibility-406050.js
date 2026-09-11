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
   40.6.74 C4 — AETHER WATCH V2 REFRAME REWRITE

   C4 is deliberately a rewrite, not another active CSS tail:
   - the exact V2 PNG is unchanged;
   - C2 / C2.1 / C3 / C3.1 candidate links are removed before C4 is attached;
   - one C4 stylesheet owns V2 geometry, card framing and responsive typography;
   - maximized Aether is reframed to the largest 16:9 rectangle available in the
     current browser/F11 viewport, so the 1672×941 scene is never stretched;
   - restore geometry remains owned by the existing Administrator Window Manager;
   - no timer, MutationObserver, storage owner, network owner or Market Core edit.
   ========================================================================== */
(() => {
  "use strict";

  const BUILD = "40.6.74-candidate-4";
  const PANEL_ID = "atlasAetherStatusPanel4084";
  const BACKPLATE = "./assets/aether/aether-observatory-master-v2-406074.png";
  const ATTR = "data-aether-backplate-v2-406074";
  const STYLE_ID = "aetherV2Reframe406074C4";
  const STYLE_HREF = "./aether-v2-reframe-406074-c4.css?v=406074-candidate-4";
  const LEGACY_CANDIDATE_LINK_IDS = Object.freeze([
    "aetherReadability406074",
    "aetherV2Stabilization406074C21",
    "aetherV2Refinement406074C3",
    "aetherV2Refinement406074C31"
  ]);
  const root = document.documentElement;

  function retireCandidateLinks() {
    for (const id of LEGACY_CANDIDATE_LINK_IDS) {
      document.getElementById(id)?.remove();
    }
    return true;
  }

  function ensureC4Stylesheet() {
    retireCandidateLinks();
    let link = document.getElementById(STYLE_ID);
    if (!link) {
      link = document.createElement("link");
      link.id = STYLE_ID;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = STYLE_HREF;
    link.dataset.aetherCandidate406074 = "candidate-4-single-owner";
    root.dataset.aetherReadability406074 = "c4-styles-requested";
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
      root.dataset.aetherReadability406074 = "candidate-4-ready";
      return true;
    };
    const fallback = () => {
      setBackplateState("fallback-40.6.73");
      root.dataset.aetherReadability406074 = "candidate-4-fallback";
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

  function maximizedFrame() {
    const panel = document.getElementById(PANEL_ID);
    if (!(panel instanceof HTMLElement) || !panel.classList.contains("admin-native-maximized")) return false;

    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const margin = 12;
    const maxWidth = Math.max(720, vw - margin * 2);
    const maxHeight = Math.max(405, vh - margin * 2);

    let width = Math.min(maxWidth, maxHeight * 16 / 9);
    let height = width * 9 / 16;
    if (height > maxHeight) {
      height = maxHeight;
      width = height * 16 / 9;
    }

    const left = Math.max(margin, (vw - width) / 2);
    const top = Math.max(margin, (vh - height) / 2);

    panel.style.setProperty("left", `${Math.round(left)}px`, "important");
    panel.style.setProperty("top", `${Math.round(top)}px`, "important");
    panel.style.setProperty("right", "auto", "important");
    panel.style.setProperty("bottom", "auto", "important");
    panel.style.setProperty("width", `${Math.round(width)}px`, "important");
    panel.style.setProperty("height", `${Math.round(height)}px`, "important");
    panel.dataset.aetherReframe406074C4 = `${Math.round(width)}x${Math.round(height)}`;
    root.dataset.aetherMaximizedReframe406074C4 = "16x9";
    return true;
  }

  function scheduleMaximizedFrame() {
    queueMicrotask(maximizedFrame);
  }

  function captureWindowControl(event) {
    const target = event.target instanceof Element
      ? event.target.closest(`#${PANEL_ID} .admin-native-maximize`)
      : null;
    if (!target) return;
    // Capture schedules the frame after the canonical Window Manager click handler.
    scheduleMaximizedFrame();
  }

  ensureC4Stylesheet();
  const warm = warmV2Backplate();

  document.addEventListener("click", captureWindowControl, true);
  window.addEventListener("resize", () => {
    if (document.getElementById(PANEL_ID)?.classList.contains("admin-native-maximized")) {
      maximizedFrame();
    }
  }, { passive: true });
  window.addEventListener("pageshow", scheduleMaximizedFrame, { passive: true });
  scheduleMaximizedFrame();

  globalThis.ErithAetherReadability406074 = Object.freeze({
    build: BUILD,
    stylesheet: STYLE_HREF,
    backplate: warm.src,
    activation_attribute: ATTR,
    candidate_only: true,
    global_build_promoted: false,
    single_candidate_stylesheet: true,
    retired_candidate_links: LEGACY_CANDIDATE_LINK_IDS,
    backplate_changed: true,
    backplate_binary_modified: false,
    painted_geometry_changed: true,
    maximize_reframe: "largest-16:9-inside-current-viewport",
    canonical_restore_geometry_preserved: true,
    window_manager_core_changed: false,
    market_core_changed: false,
    new_timer: false,
    new_observer: false,
    new_storage_owner: false,
    new_network_owner: false,
    reframeMaximized: maximizedFrame,
    state: () => Object.freeze({
      backplate: root.getAttribute(ATTR) || "unset",
      readability: root.dataset.aetherReadability406074 || "unset",
      stylesheet: document.getElementById(STYLE_ID)?.dataset?.aetherCandidate406074 || "missing",
      frame: document.getElementById(PANEL_ID)?.dataset?.aetherReframe406074C4 || "native"
    })
  });
})();
