/* Agent-Crypto @erith.IA — 40.6.50 + Build 40.6.77 canonical Aether integration
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
   BUILD 40.6.78 — AETHER V2 CANONICAL INTEGRATION
   ========================================================================== */
(() => {
  "use strict";
  const BUILD = "40.6.78";
  const REVISION = "V13";
  const RELEASE = "AETHER V2 · PRE-REVEAL STORAGE TRUTH LOCK";
  const STYLE_ID = "aetherV2Canonical";
  const SCRIPT_ID = "aetherV2RuntimeCanonical";
  const STYLE_HREF = "./aether-v2-406075.css?v=administrator-build-40.6.78";
  const SCRIPT_SRC = "./js/aether-v2-406078.js?v=administrator-build-40.6.78";
  const RETIRED_LINK_IDS = Object.freeze([
    "aetherReadability406074","aetherV2Stabilization406074C21","aetherV2Refinement406074C3",
    "aetherV2Refinement406074C31","aetherV2Reframe406074C4","aetherV2Reframe406074C5",
    "aetherV2406075Canonical"
  ]);
  const RETIRED_SCRIPT_IDS = Object.freeze([
    "aetherFrame406076Canonical","aetherFrame406077Canonical","aetherFrame406078Canonical",
    "aetherV2Operator406079Canonical","aetherV2Operator406080Canonical"
  ]);

  function publishVersionTruth() {
    const setMeta=(name,value)=>document.querySelector(`meta[name="${name}"]`)?.setAttribute("content",value);
    setMeta("atlas-build",BUILD); setMeta("administrator-build",BUILD); setMeta("administrator-revision",REVISION);
    setMeta("administrator-release",RELEASE); setMeta("atlas-asset-token",`market-core-v2.0-alpha-build-${BUILD}`);
    const truth=document.getElementById("atlasVersionTruthText"); if(truth) truth.textContent=`Build ${BUILD}`;
    const badge=document.getElementById("atlasVersionTruthBadge"); if(badge) badge.setAttribute("aria-label",`Build ${BUILD}`);
    const hidden=document.getElementById("atlasReleaseBadge"); if(hidden) hidden.textContent=`BUILD ${BUILD}`;
    document.title=`Agent-Crypto @erith.IA — Build ${BUILD} · Administrator`;
    document.documentElement.dataset.administratorBuild=BUILD;
    return true;
  }
  function retireLegacyAssets() {
    for(const id of RETIRED_LINK_IDS) if(id!==STYLE_ID) document.getElementById(id)?.remove();
    for(const id of RETIRED_SCRIPT_IDS) if(id!==SCRIPT_ID) document.getElementById(id)?.remove();
  }
  function ensureStyle() {
    retireLegacyAssets();
    let link=document.getElementById(STYLE_ID);
    if(!link){ link=document.createElement("link"); link.id=STYLE_ID; link.rel="stylesheet"; document.head.appendChild(link); }
    link.href=STYLE_HREF; link.dataset.aetherCanonicalBuild=BUILD; return link;
  }
  function ensureRuntime() {
    if(globalThis.ErithAetherV2Canonical?.build===BUILD) return true;
    let script=document.getElementById(SCRIPT_ID);
    if(!script){ script=document.createElement("script"); script.id=SCRIPT_ID; script.src=SCRIPT_SRC; script.defer=true; script.dataset.aetherCanonicalBuild=BUILD; document.head.appendChild(script); }
    return true;
  }
  publishVersionTruth(); ensureStyle(); ensureRuntime();
  globalThis.ErithAetherCanonical406074=Object.freeze({
    build:BUILD,revision:REVISION,release:RELEASE,style_href:STYLE_HREF,script_src:SCRIPT_SRC,
    one_visual_owner:true,one_runtime_owner:true,recurring_timer:false,observer:false,network_owner:false,
    market_core_changed:false,operator_runtime_changed:false,publishVersionTruth
  });
})();
