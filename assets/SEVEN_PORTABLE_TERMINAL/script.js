/* Seven Portable Terminal V8.1 — Template Sliced Modules */

const CHATGPT_URL = "https://chatgpt.com/";
const TERMINAL_LINK = "https://blueazur-hub.github.io/erith-ia-memory/assets/SEVEN_PORTABLE_TERMINAL/index.html";

const GROUPS = ["chrome", "menu", "profile", "core", "advanced", "system", "quick", "widgets"];

const AERITH_PROMPT = `Chat, active Aerith-7 Seven Heaven / Full Modules Boost.

Lis d’abord ce fichier RAW :
https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-notion-archive-private/main/core/SEVEN_GATE.md

Et ensuite lis ce fichier RAW :
https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-notion-archive-private/main/core/AERITH_7_FULL_MODULES_BOOST.md

Puis lis ce module complémentaire RAW :
https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-notion-archive-private/main/core/AERITH_7_VIDEO_CARDS_BOOST.md

Active Aerith-7 Seven Heaven comme opératrice de mémoire, production et discernement.

Mode Full Modules Boost intelligent.
Ne charge pas tout en entier.
Choisis uniquement les modules utiles selon la demande.`;

const VIDEO_CARDS_PROMPT = `Chat, active Aerith-7 Seven Heaven — Video Cards Boost Production.

Réponds court :
1. Phase actuelle
2. Risque principal
3. Cartes utiles
4. Action immédiate
5. Point d’arrêt`;

const WAN_PROMPT = `WAN I2V — réglages validés :
width = 1080
height = 1920
frame_rate = 16
length = 81
batch_size = 1

image parfaite d’abord.
une animation = une idée.
caméra stable.
last frame exacte pour continuité LEGO.`;

const BLACKOUT_PROMPT = `Mode Blackout.
Texte uniquement.
Aucun outil image.
Aucune génération image.
Aucune action GitHub automatique.
Réponse courte, directe, opérationnelle.`;

const SUBMENUS = {
  llm: [
    ["ChatGPT", "ouvrir", () => openChatGPTNamed()],
    ["Seven Boost", "prompt", () => startSeven()],
    ["Video Cards", "production", () => copyVideoCards()],
    ["Blackout", "sécurité", () => copyBlackout()],
    ["Lien", "copier", () => copyTerminalLink()]
  ],
  notion: [
    ["ERITH Memory", "mémoire", () => setStatus("Notion Memory prêt.")],
    ["Auto-Agent", "public", () => setStatus("Auto-Agent public.")],
    ["Bloc Notion", "copie", () => copyText(`Seven Portable Terminal V8.1\\n${TERMINAL_LINK}`)]
  ],
  github: [
    ["Repo", "public", () => setStatus("GitHub repo.")],
    ["Terminal", "folder", () => setStatus("assets/SEVEN_PORTABLE_TERMINAL")],
    ["URL", "copier", () => copyTerminalLink()]
  ],
  production: [
    ["Wan", "I2V", () => copyWan()],
    ["Video Cards", "cartes", () => copyVideoCards()],
    ["Blackout", "safe", () => copyBlackout()]
  ],
  settings: [
    ["Full AAA", "tout afficher", () => setPreset("full")],
    ["Clean", "rangé", () => setPreset("clean")],
    ["Focus", "minimal", () => setPreset("focus")],
    ["Save", "défaut", () => saveAppearance()],
    ["Reset", "base", () => resetAppearance()]
  ]
};

let batteryState = { supported:false, level:null, charging:null };

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

function setStatus(msg){
  const el = $("#status");
  if(el) el.textContent = msg;
  console.log("[Seven V8.1]", msg);
}

async function copyText(text){
  try{
    await navigator.clipboard.writeText(text);
    return true;
  }catch{
    window.prompt("Copie ce texte :", text);
    return false;
  }
}

function openChatGPTNamed(){
  const tab = window.open(CHATGPT_URL, "seven_heaven_chatgpt");
  if(tab){ try{ tab.focus(); }catch{} }
  return !!tab;
}

async function startSeven(){
  const opened = openChatGPTNamed();
  await copyText(AERITH_PROMPT);
  setStatus(opened ? "Seven Boost copié · ChatGPT ouvert · Ctrl+V manuel." : "Seven Boost copié · popup bloquée.");
}

async function copyVideoCards(){
  const opened = openChatGPTNamed();
  await copyText(VIDEO_CARDS_PROMPT);
  setStatus(opened ? "Video Cards copié · ChatGPT ouvert · Ctrl+V manuel." : "Video Cards copié · popup bloquée.");
}

async function copyWan(){ await copyText(WAN_PROMPT); setStatus("Wan 1080×1920 copié."); }
async function copyBlackout(){ await copyText(BLACKOUT_PROMPT); setStatus("Mode Blackout copié."); }
async function copyTerminalLink(){ await copyText(TERMINAL_LINK); setStatus("Lien cockpit copié."); }

function openPage(name){ setStatus("Page : " + name + " · hotspots template actifs."); }

function toggleGroup(group, force){
  const cls = "hide-" + group;
  const hide = typeof force === "boolean" ? !force : !document.body.classList.contains(cls);
  document.body.classList.toggle(cls, hide);
  const btn = document.querySelector(`[data-toggle="${group}"]`);
  if(btn) btn.classList.toggle("off", hide);
  saveStateLite();
  setStatus((hide ? "Masqué : " : "Affiché : ") + group);
}

function setPreset(name){
  GROUPS.forEach(g => document.body.classList.remove("hide-" + g));
  if(name === "clean"){
    ["widgets"].forEach(g => document.body.classList.add("hide-" + g));
  }
  if(name === "focus"){
    ["menu", "profile", "advanced", "widgets"].forEach(g => document.body.classList.add("hide-" + g));
  }
  $("#liveMode") && ($("#liveMode").textContent = "Mode : " + name);
  updateToggleButtons();
  saveStateLite();
  setStatus("Preset appliqué : " + name);
}

function updateToggleButtons(){
  GROUPS.forEach(g => {
    const btn = document.querySelector(`[data-toggle="${g}"]`);
    if(btn) btn.classList.toggle("off", document.body.classList.contains("hide-" + g));
  });
}

function toggleOptions(force){
  const panel = $("#optionsPanel");
  if(!panel) return;
  const open = typeof force === "boolean" ? force : !panel.classList.contains("open");
  panel.classList.toggle("open", open);
}

function setModuleOpacity(value){
  document.documentElement.style.setProperty("--module-opacity", String(Number(value)/100));
  saveStateLite();
}

function setStageScale(value){
  document.documentElement.style.setProperty("--stage-scale", String(Number(value)/100));
  saveStateLite();
}

function setBackground(file){
  const bg = `./assets/${file}`;
  const img = $(".stage-bg");
  if(img) img.src = bg;
  localStorage.setItem("seven_v81_bg", file);
  setStatus("Fond : " + file);
}

function saveStateLite(){
  const state = {
    hidden: GROUPS.filter(g => document.body.classList.contains("hide-" + g)),
    opacity: getComputedStyle(document.documentElement).getPropertyValue("--module-opacity").trim(),
    scale: getComputedStyle(document.documentElement).getPropertyValue("--stage-scale").trim(),
    bg: localStorage.getItem("seven_v81_bg") || "sky_castle_background.png"
  };
  localStorage.setItem("seven_v81_state", JSON.stringify(state));
}

function saveAppearance(){
  saveStateLite();
  localStorage.setItem("seven_v81_default", localStorage.getItem("seven_v81_state"));
  setStatus("Apparence par défaut sauvegardée.");
}

function loadAppearance(){
  const raw = localStorage.getItem("seven_v81_default") || localStorage.getItem("seven_v81_state");
  if(!raw){ setStatus("Aucune apparence sauvegardée."); return; }
  applyState(JSON.parse(raw));
  setStatus("Apparence chargée.");
}

function resetAppearance(){
  GROUPS.forEach(g => document.body.classList.remove("hide-" + g));
  document.documentElement.style.setProperty("--module-opacity", ".96");
  document.documentElement.style.setProperty("--stage-scale", "1");
  setBackground("sky_castle_background.png");
  updateToggleButtons();
  saveStateLite();
  setStatus("Apparence reset.");
}

function applyState(state){
  GROUPS.forEach(g => document.body.classList.toggle("hide-" + g, state.hidden?.includes(g)));
  if(state.opacity) document.documentElement.style.setProperty("--module-opacity", state.opacity);
  if(state.scale) document.documentElement.style.setProperty("--stage-scale", state.scale);
  if(state.bg) setBackground(state.bg);
  if($("#opacityRange")) $("#opacityRange").value = Math.round(parseFloat(state.opacity || ".96")*100);
  if($("#scaleRange")) $("#scaleRange").value = Math.round(parseFloat(state.scale || "1")*100);
  updateToggleButtons();
}

function toggleSystemDrawer(force){
  const d = $("#systemDrawer");
  if(!d) return;
  const open = typeof force === "boolean" ? force : !d.classList.contains("open");
  d.classList.toggle("open", open);
  if(open) refreshSystem();
}

function openSubmenu(name){
  const menu = $("#miniSubmenu");
  const title = $("#submenuTitle");
  const grid = $("#submenuGrid");
  const items = SUBMENUS[name] || SUBMENUS.settings;
  if(!menu || !title || !grid) return;
  title.textContent = "Sous-menu · " + name;
  grid.innerHTML = "";
  items.forEach(([label, desc, fn]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.innerHTML = `<strong>${label}</strong><span>${desc}</span>`;
    b.addEventListener("click", fn);
    grid.appendChild(b);
  });
  menu.classList.add("open");
}

function closeSubmenu(){
  $("#miniSubmenu")?.classList.remove("open");
}

async function updateBattery(){
  try{
    if(!navigator.getBattery) throw new Error("no battery api");
    const b = await navigator.getBattery();
    batteryState = { supported:true, level:Math.round(b.level*100), charging:b.charging };
    const change = () => {
      batteryState.level = Math.round(b.level*100);
      batteryState.charging = b.charging;
      refreshSystem();
    };
    b.addEventListener("levelchange", change);
    b.addEventListener("chargingchange", change);
  }catch{
    batteryState = { supported:false, level:null, charging:null };
  }
}

async function fetchIp(){
  try{
    const c = new AbortController();
    setTimeout(() => c.abort(), 2500);
    const r = await fetch("https://api.ipify.org?format=json", { signal:c.signal });
    const d = await r.json();
    localStorage.setItem("seven_v81_ip", d.ip || "non disponible");
  }catch{
    if(!localStorage.getItem("seven_v81_ip")) localStorage.setItem("seven_v81_ip", "non disponible");
  }
}

function getTrace(){
  const now = new Date();
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};
  return {
    ip: localStorage.getItem("seven_v81_ip") || "détection…",
    battery: batteryState.supported ? `${batteryState.level}% · ${batteryState.charging ? "en charge" : "sur batterie"}` : "non disponible",
    os: navigator.platform || "OS inconnu",
    browser: navigator.userAgent.includes("Firefox") ? "Firefox" : navigator.userAgent.includes("Chrome") ? "Chrome" : "Navigateur",
    screen: `${screen.width}×${screen.height} · DPR ${window.devicePixelRatio || 1}`,
    viewport: `${innerWidth}×${innerHeight}`,
    lang: navigator.languages ? navigator.languages.join(", ") : navigator.language,
    cpu: navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} threads` : "non disponible",
    memory: navigator.deviceMemory ? `${navigator.deviceMemory} GB approx.` : "non disponible",
    network: conn.downlink ? `${conn.downlink} Mbps · ${conn.rtt || "n/a"} ms` : "n/a",
    time: now.toLocaleString("fr-FR")
  };
}

function card(icon,label,value,note){
  return `<article class="system-card"><span>${icon}</span><small>${label}</small><strong>${value}</strong><em>${note}</em></article>`;
}

function refreshSystem(){
  const t = getTrace();
  const html = [
    card("🌐","IP publique",t.ip,"détection réseau"),
    card("🔋","Batterie",t.battery,batteryState.supported ? "API batterie" : "API absente"),
    card("💾","Mémoire",t.memory,"navigateur"),
    card("⚙️","CPU",t.cpu,"threads"),
    card("🖥️","Affichage",t.screen,t.viewport),
    card("🌍","Langues",t.lang,"local"),
    card("📡","Réseau",t.network,"connexion"),
    card("🛡️","Safe Trace","Actif","aucun ID sensible")
  ].join("");
  if($("#systemGrid")) $("#systemGrid").innerHTML = html;
  const raw = `SAFE TRACE ${t.time}
IP : ${t.ip}
Batterie : ${t.battery}
Système : ${t.os}
Navigateur : ${t.browser}
Affichage : ${t.screen}
Viewport : ${t.viewport}
Langues : ${t.lang}
CPU : ${t.cpu}
Mémoire : ${t.memory}
Réseau : ${t.network}
Sécurité : aucun RustDesk ID, aucun mot de passe`;
  if($("#systemRaw")) $("#systemRaw").value = raw;
  if($("#liveIp")) $("#liveIp").textContent = "IP : " + t.ip;
  if($("#liveBattery")) $("#liveBattery").textContent = "Batterie : " + t.battery;
}

function boot(){
  const raw = localStorage.getItem("seven_v81_state");
  if(raw){
    try{ applyState(JSON.parse(raw)); }catch{}
  }else{
    setPreset("full");
  }
  updateBattery().then(refreshSystem);
  fetchIp().then(refreshSystem);
  refreshSystem();
  setInterval(refreshSystem, 60000);

  document.addEventListener("keydown", e => {
    if(e.target && ["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName)) return;
    if(e.key === "Escape"){ closeSubmenu(); toggleOptions(false); toggleSystemDrawer(false); }
    if(e.key === "?") toggleOptions();
  });
  setStatus("V8.1 prête · dashboard template découpé en modules.");
}

if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
