(() => {
  "use strict";

  /* ============================================================
     39.9.0R1 — ADMINISTRATOR LAYOUT REPAIR

     PURPOSE
     - Preserve the compact home header: no extra identity line.
     - Isolate Retrospective Validation 39.6 from the Decision Board
       grid so it cannot overlap Decision Memory.

     CONTRACT
     - DOM placement only.
     - NO market or analytical logic change.
     - NO memory write or repair.
     - NO fetch, timer or WebSocket.
     - NO Atlas / NØX / Aerith / Bridge / Ollama start.
     ============================================================ */

  const BUILD = "39.9.0R1";
  const byId = id => document.getElementById(id);

  function repair() {
    // Safety: remove the validation-only subtitle if an older cached admin
    // bootstrap created it before the current js/app.js became active.
    byId("administratorMirrorIdentity")?.remove();

    const board = byId("decision-board");
    const retro = byId("decisionRetrospective3960");
    let moved = false;

    // 39.6 intentionally uses the generic .decision-memory-v2 visual class.
    // The Administrator stylesheet assigns direct children with that class
    // to the Decision Memory grid area. Move only the retrospective root
    // outside #decision-board; its content and read-only logic remain intact.
    if (board && retro && board.contains(retro)) {
      board.insertAdjacentElement("afterend", retro);
      moved = true;
    }

    if (retro) {
      retro.dataset.layoutRepair = BUILD;
      retro.dataset.layoutRole = "retrospective-isolated";
      retro.classList.add("atlas-retrospective-isolated");
    }

    document.documentElement.dataset.compactHomeLock = BUILD;

    return Object.freeze({
      build: BUILD,
      home_compact: !byId("administratorMirrorIdentity"),
      decision_board_present: !!board,
      retrospective_present: !!retro,
      retrospective_isolated: !!(board && retro && !board.contains(retro)),
      moved
    });
  }

  const contract = Object.freeze({
    build: BUILD,
    role: "Administrator compact-home + retrospective DOM isolation repair",
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
    css_modified: false
  });

  const api = Object.freeze({ repair, contract });
  globalThis.__AGENT_CRYPTO_LAYOUT_REPAIR_3990R1__ = contract;
  globalThis.atlasAdministratorLayoutRepair3990R1 = api;

  // Synchronous attempt + microtask/load safety. No polling/timer.
  try { repair(); } catch (_) {}
  queueMicrotask(() => { try { repair(); } catch (_) {} });
  window.addEventListener("load", () => { try { repair(); } catch (_) {} }, { once: true });
})();
