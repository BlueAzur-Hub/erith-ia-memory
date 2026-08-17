(() => {
  "use strict";

  const ADMIN_BUILD = "39.2";
  const ADMIN_RELEASE = "ADMINISTRATOR MIRROR · FREE WINDOWS";
  const CLASSIC_BUILD = "38.15.11";
  const STORAGE_PREFIX = "erith_admin_mirror_39_2";

  function windowCandidates() {
    const main = document.querySelector("main.shell");
    if (!main) return [];

    return [...main.children].filter(node => {
      if (!(node instanceof HTMLElement)) return false;
      if (!["SECTION", "DETAILS"].includes(node.tagName)) return false;
      if (node.classList.contains("atlas-layout-family")) return false;
      if (node.id === "marche") return false;
      return true;
    });
  }

  function updateLayoutButton(button, free) {
    button.setAttribute("aria-pressed", String(free));
    button.textContent = free ? "FENÊTRES LIBRES" : "FENÊTRES VERROUILLÉES";
    button.title = free
      ? "Poignées ⠿ actives · les fenêtres peuvent être déplacées"
      : "Déplacement verrouillé · réduction et consultation restent disponibles";
  }

  function installIdentity() {
    document.documentElement.dataset.administratorBuild = ADMIN_BUILD;
    document.body.dataset.administratorRelease = ADMIN_RELEASE;
    document.title = `Agent-Crypto @erith.IA — Administrator Free Windows · Build ${ADMIN_BUILD}`;

    const footer = document.getElementById("footerRelease");
    if (footer) footer.textContent = `Agent-Crypto @erith.IA · ${ADMIN_RELEASE} · Build ${ADMIN_BUILD} · Engine Classic ${CLASSIC_BUILD}`;

    const hero = document.querySelector(".hero .title-block");
    const previous = document.getElementById("administratorMirrorIdentity");
    if (previous) previous.remove();
    if (hero) {
      const identity = document.createElement("p");
      identity.id = "administratorMirrorIdentity";
      identity.className = "eyebrow";
      identity.style.marginTop = "7px";
      identity.textContent = `ADMINISTRATOR MIRROR · FREE WINDOWS · Build ${ADMIN_BUILD} · moteur Classic ${CLASSIC_BUILD}`;
      hero.appendChild(identity);
    }
  }

  function installAdminBar(manager) {
    document.querySelector(".admin-mirror-bar")?.remove();

    const bar = document.createElement("aside");
    bar.className = "admin-mirror-bar admin-mirror-bar-39-2";
    bar.setAttribute("aria-label", "Administrator Free Windows controls");

    const brand = document.createElement("span");
    brand.className = "admin-mirror-brand";
    brand.innerHTML = `ADMINISTRATOR <b>${ADMIN_BUILD}</b> · FREE WINDOWS`;

    const layout = document.createElement("button");
    layout.type = "button";
    layout.dataset.adminLayoutToggle = "";
    updateLayoutButton(layout, manager.isFree());
    layout.addEventListener("click", () => {
      const free = manager.setFree(!manager.isFree());
      updateLayoutButton(layout, free);
    });

    const deck = document.createElement("button");
    deck.type = "button";
    deck.className = "admin-window-deck-toggle";
    deck.innerHTML = `WINDOWS <b>${manager.count}</b>`;
    deck.title = "Ouvrir le gestionnaire de fenêtres";
    deck.addEventListener("click", () => manager.toggleDeck());

    const cascade = document.createElement("button");
    cascade.type = "button";
    cascade.textContent = "CASCADE";
    cascade.title = "Ranger les fenêtres actuellement détachées en cascade";
    cascade.addEventListener("click", () => manager.cascade());

    const reset = document.createElement("button");
    reset.type = "button";
    reset.textContent = "RESET FENÊTRES";
    reset.title = "Raccrocher, restaurer et redimensionner toutes les fenêtres";
    reset.addEventListener("click", () => manager.reset());

    const classic = document.createElement("a");
    classic.href = "../web/index.html";
    classic.textContent = "CLASSIC 38.15.11";
    classic.title = "Ouvrir la Classic Final dans cet onglet";

    bar.append(brand, layout, deck, cascade, reset, classic);
    document.body.appendChild(bar);

    manager.onStateChange = () => {
      deck.innerHTML = `WINDOWS <b>${manager.count}</b>`;
    };
  }

  function boot() {
    installIdentity();

    const factory = window.ErithAdminWindowManager;
    if (!factory?.create) {
      console.error("Administrator 39.2: window manager unavailable.");
      return;
    }

    const manager = factory.create({
      storagePrefix: STORAGE_PREFIX,
      defaultFree: true,
      getCandidates: windowCandidates
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

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
