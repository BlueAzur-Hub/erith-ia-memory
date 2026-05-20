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

  try { localStorage.setItem("seven-terminal-theme", mode); } catch (e) {}

  updateHeroFocus();
  setStatus(mode === "transparent" ? "Mode transparent actif." : "Mode lisibilité actif.");
}

function applyBackground(index) {
  state.bgIndex = (index + backgrounds.length) % backgrounds.length;
  const bg = backgrounds[state.bgIndex];

  document.body.dataset.bg = bg.id;
  document.body.style.setProperty("--active-bg", `url("${bg.url}")`);
  document.body.style.backgroundPosition = bg.position;

  try { localStorage.setItem("seven-terminal-bg-index", String(state.bgIndex)); } catch (e) {}

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

  try { localStorage.setItem("seven-terminal-hero", JSON.stringify(state.hero)); } catch (e) {}

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
    ip: "non exposée"
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
        <div>
          <small>${label}</small>
          <strong>${value}</strong>
          <em>${detail}</em>
        </div>
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

  let savedBg = 0;
  let savedTheme = document.body.dataset.theme || "transparent";
  let savedHero = null;

  try { savedBg = Number(localStorage.getItem("seven-terminal-bg-index") || "0"); } catch (e) {}
  try { savedTheme = localStorage.getItem("seven-terminal-theme") || savedTheme; } catch (e) {}
  try { savedHero = JSON.parse(localStorage.getItem("seven-terminal-hero") || "null"); } catch (e) {}

  applyBackground(savedBg);
  setVisibility(savedTheme);

  if (savedHero) {
    if ($("#heroX")) $("#heroX").value = savedHero.x ?? 50;
    if ($("#heroY")) $("#heroY").value = savedHero.y ?? 34;
    if ($("#heroZoom")) $("#heroZoom").value = savedHero.zoom ?? 100;
  }

  updateHeroFocus();
  renderTrace();
  updateNetworkHud();
  setPage("home");
  setStatus("Seven Terminal prêt.");
}

boot();
