/* Seven Heaven Cockpit — Celestial Atlas 2.9 Golden Glass Stable Complete */

const TERMINAL_LINK = "https://blueazur-hub.github.io/erith-ia-memory/assets/SEVEN_PORTABLE_TERMINAL/index.html";
const ERITH_AUTO_AGENT_LINK = "https://www.notion.so/ERITH-IA-Auto-Agent-Public-FR-35b7754fe084800ca59fd9bcdf4349ba";
const SEVEN_MEMORY_CORE_LINK = "https://sustaining-boar-5c6.notion.site/7heaven-memory-core";
const CHATGPT_MEMORY_CORE_LINK = "https://sustaining-boar-5c6.notion.site/Le-Chat-GPT-Memory-Core-35e7754fe08480a9b72ee3fc5ede65a8";
const ERITH_MEMORY_LINK = "https://sustaining-boar-5c6.notion.site/erith-ia-memory";
const BLUE_AZUR_CHANNEL_LINK = "https://www.youtube.com/@BlueAzur07";
const FACEBOOK_SEARCH_LINK = "https://www.facebook.com/BlueAzur07/";
const X_SEARCH_LINK = "https://x.com/BlueAzur7";

const BACKGROUNDS = [
  { name: "Sky Bridge Ruins · temple", family: "Sky Bridge Ruins", variant: "temple", url: "./atlas_29_sky_bridge_ruins_temple.jpg", thumb: "./preview_reset_atlas_29_sky_bridge_ruins_temple.jpg" },
  { name: "Sky Bridge Ruins · pont", family: "Sky Bridge Ruins", variant: "pont", url: "./atlas_29_sky_bridge_ruins_pont.jpg", thumb: "./preview_reset_atlas_29_sky_bridge_ruins_pont.jpg" },
  { name: "Sky Bridge Ruins · profondeur", family: "Sky Bridge Ruins", variant: "profondeur", url: "./atlas_29_sky_bridge_ruins_profondeur.jpg", thumb: "./preview_reset_atlas_29_sky_bridge_ruins_profondeur.jpg" },
  { name: "Suspended City · temple", family: "Suspended City", variant: "temple", url: "./atlas_29_suspended_city_temple.jpg", thumb: "./preview_reset_atlas_29_suspended_city_temple.jpg" },
  { name: "Suspended City · pont", family: "Suspended City", variant: "pont", url: "./atlas_29_suspended_city_pont.jpg", thumb: "./preview_reset_atlas_29_suspended_city_pont.jpg" },
  { name: "Suspended City · profondeur", family: "Suspended City", variant: "profondeur", url: "./atlas_29_suspended_city_profondeur.jpg", thumb: "./preview_reset_atlas_29_suspended_city_profondeur.jpg" },
  { name: "Grand Tree Garden · arbre", family: "Grand Tree Garden", variant: "arbre", url: "./atlas_29_grand_tree_garden_arbre.jpg", thumb: "./preview_reset_atlas_29_grand_tree_garden_arbre.jpg" },
  { name: "Grand Tree Garden · jardin", family: "Grand Tree Garden", variant: "jardin", url: "./atlas_29_grand_tree_garden_jardin.jpg", thumb: "./preview_reset_atlas_29_grand_tree_garden_jardin.jpg" },
  { name: "Grand Tree Garden · personnages", family: "Grand Tree Garden", variant: "personnages", url: "./atlas_29_grand_tree_garden_personnages.jpg", thumb: "./preview_reset_atlas_29_grand_tree_garden_personnages.jpg" },
  { name: "Crystal Sanctuary · cristal", family: "Crystal Sanctuary", variant: "cristal", url: "./atlas_29_crystal_sanctuary_cristal.jpg", thumb: "./preview_reset_atlas_29_crystal_sanctuary_cristal.jpg" },
  { name: "Crystal Sanctuary · arche", family: "Crystal Sanctuary", variant: "arche", url: "./atlas_29_crystal_sanctuary_arche.jpg", thumb: "./preview_reset_atlas_29_crystal_sanctuary_arche.jpg" },
  { name: "Crystal Sanctuary · seuil", family: "Crystal Sanctuary", variant: "seuil", url: "./atlas_29_crystal_sanctuary_seuil.jpg", thumb: "./preview_reset_atlas_29_crystal_sanctuary_seuil.jpg" },
  { name: "Historic Ruins · large", family: "Historic Ruins", variant: "large", url: "./atlas_29_historic_ruins_large.jpg", thumb: "./preview_reset_atlas_29_historic_ruins_large.jpg" },
  { name: "Historic Ruins · jardin", family: "Historic Ruins", variant: "jardin", url: "./atlas_29_historic_ruins_jardin.jpg", thumb: "./preview_reset_atlas_29_historic_ruins_jardin.jpg" },
  { name: "Historic Ruins · hall", family: "Historic Ruins", variant: "hall", url: "./atlas_29_historic_ruins_hall.jpg", thumb: "./preview_reset_atlas_29_historic_ruins_hall.jpg" },
  { name: "Historique · original", family: "Historic Ruins", variant: "original", url: "./background_historique_lr.png", thumb: "./background_historique_lr.png" },
  { name: "Génie · invocation holographique", family: "Génie", variant: "holographic", url: "./genie_bg_01_holographic_invocation_full.jpg", thumb: "./genie_bg_01_holographic_invocation_full.jpg" },
  { name: "Génie · lampe oraculaire", family: "Génie", variant: "lamp", url: "./genie_bg_02_ai_librarian_lamp_full.jpg", thumb: "./genie_bg_02_ai_librarian_lamp_full.jpg" },
  { name: "Génie · bibliothèque bleue", family: "Génie", variant: "library", url: "./genie_bg_05_blue_library_flight.jpg", thumb: "./genie_bg_05_blue_library_flight.jpg" }
];

const HERO_FRAMES = [
  { name: "Recovery Hero", label: "🌸", url: "./aerith_7_memory_cards_avatar_master.png" },
  { name: "Génie holographique", label: "🧞", url: "./genie_bg_01_holographic_invocation_full.jpg" },
  { name: "Lampe oraculaire", label: "✨", url: "./genie_bg_02_ai_librarian_lamp_full.jpg" },
  { name: "Bibliothèque bleue", label: "📚", url: "./genie_bg_05_blue_library_flight.jpg" }
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
Sound Design / Voix / Silence.

Règle :
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

const MODULE_PROMPT = `Seven, ouvre le mode Modules Mémoire.

Sélectionne uniquement les modules utiles.
Puissance maximale.
Chargement minimal.
Choix précis.`;

const NOTION_TEXT = `# 🌸 Seven Portable Terminal

Lien cockpit :
${TERMINAL_LINK}

ERITH.IA Auto-Agent :
${ERITH_AUTO_AGENT_LINK}

ERITH Memory :
${ERITH_MEMORY_LINK}

@7Heaven [Memory Core] :
${SEVEN_MEMORY_CORE_LINK}

Le Chat GPT [Memory Core] :
${CHATGPT_MEMORY_CORE_LINK}

GitHub public :
https://github.com/BlueAzur-Hub/erith-ia-memory

Blue Azur :
${BLUE_AZUR_CHANNEL_LINK}

Facebook Blue Azur :
${FACEBOOK_SEARCH_LINK}

X / Twitter Blue Azur :
${X_SEARCH_LINK}

Transformer Book = pupitre Seven.
Ryzen 7 = moteur de production.`;

const STORAGE = {
  bg: "seven-terminal-bg-index",
  ambiance: "seven-ambiance",
  favorite: "seven-favorite-state-v5-complete",
  heroFrame: "seven-hero-frame-index",
  heroFocus: "seven-hero-focus",
  heroFocusPanel: "seven-hero-focus-panel",
  advanced: "seven-advanced-panels",
  previews: "seven-previews",
  visibility: "seven-visibility-mode-v52",
  touch: "seven-touch-glow",
  glass: "seven-deep-glass"
};

const AMBIANCE_SEQUENCE = ["sky", "crystal", "ruins", "night", "gold", "minimal"];
const INTENT_LABELS = {
  hub: "Centre de commande",
  ai: "Assistant IA",
  memory: "Mémoire humaine",
  code: "Mémoire machine",
  production: "Production",
  system: "Système",
  boost: "Activation",
  video: "Vidéo",
  prompt: "Prompt",
  link: "Lien",
  safety: "Sécurité",
  public: "Interface publique",
  core: "Core",
  copy: "Copie",
  github: "GitHub",
  youtube: "Diffusion",
  audio: "Audio",
  social: "Social",
  visual: "Visuel"
};

let backgroundIndex = 0;
let heroFrameIndex = 0;
let currentAmbianceIndex = 0;

function $(selector) { return document.querySelector(selector); }
function $all(selector) { return Array.from(document.querySelectorAll(selector)); }
function byId(id) { return document.getElementById(id); }

function setText(id, value) {
  const el = byId(id);
  if (el) el.textContent = value;
}

function setStatus(message) {
  const status = byId("status") || byId("statusLine");
  if (status) status.textContent = message;
}

window.setStatus = setStatus;

function safeStorageGet(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}

function safeStorageSet(key, value) {
  try { localStorage.setItem(key, value); } catch {}
}

function safeStorageRemove(key) {
  try { localStorage.removeItem(key); } catch {}
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const box = document.createElement("textarea");
  box.value = text;
  box.style.position = "fixed";
  box.style.left = "-9999px";
  box.style.top = "0";
  document.body.appendChild(box);
  box.focus();
  box.select();
  document.execCommand("copy");
  document.body.removeChild(box);
}

function openPage(pageName) {
  $all(".page").forEach(page => page.classList.remove("active"));
  const page = byId("page-" + pageName);
  if (page) page.classList.add("active");

  $all(".tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.page === pageName);
  });

  setStatus("Page : " + pageName);
  if (pageName === "system") {
    refreshSystemDetails();
    refreshNetworkHud();
  }
}

window.openPage = openPage;

function setSevenVisibilityMode(mode) {
  const selectedMode = mode === "dark" || mode === "readability" ? "dark" : "transparent";
  const isDark = selectedMode === "dark";

  document.body.classList.remove(
    "mode-transparent",
    "mode-readability",
    "visibility-transparent",
    "visibility-dark",
    "readability-on",
    "readability-off"
  );

  if (isDark) {
    document.body.classList.add("mode-readability", "visibility-dark", "readability-on");
    document.body.dataset.theme = "readability";
    document.body.dataset.visibility = "dark";
  } else {
    document.body.classList.add("mode-transparent", "visibility-transparent", "readability-off");
    document.body.dataset.theme = "transparent";
    document.body.dataset.visibility = "transparent";
  }

  const transparentBtn = byId("transparentModeBtn");
  const readabilityBtn = byId("readabilityShieldBtn");

  if (transparentBtn) transparentBtn.classList.toggle("active", !isDark);
  if (readabilityBtn) readabilityBtn.classList.toggle("active", isDark);

  safeStorageSet(STORAGE.visibility, selectedMode);
  setStatus(isDark ? "Lisibilité sombre : ON" : "Mode transparent : ON");
}

function toggleReadabilityShield() {
  const current = safeStorageGet(STORAGE.visibility, "transparent");
  setSevenVisibilityMode(current === "dark" ? "transparent" : "dark");
}

function bootSevenVisibilityMode() {
  setSevenVisibilityMode(safeStorageGet(STORAGE.visibility, "transparent"));
}

window.setSevenVisibilityMode = setSevenVisibilityMode;
window.setVisibilityMode = setSevenVisibilityMode;
window.toggleReadabilityShield = toggleReadabilityShield;
window.bootSevenVisibilityMode = bootSevenVisibilityMode;

function toggleAdvancedPanels() {
  document.body.classList.toggle("show-advanced");
  const open = document.body.classList.contains("show-advanced");
  const btn = byId("advancedPanelsBtn");
  if (btn) btn.classList.toggle("active", open);
  safeStorageSet(STORAGE.advanced, open ? "1" : "0");
  setStatus(open ? "Advanced Panels ouverts." : "Accueil sobre rétabli.");
}

function bootAdvancedPanels() {
  const open = safeStorageGet(STORAGE.advanced, "0") === "1";
  document.body.classList.toggle("show-advanced", open);
  const btn = byId("advancedPanelsBtn");
  if (btn) btn.classList.toggle("active", open);
}

function openCelestialAtlas() {
  const panel = byId("celestialAtlasPanel");
  if (!panel) {
    setStatus("Celestial Atlas introuvable.");
    return;
  }

  const open = !panel.classList.contains("open");
  panel.classList.toggle("open", open);

  if (open) {
    document.body.classList.add("show-advanced");
    const btn = byId("advancedPanelsBtn");
    if (btn) btn.classList.add("active");
    safeStorageSet(STORAGE.advanced, "1");
    renderAtlasGrid("All");
  }

  setStatus(open ? "Celestial Atlas ouvert." : "Celestial Atlas replié.");
}

function updateAtlasCurrent(item) {
  setText("currentAtlasName", item ? item.name : "chargement…");
  setText("currentAtlasMeta", item ? `${item.family || "Atlas"} · ${item.variant || "fond"}` : "Celestial Atlas");
}

function renderAtlasGrid(family = "All") {
  const grid = byId("atlasPreviewGrid");
  if (!grid) return;

  $all(".atlas-chip").forEach(btn => {
    btn.classList.toggle("selected", btn.dataset.familyFilter === family);
  });

  const items = BACKGROUNDS.filter(item => family === "All" || item.family === family);

  grid.innerHTML = "";
  items.forEach(item => {
    const button = document.createElement("button");
    button.className = "atlas-preview-card";
    button.type = "button";
    button.onclick = () => applyAtlasItem(item.url, item.name, item.family, item.variant);

    const img = document.createElement("img");
    img.src = item.thumb || item.url;
    img.alt = "";
    img.onerror = () => { img.style.display = "none"; };

    const title = document.createElement("span");
    title.className = "atlas-preview-title";
    title.textContent = item.name;

    const meta = document.createElement("span");
    meta.className = "atlas-preview-meta";
    meta.textContent = `${item.family} · ${item.variant || "fond"}`;

    button.appendChild(img);
    button.appendChild(title);
    button.appendChild(meta);
    grid.appendChild(button);
  });

  setStatus("Atlas : " + (family === "All" ? "toutes les familles" : family));
}

function applyAtlasItem(url, name = "Fond Atlas", family = "Atlas", variant = "fond") {
  const index = BACKGROUNDS.findIndex(bg => bg.url === url);
  if (index >= 0) {
    applyBackground(index);
    return;
  }

  document.documentElement.style.setProperty("--active-bg", `url("${url}")`);
  document.body.dataset.atlasFamily = family || "Atlas";
  updateAtlasCurrent({ url, name, family, variant });
  setStatus("Atlas : " + name);
}

function applyBackground(index) {
  backgroundIndex = ((index % BACKGROUNDS.length) + BACKGROUNDS.length) % BACKGROUNDS.length;
  const bg = BACKGROUNDS[backgroundIndex];

  document.documentElement.style.setProperty("--active-bg", `url("${bg.url}")`);
  document.body.dataset.atlasFamily = bg.family || "Atlas";

  safeStorageSet(STORAGE.bg, String(backgroundIndex));
  updateAtlasCurrent(bg);
  setStatus("Fond actif : " + bg.name);
}

function nextBackground() {
  applyBackground(backgroundIndex + 1);
}

function randomBackground() {
  applyBackground(Math.floor(Math.random() * BACKGROUNDS.length));
}

function randomAtlasBackground() {
  randomBackground();
}

function nextAtlasInFamily(family) {
  const items = BACKGROUNDS
    .map((bg, index) => ({ bg, index }))
    .filter(item => item.bg.family === family || item.bg.name.includes(family));

  if (!items.length) {
    setStatus("Famille Atlas introuvable : " + family);
    return;
  }

  const currentUrl = BACKGROUNDS[backgroundIndex]?.url;
  let localIndex = items.findIndex(item => item.bg.url === currentUrl);
  localIndex = (localIndex + 1) % items.length;
  applyBackground(items[localIndex].index);
}

function setAtlasFamily(family) {
  const first = BACKGROUNDS.findIndex(bg => bg.family === family);
  if (first >= 0) applyBackground(first);
  renderAtlasGrid(family);
}

function bootBackground() {
  const saved = parseInt(safeStorageGet(STORAGE.bg, "0"), 10);
  applyBackground(Number.isFinite(saved) ? saved : 0);
}

window.openCelestialAtlas = openCelestialAtlas;
window.renderAtlasGrid = renderAtlasGrid;
window.applyAtlasItem = applyAtlasItem;
window.applyBackground = applyBackground;
window.nextBackground = nextBackground;
window.randomBackground = randomBackground;
window.randomAtlasBackground = randomAtlasBackground;
window.nextAtlasInFamily = nextAtlasInFamily;
window.setAtlasFamily = setAtlasFamily;
window.toggleAdvancedPanels = toggleAdvancedPanels;

function setAmbiance(mode) {
  document.body.dataset.ambiance = mode;
  currentAmbianceIndex = Math.max(0, AMBIANCE_SEQUENCE.indexOf(mode));
  safeStorageSet(STORAGE.ambiance, mode);

  $all("[data-ui-mode]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.uiMode === mode);
  });

  setStatus("Ambiance : " + mode);
}

function cycleAmbiance() {
  currentAmbianceIndex = (currentAmbianceIndex + 1) % AMBIANCE_SEQUENCE.length;
  setAmbiance(AMBIANCE_SEQUENCE[currentAmbianceIndex]);
}

function bootAmbiance() {
  setAmbiance(safeStorageGet(STORAGE.ambiance, "sky"));
}

function setUiMode(mode) {
  setAmbiance(mode);
}

function toggleGlass() {
  document.body.classList.toggle("deep-glass");
  safeStorageSet(STORAGE.glass, document.body.classList.contains("deep-glass") ? "1" : "0");
  setStatus(document.body.classList.contains("deep-glass") ? "Glass : plus transparent." : "Glass : normal.");
}

function togglePreviewMode() {
  document.body.classList.toggle("no-previews");
  const on = !document.body.classList.contains("no-previews");
  safeStorageSet(STORAGE.previews, on ? "1" : "0");
  setStatus(on ? "Destination previews : ON" : "Destination previews : OFF");
}

function bootPreviewMode() {
  const enabled = safeStorageGet(STORAGE.previews, "1") === "1";
  document.body.classList.toggle("no-previews", !enabled);
}

window.setAmbiance = setAmbiance;
window.cycleAmbiance = cycleAmbiance;
window.setUiMode = setUiMode;
window.toggleGlass = toggleGlass;
window.togglePreviewMode = togglePreviewMode;

function getHeroFocusState() {
  return {
    x: Number(byId("heroFocusX")?.value || 50),
    y: Number(byId("heroFocusY")?.value || 34),
    zoom: Number(byId("heroFocusZoom")?.value || 100)
  };
}

function saveFavoriteState() {
  const payload = {
    backgroundIndex,
    background: BACKGROUNDS[backgroundIndex],
    heroFrameIndex,
    heroFocus: getHeroFocusState(),
    ambiance: document.body.dataset.ambiance || "sky",
    visibility: safeStorageGet(STORAGE.visibility, "transparent"),
    advancedOpen: document.body.classList.contains("show-advanced"),
    atlasOpen: byId("celestialAtlasPanel")?.classList.contains("open") || false,
    previews: !document.body.classList.contains("no-previews"),
    glass: document.body.classList.contains("deep-glass"),
    savedAt: new Date().toISOString()
  };

  safeStorageSet(STORAGE.favorite, JSON.stringify(payload));
  setStatus("Favori Seven enregistré.");
}

function loadFavoriteState() {
  let payload = null;

  try {
    payload = JSON.parse(safeStorageGet(STORAGE.favorite, "null"));
  } catch {}

  if (!payload) {
    setStatus("Aucun favori Seven enregistré.");
    return;
  }

  if (typeof payload.backgroundIndex === "number") applyBackground(payload.backgroundIndex);
  if (typeof payload.heroFrameIndex === "number") applyHeroFrame(payload.heroFrameIndex);
  if (payload.heroFocus) applyHeroFocus(payload.heroFocus.x, payload.heroFocus.y, payload.heroFocus.zoom, true);
  setAmbiance(payload.ambiance || "sky");
  setSevenVisibilityMode(payload.visibility || "transparent");

  document.body.classList.toggle("show-advanced", !!payload.advancedOpen);
  const atlas = byId("celestialAtlasPanel");
  if (atlas) atlas.classList.toggle("open", !!payload.atlasOpen);

  document.body.classList.toggle("no-previews", payload.previews === false);
  document.body.classList.toggle("deep-glass", !!payload.glass);

  setStatus("Favori Seven rechargé.");
}

function clearFavoriteState() {
  safeStorageRemove(STORAGE.favorite);
  setStatus("Favori Seven effacé.");
}

function resetVisualState() {
  document.body.classList.remove("show-advanced", "deep-glass", "no-previews", "no-hero-face", "show-hero-focus");

  const atlas = byId("celestialAtlasPanel");
  if (atlas) atlas.classList.remove("open");

  applyBackground(0);
  applyHeroFrame(0);
  applyHeroFocus(50, 34, 100, true);
  setAmbiance("sky");
  setSevenVisibilityMode("transparent");

  safeStorageSet(STORAGE.advanced, "0");
  safeStorageSet(STORAGE.previews, "1");
  setStatus("État visuel réinitialisé.");
}

function resetUiStorage() {
  Object.values(STORAGE).forEach(key => safeStorageRemove(key));
  setStatus("Reset complet effectué. Rechargement…");
  setTimeout(() => location.reload(), 450);
}

window.saveFavoriteState = saveFavoriteState;
window.loadFavoriteState = loadFavoriteState;
window.clearFavoriteState = clearFavoriteState;
window.resetVisualState = resetVisualState;
window.resetUiStorage = resetUiStorage;

function applyHeroFrame(index = 0) {
  if (!HERO_FRAMES.length) return;

  heroFrameIndex = ((index % HERO_FRAMES.length) + HERO_FRAMES.length) % HERO_FRAMES.length;
  const frame = HERO_FRAMES[heroFrameIndex];

  document.documentElement.style.setProperty("--hero-bg", `url("${frame.url}")`);
  document.body.classList.remove("no-hero-face");

  safeStorageSet(STORAGE.heroFrame, String(heroFrameIndex));

  $all(".hero-frame-chip").forEach((el, i) => {
    el.classList.toggle("selected", i === heroFrameIndex);
  });

  setStatus("Hero Frame : " + frame.name);
}

function cycleHeroFrame() {
  applyHeroFrame(heroFrameIndex + 1);
}

function randomHeroFrame() {
  applyHeroFrame(Math.floor(Math.random() * HERO_FRAMES.length));
}

function renderHeroGallery() {
  const grid = byId("heroGalleryGrid");
  if (!grid) return;

  grid.innerHTML = "";

  HERO_FRAMES.forEach((frame, index) => {
    const button = document.createElement("button");
    button.className = "hero-frame-chip";
    button.type = "button";
    button.onclick = () => applyHeroFrame(index);

    const icon = document.createElement("span");
    icon.textContent = frame.label || "🎞️";

    const label = document.createElement("strong");
    label.textContent = frame.name;

    button.appendChild(icon);
    button.appendChild(label);
    grid.appendChild(button);
  });
}

function clampHeroFocus(value, min, max) {
  value = Number(value);
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function applyHeroFocus(x, y, zoom, save = true) {
  x = clampHeroFocus(x, 0, 100);
  y = clampHeroFocus(y, 0, 100);
  zoom = clampHeroFocus(zoom, 100, 180);

  document.documentElement.style.setProperty("--hero-x", x + "%");
  document.documentElement.style.setProperty("--hero-y", y + "%");
  document.documentElement.style.setProperty("--hero-size", zoom <= 100 ? "cover" : zoom + "% auto");

  const xInput = byId("heroFocusX");
  const yInput = byId("heroFocusY");
  const zoomInput = byId("heroFocusZoom");
  const xValue = byId("heroFocusXValue");
  const yValue = byId("heroFocusYValue");
  const zoomValue = byId("heroFocusZoomValue");

  if (xInput) xInput.value = x;
  if (yInput) yInput.value = y;
  if (zoomInput) zoomInput.value = zoom;
  if (xValue) xValue.textContent = x + "%";
  if (yValue) yValue.textContent = y + "%";
  if (zoomValue) zoomValue.textContent = zoom + "%";

  if (save) safeStorageSet(STORAGE.heroFocus, JSON.stringify({ x, y, zoom }));
}

function setHeroFocusFromInputs() {
  applyHeroFocus(
    byId("heroFocusX")?.value || 50,
    byId("heroFocusY")?.value || 34,
    byId("heroFocusZoom")?.value || 100,
    true
  );
  setStatus("Hero Focus ajusté.");
}

function nudgeHeroFocus(dx, dy) {
  const focus = getHeroFocusState();
  applyHeroFocus(focus.x + dx, focus.y + dy, focus.zoom, true);
}

function resetHeroFocus() {
  applyHeroFocus(50, 34, 100, true);
  setStatus("Hero Focus réinitialisé.");
}

function toggleHeroFocusPanel() {
  document.body.classList.toggle("show-hero-focus");
  const open = document.body.classList.contains("show-hero-focus");
  const btn = byId("heroFocusBtn");
  if (btn) btn.classList.toggle("active", open);
  safeStorageSet(STORAGE.heroFocusPanel, open ? "1" : "0");
  setStatus(open ? "Hero Focus ouvert." : "Hero Focus fermé.");
}

function bootHero() {
  renderHeroGallery();

  const savedFrame = parseInt(safeStorageGet(STORAGE.heroFrame, "0"), 10);
  applyHeroFrame(Number.isFinite(savedFrame) ? savedFrame : 0);

  let focus = { x: 50, y: 34, zoom: 100 };
  try {
    focus = { ...focus, ...JSON.parse(safeStorageGet(STORAGE.heroFocus, "null")) };
  } catch {}

  applyHeroFocus(focus.x, focus.y, focus.zoom, false);

  const open = safeStorageGet(STORAGE.heroFocusPanel, "0") === "1";
  document.body.classList.toggle("show-hero-focus", open);
  const btn = byId("heroFocusBtn");
  if (btn) btn.classList.toggle("active", open);

  ["heroFocusX", "heroFocusY", "heroFocusZoom"].forEach(id => {
    const el = byId(id);
    if (el) el.addEventListener("input", setHeroFocusFromInputs);
  });
}

window.applyHeroFrame = applyHeroFrame;
window.cycleHeroFrame = cycleHeroFrame;
window.randomHeroFrame = randomHeroFrame;
window.applyHeroFocus = applyHeroFocus;
window.setHeroFocusFromInputs = setHeroFocusFromInputs;
window.nudgeHeroFocus = nudgeHeroFocus;
window.resetHeroFocus = resetHeroFocus;
window.toggleHeroFocusPanel = toggleHeroFocusPanel;

async function startSeven() {
  await copyText(AERITH_PROMPT);
  setStatus("Seven Boost copié. Ouverture de ChatGPT.");
  setTimeout(() => {
    window.location.href = "https://chatgpt.com/";
  }, 500);
}

async function copySevenOnly() {
  await copyText(AERITH_PROMPT);
  setStatus("Prompt Seven copié.");
}

async function copyVideoCards() {
  await copyText(VIDEO_CARDS_PROMPT);
  setStatus("Video Cards Boost copié.");
}

async function copyBlackout() {
  await copyText(BLACKOUT_PROMPT);
  setStatus("Mode Blackout copié.");
}

async function copyWan() {
  await copyText(WAN_PROMPT);
  setStatus("Checklist Wan copiée.");
}

async function copyModules() {
  await copyText(MODULE_PROMPT);
  setStatus("Prompt Modules copié.");
}

async function copyTerminalLink() {
  await copyText(TERMINAL_LINK);
  setStatus("Lien cockpit copié.");
}

async function copyChannelLink() {
  await copyText(BLUE_AZUR_CHANNEL_LINK);
  setStatus("Lien chaîne Blue Azur copié.");
}

async function copyNotionText() {
  await copyText(NOTION_TEXT);
  setStatus("Texte Notion copié.");
}

function togglePrompt() {
  const drawer = byId("promptDrawer");
  if (drawer) drawer.classList.toggle("open");
  const prompt = byId("promptText");
  if (prompt) prompt.value = AERITH_PROMPT;
  setStatus("Prompt affiché / masqué.");
}

function openRustDeskWeb() {
  setStatus("Ouverture RustDesk Web. Utilise l’ID privé du Ryzen 7.");
  window.location.href = "https://rustdesk.com/web/";
}

window.startSeven = startSeven;
window.copySevenOnly = copySevenOnly;
window.copyVideoCards = copyVideoCards;
window.copyBlackout = copyBlackout;
window.copyWan = copyWan;
window.copyModules = copyModules;
window.copyTerminalLink = copyTerminalLink;
window.copyChannelLink = copyChannelLink;
window.copyNotionText = copyNotionText;
window.togglePrompt = togglePrompt;
window.openRustDeskWeb = openRustDeskWeb;

async function fetchPublicIp() {
  const targets = ["https://api64.ipify.org?format=json", "https://api.ipify.org?format=json"];

  for (const url of targets) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) continue;
      const data = await response.json();
      if (data && data.ip) return data.ip;
    } catch {}
  }

  return "indisponible";
}

function detectConnectionType() {
  const nav = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!nav) return "Ethernet / inconnu";
  const type = nav.type || nav.effectiveType || "inconnu";
  const downlink = nav.downlink ? ` · ${nav.downlink} Mbps` : "";
  return `${type}${downlink}`;
}

function detectOsName() {
  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";

  if (/Windows NT 10\.0/.test(ua)) return "Windows 10 / 11";
  if (/Windows NT 6\.3/.test(ua)) return "Windows 8.1";
  if (/Windows NT 6\.2/.test(ua)) return "Windows 8";
  if (/Windows NT 6\.1/.test(ua)) return "Windows 7";
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/Android/.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS / iPadOS";
  if (/Linux/.test(ua)) return "Linux";
  return platform || "inconnu";
}

function detectBrowserName() {
  const ua = navigator.userAgent || "";

  if (/Edg\//.test(ua)) return "Microsoft Edge";
  if (/Firefox\//.test(ua)) {
    const v = ua.match(/Firefox\/([\d.]+)/);
    return "Firefox" + (v ? " " + v[1] : "");
  }
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) {
    const v = ua.match(/Chrome\/([\d.]+)/);
    return "Chrome" + (v ? " " + v[1] : "");
  }
  if (/Safari\//.test(ua) && /Version\//.test(ua)) {
    const v = ua.match(/Version\/([\d.]+)/);
    return "Safari" + (v ? " " + v[1] : "");
  }

  return "navigateur inconnu";
}

function shortUserAgent() {
  const ua = navigator.userAgent || "indisponible";
  return ua.length > 92 ? ua.slice(0, 92) + "…" : ua;
}

function getScreenInfo() {
  const dpr = window.devicePixelRatio || 1;
  return `${screen.width}×${screen.height} · DPR ${dpr}`;
}

function getViewportInfo() {
  return `viewport ${window.innerWidth}×${window.innerHeight}`;
}

function getTimezoneInfo() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "inconnu";
  } catch {
    return "inconnu";
  }
}

function getLanguageInfo() {
  const langs = navigator.languages && navigator.languages.length ? navigator.languages.join(", ") : navigator.language;
  return langs || "inconnu";
}

function getCpuInfo() {
  return navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} threads` : "non disponible";
}

function getMemoryInfo() {
  return navigator.deviceMemory ? `${navigator.deviceMemory} GB approx.` : "non disponible";
}

function getSessionInfo() {
  const protocol = location.protocol.replace(":", "");
  const host = location.host || "local";
  return `${protocol} · ${host}`;
}

async function refreshBatteryInfo() {
  const batteryInfo = byId("batteryInfo");
  const batteryMode = byId("batteryMode");

  if (!batteryInfo || !batteryMode) return;

  if (!navigator.getBattery) {
    batteryInfo.textContent = "non disponible";
    batteryMode.textContent = "API batterie absente";
    return;
  }

  try {
    const battery = await navigator.getBattery();
    const level = Math.round(battery.level * 100);
    batteryInfo.textContent = `${level}%`;
    batteryMode.textContent = battery.charging ? "en charge" : "sur batterie";
  } catch {
    batteryInfo.textContent = "indisponible";
    batteryMode.textContent = "permission / navigateur";
  }
}

function updateClock() {
  const now = new Date();
  const text = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  setText("localClock", text);
  setText("footerClock", text);
}

async function refreshNetworkHud() {
  const online = navigator.onLine ? "en ligne" : "hors ligne";
  const connection = detectConnectionType();
  const ip = await fetchPublicIp();

  setText("publicIp", ip);
  setText("connectionType", connection);
  setText("onlineStatus", online);
  setText("footerIp", ip);
  setText("footerNet", connection);
}

async function copyNetworkStatus() {
  const ip = byId("publicIp")?.textContent || "inconnue";
  const connection = byId("connectionType")?.textContent || "inconnue";
  const online = byId("onlineStatus")?.textContent || "inconnu";
  const time = byId("localClock")?.textContent || "--:--:--";

  const text = `# Seven Network HUD

Machine :
Transformer Book / cockpit Seven

IP publique :
${ip}

Connexion :
${connection}

Statut :
${online}

Heure locale :
${time}

Remote :
RustDesk vers Ryzen 7

Note :
Le navigateur ne peut pas afficher de façon fiable l’IP locale Ethernet pour des raisons de confidentialité.`;

  await copyText(text);
  setStatus("État réseau copié.");
}

function buildSystemDiagnosticText() {
  const lines = [
    "# Seven System Details HUD",
    "",
    "Machine :",
    "Transformer Book / Seven Portable Terminal",
    "",
    "Système détecté :",
    detectOsName(),
    "",
    "Plateforme navigateur :",
    navigator.platform || "inconnue",
    "",
    "Navigateur :",
    detectBrowserName(),
    "",
    "User Agent :",
    navigator.userAgent || "indisponible",
    "",
    "Écran :",
    getScreenInfo(),
    "",
    "Viewport :",
    getViewportInfo(),
    "",
    "Langue :",
    getLanguageInfo(),
    "",
    "Fuseau horaire :",
    getTimezoneInfo(),
    "",
    "CPU logique :",
    getCpuInfo(),
    "",
    "Mémoire navigateur :",
    getMemoryInfo(),
    "",
    "Connexion :",
    detectConnectionType(),
    "",
    "Statut online :",
    navigator.onLine ? "en ligne" : "hors ligne",
    "",
    "Session :",
    getSessionInfo(),
    "",
    "URL cockpit :",
    location.href,
    "",
    "Sécurité :",
    "Ce diagnostic ne contient ni ID RustDesk ni mot de passe."
  ];

  return lines.join("\n");
}

async function refreshSystemDetails() {
  const os = detectOsName();
  const browser = detectBrowserName();
  const screenText = getScreenInfo();
  const viewportText = getViewportInfo();
  const timezone = getTimezoneInfo();

  setText("osName", os);
  setText("platformName", navigator.platform || "plateforme inconnue");
  setText("browserName", browser);
  setText("userAgentShort", shortUserAgent());
  setText("screenInfo", screenText);
  setText("viewportInfo", viewportText);
  setText("timezoneInfo", timezone);
  setText("languageInfo", getLanguageInfo());
  setText("cpuInfo", getCpuInfo());
  setText("memoryInfo", getMemoryInfo());
  setText("sessionInfo", getSessionInfo());
  setText("pageInfo", location.hostname || "local");

  setText("footerOs", os);
  setText("footerBrowser", browser);
  setText("footerScreen", `${screen.width}×${screen.height}`);
  setText("footerTimezone", timezone);

  setText("traceOs", os);
  setText("tracePlatform", navigator.platform || "plateforme inconnue");
  setText("traceBrowser", browser);
  setText("traceAgent", shortUserAgent());
  setText("traceScreen", screenText);
  setText("traceViewport", viewportText);
  setText("traceTimezone", timezone);
  setText("traceLanguage", getLanguageInfo());
  setText("traceCpu", getCpuInfo());
  setText("traceMemory", getMemoryInfo());
  setText("traceSession", getSessionInfo());
  setText("traceOnline", navigator.onLine ? "en ligne" : "hors ligne");
  setText("traceStamp", new Date().toLocaleString("fr-FR"));

  const raw = byId("advancedSystemText");
  if (raw) raw.value = buildSystemDiagnosticText();

  await refreshBatteryInfo();

  const batteryInfo = byId("batteryInfo");
  const batteryMode = byId("batteryMode");
  setText("traceBattery", batteryInfo ? batteryInfo.textContent : "--");
  setText("traceBatteryMode", batteryMode ? batteryMode.textContent : "détection…");

  syncHomeSystemTrace();
}

async function copySystemDiagnostics() {
  await refreshSystemDetails();
  await copyText(buildSystemDiagnosticText());
  setStatus("Diagnostic système copié. Aucun identifiant RustDesk inclus.");
}

function toggleAdvancedSystem() {
  const panel = byId("advancedSystemPanel");
  if (!panel) return;
  panel.classList.toggle("open");
  const raw = byId("advancedSystemText");
  if (raw) raw.value = buildSystemDiagnosticText();
  setStatus(panel.classList.contains("open") ? "Détails avancés affichés." : "Détails avancés masqués.");
}

function syncHomeSystemTrace() {
  const pairs = [
    ["homeTraceStamp", "traceStamp"],
    ["homeTraceOs", "traceOs"],
    ["homeTracePlatform", "tracePlatform"],
    ["homeTraceBrowser", "traceBrowser"],
    ["homeTraceAgent", "traceAgent"],
    ["homeTraceScreen", "traceScreen"],
    ["homeTraceViewport", "traceViewport"],
    ["homeTraceTimezone", "traceTimezone"],
    ["homeTraceLanguage", "traceLanguage"]
  ];

  pairs.forEach(([homeId, sourceId]) => {
    const home = byId(homeId);
    const source = byId(sourceId);
    if (home && source) home.textContent = source.textContent;
  });
}

function refreshHomeSystemTrace() {
  refreshSystemDetails();
  setStatus("Advanced System Trace accueil actualisé.");
}

async function copyHomeSystemDiagnostics() {
  await copySystemDiagnostics();
}

window.refreshNetworkHud = refreshNetworkHud;
window.copyNetworkStatus = copyNetworkStatus;
window.refreshSystemDetails = refreshSystemDetails;
window.copySystemDiagnostics = copySystemDiagnostics;
window.toggleAdvancedSystem = toggleAdvancedSystem;
window.refreshHomeSystemTrace = refreshHomeSystemTrace;
window.copyHomeSystemDiagnostics = copyHomeSystemDiagnostics;
window.buildSystemDiagnosticText = buildSystemDiagnosticText;

function activeIntelPanel() {
  const page = $(".page.active");
  return page ? page.querySelector(".intel-panel") : $(".intel-panel");
}

function updateIntelPanel(source) {
  const panel = activeIntelPanel();
  if (!panel || !source) return;

  const label = source.getAttribute("aria-label") || source.textContent.trim() || "Commande";
  const help = source.dataset.help || "Commande disponible dans le cockpit Seven.";
  const intent = source.dataset.intent || "hub";
  const intentLabel = INTENT_LABELS[intent] || intent;

  const title = panel.querySelector(".intel-title");
  const text = panel.querySelector(".intel-text");
  const mode = panel.querySelector(".intel-mode");
  const tags = panel.querySelector(".intel-tags");

  if (title) title.textContent = label;
  if (text) text.textContent = help;
  if (mode) mode.textContent = intentLabel;
  if (tags) {
    tags.innerHTML = `<span>✦ ${intentLabel}</span><span>☁️ Seven Heaven UI</span><span>↳ ${source.tagName.toLowerCase()}</span>`;
  }
}

function resetIntelPanel() {
  const panel = activeIntelPanel();
  if (!panel) return;

  const title = panel.querySelector(".intel-title");
  const text = panel.querySelector(".intel-text");
  const mode = panel.querySelector(".intel-mode");
  const tags = panel.querySelector(".intel-tags");

  if (title) title.textContent = "Seven Heaven Guidance";
  if (text) text.textContent = "Survole un bouton pour afficher son rôle, son usage et son niveau de risque.";
  if (mode) mode.textContent = "survol interactif";
  if (tags) tags.innerHTML = `<span>☁️ Sky UI</span><span>💠 aide active</span><span>🖱️ hover / focus</span>`;
}

function bootInteractiveHelp() {
  $all("[data-help]").forEach(el => {
    el.addEventListener("mouseenter", () => updateIntelPanel(el));
    el.addEventListener("focus", () => updateIntelPanel(el));
    el.addEventListener("click", () => updateIntelPanel(el));
  });

  $all(".tile").forEach(el => {
    el.addEventListener("mouseleave", resetIntelPanel);
  });
}

function markSelectedButton(button) {
  $all(".tile.selected, .mini-control.selected").forEach(el => el.classList.remove("selected"));
  if (button) button.classList.add("selected");
}

function bootSelectedGearsOnly() {
  $all(".tile, .mini-control").forEach(el => {
    el.addEventListener("click", () => markSelectedButton(el));
  });
}

function toggleCommandPalette() {
  const palette = byId("commandPalette");
  if (!palette) return;
  const open = !palette.classList.contains("open");
  palette.classList.toggle("open", open);
  palette.setAttribute("aria-hidden", open ? "false" : "true");
  setStatus(open ? "Palette de commandes ouverte." : "Palette de commandes fermée.");
}

function bootKeyboard() {
  document.addEventListener("keydown", event => {
    if (event.target && ["TEXTAREA", "INPUT"].includes(event.target.tagName)) return;

    if (event.key === "?" || event.key === "/") {
      event.preventDefault();
      toggleCommandPalette();
    }

    if (event.key === "Escape") {
      const palette = byId("commandPalette");
      if (palette && palette.classList.contains("open")) toggleCommandPalette();
      document.body.classList.remove("show-hero-focus");
    }

    const map = {
      "1": "home",
      "2": "llm",
      "3": "notion",
      "4": "github",
      "5": "production",
      "6": "system"
    };

    if (map[event.key]) openPage(map[event.key]);
  });
}

window.toggleCommandPalette = toggleCommandPalette;

function spawnTouchGlow(event) {
  if (document.body.classList.contains("no-touch-glow")) return;
  const layer = byId("touchLayer");
  if (!layer) return;

  const dot = document.createElement("span");
  dot.className = "touch-ripple";
  dot.style.left = (event.clientX || 0) + "px";
  dot.style.top = (event.clientY || 0) + "px";
  layer.appendChild(dot);
  setTimeout(() => dot.remove(), 850);
}

function toggleTouchGlow() {
  document.body.classList.toggle("no-touch-glow");
  const on = !document.body.classList.contains("no-touch-glow");
  safeStorageSet(STORAGE.touch, on ? "1" : "0");
  setStatus(on ? "Touch glow : ON" : "Touch glow : OFF");
}

function bootTouchGlow() {
  const enabled = safeStorageGet(STORAGE.touch, "1") === "1";
  document.body.classList.toggle("no-touch-glow", !enabled);

  document.addEventListener("pointerdown", spawnTouchGlow, { passive: true });

  $all(".tile, .tab, .mini-control").forEach(el => {
    el.addEventListener("pointerdown", () => {
      el.classList.add("touched");
      setTimeout(() => el.classList.remove("touched"), 420);
    }, { passive: true });
  });
}

window.toggleTouchGlow = toggleTouchGlow;

function bindNavigationTabs() {
  $all(".tab[data-page]").forEach(tab => {
    tab.addEventListener("click", () => openPage(tab.dataset.page));
  });
}

function boot() {
  bindNavigationTabs();

  const prompt = byId("promptText");
  if (prompt) prompt.value = AERITH_PROMPT;

  bootAdvancedPanels();
  bootAmbiance();
  bootPreviewMode();
  bootBackground();
  bootHero();
  bootSevenVisibilityMode();
  bootInteractiveHelp();
  bootSelectedGearsOnly();
  bootTouchGlow();
  bootKeyboard();

  renderAtlasGrid("All");

  if (safeStorageGet(STORAGE.glass, "0") === "1") {
    document.body.classList.add("deep-glass");
  }

  refreshSystemDetails();
  refreshNetworkHud();
  updateClock();
  setInterval(updateClock, 1000);

  window.addEventListener("online", refreshNetworkHud);
  window.addEventListener("offline", refreshNetworkHud);
  window.addEventListener("resize", () => {
    refreshSystemDetails();
    syncHomeSystemTrace();
  });

  setStatus("Seven Terminal prêt — fichiers complets actifs.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
