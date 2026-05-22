const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const CHATGPT_URL = "https://chatgpt.com/";

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("Copié dans le presse-papiers.");
    return true;
  } catch (error) {
    const area = $("#sevenPrompt");
    area.focus();
    area.select();
    showToast("Copie bloquée : texte sélectionné manuellement.");
    return false;
  }
}

function openPage(name) {
  $$(".page").forEach((page) => page.classList.remove("active"));
  $$(".nav-btn").forEach((button) => button.classList.remove("active"));
  $(`#page-${name}`)?.classList.add("active");
  $(`.nav-btn[data-page='${name}']`)?.classList.add("active");
  localStorage.setItem("seven.currentPage", name);
}

function applySavedState() {
  const mode = localStorage.getItem("seven.mode") || "";
  document.body.classList.toggle("readable", mode === "readable");
  document.body.classList.toggle("transparent", mode === "transparent");
  openPage(localStorage.getItem("seven.currentPage") || "home");
}

function setMode(mode) {
  document.body.classList.remove("readable", "transparent");
  if (mode) document.body.classList.add(mode);
  localStorage.setItem("seven.mode", mode);
}

function renderSystem() {
  const grid = $("#systemGrid");
  const data = [
    ["OS", navigator.platform || "Non disponible"],
    ["Navigateur", navigator.userAgent.split(") ").pop() || "Navigateur"],
    ["Écran", `${window.innerWidth}×${window.innerHeight}`],
    ["Fuseau", Intl.DateTimeFormat().resolvedOptions().timeZone || "Local"],
    ["Langue", navigator.language || "fr-FR"],
    ["SAFE TRACE", "Aucun RustDesk ID · Aucun mot de passe"]
  ];
  grid.innerHTML = data.map(([label, value]) => `
    <article class="card">
      <h3>${label}</h3>
      <p>${value}</p>
    </article>
  `).join("");
}

function bindEvents() {
  $$(".nav-btn").forEach((button) => {
    button.addEventListener("click", () => openPage(button.dataset.page));
  });

  $("#toggleReadableBtn").addEventListener("click", () => setMode(document.body.classList.contains("readable") ? "" : "readable"));
  $("#toggleTransparentBtn").addEventListener("click", () => setMode(document.body.classList.contains("transparent") ? "" : "transparent"));
  $("#copyPromptBtn").addEventListener("click", () => copyText($("#sevenPrompt").value));
  $("#openChatBtn").addEventListener("click", () => window.open(CHATGPT_URL, "seven_heaven_chatgpt"));
  $("#startSevenBtn").addEventListener("click", async () => {
    await copyText($("#sevenPrompt").value);
    window.open(CHATGPT_URL, "seven_heaven_chatgpt");
  });

  document.addEventListener("keydown", (event) => {
    const map = { "1": "home", "2": "llm", "3": "notion", "4": "github", "5": "production", "6": "system" };
    if (map[event.key]) openPage(map[event.key]);
  });
}

bindEvents();
applySavedState();
renderSystem();
window.addEventListener("resize", renderSystem);
