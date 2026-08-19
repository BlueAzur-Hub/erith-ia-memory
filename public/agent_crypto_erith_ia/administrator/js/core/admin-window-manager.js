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
    const displayBackups = new WeakMap();

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

    // 40.1.24 — compact direct-floating geometry policy.
    // Large Administrator panels keep the historical clamp unchanged.
    // Native ribbons may opt into their real height/width and full viewport containment.
    function clampWindowGeometry(win, geometry = {}) {
      const policy = win?.geometryPolicy || null;
      if (!policy) return clampGeometry(geometry);

      const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      const viewportMaxWidth = Math.max(1, vw - VIEWPORT_MARGIN * 2);
      const viewportMaxHeight = Math.max(1, vh - VIEWPORT_MARGIN * 2);
      const configuredMinWidth = Number(policy.minWidth);
      const configuredMinHeight = Number(policy.minHeight);
      const configuredMaxWidth = Number(policy.maxWidth);
      const configuredMaxHeight = Number(policy.maxHeight);
      const minWidth = Number.isFinite(configuredMinWidth) && configuredMinWidth > 0 ? configuredMinWidth : MIN_WIDTH;
      const minHeight = Number.isFinite(configuredMinHeight) && configuredMinHeight > 0 ? configuredMinHeight : MIN_HEIGHT;
      const maxWidth = Math.max(1, Math.min(
        Number.isFinite(configuredMaxWidth) && configuredMaxWidth > 0 ? configuredMaxWidth : viewportMaxWidth,
        viewportMaxWidth
      ));
      const maxHeight = Math.max(1, Math.min(
        Number.isFinite(configuredMaxHeight) && configuredMaxHeight > 0 ? configuredMaxHeight : viewportMaxHeight,
        viewportMaxHeight
      ));
      const width = clamp(geometry.width || Math.min(1180, vw * .82), Math.min(minWidth, maxWidth), maxWidth);
      const height = clamp(geometry.height || Math.min(760, vh * .80), Math.min(minHeight, maxHeight), maxHeight);
      const fullyVisible = policy.keepFullyVisible === true;
      const maxX = fullyVisible
        ? Math.max(VIEWPORT_MARGIN, vw - width - VIEWPORT_MARGIN)
        : Math.max(VIEWPORT_MARGIN, vw - Math.min(190, width));
      const maxY = fullyVisible
        ? Math.max(VIEWPORT_MARGIN, vh - height - VIEWPORT_MARGIN)
        : Math.max(VIEWPORT_MARGIN, vh - 50);
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

    function setNodeSuppressed(node, suppressed) {
      if (!(node instanceof HTMLElement)) return;
      if (suppressed) {
        if (!displayBackups.has(node)) {
          displayBackups.set(node, {
            value: node.style.getPropertyValue("display"),
            priority: node.style.getPropertyPriority("display")
          });
        }
        node.classList.add("admin-native-window-suppressed");
        node.style.setProperty("display", "none", "important");
        return;
      }
      node.classList.remove("admin-native-window-suppressed");
      const backup = displayBackups.get(node);
      if (backup) {
        if (backup.value) node.style.setProperty("display", backup.value, backup.priority || "");
        else node.style.removeProperty("display");
        displayBackups.delete(node);
      } else if (node.style.getPropertyValue("display") === "none" && node.style.getPropertyPriority("display") === "important") {
        node.style.removeProperty("display");
      }
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

    function armControlDrag(event, win, set) {
      if (!document.body.classList.contains("admin-native-free")) return;
      if (win.maximized) return;
      if (event.button !== 0 && event.pointerType === "mouse") return;

      const button = event.currentTarget;
      const pointerId = event.pointerId;
      const startX = event.clientX;
      const startY = event.clientY;
      const initial = currentRect(win);
      let originX = startX;
      let originY = startY;
      let dragBase = initial;
      let moved = false;
      let target = null;
      let finished = false;

      // 40.1.33 — drag continuity must survive DOM reparenting.
      // Shell windows move their REAL nodes into document.body at first detach.
      // Firefox can drop element-level pointer capture when the pressed button is
      // reparented, so the drag lifecycle is owned by window capture listeners.
      // Pointer capture remains a best-effort enhancement, never the sole owner.
      const capturePointer = () => {
        if (!(button instanceof HTMLElement) || !button.isConnected) return;
        try { button.setPointerCapture?.(pointerId); } catch {}
      };

      const releasePointer = () => {
        if (!(button instanceof HTMLElement)) return;
        try {
          if (button.hasPointerCapture?.(pointerId)) button.releasePointerCapture?.(pointerId);
        } catch {}
      };

      const cleanup = () => {
        window.removeEventListener("pointermove", move, true);
        window.removeEventListener("pointerup", end, true);
        window.removeEventListener("pointercancel", end, true);
        window.removeEventListener("blur", abort, true);
        releasePointer();
      };

      const finish = () => {
        if (finished) return;
        finished = true;
        cleanup();
        if (target) {
          document.body.classList.remove("admin-native-dragging");
          target.classList.remove("admin-native-moving");
        }
        if (moved) {
          set.suppressNextClick = true;
          win.geometry = currentRect(win);
          persistGeometry(win);
        }
      };

      const abort = () => finish();

      const move = moveEvent => {
        if (moveEvent.pointerId !== pointerId || finished) return;
        let dx = moveEvent.clientX - originX;
        let dy = moveEvent.clientY - originY;
        if (!moved && Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) < 6) return;

        if (!moved) {
          moved = true;
          if (!win.floating) {
            let detachGeometry = initial;
            if (typeof win.dragFloatGeometry === "function") {
              try {
                const rawRect = win.anchor?.getBoundingClientRect?.() || null;
                detachGeometry = win.dragFloatGeometry({
                  geometry: initial,
                  rawRect,
                  startX,
                  startY,
                  viewportWidth: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
                  viewportHeight: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
                }) || initial;
              } catch {}
            }

            setFloating(win, true, true, detachGeometry);

            // The pressed control may have moved to a different DOM parent.
            // Rebase the gesture from the fitted floating geometry and reacquire
            // capture when Firefox still allows it. No mouse-up/re-click required.
            dragBase = currentRect(win);
            originX = moveEvent.clientX;
            originY = moveEvent.clientY;
            dx = 0;
            dy = 0;
            capturePointer();
          } else {
            dragBase = currentRect(win);
          }

          bringToFront(win);
          target = win.directFixed ? win.anchor : win.shell;
          if (!target) {
            finish();
            return;
          }
          document.body.classList.add("admin-native-dragging");
          target.classList.add("admin-native-moving");
        }

        if (!target) return;
        const safe = clampWindowGeometry(win, {
          x: dragBase.x + dx,
          y: dragBase.y + dy,
          width: dragBase.width,
          height: win.geometry?.height || dragBase.height
        });
        setManagedFloatingStyle(win, target, "left", `${safe.x}px`);
        setManagedFloatingStyle(win, target, "top", `${safe.y}px`);
        moveEvent.preventDefault?.();
      };

      const end = endEvent => {
        if (endEvent.pointerId !== pointerId || finished) return;
        finish();
      };

      capturePointer();
      window.addEventListener("pointermove", move, true);
      window.addEventListener("pointerup", end, true);
      window.addEventListener("pointercancel", end, true);
      window.addEventListener("blur", abort, true);
      event.preventDefault?.();
    }

    function createControlSet(win, host, mini = false, floatingChrome = false) {
      if (!(host instanceof HTMLElement)) return null;
      const controls = document.createElement("div");
      controls.className = mini ? "admin-native-controls admin-native-mini-controls" : "admin-native-controls";
      controls.classList.add(floatingChrome ? "admin-native-controls-floating" : "admin-native-controls-native");
      host.classList.add("admin-native-control-host");
      controls.setAttribute("role", "group");
      controls.setAttribute("aria-label", `Commandes fenêtre Administrator · ${win.title}`);

      const move = createButton("admin-native-move", "⠿", `Déplacer ${win.title}`);
      const minimize = createButton("admin-native-minimize", "—", `Réduire ${win.title}`);
      const float = createButton("admin-native-float", "□", `Détacher ${win.title}`);
      const maximize = createButton("admin-native-maximize", "⤢", `Agrandir ${win.title}`);
      const hide = createButton("admin-native-hide", "×", `Masquer ${win.title} · rappel via WINDOWS`);
      controls.append(move, minimize, float, maximize, hide);

      const set = { root: controls, move, minimize, float, maximize, hide, mini, floatingChrome, suppressNextClick: false };
      move.addEventListener("pointerdown", event => armControlDrag(event, win, set));
      move.addEventListener("click", () => {
        if (set.suppressNextClick) {
          set.suppressNextClick = false;
          return;
        }
        if (win.floating) bringToFront(win, false);
      });
      minimize.addEventListener("click", () => setMinimized(win, !win.minimized));
      float.addEventListener("click", () => setFloating(win, !win.floating));
      maximize.addEventListener("click", () => setMaximized(win, !win.maximized));
      hide.addEventListener("click", () => setHidden(win, true));

      host.appendChild(controls);
      win.controlSets.push(set);
      return set;
    }

    function refreshControlState(win) {
      win.controlSets.forEach(set => {
        const { minimize, float, maximize, move } = set;
        if (move) {
          move.title = win.floating ? `Déplacer ${win.title}` : `Détacher et déplacer ${win.title}`;
          move.setAttribute("aria-label", move.title);
        }
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
      if (win.shellTitle) win.shellTitle.textContent = win.title;
      if (win.minimizeBarTitle) win.minimizeBarTitle.textContent = win.title;
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
        preferredFloatGeometry: typeof def.preferredFloatGeometry === "function" ? def.preferredFloatGeometry : null,
        dragFloatGeometry: typeof def.dragFloatGeometry === "function" ? def.dragFloatGeometry : null,
        geometryPolicy: def.geometryPolicy && typeof def.geometryPolicy === "object" ? { ...def.geometryPolicy } : null,
        resolvePortalHost: typeof def.resolvePortalHost === "function" ? def.resolvePortalHost : null,
        controlSets: [],
        placeholders: new Map(),
        shell: null,
        shellTitle: null,
        shellSizingMode: null,
        floating: false,
        minimized: false,
        hidden: false,
        maximized: false,
        geometry: null,
        restoreGeometry: null,
        restoreFloating: false,
        directPointerUp: null,
        minimizeBar: null,
        minimizeBarTitle: null
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

    function visibleNodeUnionRect(win) {
      const rects = (win?.nodes || [])
        .map(node => {
          if (!(node instanceof HTMLElement)) return null;
          const computed = window.getComputedStyle?.(node);
          if (String(computed?.display || "").toLowerCase() === "none") return null;
          if (String(computed?.visibility || "").toLowerCase() === "hidden") return null;
          const rect = node.getBoundingClientRect?.();
          if (!rect || rect.width <= 0 || rect.height <= 0) return null;
          return rect;
        })
        .filter(Boolean);
      if (!rects.length) return null;

      const left = Math.min(...rects.map(rect => rect.left));
      const top = Math.min(...rects.map(rect => rect.top));
      const right = Math.max(...rects.map(rect => rect.right));
      const bottom = Math.max(...rects.map(rect => rect.bottom));
      return {
        left,
        top,
        right,
        bottom,
        width: Math.max(1, right - left),
        height: Math.max(1, bottom - top)
      };
    }

    function currentRect(win) {
      let rect = null;

      if (win?.floating) {
        const target = win.directFixed ? win.anchor : win.shell;
        rect = target?.getBoundingClientRect?.() || null;
      } else if (!win?.directFixed && (win?.nodes?.length || 0) > 1) {
        // 40.1.30 — multi-node Administrator families must be measured as the
        // union of every visible member, not only from the small family anchor.
        rect = visibleNodeUnionRect(win) || win.anchor?.getBoundingClientRect?.() || null;
      } else {
        rect = win?.anchor?.getBoundingClientRect?.() || null;
      }

      if (!rect) return win?.floating ? clampWindowGeometry(win, win.geometry || {}) : clampGeometry(win.geometry || {});
      const geometry = {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: win.minimized && win.geometry?.height ? win.geometry.height : rect.height
      };
      return win?.floating ? clampWindowGeometry(win, geometry) : clampGeometry(geometry);
    }

    // 40.1.32 — directFixed geometry must outrank legacy dock CSS.
    // Graphique and Math Core still have old high-specificity !important
    // position/top rules in the canonical Classic-derived stylesheet.
    // A floating directFixed window therefore owns its geometry inline with
    // !important while detached, then releases every override when docked.
    function setManagedFloatingStyle(win, target, property, value) {
      if (!(target instanceof HTMLElement)) return;
      const direct = win?.directFixed === true;
      target.style.setProperty(property, String(value), direct ? "important" : "");
    }

    function applyDirectFixedGeometryOwnership(win, target) {
      if (!win?.directFixed || !(target instanceof HTMLElement)) return;
      setManagedFloatingStyle(win, target, "position", "fixed");
      setManagedFloatingStyle(win, target, "right", "auto");
      setManagedFloatingStyle(win, target, "bottom", "auto");
      setManagedFloatingStyle(win, target, "transform", "none");
      setManagedFloatingStyle(win, target, "min-width", "0");
      setManagedFloatingStyle(win, target, "max-width", `calc(100vw - ${VIEWPORT_MARGIN * 2}px)`);
      setManagedFloatingStyle(win, target, "min-height", "0");
      setManagedFloatingStyle(win, target, "max-height", `calc(100vh - ${VIEWPORT_MARGIN * 2}px)`);
    }

    function setGeometryOnTarget(win, geometry) {
      const safe = clampWindowGeometry(win, geometry);
      win.geometry = { ...safe };
      const target = win.directFixed ? win.anchor : win.shell;
      if (target) {
        if (win.directFixed) applyDirectFixedGeometryOwnership(win, target);
        setManagedFloatingStyle(win, target, "left", `${safe.x}px`);
        setManagedFloatingStyle(win, target, "top", `${safe.y}px`);
        setManagedFloatingStyle(win, target, "width", `${safe.width}px`);
        if (!win.minimized) setManagedFloatingStyle(win, target, "height", `${safe.height}px`);
      }
      return safe;
    }

    // 40.1.32 — floating shells are not all the same height. On the first
    // detach, measure the REAL shell after titlebar + nodes have been inserted,
    // then fit its border-box height to content and cap only at the viewport.
    // directFixed windows are deliberately excluded from this path.
    function shellBoxMetrics(shell) {
      const style = window.getComputedStyle?.(shell);
      const px = value => Number.parseFloat(String(value || "0")) || 0;
      return {
        horizontal: px(style?.paddingLeft) + px(style?.paddingRight) + px(style?.borderLeftWidth) + px(style?.borderRightWidth),
        verticalBorder: px(style?.borderTopWidth) + px(style?.borderBottomWidth)
      };
    }

    function autoFitFloatingShell(win, shell, geometry = {}) {
      if (!win || win.directFixed || !(shell instanceof HTMLElement)) {
        return setGeometryOnTarget(win, geometry);
      }

      const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      const viewportMaxWidth = Math.max(MIN_WIDTH, vw - VIEWPORT_MARGIN * 2);
      const viewportMaxHeight = Math.max(MIN_HEIGHT, vh - VIEWPORT_MARGIN * 2);
      const base = clampGeometry(geometry || {});
      const box = shellBoxMetrics(shell);

      // Preserve the native content width when possible. The shell itself adds
      // horizontal padding/borders around those real nodes.
      const width = clamp(
        Math.ceil((Number(base.width) || MIN_WIDTH) + box.horizontal),
        Math.min(MIN_WIDTH, viewportMaxWidth),
        viewportMaxWidth
      );

      shell.style.left = `${VIEWPORT_MARGIN}px`;
      shell.style.top = `${VIEWPORT_MARGIN}px`;
      shell.style.width = `${width}px`;
      shell.style.height = "auto";
      shell.style.maxHeight = "none";
      shell.style.overflow = "visible";

      // Force one layout pass at the final width, then read the complete shell:
      // titlebar, floating controls, padding and every visible real node.
      void shell.offsetHeight;
      const naturalHeight = Math.max(
        MIN_HEIGHT,
        Math.ceil((Number(shell.scrollHeight) || Number(shell.offsetHeight) || MIN_HEIGHT) + box.verticalBorder)
      );
      const height = Math.min(naturalHeight, viewportMaxHeight);

      // The window must remain fully visible after auto-fit. If the native dock
      // was near the bottom of the viewport, move the floating shell upward only
      // as much as required to keep the complete fitted window reachable.
      const maxX = Math.max(VIEWPORT_MARGIN, vw - width - VIEWPORT_MARGIN);
      const maxY = Math.max(VIEWPORT_MARGIN, vh - height - VIEWPORT_MARGIN);
      const x = clamp(Number(base.x), VIEWPORT_MARGIN, maxX);
      const y = clamp(Number(base.y), VIEWPORT_MARGIN, maxY);

      shell.style.removeProperty("max-height");
      shell.style.removeProperty("overflow");
      shell.style.left = `${x}px`;
      shell.style.top = `${y}px`;
      shell.style.width = `${width}px`;
      shell.style.height = `${height}px`;

      const overflowed = naturalHeight > height + 1;
      shell.dataset.adminNativeShellSizing = "content-plus-chrome";
      shell.dataset.adminNativeShellNaturalHeight = String(naturalHeight);
      shell.dataset.adminNativeShellFittedHeight = String(height);
      shell.dataset.adminNativeShellViewportClamped = overflowed ? "1" : "0";
      win.shellSizingMode = "content-plus-chrome";
      win.geometry = { x, y, width, height };
      return { ...win.geometry };
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

        // 40.1.30 — preserve the native layout footprint while the real node
        // lives inside a floating shell. Reserved placeholders keep the measured
        // grid/flex footprint; admin-windows.css no longer zeroes those reserved
        // placeholders with !important.
        const rect = node.getBoundingClientRect?.();
        const computed = window.getComputedStyle?.(node);
        const rendered = !!rect
          && rect.width > 0
          && rect.height > 0
          && String(computed?.display || "").toLowerCase() !== "none"
          && String(computed?.visibility || "").toLowerCase() !== "hidden";

        const marker = document.createElement("div");
        marker.className = "admin-native-placeholder";
        marker.dataset.adminNativePlaceholder = win.id;
        marker.dataset.adminNativePlaceholderReserved = rendered ? "1" : "0";
        marker.setAttribute("aria-hidden", "true");
        marker.style.pointerEvents = "none";
        marker.style.userSelect = "none";

        if (rendered) {
          marker.style.display = "block";
          marker.style.visibility = "hidden";
          marker.style.boxSizing = "border-box";
          marker.style.width = "auto";
          marker.style.minWidth = "0";
          marker.style.height = `${Math.max(1, Math.round(rect.height))}px`;
          marker.style.minHeight = `${Math.max(1, Math.round(rect.height))}px`;
          marker.style.marginTop = computed?.marginTop || "0px";
          marker.style.marginRight = computed?.marginRight || "0px";
          marker.style.marginBottom = computed?.marginBottom || "0px";
          marker.style.marginLeft = computed?.marginLeft || "0px";
          marker.style.gridColumn = computed?.gridColumn || "auto";
          marker.style.gridRow = computed?.gridRow || "auto";
          marker.style.alignSelf = computed?.alignSelf || "auto";
          marker.style.justifySelf = computed?.justifySelf || "auto";
          marker.style.flexGrow = computed?.flexGrow || "0";
          marker.style.flexShrink = computed?.flexShrink || "1";
          marker.style.flexBasis = computed?.flexBasis || "auto";
          marker.style.order = computed?.order || "0";
        } else {
          marker.hidden = true;
        }

        node.parentNode.insertBefore(marker, node);
        win.placeholders.set(node, marker);
      });
    }

    function resolvePortalHost(win) {
      const requested = win.resolvePortalHost?.(activeDomain, win);
      if (requested instanceof HTMLElement) return requested;
      // 40.1.30 — every real floating shell must escape local stacking/overflow
      // contexts by default. Placeholders still restore native nodes on dock.
      return document.body;
    }

    function buildShell(win, geometry, options = {}) {
      if (win.shell?.isConnected) return win.shell;
      createPlaceholders(win);
      const shell = document.createElement("section");
      shell.className = `admin-native-floating-shell admin-native-tone-${win.tone}`;
      shell.dataset.adminNativeShell = win.id;
      shell.setAttribute("aria-label", `Fenêtre flottante ${win.title}`);

      const titlebar = document.createElement("header");
      titlebar.className = "admin-native-floating-titlebar";
      const title = document.createElement("strong");
      title.className = "admin-native-floating-title";
      title.textContent = win.title;
      titlebar.appendChild(title);
      shell.appendChild(titlebar);
      win.shellTitle = title;
      win.shell = shell;
      createControlSet(win, titlebar, false, true);

      resolvePortalHost(win).appendChild(shell);
      win.nodes.forEach(node => shell.appendChild(node));
      domainMask(win);
      const baseGeometry = geometry || currentRect(win);
      if (options.autoFit === true) {
        autoFitFloatingShell(win, shell, baseGeometry);
      } else {
        shell.dataset.adminNativeShellSizing = "stored-geometry";
        shell.dataset.adminNativeShellViewportClamped = "unknown";
        win.shellSizingMode = "stored-geometry";
        setGeometryOnTarget(win, baseGeometry);
      }
      shell.addEventListener("pointerdown", () => bringToFront(win, false), { passive: true });
      shell.addEventListener("pointerup", () => persistGeometry(win), { passive: true });
      return shell;
    }

    function syncPortalHost(win) {
      if (!win?.shell?.isConnected) return;
      const host = resolvePortalHost(win);
      if (host && win.shell.parentElement !== host) host.appendChild(win.shell);
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
      const oldShell = win.shell;
      win.controlSets = win.controlSets.filter(set => !set.floatingChrome || !oldShell?.contains(set.root));
      oldShell.remove();
      win.shell = null;
      win.shellTitle = null;
      win.shellSizingMode = null;
    }

    function setDirectFloating(win, floating, geometry) {
      const node = win.anchor;
      if (!node) return;
      if (floating) {
        node.classList.add("admin-native-direct-floating");
        applyDirectFixedGeometryOwnership(win, node);
        setGeometryOnTarget(win, geometry || currentRect(win));
        if (!win.directPointerUp) {
          win.directPointerUp = () => persistGeometry(win);
          node.addEventListener("pointerup", win.directPointerUp, { passive: true });
        }
      } else {
        node.classList.remove("admin-native-direct-floating", "admin-native-maximized");
        [
          "position", "left", "top", "right", "bottom", "width", "height",
          "min-width", "max-width", "min-height", "max-height",
          "transform", "z-index"
        ].forEach(property => node.style.removeProperty(property));
      }
    }

    function bringToFront(win, persist = true) {
      if (!win?.floating) return;
      const target = win.directFixed ? win.anchor : win.shell;
      if (!target) return;
      zCounter += 1;
      setManagedFloatingStyle(win, target, "z-index", String(zCounter));
      if (persist) patchState(win.id, { z: zCounter });
    }

    function removeMinimizeBar(win) {
      if (!win?.minimizeBar) return;
      win.minimizeBar.remove();
      win.minimizeBar = null;
      win.minimizeBarTitle = null;
    }

    function ensureMinimizeBar(win) {
      if (win?.minimizeBar?.isConnected) return win.minimizeBar;
      const active = visibleEntry(win)?.node || win.anchor;
      let parent = active?.parentNode || null;
      let before = active || null;
      const marker = win.placeholders.get(active);
      if (marker?.parentNode) {
        parent = marker.parentNode;
        before = marker;
      }
      if (!parent) return null;

      const bar = document.createElement("div");
      bar.className = `admin-native-minibar admin-native-tone-${win.tone}`;
      bar.dataset.adminNativeMinibar = win.id;
      const title = document.createElement("strong");
      title.className = "admin-native-minibar-title";
      title.textContent = win.title;
      const restore = createButton("admin-native-minibar-restore", "+  Restaurer", `Restaurer ${win.title}`);
      const hide = createButton("admin-native-minibar-hide", "×", `Masquer ${win.title}`);
      restore.addEventListener("click", () => setMinimized(win, false));
      hide.addEventListener("click", () => setHidden(win, true));
      bar.append(title, restore, hide);
      parent.insertBefore(bar, before);
      win.minimizeBar = bar;
      win.minimizeBarTitle = title;
      return bar;
    }

    function applyPresentationState(win) {
      const suppressed = win.minimized || win.hidden;
      if (win.minimized && !win.hidden) ensureMinimizeBar(win);
      else removeMinimizeBar(win);

      if (win.floating && !win.directFixed && win.shell) {
        win.nodes.forEach(node => setNodeSuppressed(node, false));
        win.shell.hidden = suppressed;
      } else if (win.floating && win.directFixed) {
        setNodeSuppressed(win.anchor, suppressed);
      } else {
        win.nodes.forEach(node => setNodeSuppressed(node, suppressed));
      }

      refreshControlState(win);
    }

    function setMinimized(win, minimized, persist = true) {
      if (!win) return;
      if (minimized && win.maximized) setMaximized(win, false, false);
      if (minimized && win.hidden) win.hidden = false;
      win.minimized = !!minimized;
      if (win.floating && !win.geometry) win.geometry = currentRect(win);
      applyPresentationState(win);
      if (persist) patchState(win.id, { minimized: win.minimized, hidden: win.hidden });
      updateDeck();
    }

    function setHidden(win, hidden, persist = true) {
      if (!win) return;
      const next = !!hidden;
      if (next) {
        if (win.maximized) setMaximized(win, false, false);
        if (win.floating) setFloating(win, false, false);
        win.minimized = false;
        removeMinimizeBar(win);
      }
      win.hidden = next;
      applyPresentationState(win);
      if (persist) patchState(win.id, { hidden: win.hidden, minimized: win.minimized, floating: win.floating });
      updateDeck();
    }

    function setFloating(win, floating, persist = true, geometry = null, options = {}) {
      if (!win) return;
      if (!!floating === win.floating && (floating ? (win.directFixed || win.shell) : true)) return;

      if (!floating) {
        if (win.maximized) {
          win.maximized = false;
          const target = win.directFixed ? win.anchor : win.shell;
          target?.classList.remove("admin-native-maximized");
        }
        if (win.directFixed) setDirectFloating(win, false);
        else restoreShellNodes(win);
        win.floating = false;
        domainMask(win);
        applyPresentationState(win);
        refreshControlState(win);
        if (persist) patchState(win.id, { floating: false, maximized: false });
        updateDeck();
        return;
      }

      let preferredGeometry = null;
      if (!geometry && !win.geometry && typeof win.preferredFloatGeometry === "function") {
        try { preferredGeometry = win.preferredFloatGeometry({ domain: activeDomain, window: win }); } catch {}
      }
      const hadGeometry = !!win.geometry;
      const baseGeometry = clampWindowGeometry(win, geometry || win.geometry || preferredGeometry || currentRect(win));
      const autoFitShell = !win.directFixed
        && options.autoFitShell !== false
        && !hadGeometry
        && options.restorePersisted !== true;
      win.geometry = { ...baseGeometry };
      if (win.directFixed) setDirectFloating(win, true, baseGeometry);
      else buildShell(win, baseGeometry, { autoFit: autoFitShell });
      win.floating = true;
      if (!win.directFixed) syncPortalHost(win);
      domainMask(win);
      applyPresentationState(win);
      bringToFront(win, false);
      refreshControlState(win);
      if (persist) {
        patchState(win.id, {
          floating: true,
          x: win.geometry?.x ?? baseGeometry.x,
          y: win.geometry?.y ?? baseGeometry.y,
          width: win.geometry?.width ?? baseGeometry.width,
          height: win.geometry?.height ?? baseGeometry.height,
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
      if (!win.floating) setFloating(win, true, false, currentRect(win), { autoFitShell: false });
      win.maximized = true;
      const target = win.directFixed ? win.anchor : win.shell;
      target?.classList.add("admin-native-maximized");
      if (target) {
        if (win.directFixed) applyDirectFixedGeometryOwnership(win, target);
        setManagedFloatingStyle(win, target, "left", `${VIEWPORT_MARGIN}px`);
        setManagedFloatingStyle(win, target, "top", `${VIEWPORT_MARGIN}px`);
        setManagedFloatingStyle(win, target, "width", `calc(100vw - ${VIEWPORT_MARGIN * 2}px)`);
        setManagedFloatingStyle(win, target, "height", `calc(100vh - ${VIEWPORT_MARGIN * 2}px)`);
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

    function stateLabel(win) {
      if (win.hidden) return "MASQ";
      if (win.maximized) return "MAX";
      if (win.minimized) return "MIN";
      if (win.floating) return "LIBRE";
      return "ANCRÉE";
    }

    function focusWindow(win) {
      if (!win) return;
      if (win.hidden) setHidden(win, false);
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
        const hide = createButton("admin-window-deck-action", win.hidden ? "↥" : "×", win.hidden ? "Rappeler" : "Masquer");
        focus.addEventListener("click", () => focusWindow(win));
        dock.addEventListener("click", () => setFloating(win, false));
        min.addEventListener("click", () => setMinimized(win, !win.minimized));
        hide.addEventListener("click", () => setHidden(win, !win.hidden));
        row.append(name, state, focus, dock, min, hide);
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
        if (win.floating && !win.directFixed) syncPortalHost(win);
        applyPresentationState(win);
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
        if (win.minimized || win.hidden) {
          win.minimized = false;
          win.hidden = false;
          removeMinimizeBar(win);
          win.nodes.forEach(node => setNodeSuppressed(node, false));
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
        applyPresentationState(win);
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
        const safe = clampWindowGeometry(win, { x, y, width, height: win.geometry?.height || height });
        win.geometry = safe;
        setGeometryOnTarget(win, safe);
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
          }, { autoFitShell: false, restorePersisted: true });
          if (Number.isFinite(Number(state.z))) {
            zCounter = Math.max(zCounter, Number(state.z));
            const target = win.directFixed ? win.anchor : win.shell;
            if (target) setManagedFloatingStyle(win, target, "z-index", String(Number(state.z)));
          }
        }
        if (state.minimized === true) setMinimized(win, true, false);
        if (state.maximized === true) setMaximized(win, true, false);
        if (state.hidden === true) setHidden(win, true, false);
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
      hide: (id, value = true) => setHidden(windows.get(id), value),
      float: (id, value = true) => setFloating(windows.get(id), value),
      maximize: (id, value = true) => setMaximized(windows.get(id), value),
      focus: id => focusWindow(windows.get(id))
    };
  }

  const WINDOW_MANAGER_CONTRACT = Object.freeze({
    build: "40.1.39",
    default_shell_portal: "document.body",
    explicit_portal_override_supported: true,
    dock_restore: "layout-preserving-placeholder-original-parent",
    layout_preserving_placeholders: true,
    reserved_placeholder_css_zero_override: false,
    multi_node_geometry: "visible-node-union",
    floating_shell_auto_fit: "first-detach-content-plus-chrome",
    floating_shell_height_cap: "viewport-minus-24px",
    floating_shell_overflow: "scroll-only-when-natural-height-exceeds-viewport",
    floating_shell_saved_geometry_respected: true,
    drag_pointer_event_owner: "window-capture-phase",
    drag_reparent_continuity: true,
    drag_pointer_capture_reacquire: true,
    drag_single_gesture_detach_move: true,
    direct_fixed_auto_fit: false,
    direct_fixed_windows_use_shell: false,
    direct_fixed_position_owner: "inline-important",
    direct_fixed_geometry_owner: "inline-important",
    direct_fixed_z_order_owner: "inline-important",
    direct_fixed_dock_css_override_safe: true,
    floating_shell_z_order: "global-body"
  });

  window.ErithAdminWindowManager = Object.freeze({
    create: createManager,
    contract: WINDOW_MANAGER_CONTRACT
  });
})();
