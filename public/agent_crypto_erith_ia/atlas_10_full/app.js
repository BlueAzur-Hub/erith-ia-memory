(() => {
  "use strict";

  const DATA = window.AERITH_FORGE_PRO_DATA;
  if (!DATA) throw new Error("forge-data.js introuvable.");

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const encoder = new TextEncoder();
  const PRIVATE_REPO = "BlueAzur-Hub/erith-ia-notion-archive-private";
  const PUBLIC_REPO = "BlueAzur-Hub/erith-ia-memory";
  const GITHUB_BRANCH = "main";
  const FORGE_PUBLIC_REPO_PATH = "public/agent_crypto_erith_ia/atlas_10_full";
  const steps = [
    ["01","Identité","Choisir un profil canonique ou définir un nouvel Aerith-10."],
    ["02","Sources","Importer Core, Persona, image et modules."],
    ["03","Analyse","Lire les métadonnées et confirmer la référence privée."],
    ["04","Héritages","Sélectionner Seven, Solaire, Lunaire et les modules utiles."],
    ["05","Thème","Associer un langage visuel sans modifier le Core."],
    ["06","Audit","Vérifier les manques et le Boot."],
    ["07","Export","Produire un ZIP professionnel et traçable."]
  ];

  const state = {
    mode: "custom",
    profileId: "seven",
    step: 0,
    imports: [],
    modules: [],
    heritage: ["seven"],
    theme: "creator",
    canonicalConfirmed: false,
    custom: {
      name: "Aerith-10 Nouvelle Spécialité",
      family: "Filles d’Aerith",
      level: "Aerith-10",
      mode: "",
      role: "",
      version: "",
      status: "",
      compatibility: "",
      personaPath: "",
      memoryPath: "",
      corePath: "",
      imagePath: "",
      update: "",
      exportRoot: "AERITH_10_NOUVELLE_SPECIALITE"
    },
    parsed: {},
    visualUrl: ""
  };

  function profile() {
    return DATA.profiles.find(item => item.id === state.profileId) || DATA.profiles[0];
  }

  function esc(value) {
    return String(value ?? "")
      .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
      .replaceAll('"',"&quot;").replaceAll("'","&#039;");
  }

  function cleanName(value) {
    return String(value || "AERITH_10_PROFILE")
      .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      .replace(/[^a-zA-Z0-9]+/g,"_").replace(/^_+|_+$/g,"")
      .toUpperCase() || "AERITH_10_PROFILE";
  }

  function cleanPath(value) {
    return String(value || "").replaceAll("\\","/").split("/")
      .filter(part => part && part !== "." && part !== "..").join("/");
  }

  function basename(value) {
    return cleanPath(value).split("/").at(-1) || "";
  }

  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
  }

  function encodeRepoPath(value) {
    return cleanPath(value).split("/").map(part => encodeURIComponent(part)).join("/");
  }

  function githubBlobUrl(repo, path) {
    return `https://github.com/${repo}/blob/${GITHUB_BRANCH}/${encodeRepoPath(path)}`;
  }

  function githubRawUrl(repo, path) {
    return `https://raw.githubusercontent.com/${repo}/${GITHUB_BRANCH}/${encodeRepoPath(path)}`;
  }

  function resolveRepoPath(value, fallbackRepo = PUBLIC_REPO) {
    let path = String(value || "").trim();
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return {repo:"external",path,url:path,raw:path};

    let repo = fallbackRepo;
    if (/^private:/i.test(path)) {
      repo = PRIVATE_REPO;
      path = path.replace(/^private:/i,"");
    } else if (/^public:/i.test(path)) {
      repo = PUBLIC_REPO;
      path = path.replace(/^public:/i,"");
    } else if (/^(core|private|packs)\//i.test(path)) {
      repo = PRIVATE_REPO;
    }

    path = cleanPath(path);
    return {
      repo,
      path,
      url: githubBlobUrl(repo,path),
      raw: githubRawUrl(repo,path)
    };
  }

  function compilerCanonicalReferences() {
    const p = state.mode === "existing" ? profile() : null;
    let corePath = "";
    let personaPath = "";
    let coreRepo = PRIVATE_REPO;
    let personaRepo = PRIVATE_REPO;

    if (state.mode === "custom") {
      corePath = state.custom.corePath || $("#canonicalPath").value || coreImport()?.path || "";
      personaPath = state.custom.personaPath || personaImport()?.path || "";
    } else if (p.privacy === "public") {
      const coreSource = p.sources.find(source => /core/i.test(source[2]) && source[4]);
      const personaSource = p.sources.find(source => /persona/i.test(source[2]) && source[4]);
      corePath = `${FORGE_PUBLIC_REPO_PATH}/${coreSource?.[1] || ""}`;
      personaPath = `${FORGE_PUBLIC_REPO_PATH}/${personaSource?.[1] || ""}`;
      coreRepo = PUBLIC_REPO;
      personaRepo = PUBLIC_REPO;
    } else {
      corePath = p.canonicalPath || "";
      personaPath = p.sources.find(source => /persona/i.test(source[2]))?.[1] || "";
    }

    const heartPath = "core/AERITH_LIVING_REFLECTION_HEART.md";
    return {
      core: corePath ? {
        repo:coreRepo,path:cleanPath(corePath),
        url:githubBlobUrl(coreRepo,corePath),raw:githubRawUrl(coreRepo,corePath)
      } : null,
      persona: personaPath ? {
        repo:personaRepo,path:cleanPath(personaPath),
        url:githubBlobUrl(personaRepo,personaPath),raw:githubRawUrl(personaRepo,personaPath)
      } : null,
      heart: {
        repo:PRIVATE_REPO,path:heartPath,
        url:githubBlobUrl(PRIVATE_REPO,heartPath),raw:githubRawUrl(PRIVATE_REPO,heartPath)
      }
    };
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
    setTimeout(() => URL.revokeObjectURL(url), 1200);
  }

  function downloadText(name, text, type = "text/markdown;charset=utf-8") {
    downloadBlob(name, new Blob([text], {type}));
  }

  function activeName() {
    return state.mode === "custom" ? state.custom.name : profile().name;
  }

  function activeRole() {
    return state.mode === "custom" ? state.custom.role : profile().role;
  }

  function activeRoot() {
    return cleanName(state.mode === "custom" ? state.custom.exportRoot || state.custom.name : profile().name);
  }

  function activeThemeVisual() {
    if (state.visualUrl) return state.visualUrl;
    const theme = DATA.themes.find(item => item[0] === state.theme);
    return theme?.[3] || (state.mode === "existing" ? profile().visual : "");
  }

  function coreImport() {
    return state.imports.find(item => item.kind === "core") || null;
  }

  function personaImport() {
    return state.imports.find(item => item.kind === "persona") || null;
  }

  function visualImport() {
    return state.imports.find(item => item.kind === "visual") || null;
  }

  function kindForFile(file, content = "") {
    const name = file.name.toUpperCase();
    if (file.type.startsWith("image/")) return "visual";
    if (name.includes("MULTI_AGENT_CORE") || /MULTI[- ]AGENT CORE/i.test(content)) return "core";
    if (name.includes("PERSONA_OPERATING_LAYER") || /PERSONA OPERATING LAYER/i.test(content)) return "persona";
    if (name.endsWith(".ZIP")) return "pack";
    if (name.endsWith(".MD")) return "module";
    if (name.endsWith(".JSON")) return "data";
    return "source";
  }

  function stripMarkdown(value) {
    return String(value || "")
      .replace(/[`*_#]/g,"")
      .replace(/^[\s🌸🧭⚠️💠◇✦]+/u,"")
      .trim();
  }

  function fieldFromText(text, labels) {
    for (const label of labels) {
      const escaped = label.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
      const regex = new RegExp(`^(?:\\\\*\\\\*)?${escaped}(?:\\\\*\\\\*)?\\\\s*:\\\\s*(.+)$`, "im");
      const match = text.match(regex);
      if (match) return stripMarkdown(match[1]);
    }
    return "";
  }

  function parseCore(text, fileName) {
    const heading = text.match(/^#\s+(.+)$/m)?.[1] || "";
    const name = stripMarkdown(heading)
      .replace(/\s+[—-]\s+Multi-Agent Core.*$/i,"")
      .replace(/^AERITH[- ]?10\s+/i,"Aerith-10 ")
      .trim();

    return {
      name: name || fileName.replace(/\.md$/i,"").replaceAll("_"," "),
      family: fieldFromText(text, ["Famille"]),
      level: fieldFromText(text, ["Niveau"]),
      role: fieldFromText(text, ["Rôle"]),
      mode: fieldFromText(text, ["Mode principal"]),
      status: fieldFromText(text, ["Statut"]),
      compatibility: fieldFromText(text, ["Compatibilité"]),
      personaPath: fieldFromText(text, ["Extension Persona"]),
      memoryPath: fieldFromText(text, ["Mémoire partagée", "Mémoire partagée requise", "Base métier publique"]),
      corePath: fieldFromText(text, ["Fichier canonique", "Fichier", "Chemin cible"]),
      imagePath: fieldFromText(text, ["Image"]),
      version: fieldFromText(text, ["Version"]),
      update: fieldFromText(text, ["Mise à jour", "Date"])
    };
  }

  function mergeParsed(parsed) {
    state.parsed = parsed;
    for (const key of ["name","family","level","role","mode","status","compatibility","personaPath","memoryPath","corePath","imagePath","version","update"]) {
      if (parsed[key]) state.custom[key] = parsed[key];
    }
    if (parsed.name) state.custom.exportRoot = cleanName(parsed.name);
    if (/créatrice/i.test(`${parsed.name} ${parsed.role}`)) state.theme = "creator";
    else if (/crypto/i.test(`${parsed.name} ${parsed.role}`)) state.theme = "crypto";
    else if (/lunaire|reflet|rêve|tarot/i.test(`${parsed.compatibility} ${parsed.role}`)) state.theme = "lunar";
    else if (/solaire|rayonnement/i.test(`${parsed.compatibility} ${parsed.role}`)) state.theme = "solar";
    else state.theme = "seven";

    const combined = `${parsed.compatibility} ${parsed.role}`.toLowerCase();
    const heritage = ["seven"];
    if (combined.includes("solaire") || combined.includes("v8")) heritage.push("solar");
    if (combined.includes("lunaire") || combined.includes("v9")) heritage.push("lunar");
    state.heritage = [...new Set(heritage)];
  }

  function renderDoctrine() {
    $("#doctrine").innerHTML = DATA.doctrine.map(item => `<span>${esc(item)}</span>`).join("");
  }

  function renderLineage() {
    $("#lineageGrid").innerHTML = DATA.lineage.map(item => `
      <article class="lineage-card lineage-card-${esc(item.id)}">
        <button class="lineage-media" type="button"
                data-lineage-image="${esc(item.visual)}"
                data-lineage-title="${esc(item.name)}"
                aria-label="Voir ${esc(item.name)} en entier">
          <img src="${esc(item.visual)}" alt="${esc(item.name)}" loading="lazy">
          <span class="lineage-zoom">Voir l’image entière ↗</span>
        </button>
        <div class="lineage-copy">
          <span>${esc(item.label)}</span>
          <h3>${esc(item.name)}</h3>
          <p>${esc(item.description)}</p>
          <small>${esc(item.formula)}</small>
        </div>
      </article>`).join("");
  }


  function openLightbox(src, title) {
    const lightbox = $("#imageLightbox");
    $("#lightboxImage").src = src;
    $("#lightboxImage").alt = title;
    $("#lightboxTitle").textContent = title;
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    $("#lightboxClose").focus();
  }

  function closeLightbox() {
    const lightbox = $("#imageLightbox");
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    $("#lightboxImage").src = "";
    document.body.classList.remove("lightbox-open");
  }

  function renderProfiles() {
    $("#profileGrid").innerHTML = DATA.profiles.map(item => `
      <button type="button" class="profile-card ${state.mode === "existing" && item.id === state.profileId ? "active" : ""} ${item.visual ? "" : "no-image"}"
              data-profile="${esc(item.id)}">
        <span class="sigil">${esc(item.sigil)}</span>
        <span class="profile-media">
          ${item.visual
            ? `<img src="${esc(item.visual)}" alt="${esc(item.name)}" loading="lazy">`
            : `<span class="profile-abstract">${esc(item.sigil)}</span>`}
        </span>
        <span class="profile-copy">
          <span class="family">${esc(item.family)}</span>
          <h3>${esc(item.name)}</h3>
          <p>${esc(item.description)}</p>
          <small>${esc(item.status)}</small>
        </span>
      </button>`).join("");
  }

  function renderMatrix() {
    const p = state.mode === "existing" ? profile() : null;
    const name = activeName();
    const description = state.mode === "custom"
      ? "Compiler un nouveau profil Aerith-10 à partir de son Core et de sa Persona déjà canonisés."
      : p.description;
    const visual = activeThemeVisual();

    document.body.dataset.theme = state.theme;
    $("#matrixName").textContent = name;
    $("#matrixDescription").textContent = description;
    $("#matrixKicker").textContent = state.mode === "custom" ? "AERITH-10 PRO BUILDER" : "PROFIL ACTIF";
    $("#matrixSymbol").textContent = state.mode === "custom" ? "A10+" : p.sigil;
    $("#matrixCore").textContent = state.mode === "custom" ? (coreImport() ? "Importé" : "Requis") : (p.privacy === "public" ? "Inclus" : "Import local");
    $("#matrixPersona").textContent = state.mode === "custom" ? (personaImport() ? "Importée" : "Requise") : (p.privacy === "public" ? "Incluse" : "Import local");
    $("#matrixState").textContent = audit().ready ? "READY" : "IMPORT";

    const image = $("#matrixImage");
    if (visual) {
      image.src = visual;
      image.hidden = false;
    } else {
      image.hidden = true;
    }
  }

  function renderIdentity() {
    const custom = state.mode === "custom";
    $("#customIdentity").hidden = !custom;
    $("#existingIdentity").hidden = custom;
    $("#identityTitle").textContent = custom ? "Nouveau type Aerith-10" : profile().name;
    $("#identityStatus").textContent = custom ? (coreImport() ? "Core détecté" : "À définir") : profile().status;
    $("#forgeModeLabel").textContent = custom ? "AERITH-10 PRO" : "PROFIL CANONIQUE";
    $("#forgeModeTitle").textContent = custom ? "Nouveau profil spécialisé" : profile().name;

    if (custom) {
      $("#customName").value = state.custom.name;
      $("#customFamily").value = state.custom.family;
      $("#customLevel").value = state.custom.level;
      $("#customMode").value = state.custom.mode;
      $("#customRole").value = state.custom.role;
      $("#exportRoot").value = state.custom.exportRoot;
    } else {
      $("#existingDescription").textContent = profile().description;
      $("#existingSigil").textContent = profile().sigil;
      $("#existingName").textContent = profile().name;
      $("#existingRole").textContent = profile().role;
    }
  }

  function expectedSources() {
    if (state.mode === "existing") return profile().sources.map(item => ({
      name:item[0], path:item[1], role:item[2], private:Boolean(item[3]), builtin:Boolean(item[4])
    }));

    return [
      {name:coreImport()?.file.name || "AERITH_10_..._MULTI_AGENT_CORE.md", path:state.custom.corePath || $("#canonicalPath").value || "core/...", role:"Core canonique", private:true, required:true, present:Boolean(coreImport())},
      {name:personaImport()?.file.name || "AERITH_10_..._PERSONA_OPERATING_LAYER.md", path:state.custom.personaPath || "core/...", role:"Persona Operating Layer", private:true, required:true, present:Boolean(personaImport())},
      {name:visualImport()?.file.name || "Visuel canonique", path:state.custom.imagePath || "assets/images/core/...", role:"Identité visuelle", private:true, required:false, present:Boolean(visualImport())}
    ];
  }

  function importedMatch(source) {
    const expectedName = String(source.name || "").toLowerCase();
    const expectedPath = cleanPath(source.path).toLowerCase();
    return state.imports.some(item => {
      const path = cleanPath(item.path).toLowerCase();
      return item.file.name.toLowerCase() === expectedName || path === expectedPath || path.endsWith(`/${expectedPath}`);
    });
  }

  function renderSourceAudit() {
    $("#sourceAuditList").innerHTML = expectedSources().map(source => {
      const present = source.builtin || source.present || importedMatch(source);
      const stateLabel = source.builtin ? "PUBLIC INCLUS" : present ? "IMPORTÉ" : source.required ? "REQUIS" : source.private ? "RÉFÉRENCE PRIVÉE" : "RÉFÉRENCE";
      const cls = present ? "ok" : source.required ? "missing" : "warn";
      return `<div class="source-row">
        <span class="source-icon">${esc(source.role.slice(0,2).toUpperCase())}</span>
        <span><b>${esc(source.path)}</b><small>${esc(source.role)}</small></span>
        <span class="source-state ${cls}">${stateLabel}</span>
      </div>`;
    }).join("");
  }

  function renderMetadata() {
    const values = state.mode === "custom"
      ? {
          "Nom":state.custom.name,"Famille":state.custom.family,"Niveau":state.custom.level,
          "Rôle":state.custom.role,"Mode":state.custom.mode,"Version":state.custom.version,
          "Persona":state.custom.personaPath,"Mémoire / base":state.custom.memoryPath,
          "Image":state.custom.imagePath,"Compatibilité":state.custom.compatibility
        }
      : {
          "Nom":profile().name,"Famille":profile().family,"Niveau":profile().level,
          "Rôle":profile().role,"Chemin canonique":profile().canonicalPath,
          "Confidentialité":profile().privacy === "public" ? "Public" : "Privé"
        };

    $("#metadataList").innerHTML = Object.entries(values).map(([key,value]) =>
      `<div><dt>${esc(key)}</dt><dd>${esc(value || "—")}</dd></div>`
    ).join("");

    $("#canonicalConfirmed").checked = state.mode === "existing" ? true : state.canonicalConfirmed;
    $("#canonicalConfirmed").disabled = state.mode === "existing";
    $("#canonicalPath").value = state.mode === "custom" ? (state.custom.corePath || "") : profile().canonicalPath;
    $("#canonicalPath").disabled = state.mode === "existing";
  }

  function renderImports() {
    const total = state.imports.reduce((sum,item) => sum + item.file.size, 0);
    $("#importCount").textContent = state.imports.length;
    $("#importSize").textContent = formatSize(total);
    $("#importList").innerHTML = state.imports.length ? state.imports.map(item => `
      <div class="import-item">
        <span class="file-tag">${esc(item.kind.slice(0,4).toUpperCase())}</span>
        <span><b>${esc(item.path)}</b><small>${esc(item.kind)}</small></span>
        <span>${formatSize(item.file.size)}</span>
      </div>`).join("") : "<p>Aucun fichier importé.</p>";
  }

  function renderHeritage() {
    const choices = DATA.lineage;
    $("#heritageGrid").innerHTML = choices.map(item => `
      <button type="button" class="heritage-card ${state.heritage.includes(item.id) ? "selected" : ""}" data-heritage="${esc(item.id)}">
        <img src="${esc(item.visual)}" alt="">
        <span>${esc(item.label)}</span><b>${esc(item.name)}</b><small>${esc(item.formula)}</small>
      </button>`).join("");

    const autoModules = state.imports
      .filter(item => ["module","pack","data","source"].includes(item.kind))
      .map(item => item.path);
    $("#detectedModules").innerHTML = autoModules.length
      ? autoModules.map(item => `<span>${esc(item)}</span>`).join("")
      : "<span>Aucun module complémentaire détecté.</span>";
    $("#manualModules").value = state.modules.join("\n");
  }

  function renderThemes() {
    $("#themeGrid").innerHTML = DATA.themes.map(item => `
      <button type="button" class="theme-card ${state.theme === item[0] ? "selected" : ""}" data-theme-choice="${esc(item[0])}">
        ${item[3] ? `<img src="${esc(item[3])}" alt="">` : ""}
        <span>THÈME</span><b>${esc(item[1])}</b><small>${esc(item[2])}</small>
      </button>`).join("");

    const frame = $("#visualFrame");
    const visual = activeThemeVisual();
    frame.style.backgroundImage = visual
      ? `linear-gradient(180deg,transparent,rgba(4,7,18,.55)),url("${visual}")`
      : "";
    frame.style.backgroundSize = "cover";
    frame.style.backgroundPosition = "center 18%";
    frame.innerHTML = visual ? "" : "<span>VISUEL OPTIONNEL</span>";
    $("#visualTitle").textContent = visualImport()?.file.name || DATA.themes.find(item => item[0] === state.theme)?.[1] || "Thème";
    $("#visualHint").textContent = visualImport()
      ? "Le visuel importé sera joint au paquet sans être modifié."
      : "Aucun visuel privé n’est requis pour compiler le profil.";
  }

  function manualModuleList() {
    return $("#manualModules").value.split(/\r?\n/).map(item => cleanPath(item.trim())).filter(Boolean);
  }

  function audit() {
    const items = [];
    let ready = true;

    if (state.mode === "custom") {
      if (coreImport()) items.push(["ok","Core Aerith-10 importé."]);
      else { items.push(["error","Core Multi-Agent requis."]); ready = false; }

      if (personaImport()) items.push(["ok","Persona Operating Layer importée."]);
      else { items.push(["error","Persona Operating Layer requise."]); ready = false; }

      if (state.canonicalConfirmed) items.push(["ok","Canonisation préalable dans le GitHub privé confirmée."]);
      else { items.push(["error","La canonisation préalable dans core/ doit être confirmée."]); ready = false; }

      const corePath = state.custom.corePath || $("#canonicalPath").value;
      if (/^core\/.+\.md$/i.test(corePath)) items.push(["ok",`Chemin canonique valide : ${corePath}`]);
      else { items.push(["error","Chemin canonique core/...md manquant ou invalide."]); ready = false; }

      if (/^Aerith-10\b/i.test(state.custom.name)) items.push(["ok","Nom de lignée Aerith-10 reconnu."]);
      else items.push(["warn","Le nom ne commence pas par Aerith-10. Vérifier la convention de lignée."]);

      if (coreImport() && !/AERITH[_ -]?10/i.test(coreImport().file.name)) items.push(["warn","Le nom du fichier Core ne contient pas AERITH_10."]);
      if (coreImport() && !/MULTI_AGENT_CORE/i.test(coreImport().file.name)) items.push(["warn","Le nom du fichier Core ne suit pas le suffixe MULTI_AGENT_CORE."]);
      if (personaImport() && !/PERSONA_OPERATING_LAYER/i.test(personaImport().file.name)) items.push(["warn","Le nom de la Persona ne suit pas le suffixe PERSONA_OPERATING_LAYER."]);
    } else {
      const p = profile();
      items.push(["ok",`${p.name} sélectionné.`]);
      if (p.privacy === "public") items.push(["ok","Core et Persona publics intégrés à la Forge."]);
      else {
        const missing = expectedSources().filter(source => source.private && !importedMatch(source));
        if (missing.length) items.push(["warn",`${missing.length} source(s) privée(s) restent en référence seulement.`]);
        else items.push(["ok","Sources privées attendues importées."]);
      }
    }

    if (state.heritage.includes("seven")) items.push(["ok","Héritage Seven déclaré."]);
    if (state.heritage.includes("solar")) items.push(["ok","Option Solaire déclarée disponible, sans chargement automatique."]);
    if (state.heritage.includes("lunar")) items.push(["ok","Option Lunaire déclarée disponible, sans chargement automatique."]);
    if (!visualImport()) items.push(["warn","Aucun visuel canonique privé importé ; le thème de Forge reste utilisé comme habillage."]);

    return {ready,items};
  }


  function makeHttpLinks() {
    const refs = compilerCanonicalReferences();
    const modules = [...new Set([
      ...manualModuleList(),
      ...state.imports.filter(item => ["module","pack","data","source"].includes(item.kind)).map(item => item.path)
    ])];

    const lines = [
      `# LIENS GITHUB / RAW — ${activeName()}`,
      "",
      "## Core",
      refs.core
        ? `- GitHub : ${refs.core.url}\n- Raw : ${refs.core.raw}`
        : "- Non défini",
      "",
      "## Persona",
      refs.persona
        ? `- GitHub : ${refs.persona.url}\n- Raw : ${refs.persona.raw}`
        : "- Non définie",
      "",
      "## Living Reflection Heart",
      `- GitHub : ${refs.heart.url}`,
      `- Raw : ${refs.heart.raw}`,
      "",
      "## Modules et sources"
    ];

    if (!modules.length) lines.push("- Aucun module complémentaire");
    for (const item of modules) {
      const resolved = resolveRepoPath(item);
      if (!resolved) continue;
      lines.push(`- ${item}`);
      lines.push(`  - GitHub : ${resolved.url}`);
      lines.push(`  - Raw : ${resolved.raw}`);
    }

    lines.push(
      "",
      "## Règle d’accès",
      "",
      "Les URLs du dépôt privé sont des références canoniques.",
      "Si un LLM local ne peut pas les lire faute d’accès, fournir les fichiers localement.",
      "Le LLM ne doit jamais prétendre avoir chargé une URL inaccessible."
    );
    return lines.join("\n");
  }

  function makeBlockLLM() {
    const refs = compilerCanonicalReferences();
    const modules = [...new Set([
      ...manualModuleList(),
      ...state.imports.filter(item => ["module","pack","data","source"].includes(item.kind)).map(item => item.path)
    ])];

    return `# BLOCK LLM — ACTIVATION COURTE

Tu es ${activeName()}.

Charge d’abord le Core :
${refs.core ? refs.core.raw : "CORE NON DÉFINI"}

Puis la Persona :
${refs.persona ? refs.persona.raw : "PERSONA NON DÉFINIE"}

Puis le Living Reflection Heart :
${refs.heart.raw}

Si une URL privée est inaccessible, demande le fichier local correspondant.
Ne prétends jamais avoir chargé une source inaccessible ou absente.

Mission :
${activeRole() || "Suivre strictement la mission définie dans le Core."}

Héritages disponibles :
${state.heritage.length ? state.heritage.map(id => {
  const item = DATA.lineage.find(line => line.id === id);
  return `- ${item?.name || id}`;
}).join("\n") : "- Aucun héritage supplémentaire"}

Modules ciblés :
${modules.length ? modules.map(item => {
  const resolved = resolveRepoPath(item);
  return `- ${item}${resolved ? `\n  Raw : ${resolved.raw}` : ""}`;
}).join("\n") : "- Aucun module complémentaire"}

Règles :
- Le lien vérifie.
- Le module enseigne.
- Le profil absorbe seulement ce qui sert la mission.
- Module présent ≠ module actif.
- Module actif = module qui change une décision.
- Lire le Core et la Persona sans les réécrire.
- Ne jamais inventer une source, une capacité ou un accès.
- Produire la destination utile puis appliquer le Stop Point.
`;
  }

  function makeBoot() {
    const name = activeName();
    const p = state.mode === "existing" ? profile() : null;
    const canonicalPath = state.mode === "custom" ? (state.custom.corePath || $("#canonicalPath").value) : p.canonicalPath;
    const personaPath = state.mode === "custom"
      ? (state.custom.personaPath || personaImport()?.path || "Persona importée localement")
      : (p.sources.find(source => /persona/i.test(source[2]))?.[1] || "Selon le Core");
    const modules = [...new Set([...manualModuleList(), ...state.imports.filter(item => ["module","pack","data","source"].includes(item.kind)).map(item => item.path)])];

    return `# BOOT — ${name.toUpperCase()}

Version Forge : ${DATA.version}
Mode : ${state.mode === "custom" ? "Aerith-10 Pro importé" : "Profil canonique existant"}

## Activation

Active ${name}.

## Sources

1. Core : ${canonicalPath || "NON DÉFINI"}
2. Persona : ${personaPath || "NON DÉFINIE"}
${state.custom.memoryPath ? `3. Mémoire / base métier : ${state.custom.memoryPath}` : ""}

## Accès HTTP / Raw

${makeHttpLinks()}

## Héritages disponibles

${state.heritage.length ? state.heritage.map(id => {
  const item = DATA.lineage.find(line => line.id === id);
  return `- ${item?.name || id} — ${item?.formula || ""}`;
}).join("\n") : "- Aucun héritage supplémentaire sélectionné"}

## Modules ciblés

${modules.length ? modules.map(item => `- ${item}`).join("\n") : "- Aucun module complémentaire"}

## Mission

${activeRole() || "Suivre strictement la mission définie dans le Core importé."}

## Verrous

- Lire le Core et la Persona sans les réécrire.
- Ne jamais présenter une source absente comme chargée.
- Un module disponible n’est pas automatiquement actif.
- Solaire et Lunaire sont des options de lignée, pas des voix simultanées par défaut.
- Distinguer fait, hypothèse, interprétation, symbole, ressenti et action.
- Produire le résultat demandé puis s’arrêter proprement.
`;
  }

  function profileSpec() {
    const p = state.mode === "existing" ? profile() : null;
    return {
      forge_version: DATA.version,
      mode: state.mode,
      identity: {
        name: activeName(),
        family: state.mode === "custom" ? state.custom.family : p.family,
        level: state.mode === "custom" ? state.custom.level : p.level,
        role: activeRole(),
        main_mode: state.mode === "custom" ? state.custom.mode : "",
        version: state.mode === "custom" ? state.custom.version : "",
        status: state.mode === "custom" ? state.custom.status : p.status
      },
      canonical: {
        confirmed_private_core: state.mode === "existing" ? true : state.canonicalConfirmed,
        core_path: state.mode === "custom" ? (state.custom.corePath || $("#canonicalPath").value) : p.canonicalPath,
        persona_path: state.mode === "custom" ? state.custom.personaPath : "",
        memory_or_business_base: state.mode === "custom" ? state.custom.memoryPath : ""
      },
      heritage: state.heritage,
      modules: [...new Set([...manualModuleList(), ...state.imports.filter(item => ["module","pack","data","source"].includes(item.kind)).map(item => item.path)])],
      theme: state.theme,
      http_references: compilerCanonicalReferences(),
      imported_files: state.imports.map(item => ({path:item.path,kind:item.kind,size:item.file.size})),
      audit: audit()
    };
  }

  function makeManifest() {
    const spec = profileSpec();
    return `# MANIFESTE — ${activeName()}

Version Forge : ${DATA.version}
Date : ${new Date().toISOString().slice(0,10)}
Mode : ${state.mode === "custom" ? "Nouveau type Aerith-10 Pro" : "Profil canonique existant"}

## Identité

- Nom : ${spec.identity.name}
- Famille : ${spec.identity.family || "—"}
- Niveau : ${spec.identity.level || "—"}
- Rôle : ${spec.identity.role || "—"}
- Mode principal : ${spec.identity.main_mode || "—"}
- Version Core : ${spec.identity.version || "—"}

## Références canoniques

- Core : ${spec.canonical.core_path || "—"}
- Persona : ${spec.canonical.persona_path || "—"}
- Mémoire / base métier : ${spec.canonical.memory_or_business_base || "—"}
- Canonisation privée confirmée : ${spec.canonical.confirmed_private_core ? "oui" : "non"}

## Liens GitHub / Raw

${makeHttpLinks()}

## Héritages

${spec.heritage.length ? spec.heritage.map(item => `- ${item}`).join("\n") : "- Aucun"}

## Modules

${spec.modules.length ? spec.modules.map(item => `- ${item}`).join("\n") : "- Aucun"}

## Fichiers réellement importés

${spec.imported_files.length ? spec.imported_files.map(item => `- ${item.path} — ${item.kind} — ${item.size} octets`).join("\n") : "- Aucun"}

## Audit

${spec.audit.items.map(item => `- [${item[0].toUpperCase()}] ${item[1]}`).join("\n")}

## Verrou source-fidèle

La Forge compile les sources disponibles.
Elle ne crée pas de Core canonique.
Elle ne réécrit pas la Persona.
Elle ne présente pas un fichier absent comme chargé.
`;
  }

  function makePrivateReference() {
    const spec = profileSpec();
    return `# RÉFÉRENCE GITHUB PRIVÉE

Dépôt canonique :
BlueAzur-Hub/erith-ia-notion-archive-private

Core :
${spec.canonical.core_path || "NON DÉFINI"}

Persona :
${spec.canonical.persona_path || "NON DÉFINIE"}

La Forge publique ne stocke aucun jeton et ne lit pas directement le dépôt privé.
Les fichiers ont été fournis localement par l’utilisateur.
`;
  }

  function makeThemeDoc() {
    const theme = DATA.themes.find(item => item[0] === state.theme);
    return `# THÈME VISUEL

Thème : ${theme?.[1] || state.theme}
Direction : ${theme?.[2] || "—"}
Visuel importé : ${visualImport()?.file.name || "aucun"}

Le thème habille l’interface et le manifeste.
Il ne modifie pas le Core et ne prouve aucune capacité.
`;
  }

  async function fetchBytes(path) {
    const response = await fetch(path, {cache:"no-store"});
    if (!response.ok) throw new Error(`${path} · HTTP ${response.status}`);
    return new Uint8Array(await response.arrayBuffer());
  }

  function uniquePath(files, wanted) {
    if (!files.has(wanted)) return wanted;
    const dot = wanted.lastIndexOf(".");
    const slash = wanted.lastIndexOf("/");
    const base = dot > slash ? wanted.slice(0,dot) : wanted;
    const ext = dot > slash ? wanted.slice(dot) : "";
    let index = 2;
    while (files.has(`${base}_${index}${ext}`)) index += 1;
    return `${base}_${index}${ext}`;
  }

  async function buildPackage(includePublic = true) {
    const root = activeRoot();
    const files = new Map();
    const warnings = audit().items.filter(item => item[0] !== "ok").map(item => item[1]);

    files.set(`${root}/BOOT.md`, encoder.encode(makeBoot()));
    files.set(`${root}/MANIFESTE.md`, encoder.encode(makeManifest()));
    files.set(`${root}/BLOCK_LLM.md`, encoder.encode(makeBlockLLM()));
    files.set(`${root}/GITHUB_HTTP_RAW_LINKS.md`, encoder.encode(makeHttpLinks()));
    files.set(`${root}/PROFILE_SPEC.json`, encoder.encode(JSON.stringify(profileSpec(), null, 2)));
    files.set(`${root}/PRIVATE_GITHUB_REFERENCE.md`, encoder.encode(makePrivateReference()));
    files.set(`${root}/THEME.md`, encoder.encode(makeThemeDoc()));
    files.set(`${root}/BUILD_INFO.txt`, encoder.encode(`FORGE=${DATA.version}\nDATE=${new Date().toISOString()}\nPROFILE=${activeName()}\n`));

    if (state.mode === "existing" && profile().privacy === "public" && includePublic) {
      for (const source of profile().sources.filter(item => item[4])) {
        try {
          files.set(`${root}/sources_publiques/${source[0]}`, await fetchBytes(source[1]));
        } catch (error) {
          warnings.push(error.message);
        }
      }
      for (const module of profile().modules.filter(item => state.modules.includes(item[0]))) {
        try {
          files.set(`${root}/modules/${module[0]}`, await fetchBytes(`modules/${module[0]}`));
        } catch (error) {
          warnings.push(error.message);
        }
      }
    }

    for (const item of state.imports) {
      const relative = cleanPath(item.path || item.file.name);
      const target = uniquePath(files, `${root}/sources_importees/${relative}`);
      files.set(target, new Uint8Array(await item.file.arrayBuffer()));
    }

    return {root,files,warnings};
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
    for (const part of parts) { output.set(part,offset); offset += part.length; }
    return output;
  }

  function zipBlob(files) {
    const local = [], central = [];
    let offset = 0;
    const now = new Date();
    const year = Math.max(1980,now.getFullYear());
    const time = (now.getHours()<<11) | (now.getMinutes()<<5) | Math.floor(now.getSeconds()/2);
    const date = ((year-1980)<<9) | ((now.getMonth()+1)<<5) | now.getDate();

    for (const [name,raw] of files) {
      const bytes = raw instanceof Uint8Array ? raw : encoder.encode(raw);
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
    return new Blob([localData,centralData,end], {type:"application/zip"});
  }

  function renderAudit() {
    const result = audit();
    const card = $("#auditCard");
    card.className = `audit-card ${result.ready ? "ready" : "warning"}`;
    card.innerHTML = `<h3>${result.ready ? "Profil prêt à forger" : "Profil incomplet"}</h3><ul>${
      result.items.map(item => `<li class="${item[0]}">${esc(item[1])}</li>`).join("")
    }</ul>`;
    $("#bootPreview").textContent = makeBoot();
    $("#forgeZip").disabled = state.mode === "custom" && !result.ready;
    $("#matrixState").textContent = result.ready ? "READY" : "IMPORT";
  }

  function renderExport() {
    const result = audit();
    $("#exportName").textContent = activeName();
    $("#exportSummary").textContent = state.mode === "custom"
      ? `${state.imports.length} fichier(s) importé(s), ${state.heritage.length} héritage(s), ${manualModuleList().length} route(s) manuelle(s).`
      : `${profile().name} · ${state.imports.length} source(s) locale(s) · ${state.modules.length} module(s) sélectionné(s).`;
    $("#forgeZip").disabled = state.mode === "custom" && !result.ready;
  }

  function renderSteps() {
    $("#stepNav").innerHTML = steps.map((step,index) => `
      <button type="button" class="step-button ${state.step === index ? "active" : ""}" data-step="${index}">
        <span class="num">${step[0]}</span>
        <span><b>${step[1]}</b><small>${step[2]}</small></span>
        <em>${index < state.step ? "✓" : "•"}</em>
      </button>`).join("");
  }

  function activateStep(index, focus = false) {
    state.step = Math.max(0,Math.min(index,steps.length - 1));
    $$(".panel").forEach((panel,panelIndex) => panel.classList.toggle("active",panelIndex === state.step));
    const step = steps[state.step];
    $("#stepCounter").textContent = `ÉTAPE ${step[0]} SUR 07`;
    $("#stepTitle").textContent = step[1];
    $("#stepDescription").textContent = step[2];
    $("#previousTop").disabled = $("#previousBottom").disabled = state.step === 0;
    $("#nextTop").disabled = $("#nextBottom").disabled = state.step === steps.length - 1;
    $("#progressValue").textContent = `${Math.round((state.step + 1) / steps.length * 100)}%`;
    renderSteps();
    if (state.step >= 5) renderAudit();
    if (state.step === 6) renderExport();
    if (focus) $("#forge").scrollIntoView({behavior:"smooth",block:"start"});
  }

  function renderAll() {
    renderProfiles();
    renderMatrix();
    renderIdentity();
    renderImports();
    renderSourceAudit();
    renderMetadata();
    renderHeritage();
    renderThemes();
    renderAudit();
    renderExport();
    activateStep(state.step);
  }

  function selectExisting(id) {
    const p = DATA.profiles.find(item => item.id === id);
    if (!p) return;
    state.mode = "existing";
    state.profileId = id;
    state.theme = p.theme;
    state.heritage = [...p.heritage];
    state.modules = p.modules.slice(0,p.id === "seven" ? 2 : 4).map(item => item[0]);
    state.canonicalConfirmed = true;
    state.step = 0;
    renderAll();
    $("#forge").scrollIntoView({behavior:"smooth",block:"start"});
    showToast(`${p.name} sélectionné.`);
  }

  function selectCustom() {
    state.mode = "custom";
    state.step = 0;
    state.theme = state.theme || "creator";
    state.canonicalConfirmed = false;
    renderAll();
    $("#forge").scrollIntoView({behavior:"smooth",block:"start"});
    showToast("Atelier Aerith-10 Pro ouvert.");
  }

  async function addFiles(files) {
    let added = 0, duplicates = 0;
    for (const file of files) {
      const path = cleanPath(file.webkitRelativePath || file.name);
      const key = `${path.toLowerCase()}|${file.size}|${file.lastModified}`;
      if (state.imports.some(item => item.key === key)) { duplicates += 1; continue; }

      let text = "";
      if (/\.md$|\.txt$/i.test(file.name) && file.size < 5_000_000) {
        try { text = await file.text(); } catch {}
      }
      const kind = kindForFile(file,text);
      state.imports.push({file,path,key,kind,text});
      added += 1;

      if (kind === "core" && text) mergeParsed(parseCore(text,file.name));
      if (kind === "persona" && text) {
        const coreRequired = fieldFromText(text,["Core requis"]);
        const personaPath = fieldFromText(text,["Chemin cible"]);
        const version = fieldFromText(text,["Version"]);
        if (coreRequired && !state.custom.corePath) state.custom.corePath = coreRequired.replace(/`/g,"");
        if (personaPath) state.custom.personaPath = personaPath.replace(/`/g,"");
        if (version && !state.custom.version) state.custom.version = version;
      }
      if (kind === "visual" && !state.visualUrl) {
        state.visualUrl = URL.createObjectURL(file);
      }
    }
    renderAll();
    showToast(added ? `${added} fichier(s) ajouté(s).${duplicates ? ` ${duplicates} doublon(s) ignoré(s).` : ""}` : "Aucun nouveau fichier.");
  }

  function syncCustomInputs() {
    state.custom.name = $("#customName").value.trim() || "Aerith-10 Nouvelle Spécialité";
    state.custom.family = $("#customFamily").value.trim();
    state.custom.level = $("#customLevel").value.trim();
    state.custom.mode = $("#customMode").value.trim();
    state.custom.role = $("#customRole").value.trim();
    state.custom.exportRoot = $("#exportRoot").value.trim() || cleanName(state.custom.name);
    renderMatrix();
    renderMetadata();
    renderAudit();
    renderExport();
  }

  document.addEventListener("click", event => {
    const lineageImage = event.target.closest("[data-lineage-image]");
    if (lineageImage) {
      openLightbox(lineageImage.dataset.lineageImage, lineageImage.dataset.lineageTitle || "Constellation d’Aerith");
      return;
    }

    if (event.target.id === "imageLightbox") {
      closeLightbox();
      return;
    }

    const profileButton = event.target.closest("[data-profile]");
    if (profileButton) selectExisting(profileButton.dataset.profile);

    const stepButton = event.target.closest("[data-step]");
    if (stepButton) activateStep(Number(stepButton.dataset.step));

    const heritageButton = event.target.closest("[data-heritage]");
    if (heritageButton) {
      const id = heritageButton.dataset.heritage;
      state.heritage = state.heritage.includes(id)
        ? state.heritage.filter(item => item !== id)
        : [...state.heritage,id];
      renderHeritage(); renderAudit();
    }

    const themeButton = event.target.closest("[data-theme-choice]");
    if (themeButton) {
      state.theme = themeButton.dataset.themeChoice;
      renderThemes(); renderMatrix();
    }
  });

  $("#lightboxClose").addEventListener("click", closeLightbox);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !$("#imageLightbox").hidden) closeLightbox();
  });

  $("#newA10Card").addEventListener("click",selectCustom);
  $("#startCustom").addEventListener("click",selectCustom);
  $("#topStart").addEventListener("click",() => activateStep(0,true));
  $("#nextTop").addEventListener("click",() => activateStep(state.step + 1));
  $("#nextBottom").addEventListener("click",() => activateStep(state.step + 1));
  $("#previousTop").addEventListener("click",() => activateStep(state.step - 1));
  $("#previousBottom").addEventListener("click",() => activateStep(state.step - 1));

  for (const id of ["customName","customFamily","customLevel","customMode","customRole","exportRoot"]) {
    $(`#${id}`).addEventListener("input",syncCustomInputs);
  }

  $("#canonicalConfirmed").addEventListener("change",event => {
    if (state.mode === "custom") state.canonicalConfirmed = event.target.checked;
    renderAudit(); renderExport(); renderMatrix();
  });

  $("#canonicalPath").addEventListener("input",event => {
    if (state.mode === "custom") state.custom.corePath = event.target.value.trim();
    renderAudit(); renderExport();
  });

  $("#manualModules").addEventListener("input",event => {
    state.modules = event.target.value.split(/\r?\n/).map(item => cleanPath(item.trim())).filter(Boolean);
    renderAudit(); renderExport();
  });

  const dropzone = $("#dropzone"), fileInput = $("#fileInput"), folderInput = $("#folderInput");
  $("#browseFiles").addEventListener("click",event => { event.stopPropagation(); fileInput.click(); });
  $("#browseFolder").addEventListener("click",event => { event.stopPropagation(); folderInput.click(); });
  dropzone.addEventListener("click",event => { if (!event.target.closest("button")) fileInput.click(); });
  dropzone.addEventListener("keydown",event => { if (event.key === "Enter" || event.key === " ") fileInput.click(); });
  ["dragenter","dragover"].forEach(type => dropzone.addEventListener(type,event => { event.preventDefault(); dropzone.classList.add("drag"); }));
  ["dragleave","drop"].forEach(type => dropzone.addEventListener(type,event => { event.preventDefault(); dropzone.classList.remove("drag"); }));
  fileInput.addEventListener("change",async event => { await addFiles([...event.target.files]); event.target.value = ""; });
  folderInput.addEventListener("change",async event => { await addFiles([...event.target.files]); event.target.value = ""; });
  dropzone.addEventListener("drop",event => addFiles([...event.dataTransfer.files]));

  $("#clearImports").addEventListener("click",() => {
    if (state.visualUrl) URL.revokeObjectURL(state.visualUrl);
    state.imports = [];
    state.visualUrl = "";
    state.parsed = {};
    renderAll();
  });

  $("#resetForge").addEventListener("click",() => {
    if (state.visualUrl) URL.revokeObjectURL(state.visualUrl);
    state.mode = "custom"; state.profileId = "seven"; state.step = 0; state.imports = [];
    state.modules = []; state.heritage = ["seven"]; state.theme = "creator";
    state.canonicalConfirmed = false; state.parsed = {}; state.visualUrl = "";
    state.custom = {
      name:"Aerith-10 Nouvelle Spécialité",family:"Filles d’Aerith",level:"Aerith-10",
      mode:"",role:"",version:"",status:"",compatibility:"",personaPath:"",
      memoryPath:"",corePath:"",imagePath:"",update:"",
      exportRoot:"AERITH_10_NOUVELLE_SPECIALITE"
    };
    renderAll();
    showToast("Forge réinitialisée.");
  });

  $("#downloadBoot").addEventListener("click",() => downloadText(`BOOT_${activeRoot()}.md`,makeBoot()));
  $("#downloadManifest").addEventListener("click",() => downloadText(`MANIFESTE_${activeRoot()}.md`,makeManifest()));
  $("#downloadBlockLLM").addEventListener("click",() => downloadText(`BLOCK_LLM_${activeRoot()}.md`,makeBlockLLM()));
  $("#downloadHttpLinks").addEventListener("click",() => downloadText(`GITHUB_HTTP_RAW_${activeRoot()}.md`,makeHttpLinks()));
  $("#downloadSpec").addEventListener("click",() => downloadText(`PROFILE_SPEC_${activeRoot()}.json`,JSON.stringify(profileSpec(),null,2),"application/json;charset=utf-8"));
  $("#copyTree").addEventListener("click",async () => copyText(tree(await buildPackage(true))));

  $("#forgeZip").addEventListener("click",async () => {
    const log = $("#forgeLog");
    log.textContent = "Compilation des sources exactes…";
    try {
      const pkg = await buildPackage(true);
      const blob = zipBlob(pkg.files);
      downloadBlob(`${pkg.root}_FORGE_AERITH_PRO.zip`,blob);
      log.textContent = `${pkg.files.size} fichier(s) · ${formatSize(blob.size)}${pkg.warnings.length ? ` · ${pkg.warnings.length} alerte(s) consignées` : " · paquet complet"}`;
      showToast("ZIP Pro forgé.");
    } catch (error) {
      log.textContent = `Erreur : ${error.message}`;
      showToast("Erreur de compilation.");
    }
  });

  renderDoctrine();
  renderLineage();
  renderAll();

  const expected = document.body.dataset.build;
  if (expected !== DATA.version) {
    const diagnostic = $("#buildDiagnostic");
    diagnostic.hidden = false;
    diagnostic.textContent = `Version incohérente : HTML ${expected} / données ${DATA.version}. Recharge forcée requise.`;
  }
})();
