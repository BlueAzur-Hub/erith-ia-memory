(() => {
  "use strict";

  /* ============================================================
     39.9.0R2 — ADMINISTRATOR MEMORY LAYOUT FINAL REPAIR

     PURPOSE
     - Preserve the compact Administrator home: no extra identity line.
     - Keep the original Decision Memory panel in its canonical grid area.
     - Move Dual Memory 39.5 and Retrospective 39.6 into one dedicated
       auxiliary host so no two .decision-memory-v2 roots can occupy the
       same direct-child grid area.

     CONTRACT
     - DOM placement only.
     - NO market or analytical logic change.
     - NO memory write or repair.
     - NO fetch, timer or WebSocket.
     - NO Atlas / NØX / Aerith / Bridge / Ollama start.
     ============================================================ */

  const BUILD = "39.9.0R2";
  const HOST_ID = "decisionAuxMemoryPanels3990R2";
  const byId = id => document.getElementById(id);

  function ensureHost(board) {
    if (!board) return null;
    let host = byId(HOST_ID);
    if (!host) {
      host = document.createElement("div");
      host.id = HOST_ID;
      host.dataset.layoutRepair = BUILD;
      host.dataset.layoutRole = "decision-aux-memory-host";
      host.setAttribute("aria-label", "Dual Memory et validation rétrospective isolées");
      // Inline layout only: no stylesheet file is changed or shipped.
      host.style.display = "grid";
      host.style.gridTemplateColumns = "minmax(0, 1fr)";
      host.style.gap = "14px";
      host.style.marginTop = "14px";
      host.style.minWidth = "0";
      host.style.width = "100%";
      host.style.gridColumn = "1 / -1";
      host.style.alignSelf = "stretch";
      board.appendChild(host);
    }
    return host;
  }

  function repair() {
    byId("administratorMirrorIdentity")?.remove();

    const board = byId("decision-board");
    const primary = byId("decisionMemoryV2");
    const dual = byId("decisionDualMemory395");
    const retro = byId("decisionRetrospective3960");
    const host = ensureHost(board);
    let movedDual = false;
    let movedRetro = false;

    // Canonical Decision Memory stays a direct child of #decision-board.
    // Only auxiliary readers are nested into HOST_ID, which prevents the
    // legacy direct-child selector from assigning all three to one grid area.
    if (host && dual && dual.parentElement !== host) {
      host.appendChild(dual);
      movedDual = true;
    }
    if (host && retro && retro.parentElement !== host) {
      host.appendChild(retro);
      movedRetro = true;
    }

    if (primary) {
      primary.dataset.layoutRepair = BUILD;
      primary.dataset.layoutRole = "decision-primary-memory";
    }
    if (dual) {
      dual.dataset.layoutRepair = BUILD;
      dual.dataset.layoutRole = "dual-memory-isolated";
      dual.classList.add("atlas-dual-memory-isolated");
    }
    if (retro) {
      retro.dataset.layoutRepair = BUILD;
      retro.dataset.layoutRole = "retrospective-isolated";
      retro.classList.add("atlas-retrospective-isolated");
    }

    document.documentElement.dataset.compactHomeLock = BUILD;
    document.documentElement.dataset.decisionMemoryLayoutLock = BUILD;

    const directMemoryRoots = board
      ? [...board.children].filter(node => node.classList?.contains("decision-memory-v2"))
      : [];

    return Object.freeze({
      build: BUILD,
      home_compact: !byId("administratorMirrorIdentity"),
      board_present: !!board,
      host_present: !!host,
      primary_present: !!primary,
      dual_present: !!dual,
      retrospective_present: !!retro,
      primary_direct_child: !!(board && primary && primary.parentElement === board),
      dual_isolated: !!(host && dual && dual.parentElement === host),
      retrospective_isolated: !!(host && retro && retro.parentElement === host),
      direct_memory_root_count: directMemoryRoots.length,
      direct_memory_root_ids: directMemoryRoots.map(node => node.id || "sans-id"),
      moved_dual: movedDual,
      moved_retrospective: movedRetro
    });
  }

  const contract = Object.freeze({
    build: BUILD,
    role: "Administrator compact-home + final Decision/Dual/Retrospective DOM isolation repair",
    feature_delta: false,
    visual_scope_only: true,
    writes_memory: false,
    repairs_memory: false,
    starts_atlas: false,
    starts_nox: false,
    starts_aerith: false,
    starts_bridge: false,
    starts_ollama: false,
    new_fetch: false,
    new_timer: false,
    new_websocket: false,
    images_shipped: 0,
    css_file_modified: false
  });

  const api = Object.freeze({ repair, contract });
  globalThis.__AGENT_CRYPTO_LAYOUT_REPAIR_3990R2__ = contract;
  globalThis.atlasAdministratorLayoutRepair3990R2 = api;

  try { repair(); } catch (_) {}
  queueMicrotask(() => { try { repair(); } catch (_) {} });
  window.addEventListener("load", () => { try { repair(); } catch (_) {} }, { once: true });
})();
