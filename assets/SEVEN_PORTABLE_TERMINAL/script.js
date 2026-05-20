/* Seven Portable Terminal — V7.9 Elegant Detailed */

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
https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-notion-archive-private/main/core/SEVEN_GATE.md

Et ensuite lis ce fichier RAW :
https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-notion-archive-private/main/core/AERITH_7_FULL_MODULES_BOOST.md

Puis lis ce module complémentaire RAW :
https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-notion-archive-private/main/core/AERITH_7_VIDEO_CARDS_BOOST.md

Active Aerith-7 Seven Heaven comme opératrice de mémoire, production et discernement.

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
last frame exacte pour continuité LEGO.`;

const BLACKOUT_PROMPT = `Mode Blackout.
Texte uniquement.
Aucun outil image.
Aucune génération image.
Aucune action GitHub automatique.
Réponse courte, directe, opérationnelle.`;

const MODULE_PROMPT = `Seven, ouvre le mode Modules Mémoire.
Sélectionne uniquement les modules utiles.
Puissance maximale.
Chargement minimal.
Choix précis.`;

const NOTION_TEXT = `Seven Portable Terminal

Terminal public :
${TERMINAL_LINK}

Usage :
1. Cliquer Seven Boost ou Video Cards.
2. ChatGPT s’ouvre ou revient.
3. Coller avec Ctrl+V.
4. Envoyer.`;

let bgIndex = 0;

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

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
  } catch {
    const drawer = $("#promptDrawer");
    const area = $("#promptText");
    if (drawer && area) {
      area.value = text;
      drawer.classList.add("open");
      setTimeout(() => { area.focus(); area.select(); }, 30);
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
  const opened = openChatGPTNamed();
  await copyText(AERITH_PROMPT);
  setStatus(opened ? "Seven Boost copié. ChatGPT appelé. Ctrl+V puis Entrée." : "Seven Boost copié. Popup bloquée : ouvre ChatGPT puis Ctrl+V.");
}

async function copyVideoCards() {
  const opened = openChatGPTNamed();
  await copyText(VIDEO_CARDS_PROMPT);
  setStatus(opened ? "Video Cards copié. ChatGPT appelé. Ctrl+V puis Entrée." : "Video Cards copié. Popup bloquée : ouvre ChatGPT puis Ctrl+V.");
}

async function copySevenOnly() { await copyText(AERITH_PROMPT); setStatus("Prompt Seven copié."); }
async function copyWan() { await copyText(WAN_PROMPT); setStatus("Checklist Wan copiée."); }
async function copyBlackout() { await copyText(BLACKOUT_PROMPT); setStatus("Mode Blackout copié."); }
async function copyModules() { await copyText(MODULE_PROMPT); setStatus("Prompt Modules copié."); }
async function copyTerminalLink() { await copyText(TERMINAL_LINK); setStatus("Lien cockpit copié."); }
async function copyNotionText() { await copyText(NOTION_TEXT); setStatus("Bloc Notion copié."); }

function openPage(name) {
  $$(".page").forEach(p => p.classList.toggle("active", p.id === `page-${name}`));
  $$(".tab").forEach(t => t.classList.toggle("active", t.dataset.page === name));
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
  localStorage.setItem("seven_v79_mode", dark ? "dark" : "transparent");
  setStatus(dark ? "Mode lisibilité actif." : "Mode transparent contrôlé actif.");
}

function toggleAdvanced(force) {
  const open = typeof force === "boolean" ? force : !document.body.classList.contains("show-advanced");
  document.body.classList.toggle("show-advanced", open);
  localStorage.setItem("seven_v79_advanced", open ? "1" : "0");
  setStatus(open ? "Advanced ouvert." : "Advanced réduit.");
}

function toggleAtlas(force) {
  const open = typeof force === "boolean" ? force : !document.body.classList.contains("show-atlas");
  document.body.classList.toggle("show-atlas", open);
  if (open) renderAtlas();
}

function togglePalette(force) {
  const p = $("#palette");
  if (!p) return;
  const open = typeof force === "boolean" ? force : !p.classList.contains("open");
  p.classList.toggle("open", open);
  p.setAttribute("aria-hidden", open ? "false" : "true");
}

function togglePrompt(force) {
  const d = $("#promptDrawer");
  const a = $("#promptText");
  if (!d) return;
  const open = typeof force === "boolean" ? force : !d.classList.contains("open");
  if (a) a.value = AERITH_PROMPT;
  d.classList.toggle("open", open);
}

function applyBackground(i) {
  bgIndex = (i + BACKGROUNDS.length) % BACKGROUNDS.length;
  const bg = BACKGROUNDS[bgIndex];
  document.documentElement.style.setProperty("--active-bg", `url("${bg.url}")`);
  localStorage.setItem("seven_v79_bg", String(bgIndex));
  setStatus("Fond actif : " + bg.name);
}

function nextBackground() { applyBackground(bgIndex + 1); }
function randomBackground() { applyBackground(Math.floor(Math.random() * BACKGROUNDS.length)); }

function nextFamily(family) {
  const items = BACKGROUNDS.map((b, i) => ({ b, i })).filter(x => x.b.family === family);
  if (!items.length) return;
  const current = items.findIndex(x => x.i === bgIndex);
  const next = items[(current + 1 + items.length) % items.length];
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
  localStorage.setItem("seven_v79_ambiance", name);
  setStatus("Ambiance : " + name);
}

function saveFavorite() {
  localStorage.setItem("seven_v79_favorite", JSON.stringify({
    bgIndex,
    mode: document.body.classList.contains("mode-dark") ? "dark" : "transparent",
    ambiance: document.body.dataset.ambiance || "sky",
    advanced: document.body.classList.contains("show-advanced")
  }));
  setStatus("Favori sauvegardé.");
}

function loadFavorite() {
  try {
    const f = JSON.parse(localStorage.getItem("seven_v79_favorite") || "null");
    if (!f) throw new Error("none");
    applyBackground(Number(f.bgIndex || 0));
    setMode(f.mode || "transparent");
    setAmbiance(f.ambiance || "sky");
    toggleAdvanced(!!f.advanced);
    setStatus("Favori chargé.");
  } catch {
    setStatus("Aucun favori local.");
  }
}

function clearFavorite() {
  localStorage.removeItem("seven_v79_favorite");
  setStatus("Favori effacé.");
}

function resetVisual() {
  applyBackground(0);
  setMode("transparent");
  setAmbiance("sky");
  toggleAdvanced(false);
  toggleAtlas(false);
  setStatus("Reset visuel effectué.");
}

function getTrace() {
  const ua = navigator.userAgent || "";
  const browser = ua.includes("Firefox/") ? "Firefox" : ua.includes("Edg/") ? "Edge" : ua.includes("Chrome/") ? "Chrome" : "Navigateur";
  const now = new Date();
  return {
    date: now.toLocaleString("fr-FR"),
    os: navigator.platform || "OS inconnu",
    browser,
    screen: `${screen.width}×${screen.height} · DPR ${window.devicePixelRatio || 1}`,
    viewport: `${window.innerWidth}×${window.innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Fuseau inconnu",
    lang: navigator.languages ? navigator.languages.join(", ") : navigator.language,
    cpu: navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} threads` : "non disponible"
  };
}

function card(icon, label, value, note) {
  return `<article class="trace-card"><span>${icon}</span><small>${label}</small><strong>${value}</strong><em>${note}</em></article>`;
}

function refreshSystem() {
  const t = getTrace();
  const summary = [
    card("🖥️", "Système", t.os, "local"),
    card("🌐", "Navigateur", t.browser, t.lang),
    card("📐", "Affichage", t.screen, `viewport ${t.viewport}`),
    card("🌍", "Fuseau", t.timezone, t.date),
    card("⚙️", "Performance", t.cpu, "navigateur"),
    card("🛡️", "Sécurité", "SAFE TRACE", "aucun ID, aucun mot de passe")
  ].join("");

  if ($("#systemSummary")) $("#systemSummary").innerHTML = summary;
  if ($("#systemDetails")) $("#systemDetails").innerHTML = summary;
  if ($("#homeTrace")) $("#homeTrace").textContent = `${t.os} · ${t.browser} · ${t.screen}`;
  if ($("#systemRaw")) {
    $("#systemRaw").value =
`SAFE TRACE ${t.date}
Système : ${t.os}
Navigateur : ${t.browser}
Affichage : ${t.screen}
Viewport : ${t.viewport}
Fuseau : ${t.timezone}
Langues : ${t.lang}
Performance : ${t.cpu}
Sécurité : aucun RustDesk ID, aucun mot de passe`;
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
      const target = $("#guidanceText");
      if (target) target.textContent = el.dataset.help;
    });
  });
}

function boot() {
  const savedBg = Number(localStorage.getItem("seven_v79_bg") || "0");
  applyBackground(Number.isFinite(savedBg) ? savedBg : 0);
  setMode(localStorage.getItem("seven_v79_mode") || "transparent");
  setAmbiance(localStorage.getItem("seven_v79_ambiance") || "sky");
  if (localStorage.getItem("seven_v79_advanced") === "1") toggleAdvanced(true);
  renderAtlas();
  refreshSystem();
  bindHelp();

  document.addEventListener("keydown", e => {
    if (e.target && ["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
    const pages = { "1": "home", "2": "llm", "3": "notion", "4": "github", "5": "production", "6": "system" };
    if (pages[e.key]) openPage(pages[e.key]);
    if (e.key === "?") togglePalette();
    if (e.key === "Escape") { togglePalette(false); togglePrompt(false); }
  });

  window.addEventListener("resize", refreshSystem);
  setStatus("Seven Terminal V7.9 prêt.");
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
