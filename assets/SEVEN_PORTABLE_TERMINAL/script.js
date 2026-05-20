/* Seven Portable Terminal V8 — Golden Glass Sky Castle Dashboard */

const TERMINAL_LINK = "https://blueazur-hub.github.io/erith-ia-memory/assets/SEVEN_PORTABLE_TERMINAL/index.html";
const CHATGPT_URL = "https://chatgpt.com/";

const BACKGROUNDS = [
  { name: "Sky Castle Hero", family: "Sky Castle", url: "./assets/sky_castle_hero_banner.png" },
  { name: "AAA Dashboard Reference", family: "Sky Castle", url: "./assets/sky_castle_template.png" },
  { name: "Dashboard Reference", family: "Sky Castle", url: "./assets/sky_castle_dashboard_reference.png" },
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
last frame exacte pour continuité LEGO.
DaVinci pour le montage final.`;

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

const NOTION_TEXT = `Seven Portable Terminal V8

Terminal public :
${TERMINAL_LINK}

Usage :
1. Cliquer Seven Boost ou Video Cards.
2. ChatGPT s’ouvre ou revient.
3. Coller avec Ctrl+V.
4. Envoyer.

Architecture :
Focus / Extended / Full Cockpit.
Menu, profil, widgets, Advanced Panels et sous-menus optionnels.`;

const SUBMENUS = {
  dashboard: [
    ["🌸 Accueil", "Dashboard principal", () => openPage("home")],
    ["💠 Seven Boost", "Prompt complet", () => startSeven()],
    ["🎴 Video Cards", "Mode production", () => copyVideoCards()],
    ["🖥️ Système", "Safe Trace", () => openPage("system")]
  ],
  modules: [
    ["🧩 Modules Mémoire", "Influences créatives", () => copyModules()],
    ["🎬 Modules Production", "Wan / DaVinci", () => openPage("production")],
    ["🎨 Modules Visuels", "DA / Atlas", () => toggleAtlas(true)],
    ["🛡️ Modules Système", "Safe Trace", () => openPage("system")],
    ["🌐 Modules Publics", "ERITH public", () => openPage("notion")]
  ],
  workflows: [
    ["🧊 ComfyUI", "Images", () => copyWan()],
    ["📱 Wan / I2V", "Animation verticale", () => copyWan()],
    ["🎞️ DaVinci", "Montage", () => openPage("production")],
    ["📺 YouTube", "Publication", () => openPage("production")],
    ["🎙️ Narration", "Voix", () => openPage("production")]
  ],
  llm: [
    ["💬 ChatGPT", "Ouvrir", () => openChatGPTNamed()],
    ["🌸 Seven Boost", "Copier + ouvrir", () => startSeven()],
    ["🎴 Video Cards", "Production", () => copyVideoCards()],
    ["🧩 Modules", "Prompt modules", () => copyModules()],
    ["🌑 Blackout", "Texte seul", () => copyBlackout()]
  ],
  notion: [
    ["📚 ERITH Memory", "Mémoire humaine", () => openPage("notion")],
    ["🌐 Auto-Agent", "Page publique", () => openPage("notion")],
    ["🧾 Bloc Notion", "Copier", () => copyNotionText()]
  ],
  github: [
    ["📁 Repo public", "GitHub", () => openPage("github")],
    ["🖥️ Terminal folder", "Assets", () => openPage("github")],
    ["🚪 Seven Gate", "Core", () => openPage("github")],
    ["🔗 URL cockpit", "Copier", () => copyTerminalLink()]
  ],
  production: [
    ["🎴 Video Cards", "Diagnostic", () => copyVideoCards()],
    ["📱 Wan", "Checklist I2V", () => copyWan()],
    ["☁️ RunningHub", "Cloud", () => openPage("production")],
    ["🧬 Civitai", "Modèles", () => openPage("production")],
    ["🎙️ ElevenLabs", "Voix", () => openPage("production")]
  ],
  data: [
    ["🗄️ Données", "Index local", () => setStatus("Données : module placeholder V8.")],
    ["📚 Notion", "Mémoire humaine", () => openPage("notion")],
    ["🧬 GitHub", "Mémoire machine", () => openPage("github")]
  ],
  agents: [
    ["🤖 Agents IA", "À connecter", () => setStatus("Agents IA : placeholder V8.")],
    ["🌸 Seven", "Opératrice principale", () => startSeven()],
    ["🧩 Modules", "Sélection", () => copyModules()]
  ],
  automations: [
    ["⚙️ Automatisations", "À connecter", () => setStatus("Automatisations : placeholder V8.")],
    ["💾 Sauvegarde", "LocalStorage", () => saveFavorite()]
  ],
  integrations: [
    ["🧬 GitHub", "Repo", () => openPage("github")],
    ["📚 Notion", "Mémoire", () => openPage("notion")],
    ["🎬 Production", "Outils", () => openPage("production")]
  ],
  settings: [
    ["🛡️ Lisibilité", "Mode sombre", () => setVisualMode("readability")],
    ["🫧 Transparent", "Mode vitré", () => setVisualMode("transparent")],
    ["🎯 Focus", "Mode concentré", () => setViewMode("focus")],
    ["🧩 Extended", "Mode quotidien", () => setViewMode("extended")],
    ["⚙️ Full", "Mode cockpit", () => setViewMode("full")]
  ]
};

let bgIndex = 0;
let batteryState = { level: null, charging: null, supported: false };

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function setStatus(message) {
  const status = $("#status");
  if (status) status.textContent = message;
  console.log("[Seven V8]", message);
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
      setTimeout(() => {
        area.focus();
        area.select();
      }, 40);
    } else {
      window.prompt("Copie ce texte :", text);
    }
    return false;
  }
}

function openChatGPTNamed() {
  const tab = window.open(CHATGPT_URL, "seven_heaven_chatgpt");
  if (tab) {
    try { tab.focus(); } catch {}
  }
  return !!tab;
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

function togglePrompt(force) {
  const drawer = $("#promptDrawer");
  const area = $("#promptText");
  if (!drawer) return;
  const open = typeof force === "boolean" ? force : !drawer.classList.contains("open");
  if (area && open) area.value = AERITH_PROMPT;
  drawer.classList.toggle("open", open);
}

function openPage(name) {
  $$(".page").forEach(page => page.classList.toggle("active", page.id === `page-${name}`));
  $$(".nav-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.page === name));
  document.body.dataset.page = name;
  localStorage.setItem("seven_v8_page", name);
  setStatus("Page : " + name);
  if (name === "system") refreshSystem();
}

function setVisualMode(mode) {
  const readability = mode === "readability";
  document.body.classList.toggle("visual-readability", readability);
  document.body.classList.toggle("visual-transparent", !readability);
  $("#transparentBtn")?.classList.toggle("active", !readability);
  $("#readabilityBtn")?.classList.toggle("active", readability);
  localStorage.setItem("seven_v8_visual", readability ? "readability" : "transparent");
  setStatus(readability ? "Mode lisibilité actif." : "Mode transparent contrôlé actif.");
}

function setViewMode(mode) {
  document.body.classList.remove("view-focus", "view-extended", "view-full");
  document.body.classList.add(`view-${mode}`);
  localStorage.setItem("seven_v8_view", mode);
  setStatus("Mode affichage : " + mode);
}

function toggleClassOnBody(className, storeKey, statusOn, statusOff) {
  const enabled = document.body.classList.toggle(className);
  localStorage.setItem(storeKey, enabled ? "1" : "0");
  setStatus(enabled ? statusOn : statusOff);
}

function toggleMenu() { toggleClassOnBody("hide-menu", "seven_v8_hide_menu", "Menu gauche masqué.", "Menu gauche visible."); }
function toggleProfile() { toggleClassOnBody("hide-profile", "seven_v8_hide_profile", "Profil masqué.", "Profil visible."); }
function toggleWidgets() { toggleClassOnBody("hide-widgets", "seven_v8_hide_widgets", "Widgets masqués.", "Widgets visibles."); }
function toggleQuickAccess() { toggleClassOnBody("hide-quick", "seven_v8_hide_quick", "Accès rapide masqué.", "Accès rapide visible."); }
function toggleActivity() { toggleClassOnBody("hide-activity", "seven_v8_hide_activity", "Activité masquée.", "Activité visible."); }

function toggleAdvanced(force) {
  const open = typeof force === "boolean" ? force : !document.body.classList.contains("show-advanced");
  document.body.classList.toggle("show-advanced", open);
  $("#advancedBtn")?.classList.toggle("active", open);
  localStorage.setItem("seven_v8_advanced", open ? "1" : "0");
  setStatus(open ? "Advanced Panels ouverts." : "Advanced Panels réduits.");
}

function toggleAtlas(force) {
  const open = typeof force === "boolean" ? force : !document.body.classList.contains("show-atlas");
  document.body.classList.toggle("show-atlas", open);
  $("#atlasBtn")?.classList.toggle("active", open);
  if (open) renderAtlas();
  localStorage.setItem("seven_v8_atlas", open ? "1" : "0");
  setStatus(open ? "Atlas ouvert." : "Atlas fermé.");
}

function toggleSystemDetails(force) {
  const drawer = $("#systemDrawer");
  if (!drawer) return;
  const open = typeof force === "boolean" ? force : !drawer.classList.contains("open");
  drawer.classList.toggle("open", open);
  if (open) refreshSystem();
  setStatus(open ? "System Details HUD ouvert." : "System Details HUD fermé.");
}

function togglePalette(force) {
  const palette = $("#palette");
  if (!palette) return;
  const open = typeof force === "boolean" ? force : !palette.classList.contains("open");
  palette.classList.toggle("open", open);
  palette.setAttribute("aria-hidden", open ? "false" : "true");
}

function applyBackground(index) {
  bgIndex = (index + BACKGROUNDS.length) % BACKGROUNDS.length;
  const bg = BACKGROUNDS[bgIndex];
  document.documentElement.style.setProperty("--bg-active", `url("${bg.url}")`);
  localStorage.setItem("seven_v8_bg", String(bgIndex));
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
  BACKGROUNDS.forEach((bg, index) => {
    const card = document.createElement("button");
    card.className = "atlas-card";
    card.type = "button";
    card.style.setProperty("--thumb", `url("${bg.url}")`);
    card.innerHTML = `<strong>${bg.name}</strong><br><small>${bg.family}</small>`;
    card.addEventListener("click", () => applyBackground(index));
    grid.appendChild(card);
  });
}

function setAmbiance(name) {
  document.body.dataset.ambiance = name;
  localStorage.setItem("seven_v8_ambiance", name);
  setStatus("Ambiance : " + name);
}

function saveFavorite() {
  const payload = {
    bgIndex,
    visual: document.body.classList.contains("visual-readability") ? "readability" : "transparent",
    view: ["focus", "extended", "full"].find(v => document.body.classList.contains(`view-${v}`)) || "extended",
    ambiance: document.body.dataset.ambiance || "sky",
    advanced: document.body.classList.contains("show-advanced"),
    atlas: document.body.classList.contains("show-atlas"),
    hideMenu: document.body.classList.contains("hide-menu"),
    hideProfile: document.body.classList.contains("hide-profile"),
    hideWidgets: document.body.classList.contains("hide-widgets"),
    hideQuick: document.body.classList.contains("hide-quick"),
    hideActivity: document.body.classList.contains("hide-activity")
  };
  localStorage.setItem("seven_v8_favorite", JSON.stringify(payload));
  setStatus("Favori V8 sauvegardé.");
}

function loadFavorite() {
  try {
    const payload = JSON.parse(localStorage.getItem("seven_v8_favorite") || "null");
    if (!payload) throw new Error("no favorite");
    applyBackground(Number(payload.bgIndex || 0));
    setVisualMode(payload.visual || "transparent");
    setViewMode(payload.view || "extended");
    setAmbiance(payload.ambiance || "sky");
    toggleAdvanced(!!payload.advanced);
    toggleAtlas(!!payload.atlas);
    document.body.classList.toggle("hide-menu", !!payload.hideMenu);
    document.body.classList.toggle("hide-profile", !!payload.hideProfile);
    document.body.classList.toggle("hide-widgets", !!payload.hideWidgets);
    document.body.classList.toggle("hide-quick", !!payload.hideQuick);
    document.body.classList.toggle("hide-activity", !!payload.hideActivity);
    setStatus("Favori V8 chargé.");
  } catch {
    setStatus("Aucun favori V8 trouvé.");
  }
}

function clearFavorite() {
  localStorage.removeItem("seven_v8_favorite");
  setStatus("Favori V8 effacé.");
}

function resetVisual() {
  applyBackground(0);
  setVisualMode("transparent");
  setViewMode("extended");
  setAmbiance("sky");
  toggleAdvanced(false);
  toggleAtlas(false);
  ["hide-menu", "hide-profile", "hide-widgets", "hide-quick", "hide-activity"].forEach(cls => document.body.classList.remove(cls));
  setStatus("Reset visuel V8 effectué.");
}

function openSubmenu(name) {
  const menu = $("#miniSubmenu");
  const title = $("#submenuTitle");
  const grid = $("#submenuGrid");
  if (!menu || !grid || !title) return;

  const items = SUBMENUS[name] || SUBMENUS.dashboard;
  title.textContent = "Sous-menu · " + name;
  grid.innerHTML = "";
  items.forEach(([label, desc, fn]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.innerHTML = `<strong>${label}</strong><span>${desc}</span>`;
    btn.addEventListener("click", fn);
    grid.appendChild(btn);
  });
  menu.classList.add("open");
  localStorage.setItem("seven_v8_submenu", name);
  setStatus("Sous-menu : " + name);
}

function closeSubmenu() {
  $("#miniSubmenu")?.classList.remove("open");
  localStorage.removeItem("seven_v8_submenu");
}

function detectBrowser() {
  const ua = navigator.userAgent || "";
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome/")) return "Chrome";
  if (ua.includes("Safari/")) return "Safari";
  return "Navigateur";
}

async function updateBattery() {
  try {
    if (!navigator.getBattery) throw new Error("Battery API unavailable");
    const battery = await navigator.getBattery();
    batteryState = {
      supported: true,
      level: Math.round(battery.level * 100),
      charging: battery.charging
    };

    const onChange = () => {
      batteryState.level = Math.round(battery.level * 100);
      batteryState.charging = battery.charging;
      refreshSystem(false);
    };
    battery.addEventListener("levelchange", onChange);
    battery.addEventListener("chargingchange", onChange);
  } catch {
    batteryState = { supported: false, level: null, charging: null };
  }
}

async function fetchPublicIp() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch("https://api.ipify.org?format=json", { signal: controller.signal });
    const data = await response.json();
    localStorage.setItem("seven_v8_public_ip", data.ip || "non disponible");
  } catch {
    if (!localStorage.getItem("seven_v8_public_ip")) {
      localStorage.setItem("seven_v8_public_ip", "non disponible");
    }
  } finally {
    clearTimeout(timeout);
  }
}

function getConnectionInfo() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!conn) return { type: "n/a", downlink: "n/a", rtt: "n/a" };
  return {
    type: conn.effectiveType || conn.type || "n/a",
    downlink: conn.downlink ? `${conn.downlink} Mbps` : "n/a",
    rtt: conn.rtt ? `${conn.rtt} ms` : "n/a"
  };
}

function getTrace() {
  const now = new Date();
  const conn = getConnectionInfo();
  const ip = localStorage.getItem("seven_v8_public_ip") || "détection...";
  const memory = navigator.deviceMemory ? `${navigator.deviceMemory} GB approx.` : "non disponible";
  const battery = batteryState.supported
    ? `${batteryState.level}% · ${batteryState.charging ? "en charge" : "sur batterie"}`
    : "non disponible";

  return {
    date: now.toLocaleString("fr-FR"),
    time: now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    os: navigator.platform || "OS inconnu",
    browser: detectBrowser(),
    screen: `${screen.width}×${screen.height} · DPR ${window.devicePixelRatio || 1}`,
    viewport: `${window.innerWidth}×${window.innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Fuseau inconnu",
    languages: navigator.languages ? navigator.languages.join(", ") : navigator.language,
    cpu: navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} threads` : "non disponible",
    memory,
    battery,
    ip,
    network: `${conn.downlink} · ${conn.rtt}`,
    connection: conn.type,
    session: location.hostname || "local",
    security: "SAFE TRACE · aucun RustDesk ID · aucun mot de passe"
  };
}

function card(icon, label, value, note) {
  return `<article class="system-card"><span class="icon">${icon}</span><small>${label}</small><strong>${value}</strong><em>${note}</em></article>`;
}

function renderSystemCards(trace) {
  return [
    card("🌐", "IP publique", trace.ip, "détection réseau"),
    card("🔋", "Batterie", trace.battery, batteryState.supported ? "API batterie" : "API absente"),
    card("💾", "Mémoire", trace.memory, "si navigateur compatible"),
    card("⚙️", "CPU", trace.cpu, "threads navigateur"),
    card("🖥️", "Affichage", trace.screen, `viewport ${trace.viewport}`),
    card("🌍", "Fuseau", trace.timezone, trace.date),
    card("⏳", "Session", trace.session, "en ligne"),
    card("📡", "Réseau", trace.network, trace.connection),
    card("🧭", "Navigateur", trace.browser, trace.languages),
    card("🕰️", "Horodatage", trace.time, trace.date),
    card("🛡️", "Safe Trace", "Actif", "aucun identifiant sensible"),
    card("✦", "Mode", currentModeLabel(), "V8 cockpit")
  ].join("");
}

function currentModeLabel() {
  const view = ["focus", "extended", "full"].find(v => document.body.classList.contains(`view-${v}`)) || "extended";
  const visual = document.body.classList.contains("visual-readability") ? "lisibilité" : "transparent";
  return `${view} · ${visual}`;
}

function renderRawTrace(trace) {
  return `SAFE TRACE ${trace.date}
IP publique : ${trace.ip}
Batterie : ${trace.battery}
Mémoire : ${trace.memory}
Système : ${trace.os}
Navigateur : ${trace.browser}
Affichage : ${trace.screen}
Viewport : ${trace.viewport}
Fuseau : ${trace.timezone}
Langues : ${trace.languages}
CPU : ${trace.cpu}
Réseau : ${trace.network}
Connexion : ${trace.connection}
Session : ${trace.session}
Sécurité : ${trace.security}`;
}

function refreshSystem(updateStatus = true) {
  const trace = getTrace();
  const html = renderSystemCards(trace);
  ["#stripGrid", "#systemGrid", "#systemDrawerGrid"].forEach(selector => {
    const el = $(selector);
    if (el) el.innerHTML = html;
  });

  const raw = renderRawTrace(trace);
  if ($("#systemRaw")) $("#systemRaw").value = raw;
  if ($("#systemDrawerRaw")) $("#systemDrawerRaw").value = raw;

  $("#netDown") && ($("#netDown").textContent = getConnectionInfo().downlink);
  $("#netUp") && ($("#netUp").textContent = "local");
  $("#netPing") && ($("#netPing").textContent = getConnectionInfo().rtt);

  if (updateStatus) setStatus("Diagnostic système actualisé.");
}

async function copySystemDiagnostics() {
  refreshSystem(false);
  const text = $("#systemRaw")?.value || $("#systemDrawerRaw")?.value || "SAFE TRACE";
  await copyText(text);
  setStatus("Diagnostic système copié.");
}

function updateClock() {
  const now = new Date();
  const clock = $("#localClock");
  const date = $("#localDate");
  if (clock) clock.textContent = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  if (date) date.textContent = now.toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long" });
}

function bindHelp() {
  $$("[data-help]").forEach(el => {
    el.addEventListener("mouseenter", () => {
      const target = $("#guidanceText");
      if (target) target.textContent = el.dataset.help;
    });
  });
}

function restoreState() {
  const savedBg = Number(localStorage.getItem("seven_v8_bg") || "0");
  applyBackground(Number.isFinite(savedBg) ? savedBg : 0);
  setVisualMode(localStorage.getItem("seven_v8_visual") || "transparent");
  setViewMode(localStorage.getItem("seven_v8_view") || "extended");
  setAmbiance(localStorage.getItem("seven_v8_ambiance") || "sky");
  toggleAdvanced(localStorage.getItem("seven_v8_advanced") === "1");
  toggleAtlas(localStorage.getItem("seven_v8_atlas") === "1");

  ["hide_menu", "hide_profile", "hide_widgets", "hide_quick", "hide_activity"].forEach(key => {
    if (localStorage.getItem(`seven_v8_${key}`) === "1") {
      document.body.classList.add(key.replace("_", "-"));
    }
  });

  const page = localStorage.getItem("seven_v8_page");
  if (page) openPage(page);

  const submenu = localStorage.getItem("seven_v8_submenu");
  if (submenu) openSubmenu(submenu);
}

async function boot() {
  restoreState();
  renderAtlas();
  bindHelp();
  await updateBattery();
  refreshSystem(false);
  fetchPublicIp().then(() => refreshSystem(false));
  updateClock();
  setInterval(updateClock, 15000);
  setInterval(() => refreshSystem(false), 60000);

  document.addEventListener("keydown", (event) => {
    if (event.target && ["INPUT", "TEXTAREA"].includes(event.target.tagName)) return;
    const pages = { "1": "home", "2": "llm", "3": "notion", "4": "github", "5": "production", "6": "system" };
    if (pages[event.key]) openPage(pages[event.key]);
    if (event.key === "?") togglePalette();
    if (event.key === "Escape") {
      togglePalette(false);
      togglePrompt(false);
      closeSubmenu();
      toggleSystemDetails(false);
    }
  });

  window.addEventListener("resize", () => refreshSystem(false));
  setStatus("Seven Terminal V8 prêt.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
