(() => {
  "use strict";

  const ADMIN_BUILD = "39.2.2";
  const ADMIN_RELEASE = "ADMINISTRATOR MIRROR · NATIVE WINDOWS";
  const CLASSIC_BUILD = "38.15.11";
  const STORAGE_PREFIX = "erith_admin_native_39_2_2";

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
    const start = document.querySelector(startSelector);
    const end = endSelector ? document.querySelector(endSelector) : null;
    return siblingRange(start, end);
  }

  function marketNodes() {
    const zone = document.getElementById("market-zone");
    if (!zone) return [];
    return [...zone.children].filter(node => node instanceof HTMLElement && node.id !== "analyste");
  }

  function nativeDefinitions() {
    return [
      {
        id: "graphique",
        title: "Graphique",
        tone: "cyan",
        compactMinimize: true,
        resolveNodes: () => [document.getElementById("analyste")].filter(Boolean),
        resolveAnchor: nodes => nodes[0]
      },
      {
        id: "marche",
        title: "Marché",
        tone: "gold",
        compactMinimize: true,
        resolveNodes: marketNodes,
        resolveAnchor: nodes => document.getElementById("marketWorkspaceGrid") || nodes[0]
      },
      {
        id: "analyse-decision",
        title: "Analyse & décision",
        tone: "cyan",
        compactMinimize: false,
        resolveNodes: () => {
          const nodes = groupFrom(".atlas-layout-family-analysis", ".atlas-layout-family-intelligence");
          const metal = document.getElementById("atlasMetalsAnalysisFoundation");
          const start = document.querySelector(".atlas-layout-family-analysis");
          return metal && start && metal.parentElement === start.parentElement ? [metal, ...nodes] : nodes;
        },
        resolveAnchor: nodes => nodes.find(node => node.classList.contains("atlas-layout-family-analysis")) || nodes[0]
      },
      {
        id: "intelligence-memoire-creation",
        title: "Intelligence, mémoire & création",
        tone: "violet",
        compactMinimize: false,
        resolveNodes: () => groupFrom(".atlas-layout-family-intelligence", ".atlas-layout-family-operations"),
        resolveAnchor: nodes => nodes.find(node => node.classList.contains("atlas-layout-family-intelligence")) || nodes[0]
      },
      {
        id: "preparation-operations",
        title: "Préparation & opérations",
        tone: "gold",
        compactMinimize: false,
        resolveNodes: () => groupFrom(".atlas-layout-family-operations", ".atlas-layout-family-system"),
        resolveAnchor: nodes => nodes.find(node => node.classList.contains("atlas-layout-family-operations")) || nodes[0]
      },
      {
        id: "experimentation-systeme",
        title: "Expérimentation & système",
        tone: "orange",
        compactMinimize: false,
        resolveNodes: () => groupFrom(".atlas-layout-family-system", "#missions-vie"),
        resolveAnchor: nodes => nodes.find(node => node.classList.contains("atlas-layout-family-system")) || nodes[0]
      },
      {
        id: "missions-de-vie",
        title: "Missions de vie",
        tone: "gold",
        compactMinimize: true,
        resolveNodes: () => groupFrom("#missions-vie", "#mesure-audience"),
        resolveAnchor: nodes => document.getElementById("missions-vie") || nodes[0]
      },
      {
        id: "mesure-audience",
        title: "Mesure d’audience",
        tone: "silver",
        compactMinimize: false,
        resolveNodes: () => [document.getElementById("mesure-audience")].filter(Boolean),
        resolveAnchor: nodes => nodes[0]
      },
      {
        id: "sources",
        title: "Sources",
        tone: "green",
        compactMinimize: false,
        resolveNodes: () => [document.getElementById("liveSourcesCollapse")].filter(Boolean),
        resolveAnchor: nodes => nodes[0]
      }
    ];
  }

  function installIdentity() {
    document.documentElement.dataset.administratorBuild = ADMIN_BUILD;
    document.body.dataset.administratorRelease = ADMIN_RELEASE;
    document.title = `Agent-Crypto @erith.IA — Native Windows · Build ${ADMIN_BUILD}`;

    const footer = document.getElementById("footerRelease");
    if (footer) {
      footer.textContent = `Agent-Crypto @erith.IA · ${ADMIN_RELEASE} · Build ${ADMIN_BUILD} · Engine Classic ${CLASSIC_BUILD}`;
    }

    const hero = document.querySelector(".hero .title-block");
    document.getElementById("administratorMirrorIdentity")?.remove();
    if (hero) {
      const identity = document.createElement("p");
      identity.id = "administratorMirrorIdentity";
      identity.className = "eyebrow";
      identity.style.marginTop = "7px";
      identity.textContent = `ADMINISTRATOR MIRROR · NATIVE WINDOWS · Build ${ADMIN_BUILD} · moteur Classic ${CLASSIC_BUILD}`;
      hero.appendChild(identity);
    }
  }

  function updateLayoutButton(button, free) {
    button.setAttribute("aria-pressed", String(free));
    button.textContent = free ? "FENÊTRES LIBRES" : "FENÊTRES VERROUILLÉES";
    button.title = free
      ? "Déplacement des fenêtres natives activé"
      : "Déplacement verrouillé · réduction/restauration reste disponible";
  }

  function installAdminBar(manager) {
    document.querySelector(".admin-mirror-bar")?.remove();

    const bar = document.createElement("aside");
    bar.className = "admin-mirror-bar admin-mirror-bar-39-2-2";
    bar.setAttribute("aria-label", "Administrator Native Windows controls");

    const brand = document.createElement("span");
    brand.className = "admin-mirror-brand";
    brand.innerHTML = `ADMINISTRATOR <b>${ADMIN_BUILD}</b> · NATIVE WINDOWS`;

    const layout = document.createElement("button");
    layout.type = "button";
    updateLayoutButton(layout, manager.isFree());
    layout.addEventListener("click", () => {
      updateLayoutButton(layout, manager.setFree(!manager.isFree()));
    });

    const deck = document.createElement("button");
    deck.type = "button";
    deck.className = "admin-window-deck-toggle";
    deck.innerHTML = `WINDOWS <b>${manager.count}</b>`;
    deck.title = "Ouvrir le gestionnaire des fenêtres natives";
    deck.addEventListener("click", () => manager.toggleDeck());

    const cascade = document.createElement("button");
    cascade.type = "button";
    cascade.textContent = "CASCADE";
    cascade.title = "Ranger les fenêtres réellement détachées";
    cascade.addEventListener("click", () => manager.cascade());

    const reset = document.createElement("button");
    reset.type = "button";
    reset.textContent = "RESET FENÊTRES";
    reset.title = "Raccrocher et restaurer la disposition native Classic";
    reset.addEventListener("click", () => manager.reset());

    const classic = document.createElement("a");
    classic.href = "../web/index.html";
    classic.textContent = "CLASSIC 38.15.11";
    classic.title = "Ouvrir la Classic Final";

    bar.append(brand, layout, deck, cascade, reset, classic);
    document.body.appendChild(bar);
  }

  function boot() {
    installIdentity();

    const factory = window.ErithAdminWindowManager;
    if (!factory?.create) {
      console.error("Administrator 39.2.2: native window manager unavailable.");
      return;
    }

    const manager = factory.create({
      storagePrefix: STORAGE_PREFIX,
      defaultFree: true,
      definitions: nativeDefinitions()
    });

    const state = manager.init();
    window.ErithAdministratorWindows = manager;
    installAdminBar(manager);

    window.dispatchEvent(new CustomEvent("erith:administrator-mirror-ready", {
      detail: {
        build: ADMIN_BUILD,
        release: ADMIN_RELEASE,
        classicEngine: CLASSIC_BUILD,
        windows: state.count,
        layoutFree: state.free
      }
    }));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
