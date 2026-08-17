(() => {
  "use strict";

  /* ============================================================
     39.4.5R1 — ADMIN VISUAL ASSET LAYER REBASE
     Visual-only. No fetch, timer, WebSocket, Atlas or Market Memory writes.
     Private Technical Reading image is stored only in local IndexedDB.
     ============================================================ */

  const BUILD = "39.4.5R1";
  const DB_NAME = "agent_crypto_private_visuals";
  const DB_VERSION = 1;
  const STORE = "visual_slots";
  const TECH_KEY = "technical-reading";
  let techObjectUrl = null;

  const EMBLEMS = Object.freeze([
    { id:"sources", file:"./assets/visual/admin-sources-archive.png", label:"Sources / Archive" },
    { id:"backend", file:"./assets/visual/admin-system-core.png", label:"System Core" },
    { id:"planning", file:"./assets/visual/admin-projects-orchestration.png", label:"Projects / Orchestration" },
    { id:"atlasAnalyticalMemory394", file:"./assets/visual/admin-analytical-memory.png", label:"Analytical Memory", className:"is-analytical" }
  ]);

  function openDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath:"id" });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error("IndexedDB unavailable"));
    });
  }

  async function readSlot(id) {
    const db = await openDb();
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readonly");
        const req = tx.objectStore(STORE).get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error || new Error("Private visual read failed"));
      });
    } finally { db.close(); }
  }

  async function writeSlot(record) {
    const db = await openDb();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error || new Error("Private visual write failed"));
        tx.objectStore(STORE).put(record);
      });
      const verified = await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readonly");
        const req = tx.objectStore(STORE).get(record.id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error || new Error("Private visual verification failed"));
      });
      return !!(verified && verified.id === record.id && verified.blob instanceof Blob);
    } finally { db.close(); }
  }

  async function deleteSlot(id) {
    const db = await openDb();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error || new Error("Private visual delete failed"));
        tx.objectStore(STORE).delete(id);
      });
    } finally { db.close(); }
  }

  function visualHost() { return document.querySelector("#detailPanel .detail-project-visual"); }

  function setTechImage(blob = null, framing = null) {
    const host = visualHost();
    if (!host) return;
    if (techObjectUrl) { URL.revokeObjectURL(techObjectUrl); techObjectUrl = null; }
    if (blob instanceof Blob) {
      techObjectUrl = URL.createObjectURL(blob);
      host.style.setProperty("--admin-private-tech-image", `url("${techObjectUrl}")`);
    } else {
      host.style.removeProperty("--admin-private-tech-image");
    }
    host.style.setProperty("--admin-private-tech-x", `${Number(framing?.x ?? 50)}%`);
    host.style.setProperty("--admin-private-tech-y", `${Number(framing?.y ?? 18)}%`);
  }

  function ensureTools() {
    const host = visualHost();
    if (!host || document.getElementById("adminPrivateVisualTools")) return;
    const tools = document.createElement("div");
    tools.className = "admin-private-visual-tools";
    tools.id = "adminPrivateVisualTools";
    tools.innerHTML = '<button type="button" data-private-visual-action="default">Image par défaut</button><button type="button" data-private-visual-action="center">Recentrer</button>';
    host.insertAdjacentElement("afterend", tools);
    tools.addEventListener("click", async event => {
      const action = event.target?.dataset?.privateVisualAction;
      if (action === "default") {
        await deleteSlot(TECH_KEY).catch(() => null);
        setTechImage(null, {x:50,y:18});
      } else if (action === "center") {
        const record = await readSlot(TECH_KEY).catch(() => null);
        if (record?.blob) {
          record.framing = {x:50,y:18};
          record.updated_at = new Date().toISOString();
          await writeSlot(record).catch(() => false);
          setTechImage(record.blob, record.framing);
        }
      }
    });
  }

  function ensurePicker() {
    let input = document.getElementById("adminTechnicalPrivateImageInput");
    if (input) return input;
    input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.hidden = true;
    input.id = "adminTechnicalPrivateImageInput";
    document.body.appendChild(input);
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      input.value = "";
      if (!file || !String(file.type || "").startsWith("image/")) return;
      const record = { id:TECH_KEY, blob:file, mime:file.type, name:file.name, framing:{x:50,y:18}, updated_at:new Date().toISOString() };
      const ok = await writeSlot(record).catch(() => false);
      if (ok) {
        setTechImage(file, record.framing);
        ensureTools();
      }
    });
    return input;
  }

  async function setupTechnicalReading() {
    const host = visualHost();
    if (!host) return;
    host.removeAttribute("aria-hidden");
    host.setAttribute("role", "button");
    host.setAttribute("tabindex", "0");
    host.setAttribute("aria-label", "Changer l’image privée de Lecture technique");
    const open = () => ensurePicker().click();
    host.addEventListener("click", open);
    host.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); }
    });
    const saved = await readSlot(TECH_KEY).catch(() => null);
    if (saved?.blob) { setTechImage(saved.blob, saved.framing); ensureTools(); }
  }

  function appendEmblem(spec) {
    const section = document.getElementById(spec.id);
    if (!section || section.querySelector(':scope > .section-head .admin-visual-emblem, :scope > .atlas-memory-intelligence-head .admin-visual-emblem, .exchange-plan > .section-head .admin-visual-emblem')) return false;
    let head = null;
    if (spec.id === "planning") head = section.querySelector(".exchange-plan > .section-head");
    else head = section.querySelector(":scope > .section-head, :scope > .atlas-memory-intelligence-head");
    if (!head) return false;
    const img = document.createElement("img");
    img.className = `admin-visual-emblem ${spec.className || ""}`.trim();
    img.src = spec.file;
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    img.decoding = "async";
    img.loading = "lazy";
    const status = head.lastElementChild?.classList?.contains("pill") ? head.lastElementChild : null;
    if (status) head.insertBefore(img, status);
    else head.appendChild(img);
    return true;
  }

  function decorate() { EMBLEMS.forEach(appendEmblem); }

  function start() {
    decorate();
    void setupTechnicalReading();
    // Analytical Memory is inserted by its own isolated script after Market Memory.
    queueMicrotask(decorate);
    requestAnimationFrame(decorate);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once:true });
  else start();

  try {
    globalThis.__AGENT_CRYPTO_ADMIN_VISUAL_3945R1__ = Object.freeze({
      build:BUILD,
      visual_only:true,
      private_visual_db:DB_NAME,
      private_visual_store:STORE,
      core_rewrite:false,
      new_fetch:false,
      new_timer:false,
      starts_atlas:false
    });
  } catch (_) {}
})();
