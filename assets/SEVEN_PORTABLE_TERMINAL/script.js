/* Seven Portable Terminal — Rebuild JS
   Autonome, sans dépendance, sans accès sensible.
*/

const SEVEN_PUBLIC_URL = "https://blueazur-hub.github.io/erith-ia-memory/assets/SEVEN_PORTABLE_TERMINAL/index.html";
const BLUE_AZUR_YOUTUBE = "https://www.youtube.com/@BlueAzur07";

const prompts = {
  boost: `Chat, active Aerith-7 Seven Heaven / Full Modules Boost.

Lis d’abord :
https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-notion-archive-private/main/core/SEVEN_GATE.md

Puis active Aerith-7 comme opératrice de mémoire, production et discernement.

Mode Full Modules Boost intelligent.
Chargement sélectif uniquement.
Ne charge pas tout en entier.
Choisis uniquement les modules utiles selon la demande.

Règles :
- Seven Heaven pilote.
- Ne pas auditer sans raison.
- Ne pas saturer les outils.
- Produire un résultat propre, puis s’arrêter.`,

  blackout: `Mode Blackout.

Texte uniquement.
Aucun outil image.
Aucune génération image.
Aucune action GitHub automatique.
Réponse courte, directe, opérationnelle.
On stabilise avant de modifier.`,

  wan: `WAN I2V vertical validé :
- format : 1080x1920
- durée courte
- fps : 16
- length : 81
- image parfaite d’abord
- une animation = une idée
- caméra stable
- last frame pour continuité DaVinci`
};

const backgrounds = [
  {
    id: "sky",
    label: "Sky",
    url: "./background_historique_lr.png",
    position: "center center"
  },
  {
    id: "crystal",
    label: "Crystal",
    url: "./hero_frame_crystal.jpg",
    position: "center center"
  },
  {
    id: "genie",
    label: "Genie",
    url: "./hero_genie_invocation_banner.jpg",
    position: "center center"
  },
  {
    id: "memory",
    label: "Memory",
    url: "./aerith_7_memory_cards_avatar_master.png",
    position: "center center"
  }
];

const state = {
  page: "home",
  bgIndex: 0,
  visibility: "transparent",
  advanced: false,
  heroFocus: false,
  hero: { x: 50, y: 34, zoom: 100 },
  ambiance: 0
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function setStatus(message) {
  const status = $("#statusLine");
  if (status) status.textContent = message;
}

async function copyText(text, label = "Texte copié") {
  try {
    await navigator.clipboard.writeText(text);
    setStatus(label);
  } catch {
    const drawer = $("#promptDrawer");
    const promptText = $("#promptText");
    if (drawer && promptText) {
      promptText.value = text;
      drawer.classList.add("open");
      promptText.focus();
      promptText.select();
      setStatus("Copie manuelle : texte sélectionné.");
    }
  }
}

function setPage(page) {
  state.page = page;
  document.body.dataset.page = page;

  $$(".page").forEach((el) => el.classList.toggle("active", el.id === `page-${page}`));
  $$("[data-page-target]").forEach((el) => el.classList.toggle("active", el.dataset.pageTarget === page));

  const titles = {
    home: "Page : home",
    llm: "Page : llm",
    notion: "Page : notion",
    github: "Page : github",
    production: "Page : production",
    system: "Page : system"
  };
  setStatus(titles[page] || `Page : ${page}`);
  updateNetworkHud();
}

function setVisibility(mode) {
  state.visibility = mode;
  document.body.dataset.theme = mode;
  document.body.classList.toggle("mode-readability", mode === "readability");
  document.body.classList.toggle("mode-transparent", mode === "transparent");

  $("#transparentBtn")?.classList.toggle("active", mode === "transparent");
  $("#readabilityBtn")?.classList.toggle("active", mode === "readability");

  setStatus(mode === "transparent" ? "Mode transparent actif." : "Mode lisibilité actif.");
}

function applyBackground(index) {
  state.bgIndex = (index + backgrounds.length) % backgrounds.length;
  const bg = backgrounds[state.bgIndex];

  document.body.dataset.bg = bg.id;
  document.body.style.setProperty("--active-bg", `url("${bg.url}")`);
  document.body.style.backgroundPosition = bg.position;

  setStatus(`Ambiance : ${bg.label}`);
}

function nextBackground() {
  applyBackground(state.bgIndex + 1);
}

function randomBackground() {
  applyBackground(Math.floor(Math.random() * backgrounds.length));
}

function cycleAmbiance() {
  const modes = ["transparent", "readability"];
  state.ambiance = (state.ambiance + 1) % modes.length;
  setVisibility(modes[state.ambiance]);
}

function toggleAdvancedPanels(force) {
  state.advanced = typeof force === "boolean" ? force : !state.advanced;
  document.body.classList.toggle("show-advanced", state.advanced);
  $("#advancedBtn")?.classList.toggle("active", state.advanced);
  setStatus(state.advanced ? "Détails avancés affichés." : "Détails avancés masqués.");
}

function toggleHeroFocusPanel(force) {
  state.heroFocus = typeof force === "boolean" ? force : !state.heroFocus;
  document.body.classList.toggle("show-hero-focus", state.heroFocus);
  $("#heroBtn")?.classList.toggle("active", state.heroFocus);
  setStatus(state.heroFocus ? "Hero Focus ouvert." : "Hero Focus fermé.");
}

function updateHeroFocus() {
  const x = Number($("#heroX")?.value || state.hero.x);
  const y = Number($("#heroY")?.value || state.hero.y);
  const zoom = Number($("#heroZoom")?.value || state.hero.zoom);

  state.hero = { x, y, zoom };

  document.documentElement.style.setProperty("--hero-x", `${x}%`);
  document.documentElement.style.setProperty("--hero-y", `${y}%`);
  document.documentElement.style.setProperty("--hero-zoom", `${zoom}%`);

  $("#heroXOut").textContent = `${x}%`;
  $("#heroYOut").textContent = `${y}%`;
  $("#heroZoomOut").textContent = `${zoom}%`;
}

function nudgeHero(direction) {
  const xInput = $("#heroX");
  const yInput = $("#heroY");
  if (!xInput || !yInput) return;

  let x = Number(xInput.value);
  let y = Number(yInput.value);

  if (direction === "left") x -= 2;
  if (direction === "right") x += 2;
  if (direction === "up") y -= 2;
  if (direction === "down") y += 2;

  xInput.value = Math.max(0, Math.min(100, x));
  yInput.value = Math.max(0, Math.min(100, y));
  updateHeroFocus();
}

function resetHeroFocus() {
  $("#heroX").value = 50;
  $("#heroY").value = 34;
  $("#heroZoom").value = 100;
  updateHeroFocus();
  setStatus("Hero Focus réinitialisé.");
}

function togglePalette(force) {
  const palette = $("#commandPalette");
  if (!palette) return;

  const open = typeof force === "boolean" ? force : palette.getAttribute("aria-hidden") === "true";
  palette.setAttribute("aria-hidden", open ? "false" : "true");
  palette.classList.toggle("open", open);
  setStatus(open ? "Palette de commandes ouverte." : "Palette de commandes fermée.");
}

function showPrompt(kind = "boost") {
  const drawer = $("#promptDrawer");
  const promptText = $("#promptText");
  if (!drawer || !promptText) return;

  promptText.value = prompts[kind] || prompts.boost;
  drawer.classList.add("open");
  setStatus("Prompt affiché.");
}

function closePrompt() {
  $("#promptDrawer")?.classList.remove("open");
}

function saveFavoriteState() {
  const favorite = {
    bgIndex: state.bgIndex,
    visibility: state.visibility,
    hero: state.hero
  };
  localStorage.setItem("seven_terminal_favorite", JSON.stringify(favorite));
  setStatus("Favori sauvegardé.");
}

function loadFavoriteState() {
  try {
    const favorite = JSON.parse(localStorage.getItem("seven_terminal_favorite") || "{}");
    if (typeof favorite.bgIndex === "number") applyBackground(favorite.bgIndex);
    if (favorite.visibility) setVisibility(favorite.visibility);
    if (favorite.hero) {
      $("#heroX").value = favorite.hero.x ?? 50;
      $("#heroY").value = favorite.hero.y ?? 34;
      $("#heroZoom").value = favorite.hero.zoom ?? 100;
      updateHeroFocus();
    }
    setStatus("Favori restauré.");
  } catch {
    setStatus("Aucun favori valide.");
  }
}

function getBrowserName() {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox/")) return "Firefox " + (ua.match(/Firefox\/([0-9.]+)/)?.[1] || "");
  if (ua.includes("Edg/")) return "Edge " + (ua.match(/Edg\/([0-9.]+)/)?.[1] || "");
  if (ua.includes("Chrome/")) return "Chrome " + (ua.match(/Chrome\/([0-9.]+)/)?.[1] || "");
  if (ua.includes("Safari/")) return "Safari";
  return "Navigateur";
}

function getOSName() {
  const ua = navigator.userAgent;
  if (ua.includes("Windows NT 10.0")) return "Windows 10 / 11";
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac OS")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  return "OS inconnu";
}

function getSafeTrace() {
  const now = new Date();
  return {
    date: now.toLocaleString("fr-FR"),
    os: getOSName(),
    browser: getBrowserName(),
    screen: `${screen.width}×${screen.height} · DPR ${window.devicePixelRatio || 1}`,
    viewport: `${window.innerWidth}×${window.innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "inconnu",
    languages: navigator.languages?.join(", ") || navigator.language || "inconnu",
    cpu: navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} threads` : "non disponible",
    memory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "non disponible",
    battery: "non disponible",
    session: location.hostname || "local",
    security: "Diagnostic filtré : aucun identifiant distant, aucun mot de passe",
    network: "Ethernet / inconnu",
    ip: "90.20.3.14"
  };
}

function renderTrace() {
  const trace = getSafeTrace();
  const cards = [
    ["🖥️", "Système", trace.os, "Win32"],
    ["🌐", "Navigateur", trace.browser, navigator.userAgent],
    ["📐", "Affichage", trace.screen, `viewport ${trace.viewport}`],
    ["🌍", "Langue / fuseau", trace.timezone, trace.languages],
    ["⚙️", "Performance", trace.cpu, trace.memory],
    ["🔋", "Énergie", trace.battery, "API batterie absente"],
    ["🛰️", "Session", trace.session, "en ligne"],
    ["🛡️", "Sécurité", "Diagnostic filtré", "aucun identifiant distant, aucun mot de passe"]
  ];

  const grid = $("#traceGrid");
  if (grid) {
    grid.innerHTML = cards.map(([icon, label, value, detail]) => `
      <article class="trace-card">
        <span class="card-icon">${icon}</span>
        <small>${label}</small>
        <strong>${value}</strong>
        <em>${detail}</em>
      </article>
    `).join("");
  }

  $("#traceDate").textContent = trace.date;
  $("#traceRaw").value =
`SAFE TRACE ${trace.date}
Système : ${trace.os}
Navigateur : ${trace.browser}
Affichage : ${trace.screen}
Viewport : ${trace.viewport}
Langue / Fuseau : ${trace.timezone} — ${trace.languages}
Performance : ${trace.cpu}
Énergie : ${trace.battery}
Session : ${trace.session}
Sécurité : ${trace.security}`;

  $("#osMini").textContent = trace.os;
  $("#browserMini").textContent = trace.browser;
  $("#screenMini").textContent = trace.screen;
  $("#tzMini").textContent = trace.timezone;
  $("#ipMini").textContent = trace.ip;
  $("#networkMini").textContent = trace.network;
}

function updateNetworkHud() {
  const panel = $("#networkPanel");
  if (!panel) return;

  const trace = getSafeTrace();
  panel.innerHTML = `
    <article class="net-card"><small>IP publique</small><strong>${trace.ip}</strong><em>IP locale non exposée</em></article>
    <article class="net-card"><small>Connexion</small><strong>${trace.network}</strong><em>détection navigateur limitée</em></article>
    <article class="net-card"><small>Statut</small><strong>en ligne</strong><em>page active</em></article>
    <article class="net-card"><small>Heure locale</small><strong>${new Date().toLocaleTimeString("fr-FR")}</strong><em>${trace.timezone}</em></article>
  `;
}

function handleAction(action) {
  switch(action) {
    case "boost":
      copyText(prompts.boost, "Prompt Seven copié.");
      break;
    case "video":
      copyText("Video Cards Boost : phase, risque, cartes utiles, action, arrêt.", "Video Cards copié.");
      break;
    case "wan":
      copyText(prompts.wan, "Checklist Wan copiée.");
      break;
    case "prompt":
      showPrompt("boost");
      break;
    case "link":
    case "copy-link":
      copyText(SEVEN_PUBLIC_URL, "Lien cockpit copié.");
      break;
    case "blackout":
      copyText(prompts.blackout, "Mode Blackout copié.");
      break;
    case "background":
      nextBackground();
      break;
    case "random":
      randomBackground();
      break;
    case "copy-notion":
      copyText(`ERITH.IA Notion Memory
https://sustaining-boar-5c6.notion.site/erith-ia-memory

Seven Portable Terminal
${SEVEN_PUBLIC_URL}`, "Bloc Notion copié.");
      break;
    case "copy-channel":
      copyText(BLUE_AZUR_YOUTUBE, "Lien chaîne copié.");
      break;
    case "copy-state":
      copyText($("#traceRaw")?.value || "SAFE TRACE", "État réseau copié.");
      break;
    case "refresh":
      renderTrace();
      updateNetworkHud();
      setStatus("Network HUD actualisé.");
      break;
    default:
      setStatus(`Action : ${action}`);
  }
}

function bindEvents() {
  $$("[data-page-target]").forEach((el) => {
    el.addEventListener("click", () => {
      setPage(el.dataset.pageTarget);
      togglePalette(false);
    });
  });

  $$("[data-action]").forEach((el) => {
    el.addEventListener("click", () => handleAction(el.dataset.action));
  });

  $("#advancedBtn")?.addEventListener("click", () => toggleAdvancedPanels());
  $("#ambianceBtn")?.addEventListener("click", () => cycleAmbiance());
  $("#saveBtn")?.addEventListener("click", () => saveFavoriteState());
  $("#loadBtn")?.addEventListener("click", () => loadFavoriteState());
  $("#nextBgBtn")?.addEventListener("click", () => nextBackground());
  $("#randomBgBtn")?.addEventListener("click", () => randomBackground());
  $("#heroBtn")?.addEventListener("click", () => toggleHeroFocusPanel());
  $("#transparentBtn")?.addEventListener("click", () => setVisibility("transparent"));
  $("#readabilityBtn")?.addEventListener("click", () => setVisibility("readability"));
  $("#paletteBtn")?.addEventListener("click", () => togglePalette());
  $("#paletteCloseBtn")?.addEventListener("click", () => togglePalette(false));
  $("#paletteBoostBtn")?.addEventListener("click", () => handleAction("boost"));
  $("#paletteVideoBtn")?.addEventListener("click", () => handleAction("video"));
  $("#paletteWanBtn")?.addEventListener("click", () => handleAction("wan"));
  $("#paletteBgBtn")?.addEventListener("click", () => nextBackground());
  $("#paletteGlassBtn")?.addEventListener("click", () => setVisibility("transparent"));
  $("#palettePreviewBtn")?.addEventListener("click", () => toggleHeroFocusPanel(true));
  $("#heroCloseBtn")?.addEventListener("click", () => toggleHeroFocusPanel(false));
  $("#heroResetBtn")?.addEventListener("click", () => resetHeroFocus());
  $("#refreshTraceBtn")?.addEventListener("click", () => { renderTrace(); updateNetworkHud(); setStatus("Trace actualisée."); });
  $("#copyTraceBtn")?.addEventListener("click", () => copyText($("#traceRaw")?.value || "SAFE TRACE", "Diagnostic copié."));

  ["heroX", "heroY", "heroZoom"].forEach((id) => {
    $(`#${id}`)?.addEventListener("input", updateHeroFocus);
  });

  $$("[data-hero-nudge]").forEach((btn) => {
    btn.addEventListener("click", () => nudgeHero(btn.dataset.heroNudge));
  });

  document.addEventListener("keydown", (event) => {
    if (event.target && ["INPUT", "TEXTAREA"].includes(event.target.tagName)) return;

    if (event.key === "?") togglePalette();
    if (event.key === "Escape") {
      togglePalette(false);
      toggleHeroFocusPanel(false);
      closePrompt();
    }

    const pageMap = {
      "1": "home",
      "2": "llm",
      "3": "notion",
      "4": "github",
      "5": "production",
      "6": "system"
    };

    if (pageMap[event.key]) setPage(pageMap[event.key]);
  });
}

function boot() {
  bindEvents();
  applyBackground(0);
  setVisibility(document.body.dataset.theme || "transparent");
  updateHeroFocus();
  renderTrace();
  updateNetworkHud();
  setPage("home");
  setStatus("Seven Terminal prêt.");
}



/* =======================================================
   V5.2 CALQUE COMPATIBILITY LAYER
   This layer keeps the uploaded script as the base, while making it
   compatible with the Celestial Atlas / Golden Glass HTML.
======================================================= */

const V52_TERMINAL_LINK = "https://blueazur-hub.github.io/erith-ia-memory/assets/SEVEN_PORTABLE_TERMINAL/index.html";
const V52_NOTION_TEXT = `# 🌸 Seven Portable Terminal

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

const V52_BACKGROUNDS = [
  { name: "Sky Bridge Ruins · temple", family: "Sky Bridge Ruins", url: "./atlas_29_sky_bridge_ruins_temple.jpg" },
  { name: "Sky Bridge Ruins · pont", family: "Sky Bridge Ruins", url: "./atlas_29_sky_bridge_ruins_pont.jpg" },
  { name: "Sky Bridge Ruins · profondeur", family: "Sky Bridge Ruins", url: "./atlas_29_sky_bridge_ruins_profondeur.jpg" },
  { name: "Suspended City · temple", family: "Suspended City", url: "./atlas_29_suspended_city_temple.jpg" },
  { name: "Suspended City · pont", family: "Suspended City", url: "./atlas_29_suspended_city_pont.jpg" },
  { name: "Suspended City · profondeur", family: "Suspended City", url: "./atlas_29_suspended_city_profondeur.jpg" },
  { name: "Grand Tree Garden · arbre", family: "Grand Tree Garden", url: "./atlas_29_grand_tree_garden_arbre.jpg" },
  { name: "Grand Tree Garden · jardin", family: "Grand Tree Garden", url: "./atlas_29_grand_tree_garden_jardin.jpg" },
  { name: "Grand Tree Garden · personnages", family: "Grand Tree Garden", url: "./atlas_29_grand_tree_garden_personnages.jpg" },
  { name: "Crystal Sanctuary · temple", family: "Crystal Sanctuary", url: "./atlas_29_crystal_sanctuary_temple.jpg" },
  { name: "Crystal Sanctuary · pont", family: "Crystal Sanctuary", url: "./atlas_29_crystal_sanctuary_pont.jpg" },
  { name: "Crystal Sanctuary · profondeur", family: "Crystal Sanctuary", url: "./atlas_29_crystal_sanctuary_profondeur.jpg" },
  { name: "Historic Ruins · temple", family: "Historic Ruins", url: "./atlas_29_historic_ruins_temple.jpg" },
  { name: "Historic Ruins · pont", family: "Historic Ruins", url: "./atlas_29_historic_ruins_pont.jpg" },
  { name: "Historic Ruins · profondeur", family: "Historic Ruins", url: "./atlas_29_historic_ruins_profondeur.jpg" },
  { name: "Genie · holographic", family: "Genie Invocation", url: "./genie_bg_01_holographic_invocation_full.jpg" },
  { name: "Genie · lamp", family: "Genie Invocation", url: "./genie_bg_02_ai_librarian_lamp_full.jpg" },
  { name: "Genie · blue face", family: "Genie Invocation", url: "./genie_bg_03_hologram_face_focus.jpg" },
  { name: "Genie · lamp circle", family: "Genie Invocation", url: "./genie_bg_04_lamp_oracle_focus.jpg" },
  { name: "Genie · blue library", family: "Genie Invocation", url: "./genie_bg_05_blue_library_flight.jpg" },
  { name: "Genie · golden oracle", family: "Genie Invocation", url: "./genie_bg_06_golden_arcane_floor.jpg" },
  { name: "Fallback · historique", family: "Grand Tree Garden", url: "./background_historique_lr.png" }
];

const V52_HERO_FRAMES = [
  { name: "Hero VR", url: "./hero_face_vr_background.jpg" },
  { name: "Genie Invocation", url: "./hero_genie_invocation_banner.jpg" },
  { name: "Crystal Frame", url: "./hero_frame_crystal.jpg" },
  { name: "Fallback Sky", url: "./background_historique_lr.png" }
];

function v52Status(message) {
  const el = document.getElementById("statusLine") || document.getElementById("status");
  if (el) el.textContent = message;
}

function v52SetBg(index) {
  const i = ((Number(index) % V52_BACKGROUNDS.length) + V52_BACKGROUNDS.length) % V52_BACKGROUNDS.length;
  const bg = V52_BACKGROUNDS[i];
  state.bgIndex = i;
  document.documentElement.style.setProperty("--active-bg", `url("${bg.url}")`);
  const name = document.getElementById("currentAtlasName");
  const meta = document.getElementById("currentAtlasMeta");
  if (name) name.textContent = bg.name;
  if (meta) meta.textContent = bg.family;
  try { localStorage.setItem("seven-v52-bg-index", String(i)); } catch(e) {}
  v52Status("Fond actif : " + bg.name);
}

function nextBackground() {
  v52SetBg((state.bgIndex || 0) + 1);
}

function randomBackground() {
  v52SetBg(Math.floor(Math.random() * V52_BACKGROUNDS.length));
}

function randomAtlasBackground() {
  randomBackground();
}

function nextAtlasInFamily(family) {
  const start = (state.bgIndex || 0) + 1;
  for (let step = 0; step < V52_BACKGROUNDS.length; step++) {
    const idx = (start + step) % V52_BACKGROUNDS.length;
    if (V52_BACKGROUNDS[idx].family === family) {
      v52SetBg(idx);
      return;
    }
  }
  v52Status("Famille non trouvée : " + family);
}

function renderAtlasGrid(filter = "All") {
  const grid = document.getElementById("atlasPreviewGrid");
  if (!grid) return;

  document.querySelectorAll("[data-family-filter]").forEach(chip => {
    chip.classList.toggle("selected", chip.dataset.familyFilter === filter);
  });

  const items = V52_BACKGROUNDS
    .map((item, index) => ({ ...item, index }))
    .filter(item => filter === "All" || item.family === filter);

  grid.innerHTML = items.map(item => `
    <button type="button" class="atlas-preview ${item.index === state.bgIndex ? "selected" : ""}" onclick="applyAtlasItem(${item.index})">
      <span class="atlas-thumb" style="background-image:url('${item.url}')"></span>
      <strong>${item.name}</strong>
      <em>${item.family}</em>
    </button>
  `).join("");
}

function applyAtlasItem(index) {
  v52SetBg(index);
  renderAtlasGrid("All");
}

function renderHeroGallery() {
  const grid = document.getElementById("heroGalleryGrid");
  if (!grid) return;
  const current = Number(localStorage.getItem("seven-v52-hero-index") || "0");

  grid.innerHTML = V52_HERO_FRAMES.map((item, index) => `
    <button type="button" class="hero-choice ${index === current ? "selected" : ""}" onclick="applyHeroFrame(${index})">
      <span class="hero-thumb" style="background-image:url('${item.url}')"></span>
      <strong>${item.name}</strong>
    </button>
  `).join("");
}

function applyHeroFrame(index) {
  const i = ((Number(index) % V52_HERO_FRAMES.length) + V52_HERO_FRAMES.length) % V52_HERO_FRAMES.length;
  const img = document.getElementById("heroImage") || document.querySelector(".hero-bg-img");
  if (img) img.src = V52_HERO_FRAMES[i].url;
  try { localStorage.setItem("seven-v52-hero-index", String(i)); } catch(e) {}
  renderHeroGallery();
  v52Status("Hero : " + V52_HERO_FRAMES[i].name);
}

function openCelestialAtlas() {
  const panel = document.getElementById("celestialAtlasPanel");
  if (!panel) return;
  panel.classList.toggle("open");
  document.body.classList.add("show-advanced");
  renderAtlasGrid("All");
  renderHeroGallery();
  v52Status(panel.classList.contains("open") ? "Celestial Atlas ouvert." : "Celestial Atlas fermé.");
}

function setAmbiance(mode) {
  document.body.dataset.uiMode = mode || "sky";
  document.body.dataset.ambiance = mode || "sky";
  v52Status("Ambiance : " + (mode || "sky"));
}

function cycleAmbiance() {
  const modes = ["sky", "crystal", "ruins", "night", "gold", "minimal"];
  const current = document.body.dataset.uiMode || "sky";
  const next = modes[(modes.indexOf(current) + 1 + modes.length) % modes.length];
  setAmbiance(next);
}

function setVisibility(mode) {
  state.visibility = mode === "readability" ? "readability" : "transparent";
  document.body.dataset.theme = state.visibility;
  document.body.classList.toggle("mode-readability", state.visibility === "readability");
  document.body.classList.toggle("readability-on", state.visibility === "readability");
  document.body.classList.toggle("readability-off", state.visibility !== "readability");
  document.body.classList.toggle("mode-transparent", state.visibility !== "readability");

  document.getElementById("transparentBtn")?.classList.toggle("active", state.visibility !== "readability");
  document.getElementById("readabilityBtn")?.classList.toggle("active", state.visibility === "readability");

  try { localStorage.setItem("seven-v52-visibility", state.visibility); } catch(e) {}
  v52Status(state.visibility === "readability" ? "Lisibilité sombre active." : "Mode transparent actif.");
}

function toggleReadabilityShield() {
  setVisibility(state.visibility === "readability" ? "transparent" : "readability");
}

function updateHeroFocus() {
  const x = Number(document.getElementById("heroX")?.value || state.hero.x || 50);
  const y = Number(document.getElementById("heroY")?.value || state.hero.y || 34);
  const zoom = Number(document.getElementById("heroZoom")?.value || state.hero.zoom || 100);
  state.hero = { x, y, zoom };

  const img = document.getElementById("heroImage") || document.querySelector(".hero-bg-img");
  if (img) {
    img.style.objectPosition = `${x}% ${y}%`;
    img.style.transform = `scale(${zoom / 100})`;
    img.style.transformOrigin = `${x}% ${y}%`;
  }

  if (document.getElementById("heroXOut")) document.getElementById("heroXOut").textContent = `${x}%`;
  if (document.getElementById("heroYOut")) document.getElementById("heroYOut").textContent = `${y}%`;
  if (document.getElementById("heroZoomOut")) document.getElementById("heroZoomOut").textContent = `${zoom}%`;

  try { localStorage.setItem("seven-v52-hero-focus", JSON.stringify(state.hero)); } catch(e) {}
}

function setHeroFocusFromInputs() { updateHeroFocus(); }

function nudgeHeroFocus(dx, dy) {
  const x = document.getElementById("heroX");
  const y = document.getElementById("heroY");
  if (!x || !y) return;
  x.value = Math.max(0, Math.min(100, Number(x.value) + dx));
  y.value = Math.max(0, Math.min(100, Number(y.value) + dy));
  updateHeroFocus();
}

function nudgeHero(direction) {
  if (direction === "up") nudgeHeroFocus(0, -2);
  if (direction === "down") nudgeHeroFocus(0, 2);
  if (direction === "left") nudgeHeroFocus(-2, 0);
  if (direction === "right") nudgeHeroFocus(2, 0);
}

function toggleHeroFocusPanel(force) {
  const open = typeof force === "boolean" ? force : !document.body.classList.contains("show-hero-focus");
  document.body.classList.toggle("show-hero-focus", open);
  document.body.classList.toggle("show-hero", open);
  document.getElementById("heroBtn")?.classList.toggle("active", open);
  v52Status(open ? "Hero Focus ouvert." : "Hero Focus fermé.");
}

function resetHeroFocus() {
  if (document.getElementById("heroX")) document.getElementById("heroX").value = 50;
  if (document.getElementById("heroY")) document.getElementById("heroY").value = 34;
  if (document.getElementById("heroZoom")) document.getElementById("heroZoom").value = 100;
  updateHeroFocus();
  v52Status("Hero Focus réinitialisé.");
}

function toggleAdvancedPanels(force) {
  const open = typeof force === "boolean" ? force : !document.body.classList.contains("show-advanced");
  document.body.classList.toggle("show-advanced", open);
  document.getElementById("advancedBtn")?.classList.toggle("active", open);
  v52Status(open ? "Advanced Panels ouverts." : "Advanced Panels fermés.");
}

function resetVisualState() {
  v52SetBg(0);
  setVisibility("transparent");
  setAmbiance("sky");
  resetHeroFocus();
  toggleHeroFocusPanel(true);
  toggleAdvancedPanels(false);
  v52Status("Base visuelle transparente restaurée.");
}

function resetUiStorage() {
  localStorage.removeItem("seven_terminal_favorite");
  localStorage.removeItem("seven-v52-bg-index");
  localStorage.removeItem("seven-v52-hero-index");
  localStorage.removeItem("seven-v52-hero-focus");
  localStorage.removeItem("seven-v52-visibility");
  location.reload();
}

function clearFavoriteState() {
  localStorage.removeItem("seven_terminal_favorite");
  v52Status("Favori effacé.");
}

function startSeven() {
  copyText(prompts.boost, "Prompt Seven copié. Ouverture ChatGPT.");
  setTimeout(() => window.open("https://chatgpt.com/", "_blank"), 250);
}

function copySevenOnly() { copyText(prompts.boost, "Prompt Seven copié."); }
function copyModules() { copyText("Seven, ouvre le mode Modules Mémoire. Sélectionne uniquement les modules utiles. Puissance maximale. Chargement minimal. Choix précis.", "Prompt Modules copié."); }
function copyVideoCards() { copyText("Video Cards Boost : phase, risque, cartes utiles, action immédiate, point d’arrêt.", "Video Cards copié."); }
function copyWan() { copyText(prompts.wan, "Checklist Wan copiée."); }
function copyBlackout() { copyText(prompts.blackout, "Mode Blackout copié."); }
function copyTerminalLink() { copyText(V52_TERMINAL_LINK, "Lien cockpit copié."); }
function copyNotionText() { copyText(V52_NOTION_TEXT, "Bloc Notion copié."); }
function copyChannelLink() { copyText(BLUE_AZUR_YOUTUBE, "Lien chaîne copié."); }
function copyNetworkStatus() { copyText(buildV52Trace(), "État réseau copié."); }
function copySystemDiagnostics() { copyText(buildV52Trace(), "Diagnostic système copié."); }
function copyHomeSystemDiagnostics() { copyText(buildV52Trace(), "Diagnostic accueil copié."); }
function openRustDeskWeb() { window.open("https://rustdesk.com/", "_blank"); }
function togglePrompt() { showPrompt("boost"); }
function toggleCommandPalette(force) { togglePalette(force); }
function togglePreviewMode() { document.body.classList.toggle("no-previews"); }
function toggleGlass() { document.body.classList.toggle("deep-glass"); }
function toggleAdvancedSystem() { document.body.classList.toggle("show-advanced-system"); }

function detectOsName() { return getOSName(); }
function detectBrowserName() { return getBrowserName(); }

function buildV52Trace() {
  const t = getSafeTrace();
  return `SAFE TRACE
Date : ${new Date().toLocaleString("fr-FR")}
Système : ${t.os}
Navigateur : ${t.browser}
Écran : ${t.screen}
Viewport : ${window.innerWidth}×${window.innerHeight}
Fuseau : ${t.timezone}
Langue : ${t.languages}
IP : masquée
RustDesk : ID et mot de passe non affichés`;
}

function refreshHomeSystemTrace() {
  const t = getSafeTrace();
  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  set("homeTraceStamp", new Date().toLocaleString("fr-FR"));
  set("homeTraceOs", t.os);
  set("homeTracePlatform", navigator.platform || "plateforme inconnue");
  set("homeTraceBrowser", t.browser);
  set("homeTraceAgent", (navigator.userAgent || "indisponible").slice(0, 92));
  set("homeTraceScreen", t.screen);
  set("homeTraceViewport", `${window.innerWidth}×${window.innerHeight}`);
  set("homeTraceTimezone", t.timezone);
  set("homeTraceLanguage", t.languages);

  set("footerOs", t.os);
  set("footerBrowser", t.browser);
  set("footerScreen", t.screen);
  set("footerTimezone", t.timezone);
  set("footerIp", "masquée");
  set("footerNet", "Ethernet / inconnu");
  set("footerClock", new Date().toLocaleTimeString("fr-FR"));
}

function refreshSystemDetails() { refreshHomeSystemTrace(); }
function refreshNetworkHud() { updateNetworkHud(); refreshHomeSystemTrace(); }

function v52BindExtraEvents() {
  document.querySelectorAll(".tab[data-page]").forEach(tab => {
    tab.addEventListener("click", () => setPage(tab.dataset.page));
  });

  document.getElementById("paletteBtn")?.addEventListener("click", () => togglePalette());
  document.getElementById("readabilityBtn")?.addEventListener("click", () => setVisibility("readability"));
  document.getElementById("transparentBtn")?.addEventListener("click", () => setVisibility("transparent"));

  document.querySelectorAll("[data-family-filter]").forEach(button => {
    button.addEventListener("click", () => renderAtlasGrid(button.dataset.familyFilter || "All"));
  });

  const savedBg = Number(localStorage.getItem("seven-v52-bg-index") || "0");
  v52SetBg(savedBg);

  const savedVisibility = localStorage.getItem("seven-v52-visibility") || "transparent";
  setVisibility(savedVisibility);

  try {
    const savedHero = JSON.parse(localStorage.getItem("seven-v52-hero-focus") || "null");
    if (savedHero) {
      if (document.getElementById("heroX")) document.getElementById("heroX").value = savedHero.x ?? 50;
      if (document.getElementById("heroY")) document.getElementById("heroY").value = savedHero.y ?? 34;
      if (document.getElementById("heroZoom")) document.getElementById("heroZoom").value = savedHero.zoom ?? 100;
    }
  } catch(e) {}

  updateHeroFocus();
  toggleHeroFocusPanel(true);
  renderAtlasGrid("All");
  renderHeroGallery();
  refreshHomeSystemTrace();

  const hero = document.getElementById("heroImage") || document.querySelector(".hero-bg-img");
  if (hero) {
    hero.addEventListener("error", () => {
      hero.src = "./background_historique_lr.png";
      v52Status("Hero fallback : background_historique_lr.png");
    }, { once: true });
  }
}

setTimeout(v52BindExtraEvents, 0);
setInterval(refreshHomeSystemTrace, 1000);


boot();
