/* Seven Portable Terminal — V5 Clean */

const TERMINAL_LINK = "https://blueazur-hub.github.io/erith-ia-memory/assets/SEVEN_PORTABLE_TERMINAL/index.html";
const BLUE_AZUR_CHANNEL_LINK = "https://www.youtube.com/@blueazur";

const PROMPTS = {
  seven: `Chat, active Aerith-7 Seven Heaven / Full Modules Boost.

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
Notion compatible, clair, propre, opérationnel.`,

  video: `Chat, active Aerith-7 Seven Heaven — Video Cards Boost Production.

Réponds court :
1. Phase actuelle
2. Risque principal
3. Cartes utiles
4. Action immédiate
5. Point d’arrêt

Puissance maximale.
Chargement minimal.
Choix précis.`,

  blackout: `Mode Blackout.
Texte uniquement.
Aucune génération image.
Aucun outil image.
Prompts, vérifications, décisions, noms de fichiers, commits et archivage restent autorisés.`,

  wan: `Seven, active les cartes utiles pour une production Wan / I2V 1080x1920.

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
Arrêt.`,

  modules: `Seven, ouvre le mode Modules Mémoire.

Sélectionne uniquement les modules utiles.
Puissance maximale.
Chargement minimal.
Choix précis.`
};

const NOTION_TEXT = `# 🌸 Seven Portable Terminal

Lien cockpit :
${TERMINAL_LINK}

ERITH.IA Auto-Agent :
https://www.notion.so/ERITH-IA-Auto-Agent-Public-FR-35b7754fe084800ca59fd9bcdf4349ba

@7Heaven Memory Core :
https://sustaining-boar-5c6.notion.site/7heaven-memory-core

Le Chat GPT Memory Core :
https://sustaining-boar-5c6.notion.site/Le-Chat-GPT-Memory-Core-35e7754fe08480a9b72ee3fc5ede65a8

Blue Azur :
${BLUE_AZUR_CHANNEL_LINK}`;

const BACKGROUNDS = [
  { name: "Jardin du Grand Arbre", url: "./background_historique_lr.png" },
  { name: "Génie holographique", url: "./genie_bg_01_holographic_invocation_full.jpg" },
  { name: "Lampe oraculaire", url: "./genie_bg_02_ai_librarian_lamp_full.jpg" },
  { name: "Visage bleu", url: "./genie_bg_03_hologram_face_focus.jpg" },
  { name: "Cercle de lampe", url: "./genie_bg_04_lamp_oracle_focus.jpg" },
  { name: "Bibliothèque bleue", url: "./genie_bg_05_blue_library_flight.jpg" },
  { name: "Oracle doré", url: "./genie_bg_06_golden_arcane_floor.jpg" }
];

const state = {
  backgroundIndex: 0,
  visibility: "transparent",
  ambiance: "sky",
  hero: { x: 50, y: 34, zoom: 100 }
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function setStatus(message) {
  const status = $("#status");
  if (status) status.textContent = message;
}

async function copyText(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
    setStatus(successMessage || "Copié.");
  } catch {
    const drawer = $("#promptDrawer");
    const promptText = $("#promptText");
    if (drawer && promptText) {
      promptText.value = text;
      drawer.classList.add("open");
      promptText.focus();
      promptText.select();
      setStatus("Copie manuelle : texte affiché et sélectionné.");
    }
  }
}

function openPage(pageName) {
  $$(".page").forEach(page => page.classList.toggle("active", page.id === `page-${pageName}`));
  $$(".tab").forEach(tab => tab.classList.toggle("active", tab.dataset.page === pageName));
  document.body.dataset.page = pageName;
  setStatus("Page : " + pageName);
}

function setVisibilityMode(mode) {
  state.visibility = mode === "dark" ? "dark" : "transparent";
  document.body.classList.toggle("mode-dark", state.visibility === "dark");
  document.body.classList.toggle("mode-transparent", state.visibility === "transparent");

  $("#transparentBtn")?.classList.toggle("active", state.visibility === "transparent");
  $("#darkBtn")?.classList.toggle("active", state.visibility === "dark");

  localStorage.setItem("seven-v5-visibility", state.visibility);
  applyHeroFocus(state.hero.x, state.hero.y, state.hero.zoom, false);
  setStatus(state.visibility === "dark" ? "Mode sombre actif. Hero toujours réglable." : "Mode transparent actif. Hero toujours réglable.");
}

function clamp(value, min, max) {
  value = Number(value);
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function applyHeroFocus(x, y, zoom, save = true) {
  x = clamp(x, 0, 100);
  y = clamp(y, 0, 100);
  zoom = clamp(zoom, 100, 180);
  state.hero = { x, y, zoom };

  const img = $("#heroBgImg");
  if (img) {
    img.style.objectPosition = `${x}% ${y}%`;
    img.style.transform = `scale(${zoom / 100})`;
    img.style.transformOrigin = `${x}% ${y}%`;
  }

  $("#heroX").value = x;
  $("#heroY").value = y;
  $("#heroZoom").value = zoom;
  $("#heroXOut").textContent = `${x}%`;
  $("#heroYOut").textContent = `${y}%`;
  $("#heroZoomOut").textContent = `${zoom}%`;

  if (save) {
    localStorage.setItem("seven-v5-hero", JSON.stringify(state.hero));
  }
}

function setHeroFocusFromInputs() {
  applyHeroFocus($("#heroX").value, $("#heroY").value, $("#heroZoom").value, true);
}

function nudgeHero(direction) {
  const step = 2;
  let { x, y, zoom } = state.hero;

  if (direction === "up") y -= step;
  if (direction === "down") y += step;
  if (direction === "left") x -= step;
  if (direction === "right") x += step;

  applyHeroFocus(x, y, zoom, true);
}

function resetHeroFocus() {
  applyHeroFocus(50, 34, 100, true);
  setStatus("Hero Focus réinitialisé.");
}

function toggleHeroPanel(force) {
  const open = typeof force === "boolean" ? force : !document.body.classList.contains("show-hero");
  document.body.classList.toggle("show-hero", open);
  $("#heroBtn")?.classList.toggle("active", open);
  localStorage.setItem("seven-v5-hero-panel", open ? "1" : "0");
  setStatus(open ? "Hero Focus ouvert." : "Hero Focus fermé.");
}

function applyBackground(index) {
  state.backgroundIndex = ((index % BACKGROUNDS.length) + BACKGROUNDS.length) % BACKGROUNDS.length;
  const bg = BACKGROUNDS[state.backgroundIndex];
  document.documentElement.style.setProperty("--active-bg", `url("${bg.url}")`);
  localStorage.setItem("seven-v5-bg", String(state.backgroundIndex));
  setStatus("Fond actif : " + bg.name);
}

function nextBackground() {
  applyBackground(state.backgroundIndex + 1);
}

function randomBackground() {
  applyBackground(Math.floor(Math.random() * BACKGROUNDS.length));
}

function setAmbiance(mode) {
  state.ambiance = mode;
  document.body.dataset.ambiance = mode;
  localStorage.setItem("seven-v5-ambiance", mode);
  setStatus("Ambiance : " + mode);
}

function cycleAmbiance() {
  const list = ["sky", "crystal", "night", "gold", "minimal"];
  const index = list.indexOf(state.ambiance);
  setAmbiance(list[(index + 1 + list.length) % list.length]);
}

function toggleAdvanced(force) {
  const open = typeof force === "boolean" ? force : !document.body.classList.contains("show-advanced");
  document.body.classList.toggle("show-advanced", open);
  $("#advancedBtn")?.classList.toggle("active", open);
  localStorage.setItem("seven-v5-advanced", open ? "1" : "0");
  setStatus(open ? "Advanced Panels ouverts." : "Advanced Panels réduits.");
}

function saveFavoriteState() {
  const payload = {
    backgroundIndex: state.backgroundIndex,
    visibility: state.visibility,
    ambiance: state.ambiance,
    hero: state.hero,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem("seven-v5-favorite", JSON.stringify(payload));
  setStatus("Favori Seven enregistré.");
}

function loadFavoriteState() {
  const raw = localStorage.getItem("seven-v5-favorite");
  if (!raw) {
    setStatus("Aucun favori enregistré.");
    return;
  }

  try {
    const payload = JSON.parse(raw);
    applyBackground(Number(payload.backgroundIndex || 0));
    setVisibilityMode(payload.visibility || "transparent");
    setAmbiance(payload.ambiance || "sky");
    if (payload.hero) applyHeroFocus(payload.hero.x, payload.hero.y, payload.hero.zoom, true);
    setStatus("Favori Seven rechargé.");
  } catch {
    setStatus("Favori illisible.");
  }
}

function clearFavoriteState() {
  localStorage.removeItem("seven-v5-favorite");
  setStatus("Favori Seven effacé.");
}

function resetVisualState() {
  setVisibilityMode("transparent");
  setAmbiance("sky");
  applyBackground(0);
  resetHeroFocus();
  toggleAdvanced(false);
  setStatus("État visuel réinitialisé.");
}

function resetUiStorage() {
  [
    "seven-v5-bg",
    "seven-v5-visibility",
    "seven-v5-ambiance",
    "seven-v5-hero",
    "seven-v5-hero-panel",
    "seven-v5-advanced",
    "seven-v5-favorite"
  ].forEach(key => localStorage.removeItem(key));
  location.reload();
}

function togglePalette(force) {
  const palette = $("#commandPalette");
  if (!palette) return;
  const open = typeof force === "boolean" ? force : !palette.classList.contains("open");
  palette.classList.toggle("open", open);
  palette.setAttribute("aria-hidden", open ? "false" : "true");
}

function togglePrompt(kind = "seven") {
  const drawer = $("#promptDrawer");
  const promptText = $("#promptText");
  if (!drawer || !promptText) return;
  promptText.value = PROMPTS[kind] || PROMPTS.seven;
  drawer.classList.toggle("open");
  setStatus("Prompt affiché / masqué.");
}

function detectOsName() {
  const ua = navigator.userAgent || "";
  if (/Windows NT 10\.0/.test(ua)) return "Windows 10 / 11";
  if (/Windows/.test(ua)) return "Windows";
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/Android/.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS / iPadOS";
  if (/Linux/.test(ua)) return "Linux";
  return navigator.platform || "inconnu";
}

function detectBrowserName() {
  const ua = navigator.userAgent || "";
  if (/Edg\//.test(ua)) return "Microsoft Edge";
  if (/Firefox\//.test(ua)) return "Firefox " + (ua.match(/Firefox\/([\d.]+)/)?.[1] || "");
  if (/Chrome\//.test(ua)) return "Chrome " + (ua.match(/Chrome\/([\d.]+)/)?.[1] || "");
  if (/Safari\//.test(ua)) return "Safari";
  return "navigateur inconnu";
}

function shortUserAgent() {
  const ua = navigator.userAgent || "indisponible";
  return ua.length > 92 ? ua.slice(0, 92) + "…" : ua;
}

function refreshSystemDetails() {
  const trace = [
    ["🖥️", "Système", detectOsName(), navigator.platform || "plateforme inconnue"],
    ["🌐", "Navigateur", detectBrowserName(), shortUserAgent()],
    ["📐", "Affichage", `${screen.width}×${screen.height}`, `viewport ${window.innerWidth}×${window.innerHeight}`],
    ["🌍", "Fuseau", Intl.DateTimeFormat().resolvedOptions().timeZone || "inconnu", navigator.language || "langue inconnue"]
  ];

  $("#traceStamp").textContent = new Date().toLocaleString("fr-FR");

  $("#traceGrid").innerHTML = trace.map(([icon, label, value, detail]) => `
    <article class="trace-card">
      <span class="trace-icon">${icon}</span>
      <div>
        <small>${label}</small>
        <strong>${value}</strong>
        <em>${detail}</em>
      </div>
    </article>
  `).join("");
}

function buildDiagnosticText() {
  return `# Seven System Details HUD

Système détecté :
${detectOsName()}

Plateforme navigateur :
${navigator.platform || "inconnue"}

Navigateur :
${detectBrowserName()}

User Agent :
${navigator.userAgent || "indisponible"}

Écran :
${screen.width}×${screen.height}

Viewport :
${window.innerWidth}×${window.innerHeight}

Langue :
${navigator.language || "inconnue"}

Fuseau horaire :
${Intl.DateTimeFormat().resolvedOptions().timeZone || "inconnu"}`;
}

function handleAction(action) {
  if (action === "start-seven") {
    copyText(PROMPTS.seven, "Seven Boost copié. Ouverture de ChatGPT.");
    setTimeout(() => window.open("https://chatgpt.com/", "_blank", "noopener"), 500);
  }
  if (action === "copy-seven") copyText(PROMPTS.seven, "Prompt Seven copié.");
  if (action === "video-cards") copyText(PROMPTS.video, "Video Cards Boost copié.");
  if (action === "wan") copyText(PROMPTS.wan, "Checklist Wan copiée.");
  if (action === "modules") copyText(PROMPTS.modules, "Prompt Modules copié.");
  if (action === "blackout") copyText(PROMPTS.blackout, "Mode Blackout copié.");
  if (action === "copy-link") copyText(TERMINAL_LINK, "Lien cockpit copié.");
  if (action === "notion-text") copyText(NOTION_TEXT, "Texte Notion copié.");
  if (action === "prompt") togglePrompt("seven");
  if (action === "next-bg") nextBackground();
  if (action === "random-bg") randomBackground();
  if (action === "refresh-trace") {
    refreshSystemDetails();
    setStatus("Trace actualisée.");
  }
  if (action === "transparent") setVisibilityMode("transparent");
  if (action === "dark") setVisibilityMode("dark");
}

function bindEvents() {
  $$(".tab").forEach(tab => tab.addEventListener("click", () => openPage(tab.dataset.page)));
  $$("[data-page-jump]").forEach(btn => btn.addEventListener("click", () => openPage(btn.dataset.pageJump)));
  $$("[data-action]").forEach(el => el.addEventListener("click", () => handleAction(el.dataset.action)));

  $("#advancedBtn").addEventListener("click", () => toggleAdvanced());
  $("#advancedCloseBtn").addEventListener("click", () => toggleAdvanced(false));
  $("#ambianceBtn").addEventListener("click", cycleAmbiance);
  $("#saveBtn").addEventListener("click", saveFavoriteState);
  $("#saveBtn2").addEventListener("click", saveFavoriteState);
  $("#loadBtn").addEventListener("click", loadFavoriteState);
  $("#loadBtn2").addEventListener("click", loadFavoriteState);
  $("#clearBtn").addEventListener("click", clearFavoriteState);
  $("#nextBgBtn").addEventListener("click", nextBackground);
  $("#randomBgBtn").addEventListener("click", randomBackground);
  $("#heroBtn").addEventListener("click", () => toggleHeroPanel());
  $("#heroOpenBtn").addEventListener("click", () => toggleHeroPanel(true));
  $("#heroCloseBtn").addEventListener("click", () => toggleHeroPanel(false));
  $("#transparentBtn").addEventListener("click", () => setVisibilityMode("transparent"));
  $("#transparentBtn2").addEventListener("click", () => setVisibilityMode("transparent"));
  $("#darkBtn").addEventListener("click", () => setVisibilityMode("dark"));
  $("#darkBtn2").addEventListener("click", () => setVisibilityMode("dark"));
  $("#paletteBtn").addEventListener("click", () => togglePalette());
  $("#paletteCloseBtn").addEventListener("click", () => togglePalette(false));
  $("#refreshTraceBtn").addEventListener("click", refreshSystemDetails);
  $("#copyTraceBtn").addEventListener("click", () => copyText(buildDiagnosticText(), "Diagnostic système copié."));
  $("#heroResetBtn").addEventListener("click", resetHeroFocus);
  $("#heroResetBtn2").addEventListener("click", resetHeroFocus);
  $("#resetVisualBtn").addEventListener("click", resetVisualState);
  $("#resetStorageBtn").addEventListener("click", resetUiStorage);

  ["heroX", "heroY", "heroZoom"].forEach(id => {
    document.getElementById(id).addEventListener("input", setHeroFocusFromInputs);
  });

  $$("[data-nudge]").forEach(btn => btn.addEventListener("click", () => nudgeHero(btn.dataset.nudge)));
  $$("[data-ambiance]").forEach(btn => btn.addEventListener("click", () => setAmbiance(btn.dataset.ambiance)));

  document.addEventListener("keydown", (event) => {
    if (event.target && ["TEXTAREA", "INPUT"].includes(event.target.tagName)) return;

    const pages = { "1": "home", "2": "llm", "3": "notion", "4": "github", "5": "production", "6": "system" };
    if (pages[event.key]) openPage(pages[event.key]);
    if (event.key === "?" || event.key === "/") togglePalette();
    if (event.key === "Escape") {
      togglePalette(false);
      toggleHeroPanel(false);
    }
  });
}

function boot() {
  bindEvents();

  state.backgroundIndex = Number(localStorage.getItem("seven-v5-bg") || "0");
  state.visibility = localStorage.getItem("seven-v5-visibility") || "transparent";
  state.ambiance = localStorage.getItem("seven-v5-ambiance") || "sky";

  try {
    state.hero = { ...state.hero, ...JSON.parse(localStorage.getItem("seven-v5-hero") || "{}") };
  } catch {}

  applyBackground(state.backgroundIndex);
  setVisibilityMode(state.visibility);
  setAmbiance(state.ambiance);
  applyHeroFocus(state.hero.x, state.hero.y, state.hero.zoom, false);

  const heroOpen = localStorage.getItem("seven-v5-hero-panel") || "0";
  toggleHeroPanel(heroOpen === "1");

  const advancedOpen = localStorage.getItem("seven-v5-advanced") || "0";
  toggleAdvanced(advancedOpen === "1");

  $("#promptText").value = PROMPTS.seven;
  refreshSystemDetails();
  openPage("home");
  setStatus("V5 clean prête · mode " + state.visibility + " actif.");
}

boot();
window.addEventListener("resize", refreshSystemDetails);
