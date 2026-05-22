const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll("[data-page]");
const drawer = document.getElementById("drawer");
const drawerText = document.getElementById("drawerText");
const heroImage = document.getElementById("heroImage");

const state = {
  bgIndex: 0,
  heroX: 50,
  heroY: 35,
  heroZoom: 112
};

const backgrounds = [
  "background_chateau_ciel_source.png"
];

const prompts = {
  seven: `Chat, active Aerith-7 Seven Heaven / Full Modules Boost.

Mode texte uniquement par défaut.
Aucune génération image sans demande explicite.
Chargement minimal, choix précis.
Respecte le projet comme cockpit transparent sur background vivant.`,
  video: `Active Seven Heaven — Video Cards Boost.
Cartes utiles seulement.
Mode LEGO protégé.
Aucune génération image sans demande explicite.`,
  blackout: `MODE BLACKOUT.
Aucun outil image.
Texte uniquement : diagnostic, prompts, décisions, noms de fichiers, archivage.`,
  notion: `Seven Portable Terminal
Cockpit transparent sur fond ruines célestes.
Background-first.
Aucune génération automatique.`,
  link: `https://blueazur-hub.github.io/erith-ia-memory/assets/SEVEN_PORTABLE_TERMINAL/index.html`,
  trace: `SAFE TRACE — aucun RustDesk ID, aucun mot de passe, diagnostic navigateur local uniquement.`
};

function saveState() {
  localStorage.setItem("seven.cockpit.state", JSON.stringify({
    bgIndex: state.bgIndex,
    heroX: state.heroX,
    heroY: state.heroY,
    heroZoom: state.heroZoom,
    transparent: document.body.classList.contains("transparent"),
    readable: document.body.classList.contains("readable"),
    page: getCurrentPage()
  }));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem("seven.cockpit.state") || "{}");
    Object.assign(state, saved);
    document.body.classList.toggle("transparent", !!saved.transparent);
    document.body.classList.toggle("readable", !!saved.readable);
    applyBackground();
    applyHero();
    showPage(saved.page || "home");
  } catch {
    showPage("home");
  }
}

function getCurrentPage() {
  const active = document.querySelector(".page.active");
  return active ? active.id.replace("page-", "") : "home";
}

function showPage(name) {
  pages.forEach(page => page.classList.toggle("active", page.id === `page-${name}`));
  navButtons.forEach(button => button.classList.toggle("active", button.dataset.page === name));
  saveState();
}

function applyBackground() {
  const bg = backgrounds[state.bgIndex % backgrounds.length];
  document.getElementById("worldBg").style.backgroundImage = `url("${bg}")`;
}

function applyHero() {
  heroImage.style.objectPosition = `${state.heroX}% ${state.heroY}%`;
  heroImage.style.transform = `scale(${state.heroZoom / 100})`;
  document.getElementById("heroX").value = state.heroX;
  document.getElementById("heroY").value = state.heroY;
  document.getElementById("heroZoom").value = state.heroZoom;
  saveState();
}

function renderTrace() {
  const items = [
    ["OS", navigator.platform || "Détection navigateur", "local / safe"],
    ["Navigateur", navigator.userAgent.split(" ").slice(0, 4).join(" "), "user agent filtré"],
    ["Affichage", `${window.innerWidth} × ${window.innerHeight}`, "viewport"],
    ["Fuseau", Intl.DateTimeFormat().resolvedOptions().timeZone || "local", "heure locale"],
    ["Langue", navigator.language || "n/a", "navigateur"],
    ["Sécurité", "SAFE TRACE", "aucun identifiant sensible"]
  ];

  const html = items.map(([a, b, c]) => `
    <article class="trace-card">
      <small>${a}</small>
      <strong>${b}</strong>
      <em>${c}</em>
    </article>
  `).join("");

  document.getElementById("traceGrid").innerHTML = html;
  document.getElementById("systemGrid").innerHTML = html;
}

async function copyText(text) {
  drawerText.value = text;
  drawer.classList.add("open");
  drawerText.select();

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    document.execCommand("copy");
  }
}

navButtons.forEach(button => button.addEventListener("click", () => showPage(button.dataset.page)));
document.querySelectorAll("[data-copy]").forEach(button => {
  button.addEventListener("click", () => copyText(prompts[button.dataset.copy] || ""));
});

document.getElementById("advancedBtn").addEventListener("click", () => {
  document.getElementById("advancedPanel").scrollIntoView({ behavior: "smooth", block: "center" });
});

document.getElementById("ambianceBtn").addEventListener("click", () => {
  document.body.classList.toggle("readable");
  saveState();
});

document.getElementById("saveBtn").addEventListener("click", saveState);
document.getElementById("favoriteBtn").addEventListener("click", loadState);

document.getElementById("nextBgBtn").addEventListener("click", () => {
  state.bgIndex = (state.bgIndex + 1) % backgrounds.length;
  applyBackground();
  saveState();
});

document.getElementById("randomBgBtn").addEventListener("click", () => {
  state.bgIndex = Math.floor(Math.random() * backgrounds.length);
  applyBackground();
  saveState();
});

document.getElementById("transparentBtn").addEventListener("click", () => {
  document.body.classList.toggle("transparent");
  saveState();
});

document.getElementById("readabilityBtn").addEventListener("click", () => {
  document.body.classList.toggle("readable");
  saveState();
});

document.getElementById("heroFocusBtn").addEventListener("click", () => {
  document.getElementById("heroFocus").classList.add("open");
});

document.getElementById("closeHeroFocusBtn").addEventListener("click", () => {
  document.getElementById("heroFocus").classList.remove("open");
});

document.getElementById("paletteBtn").addEventListener("click", () => {
  document.getElementById("palette").classList.add("open");
});

document.getElementById("closePaletteBtn").addEventListener("click", () => {
  document.getElementById("palette").classList.remove("open");
});

document.getElementById("closeDrawerBtn").addEventListener("click", () => drawer.classList.remove("open"));
document.getElementById("refreshTraceBtn").addEventListener("click", renderTrace);

document.getElementById("openRepoBtn").addEventListener("click", () => {
  window.open("https://github.com/BlueAzur-Hub/erith-ia-memory", "seven_repo");
});

document.getElementById("openTerminalFolderBtn").addEventListener("click", () => {
  window.open("https://github.com/BlueAzur-Hub/erith-ia-memory/tree/main/assets/SEVEN_PORTABLE_TERMINAL", "seven_terminal_folder");
});

["heroX", "heroY", "heroZoom"].forEach(id => {
  document.getElementById(id).addEventListener("input", event => {
    const key = id === "heroX" ? "heroX" : id === "heroY" ? "heroY" : "heroZoom";
    state[key] = Number(event.target.value);
    applyHero();
  });
});

document.querySelectorAll("[data-nudge]").forEach(button => {
  button.addEventListener("click", () => {
    const step = 3;
    if (button.dataset.nudge === "up") state.heroY = Math.max(0, state.heroY - step);
    if (button.dataset.nudge === "down") state.heroY = Math.min(100, state.heroY + step);
    if (button.dataset.nudge === "left") state.heroX = Math.max(0, state.heroX - step);
    if (button.dataset.nudge === "right") state.heroX = Math.min(100, state.heroX + step);
    applyHero();
  });
});

document.getElementById("resetHeroBtn").addEventListener("click", () => {
  state.heroX = 50;
  state.heroY = 35;
  state.heroZoom = 112;
  applyHero();
});

document.querySelectorAll("[data-page-jump]").forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.pageJump);
    document.getElementById("palette").classList.remove("open");
  });
});

document.addEventListener("keydown", event => {
  const order = ["home", "llm", "notion", "github", "production", "system"];
  const n = Number(event.key) - 1;

  if (order[n]) showPage(order[n]);
  if (event.key === "?") document.getElementById("palette").classList.add("open");
  if (event.key === "Escape") {
    drawer.classList.remove("open");
    document.getElementById("palette").classList.remove("open");
    document.getElementById("heroFocus").classList.remove("open");
  }
});

window.addEventListener("resize", renderTrace);

loadState();
applyBackground();
applyHero();
renderTrace();
