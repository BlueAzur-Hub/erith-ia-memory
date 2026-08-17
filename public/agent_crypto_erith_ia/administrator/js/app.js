(() => {
  "use strict";

  const ADMIN_BUILD = "39.1";
  const ADMIN_RELEASE = "ADMINISTRATOR MIRROR · METAL BASE";
  const CLASSIC_BUILD = "38.15.11";
  const STORAGE_PREFIX = "erith_admin_mirror_39_1";
  const LAYOUT_KEY = `${STORAGE_PREFIX}:layout-free`;
  const WINDOW_KEY_PREFIX = `${STORAGE_PREFIX}:window:`;

  const safeParse = (value, fallback = null) => {
    try { return JSON.parse(value); } catch { return fallback; }
  };

  const readStorage = (key, fallback = null) => {
    try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
  };

  const writeStorage = (key, value) => {
    try { localStorage.setItem(key, value); return true; } catch { return false; }
  };

  const removeStorage = (key) => {
    try { localStorage.removeItem(key); } catch {}
  };

  const cleanText = value => String(value || "").replace(/\s+/g, " ").trim();

  function extractWindowTitle(node, index) {
    const explicit = node.id ? node.id.replace(/[-_]+/g, " ") : "";
    const summary = node.querySelector(":scope > summary .atlas-collapse-title, :scope > summary");
    const heading = node.querySelector(":scope > .section-head h2, :scope > h2, :scope h2, :scope h3");
    const text = cleanText(summary?.textContent || heading?.textContent || explicit || `Fenêtre ${index + 1}`);
    return text.replace(/^▶\s*/, "").slice(0, 110);
  }

  function windowCandidates() {
    const main = document.querySelector("main.shell");
    if (!main) return [];
    return [...main.children].filter(node => {
      if (!(node instanceof HTMLElement)) return false;
      if (!["SECTION", "DETAILS"].includes(node.tagName)) return false;
      if (node.id === "marche") return false;
      if (node.classList.contains("atlas-layout-family")) return false;
      if (node.hidden) return false;
      return true;
    });
  }

  function stateKey(id) { return `${WINDOW_KEY_PREFIX}${id}`; }

  function getWindowState(id) {
    return safeParse(readStorage(stateKey(id), "{}"), {}) || {};
  }

  function setWindowState(id, patch) {
    const next = { ...getWindowState(id), ...patch };
    writeStorage(stateKey(id), JSON.stringify(next));
    return next;
  }

  function setFloating(node, floating, geometry = null) {
    const id = node.dataset.adminWindowId;
    const floatButton = node.querySelector(".admin-window-float");

    if (!floating) {
      node.classList.remove("admin-floating");
      node.dataset.adminWindowState = "docked";
      ["left", "top", "width", "height"].forEach(key => { node.style[key] = ""; });
      if (floatButton) {
        floatButton.textContent = "□";
        floatButton.title = "Détacher cette fenêtre";
        floatButton.setAttribute("aria-label", "Détacher cette fenêtre");
      }
      setWindowState(id, { floating: false, x: null, y: null, width: null, height: null });
      return;
    }

    const rect = node.getBoundingClientRect();
    const x = Number.isFinite(geometry?.x) ? geometry.x : Math.max(8, rect.left);
    const y = Number.isFinite(geometry?.y) ? geometry.y : Math.max(8, rect.top);
    const width = Number.isFinite(geometry?.width) ? geometry.width : Math.max(320, rect.width);
    const height = Number.isFinite(geometry?.height) && geometry.height > 0 ? geometry.height : null;

    node.classList.add("admin-floating");
    node.dataset.adminWindowState = "floating";
    node.style.left = `${Math.min(Math.max(8, x), Math.max(8, window.innerWidth - 160))}px`;
    node.style.top = `${Math.min(Math.max(8, y), Math.max(8, window.innerHeight - 80))}px`;
    node.style.width = `${Math.min(width, Math.max(320, window.innerWidth - 16))}px`;
    if (height) node.style.height = `${Math.min(height, Math.max(80, window.innerHeight - 16))}px`;

    if (floatButton) {
      floatButton.textContent = "▣";
      floatButton.title = "Raccrocher cette fenêtre";
      floatButton.setAttribute("aria-label", "Raccrocher cette fenêtre");
    }

    setWindowState(id, { floating: true, x, y, width, height });
  }

  function setMinimized(node, minimized) {
    const id = node.dataset.adminWindowId;
    node.classList.toggle("admin-minimized", minimized);
    const button = node.querySelector(".admin-window-minimize");
    if (button) {
      button.textContent = minimized ? "+" : "—";
      button.title = minimized ? "Restaurer la fenêtre" : "Réduire la fenêtre";
      button.setAttribute("aria-label", button.title);
    }
    setWindowState(id, { minimized });
  }

  function installWindowControls(node, index) {
    if (node.dataset.adminWindowReady === "true") return;
    node.dataset.adminWindowReady = "true";
    node.classList.add("admin-window-ready");

    const id = node.id || node.dataset.collapseKey || `window-${index + 1}`;
    const title = extractWindowTitle(node, index);
    node.dataset.adminWindowId = id;
    node.dataset.adminWindowTitle = title;
    node.dataset.adminWindowState = "docked";

    const controls = document.createElement("div");
    controls.className = "admin-window-controls";
    controls.setAttribute("role", "group");
    controls.setAttribute("aria-label", `Contrôles administrateur · ${title}`);

    const drag = document.createElement("button");
    drag.type = "button";
    drag.className = "admin-window-control admin-window-drag";
    drag.textContent = "⠿";
    drag.title = "Déplacer la fenêtre (mode Fenêtres libres)";
    drag.setAttribute("aria-label", drag.title);

    const minimize = document.createElement("button");
    minimize.type = "button";
    minimize.className = "admin-window-control admin-window-minimize";
    minimize.textContent = "—";
    minimize.title = "Réduire la fenêtre";
    minimize.setAttribute("aria-label", minimize.title);

    const float = document.createElement("button");
    float.type = "button";
    float.className = "admin-window-control admin-window-float";
    float.textContent = "□";
    float.title = "Détacher cette fenêtre";
    float.setAttribute("aria-label", float.title);

    controls.append(drag, minimize, float);

    if (node.tagName === "DETAILS") {
      const summary = node.querySelector(":scope > summary");
      if (summary) summary.appendChild(controls);
      else node.appendChild(controls);
    } else {
      node.appendChild(controls);
    }

    minimize.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      setMinimized(node, !node.classList.contains("admin-minimized"));
    });

    float.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      setFloating(node, !node.classList.contains("admin-floating"));
    });

    drag.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
    });

    drag.addEventListener("pointerdown", event => {
      event.preventDefault();
      event.stopPropagation();
      if (!document.body.classList.contains("admin-layout-free")) return;
      if (event.button !== 0 && event.pointerType === "mouse") return;

      if (!node.classList.contains("admin-floating")) setFloating(node, true);

      const startRect = node.getBoundingClientRect();
      const startX = event.clientX;
      const startY = event.clientY;
      const initialLeft = startRect.left;
      const initialTop = startRect.top;
      document.body.classList.add("admin-window-dragging");
      drag.setPointerCapture?.(event.pointerId);

      const onMove = moveEvent => {
        const maxLeft = Math.max(8, window.innerWidth - Math.min(150, startRect.width));
        const maxTop = Math.max(8, window.innerHeight - 48);
        const left = Math.min(maxLeft, Math.max(8, initialLeft + (moveEvent.clientX - startX)));
        const top = Math.min(maxTop, Math.max(8, initialTop + (moveEvent.clientY - startY)));
        node.style.left = `${left}px`;
        node.style.top = `${top}px`;
      };

      const onEnd = endEvent => {
        drag.releasePointerCapture?.(endEvent.pointerId);
        drag.removeEventListener("pointermove", onMove);
        drag.removeEventListener("pointerup", onEnd);
        drag.removeEventListener("pointercancel", onEnd);
        document.body.classList.remove("admin-window-dragging");
        const rect = node.getBoundingClientRect();
        setWindowState(id, {
          floating: true,
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: node.style.height ? rect.height : null
        });
      };

      drag.addEventListener("pointermove", onMove);
      drag.addEventListener("pointerup", onEnd);
      drag.addEventListener("pointercancel", onEnd);
    });

    const state = getWindowState(id);
    if (state.minimized === true) setMinimized(node, true);
    if (state.floating === true) {
      setFloating(node, true, {
        x: Number(state.x), y: Number(state.y), width: Number(state.width), height: Number(state.height)
      });
    }
  }

  function updateLayoutButton(button, free) {
    button.setAttribute("aria-pressed", String(free));
    button.textContent = free ? "FENÊTRES LIBRES" : "FENÊTRES VERROUILLÉES";
    button.title = free ? "Déplacement autorisé par les poignées ⠿" : "Déplacement verrouillé";
  }

  function setLayoutFree(free, button = null) {
    document.body.classList.toggle("admin-layout-free", free);
    writeStorage(LAYOUT_KEY, free ? "1" : "0");
    if (button) updateLayoutButton(button, free);
  }

  function resetWindows() {
    windowCandidates().forEach((node, index) => {
      const id = node.dataset.adminWindowId || node.id || node.dataset.collapseKey || `window-${index + 1}`;
      removeStorage(stateKey(id));
      node.classList.remove("admin-floating", "admin-minimized");
      node.dataset.adminWindowState = "docked";
      ["left", "top", "width", "height"].forEach(key => { node.style[key] = ""; });
      const min = node.querySelector(".admin-window-minimize");
      if (min) { min.textContent = "—"; min.title = "Réduire la fenêtre"; min.setAttribute("aria-label", min.title); }
      const fl = node.querySelector(".admin-window-float");
      if (fl) { fl.textContent = "□"; fl.title = "Détacher cette fenêtre"; fl.setAttribute("aria-label", fl.title); }
    });
  }

  function installAdminBar() {
    if (document.querySelector(".admin-mirror-bar")) return;
    const bar = document.createElement("aside");
    bar.className = "admin-mirror-bar";
    bar.setAttribute("aria-label", "Administrator Mirror controls");

    const brand = document.createElement("span");
    brand.className = "admin-mirror-brand";
    brand.innerHTML = `ADMINISTRATOR <b>${ADMIN_BUILD}</b> · METAL BASE`;

    const layout = document.createElement("button");
    layout.type = "button";
    layout.dataset.adminLayoutToggle = "";
    const free = readStorage(LAYOUT_KEY, "0") === "1";
    updateLayoutButton(layout, free);
    document.body.classList.toggle("admin-layout-free", free);
    layout.addEventListener("click", () => setLayoutFree(!document.body.classList.contains("admin-layout-free"), layout));

    const reset = document.createElement("button");
    reset.type = "button";
    reset.textContent = "RESET FENÊTRES";
    reset.title = "Raccrocher et restaurer toutes les fenêtres Administrator";
    reset.addEventListener("click", resetWindows);

    const classic = document.createElement("a");
    classic.href = "../web/index.html";
    classic.textContent = "CLASSIC 38.15.11";
    classic.title = "Ouvrir la Classic Final dans cet onglet";

    bar.append(brand, layout, reset, classic);
    document.body.appendChild(bar);
  }

  function installIdentity() {
    document.documentElement.dataset.administratorBuild = ADMIN_BUILD;
    document.body.dataset.administratorRelease = ADMIN_RELEASE;
    document.title = `Agent-Crypto @erith.IA — Administrator Mirror · Build ${ADMIN_BUILD}`;

    const footer = document.getElementById("footerRelease");
    if (footer) footer.textContent = `Agent-Crypto @erith.IA · ${ADMIN_RELEASE} · Build ${ADMIN_BUILD} · Engine Classic ${CLASSIC_BUILD}`;

    const hero = document.querySelector(".hero .title-block");
    if (hero && !document.getElementById("administratorMirrorIdentity")) {
      const identity = document.createElement("p");
      identity.id = "administratorMirrorIdentity";
      identity.className = "eyebrow";
      identity.style.marginTop = "7px";
      identity.textContent = `ADMINISTRATOR MIRROR · METAL BASE · Build ${ADMIN_BUILD} · moteur Classic ${CLASSIC_BUILD}`;
      hero.appendChild(identity);
    }
  }

  function boot() {
    installIdentity();
    installAdminBar();
    windowCandidates().forEach(installWindowControls);

    // No timer, fetch, Bridge, Ollama or analytical event is added here.
    window.dispatchEvent(new CustomEvent("erith:administrator-mirror-ready", {
      detail: { build: ADMIN_BUILD, release: ADMIN_RELEASE, classicEngine: CLASSIC_BUILD }
    }));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
