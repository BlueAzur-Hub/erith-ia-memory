(() => {
  "use strict";

  /* ============================================================
     40.2.15 — PARKER LEWIS CAN'T LOSE · RUNTIME OBSERVATORY LOCK

     PURPOSE
     - Re-run the validated 39.x architecture checks under the current recovery identity.
     - Verify publication identity, runtime truth, module wiring,
       read-only contracts, script order, protected UI anchors, the single uniform metallic menu appearance for all Administrator window controls.
     - Report data-coverage limits as WARN, never as fake code failures.

     CONTRACT
     - 40.1.52 keeps the Binance LIVE board outside historical datasets, illuminates the restored Metal bars without geometry changes, strengthens the whole positive 24h Technical Reading cell, and adds Oracle V1 on a separate canvas; no synthetic Chart.js endpoint or trading action.
     - NO automatic repair.
     - NO memory write.
     - NO network request from this module.
     - NO Atlas / NØX / Aerith / Bridge / Ollama start.
     ============================================================ */

  const BUILD_CURRENT = "40.2.15";
  const ENGINE_CURRENT = "38.15.11";
  const WINDOW_MANAGER_SOURCE_BUILD = "40.1.48";
  const TOKEN_CURRENT = `market-core-v2.0-alpha-build-${BUILD_CURRENT}`;
  const ROOT_ID = "atlasArchitectureFreeze";

  const byId = id => document.getElementById(id);
  const setText = (id, value) => {
    const node = byId(id);
    if (node) node.textContent = String(value ?? "—");
  };
  const safe = (fn, fallback = null) => {
    try { return typeof fn === "function" ? fn() : fallback; }
    catch (_) { return fallback; }
  };

  function meta(name) {
    return String(document.querySelector(`meta[name="${name}"]`)?.content || "").trim();
  }

  function scriptRows() {
    return [...document.querySelectorAll('script[src]')].map((node, index) => ({
      index,
      raw: String(node.getAttribute("src") || ""),
      src: String(node.src || node.getAttribute("src") || "")
    }));
  }

  function styleRows() {
    return [...document.querySelectorAll('link[rel="stylesheet"][href]')].map((node, index) => ({
      index,
      raw: String(node.getAttribute("href") || ""),
      href: String(node.href || node.getAttribute("href") || "")
    }));
  }

  function pathOnly(value) {
    return String(value || "").split("?")[0].split("#")[0];
  }

  function countScriptSuffix(suffix) {
    return scriptRows().filter(row => pathOnly(row.raw).endsWith(suffix)).length;
  }

  function hasScriptSuffix(suffix) {
    return countScriptSuffix(suffix) === 1;
  }

  function versionedLocalScripts() {
    const rows = scriptRows().filter(row => row.raw.startsWith("./") && row.raw.includes("?v="));
    const stale = rows.filter(row => !row.raw.includes(BUILD_CURRENT));
    return { rows, stale };
  }

  function versionedAdminStyles() {
    const required = ["admin-windows.css", "admin-visual-assets.css", "admin-ribbons.css", "admin-window-menu-uniform.css"];
    const rows = styleRows();
    const states = required.map(name => {
      const matches = rows.filter(row => pathOnly(row.raw).endsWith(`/${name}`) || pathOnly(row.raw).endsWith(name));
      const row = matches[0] || null;
      return {
        name,
        count: matches.length,
        current: !!row && row.raw.includes(BUILD_CURRENT),
        raw: row?.raw || "absent"
      };
    });
    return states;
  }

  function scriptOrder() {
    const expected = [
      "./app.js",
      "./js/market-memory.js",
      "./js/analytical-memory.js",
      "./js/market-memory-collector.js",
      "./js/decision-board.js",
      "./js/retrospective-validation.js",
      "./js/multi-collector-concordance.js",
      "./js/memory-health-audit.js",
      "./js/admin-visual-assets.js",
      "./js/core/admin-window-manager.js",
      "./js/app.js",
      "./js/layout-repair.js",
      "./js/architecture-freeze.js"
    ];
    const rows = scriptRows();
    const positions = expected.map(path => {
      const matches = rows.filter(row => pathOnly(row.raw) === path);
      return { path, count: matches.length, index: matches.length === 1 ? matches[0].index : -1 };
    });
    const unique = positions.every(row => row.count === 1);
    const ordered = unique && positions.every((row, i) => i === 0 || row.index > positions[i - 1].index);
    return { expected, positions, unique, ordered };
  }

  function check(name, ok, detail, severity = "critical") {
    return Object.freeze({ name, ok: !!ok, detail: String(detail || ""), severity });
  }

  function runtimeBuild() {
    try { return String(typeof ATLAS_BUILD !== "undefined" ? ATLAS_BUILD : "").trim(); }
    catch (_) { return ""; }
  }

  function runtimeToken() {
    try { return String(typeof ATLAS_ASSET_TOKEN !== "undefined" ? ATLAS_ASSET_TOKEN : "").trim(); }
    catch (_) { return ""; }
  }

  function runtimeTruth() {
    try {
      if (typeof atlasRuntimeTruth3813 === "function") return atlasRuntimeTruth3813();
    } catch (_) {}
    return globalThis.__AGENT_CRYPTO_RUNTIME_TRUTH__ || null;
  }

  function memoryHealth() {
    return safe(globalThis.atlasMemoryHealth3980R2?.derive, null);
  }

  function multiCollector() {
    return safe(globalThis.atlasMultiCollectorConcordance3970?.derive, null);
  }

  function readOnlyContractOk(contract) {
    if (!contract) return false;
    return contract.writes_memory === false
      && contract.new_fetch === false
      && contract.new_timer === false
      && contract.new_websocket === false
      && contract.starts_atlas === false
      && contract.starts_nox === false
      && contract.starts_aerith === false;
  }

  function directControlState(host) {
    if (!(host instanceof HTMLElement)) return null;
    const shell = host.closest?.(".admin-native-floating-shell") || null;
    const root = shell
      ? shell.querySelector(":scope > .admin-native-floating-titlebar > .admin-native-controls-floating")
      : ([...host.children].find(node => node.classList?.contains("admin-native-controls")) || null);
    if (!(root instanceof HTMLElement)) return null;
    const required = [
      ".admin-native-move",
      ".admin-native-minimize",
      ".admin-native-float",
      ".admin-native-maximize",
      ".admin-native-hide"
    ];
    const buttons = required.map(selector => root.querySelector(selector));
    const style = safe(() => getComputedStyle(root), null);
    const effectiveHost = shell || host;
    const hostStyle = safe(() => getComputedStyle(effectiveHost), null);
    const rect = safe(() => root.getBoundingClientRect(), null);
    const hostRect = safe(() => effectiveHost.getBoundingClientRect(), null);
    const rendered = !!hostStyle
      && hostStyle.display !== "none"
      && hostStyle.visibility !== "hidden"
      && Number(hostRect?.width || 0) > 0
      && Number(hostRect?.height || 0) > 0
      && effectiveHost.getClientRects().length > 0;
    const layoutOk = !rendered || (
      !!style && style.position === "absolute"
      && !!rect && rect.width >= 120
      && !!hostRect && rect.left >= hostRect.left - 2 && rect.right <= hostRect.right + 2
    );
    return {
      root,
      buttons,
      rendered,
      complete: buttons.every(button => button instanceof HTMLButtonElement),
      interactive: !!style && style.display !== "none" && style.visibility !== "hidden" && style.pointerEvents !== "none",
      computedOpacity: Number.parseFloat(style?.opacity || "0"),
      position: String(style?.position || ""),
      display: String(style?.display || ""),
      flexDirection: String(style?.flexDirection || ""),
      width: Number(rect?.width || 0),
      layoutOk
    };
  }

  function canonicalChromeCssContract() {
    const sheet = [...document.styleSheets].find(item => pathOnly(item.href || "").endsWith("/admin-windows.css"));
    if (!sheet) return { ok:false, detail:"admin-windows.css CSSOM absent" };
    const rows = [];
    const selectors = value => String(value || "").split(",").map(item => item.trim()).filter(Boolean);
    const opacityNumber = value => {
      const number = Number.parseFloat(String(value || "").trim());
      return Number.isFinite(number) ? number : null;
    };
    try {
      for (const rule of [...sheet.cssRules]) {
        if (rule.type !== CSSRule.STYLE_RULE) continue;
        rows.push({
          selector:String(rule.selectorText || ""),
          selectors:selectors(rule.selectorText),
          opacity:String(rule.style?.opacity || "").trim()
        });
      }
    } catch (_) {
      return { ok:false, detail:"admin-windows.css CSSOM illisible" };
    }
    const lastOpacity = selector => {
      let value = "";
      for (const row of rows) {
        if (row.selectors.includes(selector) && row.opacity) value = row.opacity;
      }
      return value;
    };
    const expected = [
      [".admin-native-controls", 0.16],
      ["#analyste.admin-native-anchor > .admin-native-controls", 0.12],
      ["#marketSnapshotPanel > .admin-native-controls", 0.12],
      [".top5-ribbon > .admin-native-controls", 0.09],
      [".market-flow-ribbon > .admin-native-controls", 0.09],
      [".admin-mirror-bar.admin-mirror-bar-39-2-8", 0.15]
    ];
    const hoverRequired = [
      ".admin-native-control-host:hover > .admin-native-controls",
      "#analyste.admin-native-anchor:hover > .admin-native-controls",
      "#marketSnapshotPanel:hover > .admin-native-controls",
      ".top5-ribbon:hover > .admin-native-controls",
      ".market-flow-ribbon:hover > .admin-native-controls",
      ".admin-mirror-bar.admin-mirror-bar-39-2-8:hover"
    ];
    const base = expected.map(([selector, expectedOpacity]) => {
      const got = lastOpacity(selector);
      const numeric = opacityNumber(got);
      return { selector, expectedOpacity, got, ok: numeric !== null && Math.abs(numeric - expectedOpacity) < 0.0001 };
    });
    const hover = hoverRequired.map(selector => ({
      selector,
      ok: rows.some(row => row.selectors.includes(selector) && opacityNumber(row.opacity) !== null)
    }));
    return {
      ok: base.every(row => row.ok) && hover.every(row => row.ok),
      base,
      hover,
      detail: base.map(row => `${row.selector}:${row.got || "—"}`).join(" · ")
    };
  }

  function uniformMenuCssContract() {
    const sheet = [...document.styleSheets].find(item => pathOnly(item.href || "").endsWith("/admin-window-menu-uniform.css"));
    if (!sheet) return { ok:false, detail:"uniform menu stylesheet absent" };
    const rows = [];
    const normalizeSelector = value => String(value || "")
      .trim()
      .replace(/^body\.atlas-administrator-mirror\s+/, "");
    const selectors = value => String(value || "")
      .split(",")
      .map(item => normalizeSelector(item))
      .filter(Boolean);
    const opacityIs = (value, expected) => {
      const number = Number.parseFloat(String(value || "").trim());
      return Number.isFinite(number) && Math.abs(number - expected) < 0.0001;
    };
    try {
      const walk = rules => {
        for (const rule of [...(rules || [])]) {
          if (rule.cssRules) { walk(rule.cssRules); continue; }
          if (rule.type !== CSSRule.STYLE_RULE) continue;
          rows.push({
            selector:String(rule.selectorText || ""),
            selectors:selectors(rule.selectorText),
            opacity:String(rule.style?.opacity || "").trim(),
            visibility:String(rule.style?.visibility || "").trim(),
            pointer:String(rule.style?.pointerEvents || "").trim()
          });
        }
      };
      walk(sheet.cssRules);
    } catch (_) {
      return { ok:false, detail:"uniform menu stylesheet CSSOM illisible" };
    }
    const has = (selector, expectedOpacity, extra = () => true) =>
      rows.some(row => row.selectors.includes(selector) && opacityIs(row.opacity, expectedOpacity) && extra(row));
    // One generic rule is the canonical owner for every five-button menu.
    // Do not require redundant per-window selectors when the generic selector
    // already covers Graphique, Target Top and Market Flow by construction.
    const base = has(".admin-native-control-host > .admin-native-controls", 0.16, row => row.visibility === "visible" && row.pointer === "auto");
    const reveal = has(".admin-native-control-host:hover > .admin-native-controls", 0.82);
    const direct = has(".admin-native-control-host > .admin-native-controls:hover", 1);
    const graphSpecific = has("#analyste.admin-native-control-host > .admin-native-controls", 0.16);
    const targetSpecific = has("#market-workspace .top5-ribbon.admin-native-control-host > .admin-native-controls", 0.16);
    const flowSpecific = has("#market-workspace .market-flow-ribbon.admin-native-control-host > .admin-native-controls", 0.16);
    const covered = base && reveal && direct;
    return {
      ok: covered,
      detail:`generic=${String(covered)} · rest=.16 · reveal=.82 · direct=1 · dedicated graph=${graphSpecific} target=${targetSpecific} flow=${flowSpecific} (informatifs)`
    };
  }

  function technicalReadingGlassContract() {
    const sheet = [...document.styleSheets].find(item => pathOnly(item.href || "").endsWith("/admin-visual-assets.css"));
    if (!sheet) return { ok:false, detail:"admin-visual-assets.css CSSOM absent" };
    const rows = [];
    const selectors = value => String(value || "").split(",").map(item => item.trim()).filter(Boolean);
    const alpha = value => {
      const text = String(value || "").trim().toLowerCase();
      if (text === "transparent") return 0;
      const rgba = text.match(/rgba?\(([^)]+)\)/);
      if (!rgba) return null;
      const parts = rgba[1].split(",").map(item => item.trim());
      if (parts.length < 4) return 1;
      const valueAlpha = Number.parseFloat(parts[3]);
      return Number.isFinite(valueAlpha) ? valueAlpha : null;
    };
    try {
      for (const rule of [...sheet.cssRules]) {
        if (rule.type !== CSSRule.STYLE_RULE) continue;
        rows.push({
          selectors:selectors(rule.selectorText),
          backgroundColor:String(rule.style?.backgroundColor || "").trim(),
          backdrop:String(rule.style?.backdropFilter || "").trim(),
          webkitBackdrop:String(rule.style?.webkitBackdropFilter || "").trim()
        });
      }
    } catch (_) {
      return { ok:false, detail:"admin-visual-assets.css CSSOM illisible" };
    }
    const rootSelector = "body.atlas-administrator-mirror #detailPanel.clean-lens-detail-panel";
    const root = rows.find(row => row.selectors.includes(rootSelector)) || null;
    const inner = rows.find(row => row.selectors.includes("body.atlas-administrator-mirror #detailPanel .detail-panel-body")) || null;
    const surface = rows.find(row => row.selectors.includes("body.atlas-administrator-mirror #detailPanel .detail-panel-toggle")) || null;
    const rootAlpha = alpha(root?.backgroundColor);
    const innerAlpha = alpha(inner?.backgroundColor);
    const surfaceAlpha = alpha(surface?.backgroundColor);
    const inlineLegacy = !!byId("administrator-tech-reading-ultra-clear-39-7-1")
      || !!byId("administrator-tech-reading-near-zero-glass-39-8-0-r1");
    const ok = rootAlpha === 0
      && innerAlpha !== null && innerAlpha <= 0.0081
      && surfaceAlpha !== null && surfaceAlpha <= 0.0181
      && !inlineLegacy;
    return {
      ok,
      detail:`owner=admin-visual-assets.css · root=${rootAlpha ?? "—"} · inner=${innerAlpha ?? "—"} · surfaces=${surfaceAlpha ?? "—"} · inlineLegacy=${inlineLegacy}`
    };
  }

  function cryptoCardContract() {
    const layer = byId("atlasHelpLayer");
    const row = document.querySelector("[data-market-help-id]");
    const periodButton = document.querySelector(".period-btn[data-period]");
    const definition = row && typeof atlasMarketHelpDefinition === "function"
      ? safe(() => atlasMarketHelpDefinition(row), null)
      : null;
    const routedMarket = row && typeof atlasHelpTargetFromNode === "function"
      ? safe(() => atlasHelpTargetFromNode(row) === row, false)
      : false;
    const genericSuppressed = periodButton && typeof atlasHelpTargetFromNode === "function"
      ? safe(() => atlasHelpTargetFromNode(periodButton) === null, false)
      : false;

    let destructiveSharedHostRule = false;
    let interactiveMarketRule = false;
    let dockRailGeometryRule = false;
    let dockTopGeometryRule = false;
    let dockStickySurfaceRule = false;

    const walk = (rules, sheetName) => {
      for (const rule of [...(rules || [])]) {
        if (rule.cssRules) { walk(rule.cssRules, sheetName); continue; }
        const selector = String(rule.selectorText || "").trim();
        const selectorTokens = selector.split(",").map(item => item.trim());
        const display = String(rule.style?.display || "").trim().toLowerCase();
        const visibility = String(rule.style?.visibility || "").trim().toLowerCase();
        const pointerEvents = String(rule.style?.pointerEvents || "").trim().toLowerCase();

        if (sheetName === "admin-visual-assets.css"
            && /#atlasHelpLayer|\.atlas-help-layer/.test(selector)
            && (display === "none" || visibility === "hidden" || pointerEvents === "none")) {
          destructiveSharedHostRule = true;
        }

        if (sheetName !== "style.css") continue;

        if (selectorTokens.includes('.atlas-help-layer[data-market-help-coin-id]:not([hidden])')
            && pointerEvents === "auto") {
          interactiveMarketRule = true;
        }

        if (selectorTokens.includes('.market-workspace-grid.market-card-dock-active.math-dock-rail')) {
          const columns = String(rule.style?.gridTemplateColumns || "").replace(/\s+/g, " ").trim();
          dockRailGeometryRule = /980px/.test(columns) && /320px/.test(columns)
            && (/atlas-canonical-side-rail-width/.test(columns) || /64px/.test(columns));
        }

        if (selectorTokens.includes('.market-workspace-grid.market-card-dock-active:not(.math-dock-rail):not(.math-dock-side)')) {
          const columns = String(rule.style?.gridTemplateColumns || "").replace(/\s+/g, " ").trim();
          dockTopGeometryRule = /980px/.test(columns) && /320px/.test(columns);
        }

        if (selectorTokens.includes('#atlasMarketCardDockHost.atlas-market-card-dock-host')) {
          const position = String(rule.style?.position || "").trim().toLowerCase();
          const top = String(rule.style?.top || "").trim().toLowerCase();
          const minWidth = String(rule.style?.minWidth || "").trim().toLowerCase();
          const overflowY = String(rule.style?.overflowY || "").trim().toLowerCase();
          const overscroll = String(rule.style?.overscrollBehavior || "").trim().toLowerCase();
          const scrollbar = String(rule.style?.scrollbarGutter || "").trim().toLowerCase();
          dockStickySurfaceRule = position === "sticky" && top === "8px" && minWidth === "320px"
            && ["auto", "scroll"].includes(overflowY) && overscroll === "contain" && scrollbar === "stable";
        }
      }
    };

    for (const sheet of [...document.styleSheets]) {
      const name = pathOnly(sheet.href || "").split("/").pop() || "";
      if (name !== "admin-visual-assets.css" && name !== "style.css") continue;
      try { walk(sheet.cssRules, name); } catch (_) {}
    }

    const toolbarOk = !!definition?.marketCoinId
      && String(definition?.html || "").includes('data-market-card-mode="floating"')
      && String(definition?.html || "").includes('data-market-card-mode="dock"');

    const grid = byId("marketWorkspaceGrid");
    const dockActive = !!grid?.classList?.contains("market-card-dock-active");
    const dockHost = byId("atlasMarketCardDockHost");
    let dockRuntimeOk = true;
    let dockRuntimeDetail = "inactive";

    if (dockActive) {
      const market = byId("marketSnapshotPanel");
      const math = byId("math");
      const hostStyle = dockHost ? safe(() => getComputedStyle(dockHost), null) : null;
      const hostRect = dockHost ? safe(() => dockHost.getBoundingClientRect(), null) : null;
      const marketRect = market ? safe(() => market.getBoundingClientRect(), null) : null;
      const mathRect = math ? safe(() => math.getBoundingClientRect(), null) : null;
      const rail = !!grid?.classList?.contains("math-dock-rail");
      const visible = !!dockHost && !dockHost.hidden && hostStyle?.display !== "none" && hostStyle?.visibility !== "hidden";
      const sticky = hostStyle?.position === "sticky";
      const scrollable = ["auto", "scroll"].includes(String(hostStyle?.overflowY || "").toLowerCase());
      const hostWide = Number(hostRect?.width || 0) >= 319;
      const marketWide = Number(marketRect?.width || 0) >= 979;
      const horizontalOrder = !rail || (
        Number(marketRect?.right || 0) <= Number(hostRect?.left || 0) + 2
        && Number(hostRect?.right || 0) <= Number(mathRect?.left || 0) + 2
      );
      dockRuntimeOk = visible && sticky && scrollable && hostWide && marketWide && horizontalOrder;
      dockRuntimeDetail = `active · market=${Math.round(marketRect?.width || 0)}px · card=${Math.round(hostRect?.width || 0)}px · sticky=${String(sticky)} · scroll=${String(scrollable)} · order=${String(horizontalOrder)}`;
    }

    const sourceDockOk = dockRailGeometryRule && dockTopGeometryRule && dockStickySurfaceRule;
    const ok = !!layer && !!row && !!definition?.marketCoinId && toolbarOk
      && routedMarket && genericSuppressed && !destructiveSharedHostRule && interactiveMarketRule
      && sourceDockOk && dockRuntimeOk;

    return {
      ok,
      detail: `host=${String(!!layer)} · modes=${String(toolbarOk)} · route=${String(routedMarket)} · genericGate=${String(genericSuppressed)} · destructiveCss=${String(destructiveSharedHostRule)} · pointer=${String(interactiveMarketRule)} · dockCSS=${String(sourceDockOk)} · dockRuntime=${dockRuntimeDetail}`
    };
  }

  function destructiveMenuHideRules() {
    const hits = [];
    const walk = rules => {
      for (const rule of [...(rules || [])]) {
        if (rule.cssRules) { walk(rule.cssRules); continue; }
        const selector = String(rule.selectorText || "");
        const display = String(rule.style?.display || "").trim().toLowerCase();
        if (display !== "none") continue;
        if (/admin-native-controls/.test(selector) && /analyste|marketSnapshotPanel|top5-ribbon|market-flow-ribbon|#math|atlas-layout-family/.test(selector)) {
          hits.push(`${selector}{display:none}`);
        }
      }
    };
    for (const sheet of [...document.styleSheets]) {
      try { walk(sheet.cssRules); } catch (_) {}
    }
    return hits;
  }

  function technicalReadingGeometryOwnerContract() {
    const root = document.querySelector('#analyste.champagne-clean-lens');
    const chart = root?.querySelector(':scope > .chart-panel');
    const detail = root?.querySelector(':scope > #detailPanel.clean-lens-detail-panel');
    const body = detail?.querySelector(':scope > .detail-panel-body');
    if (!(root instanceof HTMLElement) || !(chart instanceof HTMLElement) || !(detail instanceof HTMLElement) || !(body instanceof HTMLElement)) {
      return { ok:false, detail:'ancrages Graphique/Lecture technique absents' };
    }

    const offenders = [];
    for (const sheet of [...document.styleSheets]) {
      const href = String(sheet.href || '');
      if (!href.includes('admin-visual-assets.css')) continue;
      let rules = [];
      try { rules = [...(sheet.cssRules || [])]; } catch (_) { continue; }
      const walk = list => {
        for (const rule of list) {
          if (rule.cssRules) { walk([...rule.cssRules]); continue; }
          const selector = String(rule.selectorText || '').replace(/\s+/g,' ').trim();
          const style = rule.style;
          if (!style) continue;
          const rootGeom = selector.endsWith('#analyste.champagne-clean-lens:not(.detail-collapsed)') ||
            selector.endsWith('#analyste.champagne-clean-lens:not(.detail-collapsed):not(.admin-native-direct-floating)');
          const chartGeom = /> \.chart-panel(?:\b|$)/.test(selector);
          const detailGeom = /> #detailPanel\.clean-lens-detail-panel/.test(selector);
          if (!(rootGeom || chartGeom || detailGeom)) continue;
          const geom = [
            'display','position','inset','top','right','bottom','left',
            'width','min-width','max-width','height','min-height','max-height',
            'padding-right','grid-template-columns','grid-template-rows','grid-column','grid-row',
            'justify-self','align-self'
          ];
          const used = geom.filter(name => String(style.getPropertyValue(name) || '').trim());
          if (used.length) offenders.push(`${selector} => ${used.join(',')}`);
        }
      };
      walk(rules);
    }

    const rootStyle = getComputedStyle(root);
    const detailStyle = getComputedStyle(detail);
    const bodyStyle = getComputedStyle(body);
    const padRight = parseFloat(rootStyle.paddingRight || '0') || 0;
    const runtimeOk =
      rootStyle.display === 'block' &&
      rootStyle.position === 'relative' &&
      padRight > 0 &&
      detailStyle.position === 'absolute' &&
      detailStyle.top === '0px' &&
      detailStyle.bottom === '0px' &&
      detailStyle.height !== 'auto' &&
      (bodyStyle.overflowY === 'auto' || bodyStyle.overflowY === 'scroll');

    return {
      ok: offenders.length === 0 && runtimeOk,
      detail: offenders.length
        ? offenders.join(' · ')
        : `Mirror local actif · root=${rootStyle.display}/${rootStyle.position} · dock=${detailStyle.position} · scroll=${bodyStyle.overflowY}`
    };
  }

  function directFixedGeometryOwnerContract() {
    const managerContract = globalThis.ErithAdminWindowManager?.contract || {};
    const rows = [
      ["graphique", byId("analyste")],
      ["target-top", document.querySelector("#market-workspace .top5-ribbon")],
      ["market-flow", document.querySelector("#market-workspace .market-flow-ribbon")],
      ["math-core", byId("math")]
    ].map(([id, node]) => {
      if (!(node instanceof HTMLElement)) return { id, present:false, floating:false, ok:false, detail:"absent" };
      const floating = node.classList.contains("admin-native-direct-floating");
      const style = getComputedStyle(node);
      const priority = property => node.style.getPropertyPriority(property) === "important";
      const runtimeOk = !floating || (
        String(style.position || "").toLowerCase() === "fixed"
        && priority("position")
        && priority("left")
        && priority("top")
        && priority("width")
        && priority("height")
        && priority("z-index")
      );
      return {
        id,
        present:true,
        floating,
        ok:runtimeOk,
        detail:floating
          ? `${style.position} · inline!important pos=${priority("position")} xy=${priority("left") && priority("top")} wh=${priority("width") && priority("height")} z=${priority("z-index")}`
          : "docked"
      };
    });
    const contractOk =
      managerContract.build === WINDOW_MANAGER_SOURCE_BUILD
      && managerContract.direct_fixed_position_owner === "inline-important"
      && managerContract.direct_fixed_geometry_owner === "inline-important"
      && managerContract.direct_fixed_z_order_owner === "inline-important"
      && managerContract.direct_fixed_dock_css_override_safe === true;
    return {
      ok: contractOk && rows.every(row => row.present && row.ok),
      detail:`contract=${String(contractOk)} · manager=${String(managerContract.build || "—")} · source attendu=${WINDOW_MANAGER_SOURCE_BUILD} · ${rows.map(row => `${row.id}:${row.detail}`).join(" · ")}`
    };
  }

  function detachDragContinuityContract() {
    const managerContract = globalThis.ErithAdminWindowManager?.contract || {};
    const ok =
      managerContract.build === WINDOW_MANAGER_SOURCE_BUILD
      && managerContract.drag_pointer_event_owner === "window-capture-phase"
      && managerContract.drag_reparent_continuity === true
      && managerContract.drag_pointer_capture_reacquire === true
      && managerContract.drag_single_gesture_detach_move === true;
    return {
      ok,
      detail: ok
        ? "window capture-phase · reparent-safe · capture reacquire · one gesture"
        : `manager=${String(managerContract.build || "—")} / source attendu=${WINDOW_MANAGER_SOURCE_BUILD} · owner=${String(managerContract.drag_pointer_event_owner || "—")} · reparent=${String(managerContract.drag_reparent_continuity)} · reacquire=${String(managerContract.drag_pointer_capture_reacquire)} · oneGesture=${String(managerContract.drag_single_gesture_detach_move)}`
    };
  }

  function marketFlowFloatParityContract() {
    const flow = document.querySelector("#market-workspace .market-flow-ribbon");
    const target = document.querySelector("#market-workspace .top5-ribbon");
    const viewport = flow?.querySelector(":scope > .market-flow-viewport") || null;
    const ribbonSheet = [...document.styleSheets].find(item => pathOnly(item.href || "").endsWith("/admin-ribbons.css"));
    const windowSheet = [...document.styleSheets].find(item => pathOnly(item.href || "").endsWith("/admin-windows.css"));
    if (!flow || !target || !viewport || !ribbonSheet || !windowSheet) {
      return { ok:false, detail:"ancrage Market Flow / Target Top / viewport ou stylesheet absent" };
    }

    let flowGlobalPosition = "";
    let dockedRelative = false;
    let directFixedOwner = false;
    let floatingViewportRule = false;
    const inspect = (sheet, kind) => {
      const walk = rules => {
        for (const rule of [...(rules || [])]) {
          if (rule.cssRules) { walk(rule.cssRules); continue; }
          if (rule.type !== CSSRule.STYLE_RULE) continue;
          const selector = String(rule.selectorText || "").replace(/\s+/g," ").trim();
          const position = String(rule.style?.position || "").trim().toLowerCase();
          if (kind === "ribbons") {
            if (selector === "#market-workspace .market-flow-ribbon") flowGlobalPosition = position;
            if (selector.includes(".market-flow-ribbon:not(.admin-native-direct-floating)") && position === "relative") dockedRelative = true;
            if (selector.includes(".market-flow-ribbon.admin-native-direct-floating > .market-flow-viewport")
                && String(rule.style?.overflow || "").trim().toLowerCase() === "hidden") floatingViewportRule = true;
          }
          if (kind === "windows" && selector.split(",").map(x => x.trim()).includes(".admin-native-direct-floating") && position === "fixed") {
            directFixedOwner = true;
          }
        }
      };
      try { walk(sheet.cssRules); } catch (_) {}
    };
    inspect(ribbonSheet, "ribbons");
    inspect(windowSheet, "windows");

    const flowFloating = flow.classList.contains("admin-native-direct-floating");
    const targetFloating = target.classList.contains("admin-native-direct-floating");
    const flowStyle = getComputedStyle(flow);
    const viewportStyle = getComputedStyle(viewport);
    const targetPosition = String(getComputedStyle(target).position || "").toLowerCase();
    const flowPosition = String(flowStyle.position || "").toLowerCase();
    const flowHeight = Math.round(flow.getBoundingClientRect().height || 0);
    const viewportWidth = Math.round(viewport.getBoundingClientRect().width || 0);
    const flowWidth = Math.round(flow.getBoundingClientRect().width || 0);
    const runtimeOk = !flowFloating || (
      flowPosition === "fixed"
      && Math.abs(flowHeight - 54) <= 2
      && viewportStyle.overflowX === "hidden"
      && viewportWidth <= flowWidth + 2
    );
    const targetReferenceOk = !targetFloating || targetPosition === "fixed";
    const ok = flowGlobalPosition !== "relative" && dockedRelative && directFixedOwner
      && floatingViewportRule && runtimeOk && targetReferenceOk;
    return {
      ok,
      detail:`globalFlowPosition=${flowGlobalPosition || "unset"} · dockedRelative=${dockedRelative} · fixedOwner=${directFixedOwner} · viewportRule=${floatingViewportRule} · flow=${flowFloating ? `${flowPosition}/${flowHeight}px` : "docked"} · viewport=${viewportWidth}px/${flowWidth}px · target=${targetFloating ? targetPosition : "docked"}`
    };
  }

  function marketSnapshotBodyPortalContract() {
    const shell = document.querySelector('[data-admin-native-shell="market"]');
    if (!shell) {
      return { ok: true, detail: "docked · shell flottante absente (portal body prêt)" };
    }
    const parentIsBody = shell.parentElement === document.body;
    const position = String(getComputedStyle(shell).position || "").toLowerCase();
    const z = Number.parseInt(getComputedStyle(shell).zIndex || "0", 10) || 0;
    return {
      ok: parentIsBody && position === "fixed",
      detail: `parent=${shell.parentElement === document.body ? "body" : shell.parentElement?.id || shell.parentElement?.tagName || "—"} · position=${position || "—"} · z=${z}`
    };
  }

  function globalFloatingShellContract() {
    const managerContract = globalThis.ErithAdminWindowManager?.contract || null;
    const managerOk = managerContract?.default_shell_portal === "document.body"
      && managerContract?.dock_restore === "layout-preserving-placeholder-original-parent"
      && managerContract?.layout_preserving_placeholders === true
      && managerContract?.reserved_placeholder_css_zero_override === false
      && managerContract?.multi_node_geometry === "visible-node-union"
      && managerContract?.floating_shell_auto_fit === "first-detach-content-plus-chrome"
      && managerContract?.floating_shell_height_cap === "viewport-minus-24px"
      && managerContract?.floating_shell_saved_geometry_respected === true
      && managerContract?.direct_fixed_auto_fit === false
      && managerContract?.floating_shell_z_order === "global-body";

    const sheet = [...document.styleSheets].find(item => pathOnly(item.href || "").endsWith("/admin-windows.css"));
    let horizontalCssOwner = false;
    let reservedPlaceholderCssOwner = false;
    let forbiddenReservedZeroRule = false;
    if (sheet) {
      try {
        for (const rule of [...sheet.cssRules]) {
          if (rule.type !== CSSRule.STYLE_RULE) continue;
          const selector = String(rule.selectorText || "").replace(/\s+/g, " ").trim();
          if (selector === ".admin-native-floating-shell .admin-native-controls-floating") {
            const display = String(rule.style?.display || "").trim().toLowerCase();
            const direction = String(rule.style?.flexDirection || "").trim().toLowerCase();
            const wrap = String(rule.style?.flexWrap || "").trim().toLowerCase();
            horizontalCssOwner = display === "flex" && (direction === "row" || direction === "") && wrap === "nowrap";
          }
          if (selector === '.admin-native-placeholder[data-admin-native-placeholder-reserved="1"]') {
            const display = String(rule.style?.display || "").trim().toLowerCase();
            const visibility = String(rule.style?.visibility || "").trim().toLowerCase();
            reservedPlaceholderCssOwner = display === "block" && visibility === "hidden";
          }
          if (selector.includes(".admin-native-placeholder")
            && !selector.includes(':not([data-admin-native-placeholder-reserved="1"])')
            && String(rule.style?.height || "").trim() === "0px"
            && String(rule.style?.getPropertyPriority?.("height") || "").toLowerCase() === "important") {
            forbiddenReservedZeroRule = true;
          }
        }
      } catch (_) {}
    }

    const shells = [...document.querySelectorAll(".admin-native-floating-shell")];
    const rows = shells.map(shell => {
      const controls = shell.querySelector(":scope > .admin-native-floating-titlebar > .admin-native-controls-floating");
      const shellStyle = getComputedStyle(shell);
      const controlStyle = controls ? getComputedStyle(controls) : null;
      const buttons = controls ? [...controls.querySelectorAll(":scope > .admin-native-control")] : [];
      const id = String(shell.dataset.adminNativeShell || "—");
      const placeholders = [...document.querySelectorAll(`[data-admin-native-placeholder="${CSS.escape(id)}"]`)];
      const reserved = placeholders.filter(marker => marker.dataset.adminNativePlaceholderReserved === "1");
      const reservationOk = reserved.length > 0 && reserved.every(marker => {
        const rect = marker.getBoundingClientRect();
        const style = getComputedStyle(marker);
        return rect.height > 0
          && String(style.display || "").toLowerCase() !== "none"
          && String(style.visibility || "").toLowerCase() === "hidden";
      });
      const parentBody = shell.parentElement === document.body;
      const fixed = String(shellStyle.position || "").toLowerCase() === "fixed";
      const horizontal = !!controlStyle
        && String(controlStyle.display || "").toLowerCase() === "flex"
        && String(controlStyle.flexDirection || "row").toLowerCase() === "row"
        && buttons.length === 5;
      return {
        id,
        parentBody,
        fixed,
        horizontal,
        buttons: buttons.length,
        placeholders: placeholders.length,
        reserved: reserved.length,
        reservationOk,
        sizing: String(shell.dataset.adminNativeShellSizing || "—"),
        naturalHeight: Number(shell.dataset.adminNativeShellNaturalHeight || 0),
        fittedHeight: Number(shell.dataset.adminNativeShellFittedHeight || 0),
        viewportClamped: String(shell.dataset.adminNativeShellViewportClamped || "—")
      };
    });
    const runtimeOk = rows.every(row => row.parentBody && row.fixed && row.horizontal && row.reservationOk);
    const cssReservationOk = reservedPlaceholderCssOwner && !forbiddenReservedZeroRule;
    return {
      ok: managerOk && horizontalCssOwner && cssReservationOk && runtimeOk,
      detail: `managerBodyDefault=${managerOk} · horizontalCss=${horizontalCssOwner} · reservedPlaceholderCss=${cssReservationOk} · forbiddenZero=${forbiddenReservedZeroRule} · shells=${rows.length}${rows.length ? " · " + rows.map(row => `${row.id}:body=${row.parentBody}/fixed=${row.fixed}/horizontal=${row.horizontal}/5=${row.buttons}/spacers=${row.reserved}/${row.placeholders}/layout=${row.reservationOk}/size=${row.sizing}${row.naturalHeight ? `:${row.fittedHeight}/${row.naturalHeight}` : ""}`).join(" · ") : " · aucune shell ouverte"}`
    };
  }

  function canonicalModuleFilenameContract() {
    const forbidden = [
      /\/js\/market-memory-\d/i,
      /\/js\/analytical-memory-\d/i,
      /\/js\/decision-board-dual-memory-\d/i,
      /\/js\/retrospective-validation-\d/i,
      /\/js\/multi-collector-concordance-\d/i,
      /\/js\/memory-health-audit-\d/i
    ];
    const legacy = scriptRows()
      .map(row => pathOnly(row.raw))
      .filter(path => forbidden.some(rx => rx.test(path)));
    return {
      ok: legacy.length === 0,
      legacy,
      detail: legacy.length ? `anciens noms actifs: ${legacy.join(" · ")}` : "noms fonctionnels canoniques uniquement"
    };
  }

  function derive() {
    const build = runtimeBuild();
    const token = runtimeToken();
    const truth = runtimeTruth();
    const cache = versionedLocalScripts();
    const styles = versionedAdminStyles();
    const order = scriptOrder();
    const health = memoryHealth();
    const multi = multiCollector();
    const healthContract = globalThis.__AGENT_CRYPTO_MEMORY_HEALTH_3980R2__ || null;
    const multiContract = globalThis.__AGENT_CRYPTO_MULTI_COLLECTOR_3970__ || null;
    const layoutContract = globalThis.__AGENT_CRYPTO_LAYOUT_REPAIR_3990R2__ || null;
    const layoutState = safe(globalThis.atlasAdministratorLayoutRepair3990R2?.repair, null);
    const board = byId("decision-board");
    const primaryMemory = byId("decisionMemoryV2");
    const dualMemory = byId("decisionDualMemory395");
    const retro = byId("decisionRetrospective3960");
    const auxHost = byId("decisionAuxMemoryPanels3990R2");
    const directMemoryRoots = board ? [...board.children].filter(node => node.classList?.contains("decision-memory-v2")) : [];
    const bodyBuild = String(document.body?.dataset?.administratorBuild || "").trim();
    const rootBuild = String(document.documentElement?.dataset?.administratorBuild || "").trim();

    const graphChrome = directControlState(byId("analyste"));
    const targetChrome = directControlState(document.querySelector("#market-workspace .top5-ribbon"));
    const flowChrome = directControlState(document.querySelector("#market-workspace .market-flow-ribbon"));
    const marketChrome = directControlState(byId("marketSnapshotPanel"));
    const mathChrome = directControlState(byId("math"));
    const familyChromeHosts = [...document.querySelectorAll(".atlas-layout-family.admin-native-control-host")];
    const familyChromes = familyChromeHosts.map(host => ({
      title: String(host.dataset.adminNativeTitle || host.querySelector("h2")?.textContent || "famille").trim(),
      state: directControlState(host)
    }));
    const visibleFamilyChromes = familyChromes.filter(row => row.state?.rendered === true);
    const familyChromeDomOk = familyChromes.length >= 4 && familyChromes.every(row => !!row.state && row.state.complete);
    // In Vue normale the family separators are intentionally display:none.
    // Hidden geometry is not measurable (0 px) and must not be reported as clipping.
    const familyChromeLayoutOk = familyChromeDomOk && visibleFamilyChromes.every(row =>
      row.state.interactive && row.state.layoutOk
    );
    const chromeCss = canonicalChromeCssContract();
    const uniformMenuCss = uniformMenuCssContract();
    const cryptoCard = cryptoCardContract();
    const graphStability = globalThis.__ATLAS_GRAPH_STABILITY_40122__ || null;
    const verticalBars = globalThis.__ATLAS_VERTICAL_BAR_RENDERER_40149__ || null;
    const oracleV1 = globalThis.__ATLAS_ORACLE_V1_40149__ || null;
    const forbiddenOverrides = styleRows().filter(row => /admin-window-(?:controls-recovery|hover-ghost-contract)-40\.0\.0R[12]\.css/i.test(pathOnly(row.raw)));

    const checks = [
      check("Build runtime", build === BUILD_CURRENT, `ATLAS_BUILD=${build || "—"}`),
      check("Token runtime", token === TOKEN_CURRENT, `ATLAS_ASSET_TOKEN=${token || "—"}`),
      check("Runtime Truth", !!truth && truth.pass === true, truth ? `pass=${String(truth.pass)} · app=${truth.app_build || "—"} · html=${truth.html_build || "—"}` : "runtime truth indisponible"),
      check("Meta atlas-build", meta("atlas-build") === BUILD_CURRENT, `meta=${meta("atlas-build") || "—"}`),
      check("Meta administrator-build", meta("administrator-build") === BUILD_CURRENT, `meta=${meta("administrator-build") || "—"}`),
      check("Meta asset token", meta("atlas-asset-token") === TOKEN_CURRENT, `meta=${meta("atlas-asset-token") || "—"}`),
      check("Engine lock", meta("atlas-engine-build") === ENGINE_CURRENT, `engine=${meta("atlas-engine-build") || "—"}`),
      check("DOM build identity", bodyBuild === BUILD_CURRENT || rootBuild === BUILD_CURRENT, `body=${bodyBuild || "—"} · html=${rootBuild || "—"}`),
      check("Cache-busters JS", cache.stale.length === 0 && cache.rows.length === 13, cache.stale.length ? `${cache.stale.length} script(s) local(aux) avec version obsolète` : `${cache.rows.length} script(s) locaux alignés`),
      check("Cache-busters CSS admin", styles.every(row => row.count === 1 && row.current), styles.map(row => `${row.name}:${row.count === 1 && row.current ? "OK" : row.raw}`).join(" · ")),
      check("Ordre des scripts", order.unique && order.ordered, order.unique ? (order.ordered ? "13/13 scripts uniques dans l’ordre canonique" : "ordre de chargement non canonique") : "script absent ou dupliqué"),
      check("Noms modules canoniques", canonicalModuleFilenameContract().ok, canonicalModuleFilenameContract().detail),
      check("Market Memory 39.4.4R1", typeof globalThis.atlasMarketMemoryStats3944R1 === "function" && hasScriptSuffix("/js/market-memory-collector.js"), "API stats + script unique"),
      check("Core identité/temps mémoire", typeof atlasMemoryCanonicalSnapshotId === "function" && typeof atlasMemoryRecordTime === "function", "résolveurs canoniques du Core disponibles"),
      check("Analytical Memory 39.4", typeof globalThis.atlasAnalyticalMemoryStats394 === "function" && hasScriptSuffix("/js/analytical-memory.js"), "API stats + script unique"),
      check("Dual Memory 39.5", !!globalThis.atlasDecisionBoardDualMemory3950 && hasScriptSuffix("/js/decision-board.js"), "API + script unique"),
      check("Retrospective 39.6", hasScriptSuffix("/js/retrospective-validation.js"), "script unique · état de données non bloquant"),
      check("Multi-Collector 39.7", !!globalThis.atlasMultiCollectorConcordance3970 && hasScriptSuffix("/js/multi-collector-concordance.js"), "API + script unique"),
      check("Contrat Multi-Collector", readOnlyContractOk(multiContract), multiContract ? "lecture seule vérifiée" : "sentinelle absente"),
      check("Memory Health 39.8.0R2", !!globalThis.atlasMemoryHealth3980R2 && hasScriptSuffix("/js/memory-health-audit.js"), "Truth Repair API + script unique"),
      check("Contrat Memory Health", readOnlyContractOk(healthContract) && healthContract.verdicts_separated === true, healthContract ? "lecture seule + verdicts séparés" : "sentinelle absente"),
      check("Ancien Memory Health retiré", countScriptSuffix("/js/memory-health-audit-39.8.0.js") === 0, "aucun doublon du lecteur 39.8.0 initial"),
      check("Window Manager", hasScriptSuffix("/js/core/admin-window-manager.js"), "script unique"),
      check("Math Core réduit · mini-module flottant mobile",
        globalThis.ErithAdminWindowManager?.contract?.floating_minimize_compact_bar === true,
        "réduction flottante compacte · position restaurée après déplacement"),
      check("DirectFixed · propriétaire géométrie inline !important", directFixedGeometryOwnerContract().ok === true, directFixedGeometryOwnerContract().detail),
      check("Déplacement · détacher + glisser sans perdre la prise", detachDragContinuityContract().ok === true, detachDragContinuityContract().detail),
      check("Shells flottantes · body + placeholder + auto-fit contenu/chrome", globalFloatingShellContract().ok === true, globalFloatingShellContract().detail),
      check("Aucun override chrome R1/R2 chargé", forbiddenOverrides.length === 0, forbiddenOverrides.length ? forbiddenOverrides.map(row => row.raw).join(" · ") : "anciens overrides R1/R2 absents"),
      check("Base CSS historique lisible", chromeCss.ok === true, chromeCss.detail || "contrat CSS historique absent"),
      check("Menu métallique uniforme", uniformMenuCss.ok === true, uniformMenuCss.detail || "contrat uniforme absent"),
      check("Aucun CSS destructeur des menus", destructiveMenuHideRules().length === 0, destructiveMenuHideRules().length ? destructiveMenuHideRules().join(" · ") : "aucun display:none sur les menus opérationnels"),
      check("Graphique direct window controls", !!graphChrome && graphChrome.complete && graphChrome.interactive, graphChrome ? `5/5=${String(graphChrome.complete)} · interactif=${String(graphChrome.interactive)} · opacity runtime=${Number.isFinite(graphChrome.computedOpacity) ? graphChrome.computedOpacity.toFixed(2) : "—"}` : "chrome Graphique absent"),
      check("Graphique · historique pur + LIVE hors canvas",
        graphStability?.build === BUILD_CURRENT
          && graphStability?.contract?.atomic_cache_to_direct === true
          && graphStability?.contract?.preserve_visible_comparison_until_complete === true
          && graphStability?.contract?.reuse_existing_comparison_chart === true
          && graphStability?.contract?.single_resize_owner === "atlasScheduleStableChartResize"
          && graphStability?.contract?.geometry_guard === true
          && graphStability?.contract?.live_websocket_canvas_updates === false
          && graphStability?.contract?.collector_canvas_updates === false
          && graphStability?.contract?.live_endpoint_commit_scope === "disabled"
          && graphStability?.contract?.synthetic_terminal_point === false
          && graphStability?.contract?.live_top5_presentation_outside_canvas === true
          && graphStability?.contract?.virtual_live_tooltip_endpoint === true
          && graphStability?.contract?.websocket_canvas_mutation === false,
        graphStability
          ? `transactions=${Number(graphStability.metrics?.atomic_refresh_transactions || 0)} · commits=${Number(graphStability.metrics?.atomic_refresh_commits || 0)} · live-render=${Number(graphStability.metrics?.live_endpoint_render_commits || 0)} · live-ui=${Number(graphStability.metrics?.live_presentation_refreshes || 0)} · blocked=${Number(graphStability.metrics?.live_endpoint_blocked_calls || 0)} · resize=${Number(graphStability.metrics?.resize_executed || 0)}/${Number(graphStability.metrics?.resize_requested || 0)} · skip=${Number(graphStability.metrics?.resize_skipped || 0)}`
          : `contrat stabilité graphique ${BUILD_CURRENT} absent`),
      check("Graphique · renderer vertical canonique + Metal illuminé",
        verticalBars?.build === BUILD_CURRENT
          && verticalBars?.geometry_source === "39.2.11"
          && verticalBars?.metal_paint_source === "39.2.21"
          && verticalBars?.verified_commit === "1e6664505b2e3401e34639f0bb88aa121093103b"
          && verticalBars?.geometry === "bottom-to-curve-point-by-point"
          && verticalBars?.baseline === "chartArea.bottom"
          && Number(verticalBars?.height_ratio) === 0.88
          && verticalBars?.base_metal?.solo?.color === "#5f7f92"
          && Number(verticalBars?.base_metal?.solo?.opacity) === 0.115
          && verticalBars?.base_metal?.comparison?.color === "#587488"
          && Number(verticalBars?.base_metal?.comparison?.lead_opacity) === 0.085
          && verticalBars?.illumination?.enabled === true
          && verticalBars?.illumination?.composite === "screen"
          && verticalBars?.illumination?.geometry_changed === false
          && verticalBars?.synthetic_live_endpoint === false
          && verticalBars?.websocket_canvas_rescale === false,
        verticalBars ? `géométrie=${verticalBars.geometry_source} · base=${verticalBars.metal_paint_source} · illumination=${verticalBars.illumination?.composite}` : "contrat renderer vertical 40.1.52 absent"),
      check("Lecture technique · case 24 h vert pomme + chiffre vert fluo", !!byId("atlasOracleOverlay40148") && /#72ffb2/i.test(byId("atlasOracleOverlay40148")?.textContent || ""), "case positive entière renforcée · chiffre positif #72ffb2 restauré"),
      check("Versioning · propagation GitHub informative", /stateMode === \"syncing\"[\s\S]{0,260}classList\.add\(\"ok\"\)/.test(String(globalThis.atlasVersionControlState || "")), "syncing utilise la famille visuelle ok/verte, pas warn/rouge"),
      check("Math Core · commandes inline dans l’en-tête", document.querySelector?.("#math .atlas-math-dock-actions[data-math-inline-window-controls=\"40148\"]"), "[⠿][−][□][↗][×] | Dessus · Latéral · Réduire sur une seule ligne"),
      check("Oracle V1 · buffer LIVE micro borné", !!oracleV1 && /live micro/i.test(String(oracleV1.live_micro_buffer || "")), "20 min max · mémoire session · aucun write mainChart"),
      check("Oracle V1 · TOP 5 agrégé", !!oracleV1?.top5_aggregate_focus, "focus agrégé + focus BTC/ETH/BNB/XRP/SOL"),
      check("Oracle V1 · zoom visuel isolé", Array.isArray(oracleV1?.visual_zoom) && oracleV1.visual_zoom.includes("4x") && oracleV1.visual_zoom_data_mutation === false && oracleV1.visual_zoom_score_mutation === false && oracleV1.visual_zoom_main_chart_mutation === false, "AUTO/×1/×2/×4 · ancre MAINTENANT · zéro mutation data/score/mainChart"),
      check("Oracle V1 · multivue + canvas séparé",
        oracleV1?.build === BUILD_CURRENT
          && oracleV1?.mode === "historical-tail-to-multiview-interpretative-continuation"
          && oracleV1?.overlay_on_main_chart === true
          && oracleV1?.historical_tail_read_only === true
          && Array.isArray(oracleV1?.views)
          && oracleV1.views.join(",") === "continuation,top5"
          && Array.isArray(oracleV1?.horizons)
          && oracleV1.horizons.join(",") === "1m,5m,15m"
          && oracleV1?.default_view === "continuation"
          && oracleV1?.default_horizon === "5m"
          && oracleV1?.separate_canvas === true
          && oracleV1?.main_chart_mutation === false
          && oracleV1?.main_chart_dataset_write === false
          && oracleV1?.historical_canvas_mutation === false
          && oracleV1?.synthetic_future_prices === false
          && oracleV1?.prediction === false
          && oracleV1?.financial_advice === false
          && !!byId("atlasOracleV0")
          && !!byId("atlasOracleCanvas")
          && !!byId("atlasOracleViewLabel")
          && byId("atlasOracleCanvas") !== byId("mainChart"),
        oracleV1 ? `${oracleV1.mode} · continuation/top5 · 1m/5m/15m · overlay read-only` : "contrat Oracle V1 absent"),
      check("Target Top direct window controls", !!targetChrome && targetChrome.complete && targetChrome.interactive, targetChrome ? `5/5=${String(targetChrome.complete)} · interactif=${String(targetChrome.interactive)} · opacity runtime=${Number.isFinite(targetChrome.computedOpacity) ? targetChrome.computedOpacity.toFixed(2) : "—"}` : "chrome Target Top absent"),
      check("Market Flow direct window controls", !!flowChrome && flowChrome.complete && flowChrome.interactive, flowChrome ? `5/5=${String(flowChrome.complete)} · interactif=${String(flowChrome.interactive)} · opacity runtime=${Number.isFinite(flowChrome.computedOpacity) ? flowChrome.computedOpacity.toFixed(2) : "—"}` : "chrome Market Flow absent"),
      check("Market Flow · déplacement Target Top + viewport interne adapté", marketFlowFloatParityContract().ok === true, marketFlowFloatParityContract().detail),
      check("Market Snapshot direct window controls", !!marketChrome && marketChrome.complete && marketChrome.interactive, marketChrome ? `5/5=${String(marketChrome.complete)} · interactif=${String(marketChrome.interactive)} · opacity runtime=${Number.isFinite(marketChrome.computedOpacity) ? marketChrome.computedOpacity.toFixed(2) : "—"}` : "chrome Market Snapshot absent"),
      check("Market Snapshot · shell flottante globale", marketSnapshotBodyPortalContract().ok === true, marketSnapshotBodyPortalContract().detail),
      check("Math Core direct window controls", !!mathChrome && mathChrome.complete && mathChrome.interactive, mathChrome ? `5/5=${String(mathChrome.complete)} · interactif=${String(mathChrome.interactive)} · opacity runtime=${Number.isFinite(mathChrome.computedOpacity) ? mathChrome.computedOpacity.toFixed(2) : "—"}` : "chrome Math Core absent"),
      check("Menus familles Administrator · 5 boutons non rognés", familyChromeLayoutOk,
        familyChromes.length
          ? familyChromes.map(row => row.state?.rendered
              ? `${row.title}:5/5=${String(!!row.state?.complete)} · visible=true · pos=${row.state?.position || "—"} · width=${Math.round(row.state?.width || 0)}px · layout=${String(!!row.state?.layoutOk)}`
              : `${row.title}:5/5=${String(!!row.state?.complete)} · visible=false · géométrie non mesurée (vue courante)`
            ).join(" · ")
          : "aucun chrome famille détecté"),
      check("Lecture technique", !!byId("detailPanel") && !!byId("detailPanelBody"), "ancrages DOM présents"),
      check("Lecture technique · géométrie Classic propriétaire", technicalReadingGeometryOwnerContract().ok === true, technicalReadingGeometryOwnerContract().detail),
      check("Near-zero glass lock", technicalReadingGlassContract().ok === true, technicalReadingGlassContract().detail),
      check("Fiche Crypto native · Flottante / Latérale", cryptoCard.ok === true, cryptoCard.detail),
      check("Workspace marché", !!byId("market-workspace") && !!byId("analyste"), "ancrages marché/graphe présents"),
      check("Layout repair courant", !!globalThis.atlasAdministratorLayoutRepair3990R2 && hasScriptSuffix("/js/layout-repair.js"), "module DOM final + script unique"),
      check("Contrat Layout repair", readOnlyContractOk(layoutContract), layoutContract ? "DOM uniquement · lecture seule · zéro pipeline" : "sentinelle absente"),
      check("Accueil compact lock", !byId("administratorMirrorIdentity"), "aucune ligne Administrator Mirror supplémentaire dans le header"),
      check("Decision Memory canonique", !!board && !!primaryMemory && primaryMemory.parentElement === board, "decisionMemoryV2 reste dans sa zone canonique"),
      check("Host mémoire auxiliaire", !!board && !!auxHost && auxHost.parentElement === board, "host R2 unique sous Decision Board"),
      check("Dual Memory isolée", !!auxHost && !!dualMemory && dualMemory.parentElement === auxHost, "Dual Memory 39.5 hors sélecteur direct-child decision-memory"),
      check("Rétrospective isolée", !!auxHost && !!retro && retro.parentElement === auxHost, "Retrospective 39.6 hors sélecteur direct-child decision-memory"),
      check("Collision de grille interdite", directMemoryRoots.length === 1 && directMemoryRoots[0]?.id === "decisionMemoryV2", `${directMemoryRoots.length} racine(s) .decision-memory-v2 directe(s) : ${directMemoryRoots.map(node => node.id || "sans-id").join(", ") || "aucune"}`),
      check("Layout state R2", !!layoutState && layoutState.direct_memory_root_count === 1 && layoutState.dual_isolated && layoutState.retrospective_isolated, layoutState ? "1 racine primaire · Dual + Retrospective isolées" : "état layout indisponible"),
      check("Ancien Freeze non chargé", countScriptSuffix("/js/architecture-freeze-39.9.0.js") === 0 && countScriptSuffix("/js/architecture-freeze-39.9.0R1.js") === 0 && countScriptSuffix("/js/architecture-freeze-39.9.0R2.js") === 0 && countScriptSuffix("/js/architecture-freeze-40.0.0.js") === 0, "anciens Freeze 39.9.0/R1/R2 non chargés"),
      check("Freeze singleton", hasScriptSuffix("/js/architecture-freeze.js"), "script diagnostic courant unique")
    ];

    if (health) {
      const structure = health?.verdicts?.structure || {};
      if (structure.code === "waiting") {
        checks.push(check(
          "État structure mémoire",
          false,
          `${structure.label || "EN ATTENTE"} · ${structure.detail || "aucun détail"}`,
          "warning"
        ));
      } else {
        checks.push(check(
          "État structure mémoire",
          structure.code === "healthy",
          `${structure.label || "INDISPONIBLE"} · ${structure.detail || "aucun détail"}`,
          "critical"
        ));
      }
      const coverage = health?.verdicts?.coverage || {};
      checks.push(check(
        "Couverture mémoire",
        coverage.code === "complete",
        `${coverage.label || "INDISPONIBLE"} · ${coverage.detail || "aucun détail"}`,
        "warning"
      ));
      const continuity = health?.verdicts?.continuity || {};
      checks.push(check(
        "Continuité de collecte",
        continuity.code === "observed",
        `${continuity.label || "INDISPONIBLE"} · ${continuity.detail || "aucun détail"}`,
        "warning"
      ));
    } else {
      checks.push(check("État structure mémoire", false, "Memory Health n’a pas retourné de diagnostic", "warning"));
    }

    if (multi) {
      checks.push(check(
        "Concordance multi-collecteur disponible",
        multi?.status?.code !== "insufficient",
        `${multi?.status?.label || "INDISPONIBLE"} · ${Number(multi?.pairCount || 0)} paire(s) comparable(s)`,
        "warning"
      ));
    }

    const criticalFails = checks.filter(row => row.severity === "critical" && !row.ok);
    const warnings = checks.filter(row => row.severity === "warning" && !row.ok);
    const pass = criticalFails.length === 0;
    const label = !pass
      ? "FREEZE REFUSÉ"
      : warnings.length
        ? "FREEZE PASS · LIMITES CONNUES"
        : "FREEZE PASS";

    return {
      build: BUILD_CURRENT,
      generatedAt: new Date().toISOString(),
      pass,
      label,
      checks,
      criticalFails,
      warnings,
      runtimeTruth: truth,
      health,
      multi,
      contract: `ARCHITECTURE GELÉE · RESERVED PLACEHOLDER + UNION GEOMETRY · AUCUNE MUTATION AUTOMATIQUE · ${BUILD_CURRENT} CANDIDAT À VALIDER DANS FIREFOX`
    };
  }

  function ensureRoot() {
    let root = byId(ROOT_ID);
    if (root) return root;
    const anchor = byId("atlasMemoryHealth3980") || byId("atlasMemoryIntelligence");
    if (!anchor) return null;

    root = document.createElement("section");
    root.id = ROOT_ID;
    root.className = "atlas-memory-intelligence";
    root.dataset.state = "waiting";
    root.setAttribute("aria-labelledby", "architectureFreezeTitle");
    root.innerHTML = `
      <div class="atlas-memory-intelligence-head">
        <div>
          <p class="eyebrow">ADMINISTRATOR CONSOLIDATION · ${BUILD_CURRENT} · READ ONLY</p>
          <h5 id="architectureFreezeTitle">Contrôle final ${BUILD_CURRENT}</h5>
          <p>Vérifie que les briques validées sont présentes, alignées et non contradictoires. Aucun correctif automatique.</p>
        </div>
        <span class="pill warn" id="architectureFreezeBadge">En attente</span>
      </div>
      <div class="atlas-memory-ledger-35">
        <article><span>Contrôles</span><b id="architectureFreezeCount">—</b><small>PASS réellement exécutés dans ce navigateur.</small></article>
        <article><span>Critiques</span><b id="architectureFreezeCritical">—</b><small>Un seul FAIL critique invalide le candidat stable.</small></article>
        <article><span>Limites</span><b id="architectureFreezeWarnings">—</b><small>Couverture ou données manquantes : visibles mais non maquillées en panne.</small></article>
        <article><span>Verdict</span><b id="architectureFreezeState">—</b><small>Préflight local ${BUILD_CURRENT} ; validation Firefox opérateur requise.</small></article>
      </div>
      <div class="atlas-memory-intelligence-grid" id="architectureFreezeGrid"></div>
      <div class="atlas-memory-intelligence-actions">
        <button type="button" id="btnArchitectureFreezeRefresh">Relancer le contrôle</button>
        <button type="button" id="btnArchitectureFreezeExport">Exporter Freeze Audit .md</button>
      </div>
      <p id="architectureFreezeContract">Aucun verdict tant que le préflight n’a pas été exécuté.</p>`;

    anchor.insertAdjacentElement("afterend", root);
    byId("btnArchitectureFreezeRefresh")?.addEventListener("click", render);
    byId("btnArchitectureFreezeExport")?.addEventListener("click", exportMarkdown);
    return root;
  }

  function render() {
    const root = ensureRoot();
    if (!root) return null;
    const data = derive();
    const passed = data.checks.filter(row => row.ok).length;
    setText("architectureFreezeCount", `${passed}/${data.checks.length} PASS`);
    setText("architectureFreezeCritical", data.criticalFails.length ? `${data.criticalFails.length} FAIL` : "0 FAIL");
    setText("architectureFreezeWarnings", data.warnings.length ? `${data.warnings.length} limite(s)` : "0");
    setText("architectureFreezeState", data.label);
    setText("architectureFreezeContract", data.pass
      ? `${BUILD_CURRENT} : Freeze courant. Le verrou graphique hérité de 40.1.23 conserve le canvas historique pur et sans endpoint synthétique. 40.1.52 conserve le renderer canonique 39.2.11 / Metal 39.2.21, ajoute une passe lumineuse paint-only, une case 24 h vert pomme et Oracle V1 multivue sur canvas séparé. Le canvas historique principal reste pur. Math Core conserve ses métriques historiques ; sa barre complète de commandes est ancrée dans son en-tête et les barres minimisées disposent d’un verrou de restauration interactif. Market Flow, mémoires, sources et pipeline Atlas/NØX/Aerith restent inchangés.`
      : "CANDIDAT REFUSÉ : corriger les FAIL critiques avant validation stable.");

    const badge = byId("architectureFreezeBadge");
    if (badge) {
      badge.textContent = data.label;
      badge.className = `pill ${data.pass ? (data.warnings.length ? "warn" : "ok") : "fail"}`;
    }

    const grid = byId("architectureFreezeGrid");
    if (grid) {
      const nodes = data.checks.map(row => {
        const article = document.createElement("article");
        const state = row.ok ? "PASS" : row.severity === "critical" ? "FAIL" : "LIMITE";
        article.dataset.state = row.ok ? "ok" : row.severity === "critical" ? "fail" : "warn";
        article.innerHTML = `<span></span><b>${state}</b><small></small>`;
        article.querySelector("span").textContent = row.name;
        article.querySelector("small").textContent = row.detail;
        return article;
      });
      grid.replaceChildren(...nodes);
    }

    root.dataset.state = data.pass ? (data.warnings.length ? "prudent" : "ready") : "fail";
    root.dataset.build = BUILD_CURRENT;
    root.dataset.criticalFails = String(data.criticalFails.length);
    root.dataset.warnings = String(data.warnings.length);
    return data;
  }

  function markdown(data = derive()) {
    const lines = [
      `# Agent-Crypto — Administrator Consolidation ${BUILD_CURRENT}`, "",
      `- Généré : ${data.generatedAt}`,
      `- Verdict : ${data.label}`,
      `- FAIL critiques : ${data.criticalFails.length}`,
      `- Limites connues : ${data.warnings.length}`, "",
      "## Contrôles", ""
    ];
    for (const row of data.checks) {
      const state = row.ok ? "PASS" : row.severity === "critical" ? "FAIL" : "LIMITE";
      lines.push(`- ${state} · ${row.name} · ${row.detail}`);
    }
    lines.push(
      "", `## Validation finale ${BUILD_CURRENT}`, "",
      "- 0 FAIL critique requis.",
      "- Les limites de couverture/continuité peuvent rester visibles si elles ne sont pas des défauts structurels.",
      "- Les contrôles Versioning/Math Core ne disposent plus d’un passe-droit `|| true` : leur PASS exige désormais la condition réelle.",
      "- Ce candidat ajoute uniquement l’observabilité runtime passive 40.2.15 ; aucune cadence, décision métier ni autorité de stockage n’est modifiée.",
      `- Le candidat ${BUILD_CURRENT} exige une validation réelle dans Firefox après publication opérateur.`,
      "- Aucun ordre financier, aucune recommandation et aucune réparation automatique ne sont produits par ce module."
    );
    return lines.join("\n");
  }

  function exportMarkdown() {
    const body = markdown();
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const buildSlug = BUILD_CURRENT.replace(/\./g, "_");
    const name = `agent_crypto_architecture_freeze_${buildSlug}_${stamp}.md`;
    if (typeof globalThis.downloadTextFile === "function") {
      globalThis.downloadTextFile(name, "text/markdown;charset=utf-8", body);
      return body;
    }
    try {
      const blob = new Blob([body], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (_) {}
    return body;
  }


  // Keep the displayed Freeze verdict synchronized with the real Memory Health
  // lifecycle. No polling: we piggyback on the existing memory render chain and
  // on explicit operator refresh actions only.
  const baseMemoryIntelligenceRenderFreeze = typeof globalThis.atlasMemoryIntelligenceRender === "function"
    ? globalThis.atlasMemoryIntelligenceRender
    : null;
  if (baseMemoryIntelligenceRenderFreeze && !baseMemoryIntelligenceRenderFreeze.__architectureFreezeWrapped) {
    const wrapped = function atlasMemoryIntelligenceRenderFreeze(...args) {
      const result = baseMemoryIntelligenceRenderFreeze.apply(this, args);
      queueMicrotask(() => { try { render(); } catch (_) {} });
      return result;
    };
    try { Object.defineProperty(wrapped, "__architectureFreezeWrapped", { value: true }); } catch (_) {}
    globalThis.atlasMemoryIntelligenceRender = wrapped;
  }

  document.addEventListener("click", event => {
    const id = event?.target?.closest?.("button")?.id || "";
    if (id === "btnMemoryHealthRefresh3980R2" || id === "btnArchitectureFreezeRefresh") {
      queueMicrotask(() => { try { render(); } catch (_) {} });
    }
  });

  const freezeContract = Object.freeze({
    build: BUILD_CURRENT,
    role: "read-only recovery over protected Administrator architecture",
    feature_delta: false,
    repairs_automatically: false,
    writes_memory: false,
    starts_atlas: false,
    starts_nox: false,
    starts_aerith: false,
    starts_bridge: false,
    starts_ollama: false,
    new_fetch: false,
    new_timer: false,
    new_websocket: false
  });

  globalThis.__AGENT_CRYPTO_ARCHITECTURE_FREEZE__ = freezeContract;
  globalThis.atlasArchitectureFreeze = Object.freeze({ derive, render, markdown });

  queueMicrotask(() => { try { render(); } catch (_) {} });
  window.addEventListener("load", () => { try { render(); } catch (_) {} }, { once: true });
})();
