/* Seven Portable Terminal — V5 Clean JS
   Autonome, sans dépendance, sans donnée sensible.
*/

const SEVEN_PUBLIC_URL = "https://blueazur-hub.github.io/erith-ia-memory/assets/SEVEN_PORTABLE_TERMINAL/index.html";
const BLUE_AZUR_YOUTUBE = "https://www.youtube.com/@BlueAzur07";
const ERITH_MEMORY_NOTION = "https://sustaining-boar-5c6.notion.site/erith-ia-memory";
const AUTO_AGENT_PUBLIC_FR = "https://www.notion.so/ERITH-IA-Auto-Agent-Public-FR-35b7754fe084800ca59fd9bcdf4349ba";
const GITHUB_REPO = "https://github.com/BlueAzur-Hub/erith-ia-memory";
const GITHUB_TERMINAL = "https://github.com/BlueAzur-Hub/erith-ia-memory/tree/main/assets/SEVEN_PORTABLE_TERMINAL";

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

  video: `Chat, active Aerith-7 Seven Heaven — Video Cards Boost Production.

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
Sound Design / Voix / Silence.`,

  blackout: `Mode Blackout.

Texte uniquement.
Aucun outil image.
Aucune génération image.
Aucune action GitHub automatique.
Réponse courte, directe, opérationnelle.
On stabilise avant de modifier.`,

  wan: `WAN I2V — réglages validés :

Format :
width = 1080
height = 1920
frame_rate = 16
length = 81
batch_size = 1

Règles :
image parfaite d’abord.
une animation = une idée.
caméra stable.
prompt positif obligatoire.
prompt négatif obligatoire.
last frame exacte pour continuité LEGO.
DaVinci pour le montage final.`
};

const backgrounds = [
  { id: "history", label: "Historique", url: "./background_historique_lr.png", position: "center center" },
  { id: "sky-bridge", label: "Sky Bridge Ruins", url: "./atlas_29_sky_bridge_ruins_temple.jpg", position: "center center" },
  { id: "suspended", label: "Suspended City", url: "./atlas_29_suspended_city_temple.jpg", position: "center center" },
  { id: "tree", label: "Grand Tree Garden", url: "./atlas_29_grand_tree_garden_arbre.jpg", position: "center center" },
  { id: "genie", label: "Genie", url: "./hero_genie_invocation_banner.jpg", position: "center center" },
  { id: "memory", label: "Memory Cards", url: "./aerith_7_memory_cards_avatar_master.png", position: "center center" }
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

async function copyText(text, label = "Texte copié.") {
  try {
    if (!navigator.clipboard || !window.isSecureContext) throw new Error("clipboard unavailable");
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

  $$(".page").forEach((el) => {
    el.classList.toggle("active", el.id === `page-${page}`);
  });

  $$("[data-page-target]").forEach((el) => {
    el.classList.toggle("active", el.dataset.pageTarget === page);
  });

  setStatus(`Page : ${page}`);
  updateNetworkHud();
}

function setVisibility(mode) {
  state.visibility = mode;
  document.body.dataset.theme = mode;
  document.body.classList.toggle("mode-transparent", mode === "transparent");
  document.body.classList.toggle("mode-readability", mode === "readability");

  $("#transparentBtn")?.classList.toggle("active", mode === "transparent");
  $("#readabilityBtn")?.classList.toggle("active", mode === "readability");

  saveSoftState();
  setStatus(mode === "readability" ? "Mode sombre lisible actif." : "Mode transparent actif.");
}

function applyBackground(index) {
  state.bgIndex = (index + backgrounds.length) % backgrounds.length;
  const bg = backgrounds[state.bgIndex];

  document.body.dataset.bg = bg.id;
  document.body.style.setProperty("--active-bg", `url("${bg.url}")`);
  document.body.style.backgroundPosition = bg.position;

  saveSoftState();
  setStatus(`Fond : ${bg.label}`);
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
  saveSoftState();
  setStatus(state.advanced ? "Advanced affiché." : "Advanced masqué.");
}

function toggleHeroFocusPanel(force) {
  state.heroFocus = typeof force === "boolean" ? force : !state.heroFocus;
  document.body.classList.toggle("show-hero-focus", state.heroFocus);
  $("#heroBtn")?.classList.toggle("active", state.heroFocus);
  saveSoftState();
  setStatus(state.heroFocus ? "Hero Focus ouvert." : "Hero Focus fermé.");
}

function clamp(value, min, max) {
  value = Number(value);
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function updateHeroFocus() {
  const x = clamp($("#heroX")?.value ?? state.hero.x, 0, 100);
  const y = clamp($("#heroY")?.value ?? state.hero.y, 0, 100);
  const zoom = clamp($("#heroZoom")?.value ?? state.hero.zoom, 100, 180);

  state.hero = { x, y, zoom };

  document.documentElement.style.setProperty("--hero-x", `${x}%`);
  document.documentElement.style.setProperty("--hero-y", `${y}%`);
  document.documentElement.style.setProperty("--hero-zoom", `${zoom}%`);

  if ($("#heroX")) $("#heroX").value = x;
  if ($("#heroY")) $("#heroY").value = y;
  if ($("#heroZoom")) $("#heroZoom").value = zoom;
  if ($("#heroXOut")) $("#heroXOut").textContent = `${x}%`;
  if ($("#heroYOut")) $("#heroYOut").textContent = `${y}%`;
  if ($("#heroZoomOut")) $("#heroZoomOut").textContent = `${zoom}%`;

  saveSoftState();
}

function nudgeHero(direction) {
  const xInput = $("#heroX");
  const yInput = $("#heroY");
  if (!xInput || !yInput) return;

  if (direction === "left") xInput.value = clamp(Number(xInput.value) - 2, 0, 100);
  if (direction === "right") xInput.value = clamp(Number(xInput.value) + 2, 0, 100);
  if (direction === "up") yInput.value = clamp(Number(yInput.value) - 2, 0, 100);
  if (direction === "down") yInput.value = clamp(Number(yInput.value) + 2, 0, 100);

  updateHeroFocus();
}

function resetHeroFocus() {
  if ($("#heroX")) $("#heroX").value = 50;
  if ($("#heroY")) $("#heroY").value = 34;
  if ($("#heroZoom")) $("#heroZoom").value = 100;
  updateHeroFocus();
  setStatus("Hero Focus réinitialisé.");
}

function togglePalette(force) {
  const palette = $("#commandPalette");
  if (!palette) return;

  const open = typeof force === "boolean" ? force : palette.getAttribute("aria-hidden") === "true";
  palette.setAttribute("aria-hidden", open ? "false" : "true");
  palette.classList.toggle("open", open);
  setStatus(open ? "Palette ouverte." : "Palette fermée.");
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

function saveSoftState() {
  try {
    localStorage.setItem("seven_terminal_state_v5_clean", JSON.stringify({
      bgIndex: state.bgIndex,
      visibility: state.visibility,
      hero: state.hero,
      advanced: state.advanced,
      heroFocus: state.heroFocus
    }));
  } catch {}
}

function bootSoftState() {
  try {
    const saved = JSON.parse(localStorage.getItem("seven_terminal_state_v5_clean") || "{}");
    if (typeof saved.bgIndex === "number") state.bgIndex = saved.bgIndex;
    if (saved.visibility) state.visibility = saved.visibility;
    if (saved.hero) state.hero = { ...state.hero, ...saved.hero };
    if (typeof saved.advanced === "boolean") state.advanced = saved.advanced;
    if (typeof saved.heroFocus === "boolean") state.heroFocus = saved.heroFocus;
  } catch {}
}

function saveFavoriteState() {
  localStorage.setItem("seven_terminal_favorite_v5_clean", JSON.stringify({
    bgIndex: state.bgIndex,
    visibility: state.visibility,
    hero: state.hero
  }));
  setStatus("Favori sauvegardé.");
}

function loadFavoriteState() {
  try {
    const favorite = JSON.parse(localStorage.getItem("seven_terminal_favorite_v5_clean") || "{}");
    if (typeof favorite.bgIndex === "number") applyBackground(favorite.bgIndex);
    if (favorite.visibility) setVisibility(favorite.visibility);
    if (favorite.hero) {
      if ($("#heroX")) $("#heroX").value = favorite.hero.x ?? 50;
      if ($("#heroY")) $("#heroY").value = favorite.hero.y ?? 34;
      if ($("#heroZoom")) $("#heroZoom").value = favorite.hero.zoom ?? 100;
      updateHeroFocus();
    }
    setStatus("Favori restauré.");
  } catch {
    setStatus("Aucun favori valide.");
  }
}

function getBrowserName() {
  const ua = navigator.userAgent || "";
  if (ua.includes("Firefox/")) return "Firefox " + (ua.match(/Firefox\/([0-9.]+)/)?.[1] || "");
  if (ua.includes("Edg/")) return "Edge " + (ua.match(/Edg\/([0-9.]+)/)?.[1] || "");
  if (ua.includes("Chrome/")) return "Chrome " + (ua.match(/Chrome\/([0-9.]+)/)?.[1] || "");
  if (ua.includes("Safari/")) return "Safari";
  return "Navigateur";
}

function getOSName() {
  const ua = navigator.userAgent || "";
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
    platform: navigator.platform || "plateforme inconnue",
    browser: getBrowserName(),
    agent: (navigator.userAgent || "indisponible").slice(0, 110),
    screen: `${screen.width}×${screen.height} · DPR ${window.devicePixelRatio || 1}`,
    viewport: `${window.innerWidth}×${window.innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "inconnu",
    languages: navigator.languages?.join(", ") || navigator.language || "inconnu",
    cpu: navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} threads` : "non disponible",
    memory: navigator.deviceMemory ? `${navigator.deviceMemory} GB approx.` : "non disponible",
    battery: "non disponible",
    session: location.hostname || "local",
    online: navigator.onLine ? "en ligne" : "hors ligne",
    security: "Diagnostic filtré : aucun identifiant distant, aucun mot de passe",
    network: "Ethernet / inconnu",
    ip: "filtrée"
  };
}

function renderTrace() {
  const trace = getSafeTrace();

  const cards = [
    ["🖥️", "Système", trace.os, trace.platform],
    ["🌐", "Navigateur", trace.browser, trace.agent],
    ["📐", "Affichage", trace.screen, `viewport ${trace.viewport}`],
    ["🌍", "Langue / fuseau", trace.timezone, trace.languages],
    ["⚙️", "Performance", trace.cpu, trace.memory],
    ["🔋", "Énergie", trace.battery, "API batterie non utilisée"],
    ["🛰️", "Session", trace.session, trace.online],
    ["🛡️", "Sécurité", "Diagnostic filtré", "aucun RustDesk ID, aucun mot de passe"]
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

  if ($("#traceDate")) $("#traceDate").textContent = trace.date;

  const raw = $("#traceRaw");
  if (raw) {
    raw.value =
`SAFE TRACE ${trace.date}
Système : ${trace.os}
Plateforme : ${trace.platform}
Navigateur : ${trace.browser}
Affichage : ${trace.screen}
Viewport : ${trace.viewport}
Langue / Fuseau : ${trace.timezone} — ${trace.languages}
Performance : ${trace.cpu}
Mémoire : ${trace.memory}
Énergie : ${trace.battery}
Session : ${trace.session}
Réseau : ${trace.network}
Sécurité : ${trace.security}`;
  }

  if ($("#osMini")) $("#osMini").textContent = trace.os;
  if ($("#browserMini")) $("#browserMini").textContent = trace.browser;
  if ($("#screenMini")) $("#screenMini").textContent = trace.screen;
  if ($("#tzMini")) $("#tzMini").textContent = trace.timezone;
  if ($("#ipMini")) $("#ipMini").textContent = trace.ip;
  if ($("#networkMini")) $("#networkMini").textContent = trace.network;
}

function updateNetworkHud() {
  const panel = $("#networkPanel");
  if (!panel) return;

  const trace = getSafeTrace();
  panel.innerHTML = `
    <article class="net-card"><small>IP publique</small><strong>${trace.ip}</strong><em>non exposée dans ce cockpit</em></article>
    <article class="net-card"><small>Connexion</small><strong>${trace.network}</strong><em>détection navigateur limitée</em></article>
    <article class="net-card"><small>Statut</small><strong>${trace.online}</strong><em>page active</em></article>
    <article class="net-card"><small>Heure locale</small><strong>${new Date().toLocaleTimeString("fr-FR")}</strong><em>${trace.timezone}</em></article>
  `;
}

function handleAction(action) {
  switch (action) {
    case "boost":
      copyText(prompts.boost, "Prompt Seven copié.");
      break;
    case "video":
      copyText(prompts.video, "Video Cards copié.");
      break;
    case "wan":
      copyText(prompts.wan, "Checklist Wan copiée.");
      break;
    case "prompt":
      showPrompt("boost");
      break;
    case "copy-link":
    case "link":
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
      copyText(
`Seven Portable Terminal
${SEVEN_PUBLIC_URL}

ERITH Memory
${ERITH_MEMORY_NOTION}

ERITH.IA Auto-Agent Public FR
${AUTO_AGENT_PUBLIC_FR}

GitHub
${GITHUB_REPO}

Dossier terminal
${GITHUB_TERMINAL}

Blue Azur
${BLUE_AZUR_YOUTUBE}`,
        "Bloc Notion copié."
      );
      break;
    case "copy-channel":
      copyText(BLUE_AZUR_YOUTUBE, "Lien chaîne copié.");
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
  $("#saveBtnAdvanced")?.addEventListener("click", () => saveFavoriteState());
  $("#loadBtnAdvanced")?.addEventListener("click", () => loadFavoriteState());
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
  $("#promptCloseBtn")?.addEventListener("click", () => closePrompt());
  $("#refreshTraceBtn")?.addEventListener("click", () => {
    renderTrace();
    updateNetworkHud();
    setStatus("Trace actualisée.");
  });
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
  bootSoftState();

  bindEvents();
  applyBackground(state.bgIndex);
  setVisibility(state.visibility);
  updateHeroFocus();
  toggleAdvancedPanels(state.advanced);
  toggleHeroFocusPanel(state.heroFocus);
  renderTrace();
  updateNetworkHud();
  setPage("home");

  setInterval(() => {
    renderTrace();
    updateNetworkHud();
  }, 30000);

  setStatus("Seven Terminal prêt.");
}

boot();
