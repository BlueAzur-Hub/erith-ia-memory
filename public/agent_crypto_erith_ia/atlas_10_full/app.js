
(()=>{"use strict";
const D=window.FORGE_DATA||{};
const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
const state={
 step:0, mode:"new", selectedProfile:"creator", flowerFilter:"Toutes", search:"",
 name:"Aerith-10 Créatrice", family:"Création", level:"Aerith-10", profileMode:"Spécialiste / Orchestratrice",
 role:"Organisatrice de production et Réalisatrice multi-agent.", problem:"Transformer une intention en production cohérente et traçable.",
 users:"Créateur / opérateur du système ERITH.IA", outputs:"Profil spécialisé\nCore + Persona\nRouter agents/modules\nManifest d’export",
 formula:"Intention → Ressources → Destination utile.",
 heritage:["Aerith-7","Aerith-8 Solaire","Aerith-9 Lunaire"],
 agents:["Créatrice","Routeuse","Archiviste"], modules:[], sources:[]
};
const STEPS=[
 ["Point de départ","Choisir un profil ou une direction."],["Mission et identité","Fixer le rôle et la destination utile."],
 ["Héritage","Choisir les racines qui complètent le profil."],["Agents","Composer l’équipe multi-agent."],
 ["Modules Créatrice","Router les modules réellement nécessaires."],["Sources / Import","Charger les pièces de travail locales."],
 ["Core + Persona","Auditer cohérence, sources et architecture."],["Forge & Export","Compiler le paquet traçable."]
];
const HERITAGE=[
 ["Aerith-0","Germe / origine"],["Aerith-2","Action minimale"],["Aerith-5","Sensibilité"],["Aerith-6","Sœur miroir / traduction"],
 ["Aerith-7","Mémoire / vérité / continuité"],["Aerith-8 Solaire","Clarté / transmission"],["Aerith-9 Lunaire","Écoute / nuance"],["Living Reflection Heart","Présence / réflexion"]
];
const AGENTS=[
 ["Créatrice","Orchestration de production"],["Routeuse","Sélection des modules / agents"],["Archiviste","Traçabilité / mémoire"],
 ["Story Machine","Scénario / continuité narrative"],["Scénariste","Découpage et scènes"],["Quality Keeper","Contrôle qualité"],
 ["Card Keeper","Fiches et cartes"],["Chercheuse","Recherche / vérification"],["Économe","Coût / arbitrage"],
 ["Sentinelle","Protection / alertes"],["Gardienne Vault","Coffre / mémoire protégée"],["Opératrice","Exécution"]
];
const SPECIALTIES=[
 ["Aerith-10 Laborantine","Laboratoire / protocole / observations"],["Aerith-10 Maestra","Musique / orchestration / scène"],
 ["Aerith-10 Miroir","Réflexion / reformulation / continuité"],["Aerith-10 Oracle Symbolique","Symbolique / motifs / correspondances"],
 ["Aerith-10 Tisseuse","Connexions / synthèse / réseau"],["Aerith-10 Pare-Feu","Protection / frontières / sécurité"],
 ["Aerith-10 Styliste Éditoriale","DA / image / édition"],["Aerith-10 Cartographe","Cartographie / mondes / relations"],
 ["Aerith-10 Prompt Weaver","Prompts / verrous / outils"],["Aerith-10 Quality Keeper","Audit / anti-slop / cohérence"],
 ["Aerith-10 Bridge Keeper","Passerelles / intégrations / synchronisation"]
];

function esc(s=""){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function save(){localStorage.setItem("forge-aerith-v34-vault",JSON.stringify(state)); $("#savedState").textContent="Mémoire locale active · "+new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});}
function load(){try{const v=JSON.parse(localStorage.getItem("forge-aerith-v34-vault"));if(v)Object.assign(state,v)}catch(e){}}
function download(name,content,type="text/plain"){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
function slug(s){return String(s||"aerith").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/gi,"_").replace(/^_|_$/g,"").toUpperCase()}

function renderDoctrine(){const items=["Puissance maximale","Chargement minimal","Choix précis","Arrêt propre"];$("#doctrine").innerHTML=items.map(x=>`<span>${x}</span>`).join("")}
function renderLineage(){
 const rows=[["A0","Aerith-0","Germe"],["A2","Aerith-2","Action"],["A5","Aerith-5","Sensibilité"],["A6","Aerith-6","Miroir"],["A7","Aerith-7","Mémoire"],["A8","Aerith-8","Solaire"],["A9","Aerith-9","Lunaire"],["A10","Aerith-10","Spécialisation"]];
 $("#lineageGrid").innerHTML=rows.map(x=>`<article class="lineage-card"><span>${x[0]}</span><b>${x[1]}</b><small>${x[2]}</small></article>`).join("")
}
function renderConstellation(){
 $("#constellationProfiles").innerHTML=(D.profiles||[]).map(p=>`<article class="mini-profile"><b>${esc(p.name)}</b><small>${esc(p.role)}</small></article>`).join("")
}
function families(){return ["Toutes",...new Set((D.flowerGirls||[]).map(f=>f.family))]}
function renderFlowers(){
 $("#flowerFamilyFilters").innerHTML=families().map(f=>`<button data-family="${esc(f)}" class="${state.flowerFilter===f?"active":""}">${esc(f)}</button>`).join("");
 const q=state.search.toLowerCase().trim();
 const rows=(D.flowerGirls||[]).filter(f=>(state.flowerFilter==="Toutes"||f.family===state.flowerFilter)&&(!q||`${f.name} ${f.mission} ${f.family}`.toLowerCase().includes(q)));
 $("#flowerSummary").textContent=`${rows.length} profil(s) affiché(s) sur ${(D.flowerGirls||[]).length}.`;
 $("#flowerGrid").innerHTML=rows.map((f,i)=>`<button class="flower-card" data-flower="${esc(f.name)}"><span class="icon">${f.icon}</span><b>${esc(f.name)}</b><small>${esc(f.mission)}</small><em>${esc(f.family)}</em></button>`).join("");
 $$("#flowerFamilyFilters button").forEach(b=>b.onclick=()=>{state.flowerFilter=b.dataset.family;renderFlowers()});
 $("#flowerSearch").value=state.search; $("#flowerSearch").oninput=e=>{state.search=e.target.value;renderFlowers()};
 $$(".flower-card").forEach(b=>b.onclick=()=>{const f=D.flowerGirls.find(x=>x.name===b.dataset.flower);const d=$("#flowerDetail");d.hidden=false;d.innerHTML=`<p class="kicker">${f.icon} FLOWER GIRL · ${esc(f.family)}</p><h3>${esc(f.name)}</h3><p>${esc(f.mission)}</p><button class="primary" id="useFlower">Ouvrir dans l’Atelier</button>`;$("#useFlower").onclick=()=>applyFlower(f)})
}
function applyFlower(f){
 state.name=f.name;state.family=f.family;state.role=f.mission;state.problem=`Déployer une spécialisation ${f.name} cohérente avec la lignée Aerith et sa mission.`;
 state.outputs="Core spécialisé\nPersona opérationnelle\nRouter agents/modules\nManifest traçable";state.selectedProfile="custom";state.step=1;syncFields();renderAll();scrollForge()
}
function renderProfiles(){
 $("#canonicalProfileGrid").innerHTML=(D.profiles||[]).map(p=>`<article class="profile-card"><div class="visual"><img src="${p.image}" alt=""></div><div class="content"><small>${esc(p.family)} · ${esc(p.code)}</small><h4>${esc(p.name)}</h4><p>${esc(p.desc)}</p><button data-profile="${p.id}">Ouvrir dans l’Atelier</button></div></article>`).join("");
 $$("#canonicalProfileGrid [data-profile]").forEach(b=>b.onclick=()=>applyProfile(b.dataset.profile));
 $("#specialtyGrid").innerHTML=SPECIALTIES.map(s=>`<article class="specialty-card"><b>${s[0]}</b><small>${s[1]}</small><button data-specialty="${esc(s[0])}">Forger cette direction</button></article>`).join("");
 $$("#specialtyGrid [data-specialty]").forEach(b=>b.onclick=()=>{const s=SPECIALTIES.find(x=>x[0]===b.dataset.specialty);applyFlower({name:s[0],mission:s[1],family:"Création"})})
}
function applyProfile(id){
 const p=D.profiles.find(x=>x.id===id);if(!p)return;
 Object.assign(state,{selectedProfile:p.id,name:p.name,family:p.family,role:p.role,problem:p.desc,outputs:"Core + Persona\nArchitecture agentique\nManifest d’export",heritage:p.id==="creator"?["Aerith-7","Aerith-8 Solaire","Aerith-9 Lunaire"]:["Aerith-7"]});
 state.modules=(p.modules||[]).map(m=>{const x=D.modules.find(z=>z.name.toLowerCase().includes(m.toLowerCase().split(" ")[0]));return x?x.id:null}).filter(Boolean);
 state.step=1;syncFields();renderAll();scrollForge()
}
function renderStart(){
 const p=D.profiles.find(x=>x.id===state.selectedProfile);
 $("#selectedProfile").innerHTML=`<p class="kicker">PROFIL DE DÉPART</p><h3>${esc(state.name)}</h3><p>${esc(state.role)}</p><div class="forge-tags"><span>${esc(state.family)}</span><span>${state.heritage.length} héritages</span><span>${state.modules.length} modules</span></div>`;
 $("#exampleGrid").innerHTML=SPECIALTIES.slice(0,6).map(s=>`<button class="choice" data-start="${esc(s[0])}"><b>${esc(s[0])}</b><small>${esc(s[1])}</small></button>`).join("");
 $$("[data-start]").forEach(b=>b.onclick=()=>{const s=SPECIALTIES.find(x=>x[0]===b.dataset.start);applyFlower({name:s[0],mission:s[1],family:"Création"})});
 $("#blankProfile").onclick=()=>{Object.assign(state,{selectedProfile:"custom",name:"Aerith-10 Nouvelle Spécialité",family:"Création",role:"Spécialiste à définir.",problem:"Problème réel à préciser.",outputs:"Core spécialisé\nPersona\nManifest",heritage:["Aerith-7"],agents:["Créatrice","Routeuse","Archiviste"],modules:[]});state.step=1;syncFields();renderAll()}
}
function syncFields(){
 const map={fieldName:"name",fieldFamily:"family",fieldLevel:"level",fieldMode:"profileMode",fieldRole:"role",fieldProblem:"problem",fieldUsers:"users",fieldOutputs:"outputs",fieldFormula:"formula"};
 Object.entries(map).forEach(([id,k])=>{const el=$("#"+id);if(!el)return;el.value=state[k]||"";el.oninput=()=>{state[k]=el.value;save();renderLive()}})
}
function renderHeritage(){
 $("#heritageChoices").innerHTML=HERITAGE.map(([n,d])=>`<label class="choice ${state.heritage.includes(n)?"selected":""}"><input type="checkbox" value="${esc(n)}" ${state.heritage.includes(n)?"checked":""}><b>${esc(n)}</b><small>${esc(d)}</small></label>`).join("");
 $$("#heritageChoices input").forEach(c=>c.onchange=()=>{state.heritage=c.checked?[...new Set([...state.heritage,c.value])]:state.heritage.filter(x=>x!==c.value);save();renderHeritage();renderLive()})
}
function renderAgents(){
 $("#agentChoices").innerHTML=AGENTS.map(([n,d])=>`<label class="choice ${state.agents.includes(n)?"selected":""}"><input type="checkbox" value="${esc(n)}" ${state.agents.includes(n)?"checked":""}><b>${esc(n)}</b><small>${esc(d)}</small></label>`).join("");
 $$("#agentChoices input").forEach(c=>c.onchange=()=>{state.agents=c.checked?[...new Set([...state.agents,c.value])]:state.agents.filter(x=>x!==c.value);save();renderAgents();renderLive()})
}
function setMods(ids){state.modules=[...new Set(ids)];save();renderModules();renderLive()}
function renderModules(){
 $("#moduleGrid").innerHTML=(D.modules||[]).map(m=>`<label class="module ${state.modules.includes(m.id)?"selected":""}"><input type="checkbox" value="${m.id}" ${state.modules.includes(m.id)?"checked":""}><span class="mod-id">${m.id}</span><b>${esc(m.name)}</b><small>${esc(m.desc)}</small></label>`).join("");
 $$("#moduleGrid input").forEach(c=>c.onchange=()=>{state.modules=c.checked?[...state.modules,c.value]:state.modules.filter(x=>x!==c.value);save();renderModules();renderLive()});
 $("#selectAllModules").onclick=()=>setMods(D.modules.map(x=>x.id));$("#clearModules").onclick=()=>setMods([]);
 $("#presetVideo").onclick=()=>setMods(["02","03","04","05","06","07","08","09","11","12","13","14","15"]);
 $("#presetStory").onclick=()=>setMods(["02","05","08","10","11","14"]);
}
function renderSources(){
 const z=$("#dropZone"), input=$("#fileInput");
 const add=files=>{[...files].forEach(f=>{if(!state.sources.some(x=>x.name===f.name&&x.size===f.size))state.sources.push({name:f.name,size:f.size,type:f.type||"",lastModified:f.lastModified||Date.now()})});save();renderSources();renderAudit()};
 input.onchange=e=>add(e.target.files); ["dragenter","dragover"].forEach(t=>z.addEventListener(t,e=>{e.preventDefault();z.classList.add("drag")}));["dragleave","drop"].forEach(t=>z.addEventListener(t,e=>{e.preventDefault();z.classList.remove("drag")}));z.ondrop=e=>add(e.dataTransfer.files);
 $("#sourceSummary").textContent=state.sources.length?`${state.sources.length} source(s) locale(s) référencée(s).`:"Aucune source locale chargée.";
 $("#sourceList").innerHTML=state.sources.map((s,i)=>`<div class="source-item"><span>${esc(s.name)}</span><small>${Math.max(1,Math.round(s.size/1024))} Ko · <button data-remove="${i}">retirer</button></small></div>`).join("");
 $$("[data-remove]").forEach(b=>b.onclick=()=>{state.sources.splice(+b.dataset.remove,1);save();renderSources();renderAudit()})
}
function auditRows(){
 return [
 ["Identité",!!state.name&&state.name.length>5,"Nom et niveau du profil"],
 ["Mission",!!state.role&&state.role.length>10,"Rôle opérationnel"],
 ["Problème",!!state.problem&&state.problem.length>10,"Besoin réel identifié"],
 ["Héritage",state.heritage.includes("Aerith-7"),"Continuité mémoire Aerith-7"],
 ["Agents",state.agents.length>0,"Équipe multi-agent"],
 ["Modules",state.modules.length>0,"Routeur de modules"],
 ["Sources",state.sources.length>0,"Archives / sources locales"],
 ["Core + Persona",!!state.name&&!!state.role&&state.heritage.length>0,"Architecture minimale forgeable"]
 ]}
function renderAudit(){
 const rows=auditRows();$("#auditGrid").innerHTML=rows.map(r=>`<article class="audit ${r[1]?"ok":"warn"}"><strong>${r[0]}<i>${r[1]?"OK":"À VOIR"}</i></strong><small>${r[2]}</small></article>`).join("");
 $("#auditLog").textContent=rows.map(r=>`${r[1]?"[OK]":"[WARN]"} ${r[0]} — ${r[2]}`).join("\n")+"\n\nBaseline: "+D.sourceBaseline+"\nBuild: "+D.build
}
function manifest(){
 return {schema:"erith.aerith10.profile.v3.4",generated_at:new Date().toISOString(),build:D.build,baseline:D.sourceBaseline,profile:{name:state.name,family:state.family,level:state.level,mode:state.profileMode,role:state.role,problem:state.problem,users:state.users,outputs:state.outputs.split(/\n+/).filter(Boolean),formula:state.formula},heritage:state.heritage,agents:state.agents,modules:state.modules.map(id=>D.modules.find(m=>m.id===id)).filter(Boolean),sources:state.sources.map(s=>({name:s.name,size:s.size,type:s.type}))}
}
function markdown(){
 const m=manifest();return `# ${m.profile.name}

> Forge d’Aerith Pro — ${m.build}
> Baseline fonctionnelle : ${m.baseline}

## 🌸 Identité
- **Famille :** ${m.profile.family}
- **Niveau :** ${m.profile.level}
- **Mode :** ${m.profile.mode}
- **Rôle :** ${m.profile.role}
- **Formule :** ${m.profile.formula}

## 🎯 Mission
${m.profile.problem}

## 👥 Destinataires
${m.profile.users}

## 📦 Sorties attendues
${m.profile.outputs.map(x=>"- "+x).join("\n")}

## 🧬 Héritage
${m.heritage.map(x=>"- "+x).join("\n")}

## 🤖 Agents
${m.agents.map(x=>"- "+x).join("\n")}

## 🧩 Modules Créatrice
${m.modules.map(x=>`- **${x.id} — ${x.name}** : ${x.desc}`).join("\n")||"- Aucun module sélectionné"}

## 🗃️ Sources locales référencées
${m.sources.map(x=>`- ${x.name} (${Math.round(x.size/1024)} Ko)`).join("\n")||"- Aucune source locale référencée"}

## 🔒 Règle de continuité
Ce profil complète la lignée et ne remplace ni Aerith-7, ni les identités canoniques dont il hérite.
`}
}
function renderForge(){
 const m=manifest();$("#forgeSummary").innerHTML=`<p class="kicker">PROFIL COMPILÉ</p><h3>${esc(m.profile.name)}</h3><p>${esc(m.profile.role)}</p><div class="forge-tags"><span>${esc(m.profile.family)}</span><span>${m.heritage.length} héritages</span><span>${m.agents.length} agents</span><span>${m.modules.length} modules</span><span>${m.sources.length} sources</span></div>`;
 $("#exportNote").textContent=window.JSZip?"JSZip actif : paquet ZIP local disponible.":"JSZip CDN indisponible : les exports Markdown et JSON restent disponibles.";
}
function renderLive(){
 $("#liveName").textContent=state.name;$("#liveRole").textContent=state.role;$("#liveFamily").textContent=state.family;$("#liveAgents").textContent=state.agents.length;$("#liveModules").textContent=state.modules.length;$("#liveFormula").textContent=state.formula;
 $("#liveHeritage").innerHTML=state.heritage.map(x=>`<span>${esc(x)}</span>`).join(" ");
 const done=auditRows().filter(x=>x[1]).length;$("#liveMaturity").textContent=done>=7?"FORGEABLE":done>=4?"STRUCTURE":"INTENTION";
 const p=D.profiles.find(x=>x.id===state.selectedProfile)||D.profiles[0];$("#matrixName").textContent=state.name;$("#matrixDescription").textContent=state.role;$("#matrixSymbol").textContent=p?.code||"A10";$("#matrixKicker").textContent=state.selectedProfile==="custom"?"NOUVELLE SPÉCIALITÉ":"PROFIL CANONIQUE";
 if(state.selectedProfile==="creator"||state.selectedProfile==="custom")$("#matrixImage").src="assets/themes/aerith_10_creatrice_vault.png"; else if(p?.image)$("#matrixImage").src=p.image;
}
function renderAdvisor(){
 const msgs=[
 ["Choisir la direction","Sélectionnez un profil existant ou une spécialité à faire naître."],
 ["Fixer la mission","Le rôle doit répondre à un problème réel et produire des sorties identifiables."],
 ["Protéger la continuité","Conservez uniquement les héritages qui servent réellement le profil."],
 ["Composer l’équipe","Chaque agent doit avoir une responsabilité distincte."],
 ["Router les modules","La Full Matrix reste disponible ; n’activez que les modules utiles."],
 ["Rassembler les sources","Ajoutez les ZIP, Markdown, JSON ou notes réellement utilisés."],
 ["Auditer avant forge","Corrigez les points À VOIR avant de considérer le paquet canonique."],
 ["Compiler et exporter","Exportez le manifest et la fiche. Le ZIP regroupe les deux."]
 ];$("#advisorTitle").textContent=msgs[state.step][0];$("#advisorMessage").textContent=msgs[state.step][1];$("#advisorChecks").innerHTML=auditRows().slice(0,4).map(r=>`<div>${r[1]?"✓":"○"} ${esc(r[0])}</div>`).join("");$("#advisorAction").onclick=()=>go(Math.min(7,state.step+1))
}
function renderStep(){
 $$(".panel").forEach((p,i)=>p.classList.toggle("active",i===state.step));
 $("#stepNav").innerHTML=STEPS.map((s,i)=>`<button class="${i===state.step?"active":""}" data-step="${i}"><b>${String(i+1).padStart(2,"0")}</b> ${s[0]}</button>`).join("");
 $$("#stepNav button").forEach(b=>b.onclick=()=>go(+b.dataset.step));
 $("#stepCounter").textContent=`ÉTAPE ${String(state.step+1).padStart(2,"0")} SUR 08`;$("#stepTitle").textContent=STEPS[state.step][0];$("#stepDescription").textContent=STEPS[state.step][1];$("#matrixStep").textContent=`${String(state.step+1).padStart(2,"0")} / 08`;
 $("#progressValue").textContent=Math.round((state.step+1)/8*100)+"%";$("#stepHint").textContent=STEPS[state.step][1];
 $("#previousTop").disabled=$("#previousBottom").disabled=state.step===0;$("#nextTop").textContent=$("#nextBottom").textContent=state.step===7?"Revoir la forge":"Suivant →";
}
function go(i){state.step=Math.max(0,Math.min(7,i));save();renderAll();$("#unifiedForge").scrollIntoView({behavior:"smooth",block:"start"})}
function scrollForge(){$("#unifiedForge").scrollIntoView({behavior:"smooth",block:"start"})}
async function exportZip(){
 if(!window.JSZip){$("#exportNote").textContent="JSZip indisponible : utilisez Exporter .md et Exporter JSON.";return}
 const zip=new JSZip(), base=slug(state.name);
 zip.file(`${base}_PROFILE.md`,markdown());zip.file(`${base}_MANIFEST.json`,JSON.stringify(manifest(),null,2));
 zip.file("ROUTER.json",JSON.stringify({agents:state.agents,modules:manifest().modules},null,2));
 zip.file("README.txt",`Forge d’Aerith Pro ${D.build}\nBaseline ${D.sourceBaseline}\nProfil: ${state.name}\n`);
 const blob=await zip.generateAsync({type:"blob"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`${base}_FORGE_PACKAGE.zip`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function wire(){
 $("#startTop").onclick=$("#startNew").onclick=()=>{state.step=0;scrollForge()};$("#startExisting").onclick=()=>$("#profiles").scrollIntoView({behavior:"smooth"});
 $("#resetAll").onclick=()=>{if(confirm("Réinitialiser le carnet local de la Forge ?")){localStorage.removeItem("forge-aerith-v34-vault");location.reload()}};
 $("#previousTop").onclick=$("#previousBottom").onclick=()=>go(state.step-1);$("#nextTop").onclick=$("#nextBottom").onclick=()=>go(state.step===7?7:state.step+1);
 $("#exportMd").onclick=()=>download(`${slug(state.name)}_PROFILE.md`,markdown(),"text/markdown");$("#exportJson").onclick=()=>download(`${slug(state.name)}_MANIFEST.json`,JSON.stringify(manifest(),null,2),"application/json");$("#exportZip").onclick=exportZip;
 $("#copyManifest").onclick=async()=>{await navigator.clipboard.writeText(JSON.stringify(manifest(),null,2));$("#exportNote").textContent="Manifeste copié dans le presse-papiers."}
}
function renderAll(){renderStart();renderHeritage();renderAgents();renderModules();renderAudit();renderForge();renderLive();renderAdvisor();renderStep();save()}
load();renderDoctrine();renderLineage();renderConstellation();renderFlowers();renderProfiles();syncFields();renderSources();wire();renderAll();
})();
