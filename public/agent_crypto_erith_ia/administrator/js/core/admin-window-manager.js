(() => {
  "use strict";

  const VIEWPORT_MARGIN = 12;
  const MIN_WIDTH = 420;
  const MIN_HEIGHT = 90;
  const FLOAT_Z_BASE = 2147481800;

  const clean = value => String(value || "").replace(/\s+/g, " ").trim();
  const safeJson = (value, fallback = {}) => {
    try { return JSON.parse(value); } catch { return fallback; }
  };

  function createManager(options = {}) {
    const storagePrefix = options.storagePrefix || "erith_admin_native_windows";
    const definitions = Array.isArray(options.definitions) ? options.definitions : [];
    const defaultFree = options.defaultFree !== false;
    const layoutKey = `${storagePrefix}:layout-free`;
    const statePrefix = `${storagePrefix}:window:`;

    const windows = new Map();
    let zCounter = FLOAT_Z_BASE;
    let deck = null;
    let deckList = null;
    let deckCount = null;
    let stateCallback = null;

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
    const getState = id => safeJson(readStorage(stateKey(id), "{}"), {}) || {};
    const patchState = (id, patch) => {
      const next = { ...getState(id), ...patch };
      writeStorage(stateKey(id), JSON.stringify(next));
      updateDeck();
      stateCallback?.(id, next);
      return next;
    };

    function clamp(value, min, max) {
      const number = Number(value);
      if (!Number.isFinite(number)) return min;
      return Math.min(max, Math.max(min, number));
    }

    function clampGeometry(geometry = {}) {
      const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      const maxWidth = Math.max(MIN_WIDTH, vw - VIEWPORT_MARGIN * 2);
      const maxHeight = Math.max(MIN_HEIGHT, vh - VIEWPORT_MARGIN * 2);
      const width = clamp(geometry.width || Math.min(1180, vw * .82), Math.min(MIN_WIDTH, maxWidth), maxWidth);
      const height = clamp(geometry.height || Math.min(760, vh * .80), MIN_HEIGHT, maxHeight);
      const maxX = Math.max(VIEWPORT_MARGIN, vw - Math.min(190, width));
      const maxY = Math.max(VIEWPORT_MARGIN, vh - 50);
      return {
        x: clamp(geometry.x ?? VIEWPORT_MARGIN * 2, VIEWPORT_MARGIN, maxX),
        y: clamp(geometry.y ?? VIEWPORT_MARGIN * 2, VIEWPORT_MARGIN, maxY),
        width,
        height
      };
    }

    function createButton(className, text, title) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `admin-native-control ${className}`;
      button.textContent = text;
      button.title = title;
      button.setAttribute("aria-label", title);
      button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
      });
      return button;
    }

    function createControls(win) {
      const controls = document.createElement("div");
      controls.className = "admin-native-controls";
      controls.setAttribute("role", "group");
      controls.setAttribute("aria-label", `Fenêtre Administrator · ${win.title}`);

      const drag = createButton("admin-native-drag", "⠿", `Déplacer ${win.title}`);
      const minimize = createButton("admin-native-minimize", "—", `Réduire ${win.title}`);
      const float = createButton("admin-native-float", "□", `Détacher ${win.title}`);
      const maximize = createButton("admin-native-maximize", "⤢", `Agrandir ${win.title}`);
      controls.append(drag, minimize, float, maximize);

      if (win.anchor.tagName === "DETAILS") {
        const summary = win.anchor.querySelector(":scope > summary");
        (summary || win.anchor).appendChild(controls);
      } else {
        win.anchor.appendChild(controls);
      }

      win.controls = { root: controls, drag, minimize, float, maximize };
      drag.addEventListener("pointerdown", event => dragStart(event, win));
      drag.addEventListener("dblclick", event => {
        event.preventDefault();
        event.stopPropagation();
        setMaximized(win, !win.maximized);
      });
      minimize.addEventListener("click", () => setMinimized(win, !win.minimized));
      float.addEventListener("click", () => setFloating(win, !win.floating));
      maximize.addEventListener("click", () => setMaximized(win, !win.maximized));
    }

    function resolveDefinition(def) {
      const nodes = (typeof def.resolveNodes === "function" ? def.resolveNodes() : [])
        .filter(node => node instanceof HTMLElement);
      if (!nodes.length) return null;

      const parent = nodes[0].parentElement;
      if (!parent || nodes.some(node => node.parentElement !== parent)) return null;

      const anchor = typeof def.resolveAnchor === "function" ? def.resolveAnchor(nodes) : nodes[0];
      if (!(anchor instanceof HTMLElement) || !nodes.includes(anchor)) return null;

      const win = {
        id: def.id,
        title: clean(def.title) || def.id,
        tone: def.tone || "neutral",
        compactMinimize: def.compactMinimize === true,
        nodes: [...nodes],
        parent,
        anchor,
        placeholder: null,
        shell: null,
        controls: null,
        floating: false,
        minimized: false,
        maximized: false,
        restoreGeometry: null,
        restoreFloating: false
      };

      win.nodes.forEach(node => {
        node.dataset.adminNativeWindow = win.id;
      });
      win.anchor.classList.add("admin-native-anchor", `admin-native-window-${win.id}`, `admin-native-tone-${win.tone}`);
      win.anchor.dataset.adminNativeTitle = win.title;
      createControls(win);
      return win;
    }

    function ensurePlaceholder(win) {
      if (win.placeholder?.isConnected) return win.placeholder;
      const placeholder = document.createElement("div");
      placeholder.className = "admin-native-placeholder";
      placeholder.dataset.adminNativePlaceholder = win.id;
      placeholder.hidden = true;
      win.parent.insertBefore(placeholder, win.nodes[0]);
      win.placeholder = placeholder;
      return placeholder;
    }

    function geometryForWindow(win) {
      const target = win.shell || win.anchor;
      const rect = target.getBoundingClientRect();
      return {
        x: rect.left,
        y: rect.top,
        width: Math.max(MIN_WIDTH, rect.width),
        height: Math.max(MIN_HEIGHT, rect.height)
      };
    }

    function persistGeometry(win) {
      if (!win?.floating || !win.shell || win.maximized || win.minimized) return;
      const safe = clampGeometry(geometryForWindow(win));
      patchState(win.id, {
        floating: true,
        ...safe,
        z: Number(win.shell.style.zIndex) || zCounter
      });
    }

    function buildShell(win, geometry) {
      if (win.shell?.isConnected) return win.shell;
      const placeholder = ensurePlaceholder(win);
      const shell = document.createElement("section");
      shell.className = `admin-native-floating-shell admin-native-tone-${win.tone}`;
      shell.dataset.adminNativeShell = win.id;
      shell.setAttribute("aria-label", `Fenêtre flottante ${win.title}`);
      placeholder.after(shell);
      win.nodes.forEach(node => shell.appendChild(node));
      win.shell = shell;

      const safe = clampGeometry(geometry);
      Object.assign(shell.style, {
        left: `${safe.x}px`,
        top: `${safe.y}px`,
        width: `${safe.width}px`,
        height: `${safe.height}px`
      });

      shell.addEventListener("pointerdown", () => bringToFront(win, false), { passive: true });
      shell.addEventListener("pointerup", () => persistGeometry(win), { passive: true });
      return shell;
    }

    function restoreToFlow(win) {
      if (!win.shell) return;
      const shell = win.shell;
      const placeholder = win.placeholder;
      if (placeholder?.isConnected) {
        win.nodes.forEach(node => win.parent.insertBefore(node, placeholder));
        placeholder.remove();
      }
      shell.remove();
      win.shell = null;
      win.placeholder = null;
    }

    function bringToFront(win, persist = true) {
      if (!win.floating || !win.shell) return;
      zCounter += 1;
      win.shell.style.zIndex = String(zCounter);
      if (persist) patchState(win.id, { z: zCounter });
    }

    function updateControlState(win) {
      const { minimize, float, maximize } = win.controls || {};
      if (minimize) {
        minimize.textContent = win.minimized ? "+" : "—";
        minimize.title = win.minimized ? `Restaurer ${win.title}` : `Réduire ${win.title}`;
        minimize.setAttribute("aria-label", minimize.title);
      }
      if (float) {
        float.textContent = win.floating ? "▣" : "□";
        float.title = win.floating ? `Raccrocher ${win.title}` : `Détacher ${win.title}`;
        float.setAttribute("aria-label", float.title);
      }
      if (maximize) {
        maximize.textContent = win.maximized ? "↙" : "⤢";
        maximize.title = win.maximized ? `Restaurer la taille de ${win.title}` : `Agrandir ${win.title}`;
        maximize.setAttribute("aria-label", maximize.title);
      }
    }

    function applyMinimizeVisual(win) {
      win.nodes.forEach(node => {
        if (node === win.anchor) return;
        node.classList.toggle("admin-native-hidden-by-window", win.minimized);
      });

      win.anchor.classList.toggle("admin-native-minimized", win.minimized);
      win.anchor.classList.toggle("admin-native-compact-minimized", win.minimized && win.compactMinimize);
      if (win.anchor.tagName === "DETAILS") {
        win.anchor.classList.toggle("admin-native-details-minimized", win.minimized);
      }
      if (win.shell) win.shell.classList.toggle("admin-native-shell-minimized", win.minimized);
    }

    function setMinimized(win, minimized, persist = true) {
      if (!win) return;
      if (minimized && win.maximized) setMaximized(win, false, false);
      win.minimized = !!minimized;
      applyMinimizeVisual(win);
      updateControlState(win);
      if (persist) patchState(win.id, { minimized: win.minimized });
      updateDeck();
    }

    function setFloating(win, floating, persist = true, geometry = null) {
      if (!win) return;

      if (!floating) {
        if (win.maximized) setMaximized(win, false, false);
        restoreToFlow(win);
        win.floating = false;
        applyMinimizeVisual(win);
        updateControlState(win);
        if (persist) patchState(win.id, { floating: false, maximized: false });
        updateDeck();
        return;
      }

      if (win.floating && win.shell) return;
      const rect = geometry || geometryForWindow(win);
      buildShell(win, rect);
      win.floating = true;
      applyMinimizeVisual(win);
      bringToFront(win, false);
      updateControlState(win);

      if (persist) {
        const safe = clampGeometry(geometryForWindow(win));
        patchState(win.id, {
          floating: true,
          ...safe,
          z: Number(win.shell.style.zIndex) || zCounter
        });
      }
      updateDeck();
    }

    function setMaximized(win, maximized, persist = true, restoreOverride = null) {
      if (!win) return;

      if (!maximized) {
        if (!win.maximized) return;
        win.maximized = false;
        win.shell?.classList.remove("admin-native-maximized");
        if (win.restoreFloating) {
          if (!win.floating) setFloating(win, true, false, win.restoreGeometry);
          if (win.shell && win.restoreGeometry) {
            const safe = clampGeometry(win.restoreGeometry);
            Object.assign(win.shell.style, {
              left: `${safe.x}px`,
              top: `${safe.y}px`,
              width: `${safe.width}px`,
              height: `${safe.height}px`
            });
          }
        } else {
          setFloating(win, false, false);
        }
        updateControlState(win);
        if (persist) patchState(win.id, { maximized: false, restoreFloating: null, restoreGeometry: null });
        updateDeck();
        return;
      }

      win.restoreFloating = restoreOverride ? !!restoreOverride.restoreFloating : win.floating;
      win.restoreGeometry = restoreOverride
        ? (restoreOverride.restoreGeometry || null)
        : (win.floating ? geometryForWindow(win) : null);

      if (!win.floating) setFloating(win, true, false, geometryForWindow(win));
      setMinimized(win, false, false);
      win.maximized = true;
      win.shell.classList.add("admin-native-maximized");
      Object.assign(win.shell.style, {
        left: `${VIEWPORT_MARGIN}px`,
        top: `${VIEWPORT_MARGIN}px`,
        width: `calc(100vw - ${VIEWPORT_MARGIN * 2}px)`,
        height: `calc(100vh - ${VIEWPORT_MARGIN * 2}px)`
      });
      bringToFront(win, false);
      updateControlState(win);

      if (persist) {
        patchState(win.id, {
          maximized: true,
          minimized: false,
          floating: true,
          restoreFloating: win.restoreFloating,
          restoreGeometry: win.restoreGeometry
        });
      }
      updateDeck();
    }

    function dragStart(event, win) {
      if (!document.body.classList.contains("admin-native-free")) return;
      if (win.maximized) return;
      if (event.button !== 0 && event.pointerType === "mouse") return;
      event.preventDefault();
      event.stopPropagation();

      if (!win.floating) setFloating(win, true, true, geometryForWindow(win));
      bringToFront(win);

      const shell = win.shell;
      if (!shell) return;
      const rect = shell.getBoundingClientRect();
      const startX = event.clientX;
      const startY = event.clientY;
      const button = win.controls?.drag;
      document.body.classList.add("admin-native-dragging");
      shell.classList.add("admin-native-moving");
      button?.setPointerCapture?.(event.pointerId);

      const move = moveEvent => {
        const safe = clampGeometry({
          x: rect.left + (moveEvent.clientX - startX),
          y: rect.top + (moveEvent.clientY - startY),
          width: rect.width,
          height: rect.height
        });
        shell.style.left = `${safe.x}px`;
        shell.style.top = `${safe.y}px`;
      };

      const end = endEvent => {
        button?.releasePointerCapture?.(endEvent.pointerId);
        button?.removeEventListener("pointermove", move);
        button?.removeEventListener("pointerup", end);
        button?.removeEventListener("pointercancel", end);
        document.body.classList.remove("admin-native-dragging");
        shell.classList.remove("admin-native-moving");
        persistGeometry(win);
      };

      button?.addEventListener("pointermove", move);
      button?.addEventListener("pointerup", end);
      button?.addEventListener("pointercancel", end);
    }

    function stateLabel(win) {
      if (win.maximized) return "MAX";
      if (win.minimized) return "MIN";
      if (win.floating) return "LIBRE";
      return "ANCRÉE";
    }

    function focusWindow(win) {
      if (!win) return;
      if (win.minimized) setMinimized(win, false);
      if (win.floating) bringToFront(win);
      else win.anchor.scrollIntoView({ behavior: "smooth", block: "center" });
      const target = win.shell || win.anchor;
      target.classList.remove("admin-native-focus-pulse");
      void target.offsetWidth;
      target.classList.add("admin-native-focus-pulse");
      target.addEventListener("animationend", () => target.classList.remove("admin-native-focus-pulse"), { once: true });
    }

    function updateDeck() {
      if (!deckList) return;
      deckList.innerHTML = "";
      const entries = [...windows.values()];
      if (deckCount) deckCount.textContent = String(entries.length);

      entries.forEach(win => {
        const row = document.createElement("div");
        row.className = "admin-window-deck-row";

        const name = document.createElement("span");
        name.className = "admin-window-deck-name";
        name.textContent = win.title;

        const state = document.createElement("span");
        state.className = "admin-window-deck-state";
        state.textContent = stateLabel(win);

        const focusButton = createButton("admin-window-deck-action", "◎", `Afficher ${win.title}`);
        const dock = createButton("admin-window-deck-action", "⌂", `Raccrocher ${win.title}`);
        const min = createButton("admin-window-deck-action", win.minimized ? "+" : "—", `Réduire ou restaurer ${win.title}`);
        focusButton.addEventListener("click", () => focusWindow(win));
        dock.addEventListener("click", () => setFloating(win, false));
        min.addEventListener("click", () => setMinimized(win, !win.minimized));

        row.append(name, state, focusButton, dock, min);
        deckList.appendChild(row);
      });
    }

    function installDeck() {
      if (deck) return deck;
      deck = document.createElement("aside");
      deck.className = "admin-window-deck";
      deck.hidden = true;
      deck.setAttribute("aria-label", "Gestionnaire de fenêtres natives Administrator");

      const head = document.createElement("div");
      head.className = "admin-window-deck-head";
      const title = document.createElement("strong");
      title.textContent = "WINDOW DECK";
      deckCount = document.createElement("span");
      deckCount.className = "admin-window-deck-count";
      const close = createButton("admin-window-deck-close", "×", "Fermer le gestionnaire");
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
      document.body.classList.toggle("admin-window-deck-open", !!open);
      updateDeck();
    }

    function toggleDeck() {
      installDeck();
      setDeckOpen(deck.hidden);
    }

    function setFree(free) {
      document.body.classList.toggle("admin-native-free", !!free);
      writeStorage(layoutKey, free ? "1" : "0");
      document.dispatchEvent(new CustomEvent("erith:admin-native-layout", { detail: { free: !!free } }));
      return !!free;
    }

    function isFree() {
      return document.body.classList.contains("admin-native-free");
    }

    function reset() {
      windows.forEach(win => {
        removeStorage(stateKey(win.id));
        if (win.maximized) setMaximized(win, false, false);
        if (win.floating) setFloating(win, false, false);
        win.minimized = false;
        win.maximized = false;
        win.floating = false;
        win.restoreGeometry = null;
        win.restoreFloating = false;
        win.nodes.forEach(node => node.classList.remove("admin-native-hidden-by-window"));
        win.anchor.classList.remove("admin-native-minimized", "admin-native-compact-minimized", "admin-native-details-minimized");
        updateControlState(win);
      });
      updateDeck();
      document.dispatchEvent(new CustomEvent("erith:admin-native-reset"));
    }

    function cascade() {
      const floating = [...windows.values()].filter(win => win.floating && win.shell && !win.maximized);
      if (!floating.length) return 0;

      const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      const width = Math.min(780, Math.max(MIN_WIDTH, vw * .58));
      const height = Math.min(580, Math.max(240, vh * .62));
      const step = 30;

      floating.forEach((win, index) => {
        const maxCols = Math.max(1, Math.floor((vw - width - VIEWPORT_MARGIN * 2) / step) + 1);
        const col = index % maxCols;
        const row = Math.floor(index / maxCols);
        const safe = clampGeometry({
          x: VIEWPORT_MARGIN + col * step,
          y: VIEWPORT_MARGIN + row * step,
          width,
          height
        });
        Object.assign(win.shell.style, {
          left: `${safe.x}px`,
          top: `${safe.y}px`,
          width: `${safe.width}px`,
          height: `${safe.height}px`
        });
        bringToFront(win, false);
        patchState(win.id, { floating: true, ...safe, z: Number(win.shell.style.zIndex) || zCounter });
      });
      updateDeck();
      return floating.length;
    }

    function init() {
      definitions.forEach(def => {
        const win = resolveDefinition(def);
        if (win) windows.set(win.id, win);
      });

      installDeck();
      const storedFree = readStorage(layoutKey, defaultFree ? "1" : "0") === "1";
      setFree(storedFree);

      windows.forEach(win => {
        const state = getState(win.id);
        if (state.floating === true) {
          setFloating(win, true, false, {
            x: Number(state.x),
            y: Number(state.y),
            width: Number(state.width),
            height: Number(state.height)
          });
          if (Number.isFinite(Number(state.z)) && win.shell) {
            zCounter = Math.max(zCounter, Number(state.z));
            win.shell.style.zIndex = String(Number(state.z));
          }
        }
        if (state.minimized === true) setMinimized(win, true, false);
        if (state.maximized === true) {
          setMaximized(win, true, false, {
            restoreFloating: state.restoreFloating === true,
            restoreGeometry: state.restoreGeometry || null
          });
        }
      });

      updateDeck();

      window.addEventListener("keydown", event => {
        if (event.key !== "Escape") return;
        const maximized = [...windows.values()].reverse().find(win => win.maximized);
        if (maximized) {
          setMaximized(maximized, false);
          return;
        }
        if (deck && !deck.hidden) setDeckOpen(false);
      });

      return { count: windows.size, free: isFree() };
    }

    return {
      init,
      reset,
      cascade,
      toggleDeck,
      setFree,
      isFree,
      get count() { return windows.size; },
      get onStateChange() { return stateCallback; },
      set onStateChange(callback) { stateCallback = typeof callback === "function" ? callback : null; }
    };
  }

  window.ErithAdminWindowManager = { create: createManager };
})();
