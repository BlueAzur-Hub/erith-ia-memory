/* Seven Portable Terminal — V7.7 Remaniement UI */

const TERMINAL_LINK = "https://blueazur-hub.github.io/erith-ia-memory/assets/SEVEN_PORTABLE_TERMINAL/index.html";
const CHATGPT_URL = "https://chatgpt.com/";

const BACKGROUNDS = [
  { name: "Historique original", family: "Historic Ruins", url: "./background_historique_lr.png" },
  { name: "Sky Bridge Ruins · temple", family: "Sky Bridge Ruins", url: "./atlas_29_sky_bridge_ruins_temple.jpg" },
  { name: "Sky Bridge Ruins · pont", family: "Sky Bridge Ruins", url: "./atlas_29_sky_bridge_ruins_pont.jpg" },
  { name: "Suspended City · temple", family: "Suspended City", url: "./atlas_29_suspended_city_temple.jpg" },
  { name: "Grand Tree Garden · arbre", family: "Grand Tree Garden", url: "./atlas_29_grand_tree_garden_arbre.jpg" },
  { name: "Crystal Sanctuary · cristal", family: "Crystal Sanctuary", url: "./atlas_29_crystal_sanctuary_cristal.jpg" },
  { name: "Historic Ruins · large", family: "Historic Ruins", url: "./atlas_29_historic_ruins_large.jpg" },
  { name: "Génie · holographique", family: "Génie", url: "./genie_bg_01_holographic_invocation_full.jpg" },
  { name: "Génie · lampe", family: "Génie", url: "./genie_bg_02_ai_librarian_lamp_full.jpg" },
  { name: "Génie · bibliothèque", family: "Génie", url: "./genie_bg_05_blue_library_flight.jpg" }
];

const AERITH_PROMPT = `Chat, active Aerith-7 Seven Heaven / Full Modules Boost.

Lis d’abord ce fichier RAW :
SEVEN_GATE — version RAW :
https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-notion-archive-private/main/core/SEVEN_GATE.md

Et ensuite lis ce fichier RAW :
AERITH_7_FULL_MODULES_BOOST — version RAW :
https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-notion-archive-private/main/core/AERITH_7_FULL_MODULES_BOOST.md

Puis lis ce module complémentaire RAW :
AERITH_7_VIDEO_CARDS_BOOST — version RAW :
https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-notion-archive-private/main/core/AERITH_7_VIDEO_CARDS_BOOST.md

Active Aerith-7 Seven Heaven comme opératrice de mémoire, de production et de discernement.

Mode Full Modules Boost intelligent.
Ne charge pas tout en entier.
Choisis uniquement les modules utiles selon la demande.

Puissance maximale.
Chargement minimal.
Choix précis.`;

const VIDEO_CARDS_PROMPT = `Chat, active Aerith-7 Seven Heaven — Video Cards Boost Production.

Réponds court :
1. Phase actuelle
2. Risque principal
3. Cartes utiles
4. Action immédiate
5. Point d’arrêt

Cartes utiles :
Chef d’Orchestre Vidéo.
Histoire de l’Art.
Géométrie du Plan.
LEGO Continuity.
Diagnostic Anti-Dérive Wan.
Format Téléphone / Shorts.
Psychologie du Plan.
Symbolique.
Sound Design / Voix / Silence.`;

const WAN_PROMPT = `WAN I2V — réglages validés :

width = 1080
height = 1920
frame_rate = 16
length = 81
batch_size = 1

image parfaite d’abord.
une animation = une idée.
caméra stable.
prompt positif obligatoire.
prompt négatif obligatoire.
last frame exacte pour continuité LEGO.
DaVinci pour le montage final.`;

const BLACKOUT_PROMPT = `Mode Blackout.

Texte uniquement.
Aucun outil image.
Aucune génération image.
Aucune action GitHub automatique.
Réponse courte, directe, opérationnelle.
On stabilise avant de modifier.`;

const MODULE_PROMPT = `Seven, ouvre le mode Modules Mémoire.

Sélectionne uniquement les modules utiles.
Puissance maximale.
Chargement minimal.
Choix précis.`;

const NOTION_TEXT = `Seven Portable Terminal

Terminal public :
${TERMINAL_LINK}

Usage :
1. Ouvrir le terminal.
2. Cliquer Seven Boost ou Video Cards.
3. ChatGPT s’ouvre ou revient.
4. Coller avec Ctrl+V.
5. Envoyer.

Règle :
Le terminal copie et appelle ChatGPT, mais le collage reste manuel.`;

let bgIndex = 0;
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function setStatus(message) {
  const el = $("#status");
  if (el) el.textContent = message;
  console.log("[Seven]", message);
}

async function copyText(text) {
  try {
    if (!navigator.clipboard || !window.isSecureContext) throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    const drawer = $("#promptDrawer");
    const area = $("#promptText");
    if (drawer && area) {
      area.value = text;
      drawer.classList.add("open");
      setTimeout(() => {
        area.focus();
        area.select();
      }, 30);
    } else {
      window.prompt("Copie ce texte :", text);
    }
    return false;
  }
}

function openChatGPTNamed() {
  const chat = window.open(CHATGPT_URL, "seven_heaven_chatgpt");
  if (chat) {
    try { chat.focus(); } catch {}
  }
  return !!chat;
}

async function startSeven() {
  await copyText(AERITH_PROMPT);
  openChatGPTNamed();
  setStatus("Seven Boost copié. ChatGPT appelé. Colle avec Ctrl+V, puis Entrée.");
}

async function copyVideoCards() {
  await copyText(VIDEO_CARDS_PROMPT);
  openChatGPTNamed();
  setStatus("Video Cards Boost copié. ChatGPT appelé. Colle avec Ctrl+V, puis Entrée.");
}

async function copySevenOnly() {
  await copyText(AERITH_PROMPT);
  setStatus("Prompt Seven copié.");
}

async function copyWan() {
  await copyText(WAN_PROMPT);
  setStatus("Checklist Wan copiée.");
}

async function copyBlackout() {
  await copyText(BLACKOUT_PROMPT);
  setStatus("Mode Blackout copié.");
}

async function copyModules() {
  await copyText(MODULE_PROMPT);
  setStatus("Prompt Modules copié.");
}

async function copyTerminalLink() {
  await copyText(TERMINAL_LINK);
  setStatus("Lien cockpit copié.");
}

async function copyNotionText() {
  await copyText(NOTION_TEXT);
  setStatus("Bloc Notion copié.");
}

function openPage(name) {
  $$(".page").forEach(page => page.classList.toggle("active", page.id === `page-${name}`));
  $$(".tab").forEach(tab => tab.classList.toggle("active", tab.dataset.page === name));
  document.body.dataset.page = name;
  setStatus("Page : " + name);
  if (name === "system") refreshSystem();
}

function setMode(mode) {
  const dark = mode === "dark";
  document.body.classList.toggle("mode-dark", dark);
  document.body.classList.toggle("mode-transparent", !dark);
  $("#transparentBtn")?.classList.toggle("active", !dark);
  $("#darkBtn")?.classList.toggle("active", dark);
  localStorage.setItem("seven_v77_mode", dark ? "dark" : "transparent");
  setStatus(dark ? "Mode sombre lisible actif." : "Mode transparent contrôlé actif.");
}

function toggleAdvanced(force) {
  const open = typeof force === "boolean" ? force : !document.body.classList.contains("show-advanced");
  document.body.classList.toggle("show-advanced", open);
  $("#advancedBtn")?.classList.toggle("active", open);
  localStorage.setItem("seven_v77_advanced", open ? "1" : "0");
  setStatus(open ? "Advanced Panels ouverts." : "Advanced Panels réduits.");
}

function toggleAtlas(force) {
  const open = typeof force === "boolean" ? force : !document.body.classList.contains("show-atlas");
  document.body.classList.toggle("show-atlas", open);
  if (open) renderAtlas();
  setStatus(open ? "Atlas ouvert." : "Atlas fermé.");
}

function togglePalette(force) {
  const palette = $("#palette");
  if (!palette) return;
  const open = typeof force === "boolean" ? force : !palette.classList.contains("open");
  palette.classList.toggle("open", open);
  palette.setAttribute("aria-hidden", open ? "false" : "true");
}

function togglePrompt(force) {
  const drawer = $("#promptDrawer");
  const area = $("#promptText");
  if (!drawer) return;
  const open = typeof force === "boolean" ? force : !drawer.classList.contains("open");
  if (area) area.value = AERITH_PROMPT;
  drawer.classList.toggle("open", open);
}

function applyBackground(index) {
  bgIndex = (index + BACKGROUNDS.length) % BACKGROUNDS.length;
  const bg = BACKGROUNDS[bgIndex];
  document.documentElement.style.setProperty("--active-bg", `url("${bg.url}")`);
  localStorage.setItem("seven_v77_bg", String(bgIndex));
  setStatus("Fond actif : " + bg.name);
}

function nextBackground() {
  applyBackground(bgIndex + 1);
}

function randomBackground() {
  applyBackground(Math.floor(Math.random() * BACKGROUNDS.length));
}

function nextFamily(family) {
  const indices = BACKGROUNDS.map((b, i) => ({ b, i })).filter(x => x.b.family === family);
  if (!indices.length) return;
  const current = indices.findIndex(x => x.i === bgIndex);
  const next = indices[(current + 1 + indices.length) % indices.length];
  applyBackground(next.i);
}

function renderAtlas() {
  const grid = $("#atlasGrid");
  if (!grid) return;
  grid.innerHTML = "";
  BACKGROUNDS.forEach((bg, i) => {
    const btn = document.createElement("button");
    btn.className = "atlas-card";
    btn.type = "button";
    btn.style.setProperty("--thumb", `url("${bg.url}")`);
    btn.innerHTML = `<strong>${bg.name}</strong><br><small>${bg.family}</small>`;
    btn.addEventListener("click", () => applyBackground(i));
    grid.appendChild(btn);
  });
}

function setAmbiance(name) {
  document.body.dataset.ambiance = name;
  localStorage.setItem("seven_v77_ambiance", name);
  setStatus("Ambiance : " + name);
}

function cycleAmbiance() {
  const list = ["sky", "crystal", "ruins", "night", "gold"];
  const current = document.body.dataset.ambiance || "sky";
  const next = list[(list.indexOf(current) + 1 + list.length) % list.length];
  setAmbiance(next);
}

function updateHeroFocus() {
  const x = $("#heroX")?.value || "50";
  const y = $("#heroY")?.value || "34";
  const zoom = $("#heroZoom")?.value || "100";
  document.documentElement.style.setProperty("--hero-x", `${x}%`);
  document.documentElement.style.setProperty("--hero-y", `${y}%`);
  document.documentElement.style.setProperty("--hero-zoom", `${zoom}%`);
  if ($("#heroXOut")) $("#heroXOut").textContent = `${x}%`;
  if ($("#heroYOut")) $("#heroYOut").textContent = `${y}%`;
  if ($("#heroZoomOut")) $("#heroZoomOut").textContent = `${zoom}%`;
  localStorage.setItem("seven_v77_hero", JSON.stringify({ x, y, zoom }));
}

function setHeroValues(x, y, zoom) {
  if ($("#heroX")) $("#heroX").value = x;
  if ($("#heroY")) $("#heroY").value = y;
  if ($("#heroZoom")) $("#heroZoom").value = zoom;
  updateHeroFocus();
}

function nudgeHero(dx, dy) {
  const x = Math.max(0, Math.min(100, Number($("#heroX")?.value || 50) + dx));
  const y = Math.max(0, Math.min(100, Number($("#heroY")?.value || 34) + dy));
  const z = Number($("#heroZoom")?.value || 100);
  setHeroValues(x, y, z);
}

function resetHero() {
  setHeroValues(50, 34, 100);
}

function toggleHeroFocus(force) {
  const open = typeof force === "boolean" ? force : !document.body.classList.contains("show-hero");
  document.body.classList.toggle("show-hero", open);
  $("#heroBtn")?.classList.toggle("active", open);
}

function saveFavorite() {
  const payload = {
    bgIndex,
    mode: document.body.classList.contains("mode-dark") ? "dark" : "transparent",
    ambiance: document.body.dataset.ambiance || "sky",
    advanced: document.body.classList.contains("show-advanced"),
    hero: {
      x: $("#heroX")?.value || "50",
      y: $("#heroY")?.value || "34",
      zoom: $("#heroZoom")?.value || "100"
    }
  };
  localStorage.setItem("seven_v77_favorite", JSON.stringify(payload));
  setStatus("Favori local sauvegardé.");
}

function loadFavorite() {
  try {
    const payload = JSON.parse(localStorage.getItem("seven_v77_favorite") || "null");
    if (!payload) throw new Error("no favorite");
    applyBackground(Number(payload.bgIndex || 0));
    setMode(payload.mode || "transparent");
    setAmbiance(payload.ambiance || "sky");
    toggleAdvanced(!!payload.advanced);
    if (payload.hero) setHeroValues(payload.hero.x, payload.hero.y, payload.hero.zoom);
    setStatus("Favori local chargé.");
  } catch {
    setStatus("Aucun favori local trouvé.");
  }
}

function clearFavorite() {
  localStorage.removeItem("seven_v77_favorite");
  setStatus("Favori local effacé.");
}

function resetVisual() {
  applyBackground(0);
  setMode("transparent");
  setAmbiance("sky");
  toggleAdvanced(false);
  toggleAtlas(false);
  toggleHeroFocus(false);
  resetHero();
  setStatus("État visuel réinitialisé.");
}

function browserName() {
  const ua = navigator.userAgent || "";
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome/")) return "Chrome";
  if (ua.includes("Safari/")) return "Safari";
  return "Navigateur";
}

function getTrace() {
  const now = new Date();
  return {
    date: now.toLocaleString("fr-FR"),
    os: navigator.platform || "OS inconnu",
    browser: browserName(),
    screen: `${screen.width}×${screen.height} · DPR ${window.devicePixelRatio || 1}`,
    viewport: `${window.innerWidth}×${window.innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Fuseau inconnu",
    languages: navigator.languages ? navigator.languages.join(", ") : navigator.language,
    cpu: navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} threads` : "non disponible",
    security: "SAFE TRACE · aucun RustDesk ID · aucun mot de passe"
  };
}

function traceCards(trace) {
  return `
    <article class="trace-card"><span>🖥️</span><small>Système</small><strong>${trace.os}</strong><em>${trace.date}</em></article>
    <article class="trace-card"><span>🌐</span><small>Navigateur</small><strong>${trace.browser}</strong><em>${trace.languages}</em></article>
    <article class="trace-card"><span>📐</span><small>Affichage</small><strong>${trace.screen}</strong><em>viewport ${trace.viewport}</em></article>
    <article class="trace-card"><span>🌍</span><small>Fuseau</small><strong>${trace.timezone}</strong><em>local</em></article>
    <article class="trace-card"><span>⚙️</span><small>Performance</small><strong>${trace.cpu}</strong><em>navigateur</em></article>
    <article class="trace-card"><span>🛡️</span><small>Sécurité</small><strong>SAFE TRACE</strong><em>aucun identifiant sensible</em></article>
  `;
}

function refreshSystem() {
  const trace = getTrace();
  if ($("#traceGrid")) $("#traceGrid").innerHTML = traceCards(trace);
  if ($("#systemGrid")) $("#systemGrid").innerHTML = traceCards(trace);
  if ($("#traceDate")) $("#traceDate").textContent = trace.date;
  if ($("#systemRaw")) {
    $("#systemRaw").value =
`SAFE TRACE ${trace.date}
Système : ${trace.os}
Navigateur : ${trace.browser}
Affichage : ${trace.screen}
Viewport : ${trace.viewport}
Fuseau : ${trace.timezone}
Langues : ${trace.languages}
Performance : ${trace.cpu}
Sécurité : ${trace.security}`;
  }
}

async function copySystemDiagnostics() {
  refreshSystem();
  await copyText($("#systemRaw")?.value || "SAFE TRACE");
  setStatus("Diagnostic système copié.");
}

function bindHelp() {
  $$("[data-help]").forEach(el => {
    el.addEventListener("mouseenter", () => {
      const text = $("#guidanceText");
      if (text) text.textContent = el.dataset.help;
    });
  });
}

function boot() {
  const bg = Number(localStorage.getItem("seven_v77_bg") || "0");
  bgIndex = Number.isFinite(bg) ? bg : 0;
  applyBackground(bgIndex);
  setMode(localStorage.getItem("seven_v77_mode") || "transparent");
  setAmbiance(localStorage.getItem("seven_v77_ambiance") || "sky");
  if (localStorage.getItem("seven_v77_advanced") === "1") toggleAdvanced(true);

  try {
    const hero = JSON.parse(localStorage.getItem("seven_v77_hero") || "null");
    if (hero) setHeroValues(hero.x, hero.y, hero.zoom);
  } catch {}

  renderAtlas();
  refreshSystem();
  bindHelp();

  document.addEventListener("keydown", (event) => {
    if (event.target && ["INPUT", "TEXTAREA"].includes(event.target.tagName)) return;
    const pages = { "1": "home", "2": "llm", "3": "notion", "4": "github", "5": "production", "6": "system" };
    if (pages[event.key]) openPage(pages[event.key]);
    if (event.key === "?") togglePalette();
    if (event.key === "Escape") {
      togglePalette(false);
      togglePrompt(false);
      toggleHeroFocus(false);
    }
  });

  window.addEventListener("resize", refreshSystem);
  setStatus("Seven Terminal V7.7 prêt.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
