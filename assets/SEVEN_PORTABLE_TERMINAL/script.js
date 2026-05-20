/* Seven Portable Terminal — V5 Targeted Final JS */

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
Choix précis.`,

  notion: `# 🌸 Seven Portable Terminal

Lien cockpit :
https://blueazur-hub.github.io/erith-ia-memory/assets/SEVEN_PORTABLE_TERMINAL/index.html

ERITH.IA Auto-Agent :
https://www.notion.so/ERITH-IA-Auto-Agent-Public-FR-35b7754fe084800ca59fd9bcdf4349ba

ERITH Memory :
https://sustaining-boar-5c6.notion.site/erith-ia-memory

@7Heaven Memory Core :
https://sustaining-boar-5c6.notion.site/7heaven-memory-core

Le Chat GPT Memory Core :
https://sustaining-boar-5c6.notion.site/Le-Chat-GPT-Memory-Core-35e7754fe08480a9b72ee3fc5ede65a8

Blue Azur :
https://www.youtube.com/@blueazur`
};

const BACKGROUNDS = [
  { name: "Jardin du Grand Arbre", url: "./background_historique_lr.png", ambiance: "sky" },
  { name: "Génie holographique", url: "./genie_bg_01_holographic_invocation_full.jpg", ambiance: "crystal" },
  { name: "Lampe oraculaire", url: "./genie_bg_02_ai_librarian_lamp_full.jpg", ambiance: "gold" },
  { name: "Visage bleu", url: "./genie_bg_03_hologram_face_focus.jpg", ambiance: "night" },
  { name: "Cercle de lampe", url: "./genie_bg_04_lamp_oracle_focus.jpg", ambiance: "crystal" },
  { name: "Bibliothèque bleue", url: "./genie_bg_05_blue_library_flight.jpg", ambiance: "sky" },
  { name: "Oracle doré", url: "./genie_bg_06_golden_arcane_floor.jpg", ambiance: "gold" }
];

const state = {
  backgroundIndex: 0,
  theme: "transparent",
  ambiance: "sky",
  hero: { x: 50, y: 34, zoom: 100 },
  heroOpen: true,
  advancedOpen: false
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function setStatus(message) {
  const status = $("#status");
  if (status) status.textContent = message;
}

async function copyText(text, successMessage = "Copié.") {
  try {
    await navigator.clipboard.writeText(text);
    setStatus(successMessage);
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

function setTheme(theme) {
  state.theme = theme === "readability" ? "readability" : "transparent";
  document.body.dataset.theme = state.theme;

  $("#transparentBtn")?.classList.toggle("active", state.theme === "transparent");
  $("#readabilityBtn")?.classList.toggle("active", state.theme === "readability");

  saveState();
  setStatus(state.theme === "transparent" ? "Mode transparent actif." : "Mode lisibilité actif.");
}

function setAmbiance(ambiance) {
  state.ambiance = ambiance;
  document.body.dataset.ambiance = ambiance;
  saveState();
  setStatus("Ambiance : " + ambiance);
}

function cycleAmbiance() {
  const list = ["sky", "crystal", "ruins", "night", "gold"];
  const index = list.indexOf(state.ambiance);
  setAmbiance(list[(index + 1 + list.length) % list.length]);
}

function applyBackground(index) {
  state.backgroundIndex = ((index % BACKGROUNDS.length) + BACKGROUNDS.length) % BACKGROUNDS.length;
  const bg = BACKGROUNDS[state.backgroundIndex];
  document.documentElement.style.setProperty("--active-bg", `url("${bg.url}")`);
  if (bg.ambiance) setAmbiance(bg.ambiance);
  saveState();
  setStatus("Fond actif : " + bg.name);
}

function nextBackground() {
  applyBackground(state.backgroundIndex + 1);
}

function randomBackground() {
  applyBackground(Math.floor(Math.random() * BACKGROUNDS.length));
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

  if ($("#heroFocusX")) $("#heroFocusX").value = x;
  if ($("#heroFocusY")) $("#heroFocusY").value = y;
  if ($("#heroFocusZoom")) $("#heroFocusZoom").value = zoom;
  if ($("#heroFocusXValue")) $("#heroFocusXValue").textContent = `${x}%`;
  if ($("#heroFocusYValue")) $("#heroFocusYValue").textContent = `${y}%`;
  if ($("#heroFocusZoomValue")) $("#heroFocusZoomValue").textContent = `${zoom}%`;

  if (save) saveState();
}

function setHeroFocusFromInputs() {
  applyHeroFocus($("#heroFocusX")?.value, $("#heroFocusY")?.value, $("#heroFocusZoom")?.value);
}

function nudgeHero(direction) {
  const step = 2;
  let { x, y, zoom } = state.hero;
  if (direction === "up") y -= step;
  if (direction === "down") y += step;
  if (direction === "left") x -= step;
  if (direction === "right") x += step;
  applyHeroFocus(x, y, zoom);
}

function resetHeroFocus() {
  applyHeroFocus(50, 34, 100);
  setStatus("Hero Focus réinitialisé.");
}

function toggleHeroFocusPanel(force) {
  state.heroOpen = typeof force === "boolean" ? force : !state.heroOpen;
  document.body.classList.toggle("show-hero-focus", state.heroOpen);
  $("#heroFocusBtn")?.classList.toggle("active", state.heroOpen);
  saveState();
  setStatus(state.heroOpen ? "Hero Focus ouvert." : "Hero Focus fermé.");
}

function toggleAdvanced(force) {
  state.advancedOpen = typeof force === "boolean" ? force : !state.advancedOpen;
  document.body.classList.toggle("show-advanced", state.advancedOpen);
  $("#advancedBtn")?.classList.toggle("active", state.advancedOpen);
  saveState();
  setStatus(state.advancedOpen ? "Advanced Panels ouverts." : "Advanced Panels réduits.");
}

function resetVisualState() {
  state.theme = "transparent";
  state.ambiance = "sky";
  applyBackground(0);
  setTheme("transparent");
  applyHeroFocus(50, 34, 100);
  toggleHeroFocusPanel(true);
  toggleAdvanced(false);
  setStatus("État visuel validé restauré.");
}

function saveFavoriteState() {
  localStorage.setItem("seven-v5-targeted-favorite", JSON.stringify(state));
  setStatus("Favori Seven enregistré.");
}

function loadFavoriteState() {
  try {
    const favorite = JSON.parse(localStorage.getItem("seven-v5-targeted-favorite") || "null");
    if (!favorite) {
      setStatus("Aucun favori Seven enregistré.");
      return;
    }

    Object.assign(state, favorite);
    applyBackground(state.backgroundIndex);
    setTheme(state.theme);
    setAmbiance(state.ambiance);
    applyHeroFocus(state.hero.x, state.hero.y, state.hero.zoom, false);
    toggleHeroFocusPanel(Boolean(state.heroOpen));
    toggleAdvanced(Boolean(state.advancedOpen));
    setStatus("Favori Seven rechargé.");
  } catch {
    setStatus("Favori illisible.");
  }
}

function clearFavoriteState() {
  localStorage.removeItem("seven-v5-targeted-favorite");
  setStatus("Favori Seven effacé.");
}

function saveState() {
  localStorage.setItem("seven-v5-targeted-state", JSON.stringify(state));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem("seven-v5-targeted-state") || "null");
    if (saved) Object.assign(state, saved);
  } catch {}
}

function togglePrompt() {
  const drawer = $("#promptDrawer");
  const promptText = $("#promptText");
  if (!drawer || !promptText) return;
  promptText.value = PROMPTS.seven;
  drawer.classList.toggle("open");
  setStatus(drawer.classList.contains("open") ? "Prompt affiché." : "Prompt masqué.");
}

function toggleCommandPalette(force) {
  const palette = $("#commandPalette");
  if (!palette) return;
  const open = typeof force === "boolean" ? force : !palette.classList.contains("open");
  palette.classList.toggle("open", open);
  palette.setAttribute("aria-hidden", open ? "false" : "true");
  setStatus(open ? "Palette de commandes ouverte." : "Palette de commandes fermée.");
}

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

function getTrace() {
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

function refreshTrace() {
  const trace = getTrace();
  const grid = $("#traceGrid");
  if (grid) {
    const cards = [
      ["🖥️", "Système", trace.os, trace.platform],
      ["🌐", "Navigateur", trace.browser, trace.agent],
      ["📐", "Affichage", trace.screen, trace.viewport],
      ["🌍", "Langue / Fuseau", trace.timezone, trace.language]
    ];

    grid.innerHTML = cards.map(([icon, label, value, detail]) => `
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

  const networkPanel = $("#networkPanel");
  if (networkPanel) {
    const cards = [
      ["🛡️", "IP", "masquée", "aucune IP personnelle affichée"],
      ["🌐", "Réseau", "Ethernet / inconnu", "détection navigateur limitée"],
      ["🕒", "Heure locale", new Date().toLocaleTimeString("fr-FR"), trace.timezone],
      ["🖥️", "Remote", "RustDesk", "ID et mot de passe non affichés"]
    ];

    networkPanel.innerHTML = cards.map(([icon, label, value, detail]) => `
      <article class="net-card">
        <span class="net-icon">${icon}</span>
        <div>
          <small>${label}</small>
          <strong>${value}</strong>
          <em>${detail}</em>
        </div>
      </article>
    `).join("");
  }

  if ($("#homeTraceStamp")) $("#homeTraceStamp").textContent = trace.stamp;
  if ($("#traceOsMini")) $("#traceOsMini").textContent = trace.os;
  if ($("#traceBrowserMini")) $("#traceBrowserMini").textContent = trace.browser;
  if ($("#traceScreenMini")) $("#traceScreenMini").textContent = trace.screen;
  if ($("#traceTzMini")) $("#traceTzMini").textContent = trace.timezone;
}

function traceText() {
  const trace = getTrace();
  return `SAFE TRACE
Date : ${trace.stamp}
Système : ${trace.os}
Plateforme : ${trace.platform}
Navigateur : ${trace.browser}
Écran : ${trace.screen}
Viewport : ${trace.viewport}
Fuseau : ${trace.timezone}
Langue : ${trace.language}
IP : masquée
RustDesk : ID et mot de passe non affichés`;
}

function handleAction(action) {
  if (action === "start-seven") {
    copyText(PROMPTS.seven, "Prompt Seven copié. Ouverture ChatGPT.");
    setTimeout(() => window.open("https://chatgpt.com/", "_blank"), 250);
  }
  if (action === "show-prompt") togglePrompt();
  if (action === "next-bg") nextBackground();
  if (action === "random-bg") randomBackground();
  if (action === "open-hero") toggleHeroFocusPanel(true);
}

function bindEvents() {
  $$(".tab").forEach(tab => tab.addEventListener("click", () => openPage(tab.dataset.page)));
  $$("[data-page]").forEach(button => button.addEventListener("click", () => {
    openPage(button.dataset.page);
    toggleCommandPalette(false);
  }));

  $$("[data-copy]").forEach(button => button.addEventListener("click", () => {
    const key = button.dataset.copy;
    if (key === "terminal-link") copyText(TERMINAL_LINK, "Lien cockpit copié.");
    else if (key === "trace") copyText(traceText(), "Diagnostic copié.");
    else copyText(PROMPTS[key] || PROMPTS.seven, "Texte copié.");
    toggleCommandPalette(false);
  }));

  $$("[data-action]").forEach(button => button.addEventListener("click", () => {
    handleAction(button.dataset.action);
    if (button.closest(".command-palette") && button.dataset.action !== "open-hero") {
      toggleCommandPalette(false);
    }
  }));

  $$("[data-open='chatgpt']").forEach(button => button.addEventListener("click", () => window.open("https://chatgpt.com/", "_blank")));
  $$("[data-mode]").forEach(button => button.addEventListener("click", () => {
    setTheme(button.dataset.mode);
    toggleCommandPalette(false);
  }));

  $$("[data-ambiance]").forEach(button => button.addEventListener("click", () => setAmbiance(button.dataset.ambiance)));
  $$("[data-nudge]").forEach(button => button.addEventListener("click", () => nudgeHero(button.dataset.nudge)));

  ["heroFocusX", "heroFocusY", "heroFocusZoom"].forEach(id => {
    const input = $("#" + id);
    if (input) input.addEventListener("input", setHeroFocusFromInputs);
  });

  $("#advancedBtn")?.addEventListener("click", () => toggleAdvanced());
  $("#advancedCloseBtn")?.addEventListener("click", () => toggleAdvanced(false));
  $("#ambianceBtn")?.addEventListener("click", cycleAmbiance);
  $("#saveBtn")?.addEventListener("click", saveFavoriteState);
  $("#loadBtn")?.addEventListener("click", loadFavoriteState);
  $("#nextBgBtn")?.addEventListener("click", nextBackground);
  $("#randomBgBtn")?.addEventListener("click", randomBackground);
  $("#heroFocusBtn")?.addEventListener("click", () => toggleHeroFocusPanel());
  $("#transparentBtn")?.addEventListener("click", () => setTheme("transparent"));
  $("#readabilityBtn")?.addEventListener("click", () => setTheme("readability"));
  $("#commandPaletteBtn")?.addEventListener("click", () => toggleCommandPalette());
  $("#paletteCloseBtn")?.addEventListener("click", () => toggleCommandPalette(false));
  $("#heroCloseBtn")?.addEventListener("click", () => toggleHeroFocusPanel(false));
  $("#heroResetBtn")?.addEventListener("click", resetHeroFocus);
  $("#openHeroAdvancedBtn")?.addEventListener("click", () => toggleHeroFocusPanel(true));
  $("#resetHeroAdvancedBtn")?.addEventListener("click", resetHeroFocus);
  $("#saveFavoriteBtn")?.addEventListener("click", saveFavoriteState);
  $("#loadFavoriteBtn")?.addEventListener("click", loadFavoriteState);
  $("#clearFavoriteBtn")?.addEventListener("click", clearFavoriteState);
  $("#resetVisualBtn")?.addEventListener("click", resetVisualState);
  $("#resetAllBtn")?.addEventListener("click", () => {
    localStorage.removeItem("seven-v5-targeted-state");
    localStorage.removeItem("seven-v5-targeted-favorite");
    location.reload();
  });
  $("#refreshTraceBtn")?.addEventListener("click", refreshTrace);
  $("#copyTraceBtn")?.addEventListener("click", () => copyText(traceText(), "Diagnostic copié."));
  $("#refreshSystemTile")?.addEventListener("click", refreshTrace);
  $("#systemTransparentTile")?.addEventListener("click", () => setTheme("transparent"));
  $("#systemReadabilityTile")?.addEventListener("click", () => setTheme("readability"));

  document.addEventListener("keydown", event => {
    if (event.target && ["INPUT", "TEXTAREA"].includes(event.target.tagName)) return;
    const pages = { "1": "home", "2": "llm", "3": "notion", "4": "github", "5": "production", "6": "system" };
    if (pages[event.key]) openPage(pages[event.key]);
    if (event.key === "?") toggleCommandPalette();
    if (event.key === "Escape") {
      toggleCommandPalette(false);
      $("#promptDrawer")?.classList.remove("open");
    }
  });
}

function boot() {
  loadState();
  bindEvents();

  applyBackground(state.backgroundIndex);
  setTheme(state.theme);
  setAmbiance(state.ambiance);
  applyHeroFocus(state.hero.x, state.hero.y, state.hero.zoom, false);
  toggleHeroFocusPanel(Boolean(state.heroOpen));
  toggleAdvanced(Boolean(state.advancedOpen));
  refreshTrace();

  const hero = $("#heroBgImg");
  if (hero) {
    hero.addEventListener("error", () => {
      hero.src = "./background_historique_lr.png";
      setStatus("Hero fallback : background_historique_lr.png");
    }, { once: true });
  }

  const portrait = $(".portrait img");
  if (portrait) {
    portrait.addEventListener("error", () => {
      portrait.classList.add("hide");
    }, { once: true });
  }

  setStatus("Seven Terminal V5 Targeted Final prêt.");
}

boot();
window.addEventListener("resize", refreshTrace);
