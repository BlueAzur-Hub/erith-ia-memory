"use strict";
(() => {
  const DATA = window.AERITH_PROFILE_REGISTRY;
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const encoder = new TextEncoder();
  const STORAGE_KEY = "aerith-forge-v3-3r3-profiles";
  const steps = [
    ["01","Profil","Choisir le profil demandé."],
    ["02","Sources","Charger ses vrais fichiers."],
    ["03","Contenu","Vérifier Core, Persona et prompt maître."],
    ["04","Export","Télécharger le profil complet."]
  ];
  const saved = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)||"null"); } catch { return null; } })();
  const queryProfile = new URLSearchParams(location.search).get("profile");
  const state = {
    profileId: DATA.profiles.some(p=>p.id===queryProfile) ? queryProfile : (saved?.profileId || "creator"),
    step: Number.isInteger(saved?.step) ? saved.step : 0,
    preview: saved?.preview || "core",
    imports: [],
    contents: new Map(),
    selectedPacks: new Set(saved?.selectedPacks || (DATA.profiles.find(p=>p.id===(DATA.profiles.some(q=>q.id===queryProfile)?queryProfile:(saved?.profileId || "creator")))?.defaultPacks || []))
  };

  function profile(){ return DATA.profiles.find(p=>p.id===state.profileId) || DATA.profiles[0]; }
  function persist(){ localStorage.setItem(STORAGE_KEY, JSON.stringify({profileId:state.profileId,step:state.step,preview:state.preview,selectedPacks:[...state.selectedPacks]})); }
  function esc(v){ return String(v??"").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function cleanName(v){ return String(v).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^A-Za-z0-9]+/g,"_").replace(/^_+|_+$/g,"").toUpperCase(); }
  function githubUrl(item){ const repo = profile().privacy === "private" ? DATA.repository.private : DATA.repository.public; const path = item.canonical || item.path; return `https://github.com/${repo}/blob/main/${path}`; }
  function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(toast.timer); toast.timer=setTimeout(()=>t.classList.remove("show"),2200); }
  function sourceByKind(kind){ return profile().files.find(f=>f.kind===kind); }
  function loaded(kind){ return state.contents.get(kind) || null; }
  function verifyText(fileSpec,text){ const upper=text.toUpperCase(); return (fileSpec.expected||[]).every(token=>upper.includes(token.toUpperCase())); }

  async function fetchBuiltin(spec){
    if(!spec?.builtin || state.contents.has(spec.kind)) return;
    try{
      const res=await fetch(spec.path,{cache:"no-store"});
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const bytes=new Uint8Array(await res.arrayBuffer());
      const text=new TextDecoder().decode(bytes);
      if(!verifyText(spec,text)) throw new Error("contenu inattendu");
      state.contents.set(spec.kind,{name:spec.name,path:spec.canonical||spec.path,bytes,text,source:"builtin"});
    }catch(err){ console.error(spec.path,err); }
  }
  async function loadBuiltins(){ await Promise.all(profile().files.filter(f=>f.builtin).map(fetchBuiltin)); renderAll(); }

  function profileCard(p){
    const req=p.files.filter(f=>f.required).length;
    return `<button class="profile-card ${p.id===state.profileId?'active':''}" data-profile="${p.id}"><img src="${p.visual}" alt=""><div class="profile-card-body"><span>${esc(p.family)} · ${esc(p.level)}</span><h3>${esc(p.name)}</h3><p>${esc(p.role)}</p><div class="profile-card-footer"><b>${p.privacy==='private'?'Import privé local':'Sources publiques incluses'}</b><i>${req} fichiers principaux</i></div></div></button>`;
  }
  function renderProfiles(){ $("#profileGrid").innerHTML=DATA.profiles.map(profileCard).join(""); }

  function renderHero(){
    const p=profile();
    $("#heroProfileImage").src=p.visual; $("#heroSigil").textContent=p.sigil; $("#heroProfileName").textContent=p.name; $("#heroProfileRole").textContent=p.role;
    $("#heroCoreState").textContent=loaded("core")?"Chargé":(sourceByKind("core")?.builtin?"Inclus":"À charger");
    $("#heroPersonaState").textContent=loaded("persona")?"Chargée":(sourceByKind("persona")?.builtin?"Incluse":"À charger");
    $("#heroExportState").textContent=canExport()?"Prêt":"En attente";
  }

  function renderRail(){
    const p=profile(); $("#railName").textContent=p.name; $("#railStatus").textContent=p.privacy==='private'?"Sources privées · import local":"Sources publiques incluses";
    $("#stepNav").innerHTML=steps.map((s,i)=>`<button class="profile-step ${i===state.step?'active':''}" data-step="${i}"><i>${s[0]}</i><span><b>${s[1]}</b><small>${s[2]}</small></span></button>`).join("");
    $("#progressValue").textContent=`${Math.round((state.step+1)/steps.length*100)}%`;
    const req=profile().files.filter(f=>f.required); const ok=req.filter(f=>loaded(f.kind)).length;
    $("#advisorTitle").textContent=state.step===0?"Profil demandé":state.step===1?"Sources réelles":state.step===2?"Contenu chargé":"Paquet du profil";
    $("#advisorMessage").textContent=state.step===0?"Choisissez le profil à préparer.":state.step===1?"Chargez le Core et la Persona réels du profil.":state.step===2?"Vérifiez les documents complets et le prompt maître.":"Téléchargez le profil lorsque les sources principales sont présentes.";
    $("#advisorChecks").innerHTML=`<div><span>Core</span><b>${loaded('core')?'chargé':'attendu'}</b></div><div><span>Persona</span><b>${loaded('persona')?'chargée':'attendue'}</b></div><div><span>Sources</span><b>${ok}/${req.length}</b></div>`;
  }

  function renderStep(){
    state.step=Math.max(0,Math.min(state.step,steps.length-1));
    $$(".profile-panel").forEach((p,i)=>p.classList.toggle("active",i===state.step));
    const s=steps[state.step]; $("#stepCounter").textContent=`ÉTAPE ${s[0]} SUR 04`; $("#stepTitle").textContent=s[1]; $("#stepDescription").textContent=s[2];
    $("#prevTop").disabled=$("#prevBottom").disabled=state.step===0; $("#nextTop").disabled=$("#nextBottom").disabled=state.step===steps.length-1;
    renderRail(); persist();
  }
  function goStep(i,scroll=true){ state.step=i; renderStep(); if(scroll) $("#atelier").scrollIntoView({behavior:"smooth",block:"start"}); }

  function renderProfilePanel(){
    const p=profile(); $("#activeProfileName").textContent=p.name; $("#activeProfileHeading").textContent=p.name; $("#activeProfileImage").src=p.visual; $("#activeProfileFamily").textContent=`${p.family} · ${p.level}`; $("#activeProfileRole").textContent=p.role; $("#activeProfilePrivacy").textContent=p.privacy==='private'?"PRIVÉ · IMPORT LOCAL":"PUBLIC · SOURCES INCLUSES";
    $("#sourceOrder").innerHTML=p.sourceOrder.map(x=>`<li>${esc(x)}</li>`).join("");
  }

  function sourceCard(spec){
    const item=loaded(spec.kind); const stateLabel=item?"Chargé":(spec.builtin?"Inclus":"Référence privée");
    return `<article class="source-card ${spec.required?'required':''}"><header><div><span>${esc(spec.label)}</span><h3>${esc(spec.name)}</h3></div><b class="source-state ${item?'loaded':'reference'}">${stateLabel}</b></header><code>${esc(spec.canonical||spec.path)}</code><div class="source-actions">${spec.builtin?`<button data-load-builtin="${spec.kind}">Recharger</button><a href="${spec.path}" download>Télécharger</a>`:`<button data-import-kind="${spec.kind}">Importer ce fichier</button><a href="${githubUrl(spec)}" target="_blank" rel="noopener">Ouvrir sur GitHub privé</a>`}${item?`<button data-remove-kind="${spec.kind}">Retirer</button>`:""}</div></article>`;
  }
  function renderSources(){ $("#sourceGrid").innerHTML=profile().files.map(sourceCard).join(""); $("#importList").innerHTML=state.imports.length?state.imports.map(x=>`<div class="import-item"><span><b>${esc(x.name)}</b><small>${esc(x.kind)} · ${x.bytes.length} octets</small></span><button data-remove-kind="${x.kind}">Retirer</button></div>`).join(""):`<div class="route-box"><b>Aucun fichier privé chargé</b><p>Les chemins du profil sont connus, mais leur contenu n’est pas simulé.</p></div>`; }

  function makeMasterPrompt(){
    const p=profile(); const importedMaster=loaded("master"); if(importedMaster) return importedMaster.text;
    const selected=DATA.packs.filter(x=>state.selectedPacks.has(x.id));
    return `# PROMPT MAÎTRE — ${p.name.toUpperCase()}\n\n## Activation\n\nActive ${p.name}.\n\n## Ordre de chargement\n\n${p.sourceOrder.map((x,i)=>`${i+1}. ${x}`).join("\n")}\n\n## Archives de renforcement choisies\n\n${selected.length?selected.map(x=>`- ${x.title} — ${x.file.split('/').pop()}`).join("\n"):"- Aucune archive imposée."}\n\n## Règles\n\n- Le Core fixe l’identité et les responsabilités.\n- La Persona fixe la voix, les modes et le rythme de travail.\n- Les modules servent uniquement la demande active.\n- Une référence de fichier ne signifie pas que son contenu a été chargé.\n- Ne jamais inventer le contenu d’une source absente.\n- Produire la destination utile, puis s’arrêter proprement.\n`;
  }
  function modulesText(){ const p=profile(); return `# MODULES RÉFÉRENCÉS — ${p.name}\n\n${p.modules.map(m=>`- ${m.name}\n  ${m.path}\n  Statut : référencé, contenu non chargé par défaut.`).join("\n\n")}`; }
  function previewContent(){
    if(state.preview==="master") return makeMasterPrompt(); if(state.preview==="modules") return modulesText();
    const item=loaded(state.preview); const spec=sourceByKind(state.preview);
    if(item) return item.text;
    return `# ${spec?.label||state.preview}\n\nContenu non chargé.\n\nSource attendue : ${spec?.canonical||spec?.path||"—"}\n\nImportez le fichier réel à l’étape Sources.`;
  }
  function renderPreview(){ $$("[data-preview]").forEach(b=>b.classList.toggle("active",b.dataset.preview===state.preview)); $("#profilePreview").textContent=previewContent(); $("#downloadCurrent").disabled=(state.preview==="core"||state.preview==="persona")&&!loaded(state.preview); }

  function canExport(){ return profile().files.filter(f=>f.required).every(f=>loaded(f.kind)); }
  function makeManifest(){ const p=profile(); return `# MANIFESTE — ${p.name}\n\nVersion Forge : ${DATA.version}\n\n## Sources principales\n\n${p.files.map(f=>`- [${loaded(f.kind)?"CHARGÉ":"RÉFÉRENCE"}] ${f.canonical||f.path} — ${f.label}`).join("\n")}\n\n## Modules référencés\n\n${p.modules.map(m=>`- ${m.path}`).join("\n")}\n\n## Archives sélectionnées\n\n${DATA.packs.filter(x=>state.selectedPacks.has(x.id)).map(x=>`- ${x.title}`).join("\n")||"- Aucune"}\n`;
  }
  function renderExport(){ const p=profile(); const required=p.files.filter(f=>f.required); const present=required.filter(f=>loaded(f.kind)); $("#exportStatus").textContent=canExport()?"PROFIL PRÊT":"SOURCES REQUISES"; $("#finalSummary").innerHTML=`<div class="summary-tile"><span>Profil</span><b>${esc(p.name)}</b></div><div class="summary-tile"><span>Sources principales</span><b>${present.length}/${required.length}</b></div><div class="summary-tile"><span>Archives choisies</span><b>${state.selectedPacks.size}</b></div>`; $("#exportAudit").innerHTML=required.map(f=>`<div class="audit-row ${loaded(f.kind)?'ok':'warn'}"><b>${esc(f.label)}</b><span>${loaded(f.kind)?'Fichier réel chargé':`À charger : ${esc(f.path)}`}</span></div>`).join(""); $("#forgeZip").disabled=!canExport(); $("#heroExportState").textContent=canExport()?"Prêt":"En attente"; }

  function renderPacks(){ const p=profile(); $("#packGrid").innerHTML=DATA.packs.map(pack=>`<article class="pack-card"><label><input type="checkbox" data-pack="${pack.id}" ${state.selectedPacks.has(pack.id)?'checked':''}> Sélectionner</label><h3>${esc(pack.title)}</h3><p>${esc(pack.role)}</p><a href="${pack.file}" download>Télécharger le ZIP</a></article>`).join(""); }

  async function addFile(file, forcedKind=null){
    const p=profile(); const text=await file.text(); let spec=forcedKind?sourceByKind(forcedKind):p.files.find(s=>s.name.toLowerCase()===file.name.toLowerCase());
    if(!spec){ toast(`Fichier non reconnu pour ${p.name}.`); return; }
    if(!verifyText(spec,text)){ toast(`${file.name} ne correspond pas à ${spec.label}.`); return; }
    const bytes=new Uint8Array(await file.arrayBuffer()); state.contents.set(spec.kind,{name:file.name,path:spec.path,bytes,text,source:"local"}); state.imports=state.imports.filter(x=>x.kind!==spec.kind); state.imports.push({kind:spec.kind,name:file.name,bytes}); renderAll(); toast(`${spec.label} chargé.`);
  }
  function openPicker(kind=null){ const input=$("#fileInput"); input.dataset.kind=kind||""; input.click(); }

  function downloadBlob(name,blob){ const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=name; document.body.append(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500); }
  function downloadText(name,text){ downloadBlob(name,new Blob([text],{type:"text/markdown;charset=utf-8"})); }
  function crc32(bytes){let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^(0xedb88320&-(crc&1));}return(crc^0xffffffff)>>>0;}
  function concat(parts){const len=parts.reduce((s,p)=>s+p.length,0),o=new Uint8Array(len);let off=0;for(const p of parts){o.set(p,off);off+=p.length;}return o;}
  function zipBlob(files){const local=[],central=[];let offset=0;const now=new Date(),year=Math.max(1980,now.getFullYear()),time=(now.getHours()<<11)|(now.getMinutes()<<5)|Math.floor(now.getSeconds()/2),date=((year-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate();for(const [name,raw] of files){const bytes=raw instanceof Uint8Array?raw:encoder.encode(raw),nb=encoder.encode(name),crc=crc32(bytes),lh=new Uint8Array(30+nb.length),lv=new DataView(lh.buffer);lv.setUint32(0,0x04034b50,true);lv.setUint16(4,20,true);lv.setUint16(6,0x0800,true);lv.setUint16(8,0,true);lv.setUint16(10,time,true);lv.setUint16(12,date,true);lv.setUint32(14,crc,true);lv.setUint32(18,bytes.length,true);lv.setUint32(22,bytes.length,true);lv.setUint16(26,nb.length,true);lh.set(nb,30);local.push(lh,bytes);const ch=new Uint8Array(46+nb.length),cv=new DataView(ch.buffer);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x0800,true);cv.setUint16(10,0,true);cv.setUint16(12,time,true);cv.setUint16(14,date,true);cv.setUint32(16,crc,true);cv.setUint32(20,bytes.length,true);cv.setUint32(24,bytes.length,true);cv.setUint16(28,nb.length,true);cv.setUint32(42,offset,true);ch.set(nb,46);central.push(ch);offset+=lh.length+bytes.length;}const ld=concat(local),cd=concat(central),end=new Uint8Array(22),ev=new DataView(end.buffer);ev.setUint32(0,0x06054b50,true);ev.setUint16(8,files.size,true);ev.setUint16(10,files.size,true);ev.setUint32(12,cd.length,true);ev.setUint32(16,ld.length,true);return new Blob([ld,cd,end],{type:"application/zip"});}
  function forgeProfile(){ if(!canExport()) return; const p=profile(),root=cleanName(p.name),files=new Map(); for(const spec of p.files){const item=loaded(spec.kind);if(item) files.set(`${root}/${spec.name}`,item.bytes);} files.set(`${root}/PROMPT_MAITRE_${root}.md`,encoder.encode(makeMasterPrompt())); files.set(`${root}/MANIFESTE_${root}.md`,encoder.encode(makeManifest())); files.set(`${root}/README.md`,encoder.encode(`# ${p.name}\n\nCe paquet contient les fichiers réels chargés dans la Forge, le prompt maître et le manifeste.\n\nLes sept archives de renforcement restent téléchargeables séparément.\n`)); const blob=zipBlob(files); downloadBlob(`${root}_PROFIL.zip`,blob); $("#forgeLog").textContent=`${files.size} fichiers · ${blob.size} octets`; toast("Profil téléchargé."); }

  function selectProfile(id){ state.profileId=id; state.step=0; state.preview="core"; state.imports=[]; state.contents.clear(); state.selectedPacks=new Set(DATA.profiles.find(p=>p.id===id)?.defaultPacks || []); persist(); renderAll(); loadBuiltins(); goStep(0,true); }
  function renderAll(){ renderProfiles(); renderHero(); renderRail(); renderStep(); renderProfilePanel(); renderSources(); renderPreview(); renderPacks(); renderExport(); }

  document.addEventListener("click",e=>{
    const p=e.target.closest("[data-profile]"); if(p){selectProfile(p.dataset.profile);return;}
    const s=e.target.closest("[data-step]"); if(s){goStep(Number(s.dataset.step));return;}
    const tab=e.target.closest("[data-preview]"); if(tab){state.preview=tab.dataset.preview;persist();renderPreview();return;}
    const imp=e.target.closest("[data-import-kind]"); if(imp){openPicker(imp.dataset.importKind);return;}
    const rem=e.target.closest("[data-remove-kind]"); if(rem){state.contents.delete(rem.dataset.removeKind);state.imports=state.imports.filter(x=>x.kind!==rem.dataset.removeKind);renderAll();return;}
    const reload=e.target.closest("[data-load-builtin]"); if(reload){state.contents.delete(reload.dataset.loadBuiltin);fetchBuiltin(sourceByKind(reload.dataset.loadBuiltin)).then(renderAll);return;}
  });
  $("#fileInput").addEventListener("change",async e=>{const forced=e.target.dataset.kind||null;for(const file of e.target.files)await addFile(file,forced);e.target.value="";e.target.dataset.kind="";});
  $("#browseFiles").addEventListener("click",()=>openPicker());
  $("#dropzone").addEventListener("click",e=>{if(!e.target.closest("button"))openPicker();});
  $("#dropzone").addEventListener("dragover",e=>e.preventDefault());
  $("#dropzone").addEventListener("drop",async e=>{e.preventDefault();for(const f of e.dataTransfer.files)await addFile(f);});
  $("#nextTop").onclick=$("#nextBottom").onclick=()=>goStep(state.step+1); $("#prevTop").onclick=$("#prevBottom").onclick=()=>goStep(state.step-1);
  $("#startTop").onclick=$("#startProfiles").onclick=()=>{document.querySelector("#profiles").scrollIntoView({behavior:"smooth",block:"start"});};
  $("#resetApp").onclick=()=>{localStorage.removeItem(STORAGE_KEY);location.href=location.pathname;};
  $("#downloadCurrent").onclick=()=>{if(state.preview==="master")downloadText(`PROMPT_MAITRE_${cleanName(profile().name)}.md`,makeMasterPrompt());else if(state.preview==="modules")downloadText(`MODULES_${cleanName(profile().name)}.md`,modulesText());else{const item=loaded(state.preview);if(item)downloadBlob(item.name,new Blob([item.bytes]));}};
  $("#copyCurrent").onclick=async()=>{await navigator.clipboard.writeText(previewContent());toast("Copié.");};
  $("#downloadMaster").onclick=()=>downloadText(`PROMPT_MAITRE_${cleanName(profile().name)}.md`,makeMasterPrompt());
  $("#downloadManifest").onclick=()=>downloadText(`MANIFESTE_${cleanName(profile().name)}.md`,makeManifest());
  $("#forgeZip").onclick=forgeProfile;
  $("#packGrid").addEventListener("change",e=>{if(e.target.matches("[data-pack]")){e.target.checked?state.selectedPacks.add(e.target.dataset.pack):state.selectedPacks.delete(e.target.dataset.pack);persist();renderExport();}});

  renderAll(); loadBuiltins();
})();
