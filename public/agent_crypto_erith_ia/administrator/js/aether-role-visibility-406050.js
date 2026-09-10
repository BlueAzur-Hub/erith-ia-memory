(() => {
  "use strict";

  const PROFILE = Object.freeze({
    id: "yohan-operator-admin-406052",
    defaultRole: "operator",
    administratorUnlock: "local",
    hideProjects: true,
    publicSecretEmbedded: false,
  });

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function textIncludes(node, value) {
    return String(node?.textContent || "").toLowerCase().includes(String(value).toLowerCase());
  }

  function hideProjectsSurface() {
    qsa("button, a, [role='button'], article, span").forEach((node) => {
      const text = String(node.textContent || "").trim();
      if (!text) return;
      if (/^projets?\b/i.test(text) || /portfolio/i.test(text)) {
        const target = node.closest("button, a, article, [role='button']") || node;
        target.hidden = true;
        target.setAttribute("aria-hidden", "true");
        target.dataset.yohanHidden406052 = "1";
      }
    });
  }

  function adaptAccessPortal() {
    const dialog = qs("#atlasAccessDialog") || qs("dialog");
    if (!dialog) return;

    const profiles = qs(".atlas-access-profiles", dialog);
    if (profiles) {
      const cards = qsa("article", profiles);
      const owner = cards.find((card) => textIncludes(card, "Propriétaire") || textIncludes(card, "Christophe"));
      const operator = cards.find((card) => textIncludes(card, "Opérateur") || card.id === "atlasAccessOperatorProfile404140");

      if (owner) {
        const label = qs("span", owner);
        const name = qs("b", owner);
        const small = qs("small", owner);
        if (label) label.textContent = "Administration · accès déverrouillable";
        if (name) name.textContent = "Administration";
        if (small) small.textContent = "Accès local protégé · capacités administrateur après validation";
        owner.classList.remove("is-active");
      }

      if (operator) {
        const label = qs("span", operator);
        const name = qs("b", operator);
        const small = qs("small", operator);
        if (label) label.textContent = "Opérateur principal";
        if (name) name.textContent = "Yohan";
        if (small) small.textContent = "Cockpit opérateur · Atlas · Oracle · Sources · Analyse · Décision · Système · Command";
        operator.classList.add("is-active");
        operator.setAttribute("aria-label", "Ouvrir le poste Opérateur Yohan");
      }
    }

    const intro = qs("#atlasAccessIntro", dialog);
    if (intro) intro.textContent = "Poste Yohan : Opérateur par défaut. L’administration se déverrouille localement sur ce navigateur.";

    const submit = qs("#atlasAccessSubmit", dialog);
    if (submit && /Christophe/i.test(submit.textContent || "")) submit.textContent = "Créer l’accès administrateur local";

    const footer = qs(".atlas-access-footer, footer", dialog);
    if (footer) {
      qsa("span", footer).forEach((item) => {
        if (textIncludes(item, "PROJETS") || textIncludes(item, "PORTFOLIO")) {
          item.hidden = true;
          item.setAttribute("aria-hidden", "true");
          item.dataset.yohanHidden406052 = "1";
        }
      });
    }
  }

  function ensureOperatorDefault() {
    let owner = false;
    try { owner = sessionStorage.getItem("agent_crypto_local_access_session_v1") === "owner"; } catch {}
    if (owner) return;

    try {
      if (localStorage.getItem("agent_crypto_erith_ia_v2_interface_mode") !== "intermediate") {
        localStorage.setItem("agent_crypto_erith_ia_v2_interface_mode", "intermediate");
      }
    } catch {}

    document.documentElement.dataset.yohanProfile406052 = "operator";
    if (document.body) document.body.dataset.yohanProfile406052 = "operator";
  }

  function apply() {
    ensureOperatorDefault();
    adaptAccessPortal();
    hideProjectsSurface();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply, { once: true });
  } else {
    apply();
  }

  document.addEventListener("click", () => queueMicrotask(apply), true);
  document.addEventListener("atlas:v2mode", () => queueMicrotask(apply));
  document.addEventListener("erith:admin-access-open", () => queueMicrotask(apply));

  globalThis.ErithYohanOperatorAdmin406052 = Object.freeze({
    profile: PROFILE,
    apply,
    hideProjectsSurface,
    adaptAccessPortal,
  });
})();
