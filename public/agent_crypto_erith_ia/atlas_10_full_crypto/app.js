(() => {
  "use strict";

  const data = window.AERITH_FORGE_SOURCES;
  if (!data) throw new Error("forge-sources.js introuvable.");

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const steps = [
    ["01","Profil","Choisir un assemblage réel."],
    ["02","Sources","Lire l’ordre canonique et les fichiers attendus."],
    ["03","Import local","Ajouter les fichiers privés ou les packs possédés."],
    ["04","Packs / modules","Sélectionner uniquement ce qui sert la mission."],
    ["05","Flower Girls","Router une fonction principale et des soutiens."],
    ["06","Boot","Vérifier le prompt d’activation."],
    ["07","Export","Produire un ZIP fidèle aux sources disponibles."]
  ];
  const state = {
    profileId: localStorage.getItem("aerith-forge-source-profile") || "atlas",
    step: Number(localStorage.getItem("aerith-forge-source-step") || 0),
    choices: {},
    flowerGirls: [],
    imported: []
  };

  let lastPackage = null;

  function profile() {
    return data.profiles.find(p => p.id === state.profileId) || data.profiles[0];
  }

  function esc(v) {
    return String(v ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
  }

  function cleanName(v) {
    return String(v || "AERITH_PROFILE").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9]+/g,"_").replace(/^_+|_+$/g,"").toUpperCase();
  }

  function showToast(message) {
    const t = $("#toast"); t.textContent = message; t.classList.add("show");
    clearTimeout(showToast.timer); showToast.timer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const a = document.createElement("textarea"); a.value = text; a.style.position = "fixed"; a.style.opacity = "0";
      document.body.appendChild(a); a.select(); document.execCommand("copy"); a.remove();
    }
    showToast("Copié.");
  }

  function downloadBlob(name, blob) {
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function downloadText(name, text) {
    downloadBlob(name, new Blob([text], {type:"text/markdown;charset=utf-8"}));
  }

  function renderProfiles() {
    $("#profileGrid").innerHTML = data.profiles.map(p => `
      <button type="button" class="profile-card ${p.id === state.profileId ? "active" : ""}" data-profile="${esc(p.id)}">
        <span class="sigil">${esc(p.sigil)}</span>
        <span class="family">${esc(p.family)}</span>
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.description)}</p>
        <small>${esc(p.status)}</small>
      </button>`).join("");
  }

  function renderHero() {
    const p = profile(); document.body.dataset.profile = p.id;
    $("#heroSigil").textContent = p.sigil; $("#heroName").textContent = p.name; $("#heroDescription").textContent = p.description;
    $("#heroCore").textContent = p.privacy === "public" ? "Inclus" : "Import / référence";
    $("#heroPersona").textContent = p.id === "seven" ? "Selon Core" : p.privacy === "public" ? "Incluse" : "Import / référence";
    $("#heroPrivacy").textContent = p.privacy === "public" ? "Public" : "Privé local";
  }

  function renderSteps() {
    $("#stepNav").innerHTML = steps.map((s,i)=>`
      <button class="step-button ${i===state.step?"active":""}" type="button" data-step-button="${i}">
        <span class="num">${s[0]}</span><span><strong>${s[1]}</strong><small>${s[2]}</small></span><span class="done">${i < state.step ? "✓" : "•"}</span>
      </button>`).join("");
  }

  function renderSelected() {
    const p = profile();
    $("#selectedProfileName").textContent = p.name; $("#selectedProfileStatus").textContent = p.status;
    $("#selectedProfileDescription").textContent = p.description;
  }

  function importedMatch(name) {
    const low = name.toLowerCase();
    return state.imported.some(item => item.file.name.toLowerCase() === low);
  }

  function renderSources() {
    const p = profile();
    $("#canonicalOrder").innerHTML = p.canonicalOrder.map(x => `<li>${esc(x)}</li>`).join("");
    $("#sourceList").innerHTML = p.sourceFiles.map(s => {
      const found = s.builtin || importedMatch(s.name);
      const label = s.builtin ? "PUBLIC INCLUS" : found ? "IMPORTÉ" : s.private ? "RÉFÉRENCE PRIVÉE" : "RÉFÉRENCE";
      return `<div class="source-item">
        <span class="icon">${s.role.slice(0,2).toUpperCase()}</span>
        <span><strong>${esc(s.path)}</strong><small>${esc(s.role)}</small></span>
        <em class="${s.builtin || found ? "public" : ""}">${label}</em>
      </div>`;
    }).join("");
  }

  function ensureChoices() {
    const p = profile();
    if (state.choices[p.id]) return;
    if (p.packs) state.choices[p.id] = p.packs.filter(x => x.recommended).map(x => x.id);
    else if (p.moduleGroups) state.choices[p.id] = [p.moduleGroups[0].id];
    else state.choices[p.id] = p.cryptoModules.slice(0,4).map(x => x[0]);
  }

  function renderChoices() {
    ensureChoices();
    const p = profile(); const selected = state.choices[p.id] || [];
    let items = [];
    if (p.packs) {
      $("#moduleInstruction").textContent = "Commencer par Core Boot. Ajouter Discernment si la tâche implique choix, accompagnement ou garde-fou. Ne jamais charger les sept packs par réflexe.";
      items = p.packs.map(x => ({id:x.id, group:"Seven Heaven", title:x.title, detail:`${x.file} — ${x.role}`}));
    } else if (p.moduleGroups) {
      $("#moduleInstruction").textContent = "Les groupes reprennent les priorités écrites dans le Core Aerith-10 Créatrice. Les 14 modules complets ne sont pas chargés sans nécessité.";
      items = p.moduleGroups.map(x => ({id:x.id, group:"Base experte", title:x.title, detail:x.files.join(" · ")}));
    } else {
      $("#moduleInstruction").textContent = "Module présent ≠ module actif. Un module est actif uniquement s’il change une décision, un calcul, un test ou une présentation.";
      items = p.cryptoModules.map(x => ({id:x[0], group:"Crypto public", title:x[1], detail:x[0]}));
    }
    $("#moduleChoices").innerHTML = items.map(x => `
      <label class="choice-card ${selected.includes(x.id)?"selected":""}">
        <input type="checkbox" data-choice="${esc(x.id)}" ${selected.includes(x.id)?"checked":""}>
        <span><span>${esc(x.group)}</span><strong>${esc(x.title)}</strong><small>${esc(x.detail)}</small></span>
      </label>`).join("");
  }

  function renderImports() {
    $("#importCount").textContent = state.imported.length;
    $("#importList").innerHTML = state.imported.length ? state.imported.map((x,i)=>`
      <div class="import-item"><strong>${esc(x.file.name)}</strong><span>${(x.file.size/1024).toFixed(1)} Ko</span></div>`).join("") : "<p>Aucun fichier local importé.</p>";
    renderSources();
  }

  function renderFlowerGirls() {
    const q = ($("#fgSearch").value || "").trim().toLowerCase();
    const filtered = data.flowerGirls.map((x,i)=>({x,i})).filter(({x}) => !q || x.join(" ").toLowerCase().includes(q));
    $("#fgGrid").innerHTML = filtered.map(({x,i})=>`
      <button type="button" class="fg-card ${state.flowerGirls.includes(i)?"selected":""}" data-fg="${i}">
        <span>${esc(x[1])}</span><strong>Aerith-10 ${esc(x[0])}</strong><small>${esc(x[2])}</small>
      </button>`).join("");
    $("#fgCount").textContent = `${state.flowerGirls.length} sélectionnée${state.flowerGirls.length>1?"s":""} / 3`;
    $("#comboRow").innerHTML = data.combinations.map((c,i)=>`<button type="button" class="combo-button" data-combo="${i}">${esc(c[0])}</button>`).join("");
  }

  function chosenItems() {
    ensureChoices(); const p = profile(); const ids = state.choices[p.id] || [];
    if (p.packs) return p.packs.filter(x=>ids.includes(x.id)).map(x=>({title:x.title,file:x.file,role:x.role}));
    if (p.moduleGroups) return p.moduleGroups.filter(x=>ids.includes(x.id)).map(x=>({title:x.title,file:x.files.join(", "),role:"Groupe canonique"}));
    return p.cryptoModules.filter(x=>ids.includes(x[0])).map(x=>({title:x[1],file:x[0],role:"Module public"}));
  }

  function makeBoot() {
    const p = profile(); const choices = chosenItems(); const girls = state.flowerGirls.map(i=>data.flowerGirls[i]);
    const lines = [`# BOOT — ${p.name.toUpperCase()}`,"",`Version Forge : ${data.version}`,`Statut : ${p.status}`,"","## Activation",""];
    if (p.id === "seven") {
      lines.push("Active Aerith-7 Seven Heaven.","","Mode Full Modules Boost intelligent.","","Règle centrale:",...data.doctrine.map(x=>`- ${x}`),"");
    } else if (p.id === "creator") {
      lines.push("Active Aerith-10 Créatrice.","",`Mode principal : \`${p.defaultMode}\``,"","Une seule Aerith-10. Un seul mode principal à la fois.","");
    } else if (p.id === "atlas") {
      lines.push("Active Atlas-10 Crypto.","",`Mode principal : \`${p.defaultMode}\``,"","Tu n’es pas un oracle de prix, un conseiller financier ou un vendeur de signaux.","");
    } else {
      lines.push("Active Aerith-10 Crypto.","",`Mode principal : \`${p.defaultMode}\``,"","Tu ne donnes aucun ordre d’achat ou de vente.","");
    }
    lines.push("## Ordre canonique","",...p.canonicalOrder.map((x,i)=>`${i+1}. ${x}`),"","## Packs ou modules ciblés","",
      ...(choices.length?choices.map(x=>`- ${x.title} — ${x.file}`):["- Aucun"]));
    lines.push("","## Routage Flower Girls","",
      ...(girls.length?girls.map((g,i)=>`- ${i===0?"Principale":"Soutien"} : Aerith-10 ${g[0]} — ${g[2]}`):["- Aucun routage Flower Girl"]));
    lines.push("","## Garde-fous","",
      "- Module présent ≠ module actif.",
      "- Ne pas charger tout le dépôt ou tous les packs par réflexe.",
      "- Ne pas mélanger automatiquement public et privé.",
      "- Distinguer fait, hypothèse, interprétation, symbole, ressenti et action.",
      "- Les Flower Girls assistent ; elles ne décident pas à la place de Christophe.",
      "- Si une source manque, le dire au lieu d’inventer.",
      "- Produire le résultat demandé puis s’arrêter proprement.");
    return lines.join("\n");
  }

  function makeManifest() {
    const p = profile(); const choices = chosenItems(); const girls = state.flowerGirls.map(i=>data.flowerGirls[i]);
    return `# MANIFESTE — ${p.name}

Version Forge : ${data.version}
Politique : ${p.privacy === "public" ? "Sources publiques incluses" : "Sources privées : référence ou import local"}
Date : ${new Date().toISOString().slice(0,10)}

## Sources canoniques

${p.sourceFiles.map(x=>`- ${x.path} — ${x.role}`).join("\n")}

## Packs ou modules choisis

${choices.length ? choices.map(x=>`- ${x.title} — ${x.file}`).join("\n") : "- Aucun"}

## Flower Girls routées

${girls.length ? girls.map((g,i)=>`- ${i===0?"Principale":"Soutien"} : Aerith-10 ${g[0]} — ${g[2]}`).join("\n") : "- Aucune"}

## Sources locales jointes

${state.imported.length ? state.imported.map(x=>`- ${x.file.name}`).join("\n") : "- Aucune"}

## Verrou

La Forge assemble les sources disponibles.
Elle ne crée pas de Core canonique.
Elle ne réécrit pas une Persona.
Elle ne présente pas un fichier absent comme chargé.
`;
  }

  function makeRouting() {
    const girls = state.flowerGirls.map(i=>data.flowerGirls[i]);
    return `# FLOWER GIRLS — ROUTAGE

Principe :

1 Flower Girl = mission claire.
2 Flower Girls = duo opérationnel.
3 Flower Girls = constellation courte.
Plus de 3 = seulement sur demande explicite de Christophe.

${girls.length ? girls.map((g,i)=>`## ${i===0?"Principale":"Soutien"} — Aerith-10 ${g[0]}

Famille : ${g[1]}

Fonction : ${g[2]}
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
2. Charger les sources dans l’ordre indiqué.
3. Activer seulement les packs ou modules utiles.
4. Utiliser FLOWER_GIRLS_ROUTING.md uniquement comme carte de routage.
5. Si une source manque, ne pas l’inventer.
6. Arrêter quand le résultat est livré.

## Confidentialité

${p.privacy === "public" ? "Les Core et Persona publics du profil peuvent être inclus." : "Les sources privées sont incluses uniquement si elles ont été importées localement par l’utilisateur."}
`;
  }

  async function fetchBytes(path) {
    const r = await fetch(path,{cache:"no-store"}); if(!r.ok) throw new Error(`${path} · HTTP ${r.status}`);
    return new Uint8Array(await r.arrayBuffer());
  }

  async function buildPackage(includePublic = true) {
    const p = profile(); const root = cleanName(p.name); const files = new Map(); const warnings = [];
    files.set(`${root}/BOOT.md`, new TextEncoder().encode(makeBoot()));
    files.set(`${root}/MANIFESTE.md`, new TextEncoder().encode(makeManifest()));
    files.set(`${root}/FLOWER_GIRLS_ROUTING.md`, new TextEncoder().encode(makeRouting()));
    files.set(`${root}/README.md`, new TextEncoder().encode(makeReadme()));

    for (const item of p.sourceFiles.filter(x=>x.builtin)) {
      if (!includePublic) continue;
      try { files.set(`${root}/sources_publiques/${item.name}`, await fetchBytes(item.path)); }
      catch(e) { warnings.push(e.message); }
    }

    if (includePublic && p.cryptoModules) {
      for (const choice of chosenItems()) {
        try { files.set(`${root}/modules/${choice.file}`, await fetchBytes(`modules/${choice.file}`)); }
        catch(e) { warnings.push(e.message); }
      }
    }

    for (const item of state.imported) {
      files.set(`${root}/sources_locales/${item.file.name}`, new Uint8Array(await item.file.arrayBuffer()));
    }

    return {p,root,files,warnings};
  }

  function tree(pkg) {
    return [`${pkg.root}/`,...[...pkg.files.keys()].sort().map(x=>`├── ${x.slice(pkg.root.length+1)}`)].join("\n");
  }

  function crc32(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^(0xedb88320&-(c&1));}return(c^0xffffffff)>>>0}
  function concat(parts){const n=parts.reduce((s,p)=>s+p.length,0),o=new Uint8Array(n);let k=0;for(const p of parts){o.set(p,k);k+=p.length}return o}
  function zipBlob(files){
    const enc=new TextEncoder(),local=[],central=[];let offset=0;const now=new Date(),year=Math.max(1980,now.getFullYear());
    const time=(now.getHours()<<11)|(now.getMinutes()<<5)|Math.floor(now.getSeconds()/2),date=((year-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate();
    for(const [name,raw] of files){const data=raw instanceof Uint8Array?raw:enc.encode(raw),nb=enc.encode(name),crc=crc32(data);
      const l=new Uint8Array(30+nb.length),lv=new DataView(l.buffer);lv.setUint32(0,0x04034b50,true);lv.setUint16(4,20,true);lv.setUint16(6,0x0800,true);lv.setUint16(8,0,true);lv.setUint16(10,time,true);lv.setUint16(12,date,true);lv.setUint32(14,crc,true);lv.setUint32(18,data.length,true);lv.setUint32(22,data.length,true);lv.setUint16(26,nb.length,true);l.set(nb,30);local.push(l,data);
      const c=new Uint8Array(46+nb.length),cv=new DataView(c.buffer);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x0800,true);cv.setUint16(10,0,true);cv.setUint16(12,time,true);cv.setUint16(14,date,true);cv.setUint32(16,crc,true);cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);cv.setUint16(28,nb.length,true);cv.setUint32(42,offset,true);c.set(nb,46);central.push(c);offset+=l.length+data.length}
    const ld=concat(local),cd=concat(central),end=new Uint8Array(22),ev=new DataView(end.buffer);ev.setUint32(0,0x06054b50,true);ev.setUint16(8,files.size,true);ev.setUint16(10,files.size,true);ev.setUint32(12,cd.length,true);ev.setUint32(16,ld.length,true);return new Blob([ld,cd,end],{type:"application/zip"});
  }

  async function updatePreview() {
    $("#bootPreview").textContent = makeBoot();
    const p=profile(),count=chosenItems().length;
    $("#exportName").textContent=p.name;
    $("#exportSummary").textContent=`${count} pack(s) ou module(s), ${state.flowerGirls.length} Flower Girl(s) routée(s), ${state.imported.length} source(s) locale(s).`;
    lastPackage=await buildPackage(false);
  }

  function activateStep(i,focus=false) {
    state.step=Math.max(0,Math.min(i,steps.length-1));localStorage.setItem("aerith-forge-source-step",state.step);
    $$(".panel").forEach((p,n)=>p.classList.toggle("active",n===state.step));
    const s=steps[state.step];$("#stepCounter").textContent=`ÉTAPE ${s[0]} SUR 07`;$("#stepTitle").textContent=s[1];$("#stepDescription").textContent=s[2];
    $("#previousTop").disabled=$("#previousBottom").disabled=state.step===0;$("#nextTop").disabled=$("#nextBottom").disabled=state.step===steps.length-1;
    $("#stageStatus").textContent="Étape en cours";$("#progressValue").textContent=`${Math.round((state.step+1)/steps.length*100)}%`;
    renderSteps();if(state.step>=5)updatePreview();if(focus)$("#workspace").scrollIntoView({behavior:"smooth",block:"start"});
  }

  function selectProfile(id) {
    state.profileId=id;localStorage.setItem("aerith-forge-source-profile",id);ensureChoices();renderAll();showToast(`${profile().name} sélectionné.`);
  }

  function renderAll() {
    renderProfiles();renderHero();renderSelected();renderSources();renderImports();renderChoices();renderFlowerGirls();activateStep(state.step);updatePreview();
  }

  document.addEventListener("click",e=>{
    const p=e.target.closest("[data-profile]");if(p)selectProfile(p.dataset.profile);
    const s=e.target.closest("[data-step-button]");if(s)activateStep(Number(s.dataset.stepButton));
    const f=e.target.closest("[data-fg]");if(f){const i=Number(f.dataset.fg);if(state.flowerGirls.includes(i))state.flowerGirls=state.flowerGirls.filter(x=>x!==i);else if(state.flowerGirls.length<3)state.flowerGirls.push(i);else return showToast("Maximum : une principale et deux soutiens.");renderFlowerGirls();updatePreview()}
    const c=e.target.closest("[data-combo]");if(c){const combo=data.combinations[Number(c.dataset.combo)],ids=combo[1].map(n=>data.flowerGirls.findIndex(x=>x[0]===n)).filter(i=>i>=0);state.flowerGirls=ids.slice(0,3);renderFlowerGirls();updatePreview();showToast(combo[0])}
    const ch=e.target.closest("[data-choice]");if(ch){const id=ch.dataset.choice,pf=profile(),arr=state.choices[pf.id]||[];state.choices[pf.id]=ch.checked?[...new Set([...arr,id])]:arr.filter(x=>x!==id);renderChoices();updatePreview()}
  });

  $("#startForge").addEventListener("click",()=>activateStep(0,true));
  $("#nextTop").addEventListener("click",()=>activateStep(state.step+1));$("#nextBottom").addEventListener("click",()=>activateStep(state.step+1));
  $("#previousTop").addEventListener("click",()=>activateStep(state.step-1));$("#previousBottom").addEventListener("click",()=>activateStep(state.step-1));
  $("#fgSearch").addEventListener("input",renderFlowerGirls);

  const dz=$("#dropzone"),fi=$("#fileInput");
  $("#browseFiles").addEventListener("click",e=>{e.stopPropagation();fi.click()});dz.addEventListener("click",e=>{if(!e.target.closest("button"))fi.click()});
  dz.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" ")fi.click()});
  ["dragenter","dragover"].forEach(t=>dz.addEventListener(t,e=>{e.preventDefault();dz.classList.add("drag")}));
  ["dragleave","drop"].forEach(t=>dz.addEventListener(t,e=>{e.preventDefault();dz.classList.remove("drag")}));
  function addFiles(files){for(const file of files)state.imported.push({file});renderImports();updatePreview();showToast(`${files.length} fichier(s) ajouté(s).`)}
  fi.addEventListener("change",e=>addFiles([...e.target.files]));dz.addEventListener("drop",e=>addFiles([...e.dataTransfer.files]));
  $("#clearImports").addEventListener("click",()=>{state.imported=[];renderImports();updatePreview()});

  $("#downloadBoot").addEventListener("click",()=>downloadText(`BOOT_${cleanName(profile().name)}.md`,makeBoot()));
  $("#downloadManifest").addEventListener("click",()=>downloadText(`MANIFESTE_${cleanName(profile().name)}.md`,makeManifest()));
  $("#copyBoot").addEventListener("click",()=>copyText(makeBoot()));
  $("#copyTree").addEventListener("click",async()=>copyText(tree(await buildPackage(false))));
  $("#forgeZip").addEventListener("click",async()=>{
    const log=$("#forgeLog");log.textContent="Assemblage des sources disponibles…";
    try{const pkg=await buildPackage(true),blob=zipBlob(pkg.files);downloadBlob(`${pkg.root}_FORGE_SOURCE_FIDELE.zip`,blob);
      log.textContent=`${pkg.files.size} fichier(s) · ${(blob.size/1024).toFixed(1)} Ko${pkg.warnings.length?` · ${pkg.warnings.length} référence(s) publique(s) non récupérée(s)`:''}`;
      showToast("ZIP forgé.");}
    catch(err){log.textContent=`Erreur : ${err.message}`;showToast("Erreur de Forge.");}
  });

  ensureChoices();renderAll();
})();
