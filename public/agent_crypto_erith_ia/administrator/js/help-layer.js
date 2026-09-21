(() => {
  "use strict";

  const BUILD = "40.6.334";
  const button = document.getElementById("atlasHelpToggle");
  const layer = document.getElementById("atlasHelpLayer");
  const live = document.getElementById("atlasHelpLive");
  if (!button || !layer) return;

  const HELP = [
    {
      key: "menu",
      selector: ".atlas-v2-interface-bar",
      kicker: "AIDE · NAVIGATION",
      title: "Menu de l’interface",
      purpose: "Accède aux grandes familles sans modifier les données : Livecheck, Marché, Graphique, Atlas, Oracle, Sources et, en Administration, les groupes Décision, Analyse, Système et Projets.",
      look: "Commence par Livecheck, puis Graphique ou Marché. Les vues Classique, Intermédiaire et Administration changent la profondeur de l’interface.",
      action: "Clique un raccourci pour rejoindre sa zone.",
      attention: ""
    },
    {
      key: "livecheck",
      selector: "#livecheck",
      kicker: "AIDE · DONNÉES",
      title: "LiveCheck",
      purpose: "Relance les sources autorisées et actualise l’état observable du marché.",
      look: "Regarde la décision, le nombre de sources prêtes et l’heure des données avant d’interpréter les graphiques.",
      action: "Relancer maintenant demande une nouvelle lecture ; Rafraîchir marché met à jour le marché sans inventer de données.",
      attention: "Un état différé ou partiel signifie que l’interface conserve la dernière donnée vérifiée disponible."
    },
    {
      key: "graph",
      selector: "#analyste .chart-panel",
      kicker: "AIDE · GRAPHIQUE",
      title: "Graphique Crypto",
      purpose: "Compare les trajectoires réelles des actifs sélectionnés et, lorsqu’Oracle est affiché, sépare l’historique du scénario.",
      look: "Période, Prix ou Base 100, échelle, courbes, volume et repère MAINTENANT.",
      action: "Choisis les actifs depuis Target Top 5, Market Flow ou Market Snapshot ; Solo reste une action distincte.",
      attention: "Après MAINTENANT, les trajectoires Oracle sont des scénarios interprétatifs, pas des prix historiques."
    },
    {
      key: "detail",
      selector: "#detailPanel",
      kicker: "AIDE · LECTURE",
      title: "Lecture Technique",
      purpose: "Concentre le contexte de l’actif sélectionné : prix, variation, source, période, intégrité et diagnostics.",
      look: "Commence par le bandeau compact, puis ouvre seulement les sous-sections utiles.",
      action: "Réduire conserve le graphique visible ; Ouvrir une sous-section affiche son détail.",
      attention: "Cette zone décrit et vérifie les données ; elle n’exécute aucun ordre."
    },
    {
      key: "ribbons",
      selector: "#market-workspace",
      kicker: "AIDE · SÉLECTION",
      title: "Target Top 5 & Market Flow",
      purpose: "Target Top 5 donne le panier principal ; Market Flow permet de parcourir davantage d’actifs du marché.",
      look: "Symbole, prix, variation et état de la sélection graphique.",
      action: "Clique un actif pour l’ajouter ou le retirer de la comparaison. Le bouton de cycle change la vue du ruban.",
      attention: ""
    },
    {
      key: "market",
      selector: "#marketSnapshotPanel",
      kicker: "AIDE · MARKET CORE",
      title: "Market Snapshot",
      purpose: "Table de lecture du marché : actifs, prix, variations, capitalisation, volumes et actions de comparaison.",
      look: "Source et fraîcheur des prix, filtres, univers 50/100/250/500/1000 et colonnes Essentiel/Complet.",
      action: "Une ligne ou ses actions permet de comparer, suivre ou ouvrir l’actif sans quitter le contexte marché.",
      attention: "LIVE et CONSERVÉ n’ont pas le même niveau de fraîcheur : lis toujours l’état de source."
    },
    {
      key: "math",
      selector: "#math",
      kicker: "AIDE · MATH CORE",
      title: "Atlas Math Core",
      purpose: "Mesure la série historique disponible : volatilité, drawdown, VaR, couverture et qualité de données.",
      look: "Fenêtre réelle, nombre de points, complétude et limites indiquées dans le panneau.",
      action: "Dessus, Latéral ou Réduire changent seulement la présentation du Math Core.",
      attention: "Ces mesures décrivent l’historique observé. Elles ne prédisent ni un prix futur ni un rendement."
    }
  ];

  let active = false;
  let currentElement = null;

  function allTargets() {
    const rows = [];
    for (const item of HELP) {
      const element = document.querySelector(item.selector);
      if (element) rows.push([item, element]);
    }
    return rows;
  }

  function setMarks(on) {
    for (const [, element] of allTargets()) {
      element.classList.toggle("agent-help-target", on);
      if (!on) element.classList.remove("agent-help-current");
    }
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[ch]));
  }

  function cardHtml(item) {
    return [
      '<span class="agent-help-kicker">' + escapeHtml(item.kicker) + '</span>',
      "<h3>" + escapeHtml(item.title) + "</h3>",
      "<p><b>À quoi ça sert ?</b> " + escapeHtml(item.purpose) + "</p>",
      "<p><b>Que regarder ?</b> " + escapeHtml(item.look) + "</p>",
      "<p><b>Action possible</b> " + escapeHtml(item.action) + "</p>",
      item.attention ? '<p class="agent-help-attention"><b>Attention</b> · ' + escapeHtml(item.attention) + "</p>" : "",
      '<p class="agent-help-hint">Mode Aide actif · survole une autre zone · Échap ou ? pour fermer.</p>'
    ].join("");
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function positionLayer(anchor, point) {
    layer.hidden = false;
    layer.style.visibility = "hidden";
    layer.style.left = "14px";
    layer.style.top = "14px";
    const box = layer.getBoundingClientRect();
    const vw = document.documentElement.clientWidth || innerWidth;
    const vh = document.documentElement.clientHeight || innerHeight;
    const margin = 14;

    let left;
    let top;
    if (point && Number.isFinite(point.x) && Number.isFinite(point.y)) {
      left = point.x + 18;
      top = point.y + 18;
    } else {
      const rect = anchor.getBoundingClientRect();
      left = rect.right + 14;
      top = rect.top;
      if (left + box.width > vw - margin) left = rect.left - box.width - 14;
      if (left < margin) left = rect.left;
    }
    left = clamp(left, margin, Math.max(margin, vw - box.width - margin));
    top = clamp(top, margin, Math.max(margin, vh - box.height - margin));
    layer.style.left = Math.round(left) + "px";
    layer.style.top = Math.round(top) + "px";
    layer.style.visibility = "visible";
  }

  function clearCurrent() {
    if (currentElement) currentElement.classList.remove("agent-help-current");
    currentElement = null;
  }

  function show(item, element, point) {
    if (!active || !item || !element) return;
    clearCurrent();
    currentElement = element;
    currentElement.classList.add("agent-help-current");
    layer.innerHTML = cardHtml(item);
    layer.setAttribute("aria-hidden", "false");
    if (live) live.textContent = item.title + ". " + item.purpose;
    positionLayer(element, point);
  }

  function hide() {
    clearCurrent();
    layer.hidden = true;
    layer.setAttribute("aria-hidden", "true");
  }

  function overview() {
    if (!active) return;
    const item = {
      kicker: "AIDE · AGENT-CRYPTO",
      title: "Comprendre sans bloquer l’interface",
      purpose: "Survole les zones signalées pour obtenir une explication courte sans changer leur fonctionnement.",
      look: "Menu, LiveCheck, Graphique, Lecture Technique, Target Top 5 / Market Flow, Market Snapshot et Math Core.",
      action: "Utilise l’interface normalement. L’aide ne lance aucune source, aucun calcul et aucune action métier.",
      attention: ""
    };
    show(item, button);
  }

  function setActive(next) {
    active = Boolean(next);
    button.setAttribute("aria-pressed", active ? "true" : "false");
    button.setAttribute("aria-label", active ? "Désactiver l’aide contextuelle de l’interface" : "Activer l’aide contextuelle de l’interface");
    document.body.classList.toggle("agent-help-mode", active);
    setMarks(active);
    if (active) overview();
    else hide();
  }

  function resolve(node) {
    if (!(node instanceof Element)) return null;
    for (const item of HELP) {
      const element = node.closest(item.selector);
      if (element) return { item, element };
    }
    return null;
  }

  button.addEventListener("click", () => setActive(!active));

  document.addEventListener("pointerover", event => {
    if (!active) return;
    const hit = resolve(event.target);
    if (!hit) return;
    if (event.relatedTarget instanceof Node && hit.element.contains(event.relatedTarget)) return;
    show(hit.item, hit.element, { x: event.clientX, y: event.clientY });
  }, true);

  document.addEventListener("pointerout", event => {
    if (!active || !currentElement) return;
    if (!(event.target instanceof Node) || !currentElement.contains(event.target)) return;
    if (event.relatedTarget instanceof Node && currentElement.contains(event.relatedTarget)) return;
    hide();
  }, true);

  document.addEventListener("focusin", event => {
    if (!active) return;
    const hit = resolve(event.target);
    if (hit) show(hit.item, hit.element);
  }, true);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && active) setActive(false);
  });

  window.addEventListener("resize", () => {
    if (active && !layer.hidden && currentElement) positionLayer(currentElement);
  }, { passive: true });

  globalThis.AgentCryptoHelpLayer = Object.freeze({
    build: BUILD,
    active: () => active,
    open: () => setActive(true),
    close: () => setActive(false),
    topics: HELP.map(item => item.key),
    recurring_timer: false,
    observer: false,
    storage: false,
    network: false,
    aether_modified: false
  });
})();
