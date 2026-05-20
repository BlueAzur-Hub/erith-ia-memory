/* Seven Portable Terminal — V5.2 Calque Final
   Calqué sur la version Celestial Atlas / Golden Glass fournie par Christophe.
   Ne pas séparer de index.html + style.css de ce package.
*/

const TERMINAL_LINK = "https://blueazur-hub.github.io/erith-ia-memory/assets/SEVEN_PORTABLE_TERMINAL/index.html";

const SEVEN_PROMPT = `Chat, active Aerith-7 Seven Heaven / Full Modules Boost.

Lis d’abord :
https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-notion-archive-private/main/core/SEVEN_GATE.md

Puis lis :
https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-notion-archive-private/main/core/AERITH_7_FULL_MODULES_BOOST.md

Active Aerith-7 Seven Heaven comme opératrice de mémoire, de production et de discernement.

Mode Full Modules Boost intelligent.

Règle centrale :
Seven Heaven pilote.
Ne charge pas tout en entier.
Choisis uniquement les modules utiles selon la demande.

Style principal :
Notion compatible, clair, propre, opérationnel.`;

const VIDEO_CARDS_PROMPT = `Chat, active Aerith-7 Seven Heaven — Video Cards Boost Production.

Réponds court :
1. Phase actuelle
2. Risque principal
3. Cartes utiles
4. Action immédiate
5. Point d’arrêt

Puissance maximale.
Chargement minimal.
Choix précis.`;

const BLACKOUT_PROMPT = `Mode Blackout.
Texte uniquement.
Aucune génération image.
Aucun outil image.
Prompts, vérifications, décisions, noms de fichiers, commits et archivage restent autorisés.`;

const WAN_PROMPT = `Seven, active les cartes utiles pour une production Wan / I2V 1080x1920.

Réglages validés :
width = 1080
height = 1920
frame_rate = 16
length = 81
batch_size = 1

Prompt positif obligatoire.
Prompt négatif obligatoire.
Last frame exacte si Animation 2.
Mode LEGO protégé.

Réponds court :
Phase.
Risque.
Action.
Arrêt.`;

const MODULES_PROMPT = `Seven, ouvre le mode Modules Mémoire.

Sélectionne uniquement les modules utiles.
Puissance maximale.
Chargement minimal.
Choix précis.`;

const NOTION_TEXT = `# 🌸 Seven Portable Terminal

Lien cockpit :
https://blueazur-hub.github.io/erith-ia-memory/assets/SEVEN_PORTABLE_TERMINAL/index.html

ERITH.IA Auto-Agent Public FR :
https://www.notion.so/ERITH-IA-Auto-Agent-Public-FR-35b7754fe084800ca59fd9bcdf4349ba

ERITH Memory :
https://sustaining-boar-5c6.notion.site/erith-ia-memory

@7Heaven Memory Core :
https://sustaining-boar-5c6.notion.site/7heaven-memory-core

Le Chat GPT Memory Core :
https://sustaining-boar-5c6.notion.site/Le-Chat-GPT-Memory-Core-35e7754fe08480a9b72ee3fc5ede65a8

GitHub public :
https://github.com/BlueAzur-Hub/erith-ia-memory

Dossier terminal :
https://github.com/BlueAzur-Hub/erith-ia-memory/tree/main/assets/SEVEN_PORTABLE_TERMINAL`;

const BACKGROUNDS = [
  { name: "Jardin du Grand Arbre", url: "./background_historique_lr.png", family: "Grand Tree Garden", ambiance: "sky" },
  { name: "Génie holographique", url: "./genie_bg_01_holographic_invocation_full.jpg", family: "Genie Invocation", ambiance: "crystal" },
  { name: "Lampe oraculaire", url: "./genie_bg_02_ai_librarian_lamp_full.jpg", family: "Genie Invocation", ambiance: "gold" },
  { name: "Visage bleu", url: "./genie_bg_03_hologram_face_focus.jpg", family: "Genie Invocation", ambiance: "night" },
  { name: "Cercle de lampe", url: "./genie_bg_04_lamp_oracle_focus.jpg", family: "Genie Invocation", ambiance: "crystal" },
  { name: "Bibliothèque bleue", url: "./genie_bg_05_blue_library_flight.jpg", family: "Crystal Sanctuary", ambiance: "sky" },
  { name: "Oracle doré", url: "./genie_bg_06_golden_arcane_floor.jpg", family: "Historic Ruins", ambiance: "gold" }
];

const HERO_IMAGES = [
  { name: "Hero VR", url: "./hero_face_vr_background.jpg" },
  { name: "Génie", url: "./hero_genie_invocation_banner.jpg" },
  { name: "Crystal", url: "./hero_frame_crystal.jpg" },
  { name: "Fond original", url: "./background_historique_lr.png" }
];

const STATE_KEY = "seven_celestial_v52_calque_state";
const FAVORITE_KEY = "seven_celestial_v52_calque_favorite";

const state = {
  page: "home",
  bgIndex: 0,
  heroIndex: 0,
  ambiance: "sky",
  readability: false,
  heroOpen: true,
  advancedOpen: false,
  atlasOpen: false,
  hero: { x: 50, y: 34, zoom: 100 }
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function setStatus(message) {
  const status = $("#status");
  if (status) status.textContent = message;
}

async function copyToClipboard(text, message = "Copié.") {
  try {
    await navigator.clipboard.writeText(text);
    setStatus(message);
  } catch {
    const drawer = $("#promptDrawer");
    const area = $("#promptText");
    if (drawer && area) {
      area.value = text;
      drawer.classList.add("open");
      area.focus();
      area.select();
      setStatus("Copie manuelle : texte affiché et sélectionné.");
    }
  }
}

function openPage(page) {
  state.page = page || "home";
  $$(".page").forEach(el => el.classList.toggle("active", el.id === `page-${state.page}`));
  $$(".tab").forEach(el => el.classList.toggle("active", el.dataset.page === state.page));
  saveState();
  setStatus("Page : " + state.page);
}

function setAmbiance(mode) {
  state.ambiance = mode || "sky";
  document.body.dataset.ambiance = state.ambiance;
  document.body.dataset.uiMode = state.ambiance;
  saveState();
  setStatus("Ambiance : " + state.ambiance);
}

function cycleAmbiance() {
  const modes = ["sky", "crystal", "ruins", "night", "gold", "minimal"];
  const current = modes.indexOf(state.ambiance);
  setAmbiance(modes[(current + 1 + modes.length) % modes.length]);
}

function setReadability(on) {
  state.readability = Boolean(on);
  document.body.classList.toggle("readability-on", state.readability);
  document.body.classList.toggle("readability-off", !state.readability);
  document.body.classList.toggle("mode-transparent", !state.readability);
  document.body.classList.toggle("mode-dark", state.readability);

  const btn = $("#readabilityShieldBtn");
  if (btn) btn.classList.toggle("active", state.readability);

  saveState();
  setStatus(state.readability ? "Lisibilité sombre active." : "Mode transparent actif.");
}

function toggleReadabilityShield() {
  setReadability(!state.readability);
}

function applyBackground(index) {
  state.bgIndex = ((Number(index) % BACKGROUNDS.length) + BACKGROUNDS.length) % BACKGROUNDS.length;
  const item = BACKGROUNDS[state.bgIndex];
  document.documentElement.style.setProperty("--active-bg", `url("${item.url}")`);
  setAmbiance(item.ambiance || state.ambiance);
  updateAtlasLabels();
  saveState();
  setStatus("Fond actif : " + item.name);
}

function nextBackground() {
  applyBackground(state.bgIndex + 1);
}

function randomBackground() {
  applyBackground(Math.floor(Math.random() * BACKGROUNDS.length));
}

function randomAtlasBackground() {
  randomBackground();
}

function nextAtlasInFamily(family) {
  const start = state.bgIndex + 1;
  for (let i = 0; i < BACKGROUNDS.length; i++) {
    const idx = (start + i) % BACKGROUNDS.length;
    if (BACKGROUNDS[idx].family === family) {
      applyBackground(idx);
      return;
    }
  }
  setStatus("Famille non trouvée : " + family);
}

function openCelestialAtlas() {
  state.atlasOpen = !state.atlasOpen;
  const panel = $("#celestialAtlasPanel");
  if (panel) panel.classList.toggle("open", state.atlasOpen);
  renderAtlasGrid("All");
  renderHeroGallery();
  saveState();
  setStatus(state.atlasOpen ? "Atlas ouvert." : "Atlas fermé.");
}

function updateAtlasLabels() {
  const item = BACKGROUNDS[state.bgIndex] || BACKGROUNDS[0];
  if ($("#currentAtlasName")) $("#currentAtlasName").textContent = item.name;
  if ($("#currentAtlasMeta")) $("#currentAtlasMeta").textContent = item.family || "Celestial Atlas";
}

function renderAtlasGrid(filter = "All") {
  const grid = $("#atlasPreviewGrid");
  if (!grid) return;

  $$(".atlas-chip").forEach(chip => chip.classList.toggle("selected", chip.dataset.familyFilter === filter));

  const items = BACKGROUNDS
    .map((item, index) => ({ ...item, index }))
    .filter(item => filter === "All" || item.family === filter);

  grid.innerHTML = items.map(item => `
    <button type="button" class="atlas-preview ${item.index === state.bgIndex ? "selected" : ""}" data-bg-index="${item.index}">
      <span class="atlas-thumb" style="background-image:url('${item.url}')"></span>
      <strong>${item.name}</strong>
      <em>${item.family}</em>
    </button>
  `).join("");

  grid.querySelectorAll("[data-bg-index]").forEach(button => {
    button.addEventListener("click", () => applyBackground(Number(button.dataset.bgIndex)));
  });

  updateAtlasLabels();
}

function renderHeroGallery() {
  const grid = $("#heroGalleryGrid");
  if (!grid) return;

  grid.innerHTML = HERO_IMAGES.map((item, index) => `
    <button type="button" class="hero-choice ${index === state.heroIndex ? "selected" : ""}" data-hero-index="${index}">
      <span class="hero-thumb" style="background-image:url('${item.url}')"></span>
      <strong>${item.name}</strong>
    </button>
  `).join("");

  grid.querySelectorAll("[data-hero-index]").forEach(button => {
    button.addEventListener("click", () => applyHeroImage(Number(button.dataset.heroIndex)));
  });
}

function applyHeroImage(index) {
  state.heroIndex = ((Number(index) % HERO_IMAGES.length) + HERO_IMAGES.length) % HERO_IMAGES.length;
  const hero = HERO_IMAGES[state.heroIndex];
  const heroImage = $("#heroImage") || $(".hero-bg-img");
  if (heroImage) heroImage.src = hero.url;
  renderHeroGallery();
  saveState();
  setStatus("Hero : " + hero.name);
}

function clamp(value, min, max) {
  value = Number(value);
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function applyHeroFocus(x, y, zoom, persist = true) {
  x = clamp(x, 0, 100);
  y = clamp(y, 0, 100);
  zoom = clamp(zoom, 100, 180);

  state.hero = { x, y, zoom };

  const heroImage = $("#heroImage") || $(".hero-bg-img");
  if (heroImage) {
    heroImage.style.objectPosition = `${x}% ${y}%`;
    heroImage.style.transform = `scale(${zoom / 100})`;
    heroImage.style.transformOrigin = `${x}% ${y}%`;
  }

  const xInput = $("#heroFocusX");
  const yInput = $("#heroFocusY");
  const zInput = $("#heroFocusZoom");

  if (xInput) xInput.value = x;
  if (yInput) yInput.value = y;
  if (zInput) zInput.value = zoom;

  if ($("#heroFocusXValue")) $("#heroFocusXValue").textContent = `${x}%`;
  if ($("#heroFocusYValue")) $("#heroFocusYValue").textContent = `${y}%`;
  if ($("#heroFocusZoomValue")) $("#heroFocusZoomValue").textContent = `${zoom}%`;

  if (persist) saveState();
}

function setHeroFocusFromInputs() {
  applyHeroFocus($("#heroFocusX")?.value, $("#heroFocusY")?.value, $("#heroFocusZoom")?.value);
}

function nudgeHeroFocus(dx, dy) {
  applyHeroFocus(state.hero.x + dx, state.hero.y + dy, state.hero.zoom);
}

function resetHeroFocus() {
  applyHeroFocus(50, 34, 100);
  setStatus("Hero Focus réinitialisé.");
}

function toggleHeroFocusPanel(force) {
  state.heroOpen = typeof force === "boolean" ? force : !state.heroOpen;
  document.body.classList.toggle("show-hero-focus", state.heroOpen);
  const btn = $("#heroFocusBtn");
  if (btn) btn.classList.toggle("active", state.heroOpen);
  saveState();
  setStatus(state.heroOpen ? "Hero Focus ouvert." : "Hero Focus fermé.");
}

function toggleAdvancedPanels(force) {
  state.advancedOpen = typeof force === "boolean" ? force : !state.advancedOpen;
  document.body.classList.toggle("show-advanced", state.advancedOpen);
  const btn = $("#advancedPanelsBtn");
  if (btn) btn.classList.toggle("active", state.advancedOpen);
  saveState();
  setStatus(state.advancedOpen ? "Advanced ouvert." : "Advanced réduit.");
}

function resetVisualState() {
  state.bgIndex = 0;
  state.heroIndex = 0;
  state.ambiance = "sky";
  state.readability = false;
  state.heroOpen = true;
  state.advancedOpen = false;
  state.atlasOpen = false;
  state.hero = { x: 50, y: 34, zoom: 100 };
  applyAllState(false);
  saveState();
  setStatus("Base visuelle transparente restaurée.");
}

function resetUiStorage() {
  localStorage.removeItem(STATE_KEY);
  localStorage.removeItem(FAVORITE_KEY);
  location.reload();
}

function saveFavoriteState() {
  localStorage.setItem(FAVORITE_KEY, JSON.stringify(state));
  setStatus("Favori Seven enregistré.");
}

function loadFavoriteState() {
  try {
    const favorite = JSON.parse(localStorage.getItem(FAVORITE_KEY) || "null");
    if (!favorite) {
      setStatus("Aucun favori enregistré.");
      return;
    }
    Object.assign(state, favorite);
    applyAllState(false);
    saveState();
    setStatus("Favori Seven rechargé.");
  } catch {
    setStatus("Favori illisible.");
  }
}

function clearFavoriteState() {
  localStorage.removeItem(FAVORITE_KEY);
  setStatus("Favori effacé.");
}

function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STATE_KEY) || "null");
    if (saved) Object.assign(state, saved);
  } catch {}
}

function applyAllState(persist = false) {
  applyBackground(state.bgIndex);
  applyHeroImage(state.heroIndex);
  setAmbiance(state.ambiance);
  setReadability(state.readability);
  applyHeroFocus(state.hero.x, state.hero.y, state.hero.zoom, false);
  toggleHeroFocusPanel(Boolean(state.heroOpen));
  toggleAdvancedPanels(Boolean(state.advancedOpen));

  const atlas = $("#celestialAtlasPanel");
  if (atlas) atlas.classList.toggle("open", Boolean(state.atlasOpen));

  renderAtlasGrid("All");
  renderHeroGallery();

  if (persist) saveState();
}

function togglePrompt() {
  const drawer = $("#promptDrawer");
  const area = $("#promptText");
  if (!drawer || !area) return;
  area.value = SEVEN_PROMPT;
  drawer.classList.toggle("open");
  setStatus(drawer.classList.contains("open") ? "Prompt affiché." : "Prompt masqué.");
}

function toggleCommandPalette(force) {
  const palette = $("#commandPalette");
  if (!palette) return;
  const open = typeof force === "boolean" ? force : !palette.classList.contains("open");
  palette.classList.toggle("open", open);
  palette.setAttribute("aria-hidden", open ? "false" : "true");
  setStatus(open ? "Palette ouverte." : "Palette fermée.");
}

function startSeven() {
  copyToClipboard(SEVEN_PROMPT, "Prompt Seven copié. Ouverture ChatGPT.");
  setTimeout(() => window.open("https://chatgpt.com/", "_blank"), 250);
}

function copyVideoCards() { copyToClipboard(VIDEO_CARDS_PROMPT, "Video Cards copié."); }
function copyWan() { copyToClipboard(WAN_PROMPT, "Checklist Wan copiée."); }
function copyBlackout() { copyToClipboard(BLACKOUT_PROMPT, "Mode Blackout copié."); }
function copySevenOnly() { copyToClipboard(SEVEN_PROMPT, "Prompt Seven copié."); }
function copyModules() { copyToClipboard(MODULES_PROMPT, "Prompt Modules copié."); }
function copyTerminalLink() { copyToClipboard(TERMINAL_LINK, "Lien cockpit copié."); }
function copyNotionText() { copyToClipboard(NOTION_TEXT, "Bloc Notion copié."); }

function getBrowserName() {
  const ua = navigator.userAgent || "";
  if (ua.includes("Firefox/")) return "Firefox " + (ua.match(/Firefox\/([\d.]+)/)?.[1] || "");
  if (ua.includes("Edg/")) return "Microsoft Edge";
  if (ua.includes("Chrome/")) return "Chrome";
  if (ua.includes("Safari/")) return "Safari";
  return "Navigateur";
}

function getOsName() {
  const ua = navigator.userAgent || "";
  if (ua.includes("Windows NT 10.0")) return "Windows 10 / 11";
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac OS")) return "macOS";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("Linux")) return "Linux";
  return "OS inconnu";
}

function traceData() {
  return {
    stamp: new Date().toLocaleString("fr-FR"),
    os: getOsName(),
    platform: navigator.platform || "plateforme inconnue",
    browser: getBrowserName(),
    agent: (navigator.userAgent || "indisponible").slice(0, 92),
    screen: `${screen.width}×${screen.height} · DPR ${window.devicePixelRatio || 1}`,
    viewport: `viewport ${window.innerWidth}×${window.innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "inconnu",
    language: navigator.languages ? navigator.languages.join(", ") : (navigator.language || "inconnu")
  };
}

function refreshHomeSystemTrace() {
  const t = traceData();
  if ($("#homeTraceStamp")) $("#homeTraceStamp").textContent = t.stamp;
  if ($("#homeTraceOs")) $("#homeTraceOs").textContent = t.os;
  if ($("#homeTracePlatform")) $("#homeTracePlatform").textContent = t.platform;
  if ($("#homeTraceBrowser")) $("#homeTraceBrowser").textContent = t.browser;
  if ($("#homeTraceAgent")) $("#homeTraceAgent").textContent = t.agent;
  if ($("#homeTraceScreen")) $("#homeTraceScreen").textContent = t.screen;
  if ($("#homeTraceViewport")) $("#homeTraceViewport").textContent = t.viewport;
  if ($("#homeTraceTimezone")) $("#homeTraceTimezone").textContent = t.timezone;
  if ($("#homeTraceLanguage")) $("#homeTraceLanguage").textContent = t.language;
}

function copyHomeSystemDiagnostics() {
  const t = traceData();
  copyToClipboard(`SAFE TRACE
Date : ${t.stamp}
Système : ${t.os}
Plateforme : ${t.platform}
Navigateur : ${t.browser}
Écran : ${t.screen}
Viewport : ${t.viewport}
Fuseau : ${t.timezone}
Langue : ${t.language}
IP : masquée
RustDesk : ID et mot de passe non affichés`, "Diagnostic copié.");
}

function bindBaseEvents() {
  $$(".tab").forEach(tab => tab.addEventListener("click", () => openPage(tab.dataset.page)));

  $$(".command-palette [data-page]").forEach(button => {
    button.addEventListener("click", () => {
      openPage(button.dataset.page);
      toggleCommandPalette(false);
    });
  });

  $$(".command-palette [data-action]").forEach(button => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "start-seven") startSeven();
      if (action === "next-bg") nextBackground();
      if (action === "open-hero") toggleHeroFocusPanel(true);
      if (action !== "open-hero") toggleCommandPalette(false);
    });
  });

  $$(".command-palette [data-copy]").forEach(button => {
    button.addEventListener("click", () => {
      const key = button.dataset.copy;
      if (key === "video") copyVideoCards();
      if (key === "wan") copyWan();
      if (key === "blackout") copyBlackout();
      toggleCommandPalette(false);
    });
  });

  $$(".command-palette [data-mode]").forEach(button => {
    button.addEventListener("click", () => {
      const mode = button.dataset.mode;
      setReadability(mode === "dark");
      toggleCommandPalette(false);
    });
  });

  const paletteClose = $("#paletteCloseBtn");
  if (paletteClose) paletteClose.addEventListener("click", () => toggleCommandPalette(false));

  document.addEventListener("keydown", event => {
    if (event.target && ["INPUT", "TEXTAREA"].includes(event.target.tagName)) return;

    const pages = {
      "1": "home",
      "2": "llm",
      "3": "notion",
      "4": "github",
      "5": "production",
      "6": "system"
    };

    if (pages[event.key]) openPage(pages[event.key]);
    if (event.key === "?") toggleCommandPalette();
    if (event.key === "Escape") {
      toggleCommandPalette(false);
      $("#promptDrawer")?.classList.remove("open");
      if (state.heroOpen) toggleHeroFocusPanel(false);
    }
  });
}

function ensureHeroImage() {
  const hero = $("#heroImage") || $(".hero-bg-img");
  if (hero) {
    hero.addEventListener("error", () => {
      hero.src = "./background_historique_lr.png";
      setStatus("Hero fallback : background_historique_lr.png");
    }, { once: true });
  }
}

function boot() {
  loadState();
  bindBaseEvents();
  ensureHeroImage();
  applyAllState(false);
  refreshHomeSystemTrace();
  setStatus("Seven Heaven Cockpit V5.2 calqué prêt.");
}

boot();
window.addEventListener("resize", refreshHomeSystemTrace);
