const buttons = document.querySelectorAll("[data-page]");
const pages = document.querySelectorAll(".page");

function showPage(id) {
  pages.forEach(page => page.classList.toggle("active", page.id === id));
  buttons.forEach(button => button.classList.toggle("active", button.dataset.page === id));
  localStorage.setItem("seven.page", id);
}

buttons.forEach(button => {
  button.addEventListener("click", () => showPage(button.dataset.page));
});

document.getElementById("readability").addEventListener("click", () => {
  document.body.classList.toggle("readable");
  localStorage.setItem("seven.readable", document.body.classList.contains("readable") ? "1" : "0");
});

function trace() {
  const el = document.getElementById("trace");
  if (!el) return;
  el.textContent = `Viewport : ${window.innerWidth} × ${window.innerHeight} — ${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
}

if (localStorage.getItem("seven.readable") === "1") {
  document.body.classList.add("readable");
}

showPage(localStorage.getItem("seven.page") || "home");
trace();
window.addEventListener("resize", trace);
