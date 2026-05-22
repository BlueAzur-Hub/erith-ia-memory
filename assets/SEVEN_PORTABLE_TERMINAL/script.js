const navButtons = document.querySelectorAll("[data-page]");
const pages = document.querySelectorAll(".page");
const drawer = document.getElementById("drawer");

const promptSeven = `Chat, active Aerith-7 Seven Heaven.
Mode texte uniquement.
Aucune génération image sans demande explicite.
Chargement minimal, choix précis.`;

function showPage(id) {
  pages.forEach(page => page.classList.toggle("active", page.id === id));
  navButtons.forEach(button => button.classList.toggle("active", button.dataset.page === id));
  localStorage.setItem("seven.page", id);
}

navButtons.forEach(button => {
  button.addEventListener("click", () => showPage(button.dataset.page));
});

document.getElementById("copyPrompt").addEventListener("click", async () => {
  drawer.value = promptSeven;
  drawer.classList.add("open");
  drawer.select();

  try {
    await navigator.clipboard.writeText(promptSeven);
  } catch {
    document.execCommand("copy");
  }
});

document.getElementById("openChat").addEventListener("click", () => {
  window.open("https://chatgpt.com/", "seven_chatgpt");
});

document.getElementById("readability").addEventListener("click", () => {
  document.body.classList.toggle("readable");
  localStorage.setItem("seven.readable", document.body.classList.contains("readable") ? "1" : "0");
});

function updateTrace() {
  const trace = document.getElementById("trace");
  if (trace) trace.textContent = `${window.innerWidth} × ${window.innerHeight} — ${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
}

if (localStorage.getItem("seven.readable") === "1") {
  document.body.classList.add("readable");
}

showPage(localStorage.getItem("seven.page") || "home");
updateTrace();
window.addEventListener("resize", updateTrace);
document.addEventListener("keydown", event => {
  if (event.key === "Escape") drawer.classList.remove("open");
});
