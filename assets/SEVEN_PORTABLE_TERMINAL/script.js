/* Seven Portable Terminal — RECOVERY JS SIMPLE
   Objectif : remettre les fonctions utiles en marche.
   - navigation pages
   - Seven Boost
   - Video Cards Boost
   - Wan
   - Blackout
   - lien cockpit
   - fond suivant
   - trace système
*/

const SEVEN_PUBLIC_URL = "https://blueazur-hub.github.io/erith-ia-memory/assets/SEVEN_PORTABLE_TERMINAL/index.html";

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
DaVinci pour le montage final.`,

  blackout: `Mode Blackout.

Texte uniquement.
Aucun outil image.
Aucune génération image.
Aucune action GitHub automatique.
Réponse courte, directe, opérationnelle.
On stabilise avant de modifier.`
};

const backgrounds = [
  "./background_historique_lr.png",
  "./atlas_29_sky_bridge_ruins_temple.jpg",
  "./atlas_29_suspended_city_temple.jpg",
  "./atlas_29_grand_tree_garden_arbre.jpg"
];

let bgIndex = 0;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function setStatus(message) {
  const status = $("#statusLine");
  if (status) status.textContent = message;
  console.log("[Seven]", message);
}

function openPromptDrawer(text) {
  const drawer = $("#promptDrawer");
  const area = $("#promptText");

  if (drawer && area) {
    area.value = text;
    drawer.classList.add("open");
    area.focus();
    area.select();
    setStatus("Copie manuelle : texte affiché.");
    return;
  }

  window.prompt("Copie ce texte :", text);
}

async function copyText(text, label) {
  try {
    await navigator.clipboard.writeText(text);
    setStatus(label || "Texte copié.");
  } catch (error) {
    openPromptDrawer(text);
  }
}

function setPage(pageName) {
  $$(".page").forEach((page) => {
    page.classList.toggle("active", page.id === `page-${pageName}`);
  });

  $$("[data-page-target]").forEach((button) => {
    button.classList.toggle("active", button.dataset.pageTarget === pageName);
  });

  setStatus(`Page : ${pageName}`);
}

function applyBackground(index) {
  if (!backgrounds.length) return;

  bgIndex = (index + backgrounds.length) % backgrounds.length;
  const url = backgrounds[bgIndex];

  document.documentElement.style.setProperty("--active-bg", `url("${url}")`);
  document.body.style.backgroundImage = `linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.12)), url("${url}")`;
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center center";
  document.body.style.backgroundAttachment = "fixed";

  localStorage.setItem("seven_bg_index", String(bgIndex));
  setStatus(`Fond actif : ${url}`);
}

function nextBackground() {
  applyBackground(bgIndex + 1);
}

function randomBackground() {
  applyBackground(Math.floor(Math.random() * backgrounds.length));
}

function toggleReadability() {
  document.body.classList.toggle("mode-readability");
  setStatus(document.body.classList.contains("mode-readability") ? "Mode sombre actif." : "Mode transparent actif.");
}

function toggleAdvanced() {
  document.body.classList.toggle("show-advanced");
  setStatus(document.body.classList.contains("show-advanced") ? "Advanced affiché." : "Advanced masqué.");
}

function renderTrace() {
  const now = new Date();

  const trace = {
    date: now.toLocaleString("fr-FR"),
    os: navigator.platform || "OS inconnu",
    browser: navigator.userAgent.includes("Firefox") ? "Firefox" : navigator.userAgent.includes("Chrome") ? "Chrome" : "Navigateur",
    screen: `${screen.width}×${screen.height} · DPR ${window.devicePixelRatio || 1}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Fuseau inconnu",
    languages: navigator.languages ? navigator.languages.join(", ") : navigator.language,
    cpu: navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} threads` : "non disponible",
    security: "Diagnostic filtré : aucun RustDesk ID, aucun mot de passe"
  };

  const grid = $("#traceGrid");
  if (grid) {
    grid.innerHTML = `
      <article class="trace-card"><span class="card-icon">🖥️</span><small>Système</small><strong>${trace.os}</strong><em>${trace.date}</em></article>
      <article class="trace-card"><span class="card-icon">🌐</span><small>Navigateur</small><strong>${trace.browser}</strong><em>${trace.languages}</em></article>
      <article class="trace-card"><span class="card-icon">📐</span><small>Affichage</small><strong>${trace.screen}</strong><em>viewport ${window.innerWidth}×${window.innerHeight}</em></article>
      <article class="trace-card"><span class="card-icon">🌍</span><small>Fuseau</small><strong>${trace.timezone}</strong><em>local</em></article>
      <article class="trace-card"><span class="card-icon">⚙️</span><small>Performance</small><strong>${trace.cpu}</strong><em>navigateur</em></article>
      <article class="trace-card"><span class="card-icon">🛡️</span><small>Sécurité</small><strong>Diagnostic filtré</strong><em>aucun identifiant sensible</em></article>
    `;
  }

  const raw = $("#traceRaw");
  if (raw) {
    raw.value = `SAFE TRACE ${trace.date}
Système : ${trace.os}
Navigateur : ${trace.browser}
Affichage : ${trace.screen}
Fuseau : ${trace.timezone}
Langues : ${trace.languages}
Performance : ${trace.cpu}
Sécurité : ${trace.security}`;
  }

  const date = $("#traceDate");
  if (date) date.textContent = trace.date;
}

function handleAction(action) {
  if (action === "boost") return copyText(prompts.boost, "Seven Boost copié.");
  if (action === "video") return copyText(prompts.video, "Video Cards Boost copié.");
  if (action === "wan") return copyText(prompts.wan, "Wan copié.");
  if (action === "blackout") return copyText(prompts.blackout, "Mode Blackout copié.");
  if (action === "copy-link" || action === "link") return copyText(SEVEN_PUBLIC_URL, "Lien cockpit copié.");
  if (action === "background") return nextBackground();
  if (action === "random") return randomBackground();
  if (action === "prompt") return openPromptDrawer(prompts.boost);

  setStatus(`Action non configurée : ${action}`);
}

function bindEvents() {
  $$("[data-page-target]").forEach((button) => {
    button.addEventListener("click", () => setPage(button.dataset.pageTarget));
  });

  $$("[data-action]").forEach((button) => {
    button.addEventListener("click", () => handleAction(button.dataset.action));
  });

  $("#advancedBtn")?.addEventListener("click", toggleAdvanced);
  $("#nextBgBtn")?.addEventListener("click", nextBackground);
  $("#randomBgBtn")?.addEventListener("click", randomBackground);
  $("#readabilityBtn")?.addEventListener("click", toggleReadability);
  $("#transparentBtn")?.addEventListener("click", () => {
    document.body.classList.remove("mode-readability");
    setStatus("Mode transparent actif.");
  });

  $("#copyTraceBtn")?.addEventListener("click", () => {
    copyText($("#traceRaw")?.value || "SAFE TRACE", "Diagnostic copié.");
  });

  $("#refreshTraceBtn")?.addEventListener("click", () => {
    renderTrace();
    setStatus("Trace actualisée.");
  });

  $("#promptCloseBtn")?.addEventListener("click", () => {
    $("#promptDrawer")?.classList.remove("open");
  });

  document.addEventListener("keydown", (event) => {
    if (event.target && ["INPUT", "TEXTAREA"].includes(event.target.tagName)) return;

    const pages = {
      "1": "home",
      "2": "llm",
      "3": "notion",
      "4": "github",
      "5": "production",
      "6": "system"
    };

    if (pages[event.key]) setPage(pages[event.key]);

    if (event.key === "Escape") {
      $("#promptDrawer")?.classList.remove("open");
    }
  });
}

function boot() {
  const savedBg = Number(localStorage.getItem("seven_bg_index") || "0");
  bgIndex = Number.isFinite(savedBg) ? savedBg : 0;

  bindEvents();
  applyBackground(bgIndex);
  renderTrace();
  setPage("home");
  setStatus("Seven Terminal prêt.");
}

document.addEventListener("DOMContentLoaded", boot);
