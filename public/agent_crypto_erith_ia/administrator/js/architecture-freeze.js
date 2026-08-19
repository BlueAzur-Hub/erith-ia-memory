(() => {
  "use strict";

  /* ============================================================
     40.1.10 — TECHNICAL READING CLASSIC GEOMETRY OWNER RESTORE LOCK

     PURPOSE
     - Re-run the validated 39.x architecture checks under the current recovery identity.
     - Verify publication identity, runtime truth, module wiring,
       read-only contracts, script order, protected UI anchors, the single uniform metallic menu appearance for all Administrator window controls.
     - Report data-coverage limits as WARN, never as fake code failures.

     CONTRACT
     - NO feature delta to market analysis or memory semantics; Technical Reading geometry ownership only.
     - NO automatic repair.
     - NO memory write.
     - NO network request from this module.
     - NO Atlas / NØX / Aerith / Bridge / Ollama start.
     ============================================================ */

  const BUILD_CURRENT = "40.1.10";
  const ENGINE_CURRENT = "38.15.11";
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
      "./js/market-memory-39.3.js",
      "./js/analytical-memory-39.4.js",
      "./js/market-memory-39.4.4R1.js",
      "./js/decision-board-dual-memory-39.5.0.js",
      "./js/retrospective-validation-39.6.0.js",
      "./js/multi-collector-concordance-39.7.0.js",
      "./js/memory-health-audit-39.8.0R2.js",
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
    const root = [...host.children].find(node => node.classList?.contains("admin-native-controls")) || null;
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
    const rect = safe(() => root.getBoundingClientRect(), null);
    const hostRect = safe(() => host.getBoundingClientRect(), null);
    const layoutOk = !!style && style.position === "absolute"
      && !!rect && rect.width >= 120
      && !!hostRect && rect.left >= hostRect.left - 2 && rect.right <= hostRect.right + 2;
    return {
      root,
      buttons,
      complete: buttons.every(button => button instanceof HTMLButtonElement),
      interactive: !!style && style.display !== "none" && style.visibility !== "hidden" && style.pointerEvents !== "none",
      computedOpacity: Number.parseFloat(style?.opacity || "0"),
      position: String(style?.position || ""),
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
    const base = has(".admin-native-control-host > .admin-native-controls", 0.16, row => row.visibility === "visible" && row.pointer === "auto");
    const reveal = has(".admin-native-control-host:hover > .admin-native-controls", 0.82);
    const direct = has(".admin-native-control-host > .admin-native-controls:hover", 1);
    const graph = has("#analyste.admin-native-control-host > .admin-native-controls", 0.16);
    const target = has("#market-workspace .top5-ribbon.admin-native-control-host > .admin-native-controls", 0.16);
    const flow = has("#market-workspace .market-flow-ribbon.admin-native-control-host > .admin-native-controls", 0.16);
    return { ok:base && reveal && direct && graph && target && flow, detail:`rest=.16 · reveal=.82 · direct=1 · graph=${graph} · target=${target} · flow=${flow}` };
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
    const classic = document.querySelector('#analyste.champagne-clean-lens');
    const chart = classic?.querySelector(':scope > .chart-panel');
    const detail = classic?.querySelector(':scope > #detailPanel.clean-lens-detail-panel');
    if (!(classic instanceof HTMLElement) || !(chart instanceof HTMLElement) || !(detail instanceof HTMLElement)) {
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
          const selector = String(rule.selectorText || '');
          if (!selector.includes('#analyste')) continue;
          const style = rule.style;
          if (!style) continue;
          const geom = ['grid-template-columns','grid-template-rows','grid-column','grid-row','justify-self','align-self'];
          const used = geom.filter(name => String(style.getPropertyValue(name) || '').trim());
          if (used.length) offenders.push(`${selector} => ${used.join(',')}`);
        }
      };
      walk(rules);
    }
    const computed = getComputedStyle(classic);
    return {
      ok: offenders.length === 0 && computed.display === 'grid',
      detail: offenders.length ? offenders.join(' · ') : `Classic owner actif · grid=${computed.gridTemplateColumns || '—'}`
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
    const familyChromeLayoutOk = familyChromes.length >= 4 && familyChromes.every(row =>
      !!row.state && row.state.complete && row.state.interactive && row.state.layoutOk
    );
    const chromeCss = canonicalChromeCssContract();
    const uniformMenuCss = uniformMenuCssContract();
    const cryptoCard = cryptoCardContract();
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
      check("Market Memory 39.4.4R1", typeof globalThis.atlasMarketMemoryStats3944R1 === "function" && hasScriptSuffix("/js/market-memory-39.4.4R1.js"), "API stats + script unique"),
      check("Core identité/temps mémoire", typeof atlasMemoryCanonicalSnapshotId === "function" && typeof atlasMemoryRecordTime === "function", "résolveurs canoniques du Core disponibles"),
      check("Analytical Memory 39.4", typeof globalThis.atlasAnalyticalMemoryStats394 === "function" && hasScriptSuffix("/js/analytical-memory-39.4.js"), "API stats + script unique"),
      check("Dual Memory 39.5", !!globalThis.atlasDecisionBoardDualMemory3950 && hasScriptSuffix("/js/decision-board-dual-memory-39.5.0.js"), "API + script unique"),
      check("Retrospective 39.6", hasScriptSuffix("/js/retrospective-validation-39.6.0.js"), "script unique · état de données non bloquant"),
      check("Multi-Collector 39.7", !!globalThis.atlasMultiCollectorConcordance3970 && hasScriptSuffix("/js/multi-collector-concordance-39.7.0.js"), "API + script unique"),
      check("Contrat Multi-Collector", readOnlyContractOk(multiContract), multiContract ? "lecture seule vérifiée" : "sentinelle absente"),
      check("Memory Health 39.8.0R2", !!globalThis.atlasMemoryHealth3980R2 && hasScriptSuffix("/js/memory-health-audit-39.8.0R2.js"), "Truth Repair API + script unique"),
      check("Contrat Memory Health", readOnlyContractOk(healthContract) && healthContract.verdicts_separated === true, healthContract ? "lecture seule + verdicts séparés" : "sentinelle absente"),
      check("Ancien Memory Health retiré", countScriptSuffix("/js/memory-health-audit-39.8.0.js") === 0, "aucun doublon du lecteur 39.8.0 initial"),
      check("Window Manager", hasScriptSuffix("/js/core/admin-window-manager.js"), "script unique"),
      check("Aucun override chrome R1/R2 chargé", forbiddenOverrides.length === 0, forbiddenOverrides.length ? forbiddenOverrides.map(row => row.raw).join(" · ") : "anciens overrides R1/R2 absents"),
      check("Base CSS historique lisible", chromeCss.ok === true, chromeCss.detail || "contrat CSS historique absent"),
      check("Menu métallique uniforme", uniformMenuCss.ok === true, uniformMenuCss.detail || "contrat uniforme absent"),
      check("Aucun CSS destructeur des menus", destructiveMenuHideRules().length === 0, destructiveMenuHideRules().length ? destructiveMenuHideRules().join(" · ") : "aucun display:none sur les menus opérationnels"),
      check("Graphique direct window controls", !!graphChrome && graphChrome.complete && graphChrome.interactive, graphChrome ? `5/5=${String(graphChrome.complete)} · interactif=${String(graphChrome.interactive)} · opacity runtime=${Number.isFinite(graphChrome.computedOpacity) ? graphChrome.computedOpacity.toFixed(2) : "—"}` : "chrome Graphique absent"),
      check("Target Top direct window controls", !!targetChrome && targetChrome.complete && targetChrome.interactive, targetChrome ? `5/5=${String(targetChrome.complete)} · interactif=${String(targetChrome.interactive)} · opacity runtime=${Number.isFinite(targetChrome.computedOpacity) ? targetChrome.computedOpacity.toFixed(2) : "—"}` : "chrome Target Top absent"),
      check("Market Flow direct window controls", !!flowChrome && flowChrome.complete && flowChrome.interactive, flowChrome ? `5/5=${String(flowChrome.complete)} · interactif=${String(flowChrome.interactive)} · opacity runtime=${Number.isFinite(flowChrome.computedOpacity) ? flowChrome.computedOpacity.toFixed(2) : "—"}` : "chrome Market Flow absent"),
      check("Market Snapshot direct window controls", !!marketChrome && marketChrome.complete && marketChrome.interactive, marketChrome ? `5/5=${String(marketChrome.complete)} · interactif=${String(marketChrome.interactive)} · opacity runtime=${Number.isFinite(marketChrome.computedOpacity) ? marketChrome.computedOpacity.toFixed(2) : "—"}` : "chrome Market Snapshot absent"),
      check("Math Core direct window controls", !!mathChrome && mathChrome.complete && mathChrome.interactive, mathChrome ? `5/5=${String(mathChrome.complete)} · interactif=${String(mathChrome.interactive)} · opacity runtime=${Number.isFinite(mathChrome.computedOpacity) ? mathChrome.computedOpacity.toFixed(2) : "—"}` : "chrome Math Core absent"),
      check("Menus familles Administrator · 5 boutons non rognés", familyChromeLayoutOk,
        familyChromes.length
          ? familyChromes.map(row => `${row.title}:5/5=${String(!!row.state?.complete)} · pos=${row.state?.position || "—"} · width=${Math.round(row.state?.width || 0)}px · layout=${String(!!row.state?.layoutOk)}`).join(" · ")
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
      contract: "ARCHITECTURE GELÉE · AUCUNE MUTATION AUTOMATIQUE · 40.1.10 CANDIDAT À VALIDER DANS FIREFOX"
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
          <p class="eyebrow">ADMINISTRATOR CONSOLIDATION · 40.1.10 · READ ONLY</p>
          <h5 id="architectureFreezeTitle">Contrôle final 40.1.10</h5>
          <p>Vérifie que les briques validées sont présentes, alignées et non contradictoires. Aucun correctif automatique.</p>
        </div>
        <span class="pill warn" id="architectureFreezeBadge">En attente</span>
      </div>
      <div class="atlas-memory-ledger-35">
        <article><span>Contrôles</span><b id="architectureFreezeCount">—</b><small>PASS réellement exécutés dans ce navigateur.</small></article>
        <article><span>Critiques</span><b id="architectureFreezeCritical">—</b><small>Un seul FAIL critique invalide le candidat stable.</small></article>
        <article><span>Limites</span><b id="architectureFreezeWarnings">—</b><small>Couverture ou données manquantes : visibles mais non maquillées en panne.</small></article>
        <article><span>Verdict</span><b id="architectureFreezeState">—</b><small>Préflight local 40.1.10 ; validation Firefox opérateur requise.</small></article>
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
      ? "40.1.10 : Graphique, Target Top, Market Flow, Market Snapshot, Math Core, Fiche Crypto et les autres fenêtres Administrator partagent le même chrome métallique : .16 au repos, .82 au survol de la fenêtre, 1 au survol direct ; 5/5 actions conservées ; aucune règle display:none destructive. Les limites de couverture restent visibles ; aucune n’est transformée en faux défaut structurel."
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
      "# Agent-Crypto — Administrator Consolidation 40.1.10", "",
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
      "", "## Validation finale 40.1.10", "",
      "- 0 FAIL critique requis.",
      "- Les limites de couverture/continuité peuvent rester visibles si elles ne sont pas des défauts structurels.",
      "- Aucune nouvelle fonction n’a été ajoutée depuis le freeze 39.9.0R2 validé.",
      "- Le candidat 40.1.10 exige une validation réelle dans Firefox après publication opérateur.",
      "- Aucun ordre financier, aucune recommandation et aucune réparation automatique ne sont produits par ce module."
    );
    return lines.join("\n");
  }

  function exportMarkdown() {
    const body = markdown();
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const name = `agent_crypto_architecture_freeze_40_1_0_${stamp}.md`;
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
