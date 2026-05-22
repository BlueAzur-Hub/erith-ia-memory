const pages=document.querySelectorAll(".page");
const navButtons=document.querySelectorAll("[data-page]");
const drawer=document.getElementById("drawer");
const drawerText=document.getElementById("drawerText");
const drawerTitle=document.getElementById("drawerTitle");
const palette=document.getElementById("palette");
const backgrounds=[
  "background_chateau_ciel_source.png",
  "seven_bg_01_citadelle_celeste.png",
  "seven_bg_02_aqueduc_du_ciel.png",
  "seven_bg_03_tour_celeste.png",
  "seven_bg_04_sanctuaire_des_nuages.png",
  "seven_bg_05_archipels_suspendus.png",
  "seven_bg_06_jardin_du_cristal.png",
  "seven_bg_07_coeur_de_pierre.png",
  "seven_bg_08_ponts_ancestraux.png",
  "seven_bg_09_arbre_du_ciel.png",
  "seven_bg_10_terrasse_etoile.png"
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
modules:`Charge uniquement les modules utiles à la demande immédiate.
Ne charge pas tout.
Préserve la DA et l’existant.
Pas d’action outil non demandée.`,
notion:`Seven Portable Terminal
Pupitre Aerith sur Transformer Book
GitHub = mémoire machine
Notion = mémoire humaine
ChatGPT = opérateur temporaire`,
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
5. Utiliser le terminal comme cockpit : ChatGPT, GitHub, Notion, Production, Remote.`,
link:`https://blueazur-hub.github.io/erith-ia-memory/assets/SEVEN_PORTABLE_TERMINAL/index.html`
};
let bgIndex=0;
function currentPage(){const a=document.querySelector(".page.active");return a?a.id.replace("page-",""):"home"}
function saveUiState(){localStorage.setItem("seven.remote.state",JSON.stringify({page:currentPage(),bgIndex,transparent:document.body.classList.contains("transparent"),readable:document.body.classList.contains("readable")}))}
function showPage(name,persist=true){pages.forEach(p=>p.classList.toggle("active",p.id===`page-${name}`));navButtons.forEach(b=>b.classList.toggle("active",b.dataset.page===name));if(persist)saveUiState()}
function applyBackground(){
  const current=backgrounds[bgIndex%backgrounds.length];
  const layer=document.getElementById("backgroundLayer");
  if(!layer) return;
  layer.style.backgroundImage=`linear-gradient(90deg,rgba(0,0,0,.14),rgba(0,0,0,.01),rgba(0,0,0,.16)),linear-gradient(180deg,rgba(0,0,0,.00),rgba(0,0,0,.14)),url("${current}")`;
}")`}
function nextBackground(){bgIndex=(bgIndex+1)%backgrounds.length;applyBackground();saveUiState()}
function randomBackground(){bgIndex=Math.floor(Math.random()*backgrounds.length);applyBackground();saveUiState()}
function renderTrace(){const entries=[["OS",navigator.platform||"n/a","local / safe"],["Navigateur",navigator.userAgent.split(" ").slice(0,4).join(" "),"user agent filtré"],["Viewport",`${window.innerWidth} × ${window.innerHeight}`,"affichage local"],["Fuseau",Intl.DateTimeFormat().resolvedOptions().timeZone||"local","heure locale"],["Langue",navigator.language||"n/a","navigateur"],["Remote","SAFE MODE","no RustDesk ID / no password"]];const html=entries.map(([l,v,n])=>`<article class="trace-card"><small>${l}</small><strong>${v}</strong><em>${n}</em></article>`).join("");const h=document.getElementById("homeTraceGrid");const s=document.getElementById("systemTraceGrid");if(h)h.innerHTML=html;if(s)s.innerHTML=html}
async function copyText(key,title="Bloc copiable"){const text=prompts[key]||key||"";drawerTitle.textContent=title;drawerText.value=text;drawer.classList.add("open");drawerText.select();try{await navigator.clipboard.writeText(text)}catch{document.execCommand("copy")}}
function loadUiState(){try{const saved=JSON.parse(localStorage.getItem("seven.remote.state")||"{}");bgIndex=Number(saved.bgIndex||0);document.body.classList.toggle("transparent",!!saved.transparent);document.body.classList.toggle("readable",!!saved.readable);applyBackground();showPage(saved.page||"home",false)}catch{showPage("home",false)}}
navButtons.forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
document.querySelectorAll("[data-copy]").forEach(b=>b.addEventListener("click",()=>copyText(b.dataset.copy,b.textContent.trim())));
document.querySelectorAll("[data-jump]").forEach(b=>b.addEventListener("click",()=>{showPage(b.dataset.jump);palette.classList.remove("open")}));
document.getElementById("startSevenBtn").addEventListener("click",async()=>{await copyText("seven","Seven Heaven");window.open("https://chatgpt.com/","seven_chatgpt")});
document.getElementById("homeSevenBtn").addEventListener("click",async()=>{await copyText("seven","Seven Heaven");window.open("https://chatgpt.com/","seven_chatgpt")});
document.getElementById("homePromptBtn").addEventListener("click",()=>copyText("seven","Seven Heaven"));
document.getElementById("copyVideoBtn").addEventListener("click",()=>copyText("video","Video Cards"));
document.getElementById("copyBlackoutBtn").addEventListener("click",()=>copyText("blackout","Blackout"));
document.getElementById("copyTerminalLinkBtn").addEventListener("click",()=>copyText("link","Lien terminal"));
document.getElementById("nextBackgroundBtn").addEventListener("click",nextBackground);
document.getElementById("randomBackgroundBtn").addEventListener("click",randomBackground);
document.getElementById("openRustDeskBtn").addEventListener("click",()=>{window.location.href="rustdesk://"});
document.getElementById("toggleTransparentBtn").addEventListener("click",()=>{document.body.classList.toggle("transparent");saveUiState()});
document.getElementById("toggleReadableBtn").addEventListener("click",()=>{document.body.classList.toggle("readable");saveUiState()});
document.getElementById("toggleAdvancedBtn").addEventListener("click",()=>{const p=document.getElementById("advancedPanel");p.hidden=!p.hidden;renderTrace()});
document.getElementById("refreshTraceBtn").addEventListener("click",renderTrace);
document.getElementById("refreshTraceBtnSystem").addEventListener("click",renderTrace);
document.getElementById("closeDrawerBtn").addEventListener("click",()=>drawer.classList.remove("open"));
document.getElementById("openPaletteBtn").addEventListener("click",()=>palette.classList.add("open"));
document.getElementById("closePaletteBtn").addEventListener("click",()=>palette.classList.remove("open"));
document.addEventListener("keydown",e=>{const order=["home","llm","github","production","system"];const i=Number(e.key)-1;if(order[i])showPage(order[i]);if(e.key==="?")palette.classList.add("open");if(e.key==="Escape"){drawer.classList.remove("open");palette.classList.remove("open")}});
window.addEventListener("resize",renderTrace);
loadUiState();applyBackground();renderTrace();
