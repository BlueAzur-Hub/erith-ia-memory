const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll("[data-page]");
const drawer = document.getElementById("drawer");
const drawerText = document.getElementById("drawerText");

const promptSeven = `Chat, active Aerith-7 Seven Heaven.

Mode texte uniquement.
Aucune génération image sans demande explicite.
Utilise le Seven Portable Terminal comme pupitre de travail.
Chargement minimal, choix précis.
Pas d’action outil non demandée.`;

function showPage(pageName) {
  pages.forEach(page => page.classList.toggle("active", page.id === `page-${pageName}`));
  navButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.page === pageName));
  localStorage.setItem("seven.page", pageName);
}

function renderTrace() {
  const grid = document.getElementById("traceGrid");
  if (!grid) return;

  const data = [
    ["Viewport", `${window.innerWidth} × ${window.innerHeight}`],
    ["Fuseau", Intl.DateTimeFormat().resolvedOptions().timeZone || "local"],
    ["Langue", navigator.language || "n/a"],
    ["Plateforme", navigator.platform || "n/a"],
    ["Sécurité", "SAFE TRACE"],
    ["Média", "Aucune génération automatique"]
  ];

  grid.innerHTML = data.map(([label, value]) => `
    <article class="trace-card">
      <small>${label}</small>
      <strong>${value}</strong>
    </article>
  `).join("");
}

async function copyText(text) {
  drawerText.value = text;
  drawer.classList.add("open");
  drawerText.select();

  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    document.execCommand("copy");
  }
}

navButtons.forEach(btn => {
  btn.addEventListener("click", () => showPage(btn.dataset.page));
});

document.getElementById("readabilityBtn").addEventListener("click", () => {
  document.body.classList.toggle("readable");
  localStorage.setItem("seven.readable", document.body.classList.contains("readable") ? "1" : "0");
});

document.getElementById("copyPromptBtn").addEventListener("click", () => copyText(promptSeven));
document.getElementById("openChatBtn").addEventListener("click", () => window.open("https://chatgpt.com/", "seven_chatgpt"));
document.getElementById("openGitHubBtn").addEventListener("click", () => window.open("https://github.com/BlueAzur-Hub/erith-ia-memory/tree/main/assets/SEVEN_PORTABLE_TERMINAL", "seven_github"));
document.getElementById("closeDrawerBtn").addEventListener("click", () => drawer.classList.remove("open"));

document.addEventListener("keydown", event => {
  const order = ["home", "llm", "notion", "github", "production", "system"];
  const index = Number(event.key) - 1;

  if (order[index]) showPage(order[index]);
  if (event.key === "Escape") drawer.classList.remove("open");
});

if (localStorage.getItem("seven.readable") === "1") {
  document.body.classList.add("readable");
}

showPage(localStorage.getItem("seven.page") || "home");
renderTrace();
window.addEventListener("resize", renderTrace);
