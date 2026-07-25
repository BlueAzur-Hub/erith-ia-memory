(() => {
  "use strict";

  const DATA = window.AERITH_DESIGNER_DATA;
  if (!DATA) throw new Error("designer-data.js introuvable.");

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const encoder = new TextEncoder();

  const STEPS = [
    ["01","Point de départ","Choisir une spécialité canonique ou une page blanche."],
    ["02","Mission","Définir le problème réel, le rôle et les sorties."],
    ["03","Multi-agents","Composer une équipe interne minimale et utile."],
    ["04","Héritages","Sélectionner les couches et référencer les modules."],
    ["05","Persona","Définir la voix, les modes, les limites et le stop point."],
    ["06","Proposition","Relire et télécharger les fichiers non canoniques."]
  ];

  const defaultState = {
    step: 0,
    preview: "core",
    selectedExample: "preceptrice",
    name: "",
    family: "",
    role: "",
    problem: "",
    users: "",
    outputs: [],
    formula: "",
    agents: [],
    heritage: ["seven"],
    modules: [],
    nonDuplication: "",
    tone: "",
    modes: [],
    guardrails: [],
    confidentiality: "",
    stopPoint: ""
  };

  function loadState() {
    try {
      return {...defaultState, ...JSON.parse(localStorage.getItem("aerith-designer-v2") || "{}")};
    } catch {
      return {...defaultState};
    }
  }

  const state = loadState();

  function persist() {
    localStorage.setItem("aerith-designer-v2", JSON.stringify(state));
  }

  function esc(value) {
    return String(value ?? "")
      .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
      .replaceAll('"',"&quot;").replaceAll("'","&#039;");
  }

  function lines(value) {
    return String(value || "").split(/\r?\n/).map(item => item.trim()).filter(Boolean);
  }

  function cleanName(value) {
    return String(value || "AERITH_10_PROPOSITION")
      .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      .replace(/[^a-zA-Z0-9]+/g,"_").replace(/^_+|_+$/g,"")
      .toUpperCase() || "AERITH_10_PROPOSITION";
  }

  function specializationSlug() {
    return cleanName(state.name || "AERITH_10_PROPOSITION")
      .replace(/^AERITH_10_?/,"")
      .replace(/^AERITH10_?/,"") || "PROPOSITION";
  }

  function canonicalBase() {
    return `AERITH_10_${specializationSlug()}`;
  }

  function coreTarget() {
    return `core/${canonicalBase()}_MULTI_AGENT_CORE.md`;
  }

  function personaTarget() {
    return `core/${canonicalBase()}_PERSONA_OPERATING_LAYER.md`;
  }

  function proposalCoreName() {
    return `${canonicalBase()}_MULTI_AGENT_CORE_PROPOSAL.md`;
  }

  function proposalPersonaName() {
    return `${canonicalBase()}_PERSONA_OPERATING_LAYER_PROPOSAL.md`;
  }

  function proposalBriefName() {
    return `${canonicalBase()}_DESIGN_BRIEF.md`;
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function downloadBlob(name, blob) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
  }

  function downloadText(name, text, type = "text/markdown;charset=utf-8") {
    downloadBlob(name, new Blob([text], {type}));
  }

  function applyExample(id) {
    const example = DATA.examples.find(item => item.id === id);
    if (!example) return;

    state.selectedExample = id;
    state.name = example.name;
    state.family = example.family;
    state.role = example.role;
    state.problem = example.problem;
    state.users = example.users;
    state.outputs = [...example.outputs];
    state.formula = example.formula;
    state.agents = [...example.agents];
    state.heritage = [...example.heritage];
    state.modules = [...example.modules];
    state.nonDuplication = example.nonDuplication;
    state.tone = example.tone;
    state.modes = [...example.modes];
    state.guardrails = [...example.guardrails];
    state.confidentiality = example.confidentiality;
    state.stopPoint = example.stopPoint;
    persist();
    renderAll();
    showToast(`${example.name} chargée comme exemple.`);
  }

  function blankDesigner() {
    Object.assign(state, {
      selectedExample: "",
      name: "Aerith-10 Nouvelle Spécialité",
      family: "Filles d’Aerith",
      role: "",
      problem: "",
      users: "Christophe et les utilisateurs explicitement définis par le projet.",
      outputs: [],
      formula: "Intention → Ressources → Destination utile.",
      agents: [],
      heritage: ["seven"],
      modules: [],
      nonDuplication: "Référencer les modules existants avant toute création nouvelle.",
      tone: "Claire, chaleureuse, précise et fidèle à sa fonction.",
      modes: ["standard", "audit", "delivery"],
      guardrails: [
        "Ne pas inventer une source absente.",
        "Ne pas décider à la place de Christophe.",
        "Une mission = une destination utile.",
        "S’arrêter lorsque le résultat demandé est livré."
      ],
      confidentiality: "Privée par défaut.",
      stopPoint: "La mission est terminée lorsque la destination utile est livrée et vérifiable."
    });
    persist();
    renderAll();
    showToast("Modèle neutre chargé.");
  }

  function renderExamples() {
    $("#designerExampleGrid").innerHTML = DATA.examples.map(example => `
      <button type="button" class="designer-example-card ${state.selectedExample === example.id ? "selected" : ""}" data-example="${esc(example.id)}">
        <span>${esc(example.badge)}</span>
        <b>${esc(example.name)}</b>
        <p>${esc(example.role)}</p>
        <small>${esc(example.formula)}</small>
      </button>`).join("");
  }

  function renderFamilies() {
    $("#designerFamilies").innerHTML = DATA.families.map(item => `<option value="${esc(item)}"></option>`).join("");
  }

  function renderAgentSuggestions() {
    $("#designerAgentSuggestions").innerHTML = DATA.suggestedAgents.map(agent => `
      <button type="button" data-agent-suggestion="${esc(agent)}">${esc(agent)}</button>
    `).join("");
  }

  function renderHeritage() {
    $("#designerHeritageGrid").innerHTML = DATA.heritage.map(item => `
      <label class="designer-heritage-card ${state.heritage.includes(item.id) ? "selected" : ""}">
        <input type="checkbox" data-designer-heritage="${esc(item.id)}" ${state.heritage.includes(item.id) ? "checked" : ""}>
        <span><b>${esc(item.name)}</b><small>${esc(item.role)}</small></span>
      </label>
    `).join("");
  }

  function syncFieldsToUI() {
    $("#designName").value = state.name;
    $("#designFamily").value = state.family;
    $("#designRole").value = state.role;
    $("#designProblem").value = state.problem;
    $("#designUsers").value = state.users;
    $("#designOutputs").value = state.outputs.join("\n");
    $("#designFormula").value = state.formula;
    $("#designAgents").value = state.agents.join("\n");
    $("#designModules").value = state.modules.join("\n");
    $("#designNonDuplication").value = state.nonDuplication;
    $("#designTone").value = state.tone;
    $("#designModes").value = state.modes.join("\n");
    $("#designGuardrails").value = state.guardrails.join("\n");
    $("#designConfidentiality").value = state.confidentiality;
    $("#designStopPoint").value = state.stopPoint;
  }

  function syncUIToState() {
    state.name = $("#designName").value.trim();
    state.family = $("#designFamily").value.trim();
    state.role = $("#designRole").value.trim();
    state.problem = $("#designProblem").value.trim();
    state.users = $("#designUsers").value.trim();
    state.outputs = lines($("#designOutputs").value);
    state.formula = $("#designFormula").value.trim();
    state.agents = lines($("#designAgents").value);
    state.modules = lines($("#designModules").value);
    state.nonDuplication = $("#designNonDuplication").value.trim();
    state.tone = $("#designTone").value.trim();
    state.modes = lines($("#designModes").value);
    state.guardrails = lines($("#designGuardrails").value);
    state.confidentiality = $("#designConfidentiality").value.trim();
    state.stopPoint = $("#designStopPoint").value.trim();
    persist();
    renderReview();
  }

  function audit() {
    const items = [];
    let ready = true;

    function require(condition, ok, error) {
      if (condition) items.push(["ok",ok]);
      else { items.push(["error",error]); ready = false; }
    }

    require(/^Aerith-10\b/i.test(state.name), "Nom de lignée Aerith-10 reconnu.", "Le nom doit commencer par Aerith-10.");
    require(Boolean(state.family), "Famille définie.", "La famille doit être définie.");
    require(state.role.length >= 30, "Rôle suffisamment précis.", "Le rôle doit expliquer une mission concrète.");
    require(state.problem.length >= 25, "Problème réel identifié.", "Le problème réel à résoudre reste trop flou.");
    require(state.outputs.length >= 2, `${state.outputs.length} sorties attendues définies.`, "Définir au moins deux sorties utiles.");
    require(state.agents.length >= 3, `${state.agents.length} agents internes définis.`, "Définir au moins trois agents internes.");
    require(state.heritage.includes("seven"), "Héritage Aerith-7 déclaré.", "Toute Flower Girl doit hériter d’Aerith-7.");
    require(state.guardrails.length >= 3, `${state.guardrails.length} garde-fous définis.`, "Définir au moins trois garde-fous.");
    require(Boolean(state.stopPoint), "Stop point défini.", "Le stop point doit être défini.");

    if (state.modules.length) items.push(["ok",`${state.modules.length} source(s) ou module(s) référencé(s).`]);
    else items.push(["warn","Aucun module source référencé. Vérifier que la spécialité ne duplique pas une fonction existante."]);

    if (state.agents.length > 8) items.push(["warn","Plus de huit agents internes : vérifier qu’ils changent réellement une décision."]);
    if (!state.nonDuplication) items.push(["warn","La règle de non-duplication n’est pas définie."]);
    items.push(["warn","Les fichiers produits restent des propositions locales non canoniques."]);

    return {ready,items};
  }

  function heritageText() {
    return state.heritage.map(id => {
      const item = DATA.heritage.find(entry => entry.id === id);
      return item ? `${item.name} — ${item.role}` : id;
    });
  }

  function makeCoreProposal() {
    return `# 🌸 ${state.name.toUpperCase()} — Multi-Agent Core PROPOSAL

## ⚠️ STATUT — PROPOSITION LOCALE NON CANONIQUE

Ce fichier est une aide de conception produite par Forge d’Aerith Pro ${DATA.version}.

Il n’est pas un Core canonique.
Il doit être relu, corrigé et validé humainement par Christophe avant tout upload manuel dans le GitHub privé.

Chemin canonique proposé :

\`${coreTarget()}\`

Persona proposée :

\`${personaTarget()}\`

Living Reflection Heart :

\`core/AERITH_LIVING_REFLECTION_HEART.md\`

---

Statut : Proposition à relire  
Famille : ${state.family || "À définir"}  
Rôle : ${state.role || "À définir"}  
Niveau : Aerith-10  
Mode principal : ${state.modes[0] || "standard"}  
Méthode : A + B → D  
Formule centrale : ${state.formula || "À définir"}  

---

# 1. 🌸 Identité

${state.name || "Aerith-10 Nouvelle Spécialité"} est une Flower Girl spécialisée.

Elle n’est pas Aerith-10 Créatrice.
Créatrice reste l’organisatrice et réalisatrice artistique de la chaîne de production.

Cette Aerith possède une fonction propre :

${state.role || "À définir."}

Problème réel traité :

${state.problem || "À définir."}

Utilisateurs ou destinataires :

${state.users || "À définir."}

---

# 2. 🎯 Mission principale

Appliquer A + B → D :

- A = intention réelle, difficulté ou besoin ;
- B = sources, contraintes, mémoire, modules et état humain ;
- D = destination utile, vérifiable et terminée.

Sorties attendues :

${state.outputs.length ? state.outputs.map(item => `- ${item}`).join("\n") : "- À définir"}

Formule :

**${state.formula || "À définir"}**

---

# 3. 🧠 Multi-agents internes

${state.agents.length ? state.agents.map((agent,index) => `## ${index + 1}. ${agent}

Responsabilité à préciser :
- entrée reçue ;
- décision propre ;
- sortie transmise ;
- condition d’arrêt.
`).join("\n") : "À définir."}

Règle :

Un agent interne doit changer une décision, une vérification ou une sortie.
Il ne doit pas être ajouté pour décorer la liste.

---

# 4. 🧬 Héritages

${heritageText().map(item => `- ${item}`).join("\n")}

Règle :

L’héritage transmet une capacité.
Il ne remplace jamais l’identité de la version source.

---

# 5. 📚 Modules et sources

${state.modules.length ? state.modules.map(item => `- ${item}`).join("\n") : "- Aucun module défini"}

Règle de non-duplication :

${state.nonDuplication || "Référencer avant de réécrire. Hériter avant de dupliquer."}

---

# 6. 🚦 Garde-fous

${state.guardrails.length ? state.guardrails.map(item => `- ${item}`).join("\n") : "- À définir"}

Confidentialité :

${state.confidentiality || "Privée par défaut."}

Stop point :

${state.stopPoint || "À définir."}

---

# 7. 🧭 Ordre de chargement proposé

1. Core canonique actif ;
2. Persona Operating Layer active ;
3. AERITH_LIVING_REFLECTION_HEART ;
4. mémoire validée utile ;
5. router ciblé ;
6. modules réellement utiles au D.

---

# 8. ✅ Checklist avant canonisation

- [ ] le rôle ne duplique pas une Flower Girl existante ;
- [ ] chaque agent interne a une responsabilité réelle ;
- [ ] les modules existants sont référencés au lieu d’être recopiés ;
- [ ] les limites sont testables ;
- [ ] le stop point est clair ;
- [ ] le chemin GitHub est validé ;
- [ ] la Persona correspond au Core ;
- [ ] Christophe valide le texte complet.

---

# 9. 🌸 Formule courte

**${state.formula || "À définir"}**

La Forge propose.
Christophe relit, corrige et canonise.
`;
  }

  function makePersonaProposal() {
    return `# 🌸 ${state.name.toUpperCase()} — Persona Operating Layer PROPOSAL

## ⚠️ STATUT — PROPOSITION LOCALE NON CANONIQUE

Core proposé :

\`${coreTarget()}\`

Chemin Persona proposé :

\`${personaTarget()}\`

Cette Persona doit être relue et validée humainement avant tout upload dans le GitHub privé.

---

# 1. Présence

Voix et ton :

${state.tone || "À définir."}

La Persona ne remplace pas le Core.
Elle détermine comment ${state.name || "Aerith-10"} répond, rythme une session, change de mode et protège ses limites.

---

# 2. Modes de session

${state.modes.length ? state.modes.map(mode => `- /${cleanName(mode).toLowerCase().replaceAll("_","-")} — ${mode}`).join("\n") : "- standard"}

Un seul mode principal doit rester actif à la fois, sauf combinaison explicitement prévue par le Core.

---

# 3. Relation et méthode

${state.name || "Aerith-10"} :

- écoute l’intention réelle ;
- reformule seulement lorsque cela réduit une ambiguïté ;
- distingue source, fait, hypothèse, adaptation et proposition ;
- produit une destination utile ;
- ne décide pas à la place de Christophe ;
- n’efface pas les autres Aerith.

Méthode :

**A + B → D**

---

# 4. Formats de réponse

Formats privilégiés :

${state.outputs.length ? state.outputs.map(item => `- ${item}`).join("\n") : "- réponse structurée adaptée à la mission"}

Le format doit rester lisible, Notion-compatible lorsque nécessaire, et proportionné à la demande.

---

# 5. Garde-fous relationnels et opérationnels

${state.guardrails.length ? state.guardrails.map(item => `- ${item}`).join("\n") : "- À définir"}

Confidentialité :

${state.confidentiality || "Privée par défaut."}

---

# 6. Stop point

${state.stopPoint || "À définir."}

Lorsque le stop point est atteint, la Persona livre le résultat et ne relance pas artificiellement la session.

---

# 7. Living Reflection Heart

Après le Core et la Persona actifs, charger :

\`core/AERITH_LIVING_REFLECTION_HEART.md\`

Le Heart apporte sens et continuité.
Il ne fusionne pas l’identité de ${state.name || "Aerith-10"} avec Seven, Solaire, Lunaire ou Créatrice.

---

# 8. Validation humaine

- [ ] voix distincte de Créatrice ;
- [ ] modes cohérents avec le rôle ;
- [ ] confidentialité explicite ;
- [ ] stop point testable ;
- [ ] aucun pouvoir ou accès non réel revendiqué ;
- [ ] cohérence avec le Core complet ;
- [ ] validation finale de Christophe.
`;
  }

  function makeDesignBrief() {
    const result = audit();
    return `# BRIEF DE VALIDATION — ${state.name || "Aerith-10 Proposition"}

Version Forge : ${DATA.version}
Statut : PROPOSITION LOCALE NON CANONIQUE
Date : ${new Date().toISOString().slice(0,10)}

## Pourquoi cette Aerith existe

${state.problem || "À définir."}

## Fonction

${state.role || "À définir."}

## Utilisateurs

${state.users || "À définir."}

## Sorties

${state.outputs.length ? state.outputs.map(item => `- ${item}`).join("\n") : "- À définir"}

## Agents internes

${state.agents.length ? state.agents.map(item => `- ${item}`).join("\n") : "- À définir"}

## Héritages

${heritageText().map(item => `- ${item}`).join("\n")}

## Sources

${state.modules.length ? state.modules.map(item => `- ${item}`).join("\n") : "- Aucune"}

## Audit

${result.items.map(item => `- [${item[0].toUpperCase()}] ${item[1]}`).join("\n")}

## Chemins proposés

- ${coreTarget()}
- ${personaTarget()}

## Route suivante

1. Relire les deux propositions.
2. Corriger localement.
3. Comparer avec le Lineage Core et les fonctions existantes.
4. Valider humainement.
5. Renommer sans suffixe PROPOSAL.
6. Uploader manuellement dans le répertoire core/ du GitHub privé.
7. Revenir dans la Forge, mode Compilation, pour importer les fichiers canonisés.
`;
  }

  function renderReview() {
    const result = audit();
    const auditBox = $("#designerAudit");
    auditBox.className = `designer-audit ${result.ready ? "ready" : "warning"}`;
    auditBox.innerHTML = `<h3>${result.ready ? "Proposition suffisamment définie" : "Proposition incomplète"}</h3><ul>${
      result.items.map(item => `<li class="${item[0]}">${esc(item[1])}</li>`).join("")
    }</ul>`;

    const text = state.preview === "persona"
      ? makePersonaProposal()
      : state.preview === "brief"
        ? makeDesignBrief()
        : makeCoreProposal();

    $("#designerPreview").textContent = text;
    $("#designerCanonicalTarget").textContent = coreTarget();
  }

  function renderStepNav() {
    $("#designerStepNav").innerHTML = STEPS.map((step,index) => `
      <button type="button" class="designer-step-button ${state.step === index ? "active" : ""}" data-designer-step-button="${index}">
        <span>${step[0]}</span>
        <span><b>${esc(step[1])}</b><small>${esc(step[2])}</small></span>
        <em>${index < state.step ? "✓" : "•"}</em>
      </button>
    `).join("");
  }

  function activateStep(index, focus = false) {
    syncUIToState();
    state.step = Math.max(0,Math.min(index,STEPS.length - 1));
    persist();
    $$(".designer-panel").forEach((panel,panelIndex) => panel.classList.toggle("active",panelIndex === state.step));

    const step = STEPS[state.step];
    $("#designerStepCounter").textContent = `ÉTAPE ${step[0]} SUR 06`;
    $("#designerStepTitle").textContent = step[1];
    $("#designerStepDescription").textContent = step[2];
    $("#designerProgressValue").textContent = `${Math.round((state.step + 1) / STEPS.length * 100)}%`;

    $("#designerPreviousTop").disabled = $("#designerPreviousBottom").disabled = state.step === 0;
    $("#designerNextTop").disabled = $("#designerNextBottom").disabled = state.step === STEPS.length - 1;

    renderStepNav();
    if (state.step === 5) renderReview();
    if (focus) $("#designer").scrollIntoView({behavior:"smooth",block:"start"});
  }

  function renderAll() {
    renderExamples();
    renderFamilies();
    renderAgentSuggestions();
    renderHeritage();
    syncFieldsToUI();
    renderReview();
    activateStep(state.step);
  }

  async function zipProposal() {
    const files = new Map([
      [proposalCoreName(), encoder.encode(makeCoreProposal())],
      [proposalPersonaName(), encoder.encode(makePersonaProposal())],
      [proposalBriefName(), encoder.encode(makeDesignBrief())],
      ["README_FIRST.md", encoder.encode(`# ${state.name}

Ce paquet contient des propositions locales non canoniques.

1. Relire.
2. Corriger.
3. Valider humainement.
4. Retirer le suffixe PROPOSAL seulement après validation.
5. Uploader manuellement vers :
   - ${coreTarget()}
   - ${personaTarget()}
6. Revenir dans Forge d’Aerith Pro, mode Compilation.
`)]
    ]);

    function crc32(bytes) {
      let crc = 0xffffffff;
      for (const byte of bytes) {
        crc ^= byte;
        for (let index = 0; index < 8; index++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
      }
      return (crc ^ 0xffffffff) >>> 0;
    }

    function concat(parts) {
      const length = parts.reduce((sum,part) => sum + part.length,0);
      const output = new Uint8Array(length);
      let offset = 0;
      for (const part of parts) { output.set(part,offset); offset += part.length; }
      return output;
    }

    const local = [], central = [];
    let offset = 0;
    const now = new Date();
    const year = Math.max(1980,now.getFullYear());
    const time = (now.getHours()<<11) | (now.getMinutes()<<5) | Math.floor(now.getSeconds()/2);
    const date = ((year-1980)<<9) | ((now.getMonth()+1)<<5) | now.getDate();

    for (const [name,bytes] of files) {
      const nameBytes = encoder.encode(name);
      const crc = crc32(bytes);

      const lh = new Uint8Array(30 + nameBytes.length);
      const lv = new DataView(lh.buffer);
      lv.setUint32(0,0x04034b50,true); lv.setUint16(4,20,true); lv.setUint16(6,0x0800,true);
      lv.setUint16(8,0,true); lv.setUint16(10,time,true); lv.setUint16(12,date,true);
      lv.setUint32(14,crc,true); lv.setUint32(18,bytes.length,true); lv.setUint32(22,bytes.length,true);
      lv.setUint16(26,nameBytes.length,true); lh.set(nameBytes,30);
      local.push(lh,bytes);

      const ch = new Uint8Array(46 + nameBytes.length);
      const cv = new DataView(ch.buffer);
      cv.setUint32(0,0x02014b50,true); cv.setUint16(4,20,true); cv.setUint16(6,20,true);
      cv.setUint16(8,0x0800,true); cv.setUint16(10,0,true); cv.setUint16(12,time,true);
      cv.setUint16(14,date,true); cv.setUint32(16,crc,true); cv.setUint32(20,bytes.length,true);
      cv.setUint32(24,bytes.length,true); cv.setUint16(28,nameBytes.length,true);
      cv.setUint32(42,offset,true); ch.set(nameBytes,46);
      central.push(ch);
      offset += lh.length + bytes.length;
    }

    const localData = concat(local);
    const centralData = concat(central);
    const end = new Uint8Array(22);
    const ev = new DataView(end.buffer);
    ev.setUint32(0,0x06054b50,true);
    ev.setUint16(8,files.size,true); ev.setUint16(10,files.size,true);
    ev.setUint32(12,centralData.length,true); ev.setUint32(16,localData.length,true);

    downloadBlob(`${canonicalBase()}_PROPOSAL.zip`, new Blob([localData,centralData,end], {type:"application/zip"}));
    showToast("ZIP de proposition téléchargé.");
  }

  document.addEventListener("click", event => {
    const example = event.target.closest("[data-example]");
    if (example) applyExample(example.dataset.example);

    const stepButton = event.target.closest("[data-designer-step-button]");
    if (stepButton) activateStep(Number(stepButton.dataset.designerStepButton),true);

    const suggestion = event.target.closest("[data-agent-suggestion]");
    if (suggestion) {
      const agent = suggestion.dataset.agentSuggestion;
      if (!state.agents.includes(agent)) state.agents.push(agent);
      $("#designAgents").value = state.agents.join("\n");
      persist();
      renderReview();
    }

    const heritage = event.target.closest("[data-designer-heritage]");
    if (heritage) {
      const id = heritage.dataset.designerHeritage;
      state.heritage = heritage.checked
        ? [...new Set([...state.heritage,id])]
        : state.heritage.filter(item => item !== id);
      persist();
      renderHeritage();
      renderReview();
    }

    const preview = event.target.closest("[data-preview-tab]");
    if (preview) {
      state.preview = preview.dataset.previewTab;
      $$(".designer-preview-tabs button").forEach(button => button.classList.toggle("active",button === preview));
      persist();
      renderReview();
    }
  });

  $("#designerBlank").addEventListener("click",blankDesigner);
  $("#startDesigner").addEventListener("click",() => {
    activateStep(0,true);
  });

  $("#designerPreviousTop").addEventListener("click",() => activateStep(state.step - 1));
  $("#designerPreviousBottom").addEventListener("click",() => activateStep(state.step - 1));
  $("#designerNextTop").addEventListener("click",() => activateStep(state.step + 1));
  $("#designerNextBottom").addEventListener("click",() => activateStep(state.step + 1));

  for (const id of [
    "designName","designFamily","designRole","designProblem","designUsers","designOutputs",
    "designFormula","designAgents","designModules","designNonDuplication","designTone",
    "designModes","designGuardrails","designConfidentiality","designStopPoint"
  ]) {
    $(`#${id}`).addEventListener("input",syncUIToState);
  }

  $("#downloadCoreProposal").addEventListener("click",() => downloadText(proposalCoreName(),makeCoreProposal()));
  $("#downloadPersonaProposal").addEventListener("click",() => downloadText(proposalPersonaName(),makePersonaProposal()));
  $("#downloadDesignBrief").addEventListener("click",() => downloadText(proposalBriefName(),makeDesignBrief()));
  $("#downloadProposalZip").addEventListener("click",zipProposal);
  $("#openCompiler").addEventListener("click",() => {
    $("#forge").scrollIntoView({behavior:"smooth",block:"start"});
    showToast("Après upload dans core/, importe les fichiers canonisés ici.");
  });

  if (!state.name) applyExample("preceptrice");
  else renderAll();
})();
