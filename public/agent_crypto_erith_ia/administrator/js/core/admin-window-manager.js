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
    const domainKey = `${storagePrefix}:domain`;
    const statePrefix = `${storagePrefix}:window:`;

    const windows = new Map();
    let zCounter = FLOAT_Z_BASE;
    let deck = null;
    let deckList = null;
    let deckCount = null;
    let activeDomain = clean(options.domain || document.documentElement.dataset.atlasMarketDomain || "crypto") || "crypto";

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

    function entryNode(entry) {
      return entry?.node instanceof HTMLElement ? entry.node : null;
    }

    function normalizeEntries(raw) {
      return (Array.isArray(raw) ? raw : [])
        .map(item => item instanceof HTMLElement ? { node: item, domain: "all" } : item)
        .map(item => ({
          node: entryNode(item),
          domain: clean(item?.domain || "all") || "all"
        }))
        .filter(item => item.node);
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

    function visibleEntry(win) {
      return win.entries.find(entry => entry.domain === "all" || entry.domain === activeDomain)
        || win.entries[0]
        || null;
    }

    function domainMask(win) {
      win.entries.forEach(entry => {
        const inactive = win.floating && entry.domain !== "all" && entry.domain !== activeDomain;
        entry.node.classList.toggle("admin-native-domain-inactive", inactive);
      });
    }

    function resolveHomeTarget(win) {
      const preferred = visibleEntry(win)?.node || win.anchor;
      if (preferred?.parentElement) return preferred;
      return win.entries.map(entry => entry.node).find(node => node?.parentElement) || null;
    }

    function createControlSet(win, host, mini = false) {
      if (!(host instanceof HTMLElement)) return null;
      const controls = document.createElement("div");
      controls.className = mini ? "admin-native-controls admin-native-mini-controls" : "admin-native-controls";
      controls.setAttribute("role", "group");
      controls.setAttribute("aria-label", `Fenêtre Administrator · ${win.title}`);

      const drag = createButton("admin-native-drag", "⠿", `Déplacer ${win.title}`);
      const minimize = createButton("admin-native-minimize", win.minimized ? "+" : "—", win.minimized ? `Restaurer ${win.title}` : `Réduire ${win.title}`);
      const float = createButton("admin-native-float", win.floating ? "▣" : "□", win.floating ? `Raccrocher ${win.title}` : `Détacher ${win.title}`);
      const maximize = createButton("admin-native-maximize", win.maximized ? "↙" : "⤢", win.maximized ? `Restaurer la taille de ${win.title}` : `Agrandir ${win.title}`);
      controls.append(drag, minimize, float, maximize);

      drag.addEventListener("pointerdown", event => dragStart(event, win));
      drag.addEventListener("dblclick", event => {
        event.preventDefault();
        event.stopPropagation();
        setMaximized(win, !win.maximized);
      });
      minimize.addEventListener("click", () => setMinimized(win, !win.minimized));
      float.addEventListener("click", () => setFloating(win, !win.floating));
      maximize.addEventListener("click", () => setMaximized(win, !win.maximized));

      host.appendChild(controls);
      const set = { root: controls, drag, minimize, float, maximize, mini };
      win.controlSets.push(set);
      return set;
    }

    function refreshControlState(win) {
      win.controlSets.forEach(set => {
        const { minimize, float, maximize } = set;
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
      });
      if (win.miniTitle) win.miniTitle.textContent = win.title;
    }

    function resolveDefinition(def) {
      const entries = normalizeEntries(typeof def.resolveEntries === "function" ? def.resolveEntries() : (typeof def.resolveNodes === "function" ? def.resolveNodes() : []));
      if (!entries.length) return null;
      const nodes = entries.map(entry => entry.node);
      const anchor = typeof def.resolveAnchor === "function" ? def.resolveAnchor(nodes, entries) : nodes[0];
      if (!(anchor instanceof HTMLElement) || !nodes.includes(anchor)) return null;

      const win = {
        id: clean(def.id),
        title: clean(def.title) || clean(def.id) || "Fenêtre",
        tone: clean(def.tone || "neutral") || "neutral",
        entries,
        nodes,
        anchor,
        directFixed: def.directFixed === true,
        controlSets: [],
        placeholders: new Map(),
        shell: null,
        miniBar: null,
        miniTitle: null,
        floating: false,
        minimized: false,
        maximized: false,
        geometry: null,
        restoreGeometry: null,
        restoreFloating: false,
        directPointerUp: null
      };

      win.nodes.forEach(node => node.dataset.adminNativeWindow = win.id);
      win.anchor.classList.add("admin-native-anchor", `admin-native-window-${win.id}`, `admin-native-tone-${win.tone}`);
      win.anchor.dataset.adminNativeTitle = win.title;

      let controlHosts = typeof def.resolveControlHosts === "function"
        ? def.resolveControlHosts(nodes, entries)
        : [anchor];
      controlHosts = [...new Set((Array.isArray(controlHosts) ? controlHosts : [controlHosts]).filter(node => node instanceof HTMLElement))];
      if (!controlHosts.length) controlHosts = [anchor];
      controlHosts.forEach(host => createControlSet(win, host, false));
      return win;
    }

    function currentRect(win) {
      const target = win.directFixed && win.floating && win.minimized && win.miniBar?.isConnected
        ? win.miniBar
        : (win.directFixed && win.floating ? win.anchor : (win.shell || win.anchor));
      const rect = target?.getBoundingClientRect?.();
      if (!rect) return clampGeometry(win.geometry || {});
      return clampGeometry({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: win.minimized && win.geometry?.height ? win.geometry.height : rect.height
      });
    }

    function setGeometryOnTarget(win, geometry) {
      const safe = clampGeometry(geometry);
      win.geometry = { ...safe };
      const target = win.directFixed ? win.anchor : win.shell;
      if (target) {
        target.style.left = `${safe.x}px`;
        target.style.top = `${safe.y}px`;
        target.style.width = `${safe.width}px`;
        if (!win.minimized) target.style.height = `${safe.height}px`;
      }
      if (win.miniBar?.isConnected && win.floating && win.directFixed) {
        win.miniBar.style.left = `${safe.x}px`;
        win.miniBar.style.top = `${safe.y}px`;
        win.miniBar.style.width = `${safe.width}px`;
      }
      return safe;
    }

    function persistGeometry(win) {
      if (!win?.floating || win.maximized) return;
      const rect = currentRect(win);
      const safe = {
        ...rect,
        height: win.geometry?.height || rect.height
      };
      win.geometry = { ...safe };
      patchState(win.id, {
        floating: true,
        x: safe.x,
        y: safe.y,
        width: safe.width,
        height: safe.height,
        z: Number((win.directFixed ? win.anchor : win.shell)?.style.zIndex) || zCounter
      });
    }

    function createPlaceholders(win) {
      win.placeholders.clear();
      win.nodes.forEach(node => {
        if (!node.parentNode) return;
        const marker = document.createElement("span");
        marker.className = "admin-native-placeholder";
        marker.dataset.adminNativePlaceholder = win.id;
        marker.hidden = true;
        node.parentNode.insertBefore(marker, node);
        win.placeholders.set(node, marker);
      });
    }

    function buildShell(win, geometry) {
      if (win.shell?.isConnected) return win.shell;
      createPlaceholders(win);
      const shell = document.createElement("section");
      shell.className = `admin-native-floating-shell admin-native-tone-${win.tone}`;
      shell.dataset.adminNativeShell = win.id;
      shell.setAttribute("aria-label", `Fenêtre flottante ${win.title}`);
      document.body.appendChild(shell);
      win.nodes.forEach(node => shell.appendChild(node));
      win.shell = shell;
      domainMask(win);
      setGeometryOnTarget(win, geometry || currentRect(win));
      shell.addEventListener("pointerdown", () => bringToFront(win, false), { passive: true });
      shell.addEventListener("pointerup", () => persistGeometry(win), { passive: true });
      return shell;
    }

    function restoreShellNodes(win) {
      if (!win.shell) return;
      win.nodes.forEach(node => {
        const marker = win.placeholders.get(node);
        if (marker?.parentNode) marker.parentNode.insertBefore(node, marker);
        marker?.remove();
        node.classList.remove("admin-native-domain-inactive");
      });
      win.placeholders.clear();
      win.shell.remove();
      win.shell = null;
    }

    function setDirectFloating(win, floating, geometry) {
      const node = win.anchor;
      if (!node) return;
      if (floating) {
        node.classList.add("admin-native-direct-floating");
        setGeometryOnTarget(win, geometry || currentRect(win));
        if (!win.directPointerUp) {
          win.directPointerUp = () => persistGeometry(win);
          node.addEventListener("pointerup", win.directPointerUp, { passive: true });
        }
      } else {
        node.classList.remove("admin-native-direct-floating", "admin-native-maximized");
        ["left", "top", "width", "height", "zIndex"].forEach(key => { node.style[key] = ""; });
      }
    }

    function bringToFront(win, persist = true) {
      if (!win?.floating) return;
      const target = win.directFixed ? (win.minimized && win.miniBar?.isConnected ? win.miniBar : win.anchor) : win.shell;
      if (!target) return;
      zCounter += 1;
      target.style.zIndex = String(zCounter);
      if (win.directFixed && win.miniBar?.isConnected) win.anchor.style.zIndex = String(zCounter);
      if (persist) patchState(win.id, { z: zCounter });
    }

    function removeMiniBar(win) {
      if (!win.miniBar) return;
      const root = win.miniBar;
      win.controlSets = win.controlSets.filter(set => !set.mini || set.root.parentElement !== root);
      root.remove();
      win.miniBar = null;
      win.miniTitle = null;
    }

    function positionDockedMiniBar(win) {
      if (!win.miniBar || win.floating) return;
      const target = resolveHomeTarget(win);
      if (!target?.parentNode) return;
      target.parentNode.insertBefore(win.miniBar, target);
    }

    function ensureMiniBar(win) {
      if (win.miniBar?.isConnected) return win.miniBar;
      const bar = document.createElement("section");
      bar.className = `admin-native-mini-bar admin-native-tone-${win.tone}`;
      bar.dataset.adminNativeMini = win.id;
      const label = document.createElement("strong");
      label.className = "admin-native-mini-title";
      label.textContent = win.title;
      bar.appendChild(label);
      win.miniBar = bar;
      win.miniTitle = label;
      createControlSet(win, bar, true);

      if (win.floating) {
        if (win.directFixed) {
          document.body.appendChild(bar);
          bar.classList.add("admin-native-mini-floating");
          const safe = clampGeometry(win.geometry || currentRect(win));
          Object.assign(bar.style, {
            left: `${safe.x}px`,
            top: `${safe.y}px`,
            width: `${safe.width}px`,
            zIndex: String(Number(win.anchor.style.zIndex) || ++zCounter)
          });
        } else if (win.shell) {
          win.shell.prepend(bar);
        }
      } else {
        const target = resolveHomeTarget(win);
        if (target?.parentNode) target.parentNode.insertBefore(bar, target);
        else document.body.appendChild(bar);
      }
      return bar;
    }

    function applyMinimized(win) {
      win.nodes.forEach(node => node.classList.toggle("admin-native-window-suppressed", win.minimized));
      if (win.minimized) {
        ensureMiniBar(win);
        if (win.shell) win.shell.classList.add("admin-native-shell-minimized");
      } else {
        if (win.shell) win.shell.classList.remove("admin-native-shell-minimized");
        if (win.floating && win.directFixed && win.geometry) setGeometryOnTarget(win, win.geometry);
        removeMiniBar(win);
      }
      refreshControlState(win);
    }

    function setMinimized(win, minimized, persist = true) {
      if (!win) return;
      if (minimized && win.maximized) setMaximized(win, false, false);
      win.minimized = !!minimized;
      if (win.floating && !win.geometry) win.geometry = currentRect(win);
      applyMinimized(win);
      if (persist) patchState(win.id, { minimized: win.minimized });
      updateDeck();
    }

    function setFloating(win, floating, persist = true, geometry = null) {
      if (!win) return;
      if (!!floating === win.floating && (floating ? (win.directFixed || win.shell) : true)) return;

      if (!floating) {
        if (win.maximized) {
          win.maximized = false;
          const target = win.directFixed ? win.anchor : win.shell;
          target?.classList.remove("admin-native-maximized");
        }
        if (win.minimized) removeMiniBar(win);
        if (win.directFixed) setDirectFloating(win, false);
        else restoreShellNodes(win);
        win.floating = false;
        domainMask(win);
        if (win.minimized) ensureMiniBar(win);
        refreshControlState(win);
        if (persist) patchState(win.id, { floating: false, maximized: false });
        updateDeck();
        return;
      }

      const baseGeometry = clampGeometry(geometry || win.geometry || currentRect(win));
      win.geometry = { ...baseGeometry };
      if (win.minimized) removeMiniBar(win);
      if (win.directFixed) setDirectFloating(win, true, baseGeometry);
      else buildShell(win, baseGeometry);
      win.floating = true;
      domainMask(win);
      if (win.minimized) ensureMiniBar(win);
      bringToFront(win, false);
      refreshControlState(win);
      if (persist) {
        patchState(win.id, {
          floating: true,
          x: baseGeometry.x,
          y: baseGeometry.y,
          width: baseGeometry.width,
          height: baseGeometry.height,
          z: Number((win.directFixed ? win.anchor : win.shell)?.style.zIndex) || zCounter
        });
      }
      updateDeck();
    }

    function setMaximized(win, maximized, persist = true) {
      if (!win) return;
      if (!maximized) {
        if (!win.maximized) return;
        win.maximized = false;
        const target = win.directFixed ? win.anchor : win.shell;
        target?.classList.remove("admin-native-maximized");
        const restoreFloating = win.restoreFloating;
        const restoreGeometry = win.restoreGeometry;
        if (restoreFloating) {
          if (!win.floating) setFloating(win, true, false, restoreGeometry);
          setGeometryOnTarget(win, restoreGeometry || win.geometry || currentRect(win));
        } else {
          setFloating(win, false, false);
        }
        win.restoreFloating = false;
        win.restoreGeometry = null;
        refreshControlState(win);
        if (persist) patchState(win.id, { maximized: false, restoreFloating: null, restoreGeometry: null });
        updateDeck();
        return;
      }

      win.restoreFloating = win.floating;
      win.restoreGeometry = win.floating ? { ...(win.geometry || currentRect(win)) } : null;
      if (win.minimized) setMinimized(win, false, false);
      if (!win.floating) setFloating(win, true, false, currentRect(win));
      win.maximized = true;
      const target = win.directFixed ? win.anchor : win.shell;
      target?.classList.add("admin-native-maximized");
      if (target) {
        Object.assign(target.style, {
          left: `${VIEWPORT_MARGIN}px`,
          top: `${VIEWPORT_MARGIN}px`,
          width: `calc(100vw - ${VIEWPORT_MARGIN * 2}px)`,
          height: `calc(100vh - ${VIEWPORT_MARGIN * 2}px)`
        });
      }
      bringToFront(win, false);
      refreshControlState(win);
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

      if (!win.floating) setFloating(win, true, true, currentRect(win));
      bringToFront(win);

      const target = win.directFixed && win.minimized && win.miniBar?.isConnected
        ? win.miniBar
        : (win.directFixed ? win.anchor : win.shell);
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const startX = event.clientX;
      const startY = event.clientY;
      const button = event.currentTarget;
      document.body.classList.add("admin-native-dragging");
      target.classList.add("admin-native-moving");
      button?.setPointerCapture?.(event.pointerId);

      const move = moveEvent => {
        const safe = clampGeometry({
          x: rect.left + (moveEvent.clientX - startX),
          y: rect.top + (moveEvent.clientY - startY),
          width: rect.width,
          height: win.geometry?.height || rect.height
        });
        target.style.left = `${safe.x}px`;
        target.style.top = `${safe.y}px`;
        if (win.directFixed && win.minimized) {
          win.geometry = { ...(win.geometry || safe), x: safe.x, y: safe.y, width: safe.width };
        }
      };

      const end = endEvent => {
        button?.releasePointerCapture?.(endEvent.pointerId);
        button?.removeEventListener("pointermove", move);
        button?.removeEventListener("pointerup", end);
        button?.removeEventListener("pointercancel", end);
        document.body.classList.remove("admin-native-dragging");
        target.classList.remove("admin-native-moving");
        if (win.directFixed && win.minimized) {
          const r = target.getBoundingClientRect();
          win.geometry = { ...(win.geometry || clampGeometry({})), x: r.left, y: r.top, width: r.width };
        } else {
          win.geometry = currentRect(win);
        }
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
      else {
        const target = visibleEntry(win)?.node || win.anchor;
        target?.scrollIntoView({ behavior: "smooth", block: "center" });
        target?.classList.remove("admin-native-focus-pulse");
        if (target) {
          void target.offsetWidth;
          target.classList.add("admin-native-focus-pulse");
          target.addEventListener("animationend", () => target.classList.remove("admin-native-focus-pulse"), { once: true });
        }
      }
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
        const focus = createButton("admin-window-deck-action", "◎", "Afficher / mettre au premier plan");
        const dock = createButton("admin-window-deck-action", "⌂", "Raccrocher");
        const min = createButton("admin-window-deck-action", win.minimized ? "+" : "—", "Réduire / restaurer");
        focus.addEventListener("click", () => focusWindow(win));
        dock.addEventListener("click", () => setFloating(win, false));
        min.addEventListener("click", () => setMinimized(win, !win.minimized));
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
      const close = createButton("admin-window-deck-close", "×", "Fermer le gestionnaire de fenêtres");
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
      const enabled = !!free;
      document.body.classList.toggle("admin-native-free", enabled);
      writeStorage(layoutKey, enabled ? "1" : "0");
      document.dispatchEvent(new CustomEvent("erith:admin-window-layout", { detail: { free: enabled } }));
      return enabled;
    }

    function isFree() {
      return document.body.classList.contains("admin-native-free");
    }

    function setDomain(domain) {
      activeDomain = clean(domain || "crypto") || "crypto";
      writeStorage(domainKey, activeDomain);
      windows.forEach(win => {
        domainMask(win);
        if (win.minimized && !win.floating) positionDockedMiniBar(win);
      });
      updateDeck();
      return activeDomain;
    }

    function renameWindow(id, title) {
      const win = windows.get(id);
      if (!win) return false;
      win.title = clean(title) || win.title;
      win.anchor.dataset.adminNativeTitle = win.title;
      refreshControlState(win);
      updateDeck();
      return true;
    }

    function reset() {
      windows.forEach(win => {
        removeStorage(stateKey(win.id));
        if (win.maximized) {
          win.maximized = false;
          const target = win.directFixed ? win.anchor : win.shell;
          target?.classList.remove("admin-native-maximized");
        }
        if (win.minimized) {
          win.minimized = false;
          win.nodes.forEach(node => node.classList.remove("admin-native-window-suppressed"));
          removeMiniBar(win);
        }
        if (win.floating) {
          if (win.directFixed) setDirectFloating(win, false);
          else restoreShellNodes(win);
          win.floating = false;
        }
        win.entries.forEach(entry => entry.node.classList.remove("admin-native-domain-inactive"));
        win.geometry = null;
        win.restoreGeometry = null;
        win.restoreFloating = false;
        refreshControlState(win);
      });
      updateDeck();
      document.dispatchEvent(new CustomEvent("erith:admin-window-reset"));
    }

    function cascade() {
      const floating = [...windows.values()].filter(win => win.floating && !win.maximized);
      if (!floating.length) return 0;
      const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      const width = Math.min(760, Math.max(MIN_WIDTH, vw * .56));
      const height = Math.min(560, Math.max(220, vh * .60));
      floating.forEach((win, index) => {
        const step = 30;
        const x = VIEWPORT_MARGIN + (index % 7) * step;
        const y = VIEWPORT_MARGIN + (index % 7) * step;
        const safe = clampGeometry({ x, y, width, height: win.geometry?.height || height });
        win.geometry = safe;
        if (win.directFixed && win.minimized && win.miniBar?.isConnected) {
          win.miniBar.style.left = `${safe.x}px`;
          win.miniBar.style.top = `${safe.y}px`;
          win.miniBar.style.width = `${safe.width}px`;
        } else {
          setGeometryOnTarget(win, safe);
        }
        bringToFront(win, false);
        persistGeometry(win);
      });
      return floating.length;
    }

    function init() {
      const storedFree = readStorage(layoutKey, defaultFree ? "1" : "0") !== "0";
      setFree(storedFree);
      definitions.forEach(def => {
        const win = resolveDefinition(def);
        if (!win?.id || windows.has(win.id)) return;
        windows.set(win.id, win);
      });

      const storedDomain = readStorage(domainKey, activeDomain);
      setDomain(storedDomain || activeDomain);

      windows.forEach(win => {
        const state = getState(win.id);
        if (state.floating === true) {
          setFloating(win, true, false, {
            x: Number(state.x),
            y: Number(state.y),
            width: Number(state.width),
            height: Number(state.height)
          });
          if (Number.isFinite(Number(state.z))) {
            zCounter = Math.max(zCounter, Number(state.z));
            const target = win.directFixed ? win.anchor : win.shell;
            if (target) target.style.zIndex = String(Number(state.z));
          }
        }
        if (state.minimized === true) setMinimized(win, true, false);
        if (state.maximized === true) setMaximized(win, true, false);
      });
      updateDeck();
      return { count: windows.size, free: isFree(), domain: activeDomain };
    }

    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      const maximized = [...windows.values()].reverse().find(win => win.maximized);
      if (maximized) {
        event.preventDefault();
        setMaximized(maximized, false);
        return;
      }
      if (deck && !deck.hidden) setDeckOpen(false);
    });

    return {
      init,
      get count() { return windows.size; },
      isFree,
      setFree,
      setDomain,
      renameWindow,
      reset,
      cascade,
      toggleDeck,
      setDeckOpen,
      getWindow: id => windows.get(id) || null,
      minimize: (id, value = true) => setMinimized(windows.get(id), value),
      float: (id, value = true) => setFloating(windows.get(id), value),
      maximize: (id, value = true) => setMaximized(windows.get(id), value),
      focus: id => focusWindow(windows.get(id))
    };
  }

  window.ErithAdminWindowManager = Object.freeze({ create: createManager });
})();
