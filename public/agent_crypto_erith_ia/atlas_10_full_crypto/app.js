(() => {
  "use strict";

  const data = window.AERITH_FORGE_SOURCES;
  if (!data) throw new Error("forge-sources.js introuvable.");

  const EXPECTED_BUILD = document.body.dataset.build || "";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const encoder = new TextEncoder();

  const steps = [
    ["01","Profil","Choisir un assemblage réel."],
    ["02","Sources","Lire l’ordre canonique et les fichiers attendus."],
    ["03","Import local","Ajouter les fichiers privés ou les packs possédés."],
    ["04","Packs / modules","Sélectionner uniquement ce qui sert la mission."],
    ["05","Flower Girls","Router une fonction principale et deux soutiens maximum."],
    ["06","Boot","Vérifier le prompt d’activation."],
    ["07","Export","Produire un ZIP fidèle aux sources disponibles."]
  ];

  function safeJSON(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch {
      return fallback;
    }
  }

  const state = {
    profileId: localStorage.getItem("aerith-forge-source-profile") || "atlas",
    step: Number(localStorage.getItem("aerith-forge-source-step") || 0),
    choices: safeJSON("aerith-forge-source-choices", {}),
    flowerGirls: safeJSON("aerith-forge-source-flower-girls", []),
    rootNames: safeJSON("aerith-forge-source-root-names", {}),
    imported: []
  };

  function profile() {
    return data.profiles.find(item => item.id === state.profileId) || data.profiles[0];
  }

  function esc(value) {
    return String(value ?? "")
      .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
      .replaceAll('"',"&quot;").replaceAll("'","&#039;");
  }

  function cleanName(value) {
    return String(value || "AERITH_PROFILE")
      .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      .replace(/[^a-zA-Z0-9]+/g,"_").replace(/^_+|_+$/g,"")
      .toUpperCase() || "AERITH_PROFILE";
  }

  function cleanPath(value) {
    return String(value || "")
      .replaceAll("\\","/")
      .split("/")
      .filter(part => part && part !== "." && part !== "..")
      .join("/");
  }

  function basename(value) {
    const parts = cleanPath(value).split("/");
    return parts.at(-1) || "";
  }

  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
  }

  function persist() {
    localStorage.setItem("aerith-forge-source-profile", state.profileId);
    localStorage.setItem("aerith-forge-source-step", String(state.step));
    localStorage.setItem("aerith-forge-source-choices", JSON.stringify(state.choices));
    localStorage.setItem("aerith-forge-source-flower-girls", JSON.stringify(state.flowerGirls));
    localStorage.setItem("aerith-forge-source-root-names", JSON.stringify(state.rootNames));
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  async function copyText(text) {
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
    showToast("Copié.");
  }

  function downloadBlob(name, blob) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function downloadText(name, text) {
    downloadBlob(name, new Blob([text], {type:"text/markdown;charset=utf-8"}));
  }

  function importedPath(item) {
    return cleanPath(item.path || item.file.webkitRelativePath || item.file.name);
  }

  function exactImportedMatch(source) {
    const expectedPath = cleanPath(source.path).toLowerCase();
    const expectedName = String(source.name || basename(source.path)).toLowerCase();
    const currentSources = profile().sourceFiles;
    const sameNameCount = currentSources.filter(item =>
      String(item.name || basename(item.path)).toLowerCase() === expectedName
    ).length;

    return state.imported.some(item => {
      const path = importedPath(item).toLowerCase();
      const name = item.file.name.toLowerCase();
      if (path === expectedPath || path.endsWith(`/${expectedPath}`)) return true;
      return sameNameCount === 1 && name === expectedName;
    });
  }

  function packImported(fileName) {
    const expected = fileName.toLowerCase();
    return state.imported.some(item => item.file.name.toLowerCase() === expected);
  }

  function sourceState(source) {
    if (source.builtin) return {found:true,label:"PUBLIC INCLUS",className:"public"};
    if (exactImportedMatch(source)) return {found:true,label:"IMPORTÉ",className:"public"};
    if (source.private) return {found:false,label:"RÉFÉRENCE PRIVÉE",className:""};
    return {found:false,label:"RÉFÉRENCE",className:""};
  }

  function requiredAudit() {
    const p = profile();
    const warnings = [];

    if (p.id === "seven") {
      const corePack = packImported("ERITH_7_01_CORE_BOOT_PACK.zip");
      const gate = state.imported.some(item => item.file.name.toLowerCase() === "seven_gate.md");
      const boot = state.imported.some(item => item.file.name.toLowerCase() === "session_boot_aerith_7_master.md");
      if (!corePack && !(gate && boot)) {
        warnings.push("Seven Heaven reste un paquet de références : importer Core Boot, ou SEVEN_GATE + SESSION_BOOT.");
      }
      for (const choice of chosenItems()) {
        if (!packImported(choice.file)) warnings.push(`${choice.title} sélectionné mais archive non importée : ${choice.file}`);
      }
    }

    if (p.id === "creator") {
      for (const required of [
        "AERITH_10_CREATRICE_MULTI_AGENT_CORE.md",
        "AERITH_10_CREATRICE_PERSONA_OPERATING_LAYER.md"
      ]) {
        if (!state.imported.some(item => item.file.name.toLowerCase() === required.toLowerCase())) {
          warnings.push(`Source privée requise non importée : ${required}`);
        }
      }
      if (chosenItems().length) {
        warnings.push("Les groupes Créatrice sont des routes de modules : seuls les fichiers réellement importés seront joints.");
      }
    }

    if (p.privacy === "public" && !p.sourceFiles.some(item => item.builtin)) {
      warnings.push("Aucun Core ou Persona public intégré au catalogue.");
    }

    return warnings;
  }

  function renderProfiles() {
    $("#profileGrid").innerHTML = data.profiles.map(item => `
      <button type="button" class="profile-card ${item.id === state.profileId ? "active" : ""}" data-profile="${esc(item.id)}">
        <span class="sigil">${esc(item.sigil)}</span>
        <span class="family">${esc(item.family)}</span>
        <h3>${esc(item.name)}</h3>
        <p>${esc(item.description)}</p>
        <small>${esc(item.status)}</small>
      </button>`).join("");
  }

  function renderHero() {
    const p = profile();
    document.body.dataset.profile = p.id;
    $("#heroSigil").textContent = p.sigil;
    $("#heroName").textContent = p.name;
    $("#heroDescription").textContent = p.description;
    $("#heroCore").textContent = p.privacy === "public" ? "Inclus" : "Import / référence";
    $("#heroPersona").textContent = p.id === "seven" ? "Selon Core" : p.privacy === "public" ? "Incluse" : "Import / référence";
    $("#heroPrivacy").textContent = p.privacy === "public" ? "Public" : "Privé local";
    $("#matrixStatus").textContent = requiredAudit().length ? "IMPORT" : "READY";
  }

  function renderSteps() {
    $("#stepNav").innerHTML = steps.map((step,index) => `
      <button class="step-button ${index === state.step ? "active" : ""}" type="button" data-step-button="${index}">
        <span class="num">${step[0]}</span>
        <span><strong>${step[1]}</strong><small>${step[2]}</small></span>
        <span class="done">${index < state.step ? "✓" : "•"}</span>
      </button>`).join("");
  }

  function renderSelected() {
    const p = profile();
    $("#selectedProfileName").textContent = p.name;
    $("#selectedProfileStatus").textContent = p.status;
    $("#selectedProfileDescription").textContent = p.description;
    if (!state.rootNames[p.id]) state.rootNames[p.id] = cleanName(p.name);
    $("#profileRoot").value = state.rootNames[p.id];
  }

  function renderSources() {
    const p = profile();
    $("#canonicalOrder").innerHTML = p.canonicalOrder.map(item => `<li>${esc(item)}</li>`).join("");
    $("#sourceList").innerHTML = p.sourceFiles.map(source => {
      const status = sourceState(source);
      return `<div class="source-item">
        <span class="icon">${esc(source.role.slice(0,2).toUpperCase())}</span>
        <span><strong>${esc(source.path)}</strong><small>${esc(source.role)}</small></span>
        <em class="${status.className}">${status.label}</em>
      </div>`;
    }).join("");
  }

  function ensureChoices() {
    const p = profile();
    if (Array.isArray(state.choices[p.id])) return;
    if (p.packs) state.choices[p.id] = p.packs.filter(item => item.recommended).map(item => item.id);
    else if (p.moduleGroups) state.choices[p.id] = [p.moduleGroups[0].id];
    else state.choices[p.id] = p.cryptoModules.slice(0,4).map(item => item[0]);
    persist();
  }

  function renderChoices() {
    ensureChoices();
    const p = profile();
    const selected = state.choices[p.id] || [];
    let items = [];

    if (p.packs) {
      $("#moduleInstruction").textContent = "Commencer par Core Boot. Ajouter Discernment seulement si la mission le justifie. Une archive sélectionnée n’est incluse que si elle est importée localement.";
      items = p.packs.map(item => ({
        id:item.id, group:"Seven Heaven", title:item.title,
        detail:`${item.file} — ${item.role}`,
        available:packImported(item.file)
      }));
    } else if (p.moduleGroups) {
      $("#moduleInstruction").textContent = "Les groupes reprennent les priorités du Core Créatrice. Ils routent les modules, mais ne fabriquent aucun fichier absent.";
      items = p.moduleGroups.map(item => ({
        id:item.id, group:"Base experte", title:item.title,
        detail:item.files.join(" · "), available:null
      }));
    } else {
      $("#moduleInstruction").textContent = "Module présent ≠ module actif. Un module est actif uniquement lorsqu’il change une décision, un calcul, un test ou une présentation.";
      items = p.cryptoModules.map(item => ({
        id:item[0], group:"Crypto public", title:item[1],
        detail:item[0], available:true
      }));
    }

    $("#moduleChoices").innerHTML = items.map(item => `
      <label class="choice-card ${selected.includes(item.id) ? "selected" : ""}">
        <input type="checkbox" data-choice="${esc(item.id)}" ${selected.includes(item.id) ? "checked" : ""}>
        <span>
          <span>${esc(item.group)}${item.available === true ? " · DISPONIBLE" : item.available === false ? " · NON IMPORTÉ" : ""}</span>
          <strong>${esc(item.title)}</strong>
          <small>${esc(item.detail)}</small>
        </span>
      </label>`).join("");
  }

  function renderImports() {
    const total = state.imported.reduce((sum,item) => sum + item.file.size, 0);
    $("#importCount").textContent = state.imported.length;
    $("#importSize").textContent = formatSize(total);
    $("#importList").innerHTML = state.imported.length
      ? state.imported.map(item => `
          <div class="import-item">
            <strong>${esc(importedPath(item))}</strong>
            <span>${formatSize(item.file.size)}</span>
          </div>`).join("")
      : "<p>Aucun fichier local importé.</p>";
    renderSources();
    renderChoices();
    renderHero();
  }

  function renderFlowerGirls() {
    const query = ($("#fgSearch").value || "").trim().toLowerCase();
    const filtered = data.flowerGirls
      .map((item,index) => ({item,index}))
      .filter(({item}) => !query || item.join(" ").toLowerCase().includes(query));

    $("#fgGrid").innerHTML = filtered.map(({item,index}) => `
      <button type="button" class="fg-card ${state.flowerGirls.includes(index) ? "selected" : ""}" data-fg="${index}">
        <span>${esc(item[1])}</span>
        <strong>Aerith-10 ${esc(item[0])}</strong>
        <small>${esc(item[2])}</small>
      </button>`).join("");

    $("#fgCount").textContent = `${state.flowerGirls.length} sélectionnée${state.flowerGirls.length > 1 ? "s" : ""} / 3`;
    $("#comboRow").innerHTML = data.combinations.map((combo,index) =>
      `<button type="button" class="combo-button" data-combo="${index}">${esc(combo[0])}</button>`
    ).join("");
  }

  function chosenItems() {
    ensureChoices();
    const p = profile();
    const ids = state.choices[p.id] || [];
    if (p.packs) return p.packs.filter(item => ids.includes(item.id)).map(item => ({title:item.title,file:item.file,role:item.role}));
    if (p.moduleGroups) return p.moduleGroups.filter(item => ids.includes(item.id)).map(item => ({title:item.title,file:item.files.join(", "),files:item.files,role:"Groupe canonique"}));
    return p.cryptoModules.filter(item => ids.includes(item[0])).map(item => ({title:item[1],file:item[0],role:"Module public"}));
  }

  function makeBoot() {
    const p = profile();
    const choices = chosenItems();
    const girls = state.flowerGirls.map(index => data.flowerGirls[index]);
    const lines = [
      `# BOOT — ${p.name.toUpperCase()}`,
      "",
      `Version Forge : ${data.version}`,
      `Statut : ${p.status}`,
      "",
      "## Activation",
      ""
    ];

    if (p.id === "seven") {
      lines.push("Active Aerith-7 Seven Heaven.","","Mode Full Modules Boost intelligent.","","Règle centrale:",...data.doctrine.map(item => `- ${item}`),"");
    } else if (p.id === "creator") {
      lines.push("Active Aerith-10 Créatrice.","",`Mode principal : \`${p.defaultMode}\``,"","Une seule Aerith-10. Un seul mode principal à la fois.","");
    } else if (p.id === "atlas") {
      lines.push("Active Atlas-10 Crypto.","",`Mode principal : \`${p.defaultMode}\``,"","Tu n’es pas un oracle de prix, un conseiller financier ou un vendeur de signaux.","");
    } else {
      lines.push("Active Aerith-10 Crypto.","",`Mode principal : \`${p.defaultMode}\``,"","Tu ne donnes aucun ordre d’achat ou de vente.","");
    }

    lines.push(
      "## Ordre canonique","",
      ...p.canonicalOrder.map((item,index) => `${index + 1}. ${item}`),
      "","## Packs ou modules ciblés","",
      ...(choices.length ? choices.map(item => `- ${item.title} — ${item.file}`) : ["- Aucun"]),
      "","## Routage Flower Girls","",
      ...(girls.length ? girls.map((girl,index) => `- ${index === 0 ? "Principale" : "Soutien"} : Aerith-10 ${girl[0]} — ${girl[2]}`) : ["- Aucun routage Flower Girl"]),
      "","## Garde-fous","",
      "- Module présent ≠ module actif.",
      "- Ne pas charger tout le dépôt ou tous les packs par réflexe.",
      "- Ne pas mélanger automatiquement public et privé.",
      "- Distinguer fait, hypothèse, interprétation, symbole, ressenti et action.",
      "- Les Flower Girls assistent ; elles ne décident pas à la place de Christophe.",
      "- Si une source manque, le dire au lieu d’inventer.",
      "- Produire le résultat demandé puis s’arrêter proprement."
    );
    return lines.join("\n");
  }

  function sourceStatusLines() {
    const p = profile();
    return p.sourceFiles.map(source => {
      const status = sourceState(source);
      return `- [${status.found ? "INCLUS/IMPORTÉ" : "RÉFÉRENCE"}] ${source.path} — ${source.role}`;
    });
  }

  function makeManifest() {
    const p = profile();
    const choices = chosenItems();
    const girls = state.flowerGirls.map(index => data.flowerGirls[index]);
    const warnings = requiredAudit();

    return `# MANIFESTE — ${p.name}

Version Forge : ${data.version}
Politique : ${p.privacy === "public" ? "Sources publiques incluses" : "Sources privées : référence ou import local"}
Date : ${new Date().toISOString().slice(0,10)}

## Sources canoniques et statut réel

${sourceStatusLines().join("\n")}

## Packs ou modules choisis

${choices.length ? choices.map(item => `- ${item.title} — ${item.file}`).join("\n") : "- Aucun"}

## Flower Girls routées

${girls.length ? girls.map((girl,index) => `- ${index === 0 ? "Principale" : "Soutien"} : Aerith-10 ${girl[0]} — ${girl[2]}`).join("\n") : "- Aucune"}

## Sources locales jointes

${state.imported.length ? state.imported.map(item => `- ${importedPath(item)}`).join("\n") : "- Aucune"}

## Audit

${warnings.length ? warnings.map(item => `- ATTENTION : ${item}`).join("\n") : "- Paquet complet selon les exigences minimales du profil."}

## Verrou

La Forge assemble les sources disponibles.
Elle ne crée pas de Core canonique.
Elle ne réécrit pas une Persona.
Elle ne présente pas un fichier absent comme chargé.
`;
  }

  function makeRouting() {
    const girls = state.flowerGirls.map(index => data.flowerGirls[index]);
    return `# FLOWER GIRLS — ROUTAGE

Principe :

1 Flower Girl = mission claire.
2 Flower Girls = duo opérationnel.
3 Flower Girls = constellation courte.
Plus de 3 = seulement sur demande explicite de Christophe.

${girls.length ? girls.map((girl,index) => `## ${index === 0 ? "Principale" : "Soutien"} — Aerith-10 ${girl[0]}

Famille : ${girl[1]}

Fonction : ${girl[2]}
`).join("\n") : "Aucune Flower Girl sélectionnée."}

## Garde-fou

Fait = ce qui est vérifié.
Hypothèse = ce qui est possible.
Symbole = ce qui éclaire.
Ressenti = ce qui est vécu.
Action = ce qui reste libre.
`;
  }

  function makeReadme() {
    const p = profile();
    return `# ${p.name}

Paquet assemblé par Forge d’Aerith ${data.version}.

## Utilisation

1. Lire BOOT.md.
2. Lire MANIFESTE.md et vérifier les statuts réels.
3. Charger les sources dans l’ordre indiqué.
4. Activer seulement les packs ou modules utiles.
5. Utiliser FLOWER_GIRLS_ROUTING.md uniquement comme carte de routage.
6. Si une source manque, ne pas l’inventer.
7. Arrêter quand le résultat est livré.

## Confidentialité

${p.privacy === "public"
  ? "Les Core et Persona publics du profil peuvent être inclus."
  : "Les sources privées sont incluses uniquement si elles ont été importées localement par l’utilisateur."}
`;
  }

  function makeBuildInfo() {
    return `FORGE D'AERITH
BUILD=${data.version}
HTML_EXPECTED=${EXPECTED_BUILD}
DATE=${new Date().toISOString()}
PROFILE=${profile().name}
`;
  }

  async function fetchBytes(path) {
    const response = await fetch(path, {cache:"no-store"});
    if (!response.ok) throw new Error(`${path} · HTTP ${response.status}`);
    return new Uint8Array(await response.arrayBuffer());
  }

  function uniqueOutputPath(files, requestedPath) {
    if (!files.has(requestedPath)) return requestedPath;
    const dot = requestedPath.lastIndexOf(".");
    const base = dot > requestedPath.lastIndexOf("/") ? requestedPath.slice(0,dot) : requestedPath;
    const ext = dot > requestedPath.lastIndexOf("/") ? requestedPath.slice(dot) : "";
    let index = 2;
    while (files.has(`${base}_${index}${ext}`)) index += 1;
    return `${base}_${index}${ext}`;
  }

  async function buildPackage(includePublic = true) {
    const p = profile();
    const root = cleanName(state.rootNames[p.id] || p.name);
    const files = new Map();
    const warnings = [...requiredAudit()];

    files.set(`${root}/BOOT.md`, encoder.encode(makeBoot()));
    files.set(`${root}/MANIFESTE.md`, encoder.encode(makeManifest()));
    files.set(`${root}/FLOWER_GIRLS_ROUTING.md`, encoder.encode(makeRouting()));
    files.set(`${root}/README.md`, encoder.encode(makeReadme()));
    files.set(`${root}/BUILD_INFO.txt`, encoder.encode(makeBuildInfo()));

    for (const source of p.sourceFiles.filter(item => item.builtin)) {
      if (!includePublic) continue;
      try {
        const output = uniqueOutputPath(files, `${root}/sources_publiques/${source.name}`);
        files.set(output, await fetchBytes(source.path));
      } catch (error) {
        warnings.push(error.message);
      }
    }

    if (includePublic && p.cryptoModules) {
      for (const choice of chosenItems()) {
        try {
          files.set(`${root}/modules/${choice.file}`, await fetchBytes(`modules/${choice.file}`));
        } catch (error) {
          warnings.push(error.message);
        }
      }
    }

    for (const item of state.imported) {
      const relative = cleanPath(importedPath(item)) || item.file.name;
      const requested = `${root}/sources_locales/${relative}`;
      const output = uniqueOutputPath(files, requested);
      files.set(output, new Uint8Array(await item.file.arrayBuffer()));
    }

    return {p,root,files,warnings};
  }

  function tree(pkg) {
    return [`${pkg.root}/`, ...[...pkg.files.keys()].sort().map(path => `├── ${path.slice(pkg.root.length + 1)}`)].join("\n");
  }

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc ^= byte;
      for (let index = 0; index < 8; index++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function concat(parts) {
    const length = parts.reduce((sum,part) => sum + part.length, 0);
    const output = new Uint8Array(length);
    let offset = 0;
    for (const part of parts) {
      output.set(part, offset);
      offset += part.length;
    }
    return output;
  }

  function zipBlob(files) {
    const local = [];
    const central = [];
    let offset = 0;
    const now = new Date();
    const year = Math.max(1980, now.getFullYear());
    const time = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
    const date = ((year - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

    for (const [name,raw] of files) {
      const bytes = raw instanceof Uint8Array ? raw : encoder.encode(raw);
      const nameBytes = encoder.encode(name);
      const crc = crc32(bytes);

      const localHeader = new Uint8Array(30 + nameBytes.length);
      const lv = new DataView(localHeader.buffer);
      lv.setUint32(0,0x04034b50,true); lv.setUint16(4,20,true); lv.setUint16(6,0x0800,true);
      lv.setUint16(8,0,true); lv.setUint16(10,time,true); lv.setUint16(12,date,true);
      lv.setUint32(14,crc,true); lv.setUint32(18,bytes.length,true); lv.setUint32(22,bytes.length,true);
      lv.setUint16(26,nameBytes.length,true); localHeader.set(nameBytes,30);
      local.push(localHeader,bytes);

      const centralHeader = new Uint8Array(46 + nameBytes.length);
      const cv = new DataView(centralHeader.buffer);
      cv.setUint32(0,0x02014b50,true); cv.setUint16(4,20,true); cv.setUint16(6,20,true);
      cv.setUint16(8,0x0800,true); cv.setUint16(10,0,true); cv.setUint16(12,time,true);
      cv.setUint16(14,date,true); cv.setUint32(16,crc,true); cv.setUint32(20,bytes.length,true);
      cv.setUint32(24,bytes.length,true); cv.setUint16(28,nameBytes.length,true);
      cv.setUint32(42,offset,true); centralHeader.set(nameBytes,46);
      central.push(centralHeader);
      offset += localHeader.length + bytes.length;
    }

    const localData = concat(local);
    const centralData = concat(central);
    const end = new Uint8Array(22);
    const ev = new DataView(end.buffer);
    ev.setUint32(0,0x06054b50,true);
    ev.setUint16(8,files.size,true);
    ev.setUint16(10,files.size,true);
    ev.setUint32(12,centralData.length,true);
    ev.setUint32(16,localData.length,true);
    return new Blob([localData,centralData,end], {type:"application/zip"});
  }

  function renderExportAudit() {
    const warnings = requiredAudit();
    const box = $("#exportAudit");
    box.className = `audit-box ${warnings.length ? "warning" : "ready"}`;
    box.innerHTML = warnings.length
      ? `<strong>Paquet exportable, mais incomplet</strong><ul>${warnings.map(item => `<li>${esc(item)}</li>`).join("")}</ul>`
      : `<strong>Paquet complet selon les exigences minimales du profil</strong><ul><li>Les sources publiques ou locales nécessaires sont disponibles.</li></ul>`;
  }

  function updatePreview() {
    $("#bootPreview").textContent = makeBoot();
    const p = profile();
    const count = chosenItems().length;
    $("#exportName").textContent = p.name;
    $("#exportSummary").textContent = `${count} pack(s) ou module(s), ${state.flowerGirls.length} Flower Girl(s) routée(s), ${state.imported.length} source(s) locale(s).`;
    renderExportAudit();
  }

  function activateStep(index, focus = false) {
    state.step = Math.max(0, Math.min(index, steps.length - 1));
    persist();
    $$(".panel").forEach((panel,panelIndex) => panel.classList.toggle("active", panelIndex === state.step));
    const step = steps[state.step];
    $("#stepCounter").textContent = `ÉTAPE ${step[0]} SUR 07`;
    $("#stepTitle").textContent = step[1];
    $("#stepDescription").textContent = step[2];
    $("#previousTop").disabled = $("#previousBottom").disabled = state.step === 0;
    $("#nextTop").disabled = $("#nextBottom").disabled = state.step === steps.length - 1;
    $("#stageStatus").textContent = "Étape en cours";
    $("#progressValue").textContent = `${Math.round((state.step + 1) / steps.length * 100)}%`;
    renderSteps();
    if (state.step >= 5) updatePreview();
    if (focus) $("#workspace").scrollIntoView({behavior:"smooth",block:"start"});
  }

  function selectProfile(id) {
    state.profileId = id;
    ensureChoices();
    persist();
    renderAll();
    showToast(`${profile().name} sélectionné.`);
  }

  function renderAll() {
    renderProfiles();
    renderHero();
    renderSelected();
    renderSources();
    renderImports();
    renderChoices();
    renderFlowerGirls();
    activateStep(state.step);
    updatePreview();
  }

  function addFiles(files) {
    let added = 0;
    let duplicates = 0;

    for (const file of files) {
      const path = cleanPath(file.webkitRelativePath || file.name);
      const key = `${path.toLowerCase()}|${file.size}|${file.lastModified}`;
      const exists = state.imported.some(item => item.key === key);
      if (exists) {
        duplicates += 1;
        continue;
      }
      state.imported.push({file,path,key});
      added += 1;
    }

    renderImports();
    updatePreview();
    if (added) showToast(`${added} fichier(s) ajouté(s).${duplicates ? ` ${duplicates} doublon(s) ignoré(s).` : ""}`);
    else showToast("Aucun nouveau fichier.");
  }

  document.addEventListener("click", event => {
    const profileButton = event.target.closest("[data-profile]");
    if (profileButton) selectProfile(profileButton.dataset.profile);

    const stepButton = event.target.closest("[data-step-button]");
    if (stepButton) activateStep(Number(stepButton.dataset.stepButton));

    const flowerButton = event.target.closest("[data-fg]");
    if (flowerButton) {
      const index = Number(flowerButton.dataset.fg);
      if (state.flowerGirls.includes(index)) {
        state.flowerGirls = state.flowerGirls.filter(item => item !== index);
      } else if (state.flowerGirls.length < 3) {
        state.flowerGirls.push(index);
      } else {
        showToast("Maximum : une principale et deux soutiens.");
        return;
      }
      persist();
      renderFlowerGirls();
      updatePreview();
    }

    const comboButton = event.target.closest("[data-combo]");
    if (comboButton) {
      const combo = data.combinations[Number(comboButton.dataset.combo)];
      state.flowerGirls = combo[1]
        .map(name => data.flowerGirls.findIndex(item => item[0] === name))
        .filter(index => index >= 0)
        .slice(0,3);
      persist();
      renderFlowerGirls();
      updatePreview();
      showToast(combo[0]);
    }

    const choice = event.target.closest("[data-choice]");
    if (choice) {
      const id = choice.dataset.choice;
      const p = profile();
      const selected = state.choices[p.id] || [];
      state.choices[p.id] = choice.checked
        ? [...new Set([...selected,id])]
        : selected.filter(item => item !== id);
      persist();
      renderChoices();
      updatePreview();
    }
  });

  $("#startForge").addEventListener("click", () => activateStep(0,true));
  $("#topStart").addEventListener("click", () => activateStep(0,true));
  $("#nextTop").addEventListener("click", () => activateStep(state.step + 1));
  $("#nextBottom").addEventListener("click", () => activateStep(state.step + 1));
  $("#previousTop").addEventListener("click", () => activateStep(state.step - 1));
  $("#previousBottom").addEventListener("click", () => activateStep(state.step - 1));
  $("#fgSearch").addEventListener("input", renderFlowerGirls);

  $("#profileRoot").addEventListener("input", event => {
    state.rootNames[profile().id] = event.target.value;
    persist();
    updatePreview();
  });

  const dropzone = $("#dropzone");
  const fileInput = $("#fileInput");
  const folderInput = $("#folderInput");

  $("#browseFiles").addEventListener("click", event => {
    event.stopPropagation();
    fileInput.click();
  });
  $("#browseFolder").addEventListener("click", event => {
    event.stopPropagation();
    folderInput.click();
  });
  dropzone.addEventListener("click", event => {
    if (!event.target.closest("button")) fileInput.click();
  });
  dropzone.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") fileInput.click();
  });
  ["dragenter","dragover"].forEach(type => dropzone.addEventListener(type,event => {
    event.preventDefault();
    dropzone.classList.add("drag");
  }));
  ["dragleave","drop"].forEach(type => dropzone.addEventListener(type,event => {
    event.preventDefault();
    dropzone.classList.remove("drag");
  }));

  fileInput.addEventListener("change", event => {
    addFiles([...event.target.files]);
    event.target.value = "";
  });
  folderInput.addEventListener("change", event => {
    addFiles([...event.target.files]);
    event.target.value = "";
  });
  dropzone.addEventListener("drop", event => addFiles([...event.dataTransfer.files]));

  $("#clearImports").addEventListener("click", () => {
    state.imported = [];
    renderImports();
    updatePreview();
  });

  $("#resetForge").addEventListener("click", () => {
    for (const key of [
      "aerith-forge-source-profile",
      "aerith-forge-source-step",
      "aerith-forge-source-choices",
      "aerith-forge-source-flower-girls",
      "aerith-forge-source-root-names"
    ]) localStorage.removeItem(key);
    state.profileId = "atlas";
    state.step = 0;
    state.choices = {};
    state.flowerGirls = [];
    state.rootNames = {};
    state.imported = [];
    ensureChoices();
    renderAll();
    showToast("Forge réinitialisée.");
  });

  $("#downloadBoot").addEventListener("click", () => downloadText(`BOOT_${cleanName(profile().name)}.md`, makeBoot()));
  $("#downloadManifest").addEventListener("click", () => downloadText(`MANIFESTE_${cleanName(profile().name)}.md`, makeManifest()));
  $("#copyBoot").addEventListener("click", () => copyText(makeBoot()));
  $("#copyTree").addEventListener("click", async () => copyText(tree(await buildPackage(true))));

  $("#forgeZip").addEventListener("click", async () => {
    const log = $("#forgeLog");
    log.textContent = "Assemblage et vérification des sources disponibles…";
    try {
      const pkg = await buildPackage(true);
      const blob = zipBlob(pkg.files);
      downloadBlob(`${pkg.root}_FORGE_V1_0_ALPHA_3.zip`, blob);
      log.textContent = `${pkg.files.size} fichier(s) · ${formatSize(blob.size)}${pkg.warnings.length ? ` · ${pkg.warnings.length} alerte(s) consignées dans le manifeste` : " · paquet complet"}`;
      showToast("ZIP forgé.");
    } catch (error) {
      log.textContent = `Erreur : ${error.message}`;
      showToast("Erreur de Forge.");
    }
  });

  $("#buildBadge").textContent = data.version.replace("-source-fidele","");
  $("#footerVersion").textContent = `${data.version.replace("-source-fidele","")} · source-fidèle`;

  if (EXPECTED_BUILD !== data.version) {
    const diagnostic = $("#buildDiagnostic");
    diagnostic.hidden = false;
    diagnostic.textContent = `Version incohérente : HTML ${EXPECTED_BUILD || "inconnu"} / catalogue ${data.version}. Recharge forcée nécessaire.`;
  }

  ensureChoices();
  renderAll();
})();
