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
    const storagePrefix = options.storagePrefix || "erith_admin_semantic_windows";
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
      button.className = `admin-semantic-control ${className}`;
      button.textContent = text;
      button.title = title;
      button.setAttribute("aria-label", title);
      button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
      });
      return button;
    }

    function createExternalChrome(win) {
      const bar = document.createElement("div");
      bar.className = `admin-semantic-external-chrome admin-semantic-tone-${win.tone || "neutral"}`;
      bar.dataset.adminSemanticChrome = win.id;
      const label = document.createElement("div");
      label.className = "admin-semantic-window-label";
      label.innerHTML = `<span>WINDOW</span><b>${win.title}</b>`;
      bar.append(label);
      win.parent.insertBefore(bar, win.nodes[0]);
      win.generatedChrome = bar;
      win.anchor = bar;
      win.nodes.unshift(bar);
    }

    function createControls(win) {
      const controls = document.createElement("div");
      controls.className = "admin-semantic-controls";
      controls.setAttribute("role", "group");
      controls.setAttribute("aria-label", `Fenêtre Administrator · ${win.title}`);

      const drag = createButton("admin-semantic-drag", "⠿", `Déplacer ${win.title}`);
      const minimize = createButton("admin-semantic-minimize", "—", `Réduire ${win.title}`);
      const float = createButton("admin-semantic-float", "□", `Détacher ${win.title}`);
      const maximize = createButton("admin-semantic-maximize", "⤢", `Agrandir ${win.title}`);
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
      const anchor = (typeof def.resolveAnchor === "function" ? def.resolveAnchor(nodes) : nodes[0]);
      if (!(anchor instanceof HTMLElement)) return null;

      const win = {
        id: def.id,
        title: def.title,
        tone: def.tone || "neutral",
        nodes: [...nodes],
        parent,
        anchor,
        externalChrome: def.chrome === "external",
        generatedChrome: null,
        placeholder: null,
        shell: null,
        controls: null,
        floating: false,
        minimized: false,
        maximized: false,
        restoreGeometry: null,
        restoreFloating: false
      };

      if (win.externalChrome) createExternalChrome(win);
      win.nodes.forEach(node => {
        node.dataset.adminSemanticWindow = win.id;
        node.classList.add("admin-semantic-member");
      });
      win.anchor.classList.add("admin-semantic-anchor");
      win.anchor.dataset.adminSemanticTitle = win.title;
      createControls(win);
      return win;
    }

    function ensurePlaceholder(win) {
      if (win.placeholder?.isConnected) return win.placeholder;
      const placeholder = document.createElement("div");
      placeholder.className = "admin-semantic-placeholder";
      placeholder.dataset.adminSemanticPlaceholder = win.id;
      placeholder.hidden = true;
      win.parent.insertBefore(placeholder, win.nodes[0]);
      win.placeholder = placeholder;
      return placeholder;
    }

    function persistGeometry(win) {
      if (!win?.floating || !win.shell || win.maximized || win.minimized) return;
      const safe = clampGeometry(geometryForWindow(win));
      patchState(win.id, { floating:true, ...safe, z:Number(win.shell.style.zIndex)||zCounter });
    }

    function buildShell(win, geometry) {
      if (win.shell?.isConnected) return win.shell;
      const placeholder = ensurePlaceholder(win);
      const shell = document.createElement("section");
      shell.className = `admin-semantic-floating-shell admin-semantic-tone-${win.tone}`;
      shell.dataset.adminSemanticShell = win.id;
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

    function setMinimized(win, minimized, persist = true) {
      if (!win) return;
      if (minimized && win.maximized) setMaximized(win, false, false);
      win.minimized = !!minimized;
      win.nodes.forEach(node => {
        if (node === win.anchor) return;
        node.classList.toggle("admin-semantic-hidden-by-window", win.minimized);
      });
      win.anchor.classList.toggle("admin-semantic-anchor-minimized", win.minimized);
      if (win.shell) win.shell.classList.toggle("admin-semantic-shell-minimized", win.minimized);
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
        updateControlState(win);
        if (persist) patchState(win.id, { floating: false, maximized: false });
        updateDeck();
        return;
      }

      if (win.floating && win.shell) return;
      const rect = geometry || geometryForWindow(win);
      buildShell(win, rect);
      win.floating = true;
      if (win.minimized) win.shell.classList.add("admin-semantic-shell-minimized");
      bringToFront(win, false);
      updateControlState(win);
      if (persist) {
        const safe = clampGeometry(geometryForWindow(win));
        patchState(win.id, { floating: true, ...safe, z: Number(win.shell.style.zIndex) || zCounter });
      }
      updateDeck();
    }

    function setMaximized(win, maximized, persist = true, restoreOverride = null) {
      if (!win) return;
      if (!maximized) {
        if (!win.maximized) return;
        win.maximized = false;
        win.shell?.classList.remove("admin-semantic-maximized");
        if (win.restoreFloating) {
          if (!win.floating) setFloating(win, true, false, win.restoreGeometry);
          if (win.shell && win.restoreGeometry) {
            const safe = clampGeometry(win.restoreGeometry);
            Object.assign(win.shell.style, { left:`${safe.x}px`, top:`${safe.y}px`, width:`${safe.width}px`, height:`${safe.height}px` });
          }
        } else {
          setFloating(win, false, false);
        }
        updateControlState(win);
        if (persist) patchState(win.id, { maximized:false, restoreFloating:null, restoreGeometry:null });
        updateDeck();
        return;
      }

      win.restoreFloating = restoreOverride ? !!restoreOverride.restoreFloating : win.floating;
      win.restoreGeometry = restoreOverride ? (restoreOverride.restoreGeometry || null) : (win.floating ? geometryForWindow(win) : null);
      if (!win.floating) setFloating(win, true, false, geometryForWindow(win));
      setMinimized(win, false, false);
      win.maximized = true;
      win.shell.classList.add("admin-semantic-maximized");
      Object.assign(win.shell.style, {
        left:`${VIEWPORT_MARGIN}px`,
        top:`${VIEWPORT_MARGIN}px`,
        width:`calc(100vw - ${VIEWPORT_MARGIN * 2}px)`,
        height:`calc(100vh - ${VIEWPORT_MARGIN * 2}px)`
      });
      bringToFront(win, false);
      updateControlState(win);
      if (persist) patchState(win.id, {
        maximized:true,
        minimized:false,
        floating:true,
        restoreFloating:win.restoreFloating,
        restoreGeometry:win.restoreGeometry
      });
      updateDeck();
    }

    function dragStart(event, win) {
      if (!document.body.classList.contains("admin-semantic-free")) return;
      if (win.maximized) return;
      if (event.button !== 0 && event.pointerType === "mouse") return;
      event.preventDefault();
      event.stopPropagation();

      if (!win.floating) setFloating(win, true);
      bringToFront(win);
      const shell = win.shell;
      const rect = shell.getBoundingClientRect();
      const startX = event.clientX;
      const startY = event.clientY;
      const drag = win.controls.drag;
      drag.setPointerCapture?.(event.pointerId);
      document.body.classList.add("admin-semantic-dragging");
      shell.classList.add("admin-semantic-moving");

      const move = ev => {
        const safe = clampGeometry({
          x: rect.left + (ev.clientX - startX),
          y: rect.top + (ev.clientY - startY),
          width: rect.width,
          height: rect.height
        });
        shell.style.left = `${safe.x}px`;
        shell.style.top = `${safe.y}px`;
      };
      const end = ev => {
        drag.releasePointerCapture?.(ev.pointerId);
        drag.removeEventListener("pointermove", move);
        drag.removeEventListener("pointerup", end);
        drag.removeEventListener("pointercancel", end);
        document.body.classList.remove("admin-semantic-dragging");
        shell.classList.remove("admin-semantic-moving");
        const safe = clampGeometry(geometryForWindow(win));
        Object.assign(shell.style, { left:`${safe.x}px`, top:`${safe.y}px`, width:`${safe.width}px`, height:`${safe.height}px` });
        patchState(win.id, { floating:true, ...safe, z:Number(shell.style.zIndex)||zCounter });
      };
      drag.addEventListener("pointermove", move);
      drag.addEventListener("pointerup", end);
      drag.addEventListener("pointercancel", end);
    }

    function restoreSavedState(win) {
      const state = getState(win.id);
      if (state.floating === true) {
        setFloating(win, true, false, {
          x:Number(state.x), y:Number(state.y), width:Number(state.width), height:Number(state.height)
        });
        if (Number.isFinite(Number(state.z))) {
          zCounter = Math.max(zCounter, Number(state.z));
          win.shell.style.zIndex = String(Number(state.z));
        }
      }
      if (state.minimized === true) setMinimized(win, true, false);
      if (state.maximized === true) setMaximized(win, true, false, { restoreFloating:state.restoreFloating === true, restoreGeometry:state.restoreGeometry || null });
    }

    function focus(win) {
      if (!win) return;
      if (win.minimized) setMinimized(win, false);
      if (win.floating) bringToFront(win);
      else win.anchor.scrollIntoView({ behavior:"smooth", block:"center" });
      const target = win.shell || win.anchor;
      target.classList.remove("admin-semantic-focus-pulse");
      void target.offsetWidth;
      target.classList.add("admin-semantic-focus-pulse");
      target.addEventListener("animationend", () => target.classList.remove("admin-semantic-focus-pulse"), { once:true });
    }

    function stateLabel(win) {
      if (win.maximized) return "MAX";
      if (win.minimized) return "MIN";
      if (win.floating) return "LIBRE";
      return "ANCRÉE";
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
        focusButton.addEventListener("click", () => focus(win));
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
      deck.setAttribute("aria-label", "Gestionnaire des fenêtres sémantiques Administrator");
      const head = document.createElement("div");
      head.className = "admin-window-deck-head";
      const title = document.createElement("strong");
      title.textContent = "SEMANTIC WINDOWS";
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

    function setFree(free) {
      document.body.classList.toggle("admin-semantic-free", !!free);
      writeStorage(layoutKey, free ? "1" : "0");
      document.dispatchEvent(new CustomEvent("erith:admin-semantic-layout", { detail:{ free:!!free } }));
      return !!free;
    }

    function isFree() {
      return document.body.classList.contains("admin-semantic-free");
    }

    function reset() {
      windows.forEach(win => {
        removeStorage(stateKey(win.id));
        if (win.maximized) setMaximized(win, false, false);
        if (win.floating) setFloating(win, false, false);
        setMinimized(win, false, false);
        win.restoreGeometry = null;
        win.restoreFloating = false;
      });
      updateDeck();
      document.dispatchEvent(new CustomEvent("erith:admin-semantic-reset"));
    }

    function cascade() {
      const floating = [...windows.values()].filter(win => win.floating && !win.maximized);
      if (!floating.length) return 0;
      const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      const width = Math.min(1080, Math.max(MIN_WIDTH, vw * .68));
      const height = Math.min(720, Math.max(260, vh * .70));
      floating.forEach((win, index) => {
        const step = 30;
        const x = VIEWPORT_MARGIN + (index % 8) * step;
        const y = VIEWPORT_MARGIN + (index % 8) * step;
        const safe = clampGeometry({x,y,width,height});
        Object.assign(win.shell.style, {left:`${safe.x}px`,top:`${safe.y}px`,width:`${safe.width}px`,height:`${safe.height}px`});
        bringToFront(win, false);
        patchState(win.id, {floating:true,...safe,z:Number(win.shell.style.zIndex)||zCounter});
      });
      return floating.length;
    }

    function init() {
      definitions.forEach(def => {
        const win = resolveDefinition(def);
        if (win) windows.set(win.id, win);
      });
      const stored = readStorage(layoutKey, null);
      setFree(stored === null ? defaultFree : stored === "1");
      windows.forEach(restoreSavedState);
      installDeck();
      window.addEventListener("keydown", event => {
        if (event.key !== "Escape") return;
        const maximized = [...windows.values()].reverse().find(win => win.maximized);
        if (maximized) setMaximized(maximized, false);
        else if (deck && !deck.hidden) setDeckOpen(false);
      });
      return { count:windows.size, free:isFree() };
    }

    return {
      init,
      get count(){ return windows.size; },
      get windows(){ return windows; },
      isFree,
      setFree,
      reset,
      cascade,
      focus: id => focus(windows.get(id)),
      toggleDeck: () => { installDeck(); setDeckOpen(deck.hidden); },
      set onStateChange(callback){ stateCallback = typeof callback === "function" ? callback : null; }
    };
  }

  window.ErithAdminWindowManager = { create:createManager };
})();
