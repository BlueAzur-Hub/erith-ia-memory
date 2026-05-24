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


const castleBackgrounds=[
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_FLOATING_CITY_1920x1080.png", label:"Château · Floating City"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_MINING_TOWN_SUNRISE_1920x1080.png", label:"Château · Mining Town Sunrise"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_AIRSHIP_APPROACH_1920x1080.png", label:"Château · Airship Approach"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_STORYBOOK_FLOATING_CITY_1920x1080.png", label:"Château · Storybook Floating City"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_TOWN_STREET_FIGHT_1920x1080.png", label:"Château · Town Street Fight"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_CARRIAGE_STREET_CHAOS_1920x1080.png", label:"Château · Carriage Street Chaos"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_CLIFFSIDE_INDUSTRIAL_CITY_1920x1080.png", label:"Château · Cliffside Industrial City"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_STEAM_TRAIN_TRESTLE_CANYON_1920x1080.png", label:"Château · Steam Train Trestle Canyon"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_MOUNTAIN_STONE_HOUSE_1920x1080.png", label:"Château · Mountain Stone House"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_UNDERGROUND_CRYSTAL_MINE_1920x1080.png", label:"Château · Underground Crystal Mine"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_ANCIENT_ROBOT_RELIC_1920x1080.png", label:"Château · Ancient Robot Relic"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_SKY_PIRATE_FAMILY_TABLE_1920x1080.png", label:"Château · Sky Pirate Family Table"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_CHILDHOOD_MEMORY_HEARTH_1920x1080.png", label:"Château · Childhood Memory Hearth"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_PROTECTIVE_PENDANT_AWAKENING_1920x1080.png", label:"Château · Protective Pendant Awakening"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_BURNING_FORTRESS_AIRSHIP_1920x1080.png", label:"Château · Burning Fortress Airship"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_PRINCESS_AND_PIRATE_GRANDMOTHER_1920x1080.png", label:"Château · Princess And Pirate Grandmother"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_GRANDPARENTS_PLAYING_CHESS_1920x1080.png", label:"Château · Grandparents Playing Chess"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_AIRSHIP_COMMAND_ROOM_1920x1080.png", label:"Château · Airship Command Room"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_CASTLE_CLOSE_VIEW_1920x1080.png", label:"Château · Castle Close View"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_SACRED_GARDENS_1920x1080.png", label:"Château · Sacred Gardens"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_ANCIENT_SANCTUARY_GATE_1920x1080.png", label:"Château · Ancient Sanctuary Gate"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_ANCIENT_FOREST_PATH_1920x1080.png", label:"Château · Ancient Forest Path"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_OVERGROWN_GREENHOUSE_DOME_1920x1080.png", label:"Château · Overgrown Greenhouse Dome"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_TREE_CROWN_CASTLE_1920x1080.png", label:"Château · Tree Crown Castle"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_MEMORIAL_STONE_PLAQUE_1920x1080.png", label:"Château · Memorial Stone Plaque"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_GARDIAN_TREE_MEMORY_1920x1080.png", label:"Château · Gardian Tree Memory"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_AIRSHIP_DOCKING_SKY_RUINS_1920x1080.png", label:"Château · Airship Docking Sky Ruins"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_TREASURE_MECHANICAL_RELICS_1920x1080.png", label:"Château · Treasure Mechanical Relics"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_ROOTS_CRYSTAL_CORE_1920x1080.png", label:"Château · Roots Crystal Core"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_AIRSHIP_FIRE_BLAST_1920x1080.png", label:"Château · Airship Fire Blast"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_HEIR_WATCHING_AIRSHIP_1920x1080.png", label:"Château · Heir Watching Airship"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_CRYSTAL_SELF_DESTRUCTION_SPELL_1920x1080.png", label:"Château · Crystal Self Destruction Spell"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_CRUMBLING_ROOT_TOWER_1920x1080.png", label:"Château · Crumbling Root Tower"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_FLOATING_ISLAND_ROOTS_OVERVIEW_1920x1080.png", label:"Château · Floating Island Roots Overview"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_GLIDER_OVER_SACRED_GARDENS_1920x1080.png", label:"Château · Glider Over Sacred Gardens"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_PIRATES_TREASURE_JOY_1920x1080.png", label:"Château · Pirates Treasure Joy"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_SKY_PIRATES_ESCAPE_1920x1080.png", label:"Château · Sky Pirates Escape"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_FINAL_ASCENSION_NIGHT_1920x1080.png", label:"Château · Final Ascension Night"},
  {file:"ERITH_IA_BACKGROUND_CHATEAU_CIEL_FINAL_RETURN_SUNSET_1920x1080.png", label:"Château · Final Return Sunset"}
];

function activeBackgrounds(){
  return bgSeries==="castle" ? castleBackgrounds : backgrounds;
}

function activeBackgroundSeriesLabel(){
  return bgSeries==="castle" ? "Château dans le Ciel" : "Seven Heaven";
}


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
let bgSeries="seven";

function currentPage(){
  const active=document.querySelector(".page.active");
  return active ? active.id.replace("page-","") : "home";
}

function saveUiState(){
  localStorage.setItem("seven.final.01.10.state", JSON.stringify({
    page:currentPage(),
    bgIndex,
    bgSeries,
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
  "seven_bg_20_forteresse_des_nuages.png":"center 10%",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_FLOATING_CITY_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_MINING_TOWN_SUNRISE_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_AIRSHIP_APPROACH_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_STORYBOOK_FLOATING_CITY_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_TOWN_STREET_FIGHT_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_CARRIAGE_STREET_CHAOS_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_CLIFFSIDE_INDUSTRIAL_CITY_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_STEAM_TRAIN_TRESTLE_CANYON_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_MOUNTAIN_STONE_HOUSE_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_UNDERGROUND_CRYSTAL_MINE_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_ANCIENT_ROBOT_RELIC_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_SKY_PIRATE_FAMILY_TABLE_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_CHILDHOOD_MEMORY_HEARTH_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_PROTECTIVE_PENDANT_AWAKENING_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_BURNING_FORTRESS_AIRSHIP_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_PRINCESS_AND_PIRATE_GRANDMOTHER_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_GRANDPARENTS_PLAYING_CHESS_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_AIRSHIP_COMMAND_ROOM_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_CASTLE_CLOSE_VIEW_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_SACRED_GARDENS_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_ANCIENT_SANCTUARY_GATE_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_ANCIENT_FOREST_PATH_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_OVERGROWN_GREENHOUSE_DOME_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_TREE_CROWN_CASTLE_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_MEMORIAL_STONE_PLAQUE_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_GARDIAN_TREE_MEMORY_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_AIRSHIP_DOCKING_SKY_RUINS_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_TREASURE_MECHANICAL_RELICS_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_ROOTS_CRYSTAL_CORE_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_AIRSHIP_FIRE_BLAST_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_HEIR_WATCHING_AIRSHIP_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_CRYSTAL_SELF_DESTRUCTION_SPELL_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_CRUMBLING_ROOT_TOWER_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_FLOATING_ISLAND_ROOTS_OVERVIEW_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_GLIDER_OVER_SACRED_GARDENS_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_PIRATES_TREASURE_JOY_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_SKY_PIRATES_ESCAPE_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_FINAL_ASCENSION_NIGHT_1920x1080.png":"center center",
  "ERITH_IA_BACKGROUND_CHATEAU_CIEL_FINAL_RETURN_SUNSET_1920x1080.png":"center center"
};

function applyBackground(){
  const list=activeBackgrounds();
  if(bgIndex<0 || bgIndex>=list.length) bgIndex=0;

  const current=list[bgIndex % list.length];
  const layer=document.getElementById("backgroundLayer");
  if(!layer || !current) return;

  const isCastle=current.file.indexOf("ERITH_IA_BACKGROUND_CHATEAU_CIEL_")===0;
  const cacheTag="v=20260525-fix11";
  const imageUrl=isCastle ? `./${current.file}?${cacheTag}` : current.file;

  layer.replaceChildren();
  layer.style.opacity="1";
  layer.style.visibility="visible";
  layer.style.display="block";
  layer.style.filter="none";

  if(isCastle){
    layer.style.backgroundImage=`url("${imageUrl}")`;
  }else{
    layer.style.backgroundImage=`linear-gradient(90deg,rgba(0,0,0,.14),rgba(0,0,0,.01),rgba(0,0,0,.16)),linear-gradient(180deg,rgba(0,0,0,.00),rgba(0,0,0,.14)),url("${imageUrl}")`;
  }

  layer.style.backgroundPosition=backgroundPositions[current.file] || "center center";
  layer.style.backgroundSize="cover";
  layer.style.backgroundRepeat="no-repeat";

  layer.dataset.currentBackgroundFile=current.file;
  layer.dataset.currentBackgroundUrl=imageUrl;
  document.body.classList.toggle("castle-theme-active", isCastle);

  if(backgroundLabel){
    backgroundLabel.textContent=`${activeBackgroundSeriesLabel()} : ${current.label}`;
  }

  const themeBtn=document.getElementById("toggleBackgroundSeriesBtn");
  if(themeBtn){
    themeBtn.textContent=bgSeries==="castle" ? "Thème : Château" : "Thème : Seven";
  }
}

function nextBackground(){
  const list=activeBackgrounds();
  bgIndex=(bgIndex+1)%list.length;
  applyBackground();
  saveUiState();
}

function randomBackground(){
  const list=activeBackgrounds();
  bgIndex=Math.floor(Math.random()*list.length);
  applyBackground();
  saveUiState();
}

function toggleBackgroundSeries(){
  bgSeries=bgSeries==="castle" ? "seven" : "castle";
  bgIndex=0;
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
    bgSeries=saved.bgSeries==="castle" ? "castle" : "seven";
    if(bgIndex<0 || bgIndex>=activeBackgrounds().length) bgIndex=0;
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

/* Seven final clean — robust background theme toggle
   Scope: background series button only.
   Safe late binding: works even if earlier listeners failed or DOM order changed. */
(function(){
  function sevenBgSafeList(){
    if(typeof activeBackgrounds === "function") return activeBackgrounds();
    if(Array.isArray(window.backgrounds)) return window.backgrounds;
    return [];
  }

  function sevenBgSetThemeButtonLabel(){
    const button=document.getElementById("toggleBackgroundSeriesBtn");
    if(!button) return;
    const current=(typeof bgSeries !== "undefined" && bgSeries==="castle") ? "castle" : "seven";
    button.textContent=current==="castle" ? "Thème : Château" : "Thème : Seven";
  }

  function sevenBgToggleTheme(){
    if(typeof bgSeries === "undefined") return;
    bgSeries=bgSeries==="castle" ? "seven" : "castle";
    if(typeof bgIndex !== "undefined") bgIndex=0;
    if(typeof applyBackground === "function") applyBackground();
    if(typeof saveUiState === "function") saveUiState();
    sevenBgSetThemeButtonLabel();
  }

  function sevenBgInstallThemeButton(){
    const button=document.getElementById("toggleBackgroundSeriesBtn");
    if(!button || button.dataset.seriesBound==="1") return;
    button.dataset.seriesBound="1";
    button.addEventListener("click", sevenBgToggleTheme);
    sevenBgSetThemeButtonLabel();
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded", sevenBgInstallThemeButton);
  }else{
    sevenBgInstallThemeButton();
  }
  window.addEventListener("load", sevenBgInstallThemeButton);
})();



/* Seven final clean — YouTube Top 10 clean accordion
   Scope: Top 10 vidéos section only.
   Removes legacy open/replier button and lets the full section header toggle the list. */
(function(){
  const STORAGE_KEY = "seven.youtube.top10.collapsed";

  function top10Panel(){
    const stable = document.getElementById("ytTopListStable");
    return stable ? stable.closest(".advanced-panel") : null;
  }

  function top10Header(){
    const panel = top10Panel();
    return panel ? panel.querySelector(".advanced-head") : null;
  }

  function top10Stable(){
    return document.getElementById("ytTopListStable");
  }

  function top10Rows(){
    return document.getElementById("ytTop10StableRows");
  }

  function removeLegacyToggle(){
    const stable = top10Stable();
    if(!stable) return;

    stable.querySelectorAll(".yt-final-toggle, .yt-final-toggle-btn").forEach(el => {
      el.remove();
    });
  }

  function ensureHeader(){
    const header = top10Header();
    if(!header) return null;

    header.id = "ytTop10ClickHeader";
    header.setAttribute("role", "button");
    header.setAttribute("tabindex", "0");

    const strong = header.querySelector("strong");
    if(strong && !strong.querySelector(".yt-top10-hint")){
      strong.insertAdjacentHTML("beforeend", ' <span class="yt-top10-hint">— cliquer pour ouvrir/replier</span>');
    }

    return header;
  }

  function setCollapsed(collapsed){
    const rows = top10Rows();
    const stable = top10Stable();

    if(rows){
      rows.hidden = !!collapsed;
    }else if(stable){
      Array.from(stable.children).forEach(child => {
        child.hidden = !!collapsed;
      });
    }

    const header = ensureHeader();
    if(header){
      header.setAttribute("aria-expanded", collapsed ? "false" : "true");
      header.title = collapsed ? "Cliquer pour ouvrir le Top 10" : "Cliquer pour replier le Top 10";
    }

    try{
      localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    }catch{}
  }

  function isCollapsed(){
    const rows = top10Rows();
    if(rows) return !!rows.hidden;

    try{
      return localStorage.getItem(STORAGE_KEY) === "1";
    }catch{
      return false;
    }
  }

  function toggle(){
    removeLegacyToggle();
    setCollapsed(!isCollapsed());
  }

  function install(){
    removeLegacyToggle();
    const header = ensureHeader();
    if(!header || header.dataset.cleanAccordionBound === "1") return;

    header.dataset.cleanAccordionBound = "1";
    header.addEventListener("click", function(event){
      event.preventDefault();
      event.stopPropagation();
      toggle();
    }, true);

    header.addEventListener("keydown", function(event){
      if(event.key === "Enter" || event.key === " "){
        event.preventDefault();
        event.stopPropagation();
        toggle();
      }
    }, true);

    setCollapsed(isCollapsed());
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", install);
  }else{
    install();
  }

  window.addEventListener("load", install);

  const observer = new MutationObserver(() => {
    removeLegacyToggle();
    ensureHeader();
    setCollapsed(isCollapsed());
    install();
  });

  function observe(){
    const stable = top10Stable();
    if(stable && !stable.dataset.cleanAccordionObserved){
      stable.dataset.cleanAccordionObserved = "1";
      observer.observe(stable, { childList:true, subtree:true });
    }
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", observe);
  }else{
    observe();
  }
  window.addEventListener("load", observe);
})();



