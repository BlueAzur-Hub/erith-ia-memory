(() => {
  "use strict";

  const catalog = window.AERITH_FORGE_CATALOG;
  if (!catalog) throw new Error("forge-catalog.js est introuvable.");

  const STORAGE_KEY = "agent_crypto_aerith_forge_v1";
  const STEP_KEY = "agent_crypto_aerith_forge_step_v1";
  const steps = [
    ["01", "Profil", "Choisir le profil ou créer un nouveau brouillon."],
    ["02", "Architecture", "Core, Persona, Boot et fichiers structurels."],
    ["03", "Sources", "Importer les ZIP et qualifier les références."],
    ["04", "Modules", "Activer uniquement les compétences utiles."],
    ["05", "Règles", "Mémoire, confidentialité et Stop Gates."],
    ["06", "Prévisualisation", "Vérifier les inclusions, références et alertes."],
    ["07", "Forge", "Générer le profil LLM et son ZIP."]
  ];

  const imported = [];
  const state = loadState();
  let activeStep = Number.parseInt(localStorageSafeGet(STEP_KEY, "0"), 10) || 0;
  let lastPreview = null;
  let currentIdea = "";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function localStorageSafeGet(key, fallback = null) {
    try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
  }

  function localStorageSafeSet(key, value) {
    try { localStorage.setItem(key, value); return true; } catch { return false; }
  }

  function loadState() {
    const defaults = {
      profileId: "atlas",
      profileRoot: "ATLAS_10_CRYPTO",
      customName: "",
      customMission: "",
      preset: "standard",
      selectedModules: [],
      rules: {},
      completed: {}
    };
    try {
      const parsed = JSON.parse(localStorageSafeGet(STORAGE_KEY, "{}") || "{}");
      return { ...defaults, ...parsed, rules: { ...defaults.rules, ...(parsed.rules || {}) } };
    } catch {
      return defaults;
    }
  }

  function saveState() {
    localStorageSafeSet(STORAGE_KEY, JSON.stringify(state));
  }

  function profile() {
    return catalog.profiles.find(item => item.id === state.profileId) || catalog.profiles[0];
  }

  function sanitizeName(value, fallback = "AERITH_PROFILE") {
    const clean = String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .toUpperCase();
    return clean || fallback;
  }

  function basename(path) {
    return String(path || "").replaceAll("\\", "/").split("/").pop();
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2300);
  }

  async function copyText(text, message = "Copié.") {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    showToast(message);
  }

  function downloadBlob(filename, blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function downloadText(filename, text) {
    downloadBlob(filename, new Blob([text], { type: "text/markdown;charset=utf-8" }));
  }

  function ensureDefaults() {
    const p = profile();
    if (!state.profileRoot || state.profileRoot === "AERITH_PROFILE") state.profileRoot = p.root;
    if (!Array.isArray(state.selectedModules) || !state.selectedModules.length) applyPreset(p.defaultPreset, false);
    catalog.rules.forEach(rule => {
      if (typeof state.rules[rule.id] !== "boolean") state.rules[rule.id] = rule.default;
    });
    saveState();
  }

  function renderProfileCards() {
    $("#profileCards").innerHTML = catalog.profiles.map(item => `
      <button type="button" class="profile-card ${item.id === state.profileId ? "is-active" : ""}" data-profile-id="${escapeHtml(item.id)}">
        <span class="card-top">
          <span class="card-sigil">${escapeHtml(item.sigil)}</span>
          <span class="card-status">${escapeHtml(item.statusLabel)}</span>
        </span>
        <span class="family">${escapeHtml(item.family)}</span>
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.short)}</p>
      </button>
    `).join("");
  }

  function renderSteps() {
    $("#forgeSteps").innerHTML = steps.map((item, index) => `
      <button type="button" class="step-button ${index === activeStep ? "is-active" : ""}" data-step-index="${index}">
        <span class="step-number">${item[0]}</span>
        <span class="step-copy"><strong>${item[1]}</strong><small>${item[2]}</small></span>
        <span class="step-state">•</span>
      </button>
    `).join("");
  }

  function selectProfile(id) {
    const next = catalog.profiles.find(item => item.id === id);
    if (!next) return;
    state.profileId = id;
    state.profileRoot = next.root;
    state.customName = "";
    state.customMission = "";
    state.preset = next.defaultPreset;
    state.selectedModules = next.modules.filter(module => module.preset.includes(next.defaultPreset)).map(module => module.id);
    document.body.dataset.profile = id;
    saveState();
    renderAll();
    showToast(`${next.name} sélectionné.`);
  }

  function applyPreset(preset, rerender = true) {
    const p = profile();
    state.preset = preset;
    state.selectedModules = p.modules.filter(module => module.preset.includes(preset)).map(module => module.id);
    saveState();
    if (rerender) {
      renderModules();
      updatePreview();
    }
  }

  function renderIdentity() {
    const p = profile();
    document.body.dataset.profile = p.id;
    $("#activeSigil").textContent = p.sigil;
    $("#activeFamily").textContent = p.family;
    $("#activeName").textContent = p.name;
    $("#activeDescription").textContent = p.description;
    $("#activeStatus").textContent = p.statusLabel;
    $("#profileRoot").value = state.profileRoot || p.root;
    $(".custom-only", document)?.toggleAttribute("hidden", p.id !== "custom");
    $$(".custom-only").forEach(node => node.hidden = p.id !== "custom");
    $("#customName").value = state.customName || "";
    $("#customMission").value = state.customMission || "";
  }

  function renderMatrix() {
    const p = profile();
    const selected = selectedModules();
    $("#matrixSigil").textContent = p.sigil;
    $("#matrixName").textContent = p.id === "custom" && state.customName ? state.customName : p.name;
    $("#matrixDescription").textContent = p.short;
    $("#matrixCore").textContent = p.id === "custom" ? "Généré" : String(p.mandatory.filter(x => x.kind === "core").length || "—");
    $("#matrixPersona").textContent = p.id === "custom" ? "Générée" : String(p.mandatory.filter(x => x.kind === "persona").length || "—");
    $("#matrixModules").textContent = String(selected.length);
    $("#matrixSources").textContent = p.privacy === "private" ? "Privé/local" : p.privacy === "draft" ? "Brouillon" : "Public";
    $("#matrixStatus").textContent = p.status === "public-ready" ? "READY" : p.status === "draft" ? "DRAFT" : "IMPORT";
  }

  function importedMatches(name, matchPath = "") {
    const needle = name.toLowerCase();
    const pathNeedle = matchPath.toLowerCase();
    return imported.filter(item => {
      const low = item.path.toLowerCase();
      return basename(low) === needle || (pathNeedle && low.endsWith(pathNeedle));
    });
  }

  function renderArchitecture() {
    const p = profile();
    const generated = [
      { name: `BOOT_${sanitizeName(state.profileRoot || p.root)}.md`, kind: "Boot", status: "GÉNÉRÉ" },
      { name: "PROFILE_MANIFEST.md", kind: "Manifeste", status: "GÉNÉRÉ" },
      { name: "ATLAS_DES_MODULES.md", kind: "Routeur", status: "GÉNÉRÉ" },
      { name: "SOURCES_REPORT.md", kind: "Preuve", status: "GÉNÉRÉ" },
      { name: "TESTS_LLM.md", kind: "Tests", status: "GÉNÉRÉ" },
      { name: "README.md", kind: "Guide", status: "GÉNÉRÉ" }
    ];
    const mandatory = p.id === "custom" ? [
      { name: `${sanitizeName(state.customName || "NOUVEAU_PROFIL")}_MULTI_AGENT_CORE.md`, kind: "core", source: "generated" },
      { name: `${sanitizeName(state.customName || "NOUVEAU_PROFIL")}_PERSONA_OPERATING_LAYER.md`, kind: "persona", source: "generated" }
    ] : p.mandatory;

    $("#architectureList").innerHTML = [...mandatory, ...generated].map(item => {
      let status = item.status || "";
      let cls = "generated";
      if (!status) {
        if (item.source === "builtin") { status = "INCLUS"; cls = ""; }
        else if (item.source === "generated") { status = "GÉNÉRÉ"; cls = "generated"; }
        else {
          const matches = importedMatches(item.name, item.matchPath);
          status = matches.length ? "LOCAL · TROUVÉ" : "RÉFÉRENCE";
          cls = matches.length ? "" : "reference";
        }
      }
      return `
        <div class="architecture-item">
          <span class="architecture-icon">${escapeHtml((item.kind || "F").slice(0, 2).toUpperCase())}</span>
          <span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.kind || "Fichier structurel")}</small></span>
          <span class="file-state ${cls}">${escapeHtml(status)}</span>
        </div>`;
    }).join("");

    const core = mandatory.find(x => x.kind === "core")?.name || "Core généré";
    const persona = mandatory.find(x => x.kind === "persona")?.name || "Persona générée";
    $("#activationChain").textContent =
`${core}
→ ${persona}
→ ATLAS_DES_MODULES.md
→ modules ciblés
→ PROFILE_MANIFEST.md
→ preuve
→ stop`;
  }

  function selectedModules() {
    const p = profile();
    return p.modules.filter(module => state.selectedModules.includes(module.id));
  }

  function renderModules() {
    const p = profile();
    $$(".preset-button").forEach(button => button.classList.toggle("is-active", button.dataset.preset === state.preset));
    $("#moduleGrid").innerHTML = p.modules.map(module => {
      const selected = state.selectedModules.includes(module.id);
      const ref = module.file || module.archive || "Module généré";
      return `
        <label class="module-card ${selected ? "is-selected" : ""}">
          <input type="checkbox" data-module-id="${escapeHtml(module.id)}" ${selected ? "checked" : ""}>
          <span>
            <span>${escapeHtml(module.group)}</span>
            <strong>${escapeHtml(module.label)}</strong>
            <small>${escapeHtml(ref)}</small>
          </span>
        </label>`;
    }).join("");
  }

  function renderRules() {
    $("#ruleGrid").innerHTML = catalog.rules.map(rule => `
      <div class="rule-card">
        <span><strong>${escapeHtml(rule.label)}</strong><small>${escapeHtml(rule.description)}</small></span>
        <label class="switch">
          <input type="checkbox" data-rule-id="${escapeHtml(rule.id)}" ${state.rules[rule.id] ? "checked" : ""}>
          <span></span>
        </label>
      </div>
    `).join("");
    const p = profile();
    $("#privacyBanner").innerHTML = p.privacy === "private"
      ? `<strong>Profil privé :</strong> les Cores et Personas ne sont inclus que s’ils sont importés localement. Le ZIP final est destiné à un usage privé.`
      : p.privacy === "draft"
      ? `<strong>Brouillon :</strong> le Core et la Persona générés ne deviennent jamais canoniques sans validation humaine.`
      : `<strong>Profil public :</strong> les fichiers d’export public peuvent être inclus. Les sources privées restent des références.`;
  }

  function renderSources() {
    const query = ($("#sourceFilter")?.value || "").trim().toLowerCase();
    const visible = imported.filter(item => !query || item.path.toLowerCase().includes(query));
    $("#sourceCount").textContent = String(imported.length);
    const p = profile();
    const names = new Set([
      ...p.mandatory.map(item => item.name.toLowerCase()),
      ...p.modules.map(item => (item.file || item.archive || "").toLowerCase()).filter(Boolean)
    ]);
    const recognized = imported.filter(item => names.has(basename(item.path).toLowerCase())).length;
    const pathCounts = imported.reduce((map, item) => map.set(item.path.toLowerCase(), (map.get(item.path.toLowerCase()) || 0) + 1), new Map());
    const duplicates = imported.filter(item => pathCounts.get(item.path.toLowerCase()) > 1).length;
    $("#recognizedCount").textContent = String(recognized);
    $("#duplicateCount").textContent = String(duplicates);
    $("#privateCount").textContent = String(imported.filter(item => item.private).length);

    $("#sourceRows").innerHTML = visible.length ? visible.slice(0, 350).map(item => {
      const known = names.has(basename(item.path).toLowerCase());
      const duplicate = pathCounts.get(item.path.toLowerCase()) > 1;
      const status = duplicate ? "DOUBLON" : known ? "RECONNU" : "INDEXÉ";
      const cls = duplicate ? "duplicate" : known ? "ok" : "";
      return `<tr>
        <td>${escapeHtml(item.path)}</td>
        <td>${escapeHtml(item.origin)}</td>
        <td>${escapeHtml(item.type)}</td>
        <td><span class="source-chip ${cls} ${item.private ? "private" : ""}">${item.private ? "LOCAL · " : ""}${status}</span></td>
      </tr>`;
    }).join("") : `<tr class="empty-row"><td colspan="4">Aucun fichier local importé.</td></tr>`;
  }

  function renderProgress() {
    const completion = computeCompletion();
    $$(".step-button").forEach((button, index) => {
      button.classList.toggle("is-active", index === activeStep);
      button.classList.toggle("is-complete", completion[index]);
      $(".step-state", button).textContent = completion[index] ? "✓" : "•";
    });
    const done = completion.filter(Boolean).length;
    $("#globalProgress").textContent = `${Math.round(done / steps.length * 100)}%`;
    $("#stageStatus").textContent = completion[activeStep] ? "Étape prête" : "Étape en cours";
  }

  function computeCompletion() {
    const p = profile();
    const sourcesReady = p.status === "public-ready" || p.id === "custom" ||
      p.mandatory.filter(x => x.source === "private").every(x => importedMatches(x.name, x.matchPath).length);
    return [
      Boolean(state.profileId && state.profileRoot),
      true,
      sourcesReady,
      selectedModules().length > 0,
      Object.values(state.rules).some(Boolean),
      Boolean(lastPreview),
      Boolean(lastPreview)
    ];
  }

  function activateStep(index, focus = false) {
    activeStep = Math.max(0, Math.min(index, steps.length - 1));
    localStorageSafeSet(STEP_KEY, String(activeStep));
    $$(".forge-panel").forEach((panel, i) => panel.classList.toggle("is-active", i === activeStep));
    const step = steps[activeStep];
    $("#stageCounter").textContent = `ÉTAPE ${step[0]} SUR 07`;
    $("#stageTitle").textContent = step[1];
    $("#stageDescription").textContent = step[2];
    $("#previousStep").disabled = activeStep === 0;
    $("#previousBottom").disabled = activeStep === 0;
    $("#nextStep").disabled = activeStep === steps.length - 1;
    $("#nextBottom").disabled = activeStep === steps.length - 1;
    renderProgress();
    if (activeStep >= 5) updatePreview();
    if (focus) $("#forgeWorkspace").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function makeBoot(p, root, modules, rules) {
    const publicName = p.id === "custom" && state.customName ? state.customName.trim() : p.name;
    const required = p.id === "custom"
      ? [`${sanitizeName(publicName)}_MULTI_AGENT_CORE.md`, `${sanitizeName(publicName)}_PERSONA_OPERATING_LAYER.md`]
      : p.mandatory.map(item => item.name);
    return `# BOOT — ${publicName}

Version Forge : ${catalog.version}
Statut : ${p.id === "custom" ? "Brouillon non canonique" : p.privacy === "private" ? "Profil privé local" : "Profil public exportable"}
Dossier : ${root}

## Activation

Active ${publicName}.

Charge dans cet ordre :

${required.map((name, i) => `${i + 1}. ${name}`).join("\n")}
${required.length + 1}. ATLAS_DES_MODULES.md
${required.length + 2}. Modules ciblés uniquement
${required.length + 3}. PROFILE_MANIFEST.md
${required.length + 4}. SOURCES_REPORT.md si une vérification est nécessaire

Mode par défaut :

\`${p.bootMode}\`

## Modules actifs

${modules.length ? modules.map(module => `- ${module.label}`).join("\n") : "- Aucun module"}

## Règles actives

${rules.length ? rules.map(rule => `- ${rule.label} : ${rule.description}`).join("\n") : "- Aucune règle sélectionnée"}

## Doctrine

Core
→ Persona
→ routeur
→ modules ciblés
→ données ou sources réelles
→ preuve
→ point d’arrêt.

Module présent ≠ module actif.
Un module est actif uniquement lorsqu’il change une décision, un calcul, un test ou une présentation.

Aucune publication automatique.
Aucun secret exposé.
Aucune donnée inventée.
`;
  }

  function makeManifest(p, root, modules, rules, warnings) {
    const name = p.id === "custom" && state.customName ? state.customName.trim() : p.name;
    return `# PROFILE MANIFEST — ${name}

Version Forge : ${catalog.version}
Date : ${new Date().toISOString().slice(0, 10)}
Dossier : ${root}
Famille : ${p.family}
Statut : ${p.id === "custom" ? "Brouillon — validation humaine obligatoire" : p.statusLabel}
Politique : ${p.privacy}

## Mission

${p.id === "custom" ? (state.customMission || "À compléter.") : p.description}

## Architecture

${p.id === "custom"
  ? `- Core généré\n- Persona générée`
  : p.mandatory.map(item => `- ${item.name} · ${item.kind}`).join("\n")}
- Boot généré
- Routeur de modules généré
- Rapport de sources
- Tests LLM
- README

## Modules

${modules.length ? modules.map(module => `- ${module.label} · ${module.group}`).join("\n") : "- Aucun"}

## Règles

${rules.length ? rules.map(rule => `- ${rule.label}`).join("\n") : "- Aucune"}

## Alertes

${warnings.length ? warnings.map(item => `- ${item}`).join("\n") : "- Aucune alerte bloquante."}

## Validation

Ce manifeste décrit le contenu réellement préparé par la Forge.
Il ne transforme jamais un brouillon en Core canonique.
`;
  }

  function makeRouter(modules) {
    return `# ATLAS DES MODULES

Version Forge : ${catalog.version}

## Doctrine

Question
→ contexte
→ module utile
→ décision changée
→ preuve
→ arrêt.

## Modules sélectionnés

${modules.length ? modules.map((module, i) => `${i + 1}. ${module.label}${module.file ? ` — \`${module.file}\`` : module.archive ? ` — \`${module.archive}\`` : ""}`).join("\n") : "Aucun module sélectionné."}

## Verrou

Module présent ≠ module actif.
Un module doit être chargé uniquement lorsqu’il modifie réellement le résultat.
`;
  }

  function makeSourcesReport(p, included, references, missing) {
    return `# SOURCES REPORT

Version Forge : ${catalog.version}
Date : ${new Date().toISOString()}

## Inclus

${included.length ? included.map(item => `- ${item}`).join("\n") : "- Aucun fichier source inclus."}

## Références

${references.length ? references.map(item => `- ${item}`).join("\n") : "- Aucune référence."}

## Manquants ou non résolus

${missing.length ? missing.map(item => `- ${item}`).join("\n") : "- Aucun."}

## Politique

- Les fichiers importés restent locaux au navigateur.
- Les sources privées ne sont jamais téléchargées automatiquement.
- Un fichier privé n’est inclus qu’après import local explicite.
- Les secrets et clés ne doivent jamais être ajoutés au ZIP.
`;
  }

  function makeTests(p, modules) {
    return `# TESTS LLM — ${p.name}

## Test 1 — Activation

- Charger le Boot.
- Vérifier que le Core précède la Persona.
- Vérifier que le profil annonce son identité exacte.

## Test 2 — Routage

- Poser une question nécessitant un module sélectionné.
- Vérifier que le module change une décision.
- Vérifier qu’un module non utile n’est pas simulé comme actif.

## Test 3 — Limites

- Demander une donnée absente.
- Le profil doit signaler l’absence sans inventer.

## Test 4 — Mémoire

- Changer de contexte.
- Vérifier que l’ancien contexte n’écrase pas le nouveau.

## Test 5 — Stop

- Donner une preuve suffisante ou dire Stop.
- Le profil doit s’arrêter proprement.

## Modules à tester

${modules.length ? modules.map(module => `- ${module.label}`).join("\n") : "- Aucun module."}
`;
  }

  function makeReadme(p, root, modules) {
    return `# ${p.id === "custom" && state.customName ? state.customName : p.name}

Profil assemblé avec Forge d’Aerith ${catalog.version}.

## Utilisation

1. Ouvrir \`BOOT_${root}.md\`.
2. Charger les fichiers dans l’ordre indiqué.
3. Charger uniquement les modules nécessaires.
4. Vérifier les sources et les limites.
5. Arrêter lorsque la preuve suffit.

## Modules

${modules.length ? modules.map(module => `- ${module.label}`).join("\n") : "- Aucun"}

## Confidentialité

${p.privacy === "private"
  ? "Ce profil contient ou référence des sources privées. Ne pas publier le ZIP sans vérification."
  : p.privacy === "draft"
  ? "Ce profil est un brouillon. Il ne devient canonique qu’après validation humaine."
  : "Ce profil utilise les fichiers publics d’export et peut conserver des références privées non incluses."}
`;
  }

  function makeCustomCore(name, mission, modules, rules) {
    const id = sanitizeName(name);
    return `# ${name.toUpperCase()} — Multi-Agent Core

Statut : Brouillon Forge — non canonique
Version : V0.1
Fichier : \`${id}_MULTI_AGENT_CORE.md\`
Persona requise : \`${id}_PERSONA_OPERATING_LAYER.md\`

## 0. Verrou

Ce fichier est un brouillon.
Toute canonisation exige une validation humaine.

## 1. Identité

${name} est un profil multi-agent spécialisé.

## 2. Mission

${mission || "À compléter."}

## 3. Agents internes

- Orchestrateur
- Gardien des sources
- Expert métier
- Gardien du risque
- Archiviste

## 4. Modules

${modules.length ? modules.map(module => `- ${module.label}`).join("\n") : "- Aucun"}

## 5. Règles

${rules.length ? rules.map(rule => `- ${rule.label}`).join("\n") : "- Aucune"}

## 6. Doctrine

D
→ source
→ module utile
→ décision
→ preuve
→ stop.

## 7. Limites

- Aucun secret.
- Aucune publication automatique.
- Aucune donnée inventée.
- Aucun statut canonique sans validation.
`;
  }

  function makeCustomPersona(name, modules) {
    const id = sanitizeName(name);
    return `# ${name.toUpperCase()} — Persona Operating Layer

Statut : Brouillon Forge — non canonique
Version : V0.1
Core requis : \`${id}_MULTI_AGENT_CORE.md\`

## 1. Voix

Clair, précis, respectueux et adapté à la mission.

## 2. Modes

- /profile standard
- /profile atelier
- /profile audit
- /profile archive
- /profile stop

## 3. Mémoire

- mémoire stable : identité et règles validées ;
- mémoire de session : contexte utile ;
- mémoire éphémère : hypothèses non validées.

## 4. Contrat de réponse

Avant chaque réponse :

1. D ;
2. source ;
3. module utile ;
4. limite ;
5. preuve ;
6. stop point.

## 5. Modules

${modules.length ? modules.map(module => `- ${module.label}`).join("\n") : "- Aucun"}

## 6. Frontière

Cette Persona ne remplace jamais le Core et ne devient pas canonique sans validation humaine.
`;
  }

  async function fetchText(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`${path} · HTTP ${response.status}`);
    return response.text();
  }

  async function extractImported(item) {
    if (item.directFile) return new Uint8Array(await item.directFile.arrayBuffer());
    if (!item.zipRef) throw new Error("Source locale indisponible.");
    const data = new Uint8Array(await item.zipRef.file.arrayBuffer());
    const entry = item.zipRef.entry;
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const offset = entry.localOffset;
    if (view.getUint32(offset, true) !== 0x04034b50) throw new Error("En-tête ZIP local invalide.");
    const nameLen = view.getUint16(offset + 26, true);
    const extraLen = view.getUint16(offset + 28, true);
    const start = offset + 30 + nameLen + extraLen;
    const compressed = data.slice(start, start + entry.compressedSize);
    if (entry.method === 0) return compressed;
    if (entry.method === 8 && "DecompressionStream" in window) {
      const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      return new Uint8Array(await new Response(stream).arrayBuffer());
    }
    throw new Error(`Compression ZIP ${entry.method} non prise en charge par ce navigateur.`);
  }

  function findImported(name, matchPath = "") {
    const matches = importedMatches(name, matchPath);
    return matches[0] || null;
  }

  async function buildPackage(includeSources = true) {
    const p = profile();
    const root = sanitizeName(state.profileRoot || p.root);
    const modules = selectedModules();
    const rules = catalog.rules.filter(rule => state.rules[rule.id]);
    const files = new Map();
    const included = [];
    const references = [];
    const missing = [];
    const warnings = [];

    if (p.id === "custom") {
      const name = state.customName.trim() || "Nouveau profil";
      const id = sanitizeName(name);
      files.set(`${root}/core/${id}_MULTI_AGENT_CORE.md`, encodeUtf8(makeCustomCore(name, state.customMission, modules, rules)));
      files.set(`${root}/persona/${id}_PERSONA_OPERATING_LAYER.md`, encodeUtf8(makeCustomPersona(name, modules)));
      included.push(`${id}_MULTI_AGENT_CORE.md`, `${id}_PERSONA_OPERATING_LAYER.md`);
      if (!state.customName.trim()) warnings.push("Le nouveau profil utilise encore un nom générique.");
      if (!state.customMission.trim()) warnings.push("La mission du nouveau profil reste à compléter.");
    } else {
      for (const item of p.mandatory) {
        const folder = item.kind === "persona" ? "persona" : item.kind === "core" ? "core" : "system";
        const target = `${root}/${folder}/${item.name}`;
        if (item.source === "builtin") {
          try {
            const text = await fetchText(item.path);
            files.set(target, encodeUtf8(text));
            included.push(item.name);
          } catch (error) {
            missing.push(item.name);
            warnings.push(`Fichier public inaccessible : ${item.name}.`);
          }
        } else {
          const local = findImported(item.name, item.matchPath);
          if (local && includeSources) {
            try {
              files.set(target, await extractImported(local));
              included.push(`${item.name} · import local`);
            } catch (error) {
              missing.push(item.name);
              warnings.push(`${item.name} reconnu mais non extractible : ${error.message}`);
            }
          } else {
            references.push(`${item.name} · source privée`);
            missing.push(item.name);
          }
        }
      }
    }

    for (const module of modules) {
      if (module.file) {
        const local = findImported(module.file);
        if (local && includeSources) {
          try {
            files.set(`${root}/modules/${module.file}`, await extractImported(local));
            included.push(`${module.file} · import local`);
            continue;
          } catch (error) {
            warnings.push(`${module.file} reconnu mais non extractible : ${error.message}`);
          }
        }
        if (p.privacy === "public") {
          try {
            const text = await fetchText(`modules/${module.file}`);
            files.set(`${root}/modules/${module.file}`, encodeUtf8(text));
            included.push(module.file);
            continue;
          } catch {
            references.push(`modules/${module.file}`);
            warnings.push(`Module référencé mais absent du paquet local : ${module.file}. Il sera récupéré sur GitHub Pages si le dossier modules existe.`);
          }
        } else {
          references.push(module.file);
        }
      } else if (module.archive) {
        const local = findImported(module.archive);
        if (local) {
          references.push(`${module.archive} · archive locale indexée`);
        } else {
          references.push(module.archive);
          warnings.push(`Archive non importée : ${module.archive}.`);
        }
      } else {
        references.push(module.label);
      }
    }

    const boot = makeBoot(p, root, modules, rules);
    const router = makeRouter(modules);
    const sources = makeSourcesReport(p, included, references, missing);
    const tests = makeTests(p, modules);
    const readme = makeReadme(p, root, modules);
    const manifest = makeManifest(p, root, modules, rules, warnings);

    files.set(`${root}/BOOT_${root}.md`, encodeUtf8(boot));
    files.set(`${root}/PROFILE_MANIFEST.md`, encodeUtf8(manifest));
    files.set(`${root}/ATLAS_DES_MODULES.md`, encodeUtf8(router));
    files.set(`${root}/SOURCES_REPORT.md`, encodeUtf8(sources));
    files.set(`${root}/TESTS_LLM.md`, encodeUtf8(tests));
    files.set(`${root}/README.md`, encodeUtf8(readme));

    return { p, root, modules, rules, files, included, references, missing, warnings, boot, manifest, router, sources, tests, readme };
  }

  function previewTree(pkg) {
    const paths = [...pkg.files.keys()].sort();
    const root = pkg.root;
    const lines = [`${root}/`];
    paths.forEach((path, index) => {
      const rel = path.slice(root.length + 1);
      const parts = rel.split("/");
      const last = index === paths.length - 1;
      lines.push(`${last ? "└──" : "├──"} ${parts.join("/")}`);
    });
    return lines.join("\n");
  }

  async function updatePreview() {
    try {
      lastPreview = await buildPackage(false);
      const p = lastPreview.p;
      $("#previewSummary").innerHTML = [
        ["Profil", p.id === "custom" && state.customName ? state.customName : p.name, p.family],
        ["Fichiers", lastPreview.files.size, "structure générée"],
        ["Modules", lastPreview.modules.length, state.preset],
        ["Sources", lastPreview.included.length, `${lastPreview.references.length} référence(s)`],
        ["Manquants", lastPreview.missing.length, p.privacy === "private" ? "import local requis" : "à vérifier"],
        ["Règles", lastPreview.rules.length, "actives"],
        ["Diffusion", p.privacy.toUpperCase(), p.statusLabel],
        ["Version", catalog.version, catalog.buildDate]
      ].map(item => `<div class="preview-stat"><span>${escapeHtml(item[0])}</span><strong>${escapeHtml(item[1])}</strong><small>${escapeHtml(item[2])}</small></div>`).join("");
      $("#treePreview").textContent = previewTree(lastPreview);
      const notices = [
        ...lastPreview.warnings.map(text => ({ ok: false, title: "Attention", text })),
        ...(!lastPreview.warnings.length ? [{ ok: true, title: "Structure cohérente", text: "Aucune alerte bloquante détectée dans la prévisualisation." }] : []),
        { ok: true, title: "Publication contrôlée", text: "La Forge ne publie rien automatiquement et n’envoie aucun fichier importé." }
      ];
      $("#warningList").innerHTML = notices.map(item => `<div class="warning-item ${item.ok ? "ok" : ""}"><span class="warning-icon">${item.ok ? "✓" : "!"}</span><span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.text)}</small></span></div>`).join("");
      $("#warningBadge").textContent = String(lastPreview.warnings.length);
      $("#forgeResultName").textContent = p.id === "custom" && state.customName ? state.customName : p.name;
      $("#forgeResultText").textContent = lastPreview.warnings.length
        ? `${lastPreview.warnings.length} alerte(s) non bloquante(s). Les références manquantes resteront visibles dans SOURCES_REPORT.md.`
        : `${lastPreview.files.size} fichiers préparés. La Forge peut produire le ZIP.`;
      renderProgress();
    } catch (error) {
      $("#forgeLog").textContent = `Erreur de prévisualisation : ${error.message}`;
    }
  }

  function encodeUtf8(text) {
    return new TextEncoder().encode(String(text));
  }

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc ^= byte;
      for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function concatArrays(arrays) {
    const length = arrays.reduce((sum, array) => sum + array.length, 0);
    const output = new Uint8Array(length);
    let offset = 0;
    for (const array of arrays) { output.set(array, offset); offset += array.length; }
    return output;
  }

  function dosDateTime(date = new Date()) {
    const year = Math.max(1980, date.getFullYear());
    const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
    const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
    return { dosTime, dosDate };
  }

  function makeZip(files) {
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    const { dosTime, dosDate } = dosDateTime();

    for (const [name, raw] of files.entries()) {
      const data = raw instanceof Uint8Array ? raw : encodeUtf8(raw);
      const nameBytes = encodeUtf8(name);
      const crc = crc32(data);

      const local = new Uint8Array(30 + nameBytes.length);
      const lv = new DataView(local.buffer);
      lv.setUint32(0, 0x04034b50, true);
      lv.setUint16(4, 20, true);
      lv.setUint16(6, 0x0800, true);
      lv.setUint16(8, 0, true);
      lv.setUint16(10, dosTime, true);
      lv.setUint16(12, dosDate, true);
      lv.setUint32(14, crc, true);
      lv.setUint32(18, data.length, true);
      lv.setUint32(22, data.length, true);
      lv.setUint16(26, nameBytes.length, true);
      lv.setUint16(28, 0, true);
      local.set(nameBytes, 30);
      localParts.push(local, data);

      const central = new Uint8Array(46 + nameBytes.length);
      const cv = new DataView(central.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0x0800, true);
      cv.setUint16(10, 0, true);
      cv.setUint16(12, dosTime, true);
      cv.setUint16(14, dosDate, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, data.length, true);
      cv.setUint32(24, data.length, true);
      cv.setUint16(28, nameBytes.length, true);
      cv.setUint16(30, 0, true);
      cv.setUint16(32, 0, true);
      cv.setUint16(34, 0, true);
      cv.setUint16(36, 0, true);
      cv.setUint32(38, 0, true);
      cv.setUint32(42, offset, true);
      central.set(nameBytes, 46);
      centralParts.push(central);

      offset += local.length + data.length;
    }

    const localData = concatArrays(localParts);
    const centralData = concatArrays(centralParts);
    const end = new Uint8Array(22);
    const ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, files.size, true);
    ev.setUint16(10, files.size, true);
    ev.setUint32(12, centralData.length, true);
    ev.setUint32(16, localData.length, true);
    ev.setUint16(20, 0, true);
    return new Blob([localData, centralData, end], { type: "application/zip" });
  }

  function parseZipEntries(file, bytes) {
    const data = new Uint8Array(bytes);
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    let eocd = -1;
    const min = Math.max(0, data.length - 65557);
    for (let i = data.length - 22; i >= min; i--) {
      if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error(`${file.name} : fin ZIP introuvable.`);
    const count = view.getUint16(eocd + 10, true);
    const centralOffset = view.getUint32(eocd + 16, true);
    const decoder = new TextDecoder("utf-8");
    const entries = [];
    let cursor = centralOffset;
    for (let index = 0; index < count; index++) {
      if (view.getUint32(cursor, true) !== 0x02014b50) break;
      const method = view.getUint16(cursor + 10, true);
      const compressedSize = view.getUint32(cursor + 20, true);
      const uncompressedSize = view.getUint32(cursor + 24, true);
      const nameLen = view.getUint16(cursor + 28, true);
      const extraLen = view.getUint16(cursor + 30, true);
      const commentLen = view.getUint16(cursor + 32, true);
      const localOffset = view.getUint32(cursor + 42, true);
      const name = decoder.decode(data.slice(cursor + 46, cursor + 46 + nameLen));
      if (name && !name.endsWith("/")) entries.push({ name, method, compressedSize, uncompressedSize, localOffset });
      cursor += 46 + nameLen + extraLen + commentLen;
    }
    return entries;
  }

  function classifyImported(path, origin, directFile = null, zipRef = null) {
    const lower = path.toLowerCase();
    const type = lower.endsWith(".md") ? "Markdown" : lower.endsWith(".json") ? "JSON" : lower.endsWith(".txt") ? "Texte" : "Fichier";
    const privateFile = /core\/|creator_memory|aerith_10_creatrice|seven_gate|session_boot_aerith_7|seven_lessons|full_modules_boost/i.test(lower);
    return { path, origin, type, private: privateFile, directFile, zipRef };
  }

  async function importFiles(files) {
    $("#forgeLog").textContent = "Indexation des sources locales…";
    for (const file of files) {
      if (file.name.toLowerCase().endsWith(".zip")) {
        try {
          const bytes = await file.arrayBuffer();
          const entries = parseZipEntries(file, bytes);
          entries.forEach(entry => imported.push(classifyImported(entry.name, file.name, null, { file, entry })));
        } catch (error) {
          showToast(error.message);
        }
      } else {
        imported.push(classifyImported(file.name, file.name, file, null));
      }
    }
    renderSources();
    renderArchitecture();
    updatePreview();
    $("#forgeLog").textContent = `${imported.length} fichier(s) indexé(s) localement.`;
    showToast("Sources locales indexées.");
  }

  function renderAll() {
    ensureDefaults();
    renderProfileCards();
    renderSteps();
    renderIdentity();
    renderMatrix();
    renderArchitecture();
    renderModules();
    renderRules();
    renderSources();
    activateStep(activeStep);
    updatePreview();
  }

  // Events
  document.addEventListener("click", event => {
    const profileButton = event.target.closest("[data-profile-id]");
    if (profileButton) selectProfile(profileButton.dataset.profileId);

    const stepButton = event.target.closest("[data-step-index]");
    if (stepButton) activateStep(Number(stepButton.dataset.stepIndex));

    const moduleInput = event.target.closest("[data-module-id]");
    if (moduleInput) {
      const id = moduleInput.dataset.moduleId;
      state.selectedModules = moduleInput.checked
        ? [...new Set([...state.selectedModules, id])]
        : state.selectedModules.filter(item => item !== id);
      saveState();
      renderModules();
      renderMatrix();
      updatePreview();
    }

    const ruleInput = event.target.closest("[data-rule-id]");
    if (ruleInput) {
      state.rules[ruleInput.dataset.ruleId] = ruleInput.checked;
      saveState();
      updatePreview();
    }

    const presetButton = event.target.closest("[data-preset]");
    if (presetButton) applyPreset(presetButton.dataset.preset);

    const previewTab = event.target.closest("[data-preview-tab]");
    if (previewTab) {
      $$(".preview-tab").forEach(tab => tab.classList.toggle("is-active", tab === previewTab));
      $$(".preview-panel").forEach(panel => panel.classList.toggle("is-active", panel.dataset.previewPanel === previewTab.dataset.previewTab));
    }
  });

  $("#profileRoot").addEventListener("input", event => {
    state.profileRoot = sanitizeName(event.target.value, profile().root);
    event.target.value = state.profileRoot;
    saveState();
    renderArchitecture();
    updatePreview();
  });
  $("#customName").addEventListener("input", event => { state.customName = event.target.value; saveState(); renderMatrix(); renderArchitecture(); updatePreview(); });
  $("#customMission").addEventListener("input", event => { state.customMission = event.target.value; saveState(); updatePreview(); });

  const goNext = () => activateStep(activeStep + 1);
  const goPrevious = () => activateStep(activeStep - 1);
  $("#nextStep").addEventListener("click", goNext);
  $("#nextBottom").addEventListener("click", goNext);
  $("#previousStep").addEventListener("click", goPrevious);
  $("#previousBottom").addEventListener("click", goPrevious);
  $("#heroStart").addEventListener("click", () => activateStep(0, true));
  $("#jumpForge").addEventListener("click", () => activateStep(0, true));

  $("#resetForge").addEventListener("click", () => {
    if (!confirm("Réinitialiser la Forge et les choix enregistrés dans ce navigateur ?")) return;
    try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(STEP_KEY); } catch {}
    location.reload();
  });

  const dropZone = $("#dropZone");
  $("#browseSources").addEventListener("click", event => { event.stopPropagation(); $("#sourceInput").click(); });
  dropZone.addEventListener("click", event => { if (!event.target.closest("button")) $("#sourceInput").click(); });
  dropZone.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") $("#sourceInput").click(); });
  $("#sourceInput").addEventListener("change", event => importFiles([...event.target.files]));
  ["dragenter", "dragover"].forEach(type => dropZone.addEventListener(type, event => { event.preventDefault(); dropZone.classList.add("is-dragging"); }));
  ["dragleave", "drop"].forEach(type => dropZone.addEventListener(type, event => { event.preventDefault(); dropZone.classList.remove("is-dragging"); }));
  dropZone.addEventListener("drop", event => importFiles([...event.dataTransfer.files]));
  $("#sourceFilter").addEventListener("input", renderSources);
  $("#clearSources").addEventListener("click", () => { imported.splice(0); renderSources(); renderArchitecture(); updatePreview(); showToast("Coffre local vidé."); });

  $("#forgeZip").addEventListener("click", async () => {
    const log = $("#forgeLog");
    log.textContent = "Assemblage des fichiers…";
    try {
      const pkg = await buildPackage(true);
      log.textContent = `Création de ${pkg.files.size} fichier(s)…`;
      const blob = makeZip(pkg.files);
      downloadBlob(`${pkg.root}_FORGE_${catalog.version.replaceAll(".", "_").replace("-", "_")}.zip`, blob);
      lastPreview = pkg;
      log.textContent = `${pkg.root} forgé · ${pkg.files.size} fichier(s) · ${(blob.size / 1024).toFixed(1)} Ko.`;
      showToast("Profil ZIP forgé.");
    } catch (error) {
      log.textContent = `Forge interrompue : ${error.message}`;
      showToast("La Forge a rencontré une erreur.");
    }
  });

  $("#downloadBoot").addEventListener("click", async () => {
    const pkg = await buildPackage(false);
    downloadText(`BOOT_${pkg.root}.md`, pkg.boot);
  });
  $("#downloadManifest").addEventListener("click", async () => {
    const pkg = await buildPackage(false);
    downloadText("PROFILE_MANIFEST.md", pkg.manifest);
  });
  $("#copyPrompt").addEventListener("click", async () => {
    const pkg = await buildPackage(false);
    copyText(pkg.boot, "Prompt d’activation copié.");
  });
  $("#copyTree").addEventListener("click", async () => {
    const pkg = await buildPackage(false);
    copyText(previewTree(pkg), "Arborescence copiée.");
  });

  $("#ideaForm").addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") || "").trim();
    currentIdea = `# ${title}

Statut : Proposition Forge d’Aerith
Date : ${new Date().toISOString().slice(0, 10)}

## Hypothèse ou problème

${data.get("hypothesis")}

## Données nécessaires

${data.get("data")}

## Résultat attendu

${data.get("result")}

## Risques et faux positifs

${data.get("risks") || "À compléter pendant l’audit."}

## Test de validation

${data.get("test")}

## Critères d’acceptation

- Sources identifiées.
- Résultat reproductible.
- Limites visibles.
- Aucun secret exposé.
- Aucune publication automatique.
- Validation humaine avant intégration.
`;
    $("#ideaOutput").textContent = currentIdea;
    showToast("Proposition générée.");
  });
  $("#copyIdea").addEventListener("click", () => copyText(currentIdea || $("#ideaOutput").textContent, "Proposition copiée."));
  $("#downloadIdea").addEventListener("click", () => {
    const title = ($("#ideaForm [name=title]").value || "PROPOSITION").trim();
    downloadText(`${sanitizeName(title)}.md`, currentIdea || $("#ideaOutput").textContent);
  });

  ensureDefaults();
  renderAll();
})();
