(() => {
  "use strict";

  const ADMIN_BUILD = "40.1.93";
  const ADMIN_RELEASE = "PARKER LEWIS CAN'T LOSE · GRAPH SESSION CONTEXT V4 · EARLY INTENT RESTORE LOCK";
  const ENGINE_BUILD = "38.15.11";
  const STORAGE_PREFIX = "erith_admin_portal_39_2_9";

  const byId = id => document.getElementById(id);
  const q = selector => document.querySelector(selector);

  function siblingRange(start, endExclusive) {
    if (!(start instanceof HTMLElement)) return [];
    const result = [];
    let node = start;
    while (node && node !== endExclusive) {
      if (node instanceof HTMLElement) result.push(node);
      node = node.nextElementSibling;
    }
    return result;
  }

  function groupFrom(startSelector, endSelector) {
    const start = q(startSelector);
    const end = endSelector ? q(endSelector) : null;
    return siblingRange(start, end);
  }

  function entry(node, domain = "all") {
    return node instanceof HTMLElement ? { node, domain } : null;
  }

  function currentDomain() {
    return String(document.documentElement.dataset.atlasMarketDomain || "crypto").toLowerCase() === "metals"
      ? "metals"
      : "crypto";
  }

  function portalHost(kind, domain = currentDomain()) {
    const metals = domain === "metals";
    if (kind === "target" || kind === "flow") {
      return metals
        ? (q("#atlasMetalsMarketArea .atlas-metals-market-ribbons") || byId("atlasMetalsMarketArea"))
        : byId("market-workspace");
    }
    if (kind === "market") {
      return metals
        ? (q("#atlasMetalsMarketArea .atlas-metals-market-grid") || byId("atlasMetalsMarketArea"))
        : byId("marketWorkspaceGrid");
    }
    return null;
  }

  function nativeDefinitions() {
    return [
      {
        id: "graphique",
        title: "Graphique + Lecture technique · Crypto",
        tone: "cyan",
        directFixed: true,
        resolveEntries: () => [entry(byId("analyste"))].filter(Boolean),
        resolveAnchor: nodes => nodes[0]
      },
      {
        id: "target-top",
        title: "Target Top 5",
        tone: "gold",
        directFixed: true,
        resolveEntries: () => [entry(q("#market-workspace .top5-ribbon"))].filter(Boolean),
        resolveAnchor: nodes => nodes[0]
      },
      {
        id: "market-flow",
        title: "Market Flow",
        tone: "cyan",
        directFixed: true,
        // 40.1.26: Target Top owns the external move pattern; Market Flow only
        // adapts its native ticker-strip height while detached. No custom x/y path.
        geometryPolicy: { minHeight: 54, maxHeight: 54 },
        resolveEntries: () => [entry(q("#market-workspace .market-flow-ribbon"))].filter(Boolean),
        resolveAnchor: nodes => nodes[0]
      },
      {
        id: "market",
        title: "Market Snapshot · Crypto",
        tone: "gold",
        resolveEntries: () => [
          entry(byId("marketSnapshotPanel"), "crypto"),
          entry(byId("atlasMetalsMarketSnapshot"), "metals"),
          entry(byId("atlasMetalsMarketRegistry"), "metals")
        ].filter(Boolean),
        resolveAnchor: nodes => byId("marketSnapshotPanel") || nodes[0],
        resolveControlHosts: (nodes, entries) => entries
          .filter(item => item.node.id === "marketSnapshotPanel" || item.node.id === "atlasMetalsMarketSnapshot")
          .map(item => item.node)
      },
      {
        id: "math-core",
        title: "Atlas Math Core · Crypto",
        tone: "gold",
        directFixed: true,
        preferredFloatGeometry: () => {
          const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
          const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
          const rect = byId("math")?.getBoundingClientRect?.();
          const width = Math.min(760, Math.max(520, Math.round(vw * 0.42)));
          const height = Math.min(Math.max(360, Math.round(rect?.height || 460)), Math.max(360, vh - 96), 640);
          return { x: Math.max(12, vw - width - 18), y: Math.max(72, Math.min(118, Math.round(vh * 0.11))), width, height };
        },
        resolveEntries: () => [entry(byId("math"))].filter(Boolean),
        resolveAnchor: nodes => nodes[0],
        resolveControlHosts: () => {
          const host = byId("math")?.querySelector?.(".atlas-math-dock-actions");
          return host ? [host] : [byId("math")].filter(Boolean);
        }
      },
      {
        id: "analyse-decision",
        title: "Analyse & décision",
        tone: "cyan",
        resolveEntries: () => groupFrom(".atlas-layout-family-analysis", ".atlas-layout-family-intelligence").map(node => entry(node)),
        resolveAnchor: nodes => nodes.find(node => node.classList.contains("atlas-layout-family-analysis")) || nodes[0]
      },
      {
        id: "intelligence-memoire-creation",
        title: "Intelligence, mémoire & création",
        tone: "violet",
        resolveEntries: () => groupFrom(".atlas-layout-family-intelligence", ".atlas-layout-family-operations").map(node => entry(node)),
        resolveAnchor: nodes => nodes.find(node => node.classList.contains("atlas-layout-family-intelligence")) || nodes[0]
      },
      {
        id: "preparation-operations",
        title: "Préparation & opérations",
        tone: "gold",
        resolveEntries: () => groupFrom(".atlas-layout-family-operations", ".atlas-layout-family-system").map(node => entry(node)),
        resolveAnchor: nodes => nodes.find(node => node.classList.contains("atlas-layout-family-operations")) || nodes[0]
      },
      {
        id: "experimentation-systeme",
        title: "Expérimentation & système",
        tone: "orange",
        resolveEntries: () => groupFrom(".atlas-layout-family-system", "#missions-vie").map(node => entry(node)),
        resolveAnchor: nodes => nodes.find(node => node.classList.contains("atlas-layout-family-system")) || nodes[0]
      },
      {
        id: "missions-de-vie",
        title: "Missions de vie",
        tone: "gold",
        resolveEntries: () => groupFrom("#missions-vie", "#mesure-audience").map(node => entry(node)),
        resolveAnchor: nodes => byId("missions-vie") || nodes[0]
      },
      {
        id: "mesure-audience",
        title: "Mesure d’audience",
        tone: "silver",
        resolveEntries: () => [entry(byId("mesure-audience"))].filter(Boolean),
        resolveAnchor: nodes => nodes[0]
      },
      {
        id: "sources",
        title: "Sources",
        tone: "green",
        resolveEntries: () => [entry(byId("liveSourcesCollapse"))].filter(Boolean),
        resolveAnchor: nodes => nodes[0]
      }
    ];
  }

  function installGlobalVersionIdentity() {
    document.documentElement.dataset.administratorBuild = ADMIN_BUILD;
    document.documentElement.dataset.agentCryptoBuild = ADMIN_BUILD;
    document.body.dataset.administratorRelease = ADMIN_RELEASE;
    document.title = `Agent-Crypto @erith.IA — Build ${ADMIN_BUILD} · Administrator`;

    const versionControl = byId("atlasVersionControl");
    const versionText = byId("atlasVersionControlText");
    if (versionControl) {
      versionControl.setAttribute("aria-label", `Version Agent-Crypto installée : Build ${ADMIN_BUILD}. Cliquer pour vérifier GitHub.`);
      versionControl.dataset.adminGlobalVersion = ADMIN_BUILD;
    }
    if (versionText) versionText.textContent = `Build ${ADMIN_BUILD} · Administrator`;

    const hiddenRelease = byId("atlasV2ReleaseBadge");
    if (hiddenRelease) hiddenRelease.textContent = `Agent-Crypto @erith.IA · Build ${ADMIN_BUILD} · Administrator`;

    const statusStack = q(".hero .status-stack");
    let engineBadge = byId("administratorEngineBadge");
    if (!engineBadge && statusStack) {
      engineBadge = document.createElement("span");
      engineBadge.id = "administratorEngineBadge";
      engineBadge.className = "pill admin-engine-badge";
      statusStack.insertBefore(engineBadge, byId("liveStatus") || statusStack.lastElementChild);
    }
    if (engineBadge) {
      engineBadge.textContent = `ENGINE · Market Core ${ENGINE_BUILD}`;
      engineBadge.title = `Moteur métier hérité de la Classic ${ENGINE_BUILD}`;
    }

    // COMPACT HOME LOCK · inherited from validated 39.9.0R2
    // The extra Administrator Mirror identity line was useful during validation,
    // but it changes the home header height. Final UI keeps the existing header
    // geometry and version indicators only.
    byId("administratorMirrorIdentity")?.remove();

    const footer = byId("footerRelease");
    if (footer) footer.textContent = `Agent-Crypto @erith.IA · Market Core · Build ${ADMIN_BUILD} · Version : Parker Lewis Can't Lose`;
  }

  function updateLayoutButton(button, free) {
    button.setAttribute("aria-pressed", String(free));
    button.textContent = free ? "FENÊTRES LIBRES" : "FENÊTRES VERROUILLÉES";
    button.title = free
      ? "Déplacement des fenêtres opérationnelles activé"
      : "Déplacement verrouillé · réduction/restauration reste disponible";
  }

  function installAdminBar(manager) {
    q(".admin-mirror-bar")?.remove();
    const bar = document.createElement("aside");
    bar.className = "admin-mirror-bar admin-mirror-bar-39-2-8";
    bar.setAttribute("aria-label", "Administrator Portal Windows controls");

    const brand = document.createElement("span");
    brand.className = "admin-mirror-brand";
    brand.innerHTML = `AGENT-CRYPTO <b>${ADMIN_BUILD}</b> · ADMINISTRATOR`;

    const layout = document.createElement("button");
    layout.type = "button";
    updateLayoutButton(layout, manager.isFree());
    layout.addEventListener("click", () => updateLayoutButton(layout, manager.setFree(!manager.isFree())));

    const deck = document.createElement("button");
    deck.type = "button";
    deck.className = "admin-window-deck-toggle";
    deck.innerHTML = `WINDOWS <b>${manager.count}</b>`;
    deck.title = "Ouvrir le gestionnaire des fenêtres opérationnelles";
    deck.addEventListener("click", () => manager.toggleDeck());

    const cascade = document.createElement("button");
    cascade.type = "button";
    cascade.textContent = "CASCADE";
    cascade.title = "Ranger les fenêtres détachées";
    cascade.addEventListener("click", () => manager.cascade());

    const reset = document.createElement("button");
    reset.type = "button";
    reset.textContent = "RESET FENÊTRES";
    reset.title = "Raccrocher et restaurer la disposition native";
    reset.addEventListener("click", () => manager.reset());

    const classic = document.createElement("a");
    classic.href = "../web/index.html";
    classic.textContent = `CLASSIC ${ENGINE_BUILD}`;
    classic.title = `Ouvrir la Classic Final ${ENGINE_BUILD}`;

    bar.append(brand, layout, deck, cascade, reset, classic);
    document.body.appendChild(bar);
  }

  function syncDomainWindows(manager) {
    const domain = currentDomain();
    manager.setDomain(domain);
    const metals = domain === "metals";
    manager.renameWindow("graphique", metals ? "Graphique + Lecture Métaux" : "Graphique + Lecture technique");
    manager.renameWindow("market", metals ? "Market Métaux" : "Market Snapshot");
    manager.renameWindow("math-core", metals ? "Math Core Métaux" : "Atlas Math Core");
  }

  function installDomainObserver(manager) {
    let last = "";
    const sync = () => {
      const next = currentDomain();
      if (next === last) return;
      last = next;
      window.requestAnimationFrame(() => syncDomainWindows(manager));
    };
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-atlas-market-domain"] });
    window.addEventListener("pageshow", sync);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") sync(); });
    sync();
  }

  const RIBBON_R2_MIGRATION_KEY = `${STORAGE_PREFIX}:ribbon-window-menu-r2-migrated`;

  function migrateRibbonWindowStateR2() {
    try {
      if (localStorage.getItem(RIBBON_R2_MIGRATION_KEY) === "1") return;
      // R1 used a separate translation store. Earlier experiments could also
      // have left native-window geometry behind. Clear ONLY these two ribbons
      // once so R2 starts in the canonical docked position; all other windows
      // keep their operator layout. Subsequent R2 moves persist normally.
      localStorage.removeItem("erith_admin_native_ribbon_positions_v1");
      localStorage.removeItem(`${STORAGE_PREFIX}:window:target-top`);
      localStorage.removeItem(`${STORAGE_PREFIX}:window:market-flow`);
      localStorage.setItem(RIBBON_R2_MIGRATION_KEY, "1");
    } catch {}
  }

  const MARKET_FLOW_40125_MIGRATION_KEY = `${STORAGE_PREFIX}:market-flow-target-top-parity-40125-migrated`;

  function migrateMarketFlowWindowState40125() {
    try {
      if (localStorage.getItem(MARKET_FLOW_40125_MIGRATION_KEY) === "1") return;
      // 40.1.25: Market Flow now uses the exact same directFixed detach/move
      // path as Target Top. Clear only its stale 40.1.24 geometry once.
      localStorage.removeItem(`${STORAGE_PREFIX}:window:market-flow`);
      localStorage.setItem(MARKET_FLOW_40125_MIGRATION_KEY, "1");
    } catch {}
  }

  const MARKET_FLOW_40126_MIGRATION_KEY = `${STORAGE_PREFIX}:market-flow-floating-viewport-40126-migrated`;

  function migrateMarketFlowWindowState40126() {
    try {
      if (localStorage.getItem(MARKET_FLOW_40126_MIGRATION_KEY) === "1") return;
      // 40.1.26 changes the detached internal contract: discard only the prior
      // Market Flow floating geometry so the first detach is measured cleanly.
      localStorage.removeItem(`${STORAGE_PREFIX}:window:market-flow`);
      localStorage.setItem(MARKET_FLOW_40126_MIGRATION_KEY, "1");
    } catch {}
  }

  const MARKET_BODY_PORTAL_40127_MIGRATION_KEY = `${STORAGE_PREFIX}:market-body-portal-40127-migrated`;

  function migrateMarketWindowState40127() {
    try {
      if (localStorage.getItem(MARKET_BODY_PORTAL_40127_MIGRATION_KEY) === "1") return;
      // 40.1.27: old Market floating state was measured while its shell lived
      // inside marketWorkspaceGrid. Clear only this window once so the new
      // body-level floating shell starts from a clean docked measurement.
      localStorage.removeItem(`${STORAGE_PREFIX}:window:market`);
      localStorage.setItem(MARKET_BODY_PORTAL_40127_MIGRATION_KEY, "1");
    } catch {}
  }

  const GLOBAL_SHELL_PORTAL_40128_MIGRATION_KEY = `${STORAGE_PREFIX}:global-shell-body-portal-40128-migrated`;
  const GLOBAL_SHELL_WINDOW_IDS_40128 = Object.freeze([
    "market",
    "analyse-decision",
    "intelligence-memoire-creation",
    "preparation-operations",
    "experimentation-systeme",
    "missions-de-vie",
    "mesure-audience",
    "sources"
  ]);

  function migrateGlobalShellWindowState40128() {
    try {
      if (localStorage.getItem(GLOBAL_SHELL_PORTAL_40128_MIGRATION_KEY) === "1") return;
      // 40.1.28 changes the DEFAULT shell portal for every non-directFixed
      // Administrator window. Clear only those shell-window geometries once so
      // their first body-level detach is measured from the native dock.
      GLOBAL_SHELL_WINDOW_IDS_40128.forEach(id => {
        localStorage.removeItem(`${STORAGE_PREFIX}:window:${id}`);
      });
      localStorage.setItem(GLOBAL_SHELL_PORTAL_40128_MIGRATION_KEY, "1");
    } catch {}
  }

  const GLOBAL_SHELL_LAYOUT_40129_MIGRATION_KEY = `${STORAGE_PREFIX}:global-shell-layout-placeholder-40129-migrated`;

  function migrateGlobalShellWindowState40129() {
    try {
      if (localStorage.getItem(GLOBAL_SHELL_LAYOUT_40129_MIGRATION_KEY) === "1") return;
      // 40.1.29 replaces zero-size hidden placeholders with layout-preserving
      // spacers. Clear only shell-window geometry once so the first detach is
      // measured from the current native dock.
      GLOBAL_SHELL_WINDOW_IDS_40128.forEach(id => {
        localStorage.removeItem(`${STORAGE_PREFIX}:window:${id}`);
      });
      localStorage.setItem(GLOBAL_SHELL_LAYOUT_40129_MIGRATION_KEY, "1");
    } catch {}
  }

  const GLOBAL_SHELL_GEOMETRY_40130_MIGRATION_KEY = `${STORAGE_PREFIX}:global-shell-union-placeholder-40130-migrated`;

  function migrateGlobalShellWindowState40130() {
    try {
      if (localStorage.getItem(GLOBAL_SHELL_GEOMETRY_40130_MIGRATION_KEY) === "1") return;
      // 40.1.30 fixes the CSS/JS placeholder contradiction and measures multi-node
      // families from the union of their visible members. Purge only shell-window
      // geometry once so no stale anchor-only dimensions survive.
      GLOBAL_SHELL_WINDOW_IDS_40128.forEach(id => {
        localStorage.removeItem(`${STORAGE_PREFIX}:window:${id}`);
      });
      localStorage.setItem(GLOBAL_SHELL_GEOMETRY_40130_MIGRATION_KEY, "1");
    } catch {}
  }

  const DIRECT_FIXED_GEOMETRY_40131_MIGRATION_KEY = `${STORAGE_PREFIX}:direct-fixed-inline-important-40131-migrated`;

  function migrateDirectFixedWindowState40131() {
    try {
      if (localStorage.getItem(DIRECT_FIXED_GEOMETRY_40131_MIGRATION_KEY) === "1") return;
      // 40.1.31 fixes legacy !important dock rules overriding the directFixed
      // Window Manager geometry. Only the two affected directFixed windows can
      // contain stale jump coordinates from prior tests.
      ["graphique", "math-core"].forEach(id => {
        localStorage.removeItem(`${STORAGE_PREFIX}:window:${id}`);
      });
      localStorage.setItem(DIRECT_FIXED_GEOMETRY_40131_MIGRATION_KEY, "1");
    } catch {}
  }

  const GLOBAL_SHELL_AUTOFIT_40132_MIGRATION_KEY = `${STORAGE_PREFIX}:global-shell-natural-autofit-40132-migrated`;

  function migrateGlobalShellAutoFit40132() {
    try {
      if (localStorage.getItem(GLOBAL_SHELL_AUTOFIT_40132_MIGRATION_KEY) === "1") return;
      // 40.1.32 changes only shell sizing. Clear the eight shell-window geometries
      // once so their first detach is measured from live content + floating chrome.
      // directFixed Graphique / Target Top / Market Flow / Math Core are excluded.
      GLOBAL_SHELL_WINDOW_IDS_40128.forEach(id => {
        localStorage.removeItem(`${STORAGE_PREFIX}:window:${id}`);
      });
      localStorage.setItem(GLOBAL_SHELL_AUTOFIT_40132_MIGRATION_KEY, "1");
    } catch {}
  }

  const GRAPH_R6_MIGRATION_KEY = `${STORAGE_PREFIX}:graph-fullwidth-r6-migrated`;

  function migrateGraphWindowStateR6() {
    try {
      if (localStorage.getItem(GRAPH_R6_MIGRATION_KEY) === "1") return;
      // R5 could inherit an old detached/floating geometry for the Graphique
      // workspace. Reset ONLY this window once so the canonical full-width
      // dock can be measured from its real parent. Future operator moves stay
      // persistent normally after this one-time migration.
      localStorage.removeItem(`${STORAGE_PREFIX}:window:graphique`);
      localStorage.setItem(GRAPH_R6_MIGRATION_KEY, "1");
    } catch {}
  }

  function keepGlobalVersionVisible() {
    const versionText = byId("atlasVersionControlText");
    const observer = versionText ? new MutationObserver(() => {
      const text = String(versionText.textContent || "");
      if (/Market Core V2\.0-Alpha\s*·\s*Build 38\.15\.11/i.test(text)) {
        versionText.textContent = `Build ${ADMIN_BUILD} · Administrator`;
      }
    }) : null;
    if (versionText) observer.observe(versionText, { childList: true, characterData: true, subtree: true });
  }

  function installMathCoreInlineWindowControls40148() {
    const math = byId("math");
    const head = math?.querySelector?.(".atlas-math-dock-head");
    const dockActions = math?.querySelector?.(".atlas-math-dock-actions");
    const controls = dockActions?.querySelector?.(".admin-native-controls")
      || math?.querySelector?.(":scope > .admin-native-controls")
      || math?.querySelector?.(".admin-native-controls");
    if (!(head instanceof HTMLElement) || !(dockActions instanceof HTMLElement) || !(controls instanceof HTMLElement)) return false;

    const firstDockButton = dockActions.querySelector("[data-math-position]");
    if (!(firstDockButton instanceof HTMLElement)) return false;

    // 40.1.48 — the complete Window Manager strip belongs to the Math Core
    // header itself.  The action row is a single nowrap line; it is never
    // hidden off-canvas by justify-content:flex-end/overflow scrolling.
    controls.classList.add("atlas-math-inline-window-controls-40148");
    controls.style.setProperty("position", "static", "important");
    controls.style.setProperty("inset", "auto", "important");
    controls.style.setProperty("left", "auto", "important");
    controls.style.setProperty("right", "auto", "important");
    controls.style.setProperty("top", "auto", "important");
    controls.style.setProperty("bottom", "auto", "important");
    controls.style.setProperty("transform", "none", "important");
    controls.style.setProperty("display", "inline-flex", "important");
    controls.style.setProperty("flex-direction", "row", "important");
    controls.style.setProperty("flex-wrap", "nowrap", "important");
    controls.style.setProperty("align-items", "center", "important");
    controls.style.setProperty("justify-content", "flex-start", "important");
    controls.style.setProperty("gap", "4px", "important");
    controls.style.setProperty("margin", "0", "important");
    controls.style.setProperty("padding", "0", "important");
    controls.style.setProperty("min-height", "0", "important");
    controls.style.setProperty("background", "transparent", "important");
    controls.style.setProperty("box-shadow", "none", "important");
    controls.style.setProperty("backdrop-filter", "none", "important");
    controls.style.setProperty("opacity", "1", "important");
    controls.style.setProperty("pointer-events", "auto", "important");
    controls.style.setProperty("z-index", "3", "important");
    controls.style.setProperty("flex", "0 0 auto", "important");

    controls.querySelectorAll("button").forEach(button => {
      button.style.setProperty("position", "static", "important");
      button.style.setProperty("margin", "0", "important");
      button.style.setProperty("transform", "none", "important");
      button.style.setProperty("width", "27px", "important");
      button.style.setProperty("min-width", "27px", "important");
      button.style.setProperty("height", "27px", "important");
      button.style.setProperty("min-height", "27px", "important");
      button.style.setProperty("padding", "0", "important");
      button.style.setProperty("opacity", "1", "important");
    });

    const maximize = controls.querySelector(".admin-native-maximize");
    if (maximize) maximize.textContent = "↗";

    // One complete action line: [⠿] [−] [□] [↗] [×] | [Dessus] [Latéral] [Réduire]
    head.classList.add("atlas-math-head-inline-controls-40148");
    dockActions.classList.add("atlas-math-actions-inline-40148");
    dockActions.style.setProperty("display", "flex", "important");
    dockActions.style.setProperty("width", "100%", "important");
    dockActions.style.setProperty("max-width", "100%", "important");
    dockActions.style.setProperty("align-items", "center", "important");
    dockActions.style.setProperty("justify-content", "flex-end", "important");
    dockActions.style.setProperty("flex-wrap", "nowrap", "important");
    dockActions.style.setProperty("white-space", "nowrap", "important");
    dockActions.style.setProperty("gap", "5px", "important");
    dockActions.style.setProperty("overflow", "visible", "important");
    dockActions.style.setProperty("min-width", "0", "important");

    if (controls.parentElement !== dockActions || controls.nextElementSibling !== firstDockButton) {
      dockActions.insertBefore(controls, firstDockButton);
    }

    let separator = dockActions.querySelector(".atlas-math-inline-window-separator-40148");
    if (!separator) {
      separator = document.createElement("span");
      separator.className = "atlas-math-inline-window-separator-40148";
      separator.textContent = "|";
      separator.setAttribute("aria-hidden", "true");
      separator.style.cssText = "display:inline-flex;align-items:center;justify-content:center;color:rgba(255,226,161,.58);font-weight:900;line-height:1;padding:0 1px;flex:0 0 auto;";
    }
    dockActions.insertBefore(separator, firstDockButton);

    dockActions.querySelectorAll("[data-math-position]").forEach(button => {
      button.style.setProperty("flex", "0 0 auto", "important");
      button.style.setProperty("white-space", "nowrap", "important");
    });

    dockActions.dataset.mathInlineWindowControls = "40148";
    return true;
  }

  function boot() {
    installGlobalVersionIdentity();
    keepGlobalVersionVisible();

    migrateRibbonWindowStateR2();
    migrateMarketFlowWindowState40125();
    migrateMarketFlowWindowState40126();
    migrateMarketWindowState40127();
    migrateGlobalShellWindowState40128();
    migrateGlobalShellWindowState40129();
    migrateGlobalShellWindowState40130();
    migrateDirectFixedWindowState40131();
    migrateGlobalShellAutoFit40132();
    migrateGraphWindowStateR6();

    const factory = window.ErithAdminWindowManager;
    if (!factory?.create) {
      console.error(`Administrator ${ADMIN_BUILD}: operational window manager unavailable.`);
      return;
    }

    const manager = factory.create({
      storagePrefix: STORAGE_PREFIX,
      defaultFree: true,
      domain: currentDomain(),
      definitions: nativeDefinitions()
    });

    const state = manager.init();
    installMathCoreInlineWindowControls40148();

    // 40.1.48 — restore guard for compact bars.  Some stacked Administrator
    // surfaces can overlap a minimized bar visually; capture-phase recovery
    // guarantees that + Restaurer always reopens the intended window.
    document.addEventListener("pointerdown", event => {
      const restore = event.target?.closest?.(".admin-native-minibar-restore");
      const bar = restore?.closest?.("[data-admin-native-minibar]");
      const id = bar?.dataset?.adminNativeMinibar;
      if (!id) return;
      event.preventDefault();
      event.stopPropagation();
      manager.minimize(id, false);
    }, true);

    window.ErithAdministratorWindows = manager;
    installAdminBar(manager);
    installDomainObserver(manager);
    syncDomainWindows(manager);

    window.dispatchEvent(new CustomEvent("erith:administrator-mirror-ready", {
      detail: {
        build: ADMIN_BUILD,
        release: ADMIN_RELEASE,
        engine: ENGINE_BUILD,
        windows: state.count,
        layoutFree: state.free,
        domain: currentDomain()
      }
    }));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
