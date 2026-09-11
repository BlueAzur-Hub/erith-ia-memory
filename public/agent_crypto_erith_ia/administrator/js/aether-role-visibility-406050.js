/* Agent-Crypto @erith.IA — 40.6.50 + Build 40.6.74 R1 canonical Aether integration
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

/* 40.6.73 R4 — ACTIVE MARKET FICHE ABOVE AETHER LOCK */
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

/* 40.6.73 R5 — ACTIVE MARKET FICHE BODY-TOP PORTAL */
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
   BUILD 40.6.74 R1 — AETHER V2 CANONICAL INTEGRATION
   The C1→C5 candidate chain is retired. This integration only:
   - publishes the 40.6.74 version truth in the running Administrator shell;
   - loads one final Aether V2 stylesheet with the R1 optical fix;
   - loads one canonical Window-Manager bridge with first-paint preframing;
   - never creates a timer, observer, network owner or Market Core owner.
   ========================================================================== */
(() => {
  "use strict";

  const BUILD = "40.6.74";
  const REVISION = "R1";
  const RELEASE = "AETHER V2 · CANONICAL FRAME / READABILITY · R1";
  const STYLE_ID = "aetherV2406074Canonical";
  const SCRIPT_ID = "aetherFrame406074Canonical";
  const STYLE_HREF = "./aether-v2-406074.css?v=administrator-build-40.6.74-r1";
  const SCRIPT_SRC = "./js/aether-frame-406074.js?v=administrator-build-40.6.74-r1";
  const RETIRED_LINK_IDS = Object.freeze([
    "aetherReadability406074",
    "aetherV2Stabilization406074C21",
    "aetherV2Refinement406074C3",
    "aetherV2Refinement406074C31",
    "aetherV2Reframe406074C4",
    "aetherV2Reframe406074C5"
  ]);

  function publishVersionTruth() {
    const setMeta = (name, value) => {
      const node = document.querySelector(`meta[name="${name}"]`);
      if (node) node.setAttribute("content", value);
    };

    setMeta("atlas-build", BUILD);
    setMeta("administrator-build", BUILD);
    setMeta("administrator-revision", "V9");
    setMeta("administrator-release", RELEASE);
    setMeta("atlas-asset-token", "market-core-v2.0-alpha-build-40.6.74");

    const truth = document.getElementById("atlasVersionTruthText");
    if (truth) truth.textContent = `Build ${BUILD}`;
    const badge = document.getElementById("atlasVersionTruthBadge");
    if (badge) badge.setAttribute("aria-label", `Build ${BUILD}`);
    const hiddenBadge = document.getElementById("atlasReleaseBadge");
    if (hiddenBadge) hiddenBadge.textContent = `BUILD ${BUILD}`;

    document.title = `Agent-Crypto @erith.IA — Build ${BUILD} · Administrator`;
    document.documentElement.dataset.administratorBuild = BUILD;
    document.documentElement.dataset.aetherV2406074 = "canonical-r1";
    document.documentElement.dataset.aetherRevision406074 = REVISION;
    return true;
  }

  function retireCandidates() {
    for (const id of RETIRED_LINK_IDS) document.getElementById(id)?.remove();
    return true;
  }

  function ensureStyle() {
    retireCandidates();
    let link = document.getElementById(STYLE_ID);
    if (!link) {
      link = document.createElement("link");
      link.id = STYLE_ID;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = STYLE_HREF;
    link.dataset.aether406074 = "canonical-r1";
    return link;
  }

  function ensureFrameScript() {
    if (globalThis.ErithAetherFrame406074) return true;
    let script = document.getElementById(SCRIPT_ID);
    if (script) return true;
    script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.defer = true;
    script.dataset.aether406074 = "canonical-r1";
    script.addEventListener("load", () => {
      document.documentElement.dataset.aetherFrameLoader406074 = "ready-r1";
    }, { once: true });
    script.addEventListener("error", () => {
      document.documentElement.dataset.aetherFrameLoader406074 = "error";
    }, { once: true });
    document.head.appendChild(script);
    return true;
  }

  publishVersionTruth();
  ensureStyle();
  ensureFrameScript();

  globalThis.ErithAetherCanonical406074 = Object.freeze({
    build: BUILD,
    revision: REVISION,
    release: RELEASE,
    style_id: STYLE_ID,
    script_id: SCRIPT_ID,
    style_href: STYLE_HREF,
    script_src: SCRIPT_SRC,
    retired_candidate_links: RETIRED_LINK_IDS,
    runtime_version_truth: true,
    recurring_timer: false,
    observer: false,
    network_owner: false,
    market_core_changed: false,
    operator_runtime_changed: false,
    publishVersionTruth,
    retireCandidates,
    ensureStyle,
    ensureFrameScript
  });
})();
