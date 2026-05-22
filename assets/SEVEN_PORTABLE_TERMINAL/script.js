const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll("[data-page]");

const promptSeven = `Chat, active Aerith-7 Seven Heaven / Full Modules Boost.

Mode texte uniquement.
Aucune génération image sans demande explicite.
Utilise le Seven Portable Terminal comme pupitre de travail.
Respecte le pipeline : observer, diagnostiquer, agir seulement sur demande.`;

function showPage(name) {
  pages.forEach(page => page.classList.toggle("active", page.id === `page-${name}`));
  navButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.page === name));
  localStorage.setItem("seven.page", name);
}

navButtons.forEach(btn => {
  btn.addEventListener("click", () => showPage(btn.dataset.page));
});

document.getElementById("readabilityBtn").addEventListener("click", () => {
  document.body.classList.toggle("readability");
  localStorage.setItem("seven.readability", document.body.classList.contains("readability") ? "1" : "0");
});

document.getElementById("copyPromptBtn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(promptSeven);
    alert("Prompt Seven copié.");
  } catch {
    const area = document.createElement("textarea");
    area.value = promptSeven;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    alert("Prompt Seven copié.");
  }
});

document.getElementById("openChatBtn").addEventListener("click", () => {
  window.open("https://chatgpt.com/", "seven_heaven_chatgpt");
});

document.getElementById("openGithubBtn").addEventListener("click", () => {
  window.open("https://github.com/BlueAzur-Hub/erith-ia-memory/tree/main/assets/SEVEN_PORTABLE_TERMINAL", "seven_github");
});

function renderTrace() {
  const grid = document.getElementById("traceGrid");
  const data = [
    ["OS", navigator.platform || "Non disponible"],
    ["Navigateur", navigator.userAgent.split(" ").slice(0, 4).join(" ")],
    ["Écran", `${window.innerWidth} × ${window.innerHeight}`],
    ["Fuseau", Intl.DateTimeFormat().resolvedOptions().timeZone || "Non disponible"],
    ["Langue", navigator.language || "Non disponible"],
    ["SAFE TRACE", "Aucun RustDesk ID / aucun mot de passe"]
  ];

  grid.innerHTML = data.map(([label, value]) => `
    <article class="trace-card">
      <small>${label}</small>
      <strong>${value}</strong>
    </article>
  `).join("");
}

document.addEventListener("keydown", (event) => {
  const keys = ["home", "llm", "notion", "github", "production", "system"];
  const index = Number(event.key) - 1;
  if (keys[index]) showPage(keys[index]);
});

if (localStorage.getItem("seven.readability") === "1") {
  document.body.classList.add("readability");
}

showPage(localStorage.getItem("seven.page") || "home");
renderTrace();
window.addEventListener("resize", renderTrace);
