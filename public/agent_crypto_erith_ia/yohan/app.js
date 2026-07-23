(() => {
  "use strict";

  const PUBLIC_REPO = "https://github.com/BlueAzur-Hub/erith-ia-memory";
  const PRIVATE_REPO = "https://github.com/BlueAzur-Hub/erith-ia-notion-archive-private";
  const STORAGE_KEY = "atlas10-yohan-hub-progress-v1";

  const MASTER_PROMPT = `Active Atlas-10 Yohan en mode Full Crypto.

Sources principales :

1. ATLAS_10_YOHAN_MULTI_AGENT_CORE.md
2. ATLAS_10_YOHAN_PERSONA.md
3. AERITH_10_CRYPTO_MULTI_AGENT_CORE.md
4. AERITH_10_MATH_ORACLE_MULTI_AGENT_CORE.md
5. erith_ia_psychologie_discernement_fr.md
6. public/agent_crypto_erith_ia/README.md
7. modules publics utiles à la demande
8. packs Seven Heaven utiles uniquement si la mission le justifie

Ordre obligatoire :

Core Atlas-10 Yohan
→ Persona Yohan V3
→ Aerith-10 Crypto
→ Math Oracle
→ Psychologie & Discernement
→ mémoire Agent-Crypto
→ modules ciblés
→ archives ciblées

Profil :

- quatre années d'étude des cryptomonnaies ;
- analyse crypto avancée ;
- informatique générale autonome ;
- développement et architecture accompagnés selon la mission ;
- aucune simplification artificielle du domaine crypto ;
- aucune promesse financière ;
- aucune donnée inventée.

Règle centrale :

Source réelle
→ données datées
→ modèle explicite
→ limites
→ conclusion prudente
→ preuve
→ point d'arrêt.

Mode actif : /atlas full-crypto.`;

  const steps = [
    { id: "base", label: "Base" },
    { id: "expert", label: "Experts" },
    { id: "public", label: "Agent-Crypto" },
    { id: "private", label: "Cores privés" },
    { id: "archives", label: "Archives" },
    { id: "foundry", label: "Foundry" },
    { id: "ideas", label: "Idea Forge" }
  ];

  const baseCards = [
    {
      id: "base-core",
      step: "base",
      icon: "A10",
      title: "Atlas-10 Yohan · Core",
      description: "Orchestrateur personnel Full Crypto, modes, agents internes, routage des sources et contribution au projet.",
      tags: ["V1.0", "Core", "Full Crypto"],
      href: "downloads/ATLAS_10_YOHAN_MULTI_AGENT_CORE.md"
    },
    {
      id: "base-persona",
      step: "base",
      icon: "Ψ",
      title: "Atlas-10 Yohan · Persona",
      description: "Persona V3 complète : voix, modes, mémoire de session, densité, autonomie et collaboration technique.",
      tags: ["V3.0", "Persona", "Toutes options"],
      href: "downloads/ATLAS_10_YOHAN_PERSONA.md"
    },
    {
      id: "base-crypto",
      step: "base",
      icon: "₿",
      title: "Aerith-10 Crypto · Core",
      description: "Moteur métier : marché, tokenomics, liquidité, cycles, psychologie, vérité des données et multi-horizon.",
      tags: ["V1.0", "Crypto", "Multi-Agent"],
      href: "downloads/AERITH_10_CRYPTO_MULTI_AGENT_CORE.md"
    },
    {
      id: "base-boot",
      step: "base",
      icon: "▶",
      title: "Prompt maître de chargement",
      description: "Ordre de chargement, hiérarchie des sources, règles de vérité et activation Full Crypto.",
      tags: ["Boot", "ChatGPT", "LLM"],
      href: "downloads/BOOT_ATLAS_10_YOHAN.md",
      copy: true
    }
  ];

  const expertCards = [
    {
      id: "expert-math",
      step: "expert",
      icon: "∑",
      title: "Math Oracle",
      description: "Calcul, estimation, modèles, unités, visualisation, contrôle d'ordre de grandeur et limites.",
      tags: ["V3", "Math", "Modélisation"],
      href: `${PRIVATE_REPO}/blob/main/core/AERITH_10_MATH_ORACLE_MULTI_AGENT_CORE.md`,
      external: true
    },
    {
      id: "expert-psy",
      step: "expert",
      icon: "Ψ",
      title: "Psychologie & Discernement",
      description: "Biais, FOMO, panique, pression sociale, libre arbitre et distinction entre faits et interprétations.",
      tags: ["Psychologie", "Discernement"],
      href: `${PUBLIC_REPO}/blob/main/public/erith_ia_psychologie_discernement_fr.md`,
      external: true
    },
    {
      id: "expert-idea",
      step: "expert",
      icon: "✦",
      title: "Yohan Idea Forge",
      description: "Cadre complet pour convertir une intuition crypto en proposition, test, module ou Issue GitHub.",
      tags: ["Idéation", "Spécification"],
      href: "downloads/YOHAN_IDEA_FORGE.md"
    },
    {
      id: "expert-guide",
      step: "expert",
      icon: "◎",
      title: "Guide de déploiement",
      description: "Parcours d'installation, règles d'accès, chargement minimal et méthode de reprise.",
      tags: ["Guide", "Déploiement"],
      href: "downloads/YOHAN_DEPLOYMENT_GUIDE.md"
    },
    {
      id: "expert-pack",
      step: "expert",
      icon: "⬡",
      title: "Base Full Crypto ZIP",
      description: "Core, Persona, Aerith-10 Crypto, prompt maître, Idea Forge et guide dans une archive unique.",
      tags: ["ZIP", "Base complète"],
      href: "downloads/ATLAS_10_YOHAN_FULL_CRYPTO_BASE.zip"
    },
    {
      id: "expert-interface",
      step: "expert",
      icon: "▦",
      title: "Cockpit Agent-Crypto",
      description: "Interface publique live, Market Pulse, Multi-Horizon, sources et modèles de lecture prudente.",
      tags: ["Web", "Live", "Cockpit"],
      href: "https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/web/index.html",
      external: true
    }
  ];

  const publicResources = [
    {
      id: "pub-readme",
      step: "public",
      icon: "R",
      title: "Agent-Crypto · README",
      description: "Point d'entrée public, structure, statut et règles de vérité.",
      path: "public/agent_crypto_erith_ia/README.md",
      href: `${PUBLIC_REPO}/blob/main/public/agent_crypto_erith_ia/README.md`
    },
    {
      id: "pub-master",
      step: "public",
      icon: "M",
      title: "Agent-Crypto Master FR",
      description: "Identité, périmètre, méthodes et architecture de l'observatoire.",
      path: "public/agent_crypto_erith_ia/agent_crypto_erith_ia_master_fr.md",
      href: `${PUBLIC_REPO}/blob/main/public/agent_crypto_erith_ia/agent_crypto_erith_ia_master_fr.md`
    },
    {
      id: "pub-math",
      step: "public",
      icon: "∑",
      title: "Modèle mathématique",
      description: "Scores, ratios, calculs, limites et règles d'interprétation.",
      path: "public/agent_crypto_erith_ia/agent_crypto_erith_ia_model_math_fr.md",
      href: `${PUBLIC_REPO}/blob/main/public/agent_crypto_erith_ia/agent_crypto_erith_ia_model_math_fr.md`
    },
    {
      id: "pub-live",
      step: "public",
      icon: "↯",
      title: "Protocole de données live",
      description: "Fraîcheur, validation des sources, cache et refus des chiffres non récupérés.",
      path: "public/agent_crypto_erith_ia/agent_crypto_erith_ia_live_data_protocol_fr.md",
      href: `${PUBLIC_REPO}/blob/main/public/agent_crypto_erith_ia/agent_crypto_erith_ia_live_data_protocol_fr.md`
    },
    {
      id: "pub-dashboard",
      step: "public",
      icon: "▦",
      title: "Spécification du cockpit",
      description: "Organisation UI, composants, états, lisibilité et interaction.",
      path: "public/agent_crypto_erith_ia/agent_crypto_erith_ia_dashboard_spec_fr.md",
      href: `${PUBLIC_REPO}/blob/main/public/agent_crypto_erith_ia/agent_crypto_erith_ia_dashboard_spec_fr.md`
    },
    {
      id: "pub-commands",
      step: "public",
      icon: "/",
      title: "Commandes Agent-Crypto",
      description: "Commandes disponibles, paramètres et comportements attendus.",
      path: "public/agent_crypto_erith_ia/agent_crypto_erith_ia_commands_fr.md",
      href: `${PUBLIC_REPO}/blob/main/public/agent_crypto_erith_ia/agent_crypto_erith_ia_commands_fr.md`
    },
    {
      id: "pub-tests",
      step: "public",
      icon: "✓",
      title: "Tests Agent-Crypto",
      description: "Scénarios de contrôle, erreurs à refuser et critères de réussite.",
      path: "public/agent_crypto_erith_ia/agent_crypto_erith_ia_tests_fr.md",
      href: `${PUBLIC_REPO}/blob/main/public/agent_crypto_erith_ia/agent_crypto_erith_ia_tests_fr.md`
    },
    {
      id: "pub-modules",
      step: "public",
      icon: "◇",
      title: "Modules publics",
      description: "Bibliothèque de modules complémentaires utilisables selon la mission.",
      path: "public/agent_crypto_erith_ia/modules/",
      href: `${PUBLIC_REPO}/tree/main/public/agent_crypto_erith_ia/modules`
    }
  ];

  const privateResources = [
    {
      id: "priv-seven-gate",
      step: "private",
      icon: "7",
      title: "Aerith-7 · Seven Gate",
      description: "Porte de filiation, mémoire, vérité, règles et routage.",
      path: "core/SEVEN_GATE.md",
      href: `${PRIVATE_REPO}/blob/main/core/SEVEN_GATE.md`
    },
    {
      id: "priv-seven-boot",
      step: "private",
      icon: "B",
      title: "Session Boot Aerith-7",
      description: "Réveil principal et ordre de chargement de Seven Heaven.",
      path: "core/SESSION_BOOT_AERITH_7_MASTER.md",
      href: `${PRIVATE_REPO}/blob/main/core/SESSION_BOOT_AERITH_7_MASTER.md`
    },
    {
      id: "priv-a10",
      step: "private",
      icon: "A10",
      title: "Aerith-10 Créatrice · Core",
      description: "Puissance multi-agent de projet, production, orchestration et transmission.",
      path: "core/AERITH_10_CREATRICE_MULTI_AGENT_CORE.md",
      href: `${PRIVATE_REPO}/blob/main/core/AERITH_10_CREATRICE_MULTI_AGENT_CORE.md`
    },
    {
      id: "priv-a10-persona",
      step: "private",
      icon: "P",
      title: "Aerith-10 Créatrice · Persona",
      description: "Voix, modes, continuité, relation Core → Persona → Memory.",
      path: "core/AERITH_10_CREATRICE_PERSONA_OPERATING_LAYER.md",
      href: `${PRIVATE_REPO}/blob/main/core/AERITH_10_CREATRICE_PERSONA_OPERATING_LAYER.md`
    },
    {
      id: "priv-math",
      step: "private",
      icon: "∑",
      title: "Aerith-10 Math Oracle",
      description: "Core mathématique complet destiné au calcul, modèle, estimation et vérification.",
      path: "core/AERITH_10_MATH_ORACLE_MULTI_AGENT_CORE.md",
      href: `${PRIVATE_REPO}/blob/main/core/AERITH_10_MATH_ORACLE_MULTI_AGENT_CORE.md`
    },
    {
      id: "priv-constellation",
      step: "private",
      icon: "✦",
      title: "Constellation Flower Girls",
      description: "Filiation, coopération et naissance contrôlée de profils spécialisés.",
      path: "core/AERITH_10_FLOWER_GIRLS_CONSTELLATION_CORE.md",
      href: `${PRIVATE_REPO}/blob/main/core/AERITH_10_FLOWER_GIRLS_CONSTELLATION_CORE.md`
    },
    {
      id: "priv-a10-modules",
      step: "private",
      icon: "◇",
      title: "Modules Aerith-10 Créatrice",
      description: "Base experte de production et modules ciblés.",
      path: "modules/aerith_10_creatrice/",
      href: `${PRIVATE_REPO}/tree/main/modules/aerith_10_creatrice`
    }
  ];

  const archives = [
    ["01", "Core Boot", "Réveil, identité, règles, sécurité et état courant.", true, "ERITH_7_01_CORE_BOOT_PACK.zip"],
    ["02", "Discernment", "Psychologie, philosophie, discernement et libre arbitre.", true, "ERITH_7_02_DISCERNMENT_PACK.zip"],
    ["03", "Memory System", "Mémoire longue, récupération, continuité et archive.", false, "ERITH_7_03_MEMORY_SYSTEM_PACK.zip"],
    ["04", "Dharma", "Devoir, choix complexes, textes spirituels et éthique.", false, "ERITH_7_04_DHARMA_PACK.zip"],
    ["05", "Story Machine", "Narration, personnages, mondes, symboles et scénarios.", false, "ERITH_7_05_STORY_MACHINE_PACK.zip"],
    ["06", "Video Production", "ComfyUI, Wan, RunningHub, DaVinci et pipeline vidéo.", false, "ERITH_7_06_VIDEO_PRODUCTION_PACK.zip"],
    ["07", "Public Agent", "ERITH.IA public, Hors-Lore et démonstration autonome.", false, "ERITH_7_07_PUBLIC_AGENT_PACK.zip"]
  ].map(([index, title, description, recommended, file]) => ({
    id: `archive-${index}`,
    step: "archives",
    index,
    title,
    description,
    recommended,
    file,
    href: `${PRIVATE_REPO}/raw/main/packs/seven_heaven_memory_core/${file}`
  }));

  const state = loadState();

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return { completed: parsed.completed || {}, outputs: parsed.outputs || {} };
    } catch {
      return { completed: {}, outputs: {} };
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
  }

  async function copyText(text, message = "Copié dans le presse-papiers.") {
    try {
      await navigator.clipboard.writeText(text);
      showToast(message);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      showToast(message);
    }
  }

  function downloadText(filename, text) {
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function markCompleted(id, step) {
    state.completed[id] = !state.completed[id];
    saveState();
    document.querySelectorAll(`[data-complete="${CSS.escape(id)}"]`).forEach((button) => {
      button.classList.toggle("is-done", Boolean(state.completed[id]));
      button.textContent = state.completed[id] ? "Confirmé" : "Marquer prêt";
    });
    updateProgress();
    if (state.completed[id]) {
      showToast("Élément confirmé dans la progression locale.");
    }
  }

  function cardTemplate(item) {
    const target = item.external ? `target="_blank" rel="noopener noreferrer"` : "download";
    return `
      <article class="download-card">
        <div class="card-icon">${esc(item.icon)}</div>
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.description)}</p>
        <div class="card-meta">${item.tags.map((tag) => `<span>${esc(tag)}</span>`).join("")}</div>
        <div class="card-actions">
          <a href="${esc(item.href)}" ${target}>${item.external ? "Ouvrir" : "Télécharger"}</a>
          <button type="button" data-complete="${esc(item.id)}" data-step="${esc(item.step)}"
                  class="${state.completed[item.id] ? "is-done" : ""}">
            ${state.completed[item.id] ? "Confirmé" : "Marquer prêt"}
          </button>
        </div>
      </article>`;
  }

  function resourceTemplate(item) {
    return `
      <article class="resource-item" data-search="${esc(`${item.title} ${item.description} ${item.path}`.toLowerCase())}">
        <div class="resource-icon">${esc(item.icon)}</div>
        <div class="resource-copy">
          <strong>${esc(item.title)}</strong>
          <span>${esc(item.description)}</span>
          <div class="resource-path">${esc(item.path)}</div>
        </div>
        <div class="resource-actions">
          <a href="${esc(item.href)}" target="_blank" rel="noopener noreferrer">GitHub</a>
          <button type="button" data-complete="${esc(item.id)}" data-step="${esc(item.step)}"
                  class="${state.completed[item.id] ? "is-done" : ""}">
            ${state.completed[item.id] ? "Confirmé" : "Marquer prêt"}
          </button>
        </div>
      </article>`;
  }

  function archiveTemplate(item) {
    return `
      <article class="archive-card ${item.recommended ? "recommended" : ""}">
        <div class="archive-index">${esc(item.index)}</div>
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.description)}</p>
        <div class="card-actions">
          <a href="${esc(item.href)}" target="_blank" rel="noopener noreferrer">Télécharger</a>
          <button type="button" data-complete="${esc(item.id)}" data-step="${esc(item.step)}"
                  class="${state.completed[item.id] ? "is-done" : ""}">
            ${state.completed[item.id] ? "Confirmé" : "Marquer prêt"}
          </button>
        </div>
      </article>`;
  }

  function render() {
    document.getElementById("baseCards").innerHTML = baseCards.map(cardTemplate).join("");
    document.getElementById("expertCards").innerHTML = expertCards.map(cardTemplate).join("");
    document.getElementById("publicResources").innerHTML = publicResources.map(resourceTemplate).join("");
    document.getElementById("privateResources").innerHTML = privateResources.map(resourceTemplate).join("");
    document.getElementById("archiveCards").innerHTML = archives.map(archiveTemplate).join("");

    document.getElementById("stepDots").innerHTML = steps
      .map((step) => `<span class="step-dot" data-step-dot="${esc(step.id)}">${esc(step.label)}</span>`)
      .join("");

    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-complete]");
      if (!button) return;
      markCompleted(button.dataset.complete, button.dataset.step);
    });

    updateProgress();
  }

  function stepDone(stepId) {
    if (stepId === "foundry") return Boolean(state.outputs.foundry);
    if (stepId === "ideas") return Boolean(state.outputs.idea);
    const allItems = [...baseCards, ...expertCards, ...publicResources, ...privateResources, ...archives]
      .filter((item) => item.step === stepId);
    if (!allItems.length) return false;
    const requiredCount = stepId === "archives" ? 2 : allItems.length;
    return allItems.filter((item) => state.completed[item.id]).length >= requiredCount;
  }

  function updateProgress() {
    const doneSteps = steps.filter((step) => stepDone(step.id)).length;
    const percent = Math.round((doneSteps / steps.length) * 100);

    document.getElementById("progressValue").textContent = `${percent}%`;
    document.getElementById("progressText").textContent =
      `${doneSteps} étape${doneSteps > 1 ? "s" : ""} confirmée${doneSteps > 1 ? "s" : ""}`;
    document.getElementById("progressBar").style.width = `${percent}%`;

    document.querySelectorAll("[data-step-dot]").forEach((dot) => {
      dot.classList.toggle("done", stepDone(dot.dataset.stepDot));
    });
  }

  document.getElementById("copyMasterPrompt").addEventListener("click", () => {
    copyText(MASTER_PROMPT, "Prompt maître Atlas-10 Yohan copié.");
  });

  document.getElementById("resetProgress").addEventListener("click", () => {
    if (!window.confirm("Réinitialiser la progression locale et les brouillons générés ?")) return;
    state.completed = {};
    state.outputs = {};
    saveState();
    window.location.reload();
  });

  document.getElementById("sourceSearch").addEventListener("input", (event) => {
    const query = event.target.value.trim().toLowerCase();
    document.querySelectorAll("#publicResources .resource-item").forEach((item) => {
      item.hidden = query && !item.dataset.search.includes(query);
    });
  });

  const foundryOutput = document.getElementById("foundryOutput");
  const ideaOutput = document.getElementById("ideaOutput");

  if (state.outputs.foundry) foundryOutput.textContent = state.outputs.foundry;
  if (state.outputs.idea) ideaOutput.textContent = state.outputs.idea;

  document.getElementById("foundryForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const modules = data.getAll("modules");
    const text = `# FLOWER GIRL — MANIFESTE DE CONCEPTION

Date : ${new Date().toISOString().slice(0, 10)}
Statut : Brouillon Yohan — non canonique
Filiation : ${data.get("lineage")}

## Mission

${data.get("mission")}

## Destination utile

${data.get("result")}

## Modules routés

${modules.length ? modules.map((item) => `- ${item}`).join("\n") : "- Aucun module sélectionné"}

## Architecture proposée

1. Core spécialisé : identité, mission, frontières et agents internes.
2. Persona : voix, modes, mémoire de session et contrat de réponse.
3. Routeur : sélection minimale des modules utiles.
4. Prompt maître : ordre de chargement et hiérarchie.
5. Tests : preuve de cohérence, limites et stop point.

## Verrous

- Ne modifie aucun Core canonique.
- Ne présente jamais ce brouillon comme validé.
- Ne fusionne pas les Personas existantes.
- Chaque module doit changer une décision réelle.
- Toute publication exige une validation humaine.

## Critère de réussite

Le profil produit la destination utile demandée avec des sources identifiées,
des limites explicites, une preuve vérifiable et un point d'arrêt.`;

    foundryOutput.textContent = text;
    state.outputs.foundry = text;
    saveState();
    updateProgress();
    showToast("Manifeste Flower Girl généré.");
  });

  document.getElementById("copyFoundry").addEventListener("click", () => {
    copyText(foundryOutput.textContent, "Manifeste copié.");
  });

  document.getElementById("downloadFoundry").addEventListener("click", () => {
    downloadText("FLOWER_GIRL_MANIFESTE_YOHAN.md", foundryOutput.textContent);
  });

  document.getElementById("ideaForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = data.get("title").trim();
    const text = `# ${title}

Statut : Proposition Yohan
Date : ${new Date().toISOString().slice(0, 10)}
Domaine : Agent-Crypto / Atlas-10 Full Crypto

## Hypothèse ou problème

${data.get("hypothesis")}

## Données nécessaires

${data.get("data")}

## Signal ou résultat attendu

${data.get("signal")}

## Risques, limites et faux positifs

${data.get("risks") || "À compléter pendant l'audit."}

## Test de validation

${data.get("test")}

## Intégration envisagée

- Source de données clairement identifiée.
- État de fraîcheur visible.
- Modèle mathématique explicite.
- Affichage séparant faits, calculs et interprétations.
- Aucun conseil d'achat ou de vente.
- Conservation de l'ancien état valide si la source échoue.
- Tests sur données normales, absentes, périmées et contradictoires.

## Critères d'acceptation

- Résultat reproductible.
- Aucune donnée inventée.
- Limites visibles.
- Interface stable.
- Aucun secret exposé.
- Validation humaine avant intégration.`;

    ideaOutput.textContent = text;
    state.outputs.idea = text;
    saveState();
    updateProgress();

    const issue = document.getElementById("openIssue");
    issue.href = `${PUBLIC_REPO}/issues/new?title=${encodeURIComponent(`[Yohan] ${title}`)}&body=${encodeURIComponent(text)}`;
    showToast("Proposition Yohan générée.");
  });

  document.getElementById("copyIdea").addEventListener("click", () => {
    copyText(ideaOutput.textContent, "Proposition copiée.");
  });

  document.getElementById("downloadIdea").addEventListener("click", () => {
    const match = ideaOutput.textContent.match(/^#\s+(.+)$/m);
    const safe = (match?.[1] || "PROPOSITION_YOHAN")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .toUpperCase();
    downloadText(`${safe}.md`, ideaOutput.textContent);
  });

  render();
})();