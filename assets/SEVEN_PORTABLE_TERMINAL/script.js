/* Seven Portable Terminal — V5.2 Rollback Original + Hero Focus Fix
   Ce script est volontairement minimal.
   Il ne remplace pas le gros script inline d'origine.
   Il corrige seulement le bug Hero Focus sur la base originale.
*/

(function () {
  function clamp(value, min, max) {
    value = Number(value);
    if (Number.isNaN(value)) return min;
    return Math.max(min, Math.min(max, value));
  }

  function status(message) {
    if (typeof window.setStatus === "function") {
      window.setStatus(message);
      return;
    }
    const el = document.getElementById("status") || document.getElementById("statusLine");
    if (el) el.textContent = message;
  }

  function setValues(x, y, zoom) {
    x = clamp(x, 0, 100);
    y = clamp(y, 0, 100);
    zoom = clamp(zoom, 100, 180);

    const xInput = document.getElementById("heroFocusX");
    const yInput = document.getElementById("heroFocusY");
    const zInput = document.getElementById("heroFocusZoom");
    const xOut = document.getElementById("heroFocusXValue");
    const yOut = document.getElementById("heroFocusYValue");
    const zOut = document.getElementById("heroFocusZoomValue");

    if (xInput) xInput.value = x;
    if (yInput) yInput.value = y;
    if (zInput) zInput.value = zoom;
    if (xOut) xOut.textContent = x + "%";
    if (yOut) yOut.textContent = y + "%";
    if (zOut) zOut.textContent = zoom + "%";

    const root = document.documentElement;
    root.style.setProperty("--hero-x", x + "%");
    root.style.setProperty("--hero-y", y + "%");
    root.style.setProperty("--hero-zoom", zoom + "%");
    root.style.setProperty("--hero-size", zoom <= 100 ? "cover" : zoom + "% auto");

    const hero = document.querySelector(".hero");
    if (hero) {
      hero.style.backgroundPosition = x + "% " + y + "%";
      hero.style.backgroundSize = zoom <= 100 ? "cover" : zoom + "% auto";
      hero.style.backgroundRepeat = "no-repeat";
    }

    try {
      localStorage.setItem("seven-hero-focus", JSON.stringify({ x, y, zoom }));
    } catch (e) {}

    status("Hero Focus ajusté : X " + x + "% / Y " + y + "% / Zoom " + zoom + "%");
  }

  window.applyHeroFocus = function (x, y, zoom, save) {
    setValues(x, y, zoom);
  };

  window.setHeroFocusFromInputs = function () {
    const x = document.getElementById("heroFocusX")?.value || 50;
    const y = document.getElementById("heroFocusY")?.value || 34;
    const zoom = document.getElementById("heroFocusZoom")?.value || 100;
    setValues(x, y, zoom);
  };

  window.nudgeHeroFocus = function (dx, dy) {
    const x = Number(document.getElementById("heroFocusX")?.value || 50) + dx;
    const y = Number(document.getElementById("heroFocusY")?.value || 34) + dy;
    const zoom = Number(document.getElementById("heroFocusZoom")?.value || 100);
    setValues(x, y, zoom);
  };

  window.resetHeroFocus = function () {
    setValues(50, 34, 100);
    status("Hero Focus réinitialisé.");
  };

  window.toggleHeroFocusPanel = function () {
    document.body.classList.toggle("show-hero-focus");
    const open = document.body.classList.contains("show-hero-focus");
    const btn = document.getElementById("heroFocusBtn");
    if (btn) btn.classList.toggle("active", open);
    try {
      localStorage.setItem("seven-hero-focus-panel", open ? "1" : "0");
    } catch (e) {}
    status(open ? "Hero Focus ouvert." : "Hero Focus fermé.");
  };

  function boot() {
    let saved = { x: 50, y: 34, zoom: 100 };
    try {
      const raw = localStorage.getItem("seven-hero-focus");
      if (raw) saved = { ...saved, ...JSON.parse(raw) };
    } catch (e) {}

    setValues(saved.x, saved.y, saved.zoom);

    let open = "0";
    try {
      open = localStorage.getItem("seven-hero-focus-panel") || "0";
    } catch (e) {}

    document.body.classList.toggle("show-hero-focus", open === "1");
    const btn = document.getElementById("heroFocusBtn");
    if (btn) btn.classList.toggle("active", open === "1");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.addEventListener("load", boot);
})();
