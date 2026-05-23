const pages=document.querySelectorAll(".page");
const navButtons=document.querySelectorAll("[data-page]");
const drawer=document.getElementById("drawer");
const drawerText=document.getElementById("drawerText");
const drawerTitle=document.getElementById("drawerTitle");
const palette=document.getElementById("palette");
const backgroundLabel=document.getElementById("backgroundLabel");

const backgrounds=[
  {file:"seven_bg_01_citadelle_celeste.png", label:"01 · Citadelle Céleste"},
  {file:"seven_bg_02_aqueduc_du_ciel.png", label:"02 · Aqueduc du Ciel"},
  {file:"seven_bg_03_tour_celeste.png", label:"03 · Tour Céleste"},
  {file:"seven_bg_04_sanctuaire_des_nuages.png", label:"04 · Sanctuaire des Nuages"},
  {file:"seven_bg_05_archipels_suspendus.png", label:"05 · Archipels Suspendus"},
  {file:"seven_bg_06_jardin_du_cristal.png", label:"06 · Jardin du Cristal"},
  {file:"seven_bg_07_coeur_de_pierre.png", label:"07 · Cœur de Pierre"},
  {file:"seven_bg_08_ponts_ancestraux.png", label:"08 · Ponts Ancestraux"},
  {file:"seven_bg_09_arbre_du_ciel.png", label:"09 · Arbre du Ciel"},
  {file:"seven_bg_10_terrasse_etoile.png", label:"10 · Terrasse Étoile"},
  {file:"seven_bg_11_plateforme_du_vent.png", label:"11 · Plateforme du Vent"},
  {file:"seven_bg_12_falaises_de_memoire.png", label:"12 · Falaises de Mémoire"},
  {file:"seven_bg_13_sentinelle_ancienne.png", label:"13 · Sentinelle Ancienne"},
  {file:"seven_bg_14_spheres_de_laputa.png", label:"14 · Sphères de Laputa"},
  {file:"seven_bg_15_porte_du_royaume.png", label:"15 · Porte du Royaume"},
  {file:"seven_bg_16_vue_sur_linfini.png", label:"16 · Vue sur l’Infini"},
  {file:"seven_bg_17_chutes_celestes.png", label:"17 · Chutes Célestes"},
  {file:"seven_bg_18_visage_de_pierre.png", label:"18 · Visage de Pierre"},
  {file:"seven_bg_19_jardin_de_lumiere.png", label:"19 · Jardin de Lumière"},
  {file:"seven_bg_20_forteresse_des_nuages.png", label:"20 · Forteresse des Nuages"}
];

const prompts={
seven:`Chat, active Aerith-7 Seven Heaven / Full Modules Boost.

Mode texte uniquement par défaut.
Aucune génération image sans demande explicite.
Chargement minimal, choix précis.
Respecte le projet comme pupitre Seven : interface de prise en main, mémoire, production et cockpit.`,
video:`Active Seven Heaven — Video Cards Boost.

Identifier la phase.
Identifier le risque principal.
Choisir uniquement les cartes utiles.
Proposer l’action immédiate.
Définir le point d’arrêt.
Aucune génération image sans demande explicite.`,
blackout:`MODE BLACKOUT.

Aucun outil image.
Aucune génération image.
Texte uniquement : diagnostic, prompts, décisions, noms de fichiers, archivage.`,
wan:`Checklist production :
image parfaite d’abord
animation Wan/I2V ensuite
last frame protégée
DaVinci final
aucune génération non demandée`,
remote:`PRISE EN MAIN À DISTANCE — SAFE MODE

Objectif : utiliser le Transformer Book comme pupitre Seven.
Ne jamais afficher publiquement :
- RustDesk ID
- mot de passe
- IP sensible
- identifiants

Procédure :
1. Cliquer sur Ouvrir RustDesk.
2. Lire l’ID uniquement dans RustDesk local.
3. Ne jamais coller l’ID ou le mot de passe dans le HTML public.
4. Côté poste de contrôle : entrer l’ID dans RustDesk.
5. Utiliser le terminal comme cockpit : ChatGPT, GitHub, Production, Remote.`,
link:`https://blueazur-hub.github.io/erith-ia-memory/assets/SEVEN_PORTABLE_TERMINAL/index.html`
};

let bgIndex=0;

function currentPage(){
  const active=document.querySelector(".page.active");
  return active ? active.id.replace("page-","") : "home";
}

function saveUiState(){
  localStorage.setItem("seven.final.01.10.state", JSON.stringify({
    page:currentPage(),
    bgIndex,
    transparent:document.body.classList.contains("transparent"),
    readable:document.body.classList.contains("readable")
  }));
}

function showPage(name, persist=true){
  pages.forEach(page=>page.classList.toggle("active", page.id===`page-${name}`));
  navButtons.forEach(button=>button.classList.toggle("active", button.dataset.page===name));
  if(persist) saveUiState();
}

const backgroundPositions={
  "seven_bg_01_citadelle_celeste.png":"center 8%",
  "seven_bg_02_aqueduc_du_ciel.png":"center center",
  "seven_bg_03_tour_celeste.png":"center 8%",
  "seven_bg_04_sanctuaire_des_nuages.png":"center center",
  "seven_bg_05_archipels_suspendus.png":"center center",
  "seven_bg_06_jardin_du_cristal.png":"center 8%",
  "seven_bg_07_coeur_de_pierre.png":"center 42%",
  "seven_bg_08_ponts_ancestraux.png":"center 14%",
  "seven_bg_09_arbre_du_ciel.png":"center 12%",
  "seven_bg_10_terrasse_etoile.png":"center 34%",
  "seven_bg_11_plateforme_du_vent.png":"center center",
  "seven_bg_12_falaises_de_memoire.png":"center 12%",
  "seven_bg_13_sentinelle_ancienne.png":"center 38%",
  "seven_bg_14_spheres_de_laputa.png":"center 8%",
  "seven_bg_15_porte_du_royaume.png":"center 22%",
  "seven_bg_16_vue_sur_linfini.png":"center center",
  "seven_bg_17_chutes_celestes.png":"center 10%",
  "seven_bg_18_visage_de_pierre.png":"center 28%",
  "seven_bg_19_jardin_de_lumiere.png":"center center",
  "seven_bg_20_forteresse_des_nuages.png":"center 10%"
};

function applyBackground(){
  const current=backgrounds[bgIndex % backgrounds.length];
  const layer=document.getElementById("backgroundLayer");
  if(!layer || !current) return;

  layer.style.backgroundImage=`linear-gradient(90deg,rgba(0,0,0,.14),rgba(0,0,0,.01),rgba(0,0,0,.16)),linear-gradient(180deg,rgba(0,0,0,.00),rgba(0,0,0,.14)),url("${current.file}")`;
  layer.style.backgroundPosition=backgroundPositions[current.file] || "center center";
  layer.style.backgroundSize="cover";

  if(backgroundLabel){
    backgroundLabel.textContent=`Background : ${current.label}`;
  }
}

function nextBackground(){
  bgIndex=(bgIndex+1)%backgrounds.length;
  applyBackground();
  saveUiState();
}

function randomBackground(){
  bgIndex=Math.floor(Math.random()*backgrounds.length);
  applyBackground();
  saveUiState();
}

function renderTrace(){
  const entries=[
    ["OS",navigator.platform||"n/a","local / safe"],
    ["Navigateur",navigator.userAgent.split(" ").slice(0,4).join(" "),"user agent filtré"],
    ["Viewport",`${window.innerWidth} × ${window.innerHeight}`,"affichage local"],
    ["Fuseau",Intl.DateTimeFormat().resolvedOptions().timeZone||"local","heure locale"],
    ["Langue",navigator.language||"n/a","navigateur"],
    ["Background",backgrounds[bgIndex]?.label || "source","fond actif"],
    ["Remote","SAFE MODE","no RustDesk ID / no password"]
  ];

  const html=entries.map(([label,value,note])=>`<article class="trace-card"><small>${label}</small><strong>${value}</strong><em>${note}</em></article>`).join("");
  const home=document.getElementById("homeTraceGrid");
  const system=document.getElementById("systemTraceGrid");
  if(home) home.innerHTML=html;
  if(system) system.innerHTML=html;
}

async function copyText(key,title="Bloc copiable"){
  const text=prompts[key]||key||"";
  drawerTitle.textContent=title;
  drawerText.value=text;
  drawer.classList.add("open");
  drawerText.select();
  try{ await navigator.clipboard.writeText(text); }
  catch{ document.execCommand("copy"); }
}

function loadUiState(){
  try{
    const saved=JSON.parse(localStorage.getItem("seven.final.01.10.state")||"{}");
    bgIndex=Number.isInteger(saved.bgIndex) ? saved.bgIndex : Number(saved.bgIndex||0);
    if(bgIndex<0 || bgIndex>=backgrounds.length) bgIndex=0;
    document.body.classList.toggle("transparent", !!saved.transparent);
    document.body.classList.toggle("readable", !!saved.readable);
    showPage(saved.page||"home", false);
  }catch{
    showPage("home", false);
  }
  applyBackground();
}

navButtons.forEach(button=>button.addEventListener("click",()=>showPage(button.dataset.page)));
document.querySelectorAll("[data-copy]").forEach(button=>button.addEventListener("click",()=>copyText(button.dataset.copy, button.textContent.trim())));
document.querySelectorAll("[data-jump]").forEach(button=>button.addEventListener("click",()=>{showPage(button.dataset.jump); palette.classList.remove("open");}));

document.getElementById("copySevenBtn").addEventListener("click",()=>copyText("seven","Seven Heaven"));
document.getElementById("homeSevenBtn").addEventListener("click",async()=>{await copyText("seven","Seven Heaven"); window.open("https://chatgpt.com/","seven_chatgpt");});
document.getElementById("copyVideoBtn").addEventListener("click",()=>copyText("video","Video Cards Boost"));
document.getElementById("homeVideoCardsBtn").addEventListener("click",()=>copyText("video","Video Cards Boost"));
document.getElementById("copyBlackoutBtn").addEventListener("click",()=>copyText("blackout","Blackout"));
document.getElementById("copyTerminalLinkBtn").addEventListener("click",()=>copyText("link","Lien terminal"));

document.getElementById("nextBackgroundBtn").addEventListener("click",nextBackground);
document.getElementById("randomBackgroundBtn").addEventListener("click",randomBackground);
document.getElementById("toggleTransparentBtn").addEventListener("click",()=>{document.body.classList.toggle("transparent");saveUiState();});
document.getElementById("toggleReadableBtn").addEventListener("click",()=>{document.body.classList.toggle("readable");saveUiState();});
document.getElementById("toggleTraceBtn").addEventListener("click",()=>{const panel=document.getElementById("advancedPanel"); panel.hidden=!panel.hidden; renderTrace();});

document.getElementById("openRustDeskBtn").addEventListener("click",()=>{window.location.href="rustdesk://";});
document.getElementById("refreshTraceBtn").addEventListener("click",renderTrace);

document.getElementById("closeDrawerBtn").addEventListener("click",()=>drawer.classList.remove("open"));
document.getElementById("openPaletteBtn").addEventListener("click",()=>palette.classList.add("open"));
document.getElementById("closePaletteBtn").addEventListener("click",()=>palette.classList.remove("open"));

document.addEventListener("keydown",event=>{
  const order=["home","llm","github","production","remote"];
  const index=Number(event.key)-1;
  if(order[index]) showPage(order[index]);
  if(event.key==="?") palette.classList.add("open");
  if(event.key==="Escape"){
    drawer.classList.remove("open");
    palette.classList.remove("open");
  }
});

window.addEventListener("resize",renderTrace);
loadUiState();
renderTrace();
