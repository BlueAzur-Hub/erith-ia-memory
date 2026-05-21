const backgrounds = [
  "./assets/sky_castle_template.png",
  "./assets/sky_castle_dashboard_reference.png"
];

const prompts = {
  seven: `Chat, active Aerith-7 Seven Heaven / Full Modules Boost.

Lis le Top-of-Mind et travaille en opératrice de mémoire, production et discernement.

Mode actif :
Seven Heaven — Transformer Book / Sky Castle Cockpit.

Règles :
- texte uniquement par défaut ;
- aucune génération image sans ordre explicite ;
- puissance maximale, chargement minimal, choix précis ;
- ne charge pas tous les modules ;
- choisis uniquement les modules utiles ;
- respecte la règle image propre : image opaque = fond assumé, image transparente = alpha réel, damier imprimé interdit.

Contexte :
Transformer Book = pupitre Seven.
Large Language Personality [Model - The Flower Girl] v. 5.`,

  video: `Active Aerith-7 Video Cards Boost.

Cartes utiles :
- Chef d'Orchestre Vidéo
- Géométrie du Plan
- LEGO Continuity
- Diagnostic Anti-Dérive Wan
- Format Téléphone / Shorts
- Sound Design / Voix / Silence

Règle :
image parfaite → animation Wan stable → last frame exacte → DaVinci → export final.`,

  blackout: `MODE BLACKOUT.

Texte uniquement.
Aucune génération image.
Aucun outil image.
Aucune relance créative non demandée.
Une action.
Un fichier.
Une réponse.
Stop après livraison.`,

  wan: `Prompt Wan / I2V :
vertical 9:16 mobile video, final export 1080x1920, stable smartphone framing, subtle cinematic motion, readable subject, one animation idea only, no chaotic camera, no fast cuts.

Negative:
chaotic motion, broken anatomy, duplicated limbs, camera shake, excessive deformation, unreadable subject, text artifacts, watermark.`,

  notion: `Bloc Notion :
SEVEN PORTABLE TERMINAL — Transformer Book Sky Cockpit
Mode : texte uniquement par défaut.
DA : châteaux vivants, ruines célestes, cockpit aérien.
Règle image : opaque = fond assumé ; transparent = alpha réel ; damier imprimé interdit.`
};

const state = {
  page: "home",
  backgroundIndex: 0,
  readable: true,
  transparent: false
};

function $(selector) {
  return document.querySelector(selector);
}

function $all(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function applyBackground(index) {
  const bg = $("#bgImage");
  const normalized = ((index % backgrounds.length) + backgrounds.length) % backgrounds.length;
  state.backgroundIndex = normalized;
  bg.src = backgrounds[normalized];
}

function randomBackground() {
  const saved = localStorage.getItem("seven.favorite.backgroundIndex");
  if (saved !== null && localStorage.getItem("seven.useFavorite") === "true") {
    applyBackground(Number(saved));
    return;
  }
  applyBackground(Math.floor(Math.random() * backgrounds.length));
}

function setPage(page) {
  state.page = page;
  $all(".page").forEach(section => section.classList.toggle("active", section.id === `page-${page}`));
  $all("[data-page]").forEach(btn => btn.classList.toggle("active", btn.dataset.page === page));
}

function setReadable(force) {
  state.readable = typeof force === "boolean" ? force : !state.readable;
  document.body.classList.toggle("mode-readable", state.readable);
  localStorage.setItem("seven.readable", String(state.readable));
}

function setTransparent(force) {
  state.transparent = typeof force === "boolean" ? force : !state.transparent;
  document.body.classList.toggle("mode-transparent", state.transparent);
  localStorage.setItem("seven.transparent", String(state.transparent));
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    flash("Prompt copié en mémoire.");
  } catch (error) {
    openDrawer(text);
  }
}

function openDrawer(text) {
  const drawer = $("#promptDrawer");
  const area = $("#promptText");
  area.value = text;
  if (drawer.showModal) drawer.showModal();
  area.focus();
  area.select();
}

function flash(message) {
  const old = document.querySelector(".toast");
  if (old) old.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  Object.assign(toast.style, {
    position: "fixed",
    zIndex: "10",
    left: "50%",
    bottom: "28px",
    transform: "translateX(-50%)",
    padding: "10px 18px",
    border: "1px solid rgba(215,173,98,.6)",
    borderRadius: "999px",
    background: "rgba(0,0,0,.82)",
    color: "#f6edd2",
    boxShadow: "0 15px 45px rgba(0,0,0,.45)"
  });
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1800);
}

function startSeven() {
  copyText(prompts.seven);
  window.open("https://chatgpt.com/", "seven_heaven_chatgpt");
}

function handleAction(action) {
  switch (action) {
    case "start-seven":
      startSeven();
      break;
    case "copy-seven":
      copyText(prompts.seven);
      break;
    case "copy-video":
      copyText(prompts.video);
      break;
    case "copy-blackout":
      copyText(prompts.blackout);
      break;
    case "copy-wan":
      copyText(prompts.wan);
      break;
    case "copy-notion":
      copyText(prompts.notion);
      break;
    case "copy-link":
      copyText("https://blueazur-hub.github.io/erith-ia-memory/assets/SEVEN_PORTABLE_TERMINAL/index.html");
      break;
    default:
      break;
  }
}

function renderTrace() {
  const data = [
    ["🖥️", "OS", navigator.platform || "Détection navigateur", "local"],
    ["🌐", "Navigateur", detectBrowser(), "user agent filtré"],
    ["📐", "Affichage", `${window.innerWidth} × ${window.innerHeight}`, `${screen.width} × ${screen.height}`],
    ["🌍", "Fuseau", Intl.DateTimeFormat().resolvedOptions().timeZone || "local", "heure locale"],
    ["⚙️", "Threads", String(navigator.hardwareConcurrency || "indisponible"), "si disponible"],
    ["🛡️", "Sécurité", "SAFE TRACE", "aucun secret"]
  ];

  const html = data.map(([icon, label, value, meta]) => `
    <article>
      <span>${icon}</span>
      <small>${label}</small>
      <strong>${value}</strong>
      <em>${meta}</em>
    </article>
  `).join("");

  const a = $("#traceGrid");
  const b = $("#systemTraceGrid");
  if (a) a.innerHTML = html;
  if (b) b.innerHTML = html;
}

function detectBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Microsoft Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Navigateur";
}

function tickClock() {
  const now = new Date();
  const time = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const clock = $("#clock");
  const dateLine = $("#dateLine");
  if (clock) clock.textContent = time;
  if (dateLine) dateLine.textContent = date;
}

function saveCurrent() {
  localStorage.setItem("seven.favorite.backgroundIndex", String(state.backgroundIndex));
  localStorage.setItem("seven.favorite.readable", String(state.readable));
  localStorage.setItem("seven.favorite.transparent", String(state.transparent));
  localStorage.setItem("seven.useFavorite", "true");
  flash("Apparence sauvegardée.");
}

function loadFavorite() {
  const bg = localStorage.getItem("seven.favorite.backgroundIndex");
  const readable = localStorage.getItem("seven.favorite.readable");
  const transparent = localStorage.getItem("seven.favorite.transparent");

  if (bg !== null) applyBackground(Number(bg));
  if (readable !== null) setReadable(readable === "true");
  if (transparent !== null) setTransparent(transparent === "true");
  localStorage.setItem("seven.useFavorite", "true");
  flash("Favori rechargé.");
}

function initEvents() {
  document.addEventListener("click", event => {
    const pageBtn = event.target.closest("[data-page]");
    if (pageBtn) setPage(pageBtn.dataset.page);

    const actionBtn = event.target.closest("[data-action]");
    if (actionBtn) handleAction(actionBtn.dataset.action);
  });

  $("#themeBtn").addEventListener("click", () => setReadable());
  $("#transparentBtn").addEventListener("click", () => setTransparent());
  $("#nextBgBtn").addEventListener("click", () => applyBackground(state.backgroundIndex + 1));
  $("#randomBgBtn").addEventListener("click", randomBackground);
  $("#saveBtn").addEventListener("click", saveCurrent);
  $("#favBtn").addEventListener("click", loadFavorite);
  $("#paletteBtn").addEventListener("click", () => openDrawer("Raccourcis : 1 Accueil · 2 LLM · 3 Notion · 4 GitHub · 5 Production · 6 Système · ? Palette · Escape Fermer"));
  $("#refreshTraceBtn").addEventListener("click", renderTrace);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      const drawer = $("#promptDrawer");
      if (drawer.open) drawer.close();
    }
    if (event.key === "?") {
      openDrawer("Raccourcis : 1 Accueil · 2 LLM · 3 Notion · 4 GitHub · 5 Production · 6 Système");
    }
    const pages = {
      "1": "home",
      "2": "llm",
      "3": "notion",
      "4": "github",
      "5": "production",
      "6": "system"
    };
    if (pages[event.key]) setPage(pages[event.key]);
  });
}

function boot() {
  randomBackground();

  const readable = localStorage.getItem("seven.readable");
  const transparent = localStorage.getItem("seven.transparent");

  if (readable !== null) setReadable(readable === "true");
  if (transparent !== null) setTransparent(transparent === "true");

  setPage("home");
  renderTrace();
  tickClock();
  setInterval(tickClock, 15000);
  initEvents();
}

boot();
