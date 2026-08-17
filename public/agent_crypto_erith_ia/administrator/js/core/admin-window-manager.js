(() => {
  "use strict";

  const DEFAULT_MIN_WIDTH = 360;
  const VIEWPORT_MARGIN = 10;
  const SNAP_DISTANCE = 22;
  const FLOATING_Z_BASE = 2147481800;

  const safeParse = (value, fallback = null) => {
    try { return JSON.parse(value); } catch { return fallback; }
  };

  const cleanText = value => String(value || "").replace(/\s+/g, " ").trim();

  function createManager(options = {}) {
    const storagePrefix = options.storagePrefix || "erith_admin_windows";
    const defaultFree = options.defaultFree !== false;
    const getCandidates = typeof options.getCandidates === "function"
      ? options.getCandidates
      : () => [];

    const layoutKey = `${storagePrefix}:layout-free`;
    const statePrefix = `${storagePrefix}:window:`;
    const nodesById = new Map();
    let zCounter = FLOATING_Z_BASE;
    let resizeObserver = null;
    let resizeFrame = 0;
    let deck = null;
    let deckList = null;
    let deckCount = null;
    let onStateChange = null;

    const readStorage = (key, fallback = null) => {
      try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
    };

    const writeStorage = (key, value) => {
      try { localStorage.setItem(key, value); return true; } catch { return false; }
    };

    const removeStorage = key => {
      try { localStorage.removeItem(key); } catch {}
    };

    const stateKey = id => `${statePrefix}${id}`;

    const getState = id => safeParse(readStorage(stateKey(id), "{}"), {}) || {};

    const setState = (id, patch) => {
      const next = { ...getState(id), ...patch };
      writeStorage(stateKey(id), JSON.stringify(next));
      updateDeck();
      onStateChange?.(id, next);
      return next;
    };

    function slug(value) {
      return cleanText(value)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 72) || "window";
    }

    function titleFor(node, index) {
      const summary = node.querySelector(":scope > summary .atlas-collapse-title, :scope > summary");
      const heading = node.querySelector(":scope > .section-head h2, :scope > h2, :scope h2, :scope h3");
      const fallback = node.id || node.dataset.collapseKey || `Fenêtre ${index + 1}`;
      const text = cleanText(summary?.textContent || heading?.textContent || fallback)
        .replace(/^▶\s*/, "")
        .replace(/\s+[⠿—+□▣⤢↙]+\s*$/g, "")
        .trim();
      return text.slice(0, 120) || `Fenêtre ${index + 1}`;
    }

    function stableIdFor(node, index, title) {
      const explicit = node.id || node.dataset.collapseKey;
      if (explicit) return explicit;
      const base = slug(title);
      let id = base;
      let suffix = 2;
      while (nodesById.has(id)) id = `${base}-${suffix++}`;
      return id || `window-${index + 1}`;
    }

    function clamp(value, min, max) {
      if (!Number.isFinite(value)) return min;
      return Math.min(max, Math.max(min, value));
    }

    function geometryFromNode(node) {
      const rect = node.getBoundingClientRect();
      return {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      };
    }

    function clampGeometry(geometry) {
      const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      const maxWidth = Math.max(DEFAULT_MIN_WIDTH, viewportWidth - VIEWPORT_MARGIN * 2);
      const maxHeight = Math.max(120, viewportHeight - VIEWPORT_MARGIN * 2);
      const width = clamp(Number(geometry.width) || DEFAULT_MIN_WIDTH, DEFAULT_MIN_WIDTH, maxWidth);
      const height = clamp(Number(geometry.height) || 220, 80, maxHeight);
      const visibleHandle = Math.min(180, width);
      const maxX = Math.max(VIEWPORT_MARGIN, viewportWidth - visibleHandle);
      const maxY = Math.max(VIEWPORT_MARGIN, viewportHeight - 46);
      return {
        x: clamp(Number(geometry.x), VIEWPORT_MARGIN, maxX),
        y: clamp(Number(geometry.y), VIEWPORT_MARGIN, maxY),
        width,
        height
      };
    }

    function snapGeometry(geometry) {
      const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      const next = { ...geometry };
      const right = next.x + next.width;
      const bottom = next.y + next.height;

      if (Math.abs(next.x - VIEWPORT_MARGIN) <= SNAP_DISTANCE) next.x = VIEWPORT_MARGIN;
      if (Math.abs(next.y - VIEWPORT_MARGIN) <= SNAP_DISTANCE) next.y = VIEWPORT_MARGIN;
      if (Math.abs(viewportWidth - VIEWPORT_MARGIN - right) <= SNAP_DISTANCE) {
        next.x = Math.max(VIEWPORT_MARGIN, viewportWidth - VIEWPORT_MARGIN - next.width);
      }
      if (Math.abs(viewportHeight - VIEWPORT_MARGIN - bottom) <= SNAP_DISTANCE) {
        next.y = Math.max(VIEWPORT_MARGIN, viewportHeight - VIEWPORT_MARGIN - next.height);
      }
      return clampGeometry(next);
    }

    function bringToFront(node, persist = true) {
      if (!node?.classList.contains("admin-floating")) return;
      zCounter += 1;
      node.style.zIndex = String(zCounter);
      if (persist) setState(node.dataset.adminWindowId, { z: zCounter });
    }

    function applyFloatingGeometry(node, geometry, persist = true) {
      const safe = clampGeometry(geometry);
      node.style.left = `${safe.x}px`;
      node.style.top = `${safe.y}px`;
      node.style.width = `${safe.width}px`;
      if (!node.classList.contains("admin-minimized")) node.style.height = `${safe.height}px`;
      if (persist) {
        setState(node.dataset.adminWindowId, {
          floating: true,
          x: safe.x,
          y: safe.y,
          width: safe.width,
          height: safe.height
        });
      }
      return safe;
    }

    function setFloating(node, floating, geometry = null, persist = true) {
      if (!node) return;
      const id = node.dataset.adminWindowId;
      const button = node.querySelector(":scope > .admin-window-controls .admin-window-float, :scope > summary .admin-window-controls .admin-window-float");

      if (!floating) {
        if (node.classList.contains("admin-maximized")) setMaximized(node, false, false);
        node.classList.remove("admin-floating");
        node.dataset.adminWindowState = node.classList.contains("admin-minimized") ? "minimized" : "docked";
        ["left", "top", "width", "height", "zIndex"].forEach(key => { node.style[key] = ""; });
        if (button) {
          button.textContent = "□";
          button.title = "Détacher cette fenêtre";
          button.setAttribute("aria-label", button.title);
        }
        if (persist) setState(id, { floating: false, maximized: false, x: null, y: null, width: null, height: null, z: null });
        return;
      }

      const rect = geometry || geometryFromNode(node);
      node.classList.add("admin-floating");
      node.dataset.adminWindowState = node.classList.contains("admin-minimized") ? "minimized" : "floating";
      applyFloatingGeometry(node, {
        x: Number.isFinite(rect.x) ? rect.x : rect.left,
        y: Number.isFinite(rect.y) ? rect.y : rect.top,
        width: Math.max(DEFAULT_MIN_WIDTH, Number(rect.width) || DEFAULT_MIN_WIDTH),
        height: Math.max(80, Number(rect.height) || 220)
      }, persist);
      if (button) {
        button.textContent = "▣";
        button.title = "Raccrocher cette fenêtre";
        button.setAttribute("aria-label", button.title);
      }
      bringToFront(node, persist);
    }

    function setMinimized(node, minimized, persist = true) {
      if (!node) return;
      const id = node.dataset.adminWindowId;
      if (minimized && node.classList.contains("admin-maximized")) setMaximized(node, false, persist);
      node.classList.toggle("admin-minimized", minimized);
      node.dataset.adminWindowState = minimized
        ? "minimized"
        : (node.classList.contains("admin-floating") ? "floating" : "docked");
      const button = node.querySelector(":scope > .admin-window-controls .admin-window-minimize, :scope > summary .admin-window-controls .admin-window-minimize");
      if (button) {
        button.textContent = minimized ? "+" : "—";
        button.title = minimized ? "Restaurer la fenêtre" : "Réduire la fenêtre";
        button.setAttribute("aria-label", button.title);
      }
      if (node.classList.contains("admin-floating")) {
        if (minimized) node.style.height = "";
        else {
          const state = getState(id);
          if (Number.isFinite(Number(state.height))) node.style.height = `${Math.max(80, Number(state.height))}px`;
        }
      }
      if (persist) setState(id, { minimized });
    }

    function setMaximized(node, maximized, persist = true) {
      if (!node) return;
      const id = node.dataset.adminWindowId;
      const button = node.querySelector(":scope > .admin-window-controls .admin-window-maximize, :scope > summary .admin-window-controls .admin-window-maximize");

      if (!maximized) {
        const state = getState(id);
        node.classList.remove("admin-maximized");
        if (button) {
          button.textContent = "⤢";
          button.title = "Agrandir la fenêtre";
          button.setAttribute("aria-label", button.title);
        }
        if (state.restoreFloating === false) {
          setFloating(node, false, null, false);
        } else if (state.restoreGeometry) {
          setFloating(node, true, state.restoreGeometry, false);
        }
        node.dataset.adminWindowState = node.classList.contains("admin-floating") ? "floating" : "docked";
        if (persist) setState(id, { maximized: false, restoreFloating: null, restoreGeometry: null });
        updateDeck();
        return;
      }

      const wasFloating = node.classList.contains("admin-floating");
      const restoreGeometry = wasFloating ? geometryFromNode(node) : null;
      if (!wasFloating) setFloating(node, true, geometryFromNode(node), false);
      setMinimized(node, false, false);
      node.classList.add("admin-maximized");
      node.dataset.adminWindowState = "maximized";
      node.style.left = `${VIEWPORT_MARGIN}px`;
      node.style.top = `${VIEWPORT_MARGIN}px`;
      node.style.width = `calc(100vw - ${VIEWPORT_MARGIN * 2}px)`;
      node.style.height = `calc(100vh - ${VIEWPORT_MARGIN * 2}px)`;
      bringToFront(node, false);
      if (button) {
        button.textContent = "↙";
        button.title = "Restaurer la taille précédente";
        button.setAttribute("aria-label", button.title);
      }
      if (persist) {
        setState(id, {
          maximized: true,
          minimized: false,
          floating: true,
          restoreFloating: wasFloating,
          restoreGeometry
        });
      }
      updateDeck();
    }

    function focusWindow(node) {
      if (!node) return;
      if (node.classList.contains("admin-minimized")) setMinimized(node, false);
      if (node.classList.contains("admin-floating")) bringToFront(node);
      else node.scrollIntoView({ behavior: "smooth", block: "center" });
      node.classList.remove("admin-window-focus-pulse");
      void node.offsetWidth;
      node.classList.add("admin-window-focus-pulse");
      node.addEventListener("animationend", () => node.classList.remove("admin-window-focus-pulse"), { once: true });
    }

    function dragStart(event, node, dragButton) {
      if (!document.body.classList.contains("admin-layout-free")) return;
      if (node.classList.contains("admin-maximized")) return;
      if (event.button !== 0 && event.pointerType === "mouse") return;
      event.preventDefault();
      event.stopPropagation();

      if (!node.classList.contains("admin-floating")) setFloating(node, true);
      bringToFront(node);

      const startRect = node.getBoundingClientRect();
      const startX = event.clientX;
      const startY = event.clientY;
      document.body.classList.add("admin-window-dragging");
      node.classList.add("admin-window-moving");
      dragButton.setPointerCapture?.(event.pointerId);

      const onMove = moveEvent => {
        const next = clampGeometry({
          x: startRect.left + (moveEvent.clientX - startX),
          y: startRect.top + (moveEvent.clientY - startY),
          width: startRect.width,
          height: startRect.height
        });
        node.style.left = `${next.x}px`;
        node.style.top = `${next.y}px`;
      };

      const onEnd = endEvent => {
        dragButton.releasePointerCapture?.(endEvent.pointerId);
        dragButton.removeEventListener("pointermove", onMove);
        dragButton.removeEventListener("pointerup", onEnd);
        dragButton.removeEventListener("pointercancel", onEnd);
        document.body.classList.remove("admin-window-dragging");
        node.classList.remove("admin-window-moving");
        const snapped = snapGeometry(geometryFromNode(node));
        applyFloatingGeometry(node, snapped, true);
      };

      dragButton.addEventListener("pointermove", onMove);
      dragButton.addEventListener("pointerup", onEnd);
      dragButton.addEventListener("pointercancel", onEnd);
    }

    function makeButton(className, text, title) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `admin-window-control ${className}`;
      button.textContent = text;
      button.title = title;
      button.setAttribute("aria-label", title);
      return button;
    }

    function installControls(node, index) {
      if (!(node instanceof HTMLElement) || node.dataset.adminWindowReady === "true") return;

      const title = titleFor(node, index);
      const id = stableIdFor(node, index, title);
      node.dataset.adminWindowReady = "true";
      node.dataset.adminWindowId = id;
      node.dataset.adminWindowTitle = title;
      node.dataset.adminWindowState = "docked";
      node.classList.add("admin-window-ready");
      nodesById.set(id, node);

      const controls = document.createElement("div");
      controls.className = "admin-window-controls";
      controls.setAttribute("role", "group");
      controls.setAttribute("aria-label", `Contrôles Administrator · ${title}`);

      const drag = makeButton("admin-window-drag", "⠿", "Déplacer la fenêtre");
      const minimize = makeButton("admin-window-minimize", "—", "Réduire la fenêtre");
      const float = makeButton("admin-window-float", "□", "Détacher cette fenêtre");
      const maximize = makeButton("admin-window-maximize", "⤢", "Agrandir la fenêtre");
      controls.append(drag, minimize, float, maximize);

      if (node.tagName === "DETAILS") {
        const summary = node.querySelector(":scope > summary");
        if (summary) summary.appendChild(controls);
        else node.appendChild(controls);
      } else {
        node.appendChild(controls);
      }

      [drag, minimize, float, maximize].forEach(button => {
        button.addEventListener("click", event => {
          event.preventDefault();
          event.stopPropagation();
        });
      });

      drag.addEventListener("pointerdown", event => dragStart(event, node, drag));
      drag.addEventListener("dblclick", event => {
        event.preventDefault();
        event.stopPropagation();
        setMaximized(node, !node.classList.contains("admin-maximized"));
      });
      minimize.addEventListener("click", () => setMinimized(node, !node.classList.contains("admin-minimized")));
      float.addEventListener("click", () => setFloating(node, !node.classList.contains("admin-floating")));
      maximize.addEventListener("click", () => setMaximized(node, !node.classList.contains("admin-maximized")));
      node.addEventListener("pointerdown", () => bringToFront(node, false), { passive: true });

      const state = getState(id);
      if (state.floating === true) {
        setFloating(node, true, {
          x: Number(state.x),
          y: Number(state.y),
          width: Number(state.width),
          height: Number(state.height)
        }, false);
        if (Number.isFinite(Number(state.z))) {
          zCounter = Math.max(zCounter, Number(state.z));
          node.style.zIndex = String(Number(state.z));
        }
      }
      if (state.minimized === true) setMinimized(node, true, false);
      if (state.maximized === true) setMaximized(node, true, false);

      resizeObserver?.observe(node);
    }

    function stateLabel(node) {
      if (node.classList.contains("admin-maximized")) return "MAX";
      if (node.classList.contains("admin-minimized")) return "MIN";
      if (node.classList.contains("admin-floating")) return "LIBRE";
      return "ANCRÉE";
    }

    function updateDeck() {
      if (!deckList) return;
      deckList.innerHTML = "";
      const entries = [...nodesById.entries()];
      if (deckCount) deckCount.textContent = String(entries.length);

      entries.forEach(([id, node]) => {
        const row = document.createElement("div");
        row.className = "admin-window-deck-row";
        const name = document.createElement("span");
        name.className = "admin-window-deck-name";
        name.textContent = node.dataset.adminWindowTitle || id;
        const state = document.createElement("span");
        state.className = "admin-window-deck-state";
        state.textContent = stateLabel(node);

        const focus = makeButton("admin-window-deck-action", "◎", "Afficher / mettre au premier plan");
        const dock = makeButton("admin-window-deck-action", "⌂", "Raccrocher");
        const min = makeButton("admin-window-deck-action", node.classList.contains("admin-minimized") ? "+" : "—", "Réduire / restaurer");
        focus.addEventListener("click", () => focusWindow(node));
        dock.addEventListener("click", () => setFloating(node, false));
        min.addEventListener("click", () => setMinimized(node, !node.classList.contains("admin-minimized")));

        row.append(name, state, focus, dock, min);
        deckList.appendChild(row);
      });
    }

    function installDeck() {
      if (deck) return deck;
      deck = document.createElement("aside");
      deck.className = "admin-window-deck";
      deck.hidden = true;
      deck.setAttribute("aria-label", "Gestionnaire de fenêtres Administrator");

      const head = document.createElement("div");
      head.className = "admin-window-deck-head";
      const title = document.createElement("strong");
      title.textContent = "WINDOW DECK";
      deckCount = document.createElement("span");
      deckCount.className = "admin-window-deck-count";
      const close = makeButton("admin-window-deck-close", "×", "Fermer le gestionnaire de fenêtres");
      close.addEventListener("click", () => setDeckOpen(false));
      head.append(title, deckCount, close);

      deckList = document.createElement("div");
      deckList.className = "admin-window-deck-list";
      deck.append(head, deckList);
      document.body.appendChild(deck);
      updateDeck();
      return deck;
    }

    function setDeckOpen(open) {
      installDeck();
      deck.hidden = !open;
      document.body.classList.toggle("admin-window-deck-open", open);
      updateDeck();
    }

    function toggleDeck() {
      installDeck();
      setDeckOpen(deck.hidden);
    }

    function setFree(free) {
      document.body.classList.toggle("admin-layout-free", !!free);
      writeStorage(layoutKey, free ? "1" : "0");
      document.dispatchEvent(new CustomEvent("erith:admin-window-layout", { detail: { free: !!free } }));
      return !!free;
    }

    function isFree() {
      return document.body.classList.contains("admin-layout-free");
    }

    function reset() {
      nodesById.forEach((node, id) => {
        removeStorage(stateKey(id));
        node.classList.remove("admin-floating", "admin-minimized", "admin-maximized", "admin-window-moving");
        node.dataset.adminWindowState = "docked";
        ["left", "top", "width", "height", "zIndex"].forEach(key => { node.style[key] = ""; });
        const min = node.querySelector(":scope > .admin-window-controls .admin-window-minimize, :scope > summary .admin-window-controls .admin-window-minimize");
        const fl = node.querySelector(":scope > .admin-window-controls .admin-window-float, :scope > summary .admin-window-controls .admin-window-float");
        const max = node.querySelector(":scope > .admin-window-controls .admin-window-maximize, :scope > summary .admin-window-controls .admin-window-maximize");
        if (min) { min.textContent = "—"; min.title = "Réduire la fenêtre"; min.setAttribute("aria-label", min.title); }
        if (fl) { fl.textContent = "□"; fl.title = "Détacher cette fenêtre"; fl.setAttribute("aria-label", fl.title); }
        if (max) { max.textContent = "⤢"; max.title = "Agrandir la fenêtre"; max.setAttribute("aria-label", max.title); }
      });
      updateDeck();
      document.dispatchEvent(new CustomEvent("erith:admin-window-reset"));
    }

    function cascade() {
      const floating = [...nodesById.values()].filter(node => node.classList.contains("admin-floating") && !node.classList.contains("admin-maximized"));
      if (!floating.length) return 0;
      const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      const width = Math.min(760, Math.max(DEFAULT_MIN_WIDTH, viewportWidth * 0.58));
      const height = Math.min(560, Math.max(220, viewportHeight * 0.62));
      floating.forEach((node, index) => {
        const step = 28;
        const maxCols = Math.max(1, Math.floor((viewportWidth - width - 20) / step) + 1);
        const col = index % maxCols;
        const row = Math.floor(index / maxCols);
        applyFloatingGeometry(node, {
          x: VIEWPORT_MARGIN + col * step,
          y: VIEWPORT_MARGIN + row * step,
          width,
          height
        }, true);
        bringToFront(node);
      });
      return floating.length;
    }

    function clampAll() {
      nodesById.forEach(node => {
        if (!node.classList.contains("admin-floating") || node.classList.contains("admin-maximized")) return;
        applyFloatingGeometry(node, clampGeometry(geometryFromNode(node)), true);
      });
    }

    function init() {
      const free = readStorage(layoutKey, defaultFree ? "1" : "0") === "1";
      document.body.classList.toggle("admin-layout-free", free);

      if (typeof ResizeObserver === "function") {
        resizeObserver = new ResizeObserver(entries => {
          cancelAnimationFrame(resizeFrame);
          resizeFrame = requestAnimationFrame(() => {
            entries.forEach(entry => {
              const node = entry.target;
              if (!node.classList.contains("admin-floating") || node.classList.contains("admin-maximized") || node.classList.contains("admin-minimized")) return;
              const rect = node.getBoundingClientRect();
              const state = getState(node.dataset.adminWindowId);
              const widthChanged = Math.abs((Number(state.width) || 0) - rect.width) > 1;
              const heightChanged = Math.abs((Number(state.height) || 0) - rect.height) > 1;
              if (widthChanged || heightChanged) {
                setState(node.dataset.adminWindowId, { width: rect.width, height: rect.height });
              }
            });
          });
        });
      }

      const candidates = getCandidates();
      candidates.forEach(installControls);
      installDeck();
      window.addEventListener("resize", () => requestAnimationFrame(clampAll), { passive: true });
      document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
          const maximized = [...nodesById.values()].find(node => node.classList.contains("admin-maximized"));
          if (maximized) setMaximized(maximized, false);
          else if (deck && !deck.hidden) setDeckOpen(false);
        }
      });
      updateDeck();
      return { free, count: nodesById.size };
    }

    return {
      init,
      setFree,
      isFree,
      reset,
      cascade,
      toggleDeck,
      setDeckOpen,
      focusWindow,
      get count() { return nodesById.size; },
      set onStateChange(handler) { onStateChange = typeof handler === "function" ? handler : null; }
    };
  }

  window.ErithAdminWindowManager = Object.freeze({ create: createManager });
})();
