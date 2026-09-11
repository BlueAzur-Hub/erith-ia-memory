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
      // Window Manager keeps geometry/persistence; operator intent owns visibility.
      if (panel) panel.hidden = false;
      manager.hide(WINDOW_ID, true);
    } else if (panel) {
      panel.hidden = true;
    }

    document.documentElement.dataset.aetherRoleVisibility406050 = reason;
    return true;
  }

  const closeAfterOwner = reason => queueMicrotask(() => closeAether(reason));

  // Covers the case where js/app.js already completed synchronously before this script executes.
  closeAether("script-load");

  // Canonical Window Manager ready: close after its own initialization transaction.
  window.addEventListener("erith:administrator-mirror-ready", () => closeAfterOwner("window-manager-ready"), { once: true });

  // Every real view/role transition starts with Aether closed. This is especially important
  // for view=intermediate (operator), whose neutralized window presentation must not POP Aether.
  window.addEventListener("atlas:v2mode", () => closeAfterOwner("role-transition"), { passive: true });

  // BFCache restore must not resurrect a previously visible Aether window.
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

    // Preserve the existing fixed geometry while escaping equal-z paint order.
    layer.style.setProperty("z-index", MAX_Z, "important");
    if (layer.parentElement !== document.body || layer !== document.body.lastElementChild) {
      document.body.append(layer);
    }

    layer.dataset.marketFicheForeground406073R5 = reason;
    document.documentElement.dataset.marketFicheForeground406073R5 = "1";
    return true;
  }

  function schedulePromote(event) {
    // app.js owns opening/positioning first. This microtask runs after the current
    // interaction dispatch, then only promotes if a real Crypto fiche is visible.
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
