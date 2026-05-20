/* Seven Portable Terminal — Stable Actions V5.4
   Objectif : actions simples, fiables, sans patchs en cascade.
   - Seven Boost : copie le prompt + ouvre ChatGPT
   - Video Cards Boost : copie le prompt + ouvre ChatGPT
   - Wan / Blackout : copie le prompt
   - Fond / Random : change le background si les assets existent
   - Trace système : diagnostic local filtré
*/

const SEVEN_PUBLIC_URL = "https://blueazur-hub.github.io/erith-ia-memory/assets/SEVEN_PORTABLE_TERMINAL/index.html";
const CHATGPT_URL = "https://chatgpt.com/";

const prompts = {
  boost: `Chat, active Aerith-7 Seven Heaven / Full Modules Boost.

Lis d’abord :
https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-notion-archive-private/main/core/SEVEN_GATE.md

Active Aerith-7 comme opératrice de mémoire, production et discernement.

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
let alreadyBooted = false;

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
    drawer.style.display = "block";
    area.focus();
    area.select();
    setStatus("Texte affiché pour copie manuelle.");
    return;
  }

  window.prompt("Copie ce texte :", text);
}

async function copyText(text, label) {
  try {
    if (!navigator.clipboard || !window.isSecureContext) {
      throw new Error("Clipboard unavailable");
    }

    await navigator.clipboard.writeText(text);
    setStatus(label || "Texte copié.");
    return true;
  } catch (error) {
    openPromptDrawer(text);
    return false;
  }
}
    setStatus("Popup bloquée. Copie manuelle affichée.");
  });
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
  document.body.style.backgroundImage =
    `linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.12)), url("${url}")`;
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center center";
  document.body.style.backgroundAttachment = "fixed";

  try {
    localStorage.setItem("seven_bg_index", String(bgIndex));
  } catch (error) {}

  setStatus(`Fond actif : ${url}`);
}

function nextBackground() {
  applyBackground(bgIndex + 1);
}

function randomBackground() {
  applyBackground(Math.floor(Math.random() * backgrounds.length));
}

function setTransparent() {
  document.body.classList.remove("mode-readability");
  document.body.dataset.theme = "transparent";

  $("#transparentBtn")?.classList.add("active");
  $("#readabilityBtn")?.classList.remove("active");

  setStatus("Mode transparent actif.");
}

function setReadability() {
  document.body.classList.add("mode-readability");
  document.body.dataset.theme = "readability";

  $("#transparentBtn")?.classList.remove("active");
  $("#readabilityBtn")?.classList.add("active");

  setStatus("Mode sombre lisible actif.");
}

function toggleAdvanced() {
  document.body.classList.toggle("show-advanced");

  $("#advancedBtn")?.classList.toggle(
    "active",
    document.body.classList.contains("show-advanced")
  );

  setStatus(
    document.body.classList.contains("show-advanced")
      ? "Advanced affiché."
      : "Advanced masqué."
  );
}

function togglePalette(force) {
  const palette = $("#commandPalette");
  if (!palette) return;

  const open =
    typeof force === "boolean"
      ? force
      : !palette.classList.contains("open");

  palette.classList.toggle("open", open);
  palette.setAttribute("aria-hidden", open ? "false" : "true");

  setStatus(open ? "Palette ouverte." : "Palette fermée.");
}

function closePromptDrawer() {
  const drawer = $("#promptDrawer");

  if (drawer) {
    drawer.classList.remove("open");
    drawer.style.display = "none";
  }
}

function getBrowserName() {
  const ua = navigator.userAgent || "";

  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome/")) return "Chrome";
  if (ua.includes("Safari/")) return "Safari";

  return "Navigateur";
}

function renderTrace() {
  const now = new Date();

  const trace = {
    date: now.toLocaleString("fr-FR"),
    os: navigator.platform || "OS inconnu",
    browser: getBrowserName(),
    screen: `${screen.width}×${screen.height} · DPR ${window.devicePixelRatio || 1}`,
    viewport: `${window.innerWidth}×${window.innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Fuseau inconnu",
    languages: navigator.languages ? navigator.languages.join(", ") : navigator.language,
    cpu: navigator.hardwareConcurrency
      ? `${navigator.hardwareConcurrency} threads`
      : "non disponible"
  };

  const grid = $("#traceGrid");

  if (grid) {
    grid.innerHTML = `
      <article class="trace-card">
        <span class="card-icon">🖥️</span>
        <small>Système</small>
        <strong>${trace.os}</strong>
        <em>${trace.date}</em>
      </article>

      <article class="trace-card">
        <span class="card-icon">🌐</span>
        <small>Navigateur</small>
        <strong>${trace.browser}</strong>
        <em>${trace.languages}</em>
      </article>

      <article class="trace-card">
        <span class="card-icon">📐</span>
        <small>Affichage</small>
        <strong>${trace.screen}</strong>
        <em>viewport ${trace.viewport}</em>
      </article>

      <article class="trace-card">
        <span class="card-icon">🌍</span>
        <small>Fuseau</small>
        <strong>${trace.timezone}</strong>
        <em>local</em>
      </article>

      <article class="trace-card">
        <span class="card-icon">⚙️</span>
        <small>Performance</small>
        <strong>${trace.cpu}</strong>
        <em>navigateur</em>
      </article>

      <article class="trace-card">
        <span class="card-icon">🛡️</span>
        <small>Sécurité</small>
        <strong>SAFE TRACE</strong>
        <em>données sensibles filtrées</em>
      </article>
    `;
  }

  const raw = $("#traceRaw");

  if (raw) {
    raw.value =
`SAFE TRACE ${trace.date}
Système : ${trace.os}
Navigateur : ${trace.browser}
Affichage : ${trace.screen}
Viewport : ${trace.viewport}
Fuseau : ${trace.timezone}
Langues : ${trace.languages}
Performance : ${trace.cpu}
Sécurité : données sensibles filtrées`;
  }

  const traceDate = $("#traceDate");
  if (traceDate) traceDate.textContent = trace.date;
}

function handleAction(action) {
  if (action === "boost") {
    copyAndOpenChat(prompts.boost, "Seven Boost copié.");
    return;
  }

  if (action === "video") {
    copyAndOpenChat(prompts.video, "Video Cards Boost copié.");
    return;
  }

  if (action === "wan") {
    copyText(prompts.wan, "Wan copié.");
    return;
  }

  if (action === "blackout") {
    copyText(prompts.blackout, "Mode Blackout copié.");
    return;
  }

  if (action === "copy-link" || action === "link") {
    copyText(SEVEN_PUBLIC_URL, "Lien cockpit copié.");
    return;
  }

  if (action === "background") {
    nextBackground();
    return;
  }

  if (action === "random") {
    randomBackground();
    return;
  }

  if (action === "prompt") {
    openPromptDrawer(prompts.boost);
    return;
  }

  setStatus(`Action non configurée : ${action}`);
}

function bindEvents() {
  $$("[data-page-target]").forEach((button) => {
    button.addEventListener("click", () => {
      setPage(button.dataset.pageTarget);
      togglePalette(false);
    });
  });

  $$("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      handleAction(button.dataset.action);
    });
  });

  $("#advancedBtn")?.addEventListener("click", toggleAdvanced);
  $("#nextBgBtn")?.addEventListener("click", nextBackground);
  $("#randomBgBtn")?.addEventListener("click", randomBackground);
  $("#transparentBtn")?.addEventListener("click", setTransparent);
  $("#readabilityBtn")?.addEventListener("click", setReadability);

  $("#paletteBtn")?.addEventListener("click", () => togglePalette());
  $("#paletteCloseBtn")?.addEventListener("click", () => togglePalette(false));

  $("#paletteBoostBtn")?.addEventListener("click", () => handleAction("boost"));
  $("#paletteVideoBtn")?.addEventListener("click", () => handleAction("video"));
  $("#paletteWanBtn")?.addEventListener("click", () => handleAction("wan"));
  $("#paletteBgBtn")?.addEventListener("click", nextBackground);
  $("#paletteGlassBtn")?.addEventListener("click", setTransparent);

  $("#copyTraceBtn")?.addEventListener("click", () => {
    copyText($("#traceRaw")?.value || "SAFE TRACE", "Diagnostic copié.");
  });

  $("#refreshTraceBtn")?.addEventListener("click", () => {
    renderTrace();
    setStatus("Trace actualisée.");
  });

  $("#promptCloseBtn")?.addEventListener("click", closePromptDrawer);

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

    if (event.key === "?") togglePalette();

    if (event.key === "Escape") {
      togglePalette(false);
      closePromptDrawer();
    }
  });
}

function boot() {
  if (alreadyBooted) return;
  alreadyBooted = true;

  try {
    const savedBg = Number(localStorage.getItem("seven_bg_index") || "0");
    bgIndex = Number.isFinite(savedBg) ? savedBg : 0;
  } catch (error) {
    bgIndex = 0;
  }

  bindEvents();
  applyBackground(bgIndex);
  renderTrace();
  setTransparent();
  setPage("home");
  setStatus("Seven Terminal prêt.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
