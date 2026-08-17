(() => {
  "use strict";

  /* 39.4.5R2 — VISUAL VISIBILITY LOCK
     Assets are pre-installed on GitHub. This layer only exposes them.
     No fetch, no timer, no WebSocket, no Market/Atlas/Memory write. */

  const BUILD = "39.4.5R2";
  const DB_NAME = "agent_crypto_private_visuals";
  const DB_VERSION = 1;
  const STORE = "visual_slots";
  const TECH_KEY = "technical-reading";
  let techObjectUrl = null;

  const STRIPS = Object.freeze([
    {
      id:"sources",
      file:"./assets/visual/admin-sources-archive.png",
      kicker:"SOURCES / ARCHIVE",
      title:"Provenance, archives et diagnostics",
      copy:"Le coffre de données identifie la couche Sources sans masquer les cartes existantes."
    },
    {
      id:"backend",
      file:"./assets/visual/admin-system-core.png",
      kicker:"SYSTEM CORE",
      title:"Architecture privée et moteur système",
      copy:"Le noyau système reste une signature visuelle ; aucune logique backend n’est modifiée."
    },
    {
      id:"planning",
      file:"./assets/visual/admin-projects-orchestration.png",
      kicker:"PROJECTS / ORCHESTRATION",
      title:"Modules, dépendances et projets",
      copy:"Le hub multi-branches représente l’orchestration sans modifier les plans Exchange."
    },
    {
      id:"atlasAnalyticalMemory394",
      file:"./assets/visual/admin-analytical-memory.png",
      kicker:"ANALYTICAL MEMORY",
      title:"CURRENT fermés et mémoire analytique",
      copy:"Le cristal vertical distingue clairement Analytical Memory de Market Memory.",
      className:"is-analytical"
    }
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
      return true;
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
    } else host.style.removeProperty("--admin-private-tech-image");
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
      const record = {id:TECH_KEY, blob:file, mime:file.type, name:file.name, framing:{x:50,y:18}, updated_at:new Date().toISOString()};
      const ok = await writeSlot(record).catch(() => false);
      if (ok) { setTechImage(file, record.framing); ensureTools(); }
    });
    return input;
  }
  async function setupTechnicalReading() {
    const host = visualHost();
    if (!host || host.dataset.adminPrivateVisualBound === "1") return;
    host.dataset.adminPrivateVisualBound = "1";
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

  function targetHead(section, id) {
    if (id === "planning") return section.querySelector(".exchange-plan > .section-head");
    return section.querySelector(":scope > .section-head, :scope > .atlas-memory-intelligence-head");
  }
  function targetContainer(section, id) {
    if (id === "planning") return section.querySelector(".exchange-plan") || section;
    return section;
  }
  function addSummaryThumb(section, spec) {
    const details = section.closest("details.atlas-collapse");
    const summary = details?.querySelector(":scope > summary.atlas-collapse-summary");
    if (!summary || summary.querySelector(`.admin-visual-summary-thumb[data-for="${spec.id}"]`)) return;
    const img = document.createElement("img");
    img.className = "admin-visual-summary-thumb";
    img.dataset.for = spec.id;
    img.src = spec.file;
    img.alt = "";
    img.setAttribute("aria-hidden","true");
    img.loading = "lazy";
    img.decoding = "async";
    summary.appendChild(img);
  }
  function addStrip(spec) {
    const section = document.getElementById(spec.id);
    if (!section) return false;
    addSummaryThumb(section, spec);
    if (section.querySelector(`.admin-visual-strip[data-for="${spec.id}"]`)) return true;
    const container = targetContainer(section, spec.id);
    const head = targetHead(section, spec.id);
    if (!container || !head) return false;
    const strip = document.createElement("div");
    strip.className = `admin-visual-strip ${spec.className || ""}`.trim();
    strip.dataset.for = spec.id;
    strip.innerHTML = `<div class="admin-visual-strip-copy"><small>${spec.kicker}</small><b>${spec.title}</b><span>${spec.copy}</span></div><img src="${spec.file}" alt="" aria-hidden="true" loading="lazy" decoding="async">`;
    head.insertAdjacentElement("afterend", strip);
    return true;
  }
  function addCommandHero() {
    const section = document.getElementById("commandes");
    if (!section) return false;
    const details = section.closest("details.atlas-collapse");
    const summary = details?.querySelector(":scope > summary.atlas-collapse-summary");
    if (summary && !summary.querySelector('.admin-visual-summary-thumb[data-for="commandes"]')) {
      const thumb = document.createElement("img");
      thumb.className = "admin-visual-summary-thumb";
      thumb.dataset.for = "commandes";
      thumb.src = "./assets/visual/admin-system-core.png";
      thumb.alt = "";
      thumb.setAttribute("aria-hidden","true");
      summary.appendChild(thumb);
    }
    if (section.querySelector(".admin-visual-command-hero")) return true;
    const head = section.querySelector(":scope > .section-head");
    if (!head) return false;
    const hero = document.createElement("div");
    hero.className = "admin-visual-command-hero";
    hero.setAttribute("aria-hidden","true");
    head.insertAdjacentElement("afterend", hero);
    return true;
  }

  function decorate() {
    let complete = true;
    for (const spec of STRIPS) complete = addStrip(spec) && complete;
    complete = addCommandHero() && complete;
    return complete;
  }

  function start() {
    void setupTechnicalReading();
    const done = decorate();
    if (!done) {
      const observer = new MutationObserver(() => {
        void setupTechnicalReading();
        if (decorate()) observer.disconnect();
      });
      observer.observe(document.body, {childList:true, subtree:true});
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, {once:true});
  else start();

  try {
    globalThis.__AGENT_CRYPTO_ADMIN_VISUAL_3945R2__ = Object.freeze({
      build:BUILD,
      visual_only:true,
      assets_preinstalled:true,
      images_in_patch:false,
      private_visual_db:DB_NAME,
      core_rewrite:false,
      market_memory_write:false,
      new_fetch:false,
      new_timer:false,
      new_websocket:false,
      starts_atlas:false
    });
  } catch (_) {}
})();
