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
   40.6.74 C3.1 — AETHER WATCH V2 ACTIVATION + FIELD REFINEMENT

   Safety contract:
   - visible/global runtime remains 40.6.73 until Christophe validates Firefox;
   - V2 geometry activates only after the exact V2 image loads AND decodes;
   - missing/undecodable asset => validated 40.6.73 geometry remains active;
   - spatial, stabilization and C3.1 replacement refinement load deterministically;
   - C3.1 replaces the C3 refinement sheet; it does not add another active layer;
   - no timer, MutationObserver, storage owner, network API owner or Market Core edit.
   ========================================================================== */
(() => {
  "use strict";

  const BUILD = "40.6.74-candidate-3.1";
  const LINK_ID = "aetherReadability406074";
  const HREF = "./aether-readability-406074.css?v=406074-candidate-3.1";
  const STABILIZATION_ID = "aetherV2Stabilization406074C21";
  const STABILIZATION_HREF = "./aether-v2-stabilization-406074-c21.css?v=406074-candidate-3.1";
  const REFINEMENT_ID = "aetherV2Refinement406074C31";
  const REFINEMENT_HREF = "./aether-v2-refinement-406074-c31.css?v=406074-candidate-3.1";
  const BACKPLATE = "./assets/aether/aether-observatory-master-v2-406074.png";
  const ATTR = "data-aether-backplate-v2-406074";
  const root = document.documentElement;

  function ensureStylesheet(id, href, marker) {
    let link = document.getElementById(id);
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = href;
    link.dataset.aetherCandidate406074 = marker;
    return link;
  }

  function loadStylesheets() {
    ensureStylesheet(LINK_ID, HREF, "candidate-3.1-spatial");
    ensureStylesheet(STABILIZATION_ID, STABILIZATION_HREF, "candidate-3.1-stabilization");
    ensureStylesheet(REFINEMENT_ID, REFINEMENT_HREF, "candidate-3.1-refinement");
    root.dataset.aetherReadability406074 = "styles-requested";
    return true;
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
      root.dataset.aetherReadability406074 = "candidate-3.1-ready";
      return true;
    };
    const fallback = () => {
      setBackplateState("fallback-40.6.73");
      root.dataset.aetherReadability406074 = "candidate-3.1-fallback";
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

  loadStylesheets();
  const warm = warmV2Backplate();

  globalThis.ErithAetherReadability406074 = Object.freeze({
    build: BUILD,
    href: HREF,
    stabilization_href: STABILIZATION_HREF,
    refinement_href: REFINEMENT_HREF,
    backplate: warm.src,
    activation_attribute: ATTR,
    candidate_only: true,
    global_build_promoted: false,
    backplate_changed: true,
    painted_geometry_changed: true,
    activation_requires_asset_decode: true,
    decode_failure_falls_back: true,
    fallback_runtime: "40.6.73",
    window_manager_changed: false,
    market_core_changed: false,
    new_timer: false,
    new_observer: false,
    new_storage_owner: false,
    new_network_owner: false,
    state: () => ({
      backplate: root.getAttribute(ATTR) || "unset",
      readability: root.dataset.aetherReadability406074 || "unset",
      refinement: document.getElementById(REFINEMENT_ID)?.dataset?.aetherCandidate406074 || "missing"
    })
  });
})();
