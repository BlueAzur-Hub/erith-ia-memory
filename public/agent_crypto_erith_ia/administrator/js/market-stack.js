(() => {
  "use strict";

  const BUILD = "40.4.167";
  const REVISION = "R2";
  const CONTRACT = "CYCLIC_MULTI_MARKET_ROUTER_404167R2";
  const ORDER = Object.freeze([
    Object.freeze({ id: "crypto", label: "CRYPTO", title: "Crypto", inert: false, native: "crypto" }),
    Object.freeze({ id: "metals", label: "MÉTAUX", title: "Métaux précieux et industriels", inert: false, native: "metals" }),
    Object.freeze({ id: "indices", label: "INDICES", title: "Indices / Bourse", inert: true, description: "Domaine préparé uniquement. Aucun symbole, fournisseur, historique ou graphique n’est activé avant audit Source Truth." }),
    Object.freeze({ id: "energy", label: "ÉNERGIE", title: "Énergie & matières premières", inert: true, description: "Pétrole, gaz et matières premières restent inertes jusqu’à qualification des unités, marchés, licences, historiques et fraîcheur." }),
    Object.freeze({ id: "cross-market", label: "CROSS", title: "Cross-Market Observatory", inert: true, description: "Couche transversale finale. Base 100 et mesures comparables seulement au-dessus de domaines déjà validés, sans moyenne inter-source ni donnée synthétique." })
  ]);

  let current = "crypto";
  let nativeBypass = false;

  const byId = id => document.getElementById(id);
  const specFor = id => ORDER.find(item => item.id === id) || ORDER[0];
  const indexOf = id => Math.max(0, ORDER.findIndex(item => item.id === id));
  const nextOf = id => ORDER[(indexOf(id) + 1) % ORDER.length];

  function nativeDomain() {
    const button = byId("atlasMarketDomainSwitch");
    return String(button?.dataset?.domain || "crypto") === "metals" ? "metals" : "crypto";
  }

  function ensureHosts() {
    const chartShell = document.querySelector("#analyste .chart-shell");
    const head = document.querySelector("#analyste .chart-v2-recovery-line");
    const metalsDetail = byId("atlasMetalsDetailPanel");
    if (!chartShell || !head || !metalsDetail) return false;

    if (!byId("atlasCyclicMarketInertStage404167R2")) {
      const stage = document.createElement("section");
      stage.id = "atlasCyclicMarketInertStage404167R2";
      stage.className = "atlas-cyclic-market-inert-stage-404167r2";
      stage.hidden = true;
      stage.innerHTML = `
        <div class="atlas-cyclic-market-inert-grid-404167r2" aria-live="polite">
          <div class="atlas-cyclic-market-inert-hero-404167r2">
            <small>ERITH.IA · MARKETS OBSERVATORY</small>
            <h3 data-cyclic-market-title>DOMAINE FUTUR</h3>
            <p data-cyclic-market-description>Aucune donnée active.</p>
            <div class="atlas-cyclic-market-inert-line-404167r2" aria-hidden="true"></div>
          </div>
          <div class="atlas-cyclic-market-inert-gates-404167r2">
            <span><small>SOURCE TRUTH</small><b>NON QUALIFIÉE</b></span>
            <span><small>HISTORIQUE</small><b>NON CONNECTÉ</b></span>
            <span><small>UNITÉS</small><b>À VALIDER</b></span>
            <span><small>MOTEUR</small><b>INERT</b></span>
          </div>
          <footer><b>AUCUN PRIX INVENTÉ</b><span>Le cockpit existe comme emplacement de routage uniquement.</span></footer>
        </div>`;
      chartShell.appendChild(stage);
    }

    if (!byId("atlasCyclicMarketInertToolbar404167R2")) {
      const toolbar = document.createElement("div");
      toolbar.id = "atlasCyclicMarketInertToolbar404167R2";
      toolbar.className = "chart-head-actions atlas-cyclic-market-inert-toolbar-404167r2";
      toolbar.hidden = true;
      toolbar.innerHTML = '<span>DOMAINE FUTUR</span><b data-cyclic-market-toolbar-state>INERT · SOURCE TRUTH REQUISE</b>';
      head.appendChild(toolbar);
    }

    if (!byId("atlasCyclicMarketInertDetail404167R2")) {
      const detail = document.createElement("article");
      detail.id = "atlasCyclicMarketInertDetail404167R2";
      detail.className = "panel glass atlas-cyclic-market-inert-detail-404167r2";
      detail.hidden = true;
      detail.innerHTML = `
        <header><span class="eyebrow">DÉTAIL ACTIF</span><strong data-cyclic-market-detail-title>Marché futur</strong><small>Observation seulement · aucune donnée inventée</small></header>
        <div class="atlas-cyclic-market-inert-detail-state-404167r2"><span><small>État</small><b>PLANNED · INERT</b></span><span><small>Collecte</small><b>AUCUNE</b></span></div>
        <section><b>Conditions d’activation</b><p>Source, unité, historique, fraîcheur, fallback et Source Truth doivent être validés avant activation du domaine.</p></section>
        <section><b>Routeur</b><p data-cyclic-market-detail-next>Cliquer sur MARCHÉ pour continuer la boucle.</p></section>`;
      metalsDetail.insertAdjacentElement("afterend", detail);
    }
    return true;
  }

  function setInertContent(domain) {
    const spec = specFor(domain);
    const stage = byId("atlasCyclicMarketInertStage404167R2");
    const toolbar = byId("atlasCyclicMarketInertToolbar404167R2");
    const detail = byId("atlasCyclicMarketInertDetail404167R2");
    if (!stage || !toolbar || !detail) return;

    stage.querySelector("[data-cyclic-market-title]").textContent = spec.title;
    stage.querySelector("[data-cyclic-market-description]").textContent = spec.description || "Domaine non activé.";
    toolbar.querySelector("[data-cyclic-market-toolbar-state]").textContent = `${spec.label} · INERT · SOURCE TRUTH REQUISE`;
    detail.querySelector("[data-cyclic-market-detail-title]").textContent = spec.title;
    detail.querySelector("[data-cyclic-market-detail-next]").textContent = `Suivant : ${nextOf(domain).title}. Cliquer sur MARCHÉ pour continuer.`;
  }

  function setInertVisible(visible) {
    const stage = byId("atlasCyclicMarketInertStage404167R2");
    const toolbar = byId("atlasCyclicMarketInertToolbar404167R2");
    const detail = byId("atlasCyclicMarketInertDetail404167R2");
    if (stage) stage.hidden = !visible;
    if (toolbar) toolbar.hidden = !visible;
    if (detail) detail.hidden = !visible;
  }

  function updateButton(domain) {
    const button = byId("atlasMarketDomainSwitch");
    const value = byId("atlasMarketDomainSwitchValue");
    if (!button || !value) return;
    const spec = specFor(domain);
    const next = nextOf(domain);
    value.textContent = spec.label;
    button.dataset.cyclicMarketDomain = spec.id;
    button.dataset.cyclicMarketNext = next.id;
    button.setAttribute("aria-label", `Marché ${spec.title}. Cliquer pour afficher ${next.title}.`);
    button.title = `Suivant : ${next.title}`;
  }

  function ensureNativeDomain(target) {
    const button = byId("atlasMarketDomainSwitch");
    if (!button || (target !== "crypto" && target !== "metals")) return;
    if (nativeDomain() === target) return;
    nativeBypass = true;
    try { button.click(); } catch (_) {}
    nativeBypass = false;
  }

  function applyDomain(domain, options = {}) {
    const spec = specFor(domain);
    current = spec.id;
    document.documentElement.dataset.cyclicMarketDomain = spec.id;
    document.documentElement.dataset.cyclicMarketMode = spec.inert ? "inert" : "active";
    document.documentElement.dataset.cyclicMarketRevision = REVISION;

    if (!spec.inert) {
      if (!options.nativeAlreadyHandled) ensureNativeDomain(spec.native);
      setInertVisible(false);
    } else {
      setInertContent(spec.id);
      setInertVisible(true);
    }
    updateButton(spec.id);
  }

  function onMarketSwitchClick(event) {
    if (nativeBypass) return;
    const next = nextOf(current);

    if (current === "crypto" && next.id === "metals") {
      current = "metals";
      document.documentElement.dataset.cyclicMarketDomain = "metals";
      document.documentElement.dataset.cyclicMarketMode = "active";
      setInertVisible(false);
      requestAnimationFrame(() => updateButton("metals"));
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    applyDomain(next.id);
  }

  function init() {
    document.getElementById("atlasTrueMarketStackMetals404167R1")?.remove();
    document.getElementById("atlasMarketCascade404167")?.remove();
    if (!ensureHosts()) {
      document.documentElement.dataset.cyclicMarketRouter404167R2 = "missing-owner";
      return;
    }

    current = nativeDomain();
    const button = byId("atlasMarketDomainSwitch");
    if (!button) return;
    button.dataset.cyclicMarketRouter404167R2 = "bound";
    button.addEventListener("click", onMarketSwitchClick, true);
    applyDomain(current, { nativeAlreadyHandled: true });
    document.documentElement.dataset.cyclicMarketRouter404167R2 = "ready";

    globalThis.ErithCyclicMultiMarketRouter404167R2 = Object.freeze({
      build: BUILD,
      revision: REVISION,
      contract: CONTRACT,
      order: ORDER.map(item => item.id),
      active_domains: ["crypto", "metals"],
      inert_domains: ["indices", "energy", "cross-market"],
      current: () => current,
      next: () => applyDomain(nextOf(current).id),
      go: domain => applyDomain(specFor(domain).id),
      native_crypto_metals_reused: true,
      single_cockpit_surface: true,
      wraparound: true,
      new_chart_engine: false,
      new_fetch_owner: false,
      new_timer: false,
      new_observer: false,
      new_storage_owner: false
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
