(() => {
  "use strict";

  const ADMIN_BUILD = "39.2.1";
  const ADMIN_RELEASE = "ADMINISTRATOR MIRROR · SEMANTIC WINDOWS";
  const CLASSIC_BUILD = "38.15.11";
  const STORAGE_PREFIX = "erith_admin_semantic_39_2_1";

  const mainChildren = () => [...(document.querySelector("main.shell")?.children || [])];

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

  function marketNodes() {
    const zone = document.getElementById("market-zone");
    if (!zone) return [];
    return [...zone.children].filter(node => node instanceof HTMLElement && node.id !== "analyste");
  }

  function groupFrom(startSelector, endSelector) {
    const start = document.querySelector(startSelector);
    const end = endSelector ? document.querySelector(endSelector) : null;
    return siblingRange(start, end);
  }

  function semanticDefinitions() {
    return [
      {
        id:"graphique",
        title:"Graphique",
        tone:"cyan",
        chrome:"external",
        resolveNodes:() => [document.getElementById("analyste")].filter(Boolean)
      },
      {
        id:"marche",
        title:"Marché",
        tone:"gold",
        chrome:"external",
        resolveNodes:marketNodes
      },
      {
        id:"analyse-decision",
        title:"Analyse & décision",
        tone:"cyan",
        resolveNodes:() => {
          const metal = document.getElementById("atlasMetalsAnalysisFoundation");
          const start = document.querySelector(".atlas-layout-family-analysis");
          const end = document.querySelector(".atlas-layout-family-intelligence");
          const nodes = groupFrom(".atlas-layout-family-analysis", ".atlas-layout-family-intelligence");
          return metal && metal.parentElement === start?.parentElement ? [metal, ...nodes] : nodes;
        },
        resolveAnchor:nodes => nodes.find(node => node.classList.contains("atlas-layout-family-analysis")) || nodes[0]
      },
      {
        id:"intelligence-memoire-creation",
        title:"Intelligence, mémoire & création",
        tone:"violet",
        resolveNodes:() => groupFrom(".atlas-layout-family-intelligence", ".atlas-layout-family-operations")
      },
      {
        id:"preparation-operations",
        title:"Préparation & opérations",
        tone:"gold",
        resolveNodes:() => groupFrom(".atlas-layout-family-operations", ".atlas-layout-family-system")
      },
      {
        id:"experimentation-systeme",
        title:"Expérimentation & système",
        tone:"orange",
        resolveNodes:() => groupFrom(".atlas-layout-family-system", "#missions-vie")
      },
      {
        id:"missions-de-vie",
        title:"Missions de vie",
        tone:"gold",
        resolveNodes:() => groupFrom("#missions-vie", "#mesure-audience")
      },
      {
        id:"mesure-audience",
        title:"Mesure d’audience",
        tone:"silver",
        resolveNodes:() => [document.getElementById("mesure-audience")].filter(Boolean)
      },
      {
        id:"sources",
        title:"Sources",
        tone:"green",
        resolveNodes:() => [document.getElementById("liveSourcesCollapse")].filter(Boolean)
      }
    ];
  }

  function installIdentity() {
    document.documentElement.dataset.administratorBuild = ADMIN_BUILD;
    document.body.dataset.administratorRelease = ADMIN_RELEASE;
    document.title = `Agent-Crypto @erith.IA — Semantic Windows · Build ${ADMIN_BUILD}`;

    const footer = document.getElementById("footerRelease");
    if (footer) footer.textContent = `Agent-Crypto @erith.IA · ${ADMIN_RELEASE} · Build ${ADMIN_BUILD} · Engine Classic ${CLASSIC_BUILD}`;

    const hero = document.querySelector(".hero .title-block");
    document.getElementById("administratorMirrorIdentity")?.remove();
    if (hero) {
      const identity = document.createElement("p");
      identity.id = "administratorMirrorIdentity";
      identity.className = "eyebrow";
      identity.style.marginTop = "7px";
      identity.textContent = `ADMINISTRATOR MIRROR · SEMANTIC WINDOWS · Build ${ADMIN_BUILD} · moteur Classic ${CLASSIC_BUILD}`;
      hero.appendChild(identity);
    }
  }

  function updateLayoutButton(button, free) {
    button.setAttribute("aria-pressed", String(free));
    button.textContent = free ? "FENÊTRES LIBRES" : "FENÊTRES VERROUILLÉES";
    button.title = free
      ? "Déplacement des 9 espaces sémantiques activé"
      : "Déplacement verrouillé · réduire/restaurer reste disponible";
  }

  function installAdminBar(manager) {
    document.querySelector(".admin-mirror-bar")?.remove();
    const bar = document.createElement("aside");
    bar.className = "admin-mirror-bar admin-mirror-bar-39-2-1";
    bar.setAttribute("aria-label", "Administrator Semantic Windows controls");

    const brand = document.createElement("span");
    brand.className = "admin-mirror-brand";
    brand.innerHTML = `ADMINISTRATOR <b>${ADMIN_BUILD}</b> · SEMANTIC WINDOWS`;

    const layout = document.createElement("button");
    layout.type = "button";
    updateLayoutButton(layout, manager.isFree());
    layout.addEventListener("click", () => updateLayoutButton(layout, manager.setFree(!manager.isFree())));

    const deck = document.createElement("button");
    deck.type = "button";
    deck.className = "admin-window-deck-toggle";
    deck.innerHTML = `WINDOWS <b>${manager.count}</b>`;
    deck.title = "Ouvrir les 9 espaces sémantiques";
    deck.addEventListener("click", () => manager.toggleDeck());

    const cascade = document.createElement("button");
    cascade.type = "button";
    cascade.textContent = "CASCADE";
    cascade.title = "Ranger seulement les fenêtres réellement détachées";
    cascade.addEventListener("click", () => manager.cascade());

    const reset = document.createElement("button");
    reset.type = "button";
    reset.textContent = "RESET FENÊTRES";
    reset.title = "Raccrocher et restaurer les 9 espaces sans toucher à leurs moteurs";
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
      console.error("Administrator 39.2.1: semantic window manager unavailable.");
      return;
    }
    const manager = factory.create({
      storagePrefix:STORAGE_PREFIX,
      defaultFree:true,
      definitions:semanticDefinitions()
    });
    const state = manager.init();
    window.ErithAdministratorWindows = manager;
    installAdminBar(manager);
    window.dispatchEvent(new CustomEvent("erith:administrator-mirror-ready", {
      detail:{ build:ADMIN_BUILD, release:ADMIN_RELEASE, classicEngine:CLASSIC_BUILD, windows:state.count, layoutFree:state.free }
    }));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once:true });
  else boot();
})();
